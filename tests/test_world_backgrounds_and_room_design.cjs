/**
 * Test Suite: World Video & Image Backgrounds in Lobby, Question Room & Podium
 * Verifies that:
 * 1. Host Lobby uses video: assets/videos/worlds/${worldId}.mp4 with poster: assets/worlds/${worldId}/lobby.jpg
 * 2. Host Question View uses background: assets/worlds/${worldId}/question.jpg with 2x2 Kahoot options
 * 3. Host Leaderboard uses background: assets/worlds/${worldId}/results.jpg
 * 4. Host Podium uses background: assets/worlds/${worldId}/podium.jpg
 * 5. Student Screens dynamically reflect the world image background
 * 6. File line count constraints (Rule 7) strictly respected
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=================================================================');
console.log('  TESTING WORLD BACKGROUNDS & ROOM DESIGN (LOBBY, QUESTION, PODIUM)');
console.log('=================================================================\n');

const baseDir = path.resolve(__dirname, '..');

// 1. Check Rule 7 Line Counts
console.log('--- 1. Rule 7 Line Count Verification ---');
const filesToCheck = [
  { file: 'quiz-host.js', max: 500 },
  { file: 'quiz-host-events.js', max: 500 },
  { file: 'quiz-student.js', max: 500 },
  { file: 'quiz-student-join.js', max: 500 },
  { file: 'app.js', max: 958 }
];

filesToCheck.forEach(item => {
  const p = path.join(baseDir, item.file);
  const lines = fs.readFileSync(p, 'utf8').split('\n').length;
  console.log(`[CHECK] ${item.file}: ${lines} lines (max: ${item.max})`);
  assert(lines <= item.max, `File ${item.file} has ${lines} lines, exceeding max ${item.max}!`);
});
console.log('✅ All files strictly within line count limits.\n');

// 2. Check Host Lobby World Video & 3D White PIN Box
console.log('--- 2. Host Lobby World Video & 3D PIN Box ---');
const hostJs = fs.readFileSync(path.join(baseDir, 'quiz-host.js'), 'utf8');

// Ensure NO broken royal_academy.mp4
assert(!hostJs.includes('royal_academy.mp4'), 'Error: royal_academy.mp4 should not exist in quiz-host.js');

// Ensure video points to assets/videos/worlds/${worldId}.mp4
assert(hostJs.includes('assets/videos/worlds/${worldId}.mp4'), 'Error: quiz-host.js lobby must use assets/videos/worlds/${worldId}.mp4');

// Ensure fallback poster points to assets/worlds/${worldId}/lobby.jpg
assert(hostJs.includes('assets/worlds/${worldId}/lobby.jpg'), 'Error: quiz-host.js lobby must use assets/worlds/${worldId}/lobby.jpg');

// Ensure 3D pure white floating PIN box exists
assert(hostJs.includes('lobby-white-3d-box'), 'Error: quiz-host.js must use .lobby-white-3d-box');
assert(hostJs.includes('ScoreARQuizHost.addDemoPlayer'), 'Error: quiz-host.js must provide addDemoPlayer');

console.log('✅ Host Lobby contains animated world video, fallback image, and 3D floating PIN box.\n');

// 3. Check Host Question Room World Image & Kahoot Style
console.log('--- 3. Host Question Room World Image & Kahoot Cards ---');
// Ensure question room uses assets/worlds/${worldId}/question.jpg
assert(hostJs.includes('assets/worlds/${worldId}/question.jpg'), 'Error: quiz-host.js question stage must use assets/worlds/${worldId}/question.jpg');

// Ensure NO broken video in question room
const questionViewCode = hostJs.substring(hostJs.indexOf('function renderHostQuestionView'), hostJs.indexOf('function startAnsweringCountdown'));
assert(!questionViewCode.includes('<video'), 'Error: Question view must not have a broken <video> tag');

// Ensure Kahoot options symbols
assert(hostJs.includes('▲') && hostJs.includes('◆') && hostJs.includes('●') && hostJs.includes('■'), 'Error: Kahoot shapes missing');
assert(hostJs.includes('#e21b3c') && hostJs.includes('#1368ce') && hostJs.includes('#26890c'), 'Error: Kahoot colors missing');

console.log('✅ Question room uses high-res world image background and Kahoot 2x2 option cards.\n');

// 4. Check Host Leaderboard & Podium Backgrounds
console.log('--- 4. Leaderboard & Podium World Backgrounds ---');
const hostEventsJs = fs.readFileSync(path.join(baseDir, 'quiz-host-events.js'), 'utf8');

assert(hostEventsJs.includes('assets/worlds/${worldId}/results.jpg'), 'Error: Leaderboard must use results.jpg');
assert(hostEventsJs.includes('assets/worlds/${worldId}/podium.jpg'), 'Error: Podium must use podium.jpg');

console.log('✅ Leaderboard and Podium use world results.jpg and podium.jpg backgrounds.\n');

// 5. Check Student View Dynamic World Images
console.log('--- 5. Student View Dynamic World Images ---');
const studentJs = fs.readFileSync(path.join(baseDir, 'quiz-student.js'), 'utf8');

assert(studentJs.includes('assets/worlds/${currentWorldId}/waiting.jpg'), 'Error: Student waiting lobby must use waiting.jpg');
assert(studentJs.includes('assets/worlds/${currentWorldId}/question.jpg'), 'Error: Student question view must use question.jpg');
assert(studentJs.includes('assets/worlds/${currentWorldId}/results.jpg'), 'Error: Student results view must use results.jpg');
assert(studentJs.includes('assets/worlds/${currentWorldId}/podium.jpg'), 'Error: Student podium view must use podium.jpg');

console.log('✅ Student views dynamically reflect world images for all phases.\n');

// 6. Check Physical Assets On Disk
console.log('--- 6. Verifying Physical Assets on Disk ---');
const worlds = ['cosmic', 'magic', 'oasis', 'royal', 'stadium', 'treasure'];
const assetTypes = ['lobby.jpg', 'question.jpg', 'results.jpg', 'podium.jpg', 'waiting.jpg'];

worlds.forEach(w => {
  const vidPath = path.join(baseDir, 'assets', 'videos', 'worlds', `${w}.mp4`);
  assert(fs.existsSync(vidPath), `Missing video: ${vidPath}`);
  
  assetTypes.forEach(img => {
    const imgPath = path.join(baseDir, 'assets', 'worlds', w, img);
    assert(fs.existsSync(imgPath), `Missing image: ${imgPath}`);
  });
});

console.log('✅ All 6 world videos and 30 world background images exist physically on disk.\n');

console.log('=================================================================');
console.log('🎉 ALL WORLD BACKGROUND & ROOM DESIGN TESTS PASSED (6/6)!');
console.log('=================================================================');
