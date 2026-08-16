import { create } from "zustand";
import {
  persist,
  createJSONStorage,
} from "zustand/middleware";

import {
  CompareRequest,
  ComparisonResult,
} from "@/types/comparison";

interface CompareStore {
  formData: CompareRequest | null;
  results: ComparisonResult | null;
  comparisonId: string | null;

  setFormData: (
    data: CompareRequest,
  ) => void;

  setResults: (
    results: ComparisonResult | null,
  ) => void;

  setComparisonId: (
    id: string | null,
  ) => void;
}

export const useCompareStore =
  create<CompareStore>()(
    persist(
      (set) => ({
        formData: null,
        results: null,
        comparisonId: null,

        setFormData: (data) =>
          set({ formData: data }),

        setResults: (results) =>
          set({ results }),

        setComparisonId: (
          comparisonId,
        ) =>
          set({ comparisonId }),
      }),
      {
        name: "compare-storage",

        storage:
          createJSONStorage(
            () => sessionStorage,
          ),
      },
    ),
  );
