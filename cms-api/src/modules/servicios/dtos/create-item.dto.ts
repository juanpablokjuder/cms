import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

const imagenInputSchema = z.object({
  imagen: z.string().refine((v) => dataUriRegex.test(v), 'Must be a valid base64 data URI.'),
  alt:    z.string().trim().max(255).nullable().optional(),
  title:  z.string().trim().max(255).nullable().optional(),
  orden:  z.number().int().min(0).default(0),
});

export const createItemSchema = z.object({
  categoria_uuid: z.string().uuid().nullable().optional(),

  titulo: z
    .string({ required_error: 'Titulo is required.' })
    .trim()
    .min(2,   'Titulo must be at least 2 characters.')
    .max(255, 'Titulo cannot exceed 255 characters.'),

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

  estado: z
    .enum(['activo', 'inactivo', 'no_mostrar'])
    .default('activo'),

  imagenes: z.array(imagenInputSchema).default([]),
});

export type CreateItemDTO     = z.infer<typeof createItemSchema>;
export type ImagenItemInputDTO = z.infer<typeof imagenInputSchema>;
