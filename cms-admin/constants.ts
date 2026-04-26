// ============================================================
// CONSTANTS — CMS Admin Panel
// Nunca hardcodear rutas o claves en los componentes.
// ============================================================

/**
 * Rutas de la aplicación.
 * Centralizar aquí permite cambiar rutas sin buscar en todo el proyecto.
 */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  MEDIA: '/media',
  CONTENT: '/content',
  FORMS: '/forms',
  SETTINGS: '/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Nombre de la cookie que almacena el JWT de sesión.
 * httpOnly: no accesible desde JavaScript del cliente.
 */
export const SESSION_COOKIE_NAME = 'cms_session' as const;

/**
 * Duración máxima de la sesión en segundos.
 * Default: 8 horas de trabajo.
 */
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

/**
 * Rutas que NO requieren autenticación.
 * El middleware de Next.js las excluirá de la verificación JWT.
 */
export const PUBLIC_ROUTES: readonly string[] = [ROUTES.LOGIN] as const;
