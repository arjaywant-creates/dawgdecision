/** React & Next.js */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NextLink from "next/link";

/** UI Components (HeroUI & Lucide Icons) */
import { Card, Button } from "@heroui/react";
import { Plus } from "lucide-react";

/** Auth, Database, & Engine */
import { FinancialPlanActions } from "./FinancialPlanActions";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeDecisionImpact, analyzeScenario } from "@/lib/decision-engine";

/** Local Components & Types */
import { DecisionImpactResult, DecisionResult } from "@/types/comparison";

/**
 * Page displaying the user's Financial Plan and calculating the decision impact.
 */
export default async function PlanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const housingSelection = await prisma.plan.findUnique({
    where: { userId: session.user.id },
    include: {
      comparison: {
        include: {
          firstScenario: true,
          secondScenario: true,
        },
      },
    },
  });

  // Empty state
  if (!housingSelection || !housingSelection.comparison) {
    return (
      <div className="pb-12">
        <h1 className="mb-2 text-4xl font-bold">Financial Plan</h1>
        <p className="text-default-500">
          Build and manage your financial plan.
        </p>
        <Card className="mt-8 p-6 text-center py-12 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-xl font-semibold">No Housing Selected</h3>
          <p className="text-default-500 max-w-md">
            You haven&apos;t added a housing option to your Financial Plan yet.
          </p>
          <NextLink href="/comparisons">
            <Button variant="primary">
              <Plus className="size-4" />
              Go to Saved Comparisons
            </Button>
          </NextLink>
        </Card>
      </div>
    );
  }

  const { comparison, selectedScenario } = housingSelection;

  const scenarioA = {
    name: comparison.firstScenario.name,
    utilities: comparison.firstScenario.utilities ?? null,
    mandatory_fees: comparison.firstScenario.mandatoryFees ?? null,
    parking: comparison.firstScenario.parking ?? null,
    transportation: comparison.firstScenario.transportation ?? null,
    upfront_costs: comparison.firstScenario.upfrontCosts ?? null,
    commute_minutes: comparison.firstScenario.commuteMinutes ?? null,
    housing_cost: comparison.firstScenario.housingCost,
    cost_period_months: comparison.firstScenario.costPeriodMonths,
    contract_months: comparison.firstScenario.contractMonths,
  };

  const scenarioB = {
    name: comparison.secondScenario.name,
    utilities: comparison.secondScenario.utilities ?? null,
    mandatory_fees: comparison.secondScenario.mandatoryFees ?? null,
    parking: comparison.secondScenario.parking ?? null,
    transportation: comparison.secondScenario.transportation ?? null,
    upfront_costs: comparison.secondScenario.upfrontCosts ?? null,
    commute_minutes: comparison.secondScenario.commuteMinutes ?? null,
    housing_cost: comparison.secondScenario.housingCost,
    cost_period_months: comparison.secondScenario.costPeriodMonths,
    contract_months: comparison.secondScenario.contractMonths,
  };

  let impactResult: DecisionImpactResult | null = null;
  let selectedResult: DecisionResult | null = null;
  let impactError = null;

  try {
    impactResult = await analyzeDecisionImpact(
      scenarioA,
      scenarioB,
      selectedScenario,
    );
    const selectedModel = selectedScenario === "A" ? scenarioA : scenarioB;

    selectedResult = await analyzeScenario(selectedModel);
  } catch (err: any) {
    impactError = err.message;
  }

  const selectedModel = selectedScenario === "A" ? scenarioA : scenarioB;

  return (
    <div className="pb-12 space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Financial Plan</h1>
        <p className="text-default-500">
          Your selected housing and its impact.
        </p>
      </div>

      {impactError ? (
        <Card className="p-4 border-danger bg-danger-50">
          <p className="text-danger">
            Failed to calculate impact: {impactError}
          </p>
        </Card>
      ) : impactResult && selectedResult ? (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              Housing - {selectedModel.name}
            </h2>

            <div className="flex flex-col gap-1 mb-6">
              <p className="text-xl font-semibold">
                ${selectedResult.monthly_recurring_cost.toLocaleString()}/month
              </p>
              <p className="text-default-500">
                {selectedResult.upfront_costs !== null
                  ? `$${selectedResult.upfront_costs.toLocaleString()} upfront`
                  : "Unknown upfront cost"}
              </p>
              <p className="text-default-500">
                {selectedResult.term_cost_complete
                  ? `$${selectedResult.term_cost.toLocaleString()} over ${selectedModel.contract_months} months`
                  : `Unknown full-term cost over ${selectedModel.contract_months} months`}
              </p>
              <p className="text-default-500">
                Contract Length: {selectedModel.contract_months} months
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  What choosing {selectedScenario} means
                </h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-default-700">
                  {impactResult.monthly_commitment_delta !== null &&
                  impactResult.monthly_commitment_delta !== 0 ? (
                    <li>
                      {impactResult.monthly_commitment_delta > 0
                        ? `Costs $${impactResult.monthly_commitment_delta.toLocaleString()} more per month`
                        : `Saves $${Math.abs(impactResult.monthly_commitment_delta).toLocaleString()} per month`}
                    </li>
                  ) : impactResult.monthly_commitment_delta === 0 ? (
                    <li>Same monthly cost</li>
                  ) : null}

                  {impactResult.upfront_commitment_delta !== null &&
                  impactResult.upfront_commitment_delta !== 0 ? (
                    <li>
                      {impactResult.upfront_commitment_delta > 0
                        ? `Costs $${impactResult.upfront_commitment_delta.toLocaleString()} more upfront`
                        : `Saves $${Math.abs(impactResult.upfront_commitment_delta).toLocaleString()} upfront`}
                    </li>
                  ) : impactResult.upfront_commitment_delta === 0 ? (
                    <li>Same upfront cost</li>
                  ) : null}

                  {impactResult.term_commitment_delta !== null &&
                  impactResult.term_commitment_delta !== 0 ? (
                    <li>
                      {impactResult.term_commitment_delta > 0
                        ? `Costs $${impactResult.term_commitment_delta.toLocaleString()} more over the full term`
                        : `Saves $${Math.abs(impactResult.term_commitment_delta).toLocaleString()} over the full term`}
                    </li>
                  ) : impactResult.term_commitment_delta === 0 ? (
                    <li>Same full term cost</li>
                  ) : null}

                  {impactResult.commute_delta !== null &&
                  impactResult.commute_delta !== 0 ? (
                    <li>
                      {impactResult.commute_delta > 0
                        ? `Commute is ${impactResult.commute_delta} minutes longer`
                        : `Commute is ${Math.abs(impactResult.commute_delta)} minutes shorter`}
                    </li>
                  ) : impactResult.commute_delta === 0 ? (
                    <li>Same commute time</li>
                  ) : null}
                </ul>
              </div>

              {(impactResult.largest_cost_increase ||
                impactResult.largest_cost_offset) && (
                <div>
                  <h3 className="text-lg font-semibold">Main cost drivers</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-default-700">
                    {impactResult.largest_cost_increase && (
                      <li className="capitalize">
                        {impactResult.largest_cost_increase.category.replace(
                          "_",
                          " ",
                        )}
                        : +$
                        {impactResult.largest_cost_increase.difference.toLocaleString()}
                        /month
                      </li>
                    )}
                    {impactResult.largest_cost_offset && (
                      <li className="capitalize">
                        {impactResult.largest_cost_offset.category.replace(
                          "_",
                          " ",
                        )}
                        : -$
                        {Math.abs(
                          impactResult.largest_cost_offset.difference,
                        ).toLocaleString()}
                        /month
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {impactResult.break_even_months !== null && (
                <div className="bg-primary/10 p-4 rounded-md">
                  <p className="font-semibold text-primary">
                    Higher upfront cost breaks even after{" "}
                    {impactResult.break_even_months.toFixed(1)} months
                  </p>
                </div>
              )}

              {impactResult.extra_monthly_cost_for_shorter_commute !== null && (
                <div className="bg-primary/10 p-4 rounded-md">
                  <p className="font-semibold text-primary">
                    Costs ${impactResult.extra_monthly_cost_for_shorter_commute}
                    /month more for a {impactResult.commute_minutes_saved}
                    -minute shorter commute
                  </p>
                </div>
              )}

              {selectedResult.missing_recurring_costs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Missing Information</h3>

                  <ul className="list-disc pl-5 mt-2 space-y-1 text-default-700">
                    {selectedResult.missing_recurring_costs.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">Information status</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-default-700">
                  <li>
                    Monthly comparison{" "}
                    {impactResult.monthly_comparison_complete
                      ? "complete"
                      : "incomplete"}
                  </li>
                  <li>
                    Full-term comparison{" "}
                    {impactResult.term_comparison_complete
                      ? "complete"
                      : "incomplete"}
                  </li>
                </ul>
              </div>
            </div>

            <FinancialPlanActions
              comparisonId={comparison.id}
              scenarioAName={scenarioA.name}
              scenarioBName={scenarioB.name}
            />
          </Card>
        </div>
      ) : null}
    </div>
  );
}
