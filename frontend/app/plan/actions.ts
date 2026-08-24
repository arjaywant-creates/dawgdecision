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

  // Upsert the financial plan housing selection
  await prisma.plan.upsert({
    where: { userId: session.user.id },
    update: {
      comparisonId,
      selectedScenario,
    },
    create: {
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
 * Removes the user's active Financial Plan housing selection.
 * The underlying saved comparison is not touched.
 */
export async function removeFinancialPlanHousingAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.plan.delete({
      where: { userId: session.user.id },
    });
  } catch {
    // Ignore if not found
  }

  revalidatePath("/plan");
  revalidatePath("/comparisons");

  return { success: true };
}
