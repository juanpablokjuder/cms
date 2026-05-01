import { z } from 'zod';

export const createServicioSchema = z.object({
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
});

export type CreateServicioDTO = z.infer<typeof createServicioSchema>;
