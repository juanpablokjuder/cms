<?php declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) { jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405); }
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$data  = [];
foreach (['titulo', 'imagen', 'imagen_alt', 'imagen_title'] as $f) {
    if (isset($input[$f])) $data[$f] = $input[$f];
}
if (isset($input['items']) && is_array($input['items'])) $data['items'] = $input['items'];
$result = apiRequest('POST', '/faqs', $data);
if ($result['httpCode'] === 401) { destroySession(); jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401); }
jsonResponse($result['body'], $result['httpCode']);
