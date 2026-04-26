import Fastify, { type FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import { env } from './config/env.js';
import { errorHandler } from './shared/middlewares/error-handler.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { archivoRoutes } from './modules/archivos/archivo.routes.js';
import { bannerRoutes } from './modules/banners/banner.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    // Structured logging: pretty in dev, JSON in production (for log aggregators).
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'info',
      ...(env.NODE_ENV !== 'production'
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
            },
          }
        : {}),
    },
    // Do not expose internals in error messages
    exposeHeadRoutes: false,
  });

  // ── Security headers (OWASP hardening) ──────────────────────────────────────
  await app.register(fastifyHelmet, {
    // Disable CSP here — set it per-route/in nginx for fine-grained control
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // ── CORS ─────────────────────────────────────────────────────────────────────
  await app.register(fastifyCors, {
    origin: env.NODE_ENV === 'production' ? false : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── JWT ───────────────────────────────────────────────────────────────────────
  // Algorithm HS256 — symmetric, fast, suitable for internal APIs.
  // For distributed microservices, consider RS256 with JWKS.
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      algorithm: 'HS256',
      expiresIn: env.JWT_EXPIRES_IN,
    },
    // Reject tokens without these claims
    verify: {
      algorithms: ['HS256'],
    },
  });

  // ── Global error handler ──────────────────────────────────────────────────────
  app.setErrorHandler(errorHandler);

  // ── 404 handler ───────────────────────────────────────────────────────────────
  app.setNotFoundHandler((_req, reply) => {
    void reply.code(404).send({
      success: false,
      message: 'Route not found.',
      code: 'ROUTE_NOT_FOUND',
    });
  });

  // ── Health check (no auth — used by load balancers) ───────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // ── Feature routes ────────────────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: `${env.API_PREFIX}/auth` });
  await app.register(userRoutes, { prefix: `${env.API_PREFIX}/users` });
  await app.register(archivoRoutes, { prefix: `${env.API_PREFIX}/archivos` });
  await app.register(bannerRoutes, { prefix: `${env.API_PREFIX}/banners` });

  return app;
}
