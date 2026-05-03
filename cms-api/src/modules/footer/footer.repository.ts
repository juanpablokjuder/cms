import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import { env } from '../../config/env.js';
import type { UpsertResult } from '../../database/connection.js';
import type {
  FooterRow,
  FooterColumnaRow,
  FooterColumnaTipo,
  PublicFooter,
  PublicFooterColumna,
  PublicFooterRed,
  PublicFooterLegal,
  FooterMediaTextoData,
  FooterListaEnlacesData,
  FooterContactoData,
  PaginatedResult,
  PaginationOptions,
} from '../../shared/types/index.js';

function buildImageUrl(slug: string | null): string | null {
  return slug ? `${env.PUBLIC_API_URL}${env.API_PREFIX}/archivos/${slug}` : null;
}

export class FooterRepository {

  // ─── Read ──────────────────────────────────────────────────────────────────

  async findAll(opts: PaginationOptions): Promise<PaginatedResult<PublicFooter>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const countRows = await db.query<[{ total: number }]>(
      'SELECT COUNT(*) AS total FROM footer WHERE deleted_at IS NULL',
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await db.query<FooterRow[]>(
      `SELECT id, uuid, columnas_count, copyright_text, created_at, updated_at
         FROM footer WHERE deleted_at IS NULL
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    const data = await Promise.all(rows.map((r) => this.hydrate(r)));
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByUuid(uuid: string): Promise<PublicFooter> {
    const rows = await db.query<FooterRow[]>(
      `SELECT id, uuid, columnas_count, copyright_text, created_at, updated_at
         FROM footer WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Footer');
    return this.hydrate(rows[0] as FooterRow);
  }

  /**
   * Devuelve el footer más recientemente creado (no eliminado).
   * Retorna null si aún no existe ningún footer.
   * Usado por el módulo web.
   */
  async findLatest(): Promise<PublicFooter | null> {
    const rows = await db.query<FooterRow[]>(
      `SELECT id, uuid, columnas_count, copyright_text, created_at, updated_at
         FROM footer WHERE deleted_at IS NULL
         ORDER BY created_at DESC LIMIT 1`,
    );
    if (rows.length === 0) return null;
    return this.hydrate(rows[0] as FooterRow);
  }

  async findRawByUuid(uuid: string): Promise<FooterRow> {
    const rows = await db.query<FooterRow[]>(
      `SELECT id, uuid, columnas_count, copyright_text, deleted_at, created_at, updated_at
         FROM footer WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`,
      [uuid],
    );
    if (rows.length === 0) throw AppError.notFound('Footer');
    return rows[0] as FooterRow;
  }

  /** Assembles the full PublicFooter from multiple queries. */
  private async hydrate(row: FooterRow): Promise<PublicFooter> {
    const [columnas, redes, legales] = await Promise.all([
      this.loadColumnas(row.id),
      this.loadRedes(row.id),
      this.loadLegales(row.id),
    ]);

    return {
      uuid:           row.uuid,
      columnas_count: row.columnas_count,
      copyright_text: row.copyright_text,
      columnas,
      redes,
      legales,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async loadColumnas(footerId: number): Promise<PublicFooterColumna[]> {
    const cols = await db.query<FooterColumnaRow[]>(
      `SELECT id, footer_id, uuid, tipo, orden
         FROM footer_columnas WHERE footer_id = ? ORDER BY orden ASC`,
      [footerId],
    );

    return Promise.all(cols.map(async (col) => {
      const data = await this.loadColumnaData(col);
      return { uuid: col.uuid, tipo: col.tipo, orden: col.orden, data };
    }));
  }

  private async loadColumnaData(
    col: FooterColumnaRow,
  ): Promise<FooterMediaTextoData | FooterListaEnlacesData | FooterContactoData> {
    if (col.tipo === 'media_texto') {
      const rows = await db.query<{ imagen_slug: string | null; descripcion: string | null }[]>(
        `SELECT a.slug AS imagen_slug, fmt.descripcion
           FROM footer_media_texto fmt
           LEFT JOIN archivos a ON a.id = fmt.id_imagen AND a.deleted_at IS NULL
          WHERE fmt.columna_id = ? LIMIT 1`,
        [col.id],
      );
      const r = rows[0];
      return { imagen: buildImageUrl(r?.imagen_slug ?? null), descripcion: r?.descripcion ?? null };
    }

    if (col.tipo === 'lista_enlaces') {
      const enlaces = await db.query<{ uuid: string; texto: string; url: string; orden: number }[]>(
        `SELECT uuid, texto, url, orden FROM footer_enlaces
          WHERE columna_id = ? ORDER BY orden ASC`,
        [col.id],
      );
      return { enlaces };
    }

    // contacto
    const rows = await db.query<{ direccion: string | null; telefono: string | null; email: string | null }[]>(
      `SELECT direccion, telefono, email FROM footer_contacto WHERE columna_id = ? LIMIT 1`,
      [col.id],
    );
    const r = rows[0];
    return { direccion: r?.direccion ?? null, telefono: r?.telefono ?? null, email: r?.email ?? null };
  }

  private async loadRedes(footerId: number): Promise<PublicFooterRed[]> {
    return db.query<PublicFooterRed[]>(
      `SELECT uuid, nombre, url, svg_icon, orden
         FROM footer_redes WHERE footer_id = ? ORDER BY orden ASC`,
      [footerId],
    );
  }

  private async loadLegales(footerId: number): Promise<PublicFooterLegal[]> {
    return db.query<PublicFooterLegal[]>(
      `SELECT uuid, texto, url, orden FROM footer_legales
        WHERE footer_id = ? ORDER BY orden ASC`,
      [footerId],
    );
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: { uuid: string; columnas_count: number; copyright_text: string | null }): Promise<FooterRow> {
    await db.query(
      'INSERT INTO footer (uuid, columnas_count, copyright_text) VALUES (?, ?, ?)',
      [data.uuid, data.columnas_count, data.copyright_text],
    );
    return this.findRawByUuid(data.uuid);
  }

  async update(
    uuid: string,
    fields: Partial<{ columnas_count: number; copyright_text: string | null }>,
  ): Promise<void> {
    const setClauses: string[] = [];
    const params: unknown[]    = [];
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) { setClauses.push(`${k} = ?`); params.push(v); }
    }
    if (setClauses.length === 0) return;
    params.push(uuid);
    await db.query(
      `UPDATE footer SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
      params,
    );
  }

  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      'UPDATE footer SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
      [uuid],
    );
    if (Number(result.affectedRows) === 0) throw AppError.notFound('Footer');
  }

  // ─── Column replacement (full transactional replace) ──────────────────────

  async replaceColumnas(
    footerId: number,
    columnas: Array<{
      uuid?: string;
      tipo: FooterColumnaTipo;
      orden: number;
      mediaTexto?: { id_imagen: number | null; descripcion: string | null };
      enlaces?: { uuid?: string; texto: string; url: string; orden: number }[];
      contacto?: { direccion: string | null; telefono: string | null; email: string | null };
    }>,
  ): Promise<void> {
    await db.transaction(async (conn) => {
      // Cascade deletes footer_media_texto, footer_enlaces, footer_contacto via FK
      await conn.query('DELETE FROM footer_columnas WHERE footer_id = ?', [footerId]);

      for (const col of columnas) {
        const colUuid = col.uuid ?? uuidv4();
        const result  = await conn.query<UpsertResult>(
          'INSERT INTO footer_columnas (footer_id, uuid, tipo, orden) VALUES (?, ?, ?, ?)',
          [footerId, colUuid, col.tipo, col.orden],
        );
        const colId = Number(result.insertId);

        if (col.tipo === 'media_texto' && col.mediaTexto) {
          await conn.query(
            'INSERT INTO footer_media_texto (columna_id, id_imagen, descripcion) VALUES (?, ?, ?)',
            [colId, col.mediaTexto.id_imagen, col.mediaTexto.descripcion],
          );
        }

        if (col.tipo === 'lista_enlaces' && col.enlaces?.length) {
          const rows  = col.enlaces.map((e) => [colId, e.uuid ?? uuidv4(), e.texto, e.url, e.orden]);
          const phEnl = rows.map(() => '(?, ?, ?, ?, ?)').join(', ');
          await conn.query(
            `INSERT INTO footer_enlaces (columna_id, uuid, texto, url, orden) VALUES ${phEnl}`,
            rows.flat(),
          );
        }

        if (col.tipo === 'contacto' && col.contacto) {
          await conn.query(
            'INSERT INTO footer_contacto (columna_id, direccion, telefono, email) VALUES (?, ?, ?, ?)',
            [colId, col.contacto.direccion, col.contacto.telefono, col.contacto.email],
          );
        }
      }
    });
  }

  async replaceRedes(
    footerId: number,
    redes: { uuid?: string; nombre: string; url: string; svg_icon: string; orden: number }[],
  ): Promise<void> {
    await db.transaction(async (conn) => {
      await conn.query('DELETE FROM footer_redes WHERE footer_id = ?', [footerId]);
      if (!redes.length) return;
      const rows  = redes.map((r) => [footerId, r.uuid ?? uuidv4(), r.nombre, r.url, r.svg_icon, r.orden]);
      const phRed = rows.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
      await conn.query(
        `INSERT INTO footer_redes (footer_id, uuid, nombre, url, svg_icon, orden) VALUES ${phRed}`,
        rows.flat(),
      );
    });
  }

  async replaceLegales(
    footerId: number,
    legales: { uuid?: string; texto: string; url: string; orden: number }[],
  ): Promise<void> {
    await db.transaction(async (conn) => {
      await conn.query('DELETE FROM footer_legales WHERE footer_id = ?', [footerId]);
      if (!legales.length) return;
      const rows  = legales.map((l) => [footerId, l.uuid ?? uuidv4(), l.texto, l.url, l.orden]);
      const phLeg = rows.map(() => '(?, ?, ?, ?, ?)').join(', ');
      await conn.query(
        `INSERT INTO footer_legales (footer_id, uuid, texto, url, orden) VALUES ${phLeg}`,
        rows.flat(),
      );
    });
  }

  async getFooterId(uuid: string): Promise<number> {
    const rows = await db.query<{ id: number }[]>(
      'SELECT id FROM footer WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
      [uuid],
    );
    if (!rows.length) throw AppError.notFound('Footer');
    return rows[0]!.id;
  }
}
