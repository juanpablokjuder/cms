<?php
/**
 * CMS Admin — <head> Partial
 * 
 * Include in every page. Requires $pageTitle to be set before including.
 */
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#12121a">
<title><?php echo htmlspecialchars($pageTitle ?? 'CMS Admin'); ?> — CMS Admin</title>
<!-- Anti-FOUC: aplica el tema antes de que el navegador pinte -->
<script>
    (function () {
        try {
            var t = localStorage.getItem('cms_theme');
            if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', t);
        } catch (e) {}
    })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/variables.css">
<link rel="stylesheet" href="assets/css/reset.css">
<link rel="stylesheet" href="assets/css/layout.css">
<link rel="stylesheet" href="assets/css/components.css">
