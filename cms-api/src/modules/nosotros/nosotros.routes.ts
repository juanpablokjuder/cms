import type { FastifyInstance } from 'fastify';
import { NosotrosController } from './nosotros.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

/**
 * Nosotros routes — prefix: /api/v1/nosotros
 *
 * ┌──────────────┬────────┬───────────────────────┐
 * │ Endpoint     │ Method │ Roles                 │
 * ├──────────────┼────────┼───────────────────────┤
 * │ /nosotros    │ GET    │ admin, editor         │
 * │ /nosotros    │ POST   │ admin, editor         │
 * │ /nosotros    │ PATCH  │ admin, editor         │
 * └──────────────┴────────┴───────────────────────┘
 */
export async function nosotrosRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new NosotrosController();

  fastify.get(
    '/',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.show(req, rep),
  );

  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.create(req, rep),
  );

  fastify.patch(
    '/',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.update(req, rep),
  );
}
