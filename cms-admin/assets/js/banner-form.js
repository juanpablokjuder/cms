/**
 * CMS Admin — Banner Form Handler (Create & Edit)
 * 
 * Handles image upload with FileReader → base64 + live preview.
 * Detects mode by checking if `window.BANNER_UUID` is set.
 */

'use strict';

const BannerForm = (() => {
    let imageBase64 = null; // Stores the data URI for submission
    let currentImageUrl = null; // Existing image URL (edit mode)

    const isEdit = () => typeof window.BANNER_UUID === 'string' && window.BANNER_UUID.length > 0;

    function el(id) { return document.getElementById(id); }

    function init() {
        const form = el('banner-form');
        if (!form) return;

        initImageUpload();

        if (isEdit()) loadBanner();

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

    // ─── Image Upload & Preview ──────────────────────
    function initImageUpload() {
        const zone = el('upload-zone');
        const fileInput = el('banner-image-input');
        const previewContainer = el('image-preview-container');
        const previewImg = el('image-preview');
        const removeBtn = el('image-preview-remove');
        const previewInfo = el('image-preview-info');

        if (!zone || !fileInput) return;

        // File selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
        });

        // Drag & drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        });

        // Remove image
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearImage();
            });
        }
    }

    function handleFile(file) {
        // Validate type
        const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            Toast.error('Formato no soportado. Use: PNG, JPG, WebP, GIF o SVG.');
            return;
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            Toast.error('La imagen no debe superar los 10 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imageBase64 = e.target.result; // data:image/...;base64,...
            showPreview(imageBase64, file.name, formatFileSize(file.size));
        };
        reader.readAsDataURL(file);
    }

    function showPreview(src, fileName, fileSize) {
        const zone = el('upload-zone');
        const container = el('image-preview-container');
        const img = el('image-preview');
        const info = el('image-preview-info');

        if (img) img.src = src;
        if (info && fileName) info.textContent = `${fileName} · ${fileSize}`;
        else if (info) info.textContent = '';
        if (container) container.classList.add('visible');
        if (zone) zone.classList.add('has-image');
    }

    function clearImage() {
        imageBase64 = null;
        currentImageUrl = null;

        const zone = el('upload-zone');
        const container = el('image-preview-container');
        const img = el('image-preview');
        const fileInput = el('banner-image-input');
        const info = el('image-preview-info');

        if (img) img.src = '';
        if (info) info.textContent = '';
        if (container) container.classList.remove('visible');
        if (zone) zone.classList.remove('has-image');
        if (fileInput) fileInput.value = '';
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ─── Load Existing Banner ────────────────────────
    async function loadBanner() {
        try {
            const result = await Api.getBanner(window.BANNER_UUID);
            if (result.success) {
                const b = result.data;
                el('banner-pagina').value = b.pagina || '';
                el('banner-h1').value = b.h1 || '';
                el('banner-texto1').value = b.texto_1 || '';
                el('banner-texto2').value = b.texto_2 || '';
                el('banner-btn-texto').value = b.btn_texto || '';
                el('banner-btn-link').value = b.btn_link || '';
                el('banner-orden').value = b.orden ?? 0;
                el('banner-imagen-alt').value = '';
                el('banner-imagen-title').value = '';

                // Show existing image
                if (b.imagen) {
                    currentImageUrl = b.imagen;
                    showPreview(b.imagen, null, null);
                }
            }
        } catch (err) {
            Toast.error('No se pudo cargar el banner: ' + err.message);
        }
    }

    // ─── Submit ──────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const pagina = el('banner-pagina').value.trim();
        const h1 = el('banner-h1').value.trim();
        const texto1 = el('banner-texto1').value.trim() || null;
        const texto2 = el('banner-texto2').value.trim() || null;
        const btnTexto = el('banner-btn-texto').value.trim() || null;
        const btnLink = el('banner-btn-link').value.trim() || null;
        const orden = parseInt(el('banner-orden').value, 10) || 0;
        const imagenAlt = el('banner-imagen-alt').value.trim() || null;
        const imagenTitle = el('banner-imagen-title').value.trim() || null;

        // Validate
        let hasError = false;
        if (!pagina) { showError('banner-pagina', 'La página es obligatoria.'); hasError = true; }
        if (!h1) { showError('banner-h1', 'El título es obligatorio.'); hasError = true; }
        if (hasError) return;

        const btn = el('banner-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const data = { pagina, h1, texto_1: texto1, texto_2: texto2, btn_texto: btnTexto, btn_link: btnLink, orden };

            // Include image if a new one was selected
            if (imageBase64) {
                data.imagen = imageBase64;
                if (imagenAlt) data.imagen_alt = imagenAlt;
                if (imagenTitle) data.imagen_title = imagenTitle;
            }

            let result;
            if (isEdit()) {
                result = await Api.updateBanner(window.BANNER_UUID, data);
                if (result.success) {
                    Toast.success('Banner actualizado correctamente.');
                    setTimeout(() => { window.location.href = 'banners.php'; }, 1000);
                }
            } else {
                result = await Api.createBanner(data);
                if (result.success) {
                    Toast.success('Banner creado correctamente.');
                    setTimeout(() => { window.location.href = 'banners.php'; }, 1000);
                }
            }
        } catch (err) {
            if (err.data && err.data.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    const mappedId = 'banner-' + field.replace('_', '-');
                    showError(mappedId, msgs[0]);
                });
            } else {
                Toast.error(err.data?.message || err.message);
            }
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    // ─── Error helpers ───────────────────────────────
    function showError(inputId, message) {
        const input = el(inputId);
        const errorEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearErrors() {
        const form = el('banner-form');
        if (!form) return;
        form.querySelectorAll('.form-input, .form-select').forEach(i => i.classList.remove('error'));
        form.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => BannerForm.init());
