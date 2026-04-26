<?php
/**
 * Proxy: POST /users (create)
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

$result = apiRequest('POST', '/users', [
    'name'     => trim($input['name'] ?? ''),
    'email'    => trim($input['email'] ?? ''),
    'password' => $input['password'] ?? '',
    'role'     => $input['role'] ?? 'viewer',
]);

if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}

jsonResponse($result['body'], $result['httpCode']);
