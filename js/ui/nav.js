/**
 * ScoreAR Navigation Engine & Menu Controller (nav.js)
 * Phase A: Navigation, Mobile Menu, and Section Routing
 * Strictly Rule 7 Compliant (<500 lines).
 */
(function(global) {
  'use strict';

  const NAV_CONFIG = [
    { id: 'home', hash: '#home', title: 'الرئيسية', icon: 'home', desc: 'مساحة التعلم والبدء للمتسابقين' },
    { id: 'worlds', hash: '#worlds', title: 'قاعة المنافسات', icon: 'planet', desc: 'مسارات / قاعات المنافسة', badge: 'حي' },
    { id: 'heroes', hash: 'characters.html', title: 'قاعة الأبطال (20)', icon: 'spark', desc: 'مستودع أبطال سكور آر' },
    { id: 'journey', hash: '#journey', title: 'رحلتي التعليمية', icon: 'route', desc: 'مسار التحدي الفردي والمهارات' },
    { id: 'studio', hash: '#studio', title: 'استوديو المعلم', icon: 'grid', desc: 'مساحة المعلم وإدارة المسابقات' },
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
      .scorear-back-home-btn {
        background: rgba(24, 23, 46, 0.85);
        border: 1px solid rgba(172, 139, 242, 0.32);
        color: #eceeff;
        border-radius: 999px;
        padding: 6px 13px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: inherit;
        white-space: nowrap;
        flex-shrink: 0;
        backdrop-filter: blur(12px);
        transition: all 0.2s cubic-bezier(0.2, 0.7, 0.2, 1);
      }
      .scorear-back-home-btn svg {
        width: 14px;
        height: 14px;
        color: #58dce3;
      }
      .scorear-back-home-btn:hover {
        background: rgba(117, 80, 239, 0.24);
        border-color: rgba(172, 139, 242, 0.6);
        color: #ffffff;
        transform: translateY(-1px);
      }
      @media (max-width: 640px) {
        .scorear-back-home-btn {
          padding: 5px 9px;
          font-size: 11px;
          gap: 4px;
        }
      }
      @media (max-width: 380px) {
        .scorear-back-home-btn {
          padding: 4px 8px;
          font-size: 10.5px;
          gap: 3px;
        }
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

    sidebar.inert = false;
    if (typeof global.syncSidebar === 'function') {
      try { global.syncSidebar(); } catch (e) {}
    }

    if (document.body) document.body.style.overflow = 'hidden';
    updateAriaExpanded(true);

    const firstLink = sidebar.querySelector('nav a');
    if (firstLink) setTimeout(() => firstLink.focus(), 50);
  }

  function closeSidebar() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    isMenuOpen = false;
    sidebar.classList.remove('open');
    sidebar.inert = true;

    if (typeof global.syncSidebar === 'function') {
      try { global.syncSidebar(); } catch (e) {}
    }

    if (document.body) document.body.style.overflow = '';
    updateAriaExpanded(false);

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

    document.addEventListener('click', (e) => {
      const menuTrigger = e.target.closest('[data-action="menu"], .mobile-menu, .launch-menu');
      if (menuTrigger) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toggleSidebar();
        return;
      }

      const closeTrigger = e.target.closest('[data-action="close-sidebar"], .sidebar-close-btn');
      if (closeTrigger) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeSidebar();
        return;
      }

      const sidebar = getSidebar();
      if (!sidebar) return;

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
      if (isMenuOpen && !e.target.closest('#sidebar, [data-action="menu"], .mobile-menu, .launch-menu')) {
        closeSidebar();
      }
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isMenuOpen) {
          e.preventDefault();
          closeSidebar();
          return;
        }
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

    window.addEventListener('hashchange', () => {
      closeSidebar();
      updateActiveNavLinks();
      mountTopbarNav();
    });
    window.addEventListener('popstate', () => {
      closeSidebar();
      updateActiveNavLinks();
    });

    if (isStandalonePage()) {
      document.querySelectorAll('#sidebar a[href^="#"]').forEach(a => {
        a.setAttribute('href', resolveNavHref(a.getAttribute('href')));
      });
      if (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') {
        document.querySelectorAll('[data-icon]').forEach(el => {
          if (!el.innerHTML.trim()) {
            const name = el.getAttribute('data-icon');
            const size = Number(el.getAttribute('data-size')) || 15;
            el.innerHTML = global.ScoreARUI.icon(name, { size });
          }
        });
      }
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
      navSlot.style.cssText = 'display:inline-flex;align-items:center;gap:6px;flex-shrink:0;';
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

    if (isHome) {
      navSlot.innerHTML = '';
      navSlot.style.display = 'none';
      return;
    }

    const homeIcon = (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function')
      ? global.ScoreARUI.icon('home', { size: 14 })
      : '<span>⌂</span>';

    navSlot.style.display = 'inline-flex';
    navSlot.innerHTML = `
      <button type="button" class="scorear-back-home-btn" onclick="ScoreARNav.goBackOrHome()" title="العودة للرئيسية">
        ${homeIcon}
        <span>الرئيسية</span>
      </button>
    `;
  }

  function renderDesktopNavDropdown(containerId) {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
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
