<?php
/**
 * Sección: FAQs — acordeón semántico agrupado.
 * Variable esperada: $faqs (FaqGrupo[])
 * Schema.org: FAQPage con Question/Answer.
 */

if (empty($faqs))
    return;

// Preparar JSON-LD de FAQPage para agregar al <head> via $jsonLd
$faqSchema = [
    '@context' => 'https://schema.org',
    '@type' => 'FAQPage',
    'mainEntity' => [],
];
foreach ($faqs as $grupo) {
    foreach ($grupo['items'] ?? [] as $item) {
        $faqSchema['mainEntity'][] = [
            '@type' => 'Question',
            'name' => $item['pregunta'] ?? '',
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => strip_tags($item['respuesta'] ?? ''),
            ],
        ];
    }
}
// Este valor es recogido por head.php si se incluye antes
$jsonLd = json_encode($faqSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$showGroupTitle = count($faqs) > 1;
?>
<section class="faqs-section" id="faqs" aria-label="Preguntas frecuentes">
    <div class="container-cms">

        <!-- Encabezado -->
        <div class="faqs-header fade-in">
            <span class="section-eyebrow">Soporte</span>
            <h2 class="section-title">Preguntas Frecuentes</h2>
        </div>

        <!-- Grupos -->
        <div style="max-width:840px;margin-inline:auto;">
            <?php foreach ($faqs as $gi => $grupo): ?>
                <?php
                $items = $grupo['items'] ?? [];
                usort($items, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
                if (empty($items))
                    continue;
                ?>
                <div class="faq-group fade-in">
                    <?php if ($showGroupTitle && !empty($grupo['titulo'])): ?>
                        <h3 class="faq-group-title"><?= e($grupo['titulo']) ?></h3>
                    <?php endif; ?>

                    <?php foreach ($items as $ii => $item): ?>
                        <?php
                        $btnId = 'faq-btn-' . e($grupo['uuid']) . '-' . $ii;
                        $bodyId = 'faq-body-' . e($grupo['uuid']) . '-' . $ii;
                        ?>
                        <div class="accordion-item" itemscope itemtype="https://schema.org/Question">
                            <button class="accordion-btn" id="<?= $btnId ?>" aria-expanded="false"
                                aria-controls="<?= $bodyId ?>" itemprop="name">
                                <?= e($item['pregunta'] ?? '') ?>
                                <span class="accordion-icon" aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.5">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </span>
                            </button>

                            <div class="accordion-body" id="<?= $bodyId ?>" role="region" aria-labelledby="<?= $btnId ?>"
                                itemscope itemtype="https://schema.org/Answer">
                                <div class="accordion-body-inner" itemprop="text">
                                    <?= cms_sanitize_html($item['respuesta'] ?? '') ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>