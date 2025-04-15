async function loadHeader() {
    const headerContainer = document.getElementById('headerContainer');
    if (!headerContainer) {
        // If the container doesn't exist on the page, silently exit.
        // This might happen on pages like login.html that don't have the main layout.
        // console.log('Header container not found on this page.');
        return Promise.resolve(); // Resolve promise immediately
    }
    try {
        // Use static path for fetching header HTML if still loading via JS
        // Consider using Jinja include in a base template instead: {% include 'partials/header.html' %}
        const response = await fetch('/static/assets/components/header/header.html'); // Adjusted path
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        headerContainer.innerHTML = html;
        console.log('Header loaded successfully.');

        // --- Cargar datos de usuario en el Header ---
        // User data is now passed from Flask template, not fetched separately here.
        // We assume the template renders the user info directly or sets global JS vars.
        
        // Example: If template renders spans directly:
        // No JS needed here if spans like <span id="userName">{{ user.username }}</span> exist in header.html
        
        // Example: If template sets global JS vars like window.currentUser = {{ user | tojson }};
        // const userNameSpan = document.getElementById('userName');
        // const userRoleSpan = document.getElementById('userRole');
        // if (window.currentUser && userNameSpan) {
        //     userNameSpan.textContent = window.currentUser.username || 'Usuario';
        // }
        // if (window.currentUser && userRoleSpan) {
        //     userRoleSpan.textContent = window.currentUser.role || 'Rol';
        // }

        // --- Logout Button ---
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.location.href = '/logout'; // Redirect to Flask logout route
            });
        } else {
             console.warn("Logout button not found in loaded header.");
        }
        
        // --- Initialize Search (if applicable) ---
        // If search functionality depends on the header being loaded
        // if (typeof Search === 'function') {
        //     new Search(); 
        // }

        return Promise.resolve(); // Resolve after setup

    } catch (error) {
        console.error('Failed to load header:', error);
        headerContainer.innerHTML = '<p style="color: red;">Error al cargar el encabezado.</p>';
        return Promise.reject(error); // Reject promise on error
    }
}

// Ensure loadHeader is called appropriately, likely after DOMContentLoaded
// Example: document.addEventListener('DOMContentLoaded', loadHeader); 
// This might already be handled if called from loadSidebar.js or similar.
