-- Migration: 014_create_seo_metadata
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Estrategia: tabla polimórfica única — evita duplicar columnas SEO en cada entidad.
-- entity_type identifica la entidad; entity_uuid acepta UUID estándar o slugs para páginas estáticas.

CREATE TABLE IF NOT EXISTS seo_metadata (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid             CHAR(36)        NOT NULL,
  entity_type      ENUM(
                     'producto',
                     'noticia',
                     'servicio',
                     'nosotros',
                     'empresa',
                     'pagina'
                   )               NOT NULL                  COMMENT 'Tipo de entidad a la que pertenece el SEO',
  entity_uuid      VARCHAR(100)    NOT NULL                  COMMENT 'UUID de la entidad o slug para páginas estáticas',
  title            VARCHAR(70)     NULL DEFAULT NULL         COMMENT 'Título SEO (recomendado ≤ 60 chars)',
  meta_description TEXT            NULL DEFAULT NULL         COMMENT 'Meta descripción (recomendado ≤ 160 chars)',
  meta_keywords    VARCHAR(500)    NULL DEFAULT NULL         COMMENT 'Palabras clave separadas por coma',
  og_title         VARCHAR(95)     NULL DEFAULT NULL         COMMENT 'Open Graph title',
  og_description   TEXT            NULL DEFAULT NULL         COMMENT 'Open Graph description',
  scripts_head     TEXT            NULL DEFAULT NULL         COMMENT 'Scripts/HTML inyectados en <head>',
  scripts_body     TEXT            NULL DEFAULT NULL         COMMENT 'Scripts/HTML inyectados antes de </body>',
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_seo_uuid            (uuid),
  UNIQUE KEY uq_seo_entity          (entity_type, entity_uuid),
  INDEX      idx_seo_entity_type    (entity_type)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Metadatos SEO polimórficos para cualquier entidad del sistema';
