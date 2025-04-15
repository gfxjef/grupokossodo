/**
 * Sistema de control de acceso a menús basado en roles
 * Este módulo gestiona la visibilidad de los elementos del menú según el rol del usuario
 */

class MenuAccessManager {
    constructor() {
        this.rolesConfig = null;
        this.currentUserRole = null;
    }

    /**
     * Inicializa el gestor de acceso cargando la configuración de roles
     * @returns {Promise} Promesa que se resuelve cuando la configuración está cargada
     */
    async initialize() {
        try {
            const response = await fetch(AppConfig.getFullPath('/assets/js/permissions/roles.json'));
            if (!response.ok) {
                throw new Error('No se pudo cargar la configuración de roles');
            }
            const data = await response.json();
            this.rolesConfig = data.roles || {};
            console.log('Configuración de roles cargada correctamente');
            return true;
        } catch (error) {
            console.error('Error al cargar la configuración de roles:', error);
            return false;
        }
    }

    /**
     * Establece el rol del usuario actual
     * @param {string} role - El rol del usuario (ej: 'administrador', 'asesor', etc.)
     */
    setUserRole(role) {
        this.currentUserRole = role;
        console.log(`Rol de usuario establecido: ${role}`);
    }

    /**
     * Verifica si el usuario tiene acceso a un elemento de menú específico
     * @param {string} menuPath - Ruta del menú separada por puntos (ej: 'Marketing.Merchandising.Solicitud de Merchandising')
     * @returns {boolean} true si el usuario tiene acceso, false en caso contrario
     */
    hasAccess(menuPath) {
        if (!this.currentUserRole || !this.rolesConfig) {
            console.warn('Rol de usuario o configuración no definidos');
            return false;
        }

        // El administrador siempre tiene acceso completo
        if (this.currentUserRole === 'administrador') {
            return true;
        }

        const roleConfig = this.rolesConfig[this.currentUserRole];
        if (!roleConfig) {
            console.warn(`No se encontró configuración para el rol ${this.currentUserRole}`);
            return false;
        }

        const pathParts = menuPath.split('.');
        let currentConfig = roleConfig.menuAccess;

        // Navegamos a través de la jerarquía de menús
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];

            if (!currentConfig || !currentConfig[part]) {
                return false;
            }

            currentConfig = currentConfig[part];

            // Si en cualquier nivel el acceso es false, devolvemos false
            if (currentConfig.access === false) {
                return false;
            }

            // Si no estamos en el último nivel, avanzamos al siguiente nivel
            if (i < pathParts.length - 1) {
                currentConfig = currentConfig.children;
            }
        }

        return currentConfig.access === true;
    }

    /**
     * Aplica los permisos al menú del sidebar
     * Este método debe llamarse después de que el sidebar se haya cargado
     */
    applyMenuPermissions() {
        if (!this.currentUserRole || !this.rolesConfig) {
            console.warn('Rol de usuario o configuración no definidos');
            return;
        }

        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            console.error('No se encontró el elemento del sidebar');
            return;
        }

        // Función recursiva para procesar cada nivel del menú
        const processMenuLevel = (menuItems, parentPath = '') => {
            menuItems.forEach(item => {
                const navTextElement = item.querySelector(':scope > .nav-item .nav-text');
                if (!navTextElement) return;

                const menuText = navTextElement.textContent.trim();
                const currentPath = parentPath ? `${parentPath}.${menuText}` : menuText;
                
                // Verificar si el usuario tiene acceso a este elemento de menú
                const hasAccess = this.hasAccess(currentPath);
                
                if (!hasAccess) {
                    item.style.display = 'none';
                } else {
                    // Procesar submenús si existen
                    const submenu = item.querySelector(':scope > .submenu');
                    if (submenu) {
                        const submenuItems = submenu.querySelectorAll(':scope > li');
                        processMenuLevel(submenuItems, currentPath);
                        
                        // Ocultar el menú padre si todos sus hijos están ocultos
                        const visibleChildren = Array.from(submenuItems).filter(
                            child => child.style.display !== 'none'
                        );
                        
                        if (visibleChildren.length === 0) {
                            item.style.display = 'none';
                        }
                    }
                }
            });
        };

        // Comenzar el procesamiento desde el nivel superior
        const topLevelItems = sidebar.querySelectorAll('.menu-level-1 > li');
        processMenuLevel(topLevelItems);
        
        console.log('Permisos de menú aplicados correctamente');
    }
}

// Creamos una instancia global para usar en toda la aplicación
const menuAccessManager = new MenuAccessManager();

// Exportamos la instancia
window.menuAccessManager = menuAccessManager;
