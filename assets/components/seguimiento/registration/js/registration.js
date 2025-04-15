/**
 * Kossodo Group - Tracking System Record Generator
 * This file contains the functionality for generating tracking records
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const trackingForm = document.getElementById('trackingForm');
    const productTypeSelect = document.getElementById('productType');
    const currentStatusIdSelect = document.getElementById('currentStatusId');
    const stepsContainer = document.getElementById('stepsContainer');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    
    // Global state variables
    let flowTemplates = {};
    let currentFlow = [];
    let generatedJson = null;

    // Load the flow templates
    loadFlowTemplates();

    // Event listeners
    productTypeSelect.addEventListener('change', handleProductTypeChange);
    currentStatusIdSelect.addEventListener('change', updateStepsBasedOnCurrentStatus);
    trackingForm.addEventListener('submit', handleFormSubmit);
    copyJsonBtn.addEventListener('click', copyJsonToClipboard);
    downloadJsonBtn.addEventListener('click', downloadJson);

    // Load flow templates from JSON file
    async function loadFlowTemplates() {
        try {
            const response = await fetch('data/flow-templates.json');
            flowTemplates = await response.json();
            console.log('Flow templates loaded:', flowTemplates);
        } catch (error) {
            console.error('Error loading flow templates:', error);
        }
    }

    // Handle product type selection change
    function handleProductTypeChange() {
        const selectedType = productTypeSelect.value;
        
        if (!selectedType) {
            stepsContainer.innerHTML = '<p class="empty-state">Seleccione un tipo de producto para ver los estados disponibles</p>';
            currentStatusIdSelect.innerHTML = '<option value="">Seleccione primero el tipo de producto</option>';
            return;
        }
        
        // Get the flow for the selected product type
        currentFlow = flowTemplates[selectedType].flujoEstados;
        
        // Update the current status dropdown
        populateCurrentStatusDropdown();
        
        // Update the steps container with the flow steps
        updateStepsContainer();
    }
    
    // Populate current status dropdown based on selected product type
    function populateCurrentStatusDropdown() {
        currentStatusIdSelect.innerHTML = '';
        
        currentFlow.forEach(step => {
            const option = document.createElement('option');
            option.value = step.orden;
            option.textContent = `${step.orden}. ${step.etapa}`;
            currentStatusIdSelect.appendChild(option);
        });
    }
    
    // Update steps container based on selected product type
    function updateStepsContainer() {
        stepsContainer.innerHTML = '';
        
        currentFlow.forEach((step, index) => {
            const stepElement = createStepElement(step, index);
            stepsContainer.appendChild(stepElement);
        });
    }
    
    // Create step form element
    function createStepElement(step, index) {
        const stepId = `step-${step.orden}`;
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('step');
        stepDiv.id = stepId;
        
        const stepHeaderDiv = document.createElement('div');
        stepHeaderDiv.classList.add('step-header');
        
        // Step title with icon
        const stepTitle = document.createElement('div');
        stepTitle.classList.add('step-icon');
        stepTitle.innerHTML = `
            <i class="fas ${step.icon}"></i>
            <h3>Paso ${step.orden}: ${step.etapa}</h3>
        `;
        stepHeaderDiv.appendChild(stepTitle);
        
        // Status badge
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('step-status');
        statusDiv.innerHTML = `
            <select id="stepStatus-${step.orden}" required>
                <option value="completed">Completado</option>
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
            </select>
        `;
        stepHeaderDiv.appendChild(statusDiv);
        
        stepDiv.appendChild(stepHeaderDiv);
        
        // Form fields
        const formFields = document.createElement('div');
        formFields.classList.add('step-fields');
        
        // Date field
        const dateGroup = document.createElement('div');
        dateGroup.classList.add('form-group');
        dateGroup.innerHTML = `
            <label for="stepDate-${step.orden}">Fecha</label>
            <input type="datetime-local" id="stepDate-${step.orden}">
        `;
        formFields.appendChild(dateGroup);
        
        // Agency field
        const agencyGroup = document.createElement('div');
        agencyGroup.classList.add('form-group');
        agencyGroup.innerHTML = `
            <label for="stepAgency-${step.orden}">Agencia</label>
            <input type="text" id="stepAgency-${step.orden}" placeholder="G4-LIMA">
        `;
        formFields.appendChild(agencyGroup);
        
        // Details field
        const detailsGroup = document.createElement('div');
        detailsGroup.classList.add('form-group');
        detailsGroup.innerHTML = `
            <label for="stepDetails-${step.orden}">Detalles</label>
            <textarea id="stepDetails-${step.orden}" rows="3" placeholder="Detalles adicionales del estado..."></textarea>
        `;
        formFields.appendChild(detailsGroup);
        
        stepDiv.appendChild(formFields);
        return stepDiv;
    }
    
    // Update steps based on current status selection
    function updateStepsBasedOnCurrentStatus() {
        const currentStatusId = parseInt(currentStatusIdSelect.value);
        
        if (!currentStatusId) return;
        
        // Update status selectors based on currentStatusId
        document.querySelectorAll('.step').forEach(stepElem => {
            const stepId = parseInt(stepElem.id.split('-')[1]);
            const statusSelect = document.getElementById(`stepStatus-${stepId}`);
            const dateInput = document.getElementById(`stepDate-${stepId}`);
            
            if (stepId < currentStatusId) {
                statusSelect.value = 'completed';
                if (!dateInput.value) {
                    const date = new Date();
                    date.setHours(date.getHours() - (currentStatusId - stepId) * 4);
                    dateInput.value = formatDateForInput(date);
                }
            } else if (stepId === currentStatusId) {
                statusSelect.value = 'active';
                if (!dateInput.value) {
                    dateInput.value = formatDateForInput(new Date());
                }
            } else {
                statusSelect.value = 'pending';
                dateInput.value = '';
            }
        });
    }
    
    // Format date for datetime-local input
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const trackingData = buildTrackingData();
        generatedJson = trackingData;
        
        // Display generated JSON
        jsonOutput.textContent = JSON.stringify(trackingData, null, 2);
        
        // Scroll to output
        jsonOutput.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Build the tracking data object from form inputs
    function buildTrackingData() {
        const currentStatusId = parseInt(currentStatusIdSelect.value);
        const steps = [];
        
        currentFlow.forEach(step => {
            const stepId = step.orden;
            const statusSelect = document.getElementById(`stepStatus-${stepId}`);
            const dateInput = document.getElementById(`stepDate-${stepId}`);
            const detailsInput = document.getElementById(`stepDetails-${stepId}`);
            const agencyInput = document.getElementById(`stepAgency-${stepId}`);
            
            if (statusSelect.value !== 'pending' || stepId === currentStatusId) {
                steps.push({
                    id: stepId,
                    icon: step.icon,
                    label: step.etapa,
                    status: statusSelect.value,
                    date: dateInput.value ? formatDateForOutput(dateInput.value) : '',
                    agency: agencyInput.value || 'G4-LIMA',
                    details: detailsInput.value || ''
                });
            }
        });
        
        // Current status from the selected step
        const currentStep = steps.find(step => step.id === currentStatusId) || {};
        
        // Build the complete tracking data object
        return {
            trackingNumber: document.getElementById('trackingNumber').value,
            customer: document.getElementById('customer').value,
            ruc: document.getElementById('ruc').value,
            address: document.getElementById('address').value,
            deliveryType: document.getElementById('deliveryType').value,
            estimatedDeliveryDate: document.getElementById('estimatedDeliveryDate').value,
            currentStatus: currentStep.label || '',
            currentStatusId: currentStatusId,
            registrationDate: steps[0]?.date || formatDateForOutput(new Date()),
            lastUpdateDate: currentStep.date || formatDateForOutput(new Date()),
            hasPhotos: false,
            hasDocuments: true,
            steps: steps
        };
    }
    
    // Format date for output
    function formatDateForOutput(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    // Copy generated JSON to clipboard
    function copyJsonToClipboard() {
        if (!generatedJson) return;
        
        const jsonStr = JSON.stringify(generatedJson, null, 2);
        navigator.clipboard.writeText(jsonStr)
            .then(() => {
                alert('JSON copiado al portapapeles');
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles:', err);
            });
    }
    
    // Download generated JSON as file
    function downloadJson() {
        if (!generatedJson) return;
        
        const jsonStr = JSON.stringify(generatedJson, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const trackingNumber = generatedJson.trackingNumber;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tracking-${trackingNumber}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
});