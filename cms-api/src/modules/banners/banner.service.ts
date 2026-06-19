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
   * Todos los banners activos sin paginación.
   * Si se provee `pagina`, filtra por ese valor.
   * Usado por el módulo web.
   */
  async listAllForWeb(pagina?: string): Promise<PublicBanner[]> {
    return this.repo.findAllActiveForWeb(pagina);
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
        nombre: dto.imagen_nombre ?? null,
        alt: dto.imagen_alt ?? null,
        title: dto.imagen_title ?? dto.pagina,
      });
      id_imagen = archivo.id;
    }

    const uuid = uuidv4();
    const bannerId = await this.repo.create({
      uuid,
      pagina: dto.pagina,
      id_imagen,
      h1: dto.h1,
      texto_1: dto.texto_1 ?? null,
      texto_2: dto.texto_2 ?? null,
      orden: dto.orden,
    });

    if (dto.botones && dto.botones.length > 0) {
      await this.repo.replaceBotones(bannerId, this.normalizeBotones(dto.botones));
    }

    return this.repo.findByUuid(uuid);
  }

  /**
   * Asegura que cada botón tenga un `orden` secuencial coherente con la posición
   * recibida (si el admin no lo envía explícito) y normaliza la variante.
   */
  private normalizeBotones(
    botones: NonNullable<CreateBannerDTO['botones']>,
  ): Array<{ texto: string; link: string; variante: 'primary' | 'outline'; orden: number }> {
    return botones.map((b, index) => ({
      texto:    b.texto,
      link:     b.link,
      variante: b.variante,
      orden:    b.orden ?? index,
    }));
  }

  /**
   * Partial update of a banner.
   * If a new `imagen` base64 is provided a new archivo is created and the FK
   * is updated. The old archivo is NOT deleted (it may be referenced elsewhere).
   */
  async update(uuid: string, dto: UpdateBannerDTO): Promise<PublicBanner> {
    // Ensure the banner actually exists before proceeding.
    const current = await this.repo.findRawByUuid(uuid);

    const fields: Parameters<BannerRepository['update']>[1] = {};

    if (dto.pagina !== undefined) fields.pagina = dto.pagina;
    if (dto.h1 !== undefined) fields.h1 = dto.h1;
    if (dto.texto_1 !== undefined) fields.texto_1 = dto.texto_1 ?? null;
    if (dto.texto_2 !== undefined) fields.texto_2 = dto.texto_2 ?? null;
    if (dto.orden !== undefined) fields.orden = dto.orden;

    if (dto.imagen !== undefined) {
      const archivo = await this.archivoService.create({
        imagen: dto.imagen,
        nombre: dto.imagen_nombre ?? null,
        alt: dto.imagen_alt ?? null,
        title: dto.imagen_title ?? dto.pagina ?? undefined,
      });
      fields.id_imagen = archivo.id;

      // Soft-delete old archivo if it is being replaced
      if (current.id_imagen !== null) {
        const oldArchivo = await this.archivoService['repo'].findById(
          current.id_imagen,
        );
        if (oldArchivo) {
          await this.archivoService.delete(oldArchivo.uuid);
        }
      }
    }

    await this.repo.update(uuid, fields);

    // Si se envía la lista de botones, reemplaza por completo los existentes.
    if (dto.botones !== undefined) {
      await this.repo.replaceBotones(current.id, this.normalizeBotones(dto.botones));
    }

    return this.repo.findByUuid(uuid);
  }

  /**
   * Soft-delete a banner.
   */
  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }
}
