import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { CompareRequest } from "@/types/comparison";

interface CompareStore {
  formData: CompareRequest | null;
  setFormData: (data: CompareRequest) => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set) => ({
      formData: null,
      setFormData: (data) => set({ formData: data }),
    }),
    {
      name: "compare-storage",
      // using sessionStorage ensures data is cleared when the tab closes,
      // but persists across navigations and reloads.
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
