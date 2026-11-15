// Automated verification: Podium Character ID Resolution & Mobile-Host Parity
// Verifies that student-chosen avatars (e.g. char_05, char_12, char_17, char_07)
// render with exact character identity on the host podium, never defaulting to char_01.

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup minimal DOM mocks
globalThis.window = globalThis;
globalThis.document = {
  currentScript: null,
  addEventListener: () => {},
  querySelectorAll: () => [],
  documentElement: { classList: { toggle: () => {} } },
  getElementById: (id) => null
};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// Load characters-v4.js via eval / script loading
const charsCode = fs.readFileSync(path.join(__dirname, '..', 'characters-v4.js'), 'utf8');
new Function(charsCode)();

// Verify ScoreARCharacters exists
assert.ok(globalThis.ScoreARCharacters, 'ScoreARCharacters must be defined');

console.log('--- Test 1: ScoreARCharacters.get() Resolution by String Code, Digits, and Numbers ---');
const testCases = [
  { input: 'char_01', expectedId: 1, expectedName: 'زياد' },
  { input: 'char_05', expectedId: 5, expectedName: 'ياسين' },
  { input: 'char_07', expectedId: 7, expectedName: 'عمر' },
  { input: 'char_12', expectedId: 12, expectedName: 'بندق' },
  { input: 'char_13', expectedId: 13, expectedName: 'مشمش' },
  { input: 'char_14', expectedId: 14, expectedName: 'حكيم' },
  { input: 'char_17', expectedId: 17, expectedName: 'شرارة' },
  { input: 'char_20', expectedId: 20, expectedName: 'بلّور' },
  { input: 5, expectedId: 5, expectedName: 'ياسين' },
  { input: '5', expectedId: 5, expectedName: 'ياسين' },
  { input: 12, expectedId: 12, expectedName: 'بندق' }
];

testCases.forEach(tc => {
  const char = globalThis.ScoreARCharacters.get(tc.input);
  assert.strictEqual(char.id, tc.expectedId, `Input ${tc.input} should resolve to ID ${tc.expectedId}`);
  assert.strictEqual(char.name, tc.expectedName, `Input ${tc.input} should resolve to Name ${tc.expectedName}`);
  console.log(`✓ Resolved input ${JSON.stringify(tc.input)} -> ID: ${char.id}, Name: ${char.name}`);
});

console.log('\n--- Test 2: ScoreARCharacters.render() with celebrate pose ---');
const char05Html = globalThis.ScoreARCharacters.render('char_05', 'celebrate');
assert.ok(char05Html.includes('char_05-atlas.webp'), 'Render should include char_05 atlas');
assert.ok(char05Html.includes('char_05-idle.webp'), 'Render should include char_05 idle');
assert.ok(char05Html.includes('aria-label="ياسين"'), 'Render should have aria-label="ياسين"');
assert.ok(!char05Html.includes('char_01-atlas.webp'), 'Render of char_05 MUST NOT include char_01');
console.log('✓ char_05 renders correctly as ياسين with celebrate pose');

const char17Html = globalThis.ScoreARCharacters.render('char_17', 'celebrate');
assert.ok(char17Html.includes('char_17-atlas.webp'), 'Render should include char_17 atlas');
assert.ok(char17Html.includes('aria-label="شرارة"'), 'Render should have aria-label="شرارة"');
assert.ok(!char17Html.includes('char_01-atlas.webp'), 'Render of char_17 MUST NOT include char_01');
console.log('✓ char_17 renders correctly as شرارة with celebrate pose');

console.log('\n--- Test 3: Load quiz-podium-effects.js and render Host Podium ---');
const podiumCode = fs.readFileSync(path.join(__dirname, '..', 'quiz-podium-effects.js'), 'utf8');
new Function(podiumCode)();
assert.ok(globalThis.ScoreARPodiumEffects, 'ScoreARPodiumEffects must be defined');

const stageMock = {
  innerHTML: ''
};

const mockRoom = {
  world: { id: 'cosmic' },
  players: [
    { name: 'عمر المبدع', score: 950, avatarId: 'char_07' },
    { name: 'بندق السريع', score: 850, avatarId: 'char_12' },
    { name: 'شرارة التنين', score: 700, avatarId: 'char_17' }
  ]
};

globalThis.ScoreARPodiumEffects.renderHostPodium(stageMock, mockRoom, () => {});

// Assertions on generated HTML
const html = stageMock.innerHTML;
assert.ok(html.length > 500, 'Podium HTML must be generated');

// 1st place should be char_07 (عمر)
assert.ok(html.includes('char_07-atlas.webp'), 'Host podium 1st place must render char_07 (عمر)');
assert.ok(html.includes('aria-label="عمر"'), 'Host podium 1st place aria-label must be عمر');

// 2nd place should be char_12 (بندق)
assert.ok(html.includes('char_12-atlas.webp'), 'Host podium 2nd place must render char_12 (بندق)');
assert.ok(html.includes('aria-label="بندق"'), 'Host podium 2nd place aria-label must be بندق');

// 3rd place should be char_17 (شرارة)
assert.ok(html.includes('char_17-atlas.webp'), 'Host podium 3rd place must render char_17 (شرارة)');
assert.ok(html.includes('aria-label="شرارة"'), 'Host podium 3rd place aria-label must be شرارة');

console.log('✓ Host podium correctly displays 1st place char_07, 2nd place char_12, and 3rd place char_17');
console.log('✓ None of the podium positions defaulted incorrectly to char_01 (زياد)');
console.log('\nALL PODIUM CHARACTER PARITY TESTS PASSED SUCCESSFULLY! 👑');
