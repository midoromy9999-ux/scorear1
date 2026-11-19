/**
 * ScoreAR Fair Learning Cosmetics Registry & Locker (Zero Pay-to-Win)
 * Unlocks Hero Podium Entrances & Visual Auras purely through genuine learning progress:
 * quiet-practice XP, daily active streak, completed tracks, and mastered mistakes.
 * Strictly Rule 7 Compliant (< 300 lines).
 */
(function (global) {
  'use strict';

  const GUEST_KEY = 'scorear_student_guest_v1';

  const ENTRIES = [
    { id: 'default',  title: 'القفزة الكلاسيكية',     icon: '⚡', color: '#a855f7', req: 'متاح مجاناً للجميع', check: () => true },
    { id: 'rocket',   title: 'الدخول الصاروخي النفاث', icon: '🚀', color: '#38bdf8', req: '50 XP أو إكمال مسار تدريبي', check: s => s.xp >= 50 || s.paths >= 1 },
    { id: 'portal',   title: 'بوابة الزمن الكونية',    icon: '🌀', color: '#c084fc', req: 'سلسلة 3 أيام أو 150 XP', check: s => s.streak >= 3 || s.xp >= 150 },
    { id: 'goldrain', title: 'أمطار الذهب الملكية',    icon: '💰', color: '#fbbf24', req: '250 XP أو سلسلة 5 أيام أو إتقان 3 أخطاء', check: s => s.xp >= 250 || s.streak >= 5 || s.mastered >= 3 }
  ];

  const AURAS = [
    { id: 'none',   title: 'بدون هالة',           icon: '✨', color: '#64748b', req: 'الوضع القياسي', check: () => true },
    { id: 'cyan',   title: 'هالة السماوي المتوهج', icon: '💠', color: '#58dce3', req: '30 XP أو محاولة تدريبية', check: s => s.xp >= 30 || s.attempts >= 1 },
    { id: 'violet', title: 'هالة المجرة النيلية',  icon: '🌌', color: '#a855f7', req: 'سلسلة يومين أو 100 XP', check: s => s.streak >= 2 || s.xp >= 100 },
    { id: 'gold',   title: 'الهالة الملكية الذهبية', icon: '👑', color: '#fbbf24', req: 'سلسلة 4 أيام أو 200 XP', check: s => s.streak >= 4 || s.xp >= 200 }
  ];

  function esc(str) {
    return typeof str !== 'string' ? String(str ?? '') : str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function readGuestPayload() {
    try {
      const raw = global.localStorage ? global.localStorage.getItem(GUEST_KEY) : null;
      const p = raw ? JSON.parse(raw) : null;
      if (p && typeof p === 'object' && p.data && typeof p.data === 'object') return p;
    } catch {}
    return { schemaVersion: 'scorear_v2', data: {} };
  }

  function writeGuestPayload(payload) {
    try {
      if (!global.localStorage) return false;
      payload.data.lastUpdated = Date.now();
      global.localStorage.setItem(GUEST_KEY, JSON.stringify(payload));
      return true;
    } catch { return false; }
  }

  function getStats() {
    const d = readGuestPayload().data || {};
    const st = d.streak && typeof d.streak === 'object' ? d.streak : {};
    const pathsObj = d.completedPaths && typeof d.completedPaths === 'object' ? d.completedPaths : {};
    const stationsDone = Object.values(d.stationsProgress || {}).filter(v => v && v.completed).length;
    const mastered = (Array.isArray(d.mistakes) ? d.mistakes : []).filter(m => m && m.mastered).length;
    return {
      xp: Math.max(0, Number(d.xp) || 0),
      streak: Math.max(Number(st.count) || 0, Number(st.bestStreak) || 0),
      paths: Object.keys(pathsObj).length + stationsDone,
      mastered,
      attempts: Array.isArray(d.attempts) ? d.attempts.length : 0,
      companionId: d.companionId || 'char_01',
      rawCosmetics: (d.cosmetics && typeof d.cosmetics === 'object') ? d.cosmetics : {}
    };
  }

  function getEquipped() {
    const stats = getStats();
    const rawEntry = stats.rawCosmetics.entry || 'default';
    const rawAura = stats.rawCosmetics.aura || 'none';
    const validEntry = ENTRIES.find(e => e.id === rawEntry && e.check(stats)) ? rawEntry : 'default';
    const validAura = AURAS.find(a => a.id === rawAura && a.check(stats)) ? rawAura : 'none';
    return { entry: validEntry, aura: validAura };
  }

  function getCatalogState() {
    const stats = getStats();
    const equipped = getEquipped();
    return {
      stats,
      equipped,
      entries: ENTRIES.map(e => ({ ...e, unlocked: e.check(stats), active: equipped.entry === e.id })),
      auras: AURAS.map(a => ({ ...a, unlocked: a.check(stats), active: equipped.aura === a.id }))
    };
  }

  function equip(kind, id) {
    const stats = getStats();
    const list = kind === 'aura' ? AURAS : ENTRIES;
    const item = list.find(x => x.id === id);
    if (!item || !item.check(stats)) {
      if (global.toast) global.toast(`🔒 افتح «${item?.title || id}» بالتعلّم أولاً (${item?.req || ''})`);
      return { ok: false, reason: 'locked', equipped: getEquipped() };
    }
    const payload = readGuestPayload();
    const cur = getEquipped();
    payload.data.cosmetics = { ...cur, [kind === 'aura' ? 'aura' : 'entry']: id };
    writeGuestPayload(payload);
    if (global.toast) global.toast(`✨ تم تجهيز: ${item.title}`);
    return { ok: true, equipped: getEquipped() };
  }

  function ensureStyles() {
    if (typeof document === 'undefined' || document.getElementById('scorearHeroCosmeticsCss')) return;
    const s = document.createElement('style');
    s.id = 'scorearHeroCosmeticsCss';
    s.textContent = `
      @keyframes scAuraPulse { 0%,100%{transform:translate(-50%,-50%) scale(0.95);opacity:0.75} 50%{transform:translate(-50%,-50%) scale(1.09);opacity:1} }
      .sc-hero-aura-ring { position:absolute;left:50%;top:54%;width:94%;height:86%;border-radius:50%;pointer-events:none;z-index:-1;animation:scAuraPulse 2.4s ease-in-out infinite; }
      .scorear-cosmetics-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }
      .scorear-cosmetic-card { background:rgba(15,17,36,0.88);border:1.5px solid rgba(255,255,255,0.1);border-radius:14px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:transform 0.16s ease,border-color 0.2s ease;min-width:0; }
      .scorear-cosmetic-card.unlocked:hover { transform:translateY(-2px);border-color:rgba(172,139,242,0.45); }
      .scorear-cosmetic-card.locked { opacity:0.62;filter:saturate(0.75); }
      @media (max-width:720px) { .scorear-cosmetics-grid { grid-template-columns:1fr; } }
      @media (prefers-reduced-motion:reduce) { .sc-hero-aura-ring { animation:none !important; } }
    `;
    (document.head || document.documentElement).appendChild(s);
  }

  function applyAura(containerEl, auraId) {
    if (!containerEl || typeof document === 'undefined' || typeof containerEl.querySelectorAll !== 'function') return;
    ensureStyles();
    containerEl.querySelectorAll('.sc-hero-aura-ring').forEach(el => el.remove());
    if (!auraId || auraId === 'none') return;
    const aura = AURAS.find(a => a.id === auraId);
    if (!aura) return;
    if (typeof getComputedStyle === 'function' && getComputedStyle(containerEl).position === 'static') containerEl.style.position = 'relative';
    containerEl.style.isolation = 'isolate';
    const ring = document.createElement('div');
    ring.className = `sc-hero-aura-ring sc-aura-${aura.id}`;
    ring.setAttribute('data-cosmetic-aura', aura.id);
    ring.style.background = `radial-gradient(circle, ${aura.color}55 0%, ${aura.color}22 48%, transparent 72%)`;
    ring.style.boxShadow = `0 0 28px ${aura.color}66, inset 0 0 18px ${aura.color}44`;
    ring.style.border = `1.5px solid ${aura.color}66`;
    containerEl.insertBefore(ring, containerEl.firstChild);
  }

  function renderCardRow(kind, items) {
    return items.map(it => {
      const btnText = it.active ? 'مجهّز ✓' : (it.unlocked ? 'تجهيز' : '🔒 مقفل');
      const btnBg = it.active ? '#1d5c52' : (it.unlocked ? 'rgba(117,80,239,0.28)' : 'rgba(255,255,255,0.06)');
      const btnBorder = it.active ? '#44b8a5' : (it.unlocked ? '#9665ff' : 'rgba(255,255,255,0.14)');
      return `
        <div class="scorear-cosmetic-card ${it.unlocked ? 'unlocked' : 'locked'}" style="${it.active ? `border-color:${it.color};box-shadow:0 0 18px ${it.color}33;` : ''}">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <span style="width:38px;height:38px;border-radius:11px;background:${it.color}22;border:1px solid ${it.color}55;display:grid;place-items:center;font-size:19px;flex-shrink:0;">${it.icon}</span>
            <div style="min-width:0;">
              <b style="display:block;color:#f6f3ff;font-size:13px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(it.title)}</b>
              <small style="display:block;color:${it.unlocked ? '#85f3d8' : '#a1a4be'};font-size:10.5px;font-weight:700;">${it.unlocked ? 'مفتوح بالتعلّم ✓' : esc(it.req)}</small>
            </div>
          </div>
          <button type="button" data-cosmetic-kind="${kind}" data-cosmetic-id="${it.id}" ${it.unlocked ? '' : 'disabled'} style="background:${btnBg};border:1px solid ${btnBorder};color:#fff;border-radius:10px;padding:5px 11px;font-size:11px;font-weight:900;cursor:${it.unlocked ? 'pointer' : 'not-allowed'};flex-shrink:0;font-family:inherit;">${btnText}</button>
        </div>`;
    }).join('');
  }

  function renderLockerHtml() {
    ensureStyles();
    const st = getCatalogState();
    const unlockedCount = st.entries.filter(x => x.unlocked).length + st.auras.filter(x => x.unlocked).length;
    const compId = esc(st.stats.companionId || 'char_01');
    const curAura = st.auras.find(a => a.active) || st.auras[0];
    const curEntry = st.entries.find(e => e.active) || st.entries[0];
    return `
      <section id="scorearCosmeticsLocker" class="scorear-experience-panel spotlight" style="margin-top:18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <h3 style="color:#f6f3ff;font-size:17px;font-weight:900;margin:0;">خزانة مقتنيات التعلّم العادلة (Zero Pay-to-Win)</h3>
              <span class="launch-pill" style="font-size:10.5px;padding:3px 10px;border-color:rgba(88,220,227,0.4);color:#85f3d8;">مفتوح ${unlockedCount} / ${st.entries.length + st.auras.length}</span>
            </div>
            <small style="color:#a1a4be;font-size:11.5px;display:block;margin-top:3px;">تُفتح التأثيرات تلقائياً من نقاط الخبرة وسلسلة حضورك وتظهر مع بطلك حين تصعد منصة التتويج.</small>
          </div>
          <div style="display:flex;align-items:center;gap:10px;background:rgba(12,14,32,0.86);border:1px solid rgba(172,139,242,0.3);border-radius:14px;padding:7px 12px;">
            <div id="scLockerHeroPreview" style="position:relative;width:44px;height:52px;display:flex;align-items:center;justify-content:center;isolation:isolate;">
              <img src="assets/characters/animated/${compId}-idle.webp" onerror="this.src='assets/characters/char_01.webp'" alt="معاينة البطل" style="width:42px;height:50px;object-fit:contain;position:relative;z-index:2;">
            </div>
            <div style="font-size:11px;line-height:1.5;">
              <div style="color:#fde68a;font-weight:900;">${curEntry.icon} ${esc(curEntry.title)}</div>
              <div style="color:#c7f9ff;font-weight:800;">${curAura.icon} ${esc(curAura.title)}</div>
            </div>
          </div>
        </div>
        <div style="font-size:12px;font-weight:900;color:#c9baff;margin:10px 0 7px;">١. تأثيرات الصعود لمنصة التتويج:</div>
        <div class="scorear-cosmetics-grid">${renderCardRow('entry', st.entries)}</div>
        <div style="font-size:12px;font-weight:900;color:#58dce3;margin:14px 0 7px;">٢. الهالات البصرية للبطل:</div>
        <div class="scorear-cosmetics-grid">${renderCardRow('aura', st.auras)}</div>
      </section>`;
  }

  function renderCompactSelectorHtml() {
    ensureStyles();
    const st = getCatalogState();
    const unlockedEntries = st.entries.filter(e => e.unlocked);
    const unlockedAuras = st.auras.filter(a => a.unlocked);
    return `
      <div id="studentJoinCosmeticsBox" style="background:rgba(16,18,42,0.84);border:1px solid rgba(88,220,227,0.28);border-radius:14px;padding:8px 10px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:900;color:#fde68a;">✨ تجهيز مؤثرات بطلك للمنصة:</span>
          <span style="font-size:10px;color:#85f3d8;font-weight:800;">${unlockedEntries.length + unlockedAuras.length}/8 مفتوح</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:5px;">
          ${st.entries.map(e => `<button type="button" data-cosmetic-kind="entry" data-cosmetic-id="${e.id}" ${e.unlocked ? '' : 'disabled'} title="${esc(e.req)}" style="padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:800;border:1px solid ${e.active ? e.color : 'rgba(255,255,255,0.14)'};background:${e.active ? e.color + '33' : 'rgba(255,255,255,0.04)'};color:${e.unlocked ? '#fff' : '#64748b'};cursor:${e.unlocked ? 'pointer' : 'not-allowed'};font-family:inherit;">${e.unlocked ? e.icon : '🔒'} ${esc(e.title)}</button>`).join('')}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;">
          ${st.auras.map(a => `<button type="button" data-cosmetic-kind="aura" data-cosmetic-id="${a.id}" ${a.unlocked ? '' : 'disabled'} title="${esc(a.req)}" style="padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:800;border:1px solid ${a.active ? a.color : 'rgba(255,255,255,0.14)'};background:${a.active ? a.color + '33' : 'rgba(255,255,255,0.04)'};color:${a.unlocked ? '#fff' : '#64748b'};cursor:${a.unlocked ? 'pointer' : 'not-allowed'};font-family:inherit;">${a.unlocked ? a.icon : '🔒'} ${esc(a.title)}</button>`).join('')}
        </div>
      </div>`;
  }

  function bindLocker(rootEl, previewElId = 'scLockerHeroPreview') {
    if (!rootEl) return;
    const eq = getEquipped();
    const prev = document.getElementById(previewElId);
    if (prev) applyAura(prev, eq.aura);
    rootEl.querySelectorAll('[data-cosmetic-kind]').forEach(btn => {
      btn.onclick = () => {
        const res = equip(btn.getAttribute('data-cosmetic-kind'), btn.getAttribute('data-cosmetic-id'));
        if (!res.ok) return;
        const locker = rootEl.querySelector('#scorearCosmeticsLocker');
        if (locker) {
          locker.outerHTML = renderLockerHtml();
          bindLocker(rootEl, previewElId);
        }
      };
    });
  }

  function bindCompactSelector(containerEl) {
    if (!containerEl) return;
    const eq = getEquipped();
    const liveWrap = containerEl.querySelector('#studentAvatarLiveImg')?.parentElement;
    if (liveWrap) applyAura(liveWrap, eq.aura);
    containerEl.querySelectorAll('#studentJoinCosmeticsBox [data-cosmetic-kind]').forEach(btn => {
      btn.onclick = () => {
        const res = equip(btn.getAttribute('data-cosmetic-kind'), btn.getAttribute('data-cosmetic-id'));
        if (!res.ok) return;
        const box = containerEl.querySelector('#studentJoinCosmeticsBox');
        if (box) { box.outerHTML = renderCompactSelectorHtml(); bindCompactSelector(containerEl); }
      };
    });
  }

  const ScoreARHeroCosmetics = {
    ENTRIES, AURAS, getStats, getEquipped, getCatalogState, equip, applyAura,
    renderLockerHtml, renderCompactSelectorHtml, bindLocker, bindCompactSelector
  };
  global.ScoreARHeroCosmetics = ScoreARHeroCosmetics;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHeroCosmetics = ScoreARHeroCosmetics; } catch {}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARHeroCosmetics;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
