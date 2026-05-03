import { v4 as uuidv4 } from 'uuid';
import { ServicioRepository } from './servicio.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import { AppError } from '../../shared/utils/app-error.js';
import type {
  PublicServicio,
  PublicServicioCategoria,
  PublicServicioItem,
  PublicMoneda,
  PaginationOptions,
  PaginatedResult,
} from '../../shared/types/index.js';
import type { CreateServicioDTO } from './dtos/create-servicio.dto.js';
import type { UpdateServicioDTO } from './dtos/update-servicio.dto.js';
import type { CreateCategoriaDTO } from './dtos/create-categoria.dto.js';
import type { UpdateCategoriaDTO } from './dtos/update-categoria.dto.js';
import type { CreateItemDTO, ImagenItemInputDTO } from './dtos/create-item.dto.js';
import type { UpdateItemDTO, ImagenItemUpdateItem } from './dtos/update-item.dto.js';

export class ServicioService {
  private readonly repo:          ServicioRepository;
  private readonly archivoService: ArchivoService;

  constructor() {
    this.repo           = new ServicioRepository();
    this.archivoService = new ArchivoService();
  }

  // ── Monedas ────────────────────────────────────────────────────────────────

  async listMonedas(): Promise<PublicMoneda[]> {
    return this.repo.findAllMonedas();
  }

  // ── Servicios (singleton) ─────────────────────────────────────────────────

  async getServicio(): Promise<PublicServicio | null> {
    return this.repo.findServicio();
  }

  async createServicio(dto: CreateServicioDTO): Promise<PublicServicio> {
    const existing = await this.repo.findServicio();
    if (existing) throw AppError.conflict('El registro de Servicios ya existe. Use PATCH para actualizar.');
    return this.repo.createServicio({
      uuid:      uuidv4(),
      titulo:    dto.titulo,
      subtitulo: dto.subtitulo ?? null,
    });
  }

  async updateServicio(uuid: string, dto: UpdateServicioDTO): Promise<PublicServicio> {
    const existing = await this.repo.findServicio();
    if (!existing || existing.uuid !== uuid) throw AppError.notFound('Servicios');
    return this.repo.updateServicio(uuid, {
      ...(dto.titulo    !== undefined ? { titulo:    dto.titulo }               : {}),
      ...(dto.subtitulo !== undefined ? { subtitulo: dto.subtitulo ?? null }    : {}),
    });
  }

  // ── Categorías ────────────────────────────────────────────────────────────

  async listCategorias(opts: PaginationOptions): Promise<PaginatedResult<PublicServicioCategoria>> {
    return this.repo.findAllCategorias(opts);
  }

  async findCategoria(uuid: string): Promise<PublicServicioCategoria> {
    return this.repo.findCategoriaByUuid(uuid);
  }

  async createCategoria(dto: CreateCategoriaDTO): Promise<PublicServicioCategoria> {
    return this.repo.createCategoria({
      uuid:   uuidv4(),
      nombre: dto.nombre,
      orden:  dto.orden,
      estado: dto.estado,
    });
  }

  async updateCategoria(uuid: string, dto: UpdateCategoriaDTO): Promise<PublicServicioCategoria> {
    await this.repo.findCategoriaByUuid(uuid); // existence check
    return this.repo.updateCategoria(uuid, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre }         : {}),
      ...(dto.orden  !== undefined ? { orden:  dto.orden }          : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado }         : {}),
    });
  }

  async deleteCategoria(uuid: string): Promise<void> {
    return this.repo.softDeleteCategoria(uuid);
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  async listItems(opts: PaginationOptions): Promise<PaginatedResult<PublicServicioItem>> {
    return this.repo.findAllItems(opts);
  }

  async findItem(uuid: string): Promise<PublicServicioItem> {
    return this.repo.findItemByUuid(uuid);
  }

  async createItem(dto: CreateItemDTO): Promise<PublicServicioItem> {
    // Resolver categoria_id
    let categoria_id: number | null = null;
    if (dto.categoria_uuid) {
      categoria_id = await this.repo.getCategoriaId(dto.categoria_uuid);
    }

    // Resolver moneda_id
    let moneda_id: number | null = null;
    if (dto.moneda_uuid) {
      moneda_id = await this.repo.getMonedaIdByUuid(dto.moneda_uuid);
    }

    const item = await this.repo.createItem({
      uuid:        uuidv4(),
      categoria_id,
      titulo:      dto.titulo,
      subtitulo_1: dto.subtitulo_1 ?? null,
      subtitulo_2: dto.subtitulo_2 ?? null,
      precio:      dto.precio ?? null,
      moneda_id,
      btn_titulo:  dto.btn_titulo ?? null,
      btn_link:    dto.btn_link   ?? null,
      texto:       dto.texto      ?? null,
      estado:      dto.estado,
    });

    if (dto.imagenes.length > 0) {
      const itemId     = await this.repo.getItemId(item.uuid);
      const pivotItems = await this.uploadImagenes(dto.imagenes);
      await this.repo.replaceItemImagenes(itemId, pivotItems);
    }

    return this.repo.findItemByUuid(item.uuid);
  }

  async updateItem(uuid: string, dto: UpdateItemDTO): Promise<PublicServicioItem> {
    await this.repo.findItemByUuid(uuid); // existence check

    const fields: Record<string, unknown> = {};

    if (dto.titulo       !== undefined) fields['titulo']      = dto.titulo;
    if (dto.subtitulo_1  !== undefined) fields['subtitulo_1'] = dto.subtitulo_1 ?? null;
    if (dto.subtitulo_2  !== undefined) fields['subtitulo_2'] = dto.subtitulo_2 ?? null;
    if (dto.precio       !== undefined) fields['precio']      = dto.precio ?? null;
    if (dto.btn_titulo   !== undefined) fields['btn_titulo']  = dto.btn_titulo ?? null;
    if (dto.btn_link     !== undefined) fields['btn_link']    = dto.btn_link   ?? null;
    if (dto.texto        !== undefined) fields['texto']       = dto.texto      ?? null;
    if (dto.estado       !== undefined) fields['estado']      = dto.estado;

    if (dto.categoria_uuid !== undefined) {
      fields['categoria_id'] = dto.categoria_uuid
        ? await this.repo.getCategoriaId(dto.categoria_uuid)
        : null;
    }

    if (dto.moneda_uuid !== undefined) {
      fields['moneda_id'] = dto.moneda_uuid
        ? await this.repo.getMonedaIdByUuid(dto.moneda_uuid)
        : null;
    }

    await this.repo.updateItem(uuid, fields as Parameters<ServicioRepository['updateItem']>[1]);

    if (dto.imagenes !== undefined) {
      const itemId     = await this.repo.getItemId(uuid);
      const pivotItems = await this.resolveUpdateImagenes(dto.imagenes);
      await this.repo.replaceItemImagenes(itemId, pivotItems);
    }

    return this.repo.findItemByUuid(uuid);
  }

  async deleteItem(uuid: string): Promise<void> {
    return this.repo.softDeleteItem(uuid);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async uploadImagenes(
    items: CreateItemDTO['imagenes'],
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
    items: ImagenItemUpdateItem[],
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
        const archivoId = await this.repo.getArchivoIdByUuid(item.archivo_uuid);
        return { archivo_id: archivoId, orden: item.orden };
      }),
    );
  }

  // ── Web ────────────────────────────────────────────────────────────────────

  /**
   * Categorías activas (estado=1) sin paginación. Usado por el módulo web.
   */
  async listActiveCategorias(): Promise<PublicServicioCategoria[]> {
    return this.repo.findActiveCategorias();
  }

  /**
   * Items activos de una categoría específica. Usado por el módulo web.
   */
  async listActiveItemsByCategoria(categoriaUuid: string): Promise<PublicServicioItem[]> {
    return this.repo.findActiveItemsByCategoriaUuid(categoriaUuid);
  }
}
