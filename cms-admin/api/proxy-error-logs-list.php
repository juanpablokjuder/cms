<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}

$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = min(100, max(1, (int) ($_GET['limit'] ?? 50)));
$level = $_GET['level'] ?? null;
$statusCode = $_GET['status_code'] ?? null;
$errorCode = $_GET['error_code'] ?? null;
$from = $_GET['from'] ?? null;
$to = $_GET['to'] ?? null;

$queryParams = array_filter([
    'page' => $page,
    'limit' => $limit,
    'level' => $level,
    'status_code' => $statusCode,
    'error_code' => $errorCode,
    'from' => $from,
    'to' => $to,
], fn($v) => $v !== null && $v !== '');

$result = apiRequest('GET', '/error-logs', $queryParams);
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
