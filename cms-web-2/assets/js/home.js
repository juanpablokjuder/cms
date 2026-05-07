'use strict';

/**
 * home.js — Comportamientos específicos de la home.
 * (Por ahora vacío de extra; main.js maneja hero, contacto y reveals.)
 * Reservado para futuras animaciones de parallax sutil sobre el hero.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Parallax sutil del hero al scrollear (sólo si no es prefiers-reduced-motion)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroImg = document.querySelector('.vm-hero-image');
    if (!heroImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const y = window.scrollY;
                heroImg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.03)`;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
});
