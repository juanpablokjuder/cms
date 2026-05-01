import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

/**
 * An imagen entry in a PATCH request can be:
 *  - A new upload  → { imagen: 'data:...',  alt?, title?, orden }
 *  - An existing   → { archivo_uuid: '...',  alt?, title?, orden }  (no re-upload, just reorder/meta)
 */
const imagenUpdateSchema = z.union([
  // New upload
  z.object({
    imagen:       z.string().refine((v) => dataUriRegex.test(v), 'Must be a valid base64 data URI.'),
    alt:          z.string().trim().max(255).nullable().optional(),
    title:        z.string().trim().max(255).nullable().optional(),
    orden:        z.number().int().min(0),
  }),
  // Existing archivo — pass uuid to keep it, change orden/meta
  z.object({
    archivo_uuid: z.string().uuid('archivo_uuid must be a valid UUID.'),
    alt:          z.string().trim().max(255).nullable().optional(),
    title:        z.string().trim().max(255).nullable().optional(),
    orden:        z.number().int().min(0),
  }),
]);

export const updateNoticiaSchema = z.object({
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

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens.')
    .max(255, 'Slug cannot exceed 255 characters.')
    .optional(),

  texto: z
    .string()
    .min(1, 'Texto cannot be empty.')
    .optional(),

  /**
   * Full replacement of the image set.
   * When provided, existing pivot rows are deleted and rebuilt from this array.
   * Omitting this field leaves the current images untouched.
   */
  imagenes: z.array(imagenUpdateSchema).optional(),
});

export type UpdateNoticiaDTO   = z.infer<typeof updateNoticiaSchema>;
export type ImagenUpdateItem   = z.infer<typeof imagenUpdateSchema>;
