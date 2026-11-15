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

async function test() {
  const teacherToken = makeJwt({ uid: 't1', role: 'teacher', email: 'teacher@school.edu' });
  const studentToken = makeJwt({ uid: 's1', email: 's1@students.scorear.app' });

  // Test 1: Student writes to rooms/849201/players/s1
  const res1 = await fetch(`http://${host}/rooms/849201/players/s1.json?ns=${ns}&auth=${studentToken}`, {
    method: 'PUT',
    body: JSON.stringify({ id: 's1', name: 'أحمد' })
  });
  console.log('Test 1 (Student join):', res1.status, await res1.text());

  // Test 2: Teacher reads scorear_teachers_registry with query
  const res2 = await fetch(`http://${host}/scorear_teachers_registry.json?ns=${ns}&auth=${teacherToken}&orderBy="firebaseUid"&equalTo="t1"`, {
    method: 'GET'
  });
  console.log('Test 2 (Teacher query registry):', res2.status, await res2.text());
}

test().catch(console.error);
