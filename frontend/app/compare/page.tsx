import { headers } from "next/headers";

import CompareForm from "./CompareForm";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const id = (await searchParams).id as string | undefined;

  let initialComparison = null;

  if (id) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      const comparison = await prisma.comparison.findUnique({
        where: { id: id as string, userId: session.user.id },
        include: { firstScenario: true, secondScenario: true },
      });

      if (comparison) {
        initialComparison = comparison;
      }
    }
  }

  return (
    <CompareForm
      comparisonId={id || null}
      initialComparison={initialComparison}
    />
  );
}
