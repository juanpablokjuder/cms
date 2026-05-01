import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type {
  NosotrosRow,
  NosotrosImagenItem,
  PublicNosotros,
} from '../../shared/types/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(slug: string): string {
  return `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}`;
}

interface NosotrosQueryRow extends Omit<NosotrosRow, 'deleted_at'> {
  imagenes_json: string | null;
}

interface RawImagenJson {
  archivo_uuid: string;
  slug:         string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}

function parseImagenes(json: string | null): NosotrosImagenItem[] {
  if (!json) return [];
  try {
    const rows: RawImagenJson[] = JSON.parse(json);
    return rows
      .filter(Boolean)
      .sort((a, b) => a.orden - b.orden)
      .map((r) => ({
        archivo_uuid: r.archivo_uuid,
        url:   buildImageUrl(r.slug),
        alt:   r.alt   ?? null,
        title: r.title ?? null,
        orden: r.orden,
      }));
  } catch {
    return [];
  }
}

function mapRow(row: NosotrosQueryRow): PublicNosotros {
  const { imagenes_json, ...rest } = row;
  return { ...rest, imagenes: parseImagenes(imagenes_json) };
}

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
    FROM nosotros_imagenes ni
    JOIN archivos a ON a.id = ni.archivo_id AND a.deleted_at IS NULL
    WHERE ni.nosotros_id = n.id
    ORDER BY ni.orden ASC
  ) AS imagenes_json
`.trim();

const SELECT_NOSOTROS = `
  n.uuid, n.titulo, n.subtitulo, n.texto, n.created_at, n.updated_at,
  ${IMAGENES_AGG}
FROM nosotros n
`.trim();

export class NosotrosRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  /** Devuelve el registro singleton activo, o null si no existe aún. */
  async findOne(): Promise<PublicNosotros | null> {
    const rows = await db.query<NosotrosQueryRow[]>(
      `SELECT ${SELECT_NOSOTROS}
        WHERE n.deleted_at IS NULL
        ORDER BY n.id ASC
        LIMIT 1`,
    );
    if (rows.length === 0) return null;
    return mapRow(rows[0] as NosotrosQueryRow);
  }

  async findByUuid(uuid: string): Promise<PublicNosotros> {
    const rows = await db.query<NosotrosQueryRow[]>(
      `SELECT ${SELECT_NOSOTROS}
        WHERE n.uuid = ? AND n.deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Nosotros');
    return mapRow(rows[0] as NosotrosQueryRow);
  }

  async findRawByUuid(uuid: string): Promise<NosotrosRow> {
    const rows = await db.query<NosotrosRow[]>(
      `SELECT id, uuid, titulo, subtitulo, texto, deleted_at, created_at, updated_at
         FROM nosotros WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Nosotros');
    return rows[0] as NosotrosRow;
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: {
    uuid:      string;
    titulo:    string;
    subtitulo: string | null;
    texto:     string;
  }): Promise<PublicNosotros> {
    await db.query(
      `INSERT INTO nosotros (uuid, titulo, subtitulo, texto)
       VALUES (?, ?, ?, ?)`,
      [data.uuid, data.titulo, data.subtitulo, data.texto],
    );
    return this.findByUuid(data.uuid);
  }

  async update(
    uuid: string,
    fields: Partial<{
      titulo:    string;
      subtitulo: string | null;
      texto:     string;
    }>,
  ): Promise<PublicNosotros> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) { setClauses.push(`${key} = ?`); params.push(value); }
    }

    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE nosotros SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }

    return this.findByUuid(uuid);
  }

  // ─── Pivot helpers ──────────────────────────────────────────────────────────

  async getNosotrosId(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM nosotros WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Nosotros');
    return rows[0]!.id;
  }

  /** Reemplaza todas las imágenes del registro en una transacción. */
  async replaceImagenes(
    nosotrosId: number,
    items: { archivo_id: number; orden: number }[],
  ): Promise<void> {
    await db.transaction(async (conn) => {
      await conn.query('DELETE FROM nosotros_imagenes WHERE nosotros_id = ?', [nosotrosId]);
      if (items.length === 0) return;
      const placeholders = items.map(() => '(?, ?, ?)').join(', ');
      const flatParams   = items.flatMap((i) => [nosotrosId, i.archivo_id, i.orden]);
      await conn.query(
        `INSERT INTO nosotros_imagenes (nosotros_id, archivo_id, orden) VALUES ${placeholders}`,
        flatParams,
      );
    });
  }

  async getArchivoIdByUuid(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM archivos WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound(`Archivo ${uuid}`);
    return rows[0]!.id;
  }
}
