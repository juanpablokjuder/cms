<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'users';
$headerTitle = 'Editar Usuario';
$pageTitle = 'Editar Usuario';
$editUuid = trim($_GET['uuid'] ?? '');
if (empty($editUuid)) {
    header('Location: users.php');
    exit;
}
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
                    <h2 class="page-title">Editar Usuario</h2>
                    <p class="page-subtitle">Modifique los datos del usuario</p>
                </div>
                <a href="users.php" class="btn btn-secondary">← Volver</a>
            </div>

            <div class="card" style="max-width:640px">
                <form id="user-form" novalidate>
                    <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-5)">
                        <div class="form-group">
                            <label class="form-label" for="user-name">Nombre <span class="required">*</span></label>
                            <input type="text" id="user-name" class="form-input" placeholder="Nombre completo" required
                                minlength="2" maxlength="150">
                            <span class="form-error" id="user-name-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="user-email">Correo electrónico <span
                                    class="required">*</span></label>
                            <input type="email" id="user-email" class="form-input" placeholder="correo@ejemplo.com"
                                required>
                            <span class="form-error" id="user-email-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="user-password">Contraseña <span
                                    style="font-weight:normal;color:var(--color-text-tertiary)">(dejar vacío para no
                                    cambiar)</span></label>
                            <input type="password" id="user-password" class="form-input"
                                placeholder="Nueva contraseña (opcional)" minlength="8" maxlength="72">
                            <span class="form-error" id="user-password-error"></span>
                        </div>
                        <div class="form-cols-2">
                            <div class="form-group">
                                <label class="form-label" for="user-role">Rol</label>
                                <select id="user-role" class="form-select">
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <span class="form-error" id="user-role-error"></span>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="user-active">Estado</label>
                                <select id="user-active" class="form-select">
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <a href="users.php" class="btn btn-secondary">Cancelar</a>
                        <button type="submit" class="btn btn-primary" id="user-form-submit">
                            <span class="spinner"></span>
                            <span class="btn-text">Guardar Cambios</span>
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>

    <script>window.USER_UUID = <?php echo json_encode($editUuid); ?>;</script>
    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/user-form.js"></script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>

</html>