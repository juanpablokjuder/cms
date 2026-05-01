import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

const imagenInputSchema = z.object({
  imagen: z.string().refine((v) => dataUriRegex.test(v), 'Must be a valid base64 data URI.'),
  alt:    z.string().trim().max(255).nullable().optional(),
  title:  z.string().trim().max(255).nullable().optional(),
  orden:  z.number().int().min(0).default(0),
});

export const createNosotrosSchema = z.object({
  titulo: z
    .string({ required_error: 'Titulo is required.' })
    .trim()
    .min(2,   'Titulo must be at least 2 characters.')
    .max(255, 'Titulo cannot exceed 255 characters.'),

  subtitulo: z
    .string()
    .trim()
    .max(500, 'Subtitulo cannot exceed 500 characters.')
    .nullable()
    .optional(),

  texto: z
    .string({ required_error: 'Texto is required.' })
    .min(1, 'Texto cannot be empty.'),

  /** Arreglo ordenado de imágenes nuevas a subir (data URIs base64). */
  imagenes: z.array(imagenInputSchema).default([]),
});

export type CreateNosotrosDTO  = z.infer<typeof createNosotrosSchema>;
export type ImagenInputDTO     = z.infer<typeof imagenInputSchema>;
