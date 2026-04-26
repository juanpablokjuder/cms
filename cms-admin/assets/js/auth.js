/**
 * CMS Admin — Auth Handler (Login Page)
 * 
 * Handles login form submission via AJAX, with client-side validation
 * and visual feedback (loading spinner, error messages).
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit');
    const alert = document.getElementById('login-alert');
    const alertMessage = document.getElementById('login-alert-message');
    const passwordToggle = document.getElementById('password-toggle');

    if (!form) return;

    // ─── Password visibility toggle ──────────────────
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            passwordToggle.textContent = isPassword ? '◡' : '⊙';
            passwordToggle.setAttribute('aria-label',
                isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            );
        });
    }

    // ─── Form submission ─────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        clearErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Client-side validation
        let hasError = false;

        if (!email) {
            showFieldError('login-email', 'Ingrese su correo electrónico.');
            hasError = true;
        } else if (!isValidEmail(email)) {
            showFieldError('login-email', 'Formato de correo electrónico inválido.');
            hasError = true;
        }

        if (!password) {
            showFieldError('login-password', 'Ingrese su contraseña.');
            hasError = true;
        }

        if (hasError) return;

        // Submit
        setLoading(true);

        try {
            const result = await Api.login(email, password);

            if (result.success) {
                // Redirect to dashboard
                window.location.href = 'index.php';
            } else {
                showAlert(result.message || 'Error de autenticación.');
            }
        } catch (err) {
            if (err instanceof ApiError && err.data) {
                showAlert(err.data.message || err.message);
            } else {
                showAlert(err.message || 'Error de conexión con el servidor.');
            }
        } finally {
            setLoading(false);
        }
    });

    // ─── Helpers ─────────────────────────────────────
    function setLoading(loading) {
        submitBtn.disabled = loading;
        submitBtn.classList.toggle('loading', loading);
    }

    function showAlert(message) {
        alertMessage.textContent = message;
        alert.classList.add('visible');
    }

    function hideAlert() {
        alert.classList.remove('visible');
    }

    function showFieldError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(inputId + '-error');
        if (input) input.classList.add('error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearErrors() {
        form.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ─── Clear errors on input ───────────────────────
    [emailInput, passwordInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorEl = document.getElementById(input.id + '-error');
            if (errorEl) errorEl.textContent = '';
            hideAlert();
        });
    });
});
