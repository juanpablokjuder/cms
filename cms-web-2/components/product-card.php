<?php
/**
 * Card reutilizable de producto. Espera $product (ProductoWebItem).
 */
$p = $product ?? null;
if (!$p) return;

$priceText = format_price_range($p['min_price'] ?? null, $p['max_price'] ?? null, $p['moneda_codigo'] ?? null);
$preview   = $p['preview_url'] ?? null;
$nColors   = (int)($p['num_colores'] ?? 0);
$href      = '/productos/' . e($p['uuid']);
?>
<article class="vm-product-card vm-reveal">
    <a href="<?= $href ?>" class="vm-product-card-media <?= $preview ? '' : 'empty' ?>" aria-label="Ver detalle de <?= e($p['nombre']) ?>">
        <?php if ($preview): ?>
            <img src="<?= e($preview) ?>" alt="<?= e($p['nombre']) ?>" loading="lazy" decoding="async">
        <?php else: ?>
            <span>Sin imagen</span>
        <?php endif; ?>
        <div class="vm-product-card-badges">
            <?php if (!empty($p['condicion'])): ?>
                <span class="vm-badge vm-badge-primary"><?= e($p['condicion']) ?></span>
            <?php endif; ?>
        </div>
    </a>
    <div class="vm-product-card-body">
        <?php if (!empty($p['marca'])): ?>
            <span class="vm-product-card-brand"><?= e($p['marca']) ?></span>
        <?php endif; ?>
        <h3 class="vm-product-card-name">
            <a href="<?= $href ?>"><?= e($p['nombre']) ?></a>
        </h3>
        <div class="vm-product-card-meta">
            <span class="vm-product-card-price"><?= e($priceText) ?></span>
            <?php if ($nColors > 0): ?>
                <span class="vm-product-card-colors" aria-label="<?= $nColors ?> colores disponibles">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M3 12h18"/>
                        <path d="M12 3a14 14 0 0 1 0 18"/>
                        <path d="M12 3a14 14 0 0 0 0 18"/>
                    </svg>
                    <?= $nColors ?> color<?= $nColors > 1 ? 'es' : '' ?>
                </span>
            <?php endif; ?>
        </div>
    </div>
</article>
