// main.js

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

  // TODO: 실제 서버에 POST 요청을 보내야 함
  const now = new Date();
  formData.append("created_at", now.toISOString());

  const newItem = Object.fromEntries(formData.entries());
  renderResults([newItem]);
}

function searchItems() {
  // TODO: 실제 서버에 GET 요청을 보내야 함
  const query = document.getElementById("query").value;
  alert(`아직 검색 기능이 구현되지 않았습니다.\nquery=${query}`);
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
      const imgTag = item.image_path
        ? `<img src="${item.image_path}" style="max-width:100px;" />`
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
