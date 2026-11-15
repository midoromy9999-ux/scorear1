const assert = require('assert');
const fs = require('fs');

const code = fs.readFileSync('ScoreARMotionEngine.js', 'utf8');

// Check that ACTIONS.walk has frames: [1, 0, 2, 0]
assert(code.includes('walk: { duration: 1200, loop: true, frames: [1, 0, 2, 0]'), 'Walk must have frames [1, 0, 2, 0]');

// Check that ACTIONS.celebrate has frames: [0, 3, 3, 0]
assert(code.includes('celebrate: { duration: 1600, loop: true, frames: [0, 3, 3, 0]'), 'Celebrate must have frames [0, 3, 3, 0]');

// Check that ACTIONS.idle has frames: [0, 0, 0, 0]
assert(code.includes('idle: { duration: 2000, loop: true, frames: [0, 0, 0, 0]'), 'Idle must have frames [0, 0, 0, 0]');

// Check that tick() uses cfg.frames
assert(code.includes('const frameNum = cfg.frames ? cfg.frames[stepIdx] : stepIdx;'), 'Tick must resolve frameNum via cfg.frames');

console.log('✅ ALL NATURAL CARTOON MOTION FRAME MAPPING TESTS PASSED 100%!');
