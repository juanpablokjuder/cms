<?php
declare(strict_types=1);

/**
 * Funciones utilitarias — formateo, escape, URLs, sanitización.
 */

if (!defined('CMS_API_WEB')) {
    require_once __DIR__ . '/../config/app.php';
}

/** Escapa texto para HTML. */
function e(?string $str): string
{
    return htmlspecialchars((string) $str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** URL absoluta de un asset estático respetando el host actual. */
function asset(string $path): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host . '/' . ltrim($path, '/');
}

/** URL canónica del sitio. */
function site_url(string $path = ''): string
{
    return SITE_URL . '/' . ltrim($path, '/');
}

/**
 * Formatea precio en centavos al estilo argentino: "ARS $1.250,00".
 */
function format_price_cents(?int $cents, ?string $codigo = 'ARS'): string
{
    if ($cents === null) return 'Consultar';
    $amount = number_format($cents / 100, 2, ',', '.');
    $code   = e($codigo ?? '');
    return trim("$code \$$amount");
}

/**
 * Devuelve el texto de un rango de precios "min - max" o un único precio.
 */
function format_price_range(?int $min, ?int $max, ?string $codigo): string
{
    if ($min === null) return 'Consultar';
    if ($max === null || $min === $max) {
        return format_price_cents($min, $codigo);
    }
    return format_price_cents($min, $codigo) . ' - ' . format_price_cents($max, $codigo);
}

/**
 * Aplica descuento en centésimas (ej. 1500 = 15.00%) a un precio en centavos.
 */
function apply_descuento(int $cents, int $descuento): int
{
    if ($descuento <= 0) return $cents;
    return (int) round($cents * (1 - $descuento / 10000));
}

/**
 * Sanitiza HTML de la API para prevenir XSS, permitiendo solo tags seguros.
 */
function sanitize_html(?string $html): string
{
    if (!$html) return '';
    $allowed = '<p><br><strong><b><em><i><u><s><ul><ol><li><a><h2><h3><h4><h5><h6><blockquote><span><hr><img>';
    $clean = strip_tags($html, $allowed);
    $clean = preg_replace('/\s+on\w+\s*=\s*(?:"[^"]*"|\'[^\']*\')/i', '', $clean);
    $clean = preg_replace('/href\s*=\s*(?:"javascript:[^"]*"|\'javascript:[^\']*\')/i', 'href="#"', $clean);
    return $clean;
}

/** Formatea fecha ISO 8601 al castellano. */
function format_date(string $iso): string
{
    try {
        $d = new DateTime($iso);
        $meses = [1=>'enero',2=>'febrero',3=>'marzo',4=>'abril',5=>'mayo',6=>'junio',7=>'julio',8=>'agosto',9=>'septiembre',10=>'octubre',11=>'noviembre',12=>'diciembre'];
        return $d->format('j') . ' de ' . $meses[(int)$d->format('n')] . ' de ' . $d->format('Y');
    } catch (Exception) {
        return $iso;
    }
}

/** Trunca texto manteniendo palabras completas. */
function truncate(?string $text, int $max = 140): string
{
    if (!$text) return '';
    $text = strip_tags($text);
    if (mb_strlen($text) <= $max) return $text;
    return rtrim(mb_substr($text, 0, $max)) . '…';
}

/** Devuelve la primera imagen ordenada por `orden` ASC. */
function first_image(array $imagenes): ?array
{
    if (empty($imagenes)) return null;
    usort($imagenes, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
    return $imagenes[0];
}

/** Reúne todas las imágenes únicas de las variantes de un producto. */
function gather_product_images(array $producto): array
{
    $out = [];
    $seen = [];
    foreach ($producto['variantes'] ?? [] as $v) {
        foreach ($v['imagenes'] ?? [] as $img) {
            $uuid = $img['archivo_uuid'] ?? '';
            if ($uuid && !isset($seen[$uuid])) {
                $seen[$uuid] = true;
                $out[] = $img;
            }
        }
    }
    usort($out, fn($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));
    return $out;
}

/** Genera los meta tags SEO (title, description, og:*). */
function render_seo_meta(array $opts): string
{
    $title = e($opts['title'] ?? SITE_NAME);
    $desc  = e($opts['description'] ?? SITE_DESCRIPTION);
    $url   = e($opts['url'] ?? site_url());
    $img   = e($opts['image'] ?? '');
    $type  = e($opts['type'] ?? 'website');
    $out  = "<title>$title</title>\n";
    $out .= "<meta name=\"description\" content=\"$desc\">\n";
    $out .= "<link rel=\"canonical\" href=\"$url\">\n";
    $out .= "<meta property=\"og:type\" content=\"$type\">\n";
    $out .= "<meta property=\"og:title\" content=\"$title\">\n";
    $out .= "<meta property=\"og:description\" content=\"$desc\">\n";
    $out .= "<meta property=\"og:url\" content=\"$url\">\n";
    if ($img) $out .= "<meta property=\"og:image\" content=\"$img\">\n";
    $out .= "<meta name=\"twitter:card\" content=\"summary_large_image\">\n";
    return $out;
}
