import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type {
  NoticiaRow,
  NoticiaImagenItem,
  PublicNoticia,
  PaginatedResult,
  PaginationOptions,
} from '../../shared/types/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(slug: string): string {
  return `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}`;
}

/** Raw row returned by the noticia + imagenes JOIN */
interface NoticiaQueryRow extends Omit<NoticiaRow, 'deleted_at'> {
  // JSON-aggregated imagenes serialised by GROUP_CONCAT / JSON_ARRAYAGG
  imagenes_json: string | null;
}

interface RawImagenJson {
  archivo_uuid: string;
  slug: string;
  alt: string | null;
  title: string | null;
  orden: number;
}

function parseImagenes(json: string | null): NoticiaImagenItem[] {
  if (!json) return [];
  try {
    const rows: RawImagenJson[] = JSON.parse(json);
    return rows
      .filter(Boolean)
      .sort((a, b) => a.orden - b.orden)
      .map((r) => ({
        archivo_uuid: r.archivo_uuid,
        url: buildImageUrl(r.slug),
        alt:   r.alt ?? null,
        title: r.title ?? null,
        orden: r.orden,
      }));
  } catch {
    return [];
  }
}

function mapRow(row: NoticiaQueryRow): PublicNoticia {
  const { imagenes_json, ...rest } = row;
  return { ...rest, imagenes: parseImagenes(imagenes_json) };
}

/** Sub-query that aggregates images for a noticia as JSON array */
const IMAGENES_AGG = `
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'archivo_uuid', a.uuid,
        'slug',         a.slug,
        'alt',          a.alt,
        'title',        a.title,
        'orden',        ni.orden
      )
    )
    FROM noticia_imagenes ni
    JOIN archivos a ON a.id = ni.archivo_id AND a.deleted_at IS NULL
    WHERE ni.noticia_id = n.id
    ORDER BY ni.orden ASC
  ) AS imagenes_json
`.trim();

const SELECT_NOTICIA = `
  n.uuid, n.titulo, n.subtitulo, n.slug, n.texto, n.created_at, n.updated_at,
  ${IMAGENES_AGG}
FROM noticias n
`.trim();

export class NoticiaRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  async findAll(opts: PaginationOptions): Promise<PaginatedResult<PublicNoticia>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM noticias WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<NoticiaQueryRow[]>(
      `SELECT ${SELECT_NOTICIA}
        WHERE n.deleted_at IS NULL
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows.map(mapRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUuid(uuid: string): Promise<PublicNoticia> {
    const rows = await db.query<NoticiaQueryRow[]>(
      `SELECT ${SELECT_NOTICIA}
        WHERE n.uuid = ? AND n.deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Noticia');
    return mapRow(rows[0] as NoticiaQueryRow);
  }

  async findRawByUuid(uuid: string): Promise<NoticiaRow> {
    const rows = await db.query<NoticiaRow[]>(
      `SELECT id, uuid, titulo, subtitulo, slug, texto, deleted_at, created_at, updated_at
         FROM noticias WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Noticia');
    return rows[0] as NoticiaRow;
  }

  async findBySlug(slug: string): Promise<PublicNoticia> {
    const rows = await db.query<NoticiaQueryRow[]>(
      `SELECT ${SELECT_NOTICIA}
        WHERE n.slug = ? AND n.deleted_at IS NULL
        LIMIT 1`,
      [slug],
    );
    if (rows.length === 0) throw AppError.notFound('Noticia');
    return mapRow(rows[0] as NoticiaQueryRow);
  }

  async slugExists(slug: string, excludeUuid?: string): Promise<boolean> {
    const params: unknown[] = [slug];
    let sql = 'SELECT id FROM noticias WHERE slug = ? AND deleted_at IS NULL';
    if (excludeUuid) { sql += ' AND uuid != ?'; params.push(excludeUuid); }
    sql += ' LIMIT 1';
    const rows = await db.query<{ id: number }[]>(sql, params);
    return rows.length > 0;
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: {
    uuid: string;
    titulo: string;
    subtitulo: string | null;
    slug: string;
    texto: string;
  }): Promise<PublicNoticia> {
    await db.query(
      `INSERT INTO noticias (uuid, titulo, subtitulo, slug, texto)
       VALUES (?, ?, ?, ?, ?)`,
      [data.uuid, data.titulo, data.subtitulo, data.slug, data.texto],
    );
    return this.findByUuid(data.uuid);
  }

  async update(
    uuid: string,
    fields: Partial<{
      titulo: string;
      subtitulo: string | null;
      slug: string;
      texto: string;
    }>,
  ): Promise<PublicNoticia> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) { setClauses.push(`${key} = ?`); params.push(value); }
    }

    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE noticias SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }

    return this.findByUuid(uuid);
  }

  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE noticias SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );
    if (Number(result.affectedRows) === 0) throw AppError.notFound('Noticia');
  }

  // ─── Pivot helpers ──────────────────────────────────────────────────────────

  async getNoticiaId(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM noticias WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Noticia');
    return rows[0]!.id;
  }

  /** Replace all images for a noticia in a single transaction. */
  async replaceImagenes(
    noticiaId: number,
    items: { archivo_id: number; orden: number }[],
  ): Promise<void> {
    await db.transaction(async (conn) => {
      await conn.query('DELETE FROM noticia_imagenes WHERE noticia_id = ?', [noticiaId]);
      if (items.length === 0) return;
      const placeholders = items.map(() => '(?, ?, ?)').join(', ');
      const flatParams   = items.flatMap((i) => [noticiaId, i.archivo_id, i.orden]);
      await conn.query(
        `INSERT INTO noticia_imagenes (noticia_id, archivo_id, orden) VALUES ${placeholders}`,
        flatParams,
      );
    });
  }

  /** Resolve archivo uuid → internal id (for existing images on update). */
  async getArchivoIdByUuid(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM archivos WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound(`Archivo ${uuid}`);
    return rows[0]!.id;
  }
}
