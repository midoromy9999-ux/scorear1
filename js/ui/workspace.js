/* ScoreAR Teacher Studio & Academy - Unified Cosmic Launch Identity */
window.renderTeacherStudio = function () {
  const ui = window.ScoreARUI || {
    icon: n => (typeof window.icon === 'function' ? window.icon(n) : ''),
    iconBox: () => '',
    cosmicBackdrop: () => '',
    softNote: txt => `<div class="scorear-soft-note"><span>${txt}</span></div>`
  };
  const esc = s => (ui.escapeHtml ? ui.escapeHtml(s) : String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])));
  const ic = (name, size = 16) => ui.icon ? ui.icon(name, { size }) : (typeof window.icon === 'function' ? window.icon(name) : '');
  const ib = (name, tone = 'violet', size = 'sm') => ui.iconBox ? ui.iconBox(name, { size, tone, tilted: true }) : `<span class="tool-icon">${ic(name, 20)}</span>`;
  const authUser = window.ScoreARAuth && typeof window.ScoreARAuth.getUser === 'function' ? window.ScoreARAuth.getUser() : null;
  const teacherName = esc(authUser?.displayName || 'أ. أحمد صلاح رميح');
  const launchWorlds = "window.ScoreARWorldFlow && window.ScoreARWorldFlow.openWorldPicker ? window.ScoreARWorldFlow.openWorldPicker({ onConfirm: function(wId){ renderLiveLobby(wId, null, true, false); } }) : renderLiveLobby('royal', null, false, false)";

  const contentTools = [
    ['edit', 'إنشاء مسابقة جديدة', 'أنشئ أسئلتك وخياراتها مع الحفظ التلقائي الفوري.', "openToolModal('builder')", 'violet', 'محرر', 'assets/classroom.webp'],
    ['spark', 'مساعد الأسئلة الذكي AI', 'توليد الأسئلة بالذكاء الاصطناعي مع مراجعة دقيقة.', "openToolModal('ai')", 'cyan', 'ذكي', 'assets/cosmic.webp'],
    ['layers', 'بنك الأسئلة ومسابقاتي', 'بنك أسئلة منظم ومكتبة مسابقات خاصة بالمعلم.', "openToolModal('bank')", 'violet', 'مكتبتك', 'assets/academy.webp'],
    ['spreadsheet', 'استيراد Excel / CSV', 'استيراد سريع بنفس ترتيب الأعمدة ومعاينة حية.', "openToolModal('import')", 'cyan', 'سريع', 'assets/oasis.webp']
  ];

  const manageTools = [
    ['users', 'صفوفي وواجبات الطلاب', 'أنشئ صفوفك واقبل طلابك وتابع واجباتهم.', 'ScoreARClassrooms.openView()', 'cyan', 'الفصول', ''],
    ['chart', 'تقارير القاعة والنتائج', 'تحليلات دقيقة لنسب الصواب وتشخيص الثغرات.', "openToolModal('reports')", 'violet', 'تحليلات', ''],
    ['shield', 'إدارة المعلمين والمنصة', 'الموافقات والصلاحيات المتقدمة حسب الرتبة.', "openToolModal('teachers')", 'violet', 'إدارة', ''],
    ['sparkles', 'معرض الأبطال والكروت', 'استعرض ٢٠ بطلاً متحركاً و٢٠ كارتاً تكتيكياً.', "window.ScoreARUnifiedViews ? ScoreARUnifiedViews.openView('cards') : (window.location.href='cards.html')", 'cyan', '٢٠+٢٠', '']
  ];

  const renderGroup = (kicker, title, items, extraClass = '') => `
    <section class="studio-tool-group reveal ${extraClass}">
      <div class="studio-group-head">
        <div>
          <span class="section-kicker">${kicker}</span>
          <h2>${title}</h2>
        </div>
      </div>
      <div class="studio-tools-grid cols-4">
        ${items.map(([iconName, cardTitle, desc, onclickCode, tone, badge, artSrc]) => `
          <button type="button" class="studio-tool-card spotlight tone-${tone} ${artSrc ? 'has-art' : ''}" onclick="${onclickCode}">
            ${artSrc ? `<div class="tool-card-art"><img src="${artSrc}" alt="" loading="lazy"><div class="tool-card-art-shade"></div></div>` : ''}
            <div class="tool-card-top">
              ${ib(iconName, tone, 'sm')}
              <div class="tool-card-meta">
                <span class="tool-badge tone-${tone}">${badge}</span>
                <span class="tool-arrow" aria-hidden="true">${ic('arrow', 15)}</span>
              </div>
            </div>
            <div class="tool-card-body">
              <h4>${cardTitle}</h4>
              <p>${desc}</p>
            </div>
          </button>
        `).join('')}
      </div>
    </section>
  `;

  return `<div class="page teacher-space scorear-open-page">
    ${ui.cosmicBackdrop ? ui.cosmicBackdrop() : ''}

    <header class="studio-hero-card reveal">
      <div class="studio-hero-main">
        <div class="studio-identity">
          <div class="studio-avatar-wrap">
            <img src="assets/characters/teacher_ahmed.webp?v=20261106_real" alt="${teacherName}">
          </div>
          <div>
            <div class="launch-pill" style="margin-bottom:8px;"><span class="live-dot"></span> استوديو المعلم · ${teacherName}</div>
            <h1 class="studio-main-title">مساحة عملك، <span class="gradient-text">جاهزة للانطلاق.</span></h1>
            <p class="studio-main-sub">أنشئ مسابقتك، أدر فصولك، وأطلق قاعتك الحية من شاشة واحدة واضحة.</p>
          </div>
        </div>
        <div class="studio-hero-chips" aria-label="ملخص إمكانات القاعة">
          <span class="studio-mini-chip">${ic('planet', 14)} ٦ عوالم 2K</span>
          <span class="studio-mini-chip">${ic('trophy', 14)} ٤ أوضاع لعب</span>
          <span class="studio-mini-chip">${ic('spark', 14)} ٢٠ بطلاً وكارتاً</span>
        </div>
        <div class="studio-quick-actions">
          <button type="button" class="btn launch-primary" onclick="openToolModal('builder')">
            ${ic('plus', 17)} مسابقة جديدة
          </button>
          <button type="button" class="btn launch-student-join" onclick="${launchWorlds}">
            ${ic('planet', 17)} إطلاق قاعة حية
          </button>
        </div>
      </div>
      <div class="studio-hero-art" aria-hidden="true">
        <div class="studio-hero-scene">
          <img src="assets/classroom.webp" alt="">
          <div class="studio-hero-scene-shade"></div>
          <span class="studio-scene-tag"><span class="live-dot"></span> قاعة تفاعلية جاهزة للبث</span>
        </div>
        <img class="studio-hero-companion" src="assets/characters/char_01.webp" alt="">
      </div>
    </header>

    <div class="scorear-hairline-divider"></div>

    ${renderGroup('٠١ — التحضير والأسئلة', 'صناعة المحتوى والأسئلة', contentTools)}
    ${renderGroup('٠٢ — الإدارة والتحليل', 'إدارة الفصول والتشغيل والتحليلات', manageTools, 'studio-group-secondary')}

    <div class="studio-quick-footer reveal">
      <div class="studio-quick-note">
        ${ui.softNote
          ? ui.softNote('يمكنك إنشاء المسابقات أو إطلاق قاعة حية مباشرة في أي وقت؛ وتُحفظ فصولك وتقاريرك تلقائياً على حسابك.', 'info')
          : '<div class="scorear-soft-note"><span>تُحفظ فصولك وتقاريرك تلقائياً على حسابك.</span></div>'}
      </div>
      <a href="#academy" class="studio-mini-link">
        ${ic('play', 14)} <span>معاينة تدفق القاعة</span> ${ic('arrow', 14)}
      </a>
    </div>
  </div>`;
};

let academyStage = 0, academyAnswer = null;
const academyNames = ['الدخول', 'الانتظار', 'السؤال', 'نتيجة الجولة', 'التتويج'];
window.renderAcademy = function () {
  const ui = window.ScoreARUI || { icon: n => (typeof window.icon === 'function' ? window.icon(n) : '') };
  const ic = (n, s = 16) => ui.icon ? ui.icon(n, { size: s }) : '';
  const views = [
    `<div class="academy-intro"><span class="academy-seal">${ic('book', 30)}</span><span class="section-kicker">THE KNOWLEDGE GATE</span><h2>بوابة المعرفة</h2><p>كل سؤال مفتاح.<br>وكل فكرة تفتح عالمًا.</p><button class="btn launch-primary" data-academy="1">ادخل المعاينة ${ic('arrow', 16)}</button></div>`,
    `<div class="academy-intro"><span class="section-kicker">المغامرة تبدأ معًا</span><h2>مكانك بين الأبطال.</h2><p>في القاعة الفعلية يظهر رمز الانضمام والطلاب المتصلون هنا.</p><div class="academy-heroes"><span>✦</span><span>✧</span><span>✦</span></div><button class="btn launch-primary" data-academy="2">شاهد شاشة السؤال ${ic('arrow', 16)}</button></div>`,
    `<div class="academy-question"><div class="academy-question-top"><span>تجربة سؤال / اللغة العربية</span><span>${ic('book', 15)} النعت</span></div><h2>«قرأتُ كتابًا ممتعًا»</h2><p>ما إعراب «ممتعًا»؟</p><div class="academy-answers">${['حال منصوب', 'نعت منصوب', 'مفعول به منصوب', 'خبر مرفوع'].map((t, i) => `<button data-academy-answer="${i}"><span>${['أ', 'ب', 'ج', 'د'][i]}</span>${t}</button>`).join('')}</div></div>`,
    `<div class="academy-intro"><span class="academy-seal">${ic(academyAnswer === 1 ? 'check' : 'book', 30)}</span><span class="section-kicker">لحظة فهم</span><h2>${academyAnswer === null ? 'الإجابة: نعت منصوب' : academyAnswer === 1 ? 'أحسنت، فتحت بابًا جديدًا!' : 'خلّينا نفهمها معًا.'}</h2><p>«ممتعًا» تصف الكتاب وتتبعُه في النصب والتنكير؛ لذلك فهي نعت منصوب.</p><button class="btn launch-primary" data-academy="4">شاهد التتويج ${ic('arrow', 16)}</button></div>`,
    `<div class="academy-intro"><span class="academy-seal gold">${ic('trophy', 30)}</span><span class="section-kicker">كل خطوة تستحق الاحتفال</span><h2>المعرفة هي المكسب.</h2><p>هنا تُعرض نتائج القاعة وأبطالها بعد نهاية المسابقة.</p><button class="btn launch-primary" onclick="window.ScoreARWorldFlow && window.ScoreARWorldFlow.openWorldPicker ? window.ScoreARWorldFlow.openWorldPicker({ onConfirm: function(wId){ renderLiveLobby(wId, null, true, false); } }) : renderLiveLobby('royal', null, false, false)">جهّز منافسة فعلية الآن ${ic('arrow', 16)}</button></div>`
  ];
  return `<div class="page academy-page scorear-open-page">
    <div class="scorear-editorial-head">
      <div class="scorear-editorial-copy">
        <span class="launch-pill"><span class="live-dot"></span> معاينة التصميم</span>
        <h1>عالم واحد. <span class="gradient-text">خمس لحظات.</span></h1>
        <p>تنقّل بين شاشات القاعة التفاعلية.</p>
      </div>
      <div class="scorear-editorial-side"><a href="#studio" class="btn launch-outline small">${ic('arrow', 15)} العودة للاستوديو</a></div>
    </div>
    <nav class="academy-tabs" aria-label="شاشات القاعة">${academyNames.map((t, i) => `<button data-academy="${i}" aria-pressed="${i === academyStage}"><span>0${i + 1}</span>${t}</button>`).join('')}</nav>
    <section class="academy-stage" aria-live="polite"><div class="academy-top"><span>✦ بوابة المعرفة</span><span>معاينة مستقلة</span></div>${views[academyStage]}</section>
  </div>`;
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-academy],[data-academy-answer]');
  if (!b) return;
  if (b.hasAttribute('data-academy-answer')) {
    academyAnswer = Number(b.dataset.academyAnswer);
    academyStage = 3;
  } else {
    academyStage = Number(b.dataset.academy);
    if (academyStage === 0 || academyStage === 2) academyAnswer = null;
  }
  if (academyStage < 0 || academyStage > 4) academyStage = 0;
  render();
  document.querySelector('.academy-stage')?.scrollIntoView({ block: 'nearest' });
});
