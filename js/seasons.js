/* =========================================================
   SIX SEASONS — data, weather engine, stage controller.
   Bangladesh keeps six seasons. The whole site follows them.
   ========================================================= */
window.BD_SEASONS = [
  {
    key: 'grishmo', en: 'Summer', bn: 'গ্রীষ্ম', roman: 'Grishmo',
    months: 'April to May', temp: '28 to 38 °C', fx: 'heat',
    line: 'Mango season. The heat sits on the north at 38 degrees and half the country lives on fruit.',
    detail: 'Jackfruit splits open on the tree, lychees come down from Dinajpur, and the honey collectors go into the Sundarbans with smoke and a knife. Long days, hard light, everything happening before ten in the morning or after five.',
    dos: ['Mango orchards in Rajshahi and Chapainawabganj', 'Honey collecting season in the Sundarbans', 'Sunrise walks in the hill tracts', 'Cold green coconut on every corner'],
    where: 'Rajshahi, Chapainawabganj, Sundarbans'
  },
  {
    key: 'borsha', en: 'Monsoon', bn: 'বর্ষা', roman: 'Borsha',
    months: 'June to July', temp: '25 to 32 °C', fx: 'rain',
    line: 'The rivers double in width and the whole delta floats. This is the season the country was built for.',
    detail: 'Ratargul swamp forest goes under twenty to thirty feet of water and you row through the canopy. Boat racing starts. The waterfalls in Bandarban run at full volume. Rain comes in heavy bursts, not all day, and then the light afterwards is extraordinary.',
    dos: ['Row through the flooded Ratargul swamp forest', 'Nouka Baich, monsoon boat racing', 'Nafakhum and Amiakhum falls at full flow', 'Two nights on a houseboat at Tanguar Haor'],
    where: 'Sylhet, Bandarban, Barishal'
  },
  {
    key: 'sharat', en: 'Autumn', bn: 'শরৎ', roman: 'Sharat',
    months: 'August to September', temp: '26 to 33 °C', fx: 'kash',
    line: 'White kash flowers riot along every riverbank under a sky scrubbed clean.',
    detail: 'The sharpest light of the year: towering clouds with hard blue between them. Kash grass flowers on the newest land in the country, the sandbars the rivers laid down last season, and it is over in a fortnight. Floating markets are at their best.',
    dos: ['Kash fields along the Padma and at Diabari', 'Floating guava market at Bhimruli', 'Durga Puja in Old Dhaka', 'Rocket steamer south with the windows open'],
    where: 'Padma banks, Barishal, Dhaka'
  },
  {
    key: 'hemanto', en: 'Late Autumn', bn: 'হেমন্ত', roman: 'Hemanto',
    months: 'October to November', temp: '20 to 30 °C', fx: 'harvest',
    line: 'Harvest. The paddy goes gold, the air smells of new rice, and the villages hold pitha nights.',
    detail: 'Mild, dry and the easiest window for a first trip. Nabanna, the new rice festival, moves through the villages. The first migratory birds drop into the haors. Nobody outside Bangladesh has heard of this season and it may be the best one.',
    dos: ['Paddy harvest across the north', 'Nabanna new rice festival', 'First winter birds at Tanguar and Hakaluki', 'Village pitha made with fresh molasses'],
    where: 'Rangpur, Bogura, Sylhet haors'
  },
  {
    key: 'sheet', en: 'Winter', bn: 'শীত', roman: 'Sheet',
    months: 'December to January', temp: '10 to 24 °C', fx: 'mist',
    line: 'Fog on the haors, date palm sap dripping into clay pots, birds by the hundred thousand.',
    detail: 'Cool, dry and clear once the morning fog lifts. Peak season for heritage, hill trekking and birdwatching. Paharpur at seven in the morning, with the fog still sitting on the monastery, is the photograph of the year.',
    dos: ['Birdwatching at Tanguar and Hakaluki Haor', 'Paharpur and Mahasthangarh at dawn', 'Khejur gur, date palm molasses, fresh', 'Trekking in Bandarban'],
    where: 'Naogaon, Sylhet, Bandarban'
  },
  {
    key: 'bosonto', en: 'Spring', bn: 'বসন্ত', roman: 'Bosonto',
    months: 'February to March', temp: '18 to 30 °C', fx: 'petals',
    line: 'Palash and shimul burn red across bare branches and the whole country goes outdoors.',
    detail: 'Warm days, flowering trees and the densest festival month of the year: Pohela Falgun, the Ekushey book fair spread across Dhaka University, Shivratri at Chandranath. Mustard fields are still yellow in the first weeks. Everyone wears yellow with them.',
    dos: ['Pohela Falgun on 13 February', 'Ekushey Boi Mela, all of February', 'Barefoot climb up Chandranath hill', 'Tea gardens flushing their first new leaf'],
    where: 'Dhaka, Sitakunda, Srimangal'
  }
];

(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const S = window.BD_SEASONS;
  const byKey = {};
  S.forEach(s => byKey[s.key] = s);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- weather engine ---------------- */
  function FX(canvas, opts) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let dpr = Math.min(opts.dprCap || 2, window.devicePixelRatio || 1);
    let mode = opts.mode || 'rain';
    let density = opts.density || 1;
    let parts = [];
    let raf = null, visible = true, t = 0;

    function size() {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function count() {
      const area = (W * H) / 22000;
      const base = { rain: 34, kash: 16, petals: 13, harvest: 20, mist: 6, heat: 18 }[mode] || 16;
      return Math.max(8, Math.min(420, Math.round(base * area * density)));
    }

    function make() {
      const r = Math.random;
      switch (mode) {
        case 'rain':
          return { x: r() * (W + 300) - 150, y: r() * -H, l: 12 + r() * 26, v: 8 + r() * 9, o: .15 + r() * .5, w: r() < .2 ? 1.6 : .9 };
        case 'kash':
          return { x: r() * W, y: r() * H, s: 1.4 + r() * 3.2, v: .25 + r() * .55, sw: r() * 6.28, sp: .008 + r() * .02, o: .3 + r() * .55 };
        case 'petals':
          return { x: r() * W, y: r() * H, s: 3 + r() * 5, v: .7 + r() * 1.5, rot: r() * 6.28, vr: (r() - .5) * .07, sw: r() * 6.28, sp: .012 + r() * .02, o: .4 + r() * .5, c: r() < .5 ? 1 : 0 };
        case 'harvest':
          return { x: r() * W, y: r() * H, s: .8 + r() * 2.1, v: .18 + r() * .5, dx: (r() - .5) * .5, o: .25 + r() * .5 };
        case 'mist':
          return { x: r() * (W + 400) - 200, y: r() * H, s: 90 + r() * 220, v: .12 + r() * .35, o: .04 + r() * .1 };
        case 'heat':
        default:
          return { x: r() * W, y: H + r() * H * .5, s: .8 + r() * 2.4, v: .3 + r() * .9, sw: r() * 6.28, sp: .02 + r() * .03, o: .12 + r() * .35 };
      }
    }

    function seed() { parts = new Array(count()).fill(0).map(make); }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 1;

      if (mode === 'rain') {
        ctx.lineCap = 'round';
        for (const p of parts) {
          p.y += p.v; p.x += p.v * .34;
          if (p.y > H + 40) { p.y = -30 - Math.random() * 60; p.x = Math.random() * (W + 300) - 150; }
          ctx.strokeStyle = 'rgba(226,240,240,' + p.o + ')';
          ctx.lineWidth = p.w;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.l * .34, p.y - p.l);
          ctx.stroke();
        }
        // splashes along the bottom
        ctx.strokeStyle = 'rgba(226,240,240,.22)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 7; i++) {
          const x = (Math.sin(t * .07 + i * 2.1) * .5 + .5) * W;
          const r = 2 + ((t * .6 + i * 30) % 26);
          ctx.globalAlpha = Math.max(0, 1 - r / 26) * .5;
          ctx.beginPath();
          ctx.ellipse(x, H - 6, r, r * .28, 0, 0, 6.283);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (mode === 'kash') {
        for (const p of parts) {
          p.y += p.v; p.sw += p.sp; p.x += Math.sin(p.sw) * .7;
          if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
          ctx.fillStyle = 'rgba(250,248,240,' + p.o + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
          ctx.strokeStyle = 'rgba(250,248,240,' + (p.o * .35) + ')';
          ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.s * 2.4, p.y - p.s * 2.4); ctx.stroke();
        }
      } else if (mode === 'petals') {
        for (const p of parts) {
          p.y += p.v; p.sw += p.sp; p.x += Math.sin(p.sw) * 1.5; p.rot += p.vr;
          if (p.y > H + 14) { p.y = -14; p.x = Math.random() * W; }
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.c ? 'rgba(232,80,59,' + p.o + ')' : 'rgba(242,193,78,' + p.o + ')';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.s, p.s * .48, 0, 0, 6.283);
          ctx.fill();
          ctx.restore();
        }
      } else if (mode === 'harvest') {
        for (const p of parts) {
          p.y += p.v; p.x += p.dx + Math.sin((p.y + p.x) * .01) * .3;
          if (p.y > H + 8) { p.y = -8; p.x = Math.random() * W; }
          if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
          ctx.fillStyle = 'rgba(226,182,80,' + p.o + ')';
          ctx.fillRect(p.x, p.y, p.s, p.s * 2.4);
        }
      } else if (mode === 'mist') {
        for (const p of parts) {
          p.x += p.v;
          if (p.x - p.s > W + 60) { p.x = -p.s - 60; p.y = Math.random() * H; }
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s);
          g.addColorStop(0, 'rgba(226,238,242,' + p.o + ')');
          g.addColorStop(1, 'rgba(226,238,242,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
        }
      } else { // heat
        for (const p of parts) {
          p.y -= p.v; p.sw += p.sp; p.x += Math.sin(p.sw) * .9;
          if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
          ctx.fillStyle = 'rgba(255,214,140,' + p.o + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,180,80,.03)';
        const band = (t * .7) % (H + 200) - 100;
        ctx.fillRect(0, band, W, 90);
      }
      raf = requestAnimationFrame(draw);
    }

    function start() { if (!raf) raf = requestAnimationFrame(draw); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, W, H); }

    size();
    addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    if (opts.observe) {
      new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
    } else {
      start();
    }
    return {
      set: m => { if (m !== mode) { mode = m; seed(); } },
      start, stop
    };
  }

  /* ---------------- ambient layer (whole site) ---------------- */
  let ambient = null;
  if (!reduced) {
    const c = document.createElement('canvas');
    c.className = 'season-ambient';
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    ambient = FX(c, { mode: 'rain', density: .26, dprCap: 1 });
  }

  /* ---------------- stage ---------------- */
  let stageFX = null;
  const stage = $('.season-stage');
  if (stage && !reduced) {
    stageFX = FX($('.season-canvas', stage), { mode: 'rain', density: 1, observe: true });
  }

  // per-panel weather on the Six Seasons page
  if (!reduced) {
    document.querySelectorAll('[data-fx-canvas]').forEach(c => {
      FX(c, { mode: c.getAttribute('data-fx-canvas'), density: .9, observe: true });
    });
  }

  let auto = null, userPicked = false;

  function paintStage(s) {
    if (!stage) return;
    const img = $('.season-bg img', stage);
    if (img) {
      const src = 'assets/img/season-' + s.key + '.webp';
      img.style.opacity = 0;
      const swap = () => {
        if (document.documentElement.getAttribute('data-season') !== s.key) return;  // moved on already
        img.src = src; img.alt = s.en + ' in Bangladesh'; img.style.opacity = 1;
      };
      const pre = new Image();
      pre.src = src;
      if (pre.decode) pre.decode().then(swap, swap);          // decode off the main thread
      else setTimeout(swap, 200);
    }
    const set = (sel, val) => { const el = $(sel, stage); if (el) el.textContent = val; };
    set('.st-en', s.en);
    set('.st-bn', s.bn);
    set('.st-roman', s.roman);
    set('.st-months', s.months);
    set('.st-temp', s.temp);
    set('.st-line', s.line);
    set('.st-detail', s.detail);
    set('.st-where', s.where);
    const ul = $('.st-dos', stage);
    if (ul) ul.innerHTML = s.dos.map(d => '<li>' + d + '</li>').join('');
    const num = $('.st-index', stage);
    if (num) num.textContent = String(S.indexOf(s) + 1).padStart(2, '0') + ' / 06';
    if (stageFX) stageFX.set(s.fx);
  }

  window.BD_applySeason = function (key, fromUser) {
    const s = byKey[key];
    if (!s) return;
    document.documentElement.setAttribute('data-season', key);
    document.documentElement.setAttribute('data-fx', s.fx);
    $$('[data-season]').forEach(b => {
      if (b.tagName === 'HTML') return;
      b.setAttribute('aria-pressed', String(b.dataset.season === key));
      b.classList.toggle('on', b.dataset.season === key);
    });
    // shared inline labels
    const put = (sel, v) => $$(sel).forEach(e => e.textContent = v);
    put('#season-name', s.en);
    put('#season-bn', s.bn);
    put('#season-months', s.months);
    const ln = $('#season-line');
    if (ln) { ln.style.opacity = 0; setTimeout(() => { ln.textContent = s.line; ln.style.opacity = 1; }, 200); }
    paintStage(s);
    if (ambient) ambient.set(s.fx);
    if (window.BD_setAmbientAudio) window.BD_setAmbientAudio(s.fx);
    if (fromUser) {
      userPicked = true;
      if (auto) { clearInterval(auto); auto = null; }
      try { localStorage.setItem('bd-season', key); } catch (e) {}
    }
  };

  function todaysSeason() {
    const m = new Date().getMonth();
    return ['sheet', 'bosonto', 'bosonto', 'grishmo', 'grishmo', 'borsha',
            'borsha', 'sharat', 'sharat', 'hemanto', 'hemanto', 'sheet'][m];
  }

  function init() {
    $$('.season-btn, .season-chip').forEach(b => {
      b.addEventListener('click', () => window.BD_applySeason(b.dataset.season, true));
    });
    let stored = null;
    try { stored = localStorage.getItem('bd-season'); } catch (e) {}
    const start = (stored && byKey[stored]) ? stored : todaysSeason();
    window.BD_applySeason(start, false);
    const today = todaysSeason();
    $$('#season-today').forEach(b => b.textContent = byKey[today].en);
    const chipNow = document.querySelector('.season-chip[data-season="' + today + '"]');
    if (chipNow && !chipNow.querySelector('.cnow')) {
      const tag = document.createElement('span');
      tag.className = 'cnow';
      tag.textContent = 'Now';
      chipNow.appendChild(tag);
    }

    // gentle auto tour of the seasons while nobody has chosen
    if (stage && !reduced && !stored) {
      let i = S.findIndex(s => s.key === start);
      auto = setInterval(() => {
        if (userPicked) return;
        const r = stage.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        i = (i + 1) % S.length;
        window.BD_applySeason(S[i].key, false);
      }, 9000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // warm the other five photographs while nothing is happening. rel=preload
  // fetches the bytes without keeping a decoded bitmap for each one, and the
  // decode then happens off the main thread at switch time.
  const warm = () => S.forEach(s => {
    const l = document.createElement('link');
    l.rel = 'preload'; l.as = 'image';
    l.href = 'assets/img/season-' + s.key + '.webp';
    document.head.appendChild(l);
  });
  if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 4000 });
  else addEventListener('load', () => setTimeout(warm, 1800));
})();
