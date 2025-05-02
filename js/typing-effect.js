/**
 * TypingEffect Module
 * Creates a typewriter effect on hero title
 */

const TypingEffect = (function() {
    // Private variables
    const typingSpeed = 100; // Milliseconds between characters
    const startDelay = 1000; // Delay before typing starts
    
    /**
     * Initializes typing effect
     */
    function init() {
      const heroTitle = document.querySelector('.hero-title');
      
      if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        // Start typing after a delay
        setTimeout(function() {
          typeText(heroTitle, originalText, 0);
        }, startDelay);
      }
    }
    
    /**
     * Types text character by character
     * @param {Element} element - DOM element to type into
     * @param {string} text - Text to type
     * @param {number} index - Current character index
     */
    function typeText(element, text, index) {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(function() {
          typeText(element, text, index);
        }, typingSpeed);
      }
    }
    
    // Public API
    return {
      init: init
    };
  })();