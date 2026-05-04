<?php
/**
 * Componente: Footer dinámico.
 * Variable esperada: $footer (array | null)
 */

if (!isset($footer)) {
    // Footer mínimo si no hay datos
    $footer = null;
}

// Ordenar columnas por 'orden' ASC
if ($footer && !empty($footer['columnas'])) {
    usort($footer['columnas'], fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
}
// Ordenar redes y legales
if ($footer && !empty($footer['redes'])) {
    usort($footer['redes'], fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
}
if ($footer && !empty($footer['legales'])) {
    usort($footer['legales'], fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
}

$colCount = (int) ($footer['columnas_count'] ?? 1);
$colClass = "footer-cols footer-cols-{$colCount}";
?>
<footer class="site-footer" id="footer" aria-label="Pie de página">
    <div class="container-cms">

        <?php if ($footer && !empty($footer['columnas'])): ?>
            <div class="<?= e($colClass) ?>">
                <?php foreach ($footer['columnas'] as $col): ?>
                    <?php
                    $tipo = $col['tipo'] ?? '';
                    $data = $col['data'] ?? [];
                    ?>

                    <div class="footer-col">
                        <?php if ($tipo === 'media_texto'): ?>
                            <?php if (!empty($data['imagen'])): ?>
                                <img src="<?= e($data['imagen']) ?>" alt="<?= e(SITE_NAME) ?> logo" class="footer-logo-img"
                                    loading="lazy">
                            <?php else: ?>
                                <p class="site-logo footer-logo-text" style="font-size:1.2rem;color:#fff;margin-bottom:1rem;">
                                    <?= e(SITE_NAME) ?>
                                </p>
                            <?php endif; ?>
                            <?php if (!empty($data['descripcion'])): ?>
                                <p class="footer-desc"><?= e($data['descripcion']) ?></p>
                            <?php endif; ?>

                        <?php elseif ($tipo === 'lista_enlaces'): ?>
                            <?php
                            $enlaces = $data['enlaces'] ?? [];
                            usort($enlaces, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
                            ?>
                            <?php if (!empty($enlaces)): ?>
                                <ul class="footer-links" role="list">
                                    <?php foreach ($enlaces as $enlace): ?>
                                        <li>
                                            <a href="<?= e($enlace['url'] ?? '#') ?>">
                                                <?= e($enlace['texto'] ?? '') ?>
                                            </a>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php endif; ?>

                        <?php elseif ($tipo === 'contacto'): ?>
                            <p class="footer-col-title">Contacto</p>
                            <?php if (!empty($data['direccion'])): ?>
                                <div class="footer-contact-item">
                                    <svg class="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span><?= e($data['direccion']) ?></span>
                                </div>
                            <?php endif; ?>
                            <?php if (!empty($data['telefono'])): ?>
                                <div class="footer-contact-item">
                                    <svg class="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a
                                        href="tel:<?= e(preg_replace('/[^0-9+]/', '', $data['telefono'])) ?>"><?= e($data['telefono']) ?></a>
                                </div>
                            <?php endif; ?>
                            <?php if (!empty($data['email'])): ?>
                                <div class="footer-contact-item">
                                    <svg class="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href="mailto:<?= e($data['email']) ?>"><?= e($data['email']) ?></a>
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>

                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Barra inferior -->
        <div class="footer-bottom">
            <p class="footer-copyright">
                <?php if ($footer && !empty($footer['copyright_text'])): ?>
                    <?= e($footer['copyright_text']) ?>
                <?php else: ?>
                    &copy; <?= date('Y') ?>     <?= e(SITE_NAME) ?>. Todos los derechos reservados.
                <?php endif; ?>
            </p>

            <?php if ($footer && !empty($footer['redes'])): ?>
                <div class="social-links" role="list" aria-label="Redes sociales">
                    <?php foreach ($footer['redes'] as $red): ?>
                        <a href="<?= e($red['url'] ?? '#') ?>" class="social-link" target="_blank" rel="noopener noreferrer"
                            aria-label="<?= e($red['nombre'] ?? 'Red social') ?>" role="listitem">
                            <?php
                            // El SVG viene de la API (fuente confiable). Sanitizamos atributos peligrosos.
                            $svg = $red['svg_icon'] ?? '';
                            $svg = preg_replace('/\s+on\w+\s*=\s*(?:"[^"]*"|\'[^\']*\')/i', '', $svg);
                            $svg = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $svg);
                            echo $svg;
                            ?>
                        </a>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if ($footer && !empty($footer['legales'])): ?>
                <nav class="footer-legal" aria-label="Links legales">
                    <?php foreach ($footer['legales'] as $legal): ?>
                        <a href="<?= e($legal['url'] ?? '#') ?>"><?= e($legal['texto'] ?? '') ?></a>
                    <?php endforeach; ?>
                </nav>
            <?php endif; ?>
        </div>

    </div>
</footer>