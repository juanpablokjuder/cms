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
- **Errores:** Lanzar `AppError` del shared utils — nunca `throw new Error()`
- **Respuestas:** Usar `apiSuccess(data, message?)` — nunca construir el envelope manualmente
- **DB:** Solo prepared statements en el repository. Nunca SQL dinámico con interpolación de strings
- **Identificadores públicos:** Siempre UUID v4 — nunca exponer el `id` numérico interno
- **Imports:** Siempre con extensión `.js` (TypeScript ESM)

## Rutas
- Admin (auth requerida): registrar bajo `app.register(routeFn, { prefix: \`${env.API_PREFIX}/admin\` })`
- Web (pública): registrar bajo `app.register(routeFn, { prefix: \`${env.API_PREFIX}/web\` })`
- Middleware de autenticación: `app.addHook('onRequest', app.authenticate)` dentro del plugin de ruta
