/**
 * ScoreAR Unified Views Engine (Seamless In-App Views)
 * Unifies navigation between index.html and cards, characters, and podium views
 * without page reloads, preserving classroom session state and audio.
 * Rule 7 compliant (<480 lines).
 */
(function(global) {
  'use strict';

  let currentView = null;
  let returnHash = '#home';
  let stageElement = null;

  function uiIcon(name, size = 15) {
    if (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function') {
      return global.ScoreARUI.icon(name, { size });
    }
    return typeof global.icon === 'function' ? global.icon(name) : '';
  }

  function ensureStageElement() {
    if (stageElement && document.body.contains(stageElement)) return stageElement;
    stageElement = document.getElementById('scorearUnifiedModalStage');
    if (!stageElement) {
      stageElement = document.createElement('div');
      stageElement.id = 'scorearUnifiedModalStage';
      stageElement.className = 'scorear-unified-stage';
      stageElement.setAttribute('role', 'dialog');
      stageElement.setAttribute('aria-modal', 'true');
      stageElement.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:99999',
        'background:radial-gradient(ellipse at 20% 0, rgba(48,35,79,0.7), transparent 55%), #0c0d1d',
        'color:#eceeff',
        'overflow-y:auto',
        'overflow-x:hidden',
        'max-width:100vw',
        '-webkit-overflow-scrolling:touch',
        'display:none',
        'font-family:Tajawal,Arial,sans-serif',
        'direction:rtl',
        'box-sizing:border-box'
      ].join(';') + ';';
      document.body.appendChild(stageElement);
    }
    return stageElement;
  }

  function getUnifiedHeaderHtml(activeType, titleAr, subtitleAr) {
    const isCards = activeType === 'cards';
    const isHeroes = activeType === 'heroes' || activeType === 'characters';
    const isPodium = activeType === 'podium';

    return `
      <header class="gallery-header scorear-unified-header">
        <div class="scorear-unified-head-main">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <button type="button" class="btn-gallery-back" onclick="ScoreARUnifiedViews.closeView()" style="display:inline-flex;align-items:center;gap:6px;background:rgba(142,100,239,0.22);border:1px solid rgba(142,100,239,0.45);color:#fff;border-radius:10px;padding:7px 14px;font-size:12.5px;font-weight:900;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;" aria-label="الرجوع الفوري">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span>عودة</span>
            </button>
            <div class="gallery-brand" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:#ffffff;min-width:0;">
              <img src="assets/mark.svg" alt="" width="30" height="30" style="filter:drop-shadow(0 0 10px rgba(117,80,239,0.5));flex-shrink:0;">
              <div>
                <b style="font-family:Cairo,sans-serif;font-size:17px;font-weight:900;display:block;line-height:1.1;white-space:nowrap;">سكور آر<span style="color:#52d9ed;">.</span></b>
                <small style="display:block;font-size:9px;letter-spacing:0.3px;color:#a1a4be;white-space:nowrap;font-weight:700;">تعلّم · نافس · تميّز</small>
              </div>
            </div>
          </div>
        </div>

        <div class="scorear-unified-actions">
          <button type="button" class="scorear-unified-action-btn ${isCards ? 'is-active-cards' : ''}" onclick="ScoreARUnifiedViews.openView('cards')">${uiIcon('layers', 14)} <span>الكروت (٢٠)</span></button>
          <button type="button" class="scorear-unified-action-btn ${isHeroes ? 'is-active-heroes' : ''}" onclick="ScoreARUnifiedViews.openView('heroes')">${uiIcon('spark', 14)} <span>الأبطال (٢٠)</span></button>
          <button type="button" class="scorear-unified-action-btn ${isPodium ? 'is-active-podium' : ''}" onclick="ScoreARUnifiedViews.openView('podium')">${uiIcon('crown', 14)} <span>التتويج</span></button>
        </div>
        <button type="button" class="scorear-unified-close-btn" onclick="ScoreARUnifiedViews.closeView()" title="إغلاق العرض المدمج">${uiIcon('close', 14)} <span>إغلاق</span></button>
      </header>
    `;
  }

  function renderCardsView(container) {
    container.innerHTML = `
      ${getUnifiedHeaderHtml('cards', 'قاعة الكروت التكتيكية', '٢٠ كارت ذكاء استراتيجي يقلب موازين القاعة')}
      <main class="character-gallery-page">
        <div class="gallery-title-area" style="margin:14px 0 20px;">
          <div class="eyebrow scorear-inline-icon" style="margin-bottom:8px;color:#fbbf24;font-weight:900;">${uiIcon('layers', 14)} <span>موسوعة حرب الكروت التكتيكية</span></div>
          <h1 style="font-family:Cairo,sans-serif;font-size:clamp(22px, 3.6vw, 40px);font-weight:900;margin:8px 0;color:#ffffff;line-height:1.3;">ترسانة الـ ٢٠ كارت.. ذكاء تكتيكي يقلب موازين القاعة.</h1>
          <p style="color:#b1a2e9;font-size:13.5px;max-width:740px;line-height:1.75;margin:0;">تعرّف على أسرار كل كارت في طور حرب الكروت (Card Arena): من انقلاب المراكز بالكامل وسرقة النقاط، إلى فخاخ مرآة القاضي والصد العكسي التلقائي والدروع الذهبية ومساعدات الـ 50/50.</p>
        </div>

        <div class="character-picker cards-picker-layout">
          <!-- ASIDE PREVIEW -->
          <aside class="character-stage" aria-label="معاينة الكارت التفاعلي" style="width:100%;box-sizing:border-box;">
            <small style="color:#fcd34d;font-weight:900;letter-spacing:1px;display:block;margin-bottom:12px;text-align:center;">✦ الكارت التكتيكي المختار ✦</small>
            <div id="cardPreviewBox" style="width:100%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"></div>
            <div id="cardPreviewInfo" aria-live="polite"></div>
          </aside>

          <!-- COLLECTION & TABS -->
          <div class="character-collection" style="min-width:0;width:100%;">
            <div class="character-section-head">
              <h4>ترسانة الكروت الرسمية</h4>
              <span>٢٠ كارت تكتيكي متوازن</span>
            </div>

            <div class="character-tabs" aria-label="فئات الكروت">
              <button type="button" id="cardTab-all" onclick="ScoreARCardsGallery.filterCards('all')" aria-pressed="true">الكل · ٢٠</button>
              <button type="button" id="cardTab-game_changer" onclick="ScoreARCardsGallery.filterCards('game_changer')" aria-pressed="false">نقاط وانقلاب · ٥</button>
              <button type="button" id="cardTab-attack" onclick="ScoreARCardsGallery.filterCards('attack')" aria-pressed="false">هجوم وتعطيل · ٥</button>
              <button type="button" id="cardTab-defense" onclick="ScoreARCardsGallery.filterCards('defense')" aria-pressed="false">دروع وفخاخ · ٥</button>
              <button type="button" id="cardTab-boost" onclick="ScoreARCardsGallery.filterCards('boost')" aria-pressed="false">تعزيز ومكافآت · ٥</button>
            </div>

            <div id="cardsGrid" class="cards-grid-layout" role="region" aria-label="شبكة كروت اللعبة"></div>
          </div>
        </div>
      </main>
    `;

    if (global.ScoreARCardsGallery && typeof global.ScoreARCardsGallery.renderGrid === 'function') {
      global.ScoreARCardsGallery.renderGrid(document.getElementById('cardsGrid'), 'all', 'SWAP_STUDENT');
      global.ScoreARCardsGallery.renderPreview(
        document.getElementById('cardPreviewBox'),
        document.getElementById('cardPreviewInfo'),
        'SWAP_STUDENT'
      );
    }
  }

  function renderCharactersView(container) {
    let savedAvatar = 'char_01';
    try {
      const p = JSON.parse(localStorage.getItem('scorear_student_profile_v1') || '{}');
      if (p.avatarId) savedAvatar = p.avatarId;
    } catch(e){}

    container.innerHTML = `
      ${getUnifiedHeaderHtml('heroes', 'قاعة أبطال سكور آر', '٢٠ رفيقاً كرتونياً للمغامرة والتعلم')}
      <main class="character-gallery-page heroes-page">
        <div class="gallery-title-area" style="margin:14px 0 20px;">
          <div class="eyebrow scorear-inline-icon" style="margin-bottom:8px;color:#52d9ed;font-weight:900;">${uiIcon('spark', 14)} <span>مستودع الأبطال الرسمي</span></div>
          <h1 style="font-family:Cairo,sans-serif;font-size:clamp(22px, 3.6vw, 42px);font-weight:900;margin:8px 0;color:#ffffff;line-height:1.3;">أبطال سكور آر.. ٢٠ رفيقاً كرتونياً للمغامرة والتعلم.</h1>
          <p style="color:#b1a2e9;font-size:13.5px;max-width:720px;line-height:1.75;margin:0;">اختر رفيقك في الحصص الحية والمنافسات اليومية. يملك كل بطل حركة تنفس مشوقة وتأثيرات تتويج فريدة تميزك داخل القاعة.</p>
        </div>

        <div class="character-picker">
          <!-- PREVIEW ASIDE -->
          <aside class="character-stage" aria-label="معاينة البطل التفاعلي">
            <small>✦ البطل المختار حالياً ✦</small>
            <div id="studentCustomPreviewBox"></div>
            <div id="studentCustomPreviewTitle"><h3></h3></div>
            <p id="studentCustomPreviewDesc" style="color:#c5c7de;font-size:13px;line-height:1.6;margin:6px 0 10px;"></p>
            <div class="character-controls" style="margin-bottom:14px;">
              <button type="button" data-character-pose="idle" aria-pressed="true" onclick="ScoreARUnifiedViews.previewHeroPose('idle')">${uiIcon('sparkles', 14)} <span>وقوف</span></button>
              <button type="button" data-character-pose="walkRight" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('walkRight')">${uiIcon('route', 14)} <span>مشي</span></button>
              <button type="button" data-character-pose="runRight" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('runRight')">${uiIcon('zap', 14)} <span>جري</span></button>
              <button type="button" data-character-pose="jump" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('jump')">${uiIcon('arrowUp', 14)} <span>قفز</span></button>
              <button type="button" data-character-pose="clap" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('clap')"><span>تصفيق</span></button>
              <button type="button" data-character-pose="win" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('win')">${uiIcon('trophy', 14)} <span>احتفال</span></button>
              <button type="button" data-character-pose="wave" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('wave')"><span>تلويح</span></button>
              <button type="button" data-character-pose="sad" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('sad')"><span>حزن</span></button>
              <button type="button" data-character-pose="climb" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('climb')"><span>تسلق</span></button>
              <button type="button" data-character-pose="fly" aria-pressed="false" onclick="ScoreARUnifiedViews.previewHeroPose('fly')">${uiIcon('planet', 14)} <span>طيران</span></button>
            </div>
            <button type="button" id="btnSelectHero" onclick="ScoreARUnifiedViews.saveHeroChoice()" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(110deg,#7550ef,#9665ff);color:#fff;border:1px solid rgba(196,168,255,0.4);border-radius:14px;padding:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 6px 20px rgba(117,80,239,0.35);font-family:inherit;">${uiIcon('star', 16)} <span>اعتماد هذا البطل لشخصيتي</span></button>
          </aside>

          <!-- GRID -->
          <div class="character-collection" style="min-width:0;width:100%;">
            <div class="character-section-head">
              <h4>قائمة الأبطال الـ ٢٠</h4>
              <span>جاهزون للحصص الحية</span>
            </div>

            <div class="character-tabs" aria-label="فئات الأبطال">
              <button type="button" id="charTab-all" onclick="ScoreARUnifiedViews.filterHeroes('all')" aria-pressed="true">الكل · ٢٠</button>
              <button type="button" id="charTab-human" onclick="ScoreARUnifiedViews.filterHeroes('human')" aria-pressed="false">البشر · ٨</button>
              <button type="button" id="charTab-animal" onclick="ScoreARUnifiedViews.filterHeroes('animal')" aria-pressed="false">الحيوانات · ٦</button>
              <button type="button" id="charTab-fantasy" onclick="ScoreARUnifiedViews.filterHeroes('fantasy')" aria-pressed="false">الخياليون · ٦</button>
            </div>

            <div id="avatarsGrid" class="character-grid" role="region" aria-label="أبطال سكور آر"></div>
          </div>
        </div>
      </main>
    `;

    global._unifiedHeroSelected = 1;
    global._unifiedHeroCategory = 'all';

    if (global.ScoreARCharacters) {
      try {
        const found = global.ScoreARCharacters.get(savedAvatar);
        if (found) global._unifiedHeroSelected = found.id;
      } catch(e){}

      ScoreARUnifiedViews.renderHeroesGrid();
    }
  }

  function renderHeroesGrid() {
    if (!global.ScoreARCharacters) return;
    const gridEl = document.getElementById('avatarsGrid');
    if (!gridEl) return;
    global.ScoreARCharacters.grid(gridEl, global._unifiedHeroCategory || 'all', global._unifiedHeroSelected || 1, id => {
      global._unifiedHeroSelected = id;
      renderHeroesGrid();
    });
    global.ScoreARCharacters.preview(global._unifiedHeroSelected || 1);
  }

  function previewHeroPose(pose) {
    global._unifiedHeroPose = pose || 'idle';
    const box = document.getElementById('studentCustomPreviewBox');
    const hero = global.ScoreARCharacters?.get ? global.ScoreARCharacters.get(global._unifiedHeroSelected || 1) : { code: 'char_01' };
    if (box && global.ScoreARMotionV3?.mount) {
      global.ScoreARMotionV3.mount(box, hero.code, global._unifiedHeroPose, { width: 220, height: 260, loop: global._unifiedHeroPose !== 'jump' });
      document.querySelectorAll('[data-character-pose]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.characterPose === global._unifiedHeroPose)));
      return;
    }
    if (global.ScoreARCharacters && typeof global.ScoreARCharacters.preview === 'function') {
      global.ScoreARCharacters.preview(global._unifiedHeroSelected || 1, global._unifiedHeroPose);
    }
  }

  function filterHeroes(cat) {
    global._unifiedHeroCategory = cat;
    const scope = stageElement || document;
    ['all', 'human', 'animal', 'fantasy'].forEach(c => {
      const btn = scope.querySelector('#charTab-' + c) || document.getElementById('charTab-' + c);
      if (btn) btn.setAttribute('aria-pressed', String(c === cat));
    });
    renderHeroesGrid();
  }

  function saveHeroChoice() {
    if (!global._unifiedHeroSelected || !global.ScoreARCharacters) return;
    const hero = (typeof global.ScoreARCharacters.get === 'function' ? global.ScoreARCharacters.get(global._unifiedHeroSelected) : null)
      || (Array.isArray(global.ScoreARCharacters.list) ? global.ScoreARCharacters.list.find(h => h.id === global._unifiedHeroSelected) : null);
    if (!hero) return;
    try {
      const profile = JSON.parse(localStorage.getItem('scorear_student_profile_v1') || '{}');
      profile.avatarId = hero.code;
      localStorage.setItem('scorear_student_profile_v1', JSON.stringify(profile));
      if (global.toast) global.toast(`تم اعتماد البطل (${hero.name || hero.nameAr || hero.code}) بنجاح`);
    } catch(e){}
  }

  function renderPodiumView(container) {
    container.innerHTML = `
      ${getUnifiedHeaderHtml('podium', 'منصة التتويج الاحتفالية الكبرى', 'المحاكاة الاحتفالية للتتويج وتكريم الأبطال')}
      <div class="unified-podium-sim-bar scorear-control-bar">
        <div class="unified-podium-sim-scroll">
          <select id="unifiedPodiumWorld" onchange="ScoreARUnifiedViews.simulatePodium('chooser')" style="width:auto !important;min-width:110px;background:rgba(20,22,46,0.9);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:800;font-family:inherit;">
            <option value="royal">القصر الملكي</option><option value="oasis">الواحة العربية</option><option value="cosmic">محطة الفضاء</option>
            <option value="treasure">جزيرة الكنز</option><option value="stadium">استاد الأبطال</option><option value="magic">مملكة السحر</option>
          </select>
          <select id="unifiedPodiumStyle" onchange="ScoreARUnifiedViews.simulatePodium('chooser')" style="width:auto !important;min-width:105px;background:rgba(20,22,46,0.9);border:1px solid rgba(251,191,36,0.45);color:#fde68a;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:800;font-family:inherit;">
            <option value="classic">كلاسيكي</option><option value="hall">احتفال القاعة</option>
          </select>
          <button type="button" class="scorear-gear-btn is-active" onclick="ScoreARUnifiedViews.simulatePodium('cinematic')">${uiIcon('play', 14)} <span>سينمائي</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARUnifiedViews.simulatePodium(3)">${uiIcon('medal', 14)} <span>الثالث</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARUnifiedViews.simulatePodium(2)">${uiIcon('medal', 14)} <span>الثاني</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARUnifiedViews.simulatePodium(1)" style="border-color:rgba(251,191,36,0.35);color:#fef08a;">${uiIcon('crown', 14)} <span>الأول</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARUnifiedViews.simulatePodium('all')">${uiIcon('zap', 14)} <span>كشف الكل</span></button>
          <button type="button" class="scorear-gear-btn" onclick="ScoreARPodiumEffects?.toggleAudioMute?.()">${uiIcon('volume', 14)} <span>الصوت</span></button>
        </div>
      </div>
      <style>
        .unified-podium-sim-bar { padding:5px 14px;flex-shrink:0; }
        .unified-podium-sim-scroll { display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
        #unifiedPodiumStage { position:relative;width:100%;flex:1 1 0;min-height:0;background:#080914;overflow:hidden;display:flex;flex-direction:column; }
        #unifiedPodiumStage #podiumStageRoot .podium-header-bar { padding:4px 14px !important; }
        #unifiedPodiumStage #podiumStageRoot .podium-title-text { display:none !important; }
        @media (min-width: 721px) and (max-height: 760px) {
          #unifiedPodiumStage #podiumStageRoot { --pod-s: 0.77 !important; --pod-dx: clamp(205px, 18.5vw, 270px) !important; }
        }
        @media (max-width: 720px) {
          .scorear-unified-stage .gallery-header { position: relative !important; padding: 8px 10px !important; }
          .unified-podium-sim-bar { padding: 4px 8px; }
          .unified-podium-sim-scroll { flex-wrap: wrap; justify-content: center; gap: 4px; overflow: visible; }
          .unified-podium-sim-scroll button { padding: 4px 7px !important; font-size: 10px !important; border-radius: 7px !important; }
          #unifiedPodiumStage { flex: 1 1 0 !important; min-height: 0 !important; }
        }
      </style>
      <div id="unifiedPodiumStage">
        <div id="podiumHostStage" class="podium-canvas-area" style="position:relative;width:100%;height:100%;flex:1;display:flex;flex-direction:column;"></div>
      </div>
    `;

    setTimeout(() => {
      simulatePodium('chooser');
    }, 60);
  }

  function simulatePodium(target) {
    const demoPodium = [
      { id: 'p1', name: 'عمر السعيد', score: 2850, avatarId: 'char_01', rank: 1, answersCorrect: 10, totalQuestions: 10, accuracy: 100 },
      { id: 'p2', name: 'مريم محمود', score: 2420, avatarId: 'char_02', rank: 2, answersCorrect: 9, totalQuestions: 10, accuracy: 90 },
      { id: 'p3', name: 'خالد بن وليد', score: 2190, avatarId: 'char_03', rank: 3, answersCorrect: 8, totalQuestions: 10, accuracy: 80 }
    ];

    const container = document.getElementById('podiumHostStage');
    if (!container || !global.ScoreARPodiumEffects) return;

    if (typeof global.ScoreARPodiumEffects.renderHostPodium === 'function') {
      const wid = document.getElementById('unifiedPodiumWorld')?.value || 'royal';
      const celStyle = document.getElementById('unifiedPodiumStyle')?.value || 'classic';
      const room = { worldId: wid, world: { id: wid }, celebrationStyle: celStyle, players: demoPodium };
      global.ScoreARPodiumEffects.renderHostPodium(container, room, () => { closeView(); });
      if ((target === 3 || target === 2 || target === 1) && typeof global.ScoreARPodiumEffects.advanceReveal === 'function') {
        const steps = target === 3 ? 1 : (target === 2 ? 2 : 3);
        for (let s = 0; s < steps; s++) global.ScoreARPodiumEffects.advanceReveal();
      } else if (target === 'all' && typeof global.ScoreARPodiumEffects.revealAll === 'function') {
        global.ScoreARPodiumEffects.revealAll();
      } else if (target === 'cinematic' && typeof global.ScoreARPodiumEffects.startCinematicShow === 'function') {
        global.ScoreARPodiumEffects.startCinematicShow();
      }
    }
  }

  function openView(type, options = {}) {
    const stage = ensureStageElement();
    const bgMain = document.getElementById('main');
    if (bgMain && bgMain.querySelector('#avatarsGrid')) {
      bgMain.innerHTML = '';
    }
    const prevH = window.location.hash || '#home';
    if (!['#cards', '#heroes', '#characters', '#podium'].includes(prevH)) {
      returnHash = prevH;
    }

    currentView = type;
    document.body.style.overflow = 'hidden';
    stage.style.display = type === 'podium' ? 'flex' : 'block';
    stage.style.flexDirection = type === 'podium' ? 'column' : '';
    stage.scrollTop = 0;

    if (type === 'cards') {
      renderCardsView(stage);
      if (window.location.hash !== '#cards') {
        history.replaceState(null, '', '#cards');
      }
    } else if (type === 'heroes' || type === 'characters') {
      renderCharactersView(stage);
      if (window.location.hash !== '#characters' && window.location.hash !== '#heroes') {
        history.replaceState(null, '', '#characters');
      }
    } else if (type === 'podium') {
      renderPodiumView(stage);
      if (window.location.hash !== '#podium') {
        history.replaceState(null, '', '#podium');
      }
    }
    if (global.ScoreARNav && typeof global.ScoreARNav.mountTopbarNav === 'function') {
      global.ScoreARNav.mountTopbarNav();
    }
  }

  function closeView() {
    if (global.ScoreARWorldHalls?.cleanup) global.ScoreARWorldHalls.cleanup();
    if (global.ScoreARWorldCinematics?.stopEntranceFilm) global.ScoreARWorldCinematics.stopEntranceFilm();
    if (!stageElement || stageElement.style.display === 'none') return;
    stageElement.style.display = 'none';
    stageElement.style.flexDirection = '';
    stageElement.innerHTML = '';
    currentView = null;
    document.body.style.overflow = '';
    const targetH = returnHash && returnHash !== '#cards' && returnHash !== '#characters' && returnHash !== '#podium' ? returnHash : '#home';
    history.replaceState(null, '', targetH);
    if (typeof global.render === 'function') {
      global.render();
    } else if (global.ScoreARApp && typeof global.ScoreARApp.route === 'function') {
      global.ScoreARApp.route();
    }
    if (global.ScoreARNav && typeof global.ScoreARNav.mountTopbarNav === 'function') {
      global.ScoreARNav.mountTopbarNav();
    }
  }

  function isOpen() {
    return Boolean(stageElement && stageElement.style.display !== 'none');
  }

  // Intercept links targeting cards.html, characters.html, podium.html
  function attachInterceptors() {
    document.addEventListener('click', function(e) {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';

      if (href.endsWith('cards.html') || href === '#cards' || href.includes('cards.html')) {
        e.preventDefault();
        openView('cards');
      } else if (href.endsWith('characters.html') || href === '#characters' || href === '#heroes' || href.includes('characters.html')) {
        e.preventDefault();
        openView('heroes');
      } else if (href.endsWith('podium.html') || href === '#podium' || href.includes('podium.html')) {
        e.preventDefault();
        openView('podium');
      }
    }, true);

    // Keyboard ESC to close
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) {
        closeView();
      }
    });

    // Hash change handler
    window.addEventListener('hashchange', function() {
      const h = window.location.hash;
      if (h === '#cards') {
        if (!isOpen() || currentView !== 'cards') openView('cards');
      } else if (h === '#characters' || h === '#heroes') {
        if (!isOpen() || currentView !== 'heroes') openView('heroes');
      } else if (h === '#podium') {
        if (!isOpen() || currentView !== 'podium') openView('podium');
      } else if (isOpen()) {
        closeView();
      }
    });

    // Check initial hash
    const initialH = window.location.hash;
    if (initialH === '#cards') {
      setTimeout(() => { if (!isOpen() || currentView !== 'cards') openView('cards'); }, 60);
    } else if (initialH === '#characters' || initialH === '#heroes') {
      setTimeout(() => { if (!isOpen() || currentView !== 'heroes') openView('heroes'); }, 60);
    } else if (initialH === '#podium') {
      setTimeout(() => { if (!isOpen() || currentView !== 'podium') openView('podium'); }, 60);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachInterceptors);
  } else {
    attachInterceptors();
  }

  global.ScoreARUnifiedViews = {
    openView,
    closeView,
    isOpen,
    getCurrentView: () => currentView,
    renderHeroesGrid,
    filterHeroes, previewHeroPose,
    saveHeroChoice,
    simulatePodium,
    openPodiumView: () => openView('podium'),
    openCardsView: () => openView('cards'),
    openHeroesView: () => openView('heroes')
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.ScoreARUnifiedViews;
  }
})(typeof window !== 'undefined' ? window : global);
