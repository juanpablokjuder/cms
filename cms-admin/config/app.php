<?php
/**
 * CMS Admin Panel — Configuration
 * 
 * Central configuration constants and session setup.
 * Adjust API_BASE_URL to match your server environment.
 */

declare(strict_types=1);

// ─── API Connection ─────────────────────────────────────────
define('API_BASE_URL', 'http://192.168.0.20:3000/api/v1');

// ─── Application ────────────────────────────────────────────
define('APP_NAME', 'CMS Admin');
define('APP_VERSION', '1.0.0');

// ─── Session Configuration ─────────────────────────────────
define('SESSION_LIFETIME', 900); // 15 minutes (match JWT TTL)

// ─── Session Setup ──────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string) SESSION_LIFETIME);
    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}
