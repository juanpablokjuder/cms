import type { FastifyInstance } from 'fastify';
import { FaqController } from './faq.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

/**
 * FAQ routes — prefix: /api/v1/faqs
 *
 * ┌───────────────────┬────────┬────────────────────┐
 * │ Endpoint          │ Method │ Roles              │
 * ├───────────────────┼────────┼────────────────────┤
 * │ /faqs             │ GET    │ admin, editor      │
 * │ /faqs             │ POST   │ admin, editor      │
 * │ /faqs/:uuid       │ GET    │ admin, editor      │
 * │ /faqs/:uuid       │ PATCH  │ admin, editor      │
 * │ /faqs/:uuid       │ DELETE │ admin              │
 * └───────────────────┴────────┴────────────────────┘
 */
export async function faqRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new FaqController();

  fastify.get('/',      { preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.list(req, rep));
  fastify.post('/',     { preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.create(req, rep));
  fastify.get('/:uuid', { preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.show(req, rep));
  fastify.patch('/:uuid', { preHandler: [authenticate, requireRole('admin', 'editor')] }, (req, rep) => ctrl.update(req, rep));
  fastify.delete('/:uuid', { preHandler: [authenticate, requireRole('admin')] }, (req, rep) => ctrl.remove(req, rep));
}
