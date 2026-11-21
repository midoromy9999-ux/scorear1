/**
 * Audit Fixes Regression & Synchronized Multi-Client E2E Verification Suite
 * Covers all 5 verified audit fixes at commit 51528b8 + synchronized Host/Student parity across all 4 modes:
 * 1. Strict uid/playerId matching (zero same-name student leakage in grading, results, leaderboard, podium, survival, duel).
 * 2. Preservation of 0-point practice questions across evaluator/host/importer/builder/bank/AI pipeline.
 * 3. Excel/CSV importer sparse-column answer key mapping, blank-key rejection, 4-option limit, and single-choice guard.
 * 4. Exact actual deduction display when losing ASK_QUESTION (wager100) with < 100 points.
 * 5. Full synchronized Host + Multi-Student E2E verification across SOLO, DUEL_TEAMS, SURVIVAL, and CARD_ARENA.
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

function resolveFile(file) {
  const candidates = [
    path.join(rootDir, file),
    path.join(rootDir, 'js', 'engines', file),
    path.join(rootDir, 'js', 'quiz', file),
    path.join(rootDir, 'js', 'journey', file),
    path.join(rootDir, 'js', 'auth', file),
    path.join(rootDir, 'js', 'ui', file)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Cannot resolve file: ' + file);
}

function createStorageMock() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store.clear(); }
  };
}

function createMockElement(tag, elementsMap) {
  let _id = '';
  const el = {
    tagName: String(tag || 'DIV').toUpperCase(),
    get id() { return _id; },
    set id(v) { _id = v; if (v) elementsMap.set(v, el); },
    style: {},
    className: '',
    value: '',
    disabled: false,
    dataset: {},
    attrs: {},
    classList: {
      add() {},
      remove() {},
      contains: () => false
    },
    children: [],
    parentElement: null,
    innerHTML: '',
    textContent: '',
    offsetWidth: 360,
    offsetHeight: 220,
    appendChild(child) {
      if (child && typeof child === 'object') {
        child.parentElement = el;
        el.children.push(child);
        if (child.id) elementsMap.set(child.id, child);
      }
      return child;
    },
    insertAdjacentElement() {},
    insertAdjacentHTML() {},
    setAttribute(k, v) { el.attrs[k] = String(v); },
    getAttribute(k) { return el.attrs[k] ?? null; },
    addEventListener() {},
    removeEventListener() {},
    getContext() {
      return {
        fillStyle: '', font: '', textAlign: '', globalCompositeOperation: '',
        fillRect() {}, fillText() {}, beginPath() {}, arc() {}, fill() {}
      };
    },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 220 }),
    remove() { if (el.id) elementsMap.delete(el.id); },
    querySelector(sel) {
      if (sel && sel.startsWith('#')) return elementsMap.get(sel.slice(1)) || null;
      return null;
    },
    querySelectorAll() { return []; }
  };
  return el;
}

function createRtdbEngine() {
  const data = {};
  const childListeners = new Map();

  function resolveSv(v) {
    if (v && typeof v === 'object') {
      if (v['.sv'] === 'timestamp') return Date.now();
      if (Array.isArray(v)) return v.map(resolveSv);
      const out = {};
      for (const k of Object.keys(v)) out[k] = resolveSv(v[k]);
      return out;
    }
    return v;
  }

  function getAt(p) {
    const parts = String(p || '').split('/').filter(Boolean);
    let cur = data;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return null;
      cur = cur[part];
    }
    return cur === undefined ? null : cur;
  }

  function setAt(p, rawVal) {
    const parts = String(p || '').split('/').filter(Boolean);
    const val = resolveSv(rawVal);
    if (!parts.length) return;
    let cur = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    const leafKey = parts[parts.length - 1];
    const isNew = cur[leafKey] === undefined;
    cur[leafKey] = val;
    const parentPath = parts.slice(0, -1).join('/');
    const set = childListeners.get(parentPath);
    if (isNew && set && set.size) {
      const snap = { key: leafKey, val: () => JSON.parse(JSON.stringify(val)), exists: () => val !== null };
      set.forEach(fn => fn(snap));
    }
  }

  function updateAt(p, patch) {
    const resolved = resolveSv(patch || {});
    for (const [k, v] of Object.entries(resolved)) {
      if (k.includes('/')) {
        setAt((p ? p + '/' : '') + k, v);
      } else {
        const parts = String(p || '').split('/').filter(Boolean);
        let cur = data;
        for (const part of parts) {
          if (!cur[part] || typeof cur[part] !== 'object') cur[part] = {};
          cur = cur[part];
        }
        cur[k] = v;
      }
    }
  }

  return {
    data,
    db: {
      ref(pathStr = '') {
        const clean = String(pathStr || '').replace(/^\/+|\/+$/g, '');
        return {
          async set(v) { setAt(clean, v); },
          async update(patch) { updateAt(clean, patch); },
          async once() {
            const v = getAt(clean);
            return {
              key: clean.split('/').pop(),
              exists: () => v !== null,
              val: () => (v === null ? null : JSON.parse(JSON.stringify(v)))
            };
          },
          on(ev, fn) {
            if (ev !== 'child_added' || typeof fn !== 'function') return fn;
            if (!childListeners.has(clean)) childListeners.set(clean, new Set());
            childListeners.get(clean).add(fn);
            const existing = getAt(clean);
            if (existing && typeof existing === 'object') {
              Object.entries(existing).forEach(([k, v]) => fn({ key: k, val: () => JSON.parse(JSON.stringify(v)), exists: () => true }));
            }
            return fn;
          },
          off(ev, fn) {
            const set = childListeners.get(clean);
            if (!set) return;
            if (fn) set.delete(fn);
            else set.clear();
          },
          onDisconnect() {
            return { update: async () => {}, set: async () => {}, remove: async () => {} };
          }
        };
      }
    }
  };
}

function loadVmContext({ scripts = [], dbEngine = null, role = 'host', uid = 'host_1', bus = null } = {}) {
  const elements = new Map();
  const doc = {
    readyState: 'complete',
    baseURI: 'http://localhost/',
    head: createMockElement('HEAD', elements),
    body: createMockElement('BODY', elements),
    createElement: (tag) => createMockElement(tag, elements),
    getElementById: (id) => elements.get(id) || null,
    querySelector(sel) { return sel && sel.startsWith('#') ? (elements.get(sel.slice(1)) || null) : null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    dispatchEvent() {}
  };

  const subscribers = new Set();
  const typedSubscribers = new Map();
  let myRole = role;

  const realtimeMock = {
    generatedPin: '778899',
    generatePin() { return this.generatedPin; },
    async init(r, p, cb) {
      myRole = (r === 'host' || r === 'teacher' || r === 'admin') ? 'host' : 'student';
      subscribers.clear();
      typedSubscribers.clear();
      if (typeof cb === 'function') subscribers.add(cb);
    },
    subscribe(typeOrFn, fnArg) {
      if (typeof typeOrFn === 'string' && typeof fnArg === 'function') {
        if (!typedSubscribers.has(typeOrFn)) typedSubscribers.set(typeOrFn, new Set());
        typedSubscribers.get(typeOrFn).add(fnArg);
        return () => typedSubscribers.get(typeOrFn)?.delete(fnArg);
      }
      if (typeof typeOrFn === 'function') {
        subscribers.add(typeOrFn);
        return () => subscribers.delete(typeOrFn);
      }
      return () => {};
    },
    publish(type, payload = {}) {
      if (!bus) return;
      const packet = {
        type,
        ...payload,
        _senderRole: myRole,
        _senderUid: uid,
        _timestamp: Date.now()
      };
      bus.clients.forEach(c => {
        if (c === clientRef) return;
        if (c.role === 'student' && packet._senderRole === 'student') return;
        c.receive(JSON.parse(JSON.stringify(packet)));
      });
    },
    cleanup() { subscribers.clear(); typedSubscribers.clear(); }
  };

  const rtdb = dbEngine || createRtdbEngine();
  const authMock = {
    currentUser: uid ? { uid, isAnonymous: role === 'student' } : null,
    onAuthStateChanged() { return () => {}; },
    async signInAnonymously() {
      if (!authMock.currentUser) authMock.currentUser = { uid: uid || 'anon_1', isAnonymous: true };
      return { user: authMock.currentUser };
    }
  };

  const alerts = [];
  const toasts = [];

  const sandbox = {
    window: null,
    global: null,
    globalThis: null,
    location: { origin: 'http://localhost', pathname: '/', hostname: 'localhost' },
    document: doc,
    localStorage: createStorageMock(),
    sessionStorage: createStorageMock(),
    setTimeout, clearTimeout, setInterval, clearInterval,
    Date, Math, Set, Map, Array, Object, Number, String, Boolean, JSON, Promise, RegExp, console,
    URL,
    CustomEvent: function(name, opts) { this.type = name; this.detail = opts?.detail; },
    addEventListener() {},
    removeEventListener() {},
    crypto: { randomUUID: () => 'uuid_' + Math.random().toString(36).slice(2, 10) },
    alert: (m) => alerts.push(String(m)),
    toast: (m) => toasts.push(String(m)),
    confirm: () => true,
    prompt: () => null,
    ScoreARAuth: { getAuth: () => authMock, getDb: () => rtdb.db, getCurrentUser: () => authMock.currentUser },
    firebase: {
      auth: () => authMock,
      database: Object.assign(() => rtdb.db, { ServerValue: { TIMESTAMP: { '.sv': 'timestamp' } } })
    },
    ScoreARRealtime: bus ? realtimeMock : {
      publish() {},
      subscribe() { return () => {}; },
      init() {},
      cleanup() {},
      generatePin: () => '778899'
    }
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;

  const clientRef = {
    role,
    uid,
    sandbox,
    doc,
    elements,
    alerts,
    toasts,
    rtdb,
    receive(msg) {
      subscribers.forEach(fn => fn(msg));
      if (msg?.type && typedSubscribers.has(msg.type)) {
        typedSubscribers.get(msg.type).forEach(fn => fn(msg));
      }
    }
  };
  if (bus) bus.clients.push(clientRef);

  const ctx = vm.createContext(sandbox);
  for (const s of scripts) {
    const code = fs.readFileSync(resolveFile(s), 'utf8');
    vm.runInContext(code, ctx, { filename: s });
  }
  return clientRef;
}

(async () => {
  console.log('=================================================================');
  console.log('   SCOREAR AUDIT FIXES & MULTI-CLIENT REGRESSION TEST SUITE');
  console.log('=================================================================\n');

  // =========================================================================
  // TEST 1: Same-Name Student Identity Isolation (Host + Student Views)
  // =========================================================================
  console.log('--- TEST 1: Strict UID Matching (Zero Same-Name Leakage) ---');
  {
    const c = loadVmContext({
      scripts: ['quiz-evaluator.js', 'quiz-host-events.js', 'quiz-student-view.js']
    });
    const HostEv = c.sandbox.ScoreARHostEvents;
    const StuView = c.sandbox.ScoreARQuizStudentView;
    const now = Date.now();
    const q = c.sandbox.ScoreAREvaluator.normalizeQuestion({
      q: 'ما عاصمة مصر؟',
      opts: ['القاهرة', 'الجيزة', 'الإسكندرية', 'أسوان'],
      ans: 0,
      points: 1000
    });

    const players = [
      { id: 'uid_ahmed_1', name: 'أحمد محمد', avatarId: 'char_01', score: 0, streak: 0, teamId: 'team_a', eliminated: false },
      { id: 'uid_ahmed_2', name: 'أحمد محمد', avatarId: 'char_02', score: 0, streak: 0, teamId: 'team_b', eliminated: false }
    ];
    // Only uid_ahmed_1 answers accurately; uid_ahmed_2 did NOT answer at all.
    const answers = {
      uid_ahmed_1: { playerId: 'uid_ahmed_1', playerName: 'أحمد محمد', optionIndex: 0, ts: now + 800 }
    };

    const res = HostEv.evaluateQuestionResults(q, answers, players, 20, now);
    assert.strictEqual(res.playerResults['uid_ahmed_1'].isCorrect, true, 'Answering Ahmed #1 should be correct');
    assert(res.playerResults['uid_ahmed_1'].pointsEarned > 900, 'Answering Ahmed #1 earns points');
    assert.strictEqual(res.playerResults['uid_ahmed_2'].isCorrect, false, 'Unanswered Ahmed #2 must NOT inherit Ahmed #1 answer');
    assert.strictEqual(res.playerResults['uid_ahmed_2'].pointsEarned, 0, 'Unanswered Ahmed #2 must earn strictly 0 points');
    assert.strictEqual(res.playerResults['uid_ahmed_2'].unanswered, true, 'Unanswered Ahmed #2 flagged unanswered');
    assert.strictEqual(players[1].score, 0, 'Unanswered Ahmed #2 player score stays 0');

    // Now test reverse: uid_ahmed_2 answers wrong (optionIndex 2), uid_ahmed_1 did not answer
    const players2 = [
      { id: 'uid_ahmed_1', name: 'أحمد محمد', score: 500, streak: 2 },
      { id: 'uid_ahmed_2', name: 'أحمد محمد', score: 500, streak: 2 }
    ];
    const resRev = HostEv.evaluateQuestionResults(q, {
      uid_ahmed_2: { playerId: 'uid_ahmed_2', playerName: 'أحمد محمد', optionIndex: 2, ts: now + 1000 }
    }, players2, 20, now);
    assert.strictEqual(resRev.playerResults['uid_ahmed_2'].chosenIndex, 2);
    assert.strictEqual(resRev.playerResults['uid_ahmed_1'].chosenIndex, -1, 'Ahmed #1 must not inherit Ahmed #2 wrong choice');

    // Student View isolation: renderStudentResult, LeaderboardCard, FinalPodium, team & elimination
    const stg2 = c.doc.createElement('div');
    const outcome2 = StuView.renderStudentResult(stg2, {
      correctAnswer: 0,
      correctAnswerText: 'القاهرة',
      options: q.opts,
      fastestStudent: res.fastest,
      fastestTop2: res.fastestTop2,
      playerResults: res.playerResults,
      topLeaderboard: [
        { id: 'uid_ahmed_1', name: 'أحمد محمد', score: players[0].score, teamId: 'team_a', eliminated: true },
        { id: 'uid_ahmed_2', name: 'أحمد محمد', score: 0, teamId: 'team_b', eliminated: false }
      ],
      duelScores: {
        team_a: { id: 'team_a', name: 'فريق الصقور', score: players[0].score },
        team_b: { id: 'team_b', name: 'فريق الأسود', score: 0 },
        leaderTeamId: 'team_a'
      },
      mode: 'DUEL_TEAMS',
      gameMode: 'DUEL_TEAMS'
    }, {
      currentStudent: { uid: 'uid_ahmed_2', name: 'أحمد محمد', avatarId: 'char_02' },
      currentWorldId: 'royal',
      currentQIndex: 0,
      selectedOptionIndex: null,
      currentScore: 0,
      currentStreak: 0,
      lastRank: null
    });
    assert.strictEqual(outcome2.isCorrect, false, 'Student 2 result must show wrong/timeout');
    assert.strictEqual(outcome2.earned, 0, 'Student 2 earned must be 0');
    assert.strictEqual(outcome2.currentRank, 2, 'Student 2 rank must be 2, not 1');
    assert(!stg2.innerHTML.includes('بطل السرعة'), 'Student 2 must NOT get Ahmed #1 fastest badge');
    assert(!stg2.innerHTML.includes('🦅 فريق الصقور <small style="color:#fde047;">(فريقك ✓)</small>'), 'Student 2 must NOT see team_a marked as his team');
    assert(stg2.innerHTML.includes('🦁 فريق الأسود <small style="color:#fde047;">(فريقك ✓)</small>'), 'Student 2 must see team_b marked as his team');

    // SURVIVAL elimination isolation: uid_ahmed_1 is eliminated, uid_ahmed_2 is NOT
    const stgSurv = c.doc.createElement('div');
    StuView.renderStudentReading(stgSurv, {
      q: 'سؤال البقاء',
      qIndex: 1,
      totalQuestions: 3,
      mode: 'SURVIVAL',
      survivalState: { aliveCount: 2, eliminatedIds: ['uid_ahmed_1'] },
      allRanks: [
        { id: 'uid_ahmed_2', name: 'أحمد محمد', eliminated: false },
        { id: 'uid_ahmed_1', name: 'أحمد محمد', eliminated: true }
      ]
    }, 'royal', 10);
    assert(!stgSurv.innerHTML.includes('أنت الآن في مدرج المشجعين'), 'Uneliminated Student 2 must NOT be kicked to spectator view by same-name Student 1');

    // Leaderboard card isolation
    const stgLb2 = c.doc.createElement('div');
    StuView.renderStudentLeaderboardCard(stgLb2, {
      totalPlayers: 2,
      allRanks: [
        { id: 'uid_ahmed_1', name: 'أحمد محمد', rank: 1, score: 1120, delta: 0, streak: 1, gapToAbove: 0 },
        { id: 'uid_ahmed_2', name: 'أحمد محمد', rank: 2, score: 0, delta: 0, streak: 0, gapToAbove: 1120 }
      ],
      top5: [
        { id: 'uid_ahmed_1', name: 'أحمد محمد', score: 1120 },
        { id: 'uid_ahmed_2', name: 'أحمد محمد', score: 0 }
      ]
    }, { uid: 'uid_ahmed_2', name: 'أحمد محمد' }, 0, 'royal');
    assert(stgLb2.innerHTML.includes('المركز 2'), 'Student 2 leaderboard card must display Rank 2');
    assert(stgLb2.innerHTML.includes('تفصلك 1120 نقطة'), 'Student 2 leaderboard card must display his own 1120 gap');

    // Final Podium isolation (SOLO): uid_ahmed_2 at Rank 4 must NOT get Top-3 badge or certificate button
    const stgPod = c.doc.createElement('div');
    StuView.renderStudentFinalPodium(stgPod, {
      mode: 'SOLO',
      leaderboard: [
        { id: 'uid_ahmed_1', name: 'أحمد محمد', score: 2500 },
        { id: 'uid_2', name: 'سارة', score: 2000 },
        { id: 'uid_3', name: 'عمر', score: 1500 },
        { id: 'uid_ahmed_2', name: 'أحمد محمد', score: 400 }
      ]
    }, { uid: 'uid_ahmed_2', name: 'أحمد محمد' }, 400, 'royal');
    assert(!stgPod.innerHTML.includes('data-scorear-certificate'), 'Rank 4 Student 2 must NOT get Rank 1 certificate button');
    console.log('✅ PASSED TEST 1: Same-name students are 100% isolated by UID across evaluation and all student screens.\n');
  }

  // =========================================================================
  // TEST 2: 0-Point Practice Questions Preserved Across All Pipelines
  // =========================================================================
  console.log('--- TEST 2: 0-Point Practice Questions Preservation ---');
  {
    const c = loadVmContext({
      scripts: [
        'quiz-evaluator.js', 'quiz-host-events.js', 'quiz-importer.js',
        'quiz-builder-actions.js', 'quiz-builder.js', 'quiz-bank-data.js', 'quiz-ai-pipeline.js'
      ]
    });
    const HostEv = c.sandbox.ScoreARHostEvents;
    const Importer = c.sandbox.ScoreARQuizImporter;
    const Builder = c.sandbox.ScoreARQuizBuilder;
    const BankData = c.sandbox.ScoreARQuizBankData;
    const AiPipe = c.sandbox.ScoreARQuizAIPipeline;
    const now = Date.now();

    // 2A: Host evaluation with points: 0 (even with Rank #1 speed & streak: 3)
    const zeroPlayers = [{ id: 'p_zero', name: 'متدرب', score: 500, streak: 3 }];
    const zeroQ = c.sandbox.ScoreAREvaluator.normalizeQuestion({
      q: 'سؤال تدريبي بدون درجات', opts: ['نعم', 'لا'], ans: 0, points: 0
    });
    assert.strictEqual(zeroQ.points, 0, 'Evaluator normalizeQuestion preserves points === 0');
    const zeroEval = HostEv.evaluateQuestionResults(zeroQ, {
      p_zero: { playerId: 'p_zero', optionIndex: 0, ts: now + 500 }
    }, zeroPlayers, 20, now);
    assert.strictEqual(zeroEval.playerResults['p_zero'].isCorrect, true);
    assert.strictEqual(zeroEval.playerResults['p_zero'].pointsEarned, 0, '0-point question must award strictly 0 points (no speed/streak leakage)');
    assert.strictEqual(zeroPlayers[0].score, 500, 'Score stays 500 after 0-point question');
    assert.strictEqual(zeroPlayers[0].streak, 4, 'Streak still increments on correct 0-point answer');

    // 2B: 0-point question WITH wager100 active -> +100 from wager only, 0 from question
    const wagerZeroP = [{ id: 'p_wz', name: 'مراهن', score: 200, streak: 0, wager100: true }];
    const wagerZeroEval = HostEv.evaluateQuestionResults(zeroQ, {
      p_wz: { playerId: 'p_wz', optionIndex: 0, ts: now + 500 }
    }, wagerZeroP, 20, now);
    assert.strictEqual(wagerZeroEval.playerResults['p_wz'].pointsEarned, 100, '0-point question + wager100 win yields +100');

    // 2C: Importer processRawRows -> updateRowText -> commitImportedQuestions & handlePreloadedQuestions
    Importer.processRawRows([
      ['السؤال', 'الإجابة 1', 'الإجابة 2', 'الإجابة 3', 'الإجابة 4', 'الزمن', 'الصحيحة', 'النقاط', 'الشرح'],
      ['تدريب 1', 'أ', 'ب', 'ج', 'د', 20, 1, 0, 'بدون درجات'],
      ['سؤال عادي', 'أ', 'ب', 'ج', 'د', 20, 2, 1000, '']
    ]);
    const rows = Importer.getImportedRows();
    assert.strictEqual(rows[0].points, 0, 'Importer processRawRows preserves points: 0');
    rows[1].points = 1000;
    Importer.updateRowText(1, 'points', '0');
    assert.strictEqual(rows[1].points, 0, 'Importer updateRowText coerces string "0" to numeric 0');

    let savedImported = null;
    Importer.openImporter({ mode: 'builder', onImport: (qs) => { savedImported = qs; } });
    Importer.processRawRows([
      ['السؤال', 'الإجابة 1', 'الإجابة 2', 'الزمن', 'الصحيحة', 'النقاط'],
      ['تدريب محفوظ', 'صح', 'خطأ', 15, 1, 0]
    ]);
    await Importer.commitImportedQuestions();
    assert.strictEqual(savedImported[0].points, 0, 'Importer commitImportedQuestions preserves points: 0');

    Importer.handlePreloadedQuestions([{ q: 'AI تدريب', opts: ['صح', 'خطأ'], ans: 1, points: 0 }]);
    assert.strictEqual(Importer.getImportedRows()[0].points, 0, 'handlePreloadedQuestions preserves points: 0');

    // 2D: Builder addImportedQuestion & applyPointsToAll
    Builder.openBuilder({ id: 'qz_0', title: 'اختبار', questions: [] });
    Builder.addImportedQuestion({ q: 'س0', opts: ['أ', 'ب'], ans: 0, points: 0 });
    assert.strictEqual(Builder.getQuiz().questions[0].points, 0, 'Builder addImportedQuestion preserves points: 0');
    Builder.addImportedQuestion({ q: 'س1', opts: ['أ', 'ب'], ans: 0, points: 2000 });
    c.sandbox.ScoreARQuizBuilderActions.applyPointsToAll(Builder.getQuiz(), 0);
    assert.strictEqual(Builder.getQuiz().questions[1].points, 0, 'applyPointsToAll sets points to 0');

    // 2E: BankData.saveQuestion & AI Pipeline
    const savedBankQ = await BankData.saveQuestion({ q: 'بنك 0', opts: ['أ', 'ب'], ans: 0, points: 0 });
    assert.strictEqual(savedBankQ.points, 0, 'BankData.saveQuestion preserves points: 0');
    const aiRes = AiPipe.verifyQuestionQuality({
      q: 'من هو قائل هذا النص حسب السياق المذكور؟',
      opts: ['سعيد', 'خالد', 'عمر', 'زياد', 'خيار خامس'],
      ans: 0,
      points: 0,
      sourceQuote: 'قال سعيد إن العلم نور'
    }, { isScanned: true, rawText: 'قال سعيد إن العلم نور' });
    assert.strictEqual(aiRes.canonicalQuestion.points, 0, 'AI pipeline preserves points: 0');
    assert.strictEqual(aiRes.canonicalQuestion.opts.length, 4, 'AI pipeline caps canonical options at 4');
    console.log('✅ PASSED TEST 2: 0-point practice questions preserved across every flow.\n');
  }

  // =========================================================================
  // TEST 3: Excel Importer Key Mapping & 4-Option / Single-Choice Unification
  // =========================================================================
  console.log('--- TEST 3: Excel Importer Sparse Columns, >4 Options & Multi-Select Guards ---');
  {
    const c = loadVmContext({
      scripts: ['quiz-evaluator.js', 'quiz-host-events.js', 'quiz-importer.js', 'quiz-builder.js']
    });
    const Importer = c.sandbox.ScoreARQuizImporter;
    const Builder = c.sandbox.ScoreARQuizBuilder;
    const HostEv = c.sandbox.ScoreARHostEvents;

    // 3A: Sparse columns [1, '', 3, 4] with key 3 -> must point to 'ثالث', NOT 'رابع'!
    Importer.processRawRows([
      ['السؤال', 'إجابة 1', 'إجابة 2', 'إجابة 3', 'إجابة 4', 'الزمن', 'الصحيحة', 'النقاط'],
      ['اختر الثالثة (موضعها 3)', 'أول', '', 'ثالث', 'رابع', 20, 3, 1000],
      ['مفتاح يشير لخانة فارغة', 'أول', '', 'ثالث', 'رابع', 20, 2, 1000],
      ['مفتاح حرف ج مع خانة 2 فارغة', 'أول', '', 'ثالث', 'رابع', 20, 'ج', 1000],
      ['أكثر من 4 خيارات غير مقبول', '1', '2', '3', '4', '5', '6', 20, 1, 1000]
    ]);
    // Wait: header above had no o5/o6 headers; let's test explicit 6-option headers!
    Importer.processRawRows([
      ['السؤال', 'إجابة 1', 'إجابة 2', 'إجابة 3', 'إجابة 4', 'إجابة 5', 'إجابة 6', 'الزمن', 'الصحيحة', 'النقاط'],
      ['سؤال الفجوة رقمي', 'أول', '', 'ثالث', 'رابع', '', '', 20, 3, 1000],
      ['مفتاح يشير لفراغ', 'أول', '', 'ثالث', 'رابع', '', '', 20, 2, 1000],
      ['مفتاح حرفي ج', 'أول', '', 'ثالث', 'رابع', '', '', 20, 'ج', 1000],
      ['خمسة خيارات مرفوضة', '1', '2', '3', '4', '5', '', 20, 1, 1000],
      ['تعدد إجابات مرفوض', '1', '2', '3', '4', '', '', 20, '1,2', 1000]
    ]);
    const rows = Importer.getImportedRows();
    assert.strictEqual(rows[0].isValid, true, 'Sparse row with valid key 3 is valid');
    assert.deepStrictEqual([...rows[0].opts], ['أول', 'ثالث', 'رابع']);
    assert.strictEqual(rows[0].opts[rows[0].ans], 'ثالث', 'Numeric key 3 mapped to "ثالث", not shifted to "رابع"');

    assert.strictEqual(rows[1].isValid, false, 'Numeric key pointing to blank column 2 must fail validation');
    assert.strictEqual(rows[2].isValid, true, 'Letter key ج mapped accurately even with blank column 2');
    assert.strictEqual(rows[2].opts[rows[2].ans], 'ثالث');

    assert.strictEqual(rows[3].isValid, false, 'More than 4 non-empty options must fail importer validation');
    assert(rows[3].errors.some(e => e.includes('4 خيارات')), 'Error explicitly states 4-option limit');

    assert.strictEqual(rows[4].isValid, false, 'Multi-answer key "1,2" must fail live importer validation');

    // 3B: Editing preview row to delete an option before ans still remaps ans accurately!
    let previewOut = null;
    Importer.openImporter({ mode: 'builder', onImport: (qs) => { previewOut = qs; } });
    Importer.processRawRows([
      ['السؤال', 'إجابة 1', 'إجابة 2', 'إجابة 3', 'إجابة 4', 'الزمن', 'الصحيحة'],
      ['تحرير قبل الاعتماد', 'محذوف', 'ثاني', 'الصحيح', 'رابع', 20, 3]
    ]);
    Importer.updateRowOption(0, 0, ''); // clears 'محذوف' before index 2 ('الصحيح')
    assert.strictEqual(Importer.getImportedRows()[0].isValid, true);
    await Importer.commitImportedQuestions();
    assert.strictEqual(previewOut[0].opts[previewOut[0].ans], 'الصحيح', 'commitImportedQuestions remaps ans after preview option deletion');

    // 3C: Builder 4-option cap + Live validation guard
    Builder.openBuilder({
      id: 'qz_cap',
      title: 'مسابقة',
      questions: [{ id: 'q1', q: 'سؤال', opts: ['1', '2', '3', '4'], ans: 0, points: 1000 }]
    });
    Builder.addOption(); // Attempt adding 5th option
    assert.strictEqual(Builder.getQuiz().questions[0].opts.length, 4, 'Builder addOption strictly caps options at 4');
    Builder.getQuiz().questions[0].opts.push('5');
    assert.strictEqual(Builder.validateQuiz().valid, false, 'Builder validateQuiz rejects 5 options');

    assert.strictEqual(HostEv.validateLiveQuestion({ q: 'س', opts: ['1', '2', '3', '4', '5'], ans: 0 }).valid, false, 'Live validator rejects 5 options');
    assert.strictEqual(HostEv.validateLiveQuestion({ q: 'س', opts: ['1', '2', '3'], correct: [0, 2] }).valid, false, 'Live validator rejects multi-answer question');
    assert.strictEqual(HostEv.validateLiveQuestion({ q: 'س', opts: ['1', '2', '3'], ans: 1 }).valid, true, 'Live validator accepts clean 3-option single-answer question');

    console.log('✅ PASSED TEST 3: Sparse columns, blank-key rejection, 4-option limit, and single-choice guards verified.\n');
  }

  // =========================================================================
  // TEST 4: Actual ASK_QUESTION (wager100) Deduction Reporting
  // =========================================================================
  console.log('--- TEST 4: Exact Actual Wager Loss Deduction (-35 when score=35) ---');
  {
    const c = loadVmContext({
      scripts: ['quiz-evaluator.js', 'quiz-host-events.js', 'quiz-student-view.js', 'CardArenaEngine.js', 'quiz-card-arena.js']
    });
    const HostEv = c.sandbox.ScoreARHostEvents;
    const StuView = c.sandbox.ScoreARQuizStudentView;
    const now = Date.now();
    const q = c.sandbox.ScoreAREvaluator.normalizeQuestion({ q: 'سؤال', opts: ['صح', 'خطأ'], ans: 0, points: 1000 });

    const players = [
      { id: 'stu_35', name: 'صاحب 35', score: 35, streak: 1, wager100: true },
      { id: 'stu_0', name: 'صاحب 0', score: 0, streak: 0, wager100: true },
      { id: 'stu_250', name: 'صاحب 250', score: 250, streak: 0, wager100: true }
    ];
    const evalRes = HostEv.evaluateQuestionResults(q, {
      stu_35: { playerId: 'stu_35', optionIndex: 1, ts: now + 900 },
      stu_0: { playerId: 'stu_0', optionIndex: 1, ts: now + 900 },
      stu_250: { playerId: 'stu_250', optionIndex: 1, ts: now + 900 }
    }, players, 20, now);

    assert.strictEqual(players[0].score, 0, '35 - wager loss floors at 0');
    assert.strictEqual(evalRes.playerResults['stu_35'].pointsEarned, -35, 'Actual pointsEarned must be -35, NOT -100');
    assert.strictEqual(players[1].score, 0);
    assert.strictEqual(evalRes.playerResults['stu_0'].pointsEarned, 0, 'Actual pointsEarned from 0 must be 0');
    assert.strictEqual(players[2].score, 150);
    assert.strictEqual(evalRes.playerResults['stu_250'].pointsEarned, -100, 'Actual pointsEarned from 250 must be -100');

    const stg = c.doc.createElement('div');
    StuView.renderStudentResult(stg, {
      correctAnswer: 0,
      options: q.opts,
      playerResults: evalRes.playerResults,
      topLeaderboard: players
    }, {
      currentStudent: { uid: 'stu_35', name: 'صاحب 35', avatarId: 'char_01' },
      currentWorldId: 'royal',
      currentQIndex: 0,
      selectedOptionIndex: 1,
      currentScore: 35,
      currentStreak: 0,
      lastRank: null
    });
    assert(stg.innerHTML.includes('خسرت رهان المائة (-35 نقطة)'), 'Student result badge shows actual -35 deduction');
    assert(!stg.innerHTML.includes('(-100 نقطة)'), 'Student result must NOT show misleading -100');
    console.log('✅ PASSED TEST 4: Actual wager loss (-35 / 0 / -100) matches actual score change everywhere.\n');
  }

  // =========================================================================
  // TEST 5: Synchronized Live Session Across All 4 Modes (SOLO, DUEL, SURVIVAL, CARD_ARENA)
  // =========================================================================
  console.log('--- TEST 5: Full Synchronized Multi-Client Host + Student Session (All 4 Modes) ---');
  {
    const hostScripts = [
      'CardArenaEngine.js', 'quiz-evaluator.js', 'quiz-game-modes.js', 'quiz-arena-modes.js',
      'quiz-survival-engine.js', 'quiz-card-cinema.js', 'quiz-card-arena.js',
      'quiz-host-leaderboard.js', 'quiz-podium-effects.js', 'quiz-host-events.js', 'quiz-host-view.js', 'quiz-host.js', 'quiz-bots.js'
    ];
    const stuScripts = [
      'CardArenaEngine.js', 'quiz-evaluator.js', 'quiz-game-modes.js', 'quiz-arena-modes.js',
      'quiz-survival-engine.js', 'quiz-card-cinema.js', 'quiz-card-arena.js',
      'quiz-student-view.js', 'quiz-student.js'
    ];

    async function setupSyncSession(mode, questions, customSetup) {
      const bus = { clients: [] };
      const rtdb = createRtdbEngine();
      const pin = '654321';
      const host = loadVmContext({ scripts: hostScripts, dbEngine: rtdb, role: 'host', uid: 'teacher_1', bus });
      host.sandbox.ScoreARRealtime.generatedPin = pin;
      const s1 = loadVmContext({ scripts: stuScripts, dbEngine: rtdb, role: 'student', uid: 'stu_1', bus });
      const s2 = loadVmContext({ scripts: stuScripts, dbEngine: rtdb, role: 'student', uid: 'stu_2', bus });

      host.sandbox.contestQuestions = questions;
      host.sandbox.ScoreARGameModes.setMode(mode);
      if (customSetup) customSetup(host, s1, s2);
      await host.sandbox.ScoreARQuizHost.startHostLobby('royal', pin, true, true);
      await new Promise(r => setTimeout(r, 40));
      return { host, s1, s2, rtdb, pin };
    }

    // 5A: SOLO with SAME-NAME students + Q1 (1000) + Q2 (0 pts practice)
    {
      const qs = [
        { q: 'السؤال الأول', opts: ['صح', 'خطأ', 'ج', 'د'], ans: 0, points: 1000, timeLimit: 20 },
        { q: 'سؤال تدريبي بدون نقاط', opts: ['أ', 'ب', 'ج', 'د'], ans: 1, points: 0, timeLimit: 20 }
      ];
      const { host, s1, s2 } = await setupSyncSession('SOLO', qs);
      await s1.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_1', name: 'عمر علي', avatarId: 'char_01' });
      await s2.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_2', name: 'عمر علي', avatarId: 'char_02' });

      const room = host.sandbox.ScoreARQuizHost.getCurrentRoom();
      assert.strictEqual(room.players.length, 2, 'Two students with same name kept as 2 distinct players');

      // Launch Q1 and jump straight to answering phase
      host.sandbox.ScoreARQuizHost.launchQuestion(0, true);
      await host.sandbox.ScoreARQuizHost.revealQuestionOptionsNow();
      await s1.sandbox.ScoreARQuizStudent.submitAnswer(0); // only stu_1 answers correctly; stu_2 does not answer!
      host.sandbox.ScoreARQuizHost.finishCurrentQuestion();

      const hostP1 = room.players.find(p => p.id === 'stu_1');
      const hostP2 = room.players.find(p => p.id === 'stu_2');
      assert(hostP1.score > 900, 'SOLO: answering Omar #1 scored > 900');
      assert.strictEqual(hostP2.score, 0, 'SOLO: non-answering same-name Omar #2 stayed at 0');
      assert.strictEqual(s1.sandbox.ScoreARQuizStudent.getScore(), hostP1.score, 'Student 1 phone score matches Host exactly');
      assert.strictEqual(s2.sandbox.ScoreARQuizStudent.getScore(), 0, 'Student 2 phone score stays 0 matching Host');

      // Advance to Q2 (0-point practice question)
      host.sandbox.ScoreARQuizHost.launchQuestion(1, true);
      await host.sandbox.ScoreARQuizHost.revealQuestionOptionsNow();
      const s1ScoreBeforeQ2 = hostP1.score;
      await s1.sandbox.ScoreARQuizStudent.submitAnswer(1);
      await s2.sandbox.ScoreARQuizStudent.submitAnswer(1);
      host.sandbox.ScoreARQuizHost.finishCurrentQuestion();

      assert.strictEqual(hostP1.score, s1ScoreBeforeQ2, 'SOLO Q2 (0 pts): Student 1 score unchanged');
      assert.strictEqual(hostP2.score, 0, 'SOLO Q2 (0 pts): Student 2 score still 0');

      host.sandbox.ScoreARQuizHost.renderHostPodium();
      assert.strictEqual(s1.sandbox.ScoreARQuizStudent.getScore(), hostP1.score);
      assert.strictEqual(s2.sandbox.ScoreARQuizStudent.getScore(), hostP2.score);
      host.sandbox.ScoreARQuizHost.closeHostSession();
      console.log('✓ 5A Verified: Synchronized SOLO session with same-name students & 0-pt practice Q matches Host <-> Students!');
    }

    // 5B: DUEL_TEAMS (preserve exact direct-sum scoring + custom names)
    {
      const qs = [{ q: 'سؤال التحدي', opts: ['نعم', 'لا'], ans: 0, points: 1000, timeLimit: 20 }];
      const { host, s1, s2 } = await setupSyncSession('DUEL_TEAMS', qs, (h) => {
        h.sandbox.ScoreARArenaModes.setCustomTeamNames('أبطال النحو', 'فرسان البلاغة');
      });
      await s1.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_1', name: 'بطل 1' });
      await s2.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_2', name: 'بطلة 2' });
      s1.sandbox.ScoreARQuizStudentView.switchMobileDuelTeam('team_a');
      s2.sandbox.ScoreARQuizStudentView.switchMobileDuelTeam('team_b');

      const room = host.sandbox.ScoreARQuizHost.getCurrentRoom();
      assert.strictEqual(room.players.find(p => p.id === 'stu_1').teamId, 'team_a');
      assert.strictEqual(room.players.find(p => p.id === 'stu_2').teamId, 'team_b');

      host.sandbox.ScoreARQuizHost.launchQuestion(0, true);
      await host.sandbox.ScoreARQuizHost.revealQuestionOptionsNow();
      await s1.sandbox.ScoreARQuizStudent.submitAnswer(0); // correct on team_a
      await s2.sandbox.ScoreARQuizStudent.submitAnswer(1); // wrong on team_b
      host.sandbox.ScoreARQuizHost.finishCurrentQuestion();

      const duelSb = host.sandbox.ScoreARArenaModes.computeDuelScoreboard(room.players);
      assert.strictEqual(duelSb.leaderTeamId, 'team_a', 'DUEL_TEAMS leader is team_a');
      assert.strictEqual(duelSb.team_a.score, room.players.find(p => p.id === 'stu_1').score);
      assert.strictEqual(duelSb.team_b.score, 0);
      host.sandbox.ScoreARQuizHost.renderHostPodium();
      const s1Stage = s1.doc.getElementById('scorearStudentStage');
      assert(s1Stage.innerHTML.includes('أبطال النحو') && s1Stage.innerHTML.includes('بطل التحدي'), 'Student 1 sees custom winning team name on Podium');
      host.sandbox.ScoreARQuizHost.closeHostSession();
      console.log('✓ 5B Verified: Synchronized DUEL_TEAMS session matches direct-sum scoreboard & custom names across Host <-> Students!');
    }

    // 5C: SURVIVAL (keep existing elimination rules intact + spectator sync)
    {
      const qs = [
        { q: 'سؤال البقاء 1', opts: ['صح', 'خطأ'], ans: 0, points: 1000, timeLimit: 20 },
        { q: 'سؤال البقاء 2', opts: ['صح', 'خطأ'], ans: 0, points: 1000, timeLimit: 20 }
      ];
      const { host, s1, s2 } = await setupSyncSession('SURVIVAL', qs);
      await s1.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_1', name: 'الناجي' });
      await s2.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_2', name: 'الخارج' });
      host.sandbox.ScoreARQuizHost.addDemoPlayer('بوت سريع', 'char_03');

      const room = host.sandbox.ScoreARQuizHost.getCurrentRoom();
      const bot = room.players.find(p => p.isBot || p.isDemo);
      host.sandbox.ScoreARQuizHost.launchQuestion(0, true);
      await host.sandbox.ScoreARQuizHost.revealQuestionOptionsNow();
      await s1.sandbox.ScoreARQuizStudent.submitAnswer(0); // stu_1 answers correctly
      host.sandbox.ScoreARQuizHost.submitBotAnswer(bot.id, 0, 1200); // bot answers correctly
      // stu_2 leaves question unanswered -> SURVIVAL eliminates unanswered player!
      host.sandbox.ScoreARQuizHost.finishCurrentQuestion();

      assert.strictEqual(room.players.find(p => p.id === 'stu_1').eliminated, false, 'Survivor stu_1 remains alive');
      assert.strictEqual(room.players.find(p => p.id === 'stu_2').eliminated, true, 'Existing SURVIVAL rule eliminates unanswered stu_2');
      assert(s2.doc.getElementById('scorearStudentStage').innerHTML.includes('مدرج المشجعين'), 'Eliminated student mobile displays spectator banner');
      assert(!s1.doc.getElementById('scorearStudentStage').innerHTML.includes('مدرج المشجعين'), 'Surviving student does NOT get spectator banner');
      host.sandbox.ScoreARQuizHost.closeHostSession();
      console.log('✓ 5C Verified: Synchronized SURVIVAL session preserves elimination rules & spectator sync!');
    }

    // 5D: CARD_ARENA (wager100 with 35 pts + Host/Student score sync)
    {
      const qs = [{ q: 'سؤال الكروت', opts: ['أ', 'ب'], ans: 0, points: 1000, timeLimit: 20 }];
      const { host, s1, s2 } = await setupSyncSession('CARD_ARENA', qs);
      await s1.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_1', name: 'مراهن 1' });
      await s2.sandbox.ScoreARQuizStudent.startStudentSession('654321', { uid: 'stu_2', name: 'فائز 2' });

      const room = host.sandbox.ScoreARQuizHost.getCurrentRoom();
      room.players.find(p => p.id === 'stu_1').score = 35;
      host.sandbox.ScoreARCardArena.syncHostRoster(room.players);

      host.sandbox.ScoreARQuizHost.launchQuestion(0, true);
      await host.sandbox.ScoreARQuizHost.revealQuestionOptionsNow();

      const s1Mgr = s1.sandbox.ScoreARCardArena.getManager();
      s1Mgr.players['stu_1'].hand = [];
      const wagerCard = s1Mgr.grantRandomCard('stu_1', 'ASK_QUESTION');
      s1.sandbox.ScoreARCardArena.activateSelf(wagerCard.instanceId);

      await s1.sandbox.ScoreARQuizStudent.submitAnswer(1); // wrong with wager100 from 35 pts
      await s2.sandbox.ScoreARQuizStudent.submitAnswer(0); // correct
      host.sandbox.ScoreARQuizHost.finishCurrentQuestion();

      const p1 = room.players.find(p => p.id === 'stu_1');
      const p2 = room.players.find(p => p.id === 'stu_2');
      assert.strictEqual(p1.score, 0, 'CARD_ARENA: stu_1 wager loss drops 35 -> 0');
      assert.strictEqual(s1.sandbox.ScoreARQuizStudent.getScore(), 0, 'Student 1 phone synced to 0');
      assert(s1.doc.getElementById('scorearStudentStage').innerHTML.includes('-35 نقطة'), 'Student 1 sees actual -35 deduction');
      assert(p2.score > 900, 'Student 2 scored > 900');
      assert.strictEqual(s2.sandbox.ScoreARQuizStudent.getScore(), p2.score, 'Student 2 phone score synced with Host');
      host.sandbox.ScoreARQuizHost.closeHostSession();
      console.log('✓ 5D Verified: Synchronized CARD_ARENA session syncs wager100 (-35) & scores across Host <-> Students!\n');
    }
  }

  console.log('🎉 ALL AUDIT FIXES & SYNCHRONIZED MULTI-CLIENT TESTS PASSED 100%!');
  process.exit(0);
})();
