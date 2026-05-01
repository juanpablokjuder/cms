import type { FastifyInstance } from 'fastify';
import { ErrorLogController } from './error-log.controller.js';
import {
  authenticate,
  requireRole,
} from '../../shared/middlewares/auth.middleware.js';

/**
 * Rutas del módulo error-logs — registradas bajo /api/v1/error-logs
 *
 * ┌──────────────────────────────┬────────┬────────────────────────────────┐
 * │ Endpoint                     │ Method │ Auth                           │
 * ├──────────────────────────────┼────────┼────────────────────────────────┤
 * │ /error-logs                  │ GET    │ admin                          │
 * │ /error-logs/:uuid            │ GET    │ admin                          │
 * │ /error-logs/purge            │ DELETE │ admin                          │
 * └──────────────────────────────┴────────┴────────────────────────────────┘
 *
 * Todos los endpoints requieren autenticación con rol 'admin'.
 * Los logs nunca deben ser accesibles públicamente.
 */
export async function errorLogRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new ErrorLogController();

  const adminGuard = { preHandler: [authenticate, requireRole('admin')] };

  fastify.get(
    '/',
    adminGuard,
    (req, rep) => ctrl.list(req, rep),
  );

  fastify.get(
    '/:uuid',
    adminGuard,
    (req, rep) => ctrl.show(req, rep),
  );

  fastify.delete(
    '/purge',
    adminGuard,
    (req, rep) => ctrl.purge(req, rep),
  );
}
