/**
 * ============================================================================
 *  CONFIGURACIÓN CENTRAL DEL SITIO  —  EDITÁ ACÁ
 * ============================================================================
 *  Este es el ÚNICO lugar donde tocás datos de contacto, WhatsApp y redes.
 *  Todo el sitio lee de acá. Reemplazá los [PLACEHOLDER] por datos reales.
 * ============================================================================
 */

export const site = {
  name: 'VK',
  legalName: 'VK Diseño Web', // [PLACEHOLDER] razón social si corresponde
  tagline: 'Diseño web a medida + CMS fácil de editar',
  description:
    'Diseñamos tu web profesional a medida y te damos un panel simple para editar textos, fotos y precios vos mismo, en minutos. Sin depender del diseñador. Sin pelearte con WordPress.',
  // URL pública del sitio (usada en metadata, OG, sitemap). [PLACEHOLDER]
  url: 'https://www.vk-agencia.com',
  email: 'hola@vk-agencia.com', // [PLACEHOLDER]
  city: 'Buenos Aires, Argentina', // [PLACEHOLDER]
};

/**
 * WhatsApp — CTA primaria del sitio.
 * Número en formato internacional SIN '+', espacios ni guiones.
 * Ej. Argentina: 549 + código de área sin 0 + número sin 15.
 */
export const whatsapp = {
  number: '5491100000000', // [PLACEHOLDER: número real de WhatsApp]
  defaultMessage: 'Hola VK, quiero info sobre una web 👋',
};

/** Construye el link wa.me con mensaje pre-cargado. */
export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? whatsapp.defaultMessage);
  return `https://wa.me/${whatsapp.number}?text=${text}`;
}

/** Redes sociales. Dejá la cadena vacía para ocultar el ícono en el footer. */
export const social = {
  instagram: '', // [PLACEHOLDER] ej: 'https://instagram.com/vk.agencia'
  linkedin: '', // [PLACEHOLDER]
  behance: '', // [PLACEHOLDER]
};

/** Navegación por anclas (header + footer). */
export const nav = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Trabajos', href: '#trabajos' },
  { label: 'Precios', href: '#precios' },
  { label: 'FAQ', href: '#faq' },
];
