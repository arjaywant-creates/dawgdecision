import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { CompareRequest, ComparisonResult } from "@/types/comparison";

interface CompareStore {
  formData: CompareRequest | null;
  results: ComparisonResult | null;
  selectedHousingIdA: string;
  selectedHousingIdB: string;

  setFormData: (data: CompareRequest) => void;
  setResults: (results: ComparisonResult | null) => void;
  setSelectedHousingIdA: (id: string) => void;
  setSelectedHousingIdB: (id: string) => void;
  clearStore: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set) => ({
      formData: null,
      results: null,
      selectedHousingIdA: "",
      selectedHousingIdB: "",

      setFormData: (data) => set({ formData: data }),
      setResults: (results) => set({ results }),
      setSelectedHousingIdA: (id) => set({ selectedHousingIdA: id }),
      setSelectedHousingIdB: (id) => set({ selectedHousingIdB: id }),
      clearStore: () =>
        set({
          formData: null,
          results: null,
          selectedHousingIdA: "",
          selectedHousingIdB: "",
        }),
    }),
    {
      name: "compare-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
