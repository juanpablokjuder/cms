import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

/**
 * Una entrada de imagen en un PATCH puede ser:
 *  - Nueva subida  → { imagen: 'data:...',   alt?, title?, orden }
 *  - Existente     → { archivo_uuid: '...',   alt?, title?, orden }
 */
const imagenUpdateSchema = z.union([
  z.object({
    imagen: z.string().refine((v) => dataUriRegex.test(v), 'Must be a valid base64 data URI.'),
    alt:    z.string().trim().max(255).nullable().optional(),
    title:  z.string().trim().max(255).nullable().optional(),
    orden:  z.number().int().min(0),
  }),
  z.object({
    archivo_uuid: z.string().uuid('archivo_uuid must be a valid UUID.'),
    alt:          z.string().trim().max(255).nullable().optional(),
    title:        z.string().trim().max(255).nullable().optional(),
    orden:        z.number().int().min(0),
  }),
]);

const DIAS = ['Lunes', 'Martes', 'Mi\u00e9rcoles', 'Jueves', 'Viernes', 'S\u00e1bado', 'Domingo'] as const;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const horarioDiaSchema = z.object({
  dia:      z.enum(DIAS),
  activo:   z.boolean(),
  apertura: z.string().regex(timeRegex, 'Formato HH:MM requerido.').nullable().optional(),
  cierre:   z.string().regex(timeRegex, 'Formato HH:MM requerido.').nullable().optional(),
});

export const updateLocalSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2,   'Nombre must be at least 2 characters.')
    .max(255, 'Nombre cannot exceed 255 characters.')
    .optional(),

  descripcion: z
    .string()
    .min(1, 'Descripcion cannot be empty.')
    .optional(),

  direccion: z.string().trim().max(500).nullable().optional(),

  telefono: z.string().trim().max(100).nullable().optional(),

  horarios: z.array(horarioDiaSchema).optional(),

  imagenes: z.array(imagenUpdateSchema).optional(),
});

export type UpdateLocalDTO    = z.infer<typeof updateLocalSchema>;
export type ImagenUpdateItem  = z.infer<typeof imagenUpdateSchema>;

