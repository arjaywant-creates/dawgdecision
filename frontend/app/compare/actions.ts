"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { compareScenarios } from "@/lib/decision-engine";

import {
  Scenario,
  ComparisonResult,
  ComparisonResultSchema,
} from "@/types/comparison";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Compares two housing scenarios against the decision engine to calculate financial outcomes.
 * @param scenarioA The first scenario input data.
 * @param scenarioB The second scenario input data.
 * @returns An object containing success status and the ComparisonResult if successful.
 */
export async function compareScenariosAction(
  scenarioA: Scenario,
  scenarioB: Scenario,
) {
  try {
    const result = await compareScenarios(scenarioA, scenarioB);

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Saves a new comparison and its associated scenarios to the database for the authenticated user.
 * @param scenarioA The first scenario input data.
 * @param scenarioB The second scenario input data.
 * @param result The calculated results of the comparison.
 * @returns The saved Comparison object from the database or an error state.
 */
export async function saveComparisonAction(
  scenarioA: Scenario,
  scenarioB: Scenario,
  result: ComparisonResult,
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) return { success: false, error: "Unauthorized" };

    // Validate the result payload to prevent invalid JSON
    const safeResult = ComparisonResultSchema.parse(result);

    const savedComparison = await prisma.comparison.create({
      data: {
        user: { connect: { id: session.user.id } },
        resultSnapshot: safeResult,
        firstScenario: {
          create: {
            user: { connect: { id: session.user.id } },
            name: scenarioA.name,
            housingCost: scenarioA.housing_cost,
            costPeriodMonths: scenarioA.cost_period_months,
            contractMonths: scenarioA.contract_months,
            utilities: scenarioA.utilities,
            mandatoryFees: scenarioA.mandatory_fees,
            parking: scenarioA.parking,
            transportation: scenarioA.transportation,
            upfrontCosts: scenarioA.upfront_costs,
            commuteMinutes: scenarioA.commute_minutes,
          },
        },
        secondScenario: {
          create: {
            user: { connect: { id: session.user.id } },
            name: scenarioB.name,
            housingCost: scenarioB.housing_cost,
            costPeriodMonths: scenarioB.cost_period_months,
            contractMonths: scenarioB.contract_months,
            utilities: scenarioB.utilities,
            mandatoryFees: scenarioB.mandatory_fees,
            parking: scenarioB.parking,
            transportation: scenarioB.transportation,
            upfrontCosts: scenarioB.upfront_costs,
            commuteMinutes: scenarioB.commute_minutes,
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/comparisons");
    revalidatePath("/plan");
    revalidatePath("/dashboard");

    return { success: true, data: savedComparison };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred while saving. Please try again.",
    };
  }
}

/**
 * Deletes an existing comparison and its associated scenarios from the database.
 * @param comparisonId The unique identifier of the comparison to delete.
 * @returns Success status or an error message.
 */
export async function deleteComparisonAction(comparisonId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) return { success: false, error: "Unauthorized" };

    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId, userId: session.user.id },
      select: { firstScenarioId: true, secondScenarioId: true },
    });

    if (!comparison) return { success: false, error: "Comparison not found." };

    await prisma.$transaction([
      prisma.scenario.delete({ where: { id: comparison.firstScenarioId } }),
      prisma.scenario.delete({ where: { id: comparison.secondScenarioId } }),
    ]);

    revalidatePath("/");
    revalidatePath("/comparisons");
    revalidatePath("/plan");
    revalidatePath("/dashboard");
  

    return { success: true };
  } catch {
    return { success: false, error: "Unable to delete comparison." };
  }
}

/**
 * Updates an existing comparison and its scenarios in the database.
 * @param comparisonId The unique identifier of the comparison to update.
 * @param scenarioA The updated first scenario data.
 * @param scenarioB The updated second scenario data.
 * @param result The newly calculated comparison results.
 * @returns The updated Comparison object or an error message.
 */
export async function updateComparisonAction(
  comparisonId: string,
  scenarioA: Scenario,
  scenarioB: Scenario,
  result: ComparisonResult,
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) return { success: false, error: "Unauthorized" };

    const existingComparison = await prisma.comparison.findUnique({
      where: { id: comparisonId, userId: session.user.id },
    });

    if (!existingComparison)
      return { success: false, error: "Comparison not found." };

    await prisma.scenario.update({
      where: { id: existingComparison.firstScenarioId },
      data: {
        name: scenarioA.name,
        housingCost: scenarioA.housing_cost,
        costPeriodMonths: scenarioA.cost_period_months,
        contractMonths: scenarioA.contract_months,
        utilities: scenarioA.utilities,
        mandatoryFees: scenarioA.mandatory_fees,
        parking: scenarioA.parking,
        transportation: scenarioA.transportation,
        upfrontCosts: scenarioA.upfront_costs,
        commuteMinutes: scenarioA.commute_minutes,
      },
    });

    await prisma.scenario.update({
      where: { id: existingComparison.secondScenarioId },
      data: {
        name: scenarioB.name,
        housingCost: scenarioB.housing_cost,
        costPeriodMonths: scenarioB.cost_period_months,
        contractMonths: scenarioB.contract_months,
        utilities: scenarioB.utilities,
        mandatoryFees: scenarioB.mandatory_fees,
        parking: scenarioB.parking,
        transportation: scenarioB.transportation,
        upfrontCosts: scenarioB.upfront_costs,
        commuteMinutes: scenarioB.commute_minutes,
      },
    });

    // Validate the result payload to prevent invalid JSON
    const safeResult = ComparisonResultSchema.parse(result);

    const updatedComparison = await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        resultSnapshot: safeResult,
      },
    });

    revalidatePath("/");
    revalidatePath("/comparisons");

    return { success: true, data: updatedComparison };
  } catch {
    return { success: false, error: "Unable to update comparison." };
  }
}
