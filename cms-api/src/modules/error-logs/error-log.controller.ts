import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ErrorLogRepository } from './error-log.repository.js';
import { apiSuccess } from '../../shared/utils/api-response.js';
import { AppError } from '../../shared/utils/app-error.js';

const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

const listQuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(50),
  level:       z.enum(['error', 'warn', 'info']).optional(),
  status_code: z.coerce.number().int().optional(),
  error_code:  z.string().max(100).optional(),
  user_uuid:   z.string().uuid().optional(),
  from:        z.string().datetime({ offset: true }).optional(),
  to:          z.string().datetime({ offset: true }).optional(),
});

const purgeBodySchema = z.object({
  /** Elimina logs anteriores a esta fecha ISO. */
  before: z.string().datetime({ offset: true }),
});

export class ErrorLogController {
  private readonly repo: ErrorLogRepository;

  constructor() {
    this.repo = new ErrorLogRepository();
  }

  /**
   * GET /error-logs
   * Lista paginada de errores con filtros opcionales.
   */
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const q = listQuerySchema.parse(request.query);

    const result = await this.repo.findAll({
      page:       q.page,
      limit:      q.limit,
      level:      q.level,
      statusCode: q.status_code,
      errorCode:  q.error_code,
      userUuid:   q.user_uuid,
      from:       q.from   ? new Date(q.from) : undefined,
      to:         q.to     ? new Date(q.to)   : undefined,
    });

    void reply.code(200).send(apiSuccess(result));
  }

  /**
   * GET /error-logs/:uuid
   * Detalle completo de un registro de error.
   */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const log = await this.repo.findByUuid(uuid);
    void reply.code(200).send(apiSuccess(log));
  }

  /**
   * DELETE /error-logs/purge
   * Elimina registros anteriores a la fecha indicada.
   * Operación destructiva — requiere rol 'admin'.
   */
  async purge(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { before } = purgeBodySchema.parse(request.body);
    const cutoff = new Date(before);

    if (cutoff > new Date()) {
      throw AppError.badRequest('La fecha de purga no puede ser futura.');
    }

    const deleted = await this.repo.deleteBefore(cutoff);

    void reply.code(200).send(
      apiSuccess(
        { deleted_count: deleted, before: cutoff.toISOString() },
        `Se eliminaron ${deleted} registro(s) de error anteriores a ${cutoff.toISOString()}.`,
      ),
    );
  }
}
