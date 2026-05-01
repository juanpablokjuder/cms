import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { FaqService } from './faq.service.js';
import { createFaqSchema } from './dtos/create-faq.dto.js';
import { updateFaqSchema } from './dtos/update-faq.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

const listQuerySchema = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

export class FaqController {
  private readonly service: FaqService;

  constructor() {
    this.service = new FaqService();
  }

  /** GET /faqs */
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = listQuerySchema.parse(request.query);
    void reply.code(200).send(apiSuccess(await this.service.list({ page, limit })));
  }

  /** GET /faqs/:uuid */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    void reply.code(200).send(apiSuccess(await this.service.findByUuid(uuid)));
  }

  /** POST /faqs */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = createFaqSchema.parse(request.body);
    void reply.code(201).send(apiSuccess(await this.service.create(dto), 'FAQ created successfully.'));
  }

  /** PATCH /faqs/:uuid */
  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto      = updateFaqSchema.parse(request.body);
    void reply.code(200).send(apiSuccess(await this.service.update(uuid, dto), 'FAQ updated successfully.'));
  }

  /** DELETE /faqs/:uuid */
  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.delete(uuid);
    void reply.code(200).send(apiSuccess(null, 'FAQ deleted successfully.'));
  }
}
