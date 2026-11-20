/**
 * ScoreAR Studio-Grade Podium Ceremony Scenes & 60FPS Stage Physics (quiz-podium-scenes.js)
 * Crafted Vector SVG Props + Canvas Lighting for the 5 Interactive Classic Ceremony Modes:
 *   1. chests     (خزائن الكنز الذهبية - 3D SVG Royal Chest + Lid Swing + Specular Gold Coins)
 *   2. cards      (بطاقات الأساطير - Ornate Arabic TCG Holographic Frame + 3D Flip + Starburst)
 *   3. rockets    (صواريخ الفضاء - Foot-Mounted Hover-Jetpack Under Feet + Dual Plasma Plumes)
 *   4. finishline (خط النهاية - Arabic Championship Tape Snapping Outward Toward Posts + Slow-Mo)
 *   5. portal     (بوابة النور - Multi-Ring Arcane SVG Dimensional Vortex + Radial Bloom)
 * Zero orphan timers (strict cancelPending), zero tilted spinning, distinct #1 win vs #2/#3 clap.
 * Strictly Rule 7 Compliant (< 420 lines).
 */
(function (global) {
  'use strict';

  const $ = id => (typeof document !== 'undefined' ? document.getElementById(id) : null);
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };

  const THEME_META = {
    chests:     { title: 'طور خزائن الكنز الذهبية', sub: 'انفتاح الكنز وتطاير العملات الملكية · اضغط على أي بطل لحركة خاصة', entryPose: 'walk', climaxPose: 'win', color: '#fbbf24' },
    cards:      { title: 'طور بطاقات الأساطير 3D', sub: 'بطاقة هولوغرامية فاخرة وانقلاب ثلاثي الأبعاد · اضغط على أي بطل', entryPose: 'wave', climaxPose: 'win', color: '#c084fc' },
    rockets:    { title: 'طور صواريخ الفضاء النفاثة', sub: 'منصة نفاثة أسفل أقدام البطل ودفع بلازما 60FPS · اضغط لدفعة تربو', entryPose: 'fly', climaxPose: 'win', color: '#38bdf8' },
    finishline: { title: 'طور سباق خط النهاية', sub: 'اندفاع عبر المضمار وتمزيق شريط البطولة العربي', entryPose: 'run', climaxPose: 'win', color: '#34d399' },
    portal:     { title: 'طور بوابة النور الكونية', sub: 'انبثاق من البوابة النجمية وموجات الطاقة · اضغط على أي بطل', entryPose: 'fly', climaxPose: 'win', color: '#fde047' }
  };

  let sceneCanvas = null, sceneCtx = null, sceneRaf = null, activeMode = 'chests';
  let fxParticles = [], shockwaves = [], warpStars = [], activeRanks = new Set();
  let sceneTimers = [];

  function scheduleScene(fn, ms) {
    const id = setTimeout(() => {
      sceneTimers = sceneTimers.filter(t => t !== id);
      fn();
    }, ms);
    sceneTimers.push(id);
    return id;
  }

  function cancelPending() {
    sceneTimers.forEach(id => clearTimeout(id));
    sceneTimers = [];
  }

  function getSceneStylesHtml() {
    return `
  @keyframes scHeroChestArrive {
    0%   { opacity: 0; transform: translate3d(0, 32px, 0) scale(0.88); }
    65%  { opacity: 1; transform: translate3d(0, -10px, 0) scale(1.02); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes scHeroCardFlipIn {
    0%   { opacity: 0; transform: perspective(1000px) rotateY(-165deg) translateY(18px) scale(0.78); filter: brightness(1.8); }
    68%  { opacity: 1; transform: perspective(1000px) rotateY(8deg) translateY(-6px) scale(1.03); filter: brightness(1.18); }
    100% { opacity: 1; transform: perspective(1000px) rotateY(0deg) translateY(0) scale(1); filter: brightness(1); }
  }
  @keyframes scHeroRocketLaunch {
    0%   { opacity: 0; transform: translate3d(0, 120px, 0) scale(0.92, 1.08); }
    68%  { opacity: 1; transform: translate3d(0, -16px, 0) scale(0.98, 1.03); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1, 1); }
  }
  @keyframes scHeroSprintIn {
    0%   { opacity: 0; transform: translate3d(180px, 8px, 0) scale(0.92); }
    65%  { opacity: 1; transform: translate3d(-8px, -4px, 0) scale(1.02); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes scHeroPortalEmerge {
    0%   { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.42); filter: brightness(2.0) drop-shadow(0 0 24px #fde047); }
    68%  { opacity: 1; transform: translate3d(0, -10px, 0) scale(1.04); filter: brightness(1.22); }
    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: brightness(1); }
  }
  @keyframes scPedestalBounce {
    0%, 100% { transform: translateY(0) scale(1, 1); }
    38%  { transform: translateY(6px) scale(1.03, 0.96); filter: brightness(1.18) drop-shadow(0 0 22px rgba(251,191,36,0.55)); }
  }
  @keyframes scHeroStuntUpright {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1, 1); }
    36%  { transform: translate3d(0, -28px, 0) scale(1.03, 1.03); }
    72%  { transform: translate3d(0, 4px, 0) scale(1.02, 0.98); }
  }
  @keyframes scZeroGFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-7px); } }
  @keyframes scPortalSpin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
  @keyframes scPortalSpinRev { 0% { transform: translate(-50%, -50%) rotate(360deg) scale(0.86); } 100% { transform: translate(-50%, -50%) rotate(0deg) scale(0.86); } }
  @keyframes scFlamePulse { 0%, 100% { transform: scaleY(0.86) scaleX(0.94); opacity: 0.9; } 50% { transform: scaleY(1.26) scaleX(1.08); opacity: 1; } }

  .sc-pedestal-hit { animation: scPedestalBounce 0.48s cubic-bezier(0.22, 1, 0.36, 1) !important; }
  .sc-stunt-active { animation: scHeroStuntUpright 0.62s cubic-bezier(0.22, 1, 0.36, 1) !important; }
  #podiumStageRoot [id^="podiumHeroArea_"] { z-index: 24 !important; }
  .sc-chest-prop svg, .sc-portal-prop svg { width: 100% !important; height: 100% !important; overflow: visible; }
  .sc-rocket-prop svg { width: 146px !important; height: 34px !important; overflow: visible; }
  #podiumStageRoot[data-ceremony-theme="rockets"] .podium-hero-revealed { animation: scZeroGFloat 2.2s ease-in-out infinite !important; }
  #podiumStageRoot[data-ceremony-theme="rockets"] [id^="hm_"] { margin-bottom: 34px !important; }
  #podiumStageRoot[data-ceremony-theme="cards"] [id^="podiumHeroArea_"] { padding-top: 14px !important; }
  #podiumStageRoot[data-ceremony-theme="cards"] [id^="hm_"] { margin-bottom: 18px !important; }
  #podiumStageRoot .podium-col { cursor: pointer; }

  /* ── 1. Royal 3D SVG Treasure Chest (خزائن الكنز) ── */
  .sc-chest-prop { display: none; position: absolute; bottom: -10px; left: calc(50% + 56px); transform: translateX(-50%); width: 88px; height: 64px; z-index: 34; pointer-events: none; filter: drop-shadow(0 10px 18px rgba(0,0,0,0.85)); }
  #podiumStageRoot[data-ceremony-theme="chests"] .sc-chest-prop { display: block; }
  .sc-chest-lid-g { transform-origin: 60px 38px; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .sc-chest-beam { opacity: 0; transition: opacity 0.4s ease; }
  .sc-chest-prop.is-open .sc-chest-lid-g { transform: translateY(-13px) rotate(-18deg) scaleY(0.76); }
  .sc-chest-prop.is-open .sc-chest-beam { opacity: 1; }

  /* ── 2. Arabic Collector TCG Mythic Card Frame (بطاقات الأساطير) ── */
  .sc-card-prop { display: none; position: absolute; inset: -6px -14px -4px; border-radius: 20px; border: 2.5px solid #fbbf24; background: linear-gradient(155deg, rgba(59,7,100,0.68) 0%, rgba(15,23,42,0.84) 55%, rgba(88,28,135,0.72) 100%); box-shadow: 0 16px 34px rgba(0,0,0,0.82), 0 0 26px rgba(192,132,252,0.5), inset 0 0 20px rgba(251,191,36,0.28); z-index: 2; pointer-events: none; overflow: visible; }
  #podiumStageRoot[data-ceremony-theme="cards"] .sc-card-prop { display: block; }
  .sc-card-prop::before { content: ''; position: absolute; inset: 4px; border: 1.5px solid rgba(254,240,138,0.45); border-radius: 15px; pointer-events: none; }
  .sc-card-header-gem { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #fde047, #d97706); color: #090d16; font-size: 10.5px; font-weight: 900; padding: 2px 12px; border-radius: 999px; border: 1.5px solid #fff; box-shadow: 0 4px 12px rgba(251,191,36,0.75); white-space: nowrap; z-index: 30; }
  .sc-card-stars { position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #0f172a, #1e1b4b); border: 1.5px solid #fbbf24; border-radius: 999px; padding: 1px 12px; font-size: 10.5px; color: #fde047; box-shadow: 0 5px 14px rgba(0,0,0,0.88); font-weight: 900; white-space: nowrap; z-index: 30; }

  /* ── 3. Foot-Mounted Hover-Jetpack Platform UNDER Hero Feet (صواريخ الفضاء) ── */
  .sc-rocket-prop { display: none; position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); width: 148px; height: 62px; z-index: 4; pointer-events: none; flex-direction: column; align-items: center; filter: drop-shadow(0 10px 20px rgba(14,165,233,0.88)); }
  #podiumStageRoot[data-ceremony-theme="rockets"] .sc-rocket-prop { display: flex; }
  .sc-jet-flames { display: flex; justify-content: space-between; width: 88px; margin-top: -4px; }
  .sc-thruster-flame { width: 22px; height: 32px; background: linear-gradient(180deg, #ffffff 0%, #38bdf8 40%, #f97316 80%, transparent 100%); border-radius: 0 0 50% 50%; filter: blur(0.3px); transform-origin: top center; animation: scFlamePulse 0.16s ease-in-out infinite; box-shadow: 0 8px 18px rgba(56,189,248,0.9); }

  /* ── 4. Arabic Finish Line Tape Swinging Outward Cleanly (خط النهاية) ── */
  #scFinishTapeWrap { display: none; position: absolute; bottom: 170px; left: 50%; transform: translateX(-50%); width: min(940px, 92%); height: 76px; z-index: 32; pointer-events: none; align-items: center; justify-content: space-between; direction: ltr; }
  #podiumStageRoot[data-ceremony-theme="finishline"] #scFinishTapeWrap { display: flex; }
  #scFinishTapeWrap.is-snapped { z-index: 14; }
  .sc-finish-post { width: 16px; height: 96px; background: repeating-linear-gradient(180deg, #f8fafc 0 10px, #0f172a 10px 20px); border: 2px solid #fbbf24; border-radius: 8px; box-shadow: 0 0 22px rgba(251,191,36,0.8); position: relative; flex-shrink: 0; }
  .sc-finish-post::before { content: '🏁'; position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-size: 16px; }
  .sc-tape-left, .sc-tape-right { flex: 1; height: 24px; background: linear-gradient(90deg, #dc2626, #f59e0b, #fef08a); border-block: 2px solid #ffffff; box-shadow: 0 6px 18px rgba(245,158,11,0.75); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #090d16; transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease; overflow: hidden; white-space: nowrap; }
  .sc-tape-left { transform-origin: left center; }
  .sc-tape-right { transform-origin: right center; }
  #scFinishTapeWrap.is-snapped .sc-tape-left { transform: rotate(-10deg) translate(-8px, -4px) scaleX(0.26); opacity: 0.72; }
  #scFinishTapeWrap.is-snapped .sc-tape-right { transform: rotate(10deg) translate(8px, -4px) scaleX(0.26); opacity: 0.72; }
  #scSlowMoFlash { position: absolute; inset: 0; background: radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(56,189,248,0.22) 55%, transparent 80%); opacity: 0; pointer-events: none; z-index: 48; transition: opacity 0.25s ease; }

  /* ── 5. Arcane SVG Dimensional Portal (بوابة النور) ── */
  .sc-portal-prop { display: none; position: absolute; top: 50%; left: 50%; width: 224px; height: 224px; transform: translate(-50%, -50%); z-index: 1; pointer-events: none; filter: drop-shadow(0 0 28px rgba(250,204,21,0.7)) drop-shadow(0 0 20px rgba(168,85,247,0.85)); }
  #podiumStageRoot[data-ceremony-theme="portal"] .sc-portal-prop { display: block; }
  .sc-portal-svg-outer { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; animation: scPortalSpin 7s linear infinite; }
  .sc-portal-svg-inner { position: absolute; top: 50%; left: 50%; width: 82%; height: 82%; animation: scPortalSpinRev 4.5s linear infinite; }
  @media (max-width: 720px) { #scThemeHudBadge { top: 76px !important; font-size: 10px !important; padding: 3px 10px !important; } #scFinishTapeWrap { bottom: 118px !important; } }
  @media (prefers-reduced-motion: reduce) {
    .sc-portal-svg-outer, .sc-portal-svg-inner, .sc-thruster-flame, .podium-hero-revealed { animation: none !important; }
  }
`;
  }

  function getColumnPropsHtml(rank) {
    const stars = rank === 1 ? '★★★★★ المركز #1' : (rank === 2 ? '★★★★ المركز #2' : '★★★ المركز #3');
    const tier = rank === 1 ? 'بطل أسطوري' : (rank === 2 ? 'وصيف متألق' : 'فارس المنصة');
    return `
      <div id="scPortalProp_${rank}" class="sc-portal-prop">
        <svg class="sc-portal-svg-outer" viewBox="0 0 200 200"><defs><radialGradient id="pg_${rank}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a" stop-opacity="0.55"/><stop offset="55%" stop-color="#a855f7" stop-opacity="0.32"/><stop offset="100%" stop-color="#3b0764" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="88" fill="url(#pg_${rank})" stroke="#fde047" stroke-width="2.5" stroke-dasharray="14 8"/><polygon points="100,14 124,72 186,72 136,110 154,172 100,134 46,172 64,110 14,72 76,72" fill="none" stroke="rgba(192,132,252,0.65)" stroke-width="2"/><circle cx="100" cy="100" r="72" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 10"/></svg>
        <svg class="sc-portal-svg-inner" viewBox="0 0 200 200"><rect x="38" y="38" width="124" height="124" rx="18" fill="none" stroke="#fef08a" stroke-width="2" opacity="0.75"/><rect x="38" y="38" width="124" height="124" rx="18" fill="none" stroke="#c084fc" stroke-width="2" transform="rotate(45 100 100)" opacity="0.8"/></svg>
      </div>
      <div id="scCardProp_${rank}" class="sc-card-prop"><span class="sc-card-header-gem">${tier}</span><span class="sc-card-stars">${stars}</span></div>
      <div id="scChestProp_${rank}" class="sc-chest-prop">
        <svg viewBox="0 0 120 84" width="100%" height="100%">
          <defs>
            <linearGradient id="chGold_${rank}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
            <linearGradient id="chWood_${rank}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9a3412"/><stop offset="100%" stop-color="#431407"/></linearGradient>
            <radialGradient id="chGlow_${rank}" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/><stop offset="60%" stop-color="#f59e0b" stop-opacity="0.4"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient>
          </defs>
          <ellipse class="sc-chest-beam" cx="60" cy="36" rx="48" ry="26" fill="url(#chGlow_${rank})"/>
          <rect x="14" y="38" width="92" height="38" rx="7" fill="url(#chWood_${rank})" stroke="url(#chGold_${rank})" stroke-width="4"/>
          <line x1="14" y1="54" x2="106" y2="54" stroke="#78350f" stroke-width="2"/>
          <rect x="30" y="38" width="10" height="38" fill="url(#chGold_${rank})"/><rect x="80" y="38" width="10" height="38" fill="url(#chGold_${rank})"/>
          <g class="sc-chest-lid-g">
            <path d="M12,38 C12,16 108,16 108,38 Z" fill="url(#chWood_${rank})" stroke="url(#chGold_${rank})" stroke-width="4"/>
            <path d="M30,38 L30,21 L40,20 L40,38 Z M80,38 L80,20 L90,21 L90,38 Z" fill="url(#chGold_${rank})"/>
          </g>
          <rect x="52" y="31" width="16" height="20" rx="4" fill="url(#chGold_${rank})" stroke="#451a03" stroke-width="2"/>
          <circle cx="60" cy="40" r="3.2" fill="#dc2626"/>
        </svg>
      </div>
      <div id="scRocketProp_${rank}" class="sc-rocket-prop">
        <svg viewBox="0 0 160 44" width="146" height="34">
          <defs><linearGradient id="rkBody_${rank}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0284c7"/><stop offset="50%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs>
          <path d="M8,26 L34,10 L126,10 L152,26 L134,34 L26,34 Z" fill="url(#rkBody_${rank})" stroke="#38bdf8" stroke-width="2.5"/>
          <rect x="44" y="14" width="72" height="10" rx="5" fill="#0f172a" stroke="#7dd3fc" stroke-width="1.5"/>
          <circle cx="80" cy="19" r="4" fill="#fde047"/>
          <path d="M24,34 L30,42 L48,42 L52,34 Z M108,34 L112,42 L130,42 L136,34 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        </svg>
        <div class="sc-jet-flames"><div class="sc-thruster-flame"></div><div class="sc-thruster-flame"></div></div>
      </div>`;
  }

  function getPedestalPropsHtml() { return ''; }

  function getStageOverlaysHtml() {
    return `<canvas id="scSceneCanvas" style="position:absolute;inset:0;width:100%;height:100%;z-index:23;pointer-events:none;"></canvas><div id="scSlowMoFlash"></div><div id="scThemeHudBadge" style="position:absolute;top:54px;right:16px;z-index:28;background:rgba(10,12,28,0.88);backdrop-filter:blur(14px);border:1px solid rgba(251,191,36,0.42);border-radius:999px;padding:3px 14px;display:inline-flex;align-items:center;gap:7px;box-shadow:0 8px 20px rgba(0,0,0,0.55);pointer-events:none;white-space:nowrap;"><span id="scThemeHudDot" style="width:7px;height:7px;border-radius:50%;background:#fbbf24;box-shadow:0 0 10px #fbbf24;"></span><b id="scThemeHudTitle" style="font-size:11.5px;font-weight:900;color:#fef08a;">طور خزائن الكنز الذهبية</b><span id="scThemeHudSub" class="podium-motion-extra" style="font-size:10.5px;color:#cbd5e1;font-weight:700;">· اضغط على أي بطل لحركة خاصة</span></div><div id="scFinishTapeWrap"><div class="sc-finish-post"></div><div class="sc-tape-left">🏁 خط النهاية · بطولة سكور آر</div><div class="sc-tape-right">بطولة الأبطال · خط النهاية 🏁</div><div class="sc-finish-post"></div></div>`;
  }

  function getRankCenter(rank, W, H) {
    const col = $(`col_${rank}`), root = $('podiumStageRoot');
    if (col && root && typeof col.getBoundingClientRect === 'function' && typeof root.getBoundingClientRect === 'function') {
      const cr = col.getBoundingClientRect(), rr = root.getBoundingClientRect();
      if (cr.width > 0 && rr.width > 0) {
        return { x: (cr.left - rr.left) + cr.width * 0.5, y: (cr.top - rr.top) + cr.height * 0.36, bottomY: (cr.top - rr.top) + cr.height * 0.58 };
      }
    }
    const xMap = { 1: W * 0.5, 2: W * 0.5 - 240, 3: W * 0.5 + 240 };
    return { x: xMap[rank] || W * 0.5, y: H * 0.40, bottomY: H * 0.60 };
  }

  function spawnThemeBurst(rank, mode) {
    if (!sceneCanvas) {
      sceneCanvas = $('scSceneCanvas');
      if (sceneCanvas && typeof sceneCanvas.getContext === 'function') sceneCtx = sceneCanvas.getContext('2d');
    }
    const chest = $(`scChestProp_${rank}`);
    if (chest && (mode === 'chests' || mode === 'goldrain')) chest.classList.add('is-open');
    const tape = $('scFinishTapeWrap'), flash = $('scSlowMoFlash');
    if (mode === 'finishline') {
      if (tape) { tape.classList.remove('is-snapped'); void tape.offsetWidth; tape.classList.add('is-snapped'); }
      if (flash && rank === 1) { flash.style.opacity = '0.78'; scheduleScene(() => { flash.style.opacity = '0'; }, 240); }
    }
    if (!sceneCanvas) return;
    const W = sceneCanvas.width || 960, H = sceneCanvas.height || 640;
    const pos = getRankCenter(rank, W, H);
    const count = rank === 1 ? 26 : 16;

    if (mode === 'chests' || mode === 'goldrain') {
      const coinTotal = mode === 'goldrain' ? count + 10 : count;
      for (let i = 0; i < coinTotal; i++) {
        const isGem = (mode === 'chests' && i % 5 === 0), ang = -Math.PI * 0.82 + (i / coinTotal) * Math.PI * 0.64 + (Math.random() - 0.5) * 0.25;
        const spd = 4.0 + Math.random() * 5.2;
        fxParticles.push({ kind: isGem ? 'gem' : 'coin', x: pos.x + (Math.random() - 0.5) * 46, y: pos.bottomY - 12, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 3.4, g: 0.22, size: isGem ? 6.5 + Math.random() * 3 : 7.5 + Math.random() * 3, spin: Math.random() * 6.28, vSpin: 0.16 + Math.random() * 0.16, color: isGem ? ['#34d399', '#fb7185', '#38bdf8'][i % 3] : '#fbbf24', floorY: pos.bottomY + 10, life: 1.0, decay: 0.016 });
      }
      shockwaves.push({ x: pos.x, y: pos.bottomY - 8, r: 14, maxR: 125, color: '#fbbf24', life: 1.0 });
    } else if (mode === 'cards') {
      const cols = ['#c084fc', '#38bdf8', '#fde047', '#f472b6'];
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2, spd = 3.0 + Math.random() * 4.4;
        fxParticles.push({ kind: 'star', x: pos.x + Math.cos(ang) * 42, y: pos.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 0.9, g: 0.05, size: 6.5 + Math.random() * 3.5, spin: ang, vSpin: 0.12, color: cols[i % cols.length], life: 1.0, decay: 0.02 });
      }
      shockwaves.push({ x: pos.x, y: pos.y, r: 20, maxR: 145, color: '#c084fc', life: 1.0 });
    } else if (mode === 'rockets') {
      for (let i = 0; i < count; i++) {
        fxParticles.push({ kind: 'star', x: pos.x + (Math.random() - 0.5) * 58, y: pos.bottomY, vx: (Math.random() - 0.5) * 3.2, vy: -(1.6 + Math.random() * 3.4), g: -0.02, size: 5.5 + Math.random() * 4.5, spin: 0, vSpin: 0.15, color: i % 2 === 0 ? '#38bdf8' : '#fde047', life: 0.95, decay: 0.024 });
      }
      shockwaves.push({ x: pos.x, y: pos.bottomY, r: 16, maxR: 122, color: '#38bdf8', life: 1.0 });
    } else if (mode === 'finishline') {
      for (let i = 0; i < count; i++) {
        fxParticles.push({ kind: 'star', x: pos.x + (Math.random() - 0.5) * 84, y: pos.y, vx: (Math.random() - 0.5) * 5.8, vy: -(2.2 + Math.random() * 4.0), g: 0.12, size: 6.5 + Math.random() * 4.5, spin: Math.random() * 6.28, vSpin: 0.18, color: i % 2 === 0 ? '#34d399' : '#fef08a', life: 1.0, decay: 0.02 });
      }
    } else if (mode === 'portal') {
      shockwaves.push({ x: pos.x, y: pos.y, r: 14, maxR: 160, color: '#fde047', life: 1.0 });
      shockwaves.push({ x: pos.x, y: pos.y, r: 8, maxR: 120, color: '#a855f7', life: 0.9 });
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2, spd = 2.4 + Math.random() * 3.8;
        fxParticles.push({ kind: 'star', x: pos.x, y: pos.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, g: -0.02, size: 6 + Math.random() * 4.5, spin: ang, vSpin: 0.12, color: i % 2 === 0 ? '#fef08a' : '#c084fc', life: 1.0, decay: 0.02 });
      }
    }
  }

  function animateHeroEntry(rank, mode, mountHeroFn, player) {
    const heroArea = $(`podiumHeroArea_${rank}`), hm = $(`hm_${rank}`), ped = $(`podiumPedestal_${rank}`);
    if (!heroArea || !player) return;
    activeRanks.add(rank);
    const custom = player?.cosmetics?.entry;
    const entryMode = (custom === 'rocket') ? 'rockets' : (custom === 'portal' || custom === 'goldrain' ? custom : mode);
    const meta = THEME_META[entryMode] || THEME_META[mode] || THEME_META.chests;
    const reduced = Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    const climaxPose = rank === 1 ? 'win' : 'clap';

    heroArea.classList.remove('podium-hero-revealed');
    heroArea.setAttribute('data-cosmetic-entry', custom || 'default');
    if (player?.cosmetics?.aura && global.ScoreARHeroCosmetics?.applyAura) {
      global.ScoreARHeroCosmetics.applyAura(heroArea, player.cosmetics.aura);
    }
    heroArea.style.display = 'flex';

    if (reduced) {
      heroArea.style.animation = 'none';
      if (entryMode === 'chests' || entryMode === 'goldrain') $(`scChestProp_${rank}`)?.classList.add('is-open');
      if (entryMode === 'finishline') $('scFinishTapeWrap')?.classList.add('is-snapped');
      if (hm && typeof mountHeroFn === 'function') mountHeroFn(hm, player.avatarId, climaxPose);
      heroArea.classList.add('podium-hero-revealed');
      return;
    }

    const animMap = {
      chests: 'scHeroChestArrive 0.58s cubic-bezier(0.22, 1, 0.36, 1) both',
      goldrain: 'scHeroChestArrive 0.58s cubic-bezier(0.22, 1, 0.36, 1) both',
      cards: 'scHeroCardFlipIn 0.66s cubic-bezier(0.22, 1, 0.36, 1) both',
      rockets: 'scHeroRocketLaunch 0.66s cubic-bezier(0.22, 1, 0.36, 1) both',
      finishline: 'scHeroSprintIn 0.60s cubic-bezier(0.22, 1, 0.36, 1) both',
      portal: 'scHeroPortalEmerge 0.64s cubic-bezier(0.22, 1, 0.36, 1) both'
    };
    const dirEntry = (meta.entryPose === 'run')
      ? (rank === 2 ? 'runRight' : (rank === 3 ? 'runLeft' : 'runRight'))
      : (meta.entryPose === 'walk' ? (rank === 1 ? 'walkForward' : (rank === 2 ? 'walkRight' : 'walkLeft')) : meta.entryPose);

    heroArea.style.animation = 'none';
    void heroArea.offsetWidth;
    heroArea.style.animation = animMap[entryMode] || animMap.chests;
    if (entryMode === 'chests' || entryMode === 'goldrain') $(`scChestProp_${rank}`)?.classList.add('is-open');
    if (hm && typeof mountHeroFn === 'function') mountHeroFn(hm, player.avatarId, dirEntry);

    scheduleScene(() => {
      if (ped) { ped.classList.remove('sc-pedestal-hit'); void ped.offsetWidth; ped.classList.add('sc-pedestal-hit'); }
      spawnThemeBurst(rank, entryMode);
      if (hm && typeof mountHeroFn === 'function') mountHeroFn(hm, player.avatarId, climaxPose);
      scheduleScene(() => { heroArea.classList.add('podium-hero-revealed'); }, 260);
    }, 380);
  }

  function triggerHeroStunt(rank, mountHeroFn, player) {
    const heroArea = $(`podiumHeroArea_${rank}`);
    if (!heroArea || !player || heroArea.style.display === 'none') return;
    sfx('pop');
    heroArea.classList.remove('sc-stunt-active');
    void heroArea.offsetWidth;
    heroArea.classList.add('sc-stunt-active');
    spawnThemeBurst(rank, activeMode);
    if (typeof mountHeroFn === 'function') {
      const hm = $(`hm_${rank}`);
      if (hm) mountHeroFn(hm, player.avatarId, rank === 1 ? 'win' : 'wave');
    }
    scheduleScene(() => { heroArea.classList.remove('sc-stunt-active'); }, 650);
  }

  function drawStarShape(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const rad = i % 2 === 0 ? r : r * 0.38;
      const a = (i * Math.PI) / 4;
      if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  function renderSceneLoop() {
    if (!sceneCanvas || !sceneCtx) return;
    const W = sceneCanvas.width = sceneCanvas.offsetWidth || 960;
    const H = sceneCanvas.height = sceneCanvas.offsetHeight || 640;
    const ctx = sceneCtx;
    ctx.clearRect(0, 0, W, H);

    if (activeMode === 'rockets' && activeRanks.size > 0) {
      if (warpStars.length < 22) warpStars.push({ x: Math.random() * W, y: -10, vy: 7 + Math.random() * 8, len: 16 + Math.random() * 20 });
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.30)';
      ctx.lineWidth = 1.5;
      for (let i = warpStars.length - 1; i >= 0; i--) {
        const s = warpStars[i]; s.y += s.vy;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.len); ctx.stroke();
        if (s.y > H + 30) warpStars.splice(i, 1);
      }
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += (sw.maxR - sw.r) * 0.14; sw.life -= 0.035;
      if (sw.life <= 0.02) { shockwaves.splice(i, 1); continue; }
      if (typeof ctx.arc === 'function') {
        ctx.save(); ctx.globalAlpha = Math.max(0, sw.life); ctx.strokeStyle = sw.color; ctx.lineWidth = 3 * sw.life;
        ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    }

    for (let i = fxParticles.length - 1; i >= 0; i--) {
      const p = fxParticles[i];
      p.x += p.vx; p.y += p.vy; p.vy += (p.g || 0);
      if (p.spin !== undefined) p.spin += (p.vSpin || 0.1);
      if (p.floorY && p.y > p.floorY && p.vy > 0) { p.y = p.floorY; p.vy *= -0.45; p.vx *= 0.78; }
      p.life -= (p.decay || 0.018);
      if (p.life <= 0) { fxParticles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x, p.y);
      if (p.kind === 'coin' && typeof ctx.arc === 'function') {
        const sx = Math.max(0.28, Math.abs(Math.cos(p.spin || 0)));
        ctx.scale(sx, 1);
        ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.76, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fffbeb'; ctx.fillRect(-p.size * 0.18, -p.size * 0.42, p.size * 0.36, p.size * 0.84);
      } else if (p.kind === 'gem') {
        ctx.rotate(p.spin || 0); ctx.fillStyle = p.color || '#34d399';
        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.8, 0); ctx.lineTo(0, p.size); ctx.lineTo(-p.size * 0.8, 0); ctx.closePath(); ctx.fill();
      } else {
        ctx.rotate(p.spin || 0); ctx.fillStyle = p.color || '#fef08a';
        drawStarShape(ctx, p.size * p.life);
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
    if (!global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      sceneRaf = requestAnimationFrame(renderSceneLoop);
    }
  }

  function updateHud(mode) {
    const meta = THEME_META[mode] || THEME_META.chests;
    const t = $('scThemeHudTitle'), s = $('scThemeHudSub'), d = $('scThemeHudDot');
    if (t) { t.textContent = meta.title; t.style.color = meta.color; }
    if (s) s.textContent = '· ' + meta.sub;
    if (d) { d.style.background = meta.color; d.style.boxShadow = `0 0 10px ${meta.color}`; }
  }

  function setMode(mode, revealStep, mountHeroFn, players, isUserClick = false) {
    cancelPending();
    activeMode = THEME_META[mode] ? mode : 'chests';
    updateHud(activeMode);
    if (isUserClick) {
      [1, 2, 3].forEach(r => { const c = $(`scChestProp_${r}`); if (c) c.classList.remove('is-open'); });
      const tape = $('scFinishTapeWrap');
      if (tape) tape.classList.remove('is-snapped');
    }
    if (isUserClick && revealStep >= 1) {
      sfx(activeMode === 'rockets' || activeMode === 'finishline' ? 'whoosh' : 'reveal');
      const slotPl = r => players && players[r === 1 ? 0 : r === 2 ? 1 : 2];
      const visibleRanks = (revealStep >= 3 ? [3, 2, 1] : (revealStep === 2 ? [3, 2] : [3])).filter(r => Boolean(slotPl(r)));
      visibleRanks.forEach((r, idx) => {
        const pl = slotPl(r);
        scheduleScene(() => animateHeroEntry(r, activeMode, mountHeroFn, pl), idx * 120);
      });
    }
  }

  function stopStage() {
    cancelPending();
    if (sceneRaf) { cancelAnimationFrame(sceneRaf); sceneRaf = null; }
    fxParticles = []; shockwaves = []; warpStars = []; activeRanks.clear();
  }

  const ScoreARPodiumScenes = {
    THEME_META, getSceneStylesHtml, getColumnPropsHtml, getPedestalPropsHtml, getStageOverlaysHtml,
    initStage, setMode, animateHeroEntry, triggerRankClimax: spawnThemeBurst, triggerHeroStunt, stopStage, cancelPending
  };
  global.ScoreARPodiumScenes = ScoreARPodiumScenes;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARPodiumScenes = ScoreARPodiumScenes; } catch (e) {}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARPodiumScenes;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
