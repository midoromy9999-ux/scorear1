'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_EXE = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const cdpPort = 9338;
  const targetUrl = 'https://socerar2.vercel.app/#worlds';
  const chromeProcess = spawn(BROWSER_EXE, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1920,1080',
    '--remote-debugging-port=' + cdpPort,
    targetUrl
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const res = await fetch('http://127.0.0.1:' + cdpPort + '/json/list');
        if (res.ok) {
          const tabs = await res.json();
          const t = tabs.find(x => x.type === 'page' && x.webSocketDebuggerUrl);
          if (t) { wsUrl = t.webSocketDebuggerUrl; break; }
        }
      } catch {}
    }
    if (!wsUrl) throw new Error('CDP connection failed');

    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 1;
    const callbacks = new Map();
    const networkErrors = [];
    const consoleLogs = [];

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        cb(msg);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push('[' + msg.params.type + '] ' + msg.params.args.map(a => a.value || JSON.stringify(a)).join(' '));
      }
      if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
        networkErrors.push(msg.params.response.status + ' ' + msg.params.response.url);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');

    console.log('Waiting for worlds page load...');
    await sleep(3500);

    // Click "انطلاق القاعة بهذا العالم" for royal
    console.log('Clicking launch button for royal...');
    const clickLaunch = await send('Runtime.evaluate', {
      expression: `(function() {
        const btn = document.querySelector('[data-action="launchworld"][data-world="royal"]') || document.querySelector('[data-action="launchworld"]');
        if (btn) {
          btn.click();
          return 'Clicked button: ' + btn.textContent.trim();
        }
        return 'No launch button found';
      })()`,
      returnByValue: true
    });
    console.log('Launch click:', clickLaunch.result && clickLaunch.result.result && clickLaunch.result.result.value);

    await sleep(3000);

    // Add 5 bots
    console.log('Adding 5 demo players...');
    const botRes = await send('Runtime.evaluate', {
      expression: `(function() {
        if (window.ScoreARBots && typeof window.ScoreARBots.addBotsToHostRoom === 'function') {
          window.ScoreARBots.addBotsToHostRoom(5);
          return 'added via ScoreARBots.addBotsToHostRoom';
        }
        if (window.ScoreARQuizHost && typeof window.ScoreARQuizHost.addDemoPlayer === 'function') {
          for (let i = 0; i < 5; i++) window.ScoreARQuizHost.addDemoPlayer();
          return 'added via addDemoPlayer';
        }
        return 'no bot helper found';
      })()`,
      returnByValue: true
    });
    console.log('Bot add result:', botRes.result && botRes.result.result && botRes.result.result.value);

    await sleep(3000);

    // Detailed diagnostic evaluation
    const diagRes = await send('Runtime.evaluate', {
      expression: `(function() {
        try {
          const arena = document.getElementById('hostCharactersArena');
          if (!arena) {
            return {
              error: 'No #hostCharactersArena found',
              bodyHtml: document.body.innerHTML.substring(0, 1000)
            };
          }
          
          const arenaRect = arena.getBoundingClientRect();
          const arenaStyle = window.getComputedStyle(arena);
          
          const slots = Array.from(arena.querySelectorAll('.host-lobby-hero-slot'));
          const slotData = slots.map(function(s, idx) {
            const sRect = s.getBoundingClientRect();
            const sStyle = window.getComputedStyle(s);
            const pill = s.querySelector('.player-name-floating-pill');
            const pRect = pill ? pill.getBoundingClientRect() : null;
            const fig = s.querySelector('.host-lobby-hero-figure');
            const fRect = fig ? fig.getBoundingClientRect() : null;
            const fStyle = fig ? window.getComputedStyle(fig) : null;
            const charSpan = s.querySelector('.scorear-character');
            const csRect = charSpan ? charSpan.getBoundingClientRect() : null;
            const csStyle = charSpan ? window.getComputedStyle(charSpan) : null;
            const img = s.querySelector('#hostHeroImg_' + idx) || s.querySelector('.host-lobby-hero-figure img');
            const imgRect = img ? img.getBoundingClientRect() : null;
            const imgStyle = img ? window.getComputedStyle(img) : null;

            return {
              idx: idx,
              slotRect: { top: Math.round(sRect.top), left: Math.round(sRect.left), width: Math.round(sRect.width), height: Math.round(sRect.height) },
              pillRect: pRect ? { top: Math.round(pRect.top), bottom: Math.round(pRect.bottom), height: Math.round(pRect.height) } : null,
              figRect: fRect ? { top: Math.round(fRect.top), bottom: Math.round(fRect.bottom), height: Math.round(fRect.height) } : null,
              figDisplay: fStyle ? fStyle.display : null,
              figVisibility: fStyle ? fStyle.visibility : null,
              figOpacity: fStyle ? fStyle.opacity : null,
              charSpanRect: csRect ? { top: Math.round(csRect.top), bottom: Math.round(csRect.bottom), height: Math.round(csRect.height) } : null,
              charSpanClasses: charSpan ? charSpan.className : null,
              charSpanDisplay: csStyle ? csStyle.display : null,
              charSpanVisibility: csStyle ? csStyle.visibility : null,
              imgSrc: img ? img.src : null,
              imgRect: imgRect ? { top: Math.round(imgRect.top), bottom: Math.round(imgRect.bottom), height: Math.round(imgRect.height) } : null,
              imgDisplay: imgStyle ? imgStyle.display : null,
              imgVisibility: imgStyle ? imgStyle.visibility : null,
              imgOpacity: imgStyle ? imgStyle.opacity : null,
              imgNaturalWidth: img ? img.naturalWidth : null,
              imgNaturalHeight: img ? img.naturalHeight : null,
              imgComplete: img ? img.complete : null
            };
          });

          return {
            windowInner: { width: window.innerWidth, height: window.innerHeight },
            arena: {
              rect: { top: Math.round(arenaRect.top), bottom: Math.round(arenaRect.bottom), height: Math.round(arenaRect.height) },
              display: arenaStyle.display,
              visibility: arenaStyle.visibility,
              overflowX: arenaStyle.overflowX,
              overflowY: arenaStyle.overflowY,
              position: arenaStyle.position
            },
            slotsCount: slots.length,
            slotData: slotData
          };
        } catch (e) {
          return { catchError: e.message, stack: e.stack };
        }
      })()`,
      returnByValue: true
    });

    console.log('\n--- DIAGNOSTIC RESULTS ---');
    console.log(JSON.stringify(diagRes.result && diagRes.result.result && diagRes.result.result.value, null, 2));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.result && shot.result.data) {
      fs.writeFileSync('tests/lobby_diagnostic_shot.png', Buffer.from(shot.result.data, 'base64'));
      console.log('Saved screenshot to tests/lobby_diagnostic_shot.png');
    }

    if (networkErrors.length > 0) {
      console.log('\n--- NETWORK ERRORS ---');
      console.log(networkErrors.join('\n'));
    }

    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
