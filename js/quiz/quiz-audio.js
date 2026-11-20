/**
 * ScoreAR Interactive Audio Engine (quiz-audio.js)
 * Manages Background Music (Worlds, Lobby, Victory), SFX & Web Audio Unblock/Fallback
 * Strictly Rule 7 Compliant (<500 lines).
 */
(function(global) {
  'use strict';

  let currentMusic = null;
  let currentTrackName = null;
  let desiredTrack = null;
  let desiredVol = null;
  let preDuckVol = null;
  let musicFadeTimer = null;
  const outFadeTimers = new Set();
  const activeSfx = new Set();
  let autoplayBlocked = false;
  let audioCtx = null;
  let isMuted = false;
  try {
    isMuted = (typeof localStorage !== 'undefined' && localStorage.getItem('scorear_audio_muted') === 'true');
  } catch(e){}
  let musicVolume = 0.28;
  let sfxVolume = 0.85;
  const clamp01 = v => Math.max(0, Math.min(1, Number(v) || 0));

  const MUSIC_TRACKS = {
    lobby: 'assets/audio/music/treasure.mp3',
    waiting: 'assets/audio/music/treasure.mp3',
    question: 'assets/audio/music/magic.mp3',
    royal: 'assets/audio/music/magic.mp3',
    oasis: 'assets/audio/music/magic.mp3',
    cosmic: 'assets/audio/music/magic.mp3',
    treasure: 'assets/audio/music/magic.mp3',
    stadium: 'assets/audio/music/magic.mp3',
    magic: 'assets/audio/music/magic.mp3',
    celebration: 'assets/audio/music/celebration.wav',
    victory: 'assets/audio/music/celebration.wav'
  };

  const SFX_FILES = {
    correct: 'assets/audio/sfx/correct.mp3',
    wrong: 'assets/audio/sfx/wrong.mp3',
    pop: 'assets/audio/sfx/pop.mp3',
    reveal: 'assets/audio/sfx/reveal.mp3',
    tick: 'assets/audio/sfx/tick.mp3',
    whoosh: 'assets/audio/sfx/whoosh.mp3',
    fanfare: 'assets/audio/sfx/fanfare.mp3',
    drumroll: 'assets/audio/sfx/drumroll-4s.wav',
    applauseWarm: 'assets/audio/sfx/applause-warm.wav',
    applauseStrong: 'assets/audio/sfx/applause-strong.wav',
    applauseGrand: 'assets/audio/sfx/applause-grand.wav',
    spotlightLock: 'assets/audio/sfx/spotlight-lock.wav',
    rank3Reveal: 'assets/audio/sfx/rank3-reveal.wav',
    rank2Reveal: 'assets/audio/sfx/rank2-reveal.wav',
    victoryFanfare: 'assets/audio/sfx/victory-fanfare.wav'
  };

  function getCtx() {
    if (audioCtx) return audioCtx;
    try {
      const Ctx = global.AudioContext || global.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    } catch(e) {}
    return audioCtx;
  }

  let counterStep = 0;

  function tone(freq, dur, type, vol, delay = 0, freqEnd = null) {
    const ctx = getCtx();
    if (!ctx) return;
    const fire = () => {
      try {
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, now);
        if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
        gain.gain.setValueAtTime(Math.max(0.001, vol), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      } catch(e) {}
    };
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      ctx.resume().then(fire).catch(() => {});
    } else if (ctx.state === 'running') {
      fire();
    }
  }

  function playSynthSfx(type, vol) {
    const v = Math.min(0.48, (vol || 0.75) * 0.4);
    if (type === 'counter') {
      counterStep = (counterStep + 1) % 8;
      const base = 540 + counterStep * 36;
      tone(base, 0.07, 'triangle', Math.min(0.5, v * 1.15), 0, base * 1.45);
      return tone(base * 1.5, 0.09, 'sine', Math.min(0.42, v * 0.9), 0.045);
    }
    if (type === 'tick') return tone(920, 0.06, 'triangle', v, 0, 440);
    if (type === 'pop') return tone(540, 0.08, 'sine', v, 0, 820);
    if (type === 'whoosh') return tone(380, 0.18, 'sine', v * 0.8, 0, 140);
    if (type === 'reveal') { tone(523, 0.11, 'triangle', v, 0); return tone(784, 0.16, 'triangle', v, 0.08); }
    if (type === 'rank3Reveal') { [440, 554.37, 659.25].forEach((f, i) => tone(f, 0.18, 'triangle', v, i * 0.09)); return; }
    if (type === 'rank2Reveal') { [493.88, 622.25, 739.99, 987.77].forEach((f, i) => tone(f, 0.18, 'triangle', v, i * 0.08)); return; }
    if (type === 'spotlightLock') { tone(98, 0.32, 'sine', v * 1.1, 0, 62); [587.33, 739.99, 880].forEach((f, i) => tone(f, 0.35, 'triangle', v * 0.85, i * 0.03)); return; }
    if (type === 'correct') { [523, 659, 784].forEach((f, i) => tone(f, 0.16, 'triangle', v, i * 0.07)); return; }
    if (type === 'wrong') return tone(230, 0.24, 'sawtooth', v * 0.75, 0, 145);
    if (type === 'drumroll') { [196, 220, 247, 293.66].forEach((f, i) => tone(f, 0.25, 'triangle', v * 0.6, i * 0.18)); return; }
    if (type === 'applauseWarm' || type === 'applauseStrong' || type === 'applauseGrand') {
      const cnt = type === 'applauseGrand' ? 12 : (type === 'applauseStrong' ? 9 : 6);
      for (let i = 0; i < cnt; i++) tone(900 + (i % 4) * 260, 0.06, 'triangle', v * 0.32, i * 0.09);
      return;
    }
    if (type === 'fanfare' || type === 'victoryFanfare') { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.24, 'triangle', v, i * 0.08)); }
  }

  function unlockAudio() {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      ctx.resume().catch(() => {});
    }
    if (isMuted) return;
    if (currentMusic && (currentMusic.paused || autoplayBlocked)) {
      const p = currentMusic.play();
      if (p && typeof p.then === 'function') {
        p.then(() => { autoplayBlocked = false; updateMuteIcons(); }).catch(() => {});
      }
    } else if (!currentMusic && desiredTrack) {
      playMusic(desiredTrack, desiredVol);
    }
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    ['pointerdown', 'click', 'touchstart', 'keydown'].forEach(evt => {
      document.addEventListener(evt, unlockAudio, { passive: true, capture: true });
    });
  }

  function resolveMusicKey(trackId) {
    const rawKey = String(trackId || 'magic').toLowerCase().trim();
    return (rawKey === 'lobby' || rawKey === 'waiting') ? 'lobby' : (MUSIC_TRACKS[rawKey] ? rawKey : 'magic');
  }

  function clearMainFade() {
    if (musicFadeTimer) { clearInterval(musicFadeTimer); musicFadeTimer = null; }
  }

  function clearOutFades() {
    outFadeTimers.forEach(id => clearInterval(id));
    outFadeTimers.clear();
  }

  function fadeAudioVolume(aud, targetVol, durMs, isMain, onDone) {
    const target = clamp01(targetVol);
    if (!aud) { onDone?.(); return; }
    if (isMain) clearMainFade();
    const startVol = clamp01(typeof aud.volume === 'number' ? aud.volume : target);
    if (durMs <= 0 || typeof setInterval !== 'function' || Math.abs(target - startVol) < 0.005) {
      try { aud.volume = target; } catch(e){}
      onDone?.();
      return;
    }
    const steps = Math.max(2, Math.round(durMs / 30));
    let step = 0;
    const tid = setInterval(() => {
      step++;
      const t = Math.min(1, step / steps);
      try { aud.volume = clamp01(startVol + (target - startVol) * t); } catch(e){}
      if (t >= 1) {
        clearInterval(tid);
        if (isMain && musicFadeTimer === tid) musicFadeTimer = null;
        outFadeTimers.delete(tid);
        onDone?.();
      }
    }, 30);
    if (isMain) musicFadeTimer = tid;
    else outFadeTimers.add(tid);
  }

  function playMusic(trackId, customVol = null) {
    const key = resolveMusicKey(trackId);
    const vol = (typeof customVol === 'number') ? clamp01(customVol) : musicVolume;
    desiredTrack = key;
    desiredVol = vol;
    preDuckVol = null;
    clearMainFade();
    if (isMuted) { updateMuteIcons(); return; }
    const url = MUSIC_TRACKS[key] || 'assets/audio/music/magic.mp3';

    if (currentMusic && currentTrackName === key) {
      try { currentMusic.volume = vol; } catch(e){}
      if (currentMusic.paused || autoplayBlocked) {
        const p = currentMusic.play();
        if (p && typeof p.then === 'function') {
          p.then(() => { autoplayBlocked = false; updateMuteIcons(); }).catch(() => { autoplayBlocked = true; updateMuteIcons(); });
        }
      }
      return;
    }

    stopMusic(false);

    try {
      const aud = new Audio(url);
      aud.loop = true;
      aud.volume = vol;
      currentMusic = aud;
      currentTrackName = key;
      const p = aud.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          autoplayBlocked = false;
          updateMuteIcons();
        }).catch(() => {
          autoplayBlocked = true;
          updateMuteIcons();
        });
      }
    } catch(e) {
      console.warn('[ScoreAR Audio] Play music notice:', e);
    }
  }

  function crossfadeMusic(trackId, customVol = null, durMs = 650) {
    const key = resolveMusicKey(trackId);
    const vol = (typeof customVol === 'number') ? clamp01(customVol) : musicVolume;
    desiredTrack = key;
    desiredVol = vol;
    preDuckVol = null;
    if (isMuted) { updateMuteIcons(); return; }
    const url = MUSIC_TRACKS[key] || 'assets/audio/music/magic.mp3';

    if (currentMusic && currentTrackName === key) {
      if (currentMusic.paused || autoplayBlocked) {
        const p = currentMusic.play();
        if (p && typeof p.then === 'function') {
          p.then(() => { autoplayBlocked = false; updateMuteIcons(); }).catch(() => { autoplayBlocked = true; updateMuteIcons(); });
        }
      }
      fadeAudioVolume(currentMusic, vol, durMs, true);
      return;
    }

    const oldMusic = currentMusic;
    clearMainFade();
    clearOutFades();
    currentMusic = null;
    currentTrackName = null;

    if (oldMusic) {
      fadeAudioVolume(oldMusic, 0.005, Math.max(120, Math.round(durMs * 0.45)), false, () => {
        try { oldMusic.pause(); oldMusic.currentTime = 0; } catch(e){}
      });
    }

    try {
      const aud = new Audio(url);
      aud.loop = true;
      aud.volume = 0.01;
      currentMusic = aud;
      currentTrackName = key;
      const p = aud.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          autoplayBlocked = false;
          updateMuteIcons();
          if (currentMusic === aud && !isMuted) fadeAudioVolume(aud, vol, durMs, true);
        }).catch(() => {
          autoplayBlocked = true;
          try { aud.volume = vol; } catch(e){}
          updateMuteIcons();
        });
      } else {
        fadeAudioVolume(aud, vol, durMs, true);
      }
    } catch(e) {
      console.warn('[ScoreAR Audio] Crossfade music notice:', e);
    }
  }

  function duckMusic(targetVol = 0.05, durMs = 450) {
    if (isMuted) return;
    if (preDuckVol === null) {
      preDuckVol = clamp01(typeof desiredVol === 'number' ? desiredVol : (currentMusic ? currentMusic.volume : musicVolume));
    }
    if (currentMusic) fadeAudioVolume(currentMusic, clamp01(targetVol), durMs, true);
  }

  function unduckMusic(durMs = 600) {
    const restoreVol = clamp01(preDuckVol !== null ? preDuckVol : (typeof desiredVol === 'number' ? desiredVol : musicVolume));
    preDuckVol = null;
    if (!isMuted && currentMusic) fadeAudioVolume(currentMusic, restoreVol, durMs, true);
  }

  function stopMusic(clearDesired = true) {
    clearMainFade();
    clearOutFades();
    preDuckVol = null;
    if (clearDesired) { desiredTrack = null; autoplayBlocked = false; }
    if (currentMusic) {
      try {
        currentMusic.pause();
        currentMusic.currentTime = 0;
      } catch(e){}
      currentMusic = null;
      currentTrackName = null;
    }
  }

  function stopAllSfx() {
    activeSfx.forEach(aud => {
      try { aud.pause(); aud.currentTime = 0; } catch(e){}
    });
    activeSfx.clear();
  }

  function playSfx(type, customVol = null) {
    if (isMuted) return;
    const url = SFX_FILES[type];
    const vol = (typeof customVol === 'number') ? clamp01(customVol) : sfxVolume;
    if (!url) { playSynthSfx(type, vol); return; }

    try {
      const aud = new Audio(url);
      aud.volume = vol;
      activeSfx.add(aud);
      const cleanupSfx = () => activeSfx.delete(aud);
      if (typeof aud.addEventListener === 'function') {
        aud.addEventListener('ended', cleanupSfx, { once: true });
        aud.addEventListener('error', cleanupSfx, { once: true });
      }
      if (typeof setTimeout === 'function') setTimeout(cleanupSfx, 7000);
      const p = aud.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { cleanupSfx(); playSynthSfx(type, vol); });
      }
    } catch(e) {
      playSynthSfx(type, vol);
    }
  }

  function toggleMute() {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      ctx.resume().catch(() => {});
    }
    if (!isMuted && autoplayBlocked) {
      autoplayBlocked = false;
      try { if (typeof localStorage !== 'undefined') localStorage.setItem('scorear_audio_muted', 'false'); } catch(e){}
      if (currentMusic) currentMusic.play().catch(() => {});
      else if (desiredTrack) playMusic(desiredTrack, desiredVol);
      updateMuteIcons();
      return false;
    }

    isMuted = !isMuted;
    autoplayBlocked = false;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('scorear_audio_muted', String(isMuted));
      }
    } catch(e){}
    if (isMuted) {
      clearMainFade();
      clearOutFades();
      stopAllSfx();
      if (currentMusic) currentMusic.pause();
    } else {
      if (currentMusic) {
        const p = currentMusic.play();
        if (p && typeof p.catch === 'function') p.catch(() => { autoplayBlocked = true; updateMuteIcons(); });
      } else if (desiredTrack) {
        playMusic(desiredTrack, desiredVol);
      }
    }
    updateMuteIcons();
    return isMuted;
  }

  function updateMuteIcons() {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;
    const btns = document.querySelectorAll('.scorear-audio-btn, #hostAudioMuteBtn, #scAudioBtn');
    btns.forEach(b => {
      if (!b) return;
      const compact = (b.id === 'scAudioBtn');
      if (isMuted) {
        b.innerHTML = compact ? '🔇' : '🔇 الصوت: صامت';
        if (b.style) { b.style.color = '#f87171'; b.style.borderColor = 'rgba(248,113,113,0.5)'; }
      } else if (autoplayBlocked) {
        b.innerHTML = compact ? '🔇' : '🔊 اضغط لتفعيل الصوت';
        if (b.style) { b.style.color = '#fbbf24'; b.style.borderColor = '#fbbf24'; }
      } else {
        b.innerHTML = compact ? '🔊' : '🔊 الصوت: يعمل';
        if (b.style) { b.style.color = '#52d9ed'; b.style.borderColor = 'rgba(82,217,237,0.45)'; }
      }
    });
  }

  global.ScoreARAudio = {
    playMusic,
    crossfadeMusic,
    duckMusic,
    unduckMusic,
    stopMusic,
    playSfx,
    stopAllSfx,
    toggleMute,
    updateMuteIcons,
    unlock: unlockAudio,
    isMuted: () => isMuted,
    isAutoplayBlocked: () => autoplayBlocked,
    getCurrentTrack: () => currentTrackName || desiredTrack,
    setMusicVolume: (v) => { musicVolume = clamp01(v); preDuckVol = null; if (currentMusic) currentMusic.volume = musicVolume; },
    setSfxVolume: (v) => { sfxVolume = clamp01(v); }
  };

})(typeof window !== 'undefined' ? window : this);
