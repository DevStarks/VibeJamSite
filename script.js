/**
 * Main Entry Point for the VibeJam Website
 * Ensures all modules are loaded before initializing the app
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for a short delay to ensure all modules are loaded
    setTimeout(() => {
        if (window.cityscapeGame) {
            // Initialize the main VibeJam application
            vibeJamApp.init();
        } else {
            console.error('Required modules not loaded. Please check script dependencies.');
        }
    }, 100);
}); 