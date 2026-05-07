<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'seo';
$headerTitle = 'SEO — Páginas Estáticas';
$pageTitle   = 'SEO — Páginas Estáticas';

// Páginas estáticas del frontend público
$staticPages = [
    ['slug' => 'home',       'label' => 'Inicio (Home)',          'url' => '/'],
    ['slug' => 'nosotros',   'label' => 'Nosotros',               'url' => '/nosotros'],
    ['slug' => 'servicios',  'label' => 'Servicios',              'url' => '/servicios'],
    ['slug' => 'productos',  'label' => 'Catálogo de Productos',  'url' => '/productos'],
    ['slug' => 'noticias',   'label' => 'Noticias / Blog',        'url' => '/noticias'],
    ['slug' => 'contacto',   'label' => 'Contacto',               'url' => '/contacto'],
    ['slug' => 'faqs',       'label' => 'Preguntas Frecuentes',   'url' => '/faqs'],
];
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <link rel="stylesheet" href="assets/css/seo.css">
    <style>
        .pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--space-4);
        }
        .page-card {
            background: var(--color-bg-elevated);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            cursor: pointer;
            transition: border-color var(--transition-base), box-shadow var(--transition-base);
        }
        .page-card:hover,
        .page-card.active {
            border-color: var(--color-accent);
            box-shadow: 0 0 0 3px var(--color-accent-glow);
        }
        .page-card-title {
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
            margin-bottom: var(--space-1);
        }
        .page-card-url {
            font-size: var(--font-size-xs);
            color: var(--color-text-tertiary);
            font-family: monospace;
        }
        .page-card-status {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: var(--font-size-xs);
            margin-top: var(--space-2);
        }
        .status-dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: var(--color-text-tertiary);
        }
        .status-dot.configured { background: #10b981; }
        #seo-editor-panel {
            margin-top: var(--space-6);
            display: none;
        }
        #seo-editor-panel.visible { display: block; }
        .seo-editor-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--space-4);
        }
        .btn-link {
            background: none;
            border: none;
            color: var(--color-accent);
            cursor: pointer;
            font-size: var(--font-size-sm);
            padding: 0;
        }
    </style>
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">SEO — Páginas Estáticas</h2>
                    <p class="page-subtitle">Configure los metadatos SEO de cada página pública del sitio</p>
                </div>
            </div>

            <!-- Grilla de páginas -->
            <div class="card">
                <div class="card-header">
                    <span class="card-header-title">Seleccione una página para editar su SEO</span>
                </div>
                <div class="card-body">
                    <div class="pages-grid" id="pages-grid">
                        <?php foreach ($staticPages as $page): ?>
                        <div class="page-card"
                             data-slug="<?= htmlspecialchars($page['slug']) ?>"
                             data-label="<?= htmlspecialchars($page['label']) ?>"
                             onclick="selectPage(this)">
                            <div class="page-card-title"><?= htmlspecialchars($page['label']) ?></div>
                            <div class="page-card-url"><?= htmlspecialchars($page['url']) ?></div>
                            <div class="page-card-status" id="status-<?= htmlspecialchars($page['slug']) ?>">
                                <span class="status-dot"></span>
                                <span class="status-text">Verificando...</span>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Panel editor de SEO -->
            <div id="seo-editor-panel">
                <div class="seo-editor-header">
                    <div>
                        <h3 style="font-size:var(--font-size-lg);font-weight:var(--font-weight-semibold)" id="editor-page-title">—</h3>
                        <p style="color:var(--color-text-tertiary);font-size:var(--font-size-sm)" id="editor-page-url">—</p>
                    </div>
                    <button type="button" class="btn btn-primary" id="btn-save-seo">
                        <span class="spinner"></span><span class="btn-text">Guardar SEO</span>
                    </button>
                </div>
                <!-- El acordeón SEO se monta aquí -->
                <div id="seo-accordion-mount-paginas"></div>
            </div>

        </main>
    </div>

    <div id="toast-container"></div>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/seo-accordion.js"></script>
    <script>
    'use strict';

    let seoAccordion = null;
    let currentSlug  = null;

    // Inicializar acordeón oculto para re-usar al cambiar de página
    seoAccordion = new SeoAccordion({
        container: '#seo-accordion-mount-paginas',
        namespace: 'pagina-seo',
    });
    seoAccordion.open();

    // Verificar configuración de todas las páginas al cargar
    document.addEventListener('DOMContentLoaded', async () => {
        const slugs = <?= json_encode(array_column($staticPages, 'slug')) ?>;
        await Promise.all(slugs.map(slug => checkPageStatus(slug)));
        document.getElementById('btn-save-seo').addEventListener('click', saveSeo);
    });

    async function checkPageStatus(slug) {
        const statusEl = document.getElementById('status-' + slug);
        if (!statusEl) return;
        try {
            const res = await Api.getSeo('pagina', slug);
            const hasData = res.data && Object.values(res.data).some(v =>
                v !== null && v !== undefined && v !== '' && !['uuid','entity_type','entity_uuid','created_at','updated_at'].includes(v)
            );
            const dot  = statusEl.querySelector('.status-dot');
            const text = statusEl.querySelector('.status-text');
            if (res.data?.title || res.data?.meta_description) {
                dot.classList.add('configured');
                text.textContent = 'Configurado';
            } else {
                text.textContent = 'Sin configurar';
            }
        } catch {
            statusEl.querySelector('.status-text').textContent = 'Sin configurar';
        }
    }

    function selectPage(card) {
        document.querySelectorAll('.page-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const slug  = card.dataset.slug;
        const label = card.dataset.label;
        currentSlug = slug;

        document.getElementById('editor-page-title').textContent = label;
        document.getElementById('editor-page-url').textContent   = card.querySelector('.page-card-url').textContent;
        document.getElementById('seo-editor-panel').classList.add('visible');

        loadSeoForPage(slug);
    }

    async function loadSeoForPage(slug) {
        try {
            const res = await Api.getSeo('pagina', slug);
            seoAccordion.populate(res.data ?? {});
        } catch {
            seoAccordion.populate({});
        }
    }

    async function saveSeo() {
        if (!currentSlug) return;
        const data = seoAccordion.collect();
        if (!data) {
            Toast.error('Complete al menos un campo SEO antes de guardar.');
            return;
        }
        const btn = document.getElementById('btn-save-seo');
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            await Api.upsertSeo('pagina', currentSlug, data);
            Toast.success('SEO guardado correctamente.');
            await checkPageStatus(currentSlug);
        } catch (e) {
            Toast.error(e.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }
    </script>
</body>

</html>
