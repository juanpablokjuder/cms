</main><!-- /main-content -->
</div><!-- /app-layout -->

<!-- ═══ TOAST CONTAINER ══════════════════════════════════ -->
<div class="toast-container" id="toast-container" aria-live="polite" aria-atomic="false"></div>

<!-- ═══ SIDEBAR OVERLAY (mobile) ════════════════════════ -->
<div class="sidebar-overlay" id="js-sidebar-overlay" aria-hidden="true"></div>

<!-- ═══ SCRIPTS GLOBALES ═════════════════════════════════ -->
<!-- theme.js primero: garantiza que el toggle responda en DOMContentLoaded -->
<script src="/assets/js/theme.js"></script>
<script src="/assets/js/api.js"></script>
<script src="/assets/js/toast.js"></script>

<!-- Toggle sidebar (mobile) + cierre con Escape -->
<script>
(function () {
    'use strict';
    var layout  = document.getElementById('js-app-layout');
    var btn     = document.getElementById('js-sidebar-toggle');
    var overlay = document.getElementById('js-sidebar-overlay');
    if (!layout || !btn || !overlay) return;

    function open() {
        layout.classList.add('sidebar-mobile-open');
        btn.setAttribute('aria-expanded', 'true');
        overlay.removeAttribute('aria-hidden');
    }
    function close() {
        layout.classList.remove('sidebar-mobile-open');
        btn.setAttribute('aria-expanded', 'false');
        overlay.setAttribute('aria-hidden', 'true');
    }
    btn.addEventListener('click', function () {
        layout.classList.contains('sidebar-mobile-open') ? close() : open();
    });
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });
}());
</script>

<?php if (!empty($extraScripts)): ?>
  <?php foreach ($extraScripts as $script): ?>
  <script src="<?= htmlspecialchars($script, ENT_QUOTES, 'UTF-8') ?>" defer></script>
  <?php endforeach; ?>
<?php endif; ?>

</body>
</html>
