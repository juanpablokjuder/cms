<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'servicios';
$headerTitle = 'Nueva Categoría';
$pageTitle = 'Nueva Categoría';
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
                    <h2 class="page-title">Nueva Categoría</h2>
                    <p class="page-subtitle">Complete el formulario para crear una nueva categoría de servicios</p>
                </div>
                <a href="servicios.php" class="btn btn-secondary">← Volver</a>
            </div>

            <form id="categoria-form" novalidate>
                <div style="max-width:600px">
                    <div class="card">
                        <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                            <div class="form-group">
                                <label class="form-label" for="cat-nombre">Nombre <span
                                        class="required">*</span></label>
                                <input type="text" id="cat-nombre" class="form-input"
                                    placeholder="Nombre de la categoría" maxlength="255" required>
                                <span class="form-error" id="cat-nombre-error"></span>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="cat-orden">Orden</label>
                                <input type="number" id="cat-orden" class="form-input" value="0" min="0" step="1">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="cat-estado">Estado</label>
                                <select id="cat-estado" class="form-input">
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                            <div style="display:flex;gap:var(--space-3)">
                                <button type="submit" class="btn btn-primary" id="cat-form-submit">
                                    <span class="spinner"></span><span class="btn-text">Crear Categoría</span>
                                </button>
                                <a href="servicios.php" class="btn btn-secondary">Cancelar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    </div>

    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/servicio-categoria-form.js"></script>
    <script>document.addEventListener('DOMContentLoaded', () => ServicioCategoriaForm.init());</script>
</body>

</html>