<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user        = getCurrentUser();
$parts       = explode(' ', $user['name'] ?? '');
$initials    = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'noticias';
$headerTitle = 'Nueva Noticia';
$pageTitle   = 'Nueva Noticia';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/noticias.css">
    <!-- Quill.js — editor de texto enriquecido (100% open-source, sin API key) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.3/quill.snow.min.css">
</head>
<body>
<div class="app-layout" id="app-layout">
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
    <?php require_once __DIR__ . '/includes/header.php'; ?>

    <main class="main-content">
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="page-title">Nueva Noticia</h2>
                <p class="page-subtitle">Complete el formulario para publicar una nueva noticia</p>
            </div>
            <a href="noticias.php" class="btn btn-secondary">← Volver</a>
        </div>

        <form id="noticia-form" novalidate>
            <div style="display:grid;grid-template-columns:1fr 380px;gap:var(--space-5);align-items:start">

                <!-- Columna principal -->
                <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                    <!-- Título y subtítulo -->
                    <div class="card">
                        <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                            <div class="form-group">
                                <label class="form-label" for="noticia-titulo">Título <span class="required">*</span></label>
                                <input type="text" id="noticia-titulo" class="form-input" placeholder="Título de la noticia" required maxlength="255">
                                <span class="form-error" id="noticia-titulo-error"></span>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="noticia-subtitulo">Subtítulo</label>
                                <input type="text" id="noticia-subtitulo" class="form-input" placeholder="Subtítulo opcional" maxlength="500">
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
                        <span class="form-error" id="noticia-texto-error" style="padding:var(--space-2) var(--space-4);display:block"></span>
                    </div>

                </div>

                <!-- Columna lateral -->
                <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                    <!-- Publicar -->
                    <div class="card">
                        <div class="card-header"><span class="card-header-title">Publicar</span></div>
                        <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                            <div class="form-group">
                                <label class="form-label" for="noticia-slug">Slug</label>
                                <input type="text" id="noticia-slug" class="form-input" placeholder="auto-generado desde el título" maxlength="255">
                                <span class="form-error" id="noticia-slug-error"></span>
                                <span style="font-size:var(--font-size-xs);color:var(--color-text-tertiary);margin-top:var(--space-1);display:block">Dejar vacío para generarlo automáticamente.</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <a href="noticias.php" class="btn btn-secondary">Cancelar</a>
                            <button type="submit" class="btn btn-primary" id="noticia-form-submit">
                                <span class="spinner"></span><span class="btn-text">Publicar</span>
                            </button>
                        </div>
                    </div>

                    <!-- Galería de imágenes -->
                    <div class="card">
                        <div class="card-header"><span class="card-header-title">Imágenes</span></div>
                        <div class="card-body" style="padding-bottom:var(--space-3)">
                            <!-- Drop zone -->
                            <div class="upload-zone noticia-upload-zone" id="noticia-upload-zone">
                                <input type="file" id="noticia-image-input" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" multiple>
                                <div class="upload-zone-icon">🖼️</div>
                                <div class="upload-zone-text"><strong>Haga clic</strong> o arrastre imágenes aquí</div>
                                <div class="upload-zone-hint">PNG, JPG, WebP, GIF, SVG · Máx. 10 MB/imagen · Orden arrastrable</div>
                            </div>
                            <!-- Preview gallery -->
                            <ul class="noticia-gallery" id="noticia-gallery" aria-label="Galería de imágenes"></ul>
                        </div>
                    </div>

                </div>
            </div>
        </form>
    </main>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.3/quill.min.js"></script>
<script src="assets/js/toast.js"></script>
<script src="assets/js/api.js"></script>
<script src="assets/js/noticia-form.js"></script>
<?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>
</html>
