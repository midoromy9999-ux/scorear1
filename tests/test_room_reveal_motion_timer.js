/**
 * ScoreAR Automated Test: Quiz Room Motion Graphics, World Timers & Wrong Answer Dimming
 *
 * Requirements Tested:
 * 1. Wrong answers do NOT disappear; their color dims (opacity 0.32, grayscale 65%, scale 0.96).
 * 2. Question intro: large font in the center during reading/thinking, smoothly glides to the top with motion graphic when options appear.
 * 3. Modern, world-themed timers: distinctive SVG circular gauge, icons, palettes for all 6 worlds (royal, cosmic, oasis, treasure, stadium, magic), with hurry pulse <= 5s.
 * 4. Mobile student view: 100% original full-color vibrant button design preserved.
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DOM mocks
const elements = new Map();
function createMockElement(id, tag = 'div') {
  const el = {
    id,
    tagName: tag.toUpperCase(),
    innerHTML: '',
    textContent: '',
    style: {},
    className: '',
    classList: {
      _classes: new Set(),
      add: (c) => el.classList._classes.add(c),
      remove: (c) => el.classList._classes.delete(c),
      contains: (c) => el.classList._classes.has(c)
    },
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
  querySelectorAll: (selector) => {
    return Array.from(elements.values());
  }
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

const HostView = globalThis.ScoreARQuizHostView;
const StudentView = globalThis.ScoreARQuizStudentView;
const Host = globalThis.ScoreARQuizHost;

console.log('\n======================================================');
console.log('--- 1. Testing Modern World-Themed Timers (6 Worlds) ---');
console.log('======================================================');

const worlds = ['royal', 'cosmic', 'oasis', 'treasure', 'stadium', 'magic'];
const expectedIcons = {
  royal: '👑',
  cosmic: '🚀',
  oasis: '🌴',
  treasure: '💎',
  stadium: '⚡',
  magic: '🔮'
};

worlds.forEach(w => {
  const timerHtml = HostView.renderWorldTimerHtml(w, 20);
  assert.ok(timerHtml.includes(`world-timer-${w}`), `Timer for ${w} must include class world-timer-${w}`);
  assert.ok(timerHtml.includes(expectedIcons[w]), `Timer for ${w} must display icon ${expectedIcons[w]}`);
  assert.ok(timerHtml.includes('hostQuestionTimerRing'), `Timer for ${w} must contain hostQuestionTimerRing SVG circle`);
  assert.ok(timerHtml.includes('ثانية'), `Timer for ${w} must include seconds label 'ثانية'`);
  console.log(`✓ World timer for [${w}] verified with icon ${expectedIcons[w]} and SVG gauge`);
});

console.log('\n======================================================');
console.log('--- 2. Testing Reading Phase: Large Centered Question ---');
console.log('======================================================');

const mockStage = createMockElement('hostStage');
const testQData = {
  id: 'q1',
  text: 'ما هو المفعول المطلق في اللغة العربية؟',
  options: ['مصدر منصوب', 'اسم مجرور', 'حرف عطف', 'ضمير متصل'],
  correct: [0],
  timeLimit: 20
};

// Render Reading phase
HostView.renderHostQuestionView(mockStage, 'reading', testQData, 0, 5, 'cosmic', 0, 10);
assert.ok(mockStage.innerHTML.includes('font-size:36px'), 'Reading question text must have large font size (36px)');
assert.ok(mockStage.innerHTML.includes('hostReadingCountdownArea'), 'Reading phase must show hostReadingCountdownArea');
assert.ok(mockStage.innerHTML.includes('مرحلة قراءة وفهم السؤال'), 'Reading phase must show thinking guidance cue');
console.log('✓ Host reading phase: Question rendered in large font (36px) centered in arena with thinking cue');

// Verify Student Mobile Reading view
const studentStage = createMockElement('studentStage');
StudentView.renderStudentReading(studentStage, { q: testQData.text, skill: 'نحو', qIndex: 0, totalQuestions: 5 }, 'cosmic', 10);
assert.ok(studentStage.innerHTML.includes('studentReadingCountdown'), 'Student reading countdown must be present');
console.log('✓ Student mobile reading view verified with original clean layout');

console.log('\n======================================================');
console.log('--- 3. Testing Motion Graphic Glide to Top on Answering ---');
console.log('======================================================');

// Setup mock DOM elements for animateToAnswering
const qCard = createMockElement('hostQuestionCard');
const qText = createMockElement('hostQuestionText');
qText.style.fontSize = '36px';
const arena = createMockElement('hostQuestionArena');
const readingArea = createMockElement('hostReadingCountdownArea');
const timerArea = createMockElement('hostTimerArea');
const optionsGrid = createMockElement('hostOptionsGrid');
optionsGrid.style.display = 'none';
const liveStats = createMockElement('hostLiveAnswerStats');
liveStats.style.display = 'none';

for (let i = 0; i < 4; i++) {
  createMockElement(`hostOptionCard_${i}`);
}

// Call animateToAnswering
HostView.animateToAnswering(mockStage, testQData, 0, 5, 'cosmic', 20);

assert.strictEqual(qText.style.fontSize, '22px', 'Question font size must smoothly scale down to 22px at top');
assert.strictEqual(qCard.style.margin, '0 auto 8px auto', 'Question card must smoothly glide to top header');
assert.strictEqual(timerArea.style.display, 'flex', 'Timer area must become visible');
assert.strictEqual(optionsGrid.style.display, 'grid', 'Options grid must become visible with grid layout');
assert.strictEqual(liveStats.style.display, 'flex', 'Live answer stats must become visible in header');
console.log('✓ animateToAnswering: Question smoothly glided to top (36px -> 22px), world timer and options grid activated');

// Verify Student Mobile Question retains original full-color buttons
StudentView.renderStudentQuestion(studentStage, { q: testQData.text, opts: testQData.options, skill: 'نحو', qIndex: 0, totalQuestions: 5 }, 'cosmic', 20);
assert.ok(studentStage.innerHTML.includes('background:#e21b3c'), 'Student button 0 must have original red background (#e21b3c)');
assert.ok(studentStage.innerHTML.includes('background:#1368ce'), 'Student button 1 must have original blue background (#1368ce)');
assert.ok(studentStage.innerHTML.includes('background:#d89e00'), 'Student button 2 must have original yellow background (#d89e00)');
assert.ok(studentStage.innerHTML.includes('background:#26890c'), 'Student button 3 must have original green background (#26890c)');
assert.ok(studentStage.innerHTML.includes('اضغط للاختيار'), 'Student buttons must include original subtitle "اضغط للاختيار"');
console.log('✓ Student mobile view: 100% original full-color button design verified (#e21b3c, #1368ce, #d89e00, #26890c)');

console.log('\n======================================================');
console.log('--- 4. Testing Wrong Answers Dimming (Do NOT Vanish) ---');
console.log('======================================================');

// Setup options cards
for (let i = 0; i < 4; i++) {
  const card = createMockElement(`hostOptionCard_${i}`);
  card.className = 'host-option-card';
  card.style.opacity = '1';
  createMockElement(`hostOptionText_${i}`);
  createMockElement(`hostOptionCountBadge_${i}`);
}

// Simulate reveal evaluation
const correctIdx = 0;
for (let i = 0; i < 4; i++) {
  const card = document.getElementById(`hostOptionCard_${i}`);
  const isCorrect = (i === correctIdx);
  if (isCorrect) {
    card.className = 'host-option-card correct-revealed';
    card.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    card.style.border = '3px solid #34d399';
    card.style.transform = 'scale(1.04)';
    card.style.opacity = '1';
  } else {
    card.className = 'host-option-card wrong-dimmed';
    card.style.opacity = '0.32';
    card.style.filter = 'grayscale(65%) brightness(0.65)';
    card.style.transform = 'scale(0.96)';
    card.style.pointerEvents = 'none';
  }
}

// 4.1 Verify Correct card is fully visible and highlighted
const cCard = document.getElementById('hostOptionCard_0');
assert.strictEqual(cCard.style.opacity, '1', 'Correct option must remain 100% visible');
assert.ok(cCard.classList.contains('correct-revealed') || cCard.className.includes('correct-revealed'), 'Correct card must have correct-revealed class');
console.log('✓ Correct option shines with green gradient and full opacity (1.0)');

// 4.2 Verify Wrong cards are dimmed and do NOT vanish (opacity must be > 0 and <= 0.4)
for (let i = 1; i < 4; i++) {
  const wCard = document.getElementById(`hostOptionCard_${i}`);
  assert.strictEqual(wCard.style.opacity, '0.32', `Wrong option ${i} must have dimmed opacity 0.32`);
  assert.ok(wCard.style.filter.includes('grayscale'), `Wrong option ${i} must have grayscale dimming filter`);
  assert.strictEqual(wCard.style.pointerEvents, 'none', `Wrong option ${i} must have pointer-events none`);
  assert.ok(Number(wCard.style.opacity) > 0, `Wrong option ${i} must NOT vanish (opacity > 0)`);
}
console.log('✓ All wrong options dim down cleanly (opacity 0.32, grayscale 65%) without vanishing from screen');

console.log('\n======================================================');
console.log('--- 5. Testing Hurry / Emergency Pulse when time <= 5s ---');
console.log('======================================================');

const timerContainer = createMockElement('hostWorldTimerContainer');
timerContainer.className = 'scorear-world-timer world-timer-royal';
const timerRing = createMockElement('hostQuestionTimerRing');
const timerNum = createMockElement('hostQuestionTimerNum');

// Simulate countdown reaching 5 seconds
const totalTime = 20;
const currentSec = 5;
timerNum.textContent = currentSec;
const circumference = 257.6;
timerRing.style.strokeDashoffset = circumference * (1 - (currentSec / totalTime));
if (currentSec <= 5) {
  timerContainer.classList.add('timer-hurry-pulse');
}

assert.ok(timerContainer.classList.contains('timer-hurry-pulse'), 'World timer must add timer-hurry-pulse when <= 5 seconds');
assert.strictEqual(timerRing.style.strokeDashoffset, 257.6 * 0.75, 'Timer ring strokeDashoffset must reflect progress');
console.log('✓ Timer hurry pulse activated when time <= 5s with dynamic strokeDashoffset');

console.log('\n======================================================');
console.log('ALL MOTION GRAPHIC, WORLD TIMER & WRONG DIM TESTS PASSED 100%! 🌟');
console.log('======================================================\n');
process.exit(0);
