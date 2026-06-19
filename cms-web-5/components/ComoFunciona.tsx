'use client'
import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { steps } from '@/lib/content';

export default function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="how-title" className="w-full py-20 lg:py-32">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 lg:gap-12 items-start">
        
        {/* COLUMNA IZQUIERDA: Bloque Fijo (Sticky) + Imagen */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 lg:h-auto flex flex-col gap-8">
          
          <div>
            <SectionHeading
              titleId="how-title"
              eyebrow="Cómo funciona"
              title="Simple, de principio a fin"
              subtitle="Cuatro pasos. Ninguno te exige saber de tecnología."
            />
          </div>

          {/* PLACEHOLDER DE LA IMAGEN (Oculto en mobile, visible desde lg) */}
          {/* Se inserta de forma natural en el flujo flex de la columna izquierda */}
          <div className="hidden lg:block relative w-full aspect-[4/3] rounded-2xl border border-border bg-gradient-to-br from-surface-2/50 to-surface-1/20 overflow-hidden shadow-card group/img">
            {/* Reemplaza esta etiqueta <img> por tu asset real cuando lo tengas */}
            <img 
              src="https://via.placeholder.com/600x450/0f172a/38bdf8?text=Tu+Dashboard+/+Mockup" 
              alt="Visualización del proceso de trabajo o panel de control"
              className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
            
            {/* Efecto decorativo de iluminación de fondo (Glow) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
          </div>

        </div>

        {/* COLUMNA DERECHA: Bloque Móvil (Scroll) */}
        <div className="mt-14 lg:mt-0 lg:col-span-7">
          <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-1 lg:gap-y-16">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 90} as="li" className="relative group">
                
               

                {/* Contenedor de la tarjeta */}
                <div className="flex flex-col items-start lg:flex-row lg:gap-6 lg:bg-surface-1/20 lg:p-8 lg:rounded-2xl lg:border lg:border-transparent lg:hover:border-border lg:hover:bg-surface-1/50 transition-all duration-300">
                  
                  {/* Icono con el número */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-primary shadow-card">
                    <Icon name={step.icon} className="h-7 w-7" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-small font-bold text-bg">
                      {step.n}
                    </span>
                  </div>

                  {/* Textos */}
                  <div className="mt-5 lg:mt-0">
                    <h3 className="font-display text-h5 font-semibold text-fg-strong">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base text-muted max-w-xl">
                      {step.text}
                    </p>
                  </div>

                </div>
              </Reveal>
            ))}
          </ol>
        </div>

      </div>
    </section>
  );
}