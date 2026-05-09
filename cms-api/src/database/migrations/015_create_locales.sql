-- Migration: 015_create_locales
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Depends on: 004_create_archivos.sql

-- ─── Locales ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locales (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid         CHAR(36)        NOT NULL,
  nombre       VARCHAR(255)    NOT NULL,
  descripcion  LONGTEXT        NOT NULL DEFAULT '',
  deleted_at   TIMESTAMP       NULL     DEFAULT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_locales_uuid  (uuid),
  INDEX  idx_locales_deleted  (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Locales / sucursales del negocio';

-- ─── Pivot: locales ↔ archivos (galería de imágenes ordenadas) ─────────────────
CREATE TABLE IF NOT EXISTS local_imagenes (
  id         BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  local_id   BIGINT UNSIGNED   NOT NULL,
  archivo_id BIGINT UNSIGNED   NOT NULL,
  orden      SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_li_local_archivo (local_id, archivo_id),
  INDEX  idx_li_local            (local_id),
  INDEX  idx_li_archivo          (archivo_id),
  CONSTRAINT fk_li_local
    FOREIGN KEY (local_id) REFERENCES locales (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_li_archivo
    FOREIGN KEY (archivo_id) REFERENCES archivos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Pivot: locales ↔ archivos (galería de imágenes ordenadas)';
