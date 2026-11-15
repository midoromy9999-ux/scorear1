const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=================================================================');
console.log('   SCOREAR PHASE B0: HOSTNAME-BASED ENVIRONMENT ACCEPTANCE TEST');
console.log('=================================================================');

const baseDir = 'E:/MY PRO/New folder (4)/SCOREAR_FINAL_RELEASE';
let passed = 0;
let total = 0;

function test(desc, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    console.error(`  [FAIL] ${desc}: ${err.message}`);
  }
}

const configCode = fs.readFileSync(path.join(baseDir, 'firebase-config.js'), 'utf8');

function runInContext(hostname, search = '', storedEnv = null) {
  const window = {
    location: { hostname, search },
    firebase: { apps: [], initializeApp: () => ({}) }
  };
  const localStorage = {
    store: storedEnv ? { scorear_env: storedEnv } : {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); }
  };
  const fn = new Function('window', 'global', 'localStorage', configCode);
  fn(window, window, localStorage);
  return { api: window.ScoreARFirebaseConfig, localStorage };
}

// 1. Hostname scorear2.web.app -> production
test('1. Hostname scorear2.web.app resolves to production', () => {
  const { api } = runInContext('scorear2.web.app');
  assert.strictEqual(api.getActiveEnv(), 'production');
  assert.strictEqual(api.isProduction(), true);
  assert.strictEqual(api.getActiveConfig().projectId, 'scorear2');
});

// 2. Hostname scorear2.firebaseapp.com -> production
test('2. Hostname scorear2.firebaseapp.com resolves to production', () => {
  const { api } = runInContext('scorear2.firebaseapp.com');
  assert.strictEqual(api.getActiveEnv(), 'production');
  assert.strictEqual(api.isProduction(), true);
});

// 3. Hostname localhost -> staging
test('3. Hostname localhost resolves to staging by default', () => {
  const { api } = runInContext('localhost');
  assert.strictEqual(api.getActiveEnv(), 'staging');
  assert.strictEqual(api.isProduction(), false);
  assert.strictEqual(api.getActiveConfig().projectId, 'scorear-staging-test');
});

// 4. Hostname 127.0.0.1 -> staging
test('4. Hostname 127.0.0.1 resolves to staging by default', () => {
  const { api } = runInContext('127.0.0.1');
  assert.strictEqual(api.getActiveEnv(), 'staging');
  assert.strictEqual(api.isProduction(), false);
});

// 5. Any other domain (e.g. preview-app.web.app) -> staging
test('5. Any unknown hostname (e.g. preview-pr12.web.app) resolves to staging', () => {
  const { api } = runInContext('preview-pr12.web.app');
  assert.strictEqual(api.getActiveEnv(), 'staging');
  assert.strictEqual(api.isProduction(), false);
  assert.strictEqual(api.getActiveConfig().projectId, 'scorear-staging-test');
});

// 6. Overrides (?env= and localStorage) are COMPLETELY IGNORED on live production
test('6. Overrides (?env=staging / localStorage) are completely ignored on live production host', () => {
  const { api } = runInContext('scorear2.web.app', '?env=staging', 'staging');
  assert.strictEqual(api.getActiveEnv(), 'production', 'Live domain must not be overridden');
  
  const canSwitch = api.setEnvironment('staging');
  assert.strictEqual(canSwitch, false, 'setEnvironment must reject on live domain');
  assert.strictEqual(api.getActiveEnv(), 'production');
});

// 7. Overrides (?env= and localStorage) WORK on localhost
test('7. Overrides (?env=production / localStorage) work on localhost', () => {
  const { api } = runInContext('localhost', '?env=production');
  assert.strictEqual(api.getActiveEnv(), 'production');
  assert.strictEqual(api.getActiveConfig().projectId, 'scorear2');

  const { api: api2 } = runInContext('127.0.0.1');
  const switched = api2.setEnvironment('production');
  assert.strictEqual(switched, true);
  assert.strictEqual(api2.getActiveEnv(), 'production');
});

// 8. Verify .firebaserc aliases and default
test('8. .firebaserc has default: staging, staging: scorear-staging-test, production: scorear2', () => {
  const rc = JSON.parse(fs.readFileSync(path.join(baseDir, '.firebaserc'), 'utf8'));
  assert.strictEqual(rc.projects.default, 'scorear-staging-test');
  assert.strictEqual(rc.projects.staging, 'scorear-staging-test');
  assert.strictEqual(rc.projects.production, 'scorear2');
});

// 9. Verify emulators block in firebase.json
test('9. firebase.json contains emulators block with database on port 9000', () => {
  const fbJson = JSON.parse(fs.readFileSync(path.join(baseDir, 'firebase.json'), 'utf8'));
  assert(fbJson.emulators && fbJson.emulators.database);
  assert.strictEqual(fbJson.emulators.database.port, 9000);
});

// 10. Rule 7 compliance (< 500 lines)
test('10. firebase-config.js is strictly Rule 7 compliant (< 500 lines)', () => {
  const lines = fs.readFileSync(path.join(baseDir, 'firebase-config.js'), 'utf8').split(/\r?\n/).length;
  assert(lines < 500, `Lines count ${lines} exceeds 500!`);
  console.log(`          Line count: ${lines} lines`);
});

console.log('=================================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('=================================================================');

process.exit(total === passed ? 0 : 1);
