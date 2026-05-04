<?php
/**
 * noticia.php — Página de detalle de una noticia por slug.
 * URL: /noticia.php?slug=mi-noticia
 */

require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/lib/api.php';

// Validar y sanear slug desde query string
$slugRaw = $_GET['slug'] ?? '';
$slug    = preg_replace('/[^a-z0-9\-]/', '', strtolower(trim($slugRaw)));

// Si el slug está vacío o es inválido, redirigir al inicio
if (empty($slug)) {
    header('Location: ' . cms_url(), true, 302);
    exit;
}

$noticia = cms_get_noticia_by_slug($slug);
$footer  = cms_get_footer();

// 404 si no existe
if ($noticia === null) {
    http_response_code(404);
    $seoTitle = 'Noticia no encontrada | ' . SITE_NAME;
    $seoDescription = 'La noticia que buscás no existe o fue eliminada.';
    $seoCanonical = cms_url('noticia.php?slug=' . urlencode($slug));
    require __DIR__ . '/components/head.php';
    require __DIR__ . '/components/header.php';
    ?>
    <main style="padding:8rem 0 4rem;text-align:center;">
      <div class="container-cms">
        <span class="badge">Error 404</span>
        <h1 class="section-title" style="margin-top:.5rem;">Noticia no encontrada</h1>
        <p class="section-subtitle" style="margin:1rem auto 2rem;">La noticia que buscás no existe o fue eliminada.</p>
        <a href="<?= asset_url() ?>" class="btn btn-primary">← Volver al inicio</a>
      </div>
    </main>
    <?php
    require __DIR__ . '/components/footer.php';
    echo '<script src="' . asset_url('assets/js/main.js') . '?v=1.0" defer></script></body></html>';
    exit;
}

// ── SEO ────────────────────────────────────────────────────
$imgs     = $noticia['imagenes'] ?? [];
usort($imgs, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
$mainImg  = $imgs[0] ?? null;

$seoTitle       = e($noticia['titulo'] ?? '') . ' | ' . SITE_NAME;
$seoDescription = !empty($noticia['subtitulo'])
    ? $noticia['subtitulo']
    : mb_substr(strip_tags($noticia['texto'] ?? ''), 0, 160);
$seoImage     = $mainImg['url'] ?? '';
$seoCanonical = cms_url('noticia.php?slug=' . urlencode($slug));
$seoType      = 'article';

// JSON-LD NewsArticle
$jsonLd = json_encode([
    '@context'         => 'https://schema.org',
    '@type'            => 'NewsArticle',
    'headline'         => $noticia['titulo'] ?? '',
    'description'      => $seoDescription,
    'image'            => $seoImage ?: null,
    'datePublished'    => $noticia['created_at'] ?? '',
    'dateModified'     => $noticia['updated_at'] ?? '',
    'author'           => ['@type' => 'Organization', 'name' => SITE_NAME],
    'publisher'        => ['@type' => 'Organization', 'name' => SITE_NAME, 'url' => SITE_URL],
    'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $seoCanonical],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

require __DIR__ . '/components/head.php';
require __DIR__ . '/components/header.php';
?>

<main id="main-content">
  <article class="noticia-detail" itemscope itemtype="https://schema.org/NewsArticle">
    <div class="container-cms">

      <!-- Breadcrumb + volver -->
      <nav aria-label="Volver" style="margin-bottom:1.5rem;">
        <a href="<?= cms_url() ?>#noticias" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver a noticias
        </a>
      </nav>

      <!-- Meta -->
      <p class="meta">
        <time datetime="<?= e($noticia['created_at'] ?? '') ?>" itemprop="datePublished">
          <?= e(cms_format_date($noticia['created_at'] ?? '')) ?>
        </time>
      </p>

      <!-- Título -->
      <h1 itemprop="headline"><?= e($noticia['titulo'] ?? '') ?></h1>

      <?php if (!empty($noticia['subtitulo'])): ?>
        <p style="font-size:1.15rem;color:#6b7280;margin-bottom:2rem;" itemprop="description">
          <?= e($noticia['subtitulo']) ?>
        </p>
      <?php endif; ?>

      <!-- Imagen principal -->
      <?php if ($mainImg): ?>
        <img
          src="<?= e($mainImg['url']) ?>"
          alt="<?= e($mainImg['alt'] ?? $noticia['titulo'] ?? '') ?>"
          <?php if (!empty($mainImg['title'])): ?>title="<?= e($mainImg['title']) ?>"<?php endif; ?>
          class="noticia-detail-img"
          loading="eager"
          width="1200"
          height="520"
          itemprop="image"
        >
      <?php endif; ?>

      <!-- Contenido HTML sanitizado -->
      <?php if (!empty($noticia['texto'])): ?>
        <div class="noticia-contenido" itemprop="articleBody">
          <?= cms_sanitize_html($noticia['texto']) ?>
        </div>
      <?php endif; ?>

      <!-- Galería de imágenes adicionales (a partir de la segunda) -->
      <?php
        $galeriaImgs = array_slice($imgs, 1);
        if (!empty($galeriaImgs)):
      ?>
        <h2 style="margin-top:3rem;margin-bottom:1rem;font-size:1.3rem;font-weight:700;">Galería</h2>
        <div class="noticia-gallery" role="list" aria-label="Galería de imágenes">
          <?php foreach ($galeriaImgs as $gImg): ?>
            <img
              src="<?= e($gImg['url']) ?>"
              alt="<?= e($gImg['alt'] ?? '') ?>"
              loading="lazy"
              width="400"
              height="160"
              role="listitem"
            >
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <!-- Volver al pie -->
      <div style="margin-top:3rem;padding-top:2rem;border-top:1px solid #e5e7eb;">
        <a href="<?= cms_url() ?>#noticias" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver a noticias
        </a>
      </div>

    </div>
  </article>
</main>

<?php require __DIR__ . '/components/footer.php'; ?>

<script src="<?= asset_url('assets/js/main.js') ?>?v=1.0" defer></script>
</body>
</html>
