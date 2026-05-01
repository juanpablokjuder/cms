import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

/**
 * Each item in the update payload can be:
 *  - New item  → { pregunta, respuesta, orden }          (no uuid)
 *  - Existing  → { uuid, pregunta?, respuesta?, orden }  (uuid present → keep/update)
 * When `items` is provided the entire set is replaced in order.
 */
export const faqItemUpdateSchema = z.union([
  // Existing item — uuid required
  z.object({
    uuid:      z.string().uuid(),
    pregunta:  z.string().trim().min(1).max(1000).optional(),
    respuesta: z.string().min(1).optional(),
    orden:     z.number().int().min(0),
  }),
  // New item — no uuid
  z.object({
    pregunta:  z.string().trim().min(1, 'Pregunta cannot be empty.').max(1000),
    respuesta: z.string().min(1, 'Respuesta cannot be empty.'),
    orden:     z.number().int().min(0),
  }),
]);

export const updateFaqSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2,   'Titulo must be at least 2 characters.')
    .max(255, 'Titulo cannot exceed 255 characters.')
    .optional(),

  imagen: z
    .string()
    .refine((v) => dataUriRegex.test(v), 'imagen must be a valid base64 data URI.')
    .optional(),

  imagen_alt:   z.string().trim().max(255).nullable().optional(),
  imagen_title: z.string().trim().max(255).nullable().optional(),

  /** Full replacement of all items when provided. */
  items: z.array(faqItemUpdateSchema).optional(),
});

export type UpdateFaqDTO       = z.infer<typeof updateFaqSchema>;
export type FaqItemUpdateEntry = z.infer<typeof faqItemUpdateSchema>;
