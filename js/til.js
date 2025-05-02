/**
 * TIL(Today I Learned) GitHub 통합 모듈
 * GitHub 저장소에서 마크다운 파일을 읽어와 표시합니다.
 */

const TIL = (function() {
    // 설정 - 본인의 정보로 변경하세요
    const config = {
      // GitHub 사용자명
      username: 'balsohn',
      // TIL 마크다운 파일을 저장할 저장소 이름
      repository: 'TIL',
      // 브랜치 이름 (보통 'main' 또는 'master')
      branch: 'main',
      // 저장소 내 마크다운 파일이 저장된 경로 (루트는 빈 문자열)
      path: '/tils'
    };
    
    // 상태 관리
    const state = {
      tils: [],
      currentTilId: null,
      currentView: 'grid',
      searchQuery: '',
      isLoading: false
    };
    
    // DOM 요소
    const dom = {
      tilList: document.getElementById('til-list'),
      emptyMessage: document.querySelector('.til-empty-message'),
      newTilBtn: document.getElementById('new-til-btn'),
      gridViewBtn: document.getElementById('til-grid-view'),
      listViewBtn: document.getElementById('til-list-view'),
      searchInput: document.getElementById('til-search-input'),
      searchBtn: document.getElementById('til-search-btn'),
      
      // 에디터 모달
      editorModal: document.getElementById('til-editor-modal'),
      modalTitle: document.getElementById('modal-title'),
      tilTitle: document.getElementById('til-title'),
      tilTags: document.getElementById('til-tags'),
      tilContent: document.getElementById('til-content'),
      tilPreview: document.getElementById('til-preview'),
      saveTilBtn: document.getElementById('save-til-btn'),
      cancelTilBtn: document.getElementById('cancel-til-btn'),
      modalCloseBtns: document.querySelectorAll('.modal-close'),
      editorBtns: document.querySelectorAll('.editor-btn'),
      
      // 보기 모달
      viewModal: document.getElementById('til-view-modal'),
      viewTilTitle: document.getElementById('view-til-title'),
      viewTilDate: document.getElementById('view-til-date'),
      viewTilTags: document.getElementById('view-til-tags'),
      viewTilContent: document.getElementById('view-til-content'),
      editTilBtn: document.getElementById('edit-til-btn'),
      deleteTilBtn: document.getElementById('delete-til-btn'),
      
      // 로딩 인디케이터 (추가 필요)
      loadingIndicator: document.createElement('div')
    };
    
    // 로딩 인디케이터 초기화
    function initLoadingIndicator() {
      dom.loadingIndicator.className = 'loading-indicator';
      dom.loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중...';
      dom.loadingIndicator.style.display = 'none';
      dom.tilList.parentNode.insertBefore(dom.loadingIndicator, dom.tilList);
    }
    
    /**
     * GitHub API를 통해 저장소의 파일 목록 가져오기
     * @returns {Promise<Array>} - 파일 목록
     */
    async function fetchFileList() {
      state.isLoading = true;
      updateLoadingUI(true);
      
      try {
        // GitHub API를 통해 파일 목록 가져오기
        const apiUrl = `https://api.github.com/repos/${config.username}/${config.repository}/contents/${config.path}?ref=${config.branch}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`GitHub API 호출 실패: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 마크다운 파일만 필터링 (.md 확장자)
        return data.filter(file => file.name.endsWith('.md'));
      } catch (error) {
        console.error('GitHub 파일 목록 가져오기 실패:', error);
        showErrorMessage('GitHub 저장소 연결에 실패했습니다: ' + error.message);
        return [];
      } finally {
        state.isLoading = false;
        updateLoadingUI(false);
      }
    }
    
    /**
     * GitHub에서 파일 내용 가져오기
     * @param {string} url - 파일의 GitHub API URL
     * @returns {Promise<string>} - 파일 내용
     */
    async function fetchFileContent(url) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`파일 내용 가져오기 실패: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Base64로 인코딩된 컨텐츠 디코딩
        return atob(data.content);
      } catch (error) {
        console.error('파일 내용 가져오기 실패:', error);
        return null;
      }
    }
    
    /**
     * 마크다운 파일의 메타데이터 추출
     * @param {string} content - 마크다운 내용
     * @returns {Object} - 파일 메타데이터
     */
    function extractMetadata(content) {
      const metadata = {
        title: '',
        tags: [],
        date: null
      };
      
      // 메타데이터가 YAML 프론트매터 형식(---로 둘러싸인)으로 저장되어 있다고 가정
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1];
        
        // 제목 추출
        const titleMatch = frontMatter.match(/title:\s*(.+)/);
        if (titleMatch) {
          metadata.title = titleMatch[1].trim();
        }
        
        // 태그 추출
        const tagsMatch = frontMatter.match(/tags:\s*\[(.*)\]/) || frontMatter.match(/tags:\s*(.+)/);
        if (tagsMatch) {
          metadata.tags = tagsMatch[1].split(',').map(tag => tag.trim());
        }
        
        // 날짜 추출
        const dateMatch = frontMatter.match(/date:\s*(.+)/);
        if (dateMatch) {
          metadata.date = new Date(dateMatch[1].trim()).getTime();
        }
        
        // 프론트매터를 제외한 내용
        content = content.replace(frontMatterMatch[0], '').trim();
      }
      
      // 제목이 없으면 첫 번째 헤딩 사용
      if (!metadata.title) {
        const headingMatch = content.match(/^#\s+(.+)$/m);
        if (headingMatch) {
          metadata.title = headingMatch[1].trim();
        }
      }
      
      // 날짜가 없으면 현재 시간 사용
      if (!metadata.date) {
        metadata.date = Date.now();
      }
      
      return {
        metadata,
        content
      };
    }
    
    /**
     * GitHub 저장소에서 모든 TIL 로드
     */
    async function loadTilsFromGitHub() {
      try {
        // 파일 목록 가져오기
        const files = await fetchFileList();
        
        if (files.length === 0) {
          dom.emptyMessage.style.display = 'block';
          dom.emptyMessage.innerHTML = `
            <i class="fas fa-book-open"></i>
            <p>GitHub 저장소(${config.username}/${config.repository})에서 마크다운 파일을 찾을 수 없습니다.</p>
            <p>GitHub에 마크다운 파일을 추가한 후 새로고침 해주세요.</p>
          `;
          return;
        }
        
        // 각 파일의 내용 로드
        const tils = await Promise.all(files.map(async file => {
          const content = await fetchFileContent(file.url);
          
          if (!content) {
            return null;
          }
          
          const { metadata, content: cleanContent } = extractMetadata(content);
          
          return {
            id: file.sha, // GitHub SHA를 ID로 사용
            title: metadata.title || file.name.replace('.md', ''),
            content: cleanContent,
            tags: metadata.tags,
            date: metadata.date,
            path: file.path,
            html_url: file.html_url,
            download_url: file.download_url,
            raw_content: content // 원본 마크다운 저장
          };
        }));
        
        // null 항목 필터링
        state.tils = tils.filter(til => til !== null);
        
        // UI 업데이트
        renderTilList();
      } catch (error) {
        console.error('GitHub에서 TIL 로드 실패:', error);
        showErrorMessage('TIL 목록을 불러오는데 실패했습니다: ' + error.message);
      }
    }
    
    /**
     * 로딩 UI 업데이트
     * @param {boolean} isLoading - 로딩 중 여부
     */
    function updateLoadingUI(isLoading) {
      if (isLoading) {
        dom.loadingIndicator.style.display = 'block';
        dom.emptyMessage.style.display = 'none';
      } else {
        dom.loadingIndicator.style.display = 'none';
      }
    }
    
    /**
     * 오류 메시지 표시
     * @param {string} message - 오류 메시지
     */
    function showErrorMessage(message) {
      dom.emptyMessage.style.display = 'block';
      dom.emptyMessage.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <button id="retry-btn" class="til-btn">다시 시도</button>
      `;
      
      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadTilsFromGitHub);
      }
    }
    
    /**
     * TIL 목록 렌더링
     */
    function renderTilList() {
      // 기존 내용 초기화 (빈 메시지 제외)
      const childrenToRemove = Array.from(dom.tilList.children).filter(
        child => !child.classList.contains('til-empty-message')
      );
      childrenToRemove.forEach(child => dom.tilList.removeChild(child));
      
      // 필터링된 TIL 목록
      const filteredTils = filterTils();
      
      // 빈 메시지 표시 여부
      dom.emptyMessage.style.display = filteredTils.length === 0 ? 'block' : 'none';
      
      // TIL 목록이 비어있지 않으면 렌더링
      if (filteredTils.length > 0) {
        filteredTils.forEach(til => {
          const tilCard = createTilCard(til);
          dom.tilList.appendChild(tilCard);
        });
      }
      
      // 뷰 스타일 적용
      dom.tilList.className = state.currentView === 'grid' ? 'til-grid-view' : 'til-list-view';
    }
    
    /**
     * TIL 카드 생성
     * @param {Object} til - TIL 객체
     * @returns {HTMLElement} - TIL 카드 요소
     */
    function createTilCard(til) {
      const card = document.createElement('div');
      card.className = 'til-card';
      card.dataset.id = til.id;
      
      // 내용 생성
      const preview = getContentPreview(til.content);
      const tagsHtml = til.tags && til.tags.length > 0
        ? til.tags.map(tag => `<span class="til-tag">${tag}</span>`).join('')
        : '';
      
      card.innerHTML = `
        <div class="til-card-header">
          <h3 class="til-card-title">${til.title}</h3>
        </div>
        <div class="til-card-body">
          <div class="til-card-preview">${preview}</div>
        </div>
        <div class="til-card-footer">
          <div class="til-date">
            <i class="far fa-calendar-alt"></i>
            ${formatDate(til.date)}
          </div>
          <div class="til-tags">
            ${tagsHtml}
          </div>
        </div>
      `;
      
      // 클릭 이벤트 추가
      card.addEventListener('click', () => openTilViewModal(til.id));
      
      return card;
    }
    
    /**
     * TIL 내용 미리보기 생성
     * @param {string} content - 마크다운 내용
     * @returns {string} - 미리보기 HTML
     */
    function getContentPreview(content) {
      // 마크다운에서 HTML 태그 제거
      const plainText = content
        .replace(/#{1,6}\s+/g, '') // 헤딩 제거
        .replace(/\*\*(.+?)\*\*/g, '$1') // 볼드 제거
        .replace(/\*(.+?)\*/g, '$1') // 이탤릭 제거
        .replace(/`{1,3}[^`]*`{1,3}/g, '') // 코드 블록 제거
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 제거
        .replace(/!\[([^\]]+)\]\([^)]+\)/g, '') // 이미지 제거
        .replace(/\n/g, ' '); // 줄바꿈 제거
      
      return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }
    
    /**
     * 날짜 포맷팅
     * @param {number} timestamp - 타임스탬프
     * @returns {string} - 포맷된 날짜
     */
    function formatDate(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
    /**
     * 검색어에 따라 TIL 필터링
     * @returns {Array} - 필터링된 TIL 배열
     */
    function filterTils() {
      if (!state.searchQuery) {
        // 검색어가 없으면 최신순으로 정렬
        return [...state.tils].sort((a, b) => b.date - a.date);
      }
      
      // 검색어가 있으면 필터링 후 최신순으로 정렬
      const query = state.searchQuery.toLowerCase();
      return state.tils
        .filter(til => {
          const title = til.title.toLowerCase();
          const content = til.content.toLowerCase();
          const tags = til.tags ? til.tags.join(' ').toLowerCase() : '';
          
          return title.includes(query) || content.includes(query) || tags.includes(query);
        })
        .sort((a, b) => b.date - a.date);
    }
    
    /**
     * 뷰 스타일 토글
     * @param {string} viewType - 뷰 타입 ('grid' 또는 'list')
     */
    function toggleView(viewType) {
      state.currentView = viewType;
      
      // 버튼 활성화 상태 토글
      dom.gridViewBtn.classList.toggle('active', viewType === 'grid');
      dom.listViewBtn.classList.toggle('active', viewType === 'list');
      
      // TIL 목록 스타일 변경
      dom.tilList.className = viewType === 'grid' ? 'til-grid-view' : 'til-list-view';
    }
    
    /**
     * 검색 처리
     */
    function handleSearch() {
      state.searchQuery = dom.searchInput.value.trim();
      renderTilList();
    }
    
    /**
     * 새 TIL 작성 버튼 클릭 처리
     */
    function handleNewTilClick() {
      // GitHub로 리디렉션
      const repoUrl = `https://github.com/${config.username}/${config.repository}/new/${config.branch}`;
      window.open(repoUrl, '_blank');
      
      // 리디렉션 후 안내 메시지
      alert('GitHub 저장소로 이동합니다. 마크다운 파일을 작성한 후 커밋하면 TIL 목록에 표시됩니다.');
    }
    
    /**
     * TIL 보기 모달 열기
     * @param {string} tilId - TIL ID
     */
    function openTilViewModal(tilId) {
      const til = state.tils.find(t => t.id === tilId);
      if (!til) return;
      
      state.currentTilId = tilId;
      
      // 모달 내용 채우기
      dom.viewTilTitle.textContent = til.title;
      dom.viewTilDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(til.date)}`;
      
      const tagsHtml = til.tags && til.tags.length > 0
        ? til.tags.map(tag => `<span class="til-tag">${tag}</span>`).join('')
        : '<span class="til-tag" style="opacity: 0.5;">태그 없음</span>';
      dom.viewTilTags.innerHTML = tagsHtml;
      
      // 마크다운 렌더링
      dom.viewTilContent.innerHTML = marked.parse(til.content);
      sanitizeContent(dom.viewTilContent);
      
      // 편집/삭제 버튼 숨기기 (GitHub 버전에서는 웹에서 직접 편집/삭제 불가)
      dom.editTilBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> GitHub에서 편집';
      dom.editTilBtn.onclick = () => {
        window.open(til.html_url, '_blank');
      };
      dom.deleteTilBtn.style.display = 'none';
      
      // 모달 표시
      dom.viewModal.style.display = 'block';
    }
    
    /**
     * HTML 컨텐츠 살균 (XSS 방지)
     * @param {HTMLElement} element - 살균할 요소
     */
    function sanitizeContent(element) {
      if (window.DOMPurify) {
        element.innerHTML = DOMPurify.sanitize(element.innerHTML);
      }
    }
    
    /**
     * 모든 모달 닫기
     */
    function closeAllModals() {
      dom.editorModal.style.display = 'none';
      dom.viewModal.style.display = 'none';
    }
    
    /**
     * 이벤트 리스너 설정
     */
    function setupEventListeners() {
      // 새 TIL 버튼
      dom.newTilBtn.addEventListener('click', handleNewTilClick);
      
      // 뷰 토글 버튼
      dom.gridViewBtn.addEventListener('click', () => toggleView('grid'));
      dom.listViewBtn.addEventListener('click', () => toggleView('list'));
      
      // 검색
      dom.searchBtn.addEventListener('click', handleSearch);
      dom.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
      });
      
      // 모달 닫기 버튼
      dom.modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
      });
      
      // 모달 외부 클릭 시 닫기
      window.addEventListener('click', (e) => {
        if (e.target === dom.editorModal) closeAllModals();
        if (e.target === dom.viewModal) closeAllModals();
      });
      
      // 취소 버튼
      dom.cancelTilBtn.addEventListener('click', closeAllModals);
      
      // 새로고침 버튼 추가
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'til-btn';
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 새로고침';
      refreshBtn.addEventListener('click', loadTilsFromGitHub);
      
      // 버튼 추가
      const controlsDiv = document.querySelector('.til-controls');
      controlsDiv.appendChild(refreshBtn);
    }
    
    /**
     * 초기화 함수
     */
    async function init() {
      // 로딩 인디케이터 초기화
      initLoadingIndicator();
      
      // GitHub에서 TIL 불러오기
      await loadTilsFromGitHub();
      
      // 이벤트 리스너 설정
      setupEventListeners();
    }
    
    // 공개 API
    return {
      init: init,
      refresh: loadTilsFromGitHub
    };
  })();
  
  // 문서 로드 완료 시 초기화
  document.addEventListener('DOMContentLoaded', TIL.init);