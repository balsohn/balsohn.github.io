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

// --- 기존 코드 시작 (Mobile Navigation, Smooth Scrolling, Scroll Spy, Typing Effect 등) ---
// ... (위에 제공해주신 main.js의 상단 부분은 그대로 둡니다) ...

// --- 프로젝트 관련 로직 시작 ---

document.addEventListener('DOMContentLoaded', function () {
  // 기존 초기화 함수들
  setupMobileNav(); // 모바일 네비 함수 호출 (가정)
  setupSmoothScroll(); // 부드러운 스크롤 함수 호출 (가정)
  setupScrollSpy(); // 스크롤 스파이 함수 호출 (가정)
  setupTypingEffect(); // 타이핑 효과 함수 호출 (가정)

  // 프로젝트 섹션 초기화 함수들 호출
  renderFilterTags();         // 1. 필터 태그 생성 및 리스너 설정
  applyFilterAndVisibility(); // 2. 초기 필터 적용 및 프로젝트 가시성 설정
  setupAccordionListeners();    // 3. 아코디언 기능 리스너 설정

  // 블로그 포스트 로딩
  fetchBlogPosts();
});

// --- 프로젝트 섹션 전역 변수 및 상수 ---
const itemsToShowInitially = 4; // 처음에 보여줄 프로젝트 개수 (원하는 숫자로 변경)
const itemsPerLoad = 4;       // 더보기 클릭 시 추가로 보여줄 개수 (원하는 숫자로 변경)
let activeFilter = 'all';     // 현재 활성화된 필터 태그 ('all'이 기본값)

// --- 프로젝트 섹션 함수들 ---

/**
 * 1. 고유 태그 추출 및 필터 버튼 생성/이벤트 리스너 설정
 */
function renderFilterTags() {
  const projects = document.querySelectorAll('.projects-accordion .accordion-item');
  const filtersContainer = document.getElementById('project-filters');
  // filtersContainer가 없으면 함수 종료 (오류 방지)
  if (!filtersContainer || projects.length === 0) {
      if (!filtersContainer) console.error("필터 컨테이너(#project-filters)를 찾을 수 없습니다.");
      return;
  };

  const uniqueTags = new Set(); // 중복 제거를 위해 Set 사용
  projects.forEach(project => {
    // project.dataset.tags가 존재하고 문자열인지 확인 후 처리
    const tagsString = project.dataset.tags;
    if (typeof tagsString === 'string') {
      const tags = tagsString.split(' ') || []; // data-tags 속성값 가져와 공백으로 분리
      tags.forEach(tag => {
        if (tag) uniqueTags.add(tag.trim()); // 각 태그를 Set에 추가 (앞뒤 공백 제거)
      });
    } else {
        // console.warn("data-tags 속성이 없거나 유효하지 않은 프로젝트 아이템:", project);
    }
  });

  // 기존 필터 버튼들 ('전체보기' 제외) 제거 후 다시 생성 (동적 업데이트 대비)
  const allButton = filtersContainer.querySelector('[data-filter="all"]');
  filtersContainer.innerHTML = ''; // 내부 비우기
  if(allButton) filtersContainer.appendChild(allButton); // '전체보기' 버튼 다시 추가
  else { // '전체보기' 버튼이 없으면 생성
      const newAllButton = document.createElement('button');
      newAllButton.className = 'filter-tag active';
      newAllButton.dataset.filter = 'all';
      newAllButton.textContent = '전체보기';
      filtersContainer.appendChild(newAllButton);
  }


  // 고유 태그들을 알파벳 순으로 정렬하여 버튼 생성
  [...uniqueTags].sort((a, b) => a.localeCompare(b)).forEach(tag => {
    const button = document.createElement('button');
    button.className = 'filter-tag';
    button.dataset.filter = tag; // data-filter 속성에 태그명 저장
    button.textContent = tag;
    filtersContainer.appendChild(button);
  });

  // 필터 버튼 클릭 이벤트 리스너 (이벤트 위임 사용)
  // 이전에 리스너가 붙어있었다면 제거하고 다시 붙이는 것이 안전
  // 여기서는 DOMContentLoaded에서 한 번만 호출되므로 일단 그대로 둡니다.
  filtersContainer.addEventListener('click', (e) => {
    // 클릭된 요소가 'filter-tag' 클래스를 가지고 있고, 버튼 요소인지 확인
    if (e.target.tagName === 'BUTTON' && e.target.classList.contains('filter-tag')) {
      const filterValue = e.target.dataset.filter;
      if (activeFilter === filterValue) return; // 이미 활성화된 필터면 무시

      activeFilter = filterValue; // 활성 필터 업데이트

      // 모든 버튼에서 active 클래스 제거 후 클릭된 버튼에만 추가
      filtersContainer.querySelectorAll('.filter-tag').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      applyFilterAndVisibility(); // 필터 적용 및 가시성 업데이트
    }
  });
}

/**
 * 2. 필터 적용 및 프로젝트 가시성 업데이트 함수 (핵심 로직)
 */
function applyFilterAndVisibility() {
  const allProjectItems = document.querySelectorAll('.projects-accordion .accordion-item');
  const loadMoreButton = document.getElementById('load-more-projects');
  let hiddenMatchingItemsCount = 0; // 현재 필터에 맞으면서 '더보기'로 숨겨진 아이템 수

  allProjectItems.forEach(item => {
    const tagsString = item.dataset.tags;
    const itemTags = (typeof tagsString === 'string') ? tagsString.toLowerCase().split(' ') : []; // 아이템 태그 (소문자)
    // activeFilter도 소문자로 비교
    const matchesFilter = (activeFilter === 'all' || itemTags.includes(activeFilter.toLowerCase())); // 필터 일치 여부 확인

    // 1. 필터링: 필터와 맞지 않으면 숨김 클래스 추가, 맞으면 제거
    if (matchesFilter) {
      item.classList.remove('project-filtered-out');
    } else {
      item.classList.add('project-filtered-out');
      item.classList.remove('project-hidden'); // 필터링 안맞으면 더보기 숨김 상태도 해제해야 함
      item.classList.remove('active'); // 필터링 안맞으면 아코디언도 닫힌 상태로
    }

    // 2. 가시성 초기화 (필터 맞는 항목만 대상으로) - 일단 더보기 숨김 해제
    if (matchesFilter) {
        item.classList.remove('project-hidden');
    }
  });

  // 3. 필터에 맞는 항목들만 대상으로 '더보기' 숨김 처리
  //    NodeList는 배열이 아니므로 Array.from() 또는 스프레드 문법 사용
  const matchingItems = document.querySelectorAll('.projects-accordion .accordion-item:not(.project-filtered-out)');
  matchingItems.forEach((item, index) => {
      if(index >= itemsToShowInitially) {
          item.classList.add('project-hidden'); // 초기 개수 넘어가면 숨김
          hiddenMatchingItemsCount++;
      }
  });

  // 4. 더보기 버튼 상태 업데이트
  updateLoadMoreButton(hiddenMatchingItemsCount);
}

/**
 * 3. 더보기 버튼 상태 및 텍스트 업데이트 함수
 */
function updateLoadMoreButton(remainingCount) {
  const loadMoreButton = document.getElementById('load-more-projects');
  if (!loadMoreButton) return; // 버튼 없으면 종료

  if (remainingCount > 0) {
    loadMoreButton.textContent = `더보기 (${remainingCount})`; // 남은 개수 표시
    loadMoreButton.style.display = 'inline-block';
    loadMoreButton.classList.remove('hidden');
    // 리스너 중복 추가 방지: data 속성으로 플래그 관리
    if (!loadMoreButton.dataset.listenerAttached) {
         loadMoreButton.addEventListener('click', handleLoadMoreClick);
         loadMoreButton.dataset.listenerAttached = 'true';
         // console.log("더보기 리스너 추가됨");
    }
  } else {
    loadMoreButton.style.display = 'none';
    loadMoreButton.classList.add('hidden');
    // 버튼 숨겨질 때 리스너 제거 (선택사항, 메모리 관리)
    if (loadMoreButton.dataset.listenerAttached) {
        loadMoreButton.removeEventListener('click', handleLoadMoreClick);
        delete loadMoreButton.dataset.listenerAttached; // 플래그 제거
        // console.log("더보기 리스너 제거됨");
    }
  }
}

/**
 * 4. 더보기 버튼 클릭 처리 함수
 */
function handleLoadMoreClick() {
    // 중요: 필터에 맞으면서('.project-hidden'이면서 '.project-filtered-out'이 아닌) 숨겨진 항목 선택
    const hiddenMatchingItems = document.querySelectorAll('.projects-accordion .accordion-item:not(.project-filtered-out).project-hidden');
    let itemsToReveal = Math.min(itemsPerLoad, hiddenMatchingItems.length);

    for (let i = 0; i < itemsToReveal; i++) {
      hiddenMatchingItems[i].classList.remove('project-hidden');
    }

    // 남은 숨겨진 매칭 아이템 수 다시 계산 후 버튼 업데이트
    const remainingHiddenMatchingItems = document.querySelectorAll('.projects-accordion .accordion-item:not(.project-filtered-out).project-hidden').length;
    updateLoadMoreButton(remainingHiddenMatchingItems);
}

/**
 * 5. 아코디언 클릭 리스너 설정 함수 (이벤트 위임 방식 사용)
 */
function setupAccordionListeners() {
    const accordionContainer = document.querySelector('.projects-accordion');
    if (!accordionContainer) return; // 아코디언 컨테이너 없으면 종료

    accordionContainer.addEventListener('click', function(e) {
        // 클릭된 요소 또는 그 상위 요소 중 '.accordion-header' 찾기
        const header = e.target.closest('.accordion-header');
        // 헤더가 아니거나, 헤더가 속한 아이템이 없거나, 필터링으로 숨겨진 아이템이면 무시
        if (!header) return;
        const currentItem = header.closest('.accordion-item');
        if (!currentItem || currentItem.classList.contains('project-filtered-out')) return;

        const isActive = currentItem.classList.contains('active');

        // 다른 활성 아코디언 닫기 (현재 필터링된 것들 중에서)
        accordionContainer.querySelectorAll('.accordion-item:not(.project-filtered-out).active').forEach(item => {
            if (item !== currentItem) { // 현재 클릭된 아이템이 아니면
                item.classList.remove('active');
            }
        });

        // 현재 클릭된 아이템 상태 토글
        currentItem.classList.toggle('active');

        // 스크롤 로직 (열렸을 때만)
        if (currentItem.classList.contains('active')) {
            setTimeout(() => {
                // 네비게이션 높이 동적 계산 (좀 더 정확하게)
                const navContainerElement = document.querySelector('.nav-container');
                const navHeight = navContainerElement ? navContainerElement.offsetHeight : 80; // 없으면 기본값 80

                const itemTop = currentItem.getBoundingClientRect().top + window.pageYOffset - navHeight - 10; // 약간의 추가 여백
                window.scrollTo({
                    top: itemTop,
                    behavior: 'smooth'
                });
            }, 300); // 애니메이션 시간 고려
        }
    });
}

// --- 프로젝트 관련 로직 끝 ---

// --- 기존 블로그 포스트 로딩 함수 시작 ---
async function fetchBlogPosts() {
  // ... (이전과 동일한 fetchBlogPosts 함수 내용) ...
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
      'https://cors-anywhere.herokuapp.com/' // 사용 가능 여부 불확실
    ];

    let response = null;
    let data = null;
    let success = false;

    for (const proxy of corsProxies) {
      try {
        console.log(`${proxy} 프록시를 사용하여 시도 중...`);
        response = await fetch(proxy + encodeURIComponent(blogUrl));

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        if (proxy.includes('allorigins')) {
          const jsonData = await response.json(); // 먼저 json으로 파싱
          if (jsonData.contents) { // contents 필드 확인
            data = jsonData.contents;
            success = true;
            console.log('allorigins 프록시 성공');
            break;
          } else {
             // console.warn('allorigins 응답에 contents 필드가 없습니다:', jsonData);
             // 실패로 간주하고 다음 프록시 시도
             continue; // 다음 프록시로
          }
        } else {
          data = await response.text();
          success = true;
           console.log(`${proxy} 프록시 성공`);
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

    // 파싱 오류 확인
     const parseError = xmlDoc.querySelector('parsererror');
     if (parseError) {
        console.error('XML 파싱 오류:', parseError.textContent);
        throw new Error('RSS 피드 파싱에 실패했습니다.');
     }

    const items = xmlDoc.querySelectorAll('item');
    console.log(`파싱된 전체 블로그 항목 수: ${items.length}`);

    if (items.length === 0 && data.length < 500) { // 내용이 너무 짧으면 오류일 가능성
        console.warn("파싱된 항목이 없거나 RSS 데이터가 너무 짧습니다. 프록시 응답 확인:", data);
    }


    const filteredItems = [];

    items.forEach(item => { // for...of 대신 forEach 사용 가능
        const categoryElements = item.querySelectorAll('category');
        const categories = Array.from(categoryElements).map(el => el.textContent.toLowerCase());

        if (categories.includes(targetCategory) || categories.some(cat => cat.includes(targetCategory))) {
            filteredItems.push(item);
        }
    });


    console.log(`'${targetCategory}' 카테고리 필터링 후 항목 수: ${filteredItems.length}`);

    blogContainer.removeChild(loadingElement); // 로딩 표시 제거

    if (filteredItems.length === 0) {
      const noPostsElement = document.createElement('div');
      noPostsElement.className = 'no-posts';
      noPostsElement.textContent = `'${targetCategory}' 카테고리의 글을 찾을 수 없습니다.`;
      blogContainer.appendChild(noPostsElement);
      return;
    }

    // --- 카드 그리드 생성 및 스타일링 --- (기존 코드와 동일)
     const cardGrid = document.createElement('div');
    cardGrid.className = 'blog-card-grid'; // 클래스명 사용 권장
    /* 인라인 스타일 대신 CSS 파일에 정의하는 것이 좋습니다.
    cardGrid.style.display = 'grid';
    cardGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    cardGrid.style.gap = '20px';
    */
    blogContainer.appendChild(cardGrid);


    // 최대 6개의 최신 글만 표시 (기존 코드와 동일)
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

        const title = titleEl.textContent || '제목 없음'; // 기본값 추가
        const link = linkEl.textContent || '#';
        const pubDateText = pubDateEl.textContent;
        let pubDate = null;
        let formattedDate = "날짜 정보 없음";
         try {
            pubDate = new Date(pubDateText);
             // 유효한 날짜인지 확인
             if (!isNaN(pubDate.getTime())) {
                formattedDate = `${pubDate.getFullYear()}년 ${pubDate.getMonth() + 1}월 ${pubDate.getDate()}일`;
             } else {
                 console.warn("유효하지 않은 날짜 형식:", pubDateText);
             }
         } catch (dateError) {
            console.error("날짜 파싱 오류:", dateError, "원본:", pubDateText);
         }


        let description = descEl ? (descEl.textContent || '') : '내용 없음';

        // --- HTML 태그 제거 및 요약 --- (기존 코드와 동일)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        description = tempDiv.textContent || tempDiv.innerText || '';
        description = description.substring(0, 100) + (description.length > 100 ? '...' : '');


        // --- 이미지 URL 추출 --- (기존 코드와 동일)
        let imageUrl = '';
        // description 원본에서 다시 이미지 찾기
        tempDiv.innerHTML = descEl ? (descEl.textContent || '') : '';
        const firstImage = tempDiv.querySelector('img');
         // 이미지 소스가 유효한지 간단히 확인 (http로 시작하는지 등)
        if (firstImage && firstImage.src && firstImage.src.startsWith('http')) {
            imageUrl = firstImage.src;
        }

        // --- 카드 생성 및 스타일링 ---
        const card = document.createElement('div');
        card.className = 'blog-card'; // CSS 클래스 사용 권장
        /* 인라인 스타일 대신 CSS 파일에 정의
        card.style.border = '1px solid #eaeaea';
        card.style.borderRadius = '8px';
        // ... 등등 ...
        */

        // --- 카드 이벤트 리스너 --- (기존 코드와 동일)
        card.addEventListener('mouseover', function () {
            this.classList.add('hover'); // CSS 클래스 활용
        });
        card.addEventListener('mouseout', function () {
             this.classList.remove('hover'); // CSS 클래스 활용
        });
        card.addEventListener('click', function () {
            window.open(link, '_blank');
        });

        // --- 카드 내용 HTML --- (기존 코드와 동일)
        let cardHtml = '';
        if (imageUrl) {
            // alt 속성 추가, 이미지 로딩 실패 대비 스타일 고려
            cardHtml += `
              <div class="card-image">
                <img src="${imageUrl}" alt="${title} 썸네일" loading="lazy">
              </div>
            `;
        }
        cardHtml += `
            <div class="card-content">
              <div class="card-date">${formattedDate}</div>
              <h4 class="card-title">${title}</h4>
              <p class="card-excerpt">${description}</p>
            </div>
          `;

        card.innerHTML = cardHtml;
        cardGrid.appendChild(card); // 생성된 카드를 그리드에 추가
    }

  } catch (error) { // 전체 fetchBlogPosts 함수 감싸는 try-catch
    console.error('블로그 글 가져오기 중 심각한 오류 발생:', error);

    // 로딩 표시가 아직 있으면 제거
    const loadingElementExists = blogContainer.querySelector('.loading');
    if (loadingElementExists) {
      blogContainer.removeChild(loadingElementExists);
    }

    // 사용자에게 보여줄 에러 메시지 (기존 에러 메시지가 없다면 추가)
    if (!blogContainer.querySelector('.error-message')) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = '블로그 글을 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.';
        // 블로그 컨테이너 시작 부분에 에러 메시지 추가
        blogContainer.prepend(errorElement);
    }
  }
}
// --- 기존 블로그 포스트 로딩 함수 끝 ---

// --- 기타 필요한 함수 또는 로직 (예: 모바일 네비 설정 함수 등) ---
function setupMobileNav() {
    // ... (기존 모바일 네비 로직) ...
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

function setupSmoothScroll() {
    // ... (기존 부드러운 스크롤 로직) ...
     const navContainer = document.querySelector('.nav-container'); // 네비 컨테이너 캐싱

     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const navLinks = document.querySelector('.nav-links'); // 함수 내에서 필요시 다시 선택
        const hamburger = document.querySelector('.hamburger');

        if (targetId === '#') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
          const homeLink = document.querySelector('.nav-links a[href="#home"]');
          if (homeLink) homeLink.classList.add('active');
          if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if(hamburger) hamburger.classList.remove('active');
          }
          return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const navHeight = navContainer ? navContainer.offsetHeight : 70;
          const offsetTop = targetElement.offsetTop - navHeight;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });

          document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
          if (this.closest('.nav-links')) {
            this.classList.add('active');
          } else {
            const correspondingNavLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
            if (correspondingNavLink) correspondingNavLink.classList.add('active');
          }

           if (navLinks && navLinks.classList.contains('active')) {
               navLinks.classList.remove('active');
                if(hamburger) hamburger.classList.remove('active');
           }
        }
      });
    });
}

function setupScrollSpy() {
    // ... (기존 스크롤 스파이 로직) ...
    const sections = document.querySelectorAll('section[id]');
    const navContainer = document.querySelector('.nav-container');
    const navLinksAnchors = document.querySelectorAll('.nav-links a'); // 네비 링크 미리 선택

    const scrollSpyHandler = () => {
      const scrollPosition = window.scrollY;
      const navHeight = navContainer ? navContainer.offsetHeight : 70;

      // 네비 스타일 변경
      if (navContainer) {
         if (scrollPosition > 50) {
           navContainer.classList.add('scrolled'); // 클래스 기반으로 변경
         } else {
           navContainer.classList.remove('scrolled');
         }
      }


      let currentSectionId = '';
      let minDistance = Infinity; // 가장 가까운 섹션 찾기 위한 변수

      sections.forEach(section => {
          const sectionTop = section.offsetTop - navHeight;
          const sectionBottom = sectionTop + section.offsetHeight;
          const distance = Math.abs(scrollPosition - sectionTop); // 섹션 상단과의 거리

          // 화면 상단에 가장 가까운 섹션을 찾되, 섹션 범위 안에 있을 때 우선
          if (scrollPosition >= sectionTop - 50 && scrollPosition < sectionBottom) { // 범위 안에 있으면 우선권
             if (distance < minDistance) {
                  minDistance = distance;
                  currentSectionId = section.getAttribute('id');
             }
          } else if (distance < minDistance && scrollPosition < sectionTop) {
              // 범위 밖에 있지만 더 가까운 경우 (위쪽에 있을 때) - 마지막 섹션 등 처리 위함
              // minDistance = distance; // 이 로직은 Home 활성화에 방해가 될 수 있음. 필요시 조정.
          }
      });

       // 페이지 맨 아래 근처 처리
      const bottomThreshold = document.body.offsetHeight - window.innerHeight - 50; // 바닥 여유
       if (scrollPosition >= bottomThreshold) {
         const lastSection = sections[sections.length - 1];
         if (lastSection) {
           currentSectionId = lastSection.getAttribute('id');
         }
       }


      // 활성 링크 업데이트
       let foundActive = false;
       navLinksAnchors.forEach(link => {
         link.classList.remove('active');
         if (link.getAttribute('href') === '#' + currentSectionId) {
           link.classList.add('active');
           foundActive = true;
         }
       });

       // 맨 위 처리 (Home 활성화)
       if (!foundActive && scrollPosition < (sections[0]?.offsetTop - navHeight - 50 || 100)) {
          const homeLink = document.querySelector('.nav-links a[href="#home"]');
          if (homeLink) homeLink.classList.add('active');
       }
    };

    // 스크롤 이벤트 리스너 최적화 (Throttle) - 필요시 적용
    // let scrollTimeout;
    // window.addEventListener('scroll', () => {
    //    if (scrollTimeout) return;
    //    scrollTimeout = setTimeout(() => {
    //        scrollSpyHandler();
    //        scrollTimeout = null;
    //    }, 100); // 100ms 간격으로 실행
    // });
    window.addEventListener('scroll', scrollSpyHandler); // 기본

    window.addEventListener('load', scrollSpyHandler); // 초기 로드 시 실행
}

function setupTypingEffect() {
    // ... (기존 타이핑 효과 로직) ...
     const textElement = document.querySelector('.hero-title'); // h1 선택 (예시)
     if (textElement) {
       // data-typing-text 속성에 원래 텍스트 저장 추천
       const originalHtml = textElement.innerHTML; // <br> 유지 위해 innerHTML 사용
       const textToType = textElement.textContent.replace(/\s+/g, ' ').trim(); // 순수 텍스트 추출
       textElement.innerHTML = ''; // 내용 비우기 (커서 효과 등 추가 가능)
       let i = 0;

       const typeWriter = () => {
         if (i < textToType.length) {
           // 한 글자씩 추가 (innerHTML을 사용하면 <br> 같은 태그 처리가 복잡해짐)
           // textContent로 우선 처리하고, 필요시 커서 효과 등을 별도로 구현
           textElement.textContent += textToType.charAt(i);
           i++;
           setTimeout(typeWriter, 70); // 타이핑 속도 조절
         } else {
             // 타이핑 완료 후 <br> 등 원래 HTML 구조 복원 (선택적)
             // textElement.innerHTML = originalHtml;
             // 또는 커서 제거 등 후처리
         }
       };
       // 페이지 로드 후 약간의 지연 시간을 두고 시작
       setTimeout(typeWriter, 1000);
     }
}
