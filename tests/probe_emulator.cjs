const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1:9000';
const ns = 'scorear2-default-rtdb';

function makeJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.`;
}

const studentToken = makeJwt({ user_id: 's1', sub: 's1', role: 'student', email: 's1@students.scorear.app' });

async function run() {
  console.log('[PROBE] Testing with ns=' + ns);

  // Test 1: Student writes to scorear_ai_quotas (Should be 401 Permission denied)
  const res1 = await fetch(`http://${host}/scorear_ai_quotas/s1.json?ns=${ns}&auth=${studentToken}`, {
    method: 'PUT',
    body: JSON.stringify({ quota: 100 })
  });
  console.log('Test 1 (Student write ai_quotas) Status:', res1.status, await res1.text());

  // Test 2: Student writes rooms/123456/players/s1 with valid schema (Should be 200 OK)
  const res2 = await fetch(`http://${host}/rooms/123456/players/s1.json?ns=${ns}&auth=${studentToken}`, {
    method: 'PUT',
    body: JSON.stringify({ id: 's1', name: 'أحمد' })
  });
  console.log('Test 2 (Student join room) Status:', res2.status, await res2.text());
}

run().catch(e => { console.error(e); process.exit(1); });
