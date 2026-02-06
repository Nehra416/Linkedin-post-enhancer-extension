import React, { useEffect, useState } from "react";
import { IconLoader2, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { getStoredApiKey, setStoredApiKey } from "./utils/storage";
import { verifyApiKey } from "./utils/openai";

type ButtonState = "idle" | "loading" | "success" | "error";

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveState, setSaveState] = useState<ButtonState>("idle");
  const [verifyState, setVerifyState] = useState<ButtonState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStoredApiKey()
      .then((key) => {
        if (key) setApiKey(key);
      })
      .catch(() => {
        setError("Failed to load saved API key");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const validateKey = (key: string): string | null => {
    if (!key.trim()) return "Please enter an API key";
    if (!key.trim().startsWith("sk-"))
      return "Invalid API key format. Must start with 'sk-'";
    if (key.trim().length < 20) return "API key seems too short";
    return null;
  };

  const handleSave = async () => {
    setError(null);
    const validationError = validateKey(apiKey);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaveState("loading");

    try {
      await setStoredApiKey(apiKey.trim());
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      setError("Failed to save API key");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  };

  const handleVerify = async () => {
    setError(null);
    const validationError = validateKey(apiKey);
    if (validationError) {
      setError(validationError);
      return;
    }

    setVerifyState("loading");

    try {
      const result = await verifyApiKey(apiKey.trim());

      if (result.ok) {
        setVerifyState("success");
        setTimeout(() => setVerifyState("idle"), 3000);
      } else {
        throw new Error(result.error || "Invalid response");
      }
    } catch (err) {
      setVerifyState("error");
      const message =
        err instanceof Error ? err.message : "Verification failed";
      if (message.includes("401")) {
        setError("Invalid API key");
      } else if (message.includes("429")) {
        setError("Rate limit reached. Try again later.");
      } else if (message.includes("fetch")) {
        setError("Network error. Check your connection.");
      } else {
        setError(message);
      }
      setTimeout(() => setVerifyState("idle"), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 p-6 bg-white flex items-center justify-center">
        <IconLoader2 className="w-5 h-5 text-neutral-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-80 p-5 bg-white flex flex-col gap-5">
      {/* Header - No Icon */}
      <header>
        <h1 className="text-xl font-bold text-neutral-900 mb-1">
          LinkedIn Post Enhancer
        </h1>
        <p className="text-sm text-neutral-500">
          Make your posts stand out with AI
        </p>
      </header>

      {/* API Key Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
          OpenAI API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setError(null);
          }}
          placeholder="sk-..."
          className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/30 focus:border-[#0a66c2] transition-all"
        />
        <p className="text-xs text-neutral-500">
          Your key is stored locally and never sent to any server.
        </p>
      </div>

      {/* Dual Buttons */}
      <div className="flex gap-3">
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saveState === "loading" || saveState === "success"}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            saveState === "success"
              ? "bg-green-600 text-white"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          } disabled:opacity-90`}
        >
          {saveState === "loading" && (
            <IconLoader2 className="w-4 h-4 animate-spin" />
          )}
          {saveState === "success" && <IconCheck className="w-4 h-4" />}
          <span>
            {saveState === "loading"
              ? "Saving..."
              : saveState === "success"
                ? "Saved"
                : "Save"}
          </span>
        </button>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={verifyState === "loading" || verifyState === "success"}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            verifyState === "success"
              ? "bg-green-600 text-white"
              : verifyState === "error"
                ? "bg-red-600 text-white"
                : "bg-neutral-600 text-white hover:bg-neutral-500"
          } disabled:opacity-90`}
        >
          {verifyState === "loading" && (
            <IconLoader2 className="w-4 h-4 animate-spin" />
          )}
          {verifyState === "success" && <IconCheck className="w-4 h-4" />}
          <span>
            {verifyState === "loading"
              ? "Verifying..."
              : verifyState === "success"
                ? "Verified"
                : verifyState === "error"
                  ? "Failed"
                  : "Verify"}
          </span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2">
          <IconAlertTriangle className="w-4 h-4 text-red-800 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="text-xs text-center text-neutral-400">
        MVP v1.0 • By: Nehra
      </footer>
    </div>
  );
};

export default App;
