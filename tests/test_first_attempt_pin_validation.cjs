/**
 * Test First-Attempt PIN Validation & Student Join Suite
 * Validates that a student entering a PIN on cold first attempt immediately succeeds
 * without any false "ROOM_NOT_FOUND" (الرقم غلط) error on the first click.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING TEST SUITE: FIRST-ATTEMPT PIN VALIDATION ===\n');

// 1. Verify File Line Limits
const limits = {
  'auth.js': 500,
  'quiz-student-join.js': 500,
  'quiz-host-events.js': 500,
  'quiz-host.js': 500,
  'quiz-student.js': 500,
  'app.js': 958
};

for (const [file, maxLines] of Object.entries(limits)) {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');
  const count = content.split('\n').length;
  console.log(`[Line Count] ${file}: ${count} lines (Limit: <= ${maxLines})`);
  assert(count <= maxLines, `Rule 7 violation: ${file} has ${count} lines, exceeding limit ${maxLines}`);
}
console.log('✓ All file line limits verified.\n');

// Mock Firebase RTDB and Auth environment
const mockDbStore = {
  rooms: {},
  scorear_rooms: {}
};

let signedInUser = null;
let signOutCallCount = 0;

const mockAuth = {
  get currentUser() { return signedInUser; },
  async signInAnonymously() {
    signedInUser = { uid: 'anon_' + Math.random().toString(36).slice(2, 9), isAnonymous: true };
    return { user: signedInUser };
  },
  async signOut() {
    signOutCallCount++;
    signedInUser = null;
  },
  setPersistence() { return Promise.resolve(); },
  onAuthStateChanged() { return () => {}; }
};

const mockDb = {
  ref(p) {
    return {
      set(val) {
        const parts = p.split('/');
        if (parts[0] === 'rooms') mockDbStore.rooms[parts[1]] = JSON.parse(JSON.stringify(val));
        return Promise.resolve();
      },
      update(val) {
        const parts = p.split('/');
        if (parts[0] === 'rooms' && mockDbStore.rooms[parts[1]]) {
          Object.assign(mockDbStore.rooms[parts[1]], JSON.parse(JSON.stringify(val)));
        }
        return Promise.resolve();
      },
      onDisconnect() {
        return {
          update() { return Promise.resolve(); }
        };
      },
      push(val) {
        const parts = p.split('/');
        const id = 'ev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        if (parts[0] === 'scorear_rooms') {
          if (!mockDbStore.scorear_rooms[parts[1]]) mockDbStore.scorear_rooms[parts[1]] = {};
          mockDbStore.scorear_rooms[parts[1]][id] = JSON.parse(JSON.stringify(val));
        }
        return Promise.resolve();
      },
      once(evt) {
        const parts = p.split('/');
        let data = null;
        if (parts[0] === 'rooms') {
          data = mockDbStore.rooms[parts[1]] || null;
        } else if (parts[0] === 'scorear_rooms') {
          data = mockDbStore.scorear_rooms[parts[1]] || null;
        }
        return Promise.resolve({
          exists: () => data !== null && data !== undefined,
          hasChildren: () => data !== null && typeof data === 'object' && Object.keys(data).length > 0,
          val: () => data
        });
      }
    };
  }
};

const authFn = () => mockAuth;
authFn.Auth = { Persistence: { LOCAL: 'LOCAL', SESSION: 'SESSION', NONE: 'NONE' } };

// Setup global mock
global.window = {
  firebase: {
    apps: [{ name: '[DEFAULT]' }],
    auth: authFn,
    database: () => mockDb
  },
  ScoreARAuth: {
    getAuth: () => mockAuth,
    getDb: () => mockDb,
    mapAuthError(err) {
      const code = err.message || err;
      if (code === 'ROOM_NOT_FOUND') return 'رمز القاعة (PIN) غير موجود أو تم إغلاقها من المعلم.';
      if (code === 'ROOM_LOCKED') return 'هذه القاعة مغلقة حالياً من قبل المعلم ولا تقبل انضمام طلاب جدد.';
      if (code === 'ROOM_CLOSED') return 'تم إنهاء هذه القاعة من قِبل المعلم.';
      return code;
    }
  },
  ScoreARRealtime: {
    publish(type, payload) {
      if (payload && payload.pin) {
        mockDb.ref('scorear_rooms/' + payload.pin).push({ type, ...payload, _senderRole: 'teacher', _timestamp: Date.now() });
      }
    }
  },
  sessionStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  }
};
global.sessionStorage = global.window.sessionStorage;
global.document = {
  querySelector: () => null,
  getElementById: () => null
};

// Load modules
const authModuleCode = fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8');
eval(authModuleCode);

const hostEventsCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-host-events.js'), 'utf8');
eval(hostEventsCode);

console.log('--- TEST 1: Host opens room and verifies RTDB & ScoreAR Rooms presence ---');
const testPin = '839201';
const hostEvents = global.window.ScoreARHostEvents || global.ScoreARHostEvents;
hostEvents.publishRoomOpen(testPin, { id: 'royal', name: 'المملكة الملكية' }, 5);

assert(mockDbStore.rooms[testPin], 'Host must initialize rooms/' + testPin);
assert.strictEqual(mockDbStore.rooms[testPin].status, 'lobby');
assert(mockDbStore.scorear_rooms[testPin], 'Host must publish to scorear_rooms/' + testPin);
console.log('✓ Host successfully published presence to both rooms/ and scorear_rooms/.');

console.log('\n--- TEST 2: Cold Student Join on First Attempt (No previous auth) ---');
signOutCallCount = 0;
signedInUser = null; // completely cold user

(async () => {
  try {
    const student = await global.window.ScoreARAuth.joinStudent(testPin, 'سارة صلاح', 'char_04');
    assert(student, 'Student join must return valid session');
    assert.strictEqual(student.pin, testPin);
    assert.strictEqual(student.name, 'سارة صلاح');
    assert.strictEqual(student.avatarId, 'char_04');
    assert(student.uid, 'Student must receive a valid uid');
    assert.strictEqual(signOutCallCount, 0, 'No signOut should be called on successful first attempt');
    console.log('✓ Cold student join succeeded on FIRST attempt without errors.');

    console.log('\n--- TEST 3: Invalid PIN properly rejected on first attempt ---');
    let rejected = false;
    try {
      await global.window.ScoreARAuth.joinStudent('999999', 'طالب تجريبي', 'char_01');
    } catch(err) {
      rejected = true;
      assert.strictEqual(err.message, 'ROOM_NOT_FOUND');
      const arabicMsg = global.window.ScoreARAuth.mapAuthError(err);
      assert(arabicMsg.includes('رمز القاعة'), 'Must provide clear Arabic error');
      console.log(`✓ Non-existent PIN rejected cleanly with: "${arabicMsg}"`);
    }
    assert(rejected, 'Invalid PIN must be rejected');

    console.log('\n--- TEST 4: Host closes room -> Student gets ROOM_CLOSED cleanly ---');
    hostEvents.publishRoomClosed(testPin, 'انتهت الحصة');
    let closedHandled = false;
    try {
      await global.window.ScoreARAuth.joinStudent(testPin, 'طالب جديد', 'char_02');
    } catch(err) {
      closedHandled = true;
      assert.strictEqual(err.message, 'ROOM_CLOSED');
      const msg = global.window.ScoreARAuth.mapAuthError(err);
      assert.strictEqual(msg, 'تم إنهاء هذه القاعة من قِبل المعلم.');
      console.log(`✓ Closed room join rejected cleanly with: "${msg}"`);
    }
    assert(closedHandled, 'Closed room must reject new joins with ROOM_CLOSED');

    console.log('\n=========================================================');
    console.log('🎉 ALL FIRST-ATTEMPT PIN VALIDATION TESTS PASSED (4/4)!');
    console.log('=========================================================');
  } catch(e) {
    console.error('Test execution failed:', e);
    process.exit(1);
  }
})();
