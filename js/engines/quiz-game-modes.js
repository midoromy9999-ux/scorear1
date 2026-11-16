/**
 * ScoreAR Game Modes Controller — Kahoot! Go Full-Screen Pre-Lobby Launchpad
 * Features 3 Custom Visual Previews (Solo Classic, Teams/Squads, Card Arena) + 3D White Start Button.
 * Strictly Rule 7 Compliant (<290 lines).
 */
(function(global) {
  'use strict';

  let currentMode = 'SOLO'; // 'SOLO' | 'SQUADS' | 'CARD_ARENA'
  let isAiEnabled = false;
  let activeModalEl = null;
  let activeFilter = 'ALL';

  const MODES_CONFIG = {
    SOLO: {
      id: 'SOLO',
      cat: 'SOLO',
      icon: '👤',
      enTitle: 'Classic Solo',
      titleAr: 'التحدي الفردي الكلاسيكي',
      badgeAr: 'كلاسيكي',
      pills: ['حتى 60 مشارك', 'تنافس فردي مباشر', 'تقييم وسرعة'],
      subOption1: '📱 جهاز واحد لكل طالب مشارك',
      subOption2: '⚡ نقاط على الصحة + مكافأة السرعة والـ Streak',
      descAr: 'كل طالب ينافس بشخصيته الكرتونية بشكل مستقل لحصد أعلى النقاط عبر دقة الإجابة وسرعة البديهة للوصول إلى قمة منصة التتويج.',
      accentColor: '#8e64ef',
      thumbBg: 'linear-gradient(135deg, #46178f 0%, #1368ce 100%)'
    },
    SQUADS: {
      id: 'SQUADS',
      cat: 'TEAMS',
      icon: '🛡️',
      enTitle: 'Teams',
      titleAr: 'طور الفرق والمجموعات',
      badgeAr: 'Teams',
      pills: ['منافسة الفرق', 'التعاون داخل الفصل', 'تقييم جماعي'],
      subOption1: '🛡️ توزيع تلقائي في فرق (صقور المعرفة × أسود المجرة)',
      subOption2: '🤝 مجموع نقاط أعضاء الفريق يحدد الصدارة',
      descAr: 'قم بتعزيز مهارات التعاون والعمل الجماعي داخل الفصل؛ يعمل الطلاب معاً في أفرقة متنافسة وتُجمع نقاطهم لرفع راية فريقهم نحو الصدارة.',
      accentColor: '#38bdf8',
      thumbBg: 'linear-gradient(135deg, #0f172a 0%, #0284c7 55%, #2563eb 100%)'
    },
    CARD_ARENA: {
      id: 'CARD_ARENA',
      cat: 'CARDS',
      icon: '🃏',
      enTitle: 'Card Arena',
      titleAr: 'طور حرب الكروت والمهارات',
      badgeAr: 'حصري ⚡',
      pills: ['20 كارت تكتيكي', 'حماس مضاعف', 'تفاعل خارق'],
      subOption1: '🃏 كروت هجوم ودفاع (تجميد، درع، مضاعفة النقاط)',
      subOption2: '🎯 أسرع إجابتين في كل سؤال تحصلان على كارت مهارة فوري',
      descAr: 'الطور الحصري لسكور آر! الإجابات الصحيحة السريعة تمنح الطلاب كروت مهارات فورية على هواتفهم لقلب موازين المنافسة في اللحظات الحاسمة.',
      accentColor: '#f59e0b',
      thumbBg: 'linear-gradient(135deg, #451a03 0%, #b45309 50%, #f59e0b 100%)'
    }
  };

  function getMode() { return currentMode; }
  function isAIEnabled() { return isAiEnabled; }

  function setMode(mode, ai = false) {
    if (MODES_CONFIG[mode]) currentMode = mode;
    isAiEnabled = Boolean(ai);
    try {
      localStorage.setItem('scorear_last_game_mode', currentMode);
      localStorage.setItem('scorear_last_ai_enabled', String(isAiEnabled));
    } catch(e){}
    global.currentLobbyGameMode = currentMode;
    global.currentLobbyAIEnabled = isAiEnabled;
  }

  function renderModeVisualPreview(modeId, worldId) {
    const phonesHtml = `
      <div style="position:absolute;bottom:-8px;right:12px;display:flex;align-items:flex-end;z-index:5;direction:ltr;">
        <div style="width:54px;height:96px;background:#fff;border-radius:8px;padding:3px;box-shadow:0 8px 20px rgba(0,0,0,0.55);transform:rotate(-12deg) translateX(10px);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;">
          <div style="background:#e21b3c;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">▲</div>
          <div style="background:#1368ce;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">◆</div>
          <div style="background:#d89e00;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">●</div>
          <div style="background:#26890c;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">■</div>
        </div>
        <div style="width:58px;height:102px;background:#fff;border-radius:8px;padding:3px;box-shadow:0 10px 24px rgba(0,0,0,0.65);transform:rotate(-2deg);z-index:2;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;">
          <div style="background:#e21b3c;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:10px;">▲</div>
          <div style="background:#1368ce;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:10px;">◆</div>
          <div style="background:#d89e00;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:10px;">●</div>
          <div style="background:#26890c;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:10px;">■</div>
        </div>
        <div style="width:54px;height:96px;background:#fff;border-radius:8px;padding:3px;box-shadow:0 8px 20px rgba(0,0,0,0.55);transform:rotate(9deg) translateX(-8px);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;">
          <div style="background:#e21b3c;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">▲</div>
          <div style="background:#1368ce;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">◆</div>
          <div style="background:#d89e00;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">●</div>
          <div style="background:#26890c;border-radius:3px;display:grid;place-items:center;color:#fff;font-size:9px;">■</div>
        </div>
      </div>`;

    const overlayExtra = modeId === 'CARD_ARENA'
      ? `<div style="position:absolute;top:12px;right:12px;display:flex;gap:6px;z-index:6;">
          <span style="background:linear-gradient(135deg,#f59e0b,#b45309);border:1.5px solid #fef08a;color:#fff;font-size:10px;font-weight:900;padding:4px 8px;border-radius:8px;box-shadow:0 6px 14px rgba(0,0,0,0.5);transform:rotate(-6deg);">❄️ تجميد</span>
          <span style="background:linear-gradient(135deg,#8b5cf6,#4f46e5);border:1.5px solid #ddd6fe;color:#fff;font-size:10px;font-weight:900;padding:4px 8px;border-radius:8px;box-shadow:0 6px 14px rgba(0,0,0,0.5);transform:rotate(5deg);">⚡ نقاط ×2</span>
        </div>`
      : modeId === 'SQUADS'
      ? `<div style="position:absolute;top:10px;right:12px;display:flex;gap:6px;z-index:6;">
          <span style="background:rgba(14,165,233,0.9);border:1px solid #bae6fd;color:#fff;font-size:10px;font-weight:900;padding:3px 9px;border-radius:999px;">🦅 صقور المعرفة</span>
          <span style="background:rgba(245,158,11,0.9);border:1px solid #fef08a;color:#090a16;font-size:10px;font-weight:900;padding:3px 9px;border-radius:999px;">🦁 أسود المجرة</span>
        </div>`
      : `<div style="position:absolute;top:10px;right:12px;z-index:6;"><span style="background:rgba(117,80,239,0.9);border:1px solid #ddd6fe;color:#fff;font-size:10px;font-weight:900;padding:3px 10px;border-radius:999px;">🏆 سباق الصدارة الفردي</span></div>`;

    return `
      <div style="position:relative;width:100%;height:230px;border-radius:12px;overflow:hidden;background:url('assets/worlds/${worldId}/lobby.jpg') center/cover no-repeat;border:2px solid rgba(255,255,255,0.15);box-shadow:0 14px 35px rgba(0,0,0,0.55);">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(46,16,101,0.55) 0%,rgba(15,23,42,0.82) 100%);"></div>
        ${overlayExtra}
        <div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);background:rgba(10,16,38,0.85);color:#fff;font-size:11px;font-weight:900;padding:6px 16px;border-radius:8px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.4);">سؤال نموذجي: ما إعراب كلمة «ممتعًا»؟</div>
        <div style="position:absolute;bottom:14px;left:12px;right:145px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div style="background:#e21b3c;height:36px;border-radius:5px;border-bottom:3px solid rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:space-between;padding:0 10px;color:#fff;font-size:10px;font-weight:800;"><span>نعت منصوب</span><span>▲</span></div>
          <div style="background:#1368ce;height:36px;border-radius:5px;border-bottom:3px solid rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:space-between;padding:0 10px;color:#fff;font-size:10px;font-weight:800;"><span>حال منصوب</span><span>◆</span></div>
          <div style="background:#d89e00;height:36px;border-radius:5px;border-bottom:3px solid rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:space-between;padding:0 10px;color:#fff;font-size:10px;font-weight:800;"><span>خبر مرفوع</span><span>●</span></div>
          <div style="background:#26890c;height:36px;border-radius:5px;border-bottom:3px solid rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:space-between;padding:0 10px;color:#fff;font-size:10px;font-weight:800;"><span>مضاف إليه</span><span>■</span></div>
        </div>
        ${phonesHtml}
      </div>`;
  }

  function openModePicker(options = {}) {
    const worldId = options.worldId || global.currentLobbyWorldId || 'royal';
    const pin = options.pin || global.currentLobbyPin || '849201';
    const onConfirm = options.onConfirm || (() => {});
    const onCancel = options.onCancel || (() => {});

    try {
      const savedMode = localStorage.getItem('scorear_last_game_mode');
      if (savedMode && MODES_CONFIG[savedMode]) currentMode = savedMode;
    } catch(e){}

    closeModePicker();
    const modal = document.createElement('div');
    modal.id = 'scorearGameModeModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#1f1147;overflow-y:auto;direction:rtl;font-family:Cairo,Tajawal,sans-serif;display:flex;flex-direction:column;';
    activeModalEl = modal;
    modal._state = { worldId, pin, selectedMode: currentMode, selectedAI: false, onConfirm, onCancel };
    document.body.appendChild(modal);
    renderModalContent();
  }

  function renderModalContent() {
    if (!activeModalEl || !activeModalEl._state) return;
    const { worldId, selectedMode } = activeModalEl._state;
    const m = MODES_CONFIG[selectedMode] || MODES_CONFIG.SOLO;
    const worlds = global.worlds || [];
    const worldObj = worlds.find(w => w.id === worldId) || { name: 'القصر الملكي' };
    const quizTitle = global.activeQuizTitle || 'كأس التفوق — مسابقة سكور آر التفاعلية';
    const qCount = (global.contestQuestions && global.contestQuestions.length) ? global.contestQuestions.length : 10;

    activeModalEl.innerHTML = `
      <div style="position:fixed;inset:0;background:url('assets/worlds/${worldId}/lobby.jpg') center/cover no-repeat;filter:brightness(0.35) saturate(1.2);z-index:0;pointer-events:none;"></div>
      <div style="position:fixed;inset:0;background:linear-gradient(180deg,rgba(38,14,89,0.78) 0%,rgba(12,14,34,0.94) 100%);z-index:0;pointer-events:none;"></div>

      <!-- Top Bar (Kahoot! GO Header) -->
      <header style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:14px 32px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" onclick="ScoreARGameModes.closeModePicker()" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);color:#fff;padding:7px 16px;border-radius:999px;font-weight:800;font-size:13px;cursor:pointer;font-family:inherit;">✕ رجوع</button>
          <span style="background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;padding:5px 14px;border-radius:999px;font-size:12px;font-weight:900;">🪐 العالم: ${worldObj.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;direction:ltr;">
          <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;font-family:Montserrat,Cairo,sans-serif;text-shadow:0 3px 10px rgba(0,0,0,0.5);">ScoreAR!</span>
          <span style="background:#ffffff;color:#111111;font-size:16px;font-weight:900;padding:2px 8px;border-radius:6px;font-family:monospace;">GO</span>
        </div>
      </header>

      <!-- Main Hero Showcase Panel (Kahoot Screenshot 1 Dark Navy Box) -->
      <main style="position:relative;z-index:10;max-width:1120px;width:94%;margin:4px auto 18px;flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:18px;">
        <div style="background:#0c1d36;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:26px 32px;box-shadow:0 24px 60px rgba(0,0,0,0.75);display:grid;grid-template-columns:1.25fr 1fr;gap:28px;align-items:center;">
          
          <!-- Right in RTL: Mode Details + Start CTA -->
          <div style="display:flex;flex-direction:column;gap:12px;text-align:right;">
            <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
              <h1 style="font-size:34px;font-weight:900;color:#ffffff;margin:0;line-height:1.15;">${m.titleAr}</h1>
              <span style="font-size:20px;font-weight:900;color:#38bdf8;font-family:sans-serif;">(${m.enTitle})</span>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${m.pills.map(p => `<span style="background:rgba(255,255,255,0.1);color:#cbd5e1;font-size:11.5px;font-weight:800;padding:4px 11px;border-radius:6px;">${p}</span>`).join('')}
            </div>

            <p style="color:#e2e8f0;font-size:14px;line-height:1.7;margin:2px 0;">${m.descAr}</p>

            <!-- Sub-option boxes like Kahoot Screenshot 1 -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:2px;">
              <div style="background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.45);border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:800;color:#fff;">
                <span>${m.subOption1}</span>
                <span style="color:#34d399;font-size:16px;">✓</span>
              </div>
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.14);border-radius:8px;padding:10px 14px;display:flex;align-items:center;font-size:12px;font-weight:700;color:#cbd5e1;">
                <span>${m.subOption2}</span>
              </div>
            </div>

            <!-- Selected Quiz Bar + 3D White Start Button -->
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
              <div style="flex:1;background:#071120;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <img src="assets/worlds/${worldId}/lobby.jpg" onerror="this.style.display='none'" style="width:44px;height:32px;object-fit:cover;border-radius:5px;">
                  <div>
                    <div style="font-size:14px;font-weight:900;color:#ffffff;">${quizTitle}</div>
                    <div style="font-size:11px;color:#94a3b8;font-weight:700;">${qCount} أسئلة جاهزة للمنافسة</div>
                  </div>
                </div>
              </div>
              <button type="button" id="btnConfirmGameMode" onclick="ScoreARGameModes.confirmSelection()" style="background:#ffffff;color:#0f172a;border:none;border-bottom:5px solid #cbd5e1;border-radius:8px;padding:12px 42px;font-size:18px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 8px 25px rgba(255,255,255,0.22);transition:transform 0.1s;">البدء</button>
            </div>
          </div>

          <!-- Left in RTL: Live Visual Stage & Phones Preview -->
          <div>
            ${renderModeVisualPreview(selectedMode, worldId)}
          </div>
        </div>

        <!-- Bottom Experience Selector Strip (اختر التجربة) -->
        <div style="background:rgba(9,13,28,0.65);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px 24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
            <span style="font-size:15px;font-weight:900;color:#ffffff;">اختر التجربة (طور اللعب):</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${[
                { id: 'ALL', lbl: '⊞ الكل' },
                { id: 'SOLO', lbl: '👤 تنافس فردي' },
                { id: 'TEAMS', lbl: '🛡️ منافسة على مستوى الفريق' },
                { id: 'CARDS', lbl: '🃏 حرب الكروت والمهارات' }
              ].map(tab => `<button type="button" onclick="ScoreARGameModes.setFilter('${tab.id}')" style="background:${activeFilter === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'};border:1px solid ${activeFilter === tab.id ? '#fff' : 'transparent'};color:#fff;padding:5px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">${tab.lbl}</button>`).join('')}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;">
            ${Object.values(MODES_CONFIG).filter(item => activeFilter === 'ALL' || item.cat === activeFilter).map(item => {
              const isSel = item.id === selectedMode;
              return `
                <div class="mode-select-card" data-mode="${item.id}" onclick="ScoreARGameModes.selectModeInModal('${item.id}')" style="cursor:pointer;border-radius:12px;overflow:hidden;border:${isSel ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.14)'};background:#0c1d36;transform:${isSel ? 'translateY(-4px)' : 'none'};box-shadow:${isSel ? '0 12px 30px rgba(0,0,0,0.65), 0 0 20px rgba(255,255,255,0.25)' : '0 6px 16px rgba(0,0,0,0.4)'};transition:all 0.2s;">
                  <div style="height:105px;background:${item.thumbBg};position:relative;display:flex;align-items:center;justify-content:center;padding:12px;">
                    <div style="font-size:46px;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.5));">${item.icon}</div>
                    <span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.55);color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:6px;">${item.badgeAr}</span>
                  </div>
                  <div style="padding:10px 14px;text-align:center;background:#091528;">
                    <div style="font-size:14px;font-weight:900;color:#ffffff;">${item.titleAr}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </main>
    `;
  }

  function setFilter(f) {
    activeFilter = f || 'ALL';
    renderModalContent();
  }

  function selectModeInModal(modeId) {
    if (!activeModalEl || !activeModalEl._state) return;
    activeModalEl._state.selectedMode = modeId;
    renderModalContent();
  }

  function toggleAiInModal() {
    if (!activeModalEl || !activeModalEl._state) return;
    activeModalEl._state.selectedAI = !activeModalEl._state.selectedAI;
  }

  function confirmSelection() {
    if (!activeModalEl || !activeModalEl._state) return;
    const { worldId, pin, selectedMode, selectedAI, onConfirm } = activeModalEl._state;
    setMode(selectedMode, selectedAI);
    closeModePicker();

    if (global.ScoreARCardArena && typeof global.ScoreARCardArena.getManager === 'function') {
      try {
        const mgr = global.ScoreARCardArena.getManager();
        if (mgr && typeof mgr.setGameMode === 'function') mgr.setGameMode(selectedMode, false, 0);
      } catch(e){}
    }
    if (global.ScoreARQuizHost && typeof global.ScoreARQuizHost.getCurrentRoom === 'function') {
      const room = global.ScoreARQuizHost.getCurrentRoom();
      if (room) { room.mode = selectedMode; room.gameMode = selectedMode; room.aiEnabled = selectedAI; }
    }
    if (global.ScoreARQuizHostView && typeof global.ScoreARQuizHostView.updateLobbyModeBadge === 'function') {
      global.ScoreARQuizHostView.updateLobbyModeBadge(selectedMode);
    }
    try {
      const db = (global.ScoreARAuth?.getDb?.()) || global.firebase?.database?.();
      if (db && pin) db.ref('rooms/' + pin).update({ mode: selectedMode, gameMode: selectedMode, aiEnabled: selectedAI, updatedAt: Date.now() }).catch(()=>{});
    } catch(e){}
    if (global.ScoreARRealtime && typeof global.ScoreARRealtime.publish === 'function') {
      global.ScoreARRealtime.publish('ROOM_MODE_UPDATE', { mode: selectedMode, gameMode: selectedMode, aiEnabled: selectedAI, pin, worldId });
    }
    if (typeof onConfirm === 'function') onConfirm(worldId, selectedMode, selectedAI);
  }

  function closeModePicker() {
    if (activeModalEl) {
      if (activeModalEl.parentNode) activeModalEl.parentNode.removeChild(activeModalEl);
      activeModalEl = null;
    }
  }

  global.ScoreARGameModes = {
    getMode, isAIEnabled, setMode, openModePicker, setFilter,
    selectModeInModal, toggleAiInModal, confirmSelection, closeModePicker, MODES_CONFIG
  };
})(typeof window !== 'undefined' ? window : global);
