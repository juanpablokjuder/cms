<?php
/**
 * Componente: <head> con SEO completo.
 * Variables esperadas: $seoTitle, $seoDescription, $seoImage, $seoCanonical
 */

$seoTitle = $seoTitle ?? SITE_NAME . ' | ' . SITE_TAGLINE;
$seoDescription = $seoDescription ?? SITE_DESCRIPTION;
$seoImage = $seoImage ?? asset_url('assets/img/og-default.jpg');
$seoCanonical = $seoCanonical ?? (SITE_URL . parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$seoType = $seoType ?? 'website';
?>
<!DOCTYPE html>
<html lang="<?= SITE_LANG ?>" prefix="og: https://ogp.me/ns#">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- SEO Primario -->
    <title><?= e($seoTitle) ?></title>
    <meta name="description" content="<?= e($seoDescription) ?>">
    <meta name="keywords" content="<?= e(SITE_KEYWORDS) ?>">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="language" content="<?= SITE_LANG ?>">
    <link rel="canonical" href="<?= e($seoCanonical) ?>">

    <!-- Open Graph -->
    <meta property="og:type" content="<?= e($seoType) ?>">
    <meta property="og:title" content="<?= e($seoTitle) ?>">
    <meta property="og:description" content="<?= e($seoDescription) ?>">
    <meta property="og:image" content="<?= e($seoImage) ?>">
    <meta property="og:url" content="<?= e($seoCanonical) ?>">
    <meta property="og:site_name" content="<?= e(SITE_NAME) ?>">
    <meta property="og:locale" content="<?= SITE_LOCALE ?>">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= e($seoTitle) ?>">
    <meta name="twitter:description" content="<?= e($seoDescription) ?>">
    <meta name="twitter:image" content="<?= e($seoImage) ?>">

    <!-- Schema.org Organization -->
    <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "<?= e(SITE_NAME) ?>",
    "url": "<?= e(SITE_URL) ?>",
    "description": "<?= e(SITE_DESCRIPTION) ?>",
    "@id": "<?= e(SITE_URL) ?>#organization"
  }
  </script>

    <?php if (!empty($jsonLd)): // JSON-LD adicional por página (artículo, FAQPage, etc.) ?>
        <script type="application/ld+json"><?= $jsonLd ?></script>
    <?php endif; ?>

    <!-- Preconnect fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;0,900;1,700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            corePlugins: { preflight: false },
            theme: {
                extend: {
                    colors: {
                        primary: '#080c14',
                        accent: '#00d4ff',
                    }
                }
            }
        }
    </script>

    <!-- Estilos propios -->
    <link rel="stylesheet" href="<?= asset_url('assets/css/style.css') ?>?v=3.0">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?= asset_url('assets/img/favicon.ico') ?>">
</head>

<body>