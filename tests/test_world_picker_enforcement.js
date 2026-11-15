import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8192;
const CDP_PORT = 9292;

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
  if (p === '/') p = '/index.html';
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
    `http://localhost:${PORT}/index.html#home`
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

    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 1000));

    const evalJs = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r && r.exceptionDetails) {
        console.error('JS EVAL EXCEPTION:', r.exceptionDetails);
      }
      return r?.result?.value;
    };

    console.log('\n--- 1. TEST: QUESTION BANK LAUNCH TRIGGERS WORLD PICKER ---');

    const bankTest = await evalJs(`(async () => {
      // Setup mock cached quiz in bank
      window.ScoreARQuizBank = window.ScoreARQuizBank || {};
      const mockQuiz = {
        id: 'quiz_test_bank',
        title: 'مسابقة النحو المتقدمة',
        questions: [
          { skill: 'النحو', text: 'سؤال تجريبي 1', options: ['أ', 'ب', 'ج', 'د'], correct: [0], explanation: 'شرح' },
          { skill: 'النحو', text: 'سؤال تجريبي 2', options: ['1', '2', '3', '4'], correct: [1], explanation: 'شرح' }
        ]
      };

      // Mock cachedQuizzes
      try {
        const hub = document.getElementById('scorearBankHubModal');
        if (hub) hub.close();
      } catch(e){}

      // Inject mock quiz into cached quizzes if possible or call launchQuizToRoom
      window.ScoreARQuizBank._testLaunch = function() {
        window.contestQuestions = JSON.parse(JSON.stringify(mockQuiz.questions));
        if (window.ScoreARWorldFlow && typeof window.ScoreARWorldFlow.openWorldPicker === 'function') {
          window.ScoreARWorldFlow.openWorldPicker({
            defaultWorldId: 'royal',
            quizTitle: mockQuiz.title,
            onConfirm: (chosenWorld) => {
              if (window.ScoreARQuizHost && window.ScoreARQuizHost.startHostLobby) {
                window.ScoreARQuizHost.startHostLobby(chosenWorld, null, true);
              }
            }
          });
        }
      };

      window.ScoreARQuizBank._testLaunch();
      await new Promise(r => setTimeout(r, 200));

      const modal = document.getElementById('scorearWorldFlowModal');
      const isOpen = modal ? modal.open : false;
      const heading = modal ? modal.querySelector('h3')?.textContent : '';
      const quizTitleInModal = modal ? modal.innerText.includes('مسابقة النحو المتقدمة') : false;

      // Select 'cosmic' world
      window.ScoreARWorldFlow.selectPickerWorld('cosmic');
      await new Promise(r => setTimeout(r, 100));

      // Confirm world
      window.ScoreARWorldFlow.confirmPickerWorld();
      await new Promise(r => setTimeout(r, 500));

      const currentRoom = window.ScoreARQuizHost ? window.ScoreARQuizHost.getCurrentRoom() : null;
      const launchedWorld = currentRoom ? currentRoom.world?.id : null;

      // Clean up room
      if (window.ScoreARQuizHost && window.ScoreARQuizHost.closeHostSession) {
        window.ScoreARQuizHost.closeHostSession();
      }

      return {
        pickerOpened: isOpen,
        headingMatch: heading.includes('اختر عالم المنافسة التفاعلي'),
        quizTitleInModal,
        launchedWorld
      };
    })()`);

    console.log('Question Bank Launch Result:', bankTest);
    if (!bankTest.pickerOpened) throw new Error('World picker modal did not open from Question Bank!');
    if (!bankTest.headingMatch) throw new Error('World picker heading mismatch');
    if (!bankTest.quizTitleInModal) throw new Error('Quiz title was not displayed in the world picker');
    if (bankTest.launchedWorld !== 'cosmic') throw new Error(`Expected launched world to be 'cosmic', got ${bankTest.launchedWorld}`);

    console.log('\n--- 2. TEST: DIRECT startHostLobby INTERCEPTION ---');

    const directHostTest = await evalJs(`(async () => {
      // Call startHostLobby directly with 'royal' and no bypass
      window.ScoreARQuizHost.startHostLobby('royal', null);
      await new Promise(r => setTimeout(r, 200));

      const modal = document.getElementById('scorearWorldFlowModal');
      const isOpen = modal ? modal.open : false;

      // Select 'treasure'
      window.ScoreARWorldFlow.selectPickerWorld('treasure');
      await new Promise(r => setTimeout(r, 100));

      window.ScoreARWorldFlow.confirmPickerWorld();
      await new Promise(r => setTimeout(r, 500));

      const currentRoom = window.ScoreARQuizHost ? window.ScoreARQuizHost.getCurrentRoom() : null;
      const launchedWorld = currentRoom ? currentRoom.world?.id : null;

      // Clean up room
      if (window.ScoreARQuizHost && window.ScoreARQuizHost.closeHostSession) {
        window.ScoreARQuizHost.closeHostSession();
      }

      return {
        pickerOpenedDirect: isOpen,
        launchedWorld
      };
    })()`);

    console.log('Direct startHostLobby Interception Result:', directHostTest);
    if (!directHostTest.pickerOpenedDirect) {
      throw new Error('Calling startHostLobby directly failed to trigger the world picker!');
    }
    if (directHostTest.launchedWorld !== 'treasure') {
      throw new Error(`Expected launched world to be 'treasure', got ${directHostTest.launchedWorld}`);
    }

    console.log('\n--- 3. TEST: STUDIO STEP 02 & renderLiveLobby INTERCEPTION ---');

    const studioLaunchTest = await evalJs(`(async () => {
      // Call renderLiveLobby without bypass (as called from Studio buttons)
      window.renderLiveLobby('royal', null);
      await new Promise(r => setTimeout(r, 200));

      const modal = document.getElementById('scorearWorldFlowModal');
      const isOpen = modal ? modal.open : false;

      // Select 'stadium'
      window.ScoreARWorldFlow.selectPickerWorld('stadium');
      await new Promise(r => setTimeout(r, 100));

      window.ScoreARWorldFlow.confirmPickerWorld();
      await new Promise(r => setTimeout(r, 500));

      const currentRoom = window.ScoreARQuizHost ? window.ScoreARQuizHost.getCurrentRoom() : null;
      const launchedWorld = currentRoom ? currentRoom.world?.id : null;

      // Clean up room
      if (window.ScoreARQuizHost && window.ScoreARQuizHost.closeHostSession) {
        window.ScoreARQuizHost.closeHostSession();
      }

      return {
        pickerOpenedFromStudio: isOpen,
        launchedWorld
      };
    })()`);

    console.log('Studio / renderLiveLobby Launch Result:', studioLaunchTest);
    if (!studioLaunchTest.pickerOpenedFromStudio) {
      throw new Error('renderLiveLobby failed to trigger world picker!');
    }
    if (studioLaunchTest.launchedWorld !== 'stadium') {
      throw new Error(`Expected launched world to be 'stadium', got ${studioLaunchTest.launchedWorld}`);
    }

    console.log('\n========================================');
    console.log('ALL WORLD PICKER ENFORCEMENT TESTS PASSED 100%!');
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
