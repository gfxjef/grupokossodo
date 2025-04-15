/**
 * Validation functions for the tracking registration form
 */

// Validate the entire form
function validateForm() {
    let isValid = true;
    
    // Validate basic info fields
    isValid = validateRequiredField('trackingNumber', 'Número de seguimiento es requerido') && isValid;
    isValid = validateRequiredField('customer', 'Nombre del cliente es requerido') && isValid;
    isValid = validateRuc('ruc') && isValid;
    isValid = validateRequiredField('address', 'Dirección es requerida') && isValid;
    isValid = validateRequiredField('deliveryType', 'Tipo de entrega es requerido') && isValid;
    isValid = validateDate('estimatedDeliveryDate') && isValid;
    
    // Validate product type and current status
    isValid = validateRequiredField('productType', 'Tipo de producto es requerido') && isValid;
    isValid = validateRequiredField('currentStatusId', 'Estado actual es requerido') && isValid;
    
    // Validate all active steps
    const currentStatusId = parseInt(document.getElementById('currentStatusId').value);
    let stepFields = document.querySelectorAll('.step');
    
    stepFields.forEach((stepElem) => {
        const stepId = parseInt(stepElem.id.split('-')[1]);
        const statusSelect = document.getElementById(`stepStatus-${stepId}`);
        
        // Only validate steps that are not pending (except for the current step)
        if (statusSelect.value !== 'pending' || stepId === currentStatusId) {
            isValid = validateStepFields(stepId) && isValid;
        }
    });
    
    return isValid;
}

// Validate required field
function validateRequiredField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    
    if (!value) {
        showError(field, errorMessage || 'Este campo es requerido');
        return false;
    }
    
    clearError(field);
    return true;
}

// Validate RUC (Peruvian tax ID)
function validateRuc(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    
    if (!value) {
        showError(field, 'RUC es requerido');
        return false;
    }
    
    // RUC should be 11 digits
    const rucRegex = /^\d{11}$/;
    if (!rucRegex.test(value)) {
        showError(field, 'RUC debe tener 11 dígitos numéricos');
        return false;
    }
    
    clearError(field);
    return true;
}

// Validate date fields
function validateDate(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value;
    
    if (!value) {
        showError(field, 'Fecha es requerida');
        return false;
    }
    
    const selectedDate = new Date(value);
    
    // Check if it's a valid date
    if (isNaN(selectedDate.getTime())) {
        showError(field, 'Fecha inválida');
        return false;
    }
    
    clearError(field);
    return true;
}

// Validate datetime fields
function validateDateTime(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value;
    
    if (!value) {
        showError(field, 'Fecha y hora son requeridas');
        return false;
    }
    
    const selectedDateTime = new Date(value);
    
    // Check if it's a valid date
    if (isNaN(selectedDateTime.getTime())) {
        showError(field, 'Fecha y hora inválidas');
        return false;
    }
    
    clearError(field);
    return true;
}

// Validate step fields
function validateStepFields(stepId) {
    let isValid = true;
    const statusSelect = document.getElementById(`stepStatus-${stepId}`);
    
    // If the step is active or completed, date is required
    if (statusSelect.value === 'active' || statusSelect.value === 'completed') {
        isValid = validateDateTime(`stepDate-${stepId}`) && isValid;
        
        // If the step is active or completed, agency is also required
        const agencyField = document.getElementById(`stepAgency-${stepId}`);
        if (agencyField && !agencyField.value.trim()) {
            showError(agencyField, 'Agencia es requerida para este paso');
            isValid = false;
        } else if (agencyField) {
            clearError(agencyField);
        }
    }
    
    return isValid;
}

// Show error message
function showError(field, message) {
    // Clear previous error
    clearError(field);
    
    // Add error class to input
    field.classList.add('error');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

// Clear error message
function clearError(field) {
    // Remove error class from field
    field.classList.remove('error');
    
    // Remove any existing error messages
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Generate a random tracking number
function generateTrackingNumber() {
    const prefix = ['SKD', 'EXP', 'WYB', 'ORD', 'SHP'];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomNumbers = Math.floor(Math.random() * 900000000) + 100000000;
    
    return `${randomPrefix}${randomNumbers}`;
}

// Auto-fill form with test data
function fillWithTestData() {
    document.getElementById('trackingNumber').value = generateTrackingNumber();
    document.getElementById('customer').value = 'Cliente de Prueba';
    document.getElementById('ruc').value = '20123456789';
    document.getElementById('address').value = 'Av. Test 123, Lima, Perú';
    document.getElementById('deliveryType').value = 'ENTREGA FAMILIAR DIRECTO';
    
    // Set estimated delivery date to 7 days from now
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 7);
    document.getElementById('estimatedDeliveryDate').value = estimatedDate.toISOString().split('T')[0];
    
    // Set product type and trigger its change event to populate steps
    const productTypeSelect = document.getElementById('productType');
    if (productTypeSelect) {
        productTypeSelect.value = 'consumibleEnStock';
        productTypeSelect.dispatchEvent(new Event('change'));
        
        // Set current status after steps are populated
        setTimeout(() => {
            const currentStatusSelect = document.getElementById('currentStatusId');
            if (currentStatusSelect) {
                currentStatusSelect.value = '2'; // Set to second step
                currentStatusSelect.dispatchEvent(new Event('change'));
            }
        }, 100);
    }
}