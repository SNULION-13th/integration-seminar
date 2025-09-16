// main.js

// 1. alert('echo hi~') 실행: <script>alert('echo hi~')</script>
// 2. 키보드 로깅: <script>document.addEventListener('keydown', e => console.log(e.key))</script>

const baseurl = "http://localhost:8000";

// XSS 방어를 위한 HTML 이스케이프 함수
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 안전한 DOM 조작을 위한 함수
function setTextContent(element, text) {
  element.textContent = text;
}

// 안전한 에러 메시지 표시 함수
function showError(message) {
  const resultElement = document.getElementById("result");
  resultElement.innerHTML = "";
  const errorP = document.createElement("p");
  errorP.style.color = "red";
  setTextContent(errorP, `Error: ${message}`);
  resultElement.appendChild(errorP);
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

  fetch(`${baseurl}/items`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      renderResults([data]);
    })
    .catch((err) => {
      showError(err.message || "Unknown error occurred");
    });
}

function searchItems() {
  const query = document.getElementById("query").value;
  fetch(`${baseurl}/search?query=${encodeURIComponent(query)}`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data.results)) {
        renderResults(data.results);
      } else {
        renderResults([]);
      }
    })
    .catch((err) => {
      showError(err.message || "Search failed");
    });
}

function showAllItems() {
  fetch(`${baseurl}/items`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        renderResults(data);
      } else {
        renderResults([]);
      }
    })
    .catch((err) => {
      showError(err.message || "Failed to load items");
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

function renderResults(items) {
  const container = document.getElementById("result");

  // 기존 내용을 완전히 지우기
  container.innerHTML = "";

  if (!items || items.length === 0) {
    const noResultsP = document.createElement("p");
    setTextContent(noResultsP, "결과가 없습니다.");
    container.appendChild(noResultsP);
    return;
  }

  // 각 아이템을 안전하게 렌더링
  items.forEach((item) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";

    // 제목 - XSS 방어 적용
    const titleH4 = document.createElement("h4");
    setTextContent(titleH4, item.title || "");
    cardDiv.appendChild(titleH4);

    // 설명 - XSS 방어 적용
    if (item.description) {
      const descP = document.createElement("p");
      setTextContent(descP, item.description);
      cardDiv.appendChild(descP);
    }

    // 이미지 (이미지 경로는 서버에서 검증된 것만 사용)
    if (item.image_path) {
      const img = document.createElement("img");
      img.src = `${baseurl}/${item.image_path}`;
      img.style.maxWidth = "100px";
      img.alt = "Item image";
      cardDiv.appendChild(img);
      cardDiv.appendChild(document.createElement("br"));
    }

    // 생성 시간 - XSS 방어 적용
    if (item.created_at) {
      const timeSmall = document.createElement("small");
      timeSmall.style.color = "#666";
      setTextContent(timeSmall, formatDateTime(item.created_at));
      cardDiv.appendChild(timeSmall);
    }

    container.appendChild(cardDiv);
  });
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", function () {
  console.log("XSS 방어가 활성화된 Dashboard가 로드되었습니다.");
});
