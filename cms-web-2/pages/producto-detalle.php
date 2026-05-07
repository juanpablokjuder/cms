<?php
/**
 * /productos/:uuid — Detalle de Producto
 * El identificador en la URL es el UUID del producto (interpretado como slug).
 */
$currentRoute = 'productos';
$producto     = $slugArg ? api_producto_by_uuid($slugArg) : null;

if (!$producto) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    return;
}

$imgs = gather_product_images($producto);

// Calcular rango de precios
$precios = array_column($producto['variantes'] ?? [], 'precio');
$minPrice = !empty($precios) ? min($precios) : null;
$maxPrice = !empty($precios) ? max($precios) : null;
$moneda   = $producto['variantes'][0]['moneda_codigo'] ?? 'ARS';

// SEO desde el bloque "seo" del producto, con fallback a campos básicos
$seoData = $producto['seo'] ?? [];
$seo = [
    'title'       => $seoData['title']            ?? ($producto['nombre'] . ' · ' . SITE_NAME),
    'description' => $seoData['meta_description'] ?? truncate(strip_tags($producto['descripcion'] ?? ''), 160),
    'url'         => site_url('productos/' . $producto['uuid']),
    'image'       => $imgs[0]['url'] ?? '',
    'type'        => 'product',
];

$extraStyles = '';
if (!empty($seoData['scripts_head'])) {
    // Solo permitimos scripts del propio CMS; idealmente sanitizar más
    $extraStyles = $seoData['scripts_head'];
}

require __DIR__ . '/../components/head.php';
require __DIR__ . '/../components/header.php';

$crumbs = [
    ['label' => 'Inicio',    'href' => '/'],
    ['label' => 'Catálogo',  'href' => '/productos'],
    ['label' => $producto['nombre']],
];

// Variantes ordenadas por color para mostrar selector limpio
$variantes = $producto['variantes'] ?? [];
?>

<section class="vm-section">
    <div class="vm-container">

        <?php require __DIR__ . '/../components/breadcrumbs.php'; ?>

        <div class="vm-detail-layout">

            <!-- ── Galería ── -->
            <div class="vm-gallery">
                <div class="vm-gallery-main" id="vm-gallery-main">
                    <?php if (!empty($imgs)): ?>
                        <?php foreach ($imgs as $i => $img): ?>
                            <img src="<?= e($img['url']) ?>"
                                 alt="<?= e($img['alt'] ?? $producto['nombre']) ?>"
                                 class="<?= $i === 0 ? 'active' : '' ?>"
                                 data-idx="<?= $i ?>"
                                 loading="<?= $i === 0 ? 'eager' : 'lazy' ?>">
                        <?php endforeach; ?>

                        <?php if (count($imgs) > 1): ?>
                            <div class="vm-gallery-arrows">
                                <button type="button" id="vm-gallery-prev" class="vm-btn-icon" aria-label="Imagen anterior">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                                </button>
                                <button type="button" id="vm-gallery-next" class="vm-btn-icon" aria-label="Imagen siguiente">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>
                        <?php endif; ?>
                    <?php else: ?>
                        <div class="flex items-center justify-center h-full text-slate-400 text-sm">Sin imágenes</div>
                    <?php endif; ?>
                </div>

                <?php if (count($imgs) > 1): ?>
                    <div class="vm-gallery-thumbs" role="tablist" aria-label="Miniaturas">
                        <?php foreach ($imgs as $i => $img): ?>
                            <button type="button" class="vm-gallery-thumb" role="tab"
                                    aria-current="<?= $i === 0 ? 'true' : 'false' ?>"
                                    aria-label="Ver imagen <?= $i + 1 ?>"
                                    data-thumb="<?= $i ?>">
                                <img src="<?= e($img['url']) ?>" alt="" loading="lazy">
                            </button>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- ── Info ── -->
            <div class="vm-detail-info">
                <?php if (!empty($producto['marca'])): ?>
                    <div class="vm-detail-brand"><?= e($producto['marca']) ?></div>
                <?php endif; ?>
                <h1 class="vm-detail-title font-display"><?= e($producto['nombre']) ?></h1>

                <?php if (!empty($producto['condicion'])): ?>
                    <span class="vm-badge vm-badge-primary mb-2"><?= e($producto['condicion']) ?></span>
                <?php endif; ?>

                <div class="vm-detail-price" id="vm-detail-price">
                    <?= e(format_price_range($minPrice, $maxPrice, $moneda)) ?>
                </div>

                <!-- Selector de variantes / colores -->
                <?php if (!empty($variantes)): ?>
                    <div class="vm-variant-group">
                        <label class="vm-variant-label">
                            Color: <strong id="vm-selected-color">Seleccionar variante</strong>
                        </label>
                        <div class="vm-color-options" role="group" aria-label="Color">
                            <?php foreach ($variantes as $i => $v):
                                $colorName = $v['color_nombre'] ?? 'Variante ' . ($i + 1);
                                $swatch    = $v['color_imagen_url'] ?? null;
                            ?>
                                <button type="button" class="vm-color-option"
                                        aria-pressed="false"
                                        data-variant-uuid="<?= e($v['uuid']) ?>"
                                        data-variant-precio="<?= (int)$v['precio'] ?>"
                                        data-variant-descuento="<?= (int)($v['descuento'] ?? 0) ?>"
                                        data-variant-stock="<?= (int)$v['stock'] ?>"
                                        data-variant-moneda="<?= e($v['moneda_codigo'] ?? '') ?>"
                                        data-variant-color="<?= e($colorName) ?>"
                                        <?php if ($swatch): ?>data-variant-swatch="<?= e($swatch) ?>"<?php endif; ?>>
                                    <?php if ($swatch): ?>
                                        <span class="vm-color-swatch" style="background-image:url('<?= e($swatch) ?>')"></span>
                                    <?php else: ?>
                                        <span class="vm-color-swatch" style="background:linear-gradient(135deg,#94a3b8,#475569)"></span>
                                    <?php endif; ?>
                                    <?= e($colorName) ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endif; ?>

                <!-- Stock indicator -->
                <div class="vm-stock-line" id="vm-stock-line" hidden>
                    <span class="vm-stock-dot"></span>
                    <span data-stock-text>En stock</span>
                </div>

                <!-- CTAs -->
                <div class="vm-detail-cta-row">
                    <button type="button" class="vm-btn vm-btn-cta vm-btn-lg" id="vm-add-to-cart" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        Agregar al carrito
                    </button>
                    <a href="https://wa.me/<?= e(SITE_WHATSAPP) ?>?text=<?= rawurlencode('Hola! Me interesa el ' . $producto['nombre']) ?>"
                       target="_blank" rel="noopener"
                       class="vm-btn vm-btn-ghost vm-btn-lg">
                        Consultar por WhatsApp
                    </a>
                </div>

                <!-- Beneficios rápidos -->
                <ul class="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-200 text-sm text-slate-600">
                    <li class="flex gap-2 items-center"><span style="color:var(--vm-cta)">✓</span> Garantía oficial</li>
                    <li class="flex gap-2 items-center"><span style="color:var(--vm-cta)">✓</span> Envío en 24-72h</li>
                    <li class="flex gap-2 items-center"><span style="color:var(--vm-cta)">✓</span> Hasta 12 cuotas</li>
                    <li class="flex gap-2 items-center"><span style="color:var(--vm-cta)">✓</span> Servicio post-venta</li>
                </ul>
            </div>
        </div>

        <!-- ── Tabs: descripción + especificaciones ── -->
        <div class="mt-16">
            <div class="vm-tabs" role="tablist" aria-label="Información del producto">
                <button class="vm-tab" role="tab" aria-selected="true"  aria-controls="tab-desc" id="t-desc-btn">Descripción</button>
                <?php if (!empty($producto['atributos'])): ?>
                    <button class="vm-tab" role="tab" aria-selected="false" aria-controls="tab-specs" id="t-specs-btn">Especificaciones</button>
                <?php endif; ?>
                <?php if (!empty($producto['garantia'])): ?>
                    <button class="vm-tab" role="tab" aria-selected="false" aria-controls="tab-warranty" id="t-warranty-btn">Garantía</button>
                <?php endif; ?>
            </div>

            <div role="tabpanel" id="tab-desc" aria-labelledby="t-desc-btn" class="prose prose-slate max-w-none">
                <?php if (!empty($producto['descripcion'])): ?>
                    <?= sanitize_html($producto['descripcion']) ?>
                <?php else: ?>
                    <p class="text-slate-500">Pronto agregaremos más información sobre este producto.</p>
                <?php endif; ?>
            </div>

            <?php if (!empty($producto['atributos'])): ?>
                <div role="tabpanel" id="tab-specs" aria-labelledby="t-specs-btn" hidden>
                    <table class="vm-spec-table">
                        <tbody>
                            <?php foreach ($producto['atributos'] as $key => $value):
                                if ($value === null || $value === '') continue;
                            ?>
                                <tr>
                                    <td><?= e(str_replace('_', ' ', $key)) ?></td>
                                    <td><?php
                                        if (is_bool($value)) echo $value ? 'Sí' : 'No';
                                        elseif (is_array($value)) echo e(json_encode($value, JSON_UNESCAPED_UNICODE));
                                        else echo e((string)$value);
                                    ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>

            <?php if (!empty($producto['garantia'])): ?>
                <div role="tabpanel" id="tab-warranty" aria-labelledby="t-warranty-btn" hidden>
                    <p class="text-slate-700 leading-relaxed"><?= e($producto['garantia']) ?>. Cubre defectos de fabricación durante todo el período. El servicio técnico oficial está disponible para reparaciones autorizadas.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- Producto serializado para JS -->
<script type="application/json" id="vm-producto-data"><?= json_encode([
    'uuid'   => $producto['uuid'],
    'nombre' => $producto['nombre'],
    'marca'  => $producto['marca'],
    'image'  => $imgs[0]['url'] ?? null,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>

<?php
// Inyección scripts SEO body
$bodyScripts = !empty($seoData['scripts_body']) ? $seoData['scripts_body'] : '';
$extraScripts = '<script src="' . asset('assets/js/product-detail.js') . '?v=1"></script>' . "\n" . $bodyScripts;
require __DIR__ . '/../components/footer.php';
?>
