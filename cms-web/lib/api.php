<?php
/**
 * Funciones para consumir la API del CMS web.
 * Todas las llamadas son server-side — el token NUNCA se expone al navegador.
 */

if (!defined('CMS_API_WEB')) {
    require_once __DIR__ . '/../config/app.php';
}

// ── Núcleo HTTP ───────────────────────────────────────────────────────────────

/**
 * Realiza GET a la API del CMS y retorna $data o null en caso de error.
 */
function cms_api_get(string $endpoint, array $params = []): mixed
{
    if (empty(CMS_WEB_TOKEN)) {
        error_log('[cms-web] WEB_API_TOKEN no configurado.');
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
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_FOLLOWLOCATION => false,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response === false || !empty($curlErr)) {
        error_log("[cms-web] cURL error en {$endpoint}: {$curlErr}");
        return null;
    }
    if ($httpCode === 401) {
        error_log("[cms-web] 401 Unauthorized en {$endpoint}. Verificar WEB_API_TOKEN.");
        return null;
    }
    if ($httpCode === 404)
        return null;
    if ($httpCode >= 500) {
        error_log("[cms-web] Error del servidor ({$httpCode}) en {$endpoint}.");
        return null;
    }

    $json = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("[cms-web] JSON inválido en {$endpoint}.");
        return null;
    }
    if (!isset($json['success']) || $json['success'] !== true) {
        return null;
    }

    return $json['data'] ?? null;
}

// ── Funciones de sección ──────────────────────────────────────────────────────

function cms_get_banners(string $pagina = ''): array
{
    $params = !empty($pagina) ? ['pagina' => $pagina] : [];
    $result = cms_api_get('/banners', $params);
    return is_array($result) ? $result : [];
}

function cms_get_nosotros(): ?array
{
    $result = cms_api_get('/nosotros');
    return is_array($result) ? $result : null;
}

function cms_get_noticias(int $page = 1, int $limit = 6): ?array
{
    return cms_api_get('/noticias', ['page' => $page, 'limit' => $limit]);
}

function cms_get_noticia_by_slug(string $slug): ?array
{
    // Validar slug para prevenir path traversal
    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(trim($slug)));
    if (empty($slug))
        return null;
    $result = cms_api_get('/noticias/' . $slug);
    return is_array($result) ? $result : null;
}

function cms_get_servicios(): ?array
{
    $result = cms_api_get('/servicios');
    return is_array($result) ? $result : null;
}

function cms_get_faqs(): array
{
    $result = cms_api_get('/faqs');
    return is_array($result) ? $result : [];
}

function cms_get_footer(): ?array
{
    $result = cms_api_get('/footer');
    return is_array($result) ? $result : null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Sanitiza HTML de la API para prevenir XSS.
 * Permite solo tags seguros con atributos básicos.
 */
function cms_sanitize_html(string $html): string
{
    $allowed = '<p><br><strong><b><em><i><u><s><ul><ol><li>'
        . '<a><h2><h3><h4><h5><h6><blockquote><span><hr>';
    $clean = strip_tags($html, $allowed);
    // Eliminar manejadores de eventos inline
    $clean = preg_replace('/\s+on\w+\s*=\s*(?:"[^"]*"|\'[^\']*\')/i', '', $clean);
    // Eliminar javascript: en href
    $clean = preg_replace('/href\s*=\s*(?:"javascript:[^"]*"|\'javascript:[^\']*\')/i', 'href="#"', $clean);
    return $clean;
}

/**
 * Formatea precio + moneda en estilo argentino.
 */
function cms_format_price(?string $precio, ?array $moneda): string
{
    if ($precio === null || $precio === '')
        return '';
    $codigo = htmlspecialchars($moneda['codigo'] ?? '', ENT_QUOTES, 'UTF-8');
    $amount = number_format((float) $precio, 2, ',', '.');
    return trim("{$codigo} {$amount}");
}

/**
 * Formatea fecha ISO 8601 al español argentino.
 */
function cms_format_date(string $dateStr): string
{
    try {
        $date = new DateTime($dateStr);
        $meses = [
            1 => 'enero',
            2 => 'febrero',
            3 => 'marzo',
            4 => 'abril',
            5 => 'mayo',
            6 => 'junio',
            7 => 'julio',
            8 => 'agosto',
            9 => 'septiembre',
            10 => 'octubre',
            11 => 'noviembre',
            12 => 'diciembre',
        ];
        return $date->format('j') . ' de ' . $meses[(int) $date->format('n')] . ' de ' . $date->format('Y');
    } catch (Exception) {
        return $dateStr;
    }
}

/**
 * Retorna la primera imagen ordenada por 'orden' ASC, o null.
 */
function cms_first_image(array $imagenes): ?array
{
    if (empty($imagenes))
        return null;
    usort($imagenes, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
    return $imagenes[0];
}

/**
 * Genera URL canónica absoluta del sitio (usar para SEO/canonical, no para assets).
 */
function cms_url(string $path = ''): string
{
    return SITE_URL . '/' . ltrim($path, '/');
}

/**
 * Genera URL de un asset estático relativa al servidor actual.
 * Funciona tanto en localhost:8081 como en producción sin cambios.
 */
function asset_url(string $path = ''): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host . '/' . ltrim($path, '/');
}

/**
 * Escapa una cadena para salida HTML segura.
 */
function e(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
