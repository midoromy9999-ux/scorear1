/**
 * ScoreAR Kahoot Studio 3D Podium Ceremony v13 (quiz-podium-effects.js)
 * Exact Kahoot Choreography (3rd -> 2nd -> 1st with Blackout & Roving Spotlight)
 * Fixes all 8 classic podium issues: clean HD architectural backdrop, generous header headroom,
 * single-row non-overflowing footer, real players only (0/1/2/3+ & ties), strict timer cleanup
 * (zero pose overwrites), re-enabled cinematic button, reduced motion, distinct #1 win / #2-#3 clap.
 * Strictly Rule 7 Compliant (< 470 lines).
 */
(function (global) {
  'use strict';
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const sfx = (n, v) => { if (global.ScoreARAudio?.playSfx) global.ScoreARAudio.playSfx(n, v); };
  const $   = id => (typeof document !== 'undefined' ? document.getElementById(id) : null);
  const ic  = (n, sz = 14) => (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') ? global.ScoreARUI.icon(n, { size: sz }) : '';
  const scenes = () => global.ScoreARPodiumScenes || null;
  const getTheme = () => ($('podiumStageRoot')?.getAttribute('data-ceremony-theme')) || (typeof localStorage !== 'undefined' && localStorage.getItem('scorear_ceremony_mode')) || 'chests';
  const isReduced = () => Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  const POSES = ['idle', 'walk', 'walkRight', 'walkLeft', 'walkForward', 'jump', 'clap', 'win', 'celebrate', 'run', 'runRight', 'runLeft', 'wave', 'climb', 'fly'];
  let revealStep = 0, players = [], revealOrder = [], room = null;
  let rafId = null, partTimer = null, spotCanvas = null, currentPose = 'celebrate', podiumTimers = [], celebrationClassicStarted = false;

  function ensureCelebrationClassicMusic() {
    if (celebrationClassicStarted) return;
    celebrationClassicStarted = true;
    global.ScoreARAudio?.crossfadeMusic?.('celebration', 0.32, 650);
  }

  function schedulePodium(fn, ms) {
    const id = setTimeout(() => {
      podiumTimers = podiumTimers.filter(t => t !== id);
      fn();
    }, ms);
    podiumTimers.push(id);
    return id;
  }

  function clearPodiumTimers() {
    podiumTimers.forEach(id => clearTimeout(id));
    podiumTimers = [];
    global.ScoreARAudio?.stopAllSfx?.();
    global.ScoreARAudio?.unduckMusic?.(100);
  }

  function computeRanks(sorted) {
    let r = 1;
    return sorted.map((p, i) => {
      if (i > 0 && (p.score || 0) < (sorted[i - 1].score || 0)) r = i + 1;
      return { ...p, _rank: r };
    });
  }

  function slotPlayer(slot) {
    return players[slot - 1] || null;
  }

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
      <img src="assets/characters/animated/${code}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${esc(charName)}" style="max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 14px 24px rgba(0,0,0,0.8));">
    </div>`;
  }

  function mountHero(el, avatarId, pose = 'celebrate') {
    if (!el) return;
    const validPose = POSES.includes(pose) ? pose : 'win';
    const w = el.offsetWidth || parseInt(el.style?.width, 10) || 180;
    const h = el.offsetHeight || parseInt(el.style?.height, 10) || 190;
    const shouldLoop = validPose !== 'jump' && validPose !== 'land';
    if (global.ScoreARMotionEngine?.mount) {
      global.ScoreARMotionEngine.mount(el, charCode(avatarId), validPose, { width: w, height: h, loop: shouldLoop, enableParticles: false, enableShadow: true });
    } else {
      el.innerHTML = heroImg(avatarId, '', validPose);
    }
  }

  function resetRovingSpotlight() {
    ['scRovingSpotlight', 'scCrossSpotL', 'scCrossSpotR'].forEach(id => {
      const r = $(id);
      if (r && r.style) { r.style.display = 'none'; r.style.opacity = '0'; r.style.animation = 'none'; }
    });
  }

  function pedestal3D(slot, displayRank, heightPx, widthPx) {
    const themes = {
      1: { face: 'linear-gradient(180deg, #4c1d95 0%, #3b0764 100%)', top: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', pentBg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', pentBorder: '#fef08a' },
      2: { face: 'linear-gradient(180deg, #431482 0%, #2e1065 100%)', top: 'linear-gradient(135deg, #5b21b6 0%, #3b0764 100%)', pentBg: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)', pentBorder: '#e2e8f0' },
      3: { face: 'linear-gradient(180deg, #3b0f75 0%, #240a4d 100%)', top: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)', pentBg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', pentBorder: '#fed7aa' }
    };
    const t = themes[Math.min(3, Math.max(1, displayRank || slot))];
    const pentSize = slot === 1 ? 74 : (slot === 2 ? 64 : 58);
    const pedProps = scenes()?.getPedestalPropsHtml ? scenes().getPedestalPropsHtml(slot) : '';
    return `<div id="podiumPedestal_${slot}" class="kahoot-3d-pedestal ped-rank-${slot}" style="height:${heightPx}px;width:${widthPx}px;position:relative;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);filter:drop-shadow(0 16px 32px rgba(0,0,0,0.8));">
      ${pedProps}
      <div style="position:absolute;top:-18px;left:0;right:0;height:20px;background:${t.top};clip-path:polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%);z-index:6;"></div>
      <div style="position:absolute;inset:0;background:${t.face};border-top:2px solid rgba(255,255,255,0.22);border-radius:0 0 10px 10px;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:12px 8px 10px;overflow:hidden;box-shadow:inset 0 8px 20px rgba(255,255,255,0.12), inset 0 -14px 22px rgba(0,0,0,0.5);">
        <div style="width:${pentSize}px;height:${pentSize}px;background:${t.pentBorder};clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);display:grid;place-items:center;padding:3px;filter:drop-shadow(0 5px 12px rgba(0,0,0,0.55));">
          <div style="width:100%;height:100%;background:${t.pentBg};clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);display:grid;place-items:center;font-size:${slot===1?34:28}px;font-weight:900;color:#ffffff;font-family:Montserrat,Arial,sans-serif;">
            <span id="pedMedal_${slot}">${displayRank || slot}</span>
          </div>
        </div>
        <div id="podiumMystery_${slot}" style="width:90%;background:rgba(6,8,22,0.75);border:1.5px solid ${t.pentBorder};border-radius:8px;padding:3px 6px;text-align:center;font-family:Montserrat,Tajawal,sans-serif;font-size:14px;font-weight:900;color:#ffffff;">❓</div>
      </div>
    </div>`;
  }

  function runSpotlights(canvas, worldId, phase) {
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let t = 0; if (rafId) cancelAnimationFrame(rafId); spotCanvas = canvas;
    if (isReduced()) return;
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
    if (isReduced()) return;
    const pal = ['#fbbf24', '#fef08a', '#c084fc', '#38bdf8'];
    let W = (canvas.width = canvas.offsetWidth || 960), H = (canvas.height = canvas.offsetHeight || 640);
    const mk = () => ({ x: Math.random() * W, y: H + 10, vx: (Math.random() - 0.5) * 1.0, vy: -(0.6 + Math.random() * 1.4), r: 2 + Math.random() * 3.2, op: 0.4 + Math.random() * 0.45, col: pal[Math.floor(Math.random() * pal.length)] });
    const pts = Array.from({ length: 28 }, () => { const p = mk(); p.y = Math.random() * H; return p; });
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

  function setMysteryScore(slot, score, color) {
    const el = $(`podiumMystery_${slot}`);
    if (!el) return;
    el.style.color = color || '#fef08a';
    el.textContent = `${score} نقطة`;
  }

  function nextRevealLabel(stepIndex) {
    const nextSlot = revealOrder[stepIndex];
    if (nextSlot === 3) return `${ic('medal', 14)} <span>كشف المركز الثالث</span>`;
    if (nextSlot === 2) return `${ic('medal', 14)} <span>كشف المركز الثاني</span>`;
    if (nextSlot === 1) return `${ic('crown', 14)} <span>كشف بطل المركز الأول!</span>`;
    return `${ic('list', 14)} <span>الترتيب النهائي</span>`;
  }

  function renderColumnHtml(slot, pl, pedHtml, boxH, boxW, nameSize, isChampion) {
    if (!pl) return '';
    return `<div id="col_${slot}" class="podium-col" data-player-id="${esc(pl.id || '')}" data-player-name="${esc(pl.name || '')}" data-rank="${pl._rank}" onclick="ScoreARPodiumEffects.triggerHeroStunt(${slot})" style="position:absolute;bottom:0;left:50%;transform:translate(-50%, 120%) scale(calc(${isChampion ? 0.94 : 0.92} * var(--pod-s, 1)));opacity:0;pointer-events:none;transition:transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, filter 0.55s ease;display:flex;flex-direction:column;align-items:center;${isChampion ? 'z-index:30;' : ''}">
      <div id="podiumHeroArea_${slot}" style="display:none;flex-direction:column;align-items:center;position:relative;">
        ${scenes()?.getColumnPropsHtml ? scenes().getColumnPropsHtml(slot) : ''}
        ${isChampion ? `<span id="championCrownEl" style="font-size:32px;line-height:1;visibility:hidden;animation:crownDrop 0.75s cubic-bezier(0.34,1.56,0.64,1);filter:drop-shadow(0 0 20px #fef08a);margin-bottom:-2px;position:relative;z-index:42;">👑<span id="scCrown" style="display:none;"></span></span>` : ''}
        <div class="podium-name-pill" style="font-size:${nameSize}px;font-weight:900;color:${isChampion ? '#fef08a' : '#ffffff'};text-shadow:0 2px 10px rgba(0,0,0,0.88);">${esc(pl.name)}</div>
        <div id="hm_${slot}" style="height:${boxH}px;width:${boxW}px;display:flex;align-items:flex-end;justify-content:center;position:relative;z-index:5;">${heroImg(pl.avatarId, pl.name, isChampion ? 'win' : 'clap')}</div>
      </div>
      ${pedHtml}
    </div>`;
  }

  function renderHostPodium(stage, currentRoom, onClose) {
    if (!stage || !currentRoom) return;
    if (global.ScoreARWorldHalls?.cleanup) global.ScoreARWorldHalls.cleanup();
    if (scenes()?.stopStage) scenes().stopStage();
    clearPodiumTimers();
    celebrationClassicStarted = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (partTimer) { clearInterval(partTimer); partTimer = null; }
    spotCanvas = null; revealStep = 0;

    const wid = currentRoom.world?.id || currentRoom.worldId || 'royal';
    const sorted = [...(currentRoom.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const celStyle = global.ScoreARMotionV3?.getCelebrationStyle
      ? global.ScoreARMotionV3.getCelebrationStyle(currentRoom)
      : (currentRoom.celebrationStyle === 'hall' ? 'hall' : 'classic');

    if (global.ScoreARRealtime && typeof global.ScoreARRealtime.publish === 'function') {
      global.ScoreARRealtime.publish('CONTEST_COMPLETED', {
        worldId: wid, celebrationStyle: celStyle,
        podium: sorted.slice(0, 3), totalPlayers: sorted.length, leaderboard: sorted
      });
    }

    if (celStyle === 'hall' && global.ScoreARWorldHalls?.renderHallCeremony) {
      try {
        global.ScoreARAudio?.playMusic?.(wid, 0.18);
        global.ScoreARWorldHalls.renderHallCeremony(stage, currentRoom, onClose);
        return;
      } catch (err) {
        console.warn('[ScoreARPodium] Hall ceremony fallback to classic:', err);
      }
    }

    const ranked = computeRanks(sorted);
    players = ranked;
    room = currentRoom;
    const p1 = ranked[0] || null, p2 = ranked[1] || null, p3 = ranked[2] || null;
    revealOrder = [3, 2, 1].filter(s => Boolean(slotPlayer(s)));

    global.ScoreARAudio?.playMusic?.(wid, 0.18);

    const P1 = p1 ? pedestal3D(1, p1._rank, 152, 214) : '';
    const P2 = p2 ? pedestal3D(2, p2._rank, 122, 192) : '';
    const P3 = p3 ? pedestal3D(3, p3._rank, 100, 178) : '';
    const quizTitle = global.ScoreARQuizHostView?.resolveRealQuizTitle
      ? global.ScoreARQuizHostView.resolveRealQuizTitle(currentRoom, '') : (currentRoom.quizTitle || '');
    const initialMode = (typeof localStorage !== 'undefined' && localStorage.getItem('scorear_ceremony_mode')) || 'chests';

    stage.innerHTML = `
<style>
  #podiumStageRoot{--pod-dx:clamp(210px,19.5vw,285px);--pod-recede:clamp(225px,20.5vw,300px);--pod-s:0.94;position:absolute;inset:0;display:flex;flex-direction:column;font-family:Cairo,Tajawal,Arial,sans-serif;background:#12092b;overflow:hidden;box-sizing:border-box;direction:rtl;}
  #podiumStageRoot main{max-width:none;margin:0;padding:4px 12px 6px;}
  #podiumStageRoot .podium-col{transform-origin:bottom center;}
  #podiumStageRoot[data-ceremony-theme="chests"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 62%,rgba(245,158,11,0.32),transparent 65%);}
  #podiumStageRoot[data-ceremony-theme="cards"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 62%,rgba(168,85,247,0.34),rgba(56,189,248,0.12) 45%,transparent 70%);}
  #podiumStageRoot[data-ceremony-theme="rockets"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 72%,rgba(14,165,233,0.38),rgba(99,102,241,0.14) 45%,transparent 72%);}
  #podiumStageRoot[data-ceremony-theme="finishline"] .sc-ceremony-aura{background:repeating-linear-gradient(90deg,rgba(255,255,255,0.14) 0 18px,rgba(16,185,129,0.20) 18px 36px);height:14px !important;top:auto !important;bottom:6px;border-radius:999px;max-width:740px;margin:0 auto;}
  #podiumStageRoot[data-ceremony-theme="portal"] .sc-ceremony-aura{background:radial-gradient(circle at 50% 52%,rgba(254,240,138,0.34),rgba(139,92,246,0.22) 44%,transparent 72%);}
  .podium-name-pill{background:rgba(12,14,32,0.9);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.24);border-radius:999px;padding:2px 15px;margin-bottom:4px;position:relative;z-index:40;white-space:nowrap;max-width:210px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 6px 18px rgba(0,0,0,0.65);}
  @media (min-width:721px) and (max-height:780px){ #podiumStageRoot{--pod-dx:clamp(200px,18.5vw,265px);--pod-recede:clamp(215px,19.5vw,280px);--pod-s:0.88;} }
  @media (min-width:721px) and (max-height:670px){ #podiumStageRoot{--pod-dx:clamp(185px,17vw,245px);--pod-recede:clamp(200px,18.5vw,260px);--pod-s:0.80;} }
  @media (min-width:1440px) and (min-height:821px){ #podiumStageRoot{--pod-dx:clamp(245px,20vw,310px);--pod-s:1.02;} }
  @media (max-width:1020px){ #podiumStageRoot .podium-header-bar, #podiumStageRoot .podium-footer-bar{flex-wrap:wrap !important;} }
  @media (max-width:720px){
    #podiumStageRoot{--pod-dx:100px;--pod-recede:110px;--pod-s:0.42;max-width:100vw !important;overflow-x:hidden !important;}
    #podiumStageRoot main{padding:2px 6px 12px !important;min-height:240px !important;}
    #podiumStageRoot #podiumCameraRig{height:240px !important;max-width:100% !important;}
    #podiumStageRoot .podium-header-bar{padding:4px 8px !important;gap:4px !important;}
    #podiumStageRoot .podium-title-text{font-size:12px !important;}
    #podiumStageRoot .podium-themes-strip{flex-wrap:wrap !important;justify-content:center !important;width:100%;gap:3px !important;}
    #podiumStageRoot .podium-themes-strip button{font-size:9.5px !important;padding:3px 6px !important;}
    #podiumStageRoot .podium-footer-bar{padding:4px 8px !important;gap:4px !important;justify-content:center !important;}
    #podiumStageRoot .podium-footer-actions, #podiumStageRoot .podium-motion-strip, #podiumStageRoot #scExport{flex-wrap:wrap !important;justify-content:center !important;width:100% !important;gap:4px !important;}
    #podiumStageRoot .podium-motion-extra{display:none !important;}
    #podiumStageRoot .podium-footer-bar button{padding:4px 7px !important;font-size:9.5px !important;}
  }
  @keyframes crownDrop{0%{transform:translateY(-28px) scale(0.5);opacity:0;}70%{transform:translateY(3px) scale(1.08);opacity:1;}100%{transform:translateY(0) scale(1);opacity:1;}}
  @keyframes floatUp{0%{transform:translateY(0);opacity:1;}100%{transform:translateY(-220px);opacity:0;}}
  @keyframes theatricalSpotRoam{0%{transform:translate(-155%,-12%) scale(0.88);opacity:0;}16%{transform:translate(-115%,-34%) scale(1.02);opacity:0.75;}48%{transform:translate(18%,-20%) scale(1.06);opacity:0.8;}75%{transform:translate(-75%,-44%) scale(0.98);opacity:0.9;}92%{transform:translate(-50%,-34%) scale(1.1);opacity:0.95;}100%{transform:translate(-50%,-34%) scale(1.12);opacity:0;}}
  @keyframes classicCrossL{0%{transform:translateX(-50%) rotate(-44deg);opacity:0;}12%{transform:translateX(-50%) rotate(-40deg);opacity:0.94;}36%{transform:translateX(-50%) rotate(-8deg);opacity:0.94;}60%{transform:translateX(-50%) rotate(-42deg);opacity:0.94;}78%{transform:translateX(-50%) rotate(-16deg);opacity:0.98;}100%{transform:translateX(-50%) rotate(-26deg);opacity:1;}}
  @keyframes classicCrossR{0%{transform:translateX(-50%) rotate(44deg);opacity:0;}12%{transform:translateX(-50%) rotate(40deg);opacity:0.94;}36%{transform:translateX(-50%) rotate(8deg);opacity:0.94;}60%{transform:translateX(-50%) rotate(42deg);opacity:0.94;}78%{transform:translateX(-50%) rotate(16deg);opacity:0.98;}100%{transform:translateX(-50%) rotate(26deg);opacity:1;}}
  .sc-classic-cross-spot{display:none;position:absolute;top:-36px;width:210px;height:125%;transform-origin:top center;clip-path:polygon(44% 0%,56% 0%,100% 100%,0% 100%);background:linear-gradient(180deg,rgba(255,244,178,0.84) 0%,rgba(251,191,36,0.28) 65%,rgba(251,191,36,0) 100%);filter:blur(7px);mix-blend-mode:screen;opacity:0;pointer-events:none;z-index:24;}
  ${scenes()?.getSceneStylesHtml ? scenes().getSceneStylesHtml() : ''}
</style>
<div id="podiumStageRoot" data-ceremony-theme="${esc(initialMode)}">
  <div style="position:absolute;inset:0;z-index:0;overflow:hidden;background:#0d0924;">
    <img src="assets/halls/${esc(wid)}-hall.jpg" alt="" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/worlds/${esc(wid)}/podium.jpg';}else{this.style.display='none';}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 55%;filter:brightness(0.54) saturate(1.08);">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 34%, rgba(56,24,116,0.34) 0%, rgba(12,7,32,0.82) 100%);"></div>
  </div>
  <canvas id="scSpot" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;"></canvas>
  <canvas id="scPart" style="position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;opacity:0.85;"></canvas>
  ${scenes()?.getStageOverlaysHtml ? scenes().getStageOverlaysHtml() : ''}

  <div id="scDarknessOverlay" style="position:absolute;inset:0;background:rgba(4,2,14,0.88);opacity:0;pointer-events:none;transition:opacity 0.55s ease;z-index:18;"></div>
  <div id="scCrossSpotL" class="sc-classic-cross-spot" style="left:16%;"></div>
  <div id="scCrossSpotR" class="sc-classic-cross-spot" style="left:84%;"></div>
  <div id="scRovingSpotlight" style="display:none;position:absolute;top:38%;left:50%;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle, rgba(255,250,220,0.6) 0%, rgba(251,191,36,0.24) 40%, rgba(167,139,250,0.10) 62%, rgba(255,255,255,0) 76%);filter:blur(16px);mix-blend-mode:screen;opacity:0;transition:opacity 0.5s ease;pointer-events:none;z-index:24;"></div>
  <div id="scReact" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:150;"></div>

  <header class="podium-header-bar scorear-control-bar" style="position:relative;z-index:35;display:flex;align-items:center;justify-content:space-between;padding:5px 14px;min-height:44px;color:#fff;flex-shrink:0;gap:8px;flex-wrap:nowrap;">
    <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">
      <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost?.closeHostSession?.()" style="padding:4px 10px;font-size:11.5px;border-color:rgba(239,68,68,0.35);color:#fca5a5;">${ic('close', 12)} <span>إنهاء</span></button>
      <button type="button" id="scAudioBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARPodiumEffects.toggleAudioMute()" style="padding:4px 8px;">${ic('volume', 13)}</button>
    </div>
    <div class="podium-title-text" style="font-size:15px;font-weight:900;color:#ffffff;font-family:Montserrat,Cairo,sans-serif;display:inline-flex;align-items:center;gap:6px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><span style="color:#fbbf24;display:inline-flex;flex-shrink:0;">${ic('crown', 16)}</span> <span style="overflow:hidden;text-overflow:ellipsis;">${esc(quizTitle ? `منصة التتويج · ${quizTitle}` : 'منصة التتويج الاحتفالية')}</span></div>
    <div class="podium-themes-strip" style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
      ${[
        { id: 'chests', icn: 'award', lbl: 'خزائن الكنز' },
        { id: 'cards', icn: 'layers', lbl: 'بطاقات الأساطير' },
        { id: 'rockets', icn: 'planet', lbl: 'صواريخ الفضاء' },
        { id: 'finishline', icn: 'flag', lbl: 'خط النهاية' },
        { id: 'portal', icn: 'crown', lbl: 'بوابة النور' }
      ].map(m => `<button type="button" data-ceremony-btn="${m.id}" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.switchCeremonyTheme('${m.id}')" style="padding:3px 9px;border-radius:999px;font-size:10.5px;white-space:nowrap;">${ic(m.icn, 11)} <span>${m.lbl}</span></button>`).join('')}
    </div>
  </header>

  <main style="position:relative;z-index:22;flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:visible;padding-bottom:8px;">
    <div class="sc-ceremony-aura" style="position:absolute;inset:0;pointer-events:none;z-index:2;transition:all 0.35s ease;"></div>
    <div id="podiumCameraRig" data-id="podiumCameraRig" style="position:relative;width:100%;max-width:1160px;height:clamp(360px,60vh,470px);margin:0 auto;z-index:5;">
      <div id="climax${wid.charAt(0).toUpperCase() + wid.slice(1)}" style="display:none;position:absolute;inset:0;pointer-events:none;z-index:7;"></div>
      ${players.length ? `
        ${renderColumnHtml(2, p2, P2, 164, 166, 19, false)}
        ${renderColumnHtml(1, p1, P1, 190, 188, 22, true)}
        ${renderColumnHtml(3, p3, P3, 152, 156, 18, false)}
      ` : `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(12,15,34,0.92);border:1.5px solid rgba(251,191,36,0.5);border-radius:20px;padding:24px 36px;text-align:center;color:#e2e8f0;font-weight:900;font-size:17px;">لا توجد نتائج مسجلة بعد لعرضها على المنصة</div>`}
    </div>

    <div id="scRoster" style="display:none;position:absolute;top:48px;left:50%;transform:translateX(-50%);width:min(780px,94%);background:rgba(12,13,29,0.96);backdrop-filter:blur(22px);border:1px solid rgba(172,139,242,0.35);border-radius:20px;padding:16px 20px;z-index:55;max-height:calc(100% - 110px);overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.85);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-size:15px;font-weight:900;color:#ffffff;display:inline-flex;align-items:center;gap:7px;">${ic('trophy', 15)} <span>الترتيب النهائي لكافة المتسابقين (${ranked.length})</span></div>
        <button type="button" class="scorear-gear-btn" onclick="document.getElementById('scRoster').style.display='none'">✕ إغلاق</button>
      </div>
      ${ranked.map(p => `<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:7px 12px;display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
        <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;font-weight:900;color:${p._rank<=3?'#fcd34d':'#a1a4be'};min-width:28px;font-family:Montserrat,monospace;">#${String(p._rank).padStart(2,'0')}</span><img src="assets/motion-v3/originals/${charCode(p.avatarId)}.png" onerror="this.onerror=null;this.src='assets/characters/animated/char_01-idle.webp'" style="width:26px;height:30px;object-fit:contain;"><span style="font-size:13.5px;font-weight:800;color:#f8fafc;">${esc(p.name)}</span></div>
        <span style="font-size:14px;font-weight:900;color:#58dce3;font-family:Montserrat,monospace;">${p.score||0} <small style="font-size:11px;color:#a1a4be;">نقطة</small></span>
      </div>`).join('')}
    </div>
  </main>

  <footer class="podium-footer-bar scorear-control-bar" style="position:relative;z-index:40;border-top:1px solid rgba(255,255,255,0.09);border-bottom:none;padding:6px 14px;min-height:46px;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:nowrap;flex-shrink:0;">
    <div class="podium-footer-actions" style="display:flex;gap:5px;align-items:center;flex-wrap:nowrap;min-width:0;">
      <button type="button" id="scRevBtn" class="btn launch-primary" onclick="ScoreARPodiumEffects.advanceReveal()" style="font-size:11.5px;font-weight:900;border-radius:9px;padding:6px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;">${nextRevealLabel(0)}</button>
      <button type="button" id="scCinBtn" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.startCinematicShow()" style="border-color:rgba(172,139,242,0.45);color:#e2d4fb;padding:5px 10px;font-size:11px;white-space:nowrap;">${ic('play', 12)} <span>عرض سينمائي</span></button>
      <button type="button" id="scRevAllBtn" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.revealAll()" style="padding:5px 10px;font-size:11px;white-space:nowrap;">${ic('zap', 12)} <span>كشف الكل</span></button>
      <div id="scExport" style="display:none;gap:4px;align-items:center;flex-wrap:nowrap;">
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.triggerSnapshot()" style="border-color:rgba(88,220,227,0.45);color:#c7f9ff;padding:5px 9px;font-size:10.5px;white-space:nowrap;">${ic('camera', 12)} <span>صورة</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.triggerCertificates()" style="border-color:rgba(52,211,153,0.45);color:#a7f3d0;padding:5px 9px;font-size:10.5px;white-space:nowrap;">${ic('award', 12)} <span>الشهادات</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.navigateAfterPodium('#worlds')" style="padding:5px 8px;font-size:10.5px;white-space:nowrap;">${ic('planet', 12)} <span>العوالم</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.navigateAfterPodium('#studio')" style="padding:5px 8px;font-size:10.5px;white-space:nowrap;">${ic('chart', 12)} <span>الاستوديو</span></button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.navigateAfterPodium('#journey')" style="padding:5px 8px;font-size:10.5px;white-space:nowrap;">${ic('book', 12)} <span>رحلتي</span></button>
      </div>
    </div>
    <div class="podium-motion-strip" style="display:flex;gap:4px;align-items:center;background:rgba(14,16,34,0.88);padding:3px 7px;border-radius:10px;border:1px solid rgba(172,139,242,0.24);flex-shrink:0;">
      <span class="podium-motion-label podium-motion-extra" style="font-size:10.5px;font-weight:800;color:#b1a2e9;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;">${ic('gamepad', 12)} الأبطال:</span>
      <button type="button" data-podium-motion="idle" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.setHeroPose('idle')" style="padding:3px 7px;font-size:10.5px;">الوقوف</button>
      <button type="button" data-podium-motion="walk" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.setHeroPose('walk')" style="padding:3px 7px;font-size:10.5px;">المشي</button>
      <button type="button" data-podium-motion="jump" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.setHeroPose('jump')" style="padding:3px 7px;font-size:10.5px;">القفز</button>
      <button type="button" data-podium-motion="clap" class="scorear-gear-btn" onclick="ScoreARPodiumEffects.setHeroPose('clap')" style="padding:3px 7px;font-size:10.5px;">التصفيق</button>
      <button type="button" data-podium-motion="celebrate" class="scorear-gear-btn is-active" onclick="ScoreARPodiumEffects.setHeroPose('celebrate')" style="padding:3px 7px;font-size:10.5px;">الاحتفال</button>
    </div>
  </footer>
</div>`;

    schedulePodium(() => {
      const sc = $('scSpot'), pc = $('scPart'), sCanvas = $('scSceneCanvas');
      if (sc) runSpotlights(sc, wid, 0);
      if (scenes()?.initStage) scenes().initStage(sCanvas, getTheme());
      applyCreativeCeremonyTheme();
      if (pc) particles(pc);
      if (isReduced() && players.length) revealAll();
    }, 45);
  }

  function finishChampionState() {
    const btn = $('scRevBtn'), cinBtn = $('scCinBtn'), revAllBtn = $('scRevAllBtn');
    if (cinBtn) cinBtn.disabled = false;
    if (revAllBtn) revAllBtn.style.display = 'none';
    $('scExport')?.style.setProperty('display', 'flex');
    if (btn) { btn.disabled = false; btn.innerHTML = `${ic('list', 14)} <span>الترتيب الكامل</span>`; }
  }

  function advanceReveal() {
    if (global.ScoreARWorldHalls?.isActive?.()) { global.ScoreARWorldHalls.advanceStep(); return; }
    if (!revealOrder.length) return;
    if (revealStep >= revealOrder.length) {
      const r = $('scRoster'); if (r) r.style.display = 'block';
      const btn = $('scRevBtn');
      if (btn) { btn.innerHTML = `${ic('close', 13)} <span>إنهاء المسابقة</span>`; btn.onclick = () => global.ScoreARQuizHost?.closeHostSession?.(); }
      return;
    }

    ensureCelebrationClassicMusic();
    const targetSlot = revealOrder[revealStep];
    revealStep++;
    const btn = $('scRevBtn'), wid = room?.world?.id || room?.worldId || 'royal';
    const sc = $('scSpot'), c1 = $('col_1'), c2 = $('col_2'), c3 = $('col_3');
    const dark = $('scDarknessOverlay'), roving = $('scRovingSpotlight'), crossL = $('scCrossSpotL'), crossR = $('scCrossSpotR');

    if (targetSlot === 3 && c3 && slotPlayer(3)) {
      sfx('rank3Reveal', 0.90);
      if (sc) runSpotlights(sc, wid, 1);
      c3.style.pointerEvents = 'auto'; c3.style.zIndex = '25'; c3.style.opacity = '1';
      c3.style.transform = 'translate(-50%, 0) scale(calc(1.06 * var(--pod-s, 1)))';
      schedulePodium(() => {
        sfx('applauseWarm', 0.88);
        if (global.confetti && !isReduced()) global.confetti({ particleCount: 40, spread: 72, origin: { x: 0.25, y: 0.62 }, colors: ['#fdba74', '#fb923c', '#fef08a'] });
        if (scenes()?.animateHeroEntry) scenes().animateHeroEntry(3, getTheme(), mountHero, slotPlayer(3));
        else { const h3 = $('podiumHeroArea_3'); if (h3) { h3.style.display = 'flex'; mountHero($('hm_3'), slotPlayer(3).avatarId, 'clap'); } }
        setMysteryScore(3, slotPlayer(3).score || 0, '#fed7aa');
      }, 240);
      if (btn) btn.innerHTML = nextRevealLabel(revealStep);
    } else if (targetSlot === 2 && c2 && slotPlayer(2)) {
      sfx('rank2Reveal', 0.92);
      if (sc) runSpotlights(sc, wid, 2);
      if (c3) { c3.style.zIndex = '5'; c3.style.transform = 'translate(calc(-50% + var(--pod-recede, 240px)), 28px) scale(calc(0.76 * var(--pod-s, 1)))'; c3.style.opacity = '0'; c3.style.pointerEvents = 'none'; }
      schedulePodium(() => {
        c2.style.pointerEvents = 'auto'; c2.style.zIndex = '25'; c2.style.opacity = '1';
        c2.style.transform = 'translate(-50%, 0) scale(calc(1.06 * var(--pod-s, 1)))';
        schedulePodium(() => {
          sfx('applauseStrong', 0.92);
          if (global.confetti && !isReduced()) global.confetti({ particleCount: 60, spread: 84, origin: { x: 0.75, y: 0.58 }, colors: ['#e2e8f0', '#93c5fd', '#fef08a'] });
          if (scenes()?.animateHeroEntry) scenes().animateHeroEntry(2, getTheme(), mountHero, slotPlayer(2));
          else { const h2 = $('podiumHeroArea_2'); if (h2) { h2.style.display = 'flex'; mountHero($('hm_2'), slotPlayer(2).avatarId, 'clap'); } }
          setMysteryScore(2, slotPlayer(2).score || 0, '#e2e8f0');
        }, 230);
      }, 300);
      if (btn) btn.innerHTML = nextRevealLabel(revealStep);
    } else if (targetSlot === 1 && c1 && slotPlayer(1)) {
      if (btn) btn.disabled = true;
      sfx('whoosh');
      if (c2) { c2.style.zIndex = '6'; c2.style.transform = 'translate(calc(-50% - var(--pod-recede, 240px)), 26px) scale(calc(0.78 * var(--pod-s, 1)))'; c2.style.opacity = '0'; }
      schedulePodium(() => {
        global.ScoreARAudio?.duckMusic?.(0.05, 500);
        sfx('drumroll', 0.96);
        if (dark && !isReduced()) dark.style.opacity = '1';
        if (c2) { c2.style.transform = 'translate(calc(-50% - var(--pod-dx, 240px)), 4px) scale(calc(0.94 * var(--pod-s, 1)))'; c2.style.opacity = '0.28'; c2.style.filter = 'brightness(0.55)'; }
        if (c3) { c3.style.transform = 'translate(calc(-50% + var(--pod-dx, 240px)), 6px) scale(calc(0.90 * var(--pod-s, 1)))'; c3.style.opacity = '0.28'; c3.style.filter = 'brightness(0.55)'; }
        c1.style.pointerEvents = 'auto'; c1.style.zIndex = '30'; c1.style.opacity = '1';
        c1.style.transform = 'translate(-50%, 0) scale(calc(1.04 * var(--pod-s, 1)))';
        if (!isReduced()) {
          if (crossL?.style) { crossL.style.animation = 'none'; void crossL.offsetWidth; crossL.style.display = 'block'; crossL.style.opacity = '1'; crossL.style.animation = 'classicCrossL 4s cubic-bezier(0.4, 0, 0.2, 1) forwards'; }
          if (crossR?.style) { crossR.style.animation = 'none'; void crossR.offsetWidth; crossR.style.display = 'block'; crossR.style.opacity = '1'; crossR.style.animation = 'classicCrossR 4s cubic-bezier(0.4, 0, 0.2, 1) forwards'; }
          if (roving?.style) { roving.style.animation = 'none'; void roving.offsetWidth; roving.style.display = 'block'; roving.style.opacity = '1'; roving.style.animation = 'theatricalSpotRoam 4s cubic-bezier(0.42, 0, 0.58, 1) forwards'; }
        }
        schedulePodium(() => {
          sfx('spotlightLock', 0.96);
          sfx('victoryFanfare', 0.96);
          sfx('applauseGrand', 0.92);
          global.ScoreARAudio?.unduckMusic?.(550);
          if (sc) runSpotlights(sc, wid, 3);
          const crown = $('championCrownEl');
          if (scenes()?.animateHeroEntry) scenes().animateHeroEntry(1, getTheme(), mountHero, slotPlayer(1));
          else { const h1 = $('podiumHeroArea_1'); if (h1) { h1.style.display = 'flex'; mountHero($('hm_1'), slotPlayer(1).avatarId, 'win'); } }
          if (crown) crown.style.visibility = 'visible';
          setMysteryScore(1, slotPlayer(1).score || 0, '#fef08a');
          schedulePodium(() => {
            if (dark) dark.style.opacity = '0';
            resetRovingSpotlight();
            if (c2) { c2.style.opacity = '1'; c2.style.filter = 'brightness(1)'; c2.style.pointerEvents = 'auto'; }
            if (c3) { c3.style.opacity = '1'; c3.style.filter = 'brightness(1)'; c3.style.pointerEvents = 'auto'; }
          }, 520);
          if (global.confetti && !isReduced()) {
            global.confetti({ particleCount: 200, spread: 165, origin: { y: 0.5 } });
            schedulePodium(() => global.confetti && global.confetti({ particleCount: 130, spread: 135, angle: 60, origin: { x: 0, y: 0.6 } }), 280);
            schedulePodium(() => global.confetti && global.confetti({ particleCount: 130, spread: 135, angle: 120, origin: { x: 1, y: 0.6 } }), 560);
          }
          finishChampionState();
        }, isReduced() ? 40 : 4000);
      }, isReduced() ? 20 : 320);
    }
  }

  function startCinematicShow() {
    if (global.ScoreARWorldHalls?.isActive?.()) { global.ScoreARWorldHalls.startCinematicShow(); return; }
    if (!revealOrder.length) return;
    clearPodiumTimers();
    if (scenes()?.cancelPending) scenes().cancelPending();
    resetRovingSpotlight();
    ensureCelebrationClassicMusic();
    if (isReduced()) { revealAll(); return; }
    const cinBtn = $('scCinBtn'); if (cinBtn) cinBtn.disabled = true;
    const revAllBtn = $('scRevAllBtn'); if (revAllBtn) revAllBtn.style.display = '';
    const exp = $('scExport'); if (exp) exp.style.display = 'none';
    [1, 2, 3].forEach(s => {
      const c = $(`col_${s}`), h = $(`podiumHeroArea_${s}`);
      if (c) { c.style.opacity = '0'; c.style.pointerEvents = 'none'; c.style.transform = 'translate(-50%, 120%) scale(calc(0.92 * var(--pod-s, 1)))'; }
      if (h) h.style.display = 'none';
    });
    const crown = $('championCrownEl'); if (crown) crown.style.visibility = 'hidden';
    revealStep = 0;
    advanceReveal();
    let offset = 0;
    for (let i = 1; i < revealOrder.length; i++) {
      offset += (revealOrder[i - 1] === 3 ? 4600 : 5000);
      schedulePodium(() => advanceReveal(), offset);
    }
  }

  function revealAll() {
    if (global.ScoreARWorldHalls?.isActive?.()) { global.ScoreARWorldHalls.skipToFinal(); return; }
    clearPodiumTimers();
    if (scenes()?.cancelPending) scenes().cancelPending();
    resetRovingSpotlight();
    ensureCelebrationClassicMusic();
    revealStep = revealOrder.length;
    const sc = $('scSpot'), wid = room?.world?.id || room?.worldId || 'royal';
    if (sc) runSpotlights(sc, wid, 3);
    const c1 = $('col_1'), c2 = $('col_2'), c3 = $('col_3'), dark = $('scDarknessOverlay');
    if (dark) dark.style.opacity = '0';
    if (c2) { c2.style.pointerEvents = 'auto'; c2.style.opacity = '1'; c2.style.filter = 'brightness(1)'; c2.style.transform = 'translate(calc(-50% - var(--pod-dx, 240px)), 4px) scale(calc(0.94 * var(--pod-s, 1)))'; }
    if (c3) { c3.style.pointerEvents = 'auto'; c3.style.opacity = '1'; c3.style.filter = 'brightness(1)'; c3.style.transform = 'translate(calc(-50% + var(--pod-dx, 240px)), 6px) scale(calc(0.90 * var(--pod-s, 1)))'; }
    if (c1) { c1.style.pointerEvents = 'auto'; c1.style.opacity = '1'; c1.style.filter = 'brightness(1)'; c1.style.transform = 'translate(-50%, 0) scale(calc(1.04 * var(--pod-s, 1)))'; }
    const activeTheme = getTheme();
    revealOrder.forEach((r, idx) => {
      const h = $(`podiumHeroArea_${r}`), hm = $(`hm_${r}`), pl = slotPlayer(r);
      if (!pl) return;
      if (h) h.style.display = 'flex';
      if (scenes()?.animateHeroEntry) schedulePodium(() => scenes().animateHeroEntry(r, activeTheme, mountHero, pl), isReduced() ? 0 : idx * 80);
      else if (hm) mountHero(hm, pl.avatarId, r === 1 ? 'win' : 'clap');
      setMysteryScore(r, pl.score || 0, r === 1 ? '#fef08a' : r === 2 ? '#e2e8f0' : '#fed7aa');
    });
    const crown = $('championCrownEl'); if (crown) crown.style.visibility = 'visible';
    sfx('victoryFanfare', 0.90);
    finishChampionState();
  }

  function applyCreativeCeremonyTheme(themeId) {
    const isUserClick = Boolean(themeId);
    const mode = themeId || (typeof localStorage !== 'undefined' && localStorage.getItem('scorear_ceremony_mode')) || 'chests';
    try { localStorage.setItem('scorear_ceremony_mode', mode); } catch (e) {}
    const root = document.getElementById('podiumStageRoot');
    if (!root) return;
    root.setAttribute('data-ceremony-theme', mode);
    document.querySelectorAll('[data-ceremony-btn]').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-ceremony-btn') === mode));
    if (isUserClick && revealStep === 0 && players.length) {
      if (scenes()?.setMode) scenes().setMode(mode, 0, mountHero, players, true);
      revealAll();
    } else if (scenes()?.setMode) {
      scenes().setMode(mode, revealStep, mountHero, players, isUserClick);
    }
  }

  function triggerHeroStunt(slot) {
    const pl = slotPlayer(slot);
    if (pl && scenes()?.triggerHeroStunt) scenes().triggerHeroStunt(slot, mountHero, pl);
  }

  function setHeroPose(pose) {
    // Cancel ALL pending entry/scene timers first so nothing can overwrite the teacher's pose!
    clearPodiumTimers();
    if (scenes()?.cancelPending) scenes().cancelPending();
    currentPose = POSES.includes(pose) ? pose : 'celebrate';
    [1, 2, 3].forEach(r => {
      const box = $(`hm_${r}`), pl = slotPlayer(r);
      if (box && pl) mountHero(box, pl.avatarId, currentPose);
    });
    document.querySelectorAll('[data-podium-motion]').forEach(b => b.classList.toggle('is-active', b.dataset.podiumMotion === currentPose));
  }

  function toggleAudioMute() { if (global.ScoreARAudio?.toggleMute) { const m = global.ScoreARAudio.toggleMute(); const b = $('scAudioBtn'); if (b) b.innerHTML = ic(m ? 'volumeOff' : 'volume', 13); } }
  function triggerSnapshot() { global.ScoreARPodiumCapture?.capturePodiumSnapshot?.($('scorearQuizHostStage') || document.body, room, players); }
  function triggerCertificates() { global.ScoreARPodiumCapture?.downloadAllTop3Certificates?.(players, room?.world?.id || 'royal'); }
  function handleStudentReaction(emoji, name, studentId) {
    if (global.ScoreARWorldHalls?.isActive?.()) {
      global.ScoreARWorldHalls.triggerAudienceReaction?.(emoji, name);
    }
    global.ScoreARStageFx?.performStudentMove?.(emoji, name, studentId, players, revealStep, triggerHeroStunt);
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
    renderHostPodium(c, { worldId: opts.worldId || 'royal', world: { id: opts.worldId || 'royal' }, players: p, celebrationStyle: opts.celebrationStyle || 'classic', quizTitle: opts.quizTitle || '' }, opts.onComplete || opts.onClose);
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

  const ScoreARPodiumEffects = { renderHostPodium, startPodiumShow, renderHero, advanceReveal, startCinematicShow, revealAll, setHeroPose, switchCeremonyTheme: applyCreativeCeremonyTheme, triggerHeroStunt, toggleAudioMute, triggerSnapshot, triggerCertificates, navigateAfterPodium, handleStudentReaction, mountHeroMotion: mountHero };
  global.ScoreARPodiumEffects = ScoreARPodiumEffects;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARPodiumEffects = ScoreARPodiumEffects; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARPodiumEffects;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
