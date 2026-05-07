import type { FastifyInstance } from 'fastify';
import { ProductoController } from './producto.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

/**
 * Rutas de Productos — prefijos:
 *   /api/v1/admin/colores
 *   /api/v1/admin/productos/condiciones
 *   /api/v1/admin/productos/garantias
 *   /api/v1/admin/productos/atributos
 *   /api/v1/admin/productos
 */
export async function productoRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl      = new ProductoController();
  const auth      = [authenticate, requireRole('admin', 'editor')] as const;
  const adminOnly = [authenticate, requireRole('admin')] as const;

  // ── Colores ───────────────────────────────────────────────────────────────
  fastify.get('/colores',           { preHandler: [...auth] },      (req, rep) => ctrl.listColores(req, rep));
  fastify.get('/colores/all',       { preHandler: [...auth] },      (req, rep) => ctrl.listColoresAll(req, rep));
  fastify.post('/colores',          { preHandler: [...auth] },      (req, rep) => ctrl.createColor(req, rep));
  fastify.get('/colores/:uuid',     { preHandler: [...auth] },      (req, rep) => ctrl.showColor(req, rep));
  fastify.patch('/colores/:uuid',   { preHandler: [...auth] },      (req, rep) => ctrl.updateColor(req, rep));
  fastify.delete('/colores/:uuid',  { preHandler: [...adminOnly] }, (req, rep) => ctrl.deleteColor(req, rep));

  // ── Lookups ───────────────────────────────────────────────────────────────
  fastify.get('/productos/condiciones', { preHandler: [...auth] }, (req, rep) => ctrl.listCondiciones(req, rep));
  fastify.get('/productos/garantias',   { preHandler: [...auth] }, (req, rep) => ctrl.listGarantias(req, rep));

  // ── Plantillas de atributos ───────────────────────────────────────────────
  fastify.get('/productos/atributos',           { preHandler: [...auth] },      (req, rep) => ctrl.listAtributos(req, rep));
  fastify.get('/productos/atributos/all',       { preHandler: [...auth] },      (req, rep) => ctrl.listAtributosAll(req, rep));
  fastify.post('/productos/atributos',          { preHandler: [...auth] },      (req, rep) => ctrl.createAtributo(req, rep));
  fastify.get('/productos/atributos/:uuid',     { preHandler: [...auth] },      (req, rep) => ctrl.showAtributo(req, rep));
  fastify.patch('/productos/atributos/:uuid',   { preHandler: [...auth] },      (req, rep) => ctrl.updateAtributo(req, rep));
  fastify.delete('/productos/atributos/:uuid',  { preHandler: [...adminOnly] }, (req, rep) => ctrl.deleteAtributo(req, rep));

  // ── Productos ─────────────────────────────────────────────────────────────
  fastify.get('/productos',           { preHandler: [...auth] },      (req, rep) => ctrl.listProductos(req, rep));
  fastify.post('/productos',          { preHandler: [...auth] },      (req, rep) => ctrl.createProducto(req, rep));
  fastify.get('/productos/:uuid',     { preHandler: [...auth] },      (req, rep) => ctrl.showProducto(req, rep));
  fastify.patch('/productos/:uuid',   { preHandler: [...auth] },      (req, rep) => ctrl.updateProducto(req, rep));
  fastify.delete('/productos/:uuid',  { preHandler: [...adminOnly] }, (req, rep) => ctrl.deleteProducto(req, rep));
}
