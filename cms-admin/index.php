<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';

$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$firstName = htmlspecialchars($parts[0] ?? 'Admin');
$userRole = htmlspecialchars(ucfirst($user['role'] ?? '—'));

$currentPage = 'dashboard';
$headerTitle = 'Dashboard';
$pageTitle = 'Dashboard';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <style>
        /* ══════════════════════════════════════════════
           Dashboard — estilos específicos
           ══════════════════════════════════════════════ */

        /* ── Hero ───────────────────────────────────── */
        .dash-hero {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--space-6);
            background: linear-gradient(135deg,
                    rgba(99, 102, 241, 0.13) 0%,
                    rgba(99, 102, 241, 0.05) 45%,
                    transparent 100%);
            border: 1px solid rgba(99, 102, 241, 0.22);
            border-radius: var(--radius-xl);
            padding: var(--space-8);
            margin-bottom: var(--space-8);
            overflow: hidden;
            animation: dashFadeUp 0.45s ease both;
        }

        .dash-hero::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 60% 80% at 100% 50%,
                    rgba(99, 102, 241, 0.1) 0%,
                    transparent 70%);
            pointer-events: none;
        }

        .dash-hero-glyph {
            position: absolute;
            right: -30px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.03;
            pointer-events: none;
        }

        .dash-greeting {
            font-size: var(--font-size-3xl);
            font-weight: var(--font-weight-bold);
            color: var(--color-text-primary);
            letter-spacing: var(--letter-spacing-tight);
            line-height: var(--line-height-tight);
            margin-bottom: var(--space-2);
        }

        .dash-greeting-name {
            color: var(--color-accent-hover);
        }

        .dash-subtitle {
            font-size: var(--font-size-base);
            color: var(--color-text-secondary);
            margin-bottom: var(--space-5);
        }

        .dash-badges {
            display: flex;
            gap: var(--space-2);
            flex-wrap: wrap;
        }

        .dash-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        .dash-badge-role {
            background: var(--color-accent-subtle);
            color: var(--color-accent-hover);
            border: 1px solid rgba(99, 102, 241, 0.28);
        }

        .dash-badge-online {
            background: rgba(34, 197, 94, 0.1);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.25);
        }

        .dash-badge-online::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 6px #22c55e;
            animation: dashPulse 2s ease-in-out infinite;
        }

        .dash-hero-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-3);
            flex-shrink: 0;
        }

        .dash-avatar {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--color-accent) 0%, #818cf8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-bold);
            color: #fff;
            box-shadow:
                0 0 0 3px rgba(99, 102, 241, 0.2),
                0 0 20px rgba(99, 102, 241, 0.3);
            letter-spacing: 0;
        }

        .dash-clock {
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
            color: var(--color-text-tertiary);
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.04em;
            white-space: nowrap;
        }

        /* ── Stats ──────────────────────────────────── */
        .dash-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
            gap: var(--space-4);
            margin-bottom: var(--space-8);
            animation: dashFadeUp 0.45s ease 0.08s both;
        }

        .dash-stat {
            position: relative;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-5);
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
            overflow: hidden;
            transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }

        .dash-stat:hover {
            border-color: var(--color-border-focus);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }

        .dash-stat::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            border-radius: 3px 0 0 3px;
        }

        .dash-stat.s-indigo::before {
            background: var(--color-accent);
        }

        .dash-stat.s-green::before {
            background: var(--color-success);
        }

        .dash-stat.s-orange::before {
            background: #f97316;
        }

        .dash-stat.s-blue::before {
            background: var(--color-info);
        }

        .dash-stat.s-purple::before {
            background: #a855f7;
        }

        .dash-stat.s-amber::before {
            background: var(--color-warning);
        }

        .dash-stat-icon {
            width: 38px;
            height: 38px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: var(--space-2);
        }

        .dash-stat.s-indigo .dash-stat-icon {
            background: rgba(99, 102, 241, .12);
            color: #818cf8;
        }

        .dash-stat.s-green .dash-stat-icon {
            background: rgba(34, 197, 94, .12);
            color: #4ade80;
        }

        .dash-stat.s-orange .dash-stat-icon {
            background: rgba(249, 115, 22, .12);
            color: #fb923c;
        }

        .dash-stat.s-blue .dash-stat-icon {
            background: rgba(59, 130, 246, .12);
            color: #60a5fa;
        }

        .dash-stat.s-purple .dash-stat-icon {
            background: rgba(168, 85, 247, .12);
            color: #c084fc;
        }

        .dash-stat.s-amber .dash-stat-icon {
            background: rgba(245, 158, 11, .12);
            color: #fbbf24;
        }

        .dash-stat-value {
            font-size: var(--font-size-3xl);
            font-weight: var(--font-weight-bold);
            color: var(--color-text-primary);
            line-height: 1;
            font-variant-numeric: tabular-nums;
        }

        .dash-stat-label {
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
            font-weight: var(--font-weight-medium);
        }

        .dash-stat-link {
            display: inline-block;
            margin-top: var(--space-2);
            font-size: var(--font-size-xs);
            color: var(--color-text-tertiary);
            text-decoration: none;
            transition: color 0.2s;
        }

        .dash-stat-link:hover {
            color: var(--color-accent-hover);
        }

        /* ── Section label ──────────────────────────── */
        .dash-section-label {
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-tertiary);
            text-transform: uppercase;
            letter-spacing: 0.09em;
            margin-bottom: var(--space-4);
        }

        /* ── Modules grid ───────────────────────────── */
        .dash-modules {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
            gap: var(--space-4);
            animation: dashFadeUp 0.45s ease 0.16s both;
        }

        .dash-module {
            position: relative;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-5);
            display: flex;
            align-items: flex-start;
            gap: var(--space-4);
            text-decoration: none;
            transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
            overflow: hidden;
        }

        .dash-module::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, transparent 60%, rgba(255, 255, 255, 0.015) 100%);
            pointer-events: none;
        }

        .dash-module:hover {
            background: var(--color-surface-hover);
            border-color: var(--color-border-focus);
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);
        }

        .dash-module-icon {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .dash-module-body {
            flex: 1;
            min-width: 0;
        }

        .dash-module-title {
            font-size: var(--font-size-base);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
            margin-bottom: 4px;
        }

        .dash-module-desc {
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
            line-height: var(--line-height-normal);
        }

        .dash-module-arrow {
            position: absolute;
            bottom: var(--space-4);
            right: var(--space-4);
            color: var(--color-text-tertiary);
            transition: color 0.2s, transform 0.2s;
        }

        .dash-module:hover .dash-module-arrow {
            color: var(--color-accent-hover);
            transform: translateX(4px);
        }

        /* ── Module icon palettes ───────────────────── */
        .mi-indigo {
            background: rgba(99, 102, 241, .12);
            color: #818cf8;
        }

        .mi-blue {
            background: rgba(59, 130, 246, .12);
            color: #60a5fa;
        }

        .mi-green {
            background: rgba(34, 197, 94, .12);
            color: #4ade80;
        }

        .mi-orange {
            background: rgba(249, 115, 22, .12);
            color: #fb923c;
        }

        .mi-amber {
            background: rgba(245, 158, 11, .12);
            color: #fbbf24;
        }

        .mi-purple {
            background: rgba(168, 85, 247, .12);
            color: #c084fc;
        }

        .mi-cyan {
            background: rgba(6, 182, 212, .12);
            color: #22d3ee;
        }

        .mi-teal {
            background: rgba(20, 184, 166, .12);
            color: #2dd4bf;
        }

        .mi-slate {
            background: rgba(100, 116, 139, .12);
            color: #94a3b8;
        }

        .mi-red {
            background: rgba(239, 68, 68, .12);
            color: #f87171;
        }

        /* ── Animations ─────────────────────────────── */
        @keyframes dashFadeUp {
            from {
                opacity: 0;
                transform: translateY(18px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes dashPulse {

            0%,
            100% {
                opacity: 1;
                transform: scale(1);
            }

            50% {
                opacity: 0.4;
                transform: scale(0.75);
            }
        }

        /* ── Responsive ─────────────────────────────── */
        @media (max-width: 768px) {
            .dash-hero {
                flex-direction: column;
                align-items: flex-start;
                padding: var(--space-6);
            }

            .dash-hero-right {
                flex-direction: row;
                align-items: center;
            }

            .dash-greeting {
                font-size: var(--font-size-xl);
            }

            .dash-stats {
                grid-template-columns: repeat(2, 1fr);
            }

            .dash-modules {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">

            <!-- ── Hero ─────────────────────────────────────── -->
            <div class="dash-hero">
                <!-- Glifo decorativo -->
                <svg class="dash-hero-glyph" width="340" height="340" viewBox="0 0 24 24" fill="white"
                    aria-hidden="true">
                    <path d="M12 2 L21.5 7 L21.5 17 L12 22 L2.5 17 L2.5 7 Z" />
                </svg>

                <div>
                    <div class="dash-greeting">
                        Bienvenido, <span class="dash-greeting-name"><?= $firstName ?></span>
                    </div>
                    <div class="dash-subtitle" id="dash-date">Panel de control del sistema CMS</div>
                    <div class="dash-badges">
                        <span class="dash-badge dash-badge-role"><?= $userRole ?></span>
                        <span class="dash-badge dash-badge-online">Sistema operativo</span>
                    </div>
                </div>

                <div class="dash-hero-right">
                    <div class="dash-avatar"><?= htmlspecialchars($initials) ?></div>
                    <div class="dash-clock" id="dash-clock">—</div>
                </div>
            </div>

            <!-- ── Estadísticas ──────────────────────────────── -->
            <div class="dash-stats">

                <div class="dash-stat s-indigo">
                    <div class="dash-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="7" r="3" />
                            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
                        </svg>
                    </div>
                    <div class="dash-stat-value" id="stat-users">—</div>
                    <div class="dash-stat-label">Usuarios</div>
                    <a href="users.php" class="dash-stat-link">Gestionar →</a>
                </div>

                <div class="dash-stat s-green">
                    <div class="dash-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
                        </svg>
                    </div>
                    <div class="dash-stat-value" id="stat-noticias">—</div>
                    <div class="dash-stat-label">Noticias</div>
                    <a href="noticias.php" class="dash-stat-link">Gestionar →</a>
                </div>

                <div class="dash-stat s-orange">
                    <div class="dash-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                    </div>
                    <div class="dash-stat-value" id="stat-productos">—</div>
                    <div class="dash-stat-label">Productos</div>
                    <a href="productos.php" class="dash-stat-link">Gestionar →</a>
                </div>

                <div class="dash-stat s-blue">
                    <div class="dash-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                    <div class="dash-stat-value" id="stat-banners">—</div>
                    <div class="dash-stat-label">Banners</div>
                    <a href="banners.php" class="dash-stat-link">Gestionar →</a>
                </div>

                <div class="dash-stat s-purple">
                    <div class="dash-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div class="dash-stat-value" id="stat-faqs">—</div>
                    <div class="dash-stat-label">FAQs</div>
                    <a href="faqs.php" class="dash-stat-link">Gestionar →</a>
                </div>

                <div class="dash-stat s-amber">
                    <div class="dash-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            <path d="M2 12h20" />
                        </svg>
                    </div>
                    <div class="dash-stat-value" id="stat-servicios">—</div>
                    <div class="dash-stat-label">Servicios</div>
                    <a href="servicios.php" class="dash-stat-link">Gestionar →</a>
                </div>

            </div>

            <!-- ── Módulos ───────────────────────────────────── -->
            <div class="dash-section-label">Módulos del sistema</div>
            <div class="dash-modules">

                <a href="users.php" class="dash-module">
                    <div class="dash-module-icon mi-indigo">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="7" r="3" />
                            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Usuarios</div>
                        <div class="dash-module-desc">Administración de cuentas, roles y permisos del sistema</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="banners.php" class="dash-module">
                    <div class="dash-module-icon mi-blue">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Banners</div>
                        <div class="dash-module-desc">Gestión de banners y contenido visual del sitio web</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="noticias.php" class="dash-module">
                    <div class="dash-module-icon mi-green">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Noticias</div>
                        <div class="dash-module-desc">Publicación y edición de artículos y novedades del sitio</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="productos.php" class="dash-module">
                    <div class="dash-module-icon mi-orange">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Productos</div>
                        <div class="dash-module-desc">Catálogo de productos, atributos, colores y variantes</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="servicios.php" class="dash-module">
                    <div class="dash-module-icon mi-amber">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            <path d="M2 12h20" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Servicios</div>
                        <div class="dash-module-desc">Categorías e ítems del portafolio de servicios ofrecidos</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="faqs.php" class="dash-module">
                    <div class="dash-module-icon mi-purple">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">FAQs</div>
                        <div class="dash-module-desc">Preguntas frecuentes y respuestas para los clientes</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="nosotros.php" class="dash-module">
                    <div class="dash-module-icon mi-cyan">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="8.01" />
                            <polyline points="11 12 12 12 12 16 13 16" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Nosotros</div>
                        <div class="dash-module-desc">Contenido de la sección "Quiénes somos" del sitio</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="empresa.php" class="dash-module">
                    <div class="dash-module-icon mi-teal">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Empresa</div>
                        <div class="dash-module-desc">Datos generales, contacto e información institucional</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="footer-list.php" class="dash-module">
                    <div class="dash-module-icon mi-slate">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="17" x2="21" y2="17" />
                            <line x1="7" y1="21" x2="7" y2="17" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Footer</div>
                        <div class="dash-module-desc">Links, columnas y contenido del pie de página del sitio</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

                <a href="error-logs.php" class="dash-module">
                    <div class="dash-module-icon mi-red">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <div class="dash-module-body">
                        <div class="dash-module-title">Log de Errores</div>
                        <div class="dash-module-desc">Monitoreo de errores y eventos del sistema en tiempo real</div>
                    </div>
                    <div class="dash-module-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </a>

            </div>

        </main>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
    <script>
        'use strict';

        // ── Reloj en vivo ────────────────────────────────────────────────────
        const updateClock = () => {
            const now = new Date();
            document.getElementById('dash-clock').textContent =
                now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const fecha = now.toLocaleDateString('es-AR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            document.getElementById('dash-date').textContent =
                fecha.charAt(0).toUpperCase() + fecha.slice(1);
        };
        updateClock();
        setInterval(updateClock, 1000);

        // ── Animación de contadores ──────────────────────────────────────────
        const animateCounter = (el, target) => {
            if (target === 0) { el.textContent = '0'; return; }
            const duration = 700;
            const steps = Math.max(1, Math.ceil(duration / 16));
            const inc = Math.ceil(target / steps);
            let current = 0;
            const timer = setInterval(() => {
                current = Math.min(current + inc, target);
                el.textContent = current;
                if (current >= target) clearInterval(timer);
            }, 16);
        };

        // ── Carga de estadísticas ────────────────────────────────────────────
        (async () => {
            const [users, noticias, productos, banners, faqs, servicios] = await Promise.allSettled([
                Api.getUsers(1, 1),
                Api.getNoticias(1, 1),
                Api.getProductos(1, 1),
                Api.getBanners(1, 1),
                Api.getFaqs(1, 1),
                Api.getServicioCategorias(1, 1),
            ]);

            const getTotal = (res) => {
                if (res.status !== 'fulfilled') return null;
                const d = res.value?.data;
                return d?.meta?.total ?? d?.data?.length ?? null;
            };

            [
                [users, 'stat-users'],
                [noticias, 'stat-noticias'],
                [productos, 'stat-productos'],
                [banners, 'stat-banners'],
                [faqs, 'stat-faqs'],
                [servicios, 'stat-servicios'],
            ].forEach(([res, id]) => {
                const el = document.getElementById(id);
                const val = getTotal(res);
                if (!el) return;
                if (val !== null) animateCounter(el, val);
                else el.textContent = '—';
            });
        })();
    </script>
</body>

</html>