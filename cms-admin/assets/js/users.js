/**
 * CMS Admin — Users ABM (Alta, Baja, Modificación)
 * 
 * Handles the full user management interface:
 * - Paginated table loading
 * - Create user modal
 * - Edit user modal
 * - Delete user confirmation
 */

'use strict';

const Users = (() => {
    let currentPage = 1;
    let totalPages = 1;
    let currentLimit = 10;
    let editingUuid = null;

    // ─── DOM References ──────────────────────────────
    function el(id) { return document.getElementById(id); }

    // ─── Initialize ──────────────────────────────────
    function init() {
        loadUsers();
        bindEvents();
    }

    // ─── Event Bindings ──────────────────────────────
    function bindEvents() {
        // Create user button
        const createBtn = el('btn-create-user');
        if (createBtn) createBtn.addEventListener('click', openCreateModal);

        // User form submit
        const userForm = el('user-form');
        if (userForm) userForm.addEventListener('submit', handleUserSubmit);

        // Delete confirm button
        const confirmDeleteBtn = el('btn-confirm-delete');
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleDelete);

        // Pagination
        const prevBtn = el('pagination-prev');
        const nextBtn = el('pagination-next');
        if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    }

    // ─── Load Users ──────────────────────────────────
    async function loadUsers(page = 1) {
        currentPage = page;
        showTableLoading();

        try {
            const result = await Api.getUsers(page, currentLimit);
            if (result.success) {
                renderTable(result.data.data);
                renderPagination(result.data.meta);
                updateStats(result.data);
            }
        } catch (err) {
            showTableEmpty('Error al cargar los usuarios.');
            Toast.error(err.message);
        }
    }

    // ─── Render Table ────────────────────────────────
    function renderTable(users) {
        const tbody = el('users-tbody');
        if (!tbody) return;

        if (!users || users.length === 0) {
            showTableEmpty('No se encontraron usuarios.');
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr data-uuid="${esc(user.uuid)}">
                <td>
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                        <div class="header-avatar" style="width:32px;height:32px;font-size:0.7rem">
                            ${getInitials(user.name)}
                        </div>
                        <div>
                            <div style="font-weight:var(--font-weight-medium);color:var(--color-text-primary)">
                                ${esc(user.name)}
                            </div>
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-tertiary)">
                                ${esc(user.email)}
                            </div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-${user.role}">${esc(user.role)}</span></td>
                <td><span class="badge ${user.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${user.is_active ? 'Activo' : 'Inactivo'}
                </span></td>
                <td style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">
                    ${formatDate(user.created_at)}
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Users.openEditModal('${esc(user.uuid)}')"
                                title="Editar usuario" aria-label="Editar ${esc(user.name)}">
                            ✏️
                        </button>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick="Users.openDeleteModal('${esc(user.uuid)}', '${esc(user.name)}')"
                                title="Eliminar usuario" aria-label="Eliminar ${esc(user.name)}">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ─── Render Pagination ───────────────────────────
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
                if (i === 1 || i === totalPages || Math.abs(i - meta.page) <= 1) {
                    pages.push(i);
                } else if (pages[pages.length - 1] !== '...') {
                    pages.push('...');
                }
            }
            controls.innerHTML = pages.map(p => {
                if (p === '...') return `<span class="pagination-btn" style="cursor:default">…</span>`;
                return `<button class="pagination-btn ${p === meta.page ? 'active' : ''}"
                         onclick="Users.goToPage(${p})">${p}</button>`;
            }).join('');
        }
    }

    // ─── Update Dashboard Stats ──────────────────────
    function updateStats(data) {
        const totalEl = el('stat-total-users');
        if (totalEl && data.meta) totalEl.textContent = data.meta.total;

        if (data.data) {
            const active = data.data.filter(u => u.is_active).length;
            const activeEl = el('stat-active-users');
            if (activeEl) activeEl.textContent = active;

            const roles = {};
            data.data.forEach(u => { roles[u.role] = (roles[u.role] || 0) + 1; });
            const adminsEl = el('stat-admin-count');
            if (adminsEl) adminsEl.textContent = roles.admin || 0;
        }
    }

    // ─── Create Modal ────────────────────────────────
    function openCreateModal() {
        editingUuid = null;
        el('user-modal-title').textContent = 'Nuevo Usuario';
        el('user-form').reset();
        el('user-form-password-group').style.display = '';
        el('user-password').required = true;
        clearFormErrors();
        Modal.open('user-modal');
    }

    // ─── Edit Modal ──────────────────────────────────
    async function openEditModal(uuid) {
        editingUuid = uuid;
        el('user-modal-title').textContent = 'Editar Usuario';
        clearFormErrors();

        try {
            const result = await Api.getUser(uuid);
            if (result.success) {
                const user = result.data;
                el('user-name').value = user.name;
                el('user-email').value = user.email;
                el('user-role').value = user.role;
                el('user-active').value = user.is_active ? '1' : '0';
                el('user-password').value = '';
                el('user-password').required = false;
                el('user-form-password-group').style.display = '';
                Modal.open('user-modal');
            }
        } catch (err) {
            Toast.error(err.message);
        }
    }

    // ─── Delete Modal ────────────────────────────────
    let deleteUuid = null;

    function openDeleteModal(uuid, name) {
        deleteUuid = uuid;
        const nameEl = el('delete-user-name');
        if (nameEl) nameEl.textContent = name;
        Modal.open('delete-modal');
    }

    // ─── Handle Create/Edit Submit ───────────────────
    async function handleUserSubmit(e) {
        e.preventDefault();
        clearFormErrors();

        const name = el('user-name').value.trim();
        const email = el('user-email').value.trim();
        const password = el('user-password').value;
        const role = el('user-role').value;
        const isActive = el('user-active').value;

        // Validate
        let hasError = false;
        if (!name || name.length < 2) { showFormError('user-name', 'Mínimo 2 caracteres.'); hasError = true; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFormError('user-email', 'Correo electrónico inválido.'); hasError = true; }
        if (!editingUuid && !password) { showFormError('user-password', 'La contraseña es obligatoria.'); hasError = true; }
        if (password && password.length < 8) { showFormError('user-password', 'Mínimo 8 caracteres.'); hasError = true; }
        if (hasError) return;

        const submitBtn = el('user-form-submit');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            let result;
            if (editingUuid) {
                // Update
                const data = { name, email, role, is_active: isActive === '1' };
                if (password) data.password = password;
                result = await Api.updateUser(editingUuid, data);
                if (result.success) Toast.success('Usuario actualizado correctamente.');
            } else {
                // Create
                result = await Api.createUser({ name, email, password, role });
                if (result.success) Toast.success('Usuario creado correctamente.');
            }

            if (result.success) {
                Modal.close('user-modal');
                loadUsers(currentPage);
            }
        } catch (err) {
            if (err.data && err.data.errors) {
                // Field-level validation errors from API
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    showFormError('user-' + field, msgs[0]);
                });
            } else {
                Toast.error(err.data?.message || err.message);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    // ─── Handle Delete ───────────────────────────────
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

    // ─── Pagination Navigation ───────────────────────
    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        loadUsers(page);
    }

    // ─── Table States ────────────────────────────────
    function showTableLoading() {
        const tbody = el('users-tbody');
        if (!tbody) return;
        let rows = '';
        for (let i = 0; i < 5; i++) {
            rows += `<tr>
                <td><div class="skeleton-row"><div class="skeleton skeleton-cell" style="width:32px;height:32px;border-radius:50%"></div><div style="flex:1"><div class="skeleton skeleton-cell" style="width:60%;height:14px;margin-bottom:6px"></div><div class="skeleton skeleton-cell" style="width:40%;height:12px"></div></div></div></td>
                <td><div class="skeleton skeleton-cell" style="width:60px;height:22px;border-radius:999px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:60px;height:22px;border-radius:999px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:80px;height:14px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:60px;height:14px"></div></td>
            </tr>`;
        }
        tbody.innerHTML = rows;
    }

    function showTableEmpty(msg) {
        const tbody = el('users-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <div class="empty-state-title">${esc(msg)}</div>
        </div></td></tr>`;
    }

    // ─── Form Error Helpers ──────────────────────────
    function showFormError(inputId, message) {
        const input = el(inputId);
        const errorEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearFormErrors() {
        const form = el('user-form');
        if (!form) return;
        form.querySelectorAll('.form-input, .form-select').forEach(i => i.classList.remove('error'));
        form.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    }

    // ─── Utility ─────────────────────────────────────
    function esc(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    function formatDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return { init, loadUsers, openEditModal, openDeleteModal, goToPage };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('users-table')) {
        Users.init();
    }
});
