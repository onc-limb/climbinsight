"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ResultState = {
  imageUrl: string | null;
  session: string | null;
  setResult: (imageUrl: string, session: string) => void;
  clear: () => void;
};

export const useResultStore = create<ResultState>()(
  persist(
    (set) => ({
      imageUrl: null,
      session: null,
      setResult: (imageUrl, session) => set({ imageUrl, session }),
      clear: () => set({ imageUrl: null, session: null }),
    }),
    {
      name: "result-storage", // localStorageに保存されるキー名
    }
  )
);
