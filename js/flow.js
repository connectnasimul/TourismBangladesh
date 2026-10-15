/* =========================================================
   FLOW
   Bangladesh is defined by rivers, so the page moves like one.
   Three parts:
     1. the scroll itself is eased, so a wheel notch becomes a
        current rather than a jump
     2. sections drift, lag and shear very slightly with the
        speed of the water
     3. a river runs down the left edge and a boat rides it as
        you go
   Native scrolling is never replaced, only smoothed, so sticky
   elements, anchors, keyboards and touch all still behave.
   ========================================================= */
(function () {
  'use strict';
  const doc = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover:none)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  if (reduced) return;

  doc.classList.add('flowing');

  const maxScroll = () => Math.max(0, doc.scrollHeight - innerHeight);

  let target = window.scrollY;
  let current = target;
  let prev = target;
  let vel = 0;
  let driving = false;          // true while we are easing the page ourselves
  let idle = 0;

  /* ---------- 1. the current ---------- */
  const smooth = !coarse;

  if (smooth) {
    const scrollableUnder = t => {
      let n = t;
      while (n && n !== document.body && n !== doc) {
        if (n.scrollHeight > n.clientHeight + 2 || n.scrollWidth > n.clientWidth + 2) {
          const o = getComputedStyle(n).overflow + getComputedStyle(n).overflowX + getComputedStyle(n).overflowY;
          if (/auto|scroll/.test(o)) return true;
        }
        n = n.parentElement;
      }
      return false;
    };

    addEventListener('wheel', e => {
      if (e.ctrlKey) return;                       // pinch zoom
      if (scrollableUnder(e.target)) return;       // let inner scrollers have it
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      e.preventDefault();
      // reversing direction cancels whatever is still in flight, so the page
      // turns round immediately instead of finishing the old journey first
      const inFlight = target - current;
      if (inFlight !== 0 && Math.sign(d) !== Math.sign(inFlight)) target = current;
      // and a fast flick can never queue more than a screen and a half,
      // which is what used to make it feel stuck
      const lead = innerHeight * 1.5;
      target = clamp(clamp(target + d * 1.06, current - lead, current + lead), 0, maxScroll());
      driving = true;
    }, { passive: false });

    const KEYS = { PageDown: 1, PageUp: -1, ArrowDown: .18, ArrowUp: -.18, ' ': 1 };
    addEventListener('keydown', e => {
      if (e.target.matches('input,textarea,select,[contenteditable]')) return;
      if (e.key === 'Home' || e.key === 'End') {
        target = e.key === 'Home' ? 0 : maxScroll();
        driving = true; e.preventDefault(); return;
      }
      const k = KEYS[e.key];
      if (k === undefined) return;
      const lead = innerHeight * 1.6;
      target = clamp(clamp(target + k * innerHeight * 0.82, current - lead, current + lead), 0, maxScroll());
      driving = true;
      e.preventDefault();
    });

    // anchors glide instead of snapping
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      target = clamp(el.getBoundingClientRect().top + window.scrollY, 0, maxScroll());
      driving = true;
      history.replaceState(null, '', '#' + id);
    });
  }

  /* ---------- 3. the river down the left edge ---------- */
  let rlFill = null, rlBoat = null, rlLen = 0, rlPath = null;
  if (!coarse) {
    const wrap = document.createElement('div');
    wrap.className = 'riverline';
    wrap.setAttribute('aria-hidden', 'true');
    const D = 'M20 0 C 6 90, 34 180, 20 270 C 6 360, 34 450, 20 540 ' +
              'C 6 630, 34 720, 20 810 C 6 900, 34 960, 20 1000';
    wrap.innerHTML =
      '<svg viewBox="0 0 40 1000" preserveAspectRatio="none">' +
        '<path class="rl-bed" d="' + D + '"/>' +
        '<path class="rl-fill" d="' + D + '"/>' +
      '</svg><i class="rl-boat"></i>';
    document.body.appendChild(wrap);
    rlPath = wrap.querySelector('.rl-fill');
    rlBoat = wrap.querySelector('.rl-boat');
    rlLen = rlPath.getTotalLength();
    rlPath.style.strokeDasharray = rlLen;
    rlPath.style.strokeDashoffset = rlLen;
    rlFill = wrap;
  }

  /* ---------- 2. what drifts ---------- */
  const SETS = [
    ['.hero-in', 0.05],
    ['.vt', 0.055],
    ['.exp', 0.05],
    ['.dish', 0.055],
    ['.vlog', 0.05],
    ['.mosaic figure', 0.09],
    ['.jrn-item', 0.035],
    ['.dcard', 0.07],
    ['.fact', 0.04],
    ['.src', 0.04],
    ['.pm-rules div', 0.03],
    ['.st-dos li', 0.03],
    ['.rm-readout div', 0.04],
    ['.stat', 0.045],
    ['.season-panel .sp-in', 0.05],
    ['.river-item', 0.028]
  ];
  const drifters = [];
  SETS.forEach(([sel, base]) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('drift');
      drifters.push({ el, f: base * (1 + (i % 4) * 0.42), r: null });
    });
  });

  let frame = 0, docH = 0, rlH = 0, rlLast = -1;

  // one layout read per element, at rest, instead of sixty a second while moving
  function measure() {
    const y = window.scrollY;
    for (const d of drifters) {
      const r = d.el.getBoundingClientRect();
      d.top = r.top + y;
      d.h = r.height;
    }
    docH = doc.scrollHeight;
    if (rlFill) rlH = rlFill.clientHeight || innerHeight;
  }
  // lazy images and web fonts change the geometry after load, so re-measure
  addEventListener('load', () => { measure(); setTimeout(measure, 800); setTimeout(measure, 2500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(measure, 60));

  function step() {
    const realY = window.scrollY;

    if (driving) {
      // something else moved the page: a scrollbar drag, find-in-page, an
      // anchor jump. Whoever moved it last wins.
      if (Math.abs(realY - current) > 6 && Math.abs(realY - prev) > 6) {
        current = target = realY;
        driving = false;
      } else {
        // ease harder over long distances so a flick resolves quickly
        const dist = Math.abs(target - current);
        const k = 0.075 + Math.min(0.17, dist / (innerHeight * 5));
        current = lerp(current, target, k);
        if (dist < 0.6) { current = target; driving = false; }
        window.scrollTo(0, current);
      }
    } else {
      current = target = realY;
    }

    const raw = current - prev;
    prev = current;
    vel = lerp(vel, clamp(raw, -70, 70), 0.22);
    if (Math.abs(vel) < 0.02) vel = 0;

    // nothing is moving: stop touching the DOM at all
    if (!driving && raw === 0 && vel === 0) return;

    doc.style.setProperty('--flow-v', vel.toFixed(2));

    // drift, from cached offsets: arithmetic only, no layout reads
    frame++;
    if (frame % 2 === 0) {
      const vh = innerHeight, y = current;
      for (const d of drifters) {
        const top = d.top - y;
        if (top + d.h < -200 || top > vh + 200) continue;
        const p = (vh - top) / (vh + d.h);              // 0 entering, 1 leaving
        d.el.style.setProperty('--drift', ((0.5 - p) * d.f * 200).toFixed(2) + 'px');
      }
    }

    // the river fills and the boat rides it, only when it has actually moved
    if (rlPath) {
      const m = Math.max(0, docH - innerHeight);
      const p = m > 0 ? clamp(current / m, 0, 1) : 0;
      if (Math.abs(p - rlLast) > 0.0008) {
        rlLast = p;
        rlPath.style.strokeDashoffset = (rlLen * (1 - p)).toFixed(1);
        const pt = rlPath.getPointAtLength(rlLen * p);
        rlBoat.style.transform = 'translate(' + ((pt.x / 40) * 100 - 50).toFixed(2) + '%,' +
          ((pt.y / 1000) * (rlH || innerHeight)).toFixed(1) + 'px)';
      }
      rlFill.classList.toggle('running', Math.abs(vel) > 1.2);
    }
  }

  function loop() { step(); requestAnimationFrame(loop); }

  addEventListener('resize', measure);
  measure();
  requestAnimationFrame(loop);

  /* QA: ?flowprobe=1 reports the engine's state in the document title */
  if (location.search.indexOf('flowprobe') !== -1) {
    setTimeout(() => {
      const before = window.scrollY;
      for (let i = 0; i < 12; i++) {
        dispatchEvent(new WheelEvent('wheel', { deltaY: 180, deltaMode: 0, cancelable: true }));
      }
      for (let i = 0; i < 90; i++) step();
      setTimeout(() => {
        const t = document.querySelector('.drift');
        document.title = [
          'frames=' + frame,
          'before=' + Math.round(before),
          'mid=' + Math.round(window.scrollY),
          'target=' + Math.round(target),
          'v=' + vel.toFixed(2),
          'drift=' + (t ? t.style.getPropertyValue('--drift') : 'none'),
          'boat=' + (rlBoat ? rlBoat.style.transform : 'none')
        ].join(' | ');
        setTimeout(() => {
          for (let i = 0; i < 220; i++) step();
          document.title += ' || settled=' + Math.round(window.scrollY) +
            ' target=' + Math.round(target) + ' v=' + vel.toFixed(2);
        }, 300);
      }, 500);
    }, 1600);
  }
})();
