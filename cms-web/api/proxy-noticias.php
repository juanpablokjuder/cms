<?php
/**
 * Proxy server-side para paginación AJAX de noticias.
 * El token nunca viaja al navegador — esta ruta es consumida
 * solo por main.js mediante fetch('/api/proxy-noticias.php').
 *
 * Responde: { success: bool, data: Noticia[], meta: {...} }
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../lib/api.php';

header('Content-Type: application/json; charset=UTF-8');
// Solo requests del mismo origen
header('X-Content-Type-Options: nosniff');

// Validar método
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Validar y sanear parámetros
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = min(50, max(1, (int) ($_GET['limit'] ?? NOTICIAS_PER_PAGE)));

$result = cms_get_noticias($page, $limit);

if ($result === null) {
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'No se pudo obtener las noticias.']);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => $result['data'] ?? [],
    'meta' => $result['meta'] ?? [],
]);
