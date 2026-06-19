import Link from 'next/link';
import { cn } from '@/lib/utils';
import { whatsappLink } from '@/lib/config';
import { Icon } from './Icon';

type Size = 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-7 text-lead',
};

/**
 * CTA PRIMARIA — WhatsApp. Es la acción dominante del sitio.
 * Celeste (#00a9ff) reservado para esta acción. Glow sutil en hover.
 */
export function WhatsAppButton({
  children = 'Escribinos por WhatsApp',
  message,
  size = 'md',
  className,
  fullWidth = false,
}: {
  children?: React.ReactNode;
  message?: string;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center justify-center gap-2.5 rounded-md font-display font-semibold',
        'bg-primary text-bg shadow-glow',
        'transition-all duration-200 ease-out-soft',
        'hover:bg-primary-hover hover:shadow-glow-strong hover:-translate-y-0.5',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        sizeMap[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      <Icon name="whatsapp" className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </a>
  );
}

/** CTA secundaria "fantasma" — visualmente subordinada a la primaria. */
export function GhostButton({
  href,
  children,
  size = 'md',
  className,
}: {
  href: string;
  children: React.ReactNode;
  size?: Size;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-display font-medium',
        'border border-border bg-transparent text-fg-strong',
        'transition-colors duration-200 ease-out-soft',
        'hover:border-primary/60 hover:bg-primary-soft',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        sizeMap[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
