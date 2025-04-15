document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const overlay = document.getElementById('loginOverlay');
    const loginButton = document.getElementById('loginButton');
    const inputs = document.querySelectorAll('#loginForm input'); // Select inputs within the form

    // Check if user is already logged in (This check is now primarily server-side)
    // We might leave this client-side check as a quick initial redirect, 
    // but the server (@login_required) is the definitive check.
    // Consider removing if server-side check is sufficient.
    // const userData = sessionStorage.getItem('userData'); // Keep using sessionStorage for external auth token? Or handle differently?
    // if (userData) { 
    //    // Maybe check with server if session is valid? Or just let server redirect?
    //    // window.location.href = '/welcome'; // Use Flask route
    // }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show overlay and disable form
        overlay.style.display = 'flex';
        loginButton.disabled = true;
        inputs.forEach(input => input.disabled = true);
        errorMessage.textContent = ''; // Clear previous errors

        // Get form data
        const usuario = document.getElementById('usuario').value.trim();
        const pass = document.getElementById('pass').value.trim();

        // --- !!! IMPORTANT: External Authentication Call !!! ---
        // Replace this section with your ACTUAL call to the external authentication endpoint
        // Example using fetch:
        try {
            // const externalAuthUrl = 'YOUR_EXTERNAL_AUTH_API_ENDPOINT'; // Replace with your actual endpoint
            // const response = await fetch(externalAuthUrl, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ username: usuario, password: pass }) 
            // });

            // --- MOCK RESPONSE (Replace with actual fetch) ---
            console.log("Simulating external auth call...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            const mockSuccess = true; // Simulate success/failure
            const mockUserData = { // Simulate data received on success
                usuario: usuario,
                role: 'administrador', // <<< --- IMPORTANT: Get the actual role from the external API response
                // token: 'some_external_api_token' // If you need to store this
            };
            // --- END MOCK RESPONSE ---

            // if (!response.ok) { // Check actual response status
            //     const errorData = await response.json().catch(() => ({ message: 'Error de autenticación desconocido' }));
            //     throw new Error(errorData.message || `Error ${response.status}`);
            // }
            // const userDataFromApi = await response.json(); // Get actual user data

            if (!mockSuccess) { // Replace with actual check
                 throw new Error("Usuario o contraseña incorrectos (simulado)");
            }
            const userDataFromApi = mockUserData; // Use actual data
            // --- END Replace ---


            // --- Call Flask backend to set the session ---
            const sessionResponse = await fetch('/set-session', { // Call our Flask endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario: userDataFromApi.usuario, 
                    role: userDataFromApi.role // Pass the role obtained from external auth
                    // Pass any other necessary data from userDataFromApi
                })
            });

            if (!sessionResponse.ok) {
                const sessionError = await sessionResponse.json().catch(() => ({ message: 'Error al iniciar sesión en el servidor' }));
                throw new Error(sessionError.message || `Error ${sessionResponse.status} al crear sesión`);
            }

            console.log("Flask session set successfully.");
            // Redirect to the main application page (Flask will handle routing)
            window.location.href = '/'; 

        } catch (error) {
            console.error("Login failed:", error);
            errorMessage.textContent = error.message || 'Error durante el inicio de sesión.';
            // Hide overlay and re-enable form on error
            overlay.style.display = 'none';
            loginButton.disabled = false;
            inputs.forEach(input => input.disabled = false);
        } 
        // --- End External Authentication ---
    });

    // Logout functionality (if a logout button exists outside protected areas)
    // Typically logout is within the protected area header
    // const logoutButton = document.getElementById('someLogoutButton'); 
    // if (logoutButton) {
    //     logoutButton.addEventListener('click', () => {
    //         window.location.href = '/logout'; // Redirect to Flask logout route
    //     });
    // }

    // Forgot password listener (no changes needed unless it interacts with backend)
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Funcionalidad de recuperación de contraseña en desarrollo');
        });
    }
    
    // Remove the inline script block from login.html that handled the overlay initially
    // as this script now handles the overlay logic during the async submit.
});

// Remove the old redirection logic from index.html - Flask handles this now.
// Remove the inline script from login.html that duplicated overlay logic.
