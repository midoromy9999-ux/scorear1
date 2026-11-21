/**
 * ScoreAR Unified Authentication UI Module (Unified Login & Session Status)
 * Complies with Phase B specifications, Rule 6 (Visual Identity), Rule 7 (<500 lines)
 */
(function(global) {
  'use strict';

  const $ = selector => document.querySelector(selector);

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function uiIcon(name, size = 16) {
    return (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function')
      ? global.ScoreARUI.icon(name, { size })
      : `<i data-icon="${name}"></i>`;
  }

  function renderAuthTabs(activeTab = 'login') {
    return `
      <div class="scorear-auth-tabs" role="tablist" aria-label="بوابة الدخول والتسجيل الموحدة">
        <button type="button" role="tab" aria-selected="${activeTab === 'login'}" class="scorear-auth-tab ${activeTab === 'login' ? 'is-active' : ''}" onclick="ScoreARAuthUI.openUnifiedLoginModal()">
          ${uiIcon('logIn', 15)} <span>تسجيل الدخول</span>
        </button>
        <button type="button" role="tab" aria-selected="${activeTab === 'student'}" class="scorear-auth-tab ${activeTab === 'student' ? 'is-active' : ''}" onclick="ScoreARRegisterUI.openStudentRegistrationModal()">
          ${uiIcon('spark', 15)} <span>طالب جديد</span>
        </button>
        <button type="button" role="tab" aria-selected="${activeTab === 'teacher'}" class="scorear-auth-tab ${activeTab === 'teacher' ? 'is-active' : ''}" onclick="ScoreARRegisterUI.openTeacherRegistrationModal()">
          ${uiIcon('graduation', 15)} <span>معلم جديد</span>
        </button>
      </div>
    `;
  }

  const ScoreARAuthUI = {
    renderAuthTabs,
    uiIcon,
    togglePassword: function() {
      const input = $('#loginPassword');
      const btn = $('#toggleLoginPasswordBtn');
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        if (btn) btn.innerHTML = uiIcon('eyeOff', 16);
      } else {
        input.type = 'password';
        if (btn) btn.innerHTML = uiIcon('eye', 16);
      }
    },

    forgotPassword: async function() {
      const idInput = $('#loginIdentifier');
      const val = idInput ? idInput.value.trim() : '';
      const errBox = $('#loginErrorBox');

      if (!val) {
        if (errBox) {
          errBox.textContent = 'يرجى إدخال البريد الإلكتروني (للمعلم) أو اسم المستخدم (للطالب) أولاً.';
          errBox.style.color = '#ff8a8a';
          errBox.style.background = 'rgba(255,107,107,0.15)';
          errBox.style.display = 'block';
        }
        if (idInput) idInput.focus();
        return;
      }

      if (!val.includes('@')) {
        if (global.ScoreARRegisterUI && typeof global.ScoreARRegisterUI.openStudentForgotHelpModal === 'function') {
          global.ScoreARRegisterUI.openStudentForgotHelpModal();
        }
        return;
      }

      try {
        if (errBox) errBox.style.display = 'none';
        await global.ScoreARAuth.sendPasswordReset(val);
        if (errBox) {
          errBox.textContent = `✓ تم إرسال رابط إعادة ضبط كلمة المرور إلى ${val}. يرجى تفقد صندوق الوارد.`;
          errBox.style.color = '#52d9ed';
          errBox.style.background = 'rgba(82,217,237,0.15)';
          errBox.style.border = '1px solid rgba(82,217,237,0.3)';
          errBox.style.display = 'block';
        }
      } catch(err) {
        if (errBox) {
          errBox.textContent = global.ScoreARAuth.mapAuthError(err);
          errBox.style.color = '#ff8a8a';
          errBox.style.background = 'rgba(255,107,107,0.15)';
          errBox.style.display = 'block';
        }
      }
    },

    submitLogin: async function(e) {
      e.preventDefault();
      const idInput = $('#loginIdentifier');
      const passInput = $('#loginPassword');
      const btn = $('#loginSubmitBtn');
      const errBox = $('#loginErrorBox');

      const identifier = idInput ? idInput.value.trim() : '';
      const pass = passInput ? passInput.value : '';

      if (!identifier || !pass) {
        if (errBox) {
          errBox.textContent = 'يرجى إدخال اسم المستخدم/البريد وكلمة المرور.';
          errBox.style.color = '#ff8a8a';
          errBox.style.display = 'block';
        }
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin-inline-end:8px;vertical-align:middle;"></span> جارٍ التحقق وتأمين الجلسة...';
      }
      if (errBox) errBox.style.display = 'none';

      try {
        const user = await global.ScoreARAuth.login(identifier, pass);
        if (global.closeModal) global.closeModal();

        updateTopActionsTeacher(user);

        if (user.role === 'teacher' || user.role === 'admin') {
          if (global.toast) global.toast(`مرحباً بك أ. ${user.displayName}! تم تسجيل الدخول بنجاح`);
          location.hash = '#studio';
        } else {
          if (global.toast) global.toast(`أهلاً بالبطل ${user.displayName}! تم تسجيل الدخول بنجاح`);
          location.hash = '#journey';
        }

        if (global.render) global.render();
      } catch(err) {
        if (errBox) {
          errBox.textContent = global.ScoreARAuth.mapAuthError(err);
          errBox.style.color = '#ff8a8a';
          errBox.style.background = 'rgba(255,107,107,0.15)';
          errBox.style.border = '1px solid rgba(255,107,107,0.3)';
          errBox.style.display = 'block';
        }
        if (passInput) {
          passInput.value = '';
          passInput.focus();
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>تسجيل الدخول</span> ${uiIcon('arrow', 16)}`;
        }
      }
    },

    openUnifiedLoginModal: function() {
      openAuthModal('login');
    }
  };

  function openAuthModal(mode = 'login') {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalBody) return;

    if (modalTitle) modalTitle.textContent = 'بوابة الدخول إلى سكور آر 🔐';
    modalBody.innerHTML = `
      <div class="modal-body-pad scorear-auth-portal">
        ${renderAuthTabs('login')}

        <div style="text-align:center;margin-bottom:4px;">
          <span class="launch-pill" style="margin-bottom:8px;"><span class="live-dot"></span> بوابة الحسابات الموحدة</span>
          <h3 class="auth-modal-title">تسجيل الدخول الموحد</h3>
          <p class="auth-modal-sub">للمعلمين والطلاب والإدارة المسجلين في مكان واحد</p>
        </div>

        <form id="unifiedLoginForm" onsubmit="ScoreARAuthUI.submitLogin(event)" style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label class="auth-field-label">البريد الإلكتروني (للمعلم) أو اسم المستخدم (للطالب):</label>
            <input class="field auth-field-input" id="loginIdentifier" type="text" placeholder="ahmed@example.com أو omar_2026" autocomplete="username" required dir="ltr" style="text-align:right;font-size:14px;">
          </div>

          <div>
            <label class="auth-field-label">كلمة المرور السرية:</label>
            <div style="position:relative;">
              <input class="field auth-field-input" id="loginPassword" type="password" placeholder="••••••••" autocomplete="current-password" required dir="ltr" style="text-align:left;letter-spacing:2px;font-weight:800;font-size:16px;padding-inline-end:44px;">
              <button type="button" id="toggleLoginPasswordBtn" class="auth-pass-toggle" onclick="ScoreARAuthUI.togglePassword()" aria-label="إظهار أو إخفاء كلمة المرور">
                ${uiIcon('eye', 16)}
              </button>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;flex-wrap:wrap;gap:6px;">
            <span class="scorear-inline-icon auth-meta-note">${uiIcon('lock', 13)} جلسة آمنة تنتهي مع إغلاق التبويب</span>
            <button type="button" class="auth-forgot-link" onclick="ScoreARAuthUI.forgotPassword()">نسيت كلمة المرور؟</button>
          </div>

          <div id="loginErrorBox" class="auth-error-box" style="display:none;"></div>

          <button class="btn launch-primary full" id="loginSubmitBtn" type="submit" style="margin-top:6px;font-weight:900;font-size:15px;padding:13px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;gap:8px;">
            <span>تسجيل الدخول</span> ${uiIcon('arrow', 16)}
          </button>
        </form>

        <div class="auth-footer-bar">
          <span class="auth-meta-note" style="font-size:11.5px;font-weight:700;">مستخدم جديد؟ انتقل للتسجيل المباشر:</span>
          <div style="display:flex;gap:8px;">
            <button type="button" onclick="ScoreARRegisterUI.openStudentRegistrationModal()" class="scorear-gear-btn">${uiIcon('spark', 13)} <span>طالب جديد</span></button>
            <button type="button" onclick="ScoreARRegisterUI.openTeacherRegistrationModal()" class="scorear-gear-btn">${uiIcon('graduation', 13)} <span>معلم جديد</span></button>
          </div>
        </div>
      </div>
    `;

    if (!modal.open) modal.showModal();
    if (typeof global.hydrate === 'function') global.hydrate(modal);
    setTimeout(() => { const em = $('#loginIdentifier'); if(em) em.focus(); }, 100);
  }

  function updateTopActionsTeacher(user) {
    const isTeacher = user && (user.role === 'admin' || user.role === 'teacher');
    const isStudent = user && (user.role === 'student' && !user.isAnonymous);
    document.body.classList.toggle('is-logged-in', !!(isTeacher || isStudent));

    const area = document.getElementById('topActionsArea');
    if (area) {
      if (isTeacher) {
        area.innerHTML = `<div class="topbar-user-actions">
          <a href="#studio" class="scorear-control-pill topbar-studio-pill">
            ${uiIcon('graduation', 15)} <span class="topbar-teacher-prefix">${escapeHtml(user.displayName || 'أ. أحمد رميح')} · </span><span>الاستوديو</span>
          </a>
          <button class="scorear-gear-btn topbar-logout-btn" data-action="logout" aria-label="خروج">${uiIcon('logOut', 14)} <span class="topbar-logout-text">خروج</span></button>
        </div>`;
      } else if (isStudent) {
        area.innerHTML = `<div class="topbar-user-actions">
          <button class="nav-join topbar-join-compact" data-action="join">${uiIcon('key', 14)} <span>رمز قاعة</span></button>
          <a href="#journey" class="scorear-control-pill topbar-desktop-only" style="border-color:rgba(88,220,227,0.35);">
            ${uiIcon('route', 14)} <span>رحلتي</span>
          </a>
          <a href="#classrooms" class="scorear-control-pill topbar-desktop-only" style="border-color:rgba(172,139,242,0.35);">
            ${uiIcon('school', 14)} <span>${escapeHtml(user.displayName || 'البطل')}</span>
          </a>
          <button class="scorear-gear-btn topbar-logout-btn" data-action="logout" aria-label="خروج">${uiIcon('logOut', 13)} <span class="topbar-logout-text">خروج</span></button>
        </div>`;
      } else {
        area.innerHTML = `<button class="nav-join join-top" data-action="join">${uiIcon('key', 14)} <span class="join-label-full">دخول القاعة بالرمز</span><span class="join-label-short">رمز قاعة</span></button><button class="btn launch-primary small topbar-login-btn" data-action="unified-login">دخول ${uiIcon('arrow', 14)}</button>`;
      }
      if (global.hydrate) global.hydrate(area);
    }

    const launchActions = document.querySelector('.launch-nav-actions');
    if (launchActions) {
      const themeBtn = `<button type="button" class="scorear-theme-toggle" data-action="toggle-theme" title="تبديل الوضع النهاري / الليلي">${uiIcon('sun', 15)}<span>نهاري</span></button>`;
      if (isTeacher) {
        launchActions.innerHTML = `
          ${themeBtn}
          <button class="nav-join" data-action="join">${uiIcon('key', 14)} <span>دخول القاعة بالرمز</span></button>
          <a href="#studio" class="btn launch-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:12px;font-weight:800;font-size:13px;">${uiIcon('grid', 15)} <span>استوديو المعلم</span></a>
          <button class="scorear-gear-btn launch-nav-logout topbar-logout-btn" data-action="logout" style="padding:8px 12px;">${uiIcon('logOut', 14)} <span>خروج</span></button>
          <button class="icon-btn launch-menu" data-action="menu" aria-label="فتح القائمة">${uiIcon('menu', 18)}</button>
        `;
      } else if (isStudent) {
        launchActions.innerHTML = `
          ${themeBtn}
          <button class="nav-join" data-action="join">${uiIcon('key', 14)} <span>دخول القاعة بالرمز</span></button>
          <a href="#journey" class="btn launch-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:12px;font-weight:800;font-size:13px;">${uiIcon('route', 15)} <span>رحلتي التعليمية</span></a>
          <button class="scorear-gear-btn launch-nav-logout topbar-logout-btn" data-action="logout" style="padding:8px 12px;">${uiIcon('logOut', 14)} <span>خروج</span></button>
          <button class="icon-btn launch-menu" data-action="menu" aria-label="فتح القائمة">${uiIcon('menu', 18)}</button>
        `;
      } else {
        launchActions.innerHTML = `
          ${themeBtn}
          <button class="nav-join" data-action="join">${uiIcon('key', 14)} <span>دخول القاعة بالرمز</span></button>
          <button class="btn launch-primary" data-action="unified-login">دخول / حساب جديد ${uiIcon('arrow', 14)}</button>
          <button class="icon-btn launch-menu" data-action="menu" aria-label="فتح القائمة">${uiIcon('menu', 18)}</button>
        `;
      }
      if (global.hydrate) global.hydrate(launchActions);
      if (global.ScoreARNav && typeof global.ScoreARNav.applyTheme === 'function') {
        global.ScoreARNav.applyTheme(global.ScoreARNav.getTheme());
      }
    }
  }

  // Global Click Delegations for Auth Actions
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'teacher-login' || action === 'unified-login') {
      e.preventDefault();
      ScoreARAuthUI.openUnifiedLoginModal();
    } else if (action === 'register-teacher') {
      e.preventDefault();
      if (global.ScoreARRegisterUI) global.ScoreARRegisterUI.openTeacherRegistrationModal();
    } else if (action === 'register-student') {
      e.preventDefault();
      if (global.ScoreARRegisterUI) global.ScoreARRegisterUI.openStudentRegistrationModal();
    } else if (action === 'logout') {
      e.preventDefault();
      global.ScoreARAuth.logout().then(() => {
        if (global.toast) global.toast('تم تسجيل الخروج بنجاح');
        updateTopActionsTeacher(null);
        location.hash = '#home';
        if (global.render) global.render();
      });
    }
  });

  ScoreARAuthUI.escapeHtml = escapeHtml;
  ScoreARAuthUI.openAuthModal = openAuthModal;
  ScoreARAuthUI.updateTopActionsTeacher = updateTopActionsTeacher;
  global.ScoreARAuthUI = ScoreARAuthUI;
  global.openAuthModal = openAuthModal;
})(typeof window !== 'undefined' ? window : this);
