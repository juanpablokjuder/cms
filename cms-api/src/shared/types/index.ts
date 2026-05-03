import '@fastify/jwt';

// ─── Domain enums ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'viewer';

// ─── JWT augmentation ─────────────────────────────────────────────────────────
// Tells @fastify/jwt what shape `request.user` has after jwtVerify().

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export interface JwtPayload {
  /** JWT ID — UUID stored in revoked_tokens on logout */
  jti: string;
  /** Subject — user UUID (never the numeric DB id) */
  sub: string;
  email: string;
  role: UserRole;
}

// ─── Database row shapes ──────────────────────────────────────────────────────

export interface UserRow {
  id: number;
  uuid: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: number; // TINYINT(1) comes back as number from MariaDB
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** Safe projection — never exposes password_hash or internal id */
export type PublicUser = Omit<UserRow, 'password_hash' | 'id' | 'deleted_at'>;

// ─── Archivo ──────────────────────────────────────────────────────────────────

export interface ArchivoRow {
  id: number;
  uuid: string;
  path: string;      // filename relative to UPLOADS_DIR, e.g. "abc123-hero.png"
  slug: string;      // URL-safe identifier used in public links
  alt: string | null;
  title: string | null;
  formato: string;   // file extension: png, jpg, webp, gif, etc.
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** Safe projection — never exposes internal id or deleted_at */
export type PublicArchivo = Omit<ArchivoRow, 'id' | 'deleted_at'>;

// ─── Banner ───────────────────────────────────────────────────────────────────

export interface BannerRow {
  id: number;
  uuid: string;
  pagina: string;
  id_imagen: number | null;  // FK → archivos.id
  h1: string;
  texto_1: string | null;
  texto_2: string | null;
  btn_texto: string | null;
  btn_link: string | null;
  orden: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** Public banner shape — imagen is the full URL derived from the JOIN */
export interface PublicBanner {
  uuid: string;
  pagina: string;
  imagen: string | null;  // e.g. http://host/api/v1/archivos/mi-banner-abc123
  imagen_alt: string | null;
  imagen_title: string | null;
  h1: string;
  texto_1: string | null;
  texto_2: string | null;
  btn_texto: string | null;
  btn_link: string | null;
  orden: number;
  created_at: Date;
  updated_at: Date;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── API response envelopes ───────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// ─── Noticia ──────────────────────────────────────────────────────────────────

export interface NoticiaRow {
  id:         number;
  uuid:       string;
  titulo:     string;
  subtitulo:  string | null;
  slug:       string;
  texto:      string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface NoticiaImagenItem {
  archivo_uuid: string;
  url:          string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}

export interface PublicNoticia {
  uuid:      string;
  titulo:    string;
  subtitulo: string | null;
  slug:      string;
  texto:     string;
  imagenes:  NoticiaImagenItem[];
  created_at: Date;
  updated_at: Date;
}

// ─── Nosotros ─────────────────────────────────────────────────────────────────

export interface NosotrosRow {
  id:         number;
  uuid:       string;
  titulo:     string;
  subtitulo:  string | null;
  texto:      string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface NosotrosImagenItem {
  archivo_uuid: string;
  url:          string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}

export interface PublicNosotros {
  uuid:       string;
  titulo:     string;
  subtitulo:  string | null;
  texto:      string;
  imagenes:   NosotrosImagenItem[];
  created_at: Date;
  updated_at: Date;
}

// ─── Moneda ───────────────────────────────────────────────────────────────────

export interface MonedaRow {
  id:     number;
  uuid:   string;
  codigo: string;
  nombre: string;
}

export type PublicMoneda = MonedaRow;

// ─── Servicios (singleton principal) ─────────────────────────────────────────

export interface ServicioRow {
  id:         number;
  uuid:       string;
  titulo:     string;
  subtitulo:  string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type PublicServicio = Omit<ServicioRow, 'id' | 'deleted_at'>;

// ─── Servicios Categorías ─────────────────────────────────────────────────────

export interface ServicioCategoriaRow {
  id:         number;
  uuid:       string;
  nombre:     string;
  orden:      number;
  estado:     number; // 1=activo, 0=inactivo (TINYINT)
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type PublicServicioCategoria = Omit<ServicioCategoriaRow, 'id' | 'deleted_at'>;

// ─── Servicios Items ──────────────────────────────────────────────────────────

export type EstadoItem = 'activo' | 'inactivo' | 'no_mostrar';

export interface ServicioItemRow {
  id:           number;
  uuid:         string;
  categoria_id: number | null;
  titulo:       string;
  subtitulo_1:  string | null;
  subtitulo_2:  string | null;
  precio:       string | null; // DECIMAL comes back as string from MariaDB
  moneda_id:    number | null;
  btn_titulo:   string | null;
  btn_link:     string | null;
  texto:        string | null;
  estado:       EstadoItem;
  deleted_at:   Date | null;
  created_at:   Date;
  updated_at:   Date;
}

export interface ServicioItemImagenItem {
  archivo_uuid: string;
  url:          string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}

export interface PublicServicioItem {
  uuid:           string;
  categoria_uuid: string | null;
  titulo:         string;
  subtitulo_1:    string | null;
  subtitulo_2:    string | null;
  precio:         string | null;
  moneda:         PublicMoneda | null;
  btn_titulo:     string | null;
  btn_link:       string | null;
  texto:          string | null;
  estado:         EstadoItem;
  imagenes:       ServicioItemImagenItem[];
  created_at:     Date;
  updated_at:     Date;
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export interface FaqRow {
  id:          number;
  uuid:        string;
  titulo:      string;
  id_imagen:   number | null;
  deleted_at:  Date | null;
  created_at:  Date;
  updated_at:  Date;
}

export interface FaqItemRow {
  id:         number;
  faq_id:     number;
  uuid:       string;
  pregunta:   string;
  respuesta:  string;
  orden:      number;
  created_at: Date;
  updated_at: Date;
}

export interface PublicFaqItem {
  uuid:      string;
  pregunta:  string;
  respuesta: string;
  orden:     number;
}

export interface PublicFaq {
  uuid:         string;
  titulo:       string;
  imagen:       string | null;
  imagen_alt:   string | null;
  imagen_title: string | null;
  items:        PublicFaqItem[];
  created_at:   Date;
  updated_at:   Date;
}

// ─── Error Logs ───────────────────────────────────────────────────────────────

export type LogLevel = 'error' | 'warn' | 'info';

export interface ErrorLogRow {
  uuid:           string;
  level:          LogLevel;
  error_type:     string;
  error_code:     string | null;
  status_code:    number | null;
  message:        string;
  stack_trace:    string | null;
  http_method:    string | null;
  url:            string | null;
  route:          string | null;
  user_uuid:      string | null;
  user_role:      string | null;
  ip_address:     string | null;
  user_agent:     string | null;
  request_body:   string | null;  // JSON serializado
  request_params: string | null;  // JSON serializado
  request_query:  string | null;  // JSON serializado
  context:        string | null;  // JSON serializado
  hostname:       string | null;
  node_env:       string | null;
  created_at:     Date;
}

export interface ErrorLogFilters {
  page:        number;
  limit:       number;
  level?:      LogLevel;
  statusCode?: number;
  errorCode?:  string;
  userUuid?:   string;
  from?:       Date;
  to?:         Date;
}

export interface PaginatedErrorLogs {
  data: ErrorLogRow[];
  meta: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export type FooterColumnaTipo = 'media_texto' | 'lista_enlaces' | 'contacto';

export interface FooterRow {
  id:             number;
  uuid:           string;
  columnas_count: number;
  copyright_text: string | null;
  deleted_at:     Date | null;
  created_at:     Date;
  updated_at:     Date;
}

export interface FooterColumnaRow {
  id:        number;
  footer_id: number;
  uuid:      string;
  tipo:      FooterColumnaTipo;
  orden:     number;
}

export interface FooterMediaTextoData {
  imagen:      string | null; // URL absoluta o null
  descripcion: string | null;
}

export interface FooterEnlaceItem {
  uuid:  string;
  texto: string;
  url:   string;
  orden: number;
}

export interface FooterListaEnlacesData {
  enlaces: FooterEnlaceItem[];
}

export interface FooterContactoData {
  direccion: string | null;
  telefono:  string | null;
  email:     string | null;
}

export interface PublicFooterColumna {
  uuid:  string;
  tipo:  FooterColumnaTipo;
  orden: number;
  data:  FooterMediaTextoData | FooterListaEnlacesData | FooterContactoData;
}

export interface PublicFooterRed {
  uuid:     string;
  nombre:   string;
  url:      string;
  svg_icon: string;
  orden:    number;
}

export interface PublicFooterLegal {
  uuid:  string;
  texto: string;
  url:   string;
  orden: number;
}

export interface PublicFooter {
  uuid:           string;
  columnas_count: number;
  copyright_text: string | null;
  columnas:       PublicFooterColumna[];
  redes:          PublicFooterRed[];
  legales:        PublicFooterLegal[];
  created_at:     Date;
  updated_at:     Date;
}

