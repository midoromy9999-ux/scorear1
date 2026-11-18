/**
 * ScoreAR Classrooms Homework & Tasks Module (05B2 Model)
 * Supports Text/Essay Tasks and Interactive Quiz Tasks from Quiz Bank.
 * STRICTLY Rule 7 Compliant (< 380 lines).
 */
(function(global) {
  'use strict';
  const ROOT = 'scorear_learning_v1';
  let activeQuizState = null;

  function esc(s) { return !s ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function getDb() { return (global.firebase && global.firebase.database) ? global.firebase.database() : (global.ScoreARAuth?.getDb?.() || null); }
  async function getActor() { return global.ScoreARClassroomsService?.getCurrentActor?.() || null; }
  function uiIcon(n, sz = 14) { return (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') ? global.ScoreARUI.icon(n, { size: sz }) : ''; }

  async function homeworkApi(payload) {
    const auth = global.ScoreARAuth?.getAuth?.() || global.firebase?.auth?.();
    if (!auth?.currentUser) throw new Error('سجل الدخول للوصول إلى الواجب.');
    const token = await auth.currentUser.getIdToken();
    const endpoint = global.getScoreARApiUrl?.('/api/homework') || '/api/homework';
    const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(payload)});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'تعذر الاتصال بخدمة الواجبات.');
    return result;
  }

  function getLocalTasks(classId) { try { const raw = localStorage.getItem(`scorear_hw_${classId}`); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }
  function saveLocalTasks(classId, list) { try { localStorage.setItem(`scorear_hw_${classId}`, JSON.stringify(list || [])); } catch (e) {} }
  function getOrCreateStage() { return global.ScoreARClassrooms?.getOrCreateStage?.() || document.getElementById('scorearClassroomsStage') || document.getElementById('main'); }
  function showMsg(msg, type = 'info') {
    if (global.ScoreARClassrooms?.showFeedback) global.ScoreARClassrooms.showFeedback(msg, type);
    else if (global.toast) global.toast(msg);
    else if (typeof alert === 'function') alert(msg);
  }
  function lockBtn(btn, text) {
    if (!btn) return () => {};
    const orig = btn.innerHTML, disabled = btn.disabled;
    btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = `<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;margin-left:6px;vertical-align:middle;"></span> ${text || 'جاري التحميل...'}`;
    return () => { btn.disabled = disabled; btn.removeAttribute('aria-busy'); btn.innerHTML = orig; };
  }

  async function getTasks(classId) {
    const actor = await getActor();
    if (!actor) throw new Error('سجل الدخول أولًا.');
    if (!actor.isTeacher) return (await homeworkApi({action:'list',classId})).tasks.sort((a,b)=>b.createdAt-a.createdAt);
    const snap = await getDb().ref(`${ROOT}/classes/${classId}/tasks`).once('value');
    return Object.entries(snap.val() || {}).map(([id,t])=>({id,...t})).sort((a,b)=>b.createdAt-a.createdAt);
  }

  async function createTask({ classId, type, title, prompt, questions, deadline }) {
    const actor = await getActor();
    if (!actor?.isTeacher) throw new Error('صلاحية نشر الواجبات مخصصة للمعلم مالك الصف فقط.');
    const tTitle = String(title || '').trim(), tPrompt = String(prompt || '').trim();
    if (tTitle.length < 2 || tTitle.length > 80) throw new Error('عنوان الواجب يجب أن يكون بين حرفين و80 حرفاً.');
    const db = getDb(), local = getLocalTasks(classId);
    if (local.length >= 50) throw new Error('وصلت للحد الأقصى لعدد الواجبات المسموح به لهذا الصف (50 واجباً).');
    const taskId = 'hw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const taskData = { id: taskId, type: type === 'quiz' ? 'quiz' : 'text', title: tTitle, prompt: tPrompt.slice(0, 1200), questions: type === 'quiz' && Array.isArray(questions) ? questions : null, deadline: deadline || null, createdAt: Date.now() };
    if (!db) throw new Error('خدمة الحفظ غير متاحة.');
    await db.ref(`${ROOT}/classes/${classId}/tasks/${taskId}`).set(taskData);
    local.unshift(taskData); saveLocalTasks(classId, local);
    return { ok: true, task: taskData };
  }

  async function submitTextAnswer({classId,taskId,answer}) { return homeworkApi({action:'submit',classId,taskId,answer}); }
  async function submitQuizAnswer({classId,taskId,choices}) { return homeworkApi({action:'submit',classId,taskId,choices}); }

  async function saveGrade({ classId, taskId, studentUid, scoreVal }) {
    const actor = await getActor();
    if (!actor?.isTeacher) throw new Error('صلاحية رصد الدرجة للمعلم فقط.');
    const num = Math.min(100, Math.max(0, parseInt(scoreVal, 10)));
    if (isNaN(num)) throw new Error('يرجى إدخال درجة صحيحة بين 0 و100.');
    const db = getDb(); if (!db) throw new Error('تعذر الاتصال بقاعدة البيانات.');
    await db.ref(`${ROOT}/classes/${classId}/tasks/${taskId}/answers/${studentUid}/score`).set(num);
    return { ok: true, score: num };
  }

  async function exportHomeworkExcel(classId, taskId) {
    if (!global.XLSX) { showMsg('مكتبة تصدير Excel غير متوفرة حالياً.', 'error'); return; }
    const db = getDb(); if (!db) return;
    try {
      const [tSnap, cSnap] = await Promise.all([db.ref(`${ROOT}/classes/${classId}/tasks/${taskId}`).once('value'), db.ref(`${ROOT}/classes/${classId}`).once('value')]);
      const task = tSnap.val(), cls = cSnap.val();
      if (!task || !cls) return;
      const members = cls.members || {}, answers = task.answers || {}, rows = [];
      Object.keys(members).forEach(uid => {
        const m = members[uid], a = answers[uid];
        rows.push({
          'اسم الطالب': m.displayName || 'طالب',
          'حالة التسليم': a ? 'تم التسليم ✓' : 'لم يسلّم',
          'الدرجة من 100': a?.score !== null && a?.score !== undefined ? a.score : (a ? 'بانتظار الرصد' : '-'),
          'تاريخ التسليم': a ? new Date(a.submittedAt).toLocaleDateString('ar-EG') : '-',
          'نص الإجابة / النتيجة': a ? (a.correctCount !== undefined ? `إجابات صحيحة: ${a.correctCount}/${a.totalQuestions}` : a.answer) : '-'
        });
      });
      const ws = global.XLSX.utils.json_to_sheet ? global.XLSX.utils.json_to_sheet(rows) : global.XLSX.utils.aoa_to_sheet(rows);
      const wb = global.XLSX.utils.book_new();
      global.XLSX.utils.book_append_sheet(wb, ws, 'كشف درجات الواجب');
      global.XLSX.writeFile(wb, `كشف_الدرجات.xlsx`);
      showMsg('تم تصدير كشف الدرجات بصيغة Excel بنجاح', 'success');
    } catch (e) { showMsg(e.message, 'error'); }
  }

  function copyTaskLink(classId, taskId) {
    const url = `${window.location.origin}${window.location.pathname}#classrooms?hw=${encodeURIComponent(classId)}&t=${encodeURIComponent(taskId)}`;
    try { navigator.clipboard?.writeText(url)?.catch?.(() => {}); } catch(e){}
    showMsg(`تم نسخ رابط الواجب المباشر: ${url}`, 'info');
  }
  function shareTaskWhatsApp(classId, taskId, title) {
    const url = `${window.location.origin}${window.location.pathname}#classrooms?hw=${encodeURIComponent(classId)}&t=${encodeURIComponent(taskId)}`;
    const text = encodeURIComponent(`أهلاً بكم يا أبطال\nتم نشر واجب جديد بعنوان: (${title})\nرابط حل الواجب:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }
  async function openClassHomework(classId) {
    if (!classId) return;
    window.location.hash = `#classrooms?hw=${encodeURIComponent(classId)}`;
    renderHomeworkPage(classId);
  }

  async function renderHomeworkPage(classId) {
    const stage = getOrCreateStage(), mainEl = document.getElementById('main');
    if (mainEl && stage !== mainEl) mainEl.style.display = 'none';
    stage.style.display = 'block';

    const db = getDb(), actor = await getActor();
    if (!actor) { global.ScoreARClassrooms?.renderClassroomsView?.(); return; }
    stage.innerHTML = `<div class="page scorear-classrooms-view" style="padding-top:20px;"><div id="classrooms-feedback"></div><div style="text-align:center;padding:50px;"><div class="spinner" style="width:32px;height:32px;border:3px solid #8e64ef33;border-top-color:#8e64ef;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 14px;"></div><p style="color:#b3b1cc;">جاري تحميل واجبات الصف...</p></div></div>`;
    try {
      let cls = db ? await global.ScoreARClassroomsService.getClassSummary(classId) : null;
      if (!cls) {
        const localList = (global.ScoreARClassroomsService?.loadMyClasses ? await global.ScoreARClassroomsService.loadMyClasses() : []);
        cls = localList.find(c => c.id === classId) || { name: 'صف دراسي', subject: 'عام', code: classId, members: {} };
      }
      const isOwner = actor.uid === cls.ownerUid || actor.isTeacher, isMember = Boolean(cls.members && cls.members[actor.uid]);
      if (!isOwner && !isMember && actor.role === 'student') throw new Error('عفواً، لا يمكنك الوصول لواجبات هذا الصف لعدم وجود عضوية معتمدة.');
      const tasks = await getTasks(classId), members = cls.members || {}, totalStudents = Object.keys(members).length;

      stage.innerHTML = `<div class="page scorear-classrooms-view" style="padding-top:20px;"><div id="classrooms-feedback"></div><div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;"><div><button onclick="ScoreARClassrooms.openView()" class="scorear-gear-btn" style="padding:7px 14px;font-size:12px;margin-bottom:8px;">← العودة إلى صفوفي</button><h2 style="font-size:22px;font-weight:900;margin:0;color:#fff;">واجبات صف: <span class="gradient-text">${esc(cls.name)}</span></h2><p style="color:#a1a4be;font-size:13px;margin:4px 0 0;">المادة: ${esc(cls.subject)} • رمز الصف: <b style="font-family:monospace;color:#58dce3;">${esc(cls.code)}</b></p></div>${isOwner ? `<button onclick="ScoreARClassroomsHomework.openCreateTaskModal('${classId}')" class="btn launch-primary" style="padding:10px 20px;font-size:13px;font-weight:800;">${uiIcon('plus', 15)} واجب جديد للصف</button>` : ''}</div><div class="classrooms-card"><div class="card-head"><h3 class="card-title"><span class="title-icon">${uiIcon('bookMarked', 16)}</span> جدول الواجبات والمهام</h3><span class="card-badge">${tasks.length} واجب</span></div>${!tasks.length ? `<div class="notice info">لا توجد واجبات منشورة لهذا الصف حتى الآن. ${isOwner ? 'اضغط "واجب جديد للصف" بالأعلى لنشر أول تكليف!' : ''}</div>` : `<div style="display:grid;gap:14px;">${tasks.map(t => {
        const ans = (t.answers && t.answers[actor.uid]) || null, isSubmitted = Boolean(ans), subCount = Object.keys(t.answers || {}).length;
        return `<div class="class-card"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;"><div><div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;"><span class="launch-pill" style="font-size:10.5px;padding:2px 9px;">${uiIcon(t.type === 'quiz' ? 'gamepad' : 'edit', 12)} ${t.type === 'quiz' ? 'مسابقة تفاعلية' : 'سؤال مقالي/نصي'}</span>${t.deadline ? `<span style="font-size:11px;color:#fbbf24;display:inline-flex;align-items:center;gap:4px;">${uiIcon('clock', 12)} موعد التسليم: ${new Date(t.deadline).toLocaleDateString('ar-EG')}</span>` : ''}</div><h4 style="font-size:16px;font-weight:900;color:#fff;margin:0 0 6px;">${esc(t.title)}</h4>${t.prompt ? `<p style="font-size:13.5px;color:#cbd5e1;line-height:1.6;margin:0 0 10px;white-space:pre-wrap;">${esc(t.prompt)}</p>` : ''}</div></div>${isOwner ? `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;margin-top:8px;"><span style="font-size:12.5px;color:#a1a4be;">سلّم <b style="color:#58dce3;">${subCount}</b> من <b style="color:#fff;">${totalStudents}</b> طلاب</span><div style="display:flex;gap:6px;flex-wrap:wrap;"><button onclick="ScoreARClassroomsHomework.openReportModal('${classId}','${t.id}')" class="btn launch-primary" style="padding:6px 12px;font-size:11.5px;">${uiIcon('chart', 13)} التسليمات والتقرير</button><button onclick="ScoreARClassroomsHomework.copyTaskLink('${classId}','${t.id}')" class="scorear-gear-btn" style="padding:6px 10px;font-size:11.5px;">${uiIcon('link', 13)} نسخ الرابط</button><button onclick="ScoreARClassroomsHomework.shareTaskWhatsApp('${classId}','${t.id}','${esc(t.title)}')" class="scorear-gear-btn" style="padding:6px 10px;font-size:11.5px;border-color:rgba(52,211,153,0.4);color:#6ee7b7;">${uiIcon('send', 13)} واتساب</button></div></div>` : `<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;margin-top:8px;">${isSubmitted ? `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;"><span style="color:#34d399;font-weight:800;font-size:13px;">✓ تم تسليم إجابتك</span><span style="font-size:13px;font-weight:900;color:${ans.score !== null && ans.score !== undefined ? '#fcd34d' : '#a1a4be'};">${ans.score !== null && ans.score !== undefined ? `الدرجة: ${ans.score} / 100` : 'بانتظار التصحيح ورصد الدرجة'}</span></div><div style="background:rgba(0,0,0,0.25);padding:10px 14px;border-radius:8px;margin-top:8px;font-size:12.5px;color:#cbd5e1;white-space:pre-wrap;">${esc(ans.answer)}</div>` : (t.type === 'quiz' ? `<button onclick="ScoreARClassroomsHomework.startQuizSolver('${classId}','${t.id}')" class="btn launch-primary" style="width:100%;padding:10px;font-weight:800;justify-content:center;">${uiIcon('play', 14)} بدء حل المسابقة التفاعلية</button>` : `<div><textarea id="hw-ans-${t.id}" class="form-input" rows="3" placeholder="اكتب إجابتك بالتفصيل هنا..." maxlength="2000" style="margin-bottom:8px;"></textarea><button id="hw-sub-btn-${t.id}" onclick="ScoreARClassroomsHomework.submitText('${classId}','${t.id}')" class="btn launch-primary" style="padding:8px 18px;font-size:12.5px;font-weight:800;">${uiIcon('send', 14)} تسليم الإجابة</button></div>`)}</div>`}</div>`;
      }).join('')}</div>`}</div></div><div id="hw-modal-container"></div>`;
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) { showMsg(e.message, 'error'); global.ScoreARClassrooms?.renderClassroomsView?.(); }
  }

  async function submitText(classId, taskId) {
    const answer = document.getElementById(`hw-ans-${taskId}`)?.value?.trim();
    if (!answer) { showMsg('يرجى كتابة نص إجابتك أولاً.', 'error'); return; }
    const unlock = lockBtn(document.getElementById(`hw-sub-btn-${taskId}`), 'جاري التسليم...');
    try { await submitTextAnswer({ classId, taskId, answer }); showMsg('تم تسليم إجابتك بنجاح', 'success'); renderHomeworkPage(classId); }
    catch (e) { showMsg(e.message, 'error'); } finally { unlock(); }
  }

  function openCreateTaskModal(classId) {
    const container = document.getElementById('hw-modal-container'); if (!container) return;
    const quizzes = global.ScoreARQuizBankData?.getQuizzes?.() || [];
    container.innerHTML = `<div id="create-hw-modal" style="position:fixed;inset:0;background:rgba(4,5,18,0.82);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;"><div class="scorear-modal-shell" style="max-width:540px;width:100%;max-height:90vh;color:#fff;direction:rtl;"><div class="scorear-modal-head"><h3 style="margin:0;font-size:17px;font-weight:900;display:inline-flex;align-items:center;gap:8px;">${uiIcon('edit', 16)} واجب جديد للصف</h3><button onclick="document.getElementById('create-hw-modal').remove()" class="scorear-gear-btn">✕</button></div><div class="scorear-modal-body"><div class="scorear-segmented-tabs" style="width:100%;display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px;"><button type="button" id="tab-btn-text" onclick="ScoreARClassroomsHomework.toggleCreateType('text')" class="scorear-segmented-tab active launch-primary">${uiIcon('edit', 14)} سؤال مقالي / نصي</button><button type="button" id="tab-btn-quiz" onclick="ScoreARClassroomsHomework.toggleCreateType('quiz')" class="scorear-segmented-tab">${uiIcon('gamepad', 14)} مسابقة تفاعلية</button></div><div class="form-group"><label class="form-label">عنوان الواجب (حتى 80 حرفاً):</label><input type="text" id="hw-title" class="form-input" placeholder="مثال: واجب النحو - إعراب الفاعل" maxlength="80"></div><div id="hw-type-text-fields"><div class="form-group"><label class="form-label">نص السؤال أو التكليف (حتى 1200 حرف):</label><textarea id="hw-prompt" class="form-input" rows="4" placeholder="اكتب السؤال بالتفصيل هنا..." maxlength="1200"></textarea></div></div><div id="hw-type-quiz-fields" style="display:none;"><div class="form-group"><label class="form-label">اختر المسابقة من بنك مسابقاتك:</label><select id="hw-quiz-select" class="form-select">${!quizzes.length ? '<option value="">لا توجد مسابقات محفوظة بعد</option>' : quizzes.map(q => `<option value="${q.id}">${esc(q.title)} (${(q.questions || []).length} أسئلة)</option>`).join('')}</select></div></div><div class="form-group"><label class="form-label">موعد التسليم النهائي (اختياري):</label><input type="date" id="hw-deadline" class="form-input"></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button onclick="document.getElementById('create-hw-modal').remove()" class="scorear-gear-btn" style="padding:8px 16px;">إلغاء</button><button id="hw-publish-btn" onclick="ScoreARClassroomsHomework.confirmCreateTask('${classId}')" class="btn launch-primary" style="padding:9px 20px;font-weight:900;">${uiIcon('send', 14)} نشر للصف</button></div></div></div></div>`;
  }

  function toggleCreateType(type) {
    const isText = type === 'text', bT = document.getElementById('tab-btn-text'), bQ = document.getElementById('tab-btn-quiz');
    if (bT && bQ) { bT.className = isText ? 'scorear-segmented-tab active launch-primary' : 'scorear-segmented-tab'; bQ.className = !isText ? 'scorear-segmented-tab active launch-primary' : 'scorear-segmented-tab'; }
    const fT = document.getElementById('hw-type-text-fields'), fQ = document.getElementById('hw-type-quiz-fields');
    if (fT) fT.style.display = isText ? 'block' : 'none';
    if (fQ) fQ.style.display = !isText ? 'block' : 'none';
  }

  async function confirmCreateTask(classId) {
    const isText = document.getElementById('tab-btn-text')?.classList.contains('launch-primary');
    const title = document.getElementById('hw-title')?.value?.trim(), prompt = isText ? document.getElementById('hw-prompt')?.value?.trim() : '';
    const deadline = document.getElementById('hw-deadline')?.value || null;
    let questions = null;
    if (!isText) {
      const qId = document.getElementById('hw-quiz-select')?.value, quizzes = global.ScoreARQuizBankData?.getQuizzes?.() || [];
      const found = quizzes.find(q => q.id === qId);
      if (!found || !found.questions?.length) { showMsg('يرجى اختيار مسابقة تحتوي على أسئلة.', 'error'); return; }
      questions = found.questions;
    }
    const btn = document.getElementById('hw-publish-btn'), unlock = lockBtn(btn, 'جاري النشر...');
    try { await createTask({ classId, type: isText ? 'text' : 'quiz', title, prompt, questions, deadline }); document.getElementById('create-hw-modal')?.remove(); showMsg('تم نشر الواجب لطلاب الصف بنجاح', 'success'); renderHomeworkPage(classId); }
    catch (e) { showMsg(e.message, 'error'); } finally { unlock(); }
  }

  function assignQuizModal(quizId) {
    const quizzes = global.ScoreARQuizBankData?.getQuizzes?.() || [], quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) { showMsg('المسابقة غير موجودة.', 'error'); return; }
    document.getElementById('assign-quiz-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'assign-quiz-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,18,0.82);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;';
    modal.innerHTML = `<div class="scorear-modal-shell" style="max-width:480px;width:100%;color:#fff;direction:rtl;"><div class="scorear-modal-head"><h3 style="margin:0;font-size:17px;font-weight:900;display:inline-flex;align-items:center;gap:8px;">${uiIcon('send', 16)} إرسال كواجب منزلي للصف</h3><button onclick="document.getElementById('assign-quiz-modal').remove()" class="scorear-gear-btn">✕</button></div><div class="scorear-modal-body"><p style="color:#cbd5e1;font-size:13.5px;margin:0 0 14px;">المسابقة: <b style="color:#58dce3;">${esc(quiz.title)}</b> (${(quiz.questions || []).length} أسئلة)</p><div class="form-group"><label class="form-label">اختر الصف الدراسي:</label><select id="assign-class-select" class="form-select"><option value="">جاري تحميل صفوفك...</option></select></div><div class="form-group"><label class="form-label">موعد التسليم النهائي (اختياري):</label><input type="date" id="assign-deadline" class="form-input"></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button onclick="document.getElementById('assign-quiz-modal').remove()" class="scorear-gear-btn" style="padding:8px 16px;">إلغاء</button><button id="confirm-assign-btn" onclick="ScoreARClassroomsHomework.confirmAssignQuiz('${quizId}')" class="btn launch-primary" style="padding:9px 20px;font-weight:900;">تأكيد الإرسال للصف</button></div></div></div>`;
    document.body.appendChild(modal);
    global.ScoreARClassroomsService?.loadMyClasses?.().then(classes => {
      const sel = document.getElementById('assign-class-select');
      if (sel) sel.innerHTML = !classes.length ? '<option value="">لم تنشئ أي صفوف بعد (أنشئ صفاً أولاً)</option>' : classes.map(c => `<option value="${c.id}">${esc(c.name)} (${esc(c.subject)})</option>`).join('');
    });
  }

  async function confirmAssignQuiz(quizId) {
    const classId = document.getElementById('assign-class-select')?.value;
    if (!classId) { showMsg('يرجى اختيار صف دراسي أولاً.', 'error'); return; }
    const deadline = document.getElementById('assign-deadline')?.value || null, quizzes = global.ScoreARQuizBankData?.getQuizzes?.() || [];
    const quiz = quizzes.find(q => q.id === quizId); if (!quiz) return;
    const unlock = lockBtn(document.getElementById('confirm-assign-btn'), 'جاري الإرسال...');
    try { await createTask({ classId, type: 'quiz', title: `واجب: ${quiz.title}`, prompt: 'قم بحل المسابقة كاملة لتحقيق أعلى مجموع نقاط.', questions: quiz.questions, deadline }); document.getElementById('assign-quiz-modal')?.remove(); showMsg('تم تعيين المسابقة كواجب منزلي للصف بنجاح', 'success'); }
    catch (e) { showMsg(e.message, 'error'); } finally { unlock(); }
  }

  async function openReportModal(classId, taskId) {
    const db = getDb(); if (!db) return;
    try {
      const [tSnap, cSnap] = await Promise.all([db.ref(`${ROOT}/classes/${classId}/tasks/${taskId}`).once('value'), db.ref(`${ROOT}/classes/${classId}`).once('value')]);
      const task = tSnap.val(), cls = cSnap.val();
      if (!task || !cls) throw new Error('بيانات التقرير غير متوفرة.');
      const members = cls.members || {}, answers = task.answers || {}, mKeys = Object.keys(members), subKeys = Object.keys(answers);
      document.getElementById('report-dialog')?.remove();
      const dlg = document.createElement('div');
      dlg.id = 'report-dialog';
      dlg.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,18,0.82);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;';
      dlg.innerHTML = `<div class="scorear-modal-shell" style="max-width:680px;width:100%;max-height:85vh;color:#fff;direction:rtl;"><div class="scorear-modal-head"><div><h3 style="margin:0;font-size:17px;font-weight:900;">تقرير تسليمات: <span style="color:#58dce3;">${esc(task.title)}</span></h3><p style="color:#fcd34d;font-weight:800;font-size:12.5px;margin:4px 0 0;">سلّم ${subKeys.length} من ${mKeys.length} طلاب</p></div><button onclick="document.getElementById('report-dialog').remove()" class="scorear-gear-btn">✕</button></div><div class="scorear-modal-body">${!mKeys.length ? '<p style="color:#94a3b8;">لا يوجد طلاب معتمدون في هذا الصف بعد.</p>' : `<div style="display:grid;gap:8px;">${mKeys.map(uid => {
        const m = members[uid], ans = answers[uid];
        return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:10px 14px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;"><div><b style="display:block;font-size:13.5px;color:#fff;">${esc(m.displayName || 'طالب')}</b><small style="color:${ans ? '#34d399' : '#a1a4be'};">${ans ? `✓ سلّم (${ans.correctCount !== undefined ? `صحيح: ${ans.correctCount}/${ans.totalQuestions}` : esc(ans.answer).slice(0, 30) + '...'})` : 'لم يسلّم بعد'}</small></div>${ans ? `<div style="display:flex;align-items:center;gap:6px;"><input type="number" id="grade-input-${uid}" min="0" max="100" value="${ans.score !== null && ans.score !== undefined ? ans.score : ''}" placeholder="100" style="width:65px;padding:6px 8px;border-radius:8px;border:1px solid rgba(172,139,242,0.4);background:#0c0d1d;color:#fff;text-align:center;font-weight:900;"><button onclick="ScoreARClassroomsHomework.confirmGrade('${classId}','${taskId}','${uid}')" class="btn launch-primary" style="padding:6px 12px;font-size:11.5px;">${uiIcon('save', 13)} حفظ</button></div>` : '<span style="color:#f87171;font-size:12px;">لم يسلّم بعد</span>'}</div>`;
      }).join('')}</div>`}<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button onclick="ScoreARClassroomsHomework.exportHomeworkExcel('${classId}','${taskId}')" class="btn launch-primary" style="padding:8px 18px;font-size:12.5px;">${uiIcon('spreadsheet', 14)} تصدير كشف الدرجات (Excel)</button><button onclick="document.getElementById('report-dialog').remove()" class="scorear-gear-btn" style="padding:8px 16px;">إغلاق</button></div></div></div>`;
      document.body.appendChild(dlg);
    } catch (e) { showMsg(e.message, 'error'); }
  }

  async function confirmGrade(classId, taskId, studentUid) {
    try { await saveGrade({ classId, taskId, studentUid, scoreVal: document.getElementById(`grade-input-${studentUid}`)?.value }); showMsg('تم حفظ ورصد درجة الطالب بنجاح', 'success'); }
    catch (e) { showMsg(e.message, 'error'); }
  }

  async function startQuizSolver(classId, taskId) {
    const db = getDb(); if (!db) return;
    try {
      const task = (await getTasks(classId)).find(t => t.id === taskId);
      if (!task || !task.questions?.length) throw new Error('بيانات أسئلة المسابقة غير متوفرة.');
      activeQuizState = { classId, taskId, questions: task.questions, curIdx: 0, correctCount: 0, choices: [] };
      renderQuizSolverModal();
    } catch (e) { showMsg(e.message, 'error'); }
  }

  function renderQuizSolverModal() {
    if (!activeQuizState) return;
    const { questions, curIdx } = activeQuizState;
    document.getElementById('quiz-solver-modal')?.remove();
    if (curIdx >= questions.length) { finishQuizSolver(); return; }
    const q = questions[curIdx], norm = global.ScoreARQuizEvaluator?.normalizeQuestion ? global.ScoreARQuizEvaluator.normalizeQuestion(q) : { text: q.q || q.text, options: q.opts || q.options, correct: [q.ans !== undefined ? q.ans : 0] };
    const modal = document.createElement('div');
    modal.id = 'quiz-solver-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,18,0.88);backdrop-filter:blur(14px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;';
    modal.innerHTML = `<div class="scorear-modal-shell" style="max-width:520px;width:100%;color:#fff;direction:rtl;"><div class="scorear-modal-head"><span style="font-size:12.5px;color:#58dce3;font-weight:900;">السؤال ${curIdx + 1} من ${questions.length}</span><span class="launch-pill" style="font-size:11px;padding:3px 10px;">التصحيح بعد التسليم</span></div><div class="scorear-modal-body"><h3 style="font-size:16.5px;font-weight:900;line-height:1.65;margin:0 0 16px;">${esc(norm.text)}</h3><div style="display:grid;gap:8px;">${(norm.options || []).map((opt, oIdx) => `<button data-quiz-choice="${oIdx}" onclick="ScoreARClassroomsHomework.pickQuizAnswer(${oIdx})" class="scorear-gear-btn" style="text-align:right;padding:11px 14px;font-size:13.5px;justify-content:flex-start;"><span style="font-family:monospace;margin-left:8px;color:#58dce3;">[${oIdx + 1}]</span> ${esc(opt)}</button>`).join('')}</div></div></div>`;
    if (q.multiple) {
      const next = document.createElement('button'); next.className='btn launch-primary'; next.style.marginTop='14px';
      next.textContent='تأكيد الاختيارات'; next.onclick=confirmQuizAnswer;
      modal.querySelector('.scorear-modal-body')?.appendChild(next);
    }
    document.body.appendChild(modal);
  }

  async function pickQuizAnswer(oIdx) {
    if (!activeQuizState) return;
    const q = activeQuizState.questions[activeQuizState.curIdx];
    if (!Number.isInteger(oIdx) || oIdx < 0 || oIdx >= (q.options || q.opts || []).length) return;
    if (q.multiple) {
      const selected = activeQuizState.pendingSelection || (activeQuizState.pendingSelection = []);
      const at = selected.indexOf(oIdx);
      if (at >= 0) selected.splice(at, 1); else selected.push(oIdx);
      document.querySelectorAll('#quiz-solver-modal [data-quiz-choice]').forEach(btn => { btn.style.borderColor = selected.includes(Number(btn.dataset.quizChoice)) ? '#58dce3' : 'rgba(255,255,255,0.14)'; });
      return;
    }
    activeQuizState.choices.push(oIdx); activeQuizState.curIdx++; renderQuizSolverModal();
  }
  function confirmQuizAnswer() {
    if (!activeQuizState?.pendingSelection?.length) { showMsg('اختر إجابة واحدة على الأقل.'); return; }
    activeQuizState.choices.push([...activeQuizState.pendingSelection]);
    activeQuizState.pendingSelection = []; activeQuizState.curIdx++; renderQuizSolverModal();
  }
  async function finishQuizSolver() {
    if (!activeQuizState || activeQuizState.submitting) return;
    activeQuizState.submitting = true;
    const {classId,taskId,choices} = activeQuizState;
    try {
      const result = await submitQuizAnswer({classId,taskId,choices});
      document.getElementById('quiz-solver-modal')?.remove();
      activeQuizState = null;
      showMsg('تم تسليم الاختبار. درجتك: ' + result.payload.score + ' / 100', 'success');
      renderHomeworkPage(classId);
    } catch(e) {
      activeQuizState.submitting = false; showMsg(e.message, 'error');
      const modal = document.getElementById('quiz-solver-modal');
      if (modal) { const btn = document.createElement('button'); btn.className='btn launch-primary';btn.textContent='إعادة محاولة التسليم';btn.onclick=finishQuizSolver;modal.querySelector('.scorear-modal-body')?.appendChild(btn); }
    }
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    const handleHwRoute = () => {
      const h = window.location?.hash || '';
      if (h.startsWith('#classrooms?hw=')) {
        const cId = new URLSearchParams(h.replace('#classrooms?', '')).get('hw');
        if (cId) setTimeout(() => renderHomeworkPage(cId), 10);
      }
    };
    window.addEventListener('hashchange', handleHwRoute);
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', handleHwRoute);
      else handleHwRoute();
    }
  }

  const ScoreARClassroomsHomework = {
    getTasks, createTask, submitTextAnswer, submitQuizAnswer, saveGrade, exportHomeworkExcel,
    openClassHomework, renderHomeworkPage, copyTaskLink, shareTaskWhatsApp,
    openCreateTaskModal, toggleCreateType, confirmCreateTask, assignQuizModal, confirmAssignQuiz,
    openReportModal, confirmGrade, startQuizSolver, pickQuizAnswer, confirmQuizAnswer, submitText
  };

  global.ScoreARClassroomsHomework = ScoreARClassroomsHomework;
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARClassroomsHomework;
})(typeof window !== 'undefined' ? window : this);
