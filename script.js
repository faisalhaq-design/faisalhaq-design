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

  // Smooth click-to-scroll for anchors
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

    // Parallax: cosmic layers
    parallaxLayers.forEach(({ el, speed }) => {
      const py = -scrollY * speed;
      if (el.classList.contains('grid-floor')) {
        el.style.transform = `perspective(900px) rotateX(62deg) translate3d(0, ${py.toFixed(1)}px, 0)`;
      } else if (el.classList.contains('aurora')) {
        el.style.setProperty('--py', py.toFixed(1) + 'px');
      } else {
        el.style.transform = `translate3d(0, ${py.toFixed(1)}px, 0)`;
      }
    });

    // Parallax: floating icons
    flyIcons.forEach(({ el, speed }) => {
      const py = -scrollY * speed;
      el.style.setProperty('--py', py.toFixed(1) + 'px');
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

  // Active section detection
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

  // ---------- Keyboard scroll ----------
  function nearestSection(direction) {
    const sy = window.scrollY + 1;
    if (direction > 0) {
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop;
        if (top > sy + 10) return sections[i];
      }
      return sections[sections.length - 1];
    } else {
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

  // =========================================================
  // NEW: Text Scramble Effect
  // =========================================================
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.original = el.dataset.text || el.innerText;
    }
    scramble() {
      const length = this.original.length;
      let iteration = 0;
      const interval = setInterval(() => {
        this.el.innerText = this.original
          .split('')
          .map((char, index) => {
            if (index < iteration) return this.original[index];
            return this.chars[Math.floor(Math.random() * this.chars.length)];
          })
          .join('');
        if (iteration >= length) {
          clearInterval(interval);
          this.el.classList.add('done');
        }
        iteration += 1 / 2;
      }, 30);
    }
  }

  document.querySelectorAll('.scramble-text').forEach((el, i) => {
    const scrambler = new TextScramble(el);
    setTimeout(() => scrambler.scramble(), 400 + i * 600);
  });

  // =========================================================
  // NEW: Typewriter Effect
  // =========================================================
  function typewriterEffect(el, speed = 60) {
    const text = el.dataset.text || el.innerText;
    el.innerText = '';
    el.style.width = 'auto';
    let i = 0;
    function type() {
      if (i < text.length) {
        el.innerText += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        el.classList.add('done');
      }
    }
    setTimeout(type, 1800);
  }

  document.querySelectorAll('.typewriter').forEach((el) => {
    typewriterEffect(el);
  });

  // =========================================================
  // NEW: Custom Cursor with Trail
  // =========================================================
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  if (cursor && trail && !window.matchMedia('(pointer: coarse)').matches) {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx, ty = cy;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
    }, { passive: true });

    function updateCursor() {
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';

      tx += (cx - tx) * 0.15;
      ty += (cy - ty) * 0.15;
      trail.style.left = tx + 'px';
      trail.style.top = ty + 'px';

      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover state on interactive elements
    const interactives = document.querySelectorAll('a, button, .tilt-card, .cta, .contact-row, .scroll-indicator');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    document.body.style.cursor = 'none';
  } else {
    if (cursor) cursor.style.display = 'none';
    if (trail) trail.style.display = 'none';
  }

  // =========================================================
  // NEW: Particle Canvas Background
  // =========================================================
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];
    const particleCount = 60;
    const connectionDistance = 120;
    const maxConnections = 3;

    function resizeCanvas() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 92, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance && connections < maxConnections) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124, 92, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            connections++;
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // =========================================================
  // NEW: Magnetic Buttons
  // =========================================================
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });

  // =========================================================
  // NEW: Animated Counter
  // =========================================================
  document.querySelectorAll('.stat-num').forEach((el) => {
    const target = parseInt(el.dataset.target || '0', 10);
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let current = 0;
          const duration = 2000;
          const increment = target / (duration / 16);
          function updateCounter() {
            current += increment;
            if (current < target) {
              el.textContent = Math.floor(current);
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target;
            }
          }
          updateCounter();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  // Stat bars animation
  document.querySelectorAll('.stat-bar-fill').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add('animate');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  // =========================================================
  // NEW: Section divider reveal
  // =========================================================
  document.querySelectorAll('.section-divider').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(el);
  });

  // =========================================================
  // NEW: Bounce-in animation observer
  // =========================================================
  document.querySelectorAll('.bounce-in').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
  });

  // ---------- Initialize ----------
  onScrollFrame();
  document.querySelectorAll('.section--cover .reveal').forEach((el) => el.classList.add('in-view'));
  anchorLinks[0]?.classList.add('is-active');
})();
