import type { FastifyReply, FastifyRequest } from 'fastify';
import { NosotrosService } from './nosotros.service.js';
import { createNosotrosSchema } from './dtos/create-nosotros.dto.js';
import { updateNosotrosSchema } from './dtos/update-nosotros.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

export class NosotrosController {
  private readonly service: NosotrosService;

  constructor() {
    this.service = new NosotrosService();
  }

  /** GET /nosotros — devuelve el registro singleton (o null si no existe) */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const nosotros = await this.service.findOne();
    void reply.code(200).send(apiSuccess(nosotros));
  }

  /** POST /nosotros — crea el registro singleton (error si ya existe) */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto      = createNosotrosSchema.parse(request.body);
    const nosotros = await this.service.create(dto);
    void reply.code(201).send(apiSuccess(nosotros, 'Nosotros created successfully.'));
  }

  /** PATCH /nosotros — actualiza el registro singleton */
  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto      = updateNosotrosSchema.parse(request.body);
    const nosotros = await this.service.update(dto);
    void reply.code(200).send(apiSuccess(nosotros, 'Nosotros updated successfully.'));
  }
}
