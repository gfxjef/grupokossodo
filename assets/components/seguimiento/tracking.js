/**
 * KOSSODO GROUP - TRACKING FUNCTIONALITY
 * This file contains all the JavaScript functionality for the tracking component
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cargar los datos de seguimiento desde el archivo JSON
    let trackingData = {};
    let shipmentsData = [];
    
    // Elements
    const trackingSummary = document.getElementById('trackingSummary');
    const toggleDetailsBtn = document.getElementById('toggleDetailsBtn');
    const trackingDetails = document.getElementById('trackingDetails');
    const toggleIcon = document.getElementById('toggleIcon');
    const miniTimeline = document.getElementById('miniTimeline');
    const timelineContainer = document.getElementById('timelineContainer');
    const viewPhotosBtn = document.getElementById('viewPhotosBtn');
    const viewDocsBtn = document.getElementById('viewDocsBtn');
    const photoModal = document.getElementById('photoModal');
    const docsModal = document.getElementById('docsModal');
    const closePhotoModalBtn = document.getElementById('closePhotoModal');
    const closeDocsModalBtn = document.getElementById('closeDocsModal');
    const searchTrackingBtn = document.getElementById('searchTrackingBtn');
    const trackingNumberInput = document.getElementById('trackingNumber');
    
    // Cargar los datos de seguimiento y mostrar información inicial
    loadTrackingData().then(() => {
        // Inicializar con el primer envío disponible en los datos
        const defaultTracking = trackingNumberInput.value;
        if (defaultTracking) {
            setTrackingData(defaultTracking);
        }
    });
    
    // Event Listeners
    toggleDetailsBtn.addEventListener('click', toggleDetails);
    trackingSummary.addEventListener('click', function(e) {
        if (e.target !== toggleDetailsBtn && !toggleDetailsBtn.contains(e.target)) {
            toggleDetails();
        }
    });
    viewPhotosBtn.addEventListener('click', showPhotoModal);
    viewDocsBtn.addEventListener('click', showDocsModal);
    closePhotoModalBtn.addEventListener('click', hidePhotoModal);
    closeDocsModalBtn.addEventListener('click', hideDocsModal);
    searchTrackingBtn.addEventListener('click', searchTracking);
    
    // Eventos del teclado para accesibilidad
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (photoModal.style.display === 'block') {
                hidePhotoModal();
            }
            if (docsModal.style.display === 'block') {
                hideDocsModal();
            }
        }
    });

    // Carga los datos de seguimiento desde el archivo JSON
    async function loadTrackingData() {
        try {
            const response = await fetch('tracking-data.json');
            const data = await response.json();
            shipmentsData = data.shipments || [];
            
            // Manejar caso de no encontrar datos
            if (shipmentsData.length === 0) {
                console.error('No hay datos de envíos disponibles');
            }
            
            return true;
        } catch (error) {
            console.error('Error al cargar los datos de seguimiento:', error);
            return false;
        }
    }
    
    // Establece los datos de seguimiento basados en el número de tracking
    function setTrackingData(trackingNumber) {
        // Buscar el envío correspondiente
        const shipment = shipmentsData.find(s => s.trackingNumber === trackingNumber);
        
        if (!shipment) {
            alert(`No se encontró información para el número de seguimiento: ${trackingNumber}`);
            return false;
        }
        
        // Actualizar los datos de seguimiento
        trackingData = shipment;
        
        // Actualizar la interfaz con los nuevos datos
        updateCustomerInfo();
        updateTrackingStatus();
        renderMiniTimeline();
        renderMainTimeline();
        updateDocumentsAvailability();
        
        return true;
    }
    
    // Actualiza la información del cliente en la interfaz
    function updateCustomerInfo() {
        document.querySelector('.field-value:nth-child(2)').textContent = trackingData.customer;
        document.querySelector('.customer-field:nth-child(2) .field-value').textContent = trackingData.ruc;
        document.querySelector('.customer-row:nth-child(2) .customer-field:first-child .field-value').textContent = trackingData.estimatedDeliveryDate;
        document.querySelector('.customer-row:nth-child(2) .customer-field:nth-child(2) .field-value').textContent = trackingData.deliveryType;
    }
    
    // Actualiza el estado del seguimiento en la interfaz
    function updateTrackingStatus() {
        document.querySelector('.tracking-column:first-child .tracking-value').textContent = trackingData.trackingNumber;
        document.querySelector('.tracking-column:first-child .tracking-date').textContent = trackingData.registrationDate;
        
        document.querySelector('.tracking-column:nth-child(2) .tracking-value').textContent = trackingData.currentStatus;
        document.querySelector('.tracking-column:nth-child(2) .tracking-date').textContent = trackingData.lastUpdateDate;
        
        // Actualizar el panel de estado en la sección expandida
        document.querySelector('.estado-actual').textContent = trackingData.currentStatus;
        document.querySelector('.estado-fecha').textContent = trackingData.lastUpdateDate;
        
        // Actualizar dirección de entrega
        document.querySelector('.address-info p').textContent = trackingData.address;
        
        // Verificar si el estado es "Entregado" 
        const isDelivered = trackingData.currentStatusId === 5;
        
        // Actualizar badge de estado de entrega
        const statusBadge = document.querySelector('.delivery-status-badge');
        const deliveryStatus = document.querySelector('.delivery-status');
        
        if (isDelivered) {
            statusBadge.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p class="status-title">¡Envío entregado!</p>
                <p class="status-subtitle">Nos movemos por ti</p>
            `;
            statusBadge.classList.add('delivered');
            deliveryStatus.classList.add('delivered');
        } else {
            statusBadge.innerHTML = `
                <i class="fas ${getIconForStatus(trackingData.currentStatusId)}"></i>
                <p class="status-title">${trackingData.currentStatus}</p>
                <p class="status-subtitle">En proceso</p>
            `;
            statusBadge.classList.remove('delivered');
            deliveryStatus.classList.remove('delivered');
        }
    }
    
    // Renderiza el mini timeline en la cabecera
    function renderMiniTimeline() {
        let html = '';
        
        trackingData.steps.forEach((step, index) => {
            // Determinar si este paso es el actual o entregado
            const isActive = step.id === trackingData.currentStatusId;
            const isDelivered = step.id === 5 && step.status === 'completed'; 
            const activeClass = isDelivered ? 'delivered' : isActive ? 'active' : '';
            
            html += `
                <div class="step-dot ${activeClass}">
                    <div class="step-icon ${activeClass}">
                        <i class="fas ${step.icon}"></i>
                    </div>
                    <span class="step-label-mini">${step.label}</span>
                </div>`;
                    
            // Agregar línea de conexión si no es el último paso
            if (index < trackingData.steps.length - 1) {
                // Determinar si esta línea está antes o después del estado activo
                let lineClass = '';
                if (step.id === trackingData.currentStatusId) {
                    lineClass = 'active-after'; // Línea después del estado activo
                } else if (trackingData.steps[index + 1].id === trackingData.currentStatusId) {
                    lineClass = 'active-before'; // Línea antes del estado activo
                }
                
                html += `<div class="step-line ${lineClass}"></div>`;
            }
        });
        
        miniTimeline.innerHTML = html;
    }
    
    // Renderiza el timeline detallado
    function renderMainTimeline() {
        // Limpiar contenedor existente
        timelineContainer.innerHTML = '';
        
        // Agregar línea vertical del timeline
        const timelineLine = document.createElement('div');
        timelineLine.classList.add('timeline-line');
        timelineContainer.appendChild(timelineLine);
        
        // Dividir el timeline en secciones completadas y futuras para la visualización
        const activeStepIndex = trackingData.steps.findIndex(step => step.id === trackingData.currentStatusId);
        
        // Si hay estados después del actual, agregar línea de estados futuros
        if (activeStepIndex !== -1 && activeStepIndex < trackingData.steps.length - 1) {
            const activeLine = document.createElement('div');
            activeLine.classList.add('timeline-line-future');
            
            // Calcular posición aproximada basada en altura de los pasos
            const topPosition = (activeStepIndex + 1) * 100; // Ajustar este valor según necesidad
            activeLine.style.top = `${topPosition}px`;
            activeLine.style.bottom = '0';
            
            timelineContainer.appendChild(activeLine);
        }
        
        // Generar los pasos del timeline
        trackingData.steps.forEach(step => {
            const isActive = step.id === trackingData.currentStatusId;
            const isPending = step.status === 'pending';
            const isCompleted = step.status === 'completed';
            const isDelivered = step.id === 5 && step.status === 'completed';
            
            let statusClass = '';
            if (isActive) statusClass = 'active';
            else if (isPending) statusClass = 'pending';
            else if (isCompleted) statusClass = 'completed';
            
            // No mostrar detalles para estados pendientes
            const detailsHtml = (!isPending && step.details) ? 
                `<p class="step-details">${step.details}</p>` : '';
            
            // No mostrar fecha para estados pendientes
            const dateHtml = !isPending ? 
                `<p class="step-date">${step.date}</p>` : '';
            
            const timelineStep = document.createElement('div');
            timelineStep.classList.add('timeline-step');
            if (statusClass) timelineStep.classList.add(statusClass);
            if (isDelivered) timelineStep.classList.add('delivered');
            timelineStep.id = `estado${step.id}`;
            
            timelineStep.innerHTML = `
                <div class="timeline-step-icon">
                    <i class="fas ${step.icon}"></i>
                </div>
                <div class="timeline-step-content">
                    <div class="timeline-step-header">
                        <p class="step-label">${step.label}</p>
                        <span class="step-id">Estado ${step.id}</span>
                    </div>
                    ${dateHtml}
                    ${detailsHtml}
                </div>
            `;
            
            timelineContainer.appendChild(timelineStep);
        });
    }
    
    // Actualiza la disponibilidad de documentos
    function updateDocumentsAvailability() {
        // Mostrar/ocultar botones de documentos y fotos según disponibilidad
        viewDocsBtn.style.display = trackingData.hasDocuments ? 'flex' : 'none';
        viewPhotosBtn.style.display = trackingData.hasPhotos ? 'flex' : 'none';
        
        // Si hay documentos, actualizar la lista
        if (trackingData.hasDocuments && trackingData.documents && trackingData.documents.length > 0) {
            let docsHtml = '';
            trackingData.documents.forEach(doc => {
                docsHtml += `
                <div class="document-item animate-fade">
                    <div class="doc-info">
                        <div class="doc-name">
                            <i class="fas fa-file-pdf"></i>
                            <span>${doc.name}</span>
                        </div>
                        <div class="doc-type">${doc.type} - ${doc.date}</div>
                    </div>
                    <a href="${doc.downloadUrl}" class="doc-download" target="_blank" title="Descargar ${doc.name}">
                        <i class="fas fa-download"></i>
                    </a>
                </div>`;
            });
            
            document.querySelector('.docs-list').innerHTML = docsHtml;
        } else {
            document.querySelector('.docs-list').innerHTML = '<p>No hay documentos disponibles para este envío.</p>';
        }
    }
    
    // Retorna el icono adecuado para un estado dado
    function getIconForStatus(statusId) {
        const iconMap = {
            1: 'fa-box',
            2: 'fa-warehouse',
            3: 'fa-clipboard-check',
            4: 'fa-truck',
            5: 'fa-check-circle'
        };
        
        return iconMap[statusId] || 'fa-circle';
    }
    
    // Toggle details section visibility con animación
    function toggleDetails() {
        const isVisible = !trackingDetails.classList.contains('collapsed');
        
        if (isVisible) {
            trackingDetails.classList.add('collapsed');
            toggleIcon.className = 'fas fa-chevron-down';
        } else {
            trackingDetails.classList.remove('collapsed');
            toggleIcon.className = 'fas fa-chevron-up';
            
            // Scroll automático hacia los detalles
            setTimeout(() => {
                trackingDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    
    // Show photo modal
    function showPhotoModal() {
        photoModal.style.display = 'block';
        document.body.classList.add('modal-open');
        // Focus en el botón de cerrar para accesibilidad
        setTimeout(() => closePhotoModalBtn.focus(), 100);
        
        // Si hay fotos disponibles, mostrarlas
        if (trackingData.hasPhotos && trackingData.photos && trackingData.photos.length > 0) {
            let photosHtml = '';
            trackingData.photos.forEach(photo => {
                photosHtml += `
                <div class="photo-item">
                    <img src="${photo.url}" alt="${photo.description || 'Foto de entrega'}">
                </div>`;
            });
            
            document.querySelector('.photo-gallery').innerHTML = photosHtml;
        } else {
            document.querySelector('.photo-gallery').innerHTML = '<p>No hay fotografías disponibles para este envío.</p>';
        }
    }
    
    // Show documents modal
    function showDocsModal() {
        docsModal.style.display = 'block';
        document.body.classList.add('modal-open');
        // Focus en el botón de cerrar para accesibilidad
        setTimeout(() => closeDocsModalBtn.focus(), 100);
    }
    
    // Hide photo modal
    function hidePhotoModal() {
        photoModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    // Hide documents modal
    function hideDocsModal() {
        docsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    // Search for tracking number
    function searchTracking() {
        const trackingNumber = trackingNumberInput.value.trim();
        
        if (!trackingNumber) {
            alert('Por favor ingrese un número de seguimiento válido.');
            return;
        }
        
        // Show loading state
        const originalButtonText = searchTrackingBtn.innerHTML;
        searchTrackingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
        searchTrackingBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Reset button state
            searchTrackingBtn.innerHTML = originalButtonText;
            searchTrackingBtn.disabled = false;
            
            // Set tracking data with provided tracking number
            const result = setTrackingData(trackingNumber);
            
            // Asegurar que los detalles estén ocultos al cargar nuevos datos
            if (result && trackingDetails.style.display === 'none') {
                trackingDetails.classList.add('collapsed');
            }
        }, 800);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === photoModal) {
            hidePhotoModal();
        }
        if (e.target === docsModal) {
            hideDocsModal();
        }
    });

    // Inicializar estado de detalles
    trackingDetails.classList.add('collapsed');
});