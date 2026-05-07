<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'No autenticado.', 'code' => 'UNAUTHORIZED'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    jsonResponse(['success' => false, 'message' => 'Payload inválido.'], 400);
}

$entityType = isset($input['entity_type']) ? trim((string) $input['entity_type']) : '';
$entityUuid = isset($input['entity_uuid']) ? trim((string) $input['entity_uuid']) : '';

if (!$entityType || !$entityUuid) {
    jsonResponse(['success' => false, 'message' => 'entity_type y entity_uuid son requeridos.'], 400);
}

$allowedFields = ['title', 'meta_description', 'meta_keywords', 'og_title', 'og_description', 'scripts_head', 'scripts_body'];
$payload = [];
foreach ($allowedFields as $field) {
    if (array_key_exists($field, $input)) {
        $payload[$field] = $input[$field] !== '' ? $input[$field] : null;
    }
}

if (empty($payload)) {
    jsonResponse(['success' => false, 'message' => 'Debe enviar al menos un campo SEO.'], 400);
}

$result = apiRequest(
    'POST',
    '/admin/seo/' . rawurlencode($entityType) . '/' . rawurlencode($entityUuid),
    $payload,
);
if ($result['httpCode'] === 401) {
    destroySession();
    jsonResponse(['success' => false, 'message' => 'Sesión expirada.', 'code' => 'UNAUTHORIZED'], 401);
}
jsonResponse($result['body'], $result['httpCode']);
