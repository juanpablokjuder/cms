-- Migration: 004_create_archivos
-- Stores metadata for every uploaded file (images, docs, etc.).
-- The physical file lives at UPLOADS_DIR/<path>.
-- Clients reference files via GET /api/v1/archivos/:slug

CREATE TABLE IF NOT EXISTS archivos (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid          CHAR(36)         NOT NULL,
  path          VARCHAR(500)     NOT NULL  COMMENT 'Filename relative to UPLOADS_DIR',
  slug          VARCHAR(500)     NOT NULL  COMMENT 'URL-safe identifier, used in public links',
  alt           VARCHAR(255)     NULL      DEFAULT NULL,
  title         VARCHAR(255)     NULL      DEFAULT NULL,
  formato       VARCHAR(20)      NOT NULL  COMMENT 'File extension: png, jpg, webp, etc.',
  deleted_at    TIMESTAMP        NULL      DEFAULT NULL,
  created_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_archivos_uuid  (uuid),
  UNIQUE  KEY uq_archivos_slug  (slug),
  INDEX   idx_archivos_deleted  (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS uploaded files registry';
