"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Sets or updates the user's Financial Plan housing selection.
 * Ensures that only one housing selection is active per user via an upsert.
 *
 * @param comparisonId The ID of the saved comparison being selected.
 * @param selectedScenario "A" or "B" depending on the user's choice.
 */
export async function setFinancialPlanHousingAction(
  comparisonId: string,
  selectedScenario: "A" | "B",
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership of the comparison
  const comparison = await prisma.comparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison || comparison.userId !== session.user.id) {
    throw new Error("Comparison not found or unauthorized");
  }

  // Create a new financial plan
  await prisma.plan.create({
    data: {
      userId: session.user.id,
      comparisonId,
      selectedScenario,
    },
  });

  revalidatePath("/plan");
  revalidatePath("/comparisons");

  return { success: true };
}

/**
 * Removes a specific Financial Plan.
 * The underlying saved comparison is not touched.
 */
export async function deleteFinancialPlanAction(planId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.plan.delete({
      where: { id: planId, userId: session.user.id },
    });
  } catch {
    return { success: false, error: "Failed to delete plan." };
  }

  revalidatePath("/plan");
  revalidatePath("/comparisons");

  return { success: true };
}

