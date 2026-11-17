/**
 * ScoreAR Navigation Engine & Menu Controller (nav.js)
 * Phase A: Navigation, Mobile Menu, and Section Routing
 * Rules:
 *   1. Single unified configuration for all sections (NAV_CONFIG).
 *   2. Mobile Menu:
 *      - Leverages native system: adds .open class and calls syncSidebar() so #sidebar.inert becomes false.
 *      - Zero injected !important for sidebar: relies entirely on launch.css selectors.
 *      - Scopes stopImmediatePropagation strictly to the menu toggle button.
 *      - Auto-closes upon clicking any navigation link while preserving native navigation.
 *      - Closes on click outside or pressing Escape.
 *      - Locks body scrolling when open and restores when closed.
 *      - Manages aria-expanded and keyboard focus indexing.
 *   3. Desktop & Tablet (>= 768px):
 *      - Accessible navigation bar and dropdown menu operated via click and keyboard.
 * Strictly Rule 7 Compliant (<500 lines).
 */
(function(global) {
  'use strict';

  const NAV_CONFIG = [
    { id: 'home', hash: '#home', title: 'الرئيسية', icon: 'home', desc: 'مساحة التعلم والبدء للمتسابقين' },
    { id: 'worlds', hash: '#worlds', title: 'قاعة المنافسات', icon: 'planet', desc: 'مسارات / قاعات المنافسة', badge: 'حي' },
    { id: 'heroes', hash: 'characters.html', title: 'قاعة الأبطال (20)', icon: 'spark', desc: 'مستودع أبطال سكور آر' },
    { id: 'cards', hash: 'cards.html', title: 'قاعة الكروت (20)', icon: 'spark', desc: 'موسوعة الـ 20 كارت التكتيكي', badge: 'جديد' },
    { id: 'podium', hash: 'podium.html', title: 'منصة التتويج 👑', icon: 'crown', desc: 'منصة التتويج الاحتفالية للفائزين' },
    { id: 'studio', hash: '#studio', title: 'استوديو المعلم', icon: 'grid', desc: 'مساحة المعلم وإدارة المسابقات' },
    { id: 'classrooms', hash: '#classrooms', title: 'ملفي وصفوفي 🏫', icon: 'book', desc: 'إدارة الصفوف والملف التعليمي وطلبات الانضمام' },
    { id: 'journey', hash: '#journey', title: 'رحلتي التعليمية', icon: 'route', desc: 'مسار التحدي الفردي والمهارات' },
    { id: 'library', hash: '#library', title: 'مكتبة المحتوى', icon: 'book', desc: 'بنك الأسئلة والتمارين' },
    { id: 'about', hash: '#about', title: 'عن سكور آر', icon: 'info', desc: 'رؤية المنصة وتفاصيل المشروع' }
  ];

  let isMenuOpen = false;
  let previousFocusedElement = null;

  function ensureStylesInjected() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('scorearNavStyles')) return;
    const style = document.createElement('style');
    style.id = 'scorearNavStyles';
    style.textContent = `
      /* Desktop & Tablet Top Nav Dropdown (>= 768px) */
      .scorear-dropdown {
        position: relative;
        display: inline-block;
      }
      .scorear-dropdown-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #ddd8ff;
        border-radius: 12px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: inherit;
        transition: all 0.2s;
      }
      .scorear-dropdown-btn:hover, .scorear-dropdown-btn[aria-expanded="true"] {
        background: rgba(142, 100, 239, 0.22);
        border-color: #8e64ef;
        color: #ffffff;
      }
      .scorear-dropdown-menu {
        display: none;
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 220px;
        background: #14162e;
        border: 1.5px solid rgba(142, 100, 239, 0.35);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        z-index: var(--z-dropdown, 200);
        direction: rtl;
        text-align: right;
      }
      .scorear-dropdown-menu.show {
        display: flex;
        flex-direction: column;
        gap: 4px;
        animation: scorearDropdownFade 0.15s ease-out;
      }
      @keyframes scorearDropdownFade {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .scorear-dropdown-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        color: #ddd8ff;
        text-decoration: none;
        font-size: 13px;
        font-weight: 700;
        border-radius: 10px;
        transition: background 0.15s, color 0.15s;
      }
      .scorear-dropdown-item:hover, .scorear-dropdown-item:focus {
        background: rgba(142, 100, 239, 0.18);
        color: #ffffff;
        outline: none;
      }
      .scorear-dropdown-item.active {
        background: rgba(142, 100, 239, 0.3);
        color: #fcd34d;
      }

      /* Screen width adaptations */
      @media (max-width: 767px) {
        .scorear-dropdown-btn { padding: 6px 10px; font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  function getSidebar() {
    return document.getElementById('sidebar');
  }

  function updateAriaExpanded(isOpen) {
    if (typeof document === 'undefined') return;
    const btns = document.querySelectorAll('[data-action="menu"], .mobile-menu, .launch-menu');
    btns.forEach(btn => {
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function openSidebar() {
    ensureStylesInjected();
    const sidebar = getSidebar();
    if (!sidebar) return;

    previousFocusedElement = document.activeElement;
    isMenuOpen = true;
    sidebar.classList.add('open');

    // Restore interactive capability through native system (inert = false)
    sidebar.inert = false;
    if (typeof global.syncSidebar === 'function') {
      try { global.syncSidebar(); } catch (e) {}
    }

    // Lock background scroll
    if (document.body) document.body.style.overflow = 'hidden';
    updateAriaExpanded(true);

    // Focus first navigation item
    const firstLink = sidebar.querySelector('nav a');
    if (firstLink) setTimeout(() => firstLink.focus(), 50);
  }

  function closeSidebar() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    isMenuOpen = false;
    sidebar.classList.remove('open');
    sidebar.inert = true;

    // Sync inert state through native system
    if (typeof global.syncSidebar === 'function') {
      try { global.syncSidebar(); } catch (e) {}
    }

    // Restore background scroll
    if (document.body) document.body.style.overflow = '';
    updateAriaExpanded(false);

    // Restore previous focus if valid (preventScroll stops browser from jumping to topbar)
    if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
      try { previousFocusedElement.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  function toggleSidebar() {
    const sidebar = getSidebar();
    const currentlyOpen = isMenuOpen || (sidebar && sidebar.classList.contains('open'));
    if (currentlyOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function initListeners() {
    ensureStylesInjected();

    // 1. Delegated click handler for menu toggle, close button & auto-close on link click
    document.addEventListener('click', (e) => {
      // Menu trigger: strictly scope stopImmediatePropagation here only
      const menuTrigger = e.target.closest('[data-action="menu"], .mobile-menu, .launch-menu');
      if (menuTrigger) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toggleSidebar();
        return;
      }

      // Close button inside sidebar
      const closeTrigger = e.target.closest('[data-action="close-sidebar"], .sidebar-close-btn');
      if (closeTrigger) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeSidebar();
        return;
      }

      const sidebar = getSidebar();
      if (!sidebar) return;

      // Auto-close when clicking any link inside sidebar (proceed naturally with navigation)
      const navLink = e.target.closest('#sidebar a, #sidebar [data-nav]');
      if (navLink) {
        const href = navLink.getAttribute('href');
        if (href && href.startsWith('#') && isStandalonePage()) {
          navLink.setAttribute('href', resolveNavHref(href));
        }
        closeSidebar();
        return;
      }

      if (!e.target.closest('#scorearTopNavDropdown')) closeAllDropdowns();
      // Close when clicking outside of open sidebar
      if (isMenuOpen && !e.target.closest('#sidebar, [data-action="menu"], .mobile-menu, .launch-menu')) {
        closeSidebar();
      }
    }, true);

    // 2. Keyboard accessibility (Escape to close, Tab focus trapping)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isMenuOpen) {
          e.preventDefault();
          closeSidebar();
          return;
        }
        // Also close any open desktop dropdown
        closeAllDropdowns();
      }

      if (e.key === 'Tab' && isMenuOpen) {
        const sidebar = getSidebar();
        if (!sidebar) return;
        const focusable = sidebar.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // 3. Close sidebar on hash change or popstate
    window.addEventListener('hashchange', () => {
      closeSidebar();
      updateActiveNavLinks();
      mountTopbarNav();
    });
    window.addEventListener('popstate', () => {
      closeSidebar();
      updateActiveNavLinks();
    });

    // 4. Guarantee closed on startup
    if (isStandalonePage()) {
      document.querySelectorAll('#sidebar a[href^="#"]').forEach(a => {
        a.setAttribute('href', resolveNavHref(a.getAttribute('href')));
      });
    }
    updateActiveNavLinks();
    closeSidebar();
    mountTopbarNav();
  }

  function updateActiveNavLinks() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const standalone = isStandalonePage();
    const pageFile = getCurrentPageFile();
    const curHash = (window.location && window.location.hash) || '#home';
    const cleanId = standalone
      ? pageFile.replace('.html', '')
      : (curHash.split('?')[0].replace('#', '') || 'home');
    document.querySelectorAll('[data-nav]').forEach(el => {
      const navId = el.getAttribute('data-nav');
      const href = el.getAttribute('href') || '';
      const match = standalone
        ? (navId === cleanId || href === pageFile || (pageFile === 'characters.html' && navId === 'heroes'))
        : (navId === cleanId || href === curHash);
      el.classList.toggle('active', match);
    });
  }

  // --- DESKTOP & TABLET DROPDOWN LOGIC ---
  function closeAllDropdowns() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.scorear-dropdown-menu.show').forEach(m => {
      m.classList.remove('show');
      const btn = m.previousElementSibling;
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleDropdown(dropdownId) {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(dropdownId);
    if (!container) return;
    const menu = container.querySelector('.scorear-dropdown-menu');
    const btn = container.querySelector('.scorear-dropdown-btn');
    if (!menu || !btn) return;

    const isOpen = menu.classList.contains('show');
    closeAllDropdowns();
    if (!isOpen) {
      menu.classList.add('show');
      btn.setAttribute('aria-expanded', 'true');
      const firstItem = menu.querySelector('a');
      if (firstItem) {
        try { firstItem.focus({ preventScroll: true }); } catch (_) { firstItem.focus(); }
      }
    }
  }


  function getCurrentPageFile() {
    if (typeof window === 'undefined' || !window.location) return 'index.html';
    const seg = (window.location.pathname || '').split('/').filter(Boolean).pop()?.toLowerCase() || 'index.html';
    if (seg === 'characters' || seg === 'characters.html') return 'characters.html';
    if (seg === 'cards' || seg === 'cards.html') return 'cards.html';
    if (seg === 'podium' || seg === 'podium.html') return 'podium.html';
    return seg.endsWith('.html') ? seg : 'index.html';
  }

  function isStandalonePage() {
    return getCurrentPageFile() !== 'index.html';
  }

  function resolveNavHref(hashOrPath) {
    if (!hashOrPath) return isStandalonePage() ? 'index.html#home' : '#home';
    if (hashOrPath.startsWith('#') && isStandalonePage()) {
      return `index.html${hashOrPath}`;
    }
    return hashOrPath;
  }

  function goBackOrHome() {
    if (isStandalonePage()) {
      window.location.href = 'index.html#home';
      return;
    }
    const curHash = (window.location && window.location.hash) || '#home';
    if (curHash && curHash !== '#home' && curHash !== '#') {
      window.location.hash = '#home';
    }
  }

  function getActiveNavTarget() {
    const standalone = isStandalonePage();
    const pageFile = getCurrentPageFile();
    if (standalone) return pageFile;
    const rawHash = (window.location && window.location.hash) || '#home';
    const cleanHash = rawHash.split('?')[0];
    const hashAliases = {
      '': '#home',
      '#': '#home',
      '#podium': 'podium.html',
      '#cards': 'cards.html',
      '#heroes': 'characters.html',
      '#characters': 'characters.html'
    };
    return hashAliases[cleanHash] || cleanHash;
  }

  function mountTopbarNav() {
    if (typeof document === 'undefined') return;
    ensureStylesInjected();
    const topbarTitle = document.querySelector('.topbar .topbar-title');
    if (!topbarTitle) return;

    let navSlot = document.getElementById('scorearTopbarNavSlot');
    if (!navSlot) {
      navSlot = document.createElement('div');
      navSlot.id = 'scorearTopbarNavSlot';
      navSlot.style.cssText = 'display:inline-flex;align-items:center;gap:8px;margin-right:6px;flex-wrap:wrap;flex-shrink:0;';
      if (typeof topbarTitle.insertAdjacentElement === 'function' && topbarTitle.parentElement) {
        topbarTitle.insertAdjacentElement('afterend', navSlot);
      } else {
        topbarTitle.appendChild(navSlot);
      }
    } else if (navSlot.parentElement === topbarTitle && typeof topbarTitle.insertAdjacentElement === 'function' && topbarTitle.parentElement) {
      topbarTitle.insertAdjacentElement('afterend', navSlot);
    }

    const standalone = isStandalonePage();
    const currentHash = (window.location && window.location.hash) || '#home';
    const isHome = !standalone && (!currentHash || currentHash === '#' || currentHash === '#home');
    const activeTarget = getActiveNavTarget();
    const activeItem = NAV_CONFIG.find(n => n.hash === activeTarget) || NAV_CONFIG[0];

    navSlot.innerHTML = `
      ${!isHome ? `
        <button type="button" onclick="ScoreARNav.goBackOrHome()" style="background:rgba(142,100,239,0.2);border:1px solid rgba(142,100,239,0.45);color:#fff;border-radius:10px;padding:6px 12px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-family:inherit;" title="العودة للرئيسية">
          <span>➔</span>
          <span>رجوع للرئيسية</span>
        </button>
      ` : ''}
      <div class="scorear-dropdown" id="scorearTopNavDropdown">
        <button type="button" class="scorear-dropdown-btn" onclick="ScoreARNav.toggleDropdown('scorearTopNavDropdown')" aria-expanded="false" aria-haspopup="true">
          <span>🧭 ${activeItem.title}</span>
          <span style="font-size:10px;opacity:0.85;">▼</span>
        </button>
        <div class="scorear-dropdown-menu" role="menu">
          ${NAV_CONFIG.map(item => `
            <a href="${resolveNavHref(item.hash)}" class="scorear-dropdown-item ${item.hash === activeTarget ? 'active' : ''}" role="menuitem" onclick="ScoreARNav.closeAllDropdowns()">
              <span>${item.title}</span>
              ${item.badge ? `<span style="background:rgba(142,100,239,0.3);color:#dcd2ff;font-size:10px;padding:1px 6px;border-radius:6px;">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderDesktopNavDropdown(containerId) {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const activeTarget = getActiveNavTarget();
    const activeItem = NAV_CONFIG.find(n => n.hash === activeTarget) || NAV_CONFIG[0];

    container.innerHTML = `
      <div class="scorear-dropdown scorear-desktop-nav" id="scorearTopNavDropdown">
        <button class="scorear-dropdown-btn" onclick="ScoreARNav.toggleDropdown('scorearTopNavDropdown')" aria-expanded="false" aria-haspopup="true">
          <span>🧭 ${activeItem.title}</span>
          <span style="font-size:10px;">▼</span>
        </button>
        <div class="scorear-dropdown-menu" role="menu">
          ${NAV_CONFIG.map(item => `
            <a href="${resolveNavHref(item.hash)}" class="scorear-dropdown-item ${item.hash === activeTarget ? 'active' : ''}" role="menuitem" onclick="ScoreARNav.closeAllDropdowns()">
              <span>${item.title}</span>
              ${item.badge ? `<span style="background:rgba(142,100,239,0.3);color:#dcd2ff;font-size:10px;padding:1px 6px;border-radius:6px;">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  const NavAPI = {
    NAV_CONFIG,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    isSidebarOpen: () => isMenuOpen,
    renderDesktopNavDropdown, mountTopbarNav, goBackOrHome,
    toggleDropdown,
    closeAllDropdowns,
    updateActiveNavLinks
  };

  global.ScoreARNav = NavAPI;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initListeners);
    } else {
      initListeners();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavAPI;
  }
})(typeof window !== 'undefined' ? window : globalThis);
