<?php
/**
 * Home — Vértice Mobile
 * Secciones: Hero, Productos destacados, Servicios, Nosotros, Contacto
 */

// ── Fetch en paralelo de todas las secciones ────────────────────────────
$banners      = api_banners('home');
$nosotros     = api_nosotros();
$servicios    = api_servicios();
$destacados   = api_productos(['limit' => 8, 'sort' => 'recent']);
$currentRoute = 'home';

// SEO
$seoImage = '';
if (!empty($banners[0]['imagen']))                     $seoImage = $banners[0]['imagen'];
elseif (!empty($nosotros['imagenes'][0]['url']))       $seoImage = $nosotros['imagenes'][0]['url'];

$seo = [
    'title'       => SITE_NAME . ' · ' . SITE_TAGLINE,
    'description' => SITE_DESCRIPTION,
    'url'         => site_url(),
    'image'       => $seoImage,
];

require __DIR__ . '/../components/head.php';
require __DIR__ . '/../components/header.php';
?>

<!-- ════════════════════════════════════════════════════
     HERO BANNER (slider de banners de la API)
     ════════════════════════════════════════════════════ -->
<section class="vm-hero" aria-label="Bienvenida">
    <?php
    if (!empty($banners)) {
        usort($banners, fn($a,$b) => ($a['orden']??0) <=> ($b['orden']??0));
        foreach ($banners as $i => $b):
            $isFirst = $i === 0;
            $heroImg = !empty($b['imagen']) ? $b['imagen'] : '';
    ?>
        <div class="vm-hero-slide" data-active="<?= $isFirst ? 'true' : 'false' ?>" data-slide="<?= $i ?>">
            <?php if ($heroImg): ?>
                <div class="vm-hero-image" style="background-image:url('<?= e($heroImg) ?>')" aria-hidden="true"></div>
            <?php endif; ?>
            <div class="vm-hero-inner vm-container">
                <span class="vm-hero-eyebrow"><?= e($b['texto_2'] ?? 'Tecnología premium') ?></span>
                <h1><?= e($b['h1']) ?></h1>
                <?php if (!empty($b['texto_1'])): ?>
                    <p><?= e($b['texto_1']) ?></p>
                <?php endif; ?>
                <div class="flex flex-wrap gap-3">
                    <?php if (!empty($b['btn_texto']) && !empty($b['btn_link'])): ?>
                        <a href="<?= e($b['btn_link']) ?>" class="vm-btn vm-btn-cta vm-btn-lg"><?= e($b['btn_texto']) ?></a>
                    <?php else: ?>
                        <a href="/productos" class="vm-btn vm-btn-cta vm-btn-lg">Ver catálogo</a>
                    <?php endif; ?>
                    <a href="#destacados" class="vm-btn vm-btn-on-dark vm-btn-lg">Productos destacados</a>
                </div>
            </div>
        </div>
    <?php endforeach;
    } else { ?>
        <!-- Fallback hero cuando no hay banners cargados en el CMS -->
        <div class="vm-hero-slide" data-active="true">
            <div class="vm-hero-inner vm-container">
                <span class="vm-hero-eyebrow">Edición premium · Argentina</span>
                <h1>El próximo capítulo en alta gama.</h1>
                <p>Descubrí los smartphones más avanzados del mercado con garantía oficial, financiación y servicio post-venta directo.</p>
                <div class="flex flex-wrap gap-3">
                    <a href="/productos" class="vm-btn vm-btn-cta vm-btn-lg">Explorar catálogo</a>
                    <a href="#contacto" class="vm-btn vm-btn-on-dark vm-btn-lg">Contactanos</a>
                </div>
            </div>
        </div>
    <?php } ?>

    <?php if (count($banners) > 1): ?>
        <div class="vm-hero-dots" role="tablist" aria-label="Banners">
            <?php foreach ($banners as $i => $_): ?>
                <button type="button" class="vm-hero-dot" role="tab"
                        aria-current="<?= $i === 0 ? 'true' : 'false' ?>"
                        aria-label="Banner <?= $i + 1 ?>"
                        data-go="<?= $i ?>"></button>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</section>

<!-- ════════════════════════════════════════════════════
     PRODUCTOS DESTACADOS
     ════════════════════════════════════════════════════ -->
<section class="vm-section" id="destacados" aria-labelledby="destacados-h">
    <div class="vm-container">
        <div class="vm-section-head">
            <div>
                <span class="vm-eyebrow">Destacados</span>
                <h2 id="destacados-h">Lo más buscado de la temporada</h2>
            </div>
            <a href="/productos" class="vm-btn vm-btn-ghost">Ver todo el catálogo →</a>
        </div>

        <?php if (!empty($destacados['data'])): ?>
            <div class="vm-product-grid" data-cols="4">
                <?php foreach ($destacados['data'] as $product): ?>
                    <?php require __DIR__ . '/../components/product-card.php'; ?>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <?php
                $title    = 'Pronto agregaremos productos';
                $message  = 'Estamos preparando nuestra primera colección. Volvé en unos días.';
                $ctaLabel = 'Suscribirme por email';
                $ctaHref  = '#contacto';
                require __DIR__ . '/../components/empty-state.php';
            ?>
        <?php endif; ?>
    </div>
</section>

<!-- ════════════════════════════════════════════════════
     SERVICIOS — Logística y Garantía
     ════════════════════════════════════════════════════ -->
<section class="vm-section vm-section-soft" aria-labelledby="servicios-h">
    <div class="vm-container">
        <div class="vm-section-head">
            <div>
                <span class="vm-eyebrow">Por qué elegirnos</span>
                <h2 id="servicios-h"><?= e($servicios['servicio']['titulo'] ?? 'Logística, garantía y soporte de fábrica') ?></h2>
                <?php if (!empty($servicios['servicio']['subtitulo'])): ?>
                    <p class="text-slate-600 mt-3 max-w-2xl"><?= e($servicios['servicio']['subtitulo']) ?></p>
                <?php endif; ?>
            </div>
        </div>

        <?php if (!empty($servicios['categorias'])): ?>
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <?php foreach (array_slice($servicios['categorias'], 0, 3) as $cat): ?>
                    <article class="vm-card p-6 vm-reveal">
                        <h3 class="font-display text-xl mb-2"><?= e($cat['nombre']) ?></h3>
                        <ul class="space-y-3 mt-4">
                            <?php foreach (array_slice($cat['items'] ?? [], 0, 4) as $item): ?>
                                <li class="flex gap-3">
                                    <span class="w-1.5 h-1.5 rounded-full bg-cta mt-2 flex-shrink-0" style="background:var(--vm-cta)"></span>
                                    <div>
                                        <strong class="block"><?= e($item['titulo']) ?></strong>
                                        <?php if (!empty($item['subtitulo_1'])): ?>
                                            <span class="text-sm text-slate-600"><?= e($item['subtitulo_1']) ?></span>
                                        <?php endif; ?>
                                    </div>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <!-- Fallback estático con beneficios típicos de e-commerce premium -->
            <div class="grid gap-6 md:grid-cols-3">
                <article class="vm-card p-6">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background:rgba(0,33,71,0.06);color:var(--vm-primary)">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <h3 class="font-display text-xl mb-2">Envío express</h3>
                    <p class="text-slate-600 text-sm">Entrega en 24-72h en CABA y GBA. Envíos a todo el país con seguimiento.</p>
                </article>
                <article class="vm-card p-6">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background:rgba(0,33,71,0.06);color:var(--vm-primary)">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 class="font-display text-xl mb-2">Garantía oficial</h3>
                    <p class="text-slate-600 text-sm">12 meses de garantía oficial del fabricante. Servicio técnico autorizado.</p>
                </article>
                <article class="vm-card p-6">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background:rgba(0,33,71,0.06);color:var(--vm-primary)">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    </div>
                    <h3 class="font-display text-xl mb-2">Hasta 12 cuotas</h3>
                    <p class="text-slate-600 text-sm">Financiación con todas las tarjetas. Promociones bancarias vigentes.</p>
                </article>
            </div>
        <?php endif; ?>
    </div>
</section>

<!-- ════════════════════════════════════════════════════
     NOSOTROS
     ════════════════════════════════════════════════════ -->
<?php if ($nosotros): ?>
<section class="vm-section" aria-labelledby="nosotros-h">
    <div class="vm-container">
        <div class="grid gap-10 lg:grid-cols-2 items-center">
            <div class="vm-reveal">
                <span class="vm-eyebrow" style="color:var(--vm-cta)">Sobre Nosotros</span>
                <h2 id="nosotros-h"><?= e($nosotros['titulo']) ?></h2>
                <?php if (!empty($nosotros['subtitulo'])): ?>
                    <p class="text-lg text-slate-600 mt-4 leading-relaxed"><?= e($nosotros['subtitulo']) ?></p>
                <?php endif; ?>
                <div class="prose prose-slate mt-4 max-w-none text-slate-700 leading-relaxed">
                    <?= sanitize_html($nosotros['texto']) ?>
                </div>
            </div>
            <?php if ($img = first_image($nosotros['imagenes'] ?? [])): ?>
                <div class="vm-reveal">
                    <div class="overflow-hidden rounded-3xl shadow-xl aspect-[4/5]">
                        <img src="<?= e($img['url']) ?>" alt="<?= e($img['alt'] ?? $nosotros['titulo']) ?>" loading="lazy" class="w-full h-full object-cover">
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ════════════════════════════════════════════════════
     CONTACTO (formulario)
     ════════════════════════════════════════════════════ -->
<section class="vm-section vm-section-dark" id="contacto" aria-labelledby="contacto-h">
    <div class="vm-container">
        <div class="grid gap-10 lg:grid-cols-2 items-start">
            <div>
                <span class="vm-eyebrow" style="color:var(--vm-gold)">Hablemos</span>
                <h2 id="contacto-h">¿Buscás un equipo en particular?</h2>
                <p class="mt-4 text-lg opacity-80 max-w-xl">Nuestros asesores te ayudan a encontrar el smartphone ideal según tu uso, presupuesto y financiación.</p>

                <ul class="space-y-4 mt-8">
                    <?php if (SITE_PHONE): ?>
                    <li class="flex gap-3 items-center">
                        <span class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,.08)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </span>
                        <a href="tel:<?= e(SITE_PHONE) ?>" class="hover:text-cta transition-colors">
                            <?= e(SITE_PHONE) ?>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if (SITE_EMAIL): ?>
                    <li class="flex gap-3 items-center">
                        <span class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,.08)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </span>
                        <a href="mailto:<?= e(SITE_EMAIL) ?>" class="hover:text-cta transition-colors">
                            <?= e(SITE_EMAIL) ?>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if (SITE_WHATSAPP): ?>
                    <li class="flex gap-3 items-center">
                        <span class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(16,185,129,.18)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A8 8 0 0 0 4 12a8 8 0 0 0 1.18 4.18L4 22l5.96-1.16A8 8 0 0 0 20 12a8 8 0 0 0-2.4-5.68z"/></svg>
                        </span>
                        <a href="https://wa.me/<?= e(SITE_WHATSAPP) ?>" target="_blank" rel="noopener" class="hover:text-cta transition-colors">
                            WhatsApp
                        </a>
                    </li>
                    <?php endif; ?>
                </ul>
            </div>

            <form id="vm-contact-form" class="vm-form bg-white/5 p-8 rounded-2xl border border-white/10" novalidate>
                <div class="vm-form-row cols-2">
                    <div>
                        <label for="cf-name" class="vm-form-label" style="color:rgba(255,255,255,.85)">Nombre <span class="required">*</span></label>
                        <input type="text" id="cf-name" name="name" class="vm-input" required minlength="2" maxlength="80" autocomplete="name">
                        <p class="vm-error-msg" data-error="name"></p>
                    </div>
                    <div>
                        <label for="cf-email" class="vm-form-label" style="color:rgba(255,255,255,.85)">Email <span class="required">*</span></label>
                        <input type="email" id="cf-email" name="email" class="vm-input" required maxlength="120" autocomplete="email">
                        <p class="vm-error-msg" data-error="email"></p>
                    </div>
                </div>
                <div>
                    <label for="cf-message" class="vm-form-label" style="color:rgba(255,255,255,.85)">Mensaje <span class="required">*</span></label>
                    <textarea id="cf-message" name="message" class="vm-input" required minlength="10" maxlength="2000" rows="5"></textarea>
                    <p class="vm-error-msg" data-error="message"></p>
                </div>
                <button type="submit" class="vm-btn vm-btn-cta vm-btn-lg w-full">
                    <span data-btn-label>Enviar consulta</span>
                </button>
                <p class="text-xs opacity-60 text-center">Te respondemos en menos de 2 horas hábiles.</p>
            </form>
        </div>
    </div>
</section>

<?php
$extraScripts = '<script src="' . asset('assets/js/home.js') . '?v=1"></script>';
require __DIR__ . '/../components/footer.php';
?>
