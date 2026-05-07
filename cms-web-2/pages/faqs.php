<?php
/**
 * /faqs — Preguntas frecuentes con acordeón semántico (<details>).
 */
$currentRoute = 'faqs';
$faqs         = api_faqs();

// JSON-LD para SEO
$jsonLd = '';
if (!empty($faqs)) {
    $schema = ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => []];
    foreach ($faqs as $g) {
        foreach ($g['items'] ?? [] as $it) {
            $schema['mainEntity'][] = [
                '@type'          => 'Question',
                'name'           => $it['pregunta'] ?? '',
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => strip_tags($it['respuesta'] ?? '')],
            ];
        }
    }
    $jsonLd = json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

$seo = [
    'title'       => 'Preguntas frecuentes · ' . SITE_NAME,
    'description' => 'Respuestas a las consultas más comunes sobre envíos, garantías, financiación y servicio post-venta.',
    'url'         => site_url('faqs'),
];

$extraStyles = $jsonLd ? '<script type="application/ld+json">' . $jsonLd . '</script>' : '';

require __DIR__ . '/../components/head.php';
require __DIR__ . '/../components/header.php';

$crumbs = [
    ['label' => 'Inicio',  'href' => '/'],
    ['label' => 'Preguntas frecuentes'],
];
?>

<section class="vm-section">
    <div class="vm-container max-w-4xl">

        <?php require __DIR__ . '/../components/breadcrumbs.php'; ?>

        <div class="vm-section-head" style="display:block">
            <span class="vm-eyebrow">Soporte</span>
            <h1 class="text-4xl md:text-5xl">Preguntas frecuentes</h1>
            <p class="text-slate-600 mt-3 max-w-2xl">¿Tenés dudas? Mirá las consultas más comunes. Si no encontrás lo que buscás, escribinos.</p>
        </div>

        <?php if (!empty($faqs)): ?>
            <?php foreach ($faqs as $g): ?>
                <section class="vm-faq-group" aria-labelledby="g-<?= e($g['uuid']) ?>">
                    <h2 class="vm-faq-group-title font-display" id="g-<?= e($g['uuid']) ?>"><?= e($g['titulo']) ?></h2>
                    <?php if (!empty($g['items'])):
                        usort($g['items'], fn($a,$b) => ($a['orden']??0) <=> ($b['orden']??0));
                        foreach ($g['items'] as $it):
                    ?>
                        <details class="vm-faq">
                            <summary>
                                <span><?= e($it['pregunta']) ?></span>
                            </summary>
                            <div class="vm-faq-body">
                                <?= sanitize_html($it['respuesta']) ?>
                            </div>
                        </details>
                    <?php
                        endforeach;
                    endif; ?>
                </section>
            <?php endforeach; ?>
        <?php else: ?>
            <!-- Fallback con FAQs útiles cuando aún no hay datos del CMS -->
            <section class="vm-faq-group">
                <h2 class="vm-faq-group-title font-display">Compras y envíos</h2>
                <details class="vm-faq">
                    <summary><span>¿Cuánto tarda el envío?</span></summary>
                    <div class="vm-faq-body">
                        <p>En CABA y GBA entregamos en 24-72 horas hábiles. Al interior del país el tiempo varía entre 3 y 7 días según la zona.</p>
                    </div>
                </details>
                <details class="vm-faq">
                    <summary><span>¿Hacen envíos a todo el país?</span></summary>
                    <div class="vm-faq-body">
                        <p>Sí, enviamos a toda Argentina mediante operadores logísticos con seguimiento en tiempo real.</p>
                    </div>
                </details>
                <details class="vm-faq">
                    <summary><span>¿Cuáles son los medios de pago disponibles?</span></summary>
                    <div class="vm-faq-body">
                        <p>Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencia bancaria y pagos en efectivo en sucursales de Pago Fácil/Rapipago.</p>
                    </div>
                </details>
            </section>

            <section class="vm-faq-group">
                <h2 class="vm-faq-group-title font-display">Garantía y servicio post-venta</h2>
                <details class="vm-faq">
                    <summary><span>¿Los productos tienen garantía oficial?</span></summary>
                    <div class="vm-faq-body">
                        <p>Sí, todos nuestros productos cuentan con 12 meses de garantía oficial del fabricante, gestionable a través del servicio técnico autorizado.</p>
                    </div>
                </details>
                <details class="vm-faq">
                    <summary><span>¿Qué hago si mi equipo presenta un problema?</span></summary>
                    <div class="vm-faq-body">
                        <p>Contactanos por WhatsApp o email dentro del período de garantía. Te indicaremos el procedimiento para gestionar la reparación o reemplazo.</p>
                    </div>
                </details>
            </section>
        <?php endif; ?>

        <!-- Bloque CTA inferior -->
        <div class="mt-16 p-8 rounded-2xl text-center" style="background:var(--vm-bg-soft)">
            <h3 class="font-display text-2xl mb-2">¿No encontraste tu respuesta?</h3>
            <p class="text-slate-600 mb-6">Estamos para ayudarte. Escribinos y un asesor te responde a la brevedad.</p>
            <a href="/#contacto" class="vm-btn vm-btn-cta">Contactanos ahora</a>
        </div>

    </div>
</section>

<?php require __DIR__ . '/../components/footer.php'; ?>
