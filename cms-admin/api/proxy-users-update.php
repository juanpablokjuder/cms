<?php
/**
 * Proxy: PATCH /users/:uuid (update)
 * 
 * Receives { uuid, name?, email?, password?, role?, is_active? } from browser.
 * Forwards as PATCH to the API.
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';

if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$uuid = trim($input['uuid'] ?? '');
if (empty($uuid)) {
    jsonResponse(['success' => false, 'message' => 'UUID es requerido.'], 422);
}

// Build update payload (only send non-empty fields)
$data = [];
$fields = ['name', 'email', 'password', 'role'];

foreach ($fields as $field) {
    if (isset($input[$field]) && $input[$field] !== '') {
        $data[$field] = is_string($input[$field]) ? trim($input[$field]) : $input[$field];
    }
}

if (isset($input['is_active'])) {
    $data['is_active'] = (bool) $input['is_active'];
}

if (empty($data)) {
    jsonResponse(['success' => false, 'message' => 'No se proporcionaron campos para actualizar.'], 422);
}

$result = apiRequest('PATCH', '/users/' . urlencode($uuid), $data);

if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}

jsonResponse($result['body'], $result['httpCode']);
