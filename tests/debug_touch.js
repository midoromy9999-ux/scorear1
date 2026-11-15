import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(EDGE_PATH, [
  '--remote-debugging-port=9233',
  '--headless=new',
  'https://scorear2.web.app/#home'
]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9233/json/list');
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (callbacks.has(msg.id)) {
        const { resolve } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        resolve(msg.result);
      }
    };
    function send(method, params = {}) {
      return new Promise(resolve => {
        const msgId = id++;
        callbacks.set(msgId, { resolve });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await new Promise(r => { ws.onopen = r; });
    await send('Page.enable');
    await send('Runtime.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true
    });

    await sleep(2000);

    // Physical Input Tap function
    async function physicalTap(x, y) {
      const cx = Math.round(x);
      const cy = Math.round(y);
      // Under touch emulation, dispatchMouseEvent synthesizes touchstart, touchend, and click with exact coordinates
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
      await sleep(40);
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });
      await sleep(500);
    }

    // 1. Get menu button coordinates
    const btnRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('[data-action="menu"], .launch-menu, .mobile-menu'));
        const btn = btns.find(b => {
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && window.getComputedStyle(b).display !== 'none';
        });
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width/2, y: r.top + r.height/2 };
      })()`,
      returnByValue: true
    });
    const btn = btnRes.result.value;
    console.log('Button:', btn);

    await physicalTap(btn.x, btn.y);

    const openState = await send('Runtime.evaluate', {
      expression: `(() => {
        const sidebar = document.getElementById('sidebar');
        return {
          open: sidebar ? sidebar.classList.contains('open') : false,
          inert: sidebar ? sidebar.inert : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Open state:', openState.result.value);

    // Query all links inside open sidebar
    const linksRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const links = Array.from(document.querySelectorAll('#sidebar nav a')).map(a => {
          const r = a.getBoundingClientRect();
          return {
            href: a.getAttribute('href'),
            text: a.textContent.trim(),
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            width: r.width,
            height: r.height
          };
        });
        return links;
      })()`,
      returnByValue: true
    });
    console.log('Sidebar links while open:', linksRes.result.value);

    proc.kill();
    process.exit(0);
  } catch (e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 3000);
