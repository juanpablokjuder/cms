/**
 * cn() — compone clases condicionales y filtra valores vacíos/falsy.
 * Implementación mínima sin dependencias para mantener el bundle chico.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}
