<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'dashboard';
$headerTitle = 'Dashboard';
$pageTitle = 'Dashboard';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
</head>
<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Bienvenido, <?php echo htmlspecialchars(explode(' ', $user['name'] ?? 'Admin')[0]); ?></h2>
                    <p class="page-subtitle">Resumen general del sistema</p>
                </div>
            </div>

            <div class="stats-grid">
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

            <div style="margin-top:var(--space-8)">
                <h3 style="font-size:var(--font-size-md);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-4);">Acciones Rápidas</h3>
                <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
                    <a href="users.php" class="btn btn-secondary"><span>👥</span><span>Gestionar Usuarios</span></a>
                    <a href="banners.php" class="btn btn-secondary"><span>🖼️</span><span>Gestionar Banners</span></a>
                </div>
            </div>
        </main>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
    <script>
        (async () => {
            try {
                const result = await Api.getUsers(1, 100);
                if (result.success && result.data) {
                    const users = result.data.data || [];
                    const total = result.data.meta?.total || users.length;
                    document.getElementById('stat-total-users').textContent = total;
                    document.getElementById('stat-active-users').textContent = users.filter(u => u.is_active).length;
                    document.getElementById('stat-admin-count').textContent = users.filter(u => u.role === 'admin').length;
                }
            } catch (e) {}
        })();
    </script>
</body>
</html>
