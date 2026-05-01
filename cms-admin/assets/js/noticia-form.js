/**
 * CMS Admin — Noticia Form Handler (Crear & Editar)
 *
 * Editor de texto enriquecido : Quill.js (cargado en <head> para garantizar
 *                                su disponibilidad antes de DOMContentLoaded)
 * Galería de imágenes         : Componente ImageInput (multiple: true)
 * Detección de modo edición   : window.NOTICIA_UUID
 */
'use strict';

const NoticiaForm = (() => {

    // ── Estado ───────────────────────────────────────────────────────────────
    const isEdit = () => typeof window.NOTICIA_UUID === 'string' && window.NOTICIA_UUID.length > 0;

    /** @type {object|null} Instancia de Quill */
    let quill = null;

    /** @type {ImageInput|null} Componente de galería */
    let imageInput = null;

    const el = (id) => document.getElementById(id);

    // ── Init ─────────────────────────────────────────────────────────────────

    function init() {
        if (!el('noticia-form')) return;

        initQuill();
        initImageInput();

        if (isEdit()) loadNoticia();

        el('noticia-form').addEventListener('submit', handleSubmit);

        // Auto-generar slug desde el título (solo en modo creación)
        if (!isEdit()) {
            el('noticia-titulo')?.addEventListener('input', () => {
                const slugEl = el('noticia-slug');
                if (slugEl && slugEl.dataset.touched !== 'true') {
                    slugEl.value = slugify(el('noticia-titulo').value);
                }
            });
            el('noticia-slug')?.addEventListener('input', (e) => {
                e.target.dataset.touched = e.target.value !== '' ? 'true' : '';
            });
        }

        // Limpiar errores al escribir
        el('noticia-form').querySelectorAll('.form-input').forEach(input => {
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
            console.error('NoticiaForm: Quill no está disponible. Verifique que el script se carga en <head>.');
            return;
        }

        quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Escriba el contenido de la noticia aquí...',
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
            const err = el('noticia-texto-error');
            if (err) err.textContent = '';
        });
    }

    // ── ImageInput ────────────────────────────────────────────────────────────

    function initImageInput() {
        imageInput = new ImageInput({
            container: '#noticia-imagenes-mount',
            multiple:  true,
        });
    }

    // ── Cargar noticia existente (modo edición) ───────────────────────────────

    async function loadNoticia() {
        try {
            const result = await Api.getNoticia(window.NOTICIA_UUID);
            if (!result.success) return;

            const n = result.data;

            el('noticia-titulo').value    = n.titulo    || '';
            el('noticia-subtitulo').value = n.subtitulo || '';
            el('noticia-slug').value      = n.slug      || '';

            if (quill) quill.root.innerHTML = n.texto || '';

            // Cargar imágenes existentes en el componente
            (n.imagenes || []).forEach(img => {
                imageInput.setExistingFile({
                    url:           img.url,
                    nombre:        img.nombre || '',
                    alt:           img.alt    || '',
                    title:         img.title  || '',
                    _archivo_uuid: img.archivo_uuid,
                });
            });
        } catch (err) {
            Toast.error('No se pudo cargar la noticia: ' + err.message);
        }
    }

    // ── Envío del formulario ──────────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const titulo    = el('noticia-titulo').value.trim();
        const subtitulo = el('noticia-subtitulo').value.trim() || null;
        const slugVal   = el('noticia-slug').value.trim()      || undefined;
        const texto     = quill ? quill.root.innerHTML.trim() : '';
        const textoText = quill ? quill.getText().trim()      : '';

        let hasError = false;
        if (!titulo || titulo.length < 2) {
            showError('noticia-titulo', 'El título debe tener al menos 2 caracteres.');
            hasError = true;
        }
        if (!textoText) {
            const err = el('noticia-texto-error');
            if (err) err.textContent = 'El contenido es obligatorio.';
            hasError = true;
        }
        if (hasError) return;

        const btn = el('noticia-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const imagenesPayload = buildImagenesPayload();

            const data = { titulo, subtitulo, texto };
            if (slugVal)                  data.slug     = slugVal;
            if (imagenesPayload !== null) data.imagenes = imagenesPayload;

            let result;
            if (isEdit()) {
                result = await Api.updateNoticia(window.NOTICIA_UUID, data);
                if (result.success) {
                    Toast.success('Noticia actualizada correctamente.');
                    setTimeout(() => { window.location.href = 'noticias.php'; }, 1000);
                }
            } else {
                result = await Api.createNoticia(data);
                if (result.success) {
                    Toast.success('Noticia creada correctamente.');
                    setTimeout(() => { window.location.href = 'noticias.php'; }, 1000);
                }
            }
        } catch (err) {
            if (err.data?.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    showError('noticia-' + field.replace('_', '-'), msgs[0]);
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
     * Construye el payload de imágenes para la API a partir del estado del componente ImageInput.
     *
     * Cada entrada puede ser:
     *  - Nueva imagen     → { imagen: 'data:...', alt, title, orden }
     *  - Imagen existente → { archivo_uuid: '...', alt, title, orden }
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

            // Imagen existente — _archivo_uuid se inyectó en setExistingFile
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
        el('noticia-form')?.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
        el('noticia-form')?.querySelectorAll('.form-error').forEach(e => e.textContent = '');
        const textoErr = el('noticia-texto-error');
        if (textoErr) textoErr.textContent = '';
    }

    function slugify(text) {
        return (text || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/-{2,}/g, '-')
            .replace(/^-|-$/g, '');
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => NoticiaForm.init());
