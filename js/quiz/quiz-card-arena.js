/**
 * ScoreAR Real-Time Card Arena Controller (Authoritative Multi-Device Sync & 3D Cinema Director)
 * Fixes 50/50 race, ±100 Next-Question Wager, Hand/Pool Desync, Exact Trap Removal, Sub Leak,
 * and powers Round-1 Starter Deals, Top-2 + Streak-2 Grants & Smart Bot Card Director.
 */
(function (global) {
  'use strict';

  let manager = null;
  let activePin = null;
  let currentStudentId = null;
  let isHostRole = false;
  let isDeckOpen = true;
  let unsubRealtime = null;
  let botDirectorTimer = null;
  let lastAuthoritativeGrantQ = null;

  const recentGrantsMap = new Map();
  const pendingEffects = { pin: false, fog: false, timeSlicer: false, eraser: false, eraserApplied: false, wrongIndices: null };

  const CATEGORY_BORDERS = {
    GAME_CHANGER: '#fbbf24',
    ATTACK: '#ef4444',
    DEFENSE: '#38bdf8',
    BOOST: '#10b981'
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  function sfx(t) { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(t); }

  function pickUnclaimedNonLuckKey(mgr) {
    const db = global.CARDS_DATABASE || {};
    const nonLuck = Object.keys(db).filter(k => k !== 'BETTER_LUCK');
    if (!nonLuck.length) return null;
    let avail = nonLuck.filter(k => !mgr.claimedCards.has(k));
    if (avail.length <= 2) {
      mgr.resetRoomPool();
      avail = nonLuck.slice();
    }
    return avail[Math.floor(Math.random() * avail.length)];
  }

  function patchManagerPool(mgr) {
    if (!mgr || mgr._scorearPatched) return;
    mgr._scorearPatched = true;
    const origGrant = mgr.grantRandomCard.bind(mgr);
    mgr.grantRandomCard = function (playerId, specificCardId = null) {
      const db = global.CARDS_DATABASE || {};
      const nonLuck = Object.keys(db).filter(k => k !== 'BETTER_LUCK');
      const remaining = nonLuck.filter(k => !this.claimedCards.has(k));
      if (remaining.length <= 2) this.resetRoomPool();
      const card = origGrant(playerId, specificCardId);
      if (card) {
        recentGrantsMap.set(String(playerId), { card, ts: Date.now(), consumedByPost: false });
      }
      return card;
    };
  }

  function getManager() {
    if (!manager && (global.GameModeManager || global.ScoreARCardArenaEngine?.GameModeManager)) {
      const Ctor = global.GameModeManager || global.ScoreARCardArenaEngine.GameModeManager;
      manager = new Ctor({
        onStateChange: renderStudentDeckUi,
        onCardEvent: handleCardEvent,
        onPlayerToast: handlePlayerToast
      });
      patchManagerPool(manager);
    }
    return manager;
  }

  function syncPlayerStatusesToRoom(hostRoom, mgr) {
    if (!hostRoom || !Array.isArray(hostRoom.players) || !mgr) return;
    hostRoom.players.forEach(p => {
      const mp = mgr.players[String(p.id)];
      if (!mp) return;
      p.score = mp.score;
      p.isPinned = Boolean(mp.status?.isPinned);
      p.hasFog = Boolean(mp.status?.hasFog);
      p.timeSliced = Boolean(mp.status?.timeSliced);
      p.wager100 = Boolean(mp.status?.wager100);
      p.cardMultiplier = mp.status?.multiplier || 1;
    });
  }

  function initArena(pin, studentId, isHost = false) {
    activePin = String(pin || '000000').trim();
    currentStudentId = studentId || global.ScoreARAuth?.currentUser?.uid || 's_local';
    isHostRole = Boolean(isHost);
    lastAuthoritativeGrantQ = null;
    recentGrantsMap.clear();
    pendingEffects.pin = false;
    pendingEffects.fog = false;
    pendingEffects.timeSlicer = false;
    pendingEffects.eraser = false;
    pendingEffects.eraserApplied = false;
    pendingEffects.wrongIndices = null;
    stopBotDirector();

    if (typeof unsubRealtime === 'function') {
      try { unsubRealtime(); } catch (_) {}
      unsubRealtime = null;
    }

    const mgr = getManager();
    if (mgr) {
      const mode = global.ScoreARGameModes?.getMode?.() || 'CARD_ARENA';
      mgr.resetRoomPool();
      mgr.setGameMode(mode, false, 0);
      if (isHostRole) {
        mgr.syncRoster(global.ScoreARQuizHost?.getPlayers?.() || []);
      } else if (!mgr.players[currentStudentId]) {
        mgr.registerPlayer(currentStudentId, global.ScoreARQuizStudent?.state?.name || global.currentStudent?.name || 'طالب', false);
      }
    }
    if (global.ScoreARRealtime?.subscribe) {
      unsubRealtime = global.ScoreARRealtime.subscribe(handleRealtimeMessage);
    }
  }

  function syncHostRoster(roomPlayers = null) {
    const mgr = getManager();
    if (!mgr) return;
    const list = Array.isArray(roomPlayers) ? roomPlayers : (global.ScoreARQuizHost?.getPlayers?.() || []);
    mgr.syncRoster(list, isHostRole ? null : currentStudentId);
    if (isHostRole && global.ScoreARArena3D?.isActive?.() && isModeActive()) {
      global.ScoreARArena3D.syncCardActorsState?.(list, mgr);
    }
    if (isHostRole && global.ScoreARRealtime?.publish && activePin) {
      global.ScoreARRealtime.publish('ROSTER_SYNC', {
        pin: activePin,
        roster: list.map(p => ({ id: p.id, name: p.name, score: p.score || 0, streak: p.streak || 0, avatarId: p.avatarId || 'char_01', isBot: Boolean(p.isBot || p.isDemo) }))
      });
    }
  }

  function dealRound1StarterCards(room) {
    if (room && typeof document !== 'undefined' && document.getElementById('scorearHostStage')) {
      isHostRole = true;
      if (room.pin) activePin = String(room.pin);
    }
    const mgr = getManager();
    if (!mgr || !room || !Array.isArray(room.players)) return null;
    mgr.resetRoomPool();
    mgr.syncRoster(room.players);
    const cardGrantsByPlayer = {};
    const drops = [];

    room.players.forEach(rp => {
      const pid = String(rp.id);
      const mp = mgr.players[pid] || mgr.registerPlayer(pid, rp.name, Boolean(rp.isBot || rp.isDemo));
      mp.hand = [];
      mp.trapSlots = [];
      mp.status = { isPinned: false, hasFog: false, timeSliced: false, blockDrawTurns: 0, multiplier: 1, wager100: false };
      rp.isPinned = false; rp.hasFog = false; rp.timeSliced = false; rp.wager100 = false; rp.cardMultiplier = 1;
      const pickedKey = pickUnclaimedNonLuckKey(mgr);
      const card = mgr.grantRandomCard(pid, pickedKey);
      if (card) {
        cardGrantsByPlayer[pid] = [{ ...card, reason: 'starter' }];
        drops.push({ playerId: pid, playerName: rp.name, cardName: card.nameAr, reason: 'starter' });
      }
    });

    if (global.ScoreARArena3D?.isActive?.()) {
      global.ScoreARArena3D.syncCardActorsState?.(room.players, mgr);
    }
    global.ScoreARCardCinema?.updateCardArenaHud?.(room, mgr);
    if (drops.length) {
      global.ScoreARCardCinema?.showCardDropToast?.(drops, '🃏 جولة البداية — كارت تكتيكي مجاني لكل بطل!');
    }
    if (isHostRole && room.players.some(p => p.isBot || p.isDemo)) startBotDirector();
    return { cardGrantsByPlayer, drops };
  }

  function processPostQuestionCardGrants(room, payload) {
    if (room && typeof document !== 'undefined' && document.getElementById('scorearHostStage')) {
      isHostRole = true;
      if (room.pin) activePin = String(room.pin);
    }
    const mgr = getManager();
    if (!mgr || !room || !Array.isArray(room.players) || !isModeActive()) return null;
    const qIdx = Number.isFinite(payload?.qIndex) ? payload.qIndex : (room._lastQIndex ?? 0);
    if (room._cardPostGrantQ === qIdx) return null;
    room._cardPostGrantQ = qIdx;

    mgr.syncRoster(room.players);
    const cardGrants = {};
    const drops = [];
    const addGrant = (pid, playerName, card, reason) => {
      if (!card) return;
      if (!cardGrants[pid]) cardGrants[pid] = [];
      cardGrants[pid].push({ ...card, reason });
      drops.push({ playerId: pid, playerName, cardName: card.nameAr, reason });
    };

    const top2 = Array.isArray(payload?.fastestTop2) ? payload.fastestTop2 : [];
    top2.forEach(w => {
      const pid = String(w.id);
      const rp = room.players.find(p => String(p.id) === pid);
      const isBot = Boolean(rp && (rp.isBot || rp.isDemo));
      const rec = recentGrantsMap.get(pid);
      if (isBot && rec && !rec.consumedByPost && (Date.now() - rec.ts) < 2500 && rec.card) {
        rec.consumedByPost = true;
        addGrant(pid, rp?.name || w.name, rec.card, 'top2');
      } else {
        const pickedKey = pickUnclaimedNonLuckKey(mgr);
        const card = mgr.grantRandomCard(pid, pickedKey);
        if (card) {
          const newRec = recentGrantsMap.get(pid);
          if (newRec) newRec.consumedByPost = true;
          addGrant(pid, rp?.name || w.name, card, 'top2');
        }
      }
    });

    const pResults = payload?.playerResults || {};
    room.players.forEach(rp => {
      const pid = String(rp.id);
      const res = pResults[pid];
      const streak = Number(res?.streak ?? rp.streak ?? 0);
      if (res?.isCorrect && streak > 0 && streak % 2 === 0) {
        const pickedKey = pickUnclaimedNonLuckKey(mgr);
        const card = mgr.grantRandomCard(pid, pickedKey);
        if (card) {
          const newRec = recentGrantsMap.get(pid);
          if (newRec) newRec.consumedByPost = true;
          addGrant(pid, rp.name, card, 'streak2');
        }
      }
    });

    if (global.ScoreARArena3D?.isActive?.()) {
      global.ScoreARArena3D.syncCardActorsState?.(room.players, mgr);
    }
    global.ScoreARCardCinema?.updateCardArenaHud?.(room, mgr);
    if (drops.length) {
      global.ScoreARCardCinema?.showCardDropToast?.(drops, '🃏 كروت جديدة! ⚡ أسرع إجابتين + 🔥 سلسلة إجابات');
    }
    return { cardGrants, cardDropSummary: drops };
  }

  function showStudentCardAlert(msg, isAttack = false) {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('scorearStudentCardAlert');
    if (!el) {
      el = document.createElement('div');
      el.id = 'scorearStudentCardAlert';
      el.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-30px);z-index:10000000;background:linear-gradient(135deg,rgba(24,23,46,0.97),rgba(32,27,62,0.99));border:2px solid #8e64ef;padding:10px 20px;border-radius:20px;color:#fff;font-size:12.5px;font-weight:900;box-shadow:0 10px 32px rgba(0,0,0,0.7),0 0 22px rgba(142,100,239,0.4);transition:all 0.28s cubic-bezier(0.2,0.8,0.2,1);pointer-events:none;direction:rtl;max-width:92vw;text-align:center;font-family:Cairo,Tajawal,sans-serif;opacity:0;';
      document.body.appendChild(el);
    }
    el.style.borderColor = isAttack ? '#ef4444' : '#8e64ef';
    el.innerHTML = msg;
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(-30px)'; }, 3400);
  }

  function isOptionsScreenOpen() {
    if (typeof document === 'undefined') return false;
    const btns = document.querySelectorAll('.student-opt-btn');
    return btns.length > 0 && !(global.ScoreARQuizStudent?.hasAnswered?.());
  }

  function triggerCardEffectOnMe(cardId, sourceName = 'منافس', actionMsg = '') {
    const mgr = getManager(), me = mgr?.players?.[currentStudentId];
    if (cardId === 'PIN_STUDENT') {
      if (isOptionsScreenOpen()) { if (me?.status) me.status.isPinned = false; pendingEffects.pin = false; applyPinEffect(sourceName); }
      else { pendingEffects.pin = true; showStudentCardAlert(`❄️ هجوم تثبيت من ${sourceName}! سيتم تجميد خياراتك في السؤال القادم!`, true); sfx('wrong'); }
    } else if (cardId === 'SCREEN_FOG') {
      if (isOptionsScreenOpen()) { if (me?.status) me.status.hasFog = false; pendingEffects.fog = false; applyFogEffect(sourceName); }
      else { pendingEffects.fog = true; showStudentCardAlert(`💨 هجوم ضباب الرؤية من ${sourceName}! سيغطي الضباب سؤالك القادم!`, true); sfx('wrong'); }
    } else if (cardId === 'TIME_SLICER') {
      if (isOptionsScreenOpen()) { if (me?.status) me.status.timeSliced = false; pendingEffects.timeSlicer = false; applyTimeSlicerEffect(sourceName); }
      else { pendingEffects.timeSlicer = true; showStudentCardAlert(`⏳ مقص الوقت من ${sourceName}! سيُقتطع نصف وقتك في السؤال القادم!`, true); sfx('wrong'); }
    } else if (cardId === 'BLOCK_DRAW') {
      if (me?.status) me.status.blockDrawTurns = 2;
      showStudentCardAlert(`🚫 مانع السحب من ${sourceName}! لن تسحب كروتاً لجولتين.`, true);
      sfx('wrong');
    } else if (cardId === 'MINUS_50' || cardId === 'POINT_LEECH' || cardId === 'SWAP_STUDENT') {
      const stg = document.getElementById('scorearStudentStage');
      if (stg) { stg.style.boxShadow = 'inset 0 0 60px rgba(239,68,68,0.75)'; setTimeout(() => { stg.style.boxShadow = ''; }, 900); }
      showStudentCardAlert(actionMsg || `💥 هجوم تكتيكي من ${sourceName}! رصيد نقاطك الآن: ${me?.score ?? 0} نقطة!`, true);
      sfx('wrong');
    }
    renderStudentDeckUi();
  }

  function ingestStudentAuthoritativeGrants(msg, mgr) {
    if (!msg?.cardGrants || !mgr) return false;
    const myKey = String(currentStudentId);
    const grants = msg.cardGrants[myKey];
    if (!Array.isArray(grants) || !grants.length) return false;
    if (!mgr.players[myKey]) mgr.registerPlayer(myKey, global.ScoreARQuizStudent?.state?.name || 'طالب', false);
    const me = mgr.players[myKey];
    let addedAny = false;
    grants.forEach(c => {
      if (!c || me.hand.length >= 3 || me.hand.some(x => x.instanceId === c.instanceId)) return;
      me.hand.push({ ...c });
      addedAny = true;
    });
    if (addedAny) {
      lastAuthoritativeGrantQ = msg.qIndex ?? 0;
      isDeckOpen = true;
      mountStudentDeck(document.getElementById('scorearStudentStage') || document.body);
      const labels = grants.map(g => `${g.nameAr}${g.reason === 'streak2' ? ' (سلسلة 🔥)' : g.reason === 'starter' ? ' (البداية 🃏)' : ' (سرعة ⚡)'}`).join(' + ');
      showStudentCardAlert(`🃏 وصلك كارت تكتيكي: ${labels}!`);
      sfx('fanfare');
    }
    return addedAny;
  }

  function handleRealtimeMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
    const mgr = getManager();
    if (msg.gameMode || msg.mode) {
      const newMode = msg.gameMode || msg.mode;
      if (!isHostRole) global.__scorearJoinedRoomMode = newMode;
      if (mgr) mgr.setGameMode(newMode, false, 0);
    }

    if (msg.type === 'ROOM_CLOSED') {
      stopBotDirector();
      global.ScoreARCardCinema?.cleanup?.();
      pendingEffects.eraser = false;
      pendingEffects.eraserApplied = false;
      pendingEffects.wrongIndices = null;
      return;
    }

    if (Array.isArray(msg.roster) || Array.isArray(msg.allRanks)) {
      if (mgr) mgr.syncRoster(msg.roster || msg.allRanks, isHostRole ? null : currentStudentId);
      if (!isHostRole && mgr?.players?.[currentStudentId] && global.ScoreARQuizStudent?.syncScoreFromHost) {
        global.ScoreARQuizStudent.syncScoreFromHost(mgr.players[currentStudentId].score);
      }
      renderStudentDeckUi();
    }

    if (msg.type === 'QUESTION_READING' && !isHostRole) {
      pendingEffects.eraser = false;
      pendingEffects.eraserApplied = false;
      pendingEffects.wrongIndices = null;
      ingestStudentAuthoritativeGrants(msg, mgr);
      return;
    }

    if (msg.type === 'QUESTION_START' && !isHostRole) {
      pendingEffects.eraserApplied = false;
      if (pendingEffects.eraser && Array.isArray(pendingEffects.wrongIndices) && pendingEffects.wrongIndices.length) {
        setTimeout(() => applyEraserEffect(pendingEffects.wrongIndices), 60);
      }
      return;
    }

    if (msg.type === 'QUESTION_RESULT' && !isHostRole) {
      pendingEffects.eraser = false;
      pendingEffects.eraserApplied = false;
      pendingEffects.wrongIndices = null;
      const myRes = msg.playerResults?.[String(currentStudentId)];
      if (mgr?.players?.[currentStudentId]?.status) {
        mgr.players[currentStudentId].status.wager100 = false;
        mgr.players[currentStudentId].status.multiplier = 1;
      }
      if (myRes?.wager100Outcome === 'won') showStudentCardAlert('🎲 كسبت رهان المائة! +100 نقطة إضافية!');
      else if (myRes?.wager100Outcome === 'lost') showStudentCardAlert('🎲 خسرت رهان المائة (-100 نقطة)!', true);
      ingestStudentAuthoritativeGrants(msg, mgr);
      renderStudentDeckUi();
      return;
    }

    if (msg.type === 'CARD_TRAP_EQUIP' && isHostRole && mgr && msg.playerId && msg.card) {
      if (!mgr.players[msg.playerId]) mgr.registerPlayer(msg.playerId, msg.playerName || 'طالب', false);
      const p = mgr.players[msg.playerId];
      if (p.trapSlots.length < 2 && !p.trapSlots.some(t => t.instanceId === msg.card.instanceId)) {
        p.trapSlots.push(msg.card);
      }
      const hostRoom = global.ScoreARQuizHost?.getCurrentRoom?.();
      if (global.ScoreARArena3D?.isActive?.()) global.ScoreARArena3D.syncCardActorsState?.(hostRoom?.players, mgr);
      global.ScoreARCardCinema?.updateCardArenaHud?.(hostRoom, mgr);
      global.ScoreARCardCinema?.pushBattleFeed?.({ type: 'EQUIP', card: msg.card, message: `🛡️ ${msg.playerName || p.name} جهّز فخاً دفاعياً سرياً!` });
      return;
    }

    if (msg.type === 'CARD_GRANT_STUDENT' && !isHostRole && mgr) {
      if (!msg.targetId || String(msg.targetId) === String(currentStudentId)) {
        const c = mgr.grantRandomCard(currentStudentId, msg.cardId || null);
        if (c) { isDeckOpen = true; mountStudentDeck(document.getElementById('scorearStudentStage') || document.body); showStudentCardAlert(`🃏 وصلك كارت تكتيكي: ${c.nameAr}!`); sfx('fanfare'); }
      }
      return;
    }

    if (msg.type === 'CARD_ACTION_BROADCAST') {
      const hostRoom = global.ScoreARQuizHost?.getCurrentRoom?.();
      if ((isHostRole || hostRoom) && mgr && msg.sourceId && msg.cardId) {
        if (hostRoom?.players) mgr.syncRoster(hostRoom.players);
        if (!mgr.players[msg.sourceId]) mgr.registerPlayer(msg.sourceId, msg.sourceName || 'طالب', false);
        const sender = mgr.players[msg.sourceId], instId = msg.instanceId || ('c_sync_' + Date.now());
        if (!sender.hand.some(c => c.instanceId === instId)) {
          const tpl = global.CARDS_DATABASE?.[msg.cardId] || { id: msg.cardId, nameAr: msg.cardId, type: 'TARGET_ATTACK' };
          sender.hand.push({ ...tpl, instanceId: instId });
        }
        mgr.activateCard(msg.sourceId, instId, msg.targetId || msg.sourceId);
        return;
      }
      showHostCardBanner(msg.actionMessage, msg.actionType);
      if (String(msg.targetId) === String(currentStudentId) && !msg.blocked) {
        triggerCardEffectOnMe(msg.cardId, msg.sourceName || 'منافس', msg.actionMessage);
      }
      renderStudentDeckUi();
    } else if (msg.type === 'HOST_CARD_EFFECT') {
      if (isHostRole) return;
      if (mgr && Array.isArray(msg.roster)) mgr.syncRoster(msg.roster, currentStudentId);
      const me = mgr?.players?.[currentStudentId];
      if (me && global.ScoreARQuizStudent?.syncScoreFromHost) global.ScoreARQuizStudent.syncScoreFromHost(me.score);
      const myIdStr = String(currentStudentId);
      const isTarget = String(msg.targetId) === myIdStr;
      const isAffected = String(msg.affectedId || msg.targetId) === myIdStr;
      const isSource = String(msg.sourceId) === myIdStr;

      if (isTarget && (msg.blocked || msg.reflected)) {
        if (me?.trapSlots?.length) {
          let trapIdx = msg.consumedTrapInstanceId
            ? me.trapSlots.findIndex(t => t.instanceId === msg.consumedTrapInstanceId)
            : -1;
          if (trapIdx === -1 && msg.consumedTrapId) trapIdx = me.trapSlots.findIndex(t => t.id === msg.consumedTrapId);
          if (trapIdx === -1) trapIdx = 0;
          me.trapSlots.splice(trapIdx, 1);
        }
        showStudentCardAlert(`🛡️ ${msg.actionMessage}`);
        sfx('fanfare');
      } else if (isAffected && !msg.blocked && (msg.targetId !== msg.sourceId || msg.reflected)) {
        triggerCardEffectOnMe(msg.cardId, msg.reflected ? 'مرآة القاضي (مرتد)' : (msg.sourceName || 'منافس'), msg.actionMessage);
      } else if (isSource) {
        if (Array.isArray(msg.sourceHandSnapshot) && me) me.hand = msg.sourceHandSnapshot.map(c => ({ ...c }));
        if (msg.cardId === 'ASK_QUESTION' && me?.status) me.status.wager100 = Boolean(msg.wager100Active ?? true);
        if (msg.cardId === 'ERASER_50_50' && Array.isArray(msg.wrongIndices) && msg.wrongIndices.length) {
          pendingEffects.wrongIndices = msg.wrongIndices.slice();
          if (isOptionsScreenOpen()) applyEraserEffect(msg.wrongIndices);
          else { pendingEffects.eraser = true; showStudentCardAlert('✂️ سيتم استبعاد خيارين خاطئين فور ظهور الخيارات!'); }
        }
        showStudentCardAlert(msg.actionMessage, Boolean(msg.blocked));
        sfx(msg.blocked ? 'wrong' : 'reveal');
      }
      renderStudentDeckUi();
    }
  }

  function handleCardEvent(ev) {
    const mgr = getManager(), hostRoom = global.ScoreARQuizHost?.getCurrentRoom?.();
    if (ev?.card?.id === 'ASK_QUESTION' && ev.type === 'EXECUTED' && ev.sourcePlayer) {
      ev.sourcePlayer.score = Math.max(0, (Number(ev.sourcePlayer.score) || 0) - 100);
      if (!ev.sourcePlayer.status) ev.sourcePlayer.status = {};
      ev.sourcePlayer.status.wager100 = true;
      ev.message = `🎲 ${ev.sourcePlayer.name || 'بطل'} فعّل رهان المائة (±100 نقطة على السؤال القادم)!`;
    }

    if (hostRoom && Array.isArray(hostRoom.players) && mgr) {
      syncPlayerStatusesToRoom(hostRoom, mgr);
    }

    if (isHostRole || hostRoom) {
      if (global.ScoreARArena3D?.isActive?.()) {
        global.ScoreARArena3D.playCardBattle3D?.(ev);
        global.ScoreARArena3D.syncCardActorsState?.(hostRoom?.players, mgr);
        global.ScoreARCardCinema?.showCardCutIn?.(ev);
        global.ScoreARCardCinema?.pushBattleFeed?.(ev);
        global.ScoreARCardCinema?.updateCardArenaHud?.(hostRoom, mgr);
      } else {
        showHostCardBanner(ev.message, ev.type);
        global.ScoreARStageFx?.playCardProjectile?.(ev);
      }
      global.ScoreARHostLeaderboard?.refreshCardArenaLiveStandings?.(hostRoom);
    }

    if (!isHostRole && mgr?.players?.[currentStudentId] && global.ScoreARQuizStudent?.syncScoreFromHost) {
      global.ScoreARQuizStudent.syncScoreFromHost(mgr.players[currentStudentId].score);
    }

    if (global.ScoreARRealtime?.publish && activePin) {
      if (isHostRole || hostRoom) {
        const roster = (hostRoom?.players || Object.values(mgr?.players || {})).map(p => ({ id: p.id, name: p.name, score: p.score || 0, streak: p.streak || 0, isBot: Boolean(p.isBot || p.isDemo || p.isAI) }));
        const wrongIndices = (ev.card?.id === 'ERASER_50_50' && global.ScoreARQuizHost?.getWrongIndicesForCurrentQuestion)
          ? global.ScoreARQuizHost.getWrongIndicesForCurrentQuestion()
          : undefined;
        const sourceHandSnapshot = (ev.card?.id === 'DRAW_ALL' || ev.card?.id === 'BETTER_LUCK')
          ? (ev.sourcePlayer?.hand || []).map(c => ({ ...c }))
          : undefined;
        global.ScoreARRealtime.publish('HOST_CARD_EFFECT', {
          actionMessage: ev.message,
          actionType: ev.type,
          sourceId: ev.sourcePlayer?.id,
          sourceName: ev.sourcePlayer?.name,
          targetId: ev.targetPlayer?.id,
          targetName: ev.targetPlayer?.name,
          affectedId: (ev.affectedPlayer || ev.targetPlayer)?.id,
          cardId: ev.card?.id,
          cardNameAr: ev.card?.nameAr,
          trapNameAr: ev.trapCard?.nameAr || null,
          consumedTrapId: ev.trapCard?.id || null,
          consumedTrapInstanceId: ev.trapCard?.instanceId || null,
          wrongIndices,
          sourceHandSnapshot,
          wager100Active: Boolean(ev.sourcePlayer?.status?.wager100),
          blocked: (ev.type === 'BLOCKED' || ev.type === 'REFLECTED'),
          reflected: (ev.type === 'REFLECTED'),
          roster
        });
      } else {
        global.ScoreARRealtime.publish('CARD_ACTION_BROADCAST', {
          actionMessage: ev.message,
          actionType: ev.type,
          sourceId: ev.sourcePlayer?.id,
          sourceName: ev.sourcePlayer?.name,
          targetId: ev.targetPlayer?.id,
          cardId: ev.card?.id,
          instanceId: ev.card?.instanceId,
          blocked: (ev.type === 'BLOCKED' || ev.type === 'REFLECTED')
        });
      }
    }
  }

  function handlePlayerToast(pid, msg) { if (String(pid) === String(currentStudentId)) showStudentCardAlert(msg); }

  function showHostCardBanner(msg, type) {
    if (typeof document === 'undefined' || !document.getElementById('scorearHostStage')) return;
    let ticker = document.getElementById('scorearCardArenaTicker');
    if (!ticker) {
      ticker = document.createElement('div');
      ticker.id = 'scorearCardArenaTicker';
      ticker.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(120px);z-index:9999999;background:linear-gradient(135deg,rgba(24,23,46,0.96),rgba(17,18,38,0.98));border:2px solid #f59e0b;padding:12px 28px;border-radius:20px;color:#fff;font-size:15px;font-weight:900;display:flex;align-items:center;gap:12px;box-shadow:0 12px 40px rgba(0,0,0,0.6);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);pointer-events:none;direction:rtl;font-family:Cairo,Tajawal,sans-serif;';
      document.body.appendChild(ticker);
    }
    const icon = type === 'REFLECTED' ? '⚖️' : (type === 'BLOCKED' ? '🛡️' : '⚡');
    ticker.style.borderColor = type === 'REFLECTED' ? '#38bdf8' : (type === 'BLOCKED' ? '#ef4444' : '#f59e0b');
    ticker.innerHTML = `<span style="font-size:22px;">${icon}</span><span>${esc(msg)}</span>`;
    ticker.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(ticker._hideTimer);
    ticker._hideTimer = setTimeout(() => { ticker.style.transform = 'translateX(-50%) translateY(120px)'; }, 4200);
  }

  function mountStudentDeck(stage) {
    if (!stage || typeof document === 'undefined') return;
    let wrap = document.getElementById('studentMobileDeckWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'studentMobileDeckWrap';
      wrap.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:999999;direction:rtl;font-family:Cairo,Tajawal,sans-serif;pointer-events:auto;';
      document.body.appendChild(wrap);
    }
    if (global.innerWidth && global.innerWidth <= 768) isDeckOpen = false;
    renderStudentDeckUi();
    const mgr = getManager(), me = mgr?.players?.[currentStudentId];
    if (pendingEffects.pin || me?.status?.isPinned) { pendingEffects.pin = false; if (me?.status) me.status.isPinned = false; setTimeout(() => applyPinEffect(), 60); }
    if (pendingEffects.fog || me?.status?.hasFog) { pendingEffects.fog = false; if (me?.status) me.status.hasFog = false; setTimeout(() => applyFogEffect(), 80); }
    if (pendingEffects.timeSlicer || me?.status?.timeSliced) { pendingEffects.timeSlicer = false; if (me?.status) me.status.timeSliced = false; setTimeout(() => applyTimeSlicerEffect(), 80); }
    if (pendingEffects.eraser && Array.isArray(pendingEffects.wrongIndices) && pendingEffects.wrongIndices.length && isOptionsScreenOpen()) {
      pendingEffects.eraser = false;
      setTimeout(() => applyEraserEffect(pendingEffects.wrongIndices), 80);
    }
  }

  function buildStudentStatusPillsHtml(me) {
    const st = me?.status || {};
    const pills = [];
    if (st.wager100) pills.push('<span style="background:rgba(16,185,129,0.22);border:1px solid #34d399;color:#6ee7b7;">🎲 رهان ±100 نشط</span>');
    if (st.multiplier === 2) pills.push('<span style="background:rgba(245,158,11,0.22);border:1px solid #fbbf24;color:#fde68a;">⚡ مضاعف 2X نشط</span>');
    if ((me?.trapSlots?.length || 0) > 0) pills.push(`<span style="background:rgba(56,189,248,0.22);border:1px solid #38bdf8;color:#7dd3fc;">🛡️ ${me.trapSlots.length} فخ جاهز</span>`);
    if (pendingEffects.pin || st.isPinned) pills.push('<span style="background:rgba(14,165,233,0.24);border:1px solid #38bdf8;color:#bae6fd;">❄️ تجميد قادم</span>');
    if (pendingEffects.fog || st.hasFog) pills.push('<span style="background:rgba(148,163,184,0.24);border:1px solid #94a3b8;color:#e2e8f0;">💨 ضباب قادم</span>');
    if (pendingEffects.timeSlicer || st.timeSliced) pills.push('<span style="background:rgba(245,158,11,0.24);border:1px solid #f59e0b;color:#fde68a;">⏳ مقص وقت قادم</span>');
    if (st.blockDrawTurns > 0) pills.push(`<span style="background:rgba(239,68,68,0.22);border:1px solid #f87171;color:#fca5a5;">🚫 مانع سحب (${st.blockDrawTurns})</span>`);
    if (!pills.length) return '';
    return `<div id="studentCardStatusStrip" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:7px;">${pills.map(p => p.replace('<span ', '<span style="font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px;white-space:nowrap;" ').replace(/style="([^"]*)" style="([^"]*)"/g, 'style="$1$2"')).join('')}</div>`;
  }

  function renderStudentDeckUi() {
    if (typeof document === 'undefined') return;
    const wrap = document.getElementById('studentMobileDeckWrap');
    if (!wrap) return;
    if (!isModeActive()) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    const mgr = getManager(), me = mgr?.players ? mgr.players[currentStudentId] : null;
    const hand = me?.hand || [], traps = me?.trapSlots || [];
    const statusStrip = buildStudentStatusPillsHtml(me);

    wrap.innerHTML = `
      <div style="display:flex;justify-content:center;margin-bottom:-4px;">
        <button type="button" onclick="ScoreARCardArena.toggleDeck()" style="background:linear-gradient(135deg,#7550ef,#9665ff);color:#fff;border:1px solid #c4a8ff;border-radius:18px 18px 0 0;padding:5px 18px;font-size:11.5px;font-weight:900;cursor:pointer;box-shadow:0 -4px 15px rgba(117,80,239,0.4);display:flex;align-items:center;gap:8px;">
          <span>🃏 حقيبة الكروت (${hand.length}/3)</span>
          <span style="font-size:10px;">${isDeckOpen ? '▼ تصغير' : '▲ فتح'}</span>
        </button>
      </div>
      <div style="background:rgba(12,14,30,0.97);backdrop-filter:blur(16px);border-top:2px solid #8e64ef;padding:10px 12px 12px;box-shadow:0 -10px 30px rgba(0,0,0,0.6);display:${isDeckOpen ? 'block' : 'none'};max-height:48vh;overflow-y:auto;">
        ${statusStrip}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;"><span style="font-size:10.5px;font-weight:900;color:#52d9ed;">🛡️ خانة الفخاخ للرد التلقائي (${traps.length}/2):</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">${[0, 1].map(i => {
          const t = traps[i];
          if (!t) return `<div style="background:rgba(255,255,255,0.03);border:1.5px dashed rgba(255,255,255,0.15);border-radius:10px;padding:6px;text-align:center;font-size:10.5px;color:#94a3b8;">خانة فخ فارغة (${i + 1})</div>`;
          return `<div style="background:rgba(23,37,84,0.75);border:1.5px solid #38bdf8;border-radius:10px;padding:5px 8px;display:flex;align-items:center;gap:6px;box-shadow:0 0 10px rgba(56,189,248,0.25);"><img src="${esc(t.img)}" alt="${esc(t.nameAr)}" style="width:30px;height:40px;object-fit:cover;border-radius:5px;flex-shrink:0;"><div style="overflow:hidden;"><b style="color:#ffffff;font-size:11px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(t.nameAr)}</b><small style="color:#7dd3fc;font-size:9px;display:block;">جاهز للرد التلقائي ⚡</small></div></div>`;
        }).join('')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;"><span style="font-size:10.5px;font-weight:900;color:#fcd34d;">🎒 كروت اليد الحالية (${hand.length}/3):</span></div>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">${[0, 1, 2].map(i => {
          const c = hand[i];
          if (!c) return `<div style="background:rgba(255,255,255,0.02);border:1.5px dashed rgba(255,255,255,0.12);border-radius:10px;min-height:102px;display:grid;place-items:center;font-size:10px;color:#64748b;text-align:center;padding:4px;">يد فارغة (${i + 1})</div>`;
          const isTrap = c.type && c.type.startsWith('TRAP_');
          const isTargeted = (c.type === 'TARGET_ATTACK' || c.type === 'TARGET_BLUFF');
          const borderClr = CATEGORY_BORDERS[c.category] || '#f59e0b';
          const shortDesc = c.id === 'ASK_QUESTION' ? 'رهان السؤال القادم: +100 صح / -100 خطأ' : (c.desc || '');
          return `<div title="${esc(shortDesc)}" style="background:rgba(21,23,49,0.95);border:1.5px solid ${borderClr};border-radius:10px;padding:5px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center;min-height:102px;">
            <img src="${esc(c.img)}" alt="${esc(c.nameAr)}" style="width:100%;max-width:50px;height:38px;object-fit:cover;border-radius:5px;margin-bottom:2px;">
            <b style="color:#ffffff;font-size:10.5px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">${esc(c.nameAr)}</b>
            <small style="color:#cbd5e1;font-size:8.5px;line-height:1.2;margin:2px 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">${esc(shortDesc)}</small>
            ${isTrap ? `<button type="button" onclick="ScoreARCardArena.equipTrap('${esc(c.instanceId)}')" style="background:#0284c7;color:#fff;border:none;border-radius:5px;padding:3px 5px;font-size:9.5px;font-weight:900;width:100%;cursor:pointer;">🛡️ وضع بالفخ</button>` : ''}
            ${!isTrap && !isTargeted ? `<button type="button" onclick="ScoreARCardArena.activateSelf('${esc(c.instanceId)}')" style="background:#10b981;color:#fff;border:none;border-radius:5px;padding:3px 5px;font-size:9.5px;font-weight:900;width:100%;cursor:pointer;">⚡ تفعيل</button>` : ''}
            ${isTargeted ? `<button type="button" onclick="ScoreARCardArena.openTargetPicker('${esc(c.instanceId)}')" style="background:#ef4444;color:#fff;border:none;border-radius:5px;padding:3px 5px;font-size:9.5px;font-weight:900;width:100%;cursor:pointer;">🎯 استهداف</button>` : ''}
          </div>`;
        }).join('')}</div>
      </div>`;
  }

  function toggleDeck() { isDeckOpen = !isDeckOpen; renderStudentDeckUi(); }

  function equipTrap(instanceId) {
    const mgr = getManager();
    if (!mgr) return;
    const res = mgr.equipToTrapSlot(currentStudentId, instanceId);
    if (res?.ok) {
      sfx('pop');
      if (!isHostRole && global.ScoreARRealtime?.publish && activePin) {
        global.ScoreARRealtime.publish('CARD_TRAP_EQUIP', { playerId: currentStudentId, playerName: mgr.players[currentStudentId]?.name || 'طالب', card: res.card });
      } else {
        const hostRoom = global.ScoreARQuizHost?.getCurrentRoom?.();
        if (global.ScoreARArena3D?.isActive?.()) global.ScoreARArena3D.syncCardActorsState?.(hostRoom?.players, mgr);
        global.ScoreARCardCinema?.updateCardArenaHud?.(hostRoom, mgr);
      }
    }
  }

  function activateSelf(instanceId) {
    const mgr = getManager();
    if (!mgr) return;
    const me = mgr.players[currentStudentId];
    const card = me?.hand?.find(c => c.instanceId === instanceId);
    if (!card) return;
    if (card.id === 'ASK_QUESTION') {
      if (me?.status?.wager100) {
        showStudentCardAlert('🎲 رهان المائة نشط بالفعل للسؤال القادم!', false);
        return;
      }
      showStudentCardAlert('🎲 تم تفعيل رهان المائة! إجابة صحيحة = +100 إضافية، خاطئة = -100!');
    } else if (card.id === 'MULTIPLIER_2X') {
      if (me?.status?.multiplier === 2) {
        showStudentCardAlert('⚡ مضاعف النقاط 2X نشط بالفعل للسؤال القادم!', false);
        return;
      }
      if (me) me.status.multiplier = 2;
      showStudentCardAlert('⚡ تم تفعيل مضاعف النقاط 2X لسؤالك القادم!');
    } else if (card.id === 'ERASER_50_50') {
      pendingEffects.eraser = true;
      pendingEffects.eraserApplied = false;
      const localWrong = global.ScoreARQuizHost?.getWrongIndicesForCurrentQuestion?.() || [];
      if (isOptionsScreenOpen() && localWrong.length) {
        applyEraserEffect(localWrong);
      } else {
        showStudentCardAlert('✂️ جاري استبعاد خيارين خاطئين...');
      }
    }
    mgr.activateCard(currentStudentId, instanceId, currentStudentId);
    sfx('reveal');
  }

  function openTargetPicker(instanceId) {
    const mgr = getManager();
    if (!mgr) return;
    const hostPlayers = global.ScoreARQuizHost?.getPlayers?.();
    if (Array.isArray(hostPlayers) && hostPlayers.length) mgr.syncRoster(hostPlayers, currentStudentId);
    const otherPlayers = Object.values(mgr.players)
      .filter(p => String(p.id) !== String(currentStudentId))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    document.getElementById('targetPickerModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'targetPickerModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999999;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:Cairo,Tajawal,sans-serif;';
    modal.innerHTML = `<div style="background:#13152a;border:2px solid #ef4444;border-radius:22px;padding:22px;max-width:380px;width:100%;text-align:center;"><h3 style="color:#ffffff;font-size:18px;margin:0 0 6px;">🎯 اختر الطالب المستهدف</h3><p style="color:#cbd5e1;font-size:12px;margin-bottom:16px;">اضغط على اسم منافسك لإطلاق الكارت عليه فوراً:</p><div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;margin-bottom:16px;">${otherPlayers.length ? otherPlayers.map((p, idx) => `<button type="button" onclick="ScoreARCardArena.confirmTarget('${esc(instanceId)}', '${esc(p.id)}')" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:10px 14px;color:#fff;font-weight:800;font-size:14px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;"><span><small style="color:#94a3b8;">#${idx + 1}</small> ${p.isAI ? '🤖 ' : '👤 '}${esc(p.name)}</span><span style="color:#fcd34d;font-size:12px;">${p.score || 0} نقطة</span></button>`).join('') : '<div style="color:#94a3b8;font-size:13px;padding:14px;">لا يوجد متنافسون آخرون بالقاعة حالياً</div>'}</div><button type="button" onclick="document.getElementById('targetPickerModal')?.remove()" style="background:#334155;color:#fff;border:none;padding:8px 20px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">إلغاء ✕</button></div>`;
    document.body.appendChild(modal);
  }

  function confirmTarget(instanceId, targetId) {
    document.getElementById('targetPickerModal')?.remove();
    const mgr = getManager();
    if (mgr) { mgr.activateCard(currentStudentId, instanceId, targetId); sfx('pop'); }
  }

  function simulateCardAction(cardId = null) {
    const mgr = getManager();
    if (!mgr) return;
    if (isHostRole && document.getElementById('scorearHostStage')) {
      syncHostRoster();
      if (global.ScoreARRealtime?.publish && activePin && cardId) global.ScoreARRealtime.publish('CARD_GRANT_STUDENT', { pin: activePin, cardId });
      const all = Object.values(mgr.players);
      if (all.length >= 2) {
        const sorted = [...all].sort((a, b) => (b.score || 0) - (a.score || 0));
        const sender = sorted[all.length > 2 ? 1 : 0];
        const target = String(sorted[0].id) === String(sender.id) ? sorted[1] : sorted[0];
        const c = mgr.grantRandomCard(sender.id, cardId || 'PIN_STUDENT');
        if (c) mgr.activateCard(sender.id, c.instanceId, (c.type === 'TARGET_ATTACK' || c.type === 'TARGET_BLUFF') ? target.id : sender.id);
      } else {
        showHostCardBanner('🃏 أضف متسابقين اثنين على الأقل لتشغيل مبارزة الكروت!', 'EXECUTED');
      }
      sfx('reveal');
      return;
    }
    const card = mgr.grantRandomCard(currentStudentId, cardId || 'SWAP_STUDENT');
    if (card) { isDeckOpen = true; renderStudentDeckUi(); showStudentCardAlert(`🃏 تجربة كارت: حصلت على ${card.nameAr}!`); sfx('reveal'); }
  }

  function applyPinEffect(sourceName = 'منافس') {
    document.querySelectorAll('.student-opt-btn').forEach(b => { b.disabled = true; b.style.pointerEvents = 'none'; b.style.opacity = '0.35'; b.style.filter = 'grayscale(1)'; });
    const fb = document.getElementById('studentFeedbackBox');
    if (fb) fb.innerHTML = `❄️ <strong style="color:#38bdf8;">تم تجميد شاشتك بواسطة ${esc(sourceName)}!</strong> لا يمكنك الإجابة في هذه الجولة.`;
    showStudentCardAlert(`❄️ أنت مجمد بواسطة كارت تثبيت طالب من ${sourceName}!`, true);
    sfx('wrong');
  }

  function applyFogEffect(sourceName = 'منافس') {
    const cont = document.getElementById('studentOptionsContainer');
    if (!cont || document.getElementById('fogOverlayCanvas')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'fogOverlayCanvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:30;cursor:pointer;border-radius:16px;touch-action:none;';
    cont.style.position = 'relative'; cont.appendChild(canvas);
    canvas.width = cont.offsetWidth || 360; canvas.height = cont.offsetHeight || 220;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(22, 20, 48, 0.96)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 15px Cairo, sans-serif'; ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'center';
      ctx.fillText('💨 ضباب الرؤية! امسح بإصبعك لكشف الخيارات', canvas.width / 2, canvas.height / 2);
      let isWiping = false;
      const wipe = (e) => {
        if (!isWiping) return;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX ?? e.touches?.[0]?.clientX) || 0) - rect.left, y = ((e.clientY ?? e.touches?.[0]?.clientY) || 0) - rect.top;
        ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x, y, 36, 0, Math.PI * 2); ctx.fill();
      };
      canvas.addEventListener('mousedown', () => isWiping = true); canvas.addEventListener('touchstart', () => isWiping = true);
      global.addEventListener?.('mouseup', () => isWiping = false); global.addEventListener?.('touchend', () => isWiping = false);
      canvas.addEventListener('mousemove', wipe); canvas.addEventListener('touchmove', wipe);
    }
    showStudentCardAlert(`💨 ضباب الرؤية من ${sourceName}! امسح الشاشة لكشف الخيارات.`, true);
  }

  function applyEraserEffect(wrongIndices = null) {
    if (pendingEffects.eraserApplied) return false;
    const opts = document.querySelectorAll('.student-opt-btn');
    if (opts.length < 2) return false;
    const toDisable = (Array.isArray(wrongIndices) && wrongIndices.length)
      ? wrongIndices
      : (global.ScoreARQuizHost?.getWrongIndicesForCurrentQuestion?.() || []);
    if (!toDisable.length) return false;

    pendingEffects.eraserApplied = true;
    pendingEffects.eraser = false;
    toDisable.forEach(idx => {
      if (opts[idx]) { opts[idx].style.opacity = '0.15'; opts[idx].disabled = true; opts[idx].style.pointerEvents = 'none'; }
    });
    showStudentCardAlert('✂️ كارت 50/50: تم استبعاد خيارين خاطئين!');
    return true;
  }

  function applyTimeSlicerEffect(sourceName = 'منافس') {
    if (global.ScoreARQuizStudent?.cutTimeInHalf) global.ScoreARQuizStudent.cutTimeInHalf();
    else {
      const timerTxt = document.getElementById('studentTimerText');
      if (timerTxt) { const t = parseInt(timerTxt.textContent, 10); if (!isNaN(t) && t > 2) timerTxt.textContent = String(Math.floor(t / 2)); }
    }
    showStudentCardAlert(`⏳ مقص الوقت من ${sourceName}! تم قطع نصف الوقت المتبقي.`, true);
    sfx('wrong');
  }

  function triggerBotCardMoveNow() {
    if (!isHostRole || !isModeActive()) return null;
    const mgr = getManager(), hostRoom = global.ScoreARQuizHost?.getCurrentRoom?.();
    if (!mgr || !hostRoom || !Array.isArray(hostRoom.players)) return null;
    if (!['question', 'result', 'leaderboard'].includes(hostRoom.status || '')) return null;
    if (global.ScoreARCardCinema?.isBusy?.()) return null;

    mgr.syncRoster(hostRoom.players);
    const bots = Object.values(mgr.players).filter(p => p.isAI && p.hand?.length > 0);
    if (!bots.length) return null;

    const bot = bots[Math.floor(Math.random() * bots.length)];
    const trap = bot.hand.find(c => c.type && c.type.startsWith('TRAP_'));
    if (trap && bot.trapSlots.length < 2 && Math.random() < 0.65) {
      const res = mgr.equipToTrapSlot(bot.id, trap.instanceId);
      if (res?.ok) {
        if (global.ScoreARArena3D?.isActive?.()) global.ScoreARArena3D.syncCardActorsState?.(hostRoom.players, mgr);
        global.ScoreARCardCinema?.updateCardArenaHud?.(hostRoom, mgr);
        global.ScoreARCardCinema?.pushBattleFeed?.({ type: 'EQUIP', card: trap, message: `🛡️ ${bot.name} جهّز فخاً دفاعياً سرياً!` });
        return { action: 'trap', botId: bot.id, card: trap };
      }
    }

    const sortedAll = Object.values(mgr.players).sort((a, b) => (b.score || 0) - (a.score || 0));
    const rival = sortedAll.find(p => String(p.id) !== String(bot.id)) || null;
    const playable = bot.hand.filter(c => {
      if (c.type && c.type.startsWith('TRAP_')) return false;
      if (c.id === 'ASK_QUESTION' && bot.status?.wager100) return false;
      if (c.id === 'MULTIPLIER_2X' && bot.status?.multiplier === 2) return false;
      if (c.id === 'SWAP_STUDENT' && (!rival || (bot.score || 0) >= (rival.score || 0))) return false;
      return true;
    });
    if (!playable.length) return null;

    const card = playable[Math.floor(Math.random() * playable.length)];
    const isTargeted = (card.type === 'TARGET_ATTACK' || card.type === 'TARGET_BLUFF') && rival;
    const ev = mgr.activateCard(bot.id, card.instanceId, isTargeted ? rival.id : bot.id);
    return ev;
  }

  function startBotDirector() {
    stopBotDirector();
    if (!isHostRole || !isModeActive()) return;
    botDirectorTimer = setInterval(() => {
      try { triggerBotCardMoveNow(); } catch (_) {}
    }, 4200);
  }

  function stopBotDirector() {
    if (botDirectorTimer) { clearInterval(botDirectorTimer); botDirectorTimer = null; }
  }

  function isModeActive() {
    const m = (!isHostRole && global.__scorearJoinedRoomMode)
      ? global.__scorearJoinedRoomMode
      : ((global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function')
        ? global.ScoreARGameModes.getMode()
        : (global.__scorearJoinedRoomMode || manager?.mode || 'CARD_ARENA'));
    return m === 'CARD_ARENA';
  }

  function onCorrectAnswerGranted(playerId, isTop2 = false) {
    if (!isTop2 && playerId !== 'solo_player') return;
    if (lastAuthoritativeGrantQ !== null) {
      renderStudentDeckUi();
      return;
    }
    const mgr = getManager();
    if (!mgr) return;
    const pidStr = String(playerId || currentStudentId || 's_local');
    if (!mgr.players[pidStr]) mgr.registerPlayer(pidStr, global.ScoreARQuizStudent?.state?.name || 'طالب', false);
    const card = mgr.grantRandomCard(pidStr);
    if (card) { isDeckOpen = true; renderStudentDeckUi(); showStudentCardAlert(`🏆 مركز متقدم بالسرعة! كسبت كارت: ${card.nameAr}`); sfx('fanfare'); }
  }

  global.ScoreARCardArena = {
    initArena, syncHostRoster, mountStudentDeck, renderStudentDeckUi, showStudentCardAlert,
    toggleDeck, equipTrap, activateSelf, openTargetPicker, confirmTarget,
    simulateCardAction, showHostCardBanner, applyPinEffect, applyFogEffect,
    applyEraserEffect, applyTimeSlicerEffect, onCorrectAnswerGranted, getManager, isModeActive,
    dealRound1StarterCards, processPostQuestionCardGrants, startBotDirector, stopBotDirector, triggerBotCardMoveNow
  };
})(typeof window !== 'undefined' ? window : globalThis);
