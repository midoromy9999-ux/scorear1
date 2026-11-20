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
  let currentGlobalPose = 'entrance';
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

  function createActor(id, idx, totalCount, arena, batchIdx) {
    const laneIdx = idx % LANES.length;
    const lane = LANES[laneIdx];
    const now = performance.now ? performance.now() : Date.now();
    const arenaW = arena?.clientWidth || 1100;
    const entryOffset = Math.min(230, Math.max(165, arenaW * 0.21));
    const fromLeft = totalCount <= 1 ? true : (idx < Math.ceil(totalCount / 2));
    const startX = fromLeft ? -entryOffset : entryOffset;
    const movePose = fromLeft ? 'walkRight' : 'walkLeft';
    const enterAt = now + (batchIdx || 0) * 240;
    return {
      id: String(id), idx, laneIdx,
      x: startX, y: lane.y,
      tx: 0, ty: lane.y,
      speed: 110,
      facing: fromLeft ? 1 : -1,
      movePose,
      state: 'enter',
      enterAt,
      stateUntil: enterAt + 5000,
      nextWaveAt: enterAt + 9500 + (idx % 4) * 1400,
      readyDeadline: enterAt + 1600,
      spriteReady: false,
      readyHooked: false,
      boundEl: null,
      dustTimer: 0,
      lastPoseApplied: null,
      lastLoopApplied: null,
      greetText: '👋'
    };
  }

  function hookSpriteReady(actor, heroCharEl) {
    if (!actor || actor.spriteReady || actor.readyHooked || !heroCharEl) return;
    actor.readyHooked = true;
    const inst = global.ScoreARMotionEngine?.getInstance?.(heroCharEl);
    const p = inst?.whenReady?.() || inst?.ready;
    if (p && typeof p.then === 'function') {
      p.then(() => { actor.spriteReady = true; }).catch(() => { actor.spriteReady = true; });
    } else {
      actor.spriteReady = true;
    }
  }

  function applyActorDom(actor, slotEl, heroCharEl, poseToApply, bobY = 0, forceLoop = undefined) {
    if (!slotEl) return;
    const sc = scaleForY(actor.y);
    slotEl.style.willChange = 'transform';
    slotEl.style.zIndex = String(12 + Math.round(actor.y + 26));
    slotEl.style.transform = `translate3d(${actor.x.toFixed(1)}px, ${(actor.y + bobY).toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
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

      const shouldLoop = forceLoop !== undefined ? Boolean(forceLoop) : (resolvedPose !== 'jump' && resolvedPose !== 'land');
      if ((actor.lastPoseApplied !== resolvedPose || actor.lastLoopApplied !== shouldLoop) && global.ScoreARMotionEngine?.getInstance) {
        const inst = global.ScoreARMotionEngine.getInstance(heroCharEl);
        if (inst && typeof inst.setAction === 'function') {
          inst.setAction(resolvedPose, { loop: shouldLoop });
        }
        actor.lastPoseApplied = resolvedPose;
        actor.lastLoopApplied = shouldLoop;
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
    const dtSec = Math.min(0.25, Math.max(0.001, (ts - lastTs) / 1000));
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
        actor = createActor(pid, idx, slots.length, activeArena, 0);
        actors.set(pid, actor);
      }
      actor.idx = idx;
      const heroCharEl = slotEl.querySelector('.host-lobby-hero-char');
      if (heroCharEl && actor.boundEl !== heroCharEl) {
        actor.boundEl = heroCharEl;
        actor.lastPoseApplied = null;
        actor.lastLoopApplied = null;
        actor.readyHooked = false;
      }
      hookSpriteReady(actor, heroCharEl);
      if (!actor.spriteReady && ts >= actor.readyDeadline) actor.spriteReady = true;

      // Explicit teacher pose lock ('idle', 'wave', 'jump', 'clap', 'win', 'celebrate') or reduced-motion
      if (disabled || (currentGlobalPose !== 'entrance' && currentGlobalPose !== 'walk')) {
        const pose = disabled ? 'idle' : currentGlobalPose;
        const laneY = LANES[actor.laneIdx % LANES.length].y;
        actor.x *= Math.exp(-10 * dtSec);
        if (Math.abs(actor.x) < 0.6) actor.x = 0;
        actor.y += (laneY - actor.y) * Math.min(1, dtSec * 8);
        slotEl.style.opacity = '1';
        setGreetingBubble(slotEl, (!disabled && pose === 'wave') ? '👋' : null);
        applyActorDom(actor, slotEl, heroCharEl, pose, 0, pose === 'wave' ? true : undefined);
        return;
      }

      let desiredPose = 'idle';
      let bobY = 0;
      let forceLoop = undefined;
      const laneY = LANES[actor.laneIdx % LANES.length].y;

      if (actor.state === 'reactJump') {
        desiredPose = (global.ScorearSpritePlayer && global.ScoreARMotionV3) ? 'jump' : 'celebrate';
        forceLoop = false;
        slotEl.style.opacity = '1';
        if (ts > actor.stateUntil) {
          actor.state = currentGlobalPose === 'walk' ? 'idle' : 'stand';
          actor.stateUntil = ts + 900;
          setGreetingBubble(slotEl, null);
        }
      } else if (actor.state === 'enter') {
        if (!actor.spriteReady || ts < actor.enterAt) {
          slotEl.style.opacity = '0';
          desiredPose = actor.movePose;
          forceLoop = true;
          applyActorDom(actor, slotEl, heroCharEl, desiredPose, 0, forceLoop);
          return;
        }
        slotEl.style.opacity = String(Math.min(1, (ts - actor.enterAt) / 220));
        const dx = 0 - actor.x;
        const dy = laneY - actor.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 2.5) {
          actor.x = 0;
          actor.y = laneY;
          actor.state = 'wave';
          actor.greetText = '👋';
          actor.stateUntil = ts + 2200;
          actor.lastPoseApplied = null;
          desiredPose = (global.ScorearSpritePlayer && global.ScoreARMotionV3) ? 'wave' : 'idle';
          forceLoop = true;
          setGreetingBubble(slotEl, '👋');
        } else {
          const step = Math.min(dist, actor.speed * dtSec);
          actor.x += (dx / dist) * step;
          actor.y += (dy / dist) * step;
          actor.facing = dx >= 0 ? 1 : -1;
          actor.movePose = dx >= 0 ? 'walkRight' : 'walkLeft';
          desiredPose = actor.movePose;
          forceLoop = true;
          bobY = -Math.abs(Math.sin((ts / 280) * Math.PI)) * 3;
          setGreetingBubble(slotEl, null);
          actor.dustTimer += dtSec;
          if (actor.dustTimer > 0.42 && fxCtx) {
            actor.dustTimer = 0;
            const cx = slotEl.offsetLeft + (slotEl.offsetWidth * 0.5) + actor.x;
            const cy = slotEl.offsetTop + slotEl.offsetHeight - 8 + actor.y;
            spawnFootDust(cx, cy, dx / dist);
          }
        }
      } else if (actor.state === 'wave') {
        slotEl.style.opacity = '1';
        actor.x *= Math.exp(-10 * dtSec);
        if (Math.abs(actor.x) < 0.6) actor.x = 0;
        actor.y += (laneY - actor.y) * Math.min(1, dtSec * 8);
        desiredPose = (global.ScorearSpritePlayer && global.ScoreARMotionV3) ? 'wave' : 'idle';
        forceLoop = true;
        setGreetingBubble(slotEl, actor.greetText || '👋');
        if (ts > actor.stateUntil) {
          actor.state = currentGlobalPose === 'walk' ? 'idle' : 'stand';
          actor.greetText = null;
          setGreetingBubble(slotEl, null);
          actor.stateUntil = ts + 1400 + Math.random() * 1200;
          actor.nextWaveAt = ts + 5500 + (actor.idx % 4) * 1400 + Math.random() * 2500;
          actor.lastPoseApplied = null;
        }
      } else if (currentGlobalPose === 'entrance' || actor.state === 'stand') {
        slotEl.style.opacity = '1';
        actor.state = 'stand';
        actor.x *= Math.exp(-10 * dtSec);
        if (Math.abs(actor.x) < 0.6) actor.x = 0;
        actor.y += (laneY - actor.y) * Math.min(1, dtSec * 8);
        desiredPose = 'idle';
        setGreetingBubble(slotEl, null);
        if (ts >= actor.nextWaveAt) {
          actor.state = 'wave';
          actor.greetText = '👋';
          actor.stateUntil = ts + 1800;
          actor.lastPoseApplied = null;
        }
      } else if (actor.state === 'idle') {
        slotEl.style.opacity = '1';
        desiredPose = 'idle';
        setGreetingBubble(slotEl, null);
        if (ts > actor.stateUntil) {
          pickNextWaypoint(actor, maxWander);
          actor.state = 'walk';
        }
      } else {
        // Explicit 'walk' mode along floor lanes
        if (!actor.spriteReady) {
          applyActorDom(actor, slotEl, heroCharEl, actor.movePose, 0, true);
          return;
        }
        slotEl.style.opacity = '1';
        const dx = actor.tx - actor.x;
        const dy = actor.ty - actor.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 3.5) {
          actor.x = actor.tx;
          actor.y = actor.ty;
          if (Math.random() < 0.36) {
            actor.state = 'wave';
            actor.greetText = '👋';
            actor.stateUntil = ts + 1500;
          } else {
            actor.state = 'idle';
            actor.stateUntil = ts + 2200 + Math.random() * 1600;
          }
          desiredPose = actor.state === 'wave' ? 'wave' : 'idle';
          forceLoop = actor.state === 'wave';
        } else {
          const step = Math.min(dist, 96 * dtSec);
          actor.x += (dx / dist) * step;
          actor.y += (dy / dist) * step;
          if (Math.abs(dx) >= Math.abs(dy) * 1.15) {
            actor.facing = dx > 0 ? 1 : -1;
            actor.movePose = dx > 0 ? 'walkRight' : 'walkLeft';
          } else {
            actor.movePose = dy > 0 ? 'walkForward' : 'walkBackward';
          }
          desiredPose = actor.movePose;
          forceLoop = true;
          bobY = -Math.abs(Math.sin((ts / 280) * Math.PI)) * 2.5;
          actor.dustTimer += dtSec;
          if (actor.dustTimer > 0.55 && fxCtx) {
            actor.dustTimer = 0;
            const cx = slotEl.offsetLeft + (slotEl.offsetWidth * 0.5) + actor.x;
            const cy = slotEl.offsetTop + slotEl.offsetHeight - 8 + actor.y;
            spawnFootDust(cx, cy, dx / dist);
          }
        }
      }

      applyActorDom(actor, slotEl, heroCharEl, desiredPose, bobY, forceLoop);
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

  function syncArena(arena, players = [], pose) {
    if (!arena) return;
    activeArena = arena;
    currentGlobalPose = pose || currentGlobalPose || 'entrance';
    currentSlotCount = Array.isArray(players) ? players.length : 0;
    if (!currentSlotCount) { stop(); return; }

    global.ScoreARMotionV3?.preloadCharacters?.(players, ['walkRight', 'walkLeft', 'wave', 'idle']);
    ensureDustCanvas(arena);
    const now = performance.now ? performance.now() : Date.now();
    const activeIdSet = new Set();
    let hasNewArrival = false;
    let newBatchIdx = 0;
    const hadExisting = actors.size > 0;

    players.forEach((p, idx) => {
      const pid = String(p.id || ('slot_' + idx));
      activeIdSet.add(pid);
      const isNewActor = !actors.has(pid);
      if (isNewActor) {
        if (hadExisting && !seenIds.has(pid)) hasNewArrival = true;
        actors.set(pid, createActor(pid, idx, players.length, arena, newBatchIdx++));
      } else {
        const existing = actors.get(pid);
        existing.idx = idx;
      }
      seenIds.add(pid);
    });

    Array.from(actors.keys()).forEach(k => { if (!activeIdSet.has(k)) actors.delete(k); });

    // Existing standing heroes politely wave to welcome newly joining heroes!
    if (hasNewArrival) {
      actors.forEach(a => {
        if (a.state !== 'enter') {
          a.state = 'wave';
          a.greetText = '👋';
          a.stateUntil = now + 1900;
          a.lastPoseApplied = null;
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
    currentGlobalPose = pose || 'entrance';
    const now = performance.now ? performance.now() : Date.now();
    const maxX = getMaxWanderX(activeArena, currentSlotCount || 1);
    actors.forEach((a, _, map) => {
      a.lastPoseApplied = null;
      a.lastLoopApplied = null;
      if (currentGlobalPose === 'walk') {
        pickNextWaypoint(a, maxX);
        a.state = 'walk';
        a.stateUntil = now + 2600;
      } else if (currentGlobalPose === 'entrance') {
        const arenaW = activeArena?.clientWidth || 1100;
        const entryOffset = Math.min(230, Math.max(165, arenaW * 0.21));
        const fromLeft = map.size <= 1 ? true : (a.idx < Math.ceil(map.size / 2));
        a.x = fromLeft ? -entryOffset : entryOffset;
        a.tx = 0;
        a.movePose = fromLeft ? 'walkRight' : 'walkLeft';
        a.facing = fromLeft ? 1 : -1;
        a.enterAt = now + (a.idx % 6) * 200;
        a.state = 'enter';
      } else if (currentGlobalPose === 'wave') {
        a.state = 'wave';
        a.greetText = '👋';
        a.stateUntil = now + 60000;
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
