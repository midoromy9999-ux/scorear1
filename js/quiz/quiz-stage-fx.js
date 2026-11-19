/**
 * ScoreAR Studio-Grade Stage FX & Card Battle Clash Visuals (quiz-stage-fx.js)
 * Phase 3 Video-Game Layer: Student Hero Stunts + Arcade Card Duel VS HUD, 3-Layer Lasers, Ice Cage & Shield Dome.
 * Strictly Rule 7 Compliant (< 350 lines).
 */
(function (global) {
  'use strict';

  const MOVE_MAP = {
    '🦘': { kind: 'jump',  label: '🦘 قفزة نصر!', anim: 'scFxJump 0.68s cubic-bezier(0.22,1,0.36,1)', color: '#38bdf8', pose: 'celebrate' },
    '👋': { kind: 'wave',  label: '👋 تحية!',     anim: 'scFxWave 0.72s ease-in-out',                color: '#c084fc', pose: 'celebrate' },
    '🔥': { kind: 'fire',  label: '🔥 حماااس!',   anim: 'scFxFire 0.78s ease-out',                   color: '#f97316', pose: 'run' },
    '👏': { kind: 'clap',  label: '👏 تصفيق!',    anim: 'scFxClap 0.65s ease-in-out',                color: '#34d399', pose: 'celebrate' },
    '❤️': { kind: 'heart', label: '❤️ محبة!',     anim: 'scFxJump 0.64s ease-out',                   color: '#f472b6', pose: 'celebrate' },
    '🎉': { kind: 'party', label: '🎉 احتفال!',   anim: 'scFxJump 0.72s cubic-bezier(0.22,1,0.36,1)', color: '#fbbf24', pose: 'celebrate' }
  };

  const CARD_THEMES = {
    PIN_STUDENT:     { icon: '❄️', label: 'قذيفة التجميد!',   color: '#38bdf8', trail: '#bae6fd', img: 'assets/cards/card_pin_student.jpg', self: false },
    MINUS_50:        { icon: '💥', label: 'قذيفة الخصم -50!', color: '#ef4444', trail: '#fca5a5', img: 'assets/cards/card_minus_50.jpg', self: false },
    POINT_LEECH:     { icon: '🩸', label: 'سارق النقاط!',     color: '#f43f5e', trail: '#fda4af', img: 'assets/cards/card_point_leech.jpg', self: false },
    SWAP_STUDENT:    { icon: '🔄', label: 'تبديل المراكز!',   color: '#c084fc', trail: '#e9d5ff', img: 'assets/cards/card_swap_student.jpg', self: false, dual: true },
    SCREEN_FOG:      { icon: '💨', label: 'ضباب الرؤية!',     color: '#94a3b8', trail: '#cbd5e1', img: 'assets/cards/card_screen_fog.jpg', self: false },
    TIME_SLICER:     { icon: '⏳', label: 'مقص الوقت!',       color: '#f59e0b', trail: '#fde68a', img: 'assets/cards/card_time_slicer.jpg', self: false },
    BLOCK_DRAW:      { icon: '🚫', label: 'مانع السحب!',      color: '#fb923c', trail: '#fed7aa', img: 'assets/cards/card_block_draw.jpg', self: false },
    PLUS_50:         { icon: '✨', label: '+50 دفعة قوة!',   color: '#34d399', img: 'assets/cards/card_plus_50.jpg', self: true },
    MULTIPLIER_2X:   { icon: '⚡', label: 'مضاعف 2X!',        color: '#fbbf24', img: 'assets/cards/card_multiplier_2x.jpg', self: true },
    FREE_GIFT:       { icon: '🎁', label: '+75 هدية مجانية!', color: '#22d3ee', img: 'assets/cards/card_free_gift.jpg', self: true },
    SCORE_EQUALIZER: { icon: '⚖️', label: 'معادل النقاط!',    color: '#a855f7', img: 'assets/cards/card_equalizer.jpg', self: true },
    ERASER_50_50:    { icon: '✂️', label: 'حاذف 50/50!',     color: '#60a5fa', img: 'assets/cards/card_eraser.jpg', self: true },
    DRAW_ALL:        { icon: '🎒', label: 'السحب الشامل!',    color: '#fbbf24', img: 'assets/cards/card_draw_all.jpg', self: true }
  };

  let canvas = null, ctx = null, rafId = null, hostRoot = null, stageObserver = null, lastTs = 0;
  let particles = [], bolts = [], rings = [];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function isMotionOff() {
    const paused = typeof document !== 'undefined' && document.documentElement?.classList?.contains('characters-paused');
    return paused || Boolean(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  }
  function injectStyles() {
    if (typeof document === 'undefined' || document.getElementById('scorearStageFxStyles')) return;
    const s = document.createElement('style'); s.id = 'scorearStageFxStyles';
    s.textContent = `@keyframes scFxJump { 0%,100%{transform:translateY(0) scale(1)} 35%{transform:translateY(-44px) scale(1.12) rotate(-6deg)} 70%{transform:translateY(5px) scale(1.08,0.9)} }
      @keyframes scFxWave { 0%,100%{transform:rotate(0) scale(1)} 25%{transform:rotate(-13deg) translateY(-10px) scale(1.08)} 55%{transform:rotate(12deg) translateY(-12px) scale(1.08)} 80%{transform:rotate(-6deg)} }
      @keyframes scFxFire { 0%,100%{transform:scale(1);filter:none} 35%{transform:translateY(-18px) scale(1.16);filter:drop-shadow(0 0 22px #f97316) brightness(1.3)} 70%{transform:translateY(-8px) scale(1.09);filter:drop-shadow(0 0 14px #fbbf24)} }
      @keyframes scFxClap { 0%,100%{transform:scale(1)} 25%,65%{transform:translateY(-14px) scale(1.12,0.92)} 45%,85%{transform:translateY(0) scale(0.95,1.08)} }
      @keyframes scFxEmotePop { 0%{opacity:0;transform:translate(-50%,10px) scale(0.6)} 18%{opacity:1;transform:translate(-50%,-8px) scale(1.08)} 82%{opacity:1;transform:translate(-50%,-18px) scale(1)} 100%{opacity:0;transform:translate(-50%,-32px) scale(0.9)} }
      @keyframes scFxHitShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-9px) rotate(-4deg)} 50%{transform:translateX(9px) rotate(4deg)} 80%{transform:translateX(-4px)} }
      @keyframes scDuelSlideIn { 0%{opacity:0;transform:translate(-50%,-22px) scale(0.84)} 15%,85%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(-50%,-16px) scale(0.92)} }
      .sc-fx-ice-cage { position:absolute;inset:18px 8px 4px;background:linear-gradient(160deg,rgba(186,230,253,0.45),rgba(14,165,233,0.28));border:2px solid #7dd3fc;border-radius:18px;box-shadow:0 0 26px rgba(56,189,248,0.85),inset 0 0 18px rgba(255,255,255,0.65);clip-path:polygon(14% 0%,86% 0%,100% 22%,94% 100%,6% 100%,0% 22%);pointer-events:none;z-index:22; }
      .sc-fx-shield-dome { position:absolute;inset:8px 0 0;border-radius:50% 50% 16px 16px;background:radial-gradient(circle at 50% 35%,rgba(56,189,248,0.18),rgba(251,191,36,0.36));border:2.5px solid #fde047;box-shadow:0 0 32px rgba(251,191,36,0.9),inset 0 0 20px rgba(56,189,248,0.6);pointer-events:none;z-index:22; }
      @media (prefers-reduced-motion: reduce) { .sc-fx-anim-active { animation: none !important; } }`;
    (document.head || document.documentElement).appendChild(s);
  }

  function getHostStage() {
    if (typeof document === 'undefined') return null;
    const pod = document.getElementById('podiumStageRoot');
    if (pod && pod.offsetParent !== null) return pod;
    const h = document.getElementById('scorearHostStage');
    return (h && h.style.display !== 'none') ? h : (pod || null);
  }

  function ensureCanvas() {
    const root = getHostStage();
    if (!root || typeof document === 'undefined') return null;
    hostRoot = root;
    let c = document.getElementById('scorearStageFxCanvas');
    if (!c || c.parentElement !== root) {
      if (c) c.remove();
      c = document.createElement('canvas');
      c.id = 'scorearStageFxCanvas';
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:145;';
      root.appendChild(c);
    }
    canvas = c;
    ctx = typeof c.getContext === 'function' ? c.getContext('2d') : null;
    const hs = document.getElementById('scorearHostStage');
    if (hs && typeof MutationObserver !== 'undefined' && !stageObserver) {
      stageObserver = new MutationObserver(() => { if (hs.style.display === 'none') stop(); });
      stageObserver.observe(hs, { attributes: true, attributeFilter: ['style'] });
    }
    return c;
  }

  function spawnBurst(x, y, color, count = 20, speedScale = 1) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = (2.0 + Math.random() * 4.8) * speedScale;
      particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1.2, r: 3.5 + Math.random() * 4.5, color: i % 3 === 0 ? '#fef08a' : color, life: 1, decay: 0.022 + Math.random() * 0.016, gravity: 0.09 });
    }
    rings.push({ x, y, r: 10, maxR: 74 * speedScale, color, life: 1 });
  }

  function showBubbleOnTarget(anchorEl, text, color) {
    if (!anchorEl || typeof document === 'undefined') return;
    if (typeof getComputedStyle === 'function' && getComputedStyle(anchorEl).position === 'static') anchorEl.style.position = 'relative';
    anchorEl.querySelectorAll('.sc-stage-emote-pill').forEach(x => x.remove());
    const el = document.createElement('div');
    el.className = 'sc-stage-emote-pill';
    el.style.cssText = `position:absolute;top:-26px;left:50%;z-index:160;background:rgba(13,15,34,0.96);border:1.5px solid ${color};color:#fff;padding:3px 11px;border-radius:999px;font-size:12px;font-weight:900;white-space:nowrap;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,0.65),0 0 14px ${color}80;animation:scFxEmotePop 1.55s ease-out forwards;`;
    el.textContent = text;
    anchorEl.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  function applyTargetVisualEffect(targetEl, kind) {
    if (!targetEl || typeof document === 'undefined') return;
    const fig = targetEl.querySelector('.host-lobby-hero-figure, .char-procedural-rig') || targetEl;
    fig.querySelectorAll('.sc-fx-ice-cage, .sc-fx-shield-dome').forEach(e => e.remove());
    const overlay = document.createElement('div');
    overlay.className = kind === 'ice' ? 'sc-fx-ice-cage' : 'sc-fx-shield-dome';
    fig.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1800);
  }

  function showCardDuelHud(ev, spec, isBlocked, isReflected) {
    const root = getHostStage();
    if (!root || typeof document === 'undefined') return;
    document.getElementById('scCardBattleClashHud')?.remove();
    const sAv = ev.sourcePlayer?.avatarId || 'char_01', tAv = ev.targetPlayer?.avatarId || 'char_02';
    const cardImg = ev.card?.img || spec.img || 'assets/cards/card_pin_student.jpg';
    const statusLbl = isBlocked ? '🛡️ صُدَّ بالدرع!' : (isReflected ? '🪞 ارتد بمرآة القاضي!' : spec.label);
    const hud = document.createElement('div');
    hud.id = 'scCardBattleClashHud';
    hud.style.cssText = `position:absolute;top:196px;left:50%;transform:translateX(-50%);z-index:158;background:linear-gradient(135deg,rgba(15,18,42,0.96),rgba(34,18,68,0.96));backdrop-filter:blur(18px);border:2px solid ${spec.color};border-radius:22px;padding:10px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 18px 45px rgba(0,0,0,0.78),0 0 32px ${spec.color}66;direction:rtl;pointer-events:none;animation:scDuelSlideIn 2.2s cubic-bezier(0.22,1,0.36,1) forwards;`;
    hud.innerHTML = `<div style="display:flex;align-items:center;gap:8px;"><img src="assets/characters/animated/${esc(sAv)}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" style="width:44px;height:52px;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.7));"><div><div style="font-size:10px;color:#cbd5e1;font-weight:800;">المهاجم ⚡</div><b style="font-size:13.5px;color:#fff;font-weight:900;">${esc(ev.sourcePlayer?.name || 'بطل')}</b></div></div><div style="display:flex;flex-direction:column;align-items:center;padding:0 10px;border-inline:1px solid rgba(255,255,255,0.14);"><img src="${esc(cardImg)}" onerror="this.style.display='none'" style="width:46px;height:60px;object-fit:cover;border-radius:8px;border:1.5px solid #fde047;box-shadow:0 0 16px ${spec.color};margin-bottom:3px;"><span style="font-size:11px;font-weight:900;color:#fef08a;white-space:nowrap;">${esc(statusLbl)}</span></div>${!spec.self ? `<div style="display:flex;align-items:center;gap:8px;"><div><div style="font-size:10px;color:${isBlocked || isReflected ? '#38bdf8' : '#fca5a5'};font-weight:800;">${isBlocked ? 'الدرع الحامي' : (isReflected ? 'عاكس الهجوم' : 'المستهدف 🎯')}</div><b style="font-size:13.5px;color:#fff;font-weight:900;">${esc(ev.targetPlayer?.name || 'خصم')}</b></div><img src="assets/characters/animated/${esc(tAv)}-idle.webp" onerror="this.src='assets/characters/animated/char_02-idle.webp'" style="width:44px;height:52px;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.7));"></div>` : ''}`;
    root.appendChild(hud);
    setTimeout(() => hud.remove(), 2250);
  }

  function resolvePlayerElement(playerId, playerName) {
    if (typeof document === 'undefined') return null;
    const pid = playerId ? String(playerId) : '', pname = playerName ? String(playerName).trim() : '';
    const matchList = els => {
      for (const el of els) { if (pid && (el.getAttribute('data-player-id') || '') === pid) return el; }
      for (const el of els) {
        const en = (el.getAttribute('data-player-name') || el.querySelector('.player-name-floating-pill, b')?.textContent || '').trim();
        if (pname && en && en === pname) return el;
      }
      return null;
    };
    const arenaSlots = Array.from(document.querySelectorAll('#hostCharactersArena .host-lobby-hero-slot'));
    if (arenaSlots.length) { const m = matchList(arenaSlots); if (m) return { el: m, kind: 'lobby' }; }
    const lbLanes = Array.from(document.querySelectorAll('.race-lane-card'));
    if (lbLanes.length) { const m = matchList(lbLanes); if (m) return { el: m, kind: 'leaderboard' }; }
    const podCols = Array.from(document.querySelectorAll('#podiumStageRoot .podium-col')).filter(col => col.style.opacity !== '0' && col.querySelector('[id^="podiumHeroArea_"]')?.style?.display !== 'none');
    if (podCols.length) { const m = matchList(podCols); if (m) return { el: m, kind: 'podium' }; }
    return null;
  }

  function getPointInStage(el, fallbackXPct = 50, fallbackYPct = 50) {
    const root = hostRoot || getHostStage();
    const w = root?.clientWidth || 1000, h = root?.clientHeight || 650;
    if (el && root && typeof el.getBoundingClientRect === 'function' && typeof root.getBoundingClientRect === 'function') {
      const r = el.getBoundingClientRect(), rr = root.getBoundingClientRect();
      if (r.width > 0 && rr.width > 0) return { x: (r.left - rr.left) + r.width * 0.5, y: (r.top - rr.top) + r.height * 0.48 };
    }
    return { x: (fallbackXPct / 100) * w, y: (fallbackYPct / 100) * h };
  }

  function animateHeroRigTemporarily(targetEl, move) {
    const rig = targetEl.querySelector('.host-lobby-hero-char, .char-procedural-rig, [id^="hm_"]') || targetEl;
    const prevAnim = rig.style.animation;
    rig.classList.add('sc-fx-anim-active');
    rig.style.animation = move.anim;
    clearTimeout(rig._fxTimer);
    if (global.ScoreARMotionEngine?.getInstance) {
      const charHost = targetEl.querySelector('[id^="hostHeroSlot_"], [id^="hostLbHero_"], [id^="hm_"]') || rig;
      const inst = global.ScoreARMotionEngine.getInstance(charHost);
      if (inst && typeof inst.setAction === 'function') {
        const prevPose = charHost.getAttribute?.('data-cur-pose') || charHost.getAttribute?.('data-action') || 'walk';
        inst.setAction(move.pose);
        setTimeout(() => { try { inst.setAction(prevPose); } catch {} }, 850);
      }
    }
    rig._fxTimer = setTimeout(() => { rig.style.animation = prevAnim || ''; rig.classList.remove('sc-fx-anim-active'); }, 800);
  }

  function ensureLoop() { if (!rafId && !isMotionOff()) { lastTs = 0; rafId = requestAnimationFrame(stepFx); } }
  function fireArrive(b) {
    if (!b || b.arrived) return;
    b.arrived = true;
    spawnBurst(b.x1, b.y1, b.color, b.isBlocked ? 24 : 30, 1.3);
    if (b.onArrive) b.onArrive(b.x1, b.y1);
    const idx = bolts.indexOf(b); if (idx >= 0) bolts.splice(idx, 1);
  }
  function pushBolt(b) {
    bolts.push(b);
    setTimeout(() => { fireArrive(b); ensureLoop(); }, (b.durMs || 420) + 25);
  }

  function stepFx(ts) {
    const stage = getHostStage();
    if (!stage || (!particles.length && !bolts.length && !rings.length)) {
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      rafId = null; lastTs = 0; return;
    }
    const nowTs = performance.now ? performance.now() : (ts || Date.now());
    const dtSec = lastTs ? Math.min(0.1, Math.max(0.008, (nowTs - lastTs) / 1000)) : 0.016;
    const dtF = dtSec * 60;
    lastTs = nowTs;
    const w = stage.clientWidth || 1000, h = stage.clientHeight || 650;
    if (canvas && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; }
    if (ctx) {
      ctx.clearRect(0, 0, w, h);
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.t = Math.min(1, Math.max(0, (nowTs - b.startTs) / (b.durMs || 420)));
        const mt = 1 - b.t;
        const px = mt * mt * b.x0 + 2 * mt * b.t * b.cx + b.t * b.t * b.x1;
        const py = mt * mt * b.y0 + 2 * mt * b.t * b.cy + b.t * b.t * b.y1;
        particles.push({ x: px + (Math.random() - 0.5) * 8, y: py + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 2.2, vy: (Math.random() - 0.5) * 2.2, r: 5.5, color: b.trail, life: 0.95, decay: 0.065, gravity: 0 });
        ctx.save();
        ctx.strokeStyle = b.color; ctx.globalAlpha = 0.45; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(b.x0, b.y0); ctx.quadraticCurveTo(b.cx, b.cy, px, py); ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowColor = b.color; ctx.shadowBlur = 24;
        ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (b.t >= 1) fireArrive(b);
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.r += (r.maxR - r.r) * Math.min(0.6, 0.16 * dtF); r.life -= 0.045 * dtF;
        if (r.life <= 0) { rings.splice(i, 1); continue; }
        ctx.save(); ctx.strokeStyle = r.color; ctx.globalAlpha = Math.max(0, r.life * 0.88);
        ctx.lineWidth = 3.5 * r.life + 1; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.x += p.vx * dtF; p.y += p.vy * dtF; p.vy += p.gravity * dtF; p.life -= p.decay * dtF;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, p.r * p.life), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    } else { bolts.length = 0; particles.length = 0; rings.length = 0; }
    rafId = requestAnimationFrame(stepFx);
  }

  function performStudentMove(emoji, name, studentId, podiumPlayers = null, revealStep = 0, triggerStuntFn = null) {
    injectStyles();
    const move = MOVE_MAP[emoji] || MOVE_MAP['🎉'];
    const match = resolvePlayerElement(studentId, name);
    const c = ensureCanvas();
    if (match) {
      const targetEl = match.kind === 'leaderboard' ? (match.el.querySelector('.char-procedural-rig') || match.el) : match.el;
      showBubbleOnTarget(targetEl, move.label, move.color);
      if (match.kind === 'lobby' && (move.kind === 'jump' || move.kind === 'party') && global.ScoreARLobbyDirector?.triggerWelcomeHop) {
        const pid = match.el.getAttribute('data-player-id');
        if (pid) global.ScoreARLobbyDirector.triggerWelcomeHop(pid);
      }
      if (match.kind === 'podium' && typeof triggerStuntFn === 'function') {
        const colRank = Number((match.el.id || '').replace('col_', ''));
        if (colRank >= 1 && colRank <= 3) triggerStuntFn(colRank);
      }
      animateHeroRigTemporarily(match.el, move);
      if (c && !isMotionOff()) {
        const pt = getPointInStage(targetEl, 50, 58);
        spawnBurst(pt.x, pt.y, move.color, move.kind === 'fire' ? 28 : 20, 1.05);
        ensureLoop();
      }
      return { matched: true, kind: match.kind, move: move.kind };
    }
    if (Array.isArray(podiumPlayers) && typeof triggerStuntFn === 'function' && revealStep > 0) {
      const idx = podiumPlayers.findIndex(p => (studentId && String(p?.id) === String(studentId)) || (name && p?.name?.trim() === String(name).trim()));
      if (idx >= 0 && idx < 3) {
        const rank = idx + 1;
        triggerStuntFn(rank);
        const hEl = document.getElementById(`podiumHeroArea_${rank}`);
        if (hEl) showBubbleOnTarget(hEl, move.label, move.color);
      }
    }
    if (c && !isMotionOff()) {
      const w = c.clientWidth || 1000, h = c.clientHeight || 650;
      spawnBurst(w * (0.2 + Math.random() * 0.6), h * 0.72, move.color, 18, 0.95);
      ensureLoop();
    }
    return { matched: false, kind: 'stage', move: move.kind };
  }

  function playCardProjectile(ev) {
    if (!ev || !ev.card) return null;
    injectStyles();
    const c = ensureCanvas(); if (!c) return null;
    const spec = CARD_THEMES[ev.card.id] || { icon: '⚡', label: ev.card.nameAr || 'كارت تكتيكي!', color: '#f59e0b', trail: '#fde68a', self: false };
    const srcMatch = resolvePlayerElement(ev.sourcePlayer?.id, ev.sourcePlayer?.name), dstMatch = resolvePlayerElement(ev.targetPlayer?.id, ev.targetPlayer?.name);
    const ptA = getPointInStage(srcMatch?.el, 78, 56), ptB = spec.self ? ptA : getPointInStage(dstMatch?.el, 22, 56);
    const isBlocked = ev.type === 'BLOCKED', isReflected = ev.type === 'REFLECTED';
    showCardDuelHud(ev, spec, isBlocked, isReflected);
    if (spec.self || String(ev.sourcePlayer?.id) === String(ev.targetPlayer?.id)) {
      if (srcMatch?.el) showBubbleOnTarget(srcMatch.el, spec.label, spec.color);
      if (!isMotionOff()) { spawnBurst(ptA.x, ptA.y, spec.color, 26, 1.15); ensureLoop(); }
      return { mode: 'self', cardId: ev.card.id };
    }
    if (isMotionOff()) {
      if (dstMatch?.el) showBubbleOnTarget(dstMatch.el, isBlocked ? '🛡️ صد الدرع!' : (isReflected ? '🪞 ارتد الهجوم!' : spec.label), isBlocked ? '#38bdf8' : spec.color);
      return { mode: 'reduced', cardId: ev.card.id };
    }
    const nowMs = performance.now ? performance.now() : Date.now(), midX = (ptA.x + ptB.x) * 0.5, midY = Math.min(ptA.y, ptB.y) - 110;
    pushBolt({
      x0: ptA.x, y0: ptA.y, cx: midX, cy: midY, x1: ptB.x, y1: ptB.y,
      t: 0, startTs: nowMs, durMs: 420, color: spec.color, trail: spec.trail || spec.color, icon: spec.icon, isBlocked,
      onArrive: (hx, hy) => {
        if (isBlocked) {
          spawnBurst(hx, hy, '#38bdf8', 26, 1.35);
          if (dstMatch?.el) { applyTargetVisualEffect(dstMatch.el, 'shield'); showBubbleOnTarget(dstMatch.el, '🛡️ صد الدرع!', '#38bdf8'); }
        } else if (isReflected) {
          spawnBurst(hx, hy, '#38bdf8', 20, 1.2);
          if (dstMatch?.el) { applyTargetVisualEffect(dstMatch.el, 'shield'); showBubbleOnTarget(dstMatch.el, '🪞 مرآة القاضي!', '#38bdf8'); }
          const bounceStart = performance.now ? performance.now() : Date.now();
          pushBolt({
            x0: ptB.x, y0: ptB.y, cx: midX, cy: midY - 28, x1: ptA.x, y1: ptA.y,
            t: 0, startTs: bounceStart, durMs: 360, color: '#38bdf8', trail: '#ffffff', icon: spec.icon, isBlocked: false,
            onArrive: () => { if (srcMatch?.el) { if (ev.card.id === 'PIN_STUDENT') applyTargetVisualEffect(srcMatch.el, 'ice'); showBubbleOnTarget(srcMatch.el, '💥 ارتد عليك!', '#ef4444'); } }
          });
        } else if (dstMatch?.el) {
          const hitRig = dstMatch.el.querySelector('.host-lobby-hero-char, .char-procedural-rig, [id^="hm_"]') || dstMatch.el;
          hitRig.style.animation = 'scFxHitShake 0.45s ease-out';
          setTimeout(() => { hitRig.style.animation = ''; }, 480);
          if (ev.card.id === 'PIN_STUDENT') applyTargetVisualEffect(dstMatch.el, 'ice');
          showBubbleOnTarget(dstMatch.el, spec.label, spec.color);
        }
      }
    });
    if (spec.dual) pushBolt({ x0: ptB.x, y0: ptB.y, cx: midX, cy: midY + 135, x1: ptA.x, y1: ptA.y, t: 0, startTs: nowMs, durMs: 420, color: '#fbbf24', trail: '#fde047', icon: '🔄' });
    ensureLoop();
    return { mode: ev.type || 'EXECUTED', cardId: ev.card.id };
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stageObserver) { stageObserver.disconnect(); stageObserver = null; }
    lastTs = 0; particles = []; bolts = []; rings = [];
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const ScoreARStageFx = {
    performStudentMove, playCardProjectile, stop,
    _getState: () => ({ activeParticles: particles.length, activeBolts: bolts.length, activeRings: rings.length, running: Boolean(rafId) })
  };
  global.ScoreARStageFx = ScoreARStageFx;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARStageFx = ScoreARStageFx; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARStageFx;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
