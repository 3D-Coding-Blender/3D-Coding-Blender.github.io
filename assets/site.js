/* =========================================================
   site.js — micro-interactions for the homepage
   - Scroll-reveal (IntersectionObserver) with section + stagger
   - Magnetic hover on .pub-actions buttons
   - Pointer-driven gradient on .pub-card
   - Smooth-scroll for in-page anchors
   - News collapse toggle
   ========================================================= */
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function revealOnScroll() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .reveal-stagger, .section')
        .forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger, .section')
      .forEach(el => io.observe(el));
  }

  function smoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      a.addEventListener('click', (e) => {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Hero / lite-mode state -----------------------------------------------
  let heroScene = null;
  let heroPendingInit = false;

  function tryStartHero() {
    if (heroScene || heroPendingInit) return;
    if (typeof window.initHeroMesh !== 'function') {
      // hero-mesh.js (ES module) hasn't executed yet; retry shortly
      heroPendingInit = true;
      const retry = () => {
        heroPendingInit = false;
        if (!document.body.classList.contains('is-lite')) initHero();
      };
      setTimeout(retry, 60);
      return;
    }
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    heroScene = window.initHeroMesh(canvas, {
      autoRotate: 0.00045,
    });
  }

  function initHero() { tryStartHero(); }

  function destroyHero() {
    if (heroScene && typeof heroScene.destroy === 'function') {
      heroScene.destroy();
    }
    heroScene = null;
  }

  function liteToggle() {
    const STORE_KEY = 'lite-mode';
    const hero = document.querySelector('.hero');
    const lite = document.querySelector('.site-header');
    if (!hero || !lite) return;

    const btn = document.createElement('button');
    btn.className = 'lite-toggle';
    btn.type = 'button';

    function render() {
      const isLite = document.body.classList.contains('is-lite');
      btn.innerHTML = isLite
        ? '<i class="fa fa-magic"></i><span>Restore animation</span>'
        : '<i class="fa fa-bolt"></i><span>Lite mode</span>';
      btn.setAttribute(
        'aria-label',
        isLite ? 'Restore the animated hero' : 'Switch to a lighter version of this page'
      );
      btn.setAttribute('title', btn.getAttribute('aria-label'));
    }

    // Apply persisted choice without animating on initial load
    const saved = (() => {
      try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
    })();
    if (saved === '1') {
      document.body.classList.add('is-lite');
    } else {
      // Default: full hero — kick off particles
      initHero();
    }
    render();

    let busy = false;
    function setMode(toLite) {
      if (busy) return;
      const cur = document.body.classList.contains('is-lite');
      if (cur === toLite) return;
      busy = true;

      const fadingOut = toLite ? hero : lite;
      const fadingIn  = toLite ? lite : hero;

      // Phase 1: fade out the current view
      fadingOut.style.opacity = '0';
      fadingOut.style.pointerEvents = 'none';

      setTimeout(() => {
        // Phase 2: swap visibility via body class
        document.body.classList.toggle('is-lite', toLite);

        // Reset inline styles before fade-in (CSS controls final state)
        fadingOut.style.opacity = '';
        fadingOut.style.pointerEvents = '';

        // Force browser to paint hidden state, then fade in
        fadingIn.style.opacity = '0';
        // eslint-disable-next-line no-unused-expressions
        fadingIn.offsetHeight;
        requestAnimationFrame(() => {
          fadingIn.style.opacity = '1';
        });
        setTimeout(() => { fadingIn.style.opacity = ''; }, 450);

        // Particles lifecycle
        if (toLite) destroyHero();
        else initHero();

        try { localStorage.setItem(STORE_KEY, toLite ? '1' : '0'); } catch (e) {}
        render();
        busy = false;
      }, 380);
    }

    btn.addEventListener('click', () => {
      setMode(!document.body.classList.contains('is-lite'));
    });

    document.body.appendChild(btn);
  }

  onReady(() => {
    if (document.body.classList.contains('surflo-page')) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    // Remove any stale theme-toggle node left by a previously cached script.
    document.querySelectorAll('.theme-toggle').forEach((el) => el.remove());
    liteToggle();
    revealOnScroll();
    smoothAnchors();
  });
})();
