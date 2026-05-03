import type { FastifyInstance } from 'fastify';
import { WebController } from './web.controller.js';
import { authenticateWebToken } from '../../shared/middlewares/web-token.middleware.js';

/**
 * Rutas públicas del módulo WEB — registradas bajo el prefijo definido en app.ts
 * (por defecto: /api/v1/web)
 *
 * Autenticación: token estático WEB_API_TOKEN enviado en el header
 *   Authorization: Bearer <WEB_API_TOKEN>
 * No requiere JWT ni sesión de usuario.
 *
 * ┌──────────────────────────────────┬────────┬────────────────────────────────┐
 * │ Endpoint                         │ Método │ Descripción                    │
 * ├──────────────────────────────────┼────────┼────────────────────────────────┤
 * │ /api/v1/web/banners              │ GET    │ Todos los banners activos       │
 * │ /api/v1/web/banners?pagina=home  │ GET    │ Banners filtrados por página    │
 * │ /api/v1/web/noticias             │ GET    │ Noticias paginadas              │
 * │ /api/v1/web/noticias/:slug       │ GET    │ Noticia por slug                │
 * │ /api/v1/web/nosotros             │ GET    │ Sección "Sobre Nosotros"        │
 * │ /api/v1/web/servicios            │ GET    │ Estructura completa de servicios│
 * │ /api/v1/web/faqs                 │ GET    │ FAQs con preguntas/respuestas   │
 * │ /api/v1/web/footer               │ GET    │ Footer activo                  │
 * └──────────────────────────────────┴────────┴────────────────────────────────┘
 */
export async function webRoutes(fastify: FastifyInstance): Promise<void> {
  const ctrl = new WebController();

  // ── Banners ───────────────────────────────────────────────────────────────
  fastify.get(
    '/banners',
    { preHandler: [authenticateWebToken] },
    (req, rep) => ctrl.getBanners(req, rep),
  );

  // ── Noticias ──────────────────────────────────────────────────────────────
  fastify.get(
    '/noticias',
    { preHandler: [authenticateWebToken] },
    (req, rep) => ctrl.getNoticias(req, rep),
  );

  fastify.get(
    '/noticias/:slug',
    { preHandler: [authenticateWebToken] },
    (req, rep) => ctrl.getNoticiaBySlug(req, rep),
  );

  // ── Nosotros ──────────────────────────────────────────────────────────────
  fastify.get(
    '/nosotros',
    { preHandler: [authenticateWebToken] },
    (req, rep) => ctrl.getNosotros(req, rep),
  );

  // ── Servicios ─────────────────────────────────────────────────────────────
  fastify.get(
    '/servicios',
    { preHandler: [authenticateWebToken] },
    (req, rep) => ctrl.getServicios(req, rep),
  );

  // ── FAQs ──────────────────────────────────────────────────────────────────
  fastify.get(
    '/faqs',
    { preHandler: [authenticateWebToken] },
    (req, rep) => ctrl.getFaqs(req, rep),
  );

  // ── Footer ────────────────────────────────────────────────────────────────
  fastify.get(
    '/footer',
    { preHandler: [authenticateWebToken] },
    (req, rep) => ctrl.getFooter(req, rep),
  );
}
