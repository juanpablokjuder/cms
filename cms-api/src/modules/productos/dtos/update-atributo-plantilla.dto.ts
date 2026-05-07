import { z } from 'zod';

export const updateAtributoPlantillaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2,   'Nombre debe tener al menos 2 caracteres.')
    .max(255, 'Nombre no puede superar los 255 caracteres.')
    .optional(),

  atributos: z
    .record(z.string(), z.enum(['string', 'number', 'boolean']))
    .refine(v => Object.keys(v).length > 0, { message: 'Debe definir al menos un atributo.' })
    .optional(),
});

export type UpdateAtributoPlantillaDTO = z.infer<typeof updateAtributoPlantillaSchema>;
