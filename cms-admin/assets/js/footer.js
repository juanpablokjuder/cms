'use strict';

const FooterList = (() => {
    let currentPage = 1, totalPages = 1, deleteUuid = null;
    const LIMIT = 10;
    const el = (id) => document.getElementById(id);

    function init() {
        load();
        el('footer-pagination-prev')?.addEventListener('click', () => goToPage(currentPage - 1));
        el('footer-pagination-next')?.addEventListener('click', () => goToPage(currentPage + 1));
        el('btn-confirm-delete')?.addEventListener('click', handleDelete);
    }

    async function load(page = 1) {
        currentPage = page;
        const tbody = el('footer-tbody');
        if (tbody) tbody.innerHTML = skeletonRows();
        try {
            const result = await Api.getFooterList(page, LIMIT);
            if (result.success) { renderTable(result.data.data); renderPagination(result.data.meta); }
        } catch (err) { emptyTable('Error al cargar.'); Toast.error(err.message); }
    }

    function renderTable(list) {
        const tbody = el('footer-tbody');
        if (!tbody) return;
        if (!list?.length) { emptyTable('Sin configuraciones de footer.'); return; }
        tbody.innerHTML = list.map(f => `<tr>
            <td style="font-size:var(--font-size-sm)">${esc(f.copyright_text || '—')}</td>
            <td style="text-align:center"><span class="badge badge-viewer">${f.columnas_count}</span></td>
            <td style="text-align:center"><span class="badge badge-viewer">${f.redes?.length ?? 0}</span></td>
            <td style="text-align:center"><span class="badge badge-viewer">${f.legales?.length ?? 0}</span></td>
            <td style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${fmt(f.created_at)}</td>
            <td>
                <div class="table-actions">
                    <a href="footer-edit.php?uuid=${encodeURIComponent(f.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar">✏️</a>
                    <button class="btn btn-ghost btn-icon btn-sm" onclick="FooterList.openDelete('${esc(f.uuid)}','${esc(f.copyright_text||'Sin copyright')}')" title="Eliminar">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
    }

    function renderPagination(meta) {
        if (!meta) return;
        totalPages = meta.totalPages || 1;
        const info = el('footer-pagination-info');
        const nums = el('footer-pagination-numbers');
        const prev = el('footer-pagination-prev');
        const next = el('footer-pagination-next');
        if (info) { const s=(meta.page-1)*meta.limit+1,e=Math.min(meta.page*meta.limit,meta.total); info.textContent=`Mostrando ${s}–${e} de ${meta.total}`; }
        if (prev) prev.disabled = meta.page <= 1;
        if (next) next.disabled = meta.page >= totalPages;
        if (nums) {
            const pages=[];
            for(let i=1;i<=totalPages;i++){if(i===1||i===totalPages||Math.abs(i-meta.page)<=1)pages.push(i);else if(pages[pages.length-1]!=='...')pages.push('...');}
            nums.innerHTML=pages.map(p=>p==='...'?`<span class="pagination-btn" style="cursor:default">…</span>`:`<button class="pagination-btn ${p===meta.page?'active':''}" onclick="FooterList.goToPage(${p})">${p}</button>`).join('');
        }
    }

    function openDelete(uuid, name) { deleteUuid=uuid; const t=el('delete-footer-name'); if(t)t.textContent=name; Modal.open('delete-modal'); }

    async function handleDelete() {
        if (!deleteUuid) return;
        const btn = el('btn-confirm-delete');
        btn.disabled=true; btn.classList.add('loading');
        try {
            const r = await Api.deleteFooter(deleteUuid);
            if (r.success) { Toast.success('Footer eliminado.'); Modal.close('delete-modal'); load(currentPage); }
        } catch(err){ Toast.error(err.data?.message||err.message); }
        finally { btn.disabled=false; btn.classList.remove('loading'); deleteUuid=null; }
    }

    function goToPage(p) { if(p>=1&&p<=totalPages) load(p); }

    function emptyTable(msg) {
        const tbody=el('footer-tbody');
        if(tbody) tbody.innerHTML=`<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">🗂️</div><div class="empty-state-title">${esc(msg)}</div></div></td></tr>`;
    }
    function skeletonRows() { let r=''; for(let i=0;i<3;i++) r+=`<tr>${[180,60,40,40,80,60].map(w=>`<td><div class="skeleton skeleton-cell" style="width:${w}px;height:14px"></div></td>`).join('')}</tr>`; return r; }
    function esc(s){if(!s&&s!==0)return'';const d=document.createElement('div');d.textContent=String(s);return d.innerHTML;}
    function fmt(iso){if(!iso)return'—';return new Date(iso).toLocaleDateString('es-AR',{day:'2-digit',month:'short',year:'numeric'});}

    return { init, load, openDelete, goToPage };
})();

document.addEventListener('DOMContentLoaded', () => { if(document.getElementById('footer-table')) FooterList.init(); });
