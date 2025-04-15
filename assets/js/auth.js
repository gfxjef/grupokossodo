document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check if user is already logged in
    const userData = sessionStorage.getItem('userData');
    if (userData) {
        window.location.href = 'assets/components/welcome/welcome.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous error messages
        errorMessage.textContent = '';
        
        // Get form data
        const usuario = document.getElementById('usuario').value.trim();
        const pass = document.getElementById('pass').value.trim();

        // Basic validation
        if (!usuario || !pass) {
            errorMessage.textContent = 'Por favor complete todos los campos';
            return;
        }

        try {
            const response = await fetch('https://feedback-califcacion.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, pass })
            });

            const data = await response.json();

            if (data.success) {
                // Store user data in session storage
                sessionStorage.setItem('userData', JSON.stringify(data.user));
                // Redirect to welcome page in components folder
                window.location.href = 'assets/components/welcome/welcome.html';
            } else {
                // Handle error response
                errorMessage.textContent = data.message || 'Error de autenticación';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Error de conexión. Por favor intente más tarde.';
        }
    });
});
