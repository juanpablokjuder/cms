<?php
declare(strict_types=1);

/**
 * Configuración global de la aplicación cms-web-2 (Storefront).
 * Carga variables desde .env si existe (desarrollo) o desde el entorno (producción).
 * NUNCA hardcodear tokens.
 */

// ── Cargar .env ───────────────────────────────────────────────────────────
$_envFile = __DIR__ . '/../.env';
if (file_exists($_envFile)) {
    foreach (file($_envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k); $v = trim($v);
        if (getenv($k) === false) {
            putenv("$k=$v");
            $_ENV[$k] = $v;
        }
    }
}
unset($_envFile, $line, $k, $v);

// ── API ────────────────────────────────────────────────────────────────────
$_rawApiUrl = rtrim(getenv('CMS_API_URL') ?: 'http://localhost:3000', '/');
if (str_ends_with($_rawApiUrl, '/api/v1')) {
    define('CMS_API_BASE', substr($_rawApiUrl, 0, -7));
} else {
    define('CMS_API_BASE', $_rawApiUrl);
}
define('CMS_API_WEB',  CMS_API_BASE . '/api/v1/web');
define('CMS_WEB_TOKEN', getenv('WEB_API_TOKEN') ?: '');
unset($_rawApiUrl);

// ── Sitio ──────────────────────────────────────────────────────────────────
define('SITE_NAME',        getenv('SITE_NAME')        ?: 'Vértice Mobile');
define('SITE_TAGLINE',     getenv('SITE_TAGLINE')     ?: 'Tecnología premium en Argentina');
define('SITE_URL',         rtrim(getenv('SITE_URL')   ?: 'http://localhost:8080', '/'));
define('SITE_DESCRIPTION', getenv('SITE_DESCRIPTION') ?: 'Celulares de alta gama en Argentina.');
define('SITE_KEYWORDS',    getenv('SITE_KEYWORDS')    ?: 'celulares, smartphones, premium');
define('SITE_PHONE',       getenv('SITE_PHONE')       ?: '');
define('SITE_EMAIL',       getenv('SITE_EMAIL')       ?: '');
define('SITE_WHATSAPP',    getenv('SITE_WHATSAPP')    ?: '');
define('SITE_INSTAGRAM',   getenv('SITE_INSTAGRAM')   ?: '');
define('SITE_LANG',        'es-AR');
define('SITE_LOCALE',      'es_AR');

// ── Paginación ─────────────────────────────────────────────────────────────
define('PRODUCTOS_PER_PAGE', 12);
define('NOTICIAS_PER_PAGE',  9);

// ── Seguridad de sesión (para CSRF tokens si se necesitara) ───────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
        'use_strict_mode' => true,
    ]);
}
