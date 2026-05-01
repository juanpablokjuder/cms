<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}
$uuid = trim((string) ($_GET['uuid'] ?? ''));
if (empty($uuid)) {
    jsonResponse(['success' => false, 'message' => 'UUID requerido.'], 400);
}
$result = apiRequest('GET', '/servicios/categorias/' . rawurlencode($uuid));
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
