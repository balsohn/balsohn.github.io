/**
 * Projects Module
 * Handles project filtering, accordions, and load more functionality
 */

const Projects = (function() {
    // Configuration
    const config = {
      itemsToShowInitially: 4,
      itemsPerLoad: 4
    };
    
    // State
    let state = {
      activeFilter: 'all'
    };
    
    /**
     * Initializes projects functionality
     */
    function init() {
      renderFilterTags();
      setupFilterListeners();
      setupAccordionListeners();
      applyFilterAndVisibility();
    }
    
    /**
     * Creates filter tag buttons based on project tags
     */
    function renderFilterTags() {
      const projects = document.querySelectorAll('.projects-accordion .accordion-item');
      const filtersContainer = document.getElementById('project-filters');
      
      if (!filtersContainer || projects.length === 0) {
        console.warn('Project filters container not found or no projects available');
        return;
      }
      
      // Extract unique tags from all projects
      const uniqueTags = new Set();
      projects.forEach(project => {
        const tagsString = project.dataset.tags;
        if (typeof tagsString === 'string') {
          const tags = tagsString.split(' ');
          tags.forEach(tag => {
            if (tag) uniqueTags.add(tag.trim());
          });
        }
      });
      
      // Create filter buttons
      const allButton = filtersContainer.querySelector('[data-filter="all"]');
      filtersContainer.innerHTML = '';
      
      // Add "All" button first
      if (allButton) {
        filtersContainer.appendChild(allButton);
      } else {
        const newAllButton = document.createElement('button');
        newAllButton.className = 'filter-tag active';
        newAllButton.dataset.filter = 'all';
        newAllButton.textContent = '전체보기';
        filtersContainer.appendChild(newAllButton);
      }
      
      // Add tag buttons in alphabetical order
      [...uniqueTags].sort().forEach(tag => {
        const button = document.createElement('button');
        button.className = 'filter-tag';
        button.dataset.filter = tag;
        button.textContent = tag;
        filtersContainer.appendChild(button);
      });
    }
    
    /**
     * Sets up filter button click listeners
     */
    function setupFilterListeners() {
      const filtersContainer = document.getElementById('project-filters');
      if (!filtersContainer) return;
      
      filtersContainer.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && e.target.classList.contains('filter-tag')) {
          const filterValue = e.target.dataset.filter;
          
          // Skip if already active
          if (state.activeFilter === filterValue) return;
          
          // Update state
          state.activeFilter = filterValue;
          
          // Update UI
          filtersContainer.querySelectorAll('.filter-tag').forEach(btn => {
            btn.classList.remove('active');
          });
          e.target.classList.add('active');
          
          // Apply new filter
          applyFilterAndVisibility();
        }
      });
    }
    
    /**
     * Sets up accordion item click listeners
     */
    function setupAccordionListeners() {
      const accordionContainer = document.querySelector('.projects-accordion');
      if (!accordionContainer) return;
      
      accordionContainer.addEventListener('click', function(e) {
        const header = e.target.closest('.accordion-header');
        if (!header) return;
        
        const currentItem = header.closest('.accordion-item');
        if (!currentItem || currentItem.classList.contains('project-filtered-out')) return;
        
        // Close other open accordions
        accordionContainer.querySelectorAll('.accordion-item:not(.project-filtered-out).active').forEach(item => {
          if (item !== currentItem) {
            item.classList.remove('active');
          }
        });
        
        // Toggle current accordion
        currentItem.classList.toggle('active');
        
        // Scroll to opened accordion (with slight delay for animation)
        if (currentItem.classList.contains('active')) {
          setTimeout(function() {
            const navHeight = document.querySelector('.nav-container')?.offsetHeight || 70;
            const itemTop = currentItem.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
            
            window.scrollTo({
              top: itemTop,
              behavior: 'smooth'
            });
          }, 300);
        }
      });
    }
    
    /**
     * Applies filter and visibility rules to projects
     */
    function applyFilterAndVisibility() {
      const allProjectItems = document.querySelectorAll('.projects-accordion .accordion-item');
      let hiddenMatchingItemsCount = 0;
      
      // First pass: apply filtering (hide non-matching)
      allProjectItems.forEach(item => {
        const tagsString = item.dataset.tags;
        const itemTags = (typeof tagsString === 'string') ? tagsString.toLowerCase().split(' ') : [];
        const matchesFilter = (state.activeFilter === 'all' || itemTags.includes(state.activeFilter.toLowerCase()));
        
        if (matchesFilter) {
          item.classList.remove('project-filtered-out');
          item.classList.remove('project-hidden');
        } else {
          item.classList.add('project-filtered-out');
          item.classList.remove('project-hidden');
          item.classList.remove('active');
        }
      });
      
      // Second pass: apply 'load more' hiding
      const matchingItems = document.querySelectorAll('.projects-accordion .accordion-item:not(.project-filtered-out)');
      matchingItems.forEach((item, index) => {
        if (index >= config.itemsToShowInitially) {
          item.classList.add('project-hidden');
          hiddenMatchingItemsCount++;
        }
      });
      
      // Update load more button
      updateLoadMoreButton(hiddenMatchingItemsCount);
    }
    
    /**
     * Updates the load more button state and text
     * @param {number} remainingCount - Number of hidden items
     */
    function updateLoadMoreButton(remainingCount) {
      const loadMoreButton = document.getElementById('load-more-projects');
      if (!loadMoreButton) return;
      
      if (remainingCount > 0) {
        loadMoreButton.textContent = `더보기 (${remainingCount})`;
        loadMoreButton.style.display = 'inline-block';
        loadMoreButton.classList.remove('hidden');
        
        // Add event listener if not already attached
        if (!loadMoreButton.dataset.listenerAttached) {
          loadMoreButton.addEventListener('click', handleLoadMoreClick);
          loadMoreButton.dataset.listenerAttached = 'true';
        }
      } else {
        loadMoreButton.style.display = 'none';
        loadMoreButton.classList.add('hidden');
      }
    }
    
    /**
     * Handles load more button click
     */
    function handleLoadMoreClick() {
      const hiddenMatchingItems = document.querySelectorAll('.projects-accordion .accordion-item:not(.project-filtered-out).project-hidden');
      const itemsToReveal = Math.min(config.itemsPerLoad, hiddenMatchingItems.length);
      
      // Reveal items
      for (let i = 0; i < itemsToReveal; i++) {
        hiddenMatchingItems[i].classList.remove('project-hidden');
      }
      
      // Update load more button
      const remainingHiddenItems = document.querySelectorAll('.projects-accordion .accordion-item:not(.project-filtered-out).project-hidden').length;
      updateLoadMoreButton(remainingHiddenItems);
    }
    
    // Public API
    return {
      init: init
    };
  })();