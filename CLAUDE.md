# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Role: Senior Full-Stack Architect & Clean Code Expert

## Project Overview: Modular CMS Ecosystem

Decoupled CMS with three isolated modules. Every response must respect each module's boundaries and tech stack.

> **Critical:** Before modifying any module, read its DOCS.md: [cms-api/DOCS.md](cms-api/DOCS.md) · [cms-admin/DOCS.md](cms-admin/DOCS.md)
> **API contract:** [cms-api/API_REFERENCE.md](cms-api/API_REFERENCE.md)

---

## Quick Start

### Installation & Setup (First Time)
1. **CMS-API:** `cd cms-api && npm install`
2. **CMS-ADMIN:** No npm install needed (native PHP + jQuery)
3. **CMS-WEB:** No npm install needed (native PHP + jQuery)
4. **Environment:** Copy `.env.example` to `.env` in `cms-api` and fill database credentials + JWT secrets
5. **Database:** `cd cms-api && npm run migrate` (runs SQL migrations in order)

### Development
- **CMS-API:** `cd cms-api && npm run dev` (tsx watch on port 3000)
- **CMS-ADMIN:** `cd cms-admin && php -S localhost:80` (dev PHP server on port 80)
- **CMS-WEB:** `cd cms-web && php -S localhost:8000` (dev PHP server on port 8000)

### Type Checking & Build
- **Type check:** `cd cms-api && npm run typecheck`
- **Build:** `cd cms-api && npm run build` (outputs to `dist/`)
- **Start production:** `cd cms-api && npm run start`

---

## Modules

### 1. CMS-API — `/cms-api`
- **Stack:** Node.js 22 LTS · Fastify v5 · MariaDB · TypeScript 5 · Zod
- **Pattern:** Controller → Service → Repository (never skip layers)
- **Route prefixes:** 
  - `/api/v1/admin/*` (auth required, protected by JWT)
  - `/api/v1/web/*` (public, read-only, requires `WEB_API_TOKEN` header)
- **All responses** use the `apiSuccess` / `AppError` envelope (`{ success, data, message, code }`)
- **Validation:** Zod schemas in `dtos/` — define schema, then `schema.parse(request.body)`
- **New module checklist:** 
  1. Create `modules/module-name/` directory
  2. Add `module-name.controller.ts`, `module-name.service.ts`, `module-name.repository.ts`, `module-name.routes.ts`
  3. Create `module-name/dtos/` for request/response validation schemas
  4. Add SQL migration in `database/migrations/` with sequential prefix (e.g., `004_create_table.sql`)
  5. Register routes in `app.ts`
- **Dev commands (run from `/cms-api`):**
  ```
  npm run dev        # tsx watch — hot reload
  npm run build      # tsc → dist/
  npm run start      # node dist/server.js
  npm run migrate    # run pending SQL migrations
  npm run typecheck  # tsc --noEmit
  ```
- **Environment variables:** All validated by Zod in `src/config/env.ts`
  - Required: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (≥32 chars)
  - Admin auth: `JWT_EXPIRES_IN` (default `15m`)
  - Web API token: `WEB_API_TOKEN` (generate with `openssl rand -hex 32`)
  - See [DOCS.md](cms-api/DOCS.md#configuración-y-variables-de-entorno) for all options

### 2. CMS-ADMIN — `/cms-admin`
- **Stack:** PHP 8.x (native) · JavaScript ES6+ · Fetch API · jQuery (selective)
- **Architecture:** Zero direct DB access. All data flows: `Browser → Proxy layer (PHP) → cms-api`
- **Proxy pattern:** `Fetch JS → api/proxy-*.php (cURL) → cms-api` with JWT from PHP session
- **Security:** JWT stored in PHP `$_SESSION` (server-side only), never exposed to browser
- **Session sync:** `SESSION_TTL` in `config/app.php` must match API's `JWT_EXPIRES_IN` (default 15m)
- **File structure:**
  - Root: main pages (users.php, banners.php, productos.php, etc.)
  - `api/proxy-*.php`: REST proxies that forward to cms-api with JWT auth
  - `includes/`: reusable templates, helpers, navigation
  - `assets/`: CSS, JS, images
- **Dev server:** `cd cms-admin && php -S localhost:80`
- **Key files:** `config/app.php` (session TTL, API URL), `includes/auth.php` (session/JWT logic)

### 3. CMS-WEB — `/cms-web`
- **Stack:** PHP 8.x (native) · JavaScript · Fetch API · jQuery
- **Purpose:** Lightweight, public-facing template. Content fed exclusively from cms-api `/api/v1/web/*`
- **Architecture:** Stateless frontend — no sessions, only static token auth via `WEB_API_TOKEN`
- **Data flow:** Frontend JS → cms-api with `X-API-Token` header (contains `WEB_API_TOKEN`)
- **Use case:** Display content (noticias, banners, servicios, faqs, footer, nosotros, productos)
- **Dev server:** `cd cms-web && php -S localhost:8000`
- **Key files:** `.env` with `WEB_API_URL` and token, `index.php` (router), `lib/api.php` (fetch wrapper)

---

## Monorepo Structure

This is a **polyglot monorepo** with independent modules:
- Each module has its own `package.json` (or no dependencies like PHP modules)
- No root-level package.json — modules work in isolation
- Modules communicate only via HTTP API (cms-api is the source of truth)
- Each module must be deployed/run independently

---

## Documentation Rules (CRITICAL)

1. **Language:** All docs, complex comments, and changelogs must be written **strictly in SPANISH**.
2. **Keep docs in sync:** After every code change, update the corresponding module's `DOCS.md`.
3. **Read first:** Always read the module's `DOCS.md` **before** suggesting changes to understand current scope, business rules, and recent updates.
4. **API changes:** If adding/modifying API endpoints, update [cms-api/API_REFERENCE.md](cms-api/API_REFERENCE.md) **and** [cms-api/WEB_API_DOCS.md](cms-api/WEB_API_DOCS.md) (for public endpoints).
5. **Database changes:** Every SQL modification must have a corresponding migration file in `cms-api/src/database/migrations/` with sequential numbering.

---

## Engineering Principles

- **Clean Code:** Guard clauses, descriptive names, single-responsibility functions. Avoid premature abstraction.
- **Security:** 
  - Zod validation for API requests
  - PHP type hints + `filter_var` in proxy layer
  - Prepared statements (parameterized queries) for MariaDB
  - JWT secrets ≥32 chars, secure CORS/CSRF headers
  - Never expose JWT to browser in cms-admin
- **TypeScript:** Use strict mode, type all function params and returns
- **Async:** `async/await` in API, Promises in frontend JS — avoid callback hell

---

## Workflow

1. **Identify module** before every response (API, admin panel, or web frontend?).
2. **Cross-module impact:** If a change touches the API contract, describe the full data flow (request path + response shape).
   - Example: "New admin endpoint → new proxy in cms-admin → new JS form → cms-api GET/POST"
3. **Refactor first:** Before adding new code, flag repetitive patterns (especially in PHP/jQuery) for cleanup.
4. **Test locally:**
   - API: Use curl or Postman with `Authorization: Bearer <jwt>`
   - Admin: Login → use browser DevTools to verify proxy calls
   - Web: Check console for API token errors or malformed responses

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "JWT expired" in admin panel | Session TTL mismatch | Update `SESSION_TTL` in `cms-admin/config/app.php` to match API's `JWT_EXPIRES_IN` |
| API returns 401 on `/api/v1/admin/*` | Missing/invalid JWT in Authorization header | Check PHP session is set, proxy includes `Authorization: Bearer $jwt` header |
| Web frontend shows 403 | Wrong/missing `WEB_API_TOKEN` | Verify `.env` has correct `WEB_API_TOKEN` and `X-API-Token` header is sent in fetch |
| Database connection fails | `.env` not set or wrong credentials | Copy `.env.example` to `.env`, fill real DB host/user/password, restart `npm run dev` |
| Types not checking | Build passes but IDE shows errors | Run `npm run typecheck` to match CI behavior, may need to restart IDE TS server |
