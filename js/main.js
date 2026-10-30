/* ============================================
   SELVA.DESIGN — micro-interactions & animation
   ============================================ */

function initSite() {

  /* ---------- page enter transition ---------- */
  const veil = document.querySelector('.veil');
  if (veil) {
    requestAnimationFrame(() => veil.classList.add('enter'));
  }

  /* ---------- custom cursor ---------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (dot && ring && !isTouch) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    function animateRing() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = 'a, button, .project-card, .cursor-hover, [data-link]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) ring.classList.remove('hover');
    });

    document.querySelectorAll('.email-link').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('text'));
      el.addEventListener('mouseleave', () => ring.classList.remove('text'));
    });

    document.addEventListener('mousedown', () => ring.style.transform = 'translate(-50%, -50%) scale(0.85)');
    document.addEventListener('mouseup', () => ring.style.transform = 'translate(-50%, -50%) scale(1)');
  }

  /* ---------- scroll progress bar ---------- */
  const progress = document.querySelector('.scroll-progress');
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progress) progress.style.width = (scrolled || 0) + '%';
  }

  /* ---------- header hide on scroll down ---------- */
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;
  function updateHeader() {
    const y = window.scrollY;
    if (header) {
      if (y > lastY && y > 140) header.classList.add('hide');
      else header.classList.remove('hide');
      header.classList.toggle('scrolled', y > 60);
    }
    lastY = y;
  }

  window.addEventListener('scroll', () => {
    updateProgress();
    updateHeader();
  }, { passive: true });
  updateProgress();
  updateHeader();

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------- before / after comparison slider ---------- */
  document.querySelectorAll('[data-compare]').forEach(slider => {
    const knob = slider.querySelector('.compare-knob');
    let dragging = false;

    function setPos(pct) {
      const clamped = Math.max(0, Math.min(100, pct));
      slider.style.setProperty('--pos', clamped + '%');
      if (knob) knob.setAttribute('aria-valuenow', Math.round(clamped));
    }

    function posFromEvent(e) {
      const r = slider.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    }

    slider.addEventListener('pointerdown', (e) => {
      dragging = true;
      posFromEvent(e);
      // Capture keeps the drag alive outside the element, but is non-essential:
      // it throws on pointers the browser no longer tracks, so never let it
      // abort the handler.
      try { slider.setPointerCapture(e.pointerId); } catch (err) { /* no capture */ }
    });
    slider.addEventListener('pointermove', (e) => {
      if (dragging) posFromEvent(e);
    });
    slider.addEventListener('pointerup', (e) => {
      dragging = false;
      try {
        if (slider.hasPointerCapture(e.pointerId)) slider.releasePointerCapture(e.pointerId);
      } catch (err) { /* already released */ }
    });
    slider.addEventListener('pointercancel', () => { dragging = false; });

    if (knob) {
      knob.addEventListener('keydown', (e) => {
        const current = parseFloat(knob.getAttribute('aria-valuenow')) || 50;
        const step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowLeft') { setPos(current - step); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { setPos(current + step); e.preventDefault(); }
        else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
        else if (e.key === 'End') { setPos(100); e.preventDefault(); }
      });
      knob.addEventListener('click', (e) => e.preventDefault());
    }
  });

  /* ---------- stat count-up ---------- */
  const statEls = document.querySelectorAll('[data-count]');
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => statIO.observe(el));

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll('.magnetic-btn, .project-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  /* ---------- mobile menu toggle ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (menuToggle && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) closeMenu();
    });
  }

  /* ---------- page-to-page transition on internal links ---------- */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (veil) {
        veil.classList.remove('enter');
        veil.classList.add('leave');
      }
      setTimeout(() => { window.location.href = href; }, 480);
    });
  });

  /* ---------- smooth in-page anchor scroll offset ---------- */
  document.querySelectorAll('a[href^="#"], a[href*="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname) return;
      const id = url.hash;
      if (!id || id === '#top') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
      }
    });
  });

  /* ---------- hero photo subtle parallax ---------- */
  const heroPhoto = document.querySelector('.hero-photo img');
  if (heroPhoto && !isTouch) {
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroPhoto.style.transform = `scale(1.06) translate(${x * -14}px, ${y * -14}px)`;
    });
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}
