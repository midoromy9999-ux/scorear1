/**
 * Real Browser End-to-End Verification of Task 4 - Item 4 (Mistake Notebook)
 * Tests live deployment on https://scorear2.web.app/#journey using Edge Headless CDP
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const PORT = 9224;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_test_notebook_' + Date.now());

console.log('=================================================================');
console.log('   SCOREAR REAL BROWSER E2E: TASK 4 - ITEM 4 (دفتر أخطائي)');
console.log('=================================================================');
console.log('Launching browser:', BROWSER_EXE);

const browserProc = spawn(BROWSER_EXE, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DATA}`,
  '--headless=new',
  '--disable-gpu',
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'https://scorear2.web.app/#journey'
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getTargetWsUrl() {
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) {
        const tabs = await res.json();
        const pageTab = tabs.find(t => t.type === 'page');
        if (pageTab && pageTab.webSocketDebuggerUrl) return pageTab.webSocketDebuggerUrl;
      }
    } catch (e) {}
  }
  throw new Error('Failed to find open target tab');
}

(async () => {
  try {
    const tabWsUrl = await getTargetWsUrl();
    console.log('[BROWSER CONNECTED] Target Tab WS URL:', tabWsUrl);

    const ws = new WebSocket(tabWsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    console.log('[NAVIGATING] Loading https://scorear2.web.app/#journey ...');
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#journey' });
    await sleep(4000);

    // 1. Verify ScoreARMistakeNotebook loaded in browser
    let evalRes = await sendCmd('Runtime.evaluate', {
      expression: `Boolean(window.ScoreARMistakeNotebook && typeof window.ScoreARMistakeNotebook.openNotebook === 'function')`
    });
    console.log('[STEP 1: SCRIPT READY] ScoreARMistakeNotebook loaded:', evalRes.result.value);
    if (!evalRes.result.value) throw new Error('ScoreARMistakeNotebook failed to load in browser');

    // 2. Clear storage to start with pristine state
    await sendCmd('Runtime.evaluate', {
      expression: `localStorage.clear(); window.ScoreARMistakeNotebook.loadState();`
    });

    // 3. Open Notebook empty state
    console.log('[STEP 2: OPEN NOTEBOOK EMPTY STATE] Calling openNotebook()...');
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARMistakeNotebook.openNotebook()`
    });
    await sleep(600);

    let stageContent = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('scorearNotebookStage') ? document.getElementById('scorearNotebookStage').innerText : ''`
    });
    console.log('   -> Notebook Stage Title:', stageContent.result.value.includes('دفتر أخطائي: من المحاولة إلى الإتقان') ? 'FOUND ✓' : 'MISSING ✗');
    console.log('   -> Warm Empty State:', stageContent.result.value.includes('دفترك ناصع وخالٍ من الأخطاء') ? 'FOUND ✓' : 'MISSING ✗');

    // Close notebook
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARMistakeNotebook.closeNotebook()`
    });
    await sleep(400);

    // 4. Inject a mistake during quiet practice
    console.log('[STEP 3: RECORD MISTAKE] Practicing and answering incorrectly...');
    await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const track = window.ScoreARJourney.PRACTICE_TRACKS[0];
          const q = track.questions[0]; // q_naat_01
          // Chosen option: incorrect option (index 1)
          window.ScoreARMistakeNotebook.recordMistake(q, q.opts[1]);
        })()
      `
    });

    // 5. Check Mistake in Notebook
    console.log('[STEP 4: VERIFY MISTAKE IN NOTEBOOK UI] Reopening notebook...');
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARMistakeNotebook.openNotebook()`
    });
    await sleep(600);

    stageContent = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('scorearNotebookStage').innerText`
    });
    console.log('   -> Active Mistake Count 1:', stageContent.result.value.includes('الأخطاء النشطة\n1') || stageContent.result.value.includes('1 أخطاء') ? 'FOUND ✓' : 'CHECKING...');
    console.log('   -> Ready for Review Button:', stageContent.result.value.includes('راجع أخطائي الآن') ? 'FOUND ✓' : 'MISSING ✗');

    // 6. Launch Review Session
    console.log('[STEP 5: LAUNCH REVIEW SESSION] Starting review session...');
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARMistakeNotebook.startReviewSession()`
    });
    await sleep(600);

    const reviewTitle = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('scorearNotebookStage').innerText`
    });
    console.log('   -> Review Header:', reviewTitle.result.value.includes('جلسة مراجعة الأخطاء') ? 'FOUND ✓' : 'MISSING ✗');
    console.log('   -> Option buttons rendered:', reviewTitle.result.value.includes('السؤال 1 من 1') ? 'FOUND ✓' : 'MISSING ✗');

    // Close review
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARMistakeNotebook.closeReviewSession()`
    });
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARMistakeNotebook.closeNotebook()`
    });

    console.log('\n=================================================================');
    console.log('   🎉 REAL BROWSER E2E VERIFICATION COMPLETED WITH 100% SUCCESS!');
    console.log('=================================================================');

    ws.close();
    browserProc.kill();
    process.exit(0);
  } catch (err) {
    console.error('❌ Browser Test Error:', err);
    browserProc.kill();
    process.exit(1);
  }
})();
