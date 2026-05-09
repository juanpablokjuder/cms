<?php
/**
 * /noticias/:slug — Detalle de noticia (vista de lectura inmersiva).
 */
$currentRoute = 'noticias';
$noticia = $slugArg ? api_noticia_by_slug($slugArg) : null;

if (!$noticia) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    return;
}

$hero = first_image($noticia['imagenes'] ?? []);
$cmsSeo = api_seo('noticia', $noticia['uuid']);

$seo = merge_seo([
    'title' => $noticia['titulo'] . ' · ' . SITE_NAME,
    'description' => truncate($noticia['subtitulo'] ?? strip_tags($noticia['texto']), 160),
    'url' => site_url('noticias/' . $noticia['slug']),
    'image' => $hero['url'] ?? '',
    'type' => 'article',
    'published_time' => $noticia['created_at'] ?? '',
], $cmsSeo);

// Inyectar scripts_body si el CMS lo tiene configurado
$scriptsBody = $cmsSeo['scripts_body'] ?? '';

// JSON-LD Article (Schema.org)
$articleSchema = [
    '@context' => 'https://schema.org',
    '@type' => 'NewsArticle',
    'headline' => $noticia['titulo'],
    'description' => truncate($noticia['subtitulo'] ?? strip_tags($noticia['texto']), 160),
    'url' => site_url('noticias/' . $noticia['slug']),
    'datePublished' => $noticia['created_at'] ?? '',
    'dateModified' => $noticia['updated_at'] ?? '',
    'publisher' => ['@type' => 'Organization', 'name' => SITE_NAME],
];
if ($hero)
    $articleSchema['image'] = $hero['url'];
$extraStyles = '<script type="application/ld+json">' . json_encode($articleSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
if (!empty($cmsSeo['scripts_head']))
    $extraStyles .= "\n" . $cmsSeo['scripts_head'];

require __DIR__ . '/../components/head.php';
require __DIR__ . '/../components/header.php';

$crumbs = [
    ['label' => 'Inicio', 'href' => '/'],
    ['label' => 'Noticias', 'href' => '/noticias'],
    ['label' => truncate($noticia['titulo'], 40)],
];
?>

<section class="vm-section">
    <div class="vm-container">

        <?php require __DIR__ . '/../components/breadcrumbs.php'; ?>

        <article class="vm-article">
            <p class="vm-article-meta"><?= e(format_date($noticia['created_at'])) ?></p>
            <h1 class="vm-article-title font-display"><?= e($noticia['titulo']) ?></h1>
            <?php if (!empty($noticia['subtitulo'])): ?>
                <p class="text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl"><?= e($noticia['subtitulo']) ?></p>
            <?php endif; ?>

            <?php if ($hero): ?>
                <div class="vm-article-hero">
                    <img src="<?= e($hero['url']) ?>" alt="<?= e($hero['alt'] ?? $noticia['titulo']) ?>" loading="eager">
                </div>
            <?php endif; ?>

            <div class="vm-article-content">
                <?= sanitize_html($noticia['texto']) ?>
            </div>

            <!-- Galería extra (si hay más imágenes además de la principal) -->
            <?php
            $extraImages = array_slice($noticia['imagenes'] ?? [], 1);
            if (count($extraImages) > 0): ?>
                <div class="grid gap-4 mt-12 md:grid-cols-2">
                    <?php foreach ($extraImages as $img): ?>
                        <div class="overflow-hidden rounded-2xl">
                            <img src="<?= e($img['url']) ?>" alt="<?= e($img['alt'] ?? '') ?>" loading="lazy"
                                class="w-full h-auto">
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <!-- Volver al listado -->
            <div class="mt-12 pt-8 border-t border-slate-200">
                <a href="/noticias" class="vm-btn vm-btn-ghost">
                    ← Volver a todas las noticias
                </a>
            </div>
        </article>
    </div>
</section>

<?php require __DIR__ . '/../components/footer.php'; ?>
<?php if (!empty($scriptsBody))
    echo $scriptsBody; ?>