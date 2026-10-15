/* =========================================================
   THE RIVER MAP
   628 named rivers, drawn from OpenStreetMap geometry, with a
   pulse that runs from the Himalayan foot down to the Bay of
   Bengal, the way the water actually goes.
   ========================================================= */
(function () {
  'use strict';
  const holder = document.querySelector('.rivermap');
  if (!holder || !window.BD_RIVERS || !window.BD_OUTLINE) return;

  const M = window.BD_MAP || { w: 1000, h: 1362 };
  const R = window.BD_RIVERS;
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const HOTS = [
    { n: 'Dhaka',          x: 512, y: 638,  a: 'start', href: 'destinations.html#dhaka',
      d: 'The capital, a Mughal river port turned megacity of 23 million, sitting on the Buriganga.' },
    { n: 'Srimangal',      x: 794, y: 525,  a: 'end',   href: 'destinations.html#sylhet',
      d: 'Tea country. Around 150 gardens, a rainforest with gibbons, and the swamp forest of Ratargul north of it.' },
    { n: 'Tanguar Haor',   x: 651, y: 348,  a: 'start', href: 'destinations.html#haor',
      d: 'A Ramsar wetland that floods to the size of a small sea every monsoon and drains again by February.' },
    { n: 'Paharpur',       x: 205, y: 361,  a: 'start', href: 'destinations.html#paharpur',
      d: 'Somapura Mahavihara, an eighth century Buddhist monastery and UNESCO World Heritage site.' },
    { n: 'Bagerhat',       x: 378, y: 901,  a: 'end',   href: 'destinations.html#bagerhat',
      d: 'A fifteenth century mosque city on the edge of the mangroves. Also UNESCO World Heritage.' },
    { n: 'Sundarbans',     x: 274, y: 1060, a: 'start', href: 'destinations.html#sundarbans',
      d: 'The largest mangrove forest on earth, and the only one with tigers. Reached only by boat.' },
    { n: 'Kuakata',        x: 449, y: 1091, a: 'start', href: 'destinations.html#kuakata',
      d: 'An 18 kilometre beach where the sun rises and sets over the same water.' },
    { n: 'Bandarban',      x: 899, y: 1005, a: 'end',   href: 'destinations.html#hilltracts',
      d: 'Hills, waterfalls and the highest peaks in the country, plus eleven indigenous communities.' },
    { n: "Cox's Bazar",    x: 853, y: 1179, a: 'end',   href: 'destinations.html#coxsbazar',
      d: 'About 120 kilometres of unbroken sand, the longest natural sea beach in the world.' }
  ];

  const PAD = 40;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `${-PAD} ${-PAD / 2} ${M.w + PAD * 2} ${M.h + PAD}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Map of Bangladesh showing 628 named rivers flowing to the Bay of Bengal');
  svg.classList.add('rm-svg');

  svg.innerHTML =
    '<defs>' +
      '<clipPath id="rmClip"><path d="' + window.BD_OUTLINE + '"/></clipPath>' +
      '<linearGradient id="rmPulse" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset="42%" stop-color="#fff" stop-opacity=".85"/>' +
        '<stop offset="58%" stop-color="#fff" stop-opacity=".85"/>' +
        '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<mask id="rmMask" maskUnits="userSpaceOnUse" x="' + (-PAD) + '" y="' + (-M.h) + '" width="' + (M.w + PAD * 2) + '" height="' + (M.h * 3) + '">' +
        '<rect class="rm-pulse-rect" x="' + (-PAD) + '" y="0" width="' + (M.w + PAD * 2) + '" height="' + Math.round(M.h * 0.5) + '" fill="url(#rmPulse)"/>' +
      '</mask>' +
    '</defs>';

  const land = document.createElementNS(NS, 'path');
  land.setAttribute('d', window.BD_OUTLINE);
  land.setAttribute('class', 'rm-land');
  svg.appendChild(land);

  function riverGroup(cls, filter) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', cls);
    g.setAttribute('clip-path', 'url(#rmClip)');
    let n = 0;
    R.forEach(r => {
      if (filter && !filter(r)) return;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', r.d);
      p.setAttribute('class', r.w === 2 ? 'major' : 'minor');
      if (r.w === 2) p.setAttribute('data-name', r.n);
      g.appendChild(p); n++;
    });
    return g;
  }

  const base = riverGroup('rm-rivers');
  svg.appendChild(base);

  // the pulse: only the trunk rivers light up, masked by a band that travels south
  const bright = riverGroup('rm-rivers rm-bright', r => r.w === 2);
  bright.setAttribute('mask', 'url(#rmMask)');
  bright.setAttribute('clip-path', 'url(#rmClip)');
  svg.appendChild(bright);

  // hotspots
  const hg = document.createElementNS(NS, 'g');
  hg.setAttribute('class', 'rm-hots');
  HOTS.forEach(h => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'hot');
    g.innerHTML =
      '<circle class="ring" cx="' + h.x + '" cy="' + h.y + '" r="13"/>' +
      '<circle class="dot" cx="' + h.x + '" cy="' + h.y + '" r="7"/>' +
      '<text x="' + (h.x + (h.a === 'start' ? 16 : -16)) + '" y="' + (h.y + 6) + '" style="text-anchor:' + h.a + '">' + h.n + '</text>';
    g.addEventListener('mouseenter', () => select(h, g));
    g.addEventListener('click', () => select(h, g));
    hg.appendChild(g);
    h._g = g;
  });
  svg.appendChild(hg);
  holder.appendChild(svg);

  const info = document.querySelector('.rm-info');
  function select(h, g) {
    if (!info) return;
    info.querySelector('h3').textContent = h.n;
    info.querySelector('p').textContent = h.d;
    const a = info.querySelector('a');
    if (a) { a.href = h.href; a.style.display = 'inline-flex'; }
    HOTS.forEach(o => o._g.classList.toggle('on', o === h));
  }
  select(HOTS[0], HOTS[0]._g);

  // river name readout: cycle through the trunk rivers
  const named = [];
  const seen = {};
  R.forEach(r => { if (r.w === 2 && !seen[r.n]) { seen[r.n] = 1; named.push(r.n); } });
  const ticker = document.querySelector('.rm-rivername');
  if (ticker && named.length && !reduced) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % named.length;
      ticker.style.opacity = 0;
      setTimeout(() => { ticker.textContent = named[i]; ticker.style.opacity = 1; }, 260);
    }, 2600);
    ticker.textContent = named[0];
  } else if (ticker) {
    ticker.textContent = named[0] || 'Padma';
  }

  const total = document.querySelector('.rm-count');
  if (total) {
    const uniq = {};
    R.forEach(r => uniq[r.n] = 1);
    total.textContent = Object.keys(uniq).length;
  }

  if (reduced) svg.classList.add('rm-still');
})();
