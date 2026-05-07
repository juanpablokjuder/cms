'use strict';

// ─── Modo: create vs edit ────────────────────────────────────────────────────
const isEdit   = document.getElementById('prod-uuid') !== null && document.getElementById('prod-uuid').value !== '';
const prodUuid = isEdit ? document.getElementById('prod-uuid').value : null;

// ─── Estado global del formulario ────────────────────────────────────────────
let seoAccordion = null;
let varianteIndex = 0;
const varianteImageInputs = {};
let coloresOptions     = [];
let monedasOptions     = [];
let atributosOptions   = [];
let coloresAllForMgr   = [];
let atributosAllForMgr = [];
let colorQuickImageInput = null;

// ─── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initFormTabs();
    await Promise.all([loadSelectData(), loadMonedas()]);
    bindFormEvents();
    bindMgrModals();
    bindAtributosPlantilla();

    seoAccordion = new SeoAccordion({ container: '#seo-accordion-mount', namespace: 'prod-seo' });

    if (isEdit) {
        document.getElementById('page-loading')?.remove();
        document.getElementById('producto-form').style.display = '';
        await loadProductoForEdit();
    }
});

// ─── Tabs del formulario ──────────────────────────────────────────────────────

function initFormTabs() {
    document.querySelectorAll('.form-tab-bar .tab-bar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.formTab;
            document.querySelectorAll('.form-tab-bar .tab-bar-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => { p.style.display = 'none'; });
            btn.classList.add('active');
            const panel = document.getElementById('form-tab-' + target);
            if (panel) panel.style.display = '';
        });
    });
}

function markTabError(formTab, hasError) {
    const btn = document.querySelector(`.form-tab-bar .tab-bar-btn[data-form-tab="${formTab}"]`);
    if (!btn) return;
    btn.classList.toggle('has-error', hasError);
}

function switchToTab(formTab) {
    const btn = document.querySelector(`.form-tab-bar .tab-bar-btn[data-form-tab="${formTab}"]`);
    if (btn) btn.click();
}

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

        fillSelect('prod-condicion', resCond.data ?? [], 'uuid', 'nombre', '— Sin especificar —');
        fillSelect('prod-garantia',  resGar.data ?? [],  'uuid', 'nombre', '— Sin garantía —');
        fillSelect('prod-atributos-plantilla', atributosOptions, 'uuid', 'nombre', '— Sin plantilla —');
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

        if (p.seo) seoAccordion.populate(p.seo);

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
    const tpl   = document.getElementById('tpl-variante');
    const clone = tpl.content.cloneNode(true);
    const card  = clone.querySelector('.variante-card');
    const idx   = varianteIndex++;

    card.dataset.idx  = idx;
    card.dataset.uuid = data?.uuid ?? '';

    const num = document.querySelectorAll('.variante-card').length + 1;
    card.querySelector('.variante-num').textContent = num;
    const badge = card.querySelector('.variante-badge');
    if (badge) badge.textContent = num;

    // Opciones de color
    const selColor = card.querySelector('.variante-color');
    coloresOptions.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.uuid;
        opt.textContent = c.nombre;
        selColor.appendChild(opt);
    });
    if (data?.color_uuid) selColor.value = data.color_uuid;

    // Opciones de moneda
    const selMoneda = card.querySelector('.variante-moneda');
    monedasOptions.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.uuid;
        opt.textContent = `${m.codigo} – ${m.nombre}`;
        selMoneda.appendChild(opt);
    });
    if (data?.moneda_uuid) selMoneda.value = data.moneda_uuid;

    // Valores numéricos
    if (data) {
        card.querySelector('.variante-precio').value    = data.precio    ?? 0;
        card.querySelector('.variante-descuento').value = data.descuento ?? 0;
        card.querySelector('.variante-stock').value     = data.stock     ?? 0;
    }

    // ImageInput
    const imgWrap  = card.querySelector('.variante-imagenes-wrap');
    const imgInputEl = document.createElement('div');
    imgInputEl.id = `variante-img-${idx}`;
    imgWrap.appendChild(imgInputEl);

    document.getElementById('variantes-list').appendChild(clone);
    document.getElementById('variantes-empty').style.display = 'none';

    const imgInput = new ImageInput({ container: `#variante-img-${idx}`, multiple: true });
    varianteImageInputs[idx] = imgInput;

    if (data?.imagenes?.length) {
        data.imagenes.forEach(img => imgInput.setExistingFile({ url: img.url, _archivo_uuid: img.archivo_uuid, _orden: img.orden }));
    }

    // Botón quitar
    card.querySelector('.btn-remove-variante').addEventListener('click', () => {
        card.remove();
        delete varianteImageInputs[idx];
        reindexVariantes();
        const empty = document.getElementById('variantes-empty');
        if (!document.querySelectorAll('.variante-card').length) empty.style.display = '';
    });
}

function reindexVariantes() {
    document.querySelectorAll('.variante-card').forEach((card, i) => {
        card.querySelector('.variante-num').textContent = i + 1;
        const badge = card.querySelector('.variante-badge');
        if (badge) badge.textContent = i + 1;
    });
}

function collectVariantes() {
    const cards = document.querySelectorAll('.variante-card');
    const result = [];
    let valid = true;

    cards.forEach(card => {
        const idx        = Number(card.dataset.idx);
        const uuid       = card.dataset.uuid || undefined;
        const colorUuid  = card.querySelector('.variante-color').value;
        const monedaUuid = card.querySelector('.variante-moneda').value;
        const precio     = parseInt(card.querySelector('.variante-precio').value, 10);
        const descuento  = parseInt(card.querySelector('.variante-descuento').value, 10) || 0;
        const stock      = parseInt(card.querySelector('.variante-stock').value, 10) || 0;

        if (!colorUuid)             { card.querySelector('.variante-color-error').textContent  = 'Seleccione un color.';  valid = false; }
        else                          card.querySelector('.variante-color-error').textContent  = '';
        if (!monedaUuid)            { card.querySelector('.variante-moneda-error').textContent = 'Seleccione una moneda.'; valid = false; }
        else                          card.querySelector('.variante-moneda-error').textContent = '';
        if (isNaN(precio) || precio < 0) { card.querySelector('.variante-precio-error').textContent = 'Precio inválido.'; valid = false; }
        else                              card.querySelector('.variante-precio-error').textContent = '';
        if (isNaN(stock) || stock < 0)   { card.querySelector('.variante-stock-error').textContent  = 'Stock inválido.';  valid = false; }
        else                              card.querySelector('.variante-stock-error').textContent  = '';

        const files    = varianteImageInputs[idx]?.getFiles?.() ?? [];
        const imagenes = files.map((img, i) => {
            if (img.base64)        return { imagen: img.base64, imagen_nombre: img.nombre || null, imagen_alt: img.alt || null, orden: i };
            if (img._archivo_uuid) return { archivo_uuid: img._archivo_uuid, orden: img._orden ?? i };
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
    document.getElementById('prod-atributos-plantilla').addEventListener('change', e => {
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
        input.dataset.atribKey  = key;
        input.dataset.atribType = type;
        group.appendChild(input);
        wrap.appendChild(group);
    });

    wrap.style.display = 'flex';
}

function collectAtributos() {
    const wrap   = document.getElementById('atributos-valores-wrap');
    const inputs = wrap.querySelectorAll('[data-atrib-key]');
    if (!inputs.length) return null;
    const obj = {};
    inputs.forEach(inp => {
        const k = inp.dataset.atribKey;
        const t = inp.dataset.atribType;
        const v = inp.value;
        if (t === 'number')       obj[k] = v === '' ? null : Number(v);
        else if (t === 'boolean') obj[k] = v === '' ? null : v === 'true';
        else                      obj[k] = v === '' ? null : v;
    });
    return obj;
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function submitProducto(e) {
    e.preventDefault();
    const btn    = document.getElementById('btn-submit');
    const nombre = document.getElementById('prod-nombre').value.trim();
    document.getElementById('prod-nombre-error').textContent = '';
    document.getElementById('variantes-error').textContent = '';

    // Limpiar indicadores de error en tabs
    ['general', 'variantes', 'atributos', 'seo'].forEach(t => markTabError(t, false));

    let firstErrorTab = null;

    if (!nombre) {
        document.getElementById('prod-nombre-error').textContent = 'El nombre es requerido.';
        markTabError('general', true);
        firstErrorTab = firstErrorTab ?? 'general';
    }

    const variantes = collectVariantes();
    if (!variantes) {
        markTabError('variantes', true);
        firstErrorTab = firstErrorTab ?? 'variantes';
    } else if (!variantes.length) {
        document.getElementById('variantes-error').textContent = 'Agregue al menos una variante.';
        markTabError('variantes', true);
        firstErrorTab = firstErrorTab ?? 'variantes';
    }

    if (firstErrorTab) {
        switchToTab(firstErrorTab);
        return;
    }

    const seoData = seoAccordion ? seoAccordion.collect() : null;
    const payload = {
        nombre,
        marca:          document.getElementById('prod-marca').value.trim() || null,
        descripcion:    document.getElementById('prod-descripcion').value.trim() || null,
        estado:         document.getElementById('prod-estado').value,
        condicion_uuid: document.getElementById('prod-condicion').value || null,
        garantia_uuid:  document.getElementById('prod-garantia').value  || null,
        atributos_uuid: document.getElementById('prod-atributos-plantilla').value || null,
        atributos:      collectAtributos(),
        variantes,
        ...(seoData ? { seo_data: seoData } : {}),
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
    document.getElementById('btn-gestionar-atributos')?.addEventListener('click', openAtributosMgr);

    document.getElementById('btn-close-modal-colores-mgr')?.addEventListener('click', () => closeMgrModal('modal-colores-mgr'));
    document.getElementById('btn-close-modal-atributos-mgr')?.addEventListener('click', () => closeMgrModal('modal-atributos-mgr'));
    document.getElementById('btn-close-modal-color-form')?.addEventListener('click', () => closeMgrModal('modal-color-form'));
    document.getElementById('btn-close-modal-atributo-form')?.addEventListener('click', () => closeMgrModal('modal-atributo-form'));

    document.getElementById('btn-mgr-nuevo-color')?.addEventListener('click', () => openColorQuickForm(null));
    document.getElementById('btn-mgr-nuevo-atributo')?.addEventListener('click', () => openAtributoQuickForm(null));

    document.getElementById('btn-cancel-color-quick')?.addEventListener('click', () => closeMgrModal('modal-color-form'));
    document.getElementById('btn-cancel-atributo-quick')?.addEventListener('click', () => closeMgrModal('modal-atributo-form'));

    document.getElementById('color-quick-form')?.addEventListener('submit', submitColorQuick);
    document.getElementById('atributo-quick-form')?.addEventListener('submit', submitAtributoQuick);

    document.getElementById('btn-aq-add-campo')?.addEventListener('click', () => addCampoRow('aq-campos-list', {}));

    colorQuickImageInput = new ImageInput({ container: '#cq-imagen-input' });
}

function closeMgrModal(id) {
    document.getElementById(id).style.display = 'none';
}

// ─── Gestión de colores ───────────────────────────────────────────────────────

const ICON_EDIT_SM  = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>`;
const ICON_TRASH_SM = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916"/></svg>`;

async function loadMgrColores() {
    const tbody = document.getElementById('mgr-colores-tbody');
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">Cargando...</td></tr>';
    try {
        const res = await Api.getColoresAll();
        coloresAllForMgr = res.data ?? [];
        if (!coloresAllForMgr.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay colores registrados.</td></tr>';
        } else {
            tbody.innerHTML = coloresAllForMgr.map(c => `
                <tr>
                    <td class="col-img">${c.imagen_url ? `<img src="${escHtml(c.imagen_url)}" class="color-swatch" alt="">` : '<span class="color-swatch-empty">—</span>'}</td>
                    <td>${escHtml(c.nombre)}</td>
                    <td class="col-center">
                        <div class="table-actions" style="justify-content:center">
                            <button class="btn-table-action" title="Editar" onclick="openColorQuickForm('${escHtml(c.uuid)}')">${ICON_EDIT_SM}</button>
                            <button class="btn-table-action danger" title="Eliminar" onclick="mgrDeleteColor('${escHtml(c.uuid)}', '${escHtml(c.nombre.replace(/'/g, "\\'"))}')">${ICON_TRASH_SM}</button>
                        </div>
                    </td>
                </tr>`).join('');
        }
        await refreshColoresOptions();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="table-empty" style="color:var(--color-danger)">${escHtml(e.message)}</td></tr>`;
    }
}

async function refreshColoresOptions() {
    const res = await Api.getColoresAll();
    coloresOptions = res.data ?? [];
    document.querySelectorAll('.variante-color').forEach(sel => {
        const current = sel.value;
        sel.innerHTML = '<option value="">— Seleccionar —</option>';
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
        closeMgrModal('modal-color-form');
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
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">Cargando...</td></tr>';
    try {
        const res = await Api.getProductosAtributosAll();
        atributosAllForMgr = res.data ?? [];
        if (!atributosAllForMgr.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay plantillas registradas.</td></tr>';
        } else {
            tbody.innerHTML = atributosAllForMgr.map(a => `
                <tr>
                    <td><strong>${escHtml(a.nombre)}</strong></td>
                    <td>${Object.keys(a.atributos ?? {}).map(k => `<span class="badge-info">${escHtml(k)}</span>`).join('')}</td>
                    <td class="col-center">
                        <div class="table-actions" style="justify-content:center">
                            <button class="btn-table-action" title="Editar" onclick="openAtributoQuickForm('${escHtml(a.uuid)}')">${ICON_EDIT_SM}</button>
                            <button class="btn-table-action danger" title="Eliminar" onclick="mgrDeleteAtributo('${escHtml(a.uuid)}', '${escHtml(a.nombre.replace(/'/g, "\\'"))}')">${ICON_TRASH_SM}</button>
                        </div>
                    </td>
                </tr>`).join('');
        }
        await refreshAtributosOptions();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="table-empty" style="color:var(--color-danger)">${escHtml(e.message)}</td></tr>`;
    }
}

async function refreshAtributosOptions() {
    const res = await Api.getProductosAtributosAll();
    atributosOptions = res.data ?? [];
    const sel = document.getElementById('prod-atributos-plantilla');
    const current = sel.value;
    sel.innerHTML = '<option value="">— Sin plantilla —</option>';
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
            Object.entries(res.data.atributos ?? {}).forEach(([k, v]) => addCampoRow('aq-campos-list', { key: k, type: v }));
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
        closeMgrModal('modal-atributo-form');
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
        <input type="text" class="form-input campo-key" placeholder="Nombre del campo" value="${escHtml(key)}">
        <select class="form-input campo-type" style="width:130px;flex-shrink:0">
            <option value="string"  ${type === 'string'  ? 'selected' : ''}>Texto</option>
            <option value="number"  ${type === 'number'  ? 'selected' : ''}>Número</option>
            <option value="boolean" ${type === 'boolean' ? 'selected' : ''}>Sí / No</option>
        </select>
        <button type="button" class="btn-table-action danger btn-remove-campo" title="Quitar campo">${ICON_TRASH_SM}</button>
    `;
    row.querySelector('.btn-remove-campo').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function getCamposFromList(containerId, errorId) {
    const eId      = errorId ?? containerId.replace('-list', '-error');
    const container = document.getElementById(containerId);
    const rows      = container.querySelectorAll('.campo-row');
    const errEl     = document.getElementById(eId);
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
