"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Creates a new Financial Plan from a saved comparison.
 *
 * @param comparisonId The saved comparison.
 * @param selectedScenario The chosen scenario ("A" or "B").
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
    where: {
      id: comparisonId,
    },
  });

  if (!comparison || comparison.userId !== session.user.id) {
    throw new Error("Comparison not found or unauthorized");
  }

  // Create a new Financial Plan
  await prisma.plan.create({
    data: {
      userId: session.user.id,
      comparisonId,
      selectedScenario,
    },
  });

  revalidatePath("/plan");
  revalidatePath("/dashboard");
  revalidatePath("/comparisons");

  return { success: true };
}

/**
 * Deletes a saved Financial Plan.
 * The underlying comparison remains intact.
 *
 * @param planId The Financial Plan to delete.
 */
export async function removeFinancialPlanHousingAction(planId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const plan = await prisma.plan.findUnique({
    where: {
      id: planId,
    },
  });

  if (!plan || plan.userId !== session.user.id) {
    throw new Error("Plan not found or unauthorized");
  }

  await prisma.plan.delete({
    where: {
      id: planId,
    },
  });

  revalidatePath("/plan");
  revalidatePath("/dashboard");
  revalidatePath("/comparisons");

  return { success: true };
}