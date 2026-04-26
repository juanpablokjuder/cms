// ============================================================
// API CLIENT — Abstracción type-safe para la REST API
//
// Arquitectura:
// - `apiClient`: instancia base sin autenticación
// - `apiClient.withAuth(token)`: retorna una nueva instancia con el header
// - `getAuthenticatedClient()`: factory para Server Components / Server Actions
//   que lee el JWT desde las cookies de Next.js automáticamente
//
// NUNCA importar `getAuthenticatedClient` en Client Components.
// ============================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method?: HttpMethod;
  body?: unknown;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
}

// ------------------------------------------------------------
// Error personalizado con acceso al status HTTP
// ------------------------------------------------------------

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    // Mantener stack trace en Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiClientError);
    }
  }

  get isUnauthorized(): boolean { return this.statusCode === 401; }
  get isForbidden(): boolean    { return this.statusCode === 403; }
  get isNotFound(): boolean     { return this.statusCode === 404; }
  get isServerError(): boolean  { return this.statusCode >= 500; }
}

// ------------------------------------------------------------
// ApiClient class — inmutable, componible
// ------------------------------------------------------------

class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Readonly<Record<string, string>>;

  constructor(
    baseUrl: string,
    defaultHeaders: Record<string, string> = {}
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // remover trailing slash
    this.defaultHeaders = Object.freeze({ ...defaultHeaders });
  }

  /**
   * Retorna una NUEVA instancia de ApiClient con el header de autorización.
   * Patrón inmutable: no muta el cliente original.
   */
  withAuth(token: string): ApiClient {
    return new ApiClient(this.baseUrl, {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    });
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', body, cache, revalidate, tags } = config;

    const nextConfig: RequestInit['next'] = {};
    if (revalidate !== undefined) nextConfig.revalidate = revalidate;
    if (tags?.length)             nextConfig.tags       = tags;

    const fetchConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.defaultHeaders,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(cache !== undefined ? { cache } : { cache: 'no-store' }),
      ...(Object.keys(nextConfig).length ? { next: nextConfig } : {}),
    };

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, fetchConfig);
    } catch (networkError) {
      throw new ApiClientError(
        'No se pudo conectar con el servidor. Verificá que la API esté en línea.',
        0
      );
    }

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}`;
      let fieldErrors: Record<string, string[]> | undefined;

      try {
        const errorBody = (await response.json()) as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        if (errorBody.message) errorMessage = errorBody.message;
        if (errorBody.errors)  fieldErrors  = errorBody.errors;
      } catch {
        // La respuesta no tiene cuerpo JSON — usar mensaje genérico
      }

      throw new ApiClientError(errorMessage, response.status, fieldErrors);
    }

    // 204 No Content — retornar undefined tipado
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // Métodos HTTP semánticos
  get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// ------------------------------------------------------------
// Instancia base (sin autenticación)
// Usar para endpoints públicos: login, healthcheck, etc.
// ------------------------------------------------------------
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'
);

// ------------------------------------------------------------
// Factory para Server Components y Server Actions
//
// Lee el JWT desde las cookies de Next.js (solo server-side).
// Retorna una instancia autenticada lista para usar.
//
// Uso:
//   const client = await getAuthenticatedClient();
//   const data = await client.get<User[]>('/users');
// ------------------------------------------------------------
export async function getAuthenticatedClient(): Promise<ApiClient> {
  // Import dinámico — next/headers solo existe en contexto de servidor
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('cms_session')?.value ?? '';
  return apiClient.withAuth(token);
}
