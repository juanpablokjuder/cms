/**
 * CMS Admin — Noticias List
 */
'use strict';

const Noticias = (() => {
    let currentPage = 1;
    let totalPages  = 1;
    const LIMIT     = 10;
    let deleteUuid  = null;

    const el = (id) => document.getElementById(id);

    function init() {
        loadNoticias();
        el('noticias-pagination-prev')?.addEventListener('click', () => goToPage(currentPage - 1));
        el('noticias-pagination-next')?.addEventListener('click', () => goToPage(currentPage + 1));
        el('btn-confirm-delete')?.addEventListener('click', handleDelete);
    }

    async function loadNoticias(page = 1) {
        currentPage = page;
        showTableLoading();
        try {
            const result = await Api.getNoticias(page, LIMIT);
            if (result.success) {
                renderTable(result.data.data);
                renderPagination(result.data.meta);
            }
        } catch (err) {
            showTableEmpty('Error al cargar las noticias.');
            Toast.error(err.message);
        }
    }

    function renderTable(noticias) {
        const tbody = el('noticias-tbody');
        if (!tbody) return;
        if (!noticias?.length) { showTableEmpty('No se encontraron noticias.'); return; }

        tbody.innerHTML = noticias.map(n => {
            const firstImg = n.imagenes?.[0];
            const thumbHtml = firstImg
                ? `<img src="${esc(firstImg.url)}" alt="${esc(n.titulo)}" class="noticia-thumb" loading="lazy">`
                : `<div class="noticia-thumb-empty">📰</div>`;

            return `<tr>
                <td>${thumbHtml}</td>
                <td>
                    <div style="font-weight:var(--font-weight-medium);color:var(--color-text-primary);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.titulo)}</div>
                    ${n.subtitulo ? `<div style="font-size:var(--font-size-xs);color:var(--color-text-tertiary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px">${esc(n.subtitulo)}</div>` : ''}
                </td>
                <td><code style="font-size:var(--font-size-xs);color:var(--color-accent);background:var(--color-accent-subtle);padding:2px 6px;border-radius:4px">${esc(n.slug)}</code></td>
                <td style="text-align:center">
                    <span class="badge badge-viewer">${n.imagenes?.length ?? 0}</span>
                </td>
                <td style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${formatDate(n.created_at)}</td>
                <td>
                    <div class="table-actions">
                        <a href="noticia-edit.php?uuid=${encodeURIComponent(n.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar">✏️</a>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Noticias.openDeleteModal('${esc(n.uuid)}','${esc(n.titulo)}')" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function renderPagination(meta) {
        if (!meta) return;
        totalPages = meta.totalPages || 1;
        const info    = el('noticias-pagination-info');
        const numbers = el('noticias-pagination-numbers');
        const prev    = el('noticias-pagination-prev');
        const next    = el('noticias-pagination-next');

        if (info) {
            const start = (meta.page - 1) * meta.limit + 1;
            const end   = Math.min(meta.page * meta.limit, meta.total);
            info.textContent = `Mostrando ${start}–${end} de ${meta.total} noticias`;
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
                    : `<button class="pagination-btn ${p === meta.page ? 'active' : ''}" onclick="Noticias.goToPage(${p})">${p}</button>`
            ).join('');
        }
    }

    function openDeleteModal(uuid, title) {
        deleteUuid = uuid;
        const titleEl = el('delete-noticia-title');
        if (titleEl) titleEl.textContent = title;
        Modal.open('delete-modal');
    }

    async function handleDelete() {
        if (!deleteUuid) return;
        const btn = el('btn-confirm-delete');
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            const result = await Api.deleteNoticia(deleteUuid);
            if (result.success) {
                Toast.success('Noticia eliminada correctamente.');
                Modal.close('delete-modal');
                loadNoticias(currentPage);
            }
        } catch (err) {
            Toast.error(err.data?.message || err.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
            deleteUuid = null;
        }
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        loadNoticias(page);
    }

    function showTableLoading() {
        const tbody = el('noticias-tbody');
        if (!tbody) return;
        let rows = '';
        for (let i = 0; i < 4; i++) {
            rows += `<tr>
                <td><div class="skeleton skeleton-cell" style="width:72px;height:44px;border-radius:8px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:70%;height:14px;margin-bottom:6px"></div><div class="skeleton skeleton-cell" style="width:50%;height:12px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:100px;height:22px;border-radius:4px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:28px;height:22px;border-radius:999px;margin:0 auto"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:70px;height:12px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:60px;height:14px"></div></td>
            </tr>`;
        }
        tbody.innerHTML = rows;
    }

    function showTableEmpty(msg) {
        const tbody = el('noticias-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
            <div class="empty-state-icon">📰</div>
            <div class="empty-state-title">${esc(msg)}</div>
        </div></td></tr>`;
    }

    function esc(str) {
        if (!str && str !== 0) return '';
        const d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    function formatDate(iso) {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return { init, loadNoticias, openDeleteModal, goToPage };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('noticias-table')) Noticias.init();
});
