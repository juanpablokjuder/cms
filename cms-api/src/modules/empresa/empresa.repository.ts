import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/connection.js';
import { AppError } from '../../shared/utils/app-error.js';
import type { UpsertResult } from '../../database/connection.js';

export interface EmpresaRow {
  id: number;
  uuid: string;
  nombre: string;
  telefono: string | null;
  mail: string | null;
  direccion: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type PublicEmpresa = Omit<EmpresaRow, 'id' | 'deleted_at'>;

const SELECT = `uuid, nombre, telefono, mail, direccion, created_at, updated_at`;

export class EmpresaRepository {

  async findActive(): Promise<PublicEmpresa | null> {
    const rows = await db.query<PublicEmpresa[]>(
      `SELECT ${SELECT} FROM empresa WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1`,
    );
    return rows[0] ?? null;
  }

  async findRawActive(): Promise<EmpresaRow | null> {
    const rows = await db.query<EmpresaRow[]>(
      `SELECT id, ${SELECT}, deleted_at FROM empresa WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1`,
    );
    return rows[0] ?? null;
  }

  async findByUuid(uuid: string): Promise<PublicEmpresa> {
    const rows = await db.query<PublicEmpresa[]>(
      `SELECT ${SELECT} FROM empresa WHERE uuid = ? AND deleted_at IS NULL LIMIT 1`,
      [uuid],
    );
    if (!rows.length) throw AppError.notFound('Empresa');
    return rows[0] as PublicEmpresa;
  }

  async create(data: {
    nombre: string;
    telefono: string | null;
    mail: string | null;
    direccion: string | null;
  }): Promise<PublicEmpresa> {
    const uuid = uuidv4();
    await db.query(
      `INSERT INTO empresa (uuid, nombre, telefono, mail, direccion) VALUES (?, ?, ?, ?, ?)`,
      [uuid, data.nombre, data.telefono, data.mail, data.direccion],
    );
    return this.findByUuid(uuid);
  }

  async update(
    uuid: string,
    fields: Partial<{ nombre: string; telefono: string | null; mail: string | null; direccion: string | null }>,
  ): Promise<PublicEmpresa> {
    const setClauses: string[] = [];
    const params: unknown[]    = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) { setClauses.push(`${key} = ?`); params.push(value); }
    }

    if (setClauses.length > 0) {
      params.push(uuid);
      await db.query(
        `UPDATE empresa SET ${setClauses.join(', ')} WHERE uuid = ? AND deleted_at IS NULL`,
        params,
      );
    }

    return this.findByUuid(uuid);
  }

  async softDelete(uuid: string): Promise<void> {
    const result = await db.query<UpsertResult>(
      `UPDATE empresa SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL`,
      [uuid],
    );
    if (Number(result.affectedRows) === 0) throw AppError.notFound('Empresa');
  }
}
