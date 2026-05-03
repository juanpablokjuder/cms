import { v4 as uuidv4 } from 'uuid';
import { NoticiaRepository } from './noticia.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import { slugify } from '../../shared/utils/slugify.js';
import { AppError } from '../../shared/utils/app-error.js';
import type { PaginatedResult, PaginationOptions, PublicNoticia } from '../../shared/types/index.js';
import type { CreateNoticiaDTO } from './dtos/create-noticia.dto.js';
import type { UpdateNoticiaDTO, ImagenUpdateItem } from './dtos/update-noticia.dto.js';

export class NoticiaService {
  private readonly repo: NoticiaRepository;
  private readonly archivoService: ArchivoService;

  constructor() {
    this.repo           = new NoticiaRepository();
    this.archivoService = new ArchivoService();
  }

  async list(opts: PaginationOptions): Promise<PaginatedResult<PublicNoticia>> {
    return this.repo.findAll(opts);
  }

  async findByUuid(uuid: string): Promise<PublicNoticia> {
    return this.repo.findByUuid(uuid);
  }

  async findBySlug(slug: string): Promise<PublicNoticia> {
    return this.repo.findBySlug(slug);
  }

  async create(dto: CreateNoticiaDTO): Promise<PublicNoticia> {
    // ── Slug resolution ────────────────────────────────────────────────────
    const baseSlug = dto.slug ?? slugify(dto.titulo);
    const slug     = await this.uniqueSlug(baseSlug);

    // ── Create noticia row ─────────────────────────────────────────────────
    const noticia = await this.repo.create({
      uuid:      uuidv4(),
      titulo:    dto.titulo,
      subtitulo: dto.subtitulo ?? null,
      slug,
      texto:     dto.texto,
    });

    // ── Upload and attach images ───────────────────────────────────────────
    if (dto.imagenes.length > 0) {
      const noticiaId = await this.repo.getNoticiaId(noticia.uuid);
      const pivotItems = await this.uploadImagenes(dto.imagenes);
      await this.repo.replaceImagenes(noticiaId, pivotItems);
    }

    return this.repo.findByUuid(noticia.uuid);
  }

  async update(uuid: string, dto: UpdateNoticiaDTO): Promise<PublicNoticia> {
    await this.repo.findByUuid(uuid); // existence check

    // ── Slug uniqueness guard ──────────────────────────────────────────────
    let slug: string | undefined;
    if (dto.slug !== undefined) {
      if (await this.repo.slugExists(dto.slug, uuid)) {
        throw AppError.conflict('A noticia with this slug already exists.');
      }
      slug = dto.slug;
    }

    // ── Update scalar fields ───────────────────────────────────────────────
    await this.repo.update(uuid, {
      ...(dto.titulo     !== undefined ? { titulo:     dto.titulo }          : {}),
      ...(dto.subtitulo  !== undefined ? { subtitulo:  dto.subtitulo ?? null } : {}),
      ...(slug           !== undefined ? { slug }                             : {}),
      ...(dto.texto      !== undefined ? { texto:      dto.texto }            : {}),
    });

    // ── Replace image set when provided ───────────────────────────────────
    if (dto.imagenes !== undefined) {
      const noticiaId  = await this.repo.getNoticiaId(uuid);
      const pivotItems = await this.resolveUpdateImagenes(dto.imagenes);
      await this.repo.replaceImagenes(noticiaId, pivotItems);
    }

    return this.repo.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Upload all new-image DTOs and return pivot-ready rows.
   */
  private async uploadImagenes(
    items: CreateNoticiaDTO['imagenes'],
  ): Promise<{ archivo_id: number; orden: number }[]> {
    return Promise.all(
      items.map(async (item) => {
        const archivo = await this.archivoService.create({
          imagen: item.imagen,
          alt:    item.alt   ?? null,
          title:  item.title ?? null,
        });
        return { archivo_id: archivo.id, orden: item.orden };
      }),
    );
  }

  /**
   * Resolve a mixed update-imagen array into pivot rows.
   * Items with `imagen` (data URI) → new upload.
   * Items with `archivo_uuid`       → resolve existing id.
   */
  private async resolveUpdateImagenes(
    items: ImagenUpdateItem[],
  ): Promise<{ archivo_id: number; orden: number }[]> {
    return Promise.all(
      items.map(async (item) => {
        if ('imagen' in item) {
          const archivo = await this.archivoService.create({
            imagen: item.imagen,
            alt:    item.alt   ?? null,
            title:  item.title ?? null,
          });
          return { archivo_id: archivo.id, orden: item.orden };
        }
        const id = await this.repo.getArchivoIdByUuid(item.archivo_uuid);
        return { archivo_id: id, orden: item.orden };
      }),
    );
  }

  private async uniqueSlug(base: string): Promise<string> {
    const sanitized = base || 'noticia';
    let candidate = sanitized;
    let attempt   = 0;

    while (await this.repo.slugExists(candidate)) {
      attempt++;
      candidate = `${sanitized}-${uuidv4().split('-')[0]}`;
      if (attempt > 5) throw AppError.conflict('Could not generate a unique slug.');
    }

    return candidate;
  }
}
