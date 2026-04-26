<?php
/**
 * Proxy: GET /auth/me
 * Returns the authenticated user's profile.
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';

if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}

$result = apiRequest('GET', '/auth/me');

if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}

jsonResponse($result['body'], $result['httpCode']);
