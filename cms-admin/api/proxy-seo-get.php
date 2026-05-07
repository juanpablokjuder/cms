<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$entityType = filter_input(INPUT_GET, 'entity_type', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';
$entityUuid = filter_input(INPUT_GET, 'entity_uuid', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';

if (!$entityType || !$entityUuid) {
    jsonResponse(['success' => false, 'message' => 'entity_type y entity_uuid son requeridos.'], 400);
}

$result = apiRequest('GET', '/admin/seo/' . rawurlencode($entityType) . '/' . rawurlencode($entityUuid));
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
