'use strict';

/**
 * Cart — Carrito persistente en localStorage + UI en panel deslizable.
 * Como la API no expone órdenes, el checkout abre WhatsApp con el resumen.
 *
 * Estructura de un item:
 *   { id, productUuid, varianteUuid, name, brand, color, price, qty, image, currency }
 */
(function () {
    const STORAGE_KEY = 'vm-cart-v1';

    // ─── Estado ──────────────────────────────────────────────────────────────
    let items = loadCart();

    function loadCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }
    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    // ─── API pública ─────────────────────────────────────────────────────────
    function add(item) {
        if (!item || !item.varianteUuid) return;
        item.qty = item.qty || 1;
        const existing = items.find(i => i.varianteUuid === item.varianteUuid);
        if (existing) {
            existing.qty += item.qty;
        } else {
            items.push({ ...item, id: crypto.randomUUID() });
        }
        persist();
        render();
        updateCount();
        Toast?.success?.(`${item.name} agregado al carrito`);
    }

    function remove(id) {
        items = items.filter(i => i.id !== id);
        persist();
        render();
        updateCount();
    }

    function setQty(id, qty) {
        const it = items.find(i => i.id === id);
        if (!it) return;
        it.qty = Math.max(1, qty);
        persist();
        render();
        updateCount();
    }

    function clear() {
        items = [];
        persist();
        render();
        updateCount();
    }

    function getItems() { return [...items]; }

    function getTotal() {
        return items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    }

    // ─── UI ──────────────────────────────────────────────────────────────────
    function formatMoney(cents, code = 'ARS') {
        return `${code} $${(cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    }

    function updateCount() {
        const n = items.reduce((a, i) => a + i.qty, 0);
        document.querySelectorAll('[data-cart-count]').forEach(el => {
            el.textContent = String(n);
            el.classList.toggle('show', n > 0);
        });
    }

    function render() {
        const body   = document.getElementById('vm-cart-body');
        const footer = document.getElementById('vm-cart-footer');
        if (!body) return;

        if (items.length === 0) {
            body.innerHTML = `
                <div class="vm-empty" style="padding: 3rem 1rem">
                    <div class="vm-empty-icon" aria-hidden="true">🛒</div>
                    <h3>Tu carrito está vacío</h3>
                    <p style="font-size:0.9rem">Explorá el catálogo y agregá tus equipos favoritos.</p>
                    <a href="/productos" class="vm-btn vm-btn-primary mt-4">Ver catálogo</a>
                </div>`;
            if (footer) footer.hidden = true;
            return;
        }

        body.innerHTML = items.map(i => `
            <div class="vm-cart-item" data-item-id="${i.id}">
                <img src="${i.image || ''}" alt="" loading="lazy">
                <div>
                    <p class="vm-cart-item-name">${escapeHtml(i.name)}</p>
                    <p class="vm-cart-item-meta">
                        ${i.brand ? escapeHtml(i.brand) + ' · ' : ''}${i.color ? 'Color ' + escapeHtml(i.color) : ''}
                    </p>
                    <div class="vm-cart-item-actions">
                        <button class="vm-qty-btn" data-act="dec" aria-label="Quitar uno">−</button>
                        <span aria-live="polite">${i.qty}</span>
                        <button class="vm-qty-btn" data-act="inc" aria-label="Agregar uno">+</button>
                        <button class="vm-qty-btn ml-auto" data-act="rm" aria-label="Eliminar" style="margin-left:auto">✕</button>
                    </div>
                </div>
                <div class="text-right font-semibold" style="color:var(--vm-primary)">
                    ${formatMoney(i.price * i.qty, i.currency)}
                </div>
            </div>
        `).join('');

        if (footer) {
            footer.hidden = false;
            footer.querySelector('[data-cart-total]').textContent = formatMoney(getTotal(), items[0].currency);
            const link = footer.querySelector('[data-checkout-link]');
            if (link) link.href = buildWhatsAppLink();
        }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    }

    function buildWhatsAppLink() {
        const phone = (document.querySelector('meta[name="vm-whatsapp"]')?.content) || '';
        const lines = items.map(i =>
            `• ${i.name}${i.color ? ' (' + i.color + ')' : ''} x${i.qty} — ${formatMoney(i.price * i.qty, i.currency)}`
        );
        const total = formatMoney(getTotal(), items[0]?.currency);
        const msg = `Hola! Quisiera realizar el siguiente pedido:\n\n${lines.join('\n')}\n\n*Total estimado:* ${total}`;
        return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : '#';
    }

    // ─── Panel toggle ────────────────────────────────────────────────────────
    function openPanel() {
        document.getElementById('vm-cart-panel')?.setAttribute('aria-hidden', 'false');
        document.getElementById('vm-cart-overlay')?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Focus en cerrar para accesibilidad
        document.getElementById('vm-cart-close')?.focus();
    }
    function closePanel() {
        document.getElementById('vm-cart-panel')?.setAttribute('aria-hidden', 'true');
        document.getElementById('vm-cart-overlay')?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // ─── Listeners ───────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('vm-cart-toggle')?.addEventListener('click', openPanel);
        document.getElementById('vm-cart-close')?.addEventListener('click', closePanel);
        document.getElementById('vm-cart-overlay')?.addEventListener('click', closePanel);
        document.getElementById('vm-cart-clear')?.addEventListener('click', () => {
            if (confirm('¿Vaciar el carrito?')) clear();
        });

        // Delegación dentro del body del cart
        document.getElementById('vm-cart-body')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-act]');
            if (!btn) return;
            const card = btn.closest('[data-item-id]');
            if (!card) return;
            const id = card.dataset.itemId;
            const item = items.find(i => i.id === id);
            if (!item) return;
            if (btn.dataset.act === 'inc') setQty(id, item.qty + 1);
            else if (btn.dataset.act === 'dec') setQty(id, item.qty - 1);
            else if (btn.dataset.act === 'rm')  remove(id);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePanel();
        });

        render();
        updateCount();
    });

    // ─── Exponer ─────────────────────────────────────────────────────────────
    window.Cart = { add, remove, setQty, clear, getItems, getTotal, openPanel, closePanel };
})();
