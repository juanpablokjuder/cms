import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { BannerService } from './banner.service.js';
import { createBannerSchema } from './dtos/create-banner.dto.js';
import { updateBannerSchema } from './dtos/update-banner.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

// ─── Query-string schema for the list endpoint ────────────────────────────────
const listQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive('Page must be a positive integer.')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100, 'Limit cannot exceed 100.')
    .default(20),
});

// ─── Params schema ────────────────────────────────────────────────────────────
const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

// ─── Controller ───────────────────────────────────────────────────────────────

export class BannerController {
  private readonly service: BannerService;

  constructor() {
    this.service = new BannerService();
  }

  /**
   * GET /banners?page=1&limit=20
   * Admin-only: returns paginated list of all banners.
   */
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = listQuerySchema.parse(request.query);
    const result = await this.service.list({ page, limit });
    void reply.code(200).send(apiSuccess(result));
  }

  /**
   * GET /banners/:uuid
   * Admin-only: returns a single banner.
   */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const banner = await this.service.findByUuid(uuid);
    void reply.code(200).send(apiSuccess(banner));
  }

  /**
   * POST /banners
   * Admin-only: create a new banner.
   */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = createBannerSchema.parse(request.body);
    const banner = await this.service.create(dto);
    void reply.code(201).send(apiSuccess(banner, 'Banner created successfully.'));
  }

  /**
   * PATCH /banners/:uuid
   * Admin-only: partial update of a banner.
   */
  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto = updateBannerSchema.parse(request.body);
    const banner = await this.service.update(uuid, dto);
    void reply.code(200).send(apiSuccess(banner, 'Banner updated successfully.'));
  }

  /**
   * DELETE /banners/:uuid
   * Admin-only: soft-deletes the banner.
   */
  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.delete(uuid);
    void reply.code(200).send(apiSuccess(null, 'Banner deleted successfully.'));
  }
}
