// Automated Test Suite for Registration UI & Unified Login Flow in Browser DOM
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup JSDOM or Minimal DOM Environment
const domHtml = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <div id="topActionsArea"></div>
  <div class="launch-nav-actions"></div>
  <main id="main"></main>
  <dialog id="modal"><h2 id="modalTitle"></h2><div id="modalBody"></div></dialog>
  <div id="toast"></div>
</body>
</html>
`;

// Simple lightweight mock DOM
globalThis.window = globalThis;
globalThis.document = {
  body: {
    classList: {
      toggle: () => {}
    }
  },
  getElementById: (id) => {
    if (id === 'modal') return globalThis._modalMock;
    if (id === 'modalTitle') return globalThis._modalTitleMock;
    if (id === 'modalBody') return globalThis._modalBodyMock;
    if (id === 'topActionsArea') return globalThis._topActionsMock;
    return null;
  },
  querySelector: (sel) => {
    if (sel === '#modal') return globalThis._modalMock;
    if (sel === '#modalTitle') return globalThis._modalTitleMock;
    if (sel === '#modalBody') return globalThis._modalBodyMock;
    if (sel === '.launch-nav-actions') return globalThis._launchNavActionsMock;
    return null;
  },
  querySelectorAll: () => [],
  addEventListener: () => {}
};

globalThis._modalMock = {
  open: false,
  showModal() { this.open = true; },
  close() { this.open = false; }
};
globalThis._modalTitleMock = { textContent: '' };
globalThis._modalBodyMock = { innerHTML: '' };
globalThis._topActionsMock = { innerHTML: '' };
globalThis._launchNavActionsMock = { innerHTML: '' };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Mock Firebase
globalThis.firebase = {
  apps: [{}],
  auth: () => ({
    setPersistence: async () => {},
    onAuthStateChanged: () => {},
    currentUser: null
  }),
  database: () => ({
    ref: () => ({ once: async () => ({ exists: () => false, val: () => null }), set: async () => {} })
  })
};
globalThis.firebase.auth.Auth = { Persistence: { LOCAL: 'LOCAL' } };

// Mock worlds & icon for launch.js
globalThis.worlds = [];
globalThis.icon = (name) => `<i data-icon="${name}"></i>`;

// Load files
const authCode = fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8');
const authUiCode = fs.readFileSync(path.join(__dirname, '..', 'auth-ui.js'), 'utf8');
const registerUiCode = fs.readFileSync(path.join(__dirname, '..', 'auth-register-ui.js'), 'utf8');
const launchCode = fs.readFileSync(path.join(__dirname, '..', 'launch.js'), 'utf8');

new Function(authCode)();
new Function(authUiCode)();
new Function(registerUiCode)();
new Function(launchCode)();

async function testUI() {
  console.log('--- 1. Testing renderLaunchHome includes «تسجيل» section ---');
  const homeHtml = globalThis.renderLaunchHome();
  assert.ok(homeHtml.includes('id="launchRegister"'), 'Home page must have launchRegister section');
  assert.ok(homeHtml.includes('معلم جديد'), 'Home page must feature "معلم جديد" card');
  assert.ok(homeHtml.includes('طالب جديد'), 'Home page must feature "طالب جديد" card');
  assert.ok(homeHtml.includes('data-action="unified-login"'), 'Home page must have unified-login button');
  assert.ok(homeHtml.includes('data-action="join"'), 'Home page must retain independent PIN join');
  console.log('✓ Home page contains «تسجيل» section, both cards, and unified login button');

  console.log('\n--- 2. Testing Teacher Registration Modal Content ---');
  globalThis.ScoreARRegisterUI.openTeacherRegistrationModal();
  assert.ok(globalThis._modalMock.open, 'Modal must open');
  assert.strictEqual(globalThis._modalTitleMock.textContent, 'تسجيل معلم جديد 👨‍🏫');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="trName"'), 'Has teacher name field');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="trEmail"'), 'Has teacher email field');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="trPassword"'), 'Has teacher password field');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="trSubject"'), 'Has teacher subject field');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('قيد المراجعة'), 'Has pending review explanation');
  console.log('✓ Teacher registration modal properly formatted with all required fields');

  console.log('\n--- 3. Testing Student Registration Modal Content & Privacy Notice ---');
  globalThis.ScoreARRegisterUI.openStudentRegistrationModal();
  assert.ok(globalThis._modalMock.open, 'Modal must open');
  assert.strictEqual(globalThis._modalTitleMock.textContent, 'تسجيل طالب جديد 🎯');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="srDisplayName"'), 'Has display name field');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="srUsername"'), 'Has latin username field');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="srPassword"'), 'Has password field');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('بيان الخصوصية والأمان'), 'Must display privacy notice');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('لا نطلب أي بريد شخصي أو رقم هاتف نهائياً'), 'Must emphasize no phone/personal email');
  console.log('✓ Student registration modal contains username, password, and clear privacy statement');

  console.log('\n--- 4. Testing Unified Login Modal Content ---');
  globalThis.ScoreARAuthUI.openUnifiedLoginModal();
  assert.ok(globalThis._modalMock.open, 'Modal must open');
  assert.ok(globalThis._modalTitleMock.textContent.includes('بوابة الدخول'));
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="loginIdentifier"'), 'Has unified identifier input');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('id="loginPassword"'), 'Has password input');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('ScoreARRegisterUI.openTeacherRegistrationModal()'), 'Has link to teacher register');
  assert.ok(globalThis._modalBodyMock.innerHTML.includes('ScoreARRegisterUI.openStudentRegistrationModal()'), 'Has link to student register');
  console.log('✓ Unified login modal accepts single input for email or username with register links');

  console.log('\n======================================================');
  console.log('ALL REGISTRATION UI & INTEGRATION TESTS PASSED 100%! 🎨');
  console.log('======================================================');
}

testUI().catch(err => {
  console.error(err);
  process.exit(1);
});
