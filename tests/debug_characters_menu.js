import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8147;
const CDP_PORT = 9270;

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/characters.html';
  const file = path.join(ROOT_DIR, p);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200);
    fs.createReadStream(file).pipe(res);
  } else { res.writeHead(404); res.end(); }
}).listen(PORT, async () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--window-size=1280,800',
    `http://localhost:${PORT}/characters.html`
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const target = list.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const evalCdp = (expr) => new Promise(resolve => {
    const curId = id++;
    const handler = (evt) => {
      const res = JSON.parse(evt.data);
      if (res.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(res.result?.result?.value);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
  });

  const testClicks = await evalCdp(`(() => {
    const results = {};

    // 1. Check if category tabs can be clicked
    try {
      window.galleryFilter('human');
      const humanTab = document.getElementById('charTab-human');
      results.filterHuman = humanTab ? humanTab.getAttribute('aria-pressed') === 'true' : false;
      const count = document.querySelectorAll('#avatarsGrid .character-card').length;
      results.humanCount = count;
      window.galleryFilter('all');
    } catch (e) { results.filterHumanError = e.message; }

    // 2. Check if pose buttons work
    try {
      ScoreARCharacters.preview(1, 'celebrate');
      const celBtn = document.querySelector('[data-character-pose=\"celebrate\"]');
      results.celebratePose = celBtn ? celBtn.getAttribute('aria-pressed') === 'true' : false;
      ScoreARCharacters.preview(1, 'walk');
    } catch (e) { results.poseError = e.message; }

    // 3. Check if motion toggle works
    try {
      ScoreARCharacters.toggleMotion();
      results.toggleMotion = true;
    } catch (e) { results.motionError = e.message; }

    // 4. Check if clicking card 5 selects it
    try {
      const card5 = document.querySelector('#avatarsGrid [data-character-id=\"5\"]');
      if (card5) card5.click();
      results.card5Selected = (window.gallerySelected === 5);
    } catch (e) { results.cardClickError = e.message; }

    return results;
  })()`);

  console.log('BUTTON TESTS RESULTS:', JSON.stringify(testClicks, null, 2));

  chrome.kill();
  server.close();
  process.exit(0);
});
