import { create } from "zustand";
import type { Tone } from "../utils/openai";

interface AdvancedInputs {
  whoAreYou: string;
  motive: string;
  context: string;
}

interface AppState {
  // Text content
  scrapedText: string;
  enhancedText: string;

  // Enhancement settings
  selectedTone: Tone;

  // Hooks
  hooks: string[];
  isGeneratingHooks: boolean;

  // Advanced mode
  advancedInputs: AdvancedInputs;
  advancedResult: string;

  // UI state
  activeTab: "enhance" | "hooks" | "advanced";
  isEnhancing: boolean;
  error: string | null;

  // Session
  sourceTabId: number | null;
  apiKey: string | null;

  // Actions
  setScrapedText: (text: string) => void;
  setEnhancedText: (text: string) => void;
  setSelectedTone: (tone: Tone) => void;
  setHooks: (hooks: string[]) => void;
  addHooks: (hooks: string[]) => void;
  clearHooks: () => void;
  setIsGeneratingHooks: (val: boolean) => void;
  setAdvancedInputs: (inputs: Partial<AdvancedInputs>) => void;
  setAdvancedResult: (result: string) => void;
  setActiveTab: (tab: "enhance" | "hooks" | "advanced") => void;
  setIsEnhancing: (val: boolean) => void;
  setError: (error: string | null) => void;
  setSourceTabId: (tabId: number | null) => void;
  setApiKey: (key: string | null) => void;
  reset: () => void;
}

const initialState = {
  scrapedText: "",
  enhancedText: "",
  selectedTone: "default" as Tone,
  hooks: [] as string[],
  isGeneratingHooks: false,
  advancedInputs: {
    whoAreYou: "",
    motive: "",
    context: "",
  },
  advancedResult: "",
  activeTab: "enhance" as const,
  isEnhancing: false,
  error: null as string | null,
  sourceTabId: null as number | null,
  apiKey: null as string | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setScrapedText: (text) => set({ scrapedText: text }),
  setEnhancedText: (text) => set({ enhancedText: text }),
  setSelectedTone: (tone) => set({ selectedTone: tone }),
  setHooks: (hooks) => set({ hooks }),
  addHooks: (newHooks) =>
    set((state) => ({ hooks: [...state.hooks, ...newHooks] })),
  clearHooks: () => set({ hooks: [] }),
  setIsGeneratingHooks: (val) => set({ isGeneratingHooks: val }),
  setAdvancedInputs: (inputs) =>
    set((state) => ({
      advancedInputs: { ...state.advancedInputs, ...inputs },
    })),
  setAdvancedResult: (result) => set({ advancedResult: result }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsEnhancing: (val) => set({ isEnhancing: val }),
  setError: (error) => set({ error }),
  setSourceTabId: (tabId) => set({ sourceTabId: tabId }),
  setApiKey: (key) => set({ apiKey: key }),
  reset: () =>
    set({
      ...initialState,
      activeTab: "enhance",
    }),
}));
