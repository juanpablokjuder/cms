import type { FastifyInstance } from 'fastify';
import { LocalController } from './local.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

/**
 * Rutas del módulo Locales — prefix: /api/v1/locales
 *
 * ┌─────────────────────┬────────┬───────────────────────┐
 * │ Endpoint            │ Method │ Roles                 │
 * ├─────────────────────┼────────┼───────────────────────┤
 * │ /locales            │ GET    │ admin, editor         │
 * │ /locales            │ POST   │ admin, editor         │
 * │ /locales/:uuid      │ GET    │ admin, editor         │
 * │ /locales/:uuid      │ PATCH  │ admin, editor         │
 * │ /locales/:uuid      │ DELETE │ admin                 │
 * └─────────────────────┴────────┴───────────────────────┘
 */
export async function localRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new LocalController();

  fastify.get(
    '/',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.list(req, rep),
  );

  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.create(req, rep),
  );

  fastify.get(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.show(req, rep),
  );

  fastify.patch(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.update(req, rep),
  );

  fastify.delete(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.remove(req, rep),
  );
}
