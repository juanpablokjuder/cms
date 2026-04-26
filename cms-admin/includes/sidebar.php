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
        <div class="sidebar-brand-icon">⬡</div>
        <span class="sidebar-brand-text">CMS Admin</span>
    </div>
    <nav class="sidebar-nav" aria-label="Navegación principal">
        <span class="sidebar-nav-label">General</span>
        <a href="index.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'dashboard' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">📊</span>
            <span class="sidebar-link-text">Dashboard</span>
        </a>
        <a href="users.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'users' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">👥</span>
            <span class="sidebar-link-text">Usuarios</span>
        </a>
        <a href="banners.php" class="sidebar-link <?php echo ($currentPage ?? '') === 'banners' ? 'active' : ''; ?>">
            <span class="sidebar-link-icon">🖼️</span>
            <span class="sidebar-link-text">Banners</span>
        </a>
        <span class="sidebar-nav-label">Sistema</span>
        <a href="logout.php" class="sidebar-link">
            <span class="sidebar-link-icon">🚪</span>
            <span class="sidebar-link-text">Cerrar Sesión</span>
        </a>
    </nav>
    <div class="sidebar-footer">
        <div style="font-size:var(--font-size-xs);color:var(--color-text-tertiary);text-align:center;">v1.0.0</div>
    </div>
</aside>
