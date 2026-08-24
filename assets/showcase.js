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

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) entry.target.pause();
      });
    }, { rootMargin: '160px 0px', threshold: 0.01 });

    videos.forEach((video) => observer.observe(video));
  }
})();
