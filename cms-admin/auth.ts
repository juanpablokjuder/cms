// ============================================================
// AUTH — Verificación JWT y gestión de sesión
//
// `jose` es Edge-compatible: funciona en middleware y en
// Server Components sin necesidad de Node.js crypto nativo.
// ============================================================

import { jwtVerify, type JWTPayload } from 'jose';
import type { AuthSession, User } from '@/types';
import { SESSION_COOKIE_NAME } from './constants';

// El secreto se codifica una vez al cargar el módulo (optimización)
const getJwtSecret = (): Uint8Array =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'fallback-dev-secret-change-in-production'
  );

// ------------------------------------------------------------
// Payload tipado del JWT
// ------------------------------------------------------------

export interface CmsJwtPayload extends JWTPayload {
  sub: string;          // user ID (string por estándar JWT)
  email: string;
  name: string;
  role: User['role'];
}

// ------------------------------------------------------------
// Verificar y decodificar un JWT
// Retorna el payload si es válido, null si no lo es.
// ------------------------------------------------------------

export async function verifyToken(
  token: string
): Promise<CmsJwtPayload | null> {
  try {
    const { payload } = await jwtVerify<CmsJwtPayload>(
      token,
      getJwtSecret(),
      {
        // Forzar el algoritmo esperado — previene algorithm confusion attacks
        algorithms: ['HS256'],
      }
    );
    return payload;
  } catch {
    // Token inválido, expirado o manipulado
    return null;
  }
}

// ------------------------------------------------------------
// Obtener la sesión activa desde las cookies de Next.js
// Solo utilizar en Server Components, Server Actions y Route Handlers.
// ------------------------------------------------------------

export async function getSession(): Promise<AuthSession | null> {
  try {
    // Import dinámico para compatibilidad con middleware (Edge runtime)
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return null;

    const session: AuthSession = {
      user: {
        id: Number(payload.sub),
        email: payload.email,
        name: payload.name,
        role: payload.role,
        createdAt: '',
      },
      token,
      expiresAt: payload.exp ?? 0,
    };

    return session;
  } catch {
    return null;
  }
}
