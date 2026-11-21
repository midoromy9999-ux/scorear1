/**
 * ScoreAR Registration UI Module (Unified Auth Hub: Teacher & Student Registration + Privacy Notice)
 * Complies with Phase B specifications, Rule 6 (Visual Identity), Rule 7 (<500 lines)
 */
(function(global) {
  'use strict';

  const $ = selector => document.querySelector(selector);
  let selectedStudentAvatar = 'char_01';

  function uiIcon(name, size = 16) {
    return (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function')
      ? global.ScoreARUI.icon(name, { size })
      : `<i data-icon="${name}"></i>`;
  }

  function renderTabs(activeTab) {
    if (global.ScoreARAuthUI && typeof global.ScoreARAuthUI.renderAuthTabs === 'function') {
      return global.ScoreARAuthUI.renderAuthTabs(activeTab);
    }
    return '';
  }

  function getModalElements() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    return { modal, modalTitle, modalBody };
  }

  // --- 1. Teacher Registration Modal ---
  function openTeacherRegistrationModal() {
    const { modal, modalTitle, modalBody } = getModalElements();
    if (!modal || !modalBody) return;

    if (modalTitle) modalTitle.textContent = 'تسجيل معلم جديد 👨‍🏫';
    modalBody.innerHTML = `
      <div class="modal-body-pad scorear-auth-portal">
        ${renderTabs('teacher')}

        <div style="text-align:center;margin-bottom:4px;">
          <div style="width:66px;height:66px;margin:0 auto 10px;border-radius:18px;border:1px solid rgba(172,139,242,0.45);box-shadow:0 0 24px rgba(142,100,239,0.28);overflow:hidden;background:#1b1c33;">
            <img src="assets/characters/teacher_ahmed.webp?v=20261106_real" alt="معلم سكور آر" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <h3 class="auth-modal-title" style="font-size:18px;">انضم إلى كادر معلّمي سكور آر</h3>
          <p class="auth-modal-sub">أنشئ حسابك وسيتولى فريق الإدارة مراجعته واعتماده لتفعيل صلاحيات الاستوديو.</p>
        </div>

        <form id="teacherRegisterForm" onsubmit="ScoreARRegisterUI.submitTeacherRegister(event)" style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label class="auth-field-label">الاسم الكامل (ثلاثي):</label>
            <input class="field auth-field-input" id="trName" type="text" placeholder="أ. أحمد صلاح رميح" required style="font-size:14px;">
          </div>

          <div>
            <label class="auth-field-label">البريد الإلكتروني المعتمد:</label>
            <input class="field auth-field-input" id="trEmail" type="email" placeholder="teacher@example.com" required dir="ltr" style="text-align:right;font-size:14px;">
          </div>

          <div>
            <label class="auth-field-label">كلمة المرور (8 خانات أو أكثر):</label>
            <div style="position:relative;">
              <input class="field auth-field-input" id="trPassword" type="password" placeholder="••••••••" minlength="8" required dir="ltr" style="text-align:left;letter-spacing:2px;font-weight:800;font-size:15px;padding-inline-end:44px;">
              <button type="button" class="auth-pass-toggle" onclick="ScoreARRegisterUI.toggleFieldPass('trPassword', this)">${uiIcon('eye', 16)}</button>
            </div>
            <small class="auth-field-hint">يجب أن تتكون من 8 خانات على الأقل لضمان أمان حسابك.</small>
          </div>

          <div class="auth-two-col">
            <div>
              <label class="auth-field-label">مادة التدريس:</label>
              <input class="field auth-field-input" id="trSubject" type="text" placeholder="اللغة العربية" required style="font-size:13px;">
            </div>
            <div>
              <label class="auth-field-label">المدرسة (اختياري):</label>
              <input class="field auth-field-input" id="trSchool" type="text" placeholder="مدرسة الأمل" style="font-size:13px;">
            </div>
          </div>

          <div class="auth-notice-violet">
            <span class="auth-notice-icon">${uiIcon('info', 15)}</span>
            <span><b>ملاحظة هامة:</b> ستكون حالة الحساب فور التسجيل <b>«قيد المراجعة»</b>، وسيتم إرسال بريد تفعيل إلى بريدك. يتطلب دخول الاستوديو موافقة الإدارة وضبط الصلاحيات.</span>
          </div>

          <div id="trErrorBox" class="auth-error-box" style="display:none;"></div>

          <button class="btn launch-primary full" id="trSubmitBtn" type="submit" style="margin-top:4px;font-weight:900;font-size:14.5px;padding:12px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;gap:8px;">
            <span>إرسال طلب التسجيل للمراجعة</span> ${uiIcon('arrow', 15)}
          </button>
        </form>
      </div>
    `;

    if (!modal.open) modal.showModal();
    if (typeof global.hydrate === 'function') global.hydrate(modal);
    setTimeout(() => { $('#trName')?.focus(); }, 100);
  }

  // --- 2. Student Registration Modal ---
  function openStudentRegistrationModal() {
    const { modal, modalTitle, modalBody } = getModalElements();
    if (!modal || !modalBody) return;

    selectedStudentAvatar = 'char_01';
    if (modalTitle) modalTitle.textContent = 'تسجيل طالب جديد 🎯';

    const heroes = [
      { id: 'char_01', name: 'زياد' }, { id: 'char_02', name: 'نور' },
      { id: 'char_05', name: 'ياسين' }, { id: 'char_07', name: 'عمر' },
      { id: 'char_12', name: 'بندق' }, { id: 'char_17', name: 'شرارة' }
    ];

    modalBody.innerHTML = `
      <div class="modal-body-pad scorear-auth-portal">
        ${renderTabs('student')}

        <div style="text-align:center;margin-bottom:4px;">
          <h3 class="auth-modal-title" style="font-size:18px;">انضم إلى أبطال سكور آر</h3>
          <p class="auth-modal-sub">سجّل حسابك الخاص لتحفظ أوسمتك ونقاطك وتنافس في كافة القاعات.</p>
        </div>

        <form id="studentRegisterForm" onsubmit="ScoreARRegisterUI.submitStudentRegister(event)" style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label class="auth-field-label">اسم العرض (الاسم الذي يظهر للجميع):</label>
            <input class="field auth-field-input" id="srDisplayName" type="text" placeholder="البطل عمر" required style="font-size:14px;">
          </div>

          <div>
            <label class="auth-field-label">اسم المستخدم (حروف إنجليزية وأرقام فقط):</label>
            <input class="field auth-field-input" id="srUsername" type="text" placeholder="omar_2026" pattern="^[a-zA-Z0-9_]{3,20}$" required dir="ltr" style="text-align:left;font-size:14px;">
            <small class="auth-field-hint">ستستخدم هذا الاسم لتسجيل دخولك دائماً (3 إلى 20 رمزاً).</small>
          </div>

          <div>
            <label class="auth-field-label">كلمة المرور (8 خانات أو أكثر):</label>
            <div style="position:relative;">
              <input class="field auth-field-input" id="srPassword" type="password" placeholder="••••••••" minlength="8" required dir="ltr" style="text-align:left;letter-spacing:2px;font-weight:800;font-size:15px;padding-inline-end:44px;">
              <button type="button" class="auth-pass-toggle" onclick="ScoreARRegisterUI.toggleFieldPass('srPassword', this)">${uiIcon('eye', 16)}</button>
            </div>
          </div>

          <div>
            <label class="auth-field-label">رمز الصف الدراسي من المعلم (اختياري - مثل SC...):</label>
            <input class="field auth-field-input" id="srClass" type="text" placeholder="اكتب رمز الصف مثل SC887612" style="font-size:13px;">
            <small class="auth-field-hint">إذا أعطاك المعلم رمز الصف (مثل SC887612) اكتبه هنا لإرسال طلب الانضمام لصفه مباشرةً.</small>
          </div>

          <div>
            <label class="auth-field-label">اختر بطلك المفضل:</label>
            <div class="scorear-hero-register-grid">
              ${heroes.map((h, i) => `
                <button type="button" class="avatar-card-picker auth-avatar-tile ${i===0?'selected':''}" onclick="ScoreARRegisterUI.selectStudentAvatar('${h.id}', this)">
                  <img src="assets/characters/animated/${h.id}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${h.name}" style="height:36px;object-fit:contain;">
                  <small>${h.name}</small>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="auth-notice-cyan">
            <span class="auth-notice-icon">${uiIcon('shield', 15)}</span>
            <span><b>بيان الخصوصية والأمان:</b> نحن في سكور آر نلتزم بأعلى معايير حماية وخصوصية الطلاب: <b>لا نطلب أي بريد شخصي أو رقم هاتف نهائياً</b>، وجميع البيانات مخصصة للمشاركة التعليمية الصفيّة الآمنة.</span>
          </div>

          <div id="srErrorBox" class="auth-error-box" style="display:none;"></div>

          <button class="btn launch-primary full" id="srSubmitBtn" type="submit" style="margin-top:4px;font-weight:900;font-size:14.5px;padding:12px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;gap:8px;">
            <span>تسجيل حساب طالب جديد</span> ${uiIcon('spark', 15)}
          </button>
        </form>
      </div>
    `;

    if (!modal.open) modal.showModal();
    if (typeof global.hydrate === 'function') global.hydrate(modal);
    setTimeout(() => { $('#srDisplayName')?.focus(); }, 100);
  }

  async function submitTeacherRegister(e) {
    e.preventDefault();
    const name = $('#trName')?.value.trim();
    const email = $('#trEmail')?.value.trim();
    const password = $('#trPassword')?.value;
    const subject = $('#trSubject')?.value.trim();
    const school = $('#trSchool')?.value.trim();
    const btn = $('#trSubmitBtn');
    const errBox = $('#trErrorBox');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin-inline-end:8px;vertical-align:middle;"></span> جارٍ إرسال طلب الاعتماد...';
    }
    if (errBox) errBox.style.display = 'none';

    try {
      await global.ScoreARAuth.registerTeacher({ name, email, password, subject, school });
      const { modalBody, modalTitle } = getModalElements();
      if (modalTitle) modalTitle.textContent = 'تم استلام طلب التسجيل بنجاح ✓';
      modalBody.innerHTML = `
        <div class="modal-body-pad" style="text-align:center;padding:24px 16px;">
          <div style="margin:0 auto 14px;display:inline-flex;">${global.ScoreARUI?.iconBox ? global.ScoreARUI.iconBox('clock', { size: 'lg', tone: 'violet' }) : uiIcon('clock', 36)}</div>
          <h3 class="auth-modal-title">مرحباً بك أ. ${name}</h3>
          <p class="auth-modal-sub" style="font-size:14px;line-height:1.6;margin-bottom:16px;">
            حسابك الآن <b>«قيد المراجعة والاعتماد»</b> من قِبل إدارة سكور آر.<br>
            تم إرسال رابط تأكيد إلى بريدك: <b class="auth-highlight-cyan">${email}</b>.<br>
            ستتمكن من تسجيل الدخول إلى استوديو المعلم فور تفعيل الحساب واعتماده.
          </p>
          <button class="btn launch-primary full" onclick="if(global.closeModal)global.closeModal()" style="font-weight:900;padding:12px;border-radius:12px;">
            حسناً، فهمت ذلك ✓
          </button>
        </div>
      `;
      if (global.toast) global.toast('تم تقديم طلبك بنجاح وهو قيد المراجعة');
    } catch(err) {
      if (errBox) {
        errBox.textContent = global.ScoreARAuth.mapAuthError(err);
        errBox.style.display = 'block';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>إرسال طلب التسجيل للمراجعة</span> ${uiIcon('arrow', 15)}`;
      }
    }
  }

  async function submitStudentRegister(e) {
    e.preventDefault();
    const displayName = $('#srDisplayName')?.value.trim();
    const username = $('#srUsername')?.value.trim();
    const password = $('#srPassword')?.value;
    const className = $('#srClass')?.value.trim();
    const avatarId = selectedStudentAvatar || 'char_01';
    const btn = $('#srSubmitBtn');
    const errBox = $('#srErrorBox');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin-inline-end:8px;vertical-align:middle;"></span> جارٍ إنشاء حساب البطل...';
    }
    if (errBox) errBox.style.display = 'none';

    try {
      const student = await global.ScoreARAuth.registerStudent({ displayName, username, password, className, avatarId });
      if (className && className.trim()) {
        const cleanCode = className.trim().toUpperCase();
        try {
          const svc = global.ScoreARClassroomsService;
          if (svc) {
            await svc.saveStudentProfile({ displayName, avatarId, grade: 'الصف الأول الثانوي' });
            await svc.requestJoinClass(cleanCode);
          }
        } catch(joinErr) { console.warn('Could not auto-join class code:', joinErr); }
      }
      if (global.closeModal) global.closeModal();
      if (global.toast) global.toast(`أهلاً بك يا ${displayName}! تم تسجيل حسابك بنجاح`);

      if (global.ScoreARAuthUI && typeof global.ScoreARAuthUI.updateTopActionsTeacher === 'function') {
        global.ScoreARAuthUI.updateTopActionsTeacher(student);
      }
      location.hash = '#journey';
      if (global.render) global.render();
    } catch(err) {
      if (errBox) {
        errBox.textContent = global.ScoreARAuth.mapAuthError(err);
        errBox.style.display = 'block';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>تسجيل حساب طالب جديد</span> ${uiIcon('spark', 15)}`;
      }
    }
  }

  function toggleFieldPass(fieldId, btn) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    if (field.type === 'password') {
      field.type = 'text';
      if (btn) btn.innerHTML = uiIcon('eyeOff', 16);
    } else {
      field.type = 'password';
      if (btn) btn.innerHTML = uiIcon('eye', 16);
    }
  }

  function selectStudentAvatar(id, el) {
    selectedStudentAvatar = id;
    document.querySelectorAll('.avatar-card-picker').forEach(c => {
      c.style.borderColor = '';
      c.classList.remove('selected');
    });
    if (el) {
      el.classList.add('selected');
    }
  }

  function openStudentForgotHelpModal() {
    const { modal, modalTitle, modalBody } = getModalElements();
    if (!modal || !modalBody) return;
    if (modalTitle) modalTitle.textContent = 'إعادة تعيين كلمة مرور الطالب 🔒';
    modalBody.innerHTML = `
      <div class="modal-body-pad" style="text-align:center;padding:20px 14px;">
        <div style="margin:0 auto 12px;display:inline-flex;">${global.ScoreARUI?.iconBox ? global.ScoreARUI.iconBox('shield', { size: 'lg', tone: 'cyan' }) : uiIcon('shield', 34)}</div>
        <h3 class="auth-modal-title" style="font-size:18px;margin-bottom:8px;">حماية الخصوصية أولاً</h3>
        <p class="auth-modal-sub" style="font-size:13px;line-height:1.6;margin-bottom:16px;">
          لأن حسابات الطلاب في سكور آر محمية تماماً ولا ترتبط بأي بريد إلكتروني أو رقم هاتف شخصي،
          يتم استعادة أو إعادة ضبط كلمة المرور بواسطة <b>معلّم الفصل</b> أو <b>إدارة المدرسة</b> من خلال استوديو المعلم.
        </p>
        <button class="btn launch-primary full" onclick="ScoreARAuthUI.openUnifiedLoginModal()" style="font-weight:900;padding:12px;border-radius:12px;">
          العودة لتسجيل الدخول
        </button>
      </div>
    `;
    if (!modal.open) modal.showModal();
  }

  const ScoreARRegisterUI = {
    openTeacherRegistrationModal,
    openStudentRegistrationModal,
    openStudentForgotHelpModal,
    submitTeacherRegister,
    submitStudentRegister,
    toggleFieldPass,
    selectStudentAvatar
  };

  global.ScoreARRegisterUI = ScoreARRegisterUI;
})(typeof window !== 'undefined' ? window : this);
