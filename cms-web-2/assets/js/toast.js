'use strict';

/**
 * Toast — Notificaciones accesibles. Reutilizable globalmente como window.Toast.
 */
(function () {
    const REGION_ID = 'vm-toast-region';

    function getRegion() {
        let r = document.getElementById(REGION_ID);
        if (!r) {
            r = document.createElement('div');
            r.id = REGION_ID;
            r.setAttribute('role', 'region');
            r.setAttribute('aria-live', 'polite');
            r.setAttribute('aria-label', 'Notificaciones');
            document.body.appendChild(r);
        }
        return r;
    }

    function show(message, type = 'info', duration = 3500) {
        const region = getRegion();
        const t = document.createElement('div');
        t.className = `vm-toast ${type}`;
        t.textContent = message;
        region.appendChild(t);

        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(20px)';
            setTimeout(() => t.remove(), 220);
        }, duration);
    }

    window.Toast = {
        show,
        success: (m, d) => show(m, 'success', d),
        error:   (m, d) => show(m, 'error',   d),
        info:    (m, d) => show(m, 'info',    d),
    };
})();
