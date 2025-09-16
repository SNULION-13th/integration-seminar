// main.js
//<img src=x onerror="alert('echo hi~')"></img>
//<div tabindex="0" onkeydown="console.log(event.key)"><img src = x ></img></div>

const baseurl = "http://localhost:8000";

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
      document.getElementById(
        "result"
      ).innerHTML = `<p style='color:red;'>Error: ${err}</p>`;
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

function fetchAllItems() {
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
      document.getElementById(
        "result"
      ).innerHTML = `<p style='color:red;'>Error: ${err}</p>`;
    });
}

// function renderResults(items) {
//   const container = document.getElementById("result");
//   if (!items || items.length === 0) {
//     container.innerHTML = "<p>결과가 없습니다.</p>";
//     return;
//   }
//   container.innerHTML = items
//     .map((item) => {
//       const imgTag = item.image_path
//         ? `<img src="${baseurl}/${item.image_path}" style="max-width:100px;" />`
//         : "";
//       return `
//         <div class="card">
//           <h4>${item.title}</h4>
//           <p>${item.description || ""}</p>
//           ${imgTag}<br/>
//           <small style="color:#666;">${
//             item.created_at ? formatDateTime(item.created_at) : ""
//           }</small>
//         </div>
//       `;
//     })
//     .join("");
// }

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderResults(items) {
  const container = document.getElementById("result");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.textContent = "결과가 없습니다.";
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const safeTitle = escapeHTML(item.title);
      const safeDesc = escapeHTML(item.description || "");
      const safeDate = item.created_at ? formatDateTime(item.created_at) : "";

      const imgTag = item.image_path
        ? `<img src="${baseurl}/${escapeHTML(
            item.image_path
          )}" style="max-width:100px;" />`
        : "";

      return `
        <div class="card">
          <h4>${safeTitle}</h4>
          <p>${safeDesc}</p>
          ${imgTag}<br/>
          <small style="color:#666;">${safeDate}</small>
        </div>
      `;
    })
    .join("");
}
