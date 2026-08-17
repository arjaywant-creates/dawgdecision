import { Info, TrendingDown, Scale, CircleDollarSign } from "lucide-react";

import { ComparisonResult } from "@/types/comparison";

interface Props {
  results: ComparisonResult;
  scenarioA?: string;
  scenarioB?: string;
}

interface MetricRowProps {
  label: string;
  a: number;
  b: number;
  nameA: string;
  nameB: string;
}

const MetricRow = ({ label, a, b, nameA, nameB }: MetricRowProps) => (
  <div className="flex flex-col py-3 border-b border-separator/30 last:border-0">
    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold mb-1">
      {label}
    </span>
    <div className="flex justify-between items-center text-sm">
      <span className={`font-medium ${a < b ? "text-success" : ""}`}>
        {nameA}: ${a.toLocaleString()}
      </span>
      <span className={`font-medium ${b < a ? "text-success" : ""}`}>
        {nameB}: ${b.toLocaleString()}
      </span>
    </div>
  </div>
);

export default function ComparisonResults({
  results,
  scenarioA,
  scenarioB,
}: Props) {
  const isTie = results.monthly_difference === 0;
  const nameA = scenarioA || "Option A";
  const nameB = scenarioB || "Option B";

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Summary Section */}
      <div className="flex items-start gap-3">
        {isTie ? (
          <Scale className="text-primary size-6 shrink-0 mt-0.5" />
        ) : (
          <TrendingDown className="text-success size-6 shrink-0 mt-0.5" />
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            SUMMARY
          </span>
          {isTie ? (
            <>
              <h4 className="text-sm font-semibold text-primary">
                Costs are equal
              </h4>
              <p className="text-xs text-default-600">
                Both options have the same financial impact.
              </p>
            </>
          ) : (
            <>
              <h4 className="text-sm font-bold text-success">
                {results.lower_monthly_cost_scenario} is cheaper
              </h4>
              <p className="text-xs font-medium text-default-600">
                Saves{" "}
                <span className="text-success font-bold">
                  ${results.monthly_difference.toLocaleString()}
                </span>{" "}
                /mo
              </p>
            </>
          )}
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-1">
          <CircleDollarSign className="text-primary size-4 shrink-0" />
          <h4 className="text-sm font-bold">Breakdown</h4>
        </div>
        <div className="flex flex-col">
          <MetricRow
            a={results.first_result.monthly_expenses}
            b={results.second_result.monthly_expenses}
            label="Total Monthly Cost"
            nameA={nameA}
            nameB={nameB}
          />
          <MetricRow
            a={results.first_result.lease_expenses}
            b={results.second_result.lease_expenses}
            label="Total Lease Cost"
            nameA={nameA}
            nameB={nameB}
          />
          <MetricRow
            a={results.first_result.monthly_surplus}
            b={results.second_result.monthly_surplus}
            label="Monthly Surplus"
            nameA={nameA}
            nameB={nameB}
          />
        </div>
      </div>

      {/* Note Section */}
      <div className="flex items-start gap-2 bg-content2/50 p-3 rounded-lg border border-separator/30">
        <Info className="size-4 text-default-500 shrink-0" />
        <p className="text-xs text-default-500 leading-relaxed font-medium">
          This presents financial tradeoffs only and should not be interpreted
          as a firm financial recommendation.
        </p>
      </div>
    </div>
  );
}
