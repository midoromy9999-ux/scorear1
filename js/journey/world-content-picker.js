/**
 * ScoreAR World Content Picker (world-content-picker.js)
 * Item 1: Direct Content Picker upon selecting a world from Worlds page.
 * Live search, multi-selection from question bank, pre-made quizzes selection,
 * or merging both, with live question & time counter, and direct room launch.
 * Strictly Rule 7 Compliant (<500 lines).
 */
(function (global) {
  'use strict';

  let activeWorldId = 'royal';
  let selectedQuizId = null;
  let selectedQuizQuestions = [];
  let selectedBankQuestionIds = new Set();
  let activeTab = 'quizzes'; // 'quizzes' | 'bank'
  let searchQuery = '';
  let subjectFilter = 'all';
  const uiIc = (n, s = 14) => global.ScoreARUI?.icon?.(n, { size: s }) || '';

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getWorldData(id) {
    const list = (global.ScoreARWorldFlow && global.ScoreARWorldFlow.WORLDS_DATA) || [
      { id: 'royal', name: 'القصر الملكي الأندلسي', tag: 'تاريخ وأصالة', image: 'royal_palace' },
      { id: 'oasis', name: 'واحة النخيل والرمال', tag: 'بيئة عربية', image: 'desert_oasis' },
      { id: 'cosmic', name: 'محطة الفضاء العربية', tag: 'خيال ومستقبل', image: 'space_station' },
      { id: 'treasure', name: 'جزيرة الكنز الأسطورية', tag: 'مغامرة واستكشاف', image: 'treasure_island' },
      { id: 'stadium', name: 'استاد الأبطال الرياضي', tag: 'منافسة وحماس', image: 'sports_stadium' },
      { id: 'magic', name: 'المملكة السحرية العائمة', tag: 'سحر وفانتازيا', image: 'magic_kingdom' }
    ];
    return list.find(w => w.id === id) || list[0];
  }

  function getOrCreateModal() {
    let m = document.getElementById('scorearWorldContentPickerModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'scorearWorldContentPickerModal';
      m.style.cssText = 'position:fixed;inset:0;background:rgba(5,6,15,0.92);backdrop-filter:blur(10px);z-index:99999;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;direction:rtl;font-family:Cairo,Tajawal,sans-serif;';
      document.body.appendChild(m);
    }
    return m;
  }

  async function openContentPicker(options = {}) {
    activeWorldId = options.worldId || localStorage.getItem('scorear_last_world') || 'royal';
    localStorage.setItem('scorear_last_world', activeWorldId);
    selectedQuizId = options.quizId || null;
    selectedQuizQuestions = [];
    selectedBankQuestionIds = new Set();
    activeTab = options.defaultTab || 'quizzes';
    searchQuery = '';
    subjectFilter = 'all';

    const m = getOrCreateModal();
    m.style.display = 'flex';

    if (global.ScoreARQuizBankData) {
      await global.ScoreARQuizBankData.refreshAllData();
    }

    if (selectedQuizId && global.ScoreARQuizBankData) {
      const qz = global.ScoreARQuizBankData.getQuizzes().find(q => q.id === selectedQuizId);
      if (qz && qz.questions) {
        selectedQuizQuestions = JSON.parse(JSON.stringify(qz.questions));
      }
    }

    renderContentPicker();
  }

  function closeContentPicker() {
    const m = document.getElementById('scorearWorldContentPickerModal');
    if (m) m.style.display = 'none';
  }

  function getCombinedQuestions() {
    const combined = [...selectedQuizQuestions];
    if (global.ScoreARQuizBankData) {
      const allBank = global.ScoreARQuizBankData.getQuestions();
      for (const id of selectedBankQuestionIds) {
        const q = allBank.find(x => x.id === id);
        if (q && !combined.some(c => c.id === q.id || c.q === q.q)) {
          combined.push({
            id: q.id,
            q: q.q || q.text,
            opts: q.opts || q.options,
            ans: q.ans !== undefined ? q.ans : (q.correct ? q.correct[0] : 0),
            explain: q.explain || q.explanation || '',
            timeLimit: q.timeLimit || 20,
            points: q.points || 1000
          });
        }
      }
    }
    return combined;
  }

  function renderContentPicker() {
    const m = getOrCreateModal();
    const curWorld = getWorldData(activeWorldId);
    const quizzes = global.ScoreARQuizBankData ? global.ScoreARQuizBankData.getQuizzes() : [];
    const bankQuestions = global.ScoreARQuizBankData ? global.ScoreARQuizBankData.getQuestions() : [];

    // Filter bank questions
    const filteredBank = bankQuestions.filter(q => {
      const txt = (q.q || q.text || '').toLowerCase();
      const matchSearch = !searchQuery || txt.includes(searchQuery.toLowerCase());
      const matchSubj = (subjectFilter === 'all') || (q.subject === subjectFilter);
      return matchSearch && matchSubj;
    });

    const combinedQuestions = getCombinedQuestions();
    const totalCount = combinedQuestions.length;
    const totalSeconds = combinedQuestions.reduce((acc, cur) => acc + (Number(cur.timeLimit) || 20), 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeFormatted = mins > 0 ? `${mins} د و ${secs} ث` : `${secs} ثانية`;

    m.innerHTML = `
      <div class="scorear-modal-shell" style="width:100%;max-width:920px;height:90vh;max-height:860px;">
        <!-- Header: Active World Showcase & Switcher -->
        <header class="scorear-modal-head">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;border-radius:12px;overflow:hidden;border:1px solid rgba(172,139,242,0.45);position:relative;">
              <img src="assets/worlds/${curWorld.id}/lobby.jpg" onerror="this.src='assets/${curWorld.id}.webp'" alt="${curWorld.name}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <h3 style="color:#ffffff;font-size:16px;font-weight:900;margin:0;">${curWorld.name}</h3>
                <span style="background:rgba(142,100,239,0.22);border:1px solid rgba(172,139,242,0.4);color:#c4b5fd;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;">${curWorld.tag}</span>
              </div>
              <p style="color:#a1a4be;font-size:11px;margin:2px 0 0 0;">اختر المحتوى التعليمي لبدء القاعة مباشرة في هذا العالم المختار.</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" onclick="ScoreARWorldContentPicker.promptChangeWorld()" class="scorear-gear-btn" style="padding:6px 12px;">
              ${uiIc('planet', 14)} <span>تغيير العالم</span>
            </button>
            <button type="button" onclick="ScoreARWorldContentPicker.closeContentPicker()" class="scorear-gear-btn" aria-label="إغلاق">${uiIc('close', 15)}</button>
          </div>
        </header>

        <!-- Search & Tab Bar -->
        <div style="background:rgba(17,18,38,0.85);padding:12px 22px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
          <div class="scorear-segmented-tabs">
            <button type="button" onclick="ScoreARWorldContentPicker.switchTab('quizzes')" class="scorear-segmented-tab ${activeTab==='quizzes'?'active':''}">
              ${uiIc('book', 14)} <span>مسابقاتي الجاهزة (${quizzes.length})</span>
            </button>
            <button type="button" onclick="ScoreARWorldContentPicker.switchTab('bank')" class="scorear-segmented-tab ${activeTab==='bank'?'active':''}">
              ${uiIc('layers', 14)} <span>بنك الأسئلة (${bankQuestions.length})</span>
            </button>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <div style="position:relative;display:flex;align-items:center;">
              <span style="position:absolute;right:10px;color:#9ca3af;display:inline-flex;pointer-events:none;">${uiIc('search', 13)}</span>
              <input type="text" value="${escapeHtml(searchQuery)}" oninput="ScoreARWorldContentPicker.setSearch(this.value)" placeholder="بحث في المحتوى..." style="background:rgba(20,22,46,0.9);border:1px solid rgba(255,255,255,0.14);color:#fff;padding:6px 30px 6px 12px;border-radius:10px;font-size:11px;width:180px;font-family:inherit;">
            </div>
            ${activeTab === 'bank' ? `
              <button type="button" onclick="ScoreARWorldContentPicker.toggleSelectAllBank()" class="scorear-gear-btn" style="padding:6px 11px;">
                ${selectedBankQuestionIds.size === filteredBank.length && filteredBank.length > 0 ? 'إلغاء تحديد الكل' : 'تحديد كل المعروض'}
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="scorear-modal-body" style="flex:1 1 0%;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:16px 22px;">
          ${activeTab === 'quizzes' ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:12px;">
              ${!quizzes.length ? `
                <div style="text-align:center;grid-column:1/-1;padding:40px;color:#9ca3af;">
                  <p>لا توجد مسابقات جاهزة. يمكنك اختيار أسئلة من بنك الأسئلة بالتبويب المجاور.</p>
                </div>
              ` : quizzes.map(qz => {
                const count = qz.questions ? qz.questions.length : 0;
                const isSelected = (selectedQuizId === qz.id);
                return `
                  <div onclick="ScoreARWorldContentPicker.selectQuiz('${qz.id}')" style="cursor:pointer;border:1px solid ${isSelected ? '#44b8a5' : 'rgba(255,255,255,0.1)'};background:${isSelected ? 'rgba(68,184,165,0.14)' : 'rgba(20,21,42,0.75)'};border-radius:14px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;transition:all 0.2s;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="background:rgba(142,100,239,0.2);color:#c4b5fd;font-size:10px;font-weight:800;padding:2px 8px;border-radius:6px;">${escapeHtml(qz.subject || 'مسابقة')}</span>
                      <span style="color:${isSelected ? '#34d399' : '#666'};font-size:18px;font-weight:900;">${isSelected ? uiIc('check', 15) : '○'}</span>
                    </div>
                    <h4 style="color:#ffffff;font-size:14px;font-weight:900;margin:0;">${escapeHtml(qz.title || 'مسابقة')}</h4>
                    <div style="color:#52d9ed;font-size:11px;font-weight:800;">${count} أسئلة</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${!filteredBank.length ? `
                <div style="text-align:center;padding:40px;color:#9ca3af;">
                  <p>لا توجد أسئلة تطابق البحث في بنك الأسئلة.</p>
                </div>
              ` : filteredBank.map(q => {
                const isChecked = selectedBankQuestionIds.has(q.id);
                return `
                  <div onclick="ScoreARWorldContentPicker.toggleBankQuestion('${q.id}')" style="cursor:pointer;background:${isChecked ? 'rgba(117,80,239,0.2)' : 'rgba(20,21,42,0.75)'};border:1px solid ${isChecked ? '#7550ef' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:12px;">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} style="width:18px;height:18px;accent-color:#7550ef;cursor:pointer;">
                    <div style="flex:1;">
                      <div style="color:#fff;font-size:13px;font-weight:800;margin-bottom:2px;">${escapeHtml(q.q || q.text)}</div>
                      <div style="display:flex;gap:8px;align-items:center;">
                        <span style="color:#34d399;font-size:11px;">الإجابة: «${escapeHtml(q.opts ? q.opts[q.ans] : '')}»</span>
                        ${q.subject ? `<span style="color:#a89bff;font-size:10px;">• ${escapeHtml(q.subject)}</span>` : ''}
                      </div>
                    </div>
                    <span style="color:#52d9ed;font-size:11px;font-weight:800;">${q.timeLimit || 20} ث</span>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Sticky Live Counter & Launch Footer -->
        <footer class="scorear-modal-head" style="border-top:1px solid rgba(255,255,255,0.09);border-bottom:none;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div class="scorear-control-pill">
              ${uiIc('layers', 14)}
              <span style="color:#fff;font-size:12.5px;"><b style="color:#52d9ed;">${totalCount}</b> أسئلة مختارة</span>
            </div>
            <div class="scorear-control-pill">
              ${uiIc('clock', 14)}
              <span style="color:#fff;font-size:12.5px;">الزمن المتوقع: <b style="color:#fcd34d;">${timeFormatted}</b></span>
            </div>
          </div>

          <div style="display:flex;gap:10px;">
            <button type="button" onclick="ScoreARWorldContentPicker.closeContentPicker()" class="scorear-gear-btn" style="padding:9px 18px;font-size:12.5px;">إلغاء</button>
            <button type="button" onclick="ScoreARWorldContentPicker.launchRoomWithChosenContent()" ${totalCount === 0 ? 'disabled' : ''} class="btn launch-primary" style="padding:10px 26px;font-size:13.5px;opacity:${totalCount === 0 ? '0.45' : '1'};cursor:${totalCount === 0 ? 'not-allowed' : 'pointer'};">
              ${uiIc('play', 15)} <span>افتح القاعة بالعالم المختار</span>
            </button>
          </div>
        </footer>
      </div>
    `;
  }

  function switchTab(t) {
    activeTab = t;
    renderContentPicker();
  }

  function setSearch(q) {
    searchQuery = q;
    renderContentPicker();
  }

  function selectQuiz(quizId) {
    if (selectedQuizId === quizId) {
      selectedQuizId = null;
      selectedQuizQuestions = [];
    } else {
      selectedQuizId = quizId;
      if (global.ScoreARQuizBankData) {
        const qz = global.ScoreARQuizBankData.getQuizzes().find(q => q.id === quizId);
        selectedQuizQuestions = qz && qz.questions ? JSON.parse(JSON.stringify(qz.questions)) : [];
      }
    }
    renderContentPicker();
  }

  function toggleBankQuestion(qId) {
    if (selectedBankQuestionIds.has(qId)) {
      selectedBankQuestionIds.delete(qId);
    } else {
      selectedBankQuestionIds.add(qId);
    }
    renderContentPicker();
  }

  function toggleSelectAllBank() {
    const bankQuestions = global.ScoreARQuizBankData ? global.ScoreARQuizBankData.getQuestions() : [];
    const filtered = bankQuestions.filter(q => {
      const txt = (q.q || q.text || '').toLowerCase();
      return !searchQuery || txt.includes(searchQuery.toLowerCase());
    });
    if (selectedBankQuestionIds.size === filtered.length && filtered.length > 0) {
      selectedBankQuestionIds.clear();
    } else {
      filtered.forEach(q => selectedBankQuestionIds.add(q.id));
    }
    renderContentPicker();
  }

  function promptChangeWorld() {
    if (global.ScoreARWorldFlow && typeof global.ScoreARWorldFlow.openWorldPicker === 'function') {
      global.ScoreARWorldFlow.openWorldPicker({
        defaultWorldId: activeWorldId,
        onConfirm: (newWorldId) => {
          activeWorldId = newWorldId;
          localStorage.setItem('scorear_last_world', newWorldId);
          renderContentPicker();
        }
      });
    }
  }

  function launchRoomWithChosenContent() {
    const combined = getCombinedQuestions();
    if (!combined.length) {
      alert('يرجى اختيار مسابقة أو تحديد أسئلة من بنك الأسئلة أولاً.');
      return;
    }

    closeContentPicker();
    let chosenTitle = '';
    if (selectedQuizId && global.ScoreARQuizBankData) {
      const qz = global.ScoreARQuizBankData.getQuizzes().find(q => q.id === selectedQuizId);
      if (qz && qz.title) chosenTitle = String(qz.title).trim();
    }
    if (!chosenTitle) {
      chosenTitle = (subjectFilter && subjectFilter !== 'all')
        ? ('مسابقة ' + subjectFilter)
        : (combined[0]?.skill ? ('مسابقة ' + combined[0].skill) : 'مسابقة بنك الأسئلة');
    }
    global.activeQuizTitle = chosenTitle;
    try { sessionStorage.setItem('scorear_active_quiz_title', chosenTitle); } catch(e){}
    global.contestQuestions = combined;

    if (global.toast) {
      global.toast(`تم تجهيز (${combined.length}) سؤالاً. جارٍ فتح القاعة في ${getWorldData(activeWorldId).name}...`);
    }

    if (global.ScoreARQuizHost && typeof global.ScoreARQuizHost.startHostLobby === 'function') {
      global.ScoreARQuizHost.startHostLobby(activeWorldId, null, true, false);
    } else if (typeof global.renderLiveLobby === 'function') {
      global.renderLiveLobby(activeWorldId, null, true, false);
    }
  }

  global.ScoreARWorldContentPicker = {
    openContentPicker,
    closeContentPicker,
    switchTab,
    setSearch,
    selectQuiz,
    toggleBankQuestion,
    toggleSelectAllBank,
    promptChangeWorld,
    launchRoomWithChosenContent
  };

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
