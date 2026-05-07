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

    // ── Hero slider (rotación + dots) ──────────────────────────────
    const slides = document.querySelectorAll('.vm-hero-slide');
    const dots   = document.querySelectorAll('.vm-hero-dot');
    if (slides.length > 1) {
        let active = 0;
        let timer  = null;

        const go = (i) => {
            slides.forEach(s => s.dataset.active = 'false');
            dots.forEach(d => d.setAttribute('aria-current', 'false'));
            slides[i].dataset.active = 'true';
            dots[i]?.setAttribute('aria-current', 'true');
            active = i;
        };
        const next = () => go((active + 1) % slides.length);

        const startAuto = () => { timer = setInterval(next, 7000); };
        const stopAuto  = () => { if (timer) clearInterval(timer); };

        dots.forEach((d, i) => {
            d.addEventListener('click', () => { stopAuto(); go(i); startAuto(); });
        });
        document.querySelector('.vm-hero')?.addEventListener('mouseenter', stopAuto);
        document.querySelector('.vm-hero')?.addEventListener('mouseleave', startAuto);

        startAuto();
    }

    // ── Header sticky shadow al scrollear ──────────────────────────
    const header = document.querySelector('.vm-header');
    if (header) {
        const onScroll = () => {
            header.style.boxShadow = window.scrollY > 4 ? '0 2px 12px rgba(15, 23, 42, 0.08)' : 'none';
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

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
