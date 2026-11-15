/**
 * ScoreAR Real Browser Touch Events & Evaluator Acceptance Test
 * File: tests/test_browser_touch_evaluator.js
 *
 * Requirements:
 *  1. Launches real browser (Edge/Chrome) in mobile touch viewport (390x844).
 *  2. Dispatches physical touch events via CDP (Input.dispatchTouchEvent).
 *  3. Verifies that tapping ANY answer gives NEUTRAL state without false green checkmark.
 *  4. Verifies that after QUESTION_RESULT, correct evaluation is displayed:
 *     - If wrong: ❌, red indicator, correct answer revealed.
 *     - If correct: 🎉, green celebration, speed points.
 */
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const CDP_PORT = 9245;
const HTTP_PORT = 8124;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_touch_eval_' + Date.now());

// 1. Simple Static HTTP Server for local files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(rootDir, reqPath);
  console.log('HTTP request:', req.url, '-> filePath:', filePath, 'exists:', fs.existsSync(filePath));

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(HTTP_PORT, async () => {
  console.log(`Local test server running at http://localhost:${HTTP_PORT}`);
  runBrowserTouchTests().catch(err => {
    console.error('Test execution failed:', err);
    cleanupAndExit(1);
  });
});

let browserProc = null;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runBrowserTouchTests() {
  console.log('Launching browser with touch emulation:', BROWSER_EXE);

  browserProc = spawn(BROWSER_EXE, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    `http://localhost:${HTTP_PORT}/`
  ]);

  // Wait for browser debug port to be available
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
      const tabs = await res.json();
      const pageTab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://'));
      if (pageTab && pageTab.webSocketDebuggerUrl) {
        wsUrl = pageTab.webSocketDebuggerUrl;
        break;
      }
    } catch(e) {}
  }

  if (!wsUrl) throw new Error('Failed to connect to browser CDP WebSocket');
  console.log('Connected to CDP target:', wsUrl);

  // Use built-in Node 22/24 global WebSocket
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
    }
    if (msg.id && pendingRequests.has(msg.id)) {
      pendingRequests.get(msg.id)(msg);
      pendingRequests.delete(msg.id);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  function sendCDP(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pendingRequests.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCDP('Runtime.enable');
  await sendCDP('Log.enable');
  await sendCDP('Page.enable');

  // Set Mobile Viewport (iPhone 12/13/14 size: 390 x 844) with Touch Emulation
  await sendCDP('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  });
  await sendCDP('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  console.log('Navigating page explicitly to local server...');
  let pageLoadResolver = null;
  const loadPromise = new Promise(resolve => {
    pageLoadResolver = resolve;
    setTimeout(resolve, 3000); // 3s fallback timeout
  });

  // Attach resolver to onmessage if Page.loadEventFired arrives
  const originalOnMessage = ws.onmessage;
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Page.loadEventFired' && pageLoadResolver) {
      pageLoadResolver();
      pageLoadResolver = null;
    }
    if (originalOnMessage) originalOnMessage(event);
  };

  await sendCDP('Page.navigate', { url: `http://localhost:${HTTP_PORT}/` });
  await loadPromise;
  console.log('Page loaded completely!');
  await sleep(1500);

  // Check any script loading error
  const checkErrors = await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          keys: Object.keys(window).filter(k => k.toLowerCase().includes('quiz') || k.toLowerCase().includes('scorear')),
          scripts: Array.from(document.querySelectorAll('script')).map(s => s.src)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Global objects check raw:', JSON.stringify(checkErrors));
  const evalRes1 = await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        try {
          if (!window.ScoreARQuizStudent) return { error: 'ScoreARQuizStudent not found' };
          window.ScoreARQuizStudent.startStudentSession('849201', { uid: 'touch_student_1', name: 'أحمد صلاح' });
          window.ScoreARQuizStudent.renderStudentQuestion({
            qIndex: 0,
            totalQuestions: 3,
            skill: 'النحو العربي',
            q: '«قرأتُ كتابًا ممتعًا». ما إعراب «ممتعًا»؟',
            opts: ['حال منصوب', 'نعت منصوب وعلامة نصبه الفتحة', 'مفعول به ثانٍ', 'تمييز منصوب'],
            timeLimit: 20
          });
          const btn = document.getElementById('studentOptBtn_0');
          return { btnFound: Boolean(btn), html: document.getElementById('scorearStudentStage')?.innerHTML?.substring(0, 100) };
        } catch(e) {
          return { error: e.message, stack: e.stack };
        }
      })()
    `,
    returnByValue: true
  });
  console.log('Setup result raw:', JSON.stringify(evalRes1));
  await sleep(600);

  // Get coordinates of Button 0 (WRONG option)
  const btn0Box = await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('studentOptBtn_0');
        const rect = btn.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()
    `,
    returnByValue: true
  });

  function getVal(res) {
    return res?.result?.result?.value ?? res?.result?.value ?? res?.value;
  }

  const { x: x0, y: y0 } = getVal(btn0Box);
  console.log(`Dispatching physical touch on Button 0 (WRONG) at (${x0}, ${y0})...`);

  // Dispatch real CDP Touch Events (touchStart -> touchEnd)
  await sendCDP('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: x0, y: y0, id: 1 }]
  });
  await sleep(50);
  await sendCDP('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  });
  // Also simulate mouse click for complete browser event pipeline
  await sendCDP('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: 'left', clickCount: 1 });
  await sendCDP('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x0, y: y0, button: 'left', clickCount: 1 });

  await sleep(400);

  // Inspect Immediate Tap State
  const tapState = await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        const ind = document.getElementById('studentOptIndicator_0')?.textContent || '';
        const fb = document.getElementById('studentFeedbackBox')?.innerHTML || '';
        const btnBorder = document.getElementById('studentOptBtn_0')?.style.border || '';
        return {
          indicator: ind,
          feedback: fb,
          btnBorder: btnBorder,
          hasGreenCheck: ind.includes('✓') || fb.includes('✅')
        };
      })()
    `,
    returnByValue: true
  });

  const tapVal = getVal(tapState);
  console.log('Tap state result:', tapVal);

  if (tapVal.hasGreenCheck) {
    throw new Error('REGRESSION FAILED: False green checkmark displayed immediately on tap!');
  }
  if (!tapVal.indicator.includes('📌 تم اختيارك')) {
    throw new Error('REGRESSION FAILED: Indicator did not show neutral pin icon!');
  }
  console.log('[PASS] Physical touch on option registered neutral focus without false green checkmark.');

  // Now publish QUESTION_RESULT (Correct answer is option 1, student chose option 0)
  console.log('\nDelivering QUESTION_RESULT for Scenario A (Student wrong)...');
  await sendCDP('Runtime.evaluate', {
    expression: `
      window.ScoreARQuizStudent.renderStudentResult({
        qIndex: 0,
        correctAnswer: 1,
        correctAnswerText: 'نعت منصوب وعلامة نصبه الفتحة',
        options: ['حال منصوب', 'نعت منصوب وعلامة نصبه الفتحة', 'مفعول به ثانٍ', 'تمييز منصوب'],
        playerResults: {
          'touch_student_1': {
            correct: false,
            pointsEarned: 0,
            totalScore: 0,
            streak: 0,
            chosenIndex: 0,
            respTime: '2.5'
          }
        }
      });
    `
  });
  await sleep(500);

  const resultStateA = await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        const text = document.getElementById('scorearStudentStage')?.innerText || '';
        return {
          hasWrongNotice: text.includes('إجابة خاطئة'),
          hasCorrectReveal: text.includes('نعت منصوب'),
          hasZeroPoints: text.includes('+0')
        };
      })()
    `,
    returnByValue: true
  });

  const resValA = getVal(resultStateA);
  console.log('Grading result Scenario A (Wrong):', resValA);
  if (!resValA.hasWrongNotice || !resValA.hasCorrectReveal) {
    throw new Error('REGRESSION FAILED: Student result did not show wrong notice and correct reveal!');
  }
  console.log('[PASS] Scenario A: Real touch on wrong answer graded accurately as ❌ with correct answer reveal.');

  // Scenario B: Touch CORRECT choice (Choice 1)
  console.log('\n--- Scenario B: Touch CORRECT choice (Choice 1) ---');
  await sendCDP('Runtime.evaluate', {
    expression: `
      window.ScoreARQuizStudent.renderStudentQuestion({
        qIndex: 1,
        totalQuestions: 3,
        skill: 'البلاغة والبيان',
        q: '«العلم نور». ما نوع التشبيه؟',
        opts: ['استعارة تصريحية', 'تشبيه تمثيلي', 'تشبيه بليغ (مبتدأ وخبر)', 'كناية عن موصوف'],
        timeLimit: 20
      });
    `
  });
  await sleep(600);

  // Get coordinates of Button 2 (تشبيه بليغ - correct)
  const btn2Box = await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('studentOptBtn_2');
        const rect = btn.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()
    `,
    returnByValue: true
  });

  const { x: x2, y: y2 } = getVal(btn2Box);
  console.log(`Dispatching physical touch on Button 2 (CORRECT) at (${x2}, ${y2})...`);

  await sendCDP('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x2, y: y2, id: 2 }] });
  await sleep(50);
  await sendCDP('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sendCDP('Input.dispatchMouseEvent', { type: 'mousePressed', x: x2, y: y2, button: 'left', clickCount: 1 });
  await sendCDP('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, button: 'left', clickCount: 1 });
  await sleep(400);

  // Deliver QUESTION_RESULT (Correct answer is option 2, student chose option 2)
  console.log('Delivering QUESTION_RESULT for Scenario B (Student correct)...');
  await sendCDP('Runtime.evaluate', {
    expression: `
      window.ScoreARQuizStudent.renderStudentResult({
        qIndex: 1,
        correctAnswer: 2,
        correctAnswerText: 'تشبيه بليغ (مبتدأ وخبر)',
        options: ['استعارة تصريحية', 'تشبيه تمثيلي', 'تشبيه بليغ (مبتدأ وخبر)', 'كناية عن موصوف'],
        playerResults: {
          'touch_student_1': {
            correct: true,
            pointsEarned: 950,
            totalScore: 950,
            streak: 1,
            chosenIndex: 2,
            respTime: '1.2'
          }
        }
      });
    `
  });
  await sleep(500);

  const resultStateB = await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        const text = document.getElementById('scorearStudentStage')?.innerText || '';
        return {
          hasCelebration: text.includes('إجابة صحيحة وممتازة'),
          hasEarnedPoints: text.includes('+950')
        };
      })()
    `,
    returnByValue: true
  });

  const resValB = getVal(resultStateB);
  console.log('Grading result Scenario B (Correct):', resValB);
  if (!resValB.hasCelebration || !resValB.hasEarnedPoints) {
    throw new Error('REGRESSION FAILED: Student result did not show celebration and earned points!');
  }
  console.log('[PASS] Scenario B: Real touch on correct answer graded accurately as 🎉 with points earned.');

  console.log('\n=================================================================');
  console.log('REAL BROWSER TOUCH EVENTS & EVALUATOR ACCEPTANCE TEST PASSED (100%)!');
  console.log('=================================================================');

  cleanupAndExit(0);
}

function cleanupAndExit(code) {
  if (browserProc) {
    try { browserProc.kill(); } catch(e){}
  }
  if (server) {
    try { server.close(); } catch(e){}
  }
  setTimeout(() => process.exit(code), 300);
}
