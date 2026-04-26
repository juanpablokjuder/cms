/**
 * CMS Admin — User Form Handler (Create & Edit)
 * 
 * Shared logic for user-create.php and user-edit.php.
 * Detects mode by checking if `window.USER_UUID` is set.
 */

'use strict';

const UserForm = (() => {
    const isEdit = () => typeof window.USER_UUID === 'string' && window.USER_UUID.length > 0;

    function el(id) { return document.getElementById(id); }

    function init() {
        const form = el('user-form');
        if (!form) return;

        if (isEdit()) loadUser();

        form.addEventListener('submit', handleSubmit);

        // Clear errors on input
        form.querySelectorAll('.form-input, .form-select').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const err = el(input.id + '-error');
                if (err) err.textContent = '';
            });
        });
    }

    async function loadUser() {
        try {
            const result = await Api.getUser(window.USER_UUID);
            if (result.success) {
                const u = result.data;
                el('user-name').value = u.name || '';
                el('user-email').value = u.email || '';
                el('user-role').value = u.role || 'viewer';
                el('user-active').value = u.is_active ? '1' : '0';
                el('user-password').required = false;
            }
        } catch (err) {
            Toast.error('No se pudo cargar el usuario: ' + err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const name = el('user-name').value.trim();
        const email = el('user-email').value.trim();
        const password = el('user-password').value;
        const role = el('user-role').value;
        const isActive = el('user-active')?.value;

        // Validate
        let hasError = false;
        if (!name || name.length < 2) { showError('user-name', 'Mínimo 2 caracteres.'); hasError = true; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('user-email', 'Correo electrónico inválido.'); hasError = true; }
        if (!isEdit() && !password) { showError('user-password', 'La contraseña es obligatoria.'); hasError = true; }
        if (password && password.length < 8) { showError('user-password', 'Mínimo 8 caracteres.'); hasError = true; }
        if (hasError) return;

        const btn = el('user-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            let result;
            if (isEdit()) {
                const data = { name, email, role, is_active: isActive === '1' };
                if (password) data.password = password;
                result = await Api.updateUser(window.USER_UUID, data);
                if (result.success) {
                    Toast.success('Usuario actualizado correctamente.');
                    setTimeout(() => { window.location.href = 'users.php'; }, 1000);
                }
            } else {
                result = await Api.createUser({ name, email, password, role });
                if (result.success) {
                    Toast.success('Usuario creado correctamente.');
                    setTimeout(() => { window.location.href = 'users.php'; }, 1000);
                }
            }
        } catch (err) {
            if (err.data && err.data.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    showError('user-' + field, msgs[0]);
                });
            } else {
                Toast.error(err.data?.message || err.message);
            }
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    function showError(inputId, message) {
        const input = el(inputId);
        const errorEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearErrors() {
        const form = el('user-form');
        if (!form) return;
        form.querySelectorAll('.form-input, .form-select').forEach(i => i.classList.remove('error'));
        form.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => UserForm.init());
