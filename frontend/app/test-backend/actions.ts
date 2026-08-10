"use server";

import { analyzeScenario, compareScenarios } from "@/lib/decision-engine";

export async function testAnalyzeAction(prevState: any, formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      monthly_income: Number(formData.get("monthly_income")),
      rent: Number(formData.get("rent")),
      utilities: Number(formData.get("utilities")),
      transportation: Number(formData.get("transportation")),
      other_expenses: Number(formData.get("other_expenses") || 0),
      mandatory_fees: Number(formData.get("mandatory_fees") || 0),
      lease_months: Number(formData.get("lease_months") || 12),
    };

    const result = await analyzeScenario(data);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testCompareAction(prevState: any, formData: FormData) {
  try {
    const scenarioA = {
      name: formData.get("a_name") as string,
      monthly_income: Number(formData.get("a_monthly_income")),
      rent: Number(formData.get("a_rent")),
      utilities: Number(formData.get("a_utilities")),
      transportation: Number(formData.get("a_transportation")),
      other_expenses: Number(formData.get("a_other_expenses") || 0),
      mandatory_fees: Number(formData.get("a_mandatory_fees") || 0),
      lease_months: Number(formData.get("a_lease_months") || 12),
    };

    const scenarioB = {
      name: formData.get("b_name") as string,
      monthly_income: Number(formData.get("b_monthly_income")),
      rent: Number(formData.get("b_rent")),
      utilities: Number(formData.get("b_utilities")),
      transportation: Number(formData.get("b_transportation")),
      other_expenses: Number(formData.get("b_other_expenses") || 0),
      mandatory_fees: Number(formData.get("b_mandatory_fees") || 0),
      lease_months: Number(formData.get("b_lease_months") || 12),
    };

    const result = await compareScenarios(scenarioA, scenarioB);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

