document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-encuesta');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.querySelector('.progress-fill');
    const successMessage = document.getElementById('success-message');
    
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    const nombresInput = document.getElementById('nombres');
    const rucInput = document.getElementById('ruc');
    const correoInput = document.getElementById('correo');

    if (!nombresInput || !rucInput || !correoInput) {
        console.error('Uno o más campos del formulario no existen');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Mostrar barra de progreso
        progressContainer.classList.remove('hidden');
        progressFill.style.width = '10%';
        
        // Mostrar mensaje de carga
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }
        
        // Animación inicial rápida (10% a 60%)
        setTimeout(() => {
            progressFill.style.width = '60%';
        }, 300);

        // Obtener usuario del sessionStorage que se inicializa en auth.js global
        const userData = sessionStorage.getItem('userData');
        let nombreAsesor = 'Asesor';
        let colorAsesor = '#000';
        
        if (userData) {
            const user = JSON.parse(userData);
            nombreAsesor = user.nombre || 'Asesor';
        }
    
        const formData = new URLSearchParams();
        formData.append('asesor', nombreAsesor);
        formData.append('color_asesor', colorAsesor);
        
        // Agregar tipo si existe (para usuarios kossomet)
        const tipoSelect = document.getElementById('tipo');
        if (tipoSelect) {
            formData.append('tipo', tipoSelect.value.trim());
        }
        
        formData.append('nombres', nombresInput.value.trim());
        formData.append('ruc', rucInput.value.trim());
        formData.append('correo', correoInput.value.trim());

        try {
            const response = await fetch('https://feedback-califcacion.onrender.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error del servidor: ${response.status}`);
            }
            
            // Completar progreso al 100%
            progressFill.style.width = '100%';
            
            // Mostrar mensaje de éxito y ocultar mensaje de carga
            loadingMessage.style.display = 'none';
            successMessage.classList.remove('hidden');
            successMessage.classList.add('visible');
            
            // Ocultar barra de progreso después de 2 segundos
            setTimeout(() => {
                progressContainer.classList.add('hidden');
                progressFill.style.width = '0';
                successMessage.classList.remove('visible');
                successMessage.classList.add('hidden');
                form.reset();
            }, 2000);
            
        } catch (error) {
            console.error('Detalles del error:', {
                error: error.message,
                request: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                }
            });
            
            // Restablecer estado en caso de error
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
            progressContainer.classList.add('hidden');
            progressFill.style.width = '0';
            alert(`Error al enviar: ${error.message}`);
        }
    });
});