<?php
/** Empty state. Espera $title, $message, $ctaLabel, $ctaHref (opcional). */
$title    = $title    ?? 'Sin resultados';
$message  = $message  ?? '';
$ctaLabel = $ctaLabel ?? null;
$ctaHref  = $ctaHref  ?? '#';
?>
<div class="vm-empty">
    <div class="vm-empty-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    </div>
    <h3><?= e($title) ?></h3>
    <?php if ($message): ?><p class="max-w-md mx-auto"><?= e($message) ?></p><?php endif; ?>
    <?php if ($ctaLabel): ?>
        <a href="<?= e($ctaHref) ?>" class="vm-btn vm-btn-primary mt-6"><?= e($ctaLabel) ?></a>
    <?php endif; ?>
</div>
