import { enhancePost } from "../utils/openai";

// Open side panel when extension icon is clicked (fallback if popup doesn't work)
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Quick enhance - direct OpenAI call
  if (message.type === "QUICK_ENHANCE") {
    enhancePost(message.caption, { tone: "default" })
      .then((enhancedText) => {
        sendResponse({ success: true, enhancedText });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  // Open side panel with scraped text
  if (message.type === "OPEN_SIDE_PANEL") {
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.sidePanel
        .open({ tabId })
        .then(() => {
          // Store the scraped text for the side panel to retrieve
          chrome.storage.session.set({
            scrapedCaption: message.text,
            sourceTabId: tabId,
          });
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
    }
    return true;
  }

  // Get scraped text from session storage
  if (message.type === "GET_SCRAPED_TEXT") {
    chrome.storage.session.get(["scrapedCaption", "sourceTabId"], (result) => {
      sendResponse({
        text: result.scrapedCaption || "",
        tabId: result.sourceTabId,
      });
    });
    return true;
  }

  // Insert text into LinkedIn tab
  if (message.type === "INSERT_TEXT_TO_LINKEDIN") {
    const tabId = message.tabId;
    if (tabId) {
      chrome.tabs.sendMessage(
        tabId,
        {
          type: "INSERT_TEXT",
          text: message.text,
        },
        (response: { success?: boolean } | undefined) => {
          sendResponse(response);
        },
      );
    }
    return true;
  }
});
