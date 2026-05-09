import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

const imagenInputSchema = z.object({
  imagen: z.string().refine((v) => dataUriRegex.test(v), 'Must be a valid base64 data URI.'),
  alt:    z.string().trim().max(255).nullable().optional(),
  title:  z.string().trim().max(255).nullable().optional(),
  orden:  z.number().int().min(0).default(0),
});

const DIAS = ['Lunes', 'Martes', 'Mi\u00e9rcoles', 'Jueves', 'Viernes', 'S\u00e1bado', 'Domingo'] as const;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const horarioDiaSchema = z.object({
  dia:      z.enum(DIAS),
  activo:   z.boolean(),
  apertura: z.string().regex(timeRegex, 'Formato HH:MM requerido.').nullable().optional(),
  cierre:   z.string().regex(timeRegex, 'Formato HH:MM requerido.').nullable().optional(),
});

export const createLocalSchema = z.object({
  nombre: z
    .string({ required_error: 'Nombre is required.' })
    .trim()
    .min(2,   'Nombre must be at least 2 characters.')
    .max(255, 'Nombre cannot exceed 255 characters.'),

  descripcion: z
    .string()
    .min(1, 'Descripcion cannot be empty.')
    .default(''),

  direccion: z.string().trim().max(500).nullable().optional(),

  telefono: z.string().trim().max(100).nullable().optional(),

  horarios: z.array(horarioDiaSchema).optional(),

  imagenes: z.array(imagenInputSchema).default([]),
});

export type CreateLocalDTO = z.infer<typeof createLocalSchema>;

