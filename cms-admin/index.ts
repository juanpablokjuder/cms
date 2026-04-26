// ============================================================
// DOMAIN TYPES — CMS Admin Panel
// Todos los tipos del dominio centralizados aquí.
// Extender este archivo a medida que se agregan módulos.
// ============================================================

// ------------------------------------------------------------
// Usuarios y autenticación
// ------------------------------------------------------------

export type UserRole = 'super_admin' | 'admin' | 'editor';

export interface User {
  readonly id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

// ------------------------------------------------------------
// API — Respuestas y errores
// ------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// ------------------------------------------------------------
// Navegación
// ------------------------------------------------------------

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly iconName: string;
  readonly children?: readonly NavItem[];
}

// ------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------

export interface DashboardStats {
  pages: number;
  media: number;
  forms: number;
  users: number;
}

// ------------------------------------------------------------
// Server Action States (useActionState)
// ------------------------------------------------------------

export interface ActionState<T = null> {
  success?: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  data?: T;
}
