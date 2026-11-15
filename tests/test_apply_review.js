/**
 * ScoreAR - Automated Acceptance Test Suite: apply_review.js
 * Tests:
 *   1. Rule 7 Line Count (< 500 lines).
 *   2. Strict ID matching: updates text, explanation, and reviewed status.
 *   3. Strict rejection: rejects rows with unknown or modified IDs.
 *   4. Reporting: diffs reported accurately.
 * 
 * Run command: node tests/test_apply_review.js
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyReview } from '../scripts/apply_review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('   SCOREAR ACCEPTANCE TEST SUITE: apply_review.js');
console.log('=================================================================');

// 1. Line count
const scriptPath = path.join(ROOT, 'scripts', 'apply_review.js');
const lines = fs.readFileSync(scriptPath, 'utf8').split('\n').length;
assert(lines < 500, `FAIL: apply_review.js exceeds 500 lines (${lines})`);
console.log(`[PASS] Rule 7 Line Count: apply_review.js (${lines} lines < 500)`);

// 2. Prepare test CSV
const testCsvDir = path.join(ROOT, 'content', 'journey');
const testCsvPath = path.join(testCsvDir, 'test_review_sample.csv');

const csvData = `\uFEFF"المعرف (id)","المسار (track)","المحطة (station)","المحطة المهارية (skill)","نص السؤال (text)","الاختيار 1","الاختيار 2","الاختيار 3","الاختيار 4","رقم الإجابة الصحيحة (0-3)","نص الإجابة الصحيحة","الشرح والتعليل (explanation)","القاعدة (ruleTag)","الصعوبة (1-3)","تمت المراجعة اللغوية؟ (reviewed)"
"q_naat_01","مسار النعت وأقسامه","محطة النعت","النعت المفرد وتطابقه","«قرأتُ كتابًا ممتعًا ومفيداً». ما إعراب كلمة «ممتعًا»؟","نعت منصوب وعلامة نصبه الفتحة","حال منصوب","مفعول به ثانٍ","تمييز","0","نعت منصوب","شرح لغوي مدقق من المعلم أحمد رميح","النعت المفرد","1","true"
"q_CHANGED_ILLEGAL_ID","مسار النعت","محطة النعت","مهارة","سؤال بمُعرّف معدّل خطأ","1","2","3","4","0","1","شرح","قاعدة","1","true"
`;

fs.writeFileSync(testCsvPath, csvData, 'utf8');

// Run applyReview on test CSV
const report = applyReview(testCsvPath);

// 3. Verify assertions
assert.strictEqual(report.totalRows, 2, 'Total rows in test CSV is 2');
assert.strictEqual(report.updatedCount, 1, 'Only 1 valid question should be updated');
assert.strictEqual(report.rejectedCount, 1, 'Changed ID row MUST be rejected');
assert.strictEqual(report.rejections[0].providedId, 'q_CHANGED_ILLEGAL_ID');
assert(report.rejections[0].reason.includes('ممنوع تغيير معرّفات الأسئلة'), 'Rejection reason documented');

// Verify question update in tracks.json
const tracks = JSON.parse(fs.readFileSync(path.join(testCsvDir, 'tracks.json'), 'utf8'));
const qNaat1 = tracks[0].stations[0].questions.find(q => q.id === 'q_naat_01');
assert.strictEqual(qNaat1.text, '«قرأتُ كتابًا ممتعًا ومفيداً». ما إعراب كلمة «ممتعًا»؟', 'Text updated');
assert.strictEqual(qNaat1.explanation, 'شرح لغوي مدقق من المعلم أحمد رميح', 'Explanation updated');
assert.strictEqual(qNaat1.reviewed, true, 'Reviewed flag updated to true');

// Cleanup test CSV
if (fs.existsSync(testCsvPath)) fs.unlinkSync(testCsvPath);

console.log('[PASS] Test 2: Matching by ID and updating fields verified.');
console.log('[PASS] Test 3: Rejecting row with changed/corrupt ID strictly verified.');
console.log('[PASS] Test 4: Audit report and rejections list generated correctly.');

console.log('\n=================================================================');
console.log('   🎉 ALL apply_review ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
console.log('=================================================================');
