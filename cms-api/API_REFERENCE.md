# CMS API — Reference Documentation

> **Target audience:** AI agents and developers integrating with or building an admin UI on top of this API.
> **Base URL:** `http://localhost:3000/api/v1` (default; controlled by `PORT` and `API_PREFIX` env vars)
> **Protocol:** REST over HTTP/HTTPS
> **Content-Type:** `application/json` for all requests and responses (except `GET /api/v1/archivos/:slug` which streams the file binary)
> **Auth scheme:** Bearer JWT (`Authorization: Bearer <token>`)
> **Token algorithm:** HS256 · Default TTL: `15m` (configurable via `JWT_EXPIRES_IN`)

---

## Response Envelope

Every endpoint returns the same top-level wrapper.

### Success

```json
{
  "success": true,
  "data": <payload>,
  "message": "Optional human-readable message."
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable error description.",
  "code": "ERROR_CODE",
  "errors": {
    "fieldName": ["Validation message 1"]
  }
}
```

`errors` only appears on `422 VALIDATION_ERROR` responses.

### Error codes reference

| HTTP | `code`             | Meaning                                            |
| ---- | -------------------- | -------------------------------------------------- |
| 400  | `BAD_REQUEST`      | Invalid request (business rule violation)          |
| 401  | `UNAUTHORIZED`     | Missing or invalid JWT                             |
| 403  | `FORBIDDEN`        | Valid JWT but insufficient permissions             |
| 404  | `NOT_FOUND`        | Resource does not exist                            |
| 409  | `CONFLICT`         | Unique constraint violation (e.g. duplicate email) |
| 422  | `VALIDATION_ERROR` | Zod schema validation failure                      |
| 500  | `INTERNAL_ERROR`   | Unexpected server error                            |

---

## Data Types

### `PublicUser` object

Returned by all user-related endpoints. Never exposes `password_hash` or internal numeric `id`.

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "is_active": 1,
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-04-20T08:00:00.000Z"
}
```

| Field          | Type       | Notes                                                      |
| -------------- | ---------- | ---------------------------------------------------------- |
| `uuid`       | `string` | UUID v4, used as public identifier                         |
| `name`       | `string` | 2–150 characters                                          |
| `email`      | `string` | Unique, stored lowercase                                   |
| `role`       | `string` | `"admin"` \| `"editor"` \| `"viewer"`                |
| `is_active`  | `number` | `1` = active, `0` = deactivated (TINYINT from MariaDB) |
| `created_at` | `string` | ISO 8601 datetime                                          |
| `updated_at` | `string` | ISO 8601 datetime                                          |

### `PublicArchivo` object

Returned by archivo management endpoints. Never exposes the internal numeric `id`.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "path": "mi-banner-abc123.png",
  "slug": "mi-banner-abc123",
  "alt": "Banner principal de inicio",
  "title": "Inicio banner",
  "formato": "png",
  "created_at": "2026-04-26T12:00:00.000Z",
  "updated_at": "2026-04-26T12:00:00.000Z"
}
```

| Field          | Type               | Notes                                                        |
| -------------- | ------------------ | ------------------------------------------------------------ |
| `uuid`       | `string`         | UUID v4, used as public identifier                           |
| `path`       | `string`         | Filename on disk (relative to `UPLOADS_DIR`)               |
| `slug`       | `string`         | URL-safe identifier; used in `GET /archivos/:slug`         |
| `alt`        | `string \| null` | Alt text for accessibility                                   |
| `title`      | `string \| null` | Title attribute for the image                                |
| `formato`    | `string`         | File extension: `png`, `jpg`, `webp`, `gif`, `svg`     |
| `created_at` | `string`         | ISO 8601 datetime                                            |
| `updated_at` | `string`         | ISO 8601 datetime                                            |

### `PublicBanner` object

Returned by all banner-related endpoints. The `imagen` field is always a fully-formed URL path (or `null` if no image is set).

```json
{
  "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "pagina": "inicio",
  "imagen": "/api/v1/archivos/mi-banner-abc123",
  "h1": "Bienvenido a nuestro sitio",
  "texto_1": "El mejor servicio del mercado.",
  "texto_2": null,
  "btn_texto": "Ver más",
  "btn_link": "/servicios",
  "orden": 1,
  "created_at": "2026-04-26T12:00:00.000Z",
  "updated_at": "2026-04-26T12:00:00.000Z"
}
```

| Field          | Type               | Notes                                                                 |
| -------------- | ------------------ | --------------------------------------------------------------------- |
| `uuid`       | `string`         | UUID v4, used as public identifier                                    |
| `pagina`     | `string`         | Page slug where the banner appears (max 100 chars)                    |
| `imagen`     | `string \| null` | URL path to the image: `/api/v1/archivos/<slug>`, or `null`         |
| `h1`         | `string`         | Main heading text (max 255 chars)                                     |
| `texto_1`    | `string \| null` | First body text block                                                 |
| `texto_2`    | `string \| null` | Second body text block                                                |
| `btn_texto`  | `string \| null` | Button label (max 100 chars)                                          |
| `btn_link`   | `string \| null` | Button URL (max 500 chars)                                            |
| `orden`      | `number`         | Display order (ascending, zero-based)                                 |
| `created_at` | `string`         | ISO 8601 datetime                                                     |
| `updated_at` | `string`         | ISO 8601 datetime                                                     |

### `JwtPayload` (decoded token)

```json
{
  "jti": "uuid-of-this-token",
  "sub": "user-uuid",
  "email": "john@example.com",
  "role": "admin",
  "iat": 1714000000,
  "exp": 1714000900
}
```

### Base64 image format

Whenever an endpoint accepts an image upload (`imagen` field), it must be sent as a **data URI**:

```
data:<mime-type>;base64,<base64-encoded-bytes>
```

Accepted MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/svg+xml`.

**Example:**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk...
```

---

## Roles & Permissions

| Role       | Description                              |
| ---------- | ---------------------------------------- |
| `admin`  | Full access to all endpoints             |
| `editor` | Can view own profile, update own profile |
| `viewer` | Can view own profile, update own profile |

> Non-admin users can only read or modify **their own** profile. They cannot change their own `role`.

---

## AUTH Endpoints

### `POST /api/v1/auth/login`

Authenticates a user and returns a short-lived JWT.

**Auth required:** No

**Request body:**

```json
{
  "email": "admin@example.com",
  "password": "MyP@ssw0rd!"
}
```

| Field        | Type       | Required | Rules              |
| ------------ | ---------- | -------- | ------------------ |
| `email`    | `string` | Yes      | Valid email format |
| `password` | `string` | Yes      | Non-empty          |

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": 1,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-04-20T08:00:00.000Z"
    }
  },
  "message": "Login successful."
}
```

**Possible errors:**

| HTTP | `code`             | When                                                         |
| ---- | -------------------- | ------------------------------------------------------------ |
| 401  | `UNAUTHORIZED`     | Email not found: `"Invalid email."`                        |
| 401  | `UNAUTHORIZED`     | Wrong password: `"Invalid password."`                      |
| 403  | `FORBIDDEN`        | Account deactivated: `"Your account has been deactivated."` |
| 422  | `VALIDATION_ERROR` | Body fails schema validation                                 |

---

### `POST /api/v1/auth/logout`

Revokes the current token by adding its `jti` to a blocklist.

**Auth required:** Yes

**Request body:** None

**Success `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully."
}
```

**Possible errors:**

| HTTP | `code`         | When                              |
| ---- | ---------------- | --------------------------------- |
| 401  | `UNAUTHORIZED` | No token or token already revoked |

---

### `GET /api/v1/auth/me`

Returns the profile of the currently authenticated user.

**Auth required:** Yes

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": 1,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-04-20T08:00:00.000Z"
  }
}
```

**Possible errors:**

| HTTP | `code`         | When                              |
| ---- | ---------------- | --------------------------------- |
| 401  | `UNAUTHORIZED` | No token or token revoked/expired |

---

## USERS Endpoints

All users endpoints require authentication. Admin-only endpoints require the `role` in the JWT to be `"admin"`.

---

### `GET /api/v1/users`

Returns a paginated list of all users.

**Auth required:** Yes — **admin only**

**Query parameters:**

| Param     | Type        | Default | Rules             |
| --------- | ----------- | ------- | ----------------- |
| `page`  | `integer` | `1`   | Positive integer  |
| `limit` | `integer` | `20`  | Between 1 and 100 |

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "is_active": 1,
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-04-20T08:00:00.000Z"
      }
    ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**Possible errors:**

| HTTP | `code`             | When                                |
| ---- | -------------------- | ----------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                   |
| 403  | `FORBIDDEN`        | Authenticated but not admin         |
| 422  | `VALIDATION_ERROR` | Invalid `page` or `limit` param |

---

### `POST /api/v1/users`

Creates a new user.

**Auth required:** Yes — **admin only**

**Request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure@123",
  "role": "editor"
}
```

| Field        | Type       | Required | Rules                                                                        |
| ------------ | ---------- | -------- | ---------------------------------------------------------------------------- |
| `name`     | `string` | Yes      | 2–150 characters                                                            |
| `email`    | `string` | Yes      | Valid email, must be unique (stored lowercase)                               |
| `password` | `string` | Yes      | 8–72 chars, must contain uppercase, lowercase, digit, and special character |
| `role`     | `string` | No       | `"admin"` \| `"editor"` \| `"viewer"` · defaults to `"viewer"`      |

**Success `201`:**

```json
{
  "success": true,
  "data": {
    "uuid": "772g0622-g41d-63f6-c938-668877662222",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "editor",
    "is_active": 1,
    "created_at": "2026-04-26T12:00:00.000Z",
    "updated_at": "2026-04-26T12:00:00.000Z"
  },
  "message": "User created successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                                                 |
| ---- | -------------------- | ---------------------------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                                    |
| 403  | `FORBIDDEN`        | Authenticated but not admin                          |
| 409  | `CONFLICT`         | `"A user with this email address already exists."` |
| 422  | `VALIDATION_ERROR` | Body fails schema (see field rules above)            |

---

### `GET /api/v1/users/:uuid`

Returns a single user by UUID.

**Auth required:** Yes — **admin** or **the user themselves**

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Success `200`:** Returns a `PublicUser` object.

**Possible errors:**

| HTTP | `code`             | When                                    |
| ---- | -------------------- | --------------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                       |
| 403  | `FORBIDDEN`        | Authenticated but not admin or not self |
| 404  | `NOT_FOUND`        | `"User not found."`                   |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format    |

---

### `PATCH /api/v1/users/:uuid`

Partially updates a user. All fields are optional.

**Auth required:** Yes — **admin** or **the user themselves**
**Restriction:** Non-admin users cannot change their own `role`.

**Request body** (all fields optional):

```json
{
  "name": "Jane Smith",
  "email": "janesmith@example.com",
  "password": "NewP@ssw0rd!",
  "role": "admin",
  "is_active": false
}
```

| Field         | Type        | Rules                                                                        |
| ------------- | ----------- | ---------------------------------------------------------------------------- |
| `name`      | `string`  | 2–150 characters                                                            |
| `email`     | `string`  | Valid email, must be unique                                                  |
| `password`  | `string`  | 8–72 chars, must contain uppercase, lowercase, digit, and special character |
| `role`      | `string`  | `"admin"` \| `"editor"` \| `"viewer"` · **admin only**          |
| `is_active` | `boolean` | `true` to activate, `false` to deactivate                                |

**Success `200`:** Returns updated `PublicUser`.

**Possible errors:**

| HTTP | `code`             | When                                        |
| ---- | -------------------- | ------------------------------------------- |
| 400  | `BAD_REQUEST`      | Non-admin trying to change own `role`     |
| 401  | `UNAUTHORIZED`     | Not authenticated                           |
| 403  | `FORBIDDEN`        | Not admin or not self                       |
| 404  | `NOT_FOUND`        | `"User not found."`                       |
| 409  | `CONFLICT`         | `"This email address is already in use."` |
| 422  | `VALIDATION_ERROR` | Body or `:uuid` param fails schema        |

---

### `DELETE /api/v1/users/:uuid`

Soft-deletes a user (sets `deleted_at`). The user will no longer appear in listings or be able to log in.

**Auth required:** Yes — **admin only**
**Restriction:** Admins cannot delete their own account.

**Success `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                                      |
| ---- | -------------------- | ----------------------------------------- |
| 400  | `BAD_REQUEST`      | `"You cannot delete your own account."` |
| 401  | `UNAUTHORIZED`     | Not authenticated                         |
| 403  | `FORBIDDEN`        | Authenticated but not admin               |
| 404  | `NOT_FOUND`        | `"User not found."`                     |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format      |

---

## ARCHIVOS Endpoints

Archivos are the central file registry. Every image used in the CMS (banners, etc.) must be stored here first. Files are received as base64 data URIs, persisted to disk, and served back via a public URL.

**File storage:** Physical files are saved to `UPLOADS_DIR/<slug>.<ext>` on the server.
**Public URL pattern:** `GET /api/v1/archivos/<slug>` streams the file directly.

---

### `GET /api/v1/archivos/:slug`

Streams the physical file to the client. **No authentication required.**

Files are identified by an opaque, auto-generated slug that is not guessable.

**Path parameter:**

| Param    | Type       | Rules                                  |
| -------- | ---------- | -------------------------------------- |
| `slug` | `string` | Lowercase alphanumeric + hyphens only |

**Success:** Streams the file binary with the correct `Content-Type` header and long-lived `Cache-Control: public, max-age=31536000, immutable`.

**Possible errors:**

| HTTP | `code`      | When                              |
| ---- | ----------- | --------------------------------- |
| 404  | `NOT_FOUND` | Slug not found or file deleted    |
| 422  | `VALIDATION_ERROR` | Slug contains invalid characters |

---

### `GET /api/v1/archivos/:uuid/info`

Returns the metadata record of an archivo (no file content).

**Auth required:** Yes — **admin only**

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "path": "inicio-abc12345.png",
    "slug": "inicio-abc12345",
    "alt": "Banner principal",
    "title": "Inicio",
    "formato": "png",
    "created_at": "2026-04-26T12:00:00.000Z",
    "updated_at": "2026-04-26T12:00:00.000Z"
  }
}
```

**Possible errors:**

| HTTP | `code`             | When                               |
| ---- | -------------------- | ---------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                  |
| 403  | `FORBIDDEN`        | Not admin                          |
| 404  | `NOT_FOUND`        | `"Archivo not found."`           |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format |

---

### `POST /api/v1/archivos`

Uploads a new file from a base64 data URI. The server decodes the data, writes the file to disk, generates a unique slug, and stores the metadata in the `archivos` table.

**Auth required:** Yes — **admin only**

**Request body:**

```json
{
  "imagen": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
  "alt": "Banner principal de la página de inicio",
  "title": "Inicio banner"
}
```

| Field        | Type               | Required | Rules                                               |
| ------------ | ------------------ | -------- | --------------------------------------------------- |
| `imagen`   | `string`         | Yes      | Base64 data URI. Accepted: `png`, `jpg`, `webp`, `gif`, `svg` |
| `alt`      | `string \| null` | No       | Max 255 characters                                  |
| `title`    | `string \| null` | No       | Max 255 characters. Used as base for the slug.      |

**Slug generation:** The slug is derived from `title` (or `alt` as fallback, or `"archivo"` if neither is set). A short random suffix is appended automatically if the slug is already taken.

**Success `201`:**

```json
{
  "success": true,
  "data": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "path": "inicio-abc12345.png",
    "slug": "inicio-abc12345",
    "alt": "Banner principal de la página de inicio",
    "title": "Inicio banner",
    "formato": "png",
    "created_at": "2026-04-26T12:00:00.000Z",
    "updated_at": "2026-04-26T12:00:00.000Z"
  },
  "message": "Archivo created successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                                   |
| ---- | -------------------- | -------------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                      |
| 403  | `FORBIDDEN`        | Not admin                              |
| 409  | `CONFLICT`         | Could not generate a unique slug       |
| 422  | `VALIDATION_ERROR` | `imagen` is missing or invalid format  |

---

### `PATCH /api/v1/archivos/:uuid`

Updates the metadata of an archivo and optionally replaces the physical file.

**Auth required:** Yes — **admin only**

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Request body** (all fields optional):

```json
{
  "imagen": "data:image/webp;base64,UklGRlYAAABXRUJQ...",
  "alt": "Nuevo texto alternativo",
  "title": "Nuevo título"
}
```

| Field      | Type               | Rules                                                                     |
| ---------- | ------------------ | ------------------------------------------------------------------------- |
| `imagen` | `string`         | Optional. If provided, overwrites the file on disk. Slug is **not** changed. |
| `alt`    | `string \| null` | Max 255 characters                                                        |
| `title`  | `string \| null` | Max 255 characters                                                        |

**Notes:**
- If the new `imagen` has a different format (e.g. PNG → WebP), the old file is deleted from disk and the new one is written with the updated extension.
- The `slug` and `path` filename stem are **never** changed by an update, only the extension may change if the format changes.

**Success `200`:** Returns updated `PublicArchivo`.

**Possible errors:**

| HTTP | `code`             | When                               |
| ---- | -------------------- | ---------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                  |
| 403  | `FORBIDDEN`        | Not admin                          |
| 404  | `NOT_FOUND`        | `"Archivo not found."`           |
| 422  | `VALIDATION_ERROR` | Body or `:uuid` param fails schema |

---

### `DELETE /api/v1/archivos/:uuid`

Soft-deletes the archivo record (`deleted_at` is set). The physical file is **not** removed from disk immediately to protect any still-active references.

**Auth required:** Yes — **admin only**

**Success `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "Archivo deleted successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                               |
| ---- | -------------------- | ---------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                  |
| 403  | `FORBIDDEN`        | Not admin                          |
| 404  | `NOT_FOUND`        | `"Archivo not found."`           |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format |

---

## BANNERS Endpoints

Banners are page-level hero elements. Each banner optionally references an `Archivo` for its image via a foreign key (`id_imagen`). The `imagen` field in responses is always a ready-to-use URL path (or `null`).

**Image upload:** Pass the image inline as a base64 data URI in the `imagen` field. The API automatically creates the `Archivo` record and links it. To reuse an existing archivo, use `PATCH /api/v1/archivos/:uuid` and store the resulting URL; to replace it, pass a new `imagen` in the banner `PATCH`.

---

### `GET /api/v1/banners`

Returns a paginated list of all banners, ordered by `orden ASC`.

**Auth required:** Yes — **admin only**

**Query parameters:**

| Param     | Type        | Default | Rules             |
| --------- | ----------- | ------- | ----------------- |
| `page`  | `integer` | `1`   | Positive integer  |
| `limit` | `integer` | `20`  | Between 1 and 100 |

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "pagina": "inicio",
        "imagen": "/api/v1/archivos/inicio-abc12345",
        "h1": "Bienvenido a nuestro sitio",
        "texto_1": "El mejor servicio del mercado.",
        "texto_2": null,
        "btn_texto": "Ver más",
        "btn_link": "/servicios",
        "orden": 1,
        "created_at": "2026-04-26T12:00:00.000Z",
        "updated_at": "2026-04-26T12:00:00.000Z"
      }
    ],
    "meta": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

**Possible errors:**

| HTTP | `code`             | When                                |
| ---- | -------------------- | ----------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                   |
| 403  | `FORBIDDEN`        | Not admin                           |
| 422  | `VALIDATION_ERROR` | Invalid `page` or `limit` param |

---

### `POST /api/v1/banners`

Creates a new banner. If `imagen` is provided, a new `Archivo` record is automatically created and linked.

**Auth required:** Yes — **admin only**

**Request body:**

```json
{
  "pagina": "inicio",
  "imagen": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
  "imagen_alt": "Banner principal",
  "imagen_title": "Inicio hero",
  "h1": "Bienvenido a nuestro sitio",
  "texto_1": "El mejor servicio del mercado.",
  "texto_2": null,
  "btn_texto": "Ver más",
  "btn_link": "/servicios",
  "orden": 1
}
```

| Field           | Type               | Required | Rules                                                  |
| --------------- | ------------------ | -------- | ------------------------------------------------------ |
| `pagina`      | `string`         | Yes      | Max 100 characters                                     |
| `imagen`      | `string`         | No       | Base64 data URI. Accepted: `png`, `jpg`, `webp`, `gif`, `svg` |
| `imagen_alt`  | `string \| null` | No       | Alt text for the image archivo (max 255 chars)         |
| `imagen_title`| `string \| null` | No       | Title for the image archivo (max 255 chars)            |
| `h1`          | `string`         | Yes      | Max 255 characters                                     |
| `texto_1`     | `string \| null` | No       | Long text (up to 65 535 chars)                         |
| `texto_2`     | `string \| null` | No       | Long text (up to 65 535 chars)                         |
| `btn_texto`   | `string \| null` | No       | Button label (max 100 chars)                           |
| `btn_link`    | `string \| null` | No       | Button URL (max 500 chars)                             |
| `orden`       | `integer`        | No       | ≥ 0, defaults to `0`                                 |

**Success `201`:** Returns a `PublicBanner` object with `"message": "Banner created successfully."`.

**Possible errors:**

| HTTP | `code`             | When                                  |
| ---- | -------------------- | ------------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                     |
| 403  | `FORBIDDEN`        | Not admin                             |
| 422  | `VALIDATION_ERROR` | Body fails schema (see field rules)   |

---

### `GET /api/v1/banners/:uuid`

Returns a single banner by UUID.

**Auth required:** Yes — **admin only**

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Success `200`:** Returns a `PublicBanner` object.

**Possible errors:**

| HTTP | `code`             | When                               |
| ---- | -------------------- | ---------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                  |
| 403  | `FORBIDDEN`        | Not admin                          |
| 404  | `NOT_FOUND`        | `"Banner not found."`            |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format |

---

### `PATCH /api/v1/banners/:uuid`

Partially updates a banner. All fields are optional.

If `imagen` is provided, a **new** `Archivo` is created, the banner's FK is updated to point to it, and the previously linked archivo is soft-deleted automatically.

**Auth required:** Yes — **admin only**

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Request body** (all fields optional):

```json
{
  "pagina": "nosotros",
  "imagen": "data:image/webp;base64,UklGRlYAAABXRUJQ...",
  "imagen_alt": "Equipo de trabajo",
  "imagen_title": "Nosotros hero",
  "h1": "Quiénes somos",
  "texto_1": "Un equipo apasionado.",
  "texto_2": null,
  "btn_texto": null,
  "btn_link": null,
  "orden": 2
}
```

| Field           | Type               | Rules                                                  |
| --------------- | ------------------ | ------------------------------------------------------ |
| `pagina`      | `string`         | Max 100 characters                                     |
| `imagen`      | `string`         | Base64 data URI. Triggers new archivo creation + old archivo soft-delete |
| `imagen_alt`  | `string \| null` | Alt text for the new imagen archivo                    |
| `imagen_title`| `string \| null` | Title for the new imagen archivo                       |
| `h1`          | `string`         | Max 255 characters                                     |
| `texto_1`     | `string \| null` | Long text (up to 65 535 chars)                         |
| `texto_2`     | `string \| null` | Long text (up to 65 535 chars)                         |
| `btn_texto`   | `string \| null` | Button label (max 100 chars)                           |
| `btn_link`    | `string \| null` | Button URL (max 500 chars)                             |
| `orden`       | `integer`        | ≥ 0                                                   |

**Success `200`:** Returns updated `PublicBanner` with `"message": "Banner updated successfully."`.

**Possible errors:**

| HTTP | `code`             | When                               |
| ---- | -------------------- | ---------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                  |
| 403  | `FORBIDDEN`        | Not admin                          |
| 404  | `NOT_FOUND`        | `"Banner not found."`            |
| 422  | `VALIDATION_ERROR` | Body or `:uuid` param fails schema |

---

### `DELETE /api/v1/banners/:uuid`

Soft-deletes a banner. The linked `Archivo` record is **not** deleted automatically.

**Auth required:** Yes — **admin only**

**Success `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "Banner deleted successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                               |
| ---- | -------------------- | ---------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                  |
| 403  | `FORBIDDEN`        | Not admin                          |
| 404  | `NOT_FOUND`        | `"Banner not found."`            |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format |

---

## Authentication Flow (summary for admin UI)

```
1. POST /api/v1/auth/login  →  receive { token, user }
2. Store token (memory / httpOnly cookie)
3. Add header to every subsequent request:
     Authorization: Bearer <token>
4. On 401 response  →  redirect to login
5. POST /api/v1/auth/logout  →  token is revoked server-side, clear local storage
```

**Token expiry strategy:**

- Default TTL is `15m`. Plan to handle `401 UNAUTHORIZED` by prompting re-login or implementing a refresh mechanism if one is added in the future.
- After logout, the token is blocklisted immediately; do not reuse it.

---

## Environment Variables

| Variable                | Default         | Description                                                  |
| ----------------------- | --------------- | ------------------------------------------------------------ |
| `PORT`                | `3000`        | HTTP port the server listens on                              |
| `HOST`                | `0.0.0.0`     | Bind address                                                 |
| `API_PREFIX`          | `/api/v1`     | URL prefix for all routes                                    |
| `JWT_SECRET`          | —              | HS256 signing secret (min 32 chars, **required**)      |
| `JWT_EXPIRES_IN`      | `15m`         | Token lifetime (e.g. `15m`, `1h`, `7d`)                |
| `BCRYPT_ROUNDS`       | `12`          | bcrypt cost factor (10–15)                                  |
| `DB_HOST`             | —              | MariaDB host (**required**)                            |
| `DB_PORT`             | `3306`        | MariaDB port                                                 |
| `DB_NAME`             | —              | Database name (**required**)                           |
| `DB_USER`             | —              | Database user (**required**)                           |
| `DB_PASSWORD`         | —              | Database password                                            |
| `DB_CONNECTION_LIMIT` | `10`          | Connection pool size                                         |
| `NODE_ENV`            | `development` | `development` \| `production` \| `test`                |
| `UPLOADS_DIR`         | `uploads`     | Directory where uploaded files are stored (relative or absolute path) |

---

## Endpoint Summary Table

| Method     | Path                           | Auth | Role  | Description                              |
| ---------- | ------------------------------ | ---- | ----- | ---------------------------------------- |
| `POST`   | `/api/v1/auth/login`         | No   | —    | Login, get JWT                           |
| `POST`   | `/api/v1/auth/logout`        | Yes  | any   | Revoke current token                     |
| `GET`    | `/api/v1/auth/me`            | Yes  | any   | Get own profile                          |
| `GET`    | `/api/v1/users`              | Yes  | admin | List all users (paginated)               |
| `POST`   | `/api/v1/users`              | Yes  | admin | Create a user                            |
| `GET`    | `/api/v1/users/:uuid`        | Yes  | admin \| self | Get a user by UUID              |
| `PATCH`  | `/api/v1/users/:uuid`        | Yes  | admin \| self | Partially update a user         |
| `DELETE` | `/api/v1/users/:uuid`        | Yes  | admin | Soft-delete a user                       |
| `GET`    | `/api/v1/archivos/:slug`     | No   | —    | Stream a file by slug (public)           |
| `GET`    | `/api/v1/archivos/:uuid/info`| Yes  | admin | Get archivo metadata                     |
| `POST`   | `/api/v1/archivos`           | Yes  | admin | Upload a file (base64 data URI)          |
| `PATCH`  | `/api/v1/archivos/:uuid`     | Yes  | admin | Update metadata / replace file           |
| `DELETE` | `/api/v1/archivos/:uuid`     | Yes  | admin | Soft-delete an archivo                   |
| `GET`    | `/api/v1/banners`            | Yes  | admin | List all banners (paginated)             |
| `POST`   | `/api/v1/banners`            | Yes  | admin | Create a banner                          |
| `GET`    | `/api/v1/banners/:uuid`      | Yes  | admin | Get a banner by UUID                     |
| `PATCH`  | `/api/v1/banners/:uuid`      | Yes  | admin | Partially update a banner                |
| `DELETE` | `/api/v1/banners/:uuid`      | Yes  | admin | Soft-delete a banner                     |


> **Target audience:** AI agents and developers integrating with or building an admin UI on top of this API.
> **Base URL:** `http://localhost:3000/api/v1` (default; controlled by `PORT` and `API_PREFIX` env vars)
> **Protocol:** REST over HTTP/HTTPS
> **Content-Type:** `application/json` for all requests and responses
> **Auth scheme:** Bearer JWT (`Authorization: Bearer <token>`)
> **Token algorithm:** HS256 · Default TTL: `15m` (configurable via `JWT_EXPIRES_IN`)

---

## Response Envelope

Every endpoint returns the same top-level wrapper.

### Success

```json
{
  "success": true,
  "data": <payload>,
  "message": "Optional human-readable message."
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable error description.",
  "code": "ERROR_CODE",
  "errors": {
    "fieldName": ["Validation message 1"]
  }
}
```

`errors` only appears on `422 VALIDATION_ERROR` responses.

### Error codes reference

| HTTP | `code`             | Meaning                                            |
| ---- | -------------------- | -------------------------------------------------- |
| 400  | `BAD_REQUEST`      | Invalid request (business rule violation)          |
| 401  | `UNAUTHORIZED`     | Missing or invalid JWT                             |
| 403  | `FORBIDDEN`        | Valid JWT but insufficient permissions             |
| 404  | `NOT_FOUND`        | Resource does not exist                            |
| 409  | `CONFLICT`         | Unique constraint violation (e.g. duplicate email) |
| 422  | `VALIDATION_ERROR` | Zod schema validation failure                      |
| 500  | `INTERNAL_ERROR`   | Unexpected server error                            |

---

## Data Types

### `PublicUser` object

Returned by all user-related endpoints. Never exposes `password_hash` or internal numeric `id`.

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "is_active": 1,
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-04-20T08:00:00.000Z"
}
```

| Field          | Type       | Notes                                                      |
| -------------- | ---------- | ---------------------------------------------------------- |
| `uuid`       | `string` | UUID v4, used as public identifier                         |
| `name`       | `string` | 2–150 characters                                          |
| `email`      | `string` | Unique, stored lowercase                                   |
| `role`       | `string` | `"admin"` \| `"editor"` \| `"viewer"`                |
| `is_active`  | `number` | `1` = active, `0` = deactivated (TINYINT from MariaDB) |
| `created_at` | `string` | ISO 8601 datetime                                          |
| `updated_at` | `string` | ISO 8601 datetime                                          |

### `JwtPayload` (decoded token)

```json
{
  "jti": "uuid-of-this-token",
  "sub": "user-uuid",
  "email": "john@example.com",
  "role": "admin",
  "iat": 1714000000,
  "exp": 1714000900
}
```

---

## Roles & Permissions

| Role       | Description                              |
| ---------- | ---------------------------------------- |
| `admin`  | Full access to all endpoints             |
| `editor` | Can view own profile, update own profile |
| `viewer` | Can view own profile, update own profile |

> Non-admin users can only read or modify **their own** profile. They cannot change their own `role`.

---

## AUTH Endpoints

### `POST /api/v1/auth/login`

Authenticates a user and returns a short-lived JWT.

**Auth required:** No

**Request body:**

```json
{
  "email": "admin@example.com",
  "password": "MyP@ssw0rd!"
}
```

| Field        | Type       | Required | Rules              |
| ------------ | ---------- | -------- | ------------------ |
| `email`    | `string` | Yes      | Valid email format |
| `password` | `string` | Yes      | Non-empty          |

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": 1,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-04-20T08:00:00.000Z"
    }
  },
  "message": "Login successful."
}
```

**Possible errors:**

| HTTP | `code`             | When                                                         |
| ---- | -------------------- | ------------------------------------------------------------ |
| 401  | `UNAUTHORIZED`     | Email not found:`"Invalid email."`                         |
| 401  | `UNAUTHORIZED`     | Wrong password:`"Invalid password."`                       |
| 403  | `FORBIDDEN`        | Account deactivated:`"Your account has been deactivated."` |
| 422  | `VALIDATION_ERROR` | Body fails schema validation                                 |

**Notes:**

- The token expires in `JWT_EXPIRES_IN` (default `15m`). Store it and handle `401` responses to prompt re-login.
- Use the token in subsequent requests via `Authorization: Bearer <token>` header.

---

### `POST /api/v1/auth/logout`

Revokes the current token by adding its `jti` to a blocklist. The token becomes invalid immediately even if not yet expired.

**Auth required:** Yes

**Request body:** None

**Success `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully."
}
```

**Possible errors:**

| HTTP | `code`         | When                              |
| ---- | ---------------- | --------------------------------- |
| 401  | `UNAUTHORIZED` | No token or token already revoked |

---

### `GET /api/v1/auth/me`

Returns the profile of the currently authenticated user.

**Auth required:** Yes

**Request body:** None

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": 1,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-04-20T08:00:00.000Z"
  }
}
```

**Possible errors:**

| HTTP | `code`         | When                              |
| ---- | ---------------- | --------------------------------- |
| 401  | `UNAUTHORIZED` | No token or token revoked/expired |

---

## USERS Endpoints

All users endpoints require authentication. Admin-only endpoints require the `role` in the JWT to be `"admin"`.

---

### `GET /api/v1/users`

Returns a paginated list of all users.

**Auth required:** Yes — **admin only**

**Query parameters:**

| Param     | Type        | Default | Rules             |
| --------- | ----------- | ------- | ----------------- |
| `page`  | `integer` | `1`   | Positive integer  |
| `limit` | `integer` | `20`  | Between 1 and 100 |

**Example request:**

```
GET /api/v1/users?page=1&limit=10
Authorization: Bearer <token>
```

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "is_active": 1,
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-04-20T08:00:00.000Z"
      },
      {
        "uuid": "661f9511-f30c-52e5-b827-557766551111",
        "name": "Jane Editor",
        "email": "jane@example.com",
        "role": "editor",
        "is_active": 1,
        "created_at": "2025-02-01T09:00:00.000Z",
        "updated_at": "2025-02-01T09:00:00.000Z"
      }
    ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**Possible errors:**

| HTTP | `code`             | When                                |
| ---- | -------------------- | ----------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                   |
| 403  | `FORBIDDEN`        | Authenticated but not admin         |
| 422  | `VALIDATION_ERROR` | Invalid `page` or `limit` param |

---

### `POST /api/v1/users`

Creates a new user.

**Auth required:** Yes — **admin only**

**Request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure@123",
  "role": "editor"
}
```

| Field        | Type       | Required | Rules                                                                        |
| ------------ | ---------- | -------- | ---------------------------------------------------------------------------- |
| `name`     | `string` | Yes      | 2–150 characters                                                            |
| `email`    | `string` | Yes      | Valid email, must be unique (stored lowercase)                               |
| `password` | `string` | Yes      | 8–72 chars, must contain uppercase, lowercase, digit, and special character |
| `role`     | `string` | No       | `"admin"` \| `"editor"` \| `"viewer"` · defaults to `"viewer"`      |

**Success `201`:**

```json
{
  "success": true,
  "data": {
    "uuid": "772g0622-g41d-63f6-c938-668877662222",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "editor",
    "is_active": 1,
    "created_at": "2026-04-26T12:00:00.000Z",
    "updated_at": "2026-04-26T12:00:00.000Z"
  },
  "message": "User created successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                                                 |
| ---- | -------------------- | ---------------------------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                                    |
| 403  | `FORBIDDEN`        | Authenticated but not admin                          |
| 409  | `CONFLICT`         | `"A user with this email address already exists."` |
| 422  | `VALIDATION_ERROR` | Body fails schema (see field rules above)            |

**Validation error example `422`:**

```json
{
  "success": false,
  "message": "Validation failed.",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": ["Must be a valid email address."],
    "password": ["Password must include uppercase, lowercase, a number, and a special character."]
  }
}
```

---

### `GET /api/v1/users/:uuid`

Returns a single user by UUID.

**Auth required:** Yes — **admin** or **the user themselves**

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Example request:**

```
GET /api/v1/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": 1,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-04-20T08:00:00.000Z"
  }
}
```

**Possible errors:**

| HTTP | `code`             | When                                    |
| ---- | -------------------- | --------------------------------------- |
| 401  | `UNAUTHORIZED`     | Not authenticated                       |
| 403  | `FORBIDDEN`        | Authenticated but not admin or not self |
| 404  | `NOT_FOUND`        | `"User not found."`                   |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format    |

---

### `PATCH /api/v1/users/:uuid`

Partially updates a user. All fields are optional; send only the ones to change.

**Auth required:** Yes — **admin** or **the user themselves**
**Restriction:** Non-admin users cannot change their own `role`.

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Request body** (all fields optional, at least one expected):

```json
{
  "name": "Jane Smith",
  "email": "janesmith@example.com",
  "password": "NewP@ssw0rd!",
  "role": "admin",
  "is_active": false
}
```

| Field         | Type        | Rules                                                                        |
| ------------- | ----------- | ---------------------------------------------------------------------------- |
| `name`      | `string`  | 2–150 characters                                                            |
| `email`     | `string`  | Valid email, must be unique                                                  |
| `password`  | `string`  | 8–72 chars, must contain uppercase, lowercase, digit, and special character |
| `role`      | `string`  | `"admin"` \| `"editor"` \| `"viewer"` · **admin only**          |
| `is_active` | `boolean` | `true` to activate, `false` to deactivate                                |

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Smith",
    "email": "janesmith@example.com",
    "role": "editor",
    "is_active": 1,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2026-04-26T14:30:00.000Z"
  },
  "message": "User updated successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                                        |
| ---- | -------------------- | ------------------------------------------- |
| 400  | `BAD_REQUEST`      | Non-admin trying to change own `role`     |
| 401  | `UNAUTHORIZED`     | Not authenticated                           |
| 403  | `FORBIDDEN`        | Authenticated but not admin or not self     |
| 404  | `NOT_FOUND`        | `"User not found."`                       |
| 409  | `CONFLICT`         | `"This email address is already in use."` |
| 422  | `VALIDATION_ERROR` | Body or `:uuid` param fails schema        |

---

### `DELETE /api/v1/users/:uuid`

Soft-deletes a user (sets `deleted_at`; record is retained in DB). The user will no longer appear in listings or be able to log in.

**Auth required:** Yes — **admin only**
**Restriction:** Admins cannot delete their own account.

**Path parameter:**

| Param    | Type       | Rules         |
| -------- | ---------- | ------------- |
| `uuid` | `string` | Valid UUID v4 |

**Example request:**

```
DELETE /api/v1/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Success `200`:**

```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully."
}
```

**Possible errors:**

| HTTP | `code`             | When                                      |
| ---- | -------------------- | ----------------------------------------- |
| 400  | `BAD_REQUEST`      | `"You cannot delete your own account."` |
| 401  | `UNAUTHORIZED`     | Not authenticated                         |
| 403  | `FORBIDDEN`        | Authenticated but not admin               |
| 404  | `NOT_FOUND`        | `"User not found."`                     |
| 422  | `VALIDATION_ERROR` | `:uuid` is not a valid UUID format      |

---

## Authentication Flow (summary for admin UI)

```
1. POST /api/v1/auth/login  →  receive { token, user }
2. Store token (memory / httpOnly cookie)
3. Add header to every subsequent request:
     Authorization: Bearer <token>
4. On 401 response  →  redirect to login
5. POST /api/v1/auth/logout  →  token is revoked server-side, clear local storage
```

**Token expiry strategy:**

- Default TTL is `15m`. Plan to handle `401 UNAUTHORIZED` by prompting re-login or implementing a refresh mechanism if one is added in the future.
- After logout, the token is blocklisted immediately; do not reuse it.

---

## Environment Variables

| Variable                | Default         | Description                                            |
| ----------------------- | --------------- | ------------------------------------------------------ |
| `PORT`                | `3000`        | HTTP port the server listens on                        |
| `HOST`                | `0.0.0.0`     | Bind address                                           |
| `API_PREFIX`          | `/api/v1`     | URL prefix for all routes                              |
| `JWT_SECRET`          | —              | HS256 signing secret (min 32 chars,**required**) |
| `JWT_EXPIRES_IN`      | `15m`         | Token lifetime (e.g.`15m`, `1h`, `7d`)           |
| `BCRYPT_ROUNDS`       | `12`          | bcrypt cost factor (10–15)                            |
| `DB_HOST`             | —              | MariaDB host (**required**)                      |
| `DB_PORT`             | `3306`        | MariaDB port                                           |
| `DB_NAME`             | —              | Database name (**required**)                     |
| `DB_USER`             | —              | Database user (**required**)                     |
| `DB_PASSWORD`         | —              | Database password                                      |
| `DB_CONNECTION_LIMIT` | `10`          | Connection pool size                                   |
| `NODE_ENV`            | `development` | `development` \| `production` \| `test`          |

---

## Endpoint Summary Table

| Method     | Path                    | Auth | Role         | Description                |
| ---------- | ----------------------- | ---- | ------------ | -------------------------- |
| `POST`   | `/api/v1/auth/login`  | No   | —           | Login, get JWT             |
| `POST`   | `/api/v1/auth/logout` | Yes  | any          | Revoke current token       |
| `GET`    | `/api/v1/auth/me`     | Yes  | any          | Get own profile            |
| `GET`    | `/api/v1/users`       | Yes  | admin        | List all users (paginated) |
| `POST`   | `/api/v1/users`       | Yes  | admin        | Create a user              |
| `GET`    | `/api/v1/users/:uuid` | Yes  | admin\| self | Get a user by UUID         |
| `PATCH`  | `/api/v1/users/:uuid` | Yes  | admin\| self | Partially update a user    |
| `DELETE` | `/api/v1/users/:uuid` | Yes  | admin        | Soft-delete a user         |
