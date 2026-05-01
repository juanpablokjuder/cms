<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'banners';
$headerTitle = 'Nuevo Banner';
$pageTitle = 'Nuevo Banner';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/banners.css">
    <link rel="stylesheet" href="assets/css/image-input.css">
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Nuevo Banner</h2>
                    <p class="page-subtitle">Configure la imagen y los textos del banner</p>
                </div>
                <a href="banners.php" class="btn btn-secondary">← Volver</a>
            </div>

            <div class="card" style="max-width:720px">
                <form id="banner-form" novalidate>
                    <div class="card-body banner-form-grid">

                        <!-- Componente ImageInput -->
                        <div class="form-group">
                            <label class="form-label">Imagen del banner</label>
                            <div id="banner-image-input-mount"></div>
                        </div>

                        <hr style="border:none;border-top:1px solid var(--color-border);margin:var(--space-2) 0">

                        <!-- Page & Order -->
                        <div class="banner-form-row">
                            <div class="form-group">
                                <label class="form-label" for="banner-pagina">Página <span
                                        class="required">*</span></label>
                                <input type="text" id="banner-pagina" class="form-input"
                                    placeholder="ej: inicio, nosotros, servicios" required maxlength="100">
                                <span class="form-error" id="banner-pagina-error"></span>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="banner-orden">Orden</label>
                                <input type="number" id="banner-orden" class="form-input" value="0" min="0"
                                    style="max-width:120px">
                            </div>
                        </div>

                        <!-- Heading -->
                        <div class="form-group">
                            <label class="form-label" for="banner-h1">Título principal (H1) <span
                                    class="required">*</span></label>
                            <input type="text" id="banner-h1" class="form-input" placeholder="Título del banner"
                                required maxlength="255">
                            <span class="form-error" id="banner-h1-error"></span>
                        </div>

                        <!-- Texts -->
                        <div class="form-group">
                            <label class="form-label" for="banner-texto1">Texto 1</label>
                            <textarea id="banner-texto1" class="form-input" rows="3"
                                placeholder="Primer bloque de texto (opcional)"
                                style="height:auto;padding:var(--space-3) var(--space-4)"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="banner-texto2">Texto 2</label>
                            <textarea id="banner-texto2" class="form-input" rows="3"
                                placeholder="Segundo bloque de texto (opcional)"
                                style="height:auto;padding:var(--space-3) var(--space-4)"></textarea>
                        </div>

                        <!-- Button -->
                        <div class="banner-form-row">
                            <div class="form-group">
                                <label class="form-label" for="banner-btn-texto">Texto del botón</label>
                                <input type="text" id="banner-btn-texto" class="form-input" placeholder="ej: Ver más"
                                    maxlength="100">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="banner-btn-link">Enlace del botón</label>
                                <input type="text" id="banner-btn-link" class="form-input" placeholder="ej: /servicios"
                                    maxlength="500">
                            </div>
                        </div>

                    </div>
                    <div class="card-footer">
                        <a href="banners.php" class="btn btn-secondary">Cancelar</a>
                        <button type="submit" class="btn btn-primary" id="banner-form-submit">
                            <span class="spinner"></span>
                            <span class="btn-text">Crear Banner</span>
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/image-input.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/banner-form.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>

</html>