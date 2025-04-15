/**
 * Verificación de autenticación y permisos (CLIENT-SIDE)
 * Este script se enfoca ahora en la lógica del lado del cliente (ej: ocultar elementos UI)
 * La protección de PÁGINAS es manejada por el decorador @login_required en Flask (app.py)
 */
(function() {
    // No redirigir desde aquí. Flask maneja la redirección si no hay sesión.
    // const userData = sessionStorage.getItem('userData'); // Still needed if external token is stored?
    // let user = null;
    // let userRole = null;
    
    // if (!userData) {
    //     // console.log('Sesión no encontrada (cliente). Dejando que el servidor redirija...');
    //     // NO REDIRECT: window.location.href = '../../login.html'; // REMOVED
    // } else {
    //     try {
    //         user = JSON.parse(userData);
    //         userRole = user.cargo || user.role; // Adjust based on actual user object structure
    //         console.log(`Cliente: Usuario ${user.usuario}, Rol: ${userRole}`);
    //     } catch (e) {
    //         console.error('Error parsing user data from sessionStorage', e);
    //         // NO REDIRECT: sessionStorage.removeItem('userData'); 
    //         // NO REDIRECT: window.location.href = '../../login.html'; // REMOVED
    //     }
    // }

    // --- Client-Side Permission Checks (e.g., for hiding UI elements) ---
    // This part might still be useful if you want to hide menu items dynamically
    // *after* the page has loaded, based on the user's role provided by the server.
    
    // You'll need the user's role. Get it from the server, e.g., via a global variable 
    // set in the template: <script>window.currentUserRole = "{{ user.role }}";</script>
    const currentUserRole = window.currentUserRole || null; // Assumes server sets this global variable

    // Load permissions config if needed for client-side checks
    let rolesConfig = null; 
    async function loadRolesConfig() {
        if (rolesConfig) return rolesConfig;
        try {
            // Adjust path for static serving
            const response = await fetch('/static/assets/js/permissions/roles.json'); 
            if (!response.ok) throw new Error('Failed to load roles config');
            rolesConfig = (await response.json()).roles;
            return rolesConfig;
        } catch (error) {
            console.error("Error loading roles config:", error);
            return null;
        }
    }

    // Example: Function to check client-side permission for a specific feature/element
    async function checkClientPermission(permissionKey) {
        if (!currentUserRole) return false; // No role, no permission
        
        const config = await loadRolesConfig();
        if (!config || !config[currentUserRole] || !config[currentUserRole].menuAccess) {
            return false; // Role or config missing
        }
        
        // Adapt this logic based on how permissions are defined in roles.json
        // This is just a placeholder check
        const permissions = config[currentUserRole].menuAccess;
        return permissions.hasOwnProperty(permissionKey); // Example check
    }

    // Example Usage (call this where needed in your UI logic):
    // async function setupUIBasedOnPermissions() {
    //     if (await checkClientPermission('Marketing')) {
    //         // Show Marketing menu
    //     } else {
    //         // Hide Marketing menu
    //     }
    // }
    // document.addEventListener('DOMContentLoaded', setupUIBasedOnPermissions);

    // --- REMOVED PAGE PERMISSION CHECK ---
    // The core page access check is now done server-side in Flask (@login_required)
    // checkPagePermission(); // REMOVED CALL
    // async function checkPagePermission() { ... } // REMOVED FUNCTION
    // function loadMenuAccessManager() { ... } // REMOVED FUNCTION (or adapt if menuAccessManager is still used client-side)
    // function hasAccessToCurrentPage(currentPath) { ... } // REMOVED FUNCTION

})();
