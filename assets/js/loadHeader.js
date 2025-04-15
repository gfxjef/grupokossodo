async function loadHeader() {
    const headerContainer = document.getElementById('headerContainer');
    if (!headerContainer) {
        console.error('Header container not found');
        return Promise.reject('Header container not found');
    }
    try {
        const response = await fetch(AppConfig.getFullPath('/assets/components/header/header.html'));
        if (!response.ok) {
            throw new Error('Failed to load header HTML: ' + response.status);
        }
        const html = await response.text();
        headerContainer.innerHTML = html;
        console.log('Header loaded successfully.');

        // --- Cargar datos de usuario en el Header ---
        const userNameSpan = document.getElementById('userName');
        const userRoleSpan = document.getElementById('userRole'); // Obtener el nuevo span
        const logoutBtn = document.getElementById('logoutBtn');
        const userData = JSON.parse(sessionStorage.getItem('userData'));

        if (userData) {
            console.log('Datos de usuario:', userData); // Ver estructura completa
            if (userNameSpan) {
                userNameSpan.textContent = userData.nombre || 'Usuario';
            }
            if (userRoleSpan) {
                // Modificar esta línea para usar la propiedad cargo
                userRoleSpan.textContent = userData.cargo || 'Rol Desconocido';
            }
        } else {
             // Opcional: Manejar caso donde no hay datos de usuario
             if (userNameSpan) userNameSpan.textContent = 'Invitado';
             if (userRoleSpan) userRoleSpan.textContent = '';
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('userData');
                // Redirigir usando AppConfig si está disponible
                window.location.href = typeof AppConfig !== 'undefined'
                    ? AppConfig.getFullPath('/index.html')
                    : '/index.html'; // Fallback
            });
        }
        // --- Fin Cargar datos de usuario ---

        return Promise.resolve();
    } catch (error) {
        console.error('Error loading header:', error);
        headerContainer.innerHTML = '<p>Error loading header</p>';
        return Promise.reject(error);
    }
}
