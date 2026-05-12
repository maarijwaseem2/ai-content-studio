import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GeneratedContent, GenerateInput } from "./mockGenerator";
import api from "./api";

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

interface User {
  id: string;
  email: string;
  credits: number;
  role: "USER" | "ADMIN";
  subscriptionStatus: "FREE" | "ACTIVE" | "EXPIRED";
  subscriptionTier: string | null;
}

interface State {
  user: User | null;
  items: SavedItem[];
  credits: number;
  setUser: (user: User | null) => void;
  addItem: (item: Omit<SavedItem, "id" | "createdAt">) => string;
  setItems: (items: SavedItem[]) => void;
  updateItem: (id: string, patch: Partial<SavedItem>) => void;
  deleteItem: (id: string) => void;
  toggleSave: (id: string) => void;
  decrementCredits: () => void;
  logout: () => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      items: [],
      credits: 0,
      setUser: (user) => set({ user, credits: user?.credits || 0 }),
      setItems: (items) => set({ items }),
      addItem: (item) => {
        const id = crypto.randomUUID();
        set((s) => ({
          items: [{ ...item, id, createdAt: Date.now() }, ...s.items],
        }));
        return id;
      },
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      deleteItem: (id) =>
        set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      toggleSave: (id) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, saved: !it.saved } : it,
          ),
        })),
      decrementCredits: () =>
        set((s) => ({ credits: Math.max(0, s.credits - 1) })),
      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null, items: [], credits: 0 });
      },
    }),
    { name: "lexicon-store" },
  ),
);
