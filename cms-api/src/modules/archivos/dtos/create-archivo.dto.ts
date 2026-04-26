import { z } from 'zod';

// Accepted MIME types for uploaded images
const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

const dataUriRegex =
  /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

export const createArchivoSchema = z.object({
  imagen: z
    .string({ required_error: 'Imagen (base64 data URI) is required.' })
    .refine(
      (v) => dataUriRegex.test(v),
      'imagen must be a valid base64 data URI (data:image/<type>;base64,<data>). ' +
        `Accepted types: ${ACCEPTED_MIME_TYPES.join(', ')}.`,
    ),

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

export type CreateArchivoDTO = z.infer<typeof createArchivoSchema>;

/** Parsed parts extracted from the data URI — used internally by the service. */
export interface ParsedDataUri {
  mimeType: string;
  formato: string;  // e.g. "png", "jpg", "webp"
  buffer: Buffer;
}

/**
 * Parses and validates a base64 data URI string.
 * Returns the MIME type, file extension, and raw Buffer.
 */
export function parseDataUri(dataUri: string): ParsedDataUri {
  const match = dataUriRegex.exec(dataUri);
  if (!match) {
    throw new Error('Invalid base64 data URI.');
  }

  const mimeType = match[1] as string;
  const base64Data = match[2] as string;

  // Map MIME sub-type → file extension
  const MIME_TO_EXT: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  };

  const formato = MIME_TO_EXT[mimeType] ?? mimeType.split('/')[1] ?? 'bin';
  const buffer = Buffer.from(base64Data, 'base64');

  return { mimeType, formato, buffer };
}
