// main.js
// <svg onload="alert(echo hi~)"/>
// <img src="fakeurl" onerror="window.addEventListener('keydown', (e)=>console.log(e.key))">

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

  fetch(`${baseurl}/items`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      renderResults([data]);
    })
    .catch((err) => {
      const output = document.getElementById("result");
      output.textContent = `Error: ${err}`;
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
      const output = document.getElementById("result");
      output.textContent = `Error: ${err}`;
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

function showAll() {
  console.log("called showAll()");
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
      const output = document.getElementById("result");
      output.textContent = `Error: ${err}`;
    });
}

function renderResults(items) {
  const container = document.getElementById("result");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    const p = document.createElement("p");
    p.textContent = "결과가 없습니다.";
    container.appendChild(p);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h4");
    title.textContent = item.title || "";
    card.appendChild(title);

    const description = document.createElement("p");
    description.textContent = item.description || "";
    card.appendChild(description);

    if (item.image_path) {
      const img = document.createElement("img");
      img.src = `${baseurl}/${item.image_path}`;
      img.style.maxWidth = "100px";
      card.appendChild(img);
      card.appendChild(document.createElement("br"));
    }

    if (item.created_at) {
      const small = document.createElement("small");
      small.style.color = "#666";
      small.textContent = formatDateTime(item.created_at);
      card.appendChild(small);
    }

    container.appendChild(card);
  });
}
