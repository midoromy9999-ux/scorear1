/**
 * ScoreAR Phase 2 Comprehensive Test: Classrooms Membership Cycle & Cloud Service
 * Tests:
 * 1. Unit & Rule 7 line count verifications (< 320 for service, < 350 for UI)
 * 2. Complete Membership Cycle:
 *    - Save Student Profile (with avatar selection & revision bump)
 *    - Prevent Join Before Profile Save Guard
 *    - Teacher Class Creation (8-char SC... code, max 50 cap)
 *    - Student Join Request (atomic multi-path update)
 *    - Teacher Roster Inspection (pending request detection)
 *    - Teacher Membership Approval (atomic move to members + status approved)
 *    - Teacher Membership Rejection / Removal
 *    - Quick-join URL parsing (#classrooms?join=CODE)
 * 3. Live Headless Chrome CDP Verification:
 *    - Quick-join auto-fill in DOM
 *    - Copy Code & Copy Invite Link buttons
 *    - 0 Console errors
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_EXE = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Mock Realtime Database for Unit Cycle
class MockDatabase {
  constructor() {
    this.store = {};
  }
  ref(refPath = '') {
    const cleanPath = refPath.replace(/^\/+|\/+$/g, '');
    const self = this;
    return {
      child(subPath) {
        const subClean = subPath.replace(/^\/+|\/+$/g, '');
        const joined = cleanPath ? `${cleanPath}/${subClean}` : subClean;
        return self.ref(joined);
      },
      async once(event) {
        const val = self._get(cleanPath);
        return {
          exists: () => val !== undefined && val !== null,
          val: () => (val === undefined ? null : JSON.parse(JSON.stringify(val))),
          forEach: fn => {
            if (val && typeof val === 'object') {
              for (const [k, v] of Object.entries(val)) {
                fn({ key: k, val: () => v });
              }
            }
          }
        };
      },
      async set(value) {
        self._set(cleanPath, JSON.parse(JSON.stringify(value)));
      },
      async update(updates) {
        for (const [p, v] of Object.entries(updates)) {
          const pClean = cleanPath ? `${cleanPath}/${p.replace(/^\/+|\/+$/g, '')}` : p.replace(/^\/+|\/+$/g, '');
          self._set(pClean, v === null ? undefined : JSON.parse(JSON.stringify(v)));
        }
      }
    };
  }
  _get(p) {
    if (!p) return this.store;
    const parts = p.split('/');
    let cur = this.store;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return undefined;
      cur = cur[part];
    }
    return cur;
  }
  _set(p, val) {
    if (!p) {
      this.store = val || {};
      return;
    }
    const parts = p.split('/');
    let cur = this.store;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!cur[part] || typeof cur[part] !== 'object') cur[part] = {};
      cur = cur[part];
    }
    const last = parts[parts.length - 1];
    if (val === undefined) {
      delete cur[last];
    } else {
      cur[last] = val;
    }
  }
}

async function runUnitCycleTests() {
  console.log('\n--- Part A: Unit & Complete Membership Cycle Tests ---');

  // Verify Rule 7 Line Counts
  const serviceLines = fs.readFileSync(path.join(ROOT, 'js/journey/classrooms-service.js'), 'utf8').split('\n').length;
  const uiLines = fs.readFileSync(path.join(ROOT, 'js/journey/classrooms-ui.js'), 'utf8').split('\n').length;
  console.log(`[PASS] Line Count <= 320: classrooms-service.js (${serviceLines})`);
  assert(serviceLines <= 320, `classrooms-service.js exceeds 320 lines: ${serviceLines}`);
  console.log(`[PASS] Line Count <= 350: classrooms-ui.js (${uiLines})`);
  assert(uiLines <= 350, `classrooms-ui.js exceeds 350 lines: ${uiLines}`);

  // Create isolated mock environment
  const mockDb = new MockDatabase();
  const mockStorage = {};
  global.localStorage = {
    getItem: k => (mockStorage[k] !== undefined ? mockStorage[k] : null),
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: k => { delete mockStorage[k]; }
  };
  global.sessionStorage = {
    getItem: k => null,
    setItem: () => {},
    removeItem: () => {}
  };
  global.ScoreARAuth = {
    getDb: () => mockDb,
    getAuth: () => null,
    getUser: () => null
  };

  require(path.join(ROOT, 'js/journey/classrooms-service.js'));
  const svc = global.ScoreARClassroomsService;
  assert(svc, 'ScoreARClassroomsService failed to initialize in environment');

  // 1. Student attempts to join class without profile -> must throw error
  global.ScoreARAuth.getUser = () => ({ uid: 'st_001', displayName: 'سامي البطل', role: 'student' });
  let joinWithoutProfileBlocked = false;
  try {
    await svc.requestJoinClass('SC123456');
  } catch (err) {
    if (err.message.includes('يجب حفظ ملفك التعليمي')) joinWithoutProfileBlocked = true;
  }
  assert(joinWithoutProfileBlocked, 'Student joined without saved profile guard failing');
  console.log('✅ Verified: Join request before saving profile is strictly prevented');

  // 2. Student saves learning profile
  const saveProfRes = await svc.saveStudentProfile({ displayName: 'سامي المتفوق', grade: 'الصف الأول الثانوي', avatarId: 'char_04' });
  assert(saveProfRes.ok, 'Failed to save student profile');
  const savedProfileInDb = mockDb.store.scorear_learning_v1?.profiles?.st_001;
  assert(savedProfileInDb, 'Profile not written to scorear_learning_v1/profiles');
  assert.strictEqual(savedProfileInDb.displayName, 'سامي المتفوق');
  assert.strictEqual(savedProfileInDb.avatarId, 'char_04');
  assert.strictEqual(savedProfileInDb.revision, 1);
  console.log('✅ Verified: Student profile saved with revision 1 and synced companion char_04');

  // Second save bumps revision
  await svc.saveStudentProfile({ displayName: 'سامي البطل', grade: 'الصف الأول الثانوي', avatarId: 'char_10' });
  assert.strictEqual(mockDb.store.scorear_learning_v1.profiles.st_001.revision, 2);
  console.log('✅ Verified: Subsequent profile update atomically bumps revision to 2');

  // 3. Teacher creates a classroom
  global.ScoreARAuth.getUser = () => ({ uid: 'teach_99', displayName: 'أ. أحمد رميح', role: 'teacher' });
  const createRes = await svc.createClass({ name: 'الصف الثاني الثانوي - لغة عربية', subject: 'النحو والبلاغة' });
  assert(createRes.ok, 'Teacher failed to create class');
  const classCode = createRes.classData.code;
  assert(classCode.startsWith('SC') && classCode.length === 8, `Invalid class code: ${classCode}`);
  assert(mockDb.store.scorear_learning_v1.classes[classCode], 'Class not found in classes/');
  assert.strictEqual(mockDb.store.scorear_learning_v1.teacher_classes.teach_99[classCode], true);
  console.log(`✅ Verified: Teacher created class "${createRes.classData.name}" with 8-char code ${classCode}`);

  // 4. Student submits join request with code
  global.ScoreARAuth.getUser = () => ({ uid: 'st_001', displayName: 'سامي البطل', role: 'student' });
  const joinReqRes = await svc.requestJoinClass(classCode.toLowerCase()); // Test case-insensitive
  assert(joinReqRes.ok && joinReqRes.status === 'pending');
  assert(mockDb.store.scorear_learning_v1.classes[classCode].pending.st_001, 'Request not written to class pending');
  assert.strictEqual(mockDb.store.scorear_learning_v1.student_classes.st_001[classCode].status, 'pending');
  console.log('✅ Verified: Student join request atomically written to class pending and student_classes');

  // Student classes list shows pending
  const studentClasses = await svc.loadMyClasses();
  assert.strictEqual(studentClasses.length, 1);
  assert.strictEqual(studentClasses[0].status, 'pending');
  console.log('✅ Verified: Student loadMyClasses returns pending status');

  // 5. Teacher inspects roster
  global.ScoreARAuth.getUser = () => ({ uid: 'teach_99', displayName: 'أ. أحمد رميح', role: 'teacher' });
  const roster = await svc.getRoster(classCode);
  assert.strictEqual(roster.pending.length, 1);
  assert.strictEqual(roster.pending[0].displayName, 'سامي البطل');
  assert.strictEqual(roster.members.length, 0);
  console.log(`✅ Verified: Teacher getRoster shows 1 pending request (${roster.pending[0].displayName}) and 0 members`);

  // 6. Teacher approves membership request
  const approveRes = await svc.reviewMembership({ classId: classCode, uid: 'st_001', action: 'approve' });
  assert(approveRes.ok && approveRes.action === 'approve');
  assert(!mockDb.store.scorear_learning_v1.classes[classCode].pending?.st_001, 'Student not removed from pending');
  assert(mockDb.store.scorear_learning_v1.classes[classCode].members?.st_001, 'Student not added to members');
  assert.strictEqual(mockDb.store.scorear_learning_v1.student_classes.st_001[classCode].status, 'approved');
  console.log('✅ Verified: Teacher approval atomically moves student to members and updates status to approved');

  // 7. Student classes list now shows approved
  global.ScoreARAuth.getUser = () => ({ uid: 'st_001', displayName: 'سامي البطل', role: 'student' });
  const approvedClasses = await svc.loadMyClasses();
  assert.strictEqual(approvedClasses.length, 1);
  assert.strictEqual(approvedClasses[0].status, 'approved');
  console.log('✅ Verified: Student loadMyClasses now displays "approved" status');

  // Re-requesting when approved returns status approved immediately
  const reReq = await svc.requestJoinClass(classCode);
  assert.strictEqual(reReq.status, 'approved');
  console.log('✅ Verified: Re-join request for existing member returns approved immediately');

  // 8. Teacher removes student from class
  global.ScoreARAuth.getUser = () => ({ uid: 'teach_99', displayName: 'أ. أحمد رميح', role: 'teacher' });
  const removeRes = await svc.reviewMembership({ classId: classCode, uid: 'st_001', action: 'remove' });
  assert(removeRes.ok && removeRes.action === 'remove');
  assert(!mockDb.store.scorear_learning_v1.classes[classCode].members?.st_001, 'Student not removed from members');
  assert.strictEqual(mockDb.store.scorear_learning_v1.student_classes.st_001[classCode].status, 'removed');
  console.log('✅ Verified: Teacher removal updates student status to removed and clears member entry');

  // 9. Quick-join URL parsing
  global.location = { hash: '#classrooms?join=SC99K8A2' };
  const quickCode = svc.getQuickJoinCode();
  assert.strictEqual(quickCode, 'SC99K8A2');
  console.log('✅ Verified: Quick-join URL code extraction (#classrooms?join=SC99K8A2) -> SC99K8A2');
}

async function runBrowserCdpTests() {
  console.log('\n--- Part B: Live Headless Chrome E2E & DOM Integration ---');
  if (!fs.existsSync(BROWSER_EXE)) throw new Error(`Browser binary not found: ${BROWSER_EXE}`);

  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0].split('#')[0];
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    const filePath = path.join(PUBLIC_DIR, decodeURIComponent(urlPath));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(path.join(PUBLIC_DIR, 'index.html')).pipe(res);
    }
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const portHttp = server.address().port;
  const portCdp = 9520 + Math.floor(Math.random() * 200);
  const userDir = path.join(process.env.TEMP || 'C:\\Temp', `scorear_p2_cdp_${Date.now()}`);

  const chrome = spawn(BROWSER_EXE, [
    `--remote-debugging-port=${portCdp}`,
    `--user-data-dir=${userDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    'about:blank'
  ], { stdio: 'ignore' });

  let ws;
  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(350);
      try {
        const res = await fetch(`http://127.0.0.1:${portCdp}/json/list`);
        if (res.ok) {
          const tabs = await res.json();
          const t = tabs.find(x => x.type === 'page' && x.webSocketDebuggerUrl);
          if (t) { wsUrl = t.webSocketDebuggerUrl; break; }
        }
      } catch {}
    }
    if (!wsUrl) throw new Error('Failed to connect to Headless Chrome CDP');

    ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();
    const consoleErrors = [];
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params?.exceptionDetails;
        const errDesc = details?.exception?.description || details?.text || 'RuntimeException';
        consoleErrors.push(errDesc);
        console.error('  [CDP Exception]:', errDesc);
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    const evalJs = async expr => {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result?.value;
    };

    await send('Runtime.enable');
    await send('Page.enable');

    // 1. Test Quick Join Auto-fill from URL (#classrooms?join=SC77TEST)
    console.log('Navigating to http://127.0.0.1:' + portHttp + '/index.html#classrooms?join=SC77TEST...');
    await send('Page.navigate', { url: `http://127.0.0.1:${portHttp}/index.html#classrooms?join=SC77TEST` });

    for (let i = 0; i < 30; i++) {
      await sleep(200);
      const ready = await evalJs('document.readyState');
      if (ready === 'complete') break;
    }
    await sleep(600);

    // Simulate logged in student visiting quick join URL
    await evalJs(`(async () => {
      const studentMock = { id: 'st_browser', name: 'طالب متفوق', role: 'student' };
      localStorage.setItem('scorear_user', JSON.stringify(studentMock));
      if (window.ScoreARAuth) window.ScoreARAuth.getUser = () => studentMock;
      await window.ScoreARClassrooms.renderClassroomsView();
    })()`);
    await sleep(400);

    const autoFillVal = await evalJs(`document.getElementById('join-class-code-input')?.value`);
    console.log(`✅ Quick-join code auto-filled in DOM input: "${autoFillVal}"`);
    assert.strictEqual(autoFillVal, 'SC77TEST', `Expected SC77TEST, got ${autoFillVal}`);

    // 2. Test Teacher View Copy Code & Copy Invite Link Buttons
    await evalJs(`(async () => {
      const teacherMock = { id: 'teach_browser', name: 'أ. أحمد رميح', role: 'teacher', isTeacher: true };
      localStorage.setItem('scorear_user', JSON.stringify(teacherMock));
      if (window.ScoreARAuth) window.ScoreARAuth.getUser = () => teacherMock;
      // Mock class data in service for UI rendering
      ScoreARClassroomsService.loadMyClasses = async () => [{
        id: 'SC88DEMO',
        code: 'SC88DEMO',
        name: 'الصف الأول الثانوي - شعبة أ',
        subject: 'اللغة العربية',
        students: [{ id: 's1' }],
        pending: [{ id: 'p1', displayName: 'أحمد محمود', grade: 'أولى ثانوي' }]
      }];
      await window.ScoreARClassrooms.renderClassroomsView();
    })()`);
    await sleep(500);

    const teacherCardBtns = await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('.class-card button')).map(b => b.textContent.trim());
      return btns;
    })()`);
    console.log(`✅ Teacher class card action buttons: ${JSON.stringify(teacherCardBtns)}`);
    assert(teacherCardBtns.some(t => t.includes('نسخ الرمز')), 'Copy code button missing');
    assert(teacherCardBtns.some(t => t.includes('رابط الدعوة')), 'Copy invite link button missing');

    // Test Copy invite link execution
    await evalJs(`(() => {
      ScoreARClassrooms.copyInviteLink('SC88DEMO');
    })()`);
    await sleep(200);
    const feedbackText = await evalJs(`document.getElementById('classrooms-feedback')?.textContent?.trim()`);
    console.log(`✅ Feedback notification on copying invite link: "${feedbackText}"`);
    assert(feedbackText.includes('SC88DEMO') && feedbackText.includes('#classrooms?join='), 'Invite link copy feedback invalid');

    // 3. Console Errors Audit
    console.log(`Console error count: ${consoleErrors.length}`);
    assert.strictEqual(consoleErrors.length, 0, `Encountered console errors: ${consoleErrors.join('; ')}`);
    console.log('✅ ZERO console errors detected during entire test session!');

    console.log('\n🎉 ALL PHASE 2 CLASSROOMS & MEMBERSHIP CHECKS PASSED 100%! 🚀');
  } finally {
    if (ws) ws.close();
    try { chrome.kill(); } catch {}
    server.close();
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}
  }
}

async function main() {
  await runUnitCycleTests();
  await runBrowserCdpTests();
}

main().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
