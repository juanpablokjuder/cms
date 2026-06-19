const FOOTER_LINKS = {
  Servicios: [
    { label: 'Diseño Web & UI/UX', href: '#servicios' },
    { label: 'Desarrollo Web', href: '#servicios' },
    { label: 'E-commerce', href: '#servicios' },
    { label: 'SEO & Posicionamiento', href: '#servicios' },
    { label: 'Apps Móviles', href: '#servicios' },
    { label: 'Soporte Técnico', href: '#servicios' },
  ],
  Empresa: [
    { label: 'Sobre nosotros', href: '#nosotros' },
    { label: 'Noticias', href: '#noticias' },
    { label: 'Contacto', href: '#contacto' },
    { label: 'Cotizar proyecto', href: '#contacto' },
  ],
}

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/disenhosvk',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/disenhosvk',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/disenhosvk',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#E5F0FF] dark:bg-[#030A14] border-t border-slate-200 dark:border-vk/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5" aria-label="diseñosVK inicio">
                <img src="/img/logo.png" alt="diseñosVK logo" className="w-8 h-8" />
                Diseños WEB
            </a>
            <p className="text-slate-500 dark:text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              Agencia de desarrollo web especializada en crear soluciones digitales que impulsan
              tu negocio. Diseño, desarrollo y estrategia en un solo lugar.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[rgba(0,200,248,0.06)] border border-slate-200 dark:border-[rgba(0,200,248,0.1)] flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-vk hover:border-vk/30 hover:bg-vk/8 dark:hover:bg-vk/10 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-slate-700 dark:text-white font-bold text-sm mb-5 tracking-wide">{section}</h3>
              <ul className="flex flex-col gap-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-slate-500 dark:text-gray-500 hover:text-vk text-sm transition-colors duration-200"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-[rgba(0,200,248,0.06)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 dark:text-gray-600 text-sm text-center sm:text-left">
            © {currentYear} diseñosVK. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 text-xs transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 text-xs transition-colors">
              Términos de uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
