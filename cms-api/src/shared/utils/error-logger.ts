import os from 'node:os';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';
import type { FastifyRequest } from 'fastify';
import { db } from '../../database/connection.js';
import { env } from '../../config/env.js';
import { AppError } from './app-error.js';

// ─── Campos sensibles que jamás deben aparecer en los logs ────────────────────
const SENSITIVE_FIELDS = new Set([
  'password', 'password_hash', 'passwordhash', 'pass',
  'token', 'secret', 'authorization', 'refresh_token',
  'jwt', 'api_key', 'apikey',
]);

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LogLevel = 'error' | 'warn' | 'info';

export interface LogErrorOptions {
  /** Request de Fastify — si se provee, se extrae todo el contexto HTTP. */
  request?: FastifyRequest;
  /** Nivel de severidad. Por defecto: 'error'. */
  level?: LogLevel;
  /** Código HTTP que se envió al cliente. */
  statusCode?: number;
  /** Datos adicionales de contexto (pares clave-valor libres). */
  context?: Record<string, unknown>;
}

// ─── Sanitización del body ────────────────────────────────────────────────────

/**
 * Elimina campos sensibles del body y trunca base64 para que los logs
 * no almacenen contraseñas ni imágenes de varios MB.
 */
function sanitizeBody(body: unknown): Record<string, unknown> | null {
  if (body === null || body === undefined || typeof body !== 'object') return null;
  if (Array.isArray(body)) return null;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_FIELDS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Datos base64 (ej: imagen en banner) — reemplazar para no saturar la BD
    if (typeof value === 'string' && value.startsWith('data:')) {
      sanitized[key] = '[BASE64_DATA]';
      continue;
    }

    // Objetos anidados — sanitizar recursivamente (un nivel)
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeBody(value);
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

// ─── Extracción del usuario autenticado ──────────────────────────────────────

function extractUser(request: FastifyRequest): { userUuid: string | null; userRole: string | null } {
  try {
    const user = request.user as { sub?: string; role?: string } | undefined;
    return {
      userUuid: user?.sub  ?? null,
      userRole: user?.role ?? null,
    };
  } catch {
    // El JWT puede no estar verificado (ruta pública) — ignorar
    return { userUuid: null, userRole: null };
  }
}

// ─── Resolución del nivel de severidad ───────────────────────────────────────

function resolveLevel(error: unknown, forcedLevel?: LogLevel): LogLevel {
  if (forcedLevel) return forcedLevel;

  if (error instanceof AppError) {
    return error.statusCode >= 500 ? 'error' : 'warn';
  }

  if (error instanceof ZodError) return 'warn';

  const status = (error as { statusCode?: number }).statusCode;
  if (typeof status === 'number') {
    return status >= 500 ? 'error' : 'warn';
  }

  return 'error';
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Registra un error en la tabla `error_logs`.
 *
 * - Completamente **fire-and-forget**: nunca lanza excepciones hacia el llamador.
 * - Si la BD no está disponible, hace fallback a `console.error`.
 * - Los datos sensibles del body se redactan automáticamente.
 *
 * @example
 * // En un catch genérico sin contexto HTTP:
 * await logError(err, { context: { job: 'cleanup-task' } });
 *
 * // En el error handler de Fastify (con request completo):
 * await logError(err, { request, statusCode: 500 });
 */
export async function logError(
  error: unknown,
  options: LogErrorOptions = {},
): Promise<void> {
  try {
    const { request, context, statusCode } = options;

    // ── Normalizar el error ────────────────────────────────────────────────

    let message    = 'Unknown error';
    let stack      : string | null = null;
    let errorType  = 'Error';
    let errorCode  : string | null = null;
    let resolvedStatus = statusCode ?? 500;

    if (error instanceof AppError) {
      message        = error.message;
      stack          = error.stack ?? null;
      errorType      = 'AppError';
      errorCode      = error.code;
      resolvedStatus = statusCode ?? error.statusCode;
    } else if (error instanceof ZodError) {
      message        = `Validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(' | ')}`;
      stack          = error.stack ?? null;
      errorType      = 'ZodError';
      errorCode      = 'VALIDATION_ERROR';
      resolvedStatus = statusCode ?? 422;
    } else if (error instanceof Error) {
      message    = error.message;
      stack      = error.stack ?? null;
      errorType  = error.constructor.name || 'Error';
      errorCode  = (error as NodeJS.ErrnoException).code ?? null;
    } else {
      message = String(error);
    }

    const level = resolveLevel(error, options.level);

    // ── Extraer contexto HTTP ─────────────────────────────────────────────

    let httpMethod     : string | null = null;
    let url            : string | null = null;
    let route          : string | null = null;
    let userUuid       : string | null = null;
    let userRole       : string | null = null;
    let ipAddress      : string | null = null;
    let userAgent      : string | null = null;
    let requestBody    : Record<string, unknown> | null = null;
    let requestParams  : Record<string, unknown> | null = null;
    let requestQuery   : Record<string, unknown> | null = null;

    if (request) {
      httpMethod    = request.method;
      url           = request.url ?? null;
      ipAddress     = request.ip  ?? null;
      userAgent     = (request.headers['user-agent'] as string | undefined) ?? null;
      requestBody   = sanitizeBody(request.body);
      requestParams = (request.params as Record<string, unknown>) ?? null;
      requestQuery  = (request.query  as Record<string, unknown>) ?? null;

      // Patrón de ruta registrado por Fastify (ej: /api/v1/banners/:uuid)
      try {
        route = (request as { routeOptions?: { url?: string } }).routeOptions?.url ?? null;
      } catch { /* noop */ }

      const extracted = extractUser(request);
      userUuid = extracted.userUuid;
      userRole = extracted.userRole;
    }

    // ── Insertar en BD ────────────────────────────────────────────────────

    await db.query(
      `INSERT INTO error_logs
         (uuid, level, error_type, error_code, status_code, message, stack_trace,
          http_method, url, route, user_uuid, user_role, ip_address, user_agent,
          request_body, request_params, request_query, context, hostname, node_env)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        level,
        errorType,
        errorCode,
        resolvedStatus,
        message.slice(0, 65_535),
        stack,
        httpMethod,
        url    ? url.slice(0, 2_048)        : null,
        route  ? route.slice(0, 512)        : null,
        userUuid,
        userRole,
        ipAddress,
        userAgent ? userAgent.slice(0, 512) : null,
        requestBody    ? JSON.stringify(requestBody)    : null,
        requestParams  ? JSON.stringify(requestParams)  : null,
        requestQuery   ? JSON.stringify(requestQuery)   : null,
        context        ? JSON.stringify(context)        : null,
        os.hostname().slice(0, 255),
        env.NODE_ENV,
      ],
    );

  } catch (logErr) {
    // El logging nunca debe romper el flujo principal de la aplicación
    console.error('[ErrorLogger] No se pudo escribir en error_logs (BD):', logErr);
    console.error('[ErrorLogger] Error original:', error);
  }
}
