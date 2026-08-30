import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { Card } from "@heroui/react";

import { FinancialPlanActions } from "../FinancialPlanActions";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeDecisionImpact, analyzeScenario } from "@/lib/decision-engine";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function FinancialPlanDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const plan = await prisma.plan.findUnique({
    where: {
      id,
    },
    include: {
      comparison: {
        include: {
          firstScenario: true,
          secondScenario: true,
        },
      },
    },
  });

  if (!plan || plan.userId !== session.user.id) {
    notFound();
  }

  const { comparison, selectedScenario } = plan;

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

  const selectedModel = selectedScenario === "A" ? scenarioA : scenarioB;

  const selectedResult = await analyzeScenario(selectedModel);

  const impactResult = await analyzeDecisionImpact(
    scenarioA,
    scenarioB,
    selectedScenario,
  );

  return (
    <div className="pb-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">{selectedModel.name}</h1>

        <p className="text-default-500">
          Saved on {new Date(plan.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Housing Summary</h2>

        <div className="space-y-2">
          <p>
            <strong>Monthly Cost:</strong> $
            {selectedResult.monthly_recurring_cost.toLocaleString()}
          </p>

          <p>
            <strong>Upfront Cost:</strong>{" "}
            {selectedResult.upfront_costs !== null
              ? `$${selectedResult.upfront_costs.toLocaleString()}`
              : "Unknown"}
          </p>

          <p>
            <strong>Full-Term Cost:</strong>{" "}
            {selectedResult.term_cost_complete
              ? `$${selectedResult.term_cost.toLocaleString()}`
              : "Unknown"}
          </p>

          <p>
            <strong>Contract Length:</strong> {selectedModel.contract_months}{" "}
            months
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Decision Impact</h2>

        <ul className="list-disc pl-5 space-y-2">
          {impactResult.monthly_commitment_delta !== null && (
            <li>
              Monthly difference: $
              {Math.abs(impactResult.monthly_commitment_delta).toLocaleString()}
            </li>
          )}

          {impactResult.upfront_commitment_delta !== null && (
            <li>
              Upfront difference: $
              {Math.abs(impactResult.upfront_commitment_delta).toLocaleString()}
            </li>
          )}

          {impactResult.term_commitment_delta !== null && (
            <li>
              Full-term difference: $
              {Math.abs(impactResult.term_commitment_delta).toLocaleString()}
            </li>
          )}
        </ul>
      </Card>

      <FinancialPlanActions
        comparisonId={comparison.id}
        planId={plan.id}
        scenarioAName={scenarioA.name}
        scenarioBName={scenarioB.name}
      />
    </div>
  );
}
