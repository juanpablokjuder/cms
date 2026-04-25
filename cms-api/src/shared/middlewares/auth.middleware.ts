import type { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../../database/connection.js';
import { AppError } from '../utils/app-error.js';
import type { JwtPayload, UserRole } from '../types/index.js';

// ─── Core authentication hook ─────────────────────────────────────────────────

/**
 * Verifies the Bearer JWT and checks it has not been revoked.
 * Attach this as a `preHandler` on any protected route.
 *
 * After this hook, `request.user` is guaranteed to be a valid JwtPayload.
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // jwtVerify() reads the Authorization: Bearer <token> header automatically.
  await request.jwtVerify();

  // Check token revocation in DB (covers explicit logout).
  const rows = await db.query<{ id: number }[]>(
    'SELECT id FROM revoked_tokens WHERE jti = ? LIMIT 1',
    [request.user.jti],
  );

  if (rows.length > 0) {
    throw AppError.unauthorized('Token has been revoked. Please log in again.');
  }
}

// ─── Role-based authorisation factory ────────────────────────────────────────

/**
 * Returns a preHandler that allows only the specified roles.
 *
 * Usage: preHandler: [authenticate, requireRole('admin')]
 */
export function requireRole(
  ...allowedRoles: UserRole[]
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = request.user as JwtPayload;

    if (!allowedRoles.includes(user.role)) {
      throw AppError.forbidden(
        `This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
      );
    }
  };
}

// ─── Self-or-admin guard ──────────────────────────────────────────────────────

/**
 * Allows access if the authenticated user is an admin OR
 * if the :uuid route param matches their own subject claim.
 *
 * Usage: preHandler: [authenticate, selfOrAdmin('uuid')]
 */
export function selfOrAdmin(
  paramName = 'uuid',
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = request.user as JwtPayload;
    const targetUuid = (request.params as Record<string, string>)[paramName];

    if (user.role !== 'admin' && user.sub !== targetUuid) {
      throw AppError.forbidden('You can only access your own resource.');
    }
  };
}
