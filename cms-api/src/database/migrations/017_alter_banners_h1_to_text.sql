-- Migration: 017_alter_banners_h1_to_text
-- Motivo: el campo h1 ahora se edita con Quill (HTML enriquecido) en cms-admin,
-- por lo que VARCHAR(255) ya no alcanza para el markup generado.
-- Cambia h1 de VARCHAR(255) a TEXT, igual que texto_1 y texto_2.

ALTER TABLE banners
  MODIFY COLUMN h1 TEXT NOT NULL;
