"use client";

import { useState } from "react";
import NextLink from "next/link";

import { Home, TrendingUp } from "lucide-react";
import { Breadcrumbs, Card } from "@heroui/react";

import { FinancialPlanActions } from "./FinancialPlanActions";

import { diffStr, formatCurrency } from "@/lib/formatters";

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
        <div className="w-full overflow-x-auto whitespace-nowrap pb-1 -mb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Breadcrumbs className="mb-4">
            <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
            <Breadcrumbs.Item href="/plan">Saved Plans</Breadcrumbs.Item>
            <Breadcrumbs.Item>{selected.name}</Breadcrumbs.Item>
          </Breadcrumbs>
        </div>

        <h1 className="text-4xl font-bold">{selected.name}</h1>

        <p className="text-default-500 mt-2 font-medium text-sm">
          Saved on {new Date(savedAt).toLocaleDateString()}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Home className="size-5 text-primary" />
          <h2 className="text-xl font-bold">Housing Summary</h2>
        </div>

        <div className="space-y-3 text-default-700">
          <div className="flex items-center gap-2">
            <strong className="text-foreground font-semibold w-32">
              Monthly Cost:
            </strong>
            <span>${formatCurrency(selected.monthlyCost)}</span>
          </div>

          <div className="flex items-center gap-2">
            <strong className="text-foreground font-semibold w-32">
              Upfront Cost:
            </strong>
            <span>
              {selected.upfrontCost !== null
                ? `$${formatCurrency(selected.upfrontCost)}`
                : "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <strong className="text-foreground font-semibold w-32">
              Full-Term Cost:
            </strong>
            <span>
              {selected.termCostComplete
                ? `$${formatCurrency(selected.termCost)}`
                : "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <strong className="text-foreground font-semibold w-32">
              Contract Length:
            </strong>
            <span>{selected.contractMonths} months</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-5 text-primary" />
          <h2 className="text-xl font-bold">Decision Impact</h2>
        </div>

        {hasNoImpactData ? (
          <p className="text-default-500">
            Not enough data to calculate decision impact. Please complete the
            financial details for both scenarios.
          </p>
        ) : (
          <ul className="list-disc pl-5 space-y-2 text-default-700">
            {selected.monthlyDelta !== null && (
              <li>
                <strong className="text-foreground font-medium">
                  Monthly difference:
                </strong>{" "}
                {diffStr(selected.monthlyDelta, "/month")}
              </li>
            )}

            {selected.upfrontDelta !== null && (
              <li>
                <strong className="text-foreground font-medium">
                  Upfront difference:
                </strong>{" "}
                {diffStr(selected.upfrontDelta)}
              </li>
            )}

            {selected.termDelta !== null && (
              <li>
                <strong className="text-foreground font-medium">
                  Full-term difference:
                </strong>{" "}
                {diffStr(selected.termDelta)}
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
