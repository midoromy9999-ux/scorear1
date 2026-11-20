/**
 * ScoreAR Universal 3D Celebration Hall Stage Orchestrator (quiz-hall-3d-stage.js)
 * Shared 60FPS Three.js WebGL stage shell for bespoke world directors (Stadium, Cosmic,
 * Treasure, Oasis, Magic): manages HUD, renderer, studio PMREM envMap, cropped Pixar
 * cyclorama vista, 5-Act Camera & Suspense Choreography, wall-clock 3D hero paths
 * (walk/run/curved-track/aerial-fly), living class audience (#4-#7), fireworks,
 * live interactive camera presets, HD WebGL snapshot, and 100% GPU disposal.
 * Strictly Rule 7 Compliant (< 350 lines).
 */
(function (global) {
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const ic = (n, sz = 14) => (global.ScoreARUI?.icon) ? global.ScoreARUI.icon(n, { size: sz }) : '';
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };

  function mountWorld3DStage(stage, currentRoom, ranked, onClose, quizTitle, worldSpec) {
    const Engine = global.ScoreARHall3DEngine;
    const THREE = global.THREE;
    if (!Engine?.isWebGLReady() || !THREE || !worldSpec) return null;

    const top3 = ranked.slice(0, 3);
    const audience = ranked.slice(3, 7);
    const isReduced = Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    const isMuted = Boolean(global.ScoreARAudio?.isMuted?.());
    const accent = worldSpec.accent || '#fbbf24';
    const bgCss = worldSpec.bgCss || '#060c1f';

    stage.innerHTML = `
      <style>
        .sc-w3d-root { position:relative;width:100%;height:100%;overflow:hidden;background:${bgCss};direction:rtl;font-family:Cairo,Tajawal,sans-serif;display:flex;flex-direction:column; }
        .sc-w3d-wrap { position:absolute;inset:0;z-index:1; }
        .sc-w3d-wrap canvas { width:100% !important;height:100% !important;display:block; }
        .sc-w3d-bar { position:absolute;left:0;right:0;height:0;background:#03050d;z-index:18;pointer-events:none;transition:height 0.72s cubic-bezier(0.22,1,0.36,1); }
        .sc-w3d-bar.top { top:0; } .sc-w3d-bar.bot { bottom:0; }
        .sc-w3d-root.is-cinematic .sc-w3d-bar { height:32px; }
        .sc-w3d-vig { position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,transparent 52%,rgba(3,6,18,0.52) 100%); }
        .sc-w3d-banner { position:absolute;top:15%;left:0;right:0;margin:0 auto;z-index:16;text-align:center;pointer-events:none;transition:opacity 0.65s ease,transform 0.65s ease;width:min(760px,90%); }
        .sc-w3d-top { position:relative;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:8px 16px;gap:8px;flex-wrap:wrap;background:linear-gradient(180deg,rgba(4,8,22,0.78),rgba(4,8,22,0)); }
        .sc-w3d-bot { position:relative;z-index:30;margin-top:auto;display:none;align-items:center;justify-content:center;gap:7px;padding:8px 14px;flex-wrap:wrap;background:linear-gradient(0deg,rgba(4,8,22,0.88),rgba(4,8,22,0)); }
        .sc-w3d-pill { display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;background:rgba(8,14,34,0.82);backdrop-filter:blur(10px);border:1px solid ${accent};color:${accent};font-size:12.5px;font-weight:900;box-shadow:0 6px 20px rgba(0,0,0,0.45);max-width:56vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .sc-w3d-cam-btn.is-active { background:linear-gradient(135deg,${accent},#d97706) !important;color:#090d16 !important;border-color:#ffffff !important; }
        @media (max-width:640px) { .sc-w3d-top{padding:5px 8px;gap:4px;} .sc-w3d-pill{font-size:10.5px;padding:3px 9px;max-width:46vw;} .sc-w3d-top button,.sc-w3d-bot button{padding:4px 8px !important;font-size:10px !important;} }
      </style>
      <div id="scHallRoot" class="sc-w3d-root is-cinematic" data-hall-world="${esc(worldSpec.id)}" data-hall-engine="threejs-3d">
        <div id="scWorld3DWrap" class="sc-w3d-wrap"></div>
        <div class="sc-w3d-vig"></div>
        <div class="sc-w3d-bar top"></div>
        <div class="sc-w3d-bar bot"></div>

        <header class="sc-w3d-top">
          <div style="display:flex;gap:7px;align-items:center;">
            <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.exitHall()" style="border-color:rgba(239,68,68,0.42);color:#fca5a5;">${ic('close', 13)} <span>إنهاء</span></button>
            <button type="button" id="scHallMuteBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARWorldHalls.toggleMute()">${ic(isMuted ? 'volumeOff' : 'volume', 14)}</button>
          </div>
          <span class="sc-w3d-pill">${worldSpec.badge || '🏆'} <span>${esc(worldSpec.name)} 3D</span>${quizTitle ? ` · <span style="color:#fff;">${esc(quizTitle)}</span>` : ''}</span>
          <div style="display:flex;gap:7px;align-items:center;">
            <button type="button" id="scHallSkipBtn" class="scorear-gear-btn" onclick="ScoreARWorldHalls.skipToFinal()" style="border-color:${accent};color:#fef08a;">${ic('zap', 13)} <span>تخطي العرض</span></button>
            <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.replayHall()">${ic('play', 13)} <span>إعادة العرض</span></button>
          </div>
        </header>

        <div id="scHallOpeningBanner" class="sc-w3d-banner">
          <div style="display:inline-block;padding:4px 18px;border-radius:999px;border:1px solid ${accent};background:rgba(7,12,28,0.82);color:${accent};font-size:13px;font-weight:900;margin-bottom:8px;">${esc(worldSpec.crestLabel || worldSpec.name)}</div>
          <h2 style="margin:0;font-size:clamp(24px,3.8vw,42px);font-weight:900;color:#ffffff;text-shadow:0 6px 28px rgba(0,0,0,0.92);">${esc(quizTitle || worldSpec.name)}</h2>
          <p style="margin:6px 0 0;font-size:14px;font-weight:800;color:#e2e8f0;text-shadow:0 3px 12px rgba(0,0,0,0.9);">${esc(worldSpec.openingSub || '')}</p>
        </div>

        <footer id="scHallActions" class="sc-w3d-bot">
          <button type="button" data-cam-preset="wide" class="scorear-gear-btn sc-w3d-cam-btn is-active" onclick="ScoreARWorldHalls.setCameraPreset('wide')">${ic('maximize', 13)} <span>لقطة القاعة</span></button>
          <button type="button" data-cam-preset="champion" class="scorear-gear-btn sc-w3d-cam-btn" onclick="ScoreARWorldHalls.setCameraPreset('champion')">${ic('crown', 13)} <span>تركيز البطل</span></button>
          <button type="button" data-cam-preset="orbit" class="scorear-gear-btn sc-w3d-cam-btn" onclick="ScoreARWorldHalls.setCameraPreset('orbit')">${ic('planet', 13)} <span>جولة سينمائية</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.launchFirework()" style="border-color:${accent};color:#fef08a;">🎇 <span>ألعاب نارية</span></button>
          <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scHallFullRoster').style.display='block'">${ic('list', 13)} <span>الترتيب الكامل (${ranked.length})</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.capture3DSnapshot()">${ic('camera', 13)} <span>صورة التتويج HD</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumCapture?.downloadAllTop3Certificates?.(ScoreARWorldHalls._getSorted(), '${esc(worldSpec.id)}')">${ic('award', 13)} <span>الشهادات</span></button>
        </footer>

        <div id="scHallFullRoster" style="display:none;position:fixed;inset:12% auto auto 50%;transform:translateX(-50%);width:min(680px,92vw);max-height:74vh;overflow-y:auto;background:rgba(8,14,32,0.97);border:1.5px solid ${accent};border-radius:20px;padding:18px;z-index:120;direction:rtl;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <b style="color:#fff;font-size:16px;">الترتيب النهائي الكامل (${ranked.length})</b>
            <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scHallFullRoster').style.display='none'">✕ إغلاق</button>
          </div>
          ${ranked.map(p => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.05);margin-bottom:6px;gap:10px;"><span style="color:#fff;font-weight:800;">#${p._rank} · ${esc(p.name)}</span><b style="color:${accent};font-variant-numeric:tabular-nums;">${p.score || 0} نقطة</b></div>`).join('')}
        </div>
      </div>`;

    const wrap = document.getElementById('scWorld3DWrap');
    const W = wrap.clientWidth || 1280, H = wrap.clientHeight || 680;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = worldSpec.exposure ?? 1.04;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(worldSpec.bgHex ?? 0x060d22);
    scene.fog = new THREE.FogExp2(worldSpec.fogHex ?? 0x09132e, worldSpec.fogDensity ?? 0.024);
    const envRT = Engine.createStudioEnvMap(renderer, worldSpec.envWarm ?? 0xffe9b0, worldSpec.envCool ?? 0x163266);
    scene.environment = envRT.texture;

    const calcFov = (w, h) => { const a = w / Math.max(1, h); return a < 0.9 ? Math.min(72, Math.round(44 / Math.max(0.60, a))) : 44; };
    const camera = new THREE.PerspectiveCamera(calcFov(W, H), W / H, 0.1, 70);
    const camDir = Engine.createCameraDirector(camera, wrap);
    const openPos = worldSpec.openCamPos || [0, 4.1, 12.2];
    const openLook = worldSpec.openCamLook || [0, 1.95, 0];
    camDir.snapShot(openPos, openLook);

    const cinAudio = Engine.createCinematicAudio();
    const disposables = [];
    const track = obj => { if (obj) disposables.push(obj); return obj; };

    const ambLight = new THREE.HemisphereLight(worldSpec.hemiSky ?? 0xffe8bb, worldSpec.hemiGround ?? 0x14244d, worldSpec.hemiInt ?? 0.78);
    scene.add(ambLight);
    const keyLight = new THREE.DirectionalLight(worldSpec.keyHex ?? 0xfff0cc, worldSpec.keyInt ?? 1.08);
    keyLight.position.set(3.8, 9.5, 7.6);
    scene.add(keyLight);

    // Cropped Pixar Cyclorama Vista (cleanly removes any painted foreground podium!)
    const texLoader = new THREE.TextureLoader();
    const cropY = worldSpec.vistaCropY ?? 0.36;
    const vistaTex = track(texLoader.load(worldSpec.vistaSrc, t => {
      t.encoding = THREE.sRGBEncoding;
      t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
      t.repeat.set(1, 1 - cropY);
      t.offset.set(0, cropY);
      t.needsUpdate = true;
    }));
    vistaTex.encoding = THREE.sRGBEncoding;
    const vistaGeo = track(new THREE.CylinderGeometry(16.8, 16.8, worldSpec.vistaH ?? 11.4, 56, 1, true, Math.PI * 0.56, Math.PI * 0.88));
    const vistaMesh = new THREE.Mesh(vistaGeo, track(new THREE.MeshBasicMaterial({ map: vistaTex, side: THREE.BackSide, color: worldSpec.vistaTint ?? 0xe8eefc })));
    vistaMesh.position.set(0, worldSpec.vistaY ?? 5.4, 2.2);
    scene.add(vistaMesh);

    const particles = Engine.createParticlesSystem(scene, worldSpec.particleColors || [0xfef08a, 0xfbbf24, 0xffffff], 130);

    // Expanding Coronation Shockwave Ring
    const shockMat = track(new THREE.MeshBasicMaterial({ color: worldSpec.shockHex ?? 0xfef08a, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    const shockMesh = new THREE.Mesh(track(new THREE.RingGeometry(0.6, 1.08, 64)), shockMat);
    shockMesh.rotation.x = -Math.PI / 2; shockMesh.position.y = 0.035; scene.add(shockMesh);

    // Live V3 3D Heroes (Top 3 + Gallery Audience Classmates)
    const heroActors = {};
    top3.forEach((pl, i) => {
      const slot = i + 1;
      const actor = Engine.createHero3DActor(pl, {
        height: slot === 1 ? 2.16 : (slot === 2 ? 1.92 : 1.86),
        rimColor: slot === 1 ? (worldSpec.rim1 ?? 0xffd76b) : (worldSpec.rimSide ?? 0xcce8ff),
        rimStrength: slot === 1 ? 0.52 : 0.36,
        reflection: worldSpec.heroReflection !== false,
        reflectionAlpha: worldSpec.reflectionAlpha ?? 0.36,
        reflectionTint: worldSpec.reflectionTint ?? 0x8dbdff,
        initialOpacity: 0
      });
      actor.group.visible = false;
      scene.add(actor.group);
      heroActors[slot] = actor;
    });

    const audSpots = worldSpec.audienceSpots || [[-3.95, -2.5], [3.95, -2.5], [-5.1, -0.5], [5.1, -0.5]];
    const audienceActors = audience.map((pl, idx) => {
      const [ax, az] = audSpots[idx % audSpots.length];
      const actor = Engine.createHero3DActor(pl, { height: 1.56, rimColor: worldSpec.rim1 ?? 0xffd166, rimStrength: 0.24, reflection: false, brightness: 0.85, initialOpacity: 0.92 });
      actor.group.position.set(ax, 0.02, az);
      actor.setAction('idle', true);
      scene.add(actor.group);
      return actor;
    });

    let timers = [], activePaths = [], rafId = null, disposed = false, crowned = false, currentStep = 0;
    let suspenseDim = 0, shockStart = null, clockLast = performance.now(), startTime = clockLast;
    const sched = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const clearSched = () => { timers.forEach(clearTimeout); timers = []; };

    function launchFirework(x, y, z) {
      particles.spawnFirework(
        x ?? (Math.random() - 0.5) * 6.4,
        y ?? (4.1 + Math.random() * 1.4),
        z ?? (-1.2 + Math.random() * 1.8),
        worldSpec.fireworkColors || worldSpec.particleColors || [0xfef08a, 0xfbbf24, 0x38bdf8, 0xffffff],
        78
      );
      cinAudio.playFireworkPop();
    }

    const ctx = {
      THREE, Engine, scene, camera, camDir, cinAudio, particles,
      top3, ranked, heroActors, audienceActors, track, sched, sfx,
      launchFirework, isReduced, quizTitle,
      setSuspense: v => { suspenseDim = v; },
      triggerShockwave: () => { shockStart = performance.now(); }
    };

    // Build bespoke world geometry, podium, plaques & 3D centerpiece!
    const worldData = worldSpec.buildWorld(ctx) || {};
    ctx.worldData = worldData;
    const tierTargets = worldData.tiers || {
      1: { x: 0, topY: 1.06, z: 0 },
      2: { x: 2.32, topY: 0.72, z: 0.28 },
      3: { x: -2.32, topY: 0.54, z: 0.28 }
    };
    const revealOrder = [3, 2, 1].filter(s => Boolean(heroActors[s]));

    function startHeroPath(slot) {
      const actor = heroActors[slot], target = tierTargets[slot];
      if (!actor || !target) return;
      actor.group.visible = true;
      actor.setOpacity(1);
      const segs = worldSpec.getHeroPath ? worldSpec.getHeroPath(slot, target) : [
        { from: [slot === 3 ? -4.9 : (slot === 2 ? 4.9 : 0), 0.02, slot === 1 ? -4.4 : 1.75], to: [target.x, 0.02, slot === 1 ? -1.65 : 1.72], durMs: 1100, move: slot === 3 ? 'walkRight' : (slot === 2 ? 'walkLeft' : 'walkForward'), jumpH: 0 },
        { from: [target.x, 0.02, slot === 1 ? -1.65 : 1.72], to: [target.x, target.topY, target.z], durMs: 560, move: 'jump', jumpH: 0.58 }
      ];
      actor.group.position.set(segs[0].from[0], segs[0].from[1], segs[0].from[2]);
      actor.setAction(segs[0].move, segs[0].move !== 'jump' && segs[0].move !== 'land');
      activePaths = activePaths.filter(p => p.slot !== slot);
      activePaths.push({ slot, actor, segs, segIdx: 0, segStart: performance.now() });
    }

    function playStep(slot) {
      const target = tierTargets[slot];
      if (!target) return;
      document.getElementById('scHallRoot')?.classList.remove('is-cinematic');
      const banner = document.getElementById('scHallOpeningBanner');
      if (banner) { banner.style.opacity = '0'; banner.style.transform = 'translateY(-16px)'; }
      worldSpec.onStep?.(slot, ctx);

      if (slot === 3) {
        camDir.setShot([-2.15, 2.0, 6.8], [target.x, 1.42, target.z], 2.9);
        sfx('pop'); cinAudio.playChime(440, 0.75);
        startHeroPath(3);
      } else if (slot === 2) {
        camDir.setShot([2.15, 2.05, 6.8], [target.x, 1.50, target.z], 2.9);
        sfx('pop'); cinAudio.playChime(523.25, 0.8);
        startHeroPath(2);
      } else if (slot === 1) {
        suspenseDim = 1;
        camDir.setShot([0, 1.9, 7.7], [0, 2.05, -1.2], 2.3);
        cinAudio.playTimpaniPulse(74, 0.18);
        sched(() => cinAudio.playTimpaniPulse(88, 0.20), 400);
        sched(() => {
          suspenseDim = 0;
          camDir.setShot([0, 2.08, 6.6], [0, 2.15, 0], 2.5);
          sfx('whoosh');
          startHeroPath(1);
        }, 800);
      }
    }

    function crownNow(withFx = true) {
      clearSched();
      activePaths = [];
      crowned = true;
      suspenseDim = 0;
      currentStep = revealOrder.length;
      document.getElementById('scHallRoot')?.classList.remove('is-cinematic');
      const banner = document.getElementById('scHallOpeningBanner');
      if (banner) { banner.style.opacity = '0'; banner.style.display = 'none'; }

      [1, 2, 3].forEach(slot => {
        const actor = heroActors[slot], t = tierTargets[slot];
        if (!actor || !t) return;
        actor.group.visible = true;
        actor.setOpacity(1);
        actor.setJumpOffset(0);
        actor.group.position.set(t.x, t.topY, t.z);
        actor.setAction(slot === 1 ? 'win' : 'clap', true);
      });
      audienceActors.forEach((a, i) => a.setAction(i % 2 === 0 ? 'clap' : 'wave', true));

      worldSpec.onCrown?.(ctx, withFx && !isReduced);

      if (withFx && !isReduced) {
        shockStart = performance.now();
        camDir.impulse(0.12);
        sfx('fanfare');
        cinAudio.playFanfareChord();
        launchFirework(-2.4, 4.6, -1.1);
        sched(() => launchFirework(2.4, 4.8, -1.0), 300);
        sched(() => launchFirework(0, 5.1, -1.3), 620);
        if (global.confetti) global.confetti({ particleCount: 95, spread: 125, origin: { y: 0.44 }, colors: worldSpec.confettiColors || ['#fef08a', '#fbbf24', '#38bdf8', '#ffffff'] });
      }

      const widePos = worldSpec.wideCamPos || [0, 2.58, 9.5];
      const wideLook = worldSpec.wideCamLook || [0, 2.02, 0];
      camDir.setShot(widePos, wideLook, 2.2);
      const actBar = document.getElementById('scHallActions');
      if (actBar) actBar.style.display = 'flex';
      const skipBtn = document.getElementById('scHallSkipBtn');
      if (skipBtn) skipBtn.style.display = 'none';
    }

    function animate(now) {
      if (disposed || !wrap.isConnected) { dispose(); return; }
      const dt = Math.min(0.05, Math.max(0.001, (now - clockLast) / 1000));
      clockLast = now;
      const elapsed = (now - startTime) / 1000;

      for (let i = activePaths.length - 1; i >= 0; i--) {
        const p = activePaths[i];
        const seg = p.segs[p.segIdx];
        const clamped = Math.min(1, (now - p.segStart) / seg.durMs);
        const ease = seg.jumpH > 0 || seg.arcY ? (1 - Math.pow(1 - clamped, 2)) : clamped;
        const x = seg.from[0] + (seg.to[0] - seg.from[0]) * ease + (seg.curveX ? Math.sin(clamped * Math.PI) * seg.curveX : 0);
        const y = seg.from[1] + (seg.to[1] - seg.from[1]) * ease + (seg.arcY ? Math.sin(clamped * Math.PI) * seg.arcY : 0);
        const z = seg.from[2] + (seg.to[2] - seg.from[2]) * ease + (seg.curveZ ? Math.sin(clamped * Math.PI) * seg.curveZ : 0);
        p.actor.group.position.set(x, y, z);
        p.actor.setJumpOffset(seg.jumpH > 0 ? Math.sin(clamped * Math.PI) * seg.jumpH : 0);

        if (clamped >= 1) {
          p.segIdx++;
          if (p.segIdx < p.segs.length) {
            p.segStart = now;
            const nx = p.segs[p.segIdx];
            p.actor.setAction(nx.move, nx.move !== 'jump' && nx.move !== 'land');
          } else {
            p.actor.setJumpOffset(0);
            p.actor.setAction('land', false);
            particles.spawnFountain(p.actor.group.position.x, p.actor.group.position.y + 0.05, p.actor.group.position.z, worldSpec.shockHex ?? 0xfbbf24, 24);
            worldSpec.onLand?.(p.slot, ctx);
            const doneSlot = p.slot;
            sched(() => { if (!crowned) p.actor.setAction(doneSlot === 1 ? 'win' : 'clap', true); }, 340);
            activePaths.splice(i, 1);
            if (doneSlot === 1 && !crowned) sched(() => crownNow(true), 380);
          }
        }
      }

      keyLight.intensity += ((suspenseDim ? 0.25 : (worldSpec.keyInt ?? 1.08)) - keyLight.intensity) * Math.min(1, dt * 4.5);
      ambLight.intensity += ((suspenseDim ? 0.22 : (worldSpec.hemiInt ?? 0.78)) - ambLight.intensity) * Math.min(1, dt * 4.5);

      if (shockStart) {
        const sp = (now - shockStart) / 900;
        if (sp < 1) {
          const sc = 1 + sp * 9.5;
          shockMesh.scale.set(sc, sc, 1);
          shockMat.opacity = Math.max(0, (1 - sp) * 0.8);
        } else { shockMat.opacity = 0; shockStart = null; }
      }

      worldSpec.onUpdate?.(dt, elapsed, ctx, crowned);
      Object.values(heroActors).forEach(a => { if (a.group.visible) a.updateTexture(camera); });
      audienceActors.forEach(a => a.updateTexture(camera));
      particles.update(dt, elapsed);
      camDir.update(dt, elapsed, crowned && !isReduced);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }

    const onResize = () => {
      if (disposed || !wrap.isConnected) return;
      const nw = wrap.clientWidth || 1280, nh = wrap.clientHeight || 680;
      camera.fov = calcFov(nw, nh);
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    global.addEventListener('resize', onResize);

    if (isReduced || !top3.length) {
      crownNow(false);
    } else {
      camDir.setShot(worldSpec.wideCamPos || [0, 2.58, 9.5], worldSpec.wideCamLook || [0, 2.0, 0], 1.7);
      sfx('whoosh');
      let cursorMs = 1750;
      revealOrder.forEach((slot, idx) => {
        sched(() => { currentStep = idx + 1; playStep(slot); }, cursorMs);
        cursorMs += (slot === 1 ? 3350 : 2200);
      });
    }

    rafId = requestAnimationFrame(animate);

    function dispose() {
      if (disposed) return;
      disposed = true;
      clearSched();
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      global.removeEventListener('resize', onResize);
      camDir.dispose(); cinAudio.dispose(); particles.dispose();
      Object.values(heroActors).forEach(a => a.dispose());
      audienceActors.forEach(a => a.dispose());
      envRT.dispose();
      disposables.forEach(d => { try { d.dispose?.(); } catch {} });
      renderer.dispose();
    }

    return {
      skipToFinal: () => crownNow(false),
      advanceStep: () => {
        clearSched();
        if (currentStep < revealOrder.length) { const s = revealOrder[currentStep++]; playStep(s); }
        else crownNow(true);
      },
      setCameraPreset: preset => {
        camDir.setPreset(preset);
        document.querySelectorAll('.sc-w3d-cam-btn').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-cam-preset') === preset));
      },
      launchFirework: () => launchFirework(),
      triggerAudienceReaction: () => launchFirework((Math.random() - 0.5) * 5.2, 4.3 + Math.random() * 1.2, -0.8),
      capture3DSnapshot: () => Engine.captureWebGLSnapshot(renderer, scene, camera, quizTitle || worldSpec.name, `${worldSpec.name} · ScoreAR`),
      getDebugState: () => ({
        engine: 'threejs-3d', world: worldSpec.id, crowned,
        heroes: Object.fromEntries(Object.entries(heroActors).map(([k, a]) => [k, { action: a.getAction(), visible: a.group.visible, y: Number(a.group.position.y.toFixed(2)) }])),
        audienceCount: audienceActors.length
      }),
      dispose
    };
  }

  global.ScoreARHall3DStage = { mountWorld3DStage };
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHall3DStage = global.ScoreARHall3DStage; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ScoreARHall3DStage;
})(typeof window !== 'undefined' ? window : globalThis);
