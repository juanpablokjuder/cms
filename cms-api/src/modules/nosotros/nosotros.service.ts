import { v4 as uuidv4 } from 'uuid';
import { NosotrosRepository } from './nosotros.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import { AppError } from '../../shared/utils/app-error.js';
import type { PublicNosotros } from '../../shared/types/index.js';
import type { CreateNosotrosDTO } from './dtos/create-nosotros.dto.js';
import type { UpdateNosotrosDTO, ImagenUpdateItem } from './dtos/update-nosotros.dto.js';

export class NosotrosService {
  private readonly repo:          NosotrosRepository;
  private readonly archivoService: ArchivoService;

  constructor() {
    this.repo           = new NosotrosRepository();
    this.archivoService = new ArchivoService();
  }

  /** Devuelve el registro singleton o null si todavía no fue creado. */
  async findOne(): Promise<PublicNosotros | null> {
    return this.repo.findOne();
  }

  async create(dto: CreateNosotrosDTO): Promise<PublicNosotros> {
    // Evitar crear un segundo registro singleton
    const existing = await this.repo.findOne();
    if (existing) {
      throw AppError.conflict('El registro "Nosotros" ya existe. Use PATCH para actualizarlo.');
    }

    const nosotros = await this.repo.create({
      uuid:      uuidv4(),
      titulo:    dto.titulo,
      subtitulo: dto.subtitulo ?? null,
      texto:     dto.texto,
    });

    if (dto.imagenes.length > 0) {
      const nosotrosId = await this.repo.getNosotrosId(nosotros.uuid);
      const pivotItems = await this.uploadImagenes(dto.imagenes);
      await this.repo.replaceImagenes(nosotrosId, pivotItems);
    }

    return this.repo.findByUuid(nosotros.uuid);
  }

  async update(dto: UpdateNosotrosDTO): Promise<PublicNosotros> {
    const existing = await this.repo.findOne();
    if (!existing) {
      throw AppError.notFound('Nosotros');
    }

    await this.repo.update(existing.uuid, {
      ...(dto.titulo     !== undefined ? { titulo:    dto.titulo }          : {}),
      ...(dto.subtitulo  !== undefined ? { subtitulo: dto.subtitulo ?? null } : {}),
      ...(dto.texto      !== undefined ? { texto:     dto.texto }            : {}),
    });

    if (dto.imagenes !== undefined) {
      const nosotrosId = await this.repo.getNosotrosId(existing.uuid);
      const pivotItems = await this.resolveUpdateImagenes(dto.imagenes);
      await this.repo.replaceImagenes(nosotrosId, pivotItems);
    }

    return this.repo.findByUuid(existing.uuid);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async uploadImagenes(
    items: CreateNosotrosDTO['imagenes'],
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
}
