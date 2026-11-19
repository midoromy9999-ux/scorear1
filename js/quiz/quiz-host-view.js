/** ScoreAR Quiz Host View — Cosmic Glass Controls + Preserved White PIN/QR, 3D Start & 4-Color Choices (<470 lines) */
(function(global) {
  'use strict';

  const ALLOWED_POSES = ['idle', 'walk', 'celebrate'];
  let currentLobbyPose = 'walk';
  const uiIcon = (name, size = 14) => (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') ? global.ScoreARUI.icon(name, { size }) : '';

  function setLobbyHeroesPose(pose) {
    currentLobbyPose = ALLOWED_POSES.includes(pose) ? pose : 'walk';
    document.querySelectorAll('.host-lobby-hero-char').forEach(el => {
      el.className = 'scorear-character host-lobby-hero-char character-' + currentLobbyPose;
      const code = el.getAttribute('data-char-code') || 'char_01';
      el.setAttribute('data-cur-pose', currentLobbyPose);
      global.ScoreARMotionEngine?.mount?.(el, code, currentLobbyPose, { width: 140, height: 185 });
    });
    if (global.ScoreARLobbyDirector?.setMode) global.ScoreARLobbyDirector.setMode(currentLobbyPose);
    document.querySelectorAll('[data-lobby-pose]').forEach(btn => {
      const act = btn.getAttribute('data-lobby-pose') === currentLobbyPose;
      btn.classList.toggle('is-active', act);
      btn.style.background = act ? 'rgba(117,80,239,0.65)' : 'rgba(255,255,255,0.06)';
      btn.style.borderColor = act ? 'rgba(196,168,255,0.55)' : 'rgba(255,255,255,0.14)';
    });
  }

  function cycleSingleHeroPose(idx) {
    const s = document.getElementById('hostHeroSlot_' + idx);
    if (!s) return;
    const cur = s.getAttribute('data-cur-pose') || 'walk';
    const nextPose = ALLOWED_POSES[(ALLOWED_POSES.indexOf(cur) + 1) % ALLOWED_POSES.length];
    s.setAttribute('data-cur-pose', nextPose);
    s.className = 'scorear-character host-lobby-hero-char character-' + nextPose;
    global.ScoreARMotionEngine?.mount?.(s, s.getAttribute('data-char-code') || 'char_01', nextPose, { width: 140, height: 185 });
  }

  function toggleQrZoom(pin) {
    const existing = document.getElementById('scorearQrZoomModal');
    if (existing) { existing.remove(); return; }
    const qrBigUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=460x460&data=' + encodeURIComponent(window.location.origin + window.location.pathname + '?pin=' + pin);
    const modal = document.createElement('div');
    modal.id = 'scorearQrZoomModal';
    modal.onclick = () => modal.remove();
    modal.style.cssText = 'position:fixed;inset:0;z-index:100005;background:rgba(7,8,20,0.92);backdrop-filter:blur(18px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;cursor:pointer;direction:rtl;font-family:Cairo,Tajawal,sans-serif;';
    modal.innerHTML = `<div onclick="event.stopPropagation()" style="background:#ffffff;color:#111111;border-radius:28px;padding:28px 38px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,0.85);max-width:92vw;"><div style="font-size:20px;font-weight:900;color:#111111;margin-bottom:14px;">امسح الباركود بكاميرا هاتفك للدخول المباشر للقاعة</div><div style="background:#fff;padding:12px;border-radius:20px;display:inline-block;border:3px solid #111111;"><img src="${qrBigUrl}" alt="QR Code" style="width:min(340px,70vw);height:min(340px,70vw);display:block;border-radius:8px;"></div><div style="margin-top:12px;font-size:52px;font-weight:900;color:#111111;font-family:Montserrat,Arial,monospace;letter-spacing:6px;direction:ltr;">${String(pin).slice(0,3)} ${String(pin).slice(3,6)}</div><div style="margin-top:10px;"><button type="button" onclick="document.getElementById('scorearQrZoomModal')?.remove()" style="background:#111111;border:none;color:#fff;padding:9px 28px;border-radius:10px;font-size:14px;font-weight:900;cursor:pointer;">إغلاق التكبير</button></div></div>`;
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
    return `<div id="hostWorldTimerContainer" style="width:94px;height:94px;border-radius:50%;background:#3b147a;border:4px solid rgba(255,255,255,0.22);box-shadow:0 12px 30px rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;position:relative;"><svg width="94" height="94" viewBox="0 0 100 100" style="transform:rotate(-90deg);position:absolute;inset:0;"><circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.12)" stroke-width="7" fill="none" /><circle id="hostQuestionTimerRing" cx="50" cy="50" r="41" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="257.6" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;" /></svg><span id="hostQuestionTimerNum" style="position:relative;z-index:2;font-size:36px;font-weight:900;color:#ffffff;font-family:Montserrat,Arial,monospace;">${timeRemaining}</span></div>`;
  }

  /* ── 1. LOBBY WITH COSMIC GLASS CONTROLS + FIXED WHITE PIN/QR BANNER & 3D START BUTTON ── */
  function renderHostLobby(stage, currentRoom, isRoomLocked) {
    const worldId = (currentRoom && currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : 'royal';
    const w = currentRoom.world || { name: 'المنافسة', tag: 'جاهز' };
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?pin=' + currentRoom.pin)}`;
    const activeGameMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function') ? global.ScoreARGameModes.getMode() : 'SOLO';
    const modeLabel = activeGameMode === 'CARD_ARENA' ? 'طور حرب الكروت' : (activeGameMode === 'SQUADS' ? 'وضع الفريق' : 'التحدي الفردي');

    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${worldId}/lobby.jpg') center/cover no-repeat;z-index:1;"></div>
      <video id="hostLiveVideoBg" autoplay loop muted playsinline poster="assets/worlds/${worldId}/lobby.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0.92;"><source src="assets/videos/worlds/${worldId}.mp4" type="video/mp4"></video>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(28,15,69,0.28) 0%, rgba(10,11,26,0.72) 100%);z-index:3;"></div>

      <header class="scorear-control-bar" style="position:relative;z-index:25;min-height:48px;display:flex;align-items:center;justify-content:space-between;padding:6px 18px;color:#ffffff;direction:rtl;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="scorear-control-pill">${uiIcon('planet', 14)} <span>عالم ${escapeHtml(w.name)}</span></span>
          <button id="hostGameModeBtn" type="button" class="scorear-gear-btn" onclick="ScoreARGameModes && ScoreARGameModes.openModePicker({ worldId: '${worldId}', pin: '${currentRoom.pin}' })" style="border-color:rgba(172,139,242,0.38);color:#e2d4fb;">${uiIcon('sliders', 13)} <span id="hostGameModeBtnText">${modeLabel}</span> ${uiIcon('chevronDown', 12)}</button>
        </div>
        <div style="font-size:19px;font-weight:900;letter-spacing:0.4px;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;">ScoreAR<span style="color:#58dce3;">.</span></div>
        <div style="display:flex;align-items:center;gap:7px;direction:ltr;">
          <button type="button" class="scorear-gear-btn" onclick="if(!document.fullscreenElement){document.documentElement.requestFullscreen?.();}else{document.exitFullscreen?.();}" title="ملء الشاشة">${uiIcon('maximize', 14)}</button>
          <button type="button" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" title="الصوت">${uiIcon('volume', 14)}</button>
          <div class="scorear-control-pill" style="padding:4px 10px;font-size:12.5px;">${uiIcon('users', 14)} <span id="hostPlayerCount">${currentRoom.players.length}</span></div>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARBots ? ScoreARBots.openModal() : ScoreARQuizHost.addDemoPlayer()" style="border-color:rgba(172,139,242,0.42);color:#e2d4fb;" title="إضافة أبطال تجريبيين">${uiIcon('bot', 14)} <span>أبطال تجريبيون (<span id="hostBotCount">${currentRoom.players.filter(p=>p.isBot).length}</span>)</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.closeHostSession()" style="border-color:rgba(239,68,68,0.38);color:#fca5a5;">${uiIcon('close', 13)} <span>خروج</span></button>
        </div>
      </header>

      <!-- Fixed Split White Chevron PIN & QR Ticket Banner (Preserved Constant) -->
      <div style="position:relative;z-index:20;display:flex;justify-content:center;margin-top:14px;padding:0 16px;">
        <div style="display:flex;align-items:stretch;background:#ffffff;color:#111111;border-radius:8px;box-shadow:0 14px 40px rgba(0,0,0,0.65);overflow:hidden;max-width:780px;width:100%;direction:rtl;">
          <div style="flex:1;padding:12px 22px;display:flex;flex-direction:column;justify-content:center;text-align:right;position:relative;border-left:3px solid #cbd5e1;">
            <div style="font-size:13px;font-weight:700;color:#334155;">الانضمام إلى <b style="color:#0f172a;font-family:monospace;">${window.location.host}</b></div>
            <div style="font-size:13px;font-weight:800;color:#475569;margin-top:2px;">أو امسح الباركود بكاميرا هاتفك للدخول المباشر</div>
          </div>
          <div onclick="ScoreARQuizHostView.toggleQrZoom('${currentRoom.pin}')" style="padding:8px 28px;display:flex;flex-direction:column;justify-content:center;align-items:center;cursor:pointer;background:#ffffff;border-left:3px solid #cbd5e1;" title="اضغط لتكبير الرمز والباركود">
            <span style="font-size:12px;font-weight:900;color:#334155;margin-bottom:-4px;">رقم PIN الخاص باللعبة:</span>
            <div style="font-size:52px;font-weight:900;color:#111111;font-family:Montserrat,Arial,sans-serif;letter-spacing:3px;line-height:1.05;direction:ltr;">${String(currentRoom.pin).slice(0,3)} ${String(currentRoom.pin).slice(3,6)}</div>
          </div>
          <div onclick="ScoreARQuizHostView.toggleQrZoom('${currentRoom.pin}')" style="padding:8px 12px;background:#ffffff;display:flex;align-items:center;justify-content:center;cursor:pointer;" title="اضغط لتكبير الباركود بملء الشاشة">
            <img src="${qrUrl}" alt="QR" style="width:76px;height:76px;display:block;border:2px solid #111111;border-radius:4px;">
          </div>
        </div>
      </div>

      <!-- Fixed Left-Aligned 3D White «بدء» Button + Modern Lock Gear -->
      <div style="position:absolute;top:175px;left:28px;z-index:25;display:flex;align-items:center;gap:8px;direction:ltr;">
        <button id="hostStartQuizBtn" type="button" onclick="ScoreARQuizHost.launchQuestion(0)" style="background:#ffffff;color:#111111;border:none;border-bottom:4px solid #cbd5e1;border-radius:6px;padding:10px 26px;font-size:17px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.5);">بدء</button>
        <button id="hostLockBtn" type="button" onclick="ScoreARQuizHost.toggleRoomLock()" class="scorear-gear-btn" style="background:rgba(14,15,32,0.88);border-color:${isRoomLocked?'rgba(239,68,68,0.55)':'rgba(255,255,255,0.22)'};color:${isRoomLocked?'#f87171':'#ffffff'};padding:11px 14px;border-radius:8px;" title="قفل / فتح القاعة">${uiIcon(isRoomLocked ? 'lock' : 'unlock', 16)}</button>
      </div>

      <div style="position:relative;z-index:14;text-align:center;margin-top:16px;pointer-events:none;">
        <div style="font-size:44px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;text-shadow:0 6px 24px rgba(0,0,0,0.7);line-height:1;">ScoreAR!</div>
        <div class="launch-pill" style="margin-top:8px;background:rgba(24,23,46,0.85);border-color:rgba(172,139,242,0.38);color:#eceeff;font-size:13px;font-weight:900;padding:5px 16px;"><span class="live-dot"></span> ${modeLabel}</div>
      </div>

      <div id="hostCharactersArena" class="host-lobby-characters-arena" style="position:absolute;bottom:52px;left:0;right:0;height:50vh;display:flex;align-items:flex-end;justify-content:center;gap:26px;padding:0 35px 14px;z-index:15;pointer-events:none;overflow-x:auto;">${renderFullbodyCharactersHtml(currentRoom)}</div>

      <div style="position:absolute;bottom:10px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center;z-index:22;flex-wrap:wrap;gap:10px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="scorear-control-pill">${uiIcon('users', 14)} <span>المتصلون:</span> <b id="hostConnectedPlayersPill" style="color:#58dce3;">${currentRoom.players.length}</b></span>
          <span class="scorear-control-pill">${uiIcon('clock', 14)} <span>الانتظار:</span> <b id="hostLobbyTimerText" style="color:#fff;">0:00</b></span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;background:rgba(14,16,34,0.88);backdrop-filter:blur(16px);border:1px solid rgba(172,139,242,0.28);padding:4px 10px;border-radius:12px;">
          <span style="font-size:11.5px;font-weight:800;color:#b1a2e9;margin-left:4px;display:inline-flex;align-items:center;gap:5px;">${uiIcon('gamepad', 14)} حركة الأبطال:</span>
          <button type="button" data-lobby-pose="idle" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('idle')" style="padding:4px 10px;font-size:11.5px;">الوقوف</button>
          <button type="button" data-lobby-pose="walk" class="scorear-gear-btn is-active" onclick="ScoreARHostView.setLobbyHeroesPose('walk')" style="padding:4px 10px;font-size:11.5px;">المشي</button>
          <button type="button" data-lobby-pose="celebrate" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('celebrate')" style="padding:4px 10px;font-size:11.5px;">القفز</button>
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
    const p = origin ? (origin + '/') : '';
    return { code, idle: `${p}assets/characters/animated/${code}-idle.webp`, full: `${p}assets/characters/${code}.webp`, atlas: `${p}assets/characters/animated/${code}-atlas.webp`, fallback: `${p}assets/characters/char_01.webp` };
  }

  function attachLobbyAtlasLoaders(currentRoom) {
    if (!currentRoom || !currentRoom.players) return;
    setTimeout(() => {
      currentRoom.players.forEach((p, idx) => {
        const slot = document.getElementById('hostHeroSlot_' + idx);
        if (!slot) return;
        const code = normalizeAvatarCode(p.avatarId || p.characterId || p.avatar || p.player?.avatarId || p.player?.characterId || 'char_01');
        slot.setAttribute('data-char-code', code);
        slot.setAttribute('data-cur-pose', currentLobbyPose || 'walk');
        global.ScoreARMotionEngine?.mount?.(slot, code, currentLobbyPose || 'walk', { width: 140, height: 185, enableParticles: false, enableShadow: true });
        if (p.cosmetics?.aura && global.ScoreARHeroCosmetics?.applyAura) {
          global.ScoreARHeroCosmetics.applyAura(slot.parentElement || slot, p.cosmetics.aura);
        }
      });
      const arena = document.getElementById('hostCharactersArena');
      if (arena && global.ScoreARLobbyDirector?.syncArena) {
        global.ScoreARLobbyDirector.syncArena(arena, currentRoom.players, currentLobbyPose || 'walk');
      }
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
    if (txt) txt.textContent = mode === 'CARD_ARENA' ? 'طور حرب الكروت' : (mode === 'SQUADS' ? 'وضع الفريق' : 'التحدي الفردي');
  }

  function renderFullbodyCharactersHtml(currentRoom) {
    if (!currentRoom || !currentRoom.players.length) {
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:auto;margin-bottom:70px;"><div style="background:rgba(24,23,46,0.88);backdrop-filter:blur(16px);border:1px solid rgba(172,139,242,0.35);color:#ffffff;font-size:22px;font-weight:900;padding:12px 32px;border-radius:16px;box-shadow:0 14px 38px rgba(0,0,0,0.55);">في انتظار المتسابقين...</div><button type="button" class="scorear-gear-btn" onclick="ScoreARBots ? ScoreARBots.openModal() : ScoreARQuizHost.addDemoPlayer()" style="background:rgba(17,18,37,0.88);border-color:rgba(172,139,242,0.45);padding:8px 18px;font-size:12px;">${uiIcon('bot', 14)} <span>إضافة أبطال تجريبيين للقاعة</span></button></div>`;
    }
    return currentRoom.players.map((p, idx) => {
      const isBot = Boolean(p.isBot || p.isDemo), safeName = escapeHtml(p.name);
      const urls = getHeroAssetUrls(p.avatarId || p.characterId || p.avatar || p.player?.avatarId || p.player?.characterId || 'char_01');
      const delAction = p.isBot ? `ScoreARBots && ScoreARBots.removeBot('${escapeHtml(p.id)}')` : `ScoreARQuizHost.kickPlayer('${escapeHtml(p.id)}')`;
      return `<div class="animate-enter-fullbody host-lobby-hero-slot" data-player-id="${escapeHtml(p.id)}" data-player-name="${safeName}" style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:auto;animation-delay:${idx*0.06}s;min-width:132px;">
        <div class="player-name-floating-pill" style="margin-bottom:-30px;position:relative;z-index:24;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;box-shadow:0 8px 20px rgba(0,0,0,0.55);" title="إزالة اللاعب من القاعة">
          <span style="font-size:11px;color:#7550ef;">${isBot ? 'BOT' : '●'}</span>
          <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;">${safeName}</span>
          <button type="button" onclick="${delAction}" style="background:#ef4444;border:0;color:#fff;width:18px;height:18px;border-radius:50%;font-size:11px;font-weight:900;cursor:pointer;display:inline-grid;place-items:center;margin-right:4px;" title="إزالة اللاعب">✕</button>
        </div>
        <div class="host-lobby-hero-figure" onclick="ScoreARHostView.cycleSingleHeroPose(${idx})" style="cursor:pointer;position:relative;width:145px;height:184px;display:flex;align-items:flex-end;justify-content:center;" title="تبديل الوضعية">
          <span id="hostHeroSlot_${idx}" class="scorear-character host-lobby-hero-char character-${currentLobbyPose}" style="--character-atlas:url('${urls.atlas}');width:136px;height:182px;position:relative;display:flex;align-items:flex-end;justify-content:center;transform-origin:bottom center;filter:drop-shadow(0 14px 22px rgba(0,0,0,0.65));"><img id="hostHeroImg_${idx}" class="host-hero-img" src="${urls.idle}" onerror="this.onerror=null;this.src='${urls.full}';this.onerror=function(){this.src='${urls.fallback}';};" alt="${safeName}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;"><span class="character-frames" aria-hidden="true"></span></span>
        </div>
      </div>`;
    }).join('');
  }

  /* ── 2. 3-STAGE CINEMATIC TRANSFER SEQUENCE ── */
  function renderContestIntroSequence(stage, currentRoom, quizTitle, totalQuestions, onDone) {
    if (global.ScoreARLobbyDirector?.stop) global.ScoreARLobbyDirector.stop();
    const worldId = currentRoom?.world?.id || 'royal', wName = currentRoom?.world?.name || 'القصر الملكي';
    const title = quizTitle || 'كأس التفوق — مسابقة سكور آر التفاعلية';
    let finished = false;
    const timers = [];
    const finishNow = () => { if (finished) return; finished = true; timers.forEach(t => clearTimeout(t)); if (typeof onDone === 'function') onDone(); };
    global._skipScoreARIntro = finishNow;

    stage.innerHTML = `<style>@keyframes transferZoomIn{0%{transform:scale(0.82);opacity:0;}100%{transform:scale(1);opacity:1;}}@keyframes diamondSpinSlow{0%{transform:rotate(0deg) scale(0.92);}50%{transform:rotate(180deg) scale(1.06);}100%{transform:rotate(360deg) scale(0.92);}}@keyframes titleBarFill{0%{width:0%;}100%{width:100%;}}</style>
      <div style="position:fixed;inset:0;background:radial-gradient(ellipse at 50% 30%, #2b2260 0%, #0b0c1b 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;direction:rtl;">
        <button type="button" class="scorear-gear-btn" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;padding:7px 16px;font-size:12px;">${uiIcon('skipForward', 14)} <span>تخطي المقدمة</span></button>
        <div style="animation:transferZoomIn 0.8s cubic-bezier(0.22,1,0.36,1) both;text-align:center;">
          <div style="width:104px;height:104px;margin:0 auto 18px;border-radius:26px;background:#ffffff;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:5px;padding:9px;box-shadow:0 22px 55px rgba(0,0,0,0.65);animation:diamondSpinSlow 2.6s ease-in-out infinite;">
            <div style="background:#e21b3c;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">▲</div><div style="background:#1368ce;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">◆</div>
            <div style="background:#d89e00;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">●</div><div style="background:#26890c;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:18px;">■</div>
          </div>
          <div style="font-size:56px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;letter-spacing:1px;text-shadow:0 8px 30px rgba(0,0,0,0.6);">ScoreAR | سكور آر</div>
          <div style="font-size:19px;font-weight:800;color:#b1a2e9;margin-top:8px;">الانتقال إلى قاعة الأسئلة المباشرة...</div>
        </div>
      </div>`;

    timers.push(setTimeout(() => {
      if (finished) return;
      stage.innerHTML = `<div style="position:fixed;inset:0;background:url('assets/worlds/${worldId}/question.jpg') center/cover no-repeat;"><div style="position:absolute;inset:0;background:rgba(10,14,34,0.82);backdrop-filter:blur(12px);"></div></div>
        <button type="button" class="scorear-gear-btn" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;z-index:30;padding:7px 16px;font-size:12px;">${uiIcon('skipForward', 14)} <span>تخطي المقدمة</span></button>
        <div style="position:relative;z-index:20;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px;direction:rtl;">
          <span class="launch-pill" style="font-size:14px;padding:8px 22px;margin-bottom:18px;"><span class="live-dot"></span> عالم ${escapeHtml(wName)} · ${totalQuestions} أسئلة تفاعلية</span>
          <div style="background:rgba(14,16,38,0.86);backdrop-filter:blur(18px);border:1px solid rgba(172,139,242,0.3);padding:42px 64px;border-radius:24px;box-shadow:0 24px 65px rgba(0,0,0,0.75);max-width:940px;width:92%;animation:transferZoomIn 0.7s cubic-bezier(0.22,1,0.36,1) both;">
            <div style="font-size:14px;font-weight:800;color:#58dce3;margin-bottom:10px;">عنوان المسابقة</div>
            <h1 style="font-size:42px;font-weight:900;color:#ffffff;margin:0;line-height:1.4;">${escapeHtml(title)}</h1>
            <div style="margin-top:26px;width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:999px;overflow:hidden;"><div style="height:100%;background:linear-gradient(90deg,#58dce3,#8e64ef,#fbbf24);animation:titleBarFill 4.0s linear forwards;"></div></div>
          </div>
        </div>`;
    }, 2800));

    timers.push(setTimeout(() => {
      if (finished) return;
      stage.innerHTML = `<div style="position:fixed;inset:0;background:url('assets/worlds/${worldId}/question.jpg') center/cover no-repeat;"><div style="position:absolute;inset:0;background:rgba(10,14,34,0.84);backdrop-filter:blur(12px);"></div></div>
        <button type="button" class="scorear-gear-btn" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;z-index:30;padding:7px 16px;font-size:12px;">${uiIcon('skipForward', 14)} <span>تخطي</span></button>
        <div style="position:relative;z-index:20;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;direction:rtl;">
          <div style="font-size:26px;font-weight:900;color:#58dce3;margin-bottom:12px;">انتباه يا أبطال</div>
          <h2 style="font-size:42px;font-weight:900;color:#ffffff;margin:0 0 24px;">المسابقة تبدأ الآن... استعدوا!</h2>
          <div id="introReadyCount" style="width:132px;height:132px;border-radius:50%;background:linear-gradient(135deg,#7550ef,#3b147a);border:3px solid rgba(255,255,255,0.28);color:#ffffff;font-size:64px;font-weight:900;display:grid;place-items:center;box-shadow:0 18px 50px rgba(0,0,0,0.65);font-family:Montserrat,monospace;">3</div>
        </div>`;
      timers.push(setTimeout(() => { const el = document.getElementById('introReadyCount'); if (el) el.textContent = '2'; }, 1200));
      timers.push(setTimeout(() => { const el = document.getElementById('introReadyCount'); if (el) el.textContent = '1'; }, 2400));
      timers.push(setTimeout(() => finishNow(), 3600));
    }, 7000));
  }

  /* ── 3. QUESTION READING & ANSWERING STAGE (Preserving 100% Question Card & 4-Color Choices) ── */
  function renderHostQuestionView(stage, phase, qData, currentQIndex, total, worldId, timeRemaining, readingTimeRemaining) {
    if (global.ScoreARLobbyDirector?.stop) global.ScoreARLobbyDirector.stop();
    const isReading = (phase === 'reading'), opts = qData.options || qData.opts || [];
    const questionText = qData.text || qData.q || '', imgUrl = qData.imageUrl || qData.img || null;
    const wid = String(worldId || 'royal').trim() || 'royal';
    const roomPin = global.ScoreARQuizHost?.getPin?.() || global.currentLobbyPin || '';

    stage.innerHTML = `
      <div style="position:fixed;inset:0;overflow:hidden;z-index:0;background:url('assets/worlds/${wid}/question.jpg') center/cover no-repeat;pointer-events:none;">
        <img src="assets/worlds/${wid}/question.jpg" alt="" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/worlds/${wid}/lobby.jpg';}else{this.style.display='none';}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.84) saturate(1.1);">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 42%, rgba(20,16,52,0.28) 0%, rgba(10,12,28,0.68) 100%);"></div>
      </div>

      <header class="scorear-control-bar" style="position:relative;z-index:30;min-height:44px;display:flex;align-items:center;justify-content:space-between;padding:4px 18px;color:#ffffff;direction:rtl;">
        <div onclick="ScoreARQuizHostView.toggleQrZoom('${roomPin}')" style="display:flex;align-items:center;gap:8px;cursor:pointer;" title="اضغط لتكبير الباركود">
          <span class="scorear-control-pill" style="padding:3px 10px;">${uiIcon('qrCode', 14)} <span>رمز PIN: <b style="color:#fcd34d;font-family:Montserrat,monospace;font-size:14px;">${roomPin}</b></span></span>
        </div>
        <div style="font-size:18px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;">ScoreAR<span style="color:#58dce3;">.</span></div>
        <div style="display:flex;align-items:center;gap:8px;direction:ltr;">
          <button type="button" class="scorear-gear-btn" onclick="if(!document.fullscreenElement){document.documentElement.requestFullscreen?.();}else{document.exitFullscreen?.();}" style="padding:4px 9px;">${uiIcon('maximize', 13)}</button>
          <button type="button" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" style="padding:4px 9px;">${uiIcon('volume', 13)}</button>
          <span class="scorear-control-pill" style="padding:3px 9px;font-size:12px;">${uiIcon('users', 13)} <b id="hostTotalStudentsCount">0</b></span>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.closeHostSession()" style="border-color:rgba(239,68,68,0.35);color:#fca5a5;padding:4px 9px;">${uiIcon('close', 13)}</button>
        </div>
      </header>

      <div id="hostTopLeftActionWrap" style="position:absolute;top:54px;left:22px;z-index:28;">
        <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.finishCurrentQuestion()" style="background:rgba(14,15,32,0.88);border-color:rgba(255,255,255,0.22);color:#ffffff;padding:8px 16px;font-size:12.5px;box-shadow:0 6px 18px rgba(0,0,0,0.45);">${uiIcon('skipForward', 14)} <span>إنهاء السؤال</span></button>
      </div>

      <main id="hostQuestionArena" class="host-question-arena" style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:${isReading ? 'center' : 'space-between'};align-items:center;padding:12px 24px 18px;width:100%;box-sizing:border-box;">
        <div id="hostReadingDiamondBadge" style="display:${isReading ? 'grid' : 'none'};width:54px;height:54px;border-radius:50%;background:rgba(17,17,17,0.75);place-items:center;margin-bottom:18px;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <div style="width:34px;height:34px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;transform:rotate(12deg);"><div style="background:#e21b3c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">▲</div><div style="background:#1368ce;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">◆</div><div style="background:#d89e00;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">●</div><div style="background:#26890c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">■</div></div>
        </div>

        <!-- Preserved Constant: Navy Transparent Borderless Question Card -->
        <div id="hostQuestionCard" class="host-question-card" style="background:rgba(10, 16, 38, 0.78);backdrop-filter:blur(18px);border:none !important;outline:none !important;border-radius:14px;padding:${isReading ? '34px 48px' : '18px 36px'};text-align:center;box-shadow:0 18px 50px rgba(0,0,0,0.55);margin:${isReading ? '10px auto 22px auto' : '4px auto 8px auto'};max-width:1060px;width:100%;transition:all 0.65s cubic-bezier(0.22, 1, 0.36, 1);">
          <h2 id="hostQuestionText" style="font-size:${isReading ? '36px' : '26px'};font-weight:900;color:#ffffff;line-height:1.45;margin:0;transition:all 0.65s cubic-bezier(0.22, 1, 0.36, 1);text-shadow:0 3px 14px rgba(0,0,0,0.65);">${escapeHtml(questionText)}</h2>
          ${imgUrl ? `<div id="hostQuestionImgBox" style="display:flex;justify-content:center;margin:10px 0 0;max-height:${isReading ? '220px' : '150px'};transition:max-height 0.65s ease;"><img src="${imgUrl}" alt="" style="max-height:100%;max-width:100%;object-fit:contain;border-radius:10px;"></div>` : ''}
        </div>

        <div id="hostReadingCountdownArea" style="display:${isReading ? 'flex' : 'none'};flex-direction:column;align-items:center;justify-content:center;gap:14px;margin-top:8px;transition:opacity 0.35s ease, transform 0.35s ease;">
          <div style="position:relative;width:96px;height:96px;display:flex;align-items:center;justify-content:center;background:rgba(10,16,38,0.82);border-radius:50%;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <svg width="96" height="96" style="transform:rotate(-90deg);"><circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none"/><circle id="hostReadingProgressCircle" cx="48" cy="48" r="40" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;"/></svg>
            <div id="hostReadingCountdownNum" style="position:absolute;font-size:34px;font-weight:900;color:#ffffff;font-family:Montserrat,monospace;">${readingTimeRemaining}</div>
          </div>
          <div style="background:#3b147a;color:#ffffff;padding:6px 22px;border-radius:999px;font-size:16px;font-weight:900;direction:ltr;">${currentQIndex + 1} / ${total}</div>
        </div>

        <div id="hostAnsweringMidRow" style="display:${isReading ? 'none' : 'flex'};width:100%;max-width:1220px;align-items:center;justify-content:space-between;padding:0 12px;margin:auto 0;direction:rtl;">
          <div id="hostTimerArea" style="display:flex;align-items:center;justify-content:center;">${renderWorldTimerHtml(worldId, timeRemaining)}</div>
          <div id="hostCenterResultMount" style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 20px;"></div>
          <div id="hostLiveAnswerStats" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="width:78px;height:78px;border-radius:50%;background:#3b147a;border:3px solid rgba(255,255,255,0.2);display:grid;place-items:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);"><b id="hostAnsweredCount" style="color:#ffffff;font-size:30px;font-weight:900;font-family:Montserrat,monospace;">0</b></div>
            <span style="background:#3b147a;color:#ffffff;font-size:12px;font-weight:900;padding:2px 14px;border-radius:999px;">إجابات</span>
          </div>
        </div>

        <!-- Preserved Constant: Bottom 2x2 Options Grid (#e21b3c ▲, #1368ce ◆, #d89e00 ●, #26890c ■) -->
        <div id="hostOptionsGrid" class="host-options-grid" style="display:${isReading ? 'none' : 'grid'};grid-template-columns:1fr 1fr;gap:12px;max-width:1260px;margin:0 auto;width:100%;direction:rtl;">
          ${opts.slice(0, 4).map((optText, idx) => {
            const theme = OPTION_THEMES[idx % 4];
            return `<div id="hostOptionCard_${idx}" class="host-option-card" style="background:${theme.bg};border:none;border-bottom:6px solid ${theme.border};border-radius:8px;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 20px rgba(0,0,0,0.35);min-height:86px;transition:all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);position:relative;"><div style="display:flex;align-items:center;gap:16px;"><span style="font-size:26px;color:#ffffff;line-height:1;">${theme.shape}</span><span id="hostOptionText_${idx}" style="font-size:21px;font-weight:900;color:#ffffff;line-height:1.35;">${escapeHtml(optText)}</span></div><div id="hostOptionCountBadge_${idx}" style="display:none;background:rgba(0,0,0,0.45);border-radius:8px;padding:4px 12px;font-size:16px;font-weight:900;color:#fff;">0</div></div>`;
          }).join('')}
        </div>
      </main>`;
  }

  function animateToAnswering(stage, qData, currentQIndex, total, worldId, timeRemaining) {
    const card = document.getElementById('hostQuestionCard'), textEl = document.getElementById('hostQuestionText');
    const readingArea = document.getElementById('hostReadingCountdownArea'), diamond = document.getElementById('hostReadingDiamondBadge');
    const arena = document.getElementById('hostQuestionArena'), midRow = document.getElementById('hostAnsweringMidRow');
    const timerArea = document.getElementById('hostTimerArea'), optionsGrid = document.getElementById('hostOptionsGrid');
    if (!card || !readingArea || !midRow || !optionsGrid) { renderHostQuestionView(stage, 'answering', qData, currentQIndex, total, worldId, timeRemaining, 0); return; }
    if (diamond) diamond.style.display = 'none';
    readingArea.style.opacity = '0'; readingArea.style.transform = 'scale(0.85)';
    setTimeout(() => { readingArea.style.display = 'none'; }, 180);
    if (arena) arena.style.justifyContent = 'space-between';
    card.style.margin = '4px auto 8px auto'; card.style.padding = '18px 36px';
    if (textEl) textEl.style.fontSize = '26px';
    if (timerArea) timerArea.innerHTML = renderWorldTimerHtml(worldId, timeRemaining);
    midRow.style.display = 'flex'; optionsGrid.style.display = 'grid';
    (qData.options || qData.opts || []).slice(0, 4).forEach((_, idx) => {
      const optCard = document.getElementById(`hostOptionCard_${idx}`);
      if (optCard) { optCard.style.animation = 'none'; void optCard.offsetWidth; optCard.style.animation = `optionEntranceSlide 0.45s cubic-bezier(0.16, 1, 0.3, 1) both ${idx * 0.06}s`; }
    });
  }

  /* ── 4. 4-COLUMN BAR CHART + LAST-QUESTION DIRECT-TO-PODIUM RULE (Preserved Constant) ── */
  function renderQuestionResultBarChart(qData, counts, correctIndices, fastest, explanation, isLastQuestion = false) {
    const centerMount = document.getElementById('hostCenterResultMount') || document.getElementById('hostTimerArea');
    const timerArea = document.getElementById('hostTimerArea'), liveStats = document.getElementById('hostLiveAnswerStats'), topLeftWrap = document.getElementById('hostTopLeftActionWrap');
    if (timerArea && centerMount !== timerArea) timerArea.style.display = 'none';
    if (liveStats) liveStats.style.display = 'none';
    const nextAction = isLastQuestion ? 'ScoreARQuizHost.renderHostPodium()' : 'ScoreARQuizHost.renderHostLeaderboard()';
    const nextLabel = isLastQuestion ? 'منصة التتويج ❯' : 'التالي ❯';
    if (topLeftWrap) topLeftWrap.innerHTML = `<button type="button" onclick="${nextAction}" style="background:#ffffff;color:#111111;border:none;border-bottom:4px solid #cbd5e1;border-radius:6px;padding:9px 24px;font-size:15px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,0.5);">${nextLabel}</button>`;
    if (!centerMount) return;
    const maxCount = Math.max(1, ...counts);
    centerMount.innerHTML = `<div style="width:100%;max-width:780px;margin:0 auto;background:rgba(10,16,38,0.88);backdrop-filter:blur(18px);border:1px solid rgba(172,139,242,0.28);border-radius:18px;padding:16px 26px;box-shadow:0 20px 55px rgba(0,0,0,0.65);animation:optionEntranceSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;">
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:18px;align-items:end;height:150px;padding:10px 18px 0;direction:rtl;">
        ${[0, 1, 2, 3].map(i => {
          const theme = OPTION_THEMES[i % 4], count = counts[i] || 0, isCorrect = correctIndices.includes(i);
          const heightPx = count > 0 ? Math.max(28, Math.round((count / maxCount) * 105)) : 14;
          return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;"><div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;font-size:18px;font-weight:900;color:#fff;">${isCorrect ? '<span style="color:#34d399;font-size:18px;">✓</span>' : ''}<span>${count}</span></div><div style="width:100%;max-width:96px;height:${heightPx}px;background:${theme.bg};border-bottom:5px solid ${theme.border};border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:center;transition:height 0.65s cubic-bezier(0.34,1.56,0.64,1);opacity:${isCorrect ? '1' : '0.48'};"><span style="font-size:18px;color:#fff;">${theme.shape}</span></div></div>`;
        }).join('')}
      </div>
      ${fastest && fastest.name ? `<div style="margin-top:10px;background:rgba(245,158,11,0.14);border:1px solid rgba(251,191,36,0.38);border-radius:12px;padding:6px 14px;display:inline-flex;align-items:center;gap:10px;"><img src="assets/characters/animated/${escapeHtml(fastest.avatarId || 'char_01')}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${escapeHtml(fastest.name)}" style="width:34px;height:40px;object-fit:contain;"><span class="scorear-inline-icon" style="font-size:13px;font-weight:900;color:#fef08a;">${uiIcon('zap', 14)} الأسرع: ${escapeHtml(fastest.name)} (${fastest.timeSec}ث)</span></div>` : ''}
      ${explanation ? `<div style="margin-top:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:7px 14px;font-size:13px;color:#f1f5f9;text-align:center;"><b>التفسير:</b> ${escapeHtml(explanation)}</div>` : ''}
    </div>`;
  }

  const ScoreARQuizHostView = { setLobbyHeroesPose, cycleSingleHeroPose, toggleQrZoom, renderContestIntroSequence, renderQuestionResultBarChart, renderHostLobby, refreshLobbyUi, updateLobbyModeBadge, renderFullbodyCharactersHtml, renderHostQuestionView, renderWorldTimerHtml, animateToAnswering, WORLD_TIMER_CONFIGS };
  global.ScoreARQuizHostView = ScoreARQuizHostView;
  global.ScoreARHostView = ScoreARQuizHostView;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARQuizHostView = ScoreARQuizHostView; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARQuizHostView;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
