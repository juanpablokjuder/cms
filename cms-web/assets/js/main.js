/**
 * cms-web — main.js v3.0
 * Efectos: loader · cursor glow · particles · hero slider + typewriter
 *          header scroll · nav mobile · tabs · accordion · scroll reveal
 *          counter odometer · AJAX load-more · stagger cards
 */

'use strict';

const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ═══════════════════════════════════════════════════════
   1. PAGE LOADER
═══════════════════════════════════════════════════════ */
const loader = qs('#page-loader');
if (loader) {
  const hide = () => loader.classList.add('hidden');
  window.addEventListener('load', hide);
  setTimeout(hide, 5000);
}

/* ═══════════════════════════════════════════════════════
   2. CURSOR GLOW
═══════════════════════════════════════════════════════ */
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);

let mouseX = -999, mouseY = -999;
let glowX = -999, glowY = -999;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
// Smooth lag effect
(function animGlow() {
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;
  cursorGlow.style.left = `${glowX}px`;
  cursorGlow.style.top  = `${glowY}px`;
  requestAnimationFrame(animGlow);
})();

/* ═══════════════════════════════════════════════════════
   3. FLOATING PARTICLES (hero de fondo)
═══════════════════════════════════════════════════════ */
const heroSection = qs('.hero-section');
if (heroSection) {
  const PARTICLE_COUNT = 18;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 12;
    const opacity = Math.random() * 0.4 + 0.1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%;
      animation-duration:${duration}s;
      animation-delay:-${delay}s;
      filter: blur(${Math.random() > 0.5 ? '1px' : '0'});
      opacity:${opacity};
    `;
    heroSection.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════
   4. HEADER SCROLL
═══════════════════════════════════════════════════════ */
const header = qs('.site-header');
if (header) {
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 30);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* ═══════════════════════════════════════════════════════
   5. MOBILE NAV
═══════════════════════════════════════════════════════ */
const navToggle = qs('.nav-toggle');
const navList   = qs('.nav-links');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navList.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('open')) {
      navList.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

/* ═══════════════════════════════════════════════════════
   6. HERO SLIDER
═══════════════════════════════════════════════════════ */
const slides  = qsa('.hero-slide');
const dots    = qsa('.hero-dot');
let heroIdx   = 0;
let heroTimer = null;
const INTERVAL = 6500;

const goTo = (idx) => {
  slides[heroIdx]?.classList.remove('active');
  slides[heroIdx]?.setAttribute('aria-hidden', 'true');
  dots[heroIdx]?.classList.remove('active');
  dots[heroIdx]?.setAttribute('aria-selected', 'false');

  heroIdx = (idx + slides.length) % slides.length;

  slides[heroIdx]?.classList.add('active');
  slides[heroIdx]?.setAttribute('aria-hidden', 'false');
  dots[heroIdx]?.classList.add('active');
  dots[heroIdx]?.setAttribute('aria-selected', 'true');
};

if (slides.length > 1) {
  heroTimer = setInterval(() => goTo(heroIdx + 1), INTERVAL);
  dots.forEach((d, i) => d.addEventListener('click', () => {
    clearInterval(heroTimer);
    goTo(i);
    heroTimer = setInterval(() => goTo(heroIdx + 1), INTERVAL);
  }));
}

/* ═══════════════════════════════════════════════════════
   7. TYPEWRITER EN HERO H1
   Solo activa en el primer slide/fallback si hay un .line-accent
═══════════════════════════════════════════════════════ */
const initTypewriter = () => {
  const target = qs('.hero-slide.active .line-accent') ?? qs('.hero-content .line-accent');
  if (!target || target.dataset.twDone) return;
  target.dataset.twDone = '1';

  const fullText = target.textContent.trim();
  target.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  target.parentElement?.appendChild(cursor);

  let i = 0;
  const type = () => {
    if (i <= fullText.length) {
      target.textContent = fullText.slice(0, i);
      i++;
      setTimeout(type, 55 + Math.random() * 35);
    } else {
      // Remover cursor después de un delay
      setTimeout(() => cursor.remove(), 2200);
    }
  };
  setTimeout(type, 600);
};
// Esperar a que cargue (loader oculto)
if (loader) {
  loader.addEventListener('transitionend', initTypewriter, { once: true });
} else {
  window.addEventListener('load', initTypewriter);
}

/* ═══════════════════════════════════════════════════════
   8. SERVICE TABS
═══════════════════════════════════════════════════════ */
qsa('.cat-tabs').forEach((tabContainer) => {
  const allTabs   = qsa('.cat-tab', tabContainer);
  const allPanels = qsa('.cat-panel');

  allTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      allTabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      allPanels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      qs(`[data-cat="${cat}"].cat-panel`)?.classList.add('active');
    });
  });
});

/* ═══════════════════════════════════════════════════════
   9. FAQ ACCORDION
═══════════════════════════════════════════════════════ */
qsa('.accordion-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const body     = qs('.accordion-body', btn.closest('.accordion-item'));

    qsa('.accordion-btn[aria-expanded="true"]').forEach((other) => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        qs('.accordion-body', other.closest('.accordion-item'))?.classList.remove('open');
      }
    });
    btn.setAttribute('aria-expanded', String(!expanded));
    body?.classList.toggle('open', !expanded);
  });
});

/* ═══════════════════════════════════════════════════════
   10. SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════════════════════ */
const revealObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);

const revealSelectors = [
  '.fade-in', '.reveal-left', '.reveal-right', '.reveal-scale', '.section-title-under',
].join(', ');

const observeReveal = (ctx = document) => {
  qsa(revealSelectors, ctx).forEach((el) => revealObs.observe(el));
};
observeReveal();

/* ═══════════════════════════════════════════════════════
   11. STAGGER CARDS (cards dentro de grillas)
═══════════════════════════════════════════════════════ */
const staggerObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const grid  = e.target;
    const cards = qsa('.servicio-card, .noticia-card', grid);
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 80}ms`;
      card.classList.add('visible');
    });
    staggerObs.unobserve(grid);
  }),
  { threshold: 0.05 }
);
qsa('.items-grid, .noticias-grid').forEach((g) => {
  // Inicialmente todas las cards sin visibilidad
  qsa('.servicio-card, .noticia-card', g).forEach((c) => c.classList.add('fade-in'));
  staggerObs.observe(g);
});

/* ═══════════════════════════════════════════════════════
   12. STATS COUNTER
═══════════════════════════════════════════════════════ */
const counterObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    counterObs.unobserve(el);

    const duration = 1800;
    const start    = performance.now();
    const update = (now) => {
      const p     = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(eased * target).toLocaleString('es-AR') + (el.dataset.suffix ?? '+');
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }),
  { threshold: 0.6 }
);
qsa('.stat-num[data-target]').forEach((el) => counterObs.observe(el));

/* ═══════════════════════════════════════════════════════
   13. MAGNETIC CARD HOVER
   Las cards responden al movimiento del mouse dentro de ellas
═══════════════════════════════════════════════════════ */
qsa('.servicio-card, .noticia-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const tiltX  = dy * -4;
    const tiltY  = dx * 4;
    card.style.transform = `translateY(-7px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transformStyle = '';
  });
});

/* ═══════════════════════════════════════════════════════
   14. AJAX LOAD MORE NOTICIAS
═══════════════════════════════════════════════════════ */
const loadMoreBtn = qs('#load-more-noticias');
const noticiaGrid = qs('#noticias-grid');

if (loadMoreBtn && noticiaGrid) {
  loadMoreBtn.addEventListener('click', async () => {
    const page    = parseInt(loadMoreBtn.dataset.page, 10);
    const spinner = loadMoreBtn.querySelector('.spinner');
    const btnText = loadMoreBtn.querySelector('.btn-text');

    loadMoreBtn.disabled = true;
    spinner?.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Cargando...';

    try {
      const res  = await fetch(`/api/proxy-noticias.php?page=${page}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error('API error');

      const items = json.data?.data ?? [];
      const meta  = json.data?.meta ?? {};

      items.forEach((noticia, i) => {
        noticiaGrid.insertAdjacentHTML('beforeend', buildNoticiaCard(noticia, i));
      });

      // Observar nuevas cards + aplicar stagger
      const newCards = qsa('.noticia-card:not([style])', noticiaGrid);
      newCards.forEach((c, i) => {
        c.style.transitionDelay = `${i * 80}ms`;
        setTimeout(() => c.classList.add('visible'), 50);
      });
      // Magnetic hover en nuevas cards
      newCards.forEach(applyMagneticCard);

      const nextPage   = parseInt(meta.page, 10) + 1;
      const totalPages = parseInt(meta.totalPages, 10);

      if (nextPage <= totalPages) {
        loadMoreBtn.dataset.page = nextPage;
        loadMoreBtn.disabled = false;
        spinner?.classList.add('hidden');
        if (btnText) btnText.textContent = 'Cargar más';
      } else {
        loadMoreBtn.closest('.load-more-wrap')?.remove();
      }
    } catch (err) {
      console.error('[load-more]', err);
      loadMoreBtn.disabled = false;
      spinner?.classList.add('hidden');
      if (btnText) btnText.textContent = 'Reintentar';
    }
  });
}

const applyMagneticCard = (card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform = `translateY(-7px) rotateX(${dy * -4}deg) rotateY(${dx * 4}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.transformStyle = ''; });
};

/* ═══════════════════════════════════════════════════════
   15. HELPERS — build card & escape HTML
═══════════════════════════════════════════════════════ */
const escHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return ''; }
};

const buildNoticiaCard = (noticia, idx) => {
  const imgs = (noticia.imagenes ?? []).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const img  = imgs[0] ?? null;
  const href = `noticia.php?slug=${encodeURIComponent(noticia.slug ?? '')}`;
  const fecha = noticia.created_at ? formatDate(noticia.created_at) : '';

  const imgHtml = img
    ? `<a href="${escHtml(href)}" tabindex="-1" aria-hidden="true">
         <div class="noticia-card-img-wrap">
           <img src="${escHtml(img.url)}" alt="${escHtml(img.alt ?? noticia.titulo)}"
             class="noticia-card-img" loading="lazy" width="640" height="210">
           <div class="noticia-card-img-overlay" aria-hidden="true"></div>
         </div>
       </a>`
    : `<div class="noticia-card-img-placeholder" aria-hidden="true">
         <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
           <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
             stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
       </div>`;

  return `
    <article class="noticia-card fade-in" role="listitem" itemscope itemtype="https://schema.org/NewsArticle">
      ${imgHtml}
      <div class="noticia-card-body">
        ${fecha ? `<p class="noticia-meta"><time datetime="${escHtml(noticia.created_at)}">${escHtml(fecha)}</time></p>` : ''}
        <h3 itemprop="headline"><a href="${escHtml(href)}">${escHtml(noticia.titulo)}</a></h3>
        ${noticia.subtitulo ? `<p>${escHtml(noticia.subtitulo)}</p>` : ''}
        <a href="${escHtml(href)}" class="read-more" itemprop="url">
          Leer más
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </article>`;
};
