/**
 * ScoreAR 3D Bespoke Worlds Pack A: Champions Stadium & Cosmic Station (quiz-hall-3d-worlds-a.js)
 * Zero-template custom 3D stages powered by ScoreARHall3DStage:
 *  1. stadium — Red athletics track, hydraulic rising chrome/LED podium, towering 3D Jumbotron,
 *               sweeping volumetric floodlights, crowd camera flashes, sculpted 3D Gold Trophy Cup.
 *  2. cosmic  — Brushed titanium hex deck, sequential cyan laser docking rings, levitating hexagonal
 *               holopads, translucent floating hologram score screens, 3D spinning planet & warp beam.
 * Strictly Rule 7 Compliant (< 430 lines).
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

  /* ═══════════════════════════════════════════════════════════════════════
   *  WORLD 1: CHAMPIONS NIGHT STADIUM (استاد الأبطال 3D)
   * ═══════════════════════════════════════════════════════════════════════ */
  function createStadiumSpec() {
    return {
      id: 'stadium', name: 'استاد الأبطال', badge: '🏆', accent: '#38bdf8', bgCss: '#061229',
      crestLabel: 'نهائي استاد الأبطال الليلي',
      openingSub: 'تلاقي الكشافات وارتفاع المنصة الهيدروليكية على المضمار...',
      vistaSrc: 'assets/halls/stadium-hall.jpg', vistaCropY: 0.36, vistaY: 5.55, vistaH: 11.6,
      bgHex: 0x061229, fogHex: 0x0a1c40, fogDensity: 0.022,
      envWarm: 0xfff3cc, envCool: 0x1d4ed8, keyHex: 0xf0f8ff, keyInt: 1.15, hemiSky: 0x93c5fd, hemiGround: 0x1e293b,
      rim1: 0x7dd3fc, rimSide: 0xfef08a, shockHex: 0x38bdf8, reflectionTint: 0x38bdf8, reflectionAlpha: 0.24,
      particleColors: [0xffffff, 0x38bdf8, 0xfde047, 0x60a5fa],
      confettiColors: ['#ffffff', '#38bdf8', '#fde047', '#ef4444'],

      buildWorld(ctx) {
        const { THREE, Engine, scene, top3, track, quizTitle } = ctx;

        // 1. Curved Crimson Running Track + Emerald Infield Grass 3D Floor
        const floorTex = track(makeCanvasTex(1024, 1024, (g, w, h) => {
          g.fillStyle = '#8b241c'; g.fillRect(0, 0, w, h);
          const rg = g.createRadialGradient(512, 512, 100, 512, 512, 512);
          rg.addColorStop(0, '#14532d'); rg.addColorStop(0.38, '#166534');
          rg.addColorStop(0.41, '#9f2a1f'); rg.addColorStop(0.88, '#7f1d1d'); rg.addColorStop(1, '#3f0d0c');
          g.fillStyle = rg; g.fillRect(0, 0, w, h);
          // Crisp white athletics lane stripes
          [212, 268, 326, 384, 442, 495].forEach((r, idx) => {
            g.strokeStyle = idx === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)';
            g.lineWidth = idx === 0 ? 5 : 3;
            g.beginPath(); g.arc(512, 512, r, 0, Math.PI * 2); g.stroke();
          });
          // Center pitch circle
          g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 4;
          g.beginPath(); g.arc(512, 512, 118, 0, Math.PI * 2); g.stroke();
        }));
        const floor = new THREE.Mesh(track(new THREE.CircleGeometry(15.5, 64)), track(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.42, metalness: 0.1 })));
        floor.rotation.x = -Math.PI / 2; floor.renderOrder = 4; scene.add(floor);

        // 2. Towering Curved 3D Stadium Jumbotron Screen behind the podium!
        const jumboTex = track(makeCanvasTex(1024, 320, (g, w, h) => {
          const bg = g.createLinearGradient(0, 0, 0, h);
          bg.addColorStop(0, '#071636'); bg.addColorStop(0.5, '#0c275e'); bg.addColorStop(1, '#051026');
          g.fillStyle = bg; g.fillRect(0, 0, w, h);
          // LED dot grid texture
          g.fillStyle = 'rgba(56,189,248,0.12)';
          for (let y = 12; y < h; y += 16) g.fillRect(0, y, w, 2);
          g.strokeStyle = '#38bdf8'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
          g.strokeStyle = '#fbbf24'; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44);
          g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = '#38bdf8'; g.font = '900 32px Cairo, Tajawal, sans-serif';
          g.fillText('🏆 تتويج أبطال استاد ScoreAR 🏆', w / 2, 66);
          g.fillStyle = '#ffffff'; g.font = '900 44px Cairo, Tajawal, sans-serif';
          g.fillText(String(quizTitle || 'نهائي الأبطال').slice(0, 38), w / 2, 152);
          // Decorative LED sound equalizer bars
          for (let i = 0; i < 24; i++) {
            const bh = 18 + ((i * 19) % 34);
            g.fillStyle = i % 3 === 0 ? '#fbbf24' : '#38bdf8';
            g.fillRect(112 + i * 34, 280 - bh, 20, bh);
          }
        }));
        const jumboFrame = new THREE.Group();
        jumboFrame.position.set(0, 5.42, -6.2);
        const frameMat = track(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 }));
        jumboFrame.add(new THREE.Mesh(track(new THREE.BoxGeometry(6.8, 2.22, 0.24)), frameMat));
        const screenMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(6.48, 1.98)), track(new THREE.MeshBasicMaterial({ map: jumboTex })));
        screenMesh.position.z = 0.13; jumboFrame.add(screenMesh);
        scene.add(jumboFrame);

        // 3. Hydraulic Rising Athletic Block Podium with LED Scoreboard Fronts!
        const chromeMat = track(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.16 }));
        const navyMat = track(new THREE.MeshStandardMaterial({ color: 0x0f2554, metalness: 0.65, roughness: 0.28 }));
        const goldMat = track(new THREE.MeshStandardMaterial({ color: 0xf7c538, metalness: 0.95, roughness: 0.15, emissive: 0x3b2400, emissiveIntensity: 0.25 }));

        const tiers = {
          1: { x: 0, z: 0, w: 2.35, d: 1.95, h: 1.06, topY: 1.06, accent: '#fbbf24', hex: 0xfbbf24 },
          2: { x: 2.48, z: 0.22, w: 2.02, d: 1.72, h: 0.72, topY: 0.72, accent: '#38bdf8', hex: 0x38bdf8 },
          3: { x: -2.48, z: 0.22, w: 1.95, d: 1.68, h: 0.52, topY: 0.52, accent: '#fb923c', hex: 0xfb923c }
        };
        const hydraulicBlocks = {};
        const plaques = {};
        [1, 2, 3].forEach(slot => {
          const pl = top3[slot - 1];
          if (!pl) return;
          const t = tiers[slot];
          const grp = new THREE.Group();
          grp.position.set(t.x, -t.h, t.z); // Starts retracted under the turf — rises hydraulically!

          const body = new THREE.Mesh(track(new THREE.BoxGeometry(t.w, t.h, t.d)), navyMat);
          body.position.y = t.h * 0.5; grp.add(body);
          const cap = new THREE.Mesh(track(new THREE.BoxGeometry(t.w + 0.1, 0.08, t.d + 0.1)), chromeMat);
          cap.position.y = t.h - 0.02; grp.add(cap);
          const ledStrip = new THREE.Mesh(track(new THREE.BoxGeometry(t.w + 0.12, 0.05, t.d + 0.12)), track(new THREE.MeshBasicMaterial({ color: t.hex })));
          ledStrip.position.y = t.h - 0.08; grp.add(ledStrip);

          // Glowing LED Digital Scoreboard Front Panel (mystery until revealed!)
          const mysteryTex = track(makeCanvasTex(768, 256, (g, w, h) => {
            g.fillStyle = '#061028'; g.fillRect(0, 0, w, h);
            g.strokeStyle = t.accent; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
            g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = t.accent; g.font = '900 44px Cairo, sans-serif';
            g.fillText(slot === 1 ? '❓ البطل الأول' : (slot === 2 ? '❓ المركز الثاني' : '❓ المركز الثالث'), w / 2, 96);
            g.fillStyle = '#cbd5e1'; g.font = '800 32px Cairo, sans-serif';
            g.fillText('في انتظار لحظة التكريم...', w / 2, 182);
          }));
          const ledTex = track(makeCanvasTex(768, 256, (g, w, h) => {
            g.fillStyle = '#061028'; g.fillRect(0, 0, w, h);
            g.strokeStyle = t.accent; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
            g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = t.accent; g.font = '900 36px Cairo, sans-serif';
            g.fillText(slot === 1 ? '🥇 المركز الأول' : (slot === 2 ? '🥈 المركز الثاني' : `🥉 المركز #${pl._rank}`), w / 2, 58);
            g.fillStyle = '#ffffff'; g.font = '900 54px Cairo, sans-serif';
            g.fillText(String(pl.name || 'بطل').slice(0, 18), w / 2, 134);
            g.fillStyle = '#fef08a'; g.font = '900 38px Montserrat, Cairo, sans-serif';
            g.fillText(`${pl.score || 0} نقطة`, w / 2, 206);
          }));
          const frontMat = track(new THREE.MeshBasicMaterial({ map: mysteryTex }));
          const front = new THREE.Mesh(track(new THREE.PlaneGeometry(t.w * 0.9, Math.max(0.36, t.h * 0.72))), frontMat);
          front.position.set(0, t.h * 0.46, t.d * 0.5 + 0.02); grp.add(front);
          plaques[slot] = { mat: frontMat, revealedTex: ledTex };

          scene.add(grp);
          hydraulicBlocks[slot] = { grp, targetY: 0, h: t.h, risen: false };
        });

        // 4. Sculpted 3D Metallic Gold Champions Cup Trophy!
        const cup = new THREE.Group();
        const cupPts = [
          new THREE.Vector2(0.32, 0), new THREE.Vector2(0.30, 0.1), new THREE.Vector2(0.10, 0.22),
          new THREE.Vector2(0.09, 0.48), new THREE.Vector2(0.24, 0.56), new THREE.Vector2(0.42, 0.86),
          new THREE.Vector2(0.46, 1.18), new THREE.Vector2(0.40, 1.18), new THREE.Vector2(0.35, 0.85)
        ];
        cup.add(new THREE.Mesh(track(new THREE.LatheGeometry(cupPts, 36)), goldMat));
        [-1, 1].forEach(dir => {
          const handle = new THREE.Mesh(track(new THREE.TorusGeometry(0.22, 0.035, 12, 24, Math.PI * 1.15)), goldMat);
          handle.position.set(dir * 0.41, 0.90, 0);
          handle.rotation.z = dir > 0 ? -Math.PI * 0.55 : Math.PI * 0.55;
          cup.add(handle);
        });
        const cupHalo = new THREE.Mesh(track(new THREE.TorusGeometry(0.76, 0.018, 12, 48)), track(new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })));
        cupHalo.position.y = 0.75; cupHalo.rotation.x = 0.5; cup.add(cupHalo);
        const cupLight = new THREE.PointLight(0xffd76b, 2.2, 8);
        cupLight.position.y = 0.85; cup.add(cupLight);
        cup.position.set(0, 1.8, 0); cup.scale.set(0.01, 0.01, 0.01); cup.visible = false;
        scene.add(cup);

        // 5. Twin Sweeping Volumetric Floodlights + Blinking Crowd Camera Flashes!
        const floodL = Engine.createVolumetricCone(0x93c5fd, 13.5, 0.4, 2.8, 0.19);
        floodL.mesh.position.set(-7.2, 8.8, -3.6); scene.add(floodL.mesh);
        const floodR = Engine.createVolumetricCone(0x93c5fd, 13.5, 0.4, 2.8, 0.19);
        floodR.mesh.position.set(7.2, 8.8, -3.6); scene.add(floodR.mesh);

        const flashGeo = track(new THREE.SphereGeometry(0.11, 8, 8));
        const flashes = Array.from({ length: 28 }, (_, i) => {
          const ang = -1.15 + (i / 27) * 2.3;
          const mat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
          const m = new THREE.Mesh(flashGeo, mat);
          m.position.set(Math.sin(ang) * 12.2, 1.6 + (i % 4) * 0.72, -Math.cos(ang) * 10.5 + 1.5);
          scene.add(m);
          return { mat, phase: Math.random() * 60, rate: 2.5 + Math.random() * 4.5 };
        });

        return {
          tiers, hydraulicBlocks, cup, cupHalo, floodL, floodR, flashes, cupRise: 0,
          revealPlaque: s => { const p = plaques[s]; if (p && p.mat && p.revealedTex) { p.mat.map = p.revealedTex; p.mat.needsUpdate = true; } }
        };
      },

      getHeroPath(slot, t) {
        if (slot === 3) {
          return [
            { from: [-5.6, 0.02, 2.25], to: [t.x, 0.02, 1.78], durMs: 2050, move: 'runRight', loop: true, curveZ: 0.45, jumpH: 0 },
            { from: [t.x, 0.02, 1.78], to: [t.x, t.topY, t.z], durMs: 780, move: 'jump', loop: false, jumpH: 0.58 }
          ];
        }
        if (slot === 2) {
          return [
            { from: [5.6, 0.02, 2.25], to: [t.x, 0.02, 1.78], durMs: 2050, move: 'runLeft', loop: true, curveZ: 0.45, jumpH: 0 },
            { from: [t.x, 0.02, 1.78], to: [t.x, t.topY, t.z], durMs: 780, move: 'jump', loop: false, jumpH: 0.62 }
          ];
        }
        return [
          { from: [-4.5, 0.02, 2.42], to: [0, 0.02, 2.15], durMs: 2250, move: 'runRight', loop: true, curveZ: 0.42, jumpH: 0 },
          { from: [0, 0.02, 2.15], to: [0, 0.02, 2.15], durMs: 900, move: 'wave', loop: true, jumpH: 0 },
          { from: [0, 0.02, 2.15], to: [0, t.topY, t.z], durMs: 880, move: 'jump', loop: false, jumpH: 0.78 }
        ];
      },

      onStep(slot, ctx) {
        const hb = ctx.worldData.hydraulicBlocks[slot];
        if (hb) {
          hb.risen = true;
          ctx.particles.spawnFountain(hb.grp.position.x, 0.1, hb.grp.position.z, 0xe0f2fe, 28);
        }
      },

      onCrown(ctx, withFx) {
        const d = ctx.worldData;
        Object.values(d.hydraulicBlocks).forEach(hb => { hb.risen = true; hb.grp.position.y = 0; });
        d.cup.visible = true;
        d.cupRise = withFx ? 0.01 : 1;
        if (!withFx) { d.cup.position.y = 3.12; d.cup.scale.set(0.95, 0.95, 0.95); }
      },

      onUpdate(dt, elapsed, ctx, crowned) {
        const d = ctx.worldData;
        Object.values(d.hydraulicBlocks).forEach(hb => {
          const targetY = hb.risen ? 0 : -hb.h;
          hb.grp.position.y += (targetY - hb.grp.position.y) * Math.min(1, dt * 5.2);
        });
        d.floodL.mesh.rotation.z = 0.56 + Math.sin(elapsed * 0.85) * 0.24;
        d.floodR.mesh.rotation.z = -0.56 - Math.cos(elapsed * 0.78) * 0.24;
        const floodDim = 1 - (ctx.blackoutLevel || 0) * 0.78;
        d.floodL.material.uniforms.uOpacity.value = 0.19 * floodDim;
        d.floodR.material.uniforms.uOpacity.value = 0.19 * floodDim;
        d.floodL.material.uniforms.uTime.value = elapsed;
        d.floodR.material.uniforms.uTime.value = elapsed;
        d.flashes.forEach(f => {
          const s = Math.pow(Math.max(0, Math.sin(elapsed * f.rate + f.phase)), 18);
          f.mat.opacity = s * (crowned ? 0.95 : 0.45);
        });
        if (d.cup.visible) {
          if (d.cupRise < 1) {
            d.cupRise = Math.min(1, d.cupRise + dt * 1.25);
            const e = 1 - Math.pow(1 - d.cupRise, 3);
            d.cup.position.y = 1.6 + (3.12 - 1.6) * e;
            const sc = 0.1 + 0.85 * e; d.cup.scale.set(sc, sc, sc);
          } else if (!ctx.isReduced) {
            d.cup.position.y = 3.12 + Math.sin(elapsed * 2.1) * 0.07;
          }
          if (!ctx.isReduced) {
            d.cup.rotation.y += dt * 0.9;
            d.cupHalo.rotation.z += dt * 1.3;
          }
        }
      }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  WORLD 2: COSMIC ORBITAL STATION (محطة الفضاء 3D)
   * ═══════════════════════════════════════════════════════════════════════ */
  function createCosmicSpec() {
    return {
      id: 'cosmic', name: 'محطة الفضاء', badge: '🚀', accent: '#22d3ee', bgCss: '#040917',
      crestLabel: 'منصة المدار الكوني ثلاثية الأبعاد',
      openingSub: 'تنشيط حلقات الإرساء الكونية وهبوط الأبطال من المدار...',
      vistaSrc: 'assets/halls/cosmic-hall.jpg', vistaCropY: 0.35, vistaY: 5.5, vistaH: 11.8,
      bgHex: 0x040917, fogHex: 0x061026, fogDensity: 0.022,
      envWarm: 0xbaf3ff, envCool: 0x1e3a8a, keyHex: 0xdcf4ff, keyInt: 1.08, hemiSky: 0x38bdf8, hemiGround: 0x0f172a,
      rim1: 0x22d3ee, rimSide: 0x93c5fd, shockHex: 0x22d3ee, reflectionTint: 0x22d3ee, reflectionAlpha: 0.42,
      particleColors: [0x22d3ee, 0x38bdf8, 0xfef08a, 0xe0f2fe],
      confettiColors: ['#22d3ee', '#38bdf8', '#fde047', '#ffffff'],

      buildWorld(ctx) {
        const { THREE, Engine, scene, top3, track } = ctx;

        // 1. Brushed Dark-Titanium Hexagonal Space Deck + Pulsing Cyan Docking Rings
        const deckTex = track(makeCanvasTex(1024, 1024, (g, w, h) => {
          const bg = g.createRadialGradient(512, 512, 60, 512, 512, 512);
          bg.addColorStop(0, '#0c1d3d'); bg.addColorStop(0.55, '#071229'); bg.addColorStop(1, '#030814');
          g.fillStyle = bg; g.fillRect(0, 0, w, h);
          g.strokeStyle = 'rgba(34,211,238,0.22)'; g.lineWidth = 2;
          for (let r = 90; r <= 480; r += 65) {
            g.beginPath(); g.arc(512, 512, r, 0, Math.PI * 2); g.stroke();
          }
          for (let k = 0; k < 12; k++) {
            const a = (k * Math.PI) / 6;
            g.beginPath(); g.moveTo(512 + Math.cos(a) * 90, 512 + Math.sin(a) * 90);
            g.lineTo(512 + Math.cos(a) * 500, 512 + Math.sin(a) * 500); g.stroke();
          }
        }));
        const floor = new THREE.Mesh(track(new THREE.CircleGeometry(15.5, 64)), track(new THREE.MeshStandardMaterial({ map: deckTex, roughness: 0.14, metalness: 0.65, transparent: true, opacity: 0.9 })));
        floor.rotation.x = -Math.PI / 2; floor.renderOrder = 4; scene.add(floor);

        // Sequential Glowing Cyan Orbital Laser Docking Rings on the Deck
        const dockRings = [2.2, 3.4, 4.6, 5.9].map(r => {
          const mat = track(new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending }));
          const m = new THREE.Mesh(track(new THREE.TorusGeometry(r, 0.032, 12, 72)), mat);
          m.rotation.x = Math.PI / 2; m.position.y = 0.03; scene.add(m);
          return { mesh: m, mat, lit: false };
        });

        // 2. Levitating Hexagonal Titanium Holopads + Floating Translucent Hologram Score Screens!
        const tiMat = track(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.88, roughness: 0.22 }));
        const cyanGlowMat = track(new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
        const tiers = {
          1: { x: 0, z: 0, r: 1.32, topY: 1.06, accent: '#fde047', hex: 0x22d3ee },
          2: { x: 2.45, z: 0.30, r: 1.08, topY: 0.74, accent: '#38bdf8', hex: 0x38bdf8 },
          3: { x: -2.45, z: 0.30, r: 1.02, topY: 0.56, accent: '#67e8f9', hex: 0x67e8f9 }
        };
        const pads = [], plaques = {};
        [1, 2, 3].forEach(slot => {
          const pl = top3[slot - 1];
          if (!pl) return;
          const t = tiers[slot];
          const grp = new THREE.Group();
          grp.position.set(t.x, t.topY, t.z);

          // Levitating beveled hexagonal titanium pad
          const hexPad = new THREE.Mesh(track(new THREE.CylinderGeometry(t.r, t.r * 0.88, 0.22, 6)), tiMat);
          hexPad.position.y = -0.11; grp.add(hexPad);
          const hexRim = new THREE.Mesh(track(new THREE.TorusGeometry(t.r * 0.96, 0.032, 10, 6)), cyanGlowMat);
          hexRim.rotation.x = Math.PI / 2; hexRim.rotation.z = Math.PI / 6; hexRim.position.y = -0.01; grp.add(hexRim);
          // Anti-gravity plasma thruster glow underneath pad
          const thrust = new THREE.Mesh(track(new THREE.ConeGeometry(t.r * 0.58, t.topY * 0.85, 6, 1, true)), track(new THREE.MeshBasicMaterial({ color: t.hex, transparent: true, opacity: 0.35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })));
          thrust.position.y = -t.topY * 0.52; grp.add(thrust);

          // Floating Translucent Cyan Hologram Data Screen (mystery until revealed!)
          const mysteryHoloTex = track(makeCanvasTex(768, 256, (g, w, h) => {
            g.clearRect(0, 0, w, h);
            g.fillStyle = 'rgba(4,24,52,0.72)'; g.fillRect(10, 10, w - 20, h - 20);
            g.strokeStyle = '#22d3ee'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
            g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = t.accent; g.font = '900 42px Cairo, sans-serif';
            g.fillText(slot === 1 ? '❓ بطل المدار #1' : (slot === 2 ? '❓ المدار #2' : '❓ المدار #3'), w / 2, 96);
            g.fillStyle = '#bae6fd'; g.font = '800 32px Cairo, sans-serif';
            g.fillText('في انتظار الإرساء...', w / 2, 182);
          }));
          const holoTex = track(makeCanvasTex(768, 256, (g, w, h) => {
            g.clearRect(0, 0, w, h);
            g.fillStyle = 'rgba(4,24,52,0.72)'; g.fillRect(10, 10, w - 20, h - 20);
            // Hologram scanlines
            g.fillStyle = 'rgba(34,211,238,0.12)';
            for (let y = 16; y < h - 16; y += 12) g.fillRect(12, y, w - 24, 3);
            g.strokeStyle = '#22d3ee'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
            // Corner tech brackets
            g.fillStyle = t.accent;
            [[10, 10], [w - 42, 10], [10, h - 18], [w - 42, h - 18]].forEach(([x, y]) => g.fillRect(x, y, 32, 8));
            g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = t.accent; g.font = '900 34px Cairo, sans-serif';
            g.fillText(slot === 1 ? '🥇 بطل المدار #1' : (slot === 2 ? '🥈 المدار #2' : `🥉 المدار #${pl._rank}`), w / 2, 56);
            g.fillStyle = '#ffffff'; g.font = '900 52px Cairo, sans-serif';
            g.fillText(String(pl.name || 'بطل').slice(0, 18), w / 2, 134);
            g.fillStyle = '#67e8f9'; g.font = '900 38px Montserrat, Cairo, sans-serif';
            g.fillText(`${pl.score || 0} نقطة`, w / 2, 206);
          }));
          const holoMat = track(new THREE.MeshBasicMaterial({ map: mysteryHoloTex, transparent: true, side: THREE.DoubleSide }));
          const holo = new THREE.Mesh(track(new THREE.PlaneGeometry(t.r * 1.62, 0.56)), holoMat);
          holo.position.set(0, -0.34, t.r * 0.92); grp.add(holo);
          plaques[slot] = { mat: holoMat, revealedTex: holoTex };

          scene.add(grp);
          pads.push({ grp, baseY: t.topY, phase: slot * 1.7 });
        });

        // 3. Sculpted 3D Spinning Orbital Planet & Dual Gyroscope Rings + Vertical Warp Beam
        const orb = new THREE.Group();
        const planetTex = track(makeCanvasTex(512, 256, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, w, h);
          gr.addColorStop(0, '#0284c7'); gr.addColorStop(0.5, '#1d4ed8'); gr.addColorStop(1, '#312e81');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          g.fillStyle = 'rgba(186,230,253,0.42)';
          for (let i = 0; i < 16; i++) {
            g.beginPath(); g.ellipse((i * 77) % w, (i * 43) % h, 65, 16, 0.2, 0, Math.PI * 2); g.fill();
          }
        }));
        const planet = new THREE.Mesh(track(new THREE.SphereGeometry(0.46, 36, 36)), track(new THREE.MeshStandardMaterial({ map: planetTex, metalness: 0.35, roughness: 0.25, emissive: 0x075985, emissiveIntensity: 0.5 })));
        orb.add(planet);
        const ringA = new THREE.Mesh(track(new THREE.TorusGeometry(0.84, 0.026, 14, 64)), track(new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.1 })));
        ringA.rotation.x = 1.12; ringA.rotation.y = 0.25; orb.add(ringA);
        const ringB = new THREE.Mesh(track(new THREE.TorusGeometry(1.04, 0.02, 12, 64)), track(new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.9 })));
        ringB.rotation.x = 1.25; ringB.rotation.y = -0.55; orb.add(ringB);
        const moonPivot = new THREE.Group();
        const moon = new THREE.Mesh(track(new THREE.SphereGeometry(0.085, 16, 16)), track(new THREE.MeshBasicMaterial({ color: 0xfef08a })));
        moon.position.set(0.95, 0.15, 0); moonPivot.add(moon); orb.add(moonPivot);
        const orbLight = new THREE.PointLight(0x22d3ee, 2.4, 9); orb.add(orbLight);
        orb.position.set(0, 3.68, 0); orb.visible = false; scene.add(orb);

        const warpBeam = Engine.createVolumetricCone(0x22d3ee, 7.6, 0.35, 1.85, 0);
        warpBeam.mesh.position.set(0, 7.4, 0); scene.add(warpBeam.mesh);

        return {
          tiers, dockRings, pads, orb, planet, ringA, ringB, moonPivot, warpBeam, orbScale: 0,
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

      onStep(slot, ctx) {
        const idx = slot === 3 ? 0 : (slot === 2 ? 1 : 2);
        if (ctx.worldData.dockRings[idx]) ctx.worldData.dockRings[idx].lit = true;
      },

      onCrown(ctx, withFx) {
        const d = ctx.worldData;
        d.dockRings.forEach(r => { r.lit = true; });
        d.orb.visible = true;
        d.orbScale = withFx ? 0.05 : 1;
        d.warpBeam.material.uniforms.uOpacity.value = 0.25;
        if (!withFx) d.orb.scale.set(1, 1, 1);
      },

      onUpdate(dt, elapsed, ctx) {
        const d = ctx.worldData;
        d.dockRings.forEach((r, idx) => {
          const tgt = r.lit ? (0.65 + Math.sin(elapsed * 3.5 - idx) * 0.22) : 0.14;
          r.mat.opacity += (tgt - r.mat.opacity) * Math.min(1, dt * 5);
        });
        if (!ctx.isReduced) {
          d.pads.forEach(p => { p.grp.position.y = p.baseY + Math.sin(elapsed * 1.9 + p.phase) * 0.035; });
        }
        d.warpBeam.material.uniforms.uTime.value = elapsed;
        if (d.orb.visible) {
          if (d.orbScale < 1) {
            d.orbScale = Math.min(1, d.orbScale + dt * 1.6);
            const e = 1 - Math.pow(1 - d.orbScale, 3);
            d.orb.scale.set(e, e, e);
          }
          if (!ctx.isReduced) {
            d.planet.rotation.y += dt * 0.7;
            d.ringA.rotation.z += dt * 1.1;
            d.ringB.rotation.z -= dt * 0.85;
            d.moonPivot.rotation.y += dt * 1.6;
            d.orb.position.y = 3.68 + Math.sin(elapsed * 1.8) * 0.08;
          }
        }
      }
    };
  }

  global.ScoreARHall3DWorldsA = { stadium: createStadiumSpec, cosmic: createCosmicSpec };
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHall3DWorldsA = global.ScoreARHall3DWorldsA; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ScoreARHall3DWorldsA;
})(typeof window !== 'undefined' ? window : globalThis);
