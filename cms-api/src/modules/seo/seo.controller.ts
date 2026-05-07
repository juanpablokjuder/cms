import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { SeoService } from './seo.service.js';
import { upsertSeoSchema, SEO_ENTITY_TYPES } from './dtos/upsert-seo.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';
import { AppError } from '../../shared/utils/app-error.js';

const entityParamsSchema = z.object({
  entity_type: z.enum(SEO_ENTITY_TYPES),
  entity_uuid: z.string().min(1).max(100),
});

export class SeoController {
  private readonly service: SeoService;

  constructor() {
    this.service = new SeoService();
  }

  async getByEntity(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { entity_type, entity_uuid } = entityParamsSchema.parse(req.params);
    const seo = await this.service.findByEntity(entity_type, entity_uuid);
    void rep.code(200).send(apiSuccess(seo));
  }

  async upsertByEntity(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { entity_type, entity_uuid } = entityParamsSchema.parse(req.params);
    const dto = upsertSeoSchema.parse(req.body);

    const allEmpty = Object.values(dto).every(v => v === undefined || v === null || v === '');
    if (allEmpty) {
      throw new AppError('Debe enviar al menos un campo SEO.', 400, 'VALIDATION_ERROR');
    }

    const seo = await this.service.upsert(entity_type, entity_uuid, dto);
    void rep.code(200).send(apiSuccess(seo, 'Metadatos SEO guardados exitosamente.'));
  }
}
