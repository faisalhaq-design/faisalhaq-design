/* =========================================================
   Faisal Haqqani · 3D Seamless Portfolio — Slide Engine
   ========================================================= */

(() => {
  const deck = document.getElementById('deck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const total = slides.length;
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const dotsWrap = document.getElementById('dots');
  const counterCurrent = document.getElementById('slide-current');
  const counterTotal = document.getElementById('slide-total');
  const progressBar = document.getElementById('progress-bar');

  let index = 0;
  let isAnimating = false;
  const NAV_COOLDOWN = 650;

  // Build dots
  counterTotal.textContent = String(total).padStart(2, '0');
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('.dot'));

  function applyState() {
    slides.forEach((s, i) => {
      s.classList.remove('is-active', 'is-prev', 'is-next');
      if (i === index) s.classList.add('is-active');
      else if (i < index) s.classList.add('is-prev');
      else s.classList.add('is-next');
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    counterCurrent.textContent = String(index + 1).padStart(2, '0');
    const pct = ((index + 1) / total) * 100;
    progressBar.style.width = pct + '%';
  }

  function goTo(target) {
    if (isAnimating) return;
    const next = Math.max(0, Math.min(total - 1, target));
    if (next === index) return;
    index = next;
    isAnimating = true;
    applyState();
    setTimeout(() => { isAnimating = false; }, NAV_COOLDOWN);
  }

  function nextSlide() { goTo(index + 1); }
  function prevSlide() { goTo(index - 1); }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Keyboard nav
  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      nextSlide();
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(total - 1);
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  // Wheel navigation (with throttle)
  let wheelLock = false;
  deck.addEventListener('wheel', (e) => {
    // Allow horizontal scroll trackpads to flick between slides
    if (wheelLock || isAnimating) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 18) return;
    e.preventDefault();
    wheelLock = true;
    if (delta > 0) nextSlide();
    else prevSlide();
    setTimeout(() => { wheelLock = false; }, NAV_COOLDOWN);
  }, { passive: false });

  // Touch swipe
  let touchStartX = null;
  let touchStartY = null;
  deck.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextSlide();
      else prevSlide();
    } else if (Math.abs(dy) > 80) {
      if (dy < 0) nextSlide();
      else prevSlide();
    }
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  // 3D tilt on tilt-cards based on pointer
  const tiltTargets = Array.from(document.querySelectorAll('.tilt-card'));
  function onPointerMove(e) {
    tiltTargets.forEach((el) => {
      const r = el.getBoundingClientRect();
      // Only react if pointer is reasonably close to card
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
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Parallax on the cosmos based on slide
  const aurora1 = document.querySelector('.aurora-1');
  const aurora2 = document.querySelector('.aurora-2');
  function updateAurora() {
    if (!aurora1 || !aurora2) return;
    const t = index / Math.max(1, total - 1);
    aurora1.style.transform = `translate3d(${t * -6}%, ${t * -3}%, 0) scale(${1 + t * 0.1})`;
    aurora2.style.transform = `translate3d(${t * 6}%, ${t * 3}%, 0) scale(${1 + t * 0.1})`;
  }
  const obs = new MutationObserver(updateAurora);
  obs.observe(deck, { subtree: true, attributes: true, attributeFilter: ['class'] });

  // Initialize
  applyState();
  updateAurora();
  deck.focus({ preventScroll: true });
})();
