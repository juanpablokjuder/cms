import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

export const faqItemInputSchema = z.object({
  pregunta:  z.string().trim().min(1, 'Pregunta cannot be empty.').max(1000),
  respuesta: z.string().min(1, 'Respuesta cannot be empty.'),
  orden:     z.number().int().min(0).default(0),
});

export const createFaqSchema = z.object({
  titulo: z
    .string({ required_error: 'Titulo is required.' })
    .trim()
    .min(2,   'Titulo must be at least 2 characters.')
    .max(255, 'Titulo cannot exceed 255 characters.'),

  imagen: z
    .string()
    .refine((v) => dataUriRegex.test(v), 'imagen must be a valid base64 data URI.')
    .optional(),

  imagen_alt:   z.string().trim().max(255).nullable().optional(),
  imagen_title: z.string().trim().max(255).nullable().optional(),

  items: z.array(faqItemInputSchema).default([]),
});

export type CreateFaqDTO      = z.infer<typeof createFaqSchema>;
export type FaqItemInputDTO   = z.infer<typeof faqItemInputSchema>;
