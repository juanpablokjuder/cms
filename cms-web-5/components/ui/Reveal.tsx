'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Reveal — aparición suave (fade + slide) al entrar en viewport.
 * - JS mínimo: un IntersectionObserver liviano.
 * - Solo anima `transform`/`opacity` (no provoca CLS ni reflow).
 * - Respeta prefers-reduced-motion: muestra el contenido sin movimiento.
 * - `delay` permite escalonar (stagger) elementos hermanos.
 */
type RevealTag = 'div' | 'li' | 'ul' | 'ol' | 'span' | 'section' | 'article';

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: RevealTag;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si el usuario prefiere menos movimiento, mostramos directo.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out-soft will-change-[opacity,transform]',
        'motion-reduce:transition-none motion-reduce:transform-none',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Component>
  );
}
