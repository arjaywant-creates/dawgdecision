/** React & Next.js */
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import NextLink from "next/link";

/** UI Components (HeroUI) */
import { Button, Card } from "@heroui/react";
import { Plus } from "lucide-react";

/** Auth & Database */
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/** Local Components & Actions */
import { ComparisonCard } from "@/components/ComparisonCard";
import { deleteComparisonAction } from "@/app/compare/actions";

/**
 * Page displaying all saved comparisons for an authenticated user
 */
export default async function SavedComparisonsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Restrict access to authenticated users only
  if (!session?.user) {
    redirect("/login");
  }

  const comparisons = await prisma.comparison.findMany({
    where: { userId: session.user.id },
    include: {
      firstScenario: true,
      secondScenario: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pb-12">
      {/* Header Section */}
      <h1 className="mb-8 text-4xl font-bold">Saved Comparisons</h1>

      {comparisons.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
            <h3 className="text-xl font-semibold">No Comparisons Yet</h3>
            <p className="text-default-500 max-w-md">
              Start comparing housing options to save them here for later
              reference.
            </p>
            <NextLink href="/compare">
              <Button variant="primary">
                <Plus className="size-4" />
                Create Your First Comparison
              </Button>
            </NextLink>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
  );
}
