<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) { jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405); }
$input = json_decode(file_get_contents('php://input'), true);
$uuid = trim($input['uuid'] ?? '');
if (empty($uuid)) { jsonResponse(['success' => false, 'message' => 'UUID es requerido.'], 422); }
$data = [];
foreach (['pagina', 'imagen', 'imagen_alt', 'imagen_title', 'h1', 'texto_1', 'texto_2', 'btn_texto', 'btn_link'] as $field) {
    if (array_key_exists($field, $input)) $data[$field] = $input[$field];
}
if (isset($input['orden'])) $data['orden'] = (int) $input['orden'];
if (empty($data)) { jsonResponse(['success' => false, 'message' => 'No se proporcionaron campos para actualizar.'], 422); }
$result = apiRequest('PATCH', '/banners/' . urlencode($uuid), $data);
if ($result['httpCode'] === 401) { destroySession(); jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401); }
jsonResponse($result['body'], $result['httpCode']);
