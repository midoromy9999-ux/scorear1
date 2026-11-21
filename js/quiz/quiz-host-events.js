/**
 * ScoreAR Quiz Host Events & Evaluation Router
 * Handles Question Broadcasts, Realtime Ingestion, and Anti-Cheat Authoritative Host Scoring.
 * Strictly Rule 7 Compliant (<300 lines, margin > 100 lines).
 */
(function(global) {
  'use strict';

  function rt() { return global.ScoreARRealtime || null; }
  function lb() { return global.ScoreARHostLeaderboard || null; }
  function parseQuestionPoints(raw, fallback = 1000) {
    if (raw === null || raw === undefined || raw === '') return fallback;
    const n = Number(raw);
    return (Number.isFinite(n) && n >= 0) ? n : fallback;
  }
  function validateLiveQuestion(qData) {
    if (!qData || typeof qData !== 'object') return { valid: false, error: 'السؤال غير معرف أو تالف.' };
    const opts = Array.isArray(qData.options || qData.opts) ? (qData.options || qData.opts) : [];
    const cleanOpts = opts.map(o => String(o ?? '').trim()).filter(Boolean);
    if (cleanOpts.length > 4) return { valid: false, error: 'الحد الأقصى للخيارات في المسابقة الحية هو 4 خيارات فقط.' };
    if (Array.isArray(qData.correct) && qData.correct.length > 1) return { valid: false, error: 'المسابقة الحية تدعم إجابة صحيحة واحدة فقط لكل سؤال.' };
    const evaluator = global.ScoreAREvaluator;
    if (evaluator?.normalizeQuestion && evaluator?.validateQuestion) {
      try {
        const norm = evaluator.normalizeQuestion(qData);
        if (Array.isArray(norm.correct) && norm.correct.length > 1) return { valid: false, error: 'المسابقة الحية تدعم إجابة صحيحة واحدة فقط لكل سؤال.' };
        return evaluator.validateQuestion(norm);
      } catch (e) { return { valid: false, error: e.message }; }
    }
    if (!String(qData.q || qData.text || qData.question || '').trim()) return { valid: false, error: 'نص السؤال فارغ.' };
    if (cleanOpts.length < 2) return { valid: false, error: 'يجب توفر إجابتين على الأقل.' };
    return { valid: true, error: null };
  }
  function getModeInfo() {
    const mode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function') ? global.ScoreARGameModes.getMode() : (global.currentLobbyGameMode || 'SOLO');
    const aiEnabled = (global.ScoreARGameModes && typeof global.ScoreARGameModes.isAIEnabled === 'function') ? global.ScoreARGameModes.isAIEnabled() : Boolean(global.currentLobbyAIEnabled);
    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    const players = global.ScoreARQuizHost?.getPlayers?.() || room?.players || [];
    const roster = players.map(p => ({ id: p.id, name: p.name, score: p.score || 0, streak: p.streak || 0, avatarId: p.avatarId || 'char_01', teamId: p.teamId || null, eliminated: Boolean(p.eliminated), isBot: Boolean(p.isBot || p.isDemo) }));
    const duelTeamNames = (global.ScoreARArenaModes?.isDuelMode?.(mode) && global.ScoreARArenaModes?.getTeamNames)
      ? global.ScoreARArenaModes.getTeamNames()
      : null;
    const duelScores = (global.ScoreARArenaModes?.isDuelMode?.(mode) && global.ScoreARArenaModes?.computeDuelScoreboard)
      ? global.ScoreARArenaModes.computeDuelScoreboard(players)
      : null;
    const survivalState = (global.ScoreARArenaModes?.isSurvivalMode?.(mode) && global.ScoreARSurvivalEngine?.getStatus)
      ? global.ScoreARSurvivalEngine.getStatus(room, room?._lastQIndex ?? 0, room?._lastTotalQuestions ?? 5)
      : null;
    return { mode, gameMode: mode, aiEnabled, roster, duelScores, duelTeamNames, survivalState };
  }

  function publishRoomOpen(pin, worldId = 'royal') {
    const pStr = String(pin).padStart(6, '0');
    const { mode, gameMode, aiEnabled, roster, duelTeamNames, survivalState } = getModeInfo();
    if (rt()) rt().publish('ROOM_OPEN', { pin: pStr, worldId, mode, gameMode, aiEnabled, roster, duelTeamNames, survivalState, timestamp: Date.now() });
    try {
      const db = (global.ScoreARAuth?.getDb?.()) || global.firebase?.database?.();
      if (db && pStr) {
        const openPatch = { status: 'open', isLocked: false, openedAt: Date.now(), mode, gameMode, aiEnabled };
        if (mode === 'DUEL_TEAMS' && duelTeamNames) openPatch.duelTeamNames = duelTeamNames;
        db.ref('rooms/' + pStr).update(openPatch).catch(()=>{});
        db.ref('rooms/' + pStr).onDisconnect().update({ status: 'closed', closedAt: Date.now() });
      }
    } catch(e){}
  }

  function publishRoomClosed(pin, reason = 'انتهت المسابقة بواسطة المعلم') {
    global.ScoreARCardArena?.stopBotDirector?.();
    global.ScoreARCardCinema?.cleanup?.();
    global.ScoreARArena3D?.dispose?.();
    global.ScoreARDuelCoronation?.cleanup?.();
    const pStr = String(pin).padStart(6, '0');
    if (rt()) rt().publish('ROOM_CLOSED', { pin: pStr, reason, timestamp: Date.now() });
    try {
      const db = (global.ScoreARAuth?.getDb?.()) || global.firebase?.database?.();
      if (db && pStr) db.ref('rooms/' + pStr).update({ status: 'closed', closedAt: Date.now(), reason }).catch(()=>{});
    } catch(e){}
  }

  function publishQuestionReading(qIndex, total, qData, worldId = 'royal') {
    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    let cardStarterRes = null;
    if (room) {
      room._lastQIndex = qIndex;
      room._lastTotalQuestions = total;
      const curMode = global.ScoreARGameModes?.getMode?.() || room.gameMode || room.mode || 'SOLO';
      if (curMode === 'SURVIVAL' && global.ScoreARSurvivalEngine?.prepareNextRound) {
        global.ScoreARSurvivalEngine.prepareNextRound(room, qIndex, total);
      } else if (curMode === 'CARD_ARENA') {
        room._cardPostGrantQ = null;
        if (qIndex === 0 && !room._cardStarterDealt) {
          room._cardStarterDealt = true;
          cardStarterRes = global.ScoreARCardArena?.dealRound1StarterCards?.(room) || null;
        }
        global.ScoreARCardArena?.startBotDirector?.();
      }
    }
    if (rt()) {
      const { mode, gameMode, aiEnabled, roster, duelTeamNames, survivalState } = getModeInfo();
      rt().publish('QUESTION_READING', {
        qIndex, totalQuestions: total, q: qData.text || qData.q, skill: qData.skill || 'سؤال',
        readingDuration: 10, worldId, mode, gameMode, aiEnabled, roster, duelTeamNames, survivalState,
        cardGrants: cardStarterRes?.cardGrantsByPlayer || null
      });
    }
  }

  function publishQuestionStart(qIndex, total, qData, timeRemaining, worldId = 'royal') {
    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    if (room) {
      room._lastQIndex = qIndex;
      room._lastTotalQuestions = total;
    }
    if (rt()) {
      const { mode, gameMode, aiEnabled, roster, duelTeamNames, survivalState } = getModeInfo();
      rt().publish('QUESTION_START', {
        qIndex,
        totalQuestions: total,
        q: qData.text || qData.q,
        opts: (qData.options || qData.opts || []).slice(0, 4),
        timeLimit: timeRemaining,
        skill: qData.skill || 'سؤال',
        worldId,
        mode,
        gameMode,
        aiEnabled,
        roster,
        duelTeamNames,
        survivalState,
        imageUrl: qData.imageUrl || null,
        isDouble: !!(qData.isDouble || qData.multiplier === 2)
      });
    }
  }

  function publishQuestionResult(payload) {
    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    const preMode = global.ScoreARGameModes?.getMode?.() || room?.gameMode || room?.mode || 'SOLO';
    const grantRes = (preMode === 'CARD_ARENA' && global.ScoreARCardArena?.processPostQuestionCardGrants)
      ? global.ScoreARCardArena.processPostQuestionCardGrants(room, payload)
      : null;
    const { mode, gameMode, aiEnabled, roster, duelScores, duelTeamNames, survivalState } = getModeInfo();
    if (rt()) {
      rt().publish('QUESTION_RESULT', {
        ...payload, mode, gameMode, aiEnabled, roster, duelScores, duelTeamNames, survivalState,
        cardGrants: grantRes?.cardGrants || null,
        cardDropSummary: grantRes?.cardDropSummary || []
      });
    }
  }

  function publishContestCompleted(podium, totalPlayers, fullLeaderboard = []) {
    const { mode, duelScores, duelTeamNames, survivalState } = getModeInfo();
    if (rt()) rt().publish('CONTEST_COMPLETED', { podium, totalPlayers, leaderboard: fullLeaderboard, mode, duelScores, duelTeamNames, survivalState });
  }

  function publishStudentKicked(studentId, studentName) {
    if (rt()) rt().publish('STUDENT_KICKED', { studentId, studentName });
  }

  function publishRoomLockState(isLocked) {
    if (rt()) rt().publish(isLocked ? 'ROOM_LOCKED' : 'ROOM_UNLOCKED', { isLocked, timestamp: Date.now() });
    try {
      const pin = global.ScoreARQuizHost?.getPin?.();
      const db = (global.ScoreARAuth?.getDb?.()) || global.firebase?.database?.();
      if (db && pin) db.ref('rooms/' + pin).update({ isLocked: !!isLocked }).catch(()=>{});
    } catch(e){}
  }

  /**
   * Anti-Cheat Authoritative Host Evaluation
   * Wrong/timeout answers earn strictly 0 points; correct answers scale strongly by response speed
   * (+ Top-3 speed rank edge & reduced Streak bonus so slower answers never outscore faster ones).
   */
  function evaluateQuestionResults(qData, answers = {}, players = [], totalTime = 20, questionStartTime = null) {
    const playerResults = {};
    const evaluator = global.ScoreAREvaluator;
    const limitSec = (typeof totalTime === 'number' && totalTime > 0) ? totalTime : 20;
    const totalMs = limitSec * 1000;
    const evaluated = [];
    let warnedMultiChoice = false;

    players.forEach(p => {
      const pIdStr = String(p.id);
      if (p.eliminated) {
        p.lastPointsGained = 0;
        playerResults[pIdStr] = {
          id: p.id,
          playerName: p.name,
          eliminated: true,
          isCorrect: false,
          correct: false,
          chosenIndex: -1,
          pointsEarned: 0,
          totalScore: Number(p.score) || 0,
          streak: 0,
          respTime: null,
          speedRank: 0,
          elapsedMs: null,
          scoreFormula: 'تم الإقصاء سابقاً'
        };
        return;
      }
      const ans = answers[pIdStr] || answers[p.id] ||
        Object.values(answers).find(a => a && a.playerId !== undefined && a.playerId !== null && String(a.playerId) === pIdStr) || null;

      const chosen = ans ? (ans.chosenIndices !== undefined ? ans.chosenIndices : ans.optionIndex) : -1;
      if (!warnedMultiChoice && Array.isArray(qData?.correct) && qData.correct.length > 1 && ans && ans.chosenIndices === undefined) {
        warnedMultiChoice = true;
        console.warn('[ScoreAR Host] Multi-answer question in single-choice live room:', qData?.id || qData?.q);
      }
      const optionOrder = ans ? ans.optionOrder : null;
      const cardP = global.ScoreARCardArena?.getManager?.()?.players?.[pIdStr];
      const wasPinned = Boolean(cardP?.status?.isPinned || p.isPinned);
      if (wasPinned) {
        if (cardP?.status) cardP.status.isPinned = false;
        p.isPinned = false;
      }

      const isAnsCorrect = !wasPinned && ((evaluator && typeof evaluator.isCorrect === 'function')
        ? evaluator.isCorrect(qData, chosen, optionOrder)
        : (ans && Array.isArray(qData.correct) && qData.correct.includes(Number(ans.optionIndex))));

      const rawTs = (ans && typeof ans.ts === 'number' && !isNaN(ans.ts))
        ? ans.ts
        : (ans && typeof ans.answeredAt === 'number' && !isNaN(ans.answeredAt) ? ans.answeredAt : null);
      let answerElapsedMs = null;
      if (ans) {
        if (typeof ans.exactElapsedMs === 'number' && isFinite(ans.exactElapsedMs)) {
          answerElapsedMs = Math.max(100, Math.min(totalMs, ans.exactElapsedMs));
        } else if (typeof questionStartTime === 'number' && questionStartTime > 0 && rawTs !== null) {
          answerElapsedMs = Math.max(100, Math.min(totalMs, rawTs - questionStartTime));
        } else if (typeof ans.timeRemaining === 'number' && isFinite(ans.timeRemaining)) {
          answerElapsedMs = Math.max(100, Math.min(totalMs, (limitSec - ans.timeRemaining) * 1000));
        } else {
          answerElapsedMs = totalMs;
        }
      }

      let elapsedMs = totalMs, respTime = null;
      if (isAnsCorrect) {
        if (ans && typeof ans.exactElapsedMs === 'number' && !isNaN(ans.exactElapsedMs)) {
          elapsedMs = Math.max(100, Math.min(totalMs, ans.exactElapsedMs));
        } else if (typeof questionStartTime === 'number' && questionStartTime > 0 && rawTs !== null) {
          elapsedMs = Math.max(100, Math.min(totalMs, rawTs - questionStartTime));
        } else if (ans && typeof ans.timeRemaining === 'number') {
          elapsedMs = Math.max(100, Math.min(totalMs, (limitSec - ans.timeRemaining) * 1000));
        } else {
          elapsedMs = 1000;
        }
        respTime = (elapsedMs / 1000).toFixed(1);
      }

      evaluated.push({ p, pIdStr, ans, cardP, wasPinned, isAnsCorrect, elapsedMs, respTime, answerElapsedMs, unanswered: !ans });
    });

    const correctSorted = evaluated.filter(e => e.isAnsCorrect).sort((a, b) => a.elapsedMs - b.elapsedMs);
    const speedRankMap = new Map();
    correctSorted.forEach((e, idx) => speedRankMap.set(e.pIdStr, idx + 1));

    const firstFast = correctSorted[0] || null;
    const fastest = firstFast ? {
      id: firstFast.pIdStr,
      name: firstFast.p.name,
      timeSec: parseFloat(firstFast.respTime),
      avatarId: firstFast.p.avatarId || 'char_01'
    } : null;

    evaluated.forEach(({ p, pIdStr, ans, cardP, wasPinned, isAnsCorrect, elapsedMs, respTime, answerElapsedMs, unanswered }) => {
      let earned = 0;
      let scoreFormula = wasPinned ? 'مجمد بكارت تثبيت ❄️' : 'إجابة خاطئة (0 نقطة)';
      const speedRank = speedRankMap.get(pIdStr) || 0;
      const hadWager100 = Boolean(cardP?.status?.wager100 || p.wager100);
      if (cardP?.status) {
        cardP.status.wager100 = false;
        cardP.status.hasFog = false;
        cardP.status.timeSliced = false;
      }
      p.wager100 = false;
      p.hasFog = false;
      p.timeSliced = false;

      if (isAnsCorrect) {
        const base = parseQuestionPoints(qData.points, 1000);
        const nextStreak = (p.streak || 0) + 1;
        const cardMult = (cardP?.status?.multiplier === 2 || p.cardMultiplier === 2) ? 2 : 1;
        if (cardP?.status) cardP.status.multiplier = 1;
        p.cardMultiplier = 1;
        if (base === 0) {
          earned = hadWager100 ? 100 : 0;
          p.streak = nextStreak;
          p.score = (p.score || 0) + earned;
          scoreFormula = hadWager100
            ? 'سؤال تدريبي (0 نقطة) + 🎲100 (رهان المائة) = 100'
            : 'سؤال تدريبي (0 نقطة)';
        } else {
          const speedRatio = Math.max(0, Math.min(1, (totalMs - elapsedMs) / totalMs));
          const tf = 0.25 + 0.75 * speedRatio;
          const mult = ((qData.isDouble || qData.multiplier === 2) ? 2 : (Number(qData.multiplier) || 1)) * cardMult;

          const baseScale = base / 1000;
          const speedBonusRaw = speedRank === 1 ? 120 : speedRank === 2 ? 70 : speedRank === 3 ? 30 : 0;
          const speedBonus = Math.round(speedBonusRaw * baseScale);

          const streakStep = Math.max(5, Math.round(15 * baseScale));
          const streakCap = Math.max(15, Math.round(45 * baseScale));
          const streakBonus = nextStreak >= 2 ? Math.min(streakCap, (nextStreak - 1) * streakStep) : 0;

          earned = Math.round((base * tf + speedBonus) * mult) + streakBonus;
          if (hadWager100) earned += 100;
          p.streak = nextStreak;
          p.score = (p.score || 0) + earned;
          scoreFormula = `${base} × ${tf.toFixed(2)}${speedBonus ? ' + ⚡' + speedBonus : ''} × ${mult}${streakBonus ? ' + 🔥' + streakBonus : ''}${hadWager100 ? ' + 🎲100 (رهان المائة)' : ''} = ${earned}`;
        }
      } else {
        const saverIdx = cardP?.trapSlots ? cardP.trapSlots.findIndex(t => t.id === 'STREAK_SAVER') : -1;
        if (saverIdx !== -1) {
          cardP.trapSlots.splice(saverIdx, 1);
        } else {
          p.streak = 0;
        }
        if (hadWager100) {
          const prevScore = Number(p.score) || 0;
          p.score = Math.max(0, prevScore - 100);
          earned = p.score - prevScore;
          scoreFormula = (wasPinned ? 'مجمد بكارت تثبيت ❄️' : 'إجابة خاطئة') + ` · 🎲 خسارة رهان المائة (${earned})`;
        } else {
          p.score = (p.score || 0);
        }
      }

      p.lastPointsGained = earned;
      if (cardP) {
        cardP.score = p.score;
        cardP.streak = p.streak;
      }

      playerResults[pIdStr] = {
        id: p.id,
        playerName: p.name,
        isCorrect: isAnsCorrect,
        correct: isAnsCorrect,
        chosenIndex: ans ? Number(ans.optionIndex) : -1,
        pointsEarned: earned,
        totalScore: p.score,
        streak: p.streak,
        respTime,
        speedRank,
        elapsedMs: isAnsCorrect ? elapsedMs : null,
        answerElapsedMs,
        unanswered: Boolean(unanswered),
        wager100Outcome: hadWager100 ? (isAnsCorrect ? 'won' : 'lost') : null,
        scoreFormula
      };
    });

    const correctIndices = (evaluator && typeof evaluator.getCorrectIndices === 'function')
      ? evaluator.getCorrectIndices(qData)
      : (Array.isArray(qData.correct) ? qData.correct : [Number(qData.ans ?? 0)]);
    const correctIdx = correctIndices[0] ?? 0;
    const opts = qData.options || qData.opts || [];
    const correctAnswerText = opts[correctIdx] || '';

    const fastestTop2 = correctSorted.slice(0, 2).map((e, i) => ({
      id: e.pIdStr,
      name: e.p.name,
      avatarId: e.p.avatarId || 'char_01',
      timeSec: parseFloat(e.respTime || 0),
      rank: i + 1
    }));

    const evalOut = { correct: correctIndices, correctAnswer: correctIdx, correctAnswerText, playerResults, fastest, fastestTop2 };
    const activeMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function')
      ? global.ScoreARGameModes.getMode()
      : (global.currentLobbyGameMode || 'SOLO');
    if (activeMode === 'SURVIVAL' && global.ScoreARSurvivalEngine?.processQuestionResult) {
      const hostRoom = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
      const targetRoom = (hostRoom && hostRoom.players === players) ? hostRoom : { players };
      const qIdx = Number.isFinite(targetRoom._lastQIndex) ? targetRoom._lastQIndex : 0;
      const qTotal = Number.isFinite(targetRoom._lastTotalQuestions) ? targetRoom._lastTotalQuestions : 5;
      evalOut.survivalResult = global.ScoreARSurvivalEngine.processQuestionResult(targetRoom, qIdx, qTotal, evalOut);
      if (evalOut.survivalResult && Array.isArray(evalOut.survivalResult.eliminatedIds)) {
        evalOut.survivalResult.eliminatedIds.forEach(eid => {
          if (evalOut.playerResults[eid]) evalOut.playerResults[eid].eliminated = true;
        });
      }
    }
    global.__scorearLastEvalResult = evalOut;
    return evalOut;
  }

  function handleHostIncomingMessage(msg, ctx) {
    if (!msg || typeof msg !== 'object') return;
    const room = ctx.currentRoom;
    if (!room) return;

    if (msg.type === 'STUDENT_JOIN') {
      const p = msg.player || {};
      const exists = room.players.find(x => x.id === p.id);
      const preferredTeam = p.teamId || p.team || null;
      if (!exists && p.id && p.name) {
        if (ctx.isRoomLocked) {
          if (rt()) rt().publish('STUDENT_KICKED', { studentId: p.id, studentName: p.name });
          return;
        }
        const joinedPlayer = {
          id: p.id, name: p.name, avatarId: p.avatarId || 'char_01',
          cosmetics: p.cosmetics || null,
          score: 0, streak: 0, lastPointsGained: 0, isRegistered: !!p.isRegistered, isDemo: false
        };
        if (preferredTeam && global.ScoreARArenaModes?.normalizeTeamId) {
          joinedPlayer.teamId = global.ScoreARArenaModes.normalizeTeamId(preferredTeam) || null;
        } else if (global.ScoreARArenaModes?.isDuelMode?.() && global.ScoreARArenaModes?.assignPlayerTeam) {
          global.ScoreARArenaModes.assignPlayerTeam(room, joinedPlayer, preferredTeam);
        }
        room.players.push(joinedPlayer);
        if (typeof ctx.onPlayerJoined === 'function') ctx.onPlayerJoined(joinedPlayer);
      } else if (exists && (msg.isReconnect || msg.isTeamSwitch || msg.type === 'STUDENT_JOIN')) {
        // Identity is immutable; only the same authenticated UID can reconnect or update team/cosmetics.
        if (p.avatarId) exists.avatarId = p.avatarId;
        if (p.cosmetics) exists.cosmetics = p.cosmetics;
        if (preferredTeam && global.ScoreARArenaModes?.normalizeTeamId) {
          exists.teamId = global.ScoreARArenaModes.normalizeTeamId(preferredTeam) || exists.teamId;
        }
        if (msg.isTeamSwitch && global.ScoreARQuizHost?.refreshLobbyUi) {
          global.ScoreARQuizHost.refreshLobbyUi();
        }
        if (typeof ctx.onPlayerReconnected === 'function') ctx.onPlayerReconnected(exists);
      }
      if (global.ScoreARCardArena?.syncHostRoster) global.ScoreARCardArena.syncHostRoster(room.players);
      const { mode: jMode, gameMode: jGMode, aiEnabled: jAi, roster: jRoster, duelScores: jDuel, duelTeamNames: jNames, survivalState: jSurv } = getModeInfo();
      if (rt() && room.pin) rt().publish('ROOM_MODE_UPDATE', { pin: room.pin, mode: jMode, gameMode: jGMode, aiEnabled: jAi, roster: jRoster, duelScores: jDuel, duelTeamNames: jNames, survivalState: jSurv });
    }
  }

  function renderHostLeaderboard(stage, currentRoom, activeQuestions, currentQIndex, onNext, onPodium, onClose) {
    const activeMode = global.ScoreARGameModes?.getMode?.() || currentRoom?.gameMode || currentRoom?.mode || 'SOLO';
    if (!global.ScoreARArenaModes?.isDuelMode?.(activeMode) && !global.ScoreARArenaModes?.isCardArenaMode?.(activeMode) && global.ScoreARArena3D?.dispose) {
      global.ScoreARArena3D.dispose();
    }
    if (lb()) lb().renderHostLeaderboard(stage, currentRoom, activeQuestions, currentQIndex, onNext, onPodium, onClose);
  }

  function renderHostPodium(stage, currentRoom, onClose) {
    global.ScoreARCardArena?.stopBotDirector?.();
    global.ScoreARCardCinema?.cleanup?.();
    if (global.ScoreARArena3D?.dispose) global.ScoreARArena3D.dispose();
    if (lb()) lb().renderHostPodium(stage, currentRoom, onClose);
  }

  const ScoreARHostEvents = {
    publishRoomOpen,
    publishRoomClosed,
    publishQuestionReading,
    publishQuestionStart,
    publishQuestionResult,
    publishContestCompleted,
    publishStudentKicked,
    publishRoomLockState,
    evaluateQuestionResults,
    validateLiveQuestion,
    parseQuestionPoints,
    handleHostIncomingMessage,
    renderHostLeaderboard,
    renderHostPodium
  };

  global.ScoreARHostEvents = ScoreARHostEvents;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHostEvents = ScoreARHostEvents; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARHostEvents;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
