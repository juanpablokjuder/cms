<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) { jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401); }
$page  = max(1, (int) ($_GET['page']  ?? 1));
$limit = min(100, max(1, (int) ($_GET['limit'] ?? 20)));
$result = apiRequest('GET', '/noticias', ['page' => $page, 'limit' => $limit]);
if ($result['httpCode'] === 401) { destroySession(); jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401); }
jsonResponse($result['body'], $result['httpCode']);
