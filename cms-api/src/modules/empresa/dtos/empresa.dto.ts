import { z } from 'zod';

export const createEmpresaSchema = z.object({
  nombre: z
    .string({ required_error: 'Nombre is required.' })
    .trim()
    .min(2,   'Nombre must be at least 2 characters.')
    .max(255, 'Nombre cannot exceed 255 characters.'),

  telefono: z
    .string().trim().max(100).nullable().optional(),

  mail: z
    .string().email('Must be a valid email address.')
    .toLowerCase().trim()
    .nullable().optional(),

  direccion: z
    .string().trim().max(500).nullable().optional(),
});

export const updateEmpresaSchema = createEmpresaSchema.partial();

export type CreateEmpresaDTO = z.infer<typeof createEmpresaSchema>;
export type UpdateEmpresaDTO = z.infer<typeof updateEmpresaSchema>;
