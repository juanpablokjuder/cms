/**
 * CMS Admin — ImageInput
 *
 * Componente reutilizable de carga de imágenes.
 *
 * Características:
 *  - Modo simple (1 imagen) o múltiple (N imágenes)
 *  - Drag & Drop sobre la zona de carga
 *  - Reordenamiento por arrastre entre tarjetas (modo múltiple)
 *  - Por archivo: campos editables de nombre, alt y title
 *  - Soporte de imágenes existentes (modo edición)
 *
 * Uso:
 *   const input = new ImageInput({ container: '#mi-contenedor', multiple: false });
 *   input.setExistingFile({ url, nombre, alt, title }); // modo edición
 *   const files = input.getFiles(); // obtener estado al guardar
 */

'use strict';

class ImageInput {
    /**
     * @param {object}          config
     * @param {string|Element}  config.container  - Selector CSS o Element donde montar el componente
     * @param {boolean}         [config.multiple=false] - Permitir múltiples archivos
     * @param {number}          [config.maxSizeMB=10]   - Tamaño máximo por archivo en MB
     * @param {string[]}        [config.accept]         - Tipos MIME aceptados
     */
    constructor(config) {
        this._container = typeof config.container === 'string'
            ? document.querySelector(config.container)
            : config.container;

        if (!this._container) throw new Error('ImageInput: container no encontrado');

        this._multiple  = config.multiple  ?? false;
        this._maxSizeMB = config.maxSizeMB ?? 10;
        this._accept    = config.accept    ?? [
            'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
        ];

        /**
         * Estado interno: array de entradas de archivo.
         * @type {Array<{id:string, base64:string|null, url:string|null, nombre:string, alt:string, title:string}>}
         */
        this._files = [];

        /** ID del item que se está arrastrando en el modo múltiple */
        this._dragSrcId = null;

        this._render();
        this._bindDropzone();
    }

    // ─── API pública ────────────────────────────────────────────────────────

    /**
     * Devuelve el estado actual ordenado según lo que muestra la UI.
     * - base64 !== null → archivo nuevo (se debe enviar a la API).
     * - base64 === null → archivo existente no modificado (no enviar).
     * @returns {Array<{id:string, base64:string|null, url:string|null, nombre:string, alt:string, title:string}>}
     */
    getFiles() {
        const list = this._container.querySelector('.ii-list');
        if (!list) return [];

        return Array.from(list.querySelectorAll('.ii-item'))
            .map(item => {
                const id   = item.dataset.id;
                const file = this._files.find(f => f.id === id);
                if (!file) return null;

                // Extraer campos conocidos y propagar campos extra (ej: _archivo_uuid)
                const { id: _id, base64, url, nombre, alt, title, ...extras } = file;
                return {
                    id:     file.id,
                    base64: file.base64,
                    url:    file.url,
                    nombre: item.querySelector('[data-field="nombre"]')?.value?.trim() ?? file.nombre,
                    alt:    item.querySelector('[data-field="alt"]')?.value?.trim()    ?? file.alt,
                    title:  item.querySelector('[data-field="title"]')?.value?.trim()  ?? file.title,
                    ...extras,
                };
            })
            .filter(Boolean);
    }

    /**
     * Carga un archivo existente (modo edición).
     * En modo single reemplaza cualquier archivo previo.
     * @param {{url:string, nombre?:string, alt?:string, title?:string, [key:string]:any}} fileData
     */
    setExistingFile(fileData) {
        if (!this._multiple) this._files = [];

        // Extraer campos conocidos y preservar cualquier campo extra (ej: _archivo_uuid)
        const { url, nombre, alt, title, ...extras } = fileData;

        this._files.push({
            id:     this._uid(),
            base64: null,
            url:    url,
            nombre: nombre ?? '',
            alt:    alt    ?? '',
            title:  title  ?? '',
            ...extras,
        });

        this._renderList();
        this._updateDropzoneVisibility();
    }

    /** Limpia todos los archivos y reinicia el componente al estado vacío. */
    reset() {
        this._files = [];
        this._renderList();
        this._updateDropzoneVisibility();
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    _render() {
        this._container.classList.add('ii-root');
        this._container.innerHTML = `
            <div class="ii-dropzone" role="button" tabindex="0"
                 aria-label="Zona de carga de imágenes. Haga clic o arrastre ${this._multiple ? 'imágenes' : 'una imagen'} aquí">
                <input class="ii-file-input" type="file"
                       accept="${this._accept.join(',')}"
                       ${this._multiple ? 'multiple' : ''}
                       aria-hidden="true" tabindex="-1">
                <span class="ii-dropzone-icon" aria-hidden="true">📷</span>
                <span class="ii-dropzone-text">
                    <strong>Haga clic</strong> o arrastre ${this._multiple ? 'imágenes' : 'una imagen'} aquí
                </span>
                <span class="ii-dropzone-hint">
                    PNG, JPG, WebP, GIF, SVG · Máx. ${this._maxSizeMB} MB
                </span>
            </div>
            <ul class="ii-list" aria-label="Archivos cargados" aria-live="polite"></ul>
        `;
    }

    _renderList() {
        const list = this._container.querySelector('.ii-list');
        list.innerHTML = '';

        this._files.forEach(file => {
            list.appendChild(this._buildItem(file));
        });

        if (this._multiple) {
            this._bindSortable();
        }
    }

    _buildItem(file) {
        const li = document.createElement('li');
        li.className = 'ii-item';
        li.dataset.id = file.id;

        if (this._multiple) {
            li.setAttribute('draggable', 'true');
        }

        const thumbSrc = file.base64 || file.url || '';

        li.innerHTML = `
            ${this._multiple
                ? '<span class="ii-drag-handle" title="Arrastrar para reordenar" aria-label="Mover archivo" role="button">⠿</span>'
                : ''}
            <div class="ii-thumb" title="Clic para cambiar la imagen" role="button" tabindex="0" aria-label="Cambiar imagen">
                <img src="${this._esc(thumbSrc)}" alt="Vista previa" loading="lazy">
                <div class="ii-thumb-overlay" aria-hidden="true">📷<br>Cambiar</div>
                <input class="ii-replace-input" type="file"
                       accept="${this._accept.join(',')}"
                       style="display:none" aria-hidden="true" tabindex="-1">
            </div>
            <div class="ii-fields">
                <div class="ii-field">
                    <label class="ii-field-label">Nombre</label>
                    <input type="text" class="ii-input" data-field="nombre"
                           value="${this._esc(file.nombre)}"
                           placeholder="Nombre del archivo (sin extensión)"
                           maxlength="200"
                           aria-label="Nombre del archivo">
                </div>
                <div class="ii-field">
                    <label class="ii-field-label">Alt</label>
                    <input type="text" class="ii-input" data-field="alt"
                           value="${this._esc(file.alt)}"
                           placeholder="Texto alternativo (accesibilidad)"
                           maxlength="255"
                           aria-label="Texto alternativo">
                </div>
                <div class="ii-field">
                    <label class="ii-field-label">Title</label>
                    <input type="text" class="ii-input" data-field="title"
                           value="${this._esc(file.title)}"
                           placeholder="Título de la imagen (tooltip)"
                           maxlength="255"
                           aria-label="Título de la imagen">
                </div>
            </div>
            <button type="button" class="ii-remove" aria-label="Eliminar imagen">✕</button>
        `;

        li.querySelector('.ii-remove').addEventListener('click', () => this._removeFile(file.id));

        // Clic en miniatura → abrir selector de archivo para reemplazar
        const thumb        = li.querySelector('.ii-thumb');
        const replaceInput = li.querySelector('.ii-replace-input');

        thumb.addEventListener('click', () => replaceInput.click());
        thumb.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); replaceInput.click(); }
        });

        replaceInput.addEventListener('change', e => {
            const [newFile] = e.target.files;
            replaceInput.value = '';
            if (!newFile || !this._validateFile(newFile)) return;

            const reader = new FileReader();
            reader.onload = ev => {
                const idx = this._files.findIndex(f => f.id === file.id);
                if (idx === -1) return;
                const nombreActual = li.querySelector('[data-field="nombre"]')?.value?.trim();
                const altActual    = li.querySelector('[data-field="alt"]')?.value?.trim();
                const titleActual  = li.querySelector('[data-field="title"]')?.value?.trim();
                const nombreBase   = newFile.name.replace(/\.[^.]+$/, '');
                this._files[idx] = {
                    ...this._files[idx],
                    base64: ev.target.result,
                    url:    null,
                    nombre: nombreActual || nombreBase,
                    alt:    altActual    || nombreBase,
                    title:  titleActual  || nombreBase,
                };
                this._renderList();
                this._updateDropzoneVisibility();
            };
            reader.readAsDataURL(newFile);
        });

        return li;
    }

    _updateDropzoneVisibility() {
        const zone = this._container.querySelector('.ii-dropzone');
        if (!zone) return;

        // En modo single: ocultar la zona cuando hay un archivo cargado
        if (!this._multiple && this._files.length > 0) {
            zone.classList.add('ii-dropzone--hidden');
        } else {
            zone.classList.remove('ii-dropzone--hidden');
        }
    }

    // ─── Manejo de archivos ──────────────────────────────────────────────────

    _bindDropzone() {
        const zone  = this._container.querySelector('.ii-dropzone');
        const input = this._container.querySelector('.ii-file-input');

        // Abrir selector al hacer clic sobre la zona
        zone.addEventListener('click', () => input.click());
        zone.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                input.click();
            }
        });

        // Cambio en el file input
        input.addEventListener('change', e => {
            this._processFiles(Array.from(e.target.files));
            input.value = ''; // Permite seleccionar el mismo archivo de nuevo
        });

        // Drag & Drop sobre la zona
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('ii-dropzone--dragover');
        });

        zone.addEventListener('dragleave', e => {
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('ii-dropzone--dragover');
            }
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('ii-dropzone--dragover');
            const files = Array.from(e.dataTransfer.files)
                .filter(f => this._accept.includes(f.type));
            this._processFiles(files);
        });
    }

    _processFiles(files) {
        // En modo single solo se acepta el primer archivo
        const toProcess = this._multiple ? files : files.slice(0, 1);

        toProcess.forEach(file => {
            if (!this._validateFile(file)) return;

            const reader = new FileReader();
            reader.onload = e => {
                // Nombre base sin extensión, usado como valor por defecto para alt y title
                const nombre = file.name.replace(/\.[^.]+$/, '');

                const entry = {
                    id:     this._uid(),
                    base64: e.target.result, // data:image/...;base64,...
                    url:    null,
                    nombre,
                    alt:    nombre,
                    title:  nombre,
                };

                if (!this._multiple) this._files = [];
                this._files.push(entry);

                this._renderList();
                this._updateDropzoneVisibility();
            };

            reader.readAsDataURL(file);
        });
    }

    _validateFile(file) {
        if (!this._accept.includes(file.type)) {
            if (typeof Toast !== 'undefined') {
                Toast.error(`Formato no soportado: "${file.name}". Use PNG, JPG, WebP, GIF o SVG.`);
            }
            return false;
        }

        if (file.size > this._maxSizeMB * 1024 * 1024) {
            if (typeof Toast !== 'undefined') {
                Toast.error(`El archivo "${file.name}" supera el límite de ${this._maxSizeMB} MB.`);
            }
            return false;
        }

        return true;
    }

    _removeFile(id) {
        this._files = this._files.filter(f => f.id !== id);
        this._renderList();
        this._updateDropzoneVisibility();
    }

    // ─── Reordenamiento (modo múltiple) ──────────────────────────────────────

    _bindSortable() {
        const list = this._container.querySelector('.ii-list');

        list.querySelectorAll('.ii-item').forEach(item => {

            item.addEventListener('dragstart', e => {
                this._dragSrcId = item.dataset.id;
                item.classList.add('ii-item--dragging');
                e.dataTransfer.effectAllowed = 'move';
                // Necesario en Firefox
                e.dataTransfer.setData('text/plain', item.dataset.id);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('ii-item--dragging');
                list.querySelectorAll('.ii-item')
                    .forEach(i => i.classList.remove('ii-item--dragover'));
                this._dragSrcId = null;
            });

            item.addEventListener('dragover', e => {
                e.preventDefault();
                if (item.dataset.id === this._dragSrcId) return;
                e.dataTransfer.dropEffect = 'move';
                list.querySelectorAll('.ii-item')
                    .forEach(i => i.classList.remove('ii-item--dragover'));
                item.classList.add('ii-item--dragover');
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('ii-item--dragover');
            });

            item.addEventListener('drop', e => {
                e.preventDefault();
                item.classList.remove('ii-item--dragover');

                if (item.dataset.id === this._dragSrcId) return;

                const srcIdx = this._files.findIndex(f => f.id === this._dragSrcId);
                const tgtIdx = this._files.findIndex(f => f.id === item.dataset.id);
                if (srcIdx === -1 || tgtIdx === -1) return;

                // Reordenar el array interno
                const [moved] = this._files.splice(srcIdx, 1);
                this._files.splice(tgtIdx, 0, moved);

                this._renderList();
            });
        });
    }

    // ─── Utilidades ──────────────────────────────────────────────────────────

    /** Genera un ID único para cada entrada. */
    _uid() {
        return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    }

    /** Escapa HTML para evitar XSS al insertar valores en innerHTML. */
    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }
}
