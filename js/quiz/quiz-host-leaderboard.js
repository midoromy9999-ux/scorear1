/**
 * ScoreAR Quiz Host Leaderboard Race Module (quiz-host-leaderboard.js)
 * Cosmic Glass Race Leaderboard (Top 5 Contenders) with Procedural Hero Motion,
 * Ambient Aurora Speed Vector, Odometer Count-Up, and Zero-Shame Private Broadcast.
 * Strictly Rule 7 Compliant (<450 lines).
 */
(function(global) {
  'use strict';

  const previousRanks = new Map();

  const WORLD_RACE_THEMES = {
    royal: {
      name: 'القصر الملكي الأندلسي',
      trackTitle: 'طريق السجادة الحمراء نحو العرش',
      targetIcon: 'crown',
      targetLabel: 'العرش الملكي',
      bgGradient: 'linear-gradient(110deg, rgba(28, 19, 56, 0.88) 0%, rgba(58, 24, 78, 0.84) 65%, rgba(120, 53, 15, 0.78) 100%)',
      laneBorder: 'rgba(245, 158, 11, 0.38)',
      speedColor: '#fbbf24',
      accentColor: '#f59e0b'
    },
    cosmic: {
      name: 'محطة الفضاء العربية',
      trackTitle: 'مسارات الصواريخ المدارية',
      targetIcon: 'planet',
      targetLabel: 'المحطة المدارية',
      bgGradient: 'linear-gradient(110deg, rgba(14, 18, 40, 0.90) 0%, rgba(18, 52, 77, 0.84) 65%, rgba(76, 29, 149, 0.82) 100%)',
      laneBorder: 'rgba(88, 220, 227, 0.38)',
      speedColor: '#58dce3',
      accentColor: '#06b6d4'
    },
    treasure: {
      name: 'جزيرة الكنز الأسطورية',
      trackTitle: 'تسلق الجرف الصخري نحو الكنز',
      targetIcon: 'award',
      targetLabel: 'صندوق الكنز',
      bgGradient: 'linear-gradient(110deg, rgba(26, 20, 38, 0.90) 0%, rgba(78, 42, 18, 0.84) 65%, rgba(146, 64, 14, 0.80) 100%)',
      laneBorder: 'rgba(251, 191, 36, 0.38)',
      speedColor: '#fde047',
      accentColor: '#f59e0b'
    },
    stadium: {
      name: 'استاد الأبطال الرياضي',
      trackTitle: 'مضمار الجري الرياضي بحارات السرعة',
      targetIcon: 'trophy',
      targetLabel: 'خط النهاية والكأس',
      bgGradient: 'linear-gradient(110deg, rgba(15, 23, 42, 0.90) 0%, rgba(16, 64, 52, 0.84) 65%, rgba(14, 116, 144, 0.80) 100%)',
      laneBorder: 'rgba(74, 222, 128, 0.38)',
      speedColor: '#4ade80',
      accentColor: '#10b981'
    },
    oasis: {
      name: 'واحة النخيل والرمال',
      trackTitle: 'مجرى النهر الفيروزي نحو الواحة',
      targetIcon: 'compass',
      targetLabel: 'الواحة والينبوع',
      bgGradient: 'linear-gradient(110deg, rgba(14, 26, 34, 0.90) 0%, rgba(15, 76, 72, 0.84) 65%, rgba(16, 112, 90, 0.80) 100%)',
      laneBorder: 'rgba(88, 220, 227, 0.38)',
      speedColor: '#6ee7b7',
      accentColor: '#10b981'
    },
    magic: {
      name: 'المملكة السحرية العائمة',
      trackTitle: 'طيران السحر والبسط الطائرة في الشفق',
      targetIcon: 'sparkles',
      targetLabel: 'قلعة السحر المعلقة',
      bgGradient: 'linear-gradient(110deg, rgba(22, 16, 44, 0.90) 0%, rgba(68, 28, 116, 0.84) 65%, rgba(131, 24, 67, 0.78) 100%)',
      laneBorder: 'rgba(192, 132, 252, 0.38)',
      speedColor: '#f472b6',
      accentColor: '#c084fc'
    }
  };

  function escapeHtml(str) {
    return typeof str !== 'string' ? String(str || '') : str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function sfx(t) { if (global.ScoreARAudio) global.ScoreARAudio.playSfx(t); }
  function uiIcon(name, size = 15) {
    return (global.ScoreARUI && typeof global.ScoreARUI.icon === 'function')
      ? global.ScoreARUI.icon(name, { size })
      : '';
  }

  function renderHostLeaderboard(stage, currentRoom, activeQuestions, currentQIndex, onNext, onPodium, onClose) {
    const sorted = [...(currentRoom.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const hasNext = (currentQIndex + 1 < activeQuestions.length);
    const worldId = (currentRoom.world && currentRoom.world.id) ? currentRoom.world.id : (currentRoom.worldId || 'royal');
    const theme = WORLD_RACE_THEMES[worldId] || WORLD_RACE_THEMES.royal;
    const top5 = sorted.slice(0, 5);
    const maxLeaderScore = Math.max(100, Number(top5[0]?.score) || 100);

    let maxJump = 0, biggestJumperId = null;
    sorted.forEach((p, idx) => {
      const curRank = idx + 1;
      const prev = previousRanks.has(p.id) ? previousRanks.get(p.id) : curRank;
      const jump = prev - curRank;
      p._rankDelta = jump;
      p._prevRank = prev;
      p._currentRank = curRank;
      if (jump >= 2 && jump > maxJump) {
        maxJump = jump;
        biggestJumperId = p.id;
      }
    });
    sorted.forEach(p => previousRanks.set(p.id, p._currentRank));

    sfx('whoosh');
    setTimeout(() => { sfx('reveal'); }, 450);

    const isMuted = (global.ScoreARAudio && typeof global.ScoreARAudio.isMuted === 'function')
      ? global.ScoreARAudio.isMuted() : false;

    stage.innerHTML = `
      <style>
        @keyframes raceLaneSlideIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes raceHeroRushIn {
          0% { opacity: 0; transform: translate3d(38px, 6px, 0) scale(0.9) skewX(-8deg); }
          60% { opacity: 1; transform: translate3d(-6px, -8px, 0) scale(1.08); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) skewX(0deg); }
        }
        @keyframes raceHeroOvertakeLeap {
          0% { opacity: 0; transform: translate3d(44px, 10px, 0) scale(0.88); }
          45% { opacity: 1; transform: translate3d(6px, -22px, 0) scale(1.16) rotate(-5deg); }
          78% { transform: translate3d(-2px, 4px, 0) scale(1.06, 0.94); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes speedLinesMotion {
          0%, 100% { transform: translateX(0); opacity: 0.22; }
          50% { transform: translateX(-14px); opacity: 0.52; }
        }
        @media (prefers-reduced-motion: reduce) {
          .race-lane-card, .char-procedural-rig, .speed-lines-svg, .race-track-fill { animation: none !important; transform: none !important; transition: none !important; }
        }
      </style>

      <div style="position:absolute;inset:0;overflow:hidden;z-index:0;background:url('assets/worlds/${worldId}/results.jpg') center/cover no-repeat;">
        <img src="assets/worlds/${worldId}/results.jpg" alt="" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/worlds/${worldId}/lobby.jpg';}else{this.style.display='none';}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.76) saturate(1.1);">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 18%, rgba(43,33,73,0.38) 0%, rgba(10,11,24,0.82) 100%);"></div>
        <div class="hero-grid" aria-hidden="true"></div>
      </div>

      <header class="scorear-control-bar" style="position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:12px 26px;gap:12px;flex-wrap:wrap;direction:rtl;">
        <div style="display:flex;align-items:center;gap:8px;">
          <button type="button" class="scorear-gear-btn" onclick="ScoreARQuizHost.closeHostSession()" style="border-color:rgba(255,107,107,0.32);color:#fca5a5;">
            ${uiIcon('close', 14)} <span>إنهاء القاعة</span>
          </button>
          <button type="button" id="hostAudioMuteBtn" class="scorear-gear-btn scorear-audio-btn" onclick="ScoreARHostLeaderboard.toggleMuteAudio()">
            ${uiIcon(isMuted ? 'volumeOff' : 'volume', 14)} <span>${isMuted ? 'الصوت: صامت' : 'الصوت: يعمل'}</span>
          </button>
        </div>

        <div style="text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:2px;">
            <span class="launch-pill" style="padding:3px 11px;font-size:10.5px;"><span class="live-dot"></span> جولة ${currentQIndex + 1} من ${activeQuestions.length}</span>
            <h2 style="font-size:19px;font-weight:900;color:#ffffff;margin:0;display:inline-flex;align-items:center;gap:7px;">
              <span style="color:${theme.speedColor};display:inline-flex;">${uiIcon(theme.targetIcon || 'trophy', 18)}</span>
              <span>${theme.trackTitle}</span>
            </h2>
          </div>
          <small style="display:block;color:#a1a4be;font-size:11px;font-weight:700;">أفضل ٥ متسابقين في صدارة التحدي المباشر</small>
        </div>

        <button type="button" class="btn launch-primary" onclick="${hasNext ? `ScoreARQuizHost.launchQuestion(${currentQIndex + 1})` : 'ScoreARQuizHost.renderHostPodium()'}" style="padding:10px 22px;border-radius:12px;font-weight:900;font-size:13.5px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;">
          <span>${hasNext ? 'السؤال التالي' : 'تتويج الأبطال'}</span>
          ${uiIcon(hasNext ? 'arrow' : 'crown', 16)}
        </button>
      </header>

      <main style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 24px;max-width:1020px;margin:0 auto;width:100%;direction:rtl;">
        <div style="width:100%;display:flex;flex-direction:column;gap:9px;">
          ${top5.map((p, idx) => {
            const isTop1 = (idx === 0), isTop2 = (idx === 1), isTop3 = (idx === 2);
            const rankStr = String(idx + 1).padStart(2, '0');
            const rankBg = isTop1 ? 'linear-gradient(135deg,#fbbf24,#d97706)' : isTop2 ? 'linear-gradient(135deg,#94a3b8,#475569)' : isTop3 ? 'linear-gradient(135deg,#fb923c,#c2410c)' : 'rgba(255,255,255,0.06)';
            const rankColor = isTop1 ? '#0c0d1d' : '#ffffff';

            let arrowHtml = '<span style="color:#878aa6;font-size:11px;font-weight:800;">—</span>';
            if (p._rankDelta > 0) {
              arrowHtml = `<span style="color:#34d399;font-size:11px;font-weight:900;">▲ +${p._rankDelta}</span>`;
            } else if (p._rankDelta < 0) {
              arrowHtml = `<span style="color:#f87171;font-size:11px;font-weight:900;">▼ ${p._rankDelta}</span>`;
            }

            const badges = [];
            if (p.isFastest || (currentRoom.lastFastestStudent && currentRoom.lastFastestStudent.id === p.id)) {
              badges.push('<span style="background:rgba(245,158,11,0.16);border:1px solid rgba(251,191,36,0.4);color:#fde68a;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;">⚡ الأسرع</span>');
            }
            if (p.streak >= 3) {
              badges.push(`<span style="background:rgba(239,68,68,0.16);border:1px solid rgba(248,113,113,0.4);color:#fecaca;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;">🔥 ${p.streak} متتالية</span>`);
            }
            if (p.id === biggestJumperId) {
              badges.push('<span style="background:rgba(168,85,247,0.18);border:1px solid rgba(192,132,252,0.4);color:#e9d5ff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;">▲ أكبر صعود</span>');
            }

            const ptsGained = p.lastPointsGained || 0;
            const startScore = Math.max(0, (p.score || 0) - ptsGained);
            const delaySec = (idx * 0.07).toFixed(2);

            let gapHtml = '';
            if (idx > 0) {
              const abovePlayer = top5[idx - 1];
              const gap = (abovePlayer.score || 0) - (p.score || 0);
              gapHtml = `<div style="text-align:center;margin:-4px 0;font-size:10px;font-weight:800;color:#b1a2e9;"><span style="background:rgba(12,13,29,0.72);border:1px solid rgba(172,139,242,0.2);padding:2px 11px;border-radius:999px;backdrop-filter:blur(8px);">تفصلك ${gap} نقطة عن المركز #${idx}</span></div>`;
            }

            const rawAv = p.avatarId || p.characterId || p.avatar || (p.player && (p.player.avatarId || p.player.characterId)) || 'char_01';
            const avNum = parseInt(String(rawAv).replace(/\D/g, ''), 10);
            const cleanCode = /^char_\d{2}$/.test(String(rawAv).trim())
              ? String(rawAv).trim()
              : ('char_' + String((!isNaN(avNum) && avNum >= 1 && avNum <= 20) ? avNum : 1).padStart(2, '0'));
            const actionType = (worldId === 'treasure') ? 'climb' : (worldId === 'magic') ? 'fly' : 'run';
            const raceProgressPct = Math.min(92, Math.max(8, Math.round(((p.score || 0) / maxLeaderScore) * 88)));
            const startRacePct = Math.min(92, Math.max(6, Math.round((startScore / maxLeaderScore) * 88)));
            const rigAnim = p._rankDelta > 0
              ? `raceHeroOvertakeLeap 0.72s cubic-bezier(0.22,1,0.36,1) ${delaySec}s both`
              : (ptsGained > 0 ? `raceHeroRushIn 0.58s cubic-bezier(0.22,1,0.36,1) ${delaySec}s both` : 'none');

            return `
              ${gapHtml}
              <div class="race-lane-card" data-player-id="${escapeHtml(p.id || ('lb_' + idx))}" data-player-name="${escapeHtml(p.name || '')}" style="animation:raceLaneSlideIn 0.48s cubic-bezier(0.16, 1, 0.3, 1) ${delaySec}s both;position:relative;background:${theme.bgGradient};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid ${isTop1 ? 'rgba(251,191,36,0.65)' : theme.laneBorder};border-radius:18px;padding:9px 20px;display:flex;align-items:center;justify-content:space-between;box-shadow:${isTop1 ? '0 14px 36px rgba(0,0,0,0.55), 0 0 28px rgba(251,191,36,0.18)' : '0 10px 28px rgba(0,0,0,0.45)'};min-height:70px;overflow:hidden;">

                <svg class="speed-lines-svg" width="140" height="44" viewBox="0 0 140 44" fill="none" style="position:absolute;left:135px;opacity:0.28;animation:speedLinesMotion 2.2s infinite ease-in-out;pointer-events:none;">
                  <line x1="0" y1="12" x2="110" y2="12" stroke="${theme.speedColor}" stroke-width="1.5" stroke-dasharray="18 10"/>
                  <line x1="20" y1="24" x2="135" y2="24" stroke="${theme.speedColor}" stroke-width="1.5" stroke-dasharray="26 8"/>
                  <line x1="8" y1="35" x2="95" y2="35" stroke="${theme.speedColor}" stroke-width="1.2" stroke-dasharray="12 12"/>
                </svg>

                <div style="display:flex;align-items:center;gap:14px;position:relative;z-index:2;min-width:0;flex:1;">
                  <div style="display:flex;flex-direction:column;align-items:center;min-width:44px;flex-shrink:0;">
                    <span style="width:36px;height:36px;border-radius:11px;background:${rankBg};border:1px solid rgba(255,255,255,0.22);display:grid;place-items:center;font-size:14px;font-weight:900;color:${rankColor};font-family:Montserrat,monospace;box-shadow:0 4px 12px rgba(0,0,0,0.35);">${rankStr}</span>
                    <span style="margin-top:3px;">${arrowHtml}</span>
                  </div>

                  <div class="char-procedural-rig" style="animation:${rigAnim};position:relative;width:62px;height:68px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
                    <div id="hostLbHero_${idx}" data-char-code="${cleanCode}" data-action="${actionType}" data-speed="${p._rankDelta > 0 ? 1.45 : (ptsGained > 0 ? 1.2 : 0.85)}" style="width:60px;height:66px;display:flex;align-items:flex-end;justify-content:center;position:relative;">
                      <img src="assets/characters/animated/${cleanCode}-idle.webp" onerror="this.onerror=null;this.src='assets/characters/${cleanCode}_full.webp';this.onerror=function(){this.src='assets/characters/animated/char_01-idle.webp';};" alt="${escapeHtml(p.name)}" style="width:58px;height:64px;object-fit:contain;display:block;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.65));">
                    </div>
                  </div>

                  <div style="min-width:0;flex:1;max-width:440px;">
                    <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
                      <b style="font-size:16px;font-weight:900;color:#ffffff;max-width:210px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;">${escapeHtml(p.name)}</b>
                      ${isTop1 ? `<span style="color:#fbbf24;display:inline-flex;">${uiIcon('crown', 16)}</span>` : ''}
                      ${badges.join('')}
                    </div>
                    <div style="margin-top:7px;width:100%;height:8px;background:rgba(8,10,24,0.62);border-radius:999px;overflow:visible;border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;position:relative;">
                      <div class="race-track-fill" data-target-pct="${raceProgressPct}" style="width:${startRacePct}%;height:100%;background:linear-gradient(90deg, ${theme.accentColor}, ${theme.speedColor});border-radius:999px;transition:width 0.82s cubic-bezier(0.22,1,0.36,1);box-shadow:0 0 12px ${theme.speedColor};position:relative;">
                        <span style="position:absolute;left:-4px;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:50%;background:#ffffff;box-shadow:0 0 12px #ffffff, 0 0 20px ${theme.speedColor};display:${raceProgressPct > 8 ? 'block' : 'none'};"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="text-align:left;display:flex;flex-direction:column;align-items:flex-end;position:relative;z-index:2;flex-shrink:0;margin-inline-start:12px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${ptsGained > 0 ? `<span style="background:rgba(16,185,129,0.22);border:1px solid rgba(52,211,153,0.45);color:#6ee7b7;font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;">+${ptsGained}</span>` : ''}
                    <span class="scorear-count-up" data-start="${startScore}" data-target="${p.score || 0}" style="font-size:24px;font-weight:900;color:${isTop1 ? '#fef08a' : '#58dce3'};font-family:Montserrat,monospace;letter-spacing:-0.5px;">${p.score || 0}</span>
                  </div>
                  <span style="font-size:10px;color:#a1a4be;font-weight:800;">نقطة</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </main>
    `;

    const isReducedMotion = (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
      || (typeof document !== 'undefined' && document.documentElement?.classList?.contains?.('characters-paused'));
    if (!isReducedMotion && global.ScoreARMotionEngine && typeof global.ScoreARMotionEngine.mount === 'function') {
      top5.forEach((p, idx) => {
        const slot = document.getElementById('hostLbHero_' + idx);
        if (!slot) return;
        const code = slot.getAttribute('data-char-code') || 'char_01';
        const act = slot.getAttribute('data-action') || 'run';
        const spd = parseFloat(slot.getAttribute('data-speed')) || 1.1;
        try {
          global.ScoreARMotionEngine.mount(slot, code, act, { width: 60, height: 66, speed: spd, enableParticles: true, enableShadow: true });
        } catch (e) {}
      });
    }

    setTimeout(() => {
      if (typeof stage.querySelectorAll === 'function') {
        stage.querySelectorAll('.race-track-fill').forEach(fill => {
          const t = fill.getAttribute('data-target-pct');
          if (t) fill.style.width = t + '%';
        });
      }
      const countEls = stage.querySelectorAll('.scorear-count-up');
      countEls.forEach(el => {
        const start = Number(el.getAttribute('data-start')) || 0;
        const target = Number(el.getAttribute('data-target')) || 0;
        if (start === target) return;
        const duration = 750, startTime = performance.now();
        function tick(now) {
          const progress = Math.min(1, (now - startTime) / duration);
          el.textContent = Math.round(start + (target - start) * progress);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, 400);

    if (global.ScoreARRealtime) {
      const normAvatar = p => {
        const raw = p?.avatarId || p?.characterId || p?.avatar || 'char_01';
        if (/^char_\d{2}$/.test(String(raw).trim())) return String(raw).trim();
        const n = parseInt(String(raw).replace(/\D/g, ''), 10);
        return 'char_' + String((!isNaN(n) && n >= 1 && n <= 20) ? n : 1).padStart(2, '0');
      };
      global.ScoreARRealtime.publish('LEADERBOARD_UPDATE', {
        top5: top5.map(p => ({ id: p.id, name: p.name, score: p.score, avatarId: normAvatar(p) })),
        totalPlayers: sorted.length,
        allRanks: sorted.map((p, i) => ({
          id: p.id,
          name: p.name,
          avatarId: normAvatar(p),
          rank: i + 1,
          score: p.score,
          delta: p._rankDelta || 0,
          streak: p.streak || 0,
          gapToAbove: i > 0 ? ((sorted[i - 1].score || 0) - (p.score || 0)) : 0
        }))
      });
    }
  }

  function renderHostPodium(stage, currentRoom, onClose) {
    if (global.ScoreARPodiumEffects?.renderHostPodium) {
      global.ScoreARPodiumEffects.renderHostPodium(stage, currentRoom, onClose);
    }
  }

  function toggleMuteAudio() {
    if (global.ScoreARAudio?.toggleMute) {
      const muted = global.ScoreARAudio.toggleMute();
      const btn = document.getElementById('hostAudioMuteBtn');
      if (btn) btn.innerHTML = `${uiIcon(muted ? 'volumeOff' : 'volume', 14)} <span>${muted ? 'الصوت: صامت' : 'الصوت: يعمل'}</span>`;
    }
  }

  const ScoreARHostLeaderboard = {
    renderHostLeaderboard,
    renderHostPodium,
    toggleMuteAudio,
    WORLD_RACE_THEMES
  };

  global.ScoreARHostLeaderboard = ScoreARHostLeaderboard;
  try { if (typeof globalThis !== 'undefined') globalThis.ScoreARHostLeaderboard = ScoreARHostLeaderboard; } catch(e){}
  if (typeof module !== 'undefined' && module.exports) module.exports = ScoreARHostLeaderboard;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
