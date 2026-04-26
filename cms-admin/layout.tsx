import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import './globals.css';

// ── Tipografía ─────────────────────────────────────────────────────────────
// Outfit: geométrica y arquitectónica — para brand, headings y valores numéricos
// DM Sans: legible y moderna — para body text, labels y UI elements
// next/font/google descarga las fuentes en build time: 0 layout shift, 0 requests externos

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
});

// ── Metadata ───────────────────────────────────────────────────────────────
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'CMS Admin';

export const metadata: Metadata = {
  title: {
    template: `%s — ${APP_NAME}`,
    default: APP_NAME,
  },
  description: 'Panel de administración de contenido',
  // El admin NUNCA debe aparecer en buscadores ni ser indexado
  robots: { index: false, follow: false },
};

// ── Root Layout ────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
