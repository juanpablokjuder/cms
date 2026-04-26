<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/functions.php';
// Redirect if already authenticated
if (isAuthenticated()) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Panel de administración CMS — Iniciar sesión">
    <meta name="robots" content="noindex, nofollow">
    <title>Iniciar Sesión — CMS Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/variables.css">
    <link rel="stylesheet" href="assets/css/reset.css">
    <link rel="stylesheet" href="assets/css/components.css">
    <link rel="stylesheet" href="assets/css/login.css">
</head>
<body>
    <div class="login-page">
        <!-- Animated background -->
        <div class="login-bg" aria-hidden="true"></div>

        <!-- Login Card -->
        <main class="login-card">
            <header class="login-header">
                <div class="login-logo" aria-hidden="true">⬡</div>
                <h1 class="login-title">Bienvenido</h1>
                <p class="login-subtitle">Ingrese sus credenciales para continuar</p>
            </header>

            <!-- Alert -->
            <div class="login-alert" id="login-alert" role="alert">
                <span class="login-alert-icon">⚠</span>
                <span id="login-alert-message"></span>
            </div>

            <form id="login-form" class="login-form" novalidate>
                <!-- Email -->
                <div class="form-group">
                    <label class="form-label" for="login-email">Correo electrónico</label>
                    <div class="form-input-wrapper">
                        <input
                            type="email"
                            id="login-email"
                            class="form-input"
                            placeholder="admin@ejemplo.com"
                            autocomplete="email"
                            required
                        >
                        <span class="form-input-icon" aria-hidden="true">✉</span>
                    </div>
                    <span class="form-error" id="login-email-error"></span>
                </div>

                <!-- Password -->
                <div class="form-group">
                    <label class="form-label" for="login-password">Contraseña</label>
                    <div class="form-input-wrapper">
                        <input
                            type="password"
                            id="login-password"
                            class="form-input"
                            placeholder="••••••••"
                            autocomplete="current-password"
                            required
                        >
                        <span class="form-input-icon" aria-hidden="true">🔒</span>
                        <button type="button" class="password-toggle" id="password-toggle" aria-label="Mostrar contraseña">⊙</button>
                    </div>
                    <span class="form-error" id="login-password-error"></span>
                </div>

                <!-- Submit -->
                <button type="submit" id="login-submit" class="btn btn-primary login-btn">
                    <span class="spinner"></span>
                    <span class="btn-text">Iniciar Sesión</span>
                </button>
            </form>

            <footer class="login-footer">
                <p>&copy; <?php echo date('Y'); ?> CMS Admin · v1.0</p>
            </footer>
        </main>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/auth.js"></script>
</body>
</html>
