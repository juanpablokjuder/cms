import { SeoRepository } from './seo.repository.js';
import type { SeoEntityType, UpsertSeoDTO } from './dtos/upsert-seo.dto.js';
import type { PublicSeoMetadata } from './seo.repository.js';

export class SeoService {
  private readonly repo: SeoRepository;

  constructor() {
    this.repo = new SeoRepository();
  }

  findByEntity(entityType: SeoEntityType, entityUuid: string): Promise<PublicSeoMetadata | null> {
    return this.repo.findByEntity(entityType, entityUuid);
  }

  upsert(entityType: SeoEntityType, entityUuid: string, dto: UpsertSeoDTO): Promise<PublicSeoMetadata> {
    return this.repo.upsert(entityType, entityUuid, dto);
  }
}
