<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'servicios';
$headerTitle = 'Editar Item';
$pageTitle = 'Editar Item';
$editUuid = trim($_GET['uuid'] ?? '');
if (empty($editUuid)) {
    header('Location: servicios.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/servicios.css">
    <link rel="stylesheet" href="assets/css/image-input.css">
    <link rel="stylesheet" href="assets/css/noticias.css">
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
                    <h2 class="page-title">Editar Item</h2>
                    <p class="page-subtitle">Modifique los datos del item de servicio</p>
                </div>
                <a href="servicios.php" class="btn btn-secondary">← Volver</a>
            </div>

            <form id="item-form" novalidate>
                <div class="form-cols-aside">

                    <!-- Columna principal -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">
                        <div class="card">
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="item-titulo">Título <span
                                            class="required">*</span></label>
                                    <input type="text" id="item-titulo" class="form-input" maxlength="255" required>
                                    <span class="form-error" id="item-titulo-error"></span>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="item-subtitulo1">Subtítulo 1</label>
                                    <input type="text" id="item-subtitulo1" class="form-input" maxlength="500">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="item-subtitulo2">Subtítulo 2</label>
                                    <input type="text" id="item-subtitulo2" class="form-input" maxlength="500">
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Descripción (Texto)</span></div>
                            <div class="quill-wrapper">
                                <div id="quill-editor"></div>
                            </div>
                            <span class="form-error" id="item-texto-error"
                                style="padding:var(--space-2) var(--space-4);display:block"></span>
                        </div>
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Imágenes</span></div>
                            <div class="card-body">
                                <div id="item-imagenes-mount"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Columna lateral -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Guardar</span></div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <button type="submit" class="btn btn-primary btn-full" id="item-form-submit">
                                    <span class="spinner"></span><span class="btn-text">Guardar Cambios</span>
                                </button>
                                <a href="servicios.php" class="btn btn-secondary btn-full">Cancelar</a>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Precio</span></div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="item-precio">Precio</label>
                                    <input type="number" id="item-precio" class="form-input" min="0" step="0.01">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="item-moneda">Moneda</label>
                                    <select id="item-moneda" class="form-input">
                                        <option value="">— Sin moneda —</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Clasificación</span></div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="item-categoria">Categoría</label>
                                    <select id="item-categoria" class="form-input">
                                        <option value="">— Sin categoría —</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="item-estado">Estado</label>
                                    <select id="item-estado" class="form-input">
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                        <option value="no_mostrar">No mostrar</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Botón (CTA)</span></div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="item-btn-titulo">Texto del botón</label>
                                    <input type="text" id="item-btn-titulo" class="form-input" maxlength="255">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="item-btn-link">URL del botón</label>
                                    <input type="url" id="item-btn-link" class="form-input" maxlength="2048">
                                    <span class="form-error" id="item-btn-link-error"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    </div>

    <script>window.ITEM_UUID = '<?php echo htmlspecialchars($editUuid, ENT_QUOTES, 'UTF-8'); ?>';</script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/image-input.js"></script>
    <script src="assets/js/servicio-item-form.js"></script>
    <script>document.addEventListener('DOMContentLoaded', () => ServicioItemForm.init());</script>
</body>

</html>