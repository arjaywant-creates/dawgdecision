/** React & Next.js */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NextLink from "next/link";

/** UI Components (HeroUI & Lucide Icons) */
import { Card, Button } from "@heroui/react";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Local Components & Types */
import FinancialPlanCard from "./FinancialPlanCard";
import { removeFinancialPlanHousingAction } from "./actions";

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
            You haven't saved any Financial Plans yet.
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

  return {
  id: plan.id,
  comparisonId: plan.comparisonId,

  housingName: selectedHousing.name,

  savedDate: plan.createdAt.toISOString(),

  monthlyCost: selectedHousing.housingCost,

  upfrontCost: selectedHousing.upfrontCosts,

  fullTermCost:
    selectedHousing.costPeriodMonths > 0
      ? (selectedHousing.housingCost /
          selectedHousing.costPeriodMonths) *
        selectedHousing.contractMonths
      : null,

  impactSummary: (() => {
    const alternative =
      plan.selectedScenario === "A"
        ? plan.comparison.secondScenario
        : plan.comparison.firstScenario;

    const monthlyDifference =
      selectedHousing.housingCost - alternative.housingCost;

    if (monthlyDifference === 0) {
      return "Same housing cost as the alternative.";
    }

    if (monthlyDifference < 0) {
      return `Saves $${Math.abs(monthlyDifference).toLocaleString()} compared to the alternative housing option.`;
    }

    return `Costs $${monthlyDifference.toLocaleString()} more than the alternative housing option.`;
  })(),

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
    onDelete={removeFinancialPlanHousingAction}
  />
))}
      </div>
    </div>
  );
}
