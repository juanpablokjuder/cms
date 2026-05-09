<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';

$editUuid = trim($_GET['uuid'] ?? '');
if (empty($editUuid)) {
    header('Location: locales.php');
    exit;
}

$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'locales';
$headerTitle = 'Editar Local';
$pageTitle = 'Editar Local';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/locales.css">
    <link rel="stylesheet" href="assets/css/image-input.css">
    <link rel="stylesheet" href="assets/css/seo.css">
    <!-- Quill.js — editor de texto enriquecido -->
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
                    <h2 class="page-title">Editar Local</h2>
                    <p class="page-subtitle">Modifique los datos del local</p>
                </div>
                <a href="locales.php" class="btn btn-secondary">← Volver</a>
            </div>

            <form id="local-form" novalidate>
                <div class="form-cols-aside">

                    <!-- Columna principal -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <!-- Nombre + Contacto -->
                        <div class="card">
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="local-nombre">Nombre <span
                                            class="required">*</span></label>
                                    <input type="text" id="local-nombre" class="form-input"
                                        placeholder="Nombre del local o sucursal" required maxlength="255">
                                    <span class="form-error" id="local-nombre-error"></span>
                                </div>
                                <div class="form-cols-2">
                                    <div class="form-group">
                                        <label class="form-label" for="local-direccion">Dirección</label>
                                        <input type="text" id="local-direccion" class="form-input"
                                            placeholder="Ej: Av. Corrientes 1234, CABA" maxlength="500">
                                        <span class="form-error" id="local-direccion-error"></span>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" for="local-telefono">Teléfono</label>
                                        <input type="tel" id="local-telefono" class="form-input"
                                            placeholder="Ej: +54 11 1234-5678" maxlength="100">
                                        <span class="form-error" id="local-telefono-error"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Descripción (Quill) -->
                        <div class="card">
                            <div class="card-header">
                                <span class="card-header-title">Descripción <span class="required">*</span></span>
                            </div>
                            <div class="quill-wrapper">
                                <div id="quill-editor"></div>
                            </div>
                            <span class="form-error" id="local-descripcion-error"
                                style="padding:var(--space-2) var(--space-4);display:block"></span>
                        </div>

                        <!-- Horario de Atención -->
                        <div class="card">
                            <div class="card-header">
                                <span class="card-header-title">Horario de Atención</span>
                            </div>
                            <div class="card-body">
                                <div id="local-horario-mount"></div>
                            </div>
                        </div>

                        <!-- SEO -->
                        <div id="seo-accordion-mount"></div>

                    </div>

                    <!-- Columna lateral -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <!-- Publicar -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Publicar</span></div>
                            <div class="card-footer">
                                <a href="locales.php" class="btn btn-secondary">Cancelar</a>
                                <button type="submit" class="btn btn-primary" id="local-form-submit">
                                    <span class="spinner"></span><span class="btn-text">Guardar Cambios</span>
                                </button>
                            </div>
                        </div>

                        <!-- Imágenes -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Imágenes</span></div>
                            <div class="card-body">
                                <div id="local-imagenes-mount"></div>
                            </div>
                        </div>

                    </div>

                </div>
            </form>
        </main>
    </div>

    <script>window.LOCAL_UUID = <?php echo json_encode($editUuid); ?>;</script>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/image-input.js"></script>
    <script src="assets/js/seo-accordion.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/local-form.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>

</html>