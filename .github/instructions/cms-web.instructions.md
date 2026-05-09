---
applyTo: "{cms-web,cms-web-2}/**"
---

# CMS-WEB / CMS-WEB-2 — Instrucciones de Código

## Regla fundamental
Sin sesiones. Sin JWT. Solo token estático `CMS_WEB_TOKEN` para autenticar contra `cms-api /api/v1/web/*`.

## Diferencias entre variantes

| Aspecto | cms-web | cms-web-2 |
|---|---|---|
| Ruteador | `index.php` único | `index.php` + archivos en `pages/` |
| Páginas dedicadas | No | `pages/home.php`, `pages/noticias.php`, `pages/noticia-detalle.php`, `pages/productos.php`, etc. |
| Proxies JS-facing | No (solo server-side) | `api/proxy-noticias.php`, `api/proxy-productos.php` |
| Variable URL del API | `CMS_API_WEB` | `CMS_API_URL` |
| Token | `CMS_WEB_TOKEN` | `CMS_WEB_TOKEN` |

## Variables de entorno (.env)
- `CMS_API_WEB` (cms-web) / `CMS_API_URL` (cms-web-2): URL base de la API (sin trailing slash)
- `CMS_WEB_TOKEN`: token estático igual al `WEB_API_TOKEN` configurado en `cms-api`

## Autenticación al API
El header que usa el código real es `Authorization: Bearer $token` — **no** `X-API-Token`.

## Añadir una nueva página (cms-web-2)
1. Crear `pages/<nombre>.php`
2. Registrar la ruta en `index.php`
3. Si se necesita fetch del lado cliente, crear `api/proxy-<recurso>.php` siguiendo el patrón existente

## Añadir una nueva página (cms-web)
1. Agregar el caso en el `switch`/`if-else` del router en `index.php`
2. Crear el componente en `components/` si aplica
