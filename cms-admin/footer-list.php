<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user        = getCurrentUser();
$parts       = explode(' ', $user['name'] ?? '');
$initials    = strtoupper(substr($parts[0],0,1).(isset($parts[1])?substr($parts[1],0,1):''));
$currentPage = 'footer';
$headerTitle = 'Footer';
$pageTitle   = 'Footer';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/footer.css">
</head>
<body>
<div class="app-layout" id="app-layout">
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
    <?php require_once __DIR__ . '/includes/header.php'; ?>

    <main class="main-content">
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="page-title">Configuración del Footer</h2>
                <p class="page-subtitle">Gestione las versiones del footer del sitio</p>
            </div>
            <a href="footer-edit.php" class="btn btn-primary"><span>+</span><span>Nuevo Footer</span></a>
        </div>

        <div class="card">
            <div class="table-wrapper">
                <table class="data-table" id="footer-table">
                    <thead>
                        <tr>
                            <th>Copyright</th>
                            <th style="width:90px">Columnas</th>
                            <th style="width:80px">Redes</th>
                            <th style="width:80px">Legales</th>
                            <th style="width:110px">Fecha</th>
                            <th style="width:100px">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="footer-tbody"></tbody>
                </table>
            </div>
            <div class="card-footer">
                <div class="pagination">
                    <span class="pagination-info" id="footer-pagination-info">Cargando...</span>
                    <div class="pagination-controls">
                        <button class="pagination-btn" id="footer-pagination-prev" disabled>←</button>
                        <div id="footer-pagination-numbers"></div>
                        <button class="pagination-btn" id="footer-pagination-next" disabled>→</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Delete Modal -->
<div class="modal-backdrop" id="delete-modal">
    <div class="modal" style="max-width:420px">
        <div class="modal-header">
            <h3 class="modal-title">Confirmar Eliminación</h3>
            <button class="modal-close" data-modal-close>✕</button>
        </div>
        <div class="modal-body" style="text-align:center">
            <div class="confirm-icon danger">🗑️</div>
            <p class="confirm-text">¿Está seguro que desea eliminar esta configuración de footer?<br><strong id="delete-footer-name"></strong></p>
        </div>
        <div class="modal-footer" style="justify-content:center">
            <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-delete">
                <span class="spinner"></span><span class="btn-text">Eliminar</span>
            </button>
        </div>
    </div>
</div>

<script src="assets/js/toast.js"></script>
<script src="assets/js/modal.js"></script>
<script src="assets/js/api.js"></script>
<script src="assets/js/footer.js"></script>
<?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>
</html>
