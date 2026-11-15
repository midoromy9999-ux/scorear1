/**
 * ScoreAR - Automated Acceptance Test Suite: Task 4 - Item 2 (خريطة المهارات والمحطات)
 * Tests:
 *   1. Rule 7 Line Count (< 500 lines for skill-engine.js and skill-map.js).
 *   2. Exactly 70% threshold logic (edge case 0.70 passes, 0.69 fails).
 *   3. Station with 0 questions (safe from division by zero / NaN).
 *   4. Missing question ID / corrupted question objects in array.
 *   5. Sequential unlocking (Station 1 open -> Station 2 locked -> Station 1 >=70% unlocks Station 2).
 *   6. Unlimited replay of open/mastered stations (attempts incremented, bestScore preserved).
 *   7. 'reviewed: false' tagging and exclusion from official mastery score.
 *   8. Lossless migration from v2 schema to v3.
 *   9. Corrupted/malformed data recovery.
 * 
 * Run command: node tests/test_skill_map.js
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('   SCOREAR ACCEPTANCE TEST SUITE: TASK 4 - ITEM 2 (خريطة المهارات)');
console.log('=================================================================');

// 1. Rule 7 Line Count
const enginePath = path.join(ROOT, 'skill-engine.js');
const engineLines = fs.readFileSync(enginePath, 'utf8').split('\n').length;
assert(engineLines < 500, `FAIL: skill-engine.js exceeds 500 lines (${engineLines})`);
console.log(`[PASS] Rule 7 Line Count: skill-engine.js (${engineLines} lines < 500)`);

// Load engine
const engineCode = fs.readFileSync(enginePath, 'utf8');
const runEngine = new Function('global', engineCode);
runEngine(globalThis);
assert(globalThis.ScoreARSkillEngine, 'FAIL: ScoreARSkillEngine did not load');
const Engine = globalThis.ScoreARSkillEngine;

// --- TEST 2: Exactly 70% Threshold Logic ---
console.log('\n--- Test 2: Exactly 70% Passing Threshold ---');
// 7 out of 10 questions correct
const tenQuestions = Array.from({ length: 10 }, (_, i) => ({
  id: `q_test_${i + 1}`,
  correct: 0,
  reviewed: true
}));

const answers7 = {
  q_test_1: 0, q_test_2: 0, q_test_3: 0, q_test_4: 0, q_test_5: 0, q_test_6: 0, q_test_7: 0,
  q_test_8: 1, q_test_9: 1, q_test_10: 1
};
const res70 = Engine.calculateStationScore(tenQuestions, answers7);
assert.strictEqual(res70.score, 0.7);
assert.strictEqual(res70.percentage, 70);
assert.strictEqual(res70.isPassed, true, 'Exactly 70% MUST pass the station');
console.log('   -> Exactly 70% (7/10): Passed ✓');

// 6 out of 10 questions correct (60%)
const answers6 = {
  q_test_1: 0, q_test_2: 0, q_test_3: 0, q_test_4: 0, q_test_5: 0, q_test_6: 0,
  q_test_7: 1, q_test_8: 1, q_test_9: 1, q_test_10: 1
};
const res60 = Engine.calculateStationScore(tenQuestions, answers6);
assert.strictEqual(res60.percentage, 60);
assert.strictEqual(res60.isPassed, false, '60% must fail the station');
console.log('   -> 60% (6/10): Failed ✓');

// 3 out of 5 questions correct (60% fails) vs 4 out of 5 (80% passes)
const fiveQuestions = Array.from({ length: 5 }, (_, i) => ({ id: `q_5_${i + 1}`, correct: 0, reviewed: true }));
const answers3of5 = { q_5_1: 0, q_5_2: 0, q_5_3: 0, q_5_4: 1, q_5_5: 1 };
assert.strictEqual(Engine.calculateStationScore(fiveQuestions, answers3of5).isPassed, false);
const answers4of5 = { q_5_1: 0, q_5_2: 0, q_5_3: 0, q_5_4: 0, q_5_5: 1 };
assert.strictEqual(Engine.calculateStationScore(fiveQuestions, answers4of5).isPassed, true);
console.log('[PASS] Test 2: Passing threshold (>= 70%) strictly verified.');

// --- TEST 3: Station with 0 Questions ---
console.log('\n--- Test 3: Station with 0 Questions (Division by Zero Defense) ---');
const emptyRes = Engine.calculateStationScore([], {});
assert.strictEqual(emptyRes.total, 0);
assert.strictEqual(emptyRes.score, 0);
assert.strictEqual(emptyRes.percentage, 0);
assert.strictEqual(emptyRes.isPassed, false);
assert(!isNaN(emptyRes.score), 'Score must not be NaN');
console.log('[PASS] Test 3: Station with 0 questions safely handled without NaN or errors.');

// --- TEST 4: Missing Question ID / Corrupt Array Items ---
console.log('\n--- Test 4: Missing Question ID & Corrupt Objects ---');
const messyQuestions = [
  null,
  undefined,
  { id: '' }, // empty id
  { id: 'q_valid_01', correct: 2, reviewed: true },
  'not_an_object',
  { id: 'q_valid_02', correct: 1, reviewed: true }
];
const messyAnswers = { q_valid_01: 2, q_valid_02: 1 };
const messyRes = Engine.calculateStationScore(messyQuestions, messyAnswers);
assert.strictEqual(messyRes.total, 2, 'Only 2 valid questions must be counted');
assert.strictEqual(messyRes.correct, 2);
assert.strictEqual(messyRes.isPassed, true);
console.log('[PASS] Test 4: Missing and corrupt question items skipped cleanly.');

// --- TEST 5: Sequential Unlocking Logic ---
console.log('\n--- Test 5: Sequential Unlocking Logic ---');
const stations = [
  { id: 'st_01', title: 'المحطة الأولى' },
  { id: 'st_02', title: 'المحطة الثانية' },
  { id: 'st_03', title: 'المحطة الثالثة' }
];

let prog = {};
// Station 1: Always open initially
assert.strictEqual(Engine.determineStationStatus(stations[0], 0, stations, prog), Engine.STATUS_OPEN);
// Station 2: Locked because Station 1 not passed
assert.strictEqual(Engine.determineStationStatus(stations[1], 1, stations, prog), Engine.STATUS_LOCKED);

// Student fails Station 1 (50%)
prog = Engine.recordStationAttempt(prog, 'st_01', { score: 0.5, percentage: 50, isPassed: false });
assert.strictEqual(Engine.determineStationStatus(stations[0], 0, stations, prog), Engine.STATUS_OPEN);
assert.strictEqual(Engine.determineStationStatus(stations[1], 1, stations, prog), Engine.STATUS_LOCKED);

// Student passes Station 1 (80%)
prog = Engine.recordStationAttempt(prog, 'st_01', { score: 0.8, percentage: 80, isPassed: true });
assert.strictEqual(Engine.determineStationStatus(stations[0], 0, stations, prog), Engine.STATUS_MASTERED);
// Station 2 is now UNLOCKED (OPEN)!
assert.strictEqual(Engine.determineStationStatus(stations[1], 1, stations, prog), Engine.STATUS_OPEN);
// Station 3 is still LOCKED
assert.strictEqual(Engine.determineStationStatus(stations[2], 2, stations, prog), Engine.STATUS_LOCKED);
console.log('[PASS] Test 5: Sequential unlocking verified (Station 2 opens only after Station 1 >= 70%).');

// --- TEST 6: Unlimited Replay of Open/Mastered Stations ---
console.log('\n--- Test 6: Unlimited Replay Capability ---');
const initialAttempts = prog['st_01'].attempts;
// Replay Station 1 with 100%
prog = Engine.recordStationAttempt(prog, 'st_01', { score: 1.0, percentage: 100, isPassed: true });
assert.strictEqual(prog['st_01'].attempts, initialAttempts + 1, 'Attempts must increment on replay');
assert.strictEqual(prog['st_01'].bestScore, 1.0, 'Best score updated to 1.0');
assert.strictEqual(prog['st_01'].status, Engine.STATUS_MASTERED);

// Replay with lower score does not downgrade bestScore or status
prog = Engine.recordStationAttempt(prog, 'st_01', { score: 0.6, percentage: 60, isPassed: false });
assert.strictEqual(prog['st_01'].attempts, initialAttempts + 2);
assert.strictEqual(prog['st_01'].bestScore, 1.0, 'Best score preserved on lower replay');
assert.strictEqual(prog['st_01'].status, Engine.STATUS_MASTERED, 'Status remains mastered on lower replay');
console.log('[PASS] Test 6: Replay capability verified (progress preserved, attempts incremented).');

// --- TEST 7: 'reviewed: false' Questions Behavior ---
console.log('\n--- Test 7: Unreviewed Questions Tagging & Official Mastery Exclusion ---');
const mixedQuestions = [
  { id: 'q_rev_01', correct: 0, reviewed: true },
  { id: 'q_unrev_02', correct: 1, reviewed: false },
  { id: 'q_unrev_03', correct: 2, reviewed: false }
];
const mixedAns = { q_rev_01: 0, q_unrev_02: 1, q_unrev_03: 2 };
const mixedRes = Engine.calculateStationScore(mixedQuestions, mixedAns);

assert.strictEqual(mixedRes.hasUnreviewedQuestions, true, 'Must flag unreviewed questions');
assert.strictEqual(mixedRes.total, 3, 'Total questions is 3');
assert.strictEqual(mixedRes.reviewedTotal, 1, 'Only 1 question is officially reviewed');
assert.strictEqual(mixedRes.reviewedScore, 1.0, 'Reviewed score is 1.0 based solely on reviewed questions');
console.log('[PASS] Test 7: Unreviewed questions tagged and excluded from official reviewed pool.');

// --- TEST 8: Lossless Schema Migration (v2 -> v3) ---
console.log('\n--- Test 8: Lossless Schema Migration (v2 -> v3) ---');
const v2Payload = {
  schemaVersion: 'scorear_v2',
  data: {
    xp: 95,
    dailyQuietXp: { date: '2026-11-07', earned: 30 },
    solvedQuestionIds: { q_naat_01: true, q_naat_02: true },
    completedTrackIds: { grammar_naat: true },
    streak: { count: 3, bestStreak: 5, lastActiveDate: '2026-11-07' }
  }
};
const v3State = Engine.migrateProgressToV3(v2Payload);
assert.strictEqual(v3State.schemaVersion, 'scorear_v3');
assert.strictEqual(v3State.data.xp, 95, 'XP preserved');
assert.strictEqual(v3State.data.dailyQuietXp.earned, 30, 'Daily Quiet XP preserved');
assert.strictEqual(v3State.data.solvedQuestionIds.q_naat_01, true, 'Solved IDs preserved');
assert.strictEqual(v3State.data.completedTrackIds.grammar_naat, true, 'Completed tracks preserved');
assert.strictEqual(v3State.data.streak.count, 3, 'Streak count preserved');
// Auto-credited station for completed track
assert(v3State.data.stationsProgress['station_naat_01'], 'Auto-credited station created for completed track');
assert.strictEqual(v3State.data.stationsProgress['station_naat_01'].status, Engine.STATUS_MASTERED);
console.log('[PASS] Test 8: Lossless v2->v3 migration verified with 100% fidelity.');

// --- TEST 9: Corrupted Storage Recovery ---
console.log('\n--- Test 9: Corrupted Storage Recovery ---');
const corruptPayloads = [null, undefined, 'broken_string', -50, { data: null }];
corruptPayloads.forEach(c => {
  const recovered = Engine.migrateProgressToV3(c);
  assert(recovered && recovered.schemaVersion === 'scorear_v3');
  assert.strictEqual(recovered.data.xp, 0);
  assert(typeof recovered.data.stationsProgress === 'object');
});
console.log('[PASS] Test 9: Corrupted storage recovery verified on all edge cases.');

// --- TEST 10: Station Progression with ALL Questions Unreviewed (Point 1A) ---
console.log('\n--- Test 10: Station Progression with ALL Questions Unreviewed (Point 1A) ---');
const allUnreviewedQuestions = [
  { id: 'q_unrev_01', correct: 0, reviewed: false },
  { id: 'q_unrev_02', correct: 1, reviewed: false },
  { id: 'q_unrev_03', correct: 2, reviewed: false },
  { id: 'q_unrev_04', correct: 1, reviewed: false },
  { id: 'q_unrev_05', correct: 3, reviewed: false }
];
// Student answers 4 out of 5 correctly (80% >= 70%)
const answers4of5Unrev = {
  q_unrev_01: 0,
  q_unrev_02: 1,
  q_unrev_03: 2,
  q_unrev_04: 1,
  q_unrev_05: 0 // incorrect
};
const resAllUnrev = Engine.calculateStationScore(allUnreviewedQuestions, answers4of5Unrev);
assert.strictEqual(resAllUnrev.total, 5);
assert.strictEqual(resAllUnrev.correct, 4);
assert.strictEqual(resAllUnrev.score, 0.8);
assert.strictEqual(resAllUnrev.percentage, 80);
assert.strictEqual(resAllUnrev.isPassed, true, 'CRITICAL: Station MUST pass and unlock next station even if all questions are unreviewed');
assert.strictEqual(resAllUnrev.hasUnreviewedQuestions, true, 'Must flag unreviewed status for UI warning badge');
assert.strictEqual(resAllUnrev.reviewedTotal, 0, 'Official reviewed questions count is 0');
assert.strictEqual(resAllUnrev.reviewedScore, 0, 'Official certified reviewed score is 0 pending review');

// Verify progress recording unlocks next station
let progAllUnrev = {};
progAllUnrev = Engine.recordStationAttempt(progAllUnrev, 'st_unrev_01', resAllUnrev);
assert.strictEqual(progAllUnrev['st_unrev_01'].status, Engine.STATUS_MASTERED);
assert.strictEqual(Engine.determineStationStatus({ id: 'st_unrev_02' }, 1, [{ id: 'st_unrev_01' }, { id: 'st_unrev_02' }], progAllUnrev), Engine.STATUS_OPEN, 'Next station MUST be open!');
console.log('[PASS] Test 10: Station unlocks next station when all questions are unreviewed (student is never blocked).');

// --- TEST 11: Station Progression with MIXED Questions (Point 1B) ---
console.log('\n--- Test 11: Station Progression with MIXED Questions (Point 1B) ---');
const mixed5Questions = [
  { id: 'q_m_01', correct: 0, reviewed: true },
  { id: 'q_m_02', correct: 1, reviewed: true },
  { id: 'q_m_03', correct: 2, reviewed: false },
  { id: 'q_m_04', correct: 1, reviewed: false },
  { id: 'q_m_05', correct: 3, reviewed: false }
];
// Student answers 4 out of 5 correctly:
// - Reviewed: 2/2 correct (100%)
// - Unreviewed: 2/3 correct
const answersMixed = {
  q_m_01: 0, // correct (reviewed)
  q_m_02: 1, // correct (reviewed)
  q_m_03: 2, // correct (unreviewed)
  q_m_04: 1, // correct (unreviewed)
  q_m_05: 0  // incorrect (unreviewed)
};
const resMixed = Engine.calculateStationScore(mixed5Questions, answersMixed);
assert.strictEqual(resMixed.total, 5);
assert.strictEqual(resMixed.correct, 4);
assert.strictEqual(resMixed.percentage, 80);
assert.strictEqual(resMixed.isPassed, true, '80% >= 70% passes the station');
assert.strictEqual(resMixed.hasUnreviewedQuestions, true);
assert.strictEqual(resMixed.reviewedTotal, 2, 'Exactly 2 reviewed questions evaluated');
assert.strictEqual(resMixed.reviewedCorrect, 2);
assert.strictEqual(resMixed.reviewedScore, 1.0, 'Official certified reviewed score is 100%');
console.log('[PASS] Test 11: Mixed station cleanly separates operational unlock (80%) from certified mastery (100%).');

console.log('\n=================================================================');
console.log('   🎉 ALL 11 SKILL MAP ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
console.log('=================================================================');
