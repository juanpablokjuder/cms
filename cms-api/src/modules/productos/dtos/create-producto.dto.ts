import { z } from 'zod';

const BASE64_RE = /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+=*)$/;

const varianteImagenSchema = z.object({
  archivo_uuid:  z.string().uuid('archivo_uuid debe ser un UUID v\u00e1lido.').optional(),
  imagen:        z.string().regex(BASE64_RE, 'imagen debe ser un Data URI base64 v\u00e1lido.').optional(),
  imagen_nombre: z.string().trim().nullable().optional(),
  imagen_alt:    z.string().trim().nullable().optional(),
  orden:         z.number().int().min(0).default(0),
}).refine(
  d => d.archivo_uuid || d.imagen,
  { message: 'Se requiere archivo_uuid o imagen (base64).' },
);

export const varianteSchema = z.object({
  color_uuid:  z.string().uuid('color_uuid debe ser un UUID válido.').nullable().optional(),
  moneda_uuid: z.string().uuid('moneda_uuid debe ser un UUID válido.').nullable().optional(),
  precio:      z.number().int().min(0, 'Precio debe ser un entero no negativo.').default(0),
  descuento:   z.number().int().min(0).max(9999, 'Descuento máximo 99.99% (9999).').default(0),
  stock:       z.number().int().min(0, 'Stock debe ser no negativo.').default(0),
  imagenes:    z.array(varianteImagenSchema).default([]),
});

export const createProductoSchema = z.object({
  nombre:       z.string({ required_error: 'Nombre es requerido.' })
                 .trim().min(1).max(255),
  descripcion:  z.string().trim().nullable().optional(),
  marca:        z.string().trim().max(255).nullable().optional(),
  condicion_uuid: z.string().uuid().nullable().optional(),
  garantia_uuid:  z.string().uuid().nullable().optional(),
  atributos_uuid: z.string().uuid().nullable().optional(),
  atributos:    z.record(z.string(), z.unknown()).nullable().optional(),
  estado:       z.enum(['activo', 'inactivo']).default('activo'),
  variantes:    z.array(varianteSchema).default([]),
});

export type CreateProductoDTO = z.infer<typeof createProductoSchema>;
