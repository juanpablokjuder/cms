'use strict';

/**
 * CMS Admin — Empresa (singleton ABM)
 *
 * Comportamiento:
 *  - Al cargar: GET /empresa
 *    · Si existe → rellena el form y muestra botón Eliminar  (modo EDIT)
 *    · Si no     → muestra form vacío                        (modo CREATE)
 *  - Submit → POST (create) o PATCH (update) según estado
 *  - Delete → soft-delete + reinicio al modo CREATE
 */
const Empresa = (() => {

    let currentUuid = null; // null → modo create, string → modo edit
    const el = (id) => document.getElementById(id);

    // ── Init ──────────────────────────────────────────────────────────────

    function init() {
        if (!el('empresa-form')) return;
        loadEmpresa();
        el('empresa-form').addEventListener('submit', handleSubmit);
        el('btn-delete-empresa').addEventListener('click', openDeleteModal);
        el('btn-confirm-delete').addEventListener('click', handleDelete);

        // Clear errors on input
        ['nombre', 'telefono', 'mail', 'direccion'].forEach(field => {
            const input = el(`empresa-${field}`);
            input?.addEventListener('input', () => {
                input.classList.remove('error');
                const err = el(`empresa-${field}-error`);
                if (err) err.textContent = '';
            });
        });
    }

    // ── Load ──────────────────────────────────────────────────────────────

    async function loadEmpresa() {
        try {
            const result = await Api.getEmpresa();

            // Hide skeleton, show card
            el('empresa-loading').style.display = 'none';
            el('empresa-card').style.display    = '';

            if (result.success && result.data) {
                populateForm(result.data);
                setEditMode(result.data);
            } else {
                setCreateMode();
            }
        } catch (err) {
            el('empresa-loading').style.display = 'none';
            el('empresa-card').style.display    = '';
            Toast.error('No se pudieron cargar los datos: ' + err.message);
            setCreateMode();
        }
    }

    function populateForm(empresa) {
        el('empresa-nombre').value    = empresa.nombre    || '';
        el('empresa-telefono').value  = empresa.telefono  || '';
        el('empresa-mail').value      = empresa.mail      || '';
        el('empresa-direccion').value = empresa.direccion || '';
    }

    function setEditMode(empresa) {
        currentUuid = empresa.uuid;
        el('empresa-card-title').textContent = 'Datos registrados';
        el('empresa-status-badge').textContent = '● Activo';
        el('empresa-status-badge').className   = 'empresa-status-badge empresa-status-badge--active';
        el('empresa-form-submit').querySelector('.btn-text').textContent = 'Guardar Cambios';
        el('btn-delete-empresa').style.display = '';
        renderFooterMeta(empresa);
    }

    function setCreateMode() {
        currentUuid = null;
        el('empresa-card-title').textContent   = 'Completar información';
        el('empresa-status-badge').textContent = '● Sin configurar';
        el('empresa-status-badge').className   = 'empresa-status-badge empresa-status-badge--empty';
        el('empresa-form-submit').querySelector('.btn-text').textContent = 'Guardar';
        el('btn-delete-empresa').style.display = 'none';
        el('empresa-footer-meta').textContent  = '';
    }

    function renderFooterMeta(empresa) {
        const meta = el('empresa-footer-meta');
        if (!meta || !empresa.updated_at) return;
        const d = new Date(empresa.updated_at);
        meta.textContent = `Última actualización: ${d.toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })} ${d.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}`;
    }

    // ── Submit ────────────────────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const nombre    = el('empresa-nombre').value.trim();
        const telefono  = el('empresa-telefono').value.trim()  || null;
        const mail      = el('empresa-mail').value.trim()      || null;
        const direccion = el('empresa-direccion').value.trim() || null;

        // Client-side validation
        let hasError = false;
        if (!nombre || nombre.length < 2) {
            showError('empresa-nombre', 'El nombre debe tener al menos 2 caracteres.');
            hasError = true;
        }
        if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            showError('empresa-mail', 'Ingrese un email válido.');
            hasError = true;
        }
        if (hasError) return;

        const btn = el('empresa-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const data = { nombre, telefono, mail, direccion };
            let result;

            if (currentUuid) {
                result = await Api.updateEmpresa(currentUuid, data);
            } else {
                result = await Api.createEmpresa(data);
            }

            if (result.success) {
                Toast.success(currentUuid ? 'Datos actualizados correctamente.' : 'Empresa creada correctamente.');
                populateForm(result.data);
                setEditMode(result.data);
            }
        } catch (err) {
            if (err.data?.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    showError('empresa-' + field, msgs[0]);
                });
            } else {
                Toast.error(err.data?.message || err.message);
            }
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────

    function openDeleteModal() {
        if (!currentUuid) return;
        const nameEl = el('delete-empresa-name');
        if (nameEl) nameEl.textContent = el('empresa-nombre').value || 'esta empresa';
        Modal.open('delete-modal');
    }

    async function handleDelete() {
        if (!currentUuid) return;
        const btn = el('btn-confirm-delete');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const result = await Api.deleteEmpresa(currentUuid);
            if (result.success) {
                Toast.success('Registro eliminado correctamente.');
                Modal.close('delete-modal');
                // Reset form and switch to create mode
                el('empresa-form').reset();
                setCreateMode();
            }
        } catch (err) {
            Toast.error(err.data?.message || err.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    function showError(inputId, message) {
        const input = el(inputId);
        const errEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errEl) errEl.textContent = message;
    }

    function clearErrors() {
        el('empresa-form')?.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
        el('empresa-form')?.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Empresa.init());
