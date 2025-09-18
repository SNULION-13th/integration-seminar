// main.js

// 과제 1 완료
// 1-1번 과제 : <img src="df" onerror="alert('echo hi~')">
// 1-2번 과제 : <img src="df" onerror="document.onkeydown = function(e) {console.log('입력된 키:', e.key); }">

// 이 파일 자체가 도커파일 형태로 컨테이너에서 돌아가고 있는 느낌이라.. 바로 반영이 당연히 안되고
// docker compose up --build -d를 해줘야함.

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
  // TODO: 실제 서버에 GET 요청을 보내야 함
  const query = document.getElementById("query").value; // query에는 '검색어'가 들어간다.
  fetch(`${baseurl}/search?query=${encodeURIComponent(query)}`) // 검색어를 url로 인코딩해주는 함수.
    // elasticsearch 서버에서 api를 만들때 애초에 이렇게 쿼리식으로 받도록 만들어진 느낌이라서.
    .then((response) => response.json()) // response를 json 형태로. then 함수는 자동으로 앞의 반환값을 인자로 받는 함수.
    .then((data) => {
      // 이전의 반환값이 json이 data로 들어감.
      if (Array.isArray(data.results)) {
        renderResults(data.results); // 결과가 배열이면 렌더링
        // 렌더링은 이미 검색된 모~든 아이템에 대해서 렌더링을 하도록 구현되어서, 전체검색에서도 그냥 그대로 활용 가능.
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

// searchItems와 비슷하게 searchAllItems를 만들 수 있다.
// 문제는 mysql 서버와의 api를 먼저 만들어야하는 것.
// 사실상 앞의 함수에서 fetch하는 api 주소만 바꾸면 됨.

function searchAllItems() {
  fetch(`${baseurl}/search/items/all`) // 백엔드 라우터 프리픽스(`/search`)와 일치시킴
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
  if (!items || items.length === 0) {
    container.innerHTML = "<p>없습니다.</p>";
    return;
  }
  container.innerHTML = items
    .map((item) => {
      const imgTag = item.image_path
        ? `<img src="${baseurl}/${item.image_path}" style="max-width:100px;" />`
        : "";
      return `
        <div class="card">
          <h4>${item.title
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")}</h4>
          <p>${
            item.description
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;") || ""
          }</p>
          ${imgTag}<br/>
          <small style="color:#666;">${
            item.created_at ? formatDateTime(item.created_at) : ""
          }</small>
        </div>
      `;
    })
    .join("");
}
