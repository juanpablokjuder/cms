import ScrollReveal from './ScrollReveal'

const STATS = [
  { value: '50+', label: 'Proyectos completados' },
  { value: '30+', label: 'Clientes satisfechos' },
  { value: '5+', label: 'Años de experiencia' },
]

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#F5F9FF] dark:bg-[#040D1A]"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.12] dark:opacity-[0.28]"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,200,248,0.7) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-vk/5 dark:bg-vk/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-vk/3 dark:bg-vk/6 rounded-full blur-[90px] pointer-events-none" />


      {/* Content */}
      <div className="relative z-10 text-center px-5 sm:px-4 max-w-5xl mx-auto pt-24 w-full">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 bg-vk/8 dark:bg-vk/10 border border-vk/20 dark:border-vk/25 text-vk text-sm px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-vk rounded-full animate-pulse" />
            Agencia de Desarrollo Web
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="text-[2.1rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white sm:leading-[1.05] tracking-tight mb-6">
            Transformamos ideas en{' '}
            <span className="text-gradient">experiencias digitales</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={220}>
          <p className="text-lg md:text-xl text-slate-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Diseñamos y desarrollamos sitios web modernos, rápidos y efectivos que impulsan tu
            negocio al siguiente nivel.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={340}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 bg-vk text-[#040D1A] font-bold px-8 py-4 rounded-xl hover:bg-vk-light active:scale-95 transition-all duration-200 text-lg glow-md"
            >
              Iniciar proyecto
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 border border-vk/40 text-vk font-bold px-8 py-4 rounded-xl hover:bg-vk/8 transition-all duration-200 text-lg"
            >
              Ver servicios
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll cue */}
      {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce opacity-50">
        <span className="text-slate-400 dark:text-gray-600 text-[11px] tracking-[0.2em] uppercase">
          Scroll
        </span>
        <svg className="w-4 h-4 text-vk" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div> */}
    </section>
  )
}
