process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = '127.0.0.1:9000';

const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

if (!getApps().length) {
  initializeApp({ projectId: 'scorear2' });
}

async function test() {
  const adminAuth = getAuth();
  const teacher = await adminAuth.createUser({
    email: 'teacher_emul@school.edu',
    password: 'password123'
  });
  console.log('Teacher created via Admin SDK on Auth Emulator! UID:', teacher.uid);

  await adminAuth.setCustomUserClaims(teacher.uid, { role: 'teacher' });
  console.log('Custom claims set successfully via Admin SDK!');

  const user = await adminAuth.getUser(teacher.uid);
  console.log('User custom claims:', user.customClaims);

  // Sign in via REST to get ID token
  const signinRes = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher_emul@school.edu', password: 'password123', returnSecureToken: true })
  });
  const data = await signinRes.json();
  const payload = JSON.parse(Buffer.from(data.idToken.split('.')[1], 'base64url').toString());
  console.log('ID TOKEN CLAIMS:', { uid: payload.user_id, role: payload.role });
}

test().catch(console.error);
