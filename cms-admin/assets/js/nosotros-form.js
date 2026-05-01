/**
 * CMS Admin — Nosotros Form Handler (Crear & Editar singleton)
 *
 * Flujo:
 *  1. Al cargar, consulta GET /nosotros.
 *  2. Si existe el registro → pre-rellena el formulario (modo edición).
 *  3. Si no existe         → muestra el formulario vacío (modo creación).
 *
 * Editor de texto enriquecido : Quill.js
 * Galería de imágenes         : Componente ImageInput (multiple: true)
 */
'use strict';

const NosotrosForm = (() => {

    // ── Estado ───────────────────────────────────────────────────────────────
    let isEdit = false;

    /** @type {object|null} Instancia de Quill */
    let quill = null;

    /** @type {ImageInput|null} Componente de galería */
    let imageInput = null;

    const el = (id) => document.getElementById(id);

    // ── Init ─────────────────────────────────────────────────────────────────

    async function init() {
        if (!el('nosotros-form')) return;

        initQuill();
        initImageInput();

        await loadNosotros();

        el('nosotros-form').addEventListener('submit', handleSubmit);

        // Limpiar errores al escribir
        el('nosotros-form').querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const err = el(input.id + '-error');
                if (err) err.textContent = '';
            });
        });
    }

    // ── Quill ─────────────────────────────────────────────────────────────────

    function initQuill() {
        if (typeof Quill === 'undefined') {
            console.error('NosotrosForm: Quill no está disponible.');
            return;
        }

        quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Escriba el contenido de la sección aquí...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ color: [] }, { background: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ indent: '-1' }, { indent: '+1' }],
                    [{ align: [] }],
                    ['blockquote', 'code-block'],
                    ['link'],
                    ['clean'],
                ],
            },
        });

        quill.on('text-change', () => {
            const err = el('nosotros-texto-error');
            if (err) err.textContent = '';
        });
    }

    // ── ImageInput ────────────────────────────────────────────────────────────

    function initImageInput() {
        imageInput = new ImageInput({
            container: '#nosotros-imagenes-mount',
            multiple:  true,
        });
    }

    // ── Cargar registro existente ─────────────────────────────────────────────

    async function loadNosotros() {
        const loading = el('nosotros-loading');
        const form    = el('nosotros-form');

        try {
            const result = await Api.getNosotros();

            if (result.success && result.data) {
                isEdit = true;
                const n = result.data;

                el('nosotros-titulo').value    = n.titulo    || '';
                el('nosotros-subtitulo').value = n.subtitulo || '';

                if (quill) quill.root.innerHTML = n.texto || '';

                (n.imagenes || []).forEach(img => {
                    imageInput.setExistingFile({
                        url:           img.url,
                        nombre:        img.nombre || '',
                        alt:           img.alt    || '',
                        title:         img.title  || '',
                        _archivo_uuid: img.archivo_uuid,
                    });
                });

                // Actualizar texto del botón para modo edición
                const btnText = el('nosotros-form-submit')?.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Guardar Cambios';
            } else {
                // Modo creación: sin registro existente
                isEdit = false;
                const btnText = el('nosotros-form-submit')?.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Crear Sección';
            }
        } catch (err) {
            // 404 es esperado cuando aún no existe el registro
            if (err.status === 404 || (err.data && err.data.success === false)) {
                isEdit = false;
                const btnText = el('nosotros-form-submit')?.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'Crear Sección';
            } else {
                Toast.error('No se pudo cargar la sección Nosotros: ' + err.message);
            }
        } finally {
            if (loading) loading.style.display = 'none';
            if (form)    form.style.display    = '';
        }
    }

    // ── Envío del formulario ──────────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const titulo    = el('nosotros-titulo').value.trim();
        const subtitulo = el('nosotros-subtitulo').value.trim() || null;
        const texto     = quill ? quill.root.innerHTML.trim() : '';
        const textoText = quill ? quill.getText().trim()      : '';

        let hasError = false;
        if (!titulo || titulo.length < 2) {
            showError('nosotros-titulo', 'El título debe tener al menos 2 caracteres.');
            hasError = true;
        }
        if (!textoText) {
            const err = el('nosotros-texto-error');
            if (err) err.textContent = 'El contenido es obligatorio.';
            hasError = true;
        }
        if (hasError) return;

        const btn = el('nosotros-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const imagenesPayload = buildImagenesPayload();
            const data = { titulo, subtitulo, texto, imagenes: imagenesPayload };

            let result;
            if (isEdit) {
                result = await Api.updateNosotros(data);
                if (result.success) Toast.success('Sección actualizada correctamente.');
            } else {
                result = await Api.createNosotros(data);
                if (result.success) {
                    isEdit = true;
                    Toast.success('Sección creada correctamente.');
                    const btnText = btn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = 'Guardar Cambios';
                }
            }
        } catch (err) {
            if (err.data?.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    showError('nosotros-' + field.replace('_', '-'), msgs[0]);
                });
            } else {
                Toast.error(err.data?.message || err.message);
            }
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    /**
     * Construye el payload de imágenes para la API desde el estado del componente ImageInput.
     */
    function buildImagenesPayload() {
        const files = imageInput.getFiles();

        return files.map((file, idx) => {
            const base = {
                alt:   file.alt   || null,
                title: file.title || null,
                orden: idx,
            };

            if (file.base64) {
                return { ...base, imagen: file.base64 };
            }

            return { ...base, archivo_uuid: file._archivo_uuid };
        });
    }

    // ── Helpers de error ──────────────────────────────────────────────────────

    function showError(inputId, message) {
        const input = el(inputId);
        const errEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errEl) errEl.textContent = message;
    }

    function clearErrors() {
        el('nosotros-form')?.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
        el('nosotros-form')?.querySelectorAll('.form-error').forEach(e => e.textContent = '');
        const textoErr = el('nosotros-texto-error');
        if (textoErr) textoErr.textContent = '';
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => NosotrosForm.init());
