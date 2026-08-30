import NextLink from "next/link";
import { headers } from "next/headers";
import { Button } from "@heroui/react";

import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold">DawgDecision</h1>

      <p className="mt-4 max-w-xl text-default-500">
        Compare housing options, understand financial tradeoffs, and build
        financial plans with confidence.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {session ? (
          <NextLink href="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </NextLink>
        ) : (
          <>
            <NextLink href="/login">
              <Button variant="primary">Sign In</Button>
            </NextLink>
            <NextLink href="/signup">
              <Button variant="secondary">Sign Up</Button>
            </NextLink>
          </>
        )}
      </div>
    </div>
  );
}
