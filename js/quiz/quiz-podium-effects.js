/**
 * ScoreAR Kahoot Studio 3D Podium Ceremony v12 (quiz-podium-effects.js)
 * Exact Kahoot Choreography (3rd -> 2nd -> 1st in Center with Blackout & Roving Spotlight)
 * + Cosmic Glass Control Bars & Vector Gear Icons.
 * Strictly 3 Hero Motions: idle (الوقوف), walk (المشي), celebrate (القفز).
 * Strictly Rule 7 compliant (< 390 lines).
 */
(function (global) {
  'use strict';
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const sfx = n => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n); };
  const $   = id => document.getElementById(id);
  const ic  = (n, sz = 14) => (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') ? global.ScoreARUI.icon(n, { size: sz }) : '';

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
      <img src="assets/characters/animated/${code}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${esc(charName)}" style="max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 16px 28px rgba(0,0,0,0.82));">
    </div>`;
  }

  function mountHero(el, avatarId, pose = 'celebrate') {
    if (!el) return;
    const validPose = POSES.includes(pose) ? pose : 'celebrate';
    const w = el.offsetWidth || parseInt(el.style?.width, 10) || 220;
    const h = el.offsetHeight || parseInt(el.style?.height, 10) || 260;
    if (global.ScoreARMotionEngine?.mount) global.ScoreARMotionEngine.mount(el, charCode(avatarId), validPose, { width: w, height: h });
    else el.innerHTML = heroImg(avatarId, '', validPose);
  }

  function resetRovingSpotlight() {
    const r = $('scRovingSpotlight');
    if (r) { r.style.display = 'none'; r.style.opacity = '0'; r.style.animation = 'none'; }
  }

  /* ── Preserved Constant: 3D Isometric Pedestal with Pentagon Rank Shield ── */
  function pedestal3D(rank, heightPx, widthPx) {
    const themes = {
      1: { face: 'linear-gradient(180deg, #4c1d95 0%, #3b0764 100%)', top: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', pentBg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', pentBorder: '#fef08a' },
      2: { face: 'linear-gradient(180deg, #431482 0%, #2e1065 100%)', top: 'linear-gradient(135deg, #5b21b6 0%, #3b0764 100%)', pentBg: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)', pentBorder: '#e2e8f0' },
      3: { face: 'linear-gradient(180deg, #3b0f75 0%, #240a4d 100%)', top: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)', pentBg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', pentBorder: '#fed7aa' }
    };
    const t = themes[rank], pentSize = rank === 1 ? 94 : (rank === 2 ? 82 : 76);
    return `<div id="podiumPedestal_${rank}" class="kahoot-3d-pedestal ped-rank-${rank}" style="height:${heightPx}px;width:${widthPx}px;position:relative;transition:all 0.65s cubic-bezier(0.16,1,0.3,1);filter:drop-shadow(0 20px 38px rgba(0,0,0,0.82));">
      <div style="position:absolute;top:-22px;left:0;right:0;height:24px;background:${t.top};clip-path:polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%);z-index:6;"></div>
      <div style="position:absolute;inset:0;background:${t.face};border-top:2px solid rgba(255,255,255,0.22);border-radius:0 0 10px 10px;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:18px 10px 14px;overflow:hidden;box-shadow:inset 0 10px 24px rgba(255,255,255,0.12), inset 0 -18px 28px rgba(0,0,0,0.5);">
        <div style="width:${pentSize}px;height:${pentSize}px;background:${t.pentBorder};clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);display:grid;place-items:center;padding:4px;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.55));">
          <div style="width:100%;height:100%;background:${t.pentBg};clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);display:grid;place-items:center;font-size:${rank===1?42:35}px;font-weight:900;color:#ffffff;font-family:Montserrat,Arial,sans-serif;">
            <span id="pedMedal_${rank}">${rank}</span>
          </div>
        </div>
        <div id="podiumMystery_${rank}" style="width:90%;background:rgba(6,8,22,0.75);border:1.5px solid ${t.pentBorder};border-radius:8px;padding:5px 8px;text-align:center;font-family:Montserrat,Tajawal,sans-serif;font-size:16px;font-weight:900;color:#ffffff;">❓</div>
      </div>
    </div>`;
  }

  function runSpotlights(canvas, worldId, phase) {
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let t = 0; if (rafId) cancelAnimationFrame(rafId); spotCanvas = canvas;
    const drawCone = (H, ox, tx, halfW, col) => {
      const g = ctx.createLinearGradient(ox, 0, tx, H * 0.92);
      g.addColorStop(0, col); g.addColorStop(0.65, col.replace(/[\d.]+\)$/, '0.07)')); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.moveTo(ox - 12, 0); ctx.lineTo(ox + 12, 0);
      ctx.lineTo(tx + halfW, H); ctx.lineTo(tx - halfW, H);
      ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    };
    function frame() {
      if (!spotCanvas) return;
      const W = canvas.width = canvas.offsetWidth || 960, H = canvas.height = canvas.offsetHeight || 640;
      ctx.clearRect(0, 0, W, H);
      if (phase >= 1) {
        const sway = Math.sin(t * 0.65) * W * 0.08;
        drawCone(H, W * 0.18, W * 0.5 + sway, W * 0.15, 'rgba(167,139,250,0.16)');
        drawCone(H, W * 0.82, W * 0.5 - sway, W * 0.15, 'rgba(88,220,227,0.14)');
      }
      if (phase >= 3) {
        const pulse = 0.18 + Math.sin(t * 1.4) * 0.04;
        drawCone(H, W * 0.5, W * 0.5, W * 0.19, `rgba(251,191,36,${pulse.toFixed(2)})`);
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

    const P1 = pedestal3D(1, 205, 258);
    const P2 = pedestal3D(2, 165, 230);
    const P3 = pedestal3D(3, 140, 215);

    stage.innerHTML = `
<style>
  #podiumStageRoot{--pod-dx:clamp(240px,21vw,320px);--pod-recede:clamp(250px,22vw,335px);--pod-s:0.96;position:absolute;inset:0;display:flex;flex-direction:column;font-family:Cairo,Tajawal,Arial,sans-serif;background:#1a0b3b;overflow:hidden;box-sizing:border-box;}
  #podiumStageRoot main{max-width:none;margin:0;padding:4px 12px 6px;}
  #podiumStageRoot .podium-col{transform-origin:bottom center;}
  #podiumStageRoot[data-ceremony-theme="chests"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 62%,rgba(245,158,11,0.34),transparent 65%);}
  #podiumStageRoot[data-ceremony-theme="cards"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 62%,rgba(168,85,247,0.38),rgba(56,189,248,0.12) 45%,transparent 70%);}
  #podiumStageRoot[data-ceremony-theme="rockets"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 72%,rgba(14,165,233,0.42),rgba(99,102,241,0.16) 45%,transparent 72%);}
  #podiumStageRoot[data-ceremony-theme="finishline"] .sc-ceremony-aura{background:repeating-linear-gradient(90deg,rgba(255,255,255,0.16) 0 18px,rgba(16,185,129,0.22) 18px 36px);height:16px !important;top:auto !important;bottom:8px;border-radius:999px;max-width:740px;margin:0 auto;}
  #podiumStageRoot[data-ceremony-theme="portal"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 52%,rgba(254,240,138,0.38),rgba(139,92,246,0.24) 44%,transparent 72%);}
  .podium-name-pill{background:rgba(12,14,32,0.88);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.22);border-radius:999px;padding:4px 18px;margin-bottom:6px;position:relative;z-index:40;white-space:nowrap;box-shadow:0 8px 22px rgba(0,0,0,0.65);}
  @media (min-width:721px) and (max-height:820px){
    #podiumStageRoot{--pod-dx:clamp(220px,19.5vw,290px);--pod-recede:clamp(235px,21vw,305px);--pod-s:0.88;}
  }
  @media (min-width:721px) and (max-height:690px){
    #podiumStageRoot{--pod-dx:clamp(205px,18.5vw,270px);--pod-recede:clamp(220px,20vw,285px);--pod-s:0.81;}
  }
  @media (min-width:1440px) and (min-height:821px){
    #podiumStageRoot{--pod-dx:clamp(260px,21vw,335px);--pod-s:1.05;}
  }
  @media (min-width:1850px) and (min-height:880px){
    #podiumStageRoot{--pod-dx:345px;--pod-recede:360px;--pod-s:1.15;}
  }
  @media (max-width:960px) and (min-width:721px){
    #podiumStageRoot{--pod-dx:210px;--pod-recede:225px;--pod-s:0.78;}
  }
  @media (max-width:720px){
    #podiumStageRoot{--pod-dx:102px;--pod-recede:112px;--pod-s:0.39;max-width:100vw !important;overflow-x:hidden !important;}
    #podiumStageRoot main{padding:2px 6px 16px !important;min-height:250px !important;}
    #podiumStageRoot #podiumCameraRig{height:250px !important;max-width:100% !important;}
    #podiumStageRoot .podium-header-bar{padding:5px 8px !important;gap:4px !important;}
    #podiumStageRoot .podium-title-text{font-size:12.5px !important;}
    #podiumStageRoot .podium-themes-strip{flex-wrap:wrap !important;justify-content:center !important;width:100%;gap:4px !important;}
    #podiumStageRoot .podium-themes-strip button{font-size:9.8px !important;padding:3px 7px !important;}
    #podiumStageRoot .podium-footer-bar{padding:5px 8px !important;gap:4px !important;justify-content:center !important;}
    #podiumStageRoot .podium-footer-actions, #podiumStageRoot .podium-motion-strip, #podiumStageRoot #scExport{flex-wrap:wrap !important;justify-content:center !important;width:100% !important;gap:4px !important;}
    #podiumStageRoot .podium-motion-extra{display:none !important;}
    #podiumStageRoot .podium-footer-bar button{padding:4px 7px !important;font-size:9.5px !important;}
  }
  @keyframes crownDrop{0%{transform:translateY(-36px) scale(0.4);opacity:0;}70%{transform:translateY(4px) scale(1.12);opacity:1;}100%{transform:translateY(0) scale(1);opacity:1;}}
  @keyframes floatUp{0%{transform:translateY(0);opacity:1;}100%{transform:translateY(-220px);opacity:0;}}
  @keyframes heroPopIn{0%{opacity:0;transform:translateY(32px) scale(0.72);}100%{opacity:1;transform:translateY(0) scale(1);}}
  @keyframes theatricalSpotRoam {
    0%   { transform: translate(-155%, -12%) scale(0.88); opacity: 0; }
    16%  { transform: translate(-115%, -34%) scale(1.02); opacity: 0.92; }
    44%  { transform: translate(18%, -20%) scale(1.06); opacity: 0.92; }
    72%  { transform: translate(-75%, -44%) scale(0.98); opacity: 0.95; }
    84%  { transform: translate(-50%, -34%) scale(1.08); opacity: 0.85; }
    100% { transform: translate(-50%, -34%) scale(1.12); opacity: 0; }
  }
</style>
<div id="podiumStageRoot">
  <div style="position:absolute;inset:0;z-index:0;overflow:hidden;background:url('assets/worlds/${wid}/podium.jpg') center/cover no-repeat;">
    <img src="assets/worlds/${wid}/podium.jpg" alt="" onerror="this.style.display='none'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.65) saturate(1.1);">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%, rgba(76,29,149,0.45) 0%, rgba(26,11,59,0.82) 100%);"></div>
  </div>
  <canvas id="scSpot" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;"></canvas>
  <canvas id="scPart" style="position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;opacity:0.85;"></canvas>

  <div id="scDarknessOverlay" style="position:absolute;inset:0;background:rgba(4,2,14,0.86);opacity:0;pointer-events:none;transition:opacity 0.6s ease;z-index:18;"></div>
  <div id="scRovingSpotlight" style="display:none;position:absolute;top:38%;left:50%;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle, rgba(255,250,220,0.62) 0%, rgba(251,191,36,0.26) 40%, rgba(167,139,250,0.10) 62%, rgba(255,255,255,0) 76%);filter:blur(16px);mix-blend-mode:screen;opacity:0;transition:opacity 0.55s ease;pointer-events:none;z-index:24;"></div>
  <div id="scReact" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:150;"></div>

  <!-- Cosmic Glass Top Bar + Ceremony Theme Switcher -->
  <header class="podium-header-bar scorear-control-bar" style="position:relative;z-index:35;display:flex;align-items:center;justify-content:space-between;padding:8px 20px;color:#fff;flex-shrink:0;gap:10px;flex-wrap:wrap;">
    <div style="display:flex;gap:8px;align-items:center;">
      <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.closeHostSession?.()" style="border-color:rgba(239,68,68,0.35);color:#fca5a5;">${ic('close', 13)} <span>إنهاء</span></button>
      <button type="button" id="scAudioBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARPodiumEffects.toggleAudioMute()">${ic('volume', 14)}</button>
    </div>
    <div class="podium-title-text" style="font-size:18px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;display:inline-flex;align-items:center;gap:7px;"><span style="color:#fbbf24;display:inline-flex;">${ic('crown', 18)}</span> <span>منصة التتويج الاحتفالية</span></div>
    <div class="podium-themes-strip" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
      ${[
        { id: 'chests', icn: 'award', lbl: 'خزائن الكنز' },
        { id: 'cards', icn: 'layers', lbl: 'بطاقات الأساطير' },
        { id: 'rockets', icn: 'planet', lbl: 'صواريخ الفضاء' },
        { id: 'finishline', icn: 'flag', lbl: 'خط النهاية' },
        { id: 'portal', icn: 'crown', lbl: 'بوابة النور' }
      ].map(m => `<button type="button" data-ceremony-btn="${m.id}" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.switchCeremonyTheme('${m.id}')" style="padding:4px 10px;border-radius:999px;font-size:11px;">${ic(m.icn, 12)} <span>${m.lbl}</span></button>`).join('')}
    </div>
  </header>

  <main style="position:relative;z-index:22;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:visible;padding-bottom:10px;">
    <div class="sc-ceremony-aura" style="position:absolute;inset:0;pointer-events:none;z-index:2;transition:all 0.35s ease;"></div>
    <div id="podiumCameraRig" data-id="podiumCameraRig" style="position:relative;width:100%;max-width:1180px;height:clamp(420px,68vh,620px);margin:0 auto;z-index:5;">
      <div id="climax${wid.charAt(0).toUpperCase() + wid.slice(1)}" style="display:none;position:absolute;inset:0;pointer-events:none;z-index:7;"></div>

      <div id="col_2" class="podium-col" style="position:absolute;bottom:0;left:50%;transform:translate(-50%, 120%) scale(calc(0.95 * var(--pod-s, 1)));opacity:0;pointer-events:none;transition:transform 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease, filter 0.6s ease;display:flex;flex-direction:column;align-items:center;">
        <div id="podiumHeroArea_2" style="display:none;flex-direction:column;align-items:center;animation:heroPopIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;">
          <div class="podium-name-pill" style="font-size:25px;font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.85);">${esc(p2.name)}</div>
          <div id="hm_2" style="height:255px;width:210px;display:flex;align-items:flex-end;justify-content:center;">${heroImg(p2.avatarId, p2.name, 'celebrate')}</div>
        </div>
        ${P2}
      </div>

      <div id="col_1" class="podium-col" style="position:absolute;bottom:0;left:50%;transform:translate(-50%, 120%) scale(calc(0.92 * var(--pod-s, 1)));opacity:0;pointer-events:none;transition:transform 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease, filter 0.6s ease;display:flex;flex-direction:column;align-items:center;z-index:30;">
        <div id="podiumHeroArea_1" style="display:none;flex-direction:column;align-items:center;position:relative;animation:heroPopIn 0.65s cubic-bezier(0.34,1.56,0.64,1) both;">
          <span id="championCrownEl" style="font-size:38px;line-height:1;visibility:hidden;animation:crownDrop 0.8s cubic-bezier(0.34,1.56,0.64,1);filter:drop-shadow(0 0 24px #fef08a);margin-bottom:-2px;">👑<span id="scCrown" style="display:none;"></span></span>
          <div class="podium-name-pill" style="font-size:30px;font-weight:900;color:#fef08a;text-shadow:0 2px 12px rgba(0,0,0,0.9);">${esc(p1.name)}</div>
          <div id="hm_1" style="height:295px;width:245px;display:flex;align-items:flex-end;justify-content:center;">${heroImg(p1.avatarId, p1.name, 'celebrate')}</div>
        </div>
        ${P1}
      </div>

      <div id="col_3" class="podium-col" style="position:absolute;bottom:0;left:50%;transform:translate(-50%, 120%) scale(calc(0.91 * var(--pod-s, 1)));opacity:0;pointer-events:none;transition:transform 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease, filter 0.6s ease;display:flex;flex-direction:column;align-items:center;">
        <div id="podiumHeroArea_3" style="display:none;flex-direction:column;align-items:center;animation:heroPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;">
          <div class="podium-name-pill" style="font-size:24px;font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.85);">${esc(p3.name)}</div>
          <div id="hm_3" style="height:235px;width:195px;display:flex;align-items:flex-end;justify-content:center;">${heroImg(p3.avatarId, p3.name, 'celebrate')}</div>
        </div>
        ${P3}
      </div>
    </div>

    <div id="scRoster" style="display:none;position:absolute;top:52px;left:50%;transform:translateX(-50%);width:min(820px,94%);background:rgba(12,13,29,0.96);backdrop-filter:blur(22px);border:1px solid rgba(172,139,242,0.35);border-radius:22px;padding:18px 22px;z-index:55;max-height:calc(100% - 130px);overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="font-size:15px;font-weight:900;color:#ffffff;display:inline-flex;align-items:center;gap:7px;">${ic('trophy', 16)} <span>الترتيب النهائي لكافة المتسابقين (${sorted.length})</span></div>
        <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scRoster').style.display='none'">✕ إغلاق</button>
      </div>
      ${sorted.map((p, i) => `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;font-weight:900;color:${i<3?'#fcd34d':'#a1a4be'};min-width:28px;font-family:Montserrat,monospace;">#${String(i+1).padStart(2,'0')}</span><img src="assets/characters/animated/${p.avatarId||'char_01'}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" style="width:26px;height:32px;object-fit:contain;"><span style="font-size:14px;font-weight:800;color:#f8fafc;">${esc(p.name)}</span></div>
        <span style="font-size:15px;font-weight:900;color:#58dce3;font-family:Montserrat,monospace;">${p.score||0} <small style="font-size:11px;color:#a1a4be;">نقطة</small></span>
      </div>`).join('')}
    </div>
  </main>

  <footer class="podium-footer-bar scorear-control-bar" style="position:relative;z-index:40;border-top:1px solid rgba(255,255,255,0.09);border-bottom:none;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;flex-shrink:0;">
    <div class="podium-footer-actions" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <button type="button" id="scRevBtn" class="btn launch-primary" onclick="ScoreARPodiumEffects.advanceReveal()" style="font-size:12.5px;font-weight:900;border-radius:10px;padding:8px 18px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">${ic('medal', 15)} <span>كشف المركز الثالث</span></button>
      <button type="button" id="scCinBtn" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.startCinematicShow()" style="border-color:rgba(172,139,242,0.45);color:#e2d4fb;padding:8px 14px;">${ic('play', 14)} <span>عرض سينمائي تلقائي</span></button>
      <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.revealAll()" style="padding:8px 14px;">${ic('zap', 14)} <span>كشف الكل فوراً</span></button>
      <div id="scExport" style="display:none;gap:6px;flex-wrap:wrap;">
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.triggerSnapshot()" style="border-color:rgba(88,220,227,0.45);color:#c7f9ff;padding:7px 12px;">${ic('camera', 13)} <span>صورة المنصة</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.triggerCertificates()" style="border-color:rgba(52,211,153,0.45);color:#a7f3d0;padding:7px 12px;">${ic('award', 13)} <span>الشهادات</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.navigateAfterPodium('#worlds')" style="padding:7px 12px;">${ic('planet', 13)} <span>قاعة المنافسات</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.navigateAfterPodium('#studio')" style="padding:7px 12px;">${ic('chart', 13)} <span>الاستوديو والتقارير</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.navigateAfterPodium('#journey')" style="padding:7px 12px;">${ic('book', 13)} <span>دفتر الأخطاء ورحلتي</span></button>
      </div>
    </div>
    <div class="podium-motion-strip" style="display:flex;gap:6px;align-items:center;background:rgba(14,16,34,0.88);padding:4px 10px;border-radius:11px;border:1px solid rgba(172,139,242,0.24);">
      <span class="podium-motion-label" style="font-size:11.5px;font-weight:800;color:#b1a2e9;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;">${ic('gamepad', 14)} حركة الأبطال<span class="podium-motion-extra"> (٣ حركات)</span>:</span>
      <button type="button" data-podium-motion="idle" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.setHeroPose('idle')" style="padding:4px 10px;font-size:11px;">الوقوف</button>
      <button type="button" data-podium-motion="walk" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.setHeroPose('walk')" style="padding:4px 10px;font-size:11px;">المشي</button>
      <button type="button" data-podium-motion="celebrate" class="scorear-gear-btn is-active" onclick="ScoreARPodiumEffects.setHeroPose('celebrate')" style="padding:4px 10px;font-size:11px;">القفز</button>
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

  /* ── Preserved Constant: Exact Center-to-Side Choreography + Blackout + Roving Spotlight ── */
  function advanceReveal() {
    revealStep++;
    const btn = $('scRevBtn'), wid = room?.world?.id || room?.worldId || 'royal';
    const sc = $('scSpot'), c1 = $('col_1'), c2 = $('col_2'), c3 = $('col_3');
    const dark = $('scDarknessOverlay'), roving = $('scRovingSpotlight');

    if (revealStep === 1) {
      sfx('whoosh'); sfx('pop');
      if (sc) runSpotlights(sc, wid, 1);
      if (c3) { c3.style.pointerEvents = 'auto'; c3.style.zIndex = '25'; c3.style.opacity = '1'; c3.style.transform = 'translate(-50%, 0) scale(calc(1.08 * var(--pod-s, 1)))'; }
      setTimeout(() => {
        const h3 = $('podiumHeroArea_3');
        if (h3) { h3.style.display = 'flex'; mountHero($('hm_3'), players[2]?.avatarId, currentPose); }
        setMysteryScore(3, players[2]?.score || 0, '#fed7aa');
      }, 300);
      if (btn) btn.innerHTML = `${ic('medal', 15)} <span>كشف المركز الثاني</span>`;
    } else if (revealStep === 2) {
      sfx('whoosh');
      if (sc) runSpotlights(sc, wid, 2);
      if (c3) { c3.style.zIndex = '5'; c3.style.transform = 'translate(calc(-50% + var(--pod-recede, 260px)), 35px) scale(calc(0.75 * var(--pod-s, 1)))'; c3.style.opacity = '0'; c3.style.pointerEvents = 'none'; }
      setTimeout(() => {
        sfx('pop');
        if (c2) { c2.style.pointerEvents = 'auto'; c2.style.zIndex = '25'; c2.style.opacity = '1'; c2.style.transform = 'translate(-50%, 0) scale(calc(1.08 * var(--pod-s, 1)))'; }
        setTimeout(() => {
          const h2 = $('podiumHeroArea_2');
          if (h2) { h2.style.display = 'flex'; mountHero($('hm_2'), players[1]?.avatarId, currentPose); }
          setMysteryScore(2, players[1]?.score || 0, '#e2e8f0');
        }, 280);
      }, 350);
      if (btn) btn.innerHTML = `${ic('crown', 15)} <span>كشف بطل المركز الأول!</span>`;
    } else if (revealStep === 3) {
      if (btn) btn.disabled = true;
      sfx('whoosh');
      if (c2) { c2.style.zIndex = '6'; c2.style.transform = 'translate(calc(-50% - var(--pod-recede, 250px)), 30px) scale(calc(0.78 * var(--pod-s, 1)))'; c2.style.opacity = '0'; }
      setTimeout(() => {
        sfx('drumroll');
        if (dark) dark.style.opacity = '1';
        if (c2) { c2.style.transform = 'translate(calc(-50% - var(--pod-dx, 260px)), 14px) scale(calc(0.95 * var(--pod-s, 1)))'; c2.style.opacity = '0.28'; c2.style.filter = 'brightness(0.55)'; }
        if (c3) { c3.style.transform = 'translate(calc(-50% + var(--pod-dx, 260px)), 20px) scale(calc(0.91 * var(--pod-s, 1)))'; c3.style.opacity = '0.28'; c3.style.filter = 'brightness(0.55)'; }
        if (c1) { c1.style.pointerEvents = 'auto'; c1.style.zIndex = '30'; c1.style.opacity = '1'; c1.style.transform = 'translate(-50%, 0) scale(calc(1.06 * var(--pod-s, 1)))'; }
        if (roving) { roving.style.animation = 'none'; void roving.offsetWidth; roving.style.display = 'block'; roving.style.opacity = '1'; roving.style.animation = 'theatricalSpotRoam 2.3s cubic-bezier(0.42, 0, 0.58, 1) forwards'; }
        sTimer = setTimeout(() => {
          sfx('fanfare');
          if (sc) runSpotlights(sc, wid, 3);
          const h1 = $('podiumHeroArea_1'), crown = $('championCrownEl');
          if (h1) { h1.style.display = 'flex'; mountHero($('hm_1'), players[0]?.avatarId, currentPose); }
          if (crown) crown.style.visibility = 'visible';
          setMysteryScore(1, players[0]?.score || 0, '#fef08a');
          setTimeout(() => {
            if (dark) dark.style.opacity = '0';
            if (roving) { roving.style.opacity = '0'; roving.style.display = 'none'; roving.style.animation = 'none'; }
            if (c2) { c2.style.opacity = '1'; c2.style.filter = 'brightness(1)'; c2.style.pointerEvents = 'auto'; }
            if (c3) { c3.style.opacity = '1'; c3.style.filter = 'brightness(1)'; c3.style.pointerEvents = 'auto'; }
          }, 450);
          if (global.confetti) {
            global.confetti({ particleCount: 220, spread: 170, origin: { y: 0.5 } });
            setTimeout(() => global.confetti && global.confetti({ particleCount: 150, spread: 140, angle: 60, origin: { x: 0, y: 0.6 } }), 300);
            setTimeout(() => global.confetti && global.confetti({ particleCount: 150, spread: 140, angle: 120, origin: { x: 1, y: 0.6 } }), 600);
          }
          $('scExport')?.style.setProperty('display', 'flex');
          if (btn) { btn.disabled = false; btn.innerHTML = `${ic('list', 15)} <span>الترتيب النهائي الكامل</span>`; }
        }, 1850);
      }, 380);
    } else if (revealStep >= 4) {
      const r = $('scRoster'); if (r) r.style.display = 'block';
      if (btn) { btn.innerHTML = `${ic('close', 14)} <span>إنهاء المسابقة</span>`; btn.onclick = () => global.ScoreARQuizHost?.closeHostSession?.(); }
    }
  }

  function startCinematicShow() {
    if (cTimer) { clearTimeout(cTimer); cTimer = null; }
    if (sTimer) { clearTimeout(sTimer); sTimer = null; }
    resetRovingSpotlight();
    const btn = $('scCinBtn'); if (btn) btn.disabled = true;
    revealStep = 0; advanceReveal();
    cTimer = setTimeout(() => { advanceReveal(); cTimer = setTimeout(() => advanceReveal(), 2800); }, 2600);
  }

  function revealAll() {
    if (cTimer) { clearTimeout(cTimer); cTimer = null; }
    if (sTimer) { clearTimeout(sTimer); sTimer = null; }
    resetRovingSpotlight();
    revealStep = 3;
    const sc = $('scSpot'), wid = room?.world?.id || room?.worldId || 'royal';
    if (sc) runSpotlights(sc, wid, 3);
    const c1 = $('col_1'), c2 = $('col_2'), c3 = $('col_3'), dark = $('scDarknessOverlay');
    if (dark) dark.style.opacity = '0';
    if (c2) { c2.style.pointerEvents = 'auto'; c2.style.opacity = '1'; c2.style.filter = 'brightness(1)'; c2.style.transform = 'translate(calc(-50% - var(--pod-dx, 260px)), 14px) scale(calc(0.95 * var(--pod-s, 1)))'; }
    if (c3) { c3.style.pointerEvents = 'auto'; c3.style.opacity = '1'; c3.style.filter = 'brightness(1)'; c3.style.transform = 'translate(calc(-50% + var(--pod-dx, 260px)), 20px) scale(calc(0.91 * var(--pod-s, 1)))'; }
    if (c1) { c1.style.pointerEvents = 'auto'; c1.style.opacity = '1'; c1.style.transform = 'translate(-50%, 0) scale(calc(1.06 * var(--pod-s, 1)))'; }
    [3, 2, 1].forEach(r => {
      const h = $(`podiumHeroArea_${r}`), hm = $(`hm_${r}`), pl = players[r === 1 ? 0 : r === 2 ? 1 : 2];
      if (h) h.style.display = 'flex';
      if (pl && hm) mountHero(hm, pl.avatarId, currentPose);
      setMysteryScore(r, pl?.score || 0, r === 1 ? '#fef08a' : r === 2 ? '#e2e8f0' : '#fed7aa');
    });
    const crown = $('championCrownEl'); if (crown) crown.style.visibility = 'visible';
    $('scExport')?.style.setProperty('display', 'flex');
    const btn = $('scRevBtn');
    if (btn) { btn.disabled = false; btn.innerHTML = `${ic('list', 15)} <span>الترتيب النهائي الكامل</span>`; }
  }

  function applyCreativeCeremonyTheme(themeId) {
    const mode = themeId || (typeof localStorage !== 'undefined' && localStorage.getItem('scorear_ceremony_mode')) || 'chests';
    try { localStorage.setItem('scorear_ceremony_mode', mode); } catch (e) {}
    const root = document.getElementById('podiumStageRoot');
    if (!root) return;
    root.setAttribute('data-ceremony-theme', mode);
    document.querySelectorAll('[data-ceremony-btn]').forEach(b => {
      const act = b.getAttribute('data-ceremony-btn') === mode;
      b.classList.toggle('is-active', act);
    });
    const poseMap = { chests: 'celebrate', cards: 'celebrate', rockets: 'celebrate', finishline: 'walk', portal: 'celebrate' };
    setHeroPose(poseMap[mode] || 'celebrate');
  }

  function setHeroPose(pose) {
    currentPose = POSES.includes(pose) ? pose : 'celebrate';
    [1, 2, 3].forEach(r => { const box = $(`hm_${r}`); if (!box) return; const pl = players[r === 1 ? 0 : r === 2 ? 1 : 2]; if (pl) mountHero(box, pl.avatarId, currentPose); });
    document.querySelectorAll('[data-podium-motion]').forEach(b => {
      const a = b.dataset.podiumMotion === currentPose;
      b.classList.toggle('is-active', a);
    });
  }

  function toggleAudioMute() { if (global.ScoreARAudio?.toggleMute) { const m = global.ScoreARAudio.toggleMute(); const b = $('scAudioBtn'); if (b) b.innerHTML = ic(m ? 'volumeOff' : 'volume', 14); } }
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
    if (path.includes('podium')) { global.location.href = `index.html${clean}`; return; }
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
