/* React and HeroUI */
import { Accordion, Surface, Table, Tooltip } from "@heroui/react";
import { OutlineSurface } from "@/components/OutlineSurface";

/** Icons */
import {
  Info,
  TrendingDown,
  Scale,
  CircleDollarSign,
  ChevronDown,
  Clock,
  Wallet,
} from "lucide-react";

/** Types */
import { ComparisonResult, Scenario } from "@/types/comparison";

import { formatCurrency, diffStr } from "@/lib/formatters";

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
  suffix?: string;
  tooltip?: string;
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
  suffix = "",
  tooltip,
}: MetricRowProps) => {
  return (
    <div className="flex flex-col gap-3 border-b border-separator/10 py-3">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-foreground">{label}</span>
        {tooltip && (
          <Tooltip delay={0}>
            <Tooltip.Trigger aria-label="More information">
              <span className="cursor-help text-default-400 hover:text-default-600 flex items-center justify-center">
                <Info className="size-3.5" />
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content className="text-xs p-2 max-w-xs">
              <Tooltip.Arrow />
              {tooltip}
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-default-500 mb-0.5">
            {nameA}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {aNull ? "Unknown" : `$${formatCurrency(a)}${suffix}`}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-default-500 mb-0.5">
            {nameB}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {bNull ? "Unknown" : `$${formatCurrency(b)}${suffix}`}
          </span>
        </div>
      </div>
    </div>
  );
};

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
    type === "commute" || type === "shorter_commute";

  return (
    <div className="flex flex-col gap-6">
      {/* Totals Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-1">
          <CircleDollarSign className="text-primary size-4 shrink-0" />
          <h4 className="text-sm font-bold text-foreground">Totals</h4>
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
            suffix="/month"
            tooltip="Combined cost of housing base rent and mandatory recurring fees."
          />
          {(!results.first_result.recurring_costs_complete ||
            !results.second_result.recurring_costs_complete) && (
            <Accordion
              className="mb-2 w-full bg-warning-50/50 border border-warning-200/50 rounded-xl"
              variant="default"
            >
              <Accordion.Item>
                <Accordion.Heading>
                  <Accordion.Trigger className="py-2 px-3 group flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Info className="size-4 shrink-0 text-warning-600" />
                      <span className="text-xs font-semibold text-warning-900">
                        Monthly cost is incomplete.
                      </span>
                    </div>
                    <Accordion.Indicator className="text-warning-600/50 group-data-[expanded=true]:rotate-180 transition-transform">
                      <ChevronDown className="size-4" />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="px-3 pb-3 pt-0">
                    <div className="text-[11px] text-warning-800/90 leading-tight pl-6">
                      <p className="mb-1 font-medium">Missing values:</p>
                      <ul className="list-disc pl-3 flex flex-col gap-0.5">
                        {results.first_result.missing_recurring_costs.length >
                          0 && (
                          <li>
                            <strong className="font-semibold">{nameA}:</strong>{" "}
                            {results.first_result.missing_recurring_costs.join(
                              ", ",
                            )}
                          </li>
                        )}
                        {results.second_result.missing_recurring_costs.length >
                          0 && (
                          <li>
                            <strong className="font-semibold">{nameB}:</strong>{" "}
                            {results.second_result.missing_recurring_costs.join(
                              ", ",
                            )}
                          </li>
                        )}
                      </ul>
                    </div>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          )}

          <MetricRow
            a={results.first_result.term_cost}
            aNull={false}
            b={results.second_result.term_cost}
            bNull={false}
            label="Full-Term Cost"
            nameA={nameA}
            nameB={nameB}
            tooltip="Total estimated cost over the entire contract length, including all monthly and upfront costs."
          />
          {(!results.first_result.term_cost_complete ||
            !results.second_result.term_cost_complete) && (
            <Surface
              className="mb-2 py-2 px-3 flex items-center gap-2 rounded-xl border border-warning-200/50 bg-warning-50/50"
              variant="transparent"
            >
              <Info className="size-4 shrink-0 text-warning-600" />
              <p className="text-xs font-semibold text-warning-900">
                Full-term cost is incomplete.
              </p>
            </Surface>
          )}
        </div>
      </div>

      {/* Fees and Upfront Costs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-1">
          <Info className="size-4 shrink-0 text-primary" />
          <h4 className="text-sm font-bold text-foreground">
            Fees & Upfront Costs
          </h4>
        </div>
        <div className="flex flex-col">
          <MetricRow
            a={results.first_result.mandatory_fees ?? 0}
            aNull={results.first_result.mandatory_fees === null}
            b={results.second_result.mandatory_fees ?? 0}
            bNull={results.second_result.mandatory_fees === null}
            label="Mandatory Recurring Fees"
            nameA={nameA}
            nameB={nameB}
            suffix="/month"
            tooltip="Fixed monthly fees required by the property (e.g., amenity fees, trash service)."
          />
          <MetricRow
            a={results.first_result.upfront_costs ?? 0}
            aNull={results.first_result.upfront_costs === null}
            b={results.second_result.upfront_costs ?? 0}
            bNull={results.second_result.upfront_costs === null}
            label="Upfront/Move-in Costs"
            nameA={nameA}
            nameB={nameB}
            tooltip="One-time fees due at signing or move-in (e.g., security deposits, admin fees)."
          />
        </div>
      </div>

      {/* Category Differences (Table) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-1">
          <Scale className="text-primary size-4 shrink-0" />
          <h4 className="text-sm font-bold">Category Differences</h4>
        </div>
        <div className="mt-2">
          <Table className="shadow-none">
            <Table.ScrollContainer>
              <Table.Content aria-label="Category Differences">
                <Table.Header>
                  <Table.Column isRowHeader>Category</Table.Column>
                  <Table.Column>Difference</Table.Column>
                </Table.Header>
                <Table.Body className="[&_tr:nth-child(even)]:bg-default-100/50">
                  <Table.Row>
                    <Table.Cell>Monthly Cost</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {diffStr(results.monthly_difference, "/month")}
                    </Table.Cell>
                  </Table.Row>
                  {results.term_difference !== null ? (
                    <Table.Row>
                      <Table.Cell>Full-Term Cost</Table.Cell>
                      <Table.Cell className="font-semibold text-right">
                        {diffStr(results.term_difference)}
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <Table.Row className="hidden">
                      <Table.Cell />
                      <Table.Cell />
                    </Table.Row>
                  )}
                  <Table.Row>
                    <Table.Cell>Housing</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {diffStr(results.housing_cost_difference, "/month")}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Utilities</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {diffStr(results.utilities_difference, "/month")}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Mandatory Fees</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {diffStr(results.mandatory_fees_difference, "/month")}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Parking Cost</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {diffStr(results.parking_difference)}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Transportation</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {diffStr(results.transportation_difference, "/month")}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Upfront Costs</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {diffStr(results.upfront_cost_difference)}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Commute Time</Table.Cell>
                    <Table.Cell className="font-semibold text-right">
                      {results.commute_difference !== null
                        ? `${results.commute_difference} min`
                        : "Unknown"}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      </div>

      {/* Tradeoffs */}
      {results.tradeoffs && results.tradeoffs.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 border-b border-separator/50 pb-1.5 mb-1">
            <TrendingDown className="text-primary size-4 shrink-0" />
            <h4 className="text-sm font-bold">Key Tradeoffs</h4>
          </div>

          <div className="flex flex-col gap-3 mt-1.5">
            {results.tradeoffs.map((t, idx) => {
              let TradeoffIcon = CircleDollarSign;

              if (t.type.includes("commute")) TradeoffIcon = Clock;
              else if (t.type.includes("upfront")) TradeoffIcon = Wallet;

              return (
                <OutlineSurface key={idx}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <TradeoffIcon className="size-4 text-default-500 shrink-0" />
                      <span className="text-sm font-semibold text-foreground">
                        {tradeoffLabels[t.type] ?? t.type}
                      </span>
                    </div>

                    {t.favored_scenario ? (
                      <div className="flex flex-col ml-6">
                        <span className="text-sm font-semibold text-success">
                          {t.favored_scenario}
                        </span>
                        <span className="text-sm text-default-600">
                          Wins by{" "}
                          {isCommuteTradeoff(t.type)
                            ? `${t.difference} min`
                            : `$${formatCurrency(t.difference)}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-default-500 ml-6">
                        Tie
                      </span>
                    )}
                  </div>
                </OutlineSurface>
              );
            })}
          </div>
        </div>
      )}

      {/* Note Section */}
      <OutlineSurface className="flex gap-3 p-3">
        <Info className="size-4 text-default-500 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-default-600 leading-relaxed">
          This presents financial tradeoffs only and should not be interpreted
          as a firm financial recommendation.
        </p>
      </OutlineSurface>
    </div>
  );
}
