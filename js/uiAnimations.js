/**
 * UI Animations Module
 * Handles all visual effects, transitions, and animations
 */

const uiAnimations = (function() {
    // Private variables
    let scanlines;
    
    // Private methods
    function setupElementFades() {
        // Add smooth animations for page elements
        const fadeInElements = document.querySelectorAll('.info-card, h1');
        fadeInElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + (index * 150));
        });
    }
    
    function setupButtonAnimations() {
        // Add animation for control buttons
        const controlButtons = document.querySelectorAll('.control-btn');
        controlButtons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(-10px)';
            button.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 300 * (index + 1));
        });
    }
    
    function setupCRTEffect() {
        scanlines = document.querySelector('.scanlines');
        // Start the flicker effect
        flickerEffect();
    }
    
    function flickerEffect() {
        // More subtle opacity changes
        const randomOpacity = 0.4 + Math.random() * 0.2;
        scanlines.style.opacity = randomOpacity;
        
        // Less frequent flicker for better readability
        setTimeout(flickerEffect, 500 + Math.random() * 2000);
    }
    
    // Public API
    return {
        init: function() {
            setupElementFades();
            setupButtonAnimations();
            setupCRTEffect();
            console.log('UI animations initialized');
        },
        
        // Add animation to a new element (useful for dynamically added content)
        animateElement: function(element, delay = 0) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        }
    };
})(); 