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
        const baseX = sideSign * (isBack ? 5.35 : 3.25);
        const staggerX = baseX + sideSign * (Math.abs(t - 0.5) * (isBack ? 1.25 : 1.15));
        const depthZ = isBack ? (1.3 - t * 3.8) : (1.85 - t * 3.9);
        positions.set(p.id, {
          x: staggerX,
          y: isBack ? 0.60 : 0,
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
      const radius = isOuter ? 7.45 : 5.4;
      positions.set(p.id, {
        x: Math.cos(angle) * radius,
        y: isOuter ? 0.66 : 0,
        z: Math.sin(angle) * radius + 0.9,
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
    const isCard = mode === 'CARD_ARENA';
    ctx.fillStyle = 'rgba(9, 13, 30, 0.86)';
    roundRectPath(ctx, 8, 8, 304, 72, 22);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = borderHex || (isCard ? '#e879f9' : (isSurv ? '#c084fc' : (teamId === 'team_b' ? '#fb923c' : '#38bdf8')));
    roundRectPath(ctx, 8, 8, 304, 72, 22);
    ctx.stroke();

    const emoji = isCard ? '' : (isSurv ? '🛡️' : (teamId === 'team_b' ? '🦁' : '🦅'));
    ctx.font = 'bold 26px Cairo, "Segoe UI Emoji", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cleanName = String(name || 'بطل').slice(0, 14);
    const topLine = emoji ? `${emoji} ${cleanName}` : cleanName;
    ctx.fillText(topLine, 160, statusText ? 31 : 44);

    if (isCard) {
      ctx.save();
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.fillRect(28, statusText ? 19 : 32, 16, 22);
      ctx.strokeRect(28, statusText ? 19 : 32, 16, 22);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.fillText('✦', 36, statusText ? 31 : 44);
      ctx.restore();
    }

    if (statusText) {
      ctx.font = 'bold 20px Cairo, "Segoe UI Emoji", sans-serif';
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
    const isCard = opts?.mode === 'CARD_ARENA';

    displayedPlayers.forEach((p, idx) => {
      const info = posMap.get(p.id) || { teamId: normalizeTeam(p, idx) };
      const teamId = info.teamId;
      const podColor = (isSurv || isCard) ? 0xa855f7 : (teamId === 'team_b' ? 0xf97316 : 0x38bdf8);
      const card = document.createElement('div');
      card.dataset.actorId = p.id;
      card.style.cssText = `padding:8px 12px;border-radius:14px;background:rgba(10,14,32,0.84);border:2px solid ${hexToCss(podColor)};color:#fff;display:flex;align-items:center;gap:8px;min-width:128px;transition:transform 0.3s, box-shadow 0.3s, opacity 0.4s;`;
      const icon = document.createElement('span');
      icon.textContent = isCard ? '🃏' : (isSurv ? '🛡️' : (teamId === 'team_b' ? '🦁' : '🦅'));
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
        visibleCards: 0,
        cardStatus: {},
        setMotion(m) {
          this.motion = m;
          card.dataset.motion = m;
          if (m === 'jump' || m === 'win') {
            card.style.transform = 'translateY(-10px) scale(1.06)';
          } else if (m === 'sad') {
            card.style.opacity = '0.86';
            card.style.filter = 'saturate(0.75) brightness(0.88)';
            card.style.transform = 'translateY(4px) scale(0.97)';
          } else if (m === 'walkLeft' || m === 'walkRight') {
            card.style.filter = 'saturate(0.65)';
          } else {
            card.style.transform = 'none';
          }
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
      elimPhase: 'none',
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
      envMap: null,
      cardBackTex: null,
      cardTexCache: new Map(),
      cardShared: null,
      cardFxAnims: [],
      cardCamSeq: 0
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
      const wideCam = displayedPlayers.length > 10;
      const defCamPos = wideCam ? [0, 4.45, 14.8] : [0, 3.85, 12.6];
      const defCamLook = wideCam ? [0, 1.45, -0.6] : [0, 1.35, -0.8];
      instance.defaultCamPos = defCamPos;
      instance.defaultCamLook = defCamLook;
      const camDirector = Engine.createCameraDirector
        ? Engine.createCameraDirector(camera, containerEl)
        : null;
      if (camDirector) {
        camDirector.snapShot(defCamPos, defCamLook);
      } else {
        camera.position.set(defCamPos[0], defCamPos[1], defCamPos[2]);
        camera.lookAt(defCamLook[0], defCamLook[1], defCamLook[2]);
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

      // Hero Actors + Pods + Floating Pod Nameplates + Card Arena 3D Props
      const isSurvMode = mode === 'SURVIVAL';
      const isCardMode = mode === 'CARD_ARENA';
      let cardShared = null;
      if (isCardMode) {
        const backTex = makeCardBackTexture(THREE);
        const cardGeo = new THREE.PlaneGeometry(0.30, 0.44);
        const cardMat = new THREE.MeshBasicMaterial({ map: backTex, side: THREE.DoubleSide, transparent: true });
        const trapGeo = new THREE.RingGeometry(0.86, 0.96, 28);
        trapGeo.rotateX(-Math.PI / 2);
        const trapMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
        const buffGeo = new THREE.TorusGeometry(0.76, 0.035, 10, 32);
        buffGeo.rotateX(Math.PI / 2);
        const iceGeo = new THREE.CylinderGeometry(0.68, 0.80, 2.25, 6);
        const iceEdgeGeo = new THREE.EdgesGeometry(iceGeo);
        const iceEdgeMat = new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.85 });
        const fogGeo = new THREE.SphereGeometry(0.92, 12, 10);
        const fogMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.28, depthWrite: false });
        instance.cardBackTex = backTex;
        cardShared = { backTex, cardGeo, cardMat, trapGeo, trapMat, buffGeo, iceGeo, iceEdgeGeo, iceEdgeMat, fogGeo, fogMat };
        instance.cardShared = cardShared;
        instance.disposables.push(backTex, cardGeo, cardMat, trapGeo, trapMat, buffGeo, iceGeo, iceEdgeGeo, iceEdgeMat, fogGeo, fogMat);
      }

      displayedPlayers.forEach((p, idx) => {
        const slot = posMap.get(p.id) || { x: (idx - 1) * 2, y: 0, z: 0, teamId: normalizeTeam(p, idx), rotY: 0 };
        const slotY = slot.y || 0;
        const teamId = slot.teamId;
        const baseColor = isCardMode ? 0xa855f7 : (isSurvMode ? 0xa855f7 : (teamId === 'team_b' ? 0xf97316 : 0x38bdf8));
        const pod = buildPodMesh(THREE, baseColor);
        pod.podGroup.position.set(slot.x, slotY, slot.z);
        scene.add(pod.podGroup);

        if (slotY > 0.05) {
          const riserGeo = new THREE.CylinderGeometry(0.78, 0.90, slotY, 24);
          const riserMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.45, transparent: true, opacity: 0.85 });
          const riserMesh = new THREE.Mesh(riserGeo, riserMat);
          riserMesh.position.set(slot.x, slotY * 0.5, slot.z);
          scene.add(riserMesh);
          instance.disposables.push(riserGeo, riserMat);
        }

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
          hero.group.position.set(slot.x, slotY + 0.12, slot.z);
          if (hero.preloadMoves) hero.preloadMoves(['idle', 'clap', 'jump', 'win', 'sad', 'wave', 'walkLeft', 'walkRight']);
          scene.add(hero.group);
        }

        const tex = makeNameplateTexture(
          THREE,
          p.name,
          teamId,
          '',
          isCardMode ? '#e879f9' : (isSurvMode ? '#c084fc' : (teamId === 'team_b' ? '#fb923c' : '#38bdf8')),
          mode
        );
        const plateMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const plateSprite = new THREE.Sprite(plateMat);
        plateSprite.scale.set(1.75, 0.48, 1);
        plateSprite.position.set(slot.x, slotY + 0.28, slot.z + 0.85);
        scene.add(plateSprite);

        const cardProps = cardShared
          ? buildCardActorProps(THREE, slot, slotY, pod.podGroup, scene, cardShared, instance.disposables)
          : null;

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
          pos: { x: slot.x, y: slotY + 0.12, z: slot.z, slotY },
          pod,
          hero,
          plateSprite,
          pulseWave: 0,
          visibleCards: 0,
          cardStatus: {},
          ...(cardProps || {}),
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
      instance.baseAmbientIntensity = ambientLight.intensity;
      instance.baseKeyIntensity = keyLight.intensity;
      instance.baseKeyColorHex = keyLight.color.getHex();

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
          if (entry.cardFanGroup) {
            entry.cardFanGroup.position.y = (entry.cardFanBaseY || 1.28) + Math.sin(elapsed * 2.4 + entry.pos.x) * 0.06;
            entry.cardFanGroup.lookAt(instance.camera.position);
          }
          if (entry.buffRing && entry.buffRing.visible) entry.buffRing.rotation.z += dt * 1.8;
          if (entry.iceCage && entry.iceCage.visible) entry.iceCage.rotation.y += dt * 0.55;
          if (entry.fogMesh && entry.fogMesh.visible) entry.fogMesh.rotation.y -= dt * 0.85;
        });

        stepCardFxAnims(instance, dt);

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
    if (state?.mode === 'CARD_ARENA') return 0xa855f7;
    if (state?.mode === 'SURVIVAL') return 0xa855f7;
    return entry?.teamId === 'team_b' ? 0xf97316 : 0x38bdf8;
  }

  function defaultIdlePlateColor(entry) {
    if (state?.mode === 'CARD_ARENA') return '#e879f9';
    if (state?.mode === 'SURVIVAL') return '#c084fc';
    return entry?.teamId === 'team_b' ? '#fb923c' : '#38bdf8';
  }

  const CARD_FX_COLORS = {
    PIN_STUDENT: 0x38bdf8,
    MINUS_50: 0xef4444,
    POINT_LEECH: 0xf43f5e,
    SWAP_STUDENT: 0xc084fc,
    SCREEN_FOG: 0x94a3b8,
    TIME_SLICER: 0xf59e0b,
    BLOCK_DRAW: 0xfb923c,
    MULTIPLIER_2X: 0xfbbf24,
    ASK_QUESTION: 0x10b981,
    SCORE_EQUALIZER: 0xa855f7,
    PLUS_50: 0x34d399,
    FREE_GIFT: 0x22d3ee,
    ERASER_50_50: 0x60a5fa,
    DRAW_ALL: 0xfbbf24,
    BETTER_LUCK: 0x34d399,
    REVERSE_JUDGE: 0x38bdf8,
    IMMUNITY_SHIELD: 0xfbbf24,
    STOP_SWAP: 0x38bdf8,
    UNPIN_STUDENT: 0x38bdf8,
    STREAK_SAVER: 0xfbbf24
  };

  function makeCardBackTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 184;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 128, 184);
    grad.addColorStop(0, '#1e1648');
    grad.addColorStop(1, '#080c1f');
    ctx.fillStyle = grad;
    roundRectPath(ctx, 2, 2, 124, 180, 14);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    roundRectPath(ctx, 6, 6, 116, 172, 11);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.5)';
    roundRectPath(ctx, 13, 13, 102, 158, 7);
    ctx.stroke();

    ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
    ctx.beginPath();
    ctx.moveTo(64, 52);
    ctx.lineTo(94, 92);
    ctx.lineTo(64, 132);
    ctx.lineTo(34, 92);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', 64, 93);

    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
    else if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  function getCardFrontTexture(instance, THREE, imgUrl, fallbackColorHex) {
    const key = String(imgUrl || '');
    if (key && instance.cardTexCache.has(key)) return instance.cardTexCache.get(key);
    let tex = null;
    try {
      if (key && THREE.TextureLoader) {
        const loader = new THREE.TextureLoader();
        tex = loader.load(key, t => { t.needsUpdate = true; });
      }
    } catch (_) { tex = null; }
    if (!tex) {
      const c = document.createElement('canvas');
      c.width = 128; c.height = 184;
      const cx = c.getContext('2d');
      cx.fillStyle = '#111834';
      cx.fillRect(0, 0, 128, 184);
      cx.strokeStyle = hexToCss(fallbackColorHex || 0xfbbf24);
      cx.lineWidth = 6;
      cx.strokeRect(5, 5, 118, 174);
      tex = new THREE.CanvasTexture(c);
    }
    if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
    else if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
    if (key) instance.cardTexCache.set(key, tex);
    instance.disposables.push(tex);
    return tex;
  }

  function buildCardActorProps(THREE, slot, slotY, podGroup, scene, shared, disposables) {
    const fanX = slot.x + (slot.x >= 0 ? 0.72 : -0.72);
    const baseY = slotY + 1.28;
    const cardFanGroup = new THREE.Group();
    cardFanGroup.position.set(fanX, baseY, slot.z + 0.16);
    const fanOffsets = [
      { x: -0.11, z: -0.02, rz: 0.22 },
      { x: 0, z: 0, rz: 0 },
      { x: 0.11, z: 0.02, rz: -0.22 }
    ];
    const cardMeshes = fanOffsets.map(o => {
      const m = new THREE.Mesh(shared.cardGeo, shared.cardMat);
      m.position.set(o.x, 0, o.z);
      m.rotation.z = o.rz;
      m.visible = false;
      cardFanGroup.add(m);
      return m;
    });
    scene.add(cardFanGroup);

    const trapRing = new THREE.Mesh(shared.trapGeo, shared.trapMat);
    trapRing.position.y = 0.16;
    trapRing.visible = false;
    podGroup.add(trapRing);

    const buffMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.88 });
    const buffRing = new THREE.Mesh(shared.buffGeo, buffMat);
    buffRing.position.y = 0.28;
    buffRing.visible = false;
    podGroup.add(buffRing);

    const iceCage = new THREE.Group();
    iceCage.position.set(slot.x, slotY + 1.15, slot.z);
    const iceMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false });
    const iceBody = new THREE.Mesh(shared.iceGeo, iceMat);
    const iceWire = new THREE.LineSegments(shared.iceEdgeGeo, shared.iceEdgeMat);
    iceCage.add(iceBody, iceWire);
    iceCage.visible = false;
    scene.add(iceCage);

    const fogMesh = new THREE.Mesh(shared.fogGeo, shared.fogMat);
    fogMesh.position.set(slot.x, slotY + 1.25, slot.z);
    fogMesh.visible = false;
    scene.add(fogMesh);

    disposables.push(buffMat, iceMat);
    return { cardFanGroup, cardFanBaseY: baseY, cardMeshes, trapRing, buffRing, buffMat, iceCage, fogMesh };
  }

  function stepCardFxAnims(instance, dt) {
    if (!instance.webgl || !Array.isArray(instance.cardFxAnims) || !instance.cardFxAnims.length) return;
    for (let i = instance.cardFxAnims.length - 1; i >= 0; i--) {
      const fx = instance.cardFxAnims[i];
      fx.elapsed += dt;
      const done = fx.step ? fx.step(dt, fx.elapsed, instance) : true;
      if (done) {
        if (fx.dispose) fx.dispose(instance);
        instance.cardFxAnims.splice(i, 1);
      }
    }
  }

  function spawn3DFlyCard(instance, THREE, ev, srcPos, colorHex) {
    const tex = getCardFrontTexture(instance, THREE, ev.card?.img, colorHex);
    const cardGroup = new THREE.Group();
    const fGeo = new THREE.PlaneGeometry(0.56, 0.80);
    const fMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1 });
    const bMat = new THREE.MeshBasicMaterial({ map: instance.cardBackTex, transparent: true, opacity: 1 });
    const fMesh = new THREE.Mesh(fGeo, fMat);
    const bMesh = new THREE.Mesh(fGeo, bMat);
    bMesh.rotation.y = Math.PI;
    cardGroup.add(fMesh, bMesh);
    const sx = srcPos.x + (srcPos.x >= 0 ? 0.65 : -0.65);
    const sy = srcPos.y + 1.25;
    const sz = srcPos.z + 0.25;
    cardGroup.position.set(sx, sy, sz);
    instance.scene.add(cardGroup);

    const tx = sx * 0.35;
    const ty = sy + 1.35;
    const tz = Math.min(4.8, sz + 2.2);
    const dur = 1.35;
    instance.cardFxAnims.push({
      elapsed: 0,
      step(_dt, el) {
        const t = Math.min(1, el / dur);
        const ease = 1 - Math.pow(1 - t, 3);
        const rise = Math.min(1, t * 1.45);
        cardGroup.position.set(sx + (tx - sx) * ease, sy + (ty - sy) * Math.sin(rise * Math.PI * 0.5), sz + (tz - sz) * ease);
        cardGroup.rotation.y = Math.PI * (1 - Math.min(1, ease * 1.35));
        const sc = t < 0.78 ? (0.75 + 0.55 * ease) : (1.3 * Math.max(0.05, 1 - (t - 0.78) / 0.22));
        cardGroup.scale.set(sc, sc, sc);
        if (t > 0.78) {
          const op = Math.max(0, 1 - (t - 0.78) / 0.22);
          fMat.opacity = op;
          bMat.opacity = op;
        }
        return t >= 1;
      },
      dispose(inst) {
        inst.scene?.remove(cardGroup);
        fGeo.dispose(); fMat.dispose(); bMat.dispose();
      }
    });
  }

  function spawn3DBolt(instance, THREE, fromPos, toPos, colorHex, durSec, arcHeight, onImpact) {
    const orbGeo = new THREE.SphereGeometry(0.18, 14, 10);
    const orbMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.96 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    const haloGeo = new THREE.SphereGeometry(0.32, 12, 10);
    const haloMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    orb.add(halo);
    orb.position.set(fromPos.x, fromPos.y + 1.0, fromPos.z);
    instance.scene.add(orb);

    const mx = (fromPos.x + toPos.x) * 0.5;
    const my = Math.max(fromPos.y, toPos.y) + (arcHeight || 2.1);
    const mz = (fromPos.z + toPos.z) * 0.5 + 0.45;
    let sparkAcc = 0;

    instance.cardFxAnims.push({
      elapsed: 0,
      step(dt, el, inst) {
        const t = Math.min(1, el / Math.max(0.18, durSec || 0.52));
        const mt = 1 - t;
        const px = mt * mt * fromPos.x + 2 * mt * t * mx + t * t * toPos.x;
        const py = mt * mt * (fromPos.y + 0.95) + 2 * mt * t * my + t * t * (toPos.y + 0.95);
        const pz = mt * mt * fromPos.z + 2 * mt * t * mz + t * t * toPos.z;
        orb.position.set(px, py, pz);
        const pulse = 1 + 0.25 * Math.sin(el * 26);
        halo.scale.set(pulse, pulse, pulse);
        sparkAcc += dt;
        if (sparkAcc >= 0.08 && inst.particles?.spawnFountain) {
          sparkAcc = 0;
          inst.particles.spawnFountain(px, py, pz, colorHex, 6);
        }
        if (t >= 1) {
          if (typeof onImpact === 'function') onImpact();
          return true;
        }
        return false;
      },
      dispose(inst) {
        inst.scene?.remove(orb);
        orbGeo.dispose(); orbMat.dispose(); haloGeo.dispose(); haloMat.dispose();
      }
    });
  }

  function spawn3DPillar(instance, THREE, pos, colorHex, durSec) {
    const pGeo = new THREE.CylinderGeometry(0.55, 0.85, 5.2, 20, 1, true);
    const pMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.42, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const mesh = new THREE.Mesh(pGeo, pMat);
    mesh.position.set(pos.x, (pos.slotY || 0) + 2.6, pos.z);
    instance.scene.add(mesh);
    const dur = durSec || 1.25;
    instance.cardFxAnims.push({
      elapsed: 0,
      step(dt, el) {
        const t = Math.min(1, el / dur);
        mesh.rotation.y += dt * 1.8;
        pMat.opacity = 0.44 * (1 - t);
        const sc = 0.92 + t * 0.35;
        mesh.scale.set(sc, 1, sc);
        return t >= 1;
      },
      dispose(inst) {
        inst.scene?.remove(mesh);
        pGeo.dispose(); pMat.dispose();
      }
    });
  }

  function spawn3DDome(instance, THREE, pos, colorHex, durSec) {
    const dGeo = new THREE.SphereGeometry(1.15, 20, 14);
    const dMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.42, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const mesh = new THREE.Mesh(dGeo, dMat);
    mesh.position.set(pos.x, (pos.slotY || 0) + 1.05, pos.z);
    instance.scene.add(mesh);
    const dur = durSec || 1.05;
    instance.cardFxAnims.push({
      elapsed: 0,
      step(dt, el) {
        const t = Math.min(1, el / dur);
        mesh.rotation.y += dt * 2.2;
        dMat.opacity = 0.48 * (1 - t);
        const sc = 0.85 + Math.sin(Math.min(1, t * 2) * Math.PI * 0.5) * 0.25;
        mesh.scale.set(sc, sc, sc);
        return t >= 1;
      },
      dispose(inst) {
        inst.scene?.remove(mesh);
        dGeo.dispose(); dMat.dispose();
      }
    });
  }

  function syncCardActorsState(players, cardManager) {
    if (!state || !state.active) return;
    const list = Array.isArray(players) ? players : [];
    const byId = new Map();
    list.forEach(p => { if (p && p.id) byId.set(String(p.id), p); });
    const cardMap = cardManager?.players || {};

    state.actors.forEach(entry => {
      const liveP = byId.get(String(entry.id)) || entry.player;
      if (liveP) entry.player = liveP;
      const mp = cardMap[String(entry.id)] || null;
      const handLen = Math.min(3, mp?.hand?.length || 0);
      const trapCount = mp?.trapSlots?.length || 0;
      const isPinned = Boolean(mp?.status?.isPinned || liveP?.isPinned);
      const hasFog = Boolean(mp?.status?.hasFog || liveP?.hasFog);
      const wager100 = Boolean(mp?.status?.wager100 || liveP?.wager100);
      const mult = (mp?.status?.multiplier === 2 || liveP?.cardMultiplier === 2) ? 2 : 1;

      entry.visibleCards = handLen;
      entry.cardStatus = { isPinned, hasFog, wager100, multiplier: mult, trapCount };

      if (Array.isArray(entry.cardMeshes)) {
        entry.cardMeshes[0].visible = handLen >= 2;
        entry.cardMeshes[1].visible = handLen === 1 || handLen >= 3;
        entry.cardMeshes[2].visible = handLen >= 2;
      }
      if (entry.trapRing) entry.trapRing.visible = trapCount > 0;
      if (entry.iceCage) entry.iceCage.visible = isPinned;
      if (entry.fogMesh) entry.fogMesh.visible = hasFog;
      if (entry.buffRing) {
        entry.buffRing.visible = wager100 || mult === 2;
        if (entry.buffMat) entry.buffMat.color.setHex(wager100 ? 0x34d399 : 0xfbbf24);
      }

      if (entry.status === 'idle' && !state.resultApplied) {
        const pillParts = [];
        if (isPinned) pillParts.push('❄️ مجمد');
        if (wager100) pillParts.push('🎲 رهان ±100');
        else if (mult === 2) pillParts.push('⚡ 2X');
        if (trapCount > 0 && !isPinned && !wager100 && mult !== 2) pillParts.push('🛡️ محصّن');
        const statusStr = pillParts[0] || (handLen > 0 ? `✦ ${handLen} كارت` : '');
        const borderHex = isPinned ? '#38bdf8' : (wager100 ? '#34d399' : (mult === 2 ? '#fbbf24' : defaultIdlePlateColor(entry)));
        updateEntryNameplate(entry, statusStr, borderHex);
      }
    });
  }

  function scheduleCardCamRecover(capturedState, seq) {
    const t = setTimeout(() => {
      if (!state || state !== capturedState || !state.active || state.cardCamSeq !== seq || state.resultApplied) return;
      if (state.cameraDirector && state.phase !== 'result') {
        const dp = state.defaultCamPos || [0, 4.45, 14.8];
        const dl = state.defaultCamLook || [0, 1.45, -0.6];
        state.cameraDirector.setShot(dp, dl, 1.8);
      }
    }, 2300);
    capturedState.timers.push(t);
  }

  function playCardBattle3D(ev) {
    if (!state || !state.active || !ev || !ev.card) return null;
    const THREE = global.THREE;
    const cardId = ev.card.id;
    const colorHex = CARD_FX_COLORS[cardId] || 0xf59e0b;
    const srcId = String(ev.sourcePlayer?.id || '');
    const dstId = String(ev.targetPlayer?.id || '');
    const srcEntry = srcId ? state.actors.get(srcId) : null;
    const dstEntry = (dstId && dstId !== srcId) ? state.actors.get(dstId) : null;
    const isBlocked = ev.type === 'BLOCKED';
    const isReflected = ev.type === 'REFLECTED';
    const isSelf = !dstEntry;

    if (!state.webgl || !THREE) {
      if (srcEntry) srcEntry.setMotion(isSelf ? 'win' : 'clap');
      if (dstEntry && !isBlocked && !isReflected) dstEntry.setMotion('sad');
      return { mode: 'fallback', cardId, isSelf };
    }

    state.cardCamSeq = (state.cardCamSeq || 0) + 1;
    const camSeq = state.cardCamSeq;
    const capturedState = state;
    const srcPos = srcEntry ? srcEntry.pos : { x: 2.2, y: 0.12, z: 0, slotY: 0 };

    spawn3DFlyCard(state, THREE, ev, srcPos, colorHex);

    if (isSelf) {
      if (srcEntry) {
        srcEntry.pulseWave = 1.0;
        applyPodColor(srcEntry, colorHex, true);
        srcEntry.setMotion('jump', true);
        const tWin = setTimeout(() => {
          if (!state || state !== capturedState || !state.active || state.resultApplied) return;
          srcEntry.setMotion('win', true);
        }, 720);
        state.timers.push(tWin);
        spawn3DPillar(state, THREE, srcPos, colorHex, 1.25);
        state.particles?.spawnFountain?.(srcPos.x, (srcPos.slotY || 0) + 0.35, srcPos.z, colorHex, 32);
        if (state.cameraDirector && state.phase !== 'result') {
          const sy = srcPos.slotY || 0;
          state.cameraDirector.setShot([srcPos.x * 0.72, 2.35 + sy, Math.max(3.6, srcPos.z + 5.2)], [srcPos.x, 1.35 + sy, srcPos.z], 2.6);
          state.cameraDirector.impulse(0.18);
        }
      }
      scheduleCardCamRecover(capturedState, camSeq);
      return { mode: 'self', cardId };
    }

    const dstPos = dstEntry.pos;
    if (srcEntry) srcEntry.setMotion('clap', true);
    if (state.cameraDirector && state.phase !== 'result') {
      const mx = (srcPos.x + dstPos.x) * 0.5;
      const mz = Math.max(srcPos.z, dstPos.z) + 7.2;
      state.cameraDirector.setShot([mx * 0.65, 3.4, Math.min(14.8, mz)], [mx, 1.35, (srcPos.z + dstPos.z) * 0.5], 2.5);
    }

    if (cardId === 'SWAP_STUDENT' && !isBlocked && !isReflected) {
      const syD = dstPos.slotY || 0;
      const focusVictim = () => {
        if (!state || state !== capturedState || !state.active) return;
        if (srcEntry) { srcEntry.pulseWave = 1.0; applyPodColor(srcEntry, 0xc084fc, true); srcEntry.setMotion('jump', true); }
        dstEntry.pulseWave = 1.0; applyPodColor(dstEntry, 0xfbbf24, true); dstEntry.setMotion('clap', true);
        state.particles?.spawnFountain?.(dstPos.x, syD + 0.35, dstPos.z, 0xc084fc, 28);
        state.particles?.spawnFountain?.(srcPos.x, (srcPos.slotY || 0) + 0.35, srcPos.z, 0xfbbf24, 28);
        state.cameraDirector?.impulse?.(0.24);
      };
      spawn3DBolt(state, THREE, srcPos, dstPos, 0xc084fc, 0.58, 2.4, focusVictim);
      spawn3DBolt(state, THREE, dstPos, srcPos, 0xfbbf24, 0.58, 1.5, null);
      scheduleCardCamRecover(capturedState, camSeq);
      return { mode: 'swap', cardId };
    }

    spawn3DBolt(state, THREE, srcPos, dstPos, colorHex, 0.52, 2.1, () => {
      if (!state || state !== capturedState || !state.active) return;
      if (isBlocked) {
        spawn3DDome(state, THREE, dstPos, 0xfbbf24, 1.15);
        dstEntry.pulseWave = 1.0;
        dstEntry.setMotion('clap', true);
        state.particles?.spawnFountain?.(dstPos.x, (dstPos.slotY || 0) + 0.4, dstPos.z, 0x38bdf8, 30);
        return;
      }
      if (isReflected) {
        spawn3DDome(state, THREE, dstPos, 0x38bdf8, 1.05);
        dstEntry.setMotion('win', true);
        state.particles?.spawnFountain?.(dstPos.x, (dstPos.slotY || 0) + 0.4, dstPos.z, 0x38bdf8, 24);
        spawn3DBolt(state, THREE, dstPos, srcPos, 0x38bdf8, 0.45, 2.0, () => {
          if (!state || state !== capturedState || !state.active || !srcEntry) return;
          srcEntry.pulseWave = 1.0;
          applyPodColor(srcEntry, 0xef4444, true);
          srcEntry.setMotion('sad', true);
          state.particles?.spawnFountain?.(srcPos.x, (srcPos.slotY || 0) + 0.35, srcPos.z, 0xef4444, 34);
          state.cameraDirector?.impulse?.(0.28);
        });
        return;
      }

      dstEntry.pulseWave = 1.0;
      applyPodColor(dstEntry, colorHex, true);
      dstEntry.setMotion('sad', true);
      state.particles?.spawnFountain?.(dstPos.x, (dstPos.slotY || 0) + 0.35, dstPos.z, colorHex, 34);
      if (state.cameraDirector && state.phase !== 'result') {
        const syD = dstPos.slotY || 0;
        state.cameraDirector.setShot([dstPos.x * 0.72, 2.25 + syD, Math.max(3.4, dstPos.z + 4.8)], [dstPos.x, 1.3 + syD, dstPos.z], 2.8);
        state.cameraDirector.impulse(0.26);
      }
      if (cardId === 'POINT_LEECH' && srcEntry) {
        spawn3DBolt(state, THREE, dstPos, srcPos, 0xfbbf24, 0.46, 1.8, () => {
          if (!state || state !== capturedState || !state.active) return;
          srcEntry.pulseWave = 1.0;
          srcEntry.setMotion('win', true);
          state.particles?.spawnFountain?.(srcPos.x, (srcPos.slotY || 0) + 0.35, srcPos.z, 0xfbbf24, 24);
        });
      }
    });

    scheduleCardCamRecover(capturedState, camSeq);
    return { mode: ev.type || 'EXECUTED', cardId };
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
        const dp = state.defaultCamPos || [0, 3.85, 12.6];
        const dl = state.defaultCamLook || [0, 1.35, -0.8];
        state.cameraDirector.setShot(dp, dl, 2.0);
      }
    } else if (state.phase === 'answering' && prev !== 'answering') {
      state.patrolTimer = 1.9;
      if (state.cameraDirector) {
        const dp = state.defaultCamPos || [0, 3.85, 12.6];
        state.cameraDirector.setShot([1.6, dp[1] - 0.25, dp[2] - 0.8], [0.6, 1.35, -0.8], 2.4);
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
        const fastLabel = res?.wager100Outcome === 'won' ? `👑 🎲 +${pts}` : `👑 الأسرع +${pts}`;
        updateEntryNameplate(entry, fastLabel, '#facc15');
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
        const corrLabel = res?.wager100Outcome === 'won' ? `🎲 +${pts}` : `✓ +${pts}`;
        updateEntryNameplate(entry, corrLabel, '#10b981');
      } else {
        entry.status = 'wrong';
        applyPodColor(entry, 0xef4444, false);
        entry.setMotion('sad', true);
        const wrongLabel = res?.wager100Outcome === 'lost' ? (pts < 0 ? `🎲 ${pts}` : '🎲 0') : '✗ 0';
        updateEntryNameplate(entry, wrongLabel, '#ef4444');
      }
    });

    if (state.mode === 'CARD_ARENA') {
      syncCardActorsState(players, global.ScoreARCardArena?.getManager?.());
    }

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
        const sy = winnerEntry.pos.slotY || 0;
        const camZ = Math.max(2.6, winnerEntry.pos.z + 4.25);
        state.cameraDirector.setShot([camX, 2.05 + sy, camZ], [winnerEntry.pos.x, 1.32 + sy, winnerEntry.pos.z], 3.1);
        state.cameraDirector.impulse(0.25);
      }
      if (state.particles?.spawnFountain) {
        state.particles.spawnFountain(winnerEntry.pos.x, (winnerEntry.pos.slotY || 0) + 0.25, winnerEntry.pos.z, 0xfde047, 45);
      }
      try {
        if (state.audio?.playFanfareChord) state.audio.playFanfareChord();
      } catch (_) {}
    } else if (state.cameraDirector) {
      const dp = state.defaultCamPos || [0, 3.6, 11.4];
      state.cameraDirector.setShot(dp, state.defaultCamLook || [0, 1.3, -0.6], 2.2);
    }
  }

  function clearSurvivalElimVeil(inst) {
    const c = inst?.containerEl || state?.containerEl;
    if (!c || typeof c.querySelector !== 'function') return;
    const veil = c.querySelector('#hostSurvivalElimVeil');
    if (veil && veil.parentElement && typeof veil.parentElement.removeChild === 'function') {
      veil.parentElement.removeChild(veil);
    } else if (veil && typeof veil.remove === 'function') {
      veil.remove();
    }
  }

  function restoreBaselineLighting(inst) {
    if (!inst) return;
    if (inst.spotlight?.mesh) inst.spotlight.mesh.visible = false;
    if (inst.ambientLight && Number.isFinite(inst.baseAmbientIntensity)) {
      inst.ambientLight.intensity = inst.baseAmbientIntensity;
    }
    if (inst.keyLight) {
      if (Number.isFinite(inst.baseKeyIntensity)) inst.keyLight.intensity = inst.baseKeyIntensity;
      if (Number.isFinite(inst.baseKeyColorHex)) inst.keyLight.color.setHex(inst.baseKeyColorHex);
    }
    if (inst.actors) {
      inst.actors.forEach(entry => {
        if (entry.status !== 'eliminated' && entry.hero?.setBrightness) {
          entry.hero.setBrightness(1.0);
        }
      });
    }
    clearSurvivalElimVeil(inst);
  }

  function spawnSurvivalExitCorridor(instance, THREE, fromPos, exitPos, durSec) {
    if (!instance?.scene || !THREE) return;
    const dx = exitPos.x - fromPos.x;
    const dz = exitPos.z - fromPos.z;
    const len = Math.max(2.0, Math.hypot(dx, dz));
    const corridorGroup = new THREE.Group();
    corridorGroup.position.set((fromPos.x + exitPos.x) * 0.5, 0.045, (fromPos.z + exitPos.z) * 0.5);
    corridorGroup.rotation.y = Math.atan2(dx, dz);

    const pathGeo = new THREE.PlaneGeometry(0.95, len);
    pathGeo.rotateX(-Math.PI / 2);
    const pathMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.44,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    corridorGroup.add(pathMesh);

    const ringGeo = new THREE.RingGeometry(0.24, 0.34, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMats = [];
    for (let i = 0; i < 4; i++) {
      const rm = new THREE.MeshBasicMaterial({
        color: 0xfb7185,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const rMesh = new THREE.Mesh(ringGeo, rm);
      rMesh.position.set(0, 0.01, -len * 0.35 + i * (len * 0.24));
      corridorGroup.add(rMesh);
      ringMats.push(rm);
    }

    instance.scene.add(corridorGroup);
    const dur = Math.max(0.5, Number(durSec) || 2.45);
    const startWallMs = Date.now();
    instance.cardFxAnims.push({
      _isSurvivalExitFx: true,
      elapsed: 0,
      step(dt, el) {
        const wallEl = Math.max(el, (Date.now() - startWallMs) / 1000);
        const t = Math.min(1, wallEl / dur);
        const fadeOut = t > 0.74 ? Math.max(0, 1 - (t - 0.74) / 0.26) : Math.min(1, t / 0.14);
        pathMat.opacity = 0.44 * fadeOut;
        ringMats.forEach((rm, idx) => {
          rm.opacity = (0.45 + 0.35 * Math.max(0, Math.sin(wallEl * 6 - idx * 1.1))) * fadeOut;
        });
        return t >= 1;
      },
      dispose(inst) {
        inst.scene?.remove(corridorGroup);
        pathGeo.dispose(); pathMat.dispose();
        ringGeo.dispose(); ringMats.forEach(rm => rm.dispose());
      }
    });
  }

  function onSurvivalElimination(eliminatedPlayers, evalResult) {
    if (!state || !state.active) return;
    const elimList = Array.isArray(eliminatedPlayers) ? eliminatedPlayers : [];
    if (!elimList.length) return;

    const capturedState = state;
    const PAUSE_DUR_MS = 2000;
    const WALK_DUR_MS = 2400;

    const runElimSpotlight = () => {
      if (!state || state !== capturedState || !state.active) return;
      const reasonMap = new Map();
      const victimEntries = [];
      elimList.forEach(p => {
        const id = String(p?.id || p);
        const e = state.actors.get(id);
        if (e) {
          victimEntries.push(e);
          const unans = (p && p.reason === 'unanswered') || Boolean(evalResult?.playerResults?.[id]?.unanswered);
          reasonMap.set(id, unans ? 'unanswered' : 'slowest');
        }
      });
      if (!victimEntries.length) return;

      // Beat 1: Dramatic pause with distinct twilight lighting shift + crimson spotlight + sad pose
      state.elimPhase = 'pause';
      const leadVictim = victimEntries[0];
      const sy = leadVictim.pos.slotY || 0;

      if (state.ambientLight) state.ambientLight.intensity = 0.14;
      if (state.keyLight) {
        state.keyLight.intensity = 0.28;
        state.keyLight.color?.setHex?.(0x64748b);
      }
      if (state.spotlight?.mesh) {
        state.spotlight.mesh.position.set(leadVictim.pos.x, 11.2, leadVictim.pos.z);
        state.spotlight.mesh.visible = true;
        state.spotlight.material?.uniforms?.uColor?.value?.setHex?.(0xe11d48);
        if (state.spotlight.material?.uniforms?.uOpacity) {
          state.spotlight.material.uniforms.uOpacity.value = 0.62;
        }
      }
      state.actors.forEach(actor => {
        if (!victimEntries.includes(actor) && actor.status !== 'eliminated') {
          actor.hero?.setBrightness?.(0.42);
          actor.setMotion('idle', true);
        }
      });

      if (state.containerEl && typeof document !== 'undefined') {
        clearSurvivalElimVeil(state);
        const veil = document.createElement('div');
        veil.id = 'hostSurvivalElimVeil';
        veil.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;background:radial-gradient(circle at 50% 48%, rgba(225,29,72,0.10) 0%, rgba(10,12,28,0.68) 78%);transition:opacity 0.55s ease;';
        veil.innerHTML = `<div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);padding:6px 18px;border-radius:999px;background:rgba(136,19,55,0.78);border:1px solid rgba(251,113,133,0.65);color:#ffe4e6;font-family:Cairo,sans-serif;font-size:13px;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,0.45);">💔 لحظة الإقصاء — خروج من المنافسة...</div>`;
        state.containerEl.appendChild(veil);
      }

      if (state.cameraDirector) {
        const multiPad = victimEntries.length > 1 ? 1.15 : 0;
        const camX = leadVictim.pos.x * 0.66;
        const camZ = Math.max(2.9, leadVictim.pos.z + 4.1 + multiPad);
        state.cameraDirector.setShot([camX, 1.98 + sy + multiPad * 0.25, camZ], [leadVictim.pos.x, 1.25 + sy, leadVictim.pos.z], 2.9);
        state.cameraDirector.impulse(0.22);
      }
      try { state.audio?.playTimpaniPulse?.(58, 0.22); } catch (_) {}

      victimEntries.forEach(entry => {
        entry.status = 'eliminated';
        entry.exitedHall = false;
        applyPodColor(entry, 0xe11d48, true);
        const label = reasonMap.get(entry.id) === 'unanswered' ? '⏱ لم يُجب — غادر القاعة' : '❌ غادر القاعة';
        updateEntryNameplate(entry, label, '#e11d48');
        if (entry.plateSprite) {
          entry.plateSprite.position.y = (entry.pos.slotY || 0) + 0.06;
        }
        entry.setMotion('sad', true);
      });

      // Beat 2: Guided exit walk out along illuminated corridor
      const tWalk = setTimeout(() => {
        if (!state || state !== capturedState || !state.active) return;
        state.elimPhase = 'exit-walk';
        const THREE = global.THREE;
        const walkDurSec = WALK_DUR_MS / 1000;

        if (state.spotlight?.material?.uniforms?.uColor?.value?.setHex) {
          state.spotlight.material.uniforms.uColor.value.setHex(0xfb7185);
        }
        if (state.spotlight?.material?.uniforms?.uOpacity) {
          state.spotlight.material.uniforms.uOpacity.value = 0.56;
        }

        victimEntries.forEach((entry, vIdx) => {
          const exitDir = (entry.pos.x >= 0) ? 1 : -1;
          const exitX = exitDir * 12.2;
          const exitZ = Math.min(3.5, (entry.pos.z || 0) + 1.8);
          const walkMove = exitDir > 0 ? 'walkRight' : 'walkLeft';

          if (entry.pod) {
            entry.pod.discMat.opacity = 0.08;
            entry.pod.ringMat.color?.setHex?.(0x334155);
            entry.pod.ringMat.opacity = 0.22;
          }
          entry.setMotion(walkMove, true);

          if (state.webgl && THREE && entry.hero?.group) {
            spawnSurvivalExitCorridor(state, THREE, entry.pos, { x: exitX, z: exitZ }, walkDurSec);
            const startX = entry.pos.x;
            const startZ = entry.pos.z;
            const startY = (entry.pos.slotY || 0) + 0.12;
            const floorY = 0.12;
            entry._exitTarget = { x: exitX, y: floorY, z: exitZ };
            const walkStartMs = Date.now();
            const isLead = vIdx === 0;
            if (isLead && state.cameraDirector) {
              state.cameraDirector.setShot([exitDir * 2.4, 2.75, Math.max(4.8, exitZ + 5.2)], [exitX * 0.48, 1.15, (startZ + exitZ) * 0.5], 1.6);
            }

            state.cardFxAnims.push({
              _isSurvivalExitFx: true,
              elapsed: 0,
              step(dt, el, inst) {
                const wallEl = Math.max(el, (Date.now() - walkStartMs) / 1000);
                const t = Math.min(1, wallEl / walkDurSec);
                const stepDown = Math.min(1, t / 0.22);
                const walkFrac = Math.max(0, Math.min(1, (t - 0.12) / 0.88));
                const curX = startX + (exitX - startX) * walkFrac;
                const curZ = startZ + (exitZ - startZ) * walkFrac;
                const bobY = Math.abs(Math.sin(t * Math.PI * 8)) * 0.06;
                const curY = startY + (floorY - startY) * stepDown + bobY;

                entry.hero.group.position.set(curX, curY, curZ);
                if (entry.plateSprite) {
                  entry.plateSprite.position.set(curX, curY - 0.04, curZ + 0.85);
                }
                if (isLead && inst.spotlight?.mesh) {
                  inst.spotlight.mesh.position.set(curX, 11.2, curZ);
                }
                if (t > 0.68) {
                  const fade = Math.max(0, 1 - (t - 0.68) / 0.32);
                  entry.hero?.setOpacity?.(fade);
                  if (entry.plateSprite?.material) entry.plateSprite.material.opacity = fade;
                }
                if (t >= 1) {
                  entry.exitedHall = true;
                  entry.hero.group.visible = false;
                  if (entry.plateSprite) entry.plateSprite.visible = false;
                  return true;
                }
                return false;
              },
              dispose() {}
            });
          } else {
            if (entry.el) {
              entry.el.style.transition = 'transform 2.2s ease-in, opacity 1.8s ease-in';
              entry.el.style.transform = `translateX(${exitDir * 115}vw)`;
              entry.el.style.opacity = '0';
            }
            const tFallbackExit = setTimeout(() => {
              if (!state || state !== capturedState) return;
              entry.exitedHall = true;
            }, Math.min(WALK_DUR_MS, 2200));
            state.timers.push(tFallbackExit);
          }
        });

        // Beat 3: Restore hall lighting & camera cleanly after exit walk finishes
        const tRestore = setTimeout(() => {
          if (!state || state !== capturedState || !state.active) return;
          victimEntries.forEach(entry => {
            if (!entry.exitedHall) {
              entry.exitedHall = true;
              if (entry.hero?.group) {
                if (entry._exitTarget) {
                  entry.hero.group.position.set(entry._exitTarget.x, entry._exitTarget.y, entry._exitTarget.z);
                }
                entry.hero.setOpacity?.(0);
                entry.hero.group.visible = false;
              }
              if (entry.plateSprite) {
                if (entry.plateSprite.material) entry.plateSprite.material.opacity = 0;
                entry.plateSprite.visible = false;
              }
            }
          });
          if (Array.isArray(state.cardFxAnims)) {
            for (let i = state.cardFxAnims.length - 1; i >= 0; i--) {
              const fx = state.cardFxAnims[i];
              if (fx && fx._isSurvivalExitFx) {
                try { fx.dispose?.(state); } catch (_) {}
                state.cardFxAnims.splice(i, 1);
              }
            }
          }
          state.elimPhase = 'done';
          restoreBaselineLighting(state);
          if (state.cameraDirector) {
            const dp = state.defaultCamPos || [0, 3.85, 12.6];
            const dl = state.defaultCamLook || [0, 1.35, -0.8];
            state.cameraDirector.setShot(dp, dl, 2.2);
          }
        }, WALK_DUR_MS + 180);
        state.timers.push(tRestore);
      }, PAUSE_DUR_MS);
      state.timers.push(tWalk);
    };

    const tDelay = setTimeout(runElimSpotlight, 1050);
    state.timers.push(tDelay);
  }

  function setStandingsOverview(mode, data) {
    if (!state || !state.active) return;
    state.phase = 'overview';
    if (mode === 'CARD_ARENA') state.resultApplied = false;
    if (Array.isArray(state.cardFxAnims) && state.cardFxAnims.length) {
      state.cardFxAnims.forEach(fx => { try { if (fx.dispose) fx.dispose(state); } catch (_) {} });
      state.cardFxAnims.length = 0;
    }
    restoreBaselineLighting(state);
    if (state.cameraDirector) {
      const ovPos = state.defaultCamPos
        ? [0, state.defaultCamPos[1] + (mode === 'CARD_ARENA' ? 0.15 : 0), state.defaultCamPos[2] + (mode === 'CARD_ARENA' ? 0.35 : 0)]
        : [0, 4.35, 14.4];
      state.cameraDirector.setShot(ovPos, [0, 1.45, -0.6], 2.2);
    }
    const leaderTeamId = (mode === 'DUEL_TEAMS' && data?.leaderTeamId) ? data.leaderTeamId : null;
    state.actors.forEach(entry => {
      if (entry.status === 'eliminated') return;
      if (mode === 'CARD_ARENA') {
        entry.status = 'idle';
        applyPodColor(entry, defaultIdlePodColor(entry), false);
      }
      if (leaderTeamId && leaderTeamId !== 'tie') {
        const isLeading = entry.teamId === leaderTeamId;
        applyPodColor(entry, entry.teamId === 'team_b' ? 0xf97316 : 0x38bdf8, isLeading);
        entry.setMotion(isLeading ? 'clap' : 'idle', true);
      } else {
        entry.setMotion('clap', true);
      }
    });
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
        exitedHall: Boolean(entry.exitedHall),
        motion: entry.motion,
        podColor: hexToCss(entry.podColor),
        pos: entry.pos,
        heroPos: entry.hero?.group?.position
          ? { x: entry.hero.group.position.x, y: entry.hero.group.position.y, z: entry.hero.group.position.z }
          : null,
        heroVisible: entry.hero?.group
          ? Boolean(entry.hero.group.visible)
          : (entry.el ? entry.el.style.opacity !== '0' : true),
        visibleCards: entry.visibleCards || 0,
        hasTrap: Boolean(entry.cardStatus?.trapCount > 0),
        isPinned: Boolean(entry.cardStatus?.isPinned),
        hasFog: Boolean(entry.cardStatus?.hasFog),
        wager100: Boolean(entry.cardStatus?.wager100),
        multiplier: entry.cardStatus?.multiplier || 1
      });
    });
    return {
      active: state.active,
      worldId: state.worldId,
      mode: state.mode,
      layout: state.layout,
      phase: state.phase,
      elimPhase: state.elimPhase || 'none',
      qIndex: state.qIndex,
      webgl: state.webgl,
      actorCount: actors.length,
      activeCardFxCount: Array.isArray(state.cardFxAnims) ? state.cardFxAnims.length : 0,
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
    if (Array.isArray(s.cardFxAnims)) {
      s.cardFxAnims.forEach(fx => { try { if (fx.dispose) fx.dispose(s); } catch (_) {} });
      s.cardFxAnims.length = 0;
    }
    if (s.cardTexCache && typeof s.cardTexCache.clear === 'function') s.cardTexCache.clear();

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
      clearSurvivalElimVeil(s);
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
    setStandingsOverview,
    syncCardActorsState,
    playCardBattle3D,
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
