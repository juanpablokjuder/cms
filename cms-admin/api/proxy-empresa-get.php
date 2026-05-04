<?php declare(strict_types=1);
// proxy-empresa-get.php
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) { jsonResponse(['success'=>false,'message'=>'No autenticado.','code'=>'UNAUTHORIZED'],401); }
$result = apiRequest('GET', '/empresa');
if ($result['httpCode']===401) { destroySession(); jsonResponse(['success'=>false,'message'=>'Sesión expirada.','code'=>'UNAUTHORIZED'],401); }
jsonResponse($result['body'], $result['httpCode']);
