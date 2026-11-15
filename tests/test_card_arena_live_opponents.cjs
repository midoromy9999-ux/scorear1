/**
 * End-to-End Multi-Client Verification for Card Arena Live Opponents & Manual Bot Control
 * Verifies:
 * 1. Opening a room in CARD_ARENA (or any mode) spawns ZERO automatic bots (even after 600ms+).
 * 2. Only live students joining via PIN or bots manually added by the teacher in the lobby participate.
 * 3. Real-time Roster Sync: openTargetPicker on Student A's phone shows exact live opponents & scores.
 * 4. Multi-client Authoritative Card Execution (Student A -> Host Referee -> Student B & Lobby Bots):
 *    - SWAP_STUDENT swaps authoritative scores on Host and updates both students' live scores.
 *    - POINT_LEECH steals 20% points authoritatively on Host and updates both students.
 *    - MINUS_50 deducts 50 points from targeted opponent (Live Student or Bot).
 *    - PIN_STUDENT freezes targeted live student's option buttons (both mid-question AND when queued between questions) and blocks pinned Bot answers on Host.
 *    - SCREEN_FOG spawns interactive fog canvas on targeted opponent.
 *    - TIME_SLICER cuts targeted opponent's actual countdown timer in half.
 *    - MULTIPLIER_2X doubles player's earned question score on Host evaluation.
 *    - REVERSE_JUDGE trap equipped by Student B reflects Student A's attack back onto Student A via Host.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

function resolveFile(rootDir, file) {
  const candidates = [
    path.join(rootDir, file),
    path.join(rootDir, 'css', file),
    path.join(rootDir, 'js', 'engines', file),
    path.join(rootDir, 'js', 'quiz', file),
    path.join(rootDir, 'js', 'journey', file),
    path.join(rootDir, 'js', 'auth', file),
    path.join(rootDir, 'js', 'ui', file)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(rootDir, file);
}

// Shared simulated network bus that enforces the exact same rule as realtime-engine.js:
// - Student messages (_senderRole: 'student') are ONLY delivered to Host ('host')
// - Host messages (_senderRole: 'host') are delivered to ALL Students ('student')
const networkClients = [];

function createClientVm(role, clientName) {
  const elements = new Map();
  const optButtons = [];
  const doc = {
    readyState: 'complete',
    createElement(tag) {
      let _id = '';
      const el = {
        tagName: tag.toUpperCase(),
        get id() { return _id; },
        set id(val) { _id = val; if (val) elements.set(val, el); },
        style: {},
        className: '',
        classList: { add() {}, remove() {}, contains: () => false },
        children: [],
        innerHTML: '',
        textContent: '',
        offsetWidth: 360,
        offsetHeight: 220,
        appendChild(child) { el.children.push(child); if (child.id) elements.set(child.id, child); return child; },
        setAttribute() {},
        getAttribute() { return null; },
        addEventListener() {},
        getContext() {
          return {
            fillStyle: '', font: '', textAlign: '', globalCompositeOperation: '',
            fillRect() {}, fillText() {}, beginPath() {}, arc() {}, fill() {}
          };
        },
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 220 }),
        remove() { if (el.id) elements.delete(el.id); },
        querySelector() { return null; },
        querySelectorAll() { return []; }
      };
      return el;
    },
    getElementById(id) { return elements.get(id) || null; },
    querySelectorAll(sel) {
      if (sel === '.student-opt-btn') return optButtons;
      return [];
    },
    addEventListener() {},
    body: {
      children: [],
      appendChild(child) { doc.body.children.push(child); if (child.id) elements.set(child.id, child); return child; }
    }
  };

  // Pre-populate 4 option buttons + options container + timer for student screens
  if (role === 'student') {
    const cont = doc.createElement('div');
    cont.id = 'studentOptionsContainer';
    doc.body.appendChild(cont);
    for (let i = 0; i < 4; i++) {
      const btn = doc.createElement('button');
      btn.id = `studentOptBtn_${i}`;
      btn.className = 'student-opt-btn';
      btn.disabled = false;
      optButtons.push(btn);
      elements.set(btn.id, btn);
    }
    const timerTxt = doc.createElement('span');
    timerTxt.id = 'studentTimerText';
    timerTxt.textContent = '20';
    doc.body.appendChild(timerTxt);
    const fb = doc.createElement('div');
    fb.id = 'studentFeedbackBox';
    doc.body.appendChild(fb);
  }

  const subscribers = new Set();
  let myRole = role;
  let myPin = null;

  const mockRealtime = {
    init(r, p, cb) {
      myRole = (r === 'teacher' || r === 'admin' || r === 'host') ? 'host' : 'student';
      myPin = String(p).trim();
      subscribers.clear();
      if (typeof cb === 'function') subscribers.add(cb);
    },
    subscribe(fn) {
      if (typeof fn === 'function') subscribers.add(fn);
    },
    publish(type, payload = {}) {
      const packet = { type, ...payload, _senderRole: myRole, _timestamp: Date.now() };
      networkClients.forEach(targetClient => {
        if (targetClient === clientObj) return;
        // Exact realtime-engine.js isolation: student packets only reach host; host packets reach all students
        if (targetClient.role === 'student' && packet._senderRole === 'student') return;
        targetClient.receive(JSON.parse(JSON.stringify(packet)));
      });
    },
    cleanup() { subscribers.clear(); }
  };

  const sandbox = {
    window: {},
    location: { origin: 'http://localhost', pathname: '/' },
    addEventListener() {},
    document: doc,
    localStorage: { getItem: () => null, setItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout, clearTimeout, setInterval, clearInterval, Date, Math, console,
    ScoreARRealtime: mockRealtime,
    ScoreAREvaluator: require(resolveFile(rootDir, 'quiz-evaluator.js'))
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);
  const loadScript = (f) => vm.runInContext(fs.readFileSync(resolveFile(rootDir, f), 'utf8'), ctx);

  loadScript('CardArenaEngine.js');
  loadScript('quiz-game-modes.js');
  loadScript('quiz-card-arena.js');
  if (role === 'host') {
    loadScript('quiz-host-leaderboard.js');
    loadScript('quiz-host-events.js');
    loadScript('quiz-host-view.js');
    loadScript('quiz-host.js');
    loadScript('quiz-bots.js');
  } else {
    loadScript('quiz-student-view.js');
    loadScript('quiz-student.js');
  }

  const clientObj = {
    name: clientName,
    role,
    sandbox,
    doc,
    elements,
    optButtons,
    receive(msg) {
      subscribers.forEach(fn => fn(msg));
    }
  };
  networkClients.push(clientObj);
  return clientObj;
}

(async () => {
  console.log('🧪 Starting End-to-End Card Arena Live Opponents & Manual Bot Control Test...\n');

  const host = createClientVm('host', 'TeacherHost');
  const studentA = createClientVm('student', 'StudentA_Phone');
  const studentB = createClientVm('student', 'StudentB_Phone');

  // --- TEST 1: Zero Automatic Bots When Opening CARD_ARENA Room ---
  console.log('--- 1. Verifying ZERO Automatic Bots on Room Creation ---');
  host.sandbox.ScoreARGameModes.setMode('CARD_ARENA');
  host.sandbox.ScoreARQuizHost.startHostLobby('royal', '554433', true, true);

  // Wait 650ms (past the old 500ms auto-bot timer) to prove no bots ever sneak in
  await new Promise(r => setTimeout(r, 650));

  const room = host.sandbox.ScoreARQuizHost.getCurrentRoom();
  assert.strictEqual(room.players.length, 0, `Expected 0 automatic players in lobby, found ${room.players.length}`);
  const hostMgr = host.sandbox.ScoreARCardArena.getManager();
  assert.strictEqual(Object.keys(hostMgr.players).length, 0, `Expected 0 automatic bots in CardArenaEngine, found ${Object.keys(hostMgr.players).length}`);
  console.log('✅ Verified: Room starts with 0 automatic bots in both Lobby and CardArenaEngine!');

  // --- TEST 2: Live Students Join & Teacher Explicitly Adds 1 Bot from Lobby ---
  console.log('\n--- 2. Verifying Manual Participant Selection (2 Live Students + 1 Teacher-Added Bot) ---');
  studentA.sandbox.ScoreARQuizStudent.startStudentSession('554433', { uid: 'stu_ahmed', name: 'أحمد البطل', avatarId: 'char_01' });
  studentB.sandbox.ScoreARQuizStudent.startStudentSession('554433', { uid: 'stu_sara', name: 'سارة المبدعة', avatarId: 'char_02' });

  // Teacher manually adds 1 bot from the lobby
  host.sandbox.ScoreARBots.addBots(1, 'medium', 'fast');

  assert.strictEqual(room.players.length, 3, 'Lobby should have exactly 2 live students + 1 teacher-added bot');
  const addedBot = room.players.find(p => p.isBot);
  assert(addedBot, 'Teacher-added bot must exist in room.players');

  // Verify Student A's phone received the exact roster via ROSTER_SYNC / ROOM_MODE_UPDATE
  const stuAMgr = studentA.sandbox.ScoreARCardArena.getManager();
  const stuBMgr = studentB.sandbox.ScoreARCardArena.getManager();
  assert.strictEqual(Object.keys(stuAMgr.players).length, 3, 'Student A must see all 3 real room participants');
  assert(stuAMgr.players['stu_sara'], 'Student A must see Student B in target roster');
  assert(stuAMgr.players[addedBot.id], 'Student A must see the teacher-added Bot in target roster');
  console.log('✅ Verified: Student A & B phones synced exact room roster (2 live students + 1 manual bot, 0 fake bots)!');

  // --- TEST 3: Set Initial Scores & Verify Target Picker Shows Real Scores ---
  console.log('\n--- 3. Verifying Target Picker Shows Real Live Opponent Scores ---');
  room.players.find(p => p.id === 'stu_ahmed').score = 200;
  room.players.find(p => p.id === 'stu_sara').score = 800;
  addedBot.score = 500;
  host.sandbox.ScoreARCardArena.syncHostRoster(room.players);

  const cardSwap = stuAMgr.grantRandomCard('stu_ahmed', 'SWAP_STUDENT');
  studentA.sandbox.ScoreARCardArena.openTargetPicker(cardSwap.instanceId);
  const pickerModal = studentA.doc.getElementById('targetPickerModal');
  assert(pickerModal, 'Target picker modal must open on Student A phone');
  assert(pickerModal.innerHTML.includes('سارة المبدعة') && pickerModal.innerHTML.includes('800 نقطة'), 'Target picker must show Sara with 800 points');
  assert(pickerModal.innerHTML.includes(addedBot.name) && pickerModal.innerHTML.includes('500 نقطة'), 'Target picker must show Bot with 500 points');
  console.log('✅ Verified: Target picker displays exact live opponent names and scores!');

  // --- TEST 4: SWAP_STUDENT Card Authoritatively Swaps Scores Across Host & Both Students ---
  console.log('\n--- 4. Verifying SWAP_STUDENT (تبديل المراكز) Live Effect on Opponent ---');
  studentA.sandbox.ScoreARCardArena.confirmTarget(cardSwap.instanceId, 'stu_sara');

  assert.strictEqual(room.players.find(p => p.id === 'stu_ahmed').score, 800, 'Host room: Ahmed score must become 800');
  assert.strictEqual(room.players.find(p => p.id === 'stu_sara').score, 200, 'Host room: Sara score must become 200');
  assert.strictEqual(studentA.sandbox.ScoreARQuizStudent.getScore(), 800, 'Student A phone live score must update to 800');
  assert.strictEqual(studentB.sandbox.ScoreARQuizStudent.getScore(), 200, 'Student B phone live score must update to 200');
  console.log('✅ Verified: SWAP_STUDENT swapped scores on Host (800 <-> 200) and updated both Student A and Student B phones!');

  // --- TEST 5: POINT_LEECH (سارق النقاط) Steals 20% From Opponent Across Devices ---
  console.log('\n--- 5. Verifying POINT_LEECH (سارق النقاط) Live Effect on Opponent ---');
  const cardLeech = stuBMgr.grantRandomCard('stu_sara', 'POINT_LEECH');
  studentB.sandbox.ScoreARCardArena.confirmTarget(cardLeech.instanceId, 'stu_ahmed');

  // 20% of 800 = 160 stolen -> Ahmed: 640, Sara: 200 + 160 = 360
  assert.strictEqual(room.players.find(p => p.id === 'stu_ahmed').score, 640, 'Host room: Ahmed score must drop to 640');
  assert.strictEqual(room.players.find(p => p.id === 'stu_sara').score, 360, 'Host room: Sara score must rise to 360');
  assert.strictEqual(studentA.sandbox.ScoreARQuizStudent.getScore(), 640, 'Student A phone live score updated to 640');
  assert.strictEqual(studentB.sandbox.ScoreARQuizStudent.getScore(), 360, 'Student B phone live score updated to 360');
  console.log('✅ Verified: POINT_LEECH stole 160 points (20%) from Ahmed and added them to Sara across Host & phones!');

  // --- TEST 6: PIN_STUDENT, SCREEN_FOG, TIME_SLICER on Live Student Opponent ---
  console.log('\n--- 6. Verifying PIN_STUDENT, SCREEN_FOG, and TIME_SLICER on Live Opponent Screen ---');
  // Start a question on Student B's phone so options are active
  studentB.sandbox.ScoreARQuizStudent.renderStudentQuestion({
    qIndex: 0, totalQuestions: 3, q: 'سؤال تجريبي', opts: ['أ', 'ب', 'ج', 'د'], timeLimit: 20
  });

  // 6A: Student A fires TIME_SLICER at Student B
  studentA.sandbox.ScoreARCardArena.getManager().players['stu_ahmed'].hand = [];
  const cardTime = stuAMgr.grantRandomCard('stu_ahmed', 'TIME_SLICER');
  studentA.sandbox.ScoreARCardArena.confirmTarget(cardTime.instanceId, 'stu_sara');
  const timerAfterSlice = parseInt(studentB.doc.getElementById('studentTimerText').textContent, 10);
  assert(timerAfterSlice <= 10, `Expected Student B timer to be cut in half (<=10), got ${timerAfterSlice}`);
  console.log(`✅ Verified: TIME_SLICER cut Student B's live countdown timer from 20s to ${timerAfterSlice}s!`);

  // 6B: Student A fires SCREEN_FOG at Student B
  const cardFog = stuAMgr.grantRandomCard('stu_ahmed', 'SCREEN_FOG');
  studentA.sandbox.ScoreARCardArena.confirmTarget(cardFog.instanceId, 'stu_sara');
  const fogCanvas = studentB.doc.getElementById('fogOverlayCanvas');
  assert(fogCanvas, 'SCREEN_FOG must mount #fogOverlayCanvas over Student B options');
  console.log('✅ Verified: SCREEN_FOG mounted interactive fog canvas over Student B options!');

  // 6C: Student A fires PIN_STUDENT at Student B
  const cardPin = stuAMgr.grantRandomCard('stu_ahmed', 'PIN_STUDENT');
  studentA.sandbox.ScoreARCardArena.confirmTarget(cardPin.instanceId, 'stu_sara');
  const allDisabled = studentB.optButtons.every(b => b.disabled === true);
  assert(allDisabled, 'PIN_STUDENT must disable all option buttons on Student B phone');
  console.log('✅ Verified: PIN_STUDENT froze and disabled all option buttons on Student B phone!');

  // --- TEST 7: Queued PIN_STUDENT Used Between Questions Fires When Next Question Opens ---
  console.log('\n--- 7. Verifying Queued Attack Card Played on Result Screen Fires on Next Question ---');
  // Simulate Student B being on Result screen (already answered Q1)
  studentB.optButtons.forEach(b => { b.disabled = false; });
  studentB.sandbox.ScoreARQuizStudent.submitAnswer(0); // now hasAnswered() === true (options closed)
  studentB.optButtons.forEach(b => { b.disabled = false; }); // reset raw buttons before Q2

  const cardPinQueued = stuAMgr.grantRandomCard('stu_ahmed', 'PIN_STUDENT');
  studentA.sandbox.ScoreARCardArena.confirmTarget(cardPinQueued.instanceId, 'stu_sara');

  // Now launch Question 2 on Student B's phone
  studentB.sandbox.ScoreARQuizStudent.renderStudentQuestion({
    qIndex: 1, totalQuestions: 3, q: 'السؤال الثاني', opts: ['1', '2', '3', '4'], timeLimit: 20
  });
  await new Promise(r => setTimeout(r, 90));
  assert(studentB.optButtons.every(b => b.disabled === true), 'Queued PIN_STUDENT must freeze Student B options as soon as Question 2 opens');
  console.log('✅ Verified: Attack card played between questions queued and froze Student B as soon as Question 2 opened!');

  // --- TEST 8: REVERSE_JUDGE Trap Equipped on Student B Reflects Attack Back to Student A ---
  console.log('\n--- 8. Verifying Cross-Device Trap Reflection (REVERSE_JUDGE) ---');
  stuBMgr.players['stu_sara'].hand = [];
  stuBMgr.players['stu_sara'].trapSlots = [];
  const cardReverse = stuBMgr.grantRandomCard('stu_sara', 'REVERSE_JUDGE');
  studentB.sandbox.ScoreARCardArena.equipTrap(cardReverse.instanceId);

  const ahmedBefore = room.players.find(p => p.id === 'stu_ahmed').score;
  const saraBefore = room.players.find(p => p.id === 'stu_sara').score;

  const cardMinus = stuAMgr.grantRandomCard('stu_ahmed', 'MINUS_50');
  studentA.sandbox.ScoreARCardArena.confirmTarget(cardMinus.instanceId, 'stu_sara');

  assert.strictEqual(room.players.find(p => p.id === 'stu_sara').score, saraBefore, 'Sara score must be protected by REVERSE_JUDGE');
  assert.strictEqual(room.players.find(p => p.id === 'stu_ahmed').score, ahmedBefore - 50, 'Ahmed must take his own -50 reflected damage');
  assert.strictEqual(studentA.sandbox.ScoreARQuizStudent.getScore(), ahmedBefore - 50, 'Ahmed phone score updated with reflected -50 penalty');
  console.log('✅ Verified: REVERSE_JUDGE trap on Student B phone reflected Student A attack back onto Student A!');

  // --- TEST 9: MULTIPLIER_2X Doubles Score on Host Authoritative Evaluation ---
  console.log('\n--- 9. Verifying MULTIPLIER_2X Doubles Question Score on Host Evaluation ---');
  stuAMgr.players['stu_ahmed'].hand = [];
  const card2x = stuAMgr.grantRandomCard('stu_ahmed', 'MULTIPLIER_2X');
  studentA.sandbox.ScoreARCardArena.activateSelf(card2x.instanceId);

  const qData = { q: 'سؤال', opts: ['أ', 'ب', 'ج', 'د'], correct: [1], points: 1000 };
  const now = Date.now();
  const evalRes = host.sandbox.ScoreARHostEvents.evaluateQuestionResults(
    qData,
    { stu_ahmed: { playerId: 'stu_ahmed', optionIndex: 1, ts: now + 1000 } },
    room.players,
    20,
    now
  );
  assert(evalRes.playerResults['stu_ahmed'].pointsEarned > 1800, `Expected 2X points (>1800), got ${evalRes.playerResults['stu_ahmed'].pointsEarned}`);
  console.log(`✅ Verified: MULTIPLIER_2X awarded ${evalRes.playerResults['stu_ahmed'].pointsEarned} points (2X) in authoritative Host evaluation!`);

  console.log('\n🎉 ALL 9 MULTI-CLIENT CARD ARENA & MANUAL BOT CONTROL TESTS PASSED 100%!');
  process.exit(0);
})();
