import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

/** Schema de un botón individual del banner. */
export const bannerBotonSchema = z.object({
  texto: z
    .string({ required_error: 'El texto del botón es obligatorio.' })
    .trim()
    .min(1, 'El texto del botón no puede estar vacío.')
    .max(100, 'El texto del botón no puede superar los 100 caracteres.'),
  link: z
    .string({ required_error: 'El enlace del botón es obligatorio.' })
    .trim()
    .min(1, 'El enlace del botón no puede estar vacío.')
    .max(500, 'El enlace del botón no puede superar los 500 caracteres.'),
  variante: z.enum(['primary', 'outline']).default('primary'),
  orden: z.number().int().min(0).default(0),
});

export const createBannerSchema = z.object({
  pagina: z
    .string({ required_error: 'Pagina is required.' })
    .trim()
    .min(1, 'Pagina cannot be empty.')
    .max(100, 'Pagina cannot exceed 100 characters.'),

  /** Base64 data URI for the banner image (e.g. data:image/png;base64,…). Optional. */
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
    .string({ required_error: 'H1 is required.' })
    .trim()
    .min(1, 'H1 cannot be empty.')
    .max(65535, 'H1 is too long.'),

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

  /** Lista de botones (call-to-action) del banner. Opcional. */
  botones: z.array(bannerBotonSchema).max(10, 'Máximo 10 botones por banner.').optional(),

  orden: z
    .number()
    .int('Orden must be an integer.')
    .min(0, 'Orden must be zero or positive.')
    .default(0),
});

export type CreateBannerDTO = z.infer<typeof createBannerSchema>;
export type BannerBotonDTO = z.infer<typeof bannerBotonSchema>;
