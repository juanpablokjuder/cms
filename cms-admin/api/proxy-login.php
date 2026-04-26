<?php
/**
 * Proxy: POST /auth/login
 * Receives email+password from browser, forwards to API, stores token in session.
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['success' => false, 'message' => 'Email y contraseña son requeridos.'], 422);
}

$result = apiRequest('POST', '/auth/login', [
    'email'    => $email,
    'password' => $password,
]);

// Store token and user in session on success
if ($result['httpCode'] === 200 && ($result['body']['success'] ?? false)) {
    $_SESSION['token'] = $result['body']['data']['token'];
    $_SESSION['user']  = $result['body']['data']['user'];
}

jsonResponse($result['body'], $result['httpCode']);
