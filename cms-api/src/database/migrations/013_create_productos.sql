-- Migration: 013_create_productos
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Depends on: 004_create_archivos.sql, 008_create_monedas.sql

-- ─── Colores ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colores (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36)        NOT NULL,
  nombre     VARCHAR(100)    NOT NULL,
  imagen_id  BIGINT UNSIGNED NULL     DEFAULT NULL COMMENT 'FK → archivos.id (swatch)',
  deleted_at TIMESTAMP       NULL     DEFAULT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_colores_uuid   (uuid),
  INDEX idx_colores_deleted    (deleted_at),
  CONSTRAINT fk_colores_imagen
    FOREIGN KEY (imagen_id) REFERENCES archivos (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Colores disponibles para variantes de producto';

-- ─── Condiciones de producto ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos_condiciones (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36)        NOT NULL,
  nombre     VARCHAR(100)    NOT NULL,
  deleted_at TIMESTAMP       NULL     DEFAULT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_prod_condicion_uuid (uuid)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Condiciones de producto: nuevo, usado, restaurado';

INSERT IGNORE INTO productos_condiciones (uuid, nombre) VALUES
  (UUID(), 'Nuevo'),
  (UUID(), 'Usado'),
  (UUID(), 'Restaurado');

-- ─── Garantías de producto ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos_garantias (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36)        NOT NULL,
  nombre     VARCHAR(100)    NOT NULL,
  deleted_at TIMESTAMP       NULL     DEFAULT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_prod_garantia_uuid (uuid)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Tipos de garantía: sin garantía, vendedor, fábrica';

INSERT IGNORE INTO productos_garantias (uuid, nombre) VALUES
  (UUID(), 'Sin garantía'),
  (UUID(), 'Garantía del vendedor'),
  (UUID(), 'Garantía de fábrica');

-- ─── Plantillas de atributos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos_atributos (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36)        NOT NULL,
  nombre     VARCHAR(255)    NOT NULL COMMENT 'Ej: Ropa, Electrónico',
  atributos  JSON            NOT NULL COMMENT 'Schema base: {"talle":"string","tela":"string"}',
  deleted_at TIMESTAMP       NULL     DEFAULT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_prod_atrib_uuid (uuid),
  INDEX idx_prod_atrib_deleted  (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Plantillas de atributos dinámicos por tipo de producto';

-- ─── Productos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid             CHAR(36)        NOT NULL,
  nombre           VARCHAR(255)    NOT NULL,
  descripcion      TEXT            NULL     DEFAULT NULL,
  marca            VARCHAR(255)    NULL     DEFAULT NULL,
  condicion_id     BIGINT UNSIGNED NULL     DEFAULT NULL,
  garantia_id      BIGINT UNSIGNED NULL     DEFAULT NULL,
  atributos_id     BIGINT UNSIGNED NULL     DEFAULT NULL COMMENT 'FK → productos_atributos',
  atributos        JSON            NULL     DEFAULT NULL COMMENT 'Valores reales del producto',
  usuario_creador_id BIGINT UNSIGNED NULL   DEFAULT NULL,
  usuario_update_id  BIGINT UNSIGNED NULL   DEFAULT NULL,
  estado           ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
  deleted_at       TIMESTAMP       NULL     DEFAULT NULL,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_productos_uuid      (uuid),
  INDEX idx_productos_deleted       (deleted_at),
  INDEX idx_productos_condicion     (condicion_id),
  INDEX idx_productos_garantia      (garantia_id),
  INDEX idx_productos_atributos     (atributos_id),
  INDEX idx_productos_creador       (usuario_creador_id),
  INDEX idx_productos_estado        (estado),
  CONSTRAINT fk_prod_condicion
    FOREIGN KEY (condicion_id)   REFERENCES productos_condiciones (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_prod_garantia
    FOREIGN KEY (garantia_id)    REFERENCES productos_garantias (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_prod_atributos
    FOREIGN KEY (atributos_id)   REFERENCES productos_atributos (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_prod_creador
    FOREIGN KEY (usuario_creador_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_prod_updater
    FOREIGN KEY (usuario_update_id)  REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de productos';

-- ─── Variantes de producto por color ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos_colores (
  id          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  uuid        CHAR(36)          NOT NULL,
  producto_id BIGINT UNSIGNED   NOT NULL,
  color_id    BIGINT UNSIGNED   NULL     DEFAULT NULL,
  moneda_id   SMALLINT UNSIGNED NULL     DEFAULT NULL,
  precio      BIGINT UNSIGNED   NOT NULL DEFAULT 0 COMMENT 'Precio en centavos (ej: 1050 = $10.50)',
  descuento   SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Descuento en centésimas (ej: 2550 = 25.50%)',
  stock       INT UNSIGNED      NOT NULL DEFAULT 0,
  deleted_at  TIMESTAMP         NULL     DEFAULT NULL,
  created_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_prod_color_uuid     (uuid),
  INDEX idx_prod_color_deleted      (deleted_at),
  INDEX idx_prod_color_producto     (producto_id),
  INDEX idx_prod_color_color        (color_id),
  INDEX idx_prod_color_moneda       (moneda_id),
  CONSTRAINT fk_pc_producto
    FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pc_color
    FOREIGN KEY (color_id)    REFERENCES colores (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_pc_moneda
    FOREIGN KEY (moneda_id)   REFERENCES monedas (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Variantes de producto por color con precio y stock';

-- ─── Imágenes de variante de producto ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos_imagenes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid        CHAR(36)        NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  archivo_id  BIGINT UNSIGNED NOT NULL,
  color_id    BIGINT UNSIGNED NULL     DEFAULT NULL COMMENT 'NULL = imagen genérica del producto',
  orden       SMALLINT        NOT NULL DEFAULT 0,
  deleted_at  TIMESTAMP       NULL     DEFAULT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_prod_img_uuid    (uuid),
  INDEX idx_prod_img_deleted     (deleted_at),
  INDEX idx_prod_img_producto    (producto_id),
  INDEX idx_prod_img_archivo     (archivo_id),
  INDEX idx_prod_img_color       (color_id),
  CONSTRAINT fk_pi_producto
    FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pi_archivo
    FOREIGN KEY (archivo_id)  REFERENCES archivos (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pi_color
    FOREIGN KEY (color_id)    REFERENCES colores (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Imágenes de producto asociadas a una variante de color';
