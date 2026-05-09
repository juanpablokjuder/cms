import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { LocalService } from './local.service.js';
import { createLocalSchema } from './dtos/create-local.dto.js';
import { updateLocalSchema } from './dtos/update-local.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

const listQuerySchema = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

export class LocalController {
  private readonly service: LocalService;

  constructor() {
    this.service = new LocalService();
  }

  /** GET /locales?page=1&limit=20 */
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = listQuerySchema.parse(request.query);
    const result = await this.service.list({ page, limit });
    void reply.code(200).send(apiSuccess(result));
  }

  /** GET /locales/:uuid */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const local = await this.service.findByUuid(uuid);
    void reply.code(200).send(apiSuccess(local));
  }

  /** POST /locales */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = createLocalSchema.parse(request.body);
    const local = await this.service.create(dto);
    void reply.code(201).send(apiSuccess(local, 'Local creado exitosamente.'));
  }

  /** PATCH /locales/:uuid */
  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto = updateLocalSchema.parse(request.body);
    const local = await this.service.update(uuid, dto);
    void reply.code(200).send(apiSuccess(local, 'Local actualizado exitosamente.'));
  }

  /** DELETE /locales/:uuid */
  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.delete(uuid);
    void reply.code(200).send(apiSuccess(null, 'Local eliminado exitosamente.'));
  }
}
