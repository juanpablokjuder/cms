import { z } from 'zod';
import { bannerBotonSchema } from './create-banner.dto.js';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

/**
 * All fields are optional — supports partial PATCH semantics.
 */
export const updateBannerSchema = z.object({
  pagina: z
    .string()
    .trim()
    .min(1, 'Pagina cannot be empty.')
    .max(100, 'Pagina cannot exceed 100 characters.')
    .optional(),

  /** Base64 data URI to replace the current image. Sends a new upload internally. */
  imagen: z
    .string()
    .refine(
      (v) => dataUriRegex.test(v),
      'imagen must be a valid base64 data URI (data:image/<type>;base64,<data>).',
    )
    .optional(),

  imagen_alt: z.string().trim().max(255).nullable().optional(),
  imagen_title: z.string().trim().max(255).nullable().optional(),
  /** Nombre del archivo de imagen (sin extensión). Usado como base para el slug. */
  imagen_nombre: z.string().trim().max(200).nullable().optional(),

  h1: z
    .string()
    .trim()
    .min(1, 'H1 cannot be empty.')
    .max(65535, 'H1 is too long.')
    .optional(),

  texto_1: z
    .string()
    .trim()
    .max(65535, 'Texto_1 is too long.')
    .nullable()
    .optional(),

  texto_2: z
    .string()
    .trim()
    .max(65535, 'Texto_2 is too long.')
    .nullable()
    .optional(),

  /**
   * Lista completa de botones. Si se envía, reemplaza todos los botones
   * existentes del banner (sync). Si se omite, los botones no se tocan.
   */
  botones: z.array(bannerBotonSchema).max(10, 'Máximo 10 botones por banner.').optional(),

  orden: z
    .number()
    .int('Orden must be an integer.')
    .min(0, 'Orden must be zero or positive.')
    .optional(),
});

export type UpdateBannerDTO = z.infer<typeof updateBannerSchema>;
