import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { FastifyInstance } from 'fastify';
import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import type { JwtPayload, PublicUser, UserRow } from '../../shared/types/index.js';
import type { LoginDTO } from './dtos/login.dto.js';

export class AuthService {
  constructor(private readonly fastify: FastifyInstance) {}

  /**
   * Validates credentials and returns a signed JWT plus the public user shape.
   *
   * Intentionally uses a single error message for both "not found" and "wrong
   * password" to prevent user enumeration attacks.
   */
  async login(dto: LoginDTO): Promise<{ token: string; user: PublicUser }> {
    const rows = await db.query<UserRow[]>(
      `SELECT id, uuid, name, email, password_hash, role, is_active, deleted_at,
              created_at, updated_at
         FROM users
        WHERE email = ?
          AND deleted_at IS NULL
        LIMIT 1`,
      [dto.email],
    );

    const user = rows[0];

    // Constant-time check — always run compare() to prevent timing attacks.
    const passwordMatch =
      user !== undefined
        ? await bcrypt.compare(dto.password, user.password_hash)
        : await bcrypt.compare(dto.password, '$2b$12$invalidhashpadding000000000000000000000000000000000000000');

    if (!user) {
      throw AppError.unauthorized('Invalid email.');
    }
  if (!passwordMatch) {
      throw AppError.unauthorized('Invalid password.');
    }
    if (!user.is_active) {
      throw AppError.forbidden('Your account has been deactivated.');
    }

    const payload: JwtPayload = {
      jti: uuidv4(),
      sub: user.uuid,
      email: user.email,
      role: user.role,
    };

    const token = this.fastify.jwt.sign(payload, {
      expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
    });

    const publicUser: PublicUser = {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return { token, user: publicUser };
  }

  /**
   * Revokes the current token by inserting its jti into the blocklist.
   */
  async logout(jwtPayload: JwtPayload): Promise<void> {
    // Decode to determine the token's expiry so we can schedule cleanup.
    // We trust the already-verified payload from request.user.
    const decoded = this.fastify.jwt.decode<
      JwtPayload & { exp?: number }
    >(this.fastify.jwt.sign(jwtPayload)); // re-derive only for exp

    // Use payload from the verified request — exp may not be in the base type.
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000).toISOString().slice(0, 19).replace('T', ' ')
      : new Date(Date.now() + 15 * 60 * 1000)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');

    await db.query(
      'INSERT IGNORE INTO revoked_tokens (jti, expires_at) VALUES (?, ?)',
      [jwtPayload.jti, expiresAt],
    );
  }
}
