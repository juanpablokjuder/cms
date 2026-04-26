<?php
/**
 * Proxy: POST /auth/logout
 * Revokes the token via API, then destroys the local session.
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$result = apiRequest('POST', '/auth/logout');

// Destroy session regardless of API response
destroySession();

jsonResponse(
    $result['body'] ?: ['success' => true, 'data' => null, 'message' => 'Sesión cerrada.'],
    $result['httpCode'] ?: 200
);
