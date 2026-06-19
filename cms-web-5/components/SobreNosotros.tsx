import ScrollReveal from './ScrollReveal'

const VALUES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Rendimiento',
    description: 'Sitios ultrarrápidos optimizados para Core Web Vitals.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: 'Seguridad',
    description: 'Buenas prácticas de seguridad implementadas desde el día uno.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: 'Compromiso',
    description: 'Acompañamos cada proyecto desde el brief hasta el lanzamiento y más allá.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    title: 'Tecnología moderna',
    description: 'Stack actualizado: Next.js, TypeScript, Tailwind y más.',
  },
]

export default function SobreNosotros() {
  return (
    <section
      id="nosotros"
      className="py-24 sm:py-32 bg-[#F5F9FF] dark:bg-[#040D1A] border-t border-slate-100 dark:border-vk/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <ScrollReveal direction="left">
            <div>
              <span className="inline-block text-vk text-sm font-semibold tracking-widest uppercase mb-3">
                Sobre nosotros
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                Construimos el digital de{' '}
                <span className="text-gradient">tu empresa</span>
              </h2>
              <p className="text-slate-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-5">
                <strong className="text-slate-800 dark:text-white">DiseñosVK</strong> es una agencia
                de desarrollo web apasionada por crear soluciones digitales que realmente generan
                resultados. Nacimos con la convicción de que cada negocio merece una presencia
                online poderosa, independientemente de su tamaño.
              </p>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed mb-8">
                Combinamos diseño visual impactante con código robusto y estrategias orientadas a
                conversión. Trabajamos de manera cercana con cada cliente, entendiendo su industria,
                objetivos y audiencia para entregar soluciones a medida.
              </p>

              {/* Values grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {VALUES.map(({ icon, title, description }) => (
                  <div key={title} className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-vk/8 dark:bg-vk/10 border border-vk/15 dark:border-vk/20 flex items-center justify-center text-vk mt-0.5">
                      {icon}
                    </div>
                    <div>
                      <div className="text-slate-800 dark:text-white font-semibold text-sm mb-0.5">{title}</div>
                      <div className="text-slate-500 dark:text-gray-500 text-xs leading-relaxed">{description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#contacto"
                className="inline-flex items-center gap-2 mt-10 bg-vk text-[#040D1A] font-bold px-6 py-3 rounded-xl hover:bg-vk-light transition-colors duration-200 glow-sm"
              >
                Trabajemos juntos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </ScrollReveal>

          {/* Right — visual card */}
          <ScrollReveal direction="right">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white dark:bg-[rgba(10,22,40,0.8)] border border-vk/10 dark:border-[rgba(0,200,248,0.1)] rounded-3xl p-8 relative overflow-hidden shadow-sm dark:shadow-none">
                {/* Glow top right */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-vk/8 dark:bg-vk/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  {/* Logo large */}
                  <div className="w-20 h-20 rounded-2xl bg-vk/8 dark:bg-vk/10 border border-vk/20 dark:border-vk/25 flex items-center justify-center mb-6">
                    <span className="text-vk font-black text-3xl leading-none tracking-tighter">VK</span>
                  </div>

                  <h3 className="text-slate-900 dark:text-white font-black text-2xl mb-2">diseñosVK</h3>
                  <p className="text-slate-400 dark:text-gray-500 text-sm mb-8">Agencia de Desarrollo Web</p>

                  {/* Counter cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { num: '50+', label: 'Proyectos' },
                      { num: '30+', label: 'Clientes' },
                      { num: '5+', label: 'Años' },
                      { num: '100%', label: 'Dedicación' },
                    ].map(({ num, label }) => (
                      <div
                        key={label}
                        className="bg-slate-50 dark:bg-[#040D1A] rounded-xl p-4 border border-slate-100 dark:border-[rgba(0,200,248,0.08)]"
                      >
                        <div className="text-2xl font-black text-gradient">{num}</div>
                        <div className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tech badges */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind', 'PHP'].map((tech) => (
                      <span
                        key={tech}
                        className="text-xs text-vk/80 bg-vk/6 dark:bg-vk/8 border border-vk/15 px-2.5 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

             
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
