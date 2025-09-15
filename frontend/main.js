// main.js - XSS 보안 강화 버전

const baseurl = "http://localhost:8000";

// XSS 방지를 위한 HTML 이스케이프 함수
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, function(m) {
    return map[m];
  });
}

// 안전한 텍스트 노드 생성 함수
function createTextNode(text) {
  return document.createTextNode(text || '');
}

// 안전한 HTML 요소 생성 함수
function createSafeElement(tagName, textContent, className = '') {
  const element = document.createElement(tagName);
  element.textContent = textContent || '';
  if (className) {
    element.className = className;
  }
  return element;
}

function addItem() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("desc").value;

  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);

  const fileInput = document.getElementById("image");
  if (fileInput.files.length > 0) {
    formData.append("image", fileInput.files[0]);
  }

  // 기존의 dummy code를 삭제하고 아래로 대체
  fetch(`${baseurl}/items`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      renderResults([data]);
    })
    .catch((err) => {
      // 에러 메시지도 안전하게 표시
      const resultContainer = document.getElementById("result");
      resultContainer.innerHTML = '';
      const errorElement = createSafeElement('p', `Error: ${err}`, 'error-message');
      errorElement.style.color = 'red';
      resultContainer.appendChild(errorElement);
    });
}

function searchItems() {
  // TODO: 실제 서버에 GET 요청을 보내야 함
  const query = document.getElementById("query").value;
  fetch(`${baseurl}/search/?query=${encodeURIComponent(query)}`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data.results)) {
        renderResults(data.results);
      } else {
        renderResults([]);
      }
    })
    .catch((err) => {
      // 에러 메시지도 안전하게 표시
      const resultContainer = document.getElementById("result");
      resultContainer.innerHTML = '';
      const errorElement = createSafeElement('p', `Error: ${err}`, 'error-message');
      errorElement.style.color = 'red';
      resultContainer.appendChild(errorElement);
    });
}

function showAllItems() {
  // MySQL에서 최신순으로 전체 게시글 조회
  fetch(`${baseurl}/items/`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        renderResults(data);
      } else {
        renderResults([]);
      }
    })
    .catch((err) => {
      // 에러 메시지도 안전하게 표시
      const resultContainer = document.getElementById("result");
      resultContainer.innerHTML = '';
      const errorElement = createSafeElement('p', `Error: ${err}`, 'error-message');
      errorElement.style.color = 'red';
      resultContainer.appendChild(errorElement);
    });
}

function formatDateTime(isoStr) {
  const isoWithZ = isoStr.endsWith("Z") ? isoStr : isoStr + "Z";
  const _datetime = new Date(isoWithZ);

  const year = _datetime.getFullYear();
  const month = String(_datetime.getMonth() + 1).padStart(2, "0");
  const date = String(_datetime.getDate()).padStart(2, "0");
  const hour = String(_datetime.getHours()).padStart(2, "0");
  const minute = String(_datetime.getMinutes()).padStart(2, "0");
  const second = String(_datetime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}

// XSS 보안 강화된 renderResults 함수
function renderResults(items) {
  const container = document.getElementById("result");
  
  // 기존 내용 완전히 제거
  container.innerHTML = '';
  
  if (!items || items.length === 0) {
    const noResultsElement = createSafeElement('p', '결과가 없습니다.');
    container.appendChild(noResultsElement);
    return;
  }

  items.forEach((item) => {
    // 카드 컨테이너 생성
    const cardElement = createSafeElement('div', '', 'card');
    
    // 제목 생성 (안전하게)
    const titleElement = createSafeElement('h4', item.title);
    cardElement.appendChild(titleElement);
    
    // 설명 생성 (안전하게)
    if (item.description) {
      const descElement = createSafeElement('p', item.description);
      cardElement.appendChild(descElement);
    }
    
    // 이미지 생성 (안전하게)
    if (item.image_path) {
      const imgElement = document.createElement('img');
      imgElement.src = `${baseurl}/${escapeHtml(item.image_path)}`;
      imgElement.style.maxWidth = '100px';
      imgElement.style.marginTop = '10px';
      imgElement.style.display = 'block';
      cardElement.appendChild(imgElement);
    }
    
    // 날짜 생성 (안전하게)
    if (item.created_at) {
      const dateElement = createSafeElement('small', formatDateTime(item.created_at));
      dateElement.style.color = '#666';
      dateElement.style.display = 'block';
      dateElement.style.marginTop = '10px';
      cardElement.appendChild(dateElement);
    }
    
    // 카드를 컨테이너에 추가
    container.appendChild(cardElement);
  });
}