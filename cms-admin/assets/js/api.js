/**
 * CMS Admin — AJAX API Layer
 *
 * Centralized wrapper for all AJAX calls to the PHP proxy.
 * All requests go through the local PHP proxy (api/), never directly to the Node API.
 * On 401, automatically redirects to login.
 */
'use strict';

const Api = (() => {

    async function request(url, options = {}) {
        const { method = 'GET', body = null, params = null } = options;

        let fullUrl = url;
        if (params) fullUrl += '?' + new URLSearchParams(params).toString();

        const fetchOptions = {
            method,
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        };
        if (body && method !== 'GET') fetchOptions.body = JSON.stringify(body);

        try {
            const response = await fetch(fullUrl, fetchOptions);
            const data     = await response.json();

            if (response.status === 401) {
                Toast.error('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => { window.location.href = 'login.php'; }, 1500);
                throw new ApiError('Sesión expirada', 401, data);
            }
            if (!response.ok) throw new ApiError(data.message || 'Error del servidor', response.status, data);
            return data;
        } catch (err) {
            if (err instanceof ApiError) throw err;
            throw new ApiError('No se pudo conectar al servidor. Verifique su conexión.', 0, null);
        }
    }

    // ─── Auth ──────────────────────────────────────────────────────────────
    const login  = (email, password) => request('api/proxy-login.php', { method: 'POST', body: { email, password } });
    const logout = ()                => request('api/proxy-logout.php', { method: 'POST' });
    const getMe  = ()                => request('api/proxy-me.php');

    // ─── Users ─────────────────────────────────────────────────────────────
    const getUsers   = (page = 1, limit = 20) => request('api/proxy-users-list.php', { params: { page, limit } });
    const getUser    = (uuid)                  => request('api/proxy-users-get.php', { params: { uuid } });
    const createUser = (data)                  => request('api/proxy-users-create.php', { method: 'POST', body: data });
    const updateUser = (uuid, data)            => request('api/proxy-users-update.php', { method: 'POST', body: { uuid, ...data } });
    const deleteUser = (uuid)                  => request('api/proxy-users-delete.php', { method: 'POST', body: { uuid } });

    // ─── Banners ────────────────────────────────────────────────────────────
    const getBanners   = (page = 1, limit = 20) => request('api/proxy-banners-list.php', { params: { page, limit } });
    const getBanner    = (uuid)                  => request('api/proxy-banners-get.php', { params: { uuid } });
    const createBanner = (data)                  => request('api/proxy-banners-create.php', { method: 'POST', body: data });
    const updateBanner = (uuid, data)            => request('api/proxy-banners-update.php', { method: 'POST', body: { uuid, ...data } });
    const deleteBanner = (uuid)                  => request('api/proxy-banners-delete.php', { method: 'POST', body: { uuid } });

    // ─── Noticias ───────────────────────────────────────────────────────────
    const getNoticias   = (page = 1, limit = 20) => request('api/proxy-noticias-list.php', { params: { page, limit } });
    const getNoticia    = (uuid)                  => request('api/proxy-noticias-get.php', { params: { uuid } });
    const createNoticia = (data)                  => request('api/proxy-noticias-create.php', { method: 'POST', body: data });
    const updateNoticia = (uuid, data)            => request('api/proxy-noticias-update.php', { method: 'POST', body: { uuid, ...data } });
    const deleteNoticia = (uuid)                  => request('api/proxy-noticias-delete.php', { method: 'POST', body: { uuid } });

    return {
        request,
        login, logout, getMe,
        getUsers, getUser, createUser, updateUser, deleteUser,
        getBanners, getBanner, createBanner, updateBanner, deleteBanner,
        getNoticias, getNoticia, createNoticia, updateNoticia, deleteNoticia,
    };
})();

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name   = 'ApiError';
        this.status = status;
        this.data   = data;
    }
}
