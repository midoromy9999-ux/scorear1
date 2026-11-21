'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function createMockElement(tagName = 'div') {
  return {
    tagName: tagName.toUpperCase(),
    id: '',
    innerHTML: '',
    textContent: '',
    style: {},
    open: false,
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      toggle(c, f) { if (f === undefined ? !this._set.has(c) : f) this._set.add(c); else this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    appendChild() {},
    remove() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    showModal() { this.open = true; },
    close() { this.open = false; }
  };
}

function createBuilderEnv(extraScripts = []) {
  const byId = new Map();
  const store = new Map();
  const alerts = [];
  const toasts = [];
  const dbWrites = [];
  let launched = null;

  const doc = {
    body: createMockElement('body'),
    getElementById(id) { return byId.get(id) || null; },
    createElement(tag) {
      const el = createMockElement(tag);
      Object.defineProperty(el, 'id', {
        get() { return el._id || ''; },
        set(v) { el._id = v; if (v) byId.set(v, el); }
      });
      return el;
    },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };

  byId.set('modal', createMockElement('dialog'));
  byId.set('modalTitle', createMockElement('h2'));
  byId.set('modalBody', createMockElement('div'));

  const ctx = {
    console, Date, Math, Set, Map, JSON, Array, Number, String, Boolean, RegExp, Object,
    setTimeout, clearTimeout, setInterval, clearInterval,
    document: doc,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    alert: (msg) => alerts.push(String(msg)),
    toast: (msg) => toasts.push(String(msg)),
    firebase: {
      auth: () => ({ currentUser: { uid: 'tch_1' } }),
      database: () => ({
        ref: (p) => ({ set: async (v) => { dbWrites.push({ path: p, val: v }); } })
      })
    },
    ScoreARQuizHost: {
      startHostLobby: (worldId) => { launched = { worldId, questions: ctx.contestQuestions }; }
    },
    ScoreARWorldFlow: {
      openWorldPicker: ({ onConfirm }) => { if (onConfirm) onConfirm('royal'); }
    }
  };
  ctx.window = ctx;
  ctx.global = ctx;
  ctx.globalThis = ctx;

  const scripts = [
    'js/engines/quiz-evaluator.js',
    'js/quiz/quiz-host-events.js',
    'js/quiz/quiz-builder.js',
    ...extraScripts
  ];
  for (const s of scripts) {
    vm.runInNewContext(read(s), ctx, { filename: s });
  }

  return { ctx, byId, store, alerts, toasts, dbWrites, getLaunched: () => launched };
}

test('addImportedQuestion compacts blank gaps while keeping the exact correct answer text', () => {
  const { ctx } = createBuilderEnv();
  const Builder = ctx.ScoreARQuizBuilder;
  Builder.openBuilder({ id: 'q_clean', title: 'مسابقة النحو', questions: [] });

  const res = Builder.addImportedQuestion({
    q: 'ما عاصمة مصر؟',
    opts: ['الإسكندرية', '', 'القاهرة', 'أسوان'],
    ans: 2,
    points: 500
  });

  assert.equal(res.valid, true);
  assert.deepEqual(Array.from(res.question.opts), ['الإسكندرية', 'القاهرة', 'أسوان']);
  assert.equal(res.question.ans, 1);
  assert.equal(res.question.opts[res.question.ans], 'القاهرة');
  assert.equal(res.question.needsReview, false);
});

test('addImportedQuestion flags missing key with ans=null and blocks save and launch', async () => {
  const { ctx, dbWrites, toasts, getLaunched } = createBuilderEnv();
  const Builder = ctx.ScoreARQuizBuilder;
  Builder.openBuilder({ id: 'q_missing', title: 'اختبار مفتاح مفقود', questions: [] });

  const res = Builder.addImportedQuestion({
    q: 'سؤال بدون مفتاح إجابة',
    opts: ['خيار أ', 'خيار ب', 'خيار ج']
  });

  assert.equal(res.valid, false);
  assert.equal(res.question.ans, null);
  assert.equal(res.question.needsReview, true);
  assert.ok(res.errors.some(e => e.includes('مفتاح الإجابة')));
  assert.ok(toasts.some(t => t.includes('تنبيه في السؤال (1)')));

  assert.equal(Builder.validateQuiz().valid, false);
  await Builder.publishAndLaunchContest();
  assert.equal(dbWrites.length, 0);
  assert.equal(getLaunched(), null);

  // Teacher selects correct answer and fixes question -> save & launch unlock cleanly
  Builder.setCorrectAnswer(1);
  assert.equal(Builder.getQuiz().questions[0].needsReview, false);
  assert.equal(Builder.validateQuiz().valid, true);
  await Builder.publishAndLaunchContest();
  assert.equal(dbWrites.length, 1);
  assert.ok(getLaunched());
});

test('addImportedQuestion rejects 5th-option key without silent slicing to 4 or defaulting to first option', async () => {
  const { ctx, dbWrites, getLaunched } = createBuilderEnv();
  const Builder = ctx.ScoreARQuizBuilder;
  Builder.openBuilder({ id: 'q_fifth', title: 'اختبار 5 خيارات', questions: [] });

  const res = Builder.addImportedQuestion({
    q: 'أي مما يلي صحيح؟',
    opts: ['أول', 'ثاني', 'ثالث', 'رابع', 'خامس صحيح'],
    ans: 4
  });

  assert.equal(res.valid, false);
  assert.equal(res.question.ans, null);
  assert.equal(res.question.needsReview, true);
  assert.equal(res.question.opts.length, 5);
  assert.equal(res.question.opts[4], 'خامس صحيح');
  assert.ok(res.errors.some(e => e.includes('4 اختيارات')));

  await Builder.publishAndLaunchContest();
  assert.equal(dbWrites.length, 0);
  assert.equal(getLaunched(), null);
});

test('addImportedQuestion rejects multi-answer question and preserves 0-point practice question', () => {
  const { ctx } = createBuilderEnv();
  const Builder = ctx.ScoreARQuizBuilder;
  Builder.openBuilder({ id: 'q_multi_zero', title: 'متنوعة', questions: [] });

  const multiRes = Builder.addImportedQuestion({
    q: 'اختر حرفين',
    opts: ['أ', 'ب', 'ج', 'د'],
    correct: [0, 2]
  });
  assert.equal(multiRes.valid, false);
  assert.equal(multiRes.question.ans, null);
  assert.equal(multiRes.question.needsReview, true);
  assert.ok(multiRes.errors.some(e => e.includes('إجابة صحيحة واحدة')));

  const zeroRes = Builder.addImportedQuestion({
    q: 'سؤال تدريبي بلا نقاط',
    opts: ['نعم', 'لا'],
    ans: 1,
    points: 0
  });
  assert.equal(zeroRes.valid, true);
  assert.equal(zeroRes.question.points, 0);
  assert.equal(zeroRes.question.ans, 1);
  assert.equal(zeroRes.question.needsReview, false);
});

test('importQuestions reports counts and exact flagged numbers and never auto-saves broken quiz', () => {
  const { ctx, store, dbWrites, toasts } = createBuilderEnv();
  const Builder = ctx.ScoreARQuizBuilder;

  const summary = Builder.importQuestions([
    { q: 'س1 سليم بمسافة', opts: ['أ', '', 'ب'], ans: 2, points: 0 },
    { q: 'س2 بدون مفتاح', opts: ['س', 'ص'] },
    { q: 'س3 متعدد', opts: ['1', '2', '3'], correct: [0, 1] },
    { q: 'س4 سليم', opts: ['صح', 'خطأ'], ans: 0, points: 1000 }
  ], { title: 'استيراد دفعة' });

  assert.equal(summary.total, 4);
  assert.equal(summary.validCount, 2);
  assert.equal(summary.needsReviewCount, 2);
  assert.deepEqual(Array.from(summary.reviewItems.map(x => x.num)), [2, 3]);
  assert.equal(store.size, 0);
  assert.equal(dbWrites.length, 0);
  assert.ok(toasts.some(t => t.includes('أُضيف 4 سؤالاً') && t.includes('2 يحتاج مراجعة') && t.includes('2') && t.includes('3')));
});

test('removeOption clears ans to null instead of 0 when the correct option is deleted', () => {
  const { ctx } = createBuilderEnv();
  const Builder = ctx.ScoreARQuizBuilder;
  Builder.openBuilder({
    id: 'q_del',
    title: 'حذف خيار',
    questions: [{ id: 'q1', q: 'سؤال', opts: ['أ', 'ب', 'ج'], ans: 1, points: 1000 }]
  });
  Builder.removeOption(1);
  const q = Builder.getQuiz().questions[0];
  assert.equal(q.ans, null);
  assert.equal(q.needsReview, true);
  assert.equal(Builder.validateQuiz().valid, false);
});

test('bank addToActiveQuiz, batchAddToQuiz, and launchQuiz block missing/5th/multi-select keys', () => {
  const { ctx, alerts, toasts, getLaunched } = createBuilderEnv(['js/quiz/quiz-bank.js']);
  const Bank = ctx.ScoreARQuizBank;
  const Builder = ctx.ScoreARQuizBuilder;
  Builder.openBuilder({ id: 'q_active', title: 'مسابقة البنك', questions: [] });

  const bankQuestions = [
    { id: 'bq_ok', q: 'سليم بفراغ', opts: ['أ', '', 'ب'], ans: 2, points: 0 },
    { id: 'bq_miss', q: 'ناقص مفتاح', opts: ['1', '2'] },
    { id: 'bq_five', q: 'خمس اختيارات', opts: ['1', '2', '3', '4', '5'], ans: 4 },
    { id: 'bq_multi', q: 'متعدد', opts: ['أ', 'ب', 'ج'], correct: [0, 2] }
  ];
  const savedQuizzes = [
    { id: 'qz_bad_miss', title: 'مفقود المفتاح', questions: [bankQuestions[1]] },
    { id: 'qz_bad_blank', title: 'مفتاح على فراغ', questions: [{ q: 'سؤال', opts: ['أ', '', 'ب'], ans: 1 }] },
    { id: 'qz_bad_five', title: 'خمس خيارات', questions: [bankQuestions[2]] },
    { id: 'qz_good_gap', title: 'سليم مع فراغ و0 نقطة', questions: [bankQuestions[0]] }
  ];
  ctx.ScoreARQuizBankData = {
    getQuestions: () => bankQuestions,
    getQuizzes: () => savedQuizzes,
    getFolders: () => [],
    getUniqueSubjects: () => [],
    getUniqueGrades: () => [],
    getFilteredQuizzes: () => ({ items: savedQuizzes, totalItems: savedQuizzes.length, totalPages: 1, currentPage: 1 }),
    getFilteredQuestions: () => ({ items: bankQuestions, totalItems: bankQuestions.length, totalPages: 1, currentPage: 1 })
  };

  Bank.addToActiveQuiz('bq_miss');
  assert.equal(Builder.getQuiz().questions[0].ans, null);
  assert.equal(Builder.getQuiz().questions[0].needsReview, true);
  assert.ok(toasts.some(t => t.includes('للمراجعة قبل الحفظ')));

  // Batch add: select bq_ok (valid with blank gap + 0 pts) & bq_five (5 options)
  Bank.toggleSelectItem('bq_ok');
  Bank.toggleSelectItem('bq_five');
  Bank.batchAddToQuiz();
  assert.ok(toasts.some(t => t.includes('أُضيف 2 سؤالاً') && t.includes('1 يحتاج مراجعة')));

  Bank.launchQuiz('qz_bad_miss');
  Bank.launchQuiz('qz_bad_blank');
  Bank.launchQuiz('qz_bad_five');
  assert.equal(alerts.length, 3);
  assert.equal(getLaunched(), null);

  Bank.launchQuiz('qz_good_gap');
  assert.ok(getLaunched());
  assert.deepEqual(Array.from(getLaunched().questions[0].opts), ['أ', 'ب']);
  assert.equal(getLaunched().questions[0].ans, 1);
  assert.equal(getLaunched().questions[0].points, 0);
});

test('approved Yahoo teacher logs in & refreshes session with emailVerified=false; pending/rejected stay blocked', async () => {
  let signOutCount = 0;
  let currentFirebaseUser = null;
  let mockDbState = {};

  const authApi = {
    languageCode: null,
    get currentUser() { return currentFirebaseUser; },
    setPersistence: async () => {},
    onAuthStateChanged: () => {},
    signOut: async () => { signOutCount++; currentFirebaseUser = null; },
    signInWithEmailAndPassword: async () => ({ user: currentFirebaseUser })
  };

  const sandbox = {
    console, Date, Math, Set, RegExp, JSON, Object,
    window: null,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    location: { hash: '#home' },
    toast: () => {},
    ScoreARFirebaseConfig: { getActiveConfig: () => ({ projectId: 'mock' }) },
    firebase: {
      apps: [{ name: '[DEFAULT]' }],
      initializeApp: () => {},
      auth: Object.assign(() => authApi, { Auth: { Persistence: { LOCAL: 'LOCAL' } } }),
      database: Object.assign(() => ({
        ref: (p) => ({
          once: async () => ({
            exists: () => p in mockDbState,
            val: () => mockDbState[p]
          }),
          set: async () => {}
        })
      }), { ServerValue: { TIMESTAMP: 123456 } })
    }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(read('js/auth/auth.js'), sandbox, { filename: 'js/auth/auth.js' });
  const Auth = sandbox.ScoreARAuth;

  // 1) Approved Yahoo teacher with emailVerified: false -> login & checkApprovalStatus both succeed!
  currentFirebaseUser = {
    uid: 'tch_yahoo',
    email: 'purebluehorizon@yahoo.com',
    displayName: 'أ. محمد علي',
    emailVerified: false,
    reload: async () => {},
    getIdTokenResult: async () => ({ claims: { role: 'teacher' } })
  };
  const loggedIn = await Auth.login('purebluehorizon@yahoo.com', 'Secret#1234');
  assert.equal(loggedIn.role, 'teacher');
  assert.equal(loggedIn.emailVerified, false);

  const checked = await Auth.checkApprovalStatus();
  assert.equal(checked.approved, true);
  assert.equal(checked.role, 'teacher');
  assert.equal(Auth.getUser().emailVerified, false);

  // 2) Pending teacher without role claim -> blocked & signed out
  currentFirebaseUser = {
    uid: 'tch_pend',
    email: 'pending@yahoo.com',
    emailVerified: false,
    reload: async () => {},
    getIdTokenResult: async () => ({ claims: {} })
  };
  mockDbState = { 'scorear_account_requests/tch_pend': { status: 'pending', emailVerified: false } };
  await assert.rejects(() => Auth.login('pending@yahoo.com', 'Secret#1234'), /TEACHER_PENDING_REVIEW/);
  assert.equal(signOutCount, 1);

  // 3) Rejected teacher without role claim -> blocked & signed out
  currentFirebaseUser = {
    uid: 'tch_rej',
    email: 'rejected@yahoo.com',
    emailVerified: true,
    reload: async () => {},
    getIdTokenResult: async () => ({ claims: {} })
  };
  mockDbState = { 'scorear_account_requests/tch_rej': { status: 'rejected', emailVerified: true } };
  await assert.rejects(() => Auth.login('rejected@yahoo.com', 'Secret#1234'), /TEACHER_ACCOUNT_REJECTED/);
  assert.equal(signOutCount, 2);
});
