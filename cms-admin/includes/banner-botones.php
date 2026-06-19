<?php
/**
 * Partial reutilizable: gestión de botones del banner.
 *
 * Incluye:
 *   1. Un formulario de carga (texto + enlace + variante) para añadir botones.
 *   2. Una tabla de datos que lista los botones añadidos, con reordenado y borrado.
 *
 * Toda la lógica vive en banner-form.js (módulo BannerBotones).
 * Los botones se envían al guardar el banner como un array `botones`.
 */
?>
<div class="banner-botones-block">
    <div class="banner-botones-head">
        <div>
            <label class="form-label" style="margin:0">Botones del banner</label>
            <span class="form-hint">Agregue uno o más botones (call-to-action). Opcional.</span>
        </div>
    </div>

    <!-- ── Formulario de carga de un botón ── -->
    <div class="banner-boton-form">
        <div class="form-group">
            <label class="form-label" for="boton-texto">Texto</label>
            <input type="text" id="boton-texto" class="form-input" placeholder="ej: Ver más" maxlength="100">
            <span class="form-error" id="boton-texto-error"></span>
        </div>
        <div class="form-group">
            <label class="form-label" for="boton-link">Enlace</label>
            <input type="text" id="boton-link" class="form-input" placeholder="ej: /servicios" maxlength="500">
            <span class="form-error" id="boton-link-error"></span>
        </div>
        <div class="form-group">
            <label class="form-label" for="boton-variante">Estilo</label>
            <select id="boton-variante" class="form-select">
                <option value="primary">Primario</option>
                <option value="outline">Contorno</option>
            </select>
        </div>
        <div class="form-group banner-boton-form-action">
            <button type="button" class="btn btn-secondary" id="boton-add-btn">
                <span>+</span><span>Agregar</span>
            </button>
        </div>
    </div>

    <!-- ── Tabla de datos de botones ── -->
    <div class="table-wrapper">
        <table class="data-table banner-botones-table">
            <thead>
                <tr>
                    <th style="width:40px"></th>
                    <th>Texto</th>
                    <th>Enlace</th>
                    <th style="width:110px">Estilo</th>
                    <th style="width:60px">Acciones</th>
                </tr>
            </thead>
            <tbody id="banner-botones-tbody">
                <!-- Filas renderizadas dinámicamente por banner-form.js -->
            </tbody>
        </table>
        <div class="banner-botones-empty" id="banner-botones-empty">
            Sin botones. Use el formulario de arriba para agregar uno.
        </div>
    </div>
</div>
