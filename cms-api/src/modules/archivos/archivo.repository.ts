import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import type { UpsertResult } from '../../database/connection.js';
import type { ArchivoRow, PublicArchivo } from '../../shared/types/index.js';

const PUBLIC_COLUMNS = `
  uuid, path, slug, alt, title, formato, created_at, updated_at
`.trim();

export class ArchivoRepository {
  /**
   * Find a single active archivo by UUID (public projection).
   */
  async findByUuid(uuid: string): Promise<PublicArchivo> {
    const rows = await db.query<PublicArchivo[]>(
      `SELECT ${PUBLIC_COLUMNS}
         FROM archivos
        WHERE uuid = ?
          AND deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );

    if (rows.length === 0) {
      throw AppError.notFound('Archivo');
    }

    return rows[0] as PublicArchivo;
  }

  /**
   * Find a single active archivo by slug (used for file serving).
   */
  async findBySlug(slug: string): Promise<PublicArchivo> {
    const rows = await db.query<PublicArchivo[]>(
      `SELECT ${PUBLIC_COLUMNS}
         FROM archivos
        WHERE slug = ?
          AND deleted_at IS NULL
        LIMIT 1`,
      [slug],
    );

    if (rows.length === 0) {
      throw AppError.notFound('Archivo');
    }

    return rows[0] as PublicArchivo;
  }

  /**
   * Find by internal numeric id — used by other modules that hold the FK.
   */
  async findById(id: number): Promise<ArchivoRow | undefined> {
    const rows = await db.query<ArchivoRow[]>(
      `SELECT id, ${PUBLIC_COLUMNS}, deleted_at
         FROM archivos
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1`,
      [id],
    );

    return rows[0];
  }

  /**
   * Check if a slug is already taken (excluding a uuid for updates).
   */
  async slugExists(slug: string, excludeUuid?: string): Promise<boolean> {
    const params: unknown[] = [slug];
    let sql = 'SELECT id FROM archivos WHERE slug = ? AND deleted_at IS NULL';

    if (excludeUuid) {
      sql += ' AND uuid != ?';
      params.push(excludeUuid);
    }

    sql += ' LIMIT 1';
    const rows = await db.query<{ id: number }[]>(sql, params);
    return rows.length > 0;
  }

  /**
   * Insert a new archivo row. Returns the created row including internal id.
   */
  async create(data: {
    uuid: string;
    path: string;
    slug: string;
    alt: string | null;
    title: string | null;
    formato: string;
  }): Promise<ArchivoRow> {
    const result = await db.query<UpsertResult>(
      `INSERT INTO archivos (uuid, path, slug, alt, title, formato)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.uuid, data.path, data.slug, data.alt, data.title, data.formato],
    );

    const rows = await db.query<ArchivoRow[]>(
      `SELECT id, ${PUBLIC_COLUMNS}, deleted_at
         FROM archivos
        WHERE id = ?
        LIMIT 1`,
      [Number(result.insertId)],
    );

    return rows[0] as ArchivoRow;
  }

  /**
   * Apply a partial update. Returns updated public projection.
   */
  async update(
    uuid: string,
    fields: Partial<{
      path: string;
      slug: string;
      alt: string | null;
      title: string | null;
      formato: string;
    }>,
  ): Promise<PublicArchivo> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      return this.findByUuid(uuid);
    }

    params.push(uuid);

    await db.query(
      `UPDATE archivos SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
      params,
    );

    return this.findByUuid(uuid);
  }

  /**
   * Soft-delete an archivo row.
   */
  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE archivos SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );

    if (Number(result.affectedRows) === 0) {
      throw AppError.notFound('Archivo');
    }
  }
}
