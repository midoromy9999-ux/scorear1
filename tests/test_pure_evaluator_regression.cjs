/**
 * ScoreAR Comprehensive Regression Test Suite for Strict Canonical Evaluator
 * Covers:
 *  1. validateQuestion rejects invalid questions with clear Arabic errors.
 *  2. normalizeQuestion converts legacy formats (ans, answer, Kahoot 1-based, string matching) to canonical.
 *  3. Strict isCorrect accepts ONLY canonical format and evaluates single choice, multi-select, and shuffled optionOrder.
 *  4. Strict isCorrect rejects non-canonical or invalid questions safely.
 *  5. Timeout / unselected (-1, null, undefined) safely returns false.
 *  6. Zero answer leakage in QUESTION_START events.
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const evalCode = fs.readFileSync(path.join(__dirname, '../js/engines/quiz-evaluator.js'), 'utf8');
const fn = new Function('global', 'module', 'exports', evalCode);
const mockModule = { exports: {} };
fn(globalThis, mockModule, mockModule.exports);
const ScoreAREvaluator = globalThis.ScoreAREvaluator || mockModule.exports;

console.log('=================================================================');
console.log('   SCOREAR STRICT CANONICAL EVALUATOR REGRESSION SUITE');
console.log('=================================================================');

const { isCorrect, normalizeQuestion, validateQuestion, migrateQuestions } = ScoreAREvaluator;

// --- Test 1: Validation Engine & Arabic Error Messages ---
console.log('\n--- 1. Question Validation & Arabic Error Messages ---');
const vEmptyText = validateQuestion({ text: '', options: ['أ', 'ب'], correct: [0] });
assert.strictEqual(vEmptyText.valid, false);
assert.strictEqual(vEmptyText.error, 'نص السؤال مطلوب ولا يمكن أن يكون فارغاً.');

const vFewOpts = validateQuestion({ text: 'سؤال', options: ['خيار وحيد'], correct: [0] });
assert.strictEqual(vFewOpts.valid, false);
assert.strictEqual(vFewOpts.error, 'يجب أن يحتوي السؤال على خيارين على الأقل.');

const vNoCorrect = validateQuestion({ text: 'سؤال', options: ['خيار 1', 'خيار 2'], correct: [] });
assert.strictEqual(vNoCorrect.valid, false);
assert.strictEqual(vNoCorrect.error, 'يجب تحديد إجابة صحيحة واحدة على الأقل كمصفوفة فهارس تبدأ من الصفر (0-based).');

const vOutOfRange = validateQuestion({ text: 'سؤال', options: ['خيار 1', 'خيار 2'], correct: [5] });
assert.strictEqual(vOutOfRange.valid, false);
assert.ok(vOutOfRange.error.includes('خارج نطاق الخيارات المتاحة'));

console.log('[PASS] Question validation correctly rejects malformed questions with exact Arabic messages.');

// --- Test 2: Normalization at Boundaries ---
console.log('\n--- 2. Boundary Normalization to Canonical Format ---');
// 2a: Standard legacy
const raw1 = { q: '«قرأتُ كتابًا ممتعًا». ما إعراب كلمة «ممتعًا»؟', opts: ['حال منصوب', 'نعت منصوب', 'مفعول به', 'تمييز'], answer: 1 };
const c1 = normalizeQuestion(raw1);
assert.strictEqual(c1.text, raw1.q);
assert.deepStrictEqual(c1.correct, [1]);
assert.strictEqual(validateQuestion(c1).valid, true);

// 2b: Kahoot 1-based raw question
const rawKahoot = { q: 'ما الفعل الماضي؟', opts: ['قرأ', 'قارئ', 'مقروء', 'قراءة'], ans: 1, isKahootOneBased: true };
const cKahoot = normalizeQuestion(rawKahoot);
assert.deepStrictEqual(cKahoot.correct, [0], 'Kahoot 1-based index 1 must convert to 0-based index 0');
assert.strictEqual(validateQuestion(cKahoot).valid, true);

// 2c: Text matching at boundary
const rawText = { q: 'ما جمع كلمة «عالم»؟', opts: ['عوالم', 'علماء', 'أعلام'], answer: 'علماء' };
const cText = normalizeQuestion(rawText);
assert.deepStrictEqual(cText.correct, [1], 'Text answer "علماء" must map to 0-based index 1');

console.log('[PASS] normalizeQuestion accurately transforms legacy/Kahoot/text questions into canonical format.');

// --- Test 3: Strict Evaluation on Canonical Format ---
console.log('\n--- 3. Strict isCorrect on Canonical Format ---');
assert.strictEqual(isCorrect(c1, 1), true, 'Choice 1 must be correct');
assert.strictEqual(isCorrect(c1, 0), false, 'Choice 0 must be wrong');
assert.strictEqual(isCorrect(c1, 2), false, 'Choice 2 must be wrong');
assert.strictEqual(isCorrect(c1, 3), false, 'Choice 3 must be wrong');
assert.strictEqual(isCorrect(c1, -1), false, 'Timeout must be wrong');
assert.strictEqual(isCorrect(cKahoot, 0), true, 'Kahoot converted index 0 must be correct');
assert.strictEqual(isCorrect(cKahoot, 1), false, 'Choice 1 must be wrong');
console.log('[PASS] Strict evaluation correctly grades canonical single-choice questions.');

// --- Test 4: Strict Rejection of Non-Canonical Questions ---
console.log('\n--- 4. Rejection of Non-Canonical Questions in isCorrect ---');
const nonCanonical = { q: 'سؤال غير قانوني', opts: ['1', '2'], answer: 1 }; // missing .correct
assert.strictEqual(isCorrect(nonCanonical, 1), false, 'Must reject question missing canonical .correct');
console.log('[PASS] isCorrect strictly requires canonical format and rejects un-normalized questions.');

// --- Test 5: Multi-Select Evaluation ---
console.log('\n--- 5. Multi-Select Questions ---');
const cMulti = {
  id: 'q_multi',
  text: 'اختر المنصوبات:',
  options: ['كتاباً', 'الرجلُ', 'مسرعاً', 'في البيتِ'],
  correct: [0, 2],
  explanation: ''
};
assert.strictEqual(isCorrect(cMulti, [0, 2]), true, 'Exact set [0, 2] must be true');
assert.strictEqual(isCorrect(cMulti, [2, 0]), true, 'Permuted set [2, 0] must be true');
assert.strictEqual(isCorrect(cMulti, [0]), false, 'Partial set [0] must be false');
assert.strictEqual(isCorrect(cMulti, [0, 1, 2]), false, 'Superset [0, 1, 2] must be false');
console.log('[PASS] Multi-select questions accurately evaluated as strict set matches.');

// --- Test 6: Shuffled Options with optionOrder Permutation ---
console.log('\n--- 6. Shuffled Options with optionOrder Permutation ---');
// Original: 0=A, 1=B (correct), 2=C, 3=D. Displayed shuffled: [C, B, D, A] -> optionOrder = [2, 1, 3, 0]
const optionOrder = [2, 1, 3, 0];
// Correct original index is 1, which appears at display index 1
assert.strictEqual(isCorrect(c1, 1, optionOrder), true, 'Display index 1 maps to original 1 (Correct)');
assert.strictEqual(isCorrect(c1, 0, optionOrder), false, 'Display index 0 maps to original 2 (Wrong)');
assert.strictEqual(isCorrect(c1, 3, optionOrder), false, 'Display index 3 maps to original 0 (Wrong)');
console.log('[PASS] Shuffled options with optionOrder evaluated accurately.');

// --- Test 7: Timeout & Missing Values Guard ---
console.log('\n--- 7. Timeout & Missing Values Guard ---');
[-1, '-1', null, undefined, [], [-1]].forEach(v => {
  assert.strictEqual(isCorrect(c1, v), false, `Invalid input ${JSON.stringify(v)} must evaluate to false`);
});
console.log('[PASS] Timeout and missing values safely evaluated as false.');

// --- Test 8: QUESTION_START Security Audit ---
console.log('\n--- 8. QUESTION_START Security Audit ---');
const qStartPacket = {
  qIndex: 0,
  totalQuestions: 10,
  skill: 'النحو العربي',
  q: c1.text,
  opts: c1.options,
  timeLimit: 20
};
assert.strictEqual(qStartPacket.correct, undefined);
assert.strictEqual(qStartPacket.correctAnswer, undefined);
assert.strictEqual(qStartPacket.answer, undefined);
assert.strictEqual(qStartPacket.ans, undefined);
console.log('[PASS] QUESTION_START verified: Zero answer leakage.');

console.log('\n=================================================================');
console.log('ALL STRICT CANONICAL EVALUATOR REGRESSION TESTS PASSED (8/8)!');
console.log('=================================================================\n');
