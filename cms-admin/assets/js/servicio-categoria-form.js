/**
 * CMS Admin — Servicio Categoría Form (Crear & Editar)
 */
'use strict';

const ServicioCategoriaForm = (() => {
    const isEdit = () => typeof window.CATEGORIA_UUID === 'string' && window.CATEGORIA_UUID.length > 0;
    const el     = (id) => document.getElementById(id);

    function init() {
        if (!el('categoria-form')) return;
        if (isEdit()) loadCategoria();
        el('categoria-form').addEventListener('submit', handleSubmit);
    }

    async function loadCategoria() {
        try {
            const result = await Api.getServicioCategoria(window.CATEGORIA_UUID);
            if (!result.success) return;
            const c = result.data;
            el('cat-nombre').value = c.nombre || '';
            el('cat-orden').value  = c.orden  ?? 0;
            el('cat-estado').value = String(c.estado ?? 1);
        } catch (err) {
            Toast.error('No se pudo cargar la categoría: ' + err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const nombre = el('cat-nombre').value.trim();
        const orden  = parseInt(el('cat-orden').value, 10) || 0;
        const estado = parseInt(el('cat-estado').value, 10);

        if (!nombre || nombre.length < 2) {
            showError('cat-nombre', 'El nombre debe tener al menos 2 caracteres.');
            return;
        }

        const btn = el('cat-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const data   = { nombre, orden, estado };
            let   result;
            if (isEdit()) {
                result = await Api.updateServicioCategoria(window.CATEGORIA_UUID, data);
                if (result.success) {
                    Toast.success('Categoría actualizada correctamente.');
                    setTimeout(() => { window.location.href = 'servicios.php'; }, 1000);
                }
            } else {
                result = await Api.createServicioCategoria(data);
                if (result.success) {
                    Toast.success('Categoría creada correctamente.');
                    setTimeout(() => { window.location.href = 'servicios.php'; }, 1000);
                }
            }
        } catch (err) {
            if (err.data?.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    showError('cat-' + field, msgs[0]);
                });
            } else {
                Toast.error(err.data?.message || err.message);
            }
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    function showError(fieldId, msg) {
        const errEl = el(fieldId + '-error');
        if (errEl) errEl.textContent = msg;
        const input = el(fieldId);
        if (input) input.classList.add('error');
    }

    function clearErrors() {
        el('categoria-form')?.querySelectorAll('.form-error').forEach(e => e.textContent = '');
        el('categoria-form')?.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error'));
    }

    return { init };
})();
