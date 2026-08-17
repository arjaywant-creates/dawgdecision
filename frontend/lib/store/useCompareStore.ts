import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { CompareRequest, ComparisonResult } from "@/types/comparison";

interface CompareStore {
  formData: CompareRequest | null;
  results: ComparisonResult | null;

  setFormData: (data: CompareRequest) => void;
  setResults: (results: ComparisonResult | null) => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set) => ({
      formData: null,
      results: null,

      setFormData: (data) => set({ formData: data }),
      setResults: (results) => set({ results }),
    }),
    {
      name: "compare-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
