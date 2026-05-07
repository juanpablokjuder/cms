import { randomUUID } from 'crypto';
import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type { PaginationOptions, PaginatedResult } from '../../shared/types/index.js';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface PublicColor {
  uuid:        string;
  nombre:      string;
  imagen_url:  string | null;
  imagen_uuid: string | null;
  created_at:  Date;
  updated_at:  Date;
}

export interface PublicAtributoPlantilla {
  uuid:       string;
  nombre:     string;
  atributos:  Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

export interface VarianteImagenItem {
  uuid:         string;
  archivo_uuid: string;
  url:          string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}

export interface PublicVariante {
  uuid:             string;
  color_uuid:       string | null;
  color_nombre:     string | null;
  color_imagen_url: string | null;
  moneda_uuid:      string | null;
  moneda_codigo:    string | null;
  moneda_nombre:    string | null;
  precio:           number;
  descuento:        number;
  stock:            number;
  imagenes:         VarianteImagenItem[];
  created_at:       Date;
  updated_at:       Date;
}

export interface PublicProducto {
  uuid:                string;
  nombre:              string;
  descripcion:         string | null;
  marca:               string | null;
  condicion_uuid:      string | null;
  condicion:           string | null;
  garantia_uuid:       string | null;
  garantia:            string | null;
  atributos_uuid:      string | null;
  atributos_plantilla: Record<string, string> | null;
  atributos:           Record<string, unknown> | null;
  estado:              'activo' | 'inactivo';
  variantes:           PublicVariante[];
  created_at:          Date;
  updated_at:          Date;
}

export interface PublicProductoListItem {
  uuid:          string;
  nombre:        string;
  marca:         string | null;
  condicion:     string | null;
  estado:        string;
  num_variantes: number;
  preview_url:   string | null;
  created_at:    Date;
  updated_at:    Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(slug: string): string {
  return `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}`;
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

// ─── Repository ──────────────────────────────────────────────────────────────

export class ProductoRepository {

  // ══ Resolvers ════════════════════════════════════════════════════════════════

  async resolveArchivoId(uuid: string | null | undefined): Promise<number | null> {
    if (!uuid) return null;
    const rows = await db.query<{ id: number }[]>(
      `SELECT id FROM archivos WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`, [uuid],
    );
    if (!rows[0]) throw new AppError(`Archivo "${uuid}" no encontrado.`, 404, 'NOT_FOUND');
    return rows[0].id;
  }

  private async _resolveLookupId(table: string, uuid: string | null | undefined): Promise<number | null> {
    if (!uuid) return null;
    const rows = await db.query<{ id: number }[]>(
      `SELECT id FROM \`${table}\` WHERE uuid = ? LIMIT 1`, [uuid],
    );
    if (!rows[0]) throw new AppError(`Registro no encontrado en ${table}: ${uuid}`, 404, 'NOT_FOUND');
    return rows[0].id;
  }

  private async _resolveUserId(userUuid: string): Promise<number | null> {
    if (!userUuid) return null;
    const rows = await db.query<{ id: number }[]>(
      `SELECT id FROM users WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`, [userUuid],
    );
    return rows[0]?.id ?? null;
  }

  // ══ Colores ═══════════════════════════════════════════════════════════════════

  async listColores(opts: PaginationOptions): Promise<PaginatedResult<PublicColor>> {
    const offset = (opts.page - 1) * opts.limit;

    const countRows = await db.query<[{ total: number }]>(
      `SELECT COUNT(*) AS total FROM colores WHERE deleted_at IS NULL`,
    );
    const total = Number(countRows[0]?.total ?? 0);

    interface ColorJoinRow {
      uuid: string; nombre: string;
      archivo_uuid: string | null; slug: string | null;
      alt: string | null; title: string | null;
      created_at: Date; updated_at: Date;
    }
    const rows = await db.query<ColorJoinRow[]>(
      `SELECT c.uuid, c.nombre,
              a.uuid AS archivo_uuid, a.slug, a.alt, a.title,
              c.created_at, c.updated_at
       FROM colores c
       LEFT JOIN archivos a ON a.id = c.imagen_id AND a.deleted_at IS NULL
       WHERE c.deleted_at IS NULL
       ORDER BY c.nombre ASC
       LIMIT ? OFFSET ?`,
      [opts.limit, offset],
    );

    return {
      data: rows.map(r => ({
        uuid:        r.uuid,
        nombre:      r.nombre,
        imagen_url:  r.slug ? buildUrl(r.slug) : null,
        imagen_uuid: r.archivo_uuid ?? null,
        created_at:  r.created_at,
        updated_at:  r.updated_at,
      })),
      meta: { total, page: opts.page, limit: opts.limit, totalPages: Math.ceil(total / opts.limit) },
    };
  }

  async listColoresAll(): Promise<PublicColor[]> {
    interface ColorJoinRow {
      uuid: string; nombre: string;
      archivo_uuid: string | null; slug: string | null;
      alt: string | null; title: string | null;
      created_at: Date; updated_at: Date;
    }
    const rows = await db.query<ColorJoinRow[]>(
      `SELECT c.uuid, c.nombre,
              a.uuid AS archivo_uuid, a.slug, a.alt, a.title,
              c.created_at, c.updated_at
       FROM colores c
       LEFT JOIN archivos a ON a.id = c.imagen_id AND a.deleted_at IS NULL
       WHERE c.deleted_at IS NULL
       ORDER BY c.nombre ASC`,
    );
    return rows.map(r => ({
      uuid:        r.uuid,
      nombre:      r.nombre,
      imagen_url:  r.slug ? buildUrl(r.slug) : null,
      imagen_uuid: r.archivo_uuid ?? null,
      created_at:  r.created_at,
      updated_at:  r.updated_at,
    }));
  }

  async findColorByUuid(uuid: string): Promise<PublicColor> {
    interface ColorJoinRow {
      uuid: string; nombre: string;
      archivo_uuid: string | null; slug: string | null;
      alt: string | null; title: string | null;
      created_at: Date; updated_at: Date;
    }
    const rows = await db.query<ColorJoinRow[]>(
      `SELECT c.uuid, c.nombre,
              a.uuid AS archivo_uuid, a.slug, a.alt, a.title,
              c.created_at, c.updated_at
       FROM colores c
       LEFT JOIN archivos a ON a.id = c.imagen_id AND a.deleted_at IS NULL
       WHERE c.uuid = ? AND c.deleted_at IS NULL`,
      [uuid],
    );
    if (!rows[0]) throw new AppError('Color no encontrado.', 404, 'NOT_FOUND');
    const r = rows[0];
    return {
      uuid:        r.uuid,
      nombre:      r.nombre,
      imagen_url:  r.slug ? buildUrl(r.slug) : null,
      imagen_uuid: r.archivo_uuid ?? null,
      created_at:  r.created_at,
      updated_at:  r.updated_at,
    };
  }

  async createColor(nombre: string, imagenId: number | null): Promise<PublicColor> {
    const uuid = randomUUID();
    await db.query<UpsertResult>(`INSERT INTO colores (uuid, nombre, imagen_id) VALUES (?, ?, ?)`, [uuid, nombre, imagenId]);
    return this.findColorByUuid(uuid);
  }

  async updateColor(uuid: string, nombre?: string, imagenId?: number | null): Promise<PublicColor> {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (nombre   !== undefined) { sets.push('nombre = ?');    params.push(nombre); }
    if (imagenId !== undefined) { sets.push('imagen_id = ?'); params.push(imagenId); }
    if (!sets.length) throw new AppError('No hay campos para actualizar.', 400, 'VALIDATION_ERROR');
    params.push(uuid);
    await db.query<UpsertResult>(`UPDATE colores SET ${sets.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`, params);
    return this.findColorByUuid(uuid);
  }

  async deleteColor(uuid: string): Promise<void> {
    const rows = await db.query<{ id: number }[]>(`SELECT id FROM colores WHERE uuid = ? AND deleted_at IS NULL`, [uuid]);
    if (!rows[0]) throw new AppError('Color no encontrado.', 404, 'NOT_FOUND');
    await db.query<UpsertResult>(`UPDATE colores SET deleted_at = NOW() WHERE id = ?`, [rows[0].id]);
  }

  // ══ Condiciones / Garantías ═══════════════════════════════════════════════════

  async listCondiciones(): Promise<Array<{ uuid: string; nombre: string }>> {
    return db.query<Array<{ uuid: string; nombre: string }>>(
      `SELECT uuid, nombre FROM productos_condiciones WHERE deleted_at IS NULL ORDER BY id ASC`,
    );
  }

  async listGarantias(): Promise<Array<{ uuid: string; nombre: string }>> {
    return db.query<Array<{ uuid: string; nombre: string }>>(
      `SELECT uuid, nombre FROM productos_garantias WHERE deleted_at IS NULL ORDER BY id ASC`,
    );
  }

  // ══ Plantillas de atributos ═══════════════════════════════════════════════════

  async listAtributos(opts: PaginationOptions): Promise<PaginatedResult<PublicAtributoPlantilla>> {
    const offset = (opts.page - 1) * opts.limit;
    const countRows = await db.query<[{ total: number }]>(`SELECT COUNT(*) AS total FROM productos_atributos WHERE deleted_at IS NULL`);
    const total = Number(countRows[0]?.total ?? 0);

    interface AtribRow { uuid: string; nombre: string; atributos: string; created_at: Date; updated_at: Date; }
    const rows = await db.query<AtribRow[]>(
      `SELECT uuid, nombre, atributos, created_at, updated_at FROM productos_atributos WHERE deleted_at IS NULL ORDER BY nombre ASC LIMIT ? OFFSET ?`,
      [opts.limit, offset],
    );
    return {
      data: rows.map(r => ({ uuid: r.uuid, nombre: r.nombre, atributos: parseJson<Record<string, string>>(r.atributos) ?? {}, created_at: r.created_at, updated_at: r.updated_at })),
      meta: { total, page: opts.page, limit: opts.limit, totalPages: Math.ceil(total / opts.limit) },
    };
  }

  async listAtributosAll(): Promise<PublicAtributoPlantilla[]> {
    interface AtribRow { uuid: string; nombre: string; atributos: string; created_at: Date; updated_at: Date; }
    const rows = await db.query<AtribRow[]>(`SELECT uuid, nombre, atributos, created_at, updated_at FROM productos_atributos WHERE deleted_at IS NULL ORDER BY nombre ASC`);
    return rows.map(r => ({ uuid: r.uuid, nombre: r.nombre, atributos: parseJson<Record<string, string>>(r.atributos) ?? {}, created_at: r.created_at, updated_at: r.updated_at }));
  }

  async findAtributoByUuid(uuid: string): Promise<PublicAtributoPlantilla> {
    interface AtribRow { uuid: string; nombre: string; atributos: string; created_at: Date; updated_at: Date; }
    const rows = await db.query<AtribRow[]>(`SELECT uuid, nombre, atributos, created_at, updated_at FROM productos_atributos WHERE uuid = ? AND deleted_at IS NULL`, [uuid]);
    if (!rows[0]) throw new AppError('Plantilla de atributos no encontrada.', 404, 'NOT_FOUND');
    return { uuid: rows[0].uuid, nombre: rows[0].nombre, atributos: parseJson<Record<string, string>>(rows[0].atributos) ?? {}, created_at: rows[0].created_at, updated_at: rows[0].updated_at };
  }

  async createAtributo(nombre: string, atributos: Record<string, string>): Promise<PublicAtributoPlantilla> {
    const uuid = randomUUID();
    await db.query<UpsertResult>(`INSERT INTO productos_atributos (uuid, nombre, atributos) VALUES (?, ?, ?)`, [uuid, nombre, JSON.stringify(atributos)]);
    return this.findAtributoByUuid(uuid);
  }

  async updateAtributo(uuid: string, nombre?: string, atributos?: Record<string, string>): Promise<PublicAtributoPlantilla> {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (nombre    !== undefined) { sets.push('nombre = ?');    params.push(nombre); }
    if (atributos !== undefined) { sets.push('atributos = ?'); params.push(JSON.stringify(atributos)); }
    if (!sets.length) throw new AppError('No hay campos para actualizar.', 400, 'VALIDATION_ERROR');
    params.push(uuid);
    await db.query<UpsertResult>(`UPDATE productos_atributos SET ${sets.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`, params);
    return this.findAtributoByUuid(uuid);
  }

  async deleteAtributo(uuid: string): Promise<void> {
    const rows = await db.query<{ id: number }[]>(`SELECT id FROM productos_atributos WHERE uuid = ? AND deleted_at IS NULL`, [uuid]);
    if (!rows[0]) throw new AppError('Plantilla de atributos no encontrada.', 404, 'NOT_FOUND');
    await db.query<UpsertResult>(`UPDATE productos_atributos SET deleted_at = NOW() WHERE id = ?`, [rows[0].id]);
  }

  // ══ Productos ══════════════════════════════════════════════════════════════════

  async listProductos(opts: PaginationOptions): Promise<PaginatedResult<PublicProductoListItem>> {
    const offset = (opts.page - 1) * opts.limit;
    const countRows = await db.query<[{ total: number }]>(`SELECT COUNT(*) AS total FROM productos WHERE deleted_at IS NULL`);
    const total = Number(countRows[0]?.total ?? 0);

    interface ListRow {
      uuid: string; nombre: string; marca: string | null; estado: string;
      condicion: string | null; num_variantes: number;
      preview_slug: string | null; created_at: Date; updated_at: Date;
    }
    const rows = await db.query<ListRow[]>(
      `SELECT p.uuid, p.nombre, p.marca, p.estado,
              cond.nombre AS condicion,
              (SELECT COUNT(*) FROM productos_colores pc WHERE pc.producto_id = p.id AND pc.deleted_at IS NULL) AS num_variantes,
              (SELECT a.slug FROM productos_imagenes pi
               JOIN archivos a ON a.id = pi.archivo_id
               WHERE pi.producto_id = p.id AND pi.deleted_at IS NULL AND a.deleted_at IS NULL
               ORDER BY pi.orden ASC LIMIT 1) AS preview_slug,
              p.created_at, p.updated_at
       FROM productos p
       LEFT JOIN productos_condiciones cond ON cond.id = p.condicion_id
       WHERE p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [opts.limit, offset],
    );
    return {
      data: rows.map(r => ({
        uuid: r.uuid, nombre: r.nombre, marca: r.marca, condicion: r.condicion,
        estado: r.estado, num_variantes: Number(r.num_variantes),
        preview_url: r.preview_slug ? buildUrl(r.preview_slug) : null,
        created_at: r.created_at, updated_at: r.updated_at,
      })),
      meta: { total, page: opts.page, limit: opts.limit, totalPages: Math.ceil(total / opts.limit) },
    };
  }

  async findProductoByUuid(uuid: string): Promise<PublicProducto> {
    interface ProdRow {
      id: number; uuid: string; nombre: string; descripcion: string | null;
      marca: string | null; estado: string;
      condicion_uuid: string | null; condicion: string | null;
      garantia_uuid: string | null; garantia: string | null;
      atributos_uuid: string | null; atributos_plantilla: string | null;
      atributos: string | null;
      created_at: Date; updated_at: Date;
    }
    const rows = await db.query<ProdRow[]>(
      `SELECT p.id, p.uuid, p.nombre, p.descripcion, p.marca, p.estado,
              cond.uuid AS condicion_uuid, cond.nombre AS condicion,
              gar.uuid  AS garantia_uuid,  gar.nombre  AS garantia,
              pa.uuid   AS atributos_uuid, pa.atributos AS atributos_plantilla,
              p.atributos,
              p.created_at, p.updated_at
       FROM productos p
       LEFT JOIN productos_condiciones cond ON cond.id = p.condicion_id
       LEFT JOIN productos_garantias   gar  ON gar.id  = p.garantia_id
       LEFT JOIN productos_atributos   pa   ON pa.id   = p.atributos_id
       WHERE p.uuid = ? AND p.deleted_at IS NULL`,
      [uuid],
    );
    if (!rows[0]) throw new AppError('Producto no encontrado.', 404, 'NOT_FOUND');
    const row     = rows[0];
    const variantes = await this._loadVariantes(row.id);
    return {
      uuid:               row.uuid,
      nombre:             row.nombre,
      descripcion:        row.descripcion,
      marca:              row.marca,
      condicion_uuid:     row.condicion_uuid,
      condicion:          row.condicion,
      garantia_uuid:      row.garantia_uuid,
      garantia:           row.garantia,
      atributos_uuid:     row.atributos_uuid,
      atributos_plantilla: row.atributos_plantilla ? parseJson<Record<string, string>>(row.atributos_plantilla) : null,
      atributos:          parseJson<Record<string, unknown>>(row.atributos),
      estado:             row.estado as 'activo' | 'inactivo',
      variantes,
      created_at:         row.created_at,
      updated_at:         row.updated_at,
    };
  }

  private async _loadVariantes(productoId: number): Promise<PublicVariante[]> {
    interface VarRow {
      uuid: string; precio: number; descuento: number; stock: number;
      color_uuid: string | null; color_nombre: string | null; color_img_slug: string | null;
      moneda_uuid: string | null; moneda_codigo: string | null; moneda_nombre: string | null;
      created_at: Date; updated_at: Date;
    }
    const rows = await db.query<VarRow[]>(
      `SELECT pc.uuid, pc.precio, pc.descuento, pc.stock,
              c.uuid   AS color_uuid,   c.nombre AS color_nombre,
              ca.slug  AS color_img_slug,
              m.uuid   AS moneda_uuid,  m.codigo AS moneda_codigo, m.nombre AS moneda_nombre,
              pc.created_at, pc.updated_at
       FROM productos_colores pc
       LEFT JOIN colores  c  ON c.id  = pc.color_id  AND c.deleted_at IS NULL
       LEFT JOIN archivos ca ON ca.id = c.imagen_id  AND ca.deleted_at IS NULL
       LEFT JOIN monedas  m  ON m.id  = pc.moneda_id
       WHERE pc.producto_id = ? AND pc.deleted_at IS NULL
       ORDER BY pc.created_at ASC`,
      [productoId],
    );

    const result: PublicVariante[] = [];
    for (const r of rows) {
      const imagenes = await this._loadImagenesVariante(productoId, r.color_uuid);
      result.push({
        uuid:             r.uuid,
        color_uuid:       r.color_uuid,
        color_nombre:     r.color_nombre,
        color_imagen_url: r.color_img_slug ? buildUrl(r.color_img_slug) : null,
        moneda_uuid:      r.moneda_uuid,
        moneda_codigo:    r.moneda_codigo,
        moneda_nombre:    r.moneda_nombre,
        precio:           Number(r.precio),
        descuento:        Number(r.descuento),
        stock:            Number(r.stock),
        imagenes,
        created_at:       r.created_at,
        updated_at:       r.updated_at,
      });
    }
    return result;
  }

  private async _loadImagenesVariante(productoId: number, colorUuid: string | null): Promise<VarianteImagenItem[]> {
    interface ImgRow { uuid: string; orden: number; archivo_uuid: string; slug: string; alt: string | null; title: string | null; }
    let rows: ImgRow[];
    if (colorUuid) {
      rows = await db.query<ImgRow[]>(
        `SELECT pi.uuid, pi.orden, a.uuid AS archivo_uuid, a.slug, a.alt, a.title
         FROM productos_imagenes pi
         JOIN archivos a ON a.id = pi.archivo_id AND a.deleted_at IS NULL
         JOIN colores c  ON c.uuid = ? AND c.id = pi.color_id
         WHERE pi.producto_id = ? AND pi.deleted_at IS NULL
         ORDER BY pi.orden ASC`,
        [colorUuid, productoId],
      );
    } else {
      rows = await db.query<ImgRow[]>(
        `SELECT pi.uuid, pi.orden, a.uuid AS archivo_uuid, a.slug, a.alt, a.title
         FROM productos_imagenes pi
         JOIN archivos a ON a.id = pi.archivo_id AND a.deleted_at IS NULL
         WHERE pi.producto_id = ? AND pi.color_id IS NULL AND pi.deleted_at IS NULL
         ORDER BY pi.orden ASC`,
        [productoId],
      );
    }
    return rows.map(r => ({ uuid: r.uuid, archivo_uuid: r.archivo_uuid, url: buildUrl(r.slug), alt: r.alt, title: r.title, orden: r.orden }));
  }

  async createProducto(dto: {
    nombre: string; descripcion?: string | null; marca?: string | null;
    condicion_uuid?: string | null; garantia_uuid?: string | null;
    atributos_uuid?: string | null; atributos?: Record<string, unknown> | null;
    estado: string; creadorUuid: string;
    variantes: Array<{
      color_uuid?: string | null; moneda_uuid?: string | null;
      precio: number; descuento: number; stock: number;
      imagenes: Array<{ archivo_uuid: string; orden: number }>;
    }>;
  }): Promise<PublicProducto> {
    const uuid      = randomUUID();
    const condId    = await this._resolveLookupId('productos_condiciones', dto.condicion_uuid);
    const garId     = await this._resolveLookupId('productos_garantias',   dto.garantia_uuid);
    const atribId   = await this._resolveLookupId('productos_atributos',   dto.atributos_uuid);
    const creadorId = await this._resolveUserId(dto.creadorUuid);

    const result = await db.query<UpsertResult>(
      `INSERT INTO productos (uuid, nombre, descripcion, marca, condicion_id, garantia_id, atributos_id, atributos, estado, usuario_creador_id, usuario_update_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, dto.nombre, dto.descripcion ?? null, dto.marca ?? null, condId, garId, atribId,
       dto.atributos ? JSON.stringify(dto.atributos) : null, dto.estado, creadorId, creadorId],
    );
    const productoId = Number(result.insertId);

    for (const v of dto.variantes) {
      await this._insertVariante(productoId, v);
    }
    return this.findProductoByUuid(uuid);
  }

  private async _insertVariante(
    productoId: number,
    v: {
      color_uuid?: string | null; moneda_uuid?: string | null;
      precio: number; descuento: number; stock: number;
      imagenes: Array<{ archivo_uuid: string; orden: number }>;
    },
  ): Promise<void> {
    const varUuid  = randomUUID();
    const colorId  = await this._resolveLookupId('colores', v.color_uuid);
    const monedaId = await this._resolveLookupId('monedas', v.moneda_uuid);

    await db.query<UpsertResult>(
      `INSERT INTO productos_colores (uuid, producto_id, color_id, moneda_id, precio, descuento, stock) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [varUuid, productoId, colorId, monedaId, v.precio, v.descuento, v.stock],
    );

    for (let i = 0; i < v.imagenes.length; i++) {
      const img = v.imagenes[i];
      if (!img) continue;
      const archivoId = await this.resolveArchivoId(img.archivo_uuid);
      if (!archivoId) continue;
      await db.query<UpsertResult>(
        `INSERT INTO productos_imagenes (uuid, producto_id, archivo_id, color_id, orden) VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), productoId, archivoId, colorId, img.orden ?? i],
      );
    }
  }

  async updateProducto(
    uuid: string,
    dto: {
      nombre?: string; descripcion?: string | null; marca?: string | null;
      condicion_uuid?: string | null; garantia_uuid?: string | null;
      atributos_uuid?: string | null; atributos?: Record<string, unknown> | null;
      estado?: string; updaterUuid: string;
      variantes?: Array<{
        uuid?: string;
        color_uuid?: string | null; moneda_uuid?: string | null;
        precio: number; descuento: number; stock: number;
        imagenes: Array<{ archivo_uuid: string; orden: number }>;
      }>;
    },
  ): Promise<PublicProducto> {
    const prodRows = await db.query<{ id: number }[]>(`SELECT id FROM productos WHERE uuid = ? AND deleted_at IS NULL`, [uuid]);
    if (!prodRows[0]) throw new AppError('Producto no encontrado.', 404, 'NOT_FOUND');
    const productoId = prodRows[0].id;
    const updaterId  = await this._resolveUserId(dto.updaterUuid);

    const sets: string[] = ['usuario_update_id = ?'];
    const params: unknown[] = [updaterId];

    if (dto.nombre      !== undefined) { sets.push('nombre = ?');      params.push(dto.nombre); }
    if (dto.descripcion !== undefined) { sets.push('descripcion = ?'); params.push(dto.descripcion); }
    if (dto.marca       !== undefined) { sets.push('marca = ?');       params.push(dto.marca); }
    if (dto.estado      !== undefined) { sets.push('estado = ?');      params.push(dto.estado); }
    if (dto.condicion_uuid !== undefined) {
      sets.push('condicion_id = ?');
      params.push(await this._resolveLookupId('productos_condiciones', dto.condicion_uuid));
    }
    if (dto.garantia_uuid !== undefined) {
      sets.push('garantia_id = ?');
      params.push(await this._resolveLookupId('productos_garantias', dto.garantia_uuid));
    }
    if (dto.atributos_uuid !== undefined) {
      sets.push('atributos_id = ?');
      params.push(await this._resolveLookupId('productos_atributos', dto.atributos_uuid));
    }
    if (dto.atributos !== undefined) {
      sets.push('atributos = ?');
      params.push(dto.atributos ? JSON.stringify(dto.atributos) : null);
    }

    params.push(uuid);
    await db.query<UpsertResult>(`UPDATE productos SET ${sets.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`, params);

    if (dto.variantes !== undefined) {
      await this._syncVariantes(productoId, dto.variantes);
    }
    return this.findProductoByUuid(uuid);
  }

  private async _syncVariantes(
    productoId: number,
    variantes: Array<{
      uuid?: string;
      color_uuid?: string | null; moneda_uuid?: string | null;
      precio: number; descuento: number; stock: number;
      imagenes: Array<{ archivo_uuid: string; orden: number }>;
    }>,
  ): Promise<void> {
    const incomingUuids = variantes.filter(v => v.uuid).map(v => v.uuid as string);

    if (incomingUuids.length > 0) {
      const ph = incomingUuids.map(() => '?').join(', ');
      await db.query<UpsertResult>(
        `UPDATE productos_colores SET deleted_at = NOW() WHERE producto_id = ? AND deleted_at IS NULL AND uuid NOT IN (${ph})`,
        [productoId, ...incomingUuids],
      );
    } else {
      await db.query<UpsertResult>(
        `UPDATE productos_colores SET deleted_at = NOW() WHERE producto_id = ? AND deleted_at IS NULL`,
        [productoId],
      );
    }

    for (const v of variantes) {
      if (v.uuid) {
        const colorId  = await this._resolveLookupId('colores', v.color_uuid);
        const monedaId = await this._resolveLookupId('monedas', v.moneda_uuid);
        await db.query<UpsertResult>(
          `UPDATE productos_colores SET color_id=?, moneda_id=?, precio=?, descuento=?, stock=? WHERE uuid=? AND deleted_at IS NULL`,
          [colorId, monedaId, v.precio, v.descuento, v.stock, v.uuid],
        );
        await this._syncImagenesVariante(productoId, colorId, v.imagenes);
      } else {
        await this._insertVariante(productoId, v);
      }
    }
  }

  private async _syncImagenesVariante(
    productoId: number,
    colorId: number | null,
    imagenes: Array<{ archivo_uuid: string; orden: number }>,
  ): Promise<void> {
    if (colorId !== null) {
      await db.query<UpsertResult>(
        `UPDATE productos_imagenes SET deleted_at = NOW() WHERE producto_id = ? AND color_id = ? AND deleted_at IS NULL`,
        [productoId, colorId],
      );
    } else {
      await db.query<UpsertResult>(
        `UPDATE productos_imagenes SET deleted_at = NOW() WHERE producto_id = ? AND color_id IS NULL AND deleted_at IS NULL`,
        [productoId],
      );
    }
    for (let i = 0; i < imagenes.length; i++) {
      const img = imagenes[i];
      if (!img) continue;
      const archivoId = await this.resolveArchivoId(img.archivo_uuid);
      if (!archivoId) continue;
      await db.query<UpsertResult>(
        `INSERT INTO productos_imagenes (uuid, producto_id, archivo_id, color_id, orden) VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), productoId, archivoId, colorId, img.orden ?? i],
      );
    }
  }

  async deleteProducto(uuid: string): Promise<void> {
    const rows = await db.query<{ id: number }[]>(`SELECT id FROM productos WHERE uuid = ? AND deleted_at IS NULL`, [uuid]);
    if (!rows[0]) throw new AppError('Producto no encontrado.', 404, 'NOT_FOUND');
    await db.query<UpsertResult>(`UPDATE productos SET deleted_at = NOW() WHERE id = ?`, [rows[0].id]);
  }
}
