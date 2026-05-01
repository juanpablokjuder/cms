import type { FastifyInstance } from 'fastify';
import { NoticiaController } from './noticia.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

/**
 * Noticia routes — prefix: /api/v1/noticias
 *
 * ┌────────────────────────┬────────┬───────────────────────┐
 * │ Endpoint               │ Method │ Roles                 │
 * ├────────────────────────┼────────┼───────────────────────┤
 * │ /noticias              │ GET    │ admin, editor         │
 * │ /noticias              │ POST   │ admin, editor         │
 * │ /noticias/:uuid        │ GET    │ admin, editor         │
 * │ /noticias/:uuid        │ PATCH  │ admin, editor         │
 * │ /noticias/:uuid        │ DELETE │ admin                 │
 * └────────────────────────┴────────┴───────────────────────┘
 */
export async function noticiaRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new NoticiaController();

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
