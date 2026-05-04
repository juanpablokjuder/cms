<?php
/**
 * Sección: Hero Banner.
 * Variable esperada: $banners (array de Banner)
 * Si está vacío, se muestra un hero estático de fallback.
 */
?>
<section class="hero-section" id="hero" aria-label="Banner principal">

    <!-- Orbs de fondo -->
    <div class="hero-orb hero-orb-1" aria-hidden="true"></div>
    <div class="hero-orb hero-orb-2" aria-hidden="true"></div>

    <?php if (!empty($banners)): ?>
        <!-- Slides dinámicos -->
        <?php foreach ($banners as $i => $banner): ?>
            <div class="hero-slide <?= $i === 0 ? 'active' : '' ?>" aria-hidden="<?= $i === 0 ? 'false' : 'true' ?>">

                <!-- Imagen de fondo -->
                <div class="hero-bg" <?php if (!empty($banner['imagen'])): ?>
                        style="background-image:url('<?= e($banner['imagen']) ?>')" role="img"
                        aria-label="<?= e($banner['imagen_alt'] ?? '') ?>" <?php else: ?>
                        style="background: linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%)" <?php endif; ?>></div>
                <div class="hero-overlay" aria-hidden="true"></div>

                <!-- Contenido del slide -->
                <div class="container-cms">
                    <div class="hero-content fade-in">
                        <?php if (!empty($banner['h1'])): ?>
                            <h1><?= e($banner['h1']) ?></h1>
                        <?php endif; ?>
                        <?php if (!empty($banner['texto_1'])): ?>
                            <p class="hero-subtitle-1"><?= e($banner['texto_1']) ?></p>
                        <?php endif; ?>
                        <?php if (!empty($banner['texto_2'])): ?>
                            <p class="hero-subtitle-2"><?= e($banner['texto_2']) ?></p>
                        <?php endif; ?>
                        <?php if (!empty($banner['btn_texto'])): ?>
                            <div class="hero-btns">
                                <a href="<?= e($banner['btn_link'] ?? '#servicios') ?>" class="btn btn-primary">
                                    <?= e($banner['btn_texto']) ?>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                                <a href="#nosotros" class="btn btn-outline">Conocenos</a>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

            </div>
        <?php endforeach; ?>

        <!-- Dots de navegación (solo si hay más de 1 slide) -->
        <?php if (count($banners) > 1): ?>
            <div class="hero-dots" role="tablist" aria-label="Navegación de slides">
                <?php foreach ($banners as $i => $banner): ?>
                    <button class="hero-dot <?= $i === 0 ? 'active' : '' ?>" role="tab"
                        aria-selected="<?= $i === 0 ? 'true' : 'false' ?>" aria-label="Slide <?= $i + 1 ?>"></button>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

    <?php else: ?>
        <!-- Hero fallback estático -->
        <div class="hero-slide active">
            <div class="hero-bg" style="background:linear-gradient(135deg,#080c14 0%,#0d1a3a 50%,#080c14 100%)"></div>
            <div class="hero-overlay" aria-hidden="true"></div>
            <div class="container-cms">
                <div class="hero-content fade-in">
                    <div class="hero-badge">
                        <span class="hero-badge-dot" aria-hidden="true"></span>
                        Celulares &middot; Tecnolog&iacute;a &middot; Argentina
                    </div>
                    <h1><?= e(SITE_NAME) ?><span class="line-accent"><?= e(SITE_TAGLINE) ?></span></h1>
                    <div class="hero-btns">
                        <a href="#servicios" class="btn btn-primary">
                            Ver servicios
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2.5" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                        <a href="#nosotros" class="btn btn-outline">Conocenos</a>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Scroll indicator -->
    <div class="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <span class="hero-scroll-line"></span>
    </div>

</section>