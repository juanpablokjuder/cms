<?php
/**
 * CMS Admin — Dashboard (index)
 */
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$initials = '';
if ($user && !empty($user['name'])) {
    $parts = explode(' ', $user['name']);
    $initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
}
$currentPage = 'dashboard';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Dashboard — CMS Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/variables.css">
    <link rel="stylesheet" href="assets/css/reset.css">
    <link rel="stylesheet" href="assets/css/layout.css">
    <link rel="stylesheet" href="assets/css/components.css">
</head>
<body>
    <div class="app-layout" id="app-layout">
        <!-- Sidebar Overlay (mobile) -->
        <div class="sidebar-overlay" id="sidebar-overlay"></div>

        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon">⬡</div>
                <span class="sidebar-brand-text">CMS Admin</span>
            </div>
            <nav class="sidebar-nav" aria-label="Navegación principal">
                <span class="sidebar-nav-label">General</span>
                <a href="index.php" class="sidebar-link <?php echo $currentPage === 'dashboard' ? 'active' : ''; ?>">
                    <span class="sidebar-link-icon">📊</span>
                    <span class="sidebar-link-text">Dashboard</span>
                </a>
                <a href="users.php" class="sidebar-link <?php echo $currentPage === 'users' ? 'active' : ''; ?>">
                    <span class="sidebar-link-icon">👥</span>
                    <span class="sidebar-link-text">Usuarios</span>
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

        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <button class="header-toggle" id="sidebar-toggle" aria-label="Alternar menú lateral">☰</button>
                <h1 class="header-title">Dashboard</h1>
            </div>
            <div class="header-right">
                <div class="header-user">
                    <div class="header-avatar"><?php echo htmlspecialchars($initials); ?></div>
                    <div class="header-user-info">
                        <span class="header-user-name"><?php echo htmlspecialchars($user['name'] ?? 'Usuario'); ?></span>
                        <span class="header-user-role"><?php echo htmlspecialchars($user['role'] ?? ''); ?></span>
                    </div>
                </div>
                <a href="logout.php" class="header-logout" title="Cerrar sesión">
                    <span>Salir</span>
                    <span>→</span>
                </a>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Bienvenido, <?php echo htmlspecialchars(explode(' ', $user['name'] ?? 'Admin')[0]); ?></h2>
                    <p class="page-subtitle">Resumen general del sistema</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-grid" id="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon accent">👥</div>
                    <div class="stat-content">
                        <div class="stat-value" id="stat-total-users">—</div>
                        <div class="stat-label">Total Usuarios</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">✓</div>
                    <div class="stat-content">
                        <div class="stat-value" id="stat-active-users">—</div>
                        <div class="stat-label">Usuarios Activos</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">🛡</div>
                    <div class="stat-content">
                        <div class="stat-value" id="stat-admin-count">—</div>
                        <div class="stat-label">Administradores</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon info">🔑</div>
                    <div class="stat-content">
                        <div class="stat-value"><?php echo htmlspecialchars(ucfirst($user['role'] ?? '—')); ?></div>
                        <div class="stat-label">Tu Rol</div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div style="margin-top:var(--space-8)">
                <h3 style="font-size:var(--font-size-md);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-4);">Acciones Rápidas</h3>
                <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
                    <a href="users.php" class="btn btn-secondary">
                        <span>👥</span>
                        <span>Gestionar Usuarios</span>
                    </a>
                </div>
            </div>
        </main>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script>
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            const layout = document.getElementById('app-layout');
            if (window.innerWidth <= 768) {
                layout.classList.toggle('sidebar-mobile-open');
            } else {
                layout.classList.toggle('sidebar-collapsed');
            }
        });
        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            document.getElementById('app-layout').classList.remove('sidebar-mobile-open');
        });

        // Load dashboard stats
        (async () => {
            try {
                const result = await Api.getUsers(1, 100);
                if (result.success && result.data) {
                    const users = result.data.data || [];
                    const total = result.data.meta?.total || users.length;
                    const active = users.filter(u => u.is_active).length;
                    const admins = users.filter(u => u.role === 'admin').length;
                    document.getElementById('stat-total-users').textContent = total;
                    document.getElementById('stat-active-users').textContent = active;
                    document.getElementById('stat-admin-count').textContent = admins;
                }
            } catch (e) { /* Stats silently fail */ }
        })();
    </script>
</body>
</html>
