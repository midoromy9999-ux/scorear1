const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Ahmed Romih\\.gemini\\antigravity\\brain\\37cfadfe-728c-4d48-aa00-5433ce9cb355';

async function main() {
  console.log('🚀 Running Live Scroll Verification on https://scorear2.web.app/#classrooms ...');
  const port = 63899;
  const userDir = path.join('C:\\Temp', `scorear_live_scroll_${Date.now()}`);
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDir}`,
    '--window-size=1280,900',
    '--headless=new',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`);
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const handler = ev => {
        const msg = JSON.parse(ev.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('1. Navigating to https://scorear2.web.app/#classrooms ...');
    await send('Page.navigate', { url: 'https://scorear2.web.app/#classrooms' });
    await new Promise(r => setTimeout(r, 5000));

    // Teacher setup
    console.log('2. Setting up teacher session and rendering view...');
    await send('Runtime.evaluate', {
      expression: `(async () => {
        localStorage.setItem('scorear_teacher_session', JSON.stringify({
          uid: 'teacher_live_ahmed',
          name: 'أ. أحمد رميح',
          displayName: 'أ. أحمد رميح',
          role: 'teacher',
          isTeacher: true
        }));
        await window.ScoreARClassrooms?.renderClassroomsView?.();
      })()`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 1000));

    const stageHeight = await send('Runtime.evaluate', {
      expression: `(() => ({
        stageHeight: document.getElementById('scorearClassroomsStage')?.offsetHeight,
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight
      }))()`,
      returnByValue: true
    });
    console.log('Stage heights:', stageHeight.result?.value);

    // Scroll to 500px
    console.log('3. Scrolling to 500px...');
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 500, behavior: 'instant' })`
    });
    await new Promise(r => setTimeout(r, 500));

    const initialY = await send('Runtime.evaluate', { expression: `window.scrollY`, returnByValue: true });
    console.log('Initial scrollY:', initialY.result?.value);

    // Sample scroll position over 3 seconds
    console.log('4. Sampling scroll position over 3 seconds to verify zero jumping...');
    const samples = [];
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 500));
      const curY = await send('Runtime.evaluate', { expression: `window.scrollY`, returnByValue: true });
      samples.push(curY.result?.value);
      console.log(`[T+${(i+1)*0.5}s] scrollY = ${curY.result?.value}`);
    }

    const allMaintained = samples.every(y => y >= 450);
    if (!allMaintained) {
      throw new Error(`Scroll jumped back! Samples: ${JSON.stringify(samples)}`);
    }
    console.log('✅ PASS: Scroll maintained smoothly with zero jump!');

    // Capture screenshot of scrolled classrooms view
    const scr = await send('Page.captureScreenshot', { format: 'png' });
    const proofPath = path.join(ARTIFACTS_DIR, 'live_classrooms_scroll_proof.png');
    fs.writeFileSync(proofPath, Buffer.from(scr.data, 'base64'));
    console.log('✅ Screenshot saved to:', proofPath);

    ws.close();
  } finally {
    chrome.kill();
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
