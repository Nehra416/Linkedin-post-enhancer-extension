import React, { useEffect, useState } from "react";
import OpenAI from "openai";
import { getStoredApiKey, setStoredApiKey } from "./utils/storage";

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load key when popup opens
  useEffect(() => {
    getStoredApiKey()
      .then((key) => {
        if (key) setApiKey(key);
      })
      .catch((err) => {
        console.error("Failed to load API key:", err);
        setStatus("Error: Failed to load API key.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const onSave = async () => {
    if (!apiKey.trim().startsWith("sk-")) {
      setStatus("Error: Invalid OpenAI Key format");
      return;
    }

    try {
      await setStoredApiKey(apiKey.trim());
      setStatus("API Key Saved!");
      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      console.error("Failed to save API key:", error);
      setStatus("Error: Failed to save to storage.");
    }
  };

  const onTest = async () => {
    if (!apiKey) return setStatus("Error: Key is empty");
    setStatus("Testing...");
    try {
      const openai = new OpenAI({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true,
      });

      await openai.models.list();

      setStatus("Success: Key is valid.");
    } catch (error: any) {
      console.error("Failed to test API key:", error);
      setStatus(`Error: ${error.message || "Connection failed"}`);
    }
  };

  if (isLoading)
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Loading...
      </div>
    );

  return (
    <div className="w-80 p-5 bg-white shadow-xl flex flex-col gap-5 font-sans border border-gray-100">
      <header>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-400 bg-clip-text text-transparent">
          LinkedIn Post Enhancer
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Make your posts stand out with AI
        </p>
      </header>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          OpenAI API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm transition focus:ring-2 focus:ring-zinc-500 focus:bg-white outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm transition active:scale-95"
        >
          Save
        </button>
        <button
          onClick={onTest}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-bold transition active:scale-95"
        >
          Verify
        </button>
      </div>

      {status && (
        <div
          className={`p-3 rounded-lg text-xs font-medium text-center border ${
            status.toLowerCase().includes("error")
              ? "bg-red-50 text-red-600 border-red-100"
              : "bg-green-50 text-green-600 border-green-100"
          }`}
        >
          {status}
        </div>
      )}

      <footer className="text-[10px] text-center text-gray-400">
        MVP v1.0 • By: Nehra
      </footer>
    </div>
  );
};

export default App;
