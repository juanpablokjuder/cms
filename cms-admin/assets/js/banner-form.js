/**
 * CMS Admin — Banner Form Handler (Crear & Editar)
 *
 * Usa el componente ImageInput para la gestión de la imagen.
 * Detecta el modo edición mediante window.BANNER_UUID.
 */

'use strict';

const BannerForm = (() => {
    /** @type {ImageInput|null} */
    let imageInput = null;

    const isEdit = () => typeof window.BANNER_UUID === 'string' && window.BANNER_UUID.length > 0;

    function el(id) { return document.getElementById(id); }

    function init() {
        const form = el('banner-form');
        if (!form) return;

        // Inicializar el componente ImageInput en su contenedor
        imageInput = new ImageInput({
            container: '#banner-image-input-mount',
            multiple: false,
        });

        if (isEdit()) loadBanner();

        form.addEventListener('submit', handleSubmit);

        // Limpiar errores al escribir
        form.querySelectorAll('.form-input, .form-select').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const err = el(input.id + '-error');
                if (err) err.textContent = '';
            });
        });
    }

    // ─── Cargar datos del banner (modo edición) ──────

    async function loadBanner() {
        try {
            const result = await Api.getBanner(window.BANNER_UUID);
            if (!result.success) return;

            const b = result.data;

            el('banner-pagina').value    = b.pagina    || '';
            el('banner-h1').value        = b.h1        || '';
            el('banner-texto1').value    = b.texto_1   || '';
            el('banner-texto2').value    = b.texto_2   || '';
            el('banner-btn-texto').value = b.btn_texto || '';
            el('banner-btn-link').value  = b.btn_link  || '';
            el('banner-orden').value     = b.orden ?? 0;

            // Cargar imagen existente en el componente
            if (b.imagen) {
                imageInput.setExistingFile({
                    url:    b.imagen,
                    nombre: '',
                    alt:    b.imagen_alt   || '',
                    title:  b.imagen_title || '',
                });
            }
        } catch (err) {
            Toast.error('No se pudo cargar el banner: ' + err.message);
        }
    }

    // ─── Envío del formulario ────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const pagina   = el('banner-pagina').value.trim();
        const h1       = el('banner-h1').value.trim();
        const texto1   = el('banner-texto1').value.trim()    || null;
        const texto2   = el('banner-texto2').value.trim()    || null;
        const btnTexto = el('banner-btn-texto').value.trim() || null;
        const btnLink  = el('banner-btn-link').value.trim()  || null;
        const orden    = parseInt(el('banner-orden').value, 10) || 0;

        // Validación de campos obligatorios
        let hasError = false;
        if (!pagina) { showError('banner-pagina', 'La página es obligatoria.'); hasError = true; }
        if (!h1)     { showError('banner-h1',     'El título es obligatorio.'); hasError = true; }
        if (hasError) return;

        const btn = el('banner-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const data = {
                pagina, h1,
                texto_1:   texto1,
                texto_2:   texto2,
                btn_texto: btnTexto,
                btn_link:  btnLink,
                orden,
            };

            // Incluir imagen solo si el usuario seleccionó una nueva
            const files   = imageInput.getFiles();
            const imgFile = files[0] ?? null;

            if (imgFile && imgFile.base64) {
                data.imagen        = imgFile.base64;
                data.imagen_nombre = imgFile.nombre || null;
                data.imagen_alt    = imgFile.alt    || null;
                data.imagen_title  = imgFile.title  || null;
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
            if (err.data?.errors) {
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

    // ─── Helpers de error ────────────────────────────

    function showError(inputId, message) {
        const input   = el(inputId);
        const errorEl = el(inputId + '-error');
        if (input)   input.classList.add('error');
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
