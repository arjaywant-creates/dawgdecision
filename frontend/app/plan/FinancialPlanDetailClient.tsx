"use client";

import { useState } from "react";

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
  savedScenario: _savedScenario,
  savedAt,
  scenarioA,
  scenarioB,
}: Props) {
  // This is VIEW STATE ONLY.
  // It never changes the Financial Plan stored in the database.
  const [viewingScenario, setViewingScenario] = useState<"A" | "B">(
    _savedScenario,
  );

  const selected = viewingScenario === "A" ? scenarioA : scenarioB;
  const alternative = viewingScenario === "A" ? scenarioB : scenarioA;

  const hasNoImpactData =
    selected.monthlyDelta === null &&
    selected.upfrontDelta === null &&
    selected.termDelta === null;

  const isSavingMonthly =
    selected.monthlyDelta !== null && selected.monthlyDelta < 0;
  const isMoreMonthly =
    selected.monthlyDelta !== null && selected.monthlyDelta > 0;

  return (
    <div className="pb-12 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="w-full overflow-x-auto whitespace-nowrap pb-1 -mb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Breadcrumbs className="mb-2">
          <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/plan">Saved Plans</Breadcrumbs.Item>
          <Breadcrumbs.Item>{selected.name}</Breadcrumbs.Item>
        </Breadcrumbs>
      </div>

      {/* Header Row */}
      <div className="space-y-3 pb-4 border-b border-default-200/60">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {selected.name}
          </h1>

          <p className="text-default-500 font-normal text-xs sm:text-sm pt-0.5">
            Saved on {new Date(savedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Controls placed on next line below the title */}
        <div>
          <FinancialPlanActions
            comparisonId={comparisonId}
            planId={planId}
            scenarioAName={scenarioA.name}
            scenarioBName={scenarioB.name}
            viewingScenario={viewingScenario}
            onSwitch={setViewingScenario}
          />
        </div>
      </div>

      {/* Housing Summary Section with Individual Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Home className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Housing Summary</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-default-500">
              Monthly Recurring
            </span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                ${formatCurrency(selected.monthlyCost)}
              </span>
              <span className="text-xs font-normal text-default-500 ml-1">
                /mo
              </span>
            </div>
            <span className="text-xs text-default-400">
              Rent + estimated recurring fees
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-default-500">
              Upfront Costs
            </span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {selected.upfrontCost !== null
                  ? `$${formatCurrency(selected.upfrontCost)}`
                  : "None"}
              </span>
            </div>
            <span className="text-xs text-default-400">
              Deposits &amp; one-time fees
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-default-500">
              Full-Term Commitment
            </span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {selected.termCostComplete
                  ? `$${formatCurrency(selected.termCost)}`
                  : "Unknown"}
              </span>
            </div>
            <span className="text-xs text-default-400">
              Total across {selected.contractMonths} months
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-default-500">
              Contract Duration
            </span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {selected.contractMonths}
                <span className="text-sm font-normal text-default-500 ml-1.5">
                  months
                </span>
              </span>
            </div>
            <span className="text-xs text-default-400">
              Active lease commitment
            </span>
          </Card>
        </div>
      </div>

      {/* Decision Impact Section with Individual Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Decision Impact
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-default-500 font-normal">
            vs. {alternative.name}
          </span>
        </div>

        {hasNoImpactData ? (
          <Card className="p-4">
            <p className="text-default-500 text-sm">
              Not enough data to calculate decision impact. Please complete the
              financial details for both scenarios.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-default-500">
                  Monthly Difference
                </span>
                <div className="my-2">
                  <span
                    className={`text-2xl sm:text-3xl font-bold ${
                      isSavingMonthly
                        ? "text-success-600 dark:text-success-400"
                        : isMoreMonthly
                          ? "text-warning-600 dark:text-warning-400"
                          : "text-foreground"
                    }`}
                  >
                    {diffStr(selected.monthlyDelta, "/mo")}
                  </span>
                </div>
                <span className="text-xs text-default-500">
                  {isSavingMonthly
                    ? "Savings vs alternative"
                    : isMoreMonthly
                      ? "Higher recurring cost"
                      : "Identical monthly cost"}
                </span>
              </Card>

              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-default-500">
                  Upfront Difference
                </span>
                <div className="my-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {diffStr(selected.upfrontDelta)}
                  </span>
                </div>
                <span className="text-xs text-default-500">
                  Initial move-in cost delta
                </span>
              </Card>

              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-default-500">
                  Full-Term Difference
                </span>
                <div className="my-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {diffStr(selected.termDelta)}
                  </span>
                </div>
                <span className="text-xs text-default-500">
                  Total lease cost delta
                </span>
              </Card>
            </div>

            {/* Concise insight summary callout */}
            {selected.monthlyDelta !== null && (
              <Card
                className={`p-4 ${
                  isSavingMonthly
                    ? "bg-success-500/10 text-success-800 dark:text-success-200"
                    : "bg-default-50 text-default-700"
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">
                  {isSavingMonthly
                    ? `Choosing this option saves $${formatCurrency(
                        Math.abs(selected.monthlyDelta),
                      )} per month in recurring costs compared to ${
                        alternative.name
                      }.`
                    : isMoreMonthly
                      ? `Choosing this option costs $${formatCurrency(
                          selected.monthlyDelta,
                        )} more per month in recurring costs compared to ${
                          alternative.name
                        }.`
                      : `Both options have an identical monthly recurring cost.`}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
