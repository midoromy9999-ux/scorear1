/**
 * ScoreAR Game Modes Controller — Kahoot! Go Full-Screen Pre-Lobby Launchpad
 * Features 3 Custom 3D Cartoon Mode Illustrations + Speed & Streak rules for Solo & Teams.
 * Strictly Rule 7 Compliant (<280 lines).
 */
(function(global) {
  'use strict';

  let currentMode = 'SOLO';
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
      badgeAr: 'كلاسيكي ⚡',
      artUrl: 'assets/modes/mode_solo.jpg',
      pills: ['حتى 60 مشارك', 'قانون السرعة ⚡', 'مكافأة الـ Streak 🔥'],
      subOption1: '📱 جهاز واحد لكل طالب مشارك',
      subOption2: '⚡🔥 نقاط على الصحة + مكافأة السرعة والـ Streak المتتالي',
      descAr: 'كل طالب ينافس بشخصيته الكرتونية بشكل مستقل لحصد أعلى النقاط عبر دقة الإجابة، قانون السرعة، وسلسلة الإجابات المتتالية (Streak 🔥) للوصول إلى قمة المنصة.',
      accentColor: '#8e64ef'
    },
    SQUADS: {
      id: 'SQUADS',
      cat: 'TEAMS',
      icon: '🛡️',
      enTitle: 'Teams',
      titleAr: 'طور الفرق والمجموعات',
      badgeAr: 'Teams 🔥',
      artUrl: 'assets/modes/mode_squads.jpg',
      pills: ['منافسة الفرق', 'قانون السرعة ⚡', 'مكافأة الـ Streak 🔥'],
      subOption1: '🛡️ توزيع في فرق (صقور المعرفة 🦅 × أسود المجرة 🦁)',
      subOption2: '⚡🔥 قانون السرعة والـ Streak مفعّل لكل طالب ويُجمع للفريق!',
      descAr: 'يتنافس الطلاب في فرق متعاونة داخل الفصل مع تطبيق قانون السرعة ومكافأة الإجابات المتتالية (Streak 🔥) لكل طالب، وتُجمع نقاط السرعة والـ Streak في رصيد الفريق!',
      accentColor: '#38bdf8'
    },
    CARD_ARENA: {
      id: 'CARD_ARENA',
      cat: 'CARDS',
      icon: '🃏',
      enTitle: 'Card Arena',
      titleAr: 'طور حرب الكروت والمهارات',
      badgeAr: 'حصري 🃏',
      artUrl: 'assets/modes/mode_cards.jpg',
      pills: ['20 كارت تكتيكي', 'قانون السرعة والـ Streak 🔥', 'تفاعل خارق'],
      subOption1: '🃏 كروت هجوم ودفاع (تجميد ❄️، درع 🛡️، مضاعفة النقاط ×2)',
      subOption2: '🎯 أسرع إجابتين في كل سؤال تحصلان على كارت مهارة فوري',
      descAr: 'الطور الحصري لسكور آر! الإجابات الصحيحة السريعة تمنح الطلاب نقاط السرعة والـ Streak بالإضافة إلى كروت مهارات فورية على هواتفهم لقلب موازين المنافسة.',
      accentColor: '#f59e0b'
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

  function renderModeVisualPreview(m) {
    return `
      <div style="position:relative;width:100%;height:245px;border-radius:14px;overflow:hidden;border:2px solid rgba(255,255,255,0.22);box-shadow:0 16px 40px rgba(0,0,0,0.65);background:#091326;">
        <img src="${m.artUrl}" alt="${m.titleAr}" style="width:100%;height:100%;object-fit:cover;display:block;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(9,19,38,0.1) 0%,rgba(9,19,38,0.45) 65%,rgba(9,19,38,0.88) 100%);"></div>
        <div style="position:absolute;top:10px;right:12px;display:flex;gap:6px;z-index:5;">
          <span style="background:rgba(15,23,42,0.85);border:1px solid ${m.accentColor};color:#fff;font-size:11px;font-weight:900;padding:4px 12px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">${m.icon} ${m.titleAr}</span>
          <span style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#090a16;font-size:10.5px;font-weight:900;padding:4px 10px;border-radius:999px;">⚡ السرعة + 🔥 Streak</span>
        </div>
        <!-- 3 Fanned Kahoot-Style Mobile Phones Overlay -->
        <div style="position:absolute;bottom:-6px;left:14px;display:flex;align-items:flex-end;z-index:6;direction:ltr;">
          <div style="width:46px;height:82px;background:#fff;border-radius:7px;padding:3px;box-shadow:0 8px 18px rgba(0,0,0,0.6);transform:rotate(-12deg) translateX(8px);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;">
            <div style="background:#e21b3c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">▲</div>
            <div style="background:#1368ce;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">◆</div>
            <div style="background:#d89e00;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">●</div>
            <div style="background:#26890c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">■</div>
          </div>
          <div style="width:50px;height:88px;background:#fff;border-radius:7px;padding:3px;box-shadow:0 10px 22px rgba(0,0,0,0.7);transform:rotate(-2deg);z-index:2;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;">
            <div style="background:#e21b3c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:9px;">▲</div>
            <div style="background:#1368ce;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:9px;">◆</div>
            <div style="background:#d89e00;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:9px;">●</div>
            <div style="background:#26890c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:9px;">■</div>
          </div>
          <div style="width:46px;height:82px;background:#fff;border-radius:7px;padding:3px;box-shadow:0 8px 18px rgba(0,0,0,0.6);transform:rotate(10deg) translateX(-6px);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;">
            <div style="background:#e21b3c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">▲</div>
            <div style="background:#1368ce;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">◆</div>
            <div style="background:#d89e00;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">●</div>
            <div style="background:#26890c;border-radius:2px;display:grid;place-items:center;color:#fff;font-size:8px;">■</div>
          </div>
        </div>
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

      <main style="position:relative;z-index:10;max-width:1140px;width:94%;margin:2px auto 18px;flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:16px;">
        <div class="mode-select-primary-grid" style="background:#0c1d36;border:1px solid rgba(255,255,255,0.14);border-radius:16px;padding:24px 30px;box-shadow:0 24px 60px rgba(0,0,0,0.75);display:grid;grid-template-columns:1.22fr 1fr;gap:26px;align-items:center;">
          
          <div style="display:flex;flex-direction:column;gap:11px;text-align:right;">
            <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
              <h1 style="font-size:32px;font-weight:900;color:#ffffff;margin:0;line-height:1.15;">${m.titleAr}</h1>
              <span style="font-size:18px;font-weight:900;color:#38bdf8;font-family:sans-serif;">(${m.enTitle})</span>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${m.pills.map(p => `<span style="background:rgba(255,255,255,0.12);color:#f1f5f9;font-size:11.5px;font-weight:800;padding:4px 11px;border-radius:6px;">${p}</span>`).join('')}
            </div>

            <p style="color:#e2e8f0;font-size:13.5px;line-height:1.7;margin:2px 0;">${m.descAr}</p>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:2px;">
              <div style="background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.45);border-radius:8px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:800;color:#fff;">
                <span>${m.subOption1}</span>
                <span style="color:#34d399;font-size:16px;">✓</span>
              </div>
              <div style="background:rgba(245,158,11,0.12);border:1.5px solid rgba(251,191,36,0.45);border-radius:8px;padding:10px 12px;display:flex;align-items:center;font-size:12px;font-weight:800;color:#fef08a;">
                <span>${m.subOption2}</span>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:12px;margin-top:6px;">
              <div style="flex:1;background:#071120;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <img src="${m.artUrl}" onerror="this.style.display='none'" style="width:48px;height:34px;object-fit:cover;border-radius:6px;">
                  <div>
                    <div style="font-size:14px;font-weight:900;color:#ffffff;">${quizTitle}</div>
                    <div style="font-size:11px;color:#94a3b8;font-weight:700;">${qCount} أسئلة · قانون السرعة والـ Streak مفعّل</div>
                  </div>
                </div>
              </div>
              <button type="button" id="btnConfirmGameMode" onclick="ScoreARGameModes.confirmSelection()" style="background:#ffffff;color:#0f172a;border:none;border-bottom:5px solid #cbd5e1;border-radius:8px;padding:12px 42px;font-size:18px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 8px 25px rgba(255,255,255,0.22);">البدء</button>
            </div>
          </div>

          <div>
            ${renderModeVisualPreview(m)}
          </div>
        </div>

        <!-- Bottom Experience Selector Strip with 3D Cartoon Thumbnails -->
        <div style="background:rgba(9,13,28,0.72);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:14px 22px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
            <span style="font-size:15px;font-weight:900;color:#ffffff;">اختر التجربة (طور اللعب الكرتوني):</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${[
                { id: 'ALL', lbl: '⊞ الكل' },
                { id: 'SOLO', lbl: '👤 تنافس فردي' },
                { id: 'TEAMS', lbl: '🛡️ منافسة الفرق (Teams)' },
                { id: 'CARDS', lbl: '🃏 حرب الكروت والمهارات' }
              ].map(tab => `<button type="button" onclick="ScoreARGameModes.setFilter('${tab.id}')" style="background:${activeFilter === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'};border:1px solid ${activeFilter === tab.id ? '#fff' : 'transparent'};color:#fff;padding:5px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">${tab.lbl}</button>`).join('')}
            </div>
          </div>

          <div class="mode-select-cards-grid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:18px;">
            ${Object.values(MODES_CONFIG).filter(item => activeFilter === 'ALL' || item.cat === activeFilter).map(item => {
              const isSel = item.id === selectedMode;
              return `
                <div class="mode-select-card" data-mode="${item.id}" onclick="ScoreARGameModes.selectModeInModal('${item.id}')" style="cursor:pointer;border-radius:14px;overflow:hidden;border:${isSel ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.15)'};background:#0c1d36;transform:${isSel ? 'translateY(-4px)' : 'none'};box-shadow:${isSel ? '0 14px 32px rgba(0,0,0,0.7), 0 0 22px rgba(255,255,255,0.28)' : '0 6px 16px rgba(0,0,0,0.45)'};transition:all 0.2s;">
                  <div style="height:122px;position:relative;overflow:hidden;">
                    <img src="${item.artUrl}" alt="${item.titleAr}" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.3s;">
                    <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(9,21,40,0.85) 100%);"></div>
                    <span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.72);border:1px solid rgba(255,255,255,0.25);color:#fef08a;font-size:10.5px;font-weight:900;padding:3px 9px;border-radius:6px;">${item.badgeAr}</span>
                  </div>
                  <div style="padding:10px 14px;text-align:center;background:#091528;">
                    <div style="font-size:14.5px;font-weight:900;color:#ffffff;">${item.titleAr}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </main>
    `;
  }

  function setFilter(f) { activeFilter = f || 'ALL'; renderModalContent(); }
  function selectModeInModal(modeId) { if (!activeModalEl || !activeModalEl._state) return; activeModalEl._state.selectedMode = modeId; renderModalContent(); }
  function toggleAiInModal() { if (!activeModalEl || !activeModalEl._state) return; activeModalEl._state.selectedAI = !activeModalEl._state.selectedAI; }

  function confirmSelection() {
    if (!activeModalEl || !activeModalEl._state) return;
    const { worldId, pin, selectedMode, selectedAI, onConfirm } = activeModalEl._state;
    setMode(selectedMode, selectedAI);
    closeModePicker();
    if (global.ScoreARCardArena?.getManager) {
      try { const mgr = global.ScoreARCardArena.getManager(); if (mgr?.setGameMode) mgr.setGameMode(selectedMode, false, 0); } catch(e){}
    }
    if (global.ScoreARQuizHost?.getCurrentRoom) {
      const room = global.ScoreARQuizHost.getCurrentRoom();
      if (room) { room.mode = selectedMode; room.gameMode = selectedMode; room.aiEnabled = selectedAI; }
    }
    if (global.ScoreARQuizHostView?.updateLobbyModeBadge) global.ScoreARQuizHostView.updateLobbyModeBadge(selectedMode);
    try {
      const db = (global.ScoreARAuth?.getDb?.()) || global.firebase?.database?.();
      if (db && pin) db.ref('rooms/' + pin).update({ mode: selectedMode, gameMode: selectedMode, aiEnabled: selectedAI, updatedAt: Date.now() }).catch(()=>{});
    } catch(e){}
    if (global.ScoreARRealtime?.publish) {
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
