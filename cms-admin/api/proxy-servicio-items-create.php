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

$data = [];
$stringFields = [
    'titulo',
    'subtitulo_1',
    'subtitulo_2',
    'btn_titulo',
    'btn_link',
    'texto',
    'estado',
    'categoria_uuid',
    'moneda_uuid'
];
foreach ($stringFields as $field) {
    if (array_key_exists($field, $input))
        $data[$field] = $input[$field];
}
if (array_key_exists('precio', $input)) {
    $data['precio'] = $input['precio'] !== null ? (float) $input['precio'] : null;
}
if (isset($input['imagenes']) && is_array($input['imagenes'])) {
    $data['imagenes'] = $input['imagenes'];
}

$result = apiRequest('POST', '/servicios/items', $data);
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
