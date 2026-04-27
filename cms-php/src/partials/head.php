<?php
// ============================================================
// PARTIAL: head.php — HTML head + sidebar + header
//
// Variables que el archivo padre DEBE definir:
//   string $pageTitle   — Título de la página
//   string $currentPage — Slug activo: 'users' | 'media' | etc.
//   array  $currentUser — Datos del usuario autenticado (PublicUser)
//
// Opcionales:
//   array  $extraStyles  — Rutas CSS adicionales específicas de la página
//   array  $extraScripts — Rutas JS adicionales (se cargan en foot.php)
//   string $bodyClass    — Clase adicional para <body>
// ============================================================

$csrfToken   = AuthGuard::getCsrfToken();
$appName     = 'CMS Admin';
$extraStyles = $extraStyles ?? [];
$extraScripts= $extraScripts ?? [];
$bodyClass   = $bodyClass   ?? '';

$navItems = [
    ['slug' => 'dashboard', 'label' => 'Dashboard',    'href' => '#',          'icon' => 'home'],
    ['slug' => 'users',     'label' => 'Usuarios',     'href' => '/users.php', 'icon' => 'users'],
    ['slug' => 'media',     'label' => 'Multimedia',   'href' => '#',          'icon' => 'image'],
    ['slug' => 'forms',     'label' => 'Formularios',  'href' => '#',          'icon' => 'mail'],
    ['slug' => 'settings',  'label' => 'Configuración','href' => '#',          'icon' => 'settings'],
];

$roleLabels = [
    'admin'  => 'Administrador',
    'editor' => 'Editor',
    'viewer' => 'Visualizador',
];
$userRoleLabel = $roleLabels[$currentUser['role'] ?? ''] ?? ucfirst($currentUser['role'] ?? '');

$icons = [
    'home'     => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'users'    => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'image'    => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    'mail'     => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    'settings' => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    'logout'   => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    'sun'      => '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    'moon'     => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <!--
    meta theme-color: color de la barra de UI del navegador en mobile.
    Se actualiza dinámicamente por theme.js al cambiar de tema.
  -->
  <meta name="theme-color" content="#12121a" id="meta-theme-color">
  <meta name="csrf-token" content="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">

  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?> — <?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?></title>

  <!--
    ╔═══════════════════════════════════════════════════════╗
    ║  FOUC PREVENTION — Script de inicialización de tema  ║
    ║                                                       ║
    ║  DEBE ejecutarse SINCRÓNICAMENTE aquí, antes de que   ║
    ║  el browser parsee el CSS. Aplica data-theme al <html>║
    ║  con 0 parpadeo (Flash of Unstyled Content).          ║
    ║                                                       ║
    ║  No importar desde archivo externo — el browser       ║
    ║  bloquearía el render hasta descargarlo.              ║
    ╚═══════════════════════════════════════════════════════╝
  -->
  <script>
    (function () {
      var STORAGE_KEY   = 'cms_theme';
      var VALID_THEMES  = { dark: true, light: true };
      var theme         = 'dark'; // default

      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored && VALID_THEMES[stored]) {
          theme = stored;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
          theme = 'light';
        }
      } catch (e) {
        // localStorage bloqueado — usar default
      }

      document.documentElement.setAttribute('data-theme', theme);

      // Actualizar meta theme-color inmediatamente
      var meta = document.getElementById('meta-theme-color');
      if (meta) meta.content = theme === 'light' ? '#ffffff' : '#12121a';
    }());
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- CSS: orden importa — variables primero, luego reset, luego layout, luego componentes -->
  <link rel="stylesheet" href="/assets/css/variables.css">
  <link rel="stylesheet" href="/assets/css/reset.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">

  <!-- CSS específicos de la página -->
  <?php foreach ($extraStyles as $css): ?>
  <link rel="stylesheet" href="<?= htmlspecialchars($css, ENT_QUOTES, 'UTF-8') ?>">
  <?php endforeach; ?>

  <!--
    Estilo inline mínimo para la transición de tema.
    Previene el parpadeo en elementos que no estén cubiertos por
    las transiciones de los componentes.
  -->
  <style>
    .theme-transitioning,
    .theme-transitioning *,
    .theme-transitioning *::before,
    .theme-transitioning *::after {
      transition:
        background-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
        border-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
        color 200ms ease,
        box-shadow 300ms ease !important;
    }
  </style>
</head>
<body class="<?= htmlspecialchars($bodyClass, ENT_QUOTES, 'UTF-8') ?>">

<!-- ═══ SIDEBAR ═════════════════════════════════════════ -->
<div class="app-layout" id="js-app-layout">
<aside class="sidebar" aria-label="Navegación principal">

  <!-- Logo / Brand -->
  <div class="sidebar-brand">
    <div class="sidebar-brand-icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="9" height="3" rx="1.5" fill="white"/>
        <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="white"/>
        <rect x="3" y="17" width="6" height="3" rx="1.5" fill="white"/>
      </svg>
    </div>
    <span class="sidebar-brand-text"><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?></span>
  </div>

  <!-- Navegación -->
  <nav class="sidebar-nav" aria-label="Menú principal">
    <?php foreach ($navItems as $item):
      $isActive   = ($item['slug'] === $currentPage);
      $isDisabled = ($item['href'] === '#') && !$isActive;
      $cls = 'sidebar-link'
           . ($isActive   ? ' active'   : '')
           . ($isDisabled ? ' disabled' : '');
    ?>
    <a href="<?= htmlspecialchars($item['href'], ENT_QUOTES, 'UTF-8') ?>"
       class="<?= $cls ?>"
       <?= $isActive   ? 'aria-current="page"'                 : '' ?>
       <?= $isDisabled ? 'tabindex="-1" aria-disabled="true"'  : '' ?>
       title="<?= htmlspecialchars($item['label'], ENT_QUOTES, 'UTF-8') ?>">
      <span class="sidebar-link-icon"><?= $icons[$item['icon']] ?? '' ?></span>
      <span class="sidebar-link-text"><?= htmlspecialchars($item['label'], ENT_QUOTES, 'UTF-8') ?></span>
    </a>
    <?php endforeach; ?>
  </nav>

  <!-- Footer del sidebar: avatar + nombre + rol -->
  <div class="sidebar-footer">
    <div class="header-user">
      <div class="header-avatar" aria-hidden="true">
        <?= htmlspecialchars(strtoupper(mb_substr($currentUser['name'] ?? 'U', 0, 1)), ENT_QUOTES, 'UTF-8') ?>
      </div>
      <div class="header-user-info">
        <span class="header-user-name"><?= htmlspecialchars($currentUser['name'] ?? '', ENT_QUOTES, 'UTF-8') ?></span>
        <span class="header-user-role"><?= htmlspecialchars($userRoleLabel, ENT_QUOTES, 'UTF-8') ?></span>
      </div>
    </div>
  </div>

</aside>

<!-- ═══ HEADER ══════════════════════════════════════════ -->
<header class="header" role="banner">

  <div class="header-left">
    <!-- Toggle sidebar (mobile) -->
    <button type="button" class="header-toggle" id="js-sidebar-toggle"
            aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="js-app-layout">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <h1 class="header-title"><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></h1>
  </div>

  <div class="header-right">

    <!-- ── Theme Toggle Button ──────────────────────── -->
    <button type="button"
            class="btn-theme-toggle"
            id="js-theme-toggle"
            aria-label="Cambiar a tema claro"
            title="Cambiar a tema claro">
      <!--
        .icon-moon: visible en dark mode (invita a ir al light)
        .icon-sun:  visible en light mode (invita a ir al dark)
        El CSS [data-theme="light"] intercambia cuál se muestra.
      -->
      <span class="icon-moon"><?= $icons['moon'] ?></span>
      <span class="icon-sun"><?= $icons['sun'] ?></span>
    </button>

    <!-- ── Usuario + Logout ─────────────────────────── -->
    <div class="header-user">
      <div class="header-avatar" aria-hidden="true">
        <?= htmlspecialchars(strtoupper(mb_substr($currentUser['name'] ?? 'U', 0, 1)), ENT_QUOTES, 'UTF-8') ?>
      </div>
      <div class="header-user-info">
        <span class="header-user-name"><?= htmlspecialchars($currentUser['name'] ?? '', ENT_QUOTES, 'UTF-8') ?></span>
        <span class="header-user-role"><?= htmlspecialchars($userRoleLabel, ENT_QUOTES, 'UTF-8') ?></span>
      </div>
    </div>

    <button type="button" class="header-logout" id="js-logout-btn"
            aria-label="Cerrar sesión" title="Cerrar sesión">
      <?= $icons['logout'] ?>
      <span>Salir</span>
    </button>

  </div>
</header>

<!-- ═══ CONTENIDO PRINCIPAL ═════════════════════════════ -->
<main class="main-content" id="main-content">
