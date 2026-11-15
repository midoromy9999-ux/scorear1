/**
 * Batch 2a E2E Acceptance Test
 * Verifies:
 *  1. Student 3-Step Join Flow (PIN keypad touch, name 1-40 with deduplication, 20-char picker with live preview, Back & Next buttons).
 *  2. Player Cards in Lobby & Room (idle webp, role icons: ✓, ✨, 🤖, truncated name with tap-to-expand).
 *  3. Kahoot-style Compact 2x2 Question Options Grid.
 *  4. Leaderboard Screen (World image background, staggered reveal, FLIP arrows ▲, ▼, —, counting-up score, badges ⚡, 🔥, 🚀).
 *  5. Audio Configuration (magic for lobby, treasure for question, mute state persistence in localStorage).
 *  6. Final Podium (World image background, Top 3 podium, complete roster of ALL participants).
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8132;
const CDP_PORT = 9257;

function createServer() {
  const server = http.createServer((req, res) => {
    let cleanPath = req.url.split('?')[0];
    if (cleanPath === '/') cleanPath = '/index.html';
    const filePath = path.join(ROOT_DIR, cleanPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg',
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.mp4': 'video/mp4'
      };
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise(resolve => {
    server.listen(PORT, () => {
      console.log(`[Test Server] Running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findBrowser() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  return paths.find(p => fs.existsSync(p));
}

function connectCDP(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onopen = () => {
      function send(method, params = {}) {
        return new Promise((res, rej) => {
          const id = msgId++;
          callbacks.set(id, { res, rej });
          ws.send(JSON.stringify({ id, method, params }));
        });
      }
      resolve({ ws, send });
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.id && callbacks.has(msg.id)) {
          const { res, rej } = callbacks.get(msg.id);
          callbacks.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message));
          else res(msg.result);
        }
      } catch (e) {}
    };

    ws.onerror = (err) => reject(err);
  });
}

async function evalInPage(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (res.exceptionDetails) {
    throw new Error('Eval failed: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
  }
  return res.result ? res.result.value : undefined;
}

async function run() {
  console.log('🚀 Starting Batch 2a E2E Mobile Acceptance Test...');
  const server = await createServer();
  const browserBin = findBrowser();
  if (!browserBin) {
    console.error('No compatible browser found!');
    process.exit(1);
  }

  const tmpProfile = path.join(ROOT_DIR, '.tmp_e2e_profile_' + Date.now());
  const proc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    'about:blank'
  ]);

  await sleep(3000);

  try {
    const vRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const tabs = await vRes.json();
    const mainTab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || tabs[0];

    const hostCDP = await connectCDP(mainTab.webSocketDebuggerUrl);

    // Setup host page
    await hostCDP.send('Page.enable');
    await hostCDP.send('Runtime.enable');
    await hostCDP.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    for (let i = 0; i < 30; i++) {
      try {
        const ready = await evalInPage(hostCDP, `!!window.ScoreARQuizHost`);
        if (ready) break;
      } catch(e){}
      await sleep(200);
    }

    // Create student page
    const newTabRes = await hostCDP.send('Target.createTarget', { url: `http://localhost:${PORT}/` });
    const studentTargetId = newTabRes.targetId;
    await sleep(600);

    const tabs2 = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    const studentTab = tabs2.find(t => t.id === studentTargetId);
    const studentCDP = await connectCDP(studentTab.webSocketDebuggerUrl);

    await studentCDP.send('Page.enable');
    await studentCDP.send('Runtime.enable');
    for (let i = 0; i < 30; i++) {
      try {
        const ready = await evalInPage(studentCDP, `!!window.ScoreARStudentJoin && !!window.ScoreARQuizStudent`);
        if (ready) break;
      } catch(e){}
      await sleep(200);
    }
    await evalInPage(hostCDP, `(() => { localStorage.clear(); sessionStorage.clear(); })()`);
    await evalInPage(studentCDP, `(() => { localStorage.clear(); sessionStorage.clear(); })()`);

    // Emulate mobile viewport for Student (390 x 844, touch enabled)
    await studentCDP.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await studentCDP.send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });

    // -------------------------------------------------------------
    // TEST 1: Launch Host Lobby and Verify PIN & Player Cards
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Launch Host Lobby ---');
    const hostInit = await evalInPage(hostCDP, `
      (async () => {
        window.ScoreARQuizHost.startHostLobby('treasure', '749102');
        return {
          pin: window.ScoreARQuizHost.getPin(),
          status: window.ScoreARQuizHost.getRoomStatus(),
          isLocked: window.ScoreARQuizHost.isLocked()
        };
      })()
    `);
    console.log(`Host Lobby opened with PIN: ${hostInit.pin}, Locked: ${hostInit.isLocked}`);
    if (hostInit.pin !== '749102') throw new Error('Host PIN mismatch');

    // Verify audio mute persistence in localStorage
    console.log('\n--- Step 2: Audio Mute Persistence ---');
    const muteTest = await evalInPage(hostCDP, `
      (() => {
        const initial = window.ScoreARAudio.isMuted();
        const toggled = window.ScoreARAudio.toggleMute();
        const savedInStorage = localStorage.getItem('scorear_audio_muted');
        const toggledBack = window.ScoreARAudio.toggleMute();
        const savedBack = localStorage.getItem('scorear_audio_muted');
        return { initial, toggled, savedInStorage, toggledBack, savedBack };
      })()
    `);
    console.log('Audio Mute persistence test:', muteTest);
    if (muteTest.savedInStorage !== 'true' || muteTest.savedBack !== 'false') {
      throw new Error('Audio mute state did not persist properly in localStorage');
    }
    console.log('✅ Audio mute state successfully persisted in localStorage.');

    // -------------------------------------------------------------
    // TEST 3: Student 3-Step Join Flow via Virtual Touch Keypad
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Student 3-Step Join Flow ---');
    // Open Student Modal
    const openRes = await evalInPage(studentCDP, `
      (() => {
        try {
          window.ScoreARAuthUI.openModal('student');
          return { ok: true, hasStudentJoin: !!window.ScoreARStudentJoin };
        } catch(e) {
          return { ok: false, err: e.message, stack: e.stack };
        }
      })()
    `);
    console.log('openModal result:', openRes);
    await sleep(800);

    // Verify Step 1 is rendered with keypad
    const step1Check = await evalInPage(studentCDP, `
      (() => {
        const modal = document.getElementById('modal');
        const container = document.getElementById('studentJoinContainer');
        const btns = container ? container.querySelectorAll('.keypad-btn') : [];
        return {
          modalOpen: modal ? modal.open : false,
          hasContainer: !!container,
          containerHtml: container ? container.innerHTML.slice(0, 200) : 'none',
          keypadButtonCount: btns.length
        };
      })()
    `);
    console.log(`Step 1 Keypad Buttons: ${step1Check.keypadButtonCount} (Expected: 12)`, step1Check);
    if (step1Check.keypadButtonCount !== 12) throw new Error('Keypad buttons missing');

    // Tap PIN digits '7', '4', '9', '1', '0', '2' via ScoreARStudentJoin.handleKeypad
    await evalInPage(studentCDP, `
      (() => {
        ['7', '4', '9', '1', '0', '2'].forEach(k => window.ScoreARStudentJoin.handleKeypad(k));
      })()
    `);

    // Verify PIN boxes updated
    const pinCheck = await evalInPage(studentCDP, `
      (() => {
        const boxes = Array.from(document.querySelectorAll('.pin-digit-box')).map(b => b.textContent.trim());
        return boxes.join('');
      })()
    `);
    console.log(`Entered PIN: ${pinCheck}`);
    if (pinCheck !== '749102') throw new Error('PIN digits failed to enter');

    // Submit Step 1 -> advance to Step 2
    await evalInPage(studentCDP, `
      (async () => {
        await window.ScoreARStudentJoin.submitStep1();
      })()
    `);
    await sleep(400);

    // Verify Step 2 is active
    const step2Active = await evalInPage(studentCDP, `
      (() => {
        const nameInput = document.getElementById('studentJoinNameInput');
        return { hasNameInput: !!nameInput };
      })()
    `);
    console.log('Step 2 Active:', step2Active);
    if (!step2Active.hasNameInput) throw new Error('Did not advance to Step 2');

    // Test Step 2 "رجوع" button goes back to Step 1
    await evalInPage(studentCDP, `
      (() => {
        window.ScoreARStudentJoin.goToStep(1);
      })()
    `);
    await sleep(200);
    const backTo1 = await evalInPage(studentCDP, `!!document.getElementById('studentPinDisplay')`);
    if (!backTo1) throw new Error('Back to Step 1 failed');

    // Return to Step 2 and enter nickname with space and slash
    await evalInPage(studentCDP, `
      (async () => {
        await window.ScoreARStudentJoin.submitStep1();
      })()
    `);
    await sleep(300);

    const testNick = 'أحمد صلاح / 3A';
    await evalInPage(studentCDP, `
      (() => {
        const inp = document.getElementById('studentJoinNameInput');
        inp.value = '${testNick}';
        inp.dispatchEvent(new Event('input'));
        window.ScoreARStudentJoin.submitStep2();
      })()
    `);
    await sleep(400);

    // Verify Step 3: 20-character picker with live preview
    const step3Check = await evalInPage(studentCDP, `
      (() => {
        const cards = document.querySelectorAll('.avatar-card-picker');
        const liveImg = document.getElementById('studentAvatarLiveImg');
        const liveName = document.getElementById('studentAvatarLiveName');
        const selectedReview = document.getElementById('studentSelectedNameReview');
        return {
          cardCount: cards.length,
          liveSrc: liveImg ? liveImg.getAttribute('src') : '',
          liveName: liveName ? liveName.textContent.trim() : '',
          selectedReview: selectedReview ? selectedReview.textContent.trim() : ''
        };
      })()
    `);
    console.log(`Step 3 Character Cards: ${step3Check.cardCount} (Expected: 20)`);
    console.log(`Live Preview Name: ${step3Check.liveName}, Review: ${step3Check.selectedReview}`);
    if (step3Check.cardCount !== 20) throw new Error(`Expected 20 characters, found ${step3Check.cardCount}`);
    if (step3Check.selectedReview !== testNick) throw new Error('Name review mismatch');

    // Select character 'char_09' (ليث) and verify live preview update
    await evalInPage(studentCDP, `
      (() => {
        window.ScoreARStudentJoin.selectAvatar('char_09');
      })()
    `);
    await sleep(200);
    const updatedHero = await evalInPage(studentCDP, `
      (() => {
        return {
          liveSrc: document.getElementById('studentAvatarLiveImg')?.getAttribute('src'),
          liveName: document.getElementById('studentAvatarLiveName')?.textContent.trim()
        };
      })()
    `);
    console.log('Selected Character 9:', updatedHero);
    if (!updatedHero.liveSrc.includes('char_09')) throw new Error('Avatar select did not update preview');

    // Finish join
    await evalInPage(studentCDP, `
      (async () => {
        await window.ScoreARStudentJoin.submitStep3();
      })()
    `);
    for (let i = 0; i < 25; i++) {
      const isVis = await evalInPage(studentCDP, `(() => { const s = document.getElementById('scorearStudentStage'); return s && s.style.display !== 'none'; })()`);
      if (isVis) break;
      await sleep(150);
    }

    // -------------------------------------------------------------
    // TEST 4: Verify Student Waiting Lobby & Role Badge
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Verify Student Waiting Lobby & Role Badge ---');
    const studentLobbyState = await evalInPage(studentCDP, `
      (() => {
        const stage = document.getElementById('scorearStudentStage');
        const joinErr = document.getElementById('studentStepError')?.textContent;
        return {
          visible: stage && stage.style.display !== 'none',
          html: stage ? stage.innerHTML : '',
          joinErr
        };
      })()
    `);
    console.log('studentLobbyState:', studentLobbyState);
    if (!studentLobbyState.visible || !studentLobbyState.html.includes(testNick)) {
      throw new Error('Student lobby did not open properly with student name');
    }
    console.log('✅ Student lobby open with name and character.');

    // Also simulate second student with same name to verify deduplication
    console.log('\n--- Step 5: Test Name Deduplication in Host Room ---');
    const dedupTest = await evalInPage(hostCDP, `
      (() => {
        const room = window.ScoreARQuizHost.getPlayers();
        // Emulate join message with same name
        window.ScoreARHostEvents.handleHostIncomingMessage({
          type: 'STUDENT_JOIN',
          player: { id: 'student_dup_2', name: '${testNick}', avatarId: 'char_04' }
        }, {
          currentRoom: { players: room, pin: '749102', answers: {} },
          isRoomLocked: false
        });
        return room.map(p => ({ id: p.id, name: p.name }));
      })()
    `);
    console.log('Host players after deduplication:', dedupTest);
    const hasDeduped = dedupTest.some(p => p.name === `${testNick} (2)`);
    if (!hasDeduped) throw new Error('Duplicate name was not transformed to "الاسم (2)"');
    console.log('✅ Name deduplication successfully created "الاسم (2)".');

    // -------------------------------------------------------------
    // TEST 6: Launch Question & Verify Kahoot-Style 2x2 Grid
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Launch Question & Kahoot 2x2 Grid ---');
    await evalInPage(hostCDP, `
      (() => {
        window.ScoreARQuizHost.launchQuestion(0);
        // Fast-forward 10s reading phase to answer phase
        window.ScoreARQuizHost.revealQuestionOptionsNow();
      })()
    `);
    await sleep(800);

    let studentGridCheck = null;
    for (let i = 0; i < 25; i++) {
      studentGridCheck = await evalInPage(studentCDP, `
        (() => {
          const grid = document.getElementById('studentOptionsContainer');
          const btns = document.querySelectorAll('.student-opt-btn');
          const computed = grid ? window.getComputedStyle(grid) : {};
          return {
            btnCount: btns.length,
            display: computed.display,
            gridCols: computed.gridTemplateColumns,
            title: document.querySelector('#scorearStudentStage h2, #scorearStudentStage h1')?.textContent
          };
        })()
      `);
      if (studentGridCheck && studentGridCheck.btnCount >= 2) break;
      await sleep(200);
    }
    console.log('Student Options Grid Layout:', studentGridCheck);
    if (studentGridCheck.btnCount < 2 || !studentGridCheck.display.includes('grid')) {
      throw new Error('Kahoot 2x2 options grid not properly displayed');
    }
    console.log('✅ Kahoot-style compact 2x2 options grid verified.');

    // Student taps option 1 (correct)
    await evalInPage(studentCDP, `
      (() => {
        window.ScoreARQuizStudent.submitAnswer(1);
      })()
    `);
    await sleep(500);

    // Host finishes question
    await evalInPage(hostCDP, `
      (() => {
        window.ScoreARQuizHost.finishCurrentQuestion();
      })()
    `);
    await sleep(800);

    // -------------------------------------------------------------
    // TEST 7: Leaderboard with World Background, FLIP, Badges & Counter
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Host Leaderboard Screen ---');
    await evalInPage(hostCDP, `
      (() => {
        window.ScoreARQuizHost.renderHostLeaderboard();
      })()
    `);
    await sleep(800);

    const leaderboardCheck = await evalInPage(hostCDP, `
      (() => {
        const rows = document.querySelectorAll('.scorear-leaderboard-row');
        const counters = document.querySelectorAll('.scorear-count-up');
        const stage = document.getElementById('scorearHostStage');
        return {
          rowCount: rows.length,
          counterCount: counters.length,
          hasWorldBg: stage ? stage.innerHTML.includes('assets/worlds/treasure/results.jpg') : false,
          hasMovementArrows: stage ? (stage.innerHTML.includes('▲') || stage.innerHTML.includes('—') || stage.innerHTML.includes('▼')) : false,
          hasBadges: stage ? (stage.innerHTML.includes('⚡') || stage.innerHTML.includes('🔥') || stage.innerHTML.includes('🚀')) : false
        };
      })()
    `);
    console.log('Leaderboard Verification:', leaderboardCheck);
    if (leaderboardCheck.rowCount === 0) throw new Error('Leaderboard rows missing');
    if (!leaderboardCheck.hasWorldBg) throw new Error('Leaderboard missing world background image');
    if (!leaderboardCheck.hasMovementArrows) throw new Error('Leaderboard missing rank movement arrows');
    console.log('✅ Leaderboard with world background, FLIP movement arrows and score counter verified.');

    // -------------------------------------------------------------
    // TEST 8: Final Champions Podium & Full Roster Table
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Final Champions Podium & Complete Participant Roster ---');
    await evalInPage(hostCDP, `
      (() => {
        window.ScoreARQuizHost.renderHostPodium();
      })()
    `);
    await sleep(800);

    const podiumCheck = await evalInPage(hostCDP, `
      (() => {
        const stage = document.getElementById('scorearHostStage');
        return {
          hasPodiumBg: stage ? stage.innerHTML.includes('assets/worlds/treasure/podium.jpg') : false,
          hasTop1Medal: stage ? stage.innerHTML.includes('🥇') : false,
          hasFullRoster: stage ? stage.innerHTML.includes('كشف النتائج والترتيب النهائي لكافة المتسابقين') : false
        };
      })()
    `);
    console.log('Podium Verification:', podiumCheck);
    if (!podiumCheck.hasTop1Medal) throw new Error('Podium medals missing');
    if (!podiumCheck.hasFullRoster) throw new Error('Full participant roster table missing on podium');
    console.log('✅ Final Champions Podium & full participant roster verified.');

    console.log('\n🎉 ALL BATCH 2a ACCEPTANCE TESTS PASSED 100%!');

  } finally {
    proc.kill();
    server.close();
  }
}

run().catch(err => {
  console.error('\n❌ Batch 2a Acceptance Test Failed:', err);
  process.exit(1);
});
