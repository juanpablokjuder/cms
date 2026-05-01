import '@fastify/jwt';

// ─── Domain enums ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'viewer';

// ─── JWT augmentation ─────────────────────────────────────────────────────────

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export interface JwtPayload {
  jti: string;
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
  is_active: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<UserRow, 'password_hash' | 'id' | 'deleted_at'>;

// ─── Archivo ──────────────────────────────────────────────────────────────────

export interface ArchivoRow {
  id: number;
  uuid: string;
  path: string;
  slug: string;
  alt: string | null;
  title: string | null;
  formato: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type PublicArchivo = Omit<ArchivoRow, 'id' | 'deleted_at'>;

// ─── Banner ───────────────────────────────────────────────────────────────────

export interface BannerRow {
  id: number;
  uuid: string;
  pagina: string;
  id_imagen: number | null;
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

export interface PublicBanner {
  uuid: string;
  pagina: string;
  imagen: string | null;
  h1: string;
  texto_1: string | null;
  texto_2: string | null;
  btn_texto: string | null;
  btn_link: string | null;
  orden: number;
  created_at: Date;
  updated_at: Date;
}

// ─── Noticia ──────────────────────────────────────────────────────────────────

export interface NoticiaRow {
  id: number;
  uuid: string;
  titulo: string;
  subtitulo: string | null;
  slug: string;
  texto: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** Single image entry within a noticia (derived from JOIN with noticia_imagenes + archivos) */
export interface NoticiaImagenItem {
  archivo_uuid: string;
  url: string;        // /api/v1/archivos/<slug>
  alt: string | null;
  title: string | null;
  orden: number;
}

export interface PublicNoticia {
  uuid: string;
  titulo: string;
  subtitulo: string | null;
  slug: string;
  texto: string;
  imagenes: NoticiaImagenItem[];
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
