/**
 * Unit & Integration Test Suite for ScoreAR World Flow (world-flow.js)
 * Phase A: Worlds Experience & Controlled Room Launcher
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// 1. Line count check (< 500 lines)
const flowLines = fs.readFileSync(path.join(ROOT, 'world-flow.js'), 'utf8').split('\n').length;
assert(flowLines < 500, `world-flow.js exceeds 500 lines (${flowLines})`);
console.log(`[PASS] Rule 7 Line Count: world-flow.js (${flowLines} lines < 500)`);

// 2. Setup mock environment
let modalDialog = null;
let lastLaunchedLobby = null;

class MockDialog {
  constructor() {
    this.id = 'scorearWorldFlowModal';
    this.open = false;
    this.innerHTML = '';
    this.style = {};
  }
  showModal() { this.open = true; }
  close() { this.open = false; }
  addEventListener() {}
}

const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};
global.sessionStorage = global.localStorage;

global.document = {
  createElement: (tag) => {
    if (tag === 'dialog') {
      modalDialog = new MockDialog();
      return modalDialog;
    }
    return {};
  },
  getElementById: (id) => {
    if (id === 'scorearWorldFlowModal') return modalDialog;
    return null;
  },
  body: {
    appendChild: (el) => { modalDialog = el; return el; }
  },
  addEventListener: () => {}
};

global.window = {
  location: { hash: '#worlds' },
  renderLiveLobby: (worldId, pin) => {
    lastLaunchedLobby = { worldId, pin };
  }
};

// Evaluate world-flow.js
eval(fs.readFileSync(path.join(ROOT, 'world-flow.js'), 'utf8'));
const WorldFlow = global.window.ScoreARWorldFlow || global.ScoreARWorldFlow;

console.log('====================================================');
console.log('   SCOREAR WORLD FLOW UNIT TESTS');
console.log('====================================================\n');

let passed = 0;
let total = 0;
function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

// TEST 1: Worlds Data
test('1. WORLDS_DATA defines exactly 6 canonical worlds with metadata', () => {
  assert.strictEqual(Array.isArray(WorldFlow.WORLDS_DATA), true);
  assert.strictEqual(WorldFlow.WORLDS_DATA.length, 6);
  const ids = WorldFlow.WORLDS_DATA.map(w => w.id);
  assert.deepStrictEqual(ids, ['royal', 'oasis', 'cosmic', 'treasure', 'stadium', 'magic']);
  WorldFlow.WORLDS_DATA.forEach(w => {
    assert.ok(w.name && w.name.length > 0);
    assert.ok(w.tag && w.tag.length > 0);
    assert.ok(w.desc && w.desc.length > 0);
    assert.ok(w.image && w.image.length > 0);
  });
});

// TEST 2: getCurrentRole() guest
test('2. getCurrentRole() defaults to guest when unauthenticated', () => {
  mockStorage.clear();
  delete global.ScoreARAuth;
  assert.strictEqual(WorldFlow.getCurrentRole(), 'guest');
});

// TEST 3: getCurrentRole() teacher session
test('3. getCurrentRole() detects teacher from session storage', () => {
  global.localStorage.setItem('scorear_teacher_session', JSON.stringify({ role: 'teacher', email: 'teacher@scorear.app' }));
  assert.strictEqual(WorldFlow.getCurrentRole(), 'teacher');
  global.localStorage.clear();
});

// TEST 4: Guest flow opens showcase modal with CTA button and does NOT launch lobby
test('4. Guest clicking world opens showcase modal with «ادخل لتبدأ كمعلم» and does NOT launch room', () => {
  mockStorage.clear();
  lastLaunchedLobby = null;

  WorldFlow.openWorld('royal');

  assert.ok(modalDialog, 'Dialog should be created');
  assert.strictEqual(modalDialog.open, true, 'Dialog should be opened');
  assert.strictEqual(lastLaunchedLobby, null, 'Guest should NOT trigger live lobby launcher');
  assert.ok(modalDialog.innerHTML.includes('القصر الملكي الأندلسي'), 'Modal should show world name');
  assert.ok(modalDialog.innerHTML.includes('ادخل لتبدأ كمعلم'), 'Modal must have teacher CTA button');
  assert.ok(modalDialog.innerHTML.includes('معاينة الفيديو'), 'Modal must have video preview button');
});

// TEST 5: Teacher wizard 3-step navigation
test('5. Teacher flow opens 3-step wizard with persistent state and back/next navigation', () => {
  global.localStorage.setItem('scorear_teacher_session', JSON.stringify({ role: 'teacher' }));
  lastLaunchedLobby = null;

  WorldFlow.openWorld('cosmic');

  assert.strictEqual(modalDialog.open, true);
  assert.strictEqual(lastLaunchedLobby, null);
  let state = WorldFlow.getWizardState();
  assert.strictEqual(state.step, 1);
  assert.strictEqual(state.worldId, 'cosmic');
  assert.ok(modalDialog.innerHTML.includes('معالج تجهيز القاعة التفاعلية'));

  // Step 1 -> Next -> Step 2
  WorldFlow.nextStep();
  state = WorldFlow.getWizardState();
  assert.strictEqual(state.step, 2);
  assert.ok(modalDialog.innerHTML.includes('اختر المسابقة أو المحتوى'));

  // Step 2: Choose quiz
  WorldFlow.setWizardQuiz('rhetoric_intro', 'مسار التشبيه والاستعارة', 4);
  state = WorldFlow.getWizardState();
  assert.strictEqual(state.quizId, 'rhetoric_intro');

  // Step 2 -> Next -> Step 3
  WorldFlow.nextStep();
  state = WorldFlow.getWizardState();
  assert.strictEqual(state.step, 3);
  assert.ok(modalDialog.innerHTML.includes('جاهز للانطلاق'));
  assert.ok(modalDialog.innerHTML.includes('قريبًا في التحديث القادم'), 'Cosmetic mode must show «قريبًا» badge');

  // Step 3 -> Back -> Step 2
  WorldFlow.prevStep();
  state = WorldFlow.getWizardState();
  assert.strictEqual(state.step, 2);

  // Back to Step 3 and Launch
  WorldFlow.nextStep();
  WorldFlow.launchRoomNow();
  assert.strictEqual(modalDialog.open, false, 'Modal should close after launch');
  assert.ok(lastLaunchedLobby !== null, 'Room should be launched for teacher');
  assert.strictEqual(lastLaunchedLobby.worldId, 'cosmic');

  mockStorage.clear();
});

console.log(`\n====================================================`);
console.log(`Tests: ${passed} / ${total} passed`);
console.log(`====================================================`);
if (passed !== total) process.exit(1);
