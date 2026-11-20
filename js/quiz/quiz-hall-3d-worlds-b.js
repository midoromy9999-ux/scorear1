/**
 * ScoreAR 3D Bespoke Worlds Pack B: Treasure Island, Arabian Oasis & Magic Kingdom (quiz-hall-3d-worlds-b.js)
 * Zero-template custom 3D stages powered by ScoreARHall3DStage:
 *  3. treasure — Weathered wooden pier, brass-banded octagonal wharf podium, REAL opening 3D Treasure Chest
 *                blasting spinning 3D Gold Coins + Sculpted 3D Golden Nautical Compass.
 *  4. oasis    — Sandstone courtyard, live GLSL rippling turquoise reflecting pool, emerald-zellige dais,
 *                34 floating 3D golden sky lanterns drifting into twilight + Grand 3D Brass Lantern.
 *  5. magic    — Iridescent crystal floor, counter-rotating arcane rune circles, floating crystal dais,
 *                6 3D Crystal Shards spiraling inward to FORGE a Sculpted 3D Royal Crystal Crown.
 * Strictly Rule 7 Compliant (< 455 lines).
 */
(function (global) {
  'use strict';

  function makeCanvasTex(w, h, drawFn) {
    const THREE = global.THREE;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    drawFn(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return t;
  }

  function makePlaqueTex(bg1, bg2, borderHex, titleCol, nameCol, scoreCol, rankTxt, name, score) {
    return makeCanvasTex(768, 256, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, bg1); bg.addColorStop(1, bg2);
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = borderHex; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
      g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 2.5; g.strokeRect(22, 22, w - 44, h - 44);
      g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = titleCol; g.font = '900 36px Cairo, Tajawal, sans-serif'; g.fillText(rankTxt, w / 2, 58);
      g.fillStyle = nameCol; g.font = '900 52px Cairo, Tajawal, sans-serif'; g.fillText(String(name || 'بطل').slice(0, 18), w / 2, 134);
      g.fillStyle = scoreCol; g.font = '900 38px Montserrat, Cairo, sans-serif'; g.fillText(`${score || 0} نقطة`, w / 2, 206);
    });
  }

  function makeMysteryPlaqueTex(bg1, bg2, borderHex, titleCol, slot) {
    return makeCanvasTex(768, 256, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, bg1); bg.addColorStop(1, bg2);
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = borderHex; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
      g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 2.5; g.strokeRect(22, 22, w - 44, h - 44);
      g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = titleCol; g.font = '900 44px Cairo, Tajawal, sans-serif';
      g.fillText(slot === 1 ? '❓ البطل الأول' : (slot === 2 ? '❓ المركز الثاني' : '❓ المركز الثالث'), w / 2, 96);
      g.fillStyle = '#e2e8f0'; g.font = '800 30px Cairo, Tajawal, sans-serif';
      g.fillText('في انتظار لحظة التكريم...', w / 2, 182);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  WORLD 3: TREASURE ISLAND (جزيرة الكنز 3D)
   * ═══════════════════════════════════════════════════════════════════════ */
  function createTreasureSpec() {
    return {
      id: 'treasure', name: 'جزيرة الكنز', badge: '🧭', accent: '#fbbf24', bgCss: '#180d04',
      crestLabel: 'رصيف الكنز الأسطوري ثلاثي الأبعاد',
      openingSub: 'انفتاح صندوق الكنز وتطاير العملات الذهبية فوق الرصيف...',
      vistaSrc: 'assets/halls/treasure-hall.jpg', vistaCropY: 0.39, vistaY: 5.55, vistaH: 11.4,
      bgHex: 0x1a0e05, fogHex: 0x261408, fogDensity: 0.021,
      envWarm: 0xffdf99, envCool: 0x1e4e5f, keyHex: 0xffdfa0, keyInt: 1.15, hemiSky: 0xfed7aa, hemiGround: 0x3b1d08,
      rim1: 0xfbbf24, rimSide: 0xfde68a, shockHex: 0xf59e0b, reflectionTint: 0xd97706, reflectionAlpha: 0.22,
      particleColors: [0xfef08a, 0xf59e0b, 0xfed7aa, 0xffffff],
      confettiColors: ['#fde047', '#f59e0b', '#fb923c', '#ffffff'],

      buildWorld(ctx) {
        const { THREE, Engine, scene, top3, track } = ctx;

        // 1. Weathered Warm Wooden Plank Harbor Deck Floor
        const woodTex = track(makeCanvasTex(1024, 1024, (g, w, h) => {
          g.fillStyle = '#4a2811'; g.fillRect(0, 0, w, h);
          for (let y = 0; y < h; y += 64) {
            const tone = 62 + ((y * 13) % 24);
            g.fillStyle = `rgb(${tone + 26}, ${Math.floor(tone * 0.65)}, ${Math.floor(tone * 0.34)})`;
            g.fillRect(0, y + 2, w, 60);
            g.fillStyle = 'rgba(20,8,2,0.55)'; g.fillRect(0, y, w, 4);
            for (let x = 32; x < w; x += 192) {
              g.fillStyle = '#d99a32'; g.beginPath(); g.arc(x, y + 16, 4, 0, Math.PI * 2); g.fill();
              g.beginPath(); g.arc(x, y + 48, 4, 0, Math.PI * 2); g.fill();
            }
          }
          const vig = g.createRadialGradient(512, 512, 160, 512, 512, 520);
          vig.addColorStop(0, 'rgba(255,205,110,0.14)'); vig.addColorStop(1, 'rgba(12,5,2,0.58)');
          g.fillStyle = vig; g.fillRect(0, 0, w, h);
        }));
        const floor = new THREE.Mesh(track(new THREE.CircleGeometry(15.5, 64)), track(new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.56, metalness: 0.12 })));
        floor.rotation.x = -Math.PI / 2; floor.renderOrder = 4; scene.add(floor);

        // 2. Octagonal Brass-Banded Wooden Wharf Podium + Antique Parchment Scroll Plaques!
        const oakMat = track(new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.58, metalness: 0.1 }));
        const brassMat = track(new THREE.MeshStandardMaterial({ color: 0xe6a82e, metalness: 0.92, roughness: 0.22 }));
        const baseStep = new THREE.Mesh(track(new THREE.CylinderGeometry(3.85, 4.02, 0.18, 8)), oakMat);
        baseStep.position.y = 0.09; scene.add(baseStep);

        const tiers = {
          1: { x: 0, z: -0.1, r: 1.24, h: 0.88, topY: 1.06, accent: '#fbbf24' },
          2: { x: 2.38, z: 0.24, r: 1.02, h: 0.56, topY: 0.74, accent: '#fde68a' },
          3: { x: -2.38, z: 0.24, r: 0.96, h: 0.38, topY: 0.56, accent: '#fdba74' }
        };
        const plaques = {};
        [1, 2, 3].forEach(slot => {
          const pl = top3[slot - 1];
          if (!pl) return;
          const t = tiers[slot];
          const grp = new THREE.Group(); grp.position.set(t.x, 0.18, t.z);
          const body = new THREE.Mesh(track(new THREE.CylinderGeometry(t.r, t.r + 0.06, t.h, 8)), oakMat);
          body.position.y = t.h * 0.5; body.rotation.y = Math.PI / 8; grp.add(body);
          [0.08, t.h - 0.06].forEach(ry => {
            const band = new THREE.Mesh(track(new THREE.TorusGeometry(t.r + 0.03, 0.034, 10, 8)), brassMat);
            band.rotation.x = Math.PI / 2; band.rotation.z = Math.PI / 8; band.position.y = ry; grp.add(band);
          });
          const mTex = track(makeMysteryPlaqueTex('#3b1c08', '#1d0d04', t.accent, t.accent, slot));
          const pTex = track(makePlaqueTex('#3b1c08', '#1d0d04', t.accent, t.accent, '#fffbeb', '#fde047',
            slot === 1 ? '🥇 قبطان الكنز #1' : (slot === 2 ? '🥈 المركز الثاني' : `🥉 المركز #${pl._rank}`), pl.name, pl.score));
          const pMat = track(new THREE.MeshBasicMaterial({ map: mTex }));
          const plaque = new THREE.Mesh(track(new THREE.CylinderGeometry(t.r + 0.05, t.r + 0.07, Math.max(0.36, t.h * 0.72), 24, 1, true, -0.62, 1.24)), pMat);
          plaque.position.y = t.h * 0.5; grp.add(plaque);
          plaques[slot] = { mat: pMat, revealedTex: pTex };
          scene.add(grp);
        });

        // 3. TWIN REAL 3D OPENING TREASURE CHESTS flanking Tier #1 cleanly (ZERO name overlap!) + 30 Spinning Gold Coins!
        const lidPivots = [], chestLights = [];
        const chestPos = [[-1.38, 1.48, 0.24], [1.38, 1.48, -0.24]];
        chestPos.forEach(([cx, cz, ry]) => {
          const chest = new THREE.Group();
          chest.position.set(cx, 0.18, cz); chest.rotation.y = ry;
          const chestBox = new THREE.Mesh(track(new THREE.BoxGeometry(0.92, 0.44, 0.56)), oakMat);
          chestBox.position.y = 0.22; chest.add(chestBox);
          [-0.34, 0.34].forEach(bx => {
            const strap = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.46, 0.60)), brassMat);
            strap.position.set(bx, 0.23, 0); chest.add(strap);
          });
          const goldHeap = new THREE.Mesh(track(new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)), track(new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xd97706, emissiveIntensity: 0.85, metalness: 0.9, roughness: 0.18 })));
          goldHeap.scale.set(1.15, 0.55, 0.72); goldHeap.position.y = 0.36; chest.add(goldHeap);
          const lidPivot = new THREE.Group();
          lidPivot.position.set(0, 0.44, -0.28);
          const lidMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.28, 0.28, 0.92, 16, 1, false, 0, Math.PI)), oakMat);
          lidMesh.rotation.z = Math.PI / 2; lidMesh.position.set(0, 0, 0.28); lidPivot.add(lidMesh);
          chest.add(lidPivot);
          const chestLight = new THREE.PointLight(0xffcb3d, 0, 6.8);
          chestLight.position.set(0, 0.85, 0); chest.add(chestLight);
          scene.add(chest);
          lidPivots.push(lidPivot); chestLights.push(chestLight);
        });

        const coinGeo = track(new THREE.CylinderGeometry(0.08, 0.08, 0.022, 14));
        const coins = Array.from({ length: 30 }, () => {
          const m = new THREE.Mesh(coinGeo, brassMat);
          m.visible = false; scene.add(m);
          return { mesh: m, active: false, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0 };
        });

        // 4. Sculpted 3D Rotating Golden Nautical Compass Above Champion #1!
        const compass = new THREE.Group();
        compass.add(new THREE.Mesh(track(new THREE.TorusGeometry(0.58, 0.08, 18, 48)), brassMat));
        const face = new THREE.Mesh(track(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 40)), track(new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 })));
        face.rotation.x = Math.PI / 2; compass.add(face);
        const nRed = new THREE.Mesh(track(new THREE.ConeGeometry(0.11, 0.44, 4)), track(new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.5, roughness: 0.25 })));
        nRed.position.set(0, 0.20, 0.07); compass.add(nRed);
        const nDark = new THREE.Mesh(track(new THREE.ConeGeometry(0.11, 0.44, 4)), track(new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.25 })));
        nDark.rotation.z = Math.PI; nDark.position.set(0, -0.20, 0.07); compass.add(nDark);
        const cRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.84, 0.016, 12, 48)), track(new THREE.MeshBasicMaterial({ color: 0xfef08a })));
        cRing.rotation.x = 0.55; compass.add(cRing);
        compass.position.set(0, 3.68, 0); compass.visible = false; scene.add(compass);

        const chestBeam = Engine.createVolumetricCone(0xffd76b, 6.2, 0.42, 1.55, 0);
        chestBeam.mesh.position.set(0, 6.4, 0); scene.add(chestBeam.mesh);

        return {
          tiers, lidPivots, chestLights, chestBeam, coins, compass, cRing, chestOpen: false, lidAngle: 0, compScale: 0,
          revealPlaque: s => { const p = plaques[s]; if (p && p.mat && p.revealedTex) { p.mat.map = p.revealedTex; p.mat.needsUpdate = true; } }
        };
      },

      getHeroPath(slot, t) {
        if (slot === 3) {
          return [
            { from: [-5.2, 0.02, 1.95], to: [t.x, 0.02, 1.75], durMs: 2050, move: 'runRight', loop: true, jumpH: 0 },
            { from: [t.x, 0.02, 1.75], to: [t.x, t.topY, t.z], durMs: 780, move: 'jump', loop: false, jumpH: 0.58 }
          ];
        }
        if (slot === 2) {
          return [
            { from: [5.2, 0.02, 1.95], to: [t.x, 0.02, 1.75], durMs: 2050, move: 'runLeft', loop: true, jumpH: 0 },
            { from: [t.x, 0.02, 1.75], to: [t.x, t.topY, t.z], durMs: 780, move: 'jump', loop: false, jumpH: 0.62 }
          ];
        }
        return [
          { from: [-5.2, 0.02, 2.38], to: [0, 0.02, 2.15], durMs: 2300, move: 'walkRight', loop: true, jumpH: 0 },
          { from: [0, 0.02, 2.15], to: [0, 0.02, 2.15], durMs: 900, move: 'wave', loop: true, jumpH: 0 },
          { from: [0, 0.02, 2.15], to: [0, t.topY, t.z], durMs: 880, move: 'jump', loop: false, jumpH: 0.78 }
        ];
      },

      onCrown(ctx, withFx) {
        const d = ctx.worldData;
        d.chestOpen = true;
        d.compass.visible = true;
        d.chestBeam.material.uniforms.uOpacity.value = 0.24;
        d.compScale = withFx ? 0.05 : 1;
        if (!withFx) {
          d.lidAngle = -1.78;
          d.lidPivots.forEach(lp => { lp.rotation.x = -1.78; });
          d.chestLights.forEach(cl => { cl.intensity = 2.4; });
          d.compass.scale.set(1, 1, 1);
          return;
        }
        d.coins.forEach((c, idx) => {
          const side = idx % 2 === 0 ? -1.38 : 1.38;
          const a = (idx / d.coins.length) * Math.PI * 2 + Math.random() * 0.4;
          const spd = 1.1 + Math.random() * 2.1;
          c.active = true; c.mesh.visible = true;
          c.mesh.position.set(side, 0.62, 1.48);
          c.vx = Math.cos(a) * spd; c.vy = 3.2 + Math.random() * 2.5; c.vz = Math.sin(a) * spd;
          c.rx = 6 + Math.random() * 8; c.ry = 5 + Math.random() * 7;
        });
      },

      onUpdate(dt, elapsed, ctx) {
        const d = ctx.worldData;
        const targetLid = d.chestOpen ? -1.78 : 0;
        d.lidAngle += (targetLid - d.lidAngle) * Math.min(1, dt * 4.5);
        d.lidPivots.forEach(lp => { lp.rotation.x = d.lidAngle; });
        d.chestLights.forEach(cl => { cl.intensity += ((d.chestOpen ? 2.4 : 0) - cl.intensity) * Math.min(1, dt * 4); });
        d.chestBeam.material.uniforms.uTime.value = elapsed;

        d.coins.forEach(c => {
          if (!c.active) return;
          c.vy -= 7.8 * dt;
          c.mesh.position.x += c.vx * dt; c.mesh.position.y += c.vy * dt; c.mesh.position.z += c.vz * dt;
          c.mesh.rotation.x += c.rx * dt; c.mesh.rotation.y += c.ry * dt;
          if (c.mesh.position.y < 0.20) {
            c.mesh.position.y = 0.20;
            c.vy *= -0.45; c.vx *= 0.72; c.vz *= 0.72;
            if (Math.abs(c.vy) < 0.25) c.active = false;
          }
        });
        if (d.compass.visible) {
          if (d.compScale < 1) {
            d.compScale = Math.min(1, d.compScale + dt * 1.5);
            const e = 1 - Math.pow(1 - d.compScale, 3);
            d.compass.scale.set(e, e, e);
          }
          if (!ctx.isReduced) {
            d.compass.rotation.y += dt * 0.9;
            d.cRing.rotation.z += dt * 1.1;
            d.compass.position.y = 3.68 + Math.sin(elapsed * 2.0) * 0.08;
          }
        }
      }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  WORLD 4: ARABIAN OASIS — NIGHT OF FLOATING LANTERNS (الواحة العربية 3D)
   * ═══════════════════════════════════════════════════════════════════════ */
  function createOasisSpec() {
    return {
      id: 'oasis', name: 'الواحة العربية', badge: '🏮', accent: '#34d399', bgCss: '#061a14',
      crestLabel: 'ساحة الفوانيس المضيئة ثلاثية الأبعاد',
      openingSub: 'انعكاس الماء وارتفاع فوانيس التتويج في سماء الغسق...',
      vistaSrc: 'assets/halls/oasis-hall.jpg', vistaCropY: 0.40, vistaY: 5.5, vistaH: 11.4,
      bgHex: 0x071a15, fogHex: 0x102826, fogDensity: 0.020,
      envWarm: 0xffe4a1, envCool: 0x0f766e, keyHex: 0xffdfa8, keyInt: 1.08, hemiSky: 0xfde68a, hemiGround: 0x0d3b2e,
      rim1: 0xfde047, rimSide: 0x6ee7b7, shockHex: 0x34d399, reflectionTint: 0x2dd4bf, reflectionAlpha: 0.36,
      particleColors: [0xfef08a, 0xf59e0b, 0x34d399, 0xffffff],
      confettiColors: ['#fef08a', '#f59e0b', '#34d399', '#ffffff'],

      buildWorld(ctx) {
        const { THREE, scene, top3, track } = ctx;

        // 1. Live GLSL Rippling Turquoise Oasis Water Pool + Warm Sandstone Courtyard!
        const waterMat = track(new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 } },
          vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            uniform float uTime; varying vec2 vUv;
            void main() {
              vec2 p = vUv * 12.0;
              float w1 = sin(p.x * 1.6 + uTime * 1.8) * cos(p.y * 1.4 - uTime * 1.4);
              float w2 = sin((p.x + p.y) * 2.2 - uTime * 2.1) * 0.5;
              float rip = (w1 + w2) * 0.5 + 0.5;
              vec3 deep = vec3(0.03, 0.22, 0.25);
              vec3 turq = vec3(0.08, 0.48, 0.46);
              vec3 gold = vec3(1.0, 0.82, 0.38);
              vec3 col = mix(deep, turq, rip * 0.72);
              col += gold * pow(rip, 6.0) * 0.42;
              gl_FragColor = vec4(col, 1.0);
            }`
        }));
        const pool = new THREE.Mesh(track(new THREE.CircleGeometry(15.5, 64)), waterMat);
        pool.rotation.x = -Math.PI / 2; pool.renderOrder = 3; scene.add(pool);

        // Carved Sandstone Courtyard Island & Emerald-Zellige Dais
        const sandTex = track(makeCanvasTex(512, 512, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, w, h);
          gr.addColorStop(0, '#e6c48c'); gr.addColorStop(0.5, '#d4a86a'); gr.addColorStop(1, '#b8864a');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          g.strokeStyle = 'rgba(110,70,28,0.28)'; g.lineWidth = 3;
          for (let i = 0; i < 512; i += 64) { g.strokeRect(i, 0, 64, 512); g.strokeRect(0, i, 512, 64); }
        }));
        const sandMat = track(new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.48, metalness: 0.08 }));
        const brassMat = track(new THREE.MeshStandardMaterial({ color: 0xf4be3c, metalness: 0.9, roughness: 0.2 }));
        const island = new THREE.Mesh(track(new THREE.CylinderGeometry(4.15, 4.35, 0.18, 48)), sandMat);
        island.position.y = 0.09; scene.add(island);
        const islandTrim = new THREE.Mesh(track(new THREE.TorusGeometry(4.16, 0.04, 12, 56)), brassMat);
        islandTrim.rotation.x = Math.PI / 2; islandTrim.position.y = 0.18; scene.add(islandTrim);

        const tiers = {
          1: { x: 0, z: 0, r: 1.24, h: 0.88, topY: 1.06, accent: '#fde047' },
          2: { x: 2.34, z: 0.26, r: 1.02, h: 0.56, topY: 0.74, accent: '#34d399' },
          3: { x: -2.34, z: 0.26, r: 0.96, h: 0.38, topY: 0.56, accent: '#fbbf24' }
        };
        const plaques = {};
        [1, 2, 3].forEach(slot => {
          const pl = top3[slot - 1];
          if (!pl) return;
          const t = tiers[slot];
          const grp = new THREE.Group(); grp.position.set(t.x, 0.18, t.z);
          const body = new THREE.Mesh(track(new THREE.CylinderGeometry(t.r, t.r + 0.06, t.h, 40)), sandMat);
          body.position.y = t.h * 0.5; grp.add(body);
          const rim = new THREE.Mesh(track(new THREE.TorusGeometry(t.r + 0.02, 0.036, 12, 44)), brassMat);
          rim.rotation.x = Math.PI / 2; rim.position.y = t.h; grp.add(rim);
          const mTex = track(makeMysteryPlaqueTex('#063628', '#041f18', t.accent, t.accent, slot));
          const pTex = track(makePlaqueTex('#063628', '#041f18', t.accent, t.accent, '#ffffff', '#fef08a',
            slot === 1 ? '🥇 بطل الواحة #1' : (slot === 2 ? '🥈 المركز الثاني' : `🥉 المركز #${pl._rank}`), pl.name, pl.score));
          const pMat = track(new THREE.MeshBasicMaterial({ map: mTex }));
          const pMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(t.r + 0.04, t.r + 0.05, Math.max(0.34, t.h * 0.72), 24, 1, true, -0.66, 1.32)), pMat);
          pMesh.position.y = t.h * 0.5; grp.add(pMesh);
          plaques[slot] = { mat: pMat, revealedTex: pTex };
          scene.add(grp);
        });

        // 2. 34 REAL 3D WARM FIERY AMBER FLOATING SKY LANTERNS (Tangled-Style Spectacle!)
        const skyLanTex = track(makeCanvasTex(128, 128, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, '#c2410c'); gr.addColorStop(0.35, '#f59e0b');
          gr.addColorStop(0.75, '#fde047'); gr.addColorStop(1, '#fffbeb');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          g.strokeStyle = 'rgba(120,53,15,0.65)'; g.lineWidth = 6;
          g.strokeRect(0, 4, w, h - 8);
          for (let x = 32; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
        }));
        const lanGeo = track(new THREE.CylinderGeometry(0.18, 0.12, 0.34, 8));
        const lanMat = track(new THREE.MeshBasicMaterial({ map: skyLanTex }));
        const skyLanterns = Array.from({ length: 34 }, () => {
          const g = new THREE.Group();
          const body = new THREE.Mesh(lanGeo, lanMat); g.add(body);
          const cap = new THREE.Mesh(track(new THREE.TorusGeometry(0.13, 0.018, 6, 8)), brassMat);
          cap.rotation.x = Math.PI / 2; cap.position.y = -0.16; g.add(cap);
          const x = (Math.random() - 0.5) * 14.5;
          const y = 0.8 + Math.random() * 6.5;
          const z = -1.5 - Math.random() * 7.5;
          g.position.set(x, y, z);
          scene.add(g);
          return { g, baseX: x, vy: 0.25 + Math.random() * 0.42, phase: Math.random() * 6.28 };
        });

        // 3. Grand Sculpted 3D Pierced-Brass Royal Crown Lantern Above Champion #1!
        const grandLantern = new THREE.Group();
        const domePts = [new THREE.Vector2(0.42, 0.42), new THREE.Vector2(0.34, 0.68), new THREE.Vector2(0.14, 0.88), new THREE.Vector2(0.0, 0.96)];
        grandLantern.add(new THREE.Mesh(track(new THREE.LatheGeometry(domePts, 16)), brassMat));
        const glassTex = track(makeCanvasTex(256, 256, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, '#b45309'); gr.addColorStop(0.5, '#fbbf24'); gr.addColorStop(1, '#fef08a');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          g.strokeStyle = '#78350f'; g.lineWidth = 10;
          for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
          g.strokeRect(0, 8, w, h - 16);
        }));
        const glass = new THREE.Mesh(track(new THREE.CylinderGeometry(0.36, 0.32, 0.68, 8)), track(new THREE.MeshStandardMaterial({ map: glassTex, emissive: 0xd97706, emissiveIntensity: 0.75, roughness: 0.22 })));
        glass.position.y = 0.08; grandLantern.add(glass);
        const lBase = new THREE.Mesh(track(new THREE.ConeGeometry(0.38, 0.34, 8)), brassMat);
        lBase.rotation.x = Math.PI; lBase.position.y = -0.42; grandLantern.add(lBase);
        const lAura = new THREE.Mesh(track(new THREE.TorusGeometry(0.76, 0.018, 12, 48)), track(new THREE.MeshBasicMaterial({ color: 0x34d399 })));
        lAura.position.y = 0.1; lAura.rotation.x = 0.55; grandLantern.add(lAura);
        grandLantern.add(new THREE.PointLight(0xffcb47, 2.5, 9));
        grandLantern.position.set(0, 2.0, 0); grandLantern.visible = false; scene.add(grandLantern);

        return {
          tiers, waterMat, skyLanterns, grandLantern, lAura, riseProg: 0,
          revealPlaque: s => { const p = plaques[s]; if (p && p.mat && p.revealedTex) { p.mat.map = p.revealedTex; p.mat.needsUpdate = true; } }
        };
      },

      onCrown(ctx, withFx) {
        const d = ctx.worldData;
        d.grandLantern.visible = true;
        d.riseProg = withFx ? 0.01 : 1;
        if (!withFx) d.grandLantern.position.y = 3.55;
      },

      onUpdate(dt, elapsed, ctx, crowned) {
        const d = ctx.worldData;
        d.waterMat.uniforms.uTime.value = elapsed;
        if (!ctx.isReduced) {
          const boost = crowned ? 1.55 : 0.7;
          d.skyLanterns.forEach(l => {
            l.g.position.y += l.vy * boost * dt;
            l.g.position.x = l.baseX + Math.sin(elapsed * 0.9 + l.phase) * 0.25;
            if (l.g.position.y > 8.2) l.g.position.y = 0.6;
          });
        }
        if (d.grandLantern.visible) {
          if (d.riseProg < 1) {
            d.riseProg = Math.min(1, d.riseProg + dt * 1.1);
            const e = 1 - Math.pow(1 - d.riseProg, 3);
            d.grandLantern.position.y = 1.6 + (3.55 - 1.6) * e;
          } else if (!ctx.isReduced) {
            d.grandLantern.position.y = 3.55 + Math.sin(elapsed * 1.8) * 0.08;
          }
          if (!ctx.isReduced) {
            d.grandLantern.rotation.y += dt * 0.65;
            d.lAura.rotation.z += dt * 1.1;
          }
        }
      }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  WORLD 5: MAGIC KINGDOM — CRYSTAL CROWN FORGING (مملكة السحر 3D)
   * ═══════════════════════════════════════════════════════════════════════ */
  function createMagicSpec() {
    return {
      id: 'magic', name: 'مملكة السحر', badge: '💎', accent: '#c084fc', bgCss: '#14082b',
      crestLabel: 'قاعة البلورات العائمة ثلاثية الأبعاد',
      openingSub: 'هبوط الأبطال وتجمّع شظايا الضوء لتشكيل التاج البلوري...',
      vistaSrc: 'assets/halls/magic-hall.jpg', vistaCropY: 0.36, vistaY: 5.55, vistaH: 11.6,
      bgHex: 0x160930, fogHex: 0x1f0d42, fogDensity: 0.020,
      envWarm: 0xf5d0fe, envCool: 0x6d28d9, keyHex: 0xf8e7ff, keyInt: 1.08, hemiSky: 0xe9d5ff, hemiGround: 0x2e1065,
      rim1: 0xe879f9, rimSide: 0x7dd3fc, shockHex: 0xc084fc, reflectionTint: 0xc084fc, reflectionAlpha: 0.42,
      particleColors: [0xf5d0fe, 0xc084fc, 0x38bdf8, 0xfef08a],
      confettiColors: ['#f5d0fe', '#c084fc', '#38bdf8', '#fde047'],

      buildWorld(ctx) {
        const { THREE, scene, top3, track } = ctx;

        // 1. Iridescent Starlit Lavender Crystal Floor + Counter-Rotating Arcane Rune Circles!
        const floorTex = track(makeCanvasTex(1024, 1024, (g, w, h) => {
          const bg = g.createRadialGradient(512, 512, 60, 512, 512, 512);
          bg.addColorStop(0, '#3b1578'); bg.addColorStop(0.55, '#220b4c'); bg.addColorStop(1, '#100526');
          g.fillStyle = bg; g.fillRect(0, 0, w, h);
          g.strokeStyle = 'rgba(232,121,249,0.45)'; g.lineWidth = 3;
          [190, 290, 410].forEach(r => { g.beginPath(); g.arc(512, 512, r, 0, Math.PI * 2); g.stroke(); });
        }));
        const floor = new THREE.Mesh(track(new THREE.CircleGeometry(15.5, 64)), track(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.14, metalness: 0.35, transparent: true, opacity: 0.9 })));
        floor.rotation.x = -Math.PI / 2; floor.renderOrder = 4; scene.add(floor);

        const runeA = new THREE.Mesh(track(new THREE.RingGeometry(3.8, 4.15, 6)), track(new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })));
        runeA.rotation.x = -Math.PI / 2; runeA.position.y = 0.025; scene.add(runeA);
        const runeB = new THREE.Mesh(track(new THREE.RingGeometry(4.45, 4.72, 8)), track(new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })));
        runeB.rotation.x = -Math.PI / 2; runeB.position.y = 0.022; scene.add(runeB);

        // 2. Pearl-Lavender Crystal Dais + Orbiting Amethyst Prisms
        const pearlMat = track(new THREE.MeshStandardMaterial({ color: 0xede2ff, roughness: 0.22, metalness: 0.25 }));
        const crystalMat = track(new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0x7e22ce, emissiveIntensity: 0.85, roughness: 0.12, metalness: 0.35 }));
        const cyanCrysMat = track(new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0284c7, emissiveIntensity: 1.1, roughness: 0.1, metalness: 0.3 }));
        const goldMat = track(new THREE.MeshStandardMaterial({ color: 0xf7c538, metalness: 0.92, roughness: 0.16 }));

        const base = new THREE.Mesh(track(new THREE.CylinderGeometry(3.8, 3.95, 0.16, 48)), pearlMat);
        base.position.y = 0.08; scene.add(base);

        const tiers = {
          1: { x: 0, z: 0, r: 1.24, h: 0.90, topY: 1.06, accent: '#f5d0fe' },
          2: { x: 2.34, z: 0.26, r: 1.02, h: 0.56, topY: 0.72, accent: '#c084fc' },
          3: { x: -2.34, z: 0.26, r: 0.96, h: 0.38, topY: 0.54, accent: '#38bdf8' }
        };
        const plaques = {};
        [1, 2, 3].forEach(slot => {
          const pl = top3[slot - 1];
          if (!pl) return;
          const t = tiers[slot];
          const grp = new THREE.Group(); grp.position.set(t.x, 0.16, t.z);
          const body = new THREE.Mesh(track(new THREE.CylinderGeometry(t.r, t.r + 0.06, t.h, 36)), pearlMat);
          body.position.y = t.h * 0.5; grp.add(body);
          const trim = new THREE.Mesh(track(new THREE.TorusGeometry(t.r + 0.03, 0.036, 12, 40)), goldMat);
          trim.rotation.x = Math.PI / 2; trim.position.y = t.h; grp.add(trim);
          const mTex = track(makeMysteryPlaqueTex('#2b0d59', '#160633', t.accent, t.accent, slot));
          const pTex = track(makePlaqueTex('#2b0d59', '#160633', t.accent, t.accent, '#ffffff', '#fde047',
            slot === 1 ? '🥇 بطل السحر #1' : (slot === 2 ? '🥈 المركز الثاني' : `🥉 المركز #${pl._rank}`), pl.name, pl.score));
          const pMat = track(new THREE.MeshBasicMaterial({ map: mTex }));
          const pMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(t.r + 0.04, t.r + 0.05, Math.max(0.34, t.h * 0.72), 24, 1, true, -0.66, 1.32)), pMat);
          pMesh.position.y = t.h * 0.5; grp.add(pMesh);
          plaques[slot] = { mat: pMat, revealedTex: pTex };
          scene.add(grp);
        });

        // 3. 6 Flying 3D Crystal Shards that SPIRAL INWARD and FORGE the Sculpted 3D Crystal Crown!
        const shardGeo = track(new THREE.OctahedronGeometry(0.22, 0));
        const shards = Array.from({ length: 6 }, (_, i) => {
          const ang = (i / 6) * Math.PI * 2;
          const m = new THREE.Mesh(shardGeo, i % 2 === 0 ? crystalMat : cyanCrysMat);
          m.scale.set(0.7, 1.45, 0.7);
          m.position.set(Math.cos(ang) * 4.2, 2.2 + (i % 2) * 1.1, Math.sin(ang) * 3.4 - 0.8);
          scene.add(m);
          return { mesh: m, startAng: ang, startPos: m.position.clone() };
        });

        const crown = new THREE.Group();
        const circlet = new THREE.Mesh(track(new THREE.TorusGeometry(0.46, 0.065, 14, 40)), goldMat);
        circlet.rotation.x = Math.PI / 2; crown.add(circlet);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const isFront = i === 0 || i === 3;
          const spire = new THREE.Mesh(track(new THREE.ConeGeometry(0.11, isFront ? 0.62 : 0.42, 6)), isFront ? cyanCrysMat : crystalMat);
          spire.position.set(Math.cos(a) * 0.44, isFront ? 0.30 : 0.21, Math.sin(a) * 0.44);
          crown.add(spire);
        }
        const centerGem = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.18, 0)), cyanCrysMat);
        centerGem.position.y = 0.46; crown.add(centerGem);
        const halo = new THREE.Mesh(track(new THREE.TorusGeometry(0.82, 0.016, 12, 48)), track(new THREE.MeshBasicMaterial({ color: 0xf5d0fe })));
        halo.position.y = 0.22; halo.rotation.x = 0.55; crown.add(halo);
        crown.add(new THREE.PointLight(0xe879f9, 2.4, 9));
        crown.position.set(0, 3.52, 0); crown.visible = false; scene.add(crown);

        return {
          tiers, runeA, runeB, shards, crown, halo, forgeProg: -1,
          revealPlaque: s => { const p = plaques[s]; if (p && p.mat && p.revealedTex) { p.mat.map = p.revealedTex; p.mat.needsUpdate = true; } }
        };
      },

      getHeroPath(slot, t) {
        if (slot === 3) {
          return [{ from: [-4.4, 5.2, 0.7], to: [t.x, t.topY, t.z], durMs: 2350, move: 'fly', loop: true, arcY: 0.55, jumpH: 0 }];
        }
        if (slot === 2) {
          return [{ from: [4.4, 5.2, 0.7], to: [t.x, t.topY, t.z], durMs: 2350, move: 'fly', loop: true, arcY: 0.55, jumpH: 0 }];
        }
        return [
          { from: [-3.8, 5.6, 1.8], to: [0, 2.5, 1.45], durMs: 1750, move: 'fly', loop: true, arcY: 0.45, jumpH: 0 },
          { from: [0, 2.5, 1.45], to: [0, t.topY, t.z], durMs: 1250, move: 'fly', loop: true, arcY: 0.25, jumpH: 0 }
        ];
      },

      onCrown(ctx, withFx) {
        const d = ctx.worldData;
        if (!withFx) {
          d.forgeProg = 1;
          d.shards.forEach(s => { s.mesh.visible = false; });
          d.crown.visible = true; d.crown.scale.set(1, 1, 1);
          return;
        }
        d.forgeProg = 0; // Triggers spiral forging animation!
      },

      onUpdate(dt, elapsed, ctx) {
        const d = ctx.worldData;
        if (!ctx.isReduced) {
          d.runeA.rotation.z += dt * 0.28;
          d.runeB.rotation.z -= dt * 0.22;
        }
        if (d.forgeProg < 0) {
          // Hovering outer crystal shards waiting to forge
          d.shards.forEach((s, i) => {
            const a = s.startAng + elapsed * 0.45;
            s.mesh.position.set(Math.cos(a) * 4.2, 2.5 + Math.sin(elapsed * 2 + i) * 0.3, Math.sin(a) * 3.0 - 0.8);
            s.mesh.rotation.y += dt * 1.4;
          });
        } else if (d.forgeProg < 1) {
          // Spiral rapidly inward toward (0, 3.6, 0) and FORGE into the 3D Crystal Crown!
          d.forgeProg = Math.min(1, d.forgeProg + dt * 1.35);
          const e = Math.pow(d.forgeProg, 2);
          const rad = 4.2 * (1 - e);
          d.shards.forEach((s, i) => {
            const a = s.startAng + elapsed * 2.4 + e * 4.0;
            s.mesh.position.set(Math.cos(a) * rad, 2.5 + (3.62 - 2.5) * e, Math.sin(a) * rad);
            s.mesh.rotation.y += dt * 5.0;
            if (d.forgeProg >= 0.96) s.mesh.visible = false;
          });
          if (d.forgeProg >= 0.88 && !d.crown.visible) {
            d.crown.visible = true;
            d.crown.scale.set(0.2, 0.2, 0.2);
            ctx.launchFirework(0, 3.8, 0);
          }
        }
        if (d.crown.visible) {
          const s = d.crown.scale.x + (1 - d.crown.scale.x) * Math.min(1, dt * 7);
          d.crown.scale.set(s, s, s);
          if (!ctx.isReduced) {
            d.crown.rotation.y += dt * 0.85;
            d.halo.rotation.z += dt * 1.25;
            d.crown.position.y = 3.52 + Math.sin(elapsed * 2.0) * 0.08;
          }
        }
      }
    };
  }

  global.ScoreARHall3DWorldsB = { treasure: createTreasureSpec, oasis: createOasisSpec, magic: createMagicSpec };
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHall3DWorldsB = global.ScoreARHall3DWorldsB; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ScoreARHall3DWorldsB;
})(typeof window !== 'undefined' ? window : globalThis);
