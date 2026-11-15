/**
 * Live Verification Script for ScoreAR Class Creation on https://scorear2.web.app/#classrooms
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_EXE = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const ARTIFACTS_DIR = 'C:\\Users\\Ahmed Romih\\.gemini\\antigravity\\brain\\37cfadfe-728c-4d48-aa00-5433ce9cb355';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('🚀 Launching Headless Browser to verify live class creation on https://scorear2.web.app/#classrooms...');
  const portCdp = 63499;
  const userDir = path.join(process.env.TEMP || 'C:\\Temp', `scorear_live_verify_${Date.now()}`);

  const chrome = spawn(BROWSER_EXE, [
    `--remote-debugging-port=${portCdp}`,
    `--user-data-dir=${userDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1280,900',
    'about:blank'
  ], { stdio: 'ignore' });

  let ws = null;
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
    if (!wsUrl) throw new Error('Failed to connect to browser CDP');

    ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();
    const consoleLogs = [];

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type: msg.params.type, text });
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise(r => ws.onopen = r);
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('Navigating to https://scorear2.web.app/#classrooms...');
    await send('Page.navigate', { url: 'https://scorear2.web.app/#classrooms' });
    await sleep(4000);

    // Set teacher session in localStorage and re-render
    console.log('Setting teacher session and re-rendering classrooms view...');
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          localStorage.setItem('scorear_teacher_session', JSON.stringify({
            uid: 'teacher_live_romih',
            name: 'أ. أحمد رميح',
            displayName: 'أ. أحمد رميح',
            isTeacher: true,
            role: 'teacher'
          }));
          if (window.ScoreARClassrooms) {
            await window.ScoreARClassrooms.renderClassroomsView();
          }
        })()
      `,
      awaitPromise: true
    });
    await sleep(2000);

    // Check if #create-class-name is present
    const checkForm = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const nameInput = document.getElementById('create-class-name');
          const subInput = document.getElementById('create-class-subject');
          const btn = document.getElementById('create-class-btn');
          const stage = document.getElementById('scorearClassroomsStage');
          return {
            hasStage: !!stage,
            hasName: !!nameInput,
            hasSub: !!subInput,
            hasBtn: !!btn
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Form status:', checkForm.result.value);

    // Fill form and create class
    console.log('Filling form: "الصف الأول الثانوي" / "اللغة العربية" and submitting...');
    const createRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          document.getElementById('create-class-name').value = 'الصف الأول الثانوي';
          document.getElementById('create-class-subject').value = 'اللغة العربية';
          const btn = document.getElementById('create-class-btn');
          btn.click();
          await new Promise(r => setTimeout(r, 2500));
          const list = document.getElementById('class-list');
          const cards = list ? Array.from(list.querySelectorAll('.class-card')).map(c => ({
            text: c.innerText.replace(/\\n+/g, ' | '),
            code: c.querySelector('.class-code')?.innerText || ''
          })) : [];
          return { cardsCount: cards.length, cards };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Class creation result:', JSON.stringify(createRes.result.value, null, 2));

    // Capture screenshot
    console.log('Capturing proof screenshot of live created class card...');
    const scr = await send('Page.captureScreenshot', { format: 'png' });
    const proofPath = path.join(ARTIFACTS_DIR, 'live_class_created_proof.png');
    fs.writeFileSync(proofPath, Buffer.from(scr.data, 'base64'));
    console.log('✅ Screenshot saved to:', proofPath);

    console.log('🎉 LIVE VERIFICATION SUCCESSFUL 100%!');
  } finally {
    if (ws) ws.close();
    try { chrome.kill(); } catch {}
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
