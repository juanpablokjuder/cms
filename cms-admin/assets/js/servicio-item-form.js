/**
 * CMS Admin — Servicio Item Form (Crear & Editar)
 *
 * Editor de texto enriquecido : Quill.js
 * Galería de imágenes         : Componente ImageInput (multiple: true)
 * Detección de modo edición   : window.ITEM_UUID
 */
'use strict';

const ServicioItemForm = (() => {
    const isEdit = () => typeof window.ITEM_UUID === 'string' && window.ITEM_UUID.length > 0;

    let quill      = null;
    let imageInput = null;

    const el = (id) => document.getElementById(id);

    // ── Init ─────────────────────────────────────────────────────────────

    async function init() {
        if (!el('item-form')) return;

        initQuill();
        initImageInput();
        await loadSelectOptions();

        if (isEdit()) loadItem();

        el('item-form').addEventListener('submit', handleSubmit);

        el('item-form').querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const err = el(input.id + '-error');
                if (err) err.textContent = '';
            });
        });
    }

    // ── Quill ─────────────────────────────────────────────────────────────

    function initQuill() {
        if (typeof Quill === 'undefined') {
            console.error('ServicioItemForm: Quill no está disponible.');
            return;
        }
        quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Escriba la descripción del servicio...',
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
    }

    // ── ImageInput ────────────────────────────────────────────────────────

    function initImageInput() {
        imageInput = new ImageInput({
            container: '#item-imagenes-mount',
            multiple:  true,
        });
    }

    // ── Selects dinámicos ─────────────────────────────────────────────────

    async function loadSelectOptions() {
        try {
            const [monedas, categorias] = await Promise.all([
                Api.getMonedas(),
                Api.getServicioCategorias(1, 100),
            ]);

            if (monedas.success) {
                const sel = el('item-moneda');
                monedas.data.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value       = m.uuid;
                    opt.textContent = `${m.codigo} — ${m.nombre}`;
                    sel.appendChild(opt);
                });
            }

            if (categorias.success) {
                const sel = el('item-categoria');
                categorias.data.data.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value       = c.uuid;
                    opt.textContent = c.nombre;
                    sel.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Error cargando opciones:', err);
        }
    }

    // ── Cargar item existente (modo edición) ──────────────────────────────

    async function loadItem() {
        try {
            const result = await Api.getServicioItem(window.ITEM_UUID);
            if (!result.success) return;
            const it = result.data;

            el('item-titulo').value     = it.titulo      || '';
            el('item-subtitulo1').value = it.subtitulo_1 || '';
            el('item-subtitulo2').value = it.subtitulo_2 || '';
            el('item-precio').value     = it.precio      ?? '';
            el('item-btn-titulo').value = it.btn_titulo  || '';
            el('item-btn-link').value   = it.btn_link    || '';

            if (quill) quill.root.innerHTML = it.texto || '';

            if (it.moneda?.uuid)        el('item-moneda').value    = it.moneda.uuid;
            if (it.categoria_uuid)      el('item-categoria').value = it.categoria_uuid;
            if (it.estado)              el('item-estado').value    = it.estado;

            (it.imagenes || []).forEach(img => {
                imageInput.setExistingFile({
                    url:           img.url,
                    nombre:        img.nombre || '',
                    alt:           img.alt    || '',
                    title:         img.title  || '',
                    _archivo_uuid: img.archivo_uuid,
                });
            });
        } catch (err) {
            Toast.error('No se pudo cargar el item: ' + err.message);
        }
    }

    // ── Envío del formulario ──────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const titulo     = el('item-titulo').value.trim();
        const subtitulo1 = el('item-subtitulo1').value.trim() || null;
        const subtitulo2 = el('item-subtitulo2').value.trim() || null;
        const precioRaw  = el('item-precio').value.trim();
        const precio     = precioRaw !== '' ? parseFloat(precioRaw) : null;
        const moneda     = el('item-moneda').value   || null;
        const categoria  = el('item-categoria').value || null;
        const estado     = el('item-estado').value;
        const btnTitulo  = el('item-btn-titulo').value.trim() || null;
        const btnLink    = el('item-btn-link').value.trim()   || null;
        const texto      = quill ? quill.root.innerHTML.trim() : null;

        let hasError = false;
        if (!titulo || titulo.length < 2) {
            showError('item-titulo', 'El título debe tener al menos 2 caracteres.');
            hasError = true;
        }
        if (hasError) return;

        const btn = el('item-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const imagenesPayload = buildImagenesPayload();
            const data = {
                titulo,
                subtitulo_1:   subtitulo1,
                subtitulo_2:   subtitulo2,
                precio,
                moneda_uuid:   moneda,
                categoria_uuid: categoria,
                estado,
                btn_titulo:    btnTitulo,
                btn_link:      btnLink,
                texto,
            };
            if (imagenesPayload !== null) data.imagenes = imagenesPayload;

            let result;
            if (isEdit()) {
                result = await Api.updateServicioItem(window.ITEM_UUID, data);
                if (result.success) {
                    Toast.success('Item actualizado correctamente.');
                    setTimeout(() => { window.location.href = 'servicios.php'; }, 1000);
                }
            } else {
                result = await Api.createServicioItem(data);
                if (result.success) {
                    Toast.success('Item creado correctamente.');
                    setTimeout(() => { window.location.href = 'servicios.php'; }, 1000);
                }
            }
        } catch (err) {
            if (err.data?.errors) {
                Object.entries(err.data.errors).forEach(([field, msgs]) => {
                    showError('item-' + field.replace(/_/g, '-'), msgs[0]);
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
     * Construye el payload de imágenes para la API.
     * - Nueva imagen     → { imagen: 'data:...', alt, title, orden }
     * - Imagen existente → { archivo_uuid: '...', alt, title, orden }
     * Retorna null si no hubo cambios (solo para update).
     */
    function buildImagenesPayload() {
        if (!imageInput) return isEdit() ? null : [];
        const files = imageInput.getFiles();
        if (!files.length) return isEdit() ? null : [];

        return files.map((f, index) => {
            if (f._archivo_uuid && !f._isDirty) {
                return { archivo_uuid: f._archivo_uuid, alt: f.alt || null, title: f.title || null, orden: index };
            }
            return { imagen: f.dataUri, alt: f.alt || null, title: f.title || null, orden: index };
        });
    }

    function showError(fieldId, msg) {
        const errEl = el(fieldId + '-error');
        if (errEl) errEl.textContent = msg;
        const input = el(fieldId);
        if (input) input.classList.add('error');
    }

    function clearErrors() {
        el('item-form')?.querySelectorAll('.form-error').forEach(e => e.textContent = '');
        el('item-form')?.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error'));
    }

    function slugify(str) {
        return str.toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-');
    }

    return { init };
})();
