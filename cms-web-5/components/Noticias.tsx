import ScrollReveal from './ScrollReveal'

const POSTS = [
  {
    category: 'Tendencias',
    date: '20 Mayo, 2026',
    readTime: '5 min',
    title: 'Las tendencias de diseño web que dominan en 2026',
    excerpt:
      'Desde interfaces glassmorphism hasta micro-interacciones con IA: exploramos las tendencias visuales y técnicas que están definiendo la web moderna este año.',
    tag: 'Diseño',
  },
  {
    category: 'Negocio',
    date: '10 Mayo, 2026',
    readTime: '4 min',
    title: 'Por qué tu negocio necesita un sitio web responsivo en 2026',
    excerpt:
      'El tráfico móvil supera el 65% en la mayoría de los sectores. Te explicamos cómo un sitio responsivo impacta directamente en tus ventas y posicionamiento.',
    tag: 'Estrategia',
  },
  {
    category: 'Desarrollo',
    date: '2 Mayo, 2026',
    readTime: '6 min',
    title: 'Next.js 15: todo lo que necesitás saber para tu próximo proyecto',
    excerpt:
      'Analizamos las mejoras en rendimiento, el nuevo sistema de caché y las ventajas del App Router para proyectos de producción en empresas de todos los tamaños.',
    tag: 'Tecnología',
  },
]

const TAG_COLORS: Record<string, string> = {
  Diseño: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  Estrategia: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  Tecnología: 'bg-vk/10 text-vk border-vk/20',
}

export default function Noticias() {
  return (
    <section
      id="noticias"
      className="py-24 sm:py-32 bg-[#EBF4FF] dark:bg-[#060F1E] border-t border-slate-100 dark:border-vk/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <span className="inline-block text-vk text-sm font-semibold tracking-widest uppercase mb-3">
                Blog & Novedades
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                Últimas <span className="text-gradient">noticias</span>
              </h2>
            </div>
            <a
              href="#"
              className="flex-shrink-0 text-vk text-sm font-semibold hover:text-vk-light transition-colors flex items-center gap-1 group"
            >
              Ver todas las notas
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {POSTS.map((post, i) => (
            <ScrollReveal key={post.title} delay={i * 100}>
              <article className="group bg-white dark:bg-[rgba(10,22,40,0.8)] border border-vk/10 dark:border-[rgba(0,200,248,0.1)] rounded-2xl overflow-hidden hover:border-vk/25 hover:shadow-[0_8px_40px_rgba(0,200,248,0.07)] dark:hover:shadow-none transition-all duration-300 flex flex-col h-full">
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-[#0D1B2E] dark:to-[#071525] flex items-center justify-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10 dark:opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(0,200,248,0.5) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div className="w-12 h-12 rounded-xl bg-vk/8 dark:bg-vk/10 border border-vk/15 dark:border-vk/20 flex items-center justify-center z-10">
                    <span className="text-vk font-black text-lg">VK</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${TAG_COLORS[post.tag] ?? 'bg-vk/10 text-vk border-vk/20'}`}
                    >
                      {post.tag}
                    </span>
                    <span className="text-slate-400 dark:text-gray-600 text-xs">{post.date}</span>
                    <span className="text-slate-300 dark:text-gray-700 text-xs">· {post.readTime} lectura</span>
                  </div>

                  <h3 className="text-slate-800 dark:text-white font-bold text-base leading-snug mb-3 group-hover:text-vk transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-500 text-sm leading-relaxed flex-1">{post.excerpt}</p>

                  <a
                    href="#"
                    className="mt-5 inline-flex items-center gap-1.5 text-vk text-sm font-semibold hover:gap-2.5 transition-all duration-200"
                  >
                    Leer artículo
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
