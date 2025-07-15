/**
 * Blog Module
 * Fetches and displays blog posts from Velog RSS feed
 */

const Blog = (function() {
    // Configuration
    const config = {
      targetCategory: '개발',
      maxPosts: 6,
      blogUrl: 'https://v2.velog.io/rss/@balsohn',
      corsProxies: [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/'
      ]
    };
    
    /**
     * Fetches blog posts from Tistory RSS feed
     */
    async function fetchPosts() {
      const blogContainer = document.querySelector('.blog-timeline');
      if (!blogContainer) {
        console.error('Blog container not found.');
        return;
      }
      
      // Show loading indicator
      showLoading(blogContainer);
      
      try {
        // Try fetching with CORS proxies
        const data = await fetchWithCorsProxies();
        
        if (!data) {
          throw new Error('Failed to fetch blog data from all proxies.');
        }
        
        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error('Failed to parse RSS feed.');
        }
        
        // Get all items
        const items = xmlDoc.querySelectorAll('item');
        
        // For Velog, show all posts (no category filtering)
        // Velog uses tags differently than Tistory
        const filteredItems = Array.from(items).slice(0, config.maxPosts);
        
        // Remove loading indicator
        hideLoading(blogContainer);
        
        // Handle no posts found
        if (filteredItems.length === 0) {
          showNoPosts(blogContainer);
          return;
        }
        
        // Create and append blog grid
        const cardGrid = document.createElement('div');
        cardGrid.className = 'blog-card-grid';
        blogContainer.appendChild(cardGrid);
        
        // Add posts to grid
        const postsToShow = Math.min(filteredItems.length, config.maxPosts);
        for (let i = 0; i < postsToShow; i++) {
          const card = createBlogCard(filteredItems[i]);
          if (card) {
            cardGrid.appendChild(card);
          }
        }
        
      } catch (error) {
        console.error('Blog fetch error:', error);
        hideLoading(blogContainer);
        showError(blogContainer);
      }
    }
    
    /**
     * Creates a blog card element from an RSS item
     * @param {Element} item - XML item element
     * @returns {Element} - Blog card DOM element
     */
    function createBlogCard(item) {
      // Extract post data
      const title = item.querySelector('title')?.textContent || '제목 없음';
      const link = item.querySelector('link')?.textContent || '#';
      const pubDateText = item.querySelector('pubDate')?.textContent || '';
      const descriptionHtml = item.querySelector('description')?.textContent || '';
      
      // Parse date
      let formattedDate = "날짜 정보 없음";
      try {
        const pubDate = new Date(pubDateText);
        if (!isNaN(pubDate.getTime())) {
          formattedDate = `${pubDate.getFullYear()}년 ${pubDate.getMonth() + 1}월 ${pubDate.getDate()}일`;
        }
      } catch (error) {
        console.warn('Date parsing error:', error);
      }
      
      // Extract categories - Debug Velog RSS structure
      const categories = Array.from(item.querySelectorAll('category'))
        .map(cat => cat.textContent.trim())
        .filter(cat => cat);
      
      // Debug: Log the full item structure for first post
      if (categories.length === 0) {
        console.log('RSS Item structure:', item.innerHTML);
        console.log('Available elements:', Array.from(item.children).map(el => el.tagName));
      }
      
      // Clean description (remove HTML tags)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = descriptionHtml;
      let description = tempDiv.textContent || tempDiv.innerText || '';
      description = description.substring(0, 100) + (description.length > 100 ? '...' : '');
      
      // Extract first image if available
      let imageUrl = '';
      tempDiv.innerHTML = descriptionHtml;
      const firstImage = tempDiv.querySelector('img');
      if (firstImage && firstImage.src && firstImage.src.startsWith('http')) {
        imageUrl = firstImage.src;
      }
      
      // Create card element
      const card = document.createElement('div');
      card.className = 'blog-card';
      
      // Add hover and click events
      card.addEventListener('mouseover', function() {
        this.classList.add('hover');
      });
      card.addEventListener('mouseout', function() {
        this.classList.remove('hover');
      });
      card.addEventListener('click', function() {
        window.open(link, '_blank');
      });
      
      // Create card HTML
      let cardHtml = '';
      if (imageUrl) {
        cardHtml += `
          <div class="card-image">
            <img src="${imageUrl}" alt="${title} 썸네일" loading="lazy">
          </div>
        `;
      }
      
      // Create category tags HTML
      let categoryTagsHtml = '';
      if (categories.length > 0) {
        categoryTagsHtml = `
          <div class="card-categories">
            ${categories.map(category => `<span class="category-tag">${category}</span>`).join('')}
          </div>
        `;
      }

      cardHtml += `
        <div class="card-content">
          <div class="card-date">${formattedDate}</div>
          ${categoryTagsHtml}
          <h4 class="card-title">${title}</h4>
          <p class="card-excerpt">${description}</p>
        </div>
      `;
      
      card.innerHTML = cardHtml;
      return card;
    }
    
    /**
     * Attempts to fetch data using multiple CORS proxies
     * @returns {Promise<string>} - Fetched data
     */
    async function fetchWithCorsProxies() {
      for (const proxy of config.corsProxies) {
        try {
          const response = await fetch(proxy + encodeURIComponent(config.blogUrl));
          
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          
          if (proxy.includes('allorigins')) {
            const jsonData = await response.json();
            if (jsonData.contents) {
              return jsonData.contents;
            }
            continue;
          } else {
            const data = await response.text();
            return data;
          }
        } catch (error) {
          console.warn(`${proxy} proxy failed:`, error);
        }
      }
      
      return null;
    }
    
    /**
     * Shows loading indicator
     * @param {Element} container - Container element
     */
    function showLoading(container) {
      const loadingElement = document.createElement('div');
      loadingElement.className = 'loading';
      loadingElement.textContent = '블로그 글을 불러오는 중...';
      container.appendChild(loadingElement);
    }
    
    /**
     * Hides loading indicator
     * @param {Element} container - Container element
     */
    function hideLoading(container) {
      const loadingElement = container.querySelector('.loading');
      if (loadingElement) {
        container.removeChild(loadingElement);
      }
    }
    
    /**
     * Shows error message
     * @param {Element} container - Container element
     */
    function showError(container) {
      if (!container.querySelector('.error-message')) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = '블로그 글을 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.';
        container.prepend(errorElement);
      }
    }
    
    /**
     * Shows no posts message
     * @param {Element} container - Container element
     */
    function showNoPosts(container) {
      const noPostsElement = document.createElement('div');
      noPostsElement.className = 'no-posts';
      noPostsElement.textContent = `'${config.targetCategory}' 카테고리의 글을 찾을 수 없습니다.`;
      container.appendChild(noPostsElement);
    }
    
    // Public API
    return {
      fetchPosts: fetchPosts
    };
  })();