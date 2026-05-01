-- Migration: 009_create_servicios
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Depends on: 004_create_archivos.sql, 008_create_monedas.sql

-- ─── Tabla principal (singleton) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicios (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36)        NOT NULL,
  titulo     VARCHAR(255)    NOT NULL,
  subtitulo  VARCHAR(500)    NULL     DEFAULT NULL,
  deleted_at TIMESTAMP       NULL     DEFAULT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_servicios_uuid (uuid),
  INDEX idx_servicios_deleted  (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Sección Servicios — registro singleton (titulo / subtitulo)';

-- ─── Categorías de servicios ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicios_categorias (
  id         BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36)          NOT NULL,
  nombre     VARCHAR(255)      NOT NULL,
  orden      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  estado     TINYINT(1)        NOT NULL DEFAULT 1 COMMENT '1=activo 0=inactivo',
  deleted_at TIMESTAMP         NULL     DEFAULT NULL,
  created_at TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_servicios_cat_uuid (uuid),
  INDEX idx_servicios_cat_deleted  (deleted_at),
  INDEX idx_servicios_cat_orden    (orden)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Categorías de servicios';

-- ─── Items de servicios ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicios_items (
  id           BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  uuid         CHAR(36)          NOT NULL,
  categoria_id BIGINT UNSIGNED   NULL     DEFAULT NULL,
  titulo       VARCHAR(255)      NOT NULL,
  subtitulo_1  VARCHAR(500)      NULL     DEFAULT NULL,
  subtitulo_2  VARCHAR(500)      NULL     DEFAULT NULL,
  precio       DECIMAL(12,2)     NULL     DEFAULT NULL,
  moneda_id    SMALLINT UNSIGNED NULL     DEFAULT NULL,
  btn_titulo   VARCHAR(255)      NULL     DEFAULT NULL,
  btn_link     VARCHAR(2048)     NULL     DEFAULT NULL,
  texto        LONGTEXT          NULL     DEFAULT NULL,
  estado       ENUM('activo','inactivo','no_mostrar') NOT NULL DEFAULT 'activo',
  deleted_at   TIMESTAMP         NULL     DEFAULT NULL,
  created_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_servicios_item_uuid (uuid),
  INDEX idx_servicios_item_deleted  (deleted_at),
  INDEX idx_servicios_item_cat      (categoria_id),
  INDEX idx_servicios_item_moneda   (moneda_id),
  INDEX idx_servicios_item_estado   (estado),
  CONSTRAINT fk_si_categoria
    FOREIGN KEY (categoria_id) REFERENCES servicios_categorias (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_si_moneda
    FOREIGN KEY (moneda_id) REFERENCES monedas (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Items/planes de servicios';

-- ─── Imágenes de items de servicios ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicio_item_imagenes (
  id       BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  item_id  BIGINT UNSIGNED   NOT NULL,
  archivo_id BIGINT UNSIGNED NOT NULL,
  orden    SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_sii_item_archivo (item_id, archivo_id),
  INDEX idx_sii_item             (item_id),
  INDEX idx_sii_archivo          (archivo_id),
  CONSTRAINT fk_sii_item
    FOREIGN KEY (item_id) REFERENCES servicios_items (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_sii_archivo
    FOREIGN KEY (archivo_id) REFERENCES archivos (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Pivot: servicios_items ↔ archivos (galería de imágenes del item)';
