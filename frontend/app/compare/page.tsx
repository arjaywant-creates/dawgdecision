"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";

import ScenarioForm from "@/components/compare/ScenarioForm";
import ComparisonResults from "@/components/compare/ComparisonResults";

import {
  Scenario,
  ComparisonResult,
} from "@/types/comparison";

import { compareScenariosAction } from "./actions";

const initialScenario: Scenario = {
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
    useState<Scenario>({
      ...initialScenario,
    });

  const [scenarioB, setScenarioB] =
    useState<Scenario>({
      ...initialScenario,
    });

  const [results, setResults] =
    useState<ComparisonResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const updateScenarioA = (
    field: keyof Scenario,
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
    field: keyof Scenario,
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
    scenario: Scenario,
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

      const response = await compareScenariosAction(
        scenarioA,
        scenarioB
      );

      if (response.success) {
        setResults(response.data as ComparisonResult);
      } else {
        throw new Error(response.error);
      }
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

  const ErrorDisplay = () => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-900 border border-red-200 shadow-sm">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <p className="font-medium text-sm">{error}</p>
      </div>
    );
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

      <div className="mb-6">
        <ErrorDisplay />
      </div>

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

      <div className="mt-8 flex flex-col gap-4">
        <Button
          onPress={handleSubmit}
          isLoading={loading}
          color="primary"
          size="lg"
          className="font-semibold w-fit"
        >
          {loading
            ? "Comparing..."
            : "Compare Housing Options"}
        </Button>

        <ErrorDisplay />
      </div>

      {results && (
        <ComparisonResults
          results={results}
        />
      )}
    </div>
  );
}