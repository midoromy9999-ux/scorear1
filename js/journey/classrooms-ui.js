/**
 * ScoreAR Classrooms & My Profile UI Component (05B2 Responsive UI)
 * Independent stage architecture (#scorearClassroomsStage) with Real-Time Cloud Sync.
 * Strictly Rule 7 Compliant (< 350 lines)
 */
(function(global) {
  'use strict';

  const ALL_CHARACTERS = [
    'char_01', 'char_02', 'char_03', 'char_04', 'char_05',
    'char_06', 'char_07', 'char_08', 'char_09', 'char_10',
    'char_11', 'char_12', 'char_13', 'char_14', 'char_15',
    'char_16', 'char_17', 'char_18', 'char_19', 'char_20'
  ];

  let activeReviewAction = null;
  let livePendingListeners = [];

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function getService() { return global.ScoreARClassroomsService || null; }
  function ui() {
    return global.ScoreARUI || { icon: () => '', iconBox: () => '', orbShowcase: () => '', cosmicBackdrop: () => '' };
  }
  function ic(name, size = 15) { return ui().icon ? ui().icon(name, { size }) : ''; }
  function titleIcon(name) { return `<span class="title-icon">${ic(name, 16)}</span>`; }

  function getOrCreateStage() {
    let s = document.getElementById('scorearClassroomsStage');
    if (!s) {
      s = document.createElement('div');
      s.id = 'scorearClassroomsStage';
      s.className = 'page scorear-classrooms-view scorear-open-page';
      const mainEl = document.getElementById('main');
      if (mainEl && mainEl.parentNode) mainEl.parentNode.insertBefore(s, mainEl.nextSibling);
      else document.body.appendChild(s);
    } else if (!s.classList.contains('scorear-open-page')) {
      s.classList.add('scorear-open-page');
    }
    return s;
  }

  function lockBtn(btn, text) {
    if (!btn) return () => {};
    const orig = btn.innerHTML, dis = btn.disabled;
    btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    if (text) btn.innerHTML = text;
    return () => { btn.disabled = dis; btn.removeAttribute('aria-busy'); btn.innerHTML = orig; };
  }

  function showFeedback(msg, type = 'info') {
    const fb = document.getElementById('classrooms-feedback');
    if (!fb) return;
    fb.className = `${type} show`;
    const symbol = type === 'success' ? '✓' : (type === 'error' ? '✕' : '✦');
    fb.innerHTML = `<span>${symbol}</span> <span>${esc(msg)}</span>`;
    setTimeout(() => { if (fb) fb.className = ''; }, 4500);
  }

  function selectCompanion(avatarId) {
    const previewImg = document.getElementById('profile-avatar-preview-img');
    const hiddenInput = document.getElementById('student-selected-avatar');
    if (previewImg) {
      previewImg.src = `assets/characters/animated/${avatarId}-idle.webp`;
      previewImg.onerror = () => { previewImg.src = `assets/characters/${avatarId}.webp`; };
    }
    if (hiddenInput) hiddenInput.value = avatarId;
    document.querySelectorAll('.companion-thumb').forEach(c => {
      c.classList.toggle('selected', c.dataset.avatar === avatarId);
    });
  }

  async function saveProfile() {
    const btn = document.getElementById('save-student-profile-btn');
    const unlock = lockBtn(btn, 'جاري الحفظ...');
    try {
      const displayName = document.getElementById('student-profile-name')?.value;
      const grade = document.getElementById('student-profile-grade')?.value;
      const avatarId = document.getElementById('student-selected-avatar')?.value;
      const svc = getService();
      if (svc) await svc.saveStudentProfile({ displayName, grade, avatarId });
      showFeedback('تم حفظ بيانات ملفك التعليمي بنجاح', 'success');
      await renderClassroomsView();
    } catch (e) {
      showFeedback(e.message || 'فشل حفظ الملف', 'error');
    } finally { unlock(); }
  }

  async function requestJoin() {
    const input = document.getElementById('join-class-code-input');
    const code = input?.value?.trim();
    if (!code) { showFeedback('يرجى إدخال رمز الصف أولاً.', 'error'); return; }
    const btn = document.getElementById('send-join-request-btn');
    const unlock = lockBtn(btn, 'جاري الإرسال...');
    try {
      const svc = getService();
      if (!svc) throw new Error('خدمة الصفوف غير متوفرة');
      const res = await svc.requestJoinClass(code);
      showFeedback(res.message, 'success');
      if (input) input.value = '';
      await renderClassroomsView();
    } catch (e) {
      showFeedback(e.message || 'فشل إرسال طلب الانضمام', 'error');
    } finally { unlock(); }
  }

  async function handleCreateClass(e) {
    if (e && e.preventDefault) e.preventDefault();
    await createClass();
  }

  async function createClass() {
    const name = document.getElementById('create-class-name')?.value?.trim();
    const subject = document.getElementById('create-class-subject')?.value?.trim();
    if (!name || !subject) { showFeedback('يرجى ملء جميع الحقول المطلوبة.', 'error'); return; }
    const btn = document.getElementById('create-class-btn');
    const unlock = lockBtn(btn, 'جاري إنشاء الصف...');
    try {
      const svc = getService();
      if (!svc) throw new Error('خدمة الصفوف غير متوفرة');
      const res = await svc.createClass({ name, subject });
      showFeedback(`تم إنشاء صف (${name}) وتوليد الرمز: ${res.classData.code}`, 'success');
      await renderClassroomsView();
    } catch (e) {
      showFeedback(e.message || 'فشل إنشاء الصف', 'error');
    } finally { unlock(); }
  }

  function copyClassCode(code) {
    if (!code) return;
    try { navigator.clipboard?.writeText(code)?.catch?.(() => {}); } catch(e){}
    showFeedback(`تم نسخ رمز الصف: ${code}`, 'info');
  }

  function copyInviteLink(code) {
    if (!code) return;
    const url = `${window.location.origin}${window.location.pathname}#classrooms?join=${encodeURIComponent(code)}`;
    try { navigator.clipboard?.writeText(url)?.catch?.(() => {}); } catch(e){}
    showFeedback(`تم نسخ رابط دعوة الطلاب المباشر: ${url}`, 'success');
  }

  function openReviewDialog(classId, uid, action, studentName) {
    activeReviewAction = { classId, uid, action, studentName: studentName || 'طالب' };
    const dialog = document.getElementById('review-dialog'), body = document.getElementById('review-dialog-body');
    const isApprove = action === 'approve';
    if (body) {
      const box = ui().iconBox ? ui().iconBox(isApprove ? 'checkCircle' : 'alert', { size: 'lg', tone: isApprove ? 'cyan' : 'danger', tilted: true }) : '';
      body.innerHTML = `
        <div style="margin-bottom:14px;display:flex;justify-content:center;">${box}</div>
        <h3 class="review-dialog-title">${isApprove ? 'قبول الطالب في الصف' : 'رفض طلب الانضمام'}</h3>
        <p class="review-dialog-desc">هل أنت متأكد من ${isApprove ? 'قبول' : 'رفض طلب'} الطالب <b>${esc(studentName || 'الطالب')}</b>؟</p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button id="review-dialog-cancel-btn" onclick="ScoreARClassrooms.closeReviewDialog()" class="btn launch-outline" style="padding:9px 18px;">إلغاء</button>
          <button id="review-dialog-confirm-btn" onclick="ScoreARClassrooms.confirmReviewAction()" class="btn launch-primary" style="padding:9px 22px;${isApprove ? '' : 'background:linear-gradient(110deg,#6a364e,#944769) !important;border-color:#c3849866 !important;'}">${ic(isApprove ? 'check' : 'close', 15)} ${isApprove ? 'تأكيد القبول' : 'تأكيد الرفض'}</button>
        </div>`;
    }
    if (dialog) dialog.classList.add('open');
  }

  function closeReviewDialog() {
    activeReviewAction = null;
    const dialog = document.getElementById('review-dialog');
    if (dialog) dialog.classList.remove('open');
  }

  async function confirmReviewAction() {
    if (!activeReviewAction) return;
    const { classId, uid, action, studentName } = activeReviewAction;
    const confBtn = document.getElementById('review-dialog-confirm-btn');
    const unlock = lockBtn(confBtn, 'جاري المعالجة...');
    try {
      const svc = getService();
      if (!svc) throw new Error('خدمة الصفوف غير متوفرة');
      await svc.reviewMembership({ classId, uid, action });
      showFeedback(action === 'approve' ? `تم اعتماد وانضمام الطالب (${studentName}) للصف!` : `تم رفض طلب الطالب (${studentName}).`, 'success');
      closeReviewDialog();
      await renderClassroomsView();
    } catch (e) {
      showFeedback(e.message || 'فشل تحديث الطلب', 'error');
    } finally { unlock(); }
  }

  function renderIntroBanner() {
    return `<section class="learning-intro"><div class="intro-copy"><div class="intro-pill"><span class="live-dot"></span> معًا نكتشف أكثر</div><h1>لكل طالب مكان.<br><span class="gradient-text">ولكل صف حكاية.</span></h1><p>مساحتك المتكاملة للتواصل داخل الصف، متابعة رفقاء المغامرة، وإنجاز التحديات التعليمية بروح الفريق الواحد.</p></div><div class="intro-visual"><div class="orbit"><img class="orbit-character" src="assets/characters/animated/char_07-idle.webp" alt="رفيق الصف الكرتوني" onerror="this.src='assets/characters/char_07.webp'"></div></div></section>`;
  }

  function renderGuestView() {
    const box = ui().iconBox ? ui().iconBox('school', { size: 'lg', tone: 'violet' }) : '';
    return `<div class="classrooms-card" style="text-align:center;padding:50px 24px;margin-top:24px;"><div style="margin-bottom:14px;display:flex;justify-content:center;">${box}</div><h2 class="classrooms-guest-title">أهلاً بك في فضاء الصفوف المدرسية</h2><p class="classrooms-guest-desc">سجّل الدخول بحسابك للوصول إلى صفوفك الدراسية، متابعة واجباتك، واختيار رفيق رحلتك الكرتوني.</p><button class="btn launch-primary" onclick="if(window.ScoreARAuthUI)window.ScoreARAuthUI.openUnifiedLoginModal();else if(window.openTeacherLoginModal)openTeacherLoginModal();" style="padding:12px 28px;font-size:14px;font-weight:800;">تسجيل الدخول الآن ${ic('arrow', 15)}</button></div>`;
  }

  function renderStudentView(user, profile, myClasses) {
    const prof = profile || { name: user?.displayName || 'بطل سكور آر', grade: 'الصف الأول الثانوي', avatarId: user?.avatarId || 'char_07' };
    const quickJoin = (getService()?.getQuickJoinCode?.()) || '';
    return `<div class="learning-layout"><aside><div class="classrooms-card"><div class="card-head"><h3 class="card-title">${titleIcon('users')} ملفي التعليمي</h3><span class="card-badge">طالب</span></div><div class="profile-avatar-preview"><img id="profile-avatar-preview-img" class="profile-avatar-img" src="assets/characters/animated/${prof.avatarId}-idle.webp" alt="الشخصية" onerror="this.src='assets/characters/${prof.avatarId}.webp'"><div><b class="profile-avatar-title">رفيق رحلتك المختار</b><small class="profile-avatar-sub">اختر شخصيتك المفضلة أدناه</small></div></div><input type="hidden" id="student-selected-avatar" value="${esc(prof.avatarId)}"><label class="form-label">اختر رفيق الرحلة (20 بطلاً):</label><div class="companion-grid">${ALL_CHARACTERS.map(cid => `<img src="assets/characters/${cid}.webp" class="companion-thumb ${cid === prof.avatarId ? 'selected' : ''}" data-avatar="${cid}" onclick="ScoreARClassrooms.selectCompanion('${cid}')" alt="${cid}">`).join('')}</div><div class="form-group"><label class="form-label" for="student-profile-name">اسمك داخل الصف:</label><input type="text" id="student-profile-name" class="form-input" value="${esc(prof.displayName || prof.name)}"></div><div class="form-group"><label class="form-label" for="student-profile-grade">المرحلة الدراسية:</label><select id="student-profile-grade" class="form-select"><option value="الصف الأول الثانوي" ${(prof.grade || '').includes('الأول') ? 'selected' : ''}>الصف الأول الثانوي</option><option value="الصف الثاني الثانوي" ${(prof.grade || '').includes('الثاني') ? 'selected' : ''}>الصف الثاني الثانوي</option><option value="الصف الثالث الثانوي" ${(prof.grade || '').includes('الثالث') ? 'selected' : ''}>الصف الثالث الثانوي</option><option value="المرحلة الإعدادية" ${(prof.grade || '').includes('الإعدادية') ? 'selected' : ''}>المرحلة الإعدادية</option></select></div><button class="btn launch-primary" id="save-student-profile-btn" onclick="ScoreARClassrooms.saveProfile()" style="width:100%;padding:11px;font-weight:800;border-radius:12px;justify-content:center;">${ic('save', 15)} حفظ ملفي</button></div><div class="classrooms-card"><div class="card-head"><h3 class="card-title">${titleIcon('key')} انضم إلى صفك</h3></div><div class="form-group"><label class="form-label" for="join-class-code-input">رمز الصف الدراسي:</label><input type="text" id="join-class-code-input" class="form-input" value="${esc(quickJoin)}" placeholder="مثال: SC84A9F2" style="text-align:center;font-family:monospace;letter-spacing:1px;font-weight:900;"></div><button class="btn launch-outline classrooms-join-btn" id="send-join-request-btn" onclick="ScoreARClassrooms.requestJoin()" style="width:100%;padding:11px;font-weight:800;border-radius:12px;justify-content:center;">${ic('send', 15)} إرسال طلب الانضمام</button></div></aside><main><div class="classrooms-card"><div class="card-head"><h3 class="card-title">${titleIcon('school')} صفوفي</h3><span class="card-badge">${myClasses.length} صفوف</span></div>${!myClasses.length ? `<div class="notice info">لم تنضم إلى أي صفوف دراسية بعد.<br>اطلب رمز الصف من معلمك وأدخله في خانة الانضمام على اليمين!</div>` : `<div id="class-list" style="display:grid;gap:12px;">${myClasses.map(c => { const isApproved = c.status === 'approved', isPending = c.status === 'pending'; return `<div class="class-card"><div class="class-card-head"><div><h4 class="class-card-title">${esc(c.name)}</h4><span class="class-card-subject">${esc(c.subject)} • أ. ${esc(c.teacherName || 'المعلم')}</span></div><span class="class-code">${esc(c.code)}</span></div><div class="class-card-status-row"><span class="class-card-status-label">حالة الانضمام:</span><span class="class-card-status-val" style="font-weight:800;color:${isApproved ? '#10b981' : (isPending ? '#d97706' : '#ef4444')};">${isApproved ? '✓ منضم ونشط' : (isPending ? 'قيد الاعتماد' : '✕ غير مفعل')}</span></div>${isApproved ? `<button class="btn launch-primary" onclick="ScoreARClassroomsHomework.openClassHomework('${c.id}')" style="width:100%;margin-top:10px;padding:7px;font-size:12px;font-weight:800;justify-content:center;">واجبات الصف ←</button>` : ''}</div>`; }).join('')}</div>`}</div></main></div>`;
  }

  function renderTeacherView(user, classes) {
    const list = classes || [];
    let totalPending = 0, totalEnrolled = 0;
    list.forEach(c => { totalPending += (c.pending || []).length; totalEnrolled += (c.students || []).length; });
    return `<div class="learning-layout"><aside><div class="classrooms-card"><div class="card-head"><h3 class="card-title">${titleIcon('spark')} حكاية صف جديد</h3><span class="card-badge">معلم</span></div><form id="create-form" onsubmit="ScoreARClassrooms.handleCreateClass(event)"><div class="form-group"><label class="form-label" for="create-class-name">اسم الصف:</label><input type="text" id="create-class-name" class="form-input" placeholder="مثال: الصف الأول الثانوي - 1" required></div><div class="form-group"><label class="form-label" for="create-class-subject">المادة التعليمية:</label><input type="text" id="create-class-subject" class="form-input" placeholder="مثال: اللغة العربية" required></div><button type="submit" class="btn launch-primary" id="create-class-btn" style="width:100%;padding:12px;font-weight:900;border-radius:12px;justify-content:center;">${ic('plus', 15)} إنشاء الصف وتوليد الرمز</button></form></div></aside><main>${totalPending > 0 ? `<div class="teacher-pending-alert"><div style="display:flex;align-items:center;gap:12px;"><span class="scorear-icon-box size-sm tone-cyan">${ic('bell', 16)}</span><div><b class="pending-alert-title">لديك (${totalPending}) طلب انضمام جديد بانتظار المراجعة</b><small class="pending-alert-sub">انقر لمراجعة الطلاب وقبولهم في الصفوف فوراً.</small></div></div><button class="scorear-gear-btn pending-alert-btn" onclick="document.getElementById('roster-section')?.scrollIntoView({behavior:'smooth'})">مراجعة الطلبات (${totalPending}) ←</button></div>` : ''}<div class="classrooms-card"><div class="card-head"><h3 class="card-title">${titleIcon('school')} صفوفي</h3><span class="card-badge">${list.length} صفوف</span></div>${!list.length ? `<div class="notice info">لم تنشئ أي صفوف بعد. أنشئ صفك الأول الآن وشارك الرمز أو رابط الدعوة مع طلابك!</div>` : `<div id="class-list" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(min(100%, 280px), 1fr));gap:14px;">${list.map(c => `<div class="class-card" id="card-${c.id}"><div class="class-card-head"><div><h4 class="class-card-title">${esc(c.name)}</h4><span class="class-card-subject">${esc(c.subject)}</span></div><span class="class-code" title="انقر لنسخ الرمز" onclick="ScoreARClassrooms.copyClassCode('${c.code}')">${esc(c.code)}</span></div><div class="class-card-counts"><span>الطلاب: <b class="cnt-students">${(c.students || []).length}</b></span><span>الطلبات: <b class="cnt-pending">${(c.pending || []).length}</b></span></div>${(c.pending || []).length > 0 ? `<div class="class-pending-strip"><span class="scorear-inline-icon class-pending-strip-text">${ic('bell', 13)} ${(c.pending || []).length} طلب بانتظار الموافقة</span><button class="scorear-gear-btn class-pending-strip-btn" onclick="document.getElementById('roster-section')?.scrollIntoView({behavior:'smooth'})">مراجعة ←</button></div>` : ''}<div style="display:flex;gap:6px;margin-top:10px;"><button class="scorear-gear-btn" onclick="ScoreARClassrooms.copyClassCode('${c.code}')" style="flex:1;padding:7px 10px;font-size:11.5px;">${ic('copy', 13)} <span>نسخ الرمز</span></button><button class="scorear-gear-btn classrooms-invite-btn" onclick="ScoreARClassrooms.copyInviteLink('${c.code}')" style="flex:1;padding:7px 10px;font-size:11.5px;">${ic('link', 13)} <span>رابط الدعوة</span></button></div><div style="display:flex;gap:6px;margin-top:8px;"><button class="btn launch-outline" onclick="document.getElementById('roster-section')?.scrollIntoView({behavior:'smooth'})" style="flex:1;padding:7px;font-size:11.5px;justify-content:center;">الطلاب والطلبات ←</button><button class="btn launch-primary" onclick="ScoreARClassroomsHomework.openClassHomework('${c.id}')" style="flex:1;padding:7px;font-size:11.5px;font-weight:800;justify-content:center;">واجبات الصف ←</button></div></div>`).join('')}</div>`}</div><section id="roster-section" class="classrooms-card"><div class="card-head"><h3 class="card-title">${titleIcon('users')} قائمة الصف</h3><div style="display:flex;gap:6px;flex-wrap:wrap;"><span class="card-badge badge-pending">طلبات الانضمام (${totalPending})</span><span class="card-badge badge-approved">طلاب الصف (${totalEnrolled})</span></div></div><div style="margin-bottom:20px;"><h4 class="roster-subhead is-pending">طلبات الانضمام المعلقة:</h4>${totalPending === 0 ? `<p class="roster-empty-msg">لا توجد طلبات انضمام معلقة حالياً.</p>` : `${list.map(c => (c.pending || []).map(r => `<div class="member-row"><div class="member-info"><img src="assets/characters/${r.avatarId || 'char_01'}.webp" class="member-avatar" alt="${esc(r.displayName || r.name)}"><div><div class="member-name">${esc(r.displayName || r.name)}</div><div class="member-meta">الصف: ${esc(c.name)} • ${esc(r.grade || '')}</div></div></div><div class="member-actions"><button class="scorear-gear-btn btn-approve-member" onclick="ScoreARClassrooms.openReviewDialog('${c.id}','${r.uid || r.id}','approve','${esc(r.displayName || r.name)}')">${ic('check', 13)} قبول</button><button class="scorear-gear-btn btn-reject-member" onclick="ScoreARClassrooms.openReviewDialog('${c.id}','${r.uid || r.id}','reject','${esc(r.displayName || r.name)}')">${ic('close', 13)} رفض</button></div></div>`).join('')).join('')}`}</div><div><h4 class="roster-subhead is-approved">طلاب الصف المعتمدون:</h4>${totalEnrolled === 0 ? `<p class="roster-empty-msg">لم يتم اعتماد أي طلاب حتى الآن.</p>` : `${list.map(c => (c.students || []).map(s => `<div class="member-row"><div class="member-info"><img src="assets/characters/${s.avatarId || 'char_01'}.webp" class="member-avatar" alt="${esc(s.displayName || s.name)}"><div><div class="member-name">${esc(s.displayName || s.name)}</div><div class="member-meta">الصف: ${esc(c.name)} • ${esc(s.grade || '')}</div></div></div><span class="scorear-control-pill xp-pill">${ic('star', 13)} ${s.xp || 100} XP</span></div>`).join('')).join('')}`}</div></section></main></div><div id="review-dialog"><div class="dialog-backdrop" onclick="ScoreARClassrooms.closeReviewDialog()"></div><div class="dialog-box" id="review-dialog-body"></div></div>`;
  }

  function syncTeacherRealtime(classIds) {
    const validIds = (classIds || []).filter(Boolean);
    const idKey = validIds.slice().sort().join(',');
    if (window._lastSubscribedClassKey === idKey) return;
    window._lastSubscribedClassKey = idKey;
    livePendingListeners.forEach(l => { try { l.ref.off('value', l.fn); } catch(e){} });
    livePendingListeners = [];
    const db = getService()?.getDb ? getService().getDb() : (window.firebase?.database?.());
    if (!db || !validIds.length) return;
    validIds.forEach(id => {
      const ref = db.ref(`scorear_learning_v1/classes/${id}/pending`);
      let isInitial = true;
      const fn = ref.on('value', () => {
        if (isInitial) { isInitial = false; return; }
        clearTimeout(window._pendingDebounce);
        window._pendingDebounce = setTimeout(() => {
          if (window.location.hash.startsWith('#classrooms') && !window.location.hash.includes('?hw=')) {
            renderClassroomsView({ preserveScroll: true });
          }
        }, 400);
      });
      livePendingListeners.push({ ref, fn });
    });
  }

  async function renderClassroomsView(opts = {}) {
    const stage = getOrCreateStage();
    const mainEl = document.getElementById('main');
    if (mainEl) mainEl.style.display = 'none';
    stage.style.display = 'block';

    const savedY = (opts.preserveScroll || window.scrollY > 0) ? window.scrollY : null;
    const svc = getService();
    const actor = svc ? (await svc.getCurrentActor()) : null;

    let contentHtml = '';
    if (!actor) contentHtml = renderGuestView();
    else if (actor.isTeacher) {
      const classes = svc ? (await svc.loadMyClasses()) : [];
      contentHtml = renderTeacherView(actor, classes);
      syncTeacherRealtime(classes.map(c => c.id));
    } else {
      const profile = svc ? (await svc.getStudentProfile(actor.uid)) : null;
      const myClasses = svc ? (await svc.loadMyClasses()) : [];
      contentHtml = renderStudentView(actor, profile, myClasses);
    }

    const backdrop = ui().cosmicBackdrop ? ui().cosmicBackdrop() : '';
    stage.innerHTML = `${backdrop}<div id="classrooms-feedback"></div>${renderIntroBanner()}${contentHtml}`;
    document.querySelectorAll('[data-nav]').forEach(a => {
      a.classList.toggle('active', a.dataset.nav === 'classrooms' || (a.getAttribute('href') || '').includes('#classrooms'));
    });
    const bc = document.getElementById('breadcrumb');
    if (bc) bc.textContent = 'مساحتك / ملفي وصفوفي';
    if (savedY !== null && savedY > 0) window.scrollTo({ top: savedY, behavior: 'instant' });
  }

  function openView() {
    if (window.location.hash !== '#classrooms') window.location.hash = '#classrooms';
    else renderClassroomsView();
  }

  function handleRoute() {
    const hash = window.location.hash || '';
    if (hash.startsWith('#classrooms?hw=')) return;
    const stage = document.getElementById('scorearClassroomsStage'), mainEl = document.getElementById('main');
    if (hash.startsWith('#classrooms')) setTimeout(() => renderClassroomsView(), 10);
    else {
      window._lastSubscribedClassKey = null;
      livePendingListeners.forEach(l => { try { l.ref.off('value', l.fn); } catch(e){} });
      livePendingListeners = [];
      if (stage) stage.style.display = 'none';
      if (mainEl && mainEl.style.display === 'none') mainEl.style.display = '';
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', handleRoute);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', handleRoute);
    else handleRoute();
  }

  const ScoreARClassrooms = {
    openView, openClassesModal: openView, renderClassroomsView, showFeedback, selectCompanion,
    saveProfile, requestJoin, handleCreateClass, createClass, copyClassCode, copyInviteLink,
    openReviewDialog, closeReviewDialog, confirmReviewAction, getOrCreateStage
  };

  global.ScoreARClassrooms = ScoreARClassrooms;
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARClassrooms;
})(typeof window !== 'undefined' ? window : this);
