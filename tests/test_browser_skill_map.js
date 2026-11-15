/**
 * Real Browser End-to-End Verification of Task 4 - Item 2 (Skill Map)
 * Tests live deployment on https://scorear2.web.app/#journey using Edge/Chrome Headless CDP
 * Verifies Desktop (1280x800) and Mobile (375x667) viewports.
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const PORT = 9226;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_test_skillmap_' + Date.now());

console.log('=================================================================');
console.log('   SCOREAR REAL BROWSER E2E: TASK 4 - ITEM 2 (خريطة المهارات)');
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

    // 1. Verify ScoreARSkillEngine and ScoreARSkillMap loaded
    let evalRes = await sendCmd('Runtime.evaluate', {
      expression: `Boolean(window.ScoreARSkillEngine && window.ScoreARSkillMap && typeof window.ScoreARSkillMap.mount === 'function')`
    });
    console.log('[STEP 1: SCRIPTS READY] SkillEngine & SkillMap loaded:', evalRes.result.value);
    if (!evalRes.result.value) throw new Error('ScoreARSkillEngine or ScoreARSkillMap failed to load');

    // 2. Desktop Viewport (1280x800)
    console.log('\n[STEP 2: DESKTOP VIEWPORT 1280x800]');
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(600);

    // Trigger mount if not mounted
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARSkillMap.mount();`
    });
    await sleep(800);

    let desktopCheck = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const map = document.querySelector('.scorear-skill-map-container');
          if (!map) return { found: false };
          const tracks = map.querySelectorAll('.scorear-track-card');
          const stations = map.querySelectorAll('.scorear-station-node');
          const text = map.innerText;
          return {
            found: true,
            trackCount: tracks.length,
            stationCount: stations.length,
            hasTitle: text.includes('خريطة المهارات والمحطات'),
            hasReviewTag: text.includes('قيد المراجعة اللغوية')
          };
        })()
      `,
      returnByValue: true
    });
    console.log('   -> Desktop Check:', desktopCheck.result.value);
    if (!desktopCheck.result.value.found || desktopCheck.result.value.trackCount < 3) {
      throw new Error('Skill Map container or tracks not found on Desktop');
    }

    // 3. Mobile Viewport (375x667)
    console.log('\n[STEP 3: MOBILE VIEWPORT 375x667]');
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(600);

    let mobileCheck = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const map = document.querySelector('.scorear-skill-map-container');
          if (!map) return { found: false };
          const wide = [];
          document.querySelectorAll('*').forEach(el => {
            if (el.scrollWidth > 375) {
              wide.push({ tag: el.tagName, id: el.id, cls: el.className, w: el.scrollWidth });
            }
          });
          const mapScrollWidth = map.scrollWidth;
          const mapClientWidth = map.clientWidth;
          return {
            found: true,
            mapScrollWidth,
            mapClientWidth,
            wide: wide.slice(0, 8),
            isMapOverflowing: mapScrollWidth > mapClientWidth + 10
          };
        })()
      `,
      returnByValue: true
    });
    console.log('   -> Mobile Check:', mobileCheck.result.value);
    if (!mobileCheck.result.value.found || mobileCheck.result.value.isMapOverflowing) {
      throw new Error('Skill Map overflows on Mobile or is missing');
    }

    // 4. Test Station Quiz Launch
    console.log('\n[STEP 4: START STATION QUIZ]');
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARSkillMap.startStation('grammar_naat', 'station_naat_01');`
    });
    await sleep(600);

    let quizCheck = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const stage = document.getElementById('scorearStationQuizStage');
          if (!stage || stage.style.display === 'none') return { launched: false };
          return {
            launched: true,
            title: stage.querySelector('header') ? stage.querySelector('header').innerText : '',
            hasOptions: stage.querySelectorAll('button').length >= 4,
            hasReviewTag: stage.innerText.includes('قيد المراجعة')
          };
        })()
      `,
      returnByValue: true
    });
    console.log('   -> Quiz Launch Check:', quizCheck.result.value);
    if (!quizCheck.result.value.launched || !quizCheck.result.value.hasOptions) {
      throw new Error('Station Quiz stage did not open properly');
    }

    // Close Quiz
    await sendCmd('Runtime.evaluate', {
      expression: `window.ScoreARSkillMap.closeStationQuiz();`
    });
    await sleep(400);

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
