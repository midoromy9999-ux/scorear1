/**
 * ScoreAR — Extended Arena Modes & 2-Team Duel Registry (Phase 1)
 * Non-destructive decorator around protected `ScoreARGameModes` (`js/engines/quiz-game-modes.js`).
 * - Exposes a 5-mode picker (`SOLO`, `SQUADS`, `CARD_ARENA`, `DUEL_TEAMS` live, `SURVIVAL` Phase-2 preview).
 * - Provides 2-team assignment & direct-sum Duel scoreboard helpers (`🦅 فريق الصقور` vs `🦁 فريق الأسود`).
 */
(function (global) {
  'use strict';

  const DEFAULT_TEAM_NAMES = {
    team_a: 'فريق الصقور',
    team_b: 'فريق الأسود'
  };

  const TEAMS = {
    team_a: {
      id: 'team_a',
      name: DEFAULT_TEAM_NAMES.team_a,
      shortName: 'الصقور',
      emoji: '🦅',
      color: '#0ea5e9',
      accent: '#38bdf8',
      softBg: 'rgba(14, 165, 233, 0.20)',
      border: 'rgba(56, 189, 248, 0.55)',
      glow: 'rgba(14, 165, 233, 0.55)',
      gradient: 'linear-gradient(135deg, #0284c7, #0369a1)'
    },
    team_b: {
      id: 'team_b',
      name: DEFAULT_TEAM_NAMES.team_b,
      shortName: 'الأسود',
      emoji: '🦁',
      color: '#f97316',
      accent: '#fb923c',
      softBg: 'rgba(249, 115, 22, 0.20)',
      border: 'rgba(251, 146, 60, 0.55)',
      glow: 'rgba(249, 115, 22, 0.55)',
      gradient: 'linear-gradient(135deg, #ea580c, #c2410c)'
    }
  };

  const TEAM_ORDER = ['team_a', 'team_b'];

  const MODE_LABELS = {
    SOLO: 'التحدي الفردي',
    SQUADS: 'وضع الفريق',
    CARD_ARENA: 'طور حرب الكروت',
    DUEL_TEAMS: 'التحدي — فريقان 3D',
    SURVIVAL: 'البقاء للأقوى 3D'
  };

  const EXTRA_MODES = {
    DUEL_TEAMS: {
      id: 'DUEL_TEAMS',
      title: 'التحدي — فريقان فقط',
      shortTitle: 'التحدي 3D',
      badge: 'مباشر 3D',
      badgeTone: 'live',
      comingSoon: false,
      category: '3d_arena',
      thumb: 'assets/halls/stadium-hall.jpg',
      icon: '⚔️',
      accent: '#38bdf8',
      description: 'مواجهة مباشرة داخل قاعة 3D بين فريقين يختار المعلم اسميهما اختيارياً — يختار الطالب فريقه من الموبايل وتُجمع النقاط بالمجموع المباشر.',
      features: [
        'تخصيص اختياري لاسمَي الفريقين من المعلم قبل بدء القاعة',
        'قاعة العالم ثلاثية الأبعاد بصفّين متواجهين وشريط شد الحبل التراكمي',
        'عدسة كاميرا ذكية تقفز وتسلّط الكشاف الذهبي على الأسرع عند النتيجة'
      ]
    },
    SURVIVAL: {
      id: 'SURVIVAL',
      title: 'البقاء للأقوى',
      shortTitle: 'البقاء للأقوى',
      badge: 'مباشر 3D 👑',
      badgeTone: 'live',
      comingSoon: false,
      category: '3d_arena',
      thumb: 'assets/halls/royal-hall.jpg',
      icon: '👑',
      accent: '#f59e0b',
      description: 'منافسة إقصاء تدريجية في حلقة 3D: عداد إقصاء ذكي وتصفير الدرجات للباقين بعد كل خروج حتى يتوَّج بطل واحد.',
      features: [
        'عداد إقصاء ذكي يتكيف تلقائياً مع عدد الطلاب والأسئلة',
        'إقصاء مشترك عند التعادل في ذيل الترتيب مع أضواء وداع ومشجعين على الموبايل'
      ]
    }
  };

  const BASE_CARDS = [
    {
      id: 'SOLO',
      title: 'التحدي الفردي',
      badge: 'كلاسيكي',
      badgeTone: 'classic',
      comingSoon: false,
      category: 'classic',
      thumb: 'assets/modes/mode_solo.jpg',
      icon: '⚡',
      accent: '#7c3aed',
      description: 'كل طالب ينافس بذاته لاقتناص المركز الأول بأعلى دقة وسرعة.',
      features: ['نقاط دقة + سرعة + سلسلة انتصارات', 'منصة تتويج 3D لأفضل 3 أبطال']
    },
    {
      id: 'SQUADS',
      title: 'وضع المجموعات',
      badge: 'تعاوني',
      badgeTone: 'classic',
      comingSoon: false,
      category: 'classic',
      thumb: 'assets/modes/mode_squads.jpg',
      icon: '🛡️',
      accent: '#10b981',
      description: 'تقسيم تلقائي إلى فرق صغيرة تتعاون لرفع متوسط نقاطها.',
      features: ['فرق متعددة متوازنة', 'لوحة ترتيب المجموعات والنجوم']
    },
    {
      id: 'CARD_ARENA',
      title: 'حرب الكروت الاستراتيجية',
      badge: 'تكتيكي',
      badgeTone: 'tactic',
      comingSoon: false,
      category: 'tactic',
      thumb: 'assets/modes/mode_cards.jpg',
      icon: '🃏',
      accent: '#ec4899',
      description: 'قوى بطاقات ومضاعفة نقاط ودروع حماية تقلب موازين المنافسة.',
      features: ['بطاقات هجوم ودفاع ومضاعفة', 'مفاجآت تكتيكية بعد كل سؤال']
    }
  ];

  let arenaModeOverride = null;
  let modalFilter = 'all';
  let modalSelectedMode = 'SOLO';
  let modalAiEnabled = false;
  let pendingConfirmCb = null;
  let modalTeamNames = { team_a: DEFAULT_TEAM_NAMES.team_a, team_b: DEFAULT_TEAM_NAMES.team_b };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function applyTeamNamePair(rawA, rawB) {
    const cleanA = String(rawA ?? '').trim().slice(0, 24) || DEFAULT_TEAM_NAMES.team_a;
    const cleanB = String(rawB ?? '').trim().slice(0, 24) || DEFAULT_TEAM_NAMES.team_b;
    TEAMS.team_a.name = cleanA;
    TEAMS.team_a.shortName = cleanA.replace(/^فريق\s+/, '').trim() || cleanA;
    TEAMS.team_b.name = cleanB;
    TEAMS.team_b.shortName = cleanB.replace(/^فريق\s+/, '').trim() || cleanB;
    modalTeamNames = { team_a: cleanA, team_b: cleanB };
    return { team_a: cleanA, team_b: cleanB };
  }

  function getTeamNames() {
    return { team_a: TEAMS.team_a.name, team_b: TEAMS.team_b.name };
  }

  function setCustomTeamNames(nameA, nameB) {
    const pair = applyTeamNamePair(nameA, nameB);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('scorear_duel_team_names', JSON.stringify(pair));
      }
    } catch (_) {}
    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    if (room) room.duelTeamNames = { ...pair };
    global.__scorearDuelTeamNames = { ...pair };
    return pair;
  }

  try {
    const savedNames = typeof localStorage !== 'undefined' ? localStorage.getItem('scorear_duel_team_names') : null;
    if (savedNames) {
      const parsed = JSON.parse(savedNames);
      if (parsed && typeof parsed === 'object') applyTeamNamePair(parsed.team_a, parsed.team_b);
    }
  } catch (_) {}

  function normalizeTeamId(raw) {
    if (!raw) return null;
    const s = String(raw).trim().toLowerCase();
    if (s === 'team_a' || s === 'a' || s === 'falcons' || s === 'falcon' || s === 'الصقور' || s === 'فريق الصقور' || s === TEAMS.team_a.name.toLowerCase()) return 'team_a';
    if (s === 'team_b' || s === 'b' || s === 'lions' || s === 'lion' || s === 'الأسود' || s === 'الاسود' || s === 'فريق الأسود' || s === TEAMS.team_b.name.toLowerCase()) return 'team_b';
    return null;
  }

  function getTeamMeta(teamId) {
    return TEAMS[normalizeTeamId(teamId) || 'team_a'] || TEAMS.team_a;
  }

  function is3DArenaMode(mode) {
    const m = String(mode || getCurrentMode() || '').trim();
    return m === 'DUEL_TEAMS' || m === 'SURVIVAL';
  }

  function isDuelMode(mode) {
    const m = String(mode || getCurrentMode() || '').trim();
    return m === 'DUEL_TEAMS';
  }

  function isSurvivalMode(mode) {
    const m = String(mode || getCurrentMode() || '').trim();
    return m === 'SURVIVAL';
  }

  function getModeLabel(mode) {
    const m = String(mode || getCurrentMode() || 'SOLO').trim();
    return MODE_LABELS[m] || MODE_LABELS.SOLO;
  }

  function assignPlayerTeam(roomOrPlayers, player, preferredTeamId) {
    if (!player) return 'team_a';
    const preferred = normalizeTeamId(preferredTeamId);
    if (preferred) {
      player.teamId = preferred;
      return preferred;
    }
    const existing = normalizeTeamId(player.teamId || player.team);
    if (existing) {
      player.teamId = existing;
      return existing;
    }
    const list = Array.isArray(roomOrPlayers)
      ? roomOrPlayers
      : (roomOrPlayers && Array.isArray(roomOrPlayers.players) ? roomOrPlayers.players : []);
    let countA = 0;
    let countB = 0;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (!p || p === player || (player.id && p.id === player.id)) continue;
      const tid = normalizeTeamId(p.teamId || p.team);
      if (tid === 'team_a') countA++;
      else if (tid === 'team_b') countB++;
    }
    const chosen = countA <= countB ? 'team_a' : 'team_b';
    player.teamId = chosen;
    return chosen;
  }

  function ensureAllTeamsAssigned(roomOrPlayers) {
    const list = Array.isArray(roomOrPlayers)
      ? roomOrPlayers
      : (roomOrPlayers && Array.isArray(roomOrPlayers.players) ? roomOrPlayers.players : []);
    for (let i = 0; i < list.length; i++) {
      assignPlayerTeam(list, list[i], null);
    }
    return list;
  }

  function computeDuelScoreboard(players) {
    const list = Array.isArray(players) ? players : [];
    const teamA = { ...TEAMS.team_a, score: 0, count: 0, members: [], lastGain: 0 };
    const teamB = { ...TEAMS.team_b, score: 0, count: 0, members: [], lastGain: 0 };

    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (!p) continue;
      const tid = normalizeTeamId(p.teamId || p.team) || (i % 2 === 0 ? 'team_a' : 'team_b');
      const target = tid === 'team_b' ? teamB : teamA;
      target.score += Number(p.score) || 0;
      target.lastGain += Number(p.lastPointsGained) || 0;
      target.count += 1;
      target.members.push(p);
    }

    let leaderTeamId = 'tie';
    if (teamA.score > teamB.score) leaderTeamId = 'team_a';
    else if (teamB.score > teamA.score) leaderTeamId = 'team_b';

    const totalScore = teamA.score + teamB.score;
    return {
      team_a: teamA,
      team_b: teamB,
      leaderTeamId,
      diff: Math.abs(teamA.score - teamB.score),
      totalScore,
      ratioA: totalScore > 0 ? Math.round((teamA.score / totalScore) * 100) : 50,
      ratioB: totalScore > 0 ? Math.round((teamB.score / totalScore) * 100) : 50
    };
  }

  function renderDuelScoreHudHtml(scoreboard, opts) {
    const sb = scoreboard || computeDuelScoreboard([]);
    const o = opts || {};
    const compact = Boolean(o.compact);
    const id = o.id || 'hostDuelScoreHud';
    const total = sb.team_a.score + sb.team_b.score;
    const pctA = total > 0 ? Math.max(12, Math.min(88, (sb.team_a.score / total) * 100)) : 50;
    const pctB = 100 - pctA;
    const leaderPill = sb.leaderTeamId === 'tie'
      ? '⚖️ تعادل مشترك'
      : (sb.leaderTeamId === 'team_a' ? `${TEAMS.team_a.emoji} ${esc(sb.team_a.shortName)} يتقدمون بفارق ${sb.diff}` : `${TEAMS.team_b.emoji} ${esc(sb.team_b.shortName)} يتقدمون بفارق ${sb.diff}`);

    return `
      <div id="${id}" style="width:100%;max-width:${compact ? '760px' : '920px'};margin:0 auto;padding:${compact ? '8px 14px' : '10px 18px'};border-radius:18px;background:rgba(10,14,32,0.82);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.14);box-shadow:0 12px 32px rgba(0,0,0,0.45);direction:rtl;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:7px;">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <span style="font-size:${compact ? '18px' : '22px'};filter:drop-shadow(0 2px 6px ${TEAMS.team_a.glow});">🦅</span>
            <div>
              <div style="font-size:${compact ? '12px' : '13px'};font-weight:900;color:#7dd3fc;line-height:1.1;">${esc(TEAMS.team_a.name)} <span style="opacity:0.78;font-size:11px;">(${sb.team_a.count})</span></div>
              <div style="font-size:${compact ? '17px' : '21px'};font-weight:900;color:#fff;font-family:Montserrat,Cairo,sans-serif;line-height:1.1;">${sb.team_a.score.toLocaleString('en-US')}</div>
            </div>
          </div>

          <div style="padding:4px 12px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:#fde68a;font-size:11px;font-weight:900;white-space:nowrap;">
            ${leaderPill}
          </div>

          <div style="display:flex;align-items:center;gap:8px;min-width:0;text-align:left;">
            <div>
              <div style="font-size:${compact ? '12px' : '13px'};font-weight:900;color:#fdba74;line-height:1.1;"><span style="opacity:0.78;font-size:11px;">(${sb.team_b.count})</span> ${esc(TEAMS.team_b.name)}</div>
              <div style="font-size:${compact ? '17px' : '21px'};font-weight:900;color:#fff;font-family:Montserrat,Cairo,sans-serif;line-height:1.1;">${sb.team_b.score.toLocaleString('en-US')}</div>
            </div>
            <span style="font-size:${compact ? '18px' : '22px'};filter:drop-shadow(0 2px 6px ${TEAMS.team_b.glow});">🦁</span>
          </div>
        </div>

        <div style="position:relative;height:10px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,0.08);display:flex;box-shadow:inset 0 2px 5px rgba(0,0,0,0.45);">
          <div style="width:${pctA.toFixed(1)}%;background:linear-gradient(90deg,#38bdf8,#0284c7);transition:width 0.65s cubic-bezier(0.22,1,0.36,1);box-shadow:0 0 12px ${TEAMS.team_a.glow};"></div>
          <div style="width:3px;background:#fff;box-shadow:0 0 8px #fff;z-index:2;flex-shrink:0;"></div>
          <div style="width:${pctB.toFixed(1)}%;background:linear-gradient(90deg,#ea580c,#fb923c);transition:width 0.65s cubic-bezier(0.22,1,0.36,1);box-shadow:0 0 12px ${TEAMS.team_b.glow};"></div>
        </div>
      </div>
    `;
  }

  function renderDuelWinnerBannerHtml(players, opts) {
    const sb = computeDuelScoreboard(players);
    const o = opts || {};
    const id = o.id || 'hostDuelWinnerBanner';
    const isTie = sb.leaderTeamId === 'tie';
    const winner = isTie ? null : TEAMS[sb.leaderTeamId];
    const loser = isTie ? null : TEAMS[sb.leaderTeamId === 'team_a' ? 'team_b' : 'team_a'];
    const winScore = isTie ? sb.team_a.score : sb[winner.id].score;
    const loseScore = isTie ? sb.team_b.score : sb[loser.id].score;
    const bg = isTie
      ? 'linear-gradient(135deg, rgba(14,165,233,0.90), rgba(249,115,22,0.90))'
      : winner.gradient;
    const border = isTie ? 'rgba(253,224,71,0.85)' : winner.border;

    return `
      <div id="${id}" style="position:relative;z-index:45;margin:6px auto;padding:8px 22px;border-radius:999px;background:${bg};border:2px solid ${border};box-shadow:0 12px 34px rgba(0,0,0,0.55),0 0 24px rgba(250,204,21,0.35);display:inline-flex;align-items:center;gap:12px;color:#fff;font-family:Cairo,sans-serif;direction:rtl;max-width:94vw;flex-wrap:wrap;justify-content:center;">
        <span style="font-size:20px;">${isTie ? '⚖️' : '🏆'}</span>
        <span style="font-size:15px;font-weight:900;">${isTie ? 'تعادل بطولي بين الفريقين!' : `الفريق الفائز: ${winner.emoji} ${esc(winner.name)}`}</span>
        <span style="padding:3px 11px;border-radius:999px;background:rgba(9,13,30,0.45);font-size:12.5px;font-weight:900;color:#fef08a;">
          ${isTie ? `${sb.team_a.score} 🦅 — 🦁 ${sb.team_b.score}` : `${winScore.toLocaleString('en-US')} نقطة مقابل ${loseScore.toLocaleString('en-US')} (${loser.emoji})`}
        </span>
      </div>
    `;
  }

  function syncRoomModeToFirebase(pin, mode, aiEnabled) {
    if (!pin) return;
    const teamNames = getTeamNames();
    try {
      const db = (global.ScoreARAuth && global.ScoreARAuth.getDb)
        ? global.ScoreARAuth.getDb()
        : (global.firebase && global.firebase.database ? global.firebase.database() : null);
      if (db) {
        db.ref(`rooms/${pin}/mode`).set(mode).catch(() => {});
        db.ref(`rooms/${pin}/gameMode`).set(mode).catch(() => {});
        if (mode === 'DUEL_TEAMS') {
          db.ref(`rooms/${pin}/duelTeamNames`).set(teamNames).catch(() => {});
        }
      }
    } catch (_) {}
    try {
      if (global.ScoreARRealtime && typeof global.ScoreARRealtime.publish === 'function') {
        const players = global.ScoreARQuizHost?.getPlayers?.() || [];
        const roster = players.map(p => ({
          id: p.id,
          name: p.name,
          score: p.score || 0,
          streak: p.streak || 0,
          avatarId: p.avatarId || 'char_01',
          teamId: p.teamId || null,
          eliminated: Boolean(p.eliminated),
          isBot: Boolean(p.isBot || p.isDemo)
        }));
        global.ScoreARRealtime.publish('ROOM_MODE_UPDATE', {
          pin,
          mode,
          gameMode: mode,
          aiEnabled: Boolean(aiEnabled),
          duelTeamNames: mode === 'DUEL_TEAMS' ? teamNames : null,
          roster
        });
      }
    } catch (_) {}
  }

  function togglePlayerTeam(roomOrPlayerId, maybePlayerId) {
    let room = null;
    let playerId = maybePlayerId;
    if (typeof roomOrPlayerId === 'string' && !maybePlayerId) {
      playerId = roomOrPlayerId;
      room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    } else {
      room = roomOrPlayerId;
    }
    if (!room || !Array.isArray(room.players) || !playerId) return null;
    const player = room.players.find(p => p && p.id === playerId);
    if (!player) return null;
    const current = normalizeTeamId(player.teamId || player.team) || 'team_a';
    player.teamId = current === 'team_a' ? 'team_b' : 'team_a';

    try {
      if (global.ScoreARQuizHost && typeof global.ScoreARQuizHost.refreshLobbyUi === 'function') {
        global.ScoreARQuizHost.refreshLobbyUi();
      }
    } catch (_) {}
    const pin = room.pin || global.ScoreARQuizHost?.getPin?.();
    if (pin) syncRoomModeToFirebase(pin, getCurrentMode(), isCurrentAIEnabled());
    return player.teamId;
  }

  const origGameModes = global.ScoreARGameModes || {};
  let pickerOpts = { worldId: 'royal', pin: '', onConfirm: null, onCancel: null, rawCb: null };

  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('scorear_last_game_mode') : null;
    if (saved === 'DUEL_TEAMS' || saved === 'SURVIVAL') {
      arenaModeOverride = saved;
      global.currentLobbyGameMode = saved;
    }
  } catch (_) {}

  function getCurrentMode() {
    if (arenaModeOverride) return arenaModeOverride;
    if (typeof origGameModes.getMode === 'function') return origGameModes.getMode();
    return global.currentLobbyGameMode || 'SOLO';
  }

  function isCurrentAIEnabled() {
    if (typeof origGameModes.isAIEnabled === 'function') return origGameModes.isAIEnabled();
    return Boolean(global.currentLobbyAIEnabled);
  }

  function updateAllModeDomBadges(mode) {
    const label = getModeLabel(mode);
    const ids = ['hostGameModeBtnText', 'studioModeBadge', 'studioSelectedModeName'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = label;
    });
    const lobbyPill = document.querySelector('.launch-pill');
    if (lobbyPill && document.getElementById('hostCharactersArena')) {
      lobbyPill.innerHTML = `<span class="live-dot"></span> ${label}`;
    }
    try {
      if (global.ScoreARQuizHostView?.updateLobbyModeBadge) {
        global.ScoreARQuizHostView.updateLobbyModeBadge(mode);
      }
    } catch (_) {}
  }

  function persistLocalMode(mode, ai) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('scorear_last_game_mode', mode);
        localStorage.setItem('scorear_last_ai_enabled', String(Boolean(ai)));
      }
    } catch (_) {}
  }

  function setExtendedMode(mode, ai) {
    const m = String(mode || 'SOLO').trim();
    const resolvedAi = ai !== undefined ? Boolean(ai) : isCurrentAIEnabled();

    if (m === 'DUEL_TEAMS' || m === 'SURVIVAL') {
      arenaModeOverride = m;
      global.currentLobbyGameMode = m;
      global.currentLobbyAIEnabled = resolvedAi;
      persistLocalMode(m, resolvedAi);
      const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
      if (room) {
        room.mode = m;
        room.gameMode = m;
        room.aiEnabled = resolvedAi;
        if (m === 'DUEL_TEAMS') {
          room.duelTeamNames = getTeamNames();
          if (Array.isArray(room.players)) ensureAllTeamsAssigned(room.players);
        } else if (m === 'SURVIVAL' && global.ScoreARSurvivalEngine?.initSession) {
          global.ScoreARSurvivalEngine.initSession(room, room._lastTotalQuestions || 5);
        }
      }
      try {
        const mgr = global.ScoreARCardArena?.getManager?.();
        if (mgr?.setGameMode) mgr.setGameMode(m, false, 0);
      } catch (_) {}
      updateAllModeDomBadges(m);
      const pin = pickerOpts.pin || global.ScoreARQuizHost?.getPin?.() || global.currentLobbyPin;
      if (pin) syncRoomModeToFirebase(pin, m, resolvedAi);
      try {
        if (global.ScoreARQuizHost?.refreshLobbyUi) global.ScoreARQuizHost.refreshLobbyUi();
      } catch (_) {}
      try {
        document.dispatchEvent(new CustomEvent('scorear:modeChanged', {
          detail: { mode: m, aiEnabled: resolvedAi }
        }));
      } catch (_) {}
      return m;
    }

    arenaModeOverride = null;
    global.currentLobbyGameMode = m;
    global.currentLobbyAIEnabled = resolvedAi;
    if (typeof origGameModes.setMode === 'function') {
      origGameModes.setMode(m, resolvedAi);
    } else {
      persistLocalMode(m, resolvedAi);
    }
    try {
      const mgr = global.ScoreARCardArena?.getManager?.();
      if (mgr?.setGameMode) mgr.setGameMode(m, false, 0);
    } catch (_) {}
    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    if (room) {
      room.mode = m;
      room.gameMode = m;
      room.aiEnabled = resolvedAi;
    }
    updateAllModeDomBadges(m);
    const pin = pickerOpts.pin || global.ScoreARQuizHost?.getPin?.() || global.currentLobbyPin;
    if (pin) syncRoomModeToFirebase(pin, m, resolvedAi);
    try {
      if (global.ScoreARQuizHost?.refreshLobbyUi) global.ScoreARQuizHost.refreshLobbyUi();
    } catch (_) {}
    try {
      document.dispatchEvent(new CustomEvent('scorear:modeChanged', {
        detail: { mode: m, aiEnabled: resolvedAi }
      }));
    } catch (_) {}
    return m;
  }

  function allPickerCards() {
    return BASE_CARDS.concat([EXTRA_MODES.DUEL_TEAMS, EXTRA_MODES.SURVIVAL]);
  }

  function filterPickerCards(filter) {
    if (!filter || filter === 'all') return allPickerCards();
    return allPickerCards().filter(c => c.category === filter);
  }

  function renderModalContent() {
    const modal = document.getElementById('scorearGameModeModal');
    if (!modal) return;
    const cards = filterPickerCards(modalFilter);
    const filterTabs = [
      { id: 'all', label: 'الكل (5)' },
      { id: '3d_arena', label: 'قاعات 3D الجديدة ✨' },
      { id: 'classic', label: 'الكلاسيكية' },
      { id: 'tactic', label: 'التكتيكية' }
    ];

    modal.innerHTML = `
      <div style="width:100%;max-width:980px;max-height:90vh;overflow-y:auto;border-radius:26px;background:linear-gradient(160deg,#12172f 0%,#090d1e 100%);border:1px solid rgba(255,255,255,0.16);box-shadow:0 28px 80px rgba(0,0,0,0.75);padding:24px;color:#fff;direction:rtl;font-family:Cairo,sans-serif;" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
          <div>
            <div style="font-size:12px;font-weight:800;color:#93c5fd;letter-spacing:0.4px;">ساحة أوضاع المنافسة — ScoreAR Studio</div>
            <h2 style="margin:2px 0 0;font-size:23px;font-weight:900;color:#fff;">اختر نمط المسابقة (${allPickerCards().length} أوضاع)</h2>
          </div>
          <button type="button" id="scorearModeModalCloseBtn" style="width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;font-size:18px;font-weight:900;cursor:pointer;">✕</button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${filterTabs.map(t => {
              const active = modalFilter === t.id;
              return `<button type="button" data-filter="${t.id}" onclick="ScoreARGameModes.setFilter('${t.id}')" style="padding:7px 14px;border-radius:999px;font-family:Cairo,sans-serif;font-size:12px;font-weight:800;cursor:pointer;border:1px solid ${active ? '#38bdf8' : 'rgba(255,255,255,0.14)'};background:${active ? 'rgba(56,189,248,0.22)' : 'rgba(255,255,255,0.05)'};color:${active ? '#e0f2fe' : '#cbd5e1'};">${t.label}</button>`;
            }).join('')}
          </div>

          <button type="button" id="scorearModeAiToggleBtn" onclick="ScoreARGameModes.toggleAiInModal()" style="display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;font-family:Cairo,sans-serif;font-size:12px;font-weight:800;cursor:pointer;border:1px solid ${modalAiEnabled ? 'rgba(52,211,153,0.65)' : 'rgba(255,255,255,0.16)'};background:${modalAiEnabled ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.06)'};color:${modalAiEnabled ? '#6ee7b7' : '#cbd5e1'};">
            <span>🤖 مساعد المعلم الذكي (AI):</span>
            <strong>${modalAiEnabled ? 'مُفعّل' : 'متوقف'}</strong>
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-bottom:20px;">
          ${cards.map(c => {
            const selected = modalSelectedMode === c.id && !c.comingSoon;
            const badgeBg = c.comingSoon
              ? 'rgba(245,158,11,0.22)'
              : (c.badgeTone === 'live' ? 'linear-gradient(135deg,#0284c7,#7c3aed)' : 'rgba(255,255,255,0.14)');
            return `
              <div data-mode-card="${c.id}" onclick="ScoreARGameModes.selectModeInModal('${c.id}')" style="position:relative;border-radius:20px;overflow:hidden;border:2px solid ${selected ? c.accent : 'rgba(255,255,255,0.12)'};background:${selected ? 'rgba(30,41,82,0.92)' : 'rgba(15,23,48,0.78)'};box-shadow:${selected ? `0 0 28px ${c.accent}55` : '0 8px 24px rgba(0,0,0,0.35)'};cursor:${c.comingSoon ? 'not-allowed' : 'pointer'};opacity:${c.comingSoon ? '0.84' : '1'};transition:all 0.2s;display:flex;flex-direction:column;">
                <div style="position:relative;height:112px;overflow:hidden;background:#0a0e1f;">
                  <img src="${c.thumb}" alt="${c.title}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;filter:${c.comingSoon ? 'grayscale(0.35) brightness(0.72)' : 'brightness(0.86)'};">
                  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,28,0.12) 0%,rgba(10,14,32,0.92) 100%);"></div>
                  <div style="position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:999px;background:${badgeBg};border:1px solid rgba(255,255,255,0.22);font-size:11px;font-weight:900;color:${c.comingSoon ? '#fde68a' : '#fff'};">${c.badge}</div>
                  ${selected ? '<div style="position:absolute;top:10px;left:10px;width:28px;height:28px;border-radius:50%;background:#10b981;color:#fff;display:grid;place-items:center;font-weight:900;font-size:15px;">✓</div>' : ''}
                  <div style="position:absolute;bottom:8px;right:12px;display:flex;align-items:center;gap:8px;">
                    <span style="font-size:22px;">${c.icon}</span>
                    <span style="font-size:16px;font-weight:900;color:#fff;">${c.title}</span>
                  </div>
                </div>
                <div style="padding:12px 14px 14px;display:flex;flex-direction:column;gap:8px;flex:1;">
                  <p style="margin:0;font-size:12px;line-height:1.55;color:#cbd5e1;">${c.description}</p>
                  <ul style="margin:0;padding-right:16px;font-size:11px;color:#94a3b8;line-height:1.5;">
                    ${c.features.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${modalSelectedMode === 'DUEL_TEAMS' ? `
          <div id="duelCustomTeamNamesPanel" style="margin-bottom:16px;padding:14px 16px;border-radius:16px;background:rgba(14,165,233,0.10);border:1px solid rgba(56,189,248,0.32);">
            <div style="font-size:13px;font-weight:900;color:#7dd3fc;margin-bottom:8px;">✏️ أسماء الفريقين (اختياري — اتركهما فارغين لاستخدام الأسماء الافتراضية):</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <label style="display:flex;flex-direction:column;gap:4px;">
                <span style="font-size:11.5px;font-weight:800;color:#bae6fd;">🦅 اسم الفريق الأول:</span>
                <input id="duelTeamANameInput" type="text" maxlength="24" value="${esc(modalTeamNames.team_a === DEFAULT_TEAM_NAMES.team_a ? '' : modalTeamNames.team_a)}" placeholder="${DEFAULT_TEAM_NAMES.team_a}" oninput="ScoreARArenaModes._setDraftTeamName('team_a', this.value)" style="padding:8px 12px;border-radius:10px;border:1px solid rgba(56,189,248,0.45);background:rgba(9,13,30,0.85);color:#fff;font-family:Cairo,sans-serif;font-size:13px;font-weight:800;">
              </label>
              <label style="display:flex;flex-direction:column;gap:4px;">
                <span style="font-size:11.5px;font-weight:800;color:#fed7aa;">🦁 اسم الفريق الثاني:</span>
                <input id="duelTeamBNameInput" type="text" maxlength="24" value="${esc(modalTeamNames.team_b === DEFAULT_TEAM_NAMES.team_b ? '' : modalTeamNames.team_b)}" placeholder="${DEFAULT_TEAM_NAMES.team_b}" oninput="ScoreARArenaModes._setDraftTeamName('team_b', this.value)" style="padding:8px 12px;border-radius:10px;border:1px solid rgba(251,146,60,0.45);background:rgba(9,13,30,0.85);color:#fff;font-family:Cairo,sans-serif;font-size:13px;font-weight:800;">
              </label>
            </div>
          </div>
        ` : (modalSelectedMode === 'SURVIVAL' ? `
          <div id="survivalModeInfoStrip" style="margin-bottom:16px;padding:12px 16px;border-radius:16px;background:rgba(245,158,11,0.12);border:1px solid rgba(251,191,36,0.38);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <span style="font-size:13px;font-weight:900;color:#fde68a;">👑 قواعد البقاء للأقوى: عداد إقصاء ذكي حسب عدد الطلاب والأسئلة • خروج المتعادلين في ذيل الترتيب معاً • تصفير النقاط بعد كل خروج!</span>
          </div>
        ` : '')}

        <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;border-top:1px solid rgba(255,255,255,0.10);padding-top:14px;">
          <button type="button" id="scorearModeCancelBtn" style="padding:10px 20px;border-radius:12px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.06);color:#e2e8f0;font-family:Cairo,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">إلغاء</button>
          <button type="button" id="btnConfirmGameMode" onclick="ScoreARGameModes.confirmSelection()" style="padding:10px 26px;border-radius:12px;border:0;background:linear-gradient(135deg,#0284c7,#7c3aed);color:#fff;font-family:Cairo,sans-serif;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 8px 24px rgba(124,58,237,0.45);">اعتماد الوضع: ${getModeLabel(modalSelectedMode)}</button>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('scorearModeModalCloseBtn');
    const cancelBtn = document.getElementById('scorearModeCancelBtn');
    if (closeBtn) closeBtn.onclick = () => closePickerModal(true);
    if (cancelBtn) cancelBtn.onclick = () => closePickerModal(true);
  }

  function _setDraftTeamName(teamKey, val) {
    if (teamKey === 'team_b') modalTeamNames.team_b = String(val ?? '');
    else modalTeamNames.team_a = String(val ?? '');
  }

  function closePickerModal(cancelled) {
    const modal = document.getElementById('scorearGameModeModal');
    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    const cancelCb = cancelled ? pickerOpts.onCancel : null;
    pendingConfirmCb = null;
    pickerOpts = { worldId: 'royal', pin: '', onConfirm: null, onCancel: null, rawCb: null };
    if (typeof cancelCb === 'function') {
      try { cancelCb(); } catch (_) {}
    }
  }

  function openExtendedModePicker(optionsOrCb) {
    const rawFn = typeof optionsOrCb === 'function' ? optionsOrCb : null;
    const opts = (!rawFn && optionsOrCb && typeof optionsOrCb === 'object') ? optionsOrCb : {};
    pickerOpts = {
      worldId: opts.worldId || global.currentLobbyWorldId || 'royal',
      pin: opts.pin || global.ScoreARQuizHost?.getPin?.() || global.currentLobbyPin || '',
      onConfirm: typeof opts.onConfirm === 'function' ? opts.onConfirm : (typeof opts.onSelect === 'function' ? opts.onSelect : null),
      onCancel: typeof opts.onCancel === 'function' ? opts.onCancel : null,
      rawCb: rawFn
    };
    pendingConfirmCb = pickerOpts.onConfirm || pickerOpts.rawCb;

    modalSelectedMode = getCurrentMode() || 'SOLO';
    modalTeamNames = getTeamNames();
    modalAiEnabled = isCurrentAIEnabled();
    modalFilter = 'all';

    if (typeof document === 'undefined') return;
    let overlay = document.getElementById('scorearGameModeModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'scorearGameModeModal';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(4,7,18,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;';
      overlay.onclick = () => closePickerModal(true);
      document.body.appendChild(overlay);
    }
    renderModalContent();
  }

  function setPickerFilter(filter) {
    const raw = String(filter || 'all').toLowerCase();
    const map = { all: 'all', solo: 'classic', teams: 'classic', cards: 'tactic', '3d_arena': '3d_arena', classic: 'classic', tactic: 'tactic' };
    modalFilter = map[raw] || 'all';
    renderModalContent();
  }

  function selectModeInPickerModal(modeId) {
    modalSelectedMode = String(modeId || 'SOLO');
    renderModalContent();
    return true;
  }

  function toggleAiInPickerModal() {
    modalAiEnabled = !modalAiEnabled;
    global.currentLobbyAIEnabled = modalAiEnabled;
    renderModalContent();
    return modalAiEnabled;
  }

  function confirmPickerSelection() {
    if (modalSelectedMode === 'DUEL_TEAMS') {
      const inpA = typeof document !== 'undefined' ? document.getElementById('duelTeamANameInput') : null;
      const inpB = typeof document !== 'undefined' ? document.getElementById('duelTeamBNameInput') : null;
      const rawA = inpA ? inpA.value : modalTeamNames.team_a;
      const rawB = inpB ? inpB.value : modalTeamNames.team_b;
      setCustomTeamNames(rawA, rawB);
    }
    const worldId = pickerOpts.worldId || global.currentLobbyWorldId || 'royal';
    const onConfirm = pickerOpts.onConfirm;
    const rawCb = pickerOpts.rawCb;
    const ai = modalAiEnabled;
    const chosen = setExtendedMode(modalSelectedMode, ai);
    closePickerModal(false);
    if (typeof onConfirm === 'function') {
      try { onConfirm(worldId, chosen, ai); } catch (_) {}
    } else if (typeof rawCb === 'function') {
      try { rawCb(chosen, ai); } catch (_) {}
    }
    return chosen;
  }

  const wrappedGameModes = Object.assign({}, origGameModes, {
    MODES_CONFIG: Object.assign({}, origGameModes.MODES_CONFIG || {}, EXTRA_MODES),
    getMode: getCurrentMode,
    isAIEnabled: isCurrentAIEnabled,
    setMode: setExtendedMode,
    openModePicker: openExtendedModePicker,
    closeModePicker: () => closePickerModal(true),
    setFilter: setPickerFilter,
    selectModeInModal: selectModeInPickerModal,
    toggleAiInModal: toggleAiInPickerModal,
    confirmSelection: confirmPickerSelection
  });

  global.ScoreARGameModes = wrappedGameModes;

  const ArenaModesApi = {
    DEFAULT_TEAM_NAMES,
    TEAMS,
    TEAM_ORDER,
    EXTRA_MODES,
    MODE_LABELS,
    is3DArenaMode,
    isDuelMode,
    isSurvivalMode,
    getModeLabel,
    normalizeTeamId,
    getTeamMeta,
    getTeamNames,
    setCustomTeamNames,
    _setDraftTeamName,
    assignPlayerTeam,
    ensureAllTeamsAssigned,
    togglePlayerTeam,
    computeDuelScoreboard,
    renderDuelScoreHudHtml,
    renderDuelWinnerBannerHtml,
    syncRoomModeToFirebase,
    closePickerModal
  };

  global.ScoreARArenaModes = ArenaModesApi;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArenaModesApi;
  }
})(typeof window !== 'undefined' ? window : globalThis);
