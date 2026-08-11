import {
  ComparisonRequest,
  ComparisonResult,
} from "@/types/comparison";

export async function compareHousing(
  data: ComparisonRequest
): Promise<ComparisonResult> {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to compare scenarios");
  }

  return response.json();
}