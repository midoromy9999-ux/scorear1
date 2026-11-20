/**
 * ScoreAR Live Lobby 2.5D Waypoint Path Director (quiz-lobby-director.js)
 * Game-industry 2.5D floor choreography: 3 depth lanes (back/mid/front) with Z-scaling,
 * real 4-directional V3 locomotion (walkRight, walkLeft, walkForward, walkBackward),
 * calm idle pauses, polite arrival walks + wave greetings (ZERO random jumping!),
 * and explicit single jump ONLY when triggered by student reaction 🦘.
 * Strictly Rule 7 Compliant (< 300 lines).
 */
(function (global) {
  'use strict';

  const LANES = [
    { y: -24, scale: 0.86 }, // Back aisle
    { y: -12, scale: 0.93 }, // Mid floor
    { y: 0,   scale: 1.00 }  // Front stage
  ];

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

  function spawnFootDust(x, y, vxBase) {
    dustMotes.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y - Math.random() * 4,
      vx: vxBase * -0.18 + (Math.random() - 0.5) * 0.45,
      vy: -(0.2 + Math.random() * 0.5),
      r: 2.4 + Math.random() * 2.6,
      life: 0.85,
      decay: 0.045,
      color: 'rgba(226,232,240,0.42)'
    });
  }

  function setGreetingBubble(slotEl, text) {
    if (!slotEl || typeof document === 'undefined') return;
    let b = slotEl.querySelector('.lobby-director-emote');
    if (!text) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('span');
      b.className = 'lobby-director-emote';
      b.style.cssText = 'position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:rgba(15,18,40,0.92);border:1px solid rgba(172,139,242,0.55);color:#fef08a;font-size:12px;font-weight:900;padding:1px 8px;border-radius:999px;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.45);z-index:30;';
      slotEl.appendChild(b);
    }
    b.textContent = text;
  }

  function getMaxWanderX(arena, count) {
    const w = arena?.clientWidth || 1100;
    if (count <= 1) return Math.min(230, w * 0.25);
    if (count <= 4) return Math.min(135, Math.max(64, (w - count * 145) * 0.36));
    return Math.min(68, Math.max(26, (w - count * 125) * 0.22));
  }

  function scaleForY(y) {
    const t = Math.max(0, Math.min(1, (y + 24) / 24));
    return 0.86 + t * 0.14;
  }

  function pickNextWaypoint(actor, maxX) {
    const nextLaneIdx = (actor.laneIdx + 1 + Math.floor(Math.random() * 2)) % LANES.length;
    actor.laneIdx = nextLaneIdx;
    const lane = LANES[nextLaneIdx];
    // Alternate left/right side of personal zone so motion feels purposeful along real paths
    const side = actor.x >= 0 ? -1 : 1;
    const mag = maxX * (0.45 + Math.random() * 0.5);
    actor.tx = Math.max(-maxX, Math.min(maxX, side * mag));
    actor.ty = lane.y;
  }

  function createActor(id, idx, isNew, maxX) {
    const laneIdx = idx % LANES.length;
    const lane = LANES[laneIdx];
    const now = performance.now ? performance.now() : Date.now();
    const enterFromRight = idx % 2 === 0;
    const startX = isNew ? (enterFromRight ? Math.min(165, maxX + 55) : -Math.min(165, maxX + 55)) : ((idx % 2 === 0 ? 1 : -1) * Math.min(28, maxX * 0.35));
    const actor = {
      id: String(id), idx, laneIdx,
      x: startX, y: lane.y,
      tx: isNew ? 0 : startX, ty: lane.y,
      speed: 60 + (idx % 3) * 6,
      facing: startX > 0 ? -1 : 1,
      movePose: startX > 0 ? 'walkLeft' : 'walkRight',
      state: isNew ? 'enter' : 'idle',
      stateUntil: now + (isNew ? 3200 : 800 + (idx % 4) * 550),
      dustTimer: 0, lastPoseApplied: null, greetText: isNew ? '👋' : null
    };
    if (!isNew) pickNextWaypoint(actor, maxX);
    return actor;
  }

  function applyActorDom(actor, slotEl, heroCharEl, poseToApply) {
    if (!slotEl) return;
    const sc = scaleForY(actor.y);
    slotEl.style.willChange = 'transform';
    slotEl.style.zIndex = String(12 + Math.round(actor.y + 26));
    slotEl.style.transform = `translate3d(${actor.x.toFixed(1)}px, ${actor.y.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
    slotEl.style.transformOrigin = 'bottom center';

    if (heroCharEl) {
      const hasV3 = Boolean(global.ScorearSpritePlayer && global.ScoreARMotionV3);
      let resolvedPose = poseToApply;
      if (hasV3) {
        if (poseToApply === 'walk') resolvedPose = actor.movePose || (actor.facing < 0 ? 'walkLeft' : 'walkRight');
        heroCharEl.style.transform = '';
      } else {
        heroCharEl.style.transform = `scaleX(${actor.facing})`;
      }

      if (actor.lastPoseApplied !== resolvedPose && global.ScoreARMotionEngine?.getInstance) {
        const inst = global.ScoreARMotionEngine.getInstance(heroCharEl);
        if (inst && typeof inst.setAction === 'function') {
          const shouldLoop = resolvedPose !== 'jump' && resolvedPose !== 'wave' && resolvedPose !== 'land';
          inst.setAction(resolvedPose, { loop: shouldLoop });
        }
        actor.lastPoseApplied = resolvedPose;
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
        actor = createActor(pid, idx, false, maxWander);
        actors.set(pid, actor);
      }
      actor.idx = idx;
      const heroCharEl = slotEl.querySelector('.host-lobby-hero-char');

      // Explicit global teacher pose lock (idle / jump / clap / win / celebrate)
      if (disabled || currentGlobalPose !== 'walk') {
        const pose = disabled ? 'idle' : currentGlobalPose;
        const laneY = LANES[actor.laneIdx % LANES.length].y;
        actor.x *= Math.exp(-10 * dtSec);
        if (Math.abs(actor.x) < 0.6) actor.x = 0;
        actor.y += (laneY - actor.y) * Math.min(1, dtSec * 8);
        setGreetingBubble(slotEl, null);
        applyActorDom(actor, slotEl, heroCharEl, pose);
        return;
      }

      let desiredPose = 'idle';

      if (actor.state === 'reactJump') {
        // Explicit student 🦘 reaction ONLY — crisp grounded jump -> land -> return to walk
        desiredPose = (global.ScorearSpritePlayer && global.ScoreARMotionV3) ? 'jump' : 'celebrate';
        if (ts > actor.stateUntil) {
          actor.state = 'idle';
          actor.stateUntil = ts + 900;
          setGreetingBubble(slotEl, null);
        }
      } else if (actor.state === 'wave') {
        desiredPose = (global.ScorearSpritePlayer && global.ScoreARMotionV3) ? 'wave' : 'idle';
        setGreetingBubble(slotEl, actor.greetText || '👋');
        if (ts > actor.stateUntil) {
          actor.state = 'idle';
          actor.stateUntil = ts + 1400 + Math.random() * 1400;
          actor.greetText = null;
          setGreetingBubble(slotEl, null);
        }
      } else if (actor.state === 'idle') {
        desiredPose = 'idle';
        setGreetingBubble(slotEl, null);
        if (ts > actor.stateUntil) {
          pickNextWaypoint(actor, maxWander);
          actor.state = 'walk';
        }
      } else {
        // Waypoint walking ('enter' or 'walk') with real 4-direction V3 sprites
        const dx = actor.tx - actor.x;
        const dy = actor.ty - actor.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 3.5) {
          actor.x = actor.tx;
          actor.y = actor.ty;
          const wasEntering = actor.state === 'enter';
          if (wasEntering || Math.random() < 0.36) {
            actor.state = 'wave';
            actor.greetText = '👋';
            actor.stateUntil = ts + 1250;
          } else {
            actor.state = 'idle';
            actor.stateUntil = ts + 2200 + Math.random() * 1600;
          }
          desiredPose = actor.state === 'wave' ? 'wave' : 'idle';
        } else {
          const step = Math.min(dist, actor.speed * dtSec);
          const vx = (dx / dist) * step;
          const vy = (dy / dist) * step;
          actor.x += vx;
          actor.y += vy;
          if (Math.abs(dx) >= Math.abs(dy) * 1.15) {
            actor.facing = dx > 0 ? 1 : -1;
            actor.movePose = dx > 0 ? 'walkRight' : 'walkLeft';
          } else {
            actor.movePose = dy > 0 ? 'walkForward' : 'walkBackward';
          }
          desiredPose = actor.movePose;
          actor.dustTimer += dtSec;
          if (actor.dustTimer > 0.55 && fxCtx) {
            actor.dustTimer = 0;
            const cx = slotEl.offsetLeft + (slotEl.offsetWidth * 0.5) + actor.x;
            const cy = slotEl.offsetTop + slotEl.offsetHeight - 8 + actor.y;
            spawnFootDust(cx, cy, dx / dist);
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
        fxCtx.globalAlpha = Math.max(0, d.life * 0.72);
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
    const maxX = getMaxWanderX(arena, currentSlotCount);
    const activeIdSet = new Set();
    let hasNewArrival = false;

    players.forEach((p, idx) => {
      const pid = String(p.id || ('slot_' + idx));
      activeIdSet.add(pid);
      const isNew = seenIds.size > 0 && !seenIds.has(pid);
      if (isNew) hasNewArrival = true;
      if (!actors.has(pid)) actors.set(pid, createActor(pid, idx, isNew, maxX));
      else actors.get(pid).idx = idx;
      seenIds.add(pid);
    });

    Array.from(actors.keys()).forEach(k => { if (!activeIdSet.has(k)) actors.delete(k); });

    // Existing heroes politely wave to welcome the newcomer — ZERO random jumping!
    if (hasNewArrival) {
      actors.forEach(a => {
        if (a.state !== 'enter') {
          a.state = 'wave';
          a.greetText = '👋';
          a.stateUntil = now + 1350;
        }
      });
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
    const maxX = getMaxWanderX(activeArena, currentSlotCount || 1);
    actors.forEach(a => {
      a.lastPoseApplied = null;
      if (currentGlobalPose === 'walk') {
        pickNextWaypoint(a, maxX);
        a.state = 'walk';
        a.stateUntil = now + 2600;
      }
    });
  }

  // Triggered ONLY by explicit student 🦘 reaction — single crisp V3 jump -> land
  function triggerWelcomeHop(playerId) {
    const a = actors.get(String(playerId));
    const now = performance.now ? performance.now() : Date.now();
    if (a) { a.state = 'reactJump'; a.lastPoseApplied = null; a.stateUntil = now + 820; }
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
