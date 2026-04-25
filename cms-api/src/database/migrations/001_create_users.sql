-- Migration: 001_create_users
-- Charset: utf8mb4 (full Unicode, including emoji)
-- Collation: utf8mb4_unicode_ci (case-insensitive, accent-aware comparisons)
-- NOTE: Never store the numeric `id` in external references; use `uuid` instead.

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid          CHAR(36)         NOT NULL,
  name          VARCHAR(150)     NOT NULL,
  email         VARCHAR(255)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  role          ENUM(
                  'admin',
                  'editor',
                  'viewer'
                )                NOT NULL DEFAULT 'viewer',
  is_active     TINYINT(1)       NOT NULL DEFAULT 1,
  deleted_at    TIMESTAMP        NULL     DEFAULT NULL,
  created_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_users_uuid  (uuid),
  UNIQUE  KEY uq_users_email (email),
  INDEX   idx_users_role      (role),
  INDEX   idx_users_deleted   (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS system users';
