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
if (!isset($input['estado'])) {
    jsonResponse(['success' => false, 'message' => 'El campo estado es requerido.'], 400);
}
if (!isset($input['variantes']) || !is_array($input['variantes'])) {
    jsonResponse(['success' => false, 'message' => 'El campo variantes es requerido.'], 400);
}

$payload = [
    'nombre' => $nombre,
    'estado' => $input['estado'],
    'variantes' => $input['variantes'],
];

$optionalFields = ['descripcion', 'marca', 'condicion_uuid', 'garantia_uuid', 'atributos_uuid', 'atributos'];
foreach ($optionalFields as $field) {
    if (array_key_exists($field, $input)) {
        $payload[$field] = $input[$field];
    }
}

$result = apiRequest('POST', '/productos', $payload);
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
