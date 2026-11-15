const assert = require('assert');

// Simulate the exact code from realtime-engine.js and auth.js
async function runRealtimeTest() {
  console.log('Testing live Realtime communication over Firebase RTDB...');
  
  // 1. Sign in two anonymous users (Host and Student)
  const hostAuth = await (await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCE-ygsBQe7KnIbZwQODk833gSnO1-tnF8', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true })
  })).json();

  const studentAuth = await (await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCE-ygsBQe7KnIbZwQODk833gSnO1-tnF8', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true })
  })).json();

  console.log('Host signed in anonymously:', hostAuth.localId);
  console.log('Student signed in anonymously:', studentAuth.localId);

  const testPin = '876543';
  const rtdbBase = 'https://scorear2-default-rtdb.europe-west1.firebasedatabase.app';

  // 2. Host creates room in rooms/<pin>
  const roomRes = await fetch(`${rtdbBase}/rooms/${testPin}.json?auth=${hostAuth.idToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'open', worldId: 'royal', hostName: 'أ. أحمد', createdAt: Date.now() })
  });
  console.log('Host created room:', roomRes.status, await roomRes.text());

  // 3. Student checks room in rooms/<pin>
  const checkRes = await fetch(`${rtdbBase}/rooms/${testPin}.json?auth=${studentAuth.idToken}`);
  const roomData = await checkRes.json();
  console.log('Student read roomData:', roomData);
  assert.strictEqual(roomData.status, 'open', 'Room status should be open');

  // 4. Student sends STUDENT_JOIN to scorear_rooms/<pin>
  const joinMsg = {
    type: 'STUDENT_JOIN',
    player: { id: studentAuth.localId, name: 'طالب تجريبي', avatarId: 'char_01' },
    pin: testPin,
    _msgId: 'm_' + Date.now(),
    _timestamp: Date.now(),
    _senderRole: 'student'
  };

  const joinPost = await fetch(`${rtdbBase}/scorear_rooms/${testPin}.json?auth=${studentAuth.idToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(joinMsg)
  });
  console.log('Student posted STUDENT_JOIN:', joinPost.status, await joinPost.text());

  // 5. Host reads scorear_rooms/<pin>
  const eventsRes = await fetch(`${rtdbBase}/scorear_rooms/${testPin}.json?auth=${hostAuth.idToken}`);
  const events = await eventsRes.json();
  console.log('Host read events:', Object.keys(events).length, 'events');
  const foundJoin = Object.values(events).find(e => e.type === 'STUDENT_JOIN');
  assert.ok(foundJoin, 'Host should find STUDENT_JOIN event');
  console.log('Host found join from:', foundJoin.player.name);

  // 6. Host sends QUESTION_START
  const qStartMsg = {
    type: 'QUESTION_START',
    qIndex: 0,
    totalQuestions: 5,
    q: 'ما هو النعت؟',
    opts: ['اسم', 'فعل', 'حرف', 'ضمير'],
    timeLimit: 20,
    _msgId: 'm_' + (Date.now() + 1),
    _timestamp: Date.now(),
    _senderRole: 'host'
  };

  const qStartPost = await fetch(`${rtdbBase}/scorear_rooms/${testPin}.json?auth=${hostAuth.idToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(qStartMsg)
  });
  console.log('Host posted QUESTION_START:', qStartPost.status, await qStartPost.text());

  // 7. Student reads scorear_rooms/<pin>
  const studentEventsRes = await fetch(`${rtdbBase}/scorear_rooms/${testPin}.json?auth=${studentAuth.idToken}`);
  const studentEvents = await studentEventsRes.json();
  const foundQ = Object.values(studentEvents).find(e => e.type === 'QUESTION_START');
  assert.ok(foundQ, 'Student should find QUESTION_START event');
  console.log('Student received question:', foundQ.q);

  console.log('ALL FIREBASE RTDB REALTIME STEPS VERIFIED 100%!');
}

runRealtimeTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
