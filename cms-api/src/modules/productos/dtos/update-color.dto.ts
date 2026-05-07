import { z } from 'zod';

const BASE64_RE = /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

export const updateColorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1,   'Nombre debe tener al menos 1 caracter.')
    .max(100, 'Nombre no puede superar los 100 caracteres.')
    .optional(),

  imagen: z.string().regex(BASE64_RE, 'imagen debe ser un data URI base64 válido.').optional(),
  imagen_nombre: z.string().max(500).optional(),
  imagen_alt:    z.string().max(500).optional(),
});

export type UpdateColorDTO = z.infer<typeof updateColorSchema>;
