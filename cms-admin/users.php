<?php
/**
 * CMS Admin — Users ABM (Alta, Baja, Modificación)
 */
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$initials = '';
if ($user && !empty($user['name'])) {
    $parts = explode(' ', $user['name']);
    $initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
}
$currentPage = 'users';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Usuarios — CMS Admin</title>
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
                <h1 class="header-title">Usuarios</h1>
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
                    <h2 class="page-title">Gestión de Usuarios</h2>
                    <p class="page-subtitle">Administre los usuarios del sistema</p>
                </div>
                <button class="btn btn-primary" id="btn-create-user">
                    <span>+</span>
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            <!-- Users Table -->
            <div class="card">
                <div class="table-wrapper">
                    <table class="data-table" id="users-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Fecha de Alta</th>
                                <th style="width:100px">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="users-tbody">
                            <!-- Rendered by JS -->
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <div class="pagination" id="pagination">
                        <span class="pagination-info" id="pagination-info">Cargando...</span>
                        <div class="pagination-controls">
                            <button class="pagination-btn" id="pagination-prev" disabled aria-label="Página anterior">←</button>
                            <div id="pagination-numbers"></div>
                            <button class="pagination-btn" id="pagination-next" disabled aria-label="Página siguiente">→</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- ═══ Create/Edit User Modal ═══ -->
    <div class="modal-backdrop" id="user-modal">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title" id="user-modal-title">Nuevo Usuario</h3>
                <button class="modal-close" data-modal-close aria-label="Cerrar">✕</button>
            </div>
            <form id="user-form" novalidate>
                <div class="modal-body">
                    <!-- Name -->
                    <div class="form-group">
                        <label class="form-label" for="user-name">Nombre <span class="required">*</span></label>
                        <input type="text" id="user-name" class="form-input" placeholder="Nombre completo" required minlength="2" maxlength="150">
                        <span class="form-error" id="user-name-error"></span>
                    </div>
                    <!-- Email -->
                    <div class="form-group">
                        <label class="form-label" for="user-email">Correo electrónico <span class="required">*</span></label>
                        <input type="email" id="user-email" class="form-input" placeholder="correo@ejemplo.com" required>
                        <span class="form-error" id="user-email-error"></span>
                    </div>
                    <!-- Password -->
                    <div class="form-group" id="user-form-password-group">
                        <label class="form-label" for="user-password">Contraseña <span class="required">*</span></label>
                        <input type="password" id="user-password" class="form-input" placeholder="Mínimo 8 caracteres" minlength="8" maxlength="72">
                        <span class="form-error" id="user-password-error"></span>
                    </div>
                    <!-- Role -->
                    <div class="form-group">
                        <label class="form-label" for="user-role">Rol</label>
                        <select id="user-role" class="form-select">
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                        <span class="form-error" id="user-role-error"></span>
                    </div>
                    <!-- Active -->
                    <div class="form-group">
                        <label class="form-label" for="user-active">Estado</label>
                        <select id="user-active" class="form-select">
                            <option value="1">Activo</option>
                            <option value="0">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="user-form-submit">
                        <span class="spinner"></span>
                        <span class="btn-text">Guardar</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ═══ Delete Confirmation Modal ═══ -->
    <div class="modal-backdrop" id="delete-modal">
        <div class="modal" style="max-width:420px">
            <div class="modal-header">
                <h3 class="modal-title">Confirmar Eliminación</h3>
                <button class="modal-close" data-modal-close aria-label="Cerrar">✕</button>
            </div>
            <div class="modal-body" style="text-align:center">
                <div class="confirm-icon danger">🗑️</div>
                <p class="confirm-text">
                    ¿Está seguro que desea eliminar al usuario<br>
                    <strong id="delete-user-name"></strong>?
                </p>
                <p class="confirm-text" style="margin-top:var(--space-2);font-size:var(--font-size-xs);">
                    Esta acción no se puede deshacer.
                </p>
            </div>
            <div class="modal-footer" style="justify-content:center">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
                <button type="button" class="btn btn-danger" id="btn-confirm-delete">
                    <span class="spinner"></span>
                    <span class="btn-text">Eliminar</span>
                </button>
            </div>
        </div>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/users.js"></script>
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
    </script>
</body>
</html>
