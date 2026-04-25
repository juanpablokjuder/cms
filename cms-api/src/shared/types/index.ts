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
