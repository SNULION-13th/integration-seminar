// XSS 공격 검색어
// 1. <img src=x onerror=alert('echo hi~')>
// 2. <img src=x onerror="window.addEventListener('keydown', e => console.log(e.key))">

const baseurl = "http://localhost:8000";

function escapeHtml(text) {
  if (typeof text !== "string") return text;
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function setTextContent(element, text) {
  element.textContent = text;
}

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
    container.textContent = "결과가 없습니다.";
    return;
  }
  container.innerHTML = items
    .map((item) => {
      // 이미지 경로만 src에 직접 할당, 나머지는 escape 처리
      const imgTag = item.image_path
        ? `<img src="${baseurl}/${escapeHTML(
            item.image_path
          )}" style="max-width:100px;" />`
        : "";
      return `
        <div class="card">
          <h4>${escapeHTML(item.title)}</h4>
          <p>${escapeHTML(item.description || "")}</p>
          ${imgTag}<br/>
          <small style="color:#666;">${
            item.created_at ? escapeHTML(formatDateTime(item.created_at)) : ""
          }</small>
        </div>
      `;
    })
    .join("");
}

function getAllItems() {
  fetch(`${baseurl}/items/all`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data.results)) {
        renderResults(data.results);
      } else {
        renderResults([]);
      }
    })
    .catch((err) => {
      showError(err.message || "Failed to load items");
    });
}

window.getAllItems = getAllItems;
window.searchItems = searchItems;
window.addItem = addItem;
