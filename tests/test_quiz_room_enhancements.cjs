const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=================================================================');
console.log('   SCOREAR QUIZ ROOM & CLASSROOM GAMEPLAY ACCEPTANCE TEST');
console.log('=================================================================');

const baseDir = path.resolve(__dirname, '..');
let passed = 0;
let total = 0;

function test(desc, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    console.error(`  [FAIL] ${desc}: ${err.message}`);
  }
}

// Helper to create a lightweight mock DOM element
function createMockElement(tag = 'div', initialId = '', doc = null) {
  let _id = initialId;
  const el = {
    tagName: tag.toUpperCase(),
    get id() { return _id; },
    set id(val) {
      _id = String(val);
      if (doc && _id) doc.registerElement(_id, this);
    },
    style: {},
    children: [],
    attributes: {},
    _innerHTML: '',
    get innerHTML() { return this._innerHTML; },
    set innerHTML(val) {
      this._innerHTML = String(val);
      if (doc) {
        const matches = this._innerHTML.matchAll(/id=["']([^"']+)["']/g);
        for (const m of matches) {
          const childId = m[1];
          let childEl = doc.getElementById(childId);
          if (!childEl) {
            childEl = createMockElement('div', childId, doc);
            doc.registerElement(childId, childEl);
          }
          if (!this.children.includes(childEl)) this.children.push(childEl);
        }
      }
    },
    textContent: '',
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] || null; },
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    insertBefore(newChild, refChild) {
      const idx = this.children.indexOf(refChild);
      if (idx !== -1) this.children.splice(idx, 0, newChild);
      else this.children.push(newChild);
      newChild.parentNode = this;
      return newChild;
    },
    remove() {
      if (this.parentNode) {
        const idx = this.parentNode.children.indexOf(this);
        if (idx !== -1) this.parentNode.children.splice(idx, 1);
      }
    }
  };
  if (doc && _id) doc.registerElement(_id, el);
  return el;
}

function createMockDocument() {
  const elementsById = new Map();
  const doc = {
    body: null,
    createElement(tag) {
      return createMockElement(tag, '', doc);
    },
    getElementById(id) {
      return elementsById.get(id) || null;
    },
    registerElement(id, el) {
      elementsById.set(id, el);
    },
    querySelectorAll(sel) {
      return [];
    }
  };
  doc.body = createMockElement('body', 'body', doc);
  elementsById.set('body', doc.body);
  return doc;
}

const quizHostCode = fs.readFileSync(path.join(baseDir, 'quiz-host.js'), 'utf8');
const quizStudentCode = fs.readFileSync(path.join(baseDir, 'quiz-student.js'), 'utf8');
const quizAudioCode = fs.readFileSync(path.join(baseDir, 'quiz-audio.js'), 'utf8');
const appCode = fs.readFileSync(path.join(baseDir, 'app.js'), 'utf8');

// 1. Line count rules compliance
test('1. Rule 7 Compliance: File line counts', () => {
  const hostLines = quizHostCode.split('\n').length;
  const studentLines = quizStudentCode.split('\n').length;
  const audioLines = quizAudioCode.split('\n').length;
  const appLines = appCode.split('\n').length;

  console.log(`     quiz-host.js: ${hostLines} lines (limit: <500)`);
  console.log(`     quiz-student.js: ${studentLines} lines (limit: <500)`);
  console.log(`     quiz-audio.js: ${audioLines} lines (limit: <500)`);
  console.log(`     app.js: ${appLines} lines (frozen limit: <=1000)`);

  assert.ok(hostLines < 500, `quiz-host.js exceeds 500 lines: ${hostLines}`);
  assert.ok(studentLines < 500, `quiz-student.js exceeds 500 lines: ${studentLines}`);
  assert.ok(audioLines < 500, `quiz-audio.js exceeds 500 lines: ${audioLines}`);
  assert.ok(appLines <= 1000, `app.js exceeds 1000 lines: ${appLines}`);
});

// 2. Student Result Screen: Correct Answer Scenario
test('2. Student View: Correct answer feedback with celebration, speed, and points', () => {
  const dom = createMockDocument();
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    worlds: [{ id: 'royal', name: 'القصر الملكي', image: 'academy' }]
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizStudentCode);
  fn(windowObj, windowObj, dom);

  const studentApi = windowObj.ScoreARQuizStudent;
  assert.ok(studentApi, 'ScoreARQuizStudent should be defined');

  // Start session
  studentApi.startStudentSession('849201', { uid: 's_101', name: 'زياد البطل', avatarId: 'char_01' });

  // Simulate QUESTION_RESULT with Correct Answer
  const mockResult = {
    qIndex: 0,
    questionText: 'ما إعراب كلمة «العظيم» في جملة «جاء القائد العظيم»؟',
    options: ['فاعل مرفوع', 'نعت مرفوع', 'مفعول به', 'مضاف إليه'],
    correctAnswer: 1,
    correctAnswerText: 'نعت مرفوع',
    why: 'لأنها تصف القائد وتطابقه في الإعراب.',
    fastestStudent: { id: 's_101', name: 'زياد البطل', timeSec: '2.1', points: 950 },
    topLeaderboard: [{ id: 's_101', name: 'زياد البطل', score: 950, streak: 1 }],
    playerResults: {
      's_101': { correct: true, pointsEarned: 950, totalScore: 950, streak: 1, chosenIndex: 1, respTime: '2.1' }
    }
  };

  // Deliver result to student
  const stage = dom.getElementById('scorearStudentStage');
  assert.ok(stage, 'Student stage should exist');

  // Directly call internal render by triggering message or testing output
  // Simulate dispatching QUESTION_RESULT through student handler
  const mockMsg = { type: 'QUESTION_RESULT', ...mockResult };
  // Access stage after setting innerHTML in student
  const studentFn = new Function('window', 'global', 'document', 'resData', `
    ${quizStudentCode}
    ScoreARQuizStudent.startStudentSession('849201', { uid: 's_101', name: 'زياد البطل' });
    // Trigger handleStudentIncomingMessage
    // We can directly call renderStudentResult inside the closure
  `);

  // Let's test the rendered HTML from student stage
  // We will run the student code and publish QUESTION_RESULT
  let publishedMsg = null;
  windowObj.ScoreARRealtime = {
    init: (role, pin, cb) => { windowObj._studentCb = cb; },
    publish: (type, payload) => { publishedMsg = { type, payload }; },
    cleanup: () => {}
  };
  studentApi.startStudentSession('849201', { uid: 's_101', name: 'زياد البطل' });
  windowObj._studentCb(mockMsg);

  const html = stage.innerHTML;
  assert.ok(html.includes('إجابة صحيحة وممتازة!'), 'Should show correct answer title');
  assert.ok(html.includes('🎉'), 'Should show celebration emoji');
  assert.ok(html.includes('+950'), 'Should show earned points');
  assert.ok(html.includes('2.1ث'), 'Should show response speed in seconds');
  assert.ok(html.includes('نعت مرفوع'), 'Should explicitly show correct answer text');
  assert.ok(html.includes('بطل السرعة: كنت أسرع إجابة صحيحة!'), 'Should badge fastest student');
  assert.ok(html.includes('التفسير التعليمي'), 'Should show educational explanation');
});

// 3. Student Result Screen: Wrong Answer Scenario
test('3. Student View: Wrong answer feedback with explicit correct answer reveal', () => {
  const dom = createMockDocument();
  let studentCb = null;
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    ScoreARRealtime: {
      init: (role, pin, cb) => { studentCb = cb; },
      publish: () => {},
      cleanup: () => {}
    }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizStudentCode);
  fn(windowObj, windowObj, dom);

  const studentApi = windowObj.ScoreARQuizStudent;
  studentApi.startStudentSession('849201', { uid: 's_202', name: 'نور', avatarId: 'char_02' });

  // Simulate Wrong Answer Result
  const mockWrongResult = {
    type: 'QUESTION_RESULT',
    qIndex: 0,
    questionText: 'ما إعراب كلمة «العظيم»؟',
    options: ['فاعل مرفوع', 'نعت مرفوع', 'مفعول به', 'مضاف إليه'],
    correctAnswer: 1,
    correctAnswerText: 'نعت مرفوع',
    why: 'النعت يتبع المنعوت في الإعراب والتذكير والتعريف.',
    fastestStudent: { id: 's_101', name: 'زياد', timeSec: '1.8', points: 980 },
    topLeaderboard: [{ id: 's_101', name: 'زياد', score: 980, streak: 1 }],
    playerResults: {
      's_202': { correct: false, pointsEarned: 0, totalScore: 0, streak: 0, chosenIndex: 0, respTime: '4.5' }
    }
  };

  studentCb(mockWrongResult);

  const stage = dom.getElementById('scorearStudentStage');
  const html = stage.innerHTML;

  assert.ok(html.includes('إجابة خاطئة!'), 'Should show wrong answer title');
  assert.ok(html.includes('❌'), 'Should show error emoji');
  assert.ok(html.includes('+0'), 'Earned points should be 0');
  assert.ok(html.includes('الإجابة النموذجية الصحيحة:'), 'Should show correct answer heading');
  assert.ok(html.includes('نعت مرفوع'), 'Should explicitly show correct answer text');
  assert.ok(html.includes('إجابتك التي اخترتها:'), 'Should show chosen answer');
  assert.ok(html.includes('فاعل مرفوع'), 'Should show student chosen option text');
  assert.ok(html.includes('التفسير التعليمي'), 'Should show explanation');
});

// 4. Host Screen: World Background Image during Question Stage
test('4. Host View: World image large background in question stage', () => {
  const dom = createMockDocument();
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    worlds: [{ id: 'royal', name: 'القصر الملكي', image: 'academy' }],
    contestQuestions: [
      { q: 'سؤال تجريبي', opts: ['أ', 'ب', 'ج', 'د'], answer: 0, skill: 'نحو', timeLimit: 20 }
    ],
    ScoreARRealtime: {
      init: () => {},
      publish: () => {},
      cleanup: () => {}
    }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizHostCode);
  fn(windowObj, windowObj, dom);

  const hostApi = windowObj.ScoreARQuizHost;
  hostApi.startHostLobby('royal', '849201');
  hostApi.launchQuestion(0);

  const stage = dom.getElementById('scorearHostStage');
  const html = stage.innerHTML;

  assert.ok(html.includes("assets/academy.webp"), 'Should have world image assets/academy.webp in background');
  assert.ok(html.includes('center/cover no-repeat'), 'Should use center/cover background formatting');
  assert.ok(!html.includes('<video src="assets/videos/worlds/royal.mp4" poster="assets/academy.webp" autoplay loop muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:1;filter:brightness(0.35)'), 'Question stage should NOT have video background (image only)');
});

// 5. Host Screen: Reveal Phase with Correct Answer & Fastest Student
test('5. Host View: Reveal phase shows correct answer, explanation & countdown to leaderboard', () => {
  const dom = createMockDocument();
  let publishedMsg = null;
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    worlds: [{ id: 'royal', name: 'القصر الملكي', image: 'academy' }],
    contestQuestions: [
      { q: 'سؤال تجريبي', opts: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'], answer: 2, why: 'توضيح نحوي دقيق', timeLimit: 20 }
    ],
    ScoreARRealtime: {
      init: () => {},
      publish: (type, payload) => { publishedMsg = { type, payload }; },
      cleanup: () => {}
    }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizHostCode);
  fn(windowObj, windowObj, dom);

  const hostApi = windowObj.ScoreARQuizHost;
  hostApi.startHostLobby('royal', '849201');
  hostApi.launchQuestion(0);

  // Trigger finish question
  hostApi.finishCurrentQuestion();

  assert.ok(publishedMsg, 'Should publish QUESTION_RESULT');
  assert.strictEqual(publishedMsg.type, 'QUESTION_RESULT');
  assert.strictEqual(publishedMsg.payload.correctAnswer, 2);
  assert.strictEqual(publishedMsg.payload.correctAnswerText, 'خيار 3');
  assert.strictEqual(publishedMsg.payload.why, 'توضيح نحوي دقيق');

  const mainEl = dom.getElementById('hostQuestionMain');
  assert.ok(mainEl, 'Main element should exist');
  const banner = dom.getElementById('hostRevealBanner');
  assert.ok(banner, 'Reveal banner should be injected into host question view');
  assert.ok(banner.innerHTML.includes('الإجابة النموذجية الصحيحة:'), 'Banner should announce correct answer');
  assert.ok(banner.innerHTML.includes('خيار 3'), 'Banner should contain correct answer text');
  assert.ok(banner.innerHTML.includes('عرض لوحة الصدارة'), 'Banner should have button to leaderboard');
});

// 6. Host Screen: World Video Background during Crowning Podium
test('6. Host View: Crowning Podium contains world looping video background', () => {
  const dom = createMockDocument();
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    worlds: [{ id: 'royal', name: 'القصر الملكي', image: 'academy' }],
    contestQuestions: [],
    ScoreARRealtime: {
      init: () => {},
      publish: () => {},
      cleanup: () => {}
    }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizHostCode);
  fn(windowObj, windowObj, dom);

  const hostApi = windowObj.ScoreARQuizHost;
  hostApi.startHostLobby('royal', '849201');
  hostApi.renderHostPodium();

  const stage = dom.getElementById('scorearHostStage');
  const html = stage.innerHTML;

  assert.ok(html.includes('<video src="assets/videos/worlds/royal.mp4"'), 'Podium MUST contain world looping video');
  assert.ok(html.includes('autoplay loop muted playsinline'), 'Podium video should autoplay loop muted');
  assert.ok(html.includes('👑 منصة تتويج أبطال عالم القصر الملكي'), 'Podium header should be rendered');
});

// 7. Single-Device app.js: Question stage has image, Podium has video
test('7. app.js Single-Device: Question stage has image background, Podium has video background', () => {
  assert.ok(appCode.includes("<!-- Background Artwork: World Crisp Large Background (No Video during question) -->"), 'app.js question stage should use world image');
  assert.ok(appCode.includes('<video src="assets/videos/worlds/${w.id}.mp4?v=20261106_smooth" poster="assets/${w.image}.webp" autoplay loop muted playsinline'), 'app.js podium stage should contain world video');
});

// 8. Audio Engine: ScoreARAudio verification
test('8. ScoreARAudio: Music tracks, SFX mapping, Volume, and Mute Controls', () => {
  const playedAudios = [];
  class MockAudio {
    constructor(src) {
      this.src = src;
      this.loop = false;
      this.volume = 1;
      this.paused = true;
      playedAudios.push(this);
    }
    play() {
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  }

  const dom = createMockDocument();
  const windowObj = { document: dom, Audio: MockAudio };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', 'Audio', quizAudioCode);
  fn(windowObj, windowObj, dom, MockAudio);

  const audioApi = windowObj.ScoreARAudio;
  assert.ok(audioApi, 'ScoreARAudio should be defined');

  // Test playMusic for royal
  audioApi.playMusic('royal');
  assert.ok(playedAudios.some(a => a.src.includes('assets/audio/music/royal.mp3')), 'Should play royal music');

  // Test playMusic for victory
  audioApi.playMusic('victory');
  assert.ok(playedAudios.some(a => a.src.includes('assets/audio/music/victory.mp3')), 'Should play victory music');

  // Test playSfx for reveal, correct, wrong, fanfare
  audioApi.playSfx('reveal');
  assert.ok(playedAudios.some(a => a.src.includes('assets/audio/sfx/reveal.mp3')), 'Should play reveal SFX');

  audioApi.playSfx('correct');
  assert.ok(playedAudios.some(a => a.src.includes('assets/audio/sfx/correct.mp3')), 'Should play correct SFX');

  audioApi.playSfx('wrong');
  assert.ok(playedAudios.some(a => a.src.includes('assets/audio/sfx/wrong.mp3')), 'Should play wrong SFX');

  audioApi.playSfx('fanfare');
  assert.ok(playedAudios.some(a => a.src.includes('assets/audio/sfx/fanfare.mp3')), 'Should play fanfare SFX');

  // Test toggle mute
  assert.strictEqual(audioApi.isMuted(), false);
  const muted = audioApi.toggleMute();
  assert.strictEqual(muted, true);
  assert.strictEqual(audioApi.isMuted(), true);
  audioApi.toggleMute();
  assert.strictEqual(audioApi.isMuted(), false);
});

// 9. Host Screen: Phase 1 (10s Reading Preview) hides options and broadcasts QUESTION_READING
test('9. Host View: Phase 1 (10s Reading Preview) hides options and broadcasts QUESTION_READING', () => {
  const dom = createMockDocument();
  let publishedEvents = [];
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    worlds: [{ id: 'oasis', name: 'واحة النخيل', image: 'pyramids' }],
    contestQuestions: [
      { skill: 'البلاغة', q: 'ما نوع الصورة البيانية في: ضحك الربيع أزهاراً؟', opts: ['استعارة مكنية', 'تشبيه مجمل', 'مجاز مرسل', 'كناية عن موصوف'], answer: 0, why: 'استعار صفة الضحك للربيع على سبيل الاستعارة المكنية.' },
      { skill: 'النحو', q: 'إعراب كلمة (أزهاراً)؟', opts: ['حال منصوب', 'تمييز منصوب', 'مفعول لأجله', 'مفعول مطلق'], answer: 1, why: 'تمييز ملحوظ منصوب.' }
    ],
    ScoreARRealtime: {
      init: () => {},
      publish: (type, payload) => { publishedEvents.push({ type, payload }); },
      cleanup: () => {}
    },
    ScoreARAudio: {
      playMusic: () => {},
      stopMusic: () => {},
      playSfx: () => {}
    }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizHostCode);
  fn(windowObj, windowObj, dom);

  const hostApi = windowObj.ScoreARQuizHost;
  hostApi.startHostLobby('oasis', '123456');

  // Launch Question 0 -> Phase 1
  hostApi.launchQuestion(0);

  const readingEvent = publishedEvents.find(e => e.type === 'QUESTION_READING');
  assert.ok(readingEvent, 'Should publish QUESTION_READING event');
  assert.strictEqual(readingEvent.payload.qIndex, 0);
  assert.strictEqual(readingEvent.payload.readingTime, 10);
  assert.strictEqual(readingEvent.payload.q, 'ما نوع الصورة البيانية في: ضحك الربيع أزهاراً؟');

  const stage = dom.getElementById('scorearHostStage');
  const html = stage.innerHTML;

  // Options grid should NOT be visible during reading phase
  assert.ok(!html.includes('id="hostOptionsGrid"'), 'Options grid must be hidden during reading phase');
  assert.ok(html.includes('📖 مرحلة قراءة السؤال:'), 'Host view must indicate reading phase countdown');
  assert.ok(html.includes('بدء الخيارات فوراً 🚀'), 'Host view must provide skip button to reveal options early');
  assert.ok(html.includes('🔒 الخيارات تفتح لجميع الطلاب بعد انتهاء وقت القراءة...'), 'Host must show locked notice');
});

// 10. Host Screen: Phase 2 (Reveal Options) displays 4 choices and broadcasts QUESTION_START
test('10. Host View: Phase 2 (Reveal Options) displays 4 choices and broadcasts QUESTION_START', () => {
  const dom = createMockDocument();
  let publishedEvents = [];
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    worlds: [{ id: 'oasis', name: 'واحة النخيل', image: 'pyramids' }],
    contestQuestions: [
      { skill: 'البلاغة', q: 'ما نوع الصورة البيانية في: ضحك الربيع أزهاراً؟', opts: ['استعارة مكنية', 'تشبيه مجمل', 'مجاز مرسل', 'كناية عن موصوف'], answer: 0, why: 'استعار صفة الضحك للربيع.' }
    ],
    ScoreARRealtime: {
      init: () => {},
      publish: (type, payload) => { publishedEvents.push({ type, payload }); },
      cleanup: () => {}
    },
    ScoreARAudio: {
      playMusic: () => {},
      stopMusic: () => {},
      playSfx: () => {}
    }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizHostCode);
  fn(windowObj, windowObj, dom);

  const hostApi = windowObj.ScoreARQuizHost;
  hostApi.startHostLobby('oasis', '123456');
  hostApi.launchQuestion(0);

  // Trigger reveal options
  hostApi.revealQuestionOptionsNow();

  const startEvent = publishedEvents.find(e => e.type === 'QUESTION_START');
  assert.ok(startEvent, 'Should publish QUESTION_START on reveal');
  assert.strictEqual(startEvent.payload.qIndex, 0);
  assert.strictEqual(startEvent.payload.opts.length, 4);

  const stage = dom.getElementById('scorearHostStage');
  const html = stage.innerHTML;

  assert.ok(html.includes('id="hostOptionsGrid"'), 'Options grid MUST be rendered now');
  assert.ok(html.includes('استعارة مكنية'), 'Choice 1 must be present');
  assert.ok(html.includes('تشبيه مجمل'), 'Choice 2 must be present');
  assert.ok(html.includes('id="hostTimerBadge"'), 'Timer badge must be active');
});

// 11. Host Repetition: Sequence repeats between Question 1 and Question 2
test('11. Host View: 10s Reading Preview repeats before Question 2', () => {
  const dom = createMockDocument();
  let readingEventsCount = 0;
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    worlds: [{ id: 'cosmic', name: 'الفضاء الكوني', image: 'space' }],
    contestQuestions: [
      { skill: 'س1', q: 'السؤال الأول', opts: ['أ', 'ب', 'ج', 'د'], answer: 0 },
      { skill: 'س2', q: 'السؤال الثاني', opts: ['أ', 'ب', 'ج', 'د'], answer: 1 }
    ],
    ScoreARRealtime: {
      init: () => {},
      publish: (type) => { if (type === 'QUESTION_READING') readingEventsCount++; },
      cleanup: () => {}
    },
    ScoreARAudio: { playMusic: () => {}, stopMusic: () => {}, playSfx: () => {} }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizHostCode);
  fn(windowObj, windowObj, dom);

  const hostApi = windowObj.ScoreARQuizHost;
  hostApi.startHostLobby('cosmic', '654321');

  // Question 0 reading
  hostApi.launchQuestion(0);
  assert.strictEqual(readingEventsCount, 1, 'First question should trigger reading phase');

  // Reveal Q0 and finish
  hostApi.revealQuestionOptionsNow();
  hostApi.finishCurrentQuestion();

  // Next question Q1 reading
  hostApi.launchQuestion(1);
  assert.strictEqual(readingEventsCount, 2, 'Second question MUST trigger reading phase again!');
  assert.ok(dom.getElementById('scorearHostStage').innerHTML.includes('السؤال الثاني'), 'Stage should show Q2 text in reading phase');
});

// 12. Student View: Reading phase displays preview and locked options, then unlocks upon QUESTION_START
test('12. Student View: Reading phase displays preview and locked options, then unlocks upon QUESTION_START', () => {
  const dom = createMockDocument();
  let studentPublished = [];
  const windowObj = {
    document: dom,
    location: { origin: 'http://localhost', pathname: '/' },
    ScoreARRealtime: {
      init: (role, pin, cb) => { windowObj._incomingCb = cb; },
      publish: (type, payload) => { studentPublished.push({ type, payload }); },
      cleanup: () => {}
    },
    ScoreARAudio: { playSfx: () => {} }
  };
  windowObj.window = windowObj;

  const fn = new Function('window', 'global', 'document', quizStudentCode);
  fn(windowObj, windowObj, dom);

  const studentApi = windowObj.ScoreARQuizStudent;
  studentApi.startStudentSession('123456', { uid: 'stud_99', name: 'زيد' });

  // 1. Simulate Host sending QUESTION_READING
  windowObj._incomingCb({
    type: 'QUESTION_READING',
    qIndex: 0,
    totalQuestions: 3,
    skill: 'النحو',
    q: '«النجاحُ حليفُ المجتهدين». ما نوع المبتدأ؟',
    readingTime: 10
  });

  const stage = dom.getElementById('scorearStudentStage');
  let html = stage.innerHTML;

  assert.ok(html.includes('«النجاحُ حليفُ المجتهدين»'), 'Student screen must show question during reading phase');
  assert.ok(html.includes('id="studentReadingCountdown"'), 'Student screen must show reading countdown');
  assert.ok(html.includes('الخيارات ستفتح تلقائياً فور انتهاء ثواني القراءة...'), 'Student screen must show locked options badge');
  assert.ok(!html.includes('id="studentOptionsContainer"'), 'Option buttons must NOT be accessible during reading phase');

  // 2. Simulate Host sending QUESTION_START (options reveal)
  windowObj._incomingCb({
    type: 'QUESTION_START',
    qIndex: 0,
    totalQuestions: 3,
    skill: 'النحو',
    q: '«النجاحُ حليفُ المجتهدين». ما نوع المبتدأ؟',
    opts: ['اسم ظاهر معرب', 'ضمير منفصل', 'مصدر مؤول', 'اسم إشارة'],
    timeLimit: 20
  });

  html = stage.innerHTML;
  assert.ok(html.includes('id="studentOptionsContainer"'), 'Option buttons MUST be visible now');
  assert.ok(html.includes('اسم ظاهر معرب'), 'Option 1 text rendered');
  assert.ok(html.includes('id="studentTimerPill"'), 'Student answering countdown active');

  // 3. Student submits answer
  studentApi.submitAnswer(0);

  const ansMsg = studentPublished.find(m => m.type === 'STUDENT_ANSWER');
  assert.ok(ansMsg, 'Should publish STUDENT_ANSWER');
  assert.strictEqual(ansMsg.payload.optionIndex, 0);
  assert.strictEqual(ansMsg.payload.playerId, 'stud_99');
});

console.log('-----------------------------------------------------------------');
console.log(`Summary: ${passed}/${total} tests passed.`);
console.log('=================================================================');
if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
