<?php
/** Header con navegación. Variable opcional: $currentRoute */
$cur = $currentRoute ?? '';
?>
<header class="vm-header" role="banner">
    <div class="vm-container vm-header-inner">
        <a href="/" class="vm-brand" aria-label="<?= e(SITE_NAME) ?> — Inicio">
            <span class="vm-brand-dot"></span>
            <span><?= e(SITE_NAME) ?></span>
        </a>

        <nav class="vm-nav" aria-label="Navegación principal">
            <a href="/" class="vm-nav-link" <?= $cur === 'home' ? 'aria-current="page"' : '' ?>>Inicio</a>
            <a href="/productos" class="vm-nav-link" <?= $cur === 'productos' ? 'aria-current="page"' : '' ?>>Catálogo</a>
            <a href="/noticias" class="vm-nav-link" <?= $cur === 'noticias' ? 'aria-current="page"' : '' ?>>Noticias</a>
            <a href="/faqs" class="vm-nav-link" <?= $cur === 'faqs' ? 'aria-current="page"' : '' ?>>Preguntas</a>
            <a href="/#contacto" class="vm-nav-link">Contacto</a>
        </nav>

        <div class="flex items-center gap-2">
            <button type="button" class="vm-btn vm-btn-icon vm-btn-ghost vm-cart-btn" id="vm-cart-toggle" aria-label="Abrir carrito" aria-haspopup="dialog">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span class="vm-cart-count" data-cart-count aria-live="polite">0</span>
            </button>

            <button type="button" class="vm-btn vm-btn-icon vm-btn-ghost vm-menu-toggle" id="vm-menu-toggle" aria-label="Menú" aria-expanded="false" aria-controls="vm-mobile-menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="3" y1="6"  x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>
        </div>
    </div>
</header>

<!-- Menú móvil -->
<nav id="vm-mobile-menu" class="vm-mobile-menu" aria-hidden="true" aria-label="Navegación móvil">
    <a href="/" class="vm-nav-link">Inicio</a>
    <a href="/productos" class="vm-nav-link">Catálogo</a>
    <a href="/noticias" class="vm-nav-link">Noticias</a>
    <a href="/faqs" class="vm-nav-link">Preguntas</a>
    <a href="/#contacto" class="vm-nav-link">Contacto</a>
</nav>

<main id="main" tabindex="-1">
