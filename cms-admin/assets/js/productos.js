'use strict';

// ─── Estado ──────────────────────────────────────────────────────────────────
const state = {
    productos:  { page: 1, limit: 15, total: 0 },
    colores:    { page: 1, limit: 15, total: 0 },
    atributos:  { page: 1, limit: 15, total: 0 },
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
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).style.display = '';
        });
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS
// ══════════════════════════════════════════════════════════════════════════════

async function loadProductos() {
    const tbody = document.getElementById('productos-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';
    try {
        const res = await Api.getProductos(state.productos.page, state.productos.limit);
        const items = res.data;
        state.productos.total = res.meta?.total ?? items.length;
        if (items.length == 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay productos.</td></tr>';
        } else {
            tbody.innerHTML = items.data.map(p => `
                <tr>
                    <td>${p.preview_url ? `<img src="${escHtml(p.preview_url)}" class="table-thumb" alt="">` : '<span class="no-image">—</span>'}</td>
                    <td>${escHtml(p.nombre)}</td>
                    <td>${escHtml(p.marca ?? '—')}</td>
                    <td>${escHtml(p.condicion ?? '—')}</td>
                    <td><span class="badge">${p.num_variantes}</span></td>
                    <td><span class="badge badge-${p.estado === 'activo' ? 'success' : 'warning'}">${escHtml(p.estado)}</span></td>
                    <td class="table-actions">
                        <a href="producto-edit.php?uuid=${encodeURIComponent(p.uuid)}" class="btn btn-secondary btn-xs">✏️ Editar</a>
                        <button class="btn btn-danger btn-xs" onclick="confirmDeleteProducto('${escHtml(p.uuid)}', '${escHtml(p.nombre)}')">🗑️ Eliminar</button>
                    </td>
                </tr>`).join('');
        }
        renderPagination('productos-pagination', state.productos, loadProductos);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${escHtml(e.message)}</td></tr>`;
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
    console.log('Cargando colores...'); // Debug
    const tbody = document.getElementById('colores-tbody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';
    try {
        const res = await Api.getColores(state.colores.page, state.colores.limit);
        const items = res.data;
        console.log('Colores cargados:', items); // Debug
        state.colores.total = res.meta?.total ?? items.length;
        if (!items.length == 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay colores.</td></tr>';
        } else {
            console.log('Renderizando colores...'); // Debug
            console.log('Items a renderizar:', items); // Debug
            tbody.innerHTML = items.data.map(c => `
                <tr>
                    <td>${c.imagen_url ? `<img src="${escHtml(c.imagen_url)}" class="color-swatch" alt="">` : '<span class="color-swatch-empty">—</span>'}</td>
                    <td>${escHtml(c.nombre)}</td>
                    <td class="table-actions">
                        <button class="btn btn-secondary btn-xs" onclick="openColorModal('${escHtml(c.uuid)}')">✏️ Editar</button>
                        <button class="btn btn-danger btn-xs" onclick="confirmDeleteColor('${escHtml(c.uuid)}', '${escHtml(c.nombre)}')">🗑️</button>
                    </td>
                </tr>`).join('');
        }
        renderPagination('colores-pagination', state.colores, loadColores);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${escHtml(e.message)}</td></tr>`;
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
    const btn   = document.getElementById('btn-color-submit');
    const uuid  = document.getElementById('color-uuid').value;
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
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';
    try {
        const res = await Api.getProductosAtributos(state.atributos.page, state.atributos.limit);
        const items = res.data;
        state.atributos.total = res.meta?.total ?? items.length;
        if (items.length == 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay plantillas.</td></tr>';
        } else {
            tbody.innerHTML = items.data.map(a => `
                <tr>
                    <td>${escHtml(a.nombre)}</td>
                    <td>${Object.entries(a.atributos).map(([k, v]) => `<span class="badge badge-info">${escHtml(k)}: ${escHtml(v)}</span>`).join(' ')}</td>
                    <td class="table-actions">
                        <button class="btn btn-secondary btn-xs" onclick="openAtributoModal('${escHtml(a.uuid)}')">✏️ Editar</button>
                        <button class="btn btn-danger btn-xs" onclick="confirmDeleteAtributo('${escHtml(a.uuid)}', '${escHtml(a.nombre)}')">🗑️</button>
                    </td>
                </tr>`).join('');
        }
        renderPagination('atributos-pagination', state.atributos, loadAtributos);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${escHtml(e.message)}</td></tr>`;
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
            Object.entries(res.data.atributos).forEach(([k, v]) => addCampoRow('atributo-campos-list', { key: k, type: v }));
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

// ─── Helpers campos de atributo ───────────────────────────────────────────────

function addCampoRow(containerId, { key = '', type = 'string' } = {}) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'campo-row';
    row.innerHTML = `
        <input type="text"   class="form-input campo-key"  placeholder="Nombre del campo" value="${escHtml(key)}" style="flex:1">
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

function getCamposFromList(containerId) {
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.campo-row');
    if (!rows.length) {
        document.getElementById(containerId.replace('-list', '-error')).textContent = 'Agregue al menos un campo.';
        return null;
    }
    const obj = {};
    for (const row of rows) {
        const k = row.querySelector('.campo-key').value.trim();
        const t = row.querySelector('.campo-type').value;
        if (!k) { document.getElementById(containerId.replace('-list', '-error')).textContent = 'Todos los campos deben tener nombre.'; return null; }
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
    let html = '<div class="pagination">';
    if (st.page > 1) html += `<button class="btn btn-secondary btn-sm" onclick="changePage('${containerId}', ${st.page - 1})">‹ Anterior</button>`;
    html += `<span class="pagination-info">Página ${st.page} de ${totalPages}</span>`;
    if (st.page < totalPages) html += `<button class="btn btn-secondary btn-sm" onclick="changePage('${containerId}', ${st.page + 1})">Siguiente ›</button>`;
    html += '</div>';
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
