/**
 * test_user_fixes_verification.cjs
 * Comprehensive Chrome CDP verification for:
 * 1. World Picker images (natural dimensions > 0)
 * 2. Podium testing on home page (renders top 3 pedestals, no "كاهوت")
 * 3. Enlarged quiz launch button in Quiz Bank
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_EXE = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
  };

  const server = http.createServer((req, res) => {
    let p = req.url.split('?')[0];
    if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p.replace(/^\//, ''));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      const ext = path.extname(f).toLowerCase();
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const portHttp = server.address().port;
  const portCdp = 9240 + Math.floor(Math.random() * 400);
  const userDir = path.join(process.env.TEMP || 'C:\\Temp', `scorear_fixes_v2_${Date.now()}`);

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
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
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

    const evaluate = async (expression) => {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res?.exceptionDetails) {
        throw new Error(res.exceptionDetails.text || 'Eval exception');
      }
      return res?.result?.value;
    };

    const takeScreenshot = async (filename) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res && res.data) {
        fs.writeFileSync(filename, Buffer.from(res.data, 'base64'));
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 850,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait until modules load
    for (let i = 0; i < 30; i++) {
      const ready = await evaluate('typeof window.ScoreARUnifiedViews !== "undefined" && typeof window.ScoreARPodiumEffects !== "undefined"');
      if (ready) break;
      await sleep(200);
    }

    // 1. Verify Home Page & Kahoot Word Removal
    console.log('\n--- 1. Testing Home Page & Kahoot Word Removal ---');
    const homeTextCheck = await evaluate(`(() => {
      const bodyText = document.body.innerText || '';
      return {
        hasKahootArabic: bodyText.includes('كاهوت'),
        hasKahootEnglish: bodyText.includes('Kahoot'),
        podiumLinkFound: !!Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.includes('منصة التتويج الاحتفالية'))
      };
    })()`);
    console.log('Home Text Check:', homeTextCheck);
    assert(!homeTextCheck.hasKahootArabic, 'Found Arabic word "كاهوت" in home text!');
    assert(!homeTextCheck.hasKahootEnglish, 'Found English word "Kahoot" in home text!');
    assert(homeTextCheck.podiumLinkFound, 'Podium link with "منصة التتويج الاحتفالية" found in sidebar!');

    // 2. Open Podium Modal & Verify Top 3 Pedestals Render
    console.log('\n--- 2. Testing Podium Testing from Home Page ---');
    await evaluate(`(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => (a.getAttribute('href') || '').includes('podium.html'));
      if (link) {
        link.click();
      } else {
        window.ScoreARUnifiedViews.openView('podium');
      }
    })()`);

    await sleep(1500);

    const podiumRenderCheck = await evaluate(`(() => {
      const stage = document.getElementById('scorearUnifiedModalStage');
      const pedestals = document.querySelectorAll('.kahoot-3d-pedestal, [id^="podiumPedestal_"]');
      const hostStage = document.getElementById('podiumHostStage');
      const headerTitle = document.querySelector('.gallery-header')?.innerText || '';
      const controls = Array.from(document.querySelectorAll('#scorearUnifiedModalStage button')).map(b => b.textContent.trim());
      return {
        stageVisible: stage && stage.style.display !== 'none',
        pedestalsCount: pedestals.length,
        hostStageFound: !!hostStage,
        controlsCount: controls.length,
        hasKahootText: (stage ? stage.innerText : '').includes('كاهوت'),
        headerTitle
      };
    })()`);

    console.log('Podium Render Check:', podiumRenderCheck);
    assert(podiumRenderCheck.stageVisible, 'Unified podium stage is displayed!');
    assert(podiumRenderCheck.pedestalsCount >= 3, 'At least 3 podium pedestals (1st, 2nd, 3rd) rendered!');
    assert(!podiumRenderCheck.hasKahootText, 'Podium stage does not contain user-facing "كاهوت" text!');

    const podiumShot = path.join(ROOT, 'proof_podium_test_fixed.png');
    await takeScreenshot(podiumShot);
    console.log(`Saved screenshot: ${podiumShot}`);

    // Close podium modal
    await evaluate(`(() => {
      if (window.ScoreARUnifiedViews && window.ScoreARUnifiedViews.closeView) {
        window.ScoreARUnifiedViews.closeView();
      }
    })()`);
    await sleep(500);

    // 3. Test World Picker Images
    console.log('\n--- 3. Testing World Picker Images ---');
    await evaluate(`(() => {
      if (window.ScoreARWorldFlow && window.ScoreARWorldFlow.openWorldPicker) {
        window.ScoreARWorldFlow.openWorldPicker({
          title: 'اختر عالم المسابقة التجريبي',
          onSelect: () => {}
        });
      }
    })()`);

    await sleep(1500);

    const worldImgStats = await evaluate(`(() => {
      const imgs = Array.from(document.querySelectorAll('#scorearWorldFlowModal img'));
      return imgs.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }));
    })()`);

    console.log(`Found ${worldImgStats.length} world images in picker:`);
    worldImgStats.forEach((st, i) => {
      console.log(`  World ${i + 1}: ${st.src.split('/').slice(-3).join('/')} -> ${st.naturalWidth}x${st.naturalHeight}`);
      assert(st.naturalWidth > 0, `World image ${st.src} failed to load (naturalWidth == 0)!`);
    });
    assert(worldImgStats.length >= 6, 'All 6 worlds rendered in picker!');

    const worldShot = path.join(ROOT, 'proof_world_picker_fixed.png');
    await takeScreenshot(worldShot);
    console.log(`Saved screenshot: ${worldShot}`);

    // Close world picker
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.world-flow-modal-close, .scorear-modal-close');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(500);

    // 4. Test Quiz Bank Launch Button
    console.log('\n--- 4. Testing Quiz Bank Launch Button Prominence ---');
    await evaluate(`(() => {
      const qzItem = {
        id: 'test_demo_quiz',
        title: 'مسابقة قواعد النحو والتراكيب الإعرابية',
        subject: 'اللغة العربية',
        grade: 'الثاني الثانوي',
        questions: [{ q: 'ما إعراب كلمة الحق؟' }],
        updatedAt: Date.now()
      };
      if (window.ScoreARQuizBankData) {
        window.ScoreARQuizBankData.getQuizzes = () => [qzItem];
        window.ScoreARQuizBankData.getFilteredQuizzes = () => ({ items: [qzItem], totalItems: 1, totalPages: 1, currentPage: 1 });
        window.ScoreARQuizBankData.getQuestions = () => [];
      }
      if (window.ScoreARQuizBank && window.ScoreARQuizBank.openBankHub) {
        window.ScoreARQuizBank.openBankHub();
      }
      if (window.ScoreARQuizBank && window.ScoreARQuizBank.switchTab) {
        window.ScoreARQuizBank.switchTab('quizzes');
      }
    })()`);

    await sleep(1200);

    const launchBtnStats = await evaluate(`(() => {
      const launchBtn = document.querySelector('.scorear-bank-card-actions .launch-primary');
      const hwBtn = document.querySelector('.scorear-bank-card-foot button[title="إرسال كواجب للصف"]');
      if (!launchBtn) return null;
      const rect = launchBtn.getBoundingClientRect();
      const style = window.getComputedStyle(launchBtn);
      return {
        text: launchBtn.textContent.trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        hasHwBtnBelow: !!hwBtn
      };
    })()`);

    console.log('Launch Button Stats:', launchBtnStats);
    assert(launchBtnStats, 'Launch button found in Quiz Bank card!');
    assert(launchBtnStats.width >= 200, `Launch button width (${launchBtnStats.width}px) is prominent (>= 200px)!`);
    assert(launchBtnStats.height >= 36, `Launch button height (${launchBtnStats.height}px) is prominent (>= 36px)!`);
    assert(launchBtnStats.hasHwBtnBelow, 'Homework button is organized neatly below the main launch button!');

    const bankShot = path.join(ROOT, 'proof_quiz_bank_large_btn.png');
    await takeScreenshot(bankShot);
    console.log(`Saved screenshot: ${bankShot}`);

    console.log('\n=============================================================');
    console.log('🎉 ALL 4 USER FIXES VERIFIED 100% IN LIVE HEADLESS CHROME! 🚀');
    console.log('=============================================================');

  } finally {
    try { if (ws) ws.close(); } catch {}
    try { chrome.kill(); } catch {}
    server.close();
  }
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
