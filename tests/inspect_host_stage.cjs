'use strict';
const fs = require('fs');
const { spawn } = require('child_process');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const cdpPort = 9346;
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1920,1080',
    '--remote-debugging-port=' + cdpPort,
    'https://socerar2.vercel.app/#worlds'
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
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        cb(msg);
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

    console.log('Waiting for window.ScoreARQuizHost...');
    for (let k = 0; k < 20; k++) {
      await sleep(500);
      const evalReady = await send('Runtime.evaluate', {
        expression: `typeof window.ScoreARQuizHost !== 'undefined' && typeof window.ScoreARQuizHost.startHostLobby === 'function'`,
        returnByValue: true
      });
      if (evalReady.result?.result?.value === true) {
        console.log('ScoreARQuizHost is ready at iteration', k);
        break;
      }
    }

    console.log('Invoking ScoreARQuizHost.startHostLobby...');
    const startRes = await send('Runtime.evaluate', {
      expression: `(function() {
        try {
          window.ScoreARQuizHost.startHostLobby('royal', '954112', true, true);
          return { ok: true, pin: window.ScoreARQuizHost.getPin() };
        } catch(e) {
          return { err: e.message, stack: e.stack };
        }
      })()`,
      returnByValue: true
    });
    console.log('startRes:', JSON.stringify(startRes.result?.result?.value));

    await sleep(2000);

    console.log('Adding 5 bots...');
    const botRes = await send('Runtime.evaluate', {
      expression: `(function() {
        try {
          if (window.ScoreARBots && typeof window.ScoreARBots.addBotsToHostRoom === 'function') {
            window.ScoreARBots.addBotsToHostRoom(5);
            return { ok: true, method: 'ScoreARBots.addBotsToHostRoom' };
          }
          if (window.ScoreARQuizHost) {
            for(let i=0; i<5; i++) window.ScoreARQuizHost.addDemoPlayer();
            return { ok: true, method: 'addDemoPlayer' };
          }
          return { err: 'no bot method' };
        } catch(e) {
          return { err: e.message };
        }
      })()`,
      returnByValue: true
    });
    console.log('botRes:', JSON.stringify(botRes.result?.result?.value));

    await sleep(2500);

    console.log('Inspecting DOM & computed styles...');
    const inspectRes = await send('Runtime.evaluate', {
      expression: `(function() {
        try {
          const arena = document.getElementById('hostCharactersArena');
          if (!arena) return { err: 'no arena' };
          const aRect = arena.getBoundingClientRect();
          const aStyle = window.getComputedStyle(arena);

          const slots = Array.from(arena.querySelectorAll('.host-lobby-hero-slot'));
          const slotsDetails = slots.map((s, idx) => {
            const sRect = s.getBoundingClientRect();
            const pill = s.querySelector('.player-name-floating-pill');
            const pRect = pill ? pill.getBoundingClientRect() : null;
            const fig = s.querySelector('.host-lobby-hero-figure');
            const fRect = fig ? fig.getBoundingClientRect() : null;
            const fStyle = fig ? window.getComputedStyle(fig) : null;
            const charSpan = s.querySelector('.scorear-character');
            const csRect = charSpan ? charSpan.getBoundingClientRect() : null;
            const csStyle = charSpan ? window.getComputedStyle(charSpan) : null;
            const img = s.querySelector('#hostHeroImg_' + idx) || (fig ? fig.querySelector('img') : null);
            const imgRect = img ? img.getBoundingClientRect() : null;
            const imgStyle = img ? window.getComputedStyle(img) : null;

            return {
              idx,
              slotRect: { top: Math.round(sRect.top), bottom: Math.round(sRect.bottom), height: Math.round(sRect.height) },
              pillRect: pRect ? { top: Math.round(pRect.top), bottom: Math.round(pRect.bottom), height: Math.round(pRect.height) } : null,
              figRect: fRect ? { top: Math.round(fRect.top), bottom: Math.round(fRect.bottom), height: Math.round(fRect.height) } : null,
              figComputed: fStyle ? { display: fStyle.display, visibility: fStyle.visibility, opacity: fStyle.opacity, height: fStyle.height } : null,
              charSpanRect: csRect ? { top: Math.round(csRect.top), bottom: Math.round(csRect.bottom), height: Math.round(csRect.height) } : null,
              charSpanComputed: csStyle ? { display: csStyle.display, visibility: csStyle.visibility, opacity: csStyle.opacity, height: csStyle.height } : null,
              imgSrc: img ? img.src : null,
              imgComplete: img ? img.complete : null,
              imgNaturalWidth: img ? img.naturalWidth : null,
              imgNaturalHeight: img ? img.naturalHeight : null,
              imgRect: imgRect ? { top: Math.round(imgRect.top), bottom: Math.round(imgRect.bottom), width: Math.round(imgRect.width), height: Math.round(imgRect.height) } : null,
              imgComputed: imgStyle ? { display: imgStyle.display, visibility: imgStyle.visibility, opacity: imgStyle.opacity } : null
            };
          });

          return {
            windowInner: { w: window.innerWidth, h: window.innerHeight },
            arena: {
              rect: { top: Math.round(aRect.top), bottom: Math.round(aRect.bottom), height: Math.round(aRect.height) },
              computed: { display: aStyle.display, visibility: aStyle.visibility, height: aStyle.height, overflow: aStyle.overflow }
            },
            slotsCount: slots.length,
            slotsDetails
          };
        } catch(e) {
          return { err: e.message, stack: e.stack };
        }
      })()`,
      returnByValue: true
    });
    console.log('inspectRes:\n', JSON.stringify(inspectRes.result?.result?.value, null, 2));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.result && shot.result.data) {
      fs.writeFileSync('tests/lobby_stage_test.png', Buffer.from(shot.result.data, 'base64'));
      console.log('Saved tests/lobby_stage_test.png');
    }

    ws.close();
  } finally {
    chromeProcess.kill();
  }
}
main().catch(console.error);
