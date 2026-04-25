import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';
import { apiError } from '../utils/api-response.js';

/**
 * Global Fastify error handler.
 * Normalises AppError, ZodError, and all other errors into the
 * standard `{ success: false, message, code }` envelope.
 */
export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  // ── Zod validation errors ─────────────────────────────────────────────────
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || '_root';
      fieldErrors[key] ??= [];
      fieldErrors[key].push(issue.message);
    }
    void reply.code(422).send(
      apiError('Validation failed.', { errors: fieldErrors, code: 'VALIDATION_ERROR' }),
    );
    return;
  }

  // ── Application domain errors ─────────────────────────────────────────────
  if (error instanceof AppError) {
    void reply
      .code(error.statusCode)
      .send(apiError(error.message, { code: error.code }));
    return;
  }

  // ── Fastify built-in errors (e.g. 404 route not found) ───────────────────
  const statusCode =
    'statusCode' in error && typeof error.statusCode === 'number'
      ? error.statusCode
      : 500;

  // Never leak stack traces to the client in production.
  const message =
    statusCode < 500
      ? error.message
      : 'An unexpected error occurred. Please try again later.';

  void reply
    .code(statusCode)
    .send(apiError(message, { code: 'INTERNAL_ERROR' }));
}
