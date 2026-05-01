import { z } from 'zod';

export const updateCategoriaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2,   'Nombre must be at least 2 characters.')
    .max(255, 'Nombre cannot exceed 255 characters.')
    .optional(),

  orden: z
    .number()
    .int()
    .min(0)
    .optional(),

  estado: z.number().int().min(0).max(1).optional(),
});

export type UpdateCategoriaDTO = z.infer<typeof updateCategoriaSchema>;
