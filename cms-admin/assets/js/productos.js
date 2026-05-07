'use strict';

// SVG icons reutilizables
const ICON_EDIT   = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>`;
const ICON_TRASH  = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>`;

// ─── Estado ──────────────────────────────────────────────────────────────────
const state = {
    productos: { page: 1, limit: 15, total: 0 },
    colores:   { page: 1, limit: 15, total: 0 },
    atributos: { page: 1, limit: 15, total: 0 },
};

let colorImageInput = null;

// ─── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadProductos();
    loadColores();
    loadAtributos();
    bindColorModal();
    bindAtributoModal();
});

// ─── Tabs ────────────────────────────────────────────────────────────────────
function initTabs() {
    document.querySelectorAll('.tab-bar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-bar-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(`tab-${btn.dataset.tab}`).style.display = '';
        });
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS
// ══════════════════════════════════════════════════════════════════════════════

async function loadProductos() {
    const tbody = document.getElementById('productos-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Cargando...</td></tr>';
    try {
        const res = await Api.getProductos(state.productos.page, state.productos.limit);
        const items = res.data?.data ?? res.data ?? [];
        state.productos.total = res.data?.meta?.total ?? res.meta?.total ?? items.length;

        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="table-empty">No hay productos registrados.</td></tr>';
        } else {
            tbody.innerHTML = items.map(p => `
                <tr>
                    <td class="col-img">${p.preview_url
                        ? `<img src="${escHtml(p.preview_url)}" class="table-thumb" alt="${escHtml(p.nombre)}">`
                        : '<span class="no-image"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg></span>'
                    }</td>
                    <td><strong>${escHtml(p.nombre)}</strong></td>
                    <td style="color:var(--color-text-secondary)">${escHtml(p.marca ?? '—')}</td>
                    <td style="color:var(--color-text-secondary)">${escHtml(p.condicion ?? '—')}</td>
                    <td class="col-num">${p.num_variantes ?? 0}</td>
                    <td class="col-center"><span class="badge badge-${p.estado === 'activo' ? 'active' : 'inactive'}">${p.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
                    <td class="col-center">
                        <div class="table-actions" style="justify-content:center">
                            <a href="producto-edit.php?uuid=${encodeURIComponent(p.uuid)}" class="btn-table-action" title="Editar">${ICON_EDIT}</a>
                            <button class="btn-table-action danger" title="Eliminar" onclick="confirmDeleteProducto('${escHtml(p.uuid)}', '${escHtml(p.nombre.replace(/'/g, "\\'"))}')">${ICON_TRASH}</button>
                        </div>
                    </td>
                </tr>`).join('');
        }
        renderPagination('productos-pagination', state.productos, loadProductos);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-empty" style="color:var(--color-danger)">${escHtml(e.message)}</td></tr>`;
    }
}

async function confirmDeleteProducto(uuid, nombre) {
    if (!confirm(`¿Eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
        await Api.deleteProducto(uuid);
        Toast.success('Producto eliminado.');
        loadProductos();
    } catch (e) {
        Toast.error(e.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// COLORES
// ══════════════════════════════════════════════════════════════════════════════

async function loadColores() {
    const tbody = document.getElementById('colores-tbody');
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">Cargando...</td></tr>';
    try {
        const res = await Api.getColores(state.colores.page, state.colores.limit);
        const items = res.data?.data ?? res.data ?? [];
        state.colores.total = res.data?.meta?.total ?? res.meta?.total ?? items.length;

        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay colores registrados.</td></tr>';
        } else {
            tbody.innerHTML = items.map(c => `
                <tr>
                    <td class="col-img">${c.imagen_url
                        ? `<img src="${escHtml(c.imagen_url)}" class="color-swatch" alt="${escHtml(c.nombre)}">`
                        : '<span class="color-swatch-empty">—</span>'
                    }</td>
                    <td>${escHtml(c.nombre)}</td>
                    <td class="col-center">
                        <div class="table-actions" style="justify-content:center">
                            <button class="btn-table-action" title="Editar" onclick="openColorModal('${escHtml(c.uuid)}')">${ICON_EDIT}</button>
                            <button class="btn-table-action danger" title="Eliminar" onclick="confirmDeleteColor('${escHtml(c.uuid)}', '${escHtml(c.nombre.replace(/'/g, "\\'"))}')">${ICON_TRASH}</button>
                        </div>
                    </td>
                </tr>`).join('');
        }
        renderPagination('colores-pagination', state.colores, loadColores);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="table-empty" style="color:var(--color-danger)">${escHtml(e.message)}</td></tr>`;
    }
}

function bindColorModal() {
    document.getElementById('btn-nuevo-color').addEventListener('click', () => openColorModal(null));
    document.getElementById('btn-close-modal-color').addEventListener('click', closeColorModal);
    document.getElementById('btn-cancel-color').addEventListener('click', closeColorModal);
    document.getElementById('color-form').addEventListener('submit', submitColor);
    colorImageInput = new ImageInput({ container: '#color-imagen-input' });
}

function openColorModal(uuid) {
    const modal = document.getElementById('modal-color');
    document.getElementById('color-uuid').value = uuid ?? '';
    document.getElementById('color-nombre').value = '';
    document.getElementById('color-nombre-error').textContent = '';
    document.getElementById('modal-color-title').textContent = uuid ? 'Editar Color' : 'Nuevo Color';
    colorImageInput.reset();
    modal.style.display = 'flex';

    if (uuid) {
        Api.getColor(uuid).then(res => {
            document.getElementById('color-nombre').value = res.data.nombre;
            if (res.data.imagen_uuid) colorImageInput.setExistingFile({ url: res.data.imagen_url, _archivo_uuid: res.data.imagen_uuid });
        }).catch(e => Toast.error(e.message));
    }
}

function closeColorModal() {
    document.getElementById('modal-color').style.display = 'none';
}

async function submitColor(e) {
    e.preventDefault();
    const btn    = document.getElementById('btn-color-submit');
    const uuid   = document.getElementById('color-uuid').value;
    const nombre = document.getElementById('color-nombre').value.trim();
    document.getElementById('color-nombre-error').textContent = '';

    if (!nombre) { document.getElementById('color-nombre-error').textContent = 'El nombre es requerido.'; return; }

    setLoading(btn, true);
    try {
        const payload = { nombre };
        const files = colorImageInput.getFiles();
        const newFile = files.find(f => f.base64);
        if (newFile) {
            payload.imagen = newFile.base64;
            if (newFile.nombre) payload.imagen_nombre = newFile.nombre;
            if (newFile.alt)    payload.imagen_alt    = newFile.alt;
        }

        if (uuid) {
            await Api.updateColor(uuid, payload);
            Toast.success('Color actualizado.');
        } else {
            await Api.createColor(payload);
            Toast.success('Color creado.');
        }
        closeColorModal();
        loadColores();
    } catch (e) {
        Toast.error(e.message);
    } finally {
        setLoading(btn, false);
    }
}

async function confirmDeleteColor(uuid, nombre) {
    if (!confirm(`¿Eliminar el color "${nombre}"?`)) return;
    try {
        await Api.deleteColor(uuid);
        Toast.success('Color eliminado.');
        loadColores();
    } catch (e) {
        Toast.error(e.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ATRIBUTOS
// ══════════════════════════════════════════════════════════════════════════════

async function loadAtributos() {
    const tbody = document.getElementById('atributos-tbody');
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">Cargando...</td></tr>';
    try {
        const res = await Api.getProductosAtributos(state.atributos.page, state.atributos.limit);
        const items = res.data?.data ?? res.data ?? [];
        state.atributos.total = res.data?.meta?.total ?? res.meta?.total ?? items.length;

        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay plantillas de atributos.</td></tr>';
        } else {
            tbody.innerHTML = items.map(a => `
                <tr>
                    <td><strong>${escHtml(a.nombre)}</strong></td>
                    <td>${Object.entries(a.atributos ?? {}).map(([k, v]) => `<span class="badge-info">${escHtml(k)}: ${escHtml(v)}</span>`).join('')}</td>
                    <td class="col-center">
                        <div class="table-actions" style="justify-content:center">
                            <button class="btn-table-action" title="Editar" onclick="openAtributoModal('${escHtml(a.uuid)}')">${ICON_EDIT}</button>
                            <button class="btn-table-action danger" title="Eliminar" onclick="confirmDeleteAtributo('${escHtml(a.uuid)}', '${escHtml(a.nombre.replace(/'/g, "\\'"))}')">${ICON_TRASH}</button>
                        </div>
                    </td>
                </tr>`).join('');
        }
        renderPagination('atributos-pagination', state.atributos, loadAtributos);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="table-empty" style="color:var(--color-danger)">${escHtml(e.message)}</td></tr>`;
    }
}

function bindAtributoModal() {
    document.getElementById('btn-nuevo-atributo').addEventListener('click', () => openAtributoModal(null));
    document.getElementById('btn-close-modal-atributo').addEventListener('click', closeAtributoModal);
    document.getElementById('btn-cancel-atributo').addEventListener('click', closeAtributoModal);
    document.getElementById('btn-add-campo').addEventListener('click', () => addCampoRow('atributo-campos-list', {}));
    document.getElementById('atributo-form').addEventListener('submit', submitAtributo);
}

function openAtributoModal(uuid) {
    const modal = document.getElementById('modal-atributo');
    document.getElementById('atributo-uuid').value = uuid ?? '';
    document.getElementById('atributo-nombre').value = '';
    document.getElementById('atributo-nombre-error').textContent = '';
    document.getElementById('atributo-campos-error').textContent = '';
    document.getElementById('atributo-campos-list').innerHTML = '';
    document.getElementById('modal-atributo-title').textContent = uuid ? 'Editar Plantilla' : 'Nueva Plantilla de Atributos';
    modal.style.display = 'flex';

    if (uuid) {
        Api.getProductoAtributo(uuid).then(res => {
            document.getElementById('atributo-nombre').value = res.data.nombre;
            Object.entries(res.data.atributos ?? {}).forEach(([k, v]) => addCampoRow('atributo-campos-list', { key: k, type: v }));
        }).catch(e => Toast.error(e.message));
    }
}

function closeAtributoModal() {
    document.getElementById('modal-atributo').style.display = 'none';
}

async function submitAtributo(e) {
    e.preventDefault();
    const btn    = document.getElementById('btn-atributo-submit');
    const uuid   = document.getElementById('atributo-uuid').value;
    const nombre = document.getElementById('atributo-nombre').value.trim();
    document.getElementById('atributo-nombre-error').textContent = '';
    document.getElementById('atributo-campos-error').textContent = '';

    if (!nombre) { document.getElementById('atributo-nombre-error').textContent = 'El nombre es requerido.'; return; }

    const campos = getCamposFromList('atributo-campos-list');
    if (!campos) return;

    setLoading(btn, true);
    try {
        if (uuid) {
            await Api.updateProductoAtributo(uuid, { nombre, atributos: campos });
            Toast.success('Plantilla actualizada.');
        } else {
            await Api.createProductoAtributo({ nombre, atributos: campos });
            Toast.success('Plantilla creada.');
        }
        closeAtributoModal();
        loadAtributos();
    } catch (e) {
        Toast.error(e.message);
    } finally {
        setLoading(btn, false);
    }
}

async function confirmDeleteAtributo(uuid, nombre) {
    if (!confirm(`¿Eliminar la plantilla "${nombre}"?`)) return;
    try {
        await Api.deleteProductoAtributo(uuid);
        Toast.success('Plantilla eliminada.');
        loadAtributos();
    } catch (e) {
        Toast.error(e.message);
    }
}

// ─── Helpers: campos de atributo ──────────────────────────────────────────────

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
        <button type="button" class="btn-table-action danger btn-remove-campo" title="Quitar campo">${ICON_TRASH}</button>
    `;
    row.querySelector('.btn-remove-campo').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function getCamposFromList(containerId) {
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.campo-row');
    const errorId = containerId.replace('-list', '-error');
    if (!rows.length) {
        document.getElementById(errorId).textContent = 'Agregue al menos un campo.';
        return null;
    }
    const obj = {};
    for (const row of rows) {
        const k = row.querySelector('.campo-key').value.trim();
        const t = row.querySelector('.campo-type').value;
        if (!k) {
            document.getElementById(errorId).textContent = 'Todos los campos deben tener nombre.';
            return null;
        }
        obj[k] = t;
    }
    return obj;
}

// ─── Helpers generales ────────────────────────────────────────────────────────

function renderPagination(containerId, st, loadFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const totalPages = Math.ceil(st.total / st.limit) || 1;
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = '<div class="pagination"><div class="pagination-controls">';
    html += `<button class="pagination-btn" ${st.page <= 1 ? 'disabled' : ''} onclick="changePage('${containerId}', ${st.page - 1})">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - st.page) <= 1) {
            html += `<button class="pagination-btn ${i === st.page ? 'active' : ''}" onclick="changePage('${containerId}', ${i})">${i}</button>`;
        } else if (Math.abs(i - st.page) === 2) {
            html += `<span class="pagination-btn" style="pointer-events:none">…</span>`;
        }
    }
    html += `<button class="pagination-btn" ${st.page >= totalPages ? 'disabled' : ''} onclick="changePage('${containerId}', ${st.page + 1})">›</button>`;
    html += `</div><span class="pagination-info">Página ${st.page} de ${totalPages} · ${st.total} registros</span></div>`;
    container.innerHTML = html;
}

function changePage(containerId, page) {
    if (containerId === 'productos-pagination') { state.productos.page = page; loadProductos(); }
    else if (containerId === 'colores-pagination') { state.colores.page = page; loadColores(); }
    else if (containerId === 'atributos-pagination') { state.atributos.page = page; loadAtributos(); }
}

function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
}

function escHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
