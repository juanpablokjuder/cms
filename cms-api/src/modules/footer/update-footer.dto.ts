import { z } from 'zod';

const dataUriRegex = /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

const mediaTextoUpdateSchema = z.object({
  tipo:         z.literal('media_texto'),
  imagen:       z.string().refine((v) => dataUriRegex.test(v)).optional(),
  imagen_alt:   z.string().trim().max(255).nullable().optional(),
  imagen_title: z.string().trim().max(255).nullable().optional(),
  descripcion:  z.string().trim().max(5000).nullable().optional(),
});

const enlaceUpdateSchema = z.object({
  uuid:  z.string().uuid().optional(), // present → keep/update existing
  texto: z.string().trim().min(1).max(255),
  url:   z.string().trim().min(1).max(500),
  orden: z.number().int().min(0).default(0),
});

const listaEnlacesUpdateSchema = z.object({
  tipo:    z.literal('lista_enlaces'),
  enlaces: z.array(enlaceUpdateSchema).default([]),
});

const contactoUpdateSchema = z.object({
  tipo:      z.literal('contacto'),
  direccion: z.string().trim().max(500).nullable().optional(),
  telefono:  z.string().trim().max(100).nullable().optional(),
  email:     z.string().email().nullable().optional(),
});

const columnaUpdateSchema = z.discriminatedUnion('tipo', [
  mediaTextoUpdateSchema,
  listaEnlacesUpdateSchema,
  contactoUpdateSchema,
]).and(z.object({
  uuid:  z.string().uuid().optional(), // present → update existing columna
  orden: z.number().int().min(0).default(0),
}));

const redSocialUpdateSchema = z.object({
  uuid:     z.string().uuid().optional(),
  nombre:   z.string().trim().min(1).max(100),
  url:      z.string().trim().url().max(500),
  svg_icon: z.string().trim().min(1),
  orden:    z.number().int().min(0).default(0),
});

const legalUpdateSchema = z.object({
  uuid:  z.string().uuid().optional(),
  texto: z.string().trim().min(1).max(255),
  url:   z.string().trim().min(1).max(500),
  orden: z.number().int().min(0).default(0),
});

export const updateFooterSchema = z.object({
  columnas_count: z.number().int().min(1).max(5).optional(),
  copyright_text: z.string().trim().max(500).nullable().optional(),
  columnas:       z.array(columnaUpdateSchema).max(5).optional(),
  redes:          z.array(redSocialUpdateSchema).optional(),
  legales:        z.array(legalUpdateSchema).optional(),
});

export type UpdateFooterDTO = z.infer<typeof updateFooterSchema>;
