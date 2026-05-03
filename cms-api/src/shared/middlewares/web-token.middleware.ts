import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../../config/env.js';
import { AppError } from '../utils/app-error.js';

/**
 * Middleware de autenticación para los endpoints públicos del módulo WEB.
 *
 * No utiliza JWT. Valida un token estático definido en la variable de entorno
 * WEB_API_TOKEN, enviado en el header:
 *   Authorization: Bearer <WEB_API_TOKEN>
 *
 * Adjuntar como `preHandler` en las rutas del módulo web.
 */
export async function authenticateWebToken(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('Web API token requerido. Enviar en: Authorization: Bearer <token>');
  }

  const token = authHeader.slice(7); // strip "Bearer "

  if (token !== env.WEB_API_TOKEN) {
    throw AppError.unauthorized('Web API token inválido.');
  }
}
