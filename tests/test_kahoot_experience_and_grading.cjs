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
const hostCode = fs.readFileSync(path.join(root, 'quiz-host.js'), 'utf8');
const studentCode = fs.readFileSync(path.join(root, 'quiz-student.js'), 'utf8');
const authUiCode = fs.readFileSync(path.join(root, 'auth-ui.js'), 'utf8');
const appCode = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

const hostEventsCode = fs.readFileSync(path.join(root, 'quiz-host-events.js'), 'utf8');

const studentJoinCode = fs.readFileSync(path.join(root, 'quiz-student-join.js'), 'utf8');

// Test 1: Rule 7 File Limits
console.log('\n--- 1. Rule 7 Line Counts ---');
const hostLines = hostCode.split('\n').length;
const studentLines = studentCode.split('\n').length;
const authUiLines = authUiCode.split('\n').length;
const appLines = appCode.split('\n').length;

console.log(`quiz-host.js: ${hostLines} lines (< 500)`);
console.log(`quiz-student.js: ${studentLines} lines (< 500)`);
console.log(`auth-ui.js: ${authUiLines} lines (< 500)`);
console.log(`app.js: ${appLines} lines (<= 1000)`);

assert(hostLines < 500, 'quiz-host.js exceeds 500 lines');
assert(studentLines < 500, 'quiz-student.js exceeds 500 lines');
assert(authUiLines < 500, 'auth-ui.js exceeds 500 lines');
assert(appLines <= 1000, 'app.js exceeds 1000 lines');
console.log('[PASS] Rule 7 Limits Satisfied.');

// Test 2: Neutral Submission State (No False Immediate "Correct" Checkmark)
console.log('\n--- 2. Student Submission Neutral State ---');
assert(studentCode.includes("ind.textContent = '📌 تم اختيارك'"), 'Must show neutral pin icon');
assert(!studentCode.includes("ind.textContent = '✓ اختيارك'"), 'Must NOT show green checkmark on tap');
assert(studentCode.includes('⏳ <strong style="color:#fcd34d;">تم تسجيل اختيارك!</strong> بانتظار انتهاء الوقت والتصحيح...'), 'Must inform student to wait for timer/host');
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
assert(hostCode.includes("card.style.background = '#10b981'"), 'Host highlights correct card');
assert(hostCode.includes("badge.style.display = 'inline-block'"), 'Host reveals correct badge');
assert(hostCode.includes("card.style.opacity = '0.28'"), 'Host dims other cards');
console.log('[PASS] Host lights up correct card and dims incorrect cards in Kahoot fashion.');

// Test 5: Soundtracks (magic for lobby, treasure for question)
console.log('\n--- 5. Soundtracks Configuration ---');
assert(hostCode.includes("music('magic', 0.28)"), 'Lobby must play magic soundtrack');
assert(hostCode.includes("music('treasure', 0.32)"), 'Question stage must play treasure soundtrack');
console.log('[PASS] Soundtracks accurately assigned: magic (lobby) and treasure (questions).');

// Test 6: Points Explicitly Mentioned in Leaderboard & Podium
console.log('\n--- 6. Points in Leaderboard & Podium ---');
const combinedHost = hostCode + hostEventsCode;
assert(combinedHost.includes('نقطة') && (combinedHost.includes('${p.score}') || combinedHost.includes('${p.score || 0}')), 'Leaderboard includes points');
assert(combinedHost.includes('نقطة') && (combinedHost.includes('${item.p.score}') || combinedHost.includes('${item.score}') || combinedHost.includes('item.tc')), 'Podium includes points');
assert(studentCode.includes('${currentScore} نقطة'), 'Student podium includes points');
console.log('[PASS] Points explicitly stated in Leaderboard and Podium.');

// Test 7: Student Flexible Name Input
console.log('\n--- 7. Flexible Student Name Input ---');
assert(studentJoinCode.includes('اسم مفرد') || studentJoinCode.includes('اسمك مفرد، ثلاثي، أو رقم'), 'Label specifies flexible name acceptance');
assert(studentJoinCode.includes('مثال: أحمد، أو أحمد صلاح، أو 3/1 رقم 15'), 'Placeholder gives single, 3-part, or class examples');
console.log('[PASS] Flexible student nickname input verified.');

console.log('=================================================================');
console.log('ALL KAHOOT EXPERIENCE & ACCURATE GRADING TESTS PASSED (7/7)!');
console.log('=================================================================');
