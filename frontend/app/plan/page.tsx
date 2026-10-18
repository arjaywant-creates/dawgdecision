/** React & Next.js */
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NextLink from "next/link";

export const metadata: Metadata = {
  title: "Financial Plans",
};

/** UI Components */
import { Card, Breadcrumbs } from "@heroui/react";
import { Plus } from "lucide-react";

import FinancialPlanCard from "./FinancialPlanCard";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Displays all saved Financial Plans for the authenticated user.
 */
export default async function PlanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const plans = await prisma.plan.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      comparison: {
        include: {
          firstScenario: true,
          secondScenario: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (plans.length === 0) {
    return (
      <div className="pb-12">
        <Breadcrumbs className="mb-4">
          <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
          <Breadcrumbs.Item>Saved Plans</Breadcrumbs.Item>
        </Breadcrumbs>
        <h1 className="mb-2 text-4xl font-bold">Saved Financial Plans</h1>

        <p className="text-default-500">
          View and manage your saved financial plans.
        </p>

        <Card className="mt-8 p-6 text-center py-12 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-xl font-semibold">No Saved Financial Plans</h3>

          <p className="text-default-500 max-w-md">
            You haven&apos;t saved any Financial Plans yet.
          </p>

          <NextLink className="button button--primary" href="/comparisons">
            <Plus className="size-4" />
            Go to Saved Comparisons
          </NextLink>
        </Card>
      </div>
    );
  }

  const planCards = plans.map((plan) => {
    const selectedHousing =
      plan.selectedScenario === "A"
        ? plan.comparison.firstScenario
        : plan.comparison.secondScenario;

    const snapshot = plan.comparison.resultSnapshot as any;

    const selectedResult =
      plan.selectedScenario === "A"
        ? snapshot?.first_result
        : snapshot?.second_result;

    const alternativeResult =
      plan.selectedScenario === "A"
        ? snapshot?.second_result
        : snapshot?.first_result;

    const monthlyCost = selectedResult?.monthly_recurring_cost ?? null;
    const upfrontCost = selectedResult?.upfront_costs ?? null;
    const fullTermCost = selectedResult?.term_cost ?? null;
    const termCostComplete = selectedResult?.term_cost_complete ?? false;
    const recurringCostsComplete =
      Boolean(selectedResult?.recurring_costs_complete) &&
      Boolean(alternativeResult?.recurring_costs_complete);

    let impactSummary = "Impact summary unavailable.";

    if (selectedResult && alternativeResult) {
      const diff =
        selectedResult.monthly_recurring_cost -
        alternativeResult.monthly_recurring_cost;

      if (diff === 0) {
        impactSummary = recurringCostsComplete
        ? "Same monthly cost as the alternative option."
          : "Based on available recurring cost data, both options appear to have a similar monthly cost.";
      } else if (diff < 0) {
        impactSummary = recurringCostsComplete
          ? `Saves $${Math.abs(diff).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}/mo compared to the alternative.`
          : `Based on available recurring cost data, this option appears to cost about $${Math.abs(diff).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}/mo less than the alternative.`;
      } else {
        impactSummary = recurringCostsComplete
          ? `Costs $${diff.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}/mo more than the alternative.`
          : `Based on available recurring cost data, this option appears to cost about $${diff.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}/mo more than the alternative.`;
      }
    }

    return {
      id: plan.id,
      comparisonId: plan.comparisonId,
      housingName: selectedHousing.name,
      savedDate: plan.createdAt.toISOString(),
      monthlyCost,
      upfrontCost,
      fullTermCost,
      termCostComplete,
      impactSummary,
    };
  });

  return (
    <div className="pb-12">
      <Breadcrumbs className="mb-4">
        <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
        <Breadcrumbs.Item>Saved Plans</Breadcrumbs.Item>
      </Breadcrumbs>
      <h1 className="mb-2 text-4xl font-bold">Saved Financial Plans</h1>

      <p className="text-default-500">
        View and manage your saved financial plans.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {planCards.map((card) => (
          <FinancialPlanCard key={card.id} plan={card} />
        ))}
      </div>
    </div>
  );
}
