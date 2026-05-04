<?php
/**
 * Sección: Nosotros (singleton).
 * Variable esperada: $nosotros (array | null)
 * Si es null, la sección no se renderiza.
 */

if (empty($nosotros)) return;

// Ordenar imágenes por 'orden' ASC
$imgs = $nosotros['imagenes'] ?? [];
usort($imgs, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
?>
<section class="nosotros-section" id="nosotros" aria-label="Sobre nosotros">
  <div class="container-cms">
    <div class="nosotros-grid">

      <!-- Texto -->
      <div class="fade-in">
        <span class="section-eyebrow">Quiénes somos</span>
        <h2 class="section-title"><?= e($nosotros['titulo'] ?? '') ?></h2>
        <?php if (!empty($nosotros['subtitulo'])): ?>
          <p class="section-subtitle" style="margin-top:.75rem;"><?= e($nosotros['subtitulo']) ?></p>
        <?php endif; ?>
        <?php if (!empty($nosotros['texto'])): ?>
          <div class="nosotros-text">
            <?= cms_sanitize_html($nosotros['texto']) ?>
          </div>
        <?php endif; ?>

        <!-- Stats decorativos -->
        <div class="nosotros-stats" aria-hidden="true">
          <div class="stat-item">
            <div class="stat-num" data-target="5000">0</div>
            <div class="stat-label">Clientes satisfechos</div>
          </div>
          <div class="stat-item">
            <div class="stat-num" data-target="10">0</div>
            <div class="stat-label">Años de experiencia</div>
          </div>
          <div class="stat-item">
            <div class="stat-num" data-target="200">0</div>
            <div class="stat-label">Modelos disponibles</div>
          </div>
        </div>
      </div>

      <!-- Galería de imágenes -->
      <?php if (!empty($imgs)): ?>
        <div class="nosotros-gallery fade-in fade-in-delay-2" aria-label="Galería de imágenes">
          <?php foreach (array_slice($imgs, 0, 4) as $img): ?>
            <div class="nosotros-gallery-item">
              <img
                src="<?= e($img['url'] ?? '') ?>"
                alt="<?= e($img['alt'] ?? SITE_NAME) ?>"
                <?php if (!empty($img['title'])): ?>title="<?= e($img['title']) ?>"<?php endif; ?>
                loading="lazy"
                width="600"
                height="400"
              >
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

    </div>
  </div>
</section>
