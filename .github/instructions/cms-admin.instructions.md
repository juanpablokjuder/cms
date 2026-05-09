---
applyTo: "cms-admin/**"
---

# CMS-ADMIN — Instrucciones de Código

## Regla fundamental
**Cero acceso directo a la DB.** Todo flujo de datos: `Browser JS → api/proxy-*.php (cURL) → cms-api`

## Patrón de proxy PHP (estructura estándar)

Cada archivo `api/proxy-<recurso>-<acción>.php` sigue estos 5 pasos:

```php
declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';

// 1. Guard de autenticación
if (!isAuthenticated()) { jsonResponse([...401...], 401); }

// 2. Guard de método HTTP (en proxies de mutación)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonResponse([...405...], 405); }

// 3. Leer input y whitelist de campos permitidos
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$data = [];
foreach (['campo1', 'campo2'] as $campo) {
    if (isset($input[$campo])) $data[$campo] = $input[$campo];
}

// 4. Delegar a apiRequest()
$result = apiRequest('POST', '/recurso', $data);

// 5. En 401 → destruir sesión; siempre pasar el código HTTP del API
if ($result['httpCode'] === 401) { destroySession(); jsonResponse([...], 401); }
jsonResponse($result['body'], $result['httpCode']);
```

## JWT y sesión
- El token JWT se guarda en `$_SESSION['token']` al hacer login — **nunca** se expone al navegador
- `apiRequest()` (en `includes/functions.php`) lee `$_SESSION['token']` y construye el header `Authorization: Bearer $jwt`
- `SESSION_TTL` en `config/app.php` **debe coincidir** con `JWT_EXPIRES_IN` de la API (por defecto `15m = 900s`)

## Configuración de entorno
- `API_BASE_URL` está en `config/app.php` — actualmente hardcoded a IP privada (`http://192.168.0.64:3000/api/v1`)
- **Cambiar esta IP** al desplegar en un entorno diferente; pendiente migrar a variable de entorno

## Nombrado de archivos proxy
- Formato: `api/proxy-<recurso>-<acción>.php`
- Acciones comunes: `list`, `get`, `create`, `update`, `delete`
- Ejemplo: `api/proxy-noticias-create.php`
