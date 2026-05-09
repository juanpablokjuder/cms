<?php
/**
 * /productos — Catálogo
 * Server-side renderiza el primer estado leyendo query string. JS hace re-fetch
 * con AJAX al cambiar filtros/orden sin recargar la página.
 */
$currentRoute = 'productos';

// Lee query params (validados)
$page = max(1, (int) ($_GET['page'] ?? 1));
$sort = in_array($_GET['sort'] ?? '', ['recent', 'alpha_asc', 'alpha_desc', 'price_asc', 'price_desc'], true) ? $_GET['sort'] : 'recent';
$marcas = !empty($_GET['marcas']) ? explode(',', preg_replace('/[^a-zA-Z0-9 ,\-]/', '', $_GET['marcas'])) : [];
$search = trim((string) ($_GET['search'] ?? ''));

$resultado = api_productos([
    'page' => $page,
    'limit' => PRODUCTOS_PER_PAGE,
    'sort' => $sort,
    'marcas' => $marcas,
    'search' => $search,
]);

$marcasFacet = api_marcas();
$cmsSeo = api_seo('pagina', 'productos');

$seo = merge_seo([
    'title' => 'Catálogo · ' . SITE_NAME,
    'description' => 'Catálogo completo de smartphones premium en ' . SITE_NAME . '. Encontrá tu próximo equipo con financiación y garantía oficial.',
    'url' => site_url('productos'),
], $cmsSeo);

require __DIR__ . '/../components/head.php';
require __DIR__ . '/../components/header.php';

$crumbs = [
    ['label' => 'Inicio', 'href' => '/'],
    ['label' => 'Catálogo'],
];

// Total para mostrar
$total = (int) ($resultado['meta']['total'] ?? 0);
$totalPages = (int) ($resultado['meta']['totalPages'] ?? 0);
?>

<section class="vm-section">
    <div class="vm-container">

        <?php require __DIR__ . '/../components/breadcrumbs.php'; ?>

        <div class="vm-section-head">
            <div>
                <span class="vm-eyebrow">Catálogo</span>
                <h1 class="text-4xl md:text-5xl">Smartphones premium</h1>
                <p class="text-slate-600 mt-3 max-w-2xl">Encontrá tu próximo equipo entre los modelos más buscados de
                    Apple, Samsung, Google y Xiaomi.</p>
            </div>
        </div>

        <!-- Layout: sidebar + contenido -->
        <div class="vm-catalog-layout">

            <!-- ─── Sidebar de filtros ─── -->
            <aside class="vm-sidebar" aria-label="Filtros">

                <!-- Búsqueda -->
                <div class="vm-filter-group">
                    <label for="vm-search" class="vm-filter-title">Buscar</label>
                    <input type="search" id="vm-search" class="vm-input" placeholder="iPhone, Galaxy, Pixel..."
                        value="<?= e($search) ?>" aria-label="Buscar productos">
                </div>

                <!-- Orden -->
                <div class="vm-filter-group">
                    <span class="vm-filter-title">Ordenar por</span>
                    <?php
                    $sortOptions = [
                        'recent' => 'Más recientes',
                        'alpha_asc' => 'A → Z',
                        'alpha_desc' => 'Z → A',
                        'price_asc' => 'Precio: menor a mayor',
                        'price_desc' => 'Precio: mayor a menor',
                    ];
                    foreach ($sortOptions as $val => $label):
                        ?>
                        <label class="vm-filter-option">
                            <input type="radio" name="sort" value="<?= e($val) ?>" <?= $sort === $val ? 'checked' : '' ?>>
                            <span><?= e($label) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>

                <!-- Facets: marcas -->
                <?php if (!empty($marcasFacet)): ?>
                    <div class="vm-filter-group">
                        <span class="vm-filter-title">Marca</span>
                        <?php foreach ($marcasFacet as $m): ?>
                            <label class="vm-filter-option">
                                <input type="checkbox" name="marcas" value="<?= e($m['marca']) ?>" <?= in_array($m['marca'], $marcas, true) ? 'checked' : '' ?>>
                                <span><?= e($m['marca']) ?></span>
                                <span class="vm-filter-option-count"><?= (int) $m['total'] ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <button type="button" class="vm-btn vm-btn-ghost w-full mt-6" id="vm-clear-filters">
                    Limpiar filtros
                </button>
            </aside>

            <!-- ─── Contenido principal ─── -->
            <div>
                <!-- Toolbar -->
                <div class="vm-catalog-toolbar">
                    <p class="text-sm text-slate-600" data-results-count>
                        <strong><?= $total ?></strong> resultado<?= $total === 1 ? '' : 's' ?>
                    </p>
                    <div class="vm-view-switch" role="tablist" aria-label="Vista del catálogo" data-mode="grid">
                        <button type="button" data-view="grid" aria-pressed="true" aria-label="Vista en grilla">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            Grilla
                        </button>
                        <button type="button" data-view="list" aria-pressed="false" aria-label="Vista en listado">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                            Listado
                        </button>
                    </div>
                </div>

                <!-- Grid / List de productos -->
                <div id="vm-products-area">
                    <?php if (!empty($resultado['data'])): ?>
                        <div class="vm-product-grid" data-cols="3" id="vm-products-list">
                            <?php foreach ($resultado['data'] as $product): ?>
                                <?php require __DIR__ . '/../components/product-card.php'; ?>
                            <?php endforeach; ?>
                        </div>

                        <!-- Paginación -->
                        <?php if ($totalPages > 1):
                            $buildUrl = function ($p) use ($sort, $marcas, $search) {
                                $params = ['page' => $p, 'sort' => $sort];
                                if (!empty($marcas))
                                    $params['marcas'] = implode(',', $marcas);
                                if ($search)
                                    $params['search'] = $search;
                                return '/productos?' . http_build_query($params);
                            };
                            ?>
                            <nav class="vm-pagination" aria-label="Paginación">
                                <?php if ($page > 1): ?>
                                    <a href="<?= e($buildUrl($page - 1)) ?>" rel="prev" aria-label="Página anterior">←</a>
                                <?php endif; ?>
                                <?php
                                $start = max(1, $page - 2);
                                $end = min($totalPages, $page + 2);
                                for ($i = $start; $i <= $end; $i++):
                                    ?>
                                    <a href="<?= e($buildUrl($i)) ?>" <?= $i === $page ? 'aria-current="page"' : '' ?>><?= $i ?></a>
                                <?php endfor; ?>
                                <?php if ($page < $totalPages): ?>
                                    <a href="<?= e($buildUrl($page + 1)) ?>" rel="next" aria-label="Siguiente página">→</a>
                                <?php endif; ?>
                            </nav>
                        <?php endif; ?>

                    <?php else: ?>
                        <?php
                        $title = 'No encontramos productos';
                        $message = $search
                            ? "Probá con otro término o quitá los filtros activos."
                            : 'Limpiá los filtros para ver el catálogo completo.';
                        $ctaLabel = 'Limpiar filtros';
                        $ctaHref = '/productos';
                        require __DIR__ . '/../components/empty-state.php';
                        ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<?php
$extraScripts = '<script src="' . asset('assets/js/catalog.js') . '?v=1"></script>';
require __DIR__ . '/../components/footer.php';
?>