-- Migration: 007_create_footer
-- Depends on: 004_create_archivos.sql

-- ── Tabla principal ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid            CHAR(36)         NOT NULL,
  columnas_count  TINYINT UNSIGNED NOT NULL DEFAULT 3 COMMENT '1–5',
  copyright_text  VARCHAR(500)     NULL     DEFAULT NULL,
  deleted_at      TIMESTAMP        NULL     DEFAULT NULL,
  created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_footer_uuid    (uuid),
  INDEX      idx_footer_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS footer configurations';

-- ── Columnas del footer ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer_columnas (
  id        BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  footer_id BIGINT UNSIGNED  NOT NULL,
  uuid      CHAR(36)         NOT NULL,
  tipo      ENUM('media_texto','lista_enlaces','contacto') NOT NULL,
  orden     TINYINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_fc_uuid    (uuid),
  INDEX      idx_fc_footer  (footer_id),
  INDEX      idx_fc_orden   (orden),
  CONSTRAINT fk_fc_footer
    FOREIGN KEY (footer_id) REFERENCES footer (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Footer column blocks';

-- ── Bloque Media / Texto ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer_media_texto (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  columna_id BIGINT UNSIGNED NOT NULL,
  id_imagen  BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'FK → archivos.id',
  descripcion TEXT           NULL DEFAULT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_fmt_columna (columna_id),
  CONSTRAINT fk_fmt_columna
    FOREIGN KEY (columna_id) REFERENCES footer_columnas (id) ON DELETE CASCADE,
  CONSTRAINT fk_fmt_imagen
    FOREIGN KEY (id_imagen) REFERENCES archivos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Footer media/text block data';

-- ── Bloque Lista de enlaces ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer_enlaces (
  id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  columna_id BIGINT UNSIGNED  NOT NULL,
  uuid       CHAR(36)         NOT NULL,
  texto      VARCHAR(255)     NOT NULL,
  url        VARCHAR(500)     NOT NULL,
  orden      SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_fe_uuid      (uuid),
  INDEX      idx_fe_columna   (columna_id),
  INDEX      idx_fe_orden     (orden),
  CONSTRAINT fk_fe_columna
    FOREIGN KEY (columna_id) REFERENCES footer_columnas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Footer link list items';

-- ── Bloque Contacto ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer_contacto (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  columna_id BIGINT UNSIGNED NOT NULL,
  direccion  VARCHAR(500)    NULL DEFAULT NULL,
  telefono   VARCHAR(100)    NULL DEFAULT NULL,
  email      VARCHAR(255)    NULL DEFAULT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_fco_columna (columna_id),
  CONSTRAINT fk_fco_columna
    FOREIGN KEY (columna_id) REFERENCES footer_columnas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Footer contact block data';

-- ── Redes sociales ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer_redes (
  id        BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  footer_id BIGINT UNSIGNED  NOT NULL,
  uuid      CHAR(36)         NOT NULL,
  nombre    VARCHAR(100)     NOT NULL,
  url       VARCHAR(500)     NOT NULL,
  svg_icon  TEXT             NOT NULL COMMENT 'Raw SVG markup',
  orden     SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_fr_uuid    (uuid),
  INDEX      idx_fr_footer  (footer_id),
  INDEX      idx_fr_orden   (orden),
  CONSTRAINT fk_fr_footer
    FOREIGN KEY (footer_id) REFERENCES footer (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Footer social network links';

-- ── Legales (bottom footer links) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS footer_legales (
  id        BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  footer_id BIGINT UNSIGNED  NOT NULL,
  uuid      CHAR(36)         NOT NULL,
  texto     VARCHAR(255)     NOT NULL,
  url       VARCHAR(500)     NOT NULL,
  orden     SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_fl_uuid    (uuid),
  INDEX      idx_fl_footer  (footer_id),
  INDEX      idx_fl_orden   (orden),
  CONSTRAINT fk_fl_footer
    FOREIGN KEY (footer_id) REFERENCES footer (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Footer bottom legal links';
