/**
 * ScoreAR Quiz Host View Module
 * Renders Host Projector UI: Atmosphere Video, 3D White PIN Box, Animated Fullbody Characters & Question Arena.
 * Features Modern World-Themed Timers and Smooth Motion Graphic Question Intro.
 * Strictly Rule 7 Compliant (<350 lines).
 */
(function(global) {
  'use strict';

  let currentLobbyPose = 'walk';
  function setLobbyHeroesPose(pose) {
    currentLobbyPose = pose || 'walk';
    document.querySelectorAll('.host-lobby-hero-char').forEach(el => {
      el.className = 'scorear-character host-lobby-hero-char character-' + currentLobbyPose;
    });
    document.querySelectorAll('[data-lobby-pose]').forEach(btn => {
      const act = btn.getAttribute('data-lobby-pose') === currentLobbyPose;
      btn.style.background = act ? 'rgba(142,100,239,0.45)' : 'rgba(255,255,255,0.07)';
      btn.style.borderColor = act ? '#a78bfa' : 'rgba(255,255,255,0.15)';
    });
  }
  function cycleSingleHeroPose(idx) {
    const s = document.getElementById('hostHeroSlot_' + idx);
    if (!s) return;
    const ps = ['walk', 'run', 'celebrate', 'fly', 'idle'];
    const c = ps.find(p => s.classList.contains('character-' + p)) || 'walk';
    s.className = 'scorear-character host-lobby-hero-char character-' + ps[(ps.indexOf(c) + 1) % ps.length];
  }

  const OPTION_THEMES = [
    { bg: '#e21b3c', border: '#ff5c77', shape: '▲' },
    { bg: '#1368ce', border: '#4f9fff', shape: '◆' },
    { bg: '#d89e00', border: '#ffd24d', shape: '●' },
    { bg: '#26890c', border: '#5cdb3b', shape: '■' }
  ];

  const WORLD_TIMER_CONFIGS = {
    royal: {
      name: 'القصر الملكي', icon: '👑', strokeStart: '#fbbf24', strokeEnd: '#d97706',
      accentNum: '#fef08a', bgClass: 'world-timer-royal'
    },
    cosmic: {
      name: 'محطة الفضاء', icon: '🚀', strokeStart: '#06b6d4', strokeEnd: '#8b5cf6',
      accentNum: '#a5f3fc', bgClass: 'world-timer-cosmic'
    },
    oasis: {
      name: 'واحة النخيل', icon: '🌴', strokeStart: '#34d399', strokeEnd: '#f59e0b',
      accentNum: '#6ee7b7', bgClass: 'world-timer-oasis'
    },
    treasure: {
      name: 'جزيرة الكنز', icon: '💎', strokeStart: '#fbbf24', strokeEnd: '#0ea5e9',
      accentNum: '#fde047', bgClass: 'world-timer-treasure'
    },
    stadium: {
      name: 'استاد الأبطال', icon: '⚡', strokeStart: '#22c55e', strokeEnd: '#38bdf8',
      accentNum: '#86efac', bgClass: 'world-timer-stadium'
    },
    magic: {
      name: 'المملكة السحرية', icon: '🔮', strokeStart: '#ec4899', strokeEnd: '#a855f7',
      accentNum: '#f472b6', bgClass: 'world-timer-magic'
    }
  };

  function escapeHtml(str) {
    return typeof str !== 'string' ? String(str || '') : str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function renderWorldTimerHtml(worldId, timeRemaining) {
    const cfg = WORLD_TIMER_CONFIGS[worldId] || WORLD_TIMER_CONFIGS.royal;
    return `
      <div id="hostWorldTimerContainer" class="scorear-world-timer ${cfg.bgClass}">
        <svg width="92" height="92" viewBox="0 0 100 100" style="transform:rotate(-90deg);position:absolute;inset:0;">
          <defs>
            <linearGradient id="timerGrad_${worldId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${cfg.strokeStart}" />
              <stop offset="100%" stop-color="${cfg.strokeEnd}" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.12)" stroke-width="6.5" fill="none" />
          <circle id="hostQuestionTimerRing" cx="50" cy="50" r="41"
            stroke="url(#timerGrad_${worldId})" stroke-width="6.5" fill="none"
            stroke-linecap="round" stroke-dasharray="257.6" stroke-dashoffset="0"
            style="transition:stroke-dashoffset 1s linear;" />
        </svg>
        <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;">
          <span style="font-size:11px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${cfg.icon}</span>
          <span id="hostQuestionTimerNum" style="font-size:26px;font-weight:900;color:${cfg.accentNum};font-family:monospace;margin:1px 0;">${timeRemaining}</span>
          <span style="font-size:9px;font-weight:800;color:rgba(255,255,255,0.7);letter-spacing:0.5px;">ثانية</span>
        </div>
      </div>
    `;
  }

  function renderHostLobby(stage, currentRoom, isRoomLocked) {
    const worldId = (currentRoom && currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : 'royal';
    const w = currentRoom.world || { name: 'المنافسة', tag: 'جاهز' };
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?pin=' + currentRoom.pin)}`;

        const activeGameMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function') ? global.ScoreARGameModes.getMode() : 'SOLO';
    const modeBadgeText = activeGameMode === 'CARD_ARENA' ? '🃏 حرب الكروت' : (activeGameMode === 'SQUADS' ? '🛡️ مجموعات' : '👤 فردي');
    const modeBadgeBorder = activeGameMode === 'CARD_ARENA' ? '#f59e0b' : (activeGameMode === 'SQUADS' ? '#38bdf8' : '#8e64ef');

    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${worldId}/lobby.jpg') center/cover no-repeat;z-index:1;"></div>
      <video id="hostLiveVideoBg" autoplay loop muted playsinline poster="assets/worlds/${worldId}/lobby.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0.95;"><source src="assets/videos/worlds/${worldId}.mp4" type="video/mp4"></video>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(12,13,29,0.2) 0%, rgba(12,13,29,0.72) 100%);z-index:3;"></div>
      <div class="host-lobby-topbar" style="position:absolute;top:18px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;z-index:20;">
        <div class="host-lobby-world-badge" style="display:flex;align-items:center;gap:12px;background:rgba(17,18,37,0.85);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.15);padding:8px 18px;border-radius:16px;">
          <span style="font-size:22px;">🌍</span>
          <div><b style="color:#ffffff;font-size:15px;display:block;">عالم ${w.name}</b><small style="color:#52d9ed;font-size:11px;">${w.tag || 'جاهز للمنافسة'} · مباشر</small></div>
        </div>
        <div class="host-lobby-actions" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <button id="hostGameModeBtn" class="btn outline" onclick="ScoreARGameModes && ScoreARGameModes.openModePicker({ worldId: '${worldId}', pin: '${currentRoom.pin}' })" style="font-size:12px;padding:9px 14px;border-radius:12px;border:1.5px solid ${modeBadgeBorder};background:rgba(20,20,40,0.85);color:${modeBadgeBorder};font-weight:900;display:inline-flex;align-items:center;gap:6px;cursor:pointer;" title="تغيير طور اللعب"><span id="hostGameModeBtnText">${modeBadgeText}</span><span style="font-size:10px;opacity:0.8;">▾</span></button>
          <button id="hostStartQuizBtn" class="btn dark" onclick="ScoreARQuizHost.launchQuestion(0)" style="font-size:14px;padding:10px 22px;font-weight:900;border-radius:14px;box-shadow:0 0 25px rgba(117,80,239,0.75);">🚀 بدء المنافسة فوراً (<span id="hostPlayerCount">${currentRoom.players.length}</span>)</button>
          <button class="btn light" onclick="ScoreARBots ? ScoreARBots.openModal() : ScoreARQuizHost.addDemoPlayer()" style="font-size:12px;padding:9px 15px;border-radius:12px;">🤖 الطلاب التجريبيون (<span id="hostBotCount">${currentRoom.players.filter(p=>p.isBot).length}</span>)</button>
          <button id="hostLockBtn" class="btn light" onclick="ScoreARQuizHost.toggleRoomLock()" style="font-size:12px;padding:9px 15px;border-radius:12px;color:${isRoomLocked?'#ef4444':'#34d399'};">${isRoomLocked ? '🔒 القاعة مقفلة' : '🔓 القاعة مفتوحة'}</button>
          <button class="scorear-audio-btn btn outline" onclick="ScoreARAudio?.toggleMute?.()" style="background:rgba(12,13,30,0.75);border:1px solid rgba(82,217,237,0.45);border-radius:12px;padding:9px 14px;font-size:12px;font-weight:800;color:#52d9ed;cursor:pointer;">🔊 الصوت: يعمل</button>
          <button class="btn outline" onclick="ScoreARQuizHost.closeHostSession()" style="background:rgba(0,0,0,0.5);border-radius:12px;padding:9px 15px;color:#fff;">✕ مغادرة القاعة</button>
        </div>
      </div>
      <div class="host-lobby-pin-stage" style="position:absolute;top:78px;left:50%;transform:translateX(-50%);z-index:20;max-width:96vw;">
        <div class="host-lobby-pin-box" style="background:linear-gradient(135deg, rgba(19,17,44,0.95) 0%, rgba(32,24,68,0.95) 100%);backdrop-filter:blur(20px);border:2px solid rgba(251,191,36,0.65);border-radius:26px;padding:12px 26px;display:flex;align-items:center;gap:22px;box-shadow:0 20px 55px rgba(0,0,0,0.75), 0 0 35px rgba(117,80,239,0.45);direction:rtl;">
          <div onclick="ScoreARQuizHostView.toggleQrZoom('${currentRoom.pin}')" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;" title="اضغط لتكبير الباركود بملء الشاشة">
            <div id="lobbyQrCodeHolder" style="width:78px;height:78px;flex-shrink:0;background:#fff;border-radius:14px;padding:5px;box-shadow:0 0 20px rgba(251,191,36,0.45);display:flex;align-items:center;justify-content:center;border:2px solid #fbbf24;transition:transform 0.2s;">
              <img src="${qrUrl}" alt="QR" style="width:68px;height:68px;border-radius:8px;display:block;">
            </div>
            <span style="font-size:10px;font-weight:900;color:#fcd34d;background:rgba(245,158,11,0.2);padding:1px 8px;border-radius:999px;">🔍 كبّر الباركود</span>
          </div>
          <div style="width:2px;height:64px;background:linear-gradient(180deg,transparent,rgba(251,191,36,0.5),transparent);"></div>
          <div style="text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:4px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 10px #34d399;"></span>
              <span style="font-size:11.5px;font-weight:900;letter-spacing:0.5px;color:#c4b5fd;">امسح الباركود للدخول المباشر أو اكتب رمز القاعة:</span>
            </div>
            <div class="host-lobby-pin-digits" style="display:flex;align-items:center;justify-content:center;gap:10px;direction:ltr;">
              <span style="background:linear-gradient(180deg,#ffffff,#e2e8f0);color:#090a16;font-size:38px;font-weight:900;font-family:Arial,monospace;padding:3px 16px;border-radius:14px;letter-spacing:6px;box-shadow:0 6px 18px rgba(0,0,0,0.4),inset 0 2px 4px #fff;">${String(currentRoom.pin).slice(0,3)}</span>
              <span style="color:#fbbf24;font-size:28px;font-weight:900;">•</span>
              <span style="background:linear-gradient(180deg,#ffffff,#e2e8f0);color:#090a16;font-size:38px;font-weight:900;font-family:Arial,monospace;padding:3px 16px;border-radius:14px;letter-spacing:6px;box-shadow:0 6px 18px rgba(0,0,0,0.4),inset 0 2px 4px #fff;">${String(currentRoom.pin).slice(3,6)}</span>
            </div>
          </div>
          <button class="host-lobby-copy-btn" onclick="navigator.clipboard?.writeText('${currentRoom.pin}'); if(window.toast) window.toast('تم نسخ رمز القاعة: ' + '${currentRoom.pin}');" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:1px solid #fef08a;border-radius:14px;padding:10px 16px;font-size:12px;font-weight:900;color:#090a16;cursor:pointer;flex-shrink:0;box-shadow:0 4px 15px rgba(245,158,11,0.4);">نسخ الرمز 📋</button>
        </div>
      </div>
      <div id="hostCharactersArena" class="host-lobby-characters-arena" style="position:absolute;bottom:0;left:0;right:0;height:52vh;display:flex;align-items:flex-end;justify-content:center;gap:26px;padding:0 35px 24px;z-index:15;pointer-events:none;overflow-x:auto;">
        ${renderFullbodyCharactersHtml(currentRoom)}
      </div>
      <div class="host-lobby-footer-pills" style="position:absolute;bottom:12px;left:24px;right:24px;display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap;z-index:20;">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <span style="background:rgba(17,18,37,0.85);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);padding:5px 14px;border-radius:12px;color:#ddd8ff;font-size:12px;font-weight:700;">👥 المتسابقون المتصلون: <b id="hostConnectedPlayersPill" style="color:#52d9ed;">${currentRoom.players.length}</b></span>
        <span style="background:rgba(17,18,37,0.85);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);padding:5px 14px;border-radius:12px;color:#ddd8ff;font-size:12px;font-weight:700;">⏱️ وقت الانتظار: <b id="hostLobbyTimerText" style="color:#fff;">0:00</b></span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;background:rgba(17,18,37,0.88);backdrop-filter:blur(12px);border:1px solid rgba(142,100,239,0.35);padding:5px 12px;border-radius:14px;">
          <span style="font-size:11.5px;font-weight:900;color:#c4b5fd;margin-left:4px;">🎮 حركة الأبطال:</span>
          <button type="button" data-lobby-pose="walk" onclick="ScoreARHostView.setLobbyHeroesPose('walk')" style="background:rgba(142,100,239,0.45);border:1px solid #a78bfa;color:#fff;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;">🚶 مشي</button>
          <button type="button" data-lobby-pose="run" onclick="ScoreARHostView.setLobbyHeroesPose('run')" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;">🏃 جري</button>
          <button type="button" data-lobby-pose="celebrate" onclick="ScoreARHostView.setLobbyHeroesPose('celebrate')" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;">🎉 احتفال</button>
          <button type="button" data-lobby-pose="fly" onclick="ScoreARHostView.setLobbyHeroesPose('fly')" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;">🚀 طيران</button>
          <button type="button" data-lobby-pose="idle" onclick="ScoreARHostView.setLobbyHeroesPose('idle')" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;cursor:pointer;">🧍 وقوف</button>
        </div>
      </div>`;
    attachLobbyAtlasLoaders(currentRoom);
  }

  function normalizeAvatarCode(raw) {
    if (!raw && raw !== 0) return 'char_01';
    const s = String(raw).trim();
    if (/^char_\d{2}$/.test(s)) return s;
    const n = parseInt(s.replace(/\D/g, ''), 10);
    return (!isNaN(n) && n >= 1 && n <= 20) ? ('char_' + String(n).padStart(2, '0')) : 'char_01';
  }

  function getHeroAssetUrls(rawAvatar) {
    const code = normalizeAvatarCode(rawAvatar);
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const prefix = origin ? (origin + '/') : '';
    return {
      code,
      idle: `${prefix}assets/characters/animated/${code}-idle.webp`,
      full: `${prefix}assets/characters/${code}.webp`,
      atlas: `${prefix}assets/characters/animated/${code}-atlas.webp`,
      runAtlas: `${prefix}assets/characters/animated/${code}-run.webp`,
      flyAtlas: `${prefix}assets/characters/animated/${code}-fly.webp`,
      climbAtlas: `${prefix}assets/characters/animated/${code}-climb.webp`,
      fallback: `${prefix}assets/characters/char_01.webp`
    };
  }

  function attachLobbyAtlasLoaders(currentRoom) {
    if (!currentRoom || !currentRoom.players) return;
    setTimeout(() => {
      currentRoom.players.forEach((p, idx) => {
        const slot = document.getElementById('hostHeroSlot_' + idx);
        if (!slot) return;
        const rawAvatar = p.avatarId || p.characterId || p.avatar || (p.player && (p.player.avatarId || p.player.characterId)) || 'char_01';
        const code = normalizeAvatarCode(rawAvatar);
        slot.setAttribute('data-char-code', code);
        slot.setAttribute('data-cur-pose', currentLobbyPose || 'walk');
        if (global.ScoreARMotionEngine && typeof global.ScoreARMotionEngine.mount === 'function') {
          global.ScoreARMotionEngine.mount(slot, code, currentLobbyPose || 'walk', { width: 140, height: 185 });
        }
      });
    }, 35);
  }

  function refreshLobbyUi(currentRoom) {
    if (!currentRoom) return;
    const arena = document.getElementById('hostCharactersArena');
    if (arena) arena.innerHTML = renderFullbodyCharactersHtml(currentRoom);
    const countEl = document.getElementById('hostPlayerCount'), countPill = document.getElementById('hostConnectedPlayersPill');
    if (countEl) countEl.textContent = currentRoom.players.length;
    if (countPill) countPill.textContent = currentRoom.players.length;
    const botCount = document.getElementById('hostBotCount');
    if (botCount) botCount.textContent = currentRoom.players.filter(p => p.isBot).length;
    if (currentRoom.mode || currentRoom.gameMode) updateLobbyModeBadge(currentRoom.gameMode || currentRoom.mode);
    attachLobbyAtlasLoaders(currentRoom);
  }

  function updateLobbyModeBadge(mode) {
    const btn = document.getElementById('hostGameModeBtn');
    const txt = document.getElementById('hostGameModeBtnText') || (btn ? btn.querySelector('span') : null);
    const modeBadgeText = mode === 'CARD_ARENA' ? '🃏 حرب الكروت' : (mode === 'SQUADS' ? '🛡️ مجموعات' : '👤 فردي');
    const modeBadgeBorder = mode === 'CARD_ARENA' ? '#f59e0b' : (mode === 'SQUADS' ? '#38bdf8' : '#8e64ef');
    if (txt) txt.textContent = modeBadgeText;
    if (btn) {
      btn.style.borderColor = modeBadgeBorder;
      btn.style.color = modeBadgeBorder;
    }
  }

  function renderFullbodyCharactersHtml(currentRoom) {
    if (!currentRoom || !currentRoom.players.length) {
      return `<div style="background:rgba(17,18,37,0.82);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.15);border-radius:24px;padding:22px 34px;text-align:center;pointer-events:auto;margin-bottom:50px;">
        <div style="font-size:40px;margin-bottom:6px;">⏳</div>
        <h3 style="color:#ffffff;font-size:19px;font-weight:900;margin:0 0 6px;">في انتظار انضمام الطلاب والأبطال...</h3>
        <p style="color:#b1a2e9;font-size:12px;margin:0 0 14px;">شارك رمز القاعة الموضح بالأعلى، أو أضف طلاباً تجريبيين للمنافسة</p>
        <button class="btn dark small" onclick="ScoreARBots ? ScoreARBots.openModal() : ScoreARQuizHost.addDemoPlayer()" style="margin:0 auto;display:inline-flex;">🤖 إضافة طلاب تجريبيين للقاعة</button>
      </div>`;
    }
    return currentRoom.players.map((p, idx) => {
      const isBot = Boolean(p.isBot || p.isDemo);
      const roleIcon = isBot ? '🤖' : p.isRegistered ? '✓' : '✨';
      const roleColor = p.isRegistered ? '#34d399' : isBot ? '#38bdf8' : '#fcd34d';
      const safeName = escapeHtml(p.name);
      const rawAvatar = p.avatarId || p.characterId || p.avatar || (p.player && (p.player.avatarId || p.player.characterId)) || 'char_01';
      const urls = getHeroAssetUrls(rawAvatar);
      const delAction = p.isBot ? `ScoreARBots && ScoreARBots.removeBot('${escapeHtml(p.id)}')` : `ScoreARQuizHost.kickPlayer('${escapeHtml(p.id)}')`;
      return `<div class="animate-enter-fullbody host-lobby-hero-slot" style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:auto;animation-delay:${idx*0.06}s;min-width:125px;">
        <div class="player-name-floating-pill" style="margin-bottom:10px;display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 6px;" title="${safeName}">
          <img src="${urls.idle}" onerror="this.onerror=null;this.src='${urls.full}';this.onerror=function(){this.src='${urls.fallback}';};" alt="" style="width:24px;height:24px;border-radius:50%;object-fit:contain;background:rgba(255,255,255,0.12);flex-shrink:0;">
          <span style="color:${roleColor};font-size:12px;">${roleIcon}</span>
          <span style="max-width:105px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;">${safeName}</span>
          <button onclick="${delAction}" style="background:none;border:0;color:#ef4444;font-size:12px;cursor:pointer;padding:0 0 0 3px;" title="حذف">✕</button>
        </div>
        <div class="host-lobby-hero-figure" onclick="ScoreARHostView.cycleSingleHeroPose(${idx})" style="cursor:pointer;position:relative;width:145px;height:215px;display:flex;align-items:flex-end;justify-content:center;" title="انقر لتغيير حركة البطل">
          <div style="position:absolute;bottom:2px;width:110px;height:18px;background:radial-gradient(ellipse at center, ${roleColor}66 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 75%);border-radius:50%;pointer-events:none;"></div>
          <span id="hostHeroSlot_${idx}" class="scorear-character host-lobby-hero-char character-${currentLobbyPose}" style="--character-atlas:url('${urls.atlas}');--character-action-atlas:url('${currentLobbyPose === 'fly' ? urls.flyAtlas : currentLobbyPose === 'climb' ? urls.climbAtlas : urls.runAtlas}');width:136px;height:182px;position:relative;display:flex;align-items:flex-end;justify-content:center;animation-delay:-${((idx * 0.37) % 1.05).toFixed(2)}s;transform-origin:bottom center;filter:drop-shadow(0 14px 22px rgba(0,0,0,0.65));">
            <img id="hostHeroImg_${idx}" class="host-hero-img" src="${urls.idle}" onerror="this.onerror=null;this.src='${urls.full}';this.onerror=function(){this.src='${urls.fallback}';};" alt="${safeName}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;">
            <span class="character-frames" aria-hidden="true"></span>
          </span>
        </div>
      </div>`;
    }).join('');
  }

  function renderHostQuestionView(stage, phase, qData, currentQIndex, total, worldId, timeRemaining, readingTimeRemaining) {
    const activeGameMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function') ? global.ScoreARGameModes.getMode() : 'SOLO';
    const isReading = (phase === 'reading'), opts = qData.options || qData.opts || [];
    const questionText = qData.text || qData.q || '';
    const imgUrl = qData.imageUrl || qData.img || null;

    const wid = String(worldId || 'royal').trim() || 'royal';
    stage.innerHTML = `
      <div style="position:fixed;inset:0;overflow:hidden;z-index:0;background:url('assets/worlds/${wid}/question.jpg') center/cover no-repeat;pointer-events:none;">
        <img src="assets/worlds/${wid}/question.jpg" alt="" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/worlds/${wid}/lobby.jpg';}else{this.style.display='none';}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.88) saturate(1.1);">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 42%, rgba(12,13,30,0.14) 0%, rgba(12,13,30,0.52) 100%);"></div>
      </div>
      <header class="host-question-header" style="position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:12px 28px;background:rgba(12,13,30,0.72);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.12);">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <button onclick="ScoreARQuizHost.closeHostSession()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:6px 12px;border-radius:8px;font-weight:800;font-size:11px;cursor:pointer;">✕ إنهاء</button>
          <button class="scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" style="background:rgba(12,13,30,0.72);border:1px solid rgba(82,217,237,0.45);color:#52d9ed;padding:6px 12px;border-radius:8px;font-weight:800;font-size:11px;cursor:pointer;">🔊 الصوت: يعمل</button>
          <span style="background:rgba(117,80,239,0.3);border:1px solid #8e64ef;color:#d8b4fe;padding:4px 12px;border-radius:10px;font-size:12px;font-weight:900;">${escapeHtml(qData.skill || 'سؤال')}</span>
          <span style="font-size:14px;color:#fff;font-weight:900;">السؤال ${currentQIndex + 1} من ${total}</span>
          ${(qData.isDouble || qData.multiplier === 2) ? `<span style="background:linear-gradient(135deg, #f59e0b, #d97706);color:#fff;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:900;box-shadow:0 0 12px rgba(245,158,11,0.5);">⚡ نقاط ×2</span>` : ''}
          ${activeGameMode === 'CARD_ARENA' ? `<span style="background:rgba(245,158,11,0.22);border:1.5px solid #f59e0b;color:#fcd34d;padding:4px 12px;border-radius:10px;font-size:12px;font-weight:900;display:inline-flex;align-items:center;gap:6px;"><span>🃏 حرب الكروت نشطة</span><button onclick="ScoreARCardArena&&ScoreARCardArena.simulateCardAction&&ScoreARCardArena.simulateCardAction()" style="background:#f59e0b;color:#000;border:none;border-radius:6px;padding:2px 8px;font-size:10px;font-weight:900;cursor:pointer;" title="محاكاة سريعة لإطلاق كارت بالقاعة">تجربة كارت ⚡</button></span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div id="hostLiveAnswerStats" style="display:${isReading ? 'none' : 'flex'};align-items:center;gap:8px;background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.15);padding:6px 16px;border-radius:14px;font-size:13px;font-weight:800;color:#fff;">
            <span>أجاب:</span>
            <b id="hostAnsweredCount" style="color:#38bdf8;font-size:18px;font-family:monospace;">0</b>
            <span style="color:#94a3b8;">/</span>
            <b id="hostTotalStudentsCount" style="color:#fff;font-size:16px;font-family:monospace;">0</b>
          </div>
          <button onclick="ScoreARQuizHost.finishCurrentQuestion()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:6px 14px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;">تخطي ⏭</button>
        </div>
      </header>
      <main id="hostQuestionArena" class="host-question-arena" style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:${isReading ? 'center' : 'flex-start'};align-items:center;padding:16px 36px 24px;gap:14px;min-height:calc(100vh - 85px);">
        <div id="hostQuestionCard" class="host-question-card" style="background:rgba(18,20,44,0.82);backdrop-filter:blur(18px);border:2px solid rgba(142,100,239,0.45);border-radius:${isReading ? '28px' : '20px'};padding:${isReading ? '40px 48px' : '14px 28px'};text-align:center;box-shadow:${isReading ? '0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(117,80,239,0.35)' : '0 10px 30px rgba(0,0,0,0.4)'};margin:${isReading ? '40px auto 20px auto' : '0 auto 8px auto'};max-width:${isReading ? '1020px' : '960px'};width:100%;transition:all 0.75s cubic-bezier(0.16, 1, 0.3, 1);">
          <h2 id="hostQuestionText" style="font-size:${isReading ? '36px' : '22px'};font-weight:900;color:#ffffff;line-height:1.45;margin:0 0 ${isReading ? '14px' : '6px'} 0;transition:all 0.75s cubic-bezier(0.16, 1, 0.3, 1);text-shadow:0 4px 18px rgba(0,0,0,0.8);">${escapeHtml(questionText)}</h2>
          ${imgUrl ? `
            <div id="hostQuestionImgBox" style="display:flex;justify-content:center;margin:8px 0;max-height:${isReading ? '240px' : '140px'};transition:max-height 0.75s ease;">
              <img src="${imgUrl}" alt="${escapeHtml(qData.imageAlt || '')}" style="max-height:100%;max-width:100%;object-fit:contain;border-radius:12px;border:1px solid rgba(255,255,255,0.2);box-shadow:0 8px 24px rgba(0,0,0,0.5);">
            </div>
          ` : ''}
        </div>

        <div id="hostReadingCountdownArea" style="display:${isReading ? 'flex' : 'none'};flex-direction:column;align-items:center;justify-content:center;gap:18px;margin-bottom:30px;transition:opacity 0.4s ease, transform 0.4s ease;">
          <div style="position:relative;width:130px;height:130px;display:flex;align-items:center;justify-content:center;">
            <svg width="130" height="130" style="transform:rotate(-90deg);">
              <circle cx="65" cy="65" r="50" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none"/>
              <circle id="hostReadingProgressCircle" cx="65" cy="65" r="50" stroke="#f59e0b" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="314.16" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;"/>
            </svg>
            <div id="hostReadingCountdownNum" style="position:absolute;font-size:42px;font-weight:900;color:#fcd34d;font-family:monospace;">${readingTimeRemaining}</div>
          </div>
          <div style="background:rgba(245,158,11,0.2);border:2px solid #f59e0b;padding:12px 32px;border-radius:18px;color:#fcd34d;font-size:16px;font-weight:900;box-shadow:0 0 30px rgba(245,158,11,0.3);">
            📖 مرحلة قراءة وفهم السؤال (تفتح الخيارات تلقائياً بعد انتهاء العد)
          </div>
        </div>

        <div id="hostTimerArea" style="display:${isReading ? 'none' : 'flex'};align-items:center;justify-content:center;margin:2px 0;">
          ${renderWorldTimerHtml(worldId, timeRemaining)}
        </div>

        <div id="hostOptionsGrid" class="host-options-grid" style="display:${isReading ? 'none' : 'grid'};grid-template-columns:1fr 1fr;gap:14px;max-width:960px;margin:0 auto;width:100%;">
          ${opts.slice(0, 4).map((optText, idx) => {
            const theme = OPTION_THEMES[idx % 4];
            return `
              <div id="hostOptionCard_${idx}" class="host-option-card" style="background:${theme.bg};border:2px solid ${theme.border};border-radius:18px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,0.3);min-height:76px;transition:all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);position:relative;animation:optionEntranceSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;animation-delay:${idx * 0.08}s;">
                <div style="display:flex;align-items:center;gap:14px;">
                  <span style="font-size:24px;color:#ffffff;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">${theme.shape}</span>
                  <span id="hostOptionText_${idx}" style="font-size:17px;font-weight:900;color:#ffffff;line-height:1.35;">${escapeHtml(optText)}</span>
                </div>
                <div id="hostOptionCountBadge_${idx}" style="display:none;background:rgba(0,0,0,0.45);backdrop-filter:blur(8px);border:1.5px solid rgba(255,255,255,0.3);border-radius:12px;padding:4px 12px;font-size:15px;font-weight:900;color:#fff;">0</div>
              </div>
            `;
          }).join('')}
        </div>
      </main>`;
  }

  function animateToAnswering(stage, qData, currentQIndex, total, worldId, timeRemaining) {
    const card = document.getElementById('hostQuestionCard');
    const textEl = document.getElementById('hostQuestionText');
    const readingArea = document.getElementById('hostReadingCountdownArea');
    const arena = document.getElementById('hostQuestionArena');
    const timerArea = document.getElementById('hostTimerArea');
    const optionsGrid = document.getElementById('hostOptionsGrid');
    const liveStats = document.getElementById('hostLiveAnswerStats');

    if (!card || !readingArea || !timerArea || !optionsGrid) {
      renderHostQuestionView(stage, 'answering', qData, currentQIndex, total, worldId, timeRemaining, 0);
      return;
    }

    // 1. Motion graphic: smoothly fade & scale away reading cue
    readingArea.style.opacity = '0';
    readingArea.style.transform = 'scale(0.85)';
    setTimeout(() => { readingArea.style.display = 'none'; }, 220);

    // 2. Adjust arena alignment
    if (arena) {
      arena.style.justifyContent = 'flex-start';
    }

    // 3. Question card glides smoothly to top with reduced font and padding
    card.style.margin = '0 auto 8px auto';
    card.style.padding = '14px 28px';
    card.style.maxWidth = '960px';
    card.style.borderRadius = '20px';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
    if (textEl) {
      textEl.style.fontSize = '22px';
      textEl.style.marginBottom = '6px';
    }

    // 4. Image box adapts
    const imgBox = document.getElementById('hostQuestionImgBox');
    if (imgBox) imgBox.style.maxHeight = '140px';

    // 5. Show modern world timer
    timerArea.innerHTML = renderWorldTimerHtml(worldId, timeRemaining);
    timerArea.style.display = 'flex';
    timerArea.style.animation = 'optionEntranceSlide 0.5s ease both';

    // 6. Show live stats
    if (liveStats) liveStats.style.display = 'flex';

    // 7. Reveal options grid with staggered motion entrance
    optionsGrid.style.display = 'grid';
    const opts = qData.options || qData.opts || [];
    opts.slice(0, 4).forEach((_, idx) => {
      const optCard = document.getElementById(`hostOptionCard_${idx}`);
      if (optCard) {
        optCard.style.animation = 'none';
        void optCard.offsetWidth; // trigger reflow
        optCard.style.animation = `optionEntranceSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) both ${idx * 0.08}s`;
      }
    });
  }


  function renderQuestionResultBarChart(qData, counts, correctIndices, fastest, explanation) {
    const timerArea = document.getElementById('hostTimerArea');
    if (!timerArea) return;
    const totalAns = counts.reduce((a, b) => a + b, 0) || 1;
    const maxCount = Math.max(1, ...counts);

    timerArea.style.display = 'flex';
    timerArea.style.width = '100%';
    timerArea.innerHTML = `
      <div style="width:100%;max-width:960px;margin:0 auto;background:rgba(13,15,34,0.92);backdrop-filter:blur(18px);border:2px solid rgba(142,100,239,0.45);border-radius:24px;padding:18px 26px;box-shadow:0 20px 55px rgba(0,0,0,0.65);animation:optionEntranceSlide 0.45s cubic-bezier(0.16,1,0.3,1) both;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:10px;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:12.5px;font-weight:900;padding:5px 14px;border-radius:999px;box-shadow:0 0 18px rgba(16,185,129,0.5);">📊 إحصائية الإجابات الحية</span>
            ${fastest ? `<span style="background:rgba(245,158,11,0.2);border:1.5px solid #f59e0b;color:#fcd34d;font-size:12.5px;font-weight:900;padding:4px 14px;border-radius:999px;">⚡ أسرع إجابة صحيحة: <b>${escapeHtml(fastest.name)}</b> (${fastest.timeSec}ث)</span>` : `<span style="color:#94a3b8;font-size:12px;font-weight:700;">انتهى وقت السؤال</span>`}
          </div>
          <button type="button" onclick="ScoreARQuizHost.renderHostLeaderboard()" style="background:linear-gradient(135deg,#7550ef,#9665ff);border:1.5px solid #c4b5fd;color:#fff;padding:8px 22px;border-radius:12px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(117,80,239,0.55);display:inline-flex;align-items:center;gap:8px;">
            <span>التالي: مضمار المتصدرين</span>
            <span>➔</span>
          </button>
        </div>

        <!-- Kahoot 4-Column Bar Chart -->
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:18px;align-items:end;height:155px;padding:12px 24px 0;direction:rtl;">
          ${[0, 1, 2, 3].map(i => {
            const theme = OPTION_THEMES[i % 4];
            const count = counts[i] || 0;
            const isCorrect = correctIndices.includes(i);
            const heightPx = count > 0 ? Math.max(28, Math.round((count / maxCount) * 105)) : 14;
            const pct = Math.round((count / totalAns) * 100);
            return `
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;font-size:16px;font-weight:900;color:${isCorrect ? '#34d399' : '#ffffff'};">
                  ${isCorrect ? '<span style="background:#10b981;color:#fff;width:22px;height:22px;border-radius:50%;display:inline-grid;place-items:center;font-size:13px;box-shadow:0 0 12px #10b981;">✓</span>' : ''}
                  <span>${count}</span>
                  <small style="font-size:11px;color:#94a3b8;font-weight:700;">(${pct}%)</small>
                </div>
                <div style="width:100%;max-width:96px;height:${heightPx}px;background:${theme.bg};border:2.5px solid ${isCorrect ? '#34d399' : theme.border};border-radius:14px 14px 6px 6px;box-shadow:${isCorrect ? '0 0 28px rgba(16,185,129,0.75)' : '0 6px 16px rgba(0,0,0,0.4)'};display:flex;align-items:center;justify-content:center;transition:height 0.7s cubic-bezier(0.34,1.56,0.64,1);opacity:${isCorrect ? '1' : '0.55'};">
                  <span style="font-size:20px;color:#fff;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">${theme.shape}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${explanation ? `
          <div style="margin-top:12px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.4);border-radius:12px;padding:8px 14px;font-size:13px;color:#d1fae5;text-align:right;">
            💡 <b>التفسير والقاعدة:</b> ${escapeHtml(explanation)}
          </div>
        ` : ''}
      </div>
    `;
  }

  const ScoreARQuizHostView = {
    setLobbyHeroesPose,
    cycleSingleHeroPose,
    toggleQrZoom,
    renderQuestionResultBarChart,
    setLobbyHeroesPose,
    cycleSingleHeroPose,
    renderHostLobby,
    refreshLobbyUi,
    updateLobbyModeBadge,
    renderFullbodyCharactersHtml,
    renderHostQuestionView,
    renderWorldTimerHtml,
    animateToAnswering,
    WORLD_TIMER_CONFIGS
  };

  global.ScoreARQuizHostView = ScoreARQuizHostView;
  global.ScoreARHostView = ScoreARQuizHostView;
  global.ScoreARHostView = ScoreARQuizHostView;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARQuizHostView = ScoreARQuizHostView; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARQuizHostView;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));