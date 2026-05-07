<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'productos';
$headerTitle = 'Productos';
$pageTitle = 'Productos';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/image-input.css">
    <link rel="stylesheet" href="assets/css/productos.css">
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Productos</h2>
                    <p class="page-subtitle">Gestione el catálogo de productos, colores y plantillas de atributos</p>
                </div>
            </div>

            <!-- Tab Bar -->
            <div class="tab-bar" role="tablist">
                <button class="tab-bar-btn active" data-tab="productos" role="tab" aria-selected="true">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
                    Productos
                </button>
                <button class="tab-bar-btn" data-tab="colores" role="tab" aria-selected="false">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"/></svg>
                    Colores
                </button>
                <button class="tab-bar-btn" data-tab="atributos" role="tab" aria-selected="false">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>
                    Atributos
                </button>
            </div>

            <!-- TAB: Productos -->
            <div class="tab-content" id="tab-productos">
                <div class="card">
                    <div class="card-header">
                        <span class="card-header-title">Catálogo de Productos</span>
                        <a href="producto-create.php" class="btn btn-primary btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                            Nuevo Producto
                        </a>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="productos-table">
                            <thead>
                                <tr>
                                    <th class="col-img">Imagen</th>
                                    <th>Nombre</th>
                                    <th>Marca</th>
                                    <th>Condición</th>
                                    <th class="col-num">Variantes</th>
                                    <th class="col-center">Estado</th>
                                    <th class="col-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="productos-tbody">
                                <tr>
                                    <td colspan="7" class="table-empty">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer" id="productos-pagination"></div>
                </div>
            </div>

            <!-- TAB: Colores -->
            <div class="tab-content" id="tab-colores" style="display:none">
                <div class="card">
                    <div class="card-header">
                        <span class="card-header-title">Colores</span>
                        <button class="btn btn-primary btn-sm" id="btn-nuevo-color">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                            Nuevo Color
                        </button>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="colores-table">
                            <thead>
                                <tr>
                                    <th class="col-img">Muestra</th>
                                    <th>Nombre</th>
                                    <th class="col-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="colores-tbody">
                                <tr>
                                    <td colspan="3" class="table-empty">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer" id="colores-pagination"></div>
                </div>
            </div>

            <!-- TAB: Atributos -->
            <div class="tab-content" id="tab-atributos" style="display:none">
                <div class="card">
                    <div class="card-header">
                        <span class="card-header-title">Plantillas de Atributos</span>
                        <button class="btn btn-primary btn-sm" id="btn-nuevo-atributo">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                            Nueva Plantilla
                        </button>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="atributos-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Campos</th>
                                    <th class="col-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="atributos-tbody">
                                <tr>
                                    <td colspan="3" class="table-empty">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer" id="atributos-pagination"></div>
                </div>
            </div>
        </main>
    </div>

    <!-- Modal: Color -->
    <div class="modal-overlay" id="modal-color" style="display:none">
        <div class="modal" style="max-width:480px">
            <div class="modal-header">
                <h3 class="modal-title" id="modal-color-title">Nuevo Color</h3>
                <button class="modal-close" id="btn-close-modal-color">✕</button>
            </div>
            <div class="modal-body">
                <form id="color-form" novalidate style="display:flex;flex-direction:column;gap:var(--space-4)">
                    <input type="hidden" id="color-uuid">
                    <div class="form-group">
                        <label class="form-label" for="color-nombre">Nombre <span class="required">*</span></label>
                        <input type="text" id="color-nombre" class="form-input" maxlength="100" required>
                        <span class="form-error" id="color-nombre-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Imagen / Muestra</label>
                        <div id="color-imagen-input"></div>
                    </div>
                    <div style="display:flex;gap:var(--space-3)">
                        <button type="submit" class="btn btn-primary" id="btn-color-submit">
                            <span class="spinner"></span><span class="btn-text">Guardar</span>
                        </button>
                        <button type="button" class="btn btn-secondary" id="btn-cancel-color">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal: Atributo -->
    <div class="modal-overlay" id="modal-atributo" style="display:none">
        <div class="modal" style="max-width:560px">
            <div class="modal-header">
                <h3 class="modal-title" id="modal-atributo-title">Nueva Plantilla de Atributos</h3>
                <button class="modal-close" id="btn-close-modal-atributo">✕</button>
            </div>
            <div class="modal-body">
                <form id="atributo-form" novalidate style="display:flex;flex-direction:column;gap:var(--space-4)">
                    <input type="hidden" id="atributo-uuid">
                    <div class="form-group">
                        <label class="form-label" for="atributo-nombre">Nombre <span class="required">*</span></label>
                        <input type="text" id="atributo-nombre" class="form-input" maxlength="255" required>
                        <span class="form-error" id="atributo-nombre-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Campos de la plantilla <span class="required">*</span></label>
                        <div id="atributo-campos-list" style="display:flex;flex-direction:column;gap:var(--space-2)">
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-add-campo"
                            style="margin-top:var(--space-2)">+ Agregar campo</button>
                        <span class="form-error" id="atributo-campos-error"></span>
                    </div>
                    <div style="display:flex;gap:var(--space-3)">
                        <button type="submit" class="btn btn-primary" id="btn-atributo-submit">
                            <span class="spinner"></span><span class="btn-text">Guardar</span>
                        </button>
                        <button type="button" class="btn btn-secondary" id="btn-cancel-atributo">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="toast-container"></div>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/image-input.js"></script>
    <script src="assets/js/productos.js"></script>
</body>

</html>
