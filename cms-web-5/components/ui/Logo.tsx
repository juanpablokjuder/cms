import { cn } from '@/lib/utils';

/**
 * Logo VK — monograma lineal reconstruido como SVG (geometría precisa, trazo
 * fino, celeste sobre oscuro). El SVG es nítido en cualquier tamaño y pesa nada.
 *
 * [PLACEHOLDER] Si el cliente entrega el logo original (logo-vk.png o un SVG),
 * reemplazá este componente por <Image src="/logo-vk.svg" ... /> o el <path>
 * por el del archivo real. Los colores salen de los tokens (text-primary).
 */
export function Logo({ className, withGlow = false }: { className?: string; withGlow?: boolean }) {
  return (
    <span className={cn('inline-flex items-center text-primary', className)} aria-hidden="true">
      <svg
        viewBox="0 0 56 40"
        className={cn('h-full w-auto', withGlow && 'drop-shadow-[0_0_10px_rgba(0,169,255,0.45)]')}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* V */}
        <path d="M6 6 L16 34 L26 6" />
        {/* K */}
        <path d="M34 6 L34 34" />
        <path d="M34 21 L46 6" />
        <path d="M34 21 L48 34" />
      </svg>
    </span>
  );
}
