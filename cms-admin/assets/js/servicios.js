/**
 * CMS Admin — Servicios (Lista + Encabezado singleton)
 */
'use strict';

const Servicios = (() => {
    // ── Paginación categorías ─────────────────────────────────────────────
    let catPage       = 1;
    let catTotalPages = 1;
    const CAT_LIMIT   = 10;
    let deleteCatUuid = null;

    // ── Paginación items ──────────────────────────────────────────────────
    let itemPage       = 1;
    let itemTotalPages = 1;
    const ITEM_LIMIT   = 10;
    let deleteItemUuid = null;

    // ── Estado encabezado ─────────────────────────────────────────────────
    let servicioUuid = null;

    const el  = (id) => document.getElementById(id);
    const esc = (s)  => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    function formatDate(d) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' });
    }

    // ── Init ─────────────────────────────────────────────────────────────

    function init() {
        loadEncabezado();
        loadCategorias();

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
                btn.classList.add('active');
                el('tab-' + btn.dataset.tab).style.display = '';
                if (btn.dataset.tab === 'items' && itemPage === 1) loadItems();
            });
        });

        // Paginación categorías
        el('cat-pagination-prev')?.addEventListener('click', () => goToCatPage(catPage - 1));
        el('cat-pagination-next')?.addEventListener('click', () => goToCatPage(catPage + 1));
        el('btn-confirm-delete-cat')?.addEventListener('click', handleDeleteCat);

        // Paginación items
        el('items-pagination-prev')?.addEventListener('click', () => goToItemPage(itemPage - 1));
        el('items-pagination-next')?.addEventListener('click', () => goToItemPage(itemPage + 1));
        el('btn-confirm-delete-item')?.addEventListener('click', handleDeleteItem);

        // Encabezado form
        el('btn-edit-encabezado')?.addEventListener('click', showEncabezadoForm);
        el('btn-cancel-encabezado')?.addEventListener('click', hideEncabezadoForm);
        el('encabezado-form')?.addEventListener('submit', handleEncabezadoSubmit);
    }

    // ── Encabezado ────────────────────────────────────────────────────────

    async function loadEncabezado() {
        try {
            const result = await Api.getServicio();
            if (result.success && result.data) {
                servicioUuid = result.data.uuid;
                renderEncabezado(result.data);
            } else {
                el('encabezado-display').innerHTML =
                    `<p style="color:var(--color-text-tertiary);font-size:var(--font-size-sm)">No hay encabezado configurado. <button class="btn btn-sm btn-primary" id="btn-create-enc">Crear ahora</button></p>`;
                el('btn-create-enc')?.addEventListener('click', showEncabezadoForm);
                el('btn-edit-encabezado').textContent = '+ Crear';
            }
        } catch {
            el('encabezado-display').innerHTML = `<p style="color:var(--color-error)">Error al cargar el encabezado.</p>`;
        }
    }

    function renderEncabezado(data) {
        el('encabezado-display').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:var(--space-2)">
                <div><strong>${esc(data.titulo)}</strong></div>
                ${data.subtitulo ? `<div style="color:var(--color-text-secondary);font-size:var(--font-size-sm)">${esc(data.subtitulo)}</div>` : ''}
            </div>`;
        el('btn-edit-encabezado').textContent = '✏️ Editar';
    }

    function showEncabezadoForm() {
        el('encabezado-form-wrap').style.display = '';
        if (servicioUuid) {
            const display = el('encabezado-display');
            const strong  = display.querySelector('strong');
            const sub     = display.querySelector('div > div:last-child');
            el('enc-titulo').value    = strong?.textContent || '';
            el('enc-subtitulo').value = sub?.textContent    || '';
        }
    }

    function hideEncabezadoForm() {
        el('encabezado-form-wrap').style.display = 'none';
    }

    async function handleEncabezadoSubmit(e) {
        e.preventDefault();
        const titulo    = el('enc-titulo').value.trim();
        const subtitulo = el('enc-subtitulo').value.trim() || null;
        const err       = el('enc-titulo-error');

        if (!titulo || titulo.length < 2) {
            if (err) err.textContent = 'El título debe tener al menos 2 caracteres.';
            return;
        }
        if (err) err.textContent = '';

        const btn = el('btn-encabezado-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            let result;
            if (servicioUuid) {
                result = await Api.updateServicio(servicioUuid, { titulo, subtitulo });
            } else {
                result = await Api.createServicio({ titulo, subtitulo });
                servicioUuid = result.data?.uuid ?? null;
            }
            if (result.success) {
                Toast.success('Encabezado guardado correctamente.');
                renderEncabezado(result.data);
                hideEncabezadoForm();
            }
        } catch (err2) {
            Toast.error(err2.data?.message || err2.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    // ── Categorías ────────────────────────────────────────────────────────

    async function loadCategorias(page = 1) {
        catPage = page;
        const tbody = el('categorias-tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:var(--space-6);color:var(--color-text-tertiary)">Cargando...</td></tr>`;

        try {
            const result = await Api.getServicioCategorias(page, CAT_LIMIT);
            if (result.success) {
                renderCategorias(result.data.data);
                renderCatPagination(result.data.meta);
            }
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--color-error)">Error al cargar categorías.</td></tr>`;
            Toast.error(err.message);
        }
    }

    function renderCategorias(cats) {
        const tbody = el('categorias-tbody');
        if (!tbody) return;
        if (!cats?.length) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:var(--space-6);color:var(--color-text-tertiary)">No hay categorías.</td></tr>`;
            return;
        }
        tbody.innerHTML = cats.map(c => `
            <tr>
                <td>${esc(c.nombre)}</td>
                <td style="text-align:center">${c.orden}</td>
                <td style="text-align:center">
                    <span class="badge ${c.estado ? 'badge-activo' : 'badge-inactivo'}">${c.estado ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <a href="servicio-categoria-edit.php?uuid=${encodeURIComponent(c.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar">✏️</a>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Servicios.openDeleteCatModal('${esc(c.uuid)}','${esc(c.nombre)}')" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>`).join('');
    }

    function renderCatPagination(meta) {
        if (!meta) return;
        catTotalPages = meta.totalPages || 1;
        const info    = el('cat-pagination-info');
        const numbers = el('cat-pagination-numbers');
        const prev    = el('cat-pagination-prev');
        const next    = el('cat-pagination-next');

        if (info) {
            const start = (meta.page - 1) * meta.limit + 1;
            const end   = Math.min(meta.page * meta.limit, meta.total);
            info.textContent = `Mostrando ${start}–${end} de ${meta.total} categorías`;
        }
        if (prev) prev.disabled = meta.page <= 1;
        if (next) next.disabled = meta.page >= catTotalPages;
        if (numbers) {
            const pages = [];
            for (let i = 1; i <= catTotalPages; i++) {
                if (i === 1 || i === catTotalPages || Math.abs(i - meta.page) <= 1) pages.push(i);
                else if (pages[pages.length - 1] !== '...') pages.push('...');
            }
            numbers.innerHTML = pages.map(p =>
                p === '...'
                    ? `<span class="pagination-btn" style="cursor:default">…</span>`
                    : `<button class="pagination-btn ${p === meta.page ? 'active' : ''}" onclick="Servicios.goToCatPage(${p})">${p}</button>`
            ).join('');
        }
    }

    function openDeleteCatModal(uuid, nombre) {
        deleteCatUuid = uuid;
        const nameEl = el('delete-cat-name');
        if (nameEl) nameEl.textContent = nombre;
        Modal.open('delete-cat-modal');
    }

    async function handleDeleteCat() {
        if (!deleteCatUuid) return;
        const btn = el('btn-confirm-delete-cat');
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            const result = await Api.deleteServicioCategoria(deleteCatUuid);
            if (result.success) {
                Toast.success('Categoría eliminada correctamente.');
                Modal.close('delete-cat-modal');
                loadCategorias(catPage);
            }
        } catch (err) {
            Toast.error(err.data?.message || err.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
            deleteCatUuid = null;
        }
    }

    function goToCatPage(page) {
        if (page < 1 || page > catTotalPages) return;
        loadCategorias(page);
    }

    // ── Items ─────────────────────────────────────────────────────────────

    async function loadItems(page = 1) {
        itemPage = page;
        const tbody = el('items-tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-6);color:var(--color-text-tertiary)">Cargando...</td></tr>`;

        try {
            const result = await Api.getServicioItems(page, ITEM_LIMIT);
            if (result.success) {
                renderItems(result.data.data);
                renderItemPagination(result.data.meta);
            }
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--color-error)">Error al cargar items.</td></tr>`;
            Toast.error(err.message);
        }
    }

    const ESTADO_LABELS = { activo: 'Activo', inactivo: 'Inactivo', no_mostrar: 'No mostrar' };
    const ESTADO_CLASS  = { activo: 'badge-activo', inactivo: 'badge-inactivo', no_mostrar: 'badge-no_mostrar' };

    function renderItems(items) {
        const tbody = el('items-tbody');
        if (!tbody) return;
        if (!items?.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-6);color:var(--color-text-tertiary)">No hay items.</td></tr>`;
            return;
        }
        tbody.innerHTML = items.map(it => {
            const firstImg = it.imagenes?.[0];
            const thumbHtml = firstImg
                ? `<img src="${esc(firstImg.url)}" alt="${esc(it.titulo)}" class="servicio-thumb" loading="lazy">`
                : `<div class="servicio-thumb-empty">📦</div>`;

            const precioStr = it.precio != null
                ? `${it.moneda?.codigo ?? ''} ${parseFloat(it.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                : '—';

            return `<tr>
                <td>${thumbHtml}</td>
                <td>
                    <div style="font-weight:var(--font-weight-medium);color:var(--color-text-primary)">${esc(it.titulo)}</div>
                    ${it.subtitulo_1 ? `<div style="font-size:var(--font-size-xs);color:var(--color-text-tertiary)">${esc(it.subtitulo_1)}</div>` : ''}
                </td>
                <td style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">${esc(it.categoria_uuid ? '—' : '—')}</td>
                <td style="text-align:right;font-size:var(--font-size-sm)">${esc(precioStr)}</td>
                <td style="text-align:center">
                    <span class="badge ${ESTADO_CLASS[it.estado] ?? ''}">${ESTADO_LABELS[it.estado] ?? it.estado}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <a href="servicio-item-edit.php?uuid=${encodeURIComponent(it.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar">✏️</a>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Servicios.openDeleteItemModal('${esc(it.uuid)}','${esc(it.titulo)}')" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function renderItemPagination(meta) {
        if (!meta) return;
        itemTotalPages = meta.totalPages || 1;
        const info    = el('items-pagination-info');
        const numbers = el('items-pagination-numbers');
        const prev    = el('items-pagination-prev');
        const next    = el('items-pagination-next');

        if (info) {
            const start = (meta.page - 1) * meta.limit + 1;
            const end   = Math.min(meta.page * meta.limit, meta.total);
            info.textContent = `Mostrando ${start}–${end} de ${meta.total} items`;
        }
        if (prev) prev.disabled = meta.page <= 1;
        if (next) next.disabled = meta.page >= itemTotalPages;
        if (numbers) {
            const pages = [];
            for (let i = 1; i <= itemTotalPages; i++) {
                if (i === 1 || i === itemTotalPages || Math.abs(i - meta.page) <= 1) pages.push(i);
                else if (pages[pages.length - 1] !== '...') pages.push('...');
            }
            numbers.innerHTML = pages.map(p =>
                p === '...'
                    ? `<span class="pagination-btn" style="cursor:default">…</span>`
                    : `<button class="pagination-btn ${p === meta.page ? 'active' : ''}" onclick="Servicios.goToItemPage(${p})">${p}</button>`
            ).join('');
        }
    }

    function openDeleteItemModal(uuid, nombre) {
        deleteItemUuid = uuid;
        const nameEl = el('delete-item-name');
        if (nameEl) nameEl.textContent = nombre;
        Modal.open('delete-item-modal');
    }

    async function handleDeleteItem() {
        if (!deleteItemUuid) return;
        const btn = el('btn-confirm-delete-item');
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            const result = await Api.deleteServicioItem(deleteItemUuid);
            if (result.success) {
                Toast.success('Item eliminado correctamente.');
                Modal.close('delete-item-modal');
                loadItems(itemPage);
            }
        } catch (err) {
            Toast.error(err.data?.message || err.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
            deleteItemUuid = null;
        }
    }

    function goToItemPage(page) {
        if (page < 1 || page > itemTotalPages) return;
        loadItems(page);
    }

    return { init, goToCatPage, goToItemPage, openDeleteCatModal, openDeleteItemModal };
})();
