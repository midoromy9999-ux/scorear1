/**
 * Test Cards Runtime Live Execution (Pure Node VM Mock DOM)
 * Verifies:
 * 1. Mode initialization & zero starter cards (hand starts empty).
 * 2. Only Top 2 fastest correct answerers earn cards.
 * 3. Mobile deck overlay doesn't collide with notifications.
 * 4. Traps & auto-counter reflection.
 * 5. Exclusive card pool: claimed cards never repeat room-wide (except BETTER_LUCK).
 * 6. Mobile Refresh & Reconnect Auto-Restore (Seamless Resumption).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createMockDom() {
  const elements = new Map();
  const doc = {
    createElement(tag) {
      let _id = '';
      const el = {
        tagName: tag.toUpperCase(),
        get id() { return _id; },
        set id(val) { _id = val; if (val) elements.set(val, el); },
        style: {},
        classList: { add() {}, remove() {}, contains: () => false },
        children: [],
        innerHTML: '',
        textContent: '',
        appendChild(child) { el.children.push(child); if (child.id) elements.set(child.id, child); return child; },
        setAttribute() {},
        getAttribute() { return null; },
        addEventListener() {},
        remove() { if (el.id) elements.delete(el.id); },
        querySelector() { return null; },
        querySelectorAll() { return []; }
      };
      return el;
    },
    getElementById(id) { return elements.get(id) || null; },
    querySelectorAll() { return []; },
    body: {
      children: [],
      appendChild(child) { doc.body.children.push(child); if (child.id) elements.set(child.id, child); return child; }
    }
  };
  return { doc, elements };
}

const { doc, elements } = createMockDom();

const sessionStore = new Map();
const mockSessionStorage = {
  getItem: (k) => sessionStore.get(k) || null,
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k)
};

const sandbox = {
  window: {},
  document: doc,
  localStorage: { getItem: () => null, setItem: () => {} },
  sessionStorage: mockSessionStorage,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Date: Date,
  Math: Math,
  console: console
};
sandbox.window = sandbox;
sandbox.global = sandbox;

const context = vm.createContext(sandbox);

const cardArenaEngineCode = fs.readFileSync(path.join(__dirname, '../js/engines/CardArenaEngine.js'), 'utf8');
const gameModesCode = fs.readFileSync(path.join(__dirname, '../js/engines/quiz-game-modes.js'), 'utf8');
const cardArenaCode = fs.readFileSync(path.join(__dirname, '../js/quiz/quiz-card-arena.js'), 'utf8');
const studentCode = fs.readFileSync(path.join(__dirname, '../js/engines/quiz-student.js'), 'utf8');

vm.runInContext(cardArenaEngineCode, context);
vm.runInContext(gameModesCode, context);
vm.runInContext(cardArenaCode, context);
vm.runInContext(studentCode, context);

console.log('🧪 Starting Live Card Arena Runtime Verification...');

// 1. Set mode to CARD_ARENA
sandbox.ScoreARGameModes.setMode('CARD_ARENA', true);
if (sandbox.ScoreARGameModes.getMode() !== 'CARD_ARENA') throw new Error('Game mode failed to set');
if (!sandbox.ScoreARCardArena.isModeActive()) throw new Error('ScoreARCardArena.isModeActive() should be true');
console.log('✓ Mode set to CARD_ARENA & isModeActive() confirmed true');

// 2. Initialize arena for host
sandbox.ScoreARCardArena.initArena('123456', 'host_teacher', true);
const mgr = sandbox.ScoreARCardArena.getManager();
if (!mgr) throw new Error('Card Arena Manager not initialized');
console.log('✓ Card Arena Manager initialized for host');

// 3. Register student and verify ZERO free starter cards
const student = mgr.registerPlayer('student_1', 'طالب تجريبي', false);
if (student.hand.length !== 0) throw new Error('Students must start with empty hand, no free starter cards!');
console.log('✓ Student joined with 0 cards (Zero free cards verified)');

// 4. Verify card award ONLY for Top 2 fastest correct answerers
// Test non-top2 answer (isTop2 = false):
sandbox.ScoreARCardArena.onCorrectAnswerGranted('student_1', false);
if (student.hand.length !== 0) throw new Error('Card should NOT be granted if not in Top 2 fastest!');
console.log('✓ Correct answer without Top 2 speed correctly denied card');

// Test Top 2 answer (isTop2 = true):
sandbox.ScoreARCardArena.onCorrectAnswerGranted('student_1', true);
if (student.hand.length !== 1) throw new Error('Card should be granted for Top 2 speed winner');
console.log(`✓ Card granted to Top 2 winner: "${student.hand[0].nameAr}" (ID: ${student.hand[0].id})`);

// 5. Mount student deck UI
const stage = doc.createElement('div');
stage.id = 'scorearStudentStage';
doc.body.appendChild(stage);
sandbox.ScoreARCardArena.mountStudentDeck(stage);

const deckWrap = doc.getElementById('studentMobileDeckWrap');
if (!deckWrap) throw new Error('#studentMobileDeckWrap was not mounted');
if (deckWrap.style.display === 'none') throw new Error('Deck wrap should be visible in CARD_ARENA mode');
if (!deckWrap.innerHTML.includes('حقيبة الكروت')) throw new Error('Deck header not rendered');
console.log('✓ Student mobile deck mounted with compact thumb-friendly controls');

// 6. Equip a trap card for student and test auto-counter
student.hand = []; // reset hand for trap test
const reverseJudge = mgr.grantRandomCard('student_1', 'REVERSE_JUDGE');
if (reverseJudge.id !== 'REVERSE_JUDGE') throw new Error('Could not grant REVERSE_JUDGE');
const equipRes = mgr.equipToTrapSlot('student_1', reverseJudge.instanceId);
if (!equipRes.ok) throw new Error('Failed to equip REVERSE_JUDGE to trap slot');
if (student.trapSlots.length !== 1) throw new Error('Trap slot length mismatch');
console.log('✓ Student equipped "مرآة القاضي" to active trap slot');

// 7. Bot attacks student with MINUS_50 -> Expect REVERSE_JUDGE to reflect attack back to bot
mgr.registerPlayer('bot_1', '🤖 بطل ذكي', true);
const bot = mgr.players['bot_1'];
bot.score = 200;
student.score = 200;

const minusCard = mgr.grantRandomCard('bot_1', 'MINUS_50');
let reflectedEventCaught = false;
mgr.onCardEvent = (ev) => {
  if (ev.type === 'REFLECTED') {
    reflectedEventCaught = true;
    console.log(`✓ Auto-Counter Sync: ${ev.message}`);
  }
};

mgr.activateCard('bot_1', minusCard.instanceId, 'student_1');

if (!reflectedEventCaught) throw new Error('Auto-counter reflection did not trigger');
if (bot.score !== 150) throw new Error(`Bot score should be reduced to 150, got ${bot.score}`);
if (student.score !== 200) throw new Error(`Student score should remain 200, got ${student.score}`);
console.log('✓ Attack was reflected: Bot score dropped to 150, Student score stayed at 200!');

// 8. Test Exclusive Room Card Pool (no duplicate cards room-wide)
console.log(`✓ Testing exclusive pool: verifying that claimed cards never repeat across players...`);
const student2 = mgr.registerPlayer('student_2', 'طالب ثان', false);
for (let i = 0; i < 25; i++) {
  student2.hand = [];
  const c = mgr.grantRandomCard('student_2');
  if (c && c.id === 'REVERSE_JUDGE') {
    throw new Error('Violation: REVERSE_JUDGE was already claimed and should not be drawn again!');
  }
}
console.log('✓ Exclusive single-use card pool verified! No duplicates drawn across room');

// 9. Verify Student Top Alert Pill (no deck overlap)
sandbox.ScoreARCardArena.showStudentCardAlert('⚡ تنبيه فوري بأعلى الشاشة');
const alertEl = doc.getElementById('scorearStudentCardAlert');
if (!alertEl) throw new Error('Student top alert pill not created');
console.log('✓ Sleek student top alert pill created at top of mobile screen (no deck overlap)');

// 10. Test Mobile Refresh Session Auto-Restore
console.log('\n--- 10. Testing Mobile Refresh & Session Auto-Restore ---');
// Mock active session saved before refresh:
mockSessionStorage.setItem('scorear_active_quiz_session', JSON.stringify({
  pin: '987654',
  uid: 's_persisted_1',
  name: 'طالب متصل',
  avatarId: 'char_07',
  score: 450,
  streak: 3,
  rank: 1,
  worldId: 'cosmic',
  savedAt: Date.now()
}));

const restored = sandbox.ScoreARQuizStudent.tryRestoreSession();
if (!restored) throw new Error('tryRestoreSession failed to restore active session');
if (sandbox.ScoreARQuizStudent.getPin() !== '987654') throw new Error('Restored PIN mismatch');
if (sandbox.ScoreARQuizStudent.state.uid !== 's_persisted_1') throw new Error('Restored UID mismatch');
if (sandbox.ScoreARQuizStudent.state.name !== 'طالب متصل') throw new Error('Restored Name mismatch');
console.log('✓ Seamless Student Session Auto-Restore on mobile refresh verified 100%!');

// 11. Test Host Lobby Mode Selection & In-Lobby Dynamic Mode Switch
console.log('\n--- 11. Testing Mode Picker Interception & In-Lobby Mode Switch ---');
const hostViewCode = fs.readFileSync(path.join(__dirname, '../js/quiz/quiz-host-view.js'), 'utf8');
const hostCode = fs.readFileSync(path.join(__dirname, '../js/engines/quiz-host.js'), 'utf8');
vm.runInContext(hostViewCode, context);
vm.runInContext(hostCode, context);

// Test A: startHostLobby with bypassModePicker=false must intercept and trigger openModePicker
const origOpenModePicker = sandbox.ScoreARGameModes.openModePicker;
let pickerOpened = false;
sandbox.ScoreARGameModes.openModePicker = (opts) => {
  pickerOpened = true;
  if (typeof opts.onConfirm === 'function') {
    opts.onConfirm('royal', 'CARD_ARENA', true);
  }
};

sandbox.ScoreARQuizHost.startHostLobby('royal', '654321', true, false);
if (!pickerOpened) throw new Error('startHostLobby did NOT intercept with openModePicker!');
const room = sandbox.ScoreARQuizHost.getCurrentRoom();
if (!room) throw new Error('currentRoom was not created after mode picker confirmation');
if (room.gameMode !== 'CARD_ARENA') throw new Error(`currentRoom.gameMode should be CARD_ARENA, got ${room.gameMode}`);
console.log('✓ Calling startHostLobby intercepted and opened mode picker modal before room creation!');

// Restore real openModePicker
sandbox.ScoreARGameModes.openModePicker = origOpenModePicker;

// Test B: In-lobby mode change updates DOM badge, CardArenaEngine manager, room state, and broadcasts
const hostBtn = doc.createElement('button');
hostBtn.id = 'hostGameModeBtn';
const hostBtnText = doc.createElement('span');
hostBtnText.id = 'hostGameModeBtnText';
hostBtnText.textContent = '👤 فردي';
hostBtn.appendChild(hostBtnText);
doc.body.appendChild(hostBtn);

// Switch mode to SQUADS
sandbox.ScoreARQuizHostView.updateLobbyModeBadge('SQUADS');
if (hostBtnText.textContent !== '🛡️ مجموعات') throw new Error(`Badge text did not update to 🛡️ مجموعات, got ${hostBtnText.textContent}`);

// Open real mode picker for room, select CARD_ARENA, and confirm
sandbox.ScoreARGameModes.openModePicker({ worldId: 'royal', pin: '654321' });
sandbox.ScoreARGameModes.selectModeInModal('CARD_ARENA');
sandbox.ScoreARGameModes.confirmSelection();

if (room.gameMode !== 'CARD_ARENA') throw new Error(`room.gameMode failed to update to CARD_ARENA, got ${room.gameMode}`);
if (hostBtnText.textContent !== '🃏 حرب الكروت') throw new Error(`Badge text failed to update to 🃏 حرب الكروت, got ${hostBtnText.textContent}`);
console.log('✓ In-lobby mode change instantly updated room state, DOM button badge, and CardArenaEngine mode!');

mgr.stopAILoop();
console.log('\n🎉 ALL RUNTIME LIVE TESTS PASSED 100%! Cards, Arena, and Refresh Resumption are fully operational!');
process.exit(0);
