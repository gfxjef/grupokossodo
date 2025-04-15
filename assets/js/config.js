/**
 * Global application configuration
 * This file contains settings that are used across the application
 */
const AppConfig = {
    // Base path for API and asset URLs
    basePath: window.location.hostname === 'localhost' ? '' : '/STATUSCRM',
    
    // Other global settings can go here
    apiVersion: 'v1',
    
    // Helper function to get full path
    getFullPath: function(path) {
        return `${this.basePath}${path}`;
    }
};

// Prevent modification of the configuration after initialization
Object.freeze(AppConfig);