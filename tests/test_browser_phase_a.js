/**
 * ScoreAR Real Browser Automated Test Suite: Phase A (tests/test_browser_phase_a.js)
 * Tests live deployment on https://scorear2.web.app using Headless Edge/Chrome with CDP
 * Verifies:
 *   1. Mobile Menu: Open on Home/Studio/Heroes, auto-close on link click, click outside, Escape, scroll lock, aria-expanded.
 *   2. Responsive Viewports: 320, 360, 390, 430, 768, 1024, 1280 (document.scrollWidth <= innerWidth, no horizontal overflow).
 *   3. Character image aspect ratio and scaling.
 *   4. Rename "دخول المعلم" -> "دخول".
 *   5. Worlds Flow: Guest showcase modal + CTA «ادخل لتبدأ كمعلم» vs Teacher 3-step wizard.
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_EXE = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
const PORT = 9227;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'scorear_phase_a_' + Date.now());

console.log('=================================================================');
console.log('   SCOREAR REAL BROWSER CDP TEST SUITE: PHASE A');
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

    console.log('[NAVIGATING] Loading https://scorear2.web.app/#home ...');
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#home' });
    await sleep(3500);

    // Set initial mobile viewport 375x667
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);

    let testCount = 0;
    let passedCount = 0;
    function record(name, pass, details = '') {
      testCount++;
      if (pass) {
        passedCount++;
        console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      } else {
        console.error(`[FAIL] ${name} - ${details}`);
      }
    }

    // TEST 1: Check Modules Loaded
    const modulesLoaded = await evaluate(`
      typeof window.ScoreARNav !== 'undefined' && typeof window.ScoreARWorldFlow !== 'undefined'
    `);
    record('1. ScoreARNav and ScoreARWorldFlow scripts loaded on window', modulesLoaded);

    // TEST 2: Check "دخول" Rename
    const loginButtonText = await evaluate(`
      (() => {
        const btn = document.querySelector('[data-action="teacher-login"], .launch-primary');
        return btn ? btn.textContent.trim() : '';
      })()
    `);
    record('2. Button renamed to "دخول" without "دخول المعلم"', loginButtonText.includes('دخول') && !loginButtonText.includes('دخول المعلم'), `Text="${loginButtonText}"`);

    // TEST 3: Mobile Menu Opens on Home (#home)
    const menuOpenHome = await evaluate(`
      (() => {
        const menuBtn = document.querySelector('[data-action="menu"], .launch-menu');
        if (!menuBtn) return { error: 'menu button not found' };
        menuBtn.click();
        const sidebar = document.getElementById('sidebar');
        const computed = sidebar ? window.getComputedStyle(sidebar) : null;
        return {
          hasOpenClass: sidebar ? sidebar.classList.contains('open') : false,
          display: computed ? computed.display : '',
          visibility: computed ? computed.visibility : '',
          bodyOverflow: document.body.style.overflow,
          ariaExpanded: menuBtn.getAttribute('aria-expanded')
        };
      })()
    `);
    const homeMenuPass = menuOpenHome.hasOpenClass && menuOpenHome.display !== 'none' && menuOpenHome.bodyOverflow === 'hidden' && menuOpenHome.ariaExpanded === 'true';
    record('3. Mobile menu opens on Home page (#home) with display!=none and scroll lock', homeMenuPass, JSON.stringify(menuOpenHome));

    // TEST 4: Auto-close when clicking link inside sidebar
    const autoCloseLink = await evaluate(`
      (() => {
        const link = document.querySelector('#sidebar a[href="#studio"], #sidebar a[data-nav="studio"]');
        if (!link) return { error: 'nav link not found' };
        link.click();
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.querySelector('[data-action="menu"], .launch-menu');
        return {
          hasOpenClass: sidebar ? sidebar.classList.contains('open') : false,
          bodyOverflow: document.body.style.overflow,
          ariaExpanded: menuBtn ? menuBtn.getAttribute('aria-expanded') : '',
          hash: window.location.hash
        };
      })()
    `);
    const linkClosePass = !autoCloseLink.hasOpenClass && autoCloseLink.bodyOverflow === '' && autoCloseLink.ariaExpanded === 'false';
    record('4. Mobile menu auto-closes when navigation link is clicked', linkClosePass, JSON.stringify(autoCloseLink));

    await sleep(600);

    // TEST 5: Mobile menu on #studio and Escape to close
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#studio' });
    await sleep(1500);

    const escapeTest = await evaluate(`
      (() => {
        const menuBtn = document.querySelector('[data-action="menu"], .launch-menu, .mobile-menu');
        if (menuBtn) menuBtn.click();
        const sidebar = document.getElementById('sidebar');
        const opened = sidebar && sidebar.classList.contains('open');
        const scrollLocked = document.body.style.overflow === 'hidden';

        // Press Escape
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        const closed = sidebar && !sidebar.classList.contains('open');
        const scrollRestored = document.body.style.overflow === '';

        return { opened, scrollLocked, closed, scrollRestored };
      })()
    `);
    const escapePass = escapeTest.opened && escapeTest.scrollLocked && escapeTest.closed && escapeTest.scrollRestored;
    record('5. Mobile menu opens on #studio and closes on Escape key', escapePass, JSON.stringify(escapeTest));

    // TEST 6: Mobile menu click outside to close
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#heroes' });
    await sleep(1500);

    const outsideClickTest = await evaluate(`
      (() => {
        const menuBtn = document.querySelector('[data-action="menu"], .launch-menu, .mobile-menu');
        if (menuBtn) menuBtn.click();
        const sidebar = document.getElementById('sidebar');
        const opened = sidebar && sidebar.classList.contains('open');

        // Click outside (on document body)
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
        const closed = sidebar && !sidebar.classList.contains('open');

        return { opened, closed };
      })()
    `);
    record('6. Mobile menu closes upon clicking outside the sidebar', outsideClickTest.opened && outsideClickTest.closed, JSON.stringify(outsideClickTest));

    // TEST 7: Responsive Viewport Checks on Heroes Page (320, 360, 390, 430, 768, 1024, 1280)
    console.log('\n--- Checking Heroes Page Responsive Viewports (No Horizontal Overflow) ---');
    const viewports = [320, 360, 390, 430, 768, 1024, 1280];
    let allViewportsPass = true;

    for (const vp of viewports) {
      await sendCmd('Emulation.setDeviceMetricsOverride', {
        width: vp,
        height: 800,
        deviceScaleFactor: 1,
        mobile: vp < 768
      });
      await sleep(350);

      const metrics = await evaluate(`
        (() => {
          const scrollW = document.documentElement.scrollWidth;
          const innerW = window.innerWidth;
          const bodyScrollW = document.body.scrollWidth;
          const avatarsGrid = document.getElementById('avatarsGrid');
          const gridCols = avatarsGrid ? window.getComputedStyle(avatarsGrid).gridTemplateColumns : '';
          return {
            vp: ${vp},
            scrollW,
            innerW,
            bodyScrollW,
            hasOverflow: scrollW > (innerW + 1),
            gridCols: gridCols.split(' ').length
          };
        })()
      `);

      const vpPass = !metrics.hasOverflow;
      if (!vpPass) allViewportsPass = false;
      console.log(`  Viewport ${vp}px: scrollW=${metrics.scrollW}, innerW=${metrics.innerW}, gridCols=${metrics.gridCols} -> ${vpPass ? 'PASS' : 'OVERFLOW FAIL'}`);
    }
    record('7. Heroes page has NO horizontal overflow (scrollWidth <= innerWidth) across 320, 360, 390, 430, 768, 1024, 1280', allViewportsPass);

    // TEST 8: Hero images aspect ratio and object-fit
    const imgAspectTest = await evaluate(`
      (() => {
        const cards = document.querySelectorAll('.character-card .scorear-character');
        let count = cards.length;
        let fits = 0;
        cards.forEach(card => {
          const img = card.querySelector('img');
          if (img) {
            const style = window.getComputedStyle(img);
            if (style.objectFit === 'contain') fits++;
          }
        });
        return { count, fits, allContain: count > 0 && fits === count };
      })()
    `);
    record('8. Hero characters have object-fit: contain (no stretch/distortion)', imgAspectTest.allContain, `cards=${imgAspectTest.count}, valid=${imgAspectTest.fits}`);

    // TEST 9: Worlds Flow - Guest Modal & CTA
    await sendCmd('Page.navigate', { url: 'https://scorear2.web.app/#worlds' });
    await sleep(2000);

    const guestWorldTest = await evaluate(`
      (() => {
        localStorage.removeItem('scorear_teacher_session');
        sessionStorage.removeItem('scorear_teacher_session');
        if (window.ScoreARAuth && window.ScoreARAuth.setUser) window.ScoreARAuth.setUser(null);

        window.ScoreARWorldFlow.openWorld('royal');
        const modal = document.getElementById('scorearWorldFlowModal');
        const isOpen = modal && modal.open;
        const html = modal ? modal.innerHTML : '';
        const hasTitle = html.includes('القصر الملكي الأندلسي');
        const hasCta = html.includes('ادخل لتبدأ كمعلم');
        const hasPreview = html.includes('معاينة الفيديو');

        // Close modal
        window.ScoreARWorldFlow.closeWorldModal();
        const closed = modal && !modal.open;

        return { isOpen, hasTitle, hasCta, hasPreview, closed };
      })()
    `);
    const guestPass = guestWorldTest.isOpen && guestWorldTest.hasTitle && guestWorldTest.hasCta && guestWorldTest.hasPreview && guestWorldTest.closed;
    record('9. Worlds Flow: Guest click opens showcase modal with «ادخل لتبدأ كمعلم» without launching room', guestPass, JSON.stringify(guestWorldTest));

    // TEST 10: Worlds Flow - Teacher 3-step Wizard
    const teacherWorldTest = await evaluate(`
      (() => {
        localStorage.setItem('scorear_teacher_session', JSON.stringify({ role: 'teacher' }));

        window.ScoreARWorldFlow.openWorld('cosmic');
        const modal = document.getElementById('scorearWorldFlowModal');
        const isOpen = modal && modal.open;
        const state1 = window.ScoreARWorldFlow.getWizardState();

        // Step 1 -> Step 2
        window.ScoreARWorldFlow.nextStep();
        const state2 = window.ScoreARWorldFlow.getWizardState();

        // Step 2 -> Step 3
        window.ScoreARWorldFlow.nextStep();
        const state3 = window.ScoreARWorldFlow.getWizardState();
        const html3 = modal.innerHTML;
        const hasCosmeticBadge = html3.includes('قريبًا في التحديث القادم');
        const hasLaunchBtn = html3.includes('إطلاق القاعة الآن');

        // Close modal and cleanup
        window.ScoreARWorldFlow.closeWorldModal();
        localStorage.removeItem('scorear_teacher_session');

        return {
          isOpen,
          step1: state1.step === 1,
          step2: state2.step === 2,
          step3: state3.step === 3,
          hasCosmeticBadge,
          hasLaunchBtn
        };
      })()
    `);
    const teacherPass = teacherWorldTest.isOpen && teacherWorldTest.step1 && teacherWorldTest.step2 && teacherWorldTest.step3 && teacherWorldTest.hasCosmeticBadge && teacherWorldTest.hasLaunchBtn;
    record('10. Worlds Flow: Teacher wizard 3-step setup with «قريبًا» badge on cosmetic modes', teacherPass, JSON.stringify(teacherWorldTest));

    console.log('\n=================================================================');
    console.log(`TOTAL TESTS: ${testCount} | PASSED: ${passedCount} | FAILED: ${testCount - passedCount}`);
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
