'use strict';

/**
 * SeoAccordion — Componente reutilizable de metadatos SEO.
 *
 * Uso:
 *   const seo = new SeoAccordion({ container: '#mi-form', namespace: 'producto' });
 *   seo.populate({ title: '...', meta_description: '...', ... });
 *   const data = seo.collect();   // → { title, meta_description, ... } | null si vacío
 */
class SeoAccordion {
  /**
   * @param {object}  opts
   * @param {string}  opts.container   Selector del elemento padre donde inyectar el acordeón
   * @param {string}  [opts.namespace] Prefijo para los IDs HTML (evita colisiones entre instancias)
   */
  constructor({ container, namespace = 'seo' }) {
    this._ns  = namespace;
    this._root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this._root) throw new Error(`SeoAccordion: container "${container}" no encontrado.`);
    this._render();
    this._bindEvents();
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  _id(suffix) { return `${this._ns}-${suffix}`; }

  _render() {
    const ns = this._ns;
    const el = document.createElement('div');
    el.className = 'seo-accordion';
    el.id = this._id('accordion');
    el.innerHTML = `
      <button type="button" class="seo-accordion-header" aria-expanded="false"
              aria-controls="${this._id('body')}">
        <span class="seo-accordion-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </span>
        <span class="seo-accordion-title-wrap">
          <span class="seo-accordion-title">SEO y Metadatos</span>
          <span class="seo-accordion-subtitle">Title, descripción, Open Graph e inyección de scripts</span>
        </span>
        <svg class="seo-accordion-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div class="seo-accordion-body" id="${this._id('body')}">

        <!-- Vista previa SERP -->
        <div class="seo-preview" id="${this._id('preview')}">
          <div class="seo-preview-label">Vista previa en buscadores</div>
          <div class="seo-preview-title" id="${this._id('prev-title')}">Título de la página</div>
          <div class="seo-preview-url">https://tusitio.com/pagina</div>
          <div class="seo-preview-desc" id="${this._id('prev-desc')}">La meta descripción aparecerá aquí. Escribe algo descriptivo que invite al usuario a hacer clic.</div>
        </div>

        <hr class="seo-divider">

        <!-- Sección: SEO Básico -->
        <div>
          <div class="seo-section-label">SEO Básico</div>
          <div class="seo-grid" style="gap:var(--space-4)">

            <!-- Title -->
            <div class="seo-field">
              <div class="seo-field-header">
                <label class="seo-field-label" for="${this._id('title')}">Título de página (title)</label>
                <span class="seo-char-counter" id="${this._id('title-count')}">0 / 60</span>
              </div>
              <input type="text" id="${this._id('title')}" class="form-input"
                     maxlength="70" placeholder="Ej: Zapatillas Running | Mi Tienda">
              <span class="seo-field-hint">Recomendado: máx. 60 caracteres. Aparece como título en la pestaña del navegador y en buscadores.</span>
            </div>

            <!-- Meta Description -->
            <div class="seo-field">
              <div class="seo-field-header">
                <label class="seo-field-label" for="${this._id('meta-desc')}">Meta descripción</label>
                <span class="seo-char-counter" id="${this._id('meta-desc-count')}">0 / 160</span>
              </div>
              <textarea id="${this._id('meta-desc')}" class="form-input" rows="3"
                        maxlength="500" placeholder="Resumen atractivo del contenido de la página…"></textarea>
              <span class="seo-field-hint">Recomendado: entre 120 y 160 caracteres. Aparece debajo del título en buscadores.</span>
            </div>

            <!-- Meta Keywords -->
            <div class="seo-field">
              <div class="seo-field-header">
                <label class="seo-field-label" for="${this._id('meta-kw')}">Palabras clave (keywords)</label>
                <span class="seo-char-counter" id="${this._id('meta-kw-count')}">0 / 500</span>
              </div>
              <input type="text" id="${this._id('meta-kw')}" class="form-input"
                     maxlength="500" placeholder="running, zapatillas, deporte, calzado">
              <span class="seo-field-hint">Separadas por coma. Google no las utiliza directamente, pero otros motores sí.</span>
            </div>

          </div>
        </div>

        <hr class="seo-divider">

        <!-- Sección: Open Graph -->
        <div>
          <div class="seo-section-label">Open Graph (redes sociales)</div>
          <div class="seo-grid seo-grid-2">

            <!-- OG Title -->
            <div class="seo-field">
              <div class="seo-field-header">
                <label class="seo-field-label" for="${this._id('og-title')}">og:title</label>
                <span class="seo-char-counter" id="${this._id('og-title-count')}">0 / 95</span>
              </div>
              <input type="text" id="${this._id('og-title')}" class="form-input"
                     maxlength="95" placeholder="Título al compartir en redes">
            </div>

            <!-- OG Description -->
            <div class="seo-field">
              <div class="seo-field-header">
                <label class="seo-field-label" for="${this._id('og-desc')}">og:description</label>
                <span class="seo-char-counter" id="${this._id('og-desc-count')}">0 / 500</span>
              </div>
              <textarea id="${this._id('og-desc')}" class="form-input" rows="3"
                        maxlength="500" placeholder="Descripción al compartir en redes sociales…"></textarea>
            </div>

          </div>
        </div>

        <hr class="seo-divider">

        <!-- Sección: Scripts -->
        <div>
          <div class="seo-section-label">Inyección de scripts</div>
          <div class="seo-grid seo-grid-2">

            <!-- Scripts HEAD -->
            <div class="seo-field">
              <div class="seo-field-header">
                <label class="seo-field-label" for="${this._id('scripts-head')}">Scripts en &lt;head&gt;</label>
              </div>
              <textarea id="${this._id('scripts-head')}" class="form-input seo-scripts-textarea"
                        placeholder="&lt;!-- Google Tag Manager, Schema.org, etc. --&gt;"></textarea>
              <span class="seo-field-hint">Se inyecta antes de &lt;/head&gt;. Ej: Google Analytics, GTM, JSON-LD.</span>
            </div>

            <!-- Scripts BODY -->
            <div class="seo-field">
              <div class="seo-field-header">
                <label class="seo-field-label" for="${this._id('scripts-body')}">Scripts en &lt;body&gt;</label>
              </div>
              <textarea id="${this._id('scripts-body')}" class="form-input seo-scripts-textarea"
                        placeholder="&lt;!-- Facebook Pixel, Hotjar, etc. --&gt;"></textarea>
              <span class="seo-field-hint">Se inyecta antes de &lt;/body&gt;. Ej: Meta Pixel, Hotjar, Clarity.</span>
            </div>

          </div>
        </div>

      </div><!-- /.seo-accordion-body -->
    `;
    this._root.appendChild(el);
    this._el = el;
  }

  // ─── Eventos ───────────────────────────────────────────────────────────────

  _bindEvents() {
    // Toggle acordeón
    this._el.querySelector('.seo-accordion-header').addEventListener('click', () => this.toggle());

    // Contadores de caracteres + vista previa
    this._bindCounter(this._id('title'),      this._id('title-count'),     60);
    this._bindCounter(this._id('meta-desc'),  this._id('meta-desc-count'), 160);
    this._bindCounter(this._id('meta-kw'),    this._id('meta-kw-count'),   500);
    this._bindCounter(this._id('og-title'),   this._id('og-title-count'),  95);
    this._bindCounter(this._id('og-desc'),    this._id('og-desc-count'),   500);

    // Vista previa SERP en tiempo real
    const titleInput = document.getElementById(this._id('title'));
    const descInput  = document.getElementById(this._id('meta-desc'));
    const prevTitle  = document.getElementById(this._id('prev-title'));
    const prevDesc   = document.getElementById(this._id('prev-desc'));

    titleInput?.addEventListener('input', () => {
      prevTitle.textContent = titleInput.value || 'Título de la página';
    });
    descInput?.addEventListener('input', () => {
      prevDesc.textContent = descInput.value || 'La meta descripción aparecerá aquí…';
    });
  }

  _bindCounter(fieldId, counterId, warn) {
    const field   = document.getElementById(fieldId);
    const counter = document.getElementById(counterId);
    if (!field || !counter) return;

    const max = parseInt(field.getAttribute('maxlength') || '9999', 10);
    const update = () => {
      const len = field.value.length;
      counter.textContent = `${len} / ${warn}`;
      counter.classList.remove('warn', 'over');
      if (len > max)  counter.classList.add('over');
      else if (len > warn) counter.classList.add('warn');
    };
    field.addEventListener('input', update);
    update();
  }

  // ─── API pública ───────────────────────────────────────────────────────────

  toggle() {
    const open = this._el.classList.toggle('open');
    this._el.querySelector('.seo-accordion-header').setAttribute('aria-expanded', String(open));
  }

  open()  { if (!this._el.classList.contains('open')) this.toggle(); }
  close() { if ( this._el.classList.contains('open')) this.toggle(); }

  /** Carga datos existentes en los campos */
  populate(data = {}) {
    const set = (id, val) => {
      const el = document.getElementById(this._id(id));
      if (el) {
        el.value = val ?? '';
        el.dispatchEvent(new Event('input'));
      }
    };
    set('title',        data.title);
    set('meta-desc',    data.meta_description);
    set('meta-kw',      data.meta_keywords);
    set('og-title',     data.og_title);
    set('og-desc',      data.og_description);
    set('scripts-head', data.scripts_head);
    set('scripts-body', data.scripts_body);
  }

  /**
   * Recolecta los 7 campos y los devuelve como objeto.
   * Devuelve null si todos los campos están vacíos.
   */
  collect() {
    const g = id => (document.getElementById(this._id(id))?.value?.trim() || null);
    const data = {
      title:            g('title'),
      meta_description: g('meta-desc'),
      meta_keywords:    g('meta-kw'),
      og_title:         g('og-title'),
      og_description:   g('og-desc'),
      scripts_head:     g('scripts-head'),
      scripts_body:     g('scripts-body'),
    };
    const hasData = Object.values(data).some(v => v !== null);
    return hasData ? data : null;
  }
}
