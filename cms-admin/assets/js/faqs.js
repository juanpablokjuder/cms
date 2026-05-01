'use strict';

const Faqs = (() => {
    let currentPage = 1;
    let totalPages  = 1;
    const LIMIT     = 10;
    let deleteUuid  = null;
    const el = (id) => document.getElementById(id);

    function init() {
        loadFaqs();
        el('faqs-pagination-prev')?.addEventListener('click', () => goToPage(currentPage - 1));
        el('faqs-pagination-next')?.addEventListener('click', () => goToPage(currentPage + 1));
        el('btn-confirm-delete')?.addEventListener('click', handleDelete);
    }

    async function loadFaqs(page = 1) {
        currentPage = page;
        showTableLoading();
        try {
            const result = await Api.getFaqs(page, LIMIT);
            if (result.success) { renderTable(result.data.data); renderPagination(result.data.meta); }
        } catch (err) { showTableEmpty('Error al cargar las FAQs.'); Toast.error(err.message); }
    }

    function renderTable(faqs) {
        const tbody = el('faqs-tbody');
        if (!tbody) return;
        if (!faqs?.length) { showTableEmpty('No se encontraron secciones de FAQs.'); return; }

        tbody.innerHTML = faqs.map(f => {
            const imgHtml = f.imagen
                ? `<img src="${esc(f.imagen)}" alt="${esc(f.titulo)}" class="noticia-thumb" loading="lazy">`
                : `<div class="noticia-thumb-empty">❓</div>`;
            return `<tr>
                <td>${imgHtml}</td>
                <td style="font-weight:var(--font-weight-medium)">${esc(f.titulo)}</td>
                <td style="text-align:center"><span class="badge badge-viewer">${f.items?.length ?? 0}</span></td>
                <td style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${formatDate(f.created_at)}</td>
                <td>
                    <div class="table-actions">
                        <a href="faq-edit.php?uuid=${encodeURIComponent(f.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar">✏️</a>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Faqs.openDeleteModal('${esc(f.uuid)}','${esc(f.titulo)}')" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function renderPagination(meta) {
        if (!meta) return;
        totalPages = meta.totalPages || 1;
        const info = el('faqs-pagination-info');
        const nums = el('faqs-pagination-numbers');
        const prev = el('faqs-pagination-prev');
        const next = el('faqs-pagination-next');
        if (info) { const s = (meta.page - 1) * meta.limit + 1; const e = Math.min(meta.page * meta.limit, meta.total); info.textContent = `Mostrando ${s}–${e} de ${meta.total} FAQs`; }
        if (prev) prev.disabled = meta.page <= 1;
        if (next) next.disabled = meta.page >= totalPages;
        if (nums) {
            const pages = [];
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || Math.abs(i - meta.page) <= 1) pages.push(i);
                else if (pages[pages.length - 1] !== '...') pages.push('...');
            }
            nums.innerHTML = pages.map(p => p === '...'
                ? `<span class="pagination-btn" style="cursor:default">…</span>`
                : `<button class="pagination-btn ${p === meta.page ? 'active' : ''}" onclick="Faqs.goToPage(${p})">${p}</button>`
            ).join('');
        }
    }

    function openDeleteModal(uuid, title) {
        deleteUuid = uuid;
        const t = el('delete-faq-title');
        if (t) t.textContent = title;
        Modal.open('delete-modal');
    }

    async function handleDelete() {
        if (!deleteUuid) return;
        const btn = el('btn-confirm-delete');
        btn.disabled = true; btn.classList.add('loading');
        try {
            const result = await Api.deleteFaq(deleteUuid);
            if (result.success) { Toast.success('FAQ eliminada correctamente.'); Modal.close('delete-modal'); loadFaqs(currentPage); }
        } catch (err) { Toast.error(err.data?.message || err.message); }
        finally { btn.disabled = false; btn.classList.remove('loading'); deleteUuid = null; }
    }

    function goToPage(page) { if (page >= 1 && page <= totalPages) loadFaqs(page); }

    function showTableLoading() {
        const tbody = el('faqs-tbody');
        if (!tbody) return;
        let rows = '';
        for (let i = 0; i < 3; i++) rows += `<tr><td><div class="skeleton skeleton-cell" style="width:72px;height:44px;border-radius:8px"></div></td><td><div class="skeleton skeleton-cell" style="width:60%;height:14px"></div></td><td><div class="skeleton skeleton-cell" style="width:28px;height:22px;border-radius:999px;margin:0 auto"></div></td><td><div class="skeleton skeleton-cell" style="width:70px;height:12px"></div></td><td><div class="skeleton skeleton-cell" style="width:60px;height:14px"></div></td></tr>`;
        tbody.innerHTML = rows;
    }

    function showTableEmpty(msg) {
        const tbody = el('faqs-tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">❓</div><div class="empty-state-title">${esc(msg)}</div></div></td></tr>`;
    }

    function esc(str) { if (!str && str !== 0) return ''; const d = document.createElement('div'); d.textContent = String(str); return d.innerHTML; }
    function formatDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }); }

    return { init, loadFaqs, openDeleteModal, goToPage };
})();

document.addEventListener('DOMContentLoaded', () => { if (document.getElementById('faqs-table')) Faqs.init(); });
