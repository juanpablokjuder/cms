<?php
/**
 * Sección: Noticias — listado con paginación "load more" (AJAX).
 * Variables esperadas:
 *   $noticias      (array con claves 'data' y 'meta')
 *   $noticiasLimit (int)
 */

if (empty($noticias) || empty($noticias['data']))
    return;

$items = $noticias['data'];
$meta = $noticias['meta'] ?? [];
$totalPages = (int) ($meta['totalPages'] ?? 1);
$page = (int) ($meta['page'] ?? 1);
$limit = (int) ($meta['limit'] ?? NOTICIAS_PER_PAGE);
?>
<section class="noticias-section" id="noticias" aria-label="Noticias">
    <div class="container-cms">

        <!-- Encabezado -->
        <div class="noticias-header fade-in">
            <span class="section-eyebrow">Novedades</span>
            <h2 class="section-title">Noticias</h2>
        </div>

        <!-- Grid de cards -->
        <div class="noticias-grid" id="noticias-grid" role="list">
            <?php foreach ($items as $i => $noticia): ?>
                <?php
                $imgs = $noticia['imagenes'] ?? [];
                usort($imgs, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
                $img = $imgs[0] ?? null;
                $fecha = !empty($noticia['created_at']) ? cms_format_date($noticia['created_at']) : '';
                $slugHref = cms_url('noticia.php?slug=' . urlencode($noticia['slug'] ?? ''));
                ?>
                <article class="noticia-card fade-in <?= "fade-in-delay-" . min($i + 1, 3) ?>" role="listitem" itemscope
                    itemtype="https://schema.org/NewsArticle">
                    <?php if ($img): ?>
                        <a href="<?= e($slugHref) ?>" tabindex="-1" aria-hidden="true">
                            <div class="noticia-card-img-wrap">
                                <img src="<?= e($img['url']) ?>" alt="<?= e($img['alt'] ?? $noticia['titulo'] ?? '') ?>"
                                    class="noticia-card-img" loading="lazy" width="640" height="210" itemprop="image">
                                <div class="noticia-card-img-overlay" aria-hidden="true"></div>
                            </div>
                        </a>
                    <?php else: ?>
                        <div class="noticia-card-img-placeholder" aria-hidden="true">
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                                <path
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    stroke="rgba(255,255,255,.4)" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                    <?php endif; ?>

                    <div class="noticia-card-body">
                        <?php if ($fecha): ?>
                            <p class="noticia-meta">
                                <time datetime="<?= e($noticia['created_at'] ?? '') ?>" itemprop="datePublished">
                                    <?= e($fecha) ?>
                                </time>
                            </p>
                        <?php endif; ?>

                        <h3 itemprop="headline">
                            <a href="<?= e($slugHref) ?>"><?= e($noticia['titulo'] ?? '') ?></a>
                        </h3>

                        <?php if (!empty($noticia['subtitulo'])): ?>
                            <p itemprop="description"><?= e($noticia['subtitulo']) ?></p>
                        <?php endif; ?>

                        <a href="<?= e($slugHref) ?>" class="read-more" itemprop="url">
                            Leer más
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2.5" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>

        <!-- Botón load more -->
        <?php if ($totalPages > $page): ?>
            <div class="load-more-wrap fade-in">
                <button id="load-more-noticias" class="btn btn-dark" data-page="<?= $page + 1 ?>"
                    data-total="<?= $totalPages ?>" data-limit="<?= $limit ?>" aria-live="polite">
                    Cargar más noticias
                </button>
            </div>
        <?php endif; ?>

    </div>
</section>