/* ScoreAR Teacher Studio & Academy - Unified Cosmic Launch Identity */
window.renderTeacherStudio = function () {
  const ui = window.ScoreARUI || {
    icon: n => (typeof window.icon === 'function' ? window.icon(n) : ''),
    iconBox: () => '',
    cosmicBackdrop: () => '',
    softNote: txt => `<div class="scorear-soft-note"><span>${txt}</span></div>`
  };
  const ic = (name, size = 16) => ui.icon ? ui.icon(name, { size }) : (typeof window.icon === 'function' ? window.icon(name) : '');
  const ib = (name, tone = 'violet', size = 'md') => ui.iconBox ? ui.iconBox(name, { size, tone, tilted: true }) : `<span class="tool-icon">${ic(name, 20)}</span>`;
  const launchWorlds = "window.ScoreARWorldFlow && window.ScoreARWorldFlow.openWorldPicker ? window.ScoreARWorldFlow.openWorldPicker({ onConfirm: function(wId){ renderLiveLobby(wId, null, true, false); } }) : renderLiveLobby('royal', null, false, false)";

  const tools = [
    ['edit', 'إنشاء مسابقة جديدة', 'أنشئ أسئلتك وخياراتها مع الحفظ التلقائي الفوري.', 'builder', 'violet', null],
    ['spark', 'مساعد الأسئلة الذكي AI', 'توليد الأسئلة بالذكاء الاصطناعي مع مراجعة دقيقة.', 'ai', 'cyan', null],
    ['layers', 'بنك الأسئلة الشامل', 'بنك أسئلة منظم ومكتبة مسابقات خاصة بالمعلم.', 'bank', 'violet', null],
    ['users', 'صفوفي وواجبات الطلاب', 'أنشئ صفوفك واقبل طلابك وتابع واجباتهم.', 'classes', 'cyan', 'ScoreARClassrooms.openView()'],
    ['spreadsheet', 'استيراد Excel / CSV', 'استيراد سريع بنفس ترتيب الأعمدة ومعاينة حية.', 'import', 'violet', null],
    ['chart', 'تقارير القاعة والنتائج', 'تحليلات دقيقة لنسب الصواب وتشخيص الثغرات.', 'reports', 'cyan', null],
    ['shield', 'إدارة المعلمين والمنصة', 'الموافقات والصلاحيات المتقدمة حسب الرتبة.', 'teachers', 'violet', null]
  ];

  return `<div class="page teacher-space scorear-open-page">
    ${ui.cosmicBackdrop ? ui.cosmicBackdrop() : ''}

    <!-- STUDIO TOP EDITORIAL IDENTITY BAR -->
    <div class="studio-heading reveal">
      <div class="studio-identity">
        <div class="studio-avatar-wrap">
          <img src="assets/characters/teacher_ahmed.webp?v=20261106_real" alt="أ. أحمد صلاح رميح">
        </div>
        <div>
          <div class="launch-pill" style="margin-bottom:10px;"><span class="live-dot"></span> مساحتك للإلهام · أ. أحمد صلاح رميح</div>
          <h1 class="studio-main-title">كل حصة، <span class="gradient-text">فرصة جديدة.</span></h1>
          <p class="studio-main-sub">محتواك وأدواتك في مكان واحد. ابدأ بخطوة، وكمّل بطريقتك وبأعلى معايير التفاعل.</p>
        </div>
      </div>
      <div class="studio-quick-actions">
        <button type="button" class="btn launch-primary" onclick="${launchWorlds}">
          ${ic('planet', 17)} قاعة المنافسات الحية
        </button>
        <button type="button" class="btn launch-outline" onclick="window.ScoreARClassrooms?.openView?.()">
          ${ic('users', 16)} صفوفي وطلابي
        </button>
        <a href="characters.html" class="btn launch-outline">
          ${ic('spark', 16)} الأبطال
        </a>
        <a href="cards.html" class="btn launch-outline">
          ${ic('layers', 16)} الكروت
        </a>
      </div>
    </div>

    <div class="scorear-hairline-divider"></div>

    <!-- TEACHER HERO BANNER -->
    <section class="teacher-banner spotlight reveal">
      <img src="assets/classroom.webp" alt="معلم مصري كرتوني مع طلابه وكتاب المعرفة">
      <div class="teacher-banner-overlay"></div>
      <div class="teacher-banner-content">
        <div class="launch-pill" style="margin-bottom:14px;"><span class="live-dot"></span> استوديو المعلم المتقدم</div>
        <h2>إنت تصنع الفكرة.<br><span class="gradient-text">وهم يعيشوا المغامرة.</span></h2>
        <p>من أول سؤال في ملف الدرس إلى آخر لحظة اكتشاف وتتويج على منصة الأبطال.</p>
        <div class="studio-banner-ctas">
          <button type="button" class="btn launch-primary" onclick="openToolModal('builder')">
            ${ic('edit', 17)} إنشاء مسابقة جديدة وبدء التحدي
          </button>
          <button type="button" class="btn launch-outline" onclick="${launchWorlds}">
            ${ic('planet', 17)} فتح قاعة اللوبي المباشرة
          </button>
        </div>
      </div>
    </section>

    <!-- 3 STEPS JOURNEY -->
    <div class="launch-section-heading reveal" style="margin-top:46px;margin-bottom:24px;">
      <div>
        <span class="section-kicker">٠١ — مسار الحصة المتكامل</span>
        <h2 style="font-size:clamp(24px,3vw,34px);font-weight:900;color:#f6f3ff;">حصة كاملة.<br><span class="gradient-text">ثلاث خطوات سهلة ومباشرة.</span></h2>
      </div>
      <p style="color:#aaa9c1;font-size:13px;line-height:1.8;">اختر المهمة التي تحتاجها الآن للانطلاق مع فصولك.</p>
    </div>

    <div class="studio-steps">
      <div class="studio-step spotlight reveal" onclick="openToolModal('bank')" style="cursor:pointer;">
        <span class="experience-num">٠١ / للتحضير</span>
        <div style="margin-bottom:14px;">${ib('book', 'violet', 'md')}</div>
        <h3>جهّز المحتوى</h3>
        <p>بنك الأسئلة الشامل ومكتبة مسابقاتي الخاصة مع أدوات المراجعة والحفظ التلقائي.</p>
        <span class="experience-link">افتح مكتبتي وبنك الأسئلة ${ic('arrow', 15)}</span>
      </div>

      <div class="studio-step tone-cyan spotlight reveal" onclick="${launchWorlds}" style="cursor:pointer;">
        <span class="experience-num">٠٢ / للانطلاق</span>
        <div style="margin-bottom:14px;">${ib('planet', 'cyan', 'md')}</div>
        <h3>أطلق المنافسة</h3>
        <p>اختر نشاطك وعالمك الكرتوني، واجمع طلابك في اللوبي بانتظار 3D حي وتحدٍ فوري.</p>
        <span class="experience-link" style="color:#7be8dc;">انطلاق القاعة فوراً ${ic('arrow', 15)}</span>
      </div>

      <div class="studio-step spotlight reveal" onclick="openToolModal('reports')" style="cursor:pointer;">
        <span class="experience-num">٠٣ / للتحليل</span>
        <div style="margin-bottom:14px;">${ib('chart', 'violet', 'md')}</div>
        <h3>افهم النتائج</h3>
        <p>نسب صواب الأسئلة الفعلية وتشخيص الأسئلة الأضعف ومتابعة مسودات وتقارير الطلاب.</p>
        <span class="experience-link">افتح التقارير والتحليلات ${ic('arrow', 15)}</span>
      </div>
    </div>

    <!-- STUDIO FAST TOOLS & ACADEMY TEASER -->
    <div class="studio-bottom" style="margin-top:40px;">
      <section class="studio-tools-panel reveal">
        <div class="tools-head">
          <div>
            <span class="section-kicker">٠٢ — أدوات المعلم</span>
            <h2 style="font-size:24px;font-weight:900;color:#ffffff;margin:4px 0 0;">أدوات الإعداد السريعة</h2>
          </div>
          <span class="launch-pill"><span class="live-dot"></span> منشئ المسابقات الحقيقي</span>
        </div>

        <div class="studio-tools-grid">
          ${tools.map(([iconName, title, desc, route, tone, customClick]) => `
            <button type="button" class="studio-tool-card spotlight" onclick="${customClick || `openToolModal('${route}')`}">
              <div class="tool-card-top">
                ${ib(iconName, tone, 'sm')}
                <span class="tool-arrow" aria-hidden="true">${ic('arrow', 15)}</span>
              </div>
              <div class="tool-card-body">
                <h4>${title}</h4>
                <p>${desc}</p>
              </div>
            </button>
          `).join('')}
        </div>
      </section>

      <a href="#academy" class="academy-teaser spotlight reveal">
        <img src="assets/academy.webp" alt="أكاديمية المعرفة العائمة">
        <div class="academy-teaser-overlay"></div>
        <div class="academy-teaser-content">
          <span class="section-kicker" style="color:#52d9ed;">٠٣ — بوابة المعرفة</span>
          <h2>وراء البوابة،<br><span class="gradient-text">حكاية تنتظر.</span></h2>
          <p>استكشف تصميم الدخول والانتظار والسؤال والنتيجة ومنصة التتويج ثلاثية الأبعاد.</p>
          <span class="experience-link" style="color:#7be8dc;">جرّب معاينة بوابة المعرفة ${ic('arrow', 15)}</span>
        </div>
      </a>
    </div>

    <div class="reveal" style="margin-top:28px;">
      ${ui.softNote
        ? ui.softNote('تُفتح أدوات الحساب بعد تسجيل الدخول. يمكنك بدء المسابقات في أي وقت وتعديل خياراتها وتخصيص تجربة فصولك بحرية تامة.', 'info')
        : '<div class="scorear-soft-note"><span>تُفتح أدوات الحساب بعد تسجيل الدخول.</span></div>'}
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
