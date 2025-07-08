let isStarted = false;
let isPaused = false;
let isStopped = false;
let jsonData = null;
let currentIndex = 0;
let fileName = "";
let totalItems = 0;
let au_selection = false;
let idStart = null;
let idEnd = null;
let currentId = null;
let countId = null;
let currentIdDisplay = null;

document.addEventListener("DOMContentLoaded", function () {
  //ローデータ
  document.getElementById("roData").addEventListener("click", function () {
    load_jsonEpoca();
    document.getElementById("roData").classList.add("active");
    document.getElementById("autoCheck").classList.add("hidden");
    document.getElementById("createDatakeyId").classList.add("hidden");
    document.getElementById("done_log").style.display = "flex";
    document.getElementById("backSection").style.display = "flex";
  });

  document.getElementById("doneIdData").addEventListener("click", function () {
    showDoneIdData();
  });

  document
    .getElementById("clearDoneIdData")
    .addEventListener("click", function () {
      clearDoneIdData();
    });

  //自動チェックスル
  document.getElementById("autoCheck").addEventListener("click", function () {
    au_selection = true;
    load_jsonEpoca();
    document.getElementById("autoCheck").classList.add("active");
    document.getElementById("roData").classList.add("hidden");
    document.getElementById("createDatakeyId").classList.add("hidden");
    document.getElementById("result_log").style.display = "flex";
    document.getElementById("backSection").style.display = "flex";
  });

  document.getElementById("inputData").addEventListener("click", function () {
    showInputData();
  });

  document.getElementById("clearInput").addEventListener("click", function () {
    clearInputData();
  });

  document.getElementById("savedData").addEventListener("click", function () {
    showSavedData();
  });

  document.getElementById("clearData").addEventListener("click", function () {
    clearSavedData();
  });

  //自動作成スール
  document
    .getElementById("createDatakeyId")
    .addEventListener("click", function () {
      document.getElementById("createDatakeyId").classList.add("active");
      document.getElementById("autoCheck").classList.add("hidden");
      document.getElementById("roData").classList.add("hidden");
      document.getElementById("backSection").style.display = "flex";
      document.getElementById("datakey_control").classList.remove("hidden");
    });

  document
    .getElementById("createDatakeyBtn")
    .addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.runtime.sendMessage(
          {
            action: "injectContentScript",
            tabId: tabs[0].id,
          },
          function (response) {
            if (response?.status === "success") {
              createDatakey();
            } else {
              alert("Không inject được content.js vào trang này");
            }
          }
        );
      });
    });

  //Control Button
  document.getElementById("startBtn").addEventListener("click", function () {
    isStarted = true;
    isPaused = false;
    isStopped = false;
    document.getElementById("startBtn").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
    epoca_Main(jsonData);
  });

  document.getElementById("pauseBtn").addEventListener("click", function () {
    isPaused = !isPaused;
    if (isStarted) {
      this.textContent = isPaused ? "続行" : "ポーズ";
    }
  });

  document.getElementById("stopBtn").addEventListener("click", function () {
    isStopped = true;
    document.getElementById("controls").classList.add("hidden");
    document.getElementById("fileNameDisplay").textContent = "";
    document.getElementById("progressContainer").style.display = "none";
    document.getElementById("jsFileId").classList.add("hidden");
    document.getElementById("roData").classList.remove("hidden");
    document.getElementById("roData").classList.remove("active");
    document.getElementById("autoCheck").classList.remove("active");
    document.getElementById("autoCheck").classList.remove("hidden");
    document.getElementById("createDatakeyId").classList.remove("active");
    document.getElementById("createDatakeyId").classList.remove("hidden");
    document.getElementById("result_log").style.display = "none";
    document.getElementById("done_log").style.display = "none";
  });

  document
    .getElementById("confirmIdBtn")
    .addEventListener("click", function () {
      const startVal = parseInt(document.getElementById("idStartInput").value);
      const countVal = parseInt(document.getElementById("idCountInput").value);

      if (
        isNaN(startVal) ||
        isNaN(countVal) ||
        countVal <= 0 ||
        countVal > 100
      ) {
        alert("開始IDと件数を正しく入力してください。");
        return;
      }

      idStart = startVal;
      totalItems = countVal;
      idEnd = idStart + totalItems - 1;

      document.getElementById("progressContainer").style.display = "block";
      document.getElementById("controls").classList.remove("hidden");
      document.getElementById("idInputContainer").classList.add("hidden");

      const idDisplay = `▶ 開始ID: ${idStart}　／　件数: ${totalItems}件`;
      document.getElementById("selectedIdDisplay").textContent = idDisplay;
    });

  document.getElementById("backBtn").addEventListener("click", function () {
    // document.getElementById("roData").classList.remove("active");
    // document.getElementById("roData").classList.remove("hidden");
    // document.getElementById("autoCheck").classList.remove("active");
    // document.getElementById("autoCheck").classList.remove("hidden");
    document.getElementById("createDatakeyId").classList.remove("active");
    document.getElementById("createDatakeyId").classList.remove("hidden");

    document.getElementById("done_log").style.display = "none";
    document.getElementById("result_log").style.display = "none";
    document.getElementById("backSection").style.display = "none";

    document.getElementById("progressContainer").style.display = "none";
    document.getElementById("controls").classList.add("hidden");
    document.getElementById("datakey_control").classList.add("hidden");
    document.getElementById("jsFileId").classList.add("hidden");
    document.getElementById("idInputContainer").classList.add("hidden");
    document.getElementById("fileNameDisplay").textContent = "";
    document.getElementById("selectedIdDisplay").textContent = "";
    document.getElementById("idStartInput").value = "";
    document.getElementById("idCountInput").value = "";

    isStarted = false;
    isPaused = false;
    isStopped = false;
    jsonData = null;
    currentIndex = 0;
    fileName = "";
    totalItems = 0;
    au_selection = false;
    idStart = null;
    idEnd = null;
    currentId = null;
    countId = null;
    currentIdDisplay = null;
  });
});

function load_jsonEpoca() {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.addEventListener("change", function (event) {
    let file = event.target.files[0];
    if (!file) return;

    fileName = file.name;
    document.getElementById("fileNameDisplay").textContent = "📂 " + fileName;

    let reader = new FileReader();
    reader.onload = async function (e) {
      try {
        jsonData = JSON.parse(e.target.result);
        document.getElementById("fileNameDisplay").textContent =
          "📂 " + fileName;
        document.getElementById("progressBar").value = 0;
        document.getElementById("progressText").textContent = "進捗: 0%";
        document.getElementById("progressContainer").style.display = "none";
        document.getElementById("jsFileId").classList.remove("hidden");
        document.getElementById("idInputContainer").classList.remove("hidden");
      } catch (error) {
        alert("Err: JSONを読み取ることができません。!");
      }
    };

    reader.readAsText(file);
  });

  input.click();
}

function updateProgress(countId) {
  let progressBar = document.getElementById("progressBar");
  let progressText = document.getElementById("progressText");

  let progress = (countId / totalItems) * 100;
  progressBar.value = progress;
  progressText.textContent = `進捗: ${Math.round(progress)}%`;
}

function saveDoneIdData(data) {
  let savedResults = JSON.parse(localStorage.getItem("doneIdResults")) || [];

  if (!savedResults.includes(data)) {
    savedResults.push(data);
    localStorage.setItem("doneIdResults", JSON.stringify(savedResults));
  }
}

function showDoneIdData() {
  const doneIdResults = JSON.parse(localStorage.getItem("doneIdResults")) || [];

  const resultWindow = window.open("", "_blank", "width=500,height=600");

  if (doneIdResults.length === 0) {
    resultWindow.document.write(
      "<p style='font-size:16px; font-family: sans-serif;'>完了IDはまだ保存されていません。</p>"
    );
    resultWindow.document.close();
    return;
  }

  const totalCount = doneIdResults.length;

  const htmlContent = `
        <html>
        <head>
            <title>完了ID一覧</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f7f9fa;
                    padding: 20px;
                    color: #333;
                }
                h2 {
                    text-align: center;
                    color: #2c3e50;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    background: #ecf0f1;
                    margin: 6px 0;
                    padding: 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 16px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <h2>✅ 完了したID一覧（合計: ${totalCount} 件）</h2>
            <ul>
                ${doneIdResults.map((id) => `<li>${id}</li>`).join("")}
            </ul>
        </body>
        </html>
    `;

  resultWindow.document.write(htmlContent);
  resultWindow.document.close();
}

function clearDoneIdData() {
  if (confirm("本当にデータを削除しますか？")) {
    localStorage.removeItem("doneIdResults");
    alert("データは削除されました !");
  }
}

function saveData(data) {
  let savedResults = JSON.parse(localStorage.getItem("savedResults")) || [];
  const idDisplay =
    typeof currentId !== "undefined" && currentId !== null
      ? `${currentIdDisplay}`
      : "不明";

  if (!data.startsWith(idDisplay)) {
    data = `${idDisplay} ${data}`;
  }

  savedResults.push(data);
  localStorage.setItem("savedResults", JSON.stringify(savedResults));
}

function showSavedData() {
  const resultWindow = window.open("", "_blank", "width=900,height=1000");
  setTimeout(() => {
    showSavedDataInWindow(resultWindow);
  }, 100);
}

function showSavedDataInWindow(
  resultWindow,
  openedId = null,
  openedSubtab = null
) {
  let savedResults = JSON.parse(localStorage.getItem("savedResults")) || [];
  if (savedResults.length === 0) {
    resultWindow.document.write("<p style='font-size:16px;'>データなし</p>");
    resultWindow.document.close();
    return;
  }

  const groupedById = {};

  savedResults.forEach((result) => {
    let id = "不明";
    if (typeof result === "string") {
      const match = result.match(/([0-9]+(?:_db2dc565)?)/);
      id = match ? match[1] : "不明";
    } else if (typeof result === "object") {
      id = result.idDisplay || "不明";
    }

    if (!groupedById[id]) {
      groupedById[id] = { Pass: [], Fail: [], SKIP: [], 非表示: [], 完了: [] };
    }

    const pushTo = (type) => groupedById[id][type].push(result);

    if (typeof result === "string") {
      if (result.includes("Pass")) pushTo("Pass");
      else if (result.includes("Fail")) pushTo("Fail");
      else if (result.includes("SKIP")) pushTo("SKIP");
      else if (result.includes("非表示")) pushTo("非表示");
      else if (result.includes("完了")) pushTo("完了");
      else pushTo("完了");
    } else {
      pushTo(result.status === "hidden" ? "非表示" : "完了");
    }
  });

  const sortedIds = Object.keys(groupedById).sort((a, b) => {
    const parseId = (id) => {
      const match = id.match(/(\d+)(?:_db2dc565)?/);
      return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    };
    const aBase = parseId(a);
    const bBase = parseId(b);
    if (aBase === bBase) return a.includes("_db2dc565") ? 1 : -1;
    return aBase - bBase;
  });

  let idTableRows = "";
  let contentSections = "";

  sortedIds.forEach((id, index) => {
    idTableRows += `
            <tr class="id-row" data-id="${id}" style="cursor: pointer;">
                <td style="text-align: center; border: 1px solid #ecf0f1; padding: 10px; font-size: 14px;">${
                  index + 1
                }</td>
                <td style="text-align: center; border: 1px solid #ecf0f1; padding: 10px; font-size: 14px; font-weight: 500;">${id}</td>
                <td style="border: 1px solid #ecf0f1; padding: 10px;">
                    <div style="display: flex; justify-content: center; align-items: center;">
                        <button class="view-result-btn" data-id="${id}">結果を表示する</button>
                    </div>
                </td>
                <td style="border: 1px solid #ecf0f1; padding: 10px;">
                    <div style="display: flex; justify-content: center; align-items: center;">
                        <button class="delete-id-btn" data-delete-id="${id}" title="Xóa ID">✕</button>
                    </div>
                </td>
            </tr>`;

    const data = groupedById[id];
    const subTabs = ["Pass", "Fail", "SKIP", "非表示", "完了"]
      .map(
        (sub) =>
          `<button class="sub-tab" data-subtab="${id}-${sub}">${sub} (${data[sub].length})</button>`
      )
      .join("");

    const subContents = ["Pass", "Fail", "SKIP", "非表示", "完了"]
      .map((sub) => {
        const colorMap = {
          Pass: "green",
          Fail: "red",
          SKIP: "#FFBF00",
          非表示: "#e67e22",
          完了: "#333",
        };
        const entries = data[sub]
          .map((result) => {
            let text =
              typeof result === "string"
                ? result.replace(/ID\s([^\s]+)/, "")
                : JSON.stringify(result, null, 2);
            return `<p style='color: ${colorMap[sub]}; font-weight: 500; line-height: 1.6;'>${text}</p>`;
          })
          .join("");
        return `<div id="${id}-${sub}" class="sub-content">${
          entries || '<p style="color: #888;">データなし</p>'
        }</div>`;
      })
      .join("");

    contentSections += `
            <div id="${id}" class="content" style="position: relative; display:none;">
                <h3 style="margin: 0 0 10px; font-size: 18px; color: #2980b9;　display: flex;  justify-content: center; align-items: center;">${id}の結果</h3>
                <div class="sub-tabs">${subTabs}</div>
                <div class="sub-contents">${subContents}</div>
            </div>`;
  });

  const idTableHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
            <button id="reload-button" style="background:rgb(10, 122, 150); color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                 リロード
            </button>
        </div>
        <div class="table-wrapper">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ccc;">登録数</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">ID</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">結果</th>
                        <th style="padding: 8px; border: 1px solid #ccc;" class="btn_idDelete">削除</th>
                    </tr>
                </thead>
                <tbody>
                    ${idTableRows}
                </tbody>
            </table>
        </div>`;

  resultWindow.document.write(`
        <html>
        <head>
            <title>チェックの結果</title>
            <style>
                html, body {
                    height: 100%;
                    overflow: auto;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 20px;
                    background: #f4f7f9;
                    color: #333;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 20px;
                    font-weight: bold;
                    color: #2c3e50;
                }
                .table-wrapper {
                    height: 30%;
                    overflow-y: auto;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    background: white;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    position: relative;
                }
                thead tr {
                    position: sticky;
                    top: -1;
                    background-color: rgb(14, 158, 177);
                    color: white;
                    z-index: 1;
                }

                .btn_idDelete{
                    background-color: rgb(177, 33, 14);
                }

                .view-result-btn {
                    background: #00b894;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .view-result-btn:hover {
                    background: #019875;
                }
                .delete-id-btn {
                    background: #e74c3c;
                    color: #fff;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    font-weight: bold;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background 0.3s ease, transform 0.2s ease;
                }
                .delete-id-btn:hover {
                    background: #c0392b;
                    transform: scale(1.1);
                }
                .content {
                    margin-top: 15px;
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .sub-tab {
                    background: #fff;
                    border: 1px solid #ddd;
                    margin: 4px;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 14px;
                }
                .sub-tab:hover {
                    background: #ecf0f1;
                }
                .sub-tab.active {
                    background: #3498db;
                    color: white;
                    border-color: #3498db;
                }
                .sub-tabs {
                    margin-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                .sub-content {
                    display: none;
                    height: 35%; 
                    overflow-y: auto;
                }
                .sub-content.active {
                    display: block;
                }

                p {
                    margin: 5px 0;
                    font-size: 13px;
                    white-space: pre-wrap;
                }
            </style>
        </head>
        <body>
            <div class="header">チェックの結果 (自動更新ではありません)</div>
            ${idTableHTML}
            ${contentSections}
        </body>
        </html>
    `);
  resultWindow.document.close();

  resultWindow.onload = () => {
    const reloadBtn = resultWindow.document.getElementById("reload-button");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", () => {
        const activeIdElem = Array.from(
          resultWindow.document.querySelectorAll(".content")
        ).find((el) => el.style.display === "block");
        const activeId = activeIdElem ? activeIdElem.id : null;

        let activeSubtab = null;
        if (activeIdElem) {
          const activeSub = activeIdElem.querySelector(".sub-tab.active");
          if (activeSub) {
            activeSubtab = activeSub
              .getAttribute("data-subtab")
              .replace(`${activeId}-`, "");
          }
        }

        resultWindow.document.body.innerHTML = "";
        resultWindow.document.head.innerHTML = "";
        showSavedDataInWindow(resultWindow, activeId, activeSubtab);
      });
    }

    const viewButtons =
      resultWindow.document.querySelectorAll(".view-result-btn");
    const allContents = resultWindow.document.querySelectorAll(".content");

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        allContents.forEach((c) => (c.style.display = "none"));

        const target = resultWindow.document.getElementById(id);
        if (target) {
          target.style.display = "block";

          const subTabs = target.querySelectorAll(".sub-tab");
          const subContents = target.querySelectorAll(".sub-content");
          subTabs.forEach((tab, i) => {
            tab.classList.remove("active");
            subContents[i].classList.remove("active");
            if (i === 0) {
              tab.classList.add("active");
              subContents[i].classList.add("active");
            }
          });

          subTabs.forEach((tab, i) => {
            tab.addEventListener("click", function () {
              subTabs.forEach((t) => t.classList.remove("active"));
              subContents.forEach((c) => c.classList.remove("active"));
              tab.classList.add("active");
              subContents[i].classList.add("active");
            });
          });
        }
      });
    });

    const deleteButtons =
      resultWindow.document.querySelectorAll(".delete-id-btn");

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const idToDelete = this.getAttribute("data-delete-id");
        if (!confirm(`${idToDelete} のデータを削除しますか？`)) return;

        let savedResults =
          JSON.parse(localStorage.getItem("savedResults")) || [];

        const newResults = savedResults.filter((result) => {
          let extractedId = "不明";
          if (typeof result === "string") {
            const match = result.match(/([0-9]+(?:_db2dc565)?)/);
            extractedId = match ? match[1] : "不明";
          } else if (typeof result === "object") {
            extractedId = result.idDisplay || "不明";
          }
          return extractedId !== idToDelete;
        });

        localStorage.setItem("savedResults", JSON.stringify(newResults));
        alert(`${idToDelete} のデータが削除されました。`);

        // 🔁 Xác định ID kế tiếp
        const groupedByIdAfterDelete = {};
        newResults.forEach((result) => {
          let id = "不明";
          if (typeof result === "string") {
            const match = result.match(/ID\s([0-9]+(?:_db2dc565)?)/);
            if (match) id = `${match[1]}`;
          } else if (typeof result === "object") {
            id = result.idDisplay || "不明";
          }
          if (!groupedByIdAfterDelete[id]) {
            groupedByIdAfterDelete[id] = true;
          }
        });

        const sortedRemainingIds = Object.keys(groupedByIdAfterDelete).sort(
          (a, b) => {
            const parseId = (id) => {
              const match = id.match(/(\d+)(?:_db2dc565)?/);
              return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
            };
            const aBase = parseId(a);
            const bBase = parseId(b);
            if (aBase === bBase) return a.includes("_db2dc565") ? 1 : -1;
            return aBase - bBase;
          }
        );

        const currentIndex = sortedRemainingIds.indexOf(idToDelete);
        const nextOpenedId =
          sortedRemainingIds[currentIndex + 1] ||
          sortedRemainingIds[currentIndex - 1] ||
          sortedRemainingIds[0] ||
          null;

        // ✅ Truyền ID còn lại để tự động mở sau khi load lại
        resultWindow.location.reload();
        setTimeout(() => {
          showSavedDataInWindow(resultWindow, nextOpenedId);
        }, 200);
      });
    });

    // ✅ Hiển thị ID đầu tiên khi mở
    if (openedId) {
      const button = resultWindow.document.querySelector(
        `.view-result-btn[data-id="${openedId}"]`
      );
      if (button) {
        button.click();
        if (openedSubtab) {
          setTimeout(() => {
            const subBtn = resultWindow.document.querySelector(
              `.sub-tab[data-subtab="${openedId}-${openedSubtab}"]`
            );
            if (subBtn) subBtn.click();
          }, 100);
        }
      }
    } else if (viewButtons.length > 0) {
      viewButtons[0].click();
    }
  };
}

function clearSavedData() {
  if (confirm("本当にデータを削除しますか？")) {
    localStorage.removeItem("savedResults");
    alert("データは削除されました !");
  }
}

function saveInputData(entries) {
  if (!entries || !Array.isArray(entries)) {
    console.warn("⚠️ saveInputData skipped, entries is invalid:", entries);
    return;
  }

  let inputResults = JSON.parse(localStorage.getItem("inputResults")) || [];
  entries.forEach((entry) => inputResults.push(entry));
  localStorage.setItem("inputResults", JSON.stringify(inputResults));
}

function saveIdInputData(data) {
  let idInputResults = JSON.parse(localStorage.getItem("inputResults")) || [];
  idInputResults.push(data);
  localStorage.setItem("inputResults", JSON.stringify(idInputResults));
}

function showInputData() {
  let inputResults = JSON.parse(localStorage.getItem("inputResults")) || [];
  if (inputResults.length === 0) {
    alert("データなし");
    return;
  }

  let formattedResults =
    "<div style='font-family: Arial, sans-serif; display: flex; flex-direction: column; margin: 0 20px;'>";
  formattedResults +=
    "<h3 style='color: #626567; font-weight: bold; text-align: center;'><<<<<<<<<<データの取得を表示>>>>>>>>></h3>";

  inputResults.forEach((result) => {
    formattedResults +=
      "<div style='display: flex; border: 1px solid #000; padding: 10px;'>";

    if (typeof result === "string") {
      formattedResults += `<div style='color: black; font-weight: 600; font-size: 16px; text-align: center;'>${result}</div>`;
    } else {
      // formattedResults += `<div style='color: #641e16; font-weight: bold; width: 60px;'>ID-${result.pageId || "?"} :</div>`;
      formattedResults += `<div style='color: #1a5276; font-weight: bold; width: 80px; text-align: left;'>${
        result.id || "?"
      } :</div>`;
      formattedResults += `<div style='color: #1a5276; font-weight: bold; padding-left: 10px'>${
        result.value || ""
      }</div>`;
    }

    formattedResults += "</div>";
  });

  formattedResults += "</div>";

  let resultWindow = window.open("", "_blank", "width=400,height=800");
  resultWindow.document.write(formattedResults);
}

function clearInputData() {
  if (confirm("本当にデータを削除しますか？")) {
    localStorage.removeItem("inputResults");
    alert("データは削除されました !");
  }
}

async function sendToContent(action, payload = {}) {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action, ...payload },
        function (response) {
          if (chrome.runtime.lastError) {
            resolve({
              status: "error",
              message: chrome.runtime.lastError.message,
            });
          } else {
            resolve(response);
          }
        }
      );
    });
  });
}

async function epoca_Main(jsonData) {
  if (!jsonData) return;

  const baseUrl = jsonData.baseUrl;
  const epocaData = jsonData.data;
  currentId = idStart;
  countId = 1;

  while (countId <= totalItems && !isStopped) {
    if (isPaused) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!isPaused) {
            clearInterval(interval);
            resolve();
          }
        }, 500);
      });
    }

    let tsgCheckResult = await sendToContent("tsgCheck");
    currentIdDisplay = currentId;
    let fullUrl = baseUrl + currentId;

    if (tsgCheckResult.status == true) {
      let restartCheck = await sendToContent("checkRestartBtn");
      if (restartCheck.status == true) {
        await sendToContent("clickRestartBtn");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        currentId--;
        currentIdDisplay = currentId + "_db2dc565";
        fullUrl = baseUrl + currentIdDisplay;
      }
    }

    currentIndex = 0;

    // Update tab URL
    await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: fullUrl }, function () {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tabs[0].id && info.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              setTimeout(resolve, 1000);
            }
          });
        });
      });
    });

    if (au_selection) {
      saveIdInputData(`ID ${currentIdDisplay} のテスト結果`);
      await epoca_AutoCheck(epocaData, currentIdDisplay);
    } else {
      await ro_Data(currentIdDisplay);
    }

    // updateProgress(countId);
    let doneIdCheck = await sendToContent("doneCheck");
    if (doneIdCheck.status === true) {
      saveDoneIdData(currentIdDisplay);
      updateProgress(countId);
      countId++;
    }
    currentId++;
    // countId++;
  }
  // await updateProgress(countId);
  alert("DONE !!");
  document.getElementById("pauseBtn").classList.add("hidden");
  document.getElementById("startBtn").classList.remove("hidden");
}

async function epoca_AutoCheck(epocaData, currentIdDisplay) {
  if (isStopped) return "停止中";
  let nowQ = 0;

  for (let i = 0; i < epocaData.length; i++) {
    if (isStopped) return "停止中";

    while (isPaused) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    //Check 対象外
    // await new Promise(resolve => setTimeout(resolve, 500));
    // let tsgResult = await sendToContent("tsgCheck");
    // if (tsgResult?.status){
    //     console.log("👉 TSG :", tsgResult.status);
    //     if(tsgResult.status == true){
    //         saveData(`⛔ Fail: Warning ${epocaData[i].blade} から: 対象外しました。`);
    //         return;
    //     }
    // }

    // Check 進捗
    if (i > 0 && epocaData[i].blade != "THANKPAGE") {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      let currentNumber = await sendToContent("getNowQ");
      console.log("nowQ: ", nowQ);
      console.log("progressBar: ", currentNumber.value);

      let tsgResult = await sendToContent("tsgCheck");
      console.log("👉 TSG :", tsgResult.status);

      if (tsgResult.status == true) {
        saveData(
          `⛔ Fail: Warning ${epocaData[i].blade} から: 対象外しました。`
        );
        return;
      }

      if (currentNumber.value - nowQ === 1) {
        nowQ = currentNumber.value;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        currentNumber = await sendToContent("getNowQ");

        tsgResult = await sendToContent("tsgCheck");
        if (tsgResult.status == true) {
          saveData(
            `⛔ Fail: Warning ${epocaData[i].blade} から: 対象外しました。`
          );
          return;
        }

        if (currentNumber.value != null && nowQ > currentNumber.value) {
          saveData(
            `⛔ Fail: Warning : ${epocaData[i - 1].blade}の進捗があります。`
          );
          return;
        }

        if (currentNumber.value != null && currentNumber.value - nowQ === 1) {
          nowQ = currentNumber.value;
        } else {
          saveData(
            `🏁 SKIP: Blade ${epocaData[i].blade} はスキップされています。`
          );
          nowQ++;
          continue;
        }
      }
    }

    const autoData = epocaData[i];
    console.log("🔍 Đang xử lý:", autoData);
    const typeList = (autoData?.type || "")
      .split(",")
      .map((type) => type.trim());

    for (const type of typeList) {
      switch (type) {
        case "FIRSTPAGE":
          console.log("👉 Vào case FIRSTPAGE");
          await sendToContent("startBtnClick");
          break;

        case "SC0":
          console.log("👉 Vào :", autoData.blade);

          let sc0Result = await sendToContent("noInputCheck");
          await new Promise((resolve) => setTimeout(resolve, 800));

          if (sc0Result.status == true) {
            saveData(`✅ Pass: Blade ${autoData.blade} 未入力チェック`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} 未入力チェック`);
          }

          console.log("👉 result : ", sc0Result);
          await sendToContent("oneAllBtnClick");

          await new Promise((resolve) => setTimeout(resolve, 500));
          const sc0Entry = await sendToContent("getSaData");
          saveInputData(sc0Entry.data);

          await sendToContent("nextBtnClick");
          break;

        case "SA1":
          console.log("👉 Vào :", autoData.blade);
          let sa1Result = await sendToContent("noInputCheck");

          if (sa1Result.status == true) {
            saveData(`✅ Pass: Blade ${autoData.blade} 未入力チェック`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} 未入力チェック`);
          }

          console.log("👉 result : ", sa1Result);
          // await sendToContent("sa1BtnClick");
          await sendToContent("oneAllBtnClick");

          await new Promise((resolve) => setTimeout(resolve, 500));
          const sa1Entry = await sendToContent("getSaData");
          saveInputData(sa1Entry.data);

          await sendToContent("nextBtnClick");
          break;

        case "SA":
          console.log("👉 Vào :", autoData.blade);
          let saResult = await sendToContent("noInputCheck");
          if (saResult.status == true) {
            saveData(`✅ Pass: Blade ${autoData.blade} 未入力チェック`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} 未入力チェック`);
          }
          await sendToContent("saBtnClick");

          await new Promise((resolve) => setTimeout(resolve, 500));
          let saAlertBox = await sendToContent("alertCheck");
          if (saAlertBox.status) {
            await sendToContent("rndSaBtnClick");
          }
          const saEntry = await sendToContent("getSaData");
          saveInputData(saEntry.data);

          await sendToContent("nextBtnClick");
          break;

        case "NO":
          console.log("👉 Vào :", autoData.blade);
          let noResult = await sendToContent("noInputCheck");
          if (noResult.status == true) {
            saveData(`✅ Pass: Blade ${autoData.blade} 未入力チェック`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} 未入力チェック`);
          }

          // Num Check
          const numCheckResult = await sendToContent("numCheckAutoTest", {
            jsonData: autoData,
          });
          let allPass = true;

          numCheckResult.data.forEach((item) => {
            if (!item.isPass) {
              allPass = false;
            }
          });

          if (allPass) {
            saveData(`✅ Pass: Blade ${autoData.blade} NumCheck 全部正常`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} NumCheck 一部失敗`);
          }

          // 再掲　自動チェック
          await sendToContent("rndStep10Click");
          // await sendToContent("sonotaBoxClick");
          let noEntry = await sendToContent("getNoData");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");

          let isAlertBox = await sendToContent("alertCheck");

          if (!isAlertBox.status) {
            saveInputData(noEntry.data);
            saveData(
              `✅ Pass: Blade ${autoData.blade} 初期ランダムチェックエラーなし`
            );
            break;
          }

          // 再掲　自動チェック
          // if (autoData?.saikei) {
          //     await sendToContent("rndStep10Click");
          //     await sendToContent("sonotaBoxClick");
          //     const saikeiResult = await sendToContent("saikeiInputCheck", { jsonData: autoData });

          //     if (!saikeiResult.data.status) {
          //         await new Promise(resolve => setTimeout(resolve, 500));
          //         await sendToContent("nextBtnClick");

          //         isAlertBox = await sendToContent("alertCheck");
          //         if (isAlertBox.status) {
          //             saveData(`✅ Pass: Blade ${autoData.blade} 再掲アウトのチェック`);
          //         } else {
          //             saveData(`❌ Fail: Blade ${autoData.blade} 再掲アウトのチェック`);
          //         }

          //         await new Promise(resolve => setTimeout(resolve, 500));
          //         await sendToContent("autoInputBySaikei", { jsonData: autoData });
          //         noEntry = await sendToContent("getNoData");
          //         await sendToContent("nextBtnClick");
          //     }
          // }
          if (autoData?.saikei) {
            await sendToContent("rndStep10Click");
            // await sendToContent("sonotaBoxClick");
            const saikeiResult = await sendToContent("saikeiInputCheck", {
              jsonData: autoData,
            });

            if (
              Array.isArray(saikeiResult.data) &&
              saikeiResult.data.some((item) => item.status === false)
            ) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("nextBtnClick");

              isAlertBox = await sendToContent("alertCheck");
              if (isAlertBox && isAlertBox.status) {
                saveData(
                  `✅ Pass: Blade ${autoData.blade} 再掲アウトのチェック`
                );
              } else {
                saveData(
                  `❌ Fail: Blade ${autoData.blade} 再掲アウトのチェック`
                );
              }

              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("autoInputBySaikei", { jsonData: autoData });
              noEntry = await sendToContent("getNoData");
              await sendToContent("nextBtnClick");
            }
          }

          // 合計　自動チェック
          if (autoData?.gokei) {
            await sendToContent("rndStep10Click");
            // await sendToContent("sonotaBoxClick");
            const gokeiResult = await sendToContent("goKeiSaikeiCheck", {
              jsonData: autoData,
            });

            if (!gokeiResult.data.status) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("nextBtnClick");

              isAlertBox = await sendToContent("alertCheck");
              if (isAlertBox.status) {
                saveData(
                  `✅ Pass: Blade ${autoData.blade} 合計アウトのチェック`
                );
              } else {
                saveData(
                  `❌ Fail: Blade ${autoData.blade} 合計アウトのチェック`
                );
              }

              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("autoInputByGokei", { jsonData: autoData });
              noEntry = await sendToContent("getNoData");
              await sendToContent("nextBtnClick");
            }
          }

          if (autoData?.gokei100) {
            await sendToContent("rndStep10Click");
            // await sendToContent("sonotaBoxClick");
            const gokei100Result = await sendToContent("goKei100Check", {
              jsonData: autoData,
            });

            if (!gokei100Result.data.status) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("nextBtnClick");

              isAlertBox = await sendToContent("alertCheck");
              if (isAlertBox.status) {
                saveData(
                  `✅ Pass: Blade ${autoData.blade} 合計が100%となるのアウトのチェック`
                );
              } else {
                saveData(
                  `❌ Fail: Blade ${autoData.blade} 合計が100%となるのアウトのチェック`
                );
              }

              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("autoInputByGokei100", {
                jsonData: autoData,
              });
              noEntry = await sendToContent("getNoData");
              await sendToContent("nextBtnClick");
            }
          }

          if (autoData?.totalValue) {
            await sendToContent("rndStep10Click");
            // await sendToContent("sonotaBoxClick");
            const totalValueResult = await sendToContent("totalValueCheck", {
              jsonData: autoData,
            });

            if (!totalValueResult.data.status) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("nextBtnClick");

              isAlertBox = await sendToContent("alertCheck");
              if (isAlertBox.status) {
                saveData(
                  `✅ Pass: Blade ${autoData.blade} 各項目の合計が${autoData.totalValue}となるように入力のチェック`
                );
              } else {
                saveData(
                  `❌ Fail: Blade ${autoData.blade} 各項目の合計が${autoData.totalValue}となるように入力のチェック`
                );
              }

              await new Promise((resolve) => setTimeout(resolve, 500));
              await sendToContent("autoInputByValue", { jsonData: autoData });
              noEntry = await sendToContent("getNoData");
              await sendToContent("nextBtnClick");
            }
          }

          if (autoData?.tgokeiSpecial) {
            await sendToContent("rndStep10Click");
            // await sendToContent("sonotaBoxClick");
            await sendToContent("autoInputFromTotalColumn", {
              jsonData: autoData,
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 500));

            isAlertBox = await sendToContent("alertCheck");
            if (isAlertBox.status) {
              saveData(
                `✅ Pass: Blade ${autoData.blade} 列合計が再掲となるように入力のチェック`
              );
            } else {
              saveData(
                `❌ Fail: Blade ${autoData.blade} 列合計が再掲となるように入力のチェック`
              );
            }
          }

          if (autoData?.ygokeiSpecial) {
            await sendToContent("rndStep10Click");
            // await sendToContent("sonotaBoxClick");
            await sendToContent("autoInputByGokeiY", { jsonData: autoData });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 500));

            isAlertBox = await sendToContent("alertCheck");
            if (isAlertBox.status) {
              saveData(
                `✅ Pass: Blade ${autoData.blade} 横合計が再掲となるように入力のチェック`
              );
            } else {
              saveData(
                `❌ Fail: Blade ${autoData.blade} 横合計が再掲となるように入力のチェック`
              );
            }
          }

          //再掲●入力値＝入力値計
          if (autoData?.input) {
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("autoInputDepressionCheck", {
              jsonData: autoData,
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 500));
            isAlertBox = await sendToContent("alertCheck");
            if (isAlertBox.status == false) {
              saveData(
                `✅ Pass: Blade ${autoData.blade} 再掲●入力値＝入力値計`
              );
            } else {
              saveData(
                `❌ Fail: Blade ${autoData.blade} 再掲●入力値＝入力値計`
              );
            }
          }

          //アラートの条件に従って入力値のチェック
          await new Promise((resolve) => setTimeout(resolve, 500));
          isAlertBox = await sendToContent("alertCheck");
          if (isAlertBox.status) {
            await sendToContent("nextBtnClick");
            await sendToContent("autoInputByNum");
            saveData(
              `✅ Pass: Blade ${autoData.blade} アラートの条件に従って入力値のチェック`
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
          }

          saveInputData(noEntry.data);
          break;

        case "MA":
          console.log("👉 Vào :", autoData.blade);
          let maResult = await sendToContent("noInputCheck");

          if (maResult.status == true) {
            saveData(`✅ Pass: Blade ${autoData.blade} 未入力チェック`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} 未入力チェック`);
          }

          await sendToContent("rndSaBtnClick");
          await sendToContent("nextBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 1000));

          let errBoxMaCheck = await sendToContent("checkBgErrorCheckbox");

          if (errBoxMaCheck.status) {
            await sendToContent("oneAllBtnClick");
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            errBoxMaCheck = await sendToContent("checkBgErrorCheckbox");

            if (errBoxMaCheck.status) {
              await sendToContent("nextBtnClick");
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const maxCheckBoxResult = await sendToContent(
                "autoCheckMaxErrorCheckbox"
              );
              saveData(
                `✅ Pass: Blade ${autoData.blade} Max CheckBox : ${maxCheckBoxResult.maxcheckbox}`
              );
            } else {
              const maEntry = await sendToContent("getMaData");
              saveInputData(maEntry.data);
              continue;
            }
          }

          const maEntry = await sendToContent("getMaData");
          saveInputData(maEntry.data);

          await sendToContent("nextBtnClick");
          break;

        case "FA":
          console.log("👉 Vào :", autoData.blade);
          let faResult = await sendToContent("noInputCheck");
          if (faResult.status == true) {
            saveData(`✅ Pass: Blade ${autoData.blade} 未入力チェック`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} 未入力チェック`);
          }
          await sendToContent("sonotaBoxClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          break;

        case "F":
          console.log("👉 Vào :", autoData.blade);
          let fResult = await sendToContent("noInputCheck");
          if (fResult.status == true) {
            saveData(`✅ Pass: Blade ${autoData.blade} 未入力チェック`);
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} 未入力チェック`);
          }
          await sendToContent("oneAllBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          const fEntry = await sendToContent("getSaData");
          saveInputData(fEntry.data);

          await sendToContent("nextBtnClick");
          break;

        case "SONOTA":
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("sonotaBoxClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          break;

        case "NP":
          console.log("👉 Vào :", autoData.blade);
          saveData(`✅ Pass: Blade ${autoData.blade} 次のページ`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          break;

        case "JOUI":
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("alertCheck");
          await sendToContent("nextBtnClick");

          let errBoxJouiCheck = await sendToContent("alertCheck");
          if (errBoxJouiCheck.status) {
            await sendToContent("selectJoui");
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            errBoxJouiCheck = await sendToContent("alertCheck");
            if (!errBoxJouiCheck.status) {
              saveData(`✅ Pass: Blade ${autoData.blade} 上位チェック`);
            } else {
              saveData(`❌ Fail: Blade ${autoData.blade} 上位チェック`);
            }
          }
          break;

        case "SELECT":
          await sendToContent("nextBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));

          let errBoxSelectCheck = await sendToContent("alertCheck");
          if (errBoxSelectCheck.status) {
            await sendToContent("rndSaBtnClick");
            await sendToContent("nextBtnClick");
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
          errBoxSelectCheck = await sendToContent("alertCheck");

          if (errBoxSelectCheck.status) {
            await sendToContent("randomSelectForTable");
            saveData(`✅ Pass: Blade ${autoData.blade} SELECTの上位チェック`);
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
          } else {
            saveData(`❌ Fail: Blade ${autoData.blade} SELECTの上位チェック`);
          }
          break;

        case "THANKPAGE":
          break;

        default:
          console.log("⛔ 未対応のtype:", autoData?.type);
          saveData(
            `⚠ 未対応のtype (${autoData?.type}) - ID ${currentIdDisplay}`
          );
          break;
      }
    }
  }

  await saveData(`🆗 完了: ローデータチェックを完了です。 !!!`);
  return;
}

async function ro_Data(currentIdDisplay) {
  let tsgResult = { status: false };
  let doneResult = { status: false };
  let loopTemp = 0;

  const bladeMapList = [];

  while (
    tsgResult.status === false &&
    doneResult.status === false &&
    loopTemp < 200
  ) {
    if (isStopped) return "停止中";
    while (isPaused) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    tsgResult = await sendToContent("tsgCheck");

    // let doneIdCheck = await sendToContent("doneCheck");
    // if (doneIdCheck.status === true){
    //     saveDoneIdData(currentIdDisplay);
    // }
    doneResult = await sendToContent("doneCheck");

    let bladeResult = await sendToContent("getBladeType");

    if (!bladeResult?.blade) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      bladeResult = await sendToContent("getBladeType");
    }
    console.log("👉 bladeResult :", bladeResult);

    let bladeItem = {
      blade: Array.isArray(bladeResult?.blade)
        ? bladeResult.blade.join(", ")
        : bladeResult?.blade || "",
      type: Array.isArray(bladeResult?.type)
        ? bladeResult.type.join(", ")
        : bladeResult?.type || "",
    };

    const typeList = bladeResult?.type || [];

    for (const type of typeList) {
      switch (type) {
        case "FIRSTPAGE":
          await sendToContent("startBtnClick");
          break;

        case "SC0":
          await sendToContent("oneAllBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          break;

        case "MASA":
          let flag = 0;

          while (flag == 0) {
            await sendToContent("rndSaBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const matchCheck = await sendToContent(
              "checkRadioAndCheckboxSameRow"
            );
            if (matchCheck?.isValid) {
              flag = 1;
              await sendToContent("nextBtnClick");
              break;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          let errBoxMaSaCheck = await sendToContent("alertCheck");
          if (errBoxMaSaCheck.status) {
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("autoCheckMaxCheckbox");
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          errBoxMaSaCheck = await sendToContent("alertCheck");

          if (errBoxMaSaCheck.status) {
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("autoCheckMaxErrorCheckbox");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("nextBtnClick");
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          errBoxMaSaCheck = await sendToContent("alertCheck");

          if (errBoxMaSaCheck.status) {
            await sendToContent("nextBtnClick");
            const alertResult = await sendToContent("getAlertText");
            const alertIsHasSonota = alertResult?.alertText || "";

            if (alertIsHasSonota.includes("他")) {
              const isCheckboxSameValueChecked = await sendToContent(
                "isCheckboxSameValueChecked"
              );

              if (isCheckboxSameValueChecked?.status) {
                await sendToContent("sonotaBoxClick");
                await sendToContent("nextBtnClick");
              }
            }
          }
          break;

        case "SA":
          await sendToContent("rndSaBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          let errSaCheck = await sendToContent("alertCheck");
          if (errSaCheck.status) {
            await sendToContent("saBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
          }

          break;

        case "MA":
          await sendToContent("rndSaBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");

          await new Promise((resolve) => setTimeout(resolve, 1000));
          let errBoxMaCheck = await sendToContent("alertCheck");
          if (errBoxMaCheck.status) {
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("autoCheckMaxCheckbox");
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          errBoxMaCheck = await sendToContent("alertCheck");

          if (errBoxMaCheck.status) {
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("autoCheckMaxErrorCheckbox");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendToContent("nextBtnClick");
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          errBoxMaCheck = await sendToContent("alertCheck");

          if (errBoxMaCheck.status) {
            await sendToContent("nextBtnClick");
            const alertResult = await sendToContent("getAlertText");
            const alertIsHasSonota = alertResult?.alertText || "";

            if (alertIsHasSonota.includes("他")) {
              const isCheckboxSameValueChecked = await sendToContent(
                "isCheckboxSameValueChecked"
              );

              if (isCheckboxSameValueChecked?.status) {
                await sendToContent("sonotaBoxClick");
                await sendToContent("nextBtnClick");
              }
            }
          }

          break;

        case "FA":
          await sendToContent("rndSaBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          break;

        case "JOUI":
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("alertCheck");
          await sendToContent("nextBtnClick");

          let errBoxJouiCheck = await sendToContent("alertCheck");
          if (errBoxJouiCheck.status) {
            await sendToContent("selectJoui");
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
          }
          break;

        case "SELECT":
          await sendToContent("randomSelectForTable");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          let errBoxSelectCheck = await sendToContent("alertCheck");
          if (errBoxSelectCheck.status) {
            await sendToContent("rndSaBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sendToContent("nextBtnClick");
          }
          break;

        case "NO":
          try {
            await sendToContent("rndStep10Click");
            await sendToContent("nextBtnClick");
            await new Promise((resolve) => setTimeout(resolve, 500));

            let errBoxCheck = await sendToContent("alertCheck");

            if (errBoxCheck.status) {
              await sendToContent("nextBtnClick");
              await new Promise((resolve) => setTimeout(resolve, 500));
              const alertTextResult = await sendToContent("getAlertText");
              const alertText = alertTextResult?.alertText || "";

              if (alertText.includes("%") || alertText.includes("％")) {
                console.log("合計: 100%");
                bladeItem.gokei100 = "=";
                await sendToContent("autoInputByGokei100", {
                  jsonData: bladeResult,
                });
              } else if (alertText.includes("～") && alertText.includes("0")) {
                console.log("合計: 0~100");
                bladeItem.gokei = "<=";
                await sendToContent("rndSaBtnClick");
              } else if (alertText.includes("合") && alertText.includes("計")) {
                if (alertText.includes("上")) {
                  console.log("合計: 以上");
                  bladeItem.gokei = ">=";
                  bladeItem.saikei = ">=";
                  await sendToContent("autoInputByGokei", {
                    jsonData: bladeResult,
                  });
                } else if (alertText.includes("下")) {
                  let gokeiResult = await sendToContent("autoInputByGokei", {
                    jsonData: bladeResult,
                  });
                  const isEmpty =
                    !gokeiResult ||
                    !Array.isArray(gokeiResult.data) ||
                    gokeiResult.data.length === 0;

                  if (isEmpty) {
                    const fallbackResult = await sendToContent(
                      "autoInputFromTotalRow"
                    );
                    if (fallbackResult?.data?.length > 0) {
                      console.log("合計: rowInput以下");
                      bladeItem.ygokeiSpecial = "<=";
                    }
                  } else {
                    console.log("合計: 以下");
                    bladeItem.gokei = "<=";
                  }
                } else if (alertText.includes("横")) {
                  console.log("合計: 横");
                  await sendToContent("autoInputByGokeiY", {
                    jsonData: bladeResult,
                  });
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  await sendToContent("nextBtnClick");
                } else {
                  await sendToContent("autoInputByGokei", {
                    jsonData: bladeResult,
                  });
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  await sendToContent("nextBtnClick");
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  errBoxCheck = await sendToContent("alertCheck");

                  if (errBoxCheck.status) {
                    console.log("合計＝bg_error計");
                    bladeItem.input = ">=";
                    await sendToContent("autoInputDepressionCheck", {
                      jsonData: bladeResult,
                    });
                    // await sendToContent("autoInputFromTotalRow", { jsonData: bladeResult });
                    // await new Promise(resolve => setTimeout(resolve, 1000));
                    // await sendToContent("nextBtnClick");

                    // await new Promise(resolve => setTimeout(resolve, 1000));
                    // errBoxCheck = await sendToContent("alertCheck");

                    // if (errBoxCheck.status) {
                    //     console.log("合計: columnInput以下");
                    //     bladeItem.tgokeiSpecial = "<=";
                    //     await sendToContent("autoInputFromTotalColumn", { jsonData: bladeResult });
                    // } else if (errBoxCheck.status) {
                    //     console.log("合計: rowInput以下");
                    //     bladeItem.ygokeiSpecial = "<=";
                    // } else {
                    //     console.log("合計: 以下 と　⬇️➡️");
                    //     bladeItem.input = ">=";
                    //     await sendToContent("autoInputDepressionCheck", { jsonData: bladeResult });
                    // }
                  } else {
                    console.log("合計 = 再掲");
                    bladeItem.gokei = "=";
                    continue;
                  }
                }
              } else if (
                alertText.includes("以") &&
                (bladeResult.hasT || bladeResult.hasY)
              ) {
                if (alertText.includes("上")) {
                  console.log("再掲: 以上");
                  bladeItem.saikei = "<=";
                  await sendToContent("autoInputBySaikei", {
                    jsonData: bladeResult,
                  });
                } else if (alertText.includes("下")) {
                  console.log("再掲: 以下");
                  bladeItem.saikei = ">=";
                  await sendToContent("autoInputBySaikei", {
                    jsonData: bladeResult,
                  });
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  await sendToContent("nextBtnClick");
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  errBoxCheck = await sendToContent("alertCheck");
                  if (errBoxCheck.status) {
                    console.log("合計＝bg_error計");
                    bladeItem.input = ">=";
                    await sendToContent("autoInputDepressionCheck", {
                      jsonData: bladeResult,
                    });
                  }
                }
              } else {
                bladeItem.input = ">=";
                console.log("合計＝bg_error計");
                await sendToContent("autoInputDepressionCheck", {
                  jsonData: bladeResult,
                });
              }

              await sendToContent("nextBtnClick");
            }
          } catch (error) {
            console.error("Error in NO case:", error);
          }
          break;

        case "F":
          await sendToContent("rndSaBtnClick");
          // await sendToContent("oneAllBtnClick");
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          break;

        case "SONOTA":
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("sonotaBoxClick");
          break;

        case "NP":
          await new Promise((resolve) => setTimeout(resolve, 500));
          await sendToContent("nextBtnClick");
          break;

        case "THANKPAGE":
          break;
      }
    }

    if (bladeItem.blade && bladeItem.type) {
      bladeMapList.push(bladeItem);
    }

    loopTemp++;
  }
  // Merge bladeMapList
  const mergedBladeMapList = bladeMapList.reduce((acc, item) => {
    const existing = acc.find(
      (el) => el.blade === item.blade && el.type === item.type
    );

    if (existing) {
      Object.assign(existing, item);
    } else {
      acc.push(item);
    }

    return acc;
  }, []);

  const finalResult = {
    baseUrl: jsonData?.baseUrl || "",
    data: mergedBladeMapList,
  };

  //CREATE JSON FILE

  let IsCreateJsonCheck = await sendToContent("doneCheck");
  if (IsCreateJsonCheck.status === true) {
    const blob = new Blob([JSON.stringify(finalResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = `EPOCA_ID${currentIdDisplay}_TEST_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
// async function createDatakey() {
//   console.log("Đã click nút tạo datakey");
//   let dataQ = await sendToContent("getDataQ");
//   console.log(dataQ);
// }

async function createDatakey() {
  try {
    // Get data from content script
    let dataQ = await sendToContent("getDataQ");
    if (!dataQ?.formatdata || !Array.isArray(dataQ.formatdata)) {
      alert("データを取得できませんでした。");
      return;
    }
    console.log(dataQ);

    // Format data for CSV
    let formattedData = [];
    const tableNameCounter = {};
    dataQ.formatdata.forEach((item) => {
      const post_key = item.post_key || "";
      const key1_1 = item.key1_1 || "";
      const key1_2 = Array.isArray(item.key1_2)
        ? item.key1_2
        : [item.key1_2 || ""];
      let key2_1 = Array.isArray(item.key2_1)
        ? [...item.key2_1] // clone để không ảnh hưởng gốc
        : [item.key2_1 || ""];
      const baseTableName = item.tableName || "";
      const rank = Array.isArray(item.rank) ? item.rank : null;
      // Lấy prefix là phần trước dấu '_' cuối cùng, và số bắt đầu từ số cuối cùng
      const prefixMatch = baseTableName.match(/^(.*)_([0-9]+)$/);
      let prefix = baseTableName;
      let startNum = 1;
      if (prefixMatch) {
        prefix = prefixMatch[1];
        startNum = parseInt(prefixMatch[2], 10);
      }
      if (!tableNameCounter[prefix]) tableNameCounter[prefix] = startNum;

      // --- SPECIAL CASE: Vừa có key2_1 vừa có rank ---
      if (
        key2_1.length > 0 &&
        rank &&
        rank.length > 0 &&
        !(key2_1.length === 1 && (key2_1[0] === "順位" || key2_1[0] === "上位"))
      ) {
        // 1. Tách specialLabel (上位 hoặc 順位) khỏi key2_1
        let key2_1_clone = [...key2_1];
        let foundIndex = key2_1_clone.findIndex(
          (v) => v && (v.includes("上位") || v.includes("順位"))
        );
        let specialLabel = "";
        if (foundIndex !== -1 && key2_1_clone.length > 1) {
          specialLabel = key2_1_clone[foundIndex];
          key2_1_clone.splice(foundIndex, 1);
        }
        // 2. Xuất các dòng Q12_1_1 → Q12_1_n như cũ, nhưng không còn specialLabel ở key1_3
        if (key1_2.length > 1) {
          key1_2.forEach((k12, idx) => {
            const tableName =
              key1_2.length === 1 ? prefix : prefix + "_" + (idx + 1);
            const post_key_new = post_key.replace(
              /:::[^:]+::/,
              `:::${tableName}::`
            );
            // KHÔNG đưa specialLabel hoặc key1_3 vào key1 ở dòng thường
            let key1 = [key1_1, k12, "", "", ""];
            while (key1.length < 5) key1.push("");
            formattedData.push({
              post_key: post_key_new,
              key1,
              key2: key2_1_clone.slice(0, 22),
            });
          });
        } else {
          // KHÔNG đưa specialLabel hoặc key1_3 vào key1 ở dòng thường
          let key1 = [key1_1, ...key1_2, "", "", ""];
          while (key1.length < 5) key1.push("");
          const tableName = prefix;
          const post_key_new = post_key.replace(
            /:::[^:]+::/,
            `:::${tableName}::`
          );
          formattedData.push({
            post_key: post_key_new,
            key1,
            key2: key2_1_clone.slice(0, 22),
          });
        }
        // 3. Tạo thêm các dòng Q12_2_1 → Q12_2_n với key2_1 là từng giá trị trong rank, chỉ dòng này mới đẩy specialLabel vào key1-2, key1-2 ban đầu xuống key1-3
        let prefix2 = prefix.replace(/_1$/, "_2");
        key1_2.forEach((k12, idx) => {
          const tableName2 =
            key1_2.length === 1 ? prefix2 : prefix2 + "_" + (idx + 1);
          const post_key_new2 = post_key.replace(
            /:::[^:]+::/,
            `:::${tableName2}::`
          );
          let key1;
          if (specialLabel) {
            key1 = [key1_1, specialLabel, k12, "", ""];
          } else {
            key1 = [key1_1, k12, "", "", ""];
          }
          while (key1.length < 5) key1.push("");
          formattedData.push({
            post_key: post_key_new2,
            key1,
            key2: rank.slice(0, 22),
          });
        });
        return; // Đã xử lý xong trường hợp đặc biệt, bỏ qua các logic còn lại
      }
      // --- END SPECIAL CASE ---
      // Nếu key2_1 chỉ có đúng 1 giá trị là '順位' hoặc '上位' và có rank, thì key2 = rank
      if (
        key2_1.length === 1 &&
        (key2_1[0] === "順位" || key2_1[0] === "上位") &&
        rank &&
        rank.length > 0
      ) {
        if (key1_2.length > 1) {
          key1_2.forEach((k12, idx) => {
            const tableName =
              key1_2.length === 1 ? prefix : prefix + "_" + (idx + 1);
            const post_key_new = post_key.replace(
              /:::[^:]+::/,
              `:::${tableName}::`
            );
            // Chỉ dòng rank mới đẩy specialLabel vào key1-2, key1-2 ban đầu xuống key1-3
            let key1 = [key1_1, key2_1[0], k12, "", ""];
            while (key1.length < 5) key1.push("");
            formattedData.push({
              post_key: post_key_new,
              key1,
              key2: rank.slice(0, 22),
            });
          });
        } else {
          let key1 = [key1_1, key2_1[0], key1_2[0] || "", "", ""];
          while (key1.length < 5) key1.push("");
          const tableName = prefix;
          const post_key_new = post_key.replace(
            /:::[^:]+::/,
            `:::${tableName}::`
          );
          formattedData.push({
            post_key: post_key_new,
            key1,
            key2: rank.slice(0, 22),
          });
        }
        return;
      }
      // --- END SPECIAL CASE ---
      // --- SPECIAL CASE: SA, key1_2 rỗng, key2_1 là mảng các chuỗi có '/' ---
      if (
        item.type === "SA" &&
        (key1_2.length === 0 || (key1_2.length === 1 && !key1_2[0])) &&
        Array.isArray(key2_1) &&
        key2_1.every((v) => typeof v === "string" && v.includes("/"))
      ) {
        // Tách tất cả lựa chọn thành 1 mảng
        let allChoices = [];
        key2_1.forEach((str) => {
          allChoices.push(
            ...str
              .split("/")
              .map((s) => s.trim())
              .filter(Boolean)
          );
        });
        const tableName = prefix;
        const post_key_new = post_key.replace(
          /:::[^:]+::/,
          `:::${tableName}::`
        );
        let key1 = [key1_1, "", "", "", ""];
        formattedData.push({
          post_key: post_key_new,
          key1,
          key2: allChoices.slice(0, 22), // fill vào key2-1, key2-2,...
        });
        return; // Đã xử lý xong trường hợp đặc biệt, bỏ qua các logic còn lại
      }
      // --- END SPECIAL CASE ---
      // Logic cũ cho các trường hợp còn lại
      if (key1_2.length > 1) {
        key1_2.forEach((k12, idx) => {
          const tableName =
            key1_2.length === 1 ? prefix : prefix + "_" + (idx + 1);
          // Tạo post_key mới với số thứ tự giống tableName
          const post_key_new = post_key.replace(
            /:::[^:]+::/,
            `:::${tableName}::`
          );
          // Xử lý chuyển 上位 hoặc 順位 từ key2_1 sang key1-2, đẩy key1-2 cũ sang key1-3
          let key2_1_clone = [...key2_1];
          let key1 = [key1_1, k12, "", "", ""];
          let foundIndex = key2_1_clone.findIndex(
            (v) => v && (v.includes("上位") || v.includes("順位"))
          );
          if (foundIndex !== -1) {
            // Đẩy specialLabel vào key1[1], key1[1] cũ sang key1[2]
            const specialLabel = key2_1_clone[foundIndex];
            const oldKey1_2 = key1[1];
            key1[1] = specialLabel;
            key1[2] = oldKey1_2;
            key2_1_clone.splice(foundIndex, 1); // xóa khỏi key2_1
          }
          // Nếu key2_1_clone có giá trị dạng xếp hạng (1位, 2位, ...), và key1[2] đang rỗng thì gán '順位'
          if (
            key1[2] === "" &&
            key2_1_clone.some((v) => v && /^[0-9]+位$/.test(v))
          ) {
            key1[2] = "順位";
          }
          while (key1.length < 5) key1.push("");
          formattedData.push({
            post_key: post_key_new,
            key1,
            key2: key2_1_clone.slice(0, 22),
          });
        });
      } else {
        let key2_1_clone = [...key2_1];
        let key1 = [key1_1, ...key1_2, "", "", ""];
        let foundIndex = key2_1_clone.findIndex(
          (v) => v && (v.includes("上位") || v.includes("順位"))
        );
        if (foundIndex !== -1) {
          // Đẩy specialLabel vào key1[1], key1[1] cũ sang key1[2]
          const specialLabel = key2_1_clone[foundIndex];
          const oldKey1_2 = key1[1];
          key1[1] = specialLabel;
          key1[2] = oldKey1_2;
          key2_1_clone.splice(foundIndex, 1); // xóa khỏi key2_1
        }
        // Nếu key2_1_clone có giá trị dạng xếp hạng (1位, 2位, ...), và key1[2] đang rỗng thì gán '順位'
        if (
          key1[2] === "" &&
          key2_1_clone.some((v) => v && /^[0-9]+位$/.test(v))
        ) {
          key1[2] = "順位";
        }
        while (key1.length < 5) key1.push("");
        const tableName = prefix;
        const post_key_new = post_key.replace(
          /:::[^:]+::/,
          `:::${tableName}::`
        );
        formattedData.push({
          post_key: post_key_new,
          key1,
          key2: key2_1_clone.slice(0, 22),
        });
      }
    });

    // Generate Excel file using ExcelJS
    const workbook = new window.ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datakey");

    // Add headers
    const headers = ["確認", "key2数", "post_key"];
    for (let i = 1; i <= 5; i++) headers.push(`key1-${i}`);
    for (let i = 1; i <= 22; i++) headers.push(`key2-${i}`);
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9EAD3" }, // light green
      };
      cell.font = { name: "Arial" };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    formattedData.forEach((row, idx) => {
      const key2Values = row.key2;
      const key2Count = key2Values.filter(
        (value) => value && value.toString().trim() !== ""
      ).length;

      const rowData = [
        "", // 確認
        key2Count, // key2数
        row.post_key, // post_key
        ...row.key1, // key1-1 to key1-5
        ...Array(22)
          .fill("")
          .map((_, i) => key2Values[i] || ""), // key2-1 to key2-22
      ];
      const addedRow = worksheet.addRow(rowData);
      // Zebra stripe: even row (ExcelJS index starts at 1, so +1 for data)
      const isEven = idx % 2 === 0;
      addedRow.eachCell((cell, colNumber) => {
        // Border for all cells
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        // Cột key2-1 (cột số 9): nền vàng nhạt
        if (colNumber === 9) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFF2CC" }, // light yellow
          };
        } else if (colNumber !== 3) {
          // Zebra stripe (trừ cột post_key đã có màu riêng)
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isEven ? "FFFFFFFF" : "FFD9EAD3" }, // white or light green
          };
        }
        // Căn lề: header đã căn giữa, dữ liệu căn trái (hoặc center nếu muốn)
        cell.alignment = { vertical: "middle", horizontal: "left" };
        // Font Arial cho toàn bộ dữ liệu
        cell.font = { name: "Arial" };
      });
      // Style post_key cell
      const postKeyCell = addedRow.getCell(3); // 1-based index
      if (typeof row.post_key === "string") {
        if (row.post_key.includes("SA")) {
          postKeyCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFB7E1FF" }, // light blue
          };
        } else if (row.post_key.includes("MA")) {
          postKeyCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFB7DD" }, // light pink
          };
        } else {
          // Nếu không phải SA/MA thì zebra stripe như các cột khác
          postKeyCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isEven ? "FFFFFFFF" : "FFD9EAD3" },
          };
        }
        // Font Arial cho post_key
        postKeyCell.font = { name: "Arial" };
      }
    });

    // Set width for columns: cột 1,2 là 10 (~80px), còn lại 15 (~120px)
    worksheet.columns.forEach((column, idx) => {
      if (idx === 0 || idx === 1) {
        column.width = 10; // ~80px
      } else {
        column.width = 15; // ~120px
      }
    });

    // Download Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `datakey_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert("Excelファイルが作成されました。");
    });
    return;
  } catch (error) {
    console.error("Error creating datakey:", error);
    alert("エラーが発生しました。" + error.message);
  }
}
// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateCSV") {
    try {
      const csvContent = generateCSVContent(request.data);
      downloadCSV(csvContent);
      sendResponse({ success: true });
    } catch (error) {
      console.error("Error generating CSV:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});
