import { v4 as uuidv4 } from 'uuid';
import { BannerRepository } from './banner.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import type { PaginatedResult, PaginationOptions, PublicBanner } from '../../shared/types/index.js';
import type { CreateBannerDTO } from './dtos/create-banner.dto.js';
import type { UpdateBannerDTO } from './dtos/update-banner.dto.js';

export class BannerService {
  private readonly repo: BannerRepository;
  private readonly archivoService: ArchivoService;

  constructor() {
    this.repo = new BannerRepository();
    this.archivoService = new ArchivoService();
  }

  /**
   * Paginated banner list.
   */
  async list(opts: PaginationOptions): Promise<PaginatedResult<PublicBanner>> {
    return this.repo.findAll(opts);
  }

  /**
   * Get a single banner by UUID.
   */
  async findByUuid(uuid: string): Promise<PublicBanner> {
    return this.repo.findByUuid(uuid);
  }

  /**
   * Create a new banner.
   * If `imagen` base64 is provided, it is uploaded as an archivo first
   * and the resulting id is stored as the id_imagen FK.
   */
  async create(dto: CreateBannerDTO): Promise<PublicBanner> {
    let id_imagen: number | null = null;

    if (dto.imagen) {
      const archivo = await this.archivoService.create({
        imagen: dto.imagen,
        alt: dto.imagen_alt ?? null,
        title: dto.imagen_title ?? dto.pagina,
      });
      id_imagen = archivo.id;
    }

    return this.repo.create({
      uuid: uuidv4(),
      pagina: dto.pagina,
      id_imagen,
      h1: dto.h1,
      texto_1: dto.texto_1 ?? null,
      texto_2: dto.texto_2 ?? null,
      btn_texto: dto.btn_texto ?? null,
      btn_link: dto.btn_link ?? null,
      orden: dto.orden,
    });
  }

  /**
   * Partial update of a banner.
   * If a new `imagen` base64 is provided a new archivo is created and the FK
   * is updated. The old archivo is NOT deleted (it may be referenced elsewhere).
   */
  async update(uuid: string, dto: UpdateBannerDTO): Promise<PublicBanner> {
    // Ensure the banner actually exists before proceeding.
    await this.repo.findByUuid(uuid);

    const fields: Parameters<BannerRepository['update']>[1] = {};

    if (dto.pagina !== undefined) fields.pagina = dto.pagina;
    if (dto.h1 !== undefined) fields.h1 = dto.h1;
    if (dto.texto_1 !== undefined) fields.texto_1 = dto.texto_1 ?? null;
    if (dto.texto_2 !== undefined) fields.texto_2 = dto.texto_2 ?? null;
    if (dto.btn_texto !== undefined) fields.btn_texto = dto.btn_texto ?? null;
    if (dto.btn_link !== undefined) fields.btn_link = dto.btn_link ?? null;
    if (dto.orden !== undefined) fields.orden = dto.orden;

    if (dto.imagen !== undefined) {
      const currentBanner = await this.repo.findRawByUuid(uuid);

      const archivo = await this.archivoService.create({
        imagen: dto.imagen,
        alt: dto.imagen_alt ?? null,
        title: dto.imagen_title ?? dto.pagina ?? undefined,
      });
      fields.id_imagen = archivo.id;

      // Soft-delete old archivo if it is being replaced
      if (currentBanner.id_imagen !== null) {
        const oldArchivo = await this.archivoService['repo'].findById(
          currentBanner.id_imagen,
        );
        if (oldArchivo) {
          await this.archivoService.delete(oldArchivo.uuid);
        }
      }
    }

    return this.repo.update(uuid, fields);
  }

  /**
   * Soft-delete a banner.
   */
  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }
}
