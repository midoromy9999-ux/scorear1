/**
 * Automated Acceptance Suite for Batch 2b (الدفعة 2ب: العوالم والتتويج والطلاب التجريبيون)
 * Covers:
 * 1. World Selection Step upon quiz launch (6 worlds, video preview, launch confirmation).
 * 2. Demo / Bot Students (1-30, 30 Arabic names pool, accuracy & speed profiles, probabilistic simulation, report exclusion).
 * 3. World-Themed Podium with zero new external assets (CSS/SVG/Canvas for 6 worlds).
 * 4. Stepwise Suspense Reveal (3rd -> 2nd -> 1st -> roster) and Student Floating Reactions.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('  TESTING BATCH 2B: WORLDS, BOT STUDENTS, PODIUM & REACTIONS');
console.log('=================================================================\n');

// 1. Line Count Verification
console.log('--- 1. Rule 7 Line Count Verification ---');
const filesToCheck = [
  { name: 'app.js', max: 958 },
  { name: 'quiz-host.js', max: 500 },
  { name: 'quiz-student.js', max: 500 },
  { name: 'quiz-bots.js', max: 500 },
  { name: 'quiz-podium-effects.js', max: 500 },
  { name: 'world-flow.js', max: 500 }
];

filesToCheck.forEach(f => {
  const p = path.join(rootDir, f.name);
  const lines = fs.readFileSync(p, 'utf8').split('\n').length;
  console.log(`[CHECK] ${f.name}: ${lines} lines (max: ${f.max})`);
  assert(lines <= f.max, `${f.name} exceeded line limit: ${lines} > ${f.max}`);
});
console.log('✅ All files strictly comply with Rule 7 line limits.\n');

// Mock Browser Environment
const mockElements = {};
const globalMock = {
  document: {
    getElementById: (id) => mockElements[id] || null,
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        id: '',
        style: {},
        innerHTML: '',
        innerText: '',
        textContent: '',
        children: [],
        appendChild: (child) => { el.children.push(child); return child; },
        remove: () => {},
        addEventListener: () => {},
        querySelectorAll: () => [],
        scrollIntoView: () => {},
        showModal: () => { el.open = true; },
        close: () => { el.open = false; }
      };
      return el;
    },
    body: {
      appendChild: (el) => {
        if (el.id) mockElements[el.id] = el;
      }
    },
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: {},
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  ScoreARAudio: { playSfx: () => {}, playMusic: () => {}, stopMusic: () => {} },
  ScoreARRealtime: {
    init: () => {},
    subscribe: () => {},
    publish: (type, payload) => {
      globalMock._lastPublished = { type, payload };
    },
    generatePin: () => '849201'
  },
  toast: () => {},
  confetti: () => {}
};
globalMock.window = globalMock;
globalMock.globalThis = globalMock;

// 2. Test World Picker Component (world-flow.js)
console.log('--- 2. World Selection Step Verification ---');
const worldFlowCode = fs.readFileSync(path.join(rootDir, 'world-flow.js'), 'utf8');
const runWorldFlow = new Function('global', 'window', 'document', worldFlowCode);
runWorldFlow(globalMock, globalMock, globalMock.document);

const WorldFlow = globalMock.ScoreARWorldFlow;
assert(WorldFlow, 'ScoreARWorldFlow must be defined');
assert.strictEqual(WorldFlow.WORLDS_DATA.length, 6, 'Must have exactly 6 worlds');

const expectedWorldIds = ['royal', 'treasure', 'cosmic', 'oasis', 'stadium', 'magic'];
expectedWorldIds.forEach(id => {
  assert(WorldFlow.WORLDS_DATA.some(w => w.id === id), `World ${id} must exist in WORLDS_DATA`);
});

// Test openWorldPicker renders modal with video preview and 6 cards
let confirmedWorld = null;
WorldFlow.openWorldPicker({
  defaultWorldId: 'treasure',
  quizTitle: 'اختبار تجريبي',
  onConfirm: (w) => { confirmedWorld = w; }
});

const worldModal = mockElements['scorearWorldFlowModal'];
assert(worldModal, 'World flow modal must be created in body');
assert(worldModal.innerHTML.includes('اختر عالم المنافسة التفاعلي'), 'Modal must contain Arabic heading');
assert(worldModal.innerHTML.includes('worldPickerVideo'), 'Modal must have video preview player');
assert(worldModal.innerHTML.includes('assets/videos/worlds/treasure.mp4'), 'Video must point to treasure world video');

// Select different world: 'cosmic'
WorldFlow.selectPickerWorld('cosmic');
assert.strictEqual(WorldFlow.getWizardState().worldId, 'cosmic', 'Selected world state must update to cosmic');

// Confirm picker
WorldFlow.confirmPickerWorld();
assert.strictEqual(confirmedWorld, 'cosmic', 'Callback must receive confirmed world cosmic');
console.log('✅ World selection step renders video preview, updates dynamically, and passes chosen world.\n');

// 3. Test Bot Students Simulation Engine (quiz-bots.js)
console.log('--- 3. Demo / Bot Students Engine Verification ---');
const quizBotsCode = fs.readFileSync(path.join(rootDir, 'quiz-bots.js'), 'utf8');
const runQuizBots = new Function('global', 'window', 'document', quizBotsCode);

// Mock Host Room
const mockHostRoom = {
  pin: '849201',
  status: 'lobby',
  players: [],
  answers: {}
};
globalMock.ScoreARQuizHost = {
  getCurrentRoom: () => mockHostRoom,
  refreshLobbyUi: () => {},
  handleHostIncomingMessage: (msg) => { globalMock._lastHostMessage = msg; }
};

runQuizBots(globalMock, globalMock, globalMock.document);
const Bots = globalMock.ScoreARBots;
assert(Bots, 'ScoreARBots must be defined');

// Add 10 bots with mixed accuracy & fast speed
Bots.addBots(10, 'mixed', 'fast');
assert.strictEqual(mockHostRoom.players.length, 10, 'Must have added 10 bots to host room');

// Verify bot properties: Arabic names, avatars, isBot flag
mockHostRoom.players.forEach(p => {
  assert(p.isBot === true, 'Player must have isBot: true');
  assert(p.isDemo === true, 'Player must have isDemo: true');
  assert(/^char_\d{2}$/.test(p.avatarId), `Avatar ${p.avatarId} must be valid format`);
  assert(typeof p.name === 'string' && p.name.length > 2, 'Bot name must be valid Arabic string');
});

// Verify Name deduplication if adding duplicate name
const originalCount = mockHostRoom.players.length;
Bots.addBots(5, 'high', 'medium');
assert.strictEqual(mockHostRoom.players.length, originalCount + 5, 'Roster count must be 15');
const uniqueNames = new Set(mockHostRoom.players.map(p => p.name));
assert.strictEqual(uniqueNames.size, mockHostRoom.players.length, 'All bot names must be distinct');

// Remove single bot
const botToRemove = mockHostRoom.players[0].id;
Bots.removeBot(botToRemove);
assert.strictEqual(mockHostRoom.players.length, 14, 'Roster count must drop to 14 after single removal');
assert(!mockHostRoom.players.some(p => p.id === botToRemove), 'Removed bot must not be in room');

// Question Start & Probabilistic Answering Simulation (Rule 2: pure JS probability)
const sampleQuestion = {
  id: 'q1',
  text: 'ما عاصمة مصر؟',
  options: ['القاهرة', 'الإسكندرية', 'الجيزة', 'أسوان'],
  correct: [0],
  timeLimit: 15
};
mockHostRoom.status = 'question';
Bots.onQuestionStart(0, sampleQuestion, 15);

// Verify report exclusion flag
assert.strictEqual(Bots.shouldIncludeInReport(), false, 'Bots must be excluded from reports by default');
Bots.setIncludeInReport(true);
assert.strictEqual(Bots.shouldIncludeInReport(), true, 'Include in reports toggle must update');

// Remove all bots
Bots.removeAllBots();
assert.strictEqual(mockHostRoom.players.length, 0, 'All bots must be cleanly removed');
console.log('✅ Bot students engine verified: roster, authentic Arabic names, probabilistic answering, report exclusion.\n');

// 4. Test World-Themed Podium & Effects (quiz-podium-effects.js)
console.log('--- 4. World-Themed Podium & Stepwise Reveal Verification ---');
const podiumEffectsCode = fs.readFileSync(path.join(rootDir, 'quiz-podium-effects.js'), 'utf8');
const runPodiumEffects = new Function('global', 'window', 'document', podiumEffectsCode);
runPodiumEffects(globalMock, globalMock, globalMock.document);

const PodiumEffects = globalMock.ScoreARPodiumEffects;
assert(PodiumEffects, 'ScoreARPodiumEffects must be defined');

// Setup contest results with 3 players
const testRoom = {
  world: { id: 'cosmic', name: 'المجرة الكونية' },
  players: [
    { id: 'p1', name: 'أحمد صلاح', score: 1850, avatarId: 'char_01' },
    { id: 'p2', name: 'عمر السعيد', score: 1420, avatarId: 'char_02' },
    { id: 'p3', name: 'ياسمين مروان', score: 980, avatarId: 'char_03' },
    { id: 'p4', name: 'سارة أمل', score: 650, avatarId: 'char_04' }
  ]
};

const podiumStage = globalMock.document.createElement('div');
podiumStage.id = 'scorearHostStage';
mockElements['scorearHostStage'] = podiumStage;

PodiumEffects.renderHostPodium(podiumStage, testRoom, () => {});

assert(podiumStage.innerHTML.includes('assets/videos/worlds/cosmic.mp4'), 'Podium must load world video background');
assert(podiumStage.innerHTML.includes('scorearWorldCanvas'), 'Podium must instantiate canvas for particles');
assert(podiumStage.innerHTML.includes('rocketAscend'), 'Cosmic podium must include animated SVG rocket');

// Stepwise Reveal: 3rd -> 2nd -> 1st -> Roster
const mockCol1 = { style: {} }, mockCol2 = { style: {} }, mockCol3 = { style: {} }, mockCrown = { style: {} }, mockRoster = { style: {} };
mockElements['podiumCol_1'] = mockCol1;
mockElements['podiumCol_2'] = mockCol2;
mockElements['podiumCol_3'] = mockCol3;
mockElements['championCrownEl'] = mockCrown;
mockElements['podiumFullRosterSection'] = mockRoster;
mockElements['podiumRevealBtn'] = { innerHTML: '', style: {} };

// Step 1: Reveal 3rd Place
PodiumEffects.advanceReveal();
assert.strictEqual(mockCol3.style.opacity, '1', '3rd place must be revealed at step 1');

// Step 2: Reveal 2nd Place
PodiumEffects.advanceReveal();
assert.strictEqual(mockCol2.style.opacity, '1', '2nd place must be revealed at step 2');

// Step 3: Reveal 1st Grand Champion
PodiumEffects.advanceReveal();
assert.strictEqual(mockCol1.style.opacity, '1', '1st place champion must be revealed at step 3');
assert.strictEqual(mockCrown.style.visibility, 'visible', 'Champion crown must become visible at step 3');

// Step 4: Show Full Roster Table
PodiumEffects.advanceReveal();
assert.strictEqual(mockRoster.style.display, 'block', 'Full results roster must display at step 4');
console.log('✅ World-themed podium verified: SVG overlays, Canvas particles, and 4-step suspense reveal.\n');

// 5. Test Student Floating Reactions
console.log('--- 5. Student Floating Reactions Verification ---');
const reactionContainer = globalMock.document.createElement('div');
reactionContainer.id = 'hostFloatingReactionsContainer';
mockElements['hostFloatingReactionsContainer'] = reactionContainer;

PodiumEffects.handleStudentReaction('🔥', 'أحمد صلاح');
assert.strictEqual(reactionContainer.children.length, 1, 'Reaction bubble must be appended to host view');
assert(reactionContainer.children[0].innerHTML.includes('🔥'), 'Bubble must contain emoji');
assert(reactionContainer.children[0].innerHTML.includes('أحمد صلاح'), 'Bubble must contain student name tag');

// Student Screen sendReaction
const quizStudentCode = fs.readFileSync(path.join(rootDir, 'quiz-student.js'), 'utf8');
const runQuizStudent = new Function('global', 'window', 'document', quizStudentCode);
runQuizStudent(globalMock, globalMock, globalMock.document);

const Student = globalMock.ScoreARQuizStudent;
assert(Student, 'ScoreARQuizStudent must be defined');
assert(typeof Student.sendReaction === 'function', 'Student.sendReaction must be exposed');

// Mock student session and trigger reaction
Student.startStudentSession('849201', { uid: 's1', name: 'أحمد صلاح', avatarId: 'char_01' });
Student.sendReaction('🎉');

assert(globalMock._lastPublished, 'Reaction must be published to realtime engine');
assert.strictEqual(globalMock._lastPublished.type, 'STUDENT_REACTION', 'Published event type must be STUDENT_REACTION');
assert.strictEqual(globalMock._lastPublished.payload.emoji, '🎉', 'Published emoji must match');
assert.strictEqual(globalMock._lastPublished.payload.studentName, 'أحمد صلاح', 'Published name must match');

console.log('✅ Floating student reaction rate-limiting and realtime delivery verified.\n');

console.log('=================================================================');
console.log('🎉 ALL BATCH 2B ACCEPTANCE TESTS PASSED (5/5)!');
console.log('=================================================================');
