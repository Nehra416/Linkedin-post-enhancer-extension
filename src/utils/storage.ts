// Save key in Chrome's local storage
export const setStoredApiKey = (key: string): Promise<void> => {
  return chrome.storage.local.set({ openaiApiKey: key });
};

// Fetch key from Chrome's local storage
export const getStoredApiKey = async (): Promise<string | undefined> => {
  if (typeof chrome === "undefined" || !chrome.storage) {
    return undefined;
  }
  const result = (await chrome.storage.local.get("openaiApiKey")) as {
    openaiApiKey?: string;
  };
  return result.openaiApiKey;
};
