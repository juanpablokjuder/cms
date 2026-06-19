/**
 * CMS Admin — Banner Form Handler (Crear & Editar)
 *
 * Usa el componente ImageInput para la gestión de la imagen.
 * H1, Texto 1 y Texto 2 usan editores Quill (mismo patrón que el resto de secciones).
 * Detecta el modo edición mediante window.BANNER_UUID.
 */

'use strict';

/**
 * Sub-módulo: gestión de los botones del banner.
 *
 * Mantiene el array de botones en memoria, renderiza la tabla de datos y
 * gestiona el formulario de carga (agregar / eliminar). El estado se exporta
 * con getBotones() para incluirlo en el payload al guardar el banner.
 */
const BannerBotones = (() => {
    /** @type {Array<{texto:string, link:string, variante:string}>} */
    let botones = [];

    const el = (id) => document.getElementById(id);

    function init() {
        const addBtn = el('boton-add-btn');
        if (!addBtn) return; // El partial no está presente en esta página

        addBtn.addEventListener('click', handleAdd);

        // Permitir agregar con Enter desde los inputs de carga
        ['boton-texto', 'boton-link'].forEach((id) => {
            const input = el(id);
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
                });
                input.addEventListener('input', () => clearAddErrors());
            }
        });

        render();
    }

    function handleAdd() {
        clearAddErrors();

        const texto    = el('boton-texto').value.trim();
        const link     = el('boton-link').value.trim();
        const variante = el('boton-variante').value;

        let hasError = false;
        if (!texto) { setAddError('boton-texto', 'El texto es obligatorio.'); hasError = true; }
        if (!link)  { setAddError('boton-link',  'El enlace es obligatorio.'); hasError = true; }
        if (hasError) return;

        botones.push({ texto, link, variante });
        render();

        // Limpiar el formulario de carga para el próximo botón
        el('boton-texto').value = '';
        el('boton-link').value  = '';
        el('boton-variante').value = 'primary';
        el('boton-texto').focus();
    }

    function remove(index) {
        botones.splice(index, 1);
        render();
    }

    function move(index, delta) {
        const target = index + delta;
        if (target < 0 || target >= botones.length) return;
        const [item] = botones.splice(index, 1);
        botones.splice(target, 0, item);
        render();
    }

    function render() {
        const tbody = el('banner-botones-tbody');
        const empty = el('banner-botones-empty');
        if (!tbody) return;

        if (botones.length === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        tbody.innerHTML = botones.map((b, i) => {
            const variLabel = b.variante === 'outline' ? 'Contorno' : 'Primario';
            return `<tr>
                <td><span class="boton-drag-handle" title="Posición ${i + 1}">⠿</span></td>
                <td style="font-weight:var(--font-weight-medium)">${esc(b.texto)}</td>
                <td style="color:var(--color-text-secondary);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.link)}</td>
                <td><span class="boton-variante-badge ${esc(b.variante)}">${esc(variLabel)}</span></td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="btn btn-ghost btn-icon btn-sm" title="Subir" ${i === 0 ? 'disabled' : ''} onclick="BannerBotones.move(${i}, -1)">↑</button>
                        <button type="button" class="btn btn-ghost btn-icon btn-sm" title="Bajar" ${i === botones.length - 1 ? 'disabled' : ''} onclick="BannerBotones.move(${i}, 1)">↓</button>
                        <button type="button" class="btn btn-ghost btn-icon btn-sm" title="Eliminar" onclick="BannerBotones.remove(${i})">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function setAddError(inputId, msg) {
        const input = el(inputId);
        const errEl = el(inputId + '-error');
        if (input) input.classList.add('error');
        if (errEl) errEl.textContent = msg;
    }

    function clearAddErrors() {
        ['boton-texto', 'boton-link'].forEach((id) => {
            const input = el(id);
            const errEl = el(id + '-error');
            if (input) input.classList.remove('error');
            if (errEl) errEl.textContent = '';
        });
    }

    /** Reemplaza el estado completo (modo edición). */
    function setBotones(list) {
        botones = (list || []).map((b) => ({
            texto:    b.texto    || '',
            link:     b.link     || '',
            variante: b.variante === 'outline' ? 'outline' : 'primary',
        }));
        render();
    }

    /** Devuelve el array de botones con su orden actual para el payload. */
    function getBotones() {
        return botones.map((b, index) => ({
            texto:    b.texto,
            link:     b.link,
            variante: b.variante,
            orden:    index,
        }));
    }

    function esc(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

    return { init, remove, move, setBotones, getBotones };
})();

const BannerForm = (() => {
    /** @type {ImageInput|null} */
    let imageInput = null;

    /** @type {object|null} Instancias de Quill: h1, texto1, texto2 */
    let quillH1 = null;
    let quillTexto1 = null;
    let quillTexto2 = null;

    const isEdit = () => typeof window.BANNER_UUID === 'string' && window.BANNER_UUID.length > 0;

    function el(id) { return document.getElementById(id); }

    function init() {
        const form = el('banner-form');
        if (!form) return;

        initQuill();
        BannerBotones.init();

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

    // ─── Quill ────────────────────────────────────────

    function initQuill() {
        if (typeof Quill === 'undefined') {
            console.error('BannerForm: Quill no está disponible.');
            return;
        }

        const toolbarBasic = [
            ['bold', 'italic', 'underline'],
            [{ color: [] }],
            ['link'],
            ['clean'],
        ];

        quillH1 = new Quill('#banner-h1-quill', {
            theme: 'snow',
            placeholder: 'Título del banner',
            modules: { toolbar: toolbarBasic },
        });
        quillH1.on('text-change', () => {
            const err = el('banner-h1-error');
            if (err) err.textContent = '';
        });

        quillTexto1 = new Quill('#banner-texto1-quill', {
            theme: 'snow',
            placeholder: 'Primer bloque de texto (opcional)',
            modules: { toolbar: toolbarBasic },
        });

        quillTexto2 = new Quill('#banner-texto2-quill', {
            theme: 'snow',
            placeholder: 'Segundo bloque de texto (opcional)',
            modules: { toolbar: toolbarBasic },
        });
    }

    // ─── Cargar datos del banner (modo edición) ──────

    async function loadBanner() {
        try {
            const result = await Api.getBanner(window.BANNER_UUID);
            if (!result.success) return;

            const b = result.data;

            el('banner-pagina').value    = b.pagina    || '';
            if (quillH1)     quillH1.root.innerHTML     = b.h1      || '';
            if (quillTexto1) quillTexto1.root.innerHTML = b.texto_1 || '';
            if (quillTexto2) quillTexto2.root.innerHTML = b.texto_2 || '';
            el('banner-orden').value     = b.orden ?? 0;

            // Cargar los botones existentes en la tabla de datos
            BannerBotones.setBotones(b.botones || []);

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
        const h1       = quillH1     ? quillH1.root.innerHTML.trim()     : '';
        const h1Text   = quillH1     ? quillH1.getText().trim()          : '';
        const texto1   = (quillTexto1 && quillTexto1.getText().trim()) ? quillTexto1.root.innerHTML.trim() : null;
        const texto2   = (quillTexto2 && quillTexto2.getText().trim()) ? quillTexto2.root.innerHTML.trim() : null;
        const orden    = parseInt(el('banner-orden').value, 10) || 0;
        const botones  = BannerBotones.getBotones();

        // Validación de campos obligatorios
        let hasError = false;
        if (!pagina)  { showError('banner-pagina', 'La página es obligatoria.'); hasError = true; }
        if (!h1Text)  { showError('banner-h1',     'El título es obligatorio.'); hasError = true; }
        if (hasError) return;

        const btn = el('banner-form-submit');
        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const data = {
                pagina, h1,
                texto_1: texto1,
                texto_2: texto2,
                botones,
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
