import { z } from 'zod';

export const createAtributoPlantillaSchema = z.object({
  nombre: z
    .string({ required_error: 'Nombre es requerido.' })
    .trim()
    .min(2,   'Nombre debe tener al menos 2 caracteres.')
    .max(255, 'Nombre no puede superar los 255 caracteres.'),

  atributos: z
    .record(z.string(), z.enum(['string', 'number', 'boolean']))
    .refine(v => Object.keys(v).length > 0, { message: 'Debe definir al menos un atributo.' }),
});

export type CreateAtributoPlantillaDTO = z.infer<typeof createAtributoPlantillaSchema>;
