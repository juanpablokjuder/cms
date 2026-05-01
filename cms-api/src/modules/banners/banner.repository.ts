import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type {
  BannerRow,
  PaginatedResult,
  PaginationOptions,
  PublicBanner,
} from '../../shared/types/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds the public imagen URL absoluta desde un slug, o retorna null. */
function buildImagenUrl(slug: string | null): string | null {
  if (!slug) return null;
  return `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}`;
}

/** Intermediate query row that includes the joined archivo slug. */
interface BannerQueryRow extends Omit<PublicBanner, 'imagen'> {
  imagen_slug: string | null;
}

/** Common SELECT for banner queries (LEFT JOIN archivos for imagen_slug). */
const SELECT_BANNERS = `
  b.uuid, b.pagina, b.h1, b.texto_1, b.texto_2,
  b.btn_texto, b.btn_link, b.orden,
  b.created_at, b.updated_at,
  a.slug AS imagen_slug
FROM banners b
LEFT JOIN archivos a ON a.id = b.id_imagen AND a.deleted_at IS NULL
`.trim();

function mapRow(row: BannerQueryRow): PublicBanner {
  const { imagen_slug, ...rest } = row;
  return { ...rest, imagen: buildImagenUrl(imagen_slug) };
}

export class BannerRepository {
  /**
   * Returns a paginated list of active (non-deleted) banners ordered by orden ASC.
   */
  async findAll(opts: PaginationOptions): Promise<PaginatedResult<PublicBanner>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM banners WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<BannerQueryRow[]>(
      `SELECT ${SELECT_BANNERS}
        WHERE b.deleted_at IS NULL
        ORDER BY b.orden ASC, b.created_at DESC
        LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows.map(mapRow),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single active banner by UUID.
   * Throws AppError.notFound if not present or soft-deleted.
   */
  async findByUuid(uuid: string): Promise<PublicBanner> {
    const rows = await db.query<BannerQueryRow[]>(
      `SELECT ${SELECT_BANNERS}
        WHERE b.uuid = ?
          AND b.deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );

    if (rows.length === 0) {
      throw AppError.notFound('Banner');
    }

    return mapRow(rows[0] as BannerQueryRow);
  }

  /**
   * Find a banner row including internal fields — used when we need to read
   * the current id_imagen before an update/delete operation.
   */
  async findRawByUuid(uuid: string): Promise<BannerRow> {
    const rows = await db.query<BannerRow[]>(
      `SELECT id, uuid, pagina, id_imagen, h1, texto_1, texto_2,
              btn_texto, btn_link, orden, deleted_at, created_at, updated_at
         FROM banners
        WHERE uuid = ?
          AND deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );

    if (rows.length === 0) {
      throw AppError.notFound('Banner');
    }

    return rows[0] as BannerRow;
  }

  /**
   * Insert a new banner row.
   */
  async create(data: {
    uuid: string;
    pagina: string;
    id_imagen: number | null;
    h1: string;
    texto_1: string | null;
    texto_2: string | null;
    btn_texto: string | null;
    btn_link: string | null;
    orden: number;
  }): Promise<PublicBanner> {
    await db.query(
      `INSERT INTO banners
         (uuid, pagina, id_imagen, h1, texto_1, texto_2, btn_texto, btn_link, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.uuid,
        data.pagina,
        data.id_imagen,
        data.h1,
        data.texto_1,
        data.texto_2,
        data.btn_texto,
        data.btn_link,
        data.orden,
      ],
    );

    return this.findByUuid(data.uuid);
  }

  /**
   * Apply a partial update to a banner. Only non-undefined fields are mutated.
   * Uses a dynamic (but fully parameterized) SET clause.
   */
  async update(
    uuid: string,
    fields: Partial<{
      pagina: string;
      id_imagen: number | null;
      h1: string;
      texto_1: string | null;
      texto_2: string | null;
      btn_texto: string | null;
      btn_link: string | null;
      orden: number;
    }>,
  ): Promise<PublicBanner> {
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
      `UPDATE banners SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
      params,
    );

    return this.findByUuid(uuid);
  }

  /**
   * Soft-delete: sets deleted_at to NOW() instead of physically removing the row.
   */
  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE banners SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );

    if (Number(result.affectedRows) === 0) {
      throw AppError.notFound('Banner');
    }
  }
}
