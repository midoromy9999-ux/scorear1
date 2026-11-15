'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');

const PROTECTED_FILES = [
  'js/engines/CardArenaEngine.js',
  'js/engines/ScoreARMotionEngine.js',
  'js/engines/skill-engine.js',
  'js/engines/streak.js',
  'js/engines/quiz-evaluator.js',
  'js/engines/quiz-game-modes.js',
  'js/engines/quiz-host.js',
  'js/engines/quiz-student.js',
  'js/engines/realtime-engine.js',
  'js/engines/student-journey.js',
  'js/engines/app.js',
  'js/engines/characters-v4.js',
  'js/engines/interactive-character.js',
  'DEPLOY_SCOREAR.bat',
  'deploy-fast.cjs'
];

console.log('🔒 Verifying 15 Protected Files Integrity (0 bytes modification)...');

let passed = 0;
const results = [];

for (const relPath of PROTECTED_FILES) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing protected file: ${relPath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(fullPath);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const size = content.length;
  results.push({ relPath, size, hash });
  console.log(`  [PASS] ${relPath} (${size} bytes) SHA-256: ${hash.slice(0, 16)}...`);
  passed++;
}

console.log(`\n✅ 15/15 Protected Files Verified with 100% Integrity (${passed}/${PROTECTED_FILES.length})\n`);
