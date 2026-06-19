/**
 * ============================================================================
 *  CONTENIDO EDITABLE  —  textos, listas y datos de las secciones
 * ============================================================================
 *  Acá vive el contenido "de datos" (pasos, portfolio, testimonios, precios,
 *  FAQ). El copy de marketing largo vive en cada componente de sección.
 *  Reemplazá los [PLACEHOLDER] por información real.
 * ============================================================================
 */

export type Step = { n: string; title: string; text: string; icon: IconName };

export const steps: Step[] = [
  {
    n: '01',
    title: 'Diseñamos tu web a medida',
    text: 'Charlamos qué necesitás y diseñamos un sitio profesional, pensado para tu negocio. Nada de plantillas genéricas.',
    icon: 'pen',
  },
  {
    n: '02',
    title: 'Te entregamos tu panel simple',
    text: 'Recibís un acceso a tu propio panel: claro, ordenado y sin cosas que no usás. Te mostramos cómo en 10 minutos.',
    icon: 'layout',
  },
  {
    n: '03',
    title: 'Editás lo que quieras, cuando quieras',
    text: 'Cambiás textos, fotos, precios y productos vos mismo, en minutos. Sin esperar a nadie y sin poder romper el diseño.',
    icon: 'edit',
  },
  {
    n: '04',
    title: 'Soporte continuo',
    text: 'Cualquier duda o cambio mayor, nos escribís. Estamos para acompañarte mientras tu web crece.',
    icon: 'lifebuoy',
  },
];

export type Project = {
  title: string; // nombre del cliente / proyecto
  sector: string; // rubro
  href: string; // enlace al sitio
  // alt orientado a intent para SEO
  alt: string;
};

// [PLACEHOLDER] 6 proyectos reales. Sustituí title/sector/href y agregá la
// imagen en /public/portfolio/proyecto-N.webp (1200x900 aprox, ver README).
export const projects: Project[] = [
  { title: '[Cliente 1]', sector: 'Gastronomía', href: '#', alt: 'Sitio web diseñado por VK para un restaurante' },
  { title: '[Cliente 2]', sector: 'Estudio jurídico', href: '#', alt: 'Sitio web diseñado por VK para un estudio jurídico' },
  { title: '[Cliente 3]', sector: 'Retail', href: '#', alt: 'Sitio web diseñado por VK para un comercio de retail' },
  { title: '[Cliente 4]', sector: 'Consultorio médico', href: '#', alt: 'Sitio web diseñado por VK para un consultorio médico' },
  { title: '[Cliente 5]', sector: 'Arquitectura', href: '#', alt: 'Sitio web diseñado por VK para un estudio de arquitectura' },
  { title: '[Cliente 6]', sector: 'Startup', href: '#', alt: 'Sitio web diseñado por VK para una startup' },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string; // rubro / empresa
  initials: string; // para el avatar placeholder
};

// [PLACEHOLDER] 3 testimonios reales (nombre, rubro, cita, foto).
export const testimonials: Testimonial[] = [
  {
    quote:
      'Antes para cambiar un precio tenía que escribirle al diseñador y esperar. Ahora lo hago yo desde el celular en dos minutos.',
    name: '[Nombre Apellido]',
    role: 'Dueña de [Comercio]',
    initials: 'NA',
  },
  {
    quote:
      'Pensé que iba a ser complicado y resultó lo más fácil. Actualizo el menú yo solo, sin saber nada de tecnología.',
    name: '[Nombre Apellido]',
    role: '[Rubro / Empresa]',
    initials: 'NA',
  },
  {
    quote:
      'La web quedó impecable y, lo mejor, la mantengo al día sin depender de nadie. Justo lo que necesitaba.',
    name: '[Nombre Apellido]',
    role: 'Fundador de [Startup]',
    initials: 'NA',
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: '¿Necesito saber de tecnología para editar mi web?',
    a: 'No. El panel está pensado para personas que no saben nada de tecnología. Si sabés mandar un mensaje o subir una foto al teléfono, podés editar tu web. Además te mostramos cómo usarlo en una llamada corta.',
  },
  {
    q: '¿Qué puedo editar y qué no?',
    a: 'Editás el contenido: textos, fotos, precios, productos, horarios, promociones. Lo que NO podés (ni tenés que preocuparte por) tocar es el diseño: tipografías, colores, estructura. Por eso nunca vas a "romper" tu sitio.',
  },
  {
    q: '¿Qué incluye el abono mensual?',
    a: 'El uso del panel para editar tu web siempre que quieras, el alojamiento del sitio y el soporte continuo de nuestro equipo. Es lo que mantiene tu web online, actualizable y acompañada. [PLACEHOLDER: ajustá según tu oferta real].',
  },
  {
    q: '¿Qué pasa si quiero un cambio de diseño más adelante?',
    a: 'Los cambios de contenido los hacés vos. Para cambios de diseño (una sección nueva, un rediseño, una función extra) nos escribís y lo coordinamos. El soporte del abono cubre ajustes menores; los rediseños grandes se presupuestan aparte. [PLACEHOLDER: definí el alcance].',
  },
  {
    q: '¿Cuánto tarda en estar lista?',
    a: 'Depende del tamaño del sitio, pero un sitio one-page suele estar listo en [PLACEHOLDER: ej. 2 a 3 semanas] desde que tenemos el contenido. Te damos un plazo concreto al cotizar.',
  },
  {
    q: '¿La web es mía?',
    a: 'Sí. El sitio es tuyo y el contenido también. Te explicamos claramente las condiciones al contratar, sin letra chica. [PLACEHOLDER: aclarar términos de dominio y propiedad según tu modelo].',
  },
];

/** Íconos disponibles (ver components/ui/Icon.tsx). */
export type IconName =
  | 'pen'
  | 'layout'
  | 'edit'
  | 'lifebuoy'
  | 'lock'
  | 'maze'
  | 'bolt'
  | 'shield'
  | 'check'
  | 'whatsapp'
  | 'arrow'
  | 'plus'
  | 'instagram'
  | 'linkedin'
  | 'behance'
  | 'mail';
