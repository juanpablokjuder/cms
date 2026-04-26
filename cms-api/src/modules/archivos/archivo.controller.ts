import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ArchivoService, FORMATO_TO_MIME } from './archivo.service.js';
import { createArchivoSchema } from './dtos/create-archivo.dto.js';
import { updateArchivoSchema } from './dtos/update-archivo.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';
import { AppError } from '../../shared/utils/app-error.js';

const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format.'),
});

export class ArchivoController {
  private readonly service: ArchivoService;

  constructor() {
    this.service = new ArchivoService();
  }

  /**
   * GET /archivos/:slug
   * Public: stream the physical file back to the client.
   */
  async serve(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug } = slugParamSchema.parse(request.params);
    const archivo = await this.service.findBySlug(slug);

    const diskPath = join(this.service.uploadsDir, archivo.path);

    try {
      await access(diskPath);
    } catch {
      throw AppError.notFound('File');
    }

    const mime =
      FORMATO_TO_MIME[archivo.formato] ?? 'application/octet-stream';

    void reply
      .header('Content-Type', mime)
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .send(createReadStream(diskPath));
  }

  /**
   * GET /archivos/:uuid/info
   * Admin-only: returns the archivo metadata (no file content).
   */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const archivo = await this.service.findByUuid(uuid);
    void reply.code(200).send(apiSuccess(archivo));
  }

  /**
   * POST /archivos
   * Admin-only: upload a new file from a base64 data URI.
   */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = createArchivoSchema.parse(request.body);
    const archivo = await this.service.create(dto);
    void reply
      .code(201)
      .send(apiSuccess(archivo, 'Archivo created successfully.'));
  }

  /**
   * PATCH /archivos/:uuid
   * Admin-only: update metadata and optionally replace the file.
   */
  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto = updateArchivoSchema.parse(request.body);
    const archivo = await this.service.update(uuid, dto);
    void reply.code(200).send(apiSuccess(archivo, 'Archivo updated successfully.'));
  }

  /**
   * DELETE /archivos/:uuid
   * Admin-only: soft-deletes the archivo record.
   */
  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.delete(uuid);
    void reply.code(200).send(apiSuccess(null, 'Archivo deleted successfully.'));
  }
}
