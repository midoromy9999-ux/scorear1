
(function (global) {
  'use strict';
  const data = global.ScorearMotionData;
  if (!data) throw new Error('Load scorear-motion-data.js before scorear-motion-player.js.');

  const scriptUrl = document.currentScript?.src || document.baseURI;
  const defaultBase = new URL('.', scriptUrl);
  const cache = new Map();
  const names = Object.freeze({ ...data.moves });
  const publicCharacters = Object.freeze(Object.values(data.characters)
    .sort((a, b) => a.id - b.id)
    .map(({ id, name, original }) => Object.freeze({ id, name, original })));

  function load(path, base) {
    const url = new URL(path, base).href;
    if (!cache.has(url)) {
      cache.set(url, new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Cannot load ' + path));
        image.src = url;
      }).catch(error => { cache.delete(url); throw error; }));
    }
    return cache.get(url);
  }

  function preload(
    characterIds = [],
    moveNames = ['walkRight', 'walkLeft', 'runRight', 'runLeft', 'fly', 'jump', 'land', 'wave', 'clap', 'win', 'idle'],
    assetBase = defaultBase
  ) {
    const base = new URL(assetBase, defaultBase);
    const urls = new Set();
    const list = Array.isArray(characterIds) ? characterIds : [characterIds];
    for (const raw of list) {
      const idNum = Math.max(1, Math.min(20, parseInt(String(raw || '1').replace(/\D/g, '') || '1', 10) || 1));
      const ch = data.characters['char_' + String(idNum).padStart(2, '0')];
      if (!ch) continue;
      for (const mvName of moveNames) {
        const mv = ch.motions?.[mvName];
        if (!mv?.frames) continue;
        for (const fr of mv.frames) {
          const file = data.images?.[fr.image]?.file;
          if (file) urls.add(file);
        }
      }
    }
    return Promise.allSettled(Array.from(urls).map(file => load(file, base)));
  }

  function attach(canvas, { characterId = 1, assetBase = defaultBase, initialMotion = 'idle', loop } = {}) {
    const base = new URL(assetBase, defaultBase);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable.');
    const reducedMotion = typeof global.matchMedia === 'function'
      ? global.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };
    let character, version = 0, handle = 0, destroyed = false;

    function cancel() {
      version += 1;
      global.cancelAnimationFrame(handle);
      handle = 0;
      return version;
    }

    function draw(image, rect = [0, 0, image.naturalWidth, image.naturalHeight], frame = {}) {
      const [x, y, width, height] = rect;
      const pad = Math.min(canvas.width, canvas.height) * .045;
      const bounds = frame.layout;
      const unit = bounds ? Math.min(canvas.height * .79,
        (canvas.width - 2 * pad) / (2 * bounds.halfWidth),
        (canvas.height - 2 * pad) / (bounds.above + bounds.below)) : 0;
      const scale = bounds ? unit / bounds.unit
        : Math.min((canvas.width - 2 * pad) / width, (canvas.height - 2 * pad) / height);
      const w = width * scale, h = height * scale;
      const baseline = canvas.height - pad - (bounds ? bounds.below * unit : 0);
      const left = canvas.width / 2 - (bounds?.ax ?? width / 2) * scale;
      const top = baseline - (bounds?.ay ?? height) * scale;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      if (frame.flip) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(image, x, y, width, height, left, top, w, h);
      context.restore();
    }

    async function play(name = 'idle', { loop } = {}) {
      if (destroyed) return false;
      if (!Object.hasOwn(character.motions, name)) throw new RangeError('Unknown motion: ' + name);
      const token = cancel();
      const selected = character;
      const motion = selected.motions[name];
      const frames = motion.frames;
      try {
        const images = await Promise.all(frames.map(frame => load(data.images[frame.image].file, base)));
        if (token !== version) return false;
        if (reducedMotion.matches || motion.hold) {
          const index = { jump: 2, clap: selected.id === 2 ? 3 : 2, win: frames.length-1, sad: 1, wave: 1 }[name] ?? 0;
          draw(images[index], frames[index].rect, frames[index]);
          return true;
        }

        let index = 0, until = performance.now() + frames[0].ms;
        const repeat = loop ?? motion.loop;
        const paint = () => draw(images[index], frames[index].rect, frames[index]);
        paint();
        function tick(now) {
          if (token !== version) return;
          if (now >= until) {
            index += 1;
            if (index === frames.length) {
              if (!repeat) { void play('idle'); return; }
              index = 0;
            }
            until = now + frames[index].ms;
            paint();
          }
          handle = global.requestAnimationFrame(tick);
        }
        handle = global.requestAnimationFrame(tick);
        return true;
      } catch {
        try {
          const original = await load(selected.original, base);
          if (token === version) draw(original);
        } catch {
          if (token === version) context.clearRect(0, 0, canvas.width, canvas.height);
        }
        return false;
      }
    }

    async function showFrame(name, index) {
      if (destroyed) return false;
      const frame = character.motions[name]?.frames[index];
      if (!frame) return false;
      const token = cancel();
      try {
        const image = await load(data.images[frame.image].file, base);
        if (token !== version) return false;
        draw(image, frame.rect, frame);
        return true;
      } catch {
        return false;
      }
    }

    function setCharacter(id, motionName = 'idle', motionLoop) {
      if (destroyed) return Promise.resolve(false);
      const next = data.characters['char_' + String(id).padStart(2, '0')];
      if (!next) throw new RangeError('Unknown character: ' + id);
      character = next;
      canvas.setAttribute('aria-label', next.name);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const targetMotion = Object.hasOwn(next.motions, motionName) ? motionName : 'idle';
      return play(targetMotion, motionLoop !== undefined ? { loop: motionLoop } : undefined);
    }

    const ready = setCharacter(characterId, initialMotion, loop);
    return Object.freeze({
      ready,
      setCharacter,
      play,
      showFrame,
      dispatch(event) {
        if (!Object.hasOwn(data.events, event)) throw new RangeError('Unknown event: ' + event);
        return play(data.events[event], { loop: false });
      },
      stop: () => play('idle'),
      destroy() { cancel(); destroyed = true; },
      get character() { return character.name; }
    });
  }
  global.ScorearSpritePlayer = Object.freeze({ attach, preload, characters: publicCharacters, motions: names });
})(window);

