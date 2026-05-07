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

$nombre = isset($input['nombre']) ? trim((string) $input['nombre']) : '';
if (!$nombre) {
    jsonResponse(['success' => false, 'message' => 'El campo nombre es requerido.'], 400);
}

$payload = ['nombre' => $nombre];
if (isset($input['imagen'])) {
    $payload['imagen'] = $input['imagen'];
}
if (isset($input['imagen_nombre'])) {
    $payload['imagen_nombre'] = $input['imagen_nombre'];
}
if (isset($input['imagen_alt'])) {
    $payload['imagen_alt'] = $input['imagen_alt'];
}

$result = apiRequest('POST', '/colores', $payload, $_SESSION['token']);
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
