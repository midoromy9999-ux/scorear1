/**
 * ScoreAR — Dedicated 3D Winning-Team Coronation Ceremony (`DUEL_TEAMS`)
 * Celebrates ONLY the winning team (or heroic tie) with teacher custom team names,
 * 4-second blackout & crossing dual spotlights, 3D Victory Semicircle for all winning
 * members (no #1/#2/#3 individual rankings), fireworks, confetti & WebGL disposal.
 */
(function (global) {
  'use strict';

  const WORLD_PALETTES = {
    royal: { name: 'القصر الملكي', bg: 'assets/halls/royal-hall.jpg', fb: 'assets/worlds/royal/podium.jpg', warm: 0xffd166, cool: 0x3b82f6, floor: 0x12102a, fog: 0x09081a, accent: '#fbbf24' },
    stadium: { name: 'استاد الأبطال', bg: 'assets/halls/stadium-hall.jpg', fb: 'assets/worlds/stadium/podium.jpg', warm: 0x38bdf8, cool: 0x10b981, floor: 0x091829, fog: 0x06101d, accent: '#38bdf8' },
    cosmic: { name: 'محطة الفضاء', bg: 'assets/halls/cosmic-hall.jpg', fb: 'assets/worlds/cosmic/podium.jpg', warm: 0xa855f7, cool: 0x06b6d4, floor: 0x090820, fog: 0x050414, accent: '#c084fc' },
    treasure: { name: 'جزيرة الكنز', bg: 'assets/halls/treasure-hall.jpg', fb: 'assets/worlds/treasure/podium.jpg', warm: 0xf59e0b, cool: 0x14b8a6, floor: 0x181209, fog: 0x0f0b05, accent: '#fbbf24' },
    oasis: { name: 'الواحة العربية', bg: 'assets/halls/oasis-hall.jpg', fb: 'assets/worlds/oasis/podium.jpg', warm: 0xfbbf24, cool: 0x0ea5e9, floor: 0x14120c, fog: 0x0c0b07, accent: '#34d399' },
    magic: { name: 'مملكة السحر', bg: 'assets/halls/magic-hall.jpg', fb: 'assets/worlds/magic/podium.jpg', warm: 0xc084fc, cool: 0xf472b6, floor: 0x120a24, fog: 0x090514, accent: '#e879f9' }
  };

  let state = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const ic = (n, sz = 14) => (global.ScoreARUI?.icon) ? global.ScoreARUI.icon(n, { size: sz }) : '';
  const sfx = (n, v) => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n, v); };
  const isReduced = () => Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const charCode = raw => 'char_' + String(Math.max(1, Math.min(20, parseInt(String(raw || '1').replace(/\D/g, '') || '1', 10)))).padStart(2, '0');

  function makeTeamPlateTexture(THREE, name, emoji, borderHex) {
    const c = document.createElement('canvas');
    c.width = 300;
    c.height = 72;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(8, 13, 30, 0.84)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(6, 6, 288, 60, 20) : ctx.rect(6, 6, 288, 60);
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = borderHex;
    ctx.stroke();

    ctx.font = 'bold 24px Cairo, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${emoji} ${String(name || 'بطل').slice(0, 14)}`, 150, 37);

    const tex = new THREE.CanvasTexture(c);
    if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
    else if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  function scheduleTimer(fn, ms) {
    if (!state) return null;
    const id = setTimeout(() => {
      if (state) state.timers = state.timers.filter(t => t !== id);
      fn();
    }, ms);
    state.timers.push(id);
    return id;
  }

  function computeFormationSlots(members) {
    const list = (Array.isArray(members) ? members : []).filter(Boolean).slice(0, 20);
    const total = Math.max(1, list.length);
    const frontCap = Math.min(10, Math.ceil(total / 2) + (total <= 5 ? total : 0));
    const slots = [];
    list.forEach((m, idx) => {
      const isBack = idx >= frontCap;
      const rowCount = isBack ? Math.max(1, total - frontCap) : Math.max(1, Math.min(total, frontCap));
      const rowIdx = isBack ? (idx - frontCap) : idx;
      const u = rowCount === 1 ? 0.5 : rowIdx / (rowCount - 1);
      const angle = (-Math.PI * 0.85) + u * (Math.PI * 0.70);
      const radius = isBack ? 7.4 : 5.3;
      slots.push({
        player: m,
        x: Math.cos(angle) * radius,
        y: isBack ? 0.62 : 0,
        z: Math.sin(angle) * radius + 1.5
      });
    });
    return slots;
  }

  function revealWinningTeam(immediate) {
    if (!state || !state.active || state.revealed) return;
    state.revealed = true;
    state.suspenseActive = false;
    try {
      const payload = {
        mode: 'DUEL_TEAMS',
        winnerTeamId: state.isTie ? 'tie' : (state.winner?.id || ''),
        allRevealed: true
      };
      if (global.ScoreARHostEvents?.publishPodiumReveal) global.ScoreARHostEvents.publishPodiumReveal(payload);
      else global.ScoreARRealtime?.publish?.('PODIUM_REVEAL', payload);
    } catch (_) {}

    state.timers.forEach(id => clearTimeout(id));
    state.timers = [];

    const suspenseEl = document.getElementById('scDuelSuspenseBanner');
    if (suspenseEl) suspenseEl.style.display = 'none';
    const bannerEl = document.getElementById('hostDuelChampionRevealBanner');
    if (bannerEl) {
      bannerEl.style.display = 'flex';
      bannerEl.style.opacity = '1';
      bannerEl.style.transform = 'scale(1)';
    }
    const skipBtn = document.getElementById('scDuelSkipBtn');
    if (skipBtn) skipBtn.style.display = 'none';
    const actionsBar = document.getElementById('scDuelFooterActions');
    if (actionsBar) actionsBar.style.display = 'flex';

    global.ScoreARAudio?.unduckMusic?.(450);
    if (!immediate) {
      sfx('spotlightLock', 0.96);
      sfx('victoryFanfare', 0.96);
      sfx('applauseGrand', 0.92);
      global.ScoreARAudio?.crossfadeMusic?.('celebration', 0.32, 650);
    }

    if (state.spotRig) {
      state.spotRig.setBlackout(0, Boolean(immediate));
      if (!immediate) state.spotRig.triggerLightsUpFlash();
      state.spotRig.setMode('celebrate');
      state.spotRig.triggerRankShock(0, -0.4, state.teamHex, 6.2);
    }
    if (state.ambientLight) state.ambientLight.intensity = 1.05;
    if (state.camDirector) {
      state.camDirector.setShot([0, 3.25, 11.4], [0, 1.35, -0.4], 2.4);
    }

    state.actors.forEach(a => {
      if (a.hero?.setAction) {
        a.hero.setAction(immediate ? 'win' : 'jump', immediate ? true : false);
      }
      if (a.el) a.el.style.transform = 'translateY(-8px) scale(1.04)';
    });

    if (!immediate) {
      scheduleTimer(() => {
        if (!state || !state.active) return;
        state.actors.forEach(a => {
          if (a.hero?.setAction) a.hero.setAction('win', true);
        });
      }, 780);
    }

    if (!immediate && !isReduced()) {
      if (state.particles) {
        state.particles.spawnFirework(-3.6, 4.8, -1.6, [state.teamHex, 0xfef08a, 0xffffff], 80);
        state.particles.spawnFirework(3.6, 5.2, -1.6, [state.teamHex, 0xfde047, 0xffffff], 80);
      }
      if (global.confetti) {
        global.confetti({ particleCount: 150, spread: 140, origin: { y: 0.52 }, colors: [state.teamCss, '#fde047', '#ffffff'] });
      }
    }
  }

  function startSuspenseReveal() {
    if (!state || !state.active) return;
    if (isReduced()) { revealWinningTeam(true); return; }

    state.suspenseActive = true;
    global.ScoreARAudio?.duckMusic?.(0.05, 450);
    sfx('drumroll', 0.96);

    const suspenseEl = document.getElementById('scDuelSuspenseBanner');
    if (suspenseEl) suspenseEl.style.display = 'inline-flex';
    const bannerEl = document.getElementById('hostDuelChampionRevealBanner');
    if (bannerEl) bannerEl.style.display = 'none';

    if (state.spotRig) {
      state.spotRig.setBlackout(0.86, false);
      state.spotRig.setMode('sweep', { durationMs: 4000, lockTarget: [0, 0.3, -0.3] });
    }
    if (state.ambientLight) state.ambientLight.intensity = 0.25;
    if (state.camDirector) {
      state.camDirector.setShot([0, 3.85, 12.8], [0, 1.4, -0.4], 1.6);
    }

    scheduleTimer(() => revealWinningTeam(false), 4000);
  }

  function mount2DFallback(wrap, slots, sb, isTie, winner) {
    if (!wrap) return;
    const grid = document.createElement('div');
    grid.id = 'scDuelCoronationFallback';
    grid.style.cssText = 'position:absolute;inset:0;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:center;gap:14px;padding:120px 28px 92px;z-index:8;pointer-events:none;';
    slots.forEach(slot => {
      const m = slot.player;
      const code = charCode(m.avatarId);
      const tHex = m.teamId === 'team_b' ? '#fb923c' : '#38bdf8';
      const card = document.createElement('div');
      card.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 12px;border-radius:16px;background:rgba(8,14,32,0.58);backdrop-filter:blur(8px);border:1.5px solid ${tHex};transition:transform 0.4s ease;`;
      card.innerHTML = `<img src="assets/motion-v3/originals/${code}.png" onerror="this.onerror=null;this.src='assets/characters/animated/${code}-idle.webp';" style="width:68px;height:84px;object-fit:contain;"><span style="font-size:12px;font-weight:900;color:#fff;">${isTie ? (m.teamId === 'team_b' ? '🦁' : '🦅') : winner.emoji} ${esc(m.name)}</span>`;
      grid.appendChild(card);
      state.actors.push({ player: m, el: card, hero: null });
    });
    wrap.appendChild(grid);
  }

  function renderDuelTeamCoronation(stage, currentRoom, onClose) {
    if (!stage || !currentRoom) return;
    if (global.ScoreARWorldHalls?.cleanup) global.ScoreARWorldHalls.cleanup();
    if (global.ScoreARPodiumScenes?.stopStage) global.ScoreARPodiumScenes.stopStage();
    if (global.ScoreARArena3D?.dispose) global.ScoreARArena3D.dispose();
    cleanup();

    const wid = currentRoom.world?.id || currentRoom.worldId || 'royal';
    const pal = WORLD_PALETTES[wid] || WORLD_PALETTES.royal;
    const sb = global.ScoreARArenaModes?.computeDuelScoreboard
      ? global.ScoreARArenaModes.computeDuelScoreboard(currentRoom.players || [])
      : null;
    if (!sb) return;

    const isTie = sb.leaderTeamId === 'tie';
    const winner = isTie ? null : sb[sb.leaderTeamId];
    const loser = isTie ? null : sb[sb.leaderTeamId === 'team_a' ? 'team_b' : 'team_a'];
    const winningMembers = isTie ? (currentRoom.players || []) : (winner?.members || []);
    const slots = computeFormationSlots(winningMembers);
    const teamHex = isTie ? 0xfbbf24 : (winner.id === 'team_b' ? 0xf97316 : 0x38bdf8);
    const teamCss = isTie ? '#fbbf24' : winner.accent;
    const quizTitle = global.ScoreARQuizHostView?.resolveRealQuizTitle
      ? global.ScoreARQuizHostView.resolveRealQuizTitle(currentRoom, '') : (currentRoom.quizTitle || '');
    const isMuted = Boolean(global.ScoreARAudio?.isMuted?.());

    const winnerMembersHtml = (list, emoji, accent) => list.length
      ? list.map(m => `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid ${accent}44;"><img src="assets/motion-v3/originals/${charCode(m.avatarId)}.png" onerror="this.onerror=null;this.src='assets/characters/animated/char_01-idle.webp';" style="width:28px;height:32px;object-fit:contain;"><span style="font-size:13px;font-weight:800;color:#fff;">${emoji} ${esc(m.name)}</span></div>`).join('')
      : '<div style="font-size:12px;color:#94a3b8;">لا يوجد أعضاء</div>';

    const reduced = isReduced();
    stage.innerHTML = `
      <style>
        #scDuelCoronationRoot { position:relative;width:100%;height:100%;overflow:hidden;direction:rtl;font-family:Cairo,Tajawal,sans-serif;display:flex;flex-direction:column;background:#070a18; }
        #scDuelHeroBannerWrap { position:relative;z-index:25;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 16px;pointer-events:none; }
        .sc-duel-cam-btn.is-active { background:linear-gradient(135deg,${teamCss},#d97706) !important;color:#080c1c !important;border-color:#fff !important; }
      </style>
      <div id="scDuelCoronationRoot" data-coronation-mode="DUEL_TEAMS" data-winning-team="${isTie ? 'tie' : esc(winner.id)}">
        <div style="position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;">
          <img id="scDuelBgImg" src="${esc(pal.bg)}" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${esc(pal.fb)}';}else{this.style.display='none';}" alt="" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.72) saturate(1.1);">
          <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,rgba(10,14,32,0.16) 0%,rgba(5,8,20,0.82) 100%);"></div>
        </div>
        <div id="scDuel3DWrap" style="position:absolute;inset:0;z-index:2;pointer-events:auto;"></div>
        <div id="scDuelBlackoutVig" style="position:absolute;inset:0;z-index:5;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 48%,rgba(2,5,14,0.14) 14%,rgba(2,5,14,0.88) 100%);"></div>

        <header class="scorear-control-bar" style="position:relative;z-index:35;display:flex;align-items:center;justify-content:space-between;padding:8px 18px;gap:8px;flex-wrap:wrap;flex-shrink:0;">
          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" class="scorear-gear-btn" onclick="ScoreARDuelCoronation.exit()" style="border-color:rgba(239,68,68,0.42);color:#fca5a5;">${ic('close', 13)} <span>إنهاء</span></button>
            <button type="button" id="scDuelMuteBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARDuelCoronation.toggleMute()">${ic(isMuted ? 'volumeOff' : 'volume', 14)}</button>
          </div>
          <span class="scorear-control-pill" style="border-color:${teamCss};color:#fff;font-weight:900;">⚔️ تتويج فريق التحدي${quizTitle ? ` · ${esc(quizTitle)}` : ''}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" id="scDuelSkipBtn" class="scorear-gear-btn" onclick="ScoreARDuelCoronation.skipToReveal()" style="border-color:${teamCss};color:#fef08a;">${ic('zap', 13)} <span>تخطي الترقب</span></button>
            <button type="button" class="scorear-gear-btn" onclick="ScoreARDuelCoronation.replay()">${ic('play', 13)} <span>إعادة العرض</span></button>
          </div>
        </header>

        <div id="scDuelHeroBannerWrap">
          <div id="scDuelSuspenseBanner" style="display:${reduced ? 'none' : 'inline-flex'};align-items:center;gap:10px;padding:10px 26px;border-radius:999px;background:rgba(8,14,32,0.55);backdrop-filter:blur(12px);border:1.5px solid ${teamCss};color:#fef08a;font-size:18px;font-weight:900;box-shadow:0 12px 34px rgba(0,0,0,0.5);">
            <span>🥁</span>
            <span>لحظة الحسم... والفريق الفائز بالتحدي هو...</span>
          </div>

          <div id="hostDuelChampionRevealBanner" style="display:none;flex-direction:column;align-items:center;gap:6px;padding:12px 32px;border-radius:24px;background:rgba(8,14,32,0.54);backdrop-filter:blur(14px);border:2px solid ${teamCss};box-shadow:0 16px 46px rgba(0,0,0,0.55),0 0 30px ${teamCss}55;text-align:center;">
            <div style="font-size:13px;font-weight:900;color:#fef08a;letter-spacing:0.3px;">${isTie ? '⚖️ نهاية ملحمية متكافئة' : '🏆 بطل التحدي الجماعي'}</div>
            <h1 id="scDuelWinningTeamTitle" style="margin:0;font-size:clamp(24px,3.2vw,36px);font-weight:900;color:#ffffff;text-shadow:0 4px 18px rgba(0,0,0,0.8);">
              ${isTie ? 'تعادل بطولي بين الفريقين!' : `أبطال التحدي: ${winner.emoji} ${esc(winner.name)}`}
            </h1>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;font-size:14px;font-weight:900;">
              ${isTie
                ? `<span style="color:#7dd3fc;">${sb.team_a.emoji} ${esc(sb.team_a.name)}: ${sb.team_a.score.toLocaleString('en-US')}</span><span style="color:#fff;">—</span><span style="color:#fdba74;">${sb.team_b.emoji} ${esc(sb.team_b.name)}: ${sb.team_b.score.toLocaleString('en-US')}</span>`
                : `<span style="padding:3px 14px;border-radius:999px;background:${teamCss}33;border:1px solid ${teamCss};color:#fff;">${winner.emoji} ${esc(winner.name)}: ${winner.score.toLocaleString('en-US')} نقطة</span><span style="color:#cbd5e1;font-size:12.5px;">مقابل ${loser.score.toLocaleString('en-US')} (${loser.emoji} ${esc(loser.name)})</span>`}
            </div>
          </div>
        </div>

        <footer id="scDuelFooterActions" class="scorear-control-bar" style="position:relative;z-index:35;margin-top:auto;display:none;align-items:center;justify-content:center;gap:8px;padding:8px 14px;flex-wrap:wrap;flex-shrink:0;">
          <button type="button" data-duel-cam="wide" class="scorear-gear-btn sc-duel-cam-btn is-active" onclick="ScoreARDuelCoronation.setCameraPreset('wide')">${ic('maximize', 13)} <span>لقطة القاعة</span></button>
          <button type="button" data-duel-cam="champion" class="scorear-gear-btn sc-duel-cam-btn" onclick="ScoreARDuelCoronation.setCameraPreset('champion')">${ic('crown', 13)} <span>تركيز الأبطال</span></button>
          <button type="button" data-duel-cam="orbit" class="scorear-gear-btn sc-duel-cam-btn" onclick="ScoreARDuelCoronation.setCameraPreset('orbit')">${ic('planet', 13)} <span>جولة سينمائية</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARDuelCoronation.launchFirework()" style="border-color:${teamCss};color:#fef08a;">🎇 <span>ألعاب نارية</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARDuelCoronation.triggerApplause()" style="border-color:${teamCss};color:#fef08a;">👏 <span>تصفيق</span></button>
          <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scDuelTeamsRosterModal').style.display='block'">${ic('users', 13)} <span>قائمة الفريقين</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARDuelCoronation.captureSnapshot()">${ic('camera', 13)} <span>صورة التتويج</span></button>
        </footer>

        <div id="scDuelTeamsRosterModal" style="display:none;position:fixed;inset:12% auto auto 50%;transform:translateX(-50%);width:min(740px,92vw);max-height:74vh;overflow-y:auto;background:rgba(8,14,32,0.94);backdrop-filter:blur(16px);border:1.5px solid ${teamCss};border-radius:20px;padding:18px;z-index:120;direction:rtl;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <b style="color:#fff;font-size:16px;">⚔️ تشكيلة الفريقين ونتيجة التحدي (بدون ترتيب فردي)</b>
            <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scDuelTeamsRosterModal').style.display='none'">✕ إغلاق</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div style="padding:12px;border-radius:14px;background:rgba(14,165,233,0.12);border:1px solid rgba(56,189,248,0.45);">
              <div style="font-size:14px;font-weight:900;color:#7dd3fc;margin-bottom:8px;">🦅 ${esc(sb.team_a.name)} — ${sb.team_a.score.toLocaleString('en-US')} نقطة</div>
              <div style="display:flex;flex-direction:column;gap:6px;">${winnerMembersHtml(sb.team_a.members, '🦅', '#38bdf8')}</div>
            </div>
            <div style="padding:12px;border-radius:14px;background:rgba(249,115,22,0.12);border:1px solid rgba(251,146,60,0.45);">
              <div style="font-size:14px;font-weight:900;color:#fdba74;margin-bottom:8px;">🦁 ${esc(sb.team_b.name)} — ${sb.team_b.score.toLocaleString('en-US')} نقطة</div>
              <div style="display:flex;flex-direction:column;gap:6px;">${winnerMembersHtml(sb.team_b.members, '🦁', '#fb923c')}</div>
            </div>
          </div>
        </div>
      </div>`;

    const wrap = document.getElementById('scDuel3DWrap');
    const Engine = global.ScoreARHall3DEngine;
    const THREE = global.THREE;
    const canWebGL = Boolean(Engine?.isWebGLReady?.() && THREE);

    state = {
      active: true,
      stage,
      room: currentRoom,
      onClose,
      worldId: wid,
      pal,
      sb,
      isTie,
      winner,
      teamHex,
      teamCss,
      actors: [],
      disposables: [],
      timers: [],
      rafId: 0,
      revealed: false,
      suspenseActive: false,
      renderer: null,
      scene: null,
      camera: null,
      envMap: null,
      camDirector: null,
      particles: null,
      spotRig: null,
      ambientLight: null,
      audio: null,
      resizeHandler: null
    };

    if (!canWebGL) {
      mount2DFallback(wrap, slots, sb, isTie, winner);
      startSuspenseReveal();
      return;
    }

    try {
      const W = Math.max(320, wrap.clientWidth || window.innerWidth || 1280);
      const H = Math.max(240, wrap.clientHeight || window.innerHeight || 720);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
      else if (THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      wrap.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(pal.fog, 0.018);
      const envMap = Engine.createStudioEnvMap ? Engine.createStudioEnvMap(renderer, pal.warm, pal.cool) : null;
      if (envMap?.texture) scene.environment = envMap.texture;

      const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 120);
      const camDirector = Engine.createCameraDirector(camera, wrap);
      camDirector.snapShot([0, 4.1, 13.4], [0, 1.4, -0.4]);

      const ambientLight = new THREE.AmbientLight(0xe2e8f0, 0.9);
      const keyLight = new THREE.DirectionalLight(pal.warm, 1.4);
      keyLight.position.set(4, 11, 8);
      const rimLight = new THREE.DirectionalLight(teamHex, 1.1);
      rimLight.position.set(-6, 7, -4);
      scene.add(ambientLight, keyLight, rimLight);

      const floorGeo = new THREE.CircleGeometry(14, 64);
      floorGeo.rotateX(-Math.PI / 2);
      const floorMat = new THREE.MeshStandardMaterial({ color: pal.floor, metalness: 0.48, roughness: 0.42, transparent: true, opacity: 0.56 });
      scene.add(new THREE.Mesh(floorGeo, floorMat));
      state.disposables.push(floorGeo, floorMat);

      slots.forEach(slot => {
        const m = slot.player;
        const pHex = isTie ? (m.teamId === 'team_b' ? 0xf97316 : 0x38bdf8) : teamHex;
        const pCss = isTie ? (m.teamId === 'team_b' ? '#fb923c' : '#38bdf8') : teamCss;
        const pEmoji = isTie ? (m.teamId === 'team_b' ? '🦁' : '🦅') : winner.emoji;

        const podGeo = new THREE.CylinderGeometry(0.68, 0.82, 0.14, 24);
        const podMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.35 });
        const podMesh = new THREE.Mesh(podGeo, podMat);
        podMesh.position.set(slot.x, slot.y + 0.07, slot.z);
        scene.add(podMesh);

        const ringGeo = new THREE.RingGeometry(0.68, 0.84, 30);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: pHex, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(slot.x, slot.y + 0.145, slot.z);
        scene.add(ringMesh);

        if (slot.y > 0.05) {
          const riserGeo = new THREE.CylinderGeometry(0.80, 0.92, slot.y, 24);
          const riserMesh = new THREE.Mesh(riserGeo, podMat);
          riserMesh.position.set(slot.x, slot.y * 0.5, slot.z);
          scene.add(riserMesh);
          state.disposables.push(riserGeo);
        }

        const hero = Engine.createHero3DActor(m, {
          height: 2.35,
          rimColor: pHex,
          rimStrength: 0.42,
          reflection: true,
          reflectionAlpha: 0.28,
          initialMotion: 'idle',
          initialLoop: true
        });
        if (hero?.group) {
          hero.group.position.set(slot.x, slot.y + 0.14, slot.z);
          hero.preloadMoves?.(['idle', 'jump', 'win', 'celebrate', 'clap']);
          scene.add(hero.group);
        }

        const plateTex = makeTeamPlateTexture(THREE, m.name, pEmoji, pCss);
        const plateMat = new THREE.SpriteMaterial({ map: plateTex, transparent: true, depthTest: false });
        const plate = new THREE.Sprite(plateMat);
        plate.scale.set(1.72, 0.42, 1);
        plate.position.set(slot.x, slot.y + 0.30, slot.z + 0.85);
        scene.add(plate);

        state.disposables.push(podGeo, podMat, ringGeo, ringMat, plateTex, plateMat);
        state.actors.push({ player: m, hero, el: null });
      });

      const particles = Engine.createParticlesSystem(scene, [teamHex, 0xfef08a, 0xffffff], 85);
      const spotRig = Engine.createSpotlightRig(scene, {
        renderer, keyLight, ambLight: ambientLight,
        extraLights: [rimLight], baseKeyInt: 1.4, baseHemiInt: 0.9,
        accentHex: teamHex, vignetteEl: document.getElementById('scDuelBlackoutVig'), particles
      });
      let audio = null;
      try { if (Engine.createCinematicAudio) audio = Engine.createCinematicAudio(); } catch (_) {}

      const onResize = () => {
        if (!state || !state.active) return;
        const nw = Math.max(320, wrap.clientWidth || window.innerWidth || 1280);
        const nh = Math.max(240, wrap.clientHeight || window.innerHeight || 720);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);

      Object.assign(state, { renderer, scene, camera, envMap, camDirector, particles, spotRig, ambientLight, audio, resizeHandler: onResize });

      let prev = performance.now();
      let elapsed = 0;
      const tick = now => {
        if (!state || !state.active) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
        prev = now;
        elapsed += dt;
        state.actors.forEach(a => a.hero?.updateTexture?.(camera));
        spotRig.update(dt, elapsed);
        particles.update(dt, elapsed);
        camDirector.update(dt, elapsed, state.revealed);
        renderer.render(scene, camera);
        state.rafId = requestAnimationFrame(tick);
      };
      state.rafId = requestAnimationFrame(tick);
      startSuspenseReveal();
    } catch (err) {
      if (global.console?.warn) console.warn('[ScoreARDuelCoronation] Fallback to 2D:', err);
      mount2DFallback(wrap, slots, sb, isTie, winner);
      startSuspenseReveal();
    }
  }

  function skipToReveal() { revealWinningTeam(false); }
  function replay() {
    if (state?.stage && state?.room) renderDuelTeamCoronation(state.stage, state.room, state.onClose);
  }
  function setCameraPreset(preset) {
    if (!state?.camDirector) return;
    state.camDirector.setPreset(preset);
    document.querySelectorAll('[data-duel-cam]').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-duel-cam') === preset));
  }
  function launchFirework() {
    if (!state?.particles || isReduced()) return;
    state.particles.spawnFirework((Math.random() - 0.5) * 6, 4.4 + Math.random() * 1.4, -1.2, [state.teamHex, 0xfef08a, 0xffffff], 80);
    try { state.audio?.playFireworkPop?.(); } catch (_) {}
  }
  function triggerApplause() {
    sfx('applauseGrand', 0.90);
    if (global.confetti && !isReduced()) {
      global.confetti({ particleCount: 70, spread: 105, origin: { y: 0.55 }, colors: [state?.teamCss || '#fbbf24', '#fde047', '#ffffff'] });
    }
  }
  function captureSnapshot() {
    if (state?.renderer && state?.scene && state?.camera && global.ScoreARHall3DEngine?.captureWebGLSnapshot) {
      const title = state.isTie ? 'تعادل بطولي بين الفريقين!' : `أبطال التحدي: ${state.winner.emoji} ${state.winner.name}`;
      global.ScoreARHall3DEngine.captureWebGLSnapshot(state.renderer, state.scene, state.camera, title, state.pal.name);
    }
  }
  function toggleMute() {
    if (!global.ScoreARAudio?.toggleMute) return;
    const m = global.ScoreARAudio.toggleMute();
    const b = document.getElementById('scDuelMuteBtn');
    if (b) b.innerHTML = ic(m ? 'volumeOff' : 'volume', 14);
  }
  function exit() {
    const closeCb = state?.onClose;
    cleanup();
    if (typeof closeCb === 'function') closeCb();
    else if (global.ScoreARQuizHost?.closeHostSession) global.ScoreARQuizHost.closeHostSession();
  }
  function isActive() {
    return Boolean(state && state.active && typeof document !== 'undefined' && document.getElementById('scDuelCoronationRoot'));
  }

  function cleanup() {
    if (!state) return;
    const s = state;
    state = null;
    s.active = false;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    s.timers.forEach(t => clearTimeout(t));
    if (s.resizeHandler) window.removeEventListener('resize', s.resizeHandler);
    s.actors.forEach(a => { try { a.hero?.dispose?.(); } catch {} });
    s.disposables.forEach(d => { try { d?.dispose?.(); } catch {} });
    try { s.spotRig?.dispose?.(); } catch {}
    try { s.particles?.dispose?.(); } catch {}
    try { s.camDirector?.dispose?.(); } catch {}
    try { s.audio?.dispose?.(); } catch {}
    try { s.envMap?.dispose?.(); } catch {}
    try {
      if (s.renderer) {
        s.renderer.dispose();
        if (s.renderer.domElement?.parentNode) s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
      }
    } catch {}
    global.ScoreARAudio?.stopAllSfx?.();
    global.ScoreARAudio?.unduckMusic?.(100);
  }

  const Api = {
    renderDuelTeamCoronation, skipToReveal, replay, setCameraPreset, launchFirework, triggerApplause, captureSnapshot, toggleMute, exit, isActive, cleanup,
    getDebugState: () => state ? { active: state.active, revealed: state.revealed, isTie: state.isTie, winnerTeamId: state.winner?.id || 'tie', winnerName: state.winner?.name || '', actorCount: state.actors.length } : { active: false }
  };

  global.ScoreARDuelCoronation = Api;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARDuelCoronation = Api; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = Api;
})(typeof window !== 'undefined' ? window : globalThis);
