<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'faqs';
$headerTitle = 'Nueva Sección FAQ';
$pageTitle = 'Nueva FAQ';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/noticias.css">
    <link rel="stylesheet" href="assets/css/faqs.css">
    <link rel="stylesheet" href="assets/css/image-input.css">
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
                    <h2 class="page-title">Nueva Sección FAQ</h2>
                    <p class="page-subtitle">Configure el título, imagen y preguntas frecuentes</p>
                </div>
                <a href="faqs.php" class="btn btn-secondary">← Volver</a>
            </div>

            <form id="faq-form" novalidate>
                <div class="form-cols-aside">

                    <!-- Columna principal: items -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <div class="card">
                            <div class="card-header" style="justify-content:space-between">
                                <span class="card-header-title">Preguntas y Respuestas</span>
                                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-item">
                                    <span>+</span><span>Agregar pregunta</span>
                                </button>
                            </div>
                            <div class="card-body" style="padding:var(--space-4)">
                                <ul class="faq-items-list" id="faq-items-list">
                                    <li class="faq-items-empty" id="faq-items-empty">
                                        Aún no hay preguntas. Haga clic en "Agregar pregunta" para comenzar.
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>

                    <!-- Columna lateral -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <!-- Datos generales + guardar -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Sección</span></div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="faq-titulo">Título <span
                                            class="required">*</span></label>
                                    <input type="text" id="faq-titulo" class="form-input"
                                        placeholder="Ej: Preguntas sobre envíos" required maxlength="255">
                                    <span class="form-error" id="faq-titulo-error"></span>
                                </div>
                            </div>
                            <div class="card-footer">
                                <a href="faqs.php" class="btn btn-secondary">Cancelar</a>
                                <button type="submit" class="btn btn-primary" id="faq-form-submit">
                                    <span class="spinner"></span><span class="btn-text">Publicar</span>
                                </button>
                            </div>
                        </div>

                        <!-- Imagen -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Imagen</span></div>
                            <div class="card-body">
                                <div id="faq-image-mount"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </form>

            <!-- Template oculto para nuevo ítem -->
            <template id="faq-item-template">
                <li class="faq-item-row" draggable="true">
                    <div class="faq-item-header">
                        <span class="faq-item-drag-handle" title="Arrastrar para reordenar">⠿</span>
                        <span class="faq-item-number">1</span>
                        <button type="button" class="faq-item-toggle" aria-expanded="true" title="Colapsar">▾</button>
                        <span class="faq-item-preview-text"></span>
                        <button type="button" class="gallery-remove faq-item-remove"
                            title="Eliminar pregunta">✕</button>
                    </div>
                    <div class="faq-item-body">
                        <div class="form-group" style="margin-bottom:var(--space-3)">
                            <label class="form-label">Pregunta <span class="required">*</span></label>
                            <input type="text" class="form-input faq-pregunta-input"
                                placeholder="Escriba la pregunta..." maxlength="1000">
                            <span class="form-error faq-pregunta-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Respuesta <span class="required">*</span></label>
                            <div class="faq-quill-container quill-wrapper">
                                <div class="faq-quill-editor"></div>
                            </div>
                            <span class="form-error faq-respuesta-error"></span>
                        </div>
                    </div>
                </li>
            </template>
        </main>
    </div>

    <script src="assets/js/image-input.js"></script>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/faq-form.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>

</html>