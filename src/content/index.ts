const ENHANCE_BUTTON_ID = "lpe-enhance-btn";
const ADVANCED_BUTTON_ID = "lpe-advanced-btn";
const CONTAINER_ID = "lpe-button-container";

// Inject CSS animations
const injectStyles = () => {
  if (document.getElementById("lpe-injected-styles")) return;

  const style = document.createElement("style");
  style.id = "lpe-injected-styles";
  style.textContent = `
    @keyframes lpe-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes lpe-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes lpe-check-in {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    @keyframes lpe-slide-in {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};

// Get the LinkedIn editor via Shadow DOM
const getLinkedInEditor = (): HTMLElement | null => {
  const shadowHost = document.querySelector("#interop-outlet");
  return shadowHost?.shadowRoot?.querySelector(
    '[contenteditable="true"]',
  ) as HTMLElement;
};

// Get text from LinkedIn editor
const getEditorText = (): string => {
  const editor = getLinkedInEditor();
  return editor?.innerText.trim() || "";
};

// Insert text into LinkedIn editor
const insertTextToEditor = (text: string): boolean => {
  const editor = getLinkedInEditor();
  if (!editor) return false;

  editor.innerText = text;
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.dispatchEvent(new Event("change", { bubbles: true }));
  editor.focus();

  return true;
};

// Toast notification
const showToast = (message: string, type: "success" | "error" | "warning") => {
  const existingToast = document.getElementById("lpe-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "lpe-toast";

  const colors = {
    success: { bg: "#0a66c2", border: "#004182" },
    error: { bg: "#dc2626", border: "#b91c1c" },
    warning: { bg: "#d97706", border: "#b45309" },
  };

  const color = colors[type];

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${color.bg};
    border: 1px solid ${color.border};
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: lpe-slide-in 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Star icon SVG (Tabler sparkle)
const STAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275l5.813 1.912l-5.813 1.912a2 2 0 0 0 -1.275 1.275l-1.912 5.813l-1.912 -5.813a2 2 0 0 0 -1.275 -1.275l-5.813 -1.912l5.813 -1.912a2 2 0 0 0 1.275 -1.275l1.912 -5.813z"/></svg>`;

// Sidebar/Settings icon SVG (Tabler adjustments)
const SIDEBAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="10" r="2"/><line x1="6" y1="4" x2="6" y2="8"/><line x1="6" y1="12" x2="6" y2="20"/><circle cx="12" cy="16" r="2"/><line x1="12" y1="4" x2="12" y2="14"/><line x1="12" y1="18" x2="12" y2="20"/><circle cx="18" cy="7" r="2"/><line x1="18" y1="4" x2="18" y2="5"/><line x1="18" y1="9" x2="18" y2="20"/></svg>`;

// Spinner icon SVG
const SPINNER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: lpe-spin 1s linear infinite;"><path d="M12 3a9 9 0 1 0 9 9"/></svg>`;

// Checkmark icon SVG
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: lpe-check-in 0.4s ease-out;"><path d="M5 12l5 5l10 -10"/></svg>`;

// Create Enhance button (Icon only, LinkedIn Blue)
const createEnhanceButton = (): HTMLButtonElement => {
  const btn = document.createElement("button");
  btn.id = ENHANCE_BUTTON_ID;
  btn.title = "Enhance post with AI";
  btn.setAttribute("aria-label", "Enhance post with AI");

  btn.style.cssText = `
    width: 32px;
    height: 32px;
    background: #0a66c2;
    color: white;
    border: none;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  `;

  btn.innerHTML = STAR_ICON;

  btn.onmouseenter = () => {
    if (!btn.disabled) {
      btn.style.background = "#004182";
      btn.style.transform = "scale(1.05)";
      btn.style.boxShadow = "0 2px 8px rgba(10,102,194,0.4)";
    }
  };
  btn.onmouseleave = () => {
    if (!btn.disabled) {
      btn.style.background = "#0a66c2";
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
    }
  };

  // Click handler - Quick enhance
  btn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const text = getEditorText();

    if (!text) {
      showToast("Please write something first!", "warning");
      return;
    }

    // Set loading state
    btn.innerHTML = SPINNER_ICON;
    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.cursor = "not-allowed";

    try {
      chrome.runtime.sendMessage(
        { type: "QUICK_ENHANCE", caption: text },
        (response) => {
          if (response?.success && response.enhancedText) {
            insertTextToEditor(response.enhancedText);

            // Success state
            btn.innerHTML = CHECK_ICON;
            btn.style.background = "#22c55e";
            showToast("Post enhanced!", "success");

            setTimeout(() => {
              btn.innerHTML = STAR_ICON;
              btn.style.background = "#0a66c2";
              btn.disabled = false;
              btn.style.opacity = "1";
              btn.style.cursor = "pointer";
            }, 2000);
          } else {
            // Error state
            showToast(response?.error || "Enhancement failed", "error");
            btn.innerHTML = STAR_ICON;
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
          }
        },
      );
    } catch {
      showToast("Error enhancing post", "error");
      btn.innerHTML = STAR_ICON;
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  };

  return btn;
};

// Create Advanced button (Icon only, LinkedIn light gray)
const createAdvancedButton = (): HTMLButtonElement => {
  const btn = document.createElement("button");
  btn.id = ADVANCED_BUTTON_ID;
  btn.title = "Advanced options";
  btn.setAttribute("aria-label", "Advanced options");

  btn.style.cssText = `
    width: 32px;
    height: 32px;
    background: #f3f2ef;
    color: #666666;
    border: 1px solid #d4d2cf;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  btn.innerHTML = SIDEBAR_ICON;

  btn.onmouseenter = () => {
    if (!btn.disabled) {
      btn.style.background = "#e9e5df";
      btn.style.transform = "scale(1.05)";
    }
  };
  btn.onmouseleave = () => {
    if (!btn.disabled) {
      btn.style.background = "#f3f2ef";
      btn.style.transform = "scale(1)";
    }
  };

  // Click handler - Open side panel
  btn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const text = getEditorText();

    if (!text) {
      showToast("Please write something first!", "warning");
      return;
    }

    // Set loading state
    btn.innerHTML = SPINNER_ICON;
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
      chrome.runtime.sendMessage(
        { type: "OPEN_SIDE_PANEL", text: text },
        (response) => {
          if (response?.success) {
            btn.innerHTML = CHECK_ICON;
            btn.style.color = "#22c55e";

            setTimeout(() => {
              btn.innerHTML = SIDEBAR_ICON;
              btn.style.color = "#666666";
              btn.disabled = false;
              btn.style.opacity = "1";
            }, 2000);
          } else {
            showToast("Failed to open panel", "error");
            btn.innerHTML = SIDEBAR_ICON;
            btn.disabled = false;
            btn.style.opacity = "1";
          }
        },
      );
    } catch {
      showToast("Error opening panel", "error");
      btn.innerHTML = SIDEBAR_ICON;
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  };

  return btn;
};

// Inject both buttons
const injectButtons = () => {
  injectStyles();

  const editor = getLinkedInEditor();
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;

  if (!editor || !shadowRoot) return;

  // Check if already injected
  if (shadowRoot.querySelector(`#${CONTAINER_ID}`)) return;

  // Find the Post button
  const postButton = Array.from(shadowRoot.querySelectorAll("button")).find(
    (btn) =>
      btn.getAttribute("type") === "submit" ||
      btn.innerText.trim() === "Post" ||
      btn.getAttribute("aria-label")?.includes("Post"),
  );

  if (!postButton || !postButton.parentElement) return;

  // Create container for buttons
  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  container.style.cssText = `
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin-right: 8px;
  `;

  container.appendChild(createEnhanceButton());
  container.appendChild(createAdvancedButton());

  postButton.parentElement.insertBefore(container, postButton);
};

// Watch Shadow DOM for changes
const watchShadowDOM = () => {
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;
  if (shadowRoot) {
    const observer = new MutationObserver(() => injectButtons());
    observer.observe(shadowRoot, { childList: true, subtree: true });
  }
};

// Listen for messages from side panel to insert text
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "INSERT_TEXT") {
    const success = insertTextToEditor(message.text);
    if (success) {
      showToast("Content inserted!", "success");
    }
    sendResponse({ success });
    return true;
  }
});

// Main observer
const mainObserver = new MutationObserver(() => {
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;
  if (shadowRoot) {
    injectButtons();
    watchShadowDOM();
  }
});

mainObserver.observe(document.body, { childList: true, subtree: true });

// Initial check with delay
setTimeout(() => {
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;
  if (shadowRoot) {
    injectButtons();
    watchShadowDOM();
  }
}, 1000);
