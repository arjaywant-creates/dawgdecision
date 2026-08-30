/** React & Next.js */
import NextLink from "next/link";
import { headers } from "next/headers";

/** UI Components (HeroUI) */
import { Card, Button } from "@heroui/react";

/** Icons */
import { ArrowRight, Plus } from "lucide-react";

/** Local Components & Actions */
import { ComparisonCard } from "@/components/ComparisonCard";
import StatCard from "@/components/StatCard";

/** Auth & Database */
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { deleteComparisonAction } from "@/app/compare/actions";

/**
 * Main dashboard home page for authenticated users and guests
 */
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const comparisons = session?.user?.id
    ? await prisma.comparison.findMany({
        where: { userId: session.user.id },
        include: {
          firstScenario: true,
          secondScenario: true,
        },
        orderBy: { createdAt: "desc" },
        // Limit to 4 comparisons to fit nicely on the dashboard grid
        take: 4,
      })
    : [];

  const comparisonCount = session?.user?.id
    ? await prisma.comparison.count({
        where: { userId: session.user.id },
      })
    : 0;
  const financialPlanCount = session?.user?.id
    ? await prisma.plan.count({
        where: {
          userId: session.user.id,
        },
      })
    : 0;

  return (
    <div className="pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
          <p className="text-default-500">
            Welcome back, {session?.user?.name || "Guest"}.
          </p>
        </div>
        <NextLink href="/compare">
          <Button variant="tertiary">
            <Plus className="size-4" />
            New Comparison
          </Button>
        </NextLink>
      </div>

      {/* Stats Grid Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Financial Plans"
          value={financialPlanCount.toString()}
        />
        <StatCard title="Comparisons" value={comparisonCount.toString()} />
        <StatCard title="Goals" value="0" />
      </div>

      {/* Recent Comparisons Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Comparisons</h2>
          <NextLink href="/comparisons">
            <Button variant="tertiary">
              View All
              <ArrowRight className="size-4" />
            </Button>
          </NextLink>
        </div>

        {comparisons.length === 0 ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
              <h3 className="text-xl font-semibold">No Comparisons Yet</h3>
              <p className="text-default-500 max-w-md">
                Start comparing housing options to see them here.
              </p>
              <NextLink href="/compare">
                <Button variant="primary">
                  <Plus className="size-4" />
                  Create Comparison
                </Button>
              </NextLink>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {comparisons.map((comp) => (
              <ComparisonCard
                key={comp.id}
                comp={comp}
                onDelete={deleteComparisonAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
