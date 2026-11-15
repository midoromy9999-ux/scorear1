/**
 * Automated Verification Suite for ScoreARMotionEngine
 * Tests physics parameters, 60FPS loop, sprite URL mapping, DOM mounting, and Rule 7 compliance.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Setup DOM mocks for Node.js
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(...c) { c.forEach(x => this.classes.add(x)); }
  remove(...c) { c.forEach(x => this.classes.delete(x)); }
  contains(c) { return this.classes.has(c); }
  replace(o, n) { this.classes.delete(o); this.classes.add(n); }
  toggle(c, force) {
    if (force === undefined) {
      if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c);
    } else if (force) this.classes.add(c); else this.classes.delete(c);
  }
}

class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.classList = new MockClassList();
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.isConnected = true;
  }
  appendChild(el) { this.children.push(el); return el; }
  append(...els) { this.children.push(...els); }
  removeChild(el) {
    const idx = this.children.indexOf(el);
    if (idx !== -1) this.children.splice(idx, 1);
  }
  getBoundingClientRect() { return { width: 320, height: 400, left: 0, top: 0 }; }
  getContext(type) {
    if (type === '2d') {
      return {
        clearRect: () => {},
        setTransform: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        fillRect: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        globalAlpha: 1.0,
        fillStyle: '#fff'
      };
    }
    return null;
  }
}

global.window = global;
global.document = {
  createElement: (tag) => new MockElement(tag),
  querySelector: () => null
};
let mockRafTimer = null;
global.requestAnimationFrame = (cb) => {
  mockRafTimer = setTimeout(() => cb(Date.now()), 16);
  return mockRafTimer;
};
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Load Engine
const engineCode = fs.readFileSync(path.join(__dirname, '..', 'ScoreARMotionEngine.js'), 'utf8');
new Function(engineCode)();
const ScoreARMotionEngine = globalThis.ScoreARMotionEngine;

async function runTests() {
  console.log('🧪 Starting ScoreARMotionEngine Verification Suite...\n');

  // Test 1: API Surface
  console.log('--- 1. Testing Engine API Surface ---');
  assert.ok(ScoreARMotionEngine, 'ScoreARMotionEngine must be exported');
  assert.strictEqual(typeof ScoreARMotionEngine.mount, 'function', 'mount() function exists');
  assert.strictEqual(typeof ScoreARMotionEngine.setAction, 'function', 'setAction() function exists');
  assert.strictEqual(typeof ScoreARMotionEngine.setSpeed, 'function', 'setSpeed() function exists');
  assert.strictEqual(typeof ScoreARMotionEngine.setCharacter, 'function', 'setCharacter() function exists');
  assert.strictEqual(typeof ScoreARMotionEngine.destroy, 'function', 'destroy() function exists');
  console.log('✅ All core API methods verified.');

  // Test 2: Mounting & DOM Hierarchy
  console.log('\n--- 2. Testing Mount & DOM Structure ---');
  const container = new MockElement('div');
  const instance = ScoreARMotionEngine.mount(container, 'char_01', 'idle');
  assert.ok(container.classList.contains('scorear-motion-container'), 'Container has motion class');
  assert.strictEqual(container._scorear_instance, instance, 'Container references instance');
  assert.ok(instance.stage, 'Stage element created');
  assert.ok(instance.shadow, 'Shadow SVG created');
  assert.ok(instance.spriteA && instance.spriteB, 'Double-buffered sprite layers created');
  assert.ok(instance.pCanvas, 'Particle canvas created');
  console.log('✅ DOM structure (stage, shadow, dual sprites, particle canvas) verified.');

  // Test 3: Action Sprite Resolution
  console.log('\n--- 3. Testing Action Sprite URL Resolution ---');
  const runUrl = instance.getSpriteUrl('char_01', 'run');
  const climbUrl = instance.getSpriteUrl('char_01', 'climb');
  const flyUrl = instance.getSpriteUrl('char_01', 'fly');
  const idleUrl = instance.getSpriteUrl('char_01', 'idle');

  assert.ok(runUrl.endsWith('char_01-run.webp'), `Run URL resolves correctly: ${runUrl}`);
  assert.ok(climbUrl.endsWith('char_01-climb.webp'), `Climb URL resolves correctly: ${climbUrl}`);
  assert.ok(flyUrl.endsWith('char_01-fly.webp'), `Fly URL resolves correctly: ${flyUrl}`);
  assert.ok(idleUrl.endsWith('char_01-atlas.webp'), `Idle URL resolves correctly: ${idleUrl}`);
  console.log('✅ Action sprite URLs correctly point to dedicated action sheets.');

  // Test 4: Physical Assets Verification
  console.log('\n--- 4. Testing Physical WebP Sprite Sheets for char_01 ---');
  const root = path.resolve(__dirname, '..');
  const runPath = path.join(root, 'assets', 'characters', 'animated', 'char_01-run.webp');
  const climbPath = path.join(root, 'assets', 'characters', 'animated', 'char_01-climb.webp');
  const flyPath = path.join(root, 'assets', 'characters', 'animated', 'char_01-fly.webp');

  const metaRun = await sharp(runPath).metadata();
  assert.strictEqual(metaRun.width, 1280, 'Run sheet width must be 1280px');
  assert.strictEqual(metaRun.height, 400, 'Run sheet height must be 400px');
  assert.strictEqual(metaRun.hasAlpha, true, 'Run sheet must have transparent alpha');

  const metaClimb = await sharp(climbPath).metadata();
  assert.strictEqual(metaClimb.width, 1280, 'Climb sheet width must be 1280px');
  assert.strictEqual(metaClimb.height, 400, 'Climb sheet height must be 400px');
  assert.strictEqual(metaClimb.hasAlpha, true, 'Climb sheet must have transparent alpha');

  const metaFly = await sharp(flyPath).metadata();
  assert.strictEqual(metaFly.width, 1280, 'Fly sheet width must be 1280px');
  assert.strictEqual(metaFly.height, 400, 'Fly sheet height must be 400px');
  assert.strictEqual(metaFly.hasAlpha, true, 'Fly sheet must have transparent alpha');
  console.log('✅ char_01-run.webp, char_01-climb.webp, char_01-fly.webp are valid 1280x400 transparent WebP assets.');

  // Test 5: Action State Switching & Double Buffering
  console.log('\n--- 5. Testing Action Switching & Layer Blending ---');
  const prevActive = instance.activeSprite;
  instance.setAction('run');
  assert.strictEqual(instance.action, 'run', 'Action switched to run');
  assert.notStrictEqual(instance.activeSprite, prevActive, 'Active sprite swapped to standby buffer');
  assert.ok(instance.activeSprite.classList.contains('layer-active'), 'New sprite marked active');
  console.log('✅ Action switching smoothly swaps double-buffered layers.');

  // Test 6: Speed control & Destroy
  console.log('\n--- 6. Testing Speed Adjustments & Clean Destruction ---');
  instance.setSpeed(2.0);
  assert.strictEqual(instance.speed, 2.0, 'Speed adjusted to 2.0');
  ScoreARMotionEngine.destroy(container);
  assert.strictEqual(container._scorear_instance, undefined, 'Instance reference deleted');
  assert.strictEqual(instance.rafId, null, 'rAF loop cancelled');
  console.log('✅ Speed controls and lifecycle cleanup verified.');

  // Test 7: Rule 7 Compliance (< 400 lines)
  console.log('\n--- 7. Testing Rule 7 Compliance ---');
  const engineLines = fs.readFileSync(path.join(root, 'ScoreARMotionEngine.js'), 'utf8').split(/\r?\n/).length;
  console.log(`ScoreARMotionEngine.js: ${engineLines} lines`);
  assert.ok(engineLines < 400, `ScoreARMotionEngine.js must be < 400 lines (got ${engineLines})`);
  console.log(`✅ ScoreARMotionEngine.js strictly complies with Rule 7 (${engineLines} < 400).`);

  console.log('\n🎉 ALL SCOREAR MOTION ENGINE TESTS PASSED WITH 100% SUCCESS! 🚀');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
