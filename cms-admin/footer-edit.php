<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user        = getCurrentUser();
$parts       = explode(' ', $user['name'] ?? '');
$initials    = strtoupper(substr($parts[0],0,1).(isset($parts[1])?substr($parts[1],0,1):''));
$editUuid    = trim($_GET['uuid'] ?? '');
$isEdit      = !empty($editUuid);
$currentPage = 'footer';
$headerTitle = $isEdit ? 'Editar Footer' : 'Nuevo Footer';
$pageTitle   = $headerTitle;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/noticias.css">
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
                <h2 class="page-title"><?php echo htmlspecialchars($headerTitle); ?></h2>
                <p class="page-subtitle">Configure la estructura completa del footer</p>
            </div>
            <a href="footer-list.php" class="btn btn-secondary">← Volver</a>
        </div>

        <form id="footer-form" novalidate>

            <!-- ── Columnas ──────────────────────────────────────────────── -->
            <section class="footer-section card" style="margin-bottom:var(--space-5)">
                <div class="card-header">
                    <span class="card-header-title">Configuración de Columnas</span>
                    <div class="footer-col-count-selector" role="group" aria-label="Número de columnas">
                        <?php for($i=1;$i<=5;$i++): ?>
                        <button type="button" class="col-count-btn <?php echo $i===3?'active':''; ?>" data-count="<?php echo $i; ?>"><?php echo $i; ?></button>
                        <?php endfor; ?>
                    </div>
                </div>
                <div class="card-body">
                    <div class="footer-columns-grid" id="footer-columns-grid">
                        <!-- Dynamically rendered by footer-form.js -->
                    </div>
                </div>
            </section>

            <!-- ── Redes sociales ─────────────────────────────────────────── -->
            <section class="footer-section card" style="margin-bottom:var(--space-5)">
                <div class="card-header" style="justify-content:space-between">
                    <span class="card-header-title">Redes Sociales</span>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-add-red">
                        <span>+</span><span>Agregar red</span>
                    </button>
                </div>
                <div class="card-body" style="padding:var(--space-4)">
                    <ul class="footer-item-list" id="redes-list">
                        <li class="footer-item-empty" id="redes-empty">Sin redes sociales. Haga clic en "Agregar red".</li>
                    </ul>
                </div>
            </section>

            <!-- ── Bottom footer ──────────────────────────────────────────── -->
            <section class="footer-section card" style="margin-bottom:var(--space-5)">
                <div class="card-header"><span class="card-header-title">Bottom Footer</span></div>
                <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                    <div class="form-group">
                        <label class="form-label" for="footer-copyright">Texto de Copyright</label>
                        <input type="text" id="footer-copyright" class="form-input" placeholder="© 2025 Mi Empresa. Todos los derechos reservados." maxlength="500">
                    </div>
                    <div>
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3)">
                            <label class="form-label" style="margin:0">Enlaces Legales</label>
                            <button type="button" class="btn btn-secondary btn-sm" id="btn-add-legal">
                                <span>+</span><span>Agregar enlace</span>
                            </button>
                        </div>
                        <ul class="footer-item-list" id="legales-list">
                            <li class="footer-item-empty" id="legales-empty">Sin enlaces legales.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- ── Guardar ────────────────────────────────────────────────── -->
            <div style="display:flex;justify-content:flex-end;gap:var(--space-3)">
                <a href="footer-list.php" class="btn btn-secondary">Cancelar</a>
                <button type="submit" class="btn btn-primary" id="footer-form-submit">
                    <span class="spinner"></span>
                    <span class="btn-text"><?php echo $isEdit ? 'Guardar Cambios' : 'Publicar Footer'; ?></span>
                </button>
            </div>

        </form>

        <!-- ── Templates ────────────────────────────────────────────────── -->

        <!-- Columna panel template -->
        <template id="tpl-column-panel">
            <div class="footer-col-panel" data-index="">
                <div class="footer-col-panel-header">
                    <span class="footer-col-number">Columna 1</span>
                    <select class="form-select footer-col-type-select" aria-label="Tipo de bloque">
                        <option value="media_texto">Media / Texto</option>
                        <option value="lista_enlaces">Lista de Enlaces</option>
                        <option value="contacto">Contacto</option>
                    </select>
                </div>
                <div class="footer-col-panel-body">
                    <!-- Filled dynamically by JS based on type -->
                </div>
            </div>
        </template>

        <!-- Media/Texto block template -->
        <template id="tpl-block-media-texto">
            <div class="footer-block-media-texto">
                <div class="upload-zone noticia-upload-zone footer-logo-zone" style="min-height:100px">
                    <input type="file" class="footer-logo-input" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml">
                    <div class="upload-zone-icon" style="font-size:1.5rem">🖼️</div>
                    <div class="upload-zone-text" style="font-size:var(--font-size-xs)"><strong>Logo</strong> — clic o arrastrar</div>
                </div>
                <div class="image-preview-container footer-logo-preview-container">
                    <img class="image-preview footer-logo-preview" src="" alt="">
                    <div class="image-preview-actions">
                        <button type="button" class="image-preview-remove footer-logo-remove" title="Quitar logo">✕</button>
                    </div>
                </div>
                <div class="form-group" style="margin-top:var(--space-3)">
                    <label class="form-label">Texto descriptivo</label>
                    <textarea class="form-input footer-descripcion-input" rows="3" placeholder="Breve descripción..." style="height:auto;padding:var(--space-3) var(--space-4)"></textarea>
                </div>
            </div>
        </template>

        <!-- Lista de enlaces block template -->
        <template id="tpl-block-lista-enlaces">
            <div class="footer-block-lista-enlaces">
                <div style="display:flex;justify-content:flex-end;margin-bottom:var(--space-2)">
                    <button type="button" class="btn btn-secondary btn-sm footer-add-enlace-btn">
                        <span>+</span><span>Agregar enlace</span>
                    </button>
                </div>
                <ul class="footer-item-list footer-enlaces-list"></ul>
            </div>
        </template>

        <!-- Contacto block template -->
        <template id="tpl-block-contacto">
            <div class="footer-block-contacto" style="display:flex;flex-direction:column;gap:var(--space-3)">
                <div class="form-group">
                    <label class="form-label">Dirección</label>
                    <input type="text" class="form-input footer-dir-input" placeholder="Av. Principal 123, Ciudad" maxlength="500">
                </div>
                <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="text" class="form-input footer-tel-input" placeholder="+54 11 1234-5678" maxlength="100">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input footer-email-input" placeholder="contacto@empresa.com" maxlength="255">
                </div>
            </div>
        </template>

        <!-- Enlace item template (usado en columna lista y legales) -->
        <template id="tpl-enlace-item">
            <li class="footer-enlace-item" draggable="true">
                <span class="faq-item-drag-handle">⠿</span>
                <input type="text" class="form-input footer-enlace-texto" placeholder="Texto ancla" maxlength="255" style="height:34px;font-size:var(--font-size-xs)">
                <input type="text" class="form-input footer-enlace-url" placeholder="URL o /ruta" maxlength="500" style="height:34px;font-size:var(--font-size-xs)">
                <button type="button" class="gallery-remove footer-enlace-remove" title="Eliminar">✕</button>
            </li>
        </template>

        <!-- Red social item template -->
        <template id="tpl-red-item">
            <li class="footer-red-item" draggable="true">
                <div class="footer-red-item-header">
                    <span class="faq-item-drag-handle">⠿</span>
                    <input type="text" class="form-input footer-red-nombre" placeholder="Nombre (ej: Instagram)" maxlength="100" style="height:34px;font-size:var(--font-size-xs);flex:1">
                    <input type="url"  class="form-input footer-red-url"    placeholder="https://..." maxlength="500" style="height:34px;font-size:var(--font-size-xs);flex:2">
                    <button type="button" class="gallery-remove footer-red-remove" title="Eliminar">✕</button>
                </div>
                <div class="footer-red-svg-area">
                    <label class="form-label" style="font-size:var(--font-size-xs)">Código SVG del ícono</label>
                    <textarea class="form-input footer-red-svg" rows="3" placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>' style="height:auto;padding:var(--space-2) var(--space-3);font-size:var(--font-size-xs);font-family:monospace"></textarea>
                    <div class="footer-red-svg-preview" title="Vista previa del SVG"></div>
                </div>
            </li>
        </template>

    </main>
</div>

<?php if($isEdit): ?><script>window.FOOTER_UUID = <?php echo json_encode($editUuid); ?>;</script><?php endif; ?>
<script src="assets/js/toast.js"></script>
<script src="assets/js/api.js"></script>
<script src="assets/js/footer-form.js"></script>
<?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>
</html>
