/**
 * ScoreAR TV Game-Show Ceremony Audio Generator (tools/generate-ceremony-audio.cjs)
 * Pure Node.js DSP engine generating offline-ready 16-bit Stereo WAV assets:
 *  - assets/audio/music/celebration.wav (15.36s seamless 8-bar 125 BPM D-Major TV show anthem loop)
 *  - assets/audio/sfx/rank3-reveal.wav
 *  - assets/audio/sfx/rank2-reveal.wav
 *  - assets/audio/sfx/applause-warm.wav
 *  - assets/audio/sfx/applause-strong.wav
 *  - assets/audio/sfx/drumroll-4s.wav
 *  - assets/audio/sfx/spotlight-lock.wav
 *  - assets/audio/sfx/victory-fanfare.wav
 *  - assets/audio/sfx/applause-grand.wav
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SR = 22050;
const TWO_PI = Math.PI * 2;
const ROOT = path.resolve(__dirname, '..');

function createRng(seed = 20261120) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createStereoBuffer(durSec) {
  const len = Math.max(1, Math.round(durSec * SR));
  return { L: new Float32Array(len), R: new Float32Array(len), len, sr: SR };
}

function mixSample(buf, i, l, r) {
  if (i >= 0 && i < buf.len) {
    buf.L[i] += l;
    buf.R[i] += r;
  }
}

function addPannedMono(buf, mono, startSec, pan = 0, gain = 1) {
  const start = Math.round(startSec * SR);
  const clampedPan = Math.max(-1, Math.min(1, pan));
  const ang = (clampedPan + 1) * 0.25 * Math.PI;
  const gL = Math.cos(ang) * gain;
  const gR = Math.sin(ang) * gain;
  for (let i = 0; i < mono.length; i++) {
    const idx = start + i;
    if (idx >= 0 && idx < buf.len) {
      const s = mono[i];
      buf.L[idx] += s * gL;
      buf.R[idx] += s * gR;
    }
  }
}

function biquadFilter(input, type, freq, Q = 0.707, gainDb = 0) {
  const w0 = (TWO_PI * Math.max(20, Math.min(SR * 0.45, freq))) / SR;
  const cosW = Math.cos(w0);
  const sinW = Math.sin(w0);
  const alpha = sinW / (2 * Math.max(0.1, Q));
  let b0 = 1, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

  if (type === 'lowpass') {
    b0 = (1 - cosW) * 0.5; b1 = 1 - cosW; b2 = (1 - cosW) * 0.5;
    a0 = 1 + alpha; a1 = -2 * cosW; a2 = 1 - alpha;
  } else if (type === 'highpass') {
    b0 = (1 + cosW) * 0.5; b1 = -(1 + cosW); b2 = (1 + cosW) * 0.5;
    a0 = 1 + alpha; a1 = -2 * cosW; a2 = 1 - alpha;
  } else if (type === 'bandpass') {
    b0 = alpha; b1 = 0; b2 = -alpha;
    a0 = 1 + alpha; a1 = -2 * cosW; a2 = 1 - alpha;
  } else if (type === 'peaking') {
    const A = Math.pow(10, gainDb / 40);
    b0 = 1 + alpha * A; b1 = -2 * cosW; b2 = 1 - alpha * A;
    a0 = 1 + alpha / A; a1 = -2 * cosW; a2 = 1 - alpha / A;
  }

  b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
  const out = new Float32Array(input.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < input.length; i++) {
    const x0 = input[i];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    out[i] = y0;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}

function applyHallReverbChannel(input, wet = 0.24, decay = 0.72, chSpread = 0) {
  const combDelays = [643, 739, 863, 977].map(d => d + chSpread);
  const combFeedback = [0.76, 0.78, 0.80, 0.75].map(f => f * decay / 0.72);
  const allpassDelays = [113 + Math.floor(chSpread * 0.3), 37 + Math.floor(chSpread * 0.2)];

  const n = input.length;
  const acc = new Float32Array(n);

  for (let c = 0; c < combDelays.length; c++) {
    const d = combDelays[c];
    const fb = Math.min(0.88, combFeedback[c]);
    const buf = new Float32Array(d);
    let idx = 0, lp = 0;
    for (let i = 0; i < n; i++) {
      const delayed = buf[idx];
      lp = lp * 0.38 + delayed * 0.62;
      buf[idx] = input[i] + lp * fb;
      idx = (idx + 1) % d;
      acc[i] += delayed * 0.28;
    }
  }

  let diff = acc;
  for (const d of allpassDelays) {
    const out = new Float32Array(n);
    const buf = new Float32Array(d);
    let idx = 0;
    const g = 0.52;
    for (let i = 0; i < n; i++) {
      const b = buf[idx];
      const v = diff[i] + b * g;
      buf[idx] = v;
      out[i] = b - v * g;
      idx = (idx + 1) % d;
    }
    diff = out;
  }

  const res = new Float32Array(n);
  const dry = 1 - wet * 0.35;
  for (let i = 0; i < n; i++) {
    res[i] = input[i] * dry + diff[i] * wet;
  }
  return res;
}

function applyHallReverb(buf, wet = 0.24, decay = 0.72) {
  buf.L = applyHallReverbChannel(buf.L, wet, decay, 0);
  buf.R = applyHallReverbChannel(buf.R, wet, decay, 19);
  return buf;
}

function dcBlock(arr) {
  let x1 = 0, y1 = 0;
  const R = 0.994;
  for (let i = 0; i < arr.length; i++) {
    const x0 = arr[i];
    const y0 = x0 - x1 + R * y1;
    arr[i] = y0;
    x1 = x0; y1 = y0;
  }
}

function masterNormalize(buf, targetPeak = 0.90) {
  dcBlock(buf.L);
  dcBlock(buf.R);
  // Soft limiting before peak normalization so punchy drums never squash dynamics harshly
  for (let i = 0; i < buf.len; i++) {
    buf.L[i] = Math.tanh(buf.L[i] * 1.12);
    buf.R[i] = Math.tanh(buf.R[i] * 1.12);
  }
  let maxAbs = 0;
  for (let i = 0; i < buf.len; i++) {
    const aL = Math.abs(buf.L[i]);
    const aR = Math.abs(buf.R[i]);
    if (aL > maxAbs) maxAbs = aL;
    if (aR > maxAbs) maxAbs = aR;
  }
  const scale = maxAbs > 1e-6 ? targetPeak / maxAbs : 1;
  for (let i = 0; i < buf.len; i++) {
    buf.L[i] *= scale;
    buf.R[i] *= scale;
  }
  return buf;
}

function midiFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

/* ── Musical & SFX Instruments ── */

function addBrassNote(buf, startSec, durSec, freq, amp = 0.22, pan = 0) {
  const n = Math.max(1, Math.round((durSec + 0.09) * SR));
  const mono = new Float32Array(n);
  const maxH = Math.min(12, Math.floor((SR * 0.43) / Math.max(55, freq)));
  let p1 = 0, p2 = 0.37;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.032);
    const punch = 1 + 0.42 * Math.exp(-t / 0.075);
    const rel = t > durSec ? Math.exp(-(t - durSec) / 0.035) : 1;
    const vib = t > 0.12 ? Math.sin(TWO_PI * 5.2 * (t - 0.12)) * 0.0035 * Math.min(1, (t - 0.12) / 0.15) : 0;
    const instF1 = freq * (1 + vib) * 0.9982;
    const instF2 = freq * (1 + vib) * 1.0018;
    p1 += (TWO_PI * instF1) / SR;
    p2 += (TWO_PI * instF2) / SR;
    let s = 0;
    const bright = 0.48 + 0.52 * Math.min(1, t / 0.05) * (0.6 + 0.4 * Math.exp(-t / 0.22));
    for (let h = 1; h <= maxH; h++) {
      const rolloff = Math.pow(h, -0.78) * (h === 1 ? 1.0 : bright);
      s += (Math.sin(p1 * h) + Math.sin(p2 * h) * 0.85) * rolloff * 0.5;
    }
    mono[i] = s * att * punch * rel * amp * 0.42;
  }
  const warm = biquadFilter(mono, 'lowpass', Math.min(4400, freq * 6.5), 0.78);
  addPannedMono(buf, warm, startSec, pan, 1);
}

function addPadNote(buf, startSec, durSec, freq, amp = 0.09, pan = 0) {
  const n = Math.max(1, Math.round((durSec + 0.25) * SR));
  const mono = new Float32Array(n);
  let p1 = 0, p2 = 1.1;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.09);
    const rel = t > durSec ? Math.exp(-(t - durSec) / 0.12) : 1;
    p1 += (TWO_PI * freq * 0.997) / SR;
    p2 += (TWO_PI * freq * 1.003) / SR;
    const v = Math.sin(p1) * 0.55 + Math.sin(p1 * 2) * 0.22 + Math.sin(p2) * 0.55 + Math.sin(p2 * 3) * 0.10;
    mono[i] = v * att * rel * amp * 0.48;
  }
  const soft = biquadFilter(mono, 'lowpass', 2200, 0.707);
  addPannedMono(buf, soft, startSec, pan, 1);
}

function addBassNote(buf, startSec, durSec, freq, amp = 0.28) {
  const n = Math.max(1, Math.round((durSec + 0.06) * SR));
  const mono = new Float32Array(n);
  let p = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.008);
    const rel = t > durSec ? Math.exp(-(t - durSec) / 0.025) : Math.exp(-t / Math.max(0.28, durSec * 1.3));
    const snap = Math.exp(-t / 0.055);
    p += (TWO_PI * freq) / SR;
    const s = Math.sin(p) * 0.85 + Math.sin(p * 2) * (0.35 + 0.28 * snap) + Math.sin(p * 3) * (0.12 + 0.22 * snap);
    mono[i] = s * att * rel * amp;
  }
  const low = biquadFilter(mono, 'lowpass', 1250, 0.85);
  addPannedMono(buf, low, startSec, 0, 1);
}

function addBellChime(buf, startSec, durSec, freq, amp = 0.18, pan = 0) {
  const n = Math.max(1, Math.round((durSec + 0.4) * SR));
  const mono = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.004);
    const envMain = Math.exp(-t / Math.max(0.18, durSec * 0.72));
    const envTint = Math.exp(-t / 0.09);
    const s = Math.sin(TWO_PI * freq * t) * 0.68
      + (freq * 2 < SR * 0.45 ? Math.sin(TWO_PI * freq * 2 * t) * 0.28 * envMain : 0)
      + (freq * 3 < SR * 0.45 ? Math.sin(TWO_PI * freq * 3 * t) * 0.16 * envTint : 0)
      + (freq * 4.04 < SR * 0.45 ? Math.sin(TWO_PI * freq * 4.04 * t) * 0.10 * envTint : 0);
    mono[i] = s * att * envMain * amp;
  }
  addPannedMono(buf, mono, startSec, pan, 1);
}

function addKick(buf, startSec, amp = 0.46) {
  const dur = 0.26;
  const n = Math.round(dur * SR);
  const mono = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 48 + 115 * Math.exp(-t / 0.024);
    phase += (TWO_PI * f) / SR;
    const env = Math.exp(-t / 0.088) * Math.min(1, t / 0.002);
    const click = Math.exp(-t / 0.004) * Math.sin(TWO_PI * 1650 * t) * 0.25;
    mono[i] = (Math.sin(phase) + click) * env * amp;
  }
  addPannedMono(buf, mono, startSec, 0, 1);
}

function addSnare(buf, startSec, amp = 0.28, pan = 0, rng = Math.random) {
  const dur = 0.20;
  const n = Math.round(dur * SR);
  const rawNoise = new Float32Array(n);
  const tone = new Float32Array(n);
  let p = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    rawNoise[i] = (rng() * 2 - 1) * Math.exp(-t / 0.058);
    const f = 148 + 75 * Math.exp(-t / 0.015);
    p += (TWO_PI * f) / SR;
    tone[i] = Math.sin(p) * Math.exp(-t / 0.042) * 0.55;
  }
  const wires = biquadFilter(rawNoise, 'bandpass', 2450, 0.72);
  for (let i = 0; i < n; i++) wires[i] = (wires[i] * 1.45 + tone[i]) * amp;
  addPannedMono(buf, wires, startSec, pan, 1);
}

function addHiHat(buf, startSec, amp = 0.11, open = false, pan = 0.22, rng = Math.random) {
  const dur = open ? 0.24 : 0.055;
  const n = Math.round(dur * SR);
  const noise = new Float32Array(n);
  const tau = open ? 0.095 : 0.018;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const metal = (Math.sin(TWO_PI * 3420 * t) + Math.sin(TWO_PI * 4890 * t) + Math.sin(TWO_PI * 6310 * t)) * 0.22;
    noise[i] = ((rng() * 2 - 1) * 0.75 + metal) * Math.exp(-t / tau);
  }
  const crisp = biquadFilter(noise, 'highpass', 5600, 0.75);
  for (let i = 0; i < n; i++) crisp[i] *= amp;
  addPannedMono(buf, crisp, startSec, pan, 1);
}

function addHandClap(buf, startSec, amp = 0.20, pan = 0, rng = Math.random) {
  const dur = 0.14;
  const n = Math.round(dur * SR);
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const burst = Math.exp(-t / 0.008)
      + (t >= 0.011 ? Math.exp(-(t - 0.011) / 0.009) * 0.85 : 0)
      + (t >= 0.022 ? Math.exp(-(t - 0.022) / 0.036) * 0.75 : 0);
    raw[i] = (rng() * 2 - 1) * burst;
  }
  const bp = biquadFilter(raw, 'bandpass', 1850, 1.05);
  for (let i = 0; i < n; i++) bp[i] *= amp * 1.65;
  addPannedMono(buf, bp, startSec, pan, 1);
}

function addCrash(buf, startSec, durSec = 1.6, amp = 0.18, pan = -0.25, rng = Math.random) {
  const n = Math.round(durSec * SR);
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.012) * Math.exp(-t / (durSec * 0.36));
    const shimmer = (Math.sin(TWO_PI * 3180 * t) + Math.sin(TWO_PI * 4670 * t) + Math.sin(TWO_PI * 6920 * t)) * 0.18;
    raw[i] = ((rng() * 2 - 1) * 0.85 + shimmer) * env;
  }
  const hi = biquadFilter(raw, 'highpass', 3400, 0.7);
  for (let i = 0; i < n; i++) hi[i] *= amp;
  addPannedMono(buf, hi, startSec, pan, 1);
}

function addTimpani(buf, startSec, freq = 82, durSec = 0.75, amp = 0.42, pan = 0, rng = Math.random) {
  const n = Math.round(durSec * SR);
  const mono = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = freq * (1 + 0.42 * Math.exp(-t / 0.045));
    ph += (TWO_PI * f) / SR;
    const env = Math.min(1, t / 0.008) * Math.exp(-t / (durSec * 0.38));
    const head = Math.sin(ph) * 0.78 + Math.sin(ph * 1.50) * 0.28 * Math.exp(-t / 0.22) + Math.sin(ph * 1.98) * 0.14 * Math.exp(-t / 0.14);
    const felt = (rng() * 2 - 1) * Math.exp(-t / 0.012) * 0.22;
    mono[i] = (head + felt) * env * amp;
  }
  const clean = biquadFilter(mono, 'lowpass', 950, 0.75);
  addPannedMono(buf, clean, startSec, pan, 1);
}

function addSwoosh(buf, startSec, durSec = 0.65, fStart = 350, fEnd = 2800, amp = 0.14, pan = 0, rng = Math.random) {
  const n = Math.round(durSec * SR);
  const mono = new Float32Array(n);
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const env = Math.sin(Math.PI * p) * Math.pow(p, 0.55);
    const fc = fStart * Math.pow(fEnd / fStart, p);
    const w0 = (TWO_PI * fc) / SR;
    const x = (rng() * 2 - 1) * env;
    y1 = y1 + w0 * 0.65 * (x - y1);
    y2 = y2 + w0 * 0.65 * (y1 - y2);
    mono[i] = (y1 - y2) * amp * 3.2;
  }
  addPannedMono(buf, mono, startSec, pan, 1);
}

/* ── Realistic Crowd Applause & Cheer Engine ── */

function addApplauseBed(buf, startSec, durSec, opts = {}) {
  const clappers = opts.clappers ?? 70;
  const cheerLevel = opts.cheerLevel ?? 0.2;
  const whistleLevel = opts.whistleLevel ?? 0;
  const masterGain = opts.gain ?? 0.85;
  const rng = createRng(opts.seed ?? 7711);

  const nTotal = Math.round(durSec * SR);
  const dryL = new Float32Array(nTotal);
  const dryR = new Float32Array(nTotal);

  for (let c = 0; c < clappers; c++) {
    const pan = (c / Math.max(1, clappers - 1)) * 1.84 - 0.92 + (rng() - 0.5) * 0.12;
    const ang = (Math.max(-1, Math.min(1, pan)) + 1) * 0.25 * Math.PI;
    const distGain = (0.45 + rng() * 0.72) / Math.sqrt(clappers * 0.45);
    const gL = Math.cos(ang) * distGain;
    const gR = Math.sin(ang) * distGain;

    const palmFreq = 980 + rng() * 1750;
    const clapRate = 3.3 + rng() * 2.1;
    const clapDurS = 0.016 + rng() * 0.014;
    const clapLen = Math.round(clapDurS * SR);
    const clapperStart = 0.02 + rng() * Math.min(0.28, durSec * 0.12);
    const clapperEnd = durSec * (0.68 + rng() * 0.28);

    // Precompute simple 2-pole resonator coefficients for this clapper's hands
    const w0 = (TWO_PI * palmFreq) / SR;
    const q = 2.4 + rng() * 1.4;
    const alpha = Math.sin(w0) / (2 * q);
    const cosW = Math.cos(w0);
    const a0 = 1 + alpha;
    const b0 = alpha / a0, b2 = -alpha / a0, a1 = (-2 * cosW) / a0, a2 = (1 - alpha) / a0;

    let t = clapperStart;
    while (t < clapperEnd) {
      const idx0 = Math.round(t * SR);
      const envAtt = Math.min(1, (t - clapperStart) / 0.22);
      const envDec = t > clapperEnd - 0.35 ? Math.max(0.08, (clapperEnd - t) / 0.35) : 1;
      const amp = (0.65 + rng() * 0.55) * envAtt * envDec;

      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      const micro2 = Math.round((0.002 + rng() * 0.003) * SR);
      for (let k = 0; k < clapLen; k++) {
        const idx = idx0 + k;
        if (idx < 0 || idx >= nTotal) continue;
        const kt = k / clapLen;
        const microEnv = Math.exp(-kt * 4.5) + (k >= micro2 ? 0.52 * Math.exp(-(k - micro2) / (clapLen * 0.35)) : 0);
        const x0 = (rng() * 2 - 1) * microEnv;
        const y0 = b0 * x0 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1; x1 = x0; y2 = y1; y1 = y0;
        // Blend sharp palm resonance with subtle body slap
        const sample = (y0 * 1.9 + x0 * 0.16) * amp;
        dryL[idx] += sample * gL;
        dryR[idx] += sample * gR;
      }

      const jitter = (rng() - 0.5) * 0.036;
      t += Math.max(0.13, (1 / clapRate) + jitter);
    }
  }

  // Crowd Vowel Cheer Bed ("Wooo / Yeaaah!") + Celebratory Crowd Whistles
  if (cheerLevel > 0.01) {
    const excitedL = new Float32Array(nTotal);
    const excitedR = new Float32Array(nTotal);
    let vp1 = 0, vp2 = 0.8;
    for (let i = 0; i < nTotal; i++) {
      const t = i / SR;
      const p = t / durSec;
      const swell = Math.sin(Math.min(1, p / 0.22) * Math.PI * 0.5) * Math.pow(Math.max(0, 1 - Math.max(0, p - 0.45) / 0.55), 0.72);
      vp1 += (TWO_PI * (245 + Math.sin(t * 2.1) * 18)) / SR;
      vp2 += (TWO_PI * (312 - Math.cos(t * 1.7) * 22)) / SR;
      const voiceCoreL = Math.sin(vp1) * 0.28 + Math.sin(vp1 * 2) * 0.22 + (rng() * 2 - 1) * 0.78;
      const voiceCoreR = Math.sin(vp2) * 0.28 + Math.sin(vp2 * 2) * 0.22 + (rng() * 2 - 1) * 0.78;
      excitedL[i] = voiceCoreL * swell;
      excitedR[i] = voiceCoreR * swell;
    }
    const f1L = biquadFilter(excitedL, 'bandpass', 580, 2.2);
    const f2L = biquadFilter(excitedL, 'bandpass', 1240, 2.8);
    const f3L = biquadFilter(excitedL, 'bandpass', 2380, 3.0);
    const f1R = biquadFilter(excitedR, 'bandpass', 610, 2.2);
    const f2R = biquadFilter(excitedR, 'bandpass', 1290, 2.8);
    const f3R = biquadFilter(excitedR, 'bandpass', 2440, 3.0);

    for (let i = 0; i < nTotal; i++) {
      dryL[i] += (f1L[i] * 0.55 + f2L[i] * 0.48 + f3L[i] * 0.30) * cheerLevel * 0.95;
      dryR[i] += (f1R[i] * 0.55 + f2R[i] * 0.48 + f3R[i] * 0.30) * cheerLevel * 0.95;
    }
  }

  if (whistleLevel > 0.01) {
    const wCount = Math.max(2, Math.round(whistleLevel * 18));
    for (let w = 0; w < wCount; w++) {
      const wt0 = 0.25 + rng() * Math.max(0.4, durSec - 1.1);
      const wDur = 0.26 + rng() * 0.22;
      const wfStart = 1850 + rng() * 950;
      const wfPeak = wfStart + 260 + rng() * 340;
      const wn = Math.round(wDur * SR);
      const wMono = new Float32Array(wn);
      let ph = 0;
      for (let k = 0; k < wn; k++) {
        const kp = k / wn;
        const f = kp < 0.45 ? (wfStart + (wfPeak - wfStart) * (kp / 0.45)) : (wfPeak - 180 * ((kp - 0.45) / 0.55));
        ph += (TWO_PI * (f + Math.sin(kp * 22) * 18)) / SR;
        const env = Math.sin(Math.PI * kp);
        wMono[k] = (Math.sin(ph) * 0.8 + Math.sin(ph * 2) * 0.15) * env * whistleLevel * 0.22;
      }
      const wStartIdx = Math.round(wt0 * SR);
      const wPan = (rng() * 1.6 - 0.8);
      const ang = (wPan + 1) * 0.25 * Math.PI;
      for (let k = 0; k < wn; k++) {
        const idx = wStartIdx + k;
        if (idx >= 0 && idx < nTotal) {
          dryL[idx] += wMono[k] * Math.cos(ang);
          dryR[idx] += wMono[k] * Math.sin(ang);
        }
      }
    }
  }

  const startIdx = Math.round(startSec * SR);
  for (let i = 0; i < nTotal; i++) {
    mixSample(buf, startIdx + i, dryL[i] * masterGain, dryR[i] * masterGain);
  }
}

/* ── Track Builders ── */

function buildCelebrationMusic() {
  const bpm = 125;
  const beat = 60 / bpm; // 0.48s
  const bar = beat * 4;  // 1.92s
  const loopBars = 8;
  const loopDur = bar * loopBars; // exact 15.36s
  const tailBars = 2;
  const totalRenderDur = loopDur + bar * tailBars;

  const buf = createStereoBuffer(totalRenderDur);
  const rng = createRng(125125);

  // D Major Uplifting Game-Show Progression (8 bars):
  // | D | A/C# | Bm7 | G | Em7 | A7 | D | A7sus4 |
  const chords = [
    { bass: 38, notes: [62, 66, 69, 74] }, // D
    { bass: 49, notes: [61, 64, 69, 73] }, // A/C#
    { bass: 47, notes: [62, 66, 69, 71] }, // Bm7
    { bass: 43, notes: [62, 67, 71, 74] }, // G
    { bass: 40, notes: [62, 64, 67, 71] }, // Em7
    { bass: 45, notes: [61, 64, 67, 69] }, // A7
    { bass: 38, notes: [62, 66, 69, 74] }, // D
    { bass: 45, notes: [62, 64, 67, 69] }  // A7sus4
  ];

  // Game-show brass fanfare/groove melody (events in beat offsets within 2-bar phrases)
  const melody = [
    // Phrase 1 (Bars 1-2: D -> A/C#)
    [0.0, 74, 0.35], [0.5, 74, 0.35], [1.0, 78, 0.45], [1.5, 81, 0.70],
    [2.5, 78, 0.40], [3.0, 76, 0.70],
    [4.0, 73, 0.45], [4.5, 76, 0.45], [5.0, 81, 0.85], [6.0, 79, 0.45], [6.5, 78, 0.45], [7.0, 76, 0.75],
    // Phrase 2 (Bars 3-4: Bm7 -> G)
    [8.0, 74, 0.35], [8.5, 78, 0.35], [9.0, 83, 0.75], [10.0, 81, 0.40], [10.5, 78, 0.70],
    [12.0, 79, 0.45], [12.5, 81, 0.45], [13.0, 83, 0.65], [14.0, 81, 0.45], [14.5, 78, 0.45], [15.0, 74, 0.65],
    // Phrase 3 (Bars 5-6: Em7 -> A7)
    [16.0, 76, 0.40], [16.5, 79, 0.40], [17.0, 83, 0.80], [18.0, 81, 0.40], [18.5, 79, 0.40], [19.0, 76, 0.65],
    [20.0, 76, 0.45], [20.5, 79, 0.45], [21.0, 81, 0.75], [22.0, 85, 0.85], [23.0, 81, 0.75],
    // Phrase 4 (Bars 7-8: D -> A7sus4 Big Climax & Turnaround)
    [24.0, 86, 0.45], [24.5, 86, 0.45], [25.0, 85, 0.45], [25.5, 81, 0.70], [26.5, 78, 0.45], [27.0, 81, 0.75],
    [28.0, 79, 0.45], [28.5, 78, 0.45], [29.0, 76, 0.45], [29.5, 74, 0.45], [30.0, 76, 0.85], [31.0, 81, 0.70]
  ];

  for (let b = 0; b < loopBars; b++) {
    const c = chords[b];
    const bt0 = b * bar;
    // Warm lush chord pad & brass stabs
    c.notes.forEach((m, ni) => {
      const pan = (ni - 1.5) * 0.28;
      addPadNote(buf, bt0, bar * 0.94, midiFreq(m), 0.075, pan);
      // Syncopated game-show stab accents on beats 1 and 2-and
      addBrassNote(buf, bt0, beat * 0.36, midiFreq(m), 0.085, pan * 1.1);
      addBrassNote(buf, bt0 + beat * 1.5, beat * 0.32, midiFreq(m), 0.075, -pan * 1.1);
    });

    // Bouncy Pop-Funk Bass Line (root-octave & 5th walk)
    const bassF = midiFreq(c.bass);
    const fifthF = bassF * 1.498;
    const octF = bassF * 2;
    addBassNote(buf, bt0 + beat * 0.0, beat * 0.44, bassF, 0.28);
    addBassNote(buf, bt0 + beat * 0.75, beat * 0.24, bassF, 0.22);
    addBassNote(buf, bt0 + beat * 1.0, beat * 0.42, octF, 0.25);
    addBassNote(buf, bt0 + beat * 1.5, beat * 0.42, fifthF, 0.24);
    addBassNote(buf, bt0 + beat * 2.0, beat * 0.44, bassF, 0.27);
    addBassNote(buf, bt0 + beat * 2.75, beat * 0.24, fifthF, 0.21);
    addBassNote(buf, bt0 + beat * 3.0, beat * 0.40, octF, 0.24);
    addBassNote(buf, bt0 + beat * 3.5, beat * 0.40, fifthF, 0.22);

    // Sparkling quiz-show glockenspiel arpeggio every half-beat
    for (let s = 0; s < 8; s++) {
      const m = c.notes[(s + b) % c.notes.length] + 12;
      const pan = ((s % 2 === 0) ? -0.45 : 0.45);
      addBellChime(buf, bt0 + s * (beat * 0.5), 0.34, midiFreq(m), 0.072, pan);
    }

    // Energetic 125 BPM Drum + Studio Clap Groove
    for (let k = 0; k < 4; k++) {
      const kSec = bt0 + k * beat;
      addKick(buf, kSec, k % 2 === 0 ? 0.48 : 0.42);
      if (k === 1 || k === 3) {
        addSnare(buf, kSec, 0.25, -0.08, rng);
        addHandClap(buf, kSec, 0.16, 0.28, rng);
      }
      addHiHat(buf, kSec, 0.09, false, 0.24, rng);
      addHiHat(buf, kSec + beat * 0.5, 0.12, k === 3 && (b % 2 === 1), 0.24, rng);
    }
    if (b === 0 || b === 4) {
      addCrash(buf, bt0, 1.45, 0.16, b === 0 ? -0.25 : 0.25, rng);
    }
    // Snare & timpani fill at end of Bar 4 & Bar 8
    if (b === 3 || b === 7) {
      addSnare(buf, bt0 + beat * 3.25, 0.22, -0.1, rng);
      addSnare(buf, bt0 + beat * 3.50, 0.25, 0.1, rng);
      addSnare(buf, bt0 + beat * 3.75, 0.29, 0.0, rng);
      addTimpani(buf, bt0 + beat * 3.5, 98, 0.42, 0.28, -0.2, rng);
    }
  }

  // Lead TV Game-Show Brass & Chime Double Melody
  for (const [bOff, midiN, bLen] of melody) {
    const s = bOff * beat;
    const dur = bLen * beat;
    const f = midiFreq(midiN);
    addBrassNote(buf, s, dur, f, 0.26, -0.12);
    addBrassNote(buf, s, dur, f * 0.749, 0.14, 0.16); // harmony fourth/octave thickness
    addBellChime(buf, s, dur + 0.18, f, 0.11, 0.22);
  }

  applyHallReverb(buf, 0.24, 0.72);

  // Seamless loop wrap: fold tail beyond loopDur onto start of loop
  const loopLen = Math.round(loopDur * SR);
  const tailLen = buf.len - loopLen;
  const wrapped = createStereoBuffer(loopDur);
  for (let i = 0; i < loopLen; i++) {
    wrapped.L[i] = buf.L[i];
    wrapped.R[i] = buf.R[i];
  }
  for (let i = 0; i < tailLen; i++) {
    const tgt = i % loopLen;
    wrapped.L[tgt] += buf.L[loopLen + i];
    wrapped.R[tgt] += buf.R[loopLen + i];
  }
  return masterNormalize(wrapped, 0.90);
}

function buildRank3Reveal() {
  const buf = createStereoBuffer(1.55);
  const rng = createRng(3030);
  addSwoosh(buf, 0.02, 0.48, 320, 2200, 0.12, -0.2, rng);
  addTimpani(buf, 0.14, 110, 0.55, 0.30, -0.15, rng);
  // Warm bronze ascending triad: A4 -> C#5 -> E5 -> A5
  addBellChime(buf, 0.14, 0.55, midiFreq(69), 0.24, -0.35);
  addBellChime(buf, 0.28, 0.55, midiFreq(73), 0.25, 0.0);
  addBellChime(buf, 0.42, 0.78, midiFreq(76), 0.28, 0.35);
  addBrassNote(buf, 0.14, 0.32, midiFreq(57), 0.22, -0.2);
  addBrassNote(buf, 0.42, 0.65, midiFreq(64), 0.28, 0.15);
  addBrassNote(buf, 0.42, 0.65, midiFreq(69), 0.24, -0.15);
  applyHallReverb(buf, 0.26, 0.68);
  return masterNormalize(buf, 0.89);
}

function buildRank2Reveal() {
  const buf = createStereoBuffer(1.75);
  const rng = createRng(2020);
  addSwoosh(buf, 0.02, 0.55, 420, 3200, 0.14, 0.2, rng);
  addTimpani(buf, 0.12, 123.47, 0.58, 0.34, 0.15, rng);
  // Bright silver ascending 4-note arpeggio: B4 -> D#5 -> F#5 -> B5
  [71, 75, 78, 83].forEach((m, i) => {
    addBellChime(buf, 0.12 + i * 0.12, 0.65, midiFreq(m), 0.24 + i * 0.02, -0.4 + i * 0.26);
  });
  addBrassNote(buf, 0.12, 0.24, midiFreq(59), 0.22, 0.2);
  addBrassNote(buf, 0.48, 0.78, midiFreq(66), 0.28, -0.18);
  addBrassNote(buf, 0.48, 0.78, midiFreq(71), 0.30, 0.18);
  addCrash(buf, 0.48, 1.0, 0.12, 0.25, rng);
  applyHallReverb(buf, 0.28, 0.72);
  return masterNormalize(buf, 0.90);
}

function buildApplauseWarm() {
  const buf = createStereoBuffer(2.85);
  addApplauseBed(buf, 0.0, 2.75, { clappers: 58, cheerLevel: 0.10, whistleLevel: 0.0, gain: 0.92, seed: 311 });
  applyHallReverb(buf, 0.28, 0.65);
  return masterNormalize(buf, 0.88);
}

function buildApplauseStrong() {
  const buf = createStereoBuffer(3.55);
  addApplauseBed(buf, 0.0, 3.45, { clappers: 86, cheerLevel: 0.28, whistleLevel: 0.05, gain: 0.95, seed: 222 });
  applyHallReverb(buf, 0.30, 0.72);
  return masterNormalize(buf, 0.90);
}

function buildApplauseGrand() {
  const buf = createStereoBuffer(4.65);
  addApplauseBed(buf, 0.0, 4.55, { clappers: 118, cheerLevel: 0.52, whistleLevel: 0.16, gain: 1.0, seed: 111 });
  applyHallReverb(buf, 0.32, 0.78);
  return masterNormalize(buf, 0.91);
}

function buildDrumroll4s() {
  const dur = 4.15;
  const buf = createStereoBuffer(dur);
  const rng = createRng(40004);

  // Continuous 4.0-second orchestral alternating snare roll building in exponential intensity
  let t = 0.02;
  let hand = -1;
  while (t < 3.98) {
    const p = Math.min(1, t / 3.96);
    const intensity = 0.10 + 0.90 * Math.pow(p, 1.65);
    const step = 0.052 - 0.020 * p; // accelerates subtly from ~19 Hz to ~31 Hz
    addSnare(buf, t, 0.26 * intensity, hand * 0.18, rng);
    hand *= -1;
    t += step + (rng() - 0.5) * 0.005;
  }

  // Heartbeat dramatic timpani hits getting closer together in the final second
  [
    [0.02, 73.42, 0.22], [0.55, 73.42, 0.25], [1.10, 77.78, 0.28], [1.65, 77.78, 0.31],
    [2.20, 82.41, 0.34], [2.72, 87.31, 0.38], [3.16, 92.50, 0.42], [3.52, 98.00, 0.46],
    [3.78, 103.83, 0.50], [3.96, 110.00, 0.56]
  ].forEach(([ts, f, amp], idx) => {
    addTimpani(buf, ts, f, 0.52, amp, (idx % 2 === 0 ? -0.14 : 0.14), rng);
  });

  // Rising suspense brass/string chord swell on A7sus4 -> peak right at 3.98s
  addPadNote(buf, 0.25, 3.68, midiFreq(57), 0.10, -0.35);
  addPadNote(buf, 0.85, 3.08, midiFreq(64), 0.12, 0.35);
  addPadNote(buf, 1.65, 2.28, midiFreq(67), 0.14, -0.2);
  addBrassNote(buf, 2.55, 1.40, midiFreq(69), 0.18, 0.22);
  addSwoosh(buf, 2.75, 1.24, 340, 3600, 0.18, 0, rng);

  applyHallReverb(buf, 0.28, 0.76);
  return masterNormalize(buf, 0.90);
}

function buildSpotlightLock() {
  const buf = createStereoBuffer(1.65);
  const rng = createRng(9911);
  // Crisp electrical theater switch thump + D Major impact chord + bright chime flash
  addKick(buf, 0.0, 0.65);
  addTimpani(buf, 0.0, 73.42, 0.85, 0.55, 0, rng);
  addSnare(buf, 0.005, 0.32, 0, rng);
  addCrash(buf, 0.01, 1.4, 0.24, -0.2, rng);
  [62, 69, 74, 78, 86].forEach((m, i) => {
    addBrassNote(buf, 0.01, 0.82, midiFreq(m), 0.26, -0.35 + i * 0.17);
    addBellChime(buf, 0.01 + i * 0.025, 0.95, midiFreq(m), 0.18, 0.35 - i * 0.17);
  });
  applyHallReverb(buf, 0.30, 0.78);
  return masterNormalize(buf, 0.91);
}

function buildVictoryFanfare() {
  const buf = createStereoBuffer(3.45);
  const rng = createRng(10001);
  // Classic TV Champion Fanfare in D Major: D5 - A4 - D5 - F#5 -> HOLD A5 + sparkle gliss!
  const hits = [
    { t: 0.00, d: 0.20, m: 74, harm: 69 },
    { t: 0.22, d: 0.20, m: 69, harm: 66 },
    { t: 0.44, d: 0.22, m: 74, harm: 69 },
    { t: 0.68, d: 0.24, m: 78, harm: 74 },
    { t: 0.96, d: 1.65, m: 81, harm: 74 }
  ];
  hits.forEach((h, i) => {
    const isFinal = i === hits.length - 1;
    addBrassNote(buf, h.t, h.d, midiFreq(h.m), isFinal ? 0.36 : 0.30, -0.14);
    addBrassNote(buf, h.t, h.d, midiFreq(h.harm), isFinal ? 0.28 : 0.22, 0.18);
    addBrassNote(buf, h.t, h.d, midiFreq(h.m - 12), 0.22, 0.05);
    addBellChime(buf, h.t, h.d + 0.45, midiFreq(h.m), 0.18, 0.28);
    addTimpani(buf, h.t, isFinal ? 73.42 : 110, isFinal ? 1.1 : 0.45, isFinal ? 0.50 : 0.34, 0, rng);
    if (isFinal) {
      addBrassNote(buf, h.t, h.d, midiFreq(78), 0.24, -0.32); // F#5 major 3rd ring
      addBassNote(buf, h.t, h.d, midiFreq(38), 0.34);
      addCrash(buf, h.t, 2.1, 0.24, -0.25, rng);
      addCrash(buf, h.t + 0.04, 1.9, 0.18, 0.28, rng);
    }
  });
  // Upward celebration bell glissando over final sustained chord
  [74, 76, 78, 81, 83, 86, 88, 90, 93].forEach((m, idx) => {
    addBellChime(buf, 1.18 + idx * 0.075, 0.95, midiFreq(m), 0.16, -0.6 + idx * 0.15);
  });
  applyHallReverb(buf, 0.32, 0.80);
  return masterNormalize(buf, 0.91);
}

/* ── WAV Encoder & Diagnostics ── */

function writeWavFile(relPath, buf) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const numChannels = 2;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = SR * blockAlign;
  const dataBytes = buf.len * blockAlign;
  const out = Buffer.allocUnsafe(44 + dataBytes);

  out.write('RIFF', 0, 4, 'ascii');
  out.writeUInt32LE(36 + dataBytes, 4);
  out.write('WAVE', 8, 4, 'ascii');
  out.write('fmt ', 12, 4, 'ascii');
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); // PCM
  out.writeUInt16LE(numChannels, 22);
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(byteRate, 28);
  out.writeUInt16LE(blockAlign, 32);
  out.writeUInt16LE(bitsPerSample, 34);
  out.write('data', 36, 4, 'ascii');
  out.writeUInt32LE(dataBytes, 40);

  let sumSq = 0, peak = 0;
  let off = 44;
  for (let i = 0; i < buf.len; i++) {
    const fL = Math.max(-1, Math.min(1, buf.L[i]));
    const fR = Math.max(-1, Math.min(1, buf.R[i]));
    sumSq += (fL * fL + fR * fR) * 0.5;
    peak = Math.max(peak, Math.abs(fL), Math.abs(fR));
    out.writeInt16LE(Math.round(fL * 32767), off);
    out.writeInt16LE(Math.round(fR * 32767), off + 2);
    off += 4;
  }

  fs.writeFileSync(fullPath, out);
  const rms = Math.sqrt(sumSq / buf.len);
  return {
    relPath,
    bytes: out.length,
    durSec: Number((buf.len / SR).toFixed(2)),
    rms: Number(rms.toFixed(4)),
    peak: Number(peak.toFixed(4))
  };
}

function main() {
  const specs = [
    ['assets/audio/music/celebration.wav', buildCelebrationMusic],
    ['assets/audio/sfx/rank3-reveal.wav', buildRank3Reveal],
    ['assets/audio/sfx/rank2-reveal.wav', buildRank2Reveal],
    ['assets/audio/sfx/applause-warm.wav', buildApplauseWarm],
    ['assets/audio/sfx/applause-strong.wav', buildApplauseStrong],
    ['assets/audio/sfx/drumroll-4s.wav', buildDrumroll4s],
    ['assets/audio/sfx/spotlight-lock.wav', buildSpotlightLock],
    ['assets/audio/sfx/victory-fanfare.wav', buildVictoryFanfare],
    ['assets/audio/sfx/applause-grand.wav', buildApplauseGrand]
  ];

  console.log('Generating ScoreAR TV Game-Show Ceremony Audio Assets...');
  for (const [relPath, builder] of specs) {
    const info = writeWavFile(relPath, builder());
    console.log(`  [OK] ${info.relPath} | ${info.durSec}s | ${(info.bytes / 1024).toFixed(1)} KB | rms=${info.rms} | peak=${info.peak}`);
    if (info.rms < 0.02 || info.peak > 0.99 || info.bytes > 2000000) {
      throw new Error(`Audio quality check failed for ${info.relPath}: ${JSON.stringify(info)}`);
    }
  }
  console.log('All 9 ceremony audio assets generated cleanly.');
}

main();
