/**
 * ScoreAR Launch Home Presentation (js/ui/launch.js)
 * Clean RTL Arabic landing experience preserving cosmic visual identity.
 */
window.renderLaunchHome = function () {
  return `
    <div class="launch-page">
      <header class="launch-nav">
        <a class="launch-brand" href="#home" aria-label="سكور آر الرئيسية">
          <img src="assets/mark.svg" width="50" height="50" alt="">
          <span>سكور آر<small>تعلّم · <span>نافس</span> · تميّز</small></span>
        </a>
        <nav aria-label="استكشف سكور آر">
          <a href="#studio">للمعلّم</a>
          <a href="#journey">للطالب</a>
          <a href="#classrooms">صفوفي</a>
          <a href="#worlds">العوالم</a>
          <a href="#library">المحتوى</a>
        </nav>
        <div class="launch-nav-actions">
          <button type="button" class="scorear-theme-toggle" data-action="toggle-theme" aria-pressed="${typeof document !== 'undefined' && document.documentElement?.getAttribute?.('data-theme') === 'day' ? 'true' : 'false'}" title="تبديل الوضع النهاري / الليلي">${icon(typeof document !== 'undefined' && document.documentElement?.getAttribute?.('data-theme') === 'day' ? 'moon' : 'sun')}<span>${typeof document !== 'undefined' && document.documentElement?.getAttribute?.('data-theme') === 'day' ? 'ليلي' : 'نهاري'}</span></button>
          <button class="nav-join" data-action="join">${icon('key')} دخول القاعة بالرمز</button>
          <button class="btn launch-primary" data-action="unified-login">دخول / حساب جديد ${icon('arrow')}</button>
          <button class="icon-btn launch-menu" data-action="menu" aria-label="فتح القائمة">${icon('menu')}</button>
        </div>
      </header>

      <section class="launch-hero" id="launchHero">
        <div class="aurora" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="hero-grid" aria-hidden="true"></div>

        <div class="launch-hero-inner">
          <div class="launch-copy">
            <div class="launch-copy-bg" aria-hidden="true">
              <img src="assets/students.webp" alt="" loading="eager">
            </div>
            <div class="launch-pill reveal"><span class="live-dot"></span>تعليم عربي. بروح جيل جديد. ${icon('spark')}</div>
            <h1 class="reveal">الحصة تبدأ هنا.<br><span class="gradient-text">والحكاية معاك.</span></h1>
            <p class="launch-description reveal">
              حوّل فضول طلابك إلى مشاركة، والمشاركة إلى معرفة.<br>
              مسابقات حيّة، ٤ أوضاع تنافسية، ورحلة تعلّم لها معنى.
            </p>
            <div class="launch-ctas reveal">
              <a href="#studio" class="btn launch-primary big">ابدأ كمعلم ${icon('arrow')}</a>
              <button type="button" class="btn launch-student-join big" data-action="join">${icon('key')} دخول القاعة بالرمز</button>
              <button class="launch-watch" data-action="intro">
                <span>${icon('play')}</span>
                <div>
                  <b>شاهد سكور آر</b>
                  <small>العرض التعريفي · ٢٤ ثانية</small>
                </div>
              </button>
            </div>
            <div class="launch-footnote reveal">
              <span>${icon('book')} بالعربية · RTL</span>
              <span>${icon('trophy')} ٤ أوضاع منافسة حيّة</span>
              <span>${icon('users')} للمعلم والطالب</span>
            </div>
          </div>

          <div class="launch-visual">
            <div class="orbital-ring" aria-hidden="true"></div>
            <div class="student-photo" data-tilt>
              <img src="assets/students.webp" alt="طلاب سكور آر يتفاعلون في مسابقة تعليمية حية" width="1536" height="1024" fetchpriority="high">
              <div class="photo-shade"></div>
              <div class="photo-label"><span class="live-dot"></span>هنا، كل طالب جزء من الحكاية</div>
            </div>
            <div class="floating-question spotlight">
              <div class="fq-top">
                <span>${icon('book')} لحظة اكتشاف</span>
                <span>جرّبها بنفسك</span>
              </div>
              <h3>«العلم نور»... تشبيه ولا استعارة؟</h3>
              <div class="fq-answers">
                <button data-action="heroanswer" data-value="correct">تشبيه بليغ</button>
                <button data-action="heroanswer" data-value="wrong">استعارة مكنية</button>
              </div>
              <div id="heroAnswer" class="fq-result" aria-live="polite">إجابة واحدة، وفكرة أوضح.</div>
            </div>
            <div class="floating-spark spark-one" aria-hidden="true">✦</div>
            <div class="floating-spark spark-two" aria-hidden="true">✧</div>
          </div>
        </div>

        <div class="hero-bottom">
          <span>تجربة واحدة. احتمالات أكثر.</span>
          <button data-action="scrollsection" data-target="launchExperiences" aria-label="استكشف مسارات المنصة">${icon('arrow')} مسارات المنصة</button>
          <div class="scroll-line" aria-hidden="true"></div>
        </div>
      </section>

      <section class="launch-experiences launch-section" id="launchExperiences">
        <div class="launch-section-heading reveal">
          <div>
            <span class="section-kicker">✦ مسارات المنصة · خطوتك التالية</span>
            <h2>اختر دورك،<br><span class="gradient-text">وانطلق في ثوانٍ.</span></h2>
          </div>
          <p>مسار واضح للمعلّم، قاعة حماسية للمنافسة،<br>ورحلة تعلّم هادئة للطالب.</p>
        </div>

        <div class="experience-grid">
          <a href="#studio" class="experience-card teacher-card spotlight reveal">
            <img src="assets/classroom.webp" alt="معلم يدير نشاطاً تعليمياً تفاعلياً مع طلابه" loading="lazy">
            <div class="experience-overlay"></div>
            <span class="experience-num">٠١ / للمعلّم</span>
            <div class="experience-content">
              <span class="experience-icon">${icon('grid')}</span>
              <h3>استوديو<br>المعلّم.</h3>
              <p>ابنِ مسابقاتك بالذكاء الاصطناعي أو Excel، وأدر صفوفك وتقاريرك في مكان واحد.</p>
              <span class="experience-link">ادخل استوديو المعلم ${icon('arrow')}</span>
            </div>
          </a>

          <a href="#worlds" class="experience-card play-card spotlight reveal">
            <span class="experience-num">٠٢ / للمنافسة</span>
            <div class="orb-display" aria-hidden="true">
              <div class="orb-core">${icon('trophy')}</div>
              <span></span><span></span><span></span>
            </div>
            <div class="experience-content">
              <h3>قاعة<br>المنافسات الحية.</h3>
              <p>٦ عوالم كرتونية، ٢٠ بطلاً، و٢٠ كارتاً تكتيكياً بأوضاع لعب جماعية فورية.</p>
              <div class="mode-mini-pills" aria-label="أوضاع المنافسة">
                <span class="mode-mini-pill">مواجهة الفرق</span>
                <span class="mode-mini-pill">البقاء للأقوى</span>
                <span class="mode-mini-pill">حرب البطاقات</span>
                <span class="mode-mini-pill">التحدي الفردي</span>
              </div>
              <span class="experience-link">استكشف العوالم والأوضاع ${icon('arrow')}</span>
            </div>
          </a>

          <a href="#journey" class="experience-card student-card spotlight reveal">
            <span class="experience-num">٠٣ / للطالب</span>
            <div class="skill-preview" aria-hidden="true">
              <div class="skill-node done">${icon('check')}</div>
              <span></span>
              <div class="skill-node current">${icon('spark')}</div>
              <span></span>
              <div class="skill-node">${icon('trophy')}</div>
            </div>
            <div class="experience-content">
              <h3>رحلتك<br>التعليمية.</h3>
              <p>تعلّم بالتدريج، تابع صفوفك وواجباتك، وراجع دفتر أخطائك على مهلك.</p>
              <span class="experience-link">ابدأ رحلتك التعليمية ${icon('arrow')}</span>
            </div>
          </a>
        </div>

        <div id="launchRegister" class="launch-register-bar reveal">
          <div class="launch-register-copy">
            <span class="scorear-icon-box size-sm tone-violet">${icon('shield')}</span>
            <div>
              <strong>بوابة الدخول والتسجيل الموحدة</strong>
              <span>أنشئ حساب طالب أو معلّم، أو سجّل دخولك لمتابعة صفوفك ومسابقاتك.</span>
            </div>
          </div>
          <div class="launch-register-actions">
            <button type="button" class="btn launch-primary" data-action="unified-login">تسجيل الدخول ${icon('arrow')}</button>
            <button type="button" class="btn launch-outline" data-action="register-student">طالب جديد</button>
            <button type="button" class="btn launch-outline" data-action="register-teacher">معلم جديد</button>
          </div>
        </div>
      </section>
    </div>
  `;
};

let launchCleanup = [];

window.initLaunch = function (page) {
  launchCleanup.forEach(fn => fn());
  launchCleanup = [];
  document.body.classList.toggle('launch-mode', page === 'home');
  const reduce = () => document.documentElement.classList.contains('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bind spotlight hover across both #home and internal editorial views
  document.querySelectorAll('.spotlight').forEach(el => {
    const move = e => {
      if (reduce()) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
      el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', move);
    launchCleanup.push(() => el.removeEventListener('pointermove', move));
  });

  if (page !== 'home') return;

  if (window.Motion && !reduce()) {
    const { animate, stagger, inView } = window.Motion;
    animate('.launch-copy .reveal', { opacity: [1, 1], y: [16, 0] }, { duration: 0.65, delay: stagger(0.07), ease: [0.2, 0.7, 0.2, 1] });
    animate('.launch-visual', { opacity: [1, 1], y: [20, 0] }, { duration: 0.85, delay: 0.08 });
    const stop = inView('.launch-section .reveal', el => {
      const animation = animate(el, { opacity: [1, 1], y: [20, 0] }, { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] });
      return () => animation.stop();
    }, { margin: '0px 0px -50px 0px' });
    launchCleanup.push(stop);
  }

  document.querySelectorAll('[data-tilt]').forEach(el => {
    const move = e => {
      if (reduce() || !matchMedia('(pointer:fine)').matches) return;
      const r = el.getBoundingClientRect();
      el.style.transform = `perspective(1000px) rotateX(${-(e.clientY - r.top - r.height / 2) / 75}deg) rotateY(${(e.clientX - r.left - r.width / 2) / 75}deg)`;
    };
    const leave = () => { el.style.transform = ''; };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    launchCleanup.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });
  });

  const hero = document.getElementById('launchHero');
  if (hero) {
    const move = e => {
      if (reduce()) return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--pointer-x', `${e.clientX - r.left}px`);
      hero.style.setProperty('--pointer-y', `${e.clientY - r.top}px`);
    };
    hero.addEventListener('pointermove', move);
    launchCleanup.push(() => hero.removeEventListener('pointermove', move));
  }
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  if (b.dataset.action === 'scrollsection') {
    document.getElementById(b.dataset.target)?.scrollIntoView({
      behavior: document.documentElement.classList.contains('reduced') ? 'instant' : 'smooth'
    });
  }
  if (b.dataset.action === 'heroanswer') {
    const correct = b.dataset.value === 'correct';
    const result = document.getElementById('heroAnswer');
    if (result) {
      result.textContent = correct
        ? 'أحسنت! ذُكر المشبّه والمشبّه به، وحُذفت الأداة ووجه الشبه.'
        : 'جرّب مرة أخرى: «العلم» مشبّه و«نور» مشبّه به.';
      result.className = 'fq-result ' + (correct ? 'success' : 'try-again');
    }
    b.classList.add(correct ? 'right' : 'wrong');
    if (correct) {
      document.querySelectorAll('.fq-answers button').forEach(x => { x.disabled = true; });
    }
  }
});
