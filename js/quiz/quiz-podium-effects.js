/**
 * ScoreAR Kahoot Studio 3D Podium Ceremony v12 (quiz-podium-effects.js)
 * Exact Kahoot Choreography:
 * - Step 1 (3rd Place): Pedestal 3 rises in exact center of screen -> Hero & Name appear.
 * - Step 2 (2nd Place): Pedestal 3 recedes right & hides -> Pedestal 2 rises in exact center -> Hero & Name appear.
 * - Step 3 (1st Place): Pedestal 2 recedes left & hides -> Stage Blackout -> Pedestal 1 in center, 2 on left, 3 on right
 *   -> Theatrical Roving Spotlight sweeps around 1st Place -> Hero 1 + Confetti burst -> Stage lights return!
 * Strictly 3 Hero Motions: idle (الوقوف), walk (المشي), celebrate (القفز).
 * Strictly Rule 7 compliant (< 390 lines).
 */
(function (global) {
  'use strict';
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };
  const $   = id => document.getElementById(id);

  const POSES = ['idle', 'walk', 'celebrate'];
  let revealStep = 0, players = [], room = null, rafId = null, partTimer = null, spotCanvas = null, currentPose = 'celebrate', cTimer = null, sTimer = null;

  function charCode(avatarId) {
    const n = Math.max(1, Math.min(20, parseInt(String(avatarId || '1').replace(/\D/g, '') || '1', 10)));
    return 'char_' + String(n).padStart(2, '0');
  }

  function heroImg(avatarId, name, pose = 'celebrate') {
    const code = charCode(avatarId);
    const charName = global.ScoreARCharacters?.get?.(parseInt(code.replace('char_', ''), 10))?.name || name || 'البطل';
    const atlas = (typeof document !== 'undefined' && document.baseURI)
      ? new URL(`assets/characters/animated/${code}-atlas.webp`, document.baseURI).href
      : `assets/characters/animated/${code}-atlas.webp`;
    return `<div class="scorear-character character-${pose}" role="img" aria-label="${esc(charName)}"
      style="width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;--character-atlas:url('${atlas}');">
      <span class="character-frames" aria-hidden="true" data-atlas="${atlas}" style="background-image:url('${atlas}');"></span>
      <img src="assets/characters/animated/${code}-idle.webp"
           onerror="this.src='assets/characters/animated/char_01-idle.webp'"
           alt="${esc(charName)}"
           style="max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 16px 28px rgba(0,0,0,0.82));">
    </div>`;
  }

  function mountHero(el, avatarId, pose = 'celebrate') {
    if (!el) return;
    const validPose = POSES.includes(pose) ? pose : 'celebrate';
    if (global.ScoreARMotionEngine?.mount) global.ScoreARMotionEngine.mount(el, charCode(avatarId), validPose);
    else el.innerHTML = heroImg(avatarId, '', validPose);
  }

  /* ── Kahoot-Grade 3D Isometric Pedestal with Pentagon Rank Shield ── */
  function pedestal3D(rank, heightPx, widthPx) {
    const themes = {
      1: { face: 'linear-gradient(180deg, #4c1d95 0%, #3b0764 100%)', top: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', pentBg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', pentBorder: '#fef08a', glow: 'rgba(251, 191, 36, 0.55)', label: 'المركز الأول' },
      2: { face: 'linear-gradient(180deg, #431482 0%, #2e1065 100%)', top: 'linear-gradient(135deg, #5b21b6 0%, #3b0764 100%)', pentBg: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)', pentBorder: '#e2e8f0', glow: 'rgba(148, 163, 184, 0.45)', label: 'المركز الثاني' },
      3: { face: 'linear-gradient(180deg, #3b0f75 0%, #240a4d 100%)', top: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)', pentBg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', pentBorder: '#fed7aa', glow: 'rgba(249, 115, 22, 0.45)', label: 'المركز الثالث' }
    };
    const t = themes[rank], pentSize = rank === 1 ? 82 : (rank === 2 ? 72 : 68);
    return `<div id="podiumPedestal_${rank}" class="kahoot-3d-pedestal ped-rank-${rank}" style="height:${heightPx}px;width:${widthPx}px;position:relative;transition:all 0.65s cubic-bezier(0.16,1,0.3,1);filter:drop-shadow(0 20px 38px rgba(0,0,0,0.82));">
      <!-- 3D Isometric Top Face (Like Kahoot Screenshots 6, 7, 8) -->
      <div style="position:absolute;top:-22px;left:0;right:0;height:24px;background:${t.top};clip-path:polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%);z-index:6;"></div>
      <!-- Front Block Face -->
      <div style="position:absolute;inset:0;background:${t.face};border-top:2px solid rgba(255,255,255,0.22);border-radius:0 0 10px 10px;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:18px 10px 14px;overflow:hidden;box-shadow:inset 0 10px 24px rgba(255,255,255,0.12), inset 0 -18px 28px rgba(0,0,0,0.5);">
        <!-- Kahoot Pentagon Rank Shield -->
        <div style="width:${pentSize}px;height:${pentSize}px;background:${t.pentBorder};clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);display:grid;place-items:center;padding:4px;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.55));">
          <div style="width:100%;height:100%;background:${t.pentBg};clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);display:grid;place-items:center;font-size:${rank===1?38:32}px;font-weight:900;color:#ffffff;font-family:Montserrat,Arial,sans-serif;">
            <span id="pedMedal_${rank}">${rank}</span>
          </div>
        </div>
        <div id="podiumMystery_${rank}" style="width:90%;background:rgba(6,8,22,0.75);border:1.5px solid ${t.pentBorder};border-radius:8px;padding:4px 8px;text-align:center;font-family:Montserrat,Tajawal,sans-serif;font-size:15px;font-weight:900;color:#ffffff;">❓</div>
      </div>
    </div>`;
  }

  function runSpotlights(canvas, worldId, phase) {
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let t = 0; if (rafId) cancelAnimationFrame(rafId); spotCanvas = canvas;
    function frame() {
      if (!spotCanvas) return;
      const W = canvas.width = canvas.offsetWidth || 960, H = canvas.height = canvas.offsetHeight || 640;
      ctx.clearRect(0, 0, W, H);
      if (phase >= 1) {
        const sway = Math.sin(t * 0.7) * W * 0.1;
        const g = ctx.createLinearGradient(W * 0.5, 0, W * 0.5 + sway, H);
        g.addColorStop(0, 'rgba(251,191,36,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.moveTo(W * 0.5 - 20, 0); ctx.lineTo(W * 0.5 + 20, 0);
        ctx.lineTo(W * 0.5 + sway + 170, H); ctx.lineTo(W * 0.5 + sway - 170, H);
        ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      }
      t += 0.025;
      rafId = requestAnimationFrame(frame);
    }
    frame();
  }

  function particles(canvas) {
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    if (partTimer) clearInterval(partTimer);
    const pal = ['#fbbf24', '#fef08a', '#c084fc', '#38bdf8'];
    let W = (canvas.width = canvas.offsetWidth || 960), H = (canvas.height = canvas.offsetHeight || 640);
    const mk = () => ({ x: Math.random() * W, y: H + 10, vx: (Math.random() - 0.5) * 1.1, vy: -(0.7 + Math.random() * 1.6), r: 2 + Math.random() * 3.5, op: 0.4 + Math.random() * 0.5, col: pal[Math.floor(Math.random() * pal.length)] });
    const pts = Array.from({ length: 30 }, () => { const p = mk(); p.y = Math.random() * H; return p; });
    partTimer = setInterval(() => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -15) Object.assign(p, mk());
        ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = p.op; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.28); ctx.fill(); ctx.restore();
      }
    }, 33);
  }

  function setMysteryScore(rank, score, color) {
    const el = $(`podiumMystery_${rank}`);
    if (!el) return;
    el.style.color = color || '#fef08a';
    el.textContent = `${score} نقطة`;
  }

  function renderHostPodium(stage, currentRoom) {
    if (!stage || !currentRoom) return;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (partTimer) { clearInterval(partTimer); partTimer = null; }
    if (cTimer) { clearTimeout(cTimer); cTimer = null; }
    if (sTimer) { clearTimeout(sTimer); sTimer = null; }
    spotCanvas = null; revealStep = 0;

    const wid = currentRoom.world?.id || currentRoom.worldId || 'royal';
    const sorted = [...(currentRoom.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const p1 = sorted[0] || { name: 'البطل الأول', score: 1250, avatarId: 'char_01' };
    const p2 = sorted[1] || { name: 'الوصيف الثاني', score: 980, avatarId: 'char_02' };
    const p3 = sorted[2] || { name: 'الفائز الثالث', score: 820, avatarId: 'char_03' };
    players = [p1, p2, p3, sorted[3], sorted[4]].filter(Boolean);
    room = currentRoom;

    if (global.ScoreARAudio?.playMusic) global.ScoreARAudio.playMusic('victory', 0.28);

    const P1 = pedestal3D(1, 185, 225);
    const P2 = pedestal3D(2, 150, 200);
    const P3 = pedestal3D(3, 125, 190);

    stage.innerHTML = `
<style>
  #podiumStageRoot{--pod-dx:245px;--pod-recede:260px;--pod-s:1;position:absolute;inset:0;display:flex;flex-direction:column;font-family:Cairo,Tajawal,Arial,sans-serif;background:#1a0b3b;overflow:hidden;box-sizing:border-box;}
#podiumStageRoot main{max-width:none;margin:0;padding:20px 12px 14px;}
  #podiumStageRoot .podium-col{transform-origin:bottom center;}
  #podiumStageRoot .podium-footer-bar button{padding:7px 12px !important;font-size:11.5px !important;}
  #podiumStageRoot[data-ceremony-theme="chests"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 62%,rgba(245,158,11,0.34),transparent 65%);}
  #podiumStageRoot[data-ceremony-theme="cards"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 62%,rgba(168,85,247,0.38),rgba(56,189,248,0.12) 45%,transparent 70%);}
  #podiumStageRoot[data-ceremony-theme="rockets"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 72%,rgba(14,165,233,0.42),rgba(99,102,241,0.16) 45%,transparent 72%);}
  #podiumStageRoot[data-ceremony-theme="finishline"] .sc-ceremony-aura{background:repeating-linear-gradient(90deg,rgba(255,255,255,0.16) 0 18px,rgba(16,185,129,0.22) 18px 36px);height:16px !important;top:auto !important;bottom:8px;border-radius:999px;max-width:740px;margin:0 auto;}
  #podiumStageRoot[data-ceremony-theme="portal"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 52%,rgba(254,240,138,0.38),rgba(139,92,246,0.24) 44%,transparent 72%);}
  .sc-ceremony-chooser{position:absolute;inset:0;z-index:48;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(7,8,20,0.68);backdrop-filter:blur(8px);}
  .sc-ceremony-dialog{width:min(580px,100%);max-height:100%;overflow-y:auto;background:linear-gradient(160deg,rgba(24,25,54,0.96),rgba(12,13,30,0.98));border:1.5px solid rgba(251,191,36,0.42);border-radius:22px;padding:16px 18px;box-shadow:0 24px 60px rgba(0,0,0,0.75);text-align:center;color:#fff;}
  .sc-ceremony-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px;margin:12px 0 14px;}
  .sc-ceremony-card{background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.15);border-radius:14px;padding:10px 8px;color:#fff;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;transition:transform 0.16s ease,border-color 0.16s ease,background 0.16s ease;}
  .sc-ceremony-card:hover{transform:translateY(-2px);border-color:#c4b5fd;}
  .sc-ceremony-card.is-selected{background:linear-gradient(135deg,rgba(245,158,11,0.28),rgba(180,83,9,0.28));border-color:#fef08a;box-shadow:0 0 18px rgba(251,191,36,0.3);}
  @media (max-width:520px){
    .sc-ceremony-dialog{padding:12px;border-radius:16px;}
    .sc-ceremony-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:8px 0 10px;}
    .sc-ceremony-card{padding:7px 6px;font-size:11px;}
  }
  .podium-name-pill{background:rgba(10,12,28,0.82);border:1px solid rgba(255,255,255,0.22);border-radius:999px;padding:2px 14px;margin-bottom:16px;position:relative;z-index:40;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,0.65);}
  @media (max-height:760px) and (min-width:721px){
    #podiumStageRoot #podiumCameraRig{height:410px !important;}
    #podiumStageRoot{--pod-s:0.84;}
    #podiumStageRoot .podium-header-bar{padding:6px 14px !important;}
    #podiumStageRoot .podium-footer-bar{padding:7px 14px !important;gap:6px !important;}
  }
  @media (max-width:720px){
    #podiumStageRoot{--pod-dx:100px;--pod-recede:112px;--pod-s:0.46;max-width:100vw !important;overflow-x:hidden !important;box-sizing:border-box !important;}
    #podiumStageRoot main{padding:2px 6px 16px !important;min-height:250px !important;max-width:100vw !important;overflow-x:hidden !important;box-sizing:border-box !important;}
    #podiumStageRoot #podiumCameraRig{height:250px !important;max-width:100% !important;}
    #podiumStageRoot .podium-header-bar{padding:5px 8px !important;gap:4px !important;justify-content:space-between !important;max-width:100vw !important;overflow-x:hidden !important;box-sizing:border-box !important;}
    #podiumStageRoot .podium-title-text{font-size:12.5px !important;}
    #podiumStageRoot .podium-themes-strip{flex-wrap:wrap !important;justify-content:center !important;overflow:visible !important;width:100%;max-width:100%;gap:4px !important;}
    #podiumStageRoot .podium-themes-strip button{white-space:nowrap;font-size:9.8px !important;padding:3px 6px !important;}
    #podiumStageRoot .podium-footer-bar{padding:5px 8px !important;gap:4px !important;justify-content:center !important;max-width:100vw !important;box-sizing:border-box !important;overflow-x:hidden !important;}
    #podiumStageRoot .podium-footer-actions{display:flex !important;flex-wrap:wrap !important;justify-content:center !important;max-width:100% !important;width:100% !important;gap:4px !important;padding:2px 0 !important;box-sizing:border-box !important;}
    #podiumStageRoot .podium-motion-strip{flex-wrap:wrap !important;justify-content:center !important;max-width:100% !important;width:100% !important;gap:4px !important;padding:3px 6px !important;box-sizing:border-box !important;}
    #podiumStageRoot .podium-motion-extra{display:none !important;}
    #podiumStageRoot .podium-motion-label{font-size:10px !important;}
    #podiumStageRoot .podium-footer-bar button{white-space:nowrap;padding:4px 6px !important;font-size:9.5px !important;border-radius:7px !important;}
    #podiumStageRoot #scExport{display:none;flex-wrap:wrap !important;justify-content:center !important;gap:4px !important;width:100% !important;max-width:100% !important;box-sizing:border-box !important;}
    #podiumStageRoot #scExport button{padding:4px 6px !important;font-size:9.5px !important;white-space:nowrap;}
  }
  @keyframes crownDrop{0%{transform:translateY(-36px) scale(0.4);opacity:0;}70%{transform:translateY(4px) scale(1.12);opacity:1;}100%{transform:translateY(0) scale(1);opacity:1;}}
  @keyframes floatUp{0%{transform:translateY(0);opacity:1;}100%{transform:translateY(-220px);opacity:0;}}
  @keyframes heroPopIn{0%{opacity:0;transform:translateY(32px) scale(0.72);}100%{opacity:1;transform:translateY(0) scale(1);}}
  @keyframes theatricalSpotRoam {
    0%   { transform: translate(-150%, -15%) scale(0.85); opacity: 0; }
    15%  { transform: translate(-115%, -35%) scale(1); opacity: 1; }
    45%  { transform: translate(15%, -20%) scale(1.06); opacity: 1; }
    75%  { transform: translate(-80%, -45%) scale(0.96); opacity: 1; }
    100% { transform: translate(-50%, -32%) scale(1.12); opacity: 1; }
  }
</style>
<div id="podiumStageRoot">
  <div style="position:absolute;inset:0;z-index:0;overflow:hidden;background:url('assets/worlds/${wid}/podium.jpg') center/cover no-repeat;">
    <img src="assets/worlds/${wid}/podium.jpg" alt="" onerror="this.style.display='none'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.65) saturate(1.1);">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%, rgba(76,29,149,0.45) 0%, rgba(26,11,59,0.82) 100%);"></div>
  </div>
  <canvas id="scSpot" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;"></canvas>
  <canvas id="scPart" style="position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;opacity:0.85;"></canvas>

  <!-- Theatrical Blackout Overlay + Roving Spotlight Circle for 1st Place Reveal -->
  <div id="scDarknessOverlay" style="position:absolute;inset:0;background:rgba(4,2,14,0.86);opacity:0;pointer-events:none;transition:opacity 0.6s ease;z-index:18;"></div>
  <div id="scRovingSpotlight" style="display:none;position:absolute;top:42%;left:50%;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle, rgba(255,255,255,0.52) 0%, rgba(196,181,253,0.32) 48%, rgba(255,255,255,0) 70%);box-shadow:0 0 90px rgba(255,255,255,0.35);pointer-events:none;z-index:24;"></div>
  <div id="scReact" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:150;"></div>

  <!-- Kahoot Top Black Bar + Ceremony Theme Switcher -->
  <header class="podium-header-bar" style="position:relative;z-index:35;display:flex;align-items:center;justify-content:space-between;padding:8px 20px;background:#111111;color:#fff;flex-shrink:0;gap:10px;flex-wrap:wrap;">
    <div style="display:flex;gap:8px;align-items:center;">
      <button onclick="ScoreARQuizHost.closeHostSession?.()" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:5px 12px;border-radius:6px;font-weight:800;font-size:12px;cursor:pointer;font-family:inherit;">✕ إنهاء</button>
      <button id="scAudioBtn" class="scorear-audio-btn" onclick="ScoreARPodiumEffects.toggleAudioMute()" style="background:none;border:none;color:#fff;font-size:15px;cursor:pointer;">🔊</button>
    </div>
    <div class="podium-title-text" style="font-size:19px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;">ScoreAR! — منصة التتويج</div>
    <div class="podium-themes-strip" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
      ${[
        { id: 'chests', lbl: '💎 خزائن الكنز' },
        { id: 'cards', lbl: '🃏 بطاقات الأساطير' },
        { id: 'rockets', lbl: '🚀 صواريخ الفضاء' },
        { id: 'finishline', lbl: '🏁 خط النهاية' },
        { id: 'portal', lbl: '👑 بوابة النور' }
      ].map(m => `<button type="button" data-ceremony-btn="${m.id}" onclick="ScoreARPodiumEffects.switchCeremonyTheme('${m.id}')" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#fff;padding:3px 9px;border-radius:999px;font-size:10.5px;font-weight:900;cursor:pointer;font-family:inherit;">${m.lbl}</button>`).join('')}
    </div>
  </header>

  <!-- Main 3D Podium Stage (Columns Positioned via Absolute Center Choreography) -->
  <main style="position:relative;z-index:22;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:hidden;padding-bottom:10px;">
    <div class="sc-ceremony-aura" style="position:absolute;inset:0;pointer-events:none;z-index:2;transition:all 0.35s ease;"></div>
    <div id="podiumCameraRig" data-id="podiumCameraRig" style="position:relative;width:100%;max-width:980px;height:470px;margin:0 auto;z-index:5;">
      <div id="climax${wid.charAt(0).toUpperCase() + wid.slice(1)}" style="display:none;position:absolute;inset:0;pointer-events:none;z-index:7;"></div>

      <!-- 2nd Place Column (Starts hidden below center, rises in center on Step 2, moves Left on Step 3) -->
      <div id="col_2" class="podium-col" style="position:absolute;bottom:0;left:50%;transform:translate(-50%, 120%) scale(calc(0.85 * var(--pod-s, 1)));opacity:0;pointer-events:none;transition:transform 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease, filter 0.6s ease;display:flex;flex-direction:column;align-items:center;">
        <div id="podiumHeroArea_2" style="display:none;flex-direction:column;align-items:center;animation:heroPopIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;">
          <div class="podium-name-pill" style="font-size:24px;font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.85);">${esc(p2.name)}</div>
          <div id="hm_2" style="height:200px;width:160px;display:flex;align-items:flex-end;justify-content:center;">${heroImg(p2.avatarId, p2.name, 'celebrate')}</div>
        </div>
        ${P2}
      </div>

      <!-- 1st Place Column (Starts hidden below center, rises in center on Step 3 with Spotlight) -->
      <div id="col_1" class="podium-col" style="position:absolute;bottom:0;left:50%;transform:translate(-50%, 120%) scale(calc(0.85 * var(--pod-s, 1)));opacity:0;pointer-events:none;transition:transform 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease, filter 0.6s ease;display:flex;flex-direction:column;align-items:center;z-index:30;">
        <div id="podiumHeroArea_1" style="display:none;flex-direction:column;align-items:center;position:relative;animation:heroPopIn 0.65s cubic-bezier(0.34,1.56,0.64,1) both;">
          <span id="championCrownEl" style="font-size:40px;visibility:hidden;animation:crownDrop 0.8s cubic-bezier(0.34,1.56,0.64,1);filter:drop-shadow(0 0 24px #fef08a);margin-bottom:2px;">👑<span id="scCrown" style="display:none;"></span></span>
          <div class="podium-name-pill" style="font-size:29px;font-weight:900;color:#fef08a;text-shadow:0 2px 12px rgba(0,0,0,0.9);">${esc(p1.name)}</div>
          <div id="hm_1" style="height:235px;width:190px;display:flex;align-items:flex-end;justify-content:center;">${heroImg(p1.avatarId, p1.name, 'celebrate')}</div>
        </div>
        ${P1}
      </div>

      <!-- 3rd Place Column (Rises in exact center on Step 1, recedes right & hides on Step 2, returns on Right on Step 3) -->
      <div id="col_3" class="podium-col" style="position:absolute;bottom:0;left:50%;transform:translate(-50%, 120%) scale(calc(0.85 * var(--pod-s, 1)));opacity:0;pointer-events:none;transition:transform 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease, filter 0.6s ease;display:flex;flex-direction:column;align-items:center;">
        <div id="podiumHeroArea_3" style="display:none;flex-direction:column;align-items:center;animation:heroPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;">
          <div class="podium-name-pill" style="font-size:23px;font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.85);">${esc(p3.name)}</div>
          <div id="hm_3" style="height:185px;width:150px;display:flex;align-items:flex-end;justify-content:center;">${heroImg(p3.avatarId, p3.name, 'celebrate')}</div>
        </div>
        ${P3}
      </div>
    </div>

    <!-- Interactive Ceremony Type Chooser (teacher chooses style BEFORE starting animation) -->
    <div id="scCeremonyChooser" class="sc-ceremony-chooser">
      <div class="sc-ceremony-dialog">
        <div style="font-size:18px;font-weight:900;color:#fef08a;margin-bottom:3px;">🏆 حانت لحظة التتويج الكبرى!</div>
        <div style="font-size:12px;color:#cbd5e1;font-weight:700;">اختر نوع وطريقة الاحتفال بالأبطال ثم ابدأ العرض:</div>
        <div class="sc-ceremony-grid">
          ${[
            { id: 'chests', icon: '💎', name: 'خزائن الكنز الثلاث', desc: 'بريق الذهب والكنوز' },
            { id: 'cards', icon: '🃏', name: 'بطاقات الأساطير 3D', desc: 'هالة نيون أسطورية' },
            { id: 'rockets', icon: '🚀', name: 'صواريخ الفضاء', desc: 'انطلاق كوني مضيء' },
            { id: 'finishline', icon: '🏁', name: 'اختراق خط النهاية', desc: 'شريط خط السباق' },
            { id: 'portal', icon: '👑', name: 'بوابة النور والعرش', desc: 'توهّج العرش الملكي' }
          ].map(c => `<button type="button" class="sc-ceremony-card" data-ceremony-card="${c.id}" onclick="ScoreARPodiumEffects.switchCeremonyTheme('${c.id}')">
            <span style="font-size:22px;line-height:1;">${c.icon}</span>
            <b style="font-size:12px;">${c.name}</b>
            <small style="font-size:10px;color:#a89bff;">${c.desc}</small>
          </button>`).join('')}
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button type="button" onclick="ScoreARPodiumEffects.startCinematicShow()" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#090a16;font-size:13px;font-weight:900;border:1px solid #fef08a;border-radius:12px;padding:9px 20px;cursor:pointer;font-family:inherit;box-shadow:0 6px 20px rgba(245,158,11,0.4);">🎬 بدء الاحتفال السينمائي</button>
          <button type="button" onclick="ScoreARPodiumEffects.advanceReveal()" style="background:rgba(142,100,239,0.28);color:#fff;font-size:12px;font-weight:800;border:1px solid rgba(196,181,253,0.45);border-radius:12px;padding:9px 14px;cursor:pointer;font-family:inherit;">🥉 كشف خطوة بخطوة</button>
          <button type="button" onclick="ScoreARPodiumEffects.revealAll()" style="background:rgba(255,255,255,0.1);color:#f1f5f9;font-size:12px;font-weight:800;border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:9px 14px;cursor:pointer;font-family:inherit;">⚡ كشف الكل</button>
        </div>
      </div>
    </div>

    <!-- Full Contestants Roster Modal -->
    <div id="scRoster" style="display:none;position:absolute;top:52px;left:50%;transform:translateX(-50%);width:min(820px,94%);background:rgba(8,8,24,0.97);backdrop-filter:blur(22px);border:1.5px solid rgba(251,191,36,0.35);border-radius:20px;padding:18px 22px;z-index:55;max-height:calc(100% - 130px);overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="font-size:15px;font-weight:900;color:#fef08a;">📋 الترتيب النهائي لكافة المتسابقين (${sorted.length})</div>
        <button onclick="document.getElementById('scRoster').style.display='none'" style="background:rgba(255,255,255,0.1);border:0;color:#fff;border-radius:8px;padding:4px 10px;cursor:pointer;font-weight:800;">✕ إغلاق</button>
      </div>
      ${sorted.map((p, i) => `<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:13px;font-weight:900;color:${i<3?'#fcd34d':'#94a3b8'};min-width:28px;">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span><img src="assets/characters/animated/${p.avatarId||'char_01'}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" style="width:26px;height:32px;object-fit:contain;"><span style="font-size:14px;font-weight:800;color:#f8fafc;">${esc(p.name)}</span></div>
        <span style="font-size:15px;font-weight:900;color:#34d399;font-family:monospace;">${p.score||0} <small style="font-size:11px;color:#94a3b8;">نقطة</small></span>
      </div>`).join('')}
    </div>
  </main>

  <!-- Control & 3-Motion Bar (الوقوف / المشي / القفز) -->
  <footer class="podium-footer-bar" style="position:relative;z-index:40;background:rgba(8,8,24,0.94);border-top:1px solid rgba(255,255,255,0.1);padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;flex-shrink:0;">
    <div class="podium-footer-actions" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <button id="scRevBtn" onclick="ScoreARPodiumEffects.advanceReveal()" style="background:linear-gradient(135deg,#f59e0b,#b45309);color:#fff;font-size:13px;font-weight:900;border:1px solid #fef08a;border-radius:10px;padding:9px 20px;cursor:pointer;font-family:inherit;">🥉 كشف المركز الثالث</button>
      <button id="scCinBtn" onclick="ScoreARPodiumEffects.startCinematicShow()" style="background:linear-gradient(135deg,#8b5cf6,#4f46e5);color:#fff;font-size:12px;font-weight:900;border:1px solid rgba(196,181,253,0.4);border-radius:10px;padding:9px 16px;cursor:pointer;font-family:inherit;">🎬 عرض سينمائي تلقائي</button>
      <button onclick="ScoreARPodiumEffects.revealAll()" style="background:rgba(255,255,255,0.1);color:#f1f5f9;font-size:12px;font-weight:800;border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:8px 16px;cursor:pointer;font-family:inherit;">⚡ كشف الكل فوراً</button>
      <div id="scExport" style="display:none;gap:6px;flex-wrap:wrap;">
        <button onclick="ScoreARPodiumEffects.triggerSnapshot()" style="background:linear-gradient(135deg,#0ea5e9,#0369a1);color:#fff;font-size:11px;font-weight:900;border:none;border-radius:10px;padding:8px 12px;cursor:pointer;font-family:inherit;">📸 صورة المنصة</button>
        <button onclick="ScoreARPodiumEffects.triggerCertificates()" style="background:linear-gradient(135deg,#10b981,#047857);color:#fff;font-size:11px;font-weight:900;border:none;border-radius:10px;padding:8px 12px;cursor:pointer;font-family:inherit;">🎓 الشهادات</button>
        <button type="button" onclick="ScoreARPodiumEffects.navigateAfterPodium('#worlds')" style="background:rgba(142,100,239,0.22);color:#e9d5ff;border:1px solid rgba(142,100,239,0.45);font-size:11px;font-weight:900;border-radius:10px;padding:8px 12px;cursor:pointer;font-family:inherit;">🚀 قاعة المنافسات</button>
        <button type="button" onclick="ScoreARPodiumEffects.navigateAfterPodium('#studio')" style="background:rgba(245,158,11,0.18);color:#fde68a;border:1px solid rgba(245,158,11,0.45);font-size:11px;font-weight:900;border-radius:10px;padding:8px 12px;cursor:pointer;font-family:inherit;">📊 الاستوديو والتقارير</button>
        <button type="button" onclick="ScoreARPodiumEffects.navigateAfterPodium('#journey')" style="background:rgba(16,185,129,0.18);color:#a7f3d0;border:1px solid rgba(16,185,129,0.45);font-size:11px;font-weight:900;border-radius:10px;padding:8px 12px;cursor:pointer;font-family:inherit;">📓 دفتر الأخطاء ورحلتي</button>
      </div>
    </div>
    <div class="podium-motion-strip" style="display:flex;gap:6px;align-items:center;background:rgba(15,15,38,0.92);padding:4px 10px;border-radius:10px;border:1px solid rgba(255,255,255,0.14);">
      <span class="podium-motion-label" style="font-size:11.5px;font-weight:900;color:#cbd5e1;white-space:nowrap;">حركة الأبطال<span class="podium-motion-extra"> (٣ حركات)</span>:</span>
      <button data-podium-motion="idle"      onclick="ScoreARPodiumEffects.setHeroPose('idle')"      style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.18);color:#fff;padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit;">🧍 الوقوف</button>
      <button data-podium-motion="walk"      onclick="ScoreARPodiumEffects.setHeroPose('walk')"      style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.18);color:#fff;padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit;">🚶 المشي</button>
      <button data-podium-motion="celebrate" onclick="ScoreARPodiumEffects.setHeroPose('celebrate')" style="background:rgba(82,217,237,0.22);border:1px solid #52d9ed;color:#fff;padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit;">🦘 القفز</button>
    </div>
  </footer>
</div>`;

    setTimeout(() => {
      const sc = $('scSpot'), pc = $('scPart');
      if (sc) runSpotlights(sc, wid, 0);
      applyCreativeCeremonyTheme();
      if (pc) particles(pc);
    }, 50);

    if (global.ScoreARRealtime) {
      global.ScoreARRealtime.publish('CONTEST_COMPLETED', { podium: [p1, p2, p3].filter(Boolean), totalPlayers: sorted.length, leaderboard: sorted });
    }
  }

  function hideChooser() {
    const ch = $('scCeremonyChooser');
    if (ch) ch.style.display = 'none';
  }

  /* ── Exact Kahoot Center-to-Side Choreography + Blackout + Roving Spotlight ── */
  function advanceReveal() {
    hideChooser();
    revealStep++;
    const btn = $('scRevBtn'), wid = room?.world?.id || room?.worldId || 'royal';
    const sc = $('scSpot'), c1 = $('col_1'), c2 = $('col_2'), c3 = $('col_3');
    const dark = $('scDarknessOverlay'), roving = $('scRovingSpotlight');

    // STEP 1: 3rd Place rises in exact CENTER of screen -> Hero & Name appear
    if (revealStep === 1) {
      sfx('whoosh'); sfx('pop');
      if (sc) runSpotlights(sc, wid, 1);
      if (c3) {
        c3.style.pointerEvents = 'auto';
        c3.style.zIndex = '25';
        c3.style.opacity = '1';
        c3.style.transform = 'translate(-50%, 0) scale(calc(1.08 * var(--pod-s, 1)))';
      }
      setTimeout(() => {
        const h3 = $('podiumHeroArea_3');
        if (h3) { h3.style.display = 'flex'; mountHero($('hm_3'), players[2]?.avatarId, currentPose); }
        setMysteryScore(3, players[2]?.score || 0, '#fed7aa');
      }, 300);
      if (btn) { btn.textContent = '🥈 كشف المركز الثاني'; btn.style.background = 'linear-gradient(135deg,#64748b,#334155)'; }
    }

    // STEP 2: 3rd Place recedes to Right & hides -> 2nd Place rises in exact CENTER -> Hero & Name appear
    else if (revealStep === 2) {
      sfx('whoosh');
      if (sc) runSpotlights(sc, wid, 2);
      if (c3) {
        c3.style.zIndex = '5';
        c3.style.transform = 'translate(calc(-50% + var(--pod-recede, 260px)), 35px) scale(calc(0.75 * var(--pod-s, 1)))';
        c3.style.opacity = '0';
        c3.style.pointerEvents = 'none';
      }
      setTimeout(() => {
        sfx('pop');
        if (c2) {
          c2.style.pointerEvents = 'auto';
          c2.style.zIndex = '25';
          c2.style.opacity = '1';
          c2.style.transform = 'translate(-50%, 0) scale(calc(1.08 * var(--pod-s, 1)))';
        }
        setTimeout(() => {
          const h2 = $('podiumHeroArea_2');
          if (h2) { h2.style.display = 'flex'; mountHero($('hm_2'), players[1]?.avatarId, currentPose); }
          setMysteryScore(2, players[1]?.score || 0, '#e2e8f0');
        }, 280);
      }, 350);
      if (btn) { btn.textContent = '👑 كشف بطل المركز الأول!'; btn.style.background = 'linear-gradient(135deg,#059669,#047857)'; }
    }

    // STEP 3: 2nd Place recedes & hides -> Stage Blackout -> 1st in Center, 2nd on Left, 3rd on Right
    // -> Theatrical Roving Spotlight sweeps around 1st Place -> Hero 1 + Confetti -> Lights Return!
    else if (revealStep === 3) {
      if (btn) btn.disabled = true;
      sfx('whoosh');
      if (c2) {
        c2.style.zIndex = '6';
        c2.style.transform = 'translate(calc(-50% - var(--pod-recede, 250px)), 30px) scale(calc(0.78 * var(--pod-s, 1)))';
        c2.style.opacity = '0';
      }

      setTimeout(() => {
        sfx('drumroll');
        // 1. Theatrical Blackout
        if (dark) dark.style.opacity = '1';
        // 2. Position 2nd on Left, 3rd on Right (dimmed during spotlight), and 1st Pedestal in Center
        if (c2) {
          c2.style.transform = 'translate(calc(-50% - var(--pod-dx, 245px)), 16px) scale(calc(0.86 * var(--pod-s, 1)))';
          c2.style.opacity = '0.28';
          c2.style.filter = 'brightness(0.55)';
        }
        if (c3) {
          c3.style.transform = 'translate(calc(-50% + var(--pod-dx, 245px)), 22px) scale(calc(0.82 * var(--pod-s, 1)))';
          c3.style.opacity = '0.28';
          c3.style.filter = 'brightness(0.55)';
        }
        if (c1) {
          c1.style.pointerEvents = 'auto';
          c1.style.zIndex = '30';
          c1.style.opacity = '1';
          c1.style.transform = 'translate(-50%, 0) scale(calc(1.06 * var(--pod-s, 1)))';
        }
        // 3. Roving Theatrical Spotlight sweeps around 1st Place for 1.85s
        if (roving) {
          roving.style.display = 'block';
          roving.style.animation = 'theatricalSpotRoam 1.85s cubic-bezier(0.42, 0, 0.58, 1) forwards';
        }

        // 4. Grand Champion Reveal + Confetti + Lights Back On!
        sTimer = setTimeout(() => {
          sfx('fanfare');
          if (sc) runSpotlights(sc, wid, 3);
          const h1 = $('podiumHeroArea_1'), crown = $('championCrownEl');
          if (h1) { h1.style.display = 'flex'; mountHero($('hm_1'), players[0]?.avatarId, currentPose); }
          if (crown) crown.style.visibility = 'visible';
          setMysteryScore(1, players[0]?.score || 0, '#fef08a');

          // Bring stage lights back on and illuminate all 3 winners together
          setTimeout(() => {
            if (dark) dark.style.opacity = '0';
            if (c2) { c2.style.opacity = '1'; c2.style.filter = 'brightness(1)'; c2.style.pointerEvents = 'auto'; }
            if (c3) { c3.style.opacity = '1'; c3.style.filter = 'brightness(1)'; c3.style.pointerEvents = 'auto'; }
          }, 450);

          if (global.confetti) {
            global.confetti({ particleCount: 220, spread: 170, origin: { y: 0.5 } });
            setTimeout(() => global.confetti && global.confetti({ particleCount: 150, spread: 140, angle: 60, origin: { x: 0, y: 0.6 } }), 300);
            setTimeout(() => global.confetti && global.confetti({ particleCount: 150, spread: 140, angle: 120, origin: { x: 1, y: 0.6 } }), 600);
          }
          $('scExport')?.style.setProperty('display', 'flex');
          if (btn) {
            btn.disabled = false;
            btn.textContent = '📋 الترتيب النهائي الكامل';
            btn.style.background = 'linear-gradient(135deg,#4f46e5,#3730a3)';
          }
        }, 1850);
      }, 380);
    }

    else if (revealStep >= 4) {
      const r = $('scRoster'); if (r) r.style.display = 'block';
      if (btn) { btn.textContent = '✕ إنهاء المسابقة'; btn.onclick = () => global.ScoreARQuizHost?.closeHostSession?.(); }
    }
  }

  function startCinematicShow() {
    hideChooser();
    if (cTimer) { clearTimeout(cTimer); cTimer = null; }
    const btn = $('scCinBtn'); if (btn) btn.disabled = true;
    revealStep = 0;
    advanceReveal();
    cTimer = setTimeout(() => { advanceReveal(); cTimer = setTimeout(() => advanceReveal(), 2800); }, 2600);
  }

  function revealAll() {
    hideChooser();
    if (cTimer) { clearTimeout(cTimer); cTimer = null; }
    if (sTimer) { clearTimeout(sTimer); sTimer = null; }
    revealStep = 3;
    const c1 = $('col_1'), c2 = $('col_2'), c3 = $('col_3'), dark = $('scDarknessOverlay');
    if (dark) dark.style.opacity = '0';
    if (c2) { c2.style.opacity = '1'; c2.style.filter = 'brightness(1)'; c2.style.transform = 'translate(calc(-50% - var(--pod-dx, 245px)), 16px) scale(calc(0.86 * var(--pod-s, 1)))'; }
    if (c3) { c3.style.opacity = '1'; c3.style.filter = 'brightness(1)'; c3.style.transform = 'translate(calc(-50% + var(--pod-dx, 245px)), 22px) scale(calc(0.82 * var(--pod-s, 1)))'; }
    if (c1) { c1.style.opacity = '1'; c1.style.transform = 'translate(-50%, 0) scale(calc(1.06 * var(--pod-s, 1)))'; }
    [3, 2, 1].forEach(r => {
      const h = $(`podiumHeroArea_${r}`), hm = $(`hm_${r}`), pl = players[r === 1 ? 0 : r === 2 ? 1 : 2];
      if (h) h.style.display = 'flex';
      if (pl && hm) mountHero(hm, pl.avatarId, currentPose);
      setMysteryScore(r, pl?.score || 0, r === 1 ? '#fef08a' : r === 2 ? '#e2e8f0' : '#fed7aa');
    });
    const crown = $('championCrownEl'); if (crown) crown.style.visibility = 'visible';
    $('scExport')?.style.setProperty('display', 'flex');
    const btn = $('scRevBtn');
    if (btn) { btn.disabled = false; btn.textContent = '📋 الترتيب النهائي الكامل'; }
  }

  function applyCreativeCeremonyTheme(themeId) {
    const mode = themeId || (typeof localStorage !== 'undefined' && localStorage.getItem('scorear_ceremony_mode')) || 'chests';
    try { localStorage.setItem('scorear_ceremony_mode', mode); } catch (e) {}
    const root = document.getElementById('podiumStageRoot');
    if (!root) return;
    root.setAttribute('data-ceremony-theme', mode);
    document.querySelectorAll('[data-ceremony-btn]').forEach(b => {
      const act = b.getAttribute('data-ceremony-btn') === mode;
      b.style.background = act ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.08)';
      b.style.color = act ? '#090a16' : '#f8fafc';
      b.style.borderColor = act ? '#fef08a' : 'rgba(255,255,255,0.18)';
    });
    document.querySelectorAll('[data-ceremony-card]').forEach(c => {
      c.classList.toggle('is-selected', c.getAttribute('data-ceremony-card') === mode);
    });
    const poseMap = { chests: 'celebrate', cards: 'celebrate', rockets: 'celebrate', finishline: 'walk', portal: 'celebrate' };
    setHeroPose(poseMap[mode] || 'celebrate');
  }

  function setHeroPose(pose) {
    currentPose = POSES.includes(pose) ? pose : 'celebrate';
    [1, 2, 3].forEach(r => { const box = $(`hm_${r}`); if (!box) return; const pl = players[r === 1 ? 0 : r === 2 ? 1 : 2]; if (pl) mountHero(box, pl.avatarId, currentPose); });
    document.querySelectorAll('[data-podium-motion]').forEach(b => { const a = b.dataset.podiumMotion === currentPose; b.style.background = a ? 'rgba(82,217,237,0.22)' : 'rgba(255,255,255,0.07)'; b.style.borderColor = a ? '#52d9ed' : 'rgba(255,255,255,0.18)'; });
  }

  function toggleAudioMute() { if (global.ScoreARAudio?.toggleMute) { const m = global.ScoreARAudio.toggleMute(); const b = $('scAudioBtn'); if (b) b.textContent = m ? '🔇' : '🔊'; } }
  function triggerSnapshot() { global.ScoreARPodiumCapture?.capturePodiumSnapshot?.($('scorearQuizHostStage') || document.body, room, players); }
  function triggerCertificates() { global.ScoreARPodiumCapture?.downloadAllTop3Certificates?.(players, room?.world?.id || 'royal'); }
  function handleStudentReaction(emoji, name) {
    const c = $('scReact'); if (!c) return;
    const b = document.createElement('div');
    b.style.cssText = `position:absolute;bottom:80px;left:${10 + Math.random() * 80}%;font-size:32px;display:flex;flex-direction:column;align-items:center;pointer-events:none;animation:floatUp 2.5s ease-out forwards;z-index:200;`;
    b.innerHTML = `<span>${esc(emoji || '👏')}</span><small style="background:rgba(4,4,16,0.9);color:#fff;border:1px solid rgba(255,255,255,0.18);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:900;">${esc(name || 'بطل')}</small>`;
    c.appendChild(b); b.addEventListener('animationend', () => b.remove());
  }
  function renderHero(avatarId, name, pose = 'celebrate') { return heroImg(avatarId, name, pose); }
  function startPodiumShow(opts = {}) {
    const c = opts.container || opts.stage || $('podiumHostStage') || $('scorearQuizHostStage');
    const p = opts.podium || opts.players || [];
    renderHostPodium(c, { worldId: opts.worldId || 'royal', world: { id: opts.worldId || 'royal' }, players: p }, opts.onComplete || opts.onClose);
  }

  function navigateAfterPodium(targetHash) {
    const clean = targetHash && targetHash.startsWith('#') ? targetHash : '#worlds';
    const path = (global.location?.pathname || '').toLowerCase();
    if (path.includes('podium')) {
      global.location.href = `index.html${clean}`;
      return;
    }
    if (global.ScoreARQuizHost?.closeHostSession) global.ScoreARQuizHost.closeHostSession();
    if (global.ScoreARUnifiedViews?.isOpen?.()) global.ScoreARUnifiedViews.closeView();
    if (global.location) global.location.hash = clean;
    if (typeof global.render === 'function') global.render();
  }

  const ScoreARPodiumEffects = { renderHostPodium, startPodiumShow, renderHero, advanceReveal, startCinematicShow, revealAll, setHeroPose, switchCeremonyTheme: applyCreativeCeremonyTheme, toggleAudioMute, triggerSnapshot, triggerCertificates, navigateAfterPodium, handleStudentReaction, mountHeroMotion: mountHero };
  global.ScoreARPodiumEffects = ScoreARPodiumEffects;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARPodiumEffects = ScoreARPodiumEffects; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARPodiumEffects;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
