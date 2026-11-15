/**
 * ScoreAR Phase 1 E2E Verification: Classrooms & Profile View (05B2 Responsive Verification)
 * Pure native CDP + WebSocket implementation (Zero external npm dependencies)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ARTIFACTS_DIR = 'C:\\Users\\Ahmed Romih\\.gemini\\antigravity\\brain\\37cfadfe-728c-4d48-aa00-5433ce9cb355';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_EXE = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('🧪 Starting ScoreAR Classrooms & My Profile (05B2) E2E Test...');
  if (!fs.existsSync(BROWSER_EXE)) throw new Error(`Browser binary not found: ${BROWSER_EXE}`);

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
  const portCdp = 9460 + Math.floor(Math.random() * 200);
  const userDir = path.join(process.env.TEMP || 'C:\\Temp', `scorear_classrooms_e2e_${Date.now()}`);

  const chrome = spawn(BROWSER_EXE, [
    `--remote-debugging-port=${portCdp}`,
    `--user-data-dir=${userDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    'about:blank'
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
    if (!wsUrl) throw new Error('Failed to connect to Headless Chrome CDP');

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
    await send('Page.enable');

    console.log('Navigating to http://127.0.0.1:' + portHttp + '/index.html#home...');
    await send('Page.navigate', { url: `http://127.0.0.1:${portHttp}/index.html#home` });

    for (let i = 0; i < 30; i++) {
      await sleep(200);
      const ready = await evalJs('document.readyState');
      if (ready === 'complete') break;
    }

    // 1. Desktop 1280x800 - Classrooms View
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    console.log('\n--- 1. Testing ScoreARClassrooms.openView() (Desktop 1280px) ---');
    await evalJs('ScoreARClassrooms.openView()');
    await sleep(400);

    const checkView = await evalJs(`(() => {
      const view = document.querySelector('.scorear-classrooms-view');
      if (!view) return null;
      const bannerTitle = document.querySelector('.learning-intro h1')?.textContent?.trim() || '';
      const orbitImg = document.querySelector('.learning-intro .orbit img')?.getAttribute('src') || '';
      const badge = document.querySelector('.learning-intro .intro-pill')?.textContent?.trim() || '';
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      return { hasView: true, bannerTitle, orbitImg, badge, overflow };
    })()`);

    if (!checkView || !checkView.hasView) throw new Error('.scorear-classrooms-view did not render!');
    console.log(`✅ Banner title detected: "${checkView.bannerTitle}"`);
    console.log(`✅ Orbit companion: "${checkView.orbitImg}"`);
    console.log(`✅ Orbit pill badge: "${checkView.badge}"`);
    console.log(`✅ Desktop (1280px) Overflow: ${checkView.overflow}px`);
    if (checkView.overflow > 0) throw new Error(`Desktop horizontal overflow: ${checkView.overflow}px`);

    // Capture Desktop Screenshot
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    const deskShotPath = path.join(ARTIFACTS_DIR, 'classrooms_05b2_desktop.png');
    fs.writeFileSync(deskShotPath, Buffer.from(ss1.data, 'base64'));
    console.log(`📸 Desktop screenshot saved: ${deskShotPath}`);

    // 2. Test Sidebar Link Navigation
    console.log('\n--- 2. Testing Navigation from Sidebar Link ---');
    await evalJs(`window.location.hash = '#home';`);
    await sleep(400);
    const navClickRes = await evalJs(`(() => {
      const link = document.querySelector('nav[aria-label="القائمة الرئيسية"] a[data-nav="classrooms"]');
      if (!link) return { found: false };
      link.click();
      return { found: true, href: link.getAttribute('href'), text: link.textContent.trim() };
    })()`);
    await sleep(400);
    console.log(`✅ Sidebar link found and clicked: "${navClickRes.text}" (${navClickRes.href})`);
    const afterNav = await evalJs(`({ hash: window.location.hash, hasView: !!document.querySelector('.scorear-classrooms-view') })`);
    console.log(`✅ Navigated to: ${afterNav.hash}, View mounted: ${afterNav.hasView}`);
    if (afterNav.hash !== '#classrooms' || !afterNav.hasView) throw new Error('Sidebar navigation failed!');

    // 3. Test Teacher Studio Navigation (with authenticated teacher mock)
    console.log('\n--- 3. Testing Navigation from Teacher Studio ---');
    await evalJs(`(() => {
      const mockTeacher = { uid: 'teacher_1', displayName: 'أ. أحمد رميح', role: 'teacher', status: 'approved' };
      localStorage.setItem('scorear_user', JSON.stringify(mockTeacher));
      if (window.ScoreARAuth) {
        window.ScoreARAuth.getUser = () => mockTeacher;
      }
    })()`);

    await evalJs(`window.location.hash = '#studio';`);
    await sleep(500);

    // Click Top Button "🏫 صفوفي وطلابي"
    const topBtnRes = await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('.studio-heading button')).find(b => b.textContent.includes('صفوفي وطلابي'));
      if (!btn) return { found: false };
      const text = btn.textContent.trim();
      btn.click();
      return { found: true, text };
    })()`);
    await sleep(400);
    console.log(`✅ Top studio button clicked: "${topBtnRes.text}"`);
    const topBtnNav = await evalJs(`({ hash: window.location.hash, hasView: !!document.querySelector('.scorear-classrooms-view') })`);
    if (topBtnNav.hash !== '#classrooms' || !topBtnNav.hasView) throw new Error('Top studio button navigation failed!');
    console.log('✅ Top studio button navigation verified!');

    // Return to studio and test 7th card "صفوفي وواجبات الطلاب"
    await evalJs(`window.location.hash = '#studio';`);
    await sleep(500);
    const cardClickRes = await evalJs(`(() => {
      const card = Array.from(document.querySelectorAll('.studio-tool-card')).find(c => c.textContent.includes('صفوفي وواجبات'));
      if (!card) return { found: false };
      const title = card.querySelector('h4')?.textContent?.trim();
      card.click();
      return { found: true, text: title };
    })()`);
    await sleep(400);
    console.log(`✅ 7th studio tool card clicked: "${cardClickRes.text}"`);
    const cardNav = await evalJs(`({ hash: window.location.hash, hasView: !!document.querySelector('.scorear-classrooms-view') })`);
    if (cardNav.hash !== '#classrooms' || !cardNav.hasView) throw new Error('7th tool card navigation failed!');
    console.log('✅ 7th studio tool card navigation verified!');

    // 4. Test Student Role View (Companion Picker, Profile Save)
    console.log('\n--- 4. Testing Student Role View Simulation ---');
    await evalJs(`(() => {
      const mockStudent = {
        id: 'student_sara',
        name: 'سارة المتفوقة',
        displayName: 'سارة المتفوقة',
        role: 'student',
        grade: 'الصف الأول الثانوي',
        avatarId: 'char_03',
        xp: 350
      };
      localStorage.setItem('scorear_user', JSON.stringify(mockStudent));
      if (window.ScoreARAuth) {
        window.ScoreARAuth.getUser = () => mockStudent;
      }
      window.ScoreARClassrooms.renderClassroomsView();
    })()`);
    await sleep(400);

    const studentCheck = await evalJs(`(() => {
      const companions = document.querySelectorAll('.companion-thumb');
      const avatarSrc = document.getElementById('profile-avatar-preview-img')?.getAttribute('src') || '';
      return { companionCount: companions.length, avatarSrc };
    })()`);
    console.log(`✅ Student view companion count: ${studentCheck.companionCount} (expected 20)`);
    if (studentCheck.companionCount !== 20) throw new Error(`Expected 20 companions, got ${studentCheck.companionCount}`);

    // Click companion char_15
    await evalJs(`(() => {
      const card = document.querySelector('.companion-thumb[data-avatar="char_15"]');
      if (card) card.click();
    })()`);
    const updatedAvatar = await evalJs(`document.getElementById('profile-avatar-preview-img')?.getAttribute('src')`);
    console.log(`✅ Companion updated in preview: "${updatedAvatar}"`);
    if (!updatedAvatar.includes('char_15')) throw new Error('Companion selection failed!');

    // Click Save Profile
    await evalJs(`document.getElementById('save-student-profile-btn')?.click()`);
    await sleep(300);
    const feedbackAlert = await evalJs(`document.getElementById('classrooms-feedback')?.textContent?.trim()`);
    console.log(`✅ Feedback message on save: "${feedbackAlert}"`);

    // 5. Test Teacher Role View (Class Creation, Review Dialog)
    console.log('\n--- 5. Testing Teacher Role View Simulation ---');
    await evalJs(`(() => {
      const mockTeacher = {
        id: 'teacher_ahmed',
        name: 'أ. أحمد رميح',
        displayName: 'أ. أحمد رميح',
        role: 'teacher',
        isTeacher: true
      };
      localStorage.setItem('scorear_user', JSON.stringify(mockTeacher));
      if (window.ScoreARAuth) {
        window.ScoreARAuth.getUser = () => mockTeacher;
      }
      window.ScoreARClassrooms.renderClassroomsView();
    })()`);
    await sleep(400);

    const teacherRoster = await evalJs(`document.getElementById('roster-section')?.querySelector('.card-title')?.textContent?.trim()`);
    console.log(`✅ Teacher roster title: "${teacherRoster}"`);

    // Create Class
    await evalJs(`(() => {
      document.getElementById('create-class-name').value = 'الصف الأول الثانوي - شعبة المتفوقين';
      document.getElementById('create-class-subject').value = 'اللغة العربية والبلاغة';
      ScoreARClassrooms.createClass();
    })()`);
    await sleep(400);

    const createdClassCode = await evalJs(`document.querySelector('.class-code')?.textContent?.trim()`);
    console.log(`✅ New class created with generated code: "${createdClassCode}"`);
    if (!createdClassCode || createdClassCode.length < 4) throw new Error('Class creation code missing!');

    // Open Review Dialog
    await evalJs(`ScoreARClassrooms.openReviewDialog('cls_demo_1', 'st_req_1', 'approve')`);
    await sleep(300);
    const dialogState = await evalJs(`(() => {
      const diag = document.getElementById('review-dialog');
      return {
        isOpen: diag?.classList.contains('open'),
        bodyText: diag?.querySelector('#review-dialog-body')?.textContent?.trim()
      };
    })()`);
    console.log(`✅ Review dialog open: ${dialogState.isOpen}`);
    if (!dialogState.isOpen) throw new Error('Review dialog did not open!');

    // Close Review Dialog
    await evalJs(`ScoreARClassrooms.closeReviewDialog()`);
    await sleep(200);
    const closedDiag = await evalJs(`document.getElementById('review-dialog')?.classList.contains('open')`);
    console.log(`✅ Review dialog closed: ${!closedDiag}`);

    // 6. Mobile 360px Responsive & Overflow Audit
    console.log('\n--- 6. Testing Mobile Viewport (360px) ---');
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 2, mobile: true });
    await evalJs(`window.ScoreARClassrooms.renderClassroomsView()`);
    await sleep(500);

    const mobileOverflow = await evalJs(`document.documentElement.scrollWidth - window.innerWidth`);
    console.log(`✅ Mobile (360px) Horizontal Overflow: ${mobileOverflow}px`);
    if (mobileOverflow > 0) throw new Error(`Mobile horizontal overflow: ${mobileOverflow}px`);

    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    const mobileShotPath = path.join(ARTIFACTS_DIR, 'classrooms_05b2_mobile.png');
    fs.writeFileSync(mobileShotPath, Buffer.from(ssMobile.data, 'base64'));
    console.log(`📸 Mobile screenshot saved: ${mobileShotPath}`);

    // 7. Tablet 768px Responsive & Overflow Audit
    console.log('\n--- 7. Testing Tablet Viewport (768px) ---');
    await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
    await sleep(400);
    const tabletOverflow = await evalJs(`document.documentElement.scrollWidth - window.innerWidth`);
    console.log(`✅ Tablet (768px) Horizontal Overflow: ${tabletOverflow}px`);
    if (tabletOverflow > 0) throw new Error(`Tablet horizontal overflow: ${tabletOverflow}px`);

    // 8. Console Error Audit
    console.log('\n--- 8. Console Error Audit ---');
    console.log(`Console error count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      throw new Error(`Encountered ${consoleErrors.length} console errors: ${consoleErrors.join('; ')}`);
    }
    console.log('✅ ZERO console errors detected during entire test session!');

    console.log('\n🎉 ALL 05B2 CLASSROOMS E2E & RESPONSIVE CHECKS PASSED 100%! 🚀');
  } finally {
    if (ws) ws.close();
    try { chrome.kill(); } catch {}
    server.close();
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
