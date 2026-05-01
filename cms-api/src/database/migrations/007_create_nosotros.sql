-- Migration: 007_create_nosotros
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Depends on: 004_create_archivos.sql
-- Descripción: Tabla singleton para la sección "Nosotros".
--              Solo puede existir un registro activo a la vez.

CREATE TABLE IF NOT EXISTS nosotros (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid          CHAR(36)         NOT NULL,
  titulo        VARCHAR(255)     NOT NULL,
  subtitulo     VARCHAR(500)     NULL      DEFAULT NULL,
  texto         LONGTEXT         NOT NULL,
  deleted_at    TIMESTAMP        NULL      DEFAULT NULL,
  created_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_nosotros_uuid  (uuid),
  INDEX   idx_nosotros_deleted  (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS singleton: sección Nosotros';

-- Pivot: nosotros ↔ archivos (galería de imágenes ordenada)
CREATE TABLE IF NOT EXISTS nosotros_imagenes (
  id           BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  nosotros_id  BIGINT UNSIGNED   NOT NULL,
  archivo_id   BIGINT UNSIGNED   NOT NULL,
  orden        SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_nosi_nosotros_archivo (nosotros_id, archivo_id),
  INDEX   idx_nosi_nosotros             (nosotros_id),
  INDEX   idx_nosi_archivo              (archivo_id),
  CONSTRAINT fk_nosi_nosotros
    FOREIGN KEY (nosotros_id) REFERENCES nosotros (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_nosi_archivo
    FOREIGN KEY (archivo_id) REFERENCES archivos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Pivot: nosotros ↔ archivos (imágenes ordenadas)';
