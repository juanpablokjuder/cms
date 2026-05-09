<?php
/**
 * /noticias — Listado de novedades.
 */
$currentRoute = 'noticias';
$page = max(1, (int) ($_GET['page'] ?? 1));
$noticias = api_noticias($page, NOTICIAS_PER_PAGE);
$cmsSeo = api_seo('pagina', 'noticias');

$seo = merge_seo([
    'title' => 'Noticias · ' . SITE_NAME,
    'description' => 'Novedades, lanzamientos y reviews de smartphones premium. Mantenete al día con ' . SITE_NAME . '.',
    'url' => site_url('noticias'),
], $cmsSeo);

require __DIR__ . '/../components/head.php';
require __DIR__ . '/../components/header.php';

$crumbs = [
    ['label' => 'Inicio', 'href' => '/'],
    ['label' => 'Noticias'],
];

$totalPages = (int) ($noticias['meta']['totalPages'] ?? 0);
?>

<section class="vm-section">
    <div class="vm-container">

        <?php require __DIR__ . '/../components/breadcrumbs.php'; ?>

        <div class="vm-section-head">
            <div>
                <span class="vm-eyebrow">Novedades</span>
                <h1 class="text-4xl md:text-5xl">Lanzamientos, análisis y guías</h1>
                <p class="text-slate-600 mt-3 max-w-2xl">Reviews exhaustivas, comparativas y todo lo que tenés que saber
                    antes de elegir tu próximo smartphone.</p>
            </div>
        </div>

        <?php if (!empty($noticias['data'])): ?>
            <div class="vm-news-grid">
                <?php foreach ($noticias['data'] as $n):
                    $img = first_image($n['imagenes'] ?? []);
                    $href = '/noticias/' . e($n['slug']);
                    ?>
                    <article class="vm-news-card vm-reveal">
                        <a href="<?= $href ?>" class="vm-news-card-media" aria-label="<?= e($n['titulo']) ?>">
                            <?php if ($img): ?>
                                <img src="<?= e($img['url']) ?>" alt="<?= e($img['alt'] ?? $n['titulo']) ?>" loading="lazy">
                            <?php else: ?>
                                <div class="w-full h-full flex items-center justify-center text-slate-400 text-sm">Sin imagen</div>
                            <?php endif; ?>
                        </a>
                        <div class="vm-news-card-body">
                            <span class="vm-news-card-date"><?= e(format_date($n['created_at'])) ?></span>
                            <h2 class="vm-news-card-title">
                                <a href="<?= $href ?>"><?= e($n['titulo']) ?></a>
                            </h2>
                            <?php if (!empty($n['subtitulo'])): ?>
                                <p class="vm-news-card-excerpt"><?= e(truncate($n['subtitulo'], 140)) ?></p>
                            <?php else: ?>
                                <p class="vm-news-card-excerpt"><?= e(truncate(strip_tags($n['texto'] ?? ''), 140)) ?></p>
                            <?php endif; ?>
                            <a href="<?= $href ?>" class="vm-news-card-cta">
                                Leer más
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2.2">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>

            <?php if ($totalPages > 1): ?>
                <nav class="vm-pagination" aria-label="Paginación">
                    <?php if ($page > 1): ?>
                        <a href="?page=<?= $page - 1 ?>" rel="prev" aria-label="Página anterior">←</a>
                    <?php endif; ?>
                    <?php
                    $start = max(1, $page - 2);
                    $end = min($totalPages, $page + 2);
                    for ($i = $start; $i <= $end; $i++):
                        ?>
                        <a href="?page=<?= $i ?>" <?= $i === $page ? 'aria-current="page"' : '' ?>><?= $i ?></a>
                    <?php endfor; ?>
                    <?php if ($page < $totalPages): ?>
                        <a href="?page=<?= $page + 1 ?>" rel="next" aria-label="Siguiente página">→</a>
                    <?php endif; ?>
                </nav>
            <?php endif; ?>

        <?php else: ?>
            <?php
            $title = 'Aún no publicamos noticias';
            $message = 'Volvé pronto. Estamos trabajando en contenido editorial sobre los lanzamientos más importantes.';
            $ctaLabel = 'Volver al inicio';
            $ctaHref = '/';
            require __DIR__ . '/../components/empty-state.php';
            ?>
        <?php endif; ?>
    </div>
</section>

<?php require __DIR__ . '/../components/footer.php'; ?>