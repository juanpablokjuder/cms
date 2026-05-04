<?php
/**
 * Sección: Servicios.
 * Variable esperada: $servicios (array con claves 'servicio' y 'categorias')
 * Si está vacío o sin categorías activas, la sección no se renderiza.
 */

if (empty($servicios))
    return;

$infoServicio = $servicios['servicio'] ?? null;
$categorias = $servicios['categorias'] ?? [];

if (empty($categorias))
    return;

// Ordenar categorías por 'orden' ASC
usort($categorias, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));

// Primera categoría activa por defecto
$firstCatUuid = $categorias[0]['uuid'] ?? '';
?>
<section class="servicios-section" id="servicios" aria-label="Servicios">
    <div class="container-cms">

        <!-- Encabezado -->
        <div class="servicios-header fade-in">
            <span class="section-eyebrow">Lo que ofrecemos</span>
            <h2 class="section-title">
                <?= e($infoServicio['titulo'] ?? 'Nuestros Servicios') ?>
            </h2>
            <?php if (!empty($infoServicio['subtitulo'])): ?>
                <p class="section-subtitle" style="margin-top:.75rem;margin-inline:auto;">
                    <?= e($infoServicio['subtitulo']) ?>
                </p>
            <?php endif; ?>
        </div>

        <!-- Tabs de categorías -->
        <?php if (count($categorias) > 1): ?>
            <div class="cat-tabs" role="tablist" aria-label="Categorías de servicios">
                <?php foreach ($categorias as $i => $cat): ?>
                    <button class="cat-tab <?= $i === 0 ? 'active' : '' ?>" data-cat="<?= e($cat['uuid']) ?>" role="tab"
                        aria-selected="<?= $i === 0 ? 'true' : 'false' ?>" aria-controls="panel-<?= e($cat['uuid']) ?>"
                        id="tab-<?= e($cat['uuid']) ?>">
                        <?= e($cat['nombre']) ?>
                    </button>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Paneles de items por categoría -->
        <?php foreach ($categorias as $i => $cat): ?>
            <?php
            $items = $cat['items'] ?? [];
            if (empty($items))
                continue;
            // Ordenar items por created_at ASC (ya vienen ordenados de la API)
            ?>
            <div class="cat-panel <?= $i === 0 ? 'active' : '' ?>" data-cat="<?= e($cat['uuid']) ?>"
                id="panel-<?= e($cat['uuid']) ?>" role="tabpanel" aria-labelledby="tab-<?= e($cat['uuid']) ?>">
                <div class="items-grid">
                    <?php foreach ($items as $j => $item): ?>
                        <?php
                        $itemImgs = $item['imagenes'] ?? [];
                        usort($itemImgs, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
                        $firstImg = $itemImgs[0] ?? null;
                        $precio = cms_format_price($item['precio'] ?? null, $item['moneda'] ?? null);
                        $hasBtn = !empty($item['btn_texto']) && !empty($item['btn_link']);
                        ?>
                        <article class="servicio-card fade-in <?= "fade-in-delay-" . min($j + 1, 3) ?>" itemscope
                            itemtype="https://schema.org/Service">
                            <?php if ($firstImg): ?>
                                <div class="servicio-card-img-wrap">
                                    <img src="<?= e($firstImg['url']) ?>" alt="<?= e($firstImg['alt'] ?? $item['titulo'] ?? '') ?>"
                                        <?php if (!empty($firstImg['title'])): ?>title="<?= e($firstImg['title']) ?>" <?php endif; ?>
                                        class="servicio-card-img" loading="lazy" width="400" height="200" itemprop="image">
                                    <div class="servicio-card-img-overlay" aria-hidden="true"></div>
                                </div>
                            <?php else: ?>
                                <div class="servicio-card-img-placeholder" aria-hidden="true">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)"
                                        stroke-width="1.5">
                                        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                                        <line x1="2" y1="10" x2="22" y2="10" />
                                    </svg>
                                </div>
                            <?php endif; ?>

                            <div class="servicio-card-body">
                                <h3 itemprop="name"><?= e($item['titulo'] ?? '') ?></h3>

                                <?php if (!empty($item['subtitulo_1'])): ?>
                                    <p class="sub1"><?= e($item['subtitulo_1']) ?></p>
                                <?php endif; ?>

                                <?php if (!empty($item['subtitulo_2'])): ?>
                                    <p class="sub1"><?= e($item['subtitulo_2']) ?></p>
                                <?php endif; ?>

                                <?php if ($precio): ?>
                                    <p class="price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                                        <span itemprop="price"><?= e($precio) ?></span>
                                    </p>
                                <?php endif; ?>

                                <?php if (!empty($item['texto'])): ?>
                                    <div class="texto-corto">
                                        <?= strip_tags(cms_sanitize_html($item['texto'])) ?>
                                    </div>
                                <?php endif; ?>

                                <?php if ($hasBtn): ?>
                                    <a href="<?= e($item['btn_link']) ?>" class="btn btn-primary"
                                        style="font-size:.875rem;padding:.6rem 1.25rem;" itemprop="url">
                                        <?= e($item['btn_texto']) ?>
                                    </a>
                                <?php endif; ?>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endforeach; ?>

    </div>
</section>