/** ScoreAR Quiz Builder Module — Real Quiz Builder for Teacher Studio (Rule 7 < 500 lines) */
(function(global) {
  'use strict';

  const STORAGE_KEY_PREFIX = 'scorear_draft_backup_';
  const LAST_DRAFT_KEY = 'scorear_last_draft_id';
  let currentQuiz = null, activeQIndex = 0, saveState = 'saved', debounceTimer = null, lastSavedAt = null;
  const uiIc = (n, s = 14) => global.ScoreARUI?.icon?.(n, { size: s }) || '';
  const uiBox = (n, t = 'violet', s = 'sm') => global.ScoreARUI?.iconBox?.(n, { size: s, tone: t }) || '';

  function createNewQuestion(index = 1) {
    return {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      q: index === 1 ? 'ما إعراب كلمة «مفيداً» في جملة: «قرأتُ كتاباً مفيداً»؟' : '',
      opts: index === 1 ? ['نعت منصوب', 'مفعول به ثانٍ', 'حال منصوبة', 'تمييز منصوب'] : ['الخيار 1', 'الخيار 2', 'الخيار 3', 'الخيار 4'],
      ans: 0, explain: index === 1 ? '«مفيداً» تصف الكتاب وتطابقه في الإعراب والتنكير، فهي نعت منصوب.' : '',
      timeLimit: 20, points: 1000, isDouble: false, multiplier: 1, imageUrl: null, imageAlt: ''
    };
  }

  function createDefaultQuiz() {
    return {
      id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: 'مسابقة جديدة بدون عنوان', subject: '', grade: '', ownerUid: null,
      status: 'draft', createdAt: Date.now(), updatedAt: Date.now(), questions: [createNewQuestion(1)]
    };
  }

  function getOrCreateBuilderStage() {
    let stage = document.getElementById('scorearQuizBuilderStage');
    if (!stage) {
      stage = document.createElement('div');
      stage.id = 'scorearQuizBuilderStage';
      stage.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0c0d1e;overflow:hidden;font-family:Cairo,Tajawal,sans-serif;direction:rtl;display:flex;flex-direction:column;';
      document.body.appendChild(stage);
    }
    stage.style.display = 'flex';
    return stage;
  }

  function openBuilder(quizData = null, opts = {}) {
    if (quizData) {
      currentQuiz = JSON.parse(JSON.stringify(quizData));
      performSave(true);
    } else if (opts.resumeDraft) {
      resumeLastDraft();
      return;
    } else {
      currentQuiz = createDefaultQuiz();
    }
    activeQIndex = 0;
    saveState = 'saved';
    renderBuilderView();
  }

  function resumeLastDraft() {
    const lastId = localStorage.getItem(LAST_DRAFT_KEY);
    if (lastId) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PREFIX + lastId);
        if (raw) currentQuiz = JSON.parse(raw);
      } catch(e){}
    }
    if (!currentQuiz) currentQuiz = createDefaultQuiz();
    activeQIndex = 0;
    saveState = 'saved';
    renderBuilderView();
    if (global.toast) global.toast('تم فتح آخر مسودة محفوظة ✓');
  }

  function closeBuilder() {
    if (debounceTimer) clearTimeout(debounceTimer);
    const stage = document.getElementById('scorearQuizBuilderStage');
    if (stage) stage.style.display = 'none';
  }

  function scheduleAutoSave() {
    saveState = 'saving';
    updateSaveIndicatorUI();
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSave(), 750);
  }

  async function performSave(isSilent = false) {
    if (!currentQuiz) return;
    saveState = 'saving';
    updateSaveIndicatorUI();
    currentQuiz.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + currentQuiz.id, JSON.stringify(currentQuiz));
      localStorage.setItem(LAST_DRAFT_KEY, currentQuiz.id);
    } catch(e) {}
    try {
      const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
      if (auth && auth.currentUser) currentQuiz.ownerUid = auth.currentUser.uid;
      const db = (window.ScoreARAuth && window.ScoreARAuth.getDb) ? window.ScoreARAuth.getDb() : (window.firebase && window.firebase.database ? window.firebase.database() : null);
      if (db) await db.ref('scorear_quizzes/' + currentQuiz.id).set(currentQuiz);
    } catch(err) {
      console.warn('[ScoreAR QuizBuilder] Server auto-save failed, backed up locally:', err.message);
    }
    saveState = 'saved';
    lastSavedAt = new Date();
    updateSaveIndicatorUI();
  }

  function updateSaveIndicatorUI() {
    const el = document.getElementById('builderSaveIndicator');
    if (!el) return;
    if (saveState === 'saving') {
      el.innerHTML = `${uiIc('clock', 12)} <span>جارٍ الحفظ...</span>`;
      el.style.color = '#fcd34d';
    } else {
      const timeStr = lastSavedAt ? lastSavedAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن';
      el.innerHTML = `${uiIc('check', 12)} <span>تم الحفظ (${timeStr})</span>`;
      el.style.color = '#7fe7ce';
    }
  }

  function addQuestion() {
    if (!currentQuiz) return;
    currentQuiz.questions.push(createNewQuestion(currentQuiz.questions.length + 1));
    activeQIndex = currentQuiz.questions.length - 1;
    scheduleAutoSave();
    renderBuilderView();
  }

  function duplicateQuestion(idx) {
    if (!currentQuiz || !currentQuiz.questions[idx]) return;
    const clone = JSON.parse(JSON.stringify(currentQuiz.questions[idx]));
    clone.id = 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    clone.q = clone.q ? (clone.q + ' (نسخة)') : '';
    currentQuiz.questions.splice(idx + 1, 0, clone);
    activeQIndex = idx + 1;
    if (global.toast) global.toast('تم تكرار السؤال بنجاح ✓');
    scheduleAutoSave();
    renderBuilderView();
  }

  function deleteQuestion(idx) {
    if (!currentQuiz) return;
    if (global.ScoreARQuizBuilderActions && global.ScoreARQuizBuilderActions.deleteWithUndo) {
      global.ScoreARQuizBuilderActions.deleteWithUndo(currentQuiz, idx, (newActiveIdx) => {
        if (typeof newActiveIdx === 'number') activeQIndex = newActiveIdx;
        else if (activeQIndex >= currentQuiz.questions.length) activeQIndex = Math.max(0, currentQuiz.questions.length - 1);
        scheduleAutoSave();
        renderBuilderView();
      });
    } else {
      currentQuiz.questions.splice(idx, 1);
      if (activeQIndex >= currentQuiz.questions.length) activeQIndex = Math.max(0, currentQuiz.questions.length - 1);
      scheduleAutoSave();
      renderBuilderView();
    }
  }

  function moveQuestion(idx, direction) {
    if (!currentQuiz) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= currentQuiz.questions.length) return;
    [currentQuiz.questions[idx], currentQuiz.questions[targetIdx]] = [currentQuiz.questions[targetIdx], currentQuiz.questions[idx]];
    activeQIndex = targetIdx;
    scheduleAutoSave();
    renderBuilderView();
  }

  function selectQuestion(idx) {
    if (!currentQuiz || !currentQuiz.questions[idx]) return;
    activeQIndex = idx;
    renderBuilderView();
  }

  function toggleDoublePoints(idx) {
    if (!currentQuiz || !currentQuiz.questions[idx]) return;
    const q = currentQuiz.questions[idx];
    q.isDouble = !q.isDouble;
    q.multiplier = q.isDouble ? 2 : 1;
    scheduleAutoSave();
    renderBuilderView();
    if (global.toast) global.toast(q.isDouble ? 'تم تفعيل: سؤال مضاعف (نقاط ×2)' : 'تم إلغاء المضاعف (نقاط عادية)');
  }

  function setQuestionTime(seconds) { if (currentQuiz?.questions[activeQIndex]) { currentQuiz.questions[activeQIndex].timeLimit = Number(seconds); scheduleAutoSave(); renderBuilderView(); } }
  function setQuestionPoints(pts) { if (currentQuiz?.questions[activeQIndex]) { currentQuiz.questions[activeQIndex].points = Number(pts); scheduleAutoSave(); renderBuilderView(); } }
  function setQuestionImage(idx, url) { if (currentQuiz?.questions[idx]) { currentQuiz.questions[idx].imageUrl = url; scheduleAutoSave(); renderBuilderView(); } }
  function setQuestionImageAlt(idx, alt) { if (currentQuiz?.questions[idx]) { currentQuiz.questions[idx].imageAlt = alt; scheduleAutoSave(); } }

  function validateQuiz() {
    const errors = [];
    if (!currentQuiz) return { valid: false, errors: ['لا توجد مسابقة مفتوحة.'] };
    if (!currentQuiz.title || !currentQuiz.title.trim()) errors.push('عنوان المسابقة فارغ، يرجى كتابة عنوان مناسب.');
    if (!currentQuiz.questions || !currentQuiz.questions.length) return { valid: false, errors: ['المسابقة فارغة: يجب إضافة سؤال واحد على الأقل.'] };
    currentQuiz.questions.forEach((q, qIdx) => {
      const qNum = qIdx + 1;
      if (!q.q || !q.q.trim()) errors.push(`السؤال (${qNum}): نص السؤال فارغ.`);
      if (!q.opts || q.opts.length < 2) errors.push(`السؤال (${qNum}): يجب أن يحتوي على خيارين على الأقل.`);
      if (typeof q.ans !== 'number' || q.ans < 0 || q.ans >= q.opts.length) errors.push(`السؤال (${qNum}): لم يتم تحديد الإجابة الصحيحة.`);
    });
    return { valid: errors.length === 0, errors };
  }

  async function publishAndLaunchContest() {
    const validation = validateQuiz();
    const alertBox = document.getElementById('builderValidationAlert');
    if (!validation.valid) {
      if (alertBox) {
        alertBox.innerHTML = `<div class="scorear-inline-icon" style="font-weight:900;margin-bottom:6px;font-size:14px;">${uiIc('alert', 15)} لا يمكن النشر قبل استيفاء الشروط التالية:</div><ul style="margin:0;padding-right:18px;font-size:12px;line-height:1.6;">${validation.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
        alertBox.style.display = 'block';
      }
      if (global.toast) global.toast('يرجى استيفاء شروط الأسئلة قبل النشر.');
      return;
    }
    if (alertBox) alertBox.style.display = 'none';
    currentQuiz.status = 'published';
    await performSave();
    const realTitle = (currentQuiz.title || '').trim() || 'مسابقة جديدة';
    global.activeQuizTitle = realTitle;
    try { sessionStorage.setItem('scorear_active_quiz_title', realTitle); } catch(e){}
    global.contestQuestions = JSON.parse(JSON.stringify(currentQuiz.questions));
    closeBuilder();
    if (global.toast) global.toast('تم اعتماد ونشر المسابقة بنجاح. اختر عالم المنافسة.');
    if (global.ScoreARWorldFlow && typeof global.ScoreARWorldFlow.openWorldPicker === 'function') {
      const lastWorld = (typeof localStorage !== 'undefined') ? (localStorage.getItem('scorear_last_world') || 'royal') : 'royal';
      global.ScoreARWorldFlow.openWorldPicker({
        defaultWorldId: lastWorld,
        quizTitle: realTitle,
        onConfirm: (chosenWorld) => {
          global.activeQuizTitle = realTitle;
          try { if (typeof localStorage !== 'undefined') localStorage.setItem('scorear_last_world', chosenWorld); } catch(e){}
          if (global.ScoreARQuizHost && global.ScoreARQuizHost.startHostLobby) global.ScoreARQuizHost.startHostLobby(chosenWorld, null, true);
        }
      });
    } else if (global.ScoreARQuizHost && global.ScoreARQuizHost.startHostLobby) {
      global.ScoreARQuizHost.startHostLobby('royal', null);
    }
  }

  function renderBuilderView() {
    if (!currentQuiz) return;
    const stage = getOrCreateBuilderStage();
    const totalQ = currentQuiz.questions.length;
    const q = currentQuiz.questions[activeQIndex] || currentQuiz.questions[0];
    const lastDraft = global.ScoreARQuizBuilderActions ? global.ScoreARQuizBuilderActions.getLastDraftInfo() : null;

    stage.innerHTML = `
      <header class="scorear-control-bar" style="padding:11px 18px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:20;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:min(100%, 260px);flex-wrap:wrap;">
          ${uiBox('edit', 'violet', 'sm')}
          <input type="text" value="${escapeHtml(currentQuiz.title)}" oninput="ScoreARQuizBuilder.updateQuizTitle(this.value)" placeholder="عنوان المسابقة..." style="background:rgba(20,21,42,0.85);border:1px solid rgba(255,255,255,0.14);color:#f6f3ff;font-size:14px;font-weight:900;padding:7px 12px;border-radius:10px;flex:1;min-width:140px;font-family:inherit;">
          <input type="text" list="scorearSubjectList" value="${escapeHtml(currentQuiz.subject || '')}" oninput="ScoreARQuizBuilder.updateQuizSubject(this.value)" placeholder="المادة (اختياري)" style="width:125px;background:rgba(20,21,42,0.85);border:1px solid rgba(255,255,255,0.14);color:#58dce3;font-size:12px;font-weight:800;padding:7px 10px;border-radius:10px;font-family:inherit;">
          <input type="text" list="scorearGradeList" value="${escapeHtml(currentQuiz.grade || '')}" oninput="ScoreARQuizBuilder.updateQuizGrade(this.value)" placeholder="الصف (اختياري)" style="width:125px;background:rgba(20,21,42,0.85);border:1px solid rgba(255,255,255,0.14);color:#c9baff;font-size:12px;font-weight:800;padding:7px 10px;border-radius:10px;font-family:inherit;">
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          ${lastDraft && lastDraft.id !== currentQuiz.id ? `<button type="button" onclick="ScoreARQuizBuilder.resumeLastDraft()" class="scorear-gear-btn" style="padding:7px 12px;">${uiIc('folderOpen', 14)} تابع آخر مسودة (${lastDraft.questionsCount} أسئلة)</button>` : ''}
          <div id="builderSaveIndicator" class="scorear-control-pill" style="border-color:rgba(88,220,227,0.35);color:#7fe7ce;">${uiIc('check', 13)} تم الحفظ</div>
          <button type="button" onclick="ScoreARQuizBuilder.publishAndLaunchContest()" class="btn launch-primary" style="padding:8px 18px;font-size:13px;">${uiIc('play', 14)} نشر وبدء التحدي</button>
          <button type="button" onclick="ScoreARQuizBuilder.closeBuilder()" class="scorear-gear-btn" style="padding:7px 11px;" aria-label="إغلاق">${uiIc('close', 15)}</button>
        </div>
      </header>
      <datalist id="scorearSubjectList"><option value="لغة عربية"><option value="نحو وإعراب"><option value="رياضيات"><option value="علوم"><option value="دراسات اجتماعية"><option value="لغة إنجليزية"><option value="تربية إسلامية"><option value="عام ثقافة"></datalist>
      <datalist id="scorearGradeList"><option value="الصف الأول الابتدائي"><option value="الصف الثاني الابتدائي"><option value="الصف الثالث الابتدائي"><option value="الصف الرابع الابتدائي"><option value="الصف الخامس الابتدائي"><option value="الصف السادس الابتدائي"><option value="الصف الأول الإعدادي"><option value="الصف الثاني الإعدادي"><option value="الصف الثالث الإعدادي"><option value="المرحلة الثانوية"><option value="عام / جميع المراحل"></datalist>
      <div id="builderValidationAlert" style="display:none;background:#422337;border-bottom:1px solid #c38498;color:#ffd3e5;padding:12px 24px;z-index:15;"></div>
      <div class="builder-body-layout" style="flex:1;display:flex;overflow:hidden;">
        <aside class="builder-sidebar" style="width:280px;background:#0c0d1d;border-left:1px solid rgba(255,255,255,0.09);display:flex;flex-direction:column;justify-content:space-between;padding:12px;overflow-y:auto;">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <span style="color:#ddd8ff;font-size:12px;font-weight:900;">الأسئلة (${totalQ})</span>
              <button type="button" onclick="ScoreARQuizBuilder.addQuestion()" class="scorear-gear-btn" style="padding:4px 10px;font-size:11px;">${uiIc('plus', 12)} إضافة سؤال</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${totalQ === 0 ? `<div style="text-align:center;padding:24px 8px;color:#a1a4be;font-size:12px;">لا توجد أسئلة حالياً.<br>اضغط (إضافة سؤال) للبدء.</div>` : currentQuiz.questions.map((item, idx) => `
                <div draggable="true" ondragstart="ScoreARQuizBuilderActions.onDragStart(event, ${idx})" ondragover="ScoreARQuizBuilderActions.onDragOver(event)" ondrop="ScoreARQuizBuilderActions.onDrop(event, ${idx}, ScoreARQuizBuilder.getCurrentQuiz(), () => ScoreARQuizBuilder.renderBuilderView())" onclick="ScoreARQuizBuilder.selectQuestion(${idx})" style="background:${idx === activeQIndex ? 'rgba(117,80,239,0.22)' : 'rgba(20,21,42,0.72)'};border:1px solid ${idx === activeQIndex ? 'rgba(172,139,242,0.55)' : 'rgba(255,255,255,0.09)'};border-radius:12px;padding:8px 10px;cursor:pointer;position:relative;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:11px;font-weight:900;color:${idx === activeQIndex ? '#58dce3' : '#a1a4be'};display:inline-flex;align-items:center;gap:4px;">${item.isDouble ? uiIc('zap', 12) : ''}سؤال ${idx + 1}${item.imageUrl ? uiIc('image', 12) : ''}</span>
                    <div style="display:flex;gap:3px;" onclick="event.stopPropagation();">
                      <button type="button" onclick="ScoreARQuizBuilder.moveQuestion(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} style="background:none;border:none;color:#a1a4be;cursor:pointer;display:inline-grid;place-items:center;">${uiIc('arrowUp', 12)}</button>
                      <button type="button" onclick="ScoreARQuizBuilder.moveQuestion(${idx}, 1)" ${idx === totalQ - 1 ? 'disabled' : ''} style="background:none;border:none;color:#a1a4be;cursor:pointer;display:inline-grid;place-items:center;">${uiIc('arrowDown', 12)}</button>
                      <button type="button" onclick="ScoreARQuizBuilder.duplicateQuestion(${idx})" style="background:none;border:none;color:#58dce3;cursor:pointer;display:inline-grid;place-items:center;" title="تكرار">${uiIc('copy', 12)}</button>
                      <button type="button" onclick="ScoreARQuizBuilder.deleteQuestion(${idx})" style="background:none;border:none;color:#ffd3e5;cursor:pointer;display:inline-grid;place-items:center;" title="حذف">${uiIc('close', 12)}</button>
                    </div>
                  </div>
                  <div style="font-size:12px;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.q ? escapeHtml(item.q) : '<i style="color:#6b7280;">سؤال بدون نص...</i>'}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <button type="button" onclick="ScoreARQuizBuilder.addQuestion()" class="scorear-gear-btn" style="margin-top:10px;padding:8px;font-size:12px;width:100%;">${uiIc('plus', 13)} سؤال جديد</button>
        </aside>
        <main class="builder-main-stage" style="flex:1;display:flex;flex-direction:column;padding:16px 28px;overflow-y:auto;gap:14px;">
          ${!q ? `<div style="text-align:center;padding:60px 20px;color:#c9baff;"><h3>لا يوجد سؤال محدد</h3><button type="button" onclick="ScoreARQuizBuilder.addQuestion()" class="btn launch-primary" style="padding:8px 20px;margin-top:10px;">${uiIc('plus', 14)} أضف سؤالاً الآن</button></div>` : `
            <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(20,21,42,0.75);padding:10px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.09);flex-wrap:wrap;gap:10px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <span class="launch-pill" style="padding:4px 12px;font-size:12px;">السؤال ${activeQIndex + 1} من ${totalQ}</span>
                <button type="button" onclick="ScoreARQuizBuilder.toggleDoublePoints(${activeQIndex})" class="scorear-gear-btn ${q.isDouble ? 'is-active' : ''}" style="padding:5px 12px;font-size:12px;">${uiIc('zap', 13)} <span>نقاط ×2</span><span style="font-size:10px;opacity:0.85;">${q.isDouble ? '(مفعّل)' : '(عادي)'}</span></button>
              </div>
              <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="scorear-inline-icon" style="color:#ddd8ff;font-size:12px;font-weight:700;">${uiIc('clock', 14)} الوقت:</span>
                  <select onchange="ScoreARQuizBuilder.setQuestionTime(this.value)" style="background:#1c1d3b;border:1px solid rgba(172,139,242,0.35);color:#fff;font-size:12px;font-weight:800;padding:4px 8px;border-radius:8px;font-family:inherit;">${[5,10,15,20,30,45,60,90,120,180,240].map(s => `<option value="${s}" ${q.timeLimit === s ? 'selected' : ''}>${s} ثانية</option>`).join('')}</select>
                  <button type="button" onclick="ScoreARQuizBuilderActions.applyTimeToAll(ScoreARQuizBuilder.getCurrentQuiz(), ${q.timeLimit || 20}, () => ScoreARQuizBuilder.renderBuilderView())" class="scorear-gear-btn" style="font-size:10.5px;padding:4px 9px;" title="تعميم هذا الوقت على كافة الأسئلة">تعميم</button>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="scorear-inline-icon" style="color:#ddd8ff;font-size:12px;font-weight:700;">${uiIc('zap', 14)} النقاط:</span>
                  <select onchange="ScoreARQuizBuilder.handlePointsSelect(this.value)" style="background:#1c1d3b;border:1px solid rgba(172,139,242,0.35);color:#fff;font-size:12px;font-weight:800;padding:4px 8px;border-radius:8px;font-family:inherit;">${[100,200,500,1000,2000].map(p => `<option value="${p}" ${q.points === p ? 'selected' : ''}>${p} نقطة</option>`).join('')}<option value="custom" ${![100,200,500,1000,2000].includes(q.points) ? 'selected' : ''}>قيمة مخصصة…</option></select>
                  ${![100,200,500,1000,2000].includes(q.points) ? `<input type="number" value="${q.points}" onchange="ScoreARQuizBuilder.setQuestionPoints(this.value)" style="width:70px;background:#1c1d3b;border:1px solid #7550ef;color:#fff;padding:3px 6px;border-radius:6px;font-size:11px;font-weight:800;">` : ''}
                  <button type="button" onclick="ScoreARQuizBuilderActions.applyPointsToAll(ScoreARQuizBuilder.getCurrentQuiz(), ${q.points || 1000}, () => ScoreARQuizBuilder.renderBuilderView())" class="scorear-gear-btn" style="font-size:10.5px;padding:4px 9px;" title="تعميم هذه النقاط على كافة الأسئلة">تعميم</button>
                </div>
              </div>
            </div>
            <div>
              <label style="display:block;color:#ddd8ff;font-size:13px;font-weight:800;margin-bottom:6px;">نص السؤال:</label>
              <textarea oninput="ScoreARQuizBuilder.updateQuestionText(this.value)" placeholder="اكتب صيغة السؤال هنا..." style="width:100%;height:70px;background:#14152a;border:1px solid rgba(172,139,242,0.35);border-radius:14px;color:#fff;font-size:15px;font-weight:800;padding:10px 14px;font-family:inherit;line-height:1.4;resize:vertical;">${escapeHtml(q.q || '')}</textarea>
            </div>
            ${global.ScoreARQuizBuilderMedia ? global.ScoreARQuizBuilderMedia.renderMediaZone(q, activeQIndex) : ''}
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <label style="color:#ddd8ff;font-size:13px;font-weight:800;">الاختيارات (اضغط الدائرة لتحديد الإجابة الصحيحة):</label>
                ${q.opts.length < 6 ? `<button type="button" onclick="ScoreARQuizBuilder.addOption()" class="scorear-gear-btn" style="padding:4px 10px;font-size:11px;">${uiIc('plus', 12)} إضافة خيار (${q.opts.length}/6)</button>` : ''}
              </div>
              <div class="builder-options-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                ${q.opts.map((optText, oIdx) => {
                  const isCorrect = (q.ans === oIdx);
                  return `<div style="display:flex;align-items:center;gap:10px;background:${isCorrect ? '#163c39' : '#14152a'};border:1px solid ${isCorrect ? '#44b8a5' : 'rgba(255,255,255,0.1)'};border-radius:14px;padding:8px 12px;">
                    <button type="button" onclick="ScoreARQuizBuilder.setCorrectAnswer(${oIdx})" style="width:26px;height:26px;border-radius:50%;background:${isCorrect ? '#44b8a5' : 'transparent'};border:1.5px solid ${isCorrect ? '#44b8a5' : '#6b7280'};color:#0c0d1d;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;cursor:pointer;flex-shrink:0;">${isCorrect ? uiIc('check', 13) : ''}</button>
                    <input type="text" value="${escapeHtml(optText)}" oninput="ScoreARQuizBuilder.updateOptionText(${oIdx}, this.value)" placeholder="نص الخيار ${oIdx + 1}..." style="flex:1;background:transparent;border:none;color:#fff;font-size:14px;font-weight:800;font-family:inherit;outline:none;">
                    ${q.opts.length > 2 ? `<button type="button" onclick="ScoreARQuizBuilder.removeOption(${oIdx})" style="background:none;border:none;color:#ffd3e5;cursor:pointer;padding:2px;display:inline-grid;place-items:center;" title="حذف الخيار">${uiIc('close', 13)}</button>` : ''}
                  </div>`;
                }).join('')}
              </div>
            </div>
            <div>
              <label class="scorear-inline-icon" style="color:#ddd8ff;font-size:13px;font-weight:800;margin-bottom:4px;">${uiIc('info', 14)} شرح وتوضيح الإجابة (يظهر بعد انتهاء السؤال):</label>
              <textarea oninput="ScoreARQuizBuilder.updateQuestionExplain(this.value)" placeholder="اكتب التوضيح التعليمي أو القاعدة..." style="width:100%;height:58px;background:#14152a;border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#c9baff;font-size:13px;font-weight:700;padding:8px 12px;font-family:inherit;line-height:1.4;resize:vertical;">${escapeHtml(q.explain || '')}</textarea>
            </div>
          `}
        </main>
      </div>
    `;
    updateSaveIndicatorUI();
  }

  function handlePointsSelect(val) {
    if (val === 'custom') {
      const customVal = prompt('أدخل قيمة النقاط المخصصة:', '1500');
      if (customVal && !isNaN(Number(customVal))) setQuestionPoints(Number(customVal));
    } else {
      setQuestionPoints(Number(val));
    }
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function updateQuizTitle(t) { if (currentQuiz) { currentQuiz.title = t; scheduleAutoSave(); } }
  function updateQuizSubject(s) { if (currentQuiz) { currentQuiz.subject = s; scheduleAutoSave(); } }
  function updateQuizGrade(g) { if (currentQuiz) { currentQuiz.grade = g; scheduleAutoSave(); } }
  function updateQuestionText(t) { if (currentQuiz?.questions[activeQIndex]) { currentQuiz.questions[activeQIndex].q = t; scheduleAutoSave(); } }
  function updateQuestionExplain(e) { if (currentQuiz?.questions[activeQIndex]) { currentQuiz.questions[activeQIndex].explain = e; scheduleAutoSave(); } }
  function updateOptionText(oIdx, t) { if (currentQuiz?.questions[activeQIndex]?.opts) { currentQuiz.questions[activeQIndex].opts[oIdx] = t; scheduleAutoSave(); } }
  function setCorrectAnswer(oIdx) { if (currentQuiz?.questions[activeQIndex]) { currentQuiz.questions[activeQIndex].ans = oIdx; scheduleAutoSave(); renderBuilderView(); } }
  function addOption() { const q = currentQuiz?.questions[activeQIndex]; if (q && q.opts.length < 6) { q.opts.push('الخيار ' + (q.opts.length + 1)); scheduleAutoSave(); renderBuilderView(); } }
  function removeOption(oIdx) { const q = currentQuiz?.questions[activeQIndex]; if (q && q.opts.length > 2) { q.opts.splice(oIdx, 1); if (q.ans === oIdx) q.ans = 0; else if (q.ans > oIdx) q.ans--; scheduleAutoSave(); renderBuilderView(); } }

  function addImportedQuestion(qObj) {
    if (!currentQuiz) currentQuiz = { ...createDefaultQuiz(), questions: [] };
    const opts = Array.isArray(qObj?.opts) ? qObj.opts : (Array.isArray(qObj?.options) ? qObj.options : ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4']);
    const ans = Number(qObj?.ans ?? qObj?.answer ?? (Array.isArray(qObj?.correct) ? qObj.correct[0] : 0)) || 0;
    currentQuiz.questions.push({
      id: qObj?.id || ('q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
      q: qObj?.q || qObj?.text || '', opts: [...opts], ans,
      time: Number(qObj?.time || qObj?.timeLimit) || 20, points: Number(qObj?.points) || 100,
      doublePoints: Boolean(qObj?.doublePoints), explain: qObj?.explain || qObj?.explanation || qObj?.why || '',
      skill: qObj?.skill || currentQuiz.subject || 'اللغة العربية', image: qObj?.image || null, imageAlt: qObj?.imageAlt || ''
    });
    activeQIndex = currentQuiz.questions.length - 1;
    scheduleAutoSave();
    const builderStage = document.getElementById('scorearQuizBuilderStage');
    const appModal = document.getElementById('modal');
    if (builderStage?.style.display === 'flex' || (appModal?.open && builderStage && builderStage.style.display !== 'none')) {
      renderBuilderView();
    }
  }

  function importQuestions(list, meta = {}) {
    if (!Array.isArray(list) || !list.length) return;
    if (!currentQuiz) currentQuiz = { ...createDefaultQuiz(), questions: [] };
    if (meta.title) currentQuiz.title = meta.title;
    if (meta.subject) currentQuiz.subject = meta.subject;
    if (meta.grade) currentQuiz.grade = meta.grade;
    if (currentQuiz.questions.length === 1 && !currentQuiz.questions[0].q.trim()) currentQuiz.questions = [];
    list.forEach(item => addImportedQuestion(item));
    openBuilder(currentQuiz);
  }

  global.ScoreARQuizBuilder = {
    addImportedQuestion, importQuestions, getQuiz: () => currentQuiz,
    openBuilder, resumeLastDraft, closeBuilder, addQuestion, duplicateQuestion,
    deleteQuestion, moveQuestion, selectQuestion, toggleDoublePoints,
    setQuestionTime, setQuestionPoints, handlePointsSelect, setQuestionImage,
    setQuestionImageAlt, updateQuizTitle, updateQuizSubject, updateQuizGrade,
    updateQuestionText, updateQuestionExplain, updateOptionText, setCorrectAnswer,
    addOption, removeOption, publishAndLaunchContest, validateQuiz, renderBuilderView,
    getCurrentQuiz: () => currentQuiz,
    getCurrentQuestion: () => currentQuiz?.questions[activeQIndex] || null
  };
})(typeof window !== 'undefined' ? window : this);
