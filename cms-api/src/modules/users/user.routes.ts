import type { FastifyInstance } from 'fastify';
import { UserController } from './user.controller.js';
import {
  authenticate,
  requireRole,
  selfOrAdmin,
} from '../../shared/middlewares/auth.middleware.js';

/**
 * User routes — registered under the prefix defined in app.ts
 * (default: /api/v1/users)
 *
 * ┌─────────────────────────────────┬────────────┬───────────────────────────┐
 * │ Endpoint                        │ Method     │ Allowed roles             │
 * ├─────────────────────────────────┼────────────┼───────────────────────────┤
 * │ /api/v1/users                   │ GET        │ admin                     │
 * │ /api/v1/users                   │ POST       │ admin                     │
 * │ /api/v1/users/:uuid             │ GET        │ admin | self              │
 * │ /api/v1/users/:uuid             │ PATCH      │ admin | self              │
 * │ /api/v1/users/:uuid             │ DELETE     │ admin                     │
 * └─────────────────────────────────┴────────────┴───────────────────────────┘
 */
export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new UserController();

  // ── List all users ────────────────────────────────────────────────────────
  fastify.get(
    '/',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.list(req, rep),
  );

  // ── Create a user ─────────────────────────────────────────────────────────
  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.create(req, rep),
  );

  // ── Get a single user ─────────────────────────────────────────────────────
  fastify.get(
    '/:uuid',
    { preHandler: [authenticate, selfOrAdmin('uuid')] },
    (req, rep) => ctrl.show(req, rep),
  );

  // ── Update a user ─────────────────────────────────────────────────────────
  fastify.patch(
    '/:uuid',
    { preHandler: [authenticate, selfOrAdmin('uuid')] },
    (req, rep) => ctrl.update(req, rep),
  );

  // ── Delete a user (soft) ──────────────────────────────────────────────────
  fastify.delete(
    '/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.remove(req, rep),
  );
}
