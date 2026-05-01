# CMS-ADMIN — Documentación Técnica

> **Módulo:** `cms-admin`
> **Versión:** 1.0.0
> **Última actualización:** 2026-05-01 — Nueva sección `servicios` (singleton + categorías + items con galería y precios)
> **Stack:** PHP (Nativo), JavaScript ES6+, AJAX (Fetch API), jQuery (selectivo)

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Configuración](#configuración)
5. [Autenticación y Sesión](#autenticación-y-sesión)
6. [Capa de Proxy PHP (api/)](#capa-de-proxy-php-api)
7. [Páginas Implementadas](#páginas-implementadas)
8. [Capa JavaScript (assets/js/)](#capa-javascript-assetsjs)
9. [Estilos (assets/css/)](#estilos-assetscss)
10. [Includes Compartidos](#includes-compartidos)
11. [Flujo de Datos](#flujo-de-datos)
12. [Reglas de Negocio y Restricciones](#reglas-de-negocio-y-restricciones)

---

## Descripción General

`cms-admin` es el panel de administración del ecosistema CMS. Permite a los usuarios con rol `admin` gestionar el contenido del sitio (usuarios, banners) a través de una interfaz web. **No tiene acceso directo a la base de datos**; toda la comunicación con los datos se realiza exclusivamente a través de la `cms-api` mediante llamadas HTTP proxeadas desde PHP.

---

## Arquitectura

El módulo sigue una arquitectura de **proxy en PHP**:

```
Navegador (JS/AJAX)
      ↓  fetch() hacia api/proxy-*.php
Proxy PHP (api/)
      ↓  cURL → cms-api (REST)
cms-api (Node.js)
      ↓  MariaDB
```

- El JavaScript del frontend **nunca** llama directamente a la `cms-api`.
- Los proxies PHP leen el token JWT de la sesión del servidor y lo inyectan en cada petición saliente.
- Las credenciales y el token JWT viven **únicamente en la sesión del servidor PHP**, nunca en el cliente.

---

## Estructura de Directorios

```
cms-admin/
├── index.php                  # Dashboard principal (página de inicio tras login)
├── login.php                  # Página de autenticación
├── logout.php                 # Cierre de sesión (invalida sesión PHP + token JWT)
├── users.php                  # Lista de usuarios
├── user-create.php            # Formulario de creación de usuario
├── user-edit.php              # Formulario de edición de usuario (?uuid=...)
├── banners.php                # Lista de banners
├── banner-create.php          # Formulario de creación de banner
├── banner-edit.php            # Formulario de edición de banner (?uuid=...)
├── api/                       # Proxies PHP hacia cms-api
│   ├── proxy-login.php
│   ├── proxy-logout.php
│   ├── proxy-me.php
│   ├── proxy-users-list.php
│   ├── proxy-users-get.php
│   ├── proxy-users-create.php
│   ├── proxy-users-update.php
│   ├── proxy-users-delete.php
│   ├── proxy-banners-list.php
│   ├── proxy-banners-get.php
│   ├── proxy-banners-create.php
│   ├── proxy-banners-update.php
│   └── proxy-banners-delete.php
├── assets/
│   ├── css/
│   │   ├── reset.css          # Normalización de estilos base
│   │   ├── variables.css      # Variables CSS (colores, espaciados, tipografía)
│   │   ├── layout.css         # Estructura general: sidebar, main, topbar
│   │   ├── components.css     # Componentes reutilizables: botones, tablas, badges, modales
│   │   ├── image-input.css    # ★ Estilos del componente ImageInput
│   │   ├── banners.css        # Estilos específicos de la sección banners
│   │   └── login.css          # Estilos de la página de login
│   └── js/
│       ├── api.js             # Capa AJAX centralizada (módulo Api + ApiError)
│       ├── auth.js            # Lógica del formulario de login
│       ├── image-input.js     # ★ Componente reutilizable de carga de imágenes (ImageInput)
│       ├── toast.js           # Sistema de notificaciones toast
│       ├── modal.js           # Utilidades para modales de confirmación
│       ├── theme.js           # Toggle de tema claro/oscuro
│       ├── users.js           # Lógica de tabla de usuarios y paginación
│       ├── user-form.js       # Lógica de formularios crear/editar usuario
│       ├── banners.js         # Lógica de tabla de banners y paginación
│       └── banner-form.js     # Lógica de formularios crear/editar banner (usa ImageInput)
├── config/
│   └── app.php                # Constantes globales y configuración de sesión
└── includes/
    ├── auth.php               # Guard de autenticación (redirige a login si no autenticado)
    ├── functions.php          # Función apiRequest() (cURL) y helpers globales
    ├── head.php               # Cabecera HTML común (<head>, CSS links)
    ├── header.php             # Topbar de la aplicación
    ├── sidebar.php            # Menú de navegación lateral
    └── layout-scripts.php     # Scripts JS comunes cargados al final del body
```

---

## Configuración

**Archivo:** `config/app.php`

| Constante          | Valor por defecto               | Descripción                                            |
|--------------------|---------------------------------|--------------------------------------------------------|
| `API_BASE_URL`     | `http://192.168.0.20:3000/api/v1` | URL base de la `cms-api`                             |
| `APP_NAME`         | `CMS Admin`                     | Nombre de la aplicación                               |
| `APP_VERSION`      | `1.0.0`                         | Versión actual                                        |
| `SESSION_LIFETIME` | `900` (15 minutos)              | Duración de sesión PHP (debe coincidir con `JWT_EXPIRES_IN`) |

**Seguridad de sesión configurada:**
- `session.cookie_httponly = 1` — la cookie de sesión no es accesible desde JavaScript.
- `session.cookie_samesite = Strict` — protección contra CSRF.
- `session.use_strict_mode = 1` — previene fijación de sesión.

---

## Autenticación y Sesión

El flujo de autenticación es completamente stateful en el servidor PHP:

1. El usuario envía email y contraseña desde el formulario de login.
2. `auth.js` hace un `fetch()` a `api/proxy-login.php`.
3. El proxy reenvía las credenciales a `POST /api/v1/auth/login`.
4. Si la API responde con éxito (HTTP 200), el proxy almacena en la sesión PHP:
   - `$_SESSION['token']` — el JWT devuelto por la API.
   - `$_SESSION['user']` — el perfil del usuario autenticado.
5. Todas las páginas protegidas incluyen `includes/auth.php`, que llama a `requireAuth()`.
6. Si `$_SESSION['token']` no existe o expiró, se redirige a `login.php`.

**Logout:** `logout.php` llama al proxy de logout (que revoca el token en la API) y luego destruye la sesión PHP.

---

## Capa de Proxy PHP (api/)

Cada archivo proxy tiene una responsabilidad única. Todos siguen el mismo patrón:

1. Verificar el método HTTP permitido.
2. Leer y sanitizar el input (`php://input` o `$_GET`).
3. Llamar a `apiRequest()` con el método, endpoint y datos correspondientes.
4. Reenviar la respuesta de la API al cliente con `jsonResponse()`.

### Proxies disponibles

| Archivo                      | Método HTTP | Endpoint API              | Auth requerida |
|------------------------------|-------------|---------------------------|----------------|
| `proxy-login.php`            | POST        | `/auth/login`             | No             |
| `proxy-logout.php`           | POST        | `/auth/logout`            | Sí (sesión)    |
| `proxy-me.php`               | GET         | `/auth/me`                | Sí (sesión)    |
| `proxy-users-list.php`       | GET         | `/users`                  | Sí (sesión)    |
| `proxy-users-get.php`        | GET         | `/users/:uuid`            | Sí (sesión)    |
| `proxy-users-create.php`     | POST        | `/users`                  | Sí (sesión)    |
| `proxy-users-update.php`     | PATCH       | `/users/:uuid`            | Sí (sesión)    |
| `proxy-users-delete.php`     | DELETE      | `/users/:uuid`            | Sí (sesión)    |
| `proxy-banners-list.php`     | GET         | `/banners`                | Sí (sesión)    |
| `proxy-banners-get.php`      | GET         | `/banners/:uuid`          | Sí (sesión)    |
| `proxy-banners-create.php`   | POST        | `/banners`                | Sí (sesión)    |
| `proxy-banners-update.php`   | PATCH       | `/banners/:uuid`          | Sí (sesión)    |
| `proxy-banners-delete.php`   | DELETE      | `/banners/:uuid`          | Sí (sesión)    |
| `proxy-noticias-list.php`    | GET         | `/noticias`               | Sí (sesión)    |
| `proxy-noticias-get.php`     | GET         | `/noticias/:uuid`         | Sí (sesión)    |
| `proxy-noticias-create.php`  | POST        | `/noticias`               | Sí (sesión)    |
| `proxy-noticias-update.php`  | PATCH       | `/noticias/:uuid`         | Sí (sesión)    |
| `proxy-noticias-delete.php`  | DELETE      | `/noticias/:uuid`         | Sí (sesión)    |
| `proxy-nosotros-get.php`     | GET         | `/nosotros`               | Sí (sesión)    |
| `proxy-nosotros-create.php`  | POST        | `/nosotros`               | Sí (sesión)    |
| `proxy-nosotros-update.php`  | PATCH       | `/nosotros`               | Sí (sesión)    |
| `proxy-monedas-list.php`                | GET         | `/monedas`                              | Sí (sesión)    |
| `proxy-servicios-get.php`               | GET         | `/servicios`                            | Sí (sesión)    |
| `proxy-servicios-create.php`            | POST        | `/servicios`                            | Sí (sesión)    |
| `proxy-servicios-update.php`            | PATCH       | `/servicios/:uuid`                      | Sí (sesión)    |
| `proxy-servicio-categorias-list.php`    | GET         | `/servicios/categorias`                 | Sí (sesión)    |
| `proxy-servicio-categorias-get.php`     | GET         | `/servicios/categorias/:uuid`           | Sí (sesión)    |
| `proxy-servicio-categorias-create.php`  | POST        | `/servicios/categorias`                 | Sí (sesión)    |
| `proxy-servicio-categorias-update.php`  | PATCH       | `/servicios/categorias/:uuid`           | Sí (sesión)    |
| `proxy-servicio-categorias-delete.php`  | DELETE      | `/servicios/categorias/:uuid`           | Sí (sesión)    |
| `proxy-servicio-items-list.php`         | GET         | `/servicios/items`                      | Sí (sesión)    |
| `proxy-servicio-items-get.php`          | GET         | `/servicios/items/:uuid`                | Sí (sesión)    |
| `proxy-servicio-items-create.php`       | POST        | `/servicios/items`                      | Sí (sesión)    |
| `proxy-servicio-items-update.php`       | PATCH       | `/servicios/items/:uuid`                | Sí (sesión)    |
| `proxy-servicio-items-delete.php`       | DELETE      | `/servicios/items/:uuid`                | Sí (sesión)    |

---

## Páginas Implementadas

### Login (`login.php`)
- Formulario de autenticación con validación client-side.
- No requiere sesión activa (redirige al dashboard si ya está autenticado).

### Dashboard (`index.php`)
- Página de inicio tras el login exitoso.
- Requiere sesión activa (`includes/auth.php`).

### Usuarios (`users.php`, `user-create.php`, `user-edit.php`)
- **`users.php`:** Tabla paginada de usuarios (10 por página). Permite eliminar con modal de confirmación.
- **`user-create.php`:** Formulario para crear un nuevo usuario (nombre, email, contraseña, rol).
- **`user-edit.php`:** Formulario de edición parcial. Recibe `?uuid=` como query param. La contraseña es opcional en la edición.

### Banners (`banners.php`, `banner-create.php`, `banner-edit.php`)
- **`banners.php`:** Tabla paginada de banners (10 por página) con miniatura de imagen, página y orden. Permite eliminar.
- **`banner-create.php`:** Formulario para crear un banner. Soporta subida de imagen en base64.
- **`banner-edit.php`:** Formulario de edición parcial de banner. Recibe `?uuid=` como query param.

### Noticias (`noticias.php`, `noticia-create.php`, `noticia-edit.php`)
- **`noticias.php`:** Tabla paginada de noticias con título, slug y fecha. Permite eliminar.
- **`noticia-create.php`:** Formulario con editor Quill y galería de imágenes múltiple.
- **`noticia-edit.php`:** Igual al de creación pero pre-rellena los datos. Recibe `?uuid=` como query param.

### Nosotros (`nosotros.php`)
- **Registro singleton:** No existe listado. La página carga el registro actual (si existe) y muestra el formulario de edición; si no existe, muestra el formulario de creación.
- **Campos:** Título, Subtítulo, Texto (Quill), Imágenes (galería múltiple, mismo componente `ImageInput`).
- **Detección de modo:** El JS consulta `GET /api/proxy-nosotros-get.php` al iniciar. Si la API devuelve datos, activa modo edición (`PATCH`); si devuelve vacío, activa modo creación (`POST`).

### Servicios (`servicios.php`, `servicio-categoria-create.php`, `servicio-categoria-edit.php`, `servicio-item-create.php`, `servicio-item-edit.php`)

- **`servicios.php`:** Página central con tres secciones:
  1. **Encabezado (singleton):** Muestra título y subtítulo del singleton. Botón "Editar" despliega formulario inline; si no existe, ofrece "Crear ahora".
  2. **Tab Categorías:** Tabla paginada con nombre, orden, estado y acciones editar/eliminar.
  3. **Tab Items:** Tabla paginada con miniatura, título, precio con moneda, estado y acciones editar/eliminar.
- **`servicio-categoria-create.php` / `servicio-categoria-edit.php`:** Formulario con campos: nombre (text), orden (number), estado (select activo/inactivo). Modo edición recibe `?uuid=`.
- **`servicio-item-create.php` / `servicio-item-edit.php`:** Formulario de dos columnas. Columna izquierda: título, subtítulo 1, subtítulo 2, editor Quill (texto), galería ImageInput múltiple. Columna derecha (sidebar): precio + moneda, categoría, estado, btn_titulo, btn_link, botón de enviar.

---

## Capa JavaScript (assets/js/)

### `image-input.js` — Clase `ImageInput` ★ NUEVO

Componente reutilizable de carga y gestión de imágenes. Prefijo CSS: `ii-`.

**Constructor:**
```js
new ImageInput({
    container: '#mi-contenedor',  // selector CSS o Element
    multiple:  false,             // true = múltiples archivos
    maxSizeMB: 10,                // límite por archivo
})
```

**Métodos públicos:**
- `getFiles()` — devuelve el array de archivos en el orden actual de la UI. Cada entrada: `{ id, base64|null, url|null, nombre, alt, title }`
- `setExistingFile({ url, nombre, alt, title })` — carga una imagen existente (modo edición)
- `reset()` — limpia todos los archivos

**Características:**
- Drag & Drop sobre la zona de carga
- Reordenamiento por arrastre entre tarjetas (modo `multiple: true`)
- Cada tarjeta expone inputs editables: `nombre`, `alt`, `title`
- En modo single: la zona de carga se oculta al agregar una imagen
- Validación de tipo MIME y tamaño con Toast de error
- Compatible con modo edición: muestra imagen existente desde URL absoluta

**Uso en formularios de banner:**
```html
<div id="banner-image-input-mount"></div>
```
```js
const imageInput = new ImageInput({ container: '#banner-image-input-mount', multiple: false });
imageInput.setExistingFile({ url: b.imagen, nombre: '', alt: '', title: '' }); // modo edición
const files = imageInput.getFiles(); // al guardar
```

### `api.js` — Módulo `Api`
Capa AJAX centralizada. Todas las llamadas al backend pasan por este módulo.

**Métodos públicos:**
- `Api.request(url, options)` — método base (fetch con manejo de errores y 401).
- `Api.getUsers(page, limit)` → `GET api/proxy-users-list.php`
- `Api.getUser(uuid)` → `GET api/proxy-users-get.php`
- `Api.createUser(data)` → `POST api/proxy-users-create.php`
- `Api.updateUser(uuid, data)` → `PATCH api/proxy-users-update.php`
- `Api.deleteUser(uuid)` → `DELETE api/proxy-users-delete.php`
- `Api.getBanners(page, limit)` → `GET api/proxy-banners-list.php`
- `Api.getBanner(uuid)` → `GET api/proxy-banners-get.php`
- `Api.createBanner(data)` → `POST api/proxy-banners-create.php`
- `Api.updateBanner(uuid, data)` → `PATCH api/proxy-banners-update.php`
- `Api.deleteBanner(uuid)` → `DELETE api/proxy-banners-delete.php`

**Clase `ApiError`:** Extiende `Error` con `status` y `data` para manejo estructurado de errores HTTP.

**Comportamiento ante 401:** Muestra un toast de sesión expirada y redirige automáticamente a `login.php` tras 1,5 segundos.

### `auth.js`
Gestiona el formulario de login: validación client-side, estado de carga, toggle de visibilidad de contraseña y redirección tras login exitoso.

### `toast.js` — Módulo `Toast`
Sistema de notificaciones no bloqueantes.
- `Toast.success(msg)` — notificación verde.
- `Toast.error(msg)` — notificación roja.
- `Toast.info(msg)` — notificación azul.

### `modal.js`
Utilidades para modales de confirmación de acciones destructivas (ej. eliminación).

### `theme.js`
Toggle de tema claro/oscuro, persiste la preferencia en `localStorage`.

### `users.js` — Módulo `Users`
- Carga y renderiza la tabla de usuarios con paginación client-side.
- Gestiona el modal de confirmación de eliminación.
- Paginación: 10 registros por página, navegación con botones prev/next.

### `user-form.js`
- Lógica de formularios crear/editar usuario.
- En edición, carga los datos actuales del usuario al inicializar.
- La contraseña es opcional al editar (no se envía si está vacía).

### `banners.js` — Módulo `Banners`
- Carga y renderiza la tabla de banners con paginación.
- Muestra miniatura de imagen del banner en la tabla.
- Gestiona modal de confirmación de eliminación.

### `banner-form.js`
- Lógica de formularios crear/editar banner.
- Manejo de previsualización de imagen antes de subir.
- Conversión de imagen seleccionada a base64 para envío a la API.

### `servicios.js` — Módulo `Servicios`
- Inicializa la página `servicios.php` con tres secciones: encabezado singleton, tab categorías e items.
- **Encabezado:** Carga con `Api.getServicio()`. Si no existe, muestra botón "Crear ahora". El formulario inline llama `Api.createServicio()` o `Api.updateServicio()`.
- **Categorías:** Tabla paginada (10 por página). Paginación numerada con prev/next. Modal de confirmación antes de eliminar.
- **Items:** Igual que categorías pero con miniatura de imagen y badge de estado (`activo`/`inactivo`/`no_mostrar`).
- Métodos públicos: `init()`, `goToCatPage(n)`, `goToItemPage(n)`, `openDeleteCatModal(uuid, nombre)`, `openDeleteItemModal(uuid, nombre)`.

### `servicio-categoria-form.js`
- Lógica de formularios crear/editar categoría.
- Detecta modo edición mediante `window.CATEGORIA_UUID`. Si está definido, carga los datos con `Api.getServicioCategoria()`.
- Redirige a `servicios.php` tras operación exitosa.

### `servicio-item-form.js`
- Lógica de formularios crear/editar item de servicio.
- Detecta modo edición mediante `window.ITEM_UUID`.
- Inicializa editor Quill con toolbar completa.
- Inicializa componente `ImageInput` en modo múltiple (`#item-imagenes-mount`).
- Carga dinámicamente los `<select>` de monedas y categorías con `Promise.all` al inicio.
- En modo edición: pre-rellena todos los campos, imagénes existentes con `imageInput.setExistingFile()`.
- `buildImagenesPayload()`: distingue imágenes nuevas (`imagen: base64`) de existentes (`archivo_uuid`) usando `_isDirty` y `_archivo_uuid`.
- Redirige a `servicios.php` tras operación exitosa.

---

## Estilos (assets/css/)

La hoja de estilos está dividida en capas bien definidas:

| Archivo           | Responsabilidad                                                |
|-------------------|----------------------------------------------------------------|
| `reset.css`       | Normalización cross-browser de estilos base                    |
| `variables.css`   | Tokens de diseño: colores, tipografías, espaciados, bordes     |
| `layout.css`      | Estructura de la aplicación: sidebar, topbar, área de contenido|
| `components.css`  | Componentes reutilizables: botones, tablas, badges, modales, formularios |
| `banners.css`     | Estilos específicos de miniaturas y badges de la sección banners |
| `noticias.css`    | Estilos específicos de la sección noticias                        |
| `servicios.css`   | Estilos específicos de miniaturas (`.servicio-thumb`) y badges de estado de servicios |
| `login.css`       | Layout y estilos de la pantalla de login                       |

---

## Includes Compartidos

| Archivo               | Descripción                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `config/app.php`      | Constantes globales, configuración de sesión PHP                         |
| `includes/auth.php`   | Guard: incluir en cualquier página protegida                             |
| `includes/functions.php` | `apiRequest()` (cURL wrapper), `jsonResponse()`, `requireAuth()`     |
| `includes/head.php`   | Etiqueta `<head>` HTML con meta, título y links de CSS                   |
| `includes/header.php` | Topbar: nombre de la app, usuario autenticado, botón de logout           |
| `includes/sidebar.php`| Menú lateral de navegación con links a todas las secciones               |
| `includes/layout-scripts.php` | Scripts JS comunes cargados al final del `<body>`              |

---

## Flujo de Datos

### Ejemplo: Crear un banner

```
1. Usuario completa el formulario en banner-create.php
2. banner-form.js convierte la imagen a base64
3. Api.createBanner(data) → fetch POST api/proxy-banners-create.php
4. proxy-banners-create.php:
   - Lee $_SESSION['token']
   - Llama apiRequest('POST', '/banners', data, token)
   - cURL → POST http://cms-api/api/v1/banners
5. cms-api valida el JWT, crea el archivo (imagen), crea el banner
6. Respuesta JSON fluye de vuelta: API → Proxy → JS
7. banner-form.js muestra Toast.success() y redirige a banners.php
```

### Ejemplo: Listar usuarios con paginación

```
1. users.php carga; users.js llama Api.getUsers(1, 10)
2. fetch GET api/proxy-users-list.php?page=1&limit=10
3. proxy-users-list.php → cURL GET http://cms-api/api/v1/users?page=1&limit=10
4. cms-api devuelve { data: [...], meta: { page, limit, total, totalPages } }
5. users.js renderiza la tabla y los controles de paginación
```

---

## Reglas de Negocio y Restricciones

- **Sin acceso directo a la DB:** El panel nunca conecta directamente a MariaDB.
- **Token gestionado en servidor:** El JWT solo existe en `$_SESSION` del servidor PHP, nunca en `localStorage` ni cookies del cliente.
- **Validación doble:** Los formularios validan en el cliente (JS) y en la API (Zod). El proxy PHP no duplica la validación de negocio.
- **Método HTTP estricto:** Cada proxy valida que el método HTTP recibido coincida con el esperado; de lo contrario responde HTTP 405.
- **Sesión sincronizada con JWT:** `SESSION_LIFETIME` (900s) debe coincidir con `JWT_EXPIRES_IN` de la API para evitar tokens válidos con sesión caducada.
- **Imágenes en base64:** Las imágenes se envían codificadas en base64 dentro del JSON hacia el proxy, que las reenvía tal cual a la API. La API es quien escribe el archivo en disco.
