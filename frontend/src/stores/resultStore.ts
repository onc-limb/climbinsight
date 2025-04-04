"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ResultState = {
    imageData: string | null;
    caption: string | null;
    setResult: (imageData: string, caption: string) => void;
    clear: () => void;
};

export const useResultStore = create<ResultState>()(
    persist(
        (set) => ({
            imageData: null,
            caption: null,
            setResult: (imageData, caption) => set({ imageData, caption }),
            clear: () => set({ imageData: null, caption: null }),
        }),
        {
            name: "result-storage", // localStorageに保存されるキー名
        }
    )
);
