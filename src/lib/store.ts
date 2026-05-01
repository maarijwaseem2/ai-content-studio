import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GeneratedContent, GenerateInput } from "./mockGenerator";

export interface SavedItem {
  id: string;
  productName: string;
  category: string;
  tone: string;
  language: string;
  createdAt: number;
  input: GenerateInput;
  content: GeneratedContent;
  saved: boolean;
}

interface State {
  items: SavedItem[];
  credits: number;
  addItem: (item: Omit<SavedItem, "id" | "createdAt">) => string;
  updateItem: (id: string, patch: Partial<SavedItem>) => void;
  deleteItem: (id: string) => void;
  toggleSave: (id: string) => void;
  decrementCredits: () => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      credits: 250,
      addItem: (item) => {
        const id = crypto.randomUUID();
        set((s) => ({ items: [{ ...item, id, createdAt: Date.now() }, ...s.items] }));
        return id;
      },
      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
      deleteItem: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      toggleSave: (id) =>
        set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, saved: !it.saved } : it)) })),
      decrementCredits: () => set((s) => ({ credits: Math.max(0, s.credits - 1) })),
    }),
    { name: "lexicon-store" }
  )
);
