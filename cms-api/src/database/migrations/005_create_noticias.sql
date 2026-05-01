-- Migration: 005_create_noticias
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Depends on: 004_create_archivos.sql

CREATE TABLE IF NOT EXISTS noticias (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid          CHAR(36)         NOT NULL,
  titulo        VARCHAR(255)     NOT NULL,
  subtitulo     VARCHAR(500)     NULL      DEFAULT NULL,
  slug          VARCHAR(255)     NOT NULL,
  texto         LONGTEXT         NOT NULL,
  deleted_at    TIMESTAMP        NULL      DEFAULT NULL,
  created_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_noticias_uuid   (uuid),
  UNIQUE  KEY uq_noticias_slug   (slug),
  INDEX   idx_noticias_deleted   (deleted_at),
  FULLTEXT KEY ft_noticias_titulo_subtitulo (titulo, subtitulo)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS news articles';

-- Pivot: noticias ↔ archivos (ordered image gallery)
CREATE TABLE IF NOT EXISTS noticia_imagenes (
  id          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  noticia_id  BIGINT UNSIGNED   NOT NULL,
  archivo_id  BIGINT UNSIGNED   NOT NULL,
  orden       SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_ni_noticia_archivo (noticia_id, archivo_id),
  INDEX   idx_ni_noticia             (noticia_id),
  INDEX   idx_ni_archivo             (archivo_id),
  CONSTRAINT fk_ni_noticia
    FOREIGN KEY (noticia_id) REFERENCES noticias (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ni_archivo
    FOREIGN KEY (archivo_id) REFERENCES archivos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Pivot: noticias ↔ archivos (ordered images)';
