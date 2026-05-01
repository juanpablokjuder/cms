<?php declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) { jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405); }
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$uuid  = trim($input['uuid'] ?? '');
if (empty($uuid)) { jsonResponse(['success' => false, 'message' => 'UUID es requerido.'], 422); }
$data = [];
foreach (['titulo', 'imagen', 'imagen_alt', 'imagen_title'] as $f) {
    if (array_key_exists($f, $input)) $data[$f] = $input[$f];
}
if (array_key_exists('items', $input) && is_array($input['items'])) $data['items'] = $input['items'];
if (empty($data)) { jsonResponse(['success' => false, 'message' => 'No se proporcionaron campos para actualizar.'], 422); }
$result = apiRequest('PATCH', '/faqs/' . urlencode($uuid), $data);
if ($result['httpCode'] === 401) { destroySession(); jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401); }
jsonResponse($result['body'], $result['httpCode']);
