/**
 * ScoreAR — Shared Live 6-World 3D WebGL Arena Hall Engine (Phase 1)
 * Powers `DUEL_TEAMS` (2 opposing camps) and future `SURVIVAL` (`ring` layout)
 * inside all 6 celebration halls using `ScoreARHall3DEngine`.
 */
(function (global) {
  'use strict';

  const MAX_ACTORS = 20;

  const ARENA_WORLDS = {
    royal: {
      id: 'royal',
      name: 'القصر الملكي',
      bg: 'assets/halls/royal-hall.jpg',
      fallbackBg: 'assets/worlds/royal/lobby.jpg',
      warm: 0xffd166,
      cool: 0x3b82f6,
      floor: 0x16122c,
      fog: 0x0b0a1c,
      ring: 0xfbbf24,
      particles: [0xfde047, 0xf59e0b, 0x38bdf8]
    },
    stadium: {
      id: 'stadium',
      name: 'ملعب الأبطال',
      bg: 'assets/halls/stadium-hall.jpg',
      fallbackBg: 'assets/worlds/stadium/lobby.jpg',
      warm: 0x38bdf8,
      cool: 0x10b981,
      floor: 0x0b1a2a,
      fog: 0x071220,
      ring: 0x38bdf8,
      particles: [0x38bdf8, 0x34d399, 0xfacc15]
    },
    cosmic: {
      id: 'cosmic',
      name: 'المحطة الكونية',
      bg: 'assets/halls/cosmic-hall.jpg',
      fallbackBg: 'assets/worlds/cosmic/lobby.jpg',
      warm: 0xa855f7,
      cool: 0x06b6d4,
      floor: 0x0a0922,
      fog: 0x050416,
      ring: 0xa855f7,
      particles: [0xc084fc, 0x22d3ee, 0xf472b6]
    },
    treasure: {
      id: 'treasure',
      name: 'جزيرة الكنز',
      bg: 'assets/halls/treasure-hall.jpg',
      fallbackBg: 'assets/worlds/treasure/lobby.jpg',
      warm: 0xf59e0b,
      cool: 0x14b8a6,
      floor: 0x18130a,
      fog: 0x100b06,
      ring: 0xf59e0b,
      particles: [0xfbbf24, 0x2dd4bf, 0xfb923c]
    },
    oasis: {
      id: 'oasis',
      name: 'واحة العرب',
      bg: 'assets/halls/oasis-hall.jpg',
      fallbackBg: 'assets/worlds/oasis/lobby.jpg',
      warm: 0xfbbf24,
      cool: 0x0ea5e9,
      floor: 0x17140d,
      fog: 0x100c07,
      ring: 0xf59e0b,
      particles: [0xfde68a, 0x38bdf8, 0xf97316]
    },
    magic: {
      id: 'magic',
      name: 'مملكة السحر',
      bg: 'assets/halls/magic-hall.jpg',
      fallbackBg: 'assets/worlds/magic/lobby.jpg',
      warm: 0xc084fc,
      cool: 0xf472b6,
      floor: 0x130b26,
      fog: 0x0b0518,
      ring: 0xe879f9,
      particles: [0xe879f9, 0x818cf8, 0xfde047]
    }
  };

  let state = null;

  function resolveWorld(worldId) {
    const k = String(worldId || 'royal').trim();
    return ARENA_WORLDS[k] || ARENA_WORLDS.royal;
  }

  function normalizeTeam(player, idx) {
    if (global.ScoreARArenaModes?.normalizeTeamId) {
      return global.ScoreARArenaModes.normalizeTeamId(player?.teamId || player?.team) || (idx % 2 === 0 ? 'team_a' : 'team_b');
    }
    return player?.teamId === 'team_b' ? 'team_b' : (player?.teamId === 'team_a' ? 'team_a' : (idx % 2 === 0 ? 'team_a' : 'team_b'));
  }

  function capPlayers(players, layout) {
    const list = Array.isArray(players) ? players.filter(Boolean) : [];
    if (list.length <= MAX_ACTORS) return list.slice();
    if (layout === 'duel') {
      const a = [];
      const b = [];
      list.forEach((p, i) => {
        if (normalizeTeam(p, i) === 'team_b') b.push(p);
        else a.push(p);
      });
      a.sort((x, y) => (y.score || 0) - (x.score || 0));
      b.sort((x, y) => (y.score || 0) - (x.score || 0));
      const takeA = Math.min(a.length, 10);
      const takeB = Math.min(b.length, 10);
      const remA = MAX_ACTORS - takeA - takeB;
      return a.slice(0, takeA + Math.max(0, Math.min(remA, a.length - takeA)))
        .concat(b.slice(0, takeB));
    }
    return list.slice(0, MAX_ACTORS);
  }

  function computeDuelSlotPositions(list) {
    const teamA = [];
    const teamB = [];
    list.forEach((p, idx) => {
      if (normalizeTeam(p, idx) === 'team_b') teamB.push(p);
      else teamA.push(p);
    });

    const positions = new Map();
    const layoutCamp = (camp, sideSign) => {
      // +X is visual RIGHT (matches RTL Eagle header on right), -X is visual LEFT (Lion on left)
      const frontCount = Math.min(5, Math.ceil(camp.length / 2));
      const backCount = camp.length - frontCount;
      camp.forEach((p, i) => {
        const isBack = i >= frontCount;
        const rowCount = isBack ? Math.max(1, backCount) : Math.max(1, frontCount);
        const rowIdx = isBack ? (i - frontCount) : i;
        const t = rowCount === 1 ? 0.5 : rowIdx / (rowCount - 1);
        const baseX = sideSign * (isBack ? 5.85 : 3.55);
        const depthZ = isBack ? (-2.4 + (t - 0.5) * 4.4) : (2.1 - t * 4.2);
        const staggerX = baseX + sideSign * (Math.abs(t - 0.5) * 1.15);
        positions.set(p.id, {
          x: staggerX,
          y: 0,
          z: depthZ,
          teamId: sideSign > 0 ? 'team_a' : 'team_b',
          rotY: sideSign > 0 ? -0.35 : 0.35
        });
      });
    };

    layoutCamp(teamA, 1);
    layoutCamp(teamB, -1);
    return positions;
  }

  function computeRingSlotPositions(list) {
    const positions = new Map();
    const total = Math.max(1, list.length);
    list.forEach((p, idx) => {
      const innerCap = Math.min(10, total);
      const isOuter = idx >= innerCap;
      const ringCount = isOuter ? Math.max(1, total - innerCap) : innerCap;
      const ringIdx = isOuter ? (idx - innerCap) : idx;
      const u = ringCount === 1 ? 0.5 : ringIdx / (ringCount - 1);
      const angle = (-Math.PI * 0.88) + u * (Math.PI * 0.76);
      const radius = isOuter ? 7.3 : 5.2;
      positions.set(p.id, {
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius + 1.1,
        teamId: normalizeTeam(p, idx),
        rotY: -angle - Math.PI * 0.5
      });
    });
    return positions;
  }

  function makeNameplateTexture(THREE, name, teamId, statusText, borderHex, mode) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 88;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isSurv = mode === 'SURVIVAL';
    ctx.fillStyle = 'rgba(9, 13, 30, 0.86)';
    roundRectPath(ctx, 8, 8, 304, 72, 22);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = borderHex || (isSurv ? '#c084fc' : (teamId === 'team_b' ? '#fb923c' : '#38bdf8'));
    roundRectPath(ctx, 8, 8, 304, 72, 22);
    ctx.stroke();

    const emoji = isSurv ? '🛡️' : (teamId === 'team_b' ? '🦁' : '🦅');
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cleanName = String(name || 'بطل').slice(0, 14);
    const topLine = `${emoji} ${cleanName}`;
    ctx.fillText(topLine, 160, statusText ? 31 : 44);

    if (statusText) {
      ctx.font = 'bold 20px Cairo, sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(statusText, 160, 61);
    }

    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
    else if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function hexToCss(hexNum) {
    return '#' + Number(hexNum || 0).toString(16).padStart(6, '0');
  }

  function buildPodMesh(THREE, baseColorHex) {
    const podGroup = new THREE.Group();

    const baseGeo = new THREE.CylinderGeometry(0.68, 0.82, 0.12, 28);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x11172d,
      metalness: 0.55,
      roughness: 0.35
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.06;
    podGroup.add(baseMesh);

    const discGeo = new THREE.CircleGeometry(0.62, 28);
    discGeo.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      color: baseColorHex,
      transparent: true,
      opacity: 0.36,
      depthWrite: false
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.y = 0.125;
    podGroup.add(discMesh);

    const ringGeo = new THREE.RingGeometry(0.67, 0.80, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: baseColorHex,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.13;
    podGroup.add(ringMesh);

    const pulseGeo = new THREE.RingGeometry(0.84, 0.96, 32);
    pulseGeo.rotateX(-Math.PI / 2);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.position.y = 0.135;
    podGroup.add(pulseMesh);

    return { podGroup, baseGeo, baseMat, discGeo, discMat, ringGeo, ringMat, pulseGeo, pulseMat, pulseMesh };
  }

  function applyPodColor(entry, hexColor, emissiveBoost) {
    if (!entry) return;
    entry.podColor = hexColor;
    if (entry.pod) {
      entry.pod.discMat.color.setHex(hexColor);
      entry.pod.ringMat.color.setHex(hexColor);
      entry.pod.discMat.opacity = emissiveBoost ? 0.65 : 0.36;
      entry.pod.ringMat.opacity = emissiveBoost ? 0.98 : 0.78;
    }
    if (entry.el) {
      entry.el.style.borderColor = hexToCss(hexColor);
      entry.el.style.boxShadow = emissiveBoost ? `0 0 22px ${hexToCss(hexColor)}` : 'none';
    }
  }

  function updateEntryNameplate(entry, statusText, borderCss) {
    if (state?.webgl && entry?.plateSprite && global.THREE) {
      const THREE = global.THREE;
      const oldTex = entry.plateSprite.material.map;
      entry.plateSprite.material.map = makeNameplateTexture(
        THREE,
        entry.player.name,
        entry.teamId,
        statusText,
        borderCss,
        state.mode
      );
      entry.plateSprite.material.needsUpdate = true;
      if (oldTex && typeof oldTex.dispose === 'function') oldTex.dispose();
    }
    if (entry?.statusBadgeEl) {
      entry.statusBadgeEl.textContent = statusText || '';
    }
  }

  function mountDomFallback(containerEl, world, displayedPlayers, posMap, opts) {
    const teamCardsA = [];
    const teamCardsB = [];
    const actorMap = new Map();
    const isSurv = opts?.mode === 'SURVIVAL';

    displayedPlayers.forEach((p, idx) => {
      const info = posMap.get(p.id) || { teamId: normalizeTeam(p, idx) };
      const teamId = info.teamId;
      const podColor = isSurv ? 0xa855f7 : (teamId === 'team_b' ? 0xf97316 : 0x38bdf8);
      const card = document.createElement('div');
      card.dataset.actorId = p.id;
      card.style.cssText = `padding:8px 12px;border-radius:14px;background:rgba(10,14,32,0.84);border:2px solid ${hexToCss(podColor)};color:#fff;display:flex;align-items:center;gap:8px;min-width:128px;transition:transform 0.3s, box-shadow 0.3s, opacity 0.4s;`;
      const icon = document.createElement('span');
      icon.textContent = isSurv ? '🛡️' : (teamId === 'team_b' ? '🦁' : '🦅');
      const meta = document.createElement('div');
      const nameEl = document.createElement('div');
      nameEl.textContent = p.name || 'بطل';
      nameEl.style.cssText = 'font-size:12px;font-weight:900;';
      const badgeEl = document.createElement('div');
      badgeEl.style.cssText = 'font-size:11px;font-weight:800;color:#fde68a;min-height:14px;';
      meta.appendChild(nameEl);
      meta.appendChild(badgeEl);
      card.appendChild(icon);
      card.appendChild(meta);

      const entry = {
        id: p.id,
        player: p,
        teamId,
        status: 'idle',
        motion: 'idle',
        podColor,
        pos: { x: info.x || 0, y: 0, z: info.z || 0 },
        el: card,
        statusBadgeEl: badgeEl,
        setMotion(m) {
          this.motion = m;
          card.dataset.motion = m;
          if (m === 'jump' || m === 'win') card.style.transform = 'translateY(-10px) scale(1.06)';
          else if (m === 'sad') card.style.opacity = '0.72';
          else card.style.transform = 'none';
        }
      };
      actorMap.set(p.id, entry);
      if (teamId === 'team_b') teamCardsB.push(card);
      else teamCardsA.push(card);
    });

    const grid = document.createElement('div');
    grid.id = 'hostArenaFallback';
    grid.style.cssText = 'position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:space-between;padding:24px 36px 96px;pointer-events:none;z-index:2;';
    const rightCamp = document.createElement('div');
    rightCamp.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;max-width:34%;justify-content:flex-start;';
    teamCardsA.forEach(c => rightCamp.appendChild(c));
    const leftCamp = document.createElement('div');
    leftCamp.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;max-width:34%;justify-content:flex-end;';
    teamCardsB.forEach(c => leftCamp.appendChild(c));

    grid.appendChild(rightCamp);
    grid.appendChild(leftCamp);
    containerEl.appendChild(grid);

    return actorMap;
  }

  function mount(containerEl, opts) {
    dispose();
    if (!containerEl) return null;

    const options = opts || {};
    const world = resolveWorld(options.worldId);
    const mode = options.mode || 'DUEL_TEAMS';
    const layout = options.layout || (mode === 'SURVIVAL' ? 'ring' : 'duel');
    const rawPlayers = Array.isArray(options.players) ? options.players : [];
    const displayedPlayers = capPlayers(rawPlayers, layout);
    const posMap = layout === 'ring' ? computeRingSlotPositions(displayedPlayers) : computeDuelSlotPositions(displayedPlayers);

    containerEl.innerHTML = '';
    containerEl.style.overflow = 'hidden';

    const bgWrap = document.createElement('div');
    bgWrap.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;';
    const bgImg = document.createElement('img');
    bgImg.src = world.bg;
    bgImg.alt = world.name;
    bgImg.onerror = function () {
      if (!this.dataset.fb) {
        this.dataset.fb = '1';
        this.src = world.fallbackBg;
      } else {
        this.style.display = 'none';
      }
    };
    bgImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.76) saturate(1.12);';
    const bgShade = document.createElement('div');
    bgShade.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,rgba(12,14,34,0.18) 0%,rgba(6,8,20,0.78) 100%);';
    bgWrap.appendChild(bgImg);
    bgWrap.appendChild(bgShade);
    containerEl.appendChild(bgWrap);

    const Engine = global.ScoreARHall3DEngine;
    const canWebGL = Boolean(Engine && Engine.isWebGLReady && Engine.isWebGLReady() && global.THREE);

    const instance = {
      active: true,
      containerEl,
      worldId: world.id,
      world,
      mode,
      layout,
      phase: options.phase || 'reading',
      qIndex: Number.isFinite(options.qIndex) ? options.qIndex : 0,
      room: options.room || null,
      webgl: false,
      actors: new Map(),
      answeredIds: new Set(),
      fastestId: null,
      resultApplied: false,
      survivalFinishTriggered: false,
      timers: [],
      disposables: [],
      rafId: 0,
      answerPollId: 0,
      patrolTimer: 0,
      patrolSide: 1,
      spotlight: null,
      dimOverlayMesh: null,
      cameraDirector: null,
      particles: null,
      audio: null,
      renderer: null,
      scene: null,
      camera: null,
      envMap: null
    };

    state = instance;

    if (!canWebGL) {
      instance.actors = mountDomFallback(containerEl, world, displayedPlayers, posMap, options);
      startAnswerWatcher(instance);
      return instance;
    }

    try {
      const THREE = global.THREE;
      const w = Math.max(320, containerEl.clientWidth || window.innerWidth || 1280);
      const h = Math.max(240, containerEl.clientHeight || window.innerHeight || 720);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
      else if (THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1;pointer-events:none;';
      containerEl.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(world.fog, 0.019);

      const envMap = Engine.createStudioEnvMap ? Engine.createStudioEnvMap(renderer, world.warm, world.cool) : null;
      if (envMap && envMap.texture) scene.environment = envMap.texture;

      const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 140);
      const camDirector = Engine.createCameraDirector
        ? Engine.createCameraDirector(camera, containerEl)
        : null;
      if (camDirector) {
        camDirector.snapShot([0, 3.85, 12.6], [0, 1.35, -0.8]);
      } else {
        camera.position.set(0, 3.85, 12.6);
        camera.lookAt(0, 1.35, -0.8);
      }

      const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.92);
      const keyLight = new THREE.DirectionalLight(world.warm, 1.45);
      keyLight.position.set(4, 11, 8);
      const rimLight = new THREE.DirectionalLight(world.cool, 0.95);
      rimLight.position.set(-6, 7, -5);
      scene.add(ambientLight, keyLight, rimLight);

      // Arena Stage Floor + Center Divide Glow
      const floorGeo = new THREE.CircleGeometry(14.5, 64);
      floorGeo.rotateX(-Math.PI / 2);
      const floorMat = new THREE.MeshStandardMaterial({
        color: world.floor,
        metalness: 0.45,
        roughness: 0.5,
        transparent: true,
        opacity: 0.62
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      scene.add(floorMesh);

      const outerRingGeo = new THREE.RingGeometry(8.6, 8.92, 72);
      outerRingGeo.rotateX(-Math.PI / 2);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: world.ring,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      });
      const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRingMesh.position.y = 0.02;
      scene.add(outerRingMesh);

      instance.disposables.push(floorGeo, floorMat, outerRingGeo, outerRingMat);

      if (layout === 'duel') {
        const divGeo = new THREE.PlaneGeometry(0.14, 10.5);
        divGeo.rotateX(-Math.PI / 2);
        const divMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide
        });
        const divMesh = new THREE.Mesh(divGeo, divMat);
        divMesh.position.y = 0.03;
        scene.add(divMesh);
        instance.disposables.push(divGeo, divMat);
      }

      // Hero Actors + Pods + Floating Pod Nameplates
      const isSurvMode = mode === 'SURVIVAL';
      displayedPlayers.forEach((p, idx) => {
        const slot = posMap.get(p.id) || { x: (idx - 1) * 2, y: 0, z: 0, teamId: normalizeTeam(p, idx), rotY: 0 };
        const teamId = slot.teamId;
        const baseColor = isSurvMode ? 0xa855f7 : (teamId === 'team_b' ? 0xf97316 : 0x38bdf8);
        const pod = buildPodMesh(THREE, baseColor);
        pod.podGroup.position.set(slot.x, 0, slot.z);
        scene.add(pod.podGroup);

        const hero = Engine.createHero3DActor(p, {
          height: 2.35,
          rimColor: baseColor,
          rimStrength: 0.34,
          reflection: true,
          reflectionAlpha: 0.25,
          initialMotion: 'idle',
          initialLoop: true,
          initialOpacity: 1
        });
        if (hero && hero.group) {
          hero.group.position.set(slot.x, 0.12, slot.z);
          if (hero.preloadMoves) hero.preloadMoves(['idle', 'clap', 'jump', 'win', 'sad', 'wave']);
          scene.add(hero.group);
        }

        const tex = makeNameplateTexture(
          THREE,
          p.name,
          teamId,
          '',
          isSurvMode ? '#c084fc' : (teamId === 'team_b' ? '#fb923c' : '#38bdf8'),
          mode
        );
        const plateMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const plateSprite = new THREE.Sprite(plateMat);
        plateSprite.scale.set(1.75, 0.48, 1);
        plateSprite.position.set(slot.x, 0.28, slot.z + 0.85);
        scene.add(plateSprite);

        instance.disposables.push(
          pod.baseGeo, pod.baseMat, pod.discGeo, pod.discMat,
          pod.ringGeo, pod.ringMat, pod.pulseGeo, pod.pulseMat,
          tex, plateMat
        );

        instance.actors.set(p.id, {
          id: p.id,
          player: p,
          teamId,
          status: 'idle',
          motion: 'idle',
          podColor: baseColor,
          pos: { x: slot.x, y: 0.12, z: slot.z },
          pod,
          hero,
          plateSprite,
          pulseWave: 0,
          setMotion(move, loop) {
            this.motion = move;
            if (this.hero && typeof this.hero.setAction === 'function') {
              this.hero.setAction(move, loop !== false);
            }
          }
        });
      });

      // Dramatic Spotlight Cone for Fastest Winner Result
      if (Engine.createVolumetricCone) {
        const cone = Engine.createVolumetricCone(0xfde047, 11.5, 0.35, 2.35, 0.0);
        if (cone && cone.mesh) {
          cone.mesh.position.set(0, 11.5, 0);
          cone.mesh.visible = false;
          scene.add(cone.mesh);
          instance.spotlight = cone;
        }
      }

      const particles = Engine.createParticlesSystem
        ? Engine.createParticlesSystem(scene, world.particles, 55)
        : null;

      let audio = null;
      try {
        if (Engine.createCinematicAudio) audio = Engine.createCinematicAudio();
      } catch (_) {}

      const resizeHandler = () => {
        if (!instance.active || !instance.renderer || !instance.camera) return;
        const cw = Math.max(320, containerEl.clientWidth || window.innerWidth || 1280);
        const ch = Math.max(240, containerEl.clientHeight || window.innerHeight || 720);
        instance.camera.aspect = cw / ch;
        instance.camera.updateProjectionMatrix();
        instance.renderer.setSize(cw, ch);
      };
      window.addEventListener('resize', resizeHandler);
      instance.resizeHandler = resizeHandler;

      instance.webgl = true;
      instance.renderer = renderer;
      instance.scene = scene;
      instance.camera = camera;
      instance.envMap = envMap;
      instance.cameraDirector = camDirector;
      instance.particles = particles;
      instance.audio = audio;
      instance.ambientLight = ambientLight;
      instance.keyLight = keyLight;

      // Render Loop (bounded delta for consistent motion across GPUs & software WebGL)
      let prevTime = performance.now();
      let elapsed = 0;

      const tick = (now) => {
        if (!instance.active) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - prevTime) / 1000));
        prevTime = now;
        elapsed += dt;

        if (instance.phase === 'answering' && !instance.resultApplied) {
          instance.patrolTimer += dt;
          if (instance.patrolTimer >= 2.6 && instance.cameraDirector) {
            instance.patrolTimer = 0;
            instance.patrolSide *= -1;
            const px = instance.patrolSide * 2.15;
            instance.cameraDirector.setShot([px, 3.65, 11.8], [px * 0.45, 1.35, -0.8], 1.15);
          }
        }

        instance.actors.forEach((entry, idxKey) => {
          if (entry.hero && typeof entry.hero.updateTexture === 'function') {
            entry.hero.updateTexture(instance.camera);
          }
          if (entry.pod) {
            if (entry.status === 'idle') {
              const breathe = 0.30 + 0.12 * Math.sin(elapsed * 2.3 + entry.pos.x);
              entry.pod.discMat.opacity = breathe;
            }
            if (entry.pulseWave > 0) {
              entry.pulseWave = Math.max(0, entry.pulseWave - dt * 1.6);
              const s = 1 + (1 - entry.pulseWave) * 0.95;
              entry.pod.pulseMesh.scale.set(s, s, 1);
              entry.pod.pulseMat.opacity = entry.pulseWave * 0.85;
            } else {
              entry.pod.pulseMat.opacity = 0;
            }
          }
        });

        if (instance.spotlight && instance.spotlight.mesh && instance.spotlight.mesh.visible) {
          instance.spotlight.mesh.rotation.y += dt * 0.6;
          if (instance.spotlight.material?.uniforms?.uTime) {
            instance.spotlight.material.uniforms.uTime.value = elapsed;
          }
        }

        if (instance.cameraDirector) {
          instance.cameraDirector.update(dt, elapsed, instance.phase === 'reading');
        }
        if (instance.particles) {
          instance.particles.update(dt, elapsed);
        }

        instance.renderer.render(instance.scene, instance.camera);
        instance.rafId = requestAnimationFrame(tick);
      };

      instance.rafId = requestAnimationFrame(tick);
      startAnswerWatcher(instance);
      return instance;
    } catch (err) {
      if (global.console && console.warn) console.warn('[ScoreARArena3D] WebGL fallback triggered:', err);
      instance.actors = mountDomFallback(containerEl, world, displayedPlayers, posMap, options);
      startAnswerWatcher(instance);
      return instance;
    }
  }

  function startAnswerWatcher(instance) {
    if (!instance || !instance.active) return;
    if (instance.answerPollId) clearInterval(instance.answerPollId);
    instance.answerPollId = setInterval(() => {
      if (!instance.active || instance.resultApplied) return;
      const room = instance.room || global.ScoreARQuizHost?.getCurrentRoom?.() || null;
      const qAnswers = room?.answers?.[instance.qIndex];
      if (!qAnswers || typeof qAnswers !== 'object') return;
      Object.keys(qAnswers).forEach(pid => {
        if (!instance.answeredIds.has(pid)) {
          onPlayerAnswered(pid);
        }
      });

      if (instance.mode === 'SURVIVAL' && instance.phase === 'answering' && !instance.survivalFinishTriggered && room && Array.isArray(room.players)) {
        const hasEliminated = room.players.some(p => p && p.eliminated);
        if (hasEliminated) {
          const alive = room.players.filter(p => p && !p.eliminated);
          if (alive.length > 0 && alive.every(p => Boolean(qAnswers[p.id]))) {
            instance.survivalFinishTriggered = true;
            const t = setTimeout(() => {
              if (!instance.active || instance.resultApplied) return;
              if (global.ScoreARQuizHost?.finishCurrentQuestion) {
                global.ScoreARQuizHost.finishCurrentQuestion();
              }
            }, 650);
            instance.timers.push(t);
          }
        }
      }
    }, 180);
  }

  function defaultIdlePodColor(entry) {
    if (state?.mode === 'SURVIVAL') return 0xa855f7;
    return entry?.teamId === 'team_b' ? 0xf97316 : 0x38bdf8;
  }

  function defaultIdlePlateColor(entry) {
    if (state?.mode === 'SURVIVAL') return '#c084fc';
    return entry?.teamId === 'team_b' ? '#fb923c' : '#38bdf8';
  }

  function setPhase(phase, extra) {
    if (!state || !state.active) return;
    const prev = state.phase;
    state.phase = String(phase || 'reading');
    if (extra && Number.isFinite(extra.qIndex)) {
      state.qIndex = extra.qIndex;
    }

    if (state.phase === 'reading') {
      state.resultApplied = false;
      state.survivalFinishTriggered = false;
      state.fastestId = null;
      state.answeredIds.clear();
      if (state.spotlight?.mesh) state.spotlight.mesh.visible = false;
      if (state.spotlight?.material?.uniforms?.uOpacity) state.spotlight.material.uniforms.uOpacity.value = 0;
      if (state.spotlight?.material?.uniforms?.uColor?.value?.setHex) state.spotlight.material.uniforms.uColor.value.setHex(0xfde047);
      if (state.ambientLight) state.ambientLight.intensity = 0.92;
      state.actors.forEach(entry => {
        entry.status = 'idle';
        entry.setMotion('idle', true);
        if (entry.hero?.setOpacity) entry.hero.setOpacity(1);
        if (entry.el) entry.el.style.opacity = '1';
        applyPodColor(entry, defaultIdlePodColor(entry), false);
        updateEntryNameplate(entry, '', defaultIdlePlateColor(entry));
      });
      if (state.cameraDirector) {
        state.cameraDirector.setShot([0, 3.85, 12.6], [0, 1.35, -0.8], 2.0);
      }
    } else if (state.phase === 'answering' && prev !== 'answering') {
      state.patrolTimer = 1.9;
      if (state.cameraDirector) {
        state.cameraDirector.setShot([1.6, 3.6, 11.6], [0.6, 1.35, -0.8], 2.4);
      }
    }
  }

  function onPlayerAnswered(playerId) {
    if (!state || !state.active || !playerId || state.resultApplied) return;
    if (state.answeredIds.has(playerId)) return;
    state.answeredIds.add(playerId);

    const entry = state.actors.get(playerId);
    if (!entry) return;

    entry.status = 'answered';
    entry.pulseWave = 1.0;
    applyPodColor(entry, 0x34d399, true);
    entry.setMotion('clap', true);
    updateEntryNameplate(entry, '⚡ أجاب الآن', '#34d399');

    if (state.cameraDirector && state.phase === 'answering') {
      const tx = Math.max(-4.8, Math.min(4.8, entry.pos.x * 0.72));
      const tz = Math.max(4.5, Math.min(11.6, entry.pos.z + 7.2));
      state.cameraDirector.setShot([tx, 3.1, tz], [entry.pos.x, 1.25, entry.pos.z], 2.3);
      state.patrolTimer = 0;
    }

    try {
      if (state.audio?.playChime) state.audio.playChime(660, 0.14, 0.08);
    } catch (_) {}
  }

  function onQuestionResult(evalResult, players) {
    if (!state || !state.active) return;
    state.phase = 'result';
    state.resultApplied = true;

    const list = Array.isArray(players) ? players : [];
    const playerById = new Map();
    list.forEach(p => { if (p && p.id) playerById.set(p.id, p); });

    const resultsMap = evalResult?.playerResults || {};
    let fastestId = evalResult?.fastest?.id || evalResult?.fastestTop2?.[0]?.id || null;

    if (!fastestId) {
      let bestPts = 0;
      state.actors.forEach(entry => {
        const res = resultsMap[entry.id];
        const liveP = playerById.get(entry.id) || entry.player;
        const pts = Number(res?.pointsEarned ?? res?.points ?? liveP?.lastPointsGained ?? 0);
        if ((res?.isCorrect || pts > 0) && pts > bestPts) {
          bestPts = pts;
          fastestId = entry.id;
        }
      });
    }

    state.fastestId = fastestId;

    state.actors.forEach(entry => {
      const res = resultsMap[entry.id];
      const liveP = playerById.get(entry.id) || entry.player;
      if (liveP) entry.player = liveP;

      const pts = Number(res?.pointsEarned ?? res?.points ?? liveP?.lastPointsGained ?? 0);
      const isCorrect = Boolean(res ? res.isCorrect : pts > 0);
      const isFastest = Boolean(fastestId && entry.id === fastestId && isCorrect);

      if (isFastest) {
        entry.status = 'fastest';
        entry.pulseWave = 1.0;
        applyPodColor(entry, 0xfacc15, true);
        entry.setMotion('jump', true);
        updateEntryNameplate(entry, `👑 الأسرع +${pts}`, '#facc15');
        const t = setTimeout(() => {
          if (!state || !state.active || state.fastestId !== entry.id || entry.status === 'eliminated') return;
          entry.setMotion('win', true);
        }, 900);
        state.timers.push(t);
      } else if (isCorrect) {
        entry.status = 'correct';
        entry.pulseWave = 0.7;
        applyPodColor(entry, 0x10b981, true);
        entry.setMotion('clap', true);
        updateEntryNameplate(entry, `✓ +${pts}`, '#10b981');
      } else {
        entry.status = 'wrong';
        applyPodColor(entry, 0xef4444, false);
        entry.setMotion('sad', true);
        updateEntryNameplate(entry, '✗ 0', '#ef4444');
      }
    });

    const winnerEntry = fastestId ? state.actors.get(fastestId) : null;
    if (winnerEntry) {
      if (state.ambientLight) state.ambientLight.intensity = 0.56;
      if (state.spotlight && state.spotlight.mesh) {
        state.spotlight.mesh.position.set(winnerEntry.pos.x, 11.2, winnerEntry.pos.z);
        state.spotlight.mesh.visible = true;
        if (state.spotlight.material?.uniforms?.uColor?.value?.setHex) {
          state.spotlight.material.uniforms.uColor.value.setHex(0xfde047);
        }
        if (state.spotlight.material?.uniforms?.uOpacity) {
          state.spotlight.material.uniforms.uOpacity.value = 0.40;
        }
      }
      if (state.cameraDirector) {
        const camX = winnerEntry.pos.x * 0.75;
        const camZ = Math.max(2.6, winnerEntry.pos.z + 4.25);
        state.cameraDirector.setShot([camX, 2.05, camZ], [winnerEntry.pos.x, 1.32, winnerEntry.pos.z], 3.1);
        state.cameraDirector.impulse(0.25);
      }
      if (state.particles?.spawnFountain) {
        state.particles.spawnFountain(winnerEntry.pos.x, 0.25, winnerEntry.pos.z, 0xfde047, 45);
      }
      try {
        if (state.audio?.playFanfareChord) state.audio.playFanfareChord();
      } catch (_) {}
    } else if (state.cameraDirector) {
      state.cameraDirector.setShot([0, 3.6, 11.4], [0, 1.3, -0.6], 2.2);
    }
  }

  function onSurvivalElimination(eliminatedPlayers, evalResult) {
    if (!state || !state.active) return;
    const elimList = Array.isArray(eliminatedPlayers) ? eliminatedPlayers : [];
    if (!elimList.length) return;

    const capturedState = state;
    const runElimSpotlight = () => {
      if (!state || state !== capturedState || !state.active) return;
      const victimEntries = elimList
        .map(p => state.actors.get(String(p.id || p)))
        .filter(Boolean);
      if (!victimEntries.length) return;

      const leadVictim = victimEntries[0];
      if (state.ambientLight) state.ambientLight.intensity = 0.28;
      if (state.spotlight && state.spotlight.mesh) {
        state.spotlight.mesh.position.set(leadVictim.pos.x, 11.2, leadVictim.pos.z);
        state.spotlight.mesh.visible = true;
        if (state.spotlight.material?.uniforms?.uColor?.value?.setHex) {
          state.spotlight.material.uniforms.uColor.value.setHex(0xef4444);
        }
        if (state.spotlight.material?.uniforms?.uOpacity) {
          state.spotlight.material.uniforms.uOpacity.value = 0.48;
        }
      }
      if (state.cameraDirector) {
        const camX = leadVictim.pos.x * 0.72;
        const camZ = Math.max(2.6, leadVictim.pos.z + 4.1);
        state.cameraDirector.setShot([camX, 2.0, camZ], [leadVictim.pos.x, 1.25, leadVictim.pos.z], 2.8);
        state.cameraDirector.impulse(0.22);
      }
      try {
        if (state.audio?.playTimpaniPulse) state.audio.playTimpaniPulse(72, 0.18);
      } catch (_) {}

      victimEntries.forEach(entry => {
        entry.status = 'eliminated';
        applyPodColor(entry, 0xef4444, true);
        updateEntryNameplate(entry, '❌ غادر المنافسة', '#ef4444');
        entry.setMotion('sad', true);

        const tWave = setTimeout(() => {
          if (!state || state !== capturedState || !state.active) return;
          entry.setMotion('wave', true);
          if (entry.hero?.setOpacity) entry.hero.setOpacity(0.22);
          if (entry.el) entry.el.style.opacity = '0.28';
        }, 850);
        state.timers.push(tWave);
      });
    };

    const tDelay = setTimeout(runElimSpotlight, 1250);
    state.timers.push(tDelay);
  }

  function updatePlayers(players) {
    if (!state || !state.active || !Array.isArray(players)) return;
    players.forEach(p => {
      if (!p || !p.id) return;
      const entry = state.actors.get(p.id);
      if (entry) entry.player = p;
    });
  }

  function isActive() {
    return Boolean(state && state.active);
  }

  function getDebugState() {
    if (!state) return { active: false, actors: [] };
    const actors = [];
    state.actors.forEach(entry => {
      actors.push({
        id: entry.id,
        name: entry.player?.name || '',
        teamId: entry.teamId,
        status: entry.status,
        motion: entry.motion,
        podColor: hexToCss(entry.podColor),
        pos: entry.pos
      });
    });
    return {
      active: state.active,
      worldId: state.worldId,
      mode: state.mode,
      layout: state.layout,
      phase: state.phase,
      qIndex: state.qIndex,
      webgl: state.webgl,
      actorCount: actors.length,
      answeredIds: Array.from(state.answeredIds),
      fastestId: state.fastestId,
      actors
    };
  }

  function dispose() {
    if (!state) return;
    const s = state;
    state = null;
    s.active = false;

    if (s.rafId) cancelAnimationFrame(s.rafId);
    if (s.answerPollId) clearInterval(s.answerPollId);
    s.timers.forEach(t => clearTimeout(t));
    if (s.resizeHandler) window.removeEventListener('resize', s.resizeHandler);

    s.actors.forEach(entry => {
      try { if (entry.hero?.dispose) entry.hero.dispose(); } catch (_) {}
    });
    s.actors.clear();

    s.disposables.forEach(d => {
      try { if (d && typeof d.dispose === 'function') d.dispose(); } catch (_) {}
    });

    try { if (s.cameraDirector?.dispose) s.cameraDirector.dispose(); } catch (_) {}
    try { if (s.particles?.dispose) s.particles.dispose(); } catch (_) {}
    try { if (s.audio?.dispose) s.audio.dispose(); } catch (_) {}
    try { if (s.envMap?.dispose) s.envMap.dispose(); } catch (_) {}
    try { if (s.spotlight?.mesh?.geometry) s.spotlight.mesh.geometry.dispose(); } catch (_) {}
    try { if (s.spotlight?.material) s.spotlight.material.dispose(); } catch (_) {}
    try {
      if (s.renderer) {
        s.renderer.dispose();
        if (s.renderer.domElement && s.renderer.domElement.parentNode) {
          s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
        }
      }
    } catch (_) {}
    if (s.containerEl) {
      const fb = s.containerEl.querySelector('#hostArenaFallback');
      if (fb && fb.parentNode) fb.parentNode.removeChild(fb);
    }
  }

  const ArenaApi = {
    ARENA_WORLDS,
    MAX_ACTORS,
    mount,
    setPhase,
    onPlayerAnswered,
    onQuestionResult,
    onSurvivalElimination,
    updatePlayers,
    isActive,
    getDebugState,
    dispose
  };

  global.ScoreARArena3D = ArenaApi;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArenaApi;
  }
})(typeof window !== 'undefined' ? window : globalThis);
