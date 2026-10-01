import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { FinancialPlanDetailClient } from "../FinancialPlanDetailClient";

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

  // Calculate both options up front so switching in the UI
  // requires no database mutation or server call.
  const [resultA, resultB, impactA, impactB] = await Promise.all([
    analyzeScenario(scenarioA),
    analyzeScenario(scenarioB),
    analyzeDecisionImpact(scenarioA, scenarioB, "A"),
    analyzeDecisionImpact(scenarioA, scenarioB, "B"),
  ]);

  return (
    <FinancialPlanDetailClient
      comparisonId={comparison.id}
      planId={plan.id}
      savedAt={plan.createdAt.toISOString()}
      savedScenario={selectedScenario as "A" | "B"}
      scenarioA={{
        name: scenarioA.name,
        contractMonths: scenarioA.contract_months,
        monthlyCost: resultA.monthly_recurring_cost,
        upfrontCost: resultA.upfront_costs,
        termCost: resultA.term_cost,
        termCostComplete: resultA.term_cost_complete,
        monthlyDelta: impactA.monthly_commitment_delta,
        upfrontDelta: impactA.upfront_commitment_delta,
        termDelta: impactA.term_commitment_delta,
      }}
      scenarioB={{
        name: scenarioB.name,
        contractMonths: scenarioB.contract_months,
        monthlyCost: resultB.monthly_recurring_cost,
        upfrontCost: resultB.upfront_costs,
        termCost: resultB.term_cost,
        termCostComplete: resultB.term_cost_complete,
        monthlyDelta: impactB.monthly_commitment_delta,
        upfrontDelta: impactB.upfront_commitment_delta,
        termDelta: impactB.term_commitment_delta,
      }}
    />
  );
}
