/** React & Next.js */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NextLink from "next/link";

/** UI Components (HeroUI & Lucide Icons) */
import { Card, Button } from "@heroui/react";
import { Plus } from "lucide-react";

import FinancialPlanCard from "./FinancialPlanCard";

import { deleteFinancialPlanAction } from "./actions";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Local Components & Types */

/**
 * Page displaying the user's Financial Plan and calculating the decision impact.
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

  // Empty state
  if (plans.length === 0) {
    return (
      <div className="pb-12">
        <h1 className="mb-2 text-4xl font-bold">Saved Financial Plans</h1>
        <p className="text-default-500">
          View and manage your saved financial plans.
        </p>
        <Card className="mt-8 p-6 text-center py-12 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-xl font-semibold">No Saved Financial Plans</h3>
          <p className="text-default-500 max-w-md">
            You haven&apos;t saved any Financial Plans yet.
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

    let impactSummary = "Impact summary unavailable.";

    if (selectedResult && alternativeResult) {
      const diff =
        selectedResult.monthly_recurring_cost -
        alternativeResult.monthly_recurring_cost;

      if (diff === 0) {
        impactSummary = "Same true monthly cost as the alternative.";
      } else if (diff < 0) {
        impactSummary = `Saves $${Math.abs(diff).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo in true costs compared to the alternative.`;
      } else {
        impactSummary = `Costs $${diff.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo more in true costs than the alternative.`;
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
      impactSummary,
    };
  });

  return (
    <div className="pb-12">
      <h1 className="mb-2 text-4xl font-bold">Saved Financial Plans</h1>
      <p className="text-default-500">
        View and manage your saved financial plans.
      </p>
      <div className="mt-8 grid gap-4">
        {planCards.map((card) => (
          <FinancialPlanCard
            key={card.id}
            plan={card}
            onDelete={deleteFinancialPlanAction}
          />
        ))}
      </div>
    </div>
  );
}
