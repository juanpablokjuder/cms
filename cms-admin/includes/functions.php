<?php
/*

CMS Admin Panel — Helper Functions
Provides the core apiRequest() wrapper for calling the REST API,
authentication checks, and utility functions used across the app.*/

declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';

/*

Make an HTTP request to the REST API via cURL.*
@param string      $method   HTTP method (GET, POST, PATCH, DELETE)
@param string      $endpoint API endpoint path (e.g. "/auth/login")
@param array|null  $data     Request body (for POST/PATCH)
@param string|null $token    JWT token override (defaults to session token)
@return array{httpCode: int, body: array}*/
function apiRequest(string $method, string $endpoint, ?array $data = null, ?string $token = null): array
{
    $url = API_BASE_URL . $endpoint;
    $jwt = $token ?? ($_SESSION['token'] ?? null);

    $ch = curl_init();

    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
    ];

    if ($jwt !== null) {
        $headers[] = 'Authorization: Bearer ' . $jwt;
    }

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => strtoupper($method),
    ]);

    if ($data !== null && in_array(strtoupper($method), ['POST', 'PATCH', 'PUT'], true)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    // Append query params for GET requests with data
    if ($data !== null && strtoupper($method) === 'GET') {
        $url .= '?' . http_build_query($data);
        curl_setopt($ch, CURLOPT_URL, $url);
    }

    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return [
            'httpCode' => 0,
            'body' => [
                'success' => false,
                'message' => 'Error de conexión con el servidor: ' . $error,
                'code' => 'CONNECTION_ERROR',
            ],
        ];
    }

    curl_close($ch);

    $body = json_decode($response ?: '{}', true) ?? [];

    return [
        'httpCode' => $httpCode,
        'body' => $body,
    ];
}
/*

Check if the current session has a valid token stored.*/
function isAuthenticated(): bool
{
    return !empty($_SESSION['token']) && !empty($_SESSION['user']);
}

/*

Guard: redirect to login if not authenticated.*/
function requireAuth(): void
{
    if (!isAuthenticated()) {
        header('Location: login.php');
        exit;
    }
}

/*

Get the current authenticated user data from session.*
@return array|null PublicUser object or null*/
function getCurrentUser(): ?array
{
    return $_SESSION['user'] ?? null;
}

/*

Send a JSON response and terminate.*/
function jsonResponse(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
/*

Sanitize a string input for safe output.*/
function sanitizeInput(string $input): string
{
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/*

Destroy the current session completely.*/
function destroySession(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
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