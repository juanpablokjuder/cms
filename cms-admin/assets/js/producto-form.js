'use strict';

// ─── Modo: create vs edit ────────────────────────────────────────────────────
const isEdit  = document.getElementById('prod-uuid') !== null && document.getElementById('prod-uuid').value !== '';
const prodUuid = isEdit ? document.getElementById('prod-uuid').value : null;

// ─── Estado global del formulario ────────────────────────────────────────────
let varianteIndex = 0;
const varianteImageInputs = {}; // idx → ImageInput
let coloresOptions    = [];   // [{ uuid, nombre }]
let monedasOptions    = [];   // [{ uuid, codigo }]
let atributosOptions  = [];   // plantillas completas
let coloresAllForMgr  = [];
let atributosAllForMgr = [];
let colorQuickImageInput = null;

// ─── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([loadSelectData(), loadMonedas()]);
    bindFormEvents();
    bindMgrModals();
    bindAtributosPlantilla();

    if (isEdit) {
        document.getElementById('page-loading')?.remove?.();
        document.getElementById('producto-form').style.display = '';
        await loadProductoForEdit();
    }
});

// ─── Carga de datos para selectores ──────────────────────────────────────────

async function loadSelectData() {
    try {
        const [resColores, resCond, resGar, resAtrib] = await Promise.all([
            Api.getColoresAll(),
            Api.getProductosCondiciones(),
            Api.getProductosGarantias(),
            Api.getProductosAtributosAll(),
        ]);

        coloresOptions   = resColores.data ?? [];
        atributosOptions = resAtrib.data ?? [];

        // Selects de condición y garantía
        fillSelect('prod-condicion', resCond.data ?? [], 'uuid', 'nombre', '-- Sin especificar --');
        fillSelect('prod-garantia',  resGar.data ?? [],  'uuid', 'nombre', '-- Sin garantía --');
        fillSelect('prod-atributos-plantilla', atributosOptions, 'uuid', 'nombre', '-- Sin plantilla --');
    } catch (e) {
        Toast.error('Error cargando datos del formulario: ' + e.message);
    }
}

async function loadMonedas() {
    try {
        const res = await Api.getMonedas();
        monedasOptions = res.data ?? [];
    } catch (e) {
        Toast.error('Error cargando monedas: ' + e.message);
    }
}

function fillSelect(id, items, valKey, labelKey, emptyLabel = '') {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = emptyLabel ? `<option value="">${emptyLabel}</option>` : '';
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item[valKey];
        opt.textContent = item[labelKey];
        sel.appendChild(opt);
    });
}

// ─── Cargar producto existente (modo edit) ────────────────────────────────────

async function loadProductoForEdit() {
    try {
        const res = await Api.getProducto(prodUuid);
        const p = res.data;

        document.getElementById('prod-nombre').value      = p.nombre ?? '';
        document.getElementById('prod-marca').value       = p.marca ?? '';
        document.getElementById('prod-descripcion').value = p.descripcion ?? '';
        document.getElementById('prod-estado').value      = p.estado ?? 'activo';

        if (p.condicion_uuid) document.getElementById('prod-condicion').value = p.condicion_uuid;
        if (p.garantia_uuid)  document.getElementById('prod-garantia').value  = p.garantia_uuid;

        if (p.atributos_uuid) {
            document.getElementById('prod-atributos-plantilla').value = p.atributos_uuid;
            renderAtributosValores(p.atributos_uuid, p.atributos ?? {});
        }

        // Variantes
        (p.variantes ?? []).forEach(v => addVariante(v));
    } catch (e) {
        Toast.error('Error cargando producto: ' + e.message);
    }
}

// ─── Variantes (maestro-detalle) ──────────────────────────────────────────────

function bindFormEvents() {
    document.getElementById('btn-add-variante').addEventListener('click', () => addVariante(null));
    document.getElementById('producto-form').addEventListener('submit', submitProducto);
}

function addVariante(data = null) {
    console.log('Agregando variante', data);
    const tpl  = document.getElementById('tpl-variante');
    const clone = tpl.content.cloneNode(true);
    const card  = clone.querySelector('.variante-card');
    const idx   = varianteIndex++;
    console.log('Índice asignado:', idx);
    console.log('Card creada:', card);
    card.dataset.idx  = idx;
    card.dataset.uuid = data?.uuid ?? '';
    card.querySelector('.variante-num').textContent = idx + 1;

    // Llenar opciones de colores
    const selColor = card.querySelector('.variante-color');
    coloresOptions.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.uuid;
        opt.textContent = c.nombre;
        selColor.appendChild(opt);
    });
    if (data?.color_uuid) selColor.value = data.color_uuid;

    // Llenar opciones de monedas
    const selMoneda = card.querySelector('.variante-moneda');
    monedasOptions.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.uuid;
        opt.textContent = `${m.codigo} – ${m.nombre}`;
        selMoneda.appendChild(opt);
    });
    if (data?.moneda_uuid) selMoneda.value = data.moneda_uuid;

    // Valores
    if (data) {
        card.querySelector('.variante-precio').value    = data.precio    ?? 0;
        card.querySelector('.variante-descuento').value = data.descuento ?? 0;
        card.querySelector('.variante-stock').value     = data.stock     ?? 0;
    }

    // ImageInput para imágenes de la variante
    const imgWrap = card.querySelector('.variante-imagenes-wrap');
    const imgInputEl = document.createElement('div');
    imgInputEl.id = `variante-img-${idx}`;
    imgWrap.appendChild(imgInputEl);
  

    document.getElementById('variantes-list').appendChild(clone);
    document.getElementById('variantes-empty').style.display = 'none';

     const imgInput = new ImageInput({ container: `#variante-img-${idx}`, multiple: true });
     varianteImageInputs[idx] = imgInput;

    // Pre-cargar imágenes existentes
    if (data?.imagenes?.length) {
        data.imagenes.forEach(img => imgInput.setExistingFile({ url: img.url, _archivo_uuid: img.archivo_uuid, _orden: img.orden }));
    }

    // Botón quitar
    card.querySelector('.btn-remove-variante').addEventListener('click', () => {
        card.remove();
        delete varianteImageInputs[idx];
        reindexVariantes();
    });

}

function reindexVariantes() {
    document.querySelectorAll('.variante-card').forEach((card, i) => {
        card.querySelector('.variante-num').textContent = i + 1;
    });
}

function collectVariantes() {
    const cards = document.querySelectorAll('.variante-card');
    const result = [];
    let valid = true;

    cards.forEach(card => {
        const idx       = Number(card.dataset.idx);
        const uuid      = card.dataset.uuid || undefined;
        const colorUuid = card.querySelector('.variante-color').value;
        const monedaUuid = card.querySelector('.variante-moneda').value;
        const precio    = parseInt(card.querySelector('.variante-precio').value, 10);
        const descuento = parseInt(card.querySelector('.variante-descuento').value, 10) || 0;
        const stock     = parseInt(card.querySelector('.variante-stock').value, 10) || 0;

        // Validaciones básicas
        if (!colorUuid) { card.querySelector('.variante-color-error').textContent = 'Seleccione un color.'; valid = false; }
        else card.querySelector('.variante-color-error').textContent = '';
        if (!monedaUuid) { card.querySelector('.variante-moneda-error').textContent = 'Seleccione una moneda.'; valid = false; }
        else card.querySelector('.variante-moneda-error').textContent = '';
        if (isNaN(precio) || precio < 0) { card.querySelector('.variante-precio-error').textContent = 'Precio inválido.'; valid = false; }
        else card.querySelector('.variante-precio-error').textContent = '';
        if (isNaN(stock) || stock < 0) { card.querySelector('.variante-stock-error').textContent = 'Stock inválido.'; valid = false; }
        else card.querySelector('.variante-stock-error').textContent = '';

        const files = varianteImageInputs[idx]?.getFiles?.() ?? [];
        const imagenes = files.map((img, i) => {
            if (img.base64) {
                return {
                    imagen:        img.base64,
                    imagen_nombre: img.nombre || null,
                    imagen_alt:    img.alt    || null,
                    orden:         i,
                };
            }
            if (img._archivo_uuid) {
                return { archivo_uuid: img._archivo_uuid, orden: img._orden ?? i };
            }
            return null;
        }).filter(Boolean);

        const v = { color_uuid: colorUuid, moneda_uuid: monedaUuid, precio, descuento, stock, imagenes };
        if (uuid) v.uuid = uuid;
        result.push(v);
    });

    return valid ? result : null;
}

// ─── Atributos dinámicos ──────────────────────────────────────────────────────

function bindAtributosPlantilla() {
    document.getElementById('prod-atributos-plantilla').addEventListener('change', (e) => {
        renderAtributosValores(e.target.value, {});
    });
}

function renderAtributosValores(plantillaUuid, valores = {}) {
    const wrap = document.getElementById('atributos-valores-wrap');
    wrap.innerHTML = '';
    if (!plantillaUuid) { wrap.style.display = 'none'; return; }
    const plantilla = atributosOptions.find(p => p.uuid === plantillaUuid);
    if (!plantilla) { wrap.style.display = 'none'; return; }

    Object.entries(plantilla.atributos).forEach(([key, type]) => {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = key;
        group.appendChild(label);

        let input;
        if (type === 'boolean') {
            input = document.createElement('select');
            input.className = 'form-input';
            input.innerHTML = '<option value="">—</option><option value="true">Sí</option><option value="false">No</option>';
            if (valores[key] !== undefined) input.value = String(valores[key]);
        } else {
            input = document.createElement('input');
            input.type = type === 'number' ? 'number' : 'text';
            input.className = 'form-input';
            input.value = valores[key] ?? '';
        }
        input.dataset.atribKey = key;
        input.dataset.atribType = type;
        group.appendChild(input);
        wrap.appendChild(group);
    });

    wrap.style.display = 'flex';
}

function collectAtributos() {
    const wrap = document.getElementById('atributos-valores-wrap');
    const inputs = wrap.querySelectorAll('[data-atrib-key]');
    if (!inputs.length) return null;
    const obj = {};
    inputs.forEach(inp => {
        const k = inp.dataset.atribKey;
        const t = inp.dataset.atribType;
        const v = inp.value;
        if (t === 'number') obj[k] = v === '' ? null : Number(v);
        else if (t === 'boolean') obj[k] = v === '' ? null : v === 'true';
        else obj[k] = v === '' ? null : v;
    });
    return obj;
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function submitProducto(e) {
    e.preventDefault();
    const btn   = document.getElementById('btn-submit');
    const nombre = document.getElementById('prod-nombre').value.trim();
    document.getElementById('prod-nombre-error').textContent = '';
    document.getElementById('variantes-error').textContent = '';

    if (!nombre) { document.getElementById('prod-nombre-error').textContent = 'El nombre es requerido.'; return; }

    const variantes = collectVariantes();
    if (!variantes) return;
    if (!variantes.length) { document.getElementById('variantes-error').textContent = 'Agregue al menos una variante.'; return; }

    const payload = {
        nombre,
        marca:        document.getElementById('prod-marca').value.trim() || null,
        descripcion:  document.getElementById('prod-descripcion').value.trim() || null,
        estado:       document.getElementById('prod-estado').value,
        condicion_uuid: document.getElementById('prod-condicion').value || null,
        garantia_uuid:  document.getElementById('prod-garantia').value  || null,
        atributos_uuid: document.getElementById('prod-atributos-plantilla').value || null,
        atributos:    collectAtributos(),
        variantes,
    };

    setLoading(btn, true);
    try {
        if (isEdit) {
            await Api.updateProducto(prodUuid, payload);
            Toast.success('Producto actualizado.');
        } else {
            await Api.createProducto(payload);
            Toast.success('Producto creado.');
            setTimeout(() => { window.location.href = 'productos.php'; }, 800);
        }
    } catch (e) {
        Toast.error(e.message);
    } finally {
        setLoading(btn, false);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// MODALES DE GESTIÓN (colores y atributos desde el formulario)
// ══════════════════════════════════════════════════════════════════════════════

function bindMgrModals() {
    // Abrir modales de gestión
    document.getElementById('btn-gestionar-atributos')?.addEventListener('click', openAtributosMgr);

    // Cerrar modales de gestión
    document.getElementById('btn-close-modal-colores-mgr')?.addEventListener('click', () => closeMgrModal('modal-colores-mgr'));
    document.getElementById('btn-close-modal-atributos-mgr')?.addEventListener('click', () => closeMgrModal('modal-atributos-mgr'));
    document.getElementById('btn-close-modal-color-form')?.addEventListener('click', () => closeQuickForm('modal-color-form'));
    document.getElementById('btn-close-modal-atributo-form')?.addEventListener('click', () => closeQuickForm('modal-atributo-form'));

    // Botones "nuevo" dentro del mgr
    document.getElementById('btn-mgr-nuevo-color')?.addEventListener('click', () => openColorQuickForm(null));
    document.getElementById('btn-mgr-nuevo-atributo')?.addEventListener('click', () => openAtributoQuickForm(null));

    // Cancelar quick forms
    document.getElementById('btn-cancel-color-quick')?.addEventListener('click', () => closeQuickForm('modal-color-form'));
    document.getElementById('btn-cancel-atributo-quick')?.addEventListener('click', () => closeQuickForm('modal-atributo-form'));

    // Submit quick forms
    document.getElementById('color-quick-form')?.addEventListener('submit', submitColorQuick);
    document.getElementById('atributo-quick-form')?.addEventListener('submit', submitAtributoQuick);

    // Agregar campo en atributo quick
    document.getElementById('btn-aq-add-campo')?.addEventListener('click', () => addCampoRow('aq-campos-list', {}));

    // ImageInput para color rápido
    colorQuickImageInput = new ImageInput({ container: '#cq-imagen-input' });
}

function closeMgrModal(id) {
    document.getElementById(id).style.display = 'none';
}
function closeQuickForm(id) {
    document.getElementById(id).style.display = 'none';
}

// ─── Gestión de colores ───────────────────────────────────────────────────────

async function loadMgrColores() {
    const tbody = document.getElementById('mgr-colores-tbody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';
    try {
        const res = await Api.getColoresAll();
        coloresAllForMgr = res.data ?? [];
        if (!coloresAllForMgr.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay colores.</td></tr>';
        } else {
            tbody.innerHTML = coloresAllForMgr.map(c => `
                <tr>
                    <td>${c.imagen_url ? `<img src="${escHtml(c.imagen_url)}" class="color-swatch" alt="">` : '—'}</td>
                    <td>${escHtml(c.nombre)}</td>
                    <td class="table-actions">
                        <button class="btn btn-secondary btn-xs" onclick="openColorQuickForm('${escHtml(c.uuid)}')">✏️</button>
                        <button class="btn btn-danger btn-xs" onclick="mgrDeleteColor('${escHtml(c.uuid)}', '${escHtml(c.nombre)}')">🗑️</button>
                    </td>
                </tr>`).join('');
        }
        // Re-cargar opciones de color en variantes existentes
        await refreshColoresOptions();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-danger">${escHtml(e.message)}</td></tr>`;
    }
}

async function refreshColoresOptions() {
    const res = await Api.getColoresAll();
    coloresOptions = res.data ?? [];
    document.querySelectorAll('.variante-color').forEach(sel => {
        const current = sel.value;
        sel.innerHTML = '<option value="">-- Seleccionar --</option>';
        coloresOptions.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.uuid;
            opt.textContent = c.nombre;
            sel.appendChild(opt);
        });
        if (current) sel.value = current;
    });
}

function openColorQuickForm(uuid) {
    document.getElementById('cq-uuid').value  = uuid ?? '';
    document.getElementById('cq-nombre').value = '';
    document.getElementById('cq-nombre-error').textContent = '';
    document.getElementById('modal-color-form-title').textContent = uuid ? 'Editar Color' : 'Nuevo Color';
    colorQuickImageInput.reset();
    document.getElementById('modal-color-form').style.display = 'flex';

    if (uuid) {
        Api.getColor(uuid).then(res => {
            document.getElementById('cq-nombre').value = res.data.nombre;
            if (res.data.imagen_uuid) colorQuickImageInput.setExistingFile({ url: res.data.imagen_url, _archivo_uuid: res.data.imagen_uuid });
        }).catch(e => Toast.error(e.message));
    }
}

async function submitColorQuick(e) {
    e.preventDefault();
    const uuid   = document.getElementById('cq-uuid').value;
    const nombre = document.getElementById('cq-nombre').value.trim();
    document.getElementById('cq-nombre-error').textContent = '';
    if (!nombre) { document.getElementById('cq-nombre-error').textContent = 'Requerido.'; return; }

    const payload = { nombre };
    const files = colorQuickImageInput.getFiles();
    const newFile = files.find(f => f.base64);
    if (newFile) {
        payload.imagen = newFile.base64;
        if (newFile.nombre) payload.imagen_nombre = newFile.nombre;
        if (newFile.alt)    payload.imagen_alt    = newFile.alt;
    }

    try {
        if (uuid) await Api.updateColor(uuid, payload);
        else      await Api.createColor(payload);
        Toast.success(uuid ? 'Color actualizado.' : 'Color creado.');
        closeQuickForm('modal-color-form');
        await loadMgrColores();
    } catch (e) {
        Toast.error(e.message);
    }
}

async function mgrDeleteColor(uuid, nombre) {
    if (!confirm(`¿Eliminar el color "${nombre}"?`)) return;
    try {
        await Api.deleteColor(uuid);
        Toast.success('Color eliminado.');
        await loadMgrColores();
    } catch (e) {
        Toast.error(e.message);
    }
}

// ─── Gestión de atributos ─────────────────────────────────────────────────────

async function openAtributosMgr() {
    document.getElementById('modal-atributos-mgr').style.display = 'flex';
    await loadMgrAtributos();
}

async function loadMgrAtributos() {
    const tbody = document.getElementById('mgr-atributos-tbody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';
    try {
        const res = await Api.getProductosAtributosAll();
        atributosAllForMgr = res.data ?? [];
        if (!atributosAllForMgr.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay plantillas.</td></tr>';
        } else {
            tbody.innerHTML = atributosAllForMgr.map(a => `
                <tr>
                    <td>${escHtml(a.nombre)}</td>
                    <td>${Object.keys(a.atributos).map(k => `<span class="badge badge-info">${escHtml(k)}</span>`).join(' ')}</td>
                    <td class="table-actions">
                        <button class="btn btn-secondary btn-xs" onclick="openAtributoQuickForm('${escHtml(a.uuid)}')">✏️</button>
                        <button class="btn btn-danger btn-xs" onclick="mgrDeleteAtributo('${escHtml(a.uuid)}', '${escHtml(a.nombre)}')">🗑️</button>
                    </td>
                </tr>`).join('');
        }
        // Actualizar opciones del select de plantilla
        await refreshAtributosOptions();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-danger">${escHtml(e.message)}</td></tr>`;
    }
}

async function refreshAtributosOptions() {
    const res = await Api.getProductosAtributosAll();
    atributosOptions = res.data ?? [];
    const sel = document.getElementById('prod-atributos-plantilla');
    const current = sel.value;
    sel.innerHTML = '<option value="">-- Sin plantilla --</option>';
    atributosOptions.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.uuid;
        opt.textContent = a.nombre;
        sel.appendChild(opt);
    });
    if (current) sel.value = current;
}

function openAtributoQuickForm(uuid) {
    document.getElementById('aq-uuid').value  = uuid ?? '';
    document.getElementById('aq-nombre').value = '';
    document.getElementById('aq-nombre-error').textContent = '';
    document.getElementById('aq-campos-error').textContent = '';
    document.getElementById('aq-campos-list').innerHTML = '';
    document.getElementById('modal-atributo-form-title').textContent = uuid ? 'Editar Plantilla' : 'Nueva Plantilla';
    document.getElementById('modal-atributo-form').style.display = 'flex';

    if (uuid) {
        Api.getProductoAtributo(uuid).then(res => {
            document.getElementById('aq-nombre').value = res.data.nombre;
            Object.entries(res.data.atributos).forEach(([k, v]) => addCampoRow('aq-campos-list', { key: k, type: v }));
        }).catch(e => Toast.error(e.message));
    }
}

async function submitAtributoQuick(e) {
    e.preventDefault();
    const uuid   = document.getElementById('aq-uuid').value;
    const nombre = document.getElementById('aq-nombre').value.trim();
    document.getElementById('aq-nombre-error').textContent = '';
    if (!nombre) { document.getElementById('aq-nombre-error').textContent = 'Requerido.'; return; }

    const campos = getCamposFromList('aq-campos-list', 'aq-campos-error');
    if (!campos) return;

    try {
        if (uuid) await Api.updateProductoAtributo(uuid, { nombre, atributos: campos });
        else      await Api.createProductoAtributo({ nombre, atributos: campos });
        Toast.success(uuid ? 'Plantilla actualizada.' : 'Plantilla creada.');
        closeQuickForm('modal-atributo-form');
        await loadMgrAtributos();
    } catch (e) {
        Toast.error(e.message);
    }
}

async function mgrDeleteAtributo(uuid, nombre) {
    if (!confirm(`¿Eliminar la plantilla "${nombre}"?`)) return;
    try {
        await Api.deleteProductoAtributo(uuid);
        Toast.success('Plantilla eliminada.');
        await loadMgrAtributos();
    } catch (e) {
        Toast.error(e.message);
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addCampoRow(containerId, { key = '', type = 'string' } = {}) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'campo-row';
    row.innerHTML = `
        <input type="text"  class="form-input campo-key"  placeholder="Nombre del campo" value="${escHtml(key)}" style="flex:1">
        <select class="form-input campo-type" style="width:120px">
            <option value="string"  ${type === 'string'  ? 'selected' : ''}>Texto</option>
            <option value="number"  ${type === 'number'  ? 'selected' : ''}>Número</option>
            <option value="boolean" ${type === 'boolean' ? 'selected' : ''}>Sí/No</option>
        </select>
        <button type="button" class="btn btn-danger btn-xs btn-remove-campo">✕</button>
    `;
    row.querySelector('.btn-remove-campo').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function getCamposFromList(containerId, errorId) {
    const eId = errorId ?? (containerId.replace('-list', '-error'));
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.campo-row');
    const errEl = document.getElementById(eId);
    if (!rows.length) { if (errEl) errEl.textContent = 'Agregue al menos un campo.'; return null; }
    const obj = {};
    for (const row of rows) {
        const k = row.querySelector('.campo-key').value.trim();
        const t = row.querySelector('.campo-type').value;
        if (!k) { if (errEl) errEl.textContent = 'Todos los campos deben tener nombre.'; return null; }
        obj[k] = t;
    }
    return obj;
}

function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
}

function escHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
