import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Habilitar rutas tipadas para detectar errores de navegación en compile time.
   * Requiere TypeScript estricto.
   */
  experimental: {
    typedRoutes: true,
  },

  /**
   * Configuración de imágenes remotas.
   * Agregar los dominios de los servidores de la API aquí.
   */
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },

  /**
   * Headers de seguridad HTTP para el panel de administración.
   * El panel nunca debe ser indexado ni embebido en iframes.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default nextConfig;
