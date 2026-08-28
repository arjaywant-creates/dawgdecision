/**
 * Helper library to communicate with the Python FastAPI backend
 */

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

import {
  Scenario,
  DecisionResult,
  ComparisonResult,
  DecisionImpactResult,
} from "@/types/comparison";

import {
  HousingSourcesResponse,
  SourcedHousingOption,
  HousingSourcesResponseSchema,
  SourcedHousingOptionSchema,
} from "@/types/sourced-housing";

/**
 * Call the Python backend to analyze a single scenario
 */
export async function analyzeScenario(
  scenario: Scenario,
): Promise<DecisionResult> {
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
export async function compareScenarios(
  scenarioA: Scenario,
  scenarioB: Scenario,
): Promise<ComparisonResult> {
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

/**
 * Call the Python backend to calculate decision impact
 */
export async function analyzeDecisionImpact(
  scenarioA: Scenario,
  scenarioB: Scenario,
  selectedScenario: string,
): Promise<DecisionImpactResult> {
  const response = await fetch(`${PYTHON_API_URL}/api/analyze-impact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scenario_a: scenarioA,
      scenario_b: scenarioB,
      selected_scenario: selectedScenario,
    }),
  });

  if (!response.ok) {
    throw new Error(`Python API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch sourced housing options
 */
export async function getHousingSources(): Promise<HousingSourcesResponse> {
  const response = await fetch(`${PYTHON_API_URL}/api/housing-sources`);

  if (!response.ok) {
    throw new Error(`Python API Error: ${response.statusText}`);
  }
  const data = await response.json();

  return HousingSourcesResponseSchema.parse(data);
}

/**
 * Fetch single sourced housing option
 */
export async function getHousingSourceById(
  id: string,
): Promise<SourcedHousingOption> {
  const response = await fetch(`${PYTHON_API_URL}/api/housing-sources/${id}`);

  if (!response.ok) {
    throw new Error(`Python API Error: ${response.statusText}`);
  }
  const data = await response.json();

  return SourcedHousingOptionSchema.parse(data);
}
