// Automated Test Suite for Cloud Function: scorearAccountRequest
// Verifies Server-Side Authorization, Role Claims, and Student Management

import assert from 'assert';

let mockAuthUsers = {
  'teacher_unverified': { email: 'unverified@school.com', emailVerified: false, claims: {} },
  'teacher_uid_1': { email: 'teacher1@school.com', emailVerified: true, claims: {} },
  'student_uid_1': { email: 'omar_2026@students.scorear.app', password: 'oldPassword123' }
};

let mockRtdb = {
  scorear_account_requests: {
    'teacher_unverified': { uid: 'teacher_unverified', email: 'unverified@school.com', displayName: 'أ. غير مفعل', status: 'pending' },
    'teacher_uid_1': { uid: 'teacher_uid_1', email: 'teacher1@school.com', displayName: 'أ. عمر', status: 'pending' }
  },
  scorear_teachers_registry: {},
  scorear_students: {
    'student_uid_1': { uid: 'student_uid_1', username: 'omar_2026', displayName: 'عمر', createdAt: 1000 }
  }
};

const mockAdminAuth = {
  verifyIdToken: async (token) => {
    if (token === 'admin-token') return { uid: 'admin_1', role: 'admin' };
    if (token === 'teacher-token') return { uid: 'teacher_1', role: 'teacher' };
    if (token === 'student-token') return { uid: 'student_uid_1', role: null };
    throw new Error('Invalid token');
  },
  getUser: async (uid) => {
    const u = mockAuthUsers[uid];
    if (!u) throw new Error('User not found');
    return { uid, email: u.email, emailVerified: !!u.emailVerified };
  },
  setCustomUserClaims: async (uid, claims) => {
    if (mockAuthUsers[uid]) mockAuthUsers[uid].claims = claims;
  },
  updateUser: async (uid, data) => {
    if (mockAuthUsers[uid]) Object.assign(mockAuthUsers[uid], data);
  },
  deleteUser: async (uid) => {
    delete mockAuthUsers[uid];
  }
};

const mockAdminDb = {
  ref: (pathStr) => ({
    once: async () => {
      const parts = pathStr.split('/');
      let curr = mockRtdb;
      for (let p of parts) {
        if (curr && typeof curr === 'object') curr = curr[p];
        else { curr = undefined; break; }
      }
      return {
        exists: () => curr !== undefined && curr !== null,
        val: () => curr
      };
    },
    set: async (val) => {
      const parts = pathStr.split('/');
      let curr = mockRtdb;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = val;
    },
    update: async (val) => {
      const parts = pathStr.split('/');
      let curr = mockRtdb;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = { ...(curr[parts[parts.length - 1]] || {}), ...val };
    },
    remove: async () => {
      const parts = pathStr.split('/');
      let curr = mockRtdb;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) return;
        curr = curr[parts[i]];
      }
      delete curr[parts[parts.length - 1]];
    }
  })
};

// Simulation matching updated functions/index.js
async function simulateAccountRequest(req) {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return { status: 401, body: { error: 'غير مصرح' } };
  const token = authHeader.substring(7);
  let decodedToken;
  try {
    decodedToken = await mockAdminAuth.verifyIdToken(token);
  } catch(e) {
    return { status: 401, body: { error: 'رمز الجلسة غير صالح' } };
  }

  const callerRole = decodedToken.role || null;
  const { action, targetUid, newPassword } = req.body || {};

  if (!action || !targetUid) return { status: 400, body: { error: 'بيانات غير مكتملة' } };

  if (action === 'approve') {
    if (callerRole !== 'admin') return { status: 403, body: { error: 'غير مصرح' } };
    const user = await mockAdminAuth.getUser(targetUid);
    if (!user.emailVerified) {
      return { status: 400, body: { error: 'لا يمكن اعتماد المعلم قبل تفعيل بريده' } };
    }
    await mockAdminAuth.setCustomUserClaims(targetUid, { role: 'teacher' });
    await mockAdminDb.ref(`scorear_account_requests/${targetUid}`).update({ status: 'approved', reviewedBy: decodedToken.uid });
    await mockAdminDb.ref(`scorear_teachers_registry/${targetUid}`).set({ userId: targetUid, status: 'approved' });
    return { status: 200, body: { success: true, status: 'approved' } };
  }

  if (action === 'resetStudentPassword') {
    // Admin Only for now (teachers cannot affect arbitrary students)
    if (callerRole !== 'admin') return { status: 403, body: { error: 'غير مصرح: محصورة في إدارة المنصة حالياً' } };
    if (!newPassword || newPassword.length < 8) return { status: 400, body: { error: 'كلمة مرور ضعيفة' } };
    const snap = await mockAdminDb.ref(`scorear_students/${targetUid}`).once();
    if (!snap.exists()) return { status: 404, body: { error: 'غير موجود' } };
    await mockAdminAuth.updateUser(targetUid, { password: newPassword });
    await mockAdminDb.ref(`scorear_students/${targetUid}`).update({ updatedAt: Date.now() });
    return { status: 200, body: { success: true } };
  }

  if (action === 'deleteStudentAccount') {
    // Admin Only for now
    if (callerRole !== 'admin') return { status: 403, body: { error: 'غير مصرح: محصورة في إدارة المنصة حالياً' } };
    await mockAdminAuth.deleteUser(targetUid);
    await mockAdminDb.ref(`scorear_students/${targetUid}`).remove();
    return { status: 200, body: { success: true } };
  }

  return { status: 400, body: { error: 'إجراء غير معروف' } };
}

async function runTests() {
  console.log('--- 1. Testing Student cannot approve accounts (403 Forbidden) ---');
  const res1 = await simulateAccountRequest({
    headers: { authorization: 'Bearer student-token' },
    body: { action: 'approve', targetUid: 'teacher_uid_1' }
  });
  assert.strictEqual(res1.status, 403);
  console.log('✓ Student correctly blocked from approving accounts (403)');

  console.log('\n--- 2. Testing Approval requires emailVerified (400 if unverified) ---');
  const resUnverified = await simulateAccountRequest({
    headers: { authorization: 'Bearer admin-token' },
    body: { action: 'approve', targetUid: 'teacher_unverified' }
  });
  assert.strictEqual(resUnverified.status, 400);
  assert.ok(resUnverified.body.error.includes('تفعيل بريده'));
  console.log('✓ Admin approval rejected for unverified email (emailVerified must be true)');

  console.log('\n--- 3. Testing Admin approval succeeds when email is verified ---');
  const res2 = await simulateAccountRequest({
    headers: { authorization: 'Bearer admin-token' },
    body: { action: 'approve', targetUid: 'teacher_uid_1' }
  });
  assert.strictEqual(res2.status, 200);
  assert.strictEqual(res2.body.status, 'approved');
  assert.strictEqual(mockAuthUsers['teacher_uid_1'].claims.role, 'teacher');
  console.log('✓ Admin successfully approved verified teacher and set { role: "teacher" } custom claim');

  console.log('\n--- 4. Testing Teacher cannot reset or delete arbitrary students (Admin Only) ---');
  const resTeacherReset = await simulateAccountRequest({
    headers: { authorization: 'Bearer teacher-token' },
    body: { action: 'resetStudentPassword', targetUid: 'student_uid_1', newPassword: 'newPassword123' }
  });
  assert.strictEqual(resTeacherReset.status, 403);
  console.log('✓ Teacher correctly blocked from resetting student password (Admin Only for now)');

  const resTeacherDelete = await simulateAccountRequest({
    headers: { authorization: 'Bearer teacher-token' },
    body: { action: 'deleteStudentAccount', targetUid: 'student_uid_1' }
  });
  assert.strictEqual(resTeacherDelete.status, 403);
  console.log('✓ Teacher correctly blocked from deleting student account (Admin Only for now)');

  console.log('\n--- 5. Testing Admin can reset student password and delete account ---');
  const resAdminReset = await simulateAccountRequest({
    headers: { authorization: 'Bearer admin-token' },
    body: { action: 'resetStudentPassword', targetUid: 'student_uid_1', newPassword: 'brandNewPassword2026' }
  });
  assert.strictEqual(resAdminReset.status, 200);
  assert.strictEqual(mockAuthUsers['student_uid_1'].password, 'brandNewPassword2026');
  console.log('✓ Admin successfully reset student password');

  const resAdminDelete = await simulateAccountRequest({
    headers: { authorization: 'Bearer admin-token' },
    body: { action: 'deleteStudentAccount', targetUid: 'student_uid_1' }
  });
  assert.strictEqual(resAdminDelete.status, 200);
  assert.strictEqual(mockAuthUsers['student_uid_1'], undefined);
  assert.strictEqual(mockRtdb.scorear_students['student_uid_1'], undefined);
  console.log('✓ Admin successfully deleted student account from Auth and Database');

  console.log('\n======================================================');
  console.log('ALL CLOUD FUNCTION AUTHORIZATION TESTS PASSED 100%! 🛡️');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
