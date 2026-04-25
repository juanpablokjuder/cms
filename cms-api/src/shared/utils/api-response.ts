import type { ApiErrorResponse, ApiSuccessResponse } from '../types/index.js';

/**
 * Wraps any payload in the standard success envelope.
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
): ApiSuccessResponse<T> {
  return { success: true, data, ...(message ? { message } : {}) };
}

/**
 * Builds a standard error envelope (does NOT throw — just shapes the object).
 */
export function apiError(
  message: string,
  options?: { errors?: Record<string, string[]>; code?: string },
): ApiErrorResponse {
  return {
    success: false,
    message,
    ...(options?.errors ? { errors: options.errors } : {}),
    ...(options?.code ? { code: options.code } : {}),
  };
}
