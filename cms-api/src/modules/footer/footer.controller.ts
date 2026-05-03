import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { FooterService } from './footer.service.js';
import { createFooterSchema } from './dtos/create-footer.dto.js';
import { updateFooterSchema } from './dtos/update-footer.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

const listQuerySchema = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
const uuidParamSchema = z.object({ uuid: z.string().uuid('Invalid UUID format.') });

export class FooterController {
  private readonly service = new FooterService();

  async list(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { page, limit } = listQuerySchema.parse(req.query);
    void rep.code(200).send(apiSuccess(await this.service.list({ page, limit })));
  }

  async show(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    void rep.code(200).send(apiSuccess(await this.service.findByUuid(uuid)));
  }

  async create(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const dto = createFooterSchema.parse(req.body);
    void rep.code(201).send(apiSuccess(await this.service.create(dto), 'Footer created successfully.'));
  }

  async update(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const dto      = updateFooterSchema.parse(req.body);
    void rep.code(200).send(apiSuccess(await this.service.update(uuid, dto), 'Footer updated successfully.'));
  }

  async remove(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    await this.service.delete(uuid);
    void rep.code(200).send(apiSuccess(null, 'Footer deleted successfully.'));
  }
}
