(function () {
  'use strict';

  const legacySelectors = [
    '#meta',
    '.section-video',
    '.section-tldr-cards',
    '.section-tldr',
    '.section-problem',
    '.section-scaling',
    '.section-resolution',
    '.section-guidance',
    '.section-comparison',
    '.section-quantitative',
    '.section-dataset',
    '.section-cite'
  ];

  document.querySelectorAll(legacySelectors.join(',')).forEach((element) => element.remove());

  const cards = Array.from(document.querySelectorAll('.showcase-card'));
  const videos = cards
    .map((card) => card.querySelector('video'))
    .filter(Boolean);

  function playCard(card) {
    const video = card.querySelector('video');
    card.classList.add('is-active');
    if (video) {
      video.play().catch(() => {
        // Browsers may decline playback until the first user gesture.
      });
    }
  }

  function pauseCard(card) {
    const video = card.querySelector('video');
    card.classList.remove('is-active');
    if (video) video.pause();
  }

  cards.forEach((card) => {
    card.addEventListener('pointerenter', () => playCard(card));
    card.addEventListener('pointerleave', () => pauseCard(card));
    card.addEventListener('focusin', () => playCard(card));
    card.addEventListener('focusout', () => pauseCard(card));
  });

  // Generation section tabs --------------------------------------------
  document.querySelectorAll('.showcase-tabs').forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('.showcase-tab'));
    const section = tablist.closest('.showcase-section');
    const panels = section
      ? Array.from(section.querySelectorAll(':scope > .showcase-tab-panel'))
      : [];
    if (!tabs.length || !panels.length) return;

    function activate(index) {
      index = Math.max(0, Math.min(tabs.length - 1, index));
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        const active = i === index;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(i));
      tab.addEventListener('keydown', (event) => {
        let next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next);
        tabs[next].focus();
      });
    });

    const initial = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    activate(initial >= 0 ? initial : 0);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) entry.target.pause();
      });
    }, { rootMargin: '160px 0px', threshold: 0.01 });

    videos.forEach((video) => observer.observe(video));
  }
})();
