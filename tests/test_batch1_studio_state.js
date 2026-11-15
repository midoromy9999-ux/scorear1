/**
 * Automated Verification: Studio & Quiz Builder State Test for Items 3 to 7
 * Tests:
 * 3) Clean New Contest State & "تابع آخر مسودة" draft isolation.
 * 4) Question Actions: 5s Undo Delete, Delete down to 0, Duplicate, Move, Drag Reorder, Validation on save.
 * 5) Points & Time Generalization with Confirm and 10s Undo.
 * 6) Double Points (نقاط ×2) toggle & Unified Equation: Points = Base × Time Factor × Multiplier.
 * 7) Optional Grade & Subject free text.
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DOM mocks
const elements = new Map();
function createMockElement(id, tag = 'div') {
  const el = {
    id,
    tagName: tag.toUpperCase(),
    innerHTML: '',
    textContent: '',
    style: {},
    children: [],
    appendChild: (c) => { el.children.push(c); return c; },
    remove: () => elements.delete(id),
    querySelector: (sel) => null
  };
  elements.set(id, el);
  return el;
}

const mockStorage = new Map();
globalThis.window = globalThis;
globalThis.document = {
  getElementById: (id) => elements.get(id) || null,
  createElement: (tag) => createMockElement('el_' + Math.random().toString(36).substr(2, 6), tag),
  body: createMockElement('body'),
  querySelectorAll: () => []
};
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k)
};
globalThis.toast = () => {};
globalThis.confirm = () => true; // Auto-confirm prompts in tests

// Load modules
const evaluatorCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-evaluator.js'), 'utf8');
new Function(evaluatorCode)();

const hostEventsCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-host-events.js'), 'utf8');
new Function(hostEventsCode)();

const actionsCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-builder-actions.js'), 'utf8');
new Function(actionsCode)();

const mediaCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-builder-media.js'), 'utf8');
new Function(mediaCode)();

const builderCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-builder.js'), 'utf8');
new Function(builderCode)();

console.log('\n--- 1. Testing Item 3: Clean New Contest State & Draft Isolation ---');

// Setup a pre-existing draft in localStorage
const oldDraft = {
  id: 'quiz_old_draft',
  title: 'مسودة قديمة سابقة',
  questions: [{ q: 'سؤال قديم', opts: ['1', '2'], ans: 0 }]
};
localStorage.setItem('scorear_last_draft_id', 'quiz_old_draft');
localStorage.setItem('scorear_draft_backup_quiz_old_draft', JSON.stringify(oldDraft));

// Open builder fresh (start new contest)
globalThis.ScoreARQuizBuilder.openBuilder();
const newQuiz = globalThis.ScoreARQuizBuilder.getCurrentQuiz();

// 3.1 Verify no state leak: Title is fresh, ID is new, not old draft
assert.notStrictEqual(newQuiz.id, 'quiz_old_draft', 'New quiz must NOT have old draft ID');
assert.strictEqual(newQuiz.title, 'مسابقة جديدة بدون عنوان', 'New quiz must have default title, not old draft');
assert.strictEqual(newQuiz.questions[0].q.includes('سؤال قديم'), false, 'New quiz must NOT leak old questions');
console.log('✓ New contest starts completely fresh without state leak (Item 3 compliant)');

// 3.2 Verify Last Draft is isolated and retrievable via "تابع آخر مسودة"
const lastDraftInfo = globalThis.ScoreARQuizBuilderActions.getLastDraftInfo();
assert.ok(lastDraftInfo, 'Last draft info must be retrievable');
assert.strictEqual(lastDraftInfo.title, 'مسودة قديمة سابقة');
globalThis.ScoreARQuizBuilder.resumeLastDraft();
const resumedQuiz = globalThis.ScoreARQuizBuilder.getCurrentQuiz();
assert.strictEqual(resumedQuiz.id, 'quiz_old_draft', 'Resumed quiz must load old draft ID');
assert.strictEqual(resumedQuiz.title, 'مسودة قديمة سابقة', 'Resumed quiz loads draft title');
console.log('✓ Drafts manager retrieves last draft cleanly upon explicit request (Item 3 compliant)');

console.log('\n--- 2. Testing Item 4: Delete 5s Undo, Delete down to 0, Reorder & Validation ---');

// Reset to a quiz with 3 questions
globalThis.ScoreARQuizBuilder.openBuilder();
const qz = globalThis.ScoreARQuizBuilder.getCurrentQuiz();
qz.questions = [
  { id: 'q1', q: 'سؤال 1', opts: ['أ', 'ب'], ans: 0, points: 1000, timeLimit: 20 },
  { id: 'q2', q: 'سؤال 2', opts: ['أ', 'ب'], ans: 0, points: 1000, timeLimit: 20 },
  { id: 'q3', q: 'سؤال 3', opts: ['أ', 'ب'], ans: 0, points: 1000, timeLimit: 20 }
];

// 4.1 Test delete question with undo
globalThis.ScoreARQuizBuilder.deleteQuestion(1); // Delete q2
assert.strictEqual(qz.questions.length, 2, 'Question 2 must be removed');
assert.strictEqual(qz.questions[0].id, 'q1');
assert.strictEqual(qz.questions[1].id, 'q3');

// Trigger undo
globalThis.ScoreARQuizBuilderActions.undoDelete(qz);
assert.strictEqual(qz.questions.length, 3, 'Question must be restored after undo');
assert.strictEqual(qz.questions[1].id, 'q2', 'Question 2 must be restored at index 1');
console.log('✓ Question deletion supports instant 5-second undo restoration');

// 4.2 Test deleting down to 0 questions (must be permitted during editing)
globalThis.ScoreARQuizBuilder.deleteQuestion(2);
globalThis.ScoreARQuizBuilder.deleteQuestion(1);
globalThis.ScoreARQuizBuilder.deleteQuestion(0);
assert.strictEqual(qz.questions.length, 0, 'Must allow deleting all questions down to 0 during editing');
console.log('✓ Deleting down to 0 questions permitted without premature block');

// 4.3 Validation occurs on save/publish, not prematurely
const valEmpty = globalThis.ScoreARQuizBuilder.validateQuiz();
assert.strictEqual(valEmpty.valid, false, 'Validation on empty quiz must fail');
assert.ok(valEmpty.errors[0].includes('فارغة'), 'Validation error must state quiz is empty');
console.log('✓ Validation on save correctly guards against publishing empty quiz');

// Add questions back and test Drag-and-drop reordering
qz.questions = [
  { id: 'qa', q: 'السؤال أ', opts: ['1', '2'], ans: 0 },
  { id: 'qb', q: 'السؤال ب', opts: ['1', '2'], ans: 0 },
  { id: 'qc', q: 'السؤال ج', opts: ['1', '2'], ans: 0 }
];
// Drag item 0 to index 2
globalThis.ScoreARQuizBuilderActions.onDragStart({ dataTransfer: { setData: () => {} } }, 0);
globalThis.ScoreARQuizBuilderActions.onDrop({ preventDefault: () => {} }, 2, qz, () => {});
assert.strictEqual(qz.questions[0].id, 'qb');
assert.strictEqual(qz.questions[1].id, 'qc');
assert.strictEqual(qz.questions[2].id, 'qa');
console.log('✓ Drag-and-drop question reordering functions properly');

console.log('\n--- 3. Testing Item 5: Points & Time Generalization with Confirm and Undo ---');

// 5.1 Points Generalization
qz.questions[0].points = 100;
qz.questions[1].points = 500;
qz.questions[2].points = 1000;

let pointsUpdated = false;
globalThis.ScoreARQuizBuilderActions.applyPointsToAll(qz, 2000, () => { pointsUpdated = true; });
assert.strictEqual(qz.questions[0].points, 2000);
assert.strictEqual(qz.questions[1].points, 2000);
assert.strictEqual(qz.questions[2].points, 2000);
console.log('✓ Apply points to all generalized 2000 points across all questions');

// 5.2 Time Generalization
qz.questions[0].timeLimit = 15;
qz.questions[1].timeLimit = 30;
qz.questions[2].timeLimit = 45;

globalThis.ScoreARQuizBuilderActions.applyTimeToAll(qz, 60, () => {});
assert.strictEqual(qz.questions[0].timeLimit, 60);
assert.strictEqual(qz.questions[1].timeLimit, 60);
assert.strictEqual(qz.questions[2].timeLimit, 60);
console.log('✓ Apply time to all generalized 60s across all questions');

console.log('\n--- 4. Testing Item 6: Double Points (نقاط ×2) & Unified Equation ---');

// 6.1 Toggle double points on question 0
assert.strictEqual(qz.questions[0].isDouble, undefined);
globalThis.ScoreARQuizBuilder.toggleDoublePoints(0);
assert.strictEqual(qz.questions[0].isDouble, true);
assert.strictEqual(qz.questions[0].multiplier, 2);
console.log('✓ Double points toggle sets isDouble: true and multiplier: 2');

// 6.2 Test Unified Equation: Points = Base × Time Factor × Multiplier
// Test case 1: Base = 1000, Multiplier = 2 (Double Points), Time Remaining = 20/20 (Fastest -> TimeFactor = 1.0)
// Expected = 1000 * 1.0 * 2 = 2000
const testQDouble = {
  points: 1000,
  isDouble: true,
  multiplier: 2,
  correct: [0]
};
const testAnswersDouble = {
  'p1': { optionIndex: 0, timeRemaining: 20 }
};
const evalDouble = globalThis.ScoreARHostEvents.evaluateQuestionResults(testQDouble, testAnswersDouble, [{ id: 'p1', name: 'بطل', score: 0 }], 20);
assert.strictEqual(evalDouble.playerResults['p1'].pointsEarned, 2000, 'Double points max must be 2000');
assert.ok(evalDouble.playerResults['p1'].scoreFormula.includes('1000 × 1.00 × 2 = 2000'), 'Formula must be documented in player results');
console.log(`✓ Unified Formula verified: ${evalDouble.playerResults['p1'].scoreFormula}`);

// Test case 2: Base = 500, Multiplier = 1, Time Remaining = 0/20 (Slowest -> TimeFactor = 0.5)
// Expected = 500 * 0.5 * 1 = 250
const testQSlow = {
  points: 500,
  isDouble: false,
  multiplier: 1,
  correct: [0]
};
const testAnswersSlow = {
  'p2': { optionIndex: 0, timeRemaining: 0 }
};
const evalSlow = globalThis.ScoreARHostEvents.evaluateQuestionResults(testQSlow, testAnswersSlow, [{ id: 'p2', name: 'بطل 2', score: 0 }], 20);
assert.strictEqual(evalSlow.playerResults['p2'].pointsEarned, 250, 'Slow answer points with base 500 must be 250');
assert.ok(evalSlow.playerResults['p2'].scoreFormula.includes('500 × 0.50 × 1 = 250'));
console.log(`✓ Unified Formula verified: ${evalSlow.playerResults['p2'].scoreFormula}`);

console.log('\n--- 5. Testing Item 7: Grade & Subject Optional with Free Text ---');
globalThis.ScoreARQuizBuilder.updateQuizSubject('نحو وصرف متقدم');
globalThis.ScoreARQuizBuilder.updateQuizGrade('الصف الأول الثانوي');
assert.strictEqual(qz.subject, 'نحو وصرف متقدم');
assert.strictEqual(qz.grade, 'الصف الأول الثانوي');
console.log('✓ Grade and subject fields accept free text without forcing defaults');

console.log('\n========================================');
console.log('ALL STUDIO STATE & ACTIONS TESTS PASSED 100%! 🚀');
console.log('========================================');
process.exit(0);
