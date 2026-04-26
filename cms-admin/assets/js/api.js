/**
 * CMS Admin — AJAX API Layer
 * 
 * Centralized wrapper for all AJAX calls to the PHP proxy.
 * All requests go through the local PHP proxy (api/), never directly to the Node API.
 * On 401, automatically redirects to login.
 */

'use strict';

const Api = (() => {

    /**
     * Core request method.
     * @param {string} url    - PHP proxy endpoint (relative path)
     * @param {object} options - { method, body, params }
     * @returns {Promise<object>} Parsed JSON response
     */
    async function request(url, options = {}) {
        const { method = 'GET', body = null, params = null } = options;

        let fullUrl = url;
        if (params) {
            const qs = new URLSearchParams(params).toString();
            fullUrl += '?' + qs;
        }

        const fetchOptions = {
            method,
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        };

        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(fullUrl, fetchOptions);
            const data = await response.json();

            // Handle authentication failure
            if (response.status === 401) {
                Toast.error('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => { window.location.href = 'login.php'; }, 1500);
                throw new ApiError('Sesión expirada', 401, data);
            }

            if (!response.ok) {
                throw new ApiError(
                    data.message || 'Error del servidor',
                    response.status,
                    data
                );
            }

            return data;
        } catch (err) {
            if (err instanceof ApiError) throw err;
            throw new ApiError('No se pudo conectar al servidor. Verifique su conexión.', 0, null);
        }
    }

    // ─── Auth ─────────────────────────────────────────
    async function login(email, password) {
        return request('api/proxy-login.php', {
            method: 'POST',
            body: { email, password },
        });
    }

    async function logout() {
        return request('api/proxy-logout.php', { method: 'POST' });
    }

    async function getMe() {
        return request('api/proxy-me.php');
    }

    // ─── Users ────────────────────────────────────────
    async function getUsers(page = 1, limit = 20) {
        return request('api/proxy-users-list.php', {
            params: { page, limit },
        });
    }

    async function getUser(uuid) {
        return request('api/proxy-users-get.php', {
            params: { uuid },
        });
    }

    async function createUser(userData) {
        return request('api/proxy-users-create.php', {
            method: 'POST',
            body: userData,
        });
    }

    async function updateUser(uuid, userData) {
        return request('api/proxy-users-update.php', {
            method: 'POST',
            body: { uuid, ...userData },
        });
    }

    async function deleteUser(uuid) {
        return request('api/proxy-users-delete.php', {
            method: 'POST',
            body: { uuid },
        });
    }

    return { request, login, logout, getMe, getUsers, getUser, createUser, updateUser, deleteUser };
})();

/**
 * Custom error class for API errors.
 */
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}
