import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { UserService } from './user.service.js';
import { createUserSchema } from './dtos/create-user.dto.js';
import { updateUserSchema } from './dtos/update-user.dto.js';
import { apiSuccess } from '../../shared/utils/api-response.js';
import { AppError } from '../../shared/utils/app-error.js';

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

export class UserController {
  private readonly service: UserService;

  constructor() {
    this.service = new UserService();
  }

  /**
   * GET /users?page=1&limit=20
   * Admin-only: returns paginated list of all users.
   */
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = listQuerySchema.parse(request.query);
    const result = await this.service.list({ page, limit });
    void reply.code(200).send(apiSuccess(result));
  }

  /**
   * GET /users/:uuid
   * Admin or the user themselves.
   */
  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const user = await this.service.findByUuid(uuid);
    void reply.code(200).send(apiSuccess(user));
  }

  /**
   * POST /users
   * Admin-only: create a new user.
   */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = createUserSchema.parse(request.body);
    const user = await this.service.create(dto);
    void reply.code(201).send(apiSuccess(user, 'User created successfully.'));
  }

  /**
   * PATCH /users/:uuid
   * Admin or the user themselves. Non-admins cannot escalate their own role.
   */
  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    const dto = updateUserSchema.parse(request.body);

    // Prevent non-admins from changing their own role.
    if (dto.role !== undefined && request.user.role !== 'admin') {
      throw AppError.forbidden('Only admins can change user roles.');
    }

    const user = await this.service.update(uuid, dto);
    void reply.code(200).send(apiSuccess(user, 'User updated successfully.'));
  }

  /**
   * DELETE /users/:uuid
   * Admin-only: soft-deletes the user.
   */
  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { uuid } = uuidParamSchema.parse(request.params);
    await this.service.delete(uuid, request.user.sub);
    void reply.code(200).send(apiSuccess(null, 'User deleted successfully.'));
  }
}
