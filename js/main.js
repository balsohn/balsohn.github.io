// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navContainer = document.querySelector('.nav-container');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

// Smooth Scrolling & Active Link Update
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');

    // Check if target is just "#" (like the logo link)
    if (targetId === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Update active state for Home link
      document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
      const homeLink = document.querySelector('.nav-links a[href="#home"]');
      if (homeLink) homeLink.classList.add('active');
      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
      return; // Exit early for the "#" link
    }

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const navHeight = navContainer ? navContainer.offsetHeight : 70;
      const offsetTop = targetElement.offsetTop - navHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Update active link immediately on click
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
      });

      // Check if the clicked anchor itself is inside the nav-links
      if (this.closest('.nav-links')) {
        this.classList.add('active');
      } else {
        // If clicked from outside nav (e.g., CTA button), activate corresponding nav link
        const correspondingNavLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
        if (correspondingNavLink) {
          correspondingNavLink.classList.add('active');
        }
      }

      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
    }
  });
});

// Scroll Spy (Update active link on scroll)
const sections = document.querySelectorAll('section[id]');

const scrollSpyHandler = () => {
  const scrollPosition = window.scrollY;
  const navHeight = navContainer ? navContainer.offsetHeight : 70;

  // Sticky Navigation Style Change
  if (navContainer) {
    if (scrollPosition > 50) {
      navContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      navContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      navContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      navContainer.style.boxShadow = 'none';
    }
  }

  // Active Link Update Logic
  let currentSectionId = '';
  sections.forEach(section => {
    // Adjust offset calculation slightly for better accuracy
    const sectionTop = section.offsetTop - navHeight - 50;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSectionId = section.getAttribute('id');
    }
  });

  // Handle edge case: if scrolled near the bottom, activate the last section link
  const bottomThreshold = document.body.offsetHeight - window.innerHeight - navHeight;
  if (scrollPosition >= bottomThreshold - 50) {
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      currentSectionId = lastSection.getAttribute('id');
    }
  }

  // Update active class on nav links
  let foundActive = false;
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSectionId) {
      link.classList.add('active');
      foundActive = true;
    }
  });

  // Handle edge case: if scrolled to top, activate "Home"
  if (!foundActive && scrollPosition < sections[0].offsetTop - navHeight - 50) {
    const homeLink = document.querySelector('.nav-links a[href="#home"]');
    if (homeLink) homeLink.classList.add('active');
  }
};

window.addEventListener('scroll', scrollSpyHandler);

// Initial check for active link on page load/refresh
window.addEventListener('load', scrollSpyHandler);

// 타이핑 효과 (영웅 섹션)
document.addEventListener('DOMContentLoaded', function () {
  const text = document.querySelector('.hero-content h3');
  if (text) {
    const originalText = text.textContent;
    text.textContent = '';

    let i = 0;
    const typeWriter = () => {
      if (i < originalText.length) {
        text.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      }
    };

    setTimeout(typeWriter, 1000);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  fetchBlogPosts();
  projectHoverEffect();
});

async function projectHoverEffect() {
  const accordionItems = document.querySelectorAll('.accordion-item');
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // // 처음 항목을 기본적으로 열기
    // accordionItems[0].classList.add('active');
    
    
    accordionHeaders.forEach((header, index) => {
      header.addEventListener('click', function() {
        // 현재 아이템 참조
        const currentItem = accordionItems[index];
        
        // 현재 아이템 토글
        currentItem.classList.toggle('active');
        
        // 다른 아이템 닫기 (한 번에 하나만 열리도록)
        accordionItems.forEach((item, i) => {
          if (i !== index) {
            item.classList.remove('active');
          }
        });
        
        // 열린 아이템으로 스크롤
        if (currentItem.classList.contains('active')) {
          setTimeout(() => {
            const headerHeight = 80; // 고정 헤더가 있다면 그 높이를 고려
            const itemTop = currentItem.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({
              top: itemTop,
              behavior: 'smooth'
            });
          }, 300);
        }
      });
    });
}

async function fetchBlogPosts() {
  const blogContainer = document.querySelector('.blog-timeline');
  if (!blogContainer) {
    console.error('블로그 컨테이너(.blog-timeline)를 찾을 수 없습니다.');
    return;
  }

  // 로딩 표시
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading';
  loadingElement.textContent = '블로그 글을 불러오는 중...';
  blogContainer.appendChild(loadingElement);

  try {
    // 필터링할 카테고리
    const targetCategory = '개발 시리즈'.toLowerCase();

    // 기본 RSS 피드 URL
    const blogUrl = 'https://balsohn.tistory.com/rss';

    // CORS 프록시
    const corsProxies = [
      'https://api.allorigins.win/get?url=',
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/'
    ];

    let response = null;
    let data = null;
    let success = false;

    for (const proxy of corsProxies) {
      try {
        console.log(`${proxy} 프록시를 사용하여 시도 중...`);
        response = await fetch(proxy + encodeURIComponent(blogUrl));

        if (proxy.includes('allorigins')) {
          data = await response.json();
          if (data.contents) {
            success = true;
            data = data.contents;
            break;
          }
        } else {
          data = await response.text();
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`${proxy} 프록시 시도 실패:`, err);
      }
    }

    if (!success) {
      throw new Error('모든 CORS 프록시 시도가 실패했습니다.');
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');

    const items = xmlDoc.querySelectorAll('item');
    console.log(`파싱된 전체 블로그 항목 수: ${items.length}`);

    const filteredItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const categoryElements = item.querySelectorAll('category');

      const categories = Array.from(categoryElements).map(el => el.textContent.toLowerCase());

      if (categories.includes(targetCategory) || categories.some(cat => cat.includes(targetCategory))) {
        filteredItems.push(item);
      }
    }

    console.log(`'${targetCategory}' 카테고리 필터링 후 항목 수: ${filteredItems.length}`);

    blogContainer.removeChild(loadingElement);

    if (filteredItems.length === 0) {
      const noPostsElement = document.createElement('div');
      noPostsElement.className = 'no-posts';
      noPostsElement.textContent = `'${targetCategory}' 카테고리의 글을 찾을 수 없습니다.`;
      blogContainer.appendChild(noPostsElement);
      return;
    }

    // 카드 그리드 컨테이너 생성
    const cardGrid = document.createElement('div');
    cardGrid.className = 'blog-card-grid';
    cardGrid.style.display = 'grid';
    cardGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    cardGrid.style.gap = '20px';
    blogContainer.appendChild(cardGrid);

    // 최대 3개의 최신 글만 표시
    const maxPosts = Math.min(filteredItems.length, 6);

    for (let i = 0; i < maxPosts; i++) {
      const item = filteredItems[i];

      const titleEl = item.querySelector('title');
      const linkEl = item.querySelector('link');
      const pubDateEl = item.querySelector('pubDate');
      const descEl = item.querySelector('description');

      if (!titleEl || !linkEl || !pubDateEl) {
        console.warn('필수 블로그 항목 요소가 누락되었습니다:', item);
        continue;
      }

      const title = titleEl.textContent;
      const link = linkEl.textContent;
      const pubDate = new Date(pubDateEl.textContent);
      let description = descEl ? descEl.textContent : '내용 없음';

      // HTML에서 텍스트만 추출
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      description = tempDiv.textContent || tempDiv.innerText || '';
      description = description.substring(0, 100) + '...';

      // 날짜 형식 변환
      const formattedDate = `${pubDate.getFullYear()}년 ${pubDate.getMonth() + 1}월 ${pubDate.getDate()}일`;

      // 이미지 URL 추출 시도 (첫 번째 이미지가 있다면)
      let imageUrl = '';
      tempDiv.innerHTML = descEl ? descEl.textContent : '';
      const firstImage = tempDiv.querySelector('img');
      if (firstImage && firstImage.src) {
        imageUrl = firstImage.src;
      }

      // 카드 생성
      const card = document.createElement('div');
      card.className = 'blog-card';
      card.style.border = '1px solid #eaeaea';
      card.style.borderRadius = '8px';
      card.style.overflow = 'hidden';
      card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      card.style.backgroundColor = '#fff';
      card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      card.style.cursor = 'pointer';

      card.addEventListener('mouseover', function () {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
      });

      card.addEventListener('mouseout', function () {
        this.style.transform = '';
        this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      });

      card.addEventListener('click', function () {
        window.open(link, '_blank');
      });

      // 카드 내용 HTML
      let cardHtml = '';

      // 이미지가 있으면 추가
      if (imageUrl) {
        cardHtml += `
          <div class="card-image" style="height: 150px; overflow: hidden;">
            <img src="${imageUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `;
      }

      // 카드 내용
      cardHtml += `
        <div class="card-content" style="padding: 16px;">
          <div class="card-date" style="font-size: 12px; color: #777; margin-bottom: 8px;">${formattedDate}</div>
          <h4 class="card-title" style="margin: 0 0 10px 0; font-size: 17px; font-weight: 600; color: #333;">${title}</h4>
          <p class="card-excerpt" style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">${description}</p>
        </div>
      `;

      card.innerHTML = cardHtml;
      cardGrid.appendChild(card);
    }
  } catch (error) {
    console.error('블로그 글 가져오기 오류:', error);

    if (blogContainer.contains(loadingElement)) {
      blogContainer.removeChild(loadingElement);
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = '블로그 글을 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.';
    blogContainer.appendChild(errorElement);
  }
}

