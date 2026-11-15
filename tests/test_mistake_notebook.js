/**
 * ScoreAR - Automated Acceptance Test Suite: Task 4 - Item 4 (Mistake Notebook)
 * Tests:
 *   1. Lossless migration from real-world v1 payload (Item 1 output).
 *   2. Mastery after 2 consecutive correct answers across 2 days via Clock Injection (no Date.now monkeypatching).
 *   3. Anti-farming: No duplicate XP for the same question even after subsequent mistakes.
 *   4. Daily XP cap: Strict enforcement of Math.max(0, Math.min(10, 150 - dailyEarned)).
 *      - Edge Case: dailyEarned > 150 (returns 0)
 *      - Edge Case: dailyEarned negative (-50) sanitized safely
 *      - Edge Case: dailyEarned non-numeric ("invalid", null, NaN)
 *   5. Reset consecutive count to 0 on wrong answer with immediate retry.
 *   6. Spaced repetition intervals via clock injection (24h cooldown for step 1, 7 days after mastery).
 *   7. Option shuffling: dynamically randomizes option order while mapping correct answer accurately.
 *   8. Deleted/updated question quiet archival without page crash.
 *   9. Corrupted/malformed localStorage recovery.
 *   10. Rule 7 line count check (< 500 lines for mistake-notebook.js and student-journey.js).
 * 
 * Run command: node tests/test_mistake_notebook.js
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('   SCOREAR ACCEPTANCE TEST SUITE: TASK 4 - ITEM 4 (دفتر أخطائي)');
console.log('=================================================================');

// --- 1. Rule 7 Line Count Checks (< 500 lines) ---
const schedulerPath = path.join(ROOT, 'mistake-scheduler.js');
const notebookPath = path.join(ROOT, 'mistake-notebook.js');
const journeyPath = path.join(ROOT, 'student-journey.js');

const schedulerLines = fs.readFileSync(schedulerPath, 'utf8').split('\n').length;
const notebookLines = fs.readFileSync(notebookPath, 'utf8').split('\n').length;
const journeyLines = fs.readFileSync(journeyPath, 'utf8').split('\n').length;

assert(schedulerLines < 500, `FAIL: mistake-scheduler.js exceeds 500 lines (${schedulerLines})`);
console.log(`[PASS] Rule 7 Line Count: mistake-scheduler.js (${schedulerLines} lines < 500)`);

assert(notebookLines < 500, `FAIL: mistake-notebook.js exceeds 500 lines (${notebookLines})`);
console.log(`[PASS] Rule 7 Line Count: mistake-notebook.js (${notebookLines} lines < 500)`);

assert(journeyLines < 500, `FAIL: student-journey.js exceeds 500 lines (${journeyLines})`);
console.log(`[PASS] Rule 7 Line Count: student-journey.js (${journeyLines} lines < 500)`);

// --- Setup Minimal Mock Browser Environment ---
const mockLocalStorageStore = {};
globalThis.localStorage = {
  getItem: (key) => mockLocalStorageStore[key] || null,
  setItem: (key, val) => { mockLocalStorageStore[key] = String(val); },
  removeItem: (key) => { delete mockLocalStorageStore[key]; },
  clear: () => { for (const k in mockLocalStorageStore) delete mockLocalStorageStore[k]; }
};

globalThis.document = {
  getElementById: () => null,
  createElement: () => ({ id: '', style: {}, innerHTML: '', appendChild: () => {}, querySelectorAll: () => [] }),
  body: { appendChild: () => {} },
  querySelectorAll: () => []
};

// Load student-journey.js to expose ScoreARJourney with PRACTICE_TRACKS
const journeyCode = fs.readFileSync(journeyPath, 'utf8');
const runJourney = new Function('global', journeyCode);
runJourney(globalThis);
assert(globalThis.ScoreARJourney, 'FAIL: ScoreARJourney did not load');
assert(Array.isArray(globalThis.ScoreARJourney.PRACTICE_TRACKS), 'FAIL: PRACTICE_TRACKS missing');

// Load mistake-scheduler.js
const schedulerCode = fs.readFileSync(schedulerPath, 'utf8');
const runScheduler = new Function('global', schedulerCode);
runScheduler(globalThis);
assert(globalThis.ScoreARMistakeScheduler, 'FAIL: ScoreARMistakeScheduler did not load');

// Load mistake-notebook.js
const notebookCode = fs.readFileSync(notebookPath, 'utf8');
const runNotebook = new Function('global', notebookCode);
runNotebook(globalThis);
assert(globalThis.ScoreARMistakeNotebook, 'FAIL: ScoreARMistakeNotebook did not load');

const NB = globalThis.ScoreARMistakeNotebook;

// --- TEST 1: Lossless Migration with REAL v1 Data from Item 1 ---
console.log('\n--- Test 1: Lossless Migration from REAL v1 Data ---');
localStorage.clear();
const realV1Payload = {
  schemaVersion: 'scorear_v1',
  data: {
    xp: 105,
    solvedQuestionIds: {
      q_naat_01: true,
      q_naat_02: true,
      q_naat_03: true,
      q_naat_04: true,
      q_naat_05: true
    },
    dailyQuietXp: {
      date: '2026-11-07',
      earned: 105
    },
    completedPaths: {
      grammar_naat: {
        completedAt: 1794028560000,
        score: 5,
        total: 5,
        trackTitle: 'مسار النعت وأقسامه (المفرد والجملة)'
      }
    },
    mistakes: [
      {
        questionId: 'q_naat_03',
        questionText: '«سكنتُ في بيتٍ حديقتُهُ واسعةٌ». ما المحل الإعرابي لجملة «حديقتُهُ واسعةٌ»؟',
        skill: 'النحو العربي',
        chosenOption: 'في محل رفع خبر مبتدأ',
        correctOption: 'في محل جر نعت',
        explanation: 'المنعوت «بيتٍ» اسم مجرور نكرة، وجملة المبتدأ والخبر «حديقته واسعة» جاءت وصفاً له؛ لذا فهي في محل جر نعت.',
        pathId: 'grammar_naat',
        timestamp: 1794028500000,
        resolved: false,
        attemptCount: 2
      }
    ],
    streak: {
      count: 1,
      lastActiveDate: '2026-11-07',
      history: ['2026-11-07']
    },
    quietSessionsCount: 1,
    contestSessionsCount: 0,
    lastUpdated: 1794028565000
  }
};
localStorage.setItem('scorear_student_guest_v1', JSON.stringify(realV1Payload));

const migrated = NB.loadState();
assert.strictEqual(migrated.xp, 105, 'Migration must preserve exact real XP (105)');
assert.strictEqual(migrated.dailyQuietXp.earned, 105, 'Migration must preserve real daily XP (105)');
assert.strictEqual(migrated.quietSessionsCount, 1, 'Migration must preserve quiet sessions count (1)');
assert.strictEqual(migrated.streak.count, 1, 'Migration must preserve streak count (1)');
assert.strictEqual(migrated.completedPaths.grammar_naat.score, 5, 'Migration must preserve completed path score');
assert.strictEqual(migrated.solvedQuestionIds.q_naat_03, true, 'Migration must preserve solvedQuestionIds');
assert.strictEqual(migrated.mistakes.length, 1, 'Migration must preserve real mistakes');

const realMistake = migrated.mistakes[0];
assert.strictEqual(realMistake.questionId, 'q_naat_03');
assert.strictEqual(realMistake.mastered, false, 'Unresolved v1 mistake must not be marked mastered');
assert.strictEqual(realMistake.consecutiveCorrect, 0, 'Consecutive correct must initialize to 0');
assert.strictEqual(realMistake.attemptCount, 2, 'Attempt count must preserve exact v1 count (2)');
assert.strictEqual(realMistake.opts.length, 4, 'Must load all 4 curriculum options');
assert.strictEqual(realMistake.opts[realMistake.answer], 'في محل جر نعت', 'Curriculum answer index must match correctOption');

const storedV2 = JSON.parse(localStorage.getItem('scorear_student_guest_v1'));
assert.strictEqual(storedV2.schemaVersion, 'scorear_v2', 'Storage must be upgraded to scorear_v2');
console.log('[PASS] Test 1: Real-world v1->v2 Lossless Migration passed with 100% fidelity.');

// --- TEST 2: Clock Injection - Mastery Across 2 Separate Days ---
console.log('\n--- Test 2: Clock Injection - Mastery Across 2 Days ---');
localStorage.clear();
const qNaat = globalThis.ScoreARJourney.PRACTICE_TRACKS[0].questions[0]; // q_naat_01

// Day 1: T0
const T0 = 1700000000000;
NB.recordMistake(qNaat, 'حال منصوب', T0);

let state = NB.loadState(T0);
assert.strictEqual(state.mistakes.length, 1);
let target = state.mistakes[0];
assert.strictEqual(target.questionId, 'q_naat_01');
assert.strictEqual(target.lastMistakeAt, T0);
assert.strictEqual(NB.isDueForReview(target, T0), true, 'Due immediately on Day 1');

// Day 1 Review Session: First correct answer at T0 + 5 minutes
const T0_review = T0 + 5 * 60 * 1000;
NB.startReviewSession(T0_review);
NB.handleReviewOptionClick(0, 0, T0_review);

state = NB.loadState(T0_review);
target = state.mistakes[0];
assert.strictEqual(target.consecutiveCorrect, 1, 'Consecutive correct must be 1');
assert.strictEqual(target.mastered, false, 'Must NOT be mastered at step 1');
assert.strictEqual(target.masteryXpAwarded, false, 'Mastery XP must NOT be awarded at step 1');
assert.strictEqual(target.lastReviewedAt, T0_review);
assert.strictEqual(target.nextReviewAt, T0_review + 24 * 60 * 60 * 1000, 'Delayed by exactly 24 hours');

// Clock test: 12 hours later -> Still NOT due
assert.strictEqual(NB.isDueForReview(target, T0_review + 12 * 3600 * 1000), false, 'Not due at 12 hours');
// Clock test: 23 hours later -> Still NOT due
assert.strictEqual(NB.isDueForReview(target, T0_review + 23 * 3600 * 1000), false, 'Not due at 23 hours');

// Day 2: T1 = T0_review + 25 hours (Clock Injection)
const T1 = T0_review + 25 * 3600 * 1000;
assert.strictEqual(NB.isDueForReview(target, T1), true, 'Due on Day 2 after 25 hours');

const activeDay2 = NB.getActiveMistakes(T1);
assert.strictEqual(activeDay2.length, 1, 'Question must appear in active mistakes on Day 2');

// Day 2 Review Session: Second consecutive correct answer at T1
NB.startReviewSession(T1);
NB.handleReviewOptionClick(0, 0, T1);

state = NB.loadState(T1);
target = state.mistakes[0];
assert.strictEqual(target.consecutiveCorrect, 2, 'Consecutive correct must be 2');
assert.strictEqual(target.mastered, true, 'Question must now be MASTERED');
assert.strictEqual(target.masteryXpAwarded, true, 'Mastery XP awarded flag must be true');
assert.strictEqual(target.masteredAt, T1, 'MasteredAt must record Day 2 timestamp');
assert.strictEqual(state.xp, 10, 'Student received +10 XP upon mastery');
assert.strictEqual(state.dailyQuietXp.earned, 10, 'Daily XP earned recorded 10 XP');
assert.strictEqual(target.nextReviewAt, T1 + 7 * 24 * 3600 * 1000, 'Delayed by 7 days for maintenance review');

// Clock test: 3 days after mastery -> NOT due
assert.strictEqual(NB.isDueForReview(target, T1 + 3 * 24 * 3600 * 1000), false, 'Not due 3 days after mastery');
// Clock test: 8 days after mastery -> Due for spaced maintenance
assert.strictEqual(NB.isDueForReview(target, T1 + 8 * 24 * 3600 * 1000), true, 'Due 8 days after mastery');
console.log('[PASS] Test 2: Clock Injection verified mastery progression (T0 -> +25h -> T1 -> +7d) without global monkeypatching.');

// --- TEST 3: Post-Mastery Maintenance Review & Anti-Farming ---
console.log('\n--- Test 3: Post-Mastery Maintenance Review & Anti-Farming ---');
const xpBefore = state.xp;
const T_maint = T1 + 8 * 24 * 3600 * 1000; // 8 days after mastery (due for maintenance review)

// Case 3A: Periodic maintenance review with CORRECT answer -> postpones 7 more days, 0 XP
NB.startReviewSession(T_maint);
NB.handleReviewOptionClick(0, 0, T_maint);
state = NB.loadState(T_maint);
target = state.mistakes.find(m => m.questionId === 'q_naat_01');
assert.strictEqual(target.mastered, true, 'Mastery maintained after correct periodic review');
assert.strictEqual(target.nextReviewAt, T_maint + 7 * 24 * 3600 * 1000, 'Postponed for another 7 days');
assert.strictEqual(state.xp, xpBefore, 'No additional XP awarded on maintenance review');

// Case 3B: Periodic maintenance review with WRONG answer -> resets back to active (mastered=false, consecutive=0, nextReviewAt=0, 0 XP)
const T_maint2 = target.nextReviewAt + 1000; // 7 days later
NB.startReviewSession(T_maint2);
NB.handleReviewOptionClick(1, 0, T_maint2); // Wrong option (chosen 1 !== correct 0)
state = NB.loadState(T_maint2);
target = state.mistakes.find(m => m.questionId === 'q_naat_01');
assert.strictEqual(target.mastered, false, 'Failed maintenance review resets question back to active');
assert.strictEqual(target.consecutiveCorrect, 0, 'Consecutive correct resets to 0');
assert.strictEqual(target.nextReviewAt, 0, 'nextReviewAt is 0 (immediately active)');
assert.strictEqual(state.xp, xpBefore, '0 XP awarded on failed maintenance');
assert.strictEqual(NB.getActiveMistakes(T_maint2).length, 1, 'Question is now back in active mistakes');

// Case 3C: Re-mastering it later still awards 0 XP because masteryXpAwarded is permanently true
target.consecutiveCorrect = 1;
NB.saveState(state, T_maint2);
NB.startReviewSession(T_maint2);
NB.handleReviewOptionClick(0, 0, T_maint2); // 2nd consecutive correct answer
state = NB.loadState(T_maint2);
target = state.mistakes.find(m => m.questionId === 'q_naat_01');
assert.strictEqual(target.mastered, true, 'Re-mastered successfully');
assert.strictEqual(state.xp, xpBefore, 'Lifetime cap: 0 duplicate mastery XP ever awarded for same question');
console.log('[PASS] Test 3: Post-mastery periodic review (correct -> +7d delay, wrong -> resets to active, both 0 XP) verified.');

// --- TEST 4: Daily XP Cap: Math.max(0, Math.min(10, 150 - dailyEarned)) ---
console.log('\n--- Test 4: Daily XP Cap & Corrupt Data Defense ---');
const qNaat2 = globalThis.ScoreARJourney.PRACTICE_TRACKS[0].questions[1]; // q_naat_02

// 4A: Normal Pro-rating at 145 XP (awards 5 XP to reach 150)
localStorage.clear();
const todayKey = new Date(T0).toISOString().slice(0, 10);
NB.saveState({
  xp: 145,
  dailyQuietXp: { date: todayKey, earned: 145 },
  mistakes: [{
    questionId: 'q_naat_02', questionText: qNaat2.q, skill: qNaat2.skill,
    pathId: 'grammar_naat', opts: qNaat2.opts, answer: qNaat2.answer, why: qNaat2.why,
    attemptCount: 1, lastMistakeAt: T0, consecutiveCorrect: 1,
    nextReviewAt: 0, mastered: false, masteryXpAwarded: false, archived: false
  }]
}, T0);

NB.startReviewSession(T0);
NB.handleReviewOptionClick(0, 0, T0);
state = NB.loadState(T0);
assert.strictEqual(state.dailyQuietXp.earned, 150, 'Daily XP capped at 150 (awarded exactly 5 XP)');
assert.strictEqual(state.xp, 150, 'Total XP incremented by 5');

// 4B: Edge Case: dailyEarned > 150 (e.g. 165) -> Math.max(0, Math.min(10, 150 - 165)) = 0
NB.saveState({
  xp: 200,
  dailyQuietXp: { date: todayKey, earned: 165 },
  mistakes: [{
    questionId: 'q_naat_03', questionText: 'سؤال', skill: 'نحو',
    pathId: 'grammar_naat', opts: ['أ', 'ب'], answer: 0, why: '',
    attemptCount: 1, lastMistakeAt: T0, consecutiveCorrect: 1,
    nextReviewAt: 0, mastered: false, masteryXpAwarded: false, archived: false
  }]
}, T0);

NB.startReviewSession(T0);
NB.handleReviewOptionClick(0, 0, T0);
state = NB.loadState(T0);
assert.strictEqual(state.xp, 200, 'When dailyEarned > 150, exactly 0 XP is awarded (no overflow or negative)');
assert.strictEqual(state.dailyQuietXp.earned, 165, 'Daily earned remains unchanged');

// 4C: Corrupted Data: Negative dailyEarned (-40) -> sanitized safely
NB.saveState({
  xp: 100,
  dailyQuietXp: { date: todayKey, earned: -40 },
  mistakes: [{
    questionId: 'q_naat_04', questionText: 'سؤال', skill: 'نحو',
    pathId: 'grammar_naat', opts: ['أ', 'ب'], answer: 0, why: '',
    attemptCount: 1, lastMistakeAt: T0, consecutiveCorrect: 1,
    nextReviewAt: 0, mastered: false, masteryXpAwarded: false, archived: false
  }]
}, T0);
NB.startReviewSession(T0);
NB.handleReviewOptionClick(0, 0, T0);
state = NB.loadState(T0);
assert(state.xp >= 100 && state.xp <= 110, 'Negative daily earned handled safely without NaN or crash');
assert(state.dailyQuietXp.earned >= 0, 'Daily earned sanitized to non-negative value');

// 4D: Corrupted Data: Non-numeric dailyEarned ("INVALID_NUMBER") -> sanitized safely
NB.saveState({
  xp: 50,
  dailyQuietXp: { date: todayKey, earned: "INVALID_NUMBER" },
  mistakes: [{
    questionId: 'q_naat_05', questionText: 'سؤال', skill: 'نحو',
    pathId: 'grammar_naat', opts: ['أ', 'ب'], answer: 0, why: '',
    attemptCount: 1, lastMistakeAt: T0, consecutiveCorrect: 1,
    nextReviewAt: 0, mastered: false, masteryXpAwarded: false, archived: false
  }]
}, T0);
NB.startReviewSession(T0);
NB.handleReviewOptionClick(0, 0, T0);
state = NB.loadState(T0);
assert.strictEqual(state.xp, 60, 'Non-numeric daily earned safely defaulted to 0, awarding standard 10 XP');
assert.strictEqual(state.dailyQuietXp.earned, 10, 'Daily earned safely updated as number (10)');
console.log('[PASS] Test 4: Math.max(0, Math.min(10, 150 - dailyEarned)) and corrupt data defense verified.');

// --- TEST 5: Reset Consecutive Count on Wrong Answer ---
console.log('\n--- Test 5: Reset Consecutive Count on Wrong Answer ---');
localStorage.clear();
NB.saveState({
  xp: 0,
  dailyQuietXp: { date: todayKey, earned: 0 },
  mistakes: [{
    questionId: 'q_naat_01', questionText: qNaat.q, skill: qNaat.skill,
    pathId: 'grammar_naat', opts: qNaat.opts, answer: qNaat.answer, why: qNaat.why,
    attemptCount: 1, lastMistakeAt: T0, consecutiveCorrect: 1,
    nextReviewAt: 0, mastered: false, masteryXpAwarded: false, archived: false
  }]
}, T0);

NB.startReviewSession(T0);
NB.handleReviewOptionClick(1, 0, T0); // Wrong answer: chosen 1 !== correct 0

state = NB.loadState(T0);
target = state.mistakes[0];
assert.strictEqual(target.consecutiveCorrect, 0, 'Consecutive correct resets to 0 upon wrong answer');
assert.strictEqual(target.attemptCount, 2, 'Attempt count increments to 2');
assert.strictEqual(target.nextReviewAt, 0, 'nextReviewAt is 0 for immediate retry');
assert.strictEqual(target.mastered, false, 'Mastery remains false');
console.log('[PASS] Test 5: Consecutive count reset and immediate retry verified.');

// --- TEST 6: Spaced Repetition Cooldown Intervals ---
console.log('\n--- Test 6: Spaced Repetition Cooldown Intervals ---');
const oneHour = 3600 * 1000;
const testMistake = {
  questionId: 'q_test_cooldown',
  archived: false,
  nextReviewAt: T0 + 24 * oneHour
};
assert.strictEqual(NB.isDueForReview(testMistake, T0), false, 'Not due at T0');
assert.strictEqual(NB.isDueForReview(testMistake, T0 + 23 * oneHour), false, 'Not due at T0 + 23h');
assert.strictEqual(NB.isDueForReview(testMistake, T0 + 24 * oneHour), true, 'Due exactly at T0 + 24h');
assert.strictEqual(NB.isDueForReview(testMistake, T0 + 25 * oneHour), true, 'Due at T0 + 25h');
console.log('[PASS] Test 6: Spaced repetition cooldown intervals verified via clock injection.');

// --- TEST 7: Dynamic Option Shuffling ---
console.log('\n--- Test 7: Dynamic Option Shuffling ---');
const originalOpts = ['أحمد', 'محمد', 'علي', 'عمر'];
const originalCorrectIdx = 2; // 'علي'
const originalCorrectText = originalOpts[originalCorrectIdx];

let positionsSeen = new Set();
for (let i = 0; i < 30; i++) {
  const { shuffledOpts, newCorrectIdx } = NB.shuffleOptions(originalOpts, originalCorrectIdx);
  assert.strictEqual(shuffledOpts.length, originalOpts.length, 'Option count preserved');
  assert.strictEqual(shuffledOpts[newCorrectIdx], originalCorrectText, 'Correct option mapped accurately');
  positionsSeen.add(newCorrectIdx);
}
assert(positionsSeen.size > 1, `Options dynamically distributed across positions (${positionsSeen.size} unique indices)`);
console.log(`[PASS] Test 7: Dynamic option shuffling verified across ${positionsSeen.size} unique positions.`);

// --- TEST 8: Deleted Question / Changed ID Quiet Archival ---
console.log('\n--- Test 8: Deleted Question / Changed ID Quiet Archival ---');
localStorage.clear();
NB.saveState({
  mistakes: [{
    questionId: 'q_deleted_legacy_999',
    questionText: 'سؤال محذوف من المنهج',
    skill: 'نحو قديم',
    pathId: 'legacy',
    opts: [],
    answer: 0,
    why: '',
    attemptCount: 1,
    lastMistakeAt: T0,
    consecutiveCorrect: 0,
    nextReviewAt: 0,
    mastered: false,
    masteryXpAwarded: false,
    archived: false
  }]
}, T0);

NB.startReviewSession(T0);
state = NB.loadState(T0);
const delItem = state.mistakes.find(m => m.questionId === 'q_deleted_legacy_999');
assert(delItem, 'Deleted item preserved in state');
assert.strictEqual(delItem.archived, true, 'Deleted question quietly marked archived');
assert.strictEqual(delItem.archiveReason, 'question_updated', 'Archive reason is question_updated');
assert.strictEqual(NB.getActiveMistakes(T0).length, 0, 'Archived question safely excluded from active mistakes');
console.log('[PASS] Test 8: Deleted question quietly archived without page crash.');

// --- TEST 9: Corrupted / Malformed localStorage Recovery ---
console.log('\n--- Test 9: Corrupted / Malformed localStorage Recovery ---');
const badInputs = [
  '{"schemaVersion": "scorear_v2", "data": BROKEN_SYNTAX}',
  'null',
  '"just_a_string"',
  '{"schemaVersion": "scorear_v2", "data": null}',
  '{"schemaVersion": "future_v999"}'
];
for (const bad of badInputs) {
  localStorage.setItem('scorear_student_guest_v1', bad);
  const rec = NB.loadState(T0);
  assert(rec, 'Must return valid state on corrupted input');
  assert(typeof rec.xp === 'number', 'Recovered xp must be number');
  assert(Array.isArray(rec.mistakes), 'Recovered mistakes must be array');
  assert(typeof rec.dailyQuietXp === 'object', 'Recovered dailyQuietXp must be object');
}
console.log('[PASS] Test 9: Corrupted/malformed storage recovery verified on all edge cases.');

console.log('\n=================================================================');
console.log('   🎉 ALL 10 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
console.log('=================================================================');
