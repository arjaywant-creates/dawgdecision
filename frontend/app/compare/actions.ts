"use server";

import { compareScenarios } from "@/lib/decision-engine";
import { Scenario } from "@/types/comparison";

export async function compareScenariosAction(scenarioA: Scenario, scenarioB: Scenario) {
  try {
    const result = await compareScenarios(scenarioA, scenarioB);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
