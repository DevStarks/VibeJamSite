/**
 * Storage Manager Module
 * Centralizes local storage operations and user preferences
 */

const storageManager = (function() {
    // Constants
    const KEYS = {
        THEME: 'theme',
        MUSIC: 'music'
    };
    
    // Private methods
    function getItem(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    }
    
    function setItem(key, value) {
        localStorage.setItem(key, value);
    }
    
    // Public API
    return {
        init: function() {
            console.log('Storage manager initialized');
            return this;
        },
        
        // Theme preferences
        getThemePreference: function() {
            return getItem(KEYS.THEME, 'dark');
        },
        
        setThemePreference: function(theme) {
            setItem(KEYS.THEME, theme);
        },
        
        // Music preferences
        getMusicPreference: function() {
            return getItem(KEYS.MUSIC, 'off');
        },
        
        setMusicPreference: function(state) {
            setItem(KEYS.MUSIC, state);
        },
        
        // General storage operations
        get: getItem,
        set: setItem,
        
        // For debugging
        clear: function() {
            localStorage.clear();
        }
    };
})(); 