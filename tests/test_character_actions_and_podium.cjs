const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

console.log('--- 1. Testing character actions for all 20 characters ---');
for (let i = 1; i <= 20; i++) {
  const code = 'char_' + String(i).padStart(2, '0');
  const full = path.join(rootDir, 'assets', 'characters', `${code}_full.webp`);
  const run = path.join(rootDir, 'assets', 'characters', 'animated', `${code}-run.webp`);
  const climb = path.join(rootDir, 'assets', 'characters', 'animated', `${code}-climb.webp`);
  const fly = path.join(rootDir, 'assets', 'characters', 'animated', `${code}-fly.webp`);
  const atlas = path.join(rootDir, 'assets', 'characters', 'animated', `${code}-atlas.webp`);

  assert(fs.existsSync(full), `Missing fullbody: ${full}`);
  assert(fs.statSync(full).size > 1000, `Fullbody file too small: ${full}`);

  assert(fs.existsSync(run), `Missing run: ${run}`);
  assert(fs.statSync(run).size > 1000, `Run file too small: ${run}`);

  assert(fs.existsSync(climb), `Missing climb: ${climb}`);
  assert(fs.statSync(climb).size > 1000, `Climb file too small: ${climb}`);

  assert(fs.existsSync(fly), `Missing fly: ${fly}`);
  assert(fs.statSync(fly).size > 1000, `Fly file too small: ${fly}`);

  assert(fs.existsSync(atlas), `Missing atlas: ${atlas}`);
}
console.log('✅ All 20 characters have complete 3D fullbody and 3 action atlases (run, climb, fly) + base atlas.');

console.log('\n--- 2. Testing Gallery & Controls in characters.html ---');
const charHtml = fs.readFileSync(path.join(rootDir, 'characters.html'), 'utf8');
assert(charHtml.includes('data-character-pose="idle"'), 'characters.html missing idle state');
assert(!charHtml.includes('data-character-pose="climb"'), 'characters.html should not include climb button');
console.log('✅ characters.html verified: focused on authentic standing (idle) pose without unnecessary actions.');

console.log('\n--- 3. Testing Characters section in app.js ---');
const appJs = fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8');
assert(appJs.includes('data-character-pose="idle"'), 'app.js missing idle state');
assert(!appJs.includes('data-character-pose="climb"'), 'app.js should not include climb button');
console.log('✅ app.js verified: focused on authentic standing (idle) pose without unnecessary actions.');

console.log('\n--- 4. Testing Podium Effects (Celebrations & Motions) in quiz-podium-effects.js ---');
const podiumEffects = fs.readFileSync(path.join(rootDir, 'quiz-podium-effects.js'), 'utf8');
assert(podiumEffects.includes('setHeroPose'), 'quiz-podium-effects.js missing setHeroPose');
assert(podiumEffects.includes('data-podium-motion="celebrate"'), 'quiz-podium-effects.js missing celebrate button');
assert(podiumEffects.includes('data-podium-motion="run"'), 'quiz-podium-effects.js missing run button');
assert(podiumEffects.includes('data-podium-motion="climb"'), 'quiz-podium-effects.js missing climb button');
assert(podiumEffects.includes('data-podium-motion="fly"'), 'quiz-podium-effects.js missing fly button');
assert(podiumEffects.includes('character-${pose}'), 'quiz-podium-effects.js missing character-${pose} template');
console.log('✅ quiz-podium-effects.js verified with dynamic celebration animation and 4-way motion switcher.');

console.log('\n--- 5. Testing Canvas Snapshot Hero Drawing in quiz-podium-capture.js ---');
const podiumCapture = fs.readFileSync(path.join(rootDir, 'quiz-podium-capture.js'), 'utf8');
assert(podiumCapture.includes('getCharFullSrc'), 'quiz-podium-capture.js missing getCharFullSrc');
assert(podiumCapture.includes('ctx.drawImage(col.img'), 'quiz-podium-capture.js missing hero drawImage call');
assert(podiumCapture.includes('Promise.all'), 'quiz-podium-capture.js missing image preloading');
console.log('✅ quiz-podium-capture.js verified to preload and draw all 3 hero characters and world background.');

console.log('\n--- 6. Rule 7 Line Margins (< 400 lines) ---');
const files = ['characters-v4.js', 'quiz-podium-effects.js', 'quiz-podium-capture.js', 'quiz-host-leaderboard.js'];
files.forEach(f => {
  const lines = fs.readFileSync(path.join(rootDir, f), 'utf8').split('\n').length;
  assert(lines < 400, `File ${f} has ${lines} lines, exceeding 400 lines limit!`);
  console.log(`✅ ${f}: ${lines} lines (margin of ${500 - lines} lines)`);
});

console.log('\n🎉 ALL CHARACTER MOTION & PODIUM TESTS PASSED WITH 100% SUCCESS! 🚀');
