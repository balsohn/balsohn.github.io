/**
 * ScrollSpy Module
 * Tracks scroll position and updates active navigation link
 */

const ScrollSpy = (function() {
  // Private variables
  const navContainer = document.querySelector('.nav-container');
  const sections = document.querySelectorAll('section[id]');
  let scrollTimeout = null;
  
  /**
   * Initializes scroll spy functionality
   */
  function init() {
    window.addEventListener('scroll', throttleScroll);
    window.addEventListener('load', updateActiveLink);
  }
  
  /**
   * Throttles scroll event to improve performance
   */
  function throttleScroll() {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(function() {
        updateActiveLink();
        scrollTimeout = null;
      }, 100);
    }
  }
  
  /**
   * Updates the active navigation link based on scroll position
   */
  function updateActiveLink() {
    const scrollPosition = window.scrollY;
    const navHeight = navContainer ? navContainer.offsetHeight : 70;
    
    // Style changes for sticky navigation
    if (navContainer) {
      if (scrollPosition > 50) {
        navContainer.classList.add('scrolled');
      } else {
        navContainer.classList.remove('scrolled');
      }
    }
    
    // Find the current active section
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - navHeight - 50;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    // Handle edge case: if scrolled to bottom, activate last section
    const bottomThreshold = document.body.offsetHeight - window.innerHeight - navHeight;
    if (scrollPosition >= bottomThreshold - 50) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        currentSectionId = lastSection.getAttribute('id');
      }
    }
    
    // Update active link in navigation
    let foundActive = false;
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSectionId) {
        link.classList.add('active');
        foundActive = true;
      }
    });
    
    // Handle edge case: if at top of page, activate "Home"
    if (!foundActive && scrollPosition < sections[0].offsetTop - navHeight - 50) {
      const homeLink = document.querySelector('.nav-links a[href="#home"]');
      if (homeLink) homeLink.classList.add('active');
    }
  }
  
  // Public API
  return {
    init: init
  };
})();