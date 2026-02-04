import OpenAI from "openai";
import { getStoredApiKey } from "./utils/storage";

const ENHANCE_BUTTON_ID = "linkedin-enhance-btn";

// Get the linkedIn editor
const getLinkedInEditor = (): HTMLElement | null => {
  const shadowHost = document.querySelector("#interop-outlet");
  return shadowHost?.shadowRoot?.querySelector(
    '[contenteditable="true"]',
  ) as HTMLElement;
};

// Enhance the text
const enhanceText = async (text: string, apiKey: string): Promise<string> => {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a LinkedIn post expert. Make the post grammatically correct, not using the buzz words, use only simple and easy english words and improve it without making it longer.",
      },
      { role: "user", content: text },
    ],
  });

  return response.choices[0].message.content?.trim() || text;
};

// Create enhance btn with styling & functionality
const createEnhanceButton = (): HTMLButtonElement => {
  const btn = document.createElement("button");
  btn.id = ENHANCE_BUTTON_ID;
  //   btn.type = "button";
  btn.setAttribute("aria-label", "Enhance post with AI");

  // style the btn
  btn.style = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: 1px solid rgba(0,0,0,0.6);
    border-radius: 50px;
    white-space: nowrap;
    padding: 6px 12px;
    margin: 0 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: rgb(0,0,0);
    transition: all 0.3s;
  `;

  btn.innerHTML = `
    <span className="text-[12px]">✨</span>
    <span>Enhance</span>
  `;

  // Hover effect
  btn.onmouseenter = () => {
    btn.style.backgroundColor = "rgba(0,0,0,0.08)";
    btn.style.borderColor = "rgba(0,0,0,0.8)";
  };
  btn.onmouseleave = () => {
    btn.style.backgroundColor = "transparent";
    btn.style.borderColor = "rgba(0,0,0,0.6)";
  };

  btn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const editor = getLinkedInEditor();
    const text = editor?.innerText.trim();

    if (!text) {
      alert("Please write something first!");
      return;
    }

    const apiKey = await getStoredApiKey();
    if (!apiKey) {
      alert("Please set your OpenAI API key in the extension popup!");
      return;
    }

    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span>⏳</span><span>Enhancing...</span>`;
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";

    try {
      const enhanced = await enhanceText(text, apiKey);
      editor!.innerText = enhanced;
      editor!.dispatchEvent(new Event("input", { bubbles: true }));
      editor!.dispatchEvent(new Event("change", { bubbles: true }));
      editor!.focus();

      // Show success
      btn.innerHTML = `<span>✅</span><span>Enhanced!</span>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 2000);

      //   console.log("✅ Post enhanced!");
    } catch (err: any) {
      console.error("Enhancement error:", err);
      //   alert(`Error: ${err.message}`);
      btn.innerHTML = originalHTML;
    } finally {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  };

  return btn;
};

// Inject enhance btn between Schedule icon and Post btn
const injectEnhanceButton = () => {
  const editor = getLinkedInEditor();
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;

  if (!editor || !shadowRoot) {
    console.log("Editor or Shadow DOM not found");
    return;
  }

  // Check if button already exists
  if (shadowRoot.querySelector(`#${ENHANCE_BUTTON_ID}`)) {
    console.log("Button already exists");
    return;
  }

  // Find the Post button (it's usually type="submit" or has "Post" text)
  const postButton = Array.from(shadowRoot.querySelectorAll("button")).find(
    (btn) =>
      btn.getAttribute("type") === "submit" ||
      btn.innerText.trim() === "Post" ||
      btn.getAttribute("aria-label")?.includes("Post"),
  );

  if (!postButton) {
    console.log("Post button not found");
    return;
  }

  //   console.log("Post button found!");

  // Create and insert the enhance btn before the Post btn
  const enhanceBtn = createEnhanceButton();
  postButton.parentElement?.insertBefore(enhanceBtn, postButton);

  //   console.log("Enhance btn injected between Schedule and Post!");
};

// Watch Shadow DOM for changes
const watchShadowDOM = () => {
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;
  if (shadowRoot) {
    const observer = new MutationObserver(() => {
      injectEnhanceButton();
    });

    observer.observe(shadowRoot, {
      childList: true,
      subtree: true,
    });

    // console.log("Watching Shadow DOM for changes");
  }
};

// Main observer to detect when Shadow DOM appears
const mainObserver = new MutationObserver(() => {
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;
  if (shadowRoot) {
    injectEnhanceButton();
    watchShadowDOM();
  }
});

mainObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial check with delay
setTimeout(() => {
  const shadowRoot = document.querySelector("#interop-outlet")?.shadowRoot;
  if (shadowRoot) {
    injectEnhanceButton();
    watchShadowDOM();
  }
}, 1000);

console.log("LinkedIn Post Enhancer loaded 🚀");
