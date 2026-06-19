import ScrollReveal from './ScrollReveal'

const SERVICES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'Diseño Web & UI/UX',
    description:
      'Interfaces atractivas, intuitivas y centradas en el usuario. Cada pixel diseñado para convertir visitantes en clientes.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    title: 'Desarrollo Web',
    description:
      'Sitios y aplicaciones web con las últimas tecnologías: React, Next.js, Node.js. Código limpio, escalable y de alto rendimiento.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    title: 'E-commerce',
    description:
      'Tiendas online completas con gestión de productos, pagos seguros y experiencia de compra optimizada para maximizar tus ventas.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: 'SEO & Posicionamiento',
    description:
      'Estrategias de SEO técnico y de contenido para que tu sitio aparezca en los primeros resultados y atraiga tráfico orgánico cualificado.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'Apps Móviles',
    description:
      'Aplicaciones móviles nativas e híbridas para iOS y Android. Diseño mobile-first con experiencia de usuario excepcional.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Soporte & Mantenimiento',
    description:
      'Mantenemos tu sitio actualizado, seguro y en óptimo rendimiento. Monitoreo proactivo y soporte técnico continuo.',
  },
]

export default function Servicios() {
  return (
    <section
      id="servicios"
      className="py-24 sm:py-32 bg-[#EBF4FF] dark:bg-[#060F1E] border-t border-slate-100 dark:border-vk/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-vk text-sm font-semibold tracking-widest uppercase mb-3">
              Lo que hacemos
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Nuestros <span className="text-gradient">servicios</span>
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Soluciones digitales completas para llevar tu presencia online al siguiente nivel.
            </p>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 80} className="h-full">
              <div className="group h-full bg-white dark:bg-[rgba(10,22,40,0.8)] border border-vk/10 dark:border-[rgba(0,200,248,0.1)] rounded-2xl p-7 hover:border-vk/30 hover:shadow-[0_8px_40px_rgba(0,200,248,0.08)] dark:hover:shadow-none dark:hover:bg-[rgba(0,200,248,0.03)] transition-all duration-300 flex flex-col">
                {/* Number + Icon row */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-xl bg-vk/8 dark:bg-vk/10 border border-vk/15 dark:border-vk/20 flex items-center justify-center text-vk group-hover:bg-vk/15 group-hover:border-vk/35 transition-all duration-300">
                    {service.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-100 dark:text-white/5 select-none leading-none mt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-2 group-hover:text-vk transition-colors duration-200">
                  {service.title}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed flex-1">
                  {service.description}
                </p>

                <div className="mt-5 flex items-center gap-1 text-vk text-sm font-semibold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                  Saber más
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
