/**
 * ScoreAR Live Lobby Video-Game Stage Director (quiz-lobby-director.js)
 * Gives lobby heroes real 60FPS horizontal stage roaming (X locomotion), directional facing
 * without flipping student name pills, arrival hops on join, greeting pauses, and ground dust FX.
 * Strictly Rule 7 Compliant (< 300 lines).
 */
(function (global) {
  'use strict';

  const actors = new Map();
  let seenIds = new Set();
  let rafId = null;
  let lastTs = 0;
  let activeArena = null;
  let fxCanvas = null;
  let fxCtx = null;
  let dustMotes = [];
  let currentGlobalPose = 'walk';
  let currentSlotCount = 0;
  let stageObserver = null;

  function isMotionDisabled() {
    const paused = typeof document !== 'undefined' && document.documentElement?.classList?.contains('characters-paused');
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    return paused || reduced;
  }

  function ensureDustCanvas(arena) {
    if (!arena || typeof document === 'undefined') return null;
    if (getComputedStyle(arena).position === 'static') arena.style.position = 'relative';
    let c = arena.querySelector('#hostLobbyFxCanvas');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'hostLobbyFxCanvas';
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
      arena.insertBefore(c, arena.firstChild);
    }
    fxCanvas = c;
    fxCtx = typeof c.getContext === 'function' ? c.getContext('2d') : null;
    return c;
  }

  function spawnDust(x, y, vxBase, count = 2, gold = false) {
    for (let i = 0; i < count; i++) {
      dustMotes.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y - Math.random() * 6,
        vx: vxBase * -0.35 + (Math.random() - 0.5) * 0.9,
        vy: -(0.3 + Math.random() * 0.8),
        r: gold ? 2.5 + Math.random() * 3 : 3.5 + Math.random() * 4.5,
        life: 1.0,
        decay: gold ? 0.03 : 0.04,
        color: gold ? (Math.random() > 0.4 ? '#fde047' : '#58dce3') : 'rgba(226,232,240,0.45)'
      });
    }
  }

  function setGreetingBubble(slotEl, text) {
    if (!slotEl || typeof document === 'undefined') return;
    let b = slotEl.querySelector('.lobby-director-emote');
    if (!text) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('span');
      b.className = 'lobby-director-emote';
      b.style.cssText = 'position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:rgba(15,18,40,0.92);border:1px solid rgba(172,139,242,0.55);color:#fef08a;font-size:12px;font-weight:900;padding:1px 8px;border-radius:999px;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.45);z-index:25;';
      slotEl.appendChild(b);
    }
    b.textContent = text;
  }

  function createActor(id, idx, isNew) {
    const dir = idx % 2 === 0 ? 1 : -1;
    const speed = 26 + Math.random() * 20;
    const now = performance.now ? performance.now() : Date.now();
    return {
      id: String(id), idx, x: 0, y: isNew ? -42 : 0, vy: isNew ? 1.5 : 0,
      facing: dir, vx: dir * speed, speed, state: isNew ? 'hop' : 'walk',
      stateUntil: now + (isNew ? 1100 : 1800 + Math.random() * 2600),
      dustTimer: 0, lastPoseApplied: null
    };
  }

  function getMaxWanderX(arena, count) {
    const w = arena?.clientWidth || 960;
    const totalUsed = count * 150;
    const freeSpace = Math.max(24, w - totalUsed);
    if (count <= 1) return Math.min(180, w * 0.22);
    if (count <= 4) return Math.min(115, Math.max(36, freeSpace * 0.32));
    return Math.min(34, Math.max(10, freeSpace * 0.14));
  }

  function applyActorDom(actor, slotEl, heroCharEl, poseToApply) {
    if (!slotEl) return;
    slotEl.style.willChange = 'transform';
    slotEl.style.transform = `translate3d(${actor.x.toFixed(1)}px, ${actor.y.toFixed(1)}px, 0)`;
    if (heroCharEl) {
      heroCharEl.style.transform = `scaleX(${actor.facing})`;
      if (actor.lastPoseApplied !== poseToApply && global.ScoreARMotionEngine?.getInstance) {
        const inst = global.ScoreARMotionEngine.getInstance(heroCharEl);
        if (inst && typeof inst.setAction === 'function') inst.setAction(poseToApply);
        actor.lastPoseApplied = poseToApply;
      }
    }
  }

  function stepDirector(ts) {
    const stageHidden = activeArena?.closest?.('#scorearHostStage')?.style?.display === 'none';
    if (!activeArena || stageHidden || (typeof activeArena.isConnected === 'boolean' && !activeArena.isConnected)) {
      stop();
      return;
    }
    if (!lastTs) lastTs = ts;
    const dtSec = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    const arenaW = activeArena.clientWidth || 960;
    const arenaH = activeArena.clientHeight || 320;
    if (fxCanvas && fxCtx) {
      if (fxCanvas.width !== arenaW || fxCanvas.height !== arenaH) {
        fxCanvas.width = arenaW; fxCanvas.height = arenaH;
      }
      fxCtx.clearRect(0, 0, arenaW, arenaH);
    }

    const disabled = isMotionDisabled();
    const maxWander = getMaxWanderX(activeArena, currentSlotCount || 1);
    const slots = activeArena.querySelectorAll('.host-lobby-hero-slot');

    slots.forEach((slotEl, idx) => {
      const pid = slotEl.getAttribute('data-player-id') || ('slot_' + idx);
      let actor = actors.get(pid);
      if (!actor) {
        actor = createActor(pid, idx, false);
        actors.set(pid, actor);
      }
      actor.idx = idx;
      const heroCharEl = slotEl.querySelector('.host-lobby-hero-char');

      if (disabled || currentGlobalPose === 'idle' || currentGlobalPose === 'celebrate') {
        const pose = (!disabled && currentGlobalPose === 'celebrate') ? 'celebrate' : 'idle';
        const nx = actor.x * Math.exp(-9 * dtSec);
        actor.x = Math.abs(nx) < 0.6 ? 0 : nx;
        actor.y = 0; actor.facing = 1;
        setGreetingBubble(slotEl, null);
        applyActorDom(actor, slotEl, heroCharEl, pose);
        return;
      }

      // Autonomous Walk + Greet + Arrival Hop State Machine
      if (ts > actor.stateUntil) {
        if (actor.state === 'walk') {
          const roll = Math.random();
          if (roll < 0.34) {
            actor.state = 'greet';
            actor.stateUntil = ts + 1300 + Math.random() * 900;
            setGreetingBubble(slotEl, roll < 0.17 ? '👋' : '⚡');
          } else {
            actor.facing = Math.random() < 0.5 ? -actor.facing : actor.facing;
            actor.vx = actor.facing * actor.speed;
            actor.stateUntil = ts + 2000 + Math.random() * 2400;
          }
        } else {
          actor.state = 'walk';
          actor.facing = (actor.x > maxWander * 0.4) ? -1 : ((actor.x < -maxWander * 0.4) ? 1 : (Math.random() < 0.5 ? 1 : -1));
          actor.vx = actor.facing * actor.speed;
          actor.stateUntil = ts + 2200 + Math.random() * 2500;
          actor.y = 0;
          setGreetingBubble(slotEl, null);
        }
      }

      let desiredPose = 'walk';
      if (actor.state === 'walk') {
        actor.x += actor.vx * dtSec;
        if (actor.x >= maxWander) { actor.x = maxWander; actor.facing = -1; actor.vx = -actor.speed; }
        else if (actor.x <= -maxWander) { actor.x = -maxWander; actor.facing = 1; actor.vx = actor.speed; }
        actor.y = 0;
        actor.dustTimer += dtSec;
        if (actor.dustTimer > 0.45 && fxCtx) {
          actor.dustTimer = 0;
          const cx = slotEl.offsetLeft + (slotEl.offsetWidth * 0.5) + actor.x;
          const cy = slotEl.offsetTop + slotEl.offsetHeight - 10;
          spawnDust(cx, cy, actor.vx * 0.08, 1, false);
        }
      } else if (actor.state === 'greet') {
        desiredPose = 'idle';
      } else if (actor.state === 'hop') {
        desiredPose = 'celebrate';
        actor.y = Math.min(0, actor.y + actor.vy);
        actor.vy += 0.35;
        if (actor.y >= 0) {
          actor.y = 0;
          actor.vy = -5.2;
          if (fxCtx) {
            const cx = slotEl.offsetLeft + (slotEl.offsetWidth * 0.5) + actor.x;
            const cy = slotEl.offsetTop + slotEl.offsetHeight - 8;
            spawnDust(cx, cy, 0, 5, true);
          }
        }
      }

      applyActorDom(actor, slotEl, heroCharEl, desiredPose);
    });

    if (fxCtx) {
      for (let i = dustMotes.length - 1; i >= 0; i--) {
        const d = dustMotes[i];
        d.x += d.vx; d.y += d.vy; d.life -= d.decay;
        if (d.life <= 0) { dustMotes.splice(i, 1); continue; }
        fxCtx.save();
        fxCtx.globalAlpha = Math.max(0, d.life * 0.8);
        fxCtx.fillStyle = d.color;
        if (typeof fxCtx.arc === 'function') {
          fxCtx.beginPath(); fxCtx.arc(d.x, d.y, d.r * d.life, 0, Math.PI * 2); fxCtx.fill();
        }
        fxCtx.restore();
      }
    }

    rafId = requestAnimationFrame(stepDirector);
  }

  function syncArena(arena, players = [], pose = 'walk') {
    if (!arena) return;
    activeArena = arena;
    currentGlobalPose = pose || 'walk';
    currentSlotCount = Array.isArray(players) ? players.length : 0;

    if (!currentSlotCount) { stop(); return; }

    ensureDustCanvas(arena);
    const now = performance.now ? performance.now() : Date.now();
    const activeIdSet = new Set();
    let hasNewArrival = false;

    players.forEach((p, idx) => {
      const pid = String(p.id || ('slot_' + idx));
      activeIdSet.add(pid);
      const isNew = seenIds.size > 0 && !seenIds.has(pid);
      if (isNew) hasNewArrival = true;
      if (!actors.has(pid)) actors.set(pid, createActor(pid, idx, isNew));
      else actors.get(pid).idx = idx;
      seenIds.add(pid);
    });

    Array.from(actors.keys()).forEach(k => { if (!activeIdSet.has(k)) actors.delete(k); });
    if (hasNewArrival) {
      actors.forEach(a => { if (a.state !== 'hop') { a.state = 'hop'; a.vy = -4.2; a.stateUntil = now + 950; } });
    }
    const stageEl = arena.closest?.('#scorearHostStage');
    if (stageEl && typeof MutationObserver !== 'undefined' && !stageObserver) {
      stageObserver = new MutationObserver(() => { if (stageEl.style.display === 'none') stop(); });
      stageObserver.observe(stageEl, { attributes: true, attributeFilter: ['style'] });
    }
    if (!rafId) { lastTs = 0; rafId = requestAnimationFrame(stepDirector); }
  }

  function setMode(pose) {
    currentGlobalPose = pose || 'walk';
    const now = performance.now ? performance.now() : Date.now();
    actors.forEach(a => {
      a.lastPoseApplied = null;
      if (currentGlobalPose === 'walk') {
        a.state = 'walk';
        a.stateUntil = now + 2200 + Math.random() * 1800;
      }
    });
  }

  function triggerWelcomeHop(playerId) {
    const a = actors.get(String(playerId));
    const now = performance.now ? performance.now() : Date.now();
    if (a) { a.state = 'hop'; a.vy = -5.5; a.stateUntil = now + 1100; }
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stageObserver) { stageObserver.disconnect(); stageObserver = null; }
    lastTs = 0;
    dustMotes = [];
    activeArena = null;
    actors.clear();
    seenIds.clear();
  }

  const ScoreARLobbyDirector = { syncArena, setMode, triggerWelcomeHop, stop, _isRunning: () => Boolean(rafId), _getActors: () => actors };
  global.ScoreARLobbyDirector = ScoreARLobbyDirector;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARLobbyDirector = ScoreARLobbyDirector; } catch (e) {}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARLobbyDirector;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
