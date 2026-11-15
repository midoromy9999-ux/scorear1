const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

async function test() {
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
    const f = path.join(__dirname, '..', p.replace(/^\//, ''));
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
  const port = server.address().port;
  const cdp = 9646;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=' + cdp,
    '--user-data-dir=' + path.join(process.env.TEMP, 'cdp_diag_4'),
    '--headless=new',
    'http://127.0.0.1:' + port + '/index.html#home'
  ]);
  await new Promise(r => setTimeout(r, 2500));
  const list = await (await fetch('http://127.0.0.1:' + cdp + '/json/list')).json();
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 10;
  const evalInPage = (expr) => new Promise(r => {
    const curId = id++;
    const handler = (e) => {
      const data = JSON.parse(e.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        r(data.result?.result?.value);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
  });

  // Wait until ScoreARUnifiedViews is ready
  for (let i = 0; i < 20; i++) {
    const ready = await evalInPage('typeof window.ScoreARUnifiedViews !== "undefined"');
    if (ready) break;
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('Ready check:', await evalInPage('typeof window.ScoreARUnifiedViews'));
  
  // Click the podium link
  const clickRes = await evalInPage(`(() => {
    const a = Array.from(document.querySelectorAll('a')).find(x => (x.getAttribute('href')||'').includes('podium'));
    if (!a) return 'link-not-found';
    a.click();
    return 'clicked';
  })()`);
  console.log('Click result:', clickRes);

  await new Promise(r => setTimeout(r, 1200));
  console.log('After click href:', await evalInPage('window.location.href'));

  const stageInfo = await evalInPage(`(() => {
    const s = document.getElementById('scorearUnifiedModalStage');
    if (!s) return null;
    const peds = s.querySelectorAll('.kahoot-3d-pedestal, [id^="podiumPedestal_"]');
    return {
      display: s.style.display,
      htmlLen: s.innerHTML.length,
      pedestals: peds.length,
      title: s.querySelector('b')?.textContent || ''
    };
  })()`);
  console.log('Stage info:', stageInfo);

  chrome.kill();
  server.close();
}
test().catch(console.error);
