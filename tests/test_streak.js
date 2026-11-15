/**
 * ScoreAR - Automated Acceptance Test Suite: Task 4 - Item 3 (Daily Streak)
 * Tests:
 *   1. Rule 7 Line Count (< 500 lines for streak.js).
 *   2. Active Day vs Inactive Day (0-4 questions vs >= 5 questions vs path completion).
 *   3. 1 Grace Day protection (missed 1 day keeps streak alive).
 *   4. Streak broken after 2 missed days (resets to 1 with warm welcome message).
 *   5. Weekly renewal of Grace credit.
 *   6. Midnight crossing: questions cleanly partitioned by local date.
 *   7. Timezone / Local date formatting.
 *   8. Backward clock jump safety (ignored cleanly without breaking history).
 *   9. Zero XP award guarantee (moral gamification only).
 *   10. Corrupted/malformed data recovery.
 * 
 * Run command: node tests/test_streak.js
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('   SCOREAR ACCEPTANCE TEST SUITE: TASK 4 - ITEM 3 (سلسلة الأيام)');
console.log('=================================================================');

// 1. Rule 7 Line Count
const streakPath = path.join(ROOT, 'streak.js');
const streakLines = fs.readFileSync(streakPath, 'utf8').split('\n').length;
assert(streakLines < 500, `FAIL: streak.js exceeds 500 lines (${streakLines})`);
console.log(`[PASS] Rule 7 Line Count: streak.js (${streakLines} lines < 500)`);

// Mock Environment
const mockStorage = {};
globalThis.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

// Load streak.js
const streakCode = fs.readFileSync(streakPath, 'utf8');
const runStreak = new Function('global', streakCode);
runStreak(globalThis);
assert(globalThis.ScoreARStreak, 'FAIL: ScoreARStreak did not load');
const S = globalThis.ScoreARStreak;

// Base timestamp: Saturday 2026-11-07 10:00:00 UTC
const DAY_MS = 24 * 60 * 60 * 1000;
const T_SAT = Date.UTC(2026, 10, 7, 10, 0, 0); // 2026-11-07 (Saturday)

// --- TEST 2: Active vs Inactive Day ---
console.log('\n--- Test 2: Active vs Inactive Day Criteria ---');
let state = S.getCleanStreakState(T_SAT);

// Case 2A: 0 to 4 questions answered -> Inactive
for (let q = 1; q <= 4; q++) {
  state = S.calculateStreakProgress(state, 'question', 1, T_SAT + q * 60000);
  assert.strictEqual(state.count, 0, `Streak count should remain 0 with ${q} questions`);
  assert.strictEqual(state.dailyQuestionsCount, q);
  assert.strictEqual(state.lastActiveDate, null);
}
console.log('   -> 1 to 4 questions: Day is inactive (count = 0) ✓');

// Case 2B: 5th question answered -> Day becomes Active!
state = S.calculateStreakProgress(state, 'question', 1, T_SAT + 5 * 60000);
assert.strictEqual(state.count, 1, 'Streak count must increment to 1 on 5th question');
assert.strictEqual(state.bestStreak, 1);
assert.strictEqual(state.lastActiveDate, '2026-11-07');
assert.strictEqual(state.history['2026-11-07'], true);
console.log('   -> 5th question answered: Day becomes Active (count = 1) ✓');

// Case 2C: Path completion immediately activates day even with 0 prior questions
let statePath = S.getCleanStreakState(T_SAT);
statePath = S.calculateStreakProgress(statePath, 'path', 1, T_SAT);
assert.strictEqual(statePath.count, 1, 'Completing a path immediately activates day');
assert.strictEqual(statePath.dailyPathsCompleted, 1);
assert.strictEqual(statePath.lastActiveDate, '2026-11-07');
console.log('[PASS] Test 2: Active vs Inactive day criteria verified (5 questions or 1 path).');

// --- TEST 3: Compassion - 1 Grace Day Protection ---
console.log('\n--- Test 3: Compassion - 1 Grace Day Protection ---');
// Day 1: Saturday (active, streak = 1)
const T_SUN = T_SAT + 1 * DAY_MS; // Sunday (missed - 0 activity)
const T_MON = T_SAT + 2 * DAY_MS; // Monday (active with 5 questions)

// Student is active on Monday (skipped Sunday)
for (let q = 0; q < 5; q++) {
  state = S.calculateStreakProgress(state, 'question', 1, T_MON + q * 1000);
}
assert.strictEqual(state.count, 2, 'Grace credit must protect the streak (streak increments to 2)');
assert.strictEqual(state.graceUsedThisWeek, true, 'graceUsedThisWeek must be marked true');
assert.strictEqual(state.brokenRecently, false, 'brokenRecently must be false when grace protects streak');
assert.strictEqual(state.lastActiveDate, '2026-11-09');
console.log('[PASS] Test 3: 1 Grace day in a week protects the streak (streak = 2).');

// --- TEST 4: Streak Broken After 2 Missed Days ---
console.log('\n--- Test 4: Streak Broken After 2 Missed Days ---');
// Student misses Tuesday and Wednesday (2 consecutive missed days)
const T_THU = T_MON + 3 * DAY_MS; // Thursday
for (let q = 0; q < 5; q++) {
  state = S.calculateStreakProgress(state, 'question', 1, T_THU + q * 1000);
}
assert.strictEqual(state.count, 1, 'Streak must reset to 1 after 2 consecutive missed days');
assert.strictEqual(state.bestStreak, 2, 'bestStreak must preserve the record of 2');
assert.strictEqual(state.brokenRecently, true, 'brokenRecently must be true for warm welcome message');
console.log('[PASS] Test 4: Streak broken after 2 missed days (resets to 1, preserves bestStreak).');

// --- TEST 5: Grace Exhaustion in Same Week vs Weekly Renewal ---
console.log('\n--- Test 5: Grace Exhaustion in Same Week vs Weekly Renewal ---');
// Friday of same week: active (streak = 2)
const T_FRI = T_THU + 1 * DAY_MS;
for (let q = 0; q < 5; q++) {
  state = S.calculateStreakProgress(state, 'question', 1, T_FRI + q * 1000);
}
assert.strictEqual(state.count, 2, 'Friday active: streak = 2');

// Miss Saturday, active Sunday of next week (new week begins on Saturday!)
const T_NEXT_SAT = T_FRI + 1 * DAY_MS; // Next Saturday (week renewed!)
const T_NEXT_SUN = T_NEXT_SAT + 1 * DAY_MS; // Next Sunday (missed Saturday)
for (let q = 0; q < 5; q++) {
  state = S.calculateStreakProgress(state, 'question', 1, T_NEXT_SUN + q * 1000);
}
assert.strictEqual(state.count, 3, 'Grace credit renewed in new week, protecting streak to 3');
assert.strictEqual(state.graceUsedThisWeek, true, 'Grace used for the new week');
console.log('[PASS] Test 5: Weekly renewal of grace credit verified.');

// --- TEST 6: Midnight Crossing Clean Partition ---
console.log('\n--- Test 6: Midnight Crossing Clean Partition ---');
let stateMidnight = S.getCleanStreakState(T_SAT);
// 11:58 PM (23:58) on Day 1: 3 questions answered
const T_NIGHT = new Date(2026, 10, 7, 23, 58, 0).getTime();
for (let i = 0; i < 3; i++) {
  stateMidnight = S.calculateStreakProgress(stateMidnight, 'question', 1, T_NIGHT);
}
assert.strictEqual(stateMidnight.dailyQuestionsCount, 3);
assert.strictEqual(stateMidnight.count, 0, 'Day 1 not active with only 3 questions');

// 12:02 AM (00:02) on Day 2: 2 questions answered (crossing midnight)
const T_MIDNIGHT_AFTER = new Date(2026, 10, 8, 0, 2, 0).getTime();
for (let i = 0; i < 2; i++) {
  stateMidnight = S.calculateStreakProgress(stateMidnight, 'question', 1, T_MIDNIGHT_AFTER);
}
assert.strictEqual(stateMidnight.dailyQuestionsCount, 2, 'Daily count reset for new calendar day');
assert.strictEqual(stateMidnight.count, 0, 'Day 2 not yet active with only 2 questions');

// Complete 3 more on Day 2 (total 5 on Day 2)
for (let i = 0; i < 3; i++) {
  stateMidnight = S.calculateStreakProgress(stateMidnight, 'question', 1, T_MIDNIGHT_AFTER + 60000);
}
assert.strictEqual(stateMidnight.count, 1, 'Day 2 becomes active upon reaching 5 questions');
console.log('[PASS] Test 6: Midnight crossing cleanly partitions daily questions by local date.');

// --- TEST 7: Timezone & Local Date Formatting ---
console.log('\n--- Test 7: Timezone & Local Date Formatting ---');
const dateKey = S.getLocalDateKey(Date.UTC(2026, 4, 15, 12, 0, 0));
assert.strictEqual(dateKey.length, 10, 'Format must be YYYY-MM-DD');
assert(dateKey.startsWith('2026-05-'), 'Month and year correctly zero-padded');
console.log('[PASS] Test 7: Local date formatting verified.');

// --- TEST 8: Backward Clock Jump Safety ---
console.log('\n--- Test 8: Backward Clock Jump Safety ---');
const savedCount = state.count;
const T_PAST = T_SAT - 10 * DAY_MS; // 10 days in the past (clock tampering)
const resultPast = S.calculateStreakProgress(state, 'question', 5, T_PAST);
assert.strictEqual(resultPast.count, savedCount, 'Backward clock jump must be ignored');
assert.strictEqual(resultPast.lastActivityTimestamp, state.lastActivityTimestamp, 'Timestamp not rewound');
console.log('[PASS] Test 8: Backward clock jumps ignored safely without data corruption.');

// --- TEST 9: Zero XP Guarantee ---
console.log('\n--- Test 9: Zero XP Guarantee ---');
// Verify streak engine never adds or awards XP
localStorage.clear();
const initialPayload = { schemaVersion: 'scorear_v2', data: { xp: 80, streak: state } };
localStorage.setItem('scorear_student_guest_v1', JSON.stringify(initialPayload));

S.recordQuestionAnswered(T_NEXT_SUN + 1000);
const savedRaw = JSON.parse(localStorage.getItem('scorear_student_guest_v1'));
assert.strictEqual(savedRaw.data.xp, 80, 'Streak engine must NEVER award or modify XP (moral gamification only)');
console.log('[PASS] Test 9: Zero XP guarantee strictly verified.');

// --- TEST 10: Corrupted Data Recovery ---
console.log('\n--- Test 10: Corrupted Data Recovery ---');
const badStreakInputs = [null, undefined, 'broken_string', -999, { count: 'not_a_number' }, { history: 'corrupt' }];
for (const bad of badStreakInputs) {
  const sanitized = S.sanitizeStreak(bad, T_SAT);
  assert(sanitized && typeof sanitized.count === 'number', 'Must sanitize count to number');
  assert(sanitized.count >= 0, 'Count must be non-negative');
  assert(typeof sanitized.history === 'object', 'History must be object');
}
console.log('[PASS] Test 10: Corrupted streak data recovery verified on all edge cases.');

// --- TEST 11: Distinct Questions Requirement (3أ) ---
console.log('\n--- Test 11: Distinct Questions Requirement (3أ) ---');
let stateDistinct = S.getCleanStreakState(T_SAT);
// Answer same question 5 times
for (let i = 0; i < 5; i++) {
  stateDistinct = S.calculateStreakProgress(stateDistinct, 'question', 'q_same_repeat', T_SAT + i * 1000);
}
assert.strictEqual(stateDistinct.dailyQuestionsCount, 1, 'Repeating same question 5 times must only count as 1 distinct question');
assert.strictEqual(stateDistinct.count, 0, 'Day must remain inactive when only 1 distinct question is answered');
console.log('   -> Answering same question 5 times counted as 1 distinct question (Day inactive) ✓');

// Now answer 4 different distinct questions
const distinctIds = ['q_distinct_02', 'q_distinct_03', 'q_distinct_04', 'q_distinct_05'];
distinctIds.forEach((qId, idx) => {
  stateDistinct = S.calculateStreakProgress(stateDistinct, 'question', qId, T_SAT + 10000 + idx * 1000);
});
assert.strictEqual(stateDistinct.dailyQuestionsCount, 5, 'Must reach 5 distinct questions');
assert.strictEqual(stateDistinct.count, 1, 'Day becomes active upon reaching 5 distinct questions');
assert.strictEqual(stateDistinct.lastActiveDate, '2026-11-07');
console.log('[PASS] Test 11: Distinct Questions requirement strictly verified (5 distinct questions required).');

// --- TEST 12: Two Non-Consecutive Missed Days in Same Week (3ب) ---
console.log('\n--- Test 12: Two Non-Consecutive Missed Days in Same Week with 1 Grace Credit (3ب) ---');
// Base: Saturday 2026-11-07 (Day 0)
let stateNonConsec = S.getCleanStreakState(T_SAT);
stateNonConsec = S.calculateStreakProgress(stateNonConsec, 'path', 1, T_SAT); // Saturday: Active (Streak = 1)
assert.strictEqual(stateNonConsec.count, 1);
assert.strictEqual(stateNonConsec.graceUsedThisWeek, false);

// Sunday 2026-11-08 (Day 1): Missed
// Monday 2026-11-09 (Day 2): Active! (First missed day: Grace saves the streak)
stateNonConsec = S.calculateStreakProgress(stateNonConsec, 'path', 1, T_MON);
assert.strictEqual(stateNonConsec.count, 2, 'Monday: Grace day saved streak (streak = 2)');
assert.strictEqual(stateNonConsec.graceUsedThisWeek, true, 'Grace credit used for this week');
assert.strictEqual(stateNonConsec.brokenRecently, false);
console.log('   -> Day 0 (Sat Active) -> Day 1 (Sun Missed) -> Day 2 (Mon Active): Grace saved streak (count = 2) ✓');

// Tuesday 2026-11-10 (Day 3): Missed (Second missed day in the SAME week, non-consecutive!)
// Wednesday 2026-11-11 (Day 4): Active!
const T_WED_12 = T_MON + 2 * DAY_MS;
stateNonConsec = S.calculateStreakProgress(stateNonConsec, 'path', 1, T_WED_12);
assert.strictEqual(stateNonConsec.count, 1, 'Wednesday: Streak MUST break to 1 because grace was already exhausted');
assert.strictEqual(stateNonConsec.brokenRecently, true, 'Must show warm welcome for broken streak');
assert.strictEqual(stateNonConsec.bestStreak, 2, 'Best streak preserved at 2');
console.log('[PASS] Test 12: Two non-consecutive missed days in same week broke streak on second absence.');

// --- TEST 13: Absence After Grace Exhaustion (3ج) ---
console.log('\n--- Test 13: Absence After Grace Credit Exhaustion (3ج) ---');
// Continued from Wednesday: stateNonConsec has count = 1, graceUsedThisWeek = true
// Thursday 2026-11-12 (Day 5): Missed
// Friday 2026-11-13 (Day 6): Active!
const T_FRI_13 = T_WED_12 + 2 * DAY_MS;
stateNonConsec = S.calculateStreakProgress(stateNonConsec, 'path', 1, T_FRI_13);
assert.strictEqual(stateNonConsec.count, 1, 'Friday: Absence after grace exhaustion keeps/resets streak to 1');
assert.strictEqual(stateNonConsec.brokenRecently, true, 'Streak remains in broken-recently state');
assert.strictEqual(stateNonConsec.bestStreak, 2, 'Best streak remains 2');
console.log('[PASS] Test 13: Absence after grace exhaustion strictly resets streak to 1.');

console.log('\n=================================================================');
console.log('   🎉 ALL 13 STREAK ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
console.log('=================================================================');
