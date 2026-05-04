-- Migration: 008_create_empresa
-- Tabla singleton: solo puede existir un registro activo.
-- Almacena los datos de contacto institucional de la empresa.

CREATE TABLE IF NOT EXISTS empresa (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36)        NOT NULL,
  nombre     VARCHAR(255)    NOT NULL,
  telefono   VARCHAR(100)    NULL DEFAULT NULL,
  mail       VARCHAR(255)    NULL DEFAULT NULL,
  direccion  VARCHAR(500)    NULL DEFAULT NULL,
  deleted_at TIMESTAMP       NULL DEFAULT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_empresa_uuid    (uuid),
  INDEX      idx_empresa_deleted (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS — datos institucionales de la empresa (singleton)';
