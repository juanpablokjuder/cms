-- Migration: 008_create_monedas
-- Tabla independiente de monedas para reutilizar en cualquier módulo.
-- Charset: utf8mb4 / utf8mb4_unicode_ci

CREATE TABLE IF NOT EXISTS monedas (
  id     SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid   CHAR(36)          NOT NULL,
  codigo VARCHAR(3)        NOT NULL,
  nombre VARCHAR(100)      NOT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_monedas_uuid   (uuid),
  UNIQUE KEY uq_monedas_codigo (codigo)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de monedas (ARS, EUR, USD, etc.)';

INSERT IGNORE INTO monedas (uuid, codigo, nombre) VALUES
  (UUID(), 'ARS', 'Peso Argentino'),
  (UUID(), 'EUR', 'Euro'),
  (UUID(), 'USD', 'Dólar Estadounidense');