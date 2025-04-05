"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ResultState = {
    imageData: string | null;
    content: string | null;
    setResult: (imageData: string, caption: string) => void;
    clear: () => void;
};

export const useResultStore = create<ResultState>()(
    persist(
        (set) => ({
            imageData: null,
            content: null,
            setResult: (imageData, content) => set({ imageData, content }),
            clear: () => set({ imageData: null, content: null }),
        }),
        {
            name: "result-storage", // localStorageに保存されるキー名
        }
    )
);
