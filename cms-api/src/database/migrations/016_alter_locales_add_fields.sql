-- Migration: 016_alter_locales_add_fields
-- Agrega campos de contacto y horario de atención a la tabla locales

ALTER TABLE locales
  ADD COLUMN direccion VARCHAR(500) NULL     DEFAULT NULL AFTER descripcion,
  ADD COLUMN telefono  VARCHAR(100) NULL     DEFAULT NULL AFTER direccion,
  ADD COLUMN horarios  LONGTEXT     NULL     DEFAULT NULL AFTER telefono;
