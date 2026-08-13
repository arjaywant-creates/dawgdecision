import { Card, Table, Separator } from "@heroui/react";
import { ComparisonResult } from "@/types/comparison";
import { Info, TrendingDown, Scale, Calculator } from "lucide-react";

interface Props {
  results: ComparisonResult;
}

export default function ComparisonResults({ results }: Props) {
  const isTie = results.monthly_difference === 0;

  return (
    <div className="mt-10 space-y-8 w-full max-w-full">
      <h2 className="text-3xl font-bold">Comparison Results</h2>

      <Table className="w-full">
        <Table.ScrollContainer>
          <Table.Content aria-label="Detailed Comparison Results">
            <Table.Header>
              <Table.Column isRowHeader>Metric</Table.Column>
              <Table.Column>{results.first_result.scenario_name}</Table.Column>
              <Table.Column>{results.second_result.scenario_name}</Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Monthly Cost</Table.Cell>
                <Table.Cell>${results.first_result.monthly_expenses.toLocaleString()}</Table.Cell>
                <Table.Cell>${results.second_result.monthly_expenses.toLocaleString()}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Lease Cost</Table.Cell>
                <Table.Cell>${results.first_result.lease_expenses.toLocaleString()}</Table.Cell>
                <Table.Cell>${results.second_result.lease_expenses.toLocaleString()}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Monthly Surplus</Table.Cell>
                <Table.Cell>${results.first_result.monthly_surplus.toLocaleString()}</Table.Cell>
                <Table.Cell>${results.second_result.monthly_surplus.toLocaleString()}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Lease Surplus</Table.Cell>
                <Table.Cell>${results.first_result.lease_surplus.toLocaleString()}</Table.Cell>
                <Table.Cell>${results.second_result.lease_surplus.toLocaleString()}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <div className="flex flex-col gap-6 w-full">
        <Card className="w-full bg-content1 shadow-sm p-6">
          <h3 className="mb-4 text-xl font-semibold">Financial Tradeoffs</h3>
          
          <div className="space-y-3">
            {isTie ? (
              <p className="flex items-center gap-2">
                <Scale className="size-4 text-default-500" />
                <strong>Monthly Cost:</strong> Equal
              </p>
            ) : (
              <p className="flex items-center gap-2">
                <TrendingDown className="size-4 text-default-500" />
                <strong>Lower-Cost Option:</strong>{" "}
                {results.lower_monthly_cost_scenario}
              </p>
            )}

            <p className="pl-6">
              <strong>Monthly Difference:</strong>{" "}
              ${results.monthly_difference.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="w-full bg-content1 shadow-sm p-6">
          <h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <Info className="size-5 text-default-500" />
            Financial Interpretation
          </h3>
          
          <div className="space-y-3">
            {isTie ? (
              <p className="text-default-700">
                Both options have the same monthly cost.
              </p>
            ) : (
              <p className="text-default-700">
                {results.lower_monthly_cost_scenario} costs $
                {results.monthly_difference.toLocaleString()} less
                per month.
              </p>
            )}

            <p className="text-sm text-default-500">
              This information is intended to present
              financial tradeoffs only and should not be
              interpreted as a recommendation.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}