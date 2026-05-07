import type { FastifyInstance } from 'fastify';
import { SeoController } from './seo.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';

/**
 * Rutas SEO — prefijo: /api/v1/admin/seo
 *   GET  /:entity_type/:entity_uuid → obtener SEO de una entidad
 *   POST /:entity_type/:entity_uuid → upsert SEO de una entidad
 */
export async function seoRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new SeoController();
  const auth = [authenticate] as const;

  fastify.get('/:entity_type/:entity_uuid',  { preHandler: [...auth] }, (req, rep) => ctrl.getByEntity(req, rep));
  fastify.post('/:entity_type/:entity_uuid', { preHandler: [...auth] }, (req, rep) => ctrl.upsertByEntity(req, rep));
}
