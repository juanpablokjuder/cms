<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}
$uuid = filter_input(INPUT_GET, 'uuid', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';
if (!$uuid) {
    jsonResponse(['success' => false, 'message' => 'UUID requerido.'], 400);
}
$result = apiRequest('GET', '/productos/' . rawurlencode($uuid));
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
