/* =========================================================
   Faisal Haqqani · Portfolio — Scroll Engine + Parallax
   ========================================================= */

(() => {
  const page = document.getElementById('page');
  const sections = Array.from(page.querySelectorAll('.section'));
  const total = sections.length;
  const sectionCurrent = document.getElementById('section-current');
  const sectionTotal = document.getElementById('section-total');
  const progressBar = document.getElementById('progress-bar');
  const anchorList = document.getElementById('anchors');
  const backTop = document.getElementById('back-top');

  sectionTotal.textContent = String(total).padStart(2, '0');

  // Build side anchor nav
  sections.forEach((sec, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#section-${i + 1}`;
    a.setAttribute('data-label', sec.dataset.label || `Section ${i + 1}`);
    a.setAttribute('aria-label', `Go to section ${i + 1}: ${sec.dataset.label || ''}`);
    li.appendChild(a);
    anchorList.appendChild(li);
  });
  const anchorLinks = Array.from(anchorList.querySelectorAll('a'));

  // Smooth click-to-scroll for anchors (in case browser misses scroll-behavior)
  anchorLinks.forEach((a, i) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- Parallax (scroll-driven) ----------
  const parallaxLayers = Array.from(document.querySelectorAll('[data-parallax]')).map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0,
  }));

  const flyIcons = Array.from(document.querySelectorAll('.fly-icon')).map((el) => ({
    el,
    speed: parseFloat(getComputedStyle(el).getPropertyValue('--speed')) || 0.4,
    rotateBase: (parseFloat(el.style.getPropertyValue('--left')) || 50) * 0.3,
  }));

  let rafId = null;
  let lastScrollY = window.scrollY;

  function onScrollFrame() {
    rafId = null;
    const scrollY = window.scrollY;
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = (scrollY / docHeight) * 100;

    // Progress bar
    progressBar.style.width = pct.toFixed(2) + '%';

    // Parallax: cosmic layers — set --py so animated keyframes can add their own offset
    parallaxLayers.forEach(({ el, speed }) => {
      const py = -scrollY * speed;
      if (el.classList.contains('grid-floor')) {
        el.style.transform = `perspective(900px) rotateX(62deg) translate3d(0, ${py.toFixed(1)}px, 0)`;
      } else if (el.classList.contains('aurora')) {
        // aurora has CSS animation that uses --py
        el.style.setProperty('--py', py.toFixed(1) + 'px');
      } else {
        el.style.transform = `translate3d(0, ${py.toFixed(1)}px, 0)`;
      }
    });

    // Parallax: floating icons — each has own speed; offset gives depth
    flyIcons.forEach(({ el, speed }) => {
      const py = -scrollY * speed;
      el.style.setProperty('--py', py.toFixed(1) + 'px');
      // Subtle drift on x based on scroll for variety
      const px = Math.sin((scrollY + parseFloat(el.style.getPropertyValue('--top') || '0')) * 0.002) * 12;
      el.style.setProperty('--px', px.toFixed(1) + 'px');
    });

    // Back-to-top visibility
    if (scrollY > window.innerHeight * 0.6) backTop.classList.add('is-visible');
    else backTop.classList.remove('is-visible');

    lastScrollY = scrollY;
  }

  function onScroll() {
    if (rafId === null) {
      rafId = requestAnimationFrame(onScrollFrame);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- IntersectionObserver: reveal on scroll + current section ----------
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach((el) => revealObs.observe(el));

  // Active section detection (which section is most prominently in view)
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
        const idx = sections.indexOf(entry.target);
        if (idx < 0) return;
        sectionCurrent.textContent = String(idx + 1).padStart(2, '0');
        anchorLinks.forEach((a, i) => a.classList.toggle('is-active', i === idx));
      }
    });
  }, { threshold: [0.45, 0.6, 0.8] });
  sections.forEach((sec) => sectionObs.observe(sec));

  // ---------- Keyboard scroll (arrow / pgdn jumps section) ----------
  function nearestSection(direction) {
    const sy = window.scrollY + 1;
    if (direction > 0) {
      // Find first section whose top > current scroll
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop;
        if (top > sy + 10) return sections[i];
      }
      return sections[sections.length - 1];
    } else {
      // Find last section whose top < current scroll
      for (let i = sections.length - 1; i >= 0; i--) {
        const top = sections[i].offsetTop;
        if (top < sy - 10) return sections[i];
      }
      return sections[0];
    }
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      const next = nearestSection(1);
      next?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      const prev = nearestSection(-1);
      prev?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      sections[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (e.key === 'End') {
      e.preventDefault();
      sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ---------- Back-to-top button ----------
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- 3D tilt on tilt-cards based on pointer ----------
  const tiltTargets = Array.from(document.querySelectorAll('.tilt-card'));
  let pointerRaf = null;
  let lastPointer = null;
  function applyTilts(e) {
    pointerRaf = null;
    tiltTargets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const reach = 0.9;
      if (Math.abs(dx) > reach || Math.abs(dy) > reach) {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--mx', '50%');
        el.style.setProperty('--my', '50%');
        return;
      }
      const maxTilt = 6;
      el.style.setProperty('--rx', (dx * maxTilt).toFixed(2) + 'deg');
      el.style.setProperty('--ry', (-dy * maxTilt).toFixed(2) + 'deg');
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }
  window.addEventListener('pointermove', (e) => {
    lastPointer = e;
    if (pointerRaf === null) {
      pointerRaf = requestAnimationFrame(() => applyTilts(lastPointer));
    }
  }, { passive: true });

  // ---------- Initialize ----------
  // Trigger first frame to set initial parallax / progress
  onScrollFrame();
  // Mark cover content as in-view immediately so it's visible without needing scroll
  document.querySelectorAll('.section--cover .reveal').forEach((el) => el.classList.add('in-view'));
  anchorLinks[0]?.classList.add('is-active');
})();
