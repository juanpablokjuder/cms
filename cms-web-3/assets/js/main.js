/**
 * NEXUS STUDIO — JavaScript Principal
 * Módulos: Loader · Canvas · Navbar · Sliders · Reveal · Counters · Form
 */

'use strict';

/* ═══════════════════════════════════════════════
   UTILIDADES
   ═══════════════════════════════════════════════ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const debounce = (fn, ms = 60) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* ═══════════════════════════════════════════════
   1. PAGE LOADER
   ═══════════════════════════════════════════════ */
const initLoader = () => {
  const loader = $('#page-loader');
  if (!loader) return;

  document.body.classList.add('no-scroll');

  // Espera el evento load + mínimo 2.2s para que la animación se vea completa
  const minDelay = new Promise(res => setTimeout(res, 2200));
  const pageLoad = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });

  Promise.all([minDelay, pageLoad]).then(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('no-scroll');

    // Disparar animaciones del hero
    setTimeout(() => triggerHeroAnimations(), 100);
  });
};

/* ═══════════════════════════════════════════════
   2. CANVAS PARTÍCULAS (HERO)
   ═══════════════════════════════════════════════ */
const initCanvas = () => {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let W, H, particles, animId;

  const PARTICLE_COUNT  = 80;
  const MAX_DIST        = 130;
  const COLORS          = ['rgba(99,102,241,', 'rgba(168,85,247,', 'rgba(6,182,212,'];

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    createParticles();
  };

  const createParticles = () => {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  (Math.random() - 0.5) * 0.4,
      vy:  (Math.random() - 0.5) * 0.4,
      r:   Math.random() * 1.8 + 0.5,
      c:   COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.c}0.7)`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  };

  const start = () => { cancelAnimationFrame(animId); draw(); };
  const stop  = () => cancelAnimationFrame(animId);

  // Pausar cuando el hero no está visible (performance)
  const heroObserver = new IntersectionObserver(
    ([entry]) => entry.isIntersecting ? start() : stop(),
    { threshold: 0.1 }
  );

  heroObserver.observe($('#inicio'));

  window.addEventListener('resize', debounce(resize, 200));
  resize();
};

/* ═══════════════════════════════════════════════
   3. NAVBAR
   ═══════════════════════════════════════════════ */
const initNavbar = () => {
  const nav      = $('#navbar');
  const toggle   = $('#nav-toggle');
  const links    = $('#nav-links');
  const progress = $('#nav-progress');
  if (!nav) return;

  // Scroll → blur/scrolled class + progress bar
  const onScroll = () => {
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('scrolled', scrolled);

    // Progress bar
    const docH   = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    progress.style.width = `${pct}%`;

    // Active link
    const sections = $$('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    $$('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    // Cerrar al hacer click en un link
    $$('.nav-link', links).forEach(l => {
      l.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  onScroll();
};

/* ═══════════════════════════════════════════════
   4. SLIDERS con Swiper.js
   ═══════════════════════════════════════════════ */

const initSliders = () => {

  // ── Servicios ────────────────────────────────
  new Swiper('.swiper-services', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    grabCursor: true,
    // loop: true,
    navigation: {
      prevEl: '.swiper-services-prev',
      nextEl: '.swiper-services-next',
    },
    pagination: {
      el: '.swiper-services-pag',
      clickable: true,
    },
    autoplay: {
      delay: 5500,
      disableOnInteraction: true,
    },
    breakpoints: {
      640:  { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
    },
  });

  // ── Nosotros: imagen ──────────────────────────
  const swiperNosotrosImg = new Swiper('.swiper-nosotros-img', {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: false,
    grabCursor: true,
    speed: 600,
    effect: 'fade',
  fadeEffect: {
    crossFade: true // Evita que se vea el fondo durante la transición
  },
    navigation: {
      prevEl: '.swiper-nosotros-prev',
      nextEl: '.swiper-nosotros-next',
    },
    pagination: {
      el: '.swiper-nosotros-img-pag',
      clickable: true,
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: true,
    },
    on: {
      slideChange() {
        swiperNosotrosText.slideTo(this.activeIndex);
        updateNosotrosNav(this.activeIndex);
      },
    },
  });

  // ── Nosotros: texto (controlado) ──────────────
  const swiperNosotrosText = new Swiper('.swiper-nosotros-text', {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: false,
    effect: 'fade',
  fadeEffect: {
    crossFade: true // Evita que se vea el fondo durante la transición
  },
    allowTouchMove: false,
    speed: 500,
  });

  // Nav de texto → sincroniza sliders
  const navItems = $$('.nosotros-nav-item');

  const updateNosotrosNav = (idx) => {
    navItems.forEach((item, i) => item.classList.toggle('active', i === idx));
  };

  navItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      swiperNosotrosImg.slideTo(i);
      swiperNosotrosText.slideTo(i);
      updateNosotrosNav(i);
      swiperNosotrosImg.autoplay.stop();
    });
  });

  // ── Reviews ───────────────────────────────────
  new Swiper('.swiper-reviews', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: false,
    grabCursor: true,
    navigation: {
      prevEl: '.swiper-reviews-prev',
      nextEl: '.swiper-reviews-next',
    },
    pagination: {
      el: '.swiper-reviews-pag',
      clickable: true,
    },
    autoplay: {
      delay: 6500,
      disableOnInteraction: true,
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 24 },
    },
  });
};

/* ═══════════════════════════════════════════════
   6. SCROLL REVEAL (IntersectionObserver)
   ═══════════════════════════════════════════════ */
const initReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('is-visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('[data-animate]').forEach(el => observer.observe(el));
};

/* ═══════════════════════════════════════════════
   7. COUNTERS (animados al entrar en viewport)
   ═══════════════════════════════════════════════ */
const initCounters = () => {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const animCount = (el) => {
    const target = parseInt(el.dataset.count);
    const dur    = 1800;
    const step   = 16;
    const steps  = dur / step;
    let cur      = 0;
    const inc    = target / steps;

    const tick = () => {
      cur += inc;
      if (cur >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = Math.floor(cur);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animCount(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
};

/* ═══════════════════════════════════════════════
   8. HERO ANIMATIONS (después del loader)
   ═══════════════════════════════════════════════ */
const triggerHeroAnimations = () => {
  $$('#inicio [data-animate]').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('is-visible'), delay);
  });
};

/* ═══════════════════════════════════════════════
   9. SMOOTH SCROLL (para navegadores sin soporte nativo)
   ═══════════════════════════════════════════════ */
const initSmoothScroll = () => {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};

/* ═══════════════════════════════════════════════
   10. FORMULARIO DE CONTACTO
   ═══════════════════════════════════════════════ */
const initContactForm = () => {
  const form    = $('#contact-form');
  if (!form) return;

  const submitBtn  = $('#form-submit');
  const btnText    = $('.btn-text', submitBtn);
  const btnLoading = $('.btn-loading', submitBtn);
  const btnIcon    = $('.btn-icon', submitBtn);
  const success    = $('#form-success');

  // Validación simple en tiempo real
  const rules = {
    'cf-name':    { required: true, minLen: 2,   errId: 'err-name',    msg: 'Ingresá tu nombre completo.' },
    'cf-email':   { required: true, email: true,  errId: 'err-email',   msg: 'Ingresá un email válido.' },
    'cf-service': { required: true,               errId: 'err-service', msg: 'Seleccioná un servicio.' },
    'cf-message': { required: true, minLen: 20,   errId: 'err-message', msg: 'El mensaje debe tener al menos 20 caracteres.' },
  };

  const validate = (id) => {
    const rule  = rules[id];
    if (!rule) return true;
    const input = $(`#${id}`);
    const err   = $(`#${rule.errId}`);
    const val   = input.value.trim();

    let ok = true;
    if (rule.required && !val)                           ok = false;
    if (ok && rule.minLen && val.length < rule.minLen)   ok = false;
    if (ok && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) ok = false;

    input.classList.toggle('error', !ok);
    err.textContent = ok ? '' : rule.msg;
    return ok;
  };

  // Validar en blur
  Object.keys(rules).forEach(id => {
    const input = $(`#${id}`);
    if (input) {
      input.addEventListener('blur', () => validate(id));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validate(id);
      });
    }
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const allValid = Object.keys(rules).map(validate).every(Boolean);
    if (!allValid) return;

    // Estado cargando
    submitBtn.disabled = true;
    btnText.hidden     = true;
    btnIcon.hidden     = true;
    btnLoading.hidden  = false;
    btnLoading.classList.add('visible');

    // Simular envío (2s) — en producción reemplazar con fetch real
    await new Promise(res => setTimeout(res, 2000));

    submitBtn.hidden   = true;
    success.hidden     = false;
    form.reset();

    // Reset después de 6s
    setTimeout(() => {
      submitBtn.hidden   = false;
      success.hidden     = true;
      submitBtn.disabled = false;
      btnText.hidden     = false;
      btnIcon.hidden     = false;
      btnLoading.hidden  = true;
      btnLoading.classList.remove('visible');
    }, 6000);
  });
};

/* ═══════════════════════════════════════════════
   11. EFECTO MAGNÉTICO EN BOTONES PRIMARIOS
   ═══════════════════════════════════════════════ */
const initMagneticButtons = () => {
  if (window.matchMedia('(hover: none)').matches) return; // no en touch

  $$('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width  / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
};

/* ═══════════════════════════════════════════════
   12. PARALLAX HERO
   ═══════════════════════════════════════════════ */
const initParallax = () => {
  const orbs    = $$('.orb');
  const content = $('.hero-content');

  if (!orbs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('mousemove', e => {
    const cx  = window.innerWidth  / 2;
    const cy  = window.innerHeight / 2;
    const dx  = (e.clientX - cx) / cx;
    const dy  = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 10;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });

    if (content) {
      content.style.transform = `translate(${dx * -4}px, ${dy * -4}px)`;
    }
  }, { passive: true });
};

/* ═══════════════════════════════════════════════
   INIT ALL
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCanvas();
  initNavbar();
  initReveal();
  initCounters();
  initSmoothScroll();
  initSliders();
  initContactForm();
  initMagneticButtons();
  initParallax();
});
