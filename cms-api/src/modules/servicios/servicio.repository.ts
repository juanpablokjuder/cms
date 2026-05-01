import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type {
  ServicioRow,
  PublicServicio,
  ServicioCategoriaRow,
  PublicServicioCategoria,
  ServicioItemRow,
  PublicServicioItem,
  ServicioItemImagenItem,
  PublicMoneda,
  MonedaRow,
  PaginationOptions,
  PaginatedResult,
} from '../../shared/types/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(slug: string): string {
  return `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}`;
}

interface RawImagenJson {
  archivo_uuid: string;
  slug:         string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}

function parseImagenes(json: string | null): ServicioItemImagenItem[] {
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

interface ItemQueryRow extends Omit<ServicioItemRow, 'deleted_at' | 'categoria_id' | 'moneda_id'> {
  categoria_uuid: string | null;
  moneda_uuid:    string | null;
  moneda_codigo:  string | null;
  moneda_nombre:  string | null;
  imagenes_json:  string | null;
}

function mapItemRow(row: ItemQueryRow): PublicServicioItem {
  const { imagenes_json, moneda_uuid, moneda_codigo, moneda_nombre, ...rest } = row;

  const moneda: PublicMoneda | null =
    moneda_uuid && moneda_codigo && moneda_nombre
      ? { id: 0, uuid: moneda_uuid, codigo: moneda_codigo, nombre: moneda_nombre }
      : null;

  return {
    ...rest,
    moneda,
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
        'orden',        sii.orden
      )
    )
    FROM servicio_item_imagenes sii
    JOIN archivos a ON a.id = sii.archivo_id AND a.deleted_at IS NULL
    WHERE sii.item_id = si.id
    ORDER BY sii.orden ASC
  ) AS imagenes_json
`.trim();

const SELECT_ITEM = `
  si.uuid,
  sc.uuid  AS categoria_uuid,
  si.titulo, si.subtitulo_1, si.subtitulo_2,
  si.precio,
  m.uuid   AS moneda_uuid,
  m.codigo AS moneda_codigo,
  m.nombre AS moneda_nombre,
  si.btn_titulo, si.btn_link, si.texto, si.estado,
  si.created_at, si.updated_at,
  ${IMAGENES_AGG}
FROM servicios_items si
LEFT JOIN servicios_categorias sc ON sc.id = si.categoria_id AND sc.deleted_at IS NULL
LEFT JOIN monedas m ON m.id = si.moneda_id
`.trim();

// ─── Repository ───────────────────────────────────────────────────────────────

export class ServicioRepository {

  // ══════════════════════════════════════════════════════════════════════════
  // MONEDAS
  // ══════════════════════════════════════════════════════════════════════════

  async findAllMonedas(): Promise<PublicMoneda[]> {
    return db.query<PublicMoneda[]>(
      'SELECT id, uuid, codigo, nombre FROM monedas ORDER BY codigo ASC',
    );
  }

  async getMonedaIdByUuid(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM monedas WHERE uuid = ? LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound(`Moneda ${uuid}`);
    return rows[0]!.id;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SERVICIOS (singleton)
  // ══════════════════════════════════════════════════════════════════════════

  async findServicio(): Promise<PublicServicio | null> {
    const rows = await db.query<ServicioRow[]>(
      `SELECT uuid, titulo, subtitulo, created_at, updated_at
         FROM servicios WHERE deleted_at IS NULL LIMIT 1`,
    );
    if (rows.length === 0) return null;
    const { id: _id, deleted_at: _d, ...rest } = rows[0] as ServicioRow;
    return rest as PublicServicio;
  }

  async createServicio(data: { uuid: string; titulo: string; subtitulo: string | null }): Promise<PublicServicio> {
    await db.query(
      'INSERT INTO servicios (uuid, titulo, subtitulo) VALUES (?, ?, ?)',
      [data.uuid, data.titulo, data.subtitulo],
    );
    return (await this.findServicio())!;
  }

  async updateServicio(
    uuid: string,
    fields: Partial<{ titulo: string; subtitulo: string | null }>,
  ): Promise<PublicServicio> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) { setClauses.push(`${key} = ?`); params.push(value); }
    }
    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE servicios SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }
    return (await this.findServicio())!;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORÍAS
  // ══════════════════════════════════════════════════════════════════════════

  async findAllCategorias(opts: PaginationOptions): Promise<PaginatedResult<PublicServicioCategoria>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM servicios_categorias WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<PublicServicioCategoria[]>(
      `SELECT uuid, nombre, orden, estado, created_at, updated_at
         FROM servicios_categorias
        WHERE deleted_at IS NULL
        ORDER BY orden ASC, created_at ASC
        LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findCategoriaByUuid(uuid: string): Promise<PublicServicioCategoria> {
    const rows = await db.query<ServicioCategoriaRow[]>(
      `SELECT uuid, nombre, orden, estado, created_at, updated_at
         FROM servicios_categorias WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Categoría');
    const { id: _id, deleted_at: _d, ...rest } = rows[0] as ServicioCategoriaRow;
    return rest as PublicServicioCategoria;
  }

  async getCategoriaId(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM servicios_categorias WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Categoría');
    return rows[0]!.id;
  }

  async createCategoria(data: {
    uuid: string;
    nombre: string;
    orden: number;
    estado: number;
  }): Promise<PublicServicioCategoria> {
    await db.query(
      'INSERT INTO servicios_categorias (uuid, nombre, orden, estado) VALUES (?, ?, ?, ?)',
      [data.uuid, data.nombre, data.orden, data.estado],
    );
    return this.findCategoriaByUuid(data.uuid);
  }

  async updateCategoria(
    uuid: string,
    fields: Partial<{ nombre: string; orden: number; estado: number }>,
  ): Promise<PublicServicioCategoria> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) { setClauses.push(`${key} = ?`); params.push(value); }
    }
    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE servicios_categorias SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }
    return this.findCategoriaByUuid(uuid);
  }

  async softDeleteCategoria(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE servicios_categorias SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );
    if (Number(result.affectedRows) === 0) throw AppError.notFound('Categoría');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ITEMS
  // ══════════════════════════════════════════════════════════════════════════

  async findAllItems(opts: PaginationOptions): Promise<PaginatedResult<PublicServicioItem>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM servicios_items WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<ItemQueryRow[]>(
      `SELECT ${SELECT_ITEM}
        WHERE si.deleted_at IS NULL
        ORDER BY si.created_at DESC
        LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows.map(mapItemRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findItemByUuid(uuid: string): Promise<PublicServicioItem> {
    const rows = await db.query<ItemQueryRow[]>(
      `SELECT ${SELECT_ITEM}
        WHERE si.uuid = ? AND si.deleted_at IS NULL
        LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Item de servicio');
    return mapItemRow(rows[0] as ItemQueryRow);
  }

  async getItemId(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM servicios_items WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Item de servicio');
    return rows[0]!.id;
  }

  async createItem(data: {
    uuid:         string;
    categoria_id: number | null;
    titulo:       string;
    subtitulo_1:  string | null;
    subtitulo_2:  string | null;
    precio:       number | null;
    moneda_id:    number | null;
    btn_titulo:   string | null;
    btn_link:     string | null;
    texto:        string | null;
    estado:       string;
  }): Promise<PublicServicioItem> {
    await db.query(
      `INSERT INTO servicios_items
         (uuid, categoria_id, titulo, subtitulo_1, subtitulo_2, precio, moneda_id,
          btn_titulo, btn_link, texto, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.uuid, data.categoria_id, data.titulo,
        data.subtitulo_1, data.subtitulo_2,
        data.precio, data.moneda_id,
        data.btn_titulo, data.btn_link,
        data.texto, data.estado,
      ],
    );
    return this.findItemByUuid(data.uuid);
  }

  async updateItem(
    uuid: string,
    fields: Partial<{
      categoria_id: number | null;
      titulo:       string;
      subtitulo_1:  string | null;
      subtitulo_2:  string | null;
      precio:       number | null;
      moneda_id:    number | null;
      btn_titulo:   string | null;
      btn_link:     string | null;
      texto:        string | null;
      estado:       string;
    }>,
  ): Promise<PublicServicioItem> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) { setClauses.push(`${key} = ?`); params.push(value); }
    }
    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE servicios_items SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }
    return this.findItemByUuid(uuid);
  }

  async softDeleteItem(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE servicios_items SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );
    if (Number(result.affectedRows) === 0) throw AppError.notFound('Item de servicio');
  }

  // ─── Imágenes pivot ───────────────────────────────────────────────────────

  async replaceItemImagenes(
    itemId: number,
    items: { archivo_id: number; orden: number }[],
  ): Promise<void> {
    await db.transaction(async (conn) => {
      await conn.query('DELETE FROM servicio_item_imagenes WHERE item_id = ?', [itemId]);
      if (items.length === 0) return;
      const placeholders = items.map(() => '(?, ?, ?)').join(', ');
      const flatParams   = items.flatMap((i) => [itemId, i.archivo_id, i.orden]);
      await conn.query(
        `INSERT INTO servicio_item_imagenes (item_id, archivo_id, orden) VALUES ${placeholders}`,
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
