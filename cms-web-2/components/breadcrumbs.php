<?php
/** Breadcrumbs accesibles. Espera $crumbs = [['label'=>'..', 'href'=>'..'], ...] (último sin href). */
$crumbs = $crumbs ?? [];
if (empty($crumbs)) return;
?>
<nav class="vm-breadcrumbs" aria-label="Migas de pan">
    <ol>
        <?php foreach ($crumbs as $i => $c): ?>
            <li>
                <?php if (!empty($c['href']) && $i < count($crumbs) - 1): ?>
                    <a href="<?= e($c['href']) ?>"><?= e($c['label']) ?></a>
                <?php else: ?>
                    <span aria-current="page"><?= e($c['label']) ?></span>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ol>
</nav>
