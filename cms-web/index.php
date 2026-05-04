<?php
/**
 * index.php — One-page principal de cms-web.
 * Todas las llamadas a la API son server-side.
 * El WEB_API_TOKEN nunca se expone al navegador.
 */

require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/lib/api.php';

// ── Fetch paralelo de datos ────────────────────────────────
// En PHP nativo simulamos "paralelo" con cURL multi o llamadas secuenciales.
// Para simplificar sin dependencias, hacemos llamadas secuenciales
// (los tiempos son mínimos con conexión local al API).
$banners = cms_get_banners('inicio');
$nosotros = cms_get_nosotros();
$servicios = cms_get_servicios();
$noticias = cms_get_noticias(1, NOTICIAS_PER_PAGE);
$faqs = cms_get_faqs();
$footer = cms_get_footer();

// ── SEO dinámico ───────────────────────────────────────────
$seoTitle = SITE_NAME . ' | ' . SITE_TAGLINE;
$seoDescription = SITE_DESCRIPTION;
$seoCanonical = SITE_URL . '/';

// Imagen OG: primer banner o imagen de nosotros
$seoImage = '';
if (!empty($banners[0]['imagen'])) {
    $seoImage = $banners[0]['imagen'];
} elseif (!empty($nosotros['imagenes'][0]['url'])) {
    $seoImage = $nosotros['imagenes'][0]['url'];
}

// JSON-LD para FAQs (lo genera la sección, lo insertamos en head)
// Se define en components/sections/faqs.php como $jsonLd
// Necesitamos definirlo antes de renderizar head:
$jsonLd = '';
if (!empty($faqs)) {
    $faqSchema = ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => []];
    foreach ($faqs as $g) {
        foreach ($g['items'] ?? [] as $item) {
            $faqSchema['mainEntity'][] = [
                '@type' => 'Question',
                'name' => $item['pregunta'] ?? '',
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => strip_tags($item['respuesta'] ?? '')],
            ];
        }
    }
    if (!empty($faqSchema['mainEntity'])) {
        $jsonLd = json_encode($faqSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}

require __DIR__ . '/components/head.php';
require __DIR__ . '/components/header.php';
?>

<div id="page-loader" role="status" aria-label="Cargando">
    <p class="loader-logo">Celulares <em>Traika</em></p>
    <div class="loader-bar"></div>
</div>

<main id="main-content">

    <?php require __DIR__ . '/components/sections/hero.php'; ?>

    <?php if ($nosotros):
        require __DIR__ . '/components/sections/nosotros.php';
    endif; ?>

    <?php if (!empty($servicios['categorias'])):
        require __DIR__ . '/components/sections/servicios.php';
    endif; ?>

    <?php if (!empty($noticias['data'])):
        require __DIR__ . '/components/sections/noticias.php';
    endif; ?>

    <?php if (!empty($faqs)):
        require __DIR__ . '/components/sections/faqs.php';
    endif; ?>

</main>

<?php require __DIR__ . '/components/footer.php'; ?>

<!-- Scripts -->
<script src="<?= asset_url('assets/js/main.js') ?>?v=2.0" defer></script>

</body>

</html>