const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function startStaticServer(dir, port) {
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };
  const srv = http.createServer((req, res) => {
    let u = req.url.split('?')[0].split('#')[0];
    if (u === '/') u = '/index.html';
    const fp = path.join(dir, u);
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'text/plain' });
      fs.createReadStream(fp).pipe(res);
    } else {
      res.writeHead(404); res.end('Not found');
    }
  });
  return new Promise(r => srv.listen(port, () => r(srv)));
}

async function main() {
  console.log('🚀 Testing Scroll Stability & Zero-Jump on Classrooms View...');
  const srvPort = 64991;
  const cdpPort = 64992;
  const projectDir = path.resolve(__dirname, '..');
  const server = await startStaticServer(projectDir, srvPort);

  const userDir = path.join('C:\\Temp', `scorear_scroll_test_${Date.now()}`);
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDir}`,
    '--window-size=1280,850',
    '--headless=new',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
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

    console.log(`1. Navigating to http://127.0.0.1:${srvPort}/index.html...`);
    await send('Page.navigate', { url: `http://127.0.0.1:${srvPort}/index.html` });
    await new Promise(r => setTimeout(r, 3500));

    // Setup teacher session with multiple classes to generate a scrollable page
    await send('Runtime.evaluate', {
      expression: `(async () => {
        localStorage.clear();
        localStorage.setItem('scorear_teacher_session', JSON.stringify({
          uid: 'teacher_scroll_test',
          name: 'أ. أحمد رميح',
          displayName: 'أ. أحمد رميح',
          role: 'teacher',
          isTeacher: true
        }));

        // Mock 4 classes for teacher
        const mockClasses = [
          { id: 'C1', code: 'SC111111', name: 'الصف الأول الثانوي - أ', subject: 'اللغة العربية', students: [{},{}], pending: [{ uid: 'p1', displayName: 'طالب 1', avatarId: 'char_01' }] },
          { id: 'C2', code: 'SC222222', name: 'الصف الأول الثانوي - ب', subject: 'اللغة العربية', students: [{},{},{}], pending: [] },
          { id: 'C3', code: 'SC333333', name: 'الصف الثاني الثانوي - بلاغة', subject: 'البلاغة والنقد', students: [{}], pending: [{ uid: 'p2', displayName: 'طالب 2', avatarId: 'char_02' }] },
          { id: 'C4', code: 'SC444444', name: 'الصف الثالث الثانوي - نحو شامل', subject: 'النحو والصرف', students: [{},{},{},{}], pending: [] }
        ];

        window.ScoreARClassroomsService.loadMyClasses = async () => mockClasses;
        window.ScoreARClassroomsService.getCurrentActor = async () => ({
          uid: 'teacher_scroll_test',
          name: 'أ. أحمد رميح',
          isTeacher: true,
          role: 'teacher'
        });
      })()`,
      awaitPromise: true
    });

    console.log('2. Clicking "ملفي وصفوفي 🏫" from navigation...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const link = document.querySelector('a[data-nav="classrooms"]');
        if (link) link.click();
        else window.ScoreARClassrooms.openView();
      })()`
    });

    await new Promise(r => setTimeout(r, 1200));

    const pageHeightInfo = await send('Runtime.evaluate', {
      expression: `(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        stageHeight: document.getElementById('scorearClassroomsStage')?.offsetHeight
      }))()`,
      returnByValue: true
    });
    console.log('Classrooms View Height Info:', pageHeightInfo.result?.value);
    if (pageHeightInfo.result?.value?.scrollHeight <= pageHeightInfo.result?.value?.innerHeight) {
      throw new Error('Page is not scrollable! Stage height too small.');
    }

    console.log('3. Scrolling down to 500px...');
    await send('Runtime.evaluate', { expression: `window.scrollTo({ top: 500, behavior: 'instant' })` });
    await new Promise(r => setTimeout(r, 400));

    const pos1 = await send('Runtime.evaluate', { expression: `window.scrollY`, returnByValue: true });
    console.log('Position immediately after scrolling to 500:', pos1.result?.value);
    if (pos1.result?.value < 400) throw new Error(`Scroll failed to reach 500, currently at: ${pos1.result?.value}`);

    console.log('4. Waiting 3 seconds (checking if scroll stays or jumps back to top)...');
    const scrollLog = [];
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 500));
      const pos = await send('Runtime.evaluate', { expression: `window.scrollY`, returnByValue: true });
      scrollLog.push(pos.result?.value);
      console.log(`[T+${(i+1)*0.5}s] scrollY = ${pos.result?.value}`);
    }

    const allMaintained = scrollLog.every(y => y >= 400);
    if (!allMaintained) {
      throw new Error(`Scroll position jumped back! History: ${JSON.stringify(scrollLog)}`);
    }
    console.log('✅ PASS: Scroll position was 100% maintained with ZERO jump-back!');

    console.log('5. Simulating background real-time teacher sync...');
    await send('Runtime.evaluate', {
      expression: `(async () => {
        // Trigger background re-render with preserveScroll
        await window.ScoreARClassrooms.renderClassroomsView({ preserveScroll: true });
      })()`,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 500));
    const posAfterSync = await send('Runtime.evaluate', { expression: `window.scrollY`, returnByValue: true });
    console.log('Position after background sync:', posAfterSync.result?.value);
    if (posAfterSync.result?.value < 400) {
      throw new Error(`Background sync caused scroll to jump to: ${posAfterSync.result?.value}`);
    }
    console.log('✅ PASS: Background sync preserved scroll position at', posAfterSync.result?.value);

    console.log('\n🎉 ALL SCROLL STABILITY TESTS PASSED 100%!');
    ws.close();
  } finally {
    server.close();
    chrome.kill();
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
