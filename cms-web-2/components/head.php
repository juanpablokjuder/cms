<?php
/**
 * <head> global. Variables esperadas:
 *   $seo (array) — opcional: title, description, url, image, type
 *   $extraStyles, $extraScripts (string) — opcional
 */
$seo = $seo ?? [];
?>
<!DOCTYPE html>
<html lang="<?= e(SITE_LANG) ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#002147">
<meta name="format-detection" content="telephone=no">

<?= render_seo_meta($seo) ?>

<!-- Datos del sitio expuestos al JS (no incluyen el WEB_API_TOKEN) -->
<meta name="vm-whatsapp" content="<?= e(SITE_WHATSAPP) ?>">
<meta name="vm-site-name" content="<?= e(SITE_NAME) ?>">

<!-- Tailwind CSS via Play CDN (free, no build) -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  // Configuración mínima de Tailwind para integrarse con nuestro sistema de diseño
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary:    '#002147',
          'primary-dark': '#0B1C2C',
          accent:     '#082567',
          cta:        '#0E7CFF',
          gold:       '#D4AF37',
        },
        fontFamily: {
          display: ['Manrope', 'system-ui', 'sans-serif'],
          body:    ['Inter',   'system-ui', 'sans-serif'],
        },
      },
    },
  };
</script>

<!-- Google Fonts: Manrope (display) + Inter (body) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Estilos propios (después de Tailwind para tener prioridad) -->
<link rel="stylesheet" href="<?= asset('assets/css/styles.css') ?>?v=1">

<?= $extraStyles ?? '' ?>
</head>
<body>
<!-- Skip to main para accesibilidad por teclado -->
<a href="#main" class="vm-skip-to-main">Saltar al contenido principal</a>

<!-- Page loader (se oculta cuando JS termina de inicializar) -->
<div id="vm-page-loader" role="status" aria-label="Cargando">
    <div class="loader-brand"><?= e(SITE_NAME) ?></div>
    <div class="loader-bar" aria-hidden="true"></div>
</div>
