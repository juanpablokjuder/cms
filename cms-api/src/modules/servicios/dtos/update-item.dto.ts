import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

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

export const updateItemSchema = z.object({
  categoria_uuid: z.string().uuid().nullable().optional(),

  titulo: z
    .string()
    .trim()
    .min(2,   'Titulo must be at least 2 characters.')
    .max(255, 'Titulo cannot exceed 255 characters.')
    .optional(),

  subtitulo_1: z.string().trim().max(500).nullable().optional(),
  subtitulo_2: z.string().trim().max(500).nullable().optional(),

  precio: z
    .number()
    .positive('Precio must be a positive number.')
    .nullable()
    .optional(),

  moneda_uuid: z.string().uuid('moneda_uuid must be a valid UUID.').nullable().optional(),

  btn_titulo: z.string().trim().max(255).nullable().optional(),
  btn_link:   z.string().trim().max(2048).url('btn_link must be a valid URL.').nullable().optional(),

  texto: z.string().nullable().optional(),

  estado: z.enum(['activo', 'inactivo', 'no_mostrar']).optional(),

  imagenes: z.array(imagenUpdateSchema).optional(),
});

export type UpdateItemDTO      = z.infer<typeof updateItemSchema>;
export type ImagenItemUpdateItem = z.infer<typeof imagenUpdateSchema>;
