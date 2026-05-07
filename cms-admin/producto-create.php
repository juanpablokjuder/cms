<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'productos';
$headerTitle = 'Nuevo Producto';
$pageTitle = 'Nuevo Producto';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/productos.css">
    <link rel="stylesheet" href="assets/css/image-input.css">
    <link rel="stylesheet" href="assets/css/seo.css">
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Nuevo Producto</h2>
                    <p class="page-subtitle">Complete la información del producto y sus variantes de color</p>
                </div>
                <a href="productos.php" class="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
                    Volver
                </a>
            </div>

            <form id="producto-form" novalidate>
                <div class="form-cols-aside">

                    <!-- ── Columna principal (tabbed) ──────────────────────── -->
                    <div class="product-form-main">

                        <!-- Tab Bar del formulario -->
                        <div class="tab-bar form-tab-bar" role="tablist">
                            <button type="button" class="tab-bar-btn active" data-form-tab="general" role="tab">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>
                                Información General
                            </button>
                            <button type="button" class="tab-bar-btn" data-form-tab="variantes" role="tab">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 17.25h.008v.008H6.75v-.008z"/></svg>
                                Variantes &amp; Precio
                            </button>
                            <button type="button" class="tab-bar-btn" data-form-tab="atributos" role="tab">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>
                                Atributos
                            </button>
                            <button type="button" class="tab-bar-btn" data-form-tab="seo" role="tab">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"/></svg>
                                SEO
                            </button>
                        </div>

                        <!-- Panel 1: Información General -->
                        <div class="tab-panel card" id="form-tab-general">
                            <div class="card-header">
                                <span class="card-header-title">Información del Producto</span>
                            </div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="prod-nombre">Nombre <span class="required">*</span></label>
                                    <input type="text" id="prod-nombre" class="form-input" maxlength="255" required placeholder="Ej: Zapatilla Running Pro">
                                    <span class="form-error" id="prod-nombre-error"></span>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="prod-marca">Marca</label>
                                    <input type="text" id="prod-marca" class="form-input" maxlength="150" placeholder="Ej: Nike">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="prod-descripcion">Descripción</label>
                                    <textarea id="prod-descripcion" class="form-input" rows="5" maxlength="5000" placeholder="Descripción detallada del producto..." style="height:auto;padding-top:10px;padding-bottom:10px;resize:vertical"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Panel 2: Variantes de Color -->
                        <div class="tab-panel card" id="form-tab-variantes" style="display:none">
                            <div class="card-header">
                                <span class="card-header-title">Variantes de Color</span>
                                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-variante">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                                    Agregar Variante
                                </button>
                            </div>
                            <div class="card-body">
                                <div id="variantes-list" style="display:flex;flex-direction:column;gap:var(--space-5)">
                                    <p class="text-muted" id="variantes-empty" style="color:var(--color-text-tertiary);font-size:var(--font-size-sm);text-align:center;padding:var(--space-8) 0">
                                        No hay variantes. Haga clic en "Agregar Variante" para comenzar.
                                    </p>
                                </div>
                                <span class="form-error" id="variantes-error" style="display:block;margin-top:var(--space-2)"></span>
                            </div>
                        </div>

                        <!-- Panel 3: Atributos Dinámicos -->
                        <div class="tab-panel card" id="form-tab-atributos" style="display:none">
                            <div class="card-header">
                                <span class="card-header-title">Atributos del Producto</span>
                                <button type="button" class="btn btn-ghost btn-sm" id="btn-gestionar-atributos" title="Gestionar plantillas">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    Gestionar plantillas
                                </button>
                            </div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="prod-atributos-plantilla">Plantilla de atributos</label>
                                    <select id="prod-atributos-plantilla" class="form-input">
                                        <option value="">— Sin plantilla —</option>
                                    </select>
                                </div>
                                <div id="atributos-valores-wrap" style="display:none;flex-direction:column;gap:var(--space-3)">
                                    <!-- Se rellena dinámicamente al cambiar plantilla -->
                                </div>
                            </div>
                        </div>

                        <!-- Panel 4: SEO -->
                        <div class="tab-panel" id="form-tab-seo" style="display:none">
                            <div id="seo-accordion-mount"></div>
                        </div>

                    </div>

                    <!-- ── Sidebar: Estado + Clasificación + Submit ─────────── -->
                    <div class="product-form-sidebar">

                        <!-- Estado -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Estado</span></div>
                            <div class="card-body">
                                <div class="form-group">
                                    <label class="form-label" for="prod-estado">Visibilidad</label>
                                    <select id="prod-estado" class="form-input">
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Clasificación -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Clasificación</span></div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="prod-condicion">Condición</label>
                                    <select id="prod-condicion" class="form-input">
                                        <option value="">— Sin especificar —</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="prod-garantia">Garantía</label>
                                    <select id="prod-garantia" class="form-input">
                                        <option value="">— Sin garantía —</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Botón guardar -->
                        <button type="submit" class="btn btn-primary btn-block" id="btn-submit" style="width:100%;height:44px">
                            <span class="spinner"></span>
                            <span class="btn-text">Crear Producto</span>
                        </button>

                    </div>
                </div>
            </form>
        </main>
    </div>

    <!-- Template: tarjeta de variante (clonada por JS) -->
    <template id="tpl-variante">
        <div class="variante-card" data-idx="">
            <div class="variante-card-header">
                <span class="variante-card-title">
                    <span class="variante-badge"></span>
                    Variante <span class="variante-num"></span>
                </span>
                <button type="button" class="btn btn-danger btn-sm btn-remove-variante">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    Quitar
                </button>
            </div>
            <div class="variante-card-body">
                <div class="form-cols-3">
                    <div class="form-group">
                        <label class="form-label">Color <span class="required">*</span></label>
                        <select class="form-input variante-color">
                            <option value="">— Seleccionar —</option>
                        </select>
                        <span class="form-error variante-color-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Moneda <span class="required">*</span></label>
                        <select class="form-input variante-moneda">
                            <option value="">— Seleccionar —</option>
                        </select>
                        <span class="form-error variante-moneda-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Precio (en centavos) <span class="required">*</span></label>
                        <input type="number" class="form-input variante-precio" min="0" step="1" placeholder="1050 = $10.50">
                        <span class="form-error variante-precio-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descuento</label>
                        <input type="number" class="form-input variante-descuento" min="0" max="9999" value="0" placeholder="0–9999">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock <span class="required">*</span></label>
                        <input type="number" class="form-input variante-stock" min="0" value="0">
                        <span class="form-error variante-stock-error"></span>
                    </div>
                </div>
                <div class="form-group" style="margin-top:var(--space-2)">
                    <label class="form-label">Imágenes de la variante</label>
                    <div class="variante-imagenes-wrap"></div>
                </div>
            </div>
        </div>
    </template>

    <!-- Modal: Gestionar Colores (desde formulario) -->
    <div class="modal-overlay" id="modal-colores-mgr" style="display:none">
        <div class="modal modal-lg">
            <div class="modal-header">
                <h3 class="modal-title">Gestionar Colores</h3>
                <button class="modal-close" id="btn-close-modal-colores-mgr">✕</button>
            </div>
            <div class="modal-body" id="modal-colores-mgr-body">
                <div style="display:flex;justify-content:flex-end;margin-bottom:var(--space-3)">
                    <button class="btn btn-primary btn-sm" id="btn-mgr-nuevo-color">+ Nuevo Color</button>
                </div>
                <table class="data-table" id="mgr-colores-table">
                    <thead>
                        <tr>
                            <th class="col-img">Muestra</th>
                            <th>Nombre</th>
                            <th class="col-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="mgr-colores-tbody">
                        <tr><td colspan="3" class="table-empty">Cargando...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal: Gestionar Atributos (desde formulario) -->
    <div class="modal-overlay" id="modal-atributos-mgr" style="display:none">
        <div class="modal modal-lg">
            <div class="modal-header">
                <h3 class="modal-title">Gestionar Plantillas de Atributos</h3>
                <button class="modal-close" id="btn-close-modal-atributos-mgr">✕</button>
            </div>
            <div class="modal-body">
                <div style="display:flex;justify-content:flex-end;margin-bottom:var(--space-3)">
                    <button class="btn btn-primary btn-sm" id="btn-mgr-nuevo-atributo">+ Nueva Plantilla</button>
                </div>
                <table class="data-table" id="mgr-atributos-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Campos</th>
                            <th class="col-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="mgr-atributos-tbody">
                        <tr><td colspan="3" class="table-empty">Cargando...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal: formulario rápido de color -->
    <div class="modal-overlay" id="modal-color-form" style="display:none">
        <div class="modal" style="max-width:460px">
            <div class="modal-header">
                <h3 class="modal-title" id="modal-color-form-title">Nuevo Color</h3>
                <button class="modal-close" id="btn-close-modal-color-form">✕</button>
            </div>
            <div class="modal-body">
                <form id="color-quick-form" novalidate style="display:flex;flex-direction:column;gap:var(--space-4)">
                    <input type="hidden" id="cq-uuid">
                    <div class="form-group">
                        <label class="form-label" for="cq-nombre">Nombre <span class="required">*</span></label>
                        <input type="text" id="cq-nombre" class="form-input" maxlength="100" required>
                        <span class="form-error" id="cq-nombre-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Imagen / Muestra</label>
                        <div id="cq-imagen-input"></div>
                    </div>
                    <div style="display:flex;gap:var(--space-3)">
                        <button type="submit" class="btn btn-primary">
                            <span class="spinner"></span><span class="btn-text">Guardar</span>
                        </button>
                        <button type="button" class="btn btn-secondary" id="btn-cancel-color-quick">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal: formulario rápido de atributo -->
    <div class="modal-overlay" id="modal-atributo-form" style="display:none">
        <div class="modal" style="max-width:560px">
            <div class="modal-header">
                <h3 class="modal-title" id="modal-atributo-form-title">Nueva Plantilla de Atributos</h3>
                <button class="modal-close" id="btn-close-modal-atributo-form">✕</button>
            </div>
            <div class="modal-body">
                <form id="atributo-quick-form" novalidate style="display:flex;flex-direction:column;gap:var(--space-4)">
                    <input type="hidden" id="aq-uuid">
                    <div class="form-group">
                        <label class="form-label" for="aq-nombre">Nombre <span class="required">*</span></label>
                        <input type="text" id="aq-nombre" class="form-input" maxlength="255" required>
                        <span class="form-error" id="aq-nombre-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Campos <span class="required">*</span></label>
                        <div id="aq-campos-list" style="display:flex;flex-direction:column;gap:var(--space-2)"></div>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-aq-add-campo"
                            style="margin-top:var(--space-2)">+ Agregar campo</button>
                        <span class="form-error" id="aq-campos-error"></span>
                    </div>
                    <div style="display:flex;gap:var(--space-3)">
                        <button type="submit" class="btn btn-primary">
                            <span class="spinner"></span><span class="btn-text">Guardar</span>
                        </button>
                        <button type="button" class="btn btn-secondary" id="btn-cancel-atributo-quick">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="toast-container"></div>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/image-input.js"></script>
    <script src="assets/js/seo-accordion.js"></script>
    <script src="assets/js/producto-form.js"></script>
</body>

</html>
