import { v4 as uuidv4 } from 'uuid';
import { FaqRepository } from './faq.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import type { PaginatedResult, PaginationOptions, PublicFaq } from '../../shared/types/index.js';
import type { CreateFaqDTO } from './dtos/create-faq.dto.js';
import type { UpdateFaqDTO, FaqItemUpdateEntry } from './dtos/update-faq.dto.js';

export class FaqService {
  private readonly repo:           FaqRepository;
  private readonly archivoService: ArchivoService;

  constructor() {
    this.repo           = new FaqRepository();
    this.archivoService = new ArchivoService();
  }

  async list(opts: PaginationOptions): Promise<PaginatedResult<PublicFaq>> {
    return this.repo.findAll(opts);
  }

  async findByUuid(uuid: string): Promise<PublicFaq> {
    return this.repo.findByUuid(uuid);
  }

  /**
   * Todos los FAQs sin paginación. Usado por el módulo web.
   */
  async listAllForWeb(): Promise<PublicFaq[]> {
    return this.repo.findAllForWeb();
  }

  async create(dto: CreateFaqDTO): Promise<PublicFaq> {
    // ── Upload image if provided ───────────────────────────────────────────
    let id_imagen: number | null = null;
    if (dto.imagen) {
      const archivo = await this.archivoService.create({
        imagen: dto.imagen,
        alt:    dto.imagen_alt   ?? null,
        title:  dto.imagen_title ?? null,
      });
      id_imagen = archivo.id;
    }

    // ── Create FAQ row ─────────────────────────────────────────────────────
    const faq = await this.repo.create({
      uuid:      uuidv4(),
      titulo:    dto.titulo,
      id_imagen,
    });

    // ── Insert items ───────────────────────────────────────────────────────
    if (dto.items.length > 0) {
      const faqId = await this.repo.getFaqId(faq.uuid);
      await this.repo.replaceItems(
        faqId,
        dto.items.map((item, idx) => ({
          pregunta:  item.pregunta,
          respuesta: item.respuesta,
          orden:     item.orden ?? idx,
        })),
      );
    }

    return this.repo.findByUuid(faq.uuid);
  }

  async update(uuid: string, dto: UpdateFaqDTO): Promise<PublicFaq> {
    const current = await this.repo.findRawByUuid(uuid);

    const fields: Parameters<FaqRepository['update']>[1] = {};

    if (dto.titulo !== undefined) fields.titulo = dto.titulo;

    // ── Image replacement ──────────────────────────────────────────────────
    if (dto.imagen !== undefined) {
      const archivo = await this.archivoService.create({
        imagen: dto.imagen,
        alt:    dto.imagen_alt   ?? null,
        title:  dto.imagen_title ?? null,
      });
      fields.id_imagen = archivo.id;

      // Soft-delete old archivo
      if (current.id_imagen !== null) {
        const oldArchivo = await this.archivoService['repo'].findById(current.id_imagen);
        if (oldArchivo) await this.archivoService.delete(oldArchivo.uuid);
      }
    }

    if (Object.keys(fields).length > 0) {
      await this.repo.update(uuid, fields);
    }

    // ── Replace items when provided ────────────────────────────────────────
    if (dto.items !== undefined) {
      const faqId = await this.repo.getFaqId(uuid);
      const resolved = this.resolveItems(dto.items);
      await this.repo.replaceItems(faqId, resolved);
    }

    return this.repo.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private resolveItems(
    items: FaqItemUpdateEntry[],
  ): { uuid?: string; pregunta: string; respuesta: string; orden: number }[] {
    return items.map((item, idx) => {
      const orden = item.orden ?? idx;
      if ('uuid' in item && item.uuid) {
        return {
          uuid:      item.uuid,
          pregunta:  item.pregunta  ?? '',
          respuesta: item.respuesta ?? '',
          orden,
        };
      }
      return {
        pregunta:  (item as { pregunta: string }).pregunta,
        respuesta: (item as { respuesta: string }).respuesta,
        orden,
      };
    });
  }
}
