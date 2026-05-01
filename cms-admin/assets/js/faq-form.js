'use strict';

const FaqForm = (() => {
    const isEdit  = () => typeof window.FAQ_UUID === 'string' && window.FAQ_UUID.length > 0;

    // ── State ──────────────────────────────────────────────────────────────
    let imageBase64      = null;
    let imageIsExisting  = false; // true when loaded from API (no re-upload needed)
    let dragSrcId        = null;

    /**
     * items: [{ id, uuid|null, pregunta, respuesta(HTML), quill, isNew }]
     */
    let items = [];

    const el = (id) => document.getElementById(id);

    // ── Init ───────────────────────────────────────────────────────────────

    function init() {
        if (!el('faq-form')) return;
        initImageUpload();
        el('btn-add-item').addEventListener('click', () => addItem());
        el('faq-form').addEventListener('submit', handleSubmit);

        el('faq-titulo')?.addEventListener('input', () => {
            el('faq-titulo').classList.remove('error');
            const e = el('faq-titulo-error'); if (e) e.textContent = '';
        });

        if (isEdit()) loadFaq();
    }

    // ── Image preview (same pattern as Banners) ────────────────────────────

    function initImageUpload() {
        const zone      = el('faq-upload-zone');
        const fileInput = el('faq-image-input');
        const removeBtn = el('faq-image-preview-remove');

        if (!zone || !fileInput) return;

        fileInput.addEventListener('change', (e) => { const f = e.target.files[0]; if (f) handleImageFile(f); });

        zone.addEventListener('dragover',  (e) => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', ()  => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault(); zone.classList.remove('dragover');
            const f = e.dataTransfer.files[0]; if (f) handleImageFile(f);
        });

        removeBtn?.addEventListener('click', (e) => { e.stopPropagation(); clearImage(); });
    }

    function handleImageFile(file) {
        const valid   = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!valid.includes(file.type)) { Toast.error('Formato no soportado.'); return; }
        if (file.size > 10 * 1024 * 1024) { Toast.error('La imagen no debe superar los 10 MB.'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            imageBase64     = e.target.result;
            imageIsExisting = false;
            showImagePreview(imageBase64, file.name, formatBytes(file.size));
        };
        reader.readAsDataURL(file);
    }

    function showImagePreview(src, name, size) {
        const zone      = el('faq-upload-zone');
        const container = el('faq-image-preview-container');
        const img       = el('faq-image-preview');
        const info      = el('faq-image-preview-info');
        if (img)       img.src          = src;
        if (info)      info.textContent = name ? `${name} · ${size}` : '';
        if (container) container.classList.add('visible');
        if (zone)      zone.classList.add('has-image');
    }

    function clearImage() {
        imageBase64     = null;
        imageIsExisting = false;
        const zone      = el('faq-upload-zone');
        const container = el('faq-image-preview-container');
        const img       = el('faq-image-preview');
        const info      = el('faq-image-preview-info');
        const fileInput = el('faq-image-input');
        if (img)       img.src          = '';
        if (info)      info.textContent = '';
        if (container) container.classList.remove('visible');
        if (zone)      zone.classList.remove('has-image');
        if (fileInput) fileInput.value  = '';
    }

    function formatBytes(b) {
        if (b < 1024) return b + ' B';
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
        return (b / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ── FAQ Items ──────────────────────────────────────────────────────────

    function addItem(data = {}) {
        const template = document.getElementById('faq-item-template');
        const clone    = template.content.cloneNode(true);
        const li       = clone.querySelector('li');
        const id       = crypto.randomUUID();

        li.dataset.id  = id;

        // Pregunta input
        const preguntaInput = li.querySelector('.faq-pregunta-input');
        if (data.pregunta) preguntaInput.value = data.pregunta;

        // Quill editor
        const quillContainer = li.querySelector('.faq-quill-editor');
        const quillInstance  = new Quill(quillContainer, {
            theme: 'snow',
            placeholder: 'Escriba la respuesta...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean'],
                ],
            },
        });
        if (data.respuesta) quillInstance.root.innerHTML = data.respuesta;

        // Clear respuesta error on typing
        quillInstance.on('text-change', () => {
            const err = li.querySelector('.faq-respuesta-error');
            if (err) err.textContent = '';
        });

        // Clear pregunta error on typing
        preguntaInput.addEventListener('input', () => {
            preguntaInput.classList.remove('error');
            const err = li.querySelector('.faq-pregunta-error');
            if (err) err.textContent = '';
            // Update preview text in header
            const preview = li.querySelector('.faq-item-preview-text');
            if (preview) preview.textContent = preguntaInput.value.slice(0, 60) || '';
        });

        // Toggle collapse
        const toggleBtn = li.querySelector('.faq-item-toggle');
        const body      = li.querySelector('.faq-item-body');
        toggleBtn.addEventListener('click', () => {
            const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', String(!expanded));
            toggleBtn.textContent = expanded ? '▸' : '▾';
            body.style.display    = expanded ? 'none' : '';
        });

        // Remove
        li.querySelector('.faq-item-remove').addEventListener('click', () => {
            items = items.filter(i => i.id !== id);
            li.remove();
            renumberItems();
            toggleEmptyState();
        });

        // Drag & drop
        li.addEventListener('dragstart', (e) => {
            dragSrcId = id;
            e.dataTransfer.effectAllowed = 'move';
            li.classList.add('dragging');
        });
        li.addEventListener('dragend', () => li.classList.remove('dragging'));
        li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('drag-over'); });
        li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
        li.addEventListener('drop', (e) => {
            e.preventDefault();
            li.classList.remove('drag-over');
            if (dragSrcId === id) return;
            const list   = el('faq-items-list');
            const srcEl  = list.querySelector(`[data-id="${dragSrcId}"]`);
            const destEl = li;
            if (!srcEl) return;
            const allLis = [...list.querySelectorAll('li.faq-item-row')];
            const srcIdx  = allLis.indexOf(srcEl);
            const destIdx = allLis.indexOf(destEl);
            if (srcIdx < destIdx) destEl.after(srcEl);
            else destEl.before(srcEl);
            // Sync items array order
            const srcItem  = items.find(i => i.id === dragSrcId);
            const destItem = items.find(i => i.id === id);
            if (srcItem && destItem) {
                const si = items.indexOf(srcItem);
                const di = items.indexOf(destItem);
                items.splice(si, 1);
                items.splice(di, 0, srcItem);
            }
            renumberItems();
        });

        const entry = {
            id,
            uuid:      data.uuid  || null,
            pregunta:  data.pregunta  || '',
            respuesta: data.respuesta || '',
            quill:     quillInstance,
            li,
        };
        items.push(entry);

        const list = el('faq-items-list');
        list.appendChild(li);
        renumberItems();
        toggleEmptyState();

        // Set initial preview text
        const preview = li.querySelector('.faq-item-preview-text');
        if (preview && data.pregunta) preview.textContent = data.pregunta.slice(0, 60);

        return entry;
    }

    function renumberItems() {
        const list = el('faq-items-list');
        if (!list) return;
        list.querySelectorAll('li.faq-item-row').forEach((li, idx) => {
            const num = li.querySelector('.faq-item-number');
            if (num) num.textContent = idx + 1;
        });
    }

    function toggleEmptyState() {
        const emptyEl = el('faq-items-empty');
        if (!emptyEl) return;
        const hasItems = el('faq-items-list').querySelectorAll('li.faq-item-row').length > 0;
        emptyEl.style.display = hasItems ? 'none' : '';
    }

    // ── Load existing FAQ ──────────────────────────────────────────────────

    async function loadFaq() {
        try {
            const result = await Api.getFaq(window.FAQ_UUID);
            if (!result.success) return;
            const f = result.data;

            el('faq-titulo').value = f.titulo || '';

            if (f.imagen) {
                imageIsExisting = true;
                imageBase64     = null;
                showImagePreview(f.imagen, null, null);
            }

            (f.items || []).forEach(item => addItem({
                uuid:      item.uuid,
                pregunta:  item.pregunta,
                respuesta: item.respuesta,
            }));

            toggleEmptyState();
        } catch (err) {
            Toast.error('No se pudo cargar la FAQ: ' + err.message);
        }
    }

    // ── Submit ─────────────────────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const titulo = el('faq-titulo').value.trim();
        let hasError = false;

        if (!titulo || titulo.length < 2) {
            showError('faq-titulo', 'El título debe tener al menos 2 caracteres.');
            hasError = true;
        }

        // Validate each item
        const list    = el('faq-items-list');
        const itemEls = [...list.querySelectorAll('li.faq-item-row')];

        itemEls.forEach((li) => {
            const pregInput  = li.querySelector('.faq-pregunta-input');
            const pregErr    = li.querySelector('.faq-pregunta-error');
            const respErr    = li.querySelector('.faq-respuesta-error');
            const id         = li.dataset.id;
            const entry      = items.find(i => i.id === id);
            if (!entry) return;

            const pregVal  = pregInput.value.trim();
            const respText = entry.quill.getText().trim();

            if (!pregVal) {
                pregInput.classList.add('error');
                if (pregErr) pregErr.textContent = 'La pregunta es obligatoria.';
                // Expand if collapsed
                const body    = li.querySelector('.faq-item-body');
                const toggle  = li.querySelector('.faq-item-toggle');
                if (body && body.style.display === 'none') {
                    body.style.display = '';
                    toggle?.setAttribute('aria-expanded', 'true');
                    if (toggle) toggle.textContent = '▾';
                }
                hasError = true;
            }
            if (!respText) {
                if (respErr) respErr.textContent = 'La respuesta es obligatoria.';
                hasError = true;
            }
        });

        if (hasError) return;

        const btn = el('faq-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            // Build items payload preserving DOM order
            const itemsPayload = itemEls.map((li, idx) => {
                const id    = li.dataset.id;
                const entry = items.find(i => i.id === id);
                const base  = {
                    pregunta:  li.querySelector('.faq-pregunta-input').value.trim(),
                    respuesta: entry.quill.root.innerHTML,
                    orden:     idx,
                };
                if (entry.uuid) base.uuid = entry.uuid;
                return base;
            });

            const data = { titulo, items: itemsPayload };
            if (imageBase64 && !imageIsExisting) {
                data.imagen       = imageBase64;
                data.imagen_alt   = el('faq-imagen-alt')?.value.trim()   || null;
                data.imagen_title = el('faq-imagen-title')?.value.trim() || null;
            }

            let result;
            if (isEdit()) {
                result = await Api.updateFaq(window.FAQ_UUID, data);
                if (result.success) { Toast.success('FAQ actualizada correctamente.'); setTimeout(() => { window.location.href = 'faqs.php'; }, 1000); }
            } else {
                result = await Api.createFaq(data);
                if (result.success) { Toast.success('FAQ creada correctamente.'); setTimeout(() => { window.location.href = 'faqs.php'; }, 1000); }
            }
        } catch (err) {
            if (err.data?.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => showError('faq-' + field, msgs[0]));
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
        const errEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errEl) errEl.textContent = message;
    }

    function clearErrors() {
        el('faq-form')?.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
        el('faq-form')?.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => FaqForm.init());
