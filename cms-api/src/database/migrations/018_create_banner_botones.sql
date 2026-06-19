-- Migration: 018_create_banner_botones
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Depends on: 004_create_banners.sql
--
-- Motivo: un banner ahora puede tener N botones (antes solo 1, vía las columnas
-- btn_texto / btn_link en la tabla banners). Se crea una tabla 1:N dedicada,
-- siguiendo el mismo patrón que footer_enlaces / footer_legales.

-- ── Tabla de botones del banner ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banner_botones (
  id        BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  banner_id BIGINT UNSIGNED   NOT NULL,
  uuid      CHAR(36)          NOT NULL,
  texto     VARCHAR(100)      NOT NULL,
  link      VARCHAR(500)      NOT NULL,
  variante  ENUM('primary','outline') NOT NULL DEFAULT 'primary',
  orden     SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_bb_uuid    (uuid),
  INDEX      idx_bb_banner  (banner_id),
  INDEX      idx_bb_orden   (orden),
  CONSTRAINT fk_bb_banner
    FOREIGN KEY (banner_id) REFERENCES banners (id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Banner call-to-action buttons (1:N)';

-- ── Migrar el botón existente (btn_texto / btn_link) como primer botón ─────────
-- Solo migra banners que tengan al menos btn_texto cargado.
INSERT INTO banner_botones (banner_id, uuid, texto, link, variante, orden)
SELECT
  b.id,
  UUID(),
  b.btn_texto,
  COALESCE(b.btn_link, '#'),
  'primary',
  0
FROM banners b
WHERE b.btn_texto IS NOT NULL
  AND b.btn_texto <> '';

-- ── Eliminar las columnas viejas de banners ───────────────────────────────────
ALTER TABLE banners
  DROP COLUMN btn_texto,
  DROP COLUMN btn_link;
