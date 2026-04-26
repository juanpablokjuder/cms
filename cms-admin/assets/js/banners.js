/**
 * CMS Admin — Banners List (Table + Pagination + Delete)
 */

'use strict';

const Banners = (() => {
    let currentPage = 1;
    let totalPages = 1;
    const LIMIT = 10;
    let deleteUuid = null;

    function el(id) { return document.getElementById(id); }

    function init() {
        loadBanners();
        const prevBtn = el('banners-pagination-prev');
        const nextBtn = el('banners-pagination-next');
        if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

        const confirmBtn = el('btn-confirm-delete');
        if (confirmBtn) confirmBtn.addEventListener('click', handleDelete);
    }

    async function loadBanners(page = 1) {
        currentPage = page;
        showTableLoading();
        try {
            const result = await Api.getBanners(page, LIMIT);
            if (result.success) {
                renderTable(result.data.data);
                renderPagination(result.data.meta);
            }
        } catch (err) {
            showTableEmpty('Error al cargar los banners.');
            Toast.error(err.message);
        }
    }

    function renderTable(banners) {
        const tbody = el('banners-tbody');
        if (!tbody) return;
        if (!banners || banners.length === 0) { showTableEmpty('No se encontraron banners.'); return; }

        tbody.innerHTML = banners.map(b => {
            const imgHtml = b.imagen
                ? `<img src="${esc(b.imagen)}" alt="${esc(b.h1)}" class="banner-thumb" loading="lazy">`
                : `<div class="banner-thumb-empty">🖼️</div>`;
            return `<tr>
                <td>${imgHtml}</td>
                <td><span class="badge badge-admin">${esc(b.pagina)}</span></td>
                <td style="font-weight:var(--font-weight-medium);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.h1)}</td>
                <td><span class="orden-badge">${b.orden ?? 0}</span></td>
                <td>
                    <div class="table-actions">
                        <a href="banner-edit.php?uuid=${encodeURIComponent(b.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar" aria-label="Editar banner">✏️</a>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Banners.openDeleteModal('${esc(b.uuid)}','${esc(b.pagina)} — ${esc(b.h1)}')" title="Eliminar" aria-label="Eliminar banner">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function renderPagination(meta) {
        if (!meta) return;
        totalPages = meta.totalPages || 1;
        const info = el('banners-pagination-info');
        const controls = el('banners-pagination-numbers');
        const prevBtn = el('banners-pagination-prev');
        const nextBtn = el('banners-pagination-next');

        if (info) {
            const start = (meta.page - 1) * meta.limit + 1;
            const end = Math.min(meta.page * meta.limit, meta.total);
            info.textContent = `Mostrando ${start}–${end} de ${meta.total} banners`;
        }
        if (prevBtn) prevBtn.disabled = meta.page <= 1;
        if (nextBtn) nextBtn.disabled = meta.page >= totalPages;

        if (controls) {
            let pages = [];
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || Math.abs(i - meta.page) <= 1) pages.push(i);
                else if (pages[pages.length - 1] !== '...') pages.push('...');
            }
            controls.innerHTML = pages.map(p => {
                if (p === '...') return `<span class="pagination-btn" style="cursor:default">…</span>`;
                return `<button class="pagination-btn ${p === meta.page ? 'active' : ''}" onclick="Banners.goToPage(${p})">${p}</button>`;
            }).join('');
        }
    }

    function openDeleteModal(uuid, name) {
        deleteUuid = uuid;
        const nameEl = el('delete-banner-name');
        if (nameEl) nameEl.textContent = name;
        Modal.open('delete-modal');
    }

    async function handleDelete() {
        if (!deleteUuid) return;
        const btn = el('btn-confirm-delete');
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            const result = await Api.deleteBanner(deleteUuid);
            if (result.success) {
                Toast.success('Banner eliminado correctamente.');
                Modal.close('delete-modal');
                loadBanners(currentPage);
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
        loadBanners(page);
    }

    function showTableLoading() {
        const tbody = el('banners-tbody');
        if (!tbody) return;
        let rows = '';
        for (let i = 0; i < 4; i++) {
            rows += `<tr><td><div class="skeleton skeleton-cell" style="width:80px;height:48px;border-radius:8px"></div></td><td><div class="skeleton skeleton-cell" style="width:70px;height:22px;border-radius:999px"></div></td><td><div class="skeleton skeleton-cell" style="width:70%;height:14px"></div></td><td><div class="skeleton skeleton-cell" style="width:28px;height:28px;border-radius:50%"></div></td><td><div class="skeleton skeleton-cell" style="width:60px;height:14px"></div></td></tr>`;
        }
        tbody.innerHTML = rows;
    }

    function showTableEmpty(msg) {
        const tbody = el('banners-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">🖼️</div><div class="empty-state-title">${esc(msg)}</div></div></td></tr>`;
    }

    function esc(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

    return { init, loadBanners, openDeleteModal, goToPage };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('banners-table')) Banners.init();
});
