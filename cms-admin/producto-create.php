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
                    <p class="page-subtitle">Complete los datos base y agregue las variantes de color</p>
                </div>
                <a href="productos.php" class="btn btn-secondary">← Volver</a>
            </div>

            <form id="producto-form" novalidate>
                <div class="form-cols-aside">

                    <!-- ── Columna principal ────────────────────────────────── -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <!-- Datos base -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Información del Producto</span>
                            </div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="prod-nombre">Nombre <span
                                            class="required">*</span></label>
                                    <input type="text" id="prod-nombre" class="form-input" maxlength="255" required>
                                    <span class="form-error" id="prod-nombre-error"></span>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="prod-marca">Marca</label>
                                    <input type="text" id="prod-marca" class="form-input" maxlength="150">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="prod-descripcion">Descripción</label>
                                    <textarea id="prod-descripcion" class="form-input" rows="4"
                                        maxlength="5000"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Variantes de color (maestro-detalle) -->
                        <div class="card">
                            <div class="card-header"
                                style="display:flex;justify-content:space-between;align-items:center">
                                <span class="card-header-title">Variantes de Color</span>
                                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-variante">+ Agregar
                                    Variante</button>
                            </div>
                            <div class="card-body">
                                <div id="variantes-list" style="display:flex;flex-direction:column;gap:var(--space-5)">
                                    <p class="text-muted text-sm" id="variantes-empty">No hay variantes. Agregue al
                                        menos una.</p>
                                </div>
                                <span class="form-error" id="variantes-error"
                                    style="display:block;margin-top:var(--space-2)"></span>
                            </div>
                        </div>

                    </div>

                    <!-- ── Columna lateral ──────────────────────────────────── -->
                    <div style="display:flex;flex-direction:column;gap:var(--space-5)">

                        <!-- Estado -->
                        <div class="card">
                            <div class="card-header"><span class="card-header-title">Estado</span></div>
                            <div class="card-body">
                                <div class="form-group">
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
                                        <option value="">-- Sin especificar --</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="prod-garantia">Garantía</label>
                                    <select id="prod-garantia" class="form-input">
                                        <option value="">-- Sin garantía --</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Plantilla de atributos -->
                        <div class="card">
                            <div class="card-header"
                                style="display:flex;justify-content:space-between;align-items:center">
                                <span class="card-header-title">Atributos</span>
                                <button type="button" class="btn btn-link btn-sm" id="btn-gestionar-atributos"
                                    title="Gestionar plantillas">⚙️</button>
                            </div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4)">
                                <div class="form-group">
                                    <label class="form-label" for="prod-atributos-plantilla">Plantilla</label>
                                    <select id="prod-atributos-plantilla" class="form-input">
                                        <option value="">-- Sin plantilla --</option>
                                    </select>
                                </div>
                                <div id="atributos-valores-wrap"
                                    style="display:none;flex-direction:column;gap:var(--space-3)">
                                    <!-- Se rellena dinámicamente al cambiar plantilla -->
                                </div>
                            </div>
                        </div>

                        <!-- Botón guardar -->
                        <button type="submit" class="btn btn-primary btn-block" id="btn-submit">
                            <span class="spinner"></span><span class="btn-text">Crear Producto</span>
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
                <span class="variante-card-title">Variante #<span class="variante-num"></span></span>
                <button type="button" class="btn btn-danger btn-sm btn-remove-variante">✕ Quitar</button>
            </div>
            <div class="variante-card-body">
                <div class="form-cols-3">
                    <div class="form-group">
                        <label class="form-label">Color <span class="required">*</span></label>
                        <select class="form-input variante-color">
                            <option value="">-- Seleccionar --</option>
                        </select>
                        <span class="form-error variante-color-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Moneda <span class="required">*</span></label>
                        <select class="form-input variante-moneda">
                            <option value="">-- Seleccionar --</option>
                        </select>
                        <span class="form-error variante-moneda-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Precio (centavos) <span class="required">*</span></label>
                        <input type="number" class="form-input variante-precio" min="0" step="1"
                            placeholder="Ej: 1050 = $10.50">
                        <span class="form-error variante-precio-error"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descuento (0-9999)</label>
                        <input type="number" class="form-input variante-descuento" min="0" max="9999" value="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock <span class="required">*</span></label>
                        <input type="number" class="form-input variante-stock" min="0" value="0">
                        <span class="form-error variante-stock-error"></span>
                    </div>
                </div>
                <div class="form-group" style="margin-top:var(--space-3)">
                    <label class="form-label">Imágenes de la variante</label>
                    <div class="variante-imagenes-wrap"></div>
                </div>
            </div>
        </div>
    </template>

    <!-- Modal: Gestionar Colores (popup desde formulario) -->
    <div class="modal-overlay" id="modal-colores-mgr" style="display:none">
        <div class="modal modal-lg">
            <div class="modal-header">
                <h3 class="modal-title">Gestionar Colores</h3>
                <button class="modal-close" id="btn-close-modal-colores-mgr">✕</button>
            </div>
            <div class="modal-body" id="modal-colores-mgr-body">
                <!-- Tabla de colores con acciones inline -->
                <div style="display:flex;justify-content:flex-end;margin-bottom:var(--space-3)">
                    <button class="btn btn-primary btn-sm" id="btn-mgr-nuevo-color">+ Nuevo Color</button>
                </div>
                <table class="data-table" id="mgr-colores-table">
                    <thead>
                        <tr>
                            <th>Muestra</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="mgr-colores-tbody">
                        <tr>
                            <td colspan="3" class="text-center">Cargando...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal: Gestionar Atributos (popup desde formulario) -->
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
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="mgr-atributos-tbody">
                        <tr>
                            <td colspan="3" class="text-center">Cargando...</td>
                        </tr>
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
    <script src="assets/js/producto-form.js"></script>
</body>

</html>