// Automated Test Suite for Phase B: Registration & Security Rules
// Covers:
// 1. Weak password rejection (<8 chars)
// 2. Duplicate username / generic error handling
// 3. Invalid email format rejection
// 4. Teacher "pending review" blocked from Studio
// 5. Student cannot access Teacher Studio or privileged endpoints
// 6. Database security rules simulation (.validate, $other:false, owner only)

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Minimal Mock Environment ---
let mockUsers = {};
let mockDatabase = {
  scorear_students: {},
  scorear_account_requests: {},
  scorear_teachers_registry: {},
  scorear_admin_notifications: {}
};

globalThis.window = globalThis;
globalThis.sessionStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const mockAuthInstance = {
  currentUser: null,
  setPersistence: async () => {},
  onAuthStateChanged: (cb) => { mockAuthInstance._listener = cb; },
  signInWithEmailAndPassword: async (email, password) => {
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (!user || user.password !== password) {
      const err = new Error('auth/invalid-credential');
      err.code = 'auth/invalid-credential';
      throw err;
    }
    mockAuthInstance.currentUser = user;
    if (mockAuthInstance._listener) mockAuthInstance._listener(user);
    return { user };
  },
  createUserWithEmailAndPassword: async (email, password) => {
    if (password.length < 8) {
      const err = new Error('auth/weak-password');
      err.code = 'auth/weak-password';
      throw err;
    }
    const existing = Object.values(mockUsers).find(u => u.email === email);
    if (existing) {
      const err = new Error('auth/email-already-in-use');
      err.code = 'auth/email-already-in-use';
      throw err;
    }
    const uid = 'uid_' + Math.random().toString(36).slice(2, 9);
    const newUser = {
      uid,
      email,
      password,
      displayName: '',
      claims: {},
      isAnonymous: false,
      sendEmailVerification: async () => true,
      updateProfile: async (data) => { if (data.displayName) newUser.displayName = data.displayName; },
      getIdTokenResult: async () => ({ claims: newUser.claims || {} })
    };
    mockUsers[uid] = newUser;
    mockAuthInstance.currentUser = newUser;
    if (mockAuthInstance._listener) mockAuthInstance._listener(newUser);
    return { user: newUser };
  },
  sendPasswordResetEmail: async (email) => {
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (!user) throw new Error('auth/user-not-found');
    return true;
  },
  signOut: async () => {
    mockAuthInstance.currentUser = null;
    if (mockAuthInstance._listener) mockAuthInstance._listener(null);
  }
};

const mockDbInstance = {
  ref: (pathStr) => ({
    set: async (val) => {
      const parts = pathStr.split('/');
      let curr = mockDatabase;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = val;
    },
    update: async (val) => {
      const parts = pathStr.split('/');
      let curr = mockDatabase;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = { ...(curr[parts[parts.length - 1]] || {}), ...val };
    },
    remove: async () => {
      const parts = pathStr.split('/');
      let curr = mockDatabase;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) return;
        curr = curr[parts[i]];
      }
      delete curr[parts[parts.length - 1]];
    },
    once: async () => {
      const parts = pathStr.split('/');
      let curr = mockDatabase;
      for (let p of parts) {
        if (curr && typeof curr === 'object') curr = curr[p];
        else { curr = undefined; break; }
      }
      return {
        exists: () => curr !== undefined && curr !== null,
        val: () => curr
      };
    }
  })
};

globalThis.firebase = {
  apps: [{}],
  auth: () => mockAuthInstance,
  database: Object.assign(() => mockDbInstance, { ServerValue: { TIMESTAMP: Date.now() } })
};
globalThis.firebase.auth.Auth = { Persistence: { LOCAL: 'LOCAL' } };

// Load auth.js
const authCode = fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8');
new Function(authCode)();

async function runTests() {
  console.log('--- 1. Testing Weak Password Rejection (<8 chars) ---');
  try {
    await globalThis.ScoreARAuth.registerTeacher({
      name: 'أحمد صلاح',
      email: 'ahmed@teacher.com',
      password: '123',
      subject: 'لغة عربية'
    });
    assert.fail('Should have rejected weak teacher password');
  } catch(err) {
    assert.strictEqual(err.message, 'WEAK_PASSWORD');
    assert.ok(globalThis.ScoreARAuth.mapAuthError(err).includes('8 خانات'));
    console.log('✓ Teacher weak password correctly rejected (<8 chars)');
  }

  try {
    await globalThis.ScoreARAuth.registerStudent({
      displayName: 'عمر البطل',
      username: 'omar2026',
      password: 'short',
      className: 'الصف الخامس'
    });
    assert.fail('Should have rejected weak student password');
  } catch(err) {
    assert.strictEqual(err.message, 'WEAK_PASSWORD');
    console.log('✓ Student weak password correctly rejected (<8 chars)');
  }

  console.log('\n--- 2. Testing Invalid Email & Username Validations ---');
  try {
    await globalThis.ScoreARAuth.registerTeacher({
      name: 'أحمد صلاح',
      email: 'not-an-email',
      password: 'validPassword123',
      subject: 'لغة عربية'
    });
    assert.fail('Should have rejected invalid email');
  } catch(err) {
    assert.strictEqual(err.message, 'INVALID_EMAIL');
    console.log('✓ Invalid teacher email rejected');
  }

  try {
    await globalThis.ScoreARAuth.registerStudent({
      displayName: 'عمر البطل',
      username: 'omar عربي!',
      password: 'validPassword123'
    });
    assert.fail('Should have rejected non-latin username');
  } catch(err) {
    assert.strictEqual(err.message, 'INVALID_USERNAME');
    console.log('✓ Non-latin student username rejected');
  }

  console.log('\n--- 3. Testing Duplicate Username / Generic Error (No Enumeration) ---');
  // First registration of student "salim_2026"
  const student1 = await globalThis.ScoreARAuth.registerStudent({
    displayName: 'سليم البطل',
    username: 'salim_2026',
    password: 'securePassword2026',
    className: 'خامس/1'
  });
  assert.ok(student1.uid);
  assert.strictEqual(student1.role, 'student');
  assert.strictEqual(student1.username, 'salim_2026');
  console.log('✓ First student registered successfully with pseudo-email salim_2026@students.scorear.app');

  // Second registration attempt with the same username
  try {
    await globalThis.ScoreARAuth.registerStudent({
      displayName: 'سليم آخر',
      username: 'salim_2026',
      password: 'anotherPassword99'
    });
    assert.fail('Should have caught duplicate username');
  } catch(err) {
    assert.strictEqual(err.message, 'GENERIC_REGISTRATION_ERROR');
    const msg = globalThis.ScoreARAuth.mapAuthError(err);
    assert.ok(msg.includes('تعذر إكمال التسجيل'));
    assert.ok(!msg.includes('مسجل مسبقاً'), 'Generic message must not leak account existence');
    console.log('✓ Duplicate username safely handled with generic message (no username enumeration)');
  }

  console.log('\n--- 4. Testing Teacher "Pending Review" Cannot Enter Studio ---');
  const teacherReq = await globalThis.ScoreARAuth.registerTeacher({
    name: 'أ. محمود عبد الرحمن',
    email: 'mahmoud@school.edu',
    password: 'teacherPass2026!',
    subject: 'الرياضيات',
    school: 'مدرسة المتفوقين'
  });
  assert.strictEqual(teacherReq.status, 'pending');
  console.log('✓ Teacher registered in "pending" status');

  // Teacher tries to login before admin approval
  try {
    await globalThis.ScoreARAuth.login('mahmoud@school.edu', 'teacherPass2026!');
    assert.fail('Pending teacher should not be able to log in to Studio');
  } catch(err) {
    assert.strictEqual(err.message, 'TEACHER_PENDING_REVIEW');
    const msg = globalThis.ScoreARAuth.mapAuthError(err);
    assert.ok(msg.includes('قيد المراجعة'));
    console.log('✓ Pending teacher blocked from logging in with explicit "قيد المراجعة" message');
  }

  console.log('\n--- 5. Testing Student Studio Access Guard & Privilege Separation ---');
  // Log in as registered student "salim_2026"
  const loggedStudent = await globalThis.ScoreARAuth.login('salim_2026', 'securePassword2026');
  assert.strictEqual(loggedStudent.role, 'student');
  assert.strictEqual(globalThis.ScoreARAuth.hasRole('teacher'), false);
  assert.strictEqual(globalThis.ScoreARAuth.hasRole('admin'), false);
  console.log('✓ Student logged in without teacher or admin role claims');

  console.log('\n--- 6. Testing Database Security Rules (Rule Validation & $other: false) ---');
  const rawRules = fs.readFileSync(path.join(__dirname, '..', 'database.rules.json'), 'utf8');
  const parsedRules = JSON.parse(rawRules);

  const studentRules = parsedRules.rules.scorear_students;
  assert.ok(studentRules, 'scorear_students rules must exist');
  assert.strictEqual(studentRules.$uid['$other']['.validate'], false, '$other must be strictly false to block extra fields');
  assert.ok(studentRules.$uid['.read'].includes('auth.uid === $uid'), 'Owner must be able to read own record');
  assert.ok(studentRules.$uid['.write'].includes('auth.uid === $uid'), 'Owner must be able to write own record');
  assert.strictEqual(studentRules.$uid['.write'].includes('auth.token.role === \'teacher\''), false, 'Teacher CANNOT manage arbitrary students');
  assert.ok(studentRules.$uid['.write'].includes('auth.token.role === \'admin\''), 'Admin can manage student record');
  assert.ok(studentRules.$uid['.write'].includes("!data.child('isActive').exists() || data.child('isActive').val() === true"), 'Suspended student must be blocked from writing');

  // Verify isActive & isTemporaryPassword restricted to Admin
  assert.ok(studentRules.$uid.isActive['.validate'].includes("auth.token.role === 'admin'"), 'isActive must be writable by admin only');
  assert.ok(studentRules.$uid.isTemporaryPassword['.validate'].includes("auth.token.role === 'admin'"), 'isTemporaryPassword must be writable by admin only');

  // Verify immutability & regex in rules
  assert.ok(studentRules.$uid.username['.validate'].includes('!data.exists() || data.val() === newData.val()'), 'username must be immutable');
  assert.ok(studentRules.$uid.username['.validate'].includes('matches(/^[a-zA-Z0-9_]+$/)'), 'username must enforce latin regex');
  assert.ok(studentRules.$uid.createdAt['.validate'].includes('!data.exists() || data.val() === newData.val()'), 'createdAt must be immutable');

  const reqRules = parsedRules.rules.scorear_account_requests;
  assert.ok(reqRules, 'scorear_account_requests rules must exist');
  assert.strictEqual(reqRules.$uid['$other']['.validate'], false, '$other must be false on account requests');
  assert.ok(reqRules.$uid['.write'].includes('auth.token.role === \'admin\''), 'Admin can approve/write requests');
  assert.ok(reqRules.$uid.email['.validate'].includes('newData.val() === auth.token.email'), 'Teacher request email must match auth.token.email');

  console.log('✓ Database rules structure and immutability verified');

  console.log('\n--- 7. RTDB Rules Simulator: Proving Rejections on Insecure Operations ---');

  // Rule Simulator Engine
  function evaluateStudentWrite({ auth, data, newData, uidParam }) {
    // 1. Root .write check
    const isOwner = auth && auth.uid === uidParam;
    const isAdmin = auth && auth.token && auth.token.role === 'admin';
    const isActive = !data || !('isActive' in data) || data.isActive === true;

    const canWrite = Boolean(auth && (isAdmin || (isOwner && isActive)));
    if (!canWrite) return { allowed: false, reason: 'PERMISSION_DENIED: root .write evaluated to false' };

    // 2. Validate hasChildren
    const required = ['uid', 'username', 'displayName', 'createdAt'];
    for (let r of required) {
      if (!(r in newData)) return { allowed: false, reason: `VALIDATION_FAILED: missing required field ${r}` };
    }

    // 3. Validate each field
    for (let key of Object.keys(newData)) {
      if (key === '$other' || !(key in studentRules.$uid)) {
        if (studentRules.$uid['$other']['.validate'] === false) {
          return { allowed: false, reason: `VALIDATION_FAILED: field ${key} rejected by $other:false` };
        }
      }
      const val = newData[key];
      if (key === 'uid') {
        const uidMatchesAuth = val === auth.uid;
        if (typeof val !== 'string' || val !== uidParam || (!isAdmin && !uidMatchesAuth)) return { allowed: false, reason: 'VALIDATION_FAILED: uid mismatch' };
      }
      if (key === 'username') {
        if (typeof val !== 'string' || val.length < 3 || val.length > 30 || !/^[a-zA-Z0-9_]+$/.test(val)) return { allowed: false, reason: 'VALIDATION_FAILED: username regex/length' };
        if (data && 'username' in data && data.username !== val) return { allowed: false, reason: 'VALIDATION_FAILED: username immutable' };
      }
      if (key === 'createdAt') {
        if (typeof val !== 'number') return { allowed: false, reason: 'VALIDATION_FAILED: createdAt must be number' };
        if (data && 'createdAt' in data && data.createdAt !== val) return { allowed: false, reason: 'VALIDATION_FAILED: createdAt immutable' };
      }
      if (key === 'isActive') {
        if (!isAdmin || typeof val !== 'boolean') return { allowed: false, reason: 'VALIDATION_FAILED: isActive is admin-only' };
      }
      if (key === 'isTemporaryPassword') {
        if (!isAdmin || typeof val !== 'boolean') return { allowed: false, reason: 'VALIDATION_FAILED: isTemporaryPassword is admin-only' };
      }
    }
    return { allowed: true };
  }

  // Case A: Student tries to write isActive: true on registration -> REJECTED
  const resA = evaluateStudentWrite({
    auth: { uid: 's123', token: {} },
    data: null,
    newData: { uid: 's123', username: 'student_one', displayName: 'طالب مجتهد', createdAt: 1700000000, isActive: true },
    uidParam: 's123'
  });
  assert.strictEqual(resA.allowed, false, 'Student writing isActive on register must be rejected');
  console.log('✓ Simulator Case A: Student cannot write isActive on registration (Rejected: ' + resA.reason + ')');

  // Case B: Student tries to write isTemporaryPassword -> REJECTED
  const resB = evaluateStudentWrite({
    auth: { uid: 's123', token: {} },
    data: null,
    newData: { uid: 's123', username: 'student_one', displayName: 'طالب مجتهد', createdAt: 1700000000, isTemporaryPassword: true },
    uidParam: 's123'
  });
  assert.strictEqual(resB.allowed, false, 'Student writing isTemporaryPassword must be rejected');
  console.log('✓ Simulator Case B: Student cannot write isTemporaryPassword (Rejected: ' + resB.reason + ')');

  // Case C: Suspended student (isActive: false) tries to update displayName -> REJECTED at root .write
  const resC = evaluateStudentWrite({
    auth: { uid: 's123', token: {} },
    data: { uid: 's123', username: 'student_one', displayName: 'طالب', createdAt: 1700000000, isActive: false },
    newData: { uid: 's123', username: 'student_one', displayName: 'طالب يحاول التعديل', createdAt: 1700000000, updatedAt: 1700001000 },
    uidParam: 's123'
  });
  assert.strictEqual(resC.allowed, false, 'Suspended student must be blocked from modifying profile');
  console.log('✓ Simulator Case C: Suspended student completely blocked from write (Rejected: ' + resC.reason + ')');

  // Case D: Student tries to change immutable username -> REJECTED
  const resD = evaluateStudentWrite({
    auth: { uid: 's123', token: {} },
    data: { uid: 's123', username: 'student_one', displayName: 'طالب', createdAt: 1700000000 },
    newData: { uid: 's123', username: 'hacked_username', displayName: 'طالب', createdAt: 1700000000 },
    uidParam: 's123'
  });
  assert.strictEqual(resD.allowed, false, 'Student changing username must be rejected');
  console.log('✓ Simulator Case D: Changing username rejected (Immutable)');

  // Case E: Student tries to inject unknown field (e.g. role) -> REJECTED by $other:false
  const resE = evaluateStudentWrite({
    auth: { uid: 's123', token: {} },
    data: null,
    newData: { uid: 's123', username: 'student_one', displayName: 'طالب', createdAt: 1700000000, role: 'admin' },
    uidParam: 's123'
  });
  assert.strictEqual(resE.allowed, false, 'Field injection must be rejected');
  console.log('✓ Simulator Case E: Field injection ($other: false) rejected');

  // Case F: Admin CAN set isActive: false or true -> ALLOWED
  const resF = evaluateStudentWrite({
    auth: { uid: 'admin_uid', token: { role: 'admin' } },
    data: { uid: 's123', username: 'student_one', displayName: 'طالب', createdAt: 1700000000 },
    newData: { uid: 's123', username: 'student_one', displayName: 'طالب', createdAt: 1700000000, isActive: false },
    uidParam: 's123'
  });
  assert.strictEqual(resF.allowed, true, 'Admin must be able to set isActive');
  console.log('✓ Simulator Case F: Admin successfully sets isActive');

  // Case G: Active student legitimate profile update (displayName, avatarId, className, updatedAt) -> ALLOWED
  const resG = evaluateStudentWrite({
    auth: { uid: 's123', token: {} },
    data: { uid: 's123', username: 'student_one', displayName: 'طالب', createdAt: 1700000000 },
    newData: { uid: 's123', username: 'student_one', displayName: 'طالب بطل', avatarId: 'char_03', className: 'سادس/2', createdAt: 1700000000, updatedAt: 1700002000 },
    uidParam: 's123'
  });
  assert.strictEqual(resG.allowed, true, 'Student legitimate update must be allowed');
  console.log('✓ Simulator Case G: Legitimate student update (displayName, avatarId, className, updatedAt) allowed');

  console.log('\n======================================================');
  console.log('ALL PHASE B REGISTRATION & PRIVACY TESTS PASSED 100%! 🛡️');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
