import type { FastifyInstance } from 'fastify';
import { ArchivoController } from './archivo.controller.js';
import {
  authenticate,
  requireRole,
} from '../../shared/middlewares/auth.middleware.js';

/**
 * Archivo routes — registered under the prefix defined in app.ts
 * (default: /api/v1/archivos)
 *
 * ┌──────────────────────────────────────┬────────┬───────────────────────────┐
 * │ Endpoint                             │ Method │ Auth                      │
 * ├──────────────────────────────────────┼────────┼───────────────────────────┤
 * │ /api/v1/archivos/:slug               │ GET    │ Public (file streaming)   │
 * │ /api/v1/archivos/:uuid/info          │ GET    │ admin                     │
 * │ /api/v1/archivos                     │ POST   │ admin                     │
 * │ /api/v1/archivos/:uuid               │ PATCH  │ admin                     │
 * │ /api/v1/archivos/:uuid               │ DELETE │ admin                     │
 * └──────────────────────────────────────┴────────┴───────────────────────────┘
 */
export async function archivoRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new ArchivoController();

  // ── Public file-serving endpoint ──────────────────────────────────────────
  // NOTE: no auth — files are addressed by opaque slug; not guessable.
  fastify.get('/:slug', (req, rep) => ctrl.serve(req, rep));

  // ── Get archivo metadata ───────────────────────────────────────────────────
  fastify.get(
    '/:uuid/info',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.show(req, rep),
  );

  // ── Upload a new file ─────────────────────────────────────────────────────
  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.create(req, rep),
  );

  // ── Update metadata / replace file ───────────────────────────────────────
  fastify.patch(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.update(req, rep),
  );

  // ── Soft-delete ───────────────────────────────────────────────────────────
  fastify.delete(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.remove(req, rep),
  );
}
