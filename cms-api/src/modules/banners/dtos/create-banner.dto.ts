import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

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
    .max(255, 'H1 cannot exceed 255 characters.'),

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

  btn_texto: z
    .string()
    .trim()
    .max(100, 'Btn_texto cannot exceed 100 characters.')
    .nullable()
    .optional(),

  btn_link: z
    .string()
    .trim()
    .max(500, 'Btn_link cannot exceed 500 characters.')
    .nullable()
    .optional(),

  orden: z
    .number()
    .int('Orden must be an integer.')
    .min(0, 'Orden must be zero or positive.')
    .default(0),
});

export type CreateBannerDTO = z.infer<typeof createBannerSchema>;
