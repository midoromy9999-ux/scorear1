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
          <h3 style="color:#ffffff;font-size:20px;font-weight:900;margin-bottom:4px;">تسجيل الدخول الموحد</h3>
          <p style="color:#a1a4be;font-size:12px;margin-bottom:0;">للمعلمين والطلاب والإدارة المسجلين في مكان واحد</p>
        </div>

        <form id="unifiedLoginForm" onsubmit="ScoreARAuthUI.submitLogin(event)" style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="display:block;color:#ddd8ff;font-size:12px;font-weight:700;margin-bottom:6px;">البريد الإلكتروني (للمعلم) أو اسم المستخدم (للطالب):</label>
            <input class="field" id="loginIdentifier" type="text" placeholder="ahmed@example.com أو omar_2026" autocomplete="username" required dir="ltr" style="text-align:right;font-weight:700;font-size:14px;background:#111426;border-radius:12px;width:100%;">
          </div>

          <div>
            <label style="display:block;color:#ddd8ff;font-size:12px;font-weight:700;margin-bottom:6px;">كلمة المرور السرية:</label>
            <div style="position:relative;">
              <input class="field" id="loginPassword" type="password" placeholder="••••••••" autocomplete="current-password" required dir="ltr" style="text-align:left;letter-spacing:2px;font-weight:800;font-size:16px;background:#111426;border-radius:12px;padding-inline-end:44px;width:100%;">
              <button type="button" id="toggleLoginPasswordBtn" onclick="ScoreARAuthUI.togglePassword()" style="position:absolute;inset-inline-end:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:#a1a4be;cursor:pointer;padding:6px;display:inline-flex;align-items:center;" aria-label="إظهار أو إخفاء كلمة المرور">
                ${uiIcon('eye', 16)}
              </button>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
            <span class="scorear-inline-icon" style="color:#878aa6;font-size:11px;">${uiIcon('lock', 13)} جلسة آمنة تنتهي مع إغلاق التبويب</span>
            <button type="button" onclick="ScoreARAuthUI.forgotPassword()" style="background:none;border:none;color:#58dce3;font-size:12px;font-weight:700;cursor:pointer;text-decoration:underline;">نسيت كلمة المرور؟</button>
          </div>

          <div id="loginErrorBox" style="display:none;color:#ff8a8a;font-size:13px;text-align:center;background:rgba(255,107,107,0.12);padding:10px;border-radius:12px;border:1px solid rgba(255,107,107,0.28);line-height:1.5;"></div>

          <button class="btn launch-primary full" id="loginSubmitBtn" type="submit" style="margin-top:6px;font-weight:900;font-size:15px;padding:13px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;gap:8px;">
            <span>تسجيل الدخول</span> ${uiIcon('arrow', 16)}
          </button>
        </form>

        <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <span style="font-size:11.5px;color:#878aa6;font-weight:700;">مستخدم جديد؟ انتقل للتسجيل المباشر:</span>
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
        area.innerHTML = `<div style="display:flex;align-items:center;gap:8px;">
          <a href="#studio" class="scorear-control-pill" style="text-decoration:none;border-color:rgba(172,139,242,0.38);">
            ${uiIcon('graduation', 15)} <span>${escapeHtml(user.displayName || 'أ. أحمد رميح')} · الاستوديو</span>
          </a>
          <button class="scorear-gear-btn" data-action="logout" style="border-color:rgba(255,107,107,0.35);color:#fca5a5;">${uiIcon('logOut', 14)} <span>خروج</span></button>
        </div>`;
      } else if (isStudent) {
        area.innerHTML = `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <button class="nav-join" data-action="join" style="padding:6px 11px;font-size:11.5px;">${uiIcon('key', 14)} <span>رمز قاعة</span></button>
          <a href="#journey" class="scorear-control-pill" style="text-decoration:none;border-color:rgba(88,220,227,0.35);">
            ${uiIcon('route', 14)} <span>رحلتي</span>
          </a>
          <a href="#classrooms" class="scorear-control-pill" style="text-decoration:none;border-color:rgba(172,139,242,0.35);">
            ${uiIcon('school', 14)} <span>${escapeHtml(user.displayName || 'البطل')}</span>
          </a>
          <button class="scorear-gear-btn" data-action="logout" style="border-color:rgba(255,107,107,0.35);color:#fca5a5;">${uiIcon('logOut', 13)} <span>خروج</span></button>
        </div>`;
      } else {
        area.innerHTML = `<button class="nav-join join-top" data-action="join">${uiIcon('key', 14)} <span>دخول القاعة بالرمز</span></button><button class="btn launch-primary small" data-action="unified-login" style="padding:7px 14px;border-radius:10px;font-weight:800;">دخول ${uiIcon('arrow', 14)}</button>`;
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
          <button class="scorear-gear-btn" data-action="logout" style="border-color:rgba(255,107,107,0.4);color:#fca5a5;padding:8px 12px;">${uiIcon('logOut', 14)} <span>خروج</span></button>
          <button class="icon-btn launch-menu" data-action="menu" aria-label="فتح القائمة">${uiIcon('menu', 18)}</button>
        `;
      } else if (isStudent) {
        launchActions.innerHTML = `
          ${themeBtn}
          <button class="nav-join" data-action="join">${uiIcon('key', 14)} <span>دخول القاعة بالرمز</span></button>
          <a href="#journey" class="btn launch-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:12px;font-weight:800;font-size:13px;">${uiIcon('route', 15)} <span>رحلتي التعليمية</span></a>
          <button class="scorear-gear-btn" data-action="logout" style="border-color:rgba(255,107,107,0.4);color:#fca5a5;padding:8px 12px;">${uiIcon('logOut', 14)} <span>خروج</span></button>
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
