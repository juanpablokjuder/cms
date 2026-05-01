<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$uuid = trim((string) ($input['uuid'] ?? ''));
if (empty($uuid)) {
    jsonResponse(['success' => false, 'message' => 'UUID requerido.'], 400);
}

$data = [];
if (array_key_exists('nombre', $input))
    $data['nombre'] = $input['nombre'];
if (array_key_exists('orden', $input))
    $data['orden'] = (int) $input['orden'];
if (array_key_exists('estado', $input))
    $data['estado'] = (int) $input['estado'];

$result = apiRequest('PATCH', '/servicios/categorias/' . rawurlencode($uuid), $data);
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
