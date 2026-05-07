<?php
declare(strict_types=1);

/**
 * Front Controller — Storefront Vértice Mobile.
 * Resuelve la ruta solicitada y delega en el template correspondiente
 * de /pages. Layouts y componentes son sólo includes.
 */

require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/lib/api.php';
require_once __DIR__ . '/lib/helpers.php';

// ── Resolver ruta ─────────────────────────────────────────────────────────
$uri    = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri    = '/' . trim($uri, '/');
$parts  = $uri === '/' ? [''] : explode('/', trim($uri, '/'));
$route  = $parts[0] ?? '';
$param  = $parts[1] ?? '';

// ── Footer global (se obtiene en todas las rutas para el layout base) ────
$globalFooter = api_footer();

// ── Despacho de rutas ─────────────────────────────────────────────────────
$page    = 'home';
$slugArg = '';

switch ($route) {
    case '':
        $page = 'home';
        break;

    case 'productos':
        if ($param) {
            $page = 'producto-detalle';
            $slugArg = $param;
        } else {
            $page = 'productos';
        }
        break;

    case 'noticias':
        if ($param) {
            $page = 'noticia-detalle';
            $slugArg = $param;
        } else {
            $page = 'noticias';
        }
        break;

    case 'faqs':
        $page = 'faqs';
        break;

    default:
        $page = '404';
        http_response_code(404);
        break;
}

// ── Render ────────────────────────────────────────────────────────────────
$pageFile = __DIR__ . '/pages/' . $page . '.php';
if (!file_exists($pageFile)) {
    $pageFile = __DIR__ . '/pages/404.php';
    http_response_code(404);
}
require $pageFile;
