'use strict';
const fs = require('fs');
const { spawn } = require('child_process');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const cdpPort = 9340;
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
    await sleep(3500);

    const res = await send('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll("button")).map(b => ({ text: b.textContent.trim().substring(0, 40), action: b.getAttribute("data-action"), world: b.getAttribute("data-world"), onclick: b.getAttribute("onclick") }))',
      returnByValue: true
    });
    console.log(JSON.stringify(res.result.result.value, null, 2));
    ws.close();
  } finally {
    chromeProcess.kill();
  }
}
main();
