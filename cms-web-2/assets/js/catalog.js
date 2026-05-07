'use strict';

/**
 * catalog.js — Lógica del catálogo de productos.
 * - Switch de vista grilla/listado con animación
 * - Filtros (búsqueda, sort, marcas) con AJAX al proxy y actualización de URL
 * - Debounce en búsqueda
 */

(function () {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const productsArea  = $('#vm-products-area');
    const searchInput   = $('#vm-search');
    const clearBtn      = $('#vm-clear-filters');
    const switchEl      = $('.vm-view-switch');

    if (!productsArea) return;

    // ─── Estado actual ─────────────────────────────────────────────
    function readState() {
        const params = new URLSearchParams(window.location.search);
        const sortRadio = $('input[name="sort"]:checked');
        return {
            page:   1,
            sort:   sortRadio ? sortRadio.value : (params.get('sort') || 'recent'),
            marcas: $$('input[name="marcas"]:checked').map(c => c.value),
            search: searchInput?.value || '',
        };
    }

    function pushUrl(state) {
        const params = new URLSearchParams();
        if (state.sort && state.sort !== 'recent') params.set('sort', state.sort);
        if (state.marcas.length) params.set('marcas', state.marcas.join(','));
        if (state.search)        params.set('search', state.search);
        if (state.page > 1)      params.set('page', state.page);
        const qs = params.toString();
        const url = '/productos' + (qs ? '?' + qs : '');
        window.history.replaceState({}, '', url);
    }

    // ─── Fetch + render ────────────────────────────────────────────
    let inflight = null;

    async function fetchAndRender() {
        const state = readState();
        pushUrl(state);

        // Indicador de carga (skeleton)
        showSkeleton();

        if (inflight) inflight.abort?.();
        const controller = new AbortController();
        inflight = controller;

        try {
            const params = new URLSearchParams();
            params.set('sort',  state.sort);
            params.set('page',  String(state.page));
            params.set('limit', '12');
            if (state.marcas.length) params.set('marcas', state.marcas.join(','));
            if (state.search)        params.set('search', state.search);

            const res = await fetch('/api/proxy-productos.php?' + params.toString(), {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' },
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();
            renderResults(json.data || { data: [], meta: { total: 0, totalPages: 0, page: 1 } });
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error(err);
            Toast?.error?.('Error al cargar productos.');
        }
    }

    function showSkeleton() {
        const skeletonsHtml = Array.from({ length: 6 }).map(() => `
            <div class="vm-product-card">
                <div class="vm-product-card-media vm-skeleton" style="border-radius:0"></div>
                <div class="vm-product-card-body">
                    <div class="vm-skeleton" style="height:14px;width:50%"></div>
                    <div class="vm-skeleton" style="height:18px;width:80%;margin-top:8px"></div>
                    <div class="vm-skeleton" style="height:18px;width:40%;margin-top:8px"></div>
                </div>
            </div>
        `).join('');
        productsArea.innerHTML = `<div class="vm-product-grid" data-cols="3">${skeletonsHtml}</div>`;
    }

    function renderResults(payload) {
        const list = payload.data || [];
        const meta = payload.meta || {};

        // Update results count
        const countEl = $('[data-results-count]');
        if (countEl) {
            const t = meta.total || 0;
            countEl.innerHTML = `<strong>${t}</strong> resultado${t === 1 ? '' : 's'}`;
        }

        if (list.length === 0) {
            productsArea.innerHTML = `
                <div class="vm-empty">
                    <div class="vm-empty-icon">🔍</div>
                    <h3>No encontramos productos</h3>
                    <p>Probá con otro término o quitá los filtros activos.</p>
                    <button type="button" class="vm-btn vm-btn-primary mt-6" id="vm-clear-from-empty">Limpiar filtros</button>
                </div>`;
            $('#vm-clear-from-empty')?.addEventListener('click', clearFilters);
            return;
        }

        const cardsHtml = list.map(p => renderCardHtml(p)).join('');
        productsArea.innerHTML = `
            <div class="vm-product-grid" data-cols="3" id="vm-products-list">
                ${cardsHtml}
            </div>
            ${renderPaginationHtml(meta)}
        `;

        // Re-aplicar reveals
        $$('.vm-reveal', productsArea).forEach(el => el.classList.add('in'));
    }

    function escHtml(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    }

    function formatPrice(min, max, code) {
        const fmt = (cents) => `${code || 'ARS'} $${(cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        if (min == null) return 'Consultar';
        if (max == null || min === max) return fmt(min);
        return fmt(min) + ' - ' + fmt(max);
    }

    function renderCardHtml(p) {
        const href = '/productos/' + escHtml(p.uuid);
        const price = formatPrice(p.min_price, p.max_price, p.moneda_codigo);
        return `
        <article class="vm-product-card vm-reveal in">
            <a href="${href}" class="vm-product-card-media ${p.preview_url ? '' : 'empty'}" aria-label="${escHtml(p.nombre)}">
                ${p.preview_url ? `<img src="${escHtml(p.preview_url)}" alt="${escHtml(p.nombre)}" loading="lazy">` : '<span>Sin imagen</span>'}
                <div class="vm-product-card-badges">
                    ${p.condicion ? `<span class="vm-badge vm-badge-primary">${escHtml(p.condicion)}</span>` : ''}
                </div>
            </a>
            <div class="vm-product-card-body">
                ${p.marca ? `<span class="vm-product-card-brand">${escHtml(p.marca)}</span>` : ''}
                <h3 class="vm-product-card-name"><a href="${href}">${escHtml(p.nombre)}</a></h3>
                <div class="vm-product-card-meta">
                    <span class="vm-product-card-price">${escHtml(price)}</span>
                    ${p.num_colores ? `<span class="vm-product-card-colors">${p.num_colores} ${p.num_colores > 1 ? 'colores' : 'color'}</span>` : ''}
                </div>
            </div>
        </article>`;
    }

    function renderPaginationHtml(meta) {
        const { page = 1, totalPages = 0 } = meta;
        if (totalPages <= 1) return '';
        const state = readState();
        const buildUrl = (p) => {
            const params = new URLSearchParams();
            params.set('page', String(p));
            if (state.sort && state.sort !== 'recent') params.set('sort', state.sort);
            if (state.marcas.length) params.set('marcas', state.marcas.join(','));
            if (state.search) params.set('search', state.search);
            return '/productos?' + params.toString();
        };
        const start = Math.max(1, page - 2);
        const end   = Math.min(totalPages, page + 2);
        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(`<a href="${buildUrl(i)}" ${i === page ? 'aria-current="page"' : ''}>${i}</a>`);
        }
        return `
        <nav class="vm-pagination" aria-label="Paginación">
            ${page > 1 ? `<a href="${buildUrl(page - 1)}" rel="prev" aria-label="Anterior">←</a>` : ''}
            ${pages.join('')}
            ${page < totalPages ? `<a href="${buildUrl(page + 1)}" rel="next" aria-label="Siguiente">→</a>` : ''}
        </nav>`;
    }

    // ─── View Switch (grid / list) ─────────────────────────────────
    if (switchEl) {
        switchEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-view]');
            if (!btn) return;
            const mode = btn.dataset.view;
            switchEl.dataset.mode = mode;
            switchEl.querySelectorAll('button').forEach(b => {
                b.setAttribute('aria-pressed', b.dataset.view === mode ? 'true' : 'false');
            });
            const list = $('#vm-products-list');
            if (list) {
                list.classList.toggle('vm-product-grid', mode === 'grid');
                list.classList.toggle('vm-product-list', mode === 'list');
                if (mode === 'grid') list.dataset.cols = '3';
            }
            try { localStorage.setItem('vm-catalog-view', mode); } catch {}
        });

        // Restaurar preferencia previa
        try {
            const saved = localStorage.getItem('vm-catalog-view');
            if (saved && saved !== switchEl.dataset.mode) {
                switchEl.querySelector(`[data-view="${saved}"]`)?.click();
            }
        } catch {}
    }

    // ─── Filtros ───────────────────────────────────────────────────
    let searchTimer = null;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(fetchAndRender, 320);
    });

    $$('input[name="sort"]').forEach(r => {
        r.addEventListener('change', fetchAndRender);
    });
    $$('input[name="marcas"]').forEach(c => {
        c.addEventListener('change', fetchAndRender);
    });

    function clearFilters() {
        if (searchInput) searchInput.value = '';
        $$('input[name="marcas"]').forEach(c => c.checked = false);
        const recent = $('input[name="sort"][value="recent"]');
        if (recent) recent.checked = true;
        fetchAndRender();
    }
    clearBtn?.addEventListener('click', clearFilters);

})();
