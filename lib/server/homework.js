import fs from 'node:fs';
import vm from 'node:vm';
let evaluator;
function getEvaluator() {
  if (!evaluator) {
    const context = { console, module: { exports: {} } }; context.globalThis = context;
    vm.runInNewContext(fs.readFileSync(new URL('../../js/engines/quiz-evaluator.js', import.meta.url), 'utf8'), context);
    evaluator = context.ScoreAREvaluator || context.module.exports;
  }
  return evaluator;
}
export function publicTask(task) {
  return {id:task.id,type:task.type,title:task.title,prompt:task.prompt || '',deadline:task.deadline || null,createdAt:task.createdAt,
    questions:task.type==='quiz'?(task.questions || []).map((q,i)=>{
      const n=getEvaluator().normalizeQuestion(q);
      return {id:n.id || String(i),text:n.text,options:n.options,multiple:n.correct.length>1};
    }):null};
}
export function gradeTask(task, choices) {
  if (!Array.isArray(task.questions) || task.questions.length<1 || !Array.isArray(choices) || choices.length !== task.questions.length || choices.length>100) throw Object.assign(new Error('الإجابات غير مكتملة.'),{status:400});
  let correctCount=0;
  const e=getEvaluator();
  task.questions.forEach((q,i)=>{
    const n=e.normalizeQuestion(q),choice=choices[i];
    const selected=Array.isArray(choice)?choice:[choice];
    if (!selected.length || new Set(selected).size!==selected.length || selected.some(i=>!Number.isInteger(i)||i<0||i>=n.options.length)) throw Object.assign(new Error('اختيار غير صحيح.'),{status:400});
    if(e.isCorrect(n,choice))correctCount++;
  });
  return {score:Math.round(correctCount/choices.length*100),correctCount,totalQuestions:choices.length};
}
