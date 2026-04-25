-- Migration: 002_create_revoked_tokens
-- Purpose: Token blocklist for explicit logout / forced revocation.
-- The jti (JWT ID) is a UUID stored in every issued token.
-- A background job (or cron) should periodically DELETE WHERE expires_at < NOW().

CREATE TABLE IF NOT EXISTS revoked_tokens (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  jti         CHAR(36)        NOT NULL,
  revoked_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  TIMESTAMP       NOT NULL,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_revoked_jti (jti),
  INDEX   idx_revoked_expires (expires_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Blocklist for invalidated JWT tokens';
