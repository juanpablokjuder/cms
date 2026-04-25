import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import type {
  PaginatedResult,
  PaginationOptions,
  PublicUser,
  UserRow,
} from '../../shared/types/index.js';

// ─── Projection columns (never expose password_hash or internal id) ───────────
const PUBLIC_COLUMNS = `
  uuid, name, email, role, is_active, created_at, updated_at
`.trim();

export class UserRepository {
  /**
   * Returns a paginated list of active (non-deleted) users.
   */
  async findAll(
    opts: PaginationOptions,
  ): Promise<PaginatedResult<PublicUser>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    // COUNT query (no LIMIT needed)
    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<PublicUser[]>(
      `SELECT ${PUBLIC_COLUMNS}
         FROM users
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single active user by UUID.
   * Throws AppError.notFound if not present or soft-deleted.
   */
  async findByUuid(uuid: string): Promise<PublicUser> {
    const rows = await db.query<PublicUser[]>(
      `SELECT ${PUBLIC_COLUMNS}
         FROM users
        WHERE uuid = ?
          AND deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );

    if (rows.length === 0) {
      throw AppError.notFound('User');
    }

    return rows[0] as PublicUser;
  }

  /**
   * Find a user including password_hash — only for auth purposes.
   */
  async findByEmailWithHash(email: string): Promise<UserRow | undefined> {
    const rows = await db.query<UserRow[]>(
      `SELECT id, uuid, name, email, password_hash, role,
              is_active, deleted_at, created_at, updated_at
         FROM users
        WHERE email = ?
          AND deleted_at IS NULL
        LIMIT 1`,
      [email],
    );

    return rows[0];
  }

  /**
   * Check if an email is already taken (excluding a given uuid for updates).
   */
  async emailExists(email: string, excludeUuid?: string): Promise<boolean> {
    const params: unknown[] = [email];
    let sql =
      'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL';

    if (excludeUuid) {
      sql += ' AND uuid != ?';
      params.push(excludeUuid);
    }

    sql += ' LIMIT 1';

    const rows = await db.query<{ id: number }[]>(sql, params);
    return rows.length > 0;
  }

  /**
   * Insert a new user row. Returns the created user's public shape.
   */
  async create(data: {
    uuid: string;
    name: string;
    email: string;
    password_hash: string;
    role: string;
  }): Promise<PublicUser> {
    await db.query(
      `INSERT INTO users (uuid, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [data.uuid, data.name, data.email, data.password_hash, data.role],
    );

    return this.findByUuid(data.uuid);
  }

  /**
   * Apply a partial update to a user. Only non-undefined fields are mutated.
   * Uses a dynamic (but fully parameterized) SET clause.
   */
  async update(
    uuid: string,
    fields: Partial<{
      name: string;
      email: string;
      password_hash: string;
      role: string;
      is_active: number;
    }>,
  ): Promise<PublicUser> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      // Nothing to update — return current state
      return this.findByUuid(uuid);
    }

    params.push(uuid);

    await db.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
      params,
    );

    return this.findByUuid(uuid);
  }

  /**
   * Soft-delete: sets deleted_at to NOW() instead of physically removing the row.
   * Preserves audit history and prevents foreign key cascade issues.
   */
  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE users SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );

    if (Number(result.affectedRows) === 0) {
      throw AppError.notFound('User');
    }
  }
}

import type { UpsertResult } from '../../database/connection.js';
