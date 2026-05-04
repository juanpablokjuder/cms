# CMS Web API — Documentación para desarrollo del frontend

> **Audiencia:** Esta documentación está dirigida a una IA (o desarrollador) que construirá el frontend web consumiendo esta API. Contiene toda la información necesaria para implementar cada sección del sitio, incluyendo la estructura de datos devuelta, cómo manejarla y sugerencias de presentación.

---

## Índice

1. [Configuración y autenticación](#1-configuración-y-autenticación)
2. [Formato de respuesta](#2-formato-de-respuesta)
3. [Manejo de errores](#3-manejo-de-errores)
4. [Secciones disponibles](#4-secciones-disponibles)
   - [4.1 Banners](#41-banners)
   - [4.2 Noticias](#42-noticias)
   - [4.3 Nosotros](#43-nosotros)
   - [4.4 Servicios](#44-servicios)
   - [4.5 FAQs](#45-faqs)
   - [4.6 Footer](#46-footer)
5. [Guía de implementación por sección](#5-guía-de-implementación-por-sección)
6. [Notas generales de diseño](#6-notas-generales-de-diseño)

---

## 1. Configuración y autenticación

### Base URL

```
http://<HOST>:<PORT>/api/v1/web
```

Ejemplo en desarrollo: `http://localhost:3000/api/v1/web`

### Autenticación

Todos los endpoints del módulo web **no usan JWT**. Utilizan un token estático configurado en el servidor mediante la variable de entorno `WEB_API_TOKEN`.

**Cada request debe incluir el siguiente header:**

```
Authorization: Bearer <WEB_API_TOKEN>
```

El token es un string de al menos 32 caracteres generado con `openssl rand -hex 32`. Lo provee el administrador del backend al momento de configurar el entorno del frontend.

> **Importante:** Este token es fijo (no expira) y debe guardarse como variable de entorno en el frontend (`process.env.WEB_API_TOKEN` en Node.js, o equivalente). **Nunca hardcodearlo en el código fuente.**

### Implementación recomendada (TypeScript / fetch)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL; // o equivalente en tu framework
const WEB_TOKEN = process.env.WEB_API_TOKEN;

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1/web${path}`, {
    headers: {
      'Authorization': `Bearer ${WEB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // o 'force-cache' / revalidate según el caso
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}
```

---

## 2. Formato de respuesta

Todas las respuestas exitosas siguen este envelope:

```json
{
  "success": true,
  "data": <contenido específico de cada endpoint>,
  "message": "string opcional"
}
```

Cuando `data` puede ser nulo (secciones singleton no creadas aún), se devuelve:

```json
{
  "success": true,
  "data": null
}
```

El frontend debe verificar si `data !== null` antes de renderizar la sección.

---

## 3. Manejo de errores

En caso de error, la respuesta tiene este formato:

```json
{
  "success": false,
  "message": "Descripción del error",
  "code": "ERROR_CODE"
}
```

| Código HTTP | `code` común         | Causa                                   |
|-------------|----------------------|-----------------------------------------|
| 401         | `UNAUTHORIZED`       | Token faltante o inválido               |
| 404         | `NOT_FOUND`          | Recurso no encontrado (p.ej. slug erróneo) |
| 500         | `INTERNAL_ERROR`     | Error interno del servidor              |

---

## 4. Secciones disponibles

> Cada sección es **independiente**: el sitio web puede usar todas o solo algunas. Si una sección no está creada en el admin, el endpoint devuelve `data: null` (singletons) o `data: []` (listas). El frontend debe manejar ambos casos graciosamente.

---

### 4.1 Banners

**Endpoint:** `GET /api/v1/web/banners`

**Query params opcionales:**

| Param   | Tipo   | Descripción                                         |
|---------|--------|-----------------------------------------------------|
| `pagina`| string | Filtra banners por nombre de página (ej: `"home"`) |

**Ejemplos:**
```
GET /api/v1/web/banners           → todos los banners activos
GET /api/v1/web/banners?pagina=home → solo banners de la página "home"
```

**Estructura de `data`:** `Banner[]`

```typescript
interface Banner {
  uuid:         string;       // identificador único
  pagina:       string;       // nombre de la página a la que pertenece (ej: "home", "about")
  imagen:       string | null; // URL absoluta de la imagen (ej: "http://host/api/v1/archivos/mi-banner-abc")
  imagen_alt:   string | null; // texto alt para accesibilidad
  imagen_title: string | null; // title del elemento imagen
  h1:           string;       // título principal del banner
  texto_1:      string | null; // texto secundario / subtítulo
  texto_2:      string | null; // texto adicional (ej: descripción breve)
  btn_texto:    string | null; // texto del botón CTA (puede ser null si no hay botón)
  btn_link:     string | null; // URL destino del botón
  orden:        number;       // posición en el listado (ascendente)
  created_at:   string;       // ISO 8601
  updated_at:   string;
}
```

**Comportamiento:**
- Los banners vienen ordenados por `orden ASC`. Si varios tienen el mismo orden, se usa `created_at DESC`.
- Si no hay banners creados, `data` es `[]`.
- Si no hay imagen, `imagen` es `null` → mostrar un banner con fondo de color o un placeholder.
- El campo `pagina` permite que el admin cargue banners para múltiples páginas. Usar el filtro `?pagina=` para solicitar solo los que corresponden a la página actual.

**Casos de presentación:**
- Banner hero con imagen de fondo, h1, texto_1 y CTA (`btn_texto` + `btn_link`).
- Carrusel/slider si hay múltiples banners para la misma página.
- Verificar `btn_texto !== null` antes de renderizar el botón.

---

### 4.2 Noticias

**Endpoints:**
- `GET /api/v1/web/noticias` — listado paginado
- `GET /api/v1/web/noticias/:slug` — detalle de una noticia

#### Listado

**Query params:**

| Param   | Tipo   | Default | Descripción                  |
|---------|--------|---------|------------------------------|
| `page`  | number | 1       | Página actual                |
| `limit` | number | 10      | Items por página (máx 50)    |

**Estructura de `data`:**

```typescript
interface PaginatedNoticias {
  data: Noticia[];
  meta: {
    total:      number; // total de registros
    page:       number; // página actual
    limit:      number; // items por página
    totalPages: number; // total de páginas
  };
}

interface Noticia {
  uuid:      string;
  titulo:    string;
  subtitulo: string | null;
  slug:      string;        // identificador URL-friendly (usar para el enlace al detalle)
  texto:     string;        // HTML o texto enriquecido con el contenido completo
  imagenes:  NoticiaImagen[];
  created_at: string;       // fecha de publicación (ISO 8601)
  updated_at: string;
}

interface NoticiaImagen {
  archivo_uuid: string;
  url:          string;       // URL absoluta de la imagen
  alt:          string | null;
  title:        string | null;
  orden:        number;       // orden de aparición (ascendente)
}
```

**Para navegar al detalle:** construir URL con el `slug`:
```
/noticias/mi-titulo-de-noticia
```

#### Detalle por slug

```
GET /api/v1/web/noticias/:slug
```

Devuelve un único objeto `Noticia` (misma estructura). Responde 404 si el slug no existe.

**Comportamiento:**
- El array `imagenes` está ordenado por `orden ASC`. La primera imagen (`imagenes[0]`) es la imagen principal/destacada.
- Si no hay imágenes, `imagenes` es `[]`.
- El campo `texto` puede contener HTML — renderizar con `dangerouslySetInnerHTML` (React) o `v-html` (Vue), asegurando sanitización contra XSS.

**Casos de presentación:**
- Cards con imagen principal, título, subtítulo y fecha en el listado.
- Botón "Leer más" que navega a `/<ruta-noticias>/<slug>`.
- Galería de imágenes en el detalle si `imagenes.length > 1`.
- Paginación usando `meta.totalPages` y `meta.page`.

---

### 4.3 Nosotros

**Endpoint:** `GET /api/v1/web/nosotros`

**Estructura de `data`:** `Nosotros | null`

```typescript
interface Nosotros {
  uuid:      string;
  titulo:    string;        // título de la sección
  subtitulo: string | null; // subtítulo opcional
  texto:     string;        // contenido principal (puede contener HTML)
  imagenes:  NosotrosImagen[];
  created_at: string;
  updated_at: string;
}

interface NosotrosImagen {
  archivo_uuid: string;
  url:          string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}
```

**Comportamiento:**
- Es un **singleton**: el admin solo puede crear un registro. Si no fue creado, `data` es `null`.
- Las imágenes vienen ordenadas por `orden ASC`.
- El campo `texto` puede contener HTML.

**Casos de presentación:**
- Sección "Quiénes somos" / "Sobre nosotros" con título, texto y galería de imágenes.
- Si hay múltiples imágenes: carrusel, grilla o imagen principal + miniaturas.
- Si `data === null`: ocultar la sección o mostrar contenido estático de fallback.

---

### 4.4 Servicios

**Endpoint:** `GET /api/v1/web/servicios`

Devuelve la estructura completa en **una sola llamada**:
- Información general de la sección Servicios (singleton)
- Todas las categorías activas con sus respectivos items activos

**Estructura de `data`:**

```typescript
interface ServiciosData {
  servicio:   Servicio | null;
  categorias: CategoriaConItems[];
}

interface Servicio {
  uuid:      string;
  titulo:    string;        // título principal de la sección servicios
  subtitulo: string | null; // descripción/subtítulo de la sección
  created_at: string;
  updated_at: string;
}

interface CategoriaConItems {
  uuid:      string;
  nombre:    string;   // nombre de la categoría (ej: "Consultoría", "Desarrollo")
  orden:     number;   // orden de aparición
  estado:    number;   // siempre 1 (activo) en esta respuesta
  items:     ServicioItem[];
  created_at: string;
  updated_at: string;
}

interface ServicioItem {
  uuid:           string;
  categoria_uuid: string | null; // UUID de la categoría a la que pertenece
  titulo:         string;
  subtitulo_1:    string | null;
  subtitulo_2:    string | null;
  precio:         string | null; // formato decimal en string, ej: "1500.00"
  moneda:         Moneda | null; // null si el item no tiene precio
  btn_titulo:     string | null; // texto del botón CTA
  btn_link:       string | null; // URL del botón
  texto:          string | null; // descripción larga (puede contener HTML)
  estado:         'activo' | 'inactivo' | 'no_mostrar'; // siempre 'activo' en esta respuesta
  imagenes:       ServicioImagen[];
  created_at:     string;
  updated_at:     string;
}

interface Moneda {
  uuid:   string;
  codigo: string; // ej: "USD", "ARS", "EUR"
  nombre: string; // ej: "Dólar estadounidense"
}

interface ServicioImagen {
  archivo_uuid: string;
  url:          string;
  alt:          string | null;
  title:        string | null;
  orden:        number;
}
```

**Comportamiento:**
- Solo se incluyen categorías con `estado = 1` (activo).
- Solo se incluyen items con `estado = 'activo'`.
- Las categorías están ordenadas por `orden ASC`.
- Los items dentro de cada categoría están ordenados por `created_at ASC`.
- Si no hay categorías activas, `categorias` es `[]`.
- Si el singleton Servicios no fue creado, `servicio` es `null`.

**Mostrar precio:**
```typescript
function formatPrecio(item: ServicioItem): string | null {
  if (item.precio === null) return null;
  const moneda = item.moneda?.codigo ?? '';
  return `${moneda} ${parseFloat(item.precio).toLocaleString()}`;
}
```

**Casos de presentación:**
- Sección con título/subtítulo general (`servicio.titulo` / `servicio.subtitulo`).
- Tabs o acordeón por categoría (`categorias[].nombre`).
- Cards de servicios con imagen, título, precio y CTA dentro de cada categoría.
- Si un item no tiene `precio`, no mostrar la sección de precio.
- Si un item no tiene `btn_link`, no mostrar el botón.

---

### 4.5 FAQs

**Endpoint:** `GET /api/v1/web/faqs`

**Estructura de `data`:** `FaqGrupo[]`

```typescript
interface FaqGrupo {
  uuid:         string;
  titulo:       string;       // título del grupo de FAQs (ej: "Preguntas sobre pagos")
  imagen:       string | null; // URL de imagen decorativa del grupo
  imagen_alt:   string | null;
  imagen_title: string | null;
  items:        FaqItem[];    // preguntas y respuestas del grupo
  created_at:   string;
  updated_at:   string;
}

interface FaqItem {
  uuid:      string;
  pregunta:  string; // texto de la pregunta
  respuesta: string; // texto de la respuesta (puede contener HTML)
  orden:     number; // orden dentro del grupo
}
```

**Comportamiento:**
- Los FAQs vienen ordenados por `created_at ASC` (en el orden en que fueron creados).
- Los items dentro de cada grupo están ordenados por `orden ASC`.
- Si no hay FAQs creados, `data` es `[]`.
- El campo `respuesta` puede contener HTML.

**Casos de presentación:**
- Acordeón (accordion) donde cada `FaqGrupo` es una sección y cada `FaqItem` es un ítem expandible.
- Si hay un solo grupo, el título del grupo puede omitirse.
- Si `imagen` no es null, usarla como imagen decorativa del encabezado del grupo.

---

### 4.6 Footer

**Endpoint:** `GET /api/v1/web/footer`

**Estructura de `data`:** `Footer | null`

```typescript
interface Footer {
  uuid:           string;
  columnas_count: number;           // número de columnas del layout (1-4)
  copyright_text: string | null;    // texto de copyright
  columnas:       FooterColumna[];  // columnas de contenido
  redes:          FooterRed[];      // redes sociales
  legales:        FooterLegal[];    // links legales (términos, privacidad, etc.)
  created_at:     string;
  updated_at:     string;
}
```

#### Columnas

Cada columna tiene un `tipo` que determina cómo renderizarla:

```typescript
type FooterColumnaTipo = 'media_texto' | 'lista_enlaces' | 'contacto';

interface FooterColumna {
  uuid:  string;
  tipo:  FooterColumnaTipo;
  orden: number;            // orden de aparición (ascendente)
  data:  MediaTextoData | ListaEnlacesData | ContactoData;
}
```

**Tipo: `media_texto`** — Logo + texto descriptivo

```typescript
interface MediaTextoData {
  imagen:      string | null; // URL absoluta del logo o imagen
  descripcion: string | null; // texto descriptivo de la empresa
}
```

**Tipo: `lista_enlaces`** — Columna de links de navegación

```typescript
interface ListaEnlacesData {
  enlaces: FooterEnlace[];
}

interface FooterEnlace {
  uuid:  string;
  texto: string; // texto del link
  url:   string; // URL destino (puede ser relativa o absoluta)
  orden: number;
}
```

**Tipo: `contacto`** — Información de contacto

```typescript
interface ContactoData {
  direccion: string | null;
  telefono:  string | null;
  email:     string | null;
}
```

#### Redes sociales

```typescript
interface FooterRed {
  uuid:     string;
  nombre:   string;   // nombre de la red (ej: "Facebook", "Instagram")
  url:      string;   // URL del perfil
  svg_icon: string;   // SVG del ícono (renderizar con dangerouslySetInnerHTML o v-html)
  orden:    number;
}
```

#### Links legales

```typescript
interface FooterLegal {
  uuid:  string;
  texto: string; // ej: "Términos y condiciones", "Política de privacidad"
  url:   string; // URL de la página legal
  orden: number;
}
```

**Comportamiento:**
- Las columnas vienen ordenadas por `orden ASC`.
- Si `data === null`, el footer no fue configurado → ocultar la sección o mostrar un footer mínimo.
- `columnas_count` indica al layout cuántas columnas usar (útil para CSS grid/flexbox).

**Implementación del switch por tipo:**

```typescript
function renderColumna(columna: FooterColumna) {
  switch (columna.tipo) {
    case 'media_texto':
      return <MediaTextoColumna data={columna.data as MediaTextoData} />;
    case 'lista_enlaces':
      return <ListaEnlacesColumna data={columna.data as ListaEnlacesData} />;
    case 'contacto':
      return <ContactoColumna data={columna.data as ContactoData} />;
  }
}
```

**Renderizar iconos de redes sociales:**
El campo `svg_icon` contiene el markup SVG directo del ícono. Renderizarlo con `dangerouslySetInnerHTML` (React) o `v-html` (Vue), sanitizando contra XSS si el origen no es de confianza:

```typescript
// React
<a href={red.url} target="_blank">
  <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(red.svg_icon) }} />
  <span>{red.nombre}</span>
</a>
```

---

## 5. Guía de implementación por sección

### Patrón de fetch recomendado

Todas las secciones siguen el mismo patrón. Ejemplo para Next.js App Router:

```typescript
// app/page.tsx
import { getBanners, getNoticias, getNosotros, getServicios, getFaqs, getFooter } from '@/lib/api';

export default async function HomePage() {
  const [banners, noticias, nosotros, servicios, faqs, footer] = await Promise.all([
    getBanners('home'),
    getNoticias({ page: 1, limit: 6 }),
    getNosotros(),
    getServicios(),
    getFaqs(),
    getFooter(),
  ]);

  return (
    <>
      {banners.length > 0 && <HeroSection banners={banners} />}
      {nosotros && <AboutSection data={nosotros} />}
      {servicios.categorias.length > 0 && <ServicesSection data={servicios} />}
      {noticias.data.length > 0 && <NewsSection noticias={noticias} />}
      {faqs.length > 0 && <FaqSection faqs={faqs} />}
      {footer && <FooterSection footer={footer} />}
    </>
  );
}
```

### Funciones de API sugeridas

```typescript
// lib/api.ts
const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/web`;
const TOKEN = process.env.WEB_API_TOKEN!;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const { data } = await res.json();
  return data as T;
}

export const getBanners = (pagina?: string) =>
  get<Banner[]>(`/banners${pagina ? `?pagina=${pagina}` : ''}`);

export const getNoticias = (params: { page?: number; limit?: number } = {}) =>
  get<PaginatedNoticias>(`/noticias?page=${params.page ?? 1}&limit=${params.limit ?? 10}`);

export const getNoticiaBySlug = (slug: string) =>
  get<Noticia>(`/noticias/${slug}`);

export const getNosotros = () =>
  get<Nosotros | null>('/nosotros');

export const getServicios = () =>
  get<ServiciosData>('/servicios');

export const getFaqs = () =>
  get<FaqGrupo[]>('/faqs');

export const getFooter = () =>
  get<Footer | null>('/footer');
```

---

## 6. Notas generales de diseño

### Imágenes
- Todas las URLs de imágenes son absolutas (incluyen protocolo y host).
- En producción la URL del host cambiará — asegurarse de que `PUBLIC_API_URL` esté correctamente configurado en el backend.
- Usar `imagen_alt` como atributo `alt` en todos los `<img>`. Si es `null`, usar un texto descriptivo alternativo.
- Las imágenes son servidas directamente por la API en `/api/v1/archivos/:slug`.

### Fechas
- Todas las fechas son strings ISO 8601 UTC. Formatear según el locale del usuario.

### Contenido HTML
- Los campos `texto` (Nosotros, Noticias, Servicios) y `respuesta` (FAQs) pueden contener HTML.
- **Sanitizar siempre** antes de insertar en el DOM para prevenir XSS. Usar librerías como `DOMPurify` (browser) o `sanitize-html` (Node.js).

### Secciones opcionales
- Ninguna sección es obligatoria. El frontend debe renderizar solo las que tienen datos.
- Patrón seguro: `{data !== null && data.length !== 0 && <Seccion data={data} />}`

### Cache / revalidación
- Los datos del CMS cambian con poca frecuencia. En Next.js se recomienda `revalidate: 60` (1 minuto) para la mayoría de secciones.
- Para noticias en detalle, puede usarse ISR (Incremental Static Regeneration) con `generateStaticParams` usando los slugs.

### Paginación de noticias
- El máximo de `limit` es 50 por request.
- Para infinito scroll: hacer nuevas llamadas incrementando `page`.
- Para paginación clásica: usar `meta.totalPages` para calcular el número de páginas.

---

## Changelog

| Fecha       | Versión | Cambio                                              |
|-------------|---------|-----------------------------------------------------|
| 2026-05-03  | 1.0.0   | Módulo web inicial: banners, noticias, nosotros, servicios, faqs, footer |
