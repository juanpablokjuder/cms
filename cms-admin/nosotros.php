<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'nosotros';
$headerTitle = 'Nosotros';
$pageTitle = 'Nosotros';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/noticias.css">
    <link rel="stylesheet" href="assets/css/image-input.css">
    <!-- Quill.js — editor de texto enriquecido (open-source) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css">
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.min.js"></script>
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Nosotros</h2>
                    <p class="page-subtitle">Edite el contenido de la sección "Nosotros"</p>
                </div>
            </div>

            <!-- Skeleton de carga inicial -->
            <div id="nosotros-loading" style="display:flex;justify-content:center;padding:var(--space-10)">
                <span class="spinner" style="width:2rem;height:2rem;border-width:3px"></span>
            </div>

            <form id="nosotros-form" novalidate style="display:none">
                <div style="display:grid;grid-template-columns:1fr 380px;gap:var(--space-5);align-items:start">

                    <!-- Columna principal -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <!-- Título y subtítulo -->
                        <div class="card">
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="nosotros-titulo">Título <span
                                            class="required">*</span></label>
                                    <input type="text" id="nosotros-titulo" class="form-input"
                                        placeholder="Título de la sección" required maxlength="255">
                                    <span class="form-error" id="nosotros-titulo-error"></span>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="nosotros-subtitulo">Subtítulo</label>
                                    <input type="text" id="nosotros-subtitulo" class="form-input"
                                        placeholder="Subtítulo opcional" maxlength="500">
                                </div>
                            </div>
                        </div>

                        <!-- Editor de texto enriquecido -->
                        <div class="card">
                            <div class="card-header">
                                <span class="card-header-title">Contenido <span class="required">*</span></span>
                            </div>
                            <div class="quill-wrapper">
                                <div id="quill-editor"></div>
                            </div>
                            <span class="form-error" id="nosotros-texto-error"
                                style="padding:var(--space-2) var(--space-4);display:block"></span>
                        </div>

                    </div>

                    <!-- Columna lateral -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <!-- Guardar -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Guardar</span></div>
                            <div class="card-footer">
                                <button type="submit" class="btn btn-primary" id="nosotros-form-submit"
                                    style="width:100%">
                                    <span class="spinner"></span><span class="btn-text">Guardar Cambios</span>
                                </button>
                            </div>
                        </div>

                        <!-- Galería de imágenes -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Imágenes</span></div>
                            <div class="card-body">
                                <div id="nosotros-imagenes-mount"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </main>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/image-input.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/nosotros-form.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>

</html>