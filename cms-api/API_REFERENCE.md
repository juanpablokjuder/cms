# CMS API — Reference Documentation

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
