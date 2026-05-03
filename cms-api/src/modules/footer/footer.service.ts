import { v4 as uuidv4 } from 'uuid';
import { FooterRepository } from './footer.repository.js';
import { ArchivoService } from '../archivos/archivo.service.js';
import type { PaginatedResult, PaginationOptions, PublicFooter } from '../../shared/types/index.js';
import type { CreateFooterDTO, ColumnaInputDTO } from './dtos/create-footer.dto.js';
import type { UpdateFooterDTO } from './dtos/update-footer.dto.js';

export class FooterService {
  private readonly repo:           FooterRepository;
  private readonly archivoService: ArchivoService;

  constructor() {
    this.repo           = new FooterRepository();
    this.archivoService = new ArchivoService();
  }

  async list(opts: PaginationOptions): Promise<PaginatedResult<PublicFooter>> {
    return this.repo.findAll(opts);
  }

  async findByUuid(uuid: string): Promise<PublicFooter> {
    return this.repo.findByUuid(uuid);
  }

  async create(dto: CreateFooterDTO): Promise<PublicFooter> {
    const row = await this.repo.create({
      uuid:           uuidv4(),
      columnas_count: dto.columnas_count,
      copyright_text: dto.copyright_text ?? null,
    });

    const footerId     = row.id;
    const columnasData = await this.buildColumnasData(dto.columnas);

    await Promise.all([
      this.repo.replaceColumnas(footerId, columnasData),
      this.repo.replaceRedes(footerId, dto.redes),
      this.repo.replaceLegales(footerId, dto.legales),
    ]);

    return this.repo.findByUuid(row.uuid);
  }

  async update(uuid: string, dto: UpdateFooterDTO): Promise<PublicFooter> {
    const footerId = await this.repo.getFooterId(uuid);

    await this.repo.update(uuid, {
      ...(dto.columnas_count !== undefined ? { columnas_count: dto.columnas_count } : {}),
      ...(dto.copyright_text !== undefined ? { copyright_text: dto.copyright_text ?? null } : {}),
    });

    const tasks: Promise<void>[] = [];

    if (dto.columnas !== undefined) {
      tasks.push(
        this.buildColumnasData(dto.columnas as ColumnaInputDTO[]).then((data) =>
          this.repo.replaceColumnas(footerId, data),
        ),
      );
    }
    if (dto.redes !== undefined)   tasks.push(this.repo.replaceRedes(footerId, dto.redes));
    if (dto.legales !== undefined)  tasks.push(this.repo.replaceLegales(footerId, dto.legales));

    await Promise.all(tasks);
    return this.repo.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    return this.repo.softDelete(uuid);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async buildColumnasData(
    columnas: ColumnaInputDTO[],
  ): Promise<Parameters<FooterRepository['replaceColumnas']>[1]> {
    return Promise.all(
      columnas.map(async (col) => {
        const base = { uuid: (col as { uuid?: string }).uuid, tipo: col.tipo, orden: col.orden };

        if (col.tipo === 'media_texto') {
          let id_imagen: number | null = null;
          if (col.imagen) {
            const archivo = await this.archivoService.create({
              imagen: col.imagen,
              alt:    col.imagen_alt   ?? null,
              title:  col.imagen_title ?? null,
            });
            id_imagen = archivo.id;
          }
          return { ...base, mediaTexto: { id_imagen, descripcion: col.descripcion ?? null } };
        }

        if (col.tipo === 'lista_enlaces') {
          return { ...base, enlaces: col.enlaces };
        }

        // contacto
        return {
          ...base,
          contacto: {
            direccion: col.direccion ?? null,
            telefono:  col.telefono  ?? null,
            email:     col.email     ?? null,
          },
        };
      }),
    );
  }
}
