chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "startBtnClick": {
      const startBtn = document.querySelector("body > div.next_btn");
      if (startBtn) startBtn.click();
      break;
    }

    case "saBtnClick": {
      const oneBtn = document.querySelectorAll("input[type=radio]");
      const midIndex = Math.floor(oneBtn.length / 2);

      // Đảm bảo phần tử tồn tại và chưa bị disabled/ẩn
      if (oneBtn.length > 0 && oneBtn[midIndex]) {
        oneBtn[midIndex].checked = true;
        oneBtn[midIndex].dispatchEvent(new Event("input", { bubbles: true }));
        oneBtn[midIndex].dispatchEvent(new Event("change", { bubbles: true }));
      }
      break;
    }

    case "oneAllBtnClick": {
      const oneAll = document.querySelector("#chk_1_btn");
      if (oneAll) oneAll.click();
      break;
    }

    case "sa1BtnClick": {
      const sc1Btn = document.querySelector(
        "#q_data > table > tbody > tr:nth-child(1) > td > input[type=radio]"
      );
      if (sc1Btn) sc1Btn.click();
      break;
    }

    case "nextBtnClick": {
      const nextBtn = document.querySelector(".blue.next_btn");
      if (nextBtn) nextBtn.click();
      break;
    }

    case "checkRestartBtn": {
      const restartBtn = document.querySelector("button#restart_btn"); // p server
      // const restartBtn = document.querySelector("button.restart_btn"); //q server
      sendResponse({ status: !!restartBtn });
      break;
    }

    case "clickRestartBtn": {
      const restartBtn = document.querySelector("button#restart_btn"); // p server
      // const restartBtn = document.querySelector("button.restart_btn"); //q server
      if (restartBtn) restartBtn.click();
      const okBtn = document.querySelector("#alertify-ok");
      if (okBtn) okBtn.click();
      sendResponse({ status: true });
      break;
    }

    case "sonotaBoxClick": {
      const allSonotaInputs = document.querySelectorAll("input.b_input");

      allSonotaInputs.forEach((input) => {
        const hasTClass = Array.from(input.classList).some((className) =>
          className.endsWith("_T")
        );

        // Chỉ nhập nếu có class _T và KHÔNG bị disabled
        if (hasTClass && !input.disabled) {
          input.value = "Sonota";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      break;
    }

    case "alertCheck": {
      let attempts = 0;
      const interval = setInterval(() => {
        const alertBox = document.querySelector("#alertify");
        if (alertBox) {
          clearInterval(interval);
          const okBtn = document.querySelector("#alertify-ok");
          if (okBtn) okBtn.click();
          sendResponse({ status: true });
        } else if (attempts >= 10) {
          clearInterval(interval);
          sendResponse({ status: false });
        }
        attempts++;
      }, 300);

      return true;
    }

    case "noInputCheck": {
      const nextBtn = document.querySelector(".blue.next_btn");
      if (nextBtn) nextBtn.click();

      let attempts = 0;
      const interval = setInterval(() => {
        const alertBox = document.querySelector("#alertify");
        if (alertBox) {
          clearInterval(interval);
          const okBtn = document.querySelector("#alertify-ok");
          if (okBtn) okBtn.click();
          sendResponse({ status: true });
        } else if (attempts >= 10) {
          clearInterval(interval);
          sendResponse({ status: false });
        }
        attempts++;
      }, 300);

      return true;
    }

    case "getNoData": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const inputs = document.querySelectorAll("input.s_input");
      const values = [];

      inputs.forEach((input) => {
        values.push({
          id: input.id,
          value: input.value,
          pageId: currentPage,
        });
      });

      sendResponse({ data: values });
      return true;
    }

    case "getSaData": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const selectedRadios = document.querySelectorAll(
        'input[type="radio"]:checked'
      );
      const values = [];

      selectedRadios.forEach((radio) => {
        values.push({
          id: radio.name,
          value: radio.value,
          pageId: currentPage,
        });
      });

      sendResponse({ data: values });
      return true;
    }

    case "getMaData": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const checkedBoxes = document.querySelectorAll(
        'input[type="checkbox"]:checked'
      );
      const values = [];

      checkedBoxes.forEach((box) => {
        values.push({
          id: box.id || "unknown_id",
          name: box.name || null,
          value: box.value,
          pageId: currentPage,
        });
      });

      sendResponse({ data: values });
      return true;
    }

    case "saikeiInputCheck": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const saikeiOperator = jsonData?.saikei || ">";

      const ops = {
        ">": (a, b) => a > b,
        "<": (a, b) => a < b,
        ">=": (a, b) => a >= b,
        "<=": (a, b) => a <= b,
        "=": (a, b) => a == b,
        "!=": (a, b) => a != b,
      };

      const compare = ops[saikeiOperator];
      const results = [];

      let saikeiSpans = Array.from(
        document.querySelectorAll("span[id^='y_saikei']")
      );
      let isHorizontal = true;

      if (saikeiSpans.length === 0) {
        saikeiSpans = Array.from(
          document.querySelectorAll("span[id^='t_saikei']")
        );
        isHorizontal = false;
      }

      const inputClass = jsonData?.blade || "";

      saikeiSpans.forEach((span, index) => {
        const saikeiId = span.id || `unknown_${index}`;
        const saikeiVal = parseInt(span.textContent.trim(), 10);
        if (isNaN(saikeiVal)) return;

        let inputVals = [];
        let inputIds = [];

        if (isHorizontal) {
          const tr = span.closest("tr");
          if (!tr) return;

          const hasInput =
            tr.querySelectorAll(`input.${inputClass}`).length > 0;
          const hasSaikei =
            tr.querySelectorAll("span[id^='y_saikei']").length > 0;

          if (!hasInput || !hasSaikei) return;

          const inputs = Array.from(tr.querySelectorAll(`input.${inputClass}`));
          inputs.forEach((input) => {
            const val = parseInt(input.value.trim(), 10);
            if (!isNaN(val)) {
              inputVals.push(val);
              inputIds.push(input.id);
            }
          });
        } else {
          const inputEl = document.querySelectorAll(`input.${inputClass}`)[
            index
          ];
          if (inputEl) {
            const val = parseInt(inputEl.value.trim(), 10);
            if (!isNaN(val)) {
              inputVals.push(val);
              inputIds.push(inputEl.id);
            }
          }
        }

        const inputTotal = inputVals.reduce((a, b) => a + b, 0);

        results.push({
          saikeiId,
          saikeiVal,
          inputIds,
          inputTotal,
          status: compare(saikeiVal, inputTotal),
          pageId: currentPage,
        });
      });

      sendResponse({ data: results });
      return true;
    }

    case "autoInputBySaikei": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const saikeiOperator = jsonData?.saikei || "=";
      const inputClass = jsonData?.blade || "";
      const opsInput = {
        ">": (a) => a - 1,
        "<": (a) => a + 1,
        ">=": (a) => a,
        "<=": (a) => a,
        "=": (a) => a,
        "!=": (a) => a + 1,
      };

      const computeInput = opsInput[saikeiOperator];
      const results = [];

      // Helper function để input và push kết quả
      const handleInput = (
        inputEl,
        saikeiId,
        saikeiVal,
        valueToInput,
        index,
        i
      ) => {
        inputEl.value = valueToInput;
        inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        inputEl.dispatchEvent(new Event("change", { bubbles: true }));

        results.push({
          saikeiId,
          saikeiVal,
          inputId: inputEl.id || `input_${index}_${i}`,
          valueToInput,
          pageId: currentPage,
        });
      };

      // ==== Xử lý theo hàng (y_saikei) ====
      const ySaikeiSpans = Array.from(
        document.querySelectorAll("span[id^='y_saikei']")
      );
      ySaikeiSpans.forEach((span, index) => {
        const saikeiId = span.id || `unknown_y_${index}`;
        const saikeiVal = parseInt(span.textContent.trim(), 10);
        if (isNaN(saikeiVal)) return;

        const tr = span.closest("tr");
        if (!tr) return;

        const inputEls = Array.from(tr.querySelectorAll("input")).filter(
          (input) => {
            return (
              input.classList.contains(inputClass) ||
              input.className.startsWith(inputClass + "_")
            );
          }
        );

        if (inputEls.length === 0) return;

        const targetVal = computeInput(saikeiVal);
        const divided = Math.floor(targetVal / inputEls.length);
        const remainder = targetVal % inputEls.length;

        inputEls.forEach((inputEl, i) => {
          const valueToInput = divided + (i < remainder ? 1 : 0);
          handleInput(inputEl, saikeiId, saikeiVal, valueToInput, index, i);
        });
      });

      // ==== Xử lý theo cột (t_saikei) ====
      const tSaikeiSpans = Array.from(
        document.querySelectorAll("span[id^='t_saikei']")
      );
      tSaikeiSpans.forEach((span, index) => {
        const saikeiId = span.id || `unknown_t_${index}`;
        const saikeiVal = parseInt(span.textContent.trim(), 10);
        if (isNaN(saikeiVal)) return;

        const spanIndexMatch = span.id.match(/\d+$/);
        const spanIndex = spanIndexMatch ? spanIndexMatch[0] : index;

        const inputEls = Array.from(document.querySelectorAll("input")).filter(
          (input) => {
            const classList = input.className.split(/\s+/);
            return classList.some(
              (c) => c === inputClass || c === `${inputClass}_${spanIndex}`
            );
          }
        );

        if (inputEls.length === 0) return;

        const targetVal = computeInput(saikeiVal);
        const divided = Math.floor(targetVal / inputEls.length);
        const remainder = targetVal % inputEls.length;

        inputEls.forEach((inputEl, i) => {
          const valueToInput = divided + (i < remainder ? 1 : 0);
          handleInput(inputEl, saikeiId, saikeiVal, valueToInput, index, i);
        });
      });

      sendResponse({ data: results });
      return true;
    }

    case "goKeiSaikeiCheck": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const gokeiOperator = jsonData?.gokei || "==";
      const bladeBase = jsonData?.blade || ""; // VD: Q15

      const opsGokei = {
        ">": (a, b) => a > b,
        "<": (a, b) => a < b,
        ">=": (a, b) => a >= b,
        "<=": (a, b) => a <= b,
        "=": (a, b) => a == b,
        "!=": (a, b) => a != b,
      };

      const compareGokei = opsGokei[gokeiOperator];
      const results = [];

      const saikeiMulti = document.querySelector(`#t_saikei_1`);

      if (saikeiMulti) {
        // Trường hợp nhiều cột
        let i = 1;
        while (true) {
          const saikeiSpan = document.querySelector(`#t_saikei_${i}`);
          const gokeiEl = document.querySelector(`#${bladeBase}_${i}_total`);
          if (!saikeiSpan || !gokeiEl) break;

          const saikeiVal = parseInt(saikeiSpan.textContent.trim(), 10);
          const gokeiVal = parseInt(gokeiEl.textContent.trim(), 10);

          if (!isNaN(saikeiVal) && !isNaN(gokeiVal)) {
            results.push({
              saikeiId: saikeiSpan.id,
              saikeivalue: saikeiVal,
              gokeiId: `${bladeBase}_${i}_total`,
              gokeivalue: gokeiVal,
              status: compareGokei(gokeiVal, saikeiVal),
              bladeGroup: `${bladeBase}_${i}`,
              pageId: currentPage,
            });
          }

          i++;
        }
      } else {
        // Trường hợp 1 cột
        const saikeiSpan = document.querySelector(`#t_saikei`);
        const gokeiEl = document.querySelector(`#${bladeBase}_total`);

        const saikeiVal = saikeiSpan
          ? parseInt(saikeiSpan.textContent.trim(), 10)
          : NaN;
        const gokeiVal = gokeiEl
          ? parseInt(gokeiEl.textContent.trim(), 10)
          : NaN;

        if (!isNaN(saikeiVal) && !isNaN(gokeiVal)) {
          results.push({
            saikeiId: saikeiSpan?.id || "t_saikei",
            saikeivalue: saikeiVal,
            gokeiId: `${bladeBase}_total`,
            gokeivalue: gokeiVal,
            status: compareGokei(gokeiVal, saikeiVal),
            bladeGroup: bladeBase,
            pageId: currentPage,
          });
        }
      }

      sendResponse({ data: results });
      return true;
    }

    case "autoInputByGokei": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const gokeiOperator = jsonData?.gokei || "=";
      const bladeBase = jsonData?.blade || "";
      const results = [];

      function sendSaveData(message) {
        chrome.runtime.sendMessage({ action: "saveData", message });
      }

      function generateRandomSumArray(count, total) {
        if (count === 1) return [total];
        const numbers = Array.from({ length: count - 1 }, () =>
          Math.floor(Math.random() * (total + 1))
        );
        numbers.push(0, total);
        numbers.sort((a, b) => a - b);
        const result = [];
        for (let i = 1; i < numbers.length; i++) {
          result.push(numbers[i] - numbers[i - 1]);
        }
        let diff = total - result.reduce((sum, val) => sum + val, 0);
        let index = 0;
        while (diff !== 0) {
          if (diff > 0 && result[index] < total) {
            result[index]++;
            diff--;
          } else if (diff < 0 && result[index] > 0) {
            result[index]--;
            diff++;
          }
          index = (index + 1) % result.length;
        }
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
      }

      function processInputs(inputEls, saikeiVal, groupName) {
        const visibleInputs = inputEls.filter(
          (input) => input.offsetParent !== null
        );
        const hiddenInputs = inputEls.filter(
          (input) => input.offsetParent === null
        );

        if (hiddenInputs.length > 0) {
          hiddenInputs.forEach((inputEl, index) => {
            sendSaveData({
              blade: groupName,
              inputId: inputEl.id || `hidden_input_${groupName}_${index}`,
              status: "hidden",
              pageId: currentPage,
            });
          });
        }

        if (visibleInputs.length === 0) {
          console.warn(
            `❌ Không tìm thấy input hiển thị nào cho nhóm ${groupName}`
          );
          return;
        }

        let targetValue = saikeiVal;
        switch (gokeiOperator) {
          case ">":
            targetValue += visibleInputs.length;
            break;
          case "<":
            targetValue = Math.max(targetValue - visibleInputs.length, 0);
            break;
          case "!=":
            targetValue += 10;
            break;
        }

        const randomValues = generateRandomSumArray(
          visibleInputs.length,
          targetValue
        );

        visibleInputs.forEach((inputEl, index) => {
          const valueToInput = randomValues[index];
          inputEl.value = valueToInput;
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));
          results.push({
            blade: groupName,
            inputId: inputEl.id || `input_${groupName}_${index}`,
            valueToInput,
            saikeiTarget: saikeiVal,
            gokeiExpected: targetValue,
            operator: gokeiOperator,
            pageId: currentPage,
          });
        });
      }

      const tSaikeiSpans = Array.from(
        document.querySelectorAll("span[id^='t_saikei']")
      );
      const ySaikeiSpans = Array.from(
        document.querySelectorAll("span[id^='y_saikei']")
      );

      if (tSaikeiSpans.length > 0) {
        tSaikeiSpans.forEach((span) => {
          const idMatch = span.id.match(/t_saikei_?(\d*)/);
          const groupNumber = idMatch?.[1] || "";
          const saikeiVal = parseInt(span.textContent.trim(), 10);
          if (isNaN(saikeiVal)) return;

          const inputClass = groupNumber
            ? `${bladeBase}_${groupNumber}`
            : bladeBase;
          const inputEls = Array.from(
            document.querySelectorAll(`input.${inputClass}`)
          );

          console.log(
            "🔍 Đang xử lý t_saikei:",
            span.id,
            "→ group:",
            groupNumber,
            "→ class:",
            inputClass,
            "→ input:",
            inputEls.length
          );

          if (inputEls.length > 0) {
            processInputs(inputEls, saikeiVal, inputClass);
          } else {
            console.warn(`❌ Không tìm thấy input với class '${inputClass}'`);
          }
        });
      }

      if (tSaikeiSpans.length === 0 && ySaikeiSpans.length > 0) {
        ySaikeiSpans.forEach((span) => {
          const row = span.closest("tr");
          if (!row) return;

          const saikeiVal = parseInt(span.textContent.trim(), 10);
          if (isNaN(saikeiVal)) return;

          const inputEls = Array.from(
            row.querySelectorAll(`input[class*="${bladeBase}"]`)
          );
          const groupName =
            span.id || `row_${Math.random().toString(36).substring(2, 8)}`;

          console.log(
            "🔍 Đang xử lý y_saikei:",
            span.id,
            "→ input:",
            inputEls.length
          );

          if (inputEls.length > 0) {
            processInputs(inputEls, saikeiVal, groupName);
          } else {
            console.warn(`❌ Không tìm thấy input cho hàng ${span.id}`);
          }
        });
      }

      sendResponse({ data: results });
      return true;
    }

    case "autoInputByGokeiY": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const gokeiOperator = jsonData?.gokei || "=";
      const bladeBase = jsonData?.blade || "";
      const results = [];

      function sendSaveData(message) {
        chrome.runtime.sendMessage({ action: "saveData", message });
      }

      function generateRandomSumArray(count, total) {
        if (count === 1) return [total];
        const numbers = Array.from({ length: count - 1 }, () =>
          Math.floor(Math.random() * (total + 1))
        );
        numbers.push(0, total);
        numbers.sort((a, b) => a - b);
        const result = [];
        for (let i = 1; i < numbers.length; i++) {
          result.push(numbers[i] - numbers[i - 1]);
        }
        let diff = total - result.reduce((sum, val) => sum + val, 0);
        let index = 0;
        while (diff !== 0) {
          if (diff > 0 && result[index] < total) {
            result[index]++;
            diff--;
          } else if (diff < 0 && result[index] > 0) {
            result[index]--;
            diff++;
          }
          index = (index + 1) % result.length;
        }
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
      }

      function processInputs(inputEls, saikeiVal, groupName) {
        const visibleInputs = inputEls.filter(
          (input) => input.offsetParent !== null
        );
        const hiddenInputs = inputEls.filter(
          (input) => input.offsetParent === null
        );

        if (hiddenInputs.length > 0) {
          hiddenInputs.forEach((inputEl, index) => {
            sendSaveData({
              blade: groupName,
              inputId: inputEl.id || `hidden_input_${groupName}_${index}`,
              status: "hidden",
              pageId: currentPage,
            });
          });
        }

        if (visibleInputs.length === 0) {
          console.warn(
            `❌ Không tìm thấy input hiển thị nào cho nhóm ${groupName}`
          );
          return;
        }

        let targetValue = saikeiVal;
        switch (gokeiOperator) {
          case ">":
            targetValue += visibleInputs.length;
            break;
          case "<":
            targetValue = Math.max(targetValue - visibleInputs.length, 0);
            break;
          case "!=":
            targetValue += 10;
            break;
        }

        const randomValues = generateRandomSumArray(
          visibleInputs.length,
          targetValue
        );

        visibleInputs.forEach((inputEl, index) => {
          const valueToInput = randomValues[index];
          inputEl.value = valueToInput;
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));
          results.push({
            blade: groupName,
            inputId: inputEl.id || `input_${groupName}_${index}`,
            valueToInput,
            saikeiTarget: saikeiVal,
            gokeiExpected: targetValue,
            operator: gokeiOperator,
            pageId: currentPage,
          });
        });
      }

      const ySaikeiSpans = Array.from(
        document.querySelectorAll("span[id*='saikei']")
      );

      ySaikeiSpans.forEach((span) => {
        const row = span.closest("tr");
        if (!row) return;

        const saikeiVal = parseInt(span.textContent.trim(), 10);
        if (isNaN(saikeiVal)) return;

        const inputEls = Array.from(
          row.querySelectorAll(`input[class*="${bladeBase}"]`)
        );
        const groupName =
          span.id || `row_${Math.random().toString(36).substring(2, 8)}`;

        console.log(
          "🔍 Đang xử lý y_saikei:",
          span.id,
          "→ input:",
          inputEls.length
        );

        if (inputEls.length > 0) {
          processInputs(inputEls, saikeiVal, groupName);
        } else {
          console.warn(`❌ Không tìm thấy input cho hàng ${span.id}`);
        }
      });

      sendResponse({ data: results });
      return true;
    }

    case "goKei100Check": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const bladeBase = jsonData?.blade || "";
      const results = [];

      const inputGroups = {};
      const allInputs = document.querySelectorAll(
        `input[class*="${bladeBase}"]`
      );

      allInputs.forEach((inputEl) => {
        const matchedClass = Array.from(inputEl.classList)
          .filter((cls) => {
            if (!cls.startsWith(bladeBase)) return false;
            const tail = cls.replace(bladeBase, "").replace(/^_/, "");
            if (!tail) return true;
            return tail.split("_").every((part) => /^\d+$/.test(part));
          })
          .sort((a, b) => b.length - a.length)[0];

        if (!matchedClass) return;

        // Phân tích class để gom theo "cột"
        const parts = matchedClass.split("_");
        let groupKey = matchedClass; // mặc định

        if (parts.length === 3)
          groupKey = `${parts[0]}_${parts[2]}`; // Q15_1_2 → Q15_2
        else if (parts.length === 2) groupKey = matchedClass; // Q15_2
        else if (parts.length === 1) groupKey = matchedClass; // Q15

        if (!inputGroups[groupKey]) inputGroups[groupKey] = [];
        inputGroups[groupKey].push(inputEl);
      });

      for (const [groupKey, inputEls] of Object.entries(inputGroups)) {
        let sum = 0;
        const values = [];

        inputEls.forEach((inputEl, idx) => {
          const val = parseInt(inputEl.value.trim(), 10);
          if (!isNaN(val)) {
            sum += val;
            values.push({
              inputId: inputEl.id || `input_${groupKey}_${idx}`,
              value: val,
            });
          }
        });

        results.push({
          blade: groupKey,
          totalInputSum: sum,
          expected: 100,
          status: sum === 100,
          pageId: currentPage,
          values,
        });
      }

      sendResponse({ data: results });
      return true;
    }

    case "autoInputByGokei100": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const bladeBase = jsonData?.blade || "";
      const results = [];

      const inputGroups = {};
      const allInputs = document.querySelectorAll(
        `input[class*="${bladeBase}"]`
      );

      allInputs.forEach((inputEl) => {
        const matchedClass = Array.from(inputEl.classList)
          .filter((cls) => {
            if (!cls.startsWith(bladeBase)) return false;
            const tail = cls.replace(bladeBase, "").replace(/^_/, "");
            if (!tail) return true;
            return tail.split("_").every((part) => /^\d+$/.test(part));
          })
          .sort((a, b) => b.length - a.length)[0];

        if (!matchedClass) return;

        const groupKey = matchedClass;
        if (!inputGroups[groupKey]) inputGroups[groupKey] = [];
        inputGroups[groupKey].push(inputEl);
      });

      // Hàm tạo mảng số random sao cho tổng = 100
      function generateRandomSumArray(count, total) {
        const numbers = Array.from({ length: count - 1 }, () =>
          Math.floor(Math.random() * (total + 1))
        );
        numbers.push(0, total);
        numbers.sort((a, b) => a - b);

        const result = [];
        for (let i = 1; i < numbers.length; i++) {
          result.push(numbers[i] - numbers[i - 1]);
        }

        // Shuffle để tránh thứ tự dễ đoán
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
      }

      for (const [groupKey, inputEls] of Object.entries(inputGroups)) {
        const n = inputEls.length;
        const randomValues = generateRandomSumArray(n, 100);

        inputEls.forEach((inputEl, idx) => {
          const val = randomValues[idx];
          inputEl.value = val;
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));

          results.push({
            bladeGroup: groupKey,
            inputId: inputEl.id || `input_${groupKey}_${idx}`,
            valueToInput: val,
            pageId: currentPage,
          });
        });
      }

      sendResponse({ data: results });
      return true;
    }

    case "totalValueCheck": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const jsonData = message.jsonData;
      const bladeBase = jsonData?.blade || "";
      const totalValue = parseInt(jsonData?.totalValue || "100", 10);
      const comparison = jsonData?.comparison || "=";
      const results = [];

      const compareFn = (sum) => {
        switch (comparison) {
          case "=":
            return sum === totalValue;
          case "!=":
            return sum !== totalValue;
          case ">":
            return sum > totalValue;
          case "<":
            return sum < totalValue;
          case ">=":
            return sum >= totalValue;
          case "<=":
            return sum <= totalValue;
          default:
            return sum === totalValue;
        }
      };

      const inputGroups = {};
      const allInputs = document.querySelectorAll(
        `input[class*="${bladeBase}"]`
      );

      allInputs.forEach((inputEl) => {
        const matchedClass = Array.from(inputEl.classList)
          .filter((cls) => {
            if (!cls.startsWith(bladeBase)) return false;
            const tail = cls.replace(bladeBase, "").replace(/^_/, "");
            if (!tail) return true;
            return tail.split("_").every((part) => /^\d+$/.test(part));
          })
          .sort((a, b) => b.length - a.length)[0];

        if (!matchedClass) return;

        const parts = matchedClass.split("_");
        let groupKey = matchedClass;
        if (parts.length === 3) groupKey = `${parts[0]}_${parts[2]}`;
        if (!inputGroups[groupKey]) inputGroups[groupKey] = [];
        inputGroups[groupKey].push(inputEl);
      });

      for (const [groupKey, inputEls] of Object.entries(inputGroups)) {
        let sum = 0;
        const values = [];

        inputEls.forEach((inputEl, idx) => {
          const val = parseInt(inputEl.value.trim(), 10);
          if (!isNaN(val)) {
            sum += val;
            values.push({
              inputId: inputEl.id || `input_${groupKey}_${idx}`,
              value: val,
            });
          }
        });

        results.push({
          blade: groupKey,
          totalInputSum: sum,
          expected: totalValue,
          comparison,
          status: compareFn(sum),
          pageId: currentPage,
          values,
        });
      }

      sendResponse({ data: results });
      return true;
    }

    case "rndSaBtnClick": {
      const rndSa = document.querySelector("#chk_rand_btn");
      if (rndSa) rndSa.click();
      break;
    }

    case "rndMaBtnClick": {
      const rndMa = document.querySelector("#chk_all_btn");
      if (rndMa) rndMa.click();
      break;
    }

    case "rndStep100Click": {
      const inputEls = Array.from(document.querySelectorAll("input"));

      const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      const results = [];

      inputEls.forEach((inputEl, index) => {
        if (inputEl && inputEl.type === "text") {
          const randomVal = steps[Math.floor(Math.random() * steps.length)];

          inputEl.value = randomVal;
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));

          results.push({
            inputId: inputEl.id || `input_${index}`,
            value: randomVal,
          });
        }
      });

      sendResponse({ data: results });
      return true;
    }

    case "rndStep10Click": {
      const inputEls = Array.from(document.querySelectorAll("input"));

      const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const results = [];

      inputEls.forEach((inputEl, index) => {
        if (inputEl && inputEl.type === "text") {
          const randomVal = steps[Math.floor(Math.random() * steps.length)];

          inputEl.value = randomVal;
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));

          results.push({
            inputId: inputEl.id || `input_${index}`,
            value: randomVal,
          });
        }
      });

      sendResponse({ data: results });
      return true;
    }

    case "tsgCheck": {
      const tsgBtn = document.querySelector(".end_view");
      if (tsgBtn) {
        sendResponse({ status: true });
      } else {
        sendResponse({ status: false });
      }
      return true;
    }

    case "doneCheck": {
      const doneScreen = document.querySelector("#thanks_amazon");
      const isThankYouMessage =
        document.body.innerText.includes("ご協力ありがとうございました");
      if (doneScreen || isThankYouMessage) {
        sendResponse({ status: true });
      } else {
        sendResponse({ status: false });
      }
      return true;
    }

    case "getNowQ": {
      let currentNumber = parseInt(
        document.getElementById("now_q").innerText,
        10
      );
      currentNumber ? currentNumber : 0;
      sendResponse({ value: currentNumber });
      return true;
    }

    case "numCheckAutoTest": {
      (async () => {
        const jsonData = message.jsonData;
        const inputClass = jsonData?.blade || "";
        const allInputs = Array.from(
          document.querySelectorAll(`input.${inputClass}`)
        );

        const testCases = [
          { type: "specialChars", value: "!@#$%^&*()" },
          { type: "alphabet", value: "abcXYZ" },
          { type: "decimal", value: "1.1" },
          { type: "decimalZero", value: "5.0" },
          { type: "zenkakuNumber", value: "１２３" }, // Full-width Japanese number
        ];

        const results = [];

        async function simulateTyping(input, text) {
          input.focus();
          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));

          for (const char of text) {
            const eventParams = {
              key: char,
              char,
              keyCode: char.charCodeAt(0),
              bubbles: true,
            };

            input.dispatchEvent(new KeyboardEvent("keydown", eventParams));
            input.value += char;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new KeyboardEvent("keyup", eventParams));

            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          input.dispatchEvent(new Event("change", { bubbles: true }));
        }

        for (const inputEl of allInputs) {
          for (const test of testCases) {
            await simulateTyping(inputEl, test.value);

            const actualValue = inputEl.value;

            let isPass = true;

            if (test.type === "specialChars" || test.type === "alphabet") {
              isPass = actualValue === "";
            } else if (test.type === "decimal" || test.type === "decimalZero") {
              isPass = actualValue === test.value;
            } else if (test.type === "zenkakuNumber") {
              const converted = test.value.replace(/[０-９]/g, (s) =>
                String.fromCharCode(s.charCodeAt(0) - 65248)
              );
              isPass = actualValue === converted;
            }

            results.push({
              inputId: inputEl.id,
              testType: test.type,
              expectedValue: test.value,
              actualValue,
              isPass,
            });
          }
        }

        sendResponse({ data: results });
      })();

      return true;
    }

    case "getBladeType": {
      const article = document.querySelector("article.question_detail");
      let bladeText = "";

      if (article) {
        const textNode = [...article.childNodes].find(
          (n) => n.nodeType === Node.TEXT_NODE
        );
        const rawText = textNode?.textContent?.trim() || "";
        bladeText = rawText.replace(/^■\s*/, "").trim();
      }

      // Xác định type dựa trên layout
      const typeList = [];

      const s0data = document.querySelector("body > div.next_btn");
      const sc0data = document.querySelector(
        "#q_data > div:nth-child(5) > table > tbody > tr:nth-child(1) > th"
      );
      const sadata = document.querySelectorAll("input[type=radio]");
      const nodata = document.querySelectorAll("input.s_input");
      const madata = document.querySelectorAll('input[type="checkbox"]');
      const selectdata = document.querySelectorAll("select");
      const fadata = document.querySelectorAll("textarea");
      const sonotadata = document.querySelectorAll("input.b_input");
      const fdata = document.querySelectorAll(".question");
      const thankdata = document.querySelector(".q_thanks");

      if (s0data) typeList.push("FIRSTPAGE");
      if (sc0data) typeList.push("SC0");

      // Kiểm tra input số
      if (nodata.length > 0) typeList.push("NO");

      // Nếu có nhiều block question thì là F
      if (fdata.length > 1) typeList.push("F");

      // Check FA
      if (fadata.length > 0) typeList.push("FA");

      // Check checkbox
      if (madata.length > 0) typeList.push("MA");

      // Nếu là radio mà không phải FIRSTPAGE, SC0, hoặc F nhiều dòng → là SA
      if (sadata.length > 0 && !s0data && !sc0data && fdata.length <= 1) {
        if (madata.length > 0 && madata.length === sadata.length) {
          typeList.pop("MA");
          typeList.push("MASA");
        } else {
          typeList.push("SA");
        }
      }

      // Check select box
      if (selectdata.length > 0) {
        if (sadata.length > 0 || madata.length > 0) {
          typeList.push("JOUI");
        } else if (thankdata) {
          typeList.push("THANKPAGE");
        } else {
          typeList.push("SELECT");
        }
      }

      // Check Sonata
      // if (sonotadata) typeList.push("SONOTA");

      // Không xác định được gì thì là NP (Next Page)
      if (typeList.length === 0) typeList.push("NP");

      // Nếu không có bladeText, dùng type đầu tiên
      if (!bladeText) {
        bladeText = typeList[0];
      }

      const hasY = document.querySelectorAll("span[id^='y_saikei']").length > 0;
      const hasT = document.querySelectorAll("span[id^='t_saikei']").length > 0;

      sendResponse({
        status: true,
        type: typeList,
        blade: bladeText,
        hasY,
        hasT,
      });
      return true;
    }

    case "selectJoui": {
      const selectedValues = new Set();
      let checkedInputs = document.querySelectorAll(
        'input[type="checkbox"]:checked'
      );
      if (checkedInputs.length === 0) {
        checkedInputs = document.querySelectorAll(
          'input[type="radio"]:checked'
        );
      }

      const selectList = [];

      checkedInputs.forEach((input) => {
        const tr = input.closest("tr");
        if (!tr) return;

        // Tìm select trong cùng tr — có thể nằm ở bất kỳ td nào
        const select = tr.querySelector("select");
        if (select) selectList.push(select);
      });

      selectList.forEach((select) => {
        const availableOptions = Array.from(select.options).filter((option) => {
          return (
            option.value &&
            !selectedValues.has(option.value) &&
            !option.disabled
          );
        });

        if (availableOptions.length === 0) {
          console.warn("⚠️ Không còn option khả dụng cho select này.");
          return;
        }

        const randomOption =
          availableOptions[Math.floor(Math.random() * availableOptions.length)];
        select.value = randomOption.value;
        selectedValues.add(randomOption.value);

        // Kích hoạt change và input event
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });

      break;
    }

    case "randomSelectForTable": {
      const table = document.querySelector("table"); // chọn đúng table
      if (!table) return;

      const rows = table.querySelectorAll("tr");
      const columnSelects = {};

      // Bước 1: Gom tất cả select theo cột
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, colIndex) => {
          const select = cell.querySelector("select");
          if (select) {
            if (!columnSelects[colIndex]) columnSelects[colIndex] = [];
            columnSelects[colIndex].push(select);
          }
        });
      });

      // Bước 2: Xử lý random theo cột (nếu đủ option)
      const selectedValuesByColumn = {};
      Object.entries(columnSelects).forEach(([colIndex, selects]) => {
        const optionsCount = Array.from(selects[0].options).filter(
          (option) => option.value
        ).length;
        if (optionsCount >= selects.length) {
          selectedValuesByColumn[colIndex] = new Set();

          selects.forEach((select) => {
            const availableOptions = Array.from(select.options).filter(
              (option) =>
                option.value &&
                !selectedValuesByColumn[colIndex].has(option.value)
            );

            if (availableOptions.length > 0) {
              const randomOption =
                availableOptions[
                  Math.floor(Math.random() * availableOptions.length)
                ];
              select.value = randomOption.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
              selectedValuesByColumn[colIndex].add(randomOption.value);
            } else {
              console.warn(
                `⚠️ Không còn option khả dụng trong cột ${colIndex}`
              );
            }
          });
        }
      });

      // Bước 3: Nếu cột thiếu option, xử lý random theo hàng
      rows.forEach((row) => {
        const rowSelects = row.querySelectorAll("select");
        const selectedValuesInRow = new Set();

        rowSelects.forEach((select) => {
          if (!select.value) {
            const availableOptions = Array.from(select.options).filter(
              (option) => option.value && !selectedValuesInRow.has(option.value)
            );

            if (availableOptions.length > 0) {
              const randomOption =
                availableOptions[
                  Math.floor(Math.random() * availableOptions.length)
                ];
              select.value = randomOption.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
              selectedValuesInRow.add(randomOption.value);
            } else {
              console.warn(`⚠️ Không còn option khả dụng trong hàng.`);
            }
          }
        });
      });
    }

    case "getAlertText": {
      const alertElement = document.querySelector(
        "#alertify > div > article > p"
      );
      const alertText = alertElement ? alertElement.innerText : "";

      if (alertText.trim() !== "") {
        sendResponse({ status: true, alertText });
      } else {
        sendResponse({ status: false, alertText: "" });
      }

      return true;
    }

    case "autoInputByNum": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const results = [];

      // Bước 1: Lấy alert text
      const alertElement = document.querySelector(
        "#alertify > div > article > p"
      );
      if (!alertElement) {
        console.warn("⚠️ Không tìm thấy thông báo lỗi!");
        sendResponse({ data: results });
        return true;
      }

      const alertText = alertElement.innerText;

      // Bước 2: Trích xuất số từ cảnh báo
      const numbersInAlert = alertText.match(/\d+\.?\d*/g); // Lấy tất cả số, kể cả thập phân
      if (!numbersInAlert || numbersInAlert.length === 0) {
        console.warn("⚠️ Không tìm thấy số trong thông báo lỗi:", alertText);
        sendResponse({ data: results });
        return true;
      }

      const extractedNumber = parseFloat(numbersInAlert[0]);
      if (isNaN(extractedNumber)) {
        console.warn(
          "⚠️ Số trong thông báo lỗi không hợp lệ:",
          extractedNumber
        );
        sendResponse({ data: results });
        return true;
      }

      // Bước 3: Lấy tất cả input (không giới hạn class nữa)
      const allInputs = Array.from(
        document.querySelectorAll("input[type='text'], input[type='number']")
      );

      if (allInputs.length === 0) {
        console.warn("⚠️ Không tìm thấy bất kỳ input nào trên trang!");
        sendResponse({ data: results });
        return true;
      }

      // Bước 4: Nhập vào tất cả input giá trị lấy từ cảnh báo
      allInputs.forEach((inputEl, i) => {
        inputEl.value = extractedNumber;
        inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        inputEl.dispatchEvent(new Event("change", { bubbles: true }));

        results.push({
          inputId: inputEl.id || `input_${i}`,
          valueToInput: extractedNumber,
          pageId: currentPage,
        });
      });

      sendResponse({ data: results });
      return true;
    }

    case "autoInputDepressionCheck": {
      const alertElement = document.querySelector(
        "#alertify > div > article > p"
      );
      const alertText = alertElement ? alertElement.innerText : "";
      const match = alertText.match(/(\d+)/);

      if (!match) {
        sendResponse({
          status: false,
          message: "Không tìm thấy số trong cảnh báo",
        });
        return true;
      }

      const totalTarget = parseInt(match[1]);

      const inputs = Array.from(
        document.querySelectorAll("input.bg_error")
      ).filter((input) => input.offsetParent !== null && !input.disabled);

      const count = inputs.length;
      if (count === 0) {
        sendResponse({
          status: false,
          message: "Không có input bg_error nào hiển thị",
        });
        return true;
      }

      function generateRandomArrayWithTotal(count, total, zeroRatio = 0.3) {
        let arr = new Array(count).fill(0);
        let remaining = total;

        const zeroCount = Math.floor(count * zeroRatio);
        const indices = [...Array(count).keys()];

        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const nonZeroIndices = indices.slice(0, count - zeroCount);

        const points = [
          0,
          ...Array.from({ length: nonZeroIndices.length - 1 }, () =>
            Math.floor(Math.random() * remaining)
          ),
          remaining,
        ];
        points.sort((a, b) => a - b);

        const values = [];
        for (let i = 1; i < points.length; i++) {
          values.push(points[i] - points[i - 1]);
        }

        nonZeroIndices.forEach((idx, i) => {
          arr[idx] = values[i];
        });

        return arr;
      }

      const values = generateRandomArrayWithTotal(count, totalTarget, 0.3);

      inputs.forEach((input, idx) => {
        input.value = values[idx];
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });

      sendResponse({
        status: true,
        message: `Đã nhập ${count} input với tổng = ${totalTarget}`,
      });
      return true;
    }

    case "autoInputFromTotalRow": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const results = [];

      function sendSaveData(message) {
        chrome.runtime.sendMessage({ action: "saveData", message });
      }

      // Tạo mảng ngẫu nhiên có tổng = total
      function generateRandomSumArray(count, total) {
        if (count === 1) return [total];

        const numbers = Array.from({ length: count - 1 }, () =>
          Math.floor(Math.random() * (total + 1))
        );
        numbers.push(0, total);
        numbers.sort((a, b) => a - b);

        const result = [];
        for (let i = 1; i < numbers.length; i++) {
          result.push(numbers[i] - numbers[i - 1]);
        }

        let diff = total - result.reduce((sum, val) => sum + val, 0);
        let index = 0;
        while (diff !== 0) {
          if (diff > 0 && result[index] < total) {
            result[index]++;
            diff--;
          } else if (diff < 0 && result[index] > 0) {
            result[index]--;
            diff++;
          }
          index = (index + 1) % result.length;
        }

        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
      }

      const allRows = Array.from(document.querySelectorAll("table tbody tr"));

      allRows.forEach((row, rowIndex) => {
        const inputs = Array.from(row.querySelectorAll("input[type='text']"));
        if (inputs.length < 2) return;

        const visibleInputs = inputs.filter(
          (input) => input.offsetParent !== null
        );
        const errorInputs = visibleInputs.filter((input) =>
          input.classList.contains("bg_error")
        );
        const totalInputs = visibleInputs.filter(
          (input) => !input.classList.contains("bg_error")
        );

        if (errorInputs.length === 0 || totalInputs.length !== 1) return;

        const totalInput = totalInputs[0];
        const totalVal = parseInt(totalInput.value.trim(), 10);
        if (isNaN(totalVal)) {
          console.warn(`⚠️ Tổng không hợp lệ ở dòng ${rowIndex + 1}`);
          return;
        }

        const randomValues = generateRandomSumArray(
          errorInputs.length,
          totalVal
        );

        errorInputs.forEach((inputEl, idx) => {
          const valueToInput = randomValues[idx];

          inputEl.value = valueToInput;
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));

          results.push({
            row: rowIndex + 1,
            inputId: inputEl.id || `row${rowIndex + 1}_input${idx + 1}`,
            valueToInput,
            totalSource: totalVal,
            pageId: currentPage,
          });
        });
      });

      sendResponse({ data: results });
      return true;
    }

    case "autoInputFromTotalColumn": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const results = [];

      function sendSaveData(message) {
        chrome.runtime.sendMessage({ action: "saveData", message });
      }

      function generateRandomSumArray(count, total) {
        if (count === 1) return [total];

        const numbers = Array.from({ length: count - 1 }, () =>
          Math.floor(Math.random() * (total + 1))
        );
        numbers.push(0, total);
        numbers.sort((a, b) => a - b);

        const result = [];
        for (let i = 1; i < numbers.length; i++) {
          result.push(numbers[i] - numbers[i - 1]);
        }

        let diff = total - result.reduce((sum, val) => sum + val, 0);
        let index = 0;
        while (diff !== 0) {
          if (diff > 0 && result[index] < total) {
            result[index]++;
            diff--;
          } else if (diff < 0 && result[index] > 0) {
            result[index]--;
            diff++;
          }
          index = (index + 1) % result.length;
        }

        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
      }

      const totalSpan = document.querySelector("#t_saikei_1");
      if (!totalSpan) {
        console.warn("⚠️ Không tìm thấy tổng t_saikei.");
        return;
      }

      const totalVal = parseInt(
        totalSpan.textContent.trim().replace(/[^\d]/g, ""),
        10
      );
      if (isNaN(totalVal)) {
        console.warn("⚠️ Giá trị tổng không hợp lệ.");
        return;
      }

      const allInputs = Array.from(
        document.querySelectorAll("table.table_mt input.s_input")
      );
      const errorInputs = allInputs.filter((input) =>
        input.classList.contains("bg_error")
      );

      if (errorInputs.length === 0) {
        console.info("✅ Không có ô lỗi nào cần sửa.");
        return;
      }

      const randomValues = generateRandomSumArray(errorInputs.length, totalVal);

      errorInputs.forEach((inputEl, idx) => {
        const valueToInput = randomValues[idx];

        inputEl.value = valueToInput;
        inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        inputEl.dispatchEvent(new Event("change", { bubbles: true }));

        results.push({
          inputId: inputEl.id || `input${idx + 1}`,
          valueToInput,
          totalSource: totalVal,
          pageId: currentPage,
        });
      });

      sendResponse({ data: results });
      return true;
    }

    case "autoCheckMaxCheckbox": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const results = [];

      const alertElement = document.querySelector(
        "#alertify > div > article > p"
      );
      const alertText = alertElement?.textContent || "";
      const match = alertText.match(/[0-9０-９]+/);
      const parsedNumber = match
        ? parseInt(
            match[0].replace(/[０-９]/g, (d) =>
              String.fromCharCode(d.charCodeAt(0) - 65248)
            ),
            10
          )
        : null;

      if (!parsedNumber || isNaN(parsedNumber)) {
        sendResponse({
          data: [],
          message: "❌ Không lấy được số từ thông báo lỗi",
        });
        return true;
      }

      const maxCheck = parsedNumber;

      // ✅ Gom checkbox theo thứ tự xuất hiện trong từng dòng (tr)
      const allRows = Array.from(document.querySelectorAll("tr"));
      const checkboxByColumn = {}; // { 0: [cb1, cb2], 1: [...], ... }

      allRows.forEach((row, rowIndex) => {
        const checkboxes = Array.from(
          row.querySelectorAll('input[type="checkbox"]')
        ).filter((cb) => cb.offsetParent !== null);
        checkboxes.forEach((cb, colIndex) => {
          cb.checked = false;
          cb.dispatchEvent(new Event("change", { bubbles: true }));

          if (!checkboxByColumn[colIndex]) checkboxByColumn[colIndex] = [];
          checkboxByColumn[colIndex].push({ cb, rowIndex });
        });
      });

      // ✅ Với mỗi cột, chọn đúng maxCheck checkbox hiển thị
      Object.entries(checkboxByColumn).forEach(([colIndex, checkboxList]) => {
        const shuffled = checkboxList.sort(() => 0.5 - Math.random());
        shuffled.slice(0, maxCheck).forEach(({ cb, rowIndex }, i) => {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
          results.push({
            mode: "column",
            columnIndex: parseInt(colIndex),
            rowIndex,
            inputId: cb.id || `col_${colIndex}_${i}`,
            action: "checked",
            pageId: currentPage,
          });
        });
      });

      sendResponse({
        data: results,
        maxcheckbox: maxCheck,
      });

      return true;
    }

    case "checkBgErrorCheckbox": {
      const checkboxes = document.querySelectorAll("input[type='checkbox']");

      const hasError = Array.from(checkboxes).some((cb) => {
        const td = cb.closest("td");
        return td?.classList.contains("bg_error");
      });

      sendResponse({ status: hasError });
      return true;
    }

    case "autoCheckMaxErrorCheckbox": {
      const currentPage = document.querySelector("#c_id")?.value || "unknown";
      const results = [];

      const alertElement = document.querySelector(
        "#alertify .alertify-message"
      );
      const alertText = alertElement?.textContent || "";
      const matches = alertText.match(/[0-9０-９]+/g); // lấy tất cả số trong chuỗi
      const lastNumber = matches?.at(-1); // lấy số cuối cùng
      const maxCheck = lastNumber
        ? parseInt(
            lastNumber.replace(/[０-９]/g, (d) =>
              String.fromCharCode(d.charCodeAt(0) - 65248)
            ),
            10
          )
        : null;

      if (!maxCheck || isNaN(maxCheck)) {
        sendResponse({
          data: [],
          message: "❌ Không lấy được số từ thông báo lỗi",
        });
        return true;
      }

      // ✅ Lấy checkbox nằm trong <td class="bg_error">
      const errorCheckboxes = Array.from(
        document.querySelectorAll("td.bg_error input[type='checkbox']")
      ).filter((cb) => cb.offsetParent !== null);

      if (errorCheckboxes.length === 0) {
        sendResponse({
          data: [],
          message: "❌ Không có checkbox lỗi nào đang hiển thị",
        });
        return true;
      }

      const groupMap = new Map();
      errorCheckboxes.forEach((cb) => {
        const container =
          cb.closest("table") || cb.closest("div") || document.body;
        if (!groupMap.has(container)) groupMap.set(container, []);
        groupMap.get(container).push(cb);
      });

      let didProcess = false;

      for (const [container, checkboxes] of groupMap.entries()) {
        checkboxes.forEach((cb) => {
          cb.checked = false;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        });

        if (checkboxes.length < maxCheck) continue;

        const shuffled = checkboxes.sort(() => 0.5 - Math.random());
        shuffled.slice(0, maxCheck).forEach((cb, i) => {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
          results.push({
            mode: "errorOnly",
            containerTag: container.tagName,
            inputId: cb.id || `error_cb_${i}`,
            action: "checked",
            pageId: currentPage,
          });
        });

        didProcess = true;
        break;
      }

      if (!didProcess) {
        sendResponse({
          data: [],
          message: "❌ Không có vùng nào đủ checkbox lỗi để chọn",
        });
      } else {
        sendResponse({
          data: results,
          maxcheckbox: maxCheck,
          message: `✅ Đã chọn ${maxCheck} checkbox có lỗi trong vùng hợp lệ`,
        });
      }

      return true;
    }

    case "checkRadioAndCheckboxSameRow": {
      const checkedRadio = document.querySelector(
        'input[type="radio"]:checked'
      );
      const checkedCheckboxes = Array.from(
        document.querySelectorAll('input[type="checkbox"]:checked')
      );

      if (!checkedRadio || checkedCheckboxes.length === 0) {
        sendResponse({ isValid: false });
        return true;
      }

      const radioValue = checkedRadio.value;

      // Kiểm tra có checkbox nào cùng value không
      const isValid = checkedCheckboxes.some((cb) => cb.value === radioValue);

      sendResponse({ isValid });
      return true;
    }

    case "isCheckboxSameValueChecked": {
      const checkedRadio = document.querySelector(
        'input[type="radio"]:checked'
      );
      if (!checkedRadio) {
        sendResponse({ status: false });
        return true;
      }

      const radioValue = checkedRadio.value;

      // Tìm checkbox có cùng value
      const matchedCheckbox = document.querySelector(
        `input[type="checkbox"][value="${radioValue}"]`
      );
      const status = matchedCheckbox?.checked || false;

      sendResponse({ status });
      return true;
    }

    case "getDataQ": {
      const pushedSet = new Set();
      //================================<FUNCTION START>================================
      function detectTableDirection(table) {
        // Lấy hàng đầu tiên có nhiều input radio/checkbox nhất
        const rows = Array.from(table.querySelectorAll("tr"));
        let maxInputs = [];
        for (const row of rows) {
          const inputs = Array.from(
            row.querySelectorAll('input[type="radio"],input[type="checkbox"]')
          );
          if (inputs.length > maxInputs.length) {
            maxInputs = inputs;
          }
        }
        if (maxInputs.length > 1) {
          const values = maxInputs
            .map((input) => parseInt(input.value, 10))
            .filter((v) => !isNaN(v));
          if (values.length > 1) {
            // Kiểm tra xem tất cả giá trị có bằng nhau không
            const isAllEqual = values.every((v, _, arr) => v === arr[0]);
            if (isAllEqual) return "vertical";
            else return "horizontal";
          }
        }
        return "unknown";
      }
      // ...
      // Sau khi lấy result cho SA/MA:
      // result.direction = detectTableDirection(table);
      //================================<FUNCTION START>================================

      function getTableRowsAndColumns(
        table,
        externalColumns = null,
        forceReverse = false
      ) {
        // Lấy columns (header cột) - alt của ảnh trong th nếu có
        let columns = [];
        let title = null;
        // === SỬA ĐOẠN NÀY ===
        // Tìm hàng có nhiều th nhất (thường là hàng tiêu đề)
        const allRowsForTh = Array.from(table.querySelectorAll("tr"));
        let ths = [];
        let maxThRow = null;
        for (const row of allRowsForTh) {
          const thList = Array.from(row.querySelectorAll("th"));
          if (thList.length > ths.length) {
            ths = thList;
            maxThRow = row;
          }
        }
        if (ths.length > 0) {
          // Nếu th đầu tiên có waku/box thì lấy làm title
          const firstTh = ths[0];
          if (firstTh) {
            const thClassList = Array.from(firstTh.classList);
            const hasWakuOrBoxInTh = thClassList.some(
              (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
            );
            const div = firstTh.querySelector("div");
            let hasWakuOrBoxInDiv = false;
            if (div) {
              const divClassList = Array.from(div.classList);
              hasWakuOrBoxInDiv = divClassList.some(
                (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
              );
            }
            if (!externalColumns && (hasWakuOrBoxInTh || hasWakuOrBoxInDiv)) {
              // Lấy title từ th đầu tiên
              title = firstTh.textContent.replace(/\s+/g, " ").trim();
              // Bỏ th đầu tiên khỏi danh sách columns nếu không dùng externalColumns
              ths = ths.slice(1);
            }
          }
          // Lấy rawColumns từ các th còn lại
          let rawColumns = ths
            .map((th) => {
              const img = th.querySelector("img");
              if (img && img.alt) return img.alt.trim();
              const text = th.textContent.replace(/\s+/g, " ").trim();
              return text || null;
            })
            .filter(Boolean);
          columns = rawColumns;

          // Sau khi columns = rawColumns, kiểm tra radio để đảo ngược nếu cần
          const radioRows = Array.from(table.querySelectorAll("tr")).filter(
            (row) => row.querySelectorAll('input[type="radio"]').length > 1
          );
          if (radioRows.length > 0) {
            const radios = Array.from(
              radioRows[0].querySelectorAll('input[type="radio"]')
            );
            const values = radios
              .map((input) => parseInt(input.value, 10))
              .filter((v) => !isNaN(v));
            const isDescending = values.every(
              (val, idx, arr) => idx === 0 || val < arr[idx - 1]
            );
            if (isDescending) {
              columns = columns.slice().reverse();
            }
          }
        } else {
          // Logic mới: chỉ lấy columns từ hàng thứ 2 nếu có nhiều hàng
          if (allRowsForTh.length > 1) {
            // KIỂM TRA: Hàng đầu tiên có chỉ chứa số không?
            const firstRow = allRowsForTh[0];
            const firstRowThs = Array.from(firstRow.querySelectorAll("th"));
            const isFirstRowOnlyNumbers = firstRowThs.every((th) => {
              const text = th.textContent.replace(/\s+/g, " ").trim();
              return /^[0-9]+$/.test(text) || text === "";
            });

            // Chỉ áp dụng logic mới nếu hàng đầu chỉ có số
            if (isFirstRowOnlyNumbers) {
              // Tìm hàng có nhiều img với alt có ý nghĩa nhất
              let bestRow = allRowsForTh[1]; // Mặc định lấy hàng thứ 2

              for (let i = 1; i < allRowsForTh.length; i++) {
                const currentRow = allRowsForTh[i];
                const imgCount = currentRow.querySelectorAll("img[alt]").length;
                const bestRowImgCount =
                  bestRow.querySelectorAll("img[alt]").length;

                if (imgCount > bestRowImgCount) {
                  bestRow = currentRow;
                }
              }

              ths = Array.from(bestRow.querySelectorAll("th"));

              // Kiểm tra th đầu tiên của hàng được chọn có waku/box không
              const firstTh = ths[0];
              if (firstTh) {
                const thClassList = Array.from(firstTh.classList);
                const hasWakuOrBoxInTh = thClassList.some(
                  (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
                );
                const div = firstTh.querySelector("div");
                let hasWakuOrBoxInDiv = false;
                if (div) {
                  const divClassList = Array.from(div.classList);
                  hasWakuOrBoxInDiv = divClassList.some(
                    (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
                  );
                }
                if (hasWakuOrBoxInTh || hasWakuOrBoxInDiv) {
                  // Nếu th đầu tiên có waku/box, bỏ qua nó
                  ths = ths.slice(1);
                }
              }
            } else {
              // LOGIC CŨ: Tìm hàng có nhiều th nhất
              for (const row of allRowsForTh) {
                const thList = Array.from(row.querySelectorAll("th"));
                if (thList.length > ths.length) {
                  ths = thList;
                  maxThRow = row;
                }
              }

              // Kiểm tra th đầu tiên có waku/box không
              const firstTh = ths[0];
              if (firstTh) {
                const thClassList = Array.from(firstTh.classList);
                const hasWakuOrBoxInTh = thClassList.some(
                  (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
                );
                const div = firstTh.querySelector("div");
                let hasWakuOrBoxInDiv = false;
                if (div) {
                  const divClassList = Array.from(div.classList);
                  hasWakuOrBoxInDiv = divClassList.some(
                    (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
                  );
                }
                if (hasWakuOrBoxInTh || hasWakuOrBoxInDiv) {
                  // Lấy title từ th đầu tiên
                  title = firstTh.textContent.replace(/\s+/g, " ").trim();
                  // Bỏ th đầu tiên khỏi danh sách columns
                  ths = ths.slice(1);
                }
              }
            }
          } else {
            // Nếu chỉ có 1 hàng, tìm hàng có nhiều th nhất
            for (const row of allRowsForTh) {
              const thList = Array.from(row.querySelectorAll("th"));
              if (thList.length > ths.length) {
                ths = thList;
                maxThRow = row;
              }
            }

            // Kiểm tra th đầu tiên có waku/box không
            const firstTh = ths[0];
            if (firstTh) {
              const thClassList = Array.from(firstTh.classList);
              const hasWakuOrBoxInTh = thClassList.some(
                (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
              );
              const div = firstTh.querySelector("div");
              let hasWakuOrBoxInDiv = false;
              if (div) {
                const divClassList = Array.from(div.classList);
                hasWakuOrBoxInDiv = divClassList.some(
                  (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
                );
              }
              if (hasWakuOrBoxInTh || hasWakuOrBoxInDiv) {
                // Lấy title từ th đầu tiên
                title = firstTh.textContent.replace(/\s+/g, " ").trim();
                // Bỏ th đầu tiên khỏi danh sách columns
                ths = ths.slice(1);
              }
            }
          }

          if (ths.length > 0) {
            // Lấy rawColumns từ các th còn lại
            let rawColumns = ths
              .map((th) => {
                const img = th.querySelector("img");
                if (img && img.alt) return img.alt.trim();
                const text = th.textContent.replace(/\s+/g, " ").trim();
                return text || null;
              })
              .filter(Boolean);
            columns = rawColumns;

            // Sau khi columns = rawColumns, kiểm tra radio để đảo ngược nếu cần
            const radioRows = Array.from(table.querySelectorAll("tr")).filter(
              (row) => row.querySelectorAll('input[type="radio"]').length > 1
            );
            if (radioRows.length > 0) {
              const radios = Array.from(
                radioRows[0].querySelectorAll('input[type="radio"]')
              );
              const values = radios
                .map((input) => parseInt(input.value, 10))
                .filter((v) => !isNaN(v));
              const isDescending = values.every(
                (val, idx, arr) => idx === 0 || val < arr[idx - 1]
              );
              if (isDescending) {
                columns = columns.slice().reverse();
              }
            }
          }
        }
        //================================<FUNCTION END>==================================

        // Lấy rows cho từng loại input
        let rowsSA = [];
        let rowsMA = [];
        let rowsNO = [];

        // Theo dõi rowspan theo cách đơn giản hơn
        const allRows = Array.from(table.querySelectorAll("tr"));
        // Kiểm tra bảng dạng đơn giản: 1 hàng th, 1 hàng td, mỗi td chứa 1 radio, không rowspan
        const isSimpleRadioRow =
          allRows.length === 2 &&
          allRows[0].querySelectorAll("th").length > 0 &&
          allRows[1].querySelectorAll("td").length > 0 &&
          Array.from(allRows[1].querySelectorAll("td")).every(
            (td) =>
              td.querySelectorAll("input[type=radio]").length === 1 &&
              !td.hasAttribute("rowspan")
          );
        // Logic mới: bảng radio đơn giản không có th, chỉ có td, mỗi td 1 radio, không rowspan/colspan
        const isSimpleRadioNoHeader =
          allRows.length > 0 &&
          table.querySelectorAll("th").length === 0 &&
          Array.from(table.querySelectorAll("td")).every(
            (td) =>
              td.querySelectorAll("input[type=radio]").length === 1 &&
              !td.hasAttribute("rowspan") &&
              !td.hasAttribute("colspan")
          );
        if (isSimpleRadioNoHeader) {
          // columns là []
          columns = [];
          // rowsSA là label của từng radio theo thứ tự xuất hiện
          rowsSA = [];
          const radios = table.querySelectorAll("input[type=radio]");
          radios.forEach((radio) => {
            const td = radio.closest("td");
            let label = td ? td.textContent.replace(/\s+/g, " ").trim() : "";
            if (label && !rowsSA.includes(label)) rowsSA.push(label);
          });
          // Không xử lý tiếp các logic rowsSA khác cho bảng này
          let rowsSelect = [];
          let rank = undefined;
          const result = {
            columns,
            title,
            rowsSA,
            rowsMA,
            rowsNO,
            rowsSelect,
            rank,
          };
          return result;
        }
        // Logic mới: bảng radio không có th, mỗi td chứa đúng 1 radio, có thể có colspan, không rowspan
        const isSimpleRadioNoHeaderWithColspan =
          allRows.length > 0 &&
          table.querySelectorAll("th").length === 0 &&
          Array.from(table.querySelectorAll("td")).every(
            (td) =>
              td.querySelectorAll("input[type=radio]").length === 1 &&
              !td.hasAttribute("rowspan")
          );
        if (isSimpleRadioNoHeaderWithColspan) {
          columns = [];
          rowsSA = [];
          const radios = table.querySelectorAll("input[type=radio]");
          radios.forEach((radio) => {
            const td = radio.closest("td");
            let label = td ? td.textContent.replace(/\s+/g, " ").trim() : "";
            if (label && !rowsSA.includes(label)) rowsSA.push(label);
          });
          let rowsSelect = [];
          let rank = undefined;
          const result = {
            columns,
            title,
            rowsSA,
            rowsMA,
            rowsNO,
            rowsSelect,
            rank,
          };
          return result;
        }
        for (let i = 0; i < allRows.length; i++) {
          const row = allRows[i];
          const tds = row.querySelectorAll("td");
          const checkboxes = row.querySelectorAll("input[type=checkbox]");
          const radios = row.querySelectorAll("input[type=radio]");
          const currentRowLabels = [];
          // Xử lý các td trong hàng hiện tại
          tds.forEach((td) => {
            if (td.hasAttribute("rowspan")) {
              const rowspanValue =
                parseInt(td.getAttribute("rowspan"), 10) || 1;
              const label = td.textContent.replace(/\s+/g, " ").trim();
              currentRowLabels.push(label);
            } else {
              // Lấy text từ td không có rowspan
              const tdText = td.textContent.replace(/\s+/g, " ").trim();
              if (tdText && !tdText.includes("→")) {
                currentRowLabels.push(tdText);
              }
            }
          });
          // Thu thập tất cả rowspan đang hoạt động từ các hàng trước đó
          const activeRowspans = [];
          for (let j = 0; j < i; j++) {
            const prevRow = allRows[j];
            const prevTds = prevRow.querySelectorAll("td");
            let colIndex = 0;
            prevTds.forEach((td) => {
              if (td.hasAttribute("rowspan")) {
                const rowspanValue =
                  parseInt(td.getAttribute("rowspan"), 10) || 1;
                const startRow = j;
                const endRow = startRow + rowspanValue - 1;
                // Nếu rowspan này vẫn còn hiệu lực ở hàng hiện tại (i)
                if (i <= endRow) {
                  const label = td.textContent.replace(/\s+/g, " ").trim();
                  activeRowspans.push({
                    colIndex: colIndex,
                    label: label,
                  });
                }
              }
              colIndex++;
            });
          }
          // Sắp xếp activeRowspans theo colIndex
          activeRowspans.sort((a, b) => a.colIndex - b.colIndex);
          // Kết hợp: rowspan đang hoạt động + labels hiện tại
          const completeLabels = [
            ...activeRowspans.map((r) => r.label),
            ...currentRowLabels,
          ];
          // Tạo label hoàn chỉnh cho hàng hiện tại
          function buildCompleteLabel() {
            return completeLabels.join("/");
          }
          const completeLabel = buildCompleteLabel();
          // MA: checkbox (dạng ma trận)
          if (checkboxes.length > 0 && completeLabel) {
            if (!rowsMA.includes(completeLabel)) {
              rowsMA.push(completeLabel);
            }
          }
          // SA: radio (dạng ma trận)
          if (radios.length > 0) {
            if (isSimpleRadioRow && i === 1) {
              // Chỉ lấy label từng radio riêng lẻ cho bảng đơn giản
              radios.forEach((radio) => {
                let label = "";
                let node = radio.nextSibling;
                if (node) {
                  if (node.nodeType === Node.TEXT_NODE) {
                    label = node.textContent.replace(/\s+/g, " ").trim();
                  } else if (node.nodeType === Node.ELEMENT_NODE) {
                    label = node.textContent.replace(/\s+/g, " ").trim();
                  }
                }
                if (label && !rowsSA.includes(label)) rowsSA.push(label);
              });
            } else if (completeLabel) {
              if (!rowsSA.includes(completeLabel)) {
                rowsSA.push(completeLabel);
              }
            }
          }
        }
        // SA: radio (dọc, mỗi hàng 1 radio) - giữ nguyên logic cũ
        const radios = table.querySelectorAll("input[type=radio]");
        radios.forEach((input) => {
          let label = "";
          let node = input.nextSibling;
          if (node) {
            if (node.nodeType === Node.TEXT_NODE) {
              label = node.textContent.replace(/\s+/g, " ").trim();
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              label = node.textContent.replace(/\s+/g, " ").trim();
            }
          }
          if (label && !rowsSA.includes(label)) rowsSA.push(label);
        });
        // NO: input text/number
        const numbers = table.querySelectorAll(
          "input[type=text],input[type=number]"
        );
        numbers.forEach((input) => {
          const tr = input.closest("tr");
          if (tr) {
            const firstTd = tr.querySelector("td");
            if (firstTd) {
              const label = firstTd.textContent.replace(/\s+/g, " ").trim();
              if (label && !rowsNO.includes(label)) rowsNO.push(label);
            }
          }
        });
        // SELECT: lấy label cho select (nếu có)
        let rowsSelect = [];
        const selects = table.querySelectorAll("select");
        selects.forEach((select) => {
          const tr = select.closest("tr");
          if (tr) {
            const firstTd = tr.querySelector("td");
            if (firstTd) {
              const label = firstTd.textContent.replace(/\s+/g, " ").trim();
              if (label && !rowsSelect.includes(label)) rowsSelect.push(label);
            }
          }
        });
        // Logic rank: chỉ xét sau khi đã duyệt xong các hàng, không ảnh hưởng các trường khác
        let rank = undefined;
        const allSelects = table.querySelectorAll("select");
        if (
          allSelects.length >= 2 ||
          Array.from(allSelects).some(
            (sel) => sel.getAttribute("data-form") === "rank1-3"
          )
        ) {
          rank = ["1位", "2位", "3位"];
        }

        // Nếu có externalColumns thì override columns ở cuối, không ảnh hưởng các logic lấy rows
        if (externalColumns && externalColumns.length > 0) {
          columns = forceReverse
            ? externalColumns.slice().reverse()
            : externalColumns.slice();
        }

        // Nếu có input nằm trong <td> và <td> đó có text (label) thì columns = [] và title = null
        const tds = table.querySelectorAll("td");
        let hasInputWithText = false;
        tds.forEach((td) => {
          const hasInput = td.querySelector(
            "input[type='radio'],input[type='checkbox']"
          );
          const text = td.textContent.replace(/\s+/g, " ").trim();
          if (hasInput && text && text !== "→") {
            hasInputWithText = true;
          }
        });
        if (hasInputWithText) {
          columns = [];
          title = null;
        }

        const result = {
          columns,
          title,
          rowsSA,
          rowsMA,
          rowsNO,
          rowsSelect,
          rank,
        };
        return result;
      }
      //================================<FUNCTION END>==================================

      // Gộp logic lấy columns từ bảng tiêu đề và truyền sang bảng SA/MA tiếp theo nếu cần
      // Duyệt toàn bộ DOM theo thứ tự xuất hiện của article và table
      const allNodes = Array.from(
        document.querySelectorAll("article.question_detail, table")
      );
      let currentImageColumns = null;
      let currentImageTitle = null;
      const allResults = [];
      let tableIdx = 0;
      allNodes.forEach((node, idx) => {
        if (node.tagName === "ARTICLE") {
          currentImageTitle = null;
          currentImageColumns = null;
          return;
        }
        // Nếu là table
        const table = node;
        // Khai báo columns, title ở đây để dùng cho mọi nhánh
        let columns = [];
        let title = null;

        // Kiểm tra bảng chỉ có header (không có input)
        const hasOnlyImageHeader =
          table.querySelectorAll("th img").length > 0 &&
          table.querySelectorAll("input,select,textarea").length === 0;
        const hasOnlyTextHeader =
          table.querySelectorAll("th").length > 0 &&
          table.querySelectorAll("input,select,textarea").length === 0;

        if (hasOnlyImageHeader || hasOnlyTextHeader) {
          const ths = Array.from(table.querySelectorAll("th"));
          columns = [];
          title = null;

          // Lấy title từ <div> có class _waku hoặc _box trong <th>
          for (const th of ths) {
            const div = th.querySelector("div");
            if (div) {
              const divClassList = Array.from(div.classList);
              const hasWakuOrBoxInDiv = divClassList.some(
                (cls) => cls.endsWith("_waku") || cls.endsWith("_box")
              );
              if (hasWakuOrBoxInDiv) {
                title = div.textContent.replace(/\s+/g, " ").trim();
                break;
              }
            }
          }

          // Lấy columns từ các <th> chứa <img>
          for (const th of ths) {
            const img = th.querySelector("img");
            if (img && img.alt) {
              columns.push(img.alt.trim());
            }
          }

          columns = columns.filter(Boolean);
          currentImageColumns = columns.length > 0 ? columns : null;
          currentImageTitle = title || null;
          return;
        }

        // ==== BẮT ĐẦU: Chèn lại logic detect direction, dataBlede, gọi getTableRowsAndColumns ... ====
        // Xét direction ngay từ đầu cho tất cả bảng có input
        const radios = table.querySelectorAll("input[type='radio']");
        const checkboxes = table.querySelectorAll("input[type='checkbox']");
        let tableDirection = null;
        let forceReverse = false;

        if (radios.length > 0 || checkboxes.length > 0) {
          tableDirection = detectTableDirection(table);

          // Xét forceReverse cho radio
          if (radios.length > 0) {
            let maxRadioInputs = [];
            for (const row of table.querySelectorAll("tr")) {
              const rowRadios = Array.from(
                row.querySelectorAll("input[type='radio']")
              );
              if (rowRadios.length > maxRadioInputs.length) {
                maxRadioInputs = rowRadios;
              }
            }
            if (maxRadioInputs.length > 1) {
              const values = maxRadioInputs
                .map((input) => parseInt(input.value, 10))
                .filter((v) => !isNaN(v));
              const isDescending = values.every(
                (val, idx, arr) => idx === 0 || val < arr[idx - 1]
              );
              forceReverse = isDescending;
            }
          }

          // Xét forceReverse cho checkbox
          if (checkboxes.length > 0 && !forceReverse) {
            let maxCheckboxInputs = [];
            for (const row of table.querySelectorAll("tr")) {
              const rowCheckboxes = Array.from(
                row.querySelectorAll("input[type='checkbox']")
              );
              if (rowCheckboxes.length > maxCheckboxInputs.length) {
                maxCheckboxInputs = rowCheckboxes;
              }
            }
            if (maxCheckboxInputs.length > 1) {
              const values = maxCheckboxInputs
                .map((input) => parseInt(input.value, 10))
                .filter((v) => !isNaN(v));
              const isDescending = values.every(
                (val, idx, arr) => idx === 0 || val < arr[idx - 1]
              );
              forceReverse = isDescending;
            }
          }
        }

        // Tìm data-blede cho table này
        let dataBlede = "";
        try {
          // Duyệt ngược các node trước table để tìm article.question_detail
          let prev = table.previousElementSibling;
          while (prev) {
            if (prev.matches && prev.matches("article.question_detail")) {
              dataBlede = prev.getAttribute("data-blede") || "";
              break;
            }
            prev = prev.previousElementSibling;
          }
          // Nếu không tìm thấy, thử tìm trong cha gần nhất
          if (!dataBlede) {
            const parentArticle = table.closest("article.question_detail");
            if (parentArticle) {
              dataBlede = parentArticle.getAttribute("data-blede") || "";
            }
          }
        } catch (e) {
          dataBlede = "";
        }

        let tableName = "";
        const firstInput = table.querySelector("input,select,textarea");
        if (firstInput) {
          tableName = firstInput.id || firstInput.name || "";
        }
        if (!tableName) tableName = `Bảng #${tableIdx + 1}`;

        // Gọi lại getTableRowsAndColumns với logic truyền currentImageColumns/forceReverse nếu có
        let result = null;
        if (
          radios.length > 0 &&
          currentImageColumns &&
          currentImageColumns.length > 0
        ) {
          result = getTableRowsAndColumns(
            table,
            currentImageColumns,
            forceReverse
          );
          result.direction = tableDirection;
          if (
            currentImageTitle &&
            !result.title &&
            result.columns &&
            result.columns.length > 0
          ) {
            result.title = currentImageTitle;
          }
        } else if (
          checkboxes.length > 0 &&
          currentImageColumns &&
          currentImageColumns.length > 0
        ) {
          result = getTableRowsAndColumns(
            table,
            currentImageColumns,
            forceReverse
          );
          result.direction = tableDirection;
          if (
            currentImageTitle &&
            !result.title &&
            result.columns &&
            result.columns.length > 0
          ) {
            result.title = currentImageTitle;
          }
        } else {
          result = getTableRowsAndColumns(table);
          if (tableDirection) {
            result.direction = tableDirection;
          }
        }
        // ==== KẾT THÚC: Chèn lại logic detect direction, dataBlede, gọi getTableRowsAndColumns ... ====

        // Sau khi có result:
        if (!result.title && currentImageTitle) {
          result.title = currentImageTitle;
        }
        if (
          (!result.columns || result.columns.length === 0) &&
          currentImageColumns
        ) {
          result.columns = currentImageColumns;
        }
        allResults.push({ tableName, result, dataBlede });
        tableIdx++;
      });

      // Xuất ra mảng kết quả cho tất cả các bảng
      // Format lại dữ liệu theo yêu cầu
      const formattedResults = allResults.map(
        ({ tableName, result, dataBlede }, idx) => {
          const {
            direction,
            columns,
            rowsSA,
            rowsMA,
            rowsNO,
            title,
            rowsSelect,
            rank,
          } = result;
          let key1_1 = "situmon";
          let key1_2 = [];
          let key2_1 = [];
          let type = "";
          if (Array.isArray(rowsSelect) && rowsSelect.length > 0)
            type = "SELECT";
          else if (rowsSA && rowsSA.length > 0) type = "SA";
          else if (rowsMA && rowsMA.length > 0) type = "MA";
          else if (rowsNO && rowsNO.length > 0) type = "NO";

          // Ưu tiên rowsSelect cho key1_2
          if (Array.isArray(rowsSelect) && rowsSelect.length > 0) {
            key1_2 = rowsSelect;
          } else if (type === "NO") {
            key1_2 = rowsNO;
          } else if (direction === "vertical") {
            key1_2 = columns;
          } else if (direction === "horizontal") {
            key1_2 = type === "SA" ? rowsSA : rowsMA;
          } else {
            key1_2 = type === "SA" ? rowsSA : type === "MA" ? rowsMA : rowsNO;
          }

          // KHÔNG gán rank vào key2_1 nữa, chỉ giữ logic cũ cho key2_1
          if (direction === "vertical") {
            key2_1 = type === "SA" ? rowsSA : rowsMA;
          } else if (direction === "horizontal") {
            key2_1 = columns;
          } else {
            key2_1 = columns;
          }

          // Nếu là SA/MA mà không có columns thì key1_2 = [], key2_1 = rowsSA/rowsMA
          if (
            (type === "SA" || type === "MA") &&
            (!columns || columns.length === 0) &&
            !(Array.isArray(rowsSelect) && rowsSelect.length > 0)
          ) {
            key1_2 = [];
            key2_1 = type === "SA" ? rowsSA : rowsMA;
          }

          // Sử dụng dataBlede đã lưu từ trước
          const post_key = `${dataBlede || ""}:::${tableName}::${
            type === "SELECT" ? "SA" : type
          }::`;

          return {
            tableName,
            key1_1,
            key1_2,
            key2_1,
            title,
            direction,
            type,
            post_key,
            rank, // trả về trường rank nếu có
          };
        }
      );
      // Gửi formattedResults thay vì allResults
      const post_keys = formattedResults.map((item) => item.post_key);
      console.log(formattedResults);
      sendResponse({ formatdata: formattedResults });
      return true;
    }

    default:
      console.log("⛔ Unknown action:", message.action);
      sendResponse({ status: false });
      break;
  }
});
