import type { FastifyInstance } from 'fastify';
import { BannerController } from './banner.controller.js';
import {
  authenticate,
  requireRole,
} from '../../shared/middlewares/auth.middleware.js';

/**
 * Banner routes — registered under the prefix defined in app.ts
 * (default: /api/v1/banners)
 *
 * ┌─────────────────────────────────┬────────────┬───────────────────────────┐
 * │ Endpoint                        │ Method     │ Allowed roles             │
 * ├─────────────────────────────────┼────────────┼───────────────────────────┤
 * │ /api/v1/banners                 │ GET        │ admin                     │
 * │ /api/v1/banners                 │ POST       │ admin                     │
 * │ /api/v1/banners/:uuid           │ GET        │ admin                     │
 * │ /api/v1/banners/:uuid           │ PATCH      │ admin                     │
 * │ /api/v1/banners/:uuid           │ DELETE     │ admin                     │
 * └─────────────────────────────────┴────────────┴───────────────────────────┘
 */
export async function bannerRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new BannerController();

  // ── List all banners ──────────────────────────────────────────────────────
  fastify.get(
    '/',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.list(req, rep),
  );

  // ── Create a banner ───────────────────────────────────────────────────────
  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.create(req, rep),
  );

  // ── Get a single banner ───────────────────────────────────────────────────
  fastify.get(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.show(req, rep),
  );

  // ── Update a banner ───────────────────────────────────────────────────────
  fastify.patch(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.update(req, rep),
  );

  // ── Delete a banner ───────────────────────────────────────────────────────
  fastify.delete(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.remove(req, rep),
  );
}
