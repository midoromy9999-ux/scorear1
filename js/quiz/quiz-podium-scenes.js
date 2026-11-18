/**
 * ScoreAR Video-Game Podium Ceremony Scenes & 60FPS Stage Physics (quiz-podium-scenes.js)
 * Powers the 5 Interactive Ceremony Modes:
 *   1. chests     (خزائن الكنز الذهبية - Parabolic Hero Jump + 3D Chest Open + Gold Coins Fountain)
 *   2. cards      (بطاقات الأساطير - 3D Hologram Mythic Card Flip + Neon Prism Shards)
 *   3. rockets    (صواريخ الفضاء - Twin Jetpack Thrusters + 60FPS Plasma Exhaust + Zero-G Hover)
 *   4. finishline (خط النهاية - Track Sprint + Ribbon Snap + Slow-Mo Camera Flash)
 *   5. portal     (بوابة النور - Dimensional Vortex Rings + Hero Landing + Shockwave Ring)
 * Strictly Rule 7 Compliant (< 420 lines).
 */
(function (global) {
  'use strict';

  const $ = id => (typeof document !== 'undefined' ? document.getElementById(id) : null);
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };

  const THEME_META = {
    chests:     { title: 'طور خزائن الكنز الذهبية', sub: 'قفزة الأبطال وانفجار العملات والجواهر · اضغط على أي بطل لحركة خاصة', entryPose: 'run', climaxPose: 'celebrate', color: '#fbbf24' },
    cards:      { title: 'طور بطاقات الأساطير 3D', sub: 'انقلاب هولوغرامي وشرارات نيون · اضغط على أي بطل لحركة خاصة', entryPose: 'walk', climaxPose: 'celebrate', color: '#c084fc' },
    rockets:    { title: 'طور صواريخ الفضاء النفاثة', sub: 'إقلاع نفاث ولهب بلازما 60FPS · اضغط على أي بطللدفعة تربو', entryPose: 'fly', climaxPose: 'celebrate', color: '#38bdf8' },
    finishline: { title: 'طور سباق خط النهاية Slow-Mo', sub: 'انطلاق سريع وتمزيق شريط النهاية بالحركة البطيئة · اضغط على أي بطل', entryPose: 'run', climaxPose: 'run', color: '#34d399' },
    portal:     { title: 'طور بوابة النور الكونية', sub: 'عبور البوابة الزمنية وموجة الصدمة الضوئية · اضغط على أي بطل', entryPose: 'fly', climaxPose: 'celebrate', color: '#fde047' }
  };

  let sceneCanvas = null, sceneCtx = null, sceneRaf = null, activeMode = 'chests';
  let fxParticles = [], shockwaves = [], warpStars = [], activeRanks = new Set();

  function getSceneStylesHtml() {
    return `
  /* ── Video-Game Hero Entry & Pedestal Impact Physics ── */
  @keyframes scHeroJumpArc {
    0%   { opacity: 0; transform: translate3d(-135px, 60px, 0) scale(0.75, 0.92) rotate(-10deg); }
    34%  { opacity: 1; transform: translate3d(-48px, 16px, 0) scale(1.09, 0.86) rotate(-4deg); }
    66%  { opacity: 1; transform: translate3d(0px, -74px, 0) scale(0.90, 1.14) rotate(3deg); }
    86%  { opacity: 1; transform: translate3d(0px, 11px, 0) scale(1.15, 0.84) rotate(0deg); }
    100% { opacity: 1; transform: translate3d(0px, 0px, 0) scale(1, 1) rotate(0deg); }
  }
  @keyframes scHeroCardFlipIn {
    0%   { opacity: 0; transform: perspective(900px) rotateY(-180deg) translateY(35px) scale(0.68); filter: brightness(2.2); }
    62%  { opacity: 1; transform: perspective(900px) rotateY(14deg) translateY(-18px) scale(1.08); filter: brightness(1.35); }
    100% { opacity: 1; transform: perspective(900px) rotateY(0deg) translateY(0) scale(1); filter: brightness(1); }
  }
  @keyframes scHeroRocketLaunch {
    0%   { opacity: 0; transform: translate3d(0, 195px, 0) scale(0.82, 1.24); }
    60%  { opacity: 1; transform: translate3d(0, -34px, 0) scale(0.95, 1.08); }
    82%  { opacity: 1; transform: translate3d(0, 8px, 0) scale(1.06, 0.94); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1, 1); }
  }
  @keyframes scHeroSprintIn {
    0%   { opacity: 0; transform: translate3d(-210px, 18px, 0) skewX(-14deg) scale(0.88); }
    52%  { opacity: 1; transform: translate3d(18px, -10px, 0) skewX(-10deg) scale(1.06); filter: brightness(1.3); }
    78%  { opacity: 1; transform: translate3d(-4px, -38px, 0) skewX(4deg) scale(0.96, 1.08); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) skewX(0deg) scale(1); filter: brightness(1); }
  }
  @keyframes scHeroPortalEmerge {
    0%   { opacity: 0; transform: translate3d(0, -45px, 0) scale(0.15) rotate(-25deg); filter: brightness(2.5) hue-rotate(45deg); }
    58%  { opacity: 1; transform: translate3d(0, -24px, 0) scale(1.12, 0.92) rotate(4deg); filter: brightness(1.4); }
    84%  { opacity: 1; transform: translate3d(0, 12px, 0) scale(1.16, 0.82) rotate(0deg); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); filter: brightness(1); }
  }
  @keyframes scPedestalBounce {
    0%, 100% { transform: translateY(0) scale(1, 1); }
    36%  { transform: translateY(11px) scale(1.05, 0.91); filter: brightness(1.3) drop-shadow(0 0 28px rgba(251,191,36,0.75)); }
    70%  { transform: translateY(-5px) scale(0.98, 1.03); }
  }
  @keyframes scHeroStuntHop {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1, 1); }
    25%  { transform: translate3d(0, -62px, 0) scale(0.92, 1.12) rotate(-8deg); }
    55%  { transform: translate3d(0, -76px, 0) scale(1.06, 0.96) rotate(8deg); }
    82%  { transform: translate3d(0, 9px, 0) scale(1.15, 0.85) rotate(0deg); }
  }
  @keyframes scZeroGFloat {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-13px); }
  }
  @keyframes scPortalSpin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
  @keyframes scPortalSpinRev { 0% { transform: translate(-50%, -50%) rotate(360deg) scale(0.82); } 100% { transform: translate(-50%, -50%) rotate(0deg) scale(0.82); } }
  @keyframes scCardSheen { 0% { transform: translateX(-140%) rotate(25deg); } 100% { transform: translateX(240%) rotate(25deg); } }
  @keyframes scFlamePulse { 0%, 100% { transform: scaleY(0.88) scaleX(0.95); opacity: 0.88; } 50% { transform: scaleY(1.24) scaleX(1.08); opacity: 1; } }

  .sc-pedestal-hit { animation: scPedestalBounce 0.52s cubic-bezier(0.22, 1, 0.36, 1) !important; }
  .sc-stunt-active { animation: scHeroStuntHop 0.68s cubic-bezier(0.22, 1, 0.36, 1) !important; }
  #podiumStageRoot[data-ceremony-theme="rockets"] .podium-hero-revealed { animation: scZeroGFloat 2.1s ease-in-out infinite !important; }
  #podiumStageRoot .podium-col { cursor: pointer; }

  /* ── 1. Treasure Chest Prop (خزائن الكنز) ── */
  .sc-chest-prop { display: none; position: absolute; top: -34px; left: 50%; transform: translateX(-50%); width: 78px; height: 50px; z-index: 38; pointer-events: none; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.75)); }
  #podiumStageRoot[data-ceremony-theme="chests"] .sc-chest-prop { display: block; }
  .sc-chest-base { position: absolute; bottom: 0; inset-inline: 0; height: 30px; background: linear-gradient(180deg, #b45309, #78350f); border: 2.5px solid #fbbf24; border-radius: 6px 6px 10px 10px; box-shadow: inset 0 4px 10px rgba(254,240,138,0.35); }
  .sc-chest-lid { position: absolute; top: 4px; inset-inline: -2px; height: 22px; background: linear-gradient(180deg, #f59e0b, #b45309); border: 2.5px solid #fef08a; border-radius: 12px 12px 4px 4px; transform-origin: top center; transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; }
  .sc-chest-lock { width: 14px; height: 16px; background: #fef08a; border: 2px solid #92400e; border-radius: 4px; box-shadow: 0 0 10px #fbbf24; }
  .sc-chest-glow { position: absolute; inset: 4px 8px 18px; background: radial-gradient(circle, #fef08a 0%, rgba(251,191,36,0) 75%); opacity: 0; transition: opacity 0.35s ease; }
  .sc-chest-prop.is-open .sc-chest-lid { transform: translateY(-13px) rotateX(48deg) scale(1.06); }
  .sc-chest-prop.is-open .sc-chest-glow { opacity: 1; }

  /* ── 2. Mythic Legend Card Prop (بطاقات الأساطير) ── */
  .sc-card-prop { display: none; position: absolute; inset: -10px -14px 4px; border-radius: 20px; border: 2.5px solid rgba(251,191,36,0.78); background: linear-gradient(145deg, rgba(88,28,135,0.42), rgba(15,23,42,0.55)); box-shadow: 0 0 28px rgba(192,132,252,0.45), inset 0 0 18px rgba(251,191,36,0.22); z-index: 1; pointer-events: none; overflow: hidden; }
  #podiumStageRoot[data-ceremony-theme="cards"] .sc-card-prop { display: block; }
  .sc-card-prop::after { content: ''; position: absolute; top: -40%; left: -40%; width: 55%; height: 180%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent); animation: scCardSheen 2.8s ease-in-out infinite; }
  .sc-card-stars { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); font-size: 11px; color: #fde047; letter-spacing: 2px; text-shadow: 0 2px 8px #000; font-weight: 900; white-space: nowrap; }

  /* ── 3. Space Rocket Thrusters Prop (صواريخ الفضاء) ── */
  .sc-rocket-prop { display: none; position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); width: 120%; height: 42px; z-index: 36; pointer-events: none; justify-content: space-between; padding: 0 8px; box-sizing: border-box; }
  #podiumStageRoot[data-ceremony-theme="rockets"] .sc-rocket-prop { display: flex; }
  .sc-thruster-pod { width: 24px; height: 28px; background: linear-gradient(180deg, #38bdf8, #1e3a8a); border: 2px solid #bae6fd; border-radius: 8px 8px 4px 4px; position: relative; box-shadow: 0 0 16px rgba(56,189,248,0.65); }
  .sc-thruster-flame { position: absolute; top: 24px; left: 3px; right: 3px; height: 32px; background: linear-gradient(180deg, #ffffff 0%, #38bdf8 35%, #f97316 75%, transparent 100%); border-radius: 0 0 50% 50%; filter: blur(1px); transform-origin: top center; animation: scFlamePulse 0.18s ease-in-out infinite; }

  /* ── 4. Finish Line Ribbon & Slow-Mo Flash (خط النهاية) ── */
  #scFinishTapeWrap { display: none; position: absolute; bottom: 118px; left: 50%; transform: translateX(-50%); width: min(860px, 92%); height: 48px; z-index: 36; pointer-events: none; align-items: center; justify-content: space-between; }
  #podiumStageRoot[data-ceremony-theme="finishline"] #scFinishTapeWrap { display: flex; }
  .sc-finish-post { width: 14px; height: 64px; background: repeating-linear-gradient(180deg, #fff 0 8px, #111 8px 16px); border: 2px solid #fbbf24; border-radius: 6px; box-shadow: 0 0 18px rgba(251,191,36,0.6); }
  .sc-tape-left, .sc-tape-right { flex: 1; height: 18px; background: linear-gradient(90deg, #f59e0b, #fef08a, #10b981); border-block: 2px solid #ffffff; box-shadow: 0 4px 16px rgba(245,158,11,0.55); display: flex; align-items: center; justify-content: center; font-size: 10.5px; font-weight: 900; color: #090d16; letter-spacing: 1px; transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease; }
  .sc-tape-left { transform-origin: left center; border-radius: 4px 0 0 4px; }
  .sc-tape-right { transform-origin: right center; border-radius: 0 4px 4px 0; }
  #scFinishTapeWrap.is-snapped .sc-tape-left { transform: rotate(-28deg) translate(-24px, 18px) scaleX(0.72); opacity: 0.35; }
  #scFinishTapeWrap.is-snapped .sc-tape-right { transform: rotate(28deg) translate(24px, 18px) scaleX(0.72); opacity: 0.35; }
  #scSlowMoFlash { position: absolute; inset: 0; background: radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(56,189,248,0.25) 55%, transparent 80%); opacity: 0; pointer-events: none; z-index: 48; transition: opacity 0.28s ease; }

  /* ── 5. Portal of Light Vortex Prop (بوابة النور) ── */
  .sc-portal-prop { display: none; position: absolute; top: 54%; left: 50%; width: 215px; height: 215px; transform: translate(-50%, -50%); z-index: 0; pointer-events: none; }
  #podiumStageRoot[data-ceremony-theme="portal"] .sc-portal-prop { display: block; }
  .sc-portal-ring1, .sc-portal-ring2 { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; border-radius: 50%; border: 3px dashed rgba(254,240,138,0.78); box-shadow: 0 0 32px rgba(168,85,247,0.75), inset 0 0 28px rgba(254,240,138,0.45); animation: scPortalSpin 6s linear infinite; }
  .sc-portal-ring2 { border: 2.5px dotted rgba(56,189,248,0.85); animation: scPortalSpinRev 4.2s linear infinite; background: radial-gradient(circle, rgba(254,240,138,0.28) 0%, rgba(139,92,246,0.22) 52%, transparent 72%); }
`;
  }

  function getColumnPropsHtml(rank) {
    const stars = rank === 1 ? '★★★★★ LEGEND #1' : (rank === 2 ? '★★★★ EPIC #2' : '★★★ RARE #3');
    return `<div id="scPortalProp_${rank}" class="sc-portal-prop"><div class="sc-portal-ring1"></div><div class="sc-portal-ring2"></div></div><div id="scCardProp_${rank}" class="sc-card-prop"><span class="sc-card-stars">${stars}</span></div>`;
  }

  function getPedestalPropsHtml(rank) {
    return `<div id="scChestProp_${rank}" class="sc-chest-prop"><div class="sc-chest-glow"></div><div class="sc-chest-base"></div><div class="sc-chest-lid"><div class="sc-chest-lock"></div></div></div><div id="scRocketProp_${rank}" class="sc-rocket-prop"><div class="sc-thruster-pod"><div class="sc-thruster-flame"></div></div><div class="sc-thruster-pod"><div class="sc-thruster-flame"></div></div></div>`;
  }

  function getStageOverlaysHtml() {
    return `<canvas id="scSceneCanvas" style="position:absolute;inset:0;width:100%;height:100%;z-index:26;pointer-events:none;"></canvas><div id="scSlowMoFlash"></div><div id="scThemeHudBadge" style="position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:38;background:rgba(10,12,28,0.86);backdrop-filter:blur(14px);border:1px solid rgba(251,191,36,0.42);border-radius:999px;padding:4px 16px;display:inline-flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,0.55);pointer-events:none;white-space:nowrap;"><span id="scThemeHudDot" style="width:8px;height:8px;border-radius:50%;background:#fbbf24;box-shadow:0 0 10px #fbbf24;"></span><b id="scThemeHudTitle" style="font-size:12px;font-weight:900;color:#fef08a;">طور خزائن الكنز الذهبية</b><span id="scThemeHudSub" class="podium-motion-extra" style="font-size:11px;color:#cbd5e1;font-weight:700;">· اضغط على أي بطل لحركة خاصة</span></div><div id="scFinishTapeWrap"><div class="sc-finish-post"></div><div class="sc-tape-left">🏁 خط النهاية · CHAMPIONSHIP</div><div class="sc-tape-right">SCOREAR GRAND PRIX 🏁</div><div class="sc-finish-post"></div></div>`;
  }

  function getRankCenter(rank, W, H) {
    const col = $(`col_${rank}`);
    const root = $('podiumStageRoot');
    if (col && root && typeof col.getBoundingClientRect === 'function' && typeof root.getBoundingClientRect === 'function') {
      const cr = col.getBoundingClientRect(), rr = root.getBoundingClientRect();
      if (cr.width > 0 && rr.width > 0) {
        return { x: (cr.left - rr.left) + cr.width * 0.5, y: (cr.top - rr.top) + cr.height * 0.52, bottomY: (cr.bottom - rr.top) - 18 };
      }
    }
    const xMap = { 1: W * 0.5, 2: W * 0.5 - 250, 3: W * 0.5 + 250 };
    return { x: xMap[rank] || W * 0.5, y: H * 0.52, bottomY: H * 0.86 };
  }

  function spawnThemeBurst(rank, mode) {
    if (!sceneCanvas) {
      sceneCanvas = $('scSceneCanvas');
      if (sceneCanvas && typeof sceneCanvas.getContext === 'function') sceneCtx = sceneCanvas.getContext('2d');
    }
    if (!sceneCanvas) return;
    const W = sceneCanvas.width || 960, H = sceneCanvas.height || 640;
    const pos = getRankCenter(rank, W, H);
    const count = rank === 1 ? 36 : 24;

    if (mode === 'chests' || mode === 'goldrain') {
      const chest = $(`scChestProp_${rank}`);
      if (chest && mode === 'chests') chest.classList.add('is-open');
      const coinTotal = mode === 'goldrain' ? count + 14 : count;
      for (let i = 0; i < coinTotal; i++) {
        const isGem = (mode === 'chests' && i % 5 === 0), ang = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7, spd = 4.5 + Math.random() * 6.5;
        fxParticles.push({ kind: isGem ? 'gem' : 'coin', x: pos.x + (Math.random() - 0.5) * (mode === 'goldrain' ? 76 : 44), y: (mode === 'goldrain' ? pos.y - 40 : pos.y + 20), vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 3.2, g: 0.26, size: isGem ? 8 + Math.random() * 4 : 7 + Math.random() * 4, spin: Math.random() * 6.28, vSpin: 0.18 + Math.random() * 0.2, color: isGem ? ['#34d399', '#fb7185', '#38bdf8'][i % 3] : '#fbbf24', floorY: pos.bottomY, life: 1.0, decay: 0.012 + Math.random() * 0.008 });
      }
      if (mode === 'goldrain') shockwaves.push({ x: pos.x, y: pos.y + 10, r: 14, maxR: 165, color: '#fbbf24', life: 1.0 });
    } else if (mode === 'cards') {
      const cols = ['#c084fc', '#38bdf8', '#fde047', '#f472b6'];
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2, spd = 3 + Math.random() * 6;
        fxParticles.push({ kind: 'shard', x: pos.x + (Math.random() - 0.5) * 60, y: pos.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1.5, g: 0.08, size: 7 + Math.random() * 6, spin: Math.random() * 6.28, vSpin: 0.16, color: cols[i % cols.length], life: 1.0, decay: 0.016 });
      }
      shockwaves.push({ x: pos.x, y: pos.y, r: 16, maxR: 155, color: '#c084fc', life: 1.0 });
    } else if (mode === 'rockets') {
      for (let i = 0; i < count; i++) {
        fxParticles.push({ kind: i % 3 === 0 ? 'smoke' : 'flame', x: pos.x + (Math.random() - 0.5) * 68, y: pos.bottomY - 12, vx: (Math.random() - 0.5) * 3.2, vy: 2.5 + Math.random() * 4.5, g: -0.04, size: 8 + Math.random() * 9, color: i % 2 === 0 ? '#38bdf8' : '#f97316', life: 1.0, decay: 0.022 });
      }
      shockwaves.push({ x: pos.x, y: pos.bottomY - 10, r: 14, maxR: 130, color: '#38bdf8', life: 1.0 });
    } else if (mode === 'finishline') {
      const tape = $('scFinishTapeWrap'), flash = $('scSlowMoFlash');
      if (tape) { tape.classList.remove('is-snapped'); void tape.offsetWidth; tape.classList.add('is-snapped'); }
      if (flash && rank === 1) { flash.style.opacity = '0.88'; setTimeout(() => { flash.style.opacity = '0'; }, 260); }
      for (let i = 0; i < count; i++) {
        fxParticles.push({ kind: i % 2 === 0 ? 'shard' : 'smoke', x: pos.x + (Math.random() - 0.5) * 80, y: pos.bottomY - 35, vx: (Math.random() - 0.5) * 7, vy: -(2 + Math.random() * 5), g: 0.14, size: 6 + Math.random() * 6, spin: Math.random() * 6.28, vSpin: 0.2, color: i % 2 === 0 ? '#34d399' : '#fef08a', life: 1.0, decay: 0.018 });
      }
    } else if (mode === 'portal') {
      shockwaves.push({ x: pos.x, y: pos.y + 30, r: 12, maxR: 185, color: '#fde047', life: 1.0 });
      shockwaves.push({ x: pos.x, y: pos.y + 30, r: 6, maxR: 135, color: '#a855f7', life: 0.9 });
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2, spd = 2.5 + Math.random() * 4.5;
        fxParticles.push({ kind: 'gem', x: pos.x, y: pos.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, g: -0.03, size: 6 + Math.random() * 5, spin: ang, vSpin: 0.12, color: i % 2 === 0 ? '#fef08a' : '#c084fc', life: 1.0, decay: 0.016 });
      }
    }
  }

  function animateHeroEntry(rank, mode, mountHeroFn, player) {
    const heroArea = $(`podiumHeroArea_${rank}`), hm = $(`hm_${rank}`), ped = $(`podiumPedestal_${rank}`);
    if (!heroArea) return;
    activeRanks.add(rank);
    const custom = player?.cosmetics?.entry;
    const entryMode = (custom === 'rocket') ? 'rockets' : (custom === 'portal' || custom === 'goldrain' ? custom : mode);
    const meta = THEME_META[entryMode] || THEME_META[mode] || THEME_META.chests;
    const animMap = {
      chests: 'scHeroJumpArc 0.68s cubic-bezier(0.22, 1, 0.36, 1) both',
      goldrain: 'scHeroJumpArc 0.68s cubic-bezier(0.22, 1, 0.36, 1) both',
      cards: 'scHeroCardFlipIn 0.72s cubic-bezier(0.22, 1, 0.36, 1) both',
      rockets: 'scHeroRocketLaunch 0.72s cubic-bezier(0.22, 1, 0.36, 1) both',
      finishline: 'scHeroSprintIn 0.66s cubic-bezier(0.22, 1, 0.36, 1) both',
      portal: 'scHeroPortalEmerge 0.70s cubic-bezier(0.22, 1, 0.36, 1) both'
    };

    heroArea.classList.remove('podium-hero-revealed');
    heroArea.setAttribute('data-cosmetic-entry', custom || 'default');
    if (player?.cosmetics?.aura && global.ScoreARHeroCosmetics?.applyAura) {
      global.ScoreARHeroCosmetics.applyAura(heroArea, player.cosmetics.aura);
    }
    heroArea.style.display = 'flex';
    heroArea.style.animation = 'none';
    void heroArea.offsetWidth;
    heroArea.style.animation = animMap[entryMode] || animMap.chests;

    if (hm && player && typeof mountHeroFn === 'function') {
      mountHeroFn(hm, player.avatarId, meta.entryPose);
    }

    setTimeout(() => {
      if (ped) {
        ped.classList.remove('sc-pedestal-hit');
        void ped.offsetWidth;
        ped.classList.add('sc-pedestal-hit');
      }
      spawnThemeBurst(rank, entryMode);
      if (hm && player && typeof mountHeroFn === 'function') {
        mountHeroFn(hm, player.avatarId, meta.climaxPose);
      }
      setTimeout(() => { heroArea.classList.add('podium-hero-revealed'); }, 320);
    }, 410);
  }

  function triggerHeroStunt(rank, mountHeroFn, player) {
    const heroArea = $(`podiumHeroArea_${rank}`);
    if (!heroArea || heroArea.style.display === 'none') return;
    sfx('pop');
    heroArea.classList.remove('sc-stunt-active');
    void heroArea.offsetWidth;
    heroArea.classList.add('sc-stunt-active');
    spawnThemeBurst(rank, activeMode);
    if (player && typeof mountHeroFn === 'function') {
      const hm = $(`hm_${rank}`);
      if (hm) mountHeroFn(hm, player.avatarId, 'celebrate');
    }
    setTimeout(() => { heroArea.classList.remove('sc-stunt-active'); }, 720);
  }

  function renderSceneLoop() {
    if (!sceneCanvas || !sceneCtx) return;
    const W = sceneCanvas.width = sceneCanvas.offsetWidth || 960;
    const H = sceneCanvas.height = sceneCanvas.offsetHeight || 640;
    const ctx = sceneCtx;
    ctx.clearRect(0, 0, W, H);

    // Continuous Ambient Mode Physics (Rocket Warp & Exhaust / Portal Motes)
    if (activeMode === 'rockets' && activeRanks.size > 0) {
      if (warpStars.length < 28) {
        warpStars.push({ x: Math.random() * W, y: -10, vy: 6 + Math.random() * 8, len: 18 + Math.random() * 26 });
      }
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.lineWidth = 1.6;
      for (let i = warpStars.length - 1; i >= 0; i--) {
        const s = warpStars[i];
        s.y += s.vy;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.len); ctx.stroke();
        if (s.y > H + 30) warpStars.splice(i, 1);
      }
      activeRanks.forEach(r => {
        if (Math.random() < 0.45) {
          const pos = getRankCenter(r, W, H);
          fxParticles.push({
            kind: 'flame', x: pos.x + (Math.random() > 0.5 ? -38 : 38) + (Math.random() - 0.5) * 10,
            y: pos.bottomY - 8, vx: (Math.random() - 0.5) * 1.2, vy: 2.2 + Math.random() * 2.6,
            g: 0.02, size: 5 + Math.random() * 5, color: Math.random() > 0.4 ? '#38bdf8' : '#fb923c',
            life: 0.75, decay: 0.045
          });
        }
      });
    }

    // Shockwave Rings
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += (sw.maxR - sw.r) * 0.14;
      sw.life -= 0.032;
      if (sw.life <= 0.02) { shockwaves.splice(i, 1); continue; }
      if (typeof ctx.arc === 'function') {
        ctx.save();
        ctx.globalAlpha = Math.max(0, sw.life);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3.5 * sw.life;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Dynamic FX Particles (Coins, Gems, Shards, Flames, Smoke)
    for (let i = fxParticles.length - 1; i >= 0; i--) {
      const p = fxParticles[i];
      p.x += p.vx; p.y += p.vy; p.vy += (p.g || 0);
      if (p.spin !== undefined) p.spin += (p.vSpin || 0.1);
      if (p.floorY && p.y > p.floorY && p.vy > 0) {
        p.y = p.floorY; p.vy *= -0.52; p.vx *= 0.78;
      }
      p.life -= (p.decay || 0.018);
      if (p.life <= 0) { fxParticles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x, p.y);
      if (p.kind === 'coin' && typeof ctx.arc === 'function') {
        const scaleX = Math.max(0.22, Math.abs(Math.cos(p.spin || 0)));
        ctx.scale(scaleX, 1);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5; ctx.stroke();
      } else if (p.kind === 'gem' || p.kind === 'shard') {
        ctx.rotate(p.spin || 0);
        ctx.fillStyle = p.color || '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.85, 0);
        ctx.lineTo(0, p.size); ctx.lineTo(-p.size * 0.85, 0);
        ctx.closePath(); ctx.fill();
      } else if (typeof ctx.arc === 'function') {
        ctx.fillStyle = p.color || '#f97316';
        ctx.beginPath(); ctx.arc(0, 0, p.size * p.life, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    sceneRaf = requestAnimationFrame(renderSceneLoop);
  }

  function initStage(canvasEl, initialMode) {
    stopStage();
    sceneCanvas = canvasEl || $('scSceneCanvas');
    activeMode = THEME_META[initialMode] ? initialMode : 'chests';
    if (!sceneCanvas || typeof sceneCanvas.getContext !== 'function') return;
    sceneCtx = sceneCanvas.getContext('2d');
    updateHud(activeMode);
    sceneRaf = requestAnimationFrame(renderSceneLoop);
  }

  function updateHud(mode) {
    const meta = THEME_META[mode] || THEME_META.chests;
    const t = $('scThemeHudTitle'), s = $('scThemeHudSub'), d = $('scThemeHudDot');
    if (t) { t.textContent = meta.title; t.style.color = meta.color; }
    if (s) s.textContent = '· ' + meta.sub;
    if (d) { d.style.background = meta.color; d.style.boxShadow = `0 0 10px ${meta.color}`; }
  }

  function setMode(mode, revealStep, mountHeroFn, players, isUserClick = false) {
    activeMode = THEME_META[mode] ? mode : 'chests';
    updateHud(activeMode);
    [1, 2, 3].forEach(r => { const c = $(`scChestProp_${r}`); if (c) c.classList.remove('is-open'); });
    const tape = $('scFinishTapeWrap');
    if (tape) tape.classList.remove('is-snapped');

    if (isUserClick && revealStep >= 1) {
      sfx(activeMode === 'rockets' || activeMode === 'finishline' ? 'whoosh' : 'reveal');
      const visibleRanks = revealStep >= 3 ? [3, 2, 1] : (revealStep === 2 ? [3, 2] : [3]);
      visibleRanks.forEach((r, idx) => {
        const pl = players && players[r === 1 ? 0 : r === 2 ? 1 : 2];
        setTimeout(() => animateHeroEntry(r, activeMode, mountHeroFn, pl), idx * 140);
      });
    }
  }

  function stopStage() {
    if (sceneRaf) { cancelAnimationFrame(sceneRaf); sceneRaf = null; }
    fxParticles = []; shockwaves = []; warpStars = []; activeRanks.clear();
  }

  const ScoreARPodiumScenes = {
    THEME_META,
    getSceneStylesHtml,
    getColumnPropsHtml,
    getPedestalPropsHtml,
    getStageOverlaysHtml,
    initStage,
    setMode,
    animateHeroEntry,
    triggerRankClimax: spawnThemeBurst,
    triggerHeroStunt,
    stopStage
  };

  global.ScoreARPodiumScenes = ScoreARPodiumScenes;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARPodiumScenes = ScoreARPodiumScenes; } catch (e) {}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARPodiumScenes;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
