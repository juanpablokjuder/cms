<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}
$result = apiRequest('GET', '/productos/condiciones');
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
