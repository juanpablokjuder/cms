import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type {
  FaqRow,
  FaqItemRow,
  PublicFaq,
  PublicFaqItem,
  PaginatedResult,
  PaginationOptions,
} from '../../shared/types/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(slug: string): string {
  return `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}`;
}

interface FaqQueryRow extends Omit<FaqRow, 'id' | 'id_imagen' | 'deleted_at'> {
  imagen_slug:  string | null;
  imagen_alt:   string | null;
  imagen_title: string | null;
  items_json:   string | null;
}

interface RawItemJson {
  uuid:      string;
  pregunta:  string;
  respuesta: string;
  orden:     number;
}

function parseItems(json: string | null): PublicFaqItem[] {
  if (!json) return [];
  try {
    const rows: RawItemJson[] = JSON.parse(json);
    return rows
      .filter(Boolean)
      .sort((a, b) => a.orden - b.orden)
      .map((r) => ({
        uuid:      r.uuid,
        pregunta:  r.pregunta,
        respuesta: r.respuesta,
        orden:     r.orden,
      }));
  } catch {
    return [];
  }
}

function mapRow(row: FaqQueryRow): PublicFaq {
  const { imagen_slug, imagen_alt, imagen_title, items_json, ...rest } = row;
  return {
    ...rest,
    imagen:       imagen_slug ? buildImageUrl(imagen_slug) : null,
    imagen_alt:   imagen_alt   ?? null,
    imagen_title: imagen_title ?? null,
    items:        parseItems(items_json),
  };
}

const SELECT_FAQ = `
  f.uuid, f.titulo, f.created_at, f.updated_at,
  a.slug  AS imagen_slug,
  a.alt   AS imagen_alt,
  a.title AS imagen_title,
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'uuid',      fi.uuid,
        'pregunta',  fi.pregunta,
        'respuesta', fi.respuesta,
        'orden',     fi.orden
      )
    )
    FROM faq_items fi
    WHERE fi.faq_id = f.id
    ORDER BY fi.orden ASC
  ) AS items_json
FROM faqs f
LEFT JOIN archivos a ON a.id = f.id_imagen AND a.deleted_at IS NULL
`.trim();

export class FaqRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  async findAll(opts: PaginationOptions): Promise<PaginatedResult<PublicFaq>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM faqs WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<FaqQueryRow[]>(
      `SELECT ${SELECT_FAQ}
        WHERE f.deleted_at IS NULL
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows.map(mapRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUuid(uuid: string): Promise<PublicFaq> {
    const rows = await db.query<FaqQueryRow[]>(
      `SELECT ${SELECT_FAQ}
        WHERE f.uuid = ? AND f.deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('FAQ');
    return mapRow(rows[0] as FaqQueryRow);
  }

  async findRawByUuid(uuid: string): Promise<FaqRow> {
    const rows = await db.query<FaqRow[]>(
      `SELECT id, uuid, titulo, id_imagen, deleted_at, created_at, updated_at
         FROM faqs WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('FAQ');
    return rows[0] as FaqRow;
  }

  /**
   * Devuelve todos los FAQs activos sin paginación.
   * Usado por el módulo web.
   */
  async findAllForWeb(): Promise<PublicFaq[]> {
    const rows = await db.query<FaqQueryRow[]>(
      `SELECT ${SELECT_FAQ}
        WHERE f.deleted_at IS NULL
        ORDER BY f.created_at ASC`,
    );
    return rows.map(mapRow);
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: {
    uuid:      string;
    titulo:    string;
    id_imagen: number | null;
  }): Promise<PublicFaq> {
    await db.query(
      'INSERT INTO faqs (uuid, titulo, id_imagen) VALUES (?, ?, ?)',
      [data.uuid, data.titulo, data.id_imagen],
    );
    return this.findByUuid(data.uuid);
  }

  async update(
    uuid: string,
    fields: Partial<{ titulo: string; id_imagen: number | null }>,
  ): Promise<PublicFaq> {
    const setClauses: string[] = [];
    const params: unknown[]    = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) { setClauses.push(`${key} = ?`); params.push(value); }
    }

    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE faqs SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }

    return this.findByUuid(uuid);
  }

  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE faqs SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );
    if (Number(result.affectedRows) === 0) throw AppError.notFound('FAQ');
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  async getFaqId(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM faqs WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('FAQ');
    return rows[0]!.id;
  }

  /**
   * Full replacement of faq_items for a given faq_id inside a transaction.
   * Each incoming item may carry an existing uuid (keep) or no uuid (new).
   */
  async replaceItems(
    faqId: number,
    items: { uuid?: string; pregunta: string; respuesta: string; orden: number }[],
  ): Promise<void> {
    await db.transaction(async (conn) => {
      await conn.query('DELETE FROM faq_items WHERE faq_id = ?', [faqId]);
      if (items.length === 0) return;

      const placeholders = items.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const params: unknown[] = [];
      for (const i of items) {
        params.push(faqId, i.uuid ?? uuidv4(), i.pregunta, i.respuesta, i.orden);
      }

      await conn.query(
        `INSERT INTO faq_items (faq_id, uuid, pregunta, respuesta, orden) VALUES ${placeholders}`,
        params,
      );
    });
  }
}
