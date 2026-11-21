import { authenticate, cors, failure, validKey } from '../lib/server/firebase.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    const { auth, db, user } = await authenticate(req, ['admin']);
    const { action, targetUid, newPassword, note = '', isActive, uids } = req.body || {};
    const actions = ['approve', 'reject', 'toggleTeacherStatus', 'deleteTeacher', 'toggleStudentStatus', 'resetStudentPassword', 'deleteStudentAccount', 'getEmailStatuses'];
    if (!actions.includes(action)) return res.status(400).json({ error: 'إجراء أو بيانات غير صالحة.' });
    if (action === 'getEmailStatuses') {
      const cleanUids = Array.isArray(uids) ? [...new Set(uids.filter(validKey))].slice(0, 100) : null;
      if (!cleanUids) return res.status(400).json({ error: 'قائمة المعرفات غير صالحة.' });
      const statuses = {};
      if (typeof auth.getUsers === 'function') {
        const result = cleanUids.length ? await auth.getUsers(cleanUids.map(uid => ({ uid }))) : { users: [] };
        (result?.users || []).forEach(u => { statuses[u.uid] = { emailVerified: Boolean(u.emailVerified), email: u.email || '' }; });
      } else {
        await Promise.all(cleanUids.map(async uid => {
          try { const u = await auth.getUser(uid); statuses[uid] = { emailVerified: Boolean(u.emailVerified), email: u.email || '' }; } catch {}
        }));
      }
      return res.status(200).json({ success: true, statuses });
    }
    if (!validKey(targetUid) || typeof note !== 'string' || note.length > 1000) return res.status(400).json({ error: 'إجراء أو بيانات غير صالحة.' });
    if (targetUid === user.uid) return res.status(403).json({ error: 'لا يمكن تعديل حسابك الإداري بهذه العملية.' });
    const target = await auth.getUser(targetUid);
    if (target.customClaims?.role === 'admin') return res.status(403).json({ error: 'لا يمكن تعديل حساب مدير بهذه العملية.' });
    const now = Date.now();
    const setRole = async role => {
      const claims = { ...(target.customClaims || {}) };
      if (role) claims.role = role; else delete claims.role;
      await auth.setCustomUserClaims(targetUid, claims);
      await auth.revokeRefreshTokens(targetUid);
    };
    if (action === 'deleteTeacher') {
      await auth.deleteUser(targetUid).catch(() => {});
      await db.ref().update({
        [`scorear_account_requests/${targetUid}`]: null,
        [`scorear_teachers_registry/${targetUid}`]: null
      });
      return res.status(200).json({ success: true, message: 'تم حذف حساب المعلم نهائياً.' });
    }
    if (['approve', 'reject', 'toggleTeacherStatus'].includes(action)) {
      const request = (await db.ref(`scorear_account_requests/${targetUid}`).once('value')).val();
      if (!request && target.customClaims?.role !== 'teacher') return res.status(404).json({ error: 'طلب المعلم غير موجود.' });
      const active = action === 'approve' || (action === 'toggleTeacherStatus' && isActive === true);
      if (action === 'toggleTeacherStatus' && typeof isActive !== 'boolean') return res.status(400).json({ error: 'حالة التفعيل غير صحيحة.' });
      // Decouple admin approval from email verification: preserve Firebase Auth emailVerified untouched.
      const emailVerified = Boolean(target.emailVerified);
      await setRole(active ? 'teacher' : null);
      const status = active ? 'approved' : action === 'reject' ? 'rejected' : 'suspended';
      const updates = {};
      if (request) Object.assign(updates, {
        [`scorear_account_requests/${targetUid}/status`]: status,
        [`scorear_account_requests/${targetUid}/emailVerified`]: emailVerified,
        [`scorear_account_requests/${targetUid}/reviewedAt`]: now,
        [`scorear_account_requests/${targetUid}/reviewedBy`]: user.uid,
        [`scorear_account_requests/${targetUid}/reviewNote`]: note
      });
      updates[`scorear_teachers_registry/${targetUid}`] = {
        userId: targetUid, firebaseUid: targetUid, email: target.email || '',
        emailVerified,
        displayName: request?.displayName || target.displayName || 'معلم',
        schoolSubject: request?.subject || '', school: request?.school || '', status, updatedAt: now
      };
      await db.ref().update(updates);
      return res.status(200).json({ success: true, status, emailVerified, message: 'تم تحديث حساب المعلم.' });
    }
    const student = (await db.ref(`scorear_students/${targetUid}`).once('value')).val();
    if (!student || target.customClaims?.role === 'teacher') return res.status(403).json({ error: 'العملية مخصصة لحساب طالب.' });
    if (action === 'toggleStudentStatus') {
      const makeActive = Boolean(isActive);
      await auth.updateUser(targetUid, { disabled: !makeActive });
      await auth.revokeRefreshTokens(targetUid);
      await db.ref(`scorear_students/${targetUid}`).update({ isActive: makeActive, status: makeActive ? 'active' : 'suspended', updatedAt: now });
      return res.status(200).json({ success: true, message: 'تم تحديث حالة حساب الطالب.' });
    }
    if (action === 'resetStudentPassword') {
      if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون من 8 إلى 128 حرفًا.' });
      await auth.updateUser(targetUid, { password: newPassword });
      await auth.revokeRefreshTokens(targetUid);
      await db.ref(`scorear_students/${targetUid}`).update({ isTemporaryPassword: true, updatedAt: now });
    } else {
      await auth.updateUser(targetUid, { disabled: true });
      await auth.revokeRefreshTokens(targetUid);
      await db.ref(`scorear_students/${targetUid}`).update({ isActive: false, deletionPending: true });
      await auth.deleteUser(targetUid);
      await db.ref(`scorear_students/${targetUid}`).remove();
    }
    return res.status(200).json({ success: true, message: 'تم تنفيذ العملية.' });
  } catch (err) { return failure(res, err); }
}
