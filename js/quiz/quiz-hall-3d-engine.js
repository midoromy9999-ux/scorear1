/**
 * ScoreAR Studio 3D WebGL Celebration Engine Kernel (quiz-hall-3d-engine.js)
 * Reusable Three.js foundation for all 6 AAA Celebration Halls:
 *  - Procedural HDR Studio Environment Map (PMREM) so metallic gold/silver/crystal genuinely gleams
 *  - Live 60FPS V3 Sprite-to-WebGL Actors with custom Rim-Light Shader, Contact Shadow & Real Mirrored Floor Reflection
 *  - Volumetric Fresnel God-Ray Cones, Expanding Floor Shockwaves & 3D Physics Firework Shells
 *  - Damped 5-Act Cinematic Camera Director with live mouse 3D parallax & interactive camera presets
 *  - Procedural Web Audio Cinematic Sweetener (chimes, suspense timpani, firework crackles)
 *  - High-DPI Live WebGL Snapshot Capture & 100% GPU Memory Disposal
 * Strictly Rule 7 Compliant (< 460 lines).
 */
(function (global) {
  'use strict';

  const charNum = raw => Math.max(1, Math.min(20, parseInt(String(raw || '1').replace(/\D/g, '') || '1', 10) || 1));

  function isWebGLReady() {
    if (!global.THREE || typeof document === 'undefined') return false;
    try {
      const c = document.createElement('canvas');
      return Boolean(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch { return false; }
  }

  /* ── Procedural Studio PMREM Environment Map (makes 3D gold/silver/marble gleam!) ── */
  function createStudioEnvMap(renderer, warmHex = 0xfff0c2, coolHex = 0x3b60a8) {
    const THREE = global.THREE;
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0b1024);

    const addPanel = (col, x, y, z, sx, sy, sz, rx = 0, ry = 0) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(sx, sy),
        new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })
      );
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, 0);
      envScene.add(m);
    };
    // Overhead warm gold ceiling panel + side bounce cards + cool sapphire floor reflection
    addPanel(warmHex, 0, 10, 0, 22, 22, 1, Math.PI / 2, 0);
    addPanel(0xffd87a, 11, 4, 4, 14, 10, 1, 0, -Math.PI / 2);
    addPanel(0xffe7a8, -11, 4, 4, 14, 10, 1, 0, Math.PI / 2);
    addPanel(0xffffff, 0, 6, 12, 16, 8, 1, 0, Math.PI);
    addPanel(coolHex, 0, -8, 0, 24, 24, 1, -Math.PI / 2, 0);

    const rt = pmrem.fromScene(envScene, 0.045);
    pmrem.dispose();
    return rt;
  }

  /* ── Procedural Web Audio Cinematic Sweetener (zero external dependencies) ── */
  function createCinematicAudio() {
    let ctx = null;
    const isMuted = () => Boolean(global.ScoreARAudio?.isMuted?.());
    const ensureCtx = () => {
      if (isMuted()) return null;
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    };
    function playChime(freq = 587.3, dur = 0.7, vol = 0.09) {
      const c = ensureCtx(); if (!c) return;
      const now = c.currentTime;
      [1, 1.5, 2].forEach((mult, idx) => {
        const osc = c.createOscillator(), g = c.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * mult, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(vol / (idx + 1), now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(g); g.connect(c.destination);
        osc.start(now); osc.stop(now + dur + 0.02);
      });
    }
    function playTimpaniPulse(pitch = 78, vol = 0.16) {
      const c = ensureCtx(); if (!c) return;
      const now = c.currentTime;
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch * 1.35, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.75, now + 0.24);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      osc.connect(g); g.connect(c.destination);
      osc.start(now); osc.stop(now + 0.38);
    }
    function playFanfareChord() {
      const c = ensureCtx(); if (!c) return;
      // Regal D-major9 chord swell
      [293.66, 369.99, 440.0, 554.37, 587.33].forEach((f, i) => {
        setTimeout(() => playChime(f, 1.45, 0.075), i * 55);
      });
    }
    function playFireworkPop() {
      const c = ensureCtx(); if (!c) return;
      const now = c.currentTime;
      const len = Math.floor(c.sampleRate * 0.22);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.22));
      const src = c.createBufferSource(), flt = c.createBiquadFilter(), g = c.createGain();
      src.buffer = buf;
      flt.type = 'bandpass'; flt.frequency.value = 1150; flt.Q.value = 0.8;
      g.gain.setValueAtTime(0.11, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      src.connect(flt); flt.connect(g); g.connect(c.destination);
      src.start(now);
    }
    function dispose() { try { if (ctx && ctx.state !== 'closed') ctx.close(); } catch {} ctx = null; }
    return { playChime, playTimpaniPulse, playFanfareChord, playFireworkPop, dispose };
  }

  /* ── Soft Volumetric God-Ray Light Cone Shader (never harsh flat triangles!) ── */
  function createVolumetricCone(colorHex, height = 10, topR = 0.35, botR = 2.6, maxAlpha = 0.24) {
    const THREE = global.THREE;
    const geo = new THREE.CylinderGeometry(topR, botR, height, 32, 1, true);
    geo.translate(0, -height * 0.5, 0);
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(colorHex) },
        uOpacity: { value: maxAlpha },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv; varying vec3 vNormalView; varying vec3 vViewPos;
        void main() {
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          vNormalView = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPos;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uOpacity; uniform float uTime;
        varying vec2 vUv; varying vec3 vNormalView; varying vec3 vViewPos;
        void main() {
          float fres = pow(abs(dot(normalize(vNormalView), normalize(vViewPos))), 1.55);
          float vert = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.08, vUv.y);
          float shimmer = 0.90 + 0.10 * sin(vUv.x * 18.0 + uTime * 1.4);
          gl_FragColor = vec4(uColor, fres * vert * shimmer * uOpacity);
        }`
    });
    const mesh = new THREE.Mesh(geo, mat);
    return { mesh, material: mat };
  }

  /* ── Live 60FPS V3 Sprite Actor in 3D Space with Rim Glow, Shadow & Floor Reflection ── */
  function createHero3DActor(player, opts = {}) {
    const THREE = global.THREE;
    const heightM = opts.height || 2.15;
    const widthM = heightM * 0.8;
    const rimColor = new THREE.Color(opts.rimColor || 0xffd76b);
    const showReflection = opts.reflection !== false;
    const reflectionAlpha = opts.reflectionAlpha ?? 0.34;
    const footPadM = heightM * 0.048;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = opts.texW || 384;
    offCanvas.height = opts.texH || 480;
    const tex = new THREE.CanvasTexture(offCanvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const charId = charNum(player?.avatarId || player?.characterId || 1);
    const initialMotion = opts.initialMotion || 'idle';
    const initialLoop = opts.initialLoop ?? true;
    const base = new URL('assets/motion-v3/', (typeof document !== 'undefined' && document.baseURI) || 'http://localhost/').href;
    let spritePlayer = null;
    if (global.ScorearSpritePlayer) {
      spritePlayer = global.ScorearSpritePlayer.attach(offCanvas, {
        characterId: charId,
        assetBase: base,
        initialMotion,
        loop: initialLoop
      });
    }

    const group = new THREE.Group();
    const heroGeo = new THREE.PlaneGeometry(widthM, heightM);

    // Custom Rim-Light & Crisp-Alpha Hero Shader so character integrates naturally into 3D palace light!
    const heroMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: {
        uMap: { value: tex },
        uRimColor: { value: rimColor },
        uRimStrength: { value: opts.rimStrength ?? 0.42 },
        uOpacity: { value: opts.initialOpacity ?? 1.0 },
        uBrightness: { value: opts.brightness ?? 1.02 }
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform sampler2D uMap; uniform vec3 uRimColor; uniform float uRimStrength;
        uniform float uOpacity; uniform float uBrightness;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(uMap, vUv);
          if (c.a < 0.03) discard;
          // Edge sample for subtle warm world rim-lighting around silhouette
          vec2 px = vec2(0.008, 0.006);
          float aMin = min(min(texture2D(uMap, vUv + vec2(px.x, 0.0)).a, texture2D(uMap, vUv - vec2(px.x, 0.0)).a),
                           texture2D(uMap, vUv + vec2(0.0, px.y)).a);
          float edge = clamp((c.a - aMin) * 1.45, 0.0, 1.0);
          vec3 col = c.rgb * uBrightness + uRimColor * edge * uRimStrength;
          gl_FragColor = vec4(col, c.a * uOpacity);
        }`
    });
    const heroMesh = new THREE.Mesh(heroGeo, heroMat);
    heroMesh.position.y = heightM * 0.5 - footPadM;
    heroMesh.renderOrder = 10;
    group.add(heroMesh);

    // Ground Contact Shadow (shrinks dynamically during physical step-up jump!)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128; shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d');
    const sg = sctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    sg.addColorStop(0, 'rgba(3,5,16,0.72)');
    sg.addColorStop(0.55, 'rgba(3,5,16,0.34)');
    sg.addColorStop(1, 'rgba(3,5,16,0)');
    sctx.fillStyle = sg; sctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(widthM * 0.78, widthM * 0.42),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.9 })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.018;
    shadowMesh.renderOrder = 6;
    group.add(shadowMesh);

    // Real Live Mirrored Marble Floor Reflection!
    let reflMesh = null, reflMat = null;
    if (showReflection) {
      reflMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: {
          uMap: { value: tex },
          uTint: { value: new THREE.Color(opts.reflectionTint || 0x9ec5ff) },
          uOpacity: { value: reflectionAlpha }
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          uniform sampler2D uMap; uniform vec3 uTint; uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            vec4 c = texture2D(uMap, vUv);
            if (c.a < 0.05) discard;
            float fade = smoothstep(0.62, 0.0, vUv.y);
            gl_FragColor = vec4(mix(c.rgb, uTint, 0.25), c.a * fade * uOpacity);
          }`
      });
      reflMesh = new THREE.Mesh(heroGeo, reflMat);
      reflMesh.scale.y = -1;
      reflMesh.position.y = -(heightM * 0.5 - footPadM) + 0.01;
      reflMesh.renderOrder = 4;
      group.add(reflMesh);
    }

    let currentAction = initialMotion;
    let actionToken = 0;
    let readyPromise = spritePlayer?.ready || Promise.resolve(false);

    function preloadMoves(moves) {
      if (global.ScorearSpritePlayer?.preload) {
        return global.ScorearSpritePlayer.preload([charId], moves, base);
      }
      return Promise.resolve([]);
    }

    function setAction(move, loop = true) {
      currentAction = move;
      const tok = ++actionToken;
      if (!spritePlayer) return Promise.resolve(false);
      const p = spritePlayer.ready.then(async () => {
        if (tok !== actionToken) return false;
        try {
          const ok = await spritePlayer.play(move, { loop });
          if (tok === actionToken) tex.needsUpdate = true;
          return ok;
        } catch {
          return false;
        }
      });
      readyPromise = p;
      return p;
    }

    function setOpacity(v) {
      heroMat.uniforms.uOpacity.value = v;
      shadowMesh.material.opacity = v * 0.9;
      if (reflMat) reflMat.uniforms.uOpacity.value = v * reflectionAlpha;
    }

    function setJumpOffset(jumpY) {
      heroMesh.position.y = (heightM * 0.5 - footPadM) + jumpY;
      const s = Math.max(0.45, 1 - jumpY * 0.45);
      shadowMesh.scale.set(s, s, 1);
      shadowMesh.material.opacity = heroMat.uniforms.uOpacity.value * 0.9 * s;
      if (reflMesh) {
        reflMesh.position.y = -(heightM * 0.5 - footPadM) - jumpY + 0.01;
        reflMat.uniforms.uOpacity.value = heroMat.uniforms.uOpacity.value * reflectionAlpha * s;
      }
    }

    function updateTexture(camera) {
      tex.needsUpdate = true;
      if (camera) {
        // Billboard gently around Y axis only so heroes stay upright & grounded
        const dx = camera.position.x - group.position.x;
        const dz = camera.position.z - group.position.z;
        const yaw = Math.atan2(dx, dz) * 0.55;
        heroMesh.rotation.y = yaw;
        if (reflMesh) reflMesh.rotation.y = yaw;
      }
    }

    function dispose() {
      try { spritePlayer?.destroy?.(); } catch {}
      heroGeo.dispose(); heroMat.dispose(); tex.dispose();
      shadowMesh.geometry.dispose(); shadowMesh.material.dispose(); shadowTex.dispose();
      if (reflMat) reflMat.dispose();
    }

    return {
      group, heroMesh, reflMesh, setAction, preloadMoves, whenReady: () => readyPromise,
      setOpacity, setJumpOffset, updateTexture, dispose,
      getAction: () => currentAction, player
    };
  }

  /* ── 3D Physics Fireworks & Ambient Floating Embers System ── */
  function createParticlesSystem(scene, ambientColors = [0xfef08a, 0xfbbf24, 0xffffff], maxAmbient = 140) {
    const THREE = global.THREE;
    // Soft glowing circular sprite texture for additive sparks
    const sc = document.createElement('canvas');
    sc.width = 64; sc.height = 64;
    const sctx = sc.getContext('2d');
    const rg = sctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    rg.addColorStop(0, 'rgba(255,255,255,1)');
    rg.addColorStop(0.35, 'rgba(255,245,200,0.82)');
    rg.addColorStop(1, 'rgba(255,210,100,0)');
    sctx.fillStyle = rg; sctx.fillRect(0, 0, 64, 64);
    const sparkTex = new THREE.CanvasTexture(sc);

    // 1. Ambient floating palace motes
    const ambPos = new Float32Array(maxAmbient * 3);
    const ambCol = new Float32Array(maxAmbient * 3);
    const ambVel = [];
    const tmpCol = new THREE.Color();
    for (let i = 0; i < maxAmbient; i++) {
      ambPos[i * 3] = (Math.random() - 0.5) * 16;
      ambPos[i * 3 + 1] = 0.3 + Math.random() * 7.2;
      ambPos[i * 3 + 2] = (Math.random() - 0.5) * 11;
      tmpCol.setHex(ambientColors[i % ambientColors.length]);
      ambCol[i * 3] = tmpCol.r; ambCol[i * 3 + 1] = tmpCol.g; ambCol[i * 3 + 2] = tmpCol.b;
      ambVel.push({ vy: 0.16 + Math.random() * 0.34, phase: Math.random() * 6.28 });
    }
    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
    ambGeo.setAttribute('color', new THREE.BufferAttribute(ambCol, 3));
    const ambMat = new THREE.PointsMaterial({
      size: 0.22, map: sparkTex, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const ambPoints = new THREE.Points(ambGeo, ambMat);
    scene.add(ambPoints);

    // 2. Dynamic 3D Burst Firework Shells & Gold Showers
    const MAX_BURST = 520;
    const bPos = new Float32Array(MAX_BURST * 3);
    const bCol = new Float32Array(MAX_BURST * 3);
    const pool = Array.from({ length: MAX_BURST }, () => ({ active: false, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, r: 1, g: 1, b: 1, grav: 3.2 }));
    let cursor = 0;
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    bGeo.setAttribute('color', new THREE.BufferAttribute(bCol, 3));
    const bMat = new THREE.PointsMaterial({
      size: 0.32, map: sparkTex, vertexColors: true, transparent: true, opacity: 0.96,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const bPoints = new THREE.Points(bGeo, bMat);
    bPoints.frustumCulled = false;
    scene.add(bPoints);

    function spawnFirework(cx, cy, cz, palette = [0xfef08a, 0xfbbf24, 0x38bdf8, 0xffffff], count = 72) {
      for (let i = 0; i < count; i++) {
        const p = pool[cursor];
        cursor = (cursor + 1) % MAX_BURST;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const spd = 1.8 + Math.random() * 3.4;
        p.active = true; p.x = cx; p.y = cy; p.z = cz;
        p.vx = Math.sin(phi) * Math.cos(theta) * spd;
        p.vy = Math.cos(phi) * spd * 0.88 + 0.85;
        p.vz = Math.sin(phi) * Math.sin(theta) * spd * 0.7;
        p.life = 1.0; p.maxLife = 1.05 + Math.random() * 0.65; p.grav = 2.8;
        tmpCol.setHex(palette[i % palette.length]);
        p.r = tmpCol.r; p.g = tmpCol.g; p.b = tmpCol.b;
      }
    }

    function spawnFountain(cx, cy, cz, colorHex = 0xfbbf24, count = 26) {
      tmpCol.setHex(colorHex);
      for (let i = 0; i < count; i++) {
        const p = pool[cursor];
        cursor = (cursor + 1) % MAX_BURST;
        const a = Math.random() * Math.PI * 2;
        const spd = 0.6 + Math.random() * 1.6;
        p.active = true; p.x = cx; p.y = cy; p.z = cz;
        p.vx = Math.cos(a) * spd; p.vy = 2.2 + Math.random() * 2.8; p.vz = Math.sin(a) * spd;
        p.life = 1.0; p.maxLife = 0.9 + Math.random() * 0.5; p.grav = 4.2;
        p.r = tmpCol.r; p.g = tmpCol.g; p.b = tmpCol.b;
      }
    }

    function update(dt, elapsed) {
      const aArr = ambGeo.attributes.position.array;
      for (let i = 0; i < maxAmbient; i++) {
        const v = ambVel[i];
        aArr[i * 3] += Math.sin(elapsed * 0.8 + v.phase) * 0.004;
        aArr[i * 3 + 1] += v.vy * dt;
        if (aArr[i * 3 + 1] > 7.6) aArr[i * 3 + 1] = 0.25;
      }
      ambGeo.attributes.position.needsUpdate = true;

      const pArr = bGeo.attributes.position.array;
      const cArr = bGeo.attributes.color.array;
      for (let i = 0; i < MAX_BURST; i++) {
        const p = pool[i];
        if (!p.active) { pArr[i * 3 + 1] = -99; continue; }
        p.life -= dt / p.maxLife;
        if (p.life <= 0) { p.active = false; pArr[i * 3 + 1] = -99; continue; }
        p.vy -= p.grav * dt;
        p.vx *= 0.985; p.vz *= 0.985;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.y < 0.05) { p.y = 0.05; p.vy *= -0.35; }
        pArr[i * 3] = p.x; pArr[i * 3 + 1] = p.y; pArr[i * 3 + 2] = p.z;
        const fade = Math.max(0, p.life);
        cArr[i * 3] = p.r * fade; cArr[i * 3 + 1] = p.g * fade; cArr[i * 3 + 2] = p.b * fade;
      }
      bGeo.attributes.position.needsUpdate = true;
      bGeo.attributes.color.needsUpdate = true;
    }

    function dispose() {
      ambGeo.dispose(); ambMat.dispose();
      bGeo.dispose(); bMat.dispose();
      sparkTex.dispose();
    }

    return { spawnFirework, spawnFountain, update, dispose };
  }

  /* ── Smooth Damped Cinematic Camera Director + Live Pointer Parallax ── */
  function createCameraDirector(camera, containerEl) {
    const THREE = global.THREE;
    const goalPos = new THREE.Vector3(0, 3.6, 11.8);
    const goalLook = new THREE.Vector3(0, 1.5, 0);
    const curLook = new THREE.Vector3(0, 1.5, 0);
    let damp = 3.2, shakeAmt = 0, pointerX = 0, pointerY = 0, orbitMode = 'wide';

    const onMove = ev => {
      const r = containerEl.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointerX = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointerY = ((ev.clientY - r.top) / r.height) * 2 - 1;
    };
    containerEl.addEventListener('pointermove', onMove, { passive: true });

    function setShot(pos, look, speed = 3.0) {
      goalPos.set(pos[0], pos[1], pos[2]);
      goalLook.set(look[0], look[1], look[2]);
      damp = speed;
    }
    function snapShot(pos, look) {
      camera.position.set(pos[0], pos[1], pos[2]);
      goalPos.set(pos[0], pos[1], pos[2]);
      curLook.set(look[0], look[1], look[2]);
      goalLook.set(look[0], look[1], look[2]);
      camera.lookAt(curLook);
    }
    function impulse(amount = 0.16) { shakeAmt = Math.max(shakeAmt, amount); }
    function setPreset(preset) { orbitMode = preset || 'wide'; }

    function update(dt, elapsed, allowIdleMotion) {
      const k = 1 - Math.exp(-damp * dt);
      let tx = goalPos.x, ty = goalPos.y, tz = goalPos.z;
      let lx = goalLook.x, ly = goalLook.y, lz = goalLook.z;

      if (allowIdleMotion) {
        if (orbitMode === 'orbit') {
          const ang = Math.sin(elapsed * 0.34) * 0.88;
          tx = Math.sin(ang) * 8.6;
          tz = Math.cos(ang) * 8.6;
          ty = 2.65 + Math.cos(elapsed * 0.52) * 0.32;
          lx = 0; ly = 1.92; lz = 0;
        } else if (orbitMode === 'champion') {
          tx = Math.sin(elapsed * 0.35) * 0.65 + pointerX * 0.45;
          ty = 2.25 - pointerY * 0.18;
          tz = 5.85;
          lx = 0; ly = 2.25; lz = 0;
        } else {
          tx += Math.sin(elapsed * 0.32) * 0.35 + pointerX * 0.72;
          ty += Math.cos(elapsed * 0.44) * 0.12 - pointerY * 0.28;
        }
      }

      camera.position.x += (tx - camera.position.x) * k;
      camera.position.y += (ty - camera.position.y) * k;
      camera.position.z += (tz - camera.position.z) * k;
      curLook.x += (lx - curLook.x) * k;
      curLook.y += (ly - curLook.y) * k;
      curLook.z += (lz - curLook.z) * k;

      if (shakeAmt > 0.002) {
        camera.position.x += (Math.random() - 0.5) * shakeAmt;
        camera.position.y += (Math.random() - 0.5) * shakeAmt;
        shakeAmt *= Math.exp(-9.5 * dt);
      }
      camera.lookAt(curLook);
    }

    function dispose() { containerEl.removeEventListener('pointermove', onMove); }
    return { setShot, snapShot, impulse, setPreset, update, dispose };
  }

  /* ── Capture Razor-Sharp HD Snapshot Directly From Live 3D WebGL Canvas ── */
  function captureWebGLSnapshot(renderer, scene, camera, title, worldName) {
    if (!renderer || !scene || !camera) return false;
    try {
      renderer.render(scene, camera);
      const src = renderer.domElement;
      const out = document.createElement('canvas');
      out.width = 1280; out.height = 720;
      const ctx = out.getContext('2d');
      ctx.drawImage(src, 0, 0, 1280, 720);
      // Elegant royal bottom-right watermark & top ceremony crest
      const topG = ctx.createLinearGradient(0, 0, 0, 86);
      topG.addColorStop(0, 'rgba(6,11,26,0.82)'); topG.addColorStop(1, 'rgba(6,11,26,0)');
      ctx.fillStyle = topG; ctx.fillRect(0, 0, 1280, 86);
      ctx.direction = 'rtl'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a'; ctx.font = '900 28px Cairo, Tajawal, sans-serif';
      ctx.fillText(title || 'تتويج أبطال ScoreAR', 640, 38);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '700 16px Cairo, Tajawal, sans-serif';
      ctx.fillText(worldName || 'ScoreAR', 640, 66);

      const url = out.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = `scorear-3d-ceremony-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      if (global.toast) global.toast('📸 تم حفظ لقطة الاحتفال ثلاثي الأبعاد بجودة فائقة!');
      return true;
    } catch { return false; }
  }

  const ScoreARHall3DEngine = {
    isWebGLReady, charNum, createStudioEnvMap, createCinematicAudio,
    createVolumetricCone, createHero3DActor, createParticlesSystem,
    createCameraDirector, captureWebGLSnapshot
  };
  global.ScoreARHall3DEngine = ScoreARHall3DEngine;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHall3DEngine = ScoreARHall3DEngine; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARHall3DEngine;
})(typeof window !== 'undefined' ? window : globalThis);
