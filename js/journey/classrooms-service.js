(function(global) {
  'use strict';
  const ROOT_PATH = 'scorear_learning_v1', MAX_TEACHER_CLASSES = 50;
  const getDb = () => global.ScoreARAuth?.getDb?.() || global.firebase?.database?.();
  const getAuth = () => global.ScoreARAuth?.getAuth?.() || global.firebase?.auth?.();
  async function ensureAuthUser() { return getAuth()?.currentUser?.uid || null; }
  async function getCurrentActor() {
    const user = getAuth()?.currentUser;
    if (!user || user.isAnonymous) return null; // Classes are separate from guest competitions.
    const { claims } = await user.getIdTokenResult();
    const isTeacher = claims.role === 'teacher' || claims.role === 'admin';
    const profile = global.ScoreARAuth?.getUser?.();
    return { uid: user.uid, role: isTeacher ? claims.role : 'student', isTeacher, isStudent: !isTeacher,
      emailVerified: user.emailVerified === true, displayName: user.displayName || (profile?.uid === user.uid ? profile.displayName : '') || 'طالب', raw: user };
  }
  function key(uid) { return 'scorear_classes_v2_' + uid; }
  function cache(uid, value) { try { localStorage.setItem(key(uid), JSON.stringify(value)); } catch {} }
  function cached(uid) { try { return JSON.parse(localStorage.getItem(key(uid))) || []; } catch { return []; } }
  function requireDb() { const db = getDb(); if (!db) throw new Error('خدمة الحفظ غير متاحة.'); return db; }
  function validCode(id) { if (!/^[A-Za-z0-9_-]{4,100}$/.test(id || '')) throw new Error('كود الفصل غير صحيح.'); return id; }
  async function getClassSummary(classId) {
    validCode(classId);
    const actor = await getCurrentActor(); if (!actor) throw new Error('سجل دخولك لعرض الفصل.');
    const db = requireDb(), base = `${ROOT_PATH}/classes/${classId}`;
    const fields = ['id', 'code', 'name', 'subject', 'teacherName', 'ownerUid', 'createdAt'];
    const values = await Promise.all(fields.map(f => db.ref(base + '/' + f).once('value')));
    if (!values[0].exists()) return null;
    const cls = Object.fromEntries(fields.map((f, i) => [f, values[i].val()]));
    if (cls.ownerUid === actor.uid || actor.role === 'admin') return (await db.ref(base).once('value')).val();
    const m = await db.ref(base + '/members/' + actor.uid).once('value');
    cls.members = m.exists() ? { [actor.uid]: m.val() } : {};
    return cls;
  }
  async function saveStudentProfile({ displayName, grade, avatarId }) {
    const actor = await getCurrentActor(); if (!actor) throw new Error('سجل الدخول لحفظ ملفك.');
    const name = String(displayName || '').trim();
    if (name.length < 2 || name.length > 50) throw new Error('الاسم من حرفين إلى 50 حرفًا.');
    const profile = { uid: actor.uid, displayName: name, grade: String(grade || '').slice(0,80),
      avatarId: /^char_\d{2}$/.test(avatarId || '') ? avatarId : 'char_01', updatedAt: Date.now() };
    await requireDb().ref(`${ROOT_PATH}/profiles/${actor.uid}`).set(profile);
    return { ok: true, profile };
  }
  async function getStudentProfile(uid) {
    const actor = await getCurrentActor(); if (!actor || (uid && uid !== actor.uid)) return null;
    const profile = (await requireDb().ref(`${ROOT_PATH}/profiles/${actor.uid}`).once('value')).val();
    if (profile) return profile;
    return (await requireDb().ref(`scorear_students/${actor.uid}`).once('value')).val();
  }
  async function createClass({ name, subject }) {
    const actor = await getCurrentActor(); if (!actor?.isTeacher) throw new Error('إنشاء الفصول متاح للمعلم المعتمد.');
    const n = String(name || '').trim(), s = String(subject || '').trim();
    if (n.length < 2 || n.length > 80 || s.length < 2 || s.length > 100) throw new Error('راجع اسم الفصل والمادة.');
    const existing = await loadMyClasses(); if (existing.length >= MAX_TEACHER_CLASSES) throw new Error('وصلت إلى الحد الأقصى للفصول.');
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const bytes = new Uint8Array(8); global.crypto.getRandomValues(bytes);
    const id = 'SC' + Array.from(bytes, x => chars[x % chars.length]).join('');
    const cls = { id, code: id, name:n, subject:s, ownerUid:actor.uid, teacherName:actor.displayName, createdAt:Date.now() };
    const db = requireDb();
    await db.ref(`${ROOT_PATH}/classes/${id}`).set(cls);
    await db.ref(`${ROOT_PATH}/teacher_classes/${actor.uid}/${id}`).set(true);
    cache(actor.uid, [cls, ...existing]);
    return { ok: true, classData: cls };
  }
  async function requestJoinClass(code) {
    const actor = await getCurrentActor(); if (!actor?.isStudent) throw new Error('سجل دخول الطالب أولًا.');
    const classId = validCode(String(code || '').trim().toUpperCase()), cls = await getClassSummary(classId);
    if (!cls) throw new Error('الفصل غير موجود.');
    if (cls.members?.[actor.uid]) return {ok:true,status:'approved'};
    const profile = await getStudentProfile(actor.uid);
    if (!profile?.displayName) throw new Error('أكمل ملفك الشخصي أولًا.');
    const db = requireDb();
    await db.ref(`${ROOT_PATH}/classes/${classId}/pending/${actor.uid}`).set({uid:actor.uid,id:actor.uid,
      displayName:profile.displayName,grade:profile.grade || '',avatarId:profile.avatarId || 'char_01',requestedAt:Date.now()});
    const entryRef = db.ref(`${ROOT_PATH}/student_classes/${actor.uid}/${classId}`);
    await entryRef.set({id:classId,code:classId,status:'pending',name:cls.name,subject:cls.subject,teacherName:cls.teacherName,updatedAt:Date.now()});
    return {ok:true,status:'pending',message:'تم إرسال طلبك للمعلم.'};
  }
  async function owned(classId) {
    const actor = await getCurrentActor(); const cls = await getClassSummary(classId);
    if (!actor?.isTeacher || (cls?.ownerUid !== actor.uid && actor.role !== 'admin')) throw new Error('الفصل لا يتبع حسابك.');
    return {actor,cls,db:requireDb()};
  }
  async function getRoster(classId) {
    const {cls} = await owned(classId);
    const list = obj => Object.entries(obj || {}).map(([id,v])=>({id,...v}));
    return {pending:list(cls.pending),members:list(cls.members)};
  }
  async function reviewMembership({classId,uid,action}) {
    if (!['approve','reject','remove'].includes(action) || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new Error('عملية غير صحيحة.');
    const {cls,db} = await owned(classId), base = `${ROOT_PATH}/classes/${classId}`, index = `${ROOT_PATH}/student_classes/${uid}/${classId}`;
    const updates = {[`${base}/pending/${uid}`]:null,[`${index}/status`]:action==='approve'?'approved':action==='reject'?'rejected':'removed',[`${index}/updatedAt`]:Date.now()};
    if (action === 'approve') {
      const p = cls.pending?.[uid]; if (!p) throw new Error('طلب الانضمام غير موجود.');
      updates[`${base}/members/${uid}`] = {uid,displayName:p.displayName,grade:p.grade || '',avatarId:p.avatarId || 'char_01',joinedAt:Date.now()};
    } else if (action === 'remove') updates[`${base}/members/${uid}`] = null;
    await db.ref().update(updates);
    return {ok:true,action};
  }
  async function loadMyClasses() {
    const actor = await getCurrentActor(); if (!actor) return [];
    const db = requireDb(), index = actor.isTeacher ? 'teacher_classes' : 'student_classes';
    const map = (await db.ref(`${ROOT_PATH}/${index}/${actor.uid}`).once('value')).val() || {};
    const list = await Promise.all(Object.keys(map).map(async id => {
      const cls = await getClassSummary(id); if (!cls) return null;
      if (actor.isTeacher) return {...cls,pending:Object.entries(cls.pending || {}).map(([uid,p])=>({id:uid,uid,...p})),students:Object.entries(cls.members || {}).map(([uid,p])=>({id:uid,uid,...p}))};
      return {...cls,status:cls.members?.[actor.uid]?'approved':map[id].status,updatedAt:map[id].updatedAt};
    }));
    const result = list.filter(Boolean); cache(actor.uid,result); return result;
  }
  function getQuickJoinCode() {
    const loc = global.location; if (!loc) return '';
    const h = loc.hash || '', idx = h.indexOf('?');
    return (new URLSearchParams(idx>=0?h.slice(idx+1):loc.search).get('join') || '').trim().toUpperCase();
  }
  const api = {ROOT_PATH,ensureAuthUser,getCurrentActor,saveStudentProfile,getStudentProfile,createClass,requestJoinClass,getRoster,reviewMembership,loadMyClasses,getQuickJoinCode,getDb,getClassSummary};
  global.ScoreARClassroomsService=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
