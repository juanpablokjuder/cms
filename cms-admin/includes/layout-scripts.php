<?php
/**
 * CMS Admin — Layout Scripts Partial
 * 
 * Sidebar toggle logic. Include at the bottom of every dashboard page.
 */
?>
<script>
document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const layout = document.getElementById('app-layout');
    if (window.innerWidth <= 768) {
        layout.classList.toggle('sidebar-mobile-open');
    } else {
        layout.classList.toggle('sidebar-collapsed');
    }
});
document.getElementById('sidebar-overlay').addEventListener('click', () => {
    document.getElementById('app-layout').classList.remove('sidebar-mobile-open');
});
</script>
