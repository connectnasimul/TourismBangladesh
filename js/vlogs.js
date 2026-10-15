/* =========================================================
   VLOGS
   Three travellers filmed Bangladesh and put it on YouTube.
   Cards link straight to the videos, and click plays inline in
   a lightbox. Nothing loads from YouTube until you click, so
   the page carries no third party weight at rest.
   ========================================================= */
(function () {
  'use strict';
  const cards = Array.from(document.querySelectorAll('.vlog'));
  if (!cards.length) return;

  let box = null;

  function close() {
    if (!box) return;
    box.classList.remove('on');
    const b = box;
    setTimeout(() => { if (b.parentNode) b.parentNode.removeChild(b); }, 420);
    box = null;
    document.body.classList.remove('locked');
  }

  function open(id, title, channel) {
    close();
    box = document.createElement('div');
    box.className = 'vlog-box';
    box.innerHTML =
      '<button class="vb-close" aria-label="Close">Close</button>' +
      '<div class="vb-frame"><iframe allow="autoplay; encrypted-media; picture-in-picture" ' +
        'allowfullscreen title="' + title.replace(/"/g, '') + '" ' +
        'src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1"></iframe></div>' +
      '<div class="vb-meta"><b></b><span></span></div>';
    box.querySelector('.vb-meta b').textContent = title;
    box.querySelector('.vb-meta span').textContent = channel + ' · on YouTube';
    document.body.appendChild(box);
    document.body.classList.add('locked');
    requestAnimationFrame(() => box.classList.add('on'));
    box.addEventListener('click', e => {
      if (e.target === box || e.target.closest('.vb-close')) close();
    });
  }

  cards.forEach(card => {
    card.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;  // let people open the tab
      e.preventDefault();
      open(card.dataset.id, card.dataset.title, card.dataset.channel);
    });
  });

  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
