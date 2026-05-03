import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { WebService } from './web.service.js';
import { apiSuccess } from '../../shared/utils/api-response.js';

// ─── Schemas de validación ────────────────────────────────────────────────────

const paginaQuerySchema = z.object({
  pagina: z.string().min(1).optional(),
});

const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive('page debe ser un número positivo.')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50, 'limit no puede superar 50.')
    .default(10),
});

const slugParamSchema = z.object({
  slug: z.string().min(1, 'slug requerido.'),
});

// ─── Controller ───────────────────────────────────────────────────────────────

export class WebController {
  private readonly service: WebService;

  constructor() {
    this.service = new WebService();
  }

  // ── Banners ──────────────────────────────────────────────────────────────

  /**
   * GET /web/banners
   * GET /web/banners?pagina=home
   * Devuelve todos los banners activos, opcionalmente filtrados por página.
   */
  async getBanners(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { pagina } = paginaQuerySchema.parse(request.query);
    const banners = await this.service.getBanners(pagina);
    void reply.code(200).send(apiSuccess(banners));
  }

  // ── Noticias ─────────────────────────────────────────────────────────────

  /**
   * GET /web/noticias?page=1&limit=10
   * Lista paginada de noticias, ordenadas por fecha descendente.
   */
  async getNoticias(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const opts = paginationQuerySchema.parse(request.query);
    const result = await this.service.getNoticias(opts);
    void reply.code(200).send(apiSuccess(result));
  }

  /**
   * GET /web/noticias/:slug
   * Devuelve una noticia por su slug.
   */
  async getNoticiaBySlug(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug } = slugParamSchema.parse(request.params);
    const noticia = await this.service.getNoticiaBySlug(slug);
    void reply.code(200).send(apiSuccess(noticia));
  }

  // ── Nosotros ─────────────────────────────────────────────────────────────

  /**
   * GET /web/nosotros
   * Devuelve el contenido de la sección "Sobre Nosotros" (singleton).
   * Retorna data: null si aún no ha sido creado desde el admin.
   */
  async getNosotros(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const nosotros = await this.service.getNosotros();
    void reply.code(200).send(apiSuccess(nosotros));
  }

  // ── Servicios ────────────────────────────────────────────────────────────

  /**
   * GET /web/servicios
   * Estructura completa: singleton de servicios + categorías activas con sus items activos.
   */
  async getServicios(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = await this.service.getServicios();
    void reply.code(200).send(apiSuccess(data));
  }

  // ── FAQs ─────────────────────────────────────────────────────────────────

  /**
   * GET /web/faqs
   * Todos los grupos de FAQs con sus preguntas y respuestas.
   */
  async getFaqs(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const faqs = await this.service.getFaqs();
    void reply.code(200).send(apiSuccess(faqs));
  }

  // ── Footer ───────────────────────────────────────────────────────────────

  /**
   * GET /web/footer
   * Devuelve el footer activo más reciente.
   * Retorna data: null si aún no ha sido creado.
   */
  async getFooter(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const footer = await this.service.getFooter();
    void reply.code(200).send(apiSuccess(footer));
  }
}
