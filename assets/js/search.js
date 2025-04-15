// Search functionality
class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.menuItems = [];
        
        if (!this.searchInput || !this.searchResults) {
            console.error('Search: Required elements not found');
            return;
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Input event para búsqueda en tiempo real
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        
        // Focus event para mostrar resultados existentes
        this.searchInput.addEventListener('focus', () => {
            const searchTerm = this.searchInput.value.trim();
            if (searchTerm.length >= 2) {
                this.searchResults.classList.add('show');
            }
        });

        // Click fuera para cerrar resultados
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.searchResults.classList.remove('show');
            }
        });
            
        // Prevenir envío del formulario al presionar Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // Si hay un primer resultado, navegar a él
                const firstResult = this.searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    const url = firstResult.getAttribute('data-url');
                    if (url) {
                        window.location.href = url;
                    }
                }
            }
        });
    }

    // Cargar todos los elementos de menú para la búsqueda    
    loadMenuItems() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            console.error('Search: Sidebar not found');
            return;
        }

        this.menuItems = []; // Limpiar items existentes
        
        // Recopilar todos los elementos de navegación
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const navTextElement = item.querySelector('.nav-text');
            // Solo procesar items con texto y que sean enlaces válidos
            if (navTextElement && item.href && !item.href.endsWith('#')) {
                // Construir la jerarquía del menú de forma más precisa
                let path = [];
                let currentElement = item;
                
                // Subir por el árbol DOM para construir la ruta
                while (currentElement) {
                    const parentSubmenu = currentElement.closest('.submenu');
                    if (!parentSubmenu) break;
                    
                    const parentItem = parentSubmenu.previousElementSibling;
                    if (parentItem) {
                        const parentText = parentItem.querySelector('.nav-text');
                        if (parentText) {
                            path.unshift(parentText.textContent.trim());
                        }
                    }
                    currentElement = parentSubmenu.parentElement;
                }
                
                const menuItem = {
                    text: navTextElement.textContent.trim(),
                    url: item.href,
                    path: path.join(' > '),
                    element: item // Guardar referencia al elemento para resaltado
                };
                
                this.menuItems.push(menuItem);
            }
        });
        
        console.log('Menús indexados para búsqueda:', this.menuItems.length);
        
        // Si hay un término de búsqueda activo, actualizar resultados
        if (this.searchInput.value.trim().length >= 2) {
            this.handleSearch();
        }
    }
    
    handleSearch() {
        const searchTerm = this.searchInput.value.trim().toLowerCase();
        
        // Limpiar y ocultar resultados si el término es muy corto
        if (searchTerm.length < 2) {
            this.searchResults.innerHTML = '';
            this.searchResults.classList.remove('show');
            return;
        }
        
        // Filtrar elementos del menú - búsqueda más flexible
        const results = this.menuItems.filter(item => {
            const textMatch = item.text.toLowerCase().includes(searchTerm);
            const pathMatch = item.path.toLowerCase().includes(searchTerm);
            // Búsqueda por palabras individuales
            const words = searchTerm.split(/\s+/);
            const wordMatch = words.every(word => 
                item.text.toLowerCase().includes(word) || 
                item.path.toLowerCase().includes(word)
            );
            
            return textMatch || pathMatch || wordMatch;
        });
        
        this.displayResults(results, searchTerm);
    }
    
    displayResults(results, searchTerm) {
        this.searchResults.innerHTML = ''; // Limpiar resultados anteriores
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">No se encontraron resultados para "${searchTerm}"</div>
                </div>
            `;
        } else {
            // Ordenar resultados: coincidencias exactas primero
            results.sort((a, b) => {
                const aExact = a.text.toLowerCase().includes(searchTerm);
                const bExact = b.text.toLowerCase().includes(searchTerm);
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                return 0;
            });
            
            // Crear elementos de resultado
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                
                // Resaltar coincidencias en texto y ruta
                const highlightedText = this.highlightMatch(result.text, searchTerm);
                const highlightedPath = result.path ? 
                    this.highlightMatch(result.path, searchTerm) : '';
                
                resultItem.innerHTML = `
                    <div class="search-result-content">
                        <div class="search-result-title">${highlightedText}</div>
                        ${result.path ? `
                            <div class="search-result-path">
                                <span class="path-icon">📁</span>
                                ${highlightedPath}
                            </div>
                        ` : ''}
                    </div>
                `;
                
                // Agregar atributo de URL para navegación
                resultItem.setAttribute('data-url', result.url);
                
                // Mejorar la interactividad
                resultItem.addEventListener('click', () => {
                    // Resaltar el elemento en el sidebar antes de navegar
                    if (result.element) {
                        // Remover resaltado anterior si existe
                        document.querySelectorAll('.nav-item.highlight').forEach(el => 
                            el.classList.remove('highlight'));
                        result.element.classList.add('highlight');
                        
                        // Expandir los menús padres si es necesario
                        let parent = result.element.closest('.submenu');
                        while (parent) {
                            const parentLi = parent.parentElement;
                            if (parentLi.classList.contains('has-submenu')) {
                                parentLi.classList.add('active');
                                parent.style.maxHeight = parent.scrollHeight + 'px';
                                parent.style.opacity = '1';
                                parent.style.visibility = 'visible';
                            }
                            parent = parentLi.closest('.submenu');
                        }
                    }
                    
                    // Navegar a la URL
                    window.location.href = result.url;
                });
                
                this.searchResults.appendChild(resultItem);
            });
        }
        
        // Mostrar resultados
        this.searchResults.classList.add('show');
    }
    
    // Función para resaltar coincidencias en el texto
    highlightMatch(text, searchTerm) {
        if (!text || !searchTerm) return text || '';
        
        try {
            // Escapar caracteres especiales en el término de búsqueda
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedTerm})`, 'gi');
            return text.replace(regex, '<strong>$1</strong>');
        } catch (error) {
            console.error('Error al resaltar coincidencia:', error);
            return text;
        }
    }
}
