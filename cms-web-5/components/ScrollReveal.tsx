'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Extra delay before the reveal starts (ms) */
  delay?: number
  /** Entry direction */
  direction?: 'up' | 'left' | 'right' | 'none'
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) el.style.transitionDelay = `${delay}ms`
          el.classList.add('sr-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const dirClass =
    direction === 'left' ? 'sr-left' : direction === 'right' ? 'sr-right' : ''

  return (
    <div ref={ref} className={`sr-hidden ${dirClass} ${className}`}>
      {children}
    </div>
  )
}
