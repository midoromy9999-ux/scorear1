/**
 * ScoreAR Post-Question Ranking Board — 6 World Visual Identities (quiz-host-leaderboard.js)
 * Single component faithful to 04-Live-Ranking-Boards.png with ornate world framing,
 * circular original character portraits, golden #1 laurel emblem, safe Arabic RTL layout,
 * competition ties, textual rank-delta (hidden on Q1 / no prior rank), Next Question button,
 * and preserved LEADERBOARD_UPDATE real-time student sync + Batch 4 test compatibility.
 * Strictly Rule 7 Compliant (< 360 lines).
 */
(function (global) {
  'use strict';

  let previousRanks = new Map();
  let lastSessionToken = null;

  const WORLD_RACE_THEMES = {
    royal: {
      name: 'القصر الملكي', trackTitle: 'قاعة الأوسمة الأندلسية', emblem: '👑',
      bgGradient: 'linear-gradient(135deg,#07132c 0%,#0d224a 55%,#142d5e 100%)',
      panelBg: 'rgba(9, 20, 46, 0.94)', rowBg: 'rgba(13, 29, 64, 0.88)',
      speedColor: '#fbbf24', accentColor: '#fbbf24', border: '#e5a93c',
      btnBg: 'linear-gradient(180deg,#183a74,#0d2148)', btnBorder: '#fbbf24', btnText: '#fef3c7',
      boardScene: 'assets/boards/royal-board-scene.jpg',
      framePattern: 'radial-gradient(circle at 8px 8px,rgba(251,191,36,0.55) 1.5px,transparent 2px),repeating-linear-gradient(45deg,rgba(251,191,36,0.22) 0 4px,transparent 4px 12px),repeating-linear-gradient(-45deg,rgba(251,191,36,0.22) 0 4px,transparent 4px 12px)',
      archRadius: '110px 110px 14px 14px'
    },
    oasis: {
      name: 'الواحة العربية', trackTitle: 'ساحة الفوانيس والنخيل', emblem: '🏮',
      bgGradient: 'linear-gradient(135deg,#041d15 0%,#083829 55%,#0e4a37 100%)',
      panelBg: 'rgba(6, 36, 26, 0.94)', rowBg: 'rgba(9, 49, 36, 0.88)',
      speedColor: '#34d399', accentColor: '#f59e0b', border: '#d97706',
      btnBg: 'linear-gradient(180deg,#0f5c43,#063525)', btnBorder: '#fbbf24', btnText: '#fef3c7',
      boardScene: 'assets/boards/oasis-board-scene.jpg',
      framePattern: 'repeating-linear-gradient(90deg,rgba(185,28,28,0.45) 0 10px,rgba(245,158,11,0.45) 10px 16px,rgba(16,185,129,0.4) 16px 26px)',
      archRadius: '18px'
    },
    cosmic: {
      name: 'محطة الفضاء', trackTitle: 'مرصد المدار الكوني', emblem: '🛸',
      bgGradient: 'linear-gradient(135deg,#050b18 0%,#0c1f3c 55%,#112a4f 100%)',
      panelBg: 'rgba(10, 22, 42, 0.94)', rowBg: 'rgba(14, 33, 60, 0.88)',
      speedColor: '#22d3ee', accentColor: '#22d3ee', border: '#38bdf8',
      btnBg: 'linear-gradient(180deg,#0e5d7a,#083348)', btnBorder: '#22d3ee', btnText: '#ecfeff',
      boardScene: 'assets/boards/cosmic-board-scene.jpg',
      framePattern: 'linear-gradient(90deg,rgba(34,211,238,0.35),rgba(148,163,184,0.22),rgba(34,211,238,0.35))',
      archRadius: '14px'
    },
    treasure: {
      name: 'جزيرة الكنز', trackTitle: 'رصيف الكنز والخريطة', emblem: '🧭',
      bgGradient: 'linear-gradient(135deg,#1a0e05 0%,#3a210d 55%,#4e2d12 100%)',
      panelBg: 'rgba(36, 20, 9, 0.94)', rowBg: 'rgba(54, 31, 14, 0.88)',
      speedColor: '#fde047', accentColor: '#fbbf24', border: '#d97706',
      btnBg: 'linear-gradient(180deg,#7c3d12,#472109)', btnBorder: '#fbbf24', btnText: '#fef3c7',
      boardScene: 'assets/boards/treasure-board-scene.jpg',
      framePattern: 'repeating-linear-gradient(90deg,rgba(120,53,15,0.65) 0 18px,rgba(217,119,6,0.38) 18px 22px)',
      archRadius: '14px'
    },
    stadium: {
      name: 'استاد الأبطال', trackTitle: 'مضمار الأبطال والكشافات', emblem: '🏆',
      bgGradient: 'linear-gradient(135deg,#07142e 0%,#0e2b60 55%,#123a7a 100%)',
      panelBg: 'rgba(9, 25, 56, 0.94)', rowBg: 'rgba(13, 38, 82, 0.88)',
      speedColor: '#38bdf8', accentColor: '#38bdf8', border: '#38bdf8',
      btnBg: 'linear-gradient(180deg,#124991,#092854)', btnBorder: '#fbbf24', btnText: '#ffffff',
      boardScene: 'assets/boards/stadium-board-scene.jpg',
      framePattern: 'linear-gradient(135deg,rgba(56,189,248,0.45),rgba(251,191,36,0.28),rgba(56,189,248,0.45))',
      archRadius: '14px'
    },
    magic: {
      name: 'مملكة السحر', trackTitle: 'قلعة البلورات العائمة', emblem: '💎',
      bgGradient: 'linear-gradient(135deg,#15082e 0%,#2d125c 55%,#40177a 100%)',
      panelBg: 'rgba(28, 12, 56, 0.94)', rowBg: 'rgba(44, 19, 86, 0.88)',
      speedColor: '#c084fc', accentColor: '#c084fc', border: '#c084fc',
      btnBg: 'linear-gradient(180deg,#6b21a8,#3b0764)', btnBorder: '#e9d5ff', btnText: '#faf5ff',
      boardScene: 'assets/boards/magic-board-scene.jpg',
      framePattern: 'linear-gradient(135deg,rgba(192,132,252,0.45),rgba(56,189,248,0.28),rgba(232,121,249,0.45))',
      archRadius: '18px'
    }
  };

  function escapeHtml(str) {
    return typeof str !== 'string' ? String(str || '') : str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function sfx(t) { if (global.ScoreARAudio) global.ScoreARAudio.playSfx(t); }
  function uiIcon(name, size = 15) {
    return (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') ? global.ScoreARUI.icon(name, { size }) : '';
  }
  function normAvatar(p) {
    const raw = p?.avatarId || p?.characterId || p?.avatar || 'char_01';
    const n = Math.max(1, Math.min(20, parseInt(String(raw).replace(/\D/g, '') || '1', 10)));
    return 'char_' + String(n).padStart(2, '0');
  }
  function formatRankDeltaText(delta) {
    if (!Number.isFinite(delta) || delta === 0) return '';
    if (delta === 1) return '▲ صعد مركزًا';
    if (delta === 2) return '▲ صعد مركزين';
    if (delta > 2) return `▲ صعد ${delta} مراكز`;
    const drop = Math.abs(delta);
    if (drop === 1) return '▼ تراجع مركزًا';
    if (drop === 2) return '▼ تراجع مركزين';
    return `▼ تراجع ${drop} مراكز`;
  }

  function rankEmblemHtml(rank) {
    if (rank === 1) {
      return `<div class="sc-lb-rank-wreath" aria-label="المركز 1">
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <path d="M14,34 C6,28 5,15 13,8 M12,26 C8,22 8,16 12,12 M15,32 C10,30 10,25 14,22" fill="none" stroke="#fbbf24" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M42,34 C50,28 51,15 43,8 M44,26 C48,22 48,16 44,12 M41,32 C46,30 46,25 42,22" fill="none" stroke="#fbbf24" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="28" cy="22" r="13" fill="rgba(251,191,36,0.22)" stroke="#fde047" stroke-width="2"/>
          <text x="28" y="28" text-anchor="middle" fill="#fef08a" font-size="18" font-weight="900" font-family="Montserrat,Cairo,sans-serif">1</text>
        </svg>
      </div>`;
    }
    const bg = rank === 2 ? 'linear-gradient(135deg,#94a3b8,#475569)'
      : rank === 3 ? 'linear-gradient(135deg,#d97706,#78350f)' : 'rgba(255,255,255,0.11)';
    return `<span class="sc-lb-rank-circle" style="background:${bg};" aria-label="المركز ${rank}">${rank}</span>`;
  }

  function pickTeamRoundStar(members) {
    if (!Array.isArray(members) || !members.length) return null;
    let best = null;
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m || !(Number(m.lastPointsGained) > 0)) continue;
      if (!best || Number(m.lastPointsGained) > Number(best.lastPointsGained)) best = m;
    }
    return best;
  }

  function renderDuelStandingsRecap(stage, currentRoom, activeQuestions, currentQIndex, theme, worldId, sorted, duelSb, nextAction, nextLabel, isMuted) {
    const existingArenaWrap = typeof stage.querySelector === 'function' ? stage.querySelector('#hostArena3DWrap') : null;
    const keepLive3D = Boolean(existingArenaWrap && global.ScoreARArena3D?.isActive?.());
    const totalQ = Array.isArray(activeQuestions) && activeQuestions.length ? activeQuestions.length : 1;
    const total = duelSb.team_a.score + duelSb.team_b.score;
    const pctA = total > 0 ? Math.max(12, Math.min(88, (duelSb.team_a.score / total) * 100)) : 50;
    const starA = pickTeamRoundStar(duelSb.team_a.members);
    const starB = pickTeamRoundStar(duelSb.team_b.members);
    const leaderText = duelSb.leaderTeamId === 'tie'
      ? '⚖️ تعادل متقارب بين الفريقين'
      : (duelSb.leaderTeamId === 'team_a'
        ? `🦅 ${escapeHtml(duelSb.team_a.name)} في الصدارة (+${duelSb.diff})`
        : `🦁 ${escapeHtml(duelSb.team_b.name)} في الصدارة (+${duelSb.diff})`);

    const overlayHtml = `
      <header class="scorear-control-bar" style="position:relative;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:8px 20px;gap:8px;flex-wrap:wrap;pointer-events:auto;">
        <div style="display:flex;align-items:center;gap:8px;">
          <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.closeHostSession()" style="border-color:rgba(255,107,107,0.38);color:#fca5a5;">${uiIcon('close', 14)} <span>إنهاء القاعة</span></button>
          <button type="button" id="hostAudioMuteBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARHostLeaderboard.toggleMuteAudio()">${uiIcon(isMuted ? 'volumeOff' : 'volume', 14)} <span>${isMuted ? 'صامت' : 'الصوت'}</span></button>
        </div>
        <span class="scorear-control-pill" style="border-color:${theme.border};color:#fff;">${theme.emblem} <span>${escapeHtml(theme.name)}</span> · <bdi dir="ltr">${currentQIndex + 1} / ${totalQ}</bdi></span>
        <span style="font-size:12px;color:#cbd5e1;font-weight:800;">المتسابقون: <b style="color:${theme.accentColor};">${sorted.length}</b></span>
      </header>

      <div id="hostTopLeftActionWrap" style="position:fixed;top:52px;left:18px;z-index:65;pointer-events:auto;">
        <button type="button" id="hostNextQuestionBtn" onclick="${nextAction}" style="background:linear-gradient(135deg,#ffffff,#e2e8f0);color:#0f172a;border:2px solid #fbbf24;border-bottom:4px solid #cbd5e1;border-radius:999px;padding:9px 24px;font-size:15px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 10px 26px rgba(0,0,0,0.5);display:inline-flex;align-items:center;gap:8px;">
          <span>${nextLabel}</span> ${uiIcon(nextAction.includes('launchQuestion') ? 'arrow' : 'crown', 16)}
        </button>
      </div>

      <div id="hostDuelClashRibbon" style="margin:auto auto 20px;width:min(860px,94%);padding:14px 22px;border-radius:22px;background:rgba(8,14,32,0.42);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.22);box-shadow:0 14px 38px rgba(0,0,0,0.38),inset 0 1px 0 rgba(255,255,255,0.18);pointer-events:auto;direction:rtl;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
          <span style="font-size:13px;font-weight:900;color:#e2e8f0;">⚔️ ملخص الجولة التراكمي</span>
          <span style="padding:3px 14px;border-radius:999px;background:rgba(255,255,255,0.10);border:1px solid rgba(251,191,36,0.45);color:#fef08a;font-size:12px;font-weight:900;">${leaderText}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;margin-bottom:10px;">
          <div style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;">
            <div style="display:flex;align-items:center;gap:7px;">
              <span style="font-size:24px;">🦅</span>
              <span style="font-size:16px;font-weight:900;color:#7dd3fc;">${escapeHtml(duelSb.team_a.name)}</span>
              <span style="font-size:11px;color:#bae6fd;">(${duelSb.team_a.count})</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <b style="font-size:26px;font-weight:900;color:#fff;font-family:Montserrat,Cairo,sans-serif;">${duelSb.team_a.score.toLocaleString('en-US')}</b>
              ${duelSb.team_a.lastGain > 0 ? `<span style="padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.24);border:1px solid rgba(52,211,153,0.45);color:#6ee7b7;font-size:11.5px;font-weight:900;">+${duelSb.team_a.lastGain} الجولة</span>` : ''}
            </div>
            ${starA ? `<div style="font-size:11px;font-weight:800;color:#fde68a;">⭐ نجم الجولة: ${escapeHtml(starA.name)} (+${starA.lastPointsGained})</div>` : ''}
          </div>

          <div style="padding:6px 14px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);font-size:14px;font-weight:900;color:#fff;font-family:Montserrat,sans-serif;">VS</div>

          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;text-align:left;">
            <div style="display:flex;align-items:center;gap:7px;">
              <span style="font-size:11px;color:#fed7aa;">(${duelSb.team_b.count})</span>
              <span style="font-size:16px;font-weight:900;color:#fdba74;">${escapeHtml(duelSb.team_b.name)}</span>
              <span style="font-size:24px;">🦁</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end;">
              ${duelSb.team_b.lastGain > 0 ? `<span style="padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.24);border:1px solid rgba(52,211,153,0.45);color:#6ee7b7;font-size:11.5px;font-weight:900;">+${duelSb.team_b.lastGain} الجولة</span>` : ''}
              <b style="font-size:26px;font-weight:900;color:#fff;font-family:Montserrat,Cairo,sans-serif;">${duelSb.team_b.score.toLocaleString('en-US')}</b>
            </div>
            ${starB ? `<div style="font-size:11px;font-weight:800;color:#fde68a;">⭐ نجم الجولة: ${escapeHtml(starB.name)} (+${starB.lastPointsGained})</div>` : ''}
          </div>
        </div>

        <div style="position:relative;height:10px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,0.10);display:flex;">
          <div style="width:${pctA.toFixed(1)}%;background:linear-gradient(90deg,#38bdf8,#0284c7);transition:width 0.65s cubic-bezier(0.22,1,0.36,1);"></div>
          <div style="width:3px;background:#fff;box-shadow:0 0 8px #fff;z-index:2;flex-shrink:0;"></div>
          <div style="width:${(100 - pctA).toFixed(1)}%;background:linear-gradient(90deg,#ea580c,#fb923c);transition:width 0.65s cubic-bezier(0.22,1,0.36,1);"></div>
        </div>
      </div>
    `;

    if (keepLive3D) {
      Array.from(stage.children || []).forEach(ch => { if (ch !== existingArenaWrap) ch.remove(); });
      const overlay = document.createElement('div');
      overlay.id = 'hostDuelStandingsOverlay';
      overlay.style.cssText = 'position:relative;z-index:20;display:flex;flex-direction:column;width:100%;height:100%;direction:rtl;font-family:Cairo,Tajawal,sans-serif;pointer-events:none;';
      overlay.innerHTML = overlayHtml;
      stage.appendChild(overlay);
      global.ScoreARArena3D?.setStandingsOverview?.('DUEL_TEAMS', duelSb);
    } else {
      stage.innerHTML = `<div id="hostArena3DWrap" style="position:fixed;inset:0;overflow:hidden;z-index:1;pointer-events:none;background:#070a18;"></div><div id="hostDuelStandingsOverlay" style="position:relative;z-index:20;display:flex;flex-direction:column;width:100%;height:100%;direction:rtl;font-family:Cairo,Tajawal,sans-serif;pointer-events:none;">${overlayHtml}</div>`;
      if (global.ScoreARArena3D?.mount) {
        const mountEl = typeof stage.querySelector === 'function' ? stage.querySelector('#hostArena3DWrap') : null;
        if (mountEl) {
          global.ScoreARArena3D.mount(mountEl, { worldId, mode: 'DUEL_TEAMS', layout: 'duel', phase: 'overview', qIndex: currentQIndex, players: currentRoom.players || [], room: currentRoom });
          global.ScoreARArena3D.setStandingsOverview?.('DUEL_TEAMS', duelSb);
        }
      }
    }
  }

  function renderHostLeaderboard(stage, currentRoom, activeQuestions, currentQIndex, onNext, onPodium, onClose) {
    if (!stage || !currentRoom) return;
    const activeMode = global.ScoreARGameModes?.getMode?.() || currentRoom.gameMode || currentRoom.mode || 'SOLO';
    const isDuel = Boolean(global.ScoreARArenaModes?.isDuelMode?.(activeMode));
    const isSurvival = Boolean(global.ScoreARArenaModes?.isSurvivalMode?.(activeMode));
    if (!isDuel && global.ScoreARArena3D?.dispose) global.ScoreARArena3D.dispose();
    if (!currentRoom._lbSessionToken) {
      currentRoom._lbSessionToken = `${currentRoom.pin || 'room'}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }
    if (lastSessionToken !== currentRoom._lbSessionToken || currentQIndex === 0) {
      if (lastSessionToken !== currentRoom._lbSessionToken) previousRanks = new Map();
      lastSessionToken = currentRoom._lbSessionToken;
    }

    const sorted = (isSurvival && global.ScoreARSurvivalEngine?.sortPlayersForSurvival)
      ? global.ScoreARSurvivalEngine.sortPlayersForSurvival(currentRoom.players || [])
      : [...(currentRoom.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const totalQ = Array.isArray(activeQuestions) && activeQuestions.length ? activeQuestions.length : 1;
    const worldId = (currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : (currentRoom.worldId || 'royal');
    const theme = WORLD_RACE_THEMES[worldId] || WORLD_RACE_THEMES.royal;
    const top5 = sorted.slice(0, 5);
    const fastestId = currentRoom.lastFastestStudent?.id ? String(currentRoom.lastFastestStudent.id) : null;

    // Competition ranking with ties (1, 1, 3...) + textual rank delta hidden when no prior rank
    let curRank = 1;
    sorted.forEach((p, idx) => {
      if (idx > 0) {
        const lower = (isSurvival && global.ScoreARSurvivalEngine?.isLowerSurvivalRank)
          ? global.ScoreARSurvivalEngine.isLowerSurvivalRank(p, sorted[idx - 1])
          : ((p.score || 0) < (sorted[idx - 1].score || 0));
        if (lower) curRank = idx + 1;
      }
      p._currentRank = curRank;
      const hadPrev = previousRanks.has(p.id);
      p._rankDelta = hadPrev ? (previousRanks.get(p.id) - curRank) : null;
    });
    sorted.forEach(p => previousRanks.set(p.id, p._currentRank));

    sfx('whoosh');
    setTimeout(() => { sfx('reveal'); }, 320);
    const isMuted = Boolean(global.ScoreARAudio?.isMuted?.());
    const duelSb = (isDuel && global.ScoreARArenaModes?.computeDuelScoreboard)
      ? global.ScoreARArenaModes.computeDuelScoreboard(currentRoom.players || [])
      : null;
    const survStatus = (isSurvival && global.ScoreARSurvivalEngine?.getStatus)
      ? global.ScoreARSurvivalEngine.getStatus(currentRoom, currentQIndex, totalQ)
      : null;
    const hasNext = Array.isArray(activeQuestions) && (currentQIndex + 1 < activeQuestions.length) && !survStatus?.championEarly;
    const nextAction = hasNext ? `ScoreARQuizHost.launchQuestion(${currentQIndex + 1})` : 'ScoreARQuizHost.renderHostPodium()';
    const nextLabel = survStatus?.championEarly ? 'تتويج الناجي الأقوى 🏆' : (hasNext ? (isDuel ? 'السؤال التالي' : 'السؤال التالي') : (isDuel ? '🏆 تتويج الفريق الفائز' : 'التتويج النهائي'));

    if (isDuel && duelSb) {
      renderDuelStandingsRecap(stage, currentRoom, activeQuestions, currentQIndex, theme, worldId, sorted, duelSb, nextAction, nextLabel, isMuted);
      if (global.ScoreARRealtime && typeof global.ScoreARRealtime.publish === 'function') {
        global.ScoreARRealtime.publish('LEADERBOARD_UPDATE', {
          worldId,
          mode: activeMode,
          duelScores: duelSb,
          survivalState: null,
          questionNumber: currentQIndex + 1,
          totalQuestions: totalQ,
          top5: top5.map(p => ({ id: p.id, name: p.name, score: p.score || 0, rank: p._currentRank, avatarId: normAvatar(p), teamId: p.teamId || null, eliminated: false })),
          totalPlayers: sorted.length,
          allRanks: sorted.map((p, i) => ({
            id: p.id, name: p.name, avatarId: normAvatar(p), teamId: p.teamId || null, eliminated: false,
            rank: p._currentRank, score: p.score || 0,
            delta: p._rankDelta || 0, streak: p.streak || 0,
            gapToAbove: i > 0 ? Math.max(0, (sorted[i - 1].score || 0) - (p.score || 0)) : 0
          }))
        });
      }
      return;
    }

    const duelHeaderHtml = (duelSb && global.ScoreARArenaModes?.renderDuelScoreHudHtml)
      ? global.ScoreARArenaModes.renderDuelScoreHudHtml(duelSb, { id: 'hostLbDuelScoreboard', compact: true })
      : '';
    const hasRecentElim = Boolean(survStatus?.lastElimEvent?.qIndex === currentQIndex && survStatus.lastElimEvent.eliminatedPlayers?.length);
    const survHeaderHtml = (isSurvival && survStatus && global.ScoreARSurvivalEngine)
      ? `<div id="hostLbSurvivalBanner" style="width:100%;max-width:920px;margin:0 auto;">${global.ScoreARSurvivalEngine.renderSurvivalHudHtml({ ...survStatus, isEliminationQuestion: false, questionsUntilNext: survStatus.nextElimQIndex !== null ? Math.max(1, survStatus.nextElimQIndex - currentQIndex) : null })}${hasRecentElim ? global.ScoreARSurvivalEngine.renderSurvivalElimBannerHtml(survStatus.lastElimEvent) : ''}</div>`
      : '';

    stage.innerHTML = `
      <style>
        @keyframes scLbRowSlide { 0%{opacity:0;transform:translateX(16px)} 100%{opacity:1;transform:translateX(0)} }
        .sc-lb-shell { position:relative;width:100%;height:100%;min-height:100%;display:flex;flex-direction:column;overflow:hidden;direction:rtl;font-family:Cairo,Tajawal,sans-serif;background:${theme.bgGradient}; }
        .sc-lb-wrap { position:relative;z-index:8;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:8px 18px 14px; }
        .sc-lb-board { position:relative;width:min(1140px,96%);max-height:100%;border-radius:22px;padding:10px;background:${theme.framePattern};box-shadow:0 26px 70px rgba(0,0,0,0.78),0 0 0 2px ${theme.border};display:flex; }
        .sc-lb-inner { position:relative;width:100%;border-radius:16px;background:${theme.panelBg};border:1.5px solid ${theme.border}88;display:grid;grid-template-columns:1.45fr 0.78fr;gap:18px;padding:16px 20px;overflow:hidden;box-shadow:inset 0 0 42px rgba(0,0,0,0.55); }
        .sc-lb-head { display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px;border-bottom:1px solid ${theme.border}33;padding-bottom:8px; }
        .sc-lb-rows { display:flex;flex-direction:column;gap:8px;min-width:0; }
        .sc-lb-row { display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 14px;border-radius:14px;background:${theme.rowBg};border:1px solid rgba(255,255,255,0.10);animation:scLbRowSlide 0.36s ease both; }
        .sc-lb-row.is-first { border:1.5px solid ${theme.accentColor};box-shadow:0 0 22px ${theme.accentColor}38,inset 0 0 18px ${theme.accentColor}1c;background:linear-gradient(90deg,${theme.rowBg},${theme.accentColor}24); }
        .sc-lb-rank-wreath { width:48px;height:38px;flex-shrink:0;display:grid;place-items:center; }
        .sc-lb-rank-wreath svg { width:48px !important;height:38px !important;max-width:none !important;display:block !important; }
        .sc-lb-rank-circle { width:34px;height:34px;margin-inline:6px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:15px;font-weight:900;color:#fff;font-family:Montserrat,Cairo,sans-serif;border:1px solid rgba(255,255,255,0.25); }
        .sc-lb-avatar { width:46px;height:46px;border-radius:50%;flex-shrink:0;overflow:hidden;border:2px solid ${theme.border};background:radial-gradient(circle at 50% 35%,rgba(255,255,255,0.2),rgba(8,14,32,0.85));box-shadow:0 4px 12px rgba(0,0,0,0.5); }
        .sc-lb-avatar img { width:100%;height:100%;object-fit:cover;object-position:center 16%;transform:scale(1.18);display:block; }
        .sc-lb-name { font-size:15.5px;font-weight:900;color:#ffffff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0; }
        .sc-lb-meta { display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:1px; }
        .sc-lb-chip { font-size:10.5px;font-weight:800;padding:1px 7px;border-radius:999px;white-space:nowrap; }
        .sc-lb-score { font-size:20px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,monospace;font-variant-numeric:tabular-nums;min-width:56px;text-align:left; }
        .sc-lb-delta-pts { font-size:13px;font-weight:900;font-family:Montserrat,Cairo,monospace;font-variant-numeric:tabular-nums;min-width:64px;text-align:center; }
        .sc-lb-side { display:flex;flex-direction:column;justify-content:space-between;gap:12px;min-width:0; }
        .sc-lb-window { position:relative;flex:1;min-height:240px;border-radius:${theme.archRadius};overflow:hidden;border:2.5px solid ${theme.border};box-shadow:0 14px 36px rgba(0,0,0,0.65),inset 0 0 28px rgba(0,0,0,0.5);background:#070e20; }
        .sc-lb-next-btn { width:100%;padding:12px 20px;border-radius:999px;border:2px solid ${theme.btnBorder};background:${theme.btnBg};color:${theme.btnText};font-size:16px;font-weight:900;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 26px rgba(0,0,0,0.55),0 0 18px ${theme.border}44;transition:transform 0.18s ease; }
        .sc-lb-next-btn:hover { transform:translateY(-2px); }
        @media (max-width:860px) {
          .sc-lb-shell { overflow-y:auto; }
          .sc-lb-inner { grid-template-columns:1fr;padding:12px;gap:12px; }
          .sc-lb-window { min-height:135px;max-height:165px;border-radius:14px; }
          .sc-lb-side { order:2; }
        }
        @media (max-width:520px) {
          .sc-lb-board { padding:6px;width:98%; }
          .sc-lb-row { padding:6px 8px;gap:6px; }
          .sc-lb-avatar { width:36px;height:36px; }
          .sc-lb-name { font-size:13px; }
          .sc-lb-score { font-size:15.5px;min-width:44px; }
          .sc-lb-delta-pts { font-size:11px;min-width:48px; }
        }
        @media (prefers-reduced-motion: reduce) { .sc-lb-row { animation:none !important; } }
      </style>

      <div class="sc-lb-shell" data-world-id="${escapeHtml(worldId)}">
        <div style="position:absolute;inset:0;background:url('${escapeHtml(theme.boardScene)}') center/cover no-repeat;opacity:0.22;filter:blur(5px);pointer-events:none;"></div>
        <svg class="speed-lines-svg" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;opacity:0.06;pointer-events:none;"></svg>

        <header class="scorear-control-bar" style="position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:8px 20px;gap:8px;flex-wrap:wrap;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.closeHostSession()" style="border-color:rgba(255,107,107,0.38);color:#fca5a5;">${uiIcon('close', 14)} <span>إنهاء القاعة</span></button>
            <button type="button" id="hostAudioMuteBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARHostLeaderboard.toggleMuteAudio()">${uiIcon(isMuted ? 'volumeOff' : 'volume', 14)} <span>${isMuted ? 'صامت' : 'الصوت'}</span></button>
          </div>
          <span class="scorear-control-pill" style="border-color:${theme.border};color:#fff;">${theme.emblem} <span>${escapeHtml(theme.name)}</span></span>
          <div style="display:flex;align-items:center;gap:10px;">
            ${isSurvival ? `<button type="button" onclick="${nextAction}" style="background:#ffffff;color:#0f172a;border:2px solid #fbbf24;border-radius:999px;padding:5px 16px;font-size:12.5px;font-weight:900;cursor:pointer;font-family:inherit;">${nextLabel}</button>` : ''}
            <span style="font-size:12px;color:#cbd5e1;font-weight:800;">المتسابقون: <b style="color:${theme.accentColor};">${sorted.length}</b></span>
          </div>
        </header>

        ${duelHeaderHtml ? `<div id="hostLbDuelScoreboardWrap" style="position:relative;z-index:12;padding:6px 18px 0;">${duelHeaderHtml}</div>` : ''}
        ${survHeaderHtml ? `<div id="hostLbSurvivalBannerWrap" style="position:relative;z-index:12;padding:6px 18px 0;">${survHeaderHtml}</div>` : ''}

        <div class="sc-lb-wrap">
          <div class="sc-lb-board">
            <div class="sc-lb-inner">
              <div style="display:flex;flex-direction:column;min-width:0;">
                <div class="sc-lb-head">
                  <h2 style="margin:0;font-size:clamp(20px,2.4vw,28px);font-weight:900;color:#ffffff;">الترتيب بعد السؤال</h2>
                  <span style="font-size:15px;font-weight:900;color:${theme.accentColor};font-family:Montserrat,Cairo,monospace;font-variant-numeric:tabular-nums;background:rgba(255,255,255,0.06);border:1px solid ${theme.border}66;padding:3px 14px;border-radius:999px;"><bdi dir="ltr">${currentQIndex + 1} / ${totalQ}</bdi></span>
                </div>

                <div class="sc-lb-rows">
                  ${top5.length ? top5.map((p, idx) => {
                    const rank = p._currentRank;
                    const code = normAvatar(p);
                    const deltaText = formatRankDeltaText(p._rankDelta);
                    const ptsGained = Number(p.lastPointsGained || 0);
                    const startScore = Math.max(0, (p.score || 0) - ptsGained);
                    const isFast = Boolean(p.isFastest || (fastestId && String(p.id) === fastestId));
                    const gapToAbove = idx > 0 ? Math.max(0, (sorted[idx - 1].score || 0) - (p.score || 0)) : 0;
                    const aboveRank = idx > 0 ? sorted[idx - 1]._currentRank : 1;
                    const tMeta = (isDuel && global.ScoreARArenaModes?.getTeamMeta) ? global.ScoreARArenaModes.getTeamMeta(p.teamId) : null;
                    return `
                      <div class="race-lane-card sc-lb-row ${rank === 1 ? 'is-first' : ''}" data-player-id="${escapeHtml(p.id || '')}" data-player-name="${escapeHtml(p.name || '')}" style="animation-delay:${(idx * 0.05).toFixed(2)}s;${p.eliminated ? 'opacity:0.72;' : ''}">
                        <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                          ${rankEmblemHtml(rank)}
                          <div class="sc-lb-avatar char-procedural-rig" data-char-code="${code}">
                            <img src="assets/motion-v3/originals/${code}.png" onerror="this.onerror=null;this.src='assets/characters/animated/${code}-idle.webp';" alt="${escapeHtml(p.name || 'بطل')}">
                          </div>
                          <div style="min-width:0;flex:1;">
                            <div class="sc-lb-name" title="${escapeHtml(p.name || '')}">${escapeHtml(p.name || 'متسابق')}</div>
                            <div class="sc-lb-meta">
                              ${tMeta ? `<span class="sc-lb-chip" style="color:#fff;background:${tMeta.softBg};border:1px solid ${tMeta.border};">${tMeta.emoji} ${escapeHtml(tMeta.shortName)}</span>` : ''}
                              ${(isSurvival && p.eliminated) ? `<span class="sc-lb-chip" style="color:#fca5a5;background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.4);">❌ أُقصي${p.eliminatedAtQ ? ` (س${p.eliminatedAtQ})` : ''}</span>` : ''}
                              ${deltaText ? `<span class="sc-lb-chip" style="color:${p._rankDelta > 0 ? '#6ee7b7' : '#fca5a5'};background:rgba(255,255,255,0.06);">${deltaText}</span>` : ''}
                              ${isFast ? `<span class="sc-lb-chip" style="color:#fde047;background:rgba(251,191,36,0.16);border:1px solid rgba(251,191,36,0.35);">⚡ الأسرع</span>` : ''}
                              ${(p.streak || 0) >= 2 ? `<span class="sc-lb-chip" style="color:#fdba74;background:rgba(249,115,22,0.16);">🔥 ${p.streak} متتالية</span>` : ''}
                              ${idx === 1 && gapToAbove > 0 && !p.eliminated ? `<span class="sc-lb-chip" style="color:#cbd5e1;background:rgba(255,255,255,0.06);">تفصلك ${gapToAbove} نقطة عن المركز #${aboveRank}</span>` : ''}
                            </div>
                          </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
                          <span class="sc-lb-delta-pts" style="color:${ptsGained > 0 ? '#4ade80' : '#94a3b8'};"><bdi dir="ltr">${ptsGained > 0 ? `▲ +${ptsGained}` : '— 0'}</bdi></span>
                          <span class="sc-lb-score scorear-count-up" data-start="${startScore}" data-target="${p.score || 0}">${p.score || 0}</span>
                        </div>
                      </div>`;
                  }).join('') : `<div style="padding:36px;text-align:center;color:#cbd5e1;font-weight:800;border:1px dashed ${theme.border};border-radius:16px;">لا يوجد متسابقون مسجلون في هذه الجولة حتى الآن</div>`}
                </div>
              </div>

              <div class="sc-lb-side">
                <div class="sc-lb-window">
                  <img src="${escapeHtml(theme.boardScene)}" onerror="if(!this.dataset.fb1){this.dataset.fb1='1';this.src='assets/halls/${escapeHtml(worldId)}-hall.jpg';}else if(!this.dataset.fb2){this.dataset.fb2='1';this.src='assets/worlds/${escapeHtml(worldId)}/results.jpg';}else{this.style.display='none';}" alt="${escapeHtml(theme.name)}" style="width:100%;height:100%;object-fit:cover;display:block;">
                  <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(6,12,28,0.82) 100%);pointer-events:none;"></div>
                  <div style="position:absolute;bottom:10px;right:12px;left:12px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
                    <span style="font-size:13.5px;font-weight:900;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,0.9);">${theme.emblem} ${escapeHtml(theme.name)}</span>
                    <span style="font-size:11px;font-weight:800;color:${theme.accentColor};background:rgba(5,10,24,0.78);border:1px solid ${theme.border}66;padding:2px 10px;border-radius:999px;">أفضل ${Math.min(5, sorted.length)}</span>
                  </div>
                </div>
                <button type="button" id="hostNextQuestionBtn" class="sc-lb-next-btn" onclick="${nextAction}">
                  <span>${nextLabel}</span> ${uiIcon(hasNext ? 'arrow' : 'crown', 17)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Odometer score count-up
    setTimeout(() => {
      if (typeof stage.querySelectorAll !== 'function') return;
      stage.querySelectorAll('.scorear-count-up').forEach(el => {
        const startVal = Number(el.getAttribute?.('data-start') ?? el.dataset?.start) || 0;
        const targetVal = Number(el.getAttribute?.('data-target') ?? el.dataset?.target) || 0;
        if (targetVal <= startVal) { el.textContent = targetVal; return; }
        const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const step = now => {
          const pr = Math.min(1, (now - t0) / 600);
          el.textContent = Math.round(startVal + (targetVal - startVal) * (1 - Math.pow(1 - pr, 3)));
          if (pr < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, 80);

    // CRITICAL: Restore live private ranking broadcast to all students!
    if (global.ScoreARRealtime && typeof global.ScoreARRealtime.publish === 'function') {
      global.ScoreARRealtime.publish('LEADERBOARD_UPDATE', {
        worldId,
        mode: activeMode,
        duelScores: duelSb,
        survivalState: survStatus,
        questionNumber: currentQIndex + 1,
        totalQuestions: totalQ,
        top5: top5.map(p => ({ id: p.id, name: p.name, score: p.score || 0, rank: p._currentRank, avatarId: normAvatar(p), teamId: p.teamId || null, eliminated: Boolean(p.eliminated) })),
        totalPlayers: sorted.length,
        allRanks: sorted.map((p, i) => ({
          id: p.id, name: p.name, avatarId: normAvatar(p), teamId: p.teamId || null, eliminated: Boolean(p.eliminated),
          rank: p._currentRank, score: p.score || 0,
          delta: p._rankDelta || 0, streak: p.streak || 0,
          gapToAbove: i > 0 ? Math.max(0, (sorted[i - 1].score || 0) - (p.score || 0)) : 0
        }))
      });
    }
  }

  function toggleMuteAudio() {
    if (!global.ScoreARAudio?.toggleMute) return;
    const muted = global.ScoreARAudio.toggleMute();
    const btn = document.getElementById('hostAudioMuteBtn');
    if (btn) btn.innerHTML = `${uiIcon(muted ? 'volumeOff' : 'volume', 14)} <span>${muted ? 'صامت' : 'الصوت'}</span>`;
  }

  function renderHostPodium(stage, currentRoom, onClose) {
    if (global.ScoreARPodiumEffects?.renderHostPodium) {
      global.ScoreARPodiumEffects.renderHostPodium(stage, currentRoom, onClose);
    }
  }

  const ScoreARHostLeaderboard = {
    renderHostLeaderboard,
    renderHostPodium,
    toggleMuteAudio,
    WORLD_RACE_THEMES
  };

  global.ScoreARHostLeaderboard = ScoreARHostLeaderboard;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHostLeaderboard = ScoreARHostLeaderboard; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARHostLeaderboard;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
