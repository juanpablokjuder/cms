'use strict';

/**
 * product-detail.js — Comportamiento del detalle:
 * - Carrusel de imágenes con thumbs, flechas y swipe
 * - Selector de variantes que actualiza precio + stock
 * - Tabs de información
 * - Add to cart
 */

(function () {
    const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

    // ─── Galería ───────────────────────────────────────────────────
    const main = $('#vm-gallery-main');
    if (main) {
        const slides = $$('img[data-idx]', main);
        const thumbs = $$('[data-thumb]');
        let active = 0;

        const go = (i) => {
            i = ((i % slides.length) + slides.length) % slides.length;
            slides.forEach(s => s.classList.remove('active'));
            slides[i]?.classList.add('active');
            thumbs.forEach(t => t.setAttribute('aria-current', 'false'));
            thumbs[i]?.setAttribute('aria-current', 'true');
            active = i;
        };
        thumbs.forEach((t, i) => t.addEventListener('click', () => go(i)));
        $('#vm-gallery-prev')?.addEventListener('click', () => go(active - 1));
        $('#vm-gallery-next')?.addEventListener('click', () => go(active + 1));

        // Swipe en mobile
        let startX = 0;
        main.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
        main.addEventListener('touchend',   (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
        }, { passive: true });

        // Teclado
        main.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')  go(active - 1);
            if (e.key === 'ArrowRight') go(active + 1);
        });
        main.tabIndex = 0;
    }

    // ─── Variantes ─────────────────────────────────────────────────
    const colorBtns = $$('.vm-color-option');
    const priceEl   = $('#vm-detail-price');
    const stockEl   = $('#vm-stock-line');
    const stockTxt  = stockEl?.querySelector('[data-stock-text]');
    const stockDot  = stockEl?.querySelector('.vm-stock-dot');
    const colorLabel= $('#vm-selected-color');
    const addBtn    = $('#vm-add-to-cart');

    let selectedVariant = null;

    function formatPrice(cents, code) {
        return `${code || 'ARS'} $${(cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    }

    function selectVariant(btn) {
        colorBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');

        const data = btn.dataset;
        const precio    = parseInt(data.variantPrecio, 10);
        const descuento = parseInt(data.variantDescuento, 10) || 0;
        const stock     = parseInt(data.variantStock, 10);
        const moneda    = data.variantMoneda || 'ARS';
        const final     = descuento > 0 ? Math.round(precio * (1 - descuento / 10000)) : precio;

        selectedVariant = {
            uuid:   data.variantUuid,
            color:  data.variantColor,
            price:  final,
            stock,
            currency: moneda,
        };

        // Precio dinámico
        if (priceEl) {
            if (descuento > 0) {
                priceEl.innerHTML = `
                    ${formatPrice(final, moneda)}
                    <span class="vm-price-old">${formatPrice(precio, moneda)}</span>
                    <span class="vm-badge vm-badge-sale">-${(descuento / 100).toFixed(0)}%</span>
                `;
            } else {
                priceEl.textContent = formatPrice(precio, moneda);
            }
        }

        // Stock
        if (stockEl) {
            stockEl.hidden = false;
            stockDot?.classList.remove('warn', 'out');
            if (stock <= 0) {
                stockDot?.classList.add('out');
                if (stockTxt) stockTxt.textContent = 'Sin stock';
            } else if (stock < 5) {
                stockDot?.classList.add('warn');
                if (stockTxt) stockTxt.textContent = `Últimas ${stock} unidades`;
            } else {
                if (stockTxt) stockTxt.textContent = 'En stock — entrega rápida';
            }
        }

        if (colorLabel) colorLabel.textContent = data.variantColor || '—';

        if (addBtn) {
            addBtn.disabled = stock <= 0;
            addBtn.querySelector('span')?.remove();
            // restablecer texto si hace falta
        }
    }

    colorBtns.forEach(btn => btn.addEventListener('click', () => selectVariant(btn)));
    // Pre-seleccionar la primera variante por defecto
    if (colorBtns[0]) selectVariant(colorBtns[0]);

    // ─── Add to cart ───────────────────────────────────────────────
    addBtn?.addEventListener('click', () => {
        if (!selectedVariant || selectedVariant.stock <= 0) return;
        const dataEl = $('#vm-producto-data');
        const meta = dataEl ? JSON.parse(dataEl.textContent) : {};
        window.Cart?.add({
            productUuid:  meta.uuid,
            varianteUuid: selectedVariant.uuid,
            name:         meta.nombre,
            brand:        meta.marca,
            color:        selectedVariant.color,
            price:        selectedVariant.price,
            qty:          1,
            image:        meta.image,
            currency:     selectedVariant.currency,
        });
        window.Cart?.openPanel();
    });

    // ─── Tabs ──────────────────────────────────────────────────────
    const tabs = $$('.vm-tab');
    tabs.forEach(t => {
        t.addEventListener('click', () => {
            tabs.forEach(x => x.setAttribute('aria-selected', 'false'));
            t.setAttribute('aria-selected', 'true');
            $$('[role="tabpanel"]').forEach(p => { p.hidden = true; });
            const target = document.getElementById(t.getAttribute('aria-controls'));
            if (target) target.hidden = false;
        });
    });
})();
