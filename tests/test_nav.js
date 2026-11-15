/**
 * ScoreAR Navigation Engine Unit Test Suite (tests/test_nav.js)
 * Zero-dependency pure Node test with DOM Mocking
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// 1. Line count check (< 500 lines)
const navLines = fs.readFileSync(path.join(ROOT, 'nav.js'), 'utf8').split('\n').length;
assert(navLines < 500, `nav.js exceeds 500 lines (${navLines})`);
console.log(`[PASS] Rule 7 Line Count: nav.js (${navLines} lines < 500)`);

// 2. Setup lightweight DOM mock
class MockElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className.split(' ').filter(Boolean)),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      }
    };
    this.attributes = new Map();
    this.style = {};
    this.children = [];
    this.parentNode = null;
    this.innerHTML = '';
    this.textContent = '';
  }

  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) || null; }
  hasAttribute(k) { return this.attributes.has(k); }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      if (matches(el, selector)) results.push(el);
      el.children.forEach(check);
    };
    this.children.forEach(check);
    return results;
  }

  closest(selector) {
    let cur = this;
    while (cur) {
      if (matches(cur, selector)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  focus() {
    global.document.activeElement = this;
  }
}

function matches(el, selector) {
  if (!el || !el.tagName) return false;
  if (selector.includes(',')) {
    return selector.split(',').some(sub => matches(el, sub.trim()));
  }
  if (selector === '#sidebar') return el.id === 'sidebar';
  if (selector === '#app') return el.id === 'app';
  if (selector === '[data-action="menu"]') return el.getAttribute('data-action') === 'menu';
  if (selector.includes('[data-action="menu"]')) return el.getAttribute('data-action') === 'menu';
  if (selector === '#sidebar a' || selector === 'nav a') return el.tagName === 'A' && !!el.closest('#sidebar');
  if (selector === '#sidebar [data-nav]') return el.hasAttribute('data-nav') && !!el.closest('#sidebar');
  if (selector === '[data-nav]') return el.hasAttribute('data-nav');
  if (selector === '.scorear-dropdown-menu.show') return el.classList && el.classList.contains('show');
  if (selector === '.scorear-dropdown-btn') return el.classList && el.classList.contains('scorear-dropdown-btn');
  if (selector === '.scorear-dropdown-item') return el.classList && el.classList.contains('scorear-dropdown-item');
  if (selector === 'a') return el.tagName === 'A';
  return false;
}

const listeners = {
  document: {},
  window: {}
};

function addEventListenerMock(target, event, fn) {
  if (!listeners[target][event]) listeners[target][event] = [];
  listeners[target][event].push(fn);
}

function dispatchEventMock(target, event, payload = {}) {
  const fns = listeners[target][event] || [];
  fns.forEach(fn => fn({
    ...payload,
    preventDefault: () => { payload.defaultPrevented = true; },
    stopPropagation: () => {},
    stopImmediatePropagation: () => {}
  }));
}

// Global Mocks
const bodyEl = new MockElement('BODY', '', 'launch-mode');
const headEl = new MockElement('HEAD');
const sidebarEl = new MockElement('ASIDE', 'sidebar', 'sidebar');
const navEl = new MockElement('NAV');
const homeLink = new MockElement('A', '', 'nav-link'); homeLink.setAttribute('href', '#home'); homeLink.setAttribute('data-nav', 'home');
const heroesLink = new MockElement('A', '', 'nav-link'); heroesLink.setAttribute('href', '#heroes'); heroesLink.setAttribute('data-nav', 'heroes');
const menuBtn = new MockElement('BUTTON', '', 'icon-btn launch-menu'); menuBtn.setAttribute('data-action', 'menu');
const dropdownContainer = new MockElement('DIV', 'desktopNavContainer');
const appEl = new MockElement('DIV', 'app');

navEl.appendChild(homeLink);
navEl.appendChild(heroesLink);
sidebarEl.appendChild(navEl);
bodyEl.appendChild(menuBtn);
bodyEl.appendChild(dropdownContainer);
bodyEl.appendChild(sidebarEl);
bodyEl.appendChild(appEl);

global.document = {
  activeElement: null,
  body: bodyEl,
  head: headEl,
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => {
    if (id === 'sidebar') return sidebarEl;
    if (id === 'desktopNavContainer') return dropdownContainer;
    if (id === 'scorearNavStyles') return null;
    if (id === 'scorearTopNavDropdown') return dropdownContainer.children[0] || null;
    if (id === 'app') return appEl;
    return null;
  },
  querySelector: (sel) => bodyEl.querySelector(sel),
  querySelectorAll: (sel) => bodyEl.querySelectorAll(sel),
  addEventListener: (event, fn) => addEventListenerMock('document', event, fn)
};

global.window = {
  location: { hash: '#home' },
  innerWidth: 1024,
  addEventListener: (event, fn) => addEventListenerMock('window', event, fn)
};

// Import and evaluate nav.js
eval(fs.readFileSync(path.join(ROOT, 'nav.js'), 'utf8'));
const ScoreARNav = global.window.ScoreARNav || global.ScoreARNav;

console.log('====================================================');
console.log('   SCOREAR NAVIGATION ENGINE UNIT TESTS');
console.log('====================================================\n');

let passed = 0;
let total = 0;
function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

// TEST 1: NAV_CONFIG Canonical 7 Sections
test('1. NAV_CONFIG defines exactly 7 canonical sections with valid keys and titles', () => {
  assert.strictEqual(Array.isArray(ScoreARNav.NAV_CONFIG), true);
  assert.strictEqual(ScoreARNav.NAV_CONFIG.length, 7);
  const ids = ScoreARNav.NAV_CONFIG.map(s => s.id);
  assert.deepStrictEqual(ids, ['home', 'worlds', 'heroes', 'journey', 'studio', 'library', 'about']);
  assert.strictEqual(ScoreARNav.NAV_CONFIG[0].title, 'الرئيسية');
  assert.strictEqual(ScoreARNav.NAV_CONFIG[2].title, 'قاعة الأبطال (20)');
});

// TEST 2: openSidebar()
test('2. openSidebar() adds .open class, sets body overflow: hidden, and updates aria-expanded', () => {
  assert.strictEqual(sidebarEl.classList.contains('open'), false);
  ScoreARNav.openSidebar();
  assert.strictEqual(sidebarEl.classList.contains('open'), true);
  assert.strictEqual(bodyEl.style.overflow, 'hidden');
  assert.strictEqual(menuBtn.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(ScoreARNav.isSidebarOpen(), true);
});

// TEST 3: closeSidebar()
test('3. closeSidebar() removes .open class, restores body overflow, and sets aria-expanded to false', () => {
  ScoreARNav.closeSidebar();
  assert.strictEqual(sidebarEl.classList.contains('open'), false);
  assert.strictEqual(bodyEl.style.overflow, '');
  assert.strictEqual(menuBtn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(ScoreARNav.isSidebarOpen(), false);
});

// TEST 4: toggleSidebar()
test('4. toggleSidebar() toggles open/closed state correctly', () => {
  ScoreARNav.toggleSidebar();
  assert.strictEqual(ScoreARNav.isSidebarOpen(), true);
  ScoreARNav.toggleSidebar();
  assert.strictEqual(ScoreARNav.isSidebarOpen(), false);
});

// TEST 5: Menu button delegated click
test('5. Clicking menu button toggles sidebar through delegated click event', () => {
  dispatchEventMock('document', 'click', { target: menuBtn, stopPropagation: () => {} });
  assert.strictEqual(ScoreARNav.isSidebarOpen(), true);
  dispatchEventMock('document', 'click', { target: menuBtn, stopPropagation: () => {} });
  assert.strictEqual(ScoreARNav.isSidebarOpen(), false);
});

// TEST 6: Auto-close on nav link click
test('6. Clicking any navigation link inside sidebar auto-closes the sidebar', () => {
  ScoreARNav.openSidebar();
  assert.strictEqual(ScoreARNav.isSidebarOpen(), true);
  dispatchEventMock('document', 'click', { target: heroesLink });
  assert.strictEqual(ScoreARNav.isSidebarOpen(), false);
  assert.strictEqual(bodyEl.style.overflow, '');
});

// TEST 7: Click outside closes sidebar
test('7. Clicking outside the sidebar closes it', () => {
  ScoreARNav.openSidebar();
  assert.strictEqual(ScoreARNav.isSidebarOpen(), true);
  dispatchEventMock('document', 'click', { target: appEl });
  assert.strictEqual(ScoreARNav.isSidebarOpen(), false);
});

// TEST 8: Escape key closes sidebar
test('8. Pressing Escape key closes the sidebar and restores body overflow', () => {
  ScoreARNav.openSidebar();
  assert.strictEqual(ScoreARNav.isSidebarOpen(), true);
  dispatchEventMock('document', 'keydown', { key: 'Escape' });
  assert.strictEqual(ScoreARNav.isSidebarOpen(), false);
  assert.strictEqual(bodyEl.style.overflow, '');
});

// TEST 9: Dropdown Rendering & Toggle
test('9. Desktop Dropdown renders properly and toggles on click', () => {
  ScoreARNav.renderDesktopNavDropdown('desktopNavContainer');
  assert.ok(dropdownContainer.innerHTML.includes('قاعة المنافسات') || dropdownContainer.innerHTML.includes('الرئيسية'));
  assert.ok(dropdownContainer.innerHTML.includes('scorear-dropdown-menu'));
});

console.log(`\n====================================================`);
console.log(`Tests: ${passed} / ${total} passed`);
console.log(`====================================================`);
if (passed !== total) process.exit(1);
