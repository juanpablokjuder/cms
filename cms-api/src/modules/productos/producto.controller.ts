import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ProductoService } from './producto.service.js';
import { createColorSchema } from './dtos/create-color.dto.js';
import { updateColorSchema } from './dtos/update-color.dto.js';
import { createAtributoPlantillaSchema } from './dtos/create-atributo-plantilla.dto.js';
import { updateAtributoPlantillaSchema } from './dtos/update-atributo-plantilla.dto.js';
import { createProductoSchema } from './dtos/create-producto.dto.js';
import { updateProductoSchema } from './dtos/update-producto.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

const paginationSchema = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const uuidParamSchema = z.object({
  uuid: z.string().uuid('UUID inválido.'),
});

export class ProductoController {
  private readonly service: ProductoService;

  constructor() {
    this.service = new ProductoService();
  }

  // ── Colores ──────────────────────────────────────────────────────────────

  async listColores(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await this.service.listColores({ page, limit });
    void rep.code(200).send(apiSuccess(result));
  }

  async listColoresAll(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const result = await this.service.listColoresAll();
    void rep.code(200).send(apiSuccess(result));
  }

  async showColor(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const color = await this.service.findColor(uuid);
    void rep.code(200).send(apiSuccess(color));
  }

  async createColor(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const dto = createColorSchema.parse(req.body);
    const color = await this.service.createColor(dto);
    void rep.code(201).send(apiSuccess(color, 'Color creado exitosamente.'));
  }

  async updateColor(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const dto = updateColorSchema.parse(req.body);
    const color = await this.service.updateColor(uuid, dto);
    void rep.code(200).send(apiSuccess(color, 'Color actualizado exitosamente.'));
  }

  async deleteColor(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    await this.service.deleteColor(uuid);
    void rep.code(200).send(apiSuccess(null, 'Color eliminado exitosamente.'));
  }

  // ── Lookups ──────────────────────────────────────────────────────────────

  async listCondiciones(_req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const result = await this.service.listCondiciones();
    void rep.code(200).send(apiSuccess(result));
  }

  async listGarantias(_req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const result = await this.service.listGarantias();
    void rep.code(200).send(apiSuccess(result));
  }

  // ── Plantillas de atributos ───────────────────────────────────────────────

  async listAtributos(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await this.service.listAtributos({ page, limit });
    void rep.code(200).send(apiSuccess(result));
  }

  async listAtributosAll(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const result = await this.service.listAtributosAll();
    void rep.code(200).send(apiSuccess(result));
  }

  async showAtributo(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const at = await this.service.findAtributo(uuid);
    void rep.code(200).send(apiSuccess(at));
  }

  async createAtributo(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const dto = createAtributoPlantillaSchema.parse(req.body);
    const at = await this.service.createAtributo(dto);
    void rep.code(201).send(apiSuccess(at, 'Plantilla de atributos creada exitosamente.'));
  }

  async updateAtributo(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const dto = updateAtributoPlantillaSchema.parse(req.body);
    const at = await this.service.updateAtributo(uuid, dto);
    void rep.code(200).send(apiSuccess(at, 'Plantilla de atributos actualizada exitosamente.'));
  }

  async deleteAtributo(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    await this.service.deleteAtributo(uuid);
    void rep.code(200).send(apiSuccess(null, 'Plantilla de atributos eliminada exitosamente.'));
  }

  // ── Productos ────────────────────────────────────────────────────────────

  async listProductos(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await this.service.listProductos({ page, limit });
    void rep.code(200).send(apiSuccess(result));
  }

  async showProducto(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const prod = await this.service.findProducto(uuid);
    void rep.code(200).send(apiSuccess(prod));
  }

  async createProducto(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const dto = createProductoSchema.parse(req.body);
    const prod = await this.service.createProducto(dto, req.user.sub);
    void rep.code(201).send(apiSuccess(prod, 'Producto creado exitosamente.'));
  }

  async updateProducto(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const dto = updateProductoSchema.parse(req.body);
    const prod = await this.service.updateProducto(uuid, dto, req.user.sub);
    void rep.code(200).send(apiSuccess(prod, 'Producto actualizado exitosamente.'));
  }

  async deleteProducto(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    await this.service.deleteProducto(uuid);
    void rep.code(200).send(apiSuccess(null, 'Producto eliminado exitosamente.'));
  }
}
