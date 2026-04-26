import { z } from 'zod';

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

/**
 * All fields are optional — supports partial PATCH semantics.
 * Providing `imagen` replaces the stored file on disk and updates the formato.
 */
export const updateArchivoSchema = z.object({
  imagen: z
    .string()
    .refine(
      (v) => dataUriRegex.test(v),
      'imagen must be a valid base64 data URI (data:image/<type>;base64,<data>).',
    )
    .optional(),

  alt: z
    .string()
    .trim()
    .max(255, 'Alt cannot exceed 255 characters.')
    .nullable()
    .optional(),

  title: z
    .string()
    .trim()
    .max(255, 'Title cannot exceed 255 characters.')
    .nullable()
    .optional(),
});

export type UpdateArchivoDTO = z.infer<typeof updateArchivoSchema>;
