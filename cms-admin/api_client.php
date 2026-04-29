<?php

declare(strict_types=1);

if (!defined('CMS_LOADED')) { http_response_code(403); exit; }

// ============================================================
// ApiClient — Wrapper cURL para la REST API
//
// Métodos públicos:
//   ApiClient::request(method, endpoint, body, token): ApiResult
//
// ApiResult es un array con la forma:
//   [
//     'success'    => bool,
//     'data'       => mixed,
//     'message'    => string,
//     'statusCode' => int,
//     'code'       => string,   // error code de la API
//     'errors'     => array,    // field errors en 422
//   ]
// ============================================================

final class ApiClient
{
    /**
     * Realiza una petición HTTP a la REST API vía cURL.
     *
     * @param string      $method   GET | POST | PATCH | DELETE
     * @param string      $endpoint Path relativo, ej: '/users'
     * @param array       $body     Datos a enviar como JSON (ignorado en GET)
     * @param string|null $token    JWT Bearer (null para endpoints públicos)
     * @return array<string, mixed> ApiResult
     */
    public static function request(
        string  $method,
        string  $endpoint,
        array   $body   = [],
        ?string $token  = null
    ): array {
        $url = API_BASE_URL . $endpoint;

        // ── Construir headers ───────────────────────────────
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
        ];

        if ($token !== null && $token !== '') {
            $headers[] = "Authorization: Bearer {$token}";
        }

        // ── Configurar cURL ─────────────────────────────────
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => API_TIMEOUT,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_SSL_VERIFYPEER => IS_PRODUCTION,
            CURLOPT_SSL_VERIFYHOST => IS_PRODUCTION ? 2 : 0,
        ]);

        // ── Método HTTP ─────────────────────────────────────
        $upperMethod = strtoupper($method);

        match ($upperMethod) {
            'POST'   => self::configurePost($ch, $body),
            'PATCH'  => self::configurePatch($ch, $body),
            'DELETE' => curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE'),
            default  => null, // GET usa los defaults de cURL
        };

        // ── Ejecutar ────────────────────────────────────────
        $rawResponse = curl_exec($ch);
        $statusCode  = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError   = curl_error($ch);
        curl_close($ch);

        // ── Error de red / conexión ─────────────────────────
        if ($rawResponse === false || $curlError !== '') {
            return self::buildResult(
                success:    false,
                statusCode: 0,
                message:    'No se pudo conectar con el servidor. Verificá que la API esté en línea.',
                code:       'CONNECTION_ERROR'
            );
        }

        // ── Decodificar respuesta JSON ──────────────────────
        $response = json_decode((string) $rawResponse, associative: true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return self::buildResult(
                success:    false,
                statusCode: $statusCode,
                message:    'Respuesta inválida del servidor.',
                code:       'INVALID_RESPONSE'
            );
        }

        return self::buildResult(
            success:    (bool)  ($response['success']  ?? false),
            statusCode: $statusCode,
            message:    (string)($response['message']  ?? ''),
            data:       $response['data']  ?? null,
            code:       (string)($response['code']     ?? ''),
            errors:     (array) ($response['errors']   ?? [])
        );
    }

    // ── Helpers privados ────────────────────────────────────

    private static function configurePost(\CurlHandle $ch, array $body): void
    {
        curl_setopt($ch, CURLOPT_POST, true);
        if (!empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
    }

    private static function configurePatch(\CurlHandle $ch, array $body): void
    {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        if (!empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
    }

    /**
     * @param array<string, mixed> $errors
     * @return array<string, mixed>
     */
    private static function buildResult(
        bool   $success,
        int    $statusCode,
        string $message    = '',
        mixed  $data       = null,
        string $code       = '',
        array  $errors     = []
    ): array {
        return compact('success', 'statusCode', 'message', 'data', 'code', 'errors');
    }
}
