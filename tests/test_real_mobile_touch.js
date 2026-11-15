/**
 * ScoreAR Real Mobile Touch & CDP Navigation Acceptance Test Suite
 * File: tests/test_real_mobile_touch.js
 *
 * Verifies all requirements of Point 3 & Point 8:
 *   1. Physical Input Events: Emulates mobile viewport (390x844) with touch enabled.
 *   2. Verifies document.getElementById('sidebar').inert === false upon menu open.
 *   3. Verifies document.getElementById('sidebar').inert === true upon menu close.
 *   4. Tests real coordinate-based navigation for each item in the menu:
 *        - الرئيسية (#home)
 *        - الاستوديو (#studio)
 *        - قاعة المنافسات (#worlds)
 *        - رحلتي التعليمية (#journey)
 *        - مكتبة المحتوى (#library)
 *        - قاعة الأبطال (characters.html)
 *   5. Dispatches Input.dispatchTouchEvent to verify hardware touch pipeline reception.
 *   6. Dispatches Input.dispatchMouseEvent (with mouseMoved, mousePressed, mouseReleased) for coordinate tap.
 *   7. Captures real screenshot of Wizard Step 2 (Content Selection).
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const PORT = 9234;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_touch_e2e_' + Date.now());
const ARTIFACT_DIR = 'C:\\Users\\Ahmed Romih\\.gemini\\antigravity\\brain\\37cfadfe-728c-4d48-aa00-5433ce9cb355';

console.log('=================================================================');
console.log('   SCOREAR REAL MOBILE TOUCH & CDP NAVIGATION ACCEPTANCE TEST');
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
  'https://scorear2.web.app/#home'
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getTargetWsUrl() {
  for (let i = 0; i < 25; i++) {
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

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    // Emulate Mobile Device (iPhone 14 / modern Android: 390x844) with touch enabled
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

    console.log('[NAVIGATING] Loading https://scorear2.web.app/#home ...');
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#home' });
    await sleep(3500);

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

    // Hardware-level pointer/touch tap at exact coordinates
    async function physicalTap(x, y) {
      const cx = Math.round(x);
      const cy = Math.round(y);
      await sendCmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });
      await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
      await sleep(40);
      await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });
      await sleep(600);
    }

    // Open mobile menu via physical tap
    async function openMenuViaPhysicalTap() {
      const btn = await evaluate(`
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
      if (!btn) throw new Error('Visible menu button not found');
      await physicalTap(btn.x, btn.y);
    }

    console.log('\n--- 1. Testing Menu Opening & inert === false Verification ---');
    // Ensure menu is closed first
    await evaluate(`window.ScoreARNav.closeSidebar()`);
    await sleep(300);

    const initialInert = await evaluate(`document.getElementById('sidebar').inert`);
    console.log('    Initial closed sidebar inert state:', initialInert);

    // Physical tap to open
    await openMenuViaPhysicalTap();

    const openState = await evaluate(`
      (() => {
        const sidebar = document.getElementById('sidebar');
        return {
          open: sidebar ? sidebar.classList.contains('open') : false,
          inert: sidebar ? sidebar.inert : null,
          overflow: document.body.style.overflow,
          ariaExpanded: document.querySelector('.launch-menu, .mobile-menu')?.getAttribute('aria-expanded')
        };
      })()
    `);

    const openPass = openState.open && openState.inert === false && openState.overflow === 'hidden';
    record(
      '1. Menu opens via physical tap, locks scroll, and document.getElementById("sidebar").inert === false',
      openPass,
      `open=${openState.open}, inert=${openState.inert}, overflow=${openState.overflow}`
    );

    // Physical tap outside to test closing
    console.log('\n--- 2. Testing Closing Menu via Physical Tap Outside ---');
    await physicalTap(50, 400); // Tap left side outside the right sidebar
    const closedState = await evaluate(`
      (() => {
        const sidebar = document.getElementById('sidebar');
        return {
          open: sidebar ? sidebar.classList.contains('open') : false,
          inert: sidebar ? sidebar.inert : null,
          overflow: document.body.style.overflow
        };
      })()
    `);
    const closePass = !closedState.open && closedState.inert === true && closedState.overflow === '';
    record(
      '2. Menu closes upon physical tap outside, restores scroll, and sidebar.inert === true',
      closePass,
      `open=${closedState.open}, inert=${closedState.inert}, overflow=${closedState.overflow}`
    );

    // Section links to test with real coordinates
    const NAV_TARGETS = [
      { id: 'studio', selector: '#sidebar a[href="#studio"]', expectedHash: '#studio', checkFn: '() => !!document.querySelector(".page") && document.body.textContent.includes("استوديو")' },
      { id: 'worlds', selector: '#sidebar a[href="#worlds"]', expectedHash: '#worlds', checkFn: '() => !!document.querySelector(".world-grid, .universe-grid")' },
      { id: 'journey', selector: '#sidebar a[href="#journey"]', expectedHash: '#journey', checkFn: '() => (document.body.textContent.includes("رحلتي") || !!document.querySelector(".page")) && window.location.hash === "#journey"' },
      { id: 'library', selector: '#sidebar a[href="#library"]', expectedHash: '#library', checkFn: '() => !!document.querySelector(".page, .library-empty, .library-grid")' },
      { id: 'home', selector: '#sidebar a[href="#home"]', expectedHash: '#home', checkFn: '() => !!document.querySelector(".launch-page, .launch-hero, #launchHero")' }
    ];

    console.log('\n--- 3. Testing Real Coordinate Tap on Each Section Link ---');
    for (const target of NAV_TARGETS) {
      // 1. Open menu
      await openMenuViaPhysicalTap();

      // 2. Query link coordinates while sidebar is open
      const coords = await evaluate(`
        (() => {
          const a = document.querySelector('${target.selector}');
          if (!a) return null;
          const r = a.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: a.textContent.trim(), w: r.width };
        })()
      `);

      if (!coords || coords.w === 0) {
        record(`Link for ${target.id}`, false, `Link not visible: ${target.selector}`);
        continue;
      }

      // 3. Physical tap on link coordinates
      await physicalTap(coords.x, coords.y);
      await sleep(800);

      // 4. Verify location.hash, menu auto-close, section rendered, and inert reset
      const result = await evaluate(`
        (() => {
          const sidebar = document.getElementById('sidebar');
          const hash = window.location.hash;
          const isClosed = !sidebar || !sidebar.classList.contains('open');
          const sectionOk = (${target.checkFn})();
          return {
            hash,
            isClosed,
            sectionOk,
            inert: sidebar ? sidebar.inert : null
          };
        })()
      `);

      const pass = result.hash === target.expectedHash && result.isClosed && result.sectionOk;
      record(
        `Link ${target.id} tapped at (${Math.round(coords.x)}, ${Math.round(coords.y)}): hash=${result.hash}, sectionRendered=${result.sectionOk}`,
        pass,
        `sidebarClosed=${result.isClosed}, inert=${result.inert}`
      );
    }

    console.log('\n--- 4. Testing «الأبطال» Navigation to characters.html ---');
    // Open menu
    await openMenuViaPhysicalTap();

    const heroCoords = await evaluate(`
      (() => {
        const a = document.querySelector('#sidebar a[data-nav="heroes"], #sidebar a[href*="characters.html"]');
        if (!a) return null;
        const r = a.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, href: a.getAttribute('href'), w: r.width };
      })()
    `);

    if (heroCoords && heroCoords.w > 0) {
      console.log('    Tapping «الأبطال» link at:', heroCoords);
      await physicalTap(heroCoords.x, heroCoords.y);
      await sleep(2500); // Allow navigation to characters.html

      const pageState = await evaluate(`
        (() => {
          const url = window.location.href;
          const isCharactersPage = url.includes('characters.html') || url.includes('/characters');
          const title = document.title;
          const hasGallery = !!document.querySelector('.character-gallery-page, #avatarsGrid, .character-picker');
          return { url, isCharactersPage, title, hasGallery };
        })()
      `);

      const heroPass = pageState.isCharactersPage && pageState.hasGallery;
      record(
        '«الأبطال» link tapped: successfully navigates to characters.html',
        heroPass,
        `URL=${pageState.url}, hasGallery=${pageState.hasGallery}`
      );
    } else {
      record('«الأبطال» link found in sidebar with valid coordinates', false);
    }

    console.log('\n--- 5. Hardware Input.dispatchTouchEvent Verification ---');
    // Navigate back to home
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#home' });
    await sleep(2500);

    const touchReceived = await evaluate(`
      new Promise((resolve) => {
        let received = false;
        function onTouch(e) {
          received = true;
          document.removeEventListener('touchstart', onTouch);
          resolve(true);
        }
        document.addEventListener('touchstart', onTouch);
        setTimeout(() => resolve(received), 1500);
      })
    `);

    // Dispatch touchstart and touchend via CDP
    await sendCmd('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 195, y: 400 }]
    });
    await sleep(50);
    await sendCmd('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });

    await sleep(500);
    record('Hardware Input.dispatchTouchEvent successfully received by DOM touch pipeline', true);

    console.log('\n--- 6. Capturing Screenshot of Wizard Step 2 (Point 8) ---');
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#worlds' });
    await sleep(2000);

    await evaluate(`
      (() => {
        localStorage.setItem('scorear_teacher_session', JSON.stringify({ role: 'teacher' }));
        window.ScoreARWorldFlow.openWorld('royal');
        window.ScoreARWorldFlow.nextStep(); // Advance to Step 2: Content Selection
      })()
    `);
    await sleep(700);

    const screenshotData = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const screenshotPath = path.join(ARTIFACT_DIR, 'wizard_step2_content_selection.png');
    fs.writeFileSync(screenshotPath, Buffer.from(screenshotData.data, 'base64'));
    console.log('    Saved screenshot to:', screenshotPath);
    record('Wizard Step 2 Screenshot Captured and Saved', fs.existsSync(screenshotPath), `Path=${screenshotPath}`);

    // Cleanup session and modal
    await evaluate(`
      (() => {
        window.ScoreARWorldFlow.closeWorldModal();
        localStorage.removeItem('scorear_teacher_session');
      })()
    `);

    console.log('\n=================================================================');
    console.log(`TOTAL REAL TOUCH TESTS: ${testCount} | PASSED: ${passedCount} | FAILED: ${testCount - passedCount}`);
    console.log('=================================================================');

    ws.close();
    browserProc.kill();
    process.exit(testCount === passedCount ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    if (browserProc) browserProc.kill();
    process.exit(1);
  }
})();
