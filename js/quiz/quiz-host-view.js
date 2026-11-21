/** ScoreAR Quiz Host View — Cosmic Glass Controls + Preserved White PIN/QR, 3D Start & 4-Color Choices (<470 lines) */
(function(global) {
  'use strict';

  const ALLOWED_POSES = ['entrance', 'idle', 'wave', 'walk', 'jump', 'clap', 'win', 'celebrate'];
  let currentLobbyPose = 'entrance';
  const uiIcon = (name, size = 14) => (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') ? global.ScoreARUI.icon(name, { size }) : '';

  function setLobbyHeroesPose(pose) {
    currentLobbyPose = ALLOWED_POSES.includes(pose) ? pose : 'entrance';
    const slots = document.querySelectorAll('.host-lobby-hero-char');
    const total = slots.length || 1;
    slots.forEach((el, idx) => {
      const code = el.getAttribute('data-char-code') || 'char_01';
      const fromLeft = total <= 1 ? true : (idx < Math.ceil(total / 2));
      const mountPose = currentLobbyPose === 'entrance' ? (fromLeft ? 'walkRight' : 'walkLeft') : currentLobbyPose;
      el.className = 'scorear-character host-lobby-hero-char character-' + mountPose;
      el.setAttribute('data-cur-pose', mountPose);
      const loopFlag = mountPose !== 'jump';
      global.ScoreARMotionEngine?.mount?.(el, code, mountPose, { width: 140, height: 185, loop: loopFlag });
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
    global.ScoreARMotionEngine?.mount?.(s, s.getAttribute('data-char-code') || 'char_01', nextPose, { width: 140, height: 185, loop: nextPose !== 'jump' });
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
    { bg: '#9a5800', border: '#fbbf24', shape: '●' },
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

  const ARENA_WORLD_ACCENTS = {
    royal: '#fbbf24',
    stadium: '#38bdf8',
    cosmic: '#c084fc',
    treasure: '#f59e0b',
    oasis: '#34d399',
    magic: '#e879f9'
  };

  function renderArenaMicroTimerHtml(wAccent, timeRemaining) {
    return `<div id="hostWorldTimerContainer" style="width:60px;height:60px;border-radius:50%;background:rgba(8,14,32,0.44);backdrop-filter:blur(10px);border:1.5px solid ${wAccent}88;box-shadow:0 8px 22px rgba(0,0,0,0.34);display:flex;align-items:center;justify-content:center;position:relative;"><svg width="60" height="60" viewBox="0 0 100 100" style="width:100% !important;height:100% !important;max-width:none !important;transform:rotate(-90deg);position:absolute;inset:0;"><circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.14)" stroke-width="7" fill="none" /><circle id="hostQuestionTimerRing" cx="50" cy="50" r="41" stroke="${wAccent}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="257.6" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;" /></svg><span id="hostQuestionTimerNum" style="position:relative;z-index:2;font-size:23px;font-weight:900;color:#ffffff;font-family:Montserrat,Arial,monospace;">${timeRemaining}</span></div>`;
  }

  function renderWorldTimerHtml(worldId, timeRemaining) {
    return `<div id="hostWorldTimerContainer" style="width:94px;height:94px;border-radius:50%;background:#3b147a;border:4px solid rgba(255,255,255,0.22);box-shadow:0 12px 30px rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;position:relative;"><svg width="94" height="94" viewBox="0 0 100 100" style="transform:rotate(-90deg);position:absolute;inset:0;"><circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.12)" stroke-width="7" fill="none" /><circle id="hostQuestionTimerRing" cx="50" cy="50" r="41" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="257.6" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;" /></svg><span id="hostQuestionTimerNum" style="position:relative;z-index:2;font-size:36px;font-weight:900;color:#ffffff;font-family:Montserrat,Arial,monospace;">${timeRemaining}</span></div>`;
  }

  function resolveRealQuizTitle(currentRoom, explicitTitle) {
    const GENERIC = 'كأس التفوق — مسابقة سكور آر التفاعلية';
    const clean = v => (typeof v === 'string' ? v.trim() : '');
    const cands = [
      clean(explicitTitle),
      clean(currentRoom?.quizTitle),
      clean(global.activeQuizTitle),
      (() => { try { return clean(sessionStorage.getItem('scorear_active_quiz_title')); } catch { return ''; } })()
    ];
    const real = cands.find(t => t && t !== GENERIC);
    if (real) return real;
    const firstSkill = clean(global.contestQuestions?.[0]?.skill);
    return firstSkill ? `مسابقة ${firstSkill}` : 'مسابقة سكور آر التفاعلية';
  }

  /* ── 1. LOBBY WITH COSMIC GLASS CONTROLS + FIXED WHITE PIN/QR BANNER & 3D START BUTTON ── */
  function renderHostLobby(stage, currentRoom, isRoomLocked) {
    if (global.ScoreARLobbyDirector?.stop) global.ScoreARLobbyDirector.stop();
    if (global.ScoreARArena3D?.dispose) global.ScoreARArena3D.dispose();
    if (global.ScoreARDuelCoronation?.cleanup) global.ScoreARDuelCoronation.cleanup();
    global.ScoreARCardArena?.stopBotDirector?.();
    global.ScoreARCardCinema?.cleanup?.();
    currentLobbyPose = 'entrance';
    const worldId = (currentRoom && currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : 'royal';
    const w = currentRoom.world || { name: 'المنافسة', tag: 'جاهز' };
    if (currentRoom && !currentRoom.quizTitle) currentRoom.quizTitle = resolveRealQuizTitle(currentRoom, '');
    global.ScoreARMotionV3?.preloadCharacters?.(currentRoom?.players || [], ['walkRight', 'walkLeft', 'wave', 'idle']);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?pin=' + currentRoom.pin)}`;
    const activeGameMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function') ? global.ScoreARGameModes.getMode() : 'SOLO';
    const isDuel = Boolean(global.ScoreARArenaModes?.isDuelMode?.(activeGameMode));
    const isSurvival = Boolean(global.ScoreARArenaModes?.isSurvivalMode?.(activeGameMode));
    const isCardArena = Boolean(global.ScoreARArenaModes?.isCardArenaMode?.(activeGameMode));
    if (isDuel && global.ScoreARArenaModes?.ensureAllTeamsAssigned) {
      global.ScoreARArenaModes.ensureAllTeamsAssigned(currentRoom);
    }
    const modeLabel = global.ScoreARArenaModes?.getModeLabel
      ? global.ScoreARArenaModes.getModeLabel(activeGameMode)
      : (activeGameMode === 'CARD_ARENA' ? 'طور حرب الكروت' : (activeGameMode === 'SQUADS' ? 'وضع الفريق' : 'التحدي الفردي'));
    const celStyle = global.ScoreARMotionV3?.stampRoomCelebrationStyle
      ? global.ScoreARMotionV3.stampRoomCelebrationStyle(currentRoom)
      : (currentRoom?.celebrationStyle || 'classic');

    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${worldId}/lobby.jpg') center/cover no-repeat;z-index:1;"></div>
      <video id="hostLiveVideoBg" autoplay loop muted playsinline poster="assets/worlds/${worldId}/lobby.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0.92;"><source src="assets/videos/worlds/${worldId}.mp4" type="video/mp4"></video>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(28,15,69,0.28) 0%, rgba(10,11,26,0.72) 100%);z-index:3;"></div>

      <header class="scorear-control-bar" style="position:relative;z-index:25;min-height:48px;display:flex;align-items:center;justify-content:space-between;padding:6px 18px;color:#ffffff;direction:rtl;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="scorear-control-pill">${uiIcon('planet', 14)} <span>عالم ${escapeHtml(w.name)}</span></span>
          <button id="hostGameModeBtn" type="button" class="scorear-gear-btn" onclick="ScoreARGameModes && ScoreARGameModes.openModePicker({ worldId: '${worldId}', pin: '${currentRoom.pin}' })" style="border-color:rgba(172,139,242,0.38);color:#e2d4fb;">${uiIcon('sliders', 13)} <span id="hostGameModeBtnText">${modeLabel}</span> ${uiIcon('chevronDown', 12)}</button>
          <div id="hostCelebrationPicker" role="group" aria-label="طريقة الاحتفال" style="display:inline-flex;align-items:center;gap:4px;background:rgba(14,16,34,0.86);border:1px solid rgba(251,191,36,0.32);border-radius:999px;padding:3px 6px;">
            <span style="font-size:11px;font-weight:800;color:#fde68a;padding-inline:4px;">الاحتفال:</span>
            <button type="button" data-cel-style-btn="classic" data-styled="pill" aria-pressed="${celStyle === 'classic'}" onclick="ScoreARMotionV3?.setCelebrationStyle?.('classic')" style="border-radius:999px;padding:3px 10px;font-size:11px;font-weight:900;cursor:pointer;border:1px solid ${celStyle === 'classic' ? '#fde047' : 'rgba(255,255,255,0.18)'};background:${celStyle === 'classic' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)'};color:${celStyle === 'classic' ? '#090d16' : '#e2e8f0'};">كلاسيكي</button>
            <button type="button" data-cel-style-btn="hall" data-styled="pill" aria-pressed="${celStyle === 'hall'}" onclick="ScoreARMotionV3?.setCelebrationStyle?.('hall')" style="border-radius:999px;padding:3px 10px;font-size:11px;font-weight:900;cursor:pointer;border:1px solid ${celStyle === 'hall' ? '#fde047' : 'rgba(255,255,255,0.18)'};background:${celStyle === 'hall' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)'};color:${celStyle === 'hall' ? '#090d16' : '#e2e8f0'};">احتفال القاعة</button>
          </div>
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
        <div id="hostDuelLobbyBar" style="margin-top:8px;display:${(isDuel || isSurvival || isCardArena) ? 'flex' : 'none'};justify-content:center;pointer-events:auto;">${isDuel ? renderDuelLobbySplitHtml(currentRoom) : (isSurvival ? renderSurvivalLobbySplitHtml(currentRoom) : (isCardArena ? renderCardArenaLobbySplitHtml(currentRoom) : ''))}</div>
      </div>

      <div id="hostCharactersArena" class="host-lobby-characters-arena" style="position:absolute;bottom:52px;left:0;right:0;height:50vh;display:flex;align-items:flex-end;justify-content:center;gap:26px;padding:0 35px 14px;z-index:15;pointer-events:none;overflow-x:auto;">${renderFullbodyCharactersHtml(currentRoom)}</div>

      <div style="position:absolute;bottom:10px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center;z-index:22;flex-wrap:wrap;gap:10px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="scorear-control-pill">${uiIcon('users', 14)} <span>المتصلون:</span> <b id="hostConnectedPlayersPill" style="color:#58dce3;">${currentRoom.players.length}</b></span>
          <span class="scorear-control-pill">${uiIcon('clock', 14)} <span>الانتظار:</span> <b id="hostLobbyTimerText" style="color:#fff;">0:00</b></span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;background:rgba(14,16,34,0.88);backdrop-filter:blur(16px);border:1px solid rgba(172,139,242,0.28);padding:4px 10px;border-radius:12px;flex-wrap:wrap;">
          <span style="font-size:11.5px;font-weight:800;color:#b1a2e9;margin-left:4px;display:inline-flex;align-items:center;gap:5px;">${uiIcon('gamepad', 14)} حركة الأبطال:</span>
          <button type="button" data-lobby-pose="entrance" class="scorear-gear-btn is-active" onclick="ScoreARHostView.setLobbyHeroesPose('entrance')" style="padding:4px 10px;font-size:11.5px;background:rgba(117,80,239,0.65);border-color:rgba(196,168,255,0.55);">مسار الدخول</button>
          <button type="button" data-lobby-pose="wave" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('wave')" style="padding:4px 10px;font-size:11.5px;">التحية 👋</button>
          <button type="button" data-lobby-pose="idle" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('idle')" style="padding:4px 10px;font-size:11.5px;">الوقوف</button>
          <button type="button" data-lobby-pose="walk" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('walk')" style="padding:4px 10px;font-size:11.5px;">المشي</button>
          <button type="button" data-lobby-pose="jump" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('jump')" style="padding:4px 10px;font-size:11.5px;">القفز</button>
          <button type="button" data-lobby-pose="clap" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('clap')" style="padding:4px 10px;font-size:11.5px;">التصفيق</button>
          <button type="button" data-lobby-pose="win" class="scorear-gear-btn" onclick="ScoreARHostView.setLobbyHeroesPose('win')" style="padding:4px 10px;font-size:11.5px;">الاحتفال</button>
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

  function resolveLobbySlotMountPose(idx, totalCount) {
    if (currentLobbyPose !== 'entrance') return currentLobbyPose || 'walkRight';
    const fromLeft = totalCount <= 1 ? true : (idx < Math.ceil(totalCount / 2));
    return fromLeft ? 'walkRight' : 'walkLeft';
  }

  function mountLobbySlotSprite(slotEl, p, idx, totalCount) {
    if (!slotEl) return;
    const code = normalizeAvatarCode(p.avatarId || p.characterId || p.avatar || p.player?.avatarId || p.player?.characterId || 'char_01');
    const mountPose = resolveLobbySlotMountPose(idx, totalCount);
    slotEl.setAttribute('data-char-code', code);
    slotEl.setAttribute('data-cur-pose', mountPose);
    global.ScoreARMotionEngine?.mount?.(slotEl, code, mountPose, { width: 140, height: 185, loop: mountPose !== 'jump', enableParticles: false, enableShadow: true });
    if (p.cosmetics?.aura && global.ScoreARHeroCosmetics?.applyAura) {
      global.ScoreARHeroCosmetics.applyAura(slotEl.parentElement || slotEl, p.cosmetics.aura);
    }
  }

  function attachLobbyAtlasLoaders(currentRoom) {
    if (!currentRoom || !currentRoom.players) return;
    setTimeout(() => {
      const players = currentRoom.players || [];
      players.forEach((p, idx) => mountLobbySlotSprite(document.getElementById('hostHeroSlot_' + idx), p, idx, players.length));
      const arena = document.getElementById('hostCharactersArena');
      if (arena && global.ScoreARLobbyDirector?.syncArena) {
        global.ScoreARLobbyDirector.syncArena(arena, players, currentLobbyPose || 'entrance');
      }
    }, 35);
  }

  function renderDuelLobbySplitHtml(currentRoom) {
    if (!global.ScoreARArenaModes?.computeDuelScoreboard) return '';
    const sb = global.ScoreARArenaModes.computeDuelScoreboard(currentRoom?.players || []);
    return `
      <div style="display:inline-flex;align-items:center;gap:12px;padding:6px 14px;border-radius:999px;background:rgba(10,14,34,0.72);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.20);box-shadow:0 8px 24px rgba(0,0,0,0.4);direction:rtl;flex-wrap:wrap;justify-content:center;">
        <span style="font-size:12px;font-weight:900;color:#7dd3fc;">${sb.team_a.emoji} ${escapeHtml(sb.team_a.shortName)}: <b>${sb.team_a.count}</b></span>
        <span style="color:rgba(255,255,255,0.28);font-weight:900;">VS</span>
        <span style="font-size:12px;font-weight:900;color:#fdba74;">${sb.team_b.emoji} ${escapeHtml(sb.team_b.shortName)}: <b>${sb.team_b.count}</b></span>
        <button type="button" id="btnLobbyRenameTeams" onclick="ScoreARArenaModes.openLobbyTeamNamesEditor()" style="padding:3px 10px;border-radius:999px;border:1px solid rgba(56,189,248,0.5);background:rgba(56,189,248,0.20);color:#e0f2fe;font-family:Cairo,sans-serif;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">✏️ تسمية الفريقين</button>
        <span style="font-size:10.5px;color:#cbd5e1;border-right:1px solid rgba(255,255,255,0.18);padding-right:8px;">اضغط شارة الفريق لتبديل اللاعب</span>
      </div>`;
  }

  function renderSurvivalLobbySplitHtml(currentRoom) {
    const count = Array.isArray(currentRoom?.players) ? currentRoom.players.length : 0;
    const qTotal = Number(currentRoom?._lastTotalQuestions || global.contestQuestions?.length || 5);
    const cps = global.ScoreARSurvivalEngine?.computeEliminationSchedule
      ? global.ScoreARSurvivalEngine.computeEliminationSchedule(count, qTotal)
      : [];
    const note = count <= 2
      ? 'مواجهة نهائية (أضف 3+ متسابقين لتفعيل مراحل الإقصاء)'
      : `${cps.length} مراحل إقصاء ذكية عبر ${qTotal} أسئلة • تصفير النقاط بعد كل خروج`;
    return `
      <div id="hostSurvivalLobbyPill" style="display:inline-flex;align-items:center;gap:10px;padding:6px 16px;border-radius:999px;background:rgba(18,12,38,0.88);backdrop-filter:blur(12px);border:1px solid rgba(251,191,36,0.45);box-shadow:0 8px 24px rgba(0,0,0,0.4);direction:rtl;">
        <span style="font-size:14px;">👑</span>
        <span style="font-size:12px;font-weight:900;color:#fde68a;">وضع البقاء للأقوى — عداد إقصاء ذكي تلقائي</span>
        <span style="font-size:11px;color:#cbd5e1;border-right:1px solid rgba(255,255,255,0.18);padding-right:10px;">${escapeHtml(note)}</span>
      </div>`;
  }

  function renderCardArenaLobbySplitHtml() {
    return `
      <div id="hostCardArenaLobbyPill" style="display:inline-flex;align-items:center;gap:10px;padding:6px 16px;border-radius:999px;background:rgba(18,12,38,0.88);backdrop-filter:blur(12px);border:1px solid rgba(236,72,153,0.48);box-shadow:0 8px 24px rgba(0,0,0,0.4);direction:rtl;">
        <span style="font-size:14px;">🃏</span>
        <span style="font-size:12px;font-weight:900;color:#fbcfe8;">وضع حرب الكروت 3D</span>
        <span style="font-size:11px;color:#cbd5e1;border-right:1px solid rgba(255,255,255,0.18);padding-right:10px;">كارت مجاني بالجولة 1 • أسرع إجابتين + سلسلتان • رهان ±100</span>
      </div>`;
  }

  function renderDuelTeamPillHtml(p, pid) {
    const isDuel = Boolean(global.ScoreARArenaModes?.isDuelMode?.());
    if (!isDuel || !global.ScoreARArenaModes?.getTeamMeta) return '';
    const tid = global.ScoreARArenaModes.normalizeTeamId(p?.teamId || p?.team) || 'team_a';
    const meta = global.ScoreARArenaModes.getTeamMeta(tid);
    const safePid = escapeHtml(pid);
    return `<button type="button" data-duel-team-pill="${safePid}" onclick="ScoreARArenaModes.togglePlayerTeam('${safePid}')" style="margin-bottom:4px;padding:3px 10px;border-radius:999px;border:1px solid ${meta.border};background:${meta.gradient};color:#fff;font-family:Cairo,sans-serif;font-size:10.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 4px 12px ${meta.glow};position:relative;z-index:25;" title="اضغط للتبديل بين الفريقين">${meta.emoji} <span>${escapeHtml(meta.shortName)}</span></button>`;
  }

  function refreshLobbyUi(currentRoom) {
    if (!currentRoom) return;
    const isDuel = Boolean(global.ScoreARArenaModes?.isDuelMode?.());
    const isSurvival = Boolean(global.ScoreARArenaModes?.isSurvivalMode?.());
    const isCardArena = Boolean(global.ScoreARArenaModes?.isCardArenaMode?.());
    if (isDuel && global.ScoreARArenaModes?.ensureAllTeamsAssigned) {
      global.ScoreARArenaModes.ensureAllTeamsAssigned(currentRoom);
    }
    const duelBar = document.getElementById('hostDuelLobbyBar');
    if (duelBar) {
      duelBar.style.display = (isDuel || isSurvival || isCardArena) ? 'flex' : 'none';
      duelBar.innerHTML = isDuel
        ? renderDuelLobbySplitHtml(currentRoom)
        : (isSurvival ? renderSurvivalLobbySplitHtml(currentRoom) : (isCardArena ? renderCardArenaLobbySplitHtml(currentRoom) : ''));
    }

    const arena = document.getElementById('hostCharactersArena');
    const players = currentRoom.players || [];
    const countEl = document.getElementById('hostPlayerCount'), countPill = document.getElementById('hostConnectedPlayersPill');
    if (countEl) countEl.textContent = players.length;
    if (countPill) countPill.textContent = players.length;
    const botCount = document.getElementById('hostBotCount');
    if (botCount) botCount.textContent = players.filter(p => p.isBot).length;
    if (currentRoom.mode || currentRoom.gameMode) updateLobbyModeBadge(currentRoom.gameMode || currentRoom.mode);

    if (!arena) return;
    if (!players.length) {
      arena.innerHTML = renderFullbodyCharactersHtml(currentRoom);
      if (global.ScoreARLobbyDirector?.stop) global.ScoreARLobbyDirector.stop();
      return;
    }

    global.ScoreARMotionV3?.preloadCharacters?.(players, ['walkRight', 'walkLeft', 'wave', 'idle']);
    const existingSlots = Array.from(arena.querySelectorAll('.host-lobby-hero-slot'));
    if (!existingSlots.length) {
      arena.innerHTML = renderFullbodyCharactersHtml(currentRoom);
      attachLobbyAtlasLoaders(currentRoom);
      return;
    }

    // Remove empty state placeholder if present without touching live hero nodes
    Array.from(arena.children).forEach(ch => {
      if (ch.id !== 'hostLobbyFxCanvas' && !ch.classList.contains('host-lobby-hero-slot')) ch.remove();
    });

    const existingById = new Map();
    existingSlots.forEach((el, i) => {
      const pid = el.getAttribute('data-player-id') || ('slot_' + i);
      existingById.set(pid, el);
    });
    const activeIds = new Set(players.map((p, i) => String(p.id || ('slot_' + i))));
    existingById.forEach((el, pid) => { if (!activeIds.has(pid)) el.remove(); });

    const newMounts = [];
    players.forEach((p, idx) => {
      const pid = String(p.id || ('slot_' + idx));
      let slotWrapper = existingById.get(pid);
      if (!slotWrapper) {
        const tmp = document.createElement('div');
        tmp.innerHTML = renderLobbyHeroSlotHtml(p, idx, players.length);
        slotWrapper = tmp.firstElementChild;
        if (slotWrapper) {
          arena.appendChild(slotWrapper);
          newMounts.push({ el: slotWrapper.querySelector('.host-lobby-hero-char'), p, idx });
        }
      } else {
        const fig = slotWrapper.querySelector('.host-lobby-hero-figure');
        if (fig) fig.setAttribute('onclick', `ScoreARHostView.cycleSingleHeroPose(${idx})`);
        const charSpan = slotWrapper.querySelector('.host-lobby-hero-char');
        if (charSpan) charSpan.id = 'hostHeroSlot_' + idx;
        const imgEl = slotWrapper.querySelector('.host-hero-img');
        if (imgEl) imgEl.id = 'hostHeroImg_' + idx;
        const oldPill = slotWrapper.querySelector('[data-duel-team-pill]');
        if (oldPill) oldPill.remove();
        if (isDuel) {
          const pillHtml = renderDuelTeamPillHtml(p, pid);
          if (pillHtml) slotWrapper.insertAdjacentHTML('afterbegin', pillHtml);
        }
      }
    });

    newMounts.forEach(({ el, p, idx }) => mountLobbySlotSprite(el, p, idx, players.length));
    if (global.ScoreARLobbyDirector?.syncArena) {
      global.ScoreARLobbyDirector.syncArena(arena, players, currentLobbyPose || 'entrance');
    }
  }

  function updateLobbyModeBadge(mode) {
    const label = global.ScoreARArenaModes?.getModeLabel
      ? global.ScoreARArenaModes.getModeLabel(mode)
      : (mode === 'CARD_ARENA' ? 'طور حرب الكروت' : (mode === 'SQUADS' ? 'وضع الفريق' : 'التحدي الفردي'));
    const txt = document.getElementById('hostGameModeBtnText');
    if (txt) txt.textContent = label;
    const lobbyPill = document.querySelector('.launch-pill');
    if (lobbyPill && document.getElementById('hostCharactersArena')) {
      lobbyPill.innerHTML = `<span class="live-dot"></span> ${label}`;
    }
  }

  function renderLobbyHeroSlotHtml(p, idx, totalCount) {
    const isBot = Boolean(p.isBot || p.isDemo), safeName = escapeHtml(p.name);
    const urls = getHeroAssetUrls(p.avatarId || p.characterId || p.avatar || p.player?.avatarId || p.player?.characterId || 'char_01');
    const delAction = p.isBot ? `ScoreARBots && ScoreARBots.removeBot('${escapeHtml(p.id)}')` : `ScoreARQuizHost.kickPlayer('${escapeHtml(p.id)}')`;
    const mountPose = resolveLobbySlotMountPose(idx, totalCount || 1);
    const hideWhileLoading = Boolean(global.ScoreARLobbyDirector && currentLobbyPose === 'entrance');
    const pid = String(p.id || ('slot_' + idx));
    const safePid = escapeHtml(pid);
    const teamPill = renderDuelTeamPillHtml(p, pid);
    return `<div class="animate-enter-fullbody host-lobby-hero-slot" data-player-id="${safePid}" data-player-name="${safeName}" style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:auto;animation-delay:${idx*0.06}s;min-width:132px;${hideWhileLoading ? 'opacity:0;' : ''}">
        ${teamPill}
        <div class="player-name-floating-pill" style="margin-bottom:-30px;position:relative;z-index:24;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;box-shadow:0 8px 20px rgba(0,0,0,0.55);" title="إزالة اللاعب من القاعة">
          <span style="font-size:11px;color:#7550ef;">${isBot ? 'BOT' : '●'}</span>
          <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;">${safeName}</span>
          <button type="button" onclick="${delAction}" style="background:#ef4444;border:0;color:#fff;width:18px;height:18px;border-radius:50%;font-size:11px;font-weight:900;cursor:pointer;display:inline-grid;place-items:center;margin-right:4px;" title="إزالة اللاعب">✕</button>
        </div>
        <div class="host-lobby-hero-figure" onclick="ScoreARHostView.cycleSingleHeroPose(${idx})" style="cursor:pointer;position:relative;width:145px;height:184px;display:flex;align-items:flex-end;justify-content:center;" title="تبديل الوضعية">
          <span id="hostHeroSlot_${idx}" class="scorear-character host-lobby-hero-char character-${mountPose}" style="--character-atlas:url('${urls.atlas}');width:136px;height:182px;position:relative;display:flex;align-items:flex-end;justify-content:center;transform-origin:bottom center;filter:drop-shadow(0 14px 22px rgba(0,0,0,0.65));"><img id="hostHeroImg_${idx}" class="host-hero-img" src="${urls.idle}" onerror="this.onerror=null;this.src='${urls.full}';this.onerror=function(){this.src='${urls.fallback}';};" alt="${safeName}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;"><span class="character-frames" aria-hidden="true"></span></span>
        </div>
      </div>`;
  }

  function renderFullbodyCharactersHtml(currentRoom) {
    if (!currentRoom || !currentRoom.players.length) {
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:auto;margin-bottom:70px;"><div style="background:rgba(24,23,46,0.88);backdrop-filter:blur(16px);border:1px solid rgba(172,139,242,0.35);color:#ffffff;font-size:22px;font-weight:900;padding:12px 32px;border-radius:16px;box-shadow:0 14px 38px rgba(0,0,0,0.55);">في انتظار المتسابقين...</div><button type="button" class="scorear-gear-btn" onclick="ScoreARBots ? ScoreARBots.openModal() : ScoreARQuizHost.addDemoPlayer()" style="background:rgba(17,18,37,0.88);border-color:rgba(172,139,242,0.45);padding:8px 18px;font-size:12px;">${uiIcon('bot', 14)} <span>إضافة أبطال تجريبيين للقاعة</span></button></div>`;
    }
    return currentRoom.players.map((p, idx) => renderLobbyHeroSlotHtml(p, idx, currentRoom.players.length)).join('');
  }

  /* ── 2. ORIGINAL 3-STAGE PRE-CONTEST INTRO + REAL QUIZ TITLE + INTEGRATED HERO PATH PARADE ── */
  function renderContestIntroSequence(stage, currentRoom, quizTitle, totalQuestions, onDone) {
    if (global.ScoreARLobbyDirector?.stop) global.ScoreARLobbyDirector.stop();
    if (global.ScoreARWorldHalls?.cleanup) global.ScoreARWorldHalls.cleanup();
    if (global.ScoreARArena3D?.dispose) global.ScoreARArena3D.dispose();
    if (global.ScoreARDuelCoronation?.cleanup) global.ScoreARDuelCoronation.cleanup();
    global.ScoreARCardArena?.stopBotDirector?.();
    global.ScoreARCardCinema?.cleanup?.();
    if (global.ScoreARWorldCinematics?.stopEntranceFilm) global.ScoreARWorldCinematics.stopEntranceFilm();

    const worldId = currentRoom?.world?.id || currentRoom?.worldId || 'royal';
    const wName = currentRoom?.world?.name || 'القصر الملكي';
    const title = resolveRealQuizTitle(currentRoom, quizTitle);
    if (currentRoom) currentRoom.quizTitle = title;
    const isReduced = Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

    let finished = false;
    let stage3Started = false;
    const timers = [];
    const finishNow = () => {
      if (finished) return;
      finished = true;
      timers.forEach(t => clearTimeout(t));
      if (global.ScoreARWorldCinematics?.stopEntranceFilm) global.ScoreARWorldCinematics.stopEntranceFilm();
      if (typeof onDone === 'function') onDone();
    };
    global._skipScoreARIntro = finishNow;
    const marchMove = global.ScoreARWorldCinematics?.WORLD_FILMS?.[worldId]?.marchMove || 'walk';
    const introMoves = marchMove === 'fly'
      ? ['fly', 'land', 'wave', 'idle']
      : (marchMove === 'run' ? ['runRight', 'runLeft', 'wave', 'idle'] : ['walkRight', 'walkLeft', 'wave', 'idle']);
    global.ScoreARMotionV3?.preloadCharacters?.((currentRoom?.players || []).slice(0, 6), introMoves);

    function startStage3Countdown() {
      if (stage3Started || finished) return;
      stage3Started = true;
      if (global.ScoreARWorldCinematics?.stopEntranceFilm) global.ScoreARWorldCinematics.stopEntranceFilm();
      stage.innerHTML = `<div style="position:fixed;inset:0;overflow:hidden;"><img src="assets/halls/${escapeHtml(worldId)}-hall.jpg" onerror="this.onerror=null;this.src='assets/worlds/${escapeHtml(worldId)}/question.jpg';" alt="" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.45) blur(2px);"></div>
        <button type="button" class="scorear-gear-btn" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;z-index:30;padding:7px 16px;font-size:12px;">${uiIcon('skipForward', 14)} <span>تخطي</span></button>
        <div style="position:relative;z-index:20;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;direction:rtl;">
          <div style="font-size:16px;font-weight:800;color:#fde68a;margin-bottom:6px;">${escapeHtml(title)}</div>
          <div style="font-size:26px;font-weight:900;color:#58dce3;margin-bottom:10px;">انتباه يا أبطال</div>
          <h2 style="font-size:clamp(28px,4vw,42px);font-weight:900;color:#ffffff;margin:0 0 24px;">المسابقة تبدأ الآن... استعدوا!</h2>
          <div id="introReadyCount" style="width:132px;height:132px;border-radius:50%;background:linear-gradient(135deg,#7550ef,#3b147a);border:3px solid rgba(255,255,255,0.28);color:#ffffff;font-size:64px;font-weight:900;display:grid;place-items:center;box-shadow:0 18px 50px rgba(0,0,0,0.65);font-family:Montserrat,monospace;">3</div>
        </div>`;
      timers.push(setTimeout(() => { const el = document.getElementById('introReadyCount'); if (el) el.textContent = '2'; }, 1050));
      timers.push(setTimeout(() => { const el = document.getElementById('introReadyCount'); if (el) el.textContent = '1'; }, 2100));
      timers.push(setTimeout(() => finishNow(), 3150));
    }

    if (isReduced) {
      stage.innerHTML = `<div style="position:fixed;inset:0;background:#0b0c1b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:100;direction:rtl;text-align:center;padding:24px;">
        <span class="launch-pill">${escapeHtml(wName)} · ${totalQuestions} أسئلة</span>
        <h1 style="margin:0;font-size:36px;font-weight:900;color:#fff;">${escapeHtml(title)}</h1>
        <button type="button" class="btn launch-primary" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="padding:10px 28px;border-radius:12px;font-weight:900;">ابدأ الآن</button>
      </div>`;
      timers.push(setTimeout(finishNow, 1100));
      return;
    }

    // Stage 1: Preserved Iconic ScoreAR 4-Color Spinning Diamond Logo
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

    // Stage 2: Preserved Real Quiz Title Card + Integrated Grounded Hero Path Parade along the World Floor
    timers.push(setTimeout(() => {
      if (finished) return;
      stage.innerHTML = `<div style="position:fixed;inset:0;overflow:hidden;"><img src="assets/halls/${escapeHtml(worldId)}-hall.jpg" onerror="this.onerror=null;this.src='assets/worlds/${escapeHtml(worldId)}/question.jpg';" alt="" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.55) saturate(1.08);"><div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 28%,rgba(12,16,38,0.45),rgba(7,10,24,0.82));"></div></div>
        <button type="button" class="scorear-gear-btn" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="position:absolute;top:22px;left:24px;z-index:30;padding:7px 16px;font-size:12px;">${uiIcon('skipForward', 14)} <span>تخطي المقدمة</span></button>
        <div style="position:relative;z-index:20;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:42px 24px 16px;direction:rtl;">
          <span class="launch-pill" style="font-size:14px;padding:7px 22px;margin-bottom:14px;"><span class="live-dot"></span> عالم ${escapeHtml(wName)} · ${totalQuestions} أسئلة تفاعلية</span>
          <div style="background:rgba(12,16,38,0.86);backdrop-filter:blur(18px);border:1px solid rgba(172,139,242,0.34);padding:28px 50px;border-radius:24px;box-shadow:0 24px 65px rgba(0,0,0,0.75);max-width:900px;width:92%;animation:transferZoomIn 0.65s cubic-bezier(0.22,1,0.36,1) both;">
            <div style="font-size:13.5px;font-weight:800;color:#58dce3;margin-bottom:8px;">عنوان المسابقة</div>
            <h1 id="introRealQuizTitle" style="font-size:clamp(26px,3.8vw,40px);font-weight:900;color:#ffffff;margin:0;line-height:1.35;">${escapeHtml(title)}</h1>
            <div style="margin-top:20px;width:100%;height:6px;background:rgba(255,255,255,0.12);border-radius:999px;overflow:hidden;"><div style="height:100%;background:linear-gradient(90deg,#58dce3,#8e64ef,#fbbf24);animation:titleBarFill 5.6s linear forwards;"></div></div>
          </div>
          <div id="introHeroPathStage" style="position:relative;width:min(1040px,96%);flex:1;min-height:185px;margin-top:8px;overflow:hidden;pointer-events:none;"></div>
        </div>`;
      if (global.ScoreARWorldCinematics?.mountPathParade) {
        global.ScoreARWorldCinematics.mountPathParade(document.getElementById('introHeroPathStage'), currentRoom, worldId, {
          onArrived: () => { timers.push(setTimeout(startStage3Countdown, 1300)); }
        });
      }
      timers.push(setTimeout(startStage3Countdown, 6500));
    }, 2400));
  }

  /* ── 3. QUESTION READING & ANSWERING STAGE (Classic preserved 100%; 3D Arena uses Sheer Crystal Broadcast UI) ── */
  function renderHostQuestionView(stage, phase, qData, currentQIndex, total, worldId, timeRemaining, readingTimeRemaining) {
    if (global.ScoreARLobbyDirector?.stop) global.ScoreARLobbyDirector.stop();
    if (global.ScoreARWorldCinematics?.stopEntranceFilm) global.ScoreARWorldCinematics.stopEntranceFilm();
    if (global.ScoreARWorldHalls?.cleanup) global.ScoreARWorldHalls.cleanup();
    if (global.ScoreARArena3D?.dispose) global.ScoreARArena3D.dispose();
    if (global.ScoreARDuelCoronation?.cleanup) global.ScoreARDuelCoronation.cleanup();
    const isReading = (phase === 'reading'), opts = qData.options || qData.opts || [];
    const questionText = qData.text || qData.q || '', imgUrl = qData.imageUrl || qData.img || null;
    const wid = String(worldId || 'royal').trim() || 'royal';
    const wAccent = ARENA_WORLD_ACCENTS[wid] || '#38bdf8';
    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    const roomPin = room?.pin || global.ScoreARQuizHost?.getPin?.() || global.currentLobbyPin || '';
    const activeMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function')
      ? global.ScoreARGameModes.getMode()
      : (room?.gameMode || room?.mode || 'SOLO');
    const isArenaMode = Boolean(global.ScoreARArenaModes?.is3DArenaMode?.(activeMode));
    const isDuel = Boolean(global.ScoreARArenaModes?.isDuelMode?.(activeMode));
    const isSurvival = Boolean(global.ScoreARArenaModes?.isSurvivalMode?.(activeMode));
    const isCardArena = Boolean(global.ScoreARArenaModes?.isCardArenaMode?.(activeMode));
    if (room) {
      room._lastQIndex = currentQIndex;
      room._lastTotalQuestions = total;
    }
    if (isDuel && room && global.ScoreARArenaModes?.ensureAllTeamsAssigned) {
      global.ScoreARArenaModes.ensureAllTeamsAssigned(room);
    }
    const duelHudHtml = (isDuel && global.ScoreARArenaModes?.renderDuelScoreHudHtml)
      ? global.ScoreARArenaModes.renderDuelScoreHudHtml(
          global.ScoreARArenaModes.computeDuelScoreboard(room?.players || []),
          { compact: true, id: 'hostDuelScoreHud' }
        )
      : '';
    const survStatus = (isSurvival && room && global.ScoreARSurvivalEngine?.prepareNextRound)
      ? global.ScoreARSurvivalEngine.prepareNextRound(room, currentQIndex, total)
      : null;
    const survivalHudHtml = (isSurvival && survStatus && global.ScoreARSurvivalEngine?.renderSurvivalHudHtml)
      ? global.ScoreARSurvivalEngine.renderSurvivalHudHtml(survStatus)
      : '';
    const cardHudHtml = (isCardArena && global.ScoreARCardCinema?.renderCardArenaHudHtml)
      ? global.ScoreARCardCinema.renderCardArenaHudHtml(room, global.ScoreARCardArena?.getManager?.())
      : '';
    const hasTopHud = isDuel || (isSurvival && Boolean(survivalHudHtml)) || isCardArena;
    const displayPlayers = isSurvival
      ? (room?.players || []).filter(p => p && !p.eliminated)
      : (room?.players || []);

    const qCardStyle = isArenaMode
      ? `background:rgba(8,14,32,0.40);backdrop-filter:blur(12px);border:1px solid ${wAccent}55;border-top:2px solid ${wAccent};outline:none !important;border-radius:16px;padding:${isReading ? '18px 30px' : '10px 24px'};text-align:center;box-shadow:0 12px 34px rgba(0,0,0,0.32);margin:${isReading ? '8px auto 14px auto' : '2px auto 4px auto'};max-width:${isReading ? '720px' : '780px'};width:100%;transition:all 0.55s cubic-bezier(0.22, 1, 0.36, 1);`
      : `background:rgba(10, 16, 38, 0.78);backdrop-filter:blur(18px);border:none !important;outline:none !important;border-radius:14px;padding:${isReading ? '34px 48px' : '18px 36px'};text-align:center;box-shadow:0 18px 50px rgba(0,0,0,0.55);margin:${isReading ? '10px auto 18px auto' : '2px auto 6px auto'};max-width:1060px;width:100%;transition:all 0.65s cubic-bezier(0.22, 1, 0.36, 1);`;

    const actionWrapPos = isArenaMode
      ? 'position:fixed;top:52px;left:18px;z-index:65;pointer-events:auto;'
      : `position:absolute;top:${hasTopHud ? '118px' : '54px'};left:22px;z-index:28;`;

    const timerHtml = isArenaMode
      ? renderArenaMicroTimerHtml(wAccent, timeRemaining)
      : renderWorldTimerHtml(worldId, timeRemaining);

    const statsHtml = isArenaMode
      ? `<div style="width:54px;height:54px;border-radius:50%;background:rgba(8,14,32,0.44);backdrop-filter:blur(10px);border:1.5px solid rgba(56,189,248,0.55);display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,0.34);"><b id="hostAnsweredCount" style="color:#ffffff;font-size:21px;font-weight:900;font-family:Montserrat,monospace;">0</b></div>
         <span style="background:rgba(8,14,32,0.48);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.16);color:#e2e8f0;font-size:10.5px;font-weight:900;padding:1px 10px;border-radius:999px;">إجابات</span>`
      : `<div style="width:78px;height:78px;border-radius:50%;background:#3b147a;border:3px solid rgba(255,255,255,0.2);display:grid;place-items:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);"><b id="hostAnsweredCount" style="color:#ffffff;font-size:30px;font-weight:900;font-family:Montserrat,monospace;">0</b></div>
         <span style="background:#3b147a;color:#ffffff;font-size:12px;font-weight:900;padding:2px 14px;border-radius:999px;">إجابات</span>`;

    const readingHtml = isArenaMode
      ? `<div style="position:relative;width:76px;height:76px;display:flex;align-items:center;justify-content:center;background:rgba(8,14,32,0.44);backdrop-filter:blur(10px);border:1px solid ${wAccent}66;border-radius:50%;box-shadow:0 10px 28px rgba(0,0,0,0.34);">
           <svg width="76" height="76" viewBox="0 0 96 96" style="width:100% !important;height:100% !important;max-width:none !important;transform:rotate(-90deg);position:absolute;inset:0;"><circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.14)" stroke-width="6" fill="none"/><circle id="hostReadingProgressCircle" cx="48" cy="48" r="40" stroke="${wAccent}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;"/></svg>
           <div id="hostReadingCountdownNum" style="position:relative;z-index:2;font-size:28px;font-weight:900;color:#ffffff;font-family:Montserrat,monospace;">${readingTimeRemaining}</div>
         </div>
         <div style="background:rgba(8,14,32,0.48);backdrop-filter:blur(10px);border:1px solid ${wAccent}66;color:#ffffff;padding:4px 18px;border-radius:999px;font-size:14px;font-weight:900;direction:ltr;">${currentQIndex + 1} / ${total}</div>`
      : `<div style="position:relative;width:96px;height:96px;display:flex;align-items:center;justify-content:center;background:rgba(10,16,38,0.82);border-radius:50%;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
           <svg width="96" height="96" style="transform:rotate(-90deg);"><circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none"/><circle id="hostReadingProgressCircle" cx="48" cy="48" r="40" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;"/></svg>
           <div id="hostReadingCountdownNum" style="position:absolute;font-size:34px;font-weight:900;color:#ffffff;font-family:Montserrat,monospace;">${readingTimeRemaining}</div>
         </div>
         <div style="background:#3b147a;color:#ffffff;padding:6px 22px;border-radius:999px;font-size:16px;font-weight:900;direction:ltr;">${currentQIndex + 1} / ${total}</div>`;

    const optionsHtml = opts.slice(0, 4).map((optText, idx) => {
      const theme = OPTION_THEMES[idx % 4];
      if (isArenaMode) {
        return `<div id="hostOptionCard_${idx}" class="host-option-card" style="background:linear-gradient(135deg,rgba(8,14,32,0.46),${theme.bg}28);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.16);border-right:6px solid ${theme.bg};border-radius:14px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 22px rgba(0,0,0,0.28);min-height:54px;transition:all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);position:relative;"><div style="display:flex;align-items:center;gap:12px;"><span style="width:28px;height:28px;border-radius:8px;background:${theme.bg};display:grid;place-items:center;font-size:13px;color:#ffffff;flex-shrink:0;box-shadow:0 3px 10px ${theme.bg}66;">${theme.shape}</span><span id="hostOptionText_${idx}" style="font-size:17px;font-weight:900;color:#ffffff;line-height:1.35;text-shadow:0 2px 8px rgba(0,0,0,0.65);">${escapeHtml(optText)}</span></div><div id="hostOptionCountBadge_${idx}" style="display:none;background:rgba(0,0,0,0.45);border-radius:8px;padding:3px 10px;font-size:14px;font-weight:900;color:#fff;">0</div></div>`;
      }
      return `<div id="hostOptionCard_${idx}" class="host-option-card" style="background:${theme.bg};border:none;border-bottom:6px solid ${theme.border};border-radius:8px;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 20px rgba(0,0,0,0.35);min-height:86px;transition:all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);position:relative;"><div style="display:flex;align-items:center;gap:14px;"><span style="font-size:26px;color:#ffffff;line-height:1;">${theme.shape}</span><span id="hostOptionText_${idx}" style="font-size:21px;font-weight:900;color:#ffffff;line-height:1.35;">${escapeHtml(optText)}</span></div><div id="hostOptionCountBadge_${idx}" style="display:none;background:rgba(0,0,0,0.45);border-radius:8px;padding:4px 12px;font-size:16px;font-weight:900;color:#fff;">0</div></div>`;
    }).join('');

    stage.innerHTML = `
      ${isArenaMode
        ? `<div id="hostArena3DWrap" style="position:fixed;inset:0;overflow:hidden;z-index:1;pointer-events:none;background:#070a18;"></div>`
        : `<div style="position:fixed;inset:0;overflow:hidden;z-index:0;background:url('assets/worlds/${wid}/question.jpg') center/cover no-repeat;pointer-events:none;">
            <img src="assets/worlds/${wid}/question.jpg" alt="" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/worlds/${wid}/lobby.jpg';}else{this.style.display='none';}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.84) saturate(1.1);">
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 42%, rgba(20,16,52,0.28) 0%, rgba(10,12,28,0.68) 100%);"></div>
          </div>`}

      <header class="scorear-control-bar" style="position:relative;z-index:30;min-height:44px;display:flex;align-items:center;justify-content:space-between;padding:4px 18px;color:#ffffff;direction:rtl;">
        <div onclick="ScoreARQuizHostView.toggleQrZoom('${roomPin}')" style="display:flex;align-items:center;gap:8px;cursor:pointer;" title="اضغط لتكبير الباركود">
          <span class="scorear-control-pill" style="padding:3px 10px;">${uiIcon('qrCode', 14)} <span>رمز PIN: <b style="color:#fcd34d;font-family:Montserrat,monospace;font-size:14px;">${roomPin}</b></span></span>
        </div>
        <div style="font-size:18px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;">ScoreAR<span style="color:#58dce3;">.</span></div>
        <div style="display:flex;align-items:center;gap:8px;direction:ltr;">
          <button type="button" class="scorear-gear-btn" onclick="if(!document.fullscreenElement){document.documentElement.requestFullscreen?.();}else{document.exitFullscreen?.();}" style="padding:4px 9px;">${uiIcon('maximize', 13)}</button>
          <button type="button" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" style="padding:4px 9px;">${uiIcon('volume', 13)}</button>
          <span class="scorear-control-pill" style="padding:3px 9px;font-size:12px;">${uiIcon('users', 13)} <b id="hostTotalStudentsCount">${displayPlayers.length}</b></span>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.closeHostSession()" style="border-color:rgba(239,68,68,0.35);color:#fca5a5;padding:4px 9px;">${uiIcon('close', 13)}</button>
        </div>
      </header>

      ${isDuel ? `<div id="hostDuelScoreHudWrap" style="position:relative;z-index:26;padding:3px 18px 0;pointer-events:none;">${duelHudHtml}</div>` : ''}
      ${isSurvival ? `<div id="hostSurvivalHudWrap" style="position:relative;z-index:26;padding:3px 18px 0;pointer-events:none;">${survivalHudHtml}</div>` : ''}
      ${isCardArena ? `<div id="hostCardArenaHudWrap" style="position:relative;z-index:26;padding:3px 18px 0;pointer-events:none;">${cardHudHtml}</div>` : ''}

      <div id="hostTopLeftActionWrap" style="${actionWrapPos}">
        <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.finishCurrentQuestion()" style="background:rgba(14,15,32,0.88);border-color:rgba(255,255,255,0.22);color:#ffffff;padding:8px 16px;font-size:12.5px;box-shadow:0 6px 18px rgba(0,0,0,0.45);">${uiIcon('skipForward', 14)} <span>إنهاء السؤال</span></button>
      </div>

      <main id="hostQuestionArena" class="host-question-arena" style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:${isReading ? 'center' : 'space-between'};align-items:center;padding:${isArenaMode ? '4px 20px 12px' : '12px 24px 18px'};width:100%;box-sizing:border-box;pointer-events:none;">
        <div id="hostReadingDiamondBadge" style="display:${isReading ? 'grid' : 'none'};width:54px;height:54px;border-radius:50%;background:rgba(17,17,17,0.75);place-items:center;margin-bottom:14px;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <div style="width:34px;height:34px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;transform:rotate(12deg);"><div style="background:#e21b3c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">▲</div><div style="background:#1368ce;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">◆</div><div style="background:#d89e00;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">●</div><div style="background:#26890c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">■</div></div>
        </div>

        <div id="hostQuestionCard" class="host-question-card" style="${qCardStyle}">
          <h2 id="hostQuestionText" style="font-size:${isArenaMode ? (isReading ? '26px' : '21px') : (isReading ? '36px' : '26px')};font-weight:900;color:#ffffff;line-height:1.45;margin:0;transition:all 0.55s cubic-bezier(0.22, 1, 0.36, 1);text-shadow:0 3px 14px rgba(0,0,0,0.65);">${escapeHtml(questionText)}</h2>
          ${imgUrl ? `<div id="hostQuestionImgBox" style="display:flex;justify-content:center;margin:10px 0 0;max-height:${isReading ? '200px' : '130px'};transition:max-height 0.55s ease;"><img src="${imgUrl}" alt="" style="max-height:100%;max-width:100%;object-fit:contain;border-radius:10px;"></div>` : ''}
        </div>

        <div id="hostReadingCountdownArea" style="display:${isReading ? 'flex' : 'none'};flex-direction:column;align-items:center;justify-content:center;gap:12px;margin-top:8px;transition:opacity 0.35s ease, transform 0.35s ease;">
          ${readingHtml}
        </div>

        <div id="hostAnsweringMidRow" style="display:${isReading ? 'none' : 'flex'};width:100%;max-width:1240px;flex:${isArenaMode ? '1' : '0 0 auto'};align-items:${isArenaMode ? 'flex-start' : 'center'};justify-content:space-between;padding:${isArenaMode ? '4px 12px 6px' : '0 12px'};margin:${isArenaMode ? '0 auto' : 'auto 0'};direction:rtl;">
          <div id="hostTimerArea" style="display:flex;align-items:center;justify-content:center;">${timerHtml}</div>
          <div id="hostCenterResultMount" style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 16px;"></div>
          <div id="hostLiveAnswerStats" style="display:flex;flex-direction:column;align-items:center;gap:4px;">${statsHtml}</div>
        </div>

        <div id="hostOptionsGrid" class="host-options-grid" style="display:${isReading ? 'none' : 'grid'};grid-template-columns:1fr 1fr;gap:${isArenaMode ? '10px' : '12px'};max-width:${isArenaMode ? '820px' : '1260px'};margin:0 auto;width:100%;direction:rtl;pointer-events:auto;">
          ${optionsHtml}
        </div>
      </main>`;

    if (isArenaMode && global.ScoreARArena3D?.mount) {
      const mountEl = document.getElementById('hostArena3DWrap');
      global.ScoreARArena3D.mount(mountEl, {
        worldId: wid,
        mode: activeMode,
        layout: (isSurvival || isCardArena) ? 'ring' : 'duel',
        phase: isReading ? 'reading' : 'answering',
        qIndex: currentQIndex,
        players: displayPlayers,
        room
      });
      if (isCardArena) {
        global.ScoreARArena3D.syncCardActorsState?.(displayPlayers, global.ScoreARCardArena?.getManager?.());
      }
    }
  }

  function animateToAnswering(stage, qData, currentQIndex, total, worldId, timeRemaining) {
    const card = document.getElementById('hostQuestionCard'), textEl = document.getElementById('hostQuestionText');
    const readingArea = document.getElementById('hostReadingCountdownArea'), diamond = document.getElementById('hostReadingDiamondBadge');
    const arena = document.getElementById('hostQuestionArena'), midRow = document.getElementById('hostAnsweringMidRow');
    const timerArea = document.getElementById('hostTimerArea'), optionsGrid = document.getElementById('hostOptionsGrid');
    if (!card || !readingArea || !midRow || !optionsGrid) { renderHostQuestionView(stage, 'answering', qData, currentQIndex, total, worldId, timeRemaining, 0); return; }
    const isArena = Boolean(global.ScoreARArena3D?.isActive?.() || global.ScoreARArenaModes?.is3DArenaMode?.());
    const wid = String(worldId || 'royal').trim() || 'royal';
    const wAccent = ARENA_WORLD_ACCENTS[wid] || '#38bdf8';
    if (diamond) diamond.style.display = 'none';
    readingArea.style.opacity = '0'; readingArea.style.transform = 'scale(0.85)';
    setTimeout(() => { readingArea.style.display = 'none'; }, 180);
    if (arena) arena.style.justifyContent = 'space-between';
    card.style.margin = isArena ? '2px auto 4px auto' : '4px auto 8px auto';
    card.style.padding = isArena ? '10px 24px' : '18px 36px';
    if (isArena) card.style.maxWidth = '780px';
    if (textEl) textEl.style.fontSize = isArena ? '21px' : '26px';
    if (timerArea) timerArea.innerHTML = isArena ? renderArenaMicroTimerHtml(wAccent, timeRemaining) : renderWorldTimerHtml(worldId, timeRemaining);
    midRow.style.display = 'flex';
    if (isArena) {
      midRow.style.flex = '1';
      midRow.style.alignItems = 'flex-start';
      midRow.style.margin = '0 auto';
    }
    optionsGrid.style.display = 'grid';
    (qData.options || qData.opts || []).slice(0, 4).forEach((_, idx) => {
      const optCard = document.getElementById(`hostOptionCard_${idx}`);
      if (optCard) { optCard.style.animation = 'none'; void optCard.offsetWidth; optCard.style.animation = `optionEntranceSlide 0.45s cubic-bezier(0.16, 1, 0.3, 1) both ${idx * 0.06}s`; }
    });
    if (global.ScoreARArena3D?.isActive?.()) {
      global.ScoreARArena3D.setPhase('answering', { qIndex: currentQIndex });
    }
  }

  /* ── 4. 4-COLUMN BAR CHART + FRAMELESS 3D ARENA LIGHT-BARS + DIRECT SURVIVAL NEXT ── */
  function renderQuestionResultBarChart(qData, counts, correctIndices, fastest, explanation, isLastQuestion = false) {
    const centerMount = document.getElementById('hostCenterResultMount') || document.getElementById('hostTimerArea');
    const timerArea = document.getElementById('hostTimerArea'), liveStats = document.getElementById('hostLiveAnswerStats'), topLeftWrap = document.getElementById('hostTopLeftActionWrap');
    const optionsGrid = document.getElementById('hostOptionsGrid');
    const activeMode = (global.ScoreARGameModes && typeof global.ScoreARGameModes.getMode === 'function')
      ? global.ScoreARGameModes.getMode()
      : 'SOLO';
    const isArena = Boolean(global.ScoreARArena3D?.isActive?.() || global.ScoreARArenaModes?.is3DArenaMode?.(activeMode));
    const isDuel = Boolean(global.ScoreARArenaModes?.isDuelMode?.(activeMode));
    const isSurvival = Boolean(global.ScoreARArenaModes?.isSurvivalMode?.(activeMode));
    const isCardArena = Boolean(global.ScoreARArenaModes?.isCardArenaMode?.(activeMode));
    if (timerArea && centerMount !== timerArea) timerArea.style.display = 'none';
    if (liveStats) liveStats.style.display = 'none';

    const room = global.ScoreARQuizHost?.getCurrentRoom?.() || null;
    const evalRes = global.__scorearLastEvalResult || { fastest, playerResults: {}, correct: correctIndices };

    let nextAction = isLastQuestion ? 'ScoreARQuizHost.renderHostPodium()' : 'ScoreARQuizHost.renderHostLeaderboard()';
    let nextLabel = isLastQuestion ? 'منصة التتويج ❯' : 'التالي ❯';

    if (isArena) {
      if (optionsGrid) optionsGrid.style.display = 'none';
      if (global.ScoreARArena3D?.isActive?.()) {
        global.ScoreARArena3D.onQuestionResult(evalRes, room?.players || []);
      }
      if (isDuel) {
        const hudWrap = document.getElementById('hostDuelScoreHudWrap');
        if (hudWrap && global.ScoreARArenaModes?.computeDuelScoreboard && global.ScoreARArenaModes?.renderDuelScoreHudHtml) {
          hudWrap.innerHTML = global.ScoreARArenaModes.renderDuelScoreHudHtml(
            global.ScoreARArenaModes.computeDuelScoreboard(room?.players || []),
            { compact: true, showGain: true, id: 'hostDuelScoreHud' }
          );
        }
        nextAction = isLastQuestion ? 'ScoreARQuizHost.renderHostPodium()' : 'ScoreARQuizHost.renderHostLeaderboard()';
        nextLabel = isLastQuestion ? '🏆 تتويج الفريق الفائز ❯' : 'ملخص الجولة ❯';
      }
      if (isSurvival && global.ScoreARSurvivalEngine) {
        const survWrap = document.getElementById('hostSurvivalHudWrap');
        const sRes = evalRes.survivalResult || room?._survival?.lastElimEvent;
        const qIdxNow = room?._lastQIndex ?? 0;
        const totalQs = room?._lastTotalQuestions ?? 1;
        if (survWrap) {
          const st = global.ScoreARSurvivalEngine.getStatus(room, qIdxNow, totalQs);
          survWrap.innerHTML = global.ScoreARSurvivalEngine.renderSurvivalHudHtml(st)
            + ((sRes && Array.isArray(sRes.eliminatedPlayers) && sRes.eliminatedPlayers.length)
              ? global.ScoreARSurvivalEngine.renderSurvivalElimBannerHtml(sRes)
              : '');
        }
        if (sRes && Array.isArray(sRes.eliminatedPlayers) && sRes.eliminatedPlayers.length) {
          global.ScoreARArena3D?.onSurvivalElimination?.(sRes.eliminatedPlayers, evalRes);
        }
        const goPodium = Boolean(isLastQuestion || sRes?.championEarly || (qIdxNow + 1 >= totalQs));
        nextAction = goPodium ? 'ScoreARQuizHost.renderHostPodium()' : `ScoreARQuizHost.launchQuestion(${qIdxNow + 1})`;
        nextLabel = goPodium ? '🏆 تتويج الناجي الأقوى ❯' : 'السؤال التالي ❯';
      }
      if (isCardArena) {
        global.ScoreARCardCinema?.updateCardArenaHud?.(room, global.ScoreARCardArena?.getManager?.());
        nextAction = isLastQuestion ? 'ScoreARQuizHost.renderHostPodium()' : 'ScoreARQuizHost.renderHostLeaderboard()';
        nextLabel = isLastQuestion ? '🏆 منصة التتويج ❯' : 'الترتيب والكروت ❯';
      }
      const midRow = document.getElementById('hostAnsweringMidRow');
      if (midRow) {
        midRow.style.marginTop = 'auto';
        midRow.style.alignItems = 'flex-end';
      }
    }

    if (topLeftWrap) {
      topLeftWrap.innerHTML = `<button type="button" id="hostNextQuestionBtn" onclick="${nextAction}" style="background:${isArena ? 'linear-gradient(135deg,#ffffff,#e2e8f0)' : '#ffffff'};color:#0f172a;border:${isArena ? '2px solid #fbbf24' : 'none'};border-bottom:4px solid #cbd5e1;border-radius:${isArena ? '999px' : '6px'};padding:9px 24px;font-size:15px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 10px 26px rgba(0,0,0,0.5);pointer-events:auto;">${nextLabel}</button>`;
    }

    if (!centerMount) return;
    const maxCount = Math.max(1, ...counts);

    if (isArena) {
      const totalAns = counts.reduce((acc, c) => acc + (c || 0), 0);
      const optsList = qData?.options || qData?.opts || [];
      const correctText = (Array.isArray(correctIndices) && correctIndices.length && optsList[correctIndices[0]])
        ? optsList[correctIndices[0]]
        : (evalRes?.correctAnswerText || '');
      centerMount.innerHTML = `
        <div id="hostArenaFramelessResults" style="width:100%;max-width:680px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:auto;animation:optionEntranceSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;">
          <div style="width:100%;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:end;height:112px;padding:0 12px;direction:rtl;">
            ${[0, 1, 2, 3].map(i => {
              const theme = OPTION_THEMES[i % 4], count = counts[i] || 0, isCorrect = correctIndices.includes(i);
              const pct = totalAns > 0 ? Math.round((count / totalAns) * 100) : 0;
              const heightPx = count > 0 ? Math.max(26, Math.round((count / maxCount) * 74)) : 14;
              return `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
                  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;font-size:14px;font-weight:900;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,0.92);">
                    ${isCorrect ? '<span style="color:#34d399;font-size:15px;">✓</span>' : ''}
                    <span>${count}</span>
                    ${totalAns > 0 ? `<small style="font-size:11px;opacity:0.78;">(${pct}%)</small>` : ''}
                  </div>
                  <div style="width:100%;max-width:84px;height:${heightPx}px;background:linear-gradient(180deg,${theme.bg}${isCorrect ? 'e6' : '88'} 0%,${theme.bg}22 100%);backdrop-filter:blur(8px);border:1.5px solid ${isCorrect ? '#34d399' : theme.bg + '88'};border-top:4px solid ${isCorrect ? '#6ee7b7' : theme.bg};border-radius:12px 12px 4px 4px;display:flex;align-items:center;justify-content:center;transition:height 0.65s cubic-bezier(0.34,1.56,0.64,1);box-shadow:${isCorrect ? '0 0 24px rgba(52,211,153,0.45)' : '0 6px 18px rgba(0,0,0,0.28)'};">
                    <span style="font-size:15px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,0.7);">${theme.shape}</span>
                  </div>
                </div>`;
            }).join('')}
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;">
            ${correctText ? `<div style="background:rgba(8,14,32,0.44);backdrop-filter:blur(10px);border:1px solid rgba(52,211,153,0.48);border-radius:999px;padding:4px 14px;font-size:12.5px;font-weight:900;color:#6ee7b7;">✓ الإجابة: <span style="color:#fff;">${escapeHtml(correctText)}</span></div>` : ''}
            ${fastest && fastest.name ? `<div style="background:rgba(245,158,11,0.18);backdrop-filter:blur(10px);border:1px solid rgba(251,191,36,0.48);border-radius:999px;padding:4px 14px;display:inline-flex;align-items:center;gap:6px;"><span class="scorear-inline-icon" style="font-size:12px;font-weight:900;color:#fef08a;">${uiIcon('zap', 13)} الأسرع: ${escapeHtml(fastest.name)} (${fastest.timeSec}ث)</span></div>` : ''}
            ${explanation ? `<div style="background:rgba(8,14,32,0.42);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.16);border-radius:999px;padding:4px 14px;font-size:11.5px;color:#e2e8f0;font-weight:800;">💡 ${escapeHtml(explanation)}</div>` : ''}
          </div>
        </div>`;
      return;
    }

    centerMount.innerHTML = `<div style="width:100%;max-width:780px;margin:0 auto;background:rgba(10,16,38,0.88);backdrop-filter:blur(18px);border:1px solid rgba(172,139,242,0.28);border-radius:18px;padding:16px 26px;box-shadow:0 20px 55px rgba(0,0,0,0.65);animation:optionEntranceSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;pointer-events:auto;">
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:18px;align-items:end;height:150px;padding:8px 14px 0;direction:rtl;">
        ${[0, 1, 2, 3].map(i => {
          const theme = OPTION_THEMES[i % 4], count = counts[i] || 0, isCorrect = correctIndices.includes(i);
          const heightPx = count > 0 ? Math.max(24, Math.round((count / maxCount) * 105)) : 12;
          return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;"><div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;font-size:18px;font-weight:900;color:#fff;">${isCorrect ? '<span style="color:#34d399;font-size:16px;">✓</span>' : ''}<span>${count}</span></div><div style="width:100%;max-width:96px;height:${heightPx}px;background:${theme.bg};border-bottom:5px solid ${theme.border};border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:center;transition:height 0.65s cubic-bezier(0.34,1.56,0.64,1);opacity:${isCorrect ? '1' : '0.48'};"><span style="font-size:16px;color:#fff;">${theme.shape}</span></div></div>`;
        }).join('')}
      </div>
      ${fastest && fastest.name ? `<div style="margin-top:8px;background:rgba(245,158,11,0.14);border:1px solid rgba(251,191,36,0.38);border-radius:12px;padding:5px 12px;display:inline-flex;align-items:center;gap:8px;"><img src="assets/characters/animated/${escapeHtml(fastest.avatarId || 'char_01')}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${escapeHtml(fastest.name)}" style="width:30px;height:36px;object-fit:contain;"><span class="scorear-inline-icon" style="font-size:12.5px;font-weight:900;color:#fef08a;">${uiIcon('zap', 14)} الأسرع: ${escapeHtml(fastest.name)} (${fastest.timeSec}ث)</span></div>` : ''}
      ${explanation ? `<div style="margin-top:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:6px 12px;font-size:12.5px;color:#f1f5f9;text-align:center;"><b>التفسير:</b> ${escapeHtml(explanation)}</div>` : ''}
    </div>`;
  }

  const ScoreARQuizHostView = { setLobbyHeroesPose, cycleSingleHeroPose, toggleQrZoom, renderContestIntroSequence, renderQuestionResultBarChart, renderHostLobby, refreshLobbyUi, updateLobbyModeBadge, renderFullbodyCharactersHtml, renderHostQuestionView, renderWorldTimerHtml, animateToAnswering, WORLD_TIMER_CONFIGS };
  global.ScoreARQuizHostView = ScoreARQuizHostView;
  global.ScoreARHostView = ScoreARQuizHostView;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARQuizHostView = ScoreARQuizHostView; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARQuizHostView;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
