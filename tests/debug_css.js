import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/characters.html';
  const file = path.join(process.cwd(), p);
  if (fs.existsSync(file)) {
    res.writeHead(200);
    fs.createReadStream(file).pipe(res);
  } else { res.writeHead(404); res.end(); }
}).listen(8199, async () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9299',
    '--headless=new',
    'http://localhost:8199/characters.html'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const list = await (await fetch('http://127.0.0.1:9299/json/list')).json();
  const pageTarget = list.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const evalJs = (expr) => new Promise(resolve => {
    const curId = id++;
    const handler = (evt) => {
      const res = JSON.parse(evt.data);
      if (res.id === curId) { ws.removeEventListener('message', handler); resolve(res.result?.result?.value); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
  });

  const info = await evalJs(`(async () => {
    const sb = document.getElementById("sidebar");
    sb.classList.add("open");
    const immediate = window.getComputedStyle(sb).transform;
    await new Promise(r => setTimeout(r, 350));
    const afterTransition = window.getComputedStyle(sb).transform;
    return {
      classes: sb.className,
      immediate,
      afterTransition
    };
  })()`);
  console.log(JSON.stringify(info, null, 2));
  chrome.kill();
  server.close();
  process.exit(0);
});
