'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
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
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function startStaticServer(port = 8799) {
  const server = http.createServer((req, res) => {
    let rawPath = req.url.split('?')[0];
    if (rawPath === '/' || rawPath === '') rawPath = '/index.html';
    const filePath = path.join(PUBLIC_DIR, rawPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + rawPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function runUnifiedViewsTest() {
  console.log('\n--- Unified Views (Step 3) Automated E2E Verification ---');
  const server = await startStaticServer(8799);

  const cdpPort = 9335;
  const chromeProcess = spawn(BROWSER_EXE, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${cdpPort}`,
    'http://127.0.0.1:8799/#home'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      if (res.ok) {
        const tabs = await res.json();
        const t = tabs.find(x => x.type === 'page' && x.webSocketDebuggerUrl);
        if (t) { wsUrl = t.webSocketDebuggerUrl; break; }
      }
    } catch {}
  }
  assert(wsUrl, 'Failed to connect to Headless Chrome CDP');

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const callbacks = new Map();
  const consoleErrors = [];

  ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb(data);
    }
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      const text = data.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
      consoleErrors.push(text);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(data.params?.exceptionDetails?.text || 'RuntimeException');
    }
  };

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, (res) => {
        if (res.error) reject(new Error(res.error.message || JSON.stringify(res.error)));
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Runtime.enable');

  async function evaluate(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    return res.result?.value;
  }

  console.log('  1. Waiting for #home and core bundles to load...');
  let loaded = false;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      const isReady = await evaluate(`(() => {
        return document.readyState === 'complete' && typeof window.ScoreARUnifiedViews === 'object';
      })()`);
      if (isReady) { loaded = true; break; }
    } catch(e) {}
  }
  assert(loaded, 'Page or ScoreARUnifiedViews failed to load in time');
  console.log('  [PASS] ScoreARUnifiedViews loaded globally in production bundle');

  // Test 1: Open Cards View via in-app API
  console.log('  2. Testing In-App 20 Cards Gallery View (#cards)...');
  await evaluate(`window.ScoreARUnifiedViews.openView('cards')`);
  await sleep(350);

  const cardsModalVisible = await evaluate(`(() => {
    const el = document.getElementById('scorearUnifiedModalStage');
    return Boolean(el && el.style.display !== 'none' && window.location.hash === '#cards');
  })()`);
  assert(cardsModalVisible, 'Modal stage not visible or hash did not update to #cards');

  const cardsCount = await evaluate(`document.querySelectorAll('#cardsGrid .character-card').length`);
  assert.strictEqual(cardsCount, 20, `Expected 20 tactical cards in grid, found ${cardsCount}`);
  console.log(`  [PASS] Cards View rendered 20 tactical cards in-app without page reload`);

  // Test 2: Close Cards View
  console.log('  3. Testing Instant Return / Back Navigation...');
  await evaluate(`window.ScoreARUnifiedViews.closeView()`);
  await sleep(250);

  const isModalClosed = await evaluate(`(() => {
    const el = document.getElementById('scorearUnifiedModalStage');
    return Boolean(el && el.style.display === 'none' && window.location.hash === '#home');
  })()`);
  assert(isModalClosed, 'Modal stage should be closed and hash restored to #home');
  console.log('  [PASS] Instant Return restored previous state in <250ms');

  // Test 3: Open Heroes View via in-app API
  console.log('  4. Testing In-App 20 Heroes Gallery View (#characters)...');
  await evaluate(`window.ScoreARUnifiedViews.openView('heroes')`);
  await sleep(350);

  const heroesCount = await evaluate(`document.querySelectorAll('#avatarsGrid .character-card').length`);
  assert.strictEqual(heroesCount, 20, `Expected 20 heroes in avatarsGrid, found ${heroesCount}`);
  console.log(`  [PASS] Heroes View rendered 20 3D heroes in-app without page reload`);

  // Test 4: Open Podium View via in-app API
  console.log('  5. Testing In-App Podium View (#podium)...');
  await evaluate(`window.ScoreARUnifiedViews.openView('podium')`);
  await sleep(400);

  const hasPodium = await evaluate(`Boolean(document.getElementById('podiumHostStage'))`);
  assert(hasPodium, 'Podium host stage not mounted in in-app view');
  console.log('  [PASS] Podium View mounted seamlessly in-app');

  // Test 5: Close View and verify zero console errors
  await evaluate(`window.ScoreARUnifiedViews.closeView()`);
  await sleep(250);

  assert.strictEqual(consoleErrors.length, 0, `Uncaught console errors detected: ${consoleErrors.join(', ')}`);
  console.log('  [PASS] 0 uncaught console errors during entire unified views session');

  ws.close();
  chromeProcess.kill();
  server.close();

  console.log('\n🎉 ALL UNIFIED VIEWS (STEP 3) TESTS PASSED 100%!\n');
}

runUnifiedViewsTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
