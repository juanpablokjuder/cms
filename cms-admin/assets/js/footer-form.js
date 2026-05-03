'use strict';

const FooterForm = (() => {
    const isEdit = () => typeof window.FOOTER_UUID === 'string' && window.FOOTER_UUID.length > 0;
    const el     = (id) => document.getElementById(id);

    // ── Estado ────────────────────────────────────────────────────────────────
    let columnaCount  = 3;
    // [{ index, tipo, descripcion, enlaces[], direccion, telefono, email }]
    let columns       = [];
    let redes         = [];   // [{ nombre, url, svg_icon }]
    let legales       = [];   // [{ texto, url }]
    // Quill instances keyed by column index
    const quillInstances = new Map();
    // ImageInput instances keyed by column index
    const imageInputs = new Map();

    // ── Init ──────────────────────────────────────────────────────────────────
    function init() {
        if (!el('footer-form')) return;

        // Selector de número de columnas
        document.querySelectorAll('.col-count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const count = parseInt(btn.dataset.count, 10);
                setColumnaCount(count);
            });
        });

        el('btn-add-red')?.addEventListener('click', () => addRedItem());
        el('btn-add-legal')?.addEventListener('click', () => addLegalItem());
        el('footer-form').addEventListener('submit', handleSubmit);

        // Inicializar grid con el conteo activo por defecto
        setColumnaCount(columnaCount);

        if (isEdit()) loadFooter();
    }

    // ── Columnas ──────────────────────────────────────────────────────────────
    function setColumnaCount(count) {
        columnaCount = count;

        // Actualizar botones activos
        document.querySelectorAll('.col-count-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.count, 10) === count);
        });

        // Conservar estado de columnas existentes, truncar o extender
        const prevColumns = columns.slice(0, count);
        while (prevColumns.length < count) {
            prevColumns.push(createColumnState(prevColumns.length));
        }
        columns = prevColumns;

        renderColumnsGrid();
    }

    function createColumnState(index) {
        return { index, tipo: 'media_texto', descripcion: null, enlaces: [], direccion: null, telefono: null, email: null };
    }

    function renderColumnsGrid() {
        const grid = el('footer-columns-grid');
        if (!grid) return;

        // Destruir instancias Quill antes de limpiar el DOM
        quillInstances.forEach(q => q.disable());
        quillInstances.clear();
        imageInputs.clear();

        grid.innerHTML = '';

        columns.forEach((col, i) => {
            const tpl   = document.getElementById('tpl-column-panel');
            const clone = tpl.content.cloneNode(true);
            const panel = clone.querySelector('.footer-col-panel');

            panel.dataset.index = i;
            panel.querySelector('.footer-col-number').textContent = `Columna ${i + 1}`;

            const select = panel.querySelector('.footer-col-type-select');
            select.value = col.tipo;
            select.addEventListener('change', () => {
                columns[i].tipo = select.value;
                renderBlockBody(panel.querySelector('.footer-col-panel-body'), i);
            });

            grid.appendChild(clone);

            const body = grid.querySelector(`.footer-col-panel[data-index="${i}"] .footer-col-panel-body`);
            renderBlockBody(body, i);
        });
    }

    function renderBlockBody(body, index) {
        if (!body) return;
        body.innerHTML = '';
        const col = columns[index];

        if (col.tipo === 'media_texto') {
            const tpl   = document.getElementById('tpl-block-media-texto');
            const clone = tpl.content.cloneNode(true);
            const block = clone.querySelector('.footer-block-media-texto');

            // Montar primero en el DOM para que ImageInput encuentre el contenedor
            body.appendChild(block);
            const mountEl = body.querySelector('.footer-logo-mount');

            const imgInput = new ImageInput({ container: mountEl, multiple: false });
            imageInputs.set(index, imgInput);

            const quillContainer = body.querySelector('.footer-descripcion-quill');
            const quill = new Quill(quillContainer, {
                theme: 'snow',
                placeholder: 'Breve descripción...',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link'],
                        ['clean'],
                    ],
                },
            });
            if (col.descripcion) quill.root.innerHTML = col.descripcion;
            quill.on('text-change', () => {
                columns[index].descripcion = quill.getText().trim() ? quill.root.innerHTML : null;
            });
            quillInstances.set(index, quill);
        } else if (col.tipo === 'lista_enlaces') {
            const tpl   = document.getElementById('tpl-block-lista-enlaces');
            const clone = tpl.content.cloneNode(true);
            const block = clone.querySelector('.footer-block-lista-enlaces');
            const list  = block.querySelector('.footer-enlaces-list');
            const addBtn = block.querySelector('.footer-add-enlace-btn');

            // Renderizar enlaces existentes
            col.enlaces.forEach((enlace, ei) => addEnlaceRow(list, index, ei, enlace.texto, enlace.url));

            addBtn.addEventListener('click', () => {
                const ei = columns[index].enlaces.length;
                columns[index].enlaces.push({ texto: '', url: '' });
                addEnlaceRow(list, index, ei);
            });

            body.appendChild(block);
        } else {
            // contacto
            const tpl   = document.getElementById('tpl-block-contacto');
            const clone = tpl.content.cloneNode(true);
            const block = clone.querySelector('.footer-block-contacto');

            const dirInput   = block.querySelector('.footer-dir-input');
            const telInput   = block.querySelector('.footer-tel-input');
            const emailInput = block.querySelector('.footer-email-input');

            if (col.direccion) dirInput.value   = col.direccion;
            if (col.telefono)  telInput.value   = col.telefono;
            if (col.email)     emailInput.value = col.email;

            dirInput.addEventListener('input',   () => { columns[index].direccion = dirInput.value   || null; });
            telInput.addEventListener('input',   () => { columns[index].telefono  = telInput.value   || null; });
            emailInput.addEventListener('input', () => { columns[index].email     = emailInput.value || null; });

            body.appendChild(block);
        }
    }

    function addEnlaceRow(list, colIndex, enlaceIndex, texto = '', url = '') {
        const tpl   = document.getElementById('tpl-enlace-item');
        const clone = tpl.content.cloneNode(true);
        const li    = clone.querySelector('.footer-enlace-item');

        const textoInput = li.querySelector('.footer-enlace-texto');
        const urlInput   = li.querySelector('.footer-enlace-url');
        const removeBtn  = li.querySelector('.footer-enlace-remove');

        textoInput.value = texto;
        urlInput.value   = url;

        textoInput.addEventListener('input', () => {
            if (columns[colIndex].enlaces[enlaceIndex]) columns[colIndex].enlaces[enlaceIndex].texto = textoInput.value;
        });
        urlInput.addEventListener('input', () => {
            if (columns[colIndex].enlaces[enlaceIndex]) columns[colIndex].enlaces[enlaceIndex].url = urlInput.value;
        });

        removeBtn.addEventListener('click', () => {
            columns[colIndex].enlaces.splice(enlaceIndex, 1);
            li.remove();
            // Re-sync índices
            renderColumnsGrid();
        });

        list.appendChild(li);
    }

    // ── Redes Sociales ────────────────────────────────────────────────────────
    function addRedItem(data = {}) {
        const list     = el('redes-list');
        const emptyLi  = el('redes-empty');
        if (emptyLi) emptyLi.style.display = 'none';

        const tpl   = document.getElementById('tpl-red-item');
        const clone = tpl.content.cloneNode(true);
        const li    = clone.querySelector('.footer-red-item');

        const nombreInput = li.querySelector('.footer-red-nombre');
        const urlInput    = li.querySelector('.footer-red-url');
        const svgInput    = li.querySelector('.footer-red-svg');
        const svgPreview  = li.querySelector('.footer-red-svg-preview');
        const removeBtn   = li.querySelector('.footer-red-remove');

        if (data.nombre)   nombreInput.value = data.nombre;
        if (data.url)      urlInput.value    = data.url;
        if (data.svg_icon) {
            svgInput.value        = data.svg_icon;
            svgPreview.innerHTML  = data.svg_icon;
        }

        const redIndex = redes.length;
        redes.push({ nombre: data.nombre ?? '', url: data.url ?? '', svg_icon: data.svg_icon ?? '' });

        nombreInput.addEventListener('input', () => { if (redes[redIndex]) redes[redIndex].nombre   = nombreInput.value; });
        urlInput.addEventListener('input',    () => { if (redes[redIndex]) redes[redIndex].url      = urlInput.value; });
        svgInput.addEventListener('input',    () => {
            if (redes[redIndex]) redes[redIndex].svg_icon = svgInput.value;
            svgPreview.innerHTML = svgInput.value;
        });

        removeBtn.addEventListener('click', () => {
            redes.splice(redIndex, 1);
            li.remove();
            if (!el('redes-list')?.querySelector('.footer-red-item')) {
                const empty = el('redes-empty'); if (empty) empty.style.display = '';
            }
        });

        list.appendChild(li);
    }

    // ── Legales ───────────────────────────────────────────────────────────────
    function addLegalItem(data = {}) {
        const list    = el('legales-list');
        const emptyLi = el('legales-empty');
        if (emptyLi) emptyLi.style.display = 'none';

        const tpl   = document.getElementById('tpl-enlace-item');
        const clone = tpl.content.cloneNode(true);
        const li    = clone.querySelector('.footer-enlace-item');

        const textoInput = li.querySelector('.footer-enlace-texto');
        const urlInput   = li.querySelector('.footer-enlace-url');
        const removeBtn  = li.querySelector('.footer-enlace-remove');

        textoInput.placeholder = 'Texto del enlace legal';
        urlInput.placeholder   = 'URL o /ruta';

        if (data.texto) textoInput.value = data.texto;
        if (data.url)   urlInput.value   = data.url;

        const legalIndex = legales.length;
        legales.push({ texto: data.texto ?? '', url: data.url ?? '' });

        textoInput.addEventListener('input', () => { if (legales[legalIndex]) legales[legalIndex].texto = textoInput.value; });
        urlInput.addEventListener('input',   () => { if (legales[legalIndex]) legales[legalIndex].url   = urlInput.value; });

        removeBtn.addEventListener('click', () => {
            legales.splice(legalIndex, 1);
            li.remove();
            if (!el('legales-list')?.querySelector('.footer-enlace-item')) {
                const empty = el('legales-empty'); if (empty) empty.style.display = '';
            }
        });

        list.appendChild(li);
    }

    // ── Load (modo edición) ───────────────────────────────────────────────────
    async function loadFooter() {
        const btn = el('footer-form-submit');
        if (btn) { btn.disabled = true; }
        try {
            const result = await Api.getFooter(window.FOOTER_UUID);
            if (!result.success) return;
            const footer = result.data;

            // Copyright
            const copyrightInput = el('footer-copyright');
            if (copyrightInput && footer.copyright_text) copyrightInput.value = footer.copyright_text;

            // Columnas
            const count = footer.columnas_count ?? footer.columnas?.length ?? 3;
            columns = (footer.columnas ?? []).map((col, i) => {
                const state = createColumnState(i);
                state.tipo  = col.tipo;

                if (col.tipo === 'media_texto') {
                    state.descripcion  = col.data?.descripcion ?? null;
                } else if (col.tipo === 'lista_enlaces') {
                    state.enlaces = (col.data?.enlaces ?? []).map(e => ({ texto: e.texto, url: e.url }));
                } else if (col.tipo === 'contacto') {
                    state.direccion = col.data?.direccion ?? null;
                    state.telefono  = col.data?.telefono  ?? null;
                    state.email     = col.data?.email     ?? null;
                }
                return state;
            });

            // Ajustar el conteo de columnas
            columnaCount = count;
            document.querySelectorAll('.col-count-btn').forEach(b => {
                b.classList.toggle('active', parseInt(b.dataset.count, 10) === count);
            });
            renderColumnsGrid();

            // Cargar imágenes existentes en los ImageInputs
            (footer.columnas ?? []).forEach((col, i) => {
                if (col.tipo === 'media_texto' && col.data?.imagen) {
                    imageInputs.get(i)?.setExistingFile({ url: col.data.imagen });
                }
            });

            // Redes
            redes = [];
            (footer.redes ?? []).forEach(r => addRedItem(r));

            // Legales
            legales = [];
            (footer.legales ?? []).forEach(l => addLegalItem(l));

        } catch (err) {
            Toast.error('Error al cargar el footer: ' + err.message);
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // ── Serializar datos ──────────────────────────────────────────────────────
    function collectData() {
        const copyrightText = el('footer-copyright')?.value.trim() || null;

        const columnasPayload = columns.map((col, i) => {
            const base = { tipo: col.tipo, orden: i };

            if (col.tipo === 'media_texto') {
                // Leer HTML actual directamente desde Quill si la instancia existe
                const quill = quillInstances.get(i);
                const desc  = quill
                    ? (quill.getText().trim() ? quill.root.innerHTML : null)
                    : (col.descripcion ?? null);
                const obj = { ...base, descripcion: desc };
                // Solo enviar `imagen` si es un nuevo upload (base64).
                // Si no hay archivo o es URL existente, no se incluye.
                const imgInput = imageInputs.get(i);
                if (imgInput) {
                    const files = imgInput.getFiles();
                    if (files.length && files[0].base64) obj.imagen = files[0].base64;
                }
                return obj;
            }

            if (col.tipo === 'lista_enlaces') {
                return { ...base, enlaces: col.enlaces.filter(e => e.texto || e.url).map((e, ei) => ({ texto: e.texto, url: e.url, orden: ei })) };
            }

            // contacto
            return { ...base, direccion: col.direccion, telefono: col.telefono, email: col.email };
        });

        // Leer valores actuales del DOM para redes y legales
        const redesPayload  = collectRedes();
        const legalesPayload = collectLegales();

        return {
            columnas_count: columnaCount,
            copyright_text: copyrightText,
            columnas:       columnasPayload,
            redes:          redesPayload,
            legales:        legalesPayload,
        };
    }

    function collectRedes() {
        const items = el('redes-list')?.querySelectorAll('.footer-red-item') ?? [];
        return Array.from(items).map((li, i) => ({
            nombre:   li.querySelector('.footer-red-nombre')?.value.trim() ?? '',
            url:      li.querySelector('.footer-red-url')?.value.trim()    ?? '',
            svg_icon: li.querySelector('.footer-red-svg')?.value.trim()    ?? '',
            orden:    i,
        })).filter(r => r.nombre || r.url);
    }

    function collectLegales() {
        const items = el('legales-list')?.querySelectorAll('.footer-enlace-item') ?? [];
        return Array.from(items).map((li, i) => ({
            texto: li.querySelector('.footer-enlace-texto')?.value.trim() ?? '',
            url:   li.querySelector('.footer-enlace-url')?.value.trim()   ?? '',
            orden: i,
        })).filter(l => l.texto || l.url);
    }

    // ── Validación básica ─────────────────────────────────────────────────────
    function validate(data) {
        if (!data.columnas_count || data.columnas_count < 1 || data.columnas_count > 5) {
            Toast.error('El número de columnas debe ser entre 1 y 5.');
            return false;
        }
        for (const red of data.redes) {
            if (!red.nombre) { Toast.error('Cada red social debe tener un nombre.'); return false; }
            if (!red.url)    { Toast.error(`La red "${red.nombre}" no tiene URL.`); return false; }
            if (!red.svg_icon) { Toast.error(`La red "${red.nombre}" no tiene ícono SVG.`); return false; }
        }
        for (const legal of data.legales) {
            if (!legal.texto) { Toast.error('Cada enlace legal debe tener un texto.'); return false; }
            if (!legal.url)   { Toast.error(`El enlace "${legal.texto}" no tiene URL.`); return false; }
        }
        return true;
    }

    // ── Envío ─────────────────────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        const btn = el('footer-form-submit');
        const data = collectData();
        if (!validate(data)) return;

        btn.disabled = true;
        btn.classList.add('loading');
        try {
            let result;
            if (isEdit()) {
                result = await Api.updateFooter(window.FOOTER_UUID, data);
            } else {
                result = await Api.createFooter(data);
            }
            if (result.success) {
                Toast.success(isEdit() ? 'Footer actualizado correctamente.' : 'Footer creado correctamente.');
                setTimeout(() => { window.location.href = 'footer-list.php'; }, 1000);
            }
        } catch (err) {
            Toast.error(err.data?.message || err.message || 'Error al guardar el footer.');
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => FooterForm.init());
