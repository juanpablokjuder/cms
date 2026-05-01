/**
 * CMS Admin — Noticia Form Handler (Create & Edit)
 *
 * Rich text editor: Quill.js (open-source, cdnjs)
 * Image gallery:   HTML5 Drag & Drop reordering, multi-upload, preview
 */
'use strict';

const NoticiaForm = (() => {

    // ── State ────────────────────────────────────────────────────────────────
    const isEdit  = () => typeof window.NOTICIA_UUID === 'string' && window.NOTICIA_UUID.length > 0;
    let quill     = null;

    /**
     * Gallery items array.
     * Each entry: { id, src, alt, title, archivo_uuid|null, isNew, file|null }
     * isNew=true  → new upload (data URI)
     * isNew=false → existing archivo (archivo_uuid populated)
     */
    let gallery   = [];
    let dragSrcId = null;

    const el = (id) => document.getElementById(id);

    // ── Init ─────────────────────────────────────────────────────────────────

    function init() {
        if (!el('noticia-form')) return;
        initQuill();
        initImageUpload();
        if (isEdit()) loadNoticia();
        el('noticia-form').addEventListener('submit', handleSubmit);

        // Auto-generate slug from titulo (create only)
        if (!isEdit()) {
            el('noticia-titulo')?.addEventListener('input', () => {
                const slug = el('noticia-slug');
                if (slug && slug.dataset.touched !== 'true') {
                    slug.value = slugify(el('noticia-titulo').value);
                }
            });
            el('noticia-slug')?.addEventListener('input', (e) => {
                e.target.dataset.touched = e.target.value !== '' ? 'true' : '';
            });
        }

        // Clear errors on input
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

        // Clear error on typing
        quill.on('text-change', () => {
            const err = el('noticia-texto-error');
            if (err) err.textContent = '';
        });
    }

    // ── Image Upload & Gallery ────────────────────────────────────────────────

    function initImageUpload() {
        const zone      = el('noticia-upload-zone');
        const fileInput = el('noticia-image-input');
        if (!zone || !fileInput) return;

        fileInput.addEventListener('change', (e) => {
            handleFiles([...e.target.files]);
            fileInput.value = '';
        });

        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            handleFiles([...e.dataTransfer.files]);
        });
    }

    function handleFiles(files) {
        const valid   = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
        const maxSize = 10 * 1024 * 1024;

        files.forEach(file => {
            if (!valid.includes(file.type)) { Toast.error(`Formato no soportado: ${file.name}`); return; }
            if (file.size > maxSize)         { Toast.error(`Archivo demasiado grande: ${file.name}`); return; }

            const reader = new FileReader();
            reader.onload = (e) => {
                const item = {
                    id:           crypto.randomUUID(),
                    src:          e.target.result,
                    alt:          '',
                    title:        '',
                    archivo_uuid: null,
                    isNew:        true,
                };
                gallery.push(item);
                renderGallery();
            };
            reader.readAsDataURL(file);
        });
    }

    // ── Gallery render & drag-and-drop ────────────────────────────────────────

    function renderGallery() {
        const list = el('noticia-gallery');
        if (!list) return;
        list.innerHTML = '';

        if (gallery.length === 0) {
            list.innerHTML = '<li class="noticia-gallery-empty">Sin imágenes. Agrega una arriba.</li>';
            return;
        }

        gallery.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className          = 'noticia-gallery-item';
            li.draggable          = true;
            li.dataset.id         = item.id;
            li.setAttribute('aria-label', `Imagen ${idx + 1}`);

            li.innerHTML = `
                <span class="gallery-drag-handle" title="Arrastrar para reordenar">⠿</span>
                <img src="${esc(item.src)}" alt="${esc(item.alt || '')}" class="gallery-thumb">
                <div class="gallery-meta">
                    <input type="text" class="form-input gallery-input" placeholder="Alt" value="${esc(item.alt)}" data-field="alt" data-id="${item.id}">
                    <input type="text" class="form-input gallery-input" placeholder="Título" value="${esc(item.title)}" data-field="title" data-id="${item.id}">
                </div>
                <button type="button" class="gallery-remove" data-id="${item.id}" title="Eliminar imagen" aria-label="Eliminar imagen">✕</button>
                ${item.isNew ? '<span class="gallery-badge-new">Nuevo</span>' : ''}
            `;

            // Meta inputs
            li.querySelectorAll('.gallery-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const entry = gallery.find(g => g.id === e.target.dataset.id);
                    if (entry) entry[e.target.dataset.field] = e.target.value.trim();
                });
            });

            // Remove button
            li.querySelector('.gallery-remove').addEventListener('click', () => {
                gallery = gallery.filter(g => g.id !== item.id);
                renderGallery();
            });

            // Drag events
            li.addEventListener('dragstart', (e) => {
                dragSrcId = item.id;
                e.dataTransfer.effectAllowed = 'move';
                li.classList.add('dragging');
            });
            li.addEventListener('dragend', () => li.classList.remove('dragging'));
            li.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                li.classList.add('drag-over');
            });
            li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
            li.addEventListener('drop', (e) => {
                e.preventDefault();
                li.classList.remove('drag-over');
                if (dragSrcId === item.id) return;
                const srcIdx  = gallery.findIndex(g => g.id === dragSrcId);
                const destIdx = gallery.findIndex(g => g.id === item.id);
                if (srcIdx === -1 || destIdx === -1) return;
                const [moved] = gallery.splice(srcIdx, 1);
                gallery.splice(destIdx, 0, moved);
                renderGallery();
            });

            list.appendChild(li);
        });
    }

    // ── Load existing noticia (edit mode) ─────────────────────────────────────

    async function loadNoticia() {
        try {
            const result = await Api.getNoticia(window.NOTICIA_UUID);
            if (!result.success) return;
            const n = result.data;

            el('noticia-titulo').value    = n.titulo    || '';
            el('noticia-subtitulo').value = n.subtitulo || '';
            el('noticia-slug').value      = n.slug      || '';
            quill.root.innerHTML          = n.texto     || '';

            // Populate gallery with existing images
            gallery = (n.imagenes || []).map((img, idx) => ({
                id:           crypto.randomUUID(),
                src:          img.url,
                alt:          img.alt   || '',
                title:        img.title || '',
                archivo_uuid: img.archivo_uuid,
                isNew:        false,
            }));
            renderGallery();
        } catch (err) {
            Toast.error('No se pudo cargar la noticia: ' + err.message);
        }
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const titulo    = el('noticia-titulo').value.trim();
        const subtitulo = el('noticia-subtitulo').value.trim() || null;
        const slugVal   = el('noticia-slug').value.trim()      || undefined;
        const texto     = quill.root.innerHTML.trim();
        const textoText = quill.getText().trim();

        let hasError = false;
        if (!titulo || titulo.length < 2) { showError('noticia-titulo', 'El título debe tener al menos 2 caracteres.'); hasError = true; }
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
            // Build imagenes payload
            const imagenesPayload = await buildImagenesPayload();

            const data = { titulo, subtitulo, texto };
            if (slugVal) data.slug = slugVal;
            if (imagenesPayload !== null) data.imagenes = imagenesPayload;

            let result;
            if (isEdit()) {
                result = await Api.updateNoticia(window.NOTICIA_UUID, data);
                if (result.success) { Toast.success('Noticia actualizada correctamente.'); setTimeout(() => { window.location.href = 'noticias.php'; }, 1000); }
            } else {
                result = await Api.createNoticia(data);
                if (result.success) { Toast.success('Noticia creada correctamente.'); setTimeout(() => { window.location.href = 'noticias.php'; }, 1000); }
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
     * Converts the gallery array into the API payload format.
     * New images are kept as data URIs; existing ones reference archivo_uuid.
     * Returns null if unchanged (create mode always sends the array).
     */
    async function buildImagenesPayload() {
        return gallery.map((item, idx) => {
            const base = { alt: item.alt || null, title: item.title || null, orden: idx };
            if (item.isNew) return { ...base, imagen: item.src };
            return { ...base, archivo_uuid: item.archivo_uuid };
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function showError(inputId, message) {
        const input = el(inputId);
        const errEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errEl) errEl.textContent = message;
    }

    function clearErrors() {
        el('noticia-form')?.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
        el('noticia-form')?.querySelectorAll('.form-error').forEach(e => e.textContent = '');
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

    function esc(str) {
        if (!str && str !== 0) return '';
        const d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => NoticiaForm.init());
