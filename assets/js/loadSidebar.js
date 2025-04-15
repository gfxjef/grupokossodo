document.addEventListener('DOMContentLoaded', async () => { // Hacer la función async
    const sidebarContainer = document.getElementById('sidebarContainer');
    let searchInstance = null;

    try {
        // 1. Esperar a que el header se cargue PRIMERO
        await loadHeader(); // Llama y espera a que la promesa de loadHeader se resuelva

        // 2. Ahora que el header está cargado, inicializar Search
        if (typeof Search !== 'undefined') {
            searchInstance = new Search(); // Ahora #searchInput y #searchResults existen
        } else {
            console.error("Search class not defined.");
        }

        // 3. Cargar el contenido del Sidebar (y su JS si es necesario)
        if (sidebarContainer) {
            if (typeof Sidebar === 'undefined') {
                const script = document.createElement('script');
                script.src = AppConfig.getFullPath('/assets/js/sidebar.js');
                script.onload = () => loadSidebarContent(searchInstance); // Pasar searchInstance
                script.onerror = () => console.error("Failed to load sidebar.js");
                document.head.appendChild(script);
            } else {
                loadSidebarContent(searchInstance); // Pasar searchInstance
            }
        }

    } catch (headerError) {
        console.error("Failed to initialize page due to header loading error:", headerError);
        // Mostrar un error general si el header falla
        if (sidebarContainer) sidebarContainer.innerHTML = '<p>Error initializing page components.</p>';
    }
});

// Función para cargar el contenido del sidebar y luego indexar para búsqueda
function loadSidebarContent(searchInstance) { // Recibe searchInstance
    const sidebarContainer = document.getElementById('sidebarContainer'); // Obtener de nuevo por si acaso
    
    // Primero cargar e inicializar el sistema de permisos si no está ya cargado
    const loadPermissionsSystem = async () => {
        if (typeof menuAccessManager === 'undefined') {
            // Cargar el script de gestión de permisos
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = AppConfig.getFullPath('/assets/js/permissions/menuAccess.js');
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        return Promise.resolve();
    };
    
    // Cargar el sistema de permisos y luego el contenido del sidebar
    loadPermissionsSystem()
        .then(() => fetch(AppConfig.getFullPath('/assets/components/sidebar/sidebar.html')))
        .then(response => {
            if (!response.ok) throw new Error('Failed to load sidebar HTML: ' + response.status);
            return response.text();
        })
        .then(async html => {
            sidebarContainer.innerHTML = html;
            
            // Inicializar el gestor de acceso a menús
            if (window.menuAccessManager) {
                await menuAccessManager.initialize();
                
                // Obtener el rol del usuario de sessionStorage
                const userDataString = sessionStorage.getItem('userData');
                if (userDataString) {
                    try {
                        const userData = JSON.parse(userDataString);
                        const userRole = userData.cargo || null;
                        
                        if (userRole) {
                            menuAccessManager.setUserRole(userRole);
                            // Aplicar permisos al menú según el rol
                            menuAccessManager.applyMenuPermissions();
                        } else {
                            console.warn('El usuario no tiene un rol definido (cargo)');
                        }
                    } catch (e) {
                        console.error('Error al procesar datos de usuario:', e);
                    }
                } else {
                    console.warn('No hay datos de usuario en sessionStorage');
                }
            }

            // Inicializar la funcionalidad del Sidebar (clase Sidebar)
            if (typeof Sidebar !== 'undefined') {
                new Sidebar();
            } else {
                console.error("Sidebar class is not defined even after attempting load.");
            }

            // Pedir a la instancia de Search que cargue los menús
            if (searchInstance && typeof searchInstance.loadMenuItems === 'function') {
                // No necesita setTimeout si estamos seguros que el DOM está listo
                searchInstance.loadMenuItems();
            } else {
                 console.error("Search instance or loadMenuItems method not available.");
            }
        })
        .catch(error => {
            console.error('Error loading sidebar content:', error);
            sidebarContainer.innerHTML = '<p>Error loading sidebar</p>';
        });
}
