/** Icons */
import { Info, TrendingDown, Scale, CircleDollarSign } from "lucide-react";

/** Types */
import { ComparisonResult, Scenario } from "@/types/comparison";

interface Props {
  results: ComparisonResult;
  scenarioA: Scenario;
  scenarioB: Scenario;
}

interface MetricRowProps {
  label: string;
  a: number;
  b: number;
  nameA: string;
  nameB: string;
  aNull?: boolean;
  bNull?: boolean;
}

/**
 * Reusable row component for displaying a specific financial metric comparison
 */
const MetricRow = ({
  label,
  a,
  b,
  nameA,
  nameB,
  aNull,
  bNull,
}: MetricRowProps) => (
  <div className="flex flex-col py-3 border-b border-separator/30 last:border-0">
    <span className="text-sm text-default-600 font-semibold mb-1">{label}</span>
    <div className="flex justify-between items-center text-sm">
      <span className={`font-medium`}>
        {nameA}: {aNull ? "Unknown" : `$${a?.toLocaleString()}`}
      </span>
      <span className={`font-medium`}>
        {nameB}: {bNull ? "Unknown" : `$${b?.toLocaleString()}`}
      </span>
    </div>
  </div>
);

/**
 * Component to display the calculated comparison results
 */
export default function ComparisonResults({
  results,
  scenarioA,
  scenarioB,
}: Props) {
  const nameA = scenarioA?.name || "Option A";
  const nameB = scenarioB?.name || "Option B";

  const tradeoffLabels: Record<string, string> = {
  lower_monthly_cost: "Lower Monthly Cost",
  lower_full_term_cost: "Lower Full-Term Cost",
  lower_housing_cost: "Lower Housing Cost",
  lower_utilities: "Lower Utilities Cost",
  lower_mandatory_fees: "Lower Mandatory Fees",
  lower_parking_cost: "Lower Parking Cost",
  lower_transportation_cost: "Lower Transportation Cost",
  lower_upfront_cost: "Lower Upfront Costs",
  shorter_commute: "Shorter Commute",
};

const isCommuteTradeoff = (type: string) =>
  type === "shorter_commute" ||
  type === "Shorter Commute";


  const diffStr = (val: number | null) =>
    val === null ? "Unknown" : `$${val.toLocaleString()}`;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Overview */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-1">
          <CircleDollarSign className="text-primary size-4 shrink-0" />
          <h4 className="text-sm font-bold">Totals</h4>
        </div>
        <div className="flex flex-col">
          <MetricRow
            a={results.first_result.monthly_recurring_cost}
            aNull={false}
            b={results.second_result.monthly_recurring_cost}
            bNull={false}
            label="Monthly Recurring Subtotal"
            nameA={nameA}
            nameB={nameB}
          />
          {!results.first_result.recurring_costs_complete ||
!results.second_result.recurring_costs_complete ? (
  <div className="mb-3 rounded-lg border border-warning-200 bg-warning-50/50 p-3 text-xs">
    <p className="font-semibold text-warning-600">
      Monthly subtotal is incomplete.
    </p>

    {results.first_result.missing_recurring_costs.length > 0 && (
      <div className="mt-2">
        <p className="font-medium">
          {nameA} missing:
        </p>

        <ul className="list-disc pl-4">
          {results.first_result.missing_recurring_costs.map((item) => (
            <li key={`a-${item}`}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {results.second_result.missing_recurring_costs.length > 0 && (
      <div className="mt-2">
        <p className="font-medium">
          {nameB} missing:
        </p>

        <ul className="list-disc pl-4">
          {results.second_result.missing_recurring_costs.map((item) => (
            <li key={`b-${item}`}>{item}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
) : null}

          <MetricRow
            a={results.first_result.term_cost}
            aNull={false}
            b={results.second_result.term_cost}
            bNull={false}
            label="Full-Term Cost"
            nameA={nameA}
            nameB={nameB}
          />
          {!results.first_result.term_cost_complete ||
          !results.second_result.term_cost_complete ? (
            <p className="text-[10px] text-warning-500 mb-2">
              Note: Full-term cost is incomplete.
            </p>
          ) : null}
        </div>
      </div>

      {/* Differences */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-1">
          <Scale className="text-primary size-4 shrink-0" />
          <h4 className="text-sm font-bold">Category Differences</h4>
        </div>
        <div className="flex flex-col text-sm space-y-2 py-2">
          <div className="flex justify-between border-b border-separator/10 pb-1">
            <span className="text-default-600">Monthly Cost</span>
            <span className="font-semibold">
              {diffStr(results.monthly_difference)}
            </span>
          </div>
          {results.term_difference !== null && (
            <div className="flex justify-between border-b border-separator/10 pb-1">
              <span className="text-default-600">Full-Term Cost</span>
              <span className="font-semibold">
                {diffStr(results.term_difference)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-b border-separator/10 pb-1">
            <span className="text-default-600">Housing</span>
            <span className="font-semibold">
              {diffStr(results.housing_cost_difference)}
            </span>
          </div>
          <div className="flex justify-between border-b border-separator/10 pb-1">
            <span className="text-default-600">Utilities</span>
            <span className="font-semibold">
              {diffStr(results.utilities_difference)}
            </span>
          </div>
          <div className="flex justify-between border-b border-separator/10 pb-1">
            <span className="text-default-600">Mandatory Fees</span>
            <span className="font-semibold">
              {diffStr(results.mandatory_fees_difference)}
            </span>
          </div>
          <div className="flex justify-between border-b border-separator/10 pb-1">
            <span className="text-default-600">Parking</span>
            <span className="font-semibold">
              {diffStr(results.parking_difference)}
            </span>
          </div>
          <div className="flex justify-between border-b border-separator/10 pb-1">
            <span className="text-default-600">Transportation</span>
            <span className="font-semibold">
              {diffStr(results.transportation_difference)}
            </span>
          </div>
          <div className="flex justify-between border-b border-separator/10 pb-1">
            <span className="text-default-600">Upfront Costs</span>
            <span className="font-semibold">
              {diffStr(results.upfront_cost_difference)}
            </span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-default-600">Commute Time</span>
            <span className="font-semibold">
              {results.commute_difference !== null
                ? `${results.commute_difference} min`
                : "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Tradeoffs */}
      {results.tradeoffs && results.tradeoffs.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-2">
            <TrendingDown className="text-success size-4 shrink-0" />
            <h4 className="text-sm font-bold">Key Tradeoffs</h4>
          </div>
          <div className="flex flex-col gap-2">
            {results.tradeoffs.map((t, idx) => (
              <div
                key={idx}
                className="bg-content2/50 p-3 rounded-lg border border-separator/30 text-sm"
              >
              {t.favored_scenario ? (
                <div>
                    <p>
                      <strong>
                        {tradeoffLabels[t.type] ?? t.type}
                      </strong>
                    </p>

                    <p className="text-success font-medium">
                      {t.favored_scenario}
                    </p>

                    const isCommuteTradeoff =
                    t.type === "shorter_commute" ||
                    t.type === "Shorter Commute";

                  <p className="text-default-500 text-sm">
                    Difference:{" "}
                    {isCommuteTradeoff(t.type)
                      ? `${t.difference} min`
                      : `$${t.difference.toLocaleString()}`}
                  </p>
                </div>
              ) : (
                  <p>
                    Tie on{" "}
                    <strong>
                      {tradeoffLabels[t.type] ?? t.type}
                    </strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
