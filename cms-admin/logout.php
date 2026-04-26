<?php
/**
 * CMS Admin — Logout
 * Calls the API logout endpoint, destroys session, redirects to login.
 */

declare(strict_types=1);

require_once __DIR__ . '/includes/functions.php';

// Attempt API logout if we have a token
if (!empty($_SESSION['token'])) {
    apiRequest('POST', '/auth/logout');
}

destroySession();
header('Location: login.php');
exit;
