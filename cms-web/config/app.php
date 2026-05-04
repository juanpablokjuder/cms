<?php
/**
 * Configuración de la aplicación cms-web.
 * Las variables sensibles se leen desde el entorno del servidor o del archivo .env.
 * NUNCA hardcodear tokens o credenciales en este archivo.
 */

// ── Cargar .env si existe (desarrollo local con PHP built-in server) ──────────
$_envFile = __DIR__ . '/../.env';
if (file_exists($_envFile)) {
    $lines = file($_envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        // Ignorar comentarios
        if ($line === '' || $line[0] === '#')
            continue;
        if (!str_contains($line, '='))
            continue;
        [$key, $val] = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val);
        // Solo setear si no está ya definido en el entorno real
        if (getenv($key) === false) {
            putenv("{$key}={$val}");
            $_ENV[$key] = $val;
        }
    }
}
unset($_envFile, $lines, $line, $key, $val);

// ── URL de la API ─────────────────────────────────────────────────────────────
// CMS_API_URL puede ser solo el host (http://localhost:3000)
// o incluir la ruta base (/api/v1). Normalizamos para siempre terminar en /api/v1/web.
$_rawApiUrl = rtrim(getenv('CMS_API_URL') ?: 'http://localhost:3000', '/');
// Si ya incluye /api/v1 al final, no lo duplicamos
if (str_ends_with($_rawApiUrl, '/api/v1')) {
    define('CMS_API_BASE', substr($_rawApiUrl, 0, -7)); // quitar /api/v1
} else {
    define('CMS_API_BASE', $_rawApiUrl);
}
define('CMS_API_WEB', CMS_API_BASE . '/api/v1/web');
unset($_rawApiUrl);

// Token estático para el módulo web (nunca exponerlo al navegador)
define('CMS_WEB_TOKEN', getenv('WEB_API_TOKEN') ?: '');

// Configuración del sitio
define('SITE_NAME', getenv('SITE_NAME') ?: 'Santelmo Distinct');
define('SITE_TAGLINE', getenv('SITE_TAGLINE') ?: 'Celulares y tecnología en Argentina');
define('SITE_URL', rtrim(getenv('SITE_URL') ?: 'https://santelmodistinct.com', '/'));
define('SITE_DESCRIPTION', getenv('SITE_DESCRIPTION') ?: 'Tu tienda de celulares y tecnología en Argentina. Los mejores precios, financiación y servicio técnico.');
define('SITE_KEYWORDS', getenv('SITE_KEYWORDS') ?: 'celulares, smartphones, Argentina, reparación, venta, iPhone, Samsung');
define('SITE_LANG', 'es-AR');
define('SITE_LOCALE', 'es_AR');
define('SITE_PHONE', getenv('SITE_PHONE') ?: '');
define('SITE_EMAIL', getenv('SITE_EMAIL') ?: '');

// Paginación
define('NOTICIAS_PER_PAGE', 6);
