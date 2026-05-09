import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type {
  LocalRow,
  LocalImagenItem,
  HorarioDia,
  PublicLocal,
  PaginatedResult,
  PaginationOptions,
} from '../../shared/types/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(slug: string): string {
  return `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}`;
}

interface LocalQueryRow extends Omit<LocalRow, 'deleted_at' | 'horarios'> {
  horarios:      string | null;  // raw JSON from DB
  imagenes_json: string | null;
}

interface RawImagenJson {
  archivo_uuid: string;
  slug: string;
  alt: string | null;
  title: string | null;
  orden: number;
}

function parseImagenes(json: string | null): LocalImagenItem[] {
  if (!json) return [];
  try {
    const rows: RawImagenJson[] = JSON.parse(json);
    return rows
      .filter(Boolean)
      .sort((a, b) => a.orden - b.orden)
      .map((r) => ({
        archivo_uuid: r.archivo_uuid,
        url:          buildImageUrl(r.slug),
        alt:          r.alt ?? null,
        title:        r.title ?? null,
        orden:        r.orden,
      }));
  } catch {
    return [];
  }
}

function parseHorarios(json: string | null): HorarioDia[] | null {
  if (!json) return null;
  try { return JSON.parse(json) as HorarioDia[]; } catch { return null; }
}

function mapRow(row: LocalQueryRow): PublicLocal {
  const { imagenes_json, horarios, ...rest } = row;
  return {
    ...rest,
    horarios: parseHorarios(horarios),
    imagenes: parseImagenes(imagenes_json),
  };
}

const IMAGENES_AGG = `
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'archivo_uuid', a.uuid,
        'slug',         a.slug,
        'alt',          a.alt,
        'title',        a.title,
        'orden',        li.orden
      )
    )
    FROM local_imagenes li
    JOIN archivos a ON a.id = li.archivo_id AND a.deleted_at IS NULL
    WHERE li.local_id = l.id
    ORDER BY li.orden ASC
  ) AS imagenes_json
`.trim();

const SELECT_LOCAL = `
  l.uuid, l.nombre, l.descripcion, l.direccion, l.telefono, l.horarios,
  l.created_at, l.updated_at,
  ${IMAGENES_AGG}
FROM locales l
`.trim();

export class LocalRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  async findAll(opts: PaginationOptions): Promise<PaginatedResult<PublicLocal>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM locales WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<LocalQueryRow[]>(
      `SELECT ${SELECT_LOCAL}
        WHERE l.deleted_at IS NULL
        ORDER BY l.nombre ASC
        LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows.map(mapRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUuid(uuid: string): Promise<PublicLocal> {
    const rows = await db.query<LocalQueryRow[]>(
      `SELECT ${SELECT_LOCAL}
        WHERE l.uuid = ? AND l.deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Local');
    return mapRow(rows[0] as LocalQueryRow);
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: {
    uuid:        string;
    nombre:      string;
    descripcion: string;
    direccion?:  string | null;
    telefono?:   string | null;
    horarios?:   string | null;
  }): Promise<PublicLocal> {
    await db.query(
      `INSERT INTO locales (uuid, nombre, descripcion, direccion, telefono, horarios)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.uuid,
        data.nombre,
        data.descripcion,
        data.direccion ?? null,
        data.telefono  ?? null,
        data.horarios  ?? null,
      ],
    );
    return this.findByUuid(data.uuid);
  }

  async update(
    uuid: string,
    fields: Partial<{
      nombre:      string;
      descripcion: string;
      direccion:   string | null;
      telefono:    string | null;
      horarios:    string | null;
    }>,
  ): Promise<PublicLocal> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE locales SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }

    return this.findByUuid(uuid);
  }

  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE locales SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );
    if (Number(result.affectedRows) === 0) throw AppError.notFound('Local');
  }

  // ─── Pivot helpers ──────────────────────────────────────────────────────────

  async getLocalId(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM locales WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Local');
    return rows[0]!.id;
  }

  async replaceImagenes(
    localId: number,
    items: { archivo_id: number; orden: number }[],
  ): Promise<void> {
    await db.transaction(async (conn) => {
      await conn.query('DELETE FROM local_imagenes WHERE local_id = ?', [localId]);
      if (items.length === 0) return;
      const placeholders = items.map(() => '(?, ?, ?)').join(', ');
      const flatParams   = items.flatMap((i) => [localId, i.archivo_id, i.orden]);
      await conn.query(
        `INSERT INTO local_imagenes (local_id, archivo_id, orden) VALUES ${placeholders}`,
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
