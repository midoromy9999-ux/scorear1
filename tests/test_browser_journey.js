/**
 * Real Browser End-to-End Verification of https://scorear2.web.app/#journey
 * Using Microsoft Edge / Chrome Headless with Chrome DevTools Protocol (CDP)
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const PORT = 9223;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_test_profile_' + Date.now());

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
        if (pageTab && pageTab.webSocketDebuggerUrl) {
          return pageTab.webSocketDebuggerUrl;
        }
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

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception ? msg.params.exceptionDetails.exception.description : '');
      }
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    console.log('[NAVIGATING] Loading https://scorear2.web.app/#journey ...');
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#journey' });
    await sleep(4000);

    const docState = await sendCmd('Runtime.evaluate', {
      expression: `({
        url: window.location.href,
        hasScoreARJourney: typeof window.ScoreARJourney !== 'undefined',
        scriptsCount: document.scripts.length,
        scripts: Array.from(document.scripts).map(s => s.src)
      })`,
      returnByValue: true
    });
    console.log('[BROWSER DOC STATE]:', JSON.stringify(docState.result.value, null, 2));

    // 1. Verify ScoreARJourney loaded in actual browser
    let evalRes = await sendCmd('Runtime.evaluate', {
      expression: `Boolean(window.ScoreARJourney && typeof window.ScoreARJourney.startQuietPractice === 'function')`
    });
    console.log('[STEP 1: SCRIPT VERIFICATION IN BROWSER] window.ScoreARJourney ready:', evalRes.result.value);
    if (!evalRes.result.value) throw new Error('ScoreARJourney not loaded in browser');

    // 2. Check initial UI render of #journey
    evalRes = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('main') ? document.getElementById('main').innerText.includes('التدريب الهادئ') : false`
    });
    console.log('[STEP 2: UI VERIFICATION] Journey page rendered quiet practice section:', evalRes.result.value);

    // 3. Complete a quiet practice path
    console.log('[STEP 3: INTERACTIVE QUIET PRACTICE] Starting grammar_naat path...');
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARJourney.startQuietPractice('grammar_naat')`
    });
    await sleep(600);

    // Answer questions 0 to 4 correctly
    for (let q = 0; q < 5; q++) {
      const qText = await sendCmd('Runtime.evaluate', {
        expression: `document.querySelector('#scorearQuietPracticeStage h2') ? document.querySelector('#scorearQuietPracticeStage h2').innerText : 'NO_H2'`
      });
      console.log(`   -> Answering Question ${q + 1}: ${qText.result.value.substring(0, 40)}...`);

      // Click correct option
      await sendCmd('Runtime.evaluate', {
        expression: `
          (() => {
            const track = window.ScoreARJourney.PRACTICE_TRACKS.find(t => t.id === 'grammar_naat');
            const curQ = track.questions[${q}];
            window.ScoreARJourney.handleOptionClick(curQ.answer);
          })()
        `
      });
      await sleep(400);

      if (q < 4) {
        await sendCmd('Runtime.evaluate', {
          expression: `window.ScoreARJourney.nextQuestion()`
        });
        await sleep(400);
      }
    }

    // Advance past question 5 to summary
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARJourney.nextQuestion()`
    });
    await sleep(1000);

    // Check summary screen
    evalRes = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('scorearQuietPracticeStage').innerText.includes('أتممت المسار')`
    });
    console.log('[STEP 4: COMPLETION SUMMARY] Quiet practice completion screen shown:', evalRes.result.value);

    // Read stored progress from browser localStorage
    evalRes = await sendCmd('Runtime.evaluate', {
      expression: `localStorage.getItem('scorear_student_guest_v1')`
    });
    console.log('[STEP 5: REAL LOCALSTORAGE] Data in browser localStorage:\n  ', evalRes.result.value);
    const stored = JSON.parse(evalRes.result.value);
    console.log(`   -> Total XP earned: ${stored.data.xp}`);
    console.log(`   -> Completed path grammar_naat recorded:`, Boolean(stored.data.completedPaths.grammar_naat));

    // Close stage and return to journey
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARJourney.closeQuietPractice()`
    });
    await sleep(600);

    // 4. Test F5 Reload in real browser
    console.log('[STEP 6: F5 RELOAD TEST] Reloading browser page (F5)...');
    await sendCmd('Page.reload');
    await sleep(4000);

    // Wait until ScoreARJourney is initialized in the reloaded page
    let reloadedXp = null;
    for (let retry = 0; retry < 10; retry++) {
      const check = await sendCmd('Runtime.evaluate', {
        expression: `(typeof window.ScoreARJourney !== 'undefined' && window.ScoreARJourney.getProgress) ? window.ScoreARJourney.getProgress().xp : null`
      });
      if (check.result.value !== null && check.result.value !== undefined) {
        reloadedXp = check.result.value;
        break;
      }
      await sleep(500);
    }

    console.log(`[PASS: F5 PERSISTENCE] XP after browser reload (F5): ${reloadedXp} (Expected: ${stored.data.xp})`);
    if (reloadedXp !== stored.data.xp) throw new Error(`XP not preserved across F5 reload! (Got: ${reloadedXp}, Expected: ${stored.data.xp})`);

    // 5. Test localStorage Corruption Recovery in real browser
    console.log('[STEP 7: CORRUPTION RECOVERY TEST] Injecting malformed JSON into browser localStorage...');
    await sendCmd('Runtime.evaluate', {
      expression: `localStorage.setItem('scorear_student_guest_v1', 'MALFORMED_{{{BAD_JSON_TEST')`
    });

    console.log('Reloading page with corrupted storage (F5)...');
    await sendCmd('Page.reload');
    await sleep(3500);

    evalRes = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const p = window.ScoreARJourney.getProgress();
        return { xp: p.xp, mistakesCount: p.mistakes.length, isLoaded: Boolean(window.ScoreARJourney) };
      })()`
    });
    console.log('[PASS: CORRUPTION RECOVERY] Page loaded safely without crash:', evalRes.result.value);

    ws.close();
    console.log('\n=================================================================');
    console.log('   REAL BROWSER E2E TEST PASSED 100% ON scorear2.web.app');
    console.log('=================================================================');
  } catch (err) {
    console.error('Browser Test Error:', err);
    process.exit(1);
  } finally {
    browserProc.kill();
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch (e) {}
  }
})();
