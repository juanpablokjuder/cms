import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema } from './dtos/login.dto.js';
import { AuthService } from './auth.service.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

export class AuthController {
  private readonly service: AuthService;

  constructor(fastify: FastifyInstance) {
    this.service = new AuthService(fastify);
  }

  /**
   * POST /auth/login
   * Body: { email, password }
   * Returns: { token, user }
   */
  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = loginSchema.parse(request.body);
    const result = await this.service.login(dto);

    void reply.code(200).send(
      apiSuccess(result, 'Login successful.'),
    );
  }

  /**
   * POST /auth/logout
   * Header: Authorization: Bearer <token>
   * Adds the token's jti to the revocation blocklist.
   */
  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.service.logout(request.user);
    void reply.code(200).send(apiSuccess(null, 'Logged out successfully.'));
  }

  /**
   * GET /auth/me
   * Header: Authorization: Bearer <token>
   * Returns the authenticated user's public profile.
   */
  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    void reply.code(200).send(apiSuccess(request.user));
  }
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new AuthController(fastify);

  // Public routes
  fastify.post('/login', (req, rep) => ctrl.login(req, rep));

  // Protected routes
  fastify.post(
    '/logout',
    { preHandler: [authenticate] },
    (req, rep) => ctrl.logout(req, rep),
  );

  fastify.get(
    '/me',
    { preHandler: [authenticate] },
    (req, rep) => ctrl.me(req, rep),
  );
}
