import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

/** Sección semántica con padding vertical generoso y contenedor centrado. */
export function Section({
  id,
  children,
  className,
  containerClassName,
  'aria-labelledby': ariaLabelledby,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  'aria-labelledby'?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn('scroll-mt-24 py-section', className)}
    >
      <div className={cn('mx-auto w-full max-w-content px-5 sm:px-8', containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/** Encabezado de sección: eyebrow + título + bajada opcional. */
export function SectionHeading({
  eyebrow,
  title,
  titleId,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  titleId?: string;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3.5 py-1.5 text-small font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2 id={titleId} className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
        {title}
      </h2>
      {subtitle && (
        // <p className={cn('text-lead text-muted', align === 'center' ? 'max-w-2xl' : 'max-w-prose')}>
        <p className='text-slate-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto' >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
