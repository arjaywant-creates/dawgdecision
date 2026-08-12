/**
 * Helper library to communicate with the Python FastAPI backend
 */

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

import {
  Scenario,
  DecisionResult,
  ComparisonResult,
} from "@/types/comparison";

/**
 * Call the Python backend to analyze a single scenario
 */
export async function analyzeScenario(scenario: Scenario): Promise<DecisionResult> {
  const response = await fetch(`${PYTHON_API_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scenario),
  });

  if (!response.ok) {
    throw new Error(`Python API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Call the Python backend to compare two scenarios
 */
export async function compareScenarios(scenarioA: Scenario, scenarioB: Scenario): Promise<ComparisonResult> {
  const response = await fetch(`${PYTHON_API_URL}/api/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scenario_a: scenarioA,
      scenario_b: scenarioB,
    }),
  });

  if (!response.ok) {
    throw new Error(`Python API Error: ${response.statusText}`);
  }

  return response.json();
}
