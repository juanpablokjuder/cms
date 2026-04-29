<?php

declare(strict_types=1);

if (!defined('CMS_LOADED')) { http_response_code(403); exit; }

// ============================================================
// AuthGuard — Protección de rutas y gestión de sesión
// ============================================================

final class AuthGuard
{
    /**
     * Verifica que exista una sesión válida.
     * Si no hay sesión, redirige a login.
     * Si la hay, devuelve los datos del usuario.
     *
     * @return array<string, mixed> Datos del usuario autenticado
     */
    public static function requireAuth(): array
    {
        self::startSession();

        $token = $_SESSION[SESSION_TOKEN_KEY] ?? null;
        $user  = $_SESSION[SESSION_USER_KEY]  ?? null;

        if ($token === null || $user === null) {
            self::redirectToLogin();
        }

        // Regenerar CSRF token si no existe
        if (empty($_SESSION[SESSION_CSRF_KEY])) {
            $_SESSION[SESSION_CSRF_KEY] = self::generateCsrfToken();
        }

        return (array) $user;
    }

    /**
     * Redirige al dashboard si ya existe sesión activa.
     * Usar en la página de login para evitar acceso duplicado.
     */
    public static function redirectIfAuthenticated(): void
    {
        self::startSession();

        if (!empty($_SESSION[SESSION_TOKEN_KEY])) {
            header('Location: ' . PATH_DASHBOARD);
            exit;
        }
    }

    /**
     * Almacena token y datos de usuario en sesión tras login exitoso.
     *
     * @param string               $token JWT recibido de la API
     * @param array<string, mixed> $user  PublicUser object de la API
     */
    public static function createSession(string $token, array $user): void
    {
        self::startSession();

        // Regenerar ID de sesión para prevenir session fixation
        session_regenerate_id(delete_old_session: true);

        $_SESSION[SESSION_TOKEN_KEY] = $token;
        $_SESSION[SESSION_USER_KEY]  = $user;
        $_SESSION[SESSION_CSRF_KEY]  = self::generateCsrfToken();
    }

    /**
     * Destruye completamente la sesión.
     */
    public static function destroySession(): void
    {
        self::startSession();

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                SESSION_NAME,
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();
    }

    /**
     * Retorna el token JWT almacenado en sesión.
     */
    public static function getToken(): string
    {
        return $_SESSION[SESSION_TOKEN_KEY] ?? '';
    }

    /**
     * Retorna el CSRF token de la sesión actual.
     */
    public static function getCsrfToken(): string
    {
        return $_SESSION[SESSION_CSRF_KEY] ?? '';
    }

    /**
     * Valida el CSRF token enviado en una petición AJAX.
     * Lanza 403 si el token es inválido.
     */
    public static function validateCsrf(): void
    {
        $sentToken     = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken  = $_SESSION[SESSION_CSRF_KEY]   ?? '';

        if ($sessionToken === '' || !hash_equals($sessionToken, $sentToken)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Token de seguridad inválido.']);
            exit;
        }
    }

    /**
     * Valida que la petición sea una llamada AJAX legítima.
     * Prevención básica de CSRF para peticiones cross-site.
     */
    public static function requireAjax(): void
    {
        $requestedWith = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';

        if (strtolower($requestedWith) !== 'xmlhttprequest') {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Petición no permitida.']);
            exit;
        }
    }

    // ── Privados ────────────────────────────────────────────

    private static function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_set_cookie_params([
                'lifetime' => 0,           // Cookie de sesión (expira al cerrar browser)
                'path'     => '/',
                'secure'   => IS_PRODUCTION,
                'httponly' => true,        // Inaccesible desde JS
                'samesite' => 'Lax',      // Protección CSRF
            ]);
            session_start();
        }
    }

    private static function generateCsrfToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    private static function redirectToLogin(): never
    {
        header('Location: ' . PATH_LOGIN);
        exit;
    }
}
