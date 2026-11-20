/**
 * ScoreAR 6-World Celebration Halls & Waypoint Choreography Engine (quiz-world-halls.js)
 * Shared architectural stage engine with per-world HD backdrops, true rAF waypoint entry paths
 * matched to each world's real floor/track/aerial architecture (walkRight/walkLeft/walkForward/
 * runRight/runLeft/fly + single physical step-up onto podium tier -> land -> looping win/clap),
 * real quiz title display, Skip, Step, Replay, Mute, Reduced Motion, and strict cleanup.
 * Strictly Rule 7 Compliant (< 470 lines).
 */
(function (global) {
  'use strict';

  const HALL_CONFIGS = {
    royal: {
      name: 'القصر الملكي · قاعة الأوسمة', subtitle: 'أقواس أندلسية ووسام التفوق الذهبي',
      accent: '#fbbf24', glow: 'rgba(251,191,36,0.62)', bg: '#071126',
      hallImg: 'assets/halls/royal-hall.jpg', fallbackImg: 'assets/worlds/royal/podium.jpg',
      plaqueBg: 'linear-gradient(135deg,rgba(10,23,54,0.92),rgba(23,37,84,0.92))',
      emblemTitle: 'وسام القصر الملكي الذهبي', sfx: 'fanfare', pathStyle: 'corridor',
      coronationKind: 'descend-medal', particles: ['#fef08a', '#fbbf24', '#ffffff'],
      svgEmblem: `<svg viewBox="0 0 160 160" width="136" height="136"><defs><radialGradient id="hRoyHalo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/><stop offset="65%" stop-color="#f59e0b" stop-opacity="0.25"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient><linearGradient id="hRoyGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbeb"/><stop offset="42%" stop-color="#fde047"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><circle cx="80" cy="80" r="76" fill="url(#hRoyHalo)"/><line x1="80" y1="0" x2="80" y2="28" stroke="url(#hRoyGold)" stroke-width="5" stroke-dasharray="4 3"/><circle cx="80" cy="84" r="52" fill="url(#hRoyGold)" stroke="#fffbeb" stroke-width="3.5"/><circle cx="80" cy="84" r="42" fill="#0f234c" stroke="#fde047" stroke-width="2.5"/><circle cx="80" cy="84" r="35" fill="none" stroke="rgba(254,240,138,0.45)" stroke-width="1.5" stroke-dasharray="5 4"/><polygon points="80,50 89,71 112,73 94,88 100,111 80,98 60,111 66,88 48,73 71,71" fill="url(#hRoyGold)" stroke="#fffbeb" stroke-width="1.5"/></svg>`
    },
    oasis: {
      name: 'الواحة العربية · ساحة الفوانيس', subtitle: 'فوانيس الغسق وانعكاس الضوء على الماء',
      accent: '#34d399', glow: 'rgba(251,191,36,0.58)', bg: '#061c15',
      hallImg: 'assets/halls/oasis-hall.jpg', fallbackImg: 'assets/worlds/oasis/podium.jpg',
      plaqueBg: 'linear-gradient(135deg,rgba(7,36,27,0.92),rgba(17,56,42,0.92))',
      emblemTitle: 'فانوس التتويج المضيء', sfx: 'reveal', pathStyle: 'corridor',
      coronationKind: 'rise-lantern', particles: ['#fef08a', '#fbbf24', '#6ee7b7'],
      svgEmblem: `<svg viewBox="0 0 150 160" width="128" height="136"><defs><radialGradient id="hOasGlow" cx="50%" cy="56%" r="48%"><stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/><stop offset="65%" stop-color="#f59e0b" stop-opacity="0.3"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs><circle cx="75" cy="90" r="68" fill="url(#hOasGlow)"/><line x1="75" y1="4" x2="75" y2="28" stroke="#fde047" stroke-width="4"/><path d="M52,32 Q75,16 98,32 L106,50 L44,50 Z" fill="#b45309" stroke="#fde047" stroke-width="2.5"/><rect x="46" y="50" width="58" height="62" rx="10" fill="#fef08a" stroke="#92400e" stroke-width="4"/><ellipse cx="75" cy="82" rx="14" ry="22" fill="#f59e0b"/><path d="M40,112 L110,112 L94,132 L56,132 Z" fill="#92400e" stroke="#fde047" stroke-width="2.5"/></svg>`
    },
    cosmic: {
      name: 'محطة الفضاء · منصة المدار', subtitle: 'إضاءة خطوط الإرساء واكتمال الحلقة المدارية',
      accent: '#22d3ee', glow: 'rgba(34,211,238,0.62)', bg: '#050b1c',
      hallImg: 'assets/halls/cosmic-hall.jpg', fallbackImg: 'assets/worlds/cosmic/podium.jpg',
      plaqueBg: 'linear-gradient(135deg,rgba(8,21,44,0.92),rgba(17,34,68,0.92))',
      emblemTitle: 'حلقة المدار الكوني', sfx: 'reveal', pathStyle: 'cosmic',
      coronationKind: 'orbit-ring', particles: ['#38bdf8', '#22d3ee', '#e0f2fe'],
      svgEmblem: `<svg viewBox="0 0 180 140" width="154" height="120"><defs><radialGradient id="hCosP" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#bae6fd"/><stop offset="50%" stop-color="#0284c7"/><stop offset="100%" stop-color="#1e1b4b"/></radialGradient></defs><ellipse cx="90" cy="70" rx="74" ry="24" transform="rotate(-16 90 70)" fill="none" stroke="#22d3ee" stroke-width="4.5" stroke-dasharray="14 6"/><circle cx="90" cy="70" r="32" fill="url(#hCosP)" stroke="#e0f2fe" stroke-width="2.5"/><ellipse cx="90" cy="70" rx="64" ry="20" transform="rotate(14 90 70)" fill="none" stroke="#fde047" stroke-width="3.5"/><circle cx="152" cy="54" r="6" fill="#fef08a"/><circle cx="28" cy="84" r="5" fill="#38bdf8"/></svg>`
    },
    treasure: {
      name: 'جزيرة الكنز · رصيف الكنز', subtitle: 'انفتاح صندوق الكنز وبوصلة الذهب',
      accent: '#fbbf24', glow: 'rgba(245,158,11,0.62)', bg: '#190e05',
      hallImg: 'assets/halls/treasure-hall.jpg', fallbackImg: 'assets/worlds/treasure/podium.jpg',
      plaqueBg: 'linear-gradient(135deg,rgba(45,23,9,0.93),rgba(78,38,14,0.93))',
      emblemTitle: 'صندوق وبوصلة الكنز', sfx: 'fanfare', pathStyle: 'dock',
      coronationKind: 'chest-compass', particles: ['#fde047', '#f59e0b', '#fed7aa'],
      svgEmblem: `<svg viewBox="0 0 160 150" width="136" height="128"><circle cx="80" cy="64" r="46" fill="#451a03" stroke="#fbbf24" stroke-width="5"/><circle cx="80" cy="64" r="35" fill="#fef3c7" stroke="#b45309" stroke-width="2"/><polygon points="80,26 89,64 80,102 71,64" fill="#dc2626"/><polygon points="42,64 80,55 118,64 80,73" fill="#0f172a"/><circle cx="80" cy="64" r="7" fill="#fbbf24" stroke="#fff" stroke-width="2"/><rect x="44" y="114" width="72" height="26" rx="6" fill="#78350f" stroke="#fbbf24" stroke-width="3"/><rect x="74" y="114" width="12" height="16" rx="2" fill="#fde047"/></svg>`
    },
    stadium: {
      name: 'استاد الأبطال · مضمار الأبطال', subtitle: 'تلاقي الكشافات وارتفاع كأس البطولة',
      accent: '#38bdf8', glow: 'rgba(56,189,248,0.62)', bg: '#07142e',
      hallImg: 'assets/halls/stadium-hall.jpg', fallbackImg: 'assets/worlds/stadium/podium.jpg',
      plaqueBg: 'linear-gradient(135deg,rgba(10,27,62,0.92),rgba(20,54,108,0.92))',
      emblemTitle: 'كأس البطولة الذهبي', sfx: 'fanfare', pathStyle: 'track',
      coronationKind: 'rise-cup', particles: ['#ffffff', '#38bdf8', '#fde047'],
      svgEmblem: `<svg viewBox="0 0 160 150" width="136" height="128"><defs><linearGradient id="hStCup" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbeb"/><stop offset="45%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><path d="M46,24 H114 V62 C114,88 98,102 80,102 C62,102 46,88 46,62 Z" fill="url(#hStCup)" stroke="#fffbeb" stroke-width="3"/><path d="M46,34 H24 C24,62 36,72 46,72 M114,34 H136 C136,62 124,72 114,72" fill="none" stroke="#fde047" stroke-width="5"/><rect x="72" y="102" width="16" height="22" fill="#d97706"/><rect x="52" y="124" width="56" height="14" rx="5" fill="url(#hStCup)" stroke="#fffbeb" stroke-width="2"/></svg>`
    },
    magic: {
      name: 'مملكة السحر · قاعة البلورات', subtitle: 'تجمّع شظايا الضوء في التاج البلوري',
      accent: '#c084fc', glow: 'rgba(192,132,252,0.64)', bg: '#15082e',
      hallImg: 'assets/halls/magic-hall.jpg', fallbackImg: 'assets/worlds/magic/podium.jpg',
      plaqueBg: 'linear-gradient(135deg,rgba(35,14,68,0.92),rgba(66,22,118,0.92))',
      emblemTitle: 'التاج البلوري السحري', sfx: 'fanfare', pathStyle: 'aerial',
      coronationKind: 'crystal-crown', particles: ['#f5d0fe', '#c084fc', '#38bdf8'],
      svgEmblem: `<svg viewBox="0 0 160 140" width="140" height="122"><defs><linearGradient id="hMagC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fae8ff"/><stop offset="50%" stop-color="#c084fc"/><stop offset="100%" stop-color="#6b21a8"/></linearGradient></defs><polygon points="24,98 36,42 58,66 80,22 102,66 124,42 136,98" fill="url(#hMagC)" stroke="#fdf4ff" stroke-width="3"/><rect x="24" y="98" width="112" height="18" rx="7" fill="#581c87" stroke="#fde047" stroke-width="2.5"/><polygon points="80,54 88,68 80,82 72,68" fill="#38bdf8" stroke="#fff" stroke-width="1.5"/></svg>`
    }
  };

  let timers = [], fxRafId = null, pathRafs = new Set();
  let activeRoom = null, activeStage = null, activeOnClose = null, active3DCtrl = null;
  let activeSorted = [], activeRanked = [], slotSprites = new Map(), currentStep = 0, isSettled = false;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const ic = (n, sz = 14) => (global.ScoreARUI?.icon) ? global.ScoreARUI.icon(n, { size: sz }) : '';
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };
  const charCode = raw => 'char_' + String(Math.max(1, Math.min(20, parseInt(String(raw || '1').replace(/\D/g, '') || '1', 10)))).padStart(2, '0');

  function resolveQuizTitle(room) {
    if (global.ScoreARQuizHostView?.resolveRealQuizTitle) return global.ScoreARQuizHostView.resolveRealQuizTitle(room, '');
    return room?.quizTitle || '';
  }

  function isActive() {
    return Boolean(typeof document !== 'undefined' && document.getElementById('scHallRoot'));
  }

  function cancelPaths() {
    pathRafs.forEach(id => cancelAnimationFrame(id));
    pathRafs.clear();
  }

  function cleanup() {
    if (active3DCtrl) { try { active3DCtrl.dispose?.(); } catch {} active3DCtrl = null; }
    timers.forEach(id => clearTimeout(id));
    timers = [];
    cancelPaths();
    if (fxRafId) { cancelAnimationFrame(fxRafId); fxRafId = null; }
    slotSprites.forEach(inst => { try { inst?.destroy?.(); } catch {} });
    slotSprites.clear();
    currentStep = 0;
    isSettled = false;
    if (global.ScoreARStageFx?.stop) global.ScoreARStageFx.stop();
    if (global.ScoreARPodiumScenes?.stopStage) global.ScoreARPodiumScenes.stopStage();
  }

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function computeRanks(sorted) {
    let r = 1;
    return sorted.map((p, i) => {
      if (i > 0 && (p.score || 0) < (sorted[i - 1].score || 0)) r = i + 1;
      return { ...p, _rank: r };
    });
  }

  function startHallFxCanvas(canvas, worldId, cfg) {
    const ctx = canvas?.getContext?.('2d');
    if (!ctx) return;
    let w = canvas.width = canvas.offsetWidth || 1280;
    let h = canvas.height = canvas.offsetHeight || 720;
    const motes = Array.from({ length: 42 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.65, vy: -(0.35 + Math.random() * 0.95),
      r: 1.6 + Math.random() * 3.0, a: 0.35 + Math.random() * 0.55,
      col: cfg.particles[Math.floor(Math.random() * cfg.particles.length)]
    }));
    let t = 0;
    function frame() {
      if (!canvas.isConnected) { fxRafId = null; return; }
      w = canvas.width = canvas.offsetWidth || 1280;
      h = canvas.height = canvas.offsetHeight || 720;
      ctx.clearRect(0, 0, w, h);
      t += 0.022;
      if (worldId === 'stadium') {
        const sway = Math.sin(t) * w * 0.055;
        [[w * 0.14, w * 0.5 + sway], [w * 0.86, w * 0.5 - sway]].forEach(([ox, tx]) => {
          const g = ctx.createLinearGradient(ox, 0, tx, h * 0.85);
          g.addColorStop(0, 'rgba(186,230,253,0.26)'); g.addColorStop(1, 'rgba(56,189,248,0)');
          ctx.fillStyle = g; ctx.beginPath();
          ctx.moveTo(ox - 16, 0); ctx.lineTo(ox + 16, 0);
          ctx.lineTo(tx + w * 0.14, h * 0.9); ctx.lineTo(tx - w * 0.14, h * 0.9);
          ctx.closePath(); ctx.fill();
        });
      } else {
        const rg = ctx.createRadialGradient(w * 0.5, h * 0.28, 12, w * 0.5, h * 0.42, w * 0.34);
        rg.addColorStop(0, cfg.glow.replace(/[\d.]+\)$/, '0.24)'));
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      }
      for (const m of motes) {
        m.x += m.vx + Math.sin(t + m.y * 0.01) * 0.2;
        m.y += m.vy;
        if (m.y < -12) { m.y = h + 8; m.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = m.a * (0.65 + 0.35 * Math.sin(t * 2.2 + m.x));
        ctx.fillStyle = m.col; ctx.shadowColor = m.col; ctx.shadowBlur = 9;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      fxRafId = requestAnimationFrame(frame);
    }
    fxRafId = requestAnimationFrame(frame);
  }

  function ensureSlotSprite(slotNum, player, initialMove, loopFlag) {
    const box = document.getElementById(`scHallSprite_${slotNum}`);
    if (!box || !player) return null;
    const existing = slotSprites.get(slotNum);
    if (existing) {
      existing.setAction(initialMove, { loop: loopFlag });
      return existing;
    }
    const code = charCode(player.avatarId || player.characterId || player.avatar);
    if (global.ScoreARMotionV3?.mount) {
      const inst = global.ScoreARMotionV3.mount(box, code, initialMove, {
        width: box.clientWidth || (slotNum === 1 ? 176 : 152),
        height: box.clientHeight || (slotNum === 1 ? 215 : 186),
        loop: loopFlag
      });
      if (inst) slotSprites.set(slotNum, inst);
      return inst;
    }
    box.innerHTML = `<img src="assets/motion-v3/originals/${code}.png" onerror="this.onerror=null;this.src='assets/characters/animated/${code}-idle.webp';" alt="${esc(player.name)}" style="width:100%;height:100%;object-fit:contain;">`;
    return null;
  }

  /**
   * Build true architectural waypoints per world & slot!
   * Note RTL podium layout: slot 2 is on SCREEN RIGHT (+x -> 0, facing left),
   * slot 3 is on SCREEN LEFT (-x -> 0, facing right), slot 1 is CENTER.
   */
  function getSlotWaypoints(slotNum, pathStyle) {
    if (pathStyle === 'aerial') {
      const sx = slotNum === 2 ? 150 : (slotNum === 3 ? -150 : 0);
      const sy = slotNum === 1 ? -145 : -120;
      return [
        { from: [sx, sy, 0.62], to: [0, 0, 1.0], dur: 1120, move: 'fly', arcY: -26, loop: true },
        { from: [0, 0, 1.0], to: [0, 0, 1.0], dur: 360, move: 'land', loop: false }
      ];
    }
    if (pathStyle === 'cosmic' && slotNum === 1) {
      return [
        { from: [-95, -138, 0.64], to: [0, 0, 1.0], dur: 1180, move: 'fly', arcY: -22, loop: true },
        { from: [0, 0, 1.0], to: [0, 0, 1.0], dur: 360, move: 'land', loop: false }
      ];
    }
    if (pathStyle === 'track') {
      if (slotNum === 3) {
        return [
          { from: [-225, 34, 0.88], to: [-14, 22, 0.96], dur: 940, move: 'runRight', arcY: 14, loop: true },
          { from: [-14, 22, 0.96], to: [0, 0, 1.0], dur: 520, move: 'jump', loop: false }
        ];
      }
      if (slotNum === 2) {
        return [
          { from: [225, 34, 0.88], to: [14, 24, 0.96], dur: 940, move: 'runLeft', arcY: 14, loop: true },
          { from: [14, 24, 0.96], to: [0, 0, 1.0], dur: 520, move: 'jump', loop: false }
        ];
      }
      return [
        { from: [-210, 42, 0.84], to: [0, 28, 0.96], dur: 1020, move: 'runRight', arcY: 16, loop: true },
        { from: [0, 28, 0.96], to: [0, 0, 1.0], dur: 540, move: 'jump', loop: false }
      ];
    }
    if (pathStyle === 'dock' && slotNum !== 1) {
      const fromLeft = slotNum === 3;
      const sx = fromLeft ? -220 : 220;
      const edgeX = fromLeft ? -18 : 18;
      return [
        { from: [sx, 26, 0.90], to: [fromLeft ? -72 : 72, 24, 0.94], dur: 660, move: fromLeft ? 'runRight' : 'runLeft', loop: true },
        { from: [fromLeft ? -72 : 72, 24, 0.94], to: [edgeX, 22, 0.97], dur: 360, move: fromLeft ? 'walkRight' : 'walkLeft', loop: true },
        { from: [edgeX, 22, 0.97], to: [0, 0, 1.0], dur: 520, move: 'jump', loop: false }
      ];
    }
    // Corridor / terrace / cosmic side lanes
    if (slotNum === 3) {
      return [
        { from: [-210, 24, 0.89], to: [-12, 20, 0.96], dur: 980, move: 'walkRight', loop: true },
        { from: [-12, 20, 0.96], to: [0, 0, 1.0], dur: 520, move: 'jump', loop: false }
      ];
    }
    if (slotNum === 2) {
      return [
        { from: [210, 26, 0.89], to: [12, 22, 0.96], dur: 980, move: 'walkLeft', loop: true },
        { from: [12, 22, 0.96], to: [0, 0, 1.0], dur: 520, move: 'jump', loop: false }
      ];
    }
    // Slot #1 Center: emerges forward through arch/promenade/dock with depth scaling -> single step-up
    return [
      { from: [0, -34, 0.58], to: [0, 30, 0.96], dur: 1120, move: 'walkForward', loop: true },
      { from: [0, 30, 0.96], to: [0, 0, 1.0], dur: 540, move: 'jump', loop: false }
    ];
  }

  function runSlotPath(slotNum, player, cfg) {
    const col = document.getElementById(`scHallCol_${slotNum}`);
    if (!col || !player) return;
    const segs = getSlotWaypoints(slotNum, cfg.pathStyle);
    let segIdx = 0;
    let segStart = performance.now();
    col.classList.add('is-revealed');
    col.style.opacity = '0';
    ensureSlotSprite(slotNum, player, segs[0].move, segs[0].loop);
    sfx(slotNum === 1 ? cfg.sfx : 'pop');

    let myRaf = null;
    function step(now) {
      if (isSettled || !col.isConnected) {
        if (myRaf) pathRafs.delete(myRaf);
        return;
      }
      const seg = segs[segIdx];
      const t = Math.min(1, (now - segStart) / seg.dur);
      const ease = seg.move === 'jump' ? (1 - Math.pow(1 - t, 2)) : t;
      const x = seg.from[0] + (seg.to[0] - seg.from[0]) * ease;
      const y = seg.from[1] + (seg.to[1] - seg.from[1]) * ease + (seg.arcY ? Math.sin(t * Math.PI) * seg.arcY : 0);
      const sc = seg.from[2] + (seg.to[2] - seg.from[2]) * ease;

      col.style.opacity = segIdx === 0 ? String(Math.min(1, t * 4)) : '1';
      col.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;

      if (t >= 1) {
        segIdx++;
        if (segIdx < segs.length) {
          segStart = now;
          const next = segs[segIdx];
          ensureSlotSprite(slotNum, player, next.move, next.loop);
        } else {
          col.style.opacity = '1';
          col.style.transform = 'translate3d(0, 0, 0) scale(1)';
          ensureSlotSprite(slotNum, player, 'idle', true);
          if (myRaf) pathRafs.delete(myRaf);
          return;
        }
      }
      myRaf = requestAnimationFrame(step);
      pathRafs.add(myRaf);
    }
    myRaf = requestAnimationFrame(step);
    pathRafs.add(myRaf);
  }

  function revealSlot(slotNum, top3, cfg, immediate = false) {
    const p = top3[slotNum - 1];
    if (!p) return;
    const col = document.getElementById(`scHallCol_${slotNum}`);
    if (!col) return;
    if (immediate) {
      col.classList.add('is-revealed');
      col.style.opacity = '1';
      col.style.transform = 'translate3d(0, 0, 0) scale(1)';
      ensureSlotSprite(slotNum, p, slotNum === 1 ? 'win' : 'clap', true);
      return;
    }
    runSlotPath(slotNum, p, cfg);
  }

  function crownNow(top3, cfg, withConfetti = true) {
    timers.forEach(id => clearTimeout(id));
    timers = [];
    cancelPaths();
    isSettled = true;
    currentStep = 4;

    const root = document.getElementById('scHallRoot');
    if (!root) return;
    root.classList.remove('is-opening');
    root.classList.add('is-crowned', 'is-complete');

    const pathEl = document.getElementById('scHallPathGlow');
    if (pathEl) pathEl.style.opacity = '1';
    const emblem = document.getElementById('scHallEmblem');
    if (emblem) emblem.classList.add('is-crowned');
    const banner = document.getElementById('scHallOpeningBanner');
    if (banner) { banner.style.opacity = '0'; banner.style.display = 'none'; }

    top3.forEach((p, idx) => {
      const slotNum = idx + 1;
      const col = document.getElementById(`scHallCol_${slotNum}`);
      if (col) {
        col.classList.add('is-revealed');
        col.style.opacity = '1';
        col.style.transform = 'translate3d(0, 0, 0) scale(1)';
      }
      ensureSlotSprite(slotNum, p, idx === 0 ? 'win' : 'clap', true);
    });

    const exp = document.getElementById('scHallActions');
    if (exp) exp.style.display = 'flex';
    const skipBtn = document.getElementById('scHallSkipBtn');
    if (skipBtn) skipBtn.style.display = 'none';

    if (withConfetti && global.confetti && !global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      global.confetti({ particleCount: 140, spread: 135, origin: { y: 0.52 }, colors: cfg.particles });
    }
  }

  function buildWorldPropsHtml(worldId) {
    if (worldId === 'oasis') {
      return `<div class="sc-hall-world-props">${[10, 21, 79, 90].map((x, i) => `<span class="sc-oasis-lantern" style="left:${x}%;animation-delay:${(i * 0.28).toFixed(2)}s;"></span>`).join('')}</div>`;
    }
    if (worldId === 'cosmic') return `<div class="sc-hall-world-props"><div class="sc-cosmic-dock-ring"></div></div>`;
    if (worldId === 'magic') return `<div class="sc-hall-world-props"><div class="sc-magic-runes"></div></div>`;
    return `<div class="sc-hall-world-props"></div>`;
  }

  function renderHallCeremony(stage, currentRoom, onClose) {
    if (!stage || !currentRoom) return;
    cleanup();
    activeStage = stage;
    activeRoom = currentRoom;
    activeOnClose = onClose;

    const worldId = (currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : (currentRoom.worldId || 'royal');
    const cfg = HALL_CONFIGS[worldId] || HALL_CONFIGS.royal;
    const sorted = [...(currentRoom.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    activeSorted = sorted;
    activeRanked = computeRanks(sorted);
    const top3 = activeRanked.slice(0, 3);
    const isReduced = Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    const isMuted = Boolean(global.ScoreARAudio?.isMuted?.());
    const quizTitle = resolveQuizTitle(currentRoom);

    // Full 6-World 3D WebGL Celebration Hall Engine (auto-falls back to 2D if WebGL unavailable)
    if (global.ScoreARHall3DEngine?.isWebGLReady?.()) {
      try {
        let ctrl = null;
        if (worldId === 'royal' && global.ScoreARHall3DRoyal?.mountRoyal3DHall) {
          ctrl = global.ScoreARHall3DRoyal.mountRoyal3DHall(stage, currentRoom, activeRanked, onClose, quizTitle);
        } else if (global.ScoreARHall3DStage?.mountWorld3DStage) {
          const specFn = global.ScoreARHall3DWorldsA?.[worldId] || global.ScoreARHall3DWorldsB?.[worldId];
          if (typeof specFn === 'function') {
            ctrl = global.ScoreARHall3DStage.mountWorld3DStage(stage, currentRoom, activeRanked, onClose, quizTitle, specFn());
          }
        }
        if (ctrl) { active3DCtrl = ctrl; return; }
      } catch (err) {
        console.warn(`[ScoreARWorldHalls] 3D ${worldId} fallback to 2D:`, err);
      }
    }

    const slots = [
      top3[1] ? { p: top3[1], slot: 2, cls: 'tier-2', medal: '🥈' } : null,
      top3[0] ? { p: top3[0], slot: 1, cls: 'tier-1', medal: '🥇' } : null,
      top3[2] ? { p: top3[2], slot: 3, cls: 'tier-3', medal: '🥉' } : null
    ].filter(Boolean);

    stage.innerHTML = `
      <style>
        @keyframes scHallBgZoom { 0%{transform:scale(1.11)} 100%{transform:scale(1.0)} }
        @keyframes scEmblemDescend { 0%{opacity:0;transform:translate(-50%,-56px) scale(0.55)} 70%{opacity:1;transform:translate(-50%,6px) scale(1.06)} 100%{opacity:1;transform:translate(-50%,0) scale(1)} }
        @keyframes scEmblemRise { 0%{opacity:0;transform:translate(-50%,40px) scale(0.55)} 70%{opacity:1;transform:translate(-50%,-6px) scale(1.06)} 100%{opacity:1;transform:translate(-50%,0) scale(1)} }
        @keyframes scEmblemFloat { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-5px)} }
        @keyframes scLanternPulse { 0%{opacity:0.25;transform:scale(0.88)} 100%{opacity:1;transform:scale(1.06)} }
        .sc-hall-root { position:relative;width:100%;height:100%;max-height:100%;display:flex;flex-direction:column;overflow:hidden;background:${cfg.bg};direction:rtl;font-family:Cairo,Tajawal,sans-serif; }
        .sc-hall-bg-wrap { position:absolute;inset:0;z-index:0;overflow:hidden; }
        .sc-hall-bg-img { width:100%;height:100%;object-fit:cover;object-position:center 58%;display:block;animation:scHallBgZoom 2.4s cubic-bezier(0.22,1,0.36,1) forwards;filter:brightness(0.88) saturate(1.08); }
        .sc-hall-letterbox { position:absolute;left:0;right:0;height:0;background:#040610;z-index:26;pointer-events:none;transition:height 0.7s cubic-bezier(0.22,1,0.36,1); }
        .sc-hall-letterbox.top { top:0; }
        .sc-hall-letterbox.bot { bottom:0; }
        .sc-hall-root.is-opening .sc-hall-letterbox.top, .sc-hall-root.is-opening .sc-hall-letterbox.bot { height:38px; }
        .sc-hall-stage { position:relative;flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0 16px 8px;overflow:hidden; }
        .sc-hall-opening-banner { position:absolute;top:22%;left:0;right:0;margin:0 auto;z-index:22;text-align:center;pointer-events:none;transition:opacity 0.55s ease;width:min(760px,90%); }
        .sc-hall-path { position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:min(420px,70%);height:32%;background:linear-gradient(180deg,transparent,${cfg.glow});clip-path:polygon(30% 0%,70% 0%,100% 100%,0% 100%);opacity:0;transition:opacity 1s ease;pointer-events:none;z-index:4; }
        .sc-hall-arch-halo { position:absolute;top:4%;left:50%;transform:translateX(-50%);width:min(340px,46vw);height:min(340px,46vw);border-radius:50%;background:radial-gradient(circle,${cfg.glow},transparent 68%);opacity:0;transition:opacity 0.9s ease;pointer-events:none;z-index:5; }
        .sc-hall-root.is-crowned .sc-hall-arch-halo { opacity:0.88; }
        .sc-hall-emblem { position:absolute;top:2%;left:50%;transform:translateX(-50%);z-index:16;opacity:0;pointer-events:none;filter:drop-shadow(0 0 28px ${cfg.glow});display:flex;flex-direction:column;align-items:center;gap:2px; }
        .sc-hall-emblem svg { width:clamp(84px,14.5vh,122px) !important;height:clamp(84px,14.5vh,122px) !important;max-width:none !important;display:block !important;flex-shrink:0 !important; }
        .sc-hall-emblem.is-crowned { animation:${cfg.coronationKind === 'rise-lantern' || cfg.coronationKind === 'rise-cup' ? 'scEmblemRise' : 'scEmblemDescend'} 0.85s cubic-bezier(0.22,1,0.36,1) forwards, scEmblemFloat 3.2s ease-in-out 0.9s infinite; }
        .sc-hall-world-props { position:absolute;inset:0;pointer-events:none;z-index:6; }
        .sc-oasis-lantern { position:absolute;bottom:22%;width:64px;height:64px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(254,240,138,0.82),rgba(245,158,11,0.32) 48%,transparent 72%);mix-blend-mode:screen;animation:scLanternPulse 1.5s ease-in-out infinite alternate; }
        .sc-cosmic-dock-ring { position:absolute;bottom:14%;left:50%;transform:translateX(-50%);width:min(540px,82vw);height:54px;border-radius:50%;border:2px solid #22d3ee;box-shadow:0 0 26px rgba(34,211,238,0.65),inset 0 0 18px rgba(34,211,238,0.45);opacity:0.75; }
        .sc-magic-runes { position:absolute;bottom:12%;left:50%;transform:translateX(-50%);width:min(520px,80vw);height:48px;border-radius:50%;border:2px dashed #c084fc;box-shadow:0 0 28px rgba(192,132,252,0.65);opacity:0.75; }
        .sc-hall-podium-row { position:relative;z-index:14;display:flex;align-items:flex-end;justify-content:center;gap:clamp(4px,1.2vw,16px);width:min(660px,94%);margin-bottom:clamp(14px,3.2vh,32px); }
        .sc-hall-col { display:flex;flex-direction:column;align-items:center;min-width:0;flex:1;max-width:215px;opacity:0;will-change:transform,opacity;transform-origin:bottom center; }
        .sc-hall-col.tier-1 { margin-bottom:clamp(34px,5.6vh,54px);z-index:18; }
        .sc-hall-col.tier-2 { margin-bottom:clamp(14px,2.4vh,26px);z-index:16; }
        .sc-hall-col.tier-3 { margin-bottom:0;z-index:15; }
        .sc-hall-name { background:rgba(8,14,32,0.92);backdrop-filter:blur(10px);border:1.5px solid ${cfg.accent};color:#ffffff;padding:3px 13px;border-radius:999px;font-size:clamp(12px,1.35vw,15px);font-weight:900;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px;box-shadow:0 8px 22px rgba(0,0,0,0.65); }
        .sc-hall-sprite-wrap { position:relative;display:flex;align-items:flex-end;justify-content:center;overflow:visible; }
        .sc-hall-col.tier-1 .sc-hall-sprite-wrap { width:clamp(112px,14vw,176px);height:clamp(142px,25vh,215px); }
        .sc-hall-col.tier-2 .sc-hall-sprite-wrap { width:clamp(98px,12.5vw,152px);height:clamp(122px,21vh,186px); }
        .sc-hall-col.tier-3 .sc-hall-sprite-wrap { width:clamp(92px,11.5vw,144px);height:clamp(116px,19.5vh,174px); }
        .sc-hall-shadow { position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:64%;height:12px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,0.68),transparent 72%);pointer-events:none; }
        .sc-hall-plaque { margin-top:2px;width:min(176px,94%);background:${cfg.plaqueBg};backdrop-filter:blur(12px);border:1.5px solid ${cfg.accent};border-radius:12px;padding:5px 10px;display:flex;align-items:center;justify-content:space-between;gap:6px;box-shadow:0 12px 26px rgba(0,0,0,0.72),inset 0 1px 0 rgba(255,255,255,0.2); }
        .sc-hall-rank-chip { font-size:clamp(14px,1.5vw,18px);font-weight:900;color:${cfg.accent};font-variant-numeric:tabular-nums;white-space:nowrap; }
        .sc-hall-score-chip { font-size:clamp(12px,1.25vw,15px);font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap; }
        @media (max-width:680px) {
          .sc-hall-emblem svg { width:72px !important;height:72px !important; }
          .sc-hall-podium-row { gap:4px;margin-bottom:14px;width:98%; }
          .sc-hall-col.tier-1 { margin-bottom:26px; }
          .sc-hall-col.tier-2 { margin-bottom:10px; }
          .sc-hall-plaque { flex-direction:column;gap:1px;padding:4px 6px;border-radius:10px; }
          .sc-hall-name { padding:2px 8px;font-size:11px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sc-hall-bg-img, .sc-hall-col, .sc-hall-emblem, .sc-hall-path, .sc-oasis-lantern { animation:none !important;transition:none !important;opacity:1 !important;transform:none !important; }
        }
      </style>

      <div id="scHallRoot" class="sc-hall-root is-opening" data-hall-world="${esc(worldId)}">
        <div class="sc-hall-bg-wrap">
          <img class="sc-hall-bg-img" src="${esc(cfg.hallImg)}" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${esc(cfg.fallbackImg)}';}else{this.style.display='none';}" alt="">
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,22,0.52) 0%,rgba(5,9,22,0.08) 38%,rgba(5,9,22,0.22) 72%,rgba(5,9,22,0.78) 100%);"></div>
        </div>
        <canvas id="scHallFxCanvas" style="position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;"></canvas>
        <div class="sc-hall-letterbox top"></div>
        <div class="sc-hall-letterbox bot"></div>

        <header class="scorear-control-bar" style="position:relative;z-index:35;display:flex;align-items:center;justify-content:space-between;padding:8px 18px;gap:8px;flex-wrap:wrap;flex-shrink:0;">
          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.exitHall()" style="border-color:rgba(239,68,68,0.42);color:#fca5a5;">${ic('close', 13)} <span>إنهاء</span></button>
            <button type="button" id="scHallMuteBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARWorldHalls.toggleMute()">${ic(isMuted ? 'volumeOff' : 'volume', 14)}</button>
          </div>
          <span class="scorear-control-pill" style="border-color:${cfg.accent};color:#fff;font-weight:900;"><span>${esc(cfg.name)}</span></span>
          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" id="scHallSkipBtn" class="scorear-gear-btn" onclick="ScoreARWorldHalls.skipToFinal()" style="border-color:${cfg.accent};color:#fef08a;">${ic('zap', 13)} <span>تخطي العرض</span></button>
            <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.replayHall()">${ic('play', 13)} <span>إعادة العرض</span></button>
          </div>
        </header>

        <main class="sc-hall-stage">
          <div id="scHallPathGlow" class="sc-hall-path"></div>
          <div class="sc-hall-arch-halo"></div>
          ${buildWorldPropsHtml(worldId)}

          <div id="scHallOpeningBanner" class="sc-hall-opening-banner">
            <div style="display:inline-block;background:rgba(7,12,28,0.84);border:1px solid ${cfg.accent};color:${cfg.accent};padding:4px 18px;border-radius:999px;font-size:13px;font-weight:900;margin-bottom:8px;">${esc(quizTitle || 'تتويج الأبطال')}</div>
            <h2 style="margin:0;font-size:clamp(22px,3.6vw,38px);font-weight:900;color:#fff;text-shadow:0 6px 26px rgba(0,0,0,0.9);">${esc(cfg.name)}</h2>
            <p style="margin:4px 0 0;font-size:14px;font-weight:800;color:#e2e8f0;text-shadow:0 3px 12px rgba(0,0,0,0.9);">${esc(cfg.subtitle)}</p>
          </div>

          <div id="scHallEmblem" class="sc-hall-emblem">
            ${cfg.svgEmblem}
            <span style="background:rgba(7,12,28,0.9);border:1.5px solid ${cfg.accent};color:#fef08a;padding:3px 14px;border-radius:999px;font-size:12px;font-weight:900;box-shadow:0 6px 18px rgba(0,0,0,0.6);">${esc(cfg.emblemTitle)}</span>
          </div>

          ${slots.length ? `<div class="sc-hall-podium-row">
            ${slots.map(item => `
              <div id="scHallCol_${item.slot}" class="sc-hall-col ${item.cls}">
                <div class="sc-hall-name" title="${esc(item.p.name)}">${item.medal} ${esc(item.p.name || 'متسابق')}</div>
                <div class="sc-hall-sprite-wrap">
                  <div class="sc-hall-shadow"></div>
                  <div id="scHallSprite_${item.slot}" style="width:100%;height:100%;position:relative;z-index:2;"></div>
                </div>
                <div class="sc-hall-plaque">
                  <span class="sc-hall-rank-chip">#${item.p._rank}</span>
                  <span class="sc-hall-score-chip">${item.p.score || 0} نقطة</span>
                </div>
              </div>`).join('')}
          </div>` : `<div style="position:relative;z-index:18;margin-bottom:8%;background:rgba(8,14,32,0.92);border:1.5px solid ${cfg.accent};border-radius:20px;padding:24px 36px;text-align:center;color:#e2e8f0;font-weight:800;">لا توجد نتائج مسجلة لعرضها في هذه القاعة</div>`}
        </main>

        <footer id="scHallActions" class="scorear-control-bar" style="position:relative;z-index:35;display:none;align-items:center;justify-content:center;gap:10px;padding:8px 18px;flex-wrap:wrap;flex-shrink:0;">
          <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scHallFullRoster').style.display='block'">${ic('list', 14)} <span>الترتيب الكامل (${sorted.length})</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumCapture?.capturePodiumSnapshot?.(document.getElementById('scHallRoot'), ScoreARWorldHalls._getRoom(), ScoreARWorldHalls._getSorted())">${ic('camera', 14)} <span>صورة التتويج</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumCapture?.downloadAllTop3Certificates?.(ScoreARWorldHalls._getSorted(), '${esc(worldId)}')">${ic('award', 14)} <span>الشهادات</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARWorldHalls.replayHall()">${ic('play', 14)} <span>إعادة العرض</span></button>
        </footer>

        <div id="scHallFullRoster" style="display:none;position:fixed;inset:12% auto auto 50%;transform:translateX(-50%);width:min(680px,92vw);max-height:74vh;overflow-y:auto;background:rgba(8,14,32,0.97);border:1.5px solid ${cfg.accent};border-radius:20px;padding:18px;z-index:120;direction:rtl;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <b style="color:#fff;font-size:16px;">الترتيب النهائي الكامل (${sorted.length})</b>
            <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scHallFullRoster').style.display='none'">✕ إغلاق</button>
          </div>
          ${activeRanked.map(p => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.05);margin-bottom:6px;gap:10px;"><span style="color:#fff;font-weight:800;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">#${p._rank} · ${esc(p.name)}</span><b style="color:${cfg.accent};font-variant-numeric:tabular-nums;white-space:nowrap;">${p.score || 0} نقطة</b></div>`).join('')}
        </div>
      </div>`;

    if (!isReduced) startHallFxCanvas(document.getElementById('scHallFxCanvas'), worldId, cfg);
    if (isReduced || !top3.length) { crownNow(top3, cfg, false); return; }

    schedule(() => {
      const pathEl = document.getElementById('scHallPathGlow');
      if (pathEl) pathEl.style.opacity = '1';
      sfx('whoosh');
    }, 240);

    schedule(() => {
      document.getElementById('scHallRoot')?.classList.remove('is-opening');
      const b = document.getElementById('scHallOpeningBanner');
      if (b) b.style.opacity = '0';
    }, 1550);

    const revealOrder = [3, 2, 1].filter(r => Boolean(top3[r - 1]));
    revealOrder.forEach((slotNum, stepIdx) => {
      schedule(() => {
        currentStep = stepIdx + 1;
        revealSlot(slotNum, top3, cfg, false);
      }, 1700 + stepIdx * 1650);
    });

    const crownMs = 1700 + revealOrder.length * 1650 + 350;
    schedule(() => crownNow(top3, cfg, true), crownMs);
  }

  function advanceStep() {
    if (active3DCtrl?.advanceStep) { active3DCtrl.advanceStep(); return; }
    if (!activeRoom || !isActive()) return;
    const worldId = (activeRoom.world && activeRoom.world.id) ? activeRoom.world.id : (activeRoom.worldId || 'royal');
    const cfg = HALL_CONFIGS[worldId] || HALL_CONFIGS.royal;
    const top3 = activeRanked.slice(0, 3);
    const revealOrder = [3, 2, 1].filter(r => Boolean(top3[r - 1]));
    timers.forEach(id => clearTimeout(id));
    timers = [];
    document.getElementById('scHallRoot')?.classList.remove('is-opening');
    const b = document.getElementById('scHallOpeningBanner');
    if (b) b.style.opacity = '0';
    if (currentStep < revealOrder.length) {
      const slotNum = revealOrder[currentStep];
      currentStep++;
      revealSlot(slotNum, top3, cfg, false);
    } else {
      crownNow(top3, cfg, true);
    }
  }

  function skipToFinal() {
    if (active3DCtrl?.skipToFinal) { active3DCtrl.skipToFinal(); return; }
    if (!activeRoom) return;
    const worldId = (activeRoom.world && activeRoom.world.id) ? activeRoom.world.id : (activeRoom.worldId || 'royal');
    const cfg = HALL_CONFIGS[worldId] || HALL_CONFIGS.royal;
    crownNow(activeRanked.slice(0, 3), cfg, false);
  }
  function setCameraPreset(preset) { active3DCtrl?.setCameraPreset?.(preset); }
  function launchFirework() { active3DCtrl?.launchFirework?.(); }
  function triggerAudienceReaction(emoji, name) { active3DCtrl?.triggerAudienceReaction?.(emoji, name); }
  function capture3DSnapshot() {
    if (active3DCtrl?.capture3DSnapshot?.()) return;
    global.ScoreARPodiumCapture?.capturePodiumSnapshot?.(document.getElementById('scHallRoot'), activeRoom, activeSorted);
  }
  function replayHall() { if (activeStage && activeRoom) renderHallCeremony(activeStage, activeRoom, activeOnClose); }
  function exitHall() {
    cleanup();
    if (typeof activeOnClose === 'function') activeOnClose();
    else if (global.ScoreARQuizHost?.closeHostSession) global.ScoreARQuizHost.closeHostSession();
  }
  function toggleMute() {
    if (!global.ScoreARAudio?.toggleMute) return;
    const m = global.ScoreARAudio.toggleMute();
    const b = document.getElementById('scHallMuteBtn');
    if (b) b.innerHTML = ic(m ? 'volumeOff' : 'volume', 14);
  }

  global.ScoreARWorldHalls = {
    HALL_CONFIGS, renderHallCeremony, advanceStep, skipToFinal, replayHall, exitHall, toggleMute, cleanup, isActive,
    setCameraPreset, launchFirework, triggerAudienceReaction, capture3DSnapshot,
    _get3DState: () => active3DCtrl?.getDebugState?.() || null,
    _getRoom: () => activeRoom, _getSorted: () => activeSorted
  };
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARWorldHalls = global.ScoreARWorldHalls; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ScoreARWorldHalls;
})(typeof window !== 'undefined' ? window : globalThis);
