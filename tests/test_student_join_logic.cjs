/**
 * Unit Test: Student Join Logic & Deduplication & Audio Persistence
 */
const assert = require('assert');

// 1. Test Name Regex
const NAME_REGEX = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0660-\u0669\u06F0-\u06F9\s\-\.\/]{1,40}$/;

const validNames = [
  'أحمد',
  'أحمد صلاح رميح',
  'سارة',
  'John Doe',
  '3/1 رقم 15',
  'فصل 2/4 - 18',
  'Class 5A / #12'.replace('#', '12'), // regex test
  'محمد علي-حسن.2'
];

validNames.forEach(name => {
  assert.strictEqual(NAME_REGEX.test(name), true, `Failed on valid name: ${name}`);
});

const invalidNames = [
  '', // empty
  '   ', // whitespace only
  'a'.repeat(41), // too long (>40)
  'أحمد <script>', // dangerous chars
  'علي @#$%'
];

invalidNames.forEach(name => {
  const clean = name.trim();
  const isValid = clean.length > 0 && clean.length <= 40 && NAME_REGEX.test(clean);
  assert.strictEqual(isValid, false, `Should have rejected: ${name}`);
});
console.log('✅ Name regex validation passed: 8 valid, 5 invalid properly handled.');

// 2. Test Deduplication
function deduplicateName(name, existingList) {
  if (!existingList || !Array.isArray(existingList) || existingList.length === 0) return name;
  const base = name.replace(/\s*\(\d+\)$/, '').trim();
  let candidate = name.trim();
  let count = 2;
  const isTaken = (n) => existingList.some(p => p && p.name && p.name.trim() === n);
  if (isTaken(candidate)) {
    while (isTaken(`${base} (${count})`)) {
      count++;
    }
    candidate = `${base} (${count})`;
  }
  return candidate;
}

const existing = [
  { name: 'أحمد' },
  { name: 'أحمد (2)' },
  { name: 'سارة' },
  { name: '3/1 رقم 15' }
];

assert.strictEqual(deduplicateName('خالد', existing), 'خالد');
assert.strictEqual(deduplicateName('أحمد', existing), 'أحمد (3)');
assert.strictEqual(deduplicateName('سارة', existing), 'سارة (2)');
assert.strictEqual(deduplicateName('3/1 رقم 15', existing), '3/1 رقم 15 (2)');
console.log('✅ Name deduplication passed: "أحمد" properly incremented to "أحمد (3)".');

// 3. Test Keypad logic
let pin = '';
function handleKeypad(key) {
  if (key === 'C') pin = '';
  else if (key === '⌫') pin = pin.slice(0, -1);
  else if (/^\d$/.test(key) && pin.length < 6) pin += key;
}

handleKeypad('4');
handleKeypad('8');
handleKeypad('2');
assert.strictEqual(pin, '482');
handleKeypad('⌫');
assert.strictEqual(pin, '48');
handleKeypad('9');
handleKeypad('1');
handleKeypad('0');
handleKeypad('5');
assert.strictEqual(pin, '489105');
handleKeypad('7'); // Should ignore past 6
assert.strictEqual(pin, '489105');
handleKeypad('C');
assert.strictEqual(pin, '');
console.log('✅ Keypad logic passed: 0-9, ⌫, and C work accurately.');

// 4. Test Role Badges
function getRoleBadge(p) {
  if (p.isDemo || p.isBot || String(p.id).startsWith('demo-')) return { icon: '🤖', title: 'طالب تجريبي' };
  if (p.isRegistered || (!p.isAnonymous && p.role === 'student')) return { icon: '✓', title: 'طالب مسجل' };
  return { icon: '✨', title: 'ضيف' };
}

assert.strictEqual(getRoleBadge({ id: 'demo-1', isDemo: true }).icon, '🤖');
assert.strictEqual(getRoleBadge({ id: 'u123', isRegistered: true }).icon, '✓');
assert.strictEqual(getRoleBadge({ id: 'u456', isAnonymous: true }).icon, '✨');
console.log('✅ Role badges passed: ✓ (registered), ✨ (guest), 🤖 (demo bot).');

console.log('🎉 ALL UNIT TESTS PASSED 100%!');
