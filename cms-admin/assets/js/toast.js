/**
 * CMS Admin — Toast Notification System
 * 
 * Usage:
 *   Toast.success('Usuario creado correctamente.');
 *   Toast.error('No se pudo conectar al servidor.');
 *   Toast.info('Se actualizó la lista.');
 *   Toast.warning('La sesión expirará pronto.');
 */

'use strict';

const Toast = (() => {
    const DURATION = 4000;
    let container = null;

    function getContainer() {
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    const ICONS = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    const TITLES = {
        success: 'Éxito',
        error: 'Error',
        info: 'Información',
        warning: 'Advertencia',
    };

    function show(type, message, duration = DURATION) {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `
            <span class="toast-icon">${ICONS[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${TITLES[type]}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Cerrar">✕</button>
            <div class="toast-progress" style="animation-duration:${duration}ms"></div>
        `;

        const closeBtn = el.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => remove(el));

        getContainer().appendChild(el);

        const timer = setTimeout(() => remove(el), duration);
        el._timer = timer;

        return el;
    }

    function remove(el) {
        if (el._removing) return;
        el._removing = true;
        clearTimeout(el._timer);
        el.classList.add('removing');
        el.addEventListener('animationend', () => el.remove());
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return {
        success: (msg, dur) => show('success', msg, dur),
        error:   (msg, dur) => show('error', msg, dur),
        info:    (msg, dur) => show('info', msg, dur),
        warning: (msg, dur) => show('warning', msg, dur),
    };
})();
