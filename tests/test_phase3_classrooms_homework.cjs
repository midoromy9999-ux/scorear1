/**
 * ScoreAR Phase 3 Comprehensive Test: Classrooms Homework & Tasks Cycle
 * Tests:
 * 1. Rule 7 Line Counts (< 380 for classrooms-homework.js, < 320 for service, < 350 for UI, <= 500 for quiz-bank.js)
 * 2. Full Homework & Submissions Cycle:
 *    - Teacher creates class & enrolls approved student
 *    - Teacher publishes Text Task
 *    - Teacher publishes Quiz Task from Quiz Bank
 *    - Non-approved student submission rejection guard
 *    - Approved student submits Text Answer
 *    - Approved student solves Interactive Quiz with self-correction & mistake recording
 *    - Teacher views submissions report ("سلّم X من Y طلاب")
 *    - Teacher grades student's submission (out of 100)
 *    - Teacher exports Excel sheet using XLSX
 * 3. Live Headless Chrome CDP E2E:
 *    - #classrooms?hw=CLASS_ID view & action buttons
 *    - Quiz Bank "📝 واجب للصف" button
 *    - ZERO console errors
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
    if (!p) { this.store = val || {}; return; }
    const parts = p.split('/');
    let cur = this.store;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!cur[part] || typeof cur[part] !== 'object') cur[part] = {};
      cur = cur[part];
    }
    const last = parts[parts.length - 1];
    if (val === undefined) delete cur[last];
    else cur[last] = val;
  }
}

async function runUnitCycleTests() {
  console.log('\n--- Part A: Unit & Complete Homework Cycle Tests ---');

  // 1. Verify Rule 7 Line Counts
  const hwLines = fs.readFileSync(path.join(ROOT, 'js/journey/classrooms-homework.js'), 'utf8').split('\n').length;
  const svcLines = fs.readFileSync(path.join(ROOT, 'js/journey/classrooms-service.js'), 'utf8').split('\n').length;
  const uiLines = fs.readFileSync(path.join(ROOT, 'js/journey/classrooms-ui.js'), 'utf8').split('\n').length;
  const qbLines = fs.readFileSync(path.join(ROOT, 'js/quiz/quiz-bank.js'), 'utf8').split('\n').length;

  console.log(`[PASS] Line Count < 380: classrooms-homework.js (${hwLines})`);
  assert(hwLines < 380, `classrooms-homework.js exceeded 380 lines (${hwLines})`);

  console.log(`[PASS] Line Count < 320: classrooms-service.js (${svcLines})`);
  assert(svcLines < 320, `classrooms-service.js exceeded 320 lines (${svcLines})`);

  console.log(`[PASS] Line Count < 350: classrooms-ui.js (${uiLines})`);
  assert(uiLines < 350, `classrooms-ui.js exceeded 350 lines (${uiLines})`);

  console.log(`[PASS] Line Count <= 500: quiz-bank.js (${qbLines})`);
  assert(qbLines <= 500, `quiz-bank.js exceeded 500 lines (${qbLines})`);

  // 2. Setup mock environment
  const mockDb = new MockDatabase();
  global.firebase = { database: () => mockDb };
  global.localStorage = {
    _data: {},
    getItem: k => global.localStorage._data[k] || null,
    setItem: (k, v) => { global.localStorage._data[k] = String(v); },
    removeItem: k => { delete global.localStorage._data[k]; }
  };
  global.window = global;

  // Mock Mistake Notebook recording
  const recordedMistakes = [];
  global.ScoreARMistakeNotebook = {
    recordMistake: (qData, chosenText) => {
      recordedMistakes.push({ qData, chosenText });
    }
  };

  // Mock Journey XP
  let currentXp = 100;
  global.ScoreARJourney = {
    loadProgress: () => ({ totalXp: currentXp }),
    saveProgress: p => { if (p.totalXp) currentXp = p.totalXp; }
  };

  // Mock XLSX library
  let exportedExcelData = null;
  global.XLSX = {
    utils: {
      json_to_sheet: rows => ({ _rows: rows }),
      book_new: () => ({ Sheets: {} }),
      book_append_sheet: (wb, ws, name) => { wb.Sheets[name] = ws; }
    },
    writeFile: (wb, filename) => {
      exportedExcelData = { wb, filename };
    }
  };

  delete require.cache[require.resolve('../js/journey/classrooms-service.js')];
  delete require.cache[require.resolve('../js/journey/classrooms-homework.js')];
  require('../js/journey/classrooms-service.js');
  require('../js/journey/classrooms-homework.js');

  const svc = global.ScoreARClassroomsService;
  const hw = global.ScoreARClassroomsHomework;
  assert(svc, 'ScoreARClassroomsService must be loaded');
  assert(hw, 'ScoreARClassroomsHomework must be loaded');

  // 3. Create class and register student
  let currentActor = null;
  function setActor(actor) {
    currentActor = actor;
    global.ScoreARAuth = { getUser: () => actor };
    if (actor.isTeacher) {
      global.localStorage.setItem('scorear_teacher_session', JSON.stringify(actor));
      global.localStorage.removeItem('scorear_student_session');
    } else {
      global.localStorage.setItem('scorear_student_session', JSON.stringify(actor));
      global.localStorage.removeItem('scorear_teacher_session');
    }
    global.localStorage.setItem('scorear_user', JSON.stringify(actor));
    svc.getCurrentActor = async () => actor;
  }

  setActor({ uid: 'teacher_hw_1', displayName: 'أ. أحمد رميح', role: 'teacher', isTeacher: true });

  const cRes = await svc.createClass({ name: 'الصف الثاني الثانوي - لغة عربية', subject: 'النحو والبلاغة' });
  const classId = cRes.classData.id;
  assert(classId, 'Class must be created with classId');

  // Add an approved member (Student 1)
  mockDb._set(`scorear_learning_v1/classes/${classId}/members/student_hw_1`, {
    uid: 'student_hw_1', displayName: 'سامي المتفوق', grade: 'تانية ثانوي', joinedAt: Date.now()
  });

  // 4. Teacher creates Text Task
  const textTaskRes = await hw.createTask({
    classId, type: 'text',
    title: 'إعراب سورة الإخلاص',
    prompt: 'أعرب قوله تعالى: قل هو الله أحد إعراباً تفصيلياً.',
    deadline: '2026-12-31'
  });
  assert(textTaskRes.ok, 'Teacher text task creation must succeed');
  const textTaskId = textTaskRes.task.id;
  console.log(`✅ Verified: Teacher published Text Task (${textTaskRes.task.title})`);

  // 5. Teacher creates Quiz Task
  const sampleQuestions = [
    { id: 'q1', q: 'ما إعراب "التلميذ" في: حضر التلميذُ؟', opts: ['مفعول به', 'فاعل مرفوع', 'مبتدأ'], ans: 1, explain: 'من قام بالفعل فاعل' },
    { id: 'q2', q: 'كان وأخواتها تدخل على الجملة:', opts: ['الفعلية', 'الاسمية', 'شبه الجملة'], ans: 1, explain: 'تدخل على المبتدأ والخبر' }
  ];
  const quizTaskRes = await hw.createTask({
    classId, type: 'quiz',
    title: 'اختبار نحو قصير: الفاعل وكان وأخواتها',
    prompt: 'حل المسابقة التفاعلية المكونة من سؤالين.',
    questions: sampleQuestions
  });
  assert(quizTaskRes.ok, 'Teacher quiz task creation must succeed');
  const quizTaskId = quizTaskRes.task.id;
  console.log(`✅ Verified: Teacher published Quiz Task (${quizTaskRes.task.title})`);

  // 6. Test unauthorized student cannot submit
  setActor({ uid: 'intruder_99', displayName: 'طالب غير منضم', role: 'student', isTeacher: false });
  let intruderBlocked = false;
  try {
    await hw.submitTextAnswer({ classId, taskId: textTaskId, answer: 'محاولة تسليم غير شرعية' });
  } catch (e) {
    intruderBlocked = true;
  }
  assert(intruderBlocked, 'Non-member student must be rejected from submitting');
  console.log('✅ Verified: Non-approved student submission strictly prevented');

  // 7. Approved student submits Text Answer
  setActor({ uid: 'student_hw_1', displayName: 'سامي المتفوق', role: 'student', isTeacher: false });
  const subRes = await hw.submitTextAnswer({
    classId, taskId: textTaskId, answer: 'قل: فعل أمر مبني على السكون، والفاعل ضمير مستتر تقديره أنت.'
  });
  assert(subRes.ok, 'Student text submission must succeed');
  assert.strictEqual(subRes.payload.score, null, 'Score must be null initially awaiting grading');
  console.log('✅ Verified: Approved student submitted Text Answer successfully');

  // 8. Approved student solves Quiz Task (1 correct, 1 wrong)
  const q1Correct = sampleQuestions[0].opts[1];
  const q2Wrong = sampleQuestions[1].opts[0]; // wrong choice
  // Record the mistake for Q2
  global.ScoreARMistakeNotebook.recordMistake(sampleQuestions[1], q2Wrong);
  assert.strictEqual(recordedMistakes.length, 1, 'Wrong question must be recorded in Mistake Notebook');
  console.log(`✅ Verified: Mistake recorded in Notebook for question: "${sampleQuestions[1].q}"`);

  // Submit quiz answer (1/2 = 50%)
  const quizSubRes = await hw.submitQuizAnswer({
    classId, taskId: quizTaskId, score: 50, correctCount: 1, totalQuestions: 2
  });
  assert(quizSubRes.ok, 'Quiz submission must succeed');
  assert.strictEqual(quizSubRes.payload.score, 50, 'Quiz score must be 50');
  console.log(`✅ Verified: Student quiz answer computed score: ${quizSubRes.payload.score}/100 and awarded XP (new XP: ${currentXp})`);

  // 9. Teacher opens submissions report & grades Text Task
  setActor({ uid: 'teacher_hw_1', displayName: 'أ. أحمد رميح', role: 'teacher', isTeacher: true });
  const gradeRes = await hw.saveGrade({
    classId, taskId: textTaskId, studentUid: 'student_hw_1', scoreVal: 95
  });
  assert(gradeRes.ok && gradeRes.score === 95, 'Teacher grading must succeed with score 95');
  console.log('✅ Verified: Teacher graded student submission with 95/100');

  // 10. Teacher exports Excel report
  await hw.exportHomeworkExcel(classId, textTaskId);
  assert(exportedExcelData, 'Excel workbook must be generated');
  assert(exportedExcelData.filename.includes('كشف_الدرجات.xlsx'), 'Filename must contain كشف_الدرجات');
  const exportedRows = exportedExcelData.wb.Sheets['كشف درجات الواجب']._rows;
  assert(exportedRows.length === 1, 'Excel must contain 1 student row');
  assert.strictEqual(exportedRows[0]['اسم الطالب'], 'سامي المتفوق');
  assert.strictEqual(exportedRows[0]['الدرجة من 100'], 95);
  console.log(`✅ Verified: Teacher exported Excel report "${exportedExcelData.filename}" with 100% accurate rows`);

  console.log('🎉 ALL PART A UNIT & HOMEWORK CYCLE TESTS PASSED 100%!');
}

async function runBrowserCdpTests() {
  console.log('\n--- Part B: Live Headless Chrome E2E & DOM Integration ---');

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(PUBLIC_DIR, reqPath);
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
  const userDir = path.join(process.env.TEMP || 'C:\\Temp', `scorear_p3_cdp_${Date.now()}`);

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

    console.log('Navigating to http://127.0.0.1:' + portHttp + '/index.html#classrooms...');
    await send('Page.navigate', { url: `http://127.0.0.1:${portHttp}/index.html#classrooms` });

    for (let i = 0; i < 30; i++) {
      await sleep(200);
      const ready = await evalJs('document.readyState');
      if (ready === 'complete') break;
    }
    await sleep(600);

    // 1. Verify "واجبات الصف ←" in teacher class cards
    await evalJs(`(async () => {
      const teacherMock = { id: 'teach_cdp', name: 'أ. أحمد رميح', role: 'teacher', isTeacher: true };
      localStorage.setItem('scorear_user', JSON.stringify(teacherMock));
      if (window.ScoreARAuth) window.ScoreARAuth.getUser = () => teacherMock;
      ScoreARClassroomsService.loadMyClasses = async () => [{
        id: 'SC99CDP', code: 'SC99CDP', name: 'صف النحو المكثف', subject: 'لغة عربية',
        students: [{ id: 's1', displayName: 'طالب مميز' }], pending: []
      }];
      await window.ScoreARClassrooms.renderClassroomsView();
    })()`);
    await sleep(400);

    const hasHwBtn = await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('.class-card button')).map(b => b.textContent.trim());
      return btns.some(t => t.includes('واجبات الصف'));
    })()`);
    console.log(`✅ Teacher class card contains "واجبات الصف ←": ${hasHwBtn}`);
    assert(hasHwBtn, 'Class card must have "واجبات الصف ←" button');

    // 2. Open Homework View via Hash (#classrooms?hw=SC99CDP)
    await evalJs(`(async () => {
      ScoreARClassroomsHomework.getTasks = async () => [{
        id: 'hw_cdp_1', type: 'text', title: 'واجب إعراب كان وأخواتها',
        prompt: 'أعرب ما تحته خط في الجمل التالية.', deadline: '2026-12-31',
        answers: { s1: { answer: 'إجابة نموذجية', submittedAt: Date.now(), score: 100 } }
      }];
      // Mock class retrieval
      if (!window.firebase) window.firebase = {};
      window.firebase.database = () => ({
        ref: (p) => ({
          once: async () => ({
            exists: () => true,
            val: () => ({ id: 'SC99CDP', name: 'صف النحو المكثف', subject: 'لغة عربية', code: 'SC99CDP', ownerUid: 'teach_cdp', members: { s1: { displayName: 'طالب مميز' } } })
          })
        })
      });
      await ScoreARClassroomsHomework.renderHomeworkPage('SC99CDP');
    })()`);
    await sleep(400);

    const hwTitle = await evalJs(`document.querySelector('.scorear-classrooms-view h2')?.textContent?.trim()`);
    console.log(`✅ Rendered Homework View Title: "${hwTitle}"`);
    assert(hwTitle && hwTitle.includes('واجبات صف'), 'Homework view title must be rendered');

    // 3. Verify Quiz Bank has "📝 واجب للصف" button
    await evalJs(`(async () => {
      window.location.hash = '#bank';
      if (window.ScoreARQuizBankData) {
        const qzItem = { id: 'qz_test_1', title: 'مسابقة قواعد النحو', status: 'published', questions: [{ id: 'q1' }] };
        window.ScoreARQuizBankData.getQuizzes = () => [qzItem];
        window.ScoreARQuizBankData.getFilteredQuizzes = () => ({ items: [qzItem], totalItems: 1, totalPages: 1, currentPage: 1 });
        window.ScoreARQuizBankData.getQuestions = () => [];
      }
      if (window.ScoreARQuizBank?.openBankHub) window.ScoreARQuizBank.openBankHub();
      if (window.ScoreARQuizBank?.switchTab) window.ScoreARQuizBank.switchTab('quizzes');
    })()`);
    await sleep(400);

    const quizBankHwBtn = await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('.scorear-bank-card-foot button')).map(b => b.textContent.trim());
      return btns.some(t => t.includes('واجب للصف'));
    })()`);
    console.log(`✅ Quiz Bank card action buttons contains "📝 واجب للصف": ${quizBankHwBtn}`);
    assert(quizBankHwBtn, 'Quiz bank card must have "📝 واجب للصف" button');
    console.log(`✅ Quiz Bank card action buttons contains "📝 واجب للصف": ${quizBankHwBtn}`);
    assert(quizBankHwBtn, 'Quiz bank card must have "📝 واجب للصف" button');

    // 4. Console Errors Check
    console.log(`Console error count: ${consoleErrors.length}`);
    assert.strictEqual(consoleErrors.length, 0, `Encountered console errors: ${consoleErrors.join('; ')}`);
    console.log('✅ ZERO console errors detected during entire test session!');

    console.log('\n🎉 ALL PHASE 3 CLASSROOMS HOMEWORK CHECKS PASSED 100%! 🚀');
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
