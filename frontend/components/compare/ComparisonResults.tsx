import { Card } from "@heroui/react";
import { ComparisonResult } from "@/types/comparison";
import ResultsRow from "./ResultsRow";

interface Props {
  results: ComparisonResult;
}

export default function ComparisonResults({
  results,
}: Props) {
  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-3xl font-bold">
        Comparison Results
      </h2>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-3 border-b border-default-200 bg-default-100 p-4 font-bold">
          <div>Metric</div>
          <div className="text-center">{results.first_result.scenario_name}</div>
          <div className="text-center">{results.second_result.scenario_name}</div>
        </div>

        <ResultsRow
          label="Monthly Cost"
          firstValue={`$${results.first_result.monthly_expenses.toLocaleString()}`}
          secondValue={`$${results.second_result.monthly_expenses.toLocaleString()}`}
        />

        <ResultsRow
          label="Lease Cost"
          firstValue={`$${results.first_result.lease_expenses.toLocaleString()}`}
          secondValue={`$${results.second_result.lease_expenses.toLocaleString()}`}
        />

        <ResultsRow
          label="Monthly Surplus"
          firstValue={`$${results.first_result.monthly_surplus.toLocaleString()}`}
          secondValue={`$${results.second_result.monthly_surplus.toLocaleString()}`}
        />

        <ResultsRow
          label="Lease Surplus"
          firstValue={`$${results.first_result.lease_surplus.toLocaleString()}`}
          secondValue={`$${results.second_result.lease_surplus.toLocaleString()}`}
        />
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">
          Financial Tradeoffs
        </h3>

        <div className="space-y-3">
          <p>
            <strong>
              Lower-Cost Option:
            </strong>{" "}
            {results.lower_monthly_cost_scenario}
          </p>

          <p>
            <strong>
              Monthly Difference:
            </strong>{" "}
            $
            {results.monthly_difference.toLocaleString()}
          </p>
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p>
            <strong>
              Financial Interpretation:
            </strong>
          </p>

          <p className="mt-2">
            {results.lower_monthly_cost_scenario} costs
            $
            {results.monthly_difference.toLocaleString()}
            {" "}less per month.
          </p>

          <p className="mt-2 text-sm text-gray-600">
            This information is intended to
            present financial tradeoffs only
            and should not be interpreted as
            a recommendation.
          </p>
        </div>
      </Card>
    </div>
  );
}