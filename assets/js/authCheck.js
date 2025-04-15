/**
 * Verificación de autenticación
 * Este script debe incluirse en todas las páginas protegidas
 */
(function() {
    // Ejecutar inmediatamente cuando se carga el script
    const userData = sessionStorage.getItem('userData');
    let user = null;
    let userRole = null;
    
    // Si no hay datos de usuario, redirigir al login
    if (!userData) {
        console.log('Sesión no encontrada. Redirigiendo al login...');
        // Obtener la ruta base de la aplicación
        const appPath = typeof AppConfig !== 'undefined' 
            ? AppConfig.basePath 
            : (window.location.hostname === 'localhost' ? '' : '/STATUSCRM');
            
        // Redirigir a la página de login
        window.location.href = `${appPath}/login.html`;
        return;
    } else {
        // Parsear datos de usuario
        user = JSON.parse(userData);
        userRole = user.cargo || 'invitado';
    }

    // Verificar permisos de acceso a la página actual
    checkPagePermission();    // Función para verificar si el usuario tiene permiso para acceder a la página actual
    async function checkPagePermission() {
        try {
            // Obtener la ruta de la página actual (relative path)
            const currentPath = window.location.pathname;
            
            // Lista de páginas permitidas para todos los usuarios autenticados
            const alwaysAllowedPages = [
                'welcome.html',
                'welcome/welcome.html',
                'components/welcome/welcome.html',
                'assets/components/welcome/welcome.html'
            ];
            
            // Si la página actual está en la lista de permitidas, permitir acceso
            for (const allowedPath of alwaysAllowedPages) {
                if (currentPath.includes(allowedPath)) {
                    console.log(`Página ${currentPath} permitida para todos los usuarios.`);
                    return true;
                }
            }
            
            // Si es administrador, permitir acceso a todo
            if (userRole === 'administrador') {
                return true;
            }

            // Esperar a que menuAccessManager esté disponible
            if (typeof menuAccessManager === 'undefined') {
                await loadMenuAccessManager();
            }

            // Inicializar el gestor de permisos si no está inicializado
            if (!menuAccessManager.rolesConfig) {
                await menuAccessManager.initialize();
            }
            
            // Establecer el rol del usuario
            menuAccessManager.setUserRole(userRole);

            // Verificar si el usuario tiene acceso a esta página
            if (!hasAccessToCurrentPage(currentPath)) {
                console.log(`Usuario ${userRole} no tiene acceso a ${currentPath}. Redirigiendo...`);
                // Redirigir a la página de bienvenida
                const appPath = typeof AppConfig !== 'undefined' 
                    ? AppConfig.getFullPath('/assets/components/welcome/welcome.html')
                    : '/assets/components/welcome/welcome.html';
                window.location.href = appPath;
            }
        } catch (error) {
            console.error("Error al verificar permisos de acceso:", error);
            // En caso de error, permitir el acceso por defecto para evitar bloquear la app
            return true;
        }
    }

    // Cargar el gestor de acceso si no está disponible
    function loadMenuAccessManager() {
        return new Promise((resolve, reject) => {
            // Usar AppConfig para construir la ruta correcta
            const scriptPath = typeof AppConfig !== 'undefined'
                ? AppConfig.getFullPath('/assets/js/permissions/menuAccess.js')
                : '/assets/js/permissions/menuAccess.js';
                
            console.log(`Cargando gestor de acceso desde: ${scriptPath}`);
            
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => {
                console.log('Script de gestión de permisos cargado correctamente');
                resolve();
            };
            script.onerror = (error) => {
                console.error('Error al cargar el script de gestión de permisos:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }    // Verificar si el usuario tiene acceso a la página actual
    function hasAccessToCurrentPage(currentPath) {
        // Si es administrador, tiene acceso a todo (verificación adicional)
        if (userRole === 'administrador') {
            return true;
        }

        // Verificar si menuAccessManager está disponible
        if (typeof menuAccessManager === 'undefined' || !menuAccessManager.rolesConfig) {
            console.warn('Gestor de permisos no disponible, permitiendo acceso por defecto');
            return true;
        }

        // Añadir logs de depuración
        console.log('Verificando acceso a ruta:', currentPath);
        console.log('Usuario:', userRole);

        // Obtener el rol del usuario y buscar en la configuración
        const roleConfig = menuAccessManager.rolesConfig[userRole];
        if (!roleConfig) {
            console.warn(`No se encontró configuración para el rol ${userRole}`);
            return false;
        }

        // Normalizar la ruta actual para comparación
        const normalizedCurrentPath = currentPath.toLowerCase();
        
        // Log de depuración
        console.log('Ruta normalizada:', normalizedCurrentPath);

        // Buscar coincidencias con la ruta en todas las secciones de menú permitidas
        let foundMatch = false;
        
        // Buscar la página en el menú de acceso
        for (const section in roleConfig.menuAccess) {
            const sectionConfig = roleConfig.menuAccess[section];
            
            // Verificar acceso directo a una sección principal
            if (sectionConfig.path) {
                // Normalizar la ruta del menú para comparación
                let menuPath = sectionConfig.path.toLowerCase();
                
                // Si la ruta es relativa (comienza con ..), extraer solo la parte final
                if (menuPath.startsWith('../')) {
                    menuPath = menuPath.split('/').pop();  // Obtener solo el nombre del archivo
                }
                
                console.log(`Comparando con menú ${section}:`, menuPath);
                
                // Verificar si la ruta actual contiene la ruta del menú
                if (normalizedCurrentPath.includes(menuPath) && sectionConfig.access === true) {
                    console.log(`✅ Acceso concedido por coincidencia en sección ${section}`);
                    foundMatch = true;
                    return true;
                }
            }
            
            // Buscar en sub-secciones si existen
            if (sectionConfig.children) {
                for (const subsection in sectionConfig.children) {
                    const subsectionConfig = sectionConfig.children[subsection];
                    
                    // Verificar acceso a sub-sección
                    if (subsectionConfig.path) {
                        // Normalizar la ruta del menú para comparación
                        let menuPath = subsectionConfig.path.toLowerCase();
                        
                        // Si la ruta es relativa (comienza con ..), extraer solo la parte final
                        if (menuPath.startsWith('../')) {
                            menuPath = menuPath.split('/').pop();  // Obtener solo el nombre del archivo
                        }
                        
                        console.log(`Comparando con submenú ${subsection}:`, menuPath);
                        
                        // Verificar si la ruta actual contiene la ruta del menú
                        if (normalizedCurrentPath.includes(menuPath) && subsectionConfig.access === true) {
                            console.log(`✅ Acceso concedido por coincidencia en subsección ${subsection}`);
                            foundMatch = true;
                            return true;
                        }
                    }
                    
                    // Buscar en sub-sub-secciones si existen
                    if (subsectionConfig.children) {
                        for (const item in subsectionConfig.children) {
                            const itemConfig = subsectionConfig.children[item];
                            if (itemConfig.path) {
                                // Normalizar la ruta del menú para comparación
                                let menuPath = itemConfig.path.toLowerCase();
                                
                                // Si la ruta es relativa (comienza con ..), extraer solo la parte final
                                if (menuPath.startsWith('../')) {
                                    menuPath = menuPath.split('/').pop();  // Obtener solo el nombre del archivo
                                }
                                
                                console.log(`Comparando con ítem ${item}:`, menuPath);
                                
                                // Verificar si la ruta actual contiene la ruta del menú
                                if (normalizedCurrentPath.includes(menuPath) && itemConfig.access === true) {
                                    console.log(`✅ Acceso concedido por coincidencia en ítem ${item}`);
                                    foundMatch = true;
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Si llegamos aquí, no se encontró ninguna coincidencia
        console.log('❌ No se encontró ninguna coincidencia de ruta con permisos. Acceso denegado.');
        return false;
    }
})();