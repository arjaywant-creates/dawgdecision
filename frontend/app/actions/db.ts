"use server";

import { prisma } from "@/lib/db";
import { Scenario as APIScenario, DecisionResult, ComparisonResult } from "@/types/comparison";

export async function saveScenarioAction(scenario: APIScenario, result: DecisionResult, userId?: string, planId?: string) {
  try {
    const savedScenario = await prisma.scenario.create({
      data: {
        userId,
        planId,
        name: scenario.name,
        monthlyIncome: scenario.monthly_income,
        rent: scenario.rent,
        utilities: scenario.utilities,
        transportation: scenario.transportation,
        mandatoryFees: scenario.mandatory_fees || 0,
        otherExpenses: scenario.other_expenses || 0,
        leaseMonths: scenario.lease_months || 12,
        
        monthlyExpenses: result.monthly_expenses,
        leaseExpenses: result.lease_expenses,
        monthlySurplus: result.monthly_surplus,
        leaseSurplus: result.lease_surplus,
      }
    });
    return { success: true, data: savedScenario };
  } catch (error: any) {
    console.error("Error saving scenario:", error);
    return { success: false, error: error.message };
  }
}

export async function saveComparisonAction(
  scenarioA: APIScenario, 
  resultA: DecisionResult, 
  scenarioB: APIScenario, 
  resultB: DecisionResult, 
  comparisonResult: ComparisonResult,
  userId?: string
) {
  try {
    // 1. Save both scenarios first
    const savedA = await prisma.scenario.create({
      data: {
        userId,
        name: scenarioA.name,
        monthlyIncome: scenarioA.monthly_income,
        rent: scenarioA.rent,
        utilities: scenarioA.utilities,
        transportation: scenarioA.transportation,
        mandatoryFees: scenarioA.mandatory_fees || 0,
        otherExpenses: scenarioA.other_expenses || 0,
        leaseMonths: scenarioA.lease_months || 12,
        
        monthlyExpenses: resultA.monthly_expenses,
        leaseExpenses: resultA.lease_expenses,
        monthlySurplus: resultA.monthly_surplus,
        leaseSurplus: resultA.lease_surplus,
      }
    });

    const savedB = await prisma.scenario.create({
      data: {
        userId,
        name: scenarioB.name,
        monthlyIncome: scenarioB.monthly_income,
        rent: scenarioB.rent,
        utilities: scenarioB.utilities,
        transportation: scenarioB.transportation,
        mandatoryFees: scenarioB.mandatory_fees || 0,
        otherExpenses: scenarioB.other_expenses || 0,
        leaseMonths: scenarioB.lease_months || 12,
        
        monthlyExpenses: resultB.monthly_expenses,
        leaseExpenses: resultB.lease_expenses,
        monthlySurplus: resultB.monthly_surplus,
        leaseSurplus: resultB.lease_surplus,
      }
    });

    // 2. Save the comparison
    const savedComparison = await prisma.comparison.create({
      data: {
        userId,
        firstScenarioId: savedA.id,
        secondScenarioId: savedB.id,
        lowerMonthlyCostScenario: comparisonResult.lower_monthly_cost_scenario,
        monthlyDifference: comparisonResult.monthly_difference,
      }
    });

    return { success: true, data: savedComparison };
  } catch (error: any) {
    console.error("Error saving comparison:", error);
    return { success: false, error: error.message };
  }
}

export async function getComparisonAction(comparisonId: string) {
  try {
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
      include: {
        firstScenario: true,
        secondScenario: true,
      }
    });
    
    if (!comparison) {
      return { success: false, error: "Comparison not found" };
    }
    
    return { success: true, data: comparison };
  } catch (error: any) {
    console.error("Error retrieving comparison:", error);
    return { success: false, error: error.message };
  }
}
