/**
 * ScoreAR AI Studio Coordinator (quiz-ai.js)
 * Item 4: Teacher AI Studio, In-browser streaming orchestration,
 * Controls (count, range, difficulty, format, instructions), pre-flight estimation,
 * Honest progress bar with cancellation, and review hand-off.
 * Strictly Rule 7 Compliant (<500 lines).
 */
(function (global) {
  'use strict';

  let currentContext = { mode: 'hub', onImport: null };
  let selectedFile = null;
  let activeTab = 'text'; // 'text' | 'file'
  let activeCancellationToken = null;
  const uiIc = (n, s = 15) => global.ScoreARUI?.icon?.(n, { size: s }) || '';
  const uiBox = (n, t = 'violet', s = 'md') => global.ScoreARUI?.iconBox?.(n, { size: s, tone: t }) || '';

  function getDb() {
    return (global.firebase && global.firebase.database) ? global.firebase.database() : null;
  }
  function getAuth() {
    return (global.firebase && global.firebase.auth) ? global.firebase.auth() : null;
  }
  function getCurrentUser() {
    const a = getAuth();
    return a ? a.currentUser : null;
  }

  // --- 1. Daily Quota Reader ---
  async function fetchTodayQuota() {
    const user = getCurrentUser();
    if (!user) return { used: 0, limit: 20, remaining: 20 };
    const today = new Date().toISOString().slice(0, 10);
    const db = getDb();
    if (!db) return { used: 0, limit: 20, remaining: 20 };
    try {
      const snap = await db.ref(`scorear_ai_quotas/${user.uid}/${today}`).once('value');
      const val = snap.val() || {};
      const used = Number(val.usedCount) || 0;
      const limit = Number(val.limit) || 20;
      return { used, limit, remaining: Math.max(0, limit - used) };
    } catch (e) {
      return { used: 0, limit: 20, remaining: 20 };
    }
  }

  // --- 2. Modal Stage Management ---
  function getOrCreateAiModal() {
    let m = document.getElementById('scorearAiStudioModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'scorearAiStudioModal';
      m.style.cssText = 'position:fixed;inset:0;background:rgba(5,6,15,0.92);backdrop-filter:blur(10px);z-index:99999;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;direction:rtl;font-family:inherit;';
      document.body.appendChild(m);
    }
    return m;
  }

  async function openAiStudio(options = {}) {
    currentContext = {
      mode: options.mode || 'hub',
      onImport: options.onImport || null,
      initialText: options.initialText || '',
      initialTitle: options.initialTitle || ''
    };
    selectedFile = null;
    activeTab = 'text';
    activeCancellationToken = null;

    const m = getOrCreateAiModal();
    m.style.display = 'flex';
    renderAiModalView({ used: 0, limit: 20, remaining: 20 });

    const applyInitialInputs = () => {
      if (currentContext.initialText) {
        const ta = m.querySelector('#aiTextInput');
        if (ta && !ta.value) {
          ta.value = currentContext.initialText;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };
    applyInitialInputs();

    try {
      const quota = await Promise.race([
        fetchTodayQuota(),
        new Promise(res => setTimeout(() => res(null), 1800))
      ]);
      if (quota && m.style.display === 'flex' && activeTab === 'text') {
        const curText = m.querySelector('#aiTextInput')?.value || '';
        renderAiModalView(quota);
        const nextTa = m.querySelector('#aiTextInput');
        if (nextTa) nextTa.value = curText || currentContext.initialText || '';
      }
    } catch {}
  }

  function closeAiStudio() {
    if (activeCancellationToken) activeCancellationToken.cancel();
    const m = document.getElementById('scorearAiStudioModal');
    if (m) m.style.display = 'none';
  }

  // --- 3. View Renderer ---
  function renderAiModalView(quota = { used: 0, limit: 20, remaining: 20 }) {
    const m = getOrCreateAiModal();
    const isExhausted = (quota.remaining <= 0);
    const fileName = selectedFile ? selectedFile.name : '';
    const fileSizeMb = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0;
    const isLargeFile = selectedFile && selectedFile.size > 8 * 1024 * 1024;

    m.innerHTML = `
      <div class="scorear-modal-shell" style="width:100%;max-width:820px;max-height:94vh;">
        <!-- Header -->
        <header class="scorear-modal-head">
          <div style="display:flex;align-items:center;gap:12px;">
            ${uiBox('spark', 'violet', 'md')}
            <div>
              <h2 style="color:#ffffff;font-size:17px;font-weight:900;margin:0;">توليد الأسئلة الذكي من المستندات (Gemini Engine)</h2>
              <p style="color:#a1a4be;font-size:12px;margin:2px 0 0 0;">استخراج محلي سريع، تصنيف ضد الحشو، ومطابقة اقتباسات موثقة من المصدر.</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="scorear-control-pill" style="color:${isExhausted ? '#fca5a5' : '#7fe7ce'};border-color:${isExhausted ? 'rgba(239,68,68,0.45)' : 'rgba(88,220,227,0.32)'};">
              ${uiIc('zap', 13)} <span>الحصة اليومية: ${quota.remaining} / ${quota.limit} متبقية</span>
            </div>
            <button type="button" onclick="ScoreARQuizAI.closeAiStudio()" class="scorear-gear-btn" aria-label="إغلاق">${uiIc('close', 15)}</button>
          </div>
        </header>

        <!-- Body Form -->
        <div class="scorear-modal-body" style="display:flex;flex-direction:column;gap:16px;">
          ${isExhausted ? `
            <div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.42);border-radius:12px;padding:12px 16px;color:#fca5a5;font-size:13px;font-weight:800;display:flex;align-items:center;gap:10px;">
              ${uiIc('alert', 16)}
              <span>تنبيه الحصة: لقد استنفدت حصتك اليومية (${quota.limit}/${quota.limit}). تتجدد الحصة تلقائياً منتصف الليل.</span>
            </div>
          ` : ''}

          <!-- Source Tabs -->
          <div class="scorear-segmented-tabs" style="width:fit-content;">
            <button type="button" onclick="ScoreARQuizAI.switchTab('text')" class="scorear-segmented-tab ${activeTab==='text'?'active':''}">${uiIc('edit', 14)}<span>كتابة نص / درس</span></button>
            <button type="button" onclick="ScoreARQuizAI.switchTab('file')" class="scorear-segmented-tab ${activeTab==='file'?'active':''}">${uiIc('upload', 14)}<span>رفع مستند (PDF / Word / PPTX / صورة)</span></button>
          </div>

          <!-- Input Mode Content -->
          ${activeTab === 'text' ? `
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <label style="color:#ddd8ff;font-size:13px;font-weight:800;">نص الدرس أو الفقرة التعليمية:</label>
                <div style="display:flex;gap:6px;">
                  <button type="button" onclick="ScoreARQuizAI.loadSampleText('nahw')" class="scorear-gear-btn" style="font-size:11px;padding:3px 9px;">مثال نحو</button>
                  <button type="button" onclick="ScoreARQuizAI.loadSampleText('balagha')" class="scorear-gear-btn" style="font-size:11px;padding:3px 9px;">مثال بلاغة</button>
                </div>
              </div>
              <textarea id="aiTextInput" placeholder="الصق نص الدرس أو القواعد النحوية أو الشرح هنا (20 حرفاً على الأقل)..." style="width:100%;height:120px;background:#111226;border:1px solid rgba(255,255,255,0.12);border-radius:14px;color:#fff;font-size:13px;font-family:inherit;padding:12px;box-sizing:border-box;resize:vertical;line-height:1.5;"></textarea>
            </div>
          ` : `
            <div>
              <label style="display:block;color:#ddd8ff;font-size:13px;font-weight:800;margin-bottom:6px;">رفع المستند (استخراج محلي سريع دون تخزين الملف في الخادم):</label>
              <div id="aiFileDropZone" onclick="document.getElementById('aiFileInput').click()" style="border:1px dashed rgba(172,139,242,0.45);border-radius:16px;padding:24px 16px;text-align:center;background:rgba(17,18,38,0.72);cursor:pointer;">
                <input type="file" id="aiFileInput" accept=".docx, .pptx, .pdf, .png, .jpg, .jpeg, .webp, .txt, .md" style="display:none;" onchange="ScoreARQuizAI.handleFileUpload(this.files[0])">
                <div style="display:flex;justify-content:center;margin-bottom:8px;">${uiBox('folderOpen', 'violet', 'lg')}</div>
                <div style="color:#fff;font-size:14px;font-weight:800;">${selectedFile ? `الملف المختار: ${fileName} (${fileSizeMb} MB)` : 'اضغط لاختيار ملف PDF أو Word أو PowerPoint أو صورة'}</div>
                <p style="color:#94a3b8;font-size:11px;margin:4px 0 0 0;">المعالجة تتم محلياً صفحة بصفحة حتى 100MB دون إجهاد الذاكرة.</p>
              </div>

              ${isLargeFile ? `
                <div style="margin-top:8px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.4);border-radius:10px;padding:8px 12px;color:#fbbf24;font-size:11px;display:flex;align-items:center;gap:8px;">
                  ${uiIc('info', 14)}
                  <span>تقدير مسبق: ملف كبير (${fileSizeMb} MB). يقدر زمن الاستخراج بنحو 15-30 ثانية. يوصى بتحديد نطاق صفحات مخصص أدناه.</span>
                </div>
              ` : ''}

              <!-- Page Range Controls -->
              <div style="display:flex;gap:12px;align-items:center;margin-top:10px;background:rgba(20,21,42,0.75);border:1px solid rgba(255,255,255,0.08);padding:8px 14px;border-radius:10px;flex-wrap:wrap;">
                <span style="color:#c4b5fd;font-size:11px;font-weight:800;">نطاق الصفحات / الشرائح (اختياري):</span>
                <input type="number" id="aiStartPage" placeholder="من صفحة (1)" min="1" style="width:90px;background:#111226;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;">
                <span style="color:#94a3b8;font-size:11px;">إلى:</span>
                <input type="number" id="aiEndPage" placeholder="إلى صفحة" min="1" style="width:90px;background:#111226;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;">
              </div>
            </div>
          `}

          <!-- Settings Grid -->
          <div style="background:rgba(20,21,42,0.7);border-radius:16px;padding:14px;border:1px solid rgba(255,255,255,0.08);display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:10px;">
            <div>
              <label style="display:block;color:#a89bff;font-size:11px;font-weight:800;margin-bottom:4px;">عدد الأسئلة:</label>
              <select id="aiOptCount" style="width:100%;background:#181936;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:6px;border-radius:8px;font-size:11px;font-family:inherit;">
                <option value="3">3 أسئلة سريعة</option>
                <option value="5" selected>5 أسئلة (موصى به)</option>
                <option value="10">10 أسئلة شاملة</option>
                <option value="15">15 سؤالاً</option>
                <option value="20">20 سؤالاً (الحد الأقصى)</option>
              </select>
            </div>
            <div>
              <label style="display:block;color:#a89bff;font-size:11px;font-weight:800;margin-bottom:4px;">مستوى الصعوبة:</label>
              <select id="aiOptDiff" style="width:100%;background:#181936;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:6px;border-radius:8px;font-size:11px;font-family:inherit;">
                <option value="سهل">سهل (تذكر وفهم مباشر)</option>
                <option value="متوسط" selected>متوسط (فهم وتطبيق)</option>
                <option value="متقدم">متقدم (تحليل واستنتاج)</option>
                <option value="تحدي">تحدي المتميزين</option>
              </select>
            </div>
            <div>
              <label style="display:block;color:#a89bff;font-size:11px;font-weight:800;margin-bottom:4px;">مزيج الأنواع:</label>
              <select id="aiOptFormat" style="width:100%;background:#181936;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:6px;border-radius:8px;font-size:11px;font-family:inherit;">
                <option value="mcq" selected>اختيار من متعدد فقط (4 خيارات)</option>
                <option value="tf">صح أو خطأ فقط</option>
                <option value="mixed">مزيج (اختيار متعدد + صح وخطأ)</option>
              </select>
            </div>
            <div>
              <label style="display:block;color:#a89bff;font-size:11px;font-weight:800;margin-bottom:4px;">لغة التوليد:</label>
              <select id="aiOptLang" style="width:100%;background:#181936;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:6px;border-radius:8px;font-size:11px;font-family:inherit;">
                <option value="العربية الفصحى" selected>العربية الفصحى</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <!-- Free Teacher Instructions -->
          <div>
            <label style="display:block;color:#cbd5e1;font-size:11px;font-weight:800;margin-bottom:4px;">تعليمات وتوجيهات خاصة للمعلم (اختياري):</label>
            <input type="text" id="aiOptInstructions" placeholder="مثال: ركّز على إعراب الفاعل والمفعول به، تجنب الأسئلة المباشرة..." style="width:100%;background:#111226;border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:12px;padding:8px 12px;box-sizing:border-box;">
          </div>

          <!-- Honest Progress Box (Hidden by default) -->
          <div id="aiProgressBox" style="display:none;background:rgba(20,22,46,0.9);border:1px solid rgba(172,139,242,0.4);border-radius:14px;padding:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span id="aiProgressStageText" style="color:#52d9ed;font-size:13px;font-weight:800;">جارٍ تحضير البيانات...</span>
              <button type="button" onclick="ScoreARQuizAI.cancelGeneration()" class="scorear-gear-btn" style="border-color:rgba(239,68,68,0.4);color:#fca5a5;">${uiIc('close', 12)} <span>إلغاء</span></button>
            </div>
            <div style="background:#0c0d1d;border-radius:6px;height:8px;overflow:hidden;">
              <div id="aiProgressBar" style="background:linear-gradient(90deg, #7550ef, #58dce3);height:100%;width:5%;transition:width 0.3s;"></div>
            </div>
            <div id="aiProgressDetail" style="color:#94a3b8;font-size:11px;margin-top:6px;">جاهز للبدء</div>
          </div>
        </div>

        <!-- Footer Actions -->
        <footer class="scorear-modal-head" style="border-top:1px solid rgba(255,255,255,0.09);border-bottom:none;">
          <span class="scorear-inline-icon" style="color:#94a3b8;font-size:11px;">${uiIc('info', 14)} المسودة تُعرض في جدول مراجعة مفصل لاعتمادها أو تعديلها قبل الحفظ.</span>
          <div style="display:flex;gap:10px;">
            <button type="button" onclick="ScoreARQuizAI.closeAiStudio()" class="scorear-gear-btn" style="padding:8px 16px;">إلغاء</button>
            <button type="button" id="btnTriggerAiGen" onclick="ScoreARQuizAI.triggerGeneration()" ${isExhausted ? 'disabled' : ''} class="btn launch-primary" style="padding:10px 22px;font-size:13px;opacity:${isExhausted ? '0.45' : '1'};cursor:${isExhausted ? 'not-allowed' : 'pointer'};">
              ${uiIc('spark', 15)} <span>بدء التحليل والتوليد الذكي</span>
            </button>
          </div>
        </footer>
      </div>
    `;
  }

  // --- 4. Handlers ---
  function switchTab(t) {
    activeTab = t;
    fetchTodayQuota().then(renderAiModalView);
  }

  function loadSampleText(type) {
    const area = document.getElementById('aiTextInput');
    if (!area) return;
    if (type === 'nahw') {
      area.value = `درس: أسلوب المدح والذم في اللغة العربية.
يتكون أسلوب المدح والذم من ثلاثة أركان أساسية:
1. فعل المدح أو الذم: (نِعْمَ وحَبّذا للمدح، وبِئْسَ ولا حَبّذا للذم). وهي أفعال جامدة تلزم صيغة الماضي.
2. الفاعل: وله أربع صور مع نعم وبئس: المعرف بـ (أل) مثل: نعم الخلقُ الصدقُ، المضاف إلى ما فيه أل مثل: نعم خلقُ المرءِ الوفاءُ، ضمير مستتر يفسره تمييز نكرة مثل: نعم خلقاً الصدقُ، أو (ما / مَنْ) الموصولتان مثل: نعم ما تتصف به الأمانة.
3. المخصوص بالمدح أو الذم: ويعرب مبتدأ مؤخراً مرفوعاً والجملة قبله خبر مقدم، أو خبراً لمبتدأ محذوف وجوباً. مع حبذا ولا حبذا يجب تأخير المخصوص ولا يصح تقديمه.`;
    } else {
      area.value = `درس: التشبيه وأركانه في علم البيان.
التشبيه هو عقد مماثلة بين أمرين أو أكثر اشتركا في صفة أو أكثر بواسطة أداة التشبيه.
أركان التشبيه أربعة:
1. المشبه: الأمر المراد توضيحه.
2. المشبه به: الأمر الأكثر وضوحاً في الصفة المشتركة. وهما طرفا التشبيه الأساسيان.
3. أداة التشبيه: قد تكون اسماً (مثل، شبه)، أو فعلاً (يشبه، يماثل)، أو حرفاً (الكاف، كأن).
4. وجه الشبه: الصفة المشتركة بين الطرفين وتكون في المشبه به أقوى.
أنواعه: التشبيه المفصل (ذكرت فيه الأركان الأربعة)، التشبيه المجمل (حذفت منه الأداة أو وجه الشبه)، والتشبيه البليغ (حذفت منه الأداة ووجه الشبه معاً وهو أبلغ الأنواع).`;
    }
  }

  function handleFileUpload(file) {
    if (!file) return;
    selectedFile = file;
    fetchTodayQuota().then(renderAiModalView);
    if (global.toast) global.toast(`تم اختيار (${file.name}) ✓`);
  }

  function cancelGeneration() {
    if (activeCancellationToken) {
      activeCancellationToken.cancel();
      if (global.toast) global.toast('تم إيقاف العملية بواسطة المعلم.');
    }
    const pBox = document.getElementById('aiProgressBox');
    const btn = document.getElementById('btnTriggerAiGen');
    if (pBox) pBox.style.display = 'none';
    if (btn) btn.disabled = false;
  }

  // --- 5. Main Execution Orchestrator ---
  async function triggerGeneration() {
    const user = getCurrentUser();
    if (!user) {
      alert('عفواً، يجب تسجيل دخول المعلم أولاً لاستخدام الذكاء الاصطناعي.');
      return;
    }

    const textContent = (document.getElementById('aiTextInput')?.value || '').trim();
    if (activeTab === 'text' && textContent.length < 20) {
      alert('يرجى إدخال نص كافٍ من الدرس (20 حرفاً على الأقل).');
      return;
    }
    if (activeTab === 'file' && !selectedFile) {
      alert('يرجى اختيار ملف مستند أو صورة أولاً.');
      return;
    }

    const pBox = document.getElementById('aiProgressBox');
    const pStage = document.getElementById('aiProgressStageText');
    const pBar = document.getElementById('aiProgressBar');
    const pDetail = document.getElementById('aiProgressDetail');
    const btn = document.getElementById('btnTriggerAiGen');

    if (btn) btn.disabled = true;
    if (pBox) pBox.style.display = 'block';

    activeCancellationToken = global.ScoreARDocExtractor ? global.ScoreARDocExtractor.createCancellationToken() : { isCancelled: false };

    try {
      const startPage = parseInt(document.getElementById('aiStartPage')?.value, 10) || 1;
      const endPage = parseInt(document.getElementById('aiEndPage')?.value, 10) || 0;

      // Stage 1: Document Extraction (Client-Side Streaming)
      if (pStage) pStage.innerText = '1/4 استخراج المحتوى صفحة بصفحة محلياً...';
      if (pBar) pBar.style.width = '15%';

      let extractedDoc = null;
      if (activeTab === 'text') {
        extractedDoc = await global.ScoreARDocExtractor.extractText(textContent, {}, activeCancellationToken);
      } else {
        extractedDoc = await global.ScoreARDocExtractor.extractDocument(
          selectedFile,
          { startPage, endPage: endPage > 0 ? endPage : undefined },
          activeCancellationToken,
          (prog) => {
            if (pBar) pBar.style.width = `${Math.min(30, Math.round(prog.percent * 0.3))}%`;
            if (pDetail) pDetail.innerText = prog.statusText || '';
          }
        );
      }

      if (activeCancellationToken.isCancelled) return;

      // Stage 2, 3, 4: Execute 3-Stage Pipeline (Classify, Generate micro-chunks, Verify)
      const options = {
        count: Number(document.getElementById('aiOptCount')?.value || 5),
        difficulty: document.getElementById('aiOptDiff')?.value || 'متوسط',
        format: document.getElementById('aiOptFormat')?.value || 'mcq',
        language: document.getElementById('aiOptLang')?.value || 'العربية الفصحى',
        instructions: (document.getElementById('aiOptInstructions')?.value || '').trim()
      };

      const result = await global.ScoreARQuizAIPipeline.executePipeline(
        extractedDoc.pages,
        options,
        user,
        {
          onProgress: (pct) => {
            if (pBar) pBar.style.width = `${pct}%`;
          },
          onStatus: (statusText) => {
            if (pDetail) pDetail.innerText = statusText;
          }
        }
      );

      if (activeCancellationToken.isCancelled) return;

      // Stage 5: Hand off to Editable Review Table
      closeAiStudio();

      if (global.ScoreARQuizAIReview && global.ScoreARQuizAIReview.openReviewTable) {
        global.ScoreARQuizAIReview.openReviewTable(result.questions, {
          mode: currentContext.mode,
          onCommit: currentContext.onImport
        });
      } else if (typeof currentContext.onImport === 'function') {
        currentContext.onImport(result.questions);
      }

    } catch (err) {
      if (err.message === 'CANCELED_BY_USER' || activeCancellationToken?.isCancelled) {
        return;
      }
      console.error('[ScoreAR AI Studio] Pipeline Failed:', err);
      alert('تنبيه: ' + (err.message || 'فشلت معالجة وتوليد الأسئلة.'));
      if (pBox) pBox.style.display = 'none';
      if (btn) btn.disabled = false;
    }
  }

  global.ScoreARQuizAI = {
    openAiStudio,
    closeAiStudio,
    switchTab,
    loadSampleText,
    handleFileUpload,
    cancelGeneration,
    triggerGeneration
  };

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
