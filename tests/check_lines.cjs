const fs = require('fs');

const files = [
  { name: 'quiz-evaluator.js', limit: 500 },
  { name: 'quiz-host.js', limit: 500 },
  { name: 'quiz-student.js', limit: 500 },
  { name: 'auth-ui.js', limit: 500 },
  { name: 'app.js', limit: 1000 }
];

files.forEach(f => {
  const count = fs.readFileSync(f.name, 'utf8').split('\n').length;
  console.log(`${f.name}: ${count} lines (limit: <= ${f.limit}) => ${count <= f.limit ? 'OK' : 'EXCEEDED'}`);
});
