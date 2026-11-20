/**
 * ScoreAR V3 Sprite Motion Adapter & Independent Celebration Style Controller (quiz-motion-v3.js)
 * - Bridges ScorearSpritePlayer (20 audited characters, 15 motions, fixed foot anchor & scale).
 * - Strictly separates jump (jump -> land -> idle) from celebrate/win, supports looping & pause.
 * - Isolates legacy sessions (missing celebrationStyle -> 'classic') from teacher localStorage preference.
 * Strictly Rule 7 Compliant (< 280 lines).
 */
(function (global) {
  'use strict';
  if (global.ScoreARMotionV3) return;

  const STYLE_KEY = 'scorear_celebration_style';
  const V3_MOVES = new Set([
    'idle', 'walkForward', 'walkBackward', 'walkRight', 'walkLeft',
    'runRight', 'runLeft', 'jump', 'land', 'clap', 'win', 'sad', 'wave', 'fly', 'climb'
  ]);
  const LOOP_BY_DEFAULT = new Set(['walkForward', 'walkBackward', 'walkRight', 'walkLeft', 'runRight', 'runLeft', 'fly', 'climb']);
  const POSE_TO_V3 = {
    idle: 'idle', walk: 'walkRight', walkRight: 'walkRight', walkLeft: 'walkLeft',
    walkForward: 'walkForward', walkBackward: 'walkBackward',
    run: 'runRight', runRight: 'runRight', runLeft: 'runLeft',
    jump: 'jump', land: 'land', clap: 'clap', celebrate: 'win', win: 'win',
    sad: 'sad', wave: 'wave', fly: 'fly', climb: 'climb'
  };
  const instances = new WeakMap();
  const activeSet = new Set();
  let globalPaused = false;

  function parseCharNum(idOrCode) {
    const n = parseInt(String(idOrCode || '1').replace(/\D/g, '') || '1', 10);
    return Math.max(1, Math.min(20, isNaN(n) ? 1 : n));
  }
  function charCode(idOrCode) { return 'char_' + String(parseCharNum(idOrCode)).padStart(2, '0'); }
  function mapMotion(name) { return V3_MOVES.has(name) ? name : (POSE_TO_V3[name] || 'idle'); }
  function isReducedMotion() {
    return Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  }
  function isPausedDom() {
    return globalPaused || Boolean(typeof document !== 'undefined' && document.documentElement?.classList?.contains('characters-paused'));
  }

  function getTeacherPreferredStyle() {
    try {
      const saved = localStorage.getItem(STYLE_KEY);
      if (saved === 'hall' || saved === 'classic') return saved;
    } catch {}
    return 'classic';
  }

  // Legacy sessions (room object provided without celebrationStyle) strictly default to 'classic'
  function getCelebrationStyle(room) {
    if (room && typeof room === 'object') {
      if (room.celebrationStyle === 'hall') return 'hall';
      if (room.celebrationStyle === 'classic') return 'classic';
      return 'classic';
    }
    return getTeacherPreferredStyle();
  }

  function stampRoomCelebrationStyle(room) {
    if (!room || typeof room !== 'object') return 'classic';
    let style = room.celebrationStyle;
    if (style !== 'hall' && style !== 'classic') {
      try {
        const pinKey = room.pin ? sessionStorage.getItem('scorear_room_cel_' + room.pin) : null;
        style = (pinKey === 'hall' || pinKey === 'classic') ? pinKey : getTeacherPreferredStyle();
      } catch {
        style = getTeacherPreferredStyle();
      }
    }
    room.celebrationStyle = style === 'hall' ? 'hall' : 'classic';
    try { if (room.pin) sessionStorage.setItem('scorear_room_cel_' + room.pin, room.celebrationStyle); } catch {}
    syncStyleToFirebase(room.pin, room.celebrationStyle);
    return room.celebrationStyle;
  }

  function syncStyleToFirebase(pin, style) {
    try {
      const db = (global.ScoreARAuth?.getDb?.()) || global.firebase?.database?.();
      if (db && pin) db.ref('rooms/' + pin).update({ celebrationStyle: style, updatedAt: Date.now() }).catch(() => {});
    } catch {}
  }

  function setCelebrationStyle(style) {
    const clean = style === 'hall' ? 'hall' : 'classic';
    try { localStorage.setItem(STYLE_KEY, clean); } catch {}
    global.currentCelebrationStyle = clean;
    const room = global.ScoreARQuizHost?.getCurrentRoom?.();
    if (room) {
      room.celebrationStyle = clean;
      try { if (room.pin) sessionStorage.setItem('scorear_room_cel_' + room.pin, clean); } catch {}
      syncStyleToFirebase(room.pin, clean);
    }
    if (typeof document !== 'undefined') {
      document.querySelectorAll('[data-cel-style-btn]').forEach(b => {
        const act = b.getAttribute('data-cel-style-btn') === clean;
        b.classList.toggle('is-active', act);
        b.setAttribute('aria-pressed', String(act));
        if (b.dataset.styled === 'pill') {
          b.style.background = act ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)';
          b.style.color = act ? '#090d16' : '#e2e8f0';
          b.style.borderColor = act ? '#fde047' : 'rgba(255,255,255,0.18)';
        }
      });
    }
    return clean;
  }

  function injectModeModalCelebrationPicker(modal) {
    if (!modal || modal.querySelector('#scModeCelebrationPicker')) return;
    const confirmBtn = modal.querySelector('#btnConfirmGameMode');
    if (!confirmBtn || !confirmBtn.parentElement || !confirmBtn.parentElement.parentElement) return;
    const cur = getTeacherPreferredStyle();
    const box = document.createElement('div');
    box.id = 'scModeCelebrationPicker';
    box.style.cssText = 'margin-top:6px;padding:10px 14px;background:rgba(15,23,42,0.86);border:1px solid rgba(251,191,36,0.38);border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;';
    box.innerHTML = `
      <div style="text-align:right;">
        <div style="font-size:12.5px;font-weight:900;color:#fef08a;">طريقة الاحتفال عند النهاية</div>
        <div style="font-size:11px;color:#cbd5e1;font-weight:700;">مستقلة عن مود المسابقة · الكلاسيكي افتراضي</div>
      </div>
      <div style="display:flex;gap:6px;" role="group" aria-label="طريقة الاحتفال">
        <button type="button" data-cel-style-btn="classic" data-styled="pill" aria-pressed="${cur === 'classic'}" onclick="ScoreARMotionV3.setCelebrationStyle('classic')" style="padding:6px 14px;border-radius:999px;font-size:12px;font-weight:900;cursor:pointer;border:1px solid ${cur === 'classic' ? '#fde047' : 'rgba(255,255,255,0.18)'};background:${cur === 'classic' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)'};color:${cur === 'classic' ? '#090d16' : '#e2e8f0'};">كلاسيكي</button>
        <button type="button" data-cel-style-btn="hall" data-styled="pill" aria-pressed="${cur === 'hall'}" onclick="ScoreARMotionV3.setCelebrationStyle('hall')" style="padding:6px 14px;border-radius:999px;font-size:12px;font-weight:900;cursor:pointer;border:1px solid ${cur === 'hall' ? '#fde047' : 'rgba(255,255,255,0.18)'};background:${cur === 'hall' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)'};color:${cur === 'hall' ? '#090d16' : '#e2e8f0'};">احتفال القاعة</button>
      </div>`;
    confirmBtn.parentElement.parentElement.insertBefore(box, confirmBtn.parentElement);
  }

  function installObservers() {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    if (!global._scCelModalObs) {
      global._scCelModalObs = new MutationObserver(() => {
        const m = document.getElementById('scorearGameModeModal');
        if (m) injectModeModalCelebrationPicker(m);
      });
      const attachBody = () => { if (document.body) global._scCelModalObs.observe(document.body, { childList: true, subtree: true }); };
      if (document.body) attachBody(); else document.addEventListener('DOMContentLoaded', attachBody);
    }
    if (!global._scPauseObs && document.documentElement) {
      global._scPauseObs = new MutationObserver(() => applyGlobalPauseState());
      global._scPauseObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function applyGlobalPauseState() {
    const paused = isPausedDom();
    activeSet.forEach(inst => { try { inst._syncPause(paused); } catch {} });
  }

  function mount(containerEl, idOrCode, initialMove = 'idle', opts = {}) {
    const el = typeof containerEl === 'string' ? document.querySelector(containerEl) : containerEl;
    if (!el) return null;
    const prev = instances.get(el);
    if (prev && typeof prev.destroy === 'function') prev.destroy();

    const charId = parseCharNum(idOrCode), code = charCode(charId);
    const move = mapMotion(initialMove);
    const w = Math.max(48, Math.round(opts.width || el.clientWidth || 160));
    const h = Math.max(48, Math.round(opts.height || el.clientHeight || 200));
    const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);

    el.innerHTML = '';
    el.setAttribute('data-char-code', code);
    el.setAttribute('data-cur-pose', move);

    if (!global.ScorearSpritePlayer) {
      const img = document.createElement('img');
      img.src = `assets/motion-v3/originals/${code}.png`;
      img.onerror = () => { img.src = `assets/characters/animated/${code}-idle.webp`; };
      img.alt = code;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;';
      el.appendChild(img);
      const fb = { setAction: () => {}, play: () => {}, setCharacter: () => {}, setSpeed: () => {}, dispatch: () => {}, destroy: () => {} };
      instances.set(el, fb);
      return fb;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.cssText = 'width:100%;height:100%;display:block;pointer-events:none;object-fit:contain;will-change:transform;';
    el.appendChild(canvas);

    const base = new URL('assets/motion-v3/', (typeof document !== 'undefined' && document.baseURI) || 'http://localhost/').href;
    const player = global.ScorearSpritePlayer.attach(canvas, { characterId: charId, assetBase: base });
    let destroyed = false, currentMove = move, currentLoop = opts.loop, lastEvKey = null;
    let jumpT1 = null, jumpT2 = null, jumpRepeatT = null;

    function clearJumpTimers() {
      clearTimeout(jumpT1); clearTimeout(jumpT2); clearTimeout(jumpRepeatT);
      canvas.style.transition = '';
      canvas.style.transform = 'translateY(0)';
    }

    async function runJumpSequence(shouldLoop) {
      clearJumpTimers();
      if (destroyed) return false;
      if (isReducedMotion() || isPausedDom()) {
        return player.showFrame('jump', 2);
      }
      await player.play('jump', { loop: false });
      canvas.style.transition = 'transform 0.27s cubic-bezier(0.22,1,0.36,1)';
      canvas.style.transform = 'translateY(-28px)';
      jumpT1 = setTimeout(() => {
        if (destroyed) return;
        canvas.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.8,0.6)';
        canvas.style.transform = 'translateY(0)';
      }, 280);
      jumpT2 = setTimeout(() => {
        if (destroyed || currentMove !== 'jump') return;
        player.play('land', { loop: false });
        if (shouldLoop) {
          jumpRepeatT = setTimeout(() => {
            if (!destroyed && currentMove === 'jump' && !isPausedDom()) runJumpSequence(true);
          }, 420);
        }
      }, 610);
      return true;
    }

    async function setAction(nextMove, playOpts = {}) {
      if (destroyed) return false;
      const mapped = mapMotion(nextMove);
      const wantLoop = playOpts.loop !== undefined ? Boolean(playOpts.loop)
        : (opts.loop !== undefined ? Boolean(opts.loop) : LOOP_BY_DEFAULT.has(mapped));
      currentMove = mapped;
      currentLoop = wantLoop;
      el.setAttribute('data-cur-pose', mapped);
      clearJumpTimers();
      await player.ready;
      if (destroyed) return false;
      if (isPausedDom()) return player.showFrame(mapped, 0);
      if (mapped === 'jump') return runJumpSequence(wantLoop);
      return player.play(mapped, { loop: wantLoop });
    }

    player.ready.then(() => {
      if (destroyed) return;
      if (isPausedDom()) player.showFrame(move, 0);
      else if (move !== 'idle') setAction(move, { loop: opts.loop });
    });

    const api = {
      ready: player.ready, player, canvas,
      setAction, play: setAction,
      getCurrentMove: () => currentMove,
      dispatch: async (evName, dedupeKey = null) => {
        if (destroyed) return false;
        if (dedupeKey && dedupeKey === lastEvKey) return false;
        lastEvKey = dedupeKey;
        await player.ready;
        if (destroyed) return false;
        if (evName === 'podium') return setAction('jump', { loop: false });
        const evMap = global.ScorearMotionData?.events || {};
        const targetMove = evMap[evName] || mapMotion(evName);
        return setAction(targetMove, { loop: false });
      },
      setCharacter: async nextId => {
        if (destroyed) return false;
        const ok = await player.setCharacter(parseCharNum(nextId));
        if (ok && currentMove !== 'idle') return setAction(currentMove, { loop: currentLoop });
        return ok;
      },
      setSpeed: mult => {
        const pauseNow = Number(mult) < 0.05;
        api._syncPause(pauseNow);
      },
      _syncPause: paused => {
        if (destroyed) return;
        clearJumpTimers();
        if (paused) player.showFrame(currentMove, 0);
        else setAction(currentMove, { loop: currentLoop });
      },
      destroy: () => {
        destroyed = true;
        clearJumpTimers();
        activeSet.delete(api);
        player.destroy();
      }
    };
    instances.set(el, api);
    activeSet.add(api);
    return api;
  }

  function installEngineBridge() {
    installObservers();
    if (global.ScoreARMotionEngine && !global.ScoreARMotionEngine._v3Patched) {
      global.ScoreARMotionEngine._legacyMount = global.ScoreARMotionEngine.mount;
      global.ScoreARMotionEngine._legacySetSpeed = global.ScoreARMotionEngine.setSpeed;
      global.ScoreARMotionEngine._v3Patched = true;
      global.ScoreARMotionEngine.mount = (container, charId, action, opts) => {
        if (global.ScorearSpritePlayer) return mount(container, charId, action, opts);
        return global.ScoreARMotionEngine._legacyMount(container, charId, action, opts);
      };
      global.ScoreARMotionEngine.getInstance = el => {
        const node = typeof el === 'string' ? document.querySelector(el) : el;
        return node ? (instances.get(node) || null) : null;
      };
      global.ScoreARMotionEngine.setSpeed = mult => {
        globalPaused = Number(mult) < 0.05;
        applyGlobalPauseState();
        if (typeof global.ScoreARMotionEngine._legacySetSpeed === 'function') {
          global.ScoreARMotionEngine._legacySetSpeed(mult);
        }
      };
    }
  }

  installEngineBridge();
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', installEngineBridge);

  global.ScoreARMotionV3 = {
    mount, mapMotion, charCode, parseCharNum,
    getTeacherPreferredStyle, getCelebrationStyle, stampRoomCelebrationStyle, setCelebrationStyle,
    injectModeModalCelebrationPicker, installEngineBridge,
    getInstance: el => instances.get(el) || null
  };
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARMotionV3 = global.ScoreARMotionV3; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ScoreARMotionV3;
})(typeof window !== 'undefined' ? window : globalThis);
