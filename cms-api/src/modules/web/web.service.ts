import { BannerService } from '../banners/banner.service.js';
import { NoticiaService } from '../noticias/noticia.service.js';
import { NosotrosService } from '../nosotros/nosotros.service.js';
import { ServicioService } from '../servicios/servicio.service.js';
import { FaqService } from '../faqs/faq.service.js';
import { FooterService } from '../footer/footer.service.js';
import type {
  PublicBanner,
  PublicNoticia,
  PublicNosotros,
  PublicServicio,
  PublicServicioCategoria,
  PublicServicioItem,
  PublicFaq,
  PublicFooter,
  PaginatedResult,
  PaginationOptions,
} from '../../shared/types/index.js';

// ─── Tipos de respuesta específicos del módulo web ────────────────────────────

export interface WebCategoriaConItems extends PublicServicioCategoria {
  items: PublicServicioItem[];
}

export interface WebServiciosData {
  servicio:   PublicServicio | null;
  categorias: WebCategoriaConItems[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class WebService {
  private readonly bannerService:   BannerService;
  private readonly noticiaService:  NoticiaService;
  private readonly nosotrosService: NosotrosService;
  private readonly servicioService: ServicioService;
  private readonly faqService:      FaqService;
  private readonly footerService:   FooterService;

  constructor() {
    this.bannerService   = new BannerService();
    this.noticiaService  = new NoticiaService();
    this.nosotrosService = new NosotrosService();
    this.servicioService = new ServicioService();
    this.faqService      = new FaqService();
    this.footerService   = new FooterService();
  }

  // ─── Banners ───────────────────────────────────────────────────────────────

  /**
   * Todos los banners activos. Opcionalmente filtrados por `pagina`.
   */
  async getBanners(pagina?: string): Promise<PublicBanner[]> {
    return this.bannerService.listAllForWeb(pagina);
  }

  // ─── Noticias ──────────────────────────────────────────────────────────────

  async getNoticias(opts: PaginationOptions): Promise<PaginatedResult<PublicNoticia>> {
    return this.noticiaService.list(opts);
  }

  async getNoticiaBySlug(slug: string): Promise<PublicNoticia> {
    return this.noticiaService.findBySlug(slug);
  }

  // ─── Nosotros ──────────────────────────────────────────────────────────────

  async getNosotros(): Promise<PublicNosotros | null> {
    return this.nosotrosService.findOne();
  }

  // ─── Servicios ─────────────────────────────────────────────────────────────

  /**
   * Estructura completa de servicios:
   * - Datos del singleton Servicios
   * - Listado de categorías activas, cada una con sus items activos
   */
  async getServicios(): Promise<WebServiciosData> {
    const [servicio, categorias] = await Promise.all([
      this.servicioService.getServicio(),
      this.servicioService.listActiveCategorias(),
    ]);

    const categoriasConItems: WebCategoriaConItems[] = await Promise.all(
      categorias.map(async (cat) => {
        const items = await this.servicioService.listActiveItemsByCategoria(cat.uuid);
        return { ...cat, items };
      }),
    );

    return { servicio, categorias: categoriasConItems };
  }

  // ─── FAQs ──────────────────────────────────────────────────────────────────

  async getFaqs(): Promise<PublicFaq[]> {
    return this.faqService.listAllForWeb();
  }

  // ─── Footer ────────────────────────────────────────────────────────────────

  /**
   * Devuelve el footer más reciente. Retorna null si no hay ninguno creado.
   */
  async getFooter(): Promise<PublicFooter | null> {
    return this.footerService.findLatest();
  }
}
