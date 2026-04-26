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
  imagen: string | null;  // e.g. /api/v1/archivos/mi-banner-abc123
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
