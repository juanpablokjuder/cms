import { randomUUID } from 'crypto';
import { db } from '../../database/connection.js';
import type { UpsertResult } from '../../database/connection.js';
import type { SeoEntityType, UpsertSeoDTO } from './dtos/upsert-seo.dto.js';

export interface PublicSeoMetadata {
  uuid:             string;
  entity_type:      SeoEntityType;
  entity_uuid:      string;
  title:            string | null;
  meta_description: string | null;
  meta_keywords:    string | null;
  og_title:         string | null;
  og_description:   string | null;
  scripts_head:     string | null;
  scripts_body:     string | null;
  created_at:       Date;
  updated_at:       Date;
}

type SeoRow = PublicSeoMetadata;

export class SeoRepository {

  async findByEntity(entityType: SeoEntityType, entityUuid: string): Promise<PublicSeoMetadata | null> {
    const rows = await db.query<SeoRow[]>(
      `SELECT uuid, entity_type, entity_uuid, title, meta_description, meta_keywords,
              og_title, og_description, scripts_head, scripts_body, created_at, updated_at
       FROM seo_metadata
       WHERE entity_type = ? AND entity_uuid = ?
       LIMIT 1`,
      [entityType, entityUuid],
    );
    return rows[0] ?? null;
  }

  async upsert(entityType: SeoEntityType, entityUuid: string, dto: UpsertSeoDTO): Promise<PublicSeoMetadata> {
    const existing = await this.findByEntity(entityType, entityUuid);

    if (existing) {
      const sets: string[]   = [];
      const params: unknown[] = [];

      if (dto.title            !== undefined) { sets.push('title = ?');            params.push(dto.title); }
      if (dto.meta_description !== undefined) { sets.push('meta_description = ?'); params.push(dto.meta_description); }
      if (dto.meta_keywords    !== undefined) { sets.push('meta_keywords = ?');    params.push(dto.meta_keywords); }
      if (dto.og_title         !== undefined) { sets.push('og_title = ?');         params.push(dto.og_title); }
      if (dto.og_description   !== undefined) { sets.push('og_description = ?');   params.push(dto.og_description); }
      if (dto.scripts_head     !== undefined) { sets.push('scripts_head = ?');     params.push(dto.scripts_head); }
      if (dto.scripts_body     !== undefined) { sets.push('scripts_body = ?');     params.push(dto.scripts_body); }

      if (sets.length) {
        params.push(entityType, entityUuid);
        await db.query<UpsertResult>(
          `UPDATE seo_metadata SET ${sets.join(', ')} WHERE entity_type = ? AND entity_uuid = ?`,
          params,
        );
      }
    } else {
      const uuid = randomUUID();
      await db.query<UpsertResult>(
        `INSERT INTO seo_metadata
           (uuid, entity_type, entity_uuid, title, meta_description, meta_keywords,
            og_title, og_description, scripts_head, scripts_body)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid, entityType, entityUuid,
          dto.title            ?? null,
          dto.meta_description ?? null,
          dto.meta_keywords    ?? null,
          dto.og_title         ?? null,
          dto.og_description   ?? null,
          dto.scripts_head     ?? null,
          dto.scripts_body     ?? null,
        ],
      );
    }

    return (await this.findByEntity(entityType, entityUuid))!;
  }
}
