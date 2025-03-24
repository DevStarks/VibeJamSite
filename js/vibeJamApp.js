/**
 * VibeJam App Module
 * Main application controller that coordinates all other modules
 */

const vibeJamApp = (function() {
    // Module references (for easier access)
    const modules = {
        storage: storageManager,
        theme: themeManager,
        music: musicSynth,
        ui: uiAnimations,
        cityscape: window.cityscapeGame || null
    };
    
    // Private methods
    function setupEventHandlers() {
        // Add any global event handlers here
        window.addEventListener('resize', handleResize);
    }
    
    function handleResize() {
        // Handle window resize events if needed
        console.log('Window resized, adjusting layout if needed');
        
        // Resize the cityscape game if it's initialized
        if (modules.cityscape) {
            modules.cityscape.resize();
        }
    }
    
    // Check if all required modules are available
    function checkDependencies() {
        if (!modules.cityscape) {
            console.error('Required module cityscapeGame not found');
            return false;
        }
        return true;
    }
    
    // Public API
    return {
        init: function() {
            // Check dependencies first
            if (!checkDependencies()) {
                console.error('Cannot initialize VibeJam app: missing required modules');
                return this;
            }
            
            // Initialize all modules in the correct order
            modules.storage.init();
            modules.theme.init();
            modules.music.init();
            modules.ui.init();
            
            // Initialize the cityscape game
            modules.cityscape.init('cityscape-container');
            
            // Setup additional handlers
            setupEventHandlers();
            
            console.log('VibeJam application initialized');
            return this;
        },
        
        // Provide access to individual modules through the main app
        getModule: function(moduleName) {
            return modules[moduleName] || null;
        },
        
        // Global application methods
        toggleMusic: function() {
            if (modules.music.isPlaying()) {
                modules.music.stop();
            } else {
                modules.music.start();
            }
            return this;
        }
    };
})(); 