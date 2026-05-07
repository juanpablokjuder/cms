import { z } from 'zod';
import { varianteSchema } from './create-producto.dto.js';
import { seoDataSchema } from '../../seo/dtos/upsert-seo.dto.js';

const varianteUpdateSchema = varianteSchema.extend({
  uuid: z.string().uuid().optional(), // si tiene uuid → update; sin uuid → insert
});

export const updateProductoSchema = z.object({
  nombre:        z.string().trim().min(1).max(255).optional(),
  descripcion:   z.string().trim().nullable().optional(),
  marca:         z.string().trim().max(255).nullable().optional(),
  condicion_uuid: z.string().uuid().nullable().optional(),
  garantia_uuid:  z.string().uuid().nullable().optional(),
  atributos_uuid: z.string().uuid().nullable().optional(),
  atributos:     z.record(z.string(), z.unknown()).nullable().optional(),
  estado:        z.enum(['activo', 'inactivo']).optional(),
  variantes:     z.array(varianteUpdateSchema).optional(),
  seo_data:      seoDataSchema.optional(),
});

export type UpdateProductoDTO = z.infer<typeof updateProductoSchema>;
