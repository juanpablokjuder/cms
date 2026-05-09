/**
 * CMS Admin — Local Form Handler (Crear & Editar)
 *
 * Editor de texto enriquecido : Quill.js
 * Galería de imágenes         : Componente ImageInput (multiple: true)
 * SEO                         : Componente SeoAccordion
 * Horario de atención         : Componente HorarioInput (inline)
 * Detección de modo edición   : window.LOCAL_UUID
 */
'use strict';

// ─── HorarioInput ─────────────────────────────────────────────────────────────

class HorarioInput {
    static DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    static DEFAULTS = { apertura: '09:00', cierre: '18:00' };

    constructor(container) {
        this._root = typeof container === 'string'
            ? document.querySelector(container)
            : container;
        this._state = HorarioInput.DIAS.map(dia => ({
            dia,
            activo:   false,
            apertura: HorarioInput.DEFAULTS.apertura,
            cierre:   HorarioInput.DEFAULTS.cierre,
        }));
        this._render();
    }

    _render() {
        this._root.innerHTML = `
            <div class="horario-input">
                <div class="horario-toolbar">
                    <button type="button" class="btn-horario-action" id="horario-toggle-all">Activar todos</button>
                    <button type="button" class="btn-horario-action" id="horario-copy-first">Copiar horario a activos</button>
                </div>
                <div class="horario-grid" id="horario-grid"></div>
            </div>`;
        this._renderGrid();
        this._bindToolbar();
    }

    _renderGrid() {
        const grid = this._root.querySelector('#horario-grid');
        grid.innerHTML = '';
        this._state.forEach((item, idx) => grid.appendChild(this._buildRow(item, idx)));
    }

    _buildRow(item, idx) {
        const row = document.createElement('div');
        row.className = `horario-row ${item.activo ? 'is-active' : 'is-closed'}`;
        row.innerHTML = `
            <button type="button" class="horario-toggle ${item.activo ? 'is-on' : ''}" aria-label="Activar ${item.dia}" data-idx="${idx}">
                <span class="horario-toggle-thumb"></span>
            </button>
            <span class="horario-dia">${item.dia}</span>
            <div class="horario-times${item.activo ? '' : ' horario-times--hidden'}">
                <div class="horario-time-field">
                    <label class="horario-time-label">Abre</label>
                    <input type="time" class="horario-time-input" data-field="apertura" data-idx="${idx}" value="${item.apertura}">
                </div>
                <span class="horario-sep">—</span>
                <div class="horario-time-field">
                    <label class="horario-time-label">Cierra</label>
                    <input type="time" class="horario-time-input" data-field="cierre" data-idx="${idx}" value="${item.cierre}">
                </div>
            </div>
            <span class="horario-closed-badge${item.activo ? ' horario-closed-badge--hidden' : ''}">Cerrado</span>`;

        row.querySelector('.horario-toggle').addEventListener('click', () => {
            this._state[idx].activo = !this._state[idx].activo;
            const grid   = this._root.querySelector('#horario-grid');
            const newRow = this._buildRow(this._state[idx], idx);
            grid.replaceChild(newRow, grid.children[idx]);
            this._updateToggleAllLabel();
        });

        row.querySelectorAll('.horario-time-input').forEach(input => {
            input.addEventListener('change', e => {
                this._state[idx][e.target.dataset.field] = e.target.value;
            });
        });

        return row;
    }

    _bindToolbar() {
        this._root.querySelector('#horario-toggle-all').addEventListener('click', () => {
            const allOn = this._state.every(d => d.activo);
            this._state.forEach(d => { d.activo = !allOn; });
            this._renderGrid();
            this._updateToggleAllLabel();
        });

        this._root.querySelector('#horario-copy-first').addEventListener('click', () => {
            const first = this._state.find(d => d.activo);
            if (!first) return;
            this._state.forEach(d => {
                if (d.activo) { d.apertura = first.apertura; d.cierre = first.cierre; }
            });
            this._renderGrid();
        });
    }

    _updateToggleAllLabel() {
        const btn = this._root.querySelector('#horario-toggle-all');
        if (btn) btn.textContent = this._state.every(d => d.activo) ? 'Desactivar todos' : 'Activar todos';
    }

    populate(horarios) {
        if (!Array.isArray(horarios)) return;
        horarios.forEach(item => {
            const idx = HorarioInput.DIAS.indexOf(item.dia);
            if (idx === -1) return;
            this._state[idx] = {
                dia:      item.dia,
                activo:   !!item.activo,
                apertura: item.apertura || HorarioInput.DEFAULTS.apertura,
                cierre:   item.cierre   || HorarioInput.DEFAULTS.cierre,
            };
        });
        this._renderGrid();
    }

    getHorarios() {
        return this._state.map(({ dia, activo, apertura, cierre }) => ({
            dia,
            activo,
            apertura: activo ? (apertura || HorarioInput.DEFAULTS.apertura) : null,
            cierre:   activo ? (cierre   || HorarioInput.DEFAULTS.cierre)   : null,
        }));
    }
}

// ─── LocalForm ────────────────────────────────────────────────────────────────

const LocalForm = (() => {

    const isEdit = () => typeof window.LOCAL_UUID === 'string' && window.LOCAL_UUID.length > 0;

    /** @type {object|null} */
    let quill        = null;
    /** @type {ImageInput|null} */
    let imageInput   = null;
    /** @type {SeoAccordion|null} */
    let seoAccordion = null;
    /** @type {HorarioInput|null} */
    let horarioInput = null;

    const el = (id) => document.getElementById(id);

    // ── Init ──────────────────────────────────────────────────────────────────

    function init() {
        if (!el('local-form')) return;

        initQuill();
        initImageInput();
        initSeo();
        initHorario();

        if (isEdit()) loadLocal();

        el('local-form').addEventListener('submit', handleSubmit);

        el('local-form').querySelectorAll('.form-input').forEach(input => {
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
            console.error('LocalForm: Quill no está disponible.');
            return;
        }
        quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Escriba la descripción del local aquí...',
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
            const err = el('local-descripcion-error');
            if (err) err.textContent = '';
        });
    }

    // ── ImageInput ────────────────────────────────────────────────────────────

    function initImageInput() {
        imageInput = new ImageInput({
            container: '#local-imagenes-mount',
            multiple:  true,
        });
    }

    // ── SEO ───────────────────────────────────────────────────────────────────

    function initSeo() {
        if (typeof SeoAccordion === 'undefined') return;
        seoAccordion = new SeoAccordion({
            container:  '#seo-accordion-mount',
            namespace:  'local',
        });
    }

    // ── HorarioInput ──────────────────────────────────────────────────────────

    function initHorario() {
        const mount = document.querySelector('#local-horario-mount');
        if (!mount) return;
        horarioInput = new HorarioInput(mount);
    }

    // ── Cargar local existente (modo edición) ─────────────────────────────────

    async function loadLocal() {
        try {
            const result = await Api.getLocal(window.LOCAL_UUID);
            if (!result.success) return;

            const l = result.data;
            el('local-nombre').value    = l.nombre    || '';
            el('local-direccion').value = l.direccion || '';
            el('local-telefono').value  = l.telefono  || '';

            if (quill) quill.root.innerHTML = l.descripcion || '';

            if (horarioInput && Array.isArray(l.horarios)) {
                horarioInput.populate(l.horarios);
            }

            (l.imagenes || []).forEach(img => {
                imageInput.setExistingFile({
                    url:           img.url,
                    nombre:        img.nombre || '',
                    alt:           img.alt    || '',
                    title:         img.title  || '',
                    _archivo_uuid: img.archivo_uuid,
                });
            });

            // Cargar SEO existente
            if (seoAccordion) {
                try {
                    const seoResult = await Api.getSeo('local', window.LOCAL_UUID);
                    if (seoResult.success && seoResult.data) {
                        seoAccordion.populate(seoResult.data);
                    }
                } catch (_) { /* SEO puede no existir aún */ }
            }
        } catch (err) {
            Toast.error('No se pudo cargar el local: ' + err.message);
        }
    }

    // ── Envío del formulario ──────────────────────────────────────────────────

    async function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const nombre          = el('local-nombre').value.trim();
        const direccion       = el('local-direccion').value.trim() || null;
        const telefono        = el('local-telefono').value.trim()  || null;
        const descripcion     = quill ? quill.root.innerHTML.trim() : '';
        const descripcionText = quill ? quill.getText().trim() : '';
        const horarios        = horarioInput ? horarioInput.getHorarios() : [];

        let hasError = false;
        if (!nombre || nombre.length < 2) {
            showError('local-nombre', 'El nombre debe tener al menos 2 caracteres.');
            hasError = true;
        }
        if (!descripcionText) {
            const err = el('local-descripcion-error');
            if (err) err.textContent = 'La descripción es obligatoria.';
            hasError = true;
        }
        if (hasError) return;

        // Construir payload de imágenes
        const files   = imageInput ? imageInput.getFiles() : [];
        const imagenes = files.map((f, idx) => {
            if (f.base64) {
                return { imagen: f.base64, alt: f.alt || null, title: f.title || null, orden: idx };
            }
            return { archivo_uuid: f._archivo_uuid, alt: f.alt || null, title: f.title || null, orden: idx };
        });

        const payload = { nombre, descripcion, direccion, telefono, horarios, imagenes };

        const btn = el('local-form-submit');
        if (btn) { btn.disabled = true; btn.classList.add('loading'); }

        try {
            let result;
            if (isEdit()) {
                result = await Api.updateLocal(window.LOCAL_UUID, payload);
            } else {
                result = await Api.createLocal(payload);
            }

            if (!result.success) throw new Error(result.message || 'Error desconocido');

            const localUuid = result.data?.uuid ?? window.LOCAL_UUID;

            // Guardar SEO si tiene datos
            if (seoAccordion && localUuid) {
                const seoData = seoAccordion.collect();
                if (seoData) {
                    try { await Api.upsertSeo('local', localUuid, seoData); } catch (_) {}
                }
            }

            Toast.success(isEdit() ? 'Local actualizado correctamente.' : 'Local creado correctamente.');
            setTimeout(() => { window.location.href = 'locales.php'; }, 900);

        } catch (err) {
            handleApiErrors(err);
        } finally {
            if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function showError(fieldId, message) {
        const input = el(fieldId);
        const errEl = el(fieldId + '-error');
        if (input) input.classList.add('error');
        if (errEl) errEl.textContent = message;
    }

    function clearErrors() {
        el('local-form')?.querySelectorAll('.form-error').forEach(e => { e.textContent = ''; });
        el('local-form')?.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error'));
    }

    function handleApiErrors(err) {
        const map = {
            nombre:      'local-nombre',
            direccion:   'local-direccion',
            telefono:    'local-telefono',
            descripcion: 'local-descripcion',
        };
        if (err.data?.errors) {
            for (const [field, msgs] of Object.entries(err.data.errors)) {
                const id = map[field];
                if (id) showError(id, Array.isArray(msgs) ? msgs[0] : msgs);
            }
        }
        Toast.error(err.data?.message || err.message || 'Error al guardar el local.');
    }

    document.addEventListener('DOMContentLoaded', init);

    return {};
})();
