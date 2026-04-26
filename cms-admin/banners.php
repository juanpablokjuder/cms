<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'banners';
$headerTitle = 'Banners';
$pageTitle = 'Banners';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/banners.css">
</head>
<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Gestión de Banners</h2>
                    <p class="page-subtitle">Administre las imágenes y textos de las páginas del sitio</p>
                </div>
                <a href="banner-create.php" class="btn btn-primary">
                    <span>+</span>
                    <span>Nuevo Banner</span>
                </a>
            </div>

            <div class="card">
                <div class="table-wrapper">
                    <table class="data-table" id="banners-table">
                        <thead>
                            <tr>
                                <th style="width:100px">Imagen</th>
                                <th>Página</th>
                                <th>Título (H1)</th>
                                <th style="width:70px">Orden</th>
                                <th style="width:100px">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="banners-tbody"></tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <div class="pagination">
                        <span class="pagination-info" id="banners-pagination-info">Cargando...</span>
                        <div class="pagination-controls">
                            <button class="pagination-btn" id="banners-pagination-prev" disabled aria-label="Página anterior">←</button>
                            <div id="banners-pagination-numbers"></div>
                            <button class="pagination-btn" id="banners-pagination-next" disabled aria-label="Página siguiente">→</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-backdrop" id="delete-modal">
        <div class="modal" style="max-width:420px">
            <div class="modal-header">
                <h3 class="modal-title">Confirmar Eliminación</h3>
                <button class="modal-close" data-modal-close aria-label="Cerrar">✕</button>
            </div>
            <div class="modal-body" style="text-align:center">
                <div class="confirm-icon danger">🗑️</div>
                <p class="confirm-text">
                    ¿Está seguro que desea eliminar el banner<br>
                    <strong id="delete-banner-name"></strong>?
                </p>
                <p class="confirm-text" style="margin-top:var(--space-2);font-size:var(--font-size-xs);">
                    Esta acción no se puede deshacer.
                </p>
            </div>
            <div class="modal-footer" style="justify-content:center">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
                <button type="button" class="btn btn-danger" id="btn-confirm-delete">
                    <span class="spinner"></span>
                    <span class="btn-text">Eliminar</span>
                </button>
            </div>
        </div>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/banners.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>
</html>
