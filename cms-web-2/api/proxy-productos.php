<?php
declare(strict_types=1);

/**
 * Proxy AJAX para listar productos sin recargar la página.
 * Reutiliza api_productos() que ya inyecta el WEB_API_TOKEN server-side.
 * El navegador NUNCA ve el token.
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../lib/api.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// Validar y normalizar query params
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(48, max(1, (int)($_GET['limit'] ?? PRODUCTOS_PER_PAGE)));
$sort  = in_array($_GET['sort'] ?? '', ['recent','alpha_asc','alpha_desc','price_asc','price_desc'], true)
    ? $_GET['sort'] : 'recent';
$marcas = !empty($_GET['marcas'])
    ? array_filter(explode(',', preg_replace('/[^a-zA-Z0-9 ,\-]/', '', $_GET['marcas'])))
    : [];
$search = trim((string)($_GET['search'] ?? ''));

$result = api_productos([
    'page'   => $page,
    'limit'  => $limit,
    'sort'   => $sort,
    'marcas' => $marcas,
    'search' => $search,
]);

echo json_encode([
    'success' => true,
    'data'    => $result,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
