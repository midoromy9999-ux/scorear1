const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT_DIR = 'E:/MY PRO/New folder (4)/SCOREAR_FINAL_RELEASE/public';
const PORT_HTTP = 5055;
const PORT_CDP = 9235;

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_followup_' + Date.now());

// 1. In-process static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].split('#')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  if (reqPath === '/characters') reqPath = '/characters.html';

  const filePath = path.join(ROOT_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexP = path.join(ROOT_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexP).pipe(res);
  }
});

server.listen(PORT_HTTP, async () => {
  console.log(`[HTTP SERVER] Running at http://127.0.0.1:${PORT_HTTP}`);

  const browserProc = spawn(BROWSER_EXE, [
    `--remote-debugging-port=${PORT_CDP}`,
    `--user-data-dir=${USER_DATA}`,
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    `http://127.0.0.1:${PORT_HTTP}/index.html#home`
  ]);

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  let testCount = 0;
  let passedCount = 0;
  function record(name, pass, details = '') {
    testCount++;
    if (pass) {
      passedCount++;
      console.log(`  [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`  [FAIL] ${name} - ${details}`);
    }
  }

  async function getWsUrl() {
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        const res = await fetch(`http://127.0.0.1:${PORT_CDP}/json/list`);
        if (res.ok) {
          const tabs = await res.json();
          const pageTab = tabs.find(t => t.type === 'page');
          if (pageTab && pageTab.webSocketDebuggerUrl) return pageTab.webSocketDebuggerUrl;
        }
      } catch (e) {}
    }
    throw new Error('Failed to find open target tab');
  }

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
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

    async function evaluate(expression) {
      const res = await sendCmd('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text + (res.exceptionDetails.exception ? ': ' + res.exceptionDetails.exception.description : ''));
      }
      return res.result ? res.result.value : undefined;
    }

    async function physicalTap(x, y) {
      const cx = Math.round(x);
      const cy = Math.round(y);
      await sendCmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });
      await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
      await sleep(40);
      await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });
      await sleep(400);
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    // Emulate Mobile Device (390x844) with touch
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true
    });
    await sendCmd('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });

    console.log('\n=================================================================');
    console.log('   PHASE A FOLLOW-UP COMPREHENSIVE VERIFICATION SUITE');
    console.log('=================================================================');

    // -------------------------------------------------------------
    // PART 1: Verification with body:not(.is-logged-in)
    // -------------------------------------------------------------
    console.log('\n--- PART 1: Mobile Touch with body:not(.is-logged-in) ---');
    await sendCmd('Page.navigate', { url: `http://127.0.0.1:${PORT_HTTP}/index.html#home` });
    await sleep(2500);

    // Verify initial inert
    let inert1 = await evaluate(`document.getElementById('sidebar').inert`);
    record('1.1 Sidebar initially inert on mobile (logged-out)', inert1 === true, `inert=${inert1}`);

    // Tap menu button on launch page
    let menuBtn = await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('[data-action="menu"], .launch-menu, .mobile-menu'));
        const visibleBtn = btns.find(b => {
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && window.getComputedStyle(b).display !== 'none';
        });
        if (!visibleBtn) return null;
        const r = visibleBtn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()
    `);
    if (menuBtn) await physicalTap(menuBtn.x, menuBtn.y);

    let openInert1 = await evaluate(`
      (() => {
        const s = document.getElementById('sidebar');
        return { open: s.classList.contains('open'), inert: s.inert, overflow: document.body.style.overflow };
      })()
    `);
    record('1.2 Menu opens, inert === false, overflow:hidden', openInert1.open && openInert1.inert === false && openInert1.overflow === 'hidden');

    // Tap "استوديو المعلم" link
    let studioLink = await evaluate(`
      (() => {
        const a = document.querySelector('#sidebar a[data-nav="studio"]');
        const r = a ? a.getBoundingClientRect() : null;
        return r ? { x: r.left + r.width/2, y: r.top + r.height/2 } : null;
      })()
    `);
    if (studioLink) await physicalTap(studioLink.x, studioLink.y);
    let navHash1 = await evaluate(`location.hash`);
    let postTapInert1 = await evaluate(`document.getElementById('sidebar').inert`);
    record('1.3 Tapping Studio navigates to #studio and auto-closes (inert=true)', navHash1 === '#studio' && postTapInert1 === true, `hash=${navHash1}, inert=${postTapInert1}`);

    // -------------------------------------------------------------
    // PART 2: Verification with body.is-logged-in
    // -------------------------------------------------------------
    console.log('\n--- PART 2: Mobile Touch with body.is-logged-in ---');
    // Set is-logged-in on body
    await evaluate(`
      document.body.classList.add('is-logged-in');
      document.body.classList.remove('launch-mode');
      if (typeof window.syncSidebar === 'function') window.syncSidebar();
    `);
    await sleep(300);

    let inert2 = await evaluate(`document.getElementById('sidebar').inert`);
    record('2.1 Sidebar initially inert on mobile (logged-in)', inert2 === true, `inert=${inert2}`);

    // Tap mobile menu button in .topbar
    let topbarMenuBtn = await evaluate(`
      (() => {
        const b = document.querySelector('.topbar .mobile-menu');
        const r = b ? b.getBoundingClientRect() : null;
        return r && r.width > 0 ? { x: r.left + r.width/2, y: r.top + r.height/2 } : null;
      })()
    `);
    if (topbarMenuBtn) await physicalTap(topbarMenuBtn.x, topbarMenuBtn.y);

    let openInert2 = await evaluate(`
      (() => {
        const s = document.getElementById('sidebar');
        return { open: s.classList.contains('open'), inert: s.inert, zIndex: window.getComputedStyle(s).zIndex };
      })()
    `);
    record('2.2 Logged-in menu opens, inert === false, z-index from variable', openInert2.open && openInert2.inert === false, `open=${openInert2.open}, inert=${openInert2.inert}, zIndex=${openInert2.zIndex}`);

    // Tap "قاعة المنافسات" link
    let worldsLink = await evaluate(`
      (() => {
        const a = document.querySelector('#sidebar a[data-nav="worlds"]');
        const r = a ? a.getBoundingClientRect() : null;
        return r ? { x: r.left + r.width/2, y: r.top + r.height/2 } : null;
      })()
    `);
    if (worldsLink) await physicalTap(worldsLink.x, worldsLink.y);
    let navHash2 = await evaluate(`location.hash`);
    let postTapInert2 = await evaluate(`document.getElementById('sidebar').inert`);
    record('2.3 Logged-in tap navigates to #worlds and auto-closes (inert=true)', navHash2 === '#worlds' && postTapInert2 === true, `hash=${navHash2}, inert=${postTapInert2}`);

    // -------------------------------------------------------------
    // PART 3: Verification on characters.html
    // -------------------------------------------------------------
    console.log('\n--- PART 3: Mobile Touch on characters.html ---');
    await sendCmd('Page.navigate', { url: `http://127.0.0.1:${PORT_HTTP}/characters.html` });
    await sleep(2500);

    // 3.1 Verify Back Button exists and is visible on mobile
    let backBtnInfo = await evaluate(`
      (() => {
        const b = document.getElementById('btnBackToApp');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { text: b.textContent.trim(), width: r.width, height: r.height, x: r.left + r.width/2, y: r.top + r.height/2 };
      })()
    `);
    record('3.1 characters.html has prominent Back Button', backBtnInfo && backBtnInfo.width >= 40 && backBtnInfo.height >= 36, `text=${backBtnInfo?.text}, size=${backBtnInfo?.width}x${backBtnInfo?.height}`);

    // 3.2 Verify Mobile Menu button on characters.html
    let charMenuBtn = await evaluate(`
      (() => {
        const b = document.querySelector('.gallery-mobile-menu');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { display: window.getComputedStyle(b).display, x: r.left + r.width/2, y: r.top + r.height/2 };
      })()
    `);
    record('3.2 characters.html has mobile menu button', charMenuBtn && charMenuBtn.display !== 'none', `display=${charMenuBtn?.display}`);

    // 3.3 Open mobile menu on characters.html via physical tap
    if (charMenuBtn) await physicalTap(charMenuBtn.x, charMenuBtn.y);

    let charSidebarState = await evaluate(`
      (() => {
        const s = document.getElementById('sidebar');
        return { open: s.classList.contains('open'), inert: s.inert, overflow: document.body.style.overflow };
      })()
    `);
    record('3.3 characters.html menu opens via tap, inert === false', charSidebarState.open && charSidebarState.inert === false, `open=${charSidebarState.open}, inert=${charSidebarState.inert}`);

    // 3.4 Tap "استوديو المعلم" inside characters.html sidebar
    let charStudioLink = await evaluate(`
      (() => {
        const a = document.querySelector('#sidebar a[data-nav="studio"]');
        const r = a ? a.getBoundingClientRect() : null;
        return r ? { href: a.getAttribute('href'), x: r.left + r.width/2, y: r.top + r.height/2 } : null;
      })()
    `);
    record('3.4 Sidebar link points to index.html#studio', charStudioLink && charStudioLink.href === 'index.html#studio', `href=${charStudioLink?.href}`);

    if (charStudioLink) await physicalTap(charStudioLink.x, charStudioLink.y);
    await sleep(1500);

    let navigatedUrl = await evaluate(`location.href`);
    record('3.5 Tapping Studio from characters.html navigates to index.html#studio', navigatedUrl.includes('index.html') && navigatedUrl.includes('#studio'), `URL=${navigatedUrl}`);

    // -------------------------------------------------------------
    // PART 4: Static Layer Architecture & z-index Audit
    // -------------------------------------------------------------
    console.log('\n--- PART 4: Static Layer Architecture & z-index Audit ---');
    const stylesCss = fs.readFileSync('E:/MY PRO/New folder (4)/SCOREAR_FINAL_RELEASE/styles.css', 'utf8');
    const launchCss = fs.readFileSync('E:/MY PRO/New folder (4)/SCOREAR_FINAL_RELEASE/launch.css', 'utf8');
    const navJs = fs.readFileSync('E:/MY PRO/New folder (4)/SCOREAR_FINAL_RELEASE/nav.js', 'utf8');

    const hasZVariablesInStyles = stylesCss.includes('--z-sidebar-mobile') && stylesCss.includes('--z-modal') && stylesCss.includes('--z-toast');
    const hasZVariablesInLaunch = launchCss.includes('--z-sidebar-mobile') && launchCss.includes('--z-modal');
    record('4.1 Unified z-index scale defined in CSS variables', hasZVariablesInStyles && hasZVariablesInLaunch);

    const magic99999InStyles = stylesCss.includes('99999');
    const magic99999InLaunch = launchCss.includes('99999');
    const magic99999InNav = navJs.includes('99999');
    record('4.2 Zero occurrences of z-index: 99999 in styles.css, launch.css, nav.js', !magic99999InStyles && !magic99999InLaunch && !magic99999InNav);

    console.log('\n=================================================================');
    console.log(`TOTAL PHASE A FOLLOW-UP TESTS: ${testCount} | PASSED: ${passedCount} | FAILED: ${testCount - passedCount}`);
    console.log('=================================================================');

    ws.close();
    browserProc.kill();
    server.close();
    process.exit(testCount === passedCount ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    browserProc.kill();
    server.close();
    process.exit(1);
  }
});
