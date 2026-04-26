<?php
/**
 * CMS Admin Panel — Auth Guard
 * 
 * Include this file at the top of any protected page.
 * Redirects to login.php if the user is not authenticated.
 */

declare(strict_types=1);

require_once __DIR__ . '/functions.php';

requireAuth();
