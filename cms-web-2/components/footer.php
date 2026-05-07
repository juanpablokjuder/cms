<?php
/** Footer global. Espera $globalFooter (puede ser null). */
$f = $globalFooter ?? null;

// Helper local para renderizar columnas según tipo
$renderColumna = function (array $col): void {
    $tipo = $col['tipo'] ?? '';
    $data = $col['data'] ?? [];
    if ($tipo === 'media_texto') {
        if (!empty($data['imagen'])) {
            echo '<img src="' . e($data['imagen']) . '" alt="" class="mb-4 max-w-[140px] opacity-90">';
        }
        if (!empty($data['descripcion'])) {
            echo '<p class="text-sm leading-relaxed opacity-80 max-w-[28ch]">' . e($data['descripcion']) . '</p>';
        }
    } elseif ($tipo === 'lista_enlaces') {
        echo '<ul class="space-y-2 text-sm">';
        foreach ($data['enlaces'] ?? [] as $en) {
            echo '<li><a href="' . e($en['url']) . '">' . e($en['texto']) . '</a></li>';
        }
        echo '</ul>';
    } elseif ($tipo === 'contacto') {
        echo '<ul class="space-y-2 text-sm opacity-90">';
        if (!empty($data['direccion'])) echo '<li>📍 ' . e($data['direccion']) . '</li>';
        if (!empty($data['telefono']))  echo '<li>📞 <a href="tel:' . e($data['telefono']) . '">' . e($data['telefono']) . '</a></li>';
        if (!empty($data['email']))     echo '<li>✉️ <a href="mailto:' . e($data['email']) . '">' . e($data['email']) . '</a></li>';
        echo '</ul>';
    }
};
?>
</main><!-- /#main -->

<footer class="vm-footer" role="contentinfo">
    <div class="vm-container">

        <?php if ($f && !empty($f['columnas'])): ?>
            <div class="vm-footer-grid">
                <?php
                usort($f['columnas'], fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
                foreach ($f['columnas'] as $col):
                    echo '<div>';
                    $renderColumna($col);
                    echo '</div>';
                endforeach;
                ?>
            </div>
        <?php else: ?>
            <!-- Fallback footer cuando no hay datos del CMS -->
            <div class="vm-footer-grid">
                <div>
                    <h4 class="font-display font-bold mb-3"><?= e(SITE_NAME) ?></h4>
                    <p class="text-sm leading-relaxed opacity-80 max-w-[30ch]"><?= e(SITE_DESCRIPTION) ?></p>
                </div>
                <div>
                    <h4 class="font-display font-bold mb-3 text-sm uppercase tracking-wider">Tienda</h4>
                    <ul class="space-y-2 text-sm">
                        <li><a href="/productos">Catálogo completo</a></li>
                        <li><a href="/noticias">Novedades</a></li>
                        <li><a href="/faqs">Preguntas frecuentes</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-display font-bold mb-3 text-sm uppercase tracking-wider">Contacto</h4>
                    <ul class="space-y-2 text-sm opacity-90">
                        <?php if (SITE_PHONE): ?><li>📞 <a href="tel:<?= e(SITE_PHONE) ?>"><?= e(SITE_PHONE) ?></a></li><?php endif; ?>
                        <?php if (SITE_EMAIL): ?><li>✉️ <a href="mailto:<?= e(SITE_EMAIL) ?>"><?= e(SITE_EMAIL) ?></a></li><?php endif; ?>
                    </ul>
                </div>
            </div>
        <?php endif; ?>

        <?php if ($f && !empty($f['redes'])): ?>
            <div class="vm-footer-redes" aria-label="Redes sociales">
                <?php usort($f['redes'], fn($a,$b) => ($a['orden']??0) <=> ($b['orden']??0)); ?>
                <?php foreach ($f['redes'] as $r): ?>
                    <a href="<?= e($r['url']) ?>" target="_blank" rel="noopener" aria-label="<?= e($r['nombre']) ?>">
                        <?= sanitize_html($r['svg_icon'] ?? '') ?>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="vm-footer-bottom">
            <span>
                <?= e($f['copyright_text'] ?? '© ' . date('Y') . ' ' . SITE_NAME . '. Todos los derechos reservados.') ?>
            </span>
            <?php if ($f && !empty($f['legales'])): ?>
                <ul class="flex flex-wrap gap-4">
                    <?php usort($f['legales'], fn($a,$b) => ($a['orden']??0) <=> ($b['orden']??0)); ?>
                    <?php foreach ($f['legales'] as $l): ?>
                        <li><a href="<?= e($l['url']) ?>"><?= e($l['texto']) ?></a></li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </div>

    </div>
</footer>

<!-- ─── Mini-carrito (panel deslizable) ─── -->
<div class="vm-cart-overlay" id="vm-cart-overlay" aria-hidden="true"></div>
<aside class="vm-cart-panel" id="vm-cart-panel" role="dialog" aria-labelledby="vm-cart-title" aria-hidden="true">
    <div class="vm-cart-header">
        <h3 id="vm-cart-title" class="font-display">Tu carrito</h3>
        <button type="button" class="vm-btn vm-btn-icon vm-btn-ghost" id="vm-cart-close" aria-label="Cerrar carrito">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6"  x2="6"  y2="18"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
        </button>
    </div>
    <div class="vm-cart-body" id="vm-cart-body">
        <!-- Renderiza el JS -->
    </div>
    <div class="vm-cart-footer" id="vm-cart-footer" hidden>
        <div class="vm-cart-total">
            <span>Total</span>
            <strong data-cart-total>$0,00</strong>
        </div>
        <a href="#" class="vm-btn vm-btn-cta vm-btn-lg block w-full text-center" id="vm-cart-checkout" data-checkout-link>
            Finalizar pedido por WhatsApp
        </a>
        <button type="button" class="text-xs text-slate-500 mt-3 underline mx-auto block" id="vm-cart-clear">Vaciar carrito</button>
    </div>
</aside>

<!-- ─── Toast region (accesible) ─── -->
<div id="vm-toast-region" role="region" aria-live="polite" aria-label="Notificaciones"></div>

<!-- Scripts globales -->
<script src="<?= asset('assets/js/toast.js') ?>?v=1"></script>
<script src="<?= asset('assets/js/cart.js') ?>?v=1"></script>
<script src="<?= asset('assets/js/main.js') ?>?v=1"></script>
<?= $extraScripts ?? '' ?>
</body>
</html>
