-- Migration: 006_create_faqs
-- Depends on: 004_create_archivos.sql

CREATE TABLE IF NOT EXISTS faqs (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid        CHAR(36)         NOT NULL,
  titulo      VARCHAR(255)     NOT NULL,
  id_imagen   BIGINT UNSIGNED  NULL      DEFAULT NULL COMMENT 'FK → archivos.id',
  deleted_at  TIMESTAMP        NULL      DEFAULT NULL,
  created_at  TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_faqs_uuid   (uuid),
  INDEX      idx_faqs_deleted (deleted_at),
  CONSTRAINT fk_faqs_imagen
    FOREIGN KEY (id_imagen) REFERENCES archivos (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS FAQ sections';

-- Items (preguntas + respuestas) con orden modificable
CREATE TABLE IF NOT EXISTS faq_items (
  id        BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  faq_id    BIGINT UNSIGNED   NOT NULL,
  uuid      CHAR(36)          NOT NULL,
  pregunta  TEXT              NOT NULL,
  respuesta LONGTEXT          NOT NULL,
  orden     SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_faq_items_uuid (uuid),
  INDEX      idx_fi_faq         (faq_id),
  INDEX      idx_fi_orden        (orden),
  CONSTRAINT fk_fi_faq
    FOREIGN KEY (faq_id) REFERENCES faqs (id)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Individual FAQ question/answer pairs';
