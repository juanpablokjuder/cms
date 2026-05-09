/**
 * CMS Admin — Locales List
 */
'use strict';

const Locales = (() => {
    let currentPage = 1;
    let totalPages  = 1;
    const LIMIT     = 10;
    let deleteUuid  = null;

    const el = (id) => document.getElementById(id);

    function init() {
        loadLocales();
        el('locales-pagination-prev')?.addEventListener('click', () => goToPage(currentPage - 1));
        el('locales-pagination-next')?.addEventListener('click', () => goToPage(currentPage + 1));
        el('btn-confirm-delete')?.addEventListener('click', handleDelete);
    }

    async function loadLocales(page = 1) {
        currentPage = page;
        showTableLoading();
        try {
            const result = await Api.getLocales(page, LIMIT);
            if (result.success) {
                renderTable(result.data.data);
                renderPagination(result.data.meta);
            }
        } catch (err) {
            showTableEmpty('Error al cargar los locales.');
            Toast.error(err.message);
        }
    }

    function renderTable(locales) {
        const tbody = el('locales-tbody');
        if (!tbody) return;
        if (!locales?.length) { showTableEmpty('No se encontraron locales.'); return; }

        tbody.innerHTML = locales.map(l => {
            const firstImg  = l.imagenes?.[0];
            const thumbHtml = firstImg
                ? `<img src="${esc(firstImg.url)}" alt="${esc(l.nombre)}" class="local-thumb" loading="lazy">`
                : `<div class="local-thumb-empty">📍</div>`;

            return `<tr>
                <td>${thumbHtml}</td>
                <td>
                    <div style="font-weight:var(--font-weight-medium);color:var(--color-text-primary);max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.nombre)}</div>
                </td>
                <td style="text-align:center">
                    <span class="badge badge-viewer">${l.imagenes?.length ?? 0}</span>
                </td>
                <td style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${formatDate(l.created_at)}</td>
                <td>
                    <div class="table-actions">
                        <a href="local-edit.php?uuid=${encodeURIComponent(l.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar">✏️</a>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Locales.openDeleteModal('${esc(l.uuid)}','${esc(l.nombre)}')" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function renderPagination(meta) {
        if (!meta) return;
        totalPages = meta.totalPages || 1;
        const info    = el('locales-pagination-info');
        const numbers = el('locales-pagination-numbers');
        const prev    = el('locales-pagination-prev');
        const next    = el('locales-pagination-next');

        if (info) {
            const start = (meta.page - 1) * meta.limit + 1;
            const end   = Math.min(meta.page * meta.limit, meta.total);
            info.textContent = `Mostrando ${start}–${end} de ${meta.total} locales`;
        }
        if (prev) prev.disabled = meta.page <= 1;
        if (next) next.disabled = meta.page >= totalPages;

        if (numbers) {
            const pages = [];
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || Math.abs(i - meta.page) <= 1) pages.push(i);
                else if (pages[pages.length - 1] !== '...') pages.push('...');
            }
            numbers.innerHTML = pages.map(p =>
                p === '...'
                    ? `<span class="pagination-btn" style="cursor:default">…</span>`
                    : `<button class="pagination-btn ${p === meta.page ? 'active' : ''}" onclick="Locales.goToPage(${p})">${p}</button>`
            ).join('');
        }
    }

    function openDeleteModal(uuid, nombre) {
        deleteUuid = uuid;
        const nameEl = el('delete-local-name');
        if (nameEl) nameEl.textContent = nombre;
        Modal.open('delete-modal');
    }

    async function handleDelete() {
        if (!deleteUuid) return;
        const btn = el('btn-confirm-delete');
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            const result = await Api.deleteLocal(deleteUuid);
            if (result.success) {
                Toast.success('Local eliminado correctamente.');
                Modal.close('delete-modal');
                loadLocales(currentPage);
            }
        } catch (err) {
            Toast.error(err.data?.message || err.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    function showTableLoading() {
        const tbody = el('locales-tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:var(--space-8);color:var(--color-text-tertiary)">Cargando...</td></tr>`;
    }

    function showTableEmpty(msg = 'Sin resultados.') {
        const tbody = el('locales-tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:var(--space-8);color:var(--color-text-tertiary)">${msg}</td></tr>`;
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        loadLocales(page);
    }

    function esc(str) {
        if (str == null) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    document.addEventListener('DOMContentLoaded', init);

    return { openDeleteModal, goToPage };
})();
