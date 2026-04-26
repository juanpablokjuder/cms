// ============================================================
// MIDDLEWARE — Protección de rutas con verificación JWT
//
// Corre en Edge Runtime: ULTRA rápido, sin cold start.
// Protege TODO el panel antes de que Next.js renderice cualquier página.
// ============================================================

import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE_NAME, PUBLIC_ROUTES, ROUTES } from '@/lib/constants';

// El secreto se codifica aquí para no importar todo lib/auth.ts en Edge
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-dev-secret-change-in-production'
);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // ── Caso 1: Sin token intentando acceder a ruta protegida ──────────────
  if (!sessionToken && !isPublicRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    // Guardar el destino original para redirigir post-login
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Caso 2: Con token ──────────────────────────────────────────────────
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, JWT_SECRET, { algorithms: ['HS256'] });

      // Token válido + intentando acceder a login → redirigir al dashboard
      if (isPublicRoute) {
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
      }
    } catch {
      // Token inválido o expirado → limpiar cookie y redirigir al login
      const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

// Definir exactamente qué paths intercepta el middleware.
// Excluir assets estáticos, API routes de Next.js y archivos de Next.js internos.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
