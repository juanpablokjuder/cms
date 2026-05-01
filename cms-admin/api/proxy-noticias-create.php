<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) { jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405); }

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$data = [];
foreach (['titulo', 'subtitulo', 'slug', 'texto'] as $field) {
    if (isset($input[$field])) $data[$field] = $input[$field];
}
if (isset($input['imagenes']) && is_array($input['imagenes'])) {
    $data['imagenes'] = $input['imagenes'];
}

$result = apiRequest('POST', '/noticias', $data);
if ($result['httpCode'] === 401) { destroySession(); jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401); }
jsonResponse($result['body'], $result['httpCode']);
