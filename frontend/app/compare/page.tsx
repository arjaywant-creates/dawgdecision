"use client";

import { useState } from "react";

import ScenarioForm from "@/components/compare/ScenarioForm";
import ComparisonResults from "@/components/compare/ComparisonResults";

import {
  HousingScenario,
  ComparisonResult,
} from "@/types/comparison";

import { compareScenarios } from "@/lib/decision-engine";

const initialScenario: HousingScenario = {
  name: "",
  monthly_income: 0,
  rent: 0,
  utilities: 0,
  transportation: 0,
  mandatory_fees: 0,
  other_expenses: 0,
  lease_months: 12,
};

export default function ComparePage() {
  const [scenarioA, setScenarioA] =
    useState<HousingScenario>({
      ...initialScenario,
    });

  const [scenarioB, setScenarioB] =
    useState<HousingScenario>({
      ...initialScenario,
    });

  const [results, setResults] =
    useState<ComparisonResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const updateScenarioA = (
    field: keyof HousingScenario,
    value: string | number
  ) => {
    setScenarioA((prev) => {
      const next = { ...prev };

      if (field === "name") {
        next.name = String(value);
      } else if (field === "monthly_income") {
        next.monthly_income = Number(value);
      } else if (field === "rent") {
        next.rent = Number(value);
      } else if (field === "utilities") {
        next.utilities = Number(value);
      } else if (field === "transportation") {
        next.transportation = Number(value);
      } else if (field === "mandatory_fees") {
        next.mandatory_fees = Number(value);
      } else if (field === "other_expenses") {
        next.other_expenses = Number(value);
      } else if (field === "lease_months") {
        next.lease_months = Number(value);
      }

      return next;
    });
  };

  const updateScenarioB = (
    field: keyof HousingScenario,
    value: string | number
  ) => {
    setScenarioB((prev) => {
      const next = { ...prev };

      if (field === "name") {
        next.name = String(value);
      } else if (field === "monthly_income") {
        next.monthly_income = Number(value);
      } else if (field === "rent") {
        next.rent = Number(value);
      } else if (field === "utilities") {
        next.utilities = Number(value);
      } else if (field === "transportation") {
        next.transportation = Number(value);
      } else if (field === "mandatory_fees") {
        next.mandatory_fees = Number(value);
      } else if (field === "other_expenses") {
        next.other_expenses = Number(value);
      } else if (field === "lease_months") {
        next.lease_months = Number(value);
      }

      return next;
    });
  };

  const validateScenario = (
    scenario: HousingScenario,
    label: string
  ): string | null => {
    if (!scenario.name.trim()) {
      return `${label} requires a scenario name.`;
    }

    if (scenario.lease_months <= 0) {
      return `${label} lease duration must be greater than 0.`;
    }

    const values = [
      scenario.monthly_income,
      scenario.rent,
      scenario.utilities,
      scenario.transportation,
      scenario.mandatory_fees,
      scenario.other_expenses,
    ];

    if (values.some((value) => value < 0)) {
      return `${label} contains invalid values.`;
    }

    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setResults(null);

    const errorA = validateScenario(
      scenarioA,
      "Scenario A"
    );

    if (errorA) {
      setError(errorA);
      return;
    }

    const errorB = validateScenario(
      scenarioB,
      "Scenario B"
    );

    if (errorB) {
      setError(errorB);
      return;
    }

    try {
      setLoading(true);

      const backendScenarioA = {
        name: scenarioA.name,
        monthly_income:
          scenarioA.monthly_income,
        rent: scenarioA.rent,
        utilities: scenarioA.utilities,
        transportation:
          scenarioA.transportation,
        other_expenses:
          scenarioA.other_expenses +
          scenarioA.mandatory_fees,
      };

      const backendScenarioB = {
        name: scenarioB.name,
        monthly_income:
          scenarioB.monthly_income,
        rent: scenarioB.rent,
        utilities: scenarioB.utilities,
        transportation:
          scenarioB.transportation,
        other_expenses:
          scenarioB.other_expenses +
          scenarioB.mandatory_fees,
      };

      const response = await compareScenarios(
        backendScenarioA,
        backendScenarioB
      );

      setResults(response as ComparisonResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to compare scenarios."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Housing Comparison
        </h1>

        <p className="mt-2 text-default-500">
          Compare two housing options and
          understand their financial tradeoffs.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ScenarioForm
          title="Scenario A"
          data={scenarioA}
          onChange={updateScenarioA}
        />

        <ScenarioForm
          title="Scenario B"
          data={scenarioB}
          onChange={updateScenarioB}
        />
      </div>

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Comparing..."
            : "Compare Housing Options"}
        </button>
      </div>

      {results && (
        <ComparisonResults
          results={results}
        />
      )}
    </div>
  );
}