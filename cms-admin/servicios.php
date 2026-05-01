<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'servicios';
$headerTitle = 'Servicios';
$pageTitle = 'Servicios';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/servicios.css">
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Servicios</h2>
                    <p class="page-subtitle">Gestione el contenido principal, categorías e items de servicios</p>
                </div>
            </div>

            <!-- ─── Encabezado principal (singleton) ─────────────────────── -->
            <div class="card" style="margin-bottom:var(--space-5)">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
                    <span class="card-header-title">Encabezado de la Sección</span>
                    <button class="btn btn-primary btn-sm" id="btn-edit-encabezado">✏️ Editar</button>
                </div>
                <div class="card-body" id="encabezado-display">
                    <p style="color:var(--color-text-tertiary);font-size:var(--font-size-sm)">Cargando...</p>
                </div>
                <!-- Formulario inline (oculto por defecto) -->
                <div class="card-body" id="encabezado-form-wrap"
                    style="display:none;border-top:1px solid var(--color-border)">
                    <form id="encabezado-form" novalidate style="display:flex;flex-direction:column;gap:var(--space-4)">
                        <div class="form-group">
                            <label class="form-label" for="enc-titulo">Título <span class="required">*</span></label>
                            <input type="text" id="enc-titulo" class="form-input" maxlength="255" required>
                            <span class="form-error" id="enc-titulo-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="enc-subtitulo">Subtítulo</label>
                            <input type="text" id="enc-subtitulo" class="form-input" maxlength="500">
                        </div>
                        <div style="display:flex;gap:var(--space-3)">
                            <button type="submit" class="btn btn-primary" id="btn-encabezado-submit">
                                <span class="spinner"></span><span class="btn-text">Guardar</span>
                            </button>
                            <button type="button" class="btn btn-secondary" id="btn-cancel-encabezado">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ─── Tabs ────────────────────────────────────────────────── -->
            <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4)">
                <button class="btn btn-secondary tab-btn active" data-tab="categorias">📂 Categorías</button>
                <button class="btn btn-secondary tab-btn" data-tab="items">📦 Items</button>
            </div>

            <!-- ─── TAB: Categorías ─────────────────────────────────────── -->
            <div class="tab-content" id="tab-categorias">
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
                        <span class="card-header-title">Categorías</span>
                        <a href="servicio-categoria-create.php" class="btn btn-primary btn-sm">+ Nueva Categoría</a>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="categorias-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th style="width:80px;text-align:center">Orden</th>
                                    <th style="width:90px;text-align:center">Estado</th>
                                    <th style="width:100px">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="categorias-tbody"></tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <div class="pagination">
                            <span class="pagination-info" id="cat-pagination-info">Cargando...</span>
                            <div class="pagination-controls">
                                <button class="pagination-btn" id="cat-pagination-prev" disabled>←</button>
                                <div id="cat-pagination-numbers"></div>
                                <button class="pagination-btn" id="cat-pagination-next" disabled>→</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ─── TAB: Items ───────────────────────────────────────────── -->
            <div class="tab-content" id="tab-items" style="display:none">
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
                        <span class="card-header-title">Items de Servicio</span>
                        <a href="servicio-item-create.php" class="btn btn-primary btn-sm">+ Nuevo Item</a>
                    </div>
                    <div class="table-wrapper">
                        <table class="data-table" id="items-table">
                            <thead>
                                <tr>
                                    <th style="width:80px">Imagen</th>
                                    <th>Título</th>
                                    <th>Categoría</th>
                                    <th style="width:120px;text-align:right">Precio</th>
                                    <th style="width:90px;text-align:center">Estado</th>
                                    <th style="width:100px">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="items-tbody"></tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <div class="pagination">
                            <span class="pagination-info" id="items-pagination-info">Cargando...</span>
                            <div class="pagination-controls">
                                <button class="pagination-btn" id="items-pagination-prev" disabled>←</button>
                                <div id="items-pagination-numbers"></div>
                                <button class="pagination-btn" id="items-pagination-next" disabled>→</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Delete Categoria Modal -->
    <div class="modal-backdrop" id="delete-cat-modal">
        <div class="modal" style="max-width:420px">
            <div class="modal-header">
                <h3 class="modal-title">Eliminar Categoría</h3>
                <button class="modal-close" data-modal-close>✕</button>
            </div>
            <div class="modal-body" style="text-align:center">
                <div class="confirm-icon danger">🗑️</div>
                <p class="confirm-text">¿Eliminar la categoría <strong id="delete-cat-name"></strong>?</p>
                <p class="confirm-text" style="font-size:var(--font-size-xs);margin-top:var(--space-2)">Esta acción no
                    se puede deshacer.</p>
            </div>
            <div class="modal-footer" style="justify-content:center">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
                <button type="button" class="btn btn-danger" id="btn-confirm-delete-cat">
                    <span class="spinner"></span><span class="btn-text">Eliminar</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Delete Item Modal -->
    <div class="modal-backdrop" id="delete-item-modal">
        <div class="modal" style="max-width:420px">
            <div class="modal-header">
                <h3 class="modal-title">Eliminar Item</h3>
                <button class="modal-close" data-modal-close>✕</button>
            </div>
            <div class="modal-body" style="text-align:center">
                <div class="confirm-icon danger">🗑️</div>
                <p class="confirm-text">¿Eliminar el item <strong id="delete-item-name"></strong>?</p>
                <p class="confirm-text" style="font-size:var(--font-size-xs);margin-top:var(--space-2)">Esta acción no
                    se puede deshacer.</p>
            </div>
            <div class="modal-footer" style="justify-content:center">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
                <button type="button" class="btn btn-danger" id="btn-confirm-delete-item">
                    <span class="spinner"></span><span class="btn-text">Eliminar</span>
                </button>
            </div>
        </div>
    </div>

    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/servicios.js"></script>
    <script>document.addEventListener('DOMContentLoaded', () => Servicios.init());</script>
</body>

</html>