import NextLink from "next/link";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

import { Card, Button, AlertDialog } from "@heroui/react";
import { ArrowRight, Trash } from "lucide-react";

import { deleteComparisonAction } from "@/app/actions";
import StatCard from "@/components/StatCard";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const comparisons = session?.user?.id 
    ? await prisma.comparison.findMany({
        where: { userId: session.user.id },
        include: {
          firstScenario: true,
          secondScenario: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold">
            Dashboard
          </h1>
          <p className="text-default-500">
            Welcome back, {session?.user?.name || "Guest"}.
          </p>
        </div>
        <NextLink href="/compare" className="text-primary font-medium flex items-center gap-1 hover:opacity-80 transition-opacity">
          New Comparison <ArrowRight className="size-4" />
        </NextLink>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Financial Plans"
          value="0"
        />

        <StatCard
          title="Comparisons"
          value={comparisons.length.toString()}
        />

        <StatCard
          title="Goals"
          value="0"
        />
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Recent Comparisons</h2>
        {comparisons.length === 0 ? (
          <p className="text-default-500">No comparisons saved yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {comparisons.map((comp) => (
              <Card key={comp.id} className="relative group transition-colors hover:border-primary/50">
                <div className="absolute end-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <Button isIconOnly variant="danger" size="sm" aria-label="Delete comparison">
                      <Trash className="size-4" />
                    </Button>
                    <AlertDialog.Backdrop>
                      <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                          <AlertDialog.CloseTrigger />
                          <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>Delete comparison permanently?</AlertDialog.Heading>
                          </AlertDialog.Header>
                          <AlertDialog.Body>
                            <p>
                              This will permanently delete the comparison between <strong>{comp.firstScenario.name}</strong> and <strong>{comp.secondScenario.name}</strong>. This action cannot be undone.
                            </p>
                          </AlertDialog.Body>
                          <AlertDialog.Footer>
                            <Button slot="close" variant="tertiary">
                              Cancel
                            </Button>
                            <form action={async () => {
                              "use server";
                              await deleteComparisonAction(comp.id);
                            }}>
                              <Button type="submit" slot="close" variant="danger">
                                Delete
                              </Button>
                            </form>
                          </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                      </AlertDialog.Container>
                    </AlertDialog.Backdrop>
                  </AlertDialog>
                </div>

                <Card.Header className="gap-1 pb-0 pt-4 px-4 pr-12">
                  <Card.Title className="text-base truncate">
                    {comp.firstScenario.name} <span className="text-muted font-normal text-xs mx-1">vs</span> {comp.secondScenario.name}
                  </Card.Title>
                  <Card.Description className="text-xs">
                    Saved on {new Date(comp.createdAt).toLocaleDateString()}
                  </Card.Description>
                </Card.Header>
                <Card.Content className="pt-2 px-4 pb-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground mr-1">Winner:</span>
                      <span className={comp.lowerMonthlyCostScenario ? "font-semibold text-success" : "font-semibold text-muted"}>
                        {comp.lowerMonthlyCostScenario === comp.firstScenario.name || comp.lowerMonthlyCostScenario === comp.secondScenario.name 
                          ? comp.lowerMonthlyCostScenario 
                          : "Tie"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground mr-1">Difference:</span>
                      <span className="font-semibold">${comp.monthlyDifference?.toLocaleString()} /mo</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
