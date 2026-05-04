import type { FastifyInstance } from 'fastify';
import { EmpresaController } from './empresa.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

/**
 * Empresa routes — prefix: /api/v1/empresa
 *
 * ┌──────────────────────┬────────┬────────────────────┐
 * │ Endpoint             │ Method │ Roles              │
 * ├──────────────────────┼────────┼────────────────────┤
 * │ /empresa             │ GET    │ admin, editor      │
 * │ /empresa             │ POST   │ admin              │
 * │ /empresa/:uuid       │ PATCH  │ admin, editor      │
 * │ /empresa/:uuid       │ DELETE │ admin              │
 * └──────────────────────┴────────┴────────────────────┘
 */
export async function empresaRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new EmpresaController();

  fastify.get('/',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.get(req, rep),
  );

  fastify.post('/',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.create(req, rep),
  );

  fastify.patch('/:uuid',
    { preHandler: [authenticate, requireRole('admin', 'editor')] },
    (req, rep) => ctrl.update(req, rep),
  );

  fastify.delete('/:uuid',
    { preHandler: [authenticate, requireRole('admin')] },
    (req, rep) => ctrl.remove(req, rep),
  );
}
