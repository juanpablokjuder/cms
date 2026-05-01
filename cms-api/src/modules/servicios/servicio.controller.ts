import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ServicioService } from './servicio.service.js';
import { createServicioSchema } from './dtos/create-servicio.dto.js';
import { updateServicioSchema } from './dtos/update-servicio.dto.js';
import { createCategoriaSchema } from './dtos/create-categoria.dto.js';
import { updateCategoriaSchema } from './dtos/update-categoria.dto.js';
import { createItemSchema } from './dtos/create-item.dto.js';
import { updateItemSchema } from './dtos/update-item.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

const paginationSchema = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

export class ServicioController {
  private readonly service: ServicioService;

  constructor() {
    this.service = new ServicioService();
  }

  // ── Monedas ────────────────────────────────────────────────────────────────

  /** GET /monedas */
  async listMonedas(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const monedas = await this.service.listMonedas();
    void reply.code(200).send(apiSuccess(monedas));
  }

  // ── Servicios (singleton) ─────────────────────────────────────────────────

  /** GET /servicios */
  async getServicio(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const servicio = await this.service.getServicio();
    void reply.code(200).send(apiSuccess(servicio));
  }

  /** POST /servicios */
  async createServicio(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto      = createServicioSchema.parse(request.body);
    const servicio = await this.service.createServicio(dto);
    void reply.code(201).send(apiSuccess(servicio, 'Servicios creado exitosamente.'));
  }

  /** PATCH /servicios/:uuid */
  async updateServicio(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto      = updateServicioSchema.parse(request.body);
    const servicio = await this.service.updateServicio(uuid, dto);
    void reply.code(200).send(apiSuccess(servicio, 'Servicios actualizado exitosamente.'));
  }

  // ── Categorías ────────────────────────────────────────────────────────────

  /** GET /servicios/categorias */
  async listCategorias(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(request.query);
    const result = await this.service.listCategorias({ page, limit });
    void reply.code(200).send(apiSuccess(result));
  }

  /** GET /servicios/categorias/:uuid */
  async showCategoria(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const cat      = await this.service.findCategoria(uuid);
    void reply.code(200).send(apiSuccess(cat));
  }

  /** POST /servicios/categorias */
  async createCategoria(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = createCategoriaSchema.parse(request.body);
    const cat = await this.service.createCategoria(dto);
    void reply.code(201).send(apiSuccess(cat, 'Categoría creada exitosamente.'));
  }

  /** PATCH /servicios/categorias/:uuid */
  async updateCategoria(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto      = updateCategoriaSchema.parse(request.body);
    const cat      = await this.service.updateCategoria(uuid, dto);
    void reply.code(200).send(apiSuccess(cat, 'Categoría actualizada exitosamente.'));
  }

  /** DELETE /servicios/categorias/:uuid */
  async deleteCategoria(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.deleteCategoria(uuid);
    void reply.code(200).send(apiSuccess(null, 'Categoría eliminada exitosamente.'));
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  /** GET /servicios/items */
  async listItems(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(request.query);
    const result = await this.service.listItems({ page, limit });
    void reply.code(200).send(apiSuccess(result));
  }

  /** GET /servicios/items/:uuid */
  async showItem(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const item     = await this.service.findItem(uuid);
    void reply.code(200).send(apiSuccess(item));
  }

  /** POST /servicios/items */
  async createItem(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto  = createItemSchema.parse(request.body);
    const item = await this.service.createItem(dto);
    void reply.code(201).send(apiSuccess(item, 'Item creado exitosamente.'));
  }

  /** PATCH /servicios/items/:uuid */
  async updateItem(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto      = updateItemSchema.parse(request.body);
    const item     = await this.service.updateItem(uuid, dto);
    void reply.code(200).send(apiSuccess(item, 'Item actualizado exitosamente.'));
  }

  /** DELETE /servicios/items/:uuid */
  async deleteItem(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.deleteItem(uuid);
    void reply.code(200).send(apiSuccess(null, 'Item eliminado exitosamente.'));
  }
}
