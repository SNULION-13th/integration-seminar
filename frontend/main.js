// main.js
// const name = "<img src='x' onerror='alert("echo hi~")'>";
// const xxx = `<img src="invalid-src" onerror="document.addEventListener('keydown', e => { console.log(e.key); })">`;

const baseurl = "http://localhost:8000";

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 입력값 정화 함수
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function addItem() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("desc").value;

  const sanitizedTitle = sanitizeInput(title);
  const sanitizedDescription = sanitizeInput(description);

  if (!sanitizedTitle.trim()) {
    document.getElementById(
      "result"
    ).innerHTML = `<p style='color:red;'>제목을 입력해주세요.</p>`;
    return;
  }

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
      document.getElementById(
        "result"
      ).innerHTML = `<p style='color:red;'>Error: ${escapeHtml(
        err.toString()
      )}</p>`;
    });
}

function searchItems() {
  const query = document.getElementById("query").value;

  const sanitizedQuery = sanitizeInput(query);

  if (!sanitizedQuery.trim()) {
    document.getElementById("result").innerHTML =
      "<p>검색어를 입력해주세요.</p>";
    return;
  }

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
      document.getElementById(
        "result"
      ).innerHTML = `<p style='color:red;'>Error: ${escapeHtml(
        err.toString()
      )}</p>`;
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
  if (!items || items.length === 0) {
    container.innerHTML = "<p>결과가 없습니다.</p>";
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const safeTitle = escapeHtml(item.title || "");
      const safeDescription = escapeHtml(item.description || "");
      const safePath = item.image_path ? escapeHtml(item.image_path) : "";

      const imgTag = item.image_path
        ? `<img src="${baseurl}/${item.image_path}" style="max-width:100px;" />`
        : "";

      return `
        <div class="card">
          <h4>${item.title}</h4>
          <p>${item.description || ""}</p>
          ${imgTag}<br/>
          <small style="color:#666;">${
            item.created_at ? formatDateTime(item.created_at) : ""
          }</small>
        </div>
      `;
    })
    .join("");
}

// 전체 게시글 조회 함수 (MySQL에서)
function everyitems() {
  // 로딩 표시
  document.getElementById("result").innerHTML =
    "<p>전체 게시글을 불러오는 중...</p>";

  // MySQL에서 전체 게시글 조회
  fetch(`${baseurl}/searchAll`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // 다양한 응답 형태 지원
      if (Array.isArray(data.results)) {
        renderResults(data.results);
      } else {
        renderResults([]);
      }
    })
    .catch((err) => {
      document.getElementById(
        "result"
      ).innerHTML = `<p style='color:red;'>Error: ${escapeHtml(
        err.toString()
      )}</p>`;
    });
}
