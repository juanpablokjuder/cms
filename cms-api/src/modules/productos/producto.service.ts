import { ProductoRepository } from './producto.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import { SeoService } from '../seo/seo.service.js';
import type { CreateColorDTO } from './dtos/create-color.dto.js';
import type { UpdateColorDTO } from './dtos/update-color.dto.js';
import type { CreateAtributoPlantillaDTO } from './dtos/create-atributo-plantilla.dto.js';
import type { UpdateAtributoPlantillaDTO } from './dtos/update-atributo-plantilla.dto.js';
import type { CreateProductoDTO } from './dtos/create-producto.dto.js';
import type { UpdateProductoDTO } from './dtos/update-producto.dto.js';
import type { PaginationOptions } from '../../shared/types/index.js';

export class ProductoService {
  private readonly repo: ProductoRepository;
  private readonly archivoService: ArchivoService;
  private readonly seoService: SeoService;

  constructor() {
    this.repo = new ProductoRepository();
    this.archivoService = new ArchivoService();
    this.seoService = new SeoService();
  }

  // ── Colores ──────────────────────────────────────────────────────────────

  listColores(opts: PaginationOptions) {
    return this.repo.listColores(opts);
  }

  listColoresAll() {
    return this.repo.listColoresAll();
  }

  findColor(uuid: string) {
    return this.repo.findColorByUuid(uuid);
  }

  async createColor(dto: CreateColorDTO) {
    let imagenId: number | null = null;
    if (dto.imagen) {
      const archivo = await this.archivoService.create({
        imagen: dto.imagen,
        nombre: dto.imagen_nombre ?? null,
        alt:    dto.imagen_alt    ?? null,
        title:  dto.nombre,
      });
      imagenId = archivo.id;
    }
    return this.repo.createColor(dto.nombre, imagenId);
  }

  async updateColor(uuid: string, dto: UpdateColorDTO) {
    let imagenId: number | null | undefined;
    if (dto.imagen) {
      const archivo = await this.archivoService.create({
        imagen: dto.imagen,
        nombre: dto.imagen_nombre ?? null,
        alt:    dto.imagen_alt    ?? null,
        title:  dto.nombre ?? uuid,
      });
      imagenId = archivo.id;
    }
    return this.repo.updateColor(uuid, dto.nombre, imagenId);
  }

  deleteColor(uuid: string) {
    return this.repo.deleteColor(uuid);
  }

  // ── Lookups ──────────────────────────────────────────────────────────────

  listCondiciones() {
    return this.repo.listCondiciones();
  }

  listGarantias() {
    return this.repo.listGarantias();
  }

  // ── Plantillas de atributos ───────────────────────────────────────────────

  listAtributos(opts: PaginationOptions) {
    return this.repo.listAtributos(opts);
  }

  listAtributosAll() {
    return this.repo.listAtributosAll();
  }

  findAtributo(uuid: string) {
    return this.repo.findAtributoByUuid(uuid);
  }

  createAtributo(dto: CreateAtributoPlantillaDTO) {
    return this.repo.createAtributo(dto.nombre, dto.atributos);
  }

  updateAtributo(uuid: string, dto: UpdateAtributoPlantillaDTO) {
    return this.repo.updateAtributo(uuid, dto.nombre, dto.atributos);
  }

  deleteAtributo(uuid: string) {
    return this.repo.deleteAtributo(uuid);
  }

  // ── Productos ────────────────────────────────────────────────────────────

  listProductos(opts: PaginationOptions) {
    return this.repo.listProductos(opts);
  }

  findProducto(uuid: string) {
    return this.repo.findProductoByUuid(uuid);
  }

  private async _resolveVarianteImagenes(
    imagenes: Array<{
      archivo_uuid?: string;
      imagen?: string;
      imagen_nombre?: string | null;
      imagen_alt?: string | null;
      orden: number;
    }>,
  ): Promise<Array<{ archivo_uuid: string; orden: number }>> {
    const result: Array<{ archivo_uuid: string; orden: number }> = [];
    for (const img of imagenes) {
      if (img.imagen) {
        const archivo = await this.archivoService.create({
          imagen: img.imagen,
          nombre: img.imagen_nombre ?? null,
          alt:    img.imagen_alt    ?? null,
          title:  null,
        });
        result.push({ archivo_uuid: archivo.uuid, orden: img.orden });
      } else if (img.archivo_uuid) {
        result.push({ archivo_uuid: img.archivo_uuid, orden: img.orden });
      }
    }
    return result;
  }

  async createProducto(dto: CreateProductoDTO, creadorUuid: string) {
    const variantes = await Promise.all(
      (dto.variantes ?? []).map(async v => ({
        ...v,
        imagenes: await this._resolveVarianteImagenes(v.imagenes ?? []),
      })),
    );
    const producto = await this.repo.createProducto({ ...dto, variantes, creadorUuid });
    if (dto.seo_data) {
      await this.seoService.upsert('producto', producto.uuid, dto.seo_data);
    }
    return this.repo.findProductoByUuid(producto.uuid);
  }

  async updateProducto(uuid: string, dto: UpdateProductoDTO, updaterUuid: string) {
    const variantes = dto.variantes
      ? await Promise.all(
          dto.variantes.map(async v => ({
            ...v,
            imagenes: await this._resolveVarianteImagenes(v.imagenes ?? []),
          })),
        )
      : undefined;
    const producto = await this.repo.updateProducto(uuid, { ...dto, variantes, updaterUuid });
    if (dto.seo_data) {
      await this.seoService.upsert('producto', uuid, dto.seo_data);
    }
    return this.repo.findProductoByUuid(producto.uuid);
  }

  deleteProducto(uuid: string) {
    return this.repo.deleteProducto(uuid);
  }
}
