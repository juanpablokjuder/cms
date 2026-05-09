import { v4 as uuidv4 } from 'uuid';
import { LocalRepository } from './local.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import type { PaginatedResult, PaginationOptions, PublicLocal } from '../../shared/types/index.js';
import type { CreateLocalDTO } from './dtos/create-local.dto.js';
import type { UpdateLocalDTO, ImagenUpdateItem } from './dtos/update-local.dto.js';

export class LocalService {
  private readonly repo: LocalRepository;
  private readonly archivoService: ArchivoService;

  constructor() {
    this.repo           = new LocalRepository();
    this.archivoService = new ArchivoService();
  }

  async list(opts: PaginationOptions): Promise<PaginatedResult<PublicLocal>> {
    return this.repo.findAll(opts);
  }

  async findByUuid(uuid: string): Promise<PublicLocal> {
    return this.repo.findByUuid(uuid);
  }

  async create(dto: CreateLocalDTO): Promise<PublicLocal> {
    const local = await this.repo.create({
      uuid:        uuidv4(),
      nombre:      dto.nombre,
      descripcion: dto.descripcion,
      direccion:   dto.direccion  ?? null,
      telefono:    dto.telefono   ?? null,
      horarios:    dto.horarios   ? JSON.stringify(dto.horarios) : null,
    });

    if (dto.imagenes.length > 0) {
      const localId   = await this.repo.getLocalId(local.uuid);
      const pivotItems = await this.uploadImagenes(dto.imagenes);
      await this.repo.replaceImagenes(localId, pivotItems);
    }

    return this.repo.findByUuid(local.uuid);
  }

  async update(uuid: string, dto: UpdateLocalDTO): Promise<PublicLocal> {
    await this.repo.findByUuid(uuid); // existence check

    await this.repo.update(uuid, {
      ...(dto.nombre      !== undefined ? { nombre:      dto.nombre }                              : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion }                        : {}),
      ...(dto.direccion   !== undefined ? { direccion:   dto.direccion ?? null }                  : {}),
      ...(dto.telefono    !== undefined ? { telefono:    dto.telefono  ?? null }                  : {}),
      ...(dto.horarios    !== undefined ? { horarios:    JSON.stringify(dto.horarios) }            : {}),
    });

    if (dto.imagenes !== undefined) {
      const localId    = await this.repo.getLocalId(uuid);
      const pivotItems = await this.resolveUpdateImagenes(dto.imagenes);
      await this.repo.replaceImagenes(localId, pivotItems);
    }

    return this.repo.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async uploadImagenes(
    items: CreateLocalDTO['imagenes'],
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
