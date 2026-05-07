<?php
declare(strict_types=1);

/**
 * Proxy AJAX para noticias paginadas (uso opcional para infinite-scroll).
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../lib/api.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$page  = max(1, (int)($_GET['page'] ?? 1));
$limit = min(50, max(1, (int)($_GET['limit'] ?? NOTICIAS_PER_PAGE)));

$result = api_noticias($page, $limit);

echo json_encode([
    'success' => true,
    'data'    => $result,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
