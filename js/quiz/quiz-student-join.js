/**
 * ScoreAR Student 3-Step Join Flow (quiz-student-join.js)
 * Step 1: 6-digit PIN with large touch keypad & room openness validation.
 * Step 2: Student Nickname + 20-Character Picker with live preview & entry into lobby.
 * Strictly Rule 7 compliant (<500 lines).
 */
(function(global) {
  'use strict';

  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function uiIcon(name, size = 15) {
    return (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function')
      ? global.ScoreARUI.icon(name, { size })
      : '';
  }

  const NAME_REGEX = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0660-\u0669\u06F0-\u06F9\s\-\.\/]{1,40}$/;

  let state = {
    step: 1,
    pin: '',
    name: '',
    avatarId: 'char_01',
    teamId: 'team_a',
    teamNames: { team_a: 'فريق الصقور', team_b: 'فريق الأسود' },
    roomMode: 'SOLO',
    isRegistered: false,
    error: null,
    loading: false,
    existingPlayers: []
  };

  let containerEl = null;

  function init(container, initialPin = '') {
    containerEl = container;
    global.__scorearAmEliminated = false;
    const cleanPin = String(initialPin || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();
    const isFullQrPin = /^\d{6}$/.test(cleanPin);
    state = { step: isFullQrPin ? 2 : 1, fromQr: isFullQrPin, pin: /^\d{1,6}$/.test(cleanPin) ? cleanPin : '', name: '', avatarId: 'char_01', teamId: 'team_a', teamNames: { team_a: 'فريق الصقور', team_b: 'فريق الأسود' }, roomMode: 'SOLO', isRegistered: false, error: null, loading: false, existingPlayers: [] };
    if (isFullQrPin) {
      verifyRoomOpen(cleanPin).then(rc => {
        if (rc && rc.players) state.existingPlayers = rc.players;
        if (rc && rc.teamNames) state.teamNames = rc.teamNames;
        if (rc && rc.mode) {
          state.roomMode = rc.mode;
          syncStep2TeamPickerUi();
        }
      }).catch(() => {});
    }

    try {
      const a = (global.ScoreARAuth && global.ScoreARAuth.getAuth) ? global.ScoreARAuth.getAuth() : (global.firebase && global.firebase.auth ? global.firebase.auth() : null);
      if (a && !a.currentUser) a.signInAnonymously().catch(() => {});
    } catch(e){}

    try {
      const user = (global.ScoreARAuth && global.ScoreARAuth.getCurrentUser) ? global.ScoreARAuth.getCurrentUser() : null;
      if (user && user.role === 'student' && !user.isAnonymous) {
        state.isRegistered = true;
        state.name = user.displayName || user.name || '';
        const prof = JSON.parse(localStorage.getItem('scorear_student_profile_v1') || '{}');
        const savedAv = user.avatarId || prof.avatarId;
        if (savedAv && /^char_\d{2}$/.test(String(savedAv))) state.avatarId = savedAv;
      } else {
        const activeQuiz = sessionStorage.getItem('scorear_active_quiz_session');
        const saved = sessionStorage.getItem('scorear_student_session');
        const parsed = activeQuiz ? JSON.parse(activeQuiz) : (saved ? JSON.parse(saved) : null);
        if (parsed && parsed.name) {
          state.name = parsed.name;
          if (parsed.avatarId) state.avatarId = parsed.avatarId;
          if (activeQuiz && parsed.pin && (Date.now() - (parsed.savedAt || 0) < 3600000)) state.savedActiveSession = parsed;
        } else {
          const prof = JSON.parse(localStorage.getItem('scorear_student_profile_v1') || '{}');
          if (prof.avatarId && /^char_\d{2}$/.test(String(prof.avatarId))) state.avatarId = prof.avatarId;
        }
      }
    } catch(e){}

    render();
  }

  function render() {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div class="student-join-flow">
        <div class="sj-steps">
          <div class="sj-step">
            <span class="sj-step-circle ${state.step>=1?'is-done':''}">1</span>
            <span class="sj-step-label ${state.step===1?'is-active':''}">رمز القاعة</span>
          </div>
          <div class="sj-step-divider ${state.step>=2?'is-done':''}"></div>
          <div class="sj-step">
            <span class="sj-step-circle ${state.step>=2?'is-done':''}">2</span>
            <span class="sj-step-label ${state.step===2?'is-active':''}">الاسم والبطل</span>
          </div>
        </div>

        ${state.error ? `
          <div id="studentStepError" class="sj-error-box">
            ${escapeHtml(state.error)}
          </div>` : ''}

        ${state.step === 1 ? renderStep1Html() : state.step === 2 ? renderStep2Html() : renderStep3Html()}
      </div>
    `;

    if (state.step === 1) {
      const pinInp = containerEl.querySelector('#studentJoinPinInput');
      if (pinInp) {
        pinInp.addEventListener('input', (e) => {
          const val = e.target.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '').slice(0, 6);
          state.pin = val;
          e.target.value = val;
          updatePinDisplay();
        });
      }
      const onKey = (e) => {
        if (state.step !== 1) return;
        if (e.target && e.target.tagName === 'INPUT' && e.target.id !== 'studentJoinPinInput') return;
        if (/^\d$/.test(e.key)) { e.preventDefault(); handleKeypad(e.key); }
        else if (e.key === 'Backspace') { e.preventDefault(); handleKeypad('⌫'); }
        else if (e.key === 'Enter') { e.preventDefault(); submitStep1(); }
      };
      if (global._scorearKeyHandler) window.removeEventListener('keydown', global._scorearKeyHandler);
      global._scorearKeyHandler = onKey;
      window.addEventListener('keydown', onKey);
    } else if (state.step === 2) {
      const nameInp = containerEl.querySelector('#studentJoinNameInput');
      if (nameInp) {
        nameInp.value = state.name;
        nameInp.focus();
        nameInp.addEventListener('input', (e) => {
          state.name = e.target.value.slice(0, 40);
        });
      }
      if (global.ScoreARHeroCosmetics?.bindCompactSelector) global.ScoreARHeroCosmetics.bindCompactSelector(containerEl);
    }
  }

  function updatePinDisplay() {
    const disp = containerEl ? containerEl.querySelector('#studentPinDisplay') : null;
    if (!disp) return;
    const digits = state.pin.split('');
    const boxes = disp.querySelectorAll('.pin-digit-box');
    boxes.forEach((box, i) => {
      box.textContent = digits[i] || '';
      box.classList.toggle('is-active', i === digits.length);
      box.classList.toggle('is-filled', Boolean(digits[i]));
    });
  }

  function renderStep1Html() {
    const digits = state.pin.split('');
    return `
      <div style="text-align:center;">
        <span class="launch-pill" style="margin-bottom:8px;"><span class="live-dot"></span> دخول القاعة المباشر</span>
        <h3 class="sj-heading">أدخل رمز القاعة (PIN)</h3>
        <p class="sj-sub">اكتب الرمز المكون من ٦ أرقام والظاهر على شاشة المعلم</p>
        ${state.savedActiveSession ? `
          <div class="sj-reconnect-box">
            <div style="text-align:right;">
              <div class="sj-reconnect-title">استعادة الاتصال السريع</div>
              <div class="sj-reconnect-meta">القاعة: <b>${state.savedActiveSession.pin}</b> | الطالب: <b>${escapeHtml(state.savedActiveSession.name)}</b></div>
            </div>
            <button type="button" onclick="ScoreARStudentJoin.fastReconnect()" class="btn launch-primary" style="border-radius:10px;padding:6px 12px;font-weight:900;font-size:12px;cursor:pointer;">دخول سريع</button>
          </div>` : ''}
        <div id="studentPinDisplay" class="sj-pin-display" onclick="const inp=document.getElementById('studentJoinPinInput'); if(inp) inp.focus();">
          ${[0,1,2,3,4,5].map(i => `<div class="pin-digit-box ${i===digits.length?'is-active':(digits[i]?'is-filled':'')}">${digits[i]||''}</div>`).join('')}
        </div>
        <input id="studentJoinPinInput" type="text" inputmode="numeric" maxlength="6" value="${escapeHtml(state.pin)}" style="opacity:0;position:absolute;pointer-events:none;height:0;width:0;">
        <div class="sj-keypad-grid">
          ${['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k => {
            const cls = k === 'C' ? 'is-clear' : (k === '⌫' ? 'is-back' : '');
            return `<button type="button" onclick="ScoreARStudentJoin.handleKeypad('${k}')" class="keypad-btn ${cls}">${k}</button>`;
          }).join('')}
        </div>
        <button type="button" id="studentStep1NextBtn" onclick="ScoreARStudentJoin.submitStep1()" ${state.loading?'disabled':''} class="btn launch-primary full" style="padding:13px;font-size:15px;font-weight:900;border-radius:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
          ${state.loading ? '<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></span> جارٍ التحقق من القاعة...' : `<span>دخول القاعة</span> ${uiIcon('arrow', 16)}`}
        </button>
      </div>
    `;
  }

  function renderStep2Html() {
    const list = (global.ScoreARCharacters && global.ScoreARCharacters.list) ? global.ScoreARCharacters.list : [];
    const currentHero = list.find(c => c.code === state.avatarId) || list[0] || { name: 'زياد', title: 'المستكشف' };
    return `
      <div>
        <div style="text-align:center;margin-bottom:10px;">
          <div class="launch-pill sj-pin-badge" style="margin-bottom:6px;">
            <span class="live-dot"></span>
            <span>متصل بالقاعة رقم: <b class="sj-pin-num">${escapeHtml(state.pin)}</b></span>
          </div>
          <h3 class="sj-heading" style="font-size:19px;">سجّل اسمك واختر بطلك الكرتوني</h3>
        </div>

        <div style="margin-bottom:12px;">
          <label class="sj-field-label">١. اكتب اسمك للمشاركة في القاعة:</label>
          <input id="studentJoinNameInput" class="field" type="text" maxlength="40" placeholder="مثال: أحمد محمد، أو 3/1 رقم 15..." style="width:100%;box-sizing:border-box;border-radius:12px;padding:11px 14px;font-size:14.5px;font-weight:800;" onkeydown="if(event.key==='Enter'){event.preventDefault();ScoreARStudentJoin.submitStep2();}">
        </div>

        <div style="margin-bottom:12px;">
          <label class="sj-field-label is-cyan">٢. اختر بطلك المفضل (٢٠ بطلاً):</label>
          <div class="sj-hero-preview">
            <div class="sj-hero-preview-avatar">
              <img id="studentAvatarLiveImg" src="assets/characters/animated/${escapeHtml(state.avatarId)}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="البطل" style="height:64px;object-fit:contain;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.45));">
            </div>
            <div>
              <div id="studentAvatarLiveName" class="sj-hero-preview-name">${escapeHtml(currentHero.name)}</div>
              <div id="studentAvatarLiveTitle" class="sj-hero-preview-title">${escapeHtml(currentHero.title)}</div>
            </div>
          </div>
          <div class="sj-avatar-grid">
            ${list.map((c) => {
              const isSel = (c.code === state.avatarId);
              return `<div class="avatar-card-picker ${isSel?'selected':''}" onclick="ScoreARStudentJoin.selectAvatar('${c.code}')">
                <img src="assets/characters/animated/${c.code}-idle.webp" loading="lazy" alt="${escapeHtml(c.name)}" style="width:42px;height:50px;object-fit:contain;">
                <span>${escapeHtml(c.name)}</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div id="studentJoinTeamPickerWrap">${renderJoinTeamPickerHtml()}</div>
        ${global.ScoreARHeroCosmetics?.renderCompactSelectorHtml ? global.ScoreARHeroCosmetics.renderCompactSelectorHtml() : ''}
        <div style="display:flex;gap:8px;">
          ${!state.fromQr ? `<button type="button" class="scorear-gear-btn" onclick="ScoreARStudentJoin.goToStep(1)" style="flex:1;padding:12px;border-radius:12px;font-size:12.5px;">تغيير الرمز</button>` : ''}
          <button type="button" id="studentStep2NextBtn" class="btn launch-primary" onclick="ScoreARStudentJoin.submitStep2()" ${state.loading?'disabled':''} style="flex:2;padding:12px;border-radius:12px;font-weight:900;font-size:14.5px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;">
            ${state.loading ? 'جارٍ الدخول للقاعة...' : `<span>دخول للقاعة الآن</span> ${uiIcon('arrow', 15)}`}
          </button>
        </div>
      </div>
    `;
  }

  function renderJoinTeamPickerHtml() {
    if (state.roomMode !== 'DUEL_TEAMS') return '';
    const customNames = state.teamNames || global.__scorearDuelTeamNames || { team_a: 'فريق الصقور', team_b: 'فريق الأسود' };
    const teams = [
      { id: 'team_a', emoji: '🦅', name: customNames.team_a || 'فريق الصقور', color: '#38bdf8', bg: 'linear-gradient(135deg,#0284c7,#0369a1)' },
      { id: 'team_b', emoji: '🦁', name: customNames.team_b || 'فريق الأسود', color: '#fb923c', bg: 'linear-gradient(135deg,#ea580c,#c2410c)' }
    ];
    return `
      <div style="margin-bottom:12px;">
        <label class="sj-team-label">٣. اختر فريقك في المواجهة (فريقان فقط):</label>
        <div class="sj-team-grid">
          ${teams.map(t => {
            const sel = state.teamId === t.id;
            return `<button type="button" data-team-choice="${t.id}" onclick="ScoreARStudentJoin.selectTeam('${t.id}')" class="sj-team-btn ${sel ? 'is-selected' : ''}" style="${sel ? `background:${t.bg};box-shadow:0 6px 18px ${t.color}55;` : ''}">
              <span style="font-size:20px;">${t.emoji}</span>
              <span>${escapeHtml(t.name)}</span>
              ${sel ? '<span style="font-size:12px;color:#fde047;">✓</span>' : ''}
            </button>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  function syncStep2TeamPickerUi() {
    const wrap = containerEl ? containerEl.querySelector('#studentJoinTeamPickerWrap') : null;
    if (wrap) wrap.innerHTML = renderJoinTeamPickerHtml();
  }

  function selectTeam(teamId) {
    state.teamId = teamId === 'team_b' ? 'team_b' : 'team_a';
    global.__scorearStudentTeamId = state.teamId;
    try {
      if (state.pin) sessionStorage.setItem('scorear_student_team_' + state.pin, state.teamId);
    } catch (_) {}
    syncStep2TeamPickerUi();
  }

  function renderStep3Html() {
    return renderStep2Html();
  }

  function handleKeypad(key) {
    state.error = null;
    if (key === 'C') state.pin = '';
    else if (key === '⌫' || key === 'backspace') state.pin = state.pin.slice(0, -1);
    else if (/^\d$/.test(key) && state.pin.length < 6) state.pin += key;
    updatePinDisplay();
    const pinInp = containerEl ? containerEl.querySelector('#studentJoinPinInput') : null;
    if (pinInp) pinInp.value = state.pin;
  }

  async function submitStep1() {
    state.error = null;
    const inp = containerEl ? containerEl.querySelector('#studentJoinPinInput') : null;
    const rawVal = (inp && inp.value ? inp.value : state.pin) || '';
    const cleanPin = String(rawVal).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '').trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      state.error = 'رمز القاعة (PIN) يجب أن يتكون من 6 أرقام تماماً.';
      render();
      return;
    }

    state.pin = cleanPin;
    state.loading = true;
    render();

    try {
      const roomCheck = await verifyRoomOpen(cleanPin);
      if (roomCheck.isClosed) {
        state.error = 'تم إنهاء هذه القاعة من قِبل المعلم.';
        state.loading = false;
        render();
        return;
      }
      if (!roomCheck.exists) {
        state.error = 'القاعة غير موجودة، يرجى التأكد من الرمز الظاهر على شاشة المعلم.';
        state.loading = false;
        render();
        return;
      }
      if (roomCheck.isLocked) {
        state.error = 'هذه القاعة مغلقة حالياً من قبل المعلم ولا تقبل انضمام طلاب جدد.';
        state.loading = false;
        render();
        return;
      }

      state.existingPlayers = roomCheck.players || [];
      state.loading = false;
      state.step = 2;
      render();
    } catch(err) {
      state.loading = false;
      state.error = err.message || 'تعذر التحقق من حالة القاعة، يرجى المحاولة مرة أخرى.';
      render();
    }
  }

  async function verifyRoomOpen(pin) {
    if (global.ScoreARQuizHost && typeof global.ScoreARQuizHost.getPin === 'function') {
      const hPin = global.ScoreARQuizHost.getPin();
      if (hPin === pin) {
        const locked = (typeof global.ScoreARQuizHost.isLocked === 'function') ? global.ScoreARQuizHost.isLocked() : false;
        const players = (global.ScoreARQuizHost.getPlayers ? global.ScoreARQuizHost.getPlayers() : []);
        const hostMode = (global.ScoreARGameModes?.getMode?.()) || global.currentLobbyGameMode || 'SOLO';
        const hostNames = global.ScoreARArenaModes?.getTeamNames ? global.ScoreARArenaModes.getTeamNames() : null;
        if (hostNames) {
          state.teamNames = hostNames;
          global.__scorearDuelTeamNames = hostNames;
        }
        state.roomMode = hostMode;
        global.__scorearJoinedRoomMode = hostMode;
        return { exists: true, isLocked: locked, players, mode: hostMode, teamNames: state.teamNames };
      }
    }
    try {
      const db = (global.ScoreARAuth && global.ScoreARAuth.getDb) ? global.ScoreARAuth.getDb() : (global.firebase && global.firebase.database ? global.firebase.database() : null);
      if (db) {
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('DB_TIMEOUT')), 1500));
        const [snapStatus, snapLock, snapEvents, snapMode, snapTeamNames] = await Promise.all([
          Promise.race([db.ref('rooms/' + pin + '/status').once('value'), timeout]).catch(() => null),
          Promise.race([db.ref('rooms/' + pin + '/isLocked').once('value'), timeout]).catch(() => null),
          Promise.race([db.ref('scorear_rooms/' + pin).once('value'), timeout]).catch(() => null),
          Promise.race([db.ref('rooms/' + pin + '/mode').once('value'), timeout]).catch(() => null),
          Promise.race([db.ref('rooms/' + pin + '/duelTeamNames').once('value'), timeout]).catch(() => null)
        ]);
        let resolvedMode = (snapMode && snapMode.exists()) ? String(snapMode.val() || 'SOLO') : '';
        let resolvedNames = (snapTeamNames && snapTeamNames.exists() && snapTeamNames.val()) ? snapTeamNames.val() : null;
        if (snapEvents && snapEvents.exists() && snapEvents.hasChildren()) {
          const evs = Object.values(snapEvents.val() || {}).filter(Boolean).sort((a,b) => (a._timestamp||0) - (b._timestamp||0));
          const lastModeEv = evs.slice().reverse().find(e => (e.type === 'ROOM_MODE_UPDATE' || e.type === 'ROOM_OPENED') && (e.mode || e.gameMode));
          if (!resolvedMode && lastModeEv) {
            resolvedMode = String(lastModeEv.mode || lastModeEv.gameMode);
          }
          if (!resolvedNames && lastModeEv && lastModeEv.duelTeamNames) {
            resolvedNames = lastModeEv.duelTeamNames;
          }
          if (resolvedNames) {
            state.teamNames = resolvedNames;
            global.__scorearDuelTeamNames = resolvedNames;
          }
          if (snapStatus && snapStatus.exists()) {
            const sVal = snapStatus.val();
            if (sVal === 'closed') return { exists: false, isClosed: true };
            const isLocked = snapLock && snapLock.exists() ? !!snapLock.val() : false;
            state.roomMode = resolvedMode || 'SOLO';
            global.__scorearJoinedRoomMode = state.roomMode;
            return { exists: true, isLocked, players: [], mode: state.roomMode, teamNames: state.teamNames };
          }
          const lastOpen = evs.slice().reverse().find(e => e.type === 'ROOM_OPENED');
          const lastClose = evs.slice().reverse().find(e => e.type === 'ROOM_CLOSED');
          if (lastClose && (!lastOpen || (lastClose._timestamp||0) > (lastOpen._timestamp||0))) {
            return { exists: false, isClosed: true };
          }
          const lastLock = evs.slice().reverse().find(e => e.type === 'ROOM_LOCK_STATE' || e.type === 'ROOM_LOCKED' || e.type === 'ROOM_UNLOCKED');
          const isLocked = lastLock ? (lastLock.type !== 'ROOM_UNLOCKED' && !!(lastLock.isLocked || lastLock.locked)) : false;
          state.roomMode = resolvedMode || 'SOLO';
          global.__scorearJoinedRoomMode = state.roomMode;
          return { exists: true, isLocked, players: [], mode: state.roomMode, teamNames: state.teamNames };
        }
        if (resolvedNames) {
          state.teamNames = resolvedNames;
          global.__scorearDuelTeamNames = resolvedNames;
        }
        if (snapStatus && snapStatus.exists()) {
          const sVal = snapStatus.val();
          if (sVal === 'closed') return { exists: false, isClosed: true };
          const isLocked = snapLock && snapLock.exists() ? !!snapLock.val() : false;
          state.roomMode = resolvedMode || 'SOLO';
          global.__scorearJoinedRoomMode = state.roomMode;
          return { exists: true, isLocked, players: [], mode: state.roomMode, teamNames: state.teamNames };
        }
      }
    } catch(e) {}
    return { exists: true, isLocked: false, players: [], mode: state.roomMode || 'SOLO', teamNames: state.teamNames };
  }

  function submitStep2() {
    state.error = null;
    const rawName = (state.name || '').trim();
    if (!rawName) {
      state.error = 'يرجى كتابة اسمك أو رقم فصلك للدخول.';
      render();
      return;
    }
    if (!NAME_REGEX.test(rawName)) {
      state.error = 'الاسم يمكن أن يحتوي على حروف وأرقام ومسافات وشرطات ونقاط وسلاش فقط (1 إلى 40 حرفاً).';
      render();
      return;
    }
    state.name = deduplicateName(rawName, state.existingPlayers);
    submitStep3();
  }

  function deduplicateName(name, existingList) {
    if (!existingList || !Array.isArray(existingList) || existingList.length === 0) return name;
    const base = name.replace(/\s*\(\d+\)$/, '').trim();
    let candidate = name.trim();
    let count = 2;
    const isTaken = (n) => existingList.some(p => p && p.name && p.name.trim() === n);
    if (isTaken(candidate)) {
      while (isTaken(`${base} (${count})`)) count++;
      candidate = `${base} (${count})`;
    }
    return candidate;
  }

  function selectAvatar(avatarId) {
    state.avatarId = avatarId;
    const img = containerEl ? containerEl.querySelector('#studentAvatarLiveImg') : null;
    const nameEl = containerEl ? containerEl.querySelector('#studentAvatarLiveName') : null;
    const titleEl = containerEl ? containerEl.querySelector('#studentAvatarLiveTitle') : null;

    const list = (global.ScoreARCharacters && global.ScoreARCharacters.list) ? global.ScoreARCharacters.list : [];
    const hero = list.find(c => c.code === avatarId) || { name: 'البطل', title: 'المستكشف' };

    if (img) img.src = `assets/characters/animated/${avatarId}-idle.webp`;
    if (nameEl) nameEl.textContent = hero.name;
    if (titleEl) titleEl.textContent = hero.title;

    const cards = containerEl ? containerEl.querySelectorAll('.avatar-card-picker') : [];
    cards.forEach(card => {
      const isSel = Boolean(card.getAttribute('onclick')?.includes(avatarId));
      card.classList.toggle('selected', isSel);
      card.style.borderColor = '';
      card.style.background = '';
    });
  }

  async function submitStep3() {
    state.error = null;
    state.loading = true;
    global.__scorearAmEliminated = false;
    render();

    try {
      const chosenAvatar = state.avatarId || 'char_01';
      const cosmetics = global.ScoreARHeroCosmetics?.getEquipped ? global.ScoreARHeroCosmetics.getEquipped() : null;
      const student = await global.ScoreARAuth.joinStudent(state.pin, state.name, chosenAvatar);
      student.avatarId = chosenAvatar;
      student.characterId = chosenAvatar;
      student.avatar = chosenAvatar;
      if (cosmetics) student.cosmetics = cosmetics;
      if (state.isReconnect && state.savedActiveSession && state.savedActiveSession.uid) {
        student.uid = state.savedActiveSession.uid;
        student.isReconnect = true;
      }
      if (global.closeModal) global.closeModal();
      if (global.toast) global.toast(`مرحباً بك يا ${state.name}! تم الانضمام للقاعة بنجاح`);

      if (global.ScoreARQuizStudent) {
        await global.ScoreARQuizStudent.startStudentSession(state.pin, student, chosenAvatar);
      } else if (global.renderLiveLobby) {
        global.renderLiveLobby(global.currentLobbyWorldId || 'royal', state.pin);
      }
      if (global.ScoreARRealtime && typeof global.ScoreARRealtime.publish === 'function') {
        const chosenTeam = state.teamId || 'team_a';
        global.__scorearStudentTeamId = chosenTeam;
        try { sessionStorage.setItem('scorear_student_team_' + state.pin, chosenTeam); } catch(_) {}
        global.ScoreARRealtime.publish('STUDENT_JOIN', {
          player: { id: student.uid, name: student.name, avatarId: chosenAvatar, characterId: chosenAvatar, cosmetics, teamId: chosenTeam, isRegistered: !!state.isRegistered },
          pin: state.pin
        });
      }
    } catch(err) {
      state.loading = false;
      state.error = (global.ScoreARAuth && global.ScoreARAuth.mapAuthError) ? global.ScoreARAuth.mapAuthError(err) : err.message;
      render();
    }
  }

  function goToStep(stepNum) {
    state.error = null;
    state.step = stepNum;
    render();
  }

  function fastReconnect() {
    if (state.savedActiveSession) {
      state.isReconnect = true;
      state.pin = state.savedActiveSession.pin;
      state.name = state.savedActiveSession.name;
      state.avatarId = state.savedActiveSession.avatarId || 'char_01';
      try {
        const savedTeam = sessionStorage.getItem('scorear_student_team_' + state.pin);
        if (savedTeam) state.teamId = savedTeam;
      } catch(_) {}
      submitStep3();
    }
  }

  function openJoinModal(initialPin = '') {
    if (typeof global.openModal === 'function') {
      global.openModal('انضم إلى قاعة المنافسة', '<div id="scorearStudentJoinMount" style="padding:4px 0;"></div>');
      const mount = document.getElementById('scorearStudentJoinMount');
      if (mount) init(mount, initialPin);
    }
  }

  const ScoreARStudentJoin = {
    init,
    openJoinModal,
    goToStep,
    handleKeypad,
    submitStep1,
    submitStep2,
    submitStep3,
    selectAvatar,
    selectTeam,
    deduplicateName,
    fastReconnect
  };

  global.ScoreARStudentJoin = ScoreARStudentJoin;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARStudentJoin = ScoreARStudentJoin; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARStudentJoin;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
