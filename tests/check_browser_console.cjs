'use strict';
const fs = require('fs');
const { spawn } = require('child_process');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const cdpPort = 9345;
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
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
      } else if (msg.method === 'Log.entryAdded') {
        console.log('LOG:', msg.params.entry.level, msg.params.entry.text);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
      }
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
    await send('Log.enable');
    await send('Page.enable');
    
    // Wait for page to fully load scripts
    await sleep(6000);

    const checkRes = await send('Runtime.evaluate', {
      expression: `(function() {
        return {
          hasScoreARQuizHost: typeof window.ScoreARQuizHost !== 'undefined',
          hasScoreARQuizHostView: typeof window.ScoreARQuizHostView !== 'undefined',
          hasScoreARBots: typeof window.ScoreARBots !== 'undefined',
          hasAppJs: typeof window.renderLiveLobby === 'function',
          scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline')
        };
      })()`,
      returnByValue: true
    });
    console.log('CheckGlobals:', JSON.stringify(checkRes.result.result.value, null, 2));

    ws.close();
  } finally {
    chromeProcess.kill();
  }
}
main().catch(console.error);
