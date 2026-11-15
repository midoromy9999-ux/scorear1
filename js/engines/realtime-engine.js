/** Authenticated host channel + private student inboxes. Guests use anonymous Auth. */
(function (global) {
  'use strict';
  let role, pin, sessionId, uid, generation = 0, ready = Promise.resolve();
  let db, connected = false, latestPhaseTs = 0;
  const subscribers = new Set(), seen = new Set(), listeners = [];
  const phases = new Set(['ROOM_OPEN', 'QUESTION_READING', 'QUESTION_START', 'QUESTION_RESULT', 'LEADERBOARD_UPDATE', 'CONTEST_COMPLETED', 'ROOM_CLOSED']);
  function listen(ref, event, fn) {
    const run = generation;
    const guarded = snapshot => { if (run === generation) fn(snapshot); };
    ref.on(event, guarded, err => console.warn('[ScoreAR realtime]', err.code));
    listeners.push(() => ref.off(event, guarded));
  }
  function dispatch(msg, studentUid) {
    if (!msg || msg._sessionId !== sessionId) return;
    if (studentUid) {
      if (msg._senderUid !== studentUid || msg._senderRole !== 'student') return;
      if (msg.type === 'STUDENT_JOIN' && msg.player?.id !== studentUid) return;
      if (msg.playerId && msg.playerId !== studentUid) return;
      if (msg.sourceId && msg.sourceId !== studentUid) return;
      if (msg.studentId && msg.studentId !== studentUid) return;
    } else if (msg._senderRole !== 'host') return;
    if (msg._msgId && seen.has(msg._msgId)) return;
    if (msg._msgId) { seen.add(msg._msgId); if (seen.size > 2000) seen.delete(seen.values().next().value); }
    if (role === 'student' && phases.has(msg.type)) {
      if ((msg._timestamp || 0) < latestPhaseTs) return;
      latestPhaseTs = msg._timestamp || 0;
    }
    subscribers.forEach(fn => { try { fn(msg); } catch (e) { console.error('[ScoreAR realtime callback]', e); } });
  }
  function cleanup() {
    generation++;
    listeners.splice(0).forEach(off => off());
    connected = false; sessionId = null; seen.clear(); subscribers.clear(); latestPhaseTs = 0;
  }
  function init(a, b, callback) {
    cleanup();
    pin = /^\d{6}$/.test(String(a)) ? String(a) : String(b);
    role = /^\d{6}$/.test(String(a)) ? b : a;
    if (['teacher', 'admin'].includes(role)) role = 'host';
    if (typeof callback === 'function') subscribers.add(callback);
    const run = generation;
    ready = (async () => {
      const auth = global.ScoreARAuth?.getAuth?.() || global.firebase?.auth?.();
      db = global.ScoreARAuth?.getDb?.() || global.firebase?.database?.();
      if (!auth || !db) throw new Error('خدمة الاتصال بالغرفة غير متاحة.');
      if (!auth.currentUser) await auth.signInAnonymously();
      uid = auth.currentUser.uid;
      const meta = (await db.ref(`rooms/${pin}/sessionId`).once('value')).val();
      if (run !== generation) return;
      if (!meta) throw new Error('الغرفة غير موجودة.');
      sessionId = meta;
      listen(db.ref('.info/connected'), 'value', s => {
        connected = !!s.val();
        const badge = global.document?.getElementById('connectionStatusText');
        if (badge) badge.textContent = connected ? 'متصل بالغرفة' : 'جارٍ الاتصال…';
      });
      if (role === 'host') {
        listen(db.ref(`scorear_student_events/${pin}`), 'child_added', student => {
          listen(db.ref(`scorear_student_events/${pin}/${student.key}`).limitToLast(100), 'child_added', s => dispatch(s.val(), student.key));
        });
      } else {
        const snapshot = (await db.ref(`scorear_room_state/${pin}`).once('value')).val();
        if (run !== generation) return;
        if (snapshot) dispatch(snapshot);
        listen(db.ref('rooms/' + pin + '/blocked/' + uid), 'value', s => {
          if (s.val() === true) dispatch({type:'STUDENT_KICKED',studentId:uid,_senderRole:'host',_sessionId:sessionId,_timestamp:Date.now()});
        });
        listen(db.ref('rooms/' + pin + '/status'), 'value', s => {
          if (s.val() === 'closed') dispatch({type:'ROOM_CLOSED',reason:'انتهت جلسة الغرفة.',_senderRole:'host',_sessionId:sessionId,_timestamp:Date.now()});
        });
        listen(db.ref(`scorear_rooms/${pin}`).orderByChild('_timestamp').startAt(Date.now() - 3000).limitToLast(100), 'child_added', s => dispatch(s.val()));
      }
    })();
    ready.catch(err => { console.warn('[ScoreAR realtime init]', err.message); global.toast?.(err.message); });
    return ready;
  }
  async function publish(type, payload = {}) {
    const run = generation;
    await ready;
    if (run !== generation || !db || !sessionId) throw new Error('انتهت جلسة الغرفة.');
    const clean = { ...payload };
    if (role === 'student') {
      // Choices are written only to the immutable, private answers path.
      for (const key of ['optionIndex', 'chosenIndices', 'optionOrder', 'answer', 'correct', '_scChoice', 'ts', 'answeredAt']) delete clean[key];
      if (type === 'STUDENT_ANSWER') type = 'STUDENT_ANSWERED';
      if (clean.playerId) clean.playerId = uid;
      if (clean.sourceId) clean.sourceId = uid;
      if (clean.studentId) clean.studentId = uid;
      if (type === 'STUDENT_JOIN') clean.player = { ...clean.player, id: uid };
    }
    const message = { ...clean, type, _senderRole: role, _senderUid: uid, _sessionId: sessionId,
      _timestamp: global.firebase?.database?.ServerValue?.TIMESTAMP || { '.sv': 'timestamp' },
      _msgId: global.crypto?.randomUUID?.() || ('m_' + Date.now() + '_' + Math.random().toString(36).slice(2)) };
    const target = role === 'host' ? `scorear_rooms/${pin}` : `scorear_student_events/${pin}/${uid}`;
    const eventKey = db.ref(target).push().key;
    const updates = { [`${target}/${eventKey}`]: message };
    if (role === 'host' && phases.has(type)) updates[`scorear_room_state/${pin}`] = message;
    await db.ref().update(updates);
    return message;
  }
  const api = { init, cleanup, publish: (t, p) => { const request = publish(t, p); request.catch(e => console.warn('[ScoreAR send]', e.message)); return request; },
    subscribe: fn => { if (typeof fn === 'function') subscribers.add(fn); return () => subscribers.delete(fn); },
    generatePin: () => String(100000 + Math.floor(Math.random() * 900000)),
    isConnected: () => connected, getPin: () => pin, getRole: () => role, whenReady: () => ready };
  global.ScoreARRealtime = api;
  global.RealtimeEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
