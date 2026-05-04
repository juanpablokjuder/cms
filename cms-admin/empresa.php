<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user        = getCurrentUser();
$parts       = explode(' ', $user['name'] ?? '');
$initials    = strtoupper(substr($parts[0],0,1).(isset($parts[1])?substr($parts[1],0,1):''));
$currentPage = 'empresa';
$headerTitle = 'Empresa';
$pageTitle   = 'Datos de la Empresa';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/empresa.css">
</head>
<body>
<div class="app-layout" id="app-layout">
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
    <?php require_once __DIR__ . '/includes/header.php'; ?>

    <main class="main-content">
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="page-title">Datos de la Empresa</h2>
                <p class="page-subtitle">Información institucional de contacto del sitio</p>
            </div>
            <!-- El botón de eliminar solo aparece si ya existe un registro -->
            <button type="button" class="btn btn-danger" id="btn-delete-empresa" style="display:none">
                🗑️ Eliminar registro
            </button>
        </div>

        <!-- Estado de carga inicial -->
        <div id="empresa-loading" class="empresa-loading-state">
            <div class="skeleton skeleton-cell" style="width:100%;height:56px;border-radius:var(--radius-lg)"></div>
            <div class="skeleton skeleton-cell" style="width:100%;height:56px;border-radius:var(--radius-lg)"></div>
            <div class="skeleton skeleton-cell" style="width:100%;height:56px;border-radius:var(--radius-lg)"></div>
            <div class="skeleton skeleton-cell" style="width:100%;height:56px;border-radius:var(--radius-lg)"></div>
        </div>

        <!-- Formulario -->
        <div class="card" id="empresa-card" style="display:none;max-width:640px">
            <div class="card-header">
                <span class="card-header-title" id="empresa-card-title">Información de la Empresa</span>
                <span class="empresa-status-badge" id="empresa-status-badge"></span>
            </div>
            <form id="empresa-form" novalidate>
                <div class="card-body empresa-form-body">

                    <div class="form-group">
                        <label class="form-label" for="empresa-nombre">
                            Nombre <span class="required">*</span>
                        </label>
                        <div class="empresa-input-wrapper">
                            <span class="empresa-input-icon">🏢</span>
                            <input
                                type="text"
                                id="empresa-nombre"
                                class="form-input empresa-input-with-icon"
                                placeholder="Nombre de la empresa"
                                maxlength="255"
                                required
                            >
                        </div>
                        <span class="form-error" id="empresa-nombre-error"></span>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="empresa-telefono">Teléfono</label>
                        <div class="empresa-input-wrapper">
                            <span class="empresa-input-icon">📞</span>
                            <input
                                type="tel"
                                id="empresa-telefono"
                                class="form-input empresa-input-with-icon"
                                placeholder="+54 11 1234-5678"
                                maxlength="100"
                            >
                        </div>
                        <span class="form-error" id="empresa-telefono-error"></span>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="empresa-mail">Email</label>
                        <div class="empresa-input-wrapper">
                            <span class="empresa-input-icon">✉️</span>
                            <input
                                type="email"
                                id="empresa-mail"
                                class="form-input empresa-input-with-icon"
                                placeholder="contacto@empresa.com"
                                maxlength="255"
                            >
                        </div>
                        <span class="form-error" id="empresa-mail-error"></span>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="empresa-direccion">Dirección</label>
                        <div class="empresa-input-wrapper empresa-input-wrapper--textarea">
                            <span class="empresa-input-icon empresa-input-icon--top">📍</span>
                            <textarea
                                id="empresa-direccion"
                                class="form-input empresa-input-with-icon"
                                placeholder="Av. Principal 123, Ciudad, País"
                                maxlength="500"
                                rows="2"
                                style="height:auto;padding-top:var(--space-3);padding-bottom:var(--space-3)"
                            ></textarea>
                        </div>
                        <span class="form-error" id="empresa-direccion-error"></span>
                    </div>

                </div>
                <div class="card-footer">
                    <div class="empresa-footer-meta" id="empresa-footer-meta"></div>
                    <button type="submit" class="btn btn-primary" id="empresa-form-submit">
                        <span class="spinner"></span>
                        <span class="btn-text">Guardar</span>
                    </button>
                </div>
            </form>
        </div>

    </main>
</div>

<!-- Delete Modal -->
<div class="modal-backdrop" id="delete-modal">
    <div class="modal" style="max-width:420px">
        <div class="modal-header">
            <h3 class="modal-title">Confirmar Eliminación</h3>
            <button class="modal-close" data-modal-close aria-label="Cerrar">✕</button>
        </div>
        <div class="modal-body" style="text-align:center">
            <div class="confirm-icon danger">🗑️</div>
            <p class="confirm-text">
                ¿Está seguro que desea eliminar los datos de<br>
                <strong id="delete-empresa-name"></strong>?
            </p>
            <p class="confirm-text" style="margin-top:var(--space-2);font-size:var(--font-size-xs)">
                Esta acción no se puede deshacer.
            </p>
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
<script src="assets/js/empresa.js"></script>
<?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>
</html>
