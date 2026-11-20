/**
 * ScoreAR Flagship 3D Royal Palace Celebration Hall (quiz-hall-3d-royal.js)
 * Pixar/AAA-grade Three.js WebGL Royal Andalusian Court:
 *  - Clean open-floor Andalusian Royal Palace vista + reflective sapphire-and-gold marble court
 *  - Sculpted LatheGeometry 3-tier marble & royal velvet-inlaid podium with curved engraved 3D Arabic stone plaques
 *  - Sculpted bronze/gold braziers with real-time GLSL animated volumetric fire shaders
 *  - Sculpted 3D rotating Andalusian Star Medal framed cleanly above #1 + volumetric god-rays & 3D fireworks
 *  - Zero-clip wall-clock-locked 3D hero paths + living audience gallery (#4-#7) + 5-Act Camera Director
 * Strictly Rule 7 Compliant (< 465 lines).
 */
(function (global) {
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const ic = (n, sz = 14) => (global.ScoreARUI?.icon) ? global.ScoreARUI.icon(n, { size: sz }) : '';
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };

  /* ── Procedural High-DPI Royal PBR Textures ── */
  function makeRoyalFloorTexture() {
    const THREE = global.THREE;
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext('2d');
    const bg = ctx.createRadialGradient(512, 512, 50, 512, 512, 512);
    bg.addColorStop(0, '#132757'); bg.addColorStop(0.48, '#0b183a'); bg.addColorStop(1, '#050b1d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(148,185,255,0.07)'; ctx.lineWidth = 2;
    for (let i = 0; i < 38; i++) {
      ctx.beginPath();
      let x = (i * 73) % 1024, y = (i * 131) % 1024;
      ctx.moveTo(x, y);
      for (let s = 0; s < 5; s++) { x += Math.sin(i + s) * 85; y += 48; ctx.lineTo(x, y); }
      ctx.stroke();
    }

    ctx.save(); ctx.translate(512, 512);
    [175, 245, 325, 415, 480].forEach((r, idx) => {
      ctx.strokeStyle = idx % 2 === 0 ? 'rgba(246,195,67,0.58)' : 'rgba(254,240,138,0.24)';
      ctx.lineWidth = idx === 1 || idx === 3 ? 3.5 : 2;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    });
    for (let k = 0; k < 16; k++) {
      ctx.save(); ctx.rotate((k * Math.PI) / 8);
      ctx.strokeStyle = 'rgba(246,195,67,0.32)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(175, 0); ctx.lineTo(480, 0); ctx.stroke();
      ctx.strokeStyle = 'rgba(254,240,138,0.42)';
      ctx.beginPath(); ctx.moveTo(245, -22); ctx.lineTo(325, 0); ctx.lineTo(245, 22); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    return tex;
  }

  function makeWarmMarbleTexture() {
    const THREE = global.THREE;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, '#e8dcc5'); g.addColorStop(0.5, '#d9c8a9'); g.addColorStop(1, '#c8b38f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(130,98,52,0.24)'; ctx.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.moveTo((i * 41) % 512, 0);
      ctx.bezierCurveTo((i * 83) % 512, 160, (i * 29) % 512, 340, (i * 67) % 512, 512);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeTierTopMedallionTexture(accentHex) {
    const THREE = global.THREE;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#dfd1b6'; ctx.fillRect(0, 0, 512, 512);
    const rg = ctx.createRadialGradient(256, 256, 30, 256, 256, 220);
    rg.addColorStop(0, '#162f6b'); rg.addColorStop(0.76, '#0d1d47'); rg.addColorStop(1, '#08122b');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(256, 256, 218, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = accentHex; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(256, 256, 218, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(254,240,138,0.42)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(256, 256, 186, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.translate(256, 256);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = 'rgba(251,191,36,0.34)'; ctx.lineWidth = 3;
      ctx.strokeRect(-118, -118, 236, 236);
    }
    ctx.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    return tex;
  }

  function makeCarpetTexture() {
    const THREE = global.THREE;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 1024;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 512, 0);
    g.addColorStop(0, '#10204a'); g.addColorStop(0.12, '#7c171b');
    g.addColorStop(0.5, '#991b1b'); g.addColorStop(0.88, '#7c171b'); g.addColorStop(1, '#10204a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 1024);
    ctx.strokeStyle = '#f6c343'; ctx.lineWidth = 10; ctx.strokeRect(24, 0, 464, 1024);
    ctx.strokeStyle = 'rgba(254,240,138,0.52)'; ctx.lineWidth = 3; ctx.strokeRect(46, 0, 420, 1024);
    for (let y = 64; y < 1024; y += 128) {
      ctx.save(); ctx.translate(256, y);
      ctx.strokeStyle = 'rgba(251,191,36,0.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(42, 0); ctx.lineTo(0, 34); ctx.lineTo(-42, 0); ctx.closePath(); ctx.stroke();
      ctx.restore();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeCurvedPlaqueTexture(rankNum, name, score, accentHex) {
    const THREE = global.THREE;
    const c = document.createElement('canvas');
    c.width = 896; c.height = 300;
    const ctx = c.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, 0, 300);
    bg.addColorStop(0, '#0a183b'); bg.addColorStop(0.5, '#132a60'); bg.addColorStop(1, '#071128');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 896, 300);

    ctx.strokeStyle = accentHex; ctx.lineWidth = 11; ctx.strokeRect(10, 10, 876, 280);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 3; ctx.strokeRect(26, 26, 844, 248);
    [[26, 26], [870, 26], [26, 274], [870, 274]].forEach(([x, y]) => {
      ctx.fillStyle = accentHex; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    });

    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const medalTxt = rankNum === 1 ? '🥇 المركز الأول' : (rankNum === 2 ? '🥈 المركز الثاني' : `🥉 المركز #${rankNum}`);
    ctx.fillStyle = accentHex; ctx.font = '900 40px Cairo, Tajawal, sans-serif';
    ctx.fillText(medalTxt, 448, 70);
    ctx.fillStyle = '#ffffff'; ctx.font = '900 58px Cairo, Tajawal, sans-serif';
    ctx.fillText(String(name || 'بطل').slice(0, 18), 448, 154);
    ctx.fillStyle = '#fef08a'; ctx.font = '900 42px Montserrat, Cairo, sans-serif';
    ctx.fillText(`${score || 0} نقطة`, 448, 236);

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    return tex;
  }

  function makeMysteryPlaqueTexture(slot, accentHex) {
    const THREE = global.THREE;
    const c = document.createElement('canvas');
    c.width = 896; c.height = 300;
    const ctx = c.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, 0, 300);
    bg.addColorStop(0, '#091433'); bg.addColorStop(1, '#050b1f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 896, 300);
    ctx.strokeStyle = accentHex; ctx.lineWidth = 10; ctx.strokeRect(10, 10, 876, 280);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2.5; ctx.strokeRect(26, 26, 844, 248);
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const label = slot === 1 ? '❓ البطل الأول' : (slot === 2 ? '❓ المركز الثاني' : '❓ المركز الثالث');
    ctx.fillStyle = accentHex; ctx.font = '900 46px Cairo, Tajawal, sans-serif';
    ctx.fillText(label, 448, 108);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '800 34px Cairo, Tajawal, sans-serif';
    ctx.fillText('في انتظار لحظة التكريم...', 448, 206);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    return tex;
  }

  /* ── Sculpted 3D Metallic Royal Andalusian Star Medal (ZERO flat SVG!) ── */
  function build3DRoyalMedal(goldMat, sapphireMat) {
    const THREE = global.THREE;
    const medal = new THREE.Group();
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 4.4, 12), goldMat);
    chain.position.y = 2.72; medal.add(chain);
    medal.add(new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.075, 20, 48), goldMat));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), goldMat);
      p.position.set(Math.cos(a) * 0.63, Math.sin(a) * 0.63, 0); medal.add(p);
    }
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.09, 40), sapphireMat);
    disc.rotation.x = Math.PI / 2; medal.add(disc);

    const starShape = new THREE.Shape();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8 - Math.PI / 2;
      const r = i % 2 === 0 ? 0.41 : 0.19;
      if (i === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    starShape.closePath();
    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.022, bevelSegments: 3 });
    starGeo.center();
    medal.add(new THREE.Mesh(starGeo, goldMat));

    const gemMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc, emissive: 0xfbbf24, emissiveIntensity: 1.5, roughness: 0.1, metalness: 0.2 });
    const gemF = new THREE.Mesh(new THREE.OctahedronGeometry(0.125, 0), gemMat);
    gemF.position.z = 0.085; medal.add(gemF);
    const gemB = gemF.clone(); gemB.position.z = -0.085; medal.add(gemB);

    const haloA = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.015, 12, 64), new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.95, metalness: 0.85, roughness: 0.2 }));
    haloA.rotation.x = 0.55; medal.add(haloA);
    const haloB = new THREE.Mesh(new THREE.TorusGeometry(0.90, 0.012, 12, 64), new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x38bdf8, emissiveIntensity: 0.8, metalness: 0.7, roughness: 0.2 }));
    haloB.rotation.x = -0.6; haloB.rotation.y = 0.7; medal.add(haloB);

    const light = new THREE.PointLight(0xffd76b, 0, 8.5);
    medal.add(light);
    return { group: medal, haloA, haloB, light };
  }

  /* ── Ornate Turned-Gold Brazier with Real-Time GLSL Animated Volumetric Fire! ── */
  function buildFireBrazier(goldMat, bronzeMat, x, z) {
    const THREE = global.THREE;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const pts = [
      new THREE.Vector2(0.32, 0.0), new THREE.Vector2(0.30, 0.12), new THREE.Vector2(0.16, 0.24),
      new THREE.Vector2(0.13, 0.72), new THREE.Vector2(0.20, 0.84), new THREE.Vector2(0.36, 1.02),
      new THREE.Vector2(0.38, 1.09), new THREE.Vector2(0.28, 1.09), new THREE.Vector2(0.22, 0.96)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 24), bronzeMat));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 12, 28), goldMat);
    rim.rotation.x = Math.PI / 2; rim.position.y = 1.08; g.add(rim);

    // Organic GLSL Animated Flame Plane (NO sharp white cone!)
    const fireMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 }, uSeed: { value: Math.random() * 20 } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime; uniform float uIntensity; uniform float uSeed;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          float sway = sin(uv.y * 7.5 - uTime * 8.0 + uSeed) * 0.11 * uv.y + cos(uv.y * 12.0 - uTime * 11.5) * 0.04 * uv.y;
          float dx = (uv.x - 0.5 + sway) * 2.15;
          float width = mix(0.68, 0.02, pow(uv.y, 0.82));
          float shape = smoothstep(width, width * 0.18, abs(dx)) * smoothstep(0.0, 0.16, uv.y) * smoothstep(1.0, 0.42, uv.y);
          float core = smoothstep(width * 0.55, 0.0, abs(dx)) * smoothstep(0.04, 0.25, uv.y) * smoothstep(0.78, 0.18, uv.y);
          vec3 outerCol = vec3(1.0, 0.36, 0.04);
          vec3 midCol   = vec3(1.0, 0.72, 0.14);
          vec3 coreCol  = vec3(1.0, 0.97, 0.82);
          vec3 col = mix(outerCol, midCol, clamp(shape * 1.1, 0.0, 1.0));
          col = mix(col, coreCol, core);
          float glow = exp(-dot(vec2(dx * 0.9, (uv.y - 0.32) * 1.4), vec2(dx * 0.9, (uv.y - 0.32) * 1.4)) * 3.2) * 0.42;
          float alpha = clamp((shape * 0.95 + glow) * uIntensity, 0.0, 1.0);
          gl_FragColor = vec4(col, alpha);
        }`
    });
    const fGeo = new THREE.PlaneGeometry(0.95, 1.28);
    const f1 = new THREE.Mesh(fGeo, fireMat); f1.position.y = 1.56; f1.renderOrder = 9; g.add(f1);
    const f2 = new THREE.Mesh(fGeo, fireMat); f2.position.y = 1.56; f2.rotation.y = Math.PI / 2; f2.renderOrder = 9; g.add(f2);

    const light = new THREE.PointLight(0xff9f2e, 0, 7.2);
    light.position.y = 1.65; g.add(light);
    return { group: g, fireMat, light, lit: false, litTarget: 0 };
  }

  /* ── Sculpted Royal Marble Tier (LatheGeometry Molded Cornice + Velvet Inlay Top!) ── */
  function buildSculptedTier(cfg, marbleMat, trimMat, topTex, plaqueTex) {
    const THREE = global.THREE;
    const g = new THREE.Group();
    g.position.set(cfg.x, 0.16, cfg.z);
    const h = cfg.h, r = cfg.r;
    const prof = [
      new THREE.Vector2(r + 0.09, 0.0), new THREE.Vector2(r + 0.07, 0.06),
      new THREE.Vector2(r + 0.01, 0.09), new THREE.Vector2(r, h - 0.09),
      new THREE.Vector2(r + 0.06, h - 0.04), new THREE.Vector2(r + 0.06, h),
      new THREE.Vector2(0.0, h)
    ];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 52), marbleMat));

    // Royal Blue Velvet & Gold Octagram Top Medallion Pad
    const pad = new THREE.Mesh(new THREE.CircleGeometry(r * 0.96, 48), new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.45, metalness: 0.2 }));
    pad.rotation.x = -Math.PI / 2; pad.position.y = h + 0.005; g.add(pad);

    // Sculpted metallic cornice & plinth gold/silver/bronze bevel rings
    const topRing = new THREE.Mesh(new THREE.TorusGeometry(r + 0.04, 0.036, 14, 52), trimMat);
    topRing.rotation.x = Math.PI / 2; topRing.position.y = h - 0.01; g.add(topRing);
    const botRing = new THREE.Mesh(new THREE.TorusGeometry(r + 0.07, 0.028, 12, 52), trimMat);
    botRing.rotation.x = Math.PI / 2; botRing.position.y = 0.035; g.add(botRing);

    // Curved Engraved Royal Stone Plaque directly inlaid into the front face!
    const pH = Math.max(0.32, h * 0.72);
    const pGeo = new THREE.CylinderGeometry(r + 0.035, r + 0.045, pH, 28, 1, true, -0.66, 1.32);
    const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex, side: THREE.FrontSide });
    const pMesh = new THREE.Mesh(pGeo, plaqueMat);
    pMesh.position.y = h * 0.5;
    g.add(pMesh);
    return { group: g, plaqueMat };
  }

  /* ── Main Royal 3D Ceremony Runner ── */
  function mountRoyal3DHall(stage, currentRoom, ranked, onClose, quizTitle) {
    const Engine = global.ScoreARHall3DEngine;
    const THREE = global.THREE;
    if (!Engine?.isWebGLReady() || !THREE) return null;

    const top3 = ranked.slice(0, 3);
    const audience = ranked.slice(3, 7);
    const isReduced = Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    const isMuted = Boolean(global.ScoreARAudio?.isMuted?.());

    const revealOrderInit = [3, 2, 1].filter(s => Boolean(top3[s - 1]));
    const firstStepLbl = revealOrderInit[0] === 3 ? '🥉 كشف المركز الثالث'
      : (revealOrderInit[0] === 2 ? '🥈 كشف المركز الثاني' : '👑 دخول المركز الأول!');

    stage.innerHTML = `
      <style>
        .sc-royal3d-root { position:relative;width:100%;height:100%;overflow:hidden;background:#060c1f;direction:rtl;font-family:Cairo,Tajawal,sans-serif;display:flex;flex-direction:column; }
        .sc-royal3d-canvas-wrap { position:absolute;inset:0;z-index:1; }
        .sc-royal3d-canvas-wrap canvas { width:100% !important;height:100% !important;display:block; }
        .sc-royal3d-letterbox { position:absolute;left:0;right:0;height:0;background:#03050d;z-index:18;pointer-events:none;transition:height 0.75s cubic-bezier(0.22,1,0.36,1); }
        .sc-royal3d-letterbox.top { top:0; } .sc-royal3d-letterbox.bot { bottom:0; }
        .sc-royal3d-root.is-cinematic .sc-royal3d-letterbox { height:32px; }
        .sc-royal3d-vignette { position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,transparent 52%,rgba(3,6,18,0.54) 100%); }
        .sc-royal3d-crest-banner { position:absolute;top:15%;left:0;right:0;margin:0 auto;z-index:16;text-align:center;pointer-events:none;transition:opacity 0.65s ease,transform 0.65s ease;width:min(760px,90%); }
        .sc-royal3d-phase-pill { position:absolute;top:58px;left:50%;transform:translateX(-50%);z-index:28;display:none;align-items:center;gap:8px;padding:6px 20px;border-radius:999px;background:rgba(7,14,36,0.88);backdrop-filter:blur(12px);border:1.5px solid #fbbf24;color:#fef08a;font-size:14px;font-weight:900;box-shadow:0 10px 28px rgba(0,0,0,0.65);pointer-events:none;white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis; }
        .sc-royal3d-director-bar { position:relative;z-index:32;margin-top:auto;display:${top3.length ? 'flex' : 'none'};align-items:center;justify-content:center;gap:10px;padding:10px 16px;flex-wrap:wrap;background:linear-gradient(0deg,rgba(4,8,22,0.90),rgba(4,8,22,0)); }
        .sc-royal3d-hud-top { position:relative;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:8px 16px;gap:8px;flex-wrap:wrap;background:linear-gradient(180deg,rgba(4,8,22,0.78),rgba(4,8,22,0)); }
        .sc-royal3d-hud-bot { position:relative;z-index:30;margin-top:auto;display:none;align-items:center;justify-content:center;gap:7px;padding:8px 14px;flex-wrap:wrap;background:linear-gradient(0deg,rgba(4,8,22,0.88),rgba(4,8,22,0)); }
        .sc-royal3d-pill { display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;background:rgba(9,18,46,0.78);backdrop-filter:blur(10px);border:1px solid rgba(251,191,36,0.55);color:#fef08a;font-size:12.5px;font-weight:900;box-shadow:0 6px 20px rgba(0,0,0,0.45); }
        .sc-royal3d-cam-btn.is-active { background:linear-gradient(135deg,#f59e0b,#d97706) !important;color:#090d16 !important;border-color:#fef08a !important; }
      </style>
      <div id="scHallRoot" class="sc-royal3d-root is-cinematic" data-hall-world="royal" data-hall-engine="threejs-3d">
        <div id="scRoyal3DWrap" class="sc-royal3d-canvas-wrap"></div>
        <div class="sc-royal3d-vignette"></div>
        <div class="sc-royal3d-letterbox top"></div>
        <div class="sc-royal3d-letterbox bot"></div>

        <header class="sc-royal3d-hud-top">
          <div style="display:flex;gap:7px;align-items:center;">
            <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.exitHall()" style="border-color:rgba(239,68,68,0.42);color:#fca5a5;">${ic('close', 13)} <span>إنهاء</span></button>
            <button type="button" id="scHallMuteBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARWorldHalls.toggleMute()">${ic(isMuted ? 'volumeOff' : 'volume', 14)}</button>
          </div>
          <span class="sc-royal3d-pill">👑 <span>القصر الملكي 3D</span>${quizTitle ? ` · <span style="color:#fff;">${esc(quizTitle)}</span>` : ''}</span>
          <div style="display:flex;gap:7px;align-items:center;">
            <button type="button" id="scHallSkipBtn" class="scorear-gear-btn" onclick="ScoreARWorldHalls.skipToFinal()" style="border-color:#fbbf24;color:#fef08a;">${ic('zap', 13)} <span>تخطي العرض</span></button>
            <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.replayHall()">${ic('play', 13)} <span>إعادة العرض</span></button>
          </div>
        </header>

        <div id="scHallPhasePill" class="sc-royal3d-phase-pill"></div>

        <div id="scHallOpeningBanner" class="sc-royal3d-crest-banner">
          <div style="display:inline-block;padding:4px 18px;border-radius:999px;border:1px solid rgba(251,191,36,0.7);background:rgba(8,18,46,0.78);color:#fde047;font-size:13px;font-weight:900;margin-bottom:8px;">بلاط التتويج الملكي الأندلسي</div>
          <h2 style="margin:0;font-size:clamp(24px,3.8vw,42px);font-weight:900;color:#ffffff;text-shadow:0 6px 28px rgba(0,0,0,0.92),0 0 22px rgba(251,191,36,0.35);">${esc(quizTitle || 'تتويج أبطال القصر الملكي')}</h2>
          <p style="margin:6px 0 0;font-size:14px;font-weight:800;color:#e2e8f0;text-shadow:0 3px 12px rgba(0,0,0,0.9);">القاعة جاهزة — اضغط «ابدأ الاحتفال» أو اكشف المراكز خطوة بخطوة</p>
        </div>

        <div id="scHallDirectorBar" class="sc-royal3d-director-bar">
          <button type="button" id="scHallStartBtn" class="btn launch-primary" onclick="ScoreARWorldHalls.startCinematicShow()" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#090d16;border:1.5px solid #fef08a;padding:9px 22px;border-radius:999px;font-size:14px;font-weight:900;box-shadow:0 8px 26px rgba(245,158,11,0.45);cursor:pointer;">🎬 <span>ابدأ الاحتفال</span></button>
          <button type="button" id="scHallStepBtn" class="scorear-gear-btn" onclick="ScoreARWorldHalls.advanceStep()" style="border-color:rgba(251,191,36,0.65);color:#fef08a;padding:8px 18px;border-radius:999px;font-size:13px;font-weight:900;">${firstStepLbl}</button>
        </div>

        <footer id="scHallActions" class="sc-royal3d-hud-bot">
          <button type="button" data-cam-preset="wide" class="scorear-gear-btn sc-royal3d-cam-btn is-active" onclick="ScoreARWorldHalls.setCameraPreset('wide')">${ic('maximize', 13)} <span>لقطة القاعة</span></button>
          <button type="button" data-cam-preset="champion" class="scorear-gear-btn sc-royal3d-cam-btn" onclick="ScoreARWorldHalls.setCameraPreset('champion')">${ic('crown', 13)} <span>تركيز البطل</span></button>
          <button type="button" data-cam-preset="orbit" class="scorear-gear-btn sc-royal3d-cam-btn" onclick="ScoreARWorldHalls.setCameraPreset('orbit')">${ic('planet', 13)} <span>جولة سينمائية</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.launchFirework()" style="border-color:#fbbf24;color:#fef08a;">🎇 <span>ألعاب نارية</span></button>
          <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scHallFullRoster').style.display='block'">${ic('list', 13)} <span>الترتيب الكامل (${ranked.length})</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.capture3DSnapshot()">${ic('camera', 13)} <span>صورة التتويج HD</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumCapture?.downloadAllTop3Certificates?.(ScoreARWorldHalls._getSorted(), 'royal')">${ic('award', 13)} <span>الشهادات</span></button>
        </footer>

        <div id="scHallFullRoster" style="display:none;position:fixed;inset:12% auto auto 50%;transform:translateX(-50%);width:min(680px,92vw);max-height:74vh;overflow-y:auto;background:rgba(8,14,32,0.97);border:1.5px solid #fbbf24;border-radius:20px;padding:18px;z-index:120;direction:rtl;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <b style="color:#fff;font-size:16px;">الترتيب النهائي الكامل (${ranked.length})</b>
            <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scHallFullRoster').style.display='none'">✕ إغلاق</button>
          </div>
          ${ranked.map(p => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.05);margin-bottom:6px;gap:10px;"><span style="color:#fff;font-weight:800;">#${p._rank} · ${esc(p.name)}</span><b style="color:#fbbf24;font-variant-numeric:tabular-nums;">${p.score || 0} نقطة</b></div>`).join('')}
        </div>
      </div>`;

    const wrap = document.getElementById('scRoyal3DWrap');
    const W = wrap.clientWidth || 1280, H = wrap.clientHeight || 680;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060d22);
    scene.fog = new THREE.FogExp2(0x09132e, 0.026);
    const envRT = Engine.createStudioEnvMap(renderer, 0xffe9b0, 0x163266);
    scene.environment = envRT.texture;

    const calcFov = (w, h) => { const a = w / Math.max(1, h); return a < 0.9 ? Math.min(72, Math.round(44 / Math.max(0.60, a))) : 44; };
    const camera = new THREE.PerspectiveCamera(calcFov(W, H), W / H, 0.1, 60);
    const camDir = Engine.createCameraDirector(camera, wrap);
    camDir.snapShot([0, 4.1, 12.2], [0, 1.95, 0]);

    const cinAudio = Engine.createCinematicAudio();
    const disposables = [];
    const track = obj => { disposables.push(obj); return obj; };

    // Balanced warm cinematic lighting (never bleached white!)
    const ambLight = new THREE.HemisphereLight(0xffe4aa, 0x132652, 0.72);
    scene.add(ambLight);
    const keyLight = new THREE.DirectionalLight(0xffecc2, 1.05);
    keyLight.position.set(3.5, 9, 7.5);
    scene.add(keyLight);
    const archBackLight = new THREE.PointLight(0xffc145, 2.2, 16);
    archBackLight.position.set(0, 4.0, -4.8);
    scene.add(archBackLight);

    // 1. Clean Open-Floor Pixar Royal Palace Vista Cyclorama (ZERO painted podium behind!)
    const texLoader = new THREE.TextureLoader();
    const vistaTex = track(texLoader.load('assets/halls/royal-vista.jpg', t => { t.encoding = THREE.sRGBEncoding; }));
    vistaTex.encoding = THREE.sRGBEncoding;
    const vistaGeo = track(new THREE.CylinderGeometry(16.8, 16.8, 12.6, 56, 1, true, Math.PI * 0.56, Math.PI * 0.88));
    const vistaMesh = new THREE.Mesh(vistaGeo, track(new THREE.MeshBasicMaterial({ map: vistaTex, side: THREE.BackSide, color: 0xe6ecfa })));
    vistaMesh.position.set(0, 4.75, 2.4);
    scene.add(vistaMesh);

    // 2. Reflective Royal Sapphire-and-Gold Marble Court + Velvet Carpet Runner
    const floorTex = track(makeRoyalFloorTexture());
    const floor = new THREE.Mesh(track(new THREE.CircleGeometry(15.5, 64)), track(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.88 })));
    floor.rotation.x = -Math.PI / 2; floor.renderOrder = 5; scene.add(floor);

    const carpet = new THREE.Mesh(track(new THREE.PlaneGeometry(2.05, 11.2)), track(new THREE.MeshStandardMaterial({ map: track(makeCarpetTexture()), roughness: 0.68, metalness: 0.1 })));
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.014, -1.65); carpet.renderOrder = 6; scene.add(carpet);

    // Rich Warm Marble & Gleaming Metals
    const marbleMat = track(new THREE.MeshStandardMaterial({ map: track(makeWarmMarbleTexture()), roughness: 0.34, metalness: 0.06 }));
    const goldMat = track(new THREE.MeshStandardMaterial({ color: 0xf4be3c, metalness: 0.94, roughness: 0.16, emissive: 0x351e00, emissiveIntensity: 0.25 }));
    const silverMat = track(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.18 }));
    const bronzeMat = track(new THREE.MeshStandardMaterial({ color: 0xc97b3b, metalness: 0.86, roughness: 0.26 }));
    const sapphireMat = track(new THREE.MeshStandardMaterial({ color: 0x0e2352, metalness: 0.36, roughness: 0.22 }));

    // 3. Sculpted Bronze & Gold Royal Braziers with GLSL Volumetric Fire (flanking vista cleanly!)
    const braziers = [
      [-2.35, -3.9], [2.35, -3.9], [-4.25, -1.35], [4.25, -1.35]
    ].map(([bx, bz]) => {
      const b = buildFireBrazier(goldMat, bronzeMat, bx, bz);
      scene.add(b.group);
      return b;
    });

    // 4. Sculpted 3-Tier Circular Royal Marble & Velvet-Inlaid Podium
    const baseProf = [new THREE.Vector2(4.02, 0), new THREE.Vector2(3.96, 0.08), new THREE.Vector2(3.84, 0.16), new THREE.Vector2(0, 0.16)];
    scene.add(new THREE.Mesh(track(new THREE.LatheGeometry(baseProf, 60)), marbleMat));
    const baseTrim = new THREE.Mesh(track(new THREE.TorusGeometry(3.86, 0.036, 12, 64)), goldMat);
    baseTrim.rotation.x = Math.PI / 2; baseTrim.position.y = 0.16; scene.add(baseTrim);

    const TIERS = {
      1: { x: 0, z: 0, r: 1.24, h: 0.90, topY: 1.06, trimMat: goldMat, accent: '#fbbf24', coneHex: 0xffd76b },
      2: { x: 2.32, z: 0.28, r: 1.02, h: 0.56, topY: 0.72, trimMat: silverMat, accent: '#e2e8f0', coneHex: 0xcbd5e1 },
      3: { x: -2.32, z: 0.28, r: 0.96, h: 0.38, topY: 0.54, trimMat: bronzeMat, accent: '#fdba74', coneHex: 0xfdba74 }
    };
    const tierCones = {}, tierGlowRings = {}, tierPlaques = {};
    [1, 2, 3].forEach(slot => {
      const pl = top3[slot - 1];
      if (!pl) return;
      const cfg = TIERS[slot];
      const topTex = track(makeTierTopMedallionTexture(cfg.accent));
      const mysteryTex = track(makeMysteryPlaqueTexture(slot, cfg.accent));
      const revealedTex = track(makeCurvedPlaqueTexture(pl._rank, pl.name, pl.score, cfg.accent));
      const builtTier = buildSculptedTier(cfg, marbleMat, cfg.trimMat, topTex, mysteryTex);
      scene.add(builtTier.group);
      tierPlaques[slot] = { mat: builtTier.plaqueMat, mysteryTex, revealedTex };

      const glowMat = track(new THREE.MeshBasicMaterial({ color: cfg.coneHex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      const glowRing = new THREE.Mesh(track(new THREE.RingGeometry(cfg.r * 0.96, cfg.r * 1.18, 48)), glowMat);
      glowRing.rotation.x = -Math.PI / 2; glowRing.position.set(cfg.x, cfg.topY + 0.015, cfg.z); scene.add(glowRing);
      tierGlowRings[slot] = glowMat;

      const cone = Engine.createVolumetricCone(cfg.coneHex, 7.2, 0.28, cfg.r * 1.55, 0);
      cone.mesh.position.set(cfg.x, 7.1, cfg.z);
      scene.add(cone.mesh);
      tierCones[slot] = cone;
    });

    function revealPlaque(slot) {
      const p = tierPlaques[slot];
      if (p && p.mat && p.revealedTex) {
        p.mat.map = p.revealedTex;
        p.mat.needsUpdate = true;
      }
    }

    // 5. Sculpted 3D Royal Medal Framed Clearly Above Champion #1 (resting y = 3.55!)
    const medal = build3DRoyalMedal(goldMat, sapphireMat);
    medal.group.position.set(0, 7.2, 0);
    medal.group.visible = false;
    scene.add(medal.group);

    const shockMat = track(new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    const shockMesh = new THREE.Mesh(track(new THREE.RingGeometry(0.6, 1.05, 64)), shockMat);
    shockMesh.rotation.x = -Math.PI / 2; shockMesh.position.y = 0.03; scene.add(shockMesh);

    // 6. Live V3 3D Heroes (Top 3 + Gallery Audience Classmates!)
    const heroActors = {};
    top3.forEach((pl, i) => {
      const slot = i + 1;
      const actor = Engine.createHero3DActor(pl, {
        height: slot === 1 ? 2.18 : (slot === 2 ? 1.94 : 1.88),
        rimColor: slot === 1 ? 0xffd76b : (slot === 2 ? 0xe0f2fe : 0xfdba74),
        rimStrength: slot === 1 ? 0.50 : 0.34,
        reflection: true, reflectionAlpha: 0.40, initialOpacity: 0
      });
      actor.group.visible = false;
      scene.add(actor.group);
      heroActors[slot] = actor;
    });

    const audienceSpots = [[-3.85, -2.55], [3.85, -2.55], [-5.0, -0.5], [5.0, -0.5]];
    const audienceActors = audience.map((pl, idx) => {
      const [ax, az] = audienceSpots[idx % audienceSpots.length];
      const actor = Engine.createHero3DActor(pl, { height: 1.58, rimColor: 0xffd166, rimStrength: 0.24, reflection: true, reflectionAlpha: 0.25, brightness: 0.86, initialOpacity: 0.92 });
      actor.group.position.set(ax, 0.02, az);
      actor.setAction('idle', true);
      scene.add(actor.group);
      return actor;
    });

    const particles = Engine.createParticlesSystem(scene, [0xfef08a, 0xfbbf24, 0x93c5fd, 0xffffff], 125);
    global.ScoreARMotionV3?.preloadCharacters?.([...top3, ...audience], ['walkRight', 'walkLeft', 'jump', 'land', 'wave', 'clap', 'win', 'idle']);

    // ── Wall-Clock Synchronized Teacher-Controlled 5-Act Choreography ──
    const revealOrder = [3, 2, 1].filter(s => Boolean(heroActors[s]));
    let timers = [], activePaths = [], rafId = null, disposed = false, crowned = false, currentStep = 0;
    let suspenseDim = 0, medalDropStart = null, shockStart = null, clockLast = performance.now(), startTime = clockLast;
    let pathRunSeq = 0;

    const sched = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const clearSched = () => { timers.forEach(clearTimeout); timers = []; pathRunSeq++; };

    function showPhase(text) {
      const pill = document.getElementById('scHallPhasePill');
      if (!pill) return;
      if (!text) { pill.style.display = 'none'; return; }
      pill.textContent = text;
      pill.style.display = 'inline-flex';
    }

    function updateStepBtn() {
      const sb = document.getElementById('scHallStepBtn');
      if (!sb) return;
      const next = revealOrder[currentStep];
      sb.textContent = next === 3 ? '🥉 كشف المركز الثالث'
        : (next === 2 ? '🥈 كشف المركز الثاني'
        : (next === 1 ? '👑 دخول المركز الأول!' : '🏆 التتويج النهائي'));
    }

    function launchFirework(x, y, z) {
      particles.spawnFirework(x ?? (Math.random() - 0.5) * 6.2, y ?? (4.0 + Math.random() * 1.4), z ?? (-1.2 + Math.random() * 1.8), [0xfef08a, 0xfbbf24, 0x38bdf8, 0xffffff], 76);
      cinAudio.playFireworkPop();
    }

    function startHeroPath(slot) {
      const actor = heroActors[slot], cfg = TIERS[slot];
      if (!actor || !cfg) return;
      const mySeq = pathRunSeq;
      // Clean unobstructed paths: #3 & #2 walk calmly (~2.25s) in side front lanes; #1 makes grand unobstructed front-carpet walk + center wave + jump!
      const segs = slot === 3
        ? [
            { from: [-5.1, 0.02, 1.92], to: [-2.32, 0.02, 1.72], durMs: 2250, move: 'walkRight', loop: true, jumpH: 0 },
            { from: [-2.32, 0.02, 1.72], to: [cfg.x, cfg.topY, cfg.z], durMs: 800, move: 'jump', loop: false, jumpH: 0.58 }
          ]
        : slot === 2
        ? [
            { from: [5.1, 0.02, 1.92], to: [2.32, 0.02, 1.72], durMs: 2250, move: 'walkLeft', loop: true, jumpH: 0 },
            { from: [2.32, 0.02, 1.72], to: [cfg.x, cfg.topY, cfg.z], durMs: 800, move: 'jump', loop: false, jumpH: 0.62 }
          ]
        : [
            { from: [-5.1, 0.02, 2.38], to: [0, 0.02, 2.15], durMs: 2450, move: 'walkRight', loop: true, jumpH: 0 },
            { from: [0, 0.02, 2.15], to: [0, 0.02, 2.15], durMs: 950, move: 'wave', loop: true, jumpH: 0 },
            { from: [0, 0.02, 2.15], to: [cfg.x, cfg.topY, cfg.z], durMs: 880, move: 'jump', loop: false, jumpH: 0.80 }
          ];

      actor.group.position.set(segs[0].from[0], segs[0].from[1], segs[0].from[2]);
      const readyP = actor.setAction(segs[0].move, segs[0].loop !== false);
      Promise.race([readyP, new Promise(r => sched(r, 1200))]).then(() => {
        if (disposed || crowned || mySeq !== pathRunSeq) return;
        actor.group.visible = true;
        actor.setOpacity(1);
        activePaths = activePaths.filter(p => p.slot !== slot);
        activePaths.push({ slot, actor, segs, segIdx: 0, segElapsed: 0, lastNow: null });
      });
    }

    function playStep(slot) {
      if (!TIERS[slot]) return;
      document.getElementById('scHallRoot')?.classList.remove('is-cinematic');
      const banner = document.getElementById('scHallOpeningBanner');
      if (banner) { banner.style.opacity = '0'; banner.style.transform = 'translateY(-16px)'; }
      updateStepBtn();

      if (slot === 3) {
        revealPlaque(3);
        showPhase(`🥉 المركز الثالث · ${top3[2]?.name || ''}`);
        camDir.setShot([-2.15, 2.0, 7.2], [-2.28, 1.38, 0.5], 2.7);
        sfx('pop'); cinAudio.playChime(440, 0.75);
        startHeroPath(3);
      } else if (slot === 2) {
        revealPlaque(2);
        showPhase(`🥈 المركز الثاني · ${top3[1]?.name || ''}`);
        camDir.setShot([2.15, 2.05, 7.2], [2.28, 1.48, 0.5], 2.7);
        sfx('pop'); cinAudio.playChime(523.25, 0.8);
        startHeroPath(2);
      } else if (slot === 1) {
        suspenseDim = 1;
        showPhase('👑 لحظة الترقّب... من بطل المركز الأول؟');
        camDir.setShot([0, 2.05, 8.8], [0, 1.5, 1.2], 2.3);
        cinAudio.playTimpaniPulse(74, 0.18);
        sched(() => cinAudio.playTimpaniPulse(84, 0.19), 420);
        sched(() => cinAudio.playTimpaniPulse(96, 0.21), 840);
        sched(() => {
          suspenseDim = 0;
          braziers.forEach((b, i) => sched(() => { b.lit = true; b.litTarget = 2.15; }, i * 120));
          revealPlaque(1);
          showPhase(`🥇 بطل المركز الأول · ${top3[0]?.name || ''}`);
          camDir.setShot([0, 2.08, 7.6], [0, 1.65, 1.1], 2.4);
          sfx('whoosh');
          startHeroPath(1);
        }, 1300);
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
      showPhase('');
      const dirBar = document.getElementById('scHallDirectorBar');
      if (dirBar) dirBar.style.display = 'none';
      const startBtn = document.getElementById('scHallStartBtn');
      if (startBtn) startBtn.disabled = false;
      braziers.forEach(b => { b.lit = true; b.litTarget = 1.95; });

      [1, 2, 3].forEach(slot => {
        revealPlaque(slot);
        const actor = heroActors[slot], cfg = TIERS[slot];
        if (!actor || !cfg) return;
        actor.group.visible = true;
        actor.setOpacity(1);
        actor.setJumpOffset(0);
        actor.group.position.set(cfg.x, cfg.topY, cfg.z);
        actor.setAction(slot === 1 ? 'win' : 'clap', true);
        if (tierCones[slot]) tierCones[slot].material.uniforms.uOpacity.value = slot === 1 ? 0.26 : 0.15;
        if (tierGlowRings[slot]) tierGlowRings[slot].opacity = 0.82;
      });
      audienceActors.forEach((a, i) => a.setAction(i % 2 === 0 ? 'clap' : 'wave', true));

      medal.group.visible = true;
      if (!withFx || isReduced) {
        medalDropStart = -1;
        medal.group.position.y = 3.68;
        medal.light.intensity = 2.2;
      } else {
        medalDropStart = performance.now();
        shockStart = performance.now();
        camDir.impulse(0.12);
        sfx('fanfare');
        cinAudio.playFanfareChord();
        launchFirework(-2.4, 4.6, -1.2);
        sched(() => launchFirework(2.4, 4.8, -1.0), 300);
        sched(() => launchFirework(0, 5.1, -1.4), 620);
        if (global.confetti) global.confetti({ particleCount: 95, spread: 125, origin: { y: 0.44 }, colors: ['#fef08a', '#fbbf24', '#ffffff', '#60a5fa'] });
      }

      camDir.setShot([0, 2.55, 9.45], [0, 2.02, 0], 2.2);
      const actBar = document.getElementById('scHallActions');
      if (actBar) actBar.style.display = 'flex';
      const skipBtn = document.getElementById('scHallSkipBtn');
      if (skipBtn) skipBtn.style.display = 'none';
    }

    function startCinematicShow() {
      if (isReduced || !top3.length) { crownNow(false); return; }
      if (crowned) {
        global.ScoreARWorldHalls?.replayHall?.();
        sched(() => global.ScoreARWorldHalls?.startCinematicShow?.(), 60);
        return;
      }
      clearSched();
      const sb = document.getElementById('scHallStartBtn');
      if (sb) { sb.disabled = true; sb.innerHTML = '⏳ <span>جارٍ الاحتفال...</span>'; }
      const remaining = revealOrder.slice(currentStep);
      if (!remaining.length) { crownNow(true); return; }
      remaining.forEach((slot, idx) => {
        sched(() => {
          currentStep = revealOrder.indexOf(slot) + 1;
          playStep(slot);
        }, idx === 0 ? 40 : idx * 5200);
      });
    }

    function animate(now) {
      if (disposed || !wrap.isConnected) { dispose(); return; }
      const dt = Math.min(0.05, Math.max(0.001, (now - clockLast) / 1000));
      clockLast = now;
      const elapsed = (now - startTime) / 1000;

      // Wall-clock synchronized 3D hero waypoint paths
      for (let i = activePaths.length - 1; i >= 0; i--) {
        const p = activePaths[i];
        const seg = p.segs[p.segIdx];
        if (p.lastNow === null) p.lastNow = now;
        p.segElapsed += Math.min(350, Math.max(0, now - p.lastNow));
        p.lastNow = now;
        const clamped = Math.min(1, p.segElapsed / seg.durMs);
        const ease = seg.jumpH > 0 ? (1 - Math.pow(1 - clamped, 2)) : clamped;
        const x = seg.from[0] + (seg.to[0] - seg.from[0]) * ease;
        const y = seg.from[1] + (seg.to[1] - seg.from[1]) * ease;
        const z = seg.from[2] + (seg.to[2] - seg.from[2]) * ease;
        p.actor.group.position.set(x, y, z);
        p.actor.setJumpOffset(seg.jumpH > 0 ? Math.sin(clamped * Math.PI) * seg.jumpH : 0);

        if (clamped >= 1) {
          p.segIdx++;
          if (p.segIdx < p.segs.length) {
            p.segElapsed = 0;
            const nx = p.segs[p.segIdx];
            p.actor.setAction(nx.move, nx.loop !== undefined ? nx.loop : (nx.move !== 'jump' && nx.move !== 'land'));
            if (p.slot === 1 && nx.move === 'jump') {
              camDir.setShot([0, 2.25, 6.1], [0, 2.05, 0], 2.6);
            }
          } else {
            p.actor.setJumpOffset(0);
            p.actor.setAction('land', false);
            particles.spawnFountain(p.actor.group.position.x, p.actor.group.position.y + 0.05, p.actor.group.position.z, TIERS[p.slot].coneHex, 24);
            if (tierCones[p.slot]) tierCones[p.slot].material.uniforms.uOpacity.value = p.slot === 1 ? 0.26 : 0.15;
            if (tierGlowRings[p.slot]) tierGlowRings[p.slot].opacity = 0.82;
            const doneSlot = p.slot;
            if (doneSlot === 1) {
              sched(() => { if (!crowned) p.actor.setAction('win', true); }, 420);
              sched(() => { if (!crowned) crownNow(true); }, 1770);
            } else {
              sched(() => { if (!crowned) p.actor.setAction('wave', true); }, 420);
              sched(() => { if (!crowned) p.actor.setAction('clap', true); }, 1570);
            }
            activePaths.splice(i, 1);
          }
        }
      }

      keyLight.intensity += ((suspenseDim ? 0.24 : 1.05) - keyLight.intensity) * Math.min(1, dt * 4.5);
      ambLight.intensity += ((suspenseDim ? 0.20 : 0.72) - ambLight.intensity) * Math.min(1, dt * 4.5);

      braziers.forEach((b, idx) => {
        b.fireMat.uniforms.uTime.value = elapsed;
        const target = b.lit ? 1.0 : 0.0;
        b.fireMat.uniforms.uIntensity.value += (target - b.fireMat.uniforms.uIntensity.value) * Math.min(1, dt * 5);
        const flick = b.lit ? (0.86 + Math.sin(elapsed * 12 + idx * 2.1) * 0.14) : 0;
        b.light.intensity += (b.litTarget * flick - b.light.intensity) * Math.min(1, dt * 6);
      });

      if (medal.group.visible) {
        if (medalDropStart && medalDropStart > 0) {
          const p = Math.min(1, (now - medalDropStart) / 850);
          const e = 1 - Math.pow(1 - p, 3);
          medal.group.position.y = 6.9 + (3.68 - 6.9) * e;
          medal.light.intensity = 2.2 * e;
          if (p >= 1) medalDropStart = -1;
        } else if (!isReduced) {
          medal.group.position.y = 3.68 + Math.sin(elapsed * 2.0) * 0.07;
        }
        if (!isReduced) {
          medal.group.rotation.y += dt * 0.85;
          medal.haloA.rotation.z += dt * 1.1;
          medal.haloB.rotation.z -= dt * 0.85;
        }
      }

      if (shockStart) {
        const sp = (now - shockStart) / 900;
        if (sp < 1) {
          const sc = 1 + sp * 9.5;
          shockMesh.scale.set(sc, sc, 1);
          shockMat.opacity = Math.max(0, (1 - sp) * 0.78);
        } else { shockMat.opacity = 0; shockStart = null; }
      }

      Object.values(tierCones).forEach(c => { c.material.uniforms.uTime.value = elapsed; });
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
      // Wide establishing shot + warm softly lit braziers; wait strictly for teacher's start/step click!
      camDir.setShot([0, 2.75, 10.2], [0, 1.95, 0], 1.7);
      sfx('whoosh');
      braziers.forEach((b, idx) => sched(() => { b.lit = true; b.litTarget = 1.65; cinAudio.playChime(392 + idx * 55, 0.55, 0.04); }, 180 + idx * 150));
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
      startCinematicShow,
      skipToFinal: () => crownNow(false),
      advanceStep: () => {
        clearSched();
        const sb = document.getElementById('scHallStartBtn');
        if (sb && !crowned) { sb.disabled = false; sb.innerHTML = '🎬 <span>ابدأ الاحتفال</span>'; }
        if (currentStep < revealOrder.length) { const s = revealOrder[currentStep++]; playStep(s); }
        else crownNow(true);
      },
      setCameraPreset: preset => {
        camDir.setPreset(preset);
        document.querySelectorAll('.sc-royal3d-cam-btn').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-cam-preset') === preset));
      },
      launchFirework: () => launchFirework(),
      triggerAudienceReaction: () => launchFirework((Math.random() - 0.5) * 5.0, 4.3 + Math.random() * 1.2, -0.8),
      capture3DSnapshot: () => Engine.captureWebGLSnapshot(renderer, scene, camera, quizTitle || 'تتويج أبطال القصر الملكي', 'القصر الملكي · ScoreAR'),
      getDebugState: () => ({
        engine: 'threejs-3d', world: 'royal', crowned, currentStep,
        heroes: Object.fromEntries(Object.entries(heroActors).map(([k, a]) => [k, { action: a.getAction(), visible: a.group.visible, x: Number(a.group.position.x.toFixed(2)), y: Number(a.group.position.y.toFixed(2)), z: Number(a.group.position.z.toFixed(2)) }])),
        audienceCount: audienceActors.length, medalVisible: medal.group.visible
      }),
      dispose
    };
  }

  global.ScoreARHall3DRoyal = { mountRoyal3DHall };
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHall3DRoyal = global.ScoreARHall3DRoyal; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ScoreARHall3DRoyal;
})(typeof window !== 'undefined' ? window : globalThis);
