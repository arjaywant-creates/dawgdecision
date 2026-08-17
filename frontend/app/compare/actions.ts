"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { compareScenarios } from "@/lib/decision-engine";
import { Scenario, ComparisonResult } from "@/types/comparison";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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

export async function saveComparisonAction(
  scenarioA: Scenario,
  scenarioB: Scenario,
  result: ComparisonResult,
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) return { success: false, error: "Unauthorized" };

    const savedComparison = await prisma.comparison.create({
      data: {
        user: { connect: { id: session.user.id } },
        lowerMonthlyCostScenario: result.lower_monthly_cost_scenario,
        monthlyDifference: result.monthly_difference,
        firstScenario: {
          create: {
            user: { connect: { id: session.user.id } },
            name: scenarioA.name,
            monthlyIncome: scenarioA.monthly_income,
            rent: scenarioA.rent,
            utilities: scenarioA.utilities,
            transportation: scenarioA.transportation,
            mandatoryFees: scenarioA.mandatory_fees || 0,
            otherExpenses: scenarioA.other_expenses || 0,
            leaseMonths: scenarioA.lease_months || 12,
            monthlyExpenses: result.first_result.monthly_expenses,
            leaseExpenses: result.first_result.lease_expenses,
            monthlySurplus: result.first_result.monthly_surplus,
            leaseSurplus: result.first_result.lease_surplus,
          },
        },
        secondScenario: {
          create: {
            user: { connect: { id: session.user.id } },
            name: scenarioB.name,
            monthlyIncome: scenarioB.monthly_income,
            rent: scenarioB.rent,
            utilities: scenarioB.utilities,
            transportation: scenarioB.transportation,
            mandatoryFees: scenarioB.mandatory_fees || 0,
            otherExpenses: scenarioB.other_expenses || 0,
            leaseMonths: scenarioB.lease_months || 12,
            monthlyExpenses: result.second_result.monthly_expenses,
            leaseExpenses: result.second_result.lease_expenses,
            monthlySurplus: result.second_result.monthly_surplus,
            leaseSurplus: result.second_result.lease_surplus,
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/comparisons");

    return { success: true, data: savedComparison };
  } catch (error) {
    console.error("Save Comparison Error:", error);

    return {
      success: false,
      error: "An unexpected error occurred while saving. Please try again.",
    };
  }
}

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

    return { success: true };
  } catch (error) {
    console.error("Delete Comparison Error:", error);

    return { success: false, error: "Unable to delete comparison." };
  }
}

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
        monthlyIncome: scenarioA.monthly_income,
        rent: scenarioA.rent,
        utilities: scenarioA.utilities,
        transportation: scenarioA.transportation,
        mandatoryFees: scenarioA.mandatory_fees || 0,
        otherExpenses: scenarioA.other_expenses || 0,
        leaseMonths: scenarioA.lease_months || 12,
        monthlyExpenses: result.first_result.monthly_expenses,
        leaseExpenses: result.first_result.lease_expenses,
        monthlySurplus: result.first_result.monthly_surplus,
        leaseSurplus: result.first_result.lease_surplus,
      },
    });

    await prisma.scenario.update({
      where: { id: existingComparison.secondScenarioId },
      data: {
        name: scenarioB.name,
        monthlyIncome: scenarioB.monthly_income,
        rent: scenarioB.rent,
        utilities: scenarioB.utilities,
        transportation: scenarioB.transportation,
        mandatoryFees: scenarioB.mandatory_fees || 0,
        otherExpenses: scenarioB.other_expenses || 0,
        leaseMonths: scenarioB.lease_months || 12,
        monthlyExpenses: result.second_result.monthly_expenses,
        leaseExpenses: result.second_result.lease_expenses,
        monthlySurplus: result.second_result.monthly_surplus,
        leaseSurplus: result.second_result.lease_surplus,
      },
    });

    const updatedComparison = await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        lowerMonthlyCostScenario: result.lower_monthly_cost_scenario,
        monthlyDifference: result.monthly_difference,
      },
    });

    revalidatePath("/");
    revalidatePath("/comparisons");

    return { success: true, data: updatedComparison };
  } catch (error) {
    console.error("Update Comparison Error:", error);

    return { success: false, error: "Unable to update comparison." };
  }
}
