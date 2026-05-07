<?php
$currentRoute = '';
$seo = [
    'title'       => '404 · Página no encontrada · ' . SITE_NAME,
    'description' => 'Lo sentimos, la página que buscás no existe.',
    'url'         => site_url('404'),
];
require __DIR__ . '/../components/head.php';
require __DIR__ . '/../components/header.php';
?>

<section class="vm-section" style="min-height:60vh">
    <div class="vm-container">
        <div class="text-center max-w-2xl mx-auto py-12">
            <div class="font-display font-bold text-cta" style="font-size:clamp(5rem, 12vw, 9rem); color:var(--vm-cta); line-height:1">
                404
            </div>
            <h1 class="font-display mt-4 text-3xl md:text-4xl">No encontramos esa página</h1>
            <p class="text-slate-600 mt-4 mb-8 text-lg">
                Es posible que el enlace haya cambiado o que la página ya no exista.
                Probá volver al inicio o explorar nuestro catálogo.
            </p>
            <div class="flex flex-wrap gap-3 justify-center">
                <a href="/" class="vm-btn vm-btn-cta">Volver al inicio</a>
                <a href="/productos" class="vm-btn vm-btn-ghost">Ver catálogo</a>
            </div>
        </div>
    </div>
</section>

<?php require __DIR__ . '/../components/footer.php'; ?>
