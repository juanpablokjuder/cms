import '@fastify/jwt';

export type UserRole = 'admin' | 'editor' | 'viewer';

declare module '@fastify/jwt' {
  interface FastifyJWT { payload: JwtPayload; user: JwtPayload; }
}

export interface JwtPayload { jti: string; sub: string; email: string; role: UserRole; }

// ─── Users ────────────────────────────────────────────────────────────────────
export interface UserRow {
  id: number; uuid: string; name: string; email: string;
  password_hash: string; role: UserRole; is_active: number;
  deleted_at: Date | null; created_at: Date; updated_at: Date;
}
export type PublicUser = Omit<UserRow, 'password_hash' | 'id' | 'deleted_at'>;

// ─── Archivo ──────────────────────────────────────────────────────────────────
export interface ArchivoRow {
  id: number; uuid: string; path: string; slug: string;
  alt: string | null; title: string | null; formato: string;
  deleted_at: Date | null; created_at: Date; updated_at: Date;
}
export type PublicArchivo = Omit<ArchivoRow, 'id' | 'deleted_at'>;

// ─── Banner ───────────────────────────────────────────────────────────────────
export interface BannerRow {
  id: number; uuid: string; pagina: string; id_imagen: number | null;
  h1: string; texto_1: string | null; texto_2: string | null;
  btn_texto: string | null; btn_link: string | null; orden: number;
  deleted_at: Date | null; created_at: Date; updated_at: Date;
}
export interface PublicBanner {
  uuid: string; pagina: string; imagen: string | null; h1: string;
  texto_1: string | null; texto_2: string | null; btn_texto: string | null;
  btn_link: string | null; orden: number; created_at: Date; updated_at: Date;
}

// ─── Noticia ──────────────────────────────────────────────────────────────────
export interface NoticiaRow {
  id: number; uuid: string; titulo: string; subtitulo: string | null;
  slug: string; texto: string; deleted_at: Date | null; created_at: Date; updated_at: Date;
}
export interface NoticiaImagenItem { archivo_uuid: string; url: string; alt: string | null; title: string | null; orden: number; }
export interface PublicNoticia {
  uuid: string; titulo: string; subtitulo: string | null; slug: string;
  texto: string; imagenes: NoticiaImagenItem[]; created_at: Date; updated_at: Date;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export interface FaqRow {
  id: number; uuid: string; titulo: string; id_imagen: number | null;
  deleted_at: Date | null; created_at: Date; updated_at: Date;
}
export interface FaqItemRow { id: number; faq_id: number; uuid: string; pregunta: string; respuesta: string; orden: number; }
export interface PublicFaqItem { uuid: string; pregunta: string; respuesta: string; orden: number; }
export interface PublicFaq {
  uuid: string; titulo: string; imagen: string | null;
  items: PublicFaqItem[]; created_at: Date; updated_at: Date;
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export type FooterColumnaTipo = 'media_texto' | 'lista_enlaces' | 'contacto';

export interface FooterRow {
  id: number; uuid: string; columnas_count: number;
  copyright_text: string | null; deleted_at: Date | null;
  created_at: Date; updated_at: Date;
}

export interface FooterColumnaRow {
  id: number; footer_id: number; uuid: string;
  tipo: FooterColumnaTipo; orden: number;
}

// Block data shapes
export interface FooterMediaTextoData {
  imagen: string | null; // full URL or null
  descripcion: string | null;
}
export interface FooterEnlaceItem { uuid: string; texto: string; url: string; orden: number; }
export interface FooterListaEnlacesData { enlaces: FooterEnlaceItem[]; }
export interface FooterContactoData { direccion: string | null; telefono: string | null; email: string | null; }

export interface PublicFooterColumna {
  uuid: string;
  tipo: FooterColumnaTipo;
  orden: number;
  data: FooterMediaTextoData | FooterListaEnlacesData | FooterContactoData;
}

export interface PublicFooterRed { uuid: string; nombre: string; url: string; svg_icon: string; orden: number; }
export interface PublicFooterLegal { uuid: string; texto: string; url: string; orden: number; }

export interface PublicFooter {
  uuid: string;
  columnas_count: number;
  copyright_text: string | null;
  columnas: PublicFooterColumna[];
  redes: PublicFooterRed[];
  legales: PublicFooterLegal[];
  created_at: Date;
  updated_at: Date;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationOptions { page: number; limit: number; }
export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number; };
}

// ─── API envelopes ────────────────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> { success: true; data: T; message?: string; }
export interface ApiErrorResponse { success: false; message: string; errors?: Record<string, string[]>; code?: string; }
