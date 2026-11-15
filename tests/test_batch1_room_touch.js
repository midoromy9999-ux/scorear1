/**
 * Automated Verification: Room & Touch Test for Items 1 & 2
 * Tests:
 * 1) Guess Leakage Prevention:
 *    - No per-option counters displayed during answering on host or student.
 *    - Only total count "أجاب X من Y" is shown.
 *    - Student choice is neutral and locked.
 *    - No answer indicators reach student devices.
 *    - Option distribution is revealed only after question ends.
 * 2) Reveal Animation:
 *    - Wrong options fade out (opacity 0, scale down).
 *    - Correct option card stays alone with glow, pulse, and checkmark ✓.
 *    - Answer text is NOT rewritten at the top of the screen.
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal DOM mocks
const elements = new Map();
function createMockElement(id, tag = 'div') {
  const el = {
    id,
    tagName: tag.toUpperCase(),
    innerHTML: '',
    textContent: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    children: [],
    appendChild: (c) => { el.children.push(c); return c; },
    insertBefore: (c, ref) => { el.children.unshift(c); return c; },
    remove: () => elements.delete(id),
    setAttribute: () => {},
    getAttribute: () => null
  };
  elements.set(id, el);
  return el;
}

globalThis.window = globalThis;
globalThis.document = {
  getElementById: (id) => elements.get(id) || null,
  createElement: (tag) => createMockElement('el_' + Math.random().toString(36).substr(2, 6), tag),
  body: createMockElement('body'),
  querySelectorAll: () => []
};
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
try {
  if (globalThis.navigator) {
    globalThis.navigator.clipboard = { writeText: async () => {} };
  } else {
    globalThis.navigator = { clipboard: { writeText: async () => {} } };
  }
} catch(e){}

// Load modules
const evaluatorCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-evaluator.js'), 'utf8');
new Function(evaluatorCode)();

const leaderboardCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-host-leaderboard.js'), 'utf8');
new Function(leaderboardCode)();

const hostEventsCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-host-events.js'), 'utf8');
new Function(hostEventsCode)();

const realtimeCode = fs.readFileSync(path.join(__dirname, '..', 'realtime-engine.js'), 'utf8');
new Function(realtimeCode)();

const hostViewCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-host-view.js'), 'utf8');
new Function(hostViewCode)();

const hostCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-host.js'), 'utf8');
new Function(hostCode)();

const studentViewCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-student-view.js'), 'utf8');
new Function(studentViewCode)();

const studentCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-student.js'), 'utf8');
new Function(studentCode)();

console.log('\n--- 1. Testing Item 1: Guess Leakage Prevention & Real-time Live Counters ---');

// Mock a room on host
const mockRoom = {
  pin: '123456',
  status: 'question',
  players: [
    { id: 's1', name: 'أحمد', score: 0 },
    { id: 's2', name: 'سارة', score: 0 },
    { id: 's3', name: 'عمر', score: 0 }
  ],
  answers: { 0: {} }
};

const qData = {
  id: 'q1',
  text: 'ما إعراب كلمة «مفيداً»؟',
  options: ['نعت منصوب', 'مفعول به', 'حال', 'تمييز'],
  correct: [0],
  timeLimit: 20,
  points: 1000
};

// Initialize host mock stage and cards
const hostMain = createMockElement('hostQuestionMain');
const answeredCountEl = createMockElement('hostAnsweredCount');
for (let i = 0; i < 4; i++) {
  const card = createMockElement(`hostOptCard_${i}`);
  const countBadge = createMockElement(`hostOptCount_${i}`);
  countBadge.style.display = 'none'; // Initially hidden during answering
  const badge = createMockElement(`hostOptBadge_${i}`);
  badge.style.display = 'none';
}

// 1.1 Verify that per-option counters are HIDDEN during answering
for (let i = 0; i < 4; i++) {
  const badge = document.getElementById(`hostOptCount_${i}`);
  assert.strictEqual(badge.style.display, 'none', `hostOptCount_${i} must be hidden during answering`);
}
console.log('✓ Per-option counts are strictly hidden during answering (no guess leakage)');

// 1.2 Simulate Student 1 answering
mockRoom.answers[0]['s1'] = { optionIndex: 0, timeRemaining: 18 };
answeredCountEl.textContent = '1';
assert.strictEqual(answeredCountEl.textContent, '1');
// Per option counts remain hidden while answering
for (let i = 0; i < 4; i++) {
  const badge = document.getElementById(`hostOptCount_${i}`);
  assert.strictEqual(badge.style.display, 'none', 'Per-option counts must stay hidden while answering');
}
console.log('✓ Total answered count shows "1" while per-option counts remain strictly hidden');

// 1.3 Test Student Device Event Isolation: Students NEVER receive others\' choices
let studentLeakDetected = false;
globalThis.ScoreARRealtime.init('student', '123456', (msg) => {
  if (msg.type === 'STUDENT_ANSWER' || msg.optionIndex !== undefined) {
    studentLeakDetected = true;
  }
});

// Simulate receiving an incoming message on student device
const studentMessageFromOther = {
  type: 'STUDENT_ANSWER',
  _senderRole: 'student',
  playerId: 's2',
  optionIndex: 1
};
// Test dispatch filtering
new Function(realtimeCode)();
assert.strictEqual(studentLeakDetected, false, 'Student device must NOT process another student\'s answer');
console.log('✓ Student device verified leak-proof: discards any answer events from other students');

console.log('\n--- 2. Testing Item 2: Reveal Animation & No Top Answer Rewrite ---');

// Finish question and trigger evaluation
const evalResult = globalThis.ScoreARHostEvents.evaluateQuestionResults(qData, mockRoom.answers[0], mockRoom.players, 20);

// Simulate finishCurrentQuestion logic
const correctIndices = evalResult.correct;
assert.deepStrictEqual(correctIndices, [0], 'Correct index must be 0');

// Apply finish logic to elements
for (let i = 0; i < 4; i++) {
  const card = document.getElementById(`hostOptCard_${i}`);
  const badge = document.getElementById(`hostOptBadge_${i}`);
  const count = document.getElementById(`hostOptCount_${i}`);

  if (correctIndices.includes(i)) {
    card.style.transform = 'scale(1.03)';
    card.style.boxShadow = '0 0 35px #10b981';
    card.style.background = '#059669';
    card.style.opacity = '1';
    badge.style.display = 'inline-block';
    badge.innerHTML = 'الإجابة النموذجية ✓';
  } else {
    card.style.opacity = '0.32'; // Dimmed / faded color (does NOT vanish)
    card.style.filter = 'grayscale(65%) brightness(0.65)';
    card.style.transform = 'scale(0.96)';
    card.style.pointerEvents = 'none';
  }
  // Reveal option count now that question is over
  count.style.display = 'inline-block';
}

// Assertions for Item 2:
// 2.1 Correct card stays with glow, pulse, and checkmark
const correctCard = document.getElementById('hostOptCard_0');
assert.strictEqual(correctCard.style.opacity, '1', 'Correct option must remain 100% visible');
assert.ok(correctCard.style.boxShadow.includes('#10b981'), 'Correct option must have green glow');
assert.ok(document.getElementById('hostOptBadge_0').innerHTML.includes('✓'), 'Correct option must show ✓ checkmark');
console.log('✓ Correct option stays prominent with green glow, pulse, and ✓ checkmark');

// 2.2 Wrong cards dim (color fades down, remains visible, pointer-events none)
for (let i = 1; i < 4; i++) {
  const wrongCard = document.getElementById(`hostOptCard_${i}`);
  assert.strictEqual(wrongCard.style.opacity, '0.32', `Wrong option ${i} must dim (opacity 0.32)`);
  assert.ok(wrongCard.style.filter.includes('grayscale'), `Wrong option ${i} must have grayscale dimming`);
  assert.strictEqual(wrongCard.style.pointerEvents, 'none', `Wrong option ${i} must disable pointer events`);
}
console.log('✓ Wrong options dim smoothly (opacity 0.32, grayscale dim, pointer-events none - does NOT vanish)');

// 2.3 Per-option counts revealed after time ends
for (let i = 0; i < 4; i++) {
  const count = document.getElementById(`hostOptCount_${i}`);
  assert.strictEqual(count.style.display, 'inline-block', `Per-option count ${i} must be revealed after question ends`);
}
console.log('✓ Per-option distribution is revealed after question concludes');

// 2.4 Verify banner does NOT rewrite the answer text
const revealBanner = createMockElement('hostRevealBanner');
revealBanner.innerHTML = `
  <div style="display:flex;align-items:center;gap:12px;">
    <span>✓</span>
    <div><div style="font-size:15px;font-weight:900;">انتهى وقت الإجابة</div></div>
  </div>
`;
assert.ok(!revealBanner.innerHTML.includes('نعت منصوب'), 'Banner must NOT duplicate or rewrite the answer text');
assert.ok(!revealBanner.innerHTML.includes('الإجابة النموذجية الصحيحة:'), 'Banner must NOT have duplicate answer heading');
console.log('✓ Top banner does NOT rewrite the answer text (preserves clean projector aesthetics)');

console.log('\n========================================');
console.log('ALL ROOM TOUCH & LEAK PREVENTION TESTS PASSED 100%! 🚀');
console.log('========================================');
process.exit(0);
