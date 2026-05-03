<?php
/**
 * CMS Admin — Sidebar Partial
 * 
 * Requires $currentPage to be set before including.
 * Values: 'dashboard', 'users', 'banners'
 */
?>
<aside class="sidebar">
    <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
            <!-- Hexágono / logotipo -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 L21.5 7 L21.5 17 L12 22 L2.5 17 L2.5 7 Z" />
            </svg>
        </div>
        <span class="sidebar-brand-text">CMS Admin</span>
    </div>
    <nav class="sidebar-nav" aria-label="Navegación principal">
        <span class="sidebar-nav-label">General</span>
        <a href="index.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'dashboard' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Dashboard / gráfico de barras -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="12" width="4" height="9" rx="1" />
                    <rect x="10" y="7" width="4" height="14" rx="1" />
                    <rect x="17" y="3" width="4" height="18" rx="1" />
                </svg>
            </span>
            <span class="sidebar-link-text">Dashboard</span>
        </a>
        <a href="users.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'users' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Usuarios -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="7" r="3" />
                    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
                </svg>
            </span>
            <span class="sidebar-link-text">Usuarios</span>
        </a>
        <a href="banners.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'banners' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Banners / imagen -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            </span>
            <span class="sidebar-link-text">Banners</span>
        </a>
        <a href="noticias.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'noticias' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Noticias / documento -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path
                        d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
                </svg>
            </span>
            <span class="sidebar-link-text">Noticias</span>
        </a>
        <a href="nosotros.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'nosotros' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Nosotros / información -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="8.01" />
                    <polyline points="11 12 12 12 12 16 13 16" />
                </svg>
            </span>
            <span class="sidebar-link-text">Nosotros</span>
        </a>
        <a href="servicios.php"
            class="sidebar-link <?php echo ($currentPage ?? '') === 'servicios' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Servicios / maletín -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    <line x1="12" y1="12" x2="12" y2="12.01" />
                    <path d="M2 12h20" />
                </svg>
            </span>
            <span class="sidebar-link-text">Servicios</span>
        </a>
        <a href="faqs.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'faqs' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- FAQs / bocadillo de pregunta -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="12" y1="8" x2="12" y2="8.01" />
                    <polyline points="11 11 12 11 12 14 13 14" />
                </svg>
            </span>
            <span class="sidebar-link-text">FAQs</span>
        </a>
        <a href="footer-list.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'footer' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Footer / barra inferior de página -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="17" x2="21" y2="17" />
                    <line x1="7" y1="21" x2="7" y2="17" />
                </svg>
            </span>
            <span class="sidebar-link-text">Footer</span>
        </a>
        <span class="sidebar-nav-label">Sistema</span>
        <a href="error-logs.php"
            class="sidebar-link <?php echo ($currentPage ?? '') === 'error-logs' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">
                <!-- Log de Errores / triángulo de advertencia -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path
                        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            </span>
            <span class="sidebar-link-text">Log de Errores</span>
        </a>

        <a href="logout.php" class="sidebar-link">
            <span class="sidebar-link-icon">
                <!-- Cerrar sesión / flecha de salida -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
            </span>
            <span class="sidebar-link-text">Cerrar Sesión</span>
        </a>
    </nav>
    <div class="sidebar-footer">
        <div style="font-size:var(--font-size-xs);color:var(--color-text-tertiary);text-align:center;">v1.0.0</div>
    </div>
</aside>