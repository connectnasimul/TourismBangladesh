/* =========================================================
   BEAUTIFUL BANGLADESH — interaction layer
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STATIC = location.search.indexOf('static') !== -1;
  if (STATIC) document.documentElement.classList.add('static');

  /* ---------------- preloader ---------------- */
  const loader = STATIC ? null : $('#loader');
  if (loader) {
    const bar = $('.load-bar i', loader);
    const num = $('.load-num', loader);
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const toBn = n => String(n).split('').map(c => bn[+c] ?? c).join('');
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 9 + 3);
      if (bar) bar.style.width = p + '%';
      if (num) num.textContent = toBn(Math.round(p)) + ' %';
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => {
          loader.classList.add('done');
          document.body.classList.remove('locked');
          const hero = $('.hero');
          if (hero) hero.classList.add('ready');
          document.documentElement.classList.add('loaded');
        }, 420);
      }
    }, 130);
    document.body.classList.add('locked');
  } else {
    const hero = $('.hero');
    if (hero) hero.classList.add('ready');
  }

  /* ---------------- custom cursor ---------------- */
  const cur = $('.cursor'), dot = $('.cursor-dot');
  if (cur && dot && window.matchMedia('(hover:hover)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    const label = $('span', cur);
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    }, { passive: true });
    (function loop() {
      cx = lerp(cx, mx, .16); cy = lerp(cy, my, .16);
      cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const bind = () => $$('[data-cursor]').forEach(el => {
      if (el.__cb) return; el.__cb = 1;
      el.addEventListener('mouseenter', () => {
        cur.classList.add('big');
        if (label) label.textContent = el.dataset.cursor;
      });
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
    bind();
    $$('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => { if (!el.dataset.cursor) cur.style.opacity = '.45'; });
      el.addEventListener('mouseleave', () => { cur.style.opacity = '1'; });
    });
  }

  /* ---------------- nav ---------------- */
  const nav = $('.nav'), prog = $('.progress');
  const onScroll = () => {
    const y = scrollY;
    if (nav) nav.classList.toggle('solid', y > 60);
    if (prog) {
      const h = document.body.scrollHeight - innerHeight;
      prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = $('.menu'), burger = $('.btn-burger'), mclose = $('.menu-close');
  const setMenu = open => {
    if (!menu) return;
    menu.classList.toggle('open', open);
    document.body.classList.toggle('locked', open);
    $$('.menu a').forEach((a, i) => a.style.transitionDelay = open ? (0.12 + i * 0.055) + 's' : '0s');
  };
  if (burger) burger.addEventListener('click', () => setMenu(true));
  if (mclose) mclose.addEventListener('click', () => setMenu(false));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------------- reveal ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  $$('.rv, .clip, .river-svg').forEach(el => io.observe(el));

  /* ---------------- svg river draw ---------------- */
  $$('.river-svg path').forEach(p => {
    const len = p.getTotalLength ? p.getTotalLength() : 1200;
    p.style.setProperty('--len', len);
  });

  /* ---------------- parallax ---------------- */
  const paras = $$('[data-para]');
  if (paras.length && !reduced) {
    const run = () => {
      paras.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const speed = parseFloat(el.dataset.para) || .12;
        const off = (r.top + r.height / 2 - innerHeight / 2) * speed;
        el.style.transform = `translate3d(0,${off.toFixed(2)}px,0)`;
      });
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  /* ---------------- journeys hover peek ---------------- */
  const peek = $('.jrn-peek');
  if (peek && window.matchMedia('(hover:hover)').matches) {
    const pimg = $('img', peek);
    let px = 0, py = 0, tx = 0, ty = 0, active = false;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function pl() {
      px = lerp(px, tx, .12); py = lerp(py, ty, .12);
      peek.style.left = px + 'px'; peek.style.top = py + 'px';
      requestAnimationFrame(pl);
    })();
    $$('[data-peek]').forEach(el => {
      el.addEventListener('mouseenter', () => { pimg.src = el.dataset.peek; peek.classList.add('show'); active = true; });
      el.addEventListener('mouseleave', () => { peek.classList.remove('show'); active = false; });
    });
  }

  /* ---------------- map hotspots ---------------- */
  const hots = $$('.hot');
  if (hots.length) {
    const info = $('.map-info');
    const set = el => {
      if (!info) return;
      $('.bnn', info).textContent = el.dataset.bn || '';
      $('h3', info).textContent = el.dataset.name || '';
      $('p', info).textContent = el.dataset.desc || '';
      const link = $('a', info);
      if (link && el.dataset.href) { link.href = el.dataset.href; link.style.display = 'inline-flex'; }
      hots.forEach(h => h.classList.toggle('on', h === el));
    };
    hots.forEach(h => {
      h.addEventListener('mouseenter', () => set(h));
      h.addEventListener('click', () => set(h));
    });
    set(hots[0]);
  }

  /* ---------------- accordion ---------------- */
  $$('.acc-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const a = $('.acc-a', item);
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });

  /* ---------------- marquee seamless ---------------- */
  $$('[data-loop]').forEach(row => { row.innerHTML += row.innerHTML; });

  /* ---------------- ambient sound (synthesised weather) ---------------- */
  const soundBtn = $('.btn-sound');
  if (soundBtn) {
    let ctx = null, master = null, lp = null, hp = null, droneGain = null, on = false;
    const PROFILE = {
      rain:    { lp: 2600, hp: 260, drone: .015, gain: .55 },
      heat:    { lp: 520,  hp: 90,  drone: .05,  gain: .34 },
      kash:    { lp: 900,  hp: 150, drone: .03,  gain: .38 },
      harvest: { lp: 780,  hp: 130, drone: .035, gain: .36 },
      mist:    { lp: 420,  hp: 70,  drone: .055, gain: .3 },
      petals:  { lp: 1100, hp: 180, drone: .028, gain: .4 }
    };
    let profile = PROFILE.rain;

    const build = () => {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const len = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.0990460;
        b1 = 0.96300 * b1 + w * 0.2965164;
        b2 = 0.57000 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.16;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;

      lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = profile.lp; lp.Q.value = .6;
      hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = profile.hp;

      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 260;
      lfo.connect(lfoGain); lfoGain.connect(lp.frequency);

      const drone = ctx.createOscillator();
      drone.type = 'sine'; drone.frequency.value = 58;
      droneGain = ctx.createGain(); droneGain.gain.value = profile.drone;
      const dlfo = ctx.createOscillator(); dlfo.frequency.value = 0.11;
      const dlg = ctx.createGain(); dlg.gain.value = 0.014;
      dlfo.connect(dlg); dlg.connect(droneGain.gain);

      src.connect(hp); hp.connect(lp); lp.connect(master);
      drone.connect(droneGain); droneGain.connect(master);
      src.start(); lfo.start(); drone.start(); dlfo.start();
    };

    const applyProfile = () => {
      if (!ctx) return;
      const t = ctx.currentTime;
      lp.frequency.linearRampToValueAtTime(profile.lp, t + 1.2);
      hp.frequency.linearRampToValueAtTime(profile.hp, t + 1.2);
      droneGain.gain.linearRampToValueAtTime(profile.drone, t + 1.2);
      if (on) master.gain.linearRampToValueAtTime(profile.gain, t + 1.2);
    };

    window.BD_setAmbientAudio = fx => {
      profile = PROFILE[fx] || PROFILE.rain;
      applyProfile();
      const lbl = $('.sound-label');
      if (lbl) lbl.textContent = fx === 'rain' ? 'Monsoon rain' : fx === 'mist' ? 'Winter haor' : 'Delta ambience';
    };

    soundBtn.addEventListener('click', () => {
      if (!ctx) { build(); }
      if (ctx.state === 'suspended') ctx.resume();
      on = !on;
      soundBtn.classList.toggle('on', on);
      soundBtn.setAttribute('aria-pressed', String(on));
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(on ? profile.gain : 0, ctx.currentTime + 1.1);
    });
  }

  /* ---------------- hero video safety ---------------- */
  const hv = $('.hero-media video');
  if (hv) {
    hv.play().catch(() => {});
    hv.addEventListener('error', () => { hv.style.display = 'none'; });
    // decoding a 1600x900 film while the reader is ten screens further down is
    // pure waste, and on a mid range laptop it is what makes scrolling stutter
    let wanted = true;
    new IntersectionObserver(es => {
      wanted = es[0].isIntersecting;
      if (wanted) hv.play().catch(() => {}); else hv.pause();
    }, { threshold: 0 }).observe(hv);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) hv.pause();
      else if (wanted) hv.play().catch(() => {});
    });
  }

  /* ---------------- counters ---------------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const cio = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target, to = parseFloat(el.dataset.count), dur = 1500;
        const suf = el.dataset.suffix || '';
        let t0 = null;
        const step = t => {
          if (!t0) t0 = t;
          const k = clamp((t - t0) / dur, 0, 1);
          const v = to * (1 - Math.pow(1 - k, 3));
          el.textContent = (to % 1 ? v.toFixed(1) : Math.round(v).toLocaleString()) + suf;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------------- QA: jump to a section for screenshots ---------------- */
  const jump = new URLSearchParams(location.search).get('jump');
  if (jump) {
    const go = () => {
      const el = document.getElementById(jump) || document.querySelector('.' + jump);
      if (el) {
        const y = el.getBoundingClientRect().top + scrollY;
        window.scrollTo(0, y + (parseInt(new URLSearchParams(location.search).get('off') || '0', 10)));
        dispatchEvent(new Event('scroll'));
      }
    };
    setTimeout(go, 500); setTimeout(go, 1500); setTimeout(go, 2600);
  }

  /* ---------------- diagnostics ---------------- */
  if (location.search.indexOf('diag') !== -1) {
    setTimeout(function () {
      const de = document.documentElement;
      let worst = [], vw = de.clientWidth;
      $$('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 2 && r.width > 0) worst.push((el.tagName + '.' + (el.className || '').toString().slice(0, 24)) + '=' + Math.round(r.right));
      });
      document.title = 'SW' + de.scrollWidth + ' VW' + vw + ' | ' + worst.slice(0, 12).join(' , ');
    }, 1200);
  }

  /* ---------------- year ---------------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
