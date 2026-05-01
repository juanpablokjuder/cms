import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

/**
 * Una entrada de imagen en un PATCH puede ser:
 *  - Nueva imagen    → { imagen: 'data:...', alt?, title?, orden }
 *  - Imagen existente → { archivo_uuid: '...', alt?, title?, orden }
 */
const imagenUpdateSchema = z.union([
  z.object({
    imagen: z.string().refine((v) => dataUriRegex.test(v), 'Must be a valid base64 data URI.'),
    alt:    z.string().trim().max(255).nullable().optional(),
    title:  z.string().trim().max(255).nullable().optional(),
    orden:  z.number().int().min(0),
  }),
  z.object({
    archivo_uuid: z.string().uuid('archivo_uuid must be a valid UUID.'),
    alt:          z.string().trim().max(255).nullable().optional(),
    title:        z.string().trim().max(255).nullable().optional(),
    orden:        z.number().int().min(0),
  }),
]);

export const updateNosotrosSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2,   'Titulo must be at least 2 characters.')
    .max(255, 'Titulo cannot exceed 255 characters.')
    .optional(),

  subtitulo: z
    .string()
    .trim()
    .max(500, 'Subtitulo cannot exceed 500 characters.')
    .nullable()
    .optional(),

  texto: z
    .string()
    .min(1, 'Texto cannot be empty.')
    .optional(),

  /**
   * Reemplazo completo del set de imágenes.
   * Si se omite, las imágenes actuales no se modifican.
   */
  imagenes: z.array(imagenUpdateSchema).optional(),
});

export type UpdateNosotrosDTO  = z.infer<typeof updateNosotrosSchema>;
export type ImagenUpdateItem   = z.infer<typeof imagenUpdateSchema>;
