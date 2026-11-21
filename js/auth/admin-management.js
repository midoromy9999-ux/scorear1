/**
 * ScoreAR Admin Hub & Account Management Engine (admin-management.js)
 * Phase E: Full Admin Control Panel & Role Management
 * Four Tabs: 1. Teacher Requests (طلبات المعلمين) 2. Teachers (المعلمون) 3. Students (الطلاب) 4. Audit Log (سجل العمليات)
 * Strictly Rule 7 Compliant (<500 lines).
 */
(function (global) {
  'use strict';

  let currentTab = 'requests';
  let cachedRequests = [];
  let cachedTeachers = [];
  let cachedStudents = [];
  let searchQuery = '';
  const uiIc = (n, s = 14) => global.ScoreARUI?.icon?.(n, { size: s }) || '';
  const uiBox = (n, t = 'violet', s = 'md') => global.ScoreARUI?.iconBox?.(n, { size: s, tone: t }) || '';

  function getDb() {
    return (global.ScoreARAuth && global.ScoreARAuth.getDb)
      ? global.ScoreARAuth.getDb()
      : (global.firebase && global.firebase.database ? global.firebase.database() : null);
  }

  function getCurrentUser() {
    return (global.ScoreARAuth && global.ScoreARAuth.getUser)
      ? global.ScoreARAuth.getUser()
      : null;
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatDate(ts) {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(ts);
    }
  }

  async function callApi(body) {
    let idToken = null;
    const auth = global.firebase && global.firebase.auth ? global.firebase.auth() : null;
    if (auth && auth.currentUser) {
      idToken = await auth.currentUser.getIdToken(true);
    }
    const apiUrl = (typeof window !== 'undefined' && window.SCOREAR_API_URL ? window.SCOREAR_API_URL : '') + '/api/account-request';
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (idToken || '')
      },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'حدث خطأ في الخادم (رمز ' + res.status + ')');
    }
    return data;
  }

  function openAdminHub() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      if (global.toast) global.toast('عفواً، هذه اللوحة مخصصة للأدمن فقط.');
      return;
    }

    let modal = document.getElementById('scorearAdminHubModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'scorearAdminHubModal';
      modal.className = 'modal-backdrop';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,7,18,0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
      document.body.appendChild(modal);
    }

    renderHubShell(modal);
    loadData();
  }

  function closeAdminHub() {
    const modal = document.getElementById('scorearAdminHubModal');
    if (modal) modal.remove();
  }

  function renderHubShell(container) {
    container.innerHTML = `
      <div class="scorear-modal-shell" style="width:100%;max-width:960px;max-height:90vh;direction:rtl;font-family:inherit;">
        <div class="scorear-modal-head">
          <div style="display:flex;align-items:center;gap:12px;">
            ${uiBox('shield', 'violet', 'md')}
            <div>
              <h2 class="adm-hub-title">لوحة الإدارة والحسابات (Admin Hub)</h2>
              <p class="adm-hub-subtitle">إدارة المعلمين والطلاب والموافقات الرسمية لمنصة ScoreAR</p>
            </div>
          </div>
          <button type="button" onclick="ScoreARAdminManagement.closeAdminHub()" class="scorear-gear-btn" aria-label="إغلاق">${uiIc('close', 16)}</button>
        </div>

        <div class="adm-tabs-bar">
          <div class="scorear-segmented-tabs">
            <button type="button" onclick="ScoreARAdminManagement.setTab('requests')" class="scorear-segmented-tab ${currentTab === 'requests' ? 'active' : ''}" id="admTab_requests">
              ${uiIc('clock', 14)} <span>طلبات المعلمين</span> <span id="admBadgeRequests" class="adm-tab-badge" style="display:none;">0</span>
            </button>
            <button type="button" onclick="ScoreARAdminManagement.setTab('teachers')" class="scorear-segmented-tab ${currentTab === 'teachers' ? 'active' : ''}" id="admTab_teachers">
              ${uiIc('school', 14)} <span>المعلمون المعتمدون</span>
            </button>
            <button type="button" onclick="ScoreARAdminManagement.setTab('students')" class="scorear-segmented-tab ${currentTab === 'students' ? 'active' : ''}" id="admTab_students">
              ${uiIc('graduation', 14)} <span>إدارة الطلاب</span>
            </button>
            <button type="button" onclick="ScoreARAdminManagement.setTab('audit')" class="scorear-segmented-tab ${currentTab === 'audit' ? 'active' : ''}" id="admTab_audit">
              ${uiIc('list', 14)} <span>سجل العمليات</span>
            </button>
          </div>
        </div>

        <div id="admContentArea" class="scorear-modal-body" style="flex:1;overflow-y:auto;">
          <div class="adm-loading-text">جاري تحميل البيانات من الخادم...</div>
        </div>
      </div>
    `;
  }

  function setTab(tab) {
    currentTab = tab;
    ['requests', 'teachers', 'students', 'audit'].forEach(t => {
      const el = document.getElementById('admTab_' + t);
      if (el) el.classList.toggle('active', currentTab === t);
    });
    renderTabContent();
  }

  async function loadData() {
    const db = getDb();
    if (!db) return;

    try {
      // 1. Fetch Account Requests
      db.ref('scorear_account_requests').on('value', snap => {
        const val = snap.val() || {};
        cachedRequests = Object.entries(val).map(([uid, r]) => ({ uid, ...r }));
        cachedRequests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const pendingCount = cachedRequests.filter(r => r.status === 'pending').length;
        const b = document.getElementById('admBadgeRequests');
        if (b) {
          b.innerText = pendingCount;
          b.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
        if (currentTab === 'requests' || currentTab === 'audit') renderTabContent();
      });

      // 2. Fetch Teachers Registry
      db.ref('scorear_teachers_registry').on('value', snap => {
        const val = snap.val() || {};
        cachedTeachers = Object.entries(val).map(([uid, t]) => ({ uid, ...t }));
        if (currentTab === 'teachers') renderTabContent();
      });

      // 3. Fetch Students
      db.ref('scorear_students').on('value', snap => {
        const val = snap.val() || {};
        cachedStudents = Object.entries(val).map(([uid, s]) => ({ uid, ...s }));
        cachedStudents.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (currentTab === 'students') renderTabContent();
      });

    } catch (e) {
      console.error('Admin data load error:', e);
    }
  }

  function renderTabContent() {
    const area = document.getElementById('admContentArea');
    if (!area) return;

    if (currentTab === 'requests') renderRequestsTab(area);
    else if (currentTab === 'teachers') renderTeachersTab(area);
    else if (currentTab === 'students') renderStudentsTab(area);
    else if (currentTab === 'audit') renderAuditTab(area);
  }

  // --- TAB 1: TEACHER REQUESTS ---
  function renderRequestsTab(container) {
    const pending = cachedRequests.filter(r => r.status === 'pending');

    if (pending.length === 0) {
      container.innerHTML = `
        <div class="adm-empty-state">
          <div style="display:flex;justify-content:center;margin-bottom:12px;">${uiBox('checkCircle', 'cyan', 'lg')}</div>
          <h3>لا توجد طلبات معلمين معلقة حالياً</h3>
          <p>جميع طلبات الانضمام تم البت فيها بنجاح.</p>
        </div>
      `;
      return;
    }

    const ui = global.ScoreARUI || { icon: () => '', iconBox: () => '' };
    container.innerHTML = `
      <div class="adm-section-head" style="margin-bottom:16px;">
        طلبات الانضمام بانتظار المراجعة (${pending.length}):
      </div>
      <div style="display:grid;gap:14px;">
        ${pending.map(r => `
          <div class="scorear-spotlight-card adm-row-card" style="padding:18px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
            <div style="display:flex;align-items:center;gap:14px;">
              ${ui.iconBox('graduation', { size: 'md', tone: 'violet' })}
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <span class="adm-item-name">${esc(r.displayName)}</span>
                  <span class="launch-pill" style="padding:2px 10px;font-size:11px;">قيد المراجعة</span>
                </div>
                <div class="adm-item-meta">
                  <b>${esc(r.email)}</b>
                  <span>·</span>
                  <span style="display:inline-flex;align-items:center;gap:4px;">${ui.icon('book', { size: 13 })} ${esc(r.subject || 'غير محدد')}</span>
                  <span>·</span>
                  <span>${esc(r.school || 'مدرسة غير محددة')}</span>
                </div>
                <div class="adm-item-time">
                  ${ui.icon('clock', { size: 12 })} تاريخ الطلب: ${formatDate(r.createdAt)}
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button onclick="ScoreARAdminManagement.approveTeacher('${r.uid}')" class="btn launch-primary" style="padding:9px 18px;font-size:13px;">
                ${ui.icon('check', { size: 14 })} اعتماد كمعلم
              </button>
              <button onclick="ScoreARAdminManagement.rejectTeacherPrompt('${r.uid}', '${esc(r.displayName)}')" class="btn launch-outline adm-btn-danger" style="padding:9px 14px;font-size:13px;">
                ${ui.icon('close', { size: 14 })} رفض
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderTeachersTab(container) {
    const ui = global.ScoreARUI || { icon: () => '' };
    const list = cachedTeachers.length ? cachedTeachers : cachedRequests.filter(r => r.status === 'approved');

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
        <span class="adm-section-head">سجل المعلمين المعتمدين (${list.length}):</span>
        <input type="text" class="adm-search-input" placeholder="بحث بالاسم أو البريد أو المادة..." oninput="ScoreARAdminManagement.onSearch(this.value)" value="${esc(searchQuery)}">
      </div>
      <div style="display:grid;gap:12px;">
        ${list.filter(t => !searchQuery || (t.displayName||'').toLowerCase().includes(searchQuery.toLowerCase()) || (t.email||'').toLowerCase().includes(searchQuery.toLowerCase())).map(t => `
          <div class="scorear-spotlight-card adm-row-card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="adm-item-name is-md">${esc(t.displayName)}</span>
                <span class="adm-status-badge ${t.status === 'suspended' ? 'is-bad' : 'is-ok'}">
                  ${t.status === 'suspended' ? 'موقوف' : 'معتمد نشط'}
                </span>
              </div>
              <div class="adm-item-meta">
                <span>${esc(t.email)}</span>
                <span>·</span>
                <span style="display:inline-flex;align-items:center;gap:4px;">${ui.icon('book', { size: 13 })} ${esc(t.schoolSubject || t.subject || 'غير محدد')}</span>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button onclick="ScoreARAdminManagement.toggleTeacherStatus('${t.uid}', ${t.status !== 'suspended'})" class="btn launch-outline" style="padding:7px 12px;font-size:12px;">
                ${t.status === 'suspended' ? 'إلغاء الإيقاف' : 'إيقاف الحساب'}
              </button>
              <button onclick="ScoreARAdminManagement.deleteTeacherPrompt('${t.uid}', '${esc(t.displayName)}')" class="btn launch-outline adm-btn-danger" style="padding:7px 12px;font-size:12px;">
                حذف نهائي
              </button>
            </div>
          </div>
        `).join('') || '<div class="adm-empty-inline">لا توجد نتائج مطابقة</div>'}
      </div>
    `;
  }

  function renderStudentsTab(container) {
    const ui = global.ScoreARUI || { icon: () => '' };
    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
        <span class="adm-section-head">سجل الطلاب المسجلين (${cachedStudents.length}):</span>
        <input type="text" class="adm-search-input" placeholder="بحث باسم العرض أو المستخدم أو الفصل..." oninput="ScoreARAdminManagement.onSearch(this.value)" value="${esc(searchQuery)}">
      </div>
      <div style="display:grid;gap:12px;">
        ${cachedStudents.filter(s => !searchQuery || (s.displayName||'').toLowerCase().includes(searchQuery.toLowerCase()) || (s.username||'').toLowerCase().includes(searchQuery.toLowerCase()) || (s.className||'').toLowerCase().includes(searchQuery.toLowerCase())).map(s => `
          <div class="scorear-spotlight-card adm-row-card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="adm-item-name is-md">${esc(s.displayName)}</span>
                <span class="adm-item-handle">(@${esc(s.username)})</span>
                <span class="adm-status-badge ${s.isActive === false ? 'is-bad' : 'is-ok'}">
                  ${s.isActive === false ? 'موقوف' : 'نشط'}
                </span>
              </div>
              <div class="adm-item-meta">
                <span>الفصل: <b>${esc(s.className || 'عام')}</b></span>
                <span>·</span>
                <span style="display:inline-flex;align-items:center;gap:4px;">${ui.icon('clock', { size: 12 })} تاريخ التسجيل: ${formatDate(s.createdAt)}</span>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button onclick="ScoreARAdminManagement.toggleStudentStatus('${s.uid}', ${s.isActive === false})" class="btn launch-outline" style="padding:7px 12px;font-size:12px;">
                ${s.isActive === false ? 'إعادة التفعيل' : 'إيقاف الحساب'}
              </button>
              <button onclick="ScoreARAdminManagement.resetPasswordPrompt('${s.uid}', '${esc(s.displayName)}')" class="btn launch-outline adm-btn-accent" style="padding:7px 12px;font-size:12px;">
                ${ui.icon('key', { size: 13 })} إعادة كلمة المرور
              </button>
              <button onclick="ScoreARAdminManagement.deleteStudentPrompt('${s.uid}', '${esc(s.displayName)}')" class="btn launch-outline adm-btn-danger" style="padding:7px 12px;font-size:12px;">
                حذف
              </button>
            </div>
          </div>
        `).join('') || '<div class="adm-empty-inline">لا يوجد طلاب مسجلون حالياً</div>'}
      </div>
    `;
  }

  function renderAuditTab(container) {
    const ui = global.ScoreARUI || { icon: () => '' };
    const history = cachedRequests.filter(r => r.status === 'approved' || r.status === 'rejected' || r.status === 'deleted');

    container.innerHTML = `
      <div class="adm-section-head" style="margin-bottom:16px;">
        سجل العمليات الإدارية والموافقات السابقة (${history.length}):
      </div>
      <div style="display:grid;gap:10px;">
        ${history.map(h => `
          <div class="scorear-spotlight-card adm-row-card" style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="adm-item-name is-sm">${esc(h.displayName)}</span>
                <span class="adm-status-badge ${h.status === 'approved' ? 'is-ok' : h.status === 'rejected' ? 'is-bad' : 'is-muted'}">
                  ${h.status === 'approved' ? 'معتمد' : h.status === 'rejected' ? 'مرفوض' : 'محذوف'}
                </span>
              </div>
              <div class="adm-item-meta is-sm">
                ${esc(h.email)} · ملاحظة: <i>${esc(h.reviewNote || 'بدون ملاحظات')}</i>
              </div>
            </div>
            <div class="adm-item-time">
              ${ui.icon('clock', { size: 12 })} ${formatDate(h.reviewedAt || h.createdAt)}
            </div>
          </div>
        `).join('') || '<div class="adm-empty-inline">لا توجد عمليات مسجلة</div>'}
      </div>
    `;
  }

  // --- ACTIONS ---
  async function approveTeacher(uid) {
    if (!confirm('هل تريد بالتأكيد اعتماد هذا المعلم وتفعيل صلاحيات الاستوديو له؟')) return;
    try {
      if (global.toast) global.toast('جاري معالجة الاعتماد...');
      await callApi({ action: 'approve', targetUid: uid });
      if (global.toast) global.toast('تم اعتماد حساب المعلم وضبط دوره بنجاح ✓');
    } catch (e) {
      alert('خطأ في الاعتماد: ' + e.message);
    }
  }

  async function rejectTeacherPrompt(uid, name) {
    const note = prompt(`يرجى كتابة سبب رفض طلب المعلم (${name}):`, 'البيانات غير مكتملة');
    if (note === null) return;
    try {
      await callApi({ action: 'reject', targetUid: uid, note });
      if (global.toast) global.toast('تم رفض الطلب بنجاح.');
    } catch (e) {
      alert('خطأ: ' + e.message);
    }
  }

  async function toggleTeacherStatus(uid, makeActive) {
    try {
      await callApi({ action: 'toggleTeacherStatus', targetUid: uid, isActive: makeActive });
      if (global.toast) global.toast(makeActive ? 'تم تفعيل الحساب' : 'تم إيقاف الحساب');
    } catch (e) {
      alert('خطأ: ' + e.message);
    }
  }

  async function deleteTeacherPrompt(uid, name) {
    const confirmName = prompt(`⚠️ تأكيد الحذف النهائي: اكتب اسم الحساب تماماً للتأكيد (${name}):`);
    if (confirmName !== name) {
      alert('لم يتم الحذف: الاسم المكتوب غير متطابق.');
      return;
    }
    try {
      await callApi({ action: 'deleteTeacher', targetUid: uid });
      if (global.toast) global.toast('تم حذف حساب المعلم وسجلاته نهائياً.');
    } catch (e) {
      alert('خطأ: ' + e.message);
    }
  }

  async function toggleStudentStatus(uid, makeActive) {
    try {
      await callApi({ action: 'toggleStudentStatus', targetUid: uid, isActive: makeActive });
      if (global.toast) global.toast(makeActive ? 'تم إعادة تفعيل حساب الطالب' : 'تم إيقاف حساب الطالب');
    } catch (e) {
      alert('خطأ: ' + e.message);
    }
  }

  async function resetPasswordPrompt(uid, name) {
    const tempPass = 'ScoreAR#' + Math.floor(1000 + Math.random() * 9000);
    if (!confirm(`سيتم إعادة تعيين كلمة مرور الطالب (${name}) إلى كلمة مرور مؤقتة:\n\n${tempPass}\n\nهل تريد المتابعة؟`)) return;

    try {
      await callApi({ action: 'resetStudentPassword', targetUid: uid, newPassword: tempPass });
      prompt(`تم تعيين كلمة المرور بنجاح! انسخها وزودها للطالب:`, tempPass);
    } catch (e) {
      alert('خطأ: ' + e.message);
    }
  }

  async function deleteStudentPrompt(uid, name) {
    if (!confirm(`هل أنت متأكد من حذف حساب الطالب (${name}) نهائياً؟`)) return;
    try {
      await callApi({ action: 'deleteStudentAccount', targetUid: uid });
      if (global.toast) global.toast('تم حذف حساب الطالب.');
    } catch (e) {
      alert('خطأ: ' + e.message);
    }
  }

  function onSearch(val) {
    searchQuery = (val || '').trim();
    renderTabContent();
  }

  const AdminAPI = {
    openAdminHub,
    closeAdminHub,
    setTab,
    approveTeacher,
    rejectTeacherPrompt,
    toggleTeacherStatus,
    deleteTeacherPrompt,
    toggleStudentStatus,
    resetPasswordPrompt,
    deleteStudentPrompt,
    onSearch
  };

  global.ScoreARAdminManagement = AdminAPI;

})(typeof window !== 'undefined' ? window : this);
