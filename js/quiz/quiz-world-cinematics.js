/**
 * ScoreAR World Entrance Cinematic & Floor Path Parade Engine (quiz-world-cinematics.js)
 * - mountPathParade: Grounded 60FPS rAF waypoint hero parade embedded inside Stage 2 of the
 *   restored 3-stage Pre-Contest Intro (zero random jumping, direction-matched V3 sprites).
 * - playEntranceFilm: Standalone 60FPS World Entrance Cutscene (for podium.html preview)
 *   with real quiz title resolution, smooth waypoint march/run/fly, synchronized wave, and cleanup.
 * Strictly Rule 7 Compliant (< 310 lines).
 */
(function (global) {
  'use strict';

  const WORLD_FILMS = {
    royal: {
      name: 'القصر الملكي', sub: 'بوابة الأوسمة الأندلسية',
      accent: '#fbbf24', glow: 'rgba(251,191,36,0.55)', bgTint: '#081229',
      hallImg: 'assets/halls/royal-hall.jpg', fallbackImg: 'assets/worlds/royal/lobby.jpg',
      marchMove: 'walk', speed: 122, particleColors: ['#fef08a', '#fbbf24', '#ffffff'], badge: '👑'
    },
    oasis: {
      name: 'الواحة العربية', sub: 'طريق الفوانيس والنخيل',
      accent: '#34d399', glow: 'rgba(251,191,36,0.48)', bgTint: '#071f17',
      hallImg: 'assets/halls/oasis-hall.jpg', fallbackImg: 'assets/worlds/oasis/lobby.jpg',
      marchMove: 'walk', speed: 118, particleColors: ['#fde047', '#f59e0b', '#6ee7b7'], badge: '🏮'
    },
    cosmic: {
      name: 'محطة الفضاء', sub: 'بوابة المدار الكوني',
      accent: '#22d3ee', glow: 'rgba(34,211,238,0.52)', bgTint: '#050b1c',
      hallImg: 'assets/halls/cosmic-hall.jpg', fallbackImg: 'assets/worlds/cosmic/lobby.jpg',
      marchMove: 'fly', speed: 138, particleColors: ['#38bdf8', '#22d3ee', '#e0f2fe'], badge: '🚀'
    },
    treasure: {
      name: 'جزيرة الكنز', sub: 'رصيف المغامرة والذهب',
      accent: '#fbbf24', glow: 'rgba(245,158,11,0.52)', bgTint: '#1a0e05',
      hallImg: 'assets/halls/treasure-hall.jpg', fallbackImg: 'assets/worlds/treasure/lobby.jpg',
      marchMove: 'run', speed: 155, particleColors: ['#fde047', '#f59e0b', '#fed7aa'], badge: '🧭'
    },
    stadium: {
      name: 'استاد الأبطال', sub: 'مضمار التحدي والكشافات',
      accent: '#38bdf8', glow: 'rgba(56,189,248,0.54)', bgTint: '#07142e',
      hallImg: 'assets/halls/stadium-hall.jpg', fallbackImg: 'assets/worlds/stadium/lobby.jpg',
      marchMove: 'run', speed: 162, particleColors: ['#ffffff', '#38bdf8', '#fde047'], badge: '🏆'
    },
    magic: {
      name: 'مملكة السحر', sub: 'بوابة القلعة العائمة',
      accent: '#c084fc', glow: 'rgba(192,132,252,0.55)', bgTint: '#14082b',
      hallImg: 'assets/halls/magic-hall.jpg', fallbackImg: 'assets/worlds/magic/lobby.jpg',
      marchMove: 'fly', speed: 132, particleColors: ['#e9d5ff', '#c084fc', '#38bdf8'], badge: '💎'
    }
  };

  let timers = [], fxRafId = null, pathRafId = null, sprites = [], finished = false, paradeToken = 0;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const ic = (n, sz = 14) => (global.ScoreARUI?.icon) ? global.ScoreARUI.icon(n, { size: sz }) : '';
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };

  function resolveTitle(currentRoom, explicitTitle) {
    if (global.ScoreARQuizHostView?.resolveRealQuizTitle) {
      return global.ScoreARQuizHostView.resolveRealQuizTitle(currentRoom, explicitTitle);
    }
    const GENERIC = 'كأس التفوق — مسابقة سكور آر التفاعلية';
    const clean = v => (typeof v === 'string' ? v.trim() : '');
    const cands = [
      clean(explicitTitle),
      clean(currentRoom?.quizTitle),
      clean(global.activeQuizTitle),
      (() => { try { return clean(sessionStorage.getItem('scorear_active_quiz_title')); } catch { return ''; } })()
    ];
    return cands.find(t => t && t !== GENERIC) || 'مسابقة سكور آر التفاعلية';
  }

  function stopEntranceFilm() {
    paradeToken += 1;
    timers.forEach(t => clearTimeout(t));
    timers = [];
    if (fxRafId) { cancelAnimationFrame(fxRafId); fxRafId = null; }
    if (pathRafId) { cancelAnimationFrame(pathRafId); pathRafId = null; }
    sprites.forEach(sp => { try { sp?.destroy?.(); } catch {} });
    sprites = [];
  }

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function pickCast(currentRoom) {
    const real = (currentRoom?.players || []).slice(0, 5);
    return real.length ? real : [
      { id: 'c1', name: 'زياد', avatarId: 'char_01' },
      { id: 'c2', name: 'نور', avatarId: 'char_02' },
      { id: 'c3', name: 'سليم', avatarId: 'char_03' }
    ];
  }

  function startParticles(canvas, colors, worldId) {
    const ctx = canvas?.getContext?.('2d');
    if (!ctx) return;
    let w = canvas.width = canvas.offsetWidth || 1280;
    let h = canvas.height = canvas.offsetHeight || 720;
    const motes = Array.from({ length: 36 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.7, vy: -(0.35 + Math.random() * 1.0),
      r: 1.6 + Math.random() * 3.0, a: 0.3 + Math.random() * 0.55,
      col: colors[Math.floor(Math.random() * colors.length)]
    }));
    let phase = 0;
    function tick() {
      if (!canvas.isConnected) { fxRafId = null; return; }
      w = canvas.width = canvas.offsetWidth || 1280;
      h = canvas.height = canvas.offsetHeight || 720;
      ctx.clearRect(0, 0, w, h);
      phase += 0.02;
      ctx.save();
      const rayGrad = ctx.createLinearGradient(w * 0.5, 0, w * 0.5, h * 0.85);
      const tint = worldId === 'cosmic' ? 'rgba(34,211,238,0.20)' : (worldId === 'magic' ? 'rgba(192,132,252,0.20)' : 'rgba(251,191,36,0.18)');
      rayGrad.addColorStop(0, tint);
      rayGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rayGrad;
      const sway = Math.sin(phase) * w * 0.025;
      ctx.beginPath();
      ctx.moveTo(w * 0.37, 0); ctx.lineTo(w * 0.63, 0);
      ctx.lineTo(w * 0.80 + sway, h); ctx.lineTo(w * 0.20 + sway, h);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy;
        if (m.y < -12) { m.y = h + 10; m.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = m.a * (0.65 + 0.35 * Math.sin(phase * 2 + m.x));
        ctx.fillStyle = m.col; ctx.shadowColor = m.col; ctx.shadowBlur = 9;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      fxRafId = requestAnimationFrame(tick);
    }
    fxRafId = requestAnimationFrame(tick);
  }

  /**
   * Grounded 60FPS Waypoint Path Parade (ZERO random jumping, ZERO idle sliding!)
   * Preloads & awaits V3 locomotion atlases before moving, then marches at stride-matched
   * constant velocity, settles calmly, performs ONE synchronized wave greeting, then holds idle.
   */
  function mountPathParade(containerEl, currentRoom, worldId, opts = {}) {
    if (!containerEl) return [];
    if (pathRafId) { cancelAnimationFrame(pathRafId); pathRafId = null; }
    const myToken = ++paradeToken;
    const wid = worldId || currentRoom?.world?.id || currentRoom?.worldId || 'royal';
    const cfg = WORLD_FILMS[wid] || WORLD_FILMS.royal;
    const cast = pickCast(currentRoom);
    const compact = Boolean(opts.compact !== false);
    const spriteW = compact ? 104 : 132;
    const spriteH = compact ? 136 : 172;
    const stageW = Math.max(360, containerEl.clientWidth || 920);
    const reduced = Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

    const neededMoves = cfg.marchMove === 'fly'
      ? ['fly', 'land', 'wave', 'idle']
      : (cfg.marchMove === 'run' ? ['runRight', 'runLeft', 'wave', 'idle'] : ['walkRight', 'walkLeft', 'wave', 'idle']);
    global.ScoreARMotionV3?.preloadCharacters?.(cast, neededMoves);

    containerEl.innerHTML = `
      <div class="sc-parade-floor" style="position:relative;width:100%;height:100%;min-height:${compact ? 176 : 225}px;overflow:hidden;direction:ltr;">
        <div style="position:absolute;bottom:8px;left:6%;right:6%;height:18px;border-radius:50%;background:radial-gradient(ellipse,${cfg.glow.replace(/[\d.]+\)$/, '0.32)')},transparent 72%);pointer-events:none;"></div>
        ${cast.map((p, idx) => `
          <div id="scParadeActor_${idx}" class="sc-parade-actor" style="position:absolute;bottom:14px;left:50%;display:flex;flex-direction:column;align-items:center;will-change:transform;transform-origin:bottom center;opacity:0;">
            <span style="background:rgba(7,11,24,0.88);border:1px solid ${cfg.accent};color:#fff;padding:2px 10px;border-radius:999px;font-size:${compact ? 11 : 12}px;font-weight:900;max-width:112px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px;box-shadow:0 6px 14px rgba(0,0,0,0.6);">${esc(p.name || 'بطل')}</span>
            <div style="position:relative;width:${spriteW}px;height:${spriteH}px;display:flex;align-items:flex-end;justify-content:center;">
              <span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:62%;height:10px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,0.62),transparent 72%);"></span>
              <div id="scParadeSprite_${idx}" style="width:100%;height:100%;position:relative;z-index:2;"></div>
            </div>
          </div>`).join('')}
      </div>`;

    const n = cast.length;
    const span = Math.min(stageW * 0.72, (n - 1) * (compact ? 132 : 162));
    const speedPx = cfg.marchMove === 'run' ? (compact ? 156 : 182) : (compact ? 104 : 122);

    const actors = cast.map((p, idx) => {
      const ratio = n === 1 ? 0 : (idx / (n - 1)) - 0.5;
      const targetX = ratio * span;
      const depthNorm = Math.abs(ratio) * 2; // 0 at center, 1 at outer
      const targetY = -Math.round(depthNorm * 14);
      const targetScale = 1 - depthNorm * 0.08;
      const fromLeft = ratio < 0 || (ratio === 0 && idx % 2 === 0);
      const isFly = cfg.marchMove === 'fly';
      const travelDist = cfg.marchMove === 'run'
        ? (compact ? (260 + (idx % 3) * 36) : (320 + (idx % 3) * 44))
        : (compact ? (210 + (idx % 3) * 32) : (260 + (idx % 3) * 38));
      const edgeLimit = stageW * 0.54 + 60;
      const rawStartX = fromLeft ? (targetX - travelDist) : (targetX + travelDist);
      const startX = isFly
        ? targetX + (fromLeft ? -95 : 95)
        : Math.max(-edgeLimit, Math.min(edgeLimit, rawStartX));
      const startY = isFly ? -130 - (idx % 2) * 22 : targetY;
      const moveAction = isFly ? 'fly'
        : (cfg.marchMove === 'run' ? (startX < targetX ? 'runRight' : 'runLeft') : (startX < targetX ? 'walkRight' : 'walkLeft'));
      const duration = isFly ? 1950 : Math.max(700, Math.round((Math.abs(targetX - startX) / speedPx) * 1000));

      const box = containerEl.querySelector(`#scParadeSprite_${idx}`);
      const inst = (global.ScoreARMotionV3?.mount && box)
        ? global.ScoreARMotionV3.mount(box, p.avatarId || p.characterId || `char_0${(idx % 6) + 1}`, reduced ? 'idle' : moveAction, { width: spriteW, height: spriteH, loop: !reduced })
        : null;
      if (inst) sprites.push(inst);

      return {
        el: containerEl.querySelector(`#scParadeActor_${idx}`),
        inst, idx, isFly,
        startX, startY, targetX, targetY, targetScale,
        delay: idx * 200,
        duration,
        settled: false, waved: false
      };
    });

    if (reduced) {
      actors.forEach(a => {
        if (!a.el) return;
        a.el.style.opacity = '1';
        a.el.style.zIndex = String(20 + Math.round(a.targetY + 20));
        a.el.style.transform = `translate3d(calc(-50% + ${a.targetX.toFixed(1)}px), ${a.targetY.toFixed(1)}px, 0) scale(${a.targetScale.toFixed(3)})`;
      });
      if (typeof opts.onArrived === 'function') opts.onArrived();
      return actors;
    }

    const readyList = actors.map(a => a.inst?.whenReady?.() || a.inst?.ready || Promise.resolve());
    Promise.race([
      Promise.allSettled(readyList),
      new Promise(r => schedule(r, 2000))
    ]).then(() => {
      if (myToken !== paradeToken || !containerEl.isConnected) return;

      let lastNow = null, elapsed = 0, allSettledAt = null;
      function tick(now) {
        if (myToken !== paradeToken || !containerEl.isConnected) { pathRafId = null; return; }
        if (lastNow === null) lastNow = now;
        elapsed += Math.min(160, Math.max(0, now - lastNow));
        lastNow = now;
        let everyoneArrived = true;

        for (const a of actors) {
          if (!a.el) continue;
          const localT = elapsed - a.delay;
          if (localT <= 0) {
            everyoneArrived = false;
            a.el.style.opacity = '0';
            continue;
          }
          const p = Math.min(1, localT / a.duration);
          // Stride-matched linear velocity for ground walk/run with gentle final 10% braking
          const ease = a.isFly
            ? (1 - Math.pow(1 - p, 3))
            : (p < 0.90 ? (p / 0.90) * 0.94 : 0.94 + (1 - Math.pow(1 - (p - 0.90) / 0.10, 2)) * 0.06);
          const cx = a.startX + (a.targetX - a.startX) * ease;
          const bobY = (!a.isFly && p < 1) ? (-Math.abs(Math.sin((localT / 280) * Math.PI)) * 3.5) : 0;
          const cy = a.isFly
            ? (a.startY + (a.targetY - a.startY) * ease - Math.sin(p * Math.PI) * 18)
            : (a.targetY + bobY);
          const sc = a.isFly ? (0.72 + (a.targetScale - 0.72) * ease) : a.targetScale;

          a.el.style.opacity = String(Math.min(1, localT / 220));
          a.el.style.zIndex = String(20 + Math.round(cy + 24));
          a.el.style.transform = `translate3d(calc(-50% + ${cx.toFixed(1)}px), ${cy.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;

          if (p < 1) {
            everyoneArrived = false;
          } else if (!a.settled) {
            a.settled = true;
            a.el.setAttribute('data-arrived', '1');
            if (a.inst) {
              if (a.isFly) {
                a.inst.setAction('land', { loop: false });
                schedule(() => { if (myToken === paradeToken) a.inst?.setAction?.('idle', { loop: true }); }, 360);
              } else {
                a.inst.setAction('idle', { loop: true });
              }
            }
          }
        }

        if (everyoneArrived) {
          if (!allSettledAt) {
            allSettledAt = now;
            schedule(() => {
              if (myToken !== paradeToken) return;
              sfx('pop');
              actors.forEach(a => a.inst?.setAction?.('wave', { loop: true }));
            }, 350);
            schedule(() => {
              if (myToken !== paradeToken) return;
              actors.forEach(a => a.inst?.setAction?.('idle', { loop: true }));
              if (typeof opts.onArrived === 'function') opts.onArrived();
            }, 1850);
          }
          pathRafId = null;
          return;
        }
        pathRafId = requestAnimationFrame(tick);
      }
      pathRafId = requestAnimationFrame(tick);
    });

    return actors;
  }

  function playEntranceFilm(stage, currentRoom, quizTitle, totalQuestions, onDone) {
    if (!stage) { if (typeof onDone === 'function') onDone(); return; }
    stopEntranceFilm();
    finished = false;

    const finishNow = () => {
      if (finished) return;
      finished = true;
      stopEntranceFilm();
      if (typeof onDone === 'function') onDone();
    };
    global._skipScoreARIntro = finishNow;

    const reduced = Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    const wid = currentRoom?.world?.id || currentRoom?.worldId || 'royal';
    const cfg = WORLD_FILMS[wid] || WORLD_FILMS.royal;
    const title = resolveTitle(currentRoom, quizTitle);
    const qTotal = Number(totalQuestions) || 5;
    const cast = pickCast(currentRoom);

    if (reduced) {
      stage.innerHTML = `<div style="position:fixed;inset:0;background:${cfg.bgTint};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;direction:rtl;font-family:Cairo,Tajawal,sans-serif;z-index:100;padding:20px;text-align:center;">
        <span style="border:1px solid ${cfg.accent};color:${cfg.accent};padding:5px 16px;border-radius:999px;font-weight:900;font-size:13px;">${cfg.badge} ${esc(cfg.name)} · ${qTotal} أسئلة</span>
        <h1 style="margin:0;font-size:clamp(24px,4vw,42px);color:#fff;font-weight:900;">${esc(title)}</h1>
        <button type="button" class="btn launch-primary" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="padding:10px 28px;border-radius:12px;font-weight:900;">ابدأ الآن</button>
      </div>`;
      schedule(finishNow, 1200);
      return;
    }

    const isMuted = Boolean(global.ScoreARAudio?.isMuted?.());
    stage.innerHTML = `
      <style>
        @keyframes scFilmPan { 0%{transform:scale(1.12) translateY(1.5%)} 100%{transform:scale(1.02) translateY(0)} }
        @keyframes scTitleRise { 0%{opacity:0;transform:translateY(24px) scale(0.94)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes scCountPop { 0%{opacity:0;transform:scale(0.5)} 45%{opacity:1;transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
        .sc-film-root { position:fixed;inset:0;z-index:110;background:${cfg.bgTint};overflow:hidden;direction:rtl;font-family:Cairo,Tajawal,sans-serif;display:flex;flex-direction:column; }
        .sc-film-bg { position:absolute;inset:0;animation:scFilmPan 6.8s cubic-bezier(0.22,1,0.36,1) forwards; }
        .sc-film-bar { position:relative;height:clamp(38px,6.5vh,52px);background:#050711;z-index:30;flex-shrink:0;display:flex;align-items:center;padding:0 18px; }
        .sc-film-bar.top { border-bottom:1px solid ${cfg.accent}44;justify-content:space-between; }
        .sc-film-bar.bot { border-top:1px solid ${cfg.accent}44;justify-content:center;color:#cbd5e1;font-size:12px;font-weight:800; }
        .sc-film-main { position:relative;flex:1;min-height:0;z-index:18;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:18px 20px 10px; }
        .sc-film-countdown { position:absolute;inset:0;z-index:26;display:none;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(8,12,26,0.45),rgba(4,7,18,0.84)); }
        .sc-film-count-num { width:142px;height:142px;border-radius:50%;display:grid;place-items:center;font-size:68px;font-weight:900;color:#fff;font-family:Montserrat,Cairo,sans-serif;border:3px solid ${cfg.accent};background:radial-gradient(circle,${cfg.accent}44,rgba(9,13,28,0.92));box-shadow:0 0 55px ${cfg.glow};animation:scCountPop 0.55s cubic-bezier(0.22,1,0.36,1); }
      </style>
      <div id="scEntranceFilmRoot" class="sc-film-root" data-film-world="${esc(wid)}">
        <div class="sc-film-bg">
          <img src="${esc(cfg.hallImg)}" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${esc(cfg.fallbackImg)}';}else{this.style.display='none';}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.74) saturate(1.1);">
          <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,transparent 14%,rgba(4,8,20,0.8) 100%);"></div>
        </div>
        <canvas id="scEntranceFxCanvas" style="position:absolute;inset:0;width:100%;height:100%;z-index:8;pointer-events:none;"></canvas>
        <div class="sc-film-bar top">
          <span style="display:inline-flex;align-items:center;gap:6px;color:${cfg.accent};font-weight:900;font-size:13px;">${cfg.badge} <span>${esc(cfg.name)} · ${esc(cfg.sub)}</span></span>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" id="scFilmMuteBtn" class="scorear-gear-btn" onclick="ScoreARWorldCinematics.toggleMute()" style="padding:4px 10px;font-size:11.5px;">${ic(isMuted ? 'volumeOff' : 'volume', 13)}</button>
            <button type="button" id="scFilmSkipBtn" class="scorear-gear-btn" onclick="window._skipScoreARIntro && window._skipScoreARIntro()" style="padding:5px 14px;font-size:12px;border-color:${cfg.accent};color:#fef08a;">${ic('skipForward', 13)} <span>تخطي الفيلم</span></button>
          </div>
        </div>
        <div class="sc-film-main">
          <div id="scFilmTitleCard" style="text-align:center;width:min(860px,94%);animation:scTitleRise 0.75s cubic-bezier(0.22,1,0.36,1) both;transition:opacity 0.5s ease,transform 0.5s ease;">
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(8,12,28,0.84);border:1px solid ${cfg.accent};color:${cfg.accent};padding:4px 16px;border-radius:999px;font-size:12.5px;font-weight:900;margin-bottom:8px;">
              <span>موكب افتتاح المسابقة</span> · <span>${qTotal} أسئلة تفاعلية</span>
            </div>
            <h1 style="margin:0;font-size:clamp(24px,4vw,42px);font-weight:900;color:#ffffff;text-shadow:0 8px 28px rgba(0,0,0,0.88);line-height:1.3;">${esc(title)}</h1>
            <div id="scFilmSubCaption" style="margin-top:6px;font-size:14.5px;font-weight:800;color:#e2e8f0;text-shadow:0 3px 12px rgba(0,0,0,0.9);">الأبطال يتقدمون عبر مسار القاعة...</div>
          </div>
          <div id="scFilmParadeStage" style="position:relative;width:min(1060px,96%);flex:1;min-height:225px;overflow:hidden;pointer-events:none;"></div>
        </div>
        <div id="scFilmCountdown" class="sc-film-countdown">
          <div style="font-size:20px;font-weight:900;color:${cfg.accent};margin-bottom:14px;">استعدوا يا أبطال ${esc(cfg.name)}!</div>
          <div id="scFilmCountNum" class="sc-film-count-num">3</div>
        </div>
        <div class="sc-film-bar bot">
          <span>موكب أبطال ScoreAR · ${cast.length} أبطال في ساحة ${esc(cfg.name)}</span>
        </div>
      </div>`;

    let countdownStarted = false;
    function startCountdown() {
      if (countdownStarted || finished) return;
      countdownStarted = true;
      const tc = document.getElementById('scFilmTitleCard');
      if (tc) { tc.style.opacity = '0'; tc.style.transform = 'translateY(-16px)'; }
      const cd = document.getElementById('scFilmCountdown');
      if (cd) cd.style.display = 'flex';
      sfx('tick');
      schedule(() => {
        const num = document.getElementById('scFilmCountNum');
        if (num) { num.textContent = '2'; num.style.animation = 'none'; void num.offsetWidth; num.style.animation = 'scCountPop 0.5s ease'; }
        sfx('tick');
      }, 850);
      schedule(() => {
        const num = document.getElementById('scFilmCountNum');
        if (num) { num.textContent = '1'; num.style.animation = 'none'; void num.offsetWidth; num.style.animation = 'scCountPop 0.5s ease'; }
        sfx('tick');
      }, 1700);
      schedule(() => finishNow(), 2550);
    }

    startParticles(document.getElementById('scEntranceFxCanvas'), cfg.particleColors, wid);
    sfx('reveal');
    mountPathParade(document.getElementById('scFilmParadeStage'), currentRoom, wid, {
      compact: false,
      onArrived: () => {
        const cap = document.getElementById('scFilmSubCaption');
        if (cap) cap.textContent = 'الأبطال جاهزون في مواقعهم — تبدأ المنافسة الآن!';
        schedule(startCountdown, 1400);
      }
    });
    // Fallback safety timer if sprite preload takes long so entrance never hangs
    schedule(startCountdown, 8500);
  }

  function toggleMute() {
    if (!global.ScoreARAudio?.toggleMute) return;
    const m = global.ScoreARAudio.toggleMute();
    const b = document.getElementById('scFilmMuteBtn');
    if (b) b.innerHTML = ic(m ? 'volumeOff' : 'volume', 13);
  }

  global.ScoreARWorldCinematics = { WORLD_FILMS, mountPathParade, playEntranceFilm, stopEntranceFilm, toggleMute };
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARWorldCinematics = global.ScoreARWorldCinematics; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ScoreARWorldCinematics;
})(typeof window !== 'undefined' ? window : globalThis);
