import type { FastifyInstance } from 'fastify';
import { FooterController } from './footer.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

export async function footerRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new FooterController();

  fastify.get('/',       { preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.list(req, rep));
  fastify.post('/',      { preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.create(req, rep));
  fastify.get('/:uuid',  { preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.show(req, rep));
  fastify.patch('/:uuid',{ preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.update(req, rep));
  fastify.delete('/:uuid',{ preHandler: [authenticate, requireRole('admin')]           }, (req, rep) => ctrl.remove(req, rep));
}
