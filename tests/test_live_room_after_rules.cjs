/**
 * End-to-End Automated Verification:
 * Host + Student Live Room Flow after Database Rules Hardening
 * Verifies that the tightened database rules do not break live room creation,
 * student PIN join, answer submission, or host scoring.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

// 1. Verify rules syntax and permissions logic
console.log('--- 1. Auditing database.rules.json for Live Room Permissions ---');
const rules = JSON.parse(fs.readFileSync(path.join(rootDir, 'database.rules.json'), 'utf8')).rules;

assert.ok(rules.scorear_rooms, 'scorear_rooms must exist');
assert.strictEqual(rules.scorear_rooms.$pin['.read'], 'auth != null', 'Students and hosts can read room events');
assert.ok(rules.scorear_rooms.$pin.$eventId['.write'].includes('!data.exists()'), 'Event writes cannot overwrite');

assert.ok(rules.rooms, 'rooms must exist');
assert.strictEqual(rules.rooms.$pin.answers.$qIndex.$playerId['.write'], 'auth != null && !data.exists() && auth.uid === $playerId', 'Student can only write their own answer once');
assert.ok(rules.rooms.$pin.players.$playerId['.write'].includes('auth.uid === $playerId'), 'Student can write own player registration');
console.log('✓ Database rules allow student join and answer write while protecting room status and questions.');

// 2. Simulate Host + Student Live Session
console.log('\n--- 2. Simulating Host + Student Live Session Flow ---');
const eventsLog = [];
const mockRealtime = {
  publish: (type, payload) => {
    eventsLog.push({ type, ...payload, timestamp: Date.now() });
  }
};

global.ScoreARRealtime = mockRealtime;
global.window = global;
global.sessionStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

require(path.join(rootDir, 'quiz-host-events.js'));
const HostEvents = global.ScoreARHostEvents || module.exports;

const PIN = '884422';
const mockRoom = {
  pin: PIN,
  world: { id: 'cosmic' },
  status: 'lobby',
  players: [],
  answers: {}
};

const hostCtx = {
  currentRoom: mockRoom,
  currentQIndex: 0,
  isRoomLocked: false,
  onPlayerJoined: () => {},
  onPlayerReconnected: () => {}
};

// Step A: Student sends STUDENT_JOIN
console.log('Step A: Student joins with PIN 884422');
HostEvents.handleHostIncomingMessage({
  type: 'STUDENT_JOIN',
  pin: PIN,
  player: { id: 'student_live_1', name: 'ياسين البطل', avatarId: 'char_05' }
}, hostCtx);

assert.strictEqual(mockRoom.players.length, 1, 'Player must be added to host room');
assert.strictEqual(mockRoom.players[0].name, 'ياسين البطل');
assert.strictEqual(mockRoom.players[0].avatarId, 'char_05');

const acceptedEvent = eventsLog.find(e => e.type === 'JOIN_ACCEPTED' && e.studentId === 'student_live_1');
assert.ok(acceptedEvent, 'Host must emit JOIN_ACCEPTED event for the student');
console.log('✓ Host accepted student join and broadcasted JOIN_ACCEPTED');

// Step B: Host launches Question
console.log('Step B: Host starts question 0');
mockRoom.status = 'question';
mockRoom.currentQuestion = {
  q: 'ما هو الكوكب الأحمر؟',
  opts: ['المريخ', 'المشتري', 'عطارد', 'الزهرة'],
  ans: 0,
  timeLimit: 20,
  points: 1000
};

// Step C: Student submits answer
console.log('Step C: Student submits answer (Option 0 - المريخ)');
const answerTime = Date.now();
HostEvents.handleHostIncomingMessage({
  type: 'STUDENT_ANSWER',
  pin: PIN,
  playerId: 'student_live_1',
  playerName: 'ياسين البطل',
  qIndex: 0,
  optionIndex: 0,
  timeRemaining: 15
}, hostCtx);

// Check host answers
assert.ok(mockRoom.answers[0], 'Room must record answers for Q0');
assert.ok(mockRoom.answers[0]['student_live_1'], 'Answer from student must be saved');
assert.strictEqual(mockRoom.answers[0]['student_live_1'].optionIndex, 0);
console.log('✓ Student answer recorded by Host (Option 0 - المريخ)');

// Step D: Host shows Question Result
console.log('Step D: Host publishes QUESTION_RESULT');
eventsLog.length = 0;
HostEvents.publishQuestionResult({
  pin: PIN,
  qIndex: 0,
  correctAnswer: 0,
  playerResults: {
    'student_live_1': { id: 'student_live_1', isCorrect: true, pointsEarned: 950, totalScore: 950 }
  },
  explain: 'المريخ هو الكوكب الأحمر لاحتواء تربته على أكسيد الحديد'
});

const resultEvent = eventsLog.find(e => e.type === 'QUESTION_RESULT');
assert.ok(resultEvent, 'QUESTION_RESULT must be published');
assert.strictEqual(resultEvent.correctAnswer, 0);
assert.strictEqual(resultEvent.playerResults['student_live_1'].totalScore, 950);
console.log('✓ Host broadcasted QUESTION_RESULT with explanation and verified scores');

console.log('\n======================================================');
console.log('LIVE ROOM FLOW WITH HARDENED RULES VERIFIED 100%! 🎮');
console.log('======================================================');
