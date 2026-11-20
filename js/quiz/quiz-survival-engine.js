/**
 * ScoreAR — Survival ("البقاء للأقوى") Engine & Smart Elimination Scheduler (Phase 2)
 * Computes adaptive elimination checkpoints based on player count & question count,
 * executes tied last-place dual eliminations, resets alive players' round scores to 0,
 * and ranks finalists/eliminated players cleanly across host, leaderboard, and podiums.
 */
(function (global) {
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function computeEliminationSchedule(totalPlayers, totalQuestions) {
    const pCount = Math.max(0, Number(totalPlayers) || 0);
    const qCount = Math.max(0, Number(totalQuestions) || 0);
    if (pCount <= 2 || qCount <= 1) return [];

    const roundsBeforeFinal = qCount - 1;
    const targetElims = Math.min(pCount - 2, roundsBeforeFinal);
    if (targetElims <= 0) return [];

    const checkpoints = [];
    let prev = -1;
    for (let i = 0; i < targetElims; i++) {
      let idx = Math.floor(((i + 1) * roundsBeforeFinal) / (targetElims + 1));
      const minAllowed = prev + 1;
      const maxAllowed = roundsBeforeFinal - (targetElims - i);
      idx = Math.max(minAllowed, Math.min(maxAllowed, idx));
      checkpoints.push(idx);
      prev = idx;
    }
    return checkpoints;
  }

  function ensureSurvivalStore(room, totalQuestions) {
    if (!room) return null;
    const qTotal = Math.max(1, Number(totalQuestions) || room._lastTotalQuestions || 5);
    const players = Array.isArray(room.players) ? room.players : [];
    const processedEmpty = !room._survival || Object.keys(room._survival.processedQIndices || {}).length === 0;
    if (!room._survival || (processedEmpty && room._survival.initialCount !== players.length && room._survival.totalQuestions === qTotal)) {
      return initSession(room, qTotal);
    }
    return room._survival;
  }

  function initSession(room, totalQuestions) {
    if (!room) return null;
    const qTotal = Math.max(1, Number(totalQuestions) || 5);
    const players = Array.isArray(room.players) ? room.players : [];
    const checkpoints = computeEliminationSchedule(players.length, qTotal);

    players.forEach(p => {
      if (!p) return;
      p.eliminated = false;
      p.eliminatedAtQ = null;
      p.eliminatedOrder = 0;
      p.survivalTotalScore = 0;
    });

    room._survival = {
      totalQuestions: qTotal,
      initialCount: players.length,
      checkpoints,
      deferredToQ: null,
      elimSeq: 0,
      roundNumber: 1,
      resetPending: false,
      lastElimEvent: null,
      processedQIndices: {}
    };
    return room._survival;
  }

  function prepareNextRound(room, qIndex, totalQuestions) {
    if (!room) return getStatus(null, qIndex, totalQuestions);
    const surv = ensureSurvivalStore(room, totalQuestions);
    const qi = Math.max(0, Number(qIndex) || 0);

    if (surv.resetPending && qi > (surv.lastElimEvent?.qIndex ?? -1)) {
      const players = Array.isArray(room.players) ? room.players : [];
      players.forEach(p => {
        if (!p || p.eliminated) return;
        p.score = 0;
        p.lastPointsGained = 0;
        p.streak = 0;
      });
      surv.roundNumber = (surv.roundNumber || 1) + 1;
      surv.resetPending = false;
    }
    return getStatus(room, qi, totalQuestions);
  }

  function getStatus(room, qIndex, totalQuestions) {
    const players = Array.isArray(room?.players) ? room.players : [];
    const alive = players.filter(p => p && !p.eliminated);
    const eliminated = players.filter(p => p && p.eliminated);
    const qi = Math.max(0, Number(qIndex) || 0);
    const surv = room?._survival || null;
    const qTotal = Math.max(1, Number(totalQuestions) || surv?.totalQuestions || 5);
    const cps = surv ? surv.checkpoints : computeEliminationSchedule(players.length, qTotal);

    let nextElimQIndex = null;
    if (alive.length > 2) {
      if (surv?.deferredToQ !== null && surv?.deferredToQ !== undefined && surv.deferredToQ >= qi) {
        nextElimQIndex = surv.deferredToQ;
      } else {
        const found = cps.find(c => c >= qi);
        if (found !== undefined) nextElimQIndex = found;
      }
    }

    const isEliminationQuestion = nextElimQIndex === qi && alive.length > 2;
    const questionsUntilNext = nextElimQIndex === null ? null : (nextElimQIndex - qi);

    return {
      aliveCount: alive.length,
      eliminatedCount: eliminated.length,
      totalCount: players.length,
      eliminatedIds: eliminated.map(p => String(p.id)),
      isEliminationQuestion,
      questionsUntilNext,
      nextElimQIndex,
      roundNumber: surv?.roundNumber || 1,
      resetPending: Boolean(surv?.resetPending),
      championEarly: alive.length <= 1 && players.length > 1,
      lastElimEvent: plainElimSummary(surv?.lastElimEvent),
      checkpoints: cps
    };
  }

  function plainElimSummary(ev) {
    if (!ev) return null;
    return {
      qIndex: ev.qIndex,
      questionNumber: ev.questionNumber,
      eliminatedPlayers: Array.isArray(ev.eliminatedPlayers) ? ev.eliminatedPlayers : [],
      eliminatedIds: Array.isArray(ev.eliminatedIds) ? ev.eliminatedIds : [],
      remainingAliveCount: ev.remainingAliveCount,
      championEarly: Boolean(ev.championEarly),
      resetPending: Boolean(ev.resetPending)
    };
  }

  function getAnswerElapsedMs(res) {
    if (!res) return 999999;
    if (Number.isFinite(Number(res.answerElapsedMs))) return Number(res.answerElapsedMs);
    if (Number.isFinite(Number(res.elapsedMs))) return Number(res.elapsedMs);
    return 999999;
  }

  function processQuestionResult(room, qIndex, totalQuestions, evalResult) {
    if (!room || !Array.isArray(room.players)) return null;
    const surv = ensureSurvivalStore(room, totalQuestions);
    const qi = Math.max(0, Number(qIndex) || 0);

    if (surv.processedQIndices[qi]) {
      return surv.processedQIndices[qi];
    }

    const alive = room.players.filter(p => p && !p.eliminated);
    alive.forEach(p => {
      p.survivalTotalScore = (Number(p.survivalTotalScore) || 0) + (Number(p.lastPointsGained) || 0);
    });

    const isScheduled = surv.checkpoints.includes(qi) || surv.deferredToQ === qi;
    if (!isScheduled || alive.length <= 2) {
      if (surv.deferredToQ === qi) surv.deferredToQ = null;
      const res = {
        qIndex: qi,
        questionNumber: qi + 1,
        deferred: false,
        eliminatedPlayers: [],
        eliminatedIds: [],
        remainingAliveCount: alive.length,
        championEarly: alive.length <= 1 && room.players.length > 1,
        resetPending: false,
        status: getStatus(room, qi, surv.totalQuestions)
      };
      surv.processedQIndices[qi] = res;
      return res;
    }

    surv.deferredToQ = null;
    const qTotal = Math.max(1, Number(totalQuestions) || surv.totalQuestions || 5);
    const results = evalResult?.playerResults || {};

    const unanswered = [];
    const answered = [];
    alive.forEach(p => {
      const r = results[String(p.id)] || null;
      const isUnanswered = !r || r.unanswered === true || r.chosenIndex === undefined || r.chosenIndex === -1;
      if (isUnanswered) unanswered.push({ p, r });
      else answered.push({ p, r });
    });

    if (answered.length === 0) {
      if (qi + 1 < qTotal - 1) surv.deferredToQ = qi + 1;
      const deferredRes = {
        qIndex: qi,
        questionNumber: qi + 1,
        deferred: true,
        eliminatedPlayers: [],
        eliminatedIds: [],
        remainingAliveCount: alive.length,
        championEarly: false,
        resetPending: false,
        status: getStatus(room, qi, qTotal)
      };
      surv.processedQIndices[qi] = deferredRes;
      return deferredRes;
    }

    // Worst-first: lowest score -> wrong before right -> slowest response time
    answered.sort((a, b) => {
      const scoreDiff = (Number(a.p.score) || 0) - (Number(b.p.score) || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const aCorrect = Boolean(a.r?.isCorrect ?? a.r?.correct) ? 1 : 0;
      const bCorrect = Boolean(b.r?.isCorrect ?? b.r?.correct) ? 1 : 0;
      if (aCorrect !== bCorrect) return aCorrect - bCorrect;
      return getAnswerElapsedMs(b.r) - getAnswerElapsedMs(a.r);
    });

    const remCps = Math.max(1, surv.checkpoints.filter(c => c >= qi).length);
    const answeredQuota = Math.min(3, Math.max(1, Math.ceil(Math.max(1, alive.length - 2) / remCps)));
    const maxFromAnswered = Math.max(0, answered.length - 2);
    const pickedAnswered = answered.slice(0, Math.min(answeredQuota, maxFromAnswered));

    const victimRecords = unanswered
      .map(item => ({ p: item.p, r: item.r, reason: 'unanswered' }))
      .concat(pickedAnswered.map(item => ({ p: item.p, r: item.r, reason: 'slowest' })));

    if (!victimRecords.length) {
      if (qi + 1 < qTotal - 1) surv.deferredToQ = qi + 1;
      const deferredRes = {
        qIndex: qi,
        questionNumber: qi + 1,
        deferred: true,
        eliminatedPlayers: [],
        eliminatedIds: [],
        remainingAliveCount: alive.length,
        championEarly: false,
        resetPending: false,
        status: getStatus(room, qi, qTotal)
      };
      surv.processedQIndices[qi] = deferredRes;
      return deferredRes;
    }

    surv.elimSeq = (surv.elimSeq || 0) + 1;
    victimRecords.forEach(({ p, reason }) => {
      p.eliminated = true;
      p.eliminatedAtQ = qi + 1;
      p.eliminatedOrder = surv.elimSeq;
      p.elimReason = reason;
      p.streak = 0;
    });
    surv.resetPending = true;

    const remainingAlive = room.players.filter(p => p && !p.eliminated);
    const elimEvent = {
      qIndex: qi,
      questionNumber: qi + 1,
      deferred: false,
      eliminatedPlayers: victimRecords.map(({ p, r, reason }) => ({
        id: String(p.id),
        name: p.name,
        avatarId: p.avatarId || 'char_01',
        score: Number(p.score) || 0,
        eliminatedAtQ: p.eliminatedAtQ,
        reason,
        answerElapsedMs: reason === 'unanswered' ? null : getAnswerElapsedMs(r)
      })),
      eliminatedIds: victimRecords.map(({ p }) => String(p.id)),
      remainingAliveCount: remainingAlive.length,
      championEarly: remainingAlive.length <= 1 && room.players.length > 1,
      resetPending: true
    };
    surv.lastElimEvent = plainElimSummary(elimEvent);
    elimEvent.status = getStatus(room, qi, surv.totalQuestions);
    surv.processedQIndices[qi] = plainElimSummary(elimEvent);
    return elimEvent;
  }

  function sortPlayersForSurvival(players) {
    return [...(Array.isArray(players) ? players : [])].filter(Boolean).sort((a, b) => {
      const aElim = Boolean(a.eliminated);
      const bElim = Boolean(b.eliminated);
      if (aElim !== bElim) return aElim ? 1 : -1;
      if (!aElim) {
        return ((Number(b.score) || 0) - (Number(a.score) || 0))
          || ((Number(b.survivalTotalScore) || 0) - (Number(a.survivalTotalScore) || 0));
      }
      return ((Number(b.eliminatedOrder) || 0) - (Number(a.eliminatedOrder) || 0))
        || ((Number(b.survivalTotalScore) || 0) - (Number(a.survivalTotalScore) || 0));
    });
  }

  function isLowerSurvivalRank(p, prev) {
    if (!p || !prev) return false;
    const pElim = Boolean(p.eliminated);
    const prevElim = Boolean(prev.eliminated);
    if (pElim !== prevElim) return true;
    if (!pElim) {
      return (Number(p.score) || 0) < (Number(prev.score) || 0);
    }
    const pOrd = Number(p.eliminatedOrder) || 0;
    const prevOrd = Number(prev.eliminatedOrder) || 0;
    if (pOrd < prevOrd) return true;
    if (pOrd === prevOrd) {
      return (Number(p.survivalTotalScore) || 0) < (Number(prev.survivalTotalScore) || 0);
    }
    return false;
  }

  function renderSurvivalHudHtml(status) {
    const s = status || {};
    let nextBadge = '';
    if (s.aliveCount <= 2) {
      nextBadge = '<span style="color:#fde047;">⚔️ المواجهة النهائية — البقاء للأقوى!</span>';
    } else if (s.isEliminationQuestion) {
      nextBadge = '<span style="color:#fca5a5;">🔥 سؤال إقصاء حاسم الآن!</span>';
    } else if (Number.isFinite(s.questionsUntilNext)) {
      nextBadge = `<span style="color:#fcd34d;">⏳ الإقصاء القادم بعد ${s.questionsUntilNext} ${s.questionsUntilNext === 1 ? 'سؤال' : 'أسئلة'}</span>`;
    } else {
      nextBadge = '<span style="color:#93c5fd;">🛡️ المرحلة الحاسمة</span>';
    }

    return `
      <div id="hostSurvivalHud" style="width:100%;max-width:680px;margin:0 auto;padding:5px 16px;border-radius:999px;background:rgba(8,12,26,0.42);backdrop-filter:blur(10px);border:1px solid ${s.isEliminationQuestion ? 'rgba(248,113,113,0.58)' : 'rgba(251,191,36,0.36)'};box-shadow:0 8px 24px rgba(0,0,0,0.30);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;direction:rtl;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:15px;">👑</span>
          <span style="font-size:12.5px;font-weight:900;color:#fff;">الجولة ${s.roundNumber || 1}</span>
          <span style="padding:2px 10px;border-radius:999px;background:rgba(16,185,129,0.22);border:1px solid rgba(52,211,153,0.45);color:#6ee7b7;font-size:11.5px;font-weight:900;">الباقون: ${s.aliveCount || 0} / ${s.totalCount || 0}</span>
        </div>
        <div style="font-size:12px;font-weight:900;">${nextBadge}</div>
      </div>
    `;
  }

  function renderSurvivalElimBannerHtml(elimEvent) {
    if (!elimEvent || !Array.isArray(elimEvent.eliminatedPlayers) || !elimEvent.eliminatedPlayers.length) return '';
    const list = elimEvent.eliminatedPlayers;
    const shown = list.slice(0, 4);
    const extraCount = list.length - shown.length;
    const chipsHtml = shown.map(p => {
      const icon = p.reason === 'unanswered' ? '⏱' : '❌';
      return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:999px;background:rgba(255,255,255,0.12);border:1px solid rgba(254,202,202,0.4);color:#fef08a;font-size:12px;font-weight:900;white-space:nowrap;">${icon} ${esc(p.name)}</span>`;
    }).join('');
    const moreChip = extraCount > 0
      ? `<span style="display:inline-flex;align-items:center;padding:2px 9px;border-radius:999px;background:rgba(239,68,68,0.38);border:1px solid rgba(252,165,165,0.5);color:#fff;font-size:11.5px;font-weight:900;white-space:nowrap;">+${extraCount} آخرين</span>`
      : '';

    return `
      <div id="hostSurvivalElimBanner" style="width:100%;max-width:780px;margin:6px auto 0;padding:7px 14px;border-radius:14px;background:linear-gradient(135deg,rgba(127,29,29,0.58),rgba(49,16,74,0.52));backdrop-filter:blur(10px);border:1px solid rgba(252,165,165,0.55);box-shadow:0 10px 26px rgba(0,0,0,0.4);color:#fff;text-align:center;direction:rtl;">
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;">
          <span style="font-size:12.5px;font-weight:900;color:#fecaca;">غادر (${list.length}):</span>
          ${chipsHtml}
          ${moreChip}
        </div>
        <div style="font-size:11px;font-weight:800;color:#fde68a;margin-top:3px;">
          ${elimEvent.championEarly ? '🏆 تبقّى بطل واحد فقط — إلى منصة التتويج!' : `🔄 تصفير الدرجات (0) للباقين (${elimEvent.remainingAliveCount}) في الجولة القادمة!`}
        </div>
      </div>
    `;
  }

  function renderSurvivalWinnerBannerHtml(players) {
    const sorted = sortPlayersForSurvival(players);
    const champ = sorted[0];
    if (!champ) return '';
    return `
      <div id="hostSurvivalWinnerBanner" style="position:relative;z-index:45;margin:6px auto;padding:8px 22px;border-radius:999px;background:linear-gradient(135deg,#d97706,#7c3aed);border:2px solid #fde047;box-shadow:0 12px 34px rgba(0,0,0,0.55),0 0 24px rgba(250,204,21,0.4);display:inline-flex;align-items:center;gap:10px;color:#fff;font-family:Cairo,sans-serif;direction:rtl;max-width:94vw;flex-wrap:wrap;justify-content:center;">
        <span style="font-size:20px;">👑</span>
        <span style="font-size:15px;font-weight:900;">الناجي الأقوى: ${esc(champ.name)}</span>
        <span style="padding:3px 11px;border-radius:999px;background:rgba(9,13,30,0.45);font-size:12px;font-weight:900;color:#fde68a;">إجمالي المسابقة: ${Number(champ.survivalTotalScore ?? champ.score ?? 0)} نقطة</span>
      </div>
    `;
  }

  const Api = {
    computeEliminationSchedule,
    initSession,
    prepareNextRound,
    getStatus,
    processQuestionResult,
    sortPlayersForSurvival,
    isLowerSurvivalRank,
    renderSurvivalHudHtml,
    renderSurvivalElimBannerHtml,
    renderSurvivalWinnerBannerHtml
  };

  global.ScoreARSurvivalEngine = Api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
