import { z } from 'zod';

const dataUriRegex = /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

// ─── Column block schemas ─────────────────────────────────────────────────────

const mediaTextoSchema = z.object({
  tipo:        z.literal('media_texto'),
  imagen:      z.string().refine((v) => dataUriRegex.test(v), 'Must be a valid base64 data URI.').optional(),
  imagen_alt:  z.string().trim().max(255).nullable().optional(),
  imagen_title:z.string().trim().max(255).nullable().optional(),
  descripcion: z.string().trim().max(5000).nullable().optional(),
});

const enlaceItemSchema = z.object({
  texto: z.string().trim().min(1, 'Texto is required.').max(255),
  url:   z.string().trim().min(1, 'URL is required.').max(500),
  orden: z.number().int().min(0).default(0),
});

const listaEnlacesSchema = z.object({
  tipo:    z.literal('lista_enlaces'),
  enlaces: z.array(enlaceItemSchema).default([]),
});

const contactoSchema = z.object({
  tipo:      z.literal('contacto'),
  direccion: z.string().trim().max(500).nullable().optional(),
  telefono:  z.string().trim().max(100).nullable().optional(),
  email:     z.string().email('Must be a valid email.').nullable().optional(),
});

export const columnaInputSchema = z.discriminatedUnion('tipo', [
  mediaTextoSchema,
  listaEnlacesSchema,
  contactoSchema,
]).and(z.object({ orden: z.number().int().min(0).default(0) }));

// ─── Top-level schemas ────────────────────────────────────────────────────────

const redSocialSchema = z.object({
  nombre:   z.string().trim().min(1).max(100),
  url:      z.string().trim().url('Must be a valid URL.').max(500),
  svg_icon: z.string().trim().min(1, 'SVG icon is required.'),
  orden:    z.number().int().min(0).default(0),
});

const legalSchema = z.object({
  texto: z.string().trim().min(1).max(255),
  url:   z.string().trim().min(1).max(500),
  orden: z.number().int().min(0).default(0),
});

export const createFooterSchema = z.object({
  columnas_count: z.number().int().min(1).max(5),
  copyright_text: z.string().trim().max(500).nullable().optional(),
  columnas:       z.array(columnaInputSchema).max(5).default([]),
  redes:          z.array(redSocialSchema).default([]),
  legales:        z.array(legalSchema).default([]),
});

export type CreateFooterDTO    = z.infer<typeof createFooterSchema>;
export type ColumnaInputDTO    = z.infer<typeof columnaInputSchema>;
export type EnlaceItemDTO      = z.infer<typeof enlaceItemSchema>;
export type RedSocialInputDTO  = z.infer<typeof redSocialSchema>;
export type LegalInputDTO      = z.infer<typeof legalSchema>;
