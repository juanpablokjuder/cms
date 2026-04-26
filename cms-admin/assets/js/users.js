/**
 * CMS Admin — Users List (Table + Pagination + Delete)
 * 
 * Create/Edit are handled on separate pages.
 * This file handles: table rendering, pagination, and delete confirmation.
 */

'use strict';

const Users = (() => {
    let currentPage = 1;
    let totalPages = 1;
    const LIMIT = 10;
    let deleteUuid = null;

    function el(id) { return document.getElementById(id); }

    function init() {
        loadUsers();
        const prevBtn = el('pagination-prev');
        const nextBtn = el('pagination-next');
        if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

        const confirmDeleteBtn = el('btn-confirm-delete');
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleDelete);
    }

    async function loadUsers(page = 1) {
        currentPage = page;
        showTableLoading();

        try {
            const result = await Api.getUsers(page, LIMIT);
            if (result.success) {
                renderTable(result.data.data);
                renderPagination(result.data.meta);
            }
        } catch (err) {
            showTableEmpty('Error al cargar los usuarios.');
            Toast.error(err.message);
        }
    }

    function renderTable(users) {
        const tbody = el('users-tbody');
        if (!tbody) return;
        if (!users || users.length === 0) { showTableEmpty('No se encontraron usuarios.'); return; }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                        <div class="header-avatar" style="width:32px;height:32px;font-size:0.7rem">${getInitials(user.name)}</div>
                        <div>
                            <div style="font-weight:var(--font-weight-medium);color:var(--color-text-primary)">${esc(user.name)}</div>
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-tertiary)">${esc(user.email)}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-${user.role}">${esc(user.role)}</span></td>
                <td><span class="badge ${user.is_active ? 'badge-active' : 'badge-inactive'}">${user.is_active ? 'Activo' : 'Inactivo'}</span></td>
                <td style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${formatDate(user.created_at)}</td>
                <td>
                    <div class="table-actions">
                        <a href="user-edit.php?uuid=${encodeURIComponent(user.uuid)}" class="btn btn-ghost btn-icon btn-sm" title="Editar" aria-label="Editar ${esc(user.name)}">✏️</a>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Users.openDeleteModal('${esc(user.uuid)}','${esc(user.name)}')" title="Eliminar" aria-label="Eliminar ${esc(user.name)}">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderPagination(meta) {
        if (!meta) return;
        totalPages = meta.totalPages || 1;
        const info = el('pagination-info');
        const controls = el('pagination-numbers');
        const prevBtn = el('pagination-prev');
        const nextBtn = el('pagination-next');

        if (info) {
            const start = (meta.page - 1) * meta.limit + 1;
            const end = Math.min(meta.page * meta.limit, meta.total);
            info.textContent = `Mostrando ${start}–${end} de ${meta.total} usuarios`;
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
                return `<button class="pagination-btn ${p === meta.page ? 'active' : ''}" onclick="Users.goToPage(${p})">${p}</button>`;
            }).join('');
        }
    }

    function openDeleteModal(uuid, name) {
        deleteUuid = uuid;
        const nameEl = el('delete-user-name');
        if (nameEl) nameEl.textContent = name;
        Modal.open('delete-modal');
    }

    async function handleDelete() {
        if (!deleteUuid) return;
        const btn = el('btn-confirm-delete');
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            const result = await Api.deleteUser(deleteUuid);
            if (result.success) {
                Toast.success('Usuario eliminado correctamente.');
                Modal.close('delete-modal');
                loadUsers(currentPage);
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
        loadUsers(page);
    }

    function showTableLoading() {
        const tbody = el('users-tbody');
        if (!tbody) return;
        let rows = '';
        for (let i = 0; i < 5; i++) {
            rows += `<tr><td><div class="skeleton-row"><div class="skeleton skeleton-cell" style="width:32px;height:32px;border-radius:50%"></div><div style="flex:1"><div class="skeleton skeleton-cell" style="width:60%;height:14px;margin-bottom:6px"></div><div class="skeleton skeleton-cell" style="width:40%;height:12px"></div></div></div></td><td><div class="skeleton skeleton-cell" style="width:60px;height:22px;border-radius:999px"></div></td><td><div class="skeleton skeleton-cell" style="width:60px;height:22px;border-radius:999px"></div></td><td><div class="skeleton skeleton-cell" style="width:80px;height:14px"></div></td><td><div class="skeleton skeleton-cell" style="width:60px;height:14px"></div></td></tr>`;
        }
        tbody.innerHTML = rows;
    }

    function showTableEmpty(msg) {
        const tbody = el('users-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">${esc(msg)}</div></div></td></tr>`;
    }

    function esc(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
    function getInitials(name) { if (!name) return '?'; return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
    function formatDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }); }

    return { init, loadUsers, openDeleteModal, goToPage };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('users-table')) Users.init();
});
