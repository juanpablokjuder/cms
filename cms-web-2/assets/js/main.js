'use strict';

/**
 * main.js — Bootstrap global de la aplicación.
 * Maneja: page-loader, slider de hero, mobile menu, reveals, hero dots,
 * formulario de contacto en home y header sticky behavior.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── Page loader ────────────────────────────────────────────────
    const loader = document.getElementById('vm-page-loader');
    if (loader) {
        // Esperar al next paint para evitar parpadeo
        requestAnimationFrame(() => {
            setTimeout(() => loader.classList.add('hidden'), 200);
            setTimeout(() => loader.remove(), 800);
        });
    }

    // ── Mobile menu ────────────────────────────────────────────────
    const menuBtn  = document.getElementById('vm-menu-toggle');
    const menuPanel = document.getElementById('vm-mobile-menu');
    if (menuBtn && menuPanel) {
        menuBtn.addEventListener('click', () => {
            const open = menuPanel.getAttribute('aria-hidden') === 'false';
            menuPanel.setAttribute('aria-hidden', open ? 'true' : 'false');
            menuBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
            document.body.style.overflow = open ? '' : 'hidden';
        });
        // Cerrar al navegar
        menuPanel.addEventListener('click', (e) => {
            if (e.target.matches('a')) {
                menuPanel.setAttribute('aria-hidden', 'true');
                menuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // ── Reveals on scroll (IntersectionObserver) ───────────────────
    const revealEls = document.querySelectorAll('.vm-reveal, .fade-up');
    if ('IntersectionObserver' in window && revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in'));
    }

    // ── Hero slider infinito (crossfade + Ken Burns + progress bar) ─
    const heroEl      = document.querySelector('.vm-hero');
    const slides      = Array.from(document.querySelectorAll('.vm-hero-slide'));
    const dots        = Array.from(document.querySelectorAll('.vm-hero-dot'));
    const progressBar = document.getElementById('vm-hero-progress-bar');
    const SLIDE_DURATION = 6000;

    if (slides.length > 1) {
        let current   = 0;
        let autoTimer = null;

        const activate = (rawIdx) => {
            // Wrap para loop infinito en ambas direcciones
            const next = ((rawIdx % slides.length) + slides.length) % slides.length;
            if (next === current && slides[current].classList.contains('is-active')) return;

            slides[current].classList.remove('is-active');
            dots[current]?.classList.remove('is-active');
            dots[current]?.setAttribute('aria-selected', 'false');

            current = next;

            slides[current].classList.add('is-active');
            dots[current]?.classList.add('is-active');
            dots[current]?.setAttribute('aria-selected', 'true');

            // Reiniciar progress bar
            if (progressBar) {
                progressBar.classList.remove('is-running');
                progressBar.style.transition = 'none';
                progressBar.style.width      = '0%';
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    progressBar.classList.add('is-running');
                }));
            }
        };

        const goNext  = () => activate(current + 1);
        const goPrev  = () => activate(current - 1);

        const startAuto = () => {
            stopAuto();
            autoTimer = setInterval(goNext, SLIDE_DURATION);
        };
        const stopAuto = () => { clearInterval(autoTimer); autoTimer = null; };

        // Dots
        dots.forEach((d, i) => {
            d.addEventListener('click', () => { stopAuto(); activate(i); startAuto(); });
        });

        // Flechas
        document.querySelector('.vm-hero-arrow--prev')
            ?.addEventListener('click', () => { stopAuto(); goPrev(); startAuto(); });
        document.querySelector('.vm-hero-arrow--next')
            ?.addEventListener('click', () => { stopAuto(); goNext(); startAuto(); });

        // Pausa al hover / focus
        heroEl?.addEventListener('mouseenter', stopAuto);
        heroEl?.addEventListener('mouseleave', startAuto);
        heroEl?.addEventListener('focusin',    stopAuto);
        heroEl?.addEventListener('focusout',   startAuto);

        // Navegación por teclado
        heroEl?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')  { stopAuto(); goPrev(); startAuto(); }
            if (e.key === 'ArrowRight') { stopAuto(); goNext(); startAuto(); }
        });

        // Soporte táctil (swipe)
        let touchStartX = 0;
        heroEl?.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        heroEl?.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) < 50) return;
            stopAuto();
            dx < 0 ? goNext() : goPrev();
            startAuto();
        }, { passive: true });

        // Iniciar — el primer slide ya tiene .is-active en el HTML
        if (progressBar) {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                progressBar.classList.add('is-running');
            }));
        }
        startAuto();
    }

    // ── Header sticky shadow + scrolled class ──────────────────────
    const header = document.querySelector('.vm-header');
    if (header) {
        const onScroll = () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
                header.style.boxShadow = '';
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ── Stagger delays: asignar data-delay a cards dentro de grids ─
    document.querySelectorAll('.vm-product-grid, .vm-news-grid, .vm-service-grid').forEach(grid => {
        const cards = grid.querySelectorAll('.vm-reveal');
        cards.forEach((card, i) => {
            const delay = Math.min(i + 1, 6);
            if (!card.dataset.delay) card.dataset.delay = delay;
        });
    });

    // ── Formulario de contacto (validación cliente + WhatsApp fallback) ──
    const contactForm = document.getElementById('vm-contact-form');
    if (contactForm) {
        const validators = {
            name:    (v) => v.length >= 2 ? '' : 'Ingresá tu nombre completo.',
            email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Ingresá un email válido.',
            message: (v) => v.length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres.',
        };

        // Validación en tiempo real
        contactForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('vm-input-error')) validateField(field);
            });
        });

        function validateField(field) {
            const val = field.value.trim();
            const fn  = validators[field.name];
            if (!fn) return true;
            const err = fn(val);
            const errEl = contactForm.querySelector(`[data-error="${field.name}"]`);
            if (err) {
                field.classList.add('vm-input-error');
                if (errEl) errEl.textContent = err;
                field.setAttribute('aria-invalid', 'true');
                return false;
            } else {
                field.classList.remove('vm-input-error');
                if (errEl) errEl.textContent = '';
                field.setAttribute('aria-invalid', 'false');
                return true;
            }
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fields = contactForm.querySelectorAll('input, textarea');
            let allValid = true;
            fields.forEach(f => { if (!validateField(f)) allValid = false; });
            if (!allValid) {
                Toast?.error?.('Revisá los campos marcados.');
                return;
            }

            // Sin endpoint de contacto: abrir WhatsApp con prefilled
            const data = Object.fromEntries(new FormData(contactForm).entries());
            const wa = (document.querySelector('meta[name="vm-whatsapp"]')?.content) || '';
            const msg = `*Consulta desde la web*\n\nNombre: ${data.name}\nEmail: ${data.email}\n\nMensaje:\n${data.message}`;
            const url = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : `mailto:?subject=Consulta&body=${encodeURIComponent(msg)}`;
            window.open(url, '_blank', 'noopener');
            Toast?.success?.('Te llevamos a WhatsApp para enviar tu mensaje.');
            contactForm.reset();
        });
    }

    // ── Smooth scroll para anchors internos ────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
