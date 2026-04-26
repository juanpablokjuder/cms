'use server';

// ============================================================
// AUTH ACTIONS — Server Actions para login y logout
//
// Estas funciones corren EXCLUSIVAMENTE en el servidor.
// Nunca se expone el JWT ni la lógica de verificación al cliente.
// ============================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, ROUTES } from '@/lib/constants';
import type { ActionState, AuthSession } from '@/types';

// ------------------------------------------------------------
// Schema de validación del formulario de login
// ------------------------------------------------------------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido')
    .max(255, 'Email demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña demasiado larga'),
});

// ------------------------------------------------------------
// Login Action
// Se invoca desde LoginForm vía useActionState
// ------------------------------------------------------------

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {

  // 1. Extraer y sanitizar datos del formulario
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // 2. Validar con Zod (prevención XSS + type safety)
  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // 3. Llamar a la REST API (sin autenticación — endpoint público)
  try {
    const response = await apiClient.post<AuthSession>(
      '/auth/login',
      parsed.data
    );

    // 4. Almacenar el JWT en una cookie httpOnly segura
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, response.token, {
      httpOnly: true,                                    // Inaccesible desde JS del cliente
      secure: process.env.NODE_ENV === 'production',    // HTTPS en producción
      sameSite: 'lax',                                  // Protección CSRF
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.isUnauthorized) {
        return { success: false, message: 'Email o contraseña incorrectos.' };
      }
      if (error.isServerError) {
        return { success: false, message: 'Error en el servidor. Intentá nuevamente.' };
      }
      if (error.statusCode === 0) {
        return { success: false, message: 'No se pudo conectar con el servidor.' };
      }
      return { success: false, message: error.message };
    }

    // Error inesperado — no exponer detalles al cliente
    console.error('[loginAction] Error inesperado:', error);
    return { success: false, message: 'Ocurrió un error inesperado. Intentá nuevamente.' };
  }

  // 5. Redirigir al dashboard tras login exitoso
  // `redirect` lanza un error especial de Next.js — SIEMPRE fuera del try/catch
  redirect(ROUTES.DASHBOARD);
}

// ------------------------------------------------------------
// Logout Action
// Se invoca desde el botón de logout en el Sidebar
// ------------------------------------------------------------

export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  // Opcional: notificar a la API para invalidar el token server-side
  // await apiClient.post('/auth/logout').catch(() => {});

  redirect(ROUTES.LOGIN);
}