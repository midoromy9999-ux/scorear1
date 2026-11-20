/**
 * ScoreAR High-Cinema Card Reveal & Broadcast HUD (quiz-card-cinema.js)
 * Renders queued 3D-flipping holographic card clash cut-ins, translucent battle feed,
 * round card-drop celebration pills, and a slim 3D Card Arena HUD ribbon.
 */
(function (global) {
  'use strict';

  const CATEGORY_THEMES = {
    GAME_CHANGER: { accent: '#fbbf24', glow: 'rgba(251,191,36,0.55)', badge: '👑 قلّاب الموازين', bg: 'linear-gradient(135deg,rgba(32,20,8,0.88),rgba(58,34,8,0.84))' },
    ATTACK: { accent: '#ef4444', glow: 'rgba(239,68,68,0.55)', badge: '⚔️ هجوم تكتيكي', bg: 'linear-gradient(135deg,rgba(38,10,18,0.88),rgba(66,14,24,0.84))' },
    DEFENSE: { accent: '#38bdf8', glow: 'rgba(56,189,248,0.55)', badge: '🛡️ دفاع تلقائي', bg: 'linear-gradient(135deg,rgba(8,24,46,0.88),rgba(12,42,74,0.84))' },
    BOOST: { accent: '#10b981', glow: 'rgba(16,185,129,0.55)', badge: '⚡ تعزيز فوري', bg: 'linear-gradient(135deg,rgba(6,34,26,0.88),rgba(10,56,42,0.84))' }
  };

  let cutInQueue = [];
  let activeCutInTimer = null;
  let feedItems = [];
  let dropToastTimer = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function isReduced() {
    const paused = typeof document !== 'undefined' && document.documentElement?.classList?.contains('characters-paused');
    return paused || Boolean(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  }

  function avatarUrl(av) {
    const raw = String(av || 'char_01').replace(/\D/g, '') || '1';
    const code = 'char_' + String(Math.max(1, Math.min(20, parseInt(raw, 10) || 1))).padStart(2, '0');
    return `assets/motion-v3/originals/${code}.png`;
  }

  function injectStyles() {
    if (typeof document === 'undefined' || document.getElementById('scorearCardCinemaStyles')) return;
    const style = document.createElement('style');
    style.id = 'scorearCardCinemaStyles';
    style.textContent = `
      @keyframes scCardFlipReveal {
        0% { opacity:0.95; transform:perspective(1200px) rotateY(155deg) scale(0.76) translateY(20px); }
        16% { opacity:1; transform:perspective(1200px) rotateY(-6deg) scale(1.05) translateY(-4px); }
        24%, 88% { opacity:1; transform:perspective(1200px) rotateY(0deg) scale(1) translateY(0); }
        100% { opacity:0; transform:perspective(1200px) rotateY(0deg) scale(0.92) translateY(-14px); }
      }
      @keyframes scHoloSweep {
        0% { transform:translateX(-140%) rotate(22deg); opacity:0; }
        25% { opacity:0.65; }
        65% { transform:translateX(170%) rotate(22deg); opacity:0; }
        100% { transform:translateX(170%) rotate(22deg); opacity:0; }
      }
      @keyframes scClashPop {
        0% { opacity:0.85; transform:translateY(10px) scale(0.95); }
        12%, 88% { opacity:1; transform:translateY(0) scale(1); }
        100% { opacity:0; transform:translateY(-8px) scale(0.96); }
      }
      @keyframes scDropToastIn {
        0% { opacity:0; transform:translate(-50%,-18px) scale(0.92); }
        14%, 86% { opacity:1; transform:translate(-50%,0) scale(1); }
        100% { opacity:0; transform:translate(-50%,-12px) scale(0.95); }
      }
      @keyframes scFeedSlide {
        0% { opacity:0; transform:translateX(18px); }
        100% { opacity:1; transform:translateX(0); }
      }
      .sc-flip-card-wrap { width:146px; height:204px; position:relative; transform-style:preserve-3d; animation:scCardFlipReveal 3.15s cubic-bezier(0.22,1,0.36,1) forwards; flex-shrink:0; }
      .sc-flip-face { position:absolute; inset:0; border-radius:16px; backface-visibility:hidden; overflow:hidden; }
      .sc-flip-back { transform:rotateY(180deg); background:linear-gradient(145deg,#171338,#090c1e); border:3px solid #fbbf24; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 0 24px rgba(251,191,36,0.35),0 18px 40px rgba(0,0,0,0.85); }
      .sc-flip-front { background:#0b0f22; box-shadow:0 20px 50px rgba(0,0,0,0.88); }
      .sc-holo-sweep { position:absolute; top:-30%; left:-40%; width:65%; height:160%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.52),transparent); pointer-events:none; animation:scHoloSweep 1.65s ease-out 0.35s 1; }
      .sc-mini-card-glyph { display:inline-block; width:9px; height:12px; border-radius:2px; background:linear-gradient(135deg,#312e81,#171338); border:1.5px solid #fbbf24; box-shadow:0 0 6px rgba(251,191,36,0.5); vertical-align:-1px; flex-shrink:0; }
      @media (max-width:1180px) { #hostCardBattleFeed { display:none !important; } }
      @media (prefers-reduced-motion: reduce) {
        .sc-flip-card-wrap { animation:scClashPop 1.8s ease forwards !important; transform-style:flat !important; }
        .sc-holo-sweep { display:none !important; }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function getHostRoot() {
    if (typeof document === 'undefined') return null;
    const hs = document.getElementById('scorearHostStage');
    return (hs && hs.style.display !== 'none') ? hs : null;
  }

  function resolveTheme(ev) {
    if (ev?.type === 'REFLECTED') return CATEGORY_THEMES.DEFENSE;
    if (ev?.type === 'BLOCKED') return { ...CATEGORY_THEMES.DEFENSE, accent: '#fbbf24', glow: 'rgba(251,191,36,0.55)' };
    return CATEGORY_THEMES[ev?.card?.category] || CATEGORY_THEMES.GAME_CHANGER;
  }

  function renderCutInNow(ev) {
    const root = getHostRoot();
    if (!root) { drainNext(); return; }
    injectStyles();
    document.getElementById('scCardCinemaStage')?.remove();

    const card = ev.card || {};
    const theme = resolveTheme(ev);
    const isSelf = !ev.targetPlayer || String(ev.sourcePlayer?.id) === String(ev.targetPlayer?.id);
    const outcomeTag = ev.type === 'REFLECTED'
      ? '⚖️ ارتد الهجوم بمرآة القاضي!'
      : (ev.type === 'BLOCKED'
        ? '🛡️ صد فوري بالدرع الدفاعي!'
        : (card.id === 'ASK_QUESTION' ? '🎲 رهان ±100 على السؤال القادم!' : (card.nameAr || 'كارت تكتيكي')));
    const crestIcon = ev.type === 'REFLECTED' ? '⚖️' : (ev.type === 'BLOCKED' ? '🛡️' : (card.id === 'SWAP_STUDENT' ? '🔄' : '⚔️'));
    const cardImg = card.img || 'assets/cards/card_pin_student.jpg';

    const stageEl = document.createElement('div');
    stageEl.id = 'scCardCinemaStage';
    stageEl.style.cssText = 'position:fixed;inset:0;z-index:82;pointer-events:none;display:flex;align-items:flex-start;justify-content:center;padding:124px 16px 16px;direction:rtl;font-family:Cairo,Tajawal,sans-serif;';
    stageEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;max-width:min(740px,92vw);padding:14px 20px;border-radius:26px;background:rgba(7,11,26,0.74);border:2px solid ${theme.accent};box-shadow:0 24px 64px rgba(0,0,0,0.78),0 0 38px ${theme.glow};">
        <div class="sc-flip-card-wrap">
          <div class="sc-flip-face sc-flip-back">
            <div style="width:74px;height:74px;border-radius:18px;border:2px solid #fbbf24;display:grid;place-items:center;font-size:32px;background:rgba(251,191,36,0.14);">🃏</div>
            <div style="margin-top:8px;font-size:13px;font-weight:900;color:#fde68a;font-family:Montserrat,Cairo,sans-serif;">ScoreAR</div>
          </div>
          <div class="sc-flip-face sc-flip-front" style="border:2.5px solid ${theme.accent};box-shadow:0 0 28px ${theme.glow};">
            <img src="${esc(cardImg)}" onerror="this.style.display='none'" alt="${esc(card.nameAr || 'كارت')}" style="width:100%;height:100%;object-fit:cover;display:block;">
            <div class="sc-holo-sweep"></div>
            <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 58%,rgba(6,9,22,0.92) 100%);pointer-events:none;"></div>
            <div style="position:absolute;bottom:8px;right:8px;left:8px;text-align:center;">
              <div style="font-size:12px;font-weight:900;color:#fff;text-shadow:0 2px 8px #000;">${esc(card.nameAr || '')}</div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;min-width:0;flex:1;animation:scClashPop 3.15s cubic-bezier(0.22,1,0.36,1) forwards;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="padding:3px 12px;border-radius:999px;background:${theme.bg};border:1px solid ${theme.accent};color:#fff;font-size:11.5px;font-weight:900;">${theme.badge}</span>
            <span style="padding:3px 12px;border-radius:999px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.22);color:#fef08a;font-size:12px;font-weight:900;">${esc(outcomeTag)}</span>
          </div>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:14px;padding:6px 12px;">
              <img src="${esc(avatarUrl(ev.sourcePlayer?.avatarId))}" onerror="this.src='assets/characters/animated/char_01-idle.webp'" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:center 16%;border:1.5px solid ${theme.accent};background:#0b1024;">
              <div>
                <div style="font-size:10px;color:#cbd5e1;font-weight:800;">${isSelf ? 'البطل' : 'المُطلِق'}</div>
                <b style="font-size:14px;color:#fff;font-weight:900;">${esc(ev.sourcePlayer?.name || 'بطل')}</b>
              </div>
            </div>
            ${!isSelf ? `
              <div style="width:36px;height:36px;border-radius:50%;background:${theme.bg};border:1.5px solid ${theme.accent};display:grid;place-items:center;font-size:17px;box-shadow:0 0 18px ${theme.glow};">${crestIcon}</div>
              <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:14px;padding:6px 12px;">
                <img src="${esc(avatarUrl(ev.targetPlayer?.avatarId))}" onerror="this.src='assets/characters/animated/char_02-idle.webp'" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:center 16%;border:1.5px solid ${ev.type === 'BLOCKED' || ev.type === 'REFLECTED' ? '#38bdf8' : '#fca5a5'};background:#0b1024;">
                <div>
                  <div style="font-size:10px;color:${ev.type === 'BLOCKED' || ev.type === 'REFLECTED' ? '#7dd3fc' : '#fca5a5'};font-weight:800;">${ev.type === 'BLOCKED' ? 'صاحب الدرع' : (ev.type === 'REFLECTED' ? 'عاكس الهجوم' : 'المستهدف')}</div>
                  <b style="font-size:14px;color:#fff;font-weight:900;">${esc(ev.targetPlayer?.name || 'منافس')}</b>
                </div>
              </div>
            ` : ''}
          </div>

          <div style="font-size:14.5px;font-weight:900;color:#ffffff;line-height:1.45;text-shadow:0 2px 10px rgba(0,0,0,0.8);">${esc(ev.message || card.desc || '')}</div>
        </div>
      </div>
    `;

    root.appendChild(stageEl);
    activeCutInTimer = setTimeout(() => {
      stageEl.remove();
      activeCutInTimer = null;
      drainNext();
    }, isReduced() ? 1800 : 3200);
  }

  function drainNext() {
    if (activeCutInTimer || !cutInQueue.length) return;
    const nextEv = cutInQueue.shift();
    renderCutInNow(nextEv);
  }

  function showCardCutIn(ev) {
    if (!ev || !ev.card) return false;
    if (!getHostRoot()) return false;
    if (cutInQueue.length >= 4) cutInQueue.shift();
    cutInQueue.push(ev);
    drainNext();
    return true;
  }

  function pushBattleFeed(ev) {
    const root = getHostRoot();
    if (!root || !ev) return;
    injectStyles();
    const theme = resolveTheme(ev);
    feedItems.unshift({
      id: 'cf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      msg: ev.message || ev.card?.nameAr || 'حركة تكتيكية',
      img: ev.card?.img || 'assets/cards/card_plus_50.jpg',
      accent: theme.accent
    });
    if (feedItems.length > 2) feedItems.length = 2;

    let rail = document.getElementById('hostCardBattleFeed');
    if (!rail || rail.parentElement !== root) {
      rail?.remove();
      rail = document.createElement('div');
      rail.id = 'hostCardBattleFeed';
      rail.style.cssText = 'position:fixed;bottom:14px;right:12px;z-index:62;width:240px;display:flex;flex-direction:column;gap:5px;pointer-events:none;direction:rtl;font-family:Cairo,Tajawal,sans-serif;';
      root.appendChild(rail);
    }
    rail.innerHTML = feedItems.map((it, idx) => `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:12px;background:rgba(8,14,32,0.56);backdrop-filter:blur(10px);border:1px solid ${it.accent}66;border-right:4px solid ${it.accent};box-shadow:0 8px 20px rgba(0,0,0,0.35);${idx === 0 ? 'animation:scFeedSlide 0.3s ease both;' : 'opacity:0.86;'}">
        <img src="${esc(it.img)}" onerror="this.style.display='none'" alt="" style="width:24px;height:32px;object-fit:cover;border-radius:5px;flex-shrink:0;border:1px solid rgba(255,255,255,0.22);">
        <span style="font-size:11.5px;font-weight:800;color:#f8fafc;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${esc(it.msg)}</span>
      </div>
    `).join('');
  }

  function showCardDropToast(drops, titleText) {
    const root = getHostRoot();
    if (!root || !Array.isArray(drops) || !drops.length) return;
    injectStyles();
    document.getElementById('hostCardDropToast')?.remove();
    clearTimeout(dropToastTimer);

    const preview = drops.slice(0, 6);
    const extraCount = drops.length - preview.length;
    const reasonIcons = { starter: '🃏', top2: '⚡', streak2: '🔥' };

    const toast = document.createElement('div');
    toast.id = 'hostCardDropToast';
    toast.style.cssText = 'position:fixed;top:94px;left:50%;transform:translateX(-50%);z-index:76;max-width:min(820px,92vw);padding:8px 16px;border-radius:18px;background:rgba(12,16,40,0.72);backdrop-filter:blur(14px);border:1.5px solid rgba(251,191,36,0.55);box-shadow:0 14px 36px rgba(0,0,0,0.48);display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;direction:rtl;font-family:Cairo,Tajawal,sans-serif;animation:scDropToastIn 3.8s ease forwards;';
    toast.innerHTML = `
      <div style="font-size:12.5px;font-weight:900;color:#fde68a;">${esc(titleText || '🃏 توزيع كروت تكتيكية جديدة!')}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;">
        ${preview.map(d => `
          <span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(251,191,36,0.38);color:#fff;font-size:11px;font-weight:800;">
            <span>${reasonIcons[d.reason] || '🃏'}</span>
            <span>${esc(d.playerName)}</span>
          </span>
        `).join('')}
        ${extraCount > 0 ? `<span style="font-size:11px;font-weight:900;color:#7dd3fc;">+${extraCount} آخرين</span>` : ''}
      </div>
    `;
    root.appendChild(toast);
    dropToastTimer = setTimeout(() => toast.remove(), 3900);
  }

  function computeHudCounts(room, cardMgr) {
    const players = Array.isArray(room?.players) ? room.players : [];
    const map = cardMgr?.players || {};
    let totalHand = 0;
    let totalTraps = 0;
    let activeBuffs = 0;
    players.forEach(p => {
      const mp = map[String(p.id)];
      if (!mp) return;
      totalHand += mp.hand?.length || 0;
      totalTraps += mp.trapSlots?.length || 0;
      if (mp.status?.wager100 || mp.status?.multiplier === 2 || p.wager100 || p.cardMultiplier === 2) {
        activeBuffs++;
      }
    });
    return { totalHand, totalTraps, activeBuffs };
  }

  function renderCardArenaHudHtml(room, cardMgr) {
    const c = computeHudCounts(room, cardMgr);
    return `
      <div id="hostCardArenaHud" style="width:100%;max-width:780px;margin:0 auto;padding:5px 14px;border-radius:999px;background:rgba(8,14,32,0.42);backdrop-filter:blur(10px);border:1px solid rgba(236,72,153,0.45);box-shadow:0 8px 22px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:space-between;gap:10px;direction:rtl;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;font-weight:900;">
          <span style="color:#f472b6;display:inline-flex;align-items:center;gap:5px;"><i class="sc-mini-card-glyph" style="display:inline-block;width:9px;height:12px;border-radius:2px;background:#312e81;border:1.5px solid #fbbf24;"></i> حرب الكروت 3D</span>
          <span style="color:#fde68a;">🎒 <b id="hudCardHandCount">${c.totalHand}</b> باليد</span>
          <span style="color:#7dd3fc;">🛡️ <b id="hudCardTrapCount">${c.totalTraps}</b> فخ</span>
          <span style="color:#6ee7b7;">🎲 <b id="hudCardBuffCount">${c.activeBuffs}</b> رهان/2X</span>
        </div>
        <button type="button" id="btnTriggerDemoCard" onclick="ScoreARCardArena?.simulateCardAction?.()" style="pointer-events:auto;padding:3px 11px;border-radius:999px;border:1px solid rgba(251,191,36,0.55);background:rgba(251,191,36,0.18);color:#fef08a;font-family:Cairo,sans-serif;font-size:11px;font-weight:900;cursor:pointer;">⚡ كارت تجريبي</button>
      </div>
    `;
  }

  function updateCardArenaHud(room, cardMgr) {
    const hud = typeof document !== 'undefined' ? document.getElementById('hostCardArenaHud') : null;
    if (!hud) return;
    const c = computeHudCounts(room, cardMgr);
    const hEl = document.getElementById('hudCardHandCount');
    const tEl = document.getElementById('hudCardTrapCount');
    const bEl = document.getElementById('hudCardBuffCount');
    if (hEl) hEl.textContent = String(c.totalHand);
    if (tEl) tEl.textContent = String(c.totalTraps);
    if (bEl) bEl.textContent = String(c.activeBuffs);
  }

  function isBusy() {
    return Boolean(activeCutInTimer || cutInQueue.length > 0);
  }

  function cleanup() {
    cutInQueue = [];
    feedItems = [];
    if (activeCutInTimer) { clearTimeout(activeCutInTimer); activeCutInTimer = null; }
    if (dropToastTimer) { clearTimeout(dropToastTimer); dropToastTimer = null; }
    if (typeof document !== 'undefined') {
      document.getElementById('scCardCinemaStage')?.remove();
      document.getElementById('hostCardBattleFeed')?.remove();
      document.getElementById('hostCardDropToast')?.remove();
    }
  }

  const Api = {
    showCardCutIn,
    pushBattleFeed,
    showCardDropToast,
    renderCardArenaHudHtml,
    updateCardArenaHud,
    isBusy,
    cleanup
  };

  global.ScoreARCardCinema = Api;
  if (typeof module !== 'undefined' && module.exports) module.exports = Api;
})(typeof window !== 'undefined' ? window : globalThis);
