//    <script>alert('echo hi~')</script>
//    <script>document.addEventListener('keydown', e => console.log(e.key))</script>

// main.js
const baseurl = "http://localhost:8000";

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeImageUrl(pathOrUrl) {
  if (!pathOrUrl) return false;
  try {
    const url = new URL(pathOrUrl, baseurl);
    return (
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      url.protocol === "data:"
    );
  } catch (e) {
    return false;
  }
}

function showAllItems() {
  fetch(`${baseurl}/items/all`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data.results)) {
        renderResults(data.results);
      } else if (Array.isArray(data)) {
        renderResults(data);
      } else {
        renderResults([]);
      }
    })
    .catch((err) => {
      const container = document.getElementById("result");
      container.innerHTML = "";
      const p = document.createElement("p");
      p.style.color = "red";
      p.textContent = `Error: ${String(err)}`;
      container.appendChild(p);
    });
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
      const container = document.getElementById("result");
      container.innerHTML = ""; // 기존 내용 제거
      const p = document.createElement("p");
      p.style.color = "red";
      p.textContent = `Error: ${String(err)}`; // textContent 사용 -> XSS 방지
      container.appendChild(p);
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
      const container = document.getElementById("result");
      container.innerHTML = ""; // 기존 내용 제거
      const p = document.createElement("p");
      p.style.color = "red";
      p.textContent = `Error: ${String(err)}`; // textContent 사용 -> XSS 방지
      container.appendChild(p);
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
  container.innerHTML = ""; // 초기화

  if (!items || items.length === 0) {
    const p = document.createElement("p");
    p.textContent = "결과가 없습니다.";
    container.appendChild(p);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    // 제목 (textContent로 안전하게)
    const h4 = document.createElement("h4");
    h4.textContent = item.title ? String(item.title) : "(제목 없음)";
    card.appendChild(h4);

    // 설명 (textContent)
    const p = document.createElement("p");
    p.textContent = item.description ? String(item.description) : "";
    card.appendChild(p);

    // 이미지 (URL 검증 후 추가)
    const rawImagePath = item.image_path ? `${baseurl}/${item.image_path}` : "";
    if (rawImagePath && isSafeImageUrl(rawImagePath)) {
      const img = document.createElement("img");
      img.style.maxWidth = "100px";
      img.src = rawImagePath;
      img.alt = item.title ? String(item.title) : "uploaded image";
      card.appendChild(img);
      card.appendChild(document.createElement("br"));
    }

    // 생성 시간 (textContent)
    const small = document.createElement("small");
    small.style.color = "#666";
    small.textContent = item.created_at ? formatDateTime(item.created_at) : "";
    card.appendChild(small);

    container.appendChild(card);
  });
}
