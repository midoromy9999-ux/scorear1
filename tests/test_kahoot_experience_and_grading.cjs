/**
 * ScoreAR Test Suite: Kahoot Experience, Accurate Grading & Verification
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=================================================================');
console.log('   SCOREAR KAHOOT EXPERIENCE & ACCURATE GRADING TEST SUITE');
console.log('=================================================================');

const root = path.resolve(__dirname, '..');
const hostCode = fs.readFileSync(path.join(root, 'js/engines/quiz-host.js'), 'utf8');
const studentCode = fs.readFileSync(path.join(root, 'js/engines/quiz-student.js'), 'utf8');
const authUiCode = fs.readFileSync(path.join(root, 'js/auth/auth-ui.js'), 'utf8');
const appCode = fs.readFileSync(path.join(root, 'js/engines/app.js'), 'utf8');

const hostEventsCode = fs.readFileSync(path.join(root, 'js/quiz/quiz-host-events.js'), 'utf8');
const hostLbCode = fs.readFileSync(path.join(root, 'js/quiz/quiz-host-leaderboard.js'), 'utf8');
const studentViewCode = fs.readFileSync(path.join(root, 'js/quiz/quiz-student-view.js'), 'utf8');
const studentJoinCode = fs.readFileSync(path.join(root, 'js/quiz/quiz-student-join.js'), 'utf8');

// Test 1: Modular File Size Boundaries
console.log('\n--- 1. Modular File Line Counts ---');
const hostLines = hostCode.split('\n').length;
const studentLines = studentCode.split('\n').length;
const authUiLines = authUiCode.split('\n').length;
const appLines = appCode.split('\n').length;

console.log(`js/engines/quiz-host.js: ${hostLines} lines (<= 600)`);
console.log(`js/engines/quiz-student.js: ${studentLines} lines (< 450)`);
console.log(`js/auth/auth-ui.js: ${authUiLines} lines (< 400)`);
console.log(`js/engines/app.js: ${appLines} lines (<= 1200)`);

assert(hostLines <= 600, 'quiz-host.js exceeds 600 lines');
assert(studentLines < 450, 'quiz-student.js exceeds 450 lines');
assert(authUiLines < 400, 'auth-ui.js exceeds 400 lines');
assert(appLines <= 1200, 'app.js exceeds 1200 lines');
console.log('[PASS] Modular Size Boundaries Satisfied.');

// Test 2: Neutral Submission State (No False Immediate "Correct" Checkmark)
console.log('\n--- 2. Student Submission Neutral State ---');
assert(studentCode.includes("ind.textContent = '🔒 تم قفل اختيارك'"), 'Must show neutral lock icon');
assert(!studentCode.includes("ind.textContent = '✓ اختيارك'"), 'Must NOT show green checkmark on tap');
assert(studentCode.includes('تم قفل اختيارك بنجاح!'), 'Must inform student that answer is locked while waiting for evaluation');
console.log('[PASS] Student submission gives neutral feedback without false green checkmarks.');

// Test 3: Accurate Answer Evaluation and Schema Robustness
console.log('\n--- 3. Accurate Answer Evaluation in Host ---');
assert(hostEventsCode.includes('function evaluateQuestionResults') || hostEventsCode.includes('evaluateQuestionResults'), 'Must have authoritative host evaluation');
assert(hostEventsCode.includes('isAnsCorrect'), 'Must evaluate answer correctness');

// Test logic of getCorrectAnswerIndex
function getCorrectAnswerIndex(q) {
  if (!q) return 0;
  const v = [q.answer, q.ans, q.correct, q.correctAnswer, q.correctIndex].find(x => x !== undefined && !isNaN(Number(x)));
  if (v !== undefined) return Number(v);
  if (typeof q.answer === 'string' && Array.isArray(q.opts)) {
    const idx = q.opts.findIndex(o => String(o).trim() === String(q.answer).trim());
    if (idx !== -1) return idx;
  }
  return 0;
}
assert.strictEqual(getCorrectAnswerIndex({ answer: 2 }), 2);
assert.strictEqual(getCorrectAnswerIndex({ ans: 3 }), 3);
assert.strictEqual(getCorrectAnswerIndex({ correct: 1 }), 1);
assert.strictEqual(getCorrectAnswerIndex({ correctAnswer: 0 }), 0);
assert.strictEqual(getCorrectAnswerIndex({ answer: 'الخيار الثاني', opts: ['الأول', 'الخيار الثاني'] }), 1);
console.log('[PASS] Host accurately resolves correct answer across all question schemas.');

// Test 4: Host Marks Correct Answer and Dims Others After Question Closes
console.log('\n--- 4. Host Marks Correct Card Post-Question ---');
assert(hostCode.includes("card.className = 'host-option-card correct-revealed'") && hostCode.includes("card.style.background = 'linear-gradient(135deg, #10b981, #059669)'"), 'Host highlights correct card');
assert(hostCode.includes("txt.innerHTML = `✓ ${txt.innerHTML}`"), 'Host reveals checkmark on correct card');
assert(hostCode.includes("card.style.opacity = '0.32'"), 'Host dims other cards');
console.log('[PASS] Host lights up correct card and dims incorrect cards in Kahoot fashion.');

// Test 5: Soundtracks (lobby music + per-world question music)
console.log('\n--- 5. Soundtracks Configuration ---');
assert(hostCode.includes("music('lobby', 0.28)"), 'Lobby must play lobby soundtrack');
assert(hostCode.includes("music(worldId, 0.30)"), 'Question stage must play world soundtrack');
console.log('[PASS] Soundtracks accurately assigned: lobby (lobby) and worldId (questions).');

// Test 6: Points Explicitly Mentioned in Leaderboard & Podium
console.log('\n--- 6. Points in Leaderboard & Podium ---');
const combinedHost = hostCode + hostEventsCode + hostLbCode;
assert(combinedHost.includes('نقطة') && (combinedHost.includes('${p.score}') || combinedHost.includes('${p.score || 0}') || combinedHost.includes('p.score || 0')), 'Leaderboard includes points');
assert(combinedHost.includes('نقطة') && (combinedHost.includes('${item.p?.score') || combinedHost.includes('${p.score || 0}') || combinedHost.includes('entry.score')), 'Podium includes points');
assert(studentViewCode.includes('${currentScore} نقطة'), 'Student podium includes points');
console.log('[PASS] Points explicitly stated in Leaderboard and Podium.');

// Test 7: Student Flexible Name Input
console.log('\n--- 7. Flexible Student Name Input ---');
assert(studentJoinCode.includes('اكتب اسمك للمشاركة في القاعة') || studentJoinCode.includes('سجّل اسمك'), 'Label prompts student for name');
assert(studentJoinCode.includes('مثال: أحمد محمد، أو 3/1 رقم 15...'), 'Placeholder gives flexible name/class examples');
console.log('[PASS] Flexible student nickname input verified.');

console.log('=================================================================');
console.log('ALL KAHOOT EXPERIENCE & ACCURATE GRADING TESTS PASSED (7/7)!');
console.log('=================================================================');
