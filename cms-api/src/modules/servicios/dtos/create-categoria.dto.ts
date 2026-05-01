import { z } from 'zod';

export const createCategoriaSchema = z.object({
  nombre: z
    .string({ required_error: 'Nombre is required.' })
    .trim()
    .min(2,   'Nombre must be at least 2 characters.')
    .max(255, 'Nombre cannot exceed 255 characters.'),

  orden: z
    .number()
    .int()
    .min(0, 'Orden must be a non-negative integer.')
    .default(0),

  estado: z.number().int().min(0).max(1).default(1),
});

export type CreateCategoriaDTO = z.infer<typeof createCategoriaSchema>;
