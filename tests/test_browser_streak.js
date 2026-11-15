/**
 * Real Browser End-to-End Verification of Task 4 - Item 3 (Daily Streak)
 * Tests live deployment on https://scorear2.web.app/#journey using Edge/Chrome Headless CDP
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const PORT = 9225;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_test_streak_' + Date.now());

console.log('=================================================================');
console.log('   SCOREAR REAL BROWSER E2E: TASK 4 - ITEM 3 (سلسلة الأيام)');
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

    // 1. Verify ScoreARStreak and ScoreARMistakeScheduler loaded in browser
    let evalRes = await sendCmd('Runtime.evaluate', {
      expression: `Boolean(window.ScoreARStreak && window.ScoreARMistakeScheduler)`
    });
    console.log('[STEP 1: SCRIPTS READY] Streak & MistakeScheduler loaded:', evalRes.result.value);
    if (!evalRes.result.value) throw new Error('ScoreARStreak or ScoreARMistakeScheduler failed to load in browser');

    // 2. Clear storage to start with fresh slate
    await sendCmd('Runtime.evaluate', {
      expression: `
        localStorage.clear();
        window.ScoreARStreak.loadState();
        window.ScoreARJourney.renderJourneyPage();
      `
    });
    await sleep(500);

    // 3. Verify Streak Card in DOM
    let cardCheck = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.scorear-streak-card');
          if (!card) return { found: false };
          const dots = card.querySelectorAll('.scorear-streak-dot');
          const text = card.innerText;
          return {
            found: true,
            dotCount: dots.length,
            hasTitle: text.includes('سلسلة الأيام'),
            hasBest: text.includes('أفضل سلسلة'),
            hasCurrent: text.includes('يوم متتالي') || text.includes('أيام متتالية') || text.includes('0')
          };
        })()
      `,
      returnByValue: true
    });
    console.log('[STEP 2: STREAK CARD DOM]', cardCheck.result.value);
    if (!cardCheck.result.value.found || cardCheck.result.value.dotCount !== 7) {
      throw new Error('Streak Card not found or does not have 7 dots');
    }

    // 4. Answering 4 questions -> day should still be inactive
    console.log('[STEP 3: 4 QUESTIONS] Answering 4 questions (below active threshold of 5)...');
    let fourQRes = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          for (let i = 0; i < 4; i++) {
            window.ScoreARStreak.recordQuestionAnswered();
          }
          const s = window.ScoreARStreak.loadStreakFromStorage();
          return {
            count: s.count,
            dailyQuestionsCount: s.dailyQuestionsCount,
            lastActiveDate: s.lastActiveDate
          };
        })()
      `,
      returnByValue: true
    });
    console.log('   -> After 4 questions:', fourQRes.result.value);
    if (fourQRes.result.value.count !== 0 || fourQRes.result.value.lastActiveDate !== null) {
      throw new Error('Streak became active prematurely before 5 questions');
    }

    // 5. Answer 5th question -> day becomes active!
    console.log('[STEP 4: 5TH QUESTION] Answering 5th question...');
    let fifthQRes = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          window.ScoreARStreak.recordQuestionAnswered();
          window.ScoreARJourney.renderJourneyPage();
          const s = window.ScoreARStreak.loadStreakFromStorage();
          const card = document.querySelector('.scorear-streak-card');
          return {
            count: s.count,
            dailyQuestionsCount: s.dailyQuestionsCount,
            lastActiveDate: s.lastActiveDate,
            hasCard: Boolean(card)
          };
        })()
      `,
      returnByValue: true
    });
    console.log('   -> After 5th question:', fifthQRes.result.value);
    if (fifthQRes.result.value.count !== 1 || !fifthQRes.result.value.lastActiveDate) {
      throw new Error('Streak did not activate on 5th question');
    }

    // 6. Verify XP unchanged (Zero XP rule)
    console.log('[STEP 5: ZERO XP VERIFICATION] Checking XP did not increase...');
    let xpCheck = await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARJourney.getProgress().xp`
    });
    console.log('   -> Current Student XP:', xpCheck.result.value);
    if (xpCheck.result.value !== 0) {
      throw new Error('XP increased unexpectedly from streak activity!');
    }

    // 7. Verify Warm Message
    let msgCheck = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.scorear-streak-card');
          return card ? card.innerText : '';
        })()
      `
    });
    console.log('   -> Card Text includes warm encouragement:', msgCheck.result.value.includes('ممتاز') || msgCheck.result.value.includes('رائع') || msgCheck.result.value.includes('اليوم مكتمل'));

    console.log('\n=================================================================');
    console.log('   🎉 BROWSER E2E VERIFICATION COMPLETED WITH 100% SUCCESS!');
    console.log('=================================================================');
    ws.close();
    browserProc.kill();
    process.exit(0);
  } catch (err) {
    console.error('[BROWSER TEST FAILED]', err);
    browserProc.kill();
    process.exit(1);
  }
})();
