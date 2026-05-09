---
applyTo: "cms-api/src/**"
---

# CMS-API — Instrucciones de Código

## Módulo nuevo (checklist)
1. Crear carpeta `src/modules/<nombre>/` con: `<nombre>.controller.ts`, `<nombre>.service.ts`, `<nombre>.repository.ts`, `<nombre>.routes.ts`, `dtos/`
2. Agregar migración SQL en `src/database/migrations/` con prefijo numérico secuencial
3. Registrar las rutas en `src/app.ts`
4. Actualizar `cms-api/DOCS.md`

## Patrones obligatorios
- **Validación:** Usar Zod en el controller (`schema.parse(request.body/query/params)`), nunca en el service
- **Errores:** Lanzar `AppError` del shared utils — nunca `throw new Error()`. Usar factories: `AppError.notFound('Resource')`, `AppError.badRequest(msg)`, `AppError.conflict(msg)`, `AppError.unauthorized(msg)`, `AppError.forbidden(msg)`
- **Respuestas:** Usar `apiSuccess(data, message?)` — nunca construir el envelope manualmente. En controller: `reply.code(200).send(apiSuccess(result))`; `void` prefix descarta la promesa (idioma Fastify v5)
- **DB:** Solo prepared statements en el repository. Nunca SQL dinámico con interpolación de strings
- **Identificadores públicos:** Siempre UUID v4 — nunca exponer el `id` numérico interno
- **Imports:** Siempre con extensión `.js` (TypeScript ESM)
- **Librería DB:** `mariadb` (npm) — NO usar `mysql2`. Fachada: `db.query<T[]>(sql, params)` / `db.transaction(callback)`
- **`autoJsonMap: false`:** Los resultados de `JSON_ARRAYAGG` llegan como strings crudos — siempre hacer `JSON.parse()` en el repository. Olvidar esto es la trampa más común al agregar JSON en queries nuevas

## Rutas
- Admin (auth requerida): registrar bajo `app.register(routeFn, { prefix: \`${env.API_PREFIX}/admin\` })`
- Web (pública): registrar bajo `app.register(routeFn, { prefix: \`${env.API_PREFIX}/web\` })`
- Middleware de autenticación: `preHandler: [authenticate, requireRole('admin', 'editor')]` (DELETE/acciones admin-only usan solo `'admin'`)

## Migraciones
- Siguiente prefijo: `016_` (`015_create_locales.sql` es el último)
- Nunca reutilizar un prefijo existente (hay colisión histórica en `004_` — no repetir ese error)
