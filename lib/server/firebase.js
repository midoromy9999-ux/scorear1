let services;
export async function getServices() {
  if (services) return services;
  const [{ getApps, initializeApp, cert }, { getAuth }, { getDatabase }] = await Promise.all([
    import('firebase-admin/app'), import('firebase-admin/auth'), import('firebase-admin/database')
  ]);
  let app = getApps().find(a => a.name === 'scorear-server');
  if (!app) {
    const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT;
    let account;
    if (raw) account = JSON.parse(raw);
    else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) account = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'scorear1', clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
    if (!account) throw Object.assign(new Error('خدمة الحسابات غير مهيأة على الخادم.'), { status: 503 });
    app = initializeApp({ credential: cert(account), projectId: account.project_id || account.projectId,
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://scorear1-default-rtdb.europe-west1.firebasedatabase.app'
    }, 'scorear-server');
  }
  services = { auth: getAuth(app), db: getDatabase(app) };
  return services;
}
export async function authenticate(req, allowedRoles) {
  const token = /^Bearer (\S+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) throw Object.assign(new Error('يلزم تسجيل الدخول.'), { status: 401 });
  const { auth, db } = await getServices();
  let user;
  try { user = await auth.verifyIdToken(token, true); }
  catch { throw Object.assign(new Error('انتهت الجلسة أو أصبحت غير صالحة.'), { status: 401 }); }
  if (allowedRoles && !allowedRoles.includes(user.role)) throw Object.assign(new Error('ليس لديك صلاحية تنفيذ العملية.'), { status: 403 });
  return { auth, db, user };
}
export function cors(req, res) {
  const origin = req.headers.origin;
  const known = new Set(['https://scorear1.web.app', 'https://scorear1.firebaseapp.com', 'https://scorear2.web.app', 'https://scorear2.firebaseapp.com',
    'https://socerar2.vercel.app', 'https://scorear2.vercel.app',
    'https://scorear-e4186.web.app', 'https://scorear-e4186.firebaseapp.com',
    ...(process.env.SCOREAR_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)]);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) if (host) known.add('https://' + host);
  let local = false;
  if (origin && process.env.NODE_ENV !== 'production') {
    try { local = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname); } catch {}
  }
  res.setHeader('Vary', 'Origin');
  if (origin && !known.has(origin) && !local) { res.status(403).json({ error: 'مصدر الطلب غير مسموح.' }); return true; }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'استخدم POST.' }); return true; }
  return false;
}
export function failure(res, err) {
  const status = Number(err.status) || 500;
  console.error('[ScoreAR API]', err.code || status);
  return res.status(status).json({ error: status < 500 || status === 503 ? err.message : 'تعذر إتمام العملية. حاول لاحقًا.' });
}
export function validKey(key) { return typeof key === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(key); }
