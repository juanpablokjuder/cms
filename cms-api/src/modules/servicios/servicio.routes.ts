import type { FastifyInstance } from 'fastify';
import { ServicioController } from './servicio.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

/**
 * Servicios routes — prefijos:
 *   /api/v1/admin/servicios
 *   /api/v1/admin/servicios/categorias
 *   /api/v1/admin/servicios/items
 *   /api/v1/admin/monedas
 */
export async function servicioRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new ServicioController();
  const auth = [authenticate, requireRole('admin', 'editor')] as const;
  const adminOnly = [authenticate, requireRole('admin')] as const;

  // ── Monedas ────────────────────────────────────────────────────────────────
  fastify.get('/monedas', { preHandler: [...auth] }, (req, rep) => ctrl.listMonedas(req, rep));

  // ── Servicios (singleton) ─────────────────────────────────────────────────
  fastify.get('/servicios',       { preHandler: [...auth] }, (req, rep) => ctrl.getServicio(req, rep));
  fastify.post('/servicios',      { preHandler: [...auth] }, (req, rep) => ctrl.createServicio(req, rep));
  fastify.patch('/servicios/:uuid', { preHandler: [...auth] }, (req, rep) => ctrl.updateServicio(req, rep));

  // ── Categorías ────────────────────────────────────────────────────────────
  fastify.get('/servicios/categorias',       { preHandler: [...auth] },      (req, rep) => ctrl.listCategorias(req, rep));
  fastify.post('/servicios/categorias',      { preHandler: [...auth] },      (req, rep) => ctrl.createCategoria(req, rep));
  fastify.get('/servicios/categorias/:uuid', { preHandler: [...auth] },      (req, rep) => ctrl.showCategoria(req, rep));
  fastify.patch('/servicios/categorias/:uuid', { preHandler: [...auth] },    (req, rep) => ctrl.updateCategoria(req, rep));
  fastify.delete('/servicios/categorias/:uuid', { preHandler: [...adminOnly] }, (req, rep) => ctrl.deleteCategoria(req, rep));

  // ── Items ─────────────────────────────────────────────────────────────────
  fastify.get('/servicios/items',       { preHandler: [...auth] },      (req, rep) => ctrl.listItems(req, rep));
  fastify.post('/servicios/items',      { preHandler: [...auth] },      (req, rep) => ctrl.createItem(req, rep));
  fastify.get('/servicios/items/:uuid', { preHandler: [...auth] },      (req, rep) => ctrl.showItem(req, rep));
  fastify.patch('/servicios/items/:uuid', { preHandler: [...auth] },    (req, rep) => ctrl.updateItem(req, rep));
  fastify.delete('/servicios/items/:uuid', { preHandler: [...adminOnly] }, (req, rep) => ctrl.deleteItem(req, rep));
}
