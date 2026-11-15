import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8188;
const CDP_PORT = 9288;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/characters.html';
  const file = path.join(ROOT_DIR, p);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(PORT, async () => {
  console.log(`Test server running at http://localhost:${PORT}`);

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--window-size=1280,800',
    `http://localhost:${PORT}/characters.html`
  ]);

  await new Promise(r => setTimeout(r, 2200));

  try {
    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const list = await listRes.json();
    const pageTarget = list.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (evt) => {
        const res = JSON.parse(evt.data);
        if (res.id === curId) {
          ws.removeEventListener('message', handler);
          if (res.error) reject(new Error(JSON.stringify(res.error)));
          else resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    const evalJs = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r && r.exceptionDetails) {
        console.error('JS EVAL EXCEPTION:', r.exceptionDetails);
      }
      return r?.result?.value;
    };

    console.log('\n--- 1. DESKTOP TEST: characters.html (1280x800) ---');

    // Test 1.1 Initial closed sidebar state on Desktop
    const initialDesktopState = await evalJs(`(() => {
      const sb = document.getElementById('sidebar');
      const mm = document.querySelector('.gallery-mobile-menu, [data-action="menu"]');
      const cs = window.getComputedStyle(sb);
      const mmCs = window.getComputedStyle(mm);
      return {
        sidebarExists: !!sb,
        sidebarInert: sb ? sb.inert : false,
        sidebarHasOpenClass: sb ? sb.classList.contains('open') : false,
        sidebarTransform: cs.transform,
        menuBtnVisible: mmCs.display !== 'none',
        menuBtnAriaExpanded: mm ? mm.getAttribute('aria-expanded') : null
      };
    })()`);
    console.log('Desktop Initial State:', initialDesktopState);

    if (initialDesktopState.sidebarHasOpenClass) throw new Error('Sidebar should NOT have open class initially on desktop');
    if (!initialDesktopState.sidebarInert) throw new Error('Sidebar should be inert initially when closed');
    if (!initialDesktopState.menuBtnVisible) throw new Error('Menu button must be visible on desktop');

    // Test 1.2 Open sidebar via menu button click
    const afterMenuClick = await evalJs(`(async () => {
      const mm = document.querySelector('.gallery-mobile-menu, [data-action="menu"]');
      mm.click();
      await new Promise(r => setTimeout(r, 400));
      const sb = document.getElementById('sidebar');
      const cs = window.getComputedStyle(sb);
      return {
        openClass: sb.classList.contains('open'),
        inert: sb.inert,
        transform: cs.transform,
        bodyOverflow: document.body.style.overflow
      };
    })()`);
    console.log('Desktop After Menu Click (Open):', afterMenuClick);
    if (!afterMenuClick.openClass) throw new Error('Sidebar must have open class after menu click');
    if (afterMenuClick.inert) throw new Error('Sidebar must NOT be inert when opened');

    // Test 1.3 Close sidebar via close button (✕)
    const afterCloseClick = await evalJs(`(() => {
      const closeBtn = document.querySelector('.sidebar-close-btn, [data-action="close-sidebar"]');
      if (closeBtn) closeBtn.click();
      const sb = document.getElementById('sidebar');
      return {
        openClass: sb.classList.contains('open'),
        inert: sb.inert,
        bodyOverflow: document.body.style.overflow
      };
    })()`);
    console.log('Desktop After Close Click (✕):', afterCloseClick);
    if (afterCloseClick.openClass) throw new Error('Sidebar must NOT have open class after close button click');
    if (!afterCloseClick.inert) throw new Error('Sidebar must be inert after closing');

    // Test 1.4 Category filters on characters.html
    const categoryFilterResults = await evalJs(`(() => {
      const results = {};
      
      // All (20)
      window.galleryFilter('all');
      results.allCount = document.querySelectorAll('#avatarsGrid .character-card').length;

      // Human (8)
      window.galleryFilter('human');
      results.humanCount = document.querySelectorAll('#avatarsGrid .character-card').length;
      results.humanTabPressed = document.getElementById('charTab-human')?.getAttribute('aria-pressed');

      // Animal (6)
      window.galleryFilter('animal');
      results.animalCount = document.querySelectorAll('#avatarsGrid .character-card').length;
      results.animalTabPressed = document.getElementById('charTab-animal')?.getAttribute('aria-pressed');

      // Fantasy (6)
      window.galleryFilter('fantasy');
      results.fantasyCount = document.querySelectorAll('#avatarsGrid .character-card').length;
      results.fantasyTabPressed = document.getElementById('charTab-fantasy')?.getAttribute('aria-pressed');

      // Back to all
      window.galleryFilter('all');
      return results;
    })()`);
    console.log('Category Tabs Filter Results:', categoryFilterResults);
    if (categoryFilterResults.allCount !== 20) throw new Error(`Expected 20 characters in 'all', got ${categoryFilterResults.allCount}`);
    if (categoryFilterResults.humanCount !== 8) throw new Error(`Expected 8 characters in 'human', got ${categoryFilterResults.humanCount}`);
    if (categoryFilterResults.animalCount !== 6) throw new Error(`Expected 6 characters in 'animal', got ${categoryFilterResults.animalCount}`);
    if (categoryFilterResults.fantasyCount !== 6) throw new Error(`Expected 6 characters in 'fantasy', got ${categoryFilterResults.fantasyCount}`);

    // Test 1.5 Click character card 5 and check selection & preview
    const cardSelectResult = await evalJs(`(() => {
      const card5 = document.querySelector('#avatarsGrid [data-character-id="5"]');
      if (card5) card5.click();
      const previewTitle = document.getElementById('studentCustomPreviewTitle')?.textContent || '';
      const newCard5 = document.querySelector('#avatarsGrid [data-character-id="5"]');
      return {
        selectedId: window.gallerySelected,
        previewHasName: previewTitle.includes('ياسين'),
        card5Pressed: newCard5?.getAttribute('aria-pressed')
      };
    })()`);
    console.log('Card 5 Selection Result:', cardSelectResult);
    if (cardSelectResult.selectedId !== 5) throw new Error('Card 5 was not selected');
    if (!cardSelectResult.previewHasName) throw new Error('Preview title did not show character 5 name');
    if (cardSelectResult.card5Pressed !== 'true') throw new Error('Card 5 aria-pressed was not true after click');

    // Test 1.6 Pose Controls
    const poseResults = await evalJs(`(() => {
      const poses = {};
      const idleBtn = document.querySelector('[data-character-pose="idle"]');
      const walkBtn = document.querySelector('[data-character-pose="walk"]');
      const celBtn = document.querySelector('[data-character-pose="celebrate"]');

      idleBtn.click();
      poses.idlePressed = idleBtn.getAttribute('aria-pressed');

      celBtn.click();
      poses.celPressed = celBtn.getAttribute('aria-pressed');

      walkBtn.click();
      poses.walkPressed = walkBtn.getAttribute('aria-pressed');

      return poses;
    })()`);
    console.log('Pose Controls Results:', poseResults);
    if (poseResults.idlePressed !== 'true' || poseResults.celPressed !== 'true' || poseResults.walkPressed !== 'true') {
      throw new Error('Pose buttons did not toggle aria-pressed properly');
    }

    // Test 1.7 Sidebar link auto-close: Open sidebar, click an in-page section link (characters.html itself), verify sidebar IMMEDIATELY closes
    const autoCloseResult = await evalJs(`(() => {
      window.ScoreARNav.openSidebar();
      const openBefore = document.getElementById('sidebar').classList.contains('open');

      // Click nav link for heroes
      const link = document.querySelector('#sidebar a[data-nav="heroes"]');
      if (link) link.click();

      const sb = document.getElementById('sidebar');
      return {
        openBefore,
        openAfter: sb.classList.contains('open'),
        inertAfter: sb.inert
      };
    })()`);
    console.log('Sidebar Auto-Close On Link Click Result:', autoCloseResult);
    if (!autoCloseResult.openBefore) throw new Error('Sidebar was not open before clicking link');
    if (autoCloseResult.openAfter) throw new Error('Sidebar must close immediately upon entering/clicking section');
    if (!autoCloseResult.inertAfter) throw new Error('Sidebar must be inert after auto-close');

    console.log('\n--- 2. MOBILE TEST: characters.html (390x844) ---');

    // Emulate Mobile Device (iPhone 12/13/14 size: 390x844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 200));

    const mobileState = await evalJs(`(() => {
      const sb = document.getElementById('sidebar');
      const mm = document.querySelector('.gallery-mobile-menu, [data-action="menu"]');
      const cs = window.getComputedStyle(sb);
      return {
        sidebarInert: sb.inert,
        sidebarHasOpen: sb.classList.contains('open'),
        sidebarTransform: cs.transform,
        menuBtnVisible: window.getComputedStyle(mm).display !== 'none'
      };
    })()`);
    console.log('Mobile Initial State:', mobileState);
    if (mobileState.sidebarHasOpen) throw new Error('Sidebar must be closed on mobile initially');
    if (!mobileState.sidebarInert) throw new Error('Sidebar must be inert on mobile initially');
    if (!mobileState.menuBtnVisible) throw new Error('Menu button must be visible on mobile');

    // Open drawer on mobile
    const mobileOpen = await evalJs(`(() => {
      document.querySelector('.gallery-mobile-menu, [data-action="menu"]').click();
      const sb = document.getElementById('sidebar');
      return { open: sb.classList.contains('open'), inert: sb.inert, overflow: document.body.style.overflow };
    })()`);
    console.log('Mobile Drawer Open:', mobileOpen);
    if (!mobileOpen.open || mobileOpen.inert) throw new Error('Mobile drawer failed to open properly');

    // Close drawer on mobile via close button
    const mobileClose = await evalJs(`(() => {
      document.querySelector('.sidebar-close-btn, [data-action="close-sidebar"]').click();
      const sb = document.getElementById('sidebar');
      return { open: sb.classList.contains('open'), inert: sb.inert, overflow: document.body.style.overflow };
    })()`);
    console.log('Mobile Drawer Close:', mobileClose);
    if (mobileClose.open || !mobileClose.inert) throw new Error('Mobile drawer failed to close properly');

    // Mobile tap on character card 9 (ليث)
    const mobileCardSelect = await evalJs(`(() => {
      const card9 = document.querySelector('#avatarsGrid [data-character-id="9"]');
      if (card9) card9.click();
      const previewTitle = document.getElementById('studentCustomPreviewTitle')?.textContent || '';
      const newCard9 = document.querySelector('#avatarsGrid [data-character-id="9"]');
      return {
        selectedId: window.gallerySelected,
        hasName: previewTitle.includes('ليث'),
        card9Pressed: newCard9?.getAttribute('aria-pressed')
      };
    })()`);
    console.log('Mobile Card 9 Selection:', mobileCardSelect);
    if (mobileCardSelect.selectedId !== 9 || !mobileCardSelect.hasName) {
      throw new Error('Character selection failed on mobile');
    }

    console.log('\n--- 3. INDEX.HTML #HEROES & #HOME ROUTER TEST ---');

    // Reset device metrics
    await send('Emulation.clearDeviceMetricsOverride');

    // Navigate to index.html#heroes
    await evalJs(`window.location.href = 'http://localhost:${PORT}/index.html#heroes'`);
    await new Promise(r => setTimeout(r, 1400));

    const indexHeroesState = await evalJs(`(() => {
      const sb = document.getElementById('sidebar');
      const mm = document.querySelector('.mobile-menu, [data-action="menu"]');
      const cards = document.querySelectorAll('#avatarsGrid .character-card');
      const cs = window.getComputedStyle(sb);
      return {
        sidebarHasOpen: sb ? sb.classList.contains('open') : false,
        sidebarInert: sb ? sb.inert : false,
        sidebarTransform: cs.transform,
        menuBtnVisible: mm ? window.getComputedStyle(mm).display !== 'none' : false,
        cardCount: cards.length
      };
    })()`);
    console.log('index.html#heroes State:', indexHeroesState);
    if (indexHeroesState.sidebarHasOpen) throw new Error('index.html#heroes: sidebar must NOT be open');
    if (!indexHeroesState.sidebarInert) throw new Error('index.html#heroes: sidebar must be inert');
    if (!indexHeroesState.menuBtnVisible) throw new Error('index.html#heroes: topbar menu button must be visible');
    if (indexHeroesState.cardCount !== 20) throw new Error(`index.html#heroes: expected 20 character cards, got ${indexHeroesState.cardCount}`);

    // Test toggle sidebar on index.html
    const indexToggle = await evalJs(`(() => {
      const mm = document.querySelector('.mobile-menu, [data-action="menu"]');
      mm.click();
      const sb = document.getElementById('sidebar');
      const openAfterClick = sb.classList.contains('open');

      // Click link to studio
      const studioLink = document.querySelector('#sidebar a[data-nav="studio"]');
      if (studioLink) studioLink.click();

      const openAfterLink = sb.classList.contains('open');
      const hashAfter = window.location.hash;

      return { openAfterClick, openAfterLink, hashAfter, inertAfter: sb.inert };
    })()`);
    console.log('index.html Menu Toggle & Section Navigation:', indexToggle);
    if (!indexToggle.openAfterClick) throw new Error('Menu button did not open sidebar in index.html');
    if (indexToggle.openAfterLink) throw new Error('Sidebar did not immediately close upon navigating to studio');
    if (!indexToggle.inertAfter) throw new Error('Sidebar should be inert after navigating to studio');

    console.log('\n========================================');
    console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================\n');

  } catch (err) {
    console.error('TEST ERROR:', err);
    process.exitCode = 1;
  } finally {
    chrome.kill();
    server.close();
    process.exit(process.exitCode || 0);
  }
});
