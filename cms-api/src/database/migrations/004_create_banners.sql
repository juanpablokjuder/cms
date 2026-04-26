-- Migration: 004_create_banners
-- Charset: utf8mb4 (full Unicode, including emoji)
-- Collation: utf8mb4_unicode_ci (case-insensitive, accent-aware comparisons)
-- NOTE: Never store the numeric `id` in external references; use `uuid` instead.
-- Depends on: 004_create_archivos.sql (archivos table must exist first)

CREATE TABLE IF NOT EXISTS banners (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid          CHAR(36)         NOT NULL,
  pagina        VARCHAR(100)     NOT NULL,
  id_imagen     BIGINT UNSIGNED  NULL      DEFAULT NULL COMMENT 'FK → archivos.id',
  h1            VARCHAR(255)     NOT NULL,
  texto_1       TEXT             NULL      DEFAULT NULL,
  texto_2       TEXT             NULL      DEFAULT NULL,
  btn_texto     VARCHAR(100)     NULL      DEFAULT NULL,
  btn_link      VARCHAR(500)     NULL      DEFAULT NULL,
  orden         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  deleted_at    TIMESTAMP        NULL      DEFAULT NULL,
  created_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_banners_uuid    (uuid),
  INDEX   idx_banners_pagina     (pagina),
  INDEX   idx_banners_orden      (orden),
  INDEX   idx_banners_deleted    (deleted_at),
  CONSTRAINT fk_banners_imagen
    FOREIGN KEY (id_imagen) REFERENCES archivos (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS page banners';
