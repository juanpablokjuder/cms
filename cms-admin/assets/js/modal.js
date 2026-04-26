/**
 * CMS Admin — Modal System
 * 
 * Usage:
 *   Modal.open('user-modal');
 *   Modal.close('user-modal');
 */

'use strict';

const Modal = (() => {

    function open(id) {
        const backdrop = document.getElementById(id);
        if (!backdrop) return;
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        requestAnimationFrame(() => {
            const input = backdrop.querySelector('input:not([type="hidden"]), select, textarea');
            if (input) input.focus();
        });
    }

    function close(id) {
        const backdrop = document.getElementById(id);
        if (!backdrop) return;
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    function init() {
        // Close on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                close(e.target.id);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const active = document.querySelector('.modal-backdrop.active');
                if (active) close(active.id);
            }
        });

        // Close buttons
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('[data-modal-close]');
            if (closeBtn) {
                const backdrop = closeBtn.closest('.modal-backdrop');
                if (backdrop) close(backdrop.id);
            }
        });
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { open, close };
})();
