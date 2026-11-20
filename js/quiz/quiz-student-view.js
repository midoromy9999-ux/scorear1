/**
 * ScoreAR Quiz Student View Module
 * Renders Student UI: Reading, Question Answering, Result Feedback, Podium, Room Closed.
 * 100% Original Mobile Question/Option Design Preserved + Cosmic Glass Leaderboard & Podium Cards.
 * Strictly Rule 7 Compliant (<350 lines).
 */
(function(global) {
  'use strict';

  const OPTION_THEMES = [
    { bg: '#e21b3c', border: '#ff5c77', shape: '▲' },
    { bg: '#1368ce', border: '#4f9fff', shape: '◆' },
    { bg: '#d89e00', border: '#ffd24d', shape: '●' },
    { bg: '#26890c', border: '#5cdb3b', shape: '■' }
  ];

  function escapeHtml(str) {
    return typeof str !== 'string' ? String(str || '') : str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function safeImageUrl(value) {
    try { const u = new URL(value, document.baseURI); return ['https:', 'http:'].includes(u.protocol) ? escapeHtml(u.href) : ''; } catch { return ''; }
  }

  function uiIcon(name, size = 15) {
    return (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function')
      ? global.ScoreARUI.icon(name, { size })
      : '';
  }

  function renderHeroActionDock(includeCelebrate = false) {
    const actions = [
      { e: '🦘', lbl: 'قفزة نصر', clr: '#38bdf8' },
      { e: '👋', lbl: 'تلويح', clr: '#c084fc' },
      { e: '🔥', lbl: 'حماس', clr: '#f97316' },
      { e: '👏', lbl: 'تصفيق', clr: '#34d399' }
    ];
    if (includeCelebrate) actions.push({ e: '🎉', lbl: 'احتفال', clr: '#fbbf24' });
    return `
      <style id="studentHeroMoveCss">
        @keyframes stHeroBounce{0%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-24px) scale(1.12)}75%{transform:translateY(4px) scale(1.06,0.92)}}
        @keyframes stHeroWave{0%,100%{transform:rotate(0)}30%{transform:rotate(-12deg) scale(1.06)}65%{transform:rotate(12deg) scale(1.06)}}
        .st-hero-dock-btn{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);color:#fff;border-radius:999px;padding:5px 11px;font-size:11.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-family:inherit;transition:transform 0.14s ease,border-color 0.2s ease;}
        .st-hero-dock-btn:active{transform:scale(0.92);}
      </style>
      <div class="student-hero-action-dock" style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:2px auto;background:rgba(16,18,40,0.82);backdrop-filter:blur(12px);padding:7px 10px;border-radius:16px;border:1px solid rgba(172,139,242,0.28);max-width:350px;width:100%;box-sizing:border-box;">
        ${actions.map(a => `<button type="button" class="st-hero-dock-btn" data-hero-action="${a.e}" onclick="ScoreARQuizStudentView.triggerHeroAction(this, '${a.e}')" style="border-color:${a.clr}55;"><span>${a.e}</span><span>${a.lbl}</span></button>`).join('')}
      </div>`;
  }

  const STUDENT_WORLD_ACCENTS = {
    royal: { border: '#fbbf24', bg: 'rgba(10,22,48,0.92)', accent: '#fbbf24' },
    oasis: { border: '#34d399', bg: 'rgba(7,34,25,0.92)', accent: '#34d399' },
    cosmic: { border: '#22d3ee', bg: 'rgba(9,19,38,0.92)', accent: '#22d3ee' },
    treasure: { border: '#f59e0b', bg: 'rgba(34,19,8,0.92)', accent: '#fbbf24' },
    stadium: { border: '#38bdf8', bg: 'rgba(9,24,54,0.92)', accent: '#38bdf8' },
    magic: { border: '#c084fc', bg: 'rgba(26,11,54,0.92)', accent: '#c084fc' }
  };

  function mountStudentV3Hero(elId, avatarId, moveName, w, h, loopFlag = false) {
    if (typeof document === 'undefined' || !global.ScoreARMotionV3?.mount) return;
    const el = document.getElementById(elId);
    if (!el) return;
    global.ScoreARMotionV3.mount(el, avatarId || 'char_01', moveName || 'idle', { width: w, height: h, loop: loopFlag });
  }

  function triggerHeroAction(btnEl, emoji) {
    if (global.ScoreARQuizStudent?.sendReaction) global.ScoreARQuizStudent.sendReaction(emoji);
    const v3Map = { '🦘': 'jump', '👋': 'wave', '🔥': 'runRight', '👏': 'clap', '🎉': 'win' };
    const slot = typeof document !== 'undefined' ? document.getElementById('studentHeroAvatarV3') : null;
    const inst = slot && global.ScoreARMotionV3?.getInstance ? global.ScoreARMotionV3.getInstance(slot) : null;
    if (inst && typeof inst.setAction === 'function') {
      inst.setAction(v3Map[emoji] || 'win', { loop: false });
    }
    const img = typeof document !== 'undefined' ? document.getElementById('studentHeroAvatarImg') : null;
    if (img) {
      img.style.animation = 'none';
      void img.offsetWidth;
      img.style.animation = (emoji === '👋') ? 'stHeroWave 0.62s ease-in-out' : 'stHeroBounce 0.62s cubic-bezier(0.22,1,0.36,1)';
      img.style.filter = (emoji === '🔥') ? 'drop-shadow(0 0 18px #f97316)' : 'drop-shadow(0 8px 18px rgba(56,189,248,0.65))';
      clearTimeout(img._stTimer);
      img._stTimer = setTimeout(() => { img.style.animation = ''; img.style.filter = 'drop-shadow(0 6px 14px rgba(0,0,0,0.55))'; }, 680);
    }
    if (btnEl?.style) {
      btnEl.style.transform = 'scale(1.1)';
      setTimeout(() => { btnEl.style.transform = ''; }, 180);
    }
  }

  function renderStudentReading(stage, qData, currentWorldId, timeRemaining) {
    if (isMeEliminated(qData, getSessionStudentObj())) {
      renderStudentSpectatorHtml(stage, qData, getSessionStudentObj(), currentWorldId);
      return;
    }
    const wid = String(currentWorldId || 'royal').trim() || 'royal';
    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${wid}/question.jpg') center/cover no-repeat;filter:brightness(0.84) saturate(1.08);z-index:1;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 25%, rgba(20,22,52,0.22) 0%, rgba(10,11,22,0.58) 100%);z-index:2;"></div>
      <header class="scorear-control-bar" style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;gap:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="background:#28244d;color:#52d9ed;padding:3px 10px;border-radius:8px;font-size:11px;font-weight:900;">${escapeHtml(qData.skill || 'سؤال')}</span>
          <span style="color:#ffffff;font-size:12px;font-weight:800;">السؤال ${(qData.qIndex || 0) + 1} من ${qData.totalQuestions || 5}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" style="padding:4px 9px;font-size:11px;">${uiIcon('volume', 13)} <span>الصوت</span></button>
          <div style="background:rgba(245,158,11,0.22);border:1px solid rgba(245,158,11,0.5);color:#fcd34d;font-size:13px;font-weight:900;padding:3px 12px;border-radius:999px;">
            قراءة: <span id="studentReadingCountdown">${timeRemaining}</span>s
          </div>
        </div>
      </header>
      <main style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px 16px;gap:18px;text-align:center;">
        <div style="background:rgba(18,20,44,0.92);backdrop-filter:blur(18px);border:1px solid rgba(172,139,242,0.35);border-radius:20px;padding:24px 18px;width:100%;max-width:360px;box-shadow:0 12px 34px rgba(0,0,0,0.55);">
          <div style="font-size:12px;font-weight:800;color:#58dce3;margin-bottom:8px;">اقرأ السؤال وافهم المطلوب بتركيز:</div>
          <h2 style="font-size:20px;font-weight:900;color:#ffffff;line-height:1.5;margin:0;">${escapeHtml(qData.q || '')}</h2>
        </div>
        <div style="background:rgba(15,16,33,0.85);border:1px dashed rgba(172,139,242,0.45);border-radius:16px;padding:16px 20px;width:100%;max-width:360px;text-align:center;">
          <div style="font-size:14px;font-weight:800;color:#ddd8ff;">الخيارات ستفتح تلقائياً فور انتهاء ثواني القراءة...</div>
          <div style="font-size:11px;color:#a89bff;margin-top:4px;">استعد لاختيار الإجابة الصحيحة بأسرع وقت!</div>
        </div>
      </main>`;
  }

  function renderStudentQuestion(stage, qData, currentWorldId, timeRemaining) {
    if (isMeEliminated(qData, getSessionStudentObj())) {
      renderStudentSpectatorHtml(stage, qData, getSessionStudentObj(), currentWorldId);
      return;
    }
    const opts = qData.opts || ['الخيار 1', 'الخيار 2', 'الخيار 3', 'الخيار 4'];
    const wid = String(currentWorldId || 'royal').trim() || 'royal';
    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${wid}/question.jpg') center/cover no-repeat;filter:brightness(0.84) saturate(1.08);z-index:1;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 20%, rgba(20,22,52,0.2) 0%, rgba(10,11,22,0.56) 100%);z-index:2;"></div>
      <header class="scorear-control-bar" style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;gap:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="background:#28244d;color:#52d9ed;padding:3px 10px;border-radius:8px;font-size:11px;font-weight:900;">${escapeHtml(qData.skill || 'سؤال')}</span>
          <span style="color:#ffffff;font-size:12px;font-weight:800;">السؤال ${(qData.qIndex || 0) + 1} من ${qData.totalQuestions || 5}</span>
          ${(qData.isDouble || qData.multiplier === 2) ? `<span style="background:linear-gradient(135deg, #f59e0b, #d97706);color:#fff;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:900;">⚡ نقاط ×2</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARAudio?.toggleMute?.()" style="padding:4px 9px;font-size:11px;">${uiIcon('volume', 13)} <span>الصوت</span></button>
          <div id="studentTimerPill" style="background:#ef4444;color:#fff;font-size:14px;font-weight:900;padding:3px 12px;border-radius:12px;">
            <span id="studentTimerText">${timeRemaining}</span>s
          </div>
        </div>
      </header>
      <div style="position:relative;z-index:10;width:100%;height:4px;background:#1b1d38;">
        <div id="studentProgressBar" style="width:100%;height:100%;background:#52d9ed;transition:width 1s linear;"></div>
      </div>
      <main style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:12px 14px 46px;gap:10px;overflow-y:auto;">
        <div style="background:rgba(21,23,49,0.9);border:1px solid rgba(172,139,242,0.32);border-radius:14px;padding:10px 14px;text-align:center;">
          <div style="font-size:15px;font-weight:900;color:#ffffff;line-height:1.35;">${escapeHtml(qData.q || 'اختر الإجابة الصحيحة')}</div>
          ${(qData.imageUrl || qData.img) ? `<div style="display:flex;justify-content:center;margin:6px 0;max-height:110px;"><img src="${safeImageUrl(qData.imageUrl || qData.img)}" alt="${escapeHtml(qData.imageAlt || '')}" style="max-height:110px;max-width:100%;object-fit:contain;border-radius:8px;border:1px solid rgba(255,255,255,0.15);"></div>` : ''}
        </div>
        <div id="studentOptionsContainer" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:390px;margin:0 auto;flex:1;align-content:center;">
          ${opts.slice(0, 4).map((optText, idx) => {
            const theme = OPTION_THEMES[idx % 4];
            return `<button class="student-opt-btn" onclick="ScoreARQuizStudent.submitAnswer(${idx})" id="studentOptBtn_${idx}" style="min-height:76px;background:${theme.bg};border:2px solid ${theme.border};border-radius:14px;color:#ffffff;font-family:inherit;padding:8px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.3);text-align:center;"><span style="font-size:22px;line-height:1;color:#ffffff;">${theme.shape}</span><span style="font-size:14px;font-weight:900;line-height:1.2;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:#ffffff;">${escapeHtml(optText)}</span><span id="studentOptIndicator_${idx}" style="font-size:9px;opacity:0.85;font-weight:700;color:#ffffff;">اضغط للاختيار</span></button>`;
          }).join('')}
        </div>
        <div id="studentFeedbackBox" style="min-height:36px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:13px;font-weight:800;color:#a89bff;">
          اختر إجابتك بأسرع وقت لتحصيل أعلى النقاط!
        </div>
      </main>`;
  }

  function renderStudentResult(stage, resData, state) {
    const { currentStudent, currentWorldId, currentQIndex, selectedOptionIndex, currentScore, currentStreak, lastRank } = state;
    const myId = String(currentStudent.uid);
    let myResult = (resData.playerResults && resData.playerResults[myId]) ? resData.playerResults[myId] : null;
    if (!myResult && resData.playerResults && currentStudent.name) {
      const match = (resData.topLeaderboard || []).find(p => p.name === currentStudent.name);
      if (match && resData.playerResults[match.id]) myResult = resData.playerResults[match.id];
    }
    if (!myResult && resData.playerResults) {
      const byName = Object.values(resData.playerResults).find(r => r && (r.playerName === currentStudent.name || (r.id && String(r.id) === myId)));
      if (byName) myResult = byName;
    }

    const correctIdx = Number(resData.correctAnswer);
    const correctText = resData.correctAnswerText || (resData.options && resData.options[correctIdx]) || 'الإجابة النموذجية';
    const myChoiceIdx = (myResult && myResult.chosenIndex !== undefined && myResult.chosenIndex !== -1) ? Number(myResult.chosenIndex) : (selectedOptionIndex !== null ? Number(selectedOptionIndex) : -1);
    const isCorrect = myResult ? Boolean(myResult.isCorrect ?? myResult.correct) : false;
    const earned = myResult ? Number(myResult.pointsEarned || 0) : 0;
    const respTime = myResult ? myResult.respTime : null;
    const myName = (currentStudent.name || '').trim();
    const isFastest = (resData.fastestStudent && (String(resData.fastestStudent.id) === myId || (resData.fastestStudent.name && resData.fastestStudent.name.trim() === myName)));
    const myFastRank = (resData.fastestTop2 && Array.isArray(resData.fastestTop2))
      ? (resData.fastestTop2.findIndex(f => String(f.id) === myId || (f.name && f.name.trim() === myName)) + 1)
      : (isFastest ? 1 : 0);
    const isCardArena = (typeof window !== 'undefined' && window.ScoreARCardArena && typeof window.ScoreARCardArena.isModeActive === 'function')
      ? window.ScoreARCardArena.isModeActive()
      : (resData.gameMode === 'CARD_ARENA' || resData.mode === 'CARD_ARENA');

    let currentRank = '-';
    if (resData.topLeaderboard && Array.isArray(resData.topLeaderboard)) {
      const foundIdx = resData.topLeaderboard.findIndex(p => String(p.id) === myId || p.name === currentStudent.name);
      if (foundIdx !== -1) currentRank = foundIdx + 1;
    }

    let deltaIcon = '—', deltaText = 'حافظت على موقعك';
    if (lastRank !== null && currentRank !== '-') {
      if (currentRank < lastRank) { deltaIcon = `▲ ${lastRank - currentRank}`; deltaText = `صعدت ${lastRank - currentRank} مراكز!`; }
      else if (currentRank > lastRank) { deltaIcon = `▼ ${currentRank - lastRank}`; deltaText = `تراجعت ${currentRank - lastRank} مراكز`; }
    }

    const myAvatar = currentStudent?.avatarId || 'char_01';
    const opts = resData.options || [];
    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${currentWorldId}/results.jpg') center/cover no-repeat;filter:brightness(0.8) saturate(1.08);z-index:1;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 25%, ${isCorrect ? 'rgba(20,56,37,0.38)' : 'rgba(56,22,22,0.38)'} 0%, rgba(10,11,22,0.68) 100%);z-index:2;"></div>
      <header class="scorear-control-bar" style="position:relative;z-index:10;padding:10px 16px;text-align:center;">
        <span style="font-size:13px;font-weight:900;color:#ffffff;">نتيجة السؤال ${currentQIndex + 1}</span>
      </header>
      <main style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:14px;text-align:center;gap:10px;overflow-y:auto;">
        <div style="background:rgba(18,20,44,0.92);backdrop-filter:blur(16px);border:1.5px solid ${isCorrect ? '#10b981' : '#ef4444'};border-radius:20px;padding:14px 16px;width:100%;max-width:360px;box-shadow:0 10px 28px rgba(0,0,0,0.5);">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:4px;">
            <div id="studentHeroAvatarV3" style="width:76px;height:90px;display:flex;align-items:flex-end;justify-content:center;"><img id="studentHeroAvatarImg" src="assets/characters/animated/${escapeHtml(myAvatar)}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${escapeHtml(myName || 'البطل')}" style="width:68px;height:82px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.55));"></div>
            <div style="font-size:32px;line-height:1;">${isCorrect ? '🎉' : '❌'}</div>
          </div>
          <h2 style="font-size:19px;font-weight:900;color:${isCorrect ? '#34d399' : '#f87171'};margin:0 0 4px 0;">${isCorrect ? 'إجابة صحيحة وممتازة!' : (myChoiceIdx === -1 ? 'انتهى الوقت ولم تُجب!' : 'إجابة خاطئة!')}</h2>
          <div style="font-size:18px;font-weight:900;color:#fcd34d;margin:2px 0;">+${earned} <span style="font-size:12px;color:#c9baff;">نقطة</span>${respTime ? `<span style="font-size:11px;color:#6ee7b7;font-weight:700;margin-inline-start:6px;">(⚡ ${respTime}ث)</span>` : ''}</div>
          ${isCardArena && (myFastRank === 1 || myFastRank === 2) ? `<div style="background:rgba(142,100,239,0.22);border:1px solid rgba(172,139,242,0.45);color:#e9d5ff;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:900;margin-top:4px;">المركز ${myFastRank === 1 ? 'الأول' : 'الثاني'} في السرعة! كسبت كارت تكتيكي</div>` : (isCardArena && isCorrect ? `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#c9baff;padding:3px 10px;border-radius:10px;font-size:10px;font-weight:700;margin-top:4px;">أسرع في السؤال القادم لتكون من الأول أو الثاني وتكسب كارت!</div>` : (isFastest ? `<div style="background:rgba(245,158,11,0.22);border:1px solid rgba(245,158,11,0.45);color:#fcd34d;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:900;margin-top:4px;">⚡ بطل السرعة: كنت أسرع إجابة صحيحة!</div>` : ''))}
          ${currentStreak > 1 ? `<div style="font-size:11px;color:#f97316;font-weight:800;margin-top:3px;">🔥 سلسلة ${currentStreak} إجابات متتالية!</div>` : ''}
          <div style="background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.45);border-radius:12px;padding:8px 12px;margin-top:8px;text-align:center;">
            <span style="color:#6ee7b7;font-size:11px;font-weight:800;display:block;">✓ الإجابة النموذجية الصحيحة:</span>
            <b style="color:#ffffff;font-size:15px;display:block;margin-top:2px;">${escapeHtml(correctText)}</b>
          </div>
          ${(!isCorrect && myChoiceIdx !== null && myChoiceIdx >= 0 && opts[myChoiceIdx]) ? `<div style="font-size:11px;color:#fca5a5;margin-top:4px;font-weight:700;">إجابتك التي اخترتها: <b style="color:#fff;">${escapeHtml(opts[myChoiceIdx])}</b></div>` : ''}
        </div>
        ${opts.length ? `<div style="width:100%;max-width:360px;display:flex;flex-direction:column;gap:5px;">${opts.map((opt, i) => {
          const isThisCorrect = (i === correctIdx), isThisChosen = (i === myChoiceIdx);
          let bg = 'rgba(22,24,51,0.88)', border = 'rgba(255,255,255,0.12)', badge = '';
          if (isThisCorrect) { bg = 'rgba(16,185,129,0.28)'; border = '#10b981'; badge = '<span style="background:#10b981;color:#fff;font-size:10px;padding:2px 6px;border-radius:6px;font-weight:900;">✓ الصحيحة</span>'; }
          else if (isThisChosen) { bg = 'rgba(239,68,68,0.28)'; border = '#ef4444'; badge = '<span style="background:#ef4444;color:#fff;font-size:10px;padding:2px 6px;border-radius:6px;font-weight:900;">✕ اختيارك</span>'; }
          return `<div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:6px 12px;display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:800;color:#fff;"><span>${escapeHtml(opt)}</span>${badge}</div>`;
        }).join('')}</div>` : ''}
        ${(resData.why || resData.explanation) ? `<div style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);border-radius:10px;padding:6px 12px;width:100%;max-width:360px;text-align:right;font-size:11px;color:#d1fae5;font-weight:700;"><b>التفسير التعليمي:</b> ${escapeHtml(resData.why || resData.explanation)}</div>` : ''}
        <div id="studentDuelResultStrip" style="width:100%;max-width:360px;">${resData.duelScores ? renderStudentDuelStripHtml(resData.duelScores, resolveStudentTeamId(resData, currentStudent)) : ''}</div>
        ${renderStudentSurvivalBannerHtml(resData, currentStudent, true)}
        <div style="background:rgba(18,19,41,0.88);border:1px solid rgba(172,139,242,0.24);border-radius:14px;padding:10px 16px;width:100%;max-width:360px;display:flex;justify-content:space-around;align-items:center;">
          <div><div style="font-size:11px;color:#a1a4be;font-weight:700;">مجموع نقاطك</div><div class="student-live-score-val" style="font-size:17px;font-weight:900;color:#58dce3;">${Number(myResult?.totalScore ?? currentScore)}</div></div>
          <div style="width:1px;height:24px;background:rgba(255,255,255,0.1);"></div>
          <div><div style="font-size:11px;color:#a1a4be;font-weight:700;">ترتيبك الحالي</div><div style="font-size:17px;font-weight:900;color:#fcd34d;">المركز ${currentRank}</div></div>
        </div>
        <div style="font-size:11px;color:#c9baff;font-weight:800;">${deltaIcon} ${deltaText} • انتظر السؤال التالي من المعلم</div>
        ${renderHeroActionDock(false)}
      </main>`;

    mountStudentV3Hero('studentHeroAvatarV3', myAvatar, isCorrect ? 'clap' : 'sad', 76, 90, false);
    return { isCorrect, earned, currentRank, updatedScore: Number(myResult?.totalScore ?? currentScore) };
  }

  function renderStudentFinalPodium(stage, data, currentStudent, currentScore, currentWorldId) {
    const myId = String(currentStudent.uid);
    const activeMode = data?.mode || data?.gameMode || global.__scorearJoinedRoomMode || 'SOLO';
    const isDuel = activeMode === 'DUEL_TEAMS';
    const myTeamId = isDuel ? resolveStudentTeamId(data, currentStudent) : null;
    const duelNames = isDuel ? getMobileDuelTeamNames(data?.duelScores) : null;
    const myTeamName = isDuel ? (myTeamId === 'team_b' ? duelNames.team_b : duelNames.team_a) : '';
    const myTeamEmoji = myTeamId === 'team_b' ? '🦁' : '🦅';
    const leaderTeamId = data?.duelScores?.leaderTeamId || 'tie';
    const duelTeamWon = isDuel && leaderTeamId === myTeamId;
    const duelIsTie = isDuel && leaderTeamId === 'tie';

    let myFinalRank = '-';
    const rankSource = Array.isArray(data.leaderboard) ? data.leaderboard : (Array.isArray(data.podium) ? data.podium : (Array.isArray(data.top3) ? data.top3 : []));
    if (!isDuel && rankSource.length) {
      const idx = rankSource.findIndex(p => String(p?.id) === myId || p?.name === currentStudent.name);
      if (idx !== -1) myFinalRank = idx + 1;
    }
    const duelStatusCard = isDuel ? `
        <div id="studentDuelFinaleCard" style="background:rgba(12,18,40,0.88);backdrop-filter:blur(16px);border:1.5px solid ${duelTeamWon ? '#fbbf24' : (duelIsTie ? '#38bdf8' : 'rgba(255,255,255,0.22)')};border-radius:18px;padding:14px 16px;width:100%;max-width:330px;">
          <div style="font-size:15px;font-weight:900;color:${duelTeamWon ? '#fde047' : '#e2e8f0'};">
            ${duelTeamWon ? `🏆 فريقك (${myTeamEmoji} ${escapeHtml(myTeamName)}) بطل التحدي!` : (duelIsTie ? '⚖️ تعادل بطولي بين الفريقين!' : `👏 أداء رائع لفريقك (${myTeamEmoji} ${escapeHtml(myTeamName)})!`)}
          </div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">مساهمتك الشخصية للفريق: <b style="color:#58dce3;">${currentScore} نقطة</b></div>
        </div>` : `
        <div style="background:rgba(18,20,44,0.9);backdrop-filter:blur(16px);border:1px solid rgba(251,191,36,0.45);border-radius:18px;padding:14px;width:100%;max-width:310px;">
          <div style="font-size:11px;color:#a1a4be;">مجموع نقاطك النهائي:</div>
          <div style="font-size:26px;font-weight:900;color:#f5c518;margin:2px 0;">${currentScore} نقطة</div>
          ${myFinalRank !== '-' ? `<div style="font-size:12px;font-weight:900;color:#34d399;">بطل في منصة التتويج (المركز ${myFinalRank})</div>` : ''}
        </div>`;

    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${currentWorldId}/podium.jpg') center/cover no-repeat;filter:brightness(0.78) saturate(1.1);z-index:1;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 25%, rgba(42,34,84,0.34) 0%, rgba(10,11,22,0.72) 100%);z-index:2;"></div>
      <header class="scorear-control-bar" style="position:relative;z-index:10;padding:12px;text-align:center;"><span style="font-size:15px;font-weight:900;color:#fcd34d;display:inline-flex;align-items:center;gap:6px;">${uiIcon('crown', 16)} ${isDuel ? 'تتويج بطل التحدي' : 'نهاية التحدي والتتويج'}</span></header>
      <main style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center;gap:12px;">
        <div id="studentHeroAvatarV3" style="width:120px;height:148px;display:flex;align-items:flex-end;justify-content:center;"><img id="studentHeroAvatarImg" src="assets/characters/animated/${currentStudent?.avatarId || 'char_01'}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${escapeHtml(currentStudent?.name || 'البطل')}" style="width:100px;height:120px;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,0.6));"></div>
        <h2 style="font-size:19px;font-weight:900;color:#ffffff;margin:0;">أحسنت يا ${escapeHtml(currentStudent?.name || 'البطل')}!</h2>
        ${data.duelScores ? renderStudentDuelStripHtml(data.duelScores, resolveStudentTeamId(data, currentStudent)) : ''}
        ${duelStatusCard}
        ${renderHeroActionDock(true)}
        ${(!isDuel && myFinalRank !== '-' && myFinalRank <= 3) ? `<button data-scorear-certificate="true" class="btn launch-primary" style="font-weight:900;font-size:13px;border-radius:12px;padding:10px 20px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">${uiIcon('award', 15)} تحميل شهادتي التقديرية (PNG)</button>` : ''}
        <button onclick="ScoreARQuizStudent.closeStudentSession()" class="scorear-gear-btn" style="padding:10px 22px;font-size:13px;">${uiIcon('home', 14)} العودة للرئيسية</button>
      </main>`;

    mountStudentV3Hero('studentHeroAvatarV3', currentStudent?.avatarId || 'char_01', (duelTeamWon || (!isDuel && myFinalRank !== '-' && myFinalRank <= 3)) ? 'win' : 'clap', 120, 148, true);
    let isGuest = true;
    try {
      const u = (global.ScoreARAuth && (global.ScoreARAuth.getUser || global.ScoreARAuth.getCurrentUser)) ? (global.ScoreARAuth.getUser || global.ScoreARAuth.getCurrentUser)() : null;
      if (u && !u.isAnonymous && u.role === 'student' && !String(u.uid).startsWith('guest_')) isGuest = false;
      const sess = JSON.parse(sessionStorage.getItem('scorear_student_session') || '{}');
      if (sess && sess.isRegistered && !sess.isAnonymous) isGuest = false;
    } catch(e){}
    if (isGuest) {
      setTimeout(() => {
        if (global.ScoreARCloudSync && typeof global.ScoreARCloudSync.renderGuestSavePrompt === 'function') {
          global.ScoreARCloudSync.renderGuestSavePrompt(stage, { score: currentScore, rank: myFinalRank });
        } else {
          injectGuestSaveCardFallback(stage, currentScore);
        }
      }, 700);
    }
    const certificateBtn = stage.querySelector('[data-scorear-certificate]');
    if (certificateBtn) certificateBtn.addEventListener('click', () => global.ScoreARPodiumCapture?.downloadCertificate?.({name:currentStudent?.name || 'طالب',score:currentScore},myFinalRank,currentScore,currentWorldId));
  }

  function injectGuestSaveCardFallback(stage, currentScore) {
    if (!stage) stage = document.getElementById('scorearStudentStage') || document.body;
    const existing = document.getElementById('scorearGuestSaveBanner');
    if (existing) existing.remove();

    let rawCache = null;
    try { rawCache = sessionStorage.getItem('scorear_guest_contest_summary'); } catch(e){}
    const cache = rawCache ? JSON.parse(rawCache) : {};
    const mistakesCount = (cache.mistakes && Array.isArray(cache.mistakes)) ? cache.mistakes.length : 0;
    const xp = cache.gainedXp || Math.max(10, Math.round((currentScore || 0) / 10));

    const banner = document.createElement('div');
    banner.id = 'scorearGuestSaveBanner';
    banner.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:999999;max-width:540px;width:92%;background:linear-gradient(180deg, rgba(24,23,46,0.96), rgba(13,14,29,0.98));border:1px solid rgba(172,139,242,0.38);box-shadow:0 18px 45px rgba(0,0,0,0.75);border-radius:20px;padding:16px 20px;color:#fff;direction:rtl;text-align:right;font-family:inherit;pointer-events:auto;backdrop-filter:blur(18px);box-sizing:border-box;';
    banner.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="scorear-icon-box size-sm tone-violet">${uiIcon('spark', 16)}</span>
          <div>
            <h4 style="margin:0;font-size:15px;font-weight:900;color:#ffffff;">احفظ نقاطك وأخطائك في حسابك الدائم</h4>
            <p style="margin:3px 0 0;font-size:12px;color:#a1a4be;">لديك <b>+${xp} نقطة خبرة (XP)</b> ${mistakesCount > 0 ? `و <b>${mistakesCount} أسئلة وأخطاء</b> يمكنك مراجعتها في دفتر الأخطاء.` : 'يمكنك ترحيلها فوراً لسجلك الدائم.'}</p>
          </div>
        </div>
        <button type="button" onclick="document.getElementById('scorearGuestSaveBanner')?.remove()" class="scorear-gear-btn" style="padding:3px 8px;">✕</button>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
        <button type="button" class="btn launch-primary" onclick="ScoreARCloudSync ? ScoreARCloudSync.triggerStudentRegister() : (ScoreARRegisterUI && ScoreARRegisterUI.openStudentRegistrationModal())" style="border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:900;">إنشاء حساب طالب وحفظ التقدم</button>
        <button type="button" class="scorear-gear-btn" onclick="ScoreARCloudSync ? ScoreARCloudSync.triggerStudentLogin() : (ScoreARAuthUI && ScoreARAuthUI.openUnifiedLoginModal())" style="padding:8px 14px;font-size:12.5px;">تسجيل دخول</button>
      </div>`;
    stage.appendChild(banner);
  }

  function renderStudentLeaderboardCard(stage, msg, currentStudent, currentScore, currentWorldId) {
    const myId = String(currentStudent?.uid || '');
    const myName = currentStudent?.name || '';
    const myInfo = (msg.allRanks || []).find(r => String(r.id) === myId || r.name === myName) || {
      rank: '-', score: currentScore, delta: 0, streak: 0, gapToAbove: 0
    };
    const rankNum = typeof myInfo.rank === 'number' ? myInfo.rank : '-';
    const total = msg.totalPlayers || (msg.allRanks ? msg.allRanks.length : 1);

    let deltaHtml = '<span style="color:#878aa6;font-weight:800;">— ثابت</span>';
    if (myInfo.delta > 0) {
      deltaHtml = `<span style="color:#34d399;font-weight:900;">▲ صعدت ${myInfo.delta} ${myInfo.delta === 1 ? 'مركز' : 'مراكز'}</span>`;
    } else if (myInfo.delta < 0) {
      deltaHtml = `<span style="color:#f59e0b;font-weight:900;">▼ تراجعت ${Math.abs(myInfo.delta)}</span>`;
    }

    const gapText = (rankNum === 1)
      ? 'أنت في صدارة المركز الأول!'
      : (myInfo.gapToAbove > 0 ? `تفصلك ${myInfo.gapToAbove} نقطة عن المركز الأعلى` : 'أداء رائع، استمر في التحدي!');

    const charAvatarId = currentStudent?.avatarId || 'char_01';
    const wAccent = STUDENT_WORLD_ACCENTS[currentWorldId] || STUDENT_WORLD_ACCENTS.royal;
    const topContestants = (Array.isArray(msg.top5) && msg.top5.length)
      ? msg.top5
      : (Array.isArray(msg.allRanks) ? msg.allRanks.slice(0, 5) : []);

    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/boards/${escapeHtml(currentWorldId || 'royal')}-board-scene.jpg'),url('assets/worlds/${currentWorldId}/results.jpg');background-size:cover;background-position:center;filter:brightness(0.68) saturate(1.1);z-index:1;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 22%, rgba(20,26,56,0.42) 0%, rgba(7,10,22,0.86) 100%);z-index:2;"></div>
      <header class="scorear-control-bar" style="position:relative;z-index:10;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${wAccent.border}55;">
        <span style="font-size:14px;font-weight:900;color:#ffffff;display:inline-flex;align-items:center;gap:6px;"><span style="color:${wAccent.accent};">${uiIcon('trophy', 15)}</span> لوحة الترتيب بعد السؤال</span>
        <span class="scorear-control-pill" style="padding:3px 10px;font-size:11px;border-color:${wAccent.border}66;">المتسابقون: <b style="color:${wAccent.accent};">${total}</b></span>
      </header>
      <main style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:14px;text-align:center;gap:10px;overflow-y:auto;">
        <div id="studentHeroAvatarV3" style="width:92px;height:106px;display:flex;align-items:flex-end;justify-content:center;flex-shrink:0;"><img id="studentHeroAvatarImg" src="assets/motion-v3/originals/${escapeHtml(charAvatarId)}.png" onerror="this.onerror=null;this.src='assets/characters/animated/${escapeHtml(charAvatarId)}-idle.webp';" alt="${escapeHtml(myName)}" style="width:78px;height:90px;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,0.6));"></div>
        <h3 style="font-size:17px;font-weight:900;color:#ffffff;margin:0;">أحسنت يا ${escapeHtml(myName)}</h3>

        <div style="width:100%;max-width:350px;background:${wAccent.bg};backdrop-filter:blur(18px);border:1.5px solid ${wAccent.border}88;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 14px 36px rgba(0,0,0,0.5);">
          <div style="display:flex;justify-content:space-around;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
            <div>
              <div style="font-size:11px;color:#a1a4be;font-weight:700;">ترتيبي الشخصي</div>
              <div style="font-size:22px;font-weight:900;color:#fcd34d;">المركز ${rankNum}</div>
            </div>
            <div style="width:1px;height:30px;background:rgba(255,255,255,0.1);"></div>
            <div>
              <div style="font-size:11px;color:#a1a4be;font-weight:700;">حركة الترتيب</div>
              <div style="font-size:13px;margin-top:4px;">${deltaHtml}</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-around;align-items:center;">
            <div>
              <div style="font-size:11px;color:#a1a4be;font-weight:700;">مجموع نقاطي</div>
              <div class="student-live-score-val" style="font-size:20px;font-weight:900;color:#58dce3;font-family:Montserrat,monospace;">${myInfo.score ?? currentScore}</div>
            </div>
            <div style="width:1px;height:28px;background:rgba(255,255,255,0.1);"></div>
            <div>
              <div style="font-size:11px;color:#a1a4be;font-weight:700;">سلسلة الإجابات</div>
              <div style="font-size:13px;font-weight:900;color:#fbbf24;">${myInfo.streak > 0 ? `🔥 ${myInfo.streak} متتالية` : 'ابدأ السلسلة'}</div>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:8px 12px;font-size:12px;font-weight:800;color:#eceeff;">
            ${gapText}
          </div>
        </div>

        ${msg.duelScores ? `<div id="studentDuelLbStrip" style="width:100%;max-width:350px;">${renderStudentDuelStripHtml(msg.duelScores, resolveStudentTeamId(msg, currentStudent))}</div>` : ''}
        ${renderStudentSurvivalBannerHtml(msg, currentStudent, false)}

        ${topContestants.length ? `
          <div style="width:100%;max-width:350px;background:rgba(14,16,34,0.88);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:10px 12px;text-align:right;">
            <div style="font-size:12px;font-weight:900;color:#b1a2e9;margin-bottom:8px;">أبرز المتصدرين بعد السؤال:</div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${topContestants.map((tp, i) => {
                const av = tp?.avatarId || 'char_01';
                const rankBadge = String(i + 1).padStart(2, '0');
                const isMe = String(tp?.id) === myId || (tp?.name && tp.name === myName);
                const tpEmoji = tp?.teamId === 'team_b' ? '🦁 ' : (tp?.teamId === 'team_a' ? '🦅 ' : '');
                return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border-radius:11px;background:${isMe ? 'rgba(117,80,239,0.24)' : 'rgba(255,255,255,0.03)'};border:1px solid ${isMe ? 'rgba(172,139,242,0.48)' : 'rgba(255,255,255,0.07)'};">
                  <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <span style="font-size:11.5px;font-weight:900;min-width:24px;height:24px;border-radius:7px;background:${i===0?'rgba(251,191,36,0.25)':'rgba(255,255,255,0.07)'};color:${i===0?'#fde68a':'#eceeff'};display:grid;place-items:center;font-family:Montserrat,monospace;">${rankBadge}</span>
                    <img src="assets/characters/animated/${escapeHtml(av)}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${escapeHtml(tp?.name || 'بطل')}" style="width:30px;height:36px;object-fit:contain;flex-shrink:0;">
                    <b style="font-size:12.5px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tpEmoji}${escapeHtml(tp?.name || 'متسابق')}</b>
                  </div>
                  <span style="font-size:13px;font-weight:900;color:#58dce3;font-family:Montserrat,monospace;flex-shrink:0;">${Number(tp?.score || 0)}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${renderHeroActionDock(false)}
        <div style="font-size:11.5px;color:#a1a4be;font-weight:800;">
          المعلم يراجع النتائج ويستعد للسؤال التالي...
        </div>
      </main>`;
    const stMove = rankNum === 1 ? 'win' : (myInfo.delta > 0 ? 'clap' : 'idle');
    mountStudentV3Hero('studentHeroAvatarV3', charAvatarId, stMove, 92, 106, stMove !== 'idle');
  }

  function getSessionStudentObj() {
    try {
      const s = JSON.parse(sessionStorage.getItem('scorear_student_session') || '{}');
      if (s && (s.uid || s.name)) return s;
    } catch (_) {}
    return { uid: '', name: '', avatarId: 'char_01' };
  }

  function isMeEliminated(payload, currentStudent) {
    if (global.__scorearAmEliminated === true) return true;
    const stu = currentStudent || getSessionStudentObj();
    const myId = String(stu?.uid || stu?.id || '');
    const myName = (stu?.name || '').trim();
    if (!myId && !myName) return false;

    const myRes = (payload?.playerResults && myId) ? payload.playerResults[myId] : null;
    if (myRes?.eliminated) {
      global.__scorearAmEliminated = true;
      return true;
    }

    const elimIds = payload?.survivalState?.eliminatedIds;
    if (Array.isArray(elimIds) && myId && elimIds.map(String).includes(myId)) {
      global.__scorearAmEliminated = true;
      return true;
    }

    const pools = [payload?.allRanks, payload?.roster, payload?.leaderboard];
    for (let i = 0; i < pools.length; i++) {
      const list = pools[i];
      if (!Array.isArray(list)) continue;
      const m = list.find(r => r && ((myId && String(r.id) === myId) || (myName && r.name === myName)));
      if (m && m.eliminated) {
        global.__scorearAmEliminated = true;
        return true;
      }
    }
    return false;
  }

  function renderStudentSurvivalBannerHtml(payload, currentStudent, isResultScreen) {
    const mode = payload?.mode || payload?.gameMode || global.__scorearJoinedRoomMode || 'SOLO';
    if (mode !== 'SURVIVAL') return '';
    const amElim = isMeEliminated(payload, currentStudent);
    const sState = payload?.survivalState || payload?.survivalResult?.status || null;
    if (amElim) {
      return `
        <div id="studentSurvivalStatusBanner" style="width:100%;max-width:360px;background:linear-gradient(135deg,rgba(153,27,27,0.92),rgba(88,28,135,0.88));border:1.5px solid rgba(252,165,165,0.65);border-radius:14px;padding:10px 14px;text-align:center;color:#fff;direction:rtl;">
          <div style="font-size:13.5px;font-weight:900;color:#fecaca;">❌ غادرت المنافسة بشرف!</div>
          <div style="font-size:11.5px;font-weight:700;color:#fde68a;margin-top:2px;">👏 أنت الآن في مدرج المشجعين — شجّع الأبطال الباقين!</div>
        </div>
      `;
    }
    if (sState?.resetPending) {
      return `
        <div id="studentSurvivalStatusBanner" style="width:100%;max-width:360px;background:rgba(16,185,129,0.18);border:1.5px solid rgba(52,211,153,0.55);border-radius:14px;padding:9px 14px;text-align:center;color:#fff;direction:rtl;">
          <div style="font-size:12.5px;font-weight:900;color:#6ee7b7;">✅ نجوت من الإقصاء وتأهلت!</div>
          <div style="font-size:11px;font-weight:800;color:#fde68a;margin-top:2px;">🔄 تم تصفير النقاط (0) لجولة جديدة متكافئة 🔥</div>
        </div>
      `;
    }
    if (!isResultScreen && sState) {
      return `
        <div id="studentSurvivalStatusBanner" style="width:100%;max-width:360px;background:rgba(245,158,11,0.14);border:1px solid rgba(251,191,36,0.45);border-radius:12px;padding:7px 12px;text-align:center;font-size:11.5px;font-weight:900;color:#fde68a;direction:rtl;">
          👑 البقاء للأقوى · المتبقون في السباق: ${sState.aliveCount || 1}
        </div>
      `;
    }
    return '';
  }

  function renderStudentSpectatorHtml(stage, payload, currentStudent, currentWorldId) {
    const stu = currentStudent || getSessionStudentObj();
    const myAvatar = stu?.avatarId || 'char_01';
    const wid = String(currentWorldId || 'royal').trim() || 'royal';
    const aliveCount = payload?.survivalState?.aliveCount ?? '';
    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${escapeHtml(wid)}/waiting.jpg') center/cover no-repeat;filter:brightness(0.68) saturate(1.05);z-index:1;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 25%, rgba(88,28,135,0.42) 0%, rgba(10,11,22,0.86) 100%);z-index:2;"></div>
      <header class="scorear-control-bar" style="position:relative;z-index:10;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;direction:rtl;">
        <span style="font-size:13px;font-weight:900;color:#fde68a;">👑 وضع البقاء للأقوى</span>
        ${aliveCount !== '' ? `<span class="scorear-control-pill" style="font-size:11px;padding:3px 10px;">المتبقون: <b style="color:#6ee7b7;">${aliveCount}</b></span>` : ''}
      </header>
      <main id="studentSpectatorView" style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;text-align:center;gap:12px;direction:rtl;">
        <div id="studentHeroAvatarV3" style="width:104px;height:122px;display:flex;align-items:flex-end;justify-content:center;"><img id="studentHeroAvatarImg" src="assets/characters/animated/${escapeHtml(myAvatar)}-idle.webp" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="${escapeHtml(stu?.name || 'البطل')}" style="width:90px;height:108px;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,0.65));"></div>
        <div style="background:rgba(18,16,42,0.92);border:1.5px solid rgba(251,191,36,0.45);border-radius:18px;padding:14px 16px;max-width:350px;width:100%;">
          <div style="font-size:17px;font-weight:900;color:#fde68a;">👏 خرجت بشرف — أنت الآن في مدرج المشجعين!</div>
          <p style="font-size:12px;color:#cbd5e1;margin:6px 0 0;">تابع شاشة القاعة واضغط لتشجيع أصدقائك الباقين في المنافسة:</p>
        </div>
        <div class="student-hero-action-dock" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:350px;width:100%;">
          <button type="button" onclick="ScoreARQuizStudentView.triggerHeroAction('clap','👏',this)" class="scorear-gear-btn" style="padding:10px 6px;border-radius:12px;justify-content:center;font-weight:900;">👏 تصفيق</button>
          <button type="button" onclick="ScoreARQuizStudentView.triggerHeroAction('jump','🔥',this)" class="scorear-gear-btn" style="padding:10px 6px;border-radius:12px;justify-content:center;font-weight:900;">🔥 حماس</button>
          <button type="button" onclick="ScoreARQuizStudentView.triggerHeroAction('wave','⭐',this)" class="scorear-gear-btn" style="padding:10px 6px;border-radius:12px;justify-content:center;font-weight:900;">⭐ تشجيع</button>
        </div>
      </main>`;
    mountStudentV3Hero('studentHeroAvatarV3', myAvatar, 'wave', 104, 122, true);
  }

  function resolveStudentTeamId(payload, currentStudent) {
    const myId = String(currentStudent?.uid || currentStudent?.id || '');
    const myName = currentStudent?.name || '';
    const pools = [payload?.allRanks, payload?.roster, payload?.leaderboard];
    for (let i = 0; i < pools.length; i++) {
      const list = pools[i];
      if (!Array.isArray(list)) continue;
      const m = list.find(r => r && ((myId && String(r.id) === myId) || (myName && r.name === myName)));
      if (m && (m.teamId === 'team_a' || m.teamId === 'team_b')) return m.teamId;
    }
    if (global.__scorearStudentTeamId) return global.__scorearStudentTeamId;
    try {
      const sess = JSON.parse(sessionStorage.getItem('scorear_student_session') || '{}');
      if (sess?.pin) {
        const stored = sessionStorage.getItem('scorear_student_team_' + sess.pin);
        if (stored === 'team_a' || stored === 'team_b') return stored;
      }
    } catch (_) {}
    return 'team_a';
  }

  function getMobileDuelTeamNames(duelScores) {
    const fromHost = global.ScoreARArenaModes?.getTeamNames ? global.ScoreARArenaModes.getTeamNames() : null;
    const fromGlobal = global.__scorearDuelTeamNames || null;
    return {
      team_a: duelScores?.team_a?.name || fromGlobal?.team_a || fromHost?.team_a || 'فريق الصقور',
      team_b: duelScores?.team_b?.name || fromGlobal?.team_b || fromHost?.team_b || 'فريق الأسود'
    };
  }

  function renderStudentDuelStripHtml(duelScores, myTeamId) {
    if (!duelScores || (!duelScores.team_a && !duelScores.team_b)) return '';
    const names = getMobileDuelTeamNames(duelScores);
    const aScore = Number(duelScores.team_a?.score || 0);
    const bScore = Number(duelScores.team_b?.score || 0);
    const total = aScore + bScore;
    const pctA = total > 0 ? Math.max(14, Math.min(86, (aScore / total) * 100)) : 50;
    const pctB = 100 - pctA;
    const isA = myTeamId !== 'team_b';
    return `
      <div style="width:100%;background:rgba(12,16,36,0.90);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.16);border-radius:14px;padding:9px 12px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.45);direction:rtl;">
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:900;margin-bottom:6px;gap:6px;">
          <span style="color:#7dd3fc;">🦅 ${escapeHtml(names.team_a)} ${isA ? '<small style="color:#fde047;">(فريقك ✓)</small>' : ''}: <b style="color:#fff;">${aScore}</b></span>
          <span style="color:#fdba74;">🦁 ${escapeHtml(names.team_b)} ${!isA ? '<small style="color:#fde047;">(فريقك ✓)</small>' : ''}: <b style="color:#fff;">${bScore}</b></span>
        </div>
        <div style="height:8px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,0.08);display:flex;">
          <div style="width:${pctA.toFixed(1)}%;background:linear-gradient(90deg,#38bdf8,#0284c7);transition:width 0.5s;"></div>
          <div style="width:${pctB.toFixed(1)}%;background:linear-gradient(90deg,#ea580c,#fb923c);transition:width 0.5s;"></div>
        </div>
      </div>
    `;
  }

  let _duelSubBound = false;
  function bindDuelModeRealtimeSync() {
    if (_duelSubBound || !global.ScoreARRealtime || typeof global.ScoreARRealtime.subscribe !== 'function') return;
    _duelSubBound = true;
    try {
      global.ScoreARRealtime.subscribe('ROOM_MODE_UPDATE', msg => {
        const mode = msg?.mode || msg?.gameMode;
        if (msg?.duelTeamNames) {
          global.__scorearDuelTeamNames = msg.duelTeamNames;
        }
        if (mode) {
          global.__scorearJoinedRoomMode = mode;
          try {
            const sess = JSON.parse(sessionStorage.getItem('scorear_student_session') || '{}');
            const myId = String(sess?.uid || '');
            const mine = Array.isArray(msg.roster) ? msg.roster.find(r => r && String(r.id) === myId) : null;
            if (mine) {
              if (mine.teamId === 'team_a' || mine.teamId === 'team_b') {
                global.__scorearStudentTeamId = mine.teamId;
                if (sess?.pin) sessionStorage.setItem('scorear_student_team_' + sess.pin, mine.teamId);
              }
              if (mine.eliminated) global.__scorearAmEliminated = true;
            }
          } catch (_) {}
          mountMobileDuelTeamDock();
        }
      });
    } catch (_) {}
  }

  function getActiveMobileTeamId() {
    if (global.__scorearStudentTeamId === 'team_b' || global.__scorearStudentTeamId === 'team_a') {
      return global.__scorearStudentTeamId;
    }
    try {
      const sess = JSON.parse(sessionStorage.getItem('scorear_student_session') || '{}');
      if (sess?.pin) {
        const stored = sessionStorage.getItem('scorear_student_team_' + sess.pin);
        if (stored === 'team_a' || stored === 'team_b') return stored;
      }
    } catch (_) {}
    return 'team_a';
  }

  function isMobileDuelActive() {
    if (global.__scorearJoinedRoomMode === 'DUEL_TEAMS') return true;
    const hostPin = global.ScoreARQuizHost?.getPin?.();
    if (hostPin && global.ScoreARGameModes?.getMode?.() === 'DUEL_TEAMS') return true;
    return false;
  }

  function switchMobileDuelTeam(teamId) {
    const tid = teamId === 'team_b' ? 'team_b' : 'team_a';
    global.__scorearStudentTeamId = tid;
    let sess = {};
    try {
      sess = JSON.parse(sessionStorage.getItem('scorear_student_session') || '{}');
      if (sess?.pin) sessionStorage.setItem('scorear_student_team_' + sess.pin, tid);
    } catch (_) {}
    mountMobileDuelTeamDock();
    try {
      if (global.ScoreARRealtime && typeof global.ScoreARRealtime.publish === 'function' && sess?.uid && sess?.pin) {
        global.ScoreARRealtime.publish('STUDENT_JOIN', {
          player: { id: sess.uid, name: sess.name || 'طالب', avatarId: sess.avatarId || 'char_01', teamId: tid },
          pin: sess.pin,
          isTeamSwitch: true
        });
      }
    } catch (_) {}
    if (global.toast) {
      const names = getMobileDuelTeamNames();
      global.toast(tid === 'team_b' ? `تم الانضمام إلى 🦁 ${names.team_b}!` : `تم الانضمام إلى 🦅 ${names.team_a}!`);
    }
    return tid;
  }

  function mountMobileDuelTeamDock() {
    if (typeof document === 'undefined') return;
    const stg = document.getElementById('scorearStudentStage');
    if (!stg || stg.querySelector('#studentOptionsContainer') || stg.querySelector('#studentSpectatorView')) return;
    const active = isMobileDuelActive();
    let dock = stg.querySelector('#studentDuelTeamDock');
    if (!active) {
      if (dock) dock.remove();
      return;
    }
    const cur = getActiveMobileTeamId();
    const names = getMobileDuelTeamNames();
    const renderKey = `${cur}|${names.team_a}|${names.team_b}`;
    if (dock && dock.getAttribute('data-rendered-team') === renderKey) {
      return;
    }
    const anchor = stg.querySelector('.student-hero-action-dock') || stg.querySelector('#studentFeedbackBox');
    if (!anchor || !anchor.parentElement) return;
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'studentDuelTeamDock';
      dock.style.cssText = 'width:100%;max-width:350px;margin:10px auto 0;background:rgba(12,16,38,0.88);border:1px solid rgba(56,189,248,0.35);border-radius:16px;padding:10px 12px;text-align:center;direction:rtl;';
      anchor.insertAdjacentElement('afterend', dock);
    }
    dock.setAttribute('data-rendered-team', renderKey);
    const teams = [
      { id: 'team_a', emoji: '🦅', name: names.team_a, bg: 'linear-gradient(135deg,#0284c7,#0369a1)' },
      { id: 'team_b', emoji: '🦁', name: names.team_b, bg: 'linear-gradient(135deg,#ea580c,#c2410c)' }
    ];
    dock.innerHTML = `
      <div style="font-size:11.5px;font-weight:900;color:#fde68a;margin-bottom:7px;">⚔️ وضع التحدي — اختر فريقك الآن:</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${teams.map(t => {
          const sel = cur === t.id;
          return `<button type="button" data-mobile-team="${t.id}" onclick="ScoreARQuizStudentView.switchMobileDuelTeam('${t.id}')" style="padding:8px 6px;border-radius:12px;border:2px solid ${sel ? '#fde047' : 'rgba(255,255,255,0.16)'};background:${sel ? t.bg : 'rgba(255,255,255,0.06)'};color:#fff;font-family:inherit;font-size:12.5px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
            <span>${t.emoji}</span>
            <span>${escapeHtml(t.name)}</span>
            ${sel ? '<span style="color:#fde047;">✓</span>' : ''}
          </button>`;
        }).join('')}
      </div>
    `;
  }

  function renderStudentRoomClosed(stage, reason, currentStudent, currentScore, currentWorldId) {
    global.__scorearAmEliminated = false;
    const charAvatarId = currentStudent?.avatarId || 'char_01';
    stage.innerHTML = `
      <div style="position:absolute;inset:0;background:url('assets/worlds/${currentWorldId}/waiting.jpg') center/cover no-repeat;filter:brightness(0.72) saturate(1.05);z-index:1;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%, rgba(15,23,42,0.4) 0%, rgba(10,11,22,0.82) 100%);z-index:2;"></div>
      <main style="position:relative;z-index:10;width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:20px;text-align:center;">
        <div style="width:100%;max-width:390px;background:rgba(18,20,44,0.92);backdrop-filter:blur(18px);border:1px solid rgba(172,139,242,0.32);border-radius:22px;padding:22px 18px;display:flex;flex-direction:column;align-items:center;gap:12px;box-shadow:0 16px 44px rgba(0,0,0,0.65);">
          <span class="scorear-icon-box size-md tone-violet">${uiIcon('flag', 20)}</span>
          <div><h2 style="font-size:18px;font-weight:900;color:#fff;margin:0 0 4px 0;">انتهت المسابقة بواسطة المعلم</h2><p style="font-size:11.5px;color:#a1a4be;margin:0;">${escapeHtml(reason || 'قام المعلم بإنهاء أو إغلاق قاعة المسابقة')}</p></div>
          <div style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:8px;"><img src="assets/characters/animated/${charAvatarId}-idle.webp" onerror="this.onerror=null;this.src='assets/characters/${charAvatarId}.webp';this.onerror=function(){this.src='assets/characters/char_01.webp';};" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1.5px solid #a855f7;"><b style="font-size:12px;color:#fff;">${escapeHtml(currentStudent?.name || 'البطل')}</b></div>
            <div><span style="font-size:11px;color:#a1a4be;">مجموع نقاطك: </span><b style="font-size:16px;color:#58dce3;">${currentScore || 0}</b></div>
          </div>
          <button onclick="ScoreARQuizStudent.closeStudentSession()" class="btn launch-primary full" style="border-radius:12px;padding:11px;font-size:13px;font-weight:900;cursor:pointer;">العودة للصفحة الرئيسية</button>
        </div>
      </main>`;
  }

  let _dockSyncing = false;
  function ensureLobbyHeroDock() {
    if (typeof document === 'undefined' || _dockSyncing) return;
    _dockSyncing = true;
    try {
      bindDuelModeRealtimeSync();
      const stg = document.getElementById('scorearStudentStage');
      if (!stg || stg.querySelector('#studentOptionsContainer')) return;
      if (!stg.querySelector('.student-hero-action-dock')) {
        const fb = stg.querySelector('#studentFeedbackBox');
        if (fb && fb.parentElement) {
          const heroImg = stg.querySelector('main img');
          if (heroImg && !heroImg.id) heroImg.id = 'studentHeroAvatarImg';
          fb.insertAdjacentHTML('beforebegin', `<div style="margin-top:12px;width:100%;max-width:350px;"><div style="font-size:11px;color:#58dce3;font-weight:800;margin-bottom:4px;">🎮 حرّك بطلك الآن على شاشة المعلم:</div>${renderHeroActionDock(false)}</div>`);
        }
      }
      mountMobileDuelTeamDock();
    } finally {
      _dockSyncing = false;
    }
  }

  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    const obs = new MutationObserver(() => ensureLobbyHeroDock());
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    else document.addEventListener?.('DOMContentLoaded', () => { if (document.body) obs.observe(document.body, { childList: true, subtree: true }); });
  }

  const ScoreARQuizStudentView = {
    renderStudentReading,
    renderStudentQuestion,
    renderStudentResult,
    renderStudentLeaderboardCard,
    renderStudentFinalPodium,
    renderStudentRoomClosed,
    triggerHeroAction,
    ensureLobbyHeroDock,
    mountMobileDuelTeamDock,
    switchMobileDuelTeam
  };

  global.ScoreARQuizStudentView = ScoreARQuizStudentView;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARQuizStudentView = ScoreARQuizStudentView; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARQuizStudentView;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
