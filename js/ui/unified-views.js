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
      <header class="gallery-header" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(12,13,29,0.92);backdrop-filter:blur(16px);position:sticky;top:0;z-index:100;">
        <div style="display:flex;align-items:center;gap:14px;">
          <button type="button" class="btn-gallery-back" onclick="ScoreARUnifiedViews.closeView()" style="display:inline-flex;align-items:center;gap:8px;background:rgba(142,100,239,0.22);border:1px solid rgba(142,100,239,0.45);color:#fff;border-radius:12px;padding:8px 18px;font-size:13px;font-weight:900;cursor:pointer;font-family:inherit;transition:all 0.2s;" aria-label="الرجوع الفوري">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>عودة</span>
          </button>
          <div class="gallery-brand" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:#ffffff;">
            <img src="assets/mark.svg" alt="" width="36" height="36" style="filter:drop-shadow(0 0 10px rgba(117,80,239,0.5));">
            <div>
              <b style="font-family:Cairo,sans-serif;font-size:20px;font-weight:900;display:block;line-height:1.1;">سكور آر<span style="color:#f59e0b;">.</span></b>
              <small style="display:block;font-size:8px;letter-spacing:2px;color:#a1a4be;">LEARN. PLAY. BECOME.</small>
            </div>
          </div>
        </div>

        <div class="gallery-desktop-actions" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <button type="button" onclick="ScoreARUnifiedViews.openView('cards')" style="display:inline-flex;align-items:center;gap:6px;background:${isCards ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.08)'};border:1px solid ${isCards ? '#f59e0b' : 'rgba(255,255,255,0.15)'};color:#fff;border-radius:12px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">🃏 قاعة الكروت (٢٠)</button>
          <button type="button" onclick="ScoreARUnifiedViews.openView('heroes')" style="display:inline-flex;align-items:center;gap:6px;background:${isHeroes ? 'linear-gradient(135deg,#7550ef,#582cd1)' : 'rgba(255,255,255,0.08)'};border:1px solid ${isHeroes ? '#7550ef' : 'rgba(255,255,255,0.15)'};color:#fff;border-radius:12px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">✨ قاعة الأبطال (٢٠)</button>
          <button type="button" onclick="ScoreARUnifiedViews.openView('podium')" style="display:inline-flex;align-items:center;gap:6px;background:${isPodium ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.08)'};border:1px solid ${isPodium ? '#10b981' : 'rgba(255,255,255,0.15)'};color:#fff;border-radius:12px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">👑 منصة التتويج</button>
          <button type="button" onclick="ScoreARUnifiedViews.closeView()" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;border-radius:12px;padding:8px 12px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;" title="إغلاق العرض المدمج">✕ إغلاق</button>
        </div>
      </header>
    `;
  }

  function renderCardsView(container) {
    container.innerHTML = `
      ${getUnifiedHeaderHtml('cards', 'قاعة الكروت التكتيكية', '٢٠ كارت ذكاء استراتيجي يقلب موازين القاعة')}
      <main class="character-gallery-page" style="max-width:1240px;margin:0 auto;padding:24px 20px 60px;">
        <div class="gallery-title-area" style="margin:20px 0 24px;">
          <div class="eyebrow" style="margin-bottom:8px;color:#f59e0b;font-weight:900;">🃏 موسوعة حرب الكروت التكتيكية</div>
          <h1 style="font-family:Cairo,sans-serif;font-size:clamp(26px, 3.6vw, 40px);font-weight:900;margin:8px 0;color:#ffffff;">ترسانة الـ ٢٠ كارت.. ذكاء تكتيكي يقلب موازين القاعة.</h1>
          <p style="color:#b1a2e9;font-size:14px;max-width:740px;line-height:1.8;margin:0;">تعرّف على أسرار كل كارت في طور حرب الكروت (Card Arena): من انقلاب المراكز بالكامل وسرقة النقاط، إلى فخاخ مرآة القاضي والصد العكسي التلقائي والدروع الذهبية ومساعدات الـ 50/50.</p>
        </div>

        <div class="character-picker cards-picker-layout" style="display:grid;grid-template-columns:320px minmax(0,1fr);gap:24px;align-items:start;">
          <!-- ASIDE PREVIEW -->
          <aside class="character-stage" aria-label="معاينة الكارت التفاعلي" style="width:100%;box-sizing:border-box;background:radial-gradient(ellipse at 50% 50%, rgba(142, 100, 239, 0.25), transparent 70%), linear-gradient(160deg, #1d1a36, #111326);border:1px solid rgba(142, 100, 239, 0.3);border-radius:24px;box-shadow:0 15px 40px rgba(0,0,0,0.5);padding:24px 20px;">
            <small style="color:#fcd34d;font-weight:900;letter-spacing:1px;display:block;margin-bottom:12px;text-align:center;">✦ الكارت التكتيكي المختار ✦</small>
            <div id="cardPreviewBox" style="width:100%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"></div>
            <div id="cardPreviewInfo" aria-live="polite"></div>
          </aside>

          <!-- COLLECTION & TABS -->
          <div class="character-collection" style="min-width:0;width:100%;">
            <div class="character-section-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
              <h4 style="font-size:20px;font-weight:900;color:#ffffff;margin:0;">ترسانة الكروت الرسمية</h4>
              <span style="background:rgba(245,158,11,0.2);color:#fcd34d;border:1px solid rgba(245,158,11,0.4);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:900;">٢٠ كارت تكتيكي متوازن</span>
            </div>

            <div class="character-tabs" aria-label="فئات الكروت" style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
              <button type="button" id="cardTab-all" onclick="ScoreARCardsGallery.filterCards('all')" aria-pressed="true" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">الكل · ٢٠</button>
              <button type="button" id="cardTab-game_changer" onclick="ScoreARCardsGallery.filterCards('game_changer')" aria-pressed="false" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">نقاط وانقلاب · ٥</button>
              <button type="button" id="cardTab-attack" onclick="ScoreARCardsGallery.filterCards('attack')" aria-pressed="false" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">هجوم وتعطيل · ٥</button>
              <button type="button" id="cardTab-defense" onclick="ScoreARCardsGallery.filterCards('defense')" aria-pressed="false" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">دروع وفخاخ · ٥</button>
              <button type="button" id="cardTab-boost" onclick="ScoreARCardsGallery.filterCards('boost')" aria-pressed="false" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">تعزيز ومكافآت · ٥</button>
            </div>

            <div id="cardsGrid" class="cards-grid-layout" role="region" aria-label="شبكة كروت اللعبة" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:14px;"></div>
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
      <main class="character-gallery-page" style="max-width:1200px;margin:0 auto;padding:24px 20px 60px;">
        <div class="gallery-title-area" style="margin:20px 0 24px;">
          <div class="eyebrow" style="margin-bottom:8px;color:#52d9ed;font-weight:900;">✨ مستودع الأبطال الرسمي</div>
          <h1 style="font-family:Cairo,sans-serif;font-size:clamp(26px, 3.6vw, 42px);font-weight:900;margin:8px 0;color:#ffffff;">أبطال سكور آر.. ٢٠ رفيقاً كرتونياً للمغامرة والتعلم.</h1>
          <p style="color:#b1a2e9;font-size:14px;max-width:720px;line-height:1.8;margin:0;">اختر رفيقك في الحصص الحية والمنافسات اليومية. يملك كل بطل حركة تنفس مشوقة وتأثيرات تتويج فريدة تميزك داخل القاعة.</p>
        </div>

        <div class="character-picker" style="display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px;align-items:start;">
          <!-- PREVIEW ASIDE -->
          <aside class="character-stage" aria-label="معاينة البطل التفاعلي" style="background:radial-gradient(ellipse at 50% 50%, rgba(142, 100, 239, 0.25), transparent 70%), linear-gradient(160deg, #1d1a36, #111326);border:1px solid rgba(142, 100, 239, 0.3);border-radius:24px;box-shadow:0 15px 40px rgba(0,0,0,0.5);padding:24px 20px;text-align:center;">
            <small style="color:#a78bfa;font-weight:800;letter-spacing:1px;display:block;margin-bottom:12px;">✦ البطل المختار حالياً ✦</small>
            <div id="studentCustomPreviewBox" style="width:200px;height:250px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;"></div>
            <div id="studentCustomPreviewTitle"><h3 style="font-family:Cairo,sans-serif;font-size:22px;color:#fff;margin:6px 0;"></h3></div>
            <p id="studentCustomPreviewDesc" style="color:#c5c7de;font-size:13px;line-height:1.6;margin:6px 0 10px;"></p>
            <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:5px;margin-bottom:14px;">
              <button type="button" data-character-pose="idle" onclick="ScoreARUnifiedViews.previewHeroPose('idle')" style="background:#262044;border:1px solid #8e64ef;color:#fff;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">🧍 وقوف</button>
              <button type="button" data-character-pose="walk" onclick="ScoreARUnifiedViews.previewHeroPose('walk')" style="background:#19192f;border:1px solid rgba(255,255,255,0.15);color:#d9d4ed;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;">🚶 مشي</button>
              <button type="button" data-character-pose="run" onclick="ScoreARUnifiedViews.previewHeroPose('run')" style="background:#19192f;border:1px solid rgba(255,255,255,0.15);color:#d9d4ed;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;">🏃 جري</button>
              <button type="button" data-character-pose="climb" onclick="ScoreARUnifiedViews.previewHeroPose('climb')" style="background:#19192f;border:1px solid rgba(255,255,255,0.15);color:#d9d4ed;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;">🧗 تسلق</button>
              <button type="button" data-character-pose="fly" onclick="ScoreARUnifiedViews.previewHeroPose('fly')" style="background:#19192f;border:1px solid rgba(255,255,255,0.15);color:#d9d4ed;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;">🚀 طيران</button>
              <button type="button" data-character-pose="celebrate" onclick="ScoreARUnifiedViews.previewHeroPose('celebrate')" style="background:#19192f;border:1px solid rgba(255,255,255,0.15);color:#d9d4ed;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;">🎉 احتفال</button>
            </div>
            <button type="button" id="btnSelectHero" onclick="ScoreARUnifiedViews.saveHeroChoice()" style="width:100%;background:linear-gradient(135deg,#7550ef,#582cd1);color:#fff;border:none;border-radius:14px;padding:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 6px 20px rgba(117,80,239,0.4);font-family:inherit;">اعتماد هذا البطل لشخصيتي ⭐</button>
          </aside>

          <!-- GRID -->
          <div class="character-collection" style="min-width:0;width:100%;">
            <div class="character-section-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
              <h4 style="font-size:20px;font-weight:900;color:#ffffff;margin:0;">قائمة الأبطال الـ ٢٠</h4>
              <span style="background:rgba(117,80,239,0.25);color:#c4b5fd;border:1px solid rgba(117,80,239,0.4);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:800;">جاهزون للحصص الحية</span>
            </div>

            <div class="character-tabs" aria-label="فئات الأبطال" style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
              <button type="button" id="charTab-all" onclick="ScoreARUnifiedViews.filterHeroes('all')" aria-pressed="true" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">الكل · ٢٠</button>
              <button type="button" id="charTab-human" onclick="ScoreARUnifiedViews.filterHeroes('human')" aria-pressed="false" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">البشر · ٨</button>
              <button type="button" id="charTab-animal" onclick="ScoreARUnifiedViews.filterHeroes('animal')" aria-pressed="false" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">الحيوانات · ٦</button>
              <button type="button" id="charTab-fantasy" onclick="ScoreARUnifiedViews.filterHeroes('fantasy')" aria-pressed="false" style="background:#181930;border:1px solid rgba(255,255,255,0.1);color:#b5b1cf;border-radius:12px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">الخياليون · ٦</button>
            </div>

            <div id="avatarsGrid" class="character-grid" role="region" aria-label="أبطال سكور آر" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;"></div>
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
    if (global.ScoreARCharacters && typeof global.ScoreARCharacters.preview === 'function') {
      global.ScoreARCharacters.preview(global._unifiedHeroSelected || 1, global._unifiedHeroPose);
    }
  }

  function filterHeroes(cat) {
    global._unifiedHeroCategory = cat;
    ['all', 'human', 'animal', 'fantasy'].forEach(c => {
      const btn = document.getElementById('charTab-' + c);
      if (btn) btn.setAttribute('aria-pressed', String(c === cat));
    });
    renderHeroesGrid();
  }

  function saveHeroChoice() {
    if (!global._unifiedHeroSelected || !global.ScoreARCharacters) return;
    const hero = global.ScoreARCharacters.all().find(h => h.id === global._unifiedHeroSelected);
    if (!hero) return;
    try {
      const profile = JSON.parse(localStorage.getItem('scorear_student_profile_v1') || '{}');
      profile.avatarId = hero.code;
      localStorage.setItem('scorear_student_profile_v1', JSON.stringify(profile));
      if (global.toast) global.toast(`✨ تم اعتماد البطل (${hero.nameAr}) بنجاح!`);
    } catch(e){}
  }

  function renderPodiumView(container) {
    container.innerHTML = `
      ${getUnifiedHeaderHtml('podium', 'منصة التتويج الاحتفالية الكبرى 👑', 'المحاكاة الاحتفالية للتتويج وتكريم الأبطال')}
      <div style="padding:14px 20px;background:rgba(18,20,42,0.95);border-bottom:1px solid rgba(142,100,239,0.3);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-weight:900;color:#fcd34d;font-size:14px;">🎬 محاكاة التتويج:</span>
          <button type="button" class="btn small" onclick="ScoreARUnifiedViews.simulatePodium('cinematic')" style="background:linear-gradient(135deg,#8b5cf6,#4f46e5);color:#fff;border:none;border-radius:10px;padding:7px 14px;font-weight:900;cursor:pointer;font-family:inherit;">🎬 عرض سينمائي</button>
          <button type="button" class="btn small" onclick="ScoreARUnifiedViews.simulatePodium(3)" style="background:#b45309;color:#fff;border:none;border-radius:10px;padding:7px 14px;font-weight:800;cursor:pointer;font-family:inherit;">🥉 المركز الثالث</button>
          <button type="button" class="btn small" onclick="ScoreARUnifiedViews.simulatePodium(2)" style="background:#475569;color:#fff;border:none;border-radius:10px;padding:7px 14px;font-weight:800;cursor:pointer;font-family:inherit;">🥈 المركز الثاني</button>
          <button type="button" class="btn small" onclick="ScoreARUnifiedViews.simulatePodium(1)" style="background:#d97706;color:#fff;border:none;border-radius:10px;padding:7px 14px;font-weight:800;cursor:pointer;font-family:inherit;">🥇 المركز الأول</button>
          <button type="button" class="btn small" onclick="ScoreARUnifiedViews.simulatePodium('all')" style="background:#7550ef;color:#fff;border:none;border-radius:10px;padding:7px 14px;font-weight:800;cursor:pointer;font-family:inherit;">⚡ كشف الكل</button>
        </div>
        <div>
          <button type="button" onclick="ScoreARPodiumEffects?.toggleAudioMute?.()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:6px 12px;border-radius:10px;font-size:13px;cursor:pointer;">🔊 الصوت</button>
        </div>
      </div>
      <style>
        #unifiedPodiumStage { position:relative;width:100%;height:max(530px, calc(100dvh - 118px));min-height:530px;background:#080914;overflow:hidden;display:flex;flex-direction:column; }
        #unifiedPodiumStage #podiumCameraRig { transform: scale(0.84); transform-origin: bottom center; }
        @media (max-height: 780px) and (min-width: 901px) {
          .scorear-unified-stage .gallery-header { padding: 10px 20px !important; }
          #unifiedPodiumStage { height: max(510px, calc(100dvh - 114px)); min-height: 510px; }
          #unifiedPodiumStage #podiumCameraRig { transform: scale(0.64); transform-origin: bottom center; }
        }
        @media (max-width: 640px) {
          .scorear-unified-stage .gallery-header { padding: 10px 14px !important; position: relative !important; }
          .scorear-unified-stage .gallery-header h1, .scorear-unified-stage .gallery-header h2 { font-size: 16px !important; }
          #unifiedPodiumStage { height: auto !important; min-height: 700px !important; }
          #unifiedPodiumStage #podiumStageRoot main { min-height: 360px !important; }
          #unifiedPodiumStage #podiumCameraRig { transform: scale(0.56) !important; transform-origin: bottom center !important; }
        }
      </style>
      <div id="unifiedPodiumStage">
        <div id="podiumHostStage" class="podium-canvas-area" style="position:relative;width:100%;height:100%;flex:1;display:flex;flex-direction:column;"></div>
      </div>
    `;

    setTimeout(() => {
      simulatePodium('all');
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
      const room = { worldId: 'royal', world: { id: 'royal' }, players: demoPodium };
      global.ScoreARPodiumEffects.renderHostPodium(container, room, () => { closeView(); });
      if (target === 3 && typeof global.ScoreARPodiumEffects.advanceReveal === 'function') {
        global.ScoreARPodiumEffects.advanceReveal();
      } else if (target === 'all' && typeof global.ScoreARPodiumEffects.revealAll === 'function') {
        global.ScoreARPodiumEffects.revealAll();
      } else if (target === 'cinematic' && typeof global.ScoreARPodiumEffects.startCinematicShow === 'function') {
        global.ScoreARPodiumEffects.startCinematicShow();
      }
    }
  }

  function openView(type, options = {}) {
    const stage = ensureStageElement();
    const prevH = window.location.hash || '#home';
    if (!['#cards', '#heroes', '#characters', '#podium'].includes(prevH)) {
      returnHash = prevH;
    }

    currentView = type;
    document.body.style.overflow = 'hidden';
    stage.style.display = 'block';
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
    if (!stageElement || stageElement.style.display === 'none') return;
    stageElement.style.display = 'none';
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
      setTimeout(() => openView('cards'), 60);
    } else if (initialH === '#characters' || initialH === '#heroes') {
      setTimeout(() => openView('heroes'), 60);
    } else if (initialH === '#podium') {
      setTimeout(() => openView('podium'), 60);
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
