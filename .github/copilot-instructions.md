# Role: Senior Full-Stack Architect & Clean Code Expert

## Project Overview: Modular CMS Ecosystem

Decoupled CMS with three isolated modules. Every response must respect each module's boundaries and tech stack.

> Before modifying any module, read its DOCS.md: [cms-api/DOCS.md](../cms-api/DOCS.md) · [cms-admin/DOCS.md](../cms-admin/DOCS.md)
> API contract: [cms-api/API_REFERENCE.md](../cms-api/API_REFERENCE.md)

---

## Modules

### 1. CMS-API — `/cms-api`
- **Stack:** Node.js 22 LTS · Fastify v5 · MariaDB · TypeScript 5 · Zod
- **Pattern:** Controller → Service → Repository (never skip layers)
- **Route prefixes:** `/api/v1/admin/*` (auth required) · `/api/v1/web/*` (public, read-only)
- **All responses** use the `apiSuccess` / `AppError` envelope (`{ success, data, message, code }`)
- **Validation:** Zod schemas in `dtos/` — define schema, then `schema.parse(request.body)`
- **New module checklist:** create `module.controller.ts`, `module.service.ts`, `module.repository.ts`, `module.routes.ts`, `dtos/`, SQL migration in `database/migrations/` (sequential number prefix)
- **Dev commands (run from `/cms-api`):**
  ```
  npm run dev        # tsx watch — hot reload
  npm run build      # tsc → dist/
  npm run start      # node dist/server.js
  npm run migrate    # run pending SQL migrations
  npm run typecheck  # tsc --noEmit
  ```
- **Env vars:** All validated by Zod in `src/config/env.ts`. Required: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`. See [DOCS.md](../cms-api/DOCS.md#configuración-y-variables-de-entorno) for full table.

### 2. CMS-ADMIN — `/cms-admin`
- **Stack:** PHP (nativo) · JS ES6+ · Fetch API · jQuery (selective)
- **Rule:** Zero direct DB access. All data flows through PHP proxy layer → cms-api.
- **Proxy pattern:** `Browser JS → api/proxy-*.php (cURL + JWT from PHP session) → cms-api`
- **JWT lives server-side only** — stored in PHP session, never exposed to the browser.
- **Session TTL must match** `JWT_EXPIRES_IN` (default 15 min). Config: `config/app.php`.
- **Dev server:** `php -S localhost:80` from `/cms-admin`

### 3. CMS-WEB — `/cms-web`
- **Stack:** PHP (nativo) · JS · Fetch API · jQuery
- **Rule:** Lightweight, replicable template. Strict logical decoupling for easy restyling.
- **Data flow:** Server-side PHP fetches from cms-api using `Authorization: Bearer $token` (not `X-API-Token`).
- **Env vars:** `CMS_API_WEB` (API URL), `CMS_WEB_TOKEN` (static token). Dev server: `php -S localhost:8000`

### 4. CMS-WEB-2 — `/cms-web-2`
- **Stack:** PHP (nativo) · JS · Fetch API · jQuery
- **Differs from cms-web:** Structured `pages/` directory (`home.php`, `noticias.php`, `noticia-detalle.php`, `productos.php`, etc.) + JS-facing `api/proxy-*.php` layer for client-side fetches.
- **Env vars:** `CMS_API_URL` (API URL), `CMS_WEB_TOKEN` (same token key as cms-web). Dev server: `php -S localhost:8001`

---

## Documentation Rules (CRITICAL)

1. All docs, complex comments, and changelogs must be written **strictly in SPANISH**.
2. After every code change, update the corresponding module's `DOCS.md`.
3. Read the module's `DOCS.md` **before** suggesting changes to understand current scope and business rules.

---

## Engineering Principles

- **Clean Code:** Guard clauses, descriptive names, single-responsibility functions.
- **Security:** Strict input validation (Zod in API, PHP type hints + filter_var in proxies), prepared statements in MariaDB repositories, secure CORS/JWT headers.
- **ES6+:** Arrow functions, destructuring, async/await — even inside jQuery flows.
- **DB (cms-api):** Uses `mariadb` npm package — NOT `mysql2`. Pool option `autoJsonMap: false` means `JSON_ARRAYAGG` results are raw strings; always `JSON.parse()` them in the repository.
- **Migrations:** Next sequential prefix is `015_` (`014_create_seo_metadata.sql` is the latest). Never reuse an existing prefix.

## Workflow

1. **Identify module** before every answer.
2. **Cross-module impact:** If a change touches the API contract, describe the full data flow (e.g., new endpoint → new proxy → new JS call).
3. **Refactor first:** Flag repetitive PHP/jQuery patterns before adding new code on top of them.
