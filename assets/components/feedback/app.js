document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-encuesta');
  const nombresInput = document.getElementById('nombres');
  const rucInput = document.getElementById('ruc');
  const correoInput = document.getElementById('correo');
  const crearEncuestaBtn = document.getElementById('crear-encuesta');
  let inputsTouched = {
    nombres: false,
    ruc: false,
    correo: false
  };

  // Validación de RUC
  function validarRUC() {
    const ruc = rucInput.value.trim();
    const rucLength = ruc.length;
    
    // Solo validar si el campo ha sido tocado
    if (!inputsTouched.ruc) return false;
    
    // Limpiar clases anteriores
    rucInput.classList.remove('borde-invalido');
    
    if (rucLength === 0) {
      rucInput.classList.add('borde-invalido');
      mostrarError(rucInput, 'El RUC es requerido');
      return false;
    } else if (rucLength === 11 && /^\d+$/.test(ruc)) {
      return true;
    } else {
      rucInput.classList.add('borde-invalido');
      mostrarError(rucInput, rucLength < 11 ? 'El RUC debe tener 11 dígitos' : 'RUC inválido');
      return false;
    }
  }

  // Validación de correo
  function validarCorreo() {
    if (!inputsTouched.correo) return false;
    
    const correo = correoInput.value.trim();
    const esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    
    correoInput.classList.remove('borde-invalido');
    if (correo === '') {
      correoInput.classList.add('borde-invalido');
      mostrarError(correoInput, 'El correo es requerido');
      return false;
    } else if (!esValido) {
      correoInput.classList.add('borde-invalido');
      mostrarError(correoInput, 'Correo inválido');
      return false;
    }
    return true;
  }

  // Validación de nombres
  function validarNombres() {
    if (!inputsTouched.nombres) return false;
    
    const nombres = nombresInput.value.trim();
    nombresInput.classList.remove('borde-invalido');
    if (nombres === '') {
      nombresInput.classList.add('borde-invalido');
      mostrarError(nombresInput, 'El nombre es requerido');
      return false;
    }
    return true;
  }

  // Validación en tiempo real
  function validarFormulario() {
    const nombresValido = validarNombres();
    const rucValido = validarRUC();
    const correoValido = validarCorreo();

    // Habilitar botón solo si todos los campos están tocados y son válidos
    const todosLosCamposTocados = Object.values(inputsTouched).every(touched => touched);
    crearEncuestaBtn.disabled = !todosLosCamposTocados || !(nombresValido && rucValido && correoValido);
  }

  // Mostrar mensajes de error
  function mostrarError(input, mensaje) {
    const errorDiv = document.getElementById(`${input.id}-error`);
    if (errorDiv) {
      errorDiv.textContent = mensaje;
    }
  }

  // Limpiar errores
  function limpiarErrores() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  }

  // Event listeners para validación en tiempo real
  nombresInput.addEventListener('blur', () => {
    inputsTouched.nombres = true;
    validarFormulario();
  });

  rucInput.addEventListener('blur', () => {
    inputsTouched.ruc = true;
    validarFormulario();
  });

  correoInput.addEventListener('blur', () => {
    inputsTouched.correo = true;
    validarFormulario();
  });

  // Event listeners para limpiar errores cuando el usuario empieza a escribir
  nombresInput.addEventListener('input', () => {
    if (inputsTouched.nombres) validarFormulario();
  });

  rucInput.addEventListener('input', () => {
    if (inputsTouched.ruc) validarFormulario();
  });

  correoInput.addEventListener('input', () => {
    if (inputsTouched.correo) validarFormulario();
  });

  // Desactivar el botón inicialmente
  crearEncuestaBtn.disabled = true;
});