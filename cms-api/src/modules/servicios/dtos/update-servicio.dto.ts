import { z } from 'zod';

export const updateServicioSchema = z.object({
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
});

export type UpdateServicioDTO = z.infer<typeof updateServicioSchema>;
