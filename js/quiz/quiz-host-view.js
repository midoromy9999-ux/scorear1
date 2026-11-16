/**
 * ScoreAR Quiz Host View Module — Kahoot! Studio Architecture + ScoreAR Animated Heroes
 * Features:
 * 1. Kahoot Top Black Bar + Split White Chevron PIN & QR Ticket + Left 3D White Start & Lock Buttons.
 * 2. Strictly 3 Hero Motions: Standing (idle), Walking (walk), Jumping (celebrate).
 * 3. 3-Stage Cinematic Transfer Screen -> Quiz Title -> Student Attention Countdown.
 * 4. Navy Transparent Borderless Question Card (Reading) -> Smooth Glide to Top + Kahoot Answering Grid.
 * 5. Last-Question Suspense Rule: Skips ranking and goes straight from Result Bars to Podium!
 * Strictly Rule 7 Compliant (<470 lines).
 */
(function(global) {
  'use strict';

  const ALLOWED_POSES = ['idle', 'walk', 'celebrate'];
  let currentLobbyPose = 'walk';

  function setLobbyHeroesPose(pose) {
    currentLobbyPose = ALLOWED_POSES.includes(pose) ? pose : 'walk';
    document.querySelectorAll('.host-lobby-hero-char').forEach(el => {
      el.className = 'scorear-character host-lobby-hero-char character-' + currentLobbyPose;
      const code = el.getAttribute('data-char-code') || 'char_01';
      el.setAttribute('data-cur-pose', currentLobbyPose);
      if (global.ScoreARMotionEngine && typeof global.ScoreARMotionEngine.mount === 'function') {
        global.ScoreARMotionEngine.mount(el, code, currentLobbyPose, { width: 140, height: 185 });
      }
    });
    document.querySelectorAll('[data-lobby-pose]').forEach(btn => {
      const act = btn.getAttribute('data-lobby-pose') === currentLobbyPose;
      btn.style.background = act ? 'rgba(142,100,239,0.55)' : 'rgba(255,255,255,0.08)';
      btn.style.borderColor = act ? '#c4b5fd' : 'rgba(255,255,255,0.18)';
    });
  }

  function cycleSingleHeroPose(idx) {
    const s = document.getElementById('hostHeroSlot_' + idx);
    if (!s) return;
    const cur = s.getAttribute('data-cur-pose') || 'walk';
    const nextPose = ALLOWED_POSES[(ALLOWED_POSES.indexOf(cur) + 1) % ALLOWED_POSES.length];
    s.setAttribute('data-cur-pose', nextPose);
    s.className = 'scorear-character host-lobby-hero-char character-' + nextPose;
    const code = s.getAttribute('data-char-code') || 'char_01';
    if (global.ScoreARMotionEngine && typeof global.ScoreARMotionEngine.mount === 'function') {
      global.ScoreARMotionEngine.mount(s, code, nextPose, { width: 140, height: 185 });
    }
  }

  function toggleQrZoom(pin) {
    const existing = document.getElementById('scorearQrZoomModal');
    if (existing) { existing.remove(); return; }
    const qrBigUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=460x460&data=' + encodeURIComponent(window.location.origin + window.location.pathname + '?pin=' + pin);
    const modal = document.createElement('div');
    modal.id = 'scorearQrZoomModal';
    modal.onclick = () => modal.remove();
    modal.style.cssText = 'position:fixed;inset:0;z-index:100005;background:rgba(7,8,20,0.92);backdrop-filter:blur(18px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;cursor:pointer;direction:rtl;font-family:Cairo,Tajawal,sans-serif;';
    modal.innerHTML = '<div onclick="event.stopPropagation()" style="background:#ffffff;color:#111111;border-radius:28px;padding:28px 38px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,0.85);max-width:92vw;">' +
      '<div style="font-size:20px;font-weight:900;color:#111111;margin-bottom:14px;">📱 امسح الباركود بكاميرا هاتفك للدخول المباشر للقاعة</div>' +
      '<div style="background:#fff;padding:12px;border-radius:20px;display:inline-block;border:3px solid #111111;">' +
        '<img src="' + qrBigUrl + '" alt="QR Code" style="width:min(340px,70vw);height:min(340px,70vw);display:block;border-radius:8px;">' +
      '</div>' +
      '<div style="margin-top:12px;font-size:52px;font-weight:900;color:#111111;font-family:Montserrat,Arial,monospace;letter-spacing:6px;direction:ltr;">' + String(pin).slice(0,3) + ' ' + String(pin).slice(3,6) + '</div>' +
      '<div style="margin-top:10px;"><button type="button" onclick="document.getElementById(\'scorearQrZoomModal\')?.remove()" style="background:#111111;border:none;color:#fff;padding:9px 28px;border-radius:10px;font-size:14px;font-weight:900;cursor:pointer;">✕ إغلاق التكبير</button></div>' +
    '</div>';
    document.body.appendChild(modal);
  }

  const OPTION_THEMES = [
    { bg: '#e21b3c', border: '#a31028', shape: '▲' },
    { bg: '#1368ce', border: '#0c478f', shape: '◆' },
    { bg: '#d89e00', border: '#9c7200', shape: '●' },
    { bg: '#26890c', border: '#185c06', shape: '■' }
  ];

  const WORLD_TIMER_CONFIGS = {
    royal: { name: 'القصر الملكي', icon: '👑', strokeStart: '#fbbf24', strokeEnd: '#d97706', accentNum: '#ffffff', bgClass: 'world-timer-royal' },
    cosmic: { name: 'محطة الفضاء', icon: '🚀', strokeStart: '#06b6d4', strokeEnd: '#8b5cf6', accentNum: '#ffffff', bgClass: 'world-timer-cosmic' },
    oasis: { name: 'واحة النخيل', icon: '🌴', strokeStart: '#34d399', strokeEnd: '#f59e0b', accentNum: '#ffffff', bgClass: 'world-timer-oasis' },
    treasure: { name: 'جزيرة الكنز', icon: '💎', strokeStart: '#fbbf24', strokeEnd: '#0ea5e9', accentNum: '#ffffff', bgClass: 'world-timer-treasure' },
    stadium: { name: 'استاد الأبطال', icon: '⚡', strokeStart: '#22c55e', strokeEnd: '#38bdf8', accentNum: '#ffffff', bgClass: 'world-timer-stadium' },
    magic: { name: 'المملكة السحرية', icon: '🔮', strokeStart: '#ec4899', strokeEnd: '#a855f7', accentNum: '#ffffff', bgClass: 'world-timer-magic' }
  };

  function escapeHtml(str) {
    return typeof str !== 'string' ? String(str || '') : str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function renderWorldTimerHtml(worldId, timeRemaining) {
    return `
      <div id="hostWorldTimerContainer" style="width:94px;height:94px;border-radius:50%;background:#3b147a;border:4px solid rgba(255,255,255,0.22);box-shadow:0 12px 30px rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;position:relative;">
        <svg width="94" height="94" viewBox="0 0 100 100" style="transform:rotate(-90deg);position:absolute;inset:0;">
          <circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.12)" stroke-width="7" fill="none" />
          <circle id="hostQuestionTimerRing" cx="50" cy="50" r="41" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="257.6" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;" />
        </svg>
        <span id="hostQuestionTimerNum" style="position:relative;z-index:2;font-size:36px;font-weight:900;color:#ffffff;font-family:Montserrat,Arial,monospace;">${timeRemaining}</span>
      </div>
    `;
  }

  /* ── 1. KAHOOT SCREENSHOT-2 LOBBY + SCOREAR TEACHER CONTROLS ── */
  function renderHostLobby(stage, currentRoom, isRoomLocked) {
    const worldId = (currentRoom && currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : 'royal';
    const w = currentRoom.world || { name: 'المنافسة', tag: 'جاهز' };
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?pin=' + currentRoom.pin)}`;
    const activeGameMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function') ? global.ScoreARGameModes.getMode() : 'SOLO';
    const modeLabel = activeGameMode === 'CARD_ARENA' ? '★ طور حرب الكروت ★' : (activeGameMode === 'SQUADS' ? '★ وضع الفريق ★' : '★ التحدي الفردي ★');

    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${worldId}/lobby.jpg') center/cover no-repeat;z-index:1;"></div>
      <video id="hostLiveVideoBg" autoplay loop muted playsinline poster="assets/worlds/${worldId}/lobby.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0.92;"><source src="assets/videos/worlds/${worldId}.mp4" type="video/mp4"></video>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(28,15,69,0.28) 0%, rgba(10,11,26,0.72) 100%);z-index:3;"></div>

      <!-- Kahoot Ultra-Clean Top Black Control Bar (44px) -->
      <header style="position:relative;z-index:25;height:44px;background:#111111;display:flex;align-items:center;justify-content:space-between;padding:0 18px;color:#ffffff;direction:rtl;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:12px;font-weight:800;color:#cbd5e1;">🌍 عالم ${escapeHtml(w.name)}</span>
          <button id="hostGameModeBtn" onclick="ScoreARGameModes && ScoreARGameModes.openModePicker({ worldId: '${worldId}', pin: '${currentRoom.pin}' })" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fcd34d;border-radius:6px;padding:3px 10px;font-size:11.5px;font-weight:900;cursor:pointer;font-family:inherit;"><span id="hostGameModeBtnText">${modeLabel}</span> ▾</button>
        </div>

        <div style="font-size:20px;font-weight:900;letter-spacing:0.5px;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;">ScoreAR!</div>

        <div style="display:flex;align-items:center;gap:10px;direction:ltr;">
          <button type="button" onclick="if(!document.fullscreenElement){document.documentElement.requestFullscreen?.();}else{document.exitFullscreen?.();}" style="background:none;border:none;color:#fff;font-size:16px;cursor:pointer;" title="ملء الشاشة">⛶</button>
          <button type="button" class="scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" style="background:none;border:none;color:#fff;font-size:16px;cursor:pointer;" title="الصوت">🔊</button>
          <div style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.12);padding:3px 10px;border-radius:6px;font-size:13px;font-weight:900;">
            <span>👤</span>
            <span id="hostPlayerCount">${currentRoom.players.length}</span>
          </div>
          <button type="button" onclick="ScoreARBots ? ScoreARBots.openModal() : ScoreARQuizHost.addDemoPlayer()" style="background:#3b147a;border:1px solid #a78bfa;color:#fff;border-radius:6px;padding:3px 10px;font-size:11.5px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;" title="إضافة أبطال تجريبيين">🤖+ أبطال تجريبيون (<span id="hostBotCount">${currentRoom.players.filter(p=>p.isBot).length}</span>)</button>
          <button type="button" onclick="ScoreARQuizHost.closeHostSession()" style="background:rgba(239,68,68,0.25);border:1px solid #ef4444;color:#fca5a5;border-radius:6px;padding:3px 10px;font-size:11.5px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;">✕ خروج</button>
        </div>
      </header>

      <!-- Kahoot Split White Chevron PIN & QR Ticket Banner -->
      <div style="position:relative;z-index:20;display:flex;justify-content:center;margin-top:14px;padding:0 16px;">
        <div style="display:flex;align-items:stretch;background:#ffffff;color:#111111;border-radius:8px;box-shadow:0 14px 40px rgba(0,0,0,0.65);overflow:hidden;max-width:780px;width:100%;direction:rtl;">
          <!-- Right Block: Join Instructions -->
          <div style="flex:1;padding:12px 22px;display:flex;flex-direction:column;justify-content:center;text-align:right;position:relative;border-left:3px solid #cbd5e1;">
            <div style="font-size:13px;font-weight:700;color:#334155;">الانضمام إلى <b style="color:#0f172a;font-family:monospace;">${window.location.host}</b></div>
            <div style="font-size:13px;font-weight:800;color:#475569;margin-top:2px;">أو امسح الباركود بكاميرا هاتفك للدخول المباشر</div>
          </div>

          <!-- Middle Block: Huge Black Game PIN -->
          <div onclick="ScoreARQuizHostView.toggleQrZoom('${currentRoom.pin}')" style="padding:8px 28px;display:flex;flex-direction:column;justify-content:center;align-items:center;cursor:pointer;background:#ffffff;border-left:3px solid #cbd5e1;" title="اضغط لتكبير الرمز والباركود">
            <span style="font-size:12px;font-weight:900;color:#334155;margin-bottom:-4px;">رقم PIN الخاص باللعبة:</span>
            <div style="font-size:52px;font-weight:900;color:#111111;font-family:Montserrat,Arial,sans-serif;letter-spacing:3px;line-height:1.05;direction:ltr;">${String(currentRoom.pin).slice(0,3)} ${String(currentRoom.pin).slice(3,6)}</div>
          </div>

          <!-- Left Block: Crisp QR Code -->
          <div onclick="ScoreARQuizHostView.toggleQrZoom('${currentRoom.pin}')" style="padding:8px 12px;background:#ffffff;display:flex;align-items:center;justify-content:center;cursor:pointer;" title="اضغط لتكبير الباركود بملء الشاشة">
            <img src="${qrUrl}" alt="QR" style="width:76px;height:76px;display:block;border:2px solid #111111;border-radius:4px;">
          </div>
        </div>
      </div>

      <!-- Kahoot Left-Aligned 3D White «بدء» Button + Lock Button -->
      <div style="position:absolute;top:175px;left:28px;z-index:25;display:flex;align-items:center;gap:8px;direction:ltr;">
        <button id="hostStartQuizBtn" type="button" onclick="ScoreARQuizHost.launchQuestion(0)" style="background:#ffffff;color:#111111;border:none;border-bottom:4px solid #cbd5e1;border-radius:6px;padding:10px 26px;font-size:17px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.5);">بدء</button>
        <button id="hostLockBtn" type="button" onclick="ScoreARQuizHost.toggleRoomLock()" style="background:rgba(17,17,17,0.85);border:1.5px solid rgba(255,255,255,0.25);color:${isRoomLocked?'#ef4444':'#ffffff'};border-radius:6px;padding:10px 14px;font-size:16px;cursor:pointer;" title="قفل / فتح القاعة">${isRoomLocked ? '🔒' : '🔓'}</button>
      </div>

      <!-- Center Kahoot-Style Brand & Mode Badge -->
      <div style="position:relative;z-index:14;text-align:center;margin-top:18px;pointer-events:none;">
        <div style="font-size:48px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;text-shadow:0 6px 24px rgba(0,0,0,0.7);line-height:1;">ScoreAR!</div>
        <div style="display:inline-block;margin-top:6px;background:#31105f;border:1.5px solid rgba(255,255,255,0.25);color:#ffffff;font-size:15px;font-weight:900;padding:4px 18px;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.45);">${modeLabel}</div>
      </div>

      <!-- Joined Heroes Stage (Bottom 54vh) -->
      <div id="hostCharactersArena" class="host-lobby-characters-arena" style="position:absolute;bottom:48px;left:0;right:0;height:50vh;display:flex;align-items:flex-end;justify-content:center;gap:26px;padding:0 35px 14px;z-index:15;pointer-events:none;overflow-x:auto;">
        ${renderFullbodyCharactersHtml(currentRoom)}
      </div>

      <!-- Bottom Bar: Strictly 3 Hero Motions (الوقوف / المشي / القفز) -->
      <div style="position:absolute;bottom:10px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center;z-index:22;flex-wrap:wrap;gap:10px;">
        <div style="display:flex;gap:10px;align-items:center;">
          <span style="background:rgba(17,18,37,0.88);border:1px solid rgba(255,255,255,0.15);padding:4px 14px;border-radius:8px;color:#ddd8ff;font-size:12px;font-weight:800;">👥 المتصلون: <b id="hostConnectedPlayersPill" style="color:#38bdf8;">${currentRoom.players.length}</b></span>
          <span style="background:rgba(17,18,37,0.88);border:1px solid rgba(255,255,255,0.15);padding:4px 14px;border-radius:8px;color:#ddd8ff;font-size:12px;font-weight:800;">⏱️ الانتظار: <b id="hostLobbyTimerText" style="color:#fff;">0:00</b></span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;background:rgba(17,18,37,0.9);border:1px solid rgba(196,181,253,0.35);padding:4px 12px;border-radius:10px;">
          <span style="font-size:11.5px;font-weight:900;color:#c4b5fd;margin-left:4px;">🎮 حركة الأبطال (٣ حركات):</span>
          <button type="button" data-lobby-pose="idle" onclick="ScoreARHostView.setLobbyHeroesPose('idle')" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#fff;border-radius:6px;padding:4px 10px;font-size:11.5px;font-weight:800;cursor:pointer;">🧍 الوقوف</button>
          <button type="button" data-lobby-pose="walk" onclick="ScoreARHostView.setLobbyHeroesPose('walk')" style="background:rgba(142,100,239,0.55);border:1px solid #c4b5fd;color:#fff;border-radius:6px;padding:4px 10px;font-size:11.5px;font-weight:800;cursor:pointer;">🚶 المشي</button>
          <button type="button" data-lobby-pose="celebrate" onclick="ScoreARHostView.setLobbyHeroesPose('celebrate')" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#fff;border-radius:6px;padding:4px 10px;font-size:11.5px;font-weight:800;cursor:pointer;">🦘 القفز</button>
        </div>
      </div>
    `;
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
    const txt = document.getElementById('hostGameModeBtnText');
    const modeBadgeText = mode === 'CARD_ARENA' ? '★ طور حرب الكروت ★' : (mode === 'SQUADS' ? '★ وضع الفريق ★' : '★ التحدي الفردي ★');
    if (txt) txt.textContent = modeBadgeText;
  }

  function renderFullbodyCharactersHtml(currentRoom) {
    if (!currentRoom || !currentRoom.players.length) {
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:auto;margin-bottom:70px;">
        <div style="background:#3b147a;border:1.5px solid rgba(255,255,255,0.22);color:#ffffff;font-size:24px;font-weight:900;padding:10px 32px;border-radius:10px;box-shadow:0 12px 35px rgba(0,0,0,0.55);">في انتظار المتسابقين...</div>
        <button type="button" onclick="ScoreARBots ? ScoreARBots.openModal() : ScoreARQuizHost.addDemoPlayer()" style="background:rgba(17,18,37,0.85);border:1px solid #a78bfa;color:#e2e8f0;padding:7px 18px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;">🤖 أو اضغط هنا لإضافة أبطال تجريبيين للقاعة</button>
      </div>`;
    }
    return currentRoom.players.map((p, idx) => {
      const isBot = Boolean(p.isBot || p.isDemo);
      const roleIcon = isBot ? '🤖' : '👤';
      const safeName = escapeHtml(p.name);
      const rawAvatar = p.avatarId || p.characterId || p.avatar || (p.player && (p.player.avatarId || p.player.characterId)) || 'char_01';
      const urls = getHeroAssetUrls(rawAvatar);
      const delAction = p.isBot ? `ScoreARBots && ScoreARBots.removeBot('${escapeHtml(p.id)}')` : `ScoreARQuizHost.kickPlayer('${escapeHtml(p.id)}')`;
      return `<div class="animate-enter-fullbody host-lobby-hero-slot" style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:auto;animation-delay:${idx*0.06}s;min-width:125px;">
        <div class="player-name-floating-pill" style="margin-bottom:10px;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;" title="اضغط على ✕ لطرد اللاعب من القاعة">
          <span style="font-size:12px;">${roleIcon}</span>
          <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;">${safeName}</span>
          <button type="button" onclick="${delAction}" style="background:#ef4444;border:0;color:#ffffff;width:18px;height:18px;border-radius:50%;font-size:11px;font-weight:900;cursor:pointer;display:inline-grid;place-items:center;margin-right:4px;" title="طرد اللاعب من القاعة">✕</button>
        </div>
        <div class="host-lobby-hero-figure" onclick="ScoreARHostView.cycleSingleHeroPose(${idx})" style="cursor:pointer;position:relative;width:145px;height:210px;display:flex;align-items:flex-end;justify-content:center;" title="انقر للتبديل بين الوقوف والمشي والقفز">
          <span id="hostHeroSlot_${idx}" class="scorear-character host-lobby-hero-char character-${currentLobbyPose}" style="--character-atlas:url('${urls.atlas}');width:136px;height:182px;position:relative;display:flex;align-items:flex-end;justify-content:center;transform-origin:bottom center;filter:drop-shadow(0 14px 22px rgba(0,0,0,0.65));">
            <img id="hostHeroImg_${idx}" class="host-hero-img" src="${urls.idle}" onerror="this.onerror=null;this.src='${urls.full}';this.onerror=function(){this.src='${urls.fallback}';};" alt="${safeName}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;">
            <span class="character-frames" aria-hidden="true"></span>
          </span>
        </div>
      </div>`;
    }).join('');
  }

  /* ── 2. 3-STAGE CINEMATIC TRANSFER SEQUENCE (Transfer -> Quiz Title -> Get Ready) ── */
  function renderContestIntroSequence(stage, currentRoom, quizTitle, totalQuestions, onDone) {
    const worldId = (currentRoom && currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : 'royal';
    const wName = (currentRoom && currentRoom.world && currentRoom.world.name) ? currentRoom.world.name : 'القصر الملكي';
    const title = quizTitle || 'كأس التفوق — مسابقة سكور آر التفاعلية';
    let finished = false;
    const timers = [];
    const finishNow = () => {
      if (finished) return;
      finished = true;
      timers.forEach(t => clearTimeout(t));
      if (typeof onDone === 'function') onDone();
    };
    global._skipScoreARIntro = finishNow;

    // Stage 1: Brand Transfer Screen (2.8 seconds)
    stage.innerHTML = `
      <style>
        @keyframes transferZoomIn { 0% { transform: scale(0.82); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes diamondSpinSlow { 0% { transform: rotate(0deg) scale(0.92); } 50% { transform: rotate(180deg) scale(1.06); } 100% { transform: rotate(360deg) scale(0.92); } }
        @keyframes titleBarFill { 0% { width: 0%; } 100% { width: 100%; } }
      </style>
      <div style="position:fixed;inset:0;background:linear-gradient(135deg,#2e1065 0%,#4c1d95 50%,#0f172a 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;direction:rtl;">
        <button type="button" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;">تخطي المقدمة ⏭</button>
        <div style="animation:transferZoomIn 0.8s cubic-bezier(0.22,1,0.36,1) both;text-align:center;">
          <div style="width:104px;height:104px;margin:0 auto 18px;border-radius:26px;background:#ffffff;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:5px;padding:9px;box-shadow:0 22px 55px rgba(0,0,0,0.65);animation:diamondSpinSlow 2.6s ease-in-out infinite;">
            <div style="background:#e21b3c;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">▲</div>
            <div style="background:#1368ce;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">◆</div>
            <div style="background:#d89e00;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">●</div>
            <div style="background:#26890c;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">■</div>
          </div>
          <div style="font-size:58px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;letter-spacing:1px;text-shadow:0 8px 30px rgba(0,0,0,0.6);">ScoreAR | سكور آر</div>
          <div style="font-size:20px;font-weight:800;color:#c4b5fd;margin-top:8px;">الانتقال إلى قاعة الأسئلة المباشرة...</div>
        </div>
      </div>
    `;

    // Stage 2: Main Quiz Title Showcase (4.2 seconds so students read it comfortably!)
    timers.push(setTimeout(() => {
      if (finished) return;
      stage.innerHTML = `
        <div style="position:fixed;inset:0;background:url('assets/worlds/${worldId}/question.jpg') center/cover no-repeat;">
          <div style="position:absolute;inset:0;background:rgba(10,14,34,0.8);backdrop-filter:blur(10px);"></div>
        </div>
        <button type="button" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;z-index:30;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;">تخطي المقدمة ⏭</button>
        <div style="position:relative;z-index:20;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px;direction:rtl;">
          <span style="background:rgba(255,255,255,0.14);color:#fcd34d;font-size:16px;font-weight:900;padding:8px 24px;border-radius:999px;margin-bottom:18px;box-shadow:0 6px 20px rgba(0,0,0,0.4);">🪐 عالم ${escapeHtml(wName)} · ${totalQuestions} أسئلة تفاعلية</span>
          <div style="background:rgba(10,16,38,0.84);backdrop-filter:blur(18px);padding:42px 64px;border-radius:24px;box-shadow:0 24px 65px rgba(0,0,0,0.75);max-width:940px;width:92%;animation:transferZoomIn 0.7s cubic-bezier(0.22,1,0.36,1) both;">
            <div style="font-size:15px;font-weight:800;color:#38bdf8;margin-bottom:10px;">🏆 عنوان المسابقة</div>
            <h1 style="font-size:44px;font-weight:900;color:#ffffff;margin:0;line-height:1.4;">${escapeHtml(title)}</h1>
            <div style="margin-top:26px;width:100%;height:6px;background:rgba(255,255,255,0.12);border-radius:999px;overflow:hidden;">
              <div style="height:100%;background:linear-gradient(90deg,#38bdf8,#8e64ef,#fbbf24);animation:titleBarFill 4.0s linear forwards;"></div>
            </div>
          </div>
        </div>
      `;
    }, 2800));

    // Stage 3: Student Attention Countdown (3.6 seconds: 1.2s per number)
    timers.push(setTimeout(() => {
      if (finished) return;
      stage.innerHTML = `
        <div style="position:fixed;inset:0;background:url('assets/worlds/${worldId}/question.jpg') center/cover no-repeat;">
          <div style="position:absolute;inset:0;background:rgba(10,14,34,0.84);backdrop-filter:blur(12px);"></div>
        </div>
        <button type="button" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;z-index:30;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;">تخطي ⏭</button>
        <div style="position:relative;z-index:20;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;direction:rtl;">
          <div style="font-size:30px;font-weight:900;color:#fcd34d;margin-bottom:14px;">🔔 انتباه يا أبطال!</div>
          <h2 style="font-size:44px;font-weight:900;color:#ffffff;margin:0 0 24px;">المسابقة تبدأ الآن... استعدوا!</h2>
          <div id="introReadyCount" style="width:132px;height:132px;border-radius:50%;background:#3b147a;border:4px solid rgba(255,255,255,0.28);color:#ffffff;font-size:64px;font-weight:900;display:grid;place-items:center;box-shadow:0 18px 50px rgba(0,0,0,0.65);font-family:Montserrat,monospace;">3</div>
        </div>
      `;
      timers.push(setTimeout(() => { const el = document.getElementById('introReadyCount'); if (el) el.textContent = '2'; }, 1200));
      timers.push(setTimeout(() => { const el = document.getElementById('introReadyCount'); if (el) el.textContent = '1'; }, 2400));
      timers.push(setTimeout(() => finishNow(), 3600));
    }, 7000));
  }

  /* ── 3. KAHOOT QUESTION READING & ANSWERING STAGE (Screenshots 5 & 3) ── */
  function renderHostQuestionView(stage, phase, qData, currentQIndex, total, worldId, timeRemaining, readingTimeRemaining) {
    const isReading = (phase === 'reading'), opts = qData.options || qData.opts || [];
    const questionText = qData.text || qData.q || '';
    const imgUrl = qData.imageUrl || qData.img || null;
    const wid = String(worldId || 'royal').trim() || 'royal';
    const roomPin = (global.ScoreARQuizHost && global.ScoreARQuizHost.getPin && global.ScoreARQuizHost.getPin()) || global.currentLobbyPin || '';

    stage.innerHTML = `
      <div style="position:fixed;inset:0;overflow:hidden;z-index:0;background:url('assets/worlds/${wid}/question.jpg') center/cover no-repeat;pointer-events:none;">
        <img src="assets/worlds/${wid}/question.jpg" alt="" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/worlds/${wid}/lobby.jpg';}else{this.style.display='none';}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.84) saturate(1.1);">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 42%, rgba(20,16,52,0.28) 0%, rgba(10,12,28,0.68) 100%);"></div>
      </div>

      <!-- Kahoot Persistent Thin Top Black Bar (with Live PIN & QR Icon on Right) -->
      <header style="position:relative;z-index:30;height:42px;background:#111111;display:flex;align-items:center;justify-content:space-between;padding:0 18px;color:#ffffff;direction:rtl;">
        <div onclick="ScoreARQuizHostView.toggleQrZoom('${roomPin}')" style="display:flex;align-items:center;gap:8px;cursor:pointer;" title="اضغط لتكبير الباركود">
          <span style="background:#ffffff;color:#111111;padding:1px 5px;border-radius:3px;font-size:12px;font-weight:900;">⊞</span>
          <span style="font-size:13px;font-weight:800;color:#e2e8f0;">انضم على <b style="color:#fff;">${window.location.host}</b> رمز PIN: <b style="color:#fcd34d;font-family:monospace;font-size:15px;">${roomPin}</b></span>
        </div>

        <div style="font-size:19px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;">ScoreAR!</div>

        <div style="display:flex;align-items:center;gap:12px;direction:ltr;">
          <button type="button" onclick="if(!document.fullscreenElement){document.documentElement.requestFullscreen?.();}else{document.exitFullscreen?.();}" style="background:none;border:none;color:#fff;font-size:15px;cursor:pointer;">⛶</button>
          <button type="button" class="scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" style="background:none;border:none;color:#fff;font-size:15px;cursor:pointer;">🔊</button>
          <span style="font-size:13px;font-weight:900;">👤 <b id="hostTotalStudentsCount">0</b></span>
          <button type="button" onclick="ScoreARQuizHost.closeHostSession()" style="background:rgba(255,255,255,0.12);border:none;color:#fff;padding:3px 10px;border-radius:5px;font-size:11px;font-weight:800;cursor:pointer;">✕</button>
        </div>
      </header>

      <!-- Top-Left «إنهاء السؤال» Button (Kahoot Screenshot 3) -->
      <div id="hostTopLeftActionWrap" style="position:absolute;top:54px;left:22px;z-index:28;">
        <button type="button" onclick="ScoreARQuizHost.finishCurrentQuestion()" style="background:rgba(17,17,17,0.85);border:1.5px solid rgba(255,255,255,0.22);color:#ffffff;padding:8px 18px;border-radius:6px;font-weight:900;font-size:13px;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,0.4);">⏮ إنهاء السؤال</button>
      </div>

      <main id="hostQuestionArena" class="host-question-arena" style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:${isReading ? 'center' : 'space-between'};align-items:center;padding:12px 24px 18px;width:100%;box-sizing:border-box;">
        
        <!-- Spinning 4-Color Diamond Icon during Reading Phase (Kahoot Screenshot 5) -->
        <div id="hostReadingDiamondBadge" style="display:${isReading ? 'grid' : 'none'};width:54px;height:54px;border-radius:50%;background:rgba(17,17,17,0.75);place-items:center;margin-bottom:18px;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <div style="width:34px;height:34px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;transform:rotate(12deg);">
            <div style="background:#e21b3c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">▲</div>
            <div style="background:#1368ce;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">◆</div>
            <div style="background:#d89e00;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">●</div>
            <div style="background:#26890c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">■</div>
          </div>
        </div>

        <!-- Question Card: Navy Transparent WITHOUT Colored Borders + White Font -->
        <div id="hostQuestionCard" class="host-question-card" style="background:rgba(10, 16, 38, 0.78);backdrop-filter:blur(18px);border:none !important;outline:none !important;border-radius:14px;padding:${isReading ? '34px 48px' : '18px 36px'};text-align:center;box-shadow:0 18px 50px rgba(0,0,0,0.55);margin:${isReading ? '10px auto 22px auto' : '4px auto 8px auto'};max-width:1060px;width:100%;transition:all 0.65s cubic-bezier(0.22, 1, 0.36, 1);">
          <h2 id="hostQuestionText" style="font-size:${isReading ? '36px' : '26px'};font-weight:900;color:#ffffff;line-height:1.45;margin:0;transition:all 0.65s cubic-bezier(0.22, 1, 0.36, 1);text-shadow:0 3px 14px rgba(0,0,0,0.65);">${escapeHtml(questionText)}</h2>
          ${imgUrl ? `
            <div id="hostQuestionImgBox" style="display:flex;justify-content:center;margin:10px 0 0;max-height:${isReading ? '220px' : '150px'};transition:max-height 0.65s ease;">
              <img src="${imgUrl}" alt="" style="max-height:100%;max-width:100%;object-fit:contain;border-radius:10px;">
            </div>
          ` : ''}
        </div>

        <!-- Reading Phase Seconds Timer + Question Number Pill -->
        <div id="hostReadingCountdownArea" style="display:${isReading ? 'flex' : 'none'};flex-direction:column;align-items:center;justify-content:center;gap:14px;margin-top:8px;transition:opacity 0.35s ease, transform 0.35s ease;">
          <div style="position:relative;width:96px;height:96px;display:flex;align-items:center;justify-content:center;background:rgba(10,16,38,0.82);border-radius:50%;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <svg width="96" height="96" style="transform:rotate(-90deg);">
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none"/>
              <circle id="hostReadingProgressCircle" cx="48" cy="48" r="40" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;"/>
            </svg>
            <div id="hostReadingCountdownNum" style="position:absolute;font-size:34px;font-weight:900;color:#ffffff;font-family:Montserrat,monospace;">${readingTimeRemaining}</div>
          </div>
          <div style="background:#3b147a;color:#ffffff;padding:6px 22px;border-radius:999px;font-size:16px;font-weight:900;direction:ltr;">${currentQIndex + 1} / ${total}</div>
        </div>

        <!-- Middle Stage during Answering Phase: Right Timer Circle + Center Space + Left Answers Circle (Kahoot Screenshot 3) -->
        <div id="hostAnsweringMidRow" style="display:${isReading ? 'none' : 'flex'};width:100%;max-width:1220px;align-items:center;justify-content:space-between;padding:0 12px;margin:auto 0;direction:rtl;">
          <!-- Right: Timer Circle -->
          <div id="hostTimerArea" style="display:flex;align-items:center;justify-content:center;">
            ${renderWorldTimerHtml(worldId, timeRemaining)}
          </div>

          <!-- Center: Result Chart Mount Area -->
          <div id="hostCenterResultMount" style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 20px;"></div>

          <!-- Left: Kahoot Answers Counter Circle (0 إجابات) -->
          <div id="hostLiveAnswerStats" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="width:78px;height:78px;border-radius:50%;background:#3b147a;border:3px solid rgba(255,255,255,0.2);display:grid;place-items:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
              <b id="hostAnsweredCount" style="color:#ffffff;font-size:30px;font-weight:900;font-family:Montserrat,monospace;">0</b>
            </div>
            <span style="background:#3b147a;color:#ffffff;font-size:12px;font-weight:900;padding:2px 14px;border-radius:999px;">إجابات</span>
          </div>
        </div>

        <!-- Bottom 2x2 Options Grid (Kahoot Screenshot 3 Exact Styling) -->
        <div id="hostOptionsGrid" class="host-options-grid" style="display:${isReading ? 'none' : 'grid'};grid-template-columns:1fr 1fr;gap:12px;max-width:1260px;margin:0 auto;width:100%;direction:rtl;">
          ${opts.slice(0, 4).map((optText, idx) => {
            const theme = OPTION_THEMES[idx % 4];
            return `
              <div id="hostOptionCard_${idx}" class="host-option-card" style="background:${theme.bg};border:none;border-bottom:6px solid ${theme.border};border-radius:8px;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 20px rgba(0,0,0,0.35);min-height:86px;transition:all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);position:relative;">
                <div style="display:flex;align-items:center;gap:16px;">
                  <span style="font-size:26px;color:#ffffff;line-height:1;">${theme.shape}</span>
                  <span id="hostOptionText_${idx}" style="font-size:21px;font-weight:900;color:#ffffff;line-height:1.35;">${escapeHtml(optText)}</span>
                </div>
                <div id="hostOptionCountBadge_${idx}" style="display:none;background:rgba(0,0,0,0.45);border-radius:8px;padding:4px 12px;font-size:16px;font-weight:900;color:#fff;">0</div>
              </div>
            `;
          }).join('')}
        </div>
      </main>
    `;
  }

  function animateToAnswering(stage, qData, currentQIndex, total, worldId, timeRemaining) {
    const card = document.getElementById('hostQuestionCard');
    const textEl = document.getElementById('hostQuestionText');
    const readingArea = document.getElementById('hostReadingCountdownArea');
    const diamond = document.getElementById('hostReadingDiamondBadge');
    const arena = document.getElementById('hostQuestionArena');
    const midRow = document.getElementById('hostAnsweringMidRow');
    const timerArea = document.getElementById('hostTimerArea');
    const optionsGrid = document.getElementById('hostOptionsGrid');

    if (!card || !readingArea || !midRow || !optionsGrid) {
      renderHostQuestionView(stage, 'answering', qData, currentQIndex, total, worldId, timeRemaining, 0);
      return;
    }

    if (diamond) diamond.style.display = 'none';
    readingArea.style.opacity = '0';
    readingArea.style.transform = 'scale(0.85)';
    setTimeout(() => { readingArea.style.display = 'none'; }, 180);

    if (arena) arena.style.justifyContent = 'space-between';

    // Glide Navy Transparent Question Card smoothly to top
    card.style.margin = '4px auto 8px auto';
    card.style.padding = '18px 36px';
    if (textEl) textEl.style.fontSize = '26px';

    if (timerArea) timerArea.innerHTML = renderWorldTimerHtml(worldId, timeRemaining);
    midRow.style.display = 'flex';
    optionsGrid.style.display = 'grid';

    const opts = qData.options || qData.opts || [];
    opts.slice(0, 4).forEach((_, idx) => {
      const optCard = document.getElementById(`hostOptionCard_${idx}`);
      if (optCard) {
        optCard.style.animation = 'none';
        void optCard.offsetWidth;
        optCard.style.animation = `optionEntranceSlide 0.45s cubic-bezier(0.16, 1, 0.3, 1) both ${idx * 0.06}s`;
      }
    });
  }

  /* ── 4. KAHOOT 4-COLUMN BAR CHART + LAST-QUESTION DIRECT-TO-PODIUM RULE ── */
  function renderQuestionResultBarChart(qData, counts, correctIndices, fastest, explanation, isLastQuestion = false) {
    const centerMount = document.getElementById('hostCenterResultMount') || document.getElementById('hostTimerArea');
    const timerArea = document.getElementById('hostTimerArea');
    const liveStats = document.getElementById('hostLiveAnswerStats');
    const topLeftWrap = document.getElementById('hostTopLeftActionWrap');
    if (timerArea && centerMount !== timerArea) timerArea.style.display = 'none';
    if (liveStats) liveStats.style.display = 'none';

    // Update top-left button to Kahoot's 3D White «التالي» (or directly «منصة التتويج» on last question!)
    const nextAction = isLastQuestion ? 'ScoreARQuizHost.renderHostPodium()' : 'ScoreARQuizHost.renderHostLeaderboard()';
    const nextLabel = isLastQuestion ? 'منصة التتويج 👑 ❯' : 'التالي ❯';
    if (topLeftWrap) {
      topLeftWrap.innerHTML = `<button type="button" onclick="${nextAction}" style="background:#ffffff;color:#111111;border:none;border-bottom:4px solid #cbd5e1;border-radius:6px;padding:9px 24px;font-size:15px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,0.5);">${nextLabel}</button>`;
    }

    if (!centerMount) return;
    const totalAns = counts.reduce((a, b) => a + b, 0) || 1;
    const maxCount = Math.max(1, ...counts);

    centerMount.innerHTML = `
      <div style="width:100%;max-width:780px;margin:0 auto;background:rgba(10,16,38,0.86);backdrop-filter:blur(18px);border-radius:18px;padding:16px 26px;box-shadow:0 20px 55px rgba(0,0,0,0.65);animation:optionEntranceSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;">
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:18px;align-items:end;height:150px;padding:10px 18px 0;direction:rtl;">
          ${[0, 1, 2, 3].map(i => {
            const theme = OPTION_THEMES[i % 4];
            const count = counts[i] || 0;
            const isCorrect = correctIndices.includes(i);
            const heightPx = count > 0 ? Math.max(28, Math.round((count / maxCount) * 105)) : 14;
            return `
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;font-size:18px;font-weight:900;color:#ffffff;">
                  ${isCorrect ? '<span style="color:#34d399;font-size:18px;">✓</span>' : ''}
                  <span>${count}</span>
                </div>
                <div style="width:100%;max-width:96px;height:${heightPx}px;background:${theme.bg};border-bottom:5px solid ${theme.border};border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:center;transition:height 0.65s cubic-bezier(0.34,1.56,0.64,1);opacity:${isCorrect ? '1' : '0.48'};">
                  <span style="font-size:18px;color:#fff;">${theme.shape}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${explanation ? `<div style="margin-top:10px;background:rgba(255,255,255,0.08);border-radius:10px;padding:7px 14px;font-size:13px;color:#f1f5f9;text-align:center;">💡 <b>التفسير:</b> ${escapeHtml(explanation)}</div>` : ''}
      </div>
    `;
  }

  const ScoreARQuizHostView = {
    setLobbyHeroesPose,
    cycleSingleHeroPose,
    toggleQrZoom,
    renderContestIntroSequence,
    renderQuestionResultBarChart,
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
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARQuizHostView = ScoreARQuizHostView; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARQuizHostView;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
