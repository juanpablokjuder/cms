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
import { noticiaRoutes } from './modules/noticias/noticia.routes.js';
import { nosotrosRoutes } from './modules/nosotros/nosotros.routes.js';
import { errorLogRoutes } from './modules/error-logs/error-log.routes.js';
import { servicioRoutes } from './modules/servicios/servicio.routes.js';
import { faqRoutes } from './modules/faqs/faq.routes.js';
import { footerRoutes } from './modules/footer/footer.routes.js';
import { webRoutes } from './modules/web/web.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
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
    exposeHeadRoutes: false,
    bodyLimit: 52428800, // 50 MB
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(fastifyCors, {
    origin: env.NODE_ENV === 'production' ? false : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN },
    verify: { algorithms: ['HS256'] },
  });

  app.setErrorHandler(errorHandler);

  app.setNotFoundHandler((_req, reply) => {
    void reply.code(404).send({
      success: false,
      message: 'Route not found.',
      code: 'ROUTE_NOT_FOUND',
    });
  });

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  await app.register(authRoutes, { prefix: `${env.API_PREFIX}/auth` });
  await app.register(userRoutes, { prefix: `${env.API_PREFIX}/users` });
  await app.register(archivoRoutes, { prefix: `${env.API_PREFIX}/archivos` });
  await app.register(bannerRoutes, { prefix: `${env.API_PREFIX}/banners` });
  await app.register(noticiaRoutes, { prefix: `${env.API_PREFIX}/noticias` });
  await app.register(nosotrosRoutes, { prefix: `${env.API_PREFIX}/nosotros` });
  await app.register(errorLogRoutes, { prefix: `${env.API_PREFIX}/error-logs` });
  await app.register(servicioRoutes, { prefix: env.API_PREFIX });
  await app.register(faqRoutes, { prefix: `${env.API_PREFIX}/faqs` });
  await app.register(footerRoutes, { prefix: `${env.API_PREFIX}/footer` });
  await app.register(webRoutes, { prefix: `${env.API_PREFIX}/web` });

  return app;
}
