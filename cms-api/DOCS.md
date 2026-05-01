# CMS-API — Documentación Técnica

> **Módulo:** `cms-api`
> **Versión:** 1.0.0
> **Última actualización:** 2026-05-01 — Nuevo módulo `servicios` (singleton, categorías, items con galería y precios)
> **Stack:** Node.js 22 LTS · Fastify v5 · MariaDB · TypeScript 5

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
5. [Base de Datos](#base-de-datos)
6. [Módulos Implementados](#módulos-implementados)
   - [Auth](#módulo-auth)
   - [Users](#módulo-users)
   - [Banners](#módulo-banners)
   - [Archivos](#módulo-archivos)
   - [Noticias](#módulo-noticias)
   - [Nosotros](#módulo-nosotros)
   - [Servicios](#módulo-servicios)
7. [Seguridad](#seguridad)
8. [Utilidades Compartidas](#utilidades-compartidas)
9. [Scripts Disponibles](#scripts-disponibles)
10. [Convenciones](#convenciones)

---

## Descripción General

`cms-api` es el núcleo del ecosistema CMS. Expone una API RESTful que es consumida exclusivamente por los módulos `cms-admin` (panel de administración) y `cms-web` (cliente público). **No tiene acceso directo desde el navegador del usuario final.**

El prefijo base de todos los endpoints es `/api/v1` (configurable mediante `API_PREFIX`).

---

## Arquitectura

Se sigue el patrón **Controller → Service → Repository**:

- **Controller:** Recibe y valida la petición HTTP, delega lógica al Service, devuelve la respuesta HTTP.
- **Service:** Contiene la lógica de negocio pura (validaciones, transformaciones, orquestación).
- **Repository:** Responsable exclusivo del acceso a la base de datos mediante sentencias preparadas (MariaDB).

---

## Estructura de Directorios

```
cms-api/
├── src/
│   ├── app.ts                    # Construcción de la aplicación Fastify (plugins, rutas, middlewares globales)
│   ├── server.ts                 # Punto de entrada: arranque del servidor
│   ├── config/
│   │   └── env.ts                # Validación de variables de entorno con Zod
│   ├── database/
│   │   ├── connection.ts         # Pool de conexiones MariaDB
│   │   ├── migrate.ts            # Runner de migraciones SQL
│   │   └── migrations/           # Archivos SQL de migración (numerados secuencialmente)
│   ├── modules/
│   │   ├── auth/                 # Autenticación JWT
│   │   ├── users/                # Gestión de usuarios
│   │   ├── banners/              # Gestión de banners
│   │   ├── archivos/             # Gestión de archivos/uploads
│   │   ├── noticias/             # Gestión de noticias
│   │   ├── nosotros/             # Singleton Nosotros
│   │   └── servicios/            # Servicios (singleton + categorías + items)
│   └── shared/
│       ├── middlewares/          # Middlewares globales (auth, error-handler)
│       ├── types/                # Tipos TypeScript compartidos
│       └── utils/                # Utilidades (api-response, app-error, slugify)
└── uploads/                      # Directorio de archivos subidos (configurable con UPLOADS_DIR)
```

---

## Configuración y Variables de Entorno

El archivo `src/config/env.ts` valida todas las variables mediante **Zod**. Si falta alguna variable requerida, el proceso termina con un error descriptivo.

| Variable              | Requerida | Default          | Descripción                                               |
|-----------------------|-----------|------------------|-----------------------------------------------------------|
| `NODE_ENV`            | No        | `development`    | Entorno (`development`, `production`, `test`)             |
| `PORT`                | No        | `3000`           | Puerto en que escucha el servidor                         |
| `HOST`                | No        | `0.0.0.0`        | Host del servidor                                         |
| `DB_HOST`             | **Sí**    | —                | Host de la base de datos MariaDB                          |
| `DB_PORT`             | No        | `3306`           | Puerto de la base de datos                                |
| `DB_NAME`             | **Sí**    | —                | Nombre de la base de datos                                |
| `DB_USER`             | **Sí**    | —                | Usuario de la base de datos                               |
| `DB_PASSWORD`         | **Sí**    | —                | Contraseña de la base de datos                            |
| `DB_CONNECTION_LIMIT` | No        | `10`             | Tamaño del pool de conexiones                             |
| `JWT_SECRET`          | **Sí**    | —                | Secreto HS256 (mínimo 32 caracteres)                      |
| `JWT_EXPIRES_IN`      | No        | `15m`            | TTL del token JWT                                         |
| `BCRYPT_ROUNDS`       | No        | `12`             | Rondas de bcrypt para hash de contraseñas (10–15)         |
| `PUBLIC_API_URL`      | No        | `http://localhost:3000` | URL pública de la API (sin barra final). Usada para construir URLs absolutas en las respuestas JSON. Ejemplo: `http://192.168.0.20:3000` |
| `API_PREFIX`          | No        | `/api/v1`        | Prefijo base de todos los endpoints                       |
| `UPLOADS_DIR`         | No        | `uploads`        | Directorio relativo para almacenar archivos subidos       |

---

## Base de Datos

### Migraciones

Las migraciones se ejecutan en orden numérico con el comando `npm run migrate`.

| Archivo                         | Descripción                                              |
|---------------------------------|----------------------------------------------------------|
| `001_create_users.sql`          | Tabla `users` con roles y soft delete                    |
| `002_create_revoked_tokens.sql` | Tabla `revoked_tokens` para la lista negra de JWTs       |
| `003_insert_default_admin.sql`  | Usuario administrador inicial                            |
| `004_create_archivos.sql`       | Tabla `archivos` para metadatos de archivos subidos      |
| `004_create_banners.sql`        | Tabla `banners` con FK a `archivos`                      |
| `005_create_noticias.sql`       | Tabla `noticias` + pivot `noticia_imagenes`              |
| `006_create_error_logs.sql`     | Tabla `error_logs` para trazabilidad de errores          |
| `007_create_nosotros.sql`       | Tabla `nosotros` (singleton) + pivot `nosotros_imagenes` |
| `008_create_monedas.sql`        | Tabla `monedas` con registros semilla (ARS, EUR, USD)    |
| `009_create_servicios.sql`      | Tablas `servicios`, `servicios_categorias`, `servicios_items`, `servicio_item_imagenes` |

### Esquema Resumido

**`users`**
- `uuid` (CHAR 36) — identificador público (nunca se expone el `id` numérico)
- `role` — ENUM: `admin` | `editor` | `viewer`
- `is_active`, `deleted_at` — soporte para soft delete

**`archivos`**
- `slug` — identificador URL-safe público para servir el archivo
- `path` — ruta relativa al directorio `UPLOADS_DIR`
- `formato` — extensión del archivo (`png`, `jpg`, `webp`, etc.)

**`banners`**
- `pagina` — identificador de la página a la que pertenece el banner
- `id_imagen` — FK a `archivos.id` (nullable, ON DELETE SET NULL)
- `orden` — orden de presentación (SMALLINT UNSIGNED)

---

## Módulos Implementados

### Módulo Auth

**Prefijo:** `/api/v1/auth`

| Método | Endpoint       | Auth      | Descripción                                                   |
|--------|----------------|-----------|---------------------------------------------------------------|
| POST   | `/login`       | Público   | Valida credenciales y devuelve un JWT firmado con HS256        |
| POST   | `/logout`      | JWT       | Revoca el token activo añadiendo su `jti` a `revoked_tokens`  |
| GET    | `/me`          | JWT       | Devuelve el perfil público del usuario autenticado            |

**Flujo de login:**
1. Validación del body con Zod (`loginSchema`)
2. Búsqueda del usuario por email en la base de datos
3. Verificación del hash bcrypt
4. Firma del JWT con `jti` único
5. Respuesta con `{ token, user }`

---

### Módulo Users

**Prefijo:** `/api/v1/users`

| Método | Endpoint       | Roles permitidos | Descripción                                   |
|--------|----------------|------------------|-----------------------------------------------|
| GET    | `/`            | `admin`          | Lista paginada de usuarios                    |
| POST   | `/`            | `admin`          | Crea un nuevo usuario (hash bcrypt automático)|
| GET    | `/:uuid`       | `admin` o self   | Detalle de un usuario                         |
| PATCH  | `/:uuid`       | `admin` o self   | Actualización parcial de un usuario           |
| DELETE | `/:uuid`       | `admin`          | Soft delete de un usuario                     |

**Reglas de negocio:**
- El email debe ser único en el sistema. En caso de conflicto se devuelve HTTP 409.
- La contraseña nunca se almacena en texto plano; siempre se hashea con bcrypt.
- El borrado es **soft delete** (`deleted_at` timestamp).
- Un usuario puede consultar/editar su propio perfil (`selfOrAdmin` guard).

---

### Módulo Banners

**Prefijo:** `/api/v1/banners`

| Método | Endpoint       | Roles permitidos | Descripción                                             |
|--------|----------------|------------------|---------------------------------------------------------|
| GET    | `/`            | `admin`          | Lista paginada de banners                               |
| POST   | `/`            | `admin`          | Crea un banner (opcionalmente sube imagen como archivo) |
| GET    | `/:uuid`       | `admin`          | Detalle de un banner                                    |
| PATCH  | `/:uuid`       | `admin`          | Actualización parcial de un banner                      |
| DELETE | `/:uuid`       | `admin`          | Soft delete de un banner                                |

**Reglas de negocio:**
- Si el DTO incluye `imagen` (base64), el servicio delega la subida al `ArchivoService` y almacena la FK resultante en `id_imagen`.
- Los campos `imagen_nombre`, `imagen_alt`, `imagen_title` se pasan directamente al `ArchivoService`.
- Al actualizar, si se provee una nueva `imagen`, se crea un nuevo archivo; el antiguo se **soft-elimina**.
- El campo `pagina` identifica a qué página del sitio pertenece el banner.
- El campo `orden` controla el orden de presentación.

---

### Módulo Archivos

**Prefijo:** `/api/v1/archivos`

| Módulo          | Endpoint       | Auth          | Descripción                                            |
|--------|------------------|---------------|--------------------------------------------------------|
| GET    | `/:slug`         | Público       | Sirve el archivo físico como stream (por slug opaco)   |
| GET    | `/:uuid/info`    | `admin`       | Devuelve los metadatos del archivo                     |
| POST   | `/`              | `admin`       | Sube un nuevo archivo (base64 → disco)                 |
| PATCH  | `/:uuid`         | `admin`       | Actualiza metadatos o reemplaza el archivo             |
| DELETE | `/:uuid`         | `admin`       | Soft delete del registro de archivo                    |

**DTO de creación (`POST /archivos`) — campos:**
- `imagen` *(requerido)*: data URI base64 (`data:image/...;base64,...`)
- `nombre` *(opcional)*: nombre del archivo sin extensión, usado como base del slug
- `alt` *(opcional)*: texto alternativo
- `title` *(opcional)*: título de la imagen

**Prioridad para el slug:** `nombre` → `title` → `alt` → `'archivo'`

**Reglas de negocio:**
- Los archivos son accesibles públicamente mediante un **slug opaco** (no adivinable), sin autenticación.
- Los archivos se almacenan físicamente en `UPLOADS_DIR/<path>`.
- Un `slug` único se genera a partir del nombre de archivo con la utilidad `slugify`.

---

### Módulo Nosotros

**Prefijo:** `/api/v1/nosotros`

Registro **singleton**: solo puede existir un registro activo en la tabla. El admin verifica primero con `GET` si existe y según el resultado presenta el formulario de creación o edición.

| Método | Endpoint    | Roles permitidos      | Descripción                                       |
|--------|-------------|-----------------------|---------------------------------------------------|
| GET    | `/`         | `admin`, `editor`     | Devuelve el registro singleton (o `null`)         |
| POST   | `/`         | `admin`, `editor`     | Crea el registro (error 409 si ya existe)         |
| PATCH  | `/`         | `admin`, `editor`     | Actualiza el registro existente                   |

**Campos:** `titulo` (requerido), `subtitulo` (opcional), `texto` (HTML enriquecido, requerido), `imagenes` (array de imágenes, mismo formato que noticias).

**Reglas de negocio:**
- El servicio lanza `AppError.conflict` si se intenta crear un segundo registro.
- Las imágenes se gestionan mediante la tabla pivot `nosotros_imagenes` y el servicio `ArchivoService`.
- El campo `imagenes` en PATCH reemplaza completamente el set de imágenes cuando se provee.

---

### Módulo Servicios

**Prefijo:** `/api/v1` (rutas relativas: `/servicios`, `/servicios/categorias`, `/servicios/items`, `/monedas`)

#### Monedas (catálogo)

| Método | Endpoint    | Roles permitidos      | Descripción                        |
|--------|-------------|-----------------------|------------------------------------|
| GET    | `/monedas`  | `admin`, `editor`     | Lista todas las monedas (ARS/EUR/USD) |

#### Servicio (singleton de encabezado)

| Método | Endpoint          | Roles permitidos      | Descripción                                       |
|--------|-------------------|-----------------------|---------------------------------------------------|
| GET    | `/servicios`      | `admin`, `editor`     | Devuelve el encabezado singleton (o `null`)       |
| POST   | `/servicios`      | `admin`, `editor`     | Crea el encabezado (error 409 si ya existe)       |
| PATCH  | `/servicios/:uuid`| `admin`, `editor`     | Actualiza título y/o subtítulo del encabezado     |

#### Categorías

| Método | Endpoint                          | Roles permitidos      | Descripción                      |
|--------|-----------------------------------|-----------------------|----------------------------------|
| GET    | `/servicios/categorias`           | `admin`, `editor`     | Lista paginada de categorías     |
| POST   | `/servicios/categorias`           | `admin`, `editor`     | Crea una categoría               |
| GET    | `/servicios/categorias/:uuid`     | `admin`, `editor`     | Detalle de una categoría         |
| PATCH  | `/servicios/categorias/:uuid`     | `admin`, `editor`     | Actualización parcial            |
| DELETE | `/servicios/categorias/:uuid`     | `admin`               | Soft delete de una categoría     |

#### Items

| Método | Endpoint                    | Roles permitidos      | Descripción                              |
|--------|-----------------------------|-----------------------|------------------------------------------|
| GET    | `/servicios/items`          | `admin`, `editor`     | Lista paginada de items (incluye moneda e imágenes) |
| POST   | `/servicios/items`          | `admin`, `editor`     | Crea un item                             |
| GET    | `/servicios/items/:uuid`    | `admin`, `editor`     | Detalle completo de un item              |
| PATCH  | `/servicios/items/:uuid`    | `admin`, `editor`     | Actualización parcial                    |
| DELETE | `/servicios/items/:uuid`    | `admin`               | Soft delete de un item                   |

**Campos de `servicios_items`:** `titulo` (requerido), `subtitulo_1`, `subtitulo_2`, `texto` (HTML Quill), `precio` (DECIMAL 12,2), `moneda_uuid` → FK a `monedas`, `categoria_uuid` → FK a `servicios_categorias`, `estado` ENUM (`activo`, `inactivo`, `no_mostrar`), `btn_titulo`, `btn_link`, `imagenes` (array con base64 o `archivo_uuid` para imágenes existentes).

**Tabla pivot `servicio_item_imagenes`:** Vincula `servicios_items.id` ↔ `archivos.id` con `orden` y CASCADE DELETE.

**Reglas de negocio:**
- Solo puede existir un registro en `servicios` (singleton). Crear un segundo devuelve HTTP 409.
- Las monedas son un catálogo fijo (ARS, EUR, USD) y **no se modifican desde la API**.
- Las imágenes de un item se reemplazan completamente cuando se provee el campo `imagenes` en PATCH.
- El campo `estado` controla la visibilidad en el frontend: `activo` = visible, `inactivo` = oculto, `no_mostrar` = oculto con distinción visual en el admin.

---

## Seguridad

- **Helmet** (`@fastify/helmet`): Cabeceras de seguridad HTTP (OWASP hardening).
- **CORS** (`@fastify/cors`): En producción se restringe el origen; en desarrollo se permite cualquier origen.
- **JWT HS256** (`@fastify/jwt`): Tokens firmados simétricamente con secreto de mínimo 32 caracteres.
- **Lista negra de tokens:** La tabla `revoked_tokens` permite invalidar tokens explícitamente en cada logout.
- **Bcrypt:** Hash de contraseñas con mínimo 10 rondas (configurable hasta 15).
- **Validación de entradas:** Todos los DTOs son validados con **Zod** antes de llegar al Service.
- **Sentencias preparadas:** Todo acceso a base de datos usa queries parametrizadas (sin concatenación de strings SQL).
- **Soft delete:** Los registros eliminados no se borran físicamente; se marca `deleted_at`.

---

## Utilidades Compartidas

| Utilidad            | Descripción                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `api-response.ts`   | Funciones `apiSuccess()` y `apiError()` para estandarizar respuestas JSON   |
| `app-error.ts`      | Clase `AppError` con factorías: `.badRequest()`, `.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()` |
| `slugify.ts`        | Genera slugs URL-safe a partir de strings                                   |
| `auth.middleware.ts` | `authenticate`, `requireRole(...roles)`, `selfOrAdmin(param)` como preHandlers Fastify |
| `error-handler.middleware.ts` | Manejador global de errores: distingue `AppError`, `ZodError` y errores genéricos |

---

## Scripts Disponibles

```bash
npm run dev        # Servidor en modo watch (tsx watch)
npm run build      # Compilación TypeScript a /dist
npm run start      # Arranque desde /dist (producción)
npm run migrate    # Ejecuta todas las migraciones pendientes
npm run typecheck  # Verificación de tipos sin emitir archivos
```

---

## Convenciones

- Todos los identificadores públicos expuestos en la API son **UUID v4** (nunca IDs numéricos).
- Las respuestas siguen el envelope estándar: `{ success: boolean, data: T | null, message: string }`.
- La paginación devuelve siempre un objeto `meta`: `{ page, limit, total, totalPages }`.
- Los errores HTTP siguen el formato: `{ success: false, message: string, code: string }`.
- Los módulos siguen la estructura: `[nombre].controller.ts`, `[nombre].service.ts`, `[nombre].repository.ts`, `[nombre].routes.ts`, `dtos/`.
