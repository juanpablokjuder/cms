<?php
/**
 * CMS Admin — Header Partial
 * 
 * Requires $user, $initials, and $headerTitle to be set before including.
 */
?>
<header class="header">
    <div class="header-left">
        <button class="header-toggle" id="sidebar-toggle" aria-label="Alternar menú lateral">☰</button>
        <h1 class="header-title"><?php echo htmlspecialchars($headerTitle ?? 'CMS Admin'); ?></h1>
    </div>
    <div class="header-right">
        <div class="header-user">
            <div class="header-avatar"><?php echo htmlspecialchars($initials ?? ''); ?></div>
            <div class="header-user-info">
                <span class="header-user-name"><?php echo htmlspecialchars($user['name'] ?? 'Usuario'); ?></span>
                <span class="header-user-role"><?php echo htmlspecialchars($user['role'] ?? ''); ?></span>
            </div>
        </div>
        <a href="logout.php" class="header-logout" title="Cerrar sesión">
            <span>Salir</span>
            <span>→</span>
        </a>
    </div>
</header>
