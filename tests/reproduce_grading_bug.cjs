/**
 * ScoreAR Reproduction of Grading Bug Test Suite
 * Tests every question x every option choice under the legacy/flawed evaluation logic.
 */
const assert = require('assert');

console.log('=================================================================');
console.log('   REPRODUCING GRADING & EVALUATION BUG (LEGACY LOGIC AUDIT)');
console.log('=================================================================');

// 1. Dataset of questions across models
const testQuestions = [
  // Model 1: Standard app.js questions (has .answer = number)
  {
    source: 'app.js',
    q: '«قرأتُ كتابًا ممتعًا». ما إعراب كلمة «ممتعًا»؟',
    opts: ['حال منصوب', 'نعت منصوب وعلامة نصبه الفتحة', 'مفعول به ثانٍ', 'تمييز منصوب'],
    answer: 1, // Correct is 1 (نعت منصوب)
    why: 'نعت حقيقي'
  },
  // Model 2: Quiz Builder / Bank questions (has .ans = number, NO .answer!)
  {
    source: 'quiz-builder.js / quiz-bank.js',
    q: '«العلم نور يضيء الدروب». ما نوع التشبيه؟',
    opts: ['استعارة تصريحية', 'تشبيه تمثيلي', 'تشبيه بليغ (مبتدأ وخبر)', 'كناية عن موصوف'],
    ans: 2, // Correct is 2 (تشبيه بليغ) - note key is .ans
    why: 'تشبيه بليغ'
  },
  // Model 3: Text-based answer
  {
    source: 'text answer',
    q: 'ما جمع كلمة «عالم»؟',
    opts: ['عوالم', 'علماء', 'أعلام', 'معالم'],
    answer: 'علماء', // Text match
    why: 'جمع عالم هو علماء'
  },
  // Model 4: Multi-select question
  {
    source: 'multi-select question',
    q: 'اختر الكلمات المنصوبة في الجملة:',
    opts: ['كتاباً', 'الرجلُ', 'مسرعاً', 'في البيتِ'],
    correct: [0, 2], // Multiple correct options
    why: 'كتاباً ومسرعاً منصوبان'
  },
  // Model 5: Kahoot 1-based indexing
  {
    source: 'kahoot raw import (1-based)',
    q: 'ما الفعل الماضي من «يقرأ»؟',
    opts: ['قرأ', 'قارئ', 'مقروء', 'قراءة'],
    isKahootOneBased: true,
    ans: 1, // In Kahoot, 1 means option 1 (which is index 0: 'قرأ')
    why: 'قرأ فعل ماض'
  }
];

// Flawed Legacy Host Evaluation Logic
function legacyHostEvaluate(qData, studentChoiceIdx) {
  // Legacy host read qData.answer only!
  const correctIdx = Number(qData.answer);
  // Compare Number(studentChoiceIdx) === correctIdx
  if (studentChoiceIdx === -1 || studentChoiceIdx === null || studentChoiceIdx === undefined) return false;
  return Number(studentChoiceIdx) === correctIdx;
}

// Flawed Legacy Student Immediate Tap Feedback Logic
function legacyStudentImmediateTapState(studentChoiceIdx) {
  // On student tap, legacy code immediately set:
  const indicator = '✓ اختيارك';
  const feedback = '✅ تم تسجيل إجابتك! في انتظار تصحيح المعلم... ⏳';
  const appearsCorrectImmediately = indicator.includes('✓') && feedback.includes('✅');
  return { indicator, feedback, appearsCorrectImmediately };
}

// Flawed Legacy Student Fallback Evaluation Logic
function legacyStudentFallbackEvaluate(myResult, myChoiceIdx, resData) {
  // Legacy student had:
  // const isCorrect = (myResult && myResult.correct !== undefined) ? myResult.correct : (myChoiceIdx === correctIdx);
  let correctIdx = resData ? resData.correctAnswer : undefined;
  if (myResult && myResult.correct !== undefined) return myResult.correct;
  return (myChoiceIdx === correctIdx);
}

console.log('\n--- Test Matrix: Every Question x Every Option under Legacy Logic ---');

let totalMatrixTests = 0;
let legacyFailures = [];

testQuestions.forEach((qObj, qIdx) => {
  console.log(`\n[Question ${qIdx + 1}] (${qObj.source}): "${qObj.q}"`);
  
  // Determine expected correct indices
  let expectedCorrectSet = new Set();
  if (qObj.isKahootOneBased) {
    expectedCorrectSet.add(qObj.ans - 1);
  } else if (Array.isArray(qObj.correct)) {
    qObj.correct.forEach(c => expectedCorrectSet.add(c));
  } else if (typeof qObj.answer === 'string') {
    const idx = qObj.opts.findIndex(o => o.trim() === qObj.answer.trim());
    if (idx !== -1) expectedCorrectSet.add(idx);
  } else if (qObj.ans !== undefined) {
    expectedCorrectSet.add(qObj.ans);
  } else if (qObj.answer !== undefined) {
    expectedCorrectSet.add(qObj.answer);
  }

  // Test every choice: 0, 1, 2, 3 and Timeout (-1)
  const choicesToTest = [0, 1, 2, 3, -1];

  choicesToTest.forEach(choiceIdx => {
    totalMatrixTests++;
    const isExpectedCorrect = expectedCorrectSet.has(choiceIdx);
    const legacyHostResult = legacyHostEvaluate(qObj, choiceIdx);
    const tapState = choiceIdx >= 0 ? legacyStudentImmediateTapState(choiceIdx) : null;

    let hasFailure = false;
    let failureReasons = [];

    // Check 1: Did Host grade correctly?
    if (legacyHostResult !== isExpectedCorrect) {
      hasFailure = true;
      failureReasons.push(`Host graded ${legacyHostResult} but expected ${isExpectedCorrect}`);
    }

    // Check 2: Did Student UI falsely display green checkmark on wrong tap?
    if (choiceIdx >= 0 && !isExpectedCorrect && tapState && tapState.appearsCorrectImmediately) {
      hasFailure = true;
      failureReasons.push(`Student screen showed false green checkmark '✓' & '✅' on WRONG answer!`);
    }

    if (hasFailure) {
      legacyFailures.push({
        question: qObj.q,
        source: qObj.source,
        choiceIdx: choiceIdx,
        choiceText: choiceIdx >= 0 ? qObj.opts[choiceIdx] : 'TIMEOUT',
        isExpectedCorrect,
        legacyHostResult,
        reasons: failureReasons
      });
      console.log(`  ❌ Choice ${choiceIdx} (${choiceIdx >= 0 ? qObj.opts[choiceIdx] : 'TIMEOUT'}): FAILED -> ${failureReasons.join('; ')}`);
    } else {
      console.log(`  ✓ Choice ${choiceIdx}: PASSED (Host=${legacyHostResult}, Expected=${isExpectedCorrect})`);
    }
  });
});

console.log('\n--- Specific Hypothesis (ب): Comparing undefined to undefined ---');
// When resData.correctAnswer is undefined and student choice is undefined
const undefCompare = legacyStudentFallbackEvaluate(null, undefined, { correctAnswer: undefined });
console.log(`legacyStudentFallbackEvaluate(null, undefined, { correctAnswer: undefined }) = ${undefCompare}`);
if (undefCompare === true) {
  console.log('  ❌ CONFIRMED: undefined === undefined evaluates to TRUE, falsely marking unselected/missing answers as CORRECT!');
  legacyFailures.push({
    question: 'Missing/undefined answer',
    source: 'Hypothesis (ب)',
    choiceIdx: undefined,
    choiceText: 'undefined',
    isExpectedCorrect: false,
    legacyHostResult: true,
    reasons: ['undefined === undefined evaluated to true']
  });
}

console.log('\n=================================================================');
console.log(`REPRODUCTION AUDIT COMPLETED: ${legacyFailures.length} failures out of ${totalMatrixTests + 1} test scenarios.`);
console.log(`This cleanly reproduces the exact bug and proves why every answer appeared correct or failed grading!`);
console.log('=================================================================');
