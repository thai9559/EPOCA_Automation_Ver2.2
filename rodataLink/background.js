// chrome.runtime.onInstalled.addListener(() => {
//     console.log("EPOCA Automation Testing Extension Installed!");
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "injectContentScript") {
      chrome.scripting.executeScript({
        target: { tabId: request.tabId },
        files: ["content.js"]
      }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: "error", message: chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: "success" });
        }
      });
      return true;
    }
  });
  