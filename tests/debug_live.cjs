const fs = require('fs');
const { spawn } = require('child_process');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=63498',
    '--headless=new',
    'about:blank'
  ]);
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:63498/json/list');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise(resolve => {
    const curId = id++;
    const handler = ev => {
      const m = JSON.parse(ev.data);
      if (m.id === curId) { ws.removeEventListener('message', handler); resolve(m.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });
  await new Promise(r => ws.onopen = r);
  await send('Page.navigate', { url: 'https://scorear2.web.app/#classrooms' });
  await sleep(4000);
  const r1 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        localStorage.setItem('scorear_teacher_session', JSON.stringify({ uid: 'test_t1', name: 'أحمد', role: 'teacher', isTeacher: true }));
        const actor = await window.ScoreARClassroomsService?.getCurrentActor();
        await window.ScoreARClassrooms?.renderClassroomsView();
        const stage = document.getElementById('scorearClassroomsStage');
        return {
          actor,
          stageHtml: stage ? stage.innerHTML.slice(0, 300) : 'NO_STAGE',
          hasInput: !!document.getElementById('create-class-name')
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(r1.result.value, null, 2));
  ws.close();
  chrome.kill();
}
test().catch(console.error);
