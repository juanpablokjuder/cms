import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'diseñosVK | Agencia de Desarrollo Web',
  description:
    'Diseñamos y desarrollamos experiencias digitales modernas, rápidas y efectivas que impulsan tu negocio.',
  keywords: 'diseño web, desarrollo web, agencia web, e-commerce, SEO, apps móviles',
  icons: {
    icon: '/fav.ico',
  },
  openGraph: {
    title: 'diseñosVK | Agencia de Desarrollo Web',
    description: 'Transformamos ideas en experiencias digitales.',
    type: 'website',
    locale: 'es_AR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Anti-flash: fija el tema antes del primer paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vk-theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased bg-[#F5F9FF] dark:bg-[#040D1A] text-slate-900 dark:text-white transition-colors duration-300`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
