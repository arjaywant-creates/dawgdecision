"use client";

import { useState } from "react";
import NextLink from "next/link";

import { ArrowLeft } from "lucide-react";
import { Button, Card } from "@heroui/react";

import { FinancialPlanActions } from "./FinancialPlanActions";

interface ScenarioView {
  name: string;
  contractMonths: number;
  monthlyCost: number;
  upfrontCost: number | null;
  termCost: number;
  termCostComplete: boolean;

  monthlyDelta: number | null;
  upfrontDelta: number | null;
  termDelta: number | null;
}

interface Props {
  planId: string;
  comparisonId: string;
  savedScenario: "A" | "B";
  savedAt: string;

  scenarioA: ScenarioView;
  scenarioB: ScenarioView;
}

export function FinancialPlanDetailClient({
  planId,
  comparisonId,
  savedScenario,
  savedAt,
  scenarioA,
  scenarioB,
}: Props) {
  // This is VIEW STATE ONLY.
  // It never changes the Financial Plan stored in the database.
  const [viewingScenario, setViewingScenario] = useState<"A" | "B">(
    savedScenario,
  );

  const selected = viewingScenario === "A" ? scenarioA : scenarioB;

  const hasNoImpactData =
    selected.monthlyDelta === null &&
    selected.upfrontDelta === null &&
    selected.termDelta === null;

  return (
    <div className="pb-12 space-y-8">
      <div>
        <div className="mb-4">
          <NextLink href="/plan">
            <Button variant="tertiary">
              <ArrowLeft className="size-4 mr-1" />
              Back to Plans
            </Button>
          </NextLink>
        </div>

        <h1 className="text-4xl font-bold">{selected.name}</h1>

        <p className="text-default-500 mt-2">
          Saved on {new Date(savedAt).toLocaleDateString()}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Housing Summary</h2>

        <div className="space-y-2">
          <p>
            <strong>Monthly Cost:</strong> $
            {selected.monthlyCost.toLocaleString()}
          </p>

          <p>
            <strong>Upfront Cost:</strong>{" "}
            {selected.upfrontCost !== null
              ? `$${selected.upfrontCost.toLocaleString()}`
              : "Unknown"}
          </p>

          <p>
            <strong>Full-Term Cost:</strong>{" "}
            {selected.termCostComplete
              ? `$${selected.termCost.toLocaleString()}`
              : "Unknown"}
          </p>

          <p>
            <strong>Contract Length:</strong> {selected.contractMonths} months
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Decision Impact</h2>

        {hasNoImpactData ? (
          <p className="text-default-500">
            Not enough data to calculate decision impact. Please complete the
            financial details for both scenarios.
          </p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {selected.monthlyDelta !== null && (
              <li>
                Monthly difference: $
                {Math.abs(selected.monthlyDelta).toLocaleString()}
              </li>
            )}

            {selected.upfrontDelta !== null && (
              <li>
                Upfront difference: $
                {Math.abs(selected.upfrontDelta).toLocaleString()}
              </li>
            )}

            {selected.termDelta !== null && (
              <li>
                Full-term difference: $
                {Math.abs(selected.termDelta).toLocaleString()}
              </li>
            )}
          </ul>
        )}
      </Card>

      <FinancialPlanActions
        comparisonId={comparisonId}
        planId={planId}
        scenarioAName={scenarioA.name}
        scenarioBName={scenarioB.name}
        viewingScenario={viewingScenario}
        onSwitch={setViewingScenario}
      />
    </div>
  );
}
