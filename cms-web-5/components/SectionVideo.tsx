import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { WhatsAppButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export default function SectionVideo() {
  return (
    <Section id="demo" aria-labelledby="demo-title" className="relative py-24 sm:py-32 bg-[#EBF4FF] dark:bg-[#060F1E] border-t border-slate-100 dark:border-vk/5">
      <SectionHeading
        titleId="demo-title"
        eyebrow="Vas a decir “ah, ¿era esto?”"
        title="Mirá lo simple que es editar tu web"
        subtitle="Sin manuales ni cursos. Entrás a tu panel, tocás lo que querés cambiar, escribís y guardás. Listo: tu web actualizada."
      />

      <Reveal delay={80} className="mt-12">
        {/* Mockup de navegador (marco de dispositivo) */}
        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-surface-2 shadow-card-hover">
          {/* Barra superior del navegador */}
          <div className="flex items-center gap-2 border-b border-border bg-surface-1 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-border" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-border" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-border" aria-hidden="true" />
            <div className="ml-3 flex flex-1 items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-small text-muted-hint">
              <Icon name="lock" className="h-3.5 w-3.5" />
              <span className="truncate">panel.tu-web.com</span>
            </div>
          </div>

          {/*
            [PLACEHOLDER: VIDEO O GIF DEL CMS EN ACCIÓN]
            ---------------------------------------------------------------
            Reemplazá este bloque por el video real. Pautas de performance:
            - No autoplay con sonido. Usá poster, muted, playsInline, loop.
            - Lazy-load (preload="none") para no afectar el LCP del hero.
            - Formato eficiente (MP4 H.264 + WebM). Declará width/height.

            <video
              className="aspect-video w-full bg-bg"
              poster="/demo/cms-poster.webp"
              controls
              muted
              playsInline
              loop
              preload="none"
              width={1280}
              height={720}
            >
              <source src="/demo/cms.webm" type="video/webm" />
              <source src="/demo/cms.mp4" type="video/mp4" />
            </video>
          */}
          <div className="relative grid aspect-video w-full place-items-center bg-bg">
            {/* mini-grilla de fondo */}
            <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
            <div className="relative flex flex-col items-center gap-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-bg shadow-glow">
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <p className="font-display text-h5 font-semibold text-fg-strong">
                [PLACEHOLDER: video o GIF del CMS]
              </p>
              <p className="max-w-sm text-base text-muted">
                Acá va la grabación del panel editándose (cambiar un precio, subir una foto). Ver el
                README para insertarlo sin afectar la performance.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Anotaciones de simpleza (refuerzo) */}
      <Reveal delay={160} className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
        {[
          'Tocás el texto y escribís',
          'Subís una foto desde el celular',
          'Cambiás un precio y guardás',
        ].map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-base text-fg"
          >
            <Icon name="check" className="h-4 w-4 text-primary" />
            {t}
          </span>
        ))}
      </Reveal>

      <Reveal delay={220} className="mt-10 flex justify-center">
        <WhatsAppButton size="lg" message="Hola VK, vi la demo del panel y quiero el mío">
          Quiero el mío
        </WhatsAppButton>
      </Reveal>
    </Section>
  );
}