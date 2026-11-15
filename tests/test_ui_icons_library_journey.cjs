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
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8'
};

function resolveSrcFile(f) {
  const candidates = [
    path.join(ROOT, f),
    path.join(ROOT, 'js', 'engines', f),
    path.join(ROOT, 'js', 'quiz', f),
    path.join(ROOT, 'js', 'journey', f),
    path.join(ROOT, 'js', 'auth', f),
    path.join(ROOT, 'js', 'ui', f),
    path.join(ROOT, 'css', f)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(ROOT, f);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function runUnitChecks() {
  console.log('\n--- Part A: Unit & Rule 7 Verification ---');
  const limit500 = [
    'ui-icons.js', 'library-hub.js', 'journey-extras.js',
    'skill-map.js', 'mistake-notebook.js', 'streak.js', 'student-journey.js',
    'quiz-builder.js', 'quiz-bank.js', 'quiz-ai-review.js', 'quiz-ai.js',
    'quiz-importer.js', 'quiz-reports.js', 'admin-management.js'
  ];
  for (const f of limit500) {
    const lines = fs.readFileSync(resolveSrcFile(f), 'utf8').split('\n').length;
    assert(lines <= 500, `${f} exceeded 500 lines (${lines})`);
    console.log(`  [PASS] Line Count <= 500: ${f} (${lines})`);
  }
  const appLines = fs.readFileSync(resolveSrcFile('app.js'), 'utf8').split('\n').length;
  assert(appLines <= 1000, `app.js exceeded 1000 lines (${appLines})`);
  console.log(`  [PASS] Line Count <= 1000: app.js (${appLines})`);

  // Forbidden phrasing check on newly written files
  for (const f of ['ui-icons.js', 'library-hub.js', 'journey-extras.js']) {
    const raw = fs.readFileSync(resolveSrcFile(f), 'utf8');
    assert(!/يستحيل|منعدم/.test(raw), `Forbidden Arabic phrasing found in ${f}`);
  }
  console.log('  [PASS] Forbidden Arabic phrasing guard passed');

  // Load Lucide + ScoreARUI + ScoreARJourney + ScoreARJourneyExtras in sandbox
  const storage = {};
  const vm = require('vm');
  const sb = {
    Intl, Date, Math, Array, Object, String, Number, Boolean, JSON, Set, RegExp, console,
    localStorage: {
      getItem: k => storage[k] ?? null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; }
    },
    location: { hash: '#journey' },
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, appendChild() {} }), body: { appendChild() {} } }
  };
  sb.window = sb; sb.self = sb; sb.globalThis = sb; sb.global = sb;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'vendor/lucide.js'), 'utf8'), sb);
  vm.runInNewContext(fs.readFileSync(resolveSrcFile('ui-icons.js'), 'utf8'), sb);
  vm.runInNewContext(fs.readFileSync(resolveSrcFile('student-journey.js'), 'utf8'), sb);
  vm.runInNewContext(fs.readFileSync(resolveSrcFile('journey-extras.js'), 'utf8'), sb);

  const UI = sb.ScoreARUI;
  assert(UI && typeof UI.icon === 'function', 'ScoreARUI missing');
  const crownSvg = UI.icon('crown');
  assert(crownSvg.includes('<svg') && crownSvg.includes('viewBox="0 0 24 24"'), 'Crown icon did not render Lucide SVG');
  console.log('  [PASS] ScoreARUI.icon("crown") renders verified Lucide SVG');

  for (const ext of ['pdf', 'docx', 'pptx', 'xlsx', 'png', 'txt']) {
    const html = UI.fileIconBox(`sample.${ext}`);
    assert(html.includes('scorear-file-badge') && html.includes('scorear-icon-box'), `fileIconBox failed for ${ext}`);
    assert(/tone-(violet|cyan)/.test(html), `fileIconBox must stay on violet/cyan palette for ${ext}`);
  }
  console.log('  [PASS] ScoreARUI.fileIconBox uses unified purple/cyan glowing linear icon boxes');

  const JE = sb.ScoreARJourneyExtras;
  // 22:30 UTC on 2026-11-11 is 00:30 Africa/Cairo on 2026-11-12 (UTC+2)
  const tsLateUtc = Date.UTC(2026, 10, 11, 22, 30, 0);
  const cairoDay = JE.getCairoDayKey(tsLateUtc);
  assert.strictEqual(cairoDay, '2026-11-12', `Expected Cairo date 2026-11-12, got ${cairoDay}`);
  console.log('  [PASS] Cairo timezone rollover verified (22:30 UTC -> next Cairo day)');

  const qA = JE.getDailyQuestions('2026-11-12');
  const qB = JE.getDailyQuestions('2026-11-12');
  assert.strictEqual(qA.length, 3, 'Expected 3 daily questions');
  assert.deepStrictEqual(qA.map(q => q.id), qB.map(q => q.id), 'Daily questions must be deterministic');
  console.log(`  [PASS] Daily Challenge deterministic 3 questions: ${qA.map(q => q.id).join(', ')}`);

  const first = JE.completeDailyChallenge(3, 3, tsLateUtc);
  assert.strictEqual(first.xpGain, 20, 'First completion should grant +20 XP');
  const second = JE.completeDailyChallenge(3, 3, tsLateUtc + 60000);
  assert.strictEqual(second.xpGain, 0, 'Replay same Cairo day must grant 0 extra XP');
  console.log('  [PASS] Daily Challenge awards +20 XP once per Cairo day');

  for (let i = 0; i < 56; i++) {
    JE.recordAttempt({ title: `Att ${i}`, correct: 2, total: 3, cairoDate: cairoDay });
  }
  const stAfter = JE.getExtrasState(tsLateUtc);
  assert.strictEqual(stAfter.attempts.length, 50, `Expected max 50 attempts kept, got ${stAfter.attempts.length}`);
  console.log('  [PASS] Attempts history strictly capped at 50 entries');

  const badges = JE.computeBadges(stAfter);
  assert.strictEqual(badges.length, 4, 'Expected 4 badges');
  assert(badges.find(b => b.id === 'daily_hero')?.earned, 'daily_hero badge should be earned');
  console.log('  [PASS] All 4 Achievement Badges computed accurately');
}

async function runBrowserChecks() {
  console.log('\n--- Part B: Live Headless Chrome E2E & Viewport Overflow Audit ---');
  assert(fs.existsSync(BROWSER_EXE), `Browser binary not found: ${BROWSER_EXE}`);

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
  const portCdp = 9240 + Math.floor(Math.random() * 400);
  const userDir = path.join(process.env.TEMP || 'C:\\Temp', `scorear_ui_v8_${Date.now()}`);

  const chrome = spawn(BROWSER_EXE, [
    `--remote-debugging-port=${portCdp}`,
    `--user-data-dir=${userDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `http://127.0.0.1:${portHttp}/index.html#home`
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
    assert(wsUrl, 'Failed to connect to Headless Chrome CDP');

    ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();
    const consoleErrors = [];
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params?.exceptionDetails?.text || 'RuntimeException');
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
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
    let homeInfo = null;
    for (let i = 0; i < 25; i++) {
      homeInfo = await evalJs(`(() => {
        const crownSvg = document.querySelector('a[href="podium.html"] [data-icon="crown"] svg');
        return {
          ready: document.readyState,
          hasCrownSvg: !!crownSvg,
          lucideLoaded: !!window.lucide,
          uiLoaded: !!window.ScoreARUI,
          libLoaded: !!window.ScoreARLibraryHub,
          journeyExtrasLoaded: !!window.ScoreARJourneyExtras
        };
      })()`);
      if (homeInfo.ready === 'complete' && homeInfo.uiLoaded && homeInfo.libLoaded && homeInfo.journeyExtrasLoaded && homeInfo.hasCrownSvg) break;
      await sleep(250);
    }
    assert(homeInfo && homeInfo.lucideLoaded && homeInfo.uiLoaded && homeInfo.libLoaded && homeInfo.journeyExtrasLoaded, `Core scripts failed to load in page: ${JSON.stringify(homeInfo)} errors=${JSON.stringify(consoleErrors)}`);
    assert(homeInfo.hasCrownSvg, 'Sidebar podium.html crown icon missing SVG');
    console.log('  [PASS] #home loaded with Lucide Crown SVG + ScoreARUI + LibraryHub + JourneyExtras');

    // 2. Test #library E2E: upload text file -> stored -> search -> preview -> AI studio prefill -> delete
    await evalJs(`location.hash = '#library';`);
    await sleep(500);
    const libResult = await evalJs(`(async () => {
      const sampleFile = new File(['الفاعل مرفوع دائماً وعلامة رفعه الضمة في الاسم المفرد.'], 'نحو_الفاعل.txt', { type: 'text/plain' });
      await window.ScoreARLibraryHub.handleSelectedFiles([sampleFile]);
      await new Promise(r => setTimeout(r, 350));
      const cardCount = document.querySelectorAll('.scorear-file-card').length;
      const extBadge = document.querySelector('.scorear-file-ext-pill')?.textContent?.trim();
      const previewBtn = document.querySelector('[data-lib-act="preview"]');
      previewBtn?.click();
      await new Promise(r => setTimeout(r, 150));
      const previewText = document.querySelector('#scorearLibPreviewDialog .scorear-preview-text')?.textContent || '';
      const aiBtn = document.getElementById('libDlgAiBtn');
      aiBtn?.click();
      await new Promise(r => setTimeout(r, 350));
      const aiTextarea = document.querySelector('#scorearAiStudioModal #aiTextInput')?.value || '';
      if (window.ScoreARQuizAI?.closeAiStudio) window.ScoreARQuizAI.closeAiStudio();
      return { cardCount, extBadge, hasPreview: previewText.includes('الفاعل مرفوع'), hasAiText: aiTextarea.includes('الفاعل مرفوع') };
    })()`);
    assert(libResult.cardCount >= 1 && libResult.extBadge === 'TXT', `Library list failed: ${JSON.stringify(libResult)}`);
    assert(libResult.hasPreview && libResult.hasAiText, `Library preview->AI handoff failed: ${JSON.stringify(libResult)}`);
    console.log('  [PASS] #library upload -> TXT extraction -> preview modal -> AI Studio prefill verified');

    // 3. Test #journey E2E: Companion image loaded, metrics, Daily Challenge flow, Badges, Recent Attempts
    await evalJs(`location.hash = '#journey';`);
    await sleep(700);
    const journeyResult = await evalJs(`(async () => {
      const heroImg = document.querySelector('.scorear-hero-avatar img');
      const imgOk = !!(heroImg && heroImg.complete && heroImg.naturalWidth > 0);
      const metricsCount = document.querySelectorAll('.scorear-metric-card').length;
      const badgesCount = document.querySelectorAll('.scorear-badge-card').length;
      document.getElementById('startDailyChallengeBtn')?.click();
      await new Promise(r => setTimeout(r, 200));
      for (let step = 0; step < 3; step++) {
        document.querySelector('#dailyOptionsWrap button')?.click();
        await new Promise(r => setTimeout(r, 80));
        document.getElementById('dailyNextBtn')?.click();
        await new Promise(r => setTimeout(r, 80));
      }
      document.getElementById('dailyDoneCloseBtn')?.click();
      await new Promise(r => setTimeout(r, 300));
      const attemptsCount = document.querySelectorAll('.scorear-attempt-row').length;
      const earnedBadges = document.querySelectorAll('.scorear-badge-card.earned').length;
      return { imgOk, metricsCount, badgesCount, attemptsCount, earnedBadges };
    })()`);
    assert(journeyResult.imgOk, 'Journey hero companion avatar image failed to load');
    assert.strictEqual(journeyResult.metricsCount, 4, 'Expected 4 Journey metric cards');
    assert.strictEqual(journeyResult.badgesCount, 4, 'Expected 4 Badge cards');
    assert(journeyResult.attemptsCount >= 1 && journeyResult.earnedBadges >= 2, `Daily challenge completion did not update UI: ${JSON.stringify(journeyResult)}`);
    console.log(`  [PASS] #journey E2E verified (Avatar OK, Daily Challenge completed, ${journeyResult.attemptsCount} attempt(s), ${journeyResult.earnedBadges} badges earned)`);

    // 3b. Test Redesigned Quiz & Question Bank Hub (#scorearQuizBankStage) + Modals
    const bankCheck = await evalJs(`(async () => {
      window.ScoreARQuizBank.openBankHub('quizzes');
      await new Promise(r => setTimeout(r, 250));
      const stage = document.getElementById('scorearQuizBankStage');
      const heroStatCount = stage?.querySelectorAll('.scorear-bank-stat-pill').length || 0;
      const hasTabs = (stage?.querySelectorAll('.scorear-bank-tab').length || 0) >= 3;
      const tabText = stage?.querySelector('.scorear-bank-tabs')?.textContent || '';
      const hasEmoji = /[\\u{1F300}-\\u{1FAFF}]/u.test(tabText);
      window.ScoreARQuizBank.openAddQuestionModal();
      const qDlgOpen = !!document.getElementById('scorearAddBankQDialog')?.open;
      document.querySelector('#scorearAddBankQDialog [data-dlg-close]')?.click();
      window.ScoreARQuizBank.switchTab('folders');
      window.ScoreARQuizBank.openCreateFolderModal();
      const fldDlgOpen = !!document.getElementById('scorearAddFolderDialog')?.open;
      document.querySelector('#scorearAddFolderDialog [data-dlg-close]')?.click();
      window.ScoreARQuizBank.switchTab('quizzes');
      const hasDeleteFolder = typeof window.ScoreARQuizBank.deleteFolder === 'function';
      return { heroStatCount, hasTabs, hasEmoji, qDlgOpen, fldDlgOpen, hasDeleteFolder };
    })()`);
    assert(bankCheck.heroStatCount === 3 && bankCheck.hasTabs, `Bank Hub Hero/tabs check failed: ${JSON.stringify(bankCheck)}`);
    assert(!bankCheck.hasEmoji, 'Bank Hub tabs should not contain emojis');
    assert(bankCheck.qDlgOpen && bankCheck.fldDlgOpen && bankCheck.hasDeleteFolder, `Bank Hub modals/deleteFolder check failed: ${JSON.stringify(bankCheck)}`);
    console.log('  [PASS] Quiz & Question Bank Hub Hero, 3 stats, zero emojis & Add-Question/Create-Folder modals verified');

    // Check Bank Hub zero horizontal overflow on 360px Mobile, 768px Tablet, 1366px Desktop
    for (const vp of [
      { name: 'Mobile', width: 360, height: 800, mobile: true },
      { name: 'Tablet', width: 768, height: 1024, mobile: true },
      { name: 'Desktop', width: 1366, height: 900, mobile: false }
    ]) {
      await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
      await sleep(150);
      const bDims = await evalJs(`(() => {
        const main = document.querySelector('#scorearQuizBankStage .scorear-bank-main');
        return { stageScroll: main ? main.scrollWidth : 0, stageClient: main ? main.clientWidth : 0, docScroll: document.documentElement.scrollWidth, innerW: window.innerWidth };
      })()`);
      assert(bDims.stageScroll <= bDims.stageClient + 2 && bDims.docScroll <= bDims.innerW + 2, `Bank Hub overflow on ${vp.name}: ${JSON.stringify(bDims)}`);
    }
    await evalJs(`window.ScoreARQuizBank.closeBankHub();`);
    console.log('  [PASS] Quiz & Question Bank Hub 0px horizontal overflow on Mobile (360px), Tablet (768px), Desktop (1366px)');

    // 4. Multi-Viewport Layout & Zero Horizontal Overflow Audit (360px Mobile, 768px Tablet, 1366px Desktop)
    const viewports = [
      { name: 'Mobile', width: 360, height: 800, mobile: true },
      { name: 'Tablet', width: 768, height: 1024, mobile: true },
      { name: 'Desktop', width: 1366, height: 900, mobile: false }
    ];
    const routes = ['#home', '#library', '#journey', '#studio', '#worlds'];
    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
      for (const route of routes) {
        await evalJs(`location.hash = '${route}';`);
        await sleep(350);
        const dims = await evalJs(`(() => ({
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          bodyTextLen: (document.body.innerText || '').trim().length
        }))()`);
        assert(dims.bodyTextLen > 20, `${vp.name} ${route} rendered empty`);
        assert(dims.scrollW <= dims.innerW + 2, `Horizontal overflow on ${vp.name} (${vp.width}px) at ${route}: scrollWidth=${dims.scrollW} > innerWidth=${dims.innerW}`);
      }
      console.log(`  [PASS] Viewport ${vp.name} (${vp.width}px): 0px overflow across #home, #library, #journey, #studio, #worlds`);
    }

    assert.strictEqual(consoleErrors.length, 0, `Uncaught runtime console errors: ${consoleErrors.join('; ')}`);
    console.log('  [PASS] Zero uncaught runtime errors during entire browser session');
  } finally {
    try { ws?.close(); } catch {}
    try { chrome.kill(); } catch {}
    server.close();
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}
  }
}

(async () => {
  try {
    console.log('=================================================================');
    console.log('   SCOREAR UI ICONS, LIBRARY HUB & JOURNEY EXTRAS SUITE');
    console.log('=================================================================');
    runUnitChecks();
    await runBrowserChecks();
    console.log('\n🎉 ALL UI, LIBRARY HUB & JOURNEY EXTRAS CHECKS PASSED 100%!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  }
})();
