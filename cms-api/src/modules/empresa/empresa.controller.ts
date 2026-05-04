import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { EmpresaService } from './empresa.service.js';
import { createEmpresaSchema, updateEmpresaSchema } from './dtos/empresa.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

const uuidParamSchema = z.object({
  uuid: z.string().uuid('Invalid UUID format.'),
});

export class EmpresaController {
  private readonly service = new EmpresaService();

  /** GET /empresa — devuelve el registro activo (o null si no existe) */
  async get(_req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const empresa = await this.service.get();
    void rep.code(200).send(apiSuccess(empresa));
  }

  /** POST /empresa — crea el singleton (solo si no existe) */
  async create(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const dto     = createEmpresaSchema.parse(req.body);
    const empresa = await this.service.create(dto);
    void rep.code(201).send(apiSuccess(empresa, 'Empresa created successfully.'));
  }

  /** PATCH /empresa/:uuid */
  async update(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    const dto      = updateEmpresaSchema.parse(req.body);
    const empresa  = await this.service.update(uuid, dto);
    void rep.code(200).send(apiSuccess(empresa, 'Empresa updated successfully.'));
  }

  /** DELETE /empresa/:uuid */
  async remove(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(req.params);
    await this.service.delete(uuid);
    void rep.code(200).send(apiSuccess(null, 'Empresa deleted successfully.'));
  }
}
