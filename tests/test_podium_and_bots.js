import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8189;
const CDP_PORT = 9289;

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

    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER LOG]:', ...msg.params.args.map(a => a.value || a.description));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('[BROWSER EXCEPTION]:', msg.params.exceptionDetails);
      }
    });

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
    await send('Page.enable');
    await new Promise(r => setTimeout(r, 1000));

    const evalJs = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r && r.exceptionDetails) {
        console.error('JS EVAL EXCEPTION:', r.exceptionDetails);
      }
      return r?.result?.value;
    };

    console.log('\n--- 1. BOT STUDENTS ANSWERING SIMULATION TEST ---');

    const botAnswerTest = await evalJs(`(async () => {
      const results = {};

      // 1. Setup mock room with bots
      const mockRoom = {
        pin: '123456',
        status: 'question',
        world: { id: 'royal' },
        players: [
          { id: 'bot_1', name: 'عمر السعيد', avatarId: 'char_01', isBot: true, isDemo: true, accuracy: 1.0, speed: 'fast', score: 0 },
          { id: 'bot_2', name: 'سارة جمال', avatarId: 'char_02', isBot: true, isDemo: true, accuracy: 1.0, speed: 'fast', score: 0 },
          { id: 'bot_3', name: 'ياسين عمر', avatarId: 'char_03', isBot: true, isDemo: true, accuracy: 1.0, speed: 'fast', score: 0 }
        ],
        answers: { 0: {} }
      };

      // Mock ScoreARQuizHost current room & incoming message handler
      window.ScoreARQuizHost = window.ScoreARQuizHost || {};
      window.ScoreARQuizHost.getCurrentRoom = () => mockRoom;
      
      let incomingCount = 0;
      const receivedAnswers = [];
      window.ScoreARQuizHost.handleHostIncomingMessage = (msg) => {
        if (msg.type === 'STUDENT_ANSWER') {
          incomingCount++;
          receivedAnswers.push(msg);
          mockRoom.answers[0][msg.playerId] = msg;
        }
      };

      // Mock question data
      const qData = {
        id: 'q1',
        text: 'ما هي عاصمة جمهورية مصر العربية؟',
        options: ['القاهرة', 'الإسكندرية', 'الجيزة', 'أسوان'],
        correct: [0],
        timeLimit: 10
      };

      // Start bot simulation for question index 0
      window.ScoreARBots.onQuestionStart(0, qData, 10);

      // Fast bots answer within 2-5 seconds. Wait 5.5 seconds.
      await new Promise(r => setTimeout(r, 5500));

      results.incomingCount = incomingCount;
      results.receivedPlayers = receivedAnswers.map(a => a.playerName);
      results.roomAnswersCount = Object.keys(mockRoom.answers[0]).length;
      results.bot1AnswerCorrect = (mockRoom.answers[0]['bot_1']?.optionIndex === 0);

      return results;
    })()`);

    console.log('Bot Answering Simulation Result:', botAnswerTest);
    if (botAnswerTest.incomingCount !== 3) {
      throw new Error(`Expected 3 bot answers, got ${botAnswerTest.incomingCount}`);
    }
    if (botAnswerTest.roomAnswersCount !== 3) {
      throw new Error(`Expected 3 recorded answers in room, got ${botAnswerTest.roomAnswersCount}`);
    }
    if (!botAnswerTest.bot1AnswerCorrect) {
      throw new Error('Bot did not answer with the correct index based on 100% accuracy');
    }

    console.log('\n--- 2. PODIUM SUSPENSE & HEROES VISUALS TEST ---');

    const podiumVisualTest = await evalJs(`(async () => {
      const results = {};

      const mockStage = document.createElement('div');
      mockStage.id = 'testPodiumStage';
      document.body.appendChild(mockStage);

      const mockRoom = {
        world: { id: 'royal' },
        players: [
          { name: 'أحمد المتفوق', score: 1800, avatarId: 'char_01' },
          { name: 'فاطمة الذكية', score: 1450, avatarId: 'char_02' },
          { name: 'خالد البطل', score: 1100, avatarId: 'char_03' },
          { name: 'ليلى الرائعة', score: 800, avatarId: 'char_04' }
        ]
      };

      window.ScoreARPodiumEffects.renderHostPodium(mockStage, mockRoom, () => {});

      // Check Initial State (revealStep = 0)
      const hero1 = document.getElementById('podiumHeroArea_1');
      const hero2 = document.getElementById('podiumHeroArea_2');
      const hero3 = document.getElementById('podiumHeroArea_3');
      const myst1 = document.getElementById('podiumMystery_1');
      const myst2 = document.getElementById('podiumMystery_2');
      const myst3 = document.getElementById('podiumMystery_3');
      const ped1 = document.getElementById('podiumPedestal_1');

      results.step0_hero1Hidden = (hero1.style.display === 'none');
      results.step0_hero2Hidden = (hero2.style.display === 'none');
      results.step0_hero3Hidden = (hero3.style.display === 'none');
      results.step0_myst1HasQuestion = myst1.textContent.includes('❓');
      results.step0_myst2HasQuestion = myst2.textContent.includes('❓');
      results.step0_myst3HasQuestion = myst3.textContent.includes('❓');

      // Verify Initial Podium does NOT show the champion's name in plaintext anywhere visible
      const stageTextBefore = mockStage.innerText;
      results.step0_namesHidden = !stageTextBefore.includes('أحمد المتفوق') && !stageTextBefore.includes('فاطمة الذكية') && !stageTextBefore.includes('خالد البطل');

      // Check Hero Size vs Pedestal Size
      const hero1Container = hero1.querySelector('div');
      const hero1Height = hero1Container ? parseInt(hero1Container.style.height) : 0;
      const ped1Height = ped1 ? parseInt(ped1.style.height) : 0;
      results.hero1Height = hero1Height;
      results.ped1Height = ped1Height;
      results.heroBiggerThanPedestal = (hero1Height > ped1Height);

      // Check Celebrate Pose on Hero
      const heroCelebrateEl = hero1.querySelector('.character-celebrate, [src*="idle"], img');
      results.hasCelebrateOrJoy = hero1.innerHTML.includes('celebrate') || hero1.innerHTML.includes('character-joy');

      // Step 1: Advance reveal to 3rd place
      window.ScoreARPodiumEffects.advanceReveal();
      await new Promise(r => setTimeout(r, 100));
      results.step1_hero3Visible = (hero3.style.display === 'flex');
      results.step1_hero2StillHidden = (hero2.style.display === 'none');
      results.step1_hero1StillHidden = (hero1.style.display === 'none');
      results.step1_hero3Name = hero3.innerText.includes('خالد البطل');
      results.step1_myst3Score = myst3.textContent.includes('1100');

      // Step 2: Advance reveal to 2nd place
      window.ScoreARPodiumEffects.advanceReveal();
      await new Promise(r => setTimeout(r, 100));
      results.step2_hero2Visible = (hero2.style.display === 'flex');
      results.step2_hero1StillHidden = (hero1.style.display === 'none');
      results.step2_hero2Name = hero2.innerText.includes('فاطمة الذكية');
      results.step2_myst2Score = myst2.textContent.includes('1450');

      // Step 3: Advance reveal to 1st Grand Champion
      window.ScoreARPodiumEffects.advanceReveal();
      await new Promise(r => setTimeout(r, 100));
      results.step3_hero1Visible = (hero1.style.display === 'flex');
      results.step3_hero1Name = hero1.innerText.includes('أحمد المتفوق');
      results.step3_myst1Score = myst1.textContent.includes('1800');
      results.step3_crownVisible = (document.getElementById('championCrownEl')?.style.visibility === 'visible');

      mockStage.remove();
      return results;
    })()`);

    console.log('Podium Visual & Stepwise Reveal Result:', podiumVisualTest);

    if (!podiumVisualTest.step0_namesHidden) {
      throw new Error('Names should be strictly hidden before reveal to maintain surprise!');
    }
    if (!podiumVisualTest.step0_myst1HasQuestion || !podiumVisualTest.step0_myst2HasQuestion || !podiumVisualTest.step0_myst3HasQuestion) {
      throw new Error('Pedestals must show mystery indicators before reveal');
    }
    if (!podiumVisualTest.heroBiggerThanPedestal || podiumVisualTest.hero1Height < 240) {
      throw new Error(`Hero height (${podiumVisualTest.hero1Height}px) must be large and greater than pedestal (${podiumVisualTest.ped1Height}px)`);
    }
    if (!podiumVisualTest.hasCelebrateOrJoy) {
      throw new Error('Heroes on the podium must be in celebration / winning motion!');
    }
    if (!podiumVisualTest.step1_hero3Visible || !podiumVisualTest.step1_hero3Name) {
      throw new Error('Step 1 must reveal 3rd place hero and name together!');
    }
    if (!podiumVisualTest.step2_hero2Visible || !podiumVisualTest.step2_hero2Name) {
      throw new Error('Step 2 must reveal 2nd place hero and name together!');
    }
    if (!podiumVisualTest.step3_hero1Visible || !podiumVisualTest.step3_hero1Name || !podiumVisualTest.step3_crownVisible) {
      throw new Error('Step 3 must reveal 1st place hero, name, and crown together!');
    }

    console.log('\n========================================');
    console.log('ALL PODIUM & BOT TESTS PASSED 100%!');
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
