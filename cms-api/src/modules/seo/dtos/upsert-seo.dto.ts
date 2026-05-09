import { z } from 'zod';

export const SEO_ENTITY_TYPES = ['producto', 'noticia', 'servicio', 'nosotros', 'empresa', 'pagina', 'local'] as const;
export type SeoEntityType = typeof SEO_ENTITY_TYPES[number];

export const seoDataSchema = z.object({
  title:            z.string().trim().max(70).nullable().optional(),
  meta_description: z.string().trim().max(500).nullable().optional(),
  meta_keywords:    z.string().trim().max(500).nullable().optional(),
  og_title:         z.string().trim().max(95).nullable().optional(),
  og_description:   z.string().trim().max(500).nullable().optional(),
  scripts_head:     z.string().trim().nullable().optional(),
  scripts_body:     z.string().trim().nullable().optional(),
});

export const upsertSeoSchema = seoDataSchema;

export type UpsertSeoDTO = z.infer<typeof upsertSeoSchema>;
export type SeoData      = z.infer<typeof seoDataSchema>;
