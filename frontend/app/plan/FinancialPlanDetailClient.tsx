"use client";

import { useState } from "react";

import {
  Home,
  TrendingUp,
  Calendar,
  CalendarRange,
  Clock,
  Car,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";
import { Breadcrumbs, Card } from "@heroui/react";

import { FinancialPlanActions } from "./FinancialPlanActions";

import { diffStr, formatCurrency } from "@/lib/formatters";
import { CostDriver } from "@/types/comparison";

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
  breakEvenMonths?: number | null;
  approximateDailyDelta?: number | null;
  commuteDelta?: number | null;
  commuteMinutesSaved?: number | null;
  extraMonthlyCostForShorterCommute?: number | null;
  largestCostIncrease?: CostDriver | null;
  largestCostOffset?: CostDriver | null;
  missingRecurringCosts?: string[];
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

  const knownMonthlyDelta = selected.monthlyCost - alternative.monthlyCost;
  const hasVerifiedMonthlyDelta = selected.monthlyDelta !== null;
  const effectiveMonthlyDelta = hasVerifiedMonthlyDelta
    ? selected.monthlyDelta
    : knownMonthlyDelta;

  const isSavingMonthly =
    effectiveMonthlyDelta !== null && effectiveMonthlyDelta < 0;
  const isMoreMonthly =
    effectiveMonthlyDelta !== null && effectiveMonthlyDelta > 0;

  const rawTermDelta =
    selected.termCost !== null &&
    selected.termCost !== undefined &&
    alternative.termCost !== null &&
    alternative.termCost !== undefined
      ? selected.termCost - alternative.termCost
      : null;

  const effectiveTermDelta = selected.termDelta ?? rawTermDelta;
  const hasUnequalContractLengths =
    selected.contractMonths !== alternative.contractMonths;
  const contractLengthDifference =
    selected.contractMonths - alternative.contractMonths;
  const termComparisonComplete =
    selected.termCostComplete && alternative.termCostComplete;

  const hasNoImpactData =
    effectiveMonthlyDelta === null &&
    selected.upfrontDelta === null &&
    effectiveTermDelta === null &&
    knownMonthlyDelta === 0;

  const dailyDelta =
    selected.approximateDailyDelta ??
    (knownMonthlyDelta !== 0 ? knownMonthlyDelta / 30 : null);

  const breakEvenMonths =
    selected.breakEvenMonths ??
    (selected.upfrontDelta !== null &&
    selected.upfrontDelta > 0 &&
    knownMonthlyDelta < 0
      ? selected.upfrontDelta / -knownMonthlyDelta
      : null);

  const hasAdditionalInsights = Boolean(
    hasUnequalContractLengths ||
    dailyDelta !== null ||
    breakEvenMonths !== null ||
    (selected.commuteDelta !== null && selected.commuteDelta !== undefined) ||
    selected.largestCostIncrease ||
    selected.largestCostOffset ||
    (selected.missingRecurringCosts &&
      selected.missingRecurringCosts.length > 0),
  );

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
                  ? selected.upfrontCost === 0
                    ? "None"
                    : `$${formatCurrency(selected.upfrontCost)}`
                  : "Unknown"}
              </span>
            </div>
            <span className="text-xs text-default-400">
              {selected.upfrontCost === 0
                ? "No move-in fees"
                : selected.upfrontCost === null
                  ? "Move-in fees unverified"
                  : "One-time fees (excl. deposits)"}
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-default-500">
              Full-Term Commitment
            </span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {selected.termCost !== null && selected.termCost !== undefined
                  ? `$${formatCurrency(selected.termCost)}`
                  : "Unknown"}
              </span>
            </div>
            <span className="text-xs text-default-400">
              {selected.termCostComplete
                ? `Total across ${selected.contractMonths} months`
                : `Est. total across ${selected.contractMonths} months (unverified fees)`}
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
                  {hasVerifiedMonthlyDelta
                    ? "Monthly Difference"
                    : "Est. Monthly Difference"}
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
                    {hasVerifiedMonthlyDelta
                      ? diffStr(selected.monthlyDelta, "/mo")
                      : effectiveMonthlyDelta !== 0
                        ? `~${diffStr(effectiveMonthlyDelta, "/mo")}`
                        : "Equal (known fees)"}
                  </span>
                </div>
                <span className="text-xs text-default-500">
                  {hasVerifiedMonthlyDelta
                    ? isSavingMonthly
                      ? "Savings vs alternative"
                      : isMoreMonthly
                        ? "Higher recurring cost"
                        : "Identical monthly cost"
                    : "Based on known expenses"}
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
                  {selected.upfrontDelta === null
                    ? selected.upfrontCost !== null &&
                      alternative.upfrontCost === null
                      ? "Fees unverified for alternative"
                      : selected.upfrontCost === null &&
                          alternative.upfrontCost !== null
                        ? "Fees unverified for this option"
                        : "Fees unverified for both options"
                    : selected.upfrontDelta < 0
                      ? "Initial move-in savings"
                      : selected.upfrontDelta > 0
                        ? "Higher move-in cost"
                        : selected.upfrontCost === 0 &&
                            alternative.upfrontCost === 0
                          ? "No upfront fees for either option"
                          : "Identical upfront cost"}
                </span>
              </Card>

              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-default-500">
                  Full-Term Difference
                </span>
                <div className="my-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {effectiveTermDelta !== null
                      ? !termComparisonComplete && effectiveTermDelta !== 0
                        ? `~${diffStr(effectiveTermDelta)}`
                        : diffStr(effectiveTermDelta)
                      : "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-default-500">
                  {effectiveTermDelta !== null
                    ? hasUnequalContractLengths
                      ? `Total contract delta (${selected.contractMonths} mo vs ${alternative.contractMonths} mo)`
                      : effectiveTermDelta < 0
                        ? "Total lease term savings"
                        : effectiveTermDelta > 0
                          ? "Higher total stay cost"
                          : "Identical full-term cost"
                    : "Incomplete term cost data"}
                </span>
              </Card>
            </div>

            {/* Concise insight summary callout */}
            {effectiveMonthlyDelta !== null && (
              <Card
                className={`p-4 ${
                  isSavingMonthly
                    ? "bg-success-500/10 text-success-800 dark:text-success-200"
                    : isMoreMonthly
                      ? "bg-warning-500/10 text-warning-800 dark:text-warning-200"
                      : "bg-default-50 text-default-700"
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">
                  {isSavingMonthly
                    ? `Choosing this option saves ${hasVerifiedMonthlyDelta ? "" : "estimated "}$${formatCurrency(
                        Math.abs(effectiveMonthlyDelta),
                      )} per month in recurring costs compared to ${
                        alternative.name
                      }.`
                    : isMoreMonthly
                      ? `Choosing this option costs ${hasVerifiedMonthlyDelta ? "" : "estimated "}$${formatCurrency(
                          effectiveMonthlyDelta,
                        )} more per month in recurring costs compared to ${
                          alternative.name
                        }.`
                      : `Both options have an identical monthly recurring cost.`}
                </p>

                {!hasVerifiedMonthlyDelta && (
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1.5 font-normal flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>
                      Utilities or optional recurring fees are unverified for
                      one or both options.
                    </span>
                  </p>
                )}
              </Card>
            )}

            {/* Additional Decision Insights */}
            {hasAdditionalInsights && (
              <Card className="p-4 space-y-3 text-sm text-default-600">
                <h3 className="font-semibold text-xs text-default-500">
                  Additional Insights
                </h3>
                <div className="space-y-2.5">
                  {hasUnequalContractLengths && (
                    <div className="flex items-start gap-2.5">
                      <CalendarRange className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-medium">
                          Contract duration difference:{" "}
                        </strong>
                        <span>
                          {selected.name} covers {selected.contractMonths}{" "}
                          months vs. {alternative.name}&apos;s{" "}
                          {alternative.contractMonths} months (
                          {Math.abs(contractLengthDifference)} month
                          {Math.abs(contractLengthDifference) !== 1
                            ? "s"
                            : ""}{" "}
                          difference). If you need summer housing during
                          uncovered months, factor in separate sublease or
                          short-term rent.
                        </span>
                      </div>
                    </div>
                  )}

                  {dailyDelta !== null && (
                    <div className="flex items-start gap-2.5">
                      <Calendar className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-medium">
                          Daily equivalent:{" "}
                        </strong>
                        <span>
                          {dailyDelta < 0
                            ? `Saves ~$${formatCurrency(Math.abs(dailyDelta))}/day compared to ${alternative.name}`
                            : dailyDelta > 0
                              ? `Costs ~$${formatCurrency(dailyDelta)}/day more than ${alternative.name}`
                              : `Same daily equivalent as ${alternative.name}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {breakEvenMonths !== null && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-medium">
                          Break-even horizon:{" "}
                        </strong>
                        <span>
                          Recovers higher upfront costs in ~
                          {breakEvenMonths.toFixed(1)} months via monthly
                          savings.
                        </span>
                      </div>
                    </div>
                  )}

                  {selected.commuteDelta !== null &&
                    selected.commuteDelta !== undefined && (
                      <div className="flex items-start gap-2.5">
                        <Car className="size-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-foreground font-medium">
                            Commute difference:{" "}
                          </strong>
                          <span>
                            {selected.commuteDelta < 0
                              ? `Saves ${Math.abs(selected.commuteDelta)} min/trip compared to ${alternative.name}`
                              : selected.commuteDelta > 0
                                ? `Adds ${selected.commuteDelta} min/trip compared to ${alternative.name}`
                                : `Same commute time as ${alternative.name}`}
                          </span>
                          {selected.extraMonthlyCostForShorterCommute !==
                            null &&
                            selected.extraMonthlyCostForShorterCommute !==
                              undefined &&
                            selected.commuteMinutesSaved !== null &&
                            selected.commuteMinutesSaved !== undefined && (
                              <span className="text-xs text-default-500 block mt-0.5">
                                Costs $
                                {formatCurrency(
                                  selected.extraMonthlyCostForShorterCommute,
                                )}
                                /mo more to save {selected.commuteMinutesSaved}{" "}
                                min of commute.
                              </span>
                            )}
                        </div>
                      </div>
                    )}

                  {selected.largestCostIncrease && (
                    <div className="flex items-start gap-2.5">
                      <ArrowUpRight className="size-4 text-warning-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-medium">
                          Largest cost increase:{" "}
                        </strong>
                        <span className="capitalize">
                          {selected.largestCostIncrease.category.replace(
                            /_/g,
                            " ",
                          )}
                        </span>{" "}
                        costs +$
                        {formatCurrency(
                          selected.largestCostIncrease.difference,
                        )}
                        /mo more than {alternative.name}
                      </div>
                    </div>
                  )}

                  {selected.largestCostOffset && (
                    <div className="flex items-start gap-2.5">
                      <ArrowDownRight className="size-4 text-success-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-medium">
                          Largest cost offset:{" "}
                        </strong>
                        <span className="capitalize">
                          {selected.largestCostOffset.category.replace(
                            /_/g,
                            " ",
                          )}
                        </span>{" "}
                        saves $
                        {formatCurrency(
                          Math.abs(selected.largestCostOffset.difference),
                        )}
                        /mo compared to {alternative.name}
                      </div>
                    </div>
                  )}

                  {selected.missingRecurringCosts &&
                    selected.missingRecurringCosts.length > 0 && (
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="size-4 text-warning-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-foreground font-medium">
                            Unverified recurring items:{" "}
                          </strong>
                          <span className="text-default-500">
                            Costs for{" "}
                            {selected.missingRecurringCosts.join(", ")} are
                            unverified or omitted in this estimate.
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
