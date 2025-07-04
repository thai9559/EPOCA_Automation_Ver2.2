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
            const sc1Btn = document.querySelector("#q_data > table > tbody > tr:nth-child(1) > td > input[type=radio]");
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
        
            allSonotaInputs.forEach(input => {
                const hasTClass = Array.from(input.classList).some(className => className.endsWith('_T'));
                
                // Chỉ nhập nếu có class _T và KHÔNG bị disabled
                if (hasTClass && !input.disabled) {
                    input.value = "Sonota";
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
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

        case "getNoData" : {
            const currentPage = document.querySelector("#c_id")?.value || "unknown";
            const inputs = document.querySelectorAll("input.s_input");
            const values = [];

            inputs.forEach(input => {
                values.push({
                    id: input.id,
                    value: input.value,
                    pageId: currentPage
                });
            });

            sendResponse({ data: values });
            return true;
        }

        case "getSaData": {
            const currentPage = document.querySelector("#c_id")?.value || "unknown";
            const selectedRadios = document.querySelectorAll('input[type="radio"]:checked');
            const values = [];

            selectedRadios.forEach(radio => {
                values.push({
                    id: radio.name,
                    value: radio.value,
                    pageId: currentPage
                });
            });

            sendResponse({ data: values });
            return true;
        }

        case "getMaData": {
            const currentPage = document.querySelector("#c_id")?.value || "unknown";
            const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const values = [];

            checkedBoxes.forEach(box => {
                values.push({
                    id: box.id || "unknown_id",
                    name: box.name || null,
                    value: box.value,
                    pageId: currentPage
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
                "!=": (a, b) => a != b
            };

            const compare = ops[saikeiOperator];
            const results = [];

            let saikeiSpans = Array.from(document.querySelectorAll("span[id^='y_saikei']"));
            let isHorizontal = true;

            if (saikeiSpans.length === 0) {
                saikeiSpans = Array.from(document.querySelectorAll("span[id^='t_saikei']"));
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

                    const hasInput = tr.querySelectorAll(`input.${inputClass}`).length > 0;
                    const hasSaikei = tr.querySelectorAll("span[id^='y_saikei']").length > 0;

                    if (!hasInput || !hasSaikei) return; 

                    const inputs = Array.from(tr.querySelectorAll(`input.${inputClass}`));
                    inputs.forEach(input => {
                        const val = parseInt(input.value.trim(), 10);
                        if (!isNaN(val)) {
                            inputVals.push(val);
                            inputIds.push(input.id);
                        }
                    });
                } else {
                    const inputEl = document.querySelectorAll(`input.${inputClass}`)[index];
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
                    pageId: currentPage
                });
            });

            sendResponse({ data: results });
            return true;
        }

        // case "autoInputBySaikei": {
        //     const currentPage = document.querySelector("#c_id")?.value || "unknown";
        //     const jsonData = message.jsonData;
        //     const saikeiOperator = jsonData?.saikei || "=";

        //     const opsInput = {
        //         ">": (a) => a - 1,
        //         "<": (a) => a + 1,
        //         ">=": (a) => a,
        //         "<=": (a) => a,
        //         "=": (a) => a,
        //         "!=": (a) => a + 1
        //     };

        //     const computeInput = opsInput[saikeiOperator];
        //     const results = [];
        //     const inputClass = jsonData?.blade || "";

        //     // Helper function để input và push kết quả
        //     const handleInput = (inputEl, saikeiId, saikeiVal, valueToInput, index, i) => {
        //         inputEl.value = valueToInput;
        //         inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        //         inputEl.dispatchEvent(new Event("change", { bubbles: true }));

        //         results.push({
        //             saikeiId,
        //             saikeiVal,
        //             inputId: inputEl.id || `input_${index}_${i}`,
        //             valueToInput,
        //             pageId: currentPage
        //         });
        //     };

        //     // Xử lý nhóm theo chiều ngang (hàng)
        //     const ySaikeiSpans = Array.from(document.querySelectorAll("span[id^='y_saikei']"));
        //     ySaikeiSpans.forEach((span, index) => {
        //         const saikeiId = span.id || `unknown_y_${index}`;
        //         const saikeiVal = parseInt(span.textContent.trim(), 10);
        //         if (isNaN(saikeiVal)) return;

        //         const tr = span.closest("tr");
        //         if (!tr) return;

        //         const inputEls = Array.from(tr.querySelectorAll(`input.${inputClass}`));
        //         if (inputEls.length === 0) return;

        //         const targetVal = computeInput(saikeiVal);
        //         const divided = Math.floor(targetVal / inputEls.length);
        //         const remainder = targetVal % inputEls.length;

        //         inputEls.forEach((inputEl, i) => {
        //             const valueToInput = divided + (i < remainder ? 1 : 0);
        //             handleInput(inputEl, saikeiId, saikeiVal, valueToInput, index, i);
        //         });
        //     });

        //     // Xử lý nhóm theo chiều dọc (cột)
        //     const tSaikeiSpans = Array.from(document.querySelectorAll("span[id^='t_saikei']"));
        //     tSaikeiSpans.forEach((span, index) => {
        //         const saikeiId = span.id || `unknown_t_${index}`;
        //         const saikeiVal = parseInt(span.textContent.trim(), 10);
        //         if (isNaN(saikeiVal)) return;

        //         const spanIndexMatch = span.id.match(/\d+$/);
        //         const spanIndex = spanIndexMatch ? spanIndexMatch[0] : index;

        //         const inputEls = Array.from(document.querySelectorAll(`input.${inputClass}[class*='_${spanIndex}']`));
        //         if (inputEls.length === 0) return;

        //         const targetVal = computeInput(saikeiVal);
        //         const divided = Math.floor(targetVal / inputEls.length);
        //         const remainder = targetVal % inputEls.length;

        //         inputEls.forEach((inputEl, i) => {
        //             const valueToInput = divided + (i < remainder ? 1 : 0);
        //             handleInput(inputEl, saikeiId, saikeiVal, valueToInput, index, i);
        //         });
        //     });

        //     sendResponse({ data: results });
        //     return true;
        // }
        case "autoInputBySaikei": {
            const currentPage = document.querySelector("#c_id")?.value || "unknown";
            const jsonData = message.jsonData;
            const saikeiOperator = jsonData?.saikei || "=";
            const inputClass = jsonData?.blade || "";
            const opsInput = {
                ">":  (a) => a - 1,
                "<":  (a) => a + 1,
                ">=": (a) => a,
                "<=": (a) => a,
                "=":  (a) => a,
                "!=": (a) => a + 1
            };

            const computeInput = opsInput[saikeiOperator];
            const results = [];

            // Helper function để input và push kết quả
            const handleInput = (inputEl, saikeiId, saikeiVal, valueToInput, index, i) => {
                inputEl.value = valueToInput;
                inputEl.dispatchEvent(new Event("input", { bubbles: true }));
                inputEl.dispatchEvent(new Event("change", { bubbles: true }));

                results.push({
                    saikeiId,
                    saikeiVal,
                    inputId: inputEl.id || `input_${index}_${i}`,
                    valueToInput,
                    pageId: currentPage
                });
            };

            // ==== Xử lý theo hàng (y_saikei) ====
            const ySaikeiSpans = Array.from(document.querySelectorAll("span[id^='y_saikei']"));
            ySaikeiSpans.forEach((span, index) => {
                const saikeiId = span.id || `unknown_y_${index}`;
                const saikeiVal = parseInt(span.textContent.trim(), 10);
                if (isNaN(saikeiVal)) return;

                const tr = span.closest("tr");
                if (!tr) return;

                const inputEls = Array.from(tr.querySelectorAll("input")).filter(input => {
                    return input.classList.contains(inputClass) || input.className.startsWith(inputClass + "_");
                });

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
            const tSaikeiSpans = Array.from(document.querySelectorAll("span[id^='t_saikei']"));
            tSaikeiSpans.forEach((span, index) => {
                const saikeiId = span.id || `unknown_t_${index}`;
                const saikeiVal = parseInt(span.textContent.trim(), 10);
                if (isNaN(saikeiVal)) return;

                const spanIndexMatch = span.id.match(/\d+$/);
                const spanIndex = spanIndexMatch ? spanIndexMatch[0] : index;

                const inputEls = Array.from(document.querySelectorAll("input")).filter(input => {
                    const classList = input.className.split(/\s+/);
                    return classList.some(c => c === inputClass || c === `${inputClass}_${spanIndex}`);
                });

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
                "!=": (a, b) => a != b
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
                            pageId: currentPage
                        });
                    }

                    i++;
                }
            } else {
                // Trường hợp 1 cột
                const saikeiSpan = document.querySelector(`#t_saikei`);
                const gokeiEl = document.querySelector(`#${bladeBase}_total`);

                const saikeiVal = saikeiSpan ? parseInt(saikeiSpan.textContent.trim(), 10) : NaN;
                const gokeiVal = gokeiEl ? parseInt(gokeiEl.textContent.trim(), 10) : NaN;

                if (!isNaN(saikeiVal) && !isNaN(gokeiVal)) {
                    results.push({
                        saikeiId: saikeiSpan?.id || "t_saikei",
                        saikeivalue: saikeiVal,
                        gokeiId: `${bladeBase}_total`,
                        gokeivalue: gokeiVal,
                        status: compareGokei(gokeiVal, saikeiVal),
                        bladeGroup: bladeBase,
                        pageId: currentPage
                    });
                }
            }

            sendResponse({ data: results });
            return true;
        }

        // case "autoInputByGokei": {
        //     const currentPage = document.querySelector("#c_id")?.value || "unknown";
        //     const jsonData = message.jsonData;
        //     const gokeiOperator = jsonData?.gokei || "=";
        //     const bladeBase = jsonData?.blade || "";
        //     const results = [];

        //     function sendSaveData(message) {
        //         chrome.runtime.sendMessage({ action: "saveData", message });
        //     }

        //     function generateRandomSumArray(count, total) {
        //         if (count === 1) return [total];
        //         const numbers = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * (total + 1)));
        //         numbers.push(0, total);
        //         numbers.sort((a, b) => a - b);
        //         const result = [];
        //         for (let i = 1; i < numbers.length; i++) {
        //             result.push(numbers[i] - numbers[i - 1]);
        //         }
        //         let diff = total - result.reduce((sum, val) => sum + val, 0);
        //         let index = 0;
        //         while (diff !== 0) {
        //             if (diff > 0 && result[index] < total) {
        //                 result[index]++;
        //                 diff--;
        //             } else if (diff < 0 && result[index] > 0) {
        //                 result[index]--;
        //                 diff++;
        //             }
        //             index = (index + 1) % result.length;
        //         }
        //         for (let i = result.length - 1; i > 0; i--) {
        //             const j = Math.floor(Math.random() * (i + 1));
        //             [result[i], result[j]] = [result[j], result[i]];
        //         }
        //         return result;
        //     }

        //     function processInputs(inputEls, saikeiVal, groupName) {
        //         const visibleInputs = inputEls.filter(input => input.offsetParent !== null);
        //         const hiddenInputs = inputEls.filter(input => input.offsetParent === null);

        //         if (hiddenInputs.length > 0) {
        //             hiddenInputs.forEach((inputEl, index) => {
        //                 sendSaveData({
        //                     blade: groupName,
        //                     inputId: inputEl.id || `hidden_input_${groupName}_${index}`,
        //                     status: "hidden",
        //                     pageId: currentPage
        //                 });
        //             });
        //         }

        //         if (visibleInputs.length === 0) {
        //             console.warn(`Không tìm thấy input hiển thị nào cho nhóm ${groupName}`);
        //             return;
        //         }

        //         let targetValue = saikeiVal;
        //         switch (gokeiOperator) {
        //             case ">": targetValue += visibleInputs.length; break;
        //             case "<": targetValue = Math.max(targetValue - visibleInputs.length, 0); break;
        //             case "!=": targetValue += 10; break;
        //         }

        //         const randomValues = generateRandomSumArray(visibleInputs.length, targetValue);

        //         visibleInputs.forEach((inputEl, index) => {
        //             const valueToInput = randomValues[index];
        //             inputEl.value = valueToInput;
        //             inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        //             inputEl.dispatchEvent(new Event("change", { bubbles: true }));
        //             results.push({
        //                 blade: groupName,
        //                 inputId: inputEl.id || `input_${groupName}_${index}`,
        //                 valueToInput,
        //                 saikeiTarget: saikeiVal,
        //                 gokeiExpected: targetValue,
        //                 operator: gokeiOperator,
        //                 pageId: currentPage
        //             });
        //         });
        //     }

        //     const tSaikeiSpans = Array.from(document.querySelectorAll("span[id^='t_saikei']"));
        //     const ySaikeiSpans = Array.from(document.querySelectorAll("span[id^='y_saikei']"));

        //     if (tSaikeiSpans.length > 0) {
        //         // 📊 Theo cột: xử lý t_saikei
        //         tSaikeiSpans.forEach(span => {
        //             const idMatch = span.id.match(/t_saikei_?(\d*)/);
        //             const groupNumber = idMatch?.[1] || "";
        //             const saikeiVal = parseInt(span.textContent.trim(), 10);
        //             if (isNaN(saikeiVal)) return;

        //             const inputClass = groupNumber ? `${bladeBase}_${groupNumber}` : bladeBase;
        //             const inputEls = Array.from(document.querySelectorAll(`input.${inputClass}`));
        //             if (inputEls.length > 0) {
        //                 processInputs(inputEls, saikeiVal, inputClass);
        //             }
        //         });
        //     }

        //     if (tSaikeiSpans.length === 0 && ySaikeiSpans.length > 0) {
        //         ySaikeiSpans.forEach(span => {
        //             const row = span.closest("tr");
        //             if (!row) return;

        //             const saikeiVal = parseInt(span.textContent.trim(), 10);
        //             if (isNaN(saikeiVal)) return;

        //             // Tự động dò input cùng hàng
        //             const inputEls = Array.from(row.querySelectorAll(`input[class*="${bladeBase}"]`));
        //             if (inputEls.length > 0) {
        //                 const groupName = span.id || `row_${Math.random().toString(36).substring(2, 8)}`;
        //                 processInputs(inputEls, saikeiVal, groupName);
        //             } else {
        //                 console.warn(`❌ Không tìm thấy input cho hàng ${span.id}`);
        //             }
        //         });
        //     }


        //     sendResponse({ data: results });
        //     return true;
        // }
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
                const numbers = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * (total + 1)));
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
                const visibleInputs = inputEls.filter(input => input.offsetParent !== null);
                const hiddenInputs = inputEls.filter(input => input.offsetParent === null);

                if (hiddenInputs.length > 0) {
                    hiddenInputs.forEach((inputEl, index) => {
                        sendSaveData({
                            blade: groupName,
                            inputId: inputEl.id || `hidden_input_${groupName}_${index}`,
                            status: "hidden",
                            pageId: currentPage
                        });
                    });
                }

                if (visibleInputs.length === 0) {
                    console.warn(`❌ Không tìm thấy input hiển thị nào cho nhóm ${groupName}`);
                    return;
                }

                let targetValue = saikeiVal;
                switch (gokeiOperator) {
                    case ">": targetValue += visibleInputs.length; break;
                    case "<": targetValue = Math.max(targetValue - visibleInputs.length, 0); break;
                    case "!=": targetValue += 10; break;
                }

                const randomValues = generateRandomSumArray(visibleInputs.length, targetValue);

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
                        pageId: currentPage
                    });
                });
            }

            const tSaikeiSpans = Array.from(document.querySelectorAll("span[id^='t_saikei']"));
            const ySaikeiSpans = Array.from(document.querySelectorAll("span[id^='y_saikei']"));

            if (tSaikeiSpans.length > 0) {
                tSaikeiSpans.forEach(span => {
                    const idMatch = span.id.match(/t_saikei_?(\d*)/);
                    const groupNumber = idMatch?.[1] || "";
                    const saikeiVal = parseInt(span.textContent.trim(), 10);
                    if (isNaN(saikeiVal)) return;

                    const inputClass = groupNumber ? `${bladeBase}_${groupNumber}` : bladeBase;
                    const inputEls = Array.from(document.querySelectorAll(`input.${inputClass}`));

                    console.log("🔍 Đang xử lý t_saikei:", span.id, "→ group:", groupNumber, "→ class:", inputClass, "→ input:", inputEls.length);

                    if (inputEls.length > 0) {
                        processInputs(inputEls, saikeiVal, inputClass);
                    } else {
                        console.warn(`❌ Không tìm thấy input với class '${inputClass}'`);
                    }
                });
            }

            if (tSaikeiSpans.length === 0 && ySaikeiSpans.length > 0) {
                ySaikeiSpans.forEach(span => {
                    const row = span.closest("tr");
                    if (!row) return;

                    const saikeiVal = parseInt(span.textContent.trim(), 10);
                    if (isNaN(saikeiVal)) return;

                    const inputEls = Array.from(row.querySelectorAll(`input[class*="${bladeBase}"]`));
                    const groupName = span.id || `row_${Math.random().toString(36).substring(2, 8)}`;

                    console.log("🔍 Đang xử lý y_saikei:", span.id, "→ input:", inputEls.length);

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
                const numbers = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * (total + 1)));
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
                const visibleInputs = inputEls.filter(input => input.offsetParent !== null);
                const hiddenInputs = inputEls.filter(input => input.offsetParent === null);

                if (hiddenInputs.length > 0) {
                    hiddenInputs.forEach((inputEl, index) => {
                        sendSaveData({
                            blade: groupName,
                            inputId: inputEl.id || `hidden_input_${groupName}_${index}`,
                            status: "hidden",
                            pageId: currentPage
                        });
                    });
                }

                if (visibleInputs.length === 0) {
                    console.warn(`❌ Không tìm thấy input hiển thị nào cho nhóm ${groupName}`);
                    return;
                }

                let targetValue = saikeiVal;
                switch (gokeiOperator) {
                    case ">": targetValue += visibleInputs.length; break;
                    case "<": targetValue = Math.max(targetValue - visibleInputs.length, 0); break;
                    case "!=": targetValue += 10; break;
                }

                const randomValues = generateRandomSumArray(visibleInputs.length, targetValue);

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
                        pageId: currentPage
                    });
                });
            }

            const ySaikeiSpans = Array.from(document.querySelectorAll("span[id*='saikei']"));

            
            ySaikeiSpans.forEach(span => {
                const row = span.closest("tr");
                if (!row) return;

                const saikeiVal = parseInt(span.textContent.trim(), 10);
                if (isNaN(saikeiVal)) return;

                const inputEls = Array.from(row.querySelectorAll(`input[class*="${bladeBase}"]`));
                const groupName = span.id || `row_${Math.random().toString(36).substring(2, 8)}`;

                console.log("🔍 Đang xử lý y_saikei:", span.id, "→ input:", inputEls.length);

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
            const allInputs = document.querySelectorAll(`input[class*="${bladeBase}"]`);

            allInputs.forEach(inputEl => {
                const matchedClass = Array.from(inputEl.classList).filter(cls => {

                    if (!cls.startsWith(bladeBase)) return false;
                    const tail = cls.replace(bladeBase, "").replace(/^_/, ""); 
                    if (!tail) return true;
                    return tail.split("_").every(part => /^\d+$/.test(part));
                    
                }).sort((a, b) => b.length - a.length)[0];
                
                if (!matchedClass) return;

                // Phân tích class để gom theo "cột"
                const parts = matchedClass.split("_");
                let groupKey = matchedClass; // mặc định

                if (parts.length === 3) groupKey = `${parts[0]}_${parts[2]}`; // Q15_1_2 → Q15_2
                else if (parts.length === 2) groupKey = matchedClass;         // Q15_2
                else if (parts.length === 1) groupKey = matchedClass;         // Q15

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
                            value: val
                        });
                    }
                });

                results.push({
                    blade: groupKey,
                    totalInputSum: sum,
                    expected: 100,
                    status: sum === 100,
                    pageId: currentPage,
                    values
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
            const allInputs = document.querySelectorAll(`input[class*="${bladeBase}"]`);

            allInputs.forEach(inputEl => {
                const matchedClass = Array.from(inputEl.classList).filter(cls => {
                    if (!cls.startsWith(bladeBase)) return false;
                    const tail = cls.replace(bladeBase, "").replace(/^_/, "");
                    if (!tail) return true;
                    return tail.split("_").every(part => /^\d+$/.test(part));
                }).sort((a, b) => b.length - a.length)[0];

                if (!matchedClass) return;

                const groupKey = matchedClass;
                if (!inputGroups[groupKey]) inputGroups[groupKey] = [];
                inputGroups[groupKey].push(inputEl);
            });

            // Hàm tạo mảng số random sao cho tổng = 100
            function generateRandomSumArray(count, total) {
                const numbers = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * (total + 1)));
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
                        pageId: currentPage
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
                    case "=": return sum === totalValue;
                    case "!=": return sum !== totalValue;
                    case ">": return sum > totalValue;
                    case "<": return sum < totalValue;
                    case ">=": return sum >= totalValue;
                    case "<=": return sum <= totalValue;
                    default: return sum === totalValue;
                }
            };

            const inputGroups = {};
            const allInputs = document.querySelectorAll(`input[class*="${bladeBase}"]`);

            allInputs.forEach(inputEl => {
                const matchedClass = Array.from(inputEl.classList).filter(cls => {
                    if (!cls.startsWith(bladeBase)) return false;
                    const tail = cls.replace(bladeBase, "").replace(/^_/, "");
                    if (!tail) return true;
                    return tail.split("_").every(part => /^\d+$/.test(part));
                }).sort((a, b) => b.length - a.length)[0];

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
                            value: val
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
                    values
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

            const steps = [ 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
            const results = [];

            inputEls.forEach((inputEl, index) => {
                if (inputEl && inputEl.type === "text") {
                    const randomVal = steps[Math.floor(Math.random() * steps.length)];

                    inputEl.value = randomVal;
                    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
                    inputEl.dispatchEvent(new Event("change", { bubbles: true }));

                    results.push({
                        inputId: inputEl.id || `input_${index}`,
                        value: randomVal
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
                        value: randomVal
                    });
                }
            });

            sendResponse({ data: results });
            return true;
        }

        case "tsgCheck": {
            const tsgBtn = document.querySelector(".end_view");
            if (tsgBtn){
                sendResponse({status: true});
            }else{
                sendResponse({status: false});
            }
            return true;
        }

        case "doneCheck": {
            const doneScreen = document.querySelector("#thanks_amazon");
            const isThankYouMessage = document.body.innerText.includes("ご協力ありがとうございました");
            if (doneScreen || isThankYouMessage){
                sendResponse({status: true});
            }else{
                sendResponse({status: false});
            }
            return true;
        }

        case "getNowQ": {
            let currentNumber = parseInt(document.getElementById("now_q").innerText, 10);
            currentNumber?currentNumber:0;
            sendResponse({ value: currentNumber });
            return true;
        }

        case "numCheckAutoTest": {
            (async () => {
                const jsonData = message.jsonData;
                const inputClass = jsonData?.blade || "";
                const allInputs = Array.from(document.querySelectorAll(`input.${inputClass}`));

                const testCases = [
                    { type: "specialChars", value: "!@#$%^&*()" },
                    { type: "alphabet", value: "abcXYZ" },
                    { type: "decimal", value: "1.1" },
                    { type: "decimalZero", value: "5.0" },
                    { type: "zenkakuNumber", value: "１２３" } // Full-width Japanese number
                ];

                const results = [];

                async function simulateTyping(input, text) {
                    input.focus();
                    input.value = ""; 
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    input.dispatchEvent(new Event("change", { bubbles: true }));

                    for (const char of text) {
                        const eventParams = { key: char, char, keyCode: char.charCodeAt(0), bubbles: true };

                        input.dispatchEvent(new KeyboardEvent("keydown", eventParams));
                        input.value += char;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new KeyboardEvent("keyup", eventParams));

                        await new Promise(resolve => setTimeout(resolve, 20));
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
                            const converted = test.value.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248));
                            isPass = actualValue === converted;
                        }

                        results.push({
                            inputId: inputEl.id,
                            testType: test.type,
                            expectedValue: test.value,
                            actualValue,
                            isPass
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
                const textNode = [...article.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
                const rawText = textNode?.textContent?.trim() || "";
                bladeText = rawText.replace(/^■\s*/, "").trim();
            }

            // Xác định type dựa trên layout
            const typeList = [];

            const s0data = document.querySelector("body > div.next_btn");
            const sc0data = document.querySelector("#q_data > div:nth-child(5) > table > tbody > tr:nth-child(1) > th");
            const sadata = document.querySelectorAll("input[type=radio]");
            const nodata = document.querySelectorAll("input.s_input");
            const madata = document.querySelectorAll('input[type="checkbox"]');
            const selectdata = document.querySelectorAll('select');
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

                if (madata.length > 0 && madata.length === sadata.length){
                    typeList.pop("MA");
                    typeList.push("MASA");
                } else{
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

            sendResponse({ status: true, type: typeList, blade: bladeText, hasY, hasT });
            return true;
        }

        case "selectJoui": {
            const selectedValues = new Set();
            let checkedInputs = document.querySelectorAll('input[type="checkbox"]:checked');
            if (checkedInputs.length === 0) {
                checkedInputs = document.querySelectorAll('input[type="radio"]:checked');
            }

            const selectList = [];

            checkedInputs.forEach(input => {
                const tr = input.closest('tr');
                if (!tr) return;

                // Tìm select trong cùng tr — có thể nằm ở bất kỳ td nào
                const select = tr.querySelector('select');
                if (select) selectList.push(select);
            });

            selectList.forEach(select => {
                const availableOptions = Array.from(select.options).filter(option => {
                    return option.value && !selectedValues.has(option.value) && !option.disabled;
                });

                if (availableOptions.length === 0) {
                    console.warn('⚠️ Không còn option khả dụng cho select này.');
                    return;
                }

                const randomOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
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
            rows.forEach(row => {
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
                const optionsCount = Array.from(selects[0].options).filter(option => option.value).length;
                if (optionsCount >= selects.length) {
                    selectedValuesByColumn[colIndex] = new Set();

                    selects.forEach(select => {
                        const availableOptions = Array.from(select.options).filter(option => option.value && !selectedValuesByColumn[colIndex].has(option.value));

                        if (availableOptions.length > 0) {
                            const randomOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
                            select.value = randomOption.value;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                            selectedValuesByColumn[colIndex].add(randomOption.value);
                        } else {
                            console.warn(`⚠️ Không còn option khả dụng trong cột ${colIndex}`);
                        }
                    });
                }
            });

            // Bước 3: Nếu cột thiếu option, xử lý random theo hàng
            rows.forEach(row => {
                const rowSelects = row.querySelectorAll("select");
                const selectedValuesInRow = new Set();

                rowSelects.forEach(select => {
                    if (!select.value) {
                        const availableOptions = Array.from(select.options).filter(option => option.value && !selectedValuesInRow.has(option.value));

                        if (availableOptions.length > 0) {
                            const randomOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
                            select.value = randomOption.value;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                            selectedValuesInRow.add(randomOption.value);
                        } else {
                            console.warn(`⚠️ Không còn option khả dụng trong hàng.`);
                        }
                    }
                });
            });
        }

        case "getAlertText": {
            const alertElement = document.querySelector("#alertify > div > article > p");
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
            const alertElement = document.querySelector("#alertify > div > article > p");
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
                console.warn("⚠️ Số trong thông báo lỗi không hợp lệ:", extractedNumber);
                sendResponse({ data: results });
                return true;
            }

            // Bước 3: Lấy tất cả input (không giới hạn class nữa)
            const allInputs = Array.from(document.querySelectorAll("input[type='text'], input[type='number']"));

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
                    pageId: currentPage
                });
            });

            sendResponse({ data: results });
            return true;
        }

         //合計＝ ↓→ 計

        // case "autoInputDepressionCheck": {
        //     const results = [];
        //     const keyToInput = new Map();
        //     const valueMap = new Map();

        //     const getValueFromCell = (cell) => {
        //         if (!cell) return 0;
        //         const input = cell.querySelector("input");
        //         const spanT = cell.querySelector("span[id*='t_saikei'], span[class*='t_saikei']");
        //         const spanY = cell.querySelector("span[id*='y_saikei'], span[class*='y_saikei']");
        //         if (input) return parseInt(input.value) || 0;
        //         if (spanT || spanY) {
        //             const text = (spanT || spanY).textContent;
        //             return parseInt(text.replace(/[^\d]/g, "")) || 0;
        //         }
        //         return 0;
        //     };

        //     const getKey = (input) =>
        //         input?.getAttribute("id") ||
        //         input?.getAttribute("name") ||
        //         input?.className ||
        //         Math.random().toString();

        //     const downConstraints = [];

        //     // === 1. Gom nhóm ↓ theo cột ===
        //     document.querySelectorAll("th > i.fa-arrow-down").forEach((arrow) => {
        //         const th = arrow.closest("th");
        //         const colIndex = Array.from(th?.parentElement?.children || []).indexOf(th);
        //         const table = th?.closest("table");
        //         const rows = Array.from(table?.querySelectorAll("tbody tr") || []);
        //         const topCell = rows[0]?.children[colIndex];
        //         const maxTotal = getValueFromCell(topCell);
        //         const inputs = [];

        //         for (let i = 1; i < rows.length; i++) {
        //             const cell = rows[i]?.children[colIndex];
        //             const input = cell?.querySelector("input");
        //             if (input && !input.disabled) {
        //                 const key = getKey(input);
        //                 inputs.push(key);
        //                 keyToInput.set(key, input);
        //             }
        //         }

        //         downConstraints.push({ maxTotal, inputs });
        //     });

        //     // === 2. Reset tất cả input đã gom về 0 ===
        //     for (const input of keyToInput.values()) {
        //         input.value = 0;
        //         input.dispatchEvent(new Event("input", { bubbles: true }));
        //         input.dispatchEvent(new Event("change", { bubbles: true }));
        //     }

        //     // === 3. Phân bổ ↓ ===
        //     for (const { maxTotal, inputs } of downConstraints) {
        //         if (inputs.length === 0) continue;
        //         const base = Math.floor(maxTotal / inputs.length);
        //         const remain = maxTotal - base * inputs.length;
        //         inputs.forEach((key, idx) => {
        //             const value = base + (idx < remain ? 1 : 0);
        //             valueMap.set(key, value);
        //         });
        //     }

        //     // === 4. Áp dụng giá trị đã phân cho ↓ ===
        //     for (const [key, input] of keyToInput.entries()) {
        //         if (!valueMap.has(key)) continue;
        //         const value = valueMap.get(key);
        //         input.value = value;
        //         input.dispatchEvent(new Event("input", { bubbles: true }));
        //         input.dispatchEvent(new Event("change", { bubbles: true }));
        //         results.push({ input: key, value });
        //     }

        //     // === 5. Gom nhóm → theo hàng ===
        //     document.querySelectorAll("td > i.fa-arrow-right").forEach((arrow) => {
        //         const td = arrow.closest("td");
        //         const row = td?.closest("tr");
        //         const cells = Array.from(row?.children || []);
        //         const arrowIndex = cells.indexOf(td);

        //         const leftCell = cells[arrowIndex - 1];
        //         const originalLeftValue = getValueFromCell(leftCell);
        //         const inputs = [];

        //         for (let i = arrowIndex + 1; i < cells.length; i++) {
        //             const cell = cells[i];
        //             const input = cell?.querySelector("input");
        //             if (input && !input.disabled) {
        //                 const key = getKey(input);
        //                 inputs.push(key);
        //                 keyToInput.set(key, input);
        //             }
        //         }

        //         const totalValue = originalLeftValue;
        //         if (totalValue == null || totalValue < 0 || inputs.length === 0) return;

        //         const base = Math.floor(totalValue / inputs.length);
        //         const remain = totalValue - base * inputs.length;

        //         inputs.forEach((key, idx) => {
        //             const value = base + (idx < remain ? 1 : 0);
        //             const input = keyToInput.get(key);
        //             if (input) {
        //                 input.value = value;
        //                 input.dispatchEvent(new Event("input", { bubbles: true }));
        //                 input.dispatchEvent(new Event("change", { bubbles: true }));
        //                 results.push({ input: key, value });
        //             }
        //         });
        //     });

        //     sendResponse({ data: results });
        //     return true;
        // }
        // case "autoInputDepressionCheck": {
        //     const results = [];
        
        //     const getKey = (input) =>
        //         input?.getAttribute("id") ||
        //         input?.getAttribute("name") ||
        //         input?.className ||
        //         Math.random().toString();
        
        //     const getValueFromCell = (cell) => {
        //         if (!cell) return 0;
        //         const input = cell.querySelector("input");
        //         const spanT = cell.querySelector("span[id*='t_saikei'], span[class*='t_saikei']");
        //         const spanY = cell.querySelector("span[id*='y_saikei'], span[class*='y_saikei']");
        //         if (input) return parseInt(input.value) || 0;
        //         if (spanT || spanY) {
        //             const text = (spanT || spanY).textContent;
        //             return parseInt(text.replace(/[^\d]/g, "")) || 0;
        //         }
        //         return 0;
        //     };
        
        //     const randomSplit = (total, parts) => {
        //         if (parts <= 0) return [];
        //         if (parts === 1) return [total];
        //         const nums = Array.from({ length: parts - 1 }, () =>
        //             Math.floor(Math.random() * (total + 1))
        //         );
        //         nums.push(0, total);
        //         nums.sort((a, b) => a - b);
        //         const result = [];
        //         for (let i = 1; i < nums.length; i++) {
        //             result.push(nums[i] - nums[i - 1]);
        //         }
        //         return result;
        //     };
        
        //     const keyToInput = new Map();
        
        //     // === 1. Mũi tên ↓: gom theo ID pattern Qxx_1, Qxx_2, ...
        //     const allInputs = Array.from(document.querySelectorAll("input[id^='Q']"));
        //     const groups = new Map();
        
        //     allInputs.forEach((input) => {
        //         const match = input.id.match(/^(Q\d+)_\d+$/);
        //         if (!match) return;
        //         const prefix = match[1];
        //         if (!groups.has(prefix)) groups.set(prefix, []);
        //         groups.get(prefix).push(input);
        //     });
        
        //     for (const [prefix, inputs] of groups.entries()) {
        //         const sorted = inputs.sort((a, b) => {
        //             const aIndex = parseInt(a.id.split("_")[1]);
        //             const bIndex = parseInt(b.id.split("_")[1]);
        //             return aIndex - bIndex;
        //         });
        
        //         const topInput = sorted[0];
        //         const others = sorted.slice(1);
        //         const total = Math.floor(Math.random() * 101); // Always random top input
        
        //         topInput.value = total;
        //         topInput.dispatchEvent(new Event("input", { bubbles: true }));
        //         topInput.dispatchEvent(new Event("change", { bubbles: true }));
        //         results.push({ input: getKey(topInput), value: total });
        
        //         const values = randomSplit(total, others.length);
        //         others.forEach((input, idx) => {
        //             input.value = values[idx];
        //             input.dispatchEvent(new Event("input", { bubbles: true }));
        //             input.dispatchEvent(new Event("change", { bubbles: true }));
        //             results.push({ input: getKey(input), value: values[idx] });
        //         });
        //     }
        
        //     // === 2. Mũi tên →: phân bổ theo hàng
        //     document.querySelectorAll("td > i.fa-arrow-right").forEach((arrow) => {
        //         const td = arrow.closest("td");
        //         const row = td?.closest("tr");
        //         const cells = Array.from(row?.children || []);
        //         const arrowIndex = cells.indexOf(td);
        
        //         const leftCell = cells[arrowIndex - 1];
        //         const total = getValueFromCell(leftCell);
        
        //         const inputs = [];
        //         for (let i = arrowIndex + 1; i < cells.length; i++) {
        //             const input = cells[i]?.querySelector("input");
        //             if (input && !input.disabled) {
        //                 inputs.push(input);
        //                 keyToInput.set(getKey(input), input);
        //             }
        //         }
        
        //         if (total == null || total < 0 || inputs.length === 0) return;
        
        //         const values = randomSplit(total, inputs.length);
        //         inputs.forEach((input, idx) => {
        //             input.value = values[idx];
        //             input.dispatchEvent(new Event("input", { bubbles: true }));
        //             input.dispatchEvent(new Event("change", { bubbles: true }));
        //             results.push({ input: getKey(input), value: values[idx] });
        //         });
        //     });
        
        //     sendResponse({ data: results });
        //     return true;
        // }

        //合計＝bg_error計
        // case "autoInputDepressionCheck": {
        //     const alertElement = document.querySelector("#alertify > div > article > p");
        //     const alertText = alertElement ? alertElement.innerText : "";
        //     const match = alertText.match(/(\d+)人/); // lấy số trước 人
        
        //     if (!match) {
        //         sendResponse({ status: false, message: "Không tìm thấy tổng người trong cảnh báo" });
        //         return true;
        //     }
        
        //     const totalTarget = parseInt(match[1]);
        
        //     // Lấy toàn bộ input cần xử lý
        //     const inputs = Array.from(document.querySelectorAll("input.bg_error")).filter(
        //         (el) => el.offsetParent !== null // chỉ lấy input đang hiển thị
        //     );
        
        //     // Nếu không có input nào thì return
        //     if (inputs.length === 0) {
        //         sendResponse({ status: false, message: "Không tìm thấy input cần nhập" });
        //         return true;
        //     }
        
        //     // Sinh giá trị random với xác suất 30% là 0, tổng đúng bằng totalTarget
        //     const generateRandomValues = (total, count) => {
        //         const values = new Array(count).fill(0);
        //         let remaining = total;
        
        //         for (let i = 0; i < count; i++) {
        //             if (Math.random() < 0.3 || remaining === 0) {
        //                 values[i] = 0;
        //                 continue;
        //             }
        
        //             const max = remaining - (count - i - 1); // giữ lại ít nhất 0 cho các ô còn lại
        //             const val = Math.floor(Math.random() * (max + 1));
        //             values[i] = val;
        //             remaining -= val;
        //         }
        
        //         // Chỉnh lệch nếu tổng chưa đúng
        //         const diff = total - values.reduce((a, b) => a + b, 0);
        //         if (diff !== 0) {
        //             const index = values.findIndex((v) => v + diff >= 0);
        //             if (index >= 0) values[index] += diff;
        //         }
        
        //         return values;
        //     };
        
        //     const randomValues = generateRandomValues(totalTarget, inputs.length);
        
        //     // Nhập giá trị vào các input
        //     inputs.forEach((input, index) => {
        //         input.value = randomValues[index];
        //         input.dispatchEvent(new Event("input", { bubbles: true }));
        //         input.dispatchEvent(new Event("change", { bubbles: true }));
        //     });
        
        //     sendResponse({ status: true, total: totalTarget, values: randomValues });
        //     return true;
        // }
        case "autoInputDepressionCheck": {
            const alertElement = document.querySelector("#alertify > div > article > p");
            const alertText = alertElement ? alertElement.innerText : "";
            const match = alertText.match(/(\d+)/);
        
            if (!match) {
                sendResponse({ status: false, message: "Không tìm thấy số trong cảnh báo" });
                return true;
            }
        
            const totalTarget = parseInt(match[1]);
        
            const inputs = Array.from(document.querySelectorAll("input.bg_error"))
                .filter(input => input.offsetParent !== null && !input.disabled); 
        
            const count = inputs.length;
            if (count === 0) {
                sendResponse({ status: false, message: "Không có input bg_error nào hiển thị" });
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
        
                const points = [0, ...Array.from({ length: nonZeroIndices.length - 1 }, () => Math.floor(Math.random() * remaining)), remaining];
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
        
            sendResponse({ status: true, message: `Đã nhập ${count} input với tổng = ${totalTarget}` });
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

                const numbers = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * (total + 1)));
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

                const visibleInputs = inputs.filter(input => input.offsetParent !== null);
                const errorInputs = visibleInputs.filter(input => input.classList.contains("bg_error"));
                const totalInputs = visibleInputs.filter(input => !input.classList.contains("bg_error"));

                if (errorInputs.length === 0 || totalInputs.length !== 1) return;

                const totalInput = totalInputs[0];
                const totalVal = parseInt(totalInput.value.trim(), 10);
                if (isNaN(totalVal)) {
                    console.warn(`⚠️ Tổng không hợp lệ ở dòng ${rowIndex + 1}`);
                    return;
                }

                const randomValues = generateRandomSumArray(errorInputs.length, totalVal);

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
                        pageId: currentPage
                    });
                });
            });

            sendResponse({ data: results });
            return true;
        }

        // case "autoInputFromTotalColumn": {
        //     const currentPage = document.querySelector("#c_id")?.value || "unknown";
        //     const results = [];

        //     function sendSaveData(message) {
        //         chrome.runtime.sendMessage({ action: "saveData", message });
        //     }

        //     function generateRandomSumArray(count, total) {
        //         if (count === 1) return [total];

        //         const numbers = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * (total + 1)));
        //         numbers.push(0, total);
        //         numbers.sort((a, b) => a - b);

        //         const result = [];
        //         for (let i = 1; i < numbers.length; i++) {
        //             result.push(numbers[i] - numbers[i - 1]);
        //         }

        //         let diff = total - result.reduce((sum, val) => sum + val, 0);
        //         let index = 0;
        //         while (diff !== 0) {
        //             if (diff > 0 && result[index] < total) {
        //                 result[index]++;
        //                 diff--;
        //             } else if (diff < 0 && result[index] > 0) {
        //                 result[index]--;
        //                 diff++;
        //             }
        //             index = (index + 1) % result.length;
        //         }

        //         for (let i = result.length - 1; i > 0; i--) {
        //             const j = Math.floor(Math.random() * (i + 1));
        //             [result[i], result[j]] = [result[j], result[i]];
        //         }

        //         return result;
        //     }

        //     const table = document.querySelector("table");
        //     const rows = Array.from(table.querySelectorAll("tbody tr"));

        //     if (rows.length === 0) {
        //         console.warn("⚠️ Không có hàng dữ liệu.");
        //         return;
        //     }

        //     const numCols = Math.max(...rows.map(row => row.querySelectorAll("input[type='text']").length));

        //     for (let colIndex = 0; colIndex < numCols; colIndex++) {
        //         const inputsInCol = rows.map(row => row.querySelectorAll("input[type='text']")[colIndex]).filter(Boolean);

        //         const visibleInputs = inputsInCol.filter(input => input.offsetParent !== null);
        //         const errorInputs = visibleInputs.filter(input => input.classList.contains("bg_error"));
        //         const totalInputs = visibleInputs.filter(input => !input.classList.contains("bg_error"));

        //         if (errorInputs.length === 0 || totalInputs.length !== 1) continue;

        //         const totalInput = totalInputs[0];
        //         const totalVal = parseInt(totalInput.value.trim(), 10);
        //         if (isNaN(totalVal)) {
        //             console.warn(`⚠️ Tổng không hợp lệ ở cột ${colIndex + 1}`);
        //             continue;
        //         }

        //         const randomValues = generateRandomSumArray(errorInputs.length, totalVal);

        //         errorInputs.forEach((inputEl, idx) => {
        //             const valueToInput = randomValues[idx];

        //             inputEl.value = valueToInput;
        //             inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        //             inputEl.dispatchEvent(new Event("change", { bubbles: true }));

        //             results.push({
        //                 column: colIndex + 1,
        //                 inputId: inputEl.id || `col${colIndex + 1}_input${idx + 1}`,
        //                 valueToInput,
        //                 totalSource: totalVal,
        //                 pageId: currentPage
        //             });
        //         });
        //     }

        //     sendResponse({ data: results });
        //     return true;
        // }
        case "autoInputFromTotalColumn": {
            const currentPage = document.querySelector("#c_id")?.value || "unknown";
            const results = [];

            function sendSaveData(message) {
                chrome.runtime.sendMessage({ action: "saveData", message });
            }

            function generateRandomSumArray(count, total) {
                if (count === 1) return [total];

                const numbers = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * (total + 1)));
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

            const totalVal = parseInt(totalSpan.textContent.trim().replace(/[^\d]/g, ""), 10);
            if (isNaN(totalVal)) {
                console.warn("⚠️ Giá trị tổng không hợp lệ.");
                return;
            }

            const allInputs = Array.from(document.querySelectorAll("table.table_mt input.s_input"));
            const errorInputs = allInputs.filter(input => input.classList.contains("bg_error"));

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
                    pageId: currentPage
                });
            });

            sendResponse({ data: results });
            return true;
        }

        case "autoCheckMaxCheckbox": {
            const currentPage = document.querySelector("#c_id")?.value || "unknown";
            const results = [];

            const alertElement = document.querySelector("#alertify > div > article > p");
            const alertText = alertElement?.textContent || "";
            const match = alertText.match(/[0-9０-９]+/);
            const parsedNumber = match
                ? parseInt(match[0].replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 65248)), 10)
                : null;

            if (!parsedNumber || isNaN(parsedNumber)) {
                sendResponse({ data: [], message: "❌ Không lấy được số từ thông báo lỗi" });
                return true;
            }

            const maxCheck = parsedNumber;

            // ✅ Gom checkbox theo thứ tự xuất hiện trong từng dòng (tr)
            const allRows = Array.from(document.querySelectorAll("tr"));
            const checkboxByColumn = {}; // { 0: [cb1, cb2], 1: [...], ... }

            allRows.forEach((row, rowIndex) => {
                const checkboxes = Array.from(row.querySelectorAll('input[type="checkbox"]')).filter(cb => cb.offsetParent !== null);
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
                        pageId: currentPage
                    });
                });
            });

            sendResponse({
                data: results,
                maxcheckbox: maxCheck
            });

            return true;
        }

        case "checkBgErrorCheckbox": {
            const checkboxes = document.querySelectorAll("input[type='checkbox']");

            const hasError = Array.from(checkboxes).some(cb => {
                const td = cb.closest("td");
                return td?.classList.contains("bg_error");
            });

            sendResponse({ status: hasError });
            return true;
        }

        case "autoCheckMaxErrorCheckbox": {
            const currentPage = document.querySelector("#c_id")?.value || "unknown";
            const results = [];

            const alertElement = document.querySelector("#alertify .alertify-message");
            const alertText = alertElement?.textContent || "";
            const matches = alertText.match(/[0-9０-９]+/g); // lấy tất cả số trong chuỗi
            const lastNumber = matches?.at(-1); // lấy số cuối cùng
            const maxCheck = lastNumber
                ? parseInt(lastNumber.replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 65248)), 10)
                : null;


            if (!maxCheck || isNaN(maxCheck)) {
                sendResponse({ data: [], message: "❌ Không lấy được số từ thông báo lỗi" });
                return true;
            }

            // ✅ Lấy checkbox nằm trong <td class="bg_error">
            const errorCheckboxes = Array.from(document.querySelectorAll("td.bg_error input[type='checkbox']"))
                .filter(cb => cb.offsetParent !== null);

            if (errorCheckboxes.length === 0) {
                sendResponse({ data: [], message: "❌ Không có checkbox lỗi nào đang hiển thị" });
                return true;
            }

            const groupMap = new Map();
            errorCheckboxes.forEach(cb => {
                const container = cb.closest("table") || cb.closest("div") || document.body;
                if (!groupMap.has(container)) groupMap.set(container, []);
                groupMap.get(container).push(cb);
            });

            let didProcess = false;

            for (const [container, checkboxes] of groupMap.entries()) {
                checkboxes.forEach(cb => {
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
                        pageId: currentPage
                    });
                });

                didProcess = true;
                break;
            }

            if (!didProcess) {
                sendResponse({ data: [], message: "❌ Không có vùng nào đủ checkbox lỗi để chọn" });
            } else {
                sendResponse({
                    data: results,
                    maxcheckbox: maxCheck,
                    message: `✅ Đã chọn ${maxCheck} checkbox có lỗi trong vùng hợp lệ`
                });
            }

            return true;
        }

        //Check MAで選択した箇所のSA空欄不可
        case "checkRadioAndCheckboxSameRow": {
            const checkedRadio = document.querySelector('input[type="radio"]:checked');
            const checkedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
        
            if (!checkedRadio || checkedCheckboxes.length === 0) {
                sendResponse({ isValid: false });
                return true;
            }
        
            const radioValue = checkedRadio.value;
        
            // Kiểm tra có checkbox nào cùng value không
            const isValid = checkedCheckboxes.some(cb => cb.value === radioValue);
        
            sendResponse({ isValid });
            return true;
        }

        //Check MAで選択した箇所のSONOTA空欄不可
        case "isCheckboxSameValueChecked": {
            const checkedRadio = document.querySelector('input[type="radio"]:checked');
            if (!checkedRadio) {
                sendResponse({ status: false });
                return true;
            }
        
            const radioValue = checkedRadio.value;
        
            // Tìm checkbox có cùng value
            const matchedCheckbox = document.querySelector(`input[type="checkbox"][value="${radioValue}"]`);
            const status = matchedCheckbox?.checked || false;
        
            sendResponse({ status });
            return true;
        }
        


        //Create DataKey Function
        
        // case "getDataQ": {
        //     const articles = Array.from(document.querySelectorAll("article.question_detail"));
        //     const results = [];
        
        //     for (let i = 0; i < articles.length; i++) {
        //         const article = articles[i];
        //         const nextArticle = articles[i + 1];
        
        //         const bladeNum = article.getAttribute('data-blede') || "";
        //         const textNode = [...article.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
        //         const rawText = textNode?.textContent?.trim() || "";
        //         let bladeText = rawText.replace(/^■\s*/, "").trim();
        
        //         const typeList = [];
        //         const saMap = new Map();
        //         let resultItem = [];
        
        //         // ✅ Tìm toàn bộ bảng nằm giữa </article> và <article> kế tiếp
        //         let nodesBetween = [];
        //         let current = article.nextSibling;
        
        //         while (current && current !== nextArticle) {
        //             if (current.nodeType === Node.ELEMENT_NODE) {
        //                 nodesBetween.push(current);
        //             }
        //             current = current.nextSibling;
        //         }
        
        //         // ✅ Nếu không có bảng hoặc chưa có bladeText thì lấy name của radio đầu tiên
        //         if (nodesBetween.length === 0 || bladeText === "") {
        //             // ✅ Tìm input radio tiếp theo sau article
        //             let next = article.nextSibling;
        //             while (next && next !== nextArticle) {
        //                 if (next.nodeType === Node.ELEMENT_NODE) {
        //                     const input = next.querySelector?.("input[type=radio]");
        //                     if (input?.name) {
        //                         bladeText = input.name;
        //                         break;
        //                     }
        //                 }
        //                 next = next.nextSibling;
        //             }
        //         }
                
        
        //         nodesBetween.forEach(table => {
        //             const sadata = table.querySelectorAll("input[type=radio]");
        //             const nodata = table.querySelectorAll("input.s_input");
        //             const madata = table.querySelectorAll('input[type="checkbox"]');
        //             const fadata = table.querySelectorAll("textarea");
        
        //             if (nodata.length > 0) typeList.push("NO");
        //             if (fadata.length > 0) typeList.push("FA");
        //             if (madata.length > 0) typeList.push("MA");
        

        //             // XỬ LÍ SA
        //             if (sadata.length > 0) {
        //                 typeList.push("SA");
        
        //                 Array.from(sadata).forEach(input => {
        //                     const td = input.closest('td');
        //                     const rawText = td ? td.textContent.trim() : "";
        //                     const labelText = rawText.replace(input.value, "").trim();
        //                     const name = input.name;
        //                     const value = input.value;
        
        //                     if (!saMap.has(name)) {
        //                         saMap.set(name, []);
        //                     }
        
        //                     saMap.get(name).push({
        //                         value: value,
        //                         text: labelText
        //                     });


        //                     //====================
        //                     let currentCategory = "";

        //                     const rows = table.querySelectorAll("tr");
        //                     rows.forEach( row => {
        //                         const cells = row.querySelectorAll("td");

        //                         // Lấy category từ ô có rowspan
        //                         if (cells.length > 1 && cells[0].hasAttribute("rowspan")) {
        //                             currentCategory = cells[0].textContent.trim();
        //                         }

        //                         // Câu hỏi và thuốc
        //                         if (!cells || cells.length === 0) return;
        //                         const questionCell = [...cells].find((td) => {
        //                             const hasRadio = td.querySelector("input[type=radio]");
        //                             const hasRowspan = td.hasAttribute("rowspan");
        //                             const text = td.textContent?.trim() || "";
        //                             return !hasRadio && !hasRowspan && text !== "" && text !== "→";
        //                         });

        //                         if (!questionCell) return;

        //                         const strongTag = questionCell.querySelector("strong");

        //                         const drugName = strongTag?.textContent?.trim() || "";
        //                         const fullQuestion = questionCell.textContent
        //                             .replace(drugName, "")
        //                             .trim()
        //                             .replace(/\s+/g, " ");

        //                         const question = `${fullQuestion}${
        //                             drugName ? `（${drugName}）` : ""
        //                         }`;

        //                         // Input radio
        //                         const inputs = row.querySelectorAll("input[type=radio]");

        //                         inputs.forEach((input) => {
        //                             const td = input.closest("td");
        //                             const rawText = td?.textContent?.trim() || "";
        //                             const labelText = rawText.replace(input.value, "").trim();
        //                             const name = input.name;
        //                             const value = input.value;

        //                             if (!saMap.has(name)) {
        //                             saMap.set(name, {
        //                                 blade: bladeNum,
        //                                 id: name,
        //                                 post_key: `${bladeNum}:::${name}::SA::`,
        //                                 theme: bladeText,
        //                                 category: currentCategory,
        //                                 question: question,
        //                                 choices: [],
        //                             });
        //                             }

        //                             saMap.get(name).choices.push(labelText);
        //                         });
        //                     });
        //                     //==================
        //                     const sa = [];
        //                     saMap.forEach(entries => {
        //                         const sortedTexts = entries
        //                             .sort((a, b) => {
        //                                 const valA = isNaN(a.value) ? a.value : parseFloat(a.value);
        //                                 const valB = isNaN(b.value) ? b.value : parseFloat(b.value);
        //                                 return valA - valB;
        //                             })
        //                             .map(e => e.text)
        //                             .filter(text => text !== "");
                
        //                         sa.push(...sortedTexts);
        //                     });
                
        //                     if (sa.length > 0) {
        //                         resultItem.saAnswer = sa;
        //                     }
        //                 });
        //             }
        //         });
        
                
        //         //TRẢ KẾT QUẢ
        //         resultItem = {
        //             postKey : `${bladeNum}:::${bladeText}::${[...new Set(typeList)]}::`,

        //         };
        
        //         results.push(resultItem);
        //     }
        
        //     sendResponse({ data: results });
        //     return true;
        // }

        case "getDataQ": {
            //================================<FUNCTION START>================================

            function getTablesBetween(startEl, endEl) {
                const result = [];
                let current = startEl.nextElementSibling;
                while (current && current !== endEl) {
                  if (current.nodeType === Node.ELEMENT_NODE) {
                    result.push(current);
                  }
                  current = current.nextSibling;
                }
                return result;
            }
            
            function detectTableType(table) {
                const types = [];
                if (table.querySelectorAll("input[type=radio]").length > 0) types.push("SA");
                if (table.querySelectorAll("input.s_input").length > 0) types.push("NO");
                if (table.querySelectorAll('input[type="checkbox"]').length > 0) types.push("MA");
                if (table.querySelectorAll('select').length > 0) types.push("sSA"); // SELECT = SA
                if (table.querySelectorAll("textarea").length > 0) types.push("FA");
                return types;
            }
            
            function handleQuestion({ type, selector, table, bladeNum, bladeText, map }) {
                const rows = table.querySelectorAll("tr");
                let currentCategory = "";
                let question = "";
              
                const classMap = new Map(); // Dùng cho MA
              
                rows.forEach(row => {
                  const cells = row.querySelectorAll("td");
              
                  if (cells.length > 1 && cells[0].hasAttribute("rowspan")) {
                    currentCategory = cells[0].textContent.trim();
                  }
              
                  const inputs = row.querySelectorAll(selector);
                  inputs.forEach(input => {
                    const id = input.id;
                    const name = input.name;
                    const value = input.value || "";
                    const td = input.closest("td");
                    const rawText = td?.textContent?.trim() || "";
                    const labelText = value ? rawText.replace(value, "").trim() : rawText;
              
                    if (type === "SA") {
                      const questionCell = [...cells].find(td => {
                        const hasInput = td.querySelector(selector);
                        const hasRowspan = td.hasAttribute("rowspan");
                        const text = td.textContent?.trim() || "";
                        return !hasInput && !hasRowspan && text !== "" && text !== "→";
                      });
              
                      if (questionCell) {
                        const strongTag = questionCell.querySelector("strong");
                        const drugName = strongTag?.textContent?.trim() || "";
                        const fullQuestion = questionCell.textContent.replace(drugName, "").trim().replace(/\s+/g, " ");
                        question = `${fullQuestion}${drugName ? `（${drugName}）` : ""}`;
                      }
              
                      if (!map.has(name)) {
                        map.set(name, {
                          blade: bladeNum,
                          id: name,
                          post_key: `${bladeNum}:::${name}::SA::`,
                          key1_1: "質問文",
                          page: bladeText || name,
                          key1_2: currentCategory,
                          key1_3: question || name,
                          key2_1: [],
                        });
                      }
              
                      map.get(name).key2_1.push(labelText);
                    }
              
                    if (type === "NO") {
                      if (!map.has(id)) {
                        map.set(id, {
                          blade: bladeNum,
                          id: id,
                          post_key: `${bladeNum}:::${id}::NO::`,
                        });
                      }
                    }
              
                    if (type === "MA") {
                      const classList = Array.from(input.classList);
                      if (classList.length === 0) return;
              
                      const firstClass = classList[0];
                      const secondClass = classList[1];
                      let targetClass = firstClass;
              
                      if (
                        secondClass &&
                        secondClass !== firstClass &&
                        secondClass.includes(firstClass)
                      ) {
                        targetClass = secondClass; // ✅ dùng class thứ 2 nếu nó chứa class 1
                      }
              
                      if (!classMap.has(targetClass)) {
                        classMap.set(targetClass, new Set());
                      }
              
                      classMap.get(targetClass).add(labelText);
                    }
                  });
                });
              
                if (type === "MA") {
                  classMap.forEach((choiceSet, className) => {
                    map.set(className, {
                      blade: bladeNum,
                      id: className,
                      post_key: `${bladeNum}:::${className}::MA::`,
                      key2_1: [...choiceSet],
                    });
                  });
                }
              }
              
              
              
              
                
            //================================<FUNCTION END>==================================

            const articles = Array.from(document.querySelectorAll("article.question_detail"));
            const results = [];

            for (let i = 0; i < articles.length; i++) {
              const article = articles[i];
              const nextArticle = articles[i + 1];
          
              const bladeNum = article.getAttribute("data-blede") || "";
              const rawText = [...article.childNodes].find(n => n.nodeType === Node.TEXT_NODE)?.textContent?.trim() || "";
              const bladeText = rawText.replace(/^■\s*/, "").trim();
          
              const saMap = new Map();
              const noMap = new Map();
              const maMap = new Map();
              const typeList = [];
          
              const tables = getTablesBetween(article, nextArticle);
          
              tables.forEach(table => {
                const types = detectTableType(table);
                typeList.push(...types);
          
                types.forEach(type => {
                  switch (type) {
                    case "SA":
                        handleQuestion({
                        type: "SA",
                        selector: "input[type=radio]",
                        table,
                        bladeNum,
                        bladeText,
                        map: saMap
                        });
                        break;
                    case "NO":
                        handleQuestion({
                        type: "NO",
                        selector: "input.s_input",
                        table,
                        bladeNum,
                        bladeText,
                        map: noMap
                        });
                        break;
                    case "MA":
                        handleQuestion({
                        type: "MA",
                        selector: 'input[type="checkbox"]',
                        table,
                        bladeNum,
                        bladeText,
                        map: maMap
                        });
                        break;
                    case "FA":
                      // Không cần xử lý chi tiết, chỉ ghi nhận type
                      break;
                    default:
                      console.warn("⛔ Không hỗ trợ loại:", type);
                  }
                });
              });
          
              // Push kết quả theo từng loại
              saMap.forEach(entry => results.push(entry));
              noMap.forEach(entry => results.push(entry));
              maMap.forEach(entry => results.push(entry));
            }
          
            sendResponse({ data: results });
            return true;
          }
          
      
        

        default:
            console.log("⛔ Unknown action:", message.action);
            sendResponse({ status: false });
            break;
    }
});
