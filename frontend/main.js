// main.js
// <img src=x onerror=alert("echo&nbsp;hi~")>
// <img src=x onerror="document.addEventListener('keydown', function(e){ console.log(e.key) })">
const baseurl = "http://localhost:8000";

// 서버가 준 경로를 안전한 절대 URL로 변환 (javascript: 등 차단, 동일 오리진만 허용)
function safeURL(path) {
  try {
    // path가 절대든 상대든 baseurl 기준으로 URL 생성
    const base = new URL(baseurl);
    const u = new URL(String(path || ""), base);

    // 허용 프로토콜만
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;

    // 동일 오리진만 (필요 시 주석 처리 가능)
    if (u.origin !== base.origin) return null;

    return u.href;
  } catch {
    return null;
  }
}

// 결과 컨테이너를 안전하게 비우기
function clearContainer(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
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
      const box = document.getElementById("result");
      clearContainer(box);
      const p = document.createElement("p");
      p.style.color = "red";
      // 절대 innerHTML 쓰지 말 것
      p.textContent = `Error: ${String(
        err && err.message ? err.message : err
      )}`;
      box.appendChild(p);
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
      const box = document.getElementById("result");
      clearContainer(box);
      const p = document.createElement("p");
      p.style.color = "red";
      p.textContent = `Error: ${String(
        err && err.message ? err.message : err
      )}`;
      box.appendChild(p);
    });
}

function searchAll() {
  fetch(`${baseurl}/search/all`)
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
      ).innerHTML = `<p style='color:red;'>Error: ${err}</p>`;
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
  clearContainer(container);

  if (!items || items.length === 0) {
    const p = document.createElement("p");
    p.textContent = "결과가 없습니다.";
    container.appendChild(p);
    return;
  }

  for (const rawItem of items) {
    // 방어적 파싱: 객체 형태만 허용
    const item = {
      title: rawItem && typeof rawItem.title === "string" ? rawItem.title : "",
      description:
        rawItem && typeof rawItem.description === "string"
          ? rawItem.description
          : "",
      image_path:
        rawItem && typeof rawItem.image_path === "string"
          ? rawItem.image_path
          : "",
      created_at:
        rawItem && typeof rawItem.created_at === "string"
          ? rawItem.created_at
          : "",
    };

    const card = document.createElement("div");
    card.className = "card";

    // 제목 (텍스트 전용)
    const h4 = document.createElement("h4");
    h4.textContent = item.title;
    card.appendChild(h4);

    // 설명 (텍스트 전용)
    const p = document.createElement("p");
    p.textContent = item.description || "";
    card.appendChild(p);

    // 이미지 (URL 검증 + 안전 속성)
    if (item.image_path) {
      const href = safeURL(item.image_path);
      if (href) {
        const img = document.createElement("img");
        img.src = href;
        img.style.maxWidth = "100px";
        // 잠재적 리스크 감소용 권장 속성들
        img.decoding = "async";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.alt = ""; // 서버가 alt 제공 시 교체
        card.appendChild(img);
        card.appendChild(document.createElement("br"));
      }
    }

    // 날짜/시간 (텍스트 전용)
    const small = document.createElement("small");
    small.style.color = "#666";
    small.textContent = item.created_at ? formatDateTime(item.created_at) : "";
    card.appendChild(small);

    container.appendChild(card);
  }
}
