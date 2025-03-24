/**
 * Theme Manager Module
 * Handles dark/light theme switching and preference saving
 */

const themeManager = (function() {
    // Private variables
    let themeToggle;
    let body;

    // Private methods
    function setupThemeToggle() {
        body = document.body;

        // Set to dark mode by default
        body.classList.remove('light-mode');

        // Check if user has a saved theme preference
        if (storageManager.getThemePreference() === 'light') {
            body.classList.add('light-mode');
        }

        // Theme toggle is now optional
        themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }

    function toggleTheme() {
        // Toggle light-mode class on body
        body.classList.toggle('light-mode');
        
        // Save theme preference
        if (body.classList.contains('light-mode')) {
            storageManager.setThemePreference('light');
        } else {
            storageManager.setThemePreference('dark');
        }
    }

    // Public API
    return {
        init: function() {
            setupThemeToggle();
            console.log('Theme manager initialized');
        },
        
        // Getter for current theme
        getCurrentTheme: function() {
            return body?.classList.contains('light-mode') ? 'light' : 'dark';
        }
    };
})(); 