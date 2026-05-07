<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    jsonResponse(['success' => false, 'message' => 'Payload inválido.'], 400);
}

$uuid = isset($input['uuid']) ? trim((string) $input['uuid']) : '';
if (!$uuid) {
    jsonResponse(['success' => false, 'message' => 'UUID requerido.'], 400);
}

$payload = [];
if (isset($input['nombre'])) {
    $payload['nombre'] = trim((string) $input['nombre']);
}
if (isset($input['atributos']) && is_array($input['atributos'])) {
    $payload['atributos'] = $input['atributos'];
}

if (empty($payload)) {
    jsonResponse(['success' => false, 'message' => 'No hay campos para actualizar.'], 400);
}

$result = apiRequest('PATCH', '/productos/atributos/' . rawurlencode($uuid), $payload);
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
