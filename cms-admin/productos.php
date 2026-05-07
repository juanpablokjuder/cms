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

            <!-- Tabs -->
            <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4)">
                <button class="btn btn-secondary tab-btn active" data-tab="productos">📦 Productos</button>
                <button class="btn btn-secondary tab-btn" data-tab="colores">🎨 Colores</button>
                <button class="btn btn-secondary tab-btn" data-tab="atributos">🏷️ Atributos</button>
            </div>

            <!-- TAB: Productos -->
            <div class="tab-content" id="tab-productos">
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
                        <span class="card-header-title">Catálogo de Productos</span>
                        <a href="producto-create.php" class="btn btn-primary btn-sm">+ Nuevo Producto</a>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="productos-table">
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Marca</th>
                                    <th>Condición</th>
                                    <th>Variantes</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="productos-tbody">
                                <tr>
                                    <td colspan="7" class="text-center">Cargando...</td>
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
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
                        <span class="card-header-title">Colores</span>
                        <button class="btn btn-primary btn-sm" id="btn-nuevo-color">+ Nuevo Color</button>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="colores-table">
                            <thead>
                                <tr>
                                    <th>Muestra</th>
                                    <th>Nombre</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="colores-tbody">
                                <tr>
                                    <td colspan="3" class="text-center">Cargando...</td>
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
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
                        <span class="card-header-title">Plantillas de Atributos</span>
                        <button class="btn btn-primary btn-sm" id="btn-nuevo-atributo">+ Nueva Plantilla</button>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="atributos-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Campos</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="atributos-tbody">
                                <tr>
                                    <td colspan="3" class="text-center">Cargando...</td>
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