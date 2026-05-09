<?php
declare(strict_types=1);

/**
 * Wrapper HTTP server-side para consumir el CMS API.
 * El WEB_API_TOKEN se inyecta solo aquí — nunca llega al navegador.
 */

if (!defined('CMS_API_WEB')) {
    require_once __DIR__ . '/../config/app.php';
}

/**
 * GET genérico. Retorna `data` desempaquetado o null si falla.
 */
function api_get(string $endpoint, array $params = []): mixed
{
    if (empty(CMS_WEB_TOKEN)) {
        error_log('[cms-web-2] WEB_API_TOKEN no configurado.');
        return null;
    }

    $url = CMS_API_WEB . $endpoint;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . CMS_WEB_TOKEN,
            'Accept: application/json',
        ],
        CURLOPT_FOLLOWLOCATION => false,
    ]);

    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($response === false || !empty($err)) {
        error_log("[cms-web-2] cURL en $endpoint: $err");
        return null;
    }
    if ($code === 404)
        return null;
    if ($code >= 400) {
        error_log("[cms-web-2] HTTP $code en $endpoint");
        return null;
    }

    $json = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE)
        return null;
    if (!isset($json['success']) || $json['success'] !== true)
        return null;
    return $json['data'] ?? null;
}

// ─── Funciones de sección ────────────────────────────────────────────────

function api_banners(?string $pagina = null): array
{
    $params = $pagina ? ['pagina' => $pagina] : [];
    $r = api_get('/banners', $params);
    if (!is_array($r) || empty($r)) {
        // Fallback: si no hay banners para esa página específica, devolver todos los activos
        if ($pagina !== null) {
            $r = api_get('/banners');
        }
    }
    return is_array($r) ? $r : [];
}

function api_nosotros(): ?array
{
    $r = api_get('/nosotros');
    return is_array($r) ? $r : null;
}

function api_servicios(): ?array
{
    $r = api_get('/servicios');
    return is_array($r) ? $r : null;
}

function api_faqs(): array
{
    $r = api_get('/faqs');
    return is_array($r) ? $r : [];
}

function api_footer(): ?array
{
    $r = api_get('/footer');
    return is_array($r) ? $r : null;
}

function api_noticias(int $page = 1, int $limit = 9): array
{
    $r = api_get('/noticias', ['page' => $page, 'limit' => $limit]);
    return is_array($r) ? $r : ['data' => [], 'meta' => ['total' => 0, 'page' => 1, 'limit' => $limit, 'totalPages' => 0]];
}

function api_noticia_by_slug(string $slug): ?array
{
    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(trim($slug))) ?? '';
    if ($slug === '')
        return null;
    $r = api_get('/noticias/' . $slug);
    return is_array($r) ? $r : null;
}

function api_productos(array $opts = []): array
{
    $params = [
        'page' => $opts['page'] ?? 1,
        'limit' => $opts['limit'] ?? PRODUCTOS_PER_PAGE,
        'sort' => $opts['sort'] ?? 'recent',
    ];
    if (!empty($opts['search']))
        $params['search'] = $opts['search'];
    if (!empty($opts['marcas']))
        $params['marcas'] = is_array($opts['marcas']) ? implode(',', $opts['marcas']) : $opts['marcas'];

    $r = api_get('/productos', $params);
    return is_array($r) ? $r : ['data' => [], 'meta' => ['total' => 0, 'page' => 1, 'limit' => $params['limit'], 'totalPages' => 0]];
}

function api_producto_by_uuid(string $uuid): ?array
{
    $uuid = preg_replace('/[^a-fA-F0-9\-]/', '', $uuid) ?? '';
    if ($uuid === '')
        return null;
    $r = api_get('/productos/' . $uuid);
    return is_array($r) ? $r : null;
}

function api_marcas(): array
{
    $r = api_get('/productos-marcas');
    return is_array($r) ? $r : [];
}

/**
 * Obtiene los metadatos SEO de una entidad desde el módulo SEO del CMS.
 * Tipos de entidad: 'producto', 'noticia', 'pagina', 'servicio', 'nosotros', 'empresa'
 * Para páginas estáticas usar: api_seo('pagina', 'home'), api_seo('pagina', 'noticias'), etc.
 */
function api_seo(string $entityType, string $entityId): ?array
{
    $allowedTypes = ['producto', 'noticia', 'pagina', 'servicio', 'nosotros', 'empresa'];
    if (!in_array($entityType, $allowedTypes, true))
        return null;
    $entityId = preg_replace('/[^a-zA-Z0-9\-_]/', '', $entityId);
    if ($entityId === '')
        return null;
    $r = api_get('/seo/' . $entityType . '/' . $entityId);
    return is_array($r) ? $r : null;
}
