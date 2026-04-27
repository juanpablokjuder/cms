/**
 * theme.js — Sistema de tema dark/light para CMS Admin
 *
 * Responsabilidades:
 *  1. Leer la preferencia del usuario desde localStorage
 *  2. Aplicar el tema al <html> sin parpadeo (FOUC prevention)
 *  3. Gestionar el toggle con animación de transición suave
 *  4. Sincronizar el ícono del botón con el tema activo
 *  5. Respetar la preferencia del sistema operativo como fallback
 *
 * NOTA: El script de inicialización (punto 1 y 2) debe estar en
 * un <script> inline en el <head> ANTES de que cargue cualquier CSS.
 * Este archivo maneja la interactividad (punto 3, 4 y 5).
 */

const ThemeManager = (() => {
    'use strict';

    // ── Constantes ──────────────────────────────────────────
    const STORAGE_KEY    = 'cms_theme';
    const DARK           = 'dark';
    const LIGHT          = 'light';
    const VALID_THEMES   = new Set([DARK, LIGHT]);

    // Duración de la clase de transición en ms (debe coincidir con --transition-smooth)
    const TRANSITION_DURATION = 300;

    // ── Estado interno ───────────────────────────────────────
    let _currentTheme = DARK;
    let _toggleButton = null;

    // ── Utilidades ───────────────────────────────────────────

    /**
     * Retorna el tema guardado en localStorage.
     * Fallback: preferencia del sistema operativo.
     * Fallback final: dark.
     *
     * @returns {'dark' | 'light'}
     */
    function getStoredTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && VALID_THEMES.has(stored)) return stored;
        } catch {
            // localStorage bloqueado (modo incógnito estricto, etc.)
        }

        // Respetar preferencia del sistema si no hay preferencia guardada
        if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
            return LIGHT;
        }

        return DARK;
    }

    /**
     * Persiste el tema en localStorage.
     * @param {'dark' | 'light'} theme
     */
    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Silenciar errores de escritura (storage lleno, bloqueado, etc.)
        }
    }

    /**
     * Aplica el tema al elemento <html>.
     * Agrega clase de transición para animar el cambio,
     * luego la remueve para no interferir con otras animaciones.
     *
     * @param {'dark' | 'light'} theme
     * @param {boolean} animate — false en la carga inicial (evita FOUC)
     */
    function applyTheme(theme, animate = true) {
        const html = document.documentElement;

        if (animate) {
            // Agregar clase de transición temporalmente
            html.classList.add('theme-transitioning');
            setTimeout(() => html.classList.remove('theme-transitioning'), TRANSITION_DURATION);
        }

        html.setAttribute('data-theme', theme);
        _currentTheme = theme;

        // Actualizar el aria-label del botón
        if (_toggleButton) {
            const label = theme === DARK
                ? 'Cambiar a tema claro'
                : 'Cambiar a tema oscuro';
            _toggleButton.setAttribute('aria-label', label);
            _toggleButton.setAttribute('title', label);
        }

        // Actualizar el meta theme-color para mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === DARK ? '#12121a' : '#ffffff';
        }
    }

    /**
     * Alterna entre dark y light.
     */
    function toggle() {
        const next = _currentTheme === DARK ? LIGHT : DARK;
        applyTheme(next, true);
        saveTheme(next);
    }

    // ── Inicialización ───────────────────────────────────────

    /**
     * Busca el botón de toggle en el DOM y le asigna el evento.
     * Se llama en DOMContentLoaded.
     */
    function init() {
        _toggleButton = document.getElementById('js-theme-toggle');

        if (!_toggleButton) {
            console.warn('[ThemeManager] Botón #js-theme-toggle no encontrado.');
            return;
        }

        // Sincronizar estado inicial (el tema ya fue aplicado por el script inline)
        _currentTheme = document.documentElement.getAttribute('data-theme') || DARK;
        applyTheme(_currentTheme, false);

        // Evento de click
        _toggleButton.addEventListener('click', toggle);

        // Escuchar cambios de preferencia del sistema operativo en tiempo real
        window.matchMedia?.('(prefers-color-scheme: light)')
              .addEventListener('change', (e) => {
                  // Solo seguir al sistema si el usuario no guardó una preferencia propia
                  try {
                      if (!localStorage.getItem(STORAGE_KEY)) {
                          applyTheme(e.matches ? LIGHT : DARK, true);
                      }
                  } catch {
                      // localStorage inaccesible
                  }
              });
    }

    // ── API pública ──────────────────────────────────────────
    return {
        init,
        toggle,
        getTheme: () => _currentTheme,
        getStoredTheme,
    };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', ThemeManager.init);
