"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function deleteComparisonAction(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const comparison = await prisma.comparison.findUnique({
      where: { id, userId: session.user.id },
      select: { firstScenarioId: true, secondScenarioId: true },
    });

    if (!comparison) {
      return { success: false, error: "Comparison not found" };
    }

    // Delete the connected scenarios explicitly.
    // Because of onDelete: Cascade in the Prisma schema, deleting the
    // scenarios will automatically cascade and delete the Comparison record too.
    await prisma.$transaction([
      prisma.scenario.delete({ where: { id: comparison.firstScenarioId } }),
      prisma.scenario.delete({ where: { id: comparison.secondScenarioId } }),
    ]);

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Delete comparison error:", error);

    return { success: false, error: "Failed to delete comparison" };
  }
}
