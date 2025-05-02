/**
 * Navigation Module
 * Handles mobile navigation toggle and smooth scrolling
 */

const Navigation = (function() {
    // Private variables
    const navContainer = document.querySelector('.nav-container');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    /**
     * Initializes navigation functionality
     */
    function init() {
      if (hamburger && navLinks) {
        setupMobileNavigation();
      }
      setupSmoothScrolling();
    }
    
    /**
     * Sets up mobile navigation toggle
     */
    function setupMobileNavigation() {
      // Toggle mobile menu
      hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
      });
      
      // Close mobile menu when clicking on links
      navLinks.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          navLinks.classList.remove('active');
          hamburger.classList.remove('active');
        }
      });
    }
    
    /**
     * Sets up smooth scrolling for anchor links
     */
    function setupSmoothScrolling() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          
          // Handle home link (just "#")
          if (targetId === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
            const homeLink = document.querySelector('.nav-links a[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
            return;
          }
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            const navHeight = navContainer ? navContainer.offsetHeight : 70;
            const offsetTop = targetElement.offsetTop - navHeight;
            
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
            
            // Update active link
            document.querySelectorAll('.nav-links a').forEach(link => {
              link.classList.remove('active');
            });
            
            if (this.closest('.nav-links')) {
              this.classList.add('active');
            } else {
              const correspondingNavLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
              if (correspondingNavLink) {
                correspondingNavLink.classList.add('active');
              }
            }
          }
        });
      });
    }
    
    // Public API
    return {
      init: init
    };
  })();