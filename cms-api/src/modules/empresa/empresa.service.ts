import { EmpresaRepository } from './empresa.repository.js';
import { AppError } from '../../shared/utils/app-error.js';
import type { PublicEmpresa } from './empresa.repository.js';
import type { CreateEmpresaDTO, UpdateEmpresaDTO } from './dtos/empresa.dto.js';

export class EmpresaService {
  private readonly repo: EmpresaRepository;

  constructor() {
    this.repo = new EmpresaRepository();
  }

  /** Returns the single active empresa record, or null if none exists yet. */
  async get(): Promise<PublicEmpresa | null> {
    return this.repo.findActive();
  }

  /**
   * Creates the empresa record.
   * Enforces the singleton constraint: if an active record already exists, throws 409.
   */
  async create(dto: CreateEmpresaDTO): Promise<PublicEmpresa> {
    const existing = await this.repo.findRawActive();
    if (existing) {
      throw AppError.conflict(
        'An active empresa record already exists. Use PATCH to update it.',
      );
    }

    return this.repo.create({
      nombre:   dto.nombre,
      telefono: dto.telefono ?? null,
      mail:     dto.mail     ?? null,
      direccion:dto.direccion?? null,
    });
  }

  async update(uuid: string, dto: UpdateEmpresaDTO): Promise<PublicEmpresa> {
    // Existence check
    await this.repo.findByUuid(uuid);

    return this.repo.update(uuid, {
      ...(dto.nombre    !== undefined ? { nombre:    dto.nombre }              : {}),
      ...(dto.telefono  !== undefined ? { telefono:  dto.telefono  ?? null }   : {}),
      ...(dto.mail      !== undefined ? { mail:      dto.mail      ?? null }   : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion ?? null }   : {}),
    });
  }

  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }
}
