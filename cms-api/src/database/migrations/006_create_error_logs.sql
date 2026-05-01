-- ─────────────────────────────────────────────────────────────────────────────
-- Migración 006: Tabla de bitácora de errores de la API
--
-- Registra todas las excepciones no controladas que pasan por el error handler
-- global, incluyendo contexto HTTP completo (sanitizado) para facilitar la
-- depuración en producción sin exponer información sensible.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS error_logs (
  -- Identificadores
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  uuid          CHAR(36)         NOT NULL COMMENT 'Identificador único externo (UUID v4)',

  -- Clasificación del error
  level         ENUM('error', 'warn', 'info') NOT NULL DEFAULT 'error'
                COMMENT 'Nivel de severidad del evento',
  error_type    VARCHAR(100)     NOT NULL DEFAULT 'Error'
                COMMENT 'Clase del error: AppError, ZodError, TypeError, etc.',
  error_code    VARCHAR(100)     NULL
                COMMENT 'Código semántico del error: NOT_FOUND, VALIDATION_ERROR, ECONNREFUSED, etc.',
  status_code   SMALLINT UNSIGNED NULL
                COMMENT 'Código HTTP devuelto al cliente',

  -- Mensaje y traza
  message       TEXT             NOT NULL  COMMENT 'Mensaje del error',
  stack_trace   LONGTEXT         NULL      COMMENT 'Stack trace completo del error',

  -- Contexto de la request HTTP
  http_method   VARCHAR(10)      NULL      COMMENT 'Método HTTP: GET, POST, PATCH, DELETE, etc.',
  url           VARCHAR(2048)    NULL      COMMENT 'URL completa de la petición',
  route         VARCHAR(512)     NULL      COMMENT 'Patrón de ruta Fastify, ej: /api/v1/banners/:uuid',

  -- Identidad del solicitante
  user_uuid     CHAR(36)         NULL      COMMENT 'UUID del usuario autenticado (extraído del JWT)',
  user_role     VARCHAR(50)      NULL      COMMENT 'Rol del usuario autenticado',
  ip_address    VARCHAR(45)      NULL      COMMENT 'Dirección IP del cliente (soporta IPv4 e IPv6)',
  user_agent    VARCHAR(512)     NULL      COMMENT 'Cabecera User-Agent del cliente',

  -- Payload de la request (datos sanitizados — sin campos sensibles)
  request_body   JSON            NULL      COMMENT 'Body sanitizado: contraseñas e imágenes base64 redactadas',
  request_params JSON            NULL      COMMENT 'Parámetros de ruta (ej: { uuid: "..." })',
  request_query  JSON            NULL      COMMENT 'Parámetros de query string',

  -- Metadatos adicionales
  context       JSON             NULL      COMMENT 'Contexto extra provisto por el llamador',
  hostname      VARCHAR(255)     NULL      COMMENT 'Nombre del host servidor que generó el error',
  node_env      VARCHAR(20)      NULL      COMMENT 'Valor de NODE_ENV: development, production, test',

  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                COMMENT 'Timestamp UTC del registro del error',

  -- Restricciones
  PRIMARY KEY (id),
  UNIQUE  KEY uq_error_logs_uuid       (uuid),
  INDEX   idx_error_logs_level         (level),
  INDEX   idx_error_logs_status_code   (status_code),
  INDEX   idx_error_logs_error_code    (error_code),
  INDEX   idx_error_logs_user_uuid     (user_uuid),
  INDEX   idx_error_logs_created_at    (created_at)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Bitácora de errores de la API — nunca borrar registros, sólo retener';
