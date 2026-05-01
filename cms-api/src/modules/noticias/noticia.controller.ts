import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { NoticiaService } from './noticia.service.js';
import { createNoticiaSchema } from './dtos/create-noticia.dto.js';
import { updateNoticiaSchema } from './dtos/update-noticia.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

export class NoticiaController {
  private readonly service: NoticiaService;

  constructor() {
    this.service = new NoticiaService();
  }

  /** GET /noticias?page=1&limit=20 */
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = listQuerySchema.parse(request.query);
    const result = await this.service.list({ page, limit });
    void reply.code(200).send(apiSuccess(result));
  }

  /** GET /noticias/:uuid */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const noticia = await this.service.findByUuid(uuid);
    void reply.code(200).send(apiSuccess(noticia));
  }

  /** POST /noticias */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = createNoticiaSchema.parse(request.body);
    const noticia = await this.service.create(dto);
    void reply.code(201).send(apiSuccess(noticia, 'Noticia created successfully.'));
  }

  /** PATCH /noticias/:uuid */
  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto = updateNoticiaSchema.parse(request.body);
    const noticia = await this.service.update(uuid, dto);
    void reply.code(200).send(apiSuccess(noticia, 'Noticia updated successfully.'));
  }

  /** DELETE /noticias/:uuid */
  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.delete(uuid);
    void reply.code(200).send(apiSuccess(null, 'Noticia deleted successfully.'));
  }
}
