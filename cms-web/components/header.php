<?php
/**
 * Componente: Header / Navegación principal.
 * Sticky, con menú responsive mobile.
 */
?>
<header class="site-header" role="banner">
    <div class="container-cms header-inner">

        <!-- Logo -->
        <a href="<?= cms_url() ?>" class="site-logo" aria-label="<?= e(SITE_NAME) ?> — inicio">
            <?= e(SITE_NAME) ?><span class="logo-dot" aria-hidden="true"></span>
        </a>

        <!-- Menú principal -->
        <nav aria-label="Navegación principal">
            <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav-list">
                <span></span><span></span><span></span>
            </button>

            <ul class="nav-links" id="nav-list" role="list">
                <li><a href="#hero">Inicio</a></li>
                <li><a href="#nosotros">Nosotros</a></li>
                <li><a href="#servicios">Servicios</a></li>
                <li><a href="#noticias">Noticias</a></li>
                <li><a href="#faqs">FAQ</a></li>
                <li><a href="#footer">Contacto</a></li>
            </ul>
        </nav>

    </div>
</header>