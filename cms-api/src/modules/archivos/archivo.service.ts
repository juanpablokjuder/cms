import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/utils/app-error.js';
import { slugify } from '../../shared/utils/slugify.js';
import { ArchivoRepository } from './archivo.repository.js';
import {
  parseDataUri,
  type CreateArchivoDTO,
} from './dtos/create-archivo.dto.js';
import type { UpdateArchivoDTO } from './dtos/update-archivo.dto.js';
import type { ArchivoRow, PublicArchivo } from '../../shared/types/index.js';

/** Resolves the absolute uploads directory path once at startup. */
const UPLOADS_DIR = resolve(env.UPLOADS_DIR);

/** Maps file extension → MIME type for the serving endpoint. */
export const FORMATO_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export class ArchivoService {
  private readonly repo: ArchivoRepository;

  constructor() {
    this.repo = new ArchivoRepository();
  }

  /** Absolute path to the uploads directory. */
  get uploadsDir(): string {
    return UPLOADS_DIR;
  }

  /**
   * Creates an archivo:
   * 1. Parses & validates the data URI.
   * 2. Writes the file to disk.
   * 3. Inserts the row in the DB.
   * Returns the full ArchivoRow (with internal id) for FK linking.
   */
  async create(dto: CreateArchivoDTO): Promise<ArchivoRow> {
    const { formato, buffer } = parseDataUri(dto.imagen);

    // Prioridad para el slug: nombre > title > alt > 'archivo'
    const baseLabel = dto.nombre ?? dto.title ?? dto.alt ?? 'archivo';
    const slug = await this.uniqueSlug(slugify(baseLabel));
    const filename = `${slug}.${formato}`;

    // Ensure uploads directory exists
    await mkdir(UPLOADS_DIR, { recursive: true });

    // Save file to disk first — if DB insert fails we clean up below
    const diskPath = join(UPLOADS_DIR, filename);
    await writeFile(diskPath, buffer);

    try {
      return await this.repo.create({
        uuid: uuidv4(),
        path: filename,
        slug,
        alt: dto.alt ?? null,
        title: dto.title ?? null,
        formato,
      });
    } catch (err) {
      // Rollback: remove the file if DB insert failed
      await unlink(diskPath).catch(() => undefined);
      throw err;
    }
  }

  /**
   * Finds a single archivo by UUID (public projection).
   */
  async findByUuid(uuid: string): Promise<PublicArchivo> {
    return this.repo.findByUuid(uuid);
  }

  /**
   * Finds a single archivo by slug — used by the file-serving endpoint.
   */
  async findBySlug(slug: string): Promise<PublicArchivo> {
    return this.repo.findBySlug(slug);
  }

  /**
   * Updates metadata and optionally replaces the image file.
   * If a new `imagen` base64 is provided:
   *  1. Write new file to disk.
   *  2. Update DB row (path, formato).
   *  3. Delete old file from disk (best effort).
   */
  async update(uuid: string, dto: UpdateArchivoDTO): Promise<PublicArchivo> {
    const current = await this.repo.findByUuid(uuid);

    const fields: Parameters<ArchivoRepository['update']>[1] = {};

    if (dto.alt !== undefined) fields.alt = dto.alt ?? null;
    if (dto.title !== undefined) fields.title = dto.title ?? null;

    if (dto.imagen !== undefined) {
      const { formato, buffer } = parseDataUri(dto.imagen);
      const filename = `${current.slug}.${formato}`;
      const diskPath = join(UPLOADS_DIR, filename);

      await writeFile(diskPath, buffer);

      // Remove old file if extension changed
      if (current.formato !== formato) {
        const oldDiskPath = join(UPLOADS_DIR, current.path);
        await unlink(oldDiskPath).catch(() => undefined);
      }

      fields.path = filename;
      fields.formato = formato;
    }

    return this.repo.update(uuid, fields);
  }

  /**
   * Soft-deletes the DB row. The file is NOT deleted from disk to preserve
   * any external references still in use (can be cleaned up by a cron job).
   */
  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────

  /**
   * Returns a slug guaranteed to be unique in the DB.
   * Appends a short random suffix if the base slug is taken.
   */
  private async uniqueSlug(base: string): Promise<string> {
    const sanitized = base || 'archivo';
    let candidate = sanitized;
    let attempt = 0;

    while (await this.repo.slugExists(candidate)) {
      attempt++;
      candidate = `${sanitized}-${uuidv4().split('-')[0]}`;
      if (attempt > 5) {
        throw AppError.conflict('Could not generate a unique slug for this file.');
      }
    }

    return candidate;
  }
}
