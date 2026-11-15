/**
 * ScoreAR Official Firebase Rules Unit Testing Suite
 * Executes against official Firebase Realtime Database Emulator on port 9000
 * Proves 100% genuine Firebase PERMISSION_DENIED / 200 OK for every single hardened rule.
 */
const assert = require('assert');

const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1:9000';
const ns = 'scorear2-default-rtdb';

function makeJwt(claims) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'https://securetoken.google.com/scorear2',
    aud: 'scorear2',
    auth_time: now,
    user_id: claims.uid,
    sub: claims.uid,
    iat: now,
    exp: now + 3600,
    email: claims.email || `${claims.uid}@scorear.app`,
    email_verified: true,
    firebase: { identities: {}, sign_in_provider: 'custom' },
    ...claims
  })).toString('base64url');
  return `${header}.${payload}.`;
}

// Emulated Users
const studentUid = 'student_test_user_99';
const studentToken = makeJwt({ uid: studentUid, email: `${studentUid}@students.scorear.app` });

const student2Uid = 'student_intruder_user_88';
const student2Token = makeJwt({ uid: student2Uid, email: `${student2Uid}@students.scorear.app` });

const teacherUid = 'teacher_test_user_77';
const teacherToken = makeJwt({ uid: teacherUid, email: 'teacher77@school.edu', role: 'teacher' });

const teacher2Uid = 'teacher_intruder_user_66';
const teacher2Token = makeJwt({ uid: teacher2Uid, email: 'teacher66@school.edu', role: 'teacher' });

const adminUid = 'admin_super_user_01';
const adminToken = makeJwt({ uid: adminUid, email: 'admin@scorear.app', role: 'admin' });

async function req(path, { method = 'GET', token, body, query = '' } = {}) {
  let url = `http://${host}/${path}.json?ns=${ns}`;
  if (token) url += `&auth=${token}`;
  if (query) url += `&${query}`;

  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  let data = null;
  const text = await res.text();
  try { data = JSON.parse(text); } catch(e) { data = text; }
  return { status: res.status, data };
}

async function runTestSuite() {
  console.log('=================================================================');
  console.log('   SCOREAR OFFICIAL FIREBASE REALTIME DATABASE RULES UNIT TESTS');
  console.log('   Running on Real Firebase RTDB Emulator:', host, '(Namespace:', ns, ')');
  console.log('=================================================================');

  // --- ITEM 1: scorear_ai_quotas (.write: false for all, read owner or admin) ---
  console.log('\n--- 1. Testing scorear_ai_quotas ---');
  const r1A = await req(`scorear_ai_quotas/${studentUid}`, { method: 'PUT', token: studentToken, body: { quota: 999 } });
  assert.strictEqual(r1A.status, 401, 'Student writing quota must be rejected');
  console.log('✓ 1A (REJECT): Client write to scorear_ai_quotas blocked (401 Permission denied)');

  const r1B = await req(`scorear_ai_quotas/${studentUid}`, { method: 'GET', token: studentToken });
  assert.strictEqual(r1B.status, 200, 'Owner must be able to read own quota');
  console.log('✓ 1B (ALLOW): Owner successfully reads own quota (200 OK)');

  const r1C = await req(`scorear_ai_quotas/${teacherUid}`, { method: 'GET', token: studentToken });
  assert.strictEqual(r1C.status, 401, 'Other user reading quota must be rejected');
  console.log('✓ 1C (REJECT): Reading other user quota blocked (401 Permission denied)');

  // --- ITEM 2: scorear_teachers_registry (.write: false, read query equalTo auth.uid or admin) ---
  console.log('\n--- 2. Testing scorear_teachers_registry ---');
  const r2A = await req(`scorear_teachers_registry/${teacherUid}`, { method: 'PUT', token: teacherToken, body: { status: 'approved' } });
  assert.strictEqual(r2A.status, 401, 'Client writing to registry must be rejected');
  console.log('✓ 2A (REJECT): Client write to scorear_teachers_registry blocked (401 Permission denied)');

  const r2B = await req(`scorear_teachers_registry`, { method: 'GET', token: studentToken });
  assert.strictEqual(r2B.status, 401, 'Student cannot read teacher registry');
  console.log('✓ 2B (REJECT): Student reading teacher registry blocked (401 Permission denied)');

  const r2C = await req(`scorear_teachers_registry`, { method: 'GET', token: teacherToken, query: `orderBy="firebaseUid"&equalTo="${teacherUid}"` });
  assert.strictEqual(r2C.status, 200, 'Teacher must be able to query own registry record');
  console.log('✓ 2C (ALLOW): Teacher queries own registry record by firebaseUid (200 OK)');

  const r2D = await req(`scorear_teachers_registry`, { method: 'GET', token: adminToken });
  assert.strictEqual(r2D.status, 200, 'Admin can read teacher registry');
  console.log('✓ 2D (ALLOW): Admin successfully reads teacher registry (200 OK)');

  // --- ITEM 3: Room Rules (Exhaustive Sub-branch Rejections under rooms/<pin>) ---
  console.log('\n--- 3. Testing Room Rules & Sub-branch Rejections under rooms/<pin> ---');
  // 3.1 PIN regex format validation
  const r3A = await req(`scorear_rooms/12345/evt_1`, { method: 'PUT', token: studentToken, body: { type: 'STUDENT_JOIN', _timestamp: Date.now(), _senderRole: 'student' } });
  assert.strictEqual(r3A.status, 401, 'Non-6-digit PIN "12345" must be rejected');
  console.log('✓ 3.1 (REJECT): Invalid PIN format "12345" rejected (401 Permission denied)');

  const r3B = await req(`scorear_rooms/849201/evt_1`, { method: 'PUT', token: studentToken, body: { type: 'STUDENT_JOIN', _timestamp: Date.now(), _senderRole: 'student', playerName: 'أحمد' } });
  assert.strictEqual(r3B.status, 200, 'Valid event append on 6-digit PIN must succeed');
  console.log('✓ 3.2 (ALLOW): Valid event on 6-digit PIN 849201 appended (200 OK)');

  const r3C = await req(`scorear_rooms/849201/evt_2`, { method: 'PUT', token: studentToken, body: { type: 'STUDENT_JOIN', _timestamp: Date.now(), _senderRole: 'hacker' } });
  assert.strictEqual(r3C.status, 401, 'Event with invalid _senderRole must be rejected');
  console.log('✓ 3.3 (REJECT): Invalid _senderRole="hacker" rejected (401 Permission denied)');

  // 3.2 Root rooms/<pin> write rejection
  const r3D_root = await req(`rooms/849201`, { method: 'PUT', token: studentToken, body: { status: 'hacked' } });
  assert.strictEqual(r3D_root.status, 401, 'Student writing to room root must be rejected');
  console.log('✓ 3.4 (REJECT): Student writing to root rooms/849201 blocked (401 Permission denied)');

  // 3.3 rooms/<pin>/worldId write rejection & read allow
  const r3D_worldW = await req(`rooms/849201/worldId`, { method: 'PUT', token: studentToken, body: 'world_pirate' });
  assert.strictEqual(r3D_worldW.status, 401, 'Student modifying worldId must be rejected');
  console.log('✓ 3.5 (REJECT): Student writing rooms/849201/worldId blocked (401 Permission denied)');

  const r3D_worldR = await req(`rooms/849201/worldId`, { method: 'GET', token: studentToken });
  assert.strictEqual(r3D_worldR.status, 200, 'Student reading worldId must succeed');
  console.log('✓ 3.6 (ALLOW): Student reading rooms/849201/worldId permitted (200 OK)');

  // 3.4 rooms/<pin>/status write rejection & read allow
  const r3D_statusW = await req(`rooms/849201/status`, { method: 'PUT', token: studentToken, body: 'closed' });
  assert.strictEqual(r3D_statusW.status, 401, 'Student modifying status must be rejected');
  console.log('✓ 3.7 (REJECT): Student writing rooms/849201/status blocked (401 Permission denied)');

  const r3D_statusR = await req(`rooms/849201/status`, { method: 'GET', token: studentToken });
  assert.strictEqual(r3D_statusR.status, 200, 'Student reading status must succeed');
  console.log('✓ 3.8 (ALLOW): Student reading rooms/849201/status permitted (200 OK)');

  // 3.5 rooms/<pin>/currentQuestion write rejection & read allow
  const r3D_currW = await req(`rooms/849201/currentQuestion`, { method: 'PUT', token: studentToken, body: 5 });
  assert.strictEqual(r3D_currW.status, 401, 'Student modifying currentQuestion must be rejected');
  console.log('✓ 3.9 (REJECT): Student writing rooms/849201/currentQuestion blocked (401 Permission denied)');

  // 3.6 rooms/<pin>/questionData write rejection & READ REJECTION FOR STUDENTS (Security Fix)
  const r3D_qDataW = await req(`rooms/849201/questionData`, { method: 'PUT', token: studentToken, body: { text: 'سؤال' } });
  assert.strictEqual(r3D_qDataW.status, 401, 'Student writing questionData must be rejected');
  console.log('✓ 3.10 (REJECT): Student writing rooms/849201/questionData blocked (401 Permission denied)');

  const r3D_qDataR_student = await req(`rooms/849201/questionData`, { method: 'GET', token: studentToken });
  assert.strictEqual(r3D_qDataR_student.status, 401, 'Student reading questionData must be rejected');
  console.log('✓ 3.11 (REJECT): Student reading rooms/849201/questionData blocked (401 Permission denied) [FIX VERIFIED]');

  // Teacher write & read on questionData
  const r3D_qDataW_teacher = await req(`rooms/849201/questionData`, { method: 'PUT', token: teacherToken, body: { text: 'ما عاصمة مصر؟', correctAnswer: 0 } });
  assert.strictEqual(r3D_qDataW_teacher.status, 200, 'Teacher must be able to write questionData');
  console.log('✓ 3.12 (ALLOW): Teacher writes questionData with correctAnswer (200 OK)');

  const r3D_qDataR_teacher = await req(`rooms/849201/questionData`, { method: 'GET', token: teacherToken });
  assert.strictEqual(r3D_qDataR_teacher.status, 200, 'Teacher must be able to read questionData');
  console.log('✓ 3.13 (ALLOW): Teacher reads questionData (200 OK)');

  // 3.7 rooms/<pin>/players sub-branch
  // Rejection: Student writes to another student's player node
  const r3E_spoofPlayer = await req(`rooms/849201/players/${student2Uid}`, { method: 'PUT', token: studentToken, body: { id: student2Uid, name: 'منتحل' } });
  assert.strictEqual(r3E_spoofPlayer.status, 401, 'Writing to another player node must be rejected');
  console.log('✓ 3.14 (REJECT): Student spoofing another player node blocked (401 Permission denied)');

  // Rejection: Student writes mismatched id in body
  const r3E_mismatchedId = await req(`rooms/849201/players/${studentUid}`, { method: 'PUT', token: studentToken, body: { id: 'other_id', name: 'أحمد' } });
  assert.strictEqual(r3E_mismatchedId.status, 401, 'Mismatched player id must be rejected');
  console.log('✓ 3.15 (REJECT): Student payload with mismatched id blocked (401 Permission denied)');

  // Rejection: Player name too long (> 40 chars)
  const r3E_longName = await req(`rooms/849201/players/${studentUid}`, { method: 'PUT', token: studentToken, body: { id: studentUid, name: 'أ'.repeat(45) } });
  assert.strictEqual(r3E_longName.status, 401, 'Player name exceeding 40 chars must be rejected');
  console.log('✓ 3.16 (REJECT): Player name > 40 characters blocked (401 Permission denied)');

  // Rejection: Injected extra fields ($other: false)
  const r3E_extraField = await req(`rooms/849201/players/${studentUid}`, { method: 'PUT', token: studentToken, body: { id: studentUid, name: 'أحمد', adminRights: true } });
  assert.strictEqual(r3E_extraField.status, 401, 'Injected fields in player record must be rejected');
  console.log('✓ 3.17 (REJECT): Player record field injection blocked by $other:false (401 Permission denied)');

  // Allow: Legitimate player join
  const r3E_legitPlayer = await req(`rooms/849201/players/${studentUid}`, { method: 'PUT', token: studentToken, body: { id: studentUid, name: 'أحمد صلاح' } });
  assert.strictEqual(r3E_legitPlayer.status, 200, 'Student joining room must succeed');
  console.log('✓ 3.18 (ALLOW): Student successfully joined room at players/studentUid (200 OK)');

  // 3.8 rooms/<pin>/answers sub-branch
  // Rejection: Student reading answers collection
  const r3F_answersRead = await req(`rooms/849201/answers`, { method: 'GET', token: studentToken });
  assert.strictEqual(r3F_answersRead.status, 401, 'Student reading answers collection must be rejected');
  console.log('✓ 3.19 (REJECT): Student reading room answers blocked (401 Permission denied)');

  // Allow: Teacher reading answers collection
  const r3F_answersReadTeacher = await req(`rooms/849201/answers`, { method: 'GET', token: teacherToken });
  assert.strictEqual(r3F_answersReadTeacher.status, 200, 'Teacher reading answers collection must succeed');
  console.log('✓ 3.20 (ALLOW): Teacher successfully reads room answers (200 OK)');

  // Rejection: Student spoofing another student's answer node
  const r3F_spoofAnswer = await req(`rooms/849201/answers/0/${student2Uid}`, { method: 'PUT', token: studentToken, body: { optionIndex: 1, ts: Date.now() } });
  assert.strictEqual(r3F_spoofAnswer.status, 401, 'Submitting answer for another player must be rejected');
  console.log('✓ 3.21 (REJECT): Student submitting answer for another student blocked (401 Permission denied)');

  // Allow: Student submits legitimate answer
  const r3F_legitAnswer = await req(`rooms/849201/answers/0/${studentUid}`, { method: 'PUT', token: studentToken, body: { optionIndex: 2, ts: Date.now() } });
  assert.strictEqual(r3F_legitAnswer.status, 200, 'Student submitting answer must succeed');
  console.log('✓ 3.22 (ALLOW): Student submits valid answer to answers/0/studentUid (200 OK)');

  // Rejection: Student overwriting already submitted answer (!data.exists())
  const r3F_overwriteAnswer = await req(`rooms/849201/answers/0/${studentUid}`, { method: 'PUT', token: studentToken, body: { optionIndex: 3, ts: Date.now() } });
  assert.strictEqual(r3F_overwriteAnswer.status, 401, 'Overwriting existing answer must be rejected');
  console.log('✓ 3.23 (REJECT): Student overwriting already submitted answer blocked (401 Permission denied)');

  // Rejection: Answer with injected extra fields ($other: false)
  const r3F_extraAnswerField = await req(`rooms/849201/answers/1/${studentUid}`, { method: 'PUT', token: studentToken, body: { optionIndex: 1, ts: Date.now(), cheatScore: 100 } });
  assert.strictEqual(r3F_extraAnswerField.status, 401, 'Answer with extra fields must be rejected');
  console.log('✓ 3.24 (REJECT): Answer with extra fields blocked by $other:false (401 Permission denied)');

  // --- ITEM 4: scorear_quizzes (Cross-Teacher Protection & ownerUid Immutability) ---
  console.log('\n--- 4. Testing scorear_quizzes, Cross-Teacher Protection & ownerUid Immutability ---');
  // 4A (REJECT): Student tries to create quiz
  const r4A = await req(`scorear_quizzes/quiz_teacher1`, { method: 'PUT', token: studentToken, body: { title: 'اختبار غير مصرح', ownerUid: studentUid, createdAt: Date.now() } });
  assert.strictEqual(r4A.status, 401, 'Student cannot create quiz');
  console.log('✓ 4A (REJECT): Student creating quiz blocked (401 Permission denied)');

  // 4B (ALLOW): Teacher A creates quiz with ownerUid === auth.uid
  const r4B = await req(`scorear_quizzes/quiz_teacher1`, { method: 'PUT', token: teacherToken, body: { title: 'اختبار النحو العربي', ownerUid: teacherUid, createdAt: Date.now() } });
  assert.strictEqual(r4B.status, 200, 'Teacher A must be able to create own quiz');
  console.log('✓ 4B (ALLOW): Teacher A creates quiz quiz_teacher1 with matching ownerUid (200 OK)');

  // 4C (REJECT): Teacher B tries to modify or overwrite Teacher A's quiz
  const r4C = await req(`scorear_quizzes/quiz_teacher1`, { method: 'PUT', token: teacher2Token, body: { title: 'محاولة تعديل اختراق', ownerUid: teacher2Uid, createdAt: Date.now() } });
  assert.strictEqual(r4C.status, 401, 'Teacher B modifying Teacher A quiz must be rejected');
  console.log('✓ 4C (REJECT): Teacher B modifying Teacher A quiz blocked (401 Permission denied)');

  // 4D (REJECT): Teacher B tries to delete Teacher A's quiz
  const r4D = await req(`scorear_quizzes/quiz_teacher1`, { method: 'DELETE', token: teacher2Token });
  assert.strictEqual(r4D.status, 401, 'Teacher B deleting Teacher A quiz must be rejected');
  console.log('✓ 4D (REJECT): Teacher B deleting Teacher A quiz blocked (401 Permission denied)');

  // 4E (REJECT): Teacher A tries to alter ownerUid to Teacher B
  const r4E = await req(`scorear_quizzes/quiz_teacher1`, { method: 'PUT', token: teacherToken, body: { title: 'اختبار النحو العربي معدل', ownerUid: teacher2Uid, createdAt: Date.now() } });
  assert.strictEqual(r4E.status, 401, 'Altering ownerUid of existing quiz must be rejected');
  console.log('✓ 4E (REJECT): Teacher A altering ownerUid on existing quiz blocked (401 Permission denied)');

  // 4F (REJECT): Teacher B tries to create a new quiz but puts Teacher A's ownerUid
  const r4F = await req(`scorear_quizzes/quiz_spoofed_owner`, { method: 'PUT', token: teacher2Token, body: { title: 'اختبار منتحل', ownerUid: teacherUid, createdAt: Date.now() } });
  assert.strictEqual(r4F.status, 401, 'Creating quiz with another user ownerUid must be rejected');
  console.log('✓ 4F (REJECT): Teacher B creating quiz with Teacher A ownerUid blocked (401 Permission denied)');

  // 4G (ALLOW): Teacher A legitimately updates own quiz title preserving ownerUid
  const r4G = await req(`scorear_quizzes/quiz_teacher1`, { method: 'PUT', token: teacherToken, body: { title: 'اختبار النحو العربي المطور', ownerUid: teacherUid, createdAt: Date.now() } });
  assert.strictEqual(r4G.status, 200, 'Teacher A legitimately updating own quiz must succeed');
  console.log('✓ 4G (ALLOW): Teacher A updates own quiz title while keeping ownerUid (200 OK)');

  // 4H (ALLOW): Teacher A queries own quizzes
  const r4H = await req(`scorear_quizzes`, { method: 'GET', token: teacherToken, query: `orderBy="ownerUid"&equalTo="${teacherUid}"` });
  assert.strictEqual(r4H.status, 200, 'Teacher querying own quizzes must succeed');
  console.log('✓ 4H (ALLOW): Teacher queries own quizzes by ownerUid (200 OK)');

  // 4I (REJECT): Teacher unconstrained read on entire quizzes collection
  const r4I = await req(`scorear_quizzes`, { method: 'GET', token: teacherToken });
  assert.strictEqual(r4I.status, 401, 'Teacher unconstrained read must be rejected');
  console.log('✓ 4I (REJECT): Teacher unconstrained read without query filter blocked (401 Permission denied)');

  // --- ITEM 5: scorear_admin_notifications (.write: false for client) ---
  console.log('\n--- 5. Testing scorear_admin_notifications ---');
  const r5A = await req(`scorear_admin_notifications/notif_99`, { method: 'PUT', token: teacherToken, body: { id: 'notif_99', type: 'test' } });
  assert.strictEqual(r5A.status, 401, 'Client write to admin notifications must be rejected');
  console.log('✓ 5A (REJECT): Client write to admin notifications blocked (401 Permission denied)');

  const r5B = await req(`scorear_admin_notifications`, { method: 'GET', token: adminToken });
  assert.strictEqual(r5B.status, 200, 'Admin can read notifications');
  console.log('✓ 5B (ALLOW): Admin reads notifications (200 OK)');

  // --- ITEM 6: scorear_completed_sessions (Teacher query by ownerUid, Admin full) ---
  console.log('\n--- 6. Testing scorear_completed_sessions ---');
  const r6A = await req(`scorear_completed_sessions`, { method: 'GET', token: teacherToken, query: `orderBy="ownerUid"&equalTo="${teacherUid}"` });
  assert.strictEqual(r6A.status, 200, 'Teacher querying own completed sessions must succeed');
  console.log('✓ 6A (ALLOW): Teacher queries completed sessions by ownerUid (200 OK)');

  const r6B = await req(`scorear_completed_sessions`, { method: 'GET', token: teacherToken });
  assert.strictEqual(r6B.status, 401, 'Teacher unconstrained read on completed sessions must be rejected');
  console.log('✓ 6B (REJECT): Teacher unconstrained read on completed sessions blocked (401 Permission denied)');

  // --- ITEM 7: scorear_students & account_requests (Root admin read, student fields security) ---
  console.log('\n--- 7. Testing scorear_students & account_requests ---');
  const r7A = await req(`scorear_students/${studentUid}`, {
    method: 'PUT',
    token: studentToken,
    body: { uid: studentUid, username: 'student_99', displayName: 'طالب بطل', createdAt: Date.now(), isActive: true }
  });
  assert.strictEqual(r7A.status, 401, 'Student writing isActive must be rejected');
  console.log('✓ 7A (REJECT): Student writing isActive rejected (401 Permission denied)');

  const r7B = await req(`scorear_students/${studentUid}`, {
    method: 'PUT',
    token: studentToken,
    body: { uid: studentUid, username: 'student_99', displayName: 'طالب بطل', createdAt: Date.now(), isTemporaryPassword: true }
  });
  assert.strictEqual(r7B.status, 401, 'Student writing isTemporaryPassword must be rejected');
  console.log('✓ 7B (REJECT): Student writing isTemporaryPassword rejected (401 Permission denied)');

  const r7C = await req(`scorear_students/${studentUid}`, {
    method: 'PUT',
    token: studentToken,
    body: { uid: studentUid, username: 'student_99', displayName: 'طالب بطل', createdAt: Date.now(), role: 'admin' }
  });
  assert.strictEqual(r7C.status, 401, 'Student injecting unknown field rejected by $other:false');
  console.log('✓ 7C (REJECT): Field injection role="admin" rejected by $other:false (401 Permission denied)');

  const r7D = await req(`scorear_students/${studentUid}`, {
    method: 'PUT',
    token: studentToken,
    body: { uid: studentUid, username: 'student_99', displayName: 'طالب بطل', className: 'خامس/1', avatarId: 'char_01', createdAt: Date.now() }
  });
  assert.strictEqual(r7D.status, 200, 'Student valid registration profile must succeed');
  console.log('✓ 7D (ALLOW): Student legitimate registration profile created (200 OK)');

  const r7E = await req(`scorear_students`, { method: 'GET', token: studentToken });
  assert.strictEqual(r7E.status, 401, 'Student reading root students list must be rejected');
  console.log('✓ 7E (REJECT): Student reading root scorear_students blocked (401 Permission denied)');

  const r7F = await req(`scorear_students`, { method: 'GET', token: adminToken });
  assert.strictEqual(r7F.status, 200, 'Admin must be able to read root students list');
  console.log('✓ 7F (ALLOW): Admin reads root scorear_students for Phase E (200 OK)');

  const r7G = await req(`scorear_account_requests`, { method: 'GET', token: adminToken });
  assert.strictEqual(r7G.status, 200, 'Admin must be able to read root account requests');
  console.log('✓ 7G (ALLOW): Admin reads root scorear_account_requests for Phase E (200 OK)');

  const r7H = await req(`scorear_account_requests/${teacherUid}`, {
    method: 'PUT',
    token: teacherToken,
    body: { uid: teacherUid, email: 'fake_email@other.org', displayName: 'معلم', status: 'pending', createdAt: Date.now() }
  });
  assert.strictEqual(r7H.status, 401, 'Teacher request with mismatched email must be rejected');
  console.log('✓ 7H (REJECT): Teacher request with mismatched email rejected (401 Permission denied)');

  const r7I = await req(`scorear_account_requests/${teacherUid}`, {
    method: 'PUT',
    token: teacherToken,
    body: { uid: teacherUid, email: 'teacher77@school.edu', displayName: 'معلم', status: 'approved', createdAt: Date.now() }
  });
  assert.strictEqual(r7I.status, 401, 'Teacher self-approving request must be rejected');
  console.log('✓ 7I (REJECT): Teacher self-approving status="approved" rejected (401 Permission denied)');

  const r7J = await req(`scorear_account_requests/${teacherUid}`, {
    method: 'PUT',
    token: teacherToken,
    body: { uid: teacherUid, email: 'teacher77@school.edu', displayName: 'أ. أحمد المعلم', subject: 'لغة عربية', school: 'الأوائل', status: 'pending', createdAt: Date.now() }
  });
  assert.strictEqual(r7J.status, 200, 'Legitimate teacher request must succeed');
  console.log('✓ 7J (ALLOW): Teacher submits legitimate pending request (200 OK)');

  console.log('\n=================================================================');
  console.log('ALL FIREBASE EMULATOR SECURITY RULES TESTS PASSED (100%)! 🛡️🔥');
  console.log('=================================================================');
}

runTestSuite().catch(err => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
